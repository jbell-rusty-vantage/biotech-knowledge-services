---
id: "rel:RUNS_ON_DEVICE"
kind: "relationship"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#RUNS_ON_DEVICE","release:rules/temporal-rules.yaml#RUNS_ON_DEVICE","release:sdl/modules/D4.graphql#L475-L520 (AlgorithmVersion)"]
aliases: ["runs on device","rel:FIRMWARE_VERSION_OF","rel:RUNS_FIRMWARE_VERSION","FIRMWARE_VERSION_OF","RUNS_FIRMWARE_VERSION"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert"]
cardDigest: "sha256:9e6a5942a242b8a73348214de89583732c91fe8ce785cc0d25076a74330e9eb6"
---
# Relationship RUNS_ON_DEVICE



| | |
| --- | --- |
| id | `rel:RUNS_ON_DEVICE` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D4](../modules/D4.md) |
| stored direction | [AlgorithmVersion](../nodes/AlgorithmVersion.md) → [Device](../nodes/Device.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | many |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_RUNS_ON_DEVICE_assertion`, `rel_RUNS_ON_DEVICE_uid`, `rel_RUNS_ON_DEVICE_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:AlgorithmVersion)-[:RUNS_ON_DEVICE]->(:Device)`.
- Fields in the stored direction (OUT): `AlgorithmVersion.devices (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:RUNS_ON_DEVICE --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [AlgorithmVersion](../nodes/AlgorithmVersion.md) | [Device](../nodes/Device.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [RUNS_ON_DEVICE](../predicates/RUNS_ON_DEVICE.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-DX-09`, `Q-D4-07`, `Q-D4-09`, `Q-D4-17`, `Q-D4-23`
(none)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:RUNS_ON_DEVICE` is unchanged from v1.
- `rel:FIRMWARE_VERSION_OF` (merged): D4: RUNS_ON_DEVICE: Replaces RUNS_FIRMWARE_VERSION, FIRMWARE_VERSION_OF and the device side of pinned RUNS_ON_DEVICE
- `rel:RUNS_FIRMWARE_VERSION` (merged): D4: RUNS_ON_DEVICE: Replaces RUNS_FIRMWARE_VERSION, FIRMWARE_VERSION_OF and the device side of pinned RUNS_ON_DEVICE

## Source definition

- `release:registers/relationship-register.yaml#RUNS_ON_DEVICE`
- `release:rules/temporal-rules.yaml#RUNS_ON_DEVICE`
- `release:sdl/modules/D4.graphql#L475-L520 (AlgorithmVersion)`
