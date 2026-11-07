---
id: "rel:DERIVED_FROM"
kind: "relationship"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#DERIVED_FROM","release:rules/temporal-rules.yaml#DERIVED_FROM","release:sdl/modules/kernel.graphql#L708-L803 (Assertion)","release:sdl/modules/kernel.graphql#L953-L1030 (Assessment)","release:sdl/modules/D10.graphql#L271-L314 (Association)","release:sdl/modules/kernel.graphql#L1048-L1124 (Report)","release:sdl/modules/D10.graphql#L187-L247 (ReportItem)"]
aliases: ["derived from","rel:CITES_ASSERTION","rel:CITES_ASSESSMENT","rel:CONSIDERS_ASSESSMENT","rel:DERIVED_FROM_ASSERTION","rel:INCLUDES_RESULT","rel:TRIGGERED_BY","CITES_ASSERTION","CITES_ASSESSMENT","CONSIDERS_ASSESSMENT","DERIVED_FROM_ASSERTION","INCLUDES_RESULT","TRIGGERED_BY"]
capabilities: ["get","neighbors","slice","find","read-only","pattern"]
cardDigest: "sha256:957b68f136ef4da803881d032426f25f949c181415c1e4f90ef9dc961453846b"
---
# Relationship DERIVED_FROM



| | |
| --- | --- |
| id | `rel:DERIVED_FROM` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [K](../modules/K.md) |
| stored direction | [Assertion](../nodes/Assertion.md) \| [Assessment](../nodes/Assessment.md) \| [Report](../nodes/Report.md) \| [ReportItem](../nodes/ReportItem.md) \| [Association](../nodes/Association.md) → [Assertion](../nodes/Assertion.md) \| [Assessment](../nodes/Assessment.md) (always from → to) |
| edge properties | (none) |
| cardinality | many | many per item; Association → many inputs (bounded by inputCount; > 5,000 inputs keep only inputSetDigest) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | (none) |
| write with | planner-emitted (kernel plumbing) — emitted by the planner as part of other proposals |

## Stored direction and GraphQL fields

- Stored: `(:Assertion)-[:DERIVED_FROM]->(:Assertion)` (other declared endpoints below).
- Fields in the stored direction (OUT): `Assertion.derivedFrom (OUT)`, `Assessment.inputAssertions (OUT)`, `Assessment.inputAssessments (OUT)`, `Association.inputs (OUT)`, `Report.citesAssertions (OUT)`, `Report.citesAssessments (OUT)`, `ReportItem.citesAssertions (OUT)`, `ReportItem.citesAssessments (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (8 declared, 8 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:DERIVED_FROM --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Assertion](../nodes/Assertion.md) | [Assertion](../nodes/Assertion.md) | 1 |
| [Assessment](../nodes/Assessment.md) | [Assertion](../nodes/Assertion.md) | 1 |
| [Assessment](../nodes/Assessment.md) | [Assessment](../nodes/Assessment.md) | 1 |
| [Association](../nodes/Association.md) | [Assertion](../nodes/Assertion.md) | 1 |
| [Report](../nodes/Report.md) | [Assertion](../nodes/Assertion.md) | 1 |
| [Report](../nodes/Report.md) | [Assessment](../nodes/Assessment.md) | 1 |
| [ReportItem](../nodes/ReportItem.md) | [Assertion](../nodes/Assertion.md) | 1 |
| [ReportItem](../nodes/ReportItem.md) | [Assessment](../nodes/Assessment.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-AX-01`, `CQ-AX-08`, `CQ-AX-11`, `CQ-RC-02`, `Q-D10-05`, `Q-D10-13`, `Q-D10-16`, `Q-K-06`, `Q-K-17`, `Q-K-18`, `Q-K-20`, `Q-K-21`, `Q-K-25`, `Q-K-30`
- [D1/CQ-PF-01](../patterns/D1/CQ-PF-01.md) (supported)
- [D10/Q-D10-03](../patterns/D10/Q-D10-03.md) (supported)
- [D10/Q-D10-08](../patterns/D10/Q-D10-08.md) (supported)
- [D11/Q-D11-05](../patterns/D11/Q-D11-05.md) (supported)
- [D12/Q-D12-18](../patterns/D12/Q-D12-18.md) (supported)
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported)
- [D13/Q-D13-22#1](../patterns/D13/Q-D13-22--1.md) (supported)
- [D2/Q-D2-18](../patterns/D2/Q-D2-18.md) (supported)
- [D3/CQ-EV-05#2](../patterns/D3/CQ-EV-05--2.md) (supported)
- [D6/CQ-PF-01#1](../patterns/D6/CQ-PF-01--1.md) (supported)
- [D7/CQ-CL-05#1](../patterns/D7/CQ-CL-05--1.md) (supported)
- [D7/Q-D7-06#1](../patterns/D7/Q-D7-06--1.md) (supported)
- [D8/Q-D8-19](../patterns/D8/Q-D8-19.md) (supported)
- [D9/CQ-CL-04](../patterns/D9/CQ-CL-04.md) (supported)
- [D9/CQ-CL-05](../patterns/D9/CQ-CL-05.md) (supported)
- [D9/CQ-CL-06](../patterns/D9/CQ-CL-06.md) (supported)
- [D9/CQ-PV-04](../patterns/D9/CQ-PV-04.md) (supported)
- [D9/CQ-PV-05](../patterns/D9/CQ-PV-05.md) (supported)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported)
- [D9/Q-D9-04](../patterns/D9/Q-D9-04.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest claims made in a podcast or video episode](../tasks/ingest-podcast-claims.md)
- [Correct or end a fact that is no longer true](../tasks/correct-a-stale-fact.md)
- [Take a claim through vetting, an evidence mission and a published evidence report](../tasks/claim-to-evidence-report.md)
- [Record a financial interest or conflict and its disclosure](../tasks/interest-conflict-disclosure.md)

## v1 navigation aliases

- `rel:CITES_ASSERTION` (merged): R-11: DERIVED_FROM replaces CITES_ASSERTION
- `rel:CITES_ASSESSMENT` (merged): R-11: DERIVED_FROM replaces CITES_ASSESSMENT
- `rel:CONSIDERS_ASSESSMENT` (merged): R-11: DERIVED_FROM replaces CONSIDERS_ASSESSMENT
- `rel:DERIVED_FROM_ASSERTION` (merged): R-11: DERIVED_FROM replaces DERIVED_FROM_ASSERTION
- `rel:INCLUDES_RESULT` (merged): D3: kernel DERIVED_FROM to the StudyResults' STATED_IN Assertions; pinned inputRole lost (11-open-questions, kernel)
- `rel:TRIGGERED_BY` (merged): D3: kernel DERIVED_FROM + Assessment.evidenceCutoffAt + supersedesUid

## Source definition

- `release:registers/relationship-register.yaml#DERIVED_FROM`
- `release:rules/temporal-rules.yaml#DERIVED_FROM`
- `release:sdl/modules/kernel.graphql#L708-L803 (Assertion)`
- `release:sdl/modules/kernel.graphql#L953-L1030 (Assessment)`
- `release:sdl/modules/D10.graphql#L271-L314 (Association)`
- `release:sdl/modules/kernel.graphql#L1048-L1124 (Report)`
- `release:sdl/modules/D10.graphql#L187-L247 (ReportItem)`
