---
id: "vocab:verdict-lattice"
kind: "vocabulary"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/verdict-lattice.yaml"]
aliases: ["verdict-lattice","verdict lattice"]
capabilities: ["get"]
cardDigest: "sha256:743ac79b48642e3f8d5fea209edd5f6ed7cdaa5c689311515c31b423e60298c6"
---
# Vocabulary verdict-lattice

Release vocabulary `vocabularies/verdict-lattice.yaml` (sha256 `2641fb13db4ed30f…`).

- **version**: 1
- **status**: synthesis-final-candidate
- **published**: 2026-10-09
- **owner**: K
- **sources** (6): packets/K/09-reasoning.md (verification.v1 correspondence table; decision 2 "Verdict → Assertion.status"; claim lifecycle), packets/K/04-schema-proposal.graphql → final/schema/kernel.graphql (Adjudication, Assertion, Assessment, Report, Claim), schema/program/PLAN.md 6.2 (the starting mapping), fast-track/00-DIRECTIVE.md 3.4, 3.8, 3.10, final/decision-report.md R-22 (projection gate), R-31 (third…

### verdicts (15)

| value | v1 | group | infrastructure |
| --- | --- | --- | --- |
| PENDING_SEMANTIC_REVIEW | pending_semantic_review | pending |  |
| DIRECTLY_SUPPORTED | directly_supported | supported |  |
| SUPPORTED_WITH_QUALIFICATION | supported_with_qualification | supported |  |
| PARTIALLY_SUPPORTED | partially_supported | contested |  |
| CONTEXT_ONLY | context_only | not_supported |  |
| CONTRADICTED | contradicted | not_supported |  |
| MIXED_OR_CONFLICTING | mixed_or_conflicting | contested |  |
| NOT_SUPPORTED | not_supported | not_supported |  |
| INSUFFICIENT_EVIDENCE | insufficient_evidence | unresolved |  |
| UNVERIFIABLE | unverifiable | unresolved |  |
| SOURCE_UNAVAILABLE | source_unavailable | unresolved | true |
| LOCATOR_ERROR | locator_error | unresolved | true |
| PARSER_ERROR | parser_error | unresolved | true |
| DERIVED_VERIFIED | derived_verified | supported |  |
| DERIVED_FAILED | derived_failed | not_supported |  |

- **groups**: supported, contested, not_supported, unresolved, pending
- **derivedRule**: derived numbers are Assertion {basisKind: CALCULATED, derivationRule} with DERIVED_FROM inputs; their verdicts are DERIVED_VERIFIED / DERIVED_FAILED (K)
- **order**: No total order of the 15 values is published. R-22 says one asserted-edge episode is authorized by the asserter's "highest-verdict current Assertion"; until K publishes an order, read the groups as supported > contested > not_supported, with unresolved and pending never authorizing (open item 1).

### carriers (4)

| field | required | meaning |
| --- | --- | --- |
| Adjudication.verdict | true | one verification.v1 judgment about one Assertion; kind CAPTURE_FIDELITY or SUPPORT (Adjudication.adjudicationKind) |
| Assessment.verdict | false | when a BellLabs assessment judges support of a proposition |
| Report.verdict | false | EVIDENCE_REPORT only: the lattice verdict on the exact Claim it ASSESSES (its propositionHash), after the evidence mission tried to disqual… |
| Claim.latestVerdict | false | projection cache of the latest published evidence report's verdict; authority = the Report (R-45) |

- **notStored** (3): a verdict is never an edge (K: 'verdict | Adjudication.verdict and Report.verdict | record | … | an edge'), no SURVIVED / DISQUALIFIED enum: the lattice plus worldCorrectness is the evidence report vocabulary (R-32), a third party's verdict (ClaimReview, regulator finding) is an Assertion with predicate RATES_CLAIM by that party (rating in valueString, scale in qualifiers), never an Adjudication…
- **adjudicationKinds**: CAPTURE_FIDELITY, SUPPORT

### policyOutcomes (5)

| value | v1 |
| --- | --- |
| PASS | pass |
| PASS_WITH_WARNINGS | pass_with_warnings |
| REVIEW | review |
| FAIL | fail |
| ABSTAIN | abstain |

- **captureFidelityMapping**: columns, rows, heldMeans
- **assertionStatus**: EXTRACTED, PROPOSED, ACCEPTED, REJECTED, DISPUTED, SUPERSEDED, UNRESOLVED
- **humanDecision**: AFFIRM, DEFER, REJECT, decisionProvenance
- **toolRendition**: whether evidence from a tool rendition alone can reach ACCEPTED is an owner decision (R-36, proposed: PASS_WITH_WARNINGS and flagged only where a CaptureAttempt records that issuer-byte capture is impossible; otherwise held at PROPOSED until a RAW_BYTES or CANONICAL_PROJECTION sibling exists)
- **propertyStatus** (4): SATISFIED, NOT_SATISFIED, UNKNOWN, NOT_ASSESSED

### orthogonalProperties (6)

| field | v1 |
| --- | --- |
| Adjudication.evidenceSupport | evidenceSupport |
| Adjudication.worldCorrectness | worldCorrectness |
| Adjudication.attributionFaithfulness | attributionFaithfulness |
| Adjudication.sourceAuthority | sourceAuthority |
| Adjudication.provenanceIntegrity | provenanceIntegrity |
| Report.worldCorrectness | Judgment.properties.worldCorrectness of the judged Claim (EVIDENCE_REPORT; beside the lattice verdict) |

- **mechanicalStatus**: field, sdlType, values
- **judgeKinds** (6): DETERMINISTIC, NLI, LLM, HUMAN, POLICY, STATISTICAL
- **evidenceEdge**: role, origin, authority, independence, facet, rule
- **verificationRun**: no VerificationRun node: a verification run is an Activity (activityKind VERIFICATION, externalRunSystem ks-verification, bundleDigest, policyVersion, policyOutcome); each judgment is an Adjudication WAS_GENERATED_BY it (K decision 1)
- **operationState**: KS operation state (queued, running, needs_review, quarantined, succeeded, failed, cancelled) is not in the graph; the Activity carries admission (policyOutcome) and times only (K)
- **projectionGate**: rule, admittingVerdicts, corroboration, temporalWording
- **denial**: a denial of a goal effect is NO_EFFECT_ON_TARGET or a SUPPORT Adjudication with CONTRADICTED (HAS_EVIDENCE role CONTRADICTS) against the original claim, never a NEGATIVE copy of IMPROVES_TARGET (targets.yaml polarityRule)
- **readingDefault**: answers that list facts read Assertion.status IN [ACCEPTED, DISPUTED] (targets.yaml QP-TARGET-01)
- **sdlEnums**: SemanticVerdict, PolicyOutcome, AssertionStatus, AdjudicationKind, AdjudicationDecision, PropertyStatus, JudgeKind, EvidenceRole, EvidenceOrigin, EvidenceAuthority, EvidenceIndependence, EvidenceFacet
- **openItems** (5): 1. No published total order of verdicts; R-22's 'highest-verdict current Assertion' needs one (owner: K)., 2. Effect of a human REJECT on a held Assertion is not stated in K 09-reasoning (owner: K; the mapping suggests REJECTED, not adopted here)., 3. RATES_CLAIM rating-scale → lattice mapping values (R-31; K 11-OQ 14; owner)., 4. R-36 tool-rendition evidence policy (owner decision)., 5. Assertio…
