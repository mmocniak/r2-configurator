# R2 Configurator

A free, community-maintained tool to configure a **Rivian R2** and estimate the
**true all-in cost of ownership** — price, taxes, fees, charging, insurance,
financing, and depreciation — for **your US state**.

Pick your state and the tool loads locally-relevant defaults for tax, fees, and
insurance so the estimate reflects where you actually live. Tweak the build,
watch the numbers update, and save your configuration as a shareable link.

## Disclaimers

Please read these before trusting any number on the page:

- **All figures are ESTIMATES.** This is not tax, legal, or financial advice.
  Verify anything important with your dealer, insurer, accountant, and your
  state's DMV / revenue department.
- **R2 pricing and specs are pre-release and unofficial.** Numbers are research
  estimates and will change as Rivian publishes official details.
- **Not affiliated with, sponsored by, or endorsed by Rivian.** This is an
  independent community project.
- **Vehicle images are loaded live from Rivian's public CDN.** They are not
  copied or redistributed by this project; they are referenced at display time.

## Running it

This is a fully static site — no build step, no server, no install.

- **Just open it:** double-click `index.html` (it works straight from
  `file://`).
- **Or host it:** deploy the folder to any static host (e.g. Vercel, Netlify,
  GitHub Pages). A minimal `vercel.json` is included that serves `index.html` at
  the root.

## Architecture

One self-contained page, split into a few plain files for readability:

| File | What's in it |
| --- | --- |
| `index.html` | Page structure |
| `styles.css` | All styling |
| `app.js` | All behavior / calculations |
| `data/states.js` | Per-state tax, fee, and insurance defaults |
| `data/changelog.js` | Version history shown in the app |
| `data/vehicle.js` | R2 options, pricing, and spec estimates |

Everything is loaded as **classic `<script>` tags** — **no ES modules, no
bundler, no build step**. That's deliberate: it keeps the whole thing working
when opened directly from `file://`. Please keep it that way.

## Contributing

Contributions are very welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for
details.

The single most valuable thing you can do is **correct your own state's row** in
`data/states.js`. Local tax, fee, and insurance numbers are exactly the sort of
thing a resident knows better than a spreadsheet — if your state's defaults look
wrong, fixing them helps everyone in your state.

## A note

This started as a personal project for comparing EVs — mostly figuring out what
an R2 would *really* cost me — and it grew into something worth sharing with the
Rivian community. If it helps you reason about your own build, wonderful. If you
spot something wrong, even better: send a PR.
