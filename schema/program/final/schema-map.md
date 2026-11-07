# Schema map

Rendered from the pinned SDL (digest `sha256:c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793`) by the schema map renderer 0.1.0. Deterministic: no timestamps; regenerate with `pnpm schema:map`.

How to read an edge row: `(From)-[:TYPE]->(To)` is the stored direction. A target written as `(Name ∪N)` is a GraphQL union with N concrete members; `(Name ◇N)` is an interface with N implementers; the members are listed in the union/interface appendix. The executable schema expands every union or interface target into one input/filter family per concrete member, so the "pairs" figure, not the field count, is what the generated API grows with.

## Totals

| measure | count |
| --- | ---: |
| node types | 69 |
| interfaces | 2 |
| relationship fields declared on node types | 148 |
| distinct relationship types | 106 |
| from→to pairs after union/interface expansion | 848 |
| edge property profiles | 20 |
| unions | 16 |
| enums | 193 |
| domains | 14 |

## Executable growth: relationship types by from→to pairs

Each pair is one concrete (from, to) combination the library generates nested create/connect/disconnect/delete/update inputs and filters for. Sorted descending; `union` names the widest union or interface among the declaring fields.

| # | relationship type | class | pairs | cumulative share | declaring fields | widest target | fragments |
| ---: | --- | --- | ---: | ---: | ---: | --- | --- |
| 1 | ASSESSES | structural | 225 | 26.5% | 8 | Subjectable (56) | D10 K |
| 2 | WAS_GENERATED_BY | structural | 69 | 34.7% | 5 | Entity (69) | K |
| 3 | ASSERTED_BY | structural | 56 | 41.3% | 1 | Subjectable (56) | K |
| 4 | ASSOCIATES | derived | 56 | 47.9% | 1 | Subjectable (56) | D10 |
| 5 | HAS_IDENTIFIER | asserted | 56 | 54.5% | 1 | Subjectable (56) | K |
| 6 | HAS_OBJECT | structural | 56 | 61.1% | 1 | Subjectable (56) | K |
| 7 | HAS_SUBJECT | structural | 56 | 67.7% | 1 | Subjectable (56) | K |
| 8 | MENTIONS | derived | 56 | 74.3% | 1 | Subjectable (56) | D9 |
| 9 | STEP_USES | structural | 56 | 80.9% | 1 | Subjectable (56) | D5 |
| 10 | DERIVED_FROM | structural | 8 | 81.8% | 8 | — | D10 K |
| 11 | STATED_IN | asserted | 8 | 82.8% | 4 | StatingRecord (2) | D3 |
| 12 | ADMINISTERS | asserted | 5 | 83.4% | 1 | AdministeredMaterial (5) | D3 |
| 13 | CONCERNS | asserted | 5 | 84% | 2 | RegulatoryRecordTopic (4) | D8 |
| 14 | HAS_EVIDENCE | structural | 4 | 84.4% | 4 | — | K |
| 15 | MEASURES | derived | 4 | 84.9% | 1 | OutcomeMeasureTarget (4) | D3 |
| 16 | OPERATIONALIZED_BY | asserted | 4 | 85.4% | 1 | TargetMeasure (4) | D5 |
| 17 | STATUS_OF | asserted | 4 | 85.8% | 1 | LegalStatusSubject (4) | D8 |
| 18 | COVERS | asserted | 3 | 86.2% | 1 | CertificationCoverageTarget (3) | D8 |
| 19 | DECLARES_COMPONENT | asserted | 3 | 86.6% | 1 | DeclaredComponentTarget (3) | D6 |
| 20 | EXPOSED_TO | structural | 3 | 86.9% | 1 | ContextExposure (3) | D2 |
| 21 | HAS_STUDY_ROLE | asserted | 3 | 87.3% | 1 | StudyParty (3) | D3 |
| 22 | ISSUED_BY | asserted | 3 | 87.6% | 3 | — | D8 |
| 23 | MEASURES_ANALYTE | asserted | 3 | 88% | 1 | QualityAnalyte (3) | D8 |
| 24 | PATTERN_COMPONENT | asserted | 3 | 88.3% | 1 | PatternComponentTarget (3) | D12 |
| 25 | AFFECTS_MECHANISM | derived | 2 | 88.6% | 1 | MechanismModulator (2) | D2 |
| 26 | AWARDED_TO | asserted | 2 | 88.8% | 2 | — | D7 |
| 27 | BLOCKED_BY | structural | 2 | 89% | 2 | — | D10 |
| 28 | CONTENT_SPONSORED_BY | asserted | 2 | 89.3% | 1 | ContentSponsor (2) | D9 |
| 29 | DELIVERS | asserted | 2 | 89.5% | 2 | — | D4 |
| 30 | FOOD_CONTAINS | asserted | 2 | 89.7% | 1 | FoodComponentTarget (2) | D12 |
| 31 | HAS_ANALYTE | structural | 2 | 90% | 2 | — | D4 |
| 32 | HOLDS_STAKE | asserted | 2 | 90.2% | 2 | — | D7 |
| 33 | IN_FOOD_CATEGORY | asserted | 2 | 90.4% | 2 | — | D12 |
| 34 | INTERVAL_FOR | structural | 2 | 90.7% | 2 | — | D4 |
| 35 | INVOLVES | asserted | 2 | 90.9% | 2 | — | D13 |
| 36 | LOT_OF | asserted | 2 | 91.2% | 1 | LotOfTarget (2) | D8 |
| 37 | MATERIAL_CONTAINS | asserted | 2 | 91.4% | 2 | — | D1 |
| 38 | ON_FRONTIER | asserted | 2 | 91.6% | 2 | — | D13 |
| 39 | PARTICIPATES_IN | asserted | 2 | 91.9% | 2 | — | D2 |
| 40 | PERFORMED_WITH_VERSION | asserted | 2 | 92.1% | 2 | — | D4 |
| | … 66 more types | | 67 | 100% | | | |

## Executable growth: unions and interfaces used as relationship targets

| target | kind | members | relationship fields targeting it | pairs contributed |
| --- | --- | ---: | ---: | ---: |
| Subjectable | interface | 56 | 11 | 616 |
| Entity | interface | 69 | 1 | 69 |
| StatingRecord | union | 2 | 4 | 8 |
| AdministeredMaterial | union | 5 | 1 | 5 |
| LegalStatusSubject | union | 4 | 1 | 4 |
| OutcomeMeasureTarget | union | 4 | 1 | 4 |
| RegulatoryRecordTopic | union | 4 | 1 | 4 |
| TargetMeasure | union | 4 | 1 | 4 |
| CertificationCoverageTarget | union | 3 | 1 | 3 |
| ContextExposure | union | 3 | 1 | 3 |
| DeclaredComponentTarget | union | 3 | 1 | 3 |
| PatternComponentTarget | union | 3 | 1 | 3 |
| QualityAnalyte | union | 3 | 1 | 3 |
| StudyParty | union | 3 | 1 | 3 |
| ContentSponsor | union | 2 | 1 | 2 |
| FoodComponentTarget | union | 2 | 1 | 2 |
| LotOfTarget | union | 2 | 1 | 2 |
| MechanismModulator | union | 2 | 1 | 2 |

## Hubs: node types by declared relationship fields

| node type | domain | relationship fields | incoming (from other types) | properties |
| --- | --- | ---: | ---: | ---: |
| Assertion | K | 8 | 10 | 36 |
| Event | D13 | 6 | 12 | 38 |
| ReportItem | D10 | 6 | 1 | 21 |
| Study | D3 | 6 | 14 | 17 |
| Assessment | K | 5 | 5 | 27 |
| LabTest | D4 | 5 | 12 | 13 |
| MediaWork | D9 | 5 | 12 | 18 |
| Report | K | 5 | 4 | 28 |
| Activity | K | 4 | 4 | 23 |
| AlgorithmVersion | D4 | 4 | 13 | 20 |
| IngredientMaterial | D1 | 4 | 18 | 19 |
| Adjudication | K | 3 | 2 | 27 |
| Award | D7 | 3 | 13 | 15 |
| Biomarker | D4 | 3 | 15 | 10 |
| Chunk | D9 | 3 | 1 | 26 |
| Claim | K | 3 | 13 | 20 |
| FoodItem | D12 | 3 | 15 | 18 |
| Mechanism | D2 | 3 | 14 | 13 |
| MechanismEvidenceContext | D2 | 3 | 1 | 26 |
| Patent | D8 | 3 | 13 | 20 |
| Person | D7 | 3 | 16 | 13 |
| Publication | D3 | 3 | 16 | 16 |
| QualityResult | D8 | 3 | 12 | 29 |
| RegulatoryRecord | D8 | 3 | 14 | 32 |
| StudyResult | D3 | 3 | 12 | 34 |
| Association | D10 | 2 | 1 | 22 |
| CertificationListing | D8 | 2 | 12 | 15 |
| ChemicalSubstance | D1 | 2 | 23 | 12 |
| LabelVersion | D6 | 2 | 13 | 29 |
| LegalStatus | D8 | 2 | 12 | 14 |

## Domain seams

Count of declared relationship fields on node types of the row domain whose concrete targets include a node type of the column domain (a union field counts once per target domain). The diagonal is the domain's internal edges.

| from \ to | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | D10 | D11 | D12 | D13 | D14 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| D1 K | 32 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 1 | 8 | 8 |
| D2 D1 | · | 7 | · | · | · | · | · | · | · | · | · | · | · | · |
| D3 D2 | 1 | 3 | 2 | 1 | · | 2 | · | · | · | · | · | · | · | · |
| D4 D3 | 1 | 1 | 2 | 13 | 1 | 1 | 1 | 1 | · | · | · | · | 1 | · |
| D5 D4 | · | 1 | 2 | · | 11 | · | 2 | 1 | · | · | · | · | · | · |
| D6 D5 | 2 | 1 | 2 | 1 | 2 | 4 | 1 | 1 | 1 | 1 | 1 | · | 1 | 1 |
| D7 D6 | · | 1 | · | · | · | · | 5 | 3 | · | · | · | · | 1 | · |
| D8 D7 | · | · | · | · | · | · | · | 9 | · | · | · | · | · | · |
| D9 D8 | · | 4 | · | · | · | · | 4 | 6 | 5 | · | · | · | · | · |
| D10 D9 | 5 | 1 | 1 | 1 | 1 | 1 | 1 | 3 | 1 | 2 | 1 | · | 1 | 1 |
| D11 D10 | 8 | 2 | 2 | 2 | 2 | 3 | 2 | 2 | 2 | 2 | 2 | · | 2 | 2 |
| D12 D11 | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| D13 D12 | · | 2 | · | · | · | · | 2 | · | · | · | · | · | 2 | · |
| D14 D13 | · | · | · | 1 | · | · | · | 2 | 1 | · | · | · | · | 3 |

## Domain D1: Fragment K

Slug `K` · fragments K · 11 node types.


### Node-edge-node overview

Every edge declared by a node type of this domain, one line each (OUT direction only; IN fields are listed on the node card as incoming declarations).

```
(Activity)-[:WAS_ASSOCIATED_WITH]->(Agent)  structural · one_or_more
(Activity)-[:WAS_INFORMED_BY]->(Activity)  structural · many (the activity this one was started from: vetting → evidence mission, research → ingestion)
(Activity)-[:ASSESSES]->(Subjectable ◇56)  structural · zero_or_more (EVIDENCE_MISSION: exactly one, the Claim under test; RESEARCH: the entities the mission was chartered for; written at run start from the Mission Control charter)
(Adjudication)-[:ASSESSES]->(Assertion)  structural · one_or_more
(Adjudication)-[:HAS_EVIDENCE {EvidenceEdgeProperties}]->(SourceLocator)  structural · many (role and origin per fragment)
(Adjudication)-[:WAS_GENERATED_BY]->(Activity)  structural · exactly_one (the VERIFICATION Activity)
(Assertion)-[:HAS_SUBJECT]->(Subjectable ◇56)  structural · exactly_one
(Assertion)-[:HAS_OBJECT]->(Subjectable ◇56)  structural · zero_or_one (exclusive with the literal values)
(Assertion)-[:ASSERTED_BY]->(Subjectable ◇56)  structural · exactly_one (D7 Person or Organization, K Agent, a D3 Publication or D9 MediaWork for a multi-author work's own voice (R-15), or a D9 Channel with channelKind ACCOUNT when no person is identified; validated by the executor, P20)
(Assertion)-[:HAS_EVIDENCE {EvidenceEdgeProperties}]->(SourceLocator)  structural · one_or_more (role SUPPORTS, origin DECLARED)
(Assertion)-[:WAS_GENERATED_BY]->(Activity)  structural · exactly_one
(Assertion)-[:DERIVED_FROM]->(Assertion)  structural · many (inputs of a CALCULATED assertion, or the primary occurrence a retelling restates)
(Assertion)-[:OCCURRENCE_OF]->(Claim)  structural · zero_or_one (assertionKind CLAIM only)
(Assessment)-[:ASSESSES]->(Subjectable ◇56)  structural · one_or_more (Claim, domain entity, Source, Agent)
(Assessment)-[:DERIVED_FROM]->(Assertion)  structural · many
(Assessment)-[:DERIVED_FROM]->(Assessment)  structural · many
(Assessment)-[:HAS_EVIDENCE {EvidenceEdgeProperties}]->(SourceLocator)  structural · many (role per locator)
(Assessment)-[:WAS_GENERATED_BY]->(Activity)  structural · exactly_one
(Report)-[:ASSESSES]->(Subjectable ◇56)  structural · zero_or_more (exactly one Claim for EVIDENCE_REPORT; one_or_more for COMPARISON; zero for a PROFILE about the graph)
(Report)-[:DERIVED_FROM]->(Assertion)  structural · one_or_more (minimum citation set)
(Report)-[:DERIVED_FROM]->(Assessment)  structural · many
(Report)-[:HAS_EVIDENCE {EvidenceEdgeProperties}]->(SourceLocator)  structural · many (every quoted span)
(Report)-[:WAS_GENERATED_BY]->(Activity)  structural · exactly_one (the composing Activity: EVIDENCE_MISSION, ANSWER, or PROJECTION for a PROFILE)
(Source)-[:HAS_SNAPSHOT {StructuralEdgeProperties}]->(SourceSnapshot)  structural · many (one per capture)
```

### Activity

Fragment K · uid `hu:activity:` · labels `Activity:Occurrence` · implements Entity · mutations none.

Purpose: the single lineage spine (00-DIRECTIVE 4).

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| activityKind | `ActivityKind!` | core | required, enum ActivityKind |
| externalRunSystem | `String!` | core | required |
| runId | `String!` | core | required |
| missionId | `String` | core |  |
| activationId | `String` | core |  |
| operationIds | `[String!]` | core |  |
| operationKind | `String` | core |  |
| startedAt | `DateTime` | core |  |
| endedAt | `DateTime` | core |  |
| methodVersion | `String` | core |  |
| intentDigests | `[String!]` | core |  |
| planDigests | `[String!]` | core |  |
| receiptIds | `[String!]` | core |  |
| bundleDigest | `String` | core |  |
| policyOutcome | `PolicyOutcome` | core | enum PolicyOutcome |
| policyVersion | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Activity)-[:WAS_ASSOCIATED_WITH]->(Agent)` | structural |  | one_or_more | agents (OUT) |
| `(Activity)-[:WAS_INFORMED_BY]->(Activity)` | structural |  | many (the activity this one was started from: vetting → evidence mission, research → ingestion) | informedBy (OUT) |
| `(Activity)-[:ASSESSES]->(Subjectable ◇56)` | structural |  | zero_or_more (EVIDENCE_MISSION: exactly one, the Claim under test; RESEARCH: the entities the mission was chartered for; written at run start from the Mission Control charter) | about (OUT) · 56 concrete targets |
| `(Entity ◇69)-[:WAS_GENERATED_BY]->(Activity)` | structural |  | many (every node the run wrote, any module) | generated (IN) · 69 concrete targets |

Incoming from other node types (4):

- `(Adjudication)-[:WAS_GENERATED_BY]->(Activity)` ← Adjudication.generatedBy
- `(Assertion)-[:WAS_GENERATED_BY]->(Activity)` ← Assertion.generatedBy
- `(Assessment)-[:WAS_GENERATED_BY]->(Activity)` ← Assessment.generatedBy
- `(Report)-[:WAS_GENERATED_BY]->(Activity)` ← Report.generatedBy

### Adjudication

Fragment K · uid `hu:adjudication:` · labels `Adjudication:EvidenceAssessment` · implements Entity · mutations none.

Purpose: one verification.v1 judgment about one Assertion, immutable (a re-review is a new node naming `supersedesUid`).

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| adjudicationKind | `AdjudicationKind!` | core | required, enum AdjudicationKind |
| verdict | `SemanticVerdict!` | core | required, enum SemanticVerdict |
| mechanicalStatus | `String` | core |  |
| policyOutcome | `PolicyOutcome` | core | enum PolicyOutcome |
| judgeKind | `JudgeKind!` | core | required, enum JudgeKind |
| methodVersion | `String!` | core | required |
| evidenceSupport | `PropertyStatus` | core | enum PropertyStatus |
| worldCorrectness | `PropertyStatus` | core | enum PropertyStatus |
| attributionFaithfulness | `PropertyStatus` | core | enum PropertyStatus |
| sourceAuthority | `PropertyStatus` | core | enum PropertyStatus |
| provenanceIntegrity | `PropertyStatus` | core | enum PropertyStatus |
| unsupportedFacets | `[String!]` | core |  |
| calibratedProbability | `Float` | core |  |
| rationale | `String` | core |  |
| decision | `AdjudicationDecision` | core | enum AdjudicationDecision |
| decisionProvenance | `String` | core |  |
| judgmentId | `String` | core |  |
| recordedAt | `DateTime!` | temporal | required |
| recordedTo | `DateTime` | temporal |  |
| supersedesUid | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Adjudication)-[:ASSESSES]->(Assertion)` | structural |  | one_or_more | evaluates (OUT) |
| `(Adjudication)-[:HAS_EVIDENCE]->(SourceLocator)` | structural | EvidenceEdgeProperties | many (role and origin per fragment) | evidence (OUT) |
| `(Adjudication)-[:WAS_GENERATED_BY]->(Activity)` | structural |  | exactly_one (the VERIFICATION Activity) | generatedBy (OUT) |

Incoming from other node types (2):

- `(Adjudication)-[:ASSESSES]->(Assertion)` ← Assertion.adjudications
- `(Adjudication)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity

### Agent

Fragment K · uid `hu:agent:` · labels `Agent:Entity` · implements Entity, Subjectable · mutations none.

Purpose: a software or human-operated agent identity (executor, extraction model + prompt + skill, verifier, analyst seat).

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| agentKind | `AgentKind!` | core | required, enum AgentKind |
| model | `String` | core |  |
| promptVersion | `String` | core |  |
| skillVersion | `String` | core |  |
| toolVersion | `String` | core |  |

No relationship fields.

Incoming from other node types (13):

- `(Activity)-[:ASSESSES]->(Agent)` ← Activity.about via Subjectable
- `(Activity)-[:WAS_ASSOCIATED_WITH]->(Agent)` ← Activity.agents
- `(Agent)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Agent)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Assertion)-[:ASSERTED_BY]->(Agent)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Agent)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Agent)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Agent)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Agent)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(Agent)` ← Chunk.mentions via Subjectable
- `(ProtocolStep)-[:STEP_USES]->(Agent)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Agent)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Agent)` ← ReportItem.about via Subjectable

### Assertion

Fragment K · uid `hu:assertion:` · labels `Assertion` · implements Entity · mutations none.

Purpose: one attributable proposition (verification.v1 Assertion): exactly one subject, exactly one object or one typed literal, exactly one asserter, at least one located span (HAS_EVIDENCE role SUP…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| predicate | `String!` | core | required |
| assertionKind | `AssertionKind!` | core | required, enum AssertionKind |
| claimType | `ClaimType` | core | enum ClaimType |
| status | `AssertionStatus!` | core | required, enum AssertionStatus |
| polarity | `Polarity` | core | enum Polarity |
| speechAct | `SpeechAct` | core | enum SpeechAct |
| basisKind | `BasisKind` | core | enum BasisKind |
| proposition | `String` | core |  |
| qualifiers | `[String!]` | core |  |
| valueString | `String` | core |  |
| valueNumber | `Float` | core |  |
| valueBoolean | `Boolean` | core |  |
| unitCode | `String` | core |  |
| validFrom | `DateTime` | temporal |  |
| validTo | `DateTime` | temporal |  |
| validFromPrecision | `TimePrecision` | temporal | enum TimePrecision |
| validToPrecision | `TimePrecision` | temporal | enum TimePrecision |
| validFromBasis | `ValidTimeBasis` | temporal | enum ValidTimeBasis |
| validToBasis | `ValidTimeBasis` | temporal | enum ValidTimeBasis |
| validObservedAt | `DateTime` | core |  |
| validObservedAtPrecision | `TimePrecision` | core | enum TimePrecision |
| recordedAt | `DateTime!` | temporal | required |
| recordedTo | `DateTime` | temporal |  |
| contentHash | `String` | core |  |
| supersedesUid | `String` | core |  |
| derivationRule | `String` | core |  |
| extractionConfidence | `Float` | core |  |
| riskClass | `String` | core |  |
| verificationAssertionId | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Assertion)-[:HAS_SUBJECT]->(Subjectable ◇56)` | structural |  | exactly_one | subject (OUT) · 56 concrete targets |
| `(Assertion)-[:HAS_OBJECT]->(Subjectable ◇56)` | structural |  | zero_or_one (exclusive with the literal values) | object (OUT) · 56 concrete targets |
| `(Assertion)-[:ASSERTED_BY]->(Subjectable ◇56)` | structural |  | exactly_one (D7 Person or Organization, K Agent, a D3 Publication or D9 MediaWork for a multi-author work's own voice (R-15), or a D9 Channel with channelKind ACCOUNT when no person is identified; validated by the executor, P20) | assertedBy (OUT) · 56 concrete targets |
| `(Assertion)-[:HAS_EVIDENCE]->(SourceLocator)` | structural | EvidenceEdgeProperties | one_or_more (role SUPPORTS, origin DECLARED) | evidence (OUT) |
| `(Assertion)-[:WAS_GENERATED_BY]->(Activity)` | structural |  | exactly_one | generatedBy (OUT) |
| `(Assertion)-[:DERIVED_FROM]->(Assertion)` | structural |  | many (inputs of a CALCULATED assertion, or the primary occurrence a retelling restates) | derivedFrom (OUT) |
| `(Assertion)-[:OCCURRENCE_OF]->(Claim)` | structural |  | zero_or_one (assertionKind CLAIM only) | occurrenceOf (OUT) |
| `(Adjudication)-[:ASSESSES]->(Assertion)` | structural |  | many | adjudications (IN) |

Incoming from other node types (10):

- `(Adjudication)-[:ASSESSES]->(Assertion)` ← Adjudication.evaluates
- `(Assertion)-[:OBSERVED_IN_CONTEXT]->(MechanismEvidenceContext)` ← MechanismEvidenceContext.assertions
- `(Assertion)-[:OCCURRENCE_OF]->(Claim)` ← Claim.occurrences
- `(Assertion)-[:OCCURS_IN]->(MediaWork)` ← MediaWork.occurrences
- `(Assertion)-[:RESOLVES_TO_CONSTRAINT]->(UseConstraint)` ← UseConstraint.resolvedFrom
- `(Assertion)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Assessment)-[:DERIVED_FROM]->(Assertion)` ← Assessment.inputAssertions
- `(Association)-[:DERIVED_FROM]->(Assertion)` ← Association.inputs
- `(Report)-[:DERIVED_FROM]->(Assertion)` ← Report.citesAssertions
- `(ReportItem)-[:DERIVED_FROM]->(Assertion)` ← ReportItem.citesAssertions

### Assessment

Fragment K · uid `hu:?:` · labels `Assessment:EvidenceAssessment` · implements Entity · mutations none.

Purpose: an immutable, versioned, supersedable judgment asserted by an agent or analyst with named inputs (PLAN 6.1 "assessment"): claim vetting (with `disposition`), derived insight, evidence synthe…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| assessmentKind | `AssessmentKind!` | core | required, enum AssessmentKind |
| assessmentSubkind | `String` | core |  |
| status | `AssessmentStatus!` | core | required, enum AssessmentStatus |
| methodVersion | `String!` | core | required |
| disposition | `ClaimDisposition` | core | enum ClaimDisposition |
| verdict | `SemanticVerdict` | core | enum SemanticVerdict |
| effectDirection | `EffectDirection` | core | enum EffectDirection |
| score | `Float` | core |  |
| gradeScheme | `String` | core |  |
| grade | `String` | core |  |
| certainty | `CertaintyLevel` | core | enum CertaintyLevel |
| conclusionCode | `String` | core |  |
| facets | `[String!]` | core |  |
| summary | `String` | core |  |
| rationale | `String` | core |  |
| evidenceCutoffAt | `DateTime` | core |  |
| inputSetDigest | `String` | core |  |
| recordedAt | `DateTime!` | temporal | required |
| recordedTo | `DateTime` | temporal |  |
| supersedesUid | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Assessment)-[:ASSESSES]->(Subjectable ◇56)` | structural |  | one_or_more (Claim, domain entity, Source, Agent) | about (OUT) · 56 concrete targets |
| `(Assessment)-[:DERIVED_FROM]->(Assertion)` | structural |  | many | inputAssertions (OUT) |
| `(Assessment)-[:DERIVED_FROM]->(Assessment)` | structural |  | many | inputAssessments (OUT) |
| `(Assessment)-[:HAS_EVIDENCE]->(SourceLocator)` | structural | EvidenceEdgeProperties | many (role per locator) | evidence (OUT) |
| `(Assessment)-[:WAS_GENERATED_BY]->(Activity)` | structural |  | exactly_one | generatedBy (OUT) |

Incoming from other node types (5):

- `(Assessment)-[:ASSESSES]->(Claim)` ← Claim.assessments
- `(Assessment)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Report)-[:DERIVED_FROM]->(Assessment)` ← Report.citesAssessments
- `(ReportItem)-[:BLOCKED_BY]->(Assessment)` ← ReportItem.blockedByAssessments
- `(ReportItem)-[:DERIVED_FROM]->(Assessment)` ← ReportItem.citesAssessments

### Claim

Fragment K · uid `hu:claim:` · labels `Claim:Entity` · implements Entity, Subjectable · mutations none.

Purpose: the proposition itself, independent of who said it (00-DIRECTIVE 3.4): the unit that is vetted, monitored, researched and reported on.

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| proposition | `String!` | core | required |
| propositionHash | `String!` | core | required |
| claimType | `ClaimType!` | core | required, enum ClaimType |
| lifecycleState | `ClaimLifecycleState` | core | enum ClaimLifecycleState |
| latestVerdict | `SemanticVerdict` | core | enum SemanticVerdict |
| refinesClaimUid | `String` | core |  |
| discourseFirstHandCount | `Int` | core |  |
| discourseRetellingCount | `Int` | core |  |
| discourseRecutCount | `Int` | core |  |
| discourseIndependentCount | `Int` | core |  |
| discourseFirstOccurrenceAt | `DateTime` | core |  |
| discourseMethodVersion | `String` | core |  |
| discourseDerivedAt | `DateTime` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Assertion)-[:OCCURRENCE_OF]->(Claim)` | structural |  | many | occurrences (IN) |
| `(Assessment)-[:ASSESSES]->(Claim)` | structural |  | many (vetting, equivalence, insights) | assessments (IN) |
| `(Report)-[:ASSESSES]->(Claim)` | structural |  | many (evidence reports) | reports (IN) |

