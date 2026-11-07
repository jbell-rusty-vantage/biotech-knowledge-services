---
id: "vocab:claim-lifecycle"
kind: "vocabulary"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/claim-lifecycle.yaml"]
aliases: ["claim-lifecycle","claim lifecycle"]
capabilities: ["get"]
cardDigest: "sha256:2251ece2d3f2512b7d51b717f5139d71916d162dfde809d9097f67e29d132898"
---
# Vocabulary claim-lifecycle

Release vocabulary `vocabularies/claim-lifecycle.yaml` (sha256 `abb93b15d2242a51…`).

- **version**: 1
- **status**: synthesis-final-candidate
- **published**: 2026-10-09
- **owner**: K (records and lifecycle); D10 (evidence report skeleton d10.evidence-report@1); D9 (occurrence containers)
- **sources** (6): fast-track/00-DIRECTIVE.md 3.4, 4 (lineage spine), 4.1 (one lineage mechanism), packets/K/09-reasoning.md (claim lifecycle block; lineage spine; decision 4 minimum citation set), packets/K/02-questions.md Q-K-08, Q-K-09, Q-K-11, Q-K-19, Q-K-21, Q-K-23, Q-K-26, Q-K-27, Q-K-28, packets/D10/report-skeletons.md section 4 (d10.evidence-report@1), final/decision-report.md R-12 (mission ↔ claim link), R…

### stages (5)

| stage | record | identity | rules |
| --- | --- | --- | --- |
| claim | Claim | propositionHash = sha256 over the normalized proposition plus its structured binding (subject uid, predicate, object uid or literal, qualif… | the proposition independent of who said it; near-duplicates are separate Claims linked by an EQUIVALENCE Assessment, never merged by simila… |
| occurrence | Assertion {assertionKind: CLAIM} |  | who said it, where, with locator; carries speechAct, polarity, basisKind; claimType is required for CLAIM (verification.v1), a recommendati… |
| vetting | Assessment {assessmentKind: VETTING, disposition} |  | a vetting is an immutable, supersedable Assessment; the current one (recordedTo null, status not SUPERSEDED / WITHDRAWN) decides the state |
| evidenceMission | Activity {activityKind: EVIDENCE_MISSION, externalRunSystem: mission-control, missionId, runId} |  | its purpose is to try to disqualify the claim; a claim that survives is one that passed the test (directive 3.4), one Activity per Mission… |
| evidenceReport | Report {reportKind: EVIDENCE_REPORT, skeletonKey: d10.evidence-report@1, verdict, worldCorrectness, policyVersion, bodyDigest, bundleDigest} |  | verdict on the verification.v1 lattice plus worldCorrectness (PropertyStatus); no SURVIVED / DISQUALIFIED enum; never changes Assertion.sta… |


### lifecycleStates (6)

| value | when |
| --- | --- |
| EXTRACTED | occurrences only; no current VETTING Assessment |
| IGNORED | latest current VETTING disposition IGNORE |
| MONITORED | latest current VETTING disposition MONITOR |
| QUEUED_FOR_RESEARCH | latest current VETTING disposition RESEARCH, no EVIDENCE_MISSION Activity ASSESSES the Claim yet |
| UNDER_RESEARCH | an EVIDENCE_MISSION Activity ASSESSES the Claim and no current EVIDENCE_REPORT exists |
| REPORTED | a current EVIDENCE_REPORT Report ASSESSES the Claim |


### transitions (4)

| from | to | by |
| --- | --- | --- |
| EXTRACTED | IGNORED, MONITORED, QUEUED_FOR_RESEARCH | a VETTING Assessment (disposition) |
| IGNORED, MONITORED, QUEUED_FOR_RESEARCH | IGNORED, MONITORED, QUEUED_FOR_RESEARCH | a superseding VETTING Assessment (re-vetting, e.g. after the MONITOR trigger fires) |
| QUEUED_FOR_RESEARCH | UNDER_RESEARCH | Mission Control starts the evidence mission; its Activity ASSESSES the Claim |
| UNDER_RESEARCH | REPORTED | the mission's EVIDENCE_REPORT is published |

- **transitionsNote**: the states and their 'when' conditions are K's (09-reasoning lifecycle paragraph); the transition rows are a restatement of those conditions, not additional rules

### caches (3)

| field | enum | authority |
| --- | --- | --- |
| Claim.lifecycleState | ClaimLifecycleState | current VETTING Assessment, EVIDENCE_MISSION Activity, current EVIDENCE_REPORT |
| Claim.latestVerdict | SemanticVerdict | the latest published EVIDENCE_REPORT's verdict |
| Claim.refinesClaimUid |  | the accepted EQUIVALENCE Assessment with conclusionCode REFINES |

- **cacheRule**: a cache is maintained by the lifecycle projection in the authority's transaction; answers cite the authority, not the cache (R-45)
- **sdlEnums**: ClaimLifecycleState, ClaimDisposition, ActivityKind, AssessmentStatus, ReportKind, AssertionKind, SpeechAct, ClaimType, ReportSectionKind
- **assessmentKindsUsed**: VETTING, EVIDENCE_SYNTHESIS, EQUIVALENCE, RETELLING_FIDELITY, CONFLICT_RELEVANCE
- **relationshipTypesUsed** (9): OCCURRENCE_OF, ASSERTED_BY, HAS_EVIDENCE, OCCURS_IN, ASSESSES, WAS_GENERATED_BY, WAS_INFORMED_BY, DERIVED_FROM, HAS_SUBJECT
- **nodeTypesUsed** (9): Claim, Assertion, Assessment, Adjudication, Activity, Report, ReportItem, SourceLocator, MediaWork
- **questions**: Q-K-08, Q-K-09, Q-K-11, Q-K-19, Q-K-26, Q-K-27, Q-K-28
- **answerKindsNote**: kinds from packets/D10/answer-kind-table.md (final = D10 ruling, R-50); see answer-kinds.yaml
- **openItems** (1): R-12 asks the owner to confirm the reading of directive 4.1 (the EVIDENCE_MISSION Activity ASSESSES exactly one Claim); owner decision.
