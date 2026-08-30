---
name: r2-config-audit
description: Snapshot Rivian's live catalog for every tracked vehicle (R2, R1S, R1T), diff against data/vehicle-*.js, fold in the news, and open one PR with the fixes.
disable-model-invocation: true
---

# Rivian config audit (R2 + R1S + R1T)

Run `validation/r2-config/snapshot.js` once per vehicle, resolve what it finds,
ship one PR. The script is the source of truth for prices and what's orderable;
you supply the news pass, the judgment calls listed below, and the PR. Background on sources and
finding levels: `validation/r2-config/README.md`.

## 1. Branch

`git fetch origin && git checkout -b mmocniak/config-audit-$(date +%F) origin/main`.
Done when `git branch --show-current` prints that branch.

## 2. Snapshot

One run per vehicle:

```
node validation/r2-config/snapshot.js --report /tmp/r2-config.md
node validation/r2-config/snapshot.js --vehicle r1s --report /tmp/r1s-config.md
node validation/r2-config/snapshot.js --vehicle r1t --report /tmp/r1t-config.md
```

Exit 0 = no drift, 2 = drift, 1 = a parser broke (see README "When it breaks";
fix the parser in the same PR if it is a small format change, otherwise stop and
report). A `draft:true` vehicle exits 0 even with findings — read its report's
change rows anyway; drafts get fixed too, they just never fail the run.

Done when all three reports exist and you have listed every **change** row.

## 3. News pass

Search, for the window since the previous snapshot's `taken` date (or 60 days if
none): `rivian.com/newsroom`, `stories.rivian.com`, `riviantrackr.com`,
`electrek.co`, `insideevs.com`, `rivianforums.com`. Queries: "Rivian R2" and
"Rivian R1S R1T" plus each of: price, configurator, Premium, Standard, paint,
interior, wheels, Gear Shop. R1 caveat: no marketing-page availability wording
exists (the ruleset's own flags are the signal), and Rivian rotates R1 APR/lease
promos monthly — promo changes are **noise** for this audit unless a
`costDefaults` number in the data file is now clearly stale.

Classify every relevant item as one of:

- **reflected** — the builder snapshot already shows it (price, orderable now)
- **announced, not in builder** — Rivian named a month for an option/trim the
  ruleset still flags `availableInFuture`; this is where `avail` chip dates come
  from
- **noise** — software updates, deliveries, financials, rumors

Done when every `availableInFuture` option and trim in the report has a cited
month or an explicit "no date published".

## 4. Apply

Edit the affected `data/vehicle-<id>.js` only for **change** rows and for
announced dates:

| Finding | Edit |
| --- | --- |
| "orderable now; drop its avail chip" | Remove the `avail` key on that color/interior/drive |
| "future-availability; add an avail chip" | Add `avail:'<Month YYYY>'` from the news pass; with no published date use the trim's wording from the report ("Late 2026", "2027") |
| price differs | Set ours to Rivian's; wheel/interior prices are per trim |
| offered by Rivian, not in our trim | Add the id to that trim's `colors` / `wheels` / `interior` (and to `colors`, `wheelSwatch`, `cabins` if new) |
| in our trim, not offered by Rivian | Remove it from the trim |
| new trim / drivetrain / accessory code | Add the data, then extend the matching `*_CODE` map at the top of `snapshot.js` |
| builder accessory missing from our gear list | Add an item under the right `accessories` group: Gear Shop `link`, `img` in the `gearshop.rivian.com/cdn/shop/files/<file>?v=<n>&width=240` form (from the product's `featured_image`), `price`, one-line `note`, an existing `icon` key |
| gear "purchasable now; drop chip" | Remove `avail` |
| image HTTP 404 | Replace with the current URL (gear: product `featured_image`; Rivian CDN: discover from the live builder), or remove the entry if the option is gone |
| destination fee | `fees.destination` in that vehicle's `data/vehicle-<id>.js` (`FEES` in `app.js` is only the fallback) |

Leave alone: stock states (never add "Sold out"), per-drivetrain color limits,
R2-collection products outside the builder (list them in the PR body instead),
`info` and `warn` rows.

Then: bump each edited file's `verified` to the current `'YYYY-MM'`, update its
header comment's verified date and the month in `accFootnote`, and add a
`data/changelog.js` entry dated today with one `config: true` bullet per
user-visible option change (plain-string bullet for a fixed photo or link).
Skip bullets for anything a user can't see — including every change to a
`draft:true` vehicle, which isn't user-visible yet by definition.

Done when every **change** row maps to an edit or a stated reason to skip.

## 5. Verify

Re-run the snapshot for every vehicle you touched: exit 0, and each new
**change** table is empty (a draft's excepted rows, if any are documented in
the data file, stay). Open
`tests/selftest.html` in a browser if one is available; if not, say so in the PR.

## 6. PR

Commit the data, changelog, `snapshot.js` map edits, and the new
`results/YYYY-MM-DD*.json` files (R2 unsuffixed, `-r1s`/`-r1t` suffixed)
together. Push and `gh pr create` using the repo's
template: tick "Vehicle config update", paste the report's Trims and Findings
tables plus the news items you relied on (with URLs) under Source / citation,
and list unlisted R2-collection products as a question, not a change. Short and
plain; no em dashes.

No **change** rows and no announced dates to add → no commit, no PR; report the
run's summary line (ruleset version, effective date, "no drift").