Incoming from other node types (13):

- `(Activity)-[:ASSESSES]->(Claim)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Claim)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Claim)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Claim)` ← Assertion.subject via Subjectable
- `(Assertion)-[:OCCURRENCE_OF]->(Claim)` ← Assertion.occurrenceOf
- `(Assessment)-[:ASSESSES]->(Claim)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Claim)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(Claim)` ← Chunk.mentions via Subjectable
- `(Claim)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Claim)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(Claim)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Claim)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Claim)` ← ReportItem.about via Subjectable

### Identifier

Fragment K · uid `hu:identifier:` · labels `Identifier:Entity` · implements Entity · mutations none.

Purpose: an external identifier string with scheme and issuer (PMID, DOI, NCT, UNII, CAS, GTIN, LOINC, ...; the scheme register is packets/K/identifier-schemes.yaml).

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| scheme | `String!` | identity | required |
| issuer | `String!` | identity | required |
| value | `String!` | identity | required |
| normalizationRule | `String` | core |  |
| validFrom | `DateTime` | temporal |  |
| validTo | `DateTime` | temporal |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Subjectable ◇56)-[:HAS_IDENTIFIER]->(Identifier)` | asserted | IdentifierLinkProperties | many (episodes carry assignment validity) | identifies (IN) · 56 concrete targets |

Incoming from other node types (1):

- `(Identifier)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity

### Report

Fragment K · uid `hu:?:` · labels `Report:InformationArtifact` · implements Entity · mutations none.

Purpose: the in-graph skeleton of a published artifact (PLAN 6.1): evidence report (the outcome of an evidence mission, with the verification.v1 verdict on the claim it tried to disqualify), publishe…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| reportKind | `ReportKind!` | core | required, enum ReportKind |
| skeletonKey | `String` | core |  |
| status | `AssessmentStatus!` | core | required, enum AssessmentStatus |
| verdict | `SemanticVerdict` | core | enum SemanticVerdict |
| worldCorrectness | `PropertyStatus` | core | enum PropertyStatus |
| policyOutcome | `PolicyOutcome` | core | enum PolicyOutcome |
| policyVersion | `String!` | core | required |
| bodyDigest | `String!` | core | required |
| bodyUri | `String` | core |  |
| ledgerDigest | `String` | core |  |
| bundleDigest | `String` | core |  |
| citationCompleteness | `Float` | core |  |
| citationCorrectness | `Float` | core |  |
| independentSourceFamilyCount | `Int` | core |  |
| distinctSourceFamilyCount | `Int` | core |  |
| unsupportedHighSeverityCount | `Int` | core |  |
| queryDigest | `String` | core |  |
| publishedAt | `DateTime` | core |  |
| recordedAt | `DateTime!` | temporal | required |
| recordedTo | `DateTime` | temporal |  |
| supersedesUid | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Report)-[:ASSESSES]->(Subjectable ◇56)` | structural |  | zero_or_more (exactly one Claim for EVIDENCE_REPORT; one_or_more for COMPARISON; zero for a PROFILE about the graph) | about (OUT) · 56 concrete targets |
| `(Report)-[:DERIVED_FROM]->(Assertion)` | structural |  | one_or_more (minimum citation set) | citesAssertions (OUT) |
| `(Report)-[:DERIVED_FROM]->(Assessment)` | structural |  | many | citesAssessments (OUT) |
| `(Report)-[:HAS_EVIDENCE]->(SourceLocator)` | structural | EvidenceEdgeProperties | many (every quoted span) | evidence (OUT) |
| `(Report)-[:WAS_GENERATED_BY]->(Activity)` | structural |  | exactly_one (the composing Activity: EVIDENCE_MISSION, ANSWER, or PROJECTION for a PROFILE) | generatedBy (OUT) |

Incoming from other node types (4):

- `(Report)-[:ASSESSES]->(Claim)` ← Claim.reports
- `(Report)-[:HAS_ITEM]->(ReportItem)` ← ReportItem.report
- `(Report)-[:USES_CRITERION]->(DecisionCriterion)` ← DecisionCriterion.usedByReports
- `(Report)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity

### Source

Fragment K · uid `hu:source:` · labels `Source:Entity` · implements Entity, Subjectable · mutations none.

Purpose: stable identity of one retrieval endpoint (one normalized canonicalUri): a page, registry record, PDF, API record, feed item or media file.

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| canonicalUri | `String!` | identity | required |
| sourceKind | `SourceKind!` | core | required, enum SourceKind |
| genre | `String` | core |  |
| logicalIdentity | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Source)-[:HAS_SNAPSHOT]->(SourceSnapshot)` | structural | StructuralEdgeProperties | many (one per capture) | snapshots (OUT) |

Incoming from other node types (15):

- `(Activity)-[:ASSESSES]->(Source)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Source)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Source)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Source)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Source)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Source)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(Source)` ← Chunk.mentions via Subjectable
- `(ProtocolStep)-[:STEP_USES]->(Source)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Source)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Source)` ← ReportItem.about via Subjectable
- `(Source)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Source)-[:HAS_SNAPSHOT]->(SourceSnapshot)` ← SourceSnapshot.source
- `(Source)-[:RENDITION_OF]->(MediaWork)` ← MediaWork.renditions
- `(Source)-[:RENDITION_OF]->(Publication)` ← Publication.renditions
- `(Source)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity

### SourceLocator

Fragment K · uid `hu:locator:` · labels `SourceLocator:InformationArtifact` · implements Entity · mutations none.

Purpose: reproducible selector for the exact span, cell, page region, JSON pointer or media time range of one SourceSnapshot (verification.v1 SourceFragment + selector), the only evidence currency of…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| selectorKind | `SelectorKind!` | core | required, enum SelectorKind |
| selectorDigest | `String!` | core | required |
| selectorJson | `String!` | core | required |
| exact | `String` | core |  |
| prefix | `String` | core |  |
| suffix | `String` | core |  |
| quoteHash | `String` | core |  |
| startOffset | `Int` | core |  |
| endOffset | `Int` | core |  |
| page | `Int` | core |  |
| mediaStartSeconds | `Float` | core |  |
| mediaEndSeconds | `Float` | core |  |
| speakerLabelInSource | `String` | core |  |
| reanchorsLocatorUid | `String` | core |  |
| reanchorMatch | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(SourceSnapshot)-[:HAS_LOCATOR]->(SourceLocator)` | structural | StructuralEdgeProperties | exactly_one | snapshot (IN) |

Incoming from other node types (6):

- `(Adjudication)-[:HAS_EVIDENCE]->(SourceLocator)` ← Adjudication.evidence
- `(Assertion)-[:HAS_EVIDENCE]->(SourceLocator)` ← Assertion.evidence
- `(Assessment)-[:HAS_EVIDENCE]->(SourceLocator)` ← Assessment.evidence
- `(Chunk)-[:COVERS_LOCATOR]->(SourceLocator)` ← Chunk.locators
- `(Report)-[:HAS_EVIDENCE]->(SourceLocator)` ← Report.evidence
- `(SourceLocator)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity

### SourceSnapshot

Fragment K · uid `hu:snapshot:` · labels `SourceSnapshot:InformationArtifact` · implements Entity · mutations none.

Purpose: immutable capture of a Source at a retrieval time (verification.v1 VerificationSourceCapture): the bytes that every claim must trace to.

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| retrievedAt | `DateTime!` | core | required |
| observedAt | `DateTime` | core |  |
| publishedAt | `DateTime` | core |  |
| contentHash | `String!` | core | required |
| contentHashBasis | `String!` | core | required |
| canonicalProjectionHash | `String` | core |  |
| captureMethod | `String` | core |  |
| captureCompleteness | `String` | core |  |
| storageUri | `String` | core |  |
| archiveUri | `String` | core |  |
| mimeType | `String` | core |  |
| language | `String` | core |  |
| revisionKind | `SourceRevisionKind` | core | enum SourceRevisionKind |
| revisesSnapshotUid | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Source)-[:HAS_SNAPSHOT]->(SourceSnapshot)` | structural | StructuralEdgeProperties | exactly_one | source (IN) |

Incoming from other node types (4):

- `(Chunk)-[:CHUNK_OF]->(SourceSnapshot)` ← Chunk.snapshot
- `(Source)-[:HAS_SNAPSHOT]->(SourceSnapshot)` ← Source.snapshots
- `(SourceSnapshot)-[:HAS_LOCATOR]->(SourceLocator)` ← SourceLocator.snapshot
- `(SourceSnapshot)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity

## Domain D2: Fragment D1

Slug `D1` · fragments D1 · 4 node types.


### Node-edge-node overview

Every edge declared by a node type of this domain, one line each (OUT direction only; IN fields are listed on the node card as incoming declarations).

```
(ChemicalSubstance)-[:HAS_ACTIVE_MOIETY {AssertedRecordedProperties}]->(ChemicalSubstance)  asserted · zero_or_more (a salt of two moieties has two; a moiety has none)
(ChemicalSubstance)-[:COUNTS_TOWARD_NUTRIENT {AssertedRecordedProperties}]->(Constituent)  asserted · zero_or_more (a vitamer counts toward its nutrient; conversion factors live in the versioned rule nutrient-equivalent, not on the edge)
(IngredientMaterial)-[:REALIZES_SUBSTANCE {AssertedRecordedProperties}]->(ChemicalSubstance)  asserted · zero_or_more (one for a chemically defined material; a botanical may realize its GSRS plant-part record)
(IngredientMaterial)-[:MATERIAL_CONTAINS {ContentEdgeProperties}]->(ChemicalSubstance)  asserted · zero_or_more (one open episode per statement; specification changes close and open episodes)
(IngredientMaterial)-[:MATERIAL_CONTAINS {ContentEdgeProperties}]->(Constituent)  asserted · zero_or_more (marker classes, measurands and nutrients a material is said to provide or contain)
(IngredientMaterial)-[:DERIVED_FROM_TAXON {AssertedRecordedProperties}]->(Taxon)  asserted · zero_or_more (botanical source organism, or each strain of a microbial preparation / consortium)
(Taxon)-[:PARENT_TAXON {AssertedEdgeProperties}]->(Taxon)  asserted · zero_or_one open episode (reclassification closes it and opens a new one, e.g. the 2020 Lactobacillus split)
```

### ChemicalSubstance

Fragment D1 · uid `hu:substance:` · labels `ChemicalSubstance:Entity` · implements Entity, Subjectable · mutations none.

Purpose: a chemical substance at the granularity of its FDA GSRS substance record — salts, esters, hydrates and the free moiety are DIFFERENT substances (NR chloride UNII 8XM2XT8VWI vs NR 0I8H2M0L7N;…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| substanceClass | `SubstanceClass` | core | enum SubstanceClass |
| molecularFormula | `String` | core |  |
| molecularWeight | `Float` | core |  |
| charge | `Int` | core |  |
| searchText | `String` | search |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(ChemicalSubstance)-[:HAS_ACTIVE_MOIETY]->(ChemicalSubstance)` | asserted | AssertedRecordedProperties | zero_or_more (a salt of two moieties has two; a moiety has none) | activeMoieties (OUT) |
| `(ChemicalSubstance)-[:COUNTS_TOWARD_NUTRIENT]->(Constituent)` | asserted | AssertedRecordedProperties | zero_or_more (a vitamer counts toward its nutrient; conversion factors live in the versioned rule nutrient-equivalent, not on the edge) | nutrients (OUT) |

Incoming from other node types (23):

- `(Activity)-[:ASSESSES]->(ChemicalSubstance)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(ChemicalSubstance)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(ChemicalSubstance)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(ChemicalSubstance)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(ChemicalSubstance)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(ChemicalSubstance)` ← Association.members via Subjectable
- `(Biomarker)-[:HAS_ANALYTE]->(ChemicalSubstance)` ← Biomarker.analytes
- `(ChemicalSubstance)-[:AFFECTS_MECHANISM]->(Mechanism)` ← Mechanism.affectedBy via MechanismModulator
- `(ChemicalSubstance)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(ChemicalSubstance)-[:PARTICIPATES_IN]->(Mechanism)` ← Mechanism.metaboliteParticipants
- `(ChemicalSubstance)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Chunk)-[:MENTIONS]->(ChemicalSubstance)` ← Chunk.mentions via Subjectable
- `(FoodItem)-[:FOOD_CONTAINS]->(ChemicalSubstance)` ← FoodItem.components via FoodComponentTarget
- `(IngredientMaterial)-[:MATERIAL_CONTAINS]->(ChemicalSubstance)` ← IngredientMaterial.containsSubstances
- `(IngredientMaterial)-[:REALIZES_SUBSTANCE]->(ChemicalSubstance)` ← IngredientMaterial.substances
- `(LegalStatus)-[:STATUS_OF]->(ChemicalSubstance)` ← LegalStatus.statusOf via LegalStatusSubject
- `(MechanismEvidenceContext)-[:EXPOSED_TO]->(ChemicalSubstance)` ← MechanismEvidenceContext.exposures via ContextExposure
- `(Patent)-[:CONCERNS]->(ChemicalSubstance)` ← Patent.concerns
- `(ProtocolStep)-[:STEP_USES]->(ChemicalSubstance)` ← ProtocolStep.uses via Subjectable
- `(QualityResult)-[:MEASURES_ANALYTE]->(ChemicalSubstance)` ← QualityResult.analyte via QualityAnalyte
- `(RegulatoryRecord)-[:CONCERNS]->(ChemicalSubstance)` ← RegulatoryRecord.concerns via RegulatoryRecordTopic
- `(Report)-[:ASSESSES]->(ChemicalSubstance)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(ChemicalSubstance)` ← ReportItem.about via Subjectable

### Constituent

Fragment D1 · uid `hu:constituent:` · labels `Constituent:Entity` · implements Entity, Subjectable · mutations none.

Purpose: a component concept with no single defined structure — a NUTRIENT with its own declaration convention ("vitamin B6" = six vitamers, declared "as pyridoxine"; "magnesium" as elemental Mg), a…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| constituentKind | `ConstituentKind!` | core | required, enum ConstituentKind |
| nutrientKind | `NutrientKind` | core | enum NutrientKind |
| referenceUnitCode | `String` | core |  |
| searchText | `String` | search |  |

No relationship fields.

Incoming from other node types (18):

- `(Activity)-[:ASSESSES]->(Constituent)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Constituent)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Constituent)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Constituent)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Constituent)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Constituent)` ← Association.members via Subjectable
- `(ChemicalSubstance)-[:COUNTS_TOWARD_NUTRIENT]->(Constituent)` ← ChemicalSubstance.nutrients
- `(Chunk)-[:MENTIONS]->(Constituent)` ← Chunk.mentions via Subjectable
- `(Constituent)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Constituent)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(DietaryPattern)-[:PATTERN_COMPONENT]->(Constituent)` ← DietaryPattern.components via PatternComponentTarget
- `(FoodItem)-[:FOOD_CONTAINS]->(Constituent)` ← FoodItem.components via FoodComponentTarget
- `(IngredientMaterial)-[:MATERIAL_CONTAINS]->(Constituent)` ← IngredientMaterial.containsConstituents
- `(LabelVersion)-[:DECLARES_COMPONENT]->(Constituent)` ← LabelVersion.components via DeclaredComponentTarget
- `(ProtocolStep)-[:STEP_USES]->(Constituent)` ← ProtocolStep.uses via Subjectable
- `(QualityResult)-[:MEASURES_ANALYTE]->(Constituent)` ← QualityResult.analyte via QualityAnalyte
- `(Report)-[:ASSESSES]->(Constituent)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Constituent)` ← ReportItem.about via Subjectable

### IngredientMaterial

Fragment D1 · uid `hu:material:` · labels `IngredientMaterial:Entity` · implements Entity, Subjectable · mutations none.

Purpose: the canonical identity of an actual material used as an ingredient or administered in a study — a supplier's grade of one substance, a branded material (NIAGEN: a crystal form of NR chloride…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| materialKind | `MaterialKind!` | core | required, enum MaterialKind |
| brandName | `String` | core |  |
| physicalForm | `PhysicalFormKind` | core | enum PhysicalFormKind |
| formDescriptor | `String` | core |  |
| grade | `MaterialGrade` | core | enum MaterialGrade |
| plantPart | `PlantPart` | core | enum PlantPart |
| preparationType | `BotanicalPreparationType` | core | enum BotanicalPreparationType |
| extractRatioLow | `Float` | core |  |
| extractRatioHigh | `Float` | core |  |
| extractionSolvent | `String` | core |  |
| viabilityState | `ViabilityState` | core | enum ViabilityState |
| searchText | `String` | search |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(IngredientMaterial)-[:REALIZES_SUBSTANCE]->(ChemicalSubstance)` | asserted | AssertedRecordedProperties | zero_or_more (one for a chemically defined material; a botanical may realize its GSRS plant-part record) | substances (OUT) |
| `(IngredientMaterial)-[:MATERIAL_CONTAINS]->(ChemicalSubstance)` | asserted | ContentEdgeProperties | zero_or_more (one open episode per statement; specification changes close and open episodes) | containsSubstances (OUT) |
| `(IngredientMaterial)-[:MATERIAL_CONTAINS]->(Constituent)` | asserted | ContentEdgeProperties | zero_or_more (marker classes, measurands and nutrients a material is said to provide or contain) | containsConstituents (OUT) |
| `(IngredientMaterial)-[:DERIVED_FROM_TAXON]->(Taxon)` | asserted | AssertedRecordedProperties | zero_or_more (botanical source organism, or each strain of a microbial preparation / consortium) | sourceTaxa (OUT) |

Incoming from other node types (18):

- `(Activity)-[:ASSESSES]->(IngredientMaterial)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(IngredientMaterial)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(IngredientMaterial)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(IngredientMaterial)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(IngredientMaterial)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(IngredientMaterial)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(IngredientMaterial)` ← Chunk.mentions via Subjectable
- `(IngredientMaterial)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(IngredientMaterial)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(InterventionComponent)-[:ADMINISTERS]->(IngredientMaterial)` ← InterventionComponent.administers via AdministeredMaterial
- `(LabelVersion)-[:DECLARES_COMPONENT]->(IngredientMaterial)` ← LabelVersion.components via DeclaredComponentTarget
- `(LegalStatus)-[:STATUS_OF]->(IngredientMaterial)` ← LegalStatus.statusOf via LegalStatusSubject
- `(MechanismEvidenceContext)-[:EXPOSED_TO]->(IngredientMaterial)` ← MechanismEvidenceContext.exposures via ContextExposure
- `(ProtocolStep)-[:STEP_USES]->(IngredientMaterial)` ← ProtocolStep.uses via Subjectable
- `(QualityResult)-[:MEASURES_ANALYTE]->(IngredientMaterial)` ← QualityResult.analyte via QualityAnalyte
- `(RegulatoryRecord)-[:CONCERNS]->(IngredientMaterial)` ← RegulatoryRecord.concerns via RegulatoryRecordTopic
- `(Report)-[:ASSESSES]->(IngredientMaterial)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(IngredientMaterial)` ← ReportItem.about via Subjectable

### Taxon

Fragment D1 · uid `hu:?:` · labels `Taxon:Entity` · implements Entity, Subjectable · mutations none.

Purpose: an organism taxon a material is derived from — botanical source species (Withania somnifera, NCBI 126910), microbial species (Lacticaseibacillus rhamnosus, 47715) and microbial strain (rank…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| scientificName | `String` | core |  |
| rank | `TaxonRank!` | core | required, enum TaxonRank |
| organismGroup | `OrganismGroup` | core | enum OrganismGroup |
| searchText | `String` | search |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Taxon)-[:PARENT_TAXON]->(Taxon)` | asserted | AssertedEdgeProperties | zero_or_one open episode (reclassification closes it and opens a new one, e.g. the 2020 Lactobacillus split) | parents (OUT) |

Incoming from other node types (13):

- `(Activity)-[:ASSESSES]->(Taxon)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Taxon)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Taxon)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Taxon)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Taxon)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Taxon)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(Taxon)` ← Chunk.mentions via Subjectable
- `(IngredientMaterial)-[:DERIVED_FROM_TAXON]->(Taxon)` ← IngredientMaterial.sourceTaxa
- `(ProtocolStep)-[:STEP_USES]->(Taxon)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Taxon)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Taxon)` ← ReportItem.about via Subjectable
- `(Taxon)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Taxon)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity

## Domain D3: Fragment D2

Slug `D2` · fragments D2 · 5 node types.


### Node-edge-node overview

Every edge declared by a node type of this domain, one line each (OUT direction only; IN fields are listed on the node card as incoming declarations).

```
(Mechanism)-[:PART_OF_MECHANISM {MechanismReferenceProperties}]->(Mechanism)  asserted · many (reference hierarchy: Reactome hasEvent, GO is_a/part_of, BellLabs hallmark mapping; one Assertion per authority record and release, recorded time only)
(MechanismEvidenceContext)-[:EXPOSED_TO {ExposureRoleProperties}]->(ContextExposure ∪3)  structural · one_or_more (exactly one TESTED exposure unless geneticManipulation is set; BACKGROUND and COMPARATOR optional; structural per R-26, written alongside IN_STUDY_ARM where single-substance reach is needed, R-86)
(MechanismEvidenceContext)-[:IN_STUDY_ARM {StructuralEdgeProperties}]->(StudyArm)  structural · zero_or_more (the trial arm(s) the group belongs to; a paper may pool registry arms, fixture metformin-exercise-harm; a registered group's dose of record is read through it)
(MolecularEntity)-[:PARTICIPATES_IN {MechanismReferenceProperties}]->(Mechanism)  asserted · many (Reactome participants, GO annotations, GenAge; one Assertion per authority record and release, MechanismReferenceProperties with role and release)
```

### Condition

Fragment D2 · uid `hu:condition:` · labels `Condition:Entity` · implements Entity, Subjectable · mutations none.

Purpose: a disease, syndrome, phenotype or risk state (conditionKind) that mechanisms are linked to and that other modules scope by: D3 studies investigate it, D5 contraindications and adverse effect…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| key | `String` | core |  |
| conditionKind | `ConditionKind` | core | enum ConditionKind |
| description | `String` | core |  |
| synonyms | `[String!]` | core |  |

No relationship fields.

Incoming from other node types (15):

- `(Activity)-[:ASSESSES]->(Condition)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Condition)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Condition)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Condition)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Condition)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Condition)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(Condition)` ← Chunk.mentions via Subjectable
- `(Condition)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Condition)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(OutcomeDefinition)-[:MEASURES]->(Condition)` ← OutcomeDefinition.measures via OutcomeMeasureTarget
- `(ProtocolStep)-[:STEP_USES]->(Condition)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Condition)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Condition)` ← ReportItem.about via Subjectable
- `(Study)-[:INVESTIGATES]->(Condition)` ← Study.conditions
- `(Target)-[:OPERATIONALIZED_BY]->(Condition)` ← Target.operationalizedBy via TargetMeasure

### Mechanism

Fragment D2 · uid `hu:mechanism:` · labels `Mechanism:Entity` · implements Entity, Subjectable · mutations none.

