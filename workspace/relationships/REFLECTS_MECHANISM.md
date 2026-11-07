---
id: "rel:REFLECTS_MECHANISM"
kind: "relationship"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#REFLECTS_MECHANISM","release:rules/temporal-rules.yaml#REFLECTS_MECHANISM","release:sdl/modules/D4.graphql#L292-L319 (Biomarker)"]
aliases: ["reflects mechanism","rel:IN_PATHWAY","IN_PATHWAY"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:b71715a284b1ad909d0716ebb0d5b032d28c2eccaf1f0c9f22177d0b9714ee66"
---
# Relationship REFLECTS_MECHANISM



| | |
| --- | --- |
| id | `rel:REFLECTS_MECHANISM` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D4](../modules/D4.md) |
| stored direction | [Biomarker](../nodes/Biomarker.md) → [Mechanism](../nodes/Mechanism.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | many |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_REFLECTS_MECHANISM_assertion`, `rel_REFLECTS_MECHANISM_uid`, `rel_REFLECTS_MECHANISM_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Biomarker)-[:REFLECTS_MECHANISM]->(:Mechanism)`.
- Fields in the stored direction (OUT): `Biomarker.reflectsMechanisms (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:REFLECTS_MECHANISM --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Biomarker](../nodes/Biomarker.md) | [Mechanism](../nodes/Mechanism.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [REFLECTS_MECHANISM](../predicates/REFLECTS_MECHANISM.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D4-01`
- [QP/P-12](../patterns/QP/P-12.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:REFLECTS_MECHANISM` is unchanged from v1.
- `rel:IN_PATHWAY` (merged): D2: D4 Biomarker → Pathway: replaced by REFLECTS_MECHANISM (D4)

## Source definition

- `release:registers/relationship-register.yaml#REFLECTS_MECHANISM`
- `release:rules/temporal-rules.yaml#REFLECTS_MECHANISM`
- `release:sdl/modules/D4.graphql#L292-L319 (Biomarker)`
