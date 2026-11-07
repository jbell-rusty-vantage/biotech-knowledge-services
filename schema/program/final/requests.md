# Fixture requests: candidate v2

Written by the fix stage of the S team on 2026-10-09. The rule is R-06: a typed pair survives without a fixture only when its deciding question is value 1, and then only with a numbered request in this file. 03-SYNTHESIS step 5 otherwise drops a pair that has no fixture. Every request below names a pair that is in the assembled SDL (`schema/final_biotech_schema_v2.graphql`, sha256 `c7cf1235…4793`) and that no fixture under `final/fixtures/` writes. A request is closed when its fixture lands under `final/fixtures/<module>/` and the register entry names it.

If a request is still open when the owner accepts the candidate, R-06's fallback applies to that pair: demote it to its predicate form, then re-measure.

| id | pair (from → to, type) | deciding questions (value) | requested fixture | register / seam entry | owner | open-questions | status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RQ-01 | D5 Target → D2 Condition, OPERATIONALIZED_BY (TargetMeasure's Condition member, R-70) | Q-D3-04 (1), Q-D3-05 (1), Q-D5-01 (1), Q-D5-20 (3) | A condition-coded outcome that reaches a Target, for example ASPREE major hemorrhage or incident dementia mapped to a Target | `relationship-register.yaml` D5 OPERATIONALIZED_BY `fixtureRequests` (RQ-01); `seams.yaml` D5 → D2 row | D5 (with D3) | FX-01 | open |
| RQ-02 | D8 CertificationListing → D6 ProductVariant, COVERS | CQ-PF-03a (1) | An NSF listing that names a size or flavour variant | `relationship-register.yaml` D8 COVERS `fixtureRequest` (id RQ-02); `seams.yaml` D8 and D6 COVERS rows | D8 | FX-02 | open |
| RQ-03 | D8 LegalStatus → D6 Product, STATUS_OF | CQ-MF-02 (1) | An LNHPD product licence (Health Canada), for example NPN 80112429, as STATUS_OF a Product | `relationship-register.yaml` D8 STATUS_OF `fixtureRequest` (id RQ-03); `seams.yaml` D8 STATUS_OF row | D8 | FX-03 | open |
| RQ-04 | D13 Event → D7 Person, INVOLVES | CQ-CL-05 (1), Q-D13-14 (2), Q-D13-25 (3) | A DATA_PRESENTATION event with a named presenter (INVOLVES {PRESENTER}, R-81). R-44 removed the lesne AUTHOR rows, which were the only rows writing this pair | `relationship-register.yaml` D13 INVOLVES (`questionsByPair` Event → Person) | D13 | FX-04 | open (the alternative is a cut to a predicate) |
| RQ-05 | K Source → D3 Publication, RENDITION_OF (R-43) | Q-K-21 (1), CQ-EV-05 (1) | The K fixture rows pmc-3799917 and pubmed-23471411 → Publication in `K/resveratrol-sirt1-evidence-mission` | `relationship-register.yaml` D3 RENDITION_OF; fixture now `cross-domain/claim-mission-report` (F-02) | kernel (with D3, D9) | FX-10 | **satisfied for the pair**: `cross-domain/claim-mission-report` writes 5 Source → Publication rows. The K rows are still wanted for Q-K-21's two-family test |
| RQ-06 | D2 MechanismEvidenceContext → D1 IngredientMaterial, EXPOSED_TO | CQ-MX-04 (1) | A mechanism-evidence context whose exposure is a named ingredient material (not only a substance) | `seams.yaml` D2 EXPOSED_TO row (note: RQ-06) | D2 (with D1) | — | open |

Not requests:

- **R-95 (OD-10):** acr-03 in `D12/acrylamide-fried-potato-harm` writes QualityResult → Product, a pair the candidate does not have. That case is an owner decision, not a missing fixture.
- **Unregistered fixture predicates (FU-13):** these are a registry gap, not a missing typed pair.