Purpose: a curated mechanism concept — hallmark of aging, biological process, curated pathway record or molecular function (mechanismKind) — the vocabulary every mechanism claim resolves to and the h…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| key | `String` | core |  |
| mechanismKind | `MechanismKind` | core | enum MechanismKind |
| referenceScheme | `MechanismReferenceScheme` | core | enum MechanismReferenceScheme |
| referenceRelease | `String` | core |  |
| description | `String` | core |  |
| synonyms | `[String!]` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Mechanism)-[:PART_OF_MECHANISM]->(Mechanism)` | asserted | MechanismReferenceProperties | many (reference hierarchy: Reactome hasEvent, GO is_a/part_of, BellLabs hallmark mapping; one Assertion per authority record and release, recorded time only) | partOf (OUT) |
| `(ChemicalSubstance)-[:PARTICIPATES_IN]->(Mechanism)` | asserted | MechanismReferenceProperties | many (D1 small-molecule participants: NAD+, NAAD, NMN in Reactome participant lists; stored (ChemicalSubstance)-[:PARTICIPATES_IN]->(Mechanism); one Assertion per authority record and release) | metaboliteParticipants (IN) |
| `(MechanismModulator ∪2)-[:AFFECTS_MECHANISM]->(Mechanism)` | derived · read-only | MechanismProjectionProperties | many (projection d2.affects-mechanism/v1 over mechanism Assertions and their contexts, molecular-target and metabolite objects rolled up through PARTICIPATES_IN; stored (ChemicalSubstance|Intervention)-[:AFFECTS_MECHANISM]->(Mechanism); regenerable; unscored facet shortcut, score null, R-47) | affectedBy (IN) · 2 concrete targets |

Incoming from other node types (14):

- `(Activity)-[:ASSESSES]->(Mechanism)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Mechanism)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Mechanism)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Mechanism)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Mechanism)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Mechanism)` ← Association.members via Subjectable
- `(Biomarker)-[:REFLECTS_MECHANISM]->(Mechanism)` ← Biomarker.reflectsMechanisms
- `(Chunk)-[:MENTIONS]->(Mechanism)` ← Chunk.mentions via Subjectable
- `(Mechanism)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Mechanism)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(MolecularEntity)-[:PARTICIPATES_IN]->(Mechanism)` ← MolecularEntity.participatesIn
- `(ProtocolStep)-[:STEP_USES]->(Mechanism)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Mechanism)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Mechanism)` ← ReportItem.about via Subjectable

### MechanismEvidenceContext

Fragment D2 · uid `hu:mech-context:` · labels `MechanismEvidenceContext` · implements Entity · mutations none.

Purpose: the per-context qualifier of mechanism findings (round 0003 M3): one exposure group measured in one compartment of one organism in one setting.

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| contextKey | `String` | core |  |
| groupLabel | `String` | core |  |
| setting | `MechanismSetting` | core | enum MechanismSetting |
| organism | `ModelOrganism` | core | enum ModelOrganism |
| ncbiTaxonId | `String` | core |  |
| strainOrLine | `String` | core |  |
| sexScope | `SexScope` | core | enum SexScope |
| ageDescriptor | `String` | core |  |
| sampleSize | `Int` | core |  |
| compartmentKind | `CompartmentKind` | core | enum CompartmentKind |
| compartmentOntologyId | `String` | core |  |
| compartmentLabel | `String` | core |  |
| geneticManipulation | `GeneticManipulation` | core | enum GeneticManipulation |
| exposureAmount | `Float` | core |  |
| exposureUnitCode | `String` | core |  |
| exposureBasis | `AmountBasis` | core | enum AmountBasis |
| route | `AdministrationRoute` | core | enum AdministrationRoute |
| exposureDurationIso | `String` | core |  |
| assayText | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Assertion)-[:OBSERVED_IN_CONTEXT]->(MechanismEvidenceContext)` | structural | StructuralEdgeProperties | one_or_more per context, zero_or_one context per Assertion (stored (Assertion)-[:OBSERVED_IN_CONTEXT]->(MechanismEvidenceContext); D2 mechanism Assertions only, never D5 adverse-effect records; written in the same intent as the Assertion and corrected only by superseding it, R-29) | assertions (IN) |
| `(MechanismEvidenceContext)-[:EXPOSED_TO]->(ContextExposure ∪3)` | structural | ExposureRoleProperties | one_or_more (exactly one TESTED exposure unless geneticManipulation is set; BACKGROUND and COMPARATOR optional; structural per R-26, written alongside IN_STUDY_ARM where single-substance reach is needed, R-86) | exposures (OUT) · 3 concrete targets |
| `(MechanismEvidenceContext)-[:IN_STUDY_ARM]->(StudyArm)` | structural | StructuralEdgeProperties | zero_or_more (the trial arm(s) the group belongs to; a paper may pool registry arms, fixture metformin-exercise-harm; a registered group's dose of record is read through it) | studyArm (OUT) |

Incoming from other node types (1):

- `(MechanismEvidenceContext)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity

### MolecularEntity

Fragment D2 · uid `hu:molecular-entity:` · labels `MolecularEntity:Entity` · implements Entity, Subjectable · mutations none.

Purpose: a gene, protein, protein complex, protein family or non-coding RNA that is a curated participant in a mechanism or the object of a compound's molecular-target Assertion (ChEMBL: sirolimus IN…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| entityKind | `MolecularEntityKind` | core | enum MolecularEntityKind |
| geneSymbol | `String` | core |  |
| organism | `ModelOrganism` | core | enum ModelOrganism |
| ncbiTaxonId | `String` | core |  |
| description | `String` | core |  |
| synonyms | `[String!]` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(MolecularEntity)-[:PARTICIPATES_IN]->(Mechanism)` | asserted | MechanismReferenceProperties | many (Reactome participants, GO annotations, GenAge; one Assertion per authority record and release, MechanismReferenceProperties with role and release) | participatesIn (OUT) |

Incoming from other node types (13):

- `(Activity)-[:ASSESSES]->(MolecularEntity)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(MolecularEntity)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(MolecularEntity)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(MolecularEntity)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(MolecularEntity)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(MolecularEntity)` ← Association.members via Subjectable
- `(Biomarker)-[:HAS_ANALYTE]->(MolecularEntity)` ← Biomarker.analyteEntities
- `(Chunk)-[:MENTIONS]->(MolecularEntity)` ← Chunk.mentions via Subjectable
- `(MolecularEntity)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(MolecularEntity)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(MolecularEntity)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(MolecularEntity)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(MolecularEntity)` ← ReportItem.about via Subjectable

### Outcome

Fragment D2 · uid `hu:outcome:` · labels `Outcome:Entity` · implements Entity, Subjectable · mutations none.

Purpose: a study-independent endpoint concept (lifespan, all-cause mortality, handgrip strength, VO2max, sleep quality) — the join point where D3 OutcomeDefinitions (MEASURES), D5 Targets (OPERATIONA…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| key | `String` | core |  |
| outcomeKind | `OutcomeKind` | core | enum OutcomeKind |
| description | `String` | core |  |
| synonyms | `[String!]` | core |  |

No relationship fields.

Incoming from other node types (14):

- `(Activity)-[:ASSESSES]->(Outcome)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Outcome)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Outcome)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Outcome)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Outcome)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Outcome)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(Outcome)` ← Chunk.mentions via Subjectable
- `(Outcome)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Outcome)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(OutcomeDefinition)-[:MEASURES]->(Outcome)` ← OutcomeDefinition.measures via OutcomeMeasureTarget
- `(ProtocolStep)-[:STEP_USES]->(Outcome)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Outcome)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Outcome)` ← ReportItem.about via Subjectable
- `(Target)-[:OPERATIONALIZED_BY]->(Outcome)` ← Target.operationalizedBy via TargetMeasure

## Domain D4: Fragment D3

Slug `D3` · fragments D3 · 8 node types.


### Node-edge-node overview

Every edge declared by a node type of this domain, one line each (OUT direction only; IN fields are listed on the node card as incoming declarations).

```
(InterventionComponent)-[:ADMINISTERS {AssertedRecordedProperties}]->(AdministeredMaterial ∪5)  asserted · zero_or_one (exactly one once resolved; unresolved components keep only materialTextVerbatim)
(OutcomeDefinition)-[:STATED_IN {AssertedRecordedProperties}]->(StatingRecord ∪2)  asserted · one_or_more (each registration version and publication declaring this measure at this priority)
(OutcomeDefinition)-[:MEASURES {AssertedRecordedProperties}]->(OutcomeMeasureTarget ∪4)  asserted · zero_or_one (curated resolution of the measure; unresolved stays empty)
(Publication)-[:REPORTS_ON {AssertedRecordedProperties}]->(Study)  asserted · many (none for most notices; several for pooled or secondary analyses; asserted by the paper, by the registry references module or by NLM DataBank links)
(Publication)-[:REVISES {RevisionEdgeProperties}]->(Publication)  asserted · many (this identified notice or newer version revises that work; one episode per asserter — NLM, publisher via Crossref, Retraction Watch via Crossref, preprint server, BellLabs curation — with that asserter's revisionKind; reasons in Assertion.qualifiers; status-only flags are kernel HAS_REVISION_STATUS Assertions)
(Study)-[:HAS_REGISTRATION_VERSION {AssertedEdgeProperties}]->(RegistrationVersion)  asserted · many (EXCLUSIVE per registry: one open valid-time episode per registry, register field exclusive: true, executor-enforced (R-10); reconstructed versions carry the registry's stated date as valid time)
(Study)-[:HAS_ARM {StructuralEdgeProperties}]->(StudyArm)  structural · many (one per arm per stating source)
(Study)-[:HAS_POPULATION {StructuralEdgeProperties}]->(StudyPopulation)  structural · many (eligible / enrolled / randomized / analyzed per stating source)
(Study)-[:HAS_OUTCOME {StructuralEdgeProperties}]->(OutcomeDefinition)  structural · many (one per distinct measure, timepoint and declared priority)
(Study)-[:HAS_STUDY_ROLE {StudyRoleEdgeProperties}]->(StudyParty ∪3)  asserted · many (one episode per party, role and asserting registry or paper; registries disagree: ASPREE lead sponsor Hennepin on CTG vs Monash on ISRCTN; D7 declares no inverse)
(Study)-[:INVESTIGATES {AssertedRecordedProperties}]->(Condition)  asserted · many (conditions the registry or paper says the study investigates, resolved to D2 Condition; verbatim names stay on RegistrationVersion.conditionsVerbatim)
(StudyArm)-[:HAS_COMPONENT {StructuralEdgeProperties}]->(InterventionComponent)  structural · one_or_more (none for NO_INTERVENTION)
(StudyArm)-[:STATED_IN {AssertedRecordedProperties}]->(StatingRecord ∪2)  asserted · one_or_more (each registry version or publication that states this arm; the Assertion cites the locator)
(StudyPopulation)-[:STATED_IN {AssertedRecordedProperties}]->(StatingRecord ∪2)  asserted · one_or_more
(StudyResult)-[:RESULT_FOR {StructuralEdgeProperties}]->(OutcomeDefinition)  structural · exactly_one
(StudyResult)-[:RESULT_FOR_ARM {StructuralEdgeProperties}]->(StudyArm)  structural · one_or_more (one arm for descriptive and within-arm results, two or more for comparisons; the reference arm is comparatorArmKey)
(StudyResult)-[:STATED_IN {AssertedRecordedProperties}]->(StatingRecord ∪2)  asserted · one_or_more (each record of the result's source family that states these numbers, usually one; its Assertion cites one locator per number)
```

### InterventionComponent

Fragment D3 · uid `hu:intervention-component:` · labels `InterventionComponent:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one administered thing inside one arm with its dose as stated — amount, unit, basis (per dose / day / kg diet), mass basis (salt vs moiety), form, route, schedule, duration, verbatim dose te…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| componentRole | `ComponentRole!` | core | required, enum ComponentRole |
| materialTextVerbatim | `String!` | core | required |
| interventionTypeVerbatim | `String` | core |  |
| quantity | `Float` | core |  |
| unitCode | `String` | core |  |
| quantityBasis | `AmountBasis` | core | enum AmountBasis |
| massBasis | `MassBasis` | core | enum MassBasis |
| route | `AdministrationRoute` | core | enum AdministrationRoute |
| dosageForm | `String` | core |  |
| scheduleText | `String` | core |  |
| durationIso | `String` | core |  |
| verbatimDoseText | `String` | core |  |
| lotCodeVerbatim | `String` | core |  |
| supplierNameVerbatim | `String` | core |  |
| payloadHash | `String!` | core | required |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(InterventionComponent)-[:ADMINISTERS]->(AdministeredMaterial ∪5)` | asserted | AssertedRecordedProperties | zero_or_one (exactly one once resolved; unresolved components keep only materialTextVerbatim) | administers (OUT) · 5 concrete targets |

Incoming from other node types (13):

- `(Activity)-[:ASSESSES]->(InterventionComponent)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(InterventionComponent)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(InterventionComponent)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(InterventionComponent)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(InterventionComponent)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(InterventionComponent)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(InterventionComponent)` ← Chunk.mentions via Subjectable
- `(InterventionComponent)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(InterventionComponent)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(InterventionComponent)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(InterventionComponent)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(InterventionComponent)` ← ReportItem.about via Subjectable
- `(StudyArm)-[:HAS_COMPONENT]->(InterventionComponent)` ← StudyArm.components

### OutcomeDefinition

Fragment D3 · uid `hu:outcome-definition:` · labels `OutcomeDefinition:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one outcome measure at one timepoint with one declared priority (the same measure at 2, 4 and 20 weeks is three definitions; a measure demoted from primary to secondary in a later version is…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| outcomeKey | `String!` | core | required |
| priority | `OutcomePriority!` | core | required, enum OutcomePriority |
| measureKind | `MeasureKind!` | core | required, enum MeasureKind |
| timepoint | `String` | core |  |
| description | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(OutcomeDefinition)-[:STATED_IN]->(StatingRecord ∪2)` | asserted | AssertedRecordedProperties | one_or_more (each registration version and publication declaring this measure at this priority) | statedIn (OUT) · 2 concrete targets |
| `(OutcomeDefinition)-[:MEASURES]->(OutcomeMeasureTarget ∪4)` | asserted | AssertedRecordedProperties | zero_or_one (curated resolution of the measure; unresolved stays empty) | measures (OUT) · 4 concrete targets |

Incoming from other node types (14):

- `(Activity)-[:ASSESSES]->(OutcomeDefinition)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(OutcomeDefinition)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(OutcomeDefinition)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(OutcomeDefinition)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(OutcomeDefinition)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(OutcomeDefinition)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(OutcomeDefinition)` ← Chunk.mentions via Subjectable
- `(OutcomeDefinition)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(OutcomeDefinition)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(OutcomeDefinition)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(OutcomeDefinition)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(OutcomeDefinition)` ← ReportItem.about via Subjectable
- `(Study)-[:HAS_OUTCOME]->(OutcomeDefinition)` ← Study.outcomes
- `(StudyResult)-[:RESULT_FOR]->(OutcomeDefinition)` ← StudyResult.outcome

### Publication

Fragment D3 · uid `hu:publication:` · labels `Publication:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one scholarly work or one version of it — journal article, preprint version, systematic review version, protocol or analysis plan, conference abstract, correction / retraction / expression-o…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| publicationKind | `PublicationKind!` | core | required, enum PublicationKind |
| versionLabel | `String` | core |  |
| publishedAt | `DateTime` | core |  |
| publishedAtPrecision | `TimePrecision` | core | enum TimePrecision |
| venueName | `String` | core |  |
| citationText | `String` | core |  |
| revisionStatus | `SourceRevisionKind` | core | enum SourceRevisionKind |
| revisionStatusDerivedAt | `DateTime` | core |  |
| revisionStatusMethodVersion | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Publication)-[:REPORTS_ON]->(Study)` | asserted | AssertedRecordedProperties | many (none for most notices; several for pooled or secondary analyses; asserted by the paper, by the registry references module or by NLM DataBank links) | reportsOn (OUT) |
| `(Publication)-[:REVISES]->(Publication)` | asserted | RevisionEdgeProperties | many (this identified notice or newer version revises that work; one episode per asserter — NLM, publisher via Crossref, Retraction Watch via Crossref, preprint server, BellLabs curation — with that asserter's revisionKind; reasons in Assertion.qualifiers; status-only flags are kernel HAS_REVISION_STATUS Assertions) | revises (OUT) |
| `(Source)-[:RENDITION_OF]->(Publication)` | asserted | AssertedRecordedProperties | many (kernel Source → this work; one Source per rendition endpoint: PubMed record, PMC JATS, DOI landing page, PDF) | renditions (IN) |

Incoming from other node types (16):

- `(Activity)-[:ASSESSES]->(Publication)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Publication)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Publication)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Publication)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Publication)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Publication)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(Publication)` ← Chunk.mentions via Subjectable
- `(OutcomeDefinition)-[:STATED_IN]->(Publication)` ← OutcomeDefinition.statedIn via StatingRecord
- `(ProtocolStep)-[:STEP_USES]->(Publication)` ← ProtocolStep.uses via Subjectable
- `(Publication)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Publication)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Report)-[:ASSESSES]->(Publication)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Publication)` ← ReportItem.about via Subjectable
- `(StudyArm)-[:STATED_IN]->(Publication)` ← StudyArm.statedIn via StatingRecord
- `(StudyPopulation)-[:STATED_IN]->(Publication)` ← StudyPopulation.statedIn via StatingRecord
- `(StudyResult)-[:STATED_IN]->(Publication)` ← StudyResult.statedIn via StatingRecord

### RegistrationVersion

Fragment D3 · uid `hu:registration-version:` · labels `RegistrationVersion:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one version of one registration as a registry stated it at a point in valid time — status, enrollment (actual vs estimated), dates, results posting and submission events, design fields, verb…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| registry | `RegistryKind!` | core | required, enum RegistryKind |
| registrationId | `String!` | core | required |
| versionNumber | `Int` | core |  |
| versionDate | `DateTime` | core |  |
| versionDatePrecision | `TimePrecision` | core | enum TimePrecision |
| populatingMode | `VersionPopulatingMode!` | core | required, enum VersionPopulatingMode |
| payloadHash | `String!` | core | required |
| officialTitle | `String` | core |  |
| acronym | `String` | core |  |
| overallStatus | `RegistryStatus` | core | enum RegistryStatus |
| overallStatusVerbatim | `String` | core |  |
| studyTypeVerbatim | `String` | core |  |
| whyStopped | `String` | core |  |
| enrollmentCount | `Int` | core |  |
| enrollmentCountType | `EnrollmentCountType` | core | enum EnrollmentCountType |
| firstSubmittedDate | `DateTime` | core |  |
| startDate | `DateTime` | core |  |
| startDateType | `RegistryDateType` | core | enum RegistryDateType |
| primaryCompletionDate | `DateTime` | core |  |
| primaryCompletionDatePrecision | `TimePrecision` | core | enum TimePrecision |
| primaryCompletionDateType | `RegistryDateType` | core | enum RegistryDateType |
| completionDate | `DateTime` | core |  |
| completionDateType | `RegistryDateType` | core | enum RegistryDateType |
| resultsPosted | `Boolean` | core |  |
| resultsFirstPostedDate | `DateTime` | core |  |
| resultsSubmissionEvents | `[String!]` | core |  |
| phase | `[TrialPhase!]` | core | enum TrialPhase |
| allocation | `AllocationKind` | core | enum AllocationKind |
| masking | `MaskingKind` | core | enum MaskingKind |
| primaryPurpose | `String` | core |  |
| interventionModel | `String` | core |  |
| conditionsVerbatim | `[String!]` | core |  |
| interventionNamesVerbatim | `[String!]` | core |  |
| sponsorNameVerbatim | `String` | core |  |
| collaboratorNamesVerbatim | `[String!]` | core |  |
| funderNamesVerbatim | `[String!]` | core |  |
| siteCountries | `[String!]` | core |  |

No relationship fields.

Incoming from other node types (17):

- `(Activity)-[:ASSESSES]->(RegistrationVersion)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(RegistrationVersion)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(RegistrationVersion)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(RegistrationVersion)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(RegistrationVersion)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(RegistrationVersion)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(RegistrationVersion)` ← Chunk.mentions via Subjectable
- `(OutcomeDefinition)-[:STATED_IN]->(RegistrationVersion)` ← OutcomeDefinition.statedIn via StatingRecord
- `(ProtocolStep)-[:STEP_USES]->(RegistrationVersion)` ← ProtocolStep.uses via Subjectable
- `(RegistrationVersion)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(RegistrationVersion)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Report)-[:ASSESSES]->(RegistrationVersion)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(RegistrationVersion)` ← ReportItem.about via Subjectable
- `(Study)-[:HAS_REGISTRATION_VERSION]->(RegistrationVersion)` ← Study.registrationVersions
- `(StudyArm)-[:STATED_IN]->(RegistrationVersion)` ← StudyArm.statedIn via StatingRecord
- `(StudyPopulation)-[:STATED_IN]->(RegistrationVersion)` ← StudyPopulation.statedIn via StatingRecord
- `(StudyResult)-[:STATED_IN]->(RegistrationVersion)` ← StudyResult.statedIn via StatingRecord

### Study

Fragment D3 · uid `hu:study:` · labels `Study:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one investigation (trial, cohort, preclinical experiment, systematic review) independent of how many registrations, versions and papers describe it; the join point of every D3 question (arms…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| studyKind | `StudyKind!` | core | required, enum StudyKind |
| acronym | `String` | core |  |
| phase | `[TrialPhase!]` | core | enum TrialPhase |
| overallStatus | `RegistryStatus` | core | enum RegistryStatus |
| primaryCompletionDate | `DateTime` | core |  |
| primaryCompletionDateType | `RegistryDateType` | core | enum RegistryDateType |
| resultsPosted | `Boolean` | core |  |
| projectionOfRegistrationVersionUid | `String` | core |  |
| projectionMethodVersion | `String` | core |  |
| projectionDerivedAt | `DateTime` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Study)-[:HAS_REGISTRATION_VERSION]->(RegistrationVersion)` | asserted | AssertedEdgeProperties | many (EXCLUSIVE per registry: one open valid-time episode per registry, register field exclusive: true, executor-enforced (R-10); reconstructed versions carry the registry's stated date as valid time) | registrationVersions (OUT) |
| `(Study)-[:HAS_ARM]->(StudyArm)` | structural | StructuralEdgeProperties | many (one per arm per stating source) | arms (OUT) |
| `(Study)-[:HAS_POPULATION]->(StudyPopulation)` | structural | StructuralEdgeProperties | many (eligible / enrolled / randomized / analyzed per stating source) | populations (OUT) |
| `(Study)-[:HAS_OUTCOME]->(OutcomeDefinition)` | structural | StructuralEdgeProperties | many (one per distinct measure, timepoint and declared priority) | outcomes (OUT) |
| `(Study)-[:HAS_STUDY_ROLE]->(StudyParty ∪3)` | asserted | StudyRoleEdgeProperties | many (one episode per party, role and asserting registry or paper; registries disagree: ASPREE lead sponsor Hennepin on CTG vs Monash on ISRCTN; D7 declares no inverse) | roles (OUT) · 3 concrete targets |
| `(Study)-[:INVESTIGATES]->(Condition)` | asserted | AssertedRecordedProperties | many (conditions the registry or paper says the study investigates, resolved to D2 Condition; verbatim names stay on RegistrationVersion.conditionsVerbatim) | conditions (OUT) |

Incoming from other node types (14):

- `(Activity)-[:ASSESSES]->(Study)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Study)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Study)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Study)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Study)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Study)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(Study)` ← Chunk.mentions via Subjectable
- `(ProtocolStep)-[:STEP_USES]->(Study)` ← ProtocolStep.uses via Subjectable
- `(Publication)-[:REPORTS_ON]->(Study)` ← Publication.reportsOn
- `(Report)-[:ASSESSES]->(Study)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Study)` ← ReportItem.about via Subjectable
- `(Study)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Study)-[:ON_FRONTIER]->(Frontier)` ← Frontier.studies
- `(Study)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity

### StudyArm

Fragment D3 · uid `hu:arm:` · labels `StudyArm:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one arm or group of a study as one source states it (registry arms/groups, paper randomization groups) — the unit results, adverse events and administered components hang on.

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| armType | `ArmType` | core | enum ArmType |
| armKey | `String!` | core | required |
| plannedSize | `Int` | core |  |
| description | `String` | core |  |
| payloadHash | `String!` | core | required |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(StudyArm)-[:HAS_COMPONENT]->(InterventionComponent)` | structural | StructuralEdgeProperties | one_or_more (none for NO_INTERVENTION) | components (OUT) |
| `(StudyArm)-[:STATED_IN]->(StatingRecord ∪2)` | asserted | AssertedRecordedProperties | one_or_more (each registry version or publication that states this arm; the Assertion cites the locator) | statedIn (OUT) · 2 concrete targets |

Incoming from other node types (15):

- `(Activity)-[:ASSESSES]->(StudyArm)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(StudyArm)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(StudyArm)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(StudyArm)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(StudyArm)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(StudyArm)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(StudyArm)` ← Chunk.mentions via Subjectable
- `(MechanismEvidenceContext)-[:IN_STUDY_ARM]->(StudyArm)` ← MechanismEvidenceContext.studyArm
- `(ProtocolStep)-[:STEP_USES]->(StudyArm)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(StudyArm)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(StudyArm)` ← ReportItem.about via Subjectable
- `(Study)-[:HAS_ARM]->(StudyArm)` ← Study.arms
- `(StudyArm)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(StudyArm)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(StudyResult)-[:RESULT_FOR_ARM]->(StudyArm)` ← StudyResult.arms

### StudyPopulation

Fragment D3 · uid `hu:study-population:` · labels `StudyPopulation:Entity` · implements Entity, Subjectable · mutations none.

