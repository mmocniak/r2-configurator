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

Guidelines:

- **Cite a source in your PR.** Link the relevant state DMV, department of motor
  vehicles, or department of revenue page you used. Data changes without a
  source are hard to accept.
- If your state has **no** vehicle property tax, set `propTax` to `0` (not
  blank).
- Keep values as plain numbers — no `$`, `%`, or commas.

## Adding a changelog entry (`data/changelog.js`)

The app shows a version history. Each entry looks like:

```js
{ date: '2026-07-04', changes: ['Short description of what changed'] }
```

For a change to the **R2's available configuration options**, add the
`r2Config: true` flag, which shows a badge:

```js
{ date: '2026-07-04', changes: ['Dual-motor AWD is now configurable'], r2Config: true }
```

**Omit `r2Config`** for routine changes (bug fixes, state-data corrections, copy
tweaks, styling, etc.).

### When is `r2Config: true` correct?

**Only** when the R2's set of orderable options actually changes — for example:

- A new option becomes configurable, or
- An option that was marked "upcoming" is now available to order.

It is **not** for general updates. If you're just fixing a typo or a tax number,
leave it off.

## The "upcoming → available" convention

Some R2 options are shown as **upcoming** (with a date chip) before you can
actually order them. When Rivian makes one of these available, a single PR
should do **both**:

1. **Update the config data** in `data/vehicle.js` — mark the option available
   and **remove its "upcoming" date chip**.
2. **Add a changelog entry** in `data/changelog.js` with **`r2Config: true`**,
   describing what became available.

Doing both in one PR keeps the configurator and its changelog in sync.

## PR etiquette

- **Keep PRs focused** — one logical change per PR is easiest to review.
- **Describe the change** and, for any data update, **link your source**.
- Confirm you opened `index.html` locally and it still works.

That's it — thanks for contributing!
