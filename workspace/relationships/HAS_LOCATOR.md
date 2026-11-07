---
id: "rel:HAS_LOCATOR"
kind: "relationship"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_LOCATOR","release:rules/temporal-rules.yaml#HAS_LOCATOR","release:sdl/modules/kernel.graphql#L631-L669 (SourceLocator)"]
aliases: ["has locator"]
capabilities: ["get","neighbors","slice","find","read-only","pattern"]
cardDigest: "sha256:2c24d74e00ad06580c0d3577b413d90dac12b19d8d21a80d5677bc8fad093a2c"
---
# Relationship HAS_LOCATOR



| | |
| --- | --- |
| id | `rel:HAS_LOCATOR` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [K](../modules/K.md) |
| stored direction | [SourceSnapshot](../nodes/SourceSnapshot.md) → [SourceLocator](../nodes/SourceLocator.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | each locator exactly_one snapshot; a snapshot many locators |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_LOCATOR_writer` |
| write with | planner-emitted (kernel plumbing) — emitted by the planner as part of other proposals |

## Stored direction and GraphQL fields

- Stored: `(:SourceSnapshot)-[:HAS_LOCATOR]->(:SourceLocator)`.
- Fields in the stored direction (OUT): (none)
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `SourceLocator.snapshot (IN)`

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_LOCATOR --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [SourceSnapshot](../nodes/SourceSnapshot.md) | [SourceLocator](../nodes/SourceLocator.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-K-01`, `Q-K-10`, `Q-K-14`, `Q-K-20`, `Q-K-28`
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
- [Stage something you found but cannot resolve or place](../tasks/stage-unresolved-mention.md)

## v1 navigation aliases

- `rel:HAS_LOCATOR` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#HAS_LOCATOR`
- `release:rules/temporal-rules.yaml#HAS_LOCATOR`
- `release:sdl/modules/kernel.graphql#L631-L669 (SourceLocator)`
