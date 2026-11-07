# D8 — research notes for the model stage (A7, 2026-10-08)

Read with `01-ecosystem.md` (evidence, sources S03–S40), `02-questions.md` (32 rows) and `fixture-candidates.md` (FC-1…FC-8). Kernel pattern (A1) was not yet published when this was written: subject/object, identifier and mention edges below are written against the placeholder `Subjectable` and must be rebased.

## 1. What the research says about the shape of D8

1. **Almost every D8 fact is an issuer-scoped, dated record.** Regulator letters, licences, recalls, warning letters, court opinions, COAs, certifier listings. The questions filter on: issuer, record kind, record number, jurisdiction, subject (ingredient / product / lot / firm / facility / patent), date, and a disposition or verdict. That is a handful of record types with rich enums, not 35 node types.
2. **Scope inflation is the main harm.** No questions ≠ approved [S07][S09]; excluded can become not excluded [S05][S03]; EFSA opinion ≠ authorisation [S31]; licence ≠ marketed (LNHPD "Licence Status: Active" + "Market status: Not Marketed" [S33]); a COA can measure nothing [S18]; "Active" patent with invalid asserted claims [S21][S22]; facility vs product vs lot certification [S12b][S13][S40]. The model must make the scope explicit in enums (`statusKind`, `recordKind`, `resultBasis`, `coverageKind`) and never in a boolean like `approved`.
3. **Lot is the join key for "is it real".** Lot codes appear in recalls (free text `code_info`) [S14][S16][S17], COAs [S18][S38], certifier listings (NSF lot list, Informed Sport batch table) [S12b][S40], counterfeit indicators ("outdated and out-of-market lot numbers") [S20] and the consumer's bottle (lot lookup portals) [S19]. Lot earns a node.
4. **Independent measurement rarely reaches the lot.** Peer-reviewed survey is anonymized [S39]; competitor surveys name brands but not lots [S37][S20]; lot-level results come from brand-commissioned COAs and certifiers. `QualityResult` must therefore attach to a Lot **or** to a Product (D6) and carry the tester's identity so the tester's interest can be joined (D7).
5. **Specifications are mostly invisible**; they surface (a) as limits printed beside a result on a COA [S38], (b) restated by a regulator [S09][S30], (c) as a certifier's scope sentence [S13], (d) as their absence in a warning letter [S10]. No question traverses a specification as a thing in its own right at value ≤ 2. Specification = inline criterion properties on the result + text on the regulatory record.
6. **IP status is claim-level and adjudicated; licence terms are versioned agreements.** Google Patents status is "an assumption" [S21]; asserted claims of US 8,197,807 held invalid [S22]; the Dartmouth exclusive licences were amended and royalties waived after the litigation [S25]. Patent marking pages give numbers without coverage [S35]. Non-patent exclusivity matters as much (EU data protection end 2025-02-20 [S30]; exclusive supplier with blocking IP [S25]).
7. **Regulatory evidence crosses into D3.** FDA's NMN exclusion rests on MIB-626 trial registrations, one cited with a wrong NCT URL [S05][S26] — "regulator cites evidence" is worth a citation link (kernel) rather than a D8 type.

## 2. Candidate node types (target ≤ 8; recommendation 7, fallback 6)

