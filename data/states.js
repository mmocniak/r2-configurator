/* R2 configurator — per-state tax/fee/insurance/energy data.
   Audited 2026 against Tax Foundation (combined sales tax), NCSL/AFDC (EV fees), state
   DOR/DMV fee schedules, 2025-26 full-coverage insurance surveys, EIA Electric Power
   Monthly Table 5.6.A (residential ¢/kWh, April 2026), and AAA state gas averages
   (July 2026). Still estimates — correct your state via PR (see CONTRIBUTING.md;
   run tests/selftest.html after editing; validation/ has the audit playbook).
   Fields:
     tax      = upfront purchase tax % on (price + destination − trade-in value). Relief
                follows the gross trade allowance, not the loan payoff still owed on it.
                Usually the combined state+local sales/use rate; several states use a special vehicle
                rate or one-time excise (NC 3% HUT, GA ~7% TAVT, SC $500 IMF cap ≈1%,
                OK 4.5%, NM/ND/SD 4-5%, MS 5%). 0 = no upfront tax.
     title    = one-time title fee ($)
     reg      = annual registration / base fee ($) — flat portion only
     evFee    = annual EV surcharge ($)
     propTax  = annual value-based vehicle tax, rate per $100 of (depreciating) value; 0 if none.
                Covers ad-valorem property taxes AND value-based state taxes that shrink with the
                car's value (AZ VLT, NV GST, CO SOT, NE Motor-Vehicle Tax, MN/IA/MI registration).
     ins      = rough statewide average annual full-coverage insurance ($)
     kwh      = EIA average residential electricity rate (¢/kWh) — a statewide default;
                users override for their utility / TOU plan
     gas      = AAA statewide average regular gasoline ($/gal) — volatile; used only for
                the EV-vs-gas fuel comparison
     verified = 'YYYY-MM' the row was last audited against sources (bump when changing values) */
