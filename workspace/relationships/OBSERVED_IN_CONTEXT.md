---
id: "rel:OBSERVED_IN_CONTEXT"
kind: "relationship"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#OBSERVED_IN_CONTEXT","release:rules/temporal-rules.yaml#OBSERVED_IN_CONTEXT","release:sdl/modules/D2.graphql#L343-L396 (MechanismEvidenceContext)"]
aliases: ["observed in context"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:26d304a66fb99284cd1639ed6a9101a7b807d72d8ef151c04bc89fbe3348f2f0"
---
# Relationship OBSERVED_IN_CONTEXT



| | |
| --- | --- |
| id | `rel:OBSERVED_IN_CONTEXT` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D2](../modules/D2.md) |
| stored direction | [Assertion](../nodes/Assertion.md) → [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | zero_or_one context per Assertion; one_or_more Assertions per context |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_OBSERVED_IN_CONTEXT_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:Assertion)-[:OBSERVED_IN_CONTEXT]->(:MechanismEvidenceContext)`.
- Fields in the stored direction (OUT): (none)
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `MechanismEvidenceContext.assertions (IN)`

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:OBSERVED_IN_CONTEXT --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Assertion](../nodes/Assertion.md) | [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-MX-01`, `CQ-MX-02`, `CQ-MX-03`, `Q-D2-04`, `Q-D2-09`, `Q-D2-13`, `Q-D2-20`, `Q-D2-26`
- [D2/Q-D2-18](../patterns/D2/Q-D2-18.md) (supported)
- [QP/P-12](../patterns/QP/P-12.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Record mechanism evidence (measured vs inferred) for a substance](../tasks/ingest-mechanism-evidence.md)

## v1 navigation aliases

- `rel:OBSERVED_IN_CONTEXT` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#OBSERVED_IN_CONTEXT`
- `release:rules/temporal-rules.yaml#OBSERVED_IN_CONTEXT`
- `release:sdl/modules/D2.graphql#L343-L396 (MechanismEvidenceContext)`
