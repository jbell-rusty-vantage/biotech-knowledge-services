# Named patterns, evidence and temporal rules (schema v2)

| name | pattern | route |
| --- | --- | --- |
| P-01 provenance trace | `(a:Assertion)-[e:HAS_EVIDENCE {role, origin}]->(l:SourceLocator)<-[:HAS_LOCATOR]-(s:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)`; `(adj:Adjudication)-[:ASSESSES]->(a)`; `(a)-[:ASSERTED_BY]->(asserter)`; `(a)-[:WAS_GENERATED_BY]->(act:Activity {runId})` | typed `assertion` / `evidence`; templates QP/P-01a..c |
| claim occurrences | `(occ:Assertion {assertionKind: 'CLAIM'})-[:OCCURRENCE_OF]->(c:Claim)`; retellings `basisKind: CITED_FROM_PRIOR_WORK` + `DERIVED_FROM` the primary occurrence | typed `assertion {about: claim subject}`; D9 CQ-CL-* templates |
| versioned state | `(pkg:Package)-[r:HAS_LABEL_VERSION {relationshipUid, assertionUid, validFrom, validTo, recordedFrom, recordedTo}]->(lv:LabelVersion)` (exclusive per (subject, slot, asserter)) | typed `history`; D6 templates |
| identifier chain | `(x)-[h:HAS_IDENTIFIER {recordedTo: null, isPrimary}]->(i:Identifier {scheme, issuer, value})` | typed `resolve` with `identifierChain`; D1/CQ-ID-04, D11/CQ-PV-05 |
| lineage | `(n)-[:WAS_GENERATED_BY]->(act:Activity {externalRunSystem, runId, missionId})`; `(act)-[:WAS_INFORMED_BY]->(prev)`; mission `(act {activityKind: 'EVIDENCE_MISSION'})-[:ASSESSES]->(claim)` | QP/P-10*; typed `assertion.generatedBy` (scope internal: Activities are INTERNAL) |
| report | `(r:Report)-[:ASSESSES]->(about)`, `-[:DERIVED_FROM]->(Assertion|Assessment)`, `-[:HAS_EVIDENCE]->(SourceLocator)`, `-[:HAS_ITEM]->(ReportItem)` | typed `report`; K/Q-K-17, QP/P-05c |
| status | `(ls:LegalStatus)-[:STATUS_OF]->(x)`, `(ls)-[:STATUS_FROM]->(record)` | typed `status` (non-implication attached) |
| predicate-only fact | an Assertion with `predicate` and HAS_SUBJECT / HAS_OBJECT and no typed edge (e.g. ACTIVATES, SUPPLIES_MATERIAL) | typed `assertion {about, predicate}`; never search for a relationship of that name |
| inverse edge | edges are stored in their register direction only (e.g. Package -> LabelVersion); read the other way with `direction: IN` | typed `neighbors` |

Evidence rules: `status` is capture fidelity (EXTRACTED captured/unadjudicated, PROPOSED held, ACCEPTED faithful to
its span, SUPERSEDED replaced by the same asserter). Support is a SUPPORT Adjudication verdict, never `status`.
Two asserters that disagree stay two current assertions; do not rank them. A HAS_EVIDENCE edge with
`origin: VERIFIER_FOUND` came from verification, `DECLARED` from the extractor. `evidenceState` HISTORICAL / REVISED
means a later capture exists or records a retraction / erratum: cite the version you used.

Temporal rules: recorded time (`recordedAt` / `recordedFrom` .. `recordedTo`) is when the graph knew; valid time
(`validFrom` .. `validTo`, half-open) is when it held in the world; they are independent. A null valid bound is
unknown, never "still true". `recordedAsOf` replays what the graph recorded then; it is not a historical snapshot of
the database (Neo4j reads are read committed); historical replay of an earlier answer reads its retained snapshot.

Status non-implication (rules/projection-rules.yaml PR-01, MD-D10-05): a licence is not market presence; a patent is
not approval, marketing or efficacy; an EFSA opinion is not an EU authorization; approval for one indication or
jurisdiction is not approval for another; a registration / listing / notice is not approval; absence of market
presence is not licence revocation.
