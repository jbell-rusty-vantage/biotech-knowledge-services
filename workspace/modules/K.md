---
id: "mod:K"
kind: "module"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql","release:sdl/assembled.manifest.json"]
aliases: ["k","frag:k","kernel: evidence, identity, time, lineage","frag:W00","frag:W10","frag:W19","frag:W20","frag:W21","frag:W23"]
capabilities: ["get","slice"]
cardDigest: "sha256:f71407aaa20ceed2d8c3d30836a1d50ce641b58aeb201dccb4ef3acc85f8ed3e"
---
# Module K: kernel: evidence, identity, time, lineage

| | |
| --- | --- |
| id | `mod:K` (v1 id `frag:K`) |
| owner | kernel |
| domain | [Kernel, identity, time and provenance](../domains/kernel-and-provenance.md) |
| source | `release:sdl/modules/kernel.graphql` (sha256 `12f13a6d3b4cfee4…`), assembled lines 5–1285 |
| definitions | 53 |
| questions | 35 (23 supported, 12 held, 0 unsupported) — [question set](../patterns/questions/K.md) |

Membership comes from the release assembly manifest (`sdl/assembled.manifest.json`), not from banner names.

## Node types (11)

| type | uid token | executor ops | summary |
| --- | --- | --- | --- |
| [Activity](../nodes/Activity.md) | `hu:activity:` | create, update | Purpose: the single lineage spine (00-DIRECTIVE 4). |
| [Adjudication](../nodes/Adjudication.md) | `hu:adjudication:` | close, create | Purpose: one verification.v1 judgment about one Assertion, immutable (a re-review is a new node naming `supersedesUid`). |
| [Agent](../nodes/Agent.md) | `hu:agent:` | create | Purpose: a software or human-operated agent identity (executor, extraction model + prompt + skill, verifier, analyst seat). |
| [Assertion](../nodes/Assertion.md) | `hu:assertion:` | close, create | Purpose: one attributable proposition (verification.v1 Assertion): exactly one subject, exactly one object or one typed literal, exactly on… |
| [Assessment](../nodes/Assessment.md) | `hu:assessment:` | close, create | Purpose: an immutable, versioned, supersedable judgment asserted by an agent or analyst with named inputs (PLAN 6.1 "assessment"): claim ve… |
| [Claim](../nodes/Claim.md) | `hu:claim:` | create, update | Purpose: the proposition itself, independent of who said it (00-DIRECTIVE 3.4): the unit that is vetted, monitored, researched and reported… |
| [Identifier](../nodes/Identifier.md) | `hu:identifier:` | create | Purpose: an external identifier string with scheme and issuer (PMID, DOI, NCT, UNII, CAS, GTIN, LOINC, ...; the scheme register is packets/… |
| [Report](../nodes/Report.md) | `hu:report:` | close, create | Purpose: the in-graph skeleton of a published artifact (PLAN 6.1): evidence report (the outcome of an evidence mission, with the verificati… |
| [Source](../nodes/Source.md) | `hu:source:` | create, update | Purpose: stable identity of one retrieval endpoint (one normalized canonicalUri): a page, registry record, PDF, API record, feed item or me… |
| [SourceLocator](../nodes/SourceLocator.md) | `hu:locator:` | create | Purpose: reproducible selector for the exact span, cell, page region, JSON pointer or media time range of one SourceSnapshot (verification.… |
| [SourceSnapshot](../nodes/SourceSnapshot.md) | `hu:snapshot:` | create | Purpose: immutable capture of a Source at a retrieval time (verification.v1 VerificationSourceCapture): the bytes that every claim must tra… |

## Relationship types owned (15)

| type | class | temporal | endpoints |
| --- | --- | --- | --- |
| [ASSERTED_BY](../relationships/ASSERTED_BY.md) | structural | recorded-only | Assertion → Subjectable |
| [ASSESSES](../relationships/ASSESSES.md) | structural | recorded-only | Adjudication\|Assessment\|Report\|Activity\|ReportItem → Assertion\|Subjectable |
| [DERIVED_FROM](../relationships/DERIVED_FROM.md) | structural | recorded-only | Assertion\|Assessment\|Report\|ReportItem\|Association → Assertion\|Assessment |
| [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | structural | recorded-only | Assertion\|Adjudication\|Assessment\|Report → SourceLocator |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) | asserted | episode | Subjectable → Identifier |
| [HAS_LOCATOR](../relationships/HAS_LOCATOR.md) | structural | recorded-only | SourceSnapshot → SourceLocator |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) | structural | recorded-only | Assertion → Subjectable |
| [HAS_SNAPSHOT](../relationships/HAS_SNAPSHOT.md) | structural | recorded-only | Source → SourceSnapshot |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) | structural | recorded-only | Assertion → Subjectable |
| [MENTIONS](../relationships/MENTIONS.md) | derived | recorded-only | Chunk → Subjectable |
| [OCCURRENCE_OF](../relationships/OCCURRENCE_OF.md) | structural | recorded-only | Assertion → Claim |
| [RENDITION_OF](../relationships/RENDITION_OF.md) | asserted | recorded-only | Source → Publication\|MediaWork |
| [WAS_ASSOCIATED_WITH](../relationships/WAS_ASSOCIATED_WITH.md) | structural | recorded-only | Activity → Agent |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) | structural | recorded-only | Assertion\|Adjudication\|Assessment\|Report\|Entity → Activity |
| [WAS_INFORMED_BY](../relationships/WAS_INFORMED_BY.md) | structural | recorded-only | Activity → Activity |

