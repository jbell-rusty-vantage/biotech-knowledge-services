# Fixture eu-nrcl-authorisation-data-protection — questions answered

Assertion ids (`e01` …) are in `assertions.yaml`; locators in `locators.yaml`.

| question | expected answer | rests on |
| --- | --- | --- |
| CQ-PF-04 (do the conditions of use cover a product's dose and form) | Conditions as authorised: food supplements (Directive 2002/46/EC), maximum 300 mg/day for the general adult population excluding pregnant and lactating women (230 mg/day for pregnant and lactating women). A product at ≤ 300 mg/day for adults is inside the condition text; a product above it, or a non-supplement food, is not — the verdict itself is a kernel APPLICABILITY assessment against the D6 product's dose. | e04 qualifiers; `rr-eu-2020-16.conditionsVerbatim` |
| Q-D8-13 (when does protection end) | EU data protection of ChromaDex's data for NR chloride: valid [2020-02-20, 2025-02-20) — **ended**. The act limits placing on the market to ChromaDex Inc. only "During the period of data protection" (`loc-eu-dp-only`), so that restriction is stated for a period that closed on 2025-02-20; what applies afterwards is not in this record (the act's own exception wording is in e06's qualifiers). | e06, e07 |
| CQ-MF-02 (standing in jurisdiction J, which record, what kind) | NR chloride, EU: AUTHORISED novel food (Union list entry), valid from 2020-02-20 as the Annex states, by Commission Implementing Regulation (EU) 2020/16 (CELEX 32020R0016, adopted 2020-01-10, OJ L 7 of 2020-01-13). Kind: an implementing act (the act that confers standing), not an EFSA opinion. | e01–e05 |
| Q-D8-09 (against which specification, set by whom) | The regulator-owned specification: "The novel food contains ≥ 90 % nicotinamide riboside chloride" (Annex Table 2), set by the European Commission (`specBasis REGULATORY` when a QualityResult is judged against it). | `loc-eu-spec` |

## Open point recorded, not resolved

Entry into force by Article 4 computes to 2020-02-02 (twentieth day after OJ publication on 2020-01-13), while the Annex states "Authorised on 20 February 2020" and a data-protection end of 20 February 2025 (e08, CALCULATED, for review).

## Verification

`tools/verify.py` (scratch) re-selected 12 of 12 locators from the EUR-Lex bytes.
