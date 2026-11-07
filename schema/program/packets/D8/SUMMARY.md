# D8 — summary: manufacturing, quality, regulation and IP

Agent A7, fast-track run, 2026-10-08 (check stage; revised after the adversarial review). Research only, not medical or legal advice.

## What the domain is

D8 answers the investor's three questions about a biotech or longevity product: **is it real** (does the lot contain what the label says, and is the COA an actual measurement), **is it lawful** (what standing it has in which jurisdiction, by which agency act, and whether it was recalled or warned), and **who owns the rights** (patents, assignees, licensees, claims held invalid). Almost every D8 fact is a dated record from one issuer with a fixed scope. The main harm is reading more into a record than it says: a GRAS "no questions" letter read as approval, a "quantity by input" COA row read as a test, an "Active" patent read as protection after its asserted claims were held invalid. So scope lives in enums, never in a good/bad flag, and the four facts that change over time are bitemporal episodes.

Six node types: **RegulatoryRecord** (every authority act, including enforcement and court decisions), **LegalStatus** (one standing of one subject; valid time on the STATUS_OF episode, basis via STATUS_FROM → record), **Lot** (the join key for "is the thing I hold recalled or certified"), **QualityResult** (one reported row with `resultBasis` MEASURED / INPUT_VERIFIED / IN_PROCESS_CONTROL / STATED_WITHOUT_VALUE), **CertificationListing** (what a certifier covers, and when, through COVERS episodes) and **Patent** (ASSIGNED_TO and LICENSED_TO episodes). D8 also owns the regulatory-pathway vocabulary (approval routes and designation programmes) for the assembled schema, and reaches D4 devices (recalls, clearances).

## Headline counts (`node scripts/packet-check.mjs D8` → ok: true)

| measure | D8 | budget |
| --- | ---: | ---: |
| node types | 6 | 8 |
| relationship types | 11 | 14 |
| from→to pairs | 29 | 35 |
| widest union | 5 | 6 |
| questions (harm/risk/disconfirmation) | 33 (22) | 15–40 (≥ 1/3) |
| fixtures (assertions; locators re-selected from bytes) | 6 (91; 127/127) | ≥ 3 |
| marginal print vs current kernel + 7 stubs | +154,347 B, +116 input types, builds in 1–2 s | — |

Four edges carry bitemporal episodes (AssertedEdgeProperties): STATUS_OF, COVERS, ASSIGNED_TO and LICENSED_TO. The other seven are recorded-only and use the kernel's AssertedRecordedProperties. None of the 35 pinned W11–W14 types survives unchanged. Adversarial-review revision: RESULT_FOR renamed QUALITY_RESULT_FOR (D3 owns RESULT_FOR); D4 Device replaced Patent in the record-topic union and joined the status-subject union (new Q-D8-23); Organization left COVERS; 37 non-filter properties made non-filterable (−26 KB).

## Five highest-value questions

1. **CQ-MF-02 / Q-D8-01**: what regulatory standing X holds in jurisdiction J at date D, from which agency record, and what the graph would have answered then as recorded then. Fixture: NMN excluded on 2022-10-11, no longer excluded from 2025-09-29, replayed in two intents.
2. **CQ-AX-23**: is X "approved"? The answer states what the record is and what it is not (a no-questions letter, an NDI on file or an EFSA opinion is not an approval).
3. **Q-D8-04**: is the lot I hold recalled, at what class and for what reason? Fixture: Imu-Tek recall H-0483-2026, lot 216, Class II, undeclared milk.
4. **Q-D8-05**: is this "certificate of analysis" a measurement? Fixture: a Eurofins-issued "Certificate of Analysis" whose two result rows both read "Quantity by Input" (batch-record review).
5. **Q-D8-12**: has any claim of patent P been adjudicated, and is an "Active" status misleading? Fixture: claims 1–3 of US 8,197,807 held invalid (CAFC 22-1116, 2023-02-13) while the aggregator shows "Active".

## Three biggest cuts

1. **W12 quality chain, 13 pinned types → 3 (Lot, QualityResult, CertificationListing).** TestSample, TestExecution, TestMethod, MeasuredResult, SpecificationCriterion, PassFailInterpretation, CertificateOfAnalysis and LotTestSummary collapse into one QualityResult row. A COA is a kernel Source; "is it a real COA" is a kernel Assessment.
2. **W13 pathway graph, 10 → 2.** RegulatoryPathway, PathwayVersion and RegulatoryStep become an enum and a citation string. Submission, response, inspection and EnforcementAction fold into RegulatoryRecord; RegulatoryStatus, DrugApproval and OrphanDesignation fold into LegalStatus. The EnforcementAction fold alone saves 28 KB and 14 input types.
3. **W11 manufacturing (5 → 0), plus PatentFamily, PatentClaim, PatentLicense and Trademark.** Manufacturer, supplier and capability roles stay `Assertion.predicate` values (D8 owns no type at either end). Claim numbers sit on LegalStatus; licences are LICENSED_TO episodes.

## Three biggest risks

1. **Identity across records.** The warning letter and the recall name the same firm's products differently (OQ-D8-25), and ChromaDex is now Niagen Bioscience (OQ-D8-26). Without D6/D7 equivalence assessments, a lot or patent question can miss a record.
2. **The "is not" table lives in the answer layer.** An agent that reads `statusKind` without it can still turn NO_QUESTIONS into "approved" (OQ-D8-10 proposes making the table a D10 answer-policy rule).
3. **Seam follow-through and data access.** Siblings must apply this revision's renames and removals: D6 and D12 rename RESULT_FOR (OQ-D8-30), D7 drops COVERS → Organization, D4 declares its Device rows, D13 adopts D8's pathway vocabulary (OQ-D8-02). Six union pairs have no D8 fixture yet (OQ-D8-32). FDA Data Dashboard and USPTO access are unresolved (OQ-D8-21), so Facility and Trademark stay deferred.
