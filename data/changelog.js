/* R2 configurator — changelog. Newest first. Loaded as a classic script.
   Entry shape: { date:'YYYY-MM-DD', changes:['...'], r2Config?:true }
   Set r2Config:true ONLY when the entry changes the R2's available configuration
   options (a new option becomes configurable, or an "upcoming" option ships).
   See CONTRIBUTING.md. */
const CHANGELOG = [
  { date: '2026-07-05', changes: [
      'Corrected wheel upgrade prices to match Rivian’s builder: Standard 20" Bicolor Carbon is +$1,000 and Premium 21" Liquid Tungsten is +$2,000 (both showed an estimated $1,750).',
      'New Launch Edition toggle on the Performance trim (Build + Compare): flip the promo off to spec what the trim would cost once it ends, with Autonomy+ and the Tow Package priced individually.',
      'Cargo Cover now points at its real Gear Shop product page with the R2 product photo and a "Coming soon" tag ($200 confirmed).',
      'Added the Travel Kitchen ($1,400, now priced on the Gear Shop) to the accessories list; marked the J1772 AC Adapter sold out.',
      'Verified every builder option and Gear Shop accessory price against Rivian’s site — everything else matched (July 2026).'
  ], r2Config: true },
  { date: '2026-07-05', changes: [
      'Cost over time: front-loaded, mileage-aware depreciation curve — steeper first year, endpoint shifts with your miles/yr and is always shown on the chart.',
      'Cost over time: per-state home electricity and gas price defaults (EIA / AAA), an editable public-charging rate (was fixed at 45¢/kWh), optional running-cost escalation, and an EV incentives/rebates line.',
      'New charts: EV-vs-gas fuel savings with charger-install payback, plus an overlay of saved scenarios’ cumulative cost curves.',
      'Clearer charts: direct dollar labels on the cumulative and depreciation endpoints, per-year totals on the annual bars, and legends that only show categories in play.',
      'Cost inputs regrouped by the bucket they feed: The purchase, How you’ll pay, Charging & energy, Ownership costs, What comes back.',
      'State data: every row gained EIA electricity, AAA gas, and a verified audit stamp; new validation/ folder holds a repeatable audit playbook and prompt generator.'
  ] },
  { date: '2026-07-05', changes: [
      'Corrected the Texas upfront tax to the 6.25% motor-vehicle sales-tax rate (was 8.2%).',
      'Added Connect+ monthly and yearly subscription pricing to the builder, trim comparison, and cost-over-time model.',
      'Corrected the 20" Black Sand A/T wheel price to match Rivian’s R2 configurator.',
      'Corrected Borealis paint availability to September 2026.',
      'Corrected Coastal Cloud interior availability to August 2026.',
      'Fixed trade-in value so it reduces purchase totals, not just taxable amounts.'
  ], r2Config: true },
  { date: '2026-07-04', changes: [
      'Initial public release — the R2 cost calculator, generalized to work for any US state.',
      'Open-sourced for the Rivian community; contributions welcome via pull request.'
  ] }
];