## Predicates registered (10)

[CITES_AS_SUPPORT](../predicates/CITES_AS_SUPPORT.md), [CORRECTS](../predicates/CORRECTS.md), [DISCLOSES_INTERESTS_OF](../predicates/DISCLOSES_INTERESTS_OF.md), [DOCUMENT_DATE_INCONSISTENT](../predicates/DOCUMENT_DATE_INCONSISTENT.md), [FIELD_NOT_REPORTED](../predicates/FIELD_NOT_REPORTED.md), [HAS_CREDENTIAL](../predicates/HAS_CREDENTIAL.md), [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md), [HAS_REVISION_STATUS](../predicates/HAS_REVISION_STATUS.md), [RATES_CLAIM](../predicates/RATES_CLAIM.md), [RECORD_LAST_UPDATED](../predicates/RECORD_LAST_UPDATED.md)

## Other definitions

- Interfaces: [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md)
- Unions: (none)
- Edge-property types: [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md), [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md), [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md), [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md), [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md), [EvidenceEdgeProperties](../edge-properties/EvidenceEdgeProperties.md)
- Enums: [PrivacyClass](../vocabularies/PrivacyClass.md), [TimePrecision](../vocabularies/TimePrecision.md), [ValidTimeBasis](../vocabularies/ValidTimeBasis.md), [AssertionStatus](../vocabularies/AssertionStatus.md), [AssertionKind](../vocabularies/AssertionKind.md), [ClaimType](../vocabularies/ClaimType.md), [Polarity](../vocabularies/Polarity.md), [SpeechAct](../vocabularies/SpeechAct.md), [BasisKind](../vocabularies/BasisKind.md), [SemanticVerdict](../vocabularies/SemanticVerdict.md), [PolicyOutcome](../vocabularies/PolicyOutcome.md), [AdjudicationKind](../vocabularies/AdjudicationKind.md), [JudgeKind](../vocabularies/JudgeKind.md), [PropertyStatus](../vocabularies/PropertyStatus.md), [AdjudicationDecision](../vocabularies/AdjudicationDecision.md), [EvidenceRole](../vocabularies/EvidenceRole.md), [EvidenceOrigin](../vocabularies/EvidenceOrigin.md), [EvidenceAuthority](../vocabularies/EvidenceAuthority.md), [EvidenceIndependence](../vocabularies/EvidenceIndependence.md), [EvidenceFacet](../vocabularies/EvidenceFacet.md), [CertaintyLevel](../vocabularies/CertaintyLevel.md), [SelectorKind](../vocabularies/SelectorKind.md), [SourceKind](../vocabularies/SourceKind.md), [SourceRevisionKind](../vocabularies/SourceRevisionKind.md), [ActivityKind](../vocabularies/ActivityKind.md), [AgentKind](../vocabularies/AgentKind.md), [AssessmentKind](../vocabularies/AssessmentKind.md), [AssessmentStatus](../vocabularies/AssessmentStatus.md), [ClaimDisposition](../vocabularies/ClaimDisposition.md), [ClaimLifecycleState](../vocabularies/ClaimLifecycleState.md), [EffectDirection](../vocabularies/EffectDirection.md), [ReportKind](../vocabularies/ReportKind.md), [RunSealKind](../vocabularies/RunSealKind.md), [UseDisposition](../vocabularies/UseDisposition.md)

## Templates (12)

- [K/CQ-AX-04](../patterns/K/CQ-AX-04.md) (supported)
- [K/Q-K-09](../patterns/K/Q-K-09.md) (supported)
- [K/Q-K-10#1](../patterns/K/Q-K-10--1.md) (supported)
- [K/Q-K-10#2](../patterns/K/Q-K-10--2.md) (supported)
- [K/Q-K-11](../patterns/K/Q-K-11.md) (supported)
- [K/Q-K-12#carrier](../patterns/K/Q-K-12--carrier.md) (supported)
- [K/Q-K-12#identifiers](../patterns/K/Q-K-12--identifiers.md) (supported)
- [K/Q-K-15](../patterns/K/Q-K-15.md) (supported)
- [K/Q-K-17](../patterns/K/Q-K-17.md) (supported)
- [K/Q-K-21](../patterns/K/Q-K-21.md) (supported)
- [K/Q-K-22](../patterns/K/Q-K-22.md) (supported)
- [K/Q-K-23](../patterns/K/Q-K-23.md) (supported)
