---
id: "edge:ExposureRoleProperties"
kind: "edge-properties"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L195-L199"]
aliases: ["exposure role properties"]
capabilities: ["get"]
cardDigest: "sha256:7bf85c146876e59f9ba3f007f08da6bb3b6be1ebcc2752128709cbe19e54b9ab"
---
# Edge properties ExposureRoleProperties

Structural exposure attachment (EXPOSED_TO), recorded time only. Kernel StructuralEdgeProperties fields first, then the exposure role. Questions: CQ-MX-02, CQ-MX-04, Q-D2-09.

| | |
| --- | --- |
| id | `edge:ExposureRoleProperties` · raw SDL [sdl:ExposureRoleProperties](../sdl/ExposureRoleProperties.graphql) |
| module | [D2](../modules/D2.md) |
| used by relationship types | [EXPOSED_TO](../relationships/EXPOSED_TO.md) |
| set by the executor | `lastWriterRunId` |

## Properties (3)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `orderIndex` | `Int` |  | create+update |  | D2.graphql:L196 |
| `lastWriterRunId` | `String` |  | create+update |  | D2.graphql:L197 |
| `exposureRole` | [ExposureRole](../vocabularies/ExposureRole.md) | yes | create+update |  | D2.graphql:L198 |

## Declared on (1 fields)

- [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md).`exposures` ([EXPOSED_TO](../relationships/EXPOSED_TO.md))

## Source definition

- `release:sdl/modules/D2.graphql#L195-L199`
