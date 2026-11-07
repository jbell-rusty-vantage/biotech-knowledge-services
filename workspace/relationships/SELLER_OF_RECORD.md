---
id: "rel:SELLER_OF_RECORD"
kind: "relationship"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#SELLER_OF_RECORD","release:rules/temporal-rules.yaml#SELLER_OF_RECORD","release:sdl/modules/D6.graphql#L487-L517 (Offer)"]
aliases: ["seller of record"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:e8abc4157e36c7207aa811238157ce212081da75713aa8839c106f67e937f72c"
---
# Relationship SELLER_OF_RECORD



| | |
| --- | --- |
| id | `rel:SELLER_OF_RECORD` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D6](../modules/D6.md) |
| stored direction | [Offer](../nodes/Offer.md) → [Organization](../nodes/Organization.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | zero_or_one open episode |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_SELLER_OF_RECORD_assertion`, `rel_SELLER_OF_RECORD_uid`, `rel_SELLER_OF_RECORD_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Offer)-[:SELLER_OF_RECORD]->(:Organization)`.
- Fields in the stored direction (OUT): `Offer.sellerOfRecord (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:SELLER_OF_RECORD --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Offer](../nodes/Offer.md) | [Organization](../nodes/Organization.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [SELLER_OF_RECORD](../predicates/SELLER_OF_RECORD.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-CM-01`, `Q-D6-06`, `Q-D6-16`, `Q-D6-20`
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported)
- [D5/Q-D5-17](../patterns/D5/Q-D5-17.md) (supported)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported)
- [D9/Q-D9-21](../patterns/D9/Q-D9-21.md) (supported)
- [QP/P-09](../patterns/QP/P-09.md) (supported)

## Forbidden implications

- `LISTING_FOR` does NOT imply `SELLER_OF_RECORD`

## Tasks

- [Record an observed price for a listing](../tasks/record-price-observation.md)

## v1 navigation aliases

(none)

## Source definition

- `release:registers/relationship-register.yaml#SELLER_OF_RECORD`
- `release:rules/temporal-rules.yaml#SELLER_OF_RECORD`
- `release:sdl/modules/D6.graphql#L487-L517 (Offer)`
