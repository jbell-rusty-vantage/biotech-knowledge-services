---
id: "rel:HAS_OFFER"
kind: "relationship"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_OFFER","release:rules/temporal-rules.yaml#HAS_OFFER","release:sdl/modules/D6.graphql#L444-L475 (MerchantListing)"]
aliases: ["has offer","rel:LISTS","LISTS"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:841adaf8461825ab131f0fe5f9ef4eda9bc639a6f1627ad618b3e431c4cf680c"
---
# Relationship HAS_OFFER



| | |
| --- | --- |
| id | `rel:HAS_OFFER` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D6](../modules/D6.md) |
| stored direction | [MerchantListing](../nodes/MerchantListing.md) → [Offer](../nodes/Offer.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | many |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_OFFER_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:MerchantListing)-[:HAS_OFFER]->(:Offer)`.
- Fields in the stored direction (OUT): `MerchantListing.offers (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_OFFER --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [MerchantListing](../nodes/MerchantListing.md) | [Offer](../nodes/Offer.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-CM-01`, `CQ-CM-02`, `Q-D6-02`, `Q-D6-13`
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported)
- [D9/CQ-CM-04](../patterns/D9/CQ-CM-04.md) (supported)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported)
- [D9/Q-D9-21](../patterns/D9/Q-D9-21.md) (supported)
- [QP/P-09](../patterns/QP/P-09.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Record an observed price for a listing](../tasks/record-price-observation.md)

## v1 navigation aliases

- `rel:HAS_OFFER` is unchanged from v1.
- `rel:LISTS` (merged): D6: generic; replaced by HAS_OFFER / LISTING_FOR

## Source definition

- `release:registers/relationship-register.yaml#HAS_OFFER`
- `release:rules/temporal-rules.yaml#HAS_OFFER`
- `release:sdl/modules/D6.graphql#L444-L475 (MerchantListing)`
