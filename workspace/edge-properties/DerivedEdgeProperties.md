---
id: "edge:DerivedEdgeProperties"
kind: "edge-properties"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L99-L108"]
aliases: ["derived edge properties"]
capabilities: ["get"]
cardDigest: "sha256:21bfff40d795d92fd8a3b0333d10aec273b8ff52ba2eba09c358ddcda9e6f658"
---
# Edge properties DerivedEdgeProperties

Derived edge (recorded time only): a regenerable, read-only projection rebuilt by a projection Activity. Exactly one citation form: `projectionOfAssertionUid` (1:1), or `derivationRule` + `derivedFromAssertionUids`, or `derivationRule` + `derivedFromAssessmentUids`. `derivationRule` names method and version (e.g. `entity-link/v2`). A base type of the domain-local superset rule (M11, R-47).

| | |
| --- | --- |
| id | `edge:DerivedEdgeProperties` · raw SDL [sdl:DerivedEdgeProperties](../sdl/DerivedEdgeProperties.graphql) |
| module | [K](../modules/K.md) |
| used by relationship types | [ASSOCIATES](../relationships/ASSOCIATES.md), [COVERS_LOCATOR](../relationships/COVERS_LOCATOR.md), [MENTIONS](../relationships/MENTIONS.md), [RESOLVES_TO_CONSTRAINT](../relationships/RESOLVES_TO_CONSTRAINT.md), [STATES_CONSTRAINT](../relationships/STATES_CONSTRAINT.md) |
| set by the executor | `projectionOfAssertionUid`, `derivationRule`, `derivedFromAssertionUids`, `derivedFromAssessmentUids`, `derivedAt`, `lastWriterRunId` |

## Properties (7)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `projectionOfAssertionUid` | `String` |  | create+update |  | kernel.graphql:L100 |
| `derivationRule` | `String` |  | create+update |  | kernel.graphql:L101 |
| `derivedFromAssertionUids` | `[String!]` |  | create+update |  | kernel.graphql:L102 |
| `derivedFromAssessmentUids` | `[String!]` |  | create+update |  | kernel.graphql:L103 |
| `score` | `Float` |  | create+update | Retrieval score of the method only (entity-link confidence, span overlap); never evidence, never a truth value, and never set on an edge between two… | kernel.graphql:L105 |
| `derivedAt` | `DateTime` |  | create+update |  | kernel.graphql:L106 |
| `lastWriterRunId` | `String` |  | create+update |  | kernel.graphql:L107 |

## Declared on (5 fields)

- [ProtocolStep](../nodes/ProtocolStep.md).`statesConstraints` ([STATES_CONSTRAINT](../relationships/STATES_CONSTRAINT.md))
- [UseConstraint](../nodes/UseConstraint.md).`resolvedFrom` ([RESOLVES_TO_CONSTRAINT](../relationships/RESOLVES_TO_CONSTRAINT.md))
- [Chunk](../nodes/Chunk.md).`locators` ([COVERS_LOCATOR](../relationships/COVERS_LOCATOR.md))
- [Chunk](../nodes/Chunk.md).`mentions` ([MENTIONS](../relationships/MENTIONS.md))
- [Association](../nodes/Association.md).`members` ([ASSOCIATES](../relationships/ASSOCIATES.md))

## Source definition

- `release:sdl/modules/kernel.graphql#L99-L108`
