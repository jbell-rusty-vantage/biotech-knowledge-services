---
id: "rel:HAS_SNAPSHOT"
kind: "relationship"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_SNAPSHOT","release:rules/temporal-rules.yaml#HAS_SNAPSHOT","release:sdl/modules/kernel.graphql#L546-L570 (Source)","release:sdl/modules/kernel.graphql#L580-L622 (SourceSnapshot)"]
aliases: ["has snapshot","rel:PRIOR_SNAPSHOT","rel:RESULTING_SNAPSHOT","rel:REVISES_SOURCE","PRIOR_SNAPSHOT","RESULTING_SNAPSHOT","REVISES_SOURCE"]
capabilities: ["get","neighbors","slice","find","read-only","pattern"]
cardDigest: "sha256:2e89abc21bffb471b1c59c3d0e27d7b090a49412d88c5bdc7de5f28bacb8e4e8"
---
# Relationship HAS_SNAPSHOT



| | |
| --- | --- |
| id | `rel:HAS_SNAPSHOT` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [K](../modules/K.md) |
| stored direction | [Source](../nodes/Source.md) → [SourceSnapshot](../nodes/SourceSnapshot.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | one Source to one_or_more snapshots; each snapshot exactly_one Source |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_SNAPSHOT_writer` |
| write with | planner-emitted (kernel plumbing) — emitted by the planner as part of other proposals |

## Stored direction and GraphQL fields

- Stored: `(:Source)-[:HAS_SNAPSHOT]->(:SourceSnapshot)`.
- Fields in the stored direction (OUT): `Source.snapshots (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `SourceSnapshot.source (IN)`

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_SNAPSHOT --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Source](../nodes/Source.md) | [SourceSnapshot](../nodes/SourceSnapshot.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-TM-03`, `Q-K-02`, `Q-K-10`, `Q-K-17`, `Q-K-22`, `Q-K-26`
- [D1/CQ-ID-03](../patterns/D1/CQ-ID-03.md) (supported)
- [D1/CQ-ID-04](../patterns/D1/CQ-ID-04.md) (supported)
- [D1/CQ-PF-01](../patterns/D1/CQ-PF-01.md) (supported)
- [D1/Q-D1-16](../patterns/D1/Q-D1-16.md) (supported)
- [D10/Q-D10-03](../patterns/D10/Q-D10-03.md) (supported)
- [D10/Q-D10-08](../patterns/D10/Q-D10-08.md) (supported)
- [D10/Q-D10-21](../patterns/D10/Q-D10-21.md) (supported)
- [D11/CQ-PV-05](../patterns/D11/CQ-PV-05.md) (supported)
- [D11/Q-D11-05](../patterns/D11/Q-D11-05.md) (supported)
- [D11/Q-D11-08](../patterns/D11/Q-D11-08.md) (supported)
- [D11/Q-D11-19](../patterns/D11/Q-D11-19.md) (supported)
- [D12/Q-D12-18](../patterns/D12/Q-D12-18.md) (supported)
- [D13/Q-D13-04#1](../patterns/D13/Q-D13-04--1.md) (supported)
- [D13/Q-D13-12#1](../patterns/D13/Q-D13-12--1.md) (supported)
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported)
- [D13/Q-D13-22#1](../patterns/D13/Q-D13-22--1.md) (supported)
- [D2/Q-D2-10](../patterns/D2/Q-D2-10.md) (supported)
- [D2/Q-D2-18](../patterns/D2/Q-D2-18.md) (supported)
- [D3/CQ-EV-05#1](../patterns/D3/CQ-EV-05--1.md) (supported)
- [D3/CQ-EV-05#2](../patterns/D3/CQ-EV-05--2.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Trace an assertion to its source span and adjudication](../tasks/trace-answer-to-source.md)

## v1 navigation aliases

- `rel:HAS_SNAPSHOT` is unchanged from v1.
- `rel:PRIOR_SNAPSHOT` (merged): K: HAS_SNAPSHOT: Replaces PRIOR_SNAPSHOT / RESULTING_SNAPSHOT / REVISES_SOURCE (revisionKind + revisesSnapshotUid on the later snapshot
- `rel:RESULTING_SNAPSHOT` (merged): K: HAS_SNAPSHOT: Replaces PRIOR_SNAPSHOT / RESULTING_SNAPSHOT / REVISES_SOURCE (revisionKind + revisesSnapshotUid on the later snapshot
- `rel:REVISES_SOURCE` (merged): K: HAS_SNAPSHOT: Replaces PRIOR_SNAPSHOT / RESULTING_SNAPSHOT / REVISES_SOURCE (revisionKind + revisesSnapshotUid on the later snapshot

## Source definition

- `release:registers/relationship-register.yaml#HAS_SNAPSHOT`
- `release:rules/temporal-rules.yaml#HAS_SNAPSHOT`
- `release:sdl/modules/kernel.graphql#L546-L570 (Source)`
- `release:sdl/modules/kernel.graphql#L580-L622 (SourceSnapshot)`