Purpose: who was eligible, enrolled, randomized or analyzed, as one source states it: size, sex and age bounds, healthy volunteers, species and strain for preclinical work (NCBI Taxonomy id as a stri…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| populationKind | `StudyPopulationKind!` | core | required, enum StudyPopulationKind |
| analysisSet | `AnalysisSetKind` | core | enum AnalysisSetKind |
| size | `Int` | core |  |
| sizeText | `String` | core |  |
| sexScope | `SexScope` | core | enum SexScope |
| minAgeYears | `Float` | core |  |
| maxAgeYears | `Float` | core |  |
| ageText | `String` | core |  |
| healthyVolunteers | `Boolean` | core |  |
| ncbiTaxonId | `String` | core |  |
| strainOrLine | `String` | core |  |
| eligibilityCriteriaText | `String` | core |  |
| enrichmentText | `String` | core |  |
| payloadHash | `String!` | core | required |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(StudyPopulation)-[:STATED_IN]->(StatingRecord ∪2)` | asserted | AssertedRecordedProperties | one_or_more | statedIn (OUT) · 2 concrete targets |

Incoming from other node types (13):

- `(Activity)-[:ASSESSES]->(StudyPopulation)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(StudyPopulation)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(StudyPopulation)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(StudyPopulation)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(StudyPopulation)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(StudyPopulation)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(StudyPopulation)` ← Chunk.mentions via Subjectable
- `(ProtocolStep)-[:STEP_USES]->(StudyPopulation)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(StudyPopulation)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(StudyPopulation)` ← ReportItem.about via Subjectable
- `(Study)-[:HAS_POPULATION]->(StudyPopulation)` ← Study.populations
- `(StudyPopulation)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(StudyPopulation)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity

### StudyResult

Fragment D3 · uid `hu:study-result:` · labels `StudyResult:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one reported number set for one outcome definition, one arm set, one analysis set, as one source states it (registry results module row, paper table cell, abstract sentence, pooled review es…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| resultKind | `StudyResultKind!` | core | required, enum StudyResultKind |
| analysisKind | `AnalysisKind!` | core | required, enum AnalysisKind |
| comparisonKind | `ComparisonKind!` | core | required, enum ComparisonKind |
| statisticalConclusion | `StatisticalConclusion!` | core | required, enum StatisticalConclusion |
| direction | `EstimateDirection` | core | enum EstimateDirection |
| analysisPopulation | `AnalysisSetKind` | core | enum AnalysisSetKind |
| sampleSize | `Int` | core |  |
| estimate | `Float` | core |  |
| estimateQualifier | `EstimateQualifier` | core | enum EstimateQualifier |
| unitCode | `String` | core |  |
| dispersionKind | `DispersionKind` | core | enum DispersionKind |
| dispersionValue | `Float` | core |  |
| intervalLower | `Float` | core |  |
| intervalUpper | `Float` | core |  |
| ciLevel | `Float` | core |  |
| pValue | `Float` | core |  |
| pValueText | `String` | core |  |
| multiplicityAdjusted | `Boolean` | core |  |
| subgroupLabel | `String` | core |  |
| comparatorArmKey | `String` | core |  |
| timepointText | `String` | core |  |
| resultText | `String` | core |  |
| seriousness | `AeSeriousness` | core | enum AeSeriousness |
| participantsAffected | `Int` | core |  |
| participantsAtRisk | `Int` | core |  |
| eventCount | `Int` | core |  |
| collectionMethod | `AeCollectionMethod` | core | enum AeCollectionMethod |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(StudyResult)-[:RESULT_FOR]->(OutcomeDefinition)` | structural | StructuralEdgeProperties | exactly_one | outcome (OUT) |
| `(StudyResult)-[:RESULT_FOR_ARM]->(StudyArm)` | structural | StructuralEdgeProperties | one_or_more (one arm for descriptive and within-arm results, two or more for comparisons; the reference arm is comparatorArmKey) | arms (OUT) |
| `(StudyResult)-[:STATED_IN]->(StatingRecord ∪2)` | asserted | AssertedRecordedProperties | one_or_more (each record of the result's source family that states these numbers, usually one; its Assertion cites one locator per number) | statedIn (OUT) · 2 concrete targets |

Incoming from other node types (12):

- `(Activity)-[:ASSESSES]->(StudyResult)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(StudyResult)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(StudyResult)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(StudyResult)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(StudyResult)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(StudyResult)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(StudyResult)` ← Chunk.mentions via Subjectable
- `(ProtocolStep)-[:STEP_USES]->(StudyResult)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(StudyResult)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(StudyResult)` ← ReportItem.about via Subjectable
- `(StudyResult)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(StudyResult)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity

## Domain D5: Fragment D4

Slug `D4` · fragments D4 · 7 node types.


### Node-edge-node overview

Every edge declared by a node type of this domain, one line each (OUT direction only; IN fields are listed on the node card as incoming declarations).

```
(AlgorithmVersion)-[:OUTPUTS_METRIC {StructuralEdgeProperties}]->(Metric)  structural · one_or_more
(AlgorithmVersion)-[:REQUIRES_INPUT_METRIC {StructuralEdgeProperties}]->(Metric)  structural · many (ordered by orderIndex when the source orders components)
(AlgorithmVersion)-[:DERIVED_FROM_ALGORITHM_VERSION {AssertedRecordedProperties}]->(AlgorithmVersion)  asserted · zero_or_one (vendor implementation → publication version; successor → predecessor)
(AlgorithmVersion)-[:RUNS_ON_DEVICE {AssertedEdgeProperties}]->(Device)  asserted · many (episode: which software state ran on a device model when)
(AssayVersion)-[:PERFORMED_BY_LAB {AssertedRecordedProperties}]->(Organization)  asserted · exactly_one (part of the version's identity: two labs = two assay versions; a curator inference of the performing organization uses basisKind CURATOR_CLASSIFICATION)
(Biomarker)-[:HAS_ANALYTE {StructuralEdgeProperties}]->(ChemicalSubstance)  structural · zero_or_one (the chemical analyte when the referent is a defined substance: NAD+, NAAD, 25-OH vitamin D)
(Biomarker)-[:HAS_ANALYTE {StructuralEdgeProperties}]->(MolecularEntity)  structural · zero_or_one (the gene product when the referent is a protein or protein modification: IL-6, HbA1c's hemoglobin beta; D2 Q-D2-03 'analyte-participant' branch)
(Biomarker)-[:REFLECTS_MECHANISM {AssertedRecordedProperties}]->(Mechanism)  asserted · many (one Assertion each, citing the paper that establishes the marker, e.g. NAAD for NR utilization)
(LabTest)-[:MEASURES_METRIC {AssertedEdgeProperties}]->(Metric)  asserted · one_or_more (episode: labs remap result codes to LOINC)
(LabTest)-[:PERFORMED_WITH_VERSION {AssertedEdgeProperties}]->(AssayVersion)  asserted · many (episode: a method or instrument change closes one and opens the next; several open when regional labs differ)
(LabTest)-[:PERFORMED_WITH_VERSION {AssertedEdgeProperties}]->(AlgorithmVersion)  asserted · many (episode: a report's algorithm implementation changes)
(LabTest)-[:INCLUDES_TEST {AssertedEdgeProperties}]->(LabTest)  asserted · many (PANEL only; episode = panel composition version)
(Metric)-[:QUANTIFIES {StructuralEdgeProperties}]->(Biomarker)  structural · one (curated; several Metrics may quantify one Biomarker)
(ReferenceIntervalVersion)-[:INTERVAL_FOR {StructuralEdgeProperties}]->(AssayVersion)  structural · zero_or_one (null only for a vendor target published without any test procedure)
(ReferenceIntervalVersion)-[:INTERVAL_FOR {StructuralEdgeProperties}]->(Metric)  structural · exactly_one
```

### AlgorithmVersion

Fragment D4 · uid `hu:algorithm-version:` · labels `AlgorithmVersion:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one fixed realization of a clock, risk score, wearable score, signal-processing or firmware build: the publication reference version (DunedinPACE, Belsky 2022), a vendor implementation ('Dun…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| algorithmFamily | `String!` | core | required |
| familyKey | `String!` | core | required |
| algorithmKind | `AlgorithmKind!` | core | required, enum AlgorithmKind |
| realization | `AlgorithmRealization!` | core | required, enum AlgorithmRealization |
| versionLabel | `String` | core |  |
| versionBasis | `AlgorithmVersionBasis!` | core | required, enum AlgorithmVersionBasis |
| versionPinnedAt | `Date` | core |  |
| outputKind | `AlgorithmOutputKind` | core | enum AlgorithmOutputKind |
| inputPlatforms | `[MeasurementPlatform!]` | core | enum MeasurementPlatform |
| inputFeatureCount | `Int` | core |  |
| trainingPopulationText | `String` | core |  |
| componentLabel | `String` | core |  |
| notReported | `[MeasurementField!]` | core | enum MeasurementField |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(AlgorithmVersion)-[:OUTPUTS_METRIC]->(Metric)` | structural | StructuralEdgeProperties | one_or_more | outputs (OUT) |
| `(AlgorithmVersion)-[:REQUIRES_INPUT_METRIC]->(Metric)` | structural | StructuralEdgeProperties | many (ordered by orderIndex when the source orders components) | inputs (OUT) |
| `(AlgorithmVersion)-[:DERIVED_FROM_ALGORITHM_VERSION]->(AlgorithmVersion)` | asserted | AssertedRecordedProperties | zero_or_one (vendor implementation → publication version; successor → predecessor) | derivedFrom (OUT) |
| `(AlgorithmVersion)-[:RUNS_ON_DEVICE]->(Device)` | asserted | AssertedEdgeProperties | many (episode: which software state ran on a device model when) | devices (OUT) |

Incoming from other node types (13):

- `(Activity)-[:ASSESSES]->(AlgorithmVersion)` ← Activity.about via Subjectable
- `(AlgorithmVersion)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(AlgorithmVersion)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Assertion)-[:ASSERTED_BY]->(AlgorithmVersion)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(AlgorithmVersion)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(AlgorithmVersion)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(AlgorithmVersion)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(AlgorithmVersion)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(AlgorithmVersion)` ← Chunk.mentions via Subjectable
- `(LabTest)-[:PERFORMED_WITH_VERSION]->(AlgorithmVersion)` ← LabTest.algorithmVersions
- `(ProtocolStep)-[:STEP_USES]->(AlgorithmVersion)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(AlgorithmVersion)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(AlgorithmVersion)` ← ReportItem.about via Subjectable

### AssayVersion

Fragment D4 · uid `hu:assay-version:` · labels `AssayVersion:Entity` · implements Entity, Subjectable · mutations none.

Purpose: how one laboratory ran one measurement procedure — performing lab (exactly one), method principle, instrument model, reagent kit, software version, specimen types, calibration traceability,…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| methodPrinciple | `MethodPrinciple` | core | enum MethodPrinciple |
| methodText | `String` | core |  |
| instrumentModelText | `String` | core |  |
| reagentKitText | `String` | core |  |
| softwareVersion | `String` | core |  |
| platform | `MeasurementPlatform` | core | enum MeasurementPlatform |
| specimenKinds | `[SpecimenKind!]` | core | enum SpecimenKind |
| specimenOntologyIds | `[String!]` | core |  |
| calibrationTraceability | `CalibrationTraceability` | core | enum CalibrationTraceability |
| reportedUnitCode | `String` | core |  |
| notReported | `[MeasurementField!]` | core | enum MeasurementField |
| payloadHash | `String!` | core | required |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(AssayVersion)-[:PERFORMED_BY_LAB]->(Organization)` | asserted | AssertedRecordedProperties | exactly_one (part of the version's identity: two labs = two assay versions; a curator inference of the performing organization uses basisKind CURATOR_CLASSIFICATION) | performingLab (OUT) |

Incoming from other node types (14):

- `(Activity)-[:ASSESSES]->(AssayVersion)` ← Activity.about via Subjectable
- `(AssayVersion)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(AssayVersion)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Assertion)-[:ASSERTED_BY]->(AssayVersion)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(AssayVersion)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(AssayVersion)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(AssayVersion)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(AssayVersion)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(AssayVersion)` ← Chunk.mentions via Subjectable
- `(LabTest)-[:PERFORMED_WITH_VERSION]->(AssayVersion)` ← LabTest.assayVersions
- `(ProtocolStep)-[:STEP_USES]->(AssayVersion)` ← ProtocolStep.uses via Subjectable
- `(ReferenceIntervalVersion)-[:INTERVAL_FOR]->(AssayVersion)` ← ReferenceIntervalVersion.assayVersions
- `(Report)-[:ASSESSES]->(AssayVersion)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(AssayVersion)` ← ReportItem.about via Subjectable

### Biomarker

Fragment D4 · uid `hu:biomarker:` · labels `Biomarker:Entity` · implements Entity, Subjectable · mutations none.

Purpose: the biological referent a measurement is about (NAD+, glycated hemoglobin, IgG glycan profile, pace of biological aging).

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| biomarkerKind | `BiomarkerKind!` | core | required, enum BiomarkerKind |
| description | `String` | core |  |
| searchText | `String` | search |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Biomarker)-[:HAS_ANALYTE]->(ChemicalSubstance)` | structural | StructuralEdgeProperties | zero_or_one (the chemical analyte when the referent is a defined substance: NAD+, NAAD, 25-OH vitamin D) | analytes (OUT) |
| `(Biomarker)-[:HAS_ANALYTE]->(MolecularEntity)` | structural | StructuralEdgeProperties | zero_or_one (the gene product when the referent is a protein or protein modification: IL-6, HbA1c's hemoglobin beta; D2 Q-D2-03 'analyte-participant' branch) | analyteEntities (OUT) |
| `(Biomarker)-[:REFLECTS_MECHANISM]->(Mechanism)` | asserted | AssertedRecordedProperties | many (one Assertion each, citing the paper that establishes the marker, e.g. NAAD for NR utilization) | reflectsMechanisms (OUT) |

Incoming from other node types (15):

- `(Activity)-[:ASSESSES]->(Biomarker)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Biomarker)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Biomarker)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Biomarker)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Biomarker)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Biomarker)` ← Association.members via Subjectable
- `(Biomarker)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Biomarker)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Chunk)-[:MENTIONS]->(Biomarker)` ← Chunk.mentions via Subjectable
- `(Metric)-[:QUANTIFIES]->(Biomarker)` ← Metric.quantifies
- `(OutcomeDefinition)-[:MEASURES]->(Biomarker)` ← OutcomeDefinition.measures via OutcomeMeasureTarget
- `(ProtocolStep)-[:STEP_USES]->(Biomarker)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Biomarker)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Biomarker)` ← ReportItem.about via Subjectable
- `(Target)-[:OPERATIONALIZED_BY]->(Biomarker)` ← Target.operationalizedBy via TargetMeasure

### Device

Fragment D4 · uid `hu:device:` · labels `Device:Entity` · implements Entity, Subjectable · mutations none.

Purpose: a device or instrument MODEL as its maker designates it, in its role as a measuring instrument (Oura Ring Gen3, WHOOP MG, Dexcom G7, FreeStyle Libre 3 sensor, Roche cobas c513, Illumina iSca…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| deviceKind | `DeviceKind!` | core | required, enum DeviceKind |
| sensingModalities | `[SensingModality!]` | core | enum SensingModality |
| deviceFamily | `String` | core |  |
| generationLabel | `String` | core |  |
| makerName | `String` | core |  |
| notReported | `[MeasurementField!]` | core | enum MeasurementField |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Product)-[:DELIVERS]->(Device)` | asserted | AssertedRecordedProperties | many (stored Product → Device; the D6 Product that is or contains this model) | products (IN) |

Incoming from other node types (13):

- `(Activity)-[:ASSESSES]->(Device)` ← Activity.about via Subjectable
- `(AlgorithmVersion)-[:RUNS_ON_DEVICE]->(Device)` ← AlgorithmVersion.devices
- `(Assertion)-[:ASSERTED_BY]->(Device)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Device)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Device)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Device)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Device)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(Device)` ← Chunk.mentions via Subjectable
- `(Device)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Device)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(Device)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Device)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Device)` ← ReportItem.about via Subjectable

### LabTest

Fragment D4 · uid `hu:lab-test:` · labels `LabTest:Entity` · implements Entity, Subjectable · mutations none.

Purpose: the orderable or purchasable test as a laboratory or vendor offers it (Labcorp 001453 'Hemoglobin (Hb) A1c', Quest 496, Jinfiniti Intracellular NAD test, TruAge report).

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| testKind | `LabTestKind!` | core | required, enum LabTestKind |
| orderChannel | `OrderChannel` | core | enum OrderChannel |
| collectionModes | `[CollectionMode!]` | core | enum CollectionMode |
| specimenText | `String` | core |  |
| preAnalyticalText | `String` | core |  |
| notReported | `[MeasurementField!]` | core | enum MeasurementField |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(LabTest)-[:MEASURES_METRIC]->(Metric)` | asserted | AssertedEdgeProperties | one_or_more (episode: labs remap result codes to LOINC) | metrics (OUT) |
| `(LabTest)-[:PERFORMED_WITH_VERSION]->(AssayVersion)` | asserted | AssertedEdgeProperties | many (episode: a method or instrument change closes one and opens the next; several open when regional labs differ) | assayVersions (OUT) |
| `(LabTest)-[:PERFORMED_WITH_VERSION]->(AlgorithmVersion)` | asserted | AssertedEdgeProperties | many (episode: a report's algorithm implementation changes) | algorithmVersions (OUT) |
| `(LabTest)-[:INCLUDES_TEST]->(LabTest)` | asserted | AssertedEdgeProperties | many (PANEL only; episode = panel composition version) | components (OUT) |
| `(Product)-[:DELIVERS]->(LabTest)` | asserted | AssertedRecordedProperties | many (stored Product → LabTest; D6 Product is the purchasable item that delivers this test) | products (IN) |

Incoming from other node types (12):

- `(Activity)-[:ASSESSES]->(LabTest)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(LabTest)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(LabTest)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(LabTest)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(LabTest)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(LabTest)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(LabTest)` ← Chunk.mentions via Subjectable
- `(LabTest)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(LabTest)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(LabTest)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(LabTest)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(LabTest)` ← ReportItem.about via Subjectable

### Metric

Fragment D4 · uid `hu:metric:` · labels `Metric:Entity` · implements Entity, Subjectable · mutations none.

Purpose: the measurand or feature definition — what exactly a number is: LOINC 4548-4 (HbA1c mass fraction in blood), 'NAD+ in red blood cells (µM)', WHOOP 'hrv_rmssd_milli', Apple 'heartRateVariabil…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| metricKind | `MetricKind!` | core | required, enum MetricKind |
| defaultResultKind | `DiagnosticResultKind!` | core | required, enum DiagnosticResultKind |
| definitionSource | `MetricDefinitionSource!` | core | required, enum MetricDefinitionSource |
| definitionIssuerName | `String` | core |  |
| definitionText | `String` | core |  |
| propertyText | `String` | core |  |
| systemText | `String` | core |  |
| systemOntologyId | `String` | core |  |
| scale | `MetricScale` | core | enum MetricScale |
| timeAspect | `String` | core |  |
| methodText | `String` | core |  |
| canonicalUnitCode | `String` | core |  |
| notReported | `[MeasurementField!]` | core | enum MeasurementField |
| searchText | `String` | search |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Metric)-[:QUANTIFIES]->(Biomarker)` | structural | StructuralEdgeProperties | one (curated; several Metrics may quantify one Biomarker) | quantifies (OUT) |

Incoming from other node types (18):

- `(Activity)-[:ASSESSES]->(Metric)` ← Activity.about via Subjectable
- `(AlgorithmVersion)-[:OUTPUTS_METRIC]->(Metric)` ← AlgorithmVersion.outputs
- `(AlgorithmVersion)-[:REQUIRES_INPUT_METRIC]->(Metric)` ← AlgorithmVersion.inputs
- `(Assertion)-[:ASSERTED_BY]->(Metric)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Metric)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Metric)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Metric)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Metric)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(Metric)` ← Chunk.mentions via Subjectable
- `(LabTest)-[:MEASURES_METRIC]->(Metric)` ← LabTest.metrics
- `(Metric)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Metric)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(OutcomeDefinition)-[:MEASURES]->(Metric)` ← OutcomeDefinition.measures via OutcomeMeasureTarget
- `(ProtocolStep)-[:STEP_USES]->(Metric)` ← ProtocolStep.uses via Subjectable
- `(ReferenceIntervalVersion)-[:INTERVAL_FOR]->(Metric)` ← ReferenceIntervalVersion.metrics
- `(Report)-[:ASSESSES]->(Metric)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Metric)` ← ReportItem.about via Subjectable
- `(Target)-[:OPERATIONALIZED_BY]->(Metric)` ← Target.operationalizedBy via TargetMeasure

### ReferenceIntervalVersion

Fragment D4 · uid `hu:ri-version:` · labels `ReferenceIntervalVersion:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one interval or limit a laboratory or vendor applies for one Metric on one AssayVersion and one population partition, with its kind (reference interval, decision limit, guideline target, ven…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| intervalKind | `ReferenceIntervalKind!` | core | required, enum ReferenceIntervalKind |
| derivation | `ReferenceIntervalDerivation!` | core | required, enum ReferenceIntervalDerivation |
| intervalText | `String!` | core | required |
| lowerBound | `Float` | core |  |
| upperBound | `Float` | core |  |
| lowerInclusive | `Boolean` | core |  |
| upperInclusive | `Boolean` | core |  |
| unitCode | `String` | core |  |
| sex | `SexScope` | core | enum SexScope |
| minAgeYears | `Float` | core |  |
| maxAgeYears | `Float` | core |  |
| partitionText | `String` | core |  |
| effectiveFrom | `Date` | core |  |
| effectiveTo | `Date` | core |  |
| notReported | `[MeasurementField!]` | core | enum MeasurementField |
| payloadHash | `String!` | core | required |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(ReferenceIntervalVersion)-[:INTERVAL_FOR]->(AssayVersion)` | structural | StructuralEdgeProperties | zero_or_one (null only for a vendor target published without any test procedure) | assayVersions (OUT) |
| `(ReferenceIntervalVersion)-[:INTERVAL_FOR]->(Metric)` | structural | StructuralEdgeProperties | exactly_one | metrics (OUT) |

Incoming from other node types (12):

- `(Activity)-[:ASSESSES]->(ReferenceIntervalVersion)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(ReferenceIntervalVersion)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(ReferenceIntervalVersion)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(ReferenceIntervalVersion)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(ReferenceIntervalVersion)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(ReferenceIntervalVersion)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(ReferenceIntervalVersion)` ← Chunk.mentions via Subjectable
- `(ProtocolStep)-[:STEP_USES]->(ReferenceIntervalVersion)` ← ProtocolStep.uses via Subjectable
- `(ReferenceIntervalVersion)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(ReferenceIntervalVersion)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Report)-[:ASSESSES]->(ReferenceIntervalVersion)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(ReferenceIntervalVersion)` ← ReportItem.about via Subjectable

## Domain D6: Fragment D5

Slug `D5` · fragments D5 · 6 node types.


### Node-edge-node overview

Every edge declared by a node type of this domain, one line each (OUT direction only; IN fields are listed on the node card as incoming declarations).

```
(Protocol)-[:HAS_EDITION {AssertedEdgeProperties}]->(ProtocolEdition)  asserted · one_or_more (EXCLUSIVE: at most one open episode per protocol in valid x recorded time; AssertedEdgeProperties, register field exclusive: true enforced by the executor per relationship type, R-10)
(ProtocolEdition)-[:HAS_STEP {StructuralEdgeProperties}]->(ProtocolStep)  structural · one_or_more (orderIndex = source order)
(ProtocolStep)-[:STEP_USES {StructuralEdgeProperties}]->(Subjectable ◇56)  structural · zero_or_more (one primary means; none for informational OTHER / CONSULT steps). Target is the kernel interface Subjectable, one of the two registered domain exceptions (R-28; the admissible list is in the D5 relationship register and executor-enforced)
(ProtocolStep)-[:STATES_CONSTRAINT {DerivedEdgeProperties}]->(UseConstraint)  derived · many (projection use-constraint-key/v2: when the protocol author's USE_CONSTRAINED_IN | INTERACTS_WITH | HAS_UPPER_LIMIT Assertion cites this step's locatorUid, or a locator inside its span on the same snapshot, and resolves to a UseConstraint, the step gets this edge to it; regenerable, never part of the edition payload)
(Target)-[:OPERATIONALIZED_BY {AssertedRecordedProperties}]->(TargetMeasure ∪4)  asserted · many (curated vocabulary mapping, not a claim of effect)
```

### Intervention

Fragment D5 · uid `hu:?:` · labels `Intervention:Entity` · implements Entity, Subjectable · mutations none.

Purpose: an intervention CONCEPT that is not simply a substance or a product: a practice (morning sunlight viewing, sauna bathing, resistance training), a procedure, a device-based practice, or a nam…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| kind | `InterventionKind!` | core | required, enum InterventionKind |
| definition | `String` | core |  |
| regimenQualifier | `String` | core |  |
| synonyms | `[String!]` | core |  |

No relationship fields.

Incoming from other node types (15):

- `(Activity)-[:ASSESSES]->(Intervention)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Intervention)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Intervention)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Intervention)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Intervention)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Intervention)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(Intervention)` ← Chunk.mentions via Subjectable
- `(Intervention)-[:AFFECTS_MECHANISM]->(Mechanism)` ← Mechanism.affectedBy via MechanismModulator
- `(Intervention)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Intervention)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(InterventionComponent)-[:ADMINISTERS]->(Intervention)` ← InterventionComponent.administers via AdministeredMaterial
- `(MechanismEvidenceContext)-[:EXPOSED_TO]->(Intervention)` ← MechanismEvidenceContext.exposures via ContextExposure
- `(ProtocolStep)-[:STEP_USES]->(Intervention)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Intervention)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Intervention)` ← ReportItem.about via Subjectable

### Protocol

Fragment D5 · uid `hu:protocol:` · labels `Protocol:Entity` · implements Entity, Subjectable · mutations none.

Purpose: the enduring identity of a public protocol (a creator's toolkit page, a published longevity protocol, a clinic's program definition).

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| canonicalUri | `String` | identity |  |
| description | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Protocol)-[:HAS_EDITION]->(ProtocolEdition)` | asserted | AssertedEdgeProperties | one_or_more (EXCLUSIVE: at most one open episode per protocol in valid x recorded time; AssertedEdgeProperties, register field exclusive: true enforced by the executor per relationship type, R-10) | editions (OUT) |

Incoming from other node types (12):

- `(Activity)-[:ASSESSES]->(Protocol)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Protocol)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Protocol)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Protocol)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Protocol)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Protocol)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(Protocol)` ← Chunk.mentions via Subjectable
- `(Protocol)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Protocol)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(Protocol)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Protocol)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Protocol)` ← ReportItem.about via Subjectable

### ProtocolEdition

Fragment D5 · uid `hu:protocol-edition:` · labels `ProtocolEdition:Entity` · implements Entity, Subjectable · mutations none.

Purpose: the immutable content of one observed or published state of a Protocol: its ordered steps (with their doses, timing, stated constraints, stated targets and review rules).

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| payloadHash | `String!` | core | required |
| payloadCanonicalizationVersion | `String` | core |  |
| stepKeyAlignmentVersion | `String` | core |  |
| changeProvenance | `ProtocolChangeProvenance!` | core | required, enum ProtocolChangeProvenance |
| editionLabel | `String` | core |  |
| displayedDateText | `String` | core |  |
| firstObservedAt | `DateTime` | core |  |
| lastObservedAt | `DateTime` | core |  |
| stepCount | `Int` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(ProtocolEdition)-[:HAS_STEP]->(ProtocolStep)` | structural | StructuralEdgeProperties | one_or_more (orderIndex = source order) | steps (OUT) |

Incoming from other node types (13):

- `(Activity)-[:ASSESSES]->(ProtocolEdition)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(ProtocolEdition)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(ProtocolEdition)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(ProtocolEdition)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(ProtocolEdition)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(ProtocolEdition)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(ProtocolEdition)` ← Chunk.mentions via Subjectable
- `(Protocol)-[:HAS_EDITION]->(ProtocolEdition)` ← Protocol.editions
- `(ProtocolEdition)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(ProtocolEdition)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(ProtocolEdition)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(ProtocolEdition)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(ProtocolEdition)` ← ReportItem.about via Subjectable

### ProtocolStep

Fragment D5 · uid `hu:protocol-step:` · labels `ProtocolStep:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one step of a protocol edition: what to do (stepKind), with what (STEP_USES -> substance, product, food, practice, or the Metric a MEASURE step measures), how much (dose as a range, never a…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| stepKey | `String!` | core | required |
| payloadHash | `String!` | core | required |
| stepKind | `StepKind!` | core | required, enum StepKind |
| stepKindRaw | `String` | core |  |
| sectionLabel | `String` | core |  |
| alternativeGroup | `String` | core |  |
| exactText | `String` | core |  |
| locatorUid | `String` | core |  |
| requirementLevel | `RequirementLevel!` | core | required, enum RequirementLevel |
| requirementBasis | `RequirementBasis!` | core | required, enum RequirementBasis |
| speechAct | `SpeechAct` | core | enum SpeechAct |
| statedLevel | `ConstraintLevel` | core | enum ConstraintLevel |
| targetKeys | `[String!]` | core |  |
| appliesToPopulations | `[PopulationGroup!]` | core | enum PopulationGroup |
| conditionText | `String` | core |  |
| route | `String` | core |  |
| doseMin | `Float` | core |  |
| doseMax | `Float` | core |  |
| doseUnit | `String` | core |  |
| dosePeriod | `AmountBasis` | core | enum AmountBasis |
| intakeScope | `IntakeScope` | core | enum IntakeScope |
| timeAnchor | `TimeAnchor` | core | enum TimeAnchor |
| offsetMinutesMin | `Int` | core |  |
| offsetMinutesMax | `Int` | core |  |
| occurrencesPerPeriodMin | `Int` | core |  |
| occurrencesPerPeriodMax | `Int` | core |  |
| occurrencePeriodUnit | `CadenceUnit` | core | enum CadenceUnit |
| durationDaysMin | `Int` | core |  |
| durationDaysMax | `Int` | core |  |
| scheduleText | `String` | core |  |
| isAsNeeded | `Boolean` | core |  |
| thresholdComparator | `QuantityComparator` | core | enum QuantityComparator |
| thresholdLow | `Float` | core |  |
| thresholdHigh | `Float` | core |  |
| thresholdUnit | `String` | core |  |
| reviewAction | `ReviewAction` | core | enum ReviewAction |
| dependsOnStepKeys | `[String!]` | core |  |
| notReportedFields | `[String!]` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(ProtocolStep)-[:STEP_USES]->(Subjectable ◇56)` | structural | StructuralEdgeProperties | zero_or_more (one primary means; none for informational OTHER / CONSULT steps). Target is the kernel interface Subjectable, one of the two registered domain exceptions (R-28; the admissible list is in the D5 relationship register and executor-enforced) | uses (OUT) · 56 concrete targets |
| `(ProtocolStep)-[:STATES_CONSTRAINT]->(UseConstraint)` | derived · read-only | DerivedEdgeProperties | many (projection use-constraint-key/v2: when the protocol author's USE_CONSTRAINED_IN | INTERACTS_WITH | HAS_UPPER_LIMIT Assertion cites this step's locatorUid, or a locator inside its span on the same snapshot, and resolves to a UseConstraint, the step gets this edge to it; regenerable, never part of the edition payload) | statesConstraints (OUT) |

Incoming from other node types (12):

- `(Activity)-[:ASSESSES]->(ProtocolStep)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(ProtocolStep)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(ProtocolStep)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(ProtocolStep)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(ProtocolStep)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(ProtocolStep)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(ProtocolStep)` ← Chunk.mentions via Subjectable
- `(ProtocolEdition)-[:HAS_STEP]->(ProtocolStep)` ← ProtocolEdition.steps
- `(ProtocolStep)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(ProtocolStep)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Report)-[:ASSESSES]->(ProtocolStep)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(ProtocolStep)` ← ReportItem.about via Subjectable

### Target

