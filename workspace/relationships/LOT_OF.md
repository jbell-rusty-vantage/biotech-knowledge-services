---
id: "rel:LOT_OF"
kind: "relationship"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#LOT_OF","release:rules/temporal-rules.yaml#LOT_OF","release:sdl/modules/D8.graphql#L495-L516 (Lot)"]
aliases: ["lot of"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:525bb76b6116e6214b58d232338d9ca71005e6b912f3a497260331b7847cfd70"
---
# Relationship LOT_OF



| | |
| --- | --- |
| id | `rel:LOT_OF` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D8](../modules/D8.md) |
| stored direction | [Lot](../nodes/Lot.md) → [Product](../nodes/Product.md) \| [ProductVariant](../nodes/ProductVariant.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | exactly_one |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_LOT_OF_assertion`, `rel_LOT_OF_uid`, `rel_LOT_OF_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Lot)-[:LOT_OF]->(:Product)` (other declared endpoints below).
- Fields in the stored direction (OUT): `Lot.lotOf (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (2 declared, 2 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:LOT_OF --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Lot](../nodes/Lot.md) | [Product](../nodes/Product.md) | 1 |
| [Lot](../nodes/Lot.md) | [ProductVariant](../nodes/ProductVariant.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [LOT_OF](../predicates/LOT_OF.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-AX-19`, `Q-D8-04`, `Q-D8-06`, `Q-D8-08`, `Q-D8-18`
- [D12/Q-D12-03#option-a](../patterns/D12/Q-D12-03--option-a.md) (supported)
- [D12/Q-D12-06#option-a](../patterns/D12/Q-D12-06--option-a.md) (supported)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported)
- [D8/Q-D8-19](../patterns/D8/Q-D8-19.md) (supported)
- [D8/Q-D8-23](../patterns/D8/Q-D8-23.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Compare measured content of a sold product with its label declaration (OD-10 option A)](../tasks/measured-versus-declared-content.md)

## v1 navigation aliases

- `rel:LOT_OF` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#LOT_OF`
- `release:rules/temporal-rules.yaml#LOT_OF`
- `release:sdl/modules/D8.graphql#L495-L516 (Lot)`
