---
id: "edge:MechanismProjectionProperties"
kind: "edge-properties"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L212-L229"]
aliases: ["mechanism projection properties"]
capabilities: ["get"]
cardDigest: "sha256:f529ea81c255d25eccdbed1f59cd323121807fe8dd294b7a7b9f9986a6756436"
---
# Edge properties MechanismProjectionProperties

Derived mechanism projection (AFFECTS_MECHANISM), recorded time only, read-only, regenerable by a PROJECTION Activity. Kernel DerivedEdgeProperties fields first, verbatim (derivationRule names method + version, e.g. `d2.affects-mechanism/v1`; derivedFromAssertionUids lists every input Assertion). The summary fields are computed from the input Assertions and their MechanismEvidenceContexts and exist because questions filter on them (Q-D2-02 direction and highest setting; CQ-MX-05 best basis; Q-D2-06 human yes/no). A superset of kernel DerivedEdgeProperties, an M11 base (R-47). `score` stays null on this edge: it links two domain entities, so the executor validates score = null (00-DIRECTIVE 3.6); support scores and rankings (Q-D2-18) are D10 Association records (EVIDENCE_AGGREGATE, one per modulator × mechanism). `direction` is D3 EstimateDirection (R-59): direction of change, never benefit or harm. Questions: CQ-MX-05, Q-D2-02, Q-D2-03, Q-D2-06.

| | |
| --- | --- |
| id | `edge:MechanismProjectionProperties` · raw SDL [sdl:MechanismProjectionProperties](../sdl/MechanismProjectionProperties.graphql) |
| module | [D2](../modules/D2.md) |
| used by relationship types | [AFFECTS_MECHANISM](../relationships/AFFECTS_MECHANISM.md) |
| set by the executor | `projectionOfAssertionUid`, `derivationRule`, `derivedFromAssertionUids`, `derivedFromAssessmentUids`, `derivedAt`, `lastWriterRunId` |

## Properties (14)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `projectionOfAssertionUid` | `String` |  | create+update |  | D2.graphql:L213 |
| `derivationRule` | `String` |  | create+update |  | D2.graphql:L214 |
| `derivedFromAssertionUids` | `[String!]` |  | create+update |  | D2.graphql:L215 |
| `derivedFromAssessmentUids` | `[String!]` |  | create+update |  | D2.graphql:L216 |
| `score` | `Float` |  | create+update |  | D2.graphql:L217 |
| `derivedAt` | `DateTime` |  | create+update |  | D2.graphql:L218 |
| `lastWriterRunId` | `String` |  | create+update |  | D2.graphql:L219 |
| `direction` | [EstimateDirection](../vocabularies/EstimateDirection.md) |  | create+update |  | D2.graphql:L220 |
| `bestBasis` | [BasisKind](../vocabularies/BasisKind.md) |  | create+update | Strongest kernel BasisKind among the inputs, ranked by the one published kernel basis order (BasisKind docstring; R-25). | D2.graphql:L222 |
| `highestSetting` | [MechanismSetting](../vocabularies/MechanismSetting.md) |  | create+update |  | D2.graphql:L223 |
| `humanMeasured` | `Boolean` |  | create+update |  | D2.graphql:L224 |
| `nContexts` | `Int` |  | create+update |  | D2.graphql:L225 |
| `nHumanContexts` | `Int` |  | create+update |  | D2.graphql:L226 |
| `viaParticipant` | `Boolean` |  | create+update | True when the input assertions name a MolecularEntity or D1 metabolite that PARTICIPATES_IN the mechanism, not the mechanism itself. | D2.graphql:L228 |

## Declared on (1 fields)

- [Mechanism](../nodes/Mechanism.md).`affectedBy` ([AFFECTS_MECHANISM](../relationships/AFFECTS_MECHANISM.md))

## Source definition

- `release:sdl/modules/D2.graphql#L212-L229`
