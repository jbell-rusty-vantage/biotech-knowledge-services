---
id: "rel:HAS_VARIANT"
kind: "relationship"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_VARIANT","release:rules/temporal-rules.yaml#HAS_VARIANT","release:sdl/modules/D6.graphql#L272-L297 (Product)"]
aliases: ["has variant"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:9787caccf677b4351bd0b0fdbaeeb4f29f69e8aa9583be84522054b834ebffbb"
---
# Relationship HAS_VARIANT



| | |
| --- | --- |
| id | `rel:HAS_VARIANT` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D6](../modules/D6.md) |
| stored direction | [Product](../nodes/Product.md) → [ProductVariant](../nodes/ProductVariant.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | one_or_more |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_VARIANT_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:Product)-[:HAS_VARIANT]->(:ProductVariant)`.
- Fields in the stored direction (OUT): `Product.variants (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_VARIANT --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Product](../nodes/Product.md) | [ProductVariant](../nodes/ProductVariant.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-AX-25`, `Q-D6-02`, `Q-D6-16`
- [D12/Q-D12-06#option-a](../patterns/D12/Q-D12-06--option-a.md) (supported)
- [D12/Q-D12-18](../patterns/D12/Q-D12-18.md) (supported)
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported)
- [D6/CQ-AX-25#1](../patterns/D6/CQ-AX-25--1.md) (supported)
- [D6/Q-D6-08#1](../patterns/D6/Q-D6-08--1.md) (supported)
- [D6/Q-D6-10#1](../patterns/D6/Q-D6-10--1.md) (supported)
- [D6/Q-D6-11#1](../patterns/D6/Q-D6-11--1.md) (supported)
- [D8/CQ-MF-01](../patterns/D8/CQ-MF-01.md) (supported)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported)
- [D8/Q-D8-19](../patterns/D8/Q-D8-19.md) (supported)
- [D8/Q-D8-23](../patterns/D8/Q-D8-23.md) (supported)
- [D9/CQ-CM-04](../patterns/D9/CQ-CM-04.md) (supported)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported)
- [QP/P-09](../patterns/QP/P-09.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest a product label (supplement facts) as a label version with its component lines](../tasks/ingest-product-label.md)

## v1 navigation aliases

- `rel:HAS_VARIANT` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#HAS_VARIANT`
- `release:rules/temporal-rules.yaml#HAS_VARIANT`
- `release:sdl/modules/D6.graphql#L272-L297 (Product)`