Fragment D5 · uid `hu:target:` · labels `Target:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one curated goal people pursue (sleep, strength, brain fitness, body composition, longevity, energy, mood, recovery ...): the shared targets vocabulary (00-DIRECTIVE 3.1; packets/D5/vocab-ta…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| key | `String!` | core | required |
| label | `String!` | core | required |
| definition | `String!` | core | required |
| parentKey | `String` | core |  |
| level | `Int` | core |  |
| synonyms | `[String!]` | core |  |
| vocabVersion | `String!` | core | required |
| status | `TargetStatus!` | core | required, enum TargetStatus |
| replacedBy | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Target)-[:OPERATIONALIZED_BY]->(TargetMeasure ∪4)` | asserted | AssertedRecordedProperties | many (curated vocabulary mapping, not a claim of effect) | operationalizedBy (OUT) · 4 concrete targets |

Incoming from other node types (12):

- `(Activity)-[:ASSESSES]->(Target)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Target)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Target)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Target)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Target)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Target)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(Target)` ← Chunk.mentions via Subjectable
- `(ProtocolStep)-[:STEP_USES]->(Target)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Target)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Target)` ← ReportItem.about via Subjectable
- `(Target)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Target)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity

### UseConstraint

Fragment D5 · uid `hu:use-constraint:` · labels `UseConstraint:Entity` · implements Entity, Subjectable · mutations none.

Purpose: the shared, stable identity of one scoped use concern, "use of S [above a dose band] [by a route] [in a jurisdiction] together with these scope members (population codes, D2 conditions, co-e…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| constraintKind | `UseConstraintKind!` | core | required, enum UseConstraintKind |
| identityKey | `String!` | core | required |
| identityKeyHash | `String!` | core | required |
| identityKeyVersion | `String!` | core | required |
| scopePopulations | `[PopulationGroup!]` | core | enum PopulationGroup |
| doseComparator | `QuantityComparator` | core | enum QuantityComparator |
| doseValue | `Float` | core |  |
| doseUnit | `String` | core |  |
| dosePeriod | `AmountBasis` | core | enum AmountBasis |
| intakeScope | `IntakeScope` | core | enum IntakeScope |
| route | `String` | core |  |
| timingWindow | `String` | core |  |
| jurisdiction | `String` | core |  |
| summary | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Assertion)-[:RESOLVES_TO_CONSTRAINT]->(UseConstraint)` | derived · read-only | DerivedEdgeProperties | one_or_more (projection use-constraint-key/v2 over D5 safety Assertions; regenerable) | resolvedFrom (IN) |

Incoming from other node types (14):

- `(Activity)-[:ASSESSES]->(UseConstraint)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(UseConstraint)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(UseConstraint)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(UseConstraint)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(UseConstraint)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(UseConstraint)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(UseConstraint)` ← Chunk.mentions via Subjectable
- `(ProtocolStep)-[:STATES_CONSTRAINT]->(UseConstraint)` ← ProtocolStep.statesConstraints
- `(ProtocolStep)-[:STEP_USES]->(UseConstraint)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(UseConstraint)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(UseConstraint)` ← ReportItem.about via Subjectable
- `(ReportItem)-[:BLOCKED_BY]->(UseConstraint)` ← ReportItem.blockedBy
- `(UseConstraint)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(UseConstraint)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity

## Domain D7: Fragment D6

Slug `D6` · fragments D6 · 6 node types.


### Node-edge-node overview

Every edge declared by a node type of this domain, one line each (OUT direction only; IN fields are listed on the node card as incoming declarations).

```
(LabelVersion)-[:DECLARES_COMPONENT {ComponentLineProperties}]->(DeclaredComponentTarget ∪3)  asserted · many (one per declared panel line, each authorized by its own Assertion; ordered, nested via parentOrderIndex)
(LabelVersion)-[:NAMES_RESPONSIBLE_PARTY {AssertedRecordedProperties}]->(Organization)  asserted · zero_or_one (the party the label names; role on responsiblePartyRole)
(MerchantListing)-[:LISTING_FOR {AssertedEdgeProperties}]->(Package)  asserted · zero_or_one open episode (repointed or merged listings close one episode and open the next)
(MerchantListing)-[:HAS_OFFER {StructuralEdgeProperties}]->(Offer)  structural · many
(Offer)-[:SELLER_OF_RECORD {AssertedEdgeProperties}]->(Organization)  asserted · zero_or_one open episode
(Package)-[:HAS_LABEL_VERSION {AssertedEdgeProperties}]->(LabelVersion)  asserted · many episodes
(Product)-[:HAS_VARIANT {StructuralEdgeProperties}]->(ProductVariant)  structural · one_or_more
(Product)-[:BRANDED_AS {AssertedEdgeProperties}]->(Brand)  asserted · zero_or_one open episode (brand reassignments and renames are successive episodes)
(ProductVariant)-[:HAS_PACKAGE {StructuralEdgeProperties}]->(Package)  structural · one_or_more
```

### LabelVersion

Fragment D6 · uid `hu:?:` · labels `LabelVersion:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one version of what a package's label (or a menu item's declaration) states — the panel, serving definition, directions with min/max daily servings, warnings, allergens, seals and the declar…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| panelKind | `PanelKind!` | core | required, enum PanelKind |
| labelVersionCode | `String` | core |  |
| jurisdiction | `String` | core |  |
| contentDigest | `String!` | core | required |
| compositionDigest | `String!` | core | required |
| servingSizeValue | `Float` | core |  |
| servingSizeUnit | `String` | core |  |
| servingSizeVerbatim | `String` | core |  |
| servingsPerContainer | `Float` | core |  |
| minDailyServings | `Float` | core |  |
| maxDailyServings | `Float` | core |  |
| directionsText | `String` | core |  |
| warningsText | `String` | core |  |
| containsAllergens | `[AllergenCode!]` | core | enum AllergenCode |
| mayContainAllergens | `[AllergenCode!]` | core | enum AllergenCode |
| allergenStatementVerbatim | `String` | core |  |
| seals | `[String!]` | core |  |
| responsiblePartyRole | `ResponsiblePartyRole` | core | enum ResponsiblePartyRole |
| responsiblePartyVerbatim | `String` | core |  |
| asOfStatementVerbatim | `String` | core |  |
| firstObservedAt | `DateTime` | core |  |
| lastObservedAt | `DateTime` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(LabelVersion)-[:DECLARES_COMPONENT]->(DeclaredComponentTarget ∪3)` | asserted | ComponentLineProperties | many (one per declared panel line, each authorized by its own Assertion; ordered, nested via parentOrderIndex) | components (OUT) · 3 concrete targets |
| `(LabelVersion)-[:NAMES_RESPONSIBLE_PARTY]->(Organization)` | asserted | AssertedRecordedProperties | zero_or_one (the party the label names; role on responsiblePartyRole) | responsibleParty (OUT) |

Incoming from other node types (13):

- `(Activity)-[:ASSESSES]->(LabelVersion)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(LabelVersion)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(LabelVersion)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(LabelVersion)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(LabelVersion)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(LabelVersion)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(LabelVersion)` ← Chunk.mentions via Subjectable
- `(LabelVersion)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(LabelVersion)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Package)-[:HAS_LABEL_VERSION]->(LabelVersion)` ← Package.labelVersions
- `(ProtocolStep)-[:STEP_USES]->(LabelVersion)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(LabelVersion)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(LabelVersion)` ← ReportItem.about via Subjectable

### MerchantListing

Fragment D6 · uid `hu:listing:` · labels `MerchantListing:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one host's catalog entry for a sellable item (Amazon ASIN detail page, iHerb product id, Shopify product page, restaurant menu-item page): the place offers live, recall-exposure and authoriz…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| listingKind | `ListingKind!` | core | required, enum ListingKind |
| hostDomain | `String!` | core | required |
| hostItemId | `String!` | core | required |
| parentHostItemId | `String` | core |  |
| titleAsDisplayed | `String` | core |  |
| canonicalUrl | `String` | identity |  |
| firstObservedAt | `DateTime` | core |  |
| lastObservedAt | `DateTime` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(MerchantListing)-[:LISTING_FOR]->(Package)` | asserted | AssertedEdgeProperties | zero_or_one open episode (repointed or merged listings close one episode and open the next) | listingFor (OUT) |
| `(MerchantListing)-[:HAS_OFFER]->(Offer)` | structural | StructuralEdgeProperties | many | offers (OUT) |

Incoming from other node types (12):

- `(Activity)-[:ASSESSES]->(MerchantListing)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(MerchantListing)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(MerchantListing)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(MerchantListing)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(MerchantListing)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(MerchantListing)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(MerchantListing)` ← Chunk.mentions via Subjectable
- `(MerchantListing)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(MerchantListing)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(MerchantListing)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(MerchantListing)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(MerchantListing)` ← ReportItem.about via Subjectable

### Offer

Fragment D6 · uid `hu:offer:` · labels `Offer:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one party's commercial proposition for one listing's item in one market and purchase mode — the subject of every price and availability Assertion (OFFER_PRICE_<KIND>, OFFER_AVAILABILITY), th…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| purchaseMode | `PurchaseMode!` | core | required, enum PurchaseMode |
| jurisdiction | `String` | core |  |
| sellerAccountIdVerbatim | `String` | core |  |
| sellerNameAsDisplayed | `String` | core |  |
| fulfillmentKind | `FulfillmentKind` | core | enum FulfillmentKind |
| fulfillerNameAsDisplayed | `String` | core |  |
| subscriptionTermsVerbatim | `String` | core |  |
| subscriptionApp | `String` | core |  |
| firstObservedAt | `DateTime` | core |  |
| lastObservedAt | `DateTime` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Offer)-[:SELLER_OF_RECORD]->(Organization)` | asserted | AssertedEdgeProperties | zero_or_one open episode | sellerOfRecord (OUT) |

Incoming from other node types (13):

- `(Activity)-[:ASSESSES]->(Offer)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Offer)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Offer)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Offer)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Offer)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Offer)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(Offer)` ← Chunk.mentions via Subjectable
- `(MerchantListing)-[:HAS_OFFER]->(Offer)` ← MerchantListing.offers
- `(Offer)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Offer)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(Offer)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Offer)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Offer)` ← ReportItem.about via Subjectable

### Package

Fragment D6 · uid `hu:?:` · labels `Package:Entity` · implements Entity, Subjectable · mutations none.

Purpose: a sellable package configuration of one variant — container of N units or net quantity, multipack, kit, bundle, or one served portion of a prepared food.

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| packageKind | `PackageKind!` | core | required, enum PackageKind |
| unitCount | `Int` | core |  |
| unitNoun | `String` | core |  |
| netQuantityValue | `Float` | core |  |
| netQuantityUnit | `String` | core |  |
| componentSummary | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Package)-[:HAS_LABEL_VERSION]->(LabelVersion)` | asserted | AssertedEdgeProperties | many episodes | labelVersions (OUT) |

Incoming from other node types (14):

- `(Activity)-[:ASSESSES]->(Package)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Package)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Package)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Package)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Package)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Package)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(Package)` ← Chunk.mentions via Subjectable
- `(MerchantListing)-[:LISTING_FOR]->(Package)` ← MerchantListing.listingFor
- `(Package)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Package)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProductVariant)-[:HAS_PACKAGE]->(Package)` ← ProductVariant.packages
- `(ProtocolStep)-[:STEP_USES]->(Package)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Package)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Package)` ← ReportItem.about via Subjectable

### Product

Fragment D6 · uid `hu:product:` · labels `Product:Entity` · implements Entity, Subjectable · mutations none.

Purpose: the enduring marketed concept behind every variant, package and listing ("Tru Niagen", "AG1", "Big Mac"): what a brand presents, what marketing and target claims are made about (kernel Asser…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| productKind | `ProductKind!` | core | required, enum ProductKind |
| marketedName | `String!` | core | required |
| jurisdiction | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Product)-[:HAS_VARIANT]->(ProductVariant)` | structural | StructuralEdgeProperties | one_or_more | variants (OUT) |
| `(Product)-[:BRANDED_AS]->(Brand)` | asserted | AssertedEdgeProperties | zero_or_one open episode (brand reassignments and renames are successive episodes) | brand (OUT) |

Incoming from other node types (20):

- `(Activity)-[:ASSESSES]->(Product)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Product)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Product)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Product)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Product)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Product)` ← Association.members via Subjectable
- `(CertificationListing)-[:COVERS]->(Product)` ← CertificationListing.covers via CertificationCoverageTarget
- `(Chunk)-[:MENTIONS]->(Product)` ← Chunk.mentions via Subjectable
- `(LegalStatus)-[:STATUS_OF]->(Product)` ← LegalStatus.statusOf via LegalStatusSubject
- `(Lot)-[:LOT_OF]->(Product)` ← Lot.lotOf via LotOfTarget
- `(Product)-[:DELIVERS]->(Device)` ← Device.products
- `(Product)-[:DELIVERS]->(LabTest)` ← LabTest.products
- `(Product)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Product)-[:HAS_REFERENCE_FOOD]->(FoodItem)` ← FoodItem.referencedByProducts
- `(Product)-[:IN_FOOD_CATEGORY]->(FoodCategory)` ← FoodCategory.memberProducts
- `(Product)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(Product)` ← ProtocolStep.uses via Subjectable
- `(RegulatoryRecord)-[:CONCERNS]->(Product)` ← RegulatoryRecord.concerns via RegulatoryRecordTopic
- `(Report)-[:ASSESSES]->(Product)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Product)` ← ReportItem.about via Subjectable

### ProductVariant

Fragment D6 · uid `hu:product-variant:` · labels `ProductVariant:Entity` · implements Entity, Subjectable · mutations none.

Purpose: a consumer-distinguishable realization of a Product — strength per unit, dosage form, flavor or jurisdiction (round-0001 Candidate B) — the level a study administers (D3 seam), a lot belongs…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| dosageForm | `DosageForm` | core | enum DosageForm |
| strengthVerbatim | `String` | core |  |
| flavor | `String` | core |  |
| jurisdiction | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(ProductVariant)-[:HAS_PACKAGE]->(Package)` | structural | StructuralEdgeProperties | one_or_more | packages (OUT) |

Incoming from other node types (16):

- `(Activity)-[:ASSESSES]->(ProductVariant)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(ProductVariant)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(ProductVariant)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(ProductVariant)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(ProductVariant)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(ProductVariant)` ← Association.members via Subjectable
- `(CertificationListing)-[:COVERS]->(ProductVariant)` ← CertificationListing.covers via CertificationCoverageTarget
- `(Chunk)-[:MENTIONS]->(ProductVariant)` ← Chunk.mentions via Subjectable
- `(InterventionComponent)-[:ADMINISTERS]->(ProductVariant)` ← InterventionComponent.administers via AdministeredMaterial
- `(Lot)-[:LOT_OF]->(ProductVariant)` ← Lot.lotOf via LotOfTarget
- `(Product)-[:HAS_VARIANT]->(ProductVariant)` ← Product.variants
- `(ProductVariant)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(ProductVariant)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(ProductVariant)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(ProductVariant)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(ProductVariant)` ← ReportItem.about via Subjectable

## Domain D8: Fragment D7

Slug `D7` · fragments D7 · 4 node types.


### Node-edge-node overview

Every edge declared by a node type of this domain, one line each (OUT direction only; IN fields are listed on the node card as incoming declarations).

```
(Award)-[:AWARDED_BY {AssertedRecordedProperties}]->(Organization)  asserted · one or more (co-funded awards; one episode per authorizing Assertion; recorded time only, the period is the award's own)
(Award)-[:AWARDED_TO {AssertedRecordedProperties}]->(Organization)  asserted · many (recipient institutions as stated per source; recorded time only, the period is the award's own)
(Award)-[:AWARDED_TO {AssertedRecordedProperties}]->(Person)  asserted · many (principal or contact investigator, or the individual recipient of a fellowship or prize; the PI/co-PI distinction is an Assertion qualifier)
(Organization)-[:HOLDS_STAKE {StakeEdgeProperties}]->(Organization)  asserted · many (one episode per authorizing Assertion; holder = this organization, e.g. a fund vehicle or holding company)
(Organization)-[:PARENT_OF {ControlEdgeProperties}]->(Organization)  asserted · many (parent → child; one episode per authorizing Assertion; GLEIF relationship period, acquisition and dissolution dates)
(Person)-[:HOLDS_ROLE {RoleEdgeProperties}]->(Organization)  asserted · many (one episode per authorizing Assertion; two roles at one organization are two episodes)
(Person)-[:HOLDS_STAKE {StakeEdgeProperties}]->(Organization)  asserted · many (one episode per authorizing Assertion)
(Person)-[:RECEIVES_VALUE_FROM {ValueEdgeProperties}]->(Organization)  asserted · many (one episode per authorizing Assertion; the payer is the target)
```

### Award

Fragment D7 · uid `hu:?:` · labels `Award:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one funding award — grant, contract, sponsored research agreement, prize, in-kind award — as the join point between a funder, the recipient institution and investigator, and the studies and…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| instrument | `AwardInstrument!` | core | required, enum AwardInstrument |
| awardNumberVerbatim | `String` | core |  |
| programName | `String` | core |  |
| amount | `Float` | core |  |
| currency | `String` | core |  |
| startDate | `DateTime` | core |  |
| endDate | `DateTime` | core |  |
| datePrecision | `TimePrecision` | core | enum TimePrecision |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Award)-[:AWARDED_BY]->(Organization)` | asserted | AssertedRecordedProperties | one or more (co-funded awards; one episode per authorizing Assertion; recorded time only, the period is the award's own) | funders (OUT) |
| `(Award)-[:AWARDED_TO]->(Organization)` | asserted | AssertedRecordedProperties | many (recipient institutions as stated per source; recorded time only, the period is the award's own) | recipientOrganizations (OUT) |
| `(Award)-[:AWARDED_TO]->(Person)` | asserted | AssertedRecordedProperties | many (principal or contact investigator, or the individual recipient of a fellowship or prize; the PI/co-PI distinction is an Assertion qualifier) | recipientPersons (OUT) |

Incoming from other node types (13):

- `(Activity)-[:ASSESSES]->(Award)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Award)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Award)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Award)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Award)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Award)` ← Association.members via Subjectable
- `(Award)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Award)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Chunk)-[:MENTIONS]->(Award)` ← Chunk.mentions via Subjectable
- `(ProtocolStep)-[:STEP_USES]->(Award)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Award)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Award)` ← ReportItem.about via Subjectable
- `(Study)-[:HAS_STUDY_ROLE]->(Award)` ← Study.roles via StudyParty

### Brand

Fragment D7 · uid `hu:?:` · labels `Brand:Entity` · implements Entity, Subjectable · mutations none.

Purpose: a name under which products, services, clinics or media are presented ('Tru Niagen', 'InsideTracker', a clinic chain name) — kept apart from the legal entity that is accountable for it, beca…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| brandKind | `BrandKind!` | core | required, enum BrandKind |
| description | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Organization)-[:OWNS_BRAND]->(Brand)` | asserted | AssertedEdgeProperties | many over time (one open owner episode expected; a licensed operator doing business under the brand is an episode whose authorizing Assertion carries the qualifier tieKind=OPERATOR_DBA) | owners (IN) |

Incoming from other node types (14):

- `(Activity)-[:ASSESSES]->(Brand)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Brand)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Brand)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Brand)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Brand)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Brand)` ← Association.members via Subjectable
- `(Brand)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Brand)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Chunk)-[:MENTIONS]->(Brand)` ← Chunk.mentions via Subjectable
- `(MediaWork)-[:CONTENT_SPONSORED_BY]->(Brand)` ← MediaWork.sponsors via ContentSponsor
- `(Product)-[:BRANDED_AS]->(Brand)` ← Product.brand
- `(ProtocolStep)-[:STEP_USES]->(Brand)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Brand)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Brand)` ← ReportItem.about via Subjectable

### Organization

Fragment D7 · uid `hu:org:` · labels `Organization:Entity` · implements Entity, Subjectable · mutations none.

Purpose: an organized body as an enduring identity — company, legal entity, corporate group, fund vehicle, university, lab, agency, clinic operator — that holds stakes, controls other organizations,…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| entityKind | `OrganizationEntityKind!` | core | required, enum OrganizationEntityKind |
| organizationKind | `OrganizationKind` | core | enum OrganizationKind |
| legalName | `String` | identity |  |
| legalFormVerbatim | `String` | core |  |
| jurisdiction | `String` | core |  |
| status | `OrganizationStatus` | core | enum OrganizationStatus |
| description | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Organization)-[:HOLDS_STAKE]->(Organization)` | asserted | StakeEdgeProperties | many (one episode per authorizing Assertion; holder = this organization, e.g. a fund vehicle or holding company) | holdsStakes (OUT) |
| `(Organization)-[:PARENT_OF]->(Organization)` | asserted | ControlEdgeProperties | many (parent → child; one episode per authorizing Assertion; GLEIF relationship period, acquisition and dissolution dates) | subsidiaries (OUT) |

Incoming from other node types (30):

- `(Activity)-[:ASSESSES]->(Organization)` ← Activity.about via Subjectable
- `(AssayVersion)-[:PERFORMED_BY_LAB]->(Organization)` ← AssayVersion.performingLab
- `(Assertion)-[:ASSERTED_BY]->(Organization)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Organization)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Organization)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Organization)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Organization)` ← Association.members via Subjectable
- `(Award)-[:AWARDED_BY]->(Organization)` ← Award.funders
- `(Award)-[:AWARDED_TO]->(Organization)` ← Award.recipientOrganizations
- `(CertificationListing)-[:ISSUED_BY]->(Organization)` ← CertificationListing.issuedBy
- `(Chunk)-[:MENTIONS]->(Organization)` ← Chunk.mentions via Subjectable
- `(Event)-[:INVOLVES]->(Organization)` ← Event.involvedOrganizations
- `(LabelVersion)-[:NAMES_RESPONSIBLE_PARTY]->(Organization)` ← LabelVersion.responsibleParty
- `(MediaWork)-[:CONTENT_SPONSORED_BY]->(Organization)` ← MediaWork.sponsors via ContentSponsor
- `(Offer)-[:SELLER_OF_RECORD]->(Organization)` ← Offer.sellerOfRecord
- `(Organization)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Organization)-[:OWNS_BRAND]->(Brand)` ← Brand.owners
- `(Organization)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Patent)-[:ASSIGNED_TO]->(Organization)` ← Patent.assignees
- `(Patent)-[:LICENSED_TO]->(Organization)` ← Patent.licensees
- `(Person)-[:HOLDS_ROLE]->(Organization)` ← Person.holdsRoles
- `(Person)-[:HOLDS_STAKE]->(Organization)` ← Person.holdsStakes
- `(Person)-[:RECEIVES_VALUE_FROM]->(Organization)` ← Person.receivesValueFrom
- `(ProtocolStep)-[:STEP_USES]->(Organization)` ← ProtocolStep.uses via Subjectable
- `(QualityResult)-[:ISSUED_BY]->(Organization)` ← QualityResult.issuedBy
- `(RegulatoryRecord)-[:ADDRESSED_TO]->(Organization)` ← RegulatoryRecord.addressedTo
- `(RegulatoryRecord)-[:ISSUED_BY]->(Organization)` ← RegulatoryRecord.issuedBy
- `(Report)-[:ASSESSES]->(Organization)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Organization)` ← ReportItem.about via Subjectable
- `(Study)-[:HAS_STUDY_ROLE]->(Organization)` ← Study.roles via StudyParty

### Person

Fragment D7 · uid `hu:person:` · labels `Person:Entity` · implements Entity, Subjectable · mutations none.