| candidate | identity (proposal) | whyNode — the questions that filter/join/traverse through it | key filter properties | merges (pinned) |
| --- | --- | --- | --- | --- |
| **RegulatoryRecord** | (issuer org uid, recordKind, recordNumber) e.g. FDA/NDI_RESPONSE/1259; FDA/GRAS_RESPONSE/GRN-635; EC/NOVEL_FOOD_AUTHORISATION/32020R0016; HC/NHP_LICENCE/80112429; FDA/DRUG_APPLICATION/NDA217785; FDA/CITIZEN_PETITION_RESPONSE/FDA-2023-P-0872 | CQ-MF-02, Q-D8-01, CQ-AX-23, CQ-MF-03, CQ-PF-04, Q-D8-13, Q-D8-15, Q-D8-16, Q-D8-20, Q-D8-22 | recordKind, pathway, jurisdiction, recordNumber, issuedAt, disposition (enum), conditionsText, authorisedClaimsText[], dataProtectionEnd, docketId | RegulatorySubmission, RegulatoryResponse, (DrugApproval, OrphanDesignation as record kinds), RegulatoryPathway / PathwayVersion / RegulatoryStep → `pathway` enum + `legalBasisCitation` |
| **RegulatoryStatus** | (subject uid, jurisdiction, pathway, statusKind) versioned; one status node per standing, episodes on its STATUS_OF edge | CQ-MF-02, Q-D8-01 (as-of + reversal), CQ-AX-23, Q-D8-20, Q-D8-18 | statusKind, jurisdiction, pathway, statusVerbatim, marketStatus (for licences) | RegulatoryStatus (kept, narrowed), DrugApproval, OrphanDesignation (→ statusKind values) |
| **EnforcementAction** | (issuer, actionKind, number) e.g. FDA/WARNING_LETTER/724610; FDA/RECALL/H-0483-2026 | Q-D8-02, Q-D8-03, Q-D8-04, Q-D8-16, Q-D8-17, CQ-MF-06, Q-D8-18 | actionKind, issuedAt, recallClass, recallStatus, terminatedAt, violationCategories[], lotCodesVerbatim, productDescriptionVerbatim, issuingOffice | RegulatoryInspection (actionKind INSPECTION / FORM_483) |
| **Lot** | (brand-or-manufacturer org uid, lotCode, product/variant uid when known) | Q-D8-04, CQ-AX-19, Q-D8-05, Q-D8-08, CQ-PF-03, Q-D8-07 (counterfeit lots) | lotCode, expiry, manufacturedAt | ProductLot (renamed; owner D8 per coordinator; D6 contests) |
| **QualityResult** | (source snapshot uid, row selector) — one reported outcome for one analyte or check | CQ-AX-19, Q-D8-05, Q-D8-06, Q-D8-09, Q-D8-19 | analyteVerbatim, value, unit, comparator, resultBasis, lod/reportingLimit, method, specLimit/specComparator/specUnit/specBasis/specSetter, verdict, verdictBasis, testedAt | MeasuredResult, TestExecution, TestSample (→ `sampleKind`), TestMethod (→ `method`, `methodRef`), SpecificationCriterion (inline), PassFailInterpretation (verdict + verdictBasis) |
| **CertificationListing** | (certifier org uid, program, listingId or product key) versioned by observation | CQ-PF-03, Q-D8-08, CQ-AX-19, Q-D8-19 | program, standard, status, observedAt, scopeText, dateCertified | CertificationListing, CertificationProgram (→ `program`/`standard`), CertificationScope (→ `scopeText` + COVERS edges) |
| **Patent** | (office, publication number, kind code) | Q-D8-11, Q-D8-12, Q-D8-13, Q-D8-14, Q-D8-21, CQ-EC-01 | office, number, kindCode, familyId, priorityDate, expiryDate, aggregatorStatusVerbatim, title | GrantedPatent, PatentApplication (→ `kindCode`/`publicationType`), PatentFamily (→ `familyId`, `familyDefinition`), PatentClaim (→ claim numbers on adjudication; claims text kept on the snapshot), IpRightStatus (→ adjudication) |

**Fallback to 6:** fold EnforcementAction into RegulatoryRecord (`recordKind` WARNING_LETTER, RECALL, INSPECTION, FORM_483, CLOSE_OUT) — one "agency-issued record" type. Cost: recall-specific properties become nullable on a general type and the 12-field hub limit gets closer. Benefit: one identity rule and one ISSUED_BY. The model stage should measure both.

**Court and tribunal decisions** (CAFC opinion, PTAB IPR) can be a `RegulatoryRecord` of recordKind COURT_DECISION / PTAB_DECISION (issuer = court as Organization) — avoids an eighth type — or a D13 Event with a source. Recommendation: RegulatoryRecord (it is a dispositive authority act with a docket and a holding; same identity rule).

**Not nodes** (decided by the research): Specification (all three pinned spec types), ManufacturingProcess/Step, ManufacturingCapability, TestingLaboratory, RegulatoryAgency, CertificationProgram, CertificationScope, PatentFamily, PatentClaim, PatentLicense, IpRightStatus, Trademark, LotTestSummary, CertificateOfAnalysis (see section 5).

