---
id: "rel:HAS_SUBJECT"
kind: "relationship"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_SUBJECT","release:rules/temporal-rules.yaml#HAS_SUBJECT","release:sdl/modules/kernel.graphql#L708-L803 (Assertion)"]
aliases: ["has subject"]
capabilities: ["get","neighbors","slice","find","read-only","pattern"]
cardDigest: "sha256:4dabdbe192c2d7809d05ce80ac97b181cac785d680af0e97e9f65801ad219e19"
---
# Relationship HAS_SUBJECT



| | |
| --- | --- |
| id | `rel:HAS_SUBJECT` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [K](../modules/K.md) |
| stored direction | [Assertion](../nodes/Assertion.md) → [Subjectable](../interfaces/Subjectable.md) (always from → to) |
| edge properties | (none) |
| cardinality | exactly_one per Assertion (the most specific record the source speaks about, R-18) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | to [Subjectable](../interfaces/Subjectable.md) (56 members, kernel-traversal) |
| registered | yes (relationship register) |
| required indexes | (none) |
| write with | planner-emitted (kernel plumbing) — emitted by the planner as part of other proposals |

## Stored direction and GraphQL fields

- Stored: `(:Assertion)-[:HAS_SUBJECT]->(:Subjectable)`.
- Fields in the stored direction (OUT): `Assertion.subject (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 56 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_SUBJECT --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Assertion](../nodes/Assertion.md) | [Subjectable](../interfaces/Subjectable.md) | 56 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-AX-04`, `Q-K-01`, `Q-K-02`, `Q-K-05`, `Q-K-15`, `Q-K-22`, `Q-K-27`
- [D1/CQ-PF-01](../patterns/D1/CQ-PF-01.md) (supported)
- [D1/Q-D1-16](../patterns/D1/Q-D1-16.md) (supported)
- [D10/Q-D10-03](../patterns/D10/Q-D10-03.md) (supported)
- [D10/Q-D10-08](../patterns/D10/Q-D10-08.md) (supported)
- [D10/Q-D10-21](../patterns/D10/Q-D10-21.md) (supported)
- [D11/CQ-PV-05](../patterns/D11/CQ-PV-05.md) (supported)
- [D11/Q-D11-05](../patterns/D11/Q-D11-05.md) (supported)
- [D11/Q-D11-08](../patterns/D11/Q-D11-08.md) (supported)
- [D12/Q-D12-03#option-a](../patterns/D12/Q-D12-03--option-a.md) (supported)
- [D12/Q-D12-06#option-a](../patterns/D12/Q-D12-06--option-a.md) (supported)
- [D12/Q-D12-18](../patterns/D12/Q-D12-18.md) (supported)
- [D13/Q-D13-04#1](../patterns/D13/Q-D13-04--1.md) (supported)
- [D13/Q-D13-12#1](../patterns/D13/Q-D13-12--1.md) (supported)
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported)
- [D13/Q-D13-22#1](../patterns/D13/Q-D13-22--1.md) (supported)
- [D2/Q-D2-10](../patterns/D2/Q-D2-10.md) (supported)
- [D3/CQ-EV-05#1](../patterns/D3/CQ-EV-05--1.md) (supported)
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported)
- [D5/Q-D5-17](../patterns/D5/Q-D5-17.md) (supported)
- [D5/Q-D5-20](../patterns/D5/Q-D5-20.md) (supported)

## Forbidden implications

(none)

## Tasks

- [What do we already know about X? (run before every research mission)](../tasks/what-do-we-know-about-entity.md)
- [Correct or end a fact that is no longer true](../tasks/correct-a-stale-fact.md)

## v1 navigation aliases

- `rel:HAS_SUBJECT` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#HAS_SUBJECT`
- `release:rules/temporal-rules.yaml#HAS_SUBJECT`
- `release:sdl/modules/kernel.graphql#L708-L803 (Assertion)`