Purpose: a natural person who is a public actor in sourced material — officer, director, founder, investor, author, investigator, speaker, host, clinician who comments publicly, endorser named by a r…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| publicActorBasis | `[PublicActorBasis!]` | core | enum PublicActorBasis |
| credentialsVerbatim | `String` | core |  |
| description | `String` | core |  |
| influenceScore | `Float` | core |  |
| influenceMethodVersion | `String` | core |  |
| influenceDerivedAt | `DateTime` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Person)-[:HOLDS_ROLE]->(Organization)` | asserted | RoleEdgeProperties | many (one episode per authorizing Assertion; two roles at one organization are two episodes) | holdsRoles (OUT) |
| `(Person)-[:HOLDS_STAKE]->(Organization)` | asserted | StakeEdgeProperties | many (one episode per authorizing Assertion) | holdsStakes (OUT) |
| `(Person)-[:RECEIVES_VALUE_FROM]->(Organization)` | asserted | ValueEdgeProperties | many (one episode per authorizing Assertion; the payer is the target) | receivesValueFrom (OUT) |

Incoming from other node types (16):

- `(Activity)-[:ASSESSES]->(Person)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Person)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Person)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Person)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Person)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Person)` ← Association.members via Subjectable
- `(Award)-[:AWARDED_TO]->(Person)` ← Award.recipientPersons
- `(Chunk)-[:MENTIONS]->(Person)` ← Chunk.mentions via Subjectable
- `(Event)-[:INVOLVES]->(Person)` ← Event.involvedPeople
- `(Person)-[:APPEARS_IN]->(MediaWork)` ← MediaWork.appearances
- `(Person)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Person)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(Person)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Person)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Person)` ← ReportItem.about via Subjectable
- `(Study)-[:HAS_STUDY_ROLE]->(Person)` ← Study.roles via StudyParty

## Domain D9: Fragment D8

Slug `D8` · fragments D8 · 6 node types.


### Node-edge-node overview

Every edge declared by a node type of this domain, one line each (OUT direction only; IN fields are listed on the node card as incoming declarations).

```
(CertificationListing)-[:ISSUED_BY {AssertedRecordedProperties}]->(Organization)  asserted · exactly_one (the certifier)
(CertificationListing)-[:COVERS {AssertedEdgeProperties}]->(CertificationCoverageTarget ∪3)  asserted · zero_or_more, many episodes (valid time = observed coverage window; a facility-level listing covers no typed target)
(LegalStatus)-[:STATUS_OF {AssertedEdgeProperties}]->(LegalStatusSubject ∪4)  asserted · exactly_one subject per status, many episodes (valid time = when the standing holds; recorded time = when BellLabs knew)
(LegalStatus)-[:STATUS_FROM {AssertedRecordedProperties}]->(RegulatoryRecord)  asserted · one_or_more (every record that establishes, confirms or ends this standing)
(Lot)-[:LOT_OF {AssertedRecordedProperties}]->(LotOfTarget ∪2)  asserted · exactly_one (variant when the source distinguishes it, else product)
(Patent)-[:ASSIGNED_TO {AssertedEdgeProperties}]->(Organization)  asserted · one_or_more, many episodes (assignments change; valid time = assignment period)
(Patent)-[:LICENSED_TO {AssertedEdgeProperties}]->(Organization)  asserted · many, many episodes (grant, amendment, termination; exclusivity, field and territory are qualifiers on the authorizing Assertion)
(Patent)-[:CONCERNS {AssertedRecordedProperties}]->(ChemicalSubstance)  asserted · many (topical, not coverage; coverage is an APPLICABILITY assessment; typed ChemicalSubstance, the ingredient-material member was cut without a fixture, R-73)
(QualityResult)-[:QUALITY_RESULT_FOR {AssertedRecordedProperties}]->(Lot)  asserted · exactly_one (the lot the source names; a row without a lot is a D1 predicate on the Product, R-73)
(QualityResult)-[:MEASURES_ANALYTE {AssertedRecordedProperties}]->(QualityAnalyte ∪3)  asserted · zero_or_one (only when the analyte resolves; analyteVerbatim always kept)
(QualityResult)-[:ISSUED_BY {AssertedRecordedProperties}]->(Organization)  asserted · zero_or_one (the laboratory or tester that reported the row, when the document names one — fixture eurofins-coa-quantity-by-input has a COA that names none; its financial interest is a D7 join)
(RegulatoryRecord)-[:ISSUED_BY {AssertedRecordedProperties}]->(Organization)  asserted · exactly_one (the authority: regulator, court, tribunal, patent office)
(RegulatoryRecord)-[:ADDRESSED_TO {AssertedRecordedProperties}]->(Organization)  asserted · one_or_more (notifier, applicant, petitioner, licence holder, warned or recalling firm, litigation party)
(RegulatoryRecord)-[:CONCERNS {AssertedRecordedProperties}]->(RegulatoryRecordTopic ∪4)  asserted · many (a lot only when the lot code resolves; the verbatim lot text stays in lotCodesVerbatim; a device record concerns the Product that DELIVERS the device, R-72)
```

### CertificationListing

Fragment D8 · uid `hu:cert-listing:` · labels `CertificationListing:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one listing record of a certifier (NSF Certified for Sport listing 1451522 'Basis'; an NSF/ANSI 173 listing row; an Informed Sport product page with its batch table).

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| programme | `String!` | core | required |
| standard | `String` | core |  |
| listingId | `String` | core |  |
| coverageKind | `CertifiedObjectKind!` | core | required, enum CertifiedObjectKind |
| scopeVerbatim | `String` | core |  |
| certifiedAt | `DateTime` | core |  |
| status | `CertificationListingStatus!` | core | required, enum CertificationListingStatus |
| categoryLabelsVerbatim | `[String!]` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(CertificationListing)-[:ISSUED_BY]->(Organization)` | asserted | AssertedRecordedProperties | exactly_one (the certifier) | issuedBy (OUT) |
| `(CertificationListing)-[:COVERS]->(CertificationCoverageTarget ∪3)` | asserted | AssertedEdgeProperties | zero_or_more, many episodes (valid time = observed coverage window; a facility-level listing covers no typed target) | covers (OUT) · 3 concrete targets |

Incoming from other node types (12):

- `(Activity)-[:ASSESSES]->(CertificationListing)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(CertificationListing)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(CertificationListing)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(CertificationListing)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(CertificationListing)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(CertificationListing)` ← Association.members via Subjectable
- `(CertificationListing)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(CertificationListing)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Chunk)-[:MENTIONS]->(CertificationListing)` ← Chunk.mentions via Subjectable
- `(ProtocolStep)-[:STEP_USES]->(CertificationListing)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(CertificationListing)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(CertificationListing)` ← ReportItem.about via Subjectable

### LegalStatus

Fragment D8 · uid `hu:?:` · labels `LegalStatus:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one legal standing of one subject — an ingredient's or product's market-access standing in one jurisdiction under one pathway (excluded / not excluded from the supplement definition, no-ques…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| statusKind | `LegalStatusKind!` | core | required, enum LegalStatusKind |
| statusFamily | `LegalStatusFamily!` | core | required, enum LegalStatusFamily |
| jurisdiction | `String!` | core | required |
| pathway | `RegulatoryPathway` | core | enum RegulatoryPathway |
| statusVerbatim | `String` | core |  |
| marketStatus | `MarketStatus` | core | enum MarketStatus |
| claimNumbers | `[Int!]` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(LegalStatus)-[:STATUS_OF]->(LegalStatusSubject ∪4)` | asserted | AssertedEdgeProperties | exactly_one subject per status, many episodes (valid time = when the standing holds; recorded time = when BellLabs knew) | statusOf (OUT) · 4 concrete targets |
| `(LegalStatus)-[:STATUS_FROM]->(RegulatoryRecord)` | asserted | AssertedRecordedProperties | one_or_more (every record that establishes, confirms or ends this standing) | establishedBy (OUT) |

Incoming from other node types (12):

- `(Activity)-[:ASSESSES]->(LegalStatus)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(LegalStatus)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(LegalStatus)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(LegalStatus)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(LegalStatus)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(LegalStatus)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(LegalStatus)` ← Chunk.mentions via Subjectable
- `(LegalStatus)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(LegalStatus)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(LegalStatus)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(LegalStatus)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(LegalStatus)` ← ReportItem.about via Subjectable

### Lot

Fragment D8 · uid `hu:?:` · labels `Lot:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one production lot (batch) of one product or variant — the join key for "is the thing I hold real and lawful": recall lot lists, COA lot numbers, certifier lot and batch tables, counterfeit…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| lotCode | `String!` | core | required |
| expiresAt | `DateTime` | core |  |
| manufacturedAt | `DateTime` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Lot)-[:LOT_OF]->(LotOfTarget ∪2)` | asserted | AssertedRecordedProperties | exactly_one (variant when the source distinguishes it, else product) | lotOf (OUT) · 2 concrete targets |

Incoming from other node types (15):

- `(Activity)-[:ASSESSES]->(Lot)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Lot)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Lot)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Lot)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Lot)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Lot)` ← Association.members via Subjectable
- `(CertificationListing)-[:COVERS]->(Lot)` ← CertificationListing.covers via CertificationCoverageTarget
- `(Chunk)-[:MENTIONS]->(Lot)` ← Chunk.mentions via Subjectable
- `(Lot)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Lot)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(Lot)` ← ProtocolStep.uses via Subjectable
- `(QualityResult)-[:QUALITY_RESULT_FOR]->(Lot)` ← QualityResult.resultFor
- `(RegulatoryRecord)-[:CONCERNS]->(Lot)` ← RegulatoryRecord.concerns via RegulatoryRecordTopic
- `(Report)-[:ASSESSES]->(Lot)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Lot)` ← ReportItem.about via Subjectable

### Patent

Fragment D8 · uid `hu:?:` · labels `Patent:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one patent publication at one office (application, grant, reissue).

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| office | `String!` | core | required |
| publicationNumber | `String!` | core | required |
| kindCode | `String!` | core | required |
| publicationType | `PatentPublicationType!` | core | required, enum PatentPublicationType |
| familyId | `String` | core |  |
| familyDefinition | `String` | core |  |
| priorityDate | `DateTime` | core |  |
| filingDate | `DateTime` | core |  |
| grantDate | `DateTime` | core |  |
| expiresAt | `DateTime` | core |  |
| expiryBasis | `PatentDateBasis` | core | enum PatentDateBasis |
| aggregatorStatusVerbatim | `String` | core |  |
| aggregatorStatusObservedAt | `DateTime` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Patent)-[:ASSIGNED_TO]->(Organization)` | asserted | AssertedEdgeProperties | one_or_more, many episodes (assignments change; valid time = assignment period) | assignees (OUT) |
| `(Patent)-[:LICENSED_TO]->(Organization)` | asserted | AssertedEdgeProperties | many, many episodes (grant, amendment, termination; exclusivity, field and territory are qualifiers on the authorizing Assertion) | licensees (OUT) |
| `(Patent)-[:CONCERNS]->(ChemicalSubstance)` | asserted | AssertedRecordedProperties | many (topical, not coverage; coverage is an APPLICABILITY assessment; typed ChemicalSubstance, the ingredient-material member was cut without a fixture, R-73) | concerns (OUT) |

Incoming from other node types (13):

- `(Activity)-[:ASSESSES]->(Patent)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Patent)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Patent)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Patent)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Patent)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Patent)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(Patent)` ← Chunk.mentions via Subjectable
- `(LegalStatus)-[:STATUS_OF]->(Patent)` ← LegalStatus.statusOf via LegalStatusSubject
- `(Patent)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Patent)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(Patent)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Patent)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Patent)` ← ReportItem.about via Subjectable

### QualityResult

Fragment D8 · uid `hu:?:` · labels `QualityResult:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one reported outcome for one analyte or check, from one row of a COA, a lot test summary, a certifier batch page, a lot-identified survey table or a paper — with HOW it was obtained (resultB…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| resultBasis | `ResultBasis!` | core | required, enum ResultBasis |
| analyteVerbatim | `String!` | core | required |
| value | `Float` | identity |  |
| unitCode | `String` | core |  |
| valueQualifier | `ResultValueQualifier` | core | enum ResultValueQualifier |
| valueVerbatim | `String` | core |  |
| reportingLimit | `Float` | core |  |
| labelClaimValue | `Float` | core |  |
| percentOfLabelClaimStated | `Float` | core |  |
| method | `String` | core |  |
| methodReference | `String` | core |  |
| sampleKind | `SampleKind` | core | enum SampleKind |
| reportNumber | `String` | core |  |
| testedAt | `DateTime` | core |  |
| reportedAt | `DateTime` | core |  |
| specComparator | `QuantityComparator` | core | enum QuantityComparator |
| specLow | `Float` | core |  |
| specHigh | `Float` | core |  |
| specVerbatim | `String` | core |  |
| specBasis | `CriterionBasis` | core | enum CriterionBasis |
| specPeriod | `SpecPeriod` | core | enum SpecPeriod |
| statedVerdict | `PassFailVerdict` | core | enum PassFailVerdict |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(QualityResult)-[:QUALITY_RESULT_FOR]->(Lot)` | asserted | AssertedRecordedProperties | exactly_one (the lot the source names; a row without a lot is a D1 predicate on the Product, R-73) | resultFor (OUT) |
| `(QualityResult)-[:MEASURES_ANALYTE]->(QualityAnalyte ∪3)` | asserted | AssertedRecordedProperties | zero_or_one (only when the analyte resolves; analyteVerbatim always kept) | analyte (OUT) · 3 concrete targets |
| `(QualityResult)-[:ISSUED_BY]->(Organization)` | asserted | AssertedRecordedProperties | zero_or_one (the laboratory or tester that reported the row, when the document names one — fixture eurofins-coa-quantity-by-input has a COA that names none; its financial interest is a D7 join) | issuedBy (OUT) |

Incoming from other node types (12):

- `(Activity)-[:ASSESSES]->(QualityResult)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(QualityResult)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(QualityResult)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(QualityResult)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(QualityResult)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(QualityResult)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(QualityResult)` ← Chunk.mentions via Subjectable
- `(ProtocolStep)-[:STEP_USES]->(QualityResult)` ← ProtocolStep.uses via Subjectable
- `(QualityResult)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(QualityResult)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Report)-[:ASSESSES]->(QualityResult)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(QualityResult)` ← ReportItem.about via Subjectable

### RegulatoryRecord

Fragment D8 · uid `hu:?:` · labels `RegulatoryRecord:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one document-backed act of an authority — regulator, court or patent tribunal — with a record number: an NDI or GRAS response, a citizen-petition response, a novel-food authorisation, an EFS…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| recordKind | `RegulatoryRecordKind!` | core | required, enum RegulatoryRecordKind |
| recordFamily | `RegulatoryRecordFamily!` | core | required, enum RegulatoryRecordFamily |
| pathway | `RegulatoryPathway` | core | enum RegulatoryPathway |
| jurisdiction | `String!` | core | required |
| recordNumber | `String!` | core | required |
| docketId | `String` | core |  |
| issuedAt | `DateTime` | core |  |
| issuingOffice | `String` | core |  |
| outcome | `RegulatoryRecordOutcome` | core | enum RegulatoryRecordOutcome |
| outcomeVerbatim | `String` | core |  |
| scopeLimitVerbatim | `String` | core |  |
| conditionsVerbatim | `String` | core |  |
| authorisedClaimsVerbatim | `[String!]` | core |  |
| legalBasisCitation | `String` | core |  |
| violationCategories | `[ViolationCategory!]` | core | enum ViolationCategory |
| inspectionStartedAt | `DateTime` | core |  |
| inspectionEndedAt | `DateTime` | core |  |
| facilityAddressVerbatim | `String` | core |  |
| facilityFei | `String` | core |  |
| recallClass | `RecallClass` | core | enum RecallClass |
| recallStatus | `RecallStatus` | core | enum RecallStatus |
| terminatedAt | `DateTime` | core |  |
| reasonVerbatim | `String` | core |  |
| productDescriptionVerbatim | `String` | core |  |
| lotCodesVerbatim | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(RegulatoryRecord)-[:ISSUED_BY]->(Organization)` | asserted | AssertedRecordedProperties | exactly_one (the authority: regulator, court, tribunal, patent office) | issuedBy (OUT) |
| `(RegulatoryRecord)-[:ADDRESSED_TO]->(Organization)` | asserted | AssertedRecordedProperties | one_or_more (notifier, applicant, petitioner, licence holder, warned or recalling firm, litigation party) | addressedTo (OUT) |
| `(RegulatoryRecord)-[:CONCERNS]->(RegulatoryRecordTopic ∪4)` | asserted | AssertedRecordedProperties | many (a lot only when the lot code resolves; the verbatim lot text stays in lotCodesVerbatim; a device record concerns the Product that DELIVERS the device, R-72) | concerns (OUT) · 4 concrete targets |

Incoming from other node types (14):

- `(Activity)-[:ASSESSES]->(RegulatoryRecord)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(RegulatoryRecord)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(RegulatoryRecord)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(RegulatoryRecord)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(RegulatoryRecord)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(RegulatoryRecord)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(RegulatoryRecord)` ← Chunk.mentions via Subjectable
- `(Event)-[:DOCUMENTED_BY_RECORD]->(RegulatoryRecord)` ← Event.regulatoryRecords
- `(LegalStatus)-[:STATUS_FROM]->(RegulatoryRecord)` ← LegalStatus.establishedBy
- `(ProtocolStep)-[:STEP_USES]->(RegulatoryRecord)` ← ProtocolStep.uses via Subjectable
- `(RegulatoryRecord)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(RegulatoryRecord)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Report)-[:ASSESSES]->(RegulatoryRecord)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(RegulatoryRecord)` ← ReportItem.about via Subjectable

## Domain D10: Fragment D9

Slug `D9` · fragments D9 · 3 node types.


### Node-edge-node overview

Every edge declared by a node type of this domain, one line each (OUT direction only; IN fields are listed on the node card as incoming declarations).

```
(Chunk)-[:CHUNK_OF {StructuralEdgeProperties}]->(SourceSnapshot)  structural · exactly_one (the captured snapshot whose text this chunk spans)
(Chunk)-[:COVERS_LOCATOR {DerivedEdgeProperties}]->(SourceLocator)  derived · many (projection span-overlap/v1 over chunk and locator offsets in the same snapshot and text version; read-only, regenerable, never evidence)
(Chunk)-[:MENTIONS {DerivedEdgeProperties}]->(Subjectable ◇56)  derived · many (projection entity-link/vN; kernel MENTIONS type with kernel meaning; read-only, regenerable, never evidence)
(MediaWork)-[:CONTENT_SPONSORED_BY {AssertedEdgeProperties}]->(ContentSponsor ∪2)  asserted · many (bitemporal episode on the work: valid time separates the sponsors of the original publication from those of later re-cut renditions; which rendition carried the read is the authorizing Assertion's locator or its `rendition:<source uid>` qualifier, a kernel-registered prefix)
```

### Channel

Fragment D9 · uid `hu:channel:` · labels `Channel:Entity` · implements Entity, Subjectable · mutations none.

Purpose: an editorial container that publishes works over time — a podcast show, a video channel, a newsletter, a site, a forum, or an account/handle on a platform (named or pseudonymous).

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| channelKind | `ChannelKind!` | core | required, enum ChannelKind |
| platform | `MediaPlatform!` | core | required, enum MediaPlatform |
| platformAccountId | `String` | core |  |
| handle | `String` | core |  |
| feedUrl | `String` | core |  |
| homeUrl | `String` | core |  |
| isPseudonymous | `Boolean` | core |  |
| language | `String` | core |  |
| influenceScore | `Float` | core |  |
| influenceMethodVersion | `String` | core |  |
| influenceDerivedAt | `DateTime` | core |  |

No relationship fields.

Incoming from other node types (13):

- `(Activity)-[:ASSESSES]->(Channel)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Channel)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Channel)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Channel)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Channel)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Channel)` ← Association.members via Subjectable
- `(Channel)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Channel)-[:PUBLISHES]->(MediaWork)` ← MediaWork.channels
- `(Channel)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(Chunk)-[:MENTIONS]->(Channel)` ← Chunk.mentions via Subjectable
- `(ProtocolStep)-[:STEP_USES]->(Channel)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Channel)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Channel)` ← ReportItem.about via Subjectable

### Chunk

Fragment D9 · uid `hu:chunk:` · labels `Chunk` · implements Entity · mutations none.

Purpose: a derived retrieval unit — a span of the text extracted from one captured SourceSnapshot (publisher transcript, caption track, ASR, OCR, HTML or PDF text) with its embedding — used only to f…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| text | `String!` | core | required |
| chunkIndex | `Int!` | core | required |
| startOffset | `Int!` | core | required |
| endOffset | `Int!` | core | required |
| mediaStartSeconds | `Float` | core |  |
| mediaEndSeconds | `Float` | core |  |
| speakerLabelsInSource | `[String!]` | core |  |
| textBasis | `TextBasis!` | core | required, enum TextBasis |
| textVersionHash | `String!` | core | required |
| extractorVersion | `String!` | core | required |
| normalizationVersion | `String!` | core | required |
| chunkerVersion | `String!` | core | required |
| embeddingModel | `String` | search |  |
| tokenCount | `Int` | core |  |
| textReviewNote | `String` | core |  |
| workUid | `String` | core |  |
| channelUid | `String` | core |  |
| publishedAt | `DateTime` | core |  |
| language | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Chunk)-[:CHUNK_OF]->(SourceSnapshot)` | structural | StructuralEdgeProperties | exactly_one (the captured snapshot whose text this chunk spans) | snapshot (OUT) |
| `(Chunk)-[:COVERS_LOCATOR]->(SourceLocator)` | derived · read-only | DerivedEdgeProperties | many (projection span-overlap/v1 over chunk and locator offsets in the same snapshot and text version; read-only, regenerable, never evidence) | locators (OUT) |
| `(Chunk)-[:MENTIONS]->(Subjectable ◇56)` | derived · read-only | DerivedEdgeProperties | many (projection entity-link/vN; kernel MENTIONS type with kernel meaning; read-only, regenerable, never evidence) | mentions (OUT) · 56 concrete targets |

Incoming from other node types (1):

