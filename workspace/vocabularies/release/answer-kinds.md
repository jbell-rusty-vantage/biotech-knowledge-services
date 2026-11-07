---
id: "vocab:answer-kinds"
kind: "vocabulary"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/answer-kinds.yaml"]
aliases: ["answer-kinds","answer kinds"]
capabilities: ["get"]
cardDigest: "sha256:3de8c50709925f7b03cd10808cc4ab555c4e158f1fb369a339d97fb55bd692c9"
---
# Vocabulary answer-kinds

Release vocabulary `vocabularies/answer-kinds.yaml` (sha256 `616e1c642f89464c…`).

- **version**: 1
- **status**: synthesis-final-candidate
- **published**: 2026-10-09
- **owner**: D10 (method and per-question rulings); K (the records each kind lands in)
- **sources** (6): packets/D10/answer-kind-table.md (sections Summary, Disagreements, Shared ids, Method, Table), packets/D10/report-skeletons.md (skeleton names carried in Report.skeletonKey), packets/K/09-reasoning.md (Report skeleton minimum citation set; projection caches), fast-track/00-DIRECTIVE.md 3.5 (computed vs published comparisons), 3.6 (association / derived insight / evidence report), final/decision-r…

### kinds (4)

| value | rule | definition | record |
| --- | --- | --- | --- |
| published | R1 | BellLabs signs the payload for an audience at a time under a policy version: evidence reports, comparison reports, profiles, protocol revie… | kernel Report (reportKind: EVIDENCE_REPORT \| ANSWER \| COMPARISON \| PROFILE \| RECOMMENDATION; skeletonKey names the D10 skeleton) with D10 R… |
| assessment | R2 | The payload is a judgment that could be wrong, has a producer who answers for it, weighs named inputs and must be supersedable: synthesis,… | kernel Assessment (assessmentKind; domain detail in assessmentSubkind; status PROPOSED \| ACCEPTED \| SUPERSEDED \| WITHDRAWN) |
| materialized | R3 | The computation is expensive or graph-global (GDS over a projection, a score over thousands of assertions, a derived number reused by many… | D10 Association (pair score under a method version, associationKind), kernel CALCULATED Assertion or computed state, a derived edge (MENTIO… |
| retrieved | R4 | Otherwise: asserted facts, or a cheap deterministic computation over them under declared criteria. Every ad hoc ranking, comparison or avoi… | kernel Assertion (and the domain records and edges it authorizes), or computed rows × DecisionCriterion@version (D10) |

- **publishedVariant**: A retrieved ranking, comparison or avoid-list may also be published as a signed Report (COMPARISON, or an avoidance Report) for an audience; the default answer stays retrieved. Six rows carry a published variant (counts.publishedVariants).
- **neverAKind** (2): a plain edge between two domain entities with a confidence number (directive 3.6): an association is materialized, a derived insight is an assessment, an evidence report is published, a stored comparison or ranking that is not a published Report (directive 3.5)
- **counts**: table, rows, packets, distinctIds, sharedIds, afterR08Split, final, declaredByPackets, publishedVariants, byPacket, byAudience, byPolarity, byValue

### disagreementsAdopted (17)

| packet | id | declared | final |
| --- | --- | --- | --- |
| K | Q-K-24 | materialized | retrieved |
| K | CQ-AX-08 | materialized | retrieved |
| D1 | Q-D1-03 | materialized | retrieved |
| D1 | CQ-ST-02 | retrieved | assessment |
| D1 | Q-D1-19 | materialized | retrieved |
| D2 | Q-D2-14 | materialized | retrieved |
| D4 | Q-D4-08 | retrieved | assessment |
| D5 | Q-D5-18 | published | retrieved |
| D5 | Q-D5-25 | retrieved | assessment |
| D6 | Q-D6-03 | published | retrieved |
| D6 | Q-D6-09 | assessment | retrieved |
| D6 | CQ-AX-19 | assessment | retrieved |
| D6 | Q-D6-22 | published | retrieved |
| D7 | Q-D7-22 | materialized | retrieved |
| D8 | Q-D8-19 | published | retrieved |
| D9 | CQ-CL-07 | retrieved | assessment |
| D12 | Q-D12-08 | assessment | retrieved |


### sharedIds (5)

| id | declarations | final |
| --- | --- | --- |
| CQ-AX-08 | K materialized; D10 retrieved | retrieved |
| CQ-AX-19 | D6 assessment; D8 retrieved | retrieved |
| CQ-CL-07 | D7 assessment; D9 retrieved | assessment |
| CQ-ST-02 | D1 retrieved; D3 assessment | assessment |
| CQ-PF-03 | D6 assessment; D8 retrieved | split (R-08): CQ-PF-03a retrieved (D8), CQ-PF-03b assessment (D6) |


### otherRulings (3)

| id | final | ruling | note |
| --- | --- | --- | --- |
| Q-D11-22 | materialized | R-50 | materialized by a PROJECTION Activity; a Report{PROFILE} only when BellLabs publishes coverage |
|  | materialized | R-49 | form = projection-cache properties (methodVersion, derivedAt) on the measured node, written by a PROJECTION Activity; never an Assessment,… |
| Q-D12-20 | retrieved |  | GDS streamed per request and never written (table rule R3); OQ-D12-29 asked for retrieved and the table already says retrieved |

- **sdlEnums**: ReportKind, AssociationKind, ActivityKind
- **recordsByKind**: published, assessment, materialized, retrieved
- **replay**: an ANSWER Report carries queryDigest (digest of the read intent) for replay (K Report)
- **openItems** (2): Table freshness (D10 review open issue: 'answer-kind-table.md has not been fully re-run'): checked in this stage instead — every (packet, id) row's declared kind equals the packet's current 02-questions.md in the S worktree, no row is missing or extra (drift 0, final/_runlog/vocabularies.md). The CQ-PF-03a / CQ-PF-03b ids are not yet in any 02-questions.md (catalog stage)., R-50 asks K to edit it…
