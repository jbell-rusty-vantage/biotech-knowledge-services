---
id: "rel:HAS_PACKAGE"
kind: "relationship"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_PACKAGE","release:rules/temporal-rules.yaml#HAS_PACKAGE","release:sdl/modules/D6.graphql#L307-L328 (ProductVariant)"]
aliases: ["has package","rel:HAS_PACKAGE_CONFIGURATION","HAS_PACKAGE_CONFIGURATION"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:e8f2e0e9be405a5288f39a398d5327e727a7eb97d26c7b693ea56729adc938f7"
---
# Relationship HAS_PACKAGE



| | |
| --- | --- |
| id | `rel:HAS_PACKAGE` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D6](../modules/D6.md) |
| stored direction | [ProductVariant](../nodes/ProductVariant.md) → [Package](../nodes/Package.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | one_or_more |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_PACKAGE_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:ProductVariant)-[:HAS_PACKAGE]->(:Package)`.
- Fields in the stored direction (OUT): `ProductVariant.packages (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_PACKAGE --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [ProductVariant](../nodes/ProductVariant.md) | [Package](../nodes/Package.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-ID-02`, `Q-D6-02`, `Q-D6-04`
- [D1/Q-D1-16](../patterns/D1/Q-D1-16.md) (supported)
- [D12/Q-D12-18](../patterns/D12/Q-D12-18.md) (supported)
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported)
- [D6/CQ-AX-25#1](../patterns/D6/CQ-AX-25--1.md) (supported)
- [D6/Q-D6-08#1](../patterns/D6/Q-D6-08--1.md) (supported)
- [D6/Q-D6-10#1](../patterns/D6/Q-D6-10--1.md) (supported)
- [D6/Q-D6-11#1](../patterns/D6/Q-D6-11--1.md) (supported)
- [D8/CQ-MF-01](../patterns/D8/CQ-MF-01.md) (supported)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported)
- [D9/CQ-CM-04](../patterns/D9/CQ-CM-04.md) (supported)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported)
- [QP/P-09](../patterns/QP/P-09.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest a product label (supplement facts) as a label version with its component lines](../tasks/ingest-product-label.md)

## v1 navigation aliases

- `rel:HAS_PACKAGE_CONFIGURATION` (renamed): D6: renamed HAS_PACKAGE

## Source definition

- `release:registers/relationship-register.yaml#HAS_PACKAGE`
- `release:rules/temporal-rules.yaml#HAS_PACKAGE`
- `release:sdl/modules/D6.graphql#L307-L328 (ProductVariant)`
