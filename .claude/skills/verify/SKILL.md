---
name: verify
description: Drive the configurator UI headlessly to verify changes end-to-end (no build step; static HTML/JS)
---

# Verifying the Rivian configurator

No build step. The app is `index.html` + `app.js` + `data/vehicle-*.js`, opened directly.

## Launch

- Open `index.html` via `file://`; all loaded vehicles (R2/R1S/R1T) appear in the `#vehicleToggle` tabs.
- No browser is installed on this machine; install Playwright in the session scratchpad (not the repo):
  ```bash
  cd <scratchpad> && npm init -y && npm i playwright && npx playwright install chromium
  ```
  Then drive `file:///…/rivian-configurator/index.html` with a Node script.

## Driving

- Vehicle tabs: `#vehicleToggle .vehbtn` with `data-veh="r2|r1s|r1t"`.
- Hero render: `#heroImg` — assert `src`, `complete && naturalWidth > 0`. On error the app hides the img and shows `#heroPh`.
- Options (trim/paint/wheel/interior) are clickable cards; `page.getByText('Storm Blue').first().click()` works. The page scrolls on click, so screenshot the hero by scrolling to top first (or fetch `#heroImg.src` with curl and view the PNG).
- Hero URL schemes: R2 → `…/v4/gold-iris/visualizer/360/{trim}/{wheel}/{color}/00001.png`; R1S/R1T → `…/compositor/{r1s|r1t}/side/{sorted codes}` which must include `gen-2` or Gen-2-era paints/wheels silently render the default silver vehicle. Compositor is code-order-insensitive.

## Gotchas

- Expected console/network noise on R1S/R1T: 404s for `visualizer/color-chips/*` and `interior-finishes-chips/*` — those parametric chip paths only exist for R2 (gold-iris); the UI falls back to hex swatches by design. Don't count them as failures.
- Verifying a render is correct means looking at the image (Read tool on a downloaded PNG), not just HTTP 200 — the compositor returns 200 with default layers for unknown codes.
- `tests/selftest.html` exists but is CI-style data validation, not verification.
