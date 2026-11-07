---
id: "rel:HAS_OBJECT"
kind: "relationship"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_OBJECT","release:rules/temporal-rules.yaml#HAS_OBJECT","release:sdl/modules/kernel.graphql#L708-L803 (Assertion)"]
aliases: ["has object"]
capabilities: ["get","neighbors","slice","find","read-only","pattern"]
cardDigest: "sha256:1717f62c7760f3782184fa15570bacfe224354f2ddbe57a836268c0f80f06ad3"
---
# Relationship HAS_OBJECT



| | |
| --- | --- |
| id | `rel:HAS_OBJECT` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [K](../modules/K.md) |
| stored direction | [Assertion](../nodes/Assertion.md) → [Subjectable](../interfaces/Subjectable.md) (always from → to) |
| edge properties | (none) |
| cardinality | zero_or_one per Assertion (exclusive with the typed literal) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | to [Subjectable](../interfaces/Subjectable.md) (56 members, kernel-traversal) |
| registered | yes (relationship register) |
| required indexes | (none) |
| write with | planner-emitted (kernel plumbing) — emitted by the planner as part of other proposals |

## Stored direction and GraphQL fields

- Stored: `(:Assertion)-[:HAS_OBJECT]->(:Subjectable)`.
- Fields in the stored direction (OUT): `Assertion.object (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 56 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_OBJECT --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Assertion](../nodes/Assertion.md) | [Subjectable](../interfaces/Subjectable.md) | 56 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-K-01`, `Q-K-02`, `Q-K-04`, `Q-K-07`
- [D10/Q-D10-03](../patterns/D10/Q-D10-03.md) (supported)
- [D10/Q-D10-08](../patterns/D10/Q-D10-08.md) (supported)
- [D10/Q-D10-21](../patterns/D10/Q-D10-21.md) (supported)
- [D11/Q-D11-08](../patterns/D11/Q-D11-08.md) (supported)
- [D12/Q-D12-03#option-a](../patterns/D12/Q-D12-03--option-a.md) (supported)
- [D12/Q-D12-06#option-a](../patterns/D12/Q-D12-06--option-a.md) (supported)
- [D13/Q-D13-12#1](../patterns/D13/Q-D13-12--1.md) (supported)
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported)
- [D2/Q-D2-10](../patterns/D2/Q-D2-10.md) (supported)
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported)
- [D5/Q-D5-17](../patterns/D5/Q-D5-17.md) (supported)
- [D5/Q-D5-20](../patterns/D5/Q-D5-20.md) (supported)
- [D6/Q-D6-11#1](../patterns/D6/Q-D6-11--1.md) (supported)
- [D7/CQ-CL-05#1](../patterns/D7/CQ-CL-05--1.md) (supported)
- [D7/CQ-EC-04#1](../patterns/D7/CQ-EC-04--1.md) (supported)
- [D7/Q-D7-02#1](../patterns/D7/Q-D7-02--1.md) (supported)
- [D7/Q-D7-06#1](../patterns/D7/Q-D7-06--1.md) (supported)
- [D7/Q-D7-22#1](../patterns/D7/Q-D7-22--1.md) (supported)
- [D7/Q-D7-25#1](../patterns/D7/Q-D7-25--1.md) (supported)
- [D8/CQ-MF-01](../patterns/D8/CQ-MF-01.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:HAS_OBJECT` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#HAS_OBJECT`
- `release:rules/temporal-rules.yaml#HAS_OBJECT`
- `release:sdl/modules/kernel.graphql#L708-L803 (Assertion)`