const STATES = {
  AL: { name:'Alabama',            tax:9.43, title:15,  reg:23,     evFee:200,   propTax:0,    ins:2150, kwh:17.4, gas:3.44, verified:'2026-07' },
  AK: { name:'Alaska',             tax:1.82, title:15,  reg:50,     evFee:0,     propTax:0,    ins:2050, kwh:27.4, gas:4.76, verified:'2026-07' },  // no state sales tax; reg = biennial $100 annualized
  AZ: { name:'Arizona',            tax:8.41, title:4,   reg:8,      evFee:0,     propTax:1.68, ins:2650, kwh:15.5, gas:3.94, verified:'2026-07' },  // VLT (annual value tax) -> propTax; reg base only
  AR: { name:'Arkansas',           tax:9.46, title:10,  reg:27,     evFee:200,   propTax:0,    ins:2700, kwh:14.2, gas:3.40, verified:'2026-07' },
  CA: { name:'California',         tax:8.8,  title:15,  reg:65,     evFee:118,   propTax:0,    ins:2650, kwh:35.3, gas:5.38, verified:'2026-07' },
  CO: { name:'Colorado',           tax:7.86, title:7.2, reg:75,     evFee:54,    propTax:1.79, ins:3250, kwh:16.5, gas:3.65, verified:'2026-07' },  // Specific Ownership Tax -> propTax (declining); reg base only
  CT: { name:'Connecticut',        tax:6.35, title:25,  reg:120,    evFee:0,     propTax:2.27, ins:2750, kwh:32.2, gas:3.90, verified:'2026-07' },
  DE: { name:'Delaware',           tax:4.25, title:35,  reg:40,     evFee:110,   propTax:0,    ins:2950, kwh:18.8, gas:3.66, verified:'2026-07' },  // no sales tax (4.25% doc-fee proxy); $110 EV fee eff. 10/2025
  FL: { name:'Florida',            tax:6.95, title:77.25, reg:46,     evFee:0,     propTax:0,    ins:3750, kwh:15.4, gas:3.77, verified:'2026-07' },
  GA: { name:'Georgia',            tax:7,    title:18,  reg:20,     evFee:235,   propTax:0,    ins:2200, kwh:15.4, gas:3.54, verified:'2026-07' },  // no car sales tax; one-time ~7% TAVT
  HI: { name:'Hawaii',             tax:4.5,  title:10,  reg:45,     evFee:50,    propTax:0,    ins:1800, kwh:46.6, gas:5.46, verified:'2026-07' },
  ID: { name:'Idaho',              tax:6.03, title:14,  reg:69,     evFee:140,   propTax:0,    ins:1800, kwh:12.7, gas:4.03, verified:'2026-07' },
  IL: { name:'Illinois',           tax:8.89, title:165, reg:151,    evFee:100,   propTax:0,    ins:2200, kwh:20.5, gas:4.01, verified:'2026-07' },
  IN: { name:'Indiana',            tax:7,    title:15,  reg:22,     evFee:221,   propTax:0,    ins:2000, kwh:17.9, gas:3.06, verified:'2026-07' },
  IA: { name:'Iowa',               tax:6.94, title:25,  reg:40,     evFee:130,   propTax:1,    ins:2050, kwh:13.9, gas:3.50, verified:'2026-07' },  // 1% list-price reg component -> propTax; reg base/weight only
  KS: { name:'Kansas',             tax:8.77, title:10,  reg:45,     evFee:165,   propTax:1.93, ins:2700, kwh:15.8, gas:3.47, verified:'2026-07' },
  KY: { name:'Kentucky',           tax:6,    title:9,   reg:22,     evFee:120,   propTax:1.2,  ins:2500, kwh:15.0, gas:3.40, verified:'2026-07' },
  LA: { name:'Louisiana',          tax:10.12, title:68.5, reg:50,     evFee:110,   propTax:0,    ins:3900, kwh:14.4, gas:3.44, verified:'2026-07' },
  ME: { name:'Maine',              tax:5.5,  title:33,  reg:35,     evFee:0,     propTax:2.4,  ins:1550, kwh:28.4, gas:3.85, verified:'2026-07' },
  MD: { name:'Maryland',           tax:6,    title:200, reg:231.5,  evFee:125,   propTax:0,    ins:2550, kwh:22.1, gas:3.70, verified:'2026-07' },  // title $200 & reg reflect 2025 law / >3,700 lb class
  MA: { name:'Massachusetts',      tax:6.25, title:75,  reg:30,     evFee:0,     propTax:2.25, ins:2150, kwh:29.5, gas:3.88, verified:'2026-07' },
  MI: { name:'Michigan',           tax:6,    title:15,  reg:15,     evFee:267,   propTax:0.6,  ins:3200, kwh:21.4, gas:3.96, verified:'2026-07' },  // 0.6% ad-valorem plate -> propTax
  MN: { name:'Minnesota',          tax:6.88, title:8.25, reg:35,     evFee:250,   propTax:1.58, ins:2100, kwh:16.4, gas:3.61, verified:'2026-07' },  // flat 6.875% MVST (local-exempt); value-based reg -> propTax
  MS: { name:'Mississippi',        tax:5,    title:9,   reg:15,     evFee:150,   propTax:3.42, ins:2400, kwh:16.8, gas:3.42, verified:'2026-07' },  // flat 5% car rate; high county ad-valorem (propTax)
  MO: { name:'Missouri',           tax:8.41, title:8.5, reg:51.25,  evFee:150,   propTax:2.4,  ins:2600, kwh:14.0, gas:3.44, verified:'2026-07' },
  MT: { name:'Montana',            tax:0,    title:12.36, reg:217,    evFee:130,   propTax:0,    ins:2550, kwh:13.9, gas:3.90, verified:'2026-07' },  // no sales tax
  NE: { name:'Nebraska',           tax:6.97, title:10,  reg:25,     evFee:150,   propTax:1.8,  ins:2300, kwh:13.3, gas:3.52, verified:'2026-07' },  // annual Motor Vehicle Tax -> propTax; reg base only
  NV: { name:'Nevada',             tax:8.24, title:28.25, reg:33,     evFee:0,     propTax:1.75, ins:3550, kwh:14.3, gas:4.57, verified:'2026-07' },  // Govt Services Tax (annual value tax) -> propTax
  NH: { name:'New Hampshire',      tax:0,    title:25,  reg:32,     evFee:100,   propTax:1.8,  ins:1600, kwh:27.2, gas:3.84, verified:'2026-07' },  // no sales tax; municipal permit fee -> propTax
  NJ: { name:'New Jersey',         tax:6.6,  title:60,  reg:71,     evFee:270,   propTax:0,    ins:3000, kwh:23.5, gas:3.82, verified:'2026-07' },
  NM: { name:'New Mexico',         tax:4,    title:5,   reg:50,     evFee:0,     propTax:0,    ins:2150, kwh:15.2, gas:3.72, verified:'2026-07' },  // flat 4% MVET (not gross-receipts)
  NY: { name:'New York',           tax:8.53, title:50,  reg:45,     evFee:0,     propTax:0,    ins:4050, kwh:29.5, gas:4.07, verified:'2026-07' },
  NC: { name:'North Carolina',     tax:3,    title:56,  reg:46.25,  evFee:214.5, propTax:0.8721, ins:2300, kwh:16.3, gas:3.50, verified:'2026-07' },  // reference row - verified
  ND: { name:'North Dakota',       tax:5,    title:5,   reg:111,    evFee:120,   propTax:0,    ins:1800, kwh:12.4, gas:3.59, verified:'2026-07' },  // flat 5% excise; reg weight-based
  OH: { name:'Ohio',               tax:7.23, title:15,  reg:31,     evFee:200,   propTax:0,    ins:1550, kwh:19.5, gas:3.61, verified:'2026-07' },
  OK: { name:'Oklahoma',           tax:4.5,  title:11,  reg:96,     evFee:110,   propTax:0,    ins:2800, kwh:13.3, gas:3.32, verified:'2026-07' },  // flat 4.5% vehicle rate (1.25% sales + 3.25% excise)
  OR: { name:'Oregon',             tax:0.5,  title:192, reg:63,     evFee:115,   propTax:0,    ins:1950, kwh:15.8, gas:4.58, verified:'2026-07' },  // no sales tax; 0.5% privilege tax
  PA: { name:'Pennsylvania',       tax:6.34, title:72,  reg:45,     evFee:250,   propTax:0,    ins:2450, kwh:21.5, gas:3.96, verified:'2026-07' },
  RI: { name:'Rhode Island',       tax:7,    title:53,  reg:52,     evFee:200,   propTax:0,    ins:3000, kwh:28.3, gas:3.76, verified:'2026-07' },
  SC: { name:'South Carolina',     tax:1,    title:15,  reg:40,     evFee:60,    propTax:1.2,  ins:2300, kwh:17.1, gas:3.45, verified:'2026-07' },  // $500 IMF cap ~= 1% at $50k
  SD: { name:'South Dakota',       tax:4,    title:10,  reg:108,    evFee:50,    propTax:0,    ins:1900, kwh:14.5, gas:3.65, verified:'2026-07' },  // flat 4% excise; reg weight-based
  TN: { name:'Tennessee',          tax:9.56, title:14,  reg:30,     evFee:200,   propTax:0,    ins:2100, kwh:14.9, gas:3.38, verified:'2026-07' },
  TX: { name:'Texas',              tax:6.25, title:33,  reg:52,     evFee:200,   propTax:0,    ins:2950, kwh:17.0, gas:3.32, verified:'2026-07' },  // flat 6.25% motor-vehicle sales tax (no local add-on)
  UT: { name:'Utah',               tax:7.32, title:6,   reg:150,    evFee:180,   propTax:0,    ins:2700, kwh:13.3, gas:3.81, verified:'2026-07' },
  VT: { name:'Vermont',            tax:6.37, title:35,  reg:76,     evFee:89,    propTax:0,    ins:1550, kwh:24.6, gas:3.97, verified:'2026-07' },
  VA: { name:'Virginia',           tax:5.77, title:15,  reg:41,     evFee:132,   propTax:4.13, ins:2050, kwh:17.4, gas:3.63, verified:'2026-07' },
  WA: { name:'Washington',         tax:9.43, title:15,  reg:69,     evFee:225,   propTax:0,    ins:2650, kwh:14.4, gas:5.05, verified:'2026-07' },
  WV: { name:'West Virginia',      tax:6.57, title:15,  reg:52,     evFee:200,   propTax:0,    ins:2150, kwh:16.1, gas:3.71, verified:'2026-07' },
  WI: { name:'Wisconsin',          tax:5.7,  title:165, reg:85,     evFee:175,   propTax:0,    ins:2000, kwh:19.2, gas:3.57, verified:'2026-07' },
  WY: { name:'Wyoming',            tax:5.44, title:15,  reg:30,     evFee:200,   propTax:0,    ins:1550, kwh:14.7, gas:3.85, verified:'2026-07' },
  DC: { name:'District of Columbia', tax:7,    title:26,  reg:115,    evFee:0,     propTax:0,    ins:2950, kwh:25.4, gas:4.09, verified:'2026-07' },  // weight-tiered excise (7% at 3,500-4,999 lb); reg by weight
};
