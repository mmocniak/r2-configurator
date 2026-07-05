/* R2 configurator — changelog. Newest first. Loaded as a classic script.
   Entry shape: { date:'YYYY-MM-DD', changes:['...'], r2Config?:true }
   Set r2Config:true ONLY when the entry changes the R2's available configuration
   options (a new option becomes configurable, or an "upcoming" option ships).
   See CONTRIBUTING.md. */
const CHANGELOG = [
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
