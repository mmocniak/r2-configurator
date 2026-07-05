/* R2 configurator — changelog. Newest first. Loaded as a classic script.
   Entry shape: { date:'YYYY-MM-DD', changes:['...'], r2Config?:true }
   Set r2Config:true ONLY when the entry changes the R2's available configuration
   options (a new option becomes configurable, or an "upcoming" option ships).
   See CONTRIBUTING.md. */
const CHANGELOG = [
  { date: '2026-07-05', changes: [
      'Corrected the 20" Black Sand A/T wheel price to match Rivian’s R2 configurator.',
      'Corrected Borealis paint availability to September 2026.',
      'Fixed trade-in value so it reduces purchase totals, not just taxable amounts.'
  ] },
  { date: '2026-07-04', changes: [
      'Initial public release — the R2 cost calculator, generalized to work for any US state.',
      'Open-sourced for the Rivian community; contributions welcome via pull request.'
  ] }
];