- `(Chunk)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity

### MediaWork

Fragment D9 · uid `hu:?:` · labels `MediaWork:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one editorial work — a podcast episode, video, talk recording, newsletter issue, article, protocol page, social post, forum thread, book or image — independent of the renditions it is distri…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| workKind | `WorkKind!` | core | required, enum WorkKind |
| publishedAt | `DateTime` | core |  |
| publishedAtPrecision | `TimePrecision` | core | enum TimePrecision |
| republicationKind | `RepublicationKind` | core | enum RepublicationKind |
| canonicalUrl | `String` | identity |  |
| durationSeconds | `Int` | core |  |
| episodeNumber | `Int` | core |  |
| seasonNumber | `Int` | core |  |
| language | `String` | core |  |
| generationMode | `GenerationMode` | core | enum GenerationMode |
| rightsStatementVerbatim | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Channel)-[:PUBLISHES]->(MediaWork)` | structural | StructuralEdgeProperties | one_or_more (the channel(s) whose feed or listing carries the work) | channels (IN) |
| `(Source)-[:RENDITION_OF]->(MediaWork)` | asserted | AssertedRecordedProperties | many (kernel Source → this work; one Source per rendition endpoint: publisher page, video, audio enclosure, platform page, archive copy) | renditions (IN) |
| `(Assertion)-[:OCCURS_IN]->(MediaWork)` | structural | StructuralEdgeProperties | many (every kernel Assertion whose evidence is in this work, not only claim occurrences (assertionKind CLAIM) (R-19), written from the capture the occurrence was extracted from, the work in which the act of asserting was first published; corrected only by supersession; exactly_one container per Assertion; seam K.Assertion → D9.MediaWork, read by K Q-K-09) | occurrences (IN) |
| `(Person)-[:APPEARS_IN]->(MediaWork)` | asserted | AppearanceEdgeProperties | many (D7 Person → this work, role on the edge; one episode per authorizing Assertion, recorded time only) | appearances (IN) |
| `(MediaWork)-[:CONTENT_SPONSORED_BY]->(ContentSponsor ∪2)` | asserted | AssertedEdgeProperties | many (bitemporal episode on the work: valid time separates the sponsors of the original publication from those of later re-cut renditions; which rendition carried the read is the authorizing Assertion's locator or its `rendition:<source uid>` qualifier, a kernel-registered prefix) | sponsors (OUT) · 2 concrete targets |

Incoming from other node types (12):

- `(Activity)-[:ASSESSES]->(MediaWork)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(MediaWork)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(MediaWork)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(MediaWork)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(MediaWork)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(MediaWork)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(MediaWork)` ← Chunk.mentions via Subjectable
- `(MediaWork)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(MediaWork)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(MediaWork)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(MediaWork)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(MediaWork)` ← ReportItem.about via Subjectable

## Domain D11: Fragment D10

Slug `D10` · fragments D10 · 3 node types.


### Node-edge-node overview

Every edge declared by a node type of this domain, one line each (OUT direction only; IN fields are listed on the node card as incoming declarations).

```
(Association)-[:ASSOCIATES {DerivedEdgeProperties}]->(Subjectable ◇56)  derived · exactly_two (anchor and partner; anchorUid says which)
(Association)-[:DERIVED_FROM]->(Assertion)  structural · many (bounded by inputCount; above 5,000 inputs only inputSetDigest is kept)
(ReportItem)-[:ASSESSES]->(Subjectable ◇56)  structural · exactly_one for a ROW (its option: product, form, compound, protocol step), one_or_more for a SECTION (the entities and context the section is about)
(ReportItem)-[:DERIVED_FROM]->(Assertion)  structural · many (every Assertion the item's sentences or cells rest on)
(ReportItem)-[:DERIVED_FROM]->(Assessment)  structural · many (verdicts, harm and strength assessments the item cites)
(ReportItem)-[:BLOCKED_BY {StructuralEdgeProperties}]->(UseConstraint)  structural · one_or_more when disposition is BLOCKED (with blockedByAssessments), else none (the D5 UseConstraint, the shared identity of a scoped use concern such as an upper limit, a contraindication or an interaction, that blocks the option; trace: UseConstraint <- RESOLVES_TO_CONSTRAINT <- Assertion -> HAS_EVIDENCE -> locator; the row also cites the resolving Assertion with DERIVED_FROM)
(ReportItem)-[:BLOCKED_BY {StructuralEdgeProperties}]->(Assessment)  structural · many (a D5 interaction-risk or a D10 harm-causality Assessment that blocks the option when no use constraint states the concern)
```

### Association

Fragment D10 · uid `hu:?:` · labels `Association` · implements Entity · mutations none.

Purpose: a regenerable score between two entities computed by a projection Activity under a method version (PLAN 6.1 "materialized"): evidence aggregate (compound X ↔ outcome or target Y with a per-e…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| associationKind | `AssociationKind!` | core | required, enum AssociationKind |
| anchorUid | `String!` | core | required |
| score | `Float!` | core | required |
| components | `[String!]` | core |  |
| statistic | `String` | core |  |
| statisticValue | `Float` | core |  |
| threshold | `Float` | core |  |
| inputCount | `Int` | core |  |
| inputSetDigest | `String!` | core | required |
| methodVersion | `String!` | core | required |
| computedAt | `DateTime!` | core | required |
| staleAfter | `DateTime` | core |  |
| recordedAt | `DateTime!` | temporal | required |
| recordedTo | `DateTime` | temporal |  |
| supersedesUid | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Association)-[:ASSOCIATES]->(Subjectable ◇56)` | derived · read-only | DerivedEdgeProperties | exactly_two (anchor and partner; anchorUid says which) | members (OUT) · 56 concrete targets |
| `(Association)-[:DERIVED_FROM]->(Assertion)` | structural |  | many (bounded by inputCount; above 5,000 inputs only inputSetDigest is kept) | inputs (OUT) |

Incoming from other node types (1):

- `(Association)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity

### DecisionCriterion

Fragment D10 · uid `hu:decision-criterion:` · labels `DecisionCriterion:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one versioned criterion of a ranking or comparison method ("elemental magnesium per maximum daily dose", "block if the daily dose exceeds the supplemental upper limit stated for the populati…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| criterionKey | `String!` | core | required |
| version | `String!` | core | required |
| criteriaSetKey | `String!` | core | required |
| criteriaSetVersion | `String!` | core | required |
| criterionKind | `CriterionKind!` | core | required, enum CriterionKind |
| direction | `CriterionDirection!` | core | required, enum CriterionDirection |
| weight | `Float` | core |  |
| evaluationOrder | `Int` | core |  |
| definition | `String!` | core | required |
| rule | `String` | core |  |
| inputPredicates | `[String!]` | core |  |
| inputAssessmentKinds | `[String!]` | core |  |
| valueUnitCode | `String` | core |  |
| targetKeys | `[String!]` | core |  |
| publisherUid | `String` | core |  |
| validFrom | `DateTime` | temporal |  |
| validTo | `DateTime` | temporal |  |
| recordedAt | `DateTime!` | temporal | required |
| recordedTo | `DateTime` | temporal |  |
| supersedesUid | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Report)-[:USES_CRITERION]->(DecisionCriterion)` | structural | StructuralEdgeProperties | many (every published comparison or ranking that applied this criterion version) | usedByReports (IN) |

Incoming from other node types (12):

- `(Activity)-[:ASSESSES]->(DecisionCriterion)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(DecisionCriterion)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(DecisionCriterion)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(DecisionCriterion)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(DecisionCriterion)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(DecisionCriterion)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(DecisionCriterion)` ← Chunk.mentions via Subjectable
- `(DecisionCriterion)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(DecisionCriterion)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(DecisionCriterion)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(DecisionCriterion)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(DecisionCriterion)` ← ReportItem.about via Subjectable

### ReportItem

Fragment D10 · uid `hu:?:` · labels `ReportItem:InformationArtifact` · implements Entity · mutations none.

Purpose: one section or one option row of a published kernel Report (comparison, profile, protocol review, evidence report, published answer).

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| itemKind | `ReportItemKind!` | core | required, enum ReportItemKind |
| sectionKind | `ReportSectionKind` | core | enum ReportSectionKind |
| itemKey | `String!` | core | required |
| parentItemKey | `String` | core |  |
| disposition | `OptionDisposition` | core | enum OptionDisposition |
| rank | `Int` | core |  |
| cellValues | `[String!]` | core |  |
| reason | `String` | core |  |
| missingFactKeys | `[String!]` | core |  |
| bodyStartOffset | `Int` | core |  |
| bodyEndOffset | `Int` | core |  |
| citationCompleteness | `Float` | core |  |
| uncitedSentenceCount | `Int` | core |  |
| recordedAt | `DateTime!` | temporal | required |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Report)-[:HAS_ITEM]->(ReportItem)` | structural | StructuralEdgeProperties | exactly_one | report (IN) |
| `(ReportItem)-[:ASSESSES]->(Subjectable ◇56)` | structural |  | exactly_one for a ROW (its option: product, form, compound, protocol step), one_or_more for a SECTION (the entities and context the section is about) | about (OUT) · 56 concrete targets |
| `(ReportItem)-[:DERIVED_FROM]->(Assertion)` | structural |  | many (every Assertion the item's sentences or cells rest on) | citesAssertions (OUT) |
| `(ReportItem)-[:DERIVED_FROM]->(Assessment)` | structural |  | many (verdicts, harm and strength assessments the item cites) | citesAssessments (OUT) |
| `(ReportItem)-[:BLOCKED_BY]->(UseConstraint)` | structural | StructuralEdgeProperties | one_or_more when disposition is BLOCKED (with blockedByAssessments), else none (the D5 UseConstraint, the shared identity of a scoped use concern such as an upper limit, a contraindication or an interaction, that blocks the option; trace: UseConstraint <- RESOLVES_TO_CONSTRAINT <- Assertion -> HAS_EVIDENCE -> locator; the row also cites the resolving Assertion with DERIVED_FROM) | blockedBy (OUT) |
| `(ReportItem)-[:BLOCKED_BY]->(Assessment)` | structural | StructuralEdgeProperties | many (a D5 interaction-risk or a D10 harm-causality Assessment that blocks the option when no use constraint states the concern) | blockedByAssessments (OUT) |

Incoming from other node types (1):

- `(ReportItem)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity

## Domain D12: Fragment D11

Slug `D11` · fragments D11 · 1 node types.


### Node-edge-node overview

Every edge declared by a node type of this domain, one line each (OUT direction only; IN fields are listed on the node card as incoming declarations).

```
```

### CaptureAttempt

Fragment D11 · uid `hu:?:` · labels `CaptureAttempt:Occurrence` · implements Entity · mutations none.

Purpose: one bounded attempt by a tool to search, fetch, resolve or parse a source for a subject that left no complete capture: a failure (401/403/429, challenge page, timeout, licence wall, parser f…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| toolId | `String!` | core | required |
| toolVersion | `String` | core |  |
| outcome | `CaptureOutcome!` | core | required, enum CaptureOutcome |
| failureKind | `CaptureFailureKind` | core | enum CaptureFailureKind |
| httpStatus | `Int` | core |  |
| requestUri | `String` | core |  |
| requestDigest | `String!` | core | required |
| queryText | `String` | core |  |
| subjectUid | `String` | core |  |
| responseHash | `String` | core |  |
| snapshotUid | `String` | core |  |
| retryAfterSeconds | `Int` | core |  |
| attemptedAt | `DateTime!` | core | required |
| errorText | `String` | core |  |

No relationship fields.

Incoming from other node types (1):

- `(CaptureAttempt)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity

## Domain D13: Fragment D12

Slug `D12` · fragments D12 · 3 node types.


### Node-edge-node overview

Every edge declared by a node type of this domain, one line each (OUT direction only; IN fields are listed on the node card as incoming declarations).

```
(DietaryPattern)-[:PATTERN_COMPONENT {AssertedRecordedProperties}]->(PatternComponentTarget ∪3)  asserted · many (recorded time only: kernel AssertedRecordedProperties; role INCLUDES|EMPHASIZES|LIMITS|EXCLUDES in Assertion.valueString, quantity in valueNumber + unitCode)
(FoodItem)-[:FOOD_CONTAINS {FoodContentProperties}]->(FoodComponentTarget ∪2)  asserted · many (recorded time only: D12 FoodContentProperties = AssertedRecordedProperties + statementKind, quantity, unitCode, amountBasis; comparator/range, n, min/max, derivation code on the Assertion)
(FoodItem)-[:IN_FOOD_CATEGORY {AssertedEdgeProperties}]->(FoodCategory)  asserted · many (source-stated membership, or a CALCULATED Assertion with derivationRule such as nova-markers/v1)
```

### DietaryPattern

Fragment D12 · uid `hu:?:` · labels `DietaryPattern:Entity` · implements Entity, Subjectable · mutations none.

Purpose: a dietary pattern as one defining source states it — what foods, groups or nutrients it includes, emphasizes, limits or excludes, and when or how much one eats (Mediterranean diet + EVOO as…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| definedBySourceUid | `String!` | core | required |
| patternKey | `String!` | core | required |
| version | `String!` | core | required |
| definedBy | `String` | core |  |
| patternKind | `DietaryPatternKind!` | core | required, enum DietaryPatternKind |
| definitionScope | `DietaryPatternScope` | core | enum DietaryPatternScope |
| definitionVerbatim | `String` | core |  |
| synonyms | `[String!]` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(DietaryPattern)-[:PATTERN_COMPONENT]->(PatternComponentTarget ∪3)` | asserted | AssertedRecordedProperties | many (recorded time only: kernel AssertedRecordedProperties; role INCLUDES|EMPHASIZES|LIMITS|EXCLUDES in Assertion.valueString, quantity in valueNumber + unitCode) | components (OUT) · 3 concrete targets |

Incoming from other node types (13):

- `(Activity)-[:ASSESSES]->(DietaryPattern)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(DietaryPattern)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(DietaryPattern)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(DietaryPattern)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(DietaryPattern)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(DietaryPattern)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(DietaryPattern)` ← Chunk.mentions via Subjectable
- `(DietaryPattern)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(DietaryPattern)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(InterventionComponent)-[:ADMINISTERS]->(DietaryPattern)` ← InterventionComponent.administers via AdministeredMaterial
- `(ProtocolStep)-[:STEP_USES]->(DietaryPattern)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(DietaryPattern)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(DietaryPattern)` ← ReportItem.about via Subjectable

### FoodCategory

Fragment D12 · uid `hu:?:` · labels `FoodCategory:Entity` · implements Entity, Subjectable · mutations none.

Purpose: a food group as one classification system defines it (NOVA group 4 "ultra-processed food and drink products"; IARC agent "processed meat"; WWEIA 3702 "Burgers"; FDC food category "Fast Foods…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| system | `FoodCategorySystem!` | core | required, enum FoodCategorySystem |
| code | `String!` | core | required |
| systemVersion | `String` | core |  |
| label | `String` | core |  |
| definitionVerbatim | `String` | core |  |
| parentCode | `String` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Product)-[:IN_FOOD_CATEGORY]->(FoodCategory)` | asserted | AssertedEdgeProperties | many (stored Product -> FoodCategory; OFF categories, stated or computed NOVA of a sold item) | memberProducts (IN) |

Incoming from other node types (14):

- `(Activity)-[:ASSESSES]->(FoodCategory)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(FoodCategory)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(FoodCategory)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(FoodCategory)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(FoodCategory)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(FoodCategory)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(FoodCategory)` ← Chunk.mentions via Subjectable
- `(DietaryPattern)-[:PATTERN_COMPONENT]->(FoodCategory)` ← DietaryPattern.components via PatternComponentTarget
- `(FoodCategory)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(FoodCategory)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(FoodItem)-[:IN_FOOD_CATEGORY]->(FoodCategory)` ← FoodItem.categories
- `(ProtocolStep)-[:STEP_USES]->(FoodCategory)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(FoodCategory)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(FoodCategory)` ← ReportItem.about via Subjectable

### FoodItem

Fragment D12 · uid `hu:material:` · labels `FoodItem:Entity` · implements Entity, Subjectable · mutations none.

Purpose: a reference food concept as one composition or food-ontology source defines it, at the preparation it names ("Potatoes, russet, flesh and skin, raw", FDC 170027; "…, baked", FDC 170030; "McD…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| descriptionVerbatim | `String!` | core | required |
| definingSystem | `FoodDataSystem!` | core | required, enum FoodDataSystem |
| sourceRecordId | `String` | core |  |
| preparationMethod | `PreparationMethod` | core | enum PreparationMethod |
| variantKind | `FoodVariantKind` | core | enum FoodVariantKind |
| processingVerbatim | `[String!]` | core |  |
| brandNameVerbatim | `String` | core |  |
| scientificNameVerbatim | `String` | core |  |
| isHistoricalReference | `Boolean` | core |  |
| sourcePublishedAt | `DateTime` | core |  |
| synonyms | `[String!]` | core |  |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(FoodItem)-[:FOOD_CONTAINS]->(FoodComponentTarget ∪2)` | asserted | FoodContentProperties | many (recorded time only: D12 FoodContentProperties = AssertedRecordedProperties + statementKind, quantity, unitCode, amountBasis; comparator/range, n, min/max, derivation code on the Assertion) | components (OUT) · 2 concrete targets |
| `(FoodItem)-[:IN_FOOD_CATEGORY]->(FoodCategory)` | asserted | AssertedEdgeProperties | many (source-stated membership, or a CALCULATED Assertion with derivationRule such as nova-markers/v1) | categories (OUT) |
| `(Product)-[:HAS_REFERENCE_FOOD]->(FoodItem)` | asserted | AssertedEdgeProperties | many (stored Product -> FoodItem; declared here so the D6 hub does not grow; the only Product-FoodItem link, never a merge, licensed by a RESOLUTION Assessment when a resolver chose it, R-62) | referencedByProducts (IN) |

Incoming from other node types (15):

- `(Activity)-[:ASSESSES]->(FoodItem)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(FoodItem)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(FoodItem)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(FoodItem)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(FoodItem)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(FoodItem)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(FoodItem)` ← Chunk.mentions via Subjectable
- `(DietaryPattern)-[:PATTERN_COMPONENT]->(FoodItem)` ← DietaryPattern.components via PatternComponentTarget
- `(FoodItem)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(FoodItem)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(InterventionComponent)-[:ADMINISTERS]->(FoodItem)` ← InterventionComponent.administers via AdministeredMaterial
- `(LabelVersion)-[:DECLARES_COMPONENT]->(FoodItem)` ← LabelVersion.components via DeclaredComponentTarget
- `(ProtocolStep)-[:STEP_USES]->(FoodItem)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(FoodItem)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(FoodItem)` ← ReportItem.about via Subjectable

## Domain D14: Fragment D13

Slug `D13` · fragments D13 · 2 node types.


### Node-edge-node overview

Every edge declared by a node type of this domain, one line each (OUT direction only; IN fields are listed on the node card as incoming declarations).

```
(Event)-[:ON_FRONTIER {AssertedRecordedProperties}]->(Frontier)  asserted · many (1–2 level-2 frontiers, rarely 3; a level-1 theme only when no child fits; one recorded-time episode per classification Assertion by the curation agent, qualifier frontierVocabVersion; reclassification supersedes, never edits)
(Event)-[:LEADS_TO {AssertedRecordedProperties}]->(Event)  asserted · many-to-many (earlier enabling event → later enabled event; projected only from an Assertion with speechAct STATES whose locator states the basis and whose SUPPORT adjudication is DIRECTLY_SUPPORTED or SUPPORTED_WITH_QUALIFICATION; service check object.startedAt >= subject.startedAt; temporal wording alone ("following") never projects)
(Event)-[:RESPONDS_TO {AssertedRecordedProperties}]->(Event)  asserted · many-to-many (responding event → stimulus event: a deliberate act by a sponsor, regulator, investor or publisher that the source states was taken because of the stimulus; same projection gate as LEADS_TO)
(Event)-[:INVOLVES {EventRoleEdgeProperties}]->(Organization)  asserted · many (one episode per participant and role; role on the edge, the printed title as the Assertion qualifier roleText; D7 Organization declares no inverse)
(Event)-[:INVOLVES {EventRoleEdgeProperties}]->(Person)  asserted · many (presenters, named individual investors; public actors only; authors of a retracted paper are reached through D3 AUTHORED_BY on the Publication, R-44; D7 Person declares no inverse)
(Event)-[:DOCUMENTED_BY_RECORD {AssertedRecordedProperties}]->(RegulatoryRecord)  asserted · many (usually one: the authority's record of the act — a Drugs@FDA action, a designation, a warning letter, a recall — for APPROVAL, REJECTION, REGULATORY_DESIGNATION, ENFORCEMENT_ACTION, RECALL, MARKET_WITHDRAWAL, REGULATORY_STATUS_CHANGE; D8 owns the record and declares no inverse; regulator, applicant and record date are read from the record's ISSUED_BY / ADDRESSED_TO / issuedAt, so the Event repeats none of them; promoted from predicate-only in the adversarial-review pass)
```

### Event

Fragment D13 · uid `hu:event:` · labels `Event:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one dated public occurrence in biotech that investors, researchers and agents order into timelines and chains: a trial start, a readout, a regulatory submission, acceptance, designation, app…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| eventKind | `EventKind!` | core | required, enum EventKind |
| eventKindNote | `String` | core |  |
| eventStatus | `EventStatus!` | core | required, enum EventStatus |
| identityKey | `String` | core |  |
| summaryText | `String` | core |  |
| jurisdiction | `String` | core |  |
| startedAt | `DateTime` | core |  |
| startedAtPrecision | `TimePrecision` | core | enum TimePrecision |
| startedAtBasis | `ValidTimeBasis` | core | enum ValidTimeBasis |
| endedAt | `DateTime` | core |  |
| endedAtPrecision | `TimePrecision` | core | enum TimePrecision |
| timeAssertionUid | `String` | core |  |
| announcedAt | `DateTime` | core |  |
| announcedAtPrecision | `TimePrecision` | core | enum TimePrecision |
| announcementAssertionUid | `String` | core |  |
| effectiveFrom | `DateTime` | core |  |
| effectiveFromPrecision | `TimePrecision` | core | enum TimePrecision |
| effectiveFromBasis | `ValidTimeBasis` | core | enum ValidTimeBasis |
| effectiveAssertionUid | `String` | core |  |
| localTimeZone | `String` | core |  |
| scheduledFrom | `DateTime` | core |  |
| scheduledTo | `DateTime` | core |  |
| scheduledFromPrecision | `TimePrecision` | core | enum TimePrecision |
| scheduledToPrecision | `TimePrecision` | core | enum TimePrecision |
| scheduleAssertionUid | `String` | core |  |
| clockRule | `String` | core |  |
| readoutStage | `ReadoutStage` | core | enum ReadoutStage |
| primaryEndpointStatement | `EndpointStatement` | core | enum EndpointStatement |
| approvalPathway | `RegulatoryPathway` | core | enum RegulatoryPathway |
| designationType | `RegulatoryPathway` | core | enum RegulatoryPathway |
| discontinuationScope | `DiscontinuationScope` | core | enum DiscontinuationScope |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Event)-[:ON_FRONTIER]->(Frontier)` | asserted | AssertedRecordedProperties | many (1–2 level-2 frontiers, rarely 3; a level-1 theme only when no child fits; one recorded-time episode per classification Assertion by the curation agent, qualifier frontierVocabVersion; reclassification supersedes, never edits) | frontiers (OUT) |
| `(Event)-[:LEADS_TO]->(Event)` | asserted | AssertedRecordedProperties | many-to-many (earlier enabling event → later enabled event; projected only from an Assertion with speechAct STATES whose locator states the basis and whose SUPPORT adjudication is DIRECTLY_SUPPORTED or SUPPORTED_WITH_QUALIFICATION; service check object.startedAt >= subject.startedAt; temporal wording alone ("following") never projects) | leadsTo (OUT) |
| `(Event)-[:RESPONDS_TO]->(Event)` | asserted | AssertedRecordedProperties | many-to-many (responding event → stimulus event: a deliberate act by a sponsor, regulator, investor or publisher that the source states was taken because of the stimulus; same projection gate as LEADS_TO) | respondsTo (OUT) |
| `(Event)-[:INVOLVES]->(Organization)` | asserted | EventRoleEdgeProperties | many (one episode per participant and role; role on the edge, the printed title as the Assertion qualifier roleText; D7 Organization declares no inverse) | involvedOrganizations (OUT) |
| `(Event)-[:INVOLVES]->(Person)` | asserted | EventRoleEdgeProperties | many (presenters, named individual investors; public actors only; authors of a retracted paper are reached through D3 AUTHORED_BY on the Publication, R-44; D7 Person declares no inverse) | involvedPeople (OUT) |
| `(Event)-[:DOCUMENTED_BY_RECORD]->(RegulatoryRecord)` | asserted | AssertedRecordedProperties | many (usually one: the authority's record of the act — a Drugs@FDA action, a designation, a warning letter, a recall — for APPROVAL, REJECTION, REGULATORY_DESIGNATION, ENFORCEMENT_ACTION, RECALL, MARKET_WITHDRAWAL, REGULATORY_STATUS_CHANGE; D8 owns the record and declares no inverse; regulator, applicant and record date are read from the record's ISSUED_BY / ADDRESSED_TO / issuedAt, so the Event repeats none of them; promoted from predicate-only in the adversarial-review pass) | regulatoryRecords (OUT) |

Incoming from other node types (12):

- `(Activity)-[:ASSESSES]->(Event)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Event)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Event)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Event)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Event)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Event)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(Event)` ← Chunk.mentions via Subjectable
- `(Event)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Event)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(Event)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Event)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Event)` ← ReportItem.about via Subjectable

### Frontier

Fragment D13 · uid `hu:?:` · labels `Frontier:Entity` · implements Entity, Subjectable · mutations none.

Purpose: one curated research or therapeutic frontier — a field-level goal the community and investors track and that is not yet reliably achieved in humans ("senolytics in humans", "partial epigenet…

| property | type | group | notes |
| --- | --- | --- | --- |
| id | `ID!` | identity | required |
| uid | `String!` | identity | required |
| name | `String` | core |  |
| privacyClass | `PrivacyClass` | operational | enum PrivacyClass |
| lastWriterRunId | `String` | core |  |
| createdAt | `DateTime` | temporal |  |
| updatedAt | `DateTime` | temporal |  |
| key | `String!` | core | required |
| definition | `String!` | core | required |
| level | `Int!` | core | required |
| parentKey | `String` | core |  |
| granularity | `FrontierGranularity!` | core | required, enum FrontierGranularity |
| synonyms | `[String!]` | core |  |
| targetKeys | `[String!]` | core |  |
| curationStatus | `FrontierCurationStatus!` | core | required, enum FrontierCurationStatus |
| replacedBy | `String` | core |  |
| vocabVersion | `String!` | core | required |

| edge | class | edge properties | cardinality | field |
| --- | --- | --- | --- | --- |
| `(Study)-[:ON_FRONTIER]->(Frontier)` | asserted | AssertedRecordedProperties | many (D3 Study → Frontier, declared here with direction IN so ON_FRONTIER stays one D13-owned relationship type and D3 Study spends no field; same classification Assertion rules as Event.frontiers) | studies (IN) |

Incoming from other node types (13):

- `(Activity)-[:ASSESSES]->(Frontier)` ← Activity.about via Subjectable
- `(Assertion)-[:ASSERTED_BY]->(Frontier)` ← Assertion.assertedBy via Subjectable
- `(Assertion)-[:HAS_OBJECT]->(Frontier)` ← Assertion.object via Subjectable
- `(Assertion)-[:HAS_SUBJECT]->(Frontier)` ← Assertion.subject via Subjectable
- `(Assessment)-[:ASSESSES]->(Frontier)` ← Assessment.about via Subjectable
- `(Association)-[:ASSOCIATES]->(Frontier)` ← Association.members via Subjectable
- `(Chunk)-[:MENTIONS]->(Frontier)` ← Chunk.mentions via Subjectable
- `(Event)-[:ON_FRONTIER]->(Frontier)` ← Event.frontiers
- `(Frontier)-[:HAS_IDENTIFIER]->(Identifier)` ← Identifier.identifies via Subjectable
- `(Frontier)-[:WAS_GENERATED_BY]->(Activity)` ← Activity.generated via Entity
- `(ProtocolStep)-[:STEP_USES]->(Frontier)` ← ProtocolStep.uses via Subjectable
- `(Report)-[:ASSESSES]->(Frontier)` ← Report.about via Subjectable
- `(ReportItem)-[:ASSESSES]->(Frontier)` ← ReportItem.about via Subjectable

## Appendix A: edge property profiles

### AppearanceEdgeProperties

APPEARS_IN episode, recorded time only: the kernel AssertedRecordedProperties fields verbatim and in order (executor-set, one authorizing Assertion with predicate APPEARS_IN), then the one qualifier…

Used by 1 field(s): MediaWork.appearances.

| property | type | notes |
| --- | --- | --- |
| relationshipUid | `String!` | required |
| assertionUid | `String!` | required |
| recordedFrom | `DateTime!` | required |
| recordedTo | `DateTime` |  |
| lastWriterRunId | `String` |  |
| appearanceRole | `AppearanceRole!` | required, enum AppearanceRole |

### AssertedEdgeProperties

Asserted edge episode (bitemporal).

Used by 21 field(s): AlgorithmVersion.devices, Brand.owners, CertificationListing.covers, FoodCategory.memberProducts, FoodItem.categories, FoodItem.referencedByProducts, LabTest.algorithmVersions, LabTest.assayVersions, LabTest.components, LabTest.metrics, LegalStatus.statusOf, MediaWork.sponsors, MerchantListing.listingFor, Offer.sellerOfRecord, Package.labelVersions, Patent.assignees, Patent.licensees, Product.brand, Protocol.editions, Study.registrationVersions, Taxon.parents.

| property | type | notes |
| --- | --- | --- |
| relationshipUid | `String!` | required |
| assertionUid | `String!` | required |
| validFrom | `DateTime` |  |
| validTo | `DateTime` |  |
| validFromPrecision | `TimePrecision` | enum TimePrecision |
| validToPrecision | `TimePrecision` | enum TimePrecision |
| validFromBasis | `ValidTimeBasis!` | required, enum ValidTimeBasis |
| validToBasis | `ValidTimeBasis!` | required, enum ValidTimeBasis |
| recordedFrom | `DateTime!` | required |
| recordedTo | `DateTime` |  |
| lastWriterRunId | `String` |  |

### AssertedRecordedProperties

Asserted edge, recorded time only (added in the model stage, 00-DIRECTIVE rule 9): one relationship per recorded-time episode, authorized by exactly one Assertion (`assertionUid`), for asserted edges…

Used by 40 field(s): AlgorithmVersion.derivedFrom, AssayVersion.performingLab, Award.funders, Award.recipientOrganizations, Award.recipientPersons, Biomarker.reflectsMechanisms, CertificationListing.issuedBy, ChemicalSubstance.activeMoieties, ChemicalSubstance.nutrients, Device.products, DietaryPattern.components, Event.frontiers, Event.leadsTo, Event.regulatoryRecords, Event.respondsTo, Frontier.studies, IngredientMaterial.sourceTaxa, IngredientMaterial.substances, InterventionComponent.administers, LabTest.products, LabelVersion.responsibleParty, LegalStatus.establishedBy, Lot.lotOf, MediaWork.renditions, OutcomeDefinition.measures, OutcomeDefinition.statedIn, Patent.concerns, Publication.renditions, Publication.reportsOn, QualityResult.analyte, QualityResult.issuedBy, QualityResult.resultFor, RegulatoryRecord.addressedTo, RegulatoryRecord.concerns, RegulatoryRecord.issuedBy, Study.conditions, StudyArm.statedIn, StudyPopulation.statedIn, StudyResult.statedIn, Target.operationalizedBy.

| property | type | notes |
| --- | --- | --- |
| relationshipUid | `String!` | required |
| assertionUid | `String!` | required |
| recordedFrom | `DateTime!` | required |
| recordedTo | `DateTime` |  |
| lastWriterRunId | `String` |  |

### ComponentLineProperties

Asserted line of a label's declared composition (one Supplement Facts / Nutrition Facts / ingredient-statement row).

Used by 1 field(s): LabelVersion.components.

| property | type | notes |
| --- | --- | --- |
| relationshipUid | `String!` | required |
| assertionUid | `String!` | required |
| recordedFrom | `DateTime!` | required |
| recordedTo | `DateTime` |  |
| lastWriterRunId | `String` |  |
| orderIndex | `Int` |  |
| parentOrderIndex | `Int` |  |
| lineRole | `ComponentLineRole!` | required, enum ComponentLineRole |
| amount | `Float` |  |
| unitCode | `String` |  |
| amountReferent | `AmountReferent` | enum AmountReferent |
| massBasis | `MassBasis` | enum MassBasis |
| amountBasis | `AmountBasis` | enum AmountBasis |
| dailyValuePercent | `Float` |  |

### ContentEdgeProperties

Asserted, bitemporal episode of MATERIAL_CONTAINS: the eleven AssertedEdgeProperties fields verbatim (executor-set, copied from the one authorizing Assertion; half-open valid interval; nothing delete…

Used by 2 field(s): IngredientMaterial.containsConstituents, IngredientMaterial.containsSubstances.

| property | type | notes |
| --- | --- | --- |
| relationshipUid | `String!` | required |
| assertionUid | `String!` | required |
| validFrom | `DateTime` |  |
| validTo | `DateTime` |  |
| validFromPrecision | `TimePrecision` | enum TimePrecision |
| validToPrecision | `TimePrecision` | enum TimePrecision |
| validFromBasis | `ValidTimeBasis!` | required, enum ValidTimeBasis |
| validToBasis | `ValidTimeBasis!` | required, enum ValidTimeBasis |
| recordedFrom | `DateTime!` | required |
| recordedTo | `DateTime` |  |
| lastWriterRunId | `String` |  |
| statementKind | `ContentStatementKind!` | required, enum ContentStatementKind |
| quantity | `Float` |  |
| comparator | `QuantityComparator` | enum QuantityComparator |
| unitCode | `String` |  |

### ControlEdgeProperties

PARENT_OF episode: AssertedEdgeProperties plus `controlKind` (consolidation, wholly owned, general partner, group membership as stated) and the stated ownership percent when the source gives one with…

Used by 1 field(s): Organization.subsidiaries.

| property | type | notes |
| --- | --- | --- |
| relationshipUid | `String!` | required |
| assertionUid | `String!` | required |
| validFrom | `DateTime` |  |
| validTo | `DateTime` |  |
| validFromPrecision | `TimePrecision` | enum TimePrecision |
| validToPrecision | `TimePrecision` | enum TimePrecision |
| validFromBasis | `ValidTimeBasis!` | required, enum ValidTimeBasis |
| validToBasis | `ValidTimeBasis!` | required, enum ValidTimeBasis |
| recordedFrom | `DateTime!` | required |
| recordedTo | `DateTime` |  |
| lastWriterRunId | `String` |  |
| controlKind | `ControlKind!` | required, enum ControlKind |
| stakePercent | `Float` |  |

### DerivedEdgeProperties

Derived edge (recorded time only): a regenerable, read-only projection rebuilt by a projection Activity.

Used by 5 field(s): Association.members, Chunk.locators, Chunk.mentions, ProtocolStep.statesConstraints, UseConstraint.resolvedFrom.

| property | type | notes |
| --- | --- | --- |
| projectionOfAssertionUid | `String` |  |
| derivationRule | `String` |  |
| derivedFromAssertionUids | `[String!]` |  |
| derivedFromAssessmentUids | `[String!]` |  |
| score | `Float` |  |
| derivedAt | `DateTime` |  |
| lastWriterRunId | `String` |  |

### EventRoleEdgeProperties

Asserted recorded-time episode for INVOLVES (Event → Organization | Person).

Used by 2 field(s): Event.involvedOrganizations, Event.involvedPeople.

| property | type | notes |
| --- | --- | --- |
| relationshipUid | `String!` | required |
| assertionUid | `String!` | required |
| recordedFrom | `DateTime!` | required |
| recordedTo | `DateTime` |  |
| lastWriterRunId | `String` |  |
| role | `EventRole!` | required, enum EventRole |

### EvidenceEdgeProperties

Kernel-internal.

Used by 4 field(s): Adjudication.evidence, Assertion.evidence, Assessment.evidence, Report.evidence.

| property | type | notes |
| --- | --- | --- |
| role | `EvidenceRole!` | required, enum EvidenceRole |
| origin | `EvidenceOrigin!` | required, enum EvidenceOrigin |
| expectedSelectedContentDigest | `String` |  |
| authority | `EvidenceAuthority` | enum EvidenceAuthority |
| independence | `EvidenceIndependence` | enum EvidenceIndependence |
| facet | `EvidenceFacet` | enum EvidenceFacet |
| lastWriterRunId | `String` |  |

### ExposureRoleProperties

Structural exposure attachment (EXPOSED_TO), recorded time only.

Used by 1 field(s): MechanismEvidenceContext.exposures.

| property | type | notes |
| --- | --- | --- |
| orderIndex | `Int` |  |
| lastWriterRunId | `String` |  |
| exposureRole | `ExposureRole!` | required, enum ExposureRole |

### FoodContentProperties

Asserted, recorded-time-only FOOD_CONTAINS line: the five AssertedRecordedProperties fields verbatim (executor-set, copied from the one authorizing Assertion; nothing deleted, a revised value superse…

Used by 1 field(s): FoodItem.components.

| property | type | notes |
| --- | --- | --- |
| relationshipUid | `String!` | required |
| assertionUid | `String!` | required |
| recordedFrom | `DateTime!` | required |
| recordedTo | `DateTime` |  |
| lastWriterRunId | `String` |  |
| statementKind | `ContentStatementKind!` | required, enum ContentStatementKind |
| quantity | `Float` |  |
| unitCode | `String` |  |
| amountBasis | `AmountBasis` | enum AmountBasis |

### IdentifierLinkProperties

Kernel-internal.

Used by 1 field(s): Identifier.identifies.

| property | type | notes |
| --- | --- | --- |
| relationshipUid | `String!` | required |
| assertionUid | `String!` | required |
| validFrom | `DateTime` |  |
| validTo | `DateTime` |  |
| validFromPrecision | `TimePrecision` | enum TimePrecision |
| validToPrecision | `TimePrecision` | enum TimePrecision |
| validFromBasis | `ValidTimeBasis!` | required, enum ValidTimeBasis |
| validToBasis | `ValidTimeBasis!` | required, enum ValidTimeBasis |
| recordedFrom | `DateTime!` | required |
| recordedTo | `DateTime` |  |
| lastWriterRunId | `String` |  |
| isPrimary | `Boolean` |  |

### MechanismProjectionProperties

Derived mechanism projection (AFFECTS_MECHANISM), recorded time only, read-only, regenerable by a PROJECTION Activity.

Used by 1 field(s): Mechanism.affectedBy.

| property | type | notes |
| --- | --- | --- |
| projectionOfAssertionUid | `String` |  |
| derivationRule | `String` |  |
| derivedFromAssertionUids | `[String!]` |  |
| derivedFromAssessmentUids | `[String!]` |  |
| score | `Float` |  |
| derivedAt | `DateTime` |  |
| lastWriterRunId | `String` |  |
| direction | `EstimateDirection` | enum EstimateDirection |
| bestBasis | `BasisKind` | enum BasisKind |
| highestSetting | `MechanismSetting` | enum MechanismSetting |
| humanMeasured | `Boolean` |  |
| nContexts | `Int` |  |
| nHumanContexts | `Int` |  |
| viaParticipant | `Boolean` |  |

### MechanismReferenceProperties

Asserted reference statement (PART_OF_MECHANISM, PARTICIPATES_IN), recorded time only: one relationship per recorded-time episode, authorized by exactly one Assertion per authority record and release…

Used by 3 field(s): Mechanism.metaboliteParticipants, Mechanism.partOf, MolecularEntity.participatesIn.

| property | type | notes |
| --- | --- | --- |
| relationshipUid | `String!` | required |
| assertionUid | `String!` | required |
| recordedFrom | `DateTime!` | required |
| recordedTo | `DateTime` |  |
| lastWriterRunId | `String` |  |
| referenceScheme | `MechanismReferenceScheme` | enum MechanismReferenceScheme |
| referenceRelease | `String` |  |
| participantRole | `ParticipantRole` | enum ParticipantRole |

### RevisionEdgeProperties

REVISES episode: AssertedRecordedProperties fields verbatim (no question reads its valid time; the notice date is the revising Publication's publishedAt and the Assertion's valid time) plus the revis…

Used by 1 field(s): Publication.revises.

| property | type | notes |
| --- | --- | --- |
| relationshipUid | `String!` | required |
| assertionUid | `String!` | required |
| recordedFrom | `DateTime!` | required |
| recordedTo | `DateTime` |  |
| lastWriterRunId | `String` |  |
| revisionKind | `SourceRevisionKind!` | required, enum SourceRevisionKind |

### RoleEdgeProperties

HOLDS_ROLE episode: AssertedEdgeProperties plus the role qualifier.

Used by 1 field(s): Person.holdsRoles.

| property | type | notes |
| --- | --- | --- |
| relationshipUid | `String!` | required |
| assertionUid | `String!` | required |
| validFrom | `DateTime` |  |
| validTo | `DateTime` |  |
| validFromPrecision | `TimePrecision` | enum TimePrecision |
| validToPrecision | `TimePrecision` | enum TimePrecision |
| validFromBasis | `ValidTimeBasis!` | required, enum ValidTimeBasis |
| validToBasis | `ValidTimeBasis!` | required, enum ValidTimeBasis |
| recordedFrom | `DateTime!` | required |
| recordedTo | `DateTime` |  |
| lastWriterRunId | `String` |  |
| roleKind | `OrgRoleKind!` | required, enum OrgRoleKind |

### StakeEdgeProperties

HOLDS_STAKE episode: AssertedEdgeProperties plus the ownership qualifiers.

Used by 2 field(s): Organization.holdsStakes, Person.holdsStakes.

| property | type | notes |
| --- | --- | --- |
| relationshipUid | `String!` | required |
| assertionUid | `String!` | required |
| validFrom | `DateTime` |  |
| validTo | `DateTime` |  |
| validFromPrecision | `TimePrecision` | enum TimePrecision |
| validToPrecision | `TimePrecision` | enum TimePrecision |
| validFromBasis | `ValidTimeBasis!` | required, enum ValidTimeBasis |
| validToBasis | `ValidTimeBasis!` | required, enum ValidTimeBasis |
| recordedFrom | `DateTime!` | required |
| recordedTo | `DateTime` |  |
| lastWriterRunId | `String` |  |
| stakeKind | `StakeKind!` | required, enum StakeKind |
| stakePercent | `Float` |  |
| stakeBand | `StakeBand` | enum StakeBand |
| ownershipBasis | `OwnershipBasis` | enum OwnershipBasis |
| votingPower | `HoldingPower` | enum HoldingPower |
| dispositivePower | `HoldingPower` | enum HoldingPower |

### StructuralEdgeProperties

Structural edge (recorded time only): internal shape of one captured or composed record; needs no Assertion.

Used by 30 field(s): AlgorithmVersion.inputs, AlgorithmVersion.outputs, Biomarker.analyteEntities, Biomarker.analytes, Chunk.snapshot, DecisionCriterion.usedByReports, MechanismEvidenceContext.assertions, MechanismEvidenceContext.studyArm, MediaWork.channels, MediaWork.occurrences, MerchantListing.offers, Metric.quantifies, Product.variants, ProductVariant.packages, ProtocolEdition.steps, ProtocolStep.uses, ReferenceIntervalVersion.assayVersions, ReferenceIntervalVersion.metrics, ReportItem.blockedBy, ReportItem.blockedByAssessments, ReportItem.report, Source.snapshots, SourceLocator.snapshot, SourceSnapshot.source, Study.arms, Study.outcomes, Study.populations, StudyArm.components, StudyResult.arms, StudyResult.outcome.

| property | type | notes |
| --- | --- | --- |
| orderIndex | `Int` |  |
| lastWriterRunId | `String` |  |

### StudyRoleEdgeProperties

HAS_STUDY_ROLE episode: AssertedEdgeProperties fields verbatim (bitemporal, one authorizing Assertion) plus the role a question filters on (Q-D3-08, Q-D3-09, D7 Q-D7-05).

Used by 1 field(s): Study.roles.

| property | type | notes |
| --- | --- | --- |
| relationshipUid | `String!` | required |
| assertionUid | `String!` | required |
| validFrom | `DateTime` |  |
| validTo | `DateTime` |  |
| validFromPrecision | `TimePrecision` | enum TimePrecision |
| validToPrecision | `TimePrecision` | enum TimePrecision |
| validFromBasis | `ValidTimeBasis!` | required, enum ValidTimeBasis |
| validToBasis | `ValidTimeBasis!` | required, enum ValidTimeBasis |
| recordedFrom | `DateTime!` | required |
| recordedTo | `DateTime` |  |
| lastWriterRunId | `String` |  |
| roleKind | `StudyRoleKind!` | required, enum StudyRoleKind |

### ValueEdgeProperties

RECEIVES_VALUE_FROM episode: AssertedEdgeProperties plus what was received.

Used by 1 field(s): Person.receivesValueFrom.

| property | type | notes |
| --- | --- | --- |
| relationshipUid | `String!` | required |
| assertionUid | `String!` | required |
| validFrom | `DateTime` |  |
| validTo | `DateTime` |  |
| validFromPrecision | `TimePrecision` | enum TimePrecision |
| validToPrecision | `TimePrecision` | enum TimePrecision |
| validFromBasis | `ValidTimeBasis!` | required, enum ValidTimeBasis |
| validToBasis | `ValidTimeBasis!` | required, enum ValidTimeBasis |
| recordedFrom | `DateTime!` | required |
| recordedTo | `DateTime` |  |
| lastWriterRunId | `String` |  |
| valueKind | `ValueTransferKind!` | required, enum ValueTransferKind |
| amount | `Float` |  |
| unitCode | `String` |  |
| valueBucket | `String` |  |

## Appendix B: unions and interfaces used as targets

### AdministeredMaterial (union, 5 members)

Fields: InterventionComponent.administers.

IngredientMaterial, ProductVariant, Intervention, FoodItem, DietaryPattern

### LegalStatusSubject (union, 4 members)

Fields: LegalStatus.statusOf.

ChemicalSubstance, IngredientMaterial, Product, Patent

### OutcomeMeasureTarget (union, 4 members)

Fields: OutcomeDefinition.measures.

Metric, Biomarker, Outcome, Condition

### RegulatoryRecordTopic (union, 4 members)

Fields: RegulatoryRecord.concerns.

ChemicalSubstance, IngredientMaterial, Product, Lot

### TargetMeasure (union, 4 members)

Fields: Target.operationalizedBy.

Biomarker, Metric, Outcome, Condition

### CertificationCoverageTarget (union, 3 members)

Fields: CertificationListing.covers.

Product, ProductVariant, Lot

### ContextExposure (union, 3 members)

Fields: MechanismEvidenceContext.exposures.

ChemicalSubstance, IngredientMaterial, Intervention

### DeclaredComponentTarget (union, 3 members)

Fields: LabelVersion.components.

IngredientMaterial, Constituent, FoodItem

### PatternComponentTarget (union, 3 members)

Fields: DietaryPattern.components.

FoodItem, FoodCategory, Constituent

### QualityAnalyte (union, 3 members)

Fields: QualityResult.analyte.

ChemicalSubstance, IngredientMaterial, Constituent

### StudyParty (union, 3 members)

Fields: Study.roles.

Organization, Person, Award

### ContentSponsor (union, 2 members)

Fields: MediaWork.sponsors.

Organization, Brand

### FoodComponentTarget (union, 2 members)

Fields: FoodItem.components.

ChemicalSubstance, Constituent

### LotOfTarget (union, 2 members)

Fields: Lot.lotOf.

Product, ProductVariant

### MechanismModulator (union, 2 members)

Fields: Mechanism.affectedBy.

ChemicalSubstance, Intervention

### StatingRecord (union, 2 members)

Fields: OutcomeDefinition.statedIn, StudyArm.statedIn, StudyPopulation.statedIn, StudyResult.statedIn.

RegistrationVersion, Publication

### Entity (interface, 69 implementers)

Source, SourceSnapshot, SourceLocator, Assertion, Adjudication, Claim, Assessment, Report, Activity, Agent, Identifier, ChemicalSubstance, IngredientMaterial, Constituent, Taxon, Mechanism, MolecularEntity, MechanismEvidenceContext, Condition, Outcome, Study, RegistrationVersion, StudyArm, InterventionComponent, StudyPopulation, OutcomeDefinition, StudyResult, Publication, Biomarker, Metric, LabTest, AssayVersion, AlgorithmVersion, ReferenceIntervalVersion, Device, Target, Intervention, Protocol, ProtocolEdition, ProtocolStep, UseConstraint, Product, ProductVariant, Package, LabelVersion, MerchantListing, Offer, Organization, Person, Brand, Award, RegulatoryRecord, LegalStatus, Lot, QualityResult, CertificationListing, Patent, Channel, MediaWork, Chunk, DecisionCriterion, ReportItem, Association, CaptureAttempt, FoodItem, FoodCategory, DietaryPattern, Event, Frontier

### Subjectable (interface, 56 implementers)

Source, Claim, Agent, ChemicalSubstance, IngredientMaterial, Constituent, Taxon, Mechanism, MolecularEntity, Condition, Outcome, Study, RegistrationVersion, StudyArm, InterventionComponent, StudyPopulation, OutcomeDefinition, StudyResult, Publication, Biomarker, Metric, LabTest, AssayVersion, AlgorithmVersion, ReferenceIntervalVersion, Device, Target, Intervention, Protocol, ProtocolEdition, ProtocolStep, UseConstraint, Product, ProductVariant, Package, LabelVersion, MerchantListing, Offer, Organization, Person, Brand, Award, RegulatoryRecord, LegalStatus, Lot, QualityResult, CertificationListing, Patent, Channel, MediaWork, DecisionCriterion, FoodItem, FoodCategory, DietaryPattern, Event, Frontier

## Appendix C: enums

| enum | values | used by fields |
| --- | ---: | ---: |
| ActivityKind | 7 | 1 |
| AdjudicationDecision | 3 | 1 |
| AdjudicationKind | 2 | 1 |
| AdministrationRoute | 14 | 2 |
| AeCollectionMethod | 3 | 1 |
| AeSeriousness | 3 | 1 |
| AgentKind | 6 | 1 |
| AlgorithmKind | 8 | 1 |
| AlgorithmOutputKind | 6 | 1 |
| AlgorithmRealization | 4 | 1 |
| AlgorithmVersionBasis | 5 | 1 |
| AllergenCode | 16 | 2 |
| AllocationKind | 4 | 1 |
| AmountBasis | 16 | 6 |
| AmountReferent | 6 | 1 |
| AnalysisKind | 6 | 1 |
| AnalysisSetKind | 7 | 2 |
| AppearanceRole | 9 | 1 |
| ArmType | 6 | 1 |
| AssertionKind | 5 | 1 |
| AssertionStatus | 7 | 1 |
| AssessmentKind | 15 | 1 |
| AssessmentStatus | 4 | 2 |
| AssociationKind | 5 | 1 |
| AwardInstrument | 10 | 1 |
| BasisKind | 12 | 2 |
| BiomarkerKind | 9 | 1 |
| BotanicalPreparationType | 9 | 1 |
| BrandKind | 5 | 1 |
| CadenceUnit | 5 | 1 |
| CalibrationTraceability | 6 | 1 |
| CaptureFailureKind | 13 | 1 |
| CaptureOutcome | 2 | 1 |
| CertaintyLevel | 5 | 1 |
| CertificationListingStatus | 5 | 1 |
| CertifiedObjectKind | 6 | 1 |
| ChannelKind | 8 | 1 |
| ClaimDisposition | 3 | 1 |
| ClaimLifecycleState | 6 | 1 |
| ClaimType | 14 | 2 |
| CollectionMode | 9 | 1 |
| ComparisonKind | 3 | 1 |
| CompartmentKind | 9 | 1 |
| ComponentLineRole | 9 | 1 |
| ComponentRole | 6 | 1 |
| ConditionKind | 4 | 1 |
| ConstituentKind | 4 | 1 |
| ConstraintLevel | 11 | 1 |
| ContentStatementKind | 6 | 2 |
| ControlKind | 8 | 1 |
| CriterionBasis | 5 | 1 |
| CriterionDirection | 4 | 1 |
| CriterionKind | 4 | 1 |
| DeviceKind | 10 | 1 |
| DiagnosticResultKind | 3 | 1 |
| DietaryPatternKind | 4 | 1 |
| DietaryPatternScope | 5 | 1 |
| DiscontinuationScope | 3 | 1 |
| DispersionKind | 6 | 1 |
| DosageForm | 12 | 1 |
| EffectDirection | 5 | 1 |
| EndpointStatement | 4 | 1 |
| EnrollmentCountType | 2 | 1 |
| EstimateDirection | 5 | 2 |
| EstimateQualifier | 4 | 1 |
| EventKind | 26 | 1 |
| EventRole | 14 | 1 |
| EventStatus | 4 | 1 |
| EvidenceAuthority | 6 | 1 |
| EvidenceFacet | 5 | 1 |
| EvidenceIndependence | 5 | 1 |
| EvidenceOrigin | 2 | 1 |
| EvidenceRole | 4 | 1 |
| ExposureRole | 3 | 1 |
| FoodCategorySystem | 8 | 1 |
| FoodDataSystem | 9 | 1 |
| FoodVariantKind | 7 | 1 |
| FrontierCurationStatus | 4 | 1 |
| FrontierGranularity | 6 | 1 |
| FulfillmentKind | 5 | 1 |
| GenerationMode | 4 | 1 |
| GeneticManipulation | 5 | 1 |
| HoldingPower | 4 | 2 |
| IntakeScope | 3 | 2 |
| InterventionKind | 8 | 1 |
| JudgeKind | 6 | 1 |
| LabTestKind | 3 | 1 |
| LegalStatusFamily | 3 | 1 |
| LegalStatusKind | 25 | 1 |
| ListingKind | 5 | 1 |
| MarketStatus | 3 | 1 |
| MaskingKind | 6 | 1 |
| MassBasis | 5 | 2 |
| MaterialGrade | 5 | 1 |
| MaterialKind | 7 | 1 |
| MeasureKind | 8 | 1 |
| MeasurementField | 19 | 6 |
| MeasurementPlatform | 11 | 2 |
| MechanismKind | 4 | 1 |
| MechanismReferenceScheme | 5 | 2 |
| MechanismSetting | 8 | 2 |
| MediaPlatform | 15 | 1 |
| MethodPrinciple | 13 | 1 |
| MetricDefinitionSource | 4 | 1 |
| MetricKind | 5 | 1 |
| MetricScale | 4 | 1 |
| ModelOrganism | 12 | 2 |
| MolecularEntityKind | 5 | 1 |
| NutrientKind | 6 | 1 |
| OptionDisposition | 5 | 1 |
| OrderChannel | 4 | 1 |
| OrganismGroup | 6 | 1 |
| OrganizationEntityKind | 5 | 1 |
| OrganizationKind | 15 | 1 |
| OrganizationStatus | 5 | 1 |
| OrgRoleKind | 12 | 1 |
| OutcomeKind | 6 | 1 |
| OutcomePriority | 6 | 1 |
| OwnershipBasis | 4 | 1 |
| PackageKind | 6 | 1 |
| PanelKind | 7 | 1 |
| ParticipantRole | 6 | 1 |
| PassFailVerdict | 4 | 1 |
| PatentDateBasis | 5 | 1 |
| PatentPublicationType | 5 | 1 |
| PhysicalFormKind | 4 | 1 |
| PlantPart | 14 | 1 |
| Polarity | 4 | 1 |
| PolicyOutcome | 5 | 3 |
| PopulationGroup | 14 | 2 |
| PreparationMethod | 21 | 1 |
| PrivacyClass | 2 | 70 |
| ProductKind | 12 | 1 |
| PropertyStatus | 4 | 6 |
| ProtocolChangeProvenance | 3 | 1 |
| PublicActorBasis | 7 | 1 |
| PublicationKind | 12 | 1 |
| PurchaseMode | 6 | 1 |
| QuantityComparator | 12 | 4 |
| ReadoutStage | 5 | 1 |
| RecallClass | 4 | 1 |
| RecallStatus | 4 | 1 |
| ReferenceIntervalDerivation | 7 | 1 |
| ReferenceIntervalKind | 4 | 1 |
| RegistryDateType | 2 | 4 |
| RegistryKind | 11 | 1 |
| RegistryStatus | 10 | 2 |
| RegulatoryPathway | 33 | 4 |
| RegulatoryRecordFamily | 5 | 1 |
| RegulatoryRecordKind | 25 | 1 |
| RegulatoryRecordOutcome | 31 | 1 |
| ReportItemKind | 2 | 1 |
| ReportKind | 5 | 1 |
| ReportSectionKind | 17 | 1 |
| RepublicationKind | 6 | 1 |
| RequirementBasis | 3 | 1 |
| RequirementLevel | 5 | 1 |
| ResponsiblePartyRole | 7 | 1 |
| ResultBasis | 5 | 1 |
| ResultValueQualifier | 7 | 1 |
| ReviewAction | 5 | 1 |
| SampleKind | 5 | 1 |
| SelectorKind | 13 | 1 |
| SemanticVerdict | 15 | 4 |
| SensingModality | 10 | 1 |
| SexScope | 4 | 3 |
| SourceKind | 13 | 1 |
| SourceRevisionKind | 8 | 3 |
| SpecimenKind | 14 | 1 |
| SpecPeriod | 4 | 1 |
| SpeechAct | 7 | 2 |
| StakeBand | 7 | 1 |
| StakeKind | 6 | 1 |
| StatisticalConclusion | 4 | 1 |
| StepKind | 7 | 1 |
| StudyKind | 13 | 1 |
| StudyPopulationKind | 4 | 1 |
| StudyResultKind | 14 | 1 |
| StudyRoleKind | 11 | 1 |
| SubstanceClass | 8 | 1 |
| TargetStatus | 2 | 1 |
| TaxonRank | 9 | 1 |
| TextBasis | 10 | 1 |
| TimeAnchor | 13 | 1 |
| TimePrecision | 6 | 30 |
| TrialPhase | 8 | 2 |
| UseConstraintKind | 6 | 1 |
| ValidTimeBasis | 5 | 20 |
| ValueTransferKind | 12 | 1 |
| VersionPopulatingMode | 2 | 1 |
| ViabilityState | 4 | 1 |
| ViolationCategory | 13 | 1 |
| WorkKind | 13 | 1 |

## Module seam matrix (integrator)

Added by `schema/program/final/_work/count-schema.mjs --append-map` because the map renderer above numbers the fragments D1–D14 in file order (its "D1" is fragment K, its "D2" is fragment D1, and so on) and expands interface targets into every implementing domain. This matrix uses the module ids of the assembled file's `# MODULE` banners. 

