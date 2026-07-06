# Contributing

Thanks for helping make this more accurate and more useful! This is a small,
friendly project — PRs of all sizes are welcome.

## The architecture (read this first)

The site is **fully static**: plain HTML, CSS, and JS loaded as classic
`<script>` tags. There is:

- **No `npm install`** — there are no dependencies.
- **No build step, no bundler, no ES modules** — deliberately, so the page keeps
  working when opened directly from `file://`.

To test a change, just **open `index.html` in your browser** and confirm the app
still works. That's the whole workflow. Please don't introduce a build step or
convert the scripts to ES modules — it would break `file://` usage.

If you edited a **data file** (`data/states.js`, `data/changelog.js`,
`data/vehicle.js`), also **open `tests/selftest.html`** — it's a zero-dependency
page that checks the data for the most common mistakes (a malformed state row, a
bad changelog date, an interior with no cabin photo, etc.) and shows a green
"all checks passed" banner or a red list of what's wrong. No install needed.

## Correcting or adding a state (`data/states.js`)

This is the **highest-value contribution**. Each state is a row of estimated
defaults. The schema:

| Field | Meaning |
| --- | --- |
| `tax` | Upfront **purchase/sales tax** rate, as a percentage of price |
| `title` | One-time **title** fee (flat $) |
| `reg` | **Registration** fee (flat $) |
| `evFee` | **Annual EV surcharge** — the extra yearly fee many states charge EVs |
| `propTax` | **Annual vehicle property-tax** rate, per $100 of value (use `0` if your state has none) |
| `ins` | Average **annual insurance** premium ($) |
| `kwh` | Average **residential electricity** rate (¢/kWh, EIA Table 5.6.A) |
| `gas` | Average **regular gasoline** price ($/gal, AAA state average) |
| `verified` | `'YYYY-MM'` the row was last checked against sources |

Guidelines:

- **Cite a source in your PR.** Link the relevant state DMV, department of motor
  vehicles, or department of revenue page you used. Data changes without a
  source are hard to accept.
- **Bump `verified`** to the current `'YYYY-MM'` whenever you change any value
  in a row.
- If your state has **no** vehicle property tax, set `propTax` to `0` (not
  blank).
- Keep values as plain numbers — no `$`, `%`, or commas.

## Auditing state data (`validation/`)

The `validation/` directory holds a repeatable audit playbook: open
`validation/export.html` to generate a copy-paste prompt per state, run it
through any LLM with web search, and it returns a structured JSON verdict per
field. `validation/README.md` describes the review-and-merge loop. This is how
the `verified` stamps stay honest — audits run semiannually (January and July).

## Adding a changelog entry (`data/changelog.js`)

The app shows a version history. Each entry looks like:

```js
{ date: '2026-07-04', changes: ['Short description of what changed'] }
```

Each item in `changes` is either a plain string, or an object that tags the
bullet as an **R2 configuration-option change** with `config: true`, which shows
an inline **"Config"** pill:

```js
{ date: '2026-07-04', changes: [
    { text: 'Dual-motor AWD is now configurable', config: true },
    'Fixed a rounding error in the fee breakdown'
] }
```

**List config bullets first** within an entry, then the untagged ones.

**Leave a bullet as a plain string** for routine changes (bug fixes, state-data
corrections, copy tweaks, styling, etc.).

### When is `config: true` correct?

Use it when a bullet touches the R2's set of orderable options or their prices —
for example:

- A new option becomes configurable, or an "upcoming" option ships, or
- An option's price or availability is corrected in the builder.

It is **not** for general updates. If you're just fixing a typo or a chart, leave
it off.

## The "upcoming → available" convention

Some R2 options are shown as **upcoming** (with a date chip) before you can
actually order them. When Rivian makes one of these available, a single PR
should do **both**:

1. **Update the config data** in `data/vehicle.js` — mark the option available
   and **remove its "upcoming" date chip**.
2. **Add a changelog bullet** in `data/changelog.js` tagged **`config: true`**,
   describing what became available.

Doing both in one PR keeps the configurator and its changelog in sync.

## PR etiquette

- **Keep PRs focused** — one logical change per PR is easiest to review.
- **Describe the change** and, for any data update, **link your source**.
- Confirm you opened `index.html` locally and it still works.

That's it — thanks for contributing!
