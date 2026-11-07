---
id: "rel:WAS_ASSOCIATED_WITH"
kind: "relationship"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#WAS_ASSOCIATED_WITH","release:rules/temporal-rules.yaml#WAS_ASSOCIATED_WITH","release:sdl/modules/kernel.graphql#L1145-L1215 (Activity)"]
aliases: ["was associated with","rel:ASSESSED_BY","ASSESSED_BY"]
capabilities: ["get","neighbors","slice","find","read-only","pattern"]
cardDigest: "sha256:a6c7687adde4a645107c998b3fb781393e0ef6212f12bbedf21ded07cd9ef701"
---
# Relationship WAS_ASSOCIATED_WITH



| | |
| --- | --- |
| id | `rel:WAS_ASSOCIATED_WITH` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [K](../modules/K.md) |
| stored direction | [Activity](../nodes/Activity.md) → [Agent](../nodes/Agent.md) (always from → to) |
| edge properties | (none) |
| cardinality | one_or_more per Activity |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | (none) |
| write with | planner-emitted (kernel plumbing) — emitted by the planner as part of other proposals |

## Stored direction and GraphQL fields

- Stored: `(:Activity)-[:WAS_ASSOCIATED_WITH]->(:Agent)`.
- Fields in the stored direction (OUT): `Activity.agents (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:WAS_ASSOCIATED_WITH --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Activity](../nodes/Activity.md) | [Agent](../nodes/Agent.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-K-03`, `Q-K-24`
- [QP/P-10e](../patterns/QP/P-10e.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:WAS_ASSOCIATED_WITH` is unchanged from v1.
- `rel:ASSESSED_BY` (merged): K: WAS_ASSOCIATED_WITH: replaces ASSESSED_BY

## Source definition

- `release:registers/relationship-register.yaml#WAS_ASSOCIATED_WITH`
- `release:rules/temporal-rules.yaml#WAS_ASSOCIATED_WITH`
- `release:sdl/modules/kernel.graphql#L1145-L1215 (Activity)`
