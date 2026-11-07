---
id: "rel:BRANDED_AS"
kind: "relationship"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#BRANDED_AS","release:rules/temporal-rules.yaml#BRANDED_AS","release:sdl/modules/D6.graphql#L272-L297 (Product)"]
aliases: ["branded as"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:e2ea07477f4686c17d47327b0ed3bc99f6521f22b9a403b7ae967a6e1dc12e53"
---
# Relationship BRANDED_AS



| | |
| --- | --- |
| id | `rel:BRANDED_AS` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D6](../modules/D6.md) |
| stored direction | [Product](../nodes/Product.md) → [Brand](../nodes/Brand.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | zero_or_one open episode |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_BRANDED_AS_assertion`, `rel_BRANDED_AS_uid`, `rel_BRANDED_AS_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Product)-[:BRANDED_AS]->(:Brand)`.
- Fields in the stored direction (OUT): `Product.brand (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:BRANDED_AS --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Product](../nodes/Product.md) | [Brand](../nodes/Brand.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [BRANDED_AS](../predicates/BRANDED_AS.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D6-11`, `Q-D6-12`, `Q-D6-16`, `Q-D6-20`
- [D12/Q-D12-06#option-a](../patterns/D12/Q-D12-06--option-a.md) (supported)
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported)
- [D6/Q-D6-11#1](../patterns/D6/Q-D6-11--1.md) (supported)
- [D7/CQ-CL-05#1](../patterns/D7/CQ-CL-05--1.md) (supported)
- [D7/Q-D7-06#1](../patterns/D7/Q-D7-06--1.md) (supported)
- [D8/CQ-MF-01](../patterns/D8/CQ-MF-01.md) (supported)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported)
- [QP/P-09](../patterns/QP/P-09.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest a product label (supplement facts) as a label version with its component lines](../tasks/ingest-product-label.md)

## v1 navigation aliases

(none)

## Source definition

- `release:registers/relationship-register.yaml#BRANDED_AS`
- `release:rules/temporal-rules.yaml#BRANDED_AS`
- `release:sdl/modules/D6.graphql#L272-L297 (Product)`
