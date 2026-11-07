---
id: "rel:USES_CRITERION"
kind: "relationship"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#USES_CRITERION","release:rules/temporal-rules.yaml#USES_CRITERION","release:sdl/modules/D10.graphql#L113-L167 (DecisionCriterion)"]
aliases: ["uses criterion","rel:DECLARES_CRITERION","DECLARES_CRITERION"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:92a9ec7ed7ce45b842b763dae4c6004fb96e9f22dc992a2094c2f6f6753e8b6a"
---
# Relationship USES_CRITERION



| | |
| --- | --- |
| id | `rel:USES_CRITERION` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D10](../modules/D10.md) |
| stored direction | [Report](../nodes/Report.md) → [DecisionCriterion](../nodes/DecisionCriterion.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | Report (COMPARISON, RECOMMENDATION, PROFILE with an OPTIONS section) → one_or_more criteria versions |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_USES_CRITERION_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:Report)-[:USES_CRITERION]->(:DecisionCriterion)`.
- Fields in the stored direction (OUT): (none)
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `DecisionCriterion.usedByReports (IN)`

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:USES_CRITERION --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Report](../nodes/Report.md) | [DecisionCriterion](../nodes/DecisionCriterion.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-RC-01`, `CQ-RC-02`, `CQ-RC-07`, `Q-D10-02`
- [QP/P-05b](../patterns/QP/P-05b.md) (supported)
- [QP/P-05c](../patterns/QP/P-05c.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:DECLARES_CRITERION` (renamed): D10: USES_CRITERION: Replaces pinned DECLARES_CRITERION (PolicyVersion → DecisionCriterion): PolicyVersion is not a node (R-33)

## Source definition

- `release:registers/relationship-register.yaml#USES_CRITERION`
- `release:rules/temporal-rules.yaml#USES_CRITERION`
- `release:sdl/modules/D10.graphql#L113-L167 (DecisionCriterion)`