**Caveats (fix stage, 2026-10-09).** (1) The candidate measured here includes the R-49 projection-cache properties (FU-01 applied by the fix stage). (2) The relationship class shown by the map above comes from the IR, which still inherits the pinned `validation-params.json` (FU-08); for three types it disagrees with the merged register, and the register wins: MEASURES (map: derived, register: asserted), HAS_VARIANT and REQUIRES_INPUT_METRIC (map: asserted, register: structural). (3) The map's pair counts are the expanded count (R-01 option B); the module table below gives both. Re-measure after FU-08 lands.

A cell counts the declared relationship fields on node types of the row module whose concrete targets include a type of the column module (a union counts once per target module; an interface target counts once, for K, where it is declared). The diagonal is the module's internal edges. Every cross-module pair with its questions is in `final/seams.yaml` (`crossModuleEdges`).

| from (row) → to (column) | K | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | D10 | D11 | D12 | D13 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| K | 32 | · | · | · | · | · | · | · | · | · | · | · | · | · |
| D1 | · | 7 | · | · | · | · | · | · | · | · | · | · | · | · |
| D2 | 1 | 3 | 2 | 1 | · | 2 | · | · | · | · | · | · | · | · |
| D3 | 1 | 1 | 2 | 13 | 1 | 1 | 1 | 1 | · | · | · | · | 1 | · |
| D4 | · | 1 | 2 | · | 11 | · | 2 | 1 | · | · | · | · | · | · |
| D5 | 2 | · | 1 | · | 1 | 3 | · | · | · | · | · | · | · | · |
| D6 | · | 1 | · | · | · | · | 5 | 3 | · | · | · | · | 1 | · |
| D7 | · | · | · | · | · | · | · | 9 | · | · | · | · | · | · |
| D8 | · | 4 | · | · | · | · | 4 | 6 | 5 | · | · | · | · | · |
| D9 | 5 | · | · | · | · | · | · | 2 | · | 1 | · | · | · | · |
| D10 | 8 | · | · | · | · | 1 | · | · | · | · | · | · | · | · |
| D11 | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| D12 | · | 2 | · | · | · | · | 2 | · | · | · | · | · | 2 | · |
| D13 | · | · | · | 1 | · | · | · | 2 | 1 | · | · | · | · | 3 |

From→to pairs (collapsed): 181; cross-module: 86. Cross-module pairs by the module of the stored "from" type: K 7, D1 2, D2 4, D3 14, D4 4, D5 6, D6 10, D7 1, D8 20, D9 5, D10 7, D11 0, D12 3, D13 3.

Per-module counts (R-01 option A attribution: ASSESSES, DERIVED_FROM, MENTIONS and RENDITION_OF count in K; any other type in the first module that declares it). Budgets from 00-DIRECTIVE section 2: K ≤ 12 node types, ≤ 14 relationship types, ≤ 40 pairs; each domain module ≤ 8, ≤ 14, ≤ 35. "declared" = collapsed pairs produced by fields on the module's own node types.

| module | node types | relationship types | pairs collapsed (A) | pairs expanded (B) | declared collapsed | over budget |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| K | 11 | 15 | 36 | 593 | 29 | rel types 15>14; pairs B 593>40 |
| D1 | 4 | 6 | 7 | 7 | 7 | — |
| D2 | 5 | 6 | 10 | 10 | 10 | — |
| D3 | 8 | 14 | 30 | 30 | 31 | — |
| D4 | 7 | 13 | 17 | 17 | 17 | — |
| D5 | 6 | 6 | 9 | 64 | 9 | pairs B 64>35 |
| D6 | 6 | 9 | 11 | 11 | 11 | — |
| D7 | 4 | 7 | 9 | 9 | 9 | — |
| D8 | 6 | 11 | 25 | 25 | 25 | — |
| D9 | 3 | 6 | 7 | 7 | 9 | — |
| D10 | 3 | 4 | 5 | 60 | 9 | pairs B 60>35 |
| D11 | 1 | 0 | 0 | 0 | 0 | — |
| D12 | 3 | 4 | 8 | 8 | 8 | — |
| D13 | 2 | 5 | 7 | 7 | 7 | — |
| **total** | **69** | **106** | **181** | **848** | | |
