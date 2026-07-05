# State-data validation

A repeatable audit loop for `data/states.js`. It is designed so the
labor-intensive part — checking 51 states × 8 fields against primary sources —
can be handed to **any LLM with web search** (including small/cheap ones),
while a human (or stronger model) only reviews the exceptions.

## The loop

1. **Generate prompts** — open [`export.html`](export.html) in a browser (works
   from `file://`, no install). It reads the live `data/states.js` and renders
   one complete copy-paste prompt per state: the audit playbook, that state's
   current values, and the exact JSON skeleton to fill in.
2. **Run audits** — paste each prompt into an LLM with web access, one state
   per session/chat. The model returns a single JSON verdict object
   (see [`RESULT_SCHEMA.md`](RESULT_SCHEMA.md)). It never edits repo files.
3. **Collect results** — save each response as
   `validation/results/YYYY-MM/XX.json` (e.g. `results/2026-07/NC.json`) on an
   audit-round branch.
4. **Review only the exceptions** — a human or strong model opens the cited
   `source_url` for every field with verdict `mismatch` or `unverifiable` and
   decides. Verdicts of `match` need no review.
5. **Merge** — for each accepted correction: edit the row in `data/states.js`,
   update its trailing comment, **bump `verified` to the audit month**, add one
   grouped changelog entry ("State-data audit: corrected VA, KS, …"), and open
   `tests/selftest.html` — it must stay green (it enforces types, ranges,
   sanity bounds, and the `verified` stamp format).

## Cadence

Semiannual: **January** (after new-year fee/tax changes take effect) and
**July**. `gas` is volatile — treat it as a snapshot, not a precision value.

## Known trap (acceptance test)

Several states levy a **special motor-vehicle rate** that differs from their
combined sales-tax rate (VA's SUT, NC's HUT, GA's TAVT, TX's flat 6.25%, …).
The playbook checks for these **first**. A good smoke test for a new auditor
model: run Virginia — a correct audit *confirms* the special SUT rate rather
than flagging the combined sales-tax rate as a mismatch.

## Keeping the playbook in sync

The canonical field-by-field methodology lives in
[`INSTRUCTIONS.md`](INSTRUCTIONS.md). `export.html` embeds the same text in its
prompt template — **if you edit one, mirror the other** (both files carry a
reminder at the top).
