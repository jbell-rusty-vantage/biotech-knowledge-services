---
id: "rel:OCCURRENCE_OF"
kind: "relationship"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#OCCURRENCE_OF","release:rules/temporal-rules.yaml#OCCURRENCE_OF","release:sdl/modules/kernel.graphql#L708-L803 (Assertion)","release:sdl/modules/kernel.graphql#L885-L933 (Claim)"]
aliases: ["occurrence of","rel:INSTANCE_OF","INSTANCE_OF"]
capabilities: ["get","neighbors","slice","find","read-only","pattern"]
cardDigest: "sha256:3f6ece0eed31689a3aafb9af2ad2f94b4a26d4687e3a35f2d61161eef11aa10f"
---
# Relationship OCCURRENCE_OF



| | |
| --- | --- |
| id | `rel:OCCURRENCE_OF` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [K](../modules/K.md) |
| stored direction | [Assertion](../nodes/Assertion.md) → [Claim](../nodes/Claim.md) (always from → to) |
| edge properties | (none) |
| cardinality | zero_or_one per Assertion (assertionKind CLAIM only); a Claim many occurrences |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | (none) |
| write with | planner-emitted (kernel plumbing) — emitted by the planner as part of other proposals |

## Stored direction and GraphQL fields

- Stored: `(:Assertion)-[:OCCURRENCE_OF]->(:Claim)`.
- Fields in the stored direction (OUT): `Assertion.occurrenceOf (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `Claim.occurrences (IN)`

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:OCCURRENCE_OF --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Assertion](../nodes/Assertion.md) | [Claim](../nodes/Claim.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-K-09`, `Q-K-11`, `Q-K-19`, `Q-K-21`, `Q-K-23`, `Q-K-26`
- [D10/Q-D10-03](../patterns/D10/Q-D10-03.md) (supported)
- [D11/Q-D11-19](../patterns/D11/Q-D11-19.md) (supported)
- [D9/CQ-CL-06](../patterns/D9/CQ-CL-06.md) (supported)
- [D9/Q-D9-08](../patterns/D9/Q-D9-08.md) (supported)
- [D9/Q-D9-22](../patterns/D9/Q-D9-22.md) (supported)
- [K/Q-K-09](../patterns/K/Q-K-09.md) (supported)
- [K/Q-K-11](../patterns/K/Q-K-11.md) (supported)
- [K/Q-K-21](../patterns/K/Q-K-21.md) (supported)
- [K/Q-K-23](../patterns/K/Q-K-23.md) (supported)
- [QP/G-5#1](../patterns/QP/G-5--1.md) (unsupported)
- [QP/P-11b](../patterns/QP/P-11b.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest claims made in a podcast or video episode](../tasks/ingest-podcast-claims.md)
- [Take a claim through vetting, an evidence mission and a published evidence report](../tasks/claim-to-evidence-report.md)

## v1 navigation aliases

- `rel:INSTANCE_OF` (renamed): K: OCCURRENCE_OF (structural); re-clustering is an EQUIVALENCE Assessment

## Source definition

- `release:registers/relationship-register.yaml#OCCURRENCE_OF`
- `release:rules/temporal-rules.yaml#OCCURRENCE_OF`
- `release:sdl/modules/kernel.graphql#L708-L803 (Assertion)`
- `release:sdl/modules/kernel.graphql#L885-L933 (Claim)`
