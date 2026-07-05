# Audit result schema

One JSON object per state, saved as `validation/results/YYYY-MM/XX.json`.
Documented, not machine-enforced (this repo has no build step) — the reviewer
and `export.html`'s skeleton keep the shape consistent.

```json
{
  "state": "VA",
  "audited": "2026-07",
  "auditor_model": "model name/version",
  "fields": {
    "tax":     { "current": 5.77,   "found": 5.77,  "source_url": "https://www.dmv.virginia.gov/...", "source_date": "2026", "confidence": "high",   "verdict": "match",        "note": "SUT special rate, not combined sales tax" },
    "title":   { "current": 15,     "found": 15,    "source_url": "...", "source_date": "...", "confidence": "high",   "verdict": "match",        "note": "" },
    "reg":     { "current": 41,     "found": 45.75, "source_url": "...", "source_date": "...", "confidence": "high",   "verdict": "mismatch",     "note": "4,000+ lb passenger tier" },
    "evFee":   { "current": 132,    "found": 132,   "source_url": "...", "source_date": "...", "confidence": "medium", "verdict": "match",        "note": "indexed annually" },
    "propTax": { "current": 4.13,   "found": 4.13,  "source_url": "...", "source_date": "...", "confidence": "medium", "verdict": "match",        "note": "county average; range 3.5-4.6" },
    "ins":     { "current": 2050,   "found": 2194,  "source_url": "...", "source_date": "...", "confidence": "medium", "verdict": "match",        "note": "±20% tolerance" },
    "kwh":     { "current": 17.4,   "found": 17.2,  "source_url": "...", "source_date": "2026-04", "confidence": "high", "verdict": "match",      "note": "EIA Table 5.6.A" },
    "gas":     { "current": 3.63,   "found": 3.58,  "source_url": "...", "source_date": "2026-07-05", "confidence": "high", "verdict": "match",   "note": "AAA, read 2026-07-05" }
  }
}
```

Field rules:

- `verdict` ∈ `match` | `mismatch` | `unverifiable` (tolerances per field are
  defined in [`INSTRUCTIONS.md`](INSTRUCTIONS.md))
- `confidence` ∈ `high` | `medium` | `low`
- `found` is `null` when `verdict` is `unverifiable`
- `source_url` is required whenever `found` is non-null
- Reviewers act only on `mismatch` / `unverifiable`; `match` rows just refresh
  the `verified` stamp
