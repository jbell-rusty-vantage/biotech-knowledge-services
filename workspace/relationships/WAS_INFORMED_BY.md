---
id: "rel:WAS_INFORMED_BY"
kind: "relationship"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#WAS_INFORMED_BY","release:rules/temporal-rules.yaml#WAS_INFORMED_BY","release:sdl/modules/kernel.graphql#L1145-L1215 (Activity)"]
aliases: ["was informed by"]
capabilities: ["get","neighbors","slice","find","read-only","pattern"]
cardDigest: "sha256:aa770a80d58bed6ccca6f45da7e0855b809d0e706017752369a44255a98c5168"
---
# Relationship WAS_INFORMED_BY



| | |
| --- | --- |
| id | `rel:WAS_INFORMED_BY` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [K](../modules/K.md) |
| stored direction | [Activity](../nodes/Activity.md) → [Activity](../nodes/Activity.md) (always from → to) |
| edge properties | (none) |
| cardinality | many |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | (none) |
| write with | planner-emitted (kernel plumbing) — emitted by the planner as part of other proposals |

## Stored direction and GraphQL fields

- Stored: `(:Activity)-[:WAS_INFORMED_BY]->(:Activity)`.
- Fields in the stored direction (OUT): `Activity.informedBy (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:WAS_INFORMED_BY --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Activity](../nodes/Activity.md) | [Activity](../nodes/Activity.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-K-06`, `Q-K-08`
- [QP/P-10c.3](../patterns/QP/P-10c.3.md) (supported)
- [QP/P-11a](../patterns/QP/P-11a.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Take a claim through vetting, an evidence mission and a published evidence report](../tasks/claim-to-evidence-report.md)

## v1 navigation aliases

(none)

## Source definition

- `release:registers/relationship-register.yaml#WAS_INFORMED_BY`
- `release:rules/temporal-rules.yaml#WAS_INFORMED_BY`
- `release:sdl/modules/kernel.graphql#L1145-L1215 (Activity)`
