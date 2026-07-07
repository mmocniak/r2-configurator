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
`data/vehicle-*.js`), also **open `tests/selftest.html`** — it's a zero-dependency
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

## Adding or maintaining a vehicle dataset (`data/vehicle-*.js`)

Each vehicle lives in its **own self-contained file** — `data/vehicle-r2.js`,
`data/vehicle-r1s.js`, and so on. A file registers itself onto a shared map,
guarded so load order never matters:

```js
var VEHICLES = VEHICLES || {};
VEHICLES.r2 = { name: 'R2', /* … */ };
```

Add the new file as a **classic `<script>` tag in two places**: `index.html`
(before `app.js`) and `tests/selftest.html` (which loads the data files with
its own script tags — miss it and the self-test silently never sees your
vehicle). No build step, no ES modules — same rules as everything else here.

### The shape

`VEHICLES.<id>` is one object. The top-level keys:

| Key | What's in it |
| --- | --- |
| `name` | Short display name, e.g. `'R2'` — also the header/toggle label |
| `trims` | Map of trim id → trim object (`name`, `short`, `price`, `drive`, `range`, `avail`, `folder`, `colors`, `wheels`, `interior`, `includes`, optional `drives`, …). `folder` is the trim's visualizer path segment |
| `colors` | Map of color id → `{name, price, code, hex, note?, avail?}`; `code` is Rivian's `EXP-*` retail code used in image URLs |
| `wheelSwatch` | Map of wheel **`code`** → Cloudinary swatch path |
| `interiors` | Map of interior id → `{name, code, price, hex}` |
| `cabins` | Map of interior **`code`** → cabin-photo path |
| `addons` | Array of `{id, name, price, grp, launchInc?, cmp?, link}` — shown in the compare matrix when `launchInc`/`cmp` is set |
| `connectPlus` | Subscription object with `plans.yearly` / `plans.monthly` |
| `accessories` | Grouped gear catalog `[{grp, items:[…]}]`; `gearImg` is the image base URL, `accFootnote` the footnote |
| `img.program` | Rivian visualizer program segment used in image URLs (R2 = `'gold-iris'`; discover R1S's from its live 360 image URL) |
| `compareSpecs` | Feature rows `[{label, values:{<trimId>: true|false|'text'}}]` for the "Compare trims" matrix (booleans render a check/dash, strings render as text) |
| `baseLabel` / `baseIncludes` | Heading (e.g. `'Included on every R2'`) + bullet list of what every trim includes |
| `flagshipTrim` | Trim id to highlight as the halo column (optional; defaults to the last trim) |
| optional | `draft`, `owner`, `verified: 'YYYY-MM'` |

**id ↔ code cross-reference — the one gotcha.** Trims reference `colors` and
`interior` by **id**, but `wheelSwatch` and `cabins` are keyed by **`code`**
(the `EXP-*` / interior codes Rivian uses in image URLs). Keep both sides
consistent — a missing swatch or cabin photo is almost always an id-vs-code
mismatch.

### The `draft` flag and the data-gated toggle

The R2/R1S toggle in the header is **data-gated**: it only appears when **two or
more non-draft vehicles** are loaded. With a single live vehicle the app looks
exactly like it does today — no toggle at all. So the multi-vehicle plumbing
ships invisibly, and adding a live vehicle file is what turns the toggle on.

While a vehicle is a work in progress, commit it with **`draft: true`** in the
file header. A draft vehicle:

- stays **out of the toggle** (it doesn't count toward the ≥2), yet
- is still **exercised by `tests/selftest.html`**, so you can validate it before
  launch.

**To QA a draft in the real UI:** draft vehicles show **automatically in local
dev** — opening `index.html` from `file://`, or on `localhost` — each tagged with
a small **draft** badge so they can't be mistaken for shipped data. On a deployed
**preview** (e.g. a Vercel preview URL), add **`?preview=1`** to reveal them.
Production links have neither, so drafts never show there. (`?preview=0` forces the
production, R2-only view even locally, if you want to check it.) That's how "draft"
and "production" stay distinct — no build step, no hardcoded domain.

Drop the flag once the data is complete and green. The rule of thumb: **we never
show a toggle that leads nowhere.**

### Collecting the data (same sources as the R2)

- **Prices** — from the builder on rivian.com and, for gear, the Gear Shop's
  Shopify product JSON.
- **Specs** — from the builder (range, power, 0–60, tow, etc.).
- **Images** — discover the visualizer CDN **program/path** from the live
  configurator's 360 image URL, then **hotlink** it. Never copy or redistribute
  Rivian's images; reference them at display time, exactly as the R2 does.
- **Availability labels** — follow the house convention: label **"Coming soon"**
  only, never transient stock states.
- **Cite your sources** in the PR, and stamp each verified area with
  `verified: 'YYYY-MM'`, bumping it whenever a value changes.

One nice difference: a **shipping** vehicle like the R1S has **official, stable**
prices and specs, so its data is higher-confidence than the R2's pre-release
estimates.

### Testing

Same as any change here — but do both:

1. Open `index.html` from `file://` and confirm the app still works (with one
   live vehicle it should look unchanged).
2. Open `tests/selftest.html` — it **loops over every vehicle in `VEHICLES`**,
   drafts included. Any **non-draft** vehicle must come up green before it goes
   live.

### Keep the changelog in sync

When a vehicle **ships in the app**, or its options or prices change, add a
matching entry in `data/changelog.js` tagged **`config: true`** (see the
changelog section below).

### Ownership (please read before going live)

A **live** vehicle needs a committed **data owner** — list them in the file
header (`owner: '…'`) — because live data is held to the semiannual re-verify
cadence (January and July), alongside the state data. This is what keeps the
project low-maintenance: every live surface has someone on the hook for it.

No owner yet? Two good options:

- Leave the file **`draft: true`** until one steps up, or
- **Fork** a standalone configurator for your vehicle and periodically resync
  the shared bits — `data/states.js` and `validation/` — from upstream.

Either way, we avoid taking on a live vehicle that nobody has agreed to keep
accurate.

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

1. **Update the config data** in `data/vehicle-r2.js` — mark the option available
   and **remove its "upcoming" date chip**.
2. **Add a changelog bullet** in `data/changelog.js` tagged **`config: true`**,
   describing what became available.

Doing both in one PR keeps the configurator and its changelog in sync.

## PR etiquette

- **Keep PRs focused** — one logical change per PR is easiest to review.
- **Describe the change** and, for any data update, **link your source**.
- Confirm you opened `index.html` locally and it still works.

That's it — thanks for contributing!
