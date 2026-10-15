# R2 config tracker

A repeatable audit of `data/vehicle-r2.js` against Rivian's live R2 catalog. Two
halves, split by what needs judgment:

| Half | What it does | Who runs it |
| --- | --- | --- |
| `snapshot.js` | Fetches Rivian's sources, normalizes them into a snapshot, diffs against our data and the previous snapshot, prints a report. Deterministic; never edits repo data. | Anyone: `node validation/r2-config/snapshot.js` |
| `.claude/skills/r2-config-audit` | The playbook a Claude agent (Sonnet is enough) follows around the script: news pass, apply the drift, verify, open a PR. | `claude --model sonnet "/r2-config-audit"` or a scheduled routine |

`snapshot.js` audits Rivian's other builders too: pass `--vehicle r1s` or
`--vehicle r1t` and it snapshots that vehicle instead. The default is `r2`, so
every existing invocation, including the scheduled routine, behaves exactly as it
did before. See [Other vehicles](#other-vehicles). The folder keeps its
`r2-config` name because the routine and the audit skill point at this path.

## Where the numbers come from

Everything is plain HTTPS, no login, no headless browser:

- **Builder** (`rivian.com/configurations/builder/r2`) embeds Rivian's own R2
  *ruleset* in the page: every option code (`BLD-*`, `EXP-*`, `WHL-*`, `INT-*`,
  `DTN-*`, accessories), its price, per-trim rules (which options each trim
  hides/disables, price overrides like Premium's +$2,000 21"), `availableInFuture`
  flags, and the destination fee. The script replays the rules per trim, so the
  snapshot's per-trim colors/wheels/interiors/drivetrains are what the builder
  actually offers. The ruleset carries a `version` + `effectiveDate` — when those
  move, Rivian changed something.
  The R1 builders embed the same turbo-stream payload and answer to the same
  rules engine; what differs is the loader keys, where the pricing and trim-card
  blobs hang, and the code vocabulary. All of that lives in one per-vehicle table
  (`VEH`) at the top of the script.
- **R2 page** (`rivian.com/r2`) carries the per-trim availability wording
  ("Available now" / "Coming late 2026" / "Coming 2027"). R2 only; see the R1
  caveats below.
- **Gear Shop** Shopify JSON: the R2 collection, plus each product we link to
  (price, `available`, featured image). The collection half is R2 only; the
  per-product read works for every vehicle.
- **Connect+** page, **newsroom** article list, and a `HEAD` on every CDN image
  URL `app.js` would build from our data (hero renders per trim × wheel × color,
  chips, swatches, cabins, gear photos).

## Reading the report

| Level | Meaning | Action |
| --- | --- | --- |
| **change** | Our data disagrees with Rivian, or an image 404s. Exit code 2. | Fix in `data/vehicle-<id>.js` (see the skill's rules table) |
| **warn** | Wording differs or a source couldn't be read | Eyeball; usually no data change |
| **delta** | Rivian moved since the previous committed snapshot (new option, price, ruleset version, new R2 article, new Gear Shop product) | Context for the news pass |
| **info** | Observations we deliberately don't encode | Nothing by default |

Things that look like drift but aren't, by house rule:

- **Stock states.** A Gear Shop product flipping `available:false` is not a
  finding. `avail` chips mean "Coming soon" only (announced, never yet
  purchasable). A "Coming soon" item that becomes purchasable *is* a finding.
- **Per-drivetrain color limits.** Standard's Half Moon Grey / Forest Green need
  the Long Range pack ("Available with Long Range"). Our data doesn't model
  colors-by-drivetrain, so this stays `info`.
- **Gear Shop products outside the builder.** The builder's Accessories group is
  the bar for the gear list (all of it should be listed); the rest of the R2
  collection is reported as `info` for a human to opt into.

## Other vehicles

`--vehicle r2` (the default), `r1s`, or `r1t`. The vehicle picks its own sources,
loader keys and id-to-code maps; the turbo-stream decoder, the rules engine, the
Gear Shop product reads, the diff and the report stay single-copy shared code.

| Vehicle | Data file | Results file |
| --- | --- | --- |
| `r2` | `data/vehicle-r2.js` | `results/YYYY-MM-DD.json` |
| `r1s` | `data/vehicle-r1s.js` | `results/YYYY-MM-DD-r1s.json` |
| `r1t` | `data/vehicle-r1t.js` | `results/YYYY-MM-DD-r1t.json` |

Each vehicle only ever diffs against its own previous snapshot. The destination
charge comes from `fees.destination` in the vehicle file when it carries one and
falls back to `app.js`'s global `FEES`, then gets compared against the builder's
own `destinationFee` (1,495 on the R2, 1,895 on both R1s).

Two states short of a shipped dataset, both handled:

- **No data file yet.** The run is snapshot-only. Rivian's trims, options,
  prices, per-trim resolved offerings and destination fee are all reported, the
  findings section says in so many words that there is nothing to diff, and the
  run exits 0. That snapshot is the reference a new `data/vehicle-<id>.js` gets
  written against.
- **A `draft: true` data file.** Diffed normally, findings and all, but the run
  still exits 0, because a draft's numbers are unverified by definition and
  should not fail anyone's build. Drop `draft` and the exit code starts biting.

### R1 caveats

Three things differ on the R1 builders, and the report says less as a result:

- **No availability wording.** `rivian.com/r2` carries a per-trim
  `availabilityText`; `/r1s` and `/r1t` are older pages with no such blob. For
  the R1s the ruleset's own `availableInFuture` and `tempUnavailable` flags are
  the only availability signal, so the wording warn tier never fires. A
  `tempUnavailable` option (Limestone paint, as of August 2026) shows as ⚠ in the
  trims table and lands in `info`, not in drift: it is a stock state, and the
  house rule is that stock states are never labelled.
- **No Gear Shop collection.** Rivian publishes `collections/r2` but nothing for
  `r1s` or `r1t`, so the "collection products we don't list" info tier is skipped
  for them. Gear we link to is still price-checked through the per-product
  endpoint, which matches the builder exactly.
- **Different hero images.** R2 renders come from a named visualizer program
  (`img.program`) on a 360 path. The R1s use a layer compositor instead,
  `.../compositor/{r1s|r1t}/side/{codes}`, where codes is the sorted, lowercased,
  comma-joined list of the option codes in that render. So an R1 data file
  supplies `img:{compositor, view, ver, extra}` plus optional per-trim `codes`
  rather than `img.program`. Read that check with one eye open: the compositor
  answers 200 with default layers for a code it does not recognise, so a `HEAD`
  catches a missing image but never a wrong code.

## The loop

1. `node validation/r2-config/snapshot.js --report /tmp/r2.md` (add `--no-images`
   to skip the ~70 CDN checks, `--vehicle r1s` to audit another vehicle). Writes
   `results/YYYY-MM-DD.json`.
2. Read the findings. For anything Rivian says is "future", find the date in the
   news (builder has the flag, not the month).
3. Apply changes to `data/vehicle-r2.js`, bump `verified`, add a
   `config: true` changelog entry.
4. Re-run: exit 0 and `tests/selftest.html` green.
5. One PR: data + changelog + the snapshot JSON, report pasted in the body.

No drift → nothing to commit; the run's report is the record.

## Verifiability

- The snapshot file is committed alongside the data change, so a reviewer can
  see exactly what Rivian's ruleset said (version, date, codes, prices) when the
  edit was made, and the next run diffs against it.
- Every finding names the option code and both values. Codes are Rivian's, not
  ours, so they can be checked in the live builder.
- The script only reads `data/` and `app.js`; it writes nothing outside
  `results/` (and `--report`/`--json` paths you pass).
- Our id ↔ Rivian code mapping is explicit at the top of the script, per vehicle
  (`TRIM_CODE`, `DRIVE_CODE`, `ADDON_CODE`, `ACCESSORY_CODE`, `GROUP_OF` in the
  `VEH` table). A code Rivian adds that isn't mapped is itself a finding, which
  is also how the R1 maps are meant to be read: they cover the codes with a clear
  analog, and anything else surfaces the first time Rivian offers it.

## When it breaks

Exit 1 with `ERROR:` names the parser that failed. The likely cause is a page
format change on Rivian's side (the builder moving off React Router's
turbo-stream payload, the R2 page's `"builds"` blob renaming). Save the HTML
(`curl -sL <url> > page.html`), grep for a known string (`rulesetId`,
`availabilityText`) and adjust the matching parse function. Everything else
degrades softly: a source that can't be read produces a `warn`, not a crash.

## Cadence

Every two weeks is plenty; monthly is fine. Run it off-cycle whenever the news
says Rivian opened an option or trim. The state-data audit in `../` stays on its
own semiannual schedule.
