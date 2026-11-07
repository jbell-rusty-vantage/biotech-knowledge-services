---
id: "rel:ASSERTED_BY"
kind: "relationship"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#ASSERTED_BY","release:rules/temporal-rules.yaml#ASSERTED_BY","release:sdl/modules/kernel.graphql#L708-L803 (Assertion)"]
aliases: ["asserted by"]
capabilities: ["get","neighbors","slice","find","read-only","pattern"]
cardDigest: "sha256:118a72868786f91af0c826ee0d81a69102720d4ddec886ff146e0dbedf280439"
---
# Relationship ASSERTED_BY



| | |
| --- | --- |
| id | `rel:ASSERTED_BY` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [K](../modules/K.md) |
| stored direction | [Assertion](../nodes/Assertion.md) → [Subjectable](../interfaces/Subjectable.md) (always from → to) |
| edge properties | (none) |
| cardinality | exactly_one per Assertion (D7 Person or Organization, K Agent, D3 Publication or D9 MediaWork for a multi-author work's own voice (R-15), D9 Channel ACCOUNT; executor-validated, P20) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | to [Subjectable](../interfaces/Subjectable.md) (56 members, kernel-traversal) |
| registered | yes (relationship register) |
| required indexes | (none) |
| write with | planner-emitted (kernel plumbing) — emitted by the planner as part of other proposals |

## Stored direction and GraphQL fields

- Stored: `(:Assertion)-[:ASSERTED_BY]->(:Subjectable)`.
- Fields in the stored direction (OUT): `Assertion.assertedBy (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 56 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:ASSERTED_BY --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Assertion](../nodes/Assertion.md) | [Subjectable](../interfaces/Subjectable.md) | 56 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-K-01`, `Q-K-09`, `Q-K-11`, `Q-K-15`, `Q-K-22`, `Q-K-23`, `Q-K-27`
- [D1/CQ-ID-03](../patterns/D1/CQ-ID-03.md) (supported)
- [D1/CQ-ID-04](../patterns/D1/CQ-ID-04.md) (supported)
- [D1/CQ-PF-01](../patterns/D1/CQ-PF-01.md) (supported)
- [D1/Q-D1-16](../patterns/D1/Q-D1-16.md) (supported)
- [D10/Q-D10-21](../patterns/D10/Q-D10-21.md) (supported)
- [D11/Q-D11-08](../patterns/D11/Q-D11-08.md) (supported)
- [D12/Q-D12-18](../patterns/D12/Q-D12-18.md) (supported)
- [D13/Q-D13-04#1](../patterns/D13/Q-D13-04--1.md) (supported)
- [D13/Q-D13-12#1](../patterns/D13/Q-D13-12--1.md) (supported)
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported)
- [D13/Q-D13-22#1](../patterns/D13/Q-D13-22--1.md) (supported)
- [D3/CQ-EV-05#1](../patterns/D3/CQ-EV-05--1.md) (supported)
- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported)
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported)
- [D5/Q-D5-17](../patterns/D5/Q-D5-17.md) (supported)
- [D5/Q-D5-20](../patterns/D5/Q-D5-20.md) (supported)
- [D6/CQ-PF-01#2](../patterns/D6/CQ-PF-01--2.md) (supported)
- [D6/Q-D6-10#1](../patterns/D6/Q-D6-10--1.md) (supported)
- [D6/Q-D6-11#1](../patterns/D6/Q-D6-11--1.md) (supported)
- [D7/CQ-CL-05#1](../patterns/D7/CQ-CL-05--1.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest claims made in a podcast or video episode](../tasks/ingest-podcast-claims.md)
- [Trace an assertion to its source span and adjudication](../tasks/trace-answer-to-source.md)

## v1 navigation aliases

- `rel:ASSERTED_BY` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#ASSERTED_BY`
- `release:rules/temporal-rules.yaml#ASSERTED_BY`
- `release:sdl/modules/kernel.graphql#L708-L803 (Assertion)`
