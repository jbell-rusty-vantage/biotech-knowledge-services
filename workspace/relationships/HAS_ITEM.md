---
id: "rel:HAS_ITEM"
kind: "relationship"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_ITEM","release:rules/temporal-rules.yaml#HAS_ITEM","release:sdl/modules/D10.graphql#L187-L247 (ReportItem)"]
aliases: ["has item"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:903f3b1be65b2dd1a530648286e685fd5c12d3551ca8f4462ef79c1cd22fe9b5"
---
# Relationship HAS_ITEM



| | |
| --- | --- |
| id | `rel:HAS_ITEM` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D10](../modules/D10.md) |
| stored direction | [Report](../nodes/Report.md) → [ReportItem](../nodes/ReportItem.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | Report → many ReportItems; ReportItem → exactly_one Report |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_ITEM_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:Report)-[:HAS_ITEM]->(:ReportItem)`.
- Fields in the stored direction (OUT): (none)
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `ReportItem.report (IN)`

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_ITEM --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Report](../nodes/Report.md) | [ReportItem](../nodes/ReportItem.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-AX-01`, `CQ-RC-01`, `Q-D10-02`, `Q-D10-14`
- [D10/Q-D10-08](../patterns/D10/Q-D10-08.md) (supported)
- [QP/P-01a](../patterns/QP/P-01a.md) (supported)
- [QP/P-05b](../patterns/QP/P-05b.md) (supported)
- [QP/P-05c](../patterns/QP/P-05c.md) (supported)
- [QP/P-07](../patterns/QP/P-07.md) (supported)
- [QP/P-11a](../patterns/QP/P-11a.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Take a claim through vetting, an evidence mission and a published evidence report](../tasks/claim-to-evidence-report.md)

## v1 navigation aliases

(none)

## Source definition

- `release:registers/relationship-register.yaml#HAS_ITEM`
- `release:rules/temporal-rules.yaml#HAS_ITEM`
- `release:sdl/modules/D10.graphql#L187-L247 (ReportItem)`