## 3. Candidate relationships (target ≤ 14; 14 listed, 12 if SUPERSEDES_RECORD and ADJUDICATES fold into properties)

| type (proposal) | from → to | class | temporal | questions | note |
| --- | --- | --- | --- | --- | --- |
| ISSUED_BY | RegulatoryRecord \| EnforcementAction \| CertificationListing → Organization (D7) | asserted | recorded-only | CQ-MF-02, Q-D8-02, CQ-PF-03 | issuer = regulator, court, certifier; replaces RegulatoryAgency/TestingLaboratory types |
| RECORD_CONCERNS | RegulatoryRecord → {Substance/IngredientMaterial (D1), Product (D6), Organization (D7), Facility (D7), Patent} | asserted | recorded-only | CQ-MF-02, Q-D8-12, Q-D8-15 | union ≤ 6; or kernel subject pattern if A1's pattern covers "about" |
| STATUS_OF | RegulatoryStatus → {Substance/IngredientMaterial (D1), Product (D6), Facility (D7)} | asserted | **episode** | CQ-MF-02, Q-D8-01, CQ-AX-23 | the as-of edge; NMN exclusion → reversal is two episodes or two statuses |
| STATUS_FROM | RegulatoryStatus → RegulatoryRecord | structural | recorded-only | CQ-MF-02, Q-D8-01, Q-D8-20 | "which record produced it" |
| SUPERSEDES_RECORD | RegulatoryRecord → RegulatoryRecord | asserted | recorded-only | Q-D8-01 | CP response amends the 2022 NDI determinations; may be predicate-only if status episodes suffice |
| ACTION_AGAINST | EnforcementAction → Organization \| Facility (D7) | asserted | recorded-only | Q-D8-02, Q-D8-03, CQ-MF-06 | |
| ACTION_CONCERNS | EnforcementAction → Product (D6) \| Lot | asserted | recorded-only | Q-D8-02, Q-D8-04, Q-D8-16 | lot only when the lot code resolves; verbatim lot text stays a property |
| LOT_OF | Lot → Product/ProductVariant (D6) | asserted | recorded-only | Q-D8-04, CQ-AX-19 | seam to D6 |
| RESULT_FOR | QualityResult → Lot \| Product (D6) | asserted | recorded-only | CQ-AX-19, Q-D8-06 | product-level for surveys that name no lot |
| TESTED_BY | QualityResult → Organization (D7) | asserted | recorded-only | Q-D8-05, Q-D8-06 | lab or tester; joins the tester's financial interest (D7) |
| COVERS | CertificationListing → Product (D6) \| Lot \| Facility (D7) | asserted | **episode** (observed on / dropped off) | CQ-PF-03, Q-D8-08 | coverage kind on the edge (PRODUCT_ALL_IDS, LOT, FACILITY) |
| HOLDS_IP_RIGHT | Organization (D7) → Patent | asserted | **episode** | Q-D8-11, Q-D8-21, CQ-EC-01 | edge props: role (ASSIGNEE, EXCLUSIVE_LICENSEE, NONEXCLUSIVE_LICENSEE, LICENSOR), disclosedIn; replaces PatentLicense, ASSIGNED_PATENT, LICENSES_PATENT, GRANTS_PATENT_LICENSE |
| PATENT_ABOUT | Patent → Substance/IngredientMaterial (D1) | asserted | recorded-only | Q-D8-11, Q-D8-13 | topical link, explicitly not "covers"; coverage is an assessment |
| ADJUDICATES | RegulatoryRecord (court/PTAB) → Patent | asserted | recorded-only | Q-D8-12 | edge props: claimNumbers[], outcome (INVALID, NOT_INVALID, INFRINGED, NOT_INFRINGED, NOT_INSTITUTED); could fold into RECORD_CONCERNS + properties |

Rough pairs (sum of from×to over the table): about 28 (budget 35); RECORD_CONCERNS is the widest target set (5). Aggregation off everywhere; nested ops `[CONNECT]` for asserted, `[CREATE, CONNECT]` for STATUS_FROM.

