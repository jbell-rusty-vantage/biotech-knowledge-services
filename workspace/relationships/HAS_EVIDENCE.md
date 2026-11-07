---
id: "rel:HAS_EVIDENCE"
kind: "relationship"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_EVIDENCE","release:rules/temporal-rules.yaml#HAS_EVIDENCE","release:sdl/modules/kernel.graphql#L815-L865 (Adjudication)","release:sdl/modules/kernel.graphql#L708-L803 (Assertion)","release:sdl/modules/kernel.graphql#L953-L1030 (Assessment)","release:sdl/modules/kernel.graphql#L1048-L1124 (Report)"]
aliases: ["has evidence","rel:CONTRADICTED_BY","rel:SUPPORTED_BY","rel:SUPPORTED_BY_CHUNK","rel:USES_THRESHOLD_SOURCE","CONTRADICTED_BY","SUPPORTED_BY","SUPPORTED_BY_CHUNK","USES_THRESHOLD_SOURCE"]
capabilities: ["get","neighbors","slice","find","read-only","pattern"]
cardDigest: "sha256:293428f9f13d9018e557654bae887a03b3439543f0e65631d54eacdc31788628"
---
# Relationship HAS_EVIDENCE



| | |
| --- | --- |
| id | `rel:HAS_EVIDENCE` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [K](../modules/K.md) |
| stored direction | [Assertion](../nodes/Assertion.md) \| [Adjudication](../nodes/Adjudication.md) \| [Assessment](../nodes/Assessment.md) \| [Report](../nodes/Report.md) → [SourceLocator](../nodes/SourceLocator.md) (always from → to) |
| edge properties | [EvidenceEdgeProperties](../edge-properties/EvidenceEdgeProperties.md) |
| cardinality | Assertion one_or_more (role SUPPORTS, origin DECLARED; never authority / independence / facet); Adjudication many (VERIFIER_FOUND, carries the verifier's authority / independence / facet); Assessment / Report many (a RESOLUTION Assessment cites the surface-form span with role CONTEXT) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_EVIDENCE_writer` |
| write with | planner-emitted (kernel plumbing) — emitted by the planner as part of other proposals |

## Stored direction and GraphQL fields

- Stored: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)` (other declared endpoints below).
- Fields in the stored direction (OUT): `Adjudication.evidence (OUT)`, `Assertion.evidence (OUT)`, `Assessment.evidence (OUT)`, `Report.evidence (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (4 declared, 4 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_EVIDENCE --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Adjudication](../nodes/Adjudication.md) | [SourceLocator](../nodes/SourceLocator.md) | 1 |
| [Assertion](../nodes/Assertion.md) | [SourceLocator](../nodes/SourceLocator.md) | 1 |
| [Assessment](../nodes/Assessment.md) | [SourceLocator](../nodes/SourceLocator.md) | 1 |
| [Report](../nodes/Report.md) | [SourceLocator](../nodes/SourceLocator.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-K-01`, `Q-K-09`, `Q-K-13`, `Q-K-14`, `Q-K-15`, `Q-K-16`, `Q-K-17`, `Q-K-20`, `Q-K-21`, `Q-K-30`
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

- [What do we already know about X? (run before every research mission)](../tasks/what-do-we-know-about-entity.md)
- [Should I update an existing node or create a new one?](../tasks/decide-update-or-create.md)
- [Ingest claims made in a podcast or video episode](../tasks/ingest-podcast-claims.md)
- [Trace an assertion to its source span and adjudication](../tasks/trace-answer-to-source.md)
- [Correct or end a fact that is no longer true](../tasks/correct-a-stale-fact.md)
- [Stage something you found but cannot resolve or place](../tasks/stage-unresolved-mention.md)
- [Take a claim through vetting, an evidence mission and a published evidence report](../tasks/claim-to-evidence-report.md)

## v1 navigation aliases

- `rel:CONTRADICTED_BY` (merged): K: HAS_EVIDENCE: Replaces SUPPORTED_BY, CONTRADICTED_BY, SUPPORTED_BY_CHUNK and locator → Mention MENTIONS (the surface-form span is now cited by the RESOLUTIO…
- `rel:SUPPORTED_BY` (merged): K: HAS_EVIDENCE: Replaces SUPPORTED_BY, CONTRADICTED_BY, SUPPORTED_BY_CHUNK and locator → Mention MENTIONS (the surface-form span is now cited by the RESOLUTIO…
- `rel:SUPPORTED_BY_CHUNK` (merged): K: HAS_EVIDENCE: Replaces SUPPORTED_BY, CONTRADICTED_BY, SUPPORTED_BY_CHUNK and locator → Mention MENTIONS (the surface-form span is now cited by the RESOLUTIO…
- `rel:USES_THRESHOLD_SOURCE` (merged): D3: kernel HAS_EVIDENCE (role CONTEXT) on the interpretation Assessment

## Source definition

- `release:registers/relationship-register.yaml#HAS_EVIDENCE`
- `release:rules/temporal-rules.yaml#HAS_EVIDENCE`
- `release:sdl/modules/kernel.graphql#L815-L865 (Adjudication)`
- `release:sdl/modules/kernel.graphql#L708-L803 (Assertion)`
- `release:sdl/modules/kernel.graphql#L953-L1030 (Assessment)`
- `release:sdl/modules/kernel.graphql#L1048-L1124 (Report)`
