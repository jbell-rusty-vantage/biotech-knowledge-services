---
id: "edge:MechanismReferenceProperties"
kind: "edge-properties"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L180-L189"]
aliases: ["mechanism reference properties"]
capabilities: ["get"]
cardDigest: "sha256:dd49ad2302ce6735efe2b6212d946516f4a53045bf2771aea6d4fb12466a4ff6"
---
# Edge properties MechanismReferenceProperties

Asserted reference statement (PART_OF_MECHANISM, PARTICIPATES_IN), recorded time only: one relationship per recorded-time episode, authorized by exactly one Assertion per authority record and release (asserter = the authority or, for BELLLABS_CURATED, the curation Agent; locator = JSON_POINTER into the authority record or the curation record). The BellLabs hallmark mapping is a curation file held as a kernel Source with one snapshot per version; its mapping Assertions use basisKind CURATOR_CLASSIFICATION (R-25, R-26). The kernel AssertedRecordedProperties fields come first, verbatim (K rule M11). `referenceRelease` is the authority release the authorizing Assertion read (e.g. Reactome stIdVersion R-HSA-196807.8, GO release date, GenAge build 21); when a new release no longer states the edge, its episode is closed (`recordedTo`), never deleted. Questions: Q-D2-11, Q-D2-02, Q-D2-12.

| | |
| --- | --- |
| id | `edge:MechanismReferenceProperties` · raw SDL [sdl:MechanismReferenceProperties](../sdl/MechanismReferenceProperties.graphql) |
| module | [D2](../modules/D2.md) |
| used by relationship types | [PARTICIPATES_IN](../relationships/PARTICIPATES_IN.md), [PART_OF_MECHANISM](../relationships/PART_OF_MECHANISM.md) |
| set by the executor | `relationshipUid`, `assertionUid`, `recordedFrom`, `lastWriterRunId` |

## Properties (8)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `relationshipUid` | `String!` | yes | create+update |  | D2.graphql:L181 |
| `assertionUid` | `String!` | yes | create+update |  | D2.graphql:L182 |
| `recordedFrom` | `DateTime!` | yes | create+update |  | D2.graphql:L183 |
| `recordedTo` | `DateTime` |  | create+update |  | D2.graphql:L184 |
| `lastWriterRunId` | `String` |  | create+update |  | D2.graphql:L185 |
| `referenceScheme` | [MechanismReferenceScheme](../vocabularies/MechanismReferenceScheme.md) |  | create+update |  | D2.graphql:L186 |
| `referenceRelease` | `String` |  | create+update |  | D2.graphql:L187 |
| `participantRole` | [ParticipantRole](../vocabularies/ParticipantRole.md) |  | create+update |  | D2.graphql:L188 |

## Declared on (3 fields)

- [Mechanism](../nodes/Mechanism.md).`partOf` ([PART_OF_MECHANISM](../relationships/PART_OF_MECHANISM.md))
- [Mechanism](../nodes/Mechanism.md).`metaboliteParticipants` ([PARTICIPATES_IN](../relationships/PARTICIPATES_IN.md))
- [MolecularEntity](../nodes/MolecularEntity.md).`participatesIn` ([PARTICIPATES_IN](../relationships/PARTICIPATES_IN.md))

## Source definition

- `release:sdl/modules/D2.graphql#L180-L189`