**Bitemporal episodes needed on only three edges:** STATUS_OF (standing changes: NMN 2022 → 2025), COVERS (certifier listings change in place; observed-at windows), HOLDS_IP_RIGHT (licence grant, amendment, waiver, expiry). Everything else is an immutable record with recorded time only.

## 4. Properties, enums and predicate-only values

- **Enums to define** (controlled vocabularies the questions filter on):
  - `RegulatoryRecordKind`: NDI_NOTIFICATION, NDI_RESPONSE, GRAS_NOTICE, GRAS_RESPONSE, CITIZEN_PETITION, CITIZEN_PETITION_RESPONSE, NOVEL_FOOD_AUTHORISATION, SCIENTIFIC_OPINION, NHP_LICENCE, DRUG_APPLICATION, DRUG_SUBMISSION_ACTION, DESIGNATION, COURT_DECISION, PTAB_DECISION (+ WARNING_LETTER, RECALL, INSPECTION, FORM_483, CLOSE_OUT if the 6-type fallback is chosen).
  - `RegulatoryPathway` (replaces 3 node types): US_NDI, US_GRAS, US_DIETARY_SUPPLEMENT_DEFINITION, US_NDA, US_BLA, US_503A, US_503B, US_DEVICE_510K, US_DE_NOVO, EU_NOVEL_FOOD, EU_FOOD_SUPPLEMENT, CA_NHP, AU_ARTG, OTHER.
  - `RegulatoryStatusKind`: APPROVED, AUTHORISED, LICENSED, CLEARED, DESIGNATED, NO_QUESTIONS (GRAS), NOTIFICATION_ACKNOWLEDGED, NOTIFICATION_OBJECTED, EXCLUDED_FROM_DEFINITION, NOT_EXCLUDED, FAVOURABLE_OPINION, NOT_AUTHORISED, ENFORCEMENT_DISCRETION, REGISTERED, WITHDRAWN, REVOKED. Plus `marketStatus` (MARKETED, NOT_MARKETED, UNKNOWN) for licences.
  - `EnforcementActionKind`: INSPECTION, FORM_483, WARNING_LETTER, CLOSE_OUT_LETTER, RECALL, IMPORT_ALERT, SEIZURE, INJUNCTION, SAFETY_COMMUNICATION; `RecallClass` I/II/III; `RecallStatus` ONGOING/COMPLETED/TERMINATED.
  - `ViolationCategory`: UNAPPROVED_DRUG_CLAIMS, MISBRANDING, CGMP_PART_111, CGMP_PART_211, UNDECLARED_ALLERGEN, CONTAMINANT, UNDECLARED_DRUG_INGREDIENT, POTENCY_LABEL_CLAIM, COMPOUNDING_INELIGIBLE_SUBSTANCE, STERILITY, OTHER.
  - `ResultBasis` (the decisive new enum from FC-3): MEASURED, INPUT_VERIFIED (batch-record / "quantity by input"), IN_PROCESS_CONTROL, STATED_CONFORMS (no value), NOT_DETECTED, BELOW_REPORTING_LIMIT, NOT_REPORTED.
  - `Verdict` CONFORMS / DOES_NOT_CONFORM / NOT_STATED; `VerdictBasis` SOURCE_STATED / EVALUATED; `SpecBasis` RELEASE / SHELF_LIFE / BOTH / UNSTATED; `SpecSetter` FIRM / REGULATOR / CERTIFIER / COMPENDIUM / UNSTATED; `Comparator` LT, LE, EQ, GE, GT, RANGE, NEGATIVE, ABSENT_IN, UNKNOWN (UNKNOWN required — E4 glyph loss).
  - `CoverageKind` PRODUCT, PRODUCT_ALL_IDS, LOT, FACILITY; `IpRightRole`; `AdjudicationOutcome`.
- **Assertion.predicate values (no typed relationship):**
  - CHARACTERIZES_REGULATORY_RECORD (company wording about an agency act; CQ-MF-03) — the assessment of it is K/D10.
  - MANUFACTURES, CONTRACT_MANUFACTURES_FOR, SUPPLIES_INGREDIENT, EXCLUSIVE_SUPPLIER_OF, DISTRIBUTES (CQ-MF-01; D7 owns organization role predicates — confirm with A6).
  - MARKED_WITH_PATENT (Q-D8-14), REPORTED_COUNTERFEIT (Q-D8-07), CLAIMS_CGMP_COMPLIANCE (CQ-MF-06), HAS_CAPABILITY_STAGE (CQ-MF-04, with valid time on the assertion), CITES_AS_EVIDENCE (regulator → trial/letter; Q-D8-15) unless the kernel citation pattern covers it.
