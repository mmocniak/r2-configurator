/* R2 configurator — changelog. Newest first. Loaded as a classic script.
   Entry shape: { date:'YYYY-MM-DD', changes:[ 'plain bullet' | { text:'...', config:true } ] }
   A change item is either a string or an object; set config:true to tag that bullet
   as an R2 configuration-option change (renders an inline "Config" pill). List config
   bullets first within an entry. See CONTRIBUTING.md. */
const CHANGELOG = [
  { date: '2026-07-09', changes: [
      'New draft vehicle datasets: R1S and R1T, with options and pricing verified against Rivian’s own builder data and Gear Shop (July 2026) — the current lineup where Dual starts at the Large pack ($79,990 R1T / $83,990 R1S), with Max pack (+$7,000), Performance Dual (+$5,000), Tri and Quad trims, 2026 paint palette (LA Silver included), wheel packages, interiors, Sound + Vision, and Autonomy+.',
      'R1S and R1T hero images now render live from Rivian’s own layer compositor (the R1 equivalent of the R2’s 360 visualizer), with real wheel swatches and interior cabin photos hotlinked from Rivian’s builder media. Known sprite gaps: Half Moon Grey and Storm Blue paints, the 22" Range wheel, and Tri/Quad badging render as the default silver/wheel.',
      'Drafts appear automatically when running locally (or with ?preview=1 on a deployed preview) and stay hidden in production until a data owner steps up — see CONTRIBUTING.md.'
  ] },
  { date: '2026-07-06', changes: [
      { text: 'Updated Forest Green paint availability to August 2026 per Rivian’s color-palette announcement.', config: true },
      'Cost over time: trade-ins now model the loan payoff still owed on the car, not just its value. Enter what you owe and only your equity (value − payoff) reduces what you pay; negative equity rolls into the loan (or day-one cash) instead of quietly inflating your credit. Tax relief still follows the trade-in’s full value.',
      'Cost over time: a trade-in now applies to a lease too — its equity offsets the amount due at signing as a capitalized-cost reduction, the way a dealer would apply it.',
      'Cost over time: cleaned up the sticky summary bar that appears as you scroll — it now leads with your monthly payment and mirrors the sidebar’s out-the-door, true-cost, and effective figures, with a precise −/+ year stepper replacing the old horizon slider.',
      'Cost over time: right-sized the "Scenarios: cumulative cost" chart so it no longer towers over the others, added a color dot on each scenario card matching its line, and default names now auto-letter (A, B, C…) so they never duplicate or drift out of sync.',
      'Cost over time: refreshed loan and lease defaults to Rivian’s current R2 Performance builder terms — 5.79% APR / 60-mo with $15,000 down on finance, and $829/mo pre-tax with $4,895 due at signing on a 36-mo lease.',
      'Default build is now the R2 Performance (the only R2 available to order), so the loan and lease estimates line up with the vehicle Rivian actually quotes.'
  ] },
  { date: '2026-07-05', changes: [
      { text: 'New Launch Edition switch on the Performance trim (Build + Compare): flip the promo off to spec what the trim would cost once it ends, with Autonomy+ and the Tow Package priced individually.', config: true },
      { text: 'Added Connect+ monthly and yearly subscription pricing to the builder, trim comparison, and cost-over-time model.', config: true },
      { text: 'Added the Travel Kitchen ($1,400, now priced on the Gear Shop) to the accessories list.', config: true },
      { text: 'Corrected wheel upgrade prices to match Rivian’s builder: Standard 20" Bicolor Carbon is +$1,000 and Premium 21" Liquid Tungsten is +$2,000 (both showed an estimated $1,750).', config: true },
      { text: 'Corrected the 20" Black Sand A/T wheel price to match Rivian’s R2 configurator.', config: true },
      { text: 'Corrected Borealis paint availability to September 2026.', config: true },
      { text: 'Corrected Coastal Cloud interior availability to August 2026.', config: true },
      'Cost over time: front-loaded, mileage-aware depreciation curve — steeper first year, endpoint shifts with your miles/yr and is always shown on the chart.',
      'Cost over time: per-state home electricity and gas price defaults (EIA / AAA), an editable public-charging rate (was fixed at 45¢/kWh), optional running-cost escalation, and an EV incentives/rebates line.',
      'New charts: EV-vs-gas fuel savings with charger-install payback, plus an overlay of saved scenarios’ cumulative cost curves.',
      'Clearer charts: direct dollar labels on the cumulative and depreciation endpoints, per-year totals on the annual bars, and legends that only show categories in play.',
      'Cost inputs regrouped by the bucket they feed: The purchase, How you’ll pay, Charging & energy, Ownership costs, What comes back.',
      'State data: every row gained EIA electricity, AAA gas, and a verified audit stamp; new validation/ folder holds a repeatable audit playbook and prompt generator.',
      'Cargo Cover now points at its real Gear Shop product page with the R2 product photo and a "Coming soon" tag ($200 confirmed).',
      'Corrected the Texas upfront tax to the 6.25% motor-vehicle sales-tax rate (was 8.2%).',
      'Fixed: opening the Compare tab no longer copies the built trim’s wheels onto the other trims (Performance’s included 21" was showing up as a +$2,000 upgrade on Premium).',
      'Fixed trade-in value so it reduces purchase totals, not just taxable amounts.',
      'Verified every builder option and Gear Shop accessory price against Rivian’s site — everything else matched (July 2026).'
  ] },
  { date: '2026-07-04', changes: [
      'Initial public release — the R2 cost calculator, generalized to work for any US state.',
      'Open-sourced for the Rivian community; contributions welcome via pull request.'
  ] }
];
