# R2 config tracker

A repeatable audit of `data/vehicle-r2.js` against Rivian's live R2 catalog. Two
halves, split by what needs judgment:

| Half | What it does | Who runs it |
| --- | --- | --- |
| `snapshot.js` | Fetches Rivian's sources, normalizes them into a snapshot, diffs against our data and the previous snapshot, prints a report. Deterministic; never edits repo data. | Anyone: `node validation/r2-config/snapshot.js` |
| `.claude/skills/r2-config-audit` | The playbook a Claude agent (Sonnet is enough) follows around the script: news pass, apply the drift, verify, open a PR. | `claude --model sonnet "/r2-config-audit"` or a scheduled routine |

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
- **R2 page** (`rivian.com/r2`) carries the per-trim availability wording
  ("Available now" / "Coming late 2026" / "Coming 2027").
- **Gear Shop** Shopify JSON: the R2 collection, plus each product we link to
  (price, `available`, featured image).
- **Connect+** page, **newsroom** article list, and a `HEAD` on every CDN image
  URL `app.js` would build from our data (hero renders per trim × wheel × color,
  chips, swatches, cabins, gear photos).

## Reading the report

| Level | Meaning | Action |
| --- | --- | --- |
| **change** | Our data disagrees with Rivian, or an image 404s. Exit code 2. | Fix in `data/vehicle-r2.js` (see the skill's rules table) |
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

## The loop

1. `node validation/r2-config/snapshot.js --report /tmp/r2.md` (add `--no-images`
   to skip the ~70 CDN checks). Writes `results/YYYY-MM-DD.json`.
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
- Our id ↔ Rivian code mapping is explicit at the top of the script
  (`TRIM_CODE`, `DRIVE_CODE`, `ADDON_CODE`, `ACCESSORY_CODE`). A code Rivian
  adds that isn't mapped is itself a finding.

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