- **Properties (count only, not filtered):** verbatim texts (conditions, scope, product description, lot text, claim quotes, statusVerbatim), letter signer/office, distribution pattern, product quantity, redaction flag.
- **Identifier schemes D8 emits** (for the kernel Identifier pattern): FDA NDI number, GRN, FDA CMS/MARCS warning-letter number, FDA recall number, FDA recall event id, FDA docket id (FDA-yyyy-X-nnnn), FDA application number (NDA/BLA/ANDA), FEI (not captured; Data Dashboard blocked), CELEX, EFSA DOI, Health Canada NPN and lnhpd_id, patent publication number (office+number+kind), court docket (e.g. CAFC 2022-1116, D. Del. 1:18-cv-01434), PTAB IPR number, certifier listing id (NSF 1451522), Informed Sport node id, lab report number (Eurofins 3921057-0), lot code (scoped to issuer).
- **Locator kinds D8 needs:** HTML heading + paragraph text-quote (warning letters, GRAS inventory, EUR-Lex); JSON field path (openFDA, LNHPD, Drugs@FDA); PDF page + text-quote with **extraction mode recorded** (E3) and table-row selectors; JATS section (Europe PMC).

## 5. Pinned types (35) → fate

| pinned type | fragment | fate |
| --- | --- | --- |
| ManufacturingSpecification | W11 | deferred — no question traverses it; criterion inline on QualityResult; regulator specs as RegulatoryRecord text |
| SpecificationVersion | W11 | deferred (same) |
| ManufacturingProcess | W11 | deferred — process text appears only inside regulator letters [S09]; no question |
| ManufacturingStep | W11 | deferred |
| ManufacturingCapability | W11 | deferred → predicate HAS_CAPABILITY_STAGE (CQ-MF-04 is value 3) |
| ProductLot | W12 | kept as **Lot** |
| TestSample | W12 | merged into QualityResult (`sampleKind`) |
| TestExecution | W12 | merged into QualityResult |
| TestMethod | W12 | property (`method`, `methodRef`) |
| TestingLaboratory | W12 | merged into Organization (D7) via TESTED_BY / ISSUED_BY |
| MeasuredResult | W12 | merged into **QualityResult** |
| SpecificationCriterion | W12 | inline properties on QualityResult |
| PassFailInterpretation | W12 | verdict + verdictBasis on QualityResult; evaluated verdicts as K/D10 assessment |
| LotTestSummary | W12 | merged: kernel Source kind (`TEST_SUMMARY`) + QualityResult rows with resultBasis STATED_CONFORMS |
| CertificateOfAnalysis | W12 | merged: kernel Source kind (`COA`) + QualityResult rows; "is it a real COA" = assessment over its rows (Q-D8-05) |
| CertificationProgram | W12 | property `program`/`standard` on CertificationListing |
| CertificationListing | W12 | kept |
| CertificationScope | W12 | `scopeText` + COVERS edges with episodes |
| RegulatoryAgency | W13 | merged into Organization (D7) via ISSUED_BY |
| RegulatoryPathway | W13 | enum `RegulatoryPathway` |
| RegulatoryPathwayVersion | W13 | property `legalBasisCitation` (+ deferred: versioned pathway; OQ-L3-07) |
| RegulatoryStep | W13 | deferred |
| RegulatorySubmission | W13 | merged into **RegulatoryRecord** |
| RegulatoryResponse | W13 | merged into **RegulatoryRecord** |
| RegulatoryStatus | W13 | kept |
| OrphanDesignation | W13 | statusKind DESIGNATED |
| DrugApproval | W13 | statusKind APPROVED (+ RegulatoryRecord kind DRUG_APPLICATION) |
| RegulatoryInspection | W13 | merged into **EnforcementAction** (kind INSPECTION / FORM_483) |
| PatentFamily | W14 | property `familyId` + `familyDefinition`; deferred as node |
| Trademark | W14 | deferred — no question ≥ value 2; TSDR needs API key; brand names are D6/D7 identifiers |
| PatentApplication | W14 | merged into **Patent** (`publicationType` APPLICATION / GRANT) |
| GrantedPatent | W14 | kept as **Patent** |
| PatentClaim | W14 | deferred — claim numbers on ADJUDICATES; claim text in the snapshot; coverage analysis is an assessment |
| PatentLicense | W14 | merged into HOLDS_IP_RIGHT edge (role, episode) |
| IpRightStatus | W14 | merged into ADJUDICATES + `aggregatorStatusVerbatim` on Patent |

