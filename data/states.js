/* R2 configurator — per-state tax/fee/insurance data.
   Audited 2026 against Tax Foundation (combined sales tax), NCSL/AFDC (EV fees), state
   DOR/DMV fee schedules, and 2025-26 full-coverage insurance surveys. Still estimates —
   correct your state via PR (see CONTRIBUTING.md; run tests/selftest.html after editing).
   Fields:
     tax     = upfront purchase tax % on (price + destination − trade-in). Usually the
               combined state+local sales/use rate; several states use a special vehicle
               rate or one-time excise (NC 3% HUT, GA ~7% TAVT, SC $500 IMF cap ≈1%,
               OK 4.5%, NM/ND/SD 4-5%, MS 5%). 0 = no upfront tax.
     title   = one-time title fee ($)
     reg     = annual registration / base fee ($) — flat portion only
     evFee   = annual EV surcharge ($)
     propTax = annual value-based vehicle tax, rate per $100 of (depreciating) value; 0 if none.
               Covers ad-valorem property taxes AND value-based state taxes that shrink with the
               car's value (AZ VLT, NV GST, CO SOT, NE Motor-Vehicle Tax, MN/IA/MI registration).
     ins     = rough statewide average annual full-coverage insurance ($) */
const STATES = {
  AL: { name:'Alabama',            tax:9.43, title:15,  reg:23,     evFee:200,   propTax:0,    ins:2150 },
  AK: { name:'Alaska',             tax:1.82, title:15,  reg:50,     evFee:0,     propTax:0,    ins:2050 },  // no state sales tax; reg = biennial $100 annualized
  AZ: { name:'Arizona',            tax:8.41, title:4,   reg:8,      evFee:0,     propTax:1.68, ins:2650 },  // VLT (annual value tax) -> propTax; reg base only
  AR: { name:'Arkansas',           tax:9.46, title:10,  reg:27,     evFee:200,   propTax:0,    ins:2700 },
  CA: { name:'California',         tax:8.8,  title:15,  reg:65,     evFee:118,   propTax:0,    ins:2650 },
  CO: { name:'Colorado',           tax:7.86, title:7.2, reg:75,     evFee:54,    propTax:1.79, ins:3250 },  // Specific Ownership Tax -> propTax (declining); reg base only
  CT: { name:'Connecticut',        tax:6.35, title:25,  reg:120,    evFee:0,     propTax:2.27, ins:2750 },
  DE: { name:'Delaware',           tax:4.25, title:35,  reg:40,     evFee:110,   propTax:0,    ins:2950 },  // no sales tax (4.25% doc-fee proxy); $110 EV fee eff. 10/2025
  FL: { name:'Florida',            tax:6.95, title:77.25, reg:46,     evFee:0,     propTax:0,    ins:3750 },
  GA: { name:'Georgia',            tax:7,    title:18,  reg:20,     evFee:235,   propTax:0,    ins:2200 },  // no car sales tax; one-time ~7% TAVT
  HI: { name:'Hawaii',             tax:4.5,  title:10,  reg:45,     evFee:50,    propTax:0,    ins:1800 },
  ID: { name:'Idaho',              tax:6.03, title:14,  reg:69,     evFee:140,   propTax:0,    ins:1800 },
  IL: { name:'Illinois',           tax:8.89, title:165, reg:151,    evFee:100,   propTax:0,    ins:2200 },
  IN: { name:'Indiana',            tax:7,    title:15,  reg:22,     evFee:221,   propTax:0,    ins:2000 },
  IA: { name:'Iowa',               tax:6.94, title:25,  reg:40,     evFee:130,   propTax:1,    ins:2050 },  // 1% list-price reg component -> propTax; reg base/weight only
  KS: { name:'Kansas',             tax:8.77, title:10,  reg:45,     evFee:165,   propTax:1.93, ins:2700 },
  KY: { name:'Kentucky',           tax:6,    title:9,   reg:22,     evFee:120,   propTax:1.2,  ins:2500 },
  LA: { name:'Louisiana',          tax:10.12, title:68.5, reg:50,     evFee:110,   propTax:0,    ins:3900 },
  ME: { name:'Maine',              tax:5.5,  title:33,  reg:35,     evFee:0,     propTax:2.4,  ins:1550 },
  MD: { name:'Maryland',           tax:6,    title:200, reg:231.5,  evFee:125,   propTax:0,    ins:2550 },  // title $200 & reg reflect 2025 law / >3,700 lb class
  MA: { name:'Massachusetts',      tax:6.25, title:75,  reg:30,     evFee:0,     propTax:2.25, ins:2150 },
  MI: { name:'Michigan',           tax:6,    title:15,  reg:15,     evFee:267,   propTax:0.6,  ins:3200 },  // 0.6% ad-valorem plate -> propTax
  MN: { name:'Minnesota',          tax:6.88, title:8.25, reg:35,     evFee:250,   propTax:1.58, ins:2100 },  // flat 6.875% MVST (local-exempt); value-based reg -> propTax
  MS: { name:'Mississippi',        tax:5,    title:9,   reg:15,     evFee:150,   propTax:3.42, ins:2400 },  // flat 5% car rate; high county ad-valorem (propTax)
  MO: { name:'Missouri',           tax:8.41, title:8.5, reg:51.25,  evFee:150,   propTax:2.4,  ins:2600 },
  MT: { name:'Montana',            tax:0,    title:12.36, reg:217,    evFee:130,   propTax:0,    ins:2550 },  // no sales tax
  NE: { name:'Nebraska',           tax:6.97, title:10,  reg:25,     evFee:150,   propTax:1.8,  ins:2300 },  // annual Motor Vehicle Tax -> propTax; reg base only
  NV: { name:'Nevada',             tax:8.24, title:28.25, reg:33,     evFee:0,     propTax:1.75, ins:3550 },  // Govt Services Tax (annual value tax) -> propTax
  NH: { name:'New Hampshire',      tax:0,    title:25,  reg:32,     evFee:100,   propTax:1.8,  ins:1600 },  // no sales tax; municipal permit fee -> propTax
  NJ: { name:'New Jersey',         tax:6.6,  title:60,  reg:71,     evFee:270,   propTax:0,    ins:3000 },
  NM: { name:'New Mexico',         tax:4,    title:5,   reg:50,     evFee:0,     propTax:0,    ins:2150 },  // flat 4% MVET (not gross-receipts)
  NY: { name:'New York',           tax:8.53, title:50,  reg:45,     evFee:0,     propTax:0,    ins:4050 },
  NC: { name:'North Carolina',     tax:3,    title:56,  reg:46.25,  evFee:214.5, propTax:0.8721, ins:2300 },  // reference row - verified
  ND: { name:'North Dakota',       tax:5,    title:5,   reg:111,    evFee:120,   propTax:0,    ins:1800 },  // flat 5% excise; reg weight-based
  OH: { name:'Ohio',               tax:7.23, title:15,  reg:31,     evFee:200,   propTax:0,    ins:1550 },
  OK: { name:'Oklahoma',           tax:4.5,  title:11,  reg:96,     evFee:110,   propTax:0,    ins:2800 },  // flat 4.5% vehicle rate (1.25% sales + 3.25% excise)
  OR: { name:'Oregon',             tax:0.5,  title:192, reg:63,     evFee:115,   propTax:0,    ins:1950 },  // no sales tax; 0.5% privilege tax
  PA: { name:'Pennsylvania',       tax:6.34, title:72,  reg:45,     evFee:250,   propTax:0,    ins:2450 },
  RI: { name:'Rhode Island',       tax:7,    title:53,  reg:52,     evFee:200,   propTax:0,    ins:3000 },
  SC: { name:'South Carolina',     tax:1,    title:15,  reg:40,     evFee:60,    propTax:1.2,  ins:2300 },  // $500 IMF cap ~= 1% at $50k
  SD: { name:'South Dakota',       tax:4,    title:10,  reg:108,    evFee:50,    propTax:0,    ins:1900 },  // flat 4% excise; reg weight-based
  TN: { name:'Tennessee',          tax:9.56, title:14,  reg:30,     evFee:200,   propTax:0,    ins:2100 },
  TX: { name:'Texas',              tax:8.2,  title:33,  reg:52,     evFee:200,   propTax:0,    ins:2950 },
  UT: { name:'Utah',               tax:7.32, title:6,   reg:150,    evFee:180,   propTax:0,    ins:2700 },
  VT: { name:'Vermont',            tax:6.37, title:35,  reg:76,     evFee:89,    propTax:0,    ins:1550 },
  VA: { name:'Virginia',           tax:5.77, title:15,  reg:41,     evFee:132,   propTax:4.13, ins:2050 },
  WA: { name:'Washington',         tax:9.43, title:15,  reg:69,     evFee:225,   propTax:0,    ins:2650 },
  WV: { name:'West Virginia',      tax:6.57, title:15,  reg:52,     evFee:200,   propTax:0,    ins:2150 },
  WI: { name:'Wisconsin',          tax:5.7,  title:165, reg:85,     evFee:175,   propTax:0,    ins:2000 },
  WY: { name:'Wyoming',            tax:5.44, title:15,  reg:30,     evFee:200,   propTax:0,    ins:1550 },
  DC: { name:'District of Columbia', tax:7,    title:26,  reg:115,    evFee:0,     propTax:0,    ins:2950 },  // weight-tiered excise (7% at 3,500-4,999 lb); reg by weight
};
