/* R2 configurator — per-state tax/fee/insurance seed data.
   These are ESTIMATES for a starting point; correct your state via PR (see CONTRIBUTING.md).
   Fields:
     tax     = upfront purchase tax % applied to (vehicle price + destination − trade-in).
               Most states = combined state + average local sales/use tax. NC is special: a flat 3% Highway Use Tax.
     title   = one-time title fee ($)
     reg     = annual registration / base fee ($)
     evFee   = annual EV surcharge/registration fee ($) — many states add this for EVs
     propTax = annual vehicle property/excise tax rate per $100 of (depreciating) value; 0 if the state has none
     ins     = rough statewide average annual full-coverage insurance ($)

   Sourcing notes: `tax` (combined state+avg-local sales tax) and `evFee` are from Tax Foundation
   2025 tables and are fairly solid. `title`, `reg`, `propTax`, and `ins` are rougher estimates.
   Rows flagged `// estimate — needs review` have at least one shaky notable value (evFee/propTax/tax). */
const STATES = {
  AL: { name:'Alabama',              tax:9.43,  title:15,  reg:23,     evFee:200,    propTax:0,      ins:2100 },
  AK: { name:'Alaska',               tax:1.82,  title:15,  reg:100,    evFee:0,      propTax:0,      ins:1900 },  // estimate — needs review
  AZ: { name:'Arizona',              tax:8.41,  title:4,   reg:35,     evFee:0,      propTax:0,      ins:2150 },  // estimate — needs review (AZ levies a value-based Vehicle License Tax not modeled here)
  AR: { name:'Arkansas',             tax:9.46,  title:10,  reg:27,     evFee:200,    propTax:0,      ins:2050 },
  CA: { name:'California',           tax:8.80,  title:25,  reg:65,     evFee:118,    propTax:0,      ins:2400 },
  CO: { name:'Colorado',             tax:7.86,  title:8,   reg:75,     evFee:54,     propTax:0,      ins:2600 },  // estimate — needs review (CO EV road-usage fees are layered/indexed)
  CT: { name:'Connecticut',          tax:6.35,  title:25,  reg:120,    evFee:0,      propTax:2.27,   ins:1900 },  // estimate — needs review (motor-vehicle mill-rate cap, effective rate)
  DE: { name:'Delaware',             tax:4.25,  title:35,  reg:40,     evFee:0,      propTax:0,      ins:2200 },  // estimate — needs review (no sales tax; 4.25% vehicle document fee used instead)
  FL: { name:'Florida',              tax:6.95,  title:78,  reg:46,     evFee:0,      propTax:0,      ins:3600 },
  GA: { name:'Georgia',              tax:7.00,  title:18,  reg:20,     evFee:235,    propTax:0,      ins:2200 },  // estimate — needs review (no car sales tax; one-time ~7% TAVT used for the tax field)
  HI: { name:'Hawaii',               tax:4.50,  title:5,   reg:45,     evFee:50,     propTax:0,      ins:1500 },
  ID: { name:'Idaho',                tax:6.03,  title:14,  reg:69,     evFee:140,    propTax:0,      ins:1400 },
  IL: { name:'Illinois',             tax:8.89,  title:165, reg:151,    evFee:100,    propTax:0,      ins:2000 },
  IN: { name:'Indiana',              tax:7.00,  title:15,  reg:22,     evFee:150,    propTax:0,      ins:1650 },  // estimate — needs review (EV fee is indexed, ~$150–$230)
  IA: { name:'Iowa',                 tax:6.94,  title:25,  reg:150,    evFee:130,    propTax:0,      ins:1650 },  // estimate — needs review (reg is value+weight based, varies widely)
  KS: { name:'Kansas',               tax:8.77,  title:10,  reg:45,     evFee:100,    propTax:1.50,   ins:2100 },  // estimate — needs review (evFee and vehicle property tax both rough)
  KY: { name:'Kentucky',             tax:6.00,  title:9,   reg:22,     evFee:120,    propTax:1.20,   ins:2500 },  // estimate — needs review (KY levies an annual motor-vehicle ad valorem tax)
  LA: { name:'Louisiana',            tax:10.12, title:69,  reg:40,     evFee:110,    propTax:0,      ins:3300 },
  ME: { name:'Maine',                tax:5.50,  title:33,  reg:35,     evFee:0,      propTax:2.40,   ins:1300 },  // estimate — needs review (ME excise tax declines with vehicle age; yr-1 rate shown)
  MD: { name:'Maryland',             tax:6.00,  title:100, reg:135,    evFee:125,    propTax:0,      ins:2100 },  // estimate — needs review (EV fee newly enacted)
  MA: { name:'Massachusetts',        tax:6.25,  title:75,  reg:30,     evFee:0,      propTax:2.50,   ins:1800 },
  MI: { name:'Michigan',             tax:6.00,  title:15,  reg:150,    evFee:160,    propTax:0,      ins:3100 },  // estimate — needs review (reg is value-based, varies)
  MN: { name:'Minnesota',            tax:8.13,  title:8,   reg:150,    evFee:75,     propTax:0,      ins:1900 },  // estimate — needs review (reg is ~1.25% of MSRP, high for new EVs)
  MS: { name:'Mississippi',          tax:7.06,  title:9,   reg:15,     evFee:150,    propTax:1.50,   ins:2200 },  // estimate — needs review (county ad valorem effective rate)
  MO: { name:'Missouri',             tax:8.41,  title:11,  reg:21,     evFee:90,     propTax:2.00,   ins:2200 },  // estimate — needs review (alt-fuel decal fee and personal property tax both rough)
  MT: { name:'Montana',              tax:0,     title:12,  reg:217,    evFee:130,    propTax:0,      ins:2100 },  // estimate — needs review (no sales tax; EV fee newly enacted, weight-based)
  NE: { name:'Nebraska',             tax:6.97,  title:10,  reg:25,     evFee:150,    propTax:0,      ins:2000 },
  NV: { name:'Nevada',               tax:8.24,  title:29,  reg:33,     evFee:0,      propTax:0,      ins:2600 },  // estimate — needs review (value-based Governmental Services Tax not modeled)
  NH: { name:'New Hampshire',        tax:0,     title:25,  reg:32,     evFee:100,    propTax:1.80,   ins:1500 },  // estimate — needs review (no sales tax; municipal permit fee is value-based, yr-1 rate shown)
  NJ: { name:'New Jersey',           tax:6.60,  title:60,  reg:71,     evFee:260,    propTax:0,      ins:2100 },
  NM: { name:'New Mexico',           tax:7.63,  title:17,  reg:50,     evFee:0,      propTax:0,      ins:1900 },  // estimate — needs review (EV fee recently added; confirm amount)
  NY: { name:'New York',             tax:8.53,  title:50,  reg:45,     evFee:0,      propTax:0,      ins:2900 },
  NC: { name:'North Carolina',       tax:3.0,   title:56,  reg:46.25,  evFee:214.50, propTax:0.8721, ins:2300 },  // reference row — verified
  ND: { name:'North Dakota',         tax:7.05,  title:5,   reg:49,     evFee:120,    propTax:0,      ins:1700 },
  OH: { name:'Ohio',                 tax:7.23,  title:15,  reg:31,     evFee:200,    propTax:0,      ins:1550 },
  OK: { name:'Oklahoma',             tax:9.01,  title:15,  reg:96,     evFee:110,    propTax:0,      ins:2400 },
  OR: { name:'Oregon',               tax:0.5,   title:101, reg:63,     evFee:115,    propTax:0,      ins:1650 },  // estimate — needs review (no sales tax; 0.5% new-vehicle privilege tax used instead)
  PA: { name:'Pennsylvania',         tax:6.34,  title:58,  reg:45,     evFee:200,    propTax:0,      ins:2200 },
  RI: { name:'Rhode Island',         tax:7.00,  title:53,  reg:52,     evFee:200,    propTax:0,      ins:2600 },  // estimate — needs review (car excise tax repealed 2022; EV fee amount rough)
  SC: { name:'South Carolina',       tax:7.50,  title:15,  reg:40,     evFee:60,     propTax:1.20,   ins:2400 },  // estimate — needs review (biennial EV fee; vehicle property tax effective rate rough)
  SD: { name:'South Dakota',         tax:6.11,  title:10,  reg:75,     evFee:50,     propTax:0,      ins:1900 },
  TN: { name:'Tennessee',            tax:9.56,  title:14,  reg:30,     evFee:200,    propTax:0,      ins:1900 },
  TX: { name:'Texas',                tax:8.20,  title:33,  reg:52,     evFee:200,    propTax:0,      ins:2500 },
  UT: { name:'Utah',                 tax:7.32,  title:6,   reg:44,     evFee:130,    propTax:0,      ins:1900 },
  VT: { name:'Vermont',              tax:6.37,  title:35,  reg:76,     evFee:89,     propTax:0,      ins:1400 },  // estimate — needs review (EV fee amount rough)
  VA: { name:'Virginia',             tax:5.77,  title:15,  reg:41,     evFee:129,    propTax:4.13,   ins:1600 },  // estimate — needs review (personal property tax varies a lot by locality)
  WA: { name:'Washington',           tax:9.43,  title:15,  reg:69,     evFee:225,    propTax:0,      ins:1750 },  // estimate — needs review (EV fee = $150 reg + $75 electrification)
  WV: { name:'West Virginia',        tax:6.57,  title:15,  reg:52,     evFee:200,    propTax:0,      ins:2100 },
  WI: { name:'Wisconsin',            tax:5.70,  title:165, reg:85,     evFee:175,    propTax:0,      ins:1550 },
  WY: { name:'Wyoming',              tax:5.44,  title:15,  reg:30,     evFee:200,    propTax:0,      ins:1750 },  // estimate — needs review (value-based county registration fee not modeled)
  DC: { name:'District of Columbia', tax:6.00,  title:26,  reg:72,     evFee:0,      propTax:0,      ins:2200 },  // estimate — needs review (weight-based excise tax; EVs get a reduced rate)
};