35 → 7 node types (6 with the fallback).

## 6. Seams and contested ownership

- **Lot** — coordinator default D8; D6 may claim it as part of the product variant / package. D8 keeps it because recall, COA, certification and counterfeit questions all join on it; D6 gets LOT_OF.
- **Organization / Facility** (D7): regulators, courts, labs, certifiers, recalling firms, licensors, suppliers are all Organizations; D8 declares no organization specializations. Organization role predicates for manufacturing/supply (CQ-MF-01) — who owns them, D7 or D8? Proposal: D7 owns the predicate vocabulary; D8 lists its questions.
- **Product / ProductVariant** (D6): STATUS_OF, ACTION_CONCERNS, RESULT_FOR, COVERS, LOT_OF targets. LNHPD shows one licence → many product names [S34]: the licence is a RegulatoryRecord RECORD_CONCERNS several Products.
- **Substance / IngredientMaterial** (D1): status subjects, patent topics, analytes.
- **Study / registration** (D3): regulator-cited trials (Q-D8-15) through the kernel citation pattern, not a D8 edge.
- **Events** (D13): an inspection, a warning letter, a recall initiation, a court decision and an authorisation are also timeline events. Proposal: D8 owns the **record** (document-backed act with legal effect); D13 owns **Event** and links to the record as its evidence. To settle with D13 (same agent, separate packet) and A1 in `11-open-questions.md`.
- **Claims and assessments** (K/D10): company characterizations (CQ-MF-03), COA classification (Q-D8-05), applicability of conditions (CQ-PF-04), licence coverage (Q-D8-21) are assessments; comparison/ranking (Q-D8-19) is a published comparison report.
- **Targets** (D5): Q-D8-18 joins products for a target to D8 negative signals. Certifiers have their own goal vocabularies ("Sleep Aid", "Build Muscle" [S12b][S40]) — map to D5 targets as data, do not model them in D8.
- **Financial interest** (D7): testers who sell competing products [S37][S20] — needed by Q-D8-06.

## 7. Open questions for the model stage (and for 11-open-questions)

1. RegulatoryStatus as a node vs status episodes on the record → subject edge. Evidence that decides: whether one status is ever produced by more than one record (NMN: NDI letters + supplemental letter + CP response → yes) — favours the node.
2. EnforcementAction separate from RegulatoryRecord (7 types) or folded (6)? Measure pairs and field counts both ways.
3. Is a court/PTAB decision a RegulatoryRecord, a D13 Event, or both?
4. Does `Lot` need `LOT_OF` to a ProductVariant (D6) or to a Product? Depends on D6's variant decision.
5. `QualityResult` identity: per (snapshot, row) means re-capturing the same COA creates duplicate results unless the kernel snapshot identity dedupes. Needs A1's identity rule.
6. Where do certifier "goal" vocabularies live (D5 mapping)?
7. Market status vs licence status for LNHPD: two properties on RegulatoryStatus or two statuses?
8. EU NMN: after the 2026 EFSA opinion, has a Commission implementing act been adopted? Not checked; needed before a fixture asserts EU status.
9. Data access: FDA Data Dashboard (inspection classifications, 483 citations) and USPTO TSDR need registered keys — owner decision whether to register (D11 readiness).
10. OPEN-QUESTIONS quality #5 (recalled, expired, counterfeit, gray-market inventory): research supports recall → EnforcementAction on Lot; counterfeit → predicate REPORTED_COUNTERFEIT on Lot/Product by a reporter with an interest; expiry → Lot.expiry property. Gray market not observed.
