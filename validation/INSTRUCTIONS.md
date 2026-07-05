<!-- KEEP IN SYNC: export.html embeds this playbook in its prompt template. -->

# Audit playbook — one state per session

You are auditing one row of per-state data for an open-source Rivian R2 cost
calculator. Work through the fields **in order**, follow the source hierarchy
exactly, and report — **never guess, never edit files**. Your entire output is
one JSON object (skeleton provided in the prompt).

## Vehicle assumptions (for weight- or price-tiered fees)

- Vehicle: Rivian R2, model years 2026–2027, **electric SUV**
- Curb weight class: **4,500–5,500 lb** (use the tier containing ~5,000 lb)
- Price for percentage checks: **$55,000** MSRP class

## Fields, source order, and tolerances

Stop at the first authoritative source that answers; cite its URL.

### `tax` — upfront purchase tax, % of (price + destination − trade-in)
1. **FIRST** check whether the state uses a special motor-vehicle rate instead
   of its ordinary sales tax. Known specials: NC 3% Highway Use Tax · GA ~7%
   TAVT (one-time, replaces sales tax) · TX flat 6.25% motor-vehicle sales tax
   (no local add-on) · VA motor-vehicle SUT (not the combined sales rate) ·
   OK 4.5% combined (1.25% sales + 3.25% excise) · NM 4% MVET · ND 5% excise ·
   SD 4% excise · MS 5% vehicle rate · MN flat MVST (local-exempt) · OR 0.5%
   dealer privilege tax · SC IMF **capped at $500** (≈1% at $50k — verify the
   cap, not a rate) · DE 4.25% doc fee (no sales tax) · DC weight-tiered excise
   · MT/NH no sales tax (0 unless another vehicle levy exists). Verify against
   the state **DOR/DMV motor-vehicle page**.
2. Otherwise: Tax Foundation's latest "State and Local Sales Tax Rates" table —
   use the **combined** state + average local rate.
- Tolerance: **±0.25 percentage points** → `match`.

### `title` — one-time title fee ($)
State DMV/DOT fee schedule. Tolerance **±$5**.

### `reg` — annual registration base fee ($)
State DMV/DOT fee schedule; flat/base portion only (value-based components
belong in `propTax`). For weight-tiered states (MD, ND, SD, DC, …) use the
4,500–5,500 lb passenger tier. If the state bills biennially, annualize (÷2).
Tolerance **±$5** against the chosen tier.

### `evFee` — annual EV surcharge ($)
State DMV or statute, cross-checked against NCSL's EV-fee tracker and AFDC
(afdc.energy.gov/laws/state). Some states index this annually — if the fee is
scheduled to change, note it. Tolerance **±$5**.

### `propTax` — annual value-based vehicle tax, per $100 of retail value
State/county DOR. This field also absorbs **value-based state taxes** that
decline with the car's value (AZ VLT, NV GST, CO SOT, NE Motor-Vehicle Tax,
value-based registration in MN/IA/MI). Conversion recipe when the source
quotes mills on an assessed value:

    per_$100 = (mill_rate ÷ 10) × assessment_ratio
    e.g. AZ VLT: $2.80 per $100 of assessed value, assessed = 60% of MSRP
         → 2.80 × 0.60 = 1.68 per $100 of retail value

Counties vary — statewide typical value is acceptable; note the spread.
`0` means the state has no such tax (verify absence, don't assume it).
Tolerance **±0.1**.

### `ins` — average annual full-coverage insurance ($)
A named 2025–26 survey (Bankrate, NerdWallet, Insurance.com). This is the
softest field. Tolerance **±20%**.

### `kwh` — average residential electricity rate (¢/kWh)
EIA **Electric Power Monthly, Table 5.6.A**, residential column, latest month.
Tolerance **±1¢**.

### `gas` — average regular gasoline price ($/gal)
AAA state averages (gasprices.aaa.com/state-gas-price-averages/); fall back to
EIA weekly retail if AAA is unreachable (note it). Record the read date —
prices move daily. Tolerance **±$0.25**.

## Hard rules

1. Verdict per field: `match` (within tolerance), `mismatch` (outside it), or
   `unverifiable` (no authoritative source found). **Report `unverifiable`
   rather than guessing.**
2. Every `found` value MUST carry a `source_url` that is a **government page or
   a named survey/tracker** (Tax Foundation, NCSL, AFDC, EIA, AAA, Bankrate,
   NerdWallet). Blogs, forums, and AI summaries do not count.
3. `confidence`: `high` = primary government source · `medium` = named
   tracker/survey · `low` = single indirect source (explain in `note`).
4. Do the arithmetic shown above; do not invent your own conversions. If a
   conversion is ambiguous, mark `unverifiable` and explain.
5. Output **only** the completed JSON object — no prose before or after.
