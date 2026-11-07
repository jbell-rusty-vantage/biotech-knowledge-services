---
id: "rel:INTERVAL_FOR"
kind: "relationship"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#INTERVAL_FOR","release:rules/temporal-rules.yaml#INTERVAL_FOR","release:sdl/modules/D4.graphql#L532-L572 (ReferenceIntervalVersion)"]
aliases: ["interval for","rel:FOR_ASSAY_VERSION","rel:FOR_METRIC","FOR_ASSAY_VERSION","FOR_METRIC"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural"]
cardDigest: "sha256:39570cb737986ea60cb72eece698543af384fb5be84087ecd67f050b7bb569b0"
---
# Relationship INTERVAL_FOR



| | |
| --- | --- |
| id | `rel:INTERVAL_FOR` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D4](../modules/D4.md) |
| stored direction | [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md) → [AssayVersion](../nodes/AssayVersion.md) \| [Metric](../nodes/Metric.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | assayVersions zero_or_one, metrics exactly_one (two fields; 2 pairs) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_INTERVAL_FOR_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:ReferenceIntervalVersion)-[:INTERVAL_FOR]->(:AssayVersion)` (other declared endpoints below).
- Fields in the stored direction (OUT): `ReferenceIntervalVersion.assayVersions (OUT)`, `ReferenceIntervalVersion.metrics (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (2 declared, 2 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:INTERVAL_FOR --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md) | [AssayVersion](../nodes/AssayVersion.md) | 1 |
| [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md) | [Metric](../nodes/Metric.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-DX-06`, `Q-D4-12`
(none)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:FOR_ASSAY_VERSION` (merged): D4: merged into INTERVAL_FOR
- `rel:FOR_METRIC` (merged): D4: merged into INTERVAL_FOR

## Source definition

- `release:registers/relationship-register.yaml#INTERVAL_FOR`
- `release:rules/temporal-rules.yaml#INTERVAL_FOR`
- `release:sdl/modules/D4.graphql#L532-L572 (ReferenceIntervalVersion)`
