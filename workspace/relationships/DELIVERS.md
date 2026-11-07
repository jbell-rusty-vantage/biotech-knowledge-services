---
id: "rel:DELIVERS"
kind: "relationship"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#DELIVERS","release:rules/temporal-rules.yaml#DELIVERS","release:sdl/modules/D4.graphql#L583-L606 (Device)","release:sdl/modules/D4.graphql#L379-L418 (LabTest)"]
aliases: ["delivers","rel:DELIVERS_LABTEST","rel:EMBODIES_MODEL","DELIVERS_LABTEST","EMBODIES_MODEL"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:60c96cf82911d1bd728f78e6a4a31e1d4af368343eadd6ebe12dec6c160adbc6"
---
# Relationship DELIVERS



| | |
| --- | --- |
| id | `rel:DELIVERS` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D4](../modules/D4.md) |
| stored direction | [Product](../nodes/Product.md) → [LabTest](../nodes/LabTest.md) \| [Device](../nodes/Device.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | many (declared on LabTest.products and Device.products, direction IN; 2 pairs) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_DELIVERS_assertion`, `rel_DELIVERS_uid`, `rel_DELIVERS_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Product)-[:DELIVERS]->(:LabTest)` (other declared endpoints below).
- Fields in the stored direction (OUT): (none)
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `Device.products (IN)`, `LabTest.products (IN)`

## Endpoints (2 declared, 2 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:DELIVERS --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Product](../nodes/Product.md) | [Device](../nodes/Device.md) | 1 |
| [Product](../nodes/Product.md) | [LabTest](../nodes/LabTest.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [DELIVERS](../predicates/DELIVERS.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D4-01`, `Q-D4-08`, `Q-D4-09`, `Q-D4-10`, `Q-D4-13`, `Q-D4-18`, `Q-D4-24`
- [D8/Q-D8-23](../patterns/D8/Q-D8-23.md) (supported)
- [QP/P-12](../patterns/QP/P-12.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:DELIVERS_LABTEST` (merged): D4: merged into DELIVERS (Product → LabTest)
- `rel:EMBODIES_MODEL` (merged): D4: merged into DELIVERS (Product → Device)

## Source definition

- `release:registers/relationship-register.yaml#DELIVERS`
- `release:rules/temporal-rules.yaml#DELIVERS`
- `release:sdl/modules/D4.graphql#L583-L606 (Device)`
- `release:sdl/modules/D4.graphql#L379-L418 (LabTest)`
