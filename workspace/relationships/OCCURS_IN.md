---
id: "rel:OCCURS_IN"
kind: "relationship"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#OCCURS_IN","release:rules/temporal-rules.yaml#OCCURS_IN","release:sdl/modules/D9.graphql#L233-L283 (MediaWork)"]
aliases: ["occurs in","rel:OCCURS_IN_SEGMENT","OCCURS_IN_SEGMENT"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:f4ff14e42ce8ba56147228f047fc398cbb5d6f43e20db481fde54ac71d0f10b0"
---
# Relationship OCCURS_IN



| | |
| --- | --- |
| id | `rel:OCCURS_IN` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D9](../modules/D9.md) |
| stored direction | [Assertion](../nodes/Assertion.md) → [MediaWork](../nodes/MediaWork.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | exactly_one container per Assertion whose evidence is in a MediaWork (the work in which the act of asserting was first published); many per work |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_OCCURS_IN_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:Assertion)-[:OCCURS_IN]->(:MediaWork)`.
- Fields in the stored direction (OUT): (none)
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `MediaWork.occurrences (IN)`

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:OCCURS_IN --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Assertion](../nodes/Assertion.md) | [MediaWork](../nodes/MediaWork.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-CL-01`, `CQ-CL-02`, `CQ-CL-05`, `CQ-CL-06`, `CQ-CL-08`, `CQ-CM-04`, `Q-D9-01`, `Q-D9-02`, `Q-D9-04`, `Q-D9-07`, `Q-D9-08`, `Q-D9-09`, `Q-D9-10`, `Q-D9-11`, `Q-D9-13`, `Q-D9-18`, `Q-D9-19`, `Q-D9-21`, `Q-D9-23`
- [D10/Q-D10-21](../patterns/D10/Q-D10-21.md) (supported)
- [D7/CQ-CL-05#1](../patterns/D7/CQ-CL-05--1.md) (supported)
- [D7/Q-D7-06#1](../patterns/D7/Q-D7-06--1.md) (supported)
- [D9/CQ-CL-01](../patterns/D9/CQ-CL-01.md) (supported)
- [D9/CQ-CL-02](../patterns/D9/CQ-CL-02.md) (supported)
- [D9/CQ-CL-05](../patterns/D9/CQ-CL-05.md) (supported)
- [D9/CQ-CL-06](../patterns/D9/CQ-CL-06.md) (supported)
- [D9/CQ-CL-08](../patterns/D9/CQ-CL-08.md) (supported)
- [D9/CQ-CM-04](../patterns/D9/CQ-CM-04.md) (supported)
- [D9/CQ-PV-05](../patterns/D9/CQ-PV-05.md) (supported)
- [D9/Q-D9-01](../patterns/D9/Q-D9-01.md) (supported)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported)
- [D9/Q-D9-04](../patterns/D9/Q-D9-04.md) (supported)
- [D9/Q-D9-07](../patterns/D9/Q-D9-07.md) (supported)
- [D9/Q-D9-08](../patterns/D9/Q-D9-08.md) (supported)
- [D9/Q-D9-09](../patterns/D9/Q-D9-09.md) (supported)
- [D9/Q-D9-10](../patterns/D9/Q-D9-10.md) (supported)
- [D9/Q-D9-11](../patterns/D9/Q-D9-11.md) (supported)
- [D9/Q-D9-13](../patterns/D9/Q-D9-13.md) (supported)
- [D9/Q-D9-18](../patterns/D9/Q-D9-18.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest claims made in a podcast or video episode](../tasks/ingest-podcast-claims.md)

## v1 navigation aliases

- `rel:OCCURS_IN` is unchanged from v1.
- `rel:OCCURS_IN_SEGMENT` (merged): D9: OCCURS_IN: Replaces pinned OCCURS_IN (OccurrenceContainerTarget union of 3) and OCCURS_IN_SEGMENT

## Source definition

- `release:registers/relationship-register.yaml#OCCURS_IN`
- `release:rules/temporal-rules.yaml#OCCURS_IN`
- `release:sdl/modules/D9.graphql#L233-L283 (MediaWork)`
