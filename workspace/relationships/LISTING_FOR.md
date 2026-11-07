---
id: "rel:LISTING_FOR"
kind: "relationship"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#LISTING_FOR","release:rules/temporal-rules.yaml#LISTING_FOR","release:sdl/modules/D6.graphql#L444-L475 (MerchantListing)"]
aliases: ["listing for","rel:LISTS_PRODUCT","LISTS_PRODUCT"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:6fa8ef899cba91dcfca74b8be6c38c4f44f53114ea90f406c6dd12c429279324"
---
# Relationship LISTING_FOR



| | |
| --- | --- |
| id | `rel:LISTING_FOR` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D6](../modules/D6.md) |
| stored direction | [MerchantListing](../nodes/MerchantListing.md) → [Package](../nodes/Package.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | zero_or_one open episode |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_LISTING_FOR_assertion`, `rel_LISTING_FOR_uid`, `rel_LISTING_FOR_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:MerchantListing)-[:LISTING_FOR]->(:Package)`.
- Fields in the stored direction (OUT): `MerchantListing.listingFor (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:LISTING_FOR --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [MerchantListing](../nodes/MerchantListing.md) | [Package](../nodes/Package.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [LISTING_FOR](../predicates/LISTING_FOR.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-CM-02`, `Q-D6-02`, `Q-D6-05`, `Q-D6-15`, `Q-D6-19`, `Q-D6-21`
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported)
- [D9/CQ-CM-04](../patterns/D9/CQ-CM-04.md) (supported)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported)
- [QP/P-09](../patterns/QP/P-09.md) (supported)

## Forbidden implications

- `LISTING_FOR` does NOT imply `SELLER_OF_RECORD`

## Tasks

- [Record an observed price for a listing](../tasks/record-price-observation.md)

## v1 navigation aliases

- `rel:LISTING_FOR` is unchanged from v1.
- `rel:LISTS_PRODUCT` (merged): D6: LISTING_FOR: Replaces LISTS_PRODUCT (legacy) and the 5-member ListingTarget union

## Source definition

- `release:registers/relationship-register.yaml#LISTING_FOR`
- `release:rules/temporal-rules.yaml#LISTING_FOR`
- `release:sdl/modules/D6.graphql#L444-L475 (MerchantListing)`
