---
id: "rel:ASSESSES"
kind: "relationship"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#ASSESSES","release:rules/temporal-rules.yaml#ASSESSES","release:sdl/modules/kernel.graphql#L1145-L1215 (Activity)","release:sdl/modules/kernel.graphql#L815-L865 (Adjudication)","release:sdl/modules/kernel.graphql#L708-L803 (Assertion)","release:sdl/modules/kernel.graphql#L953-L1030 (Assessment)","release:sdl/modules/kernel.graphql#L885-L933 (Claim)","release:sdl/modules/kernel.graphql#L1048-L1124 (Report)","release:sdl/modules/D10.graphql#L187-L247 (ReportItem)"]
aliases: ["assesses","rel:ABOUT","rel:ASSESSES_EVENT","rel:ASSESSES_SOURCE_AUTHORITY","rel:COMPARES_IDENTITIES","rel:EVALUATES","rel:PROPOSES_MATCH","ABOUT","ASSESSES_EVENT","ASSESSES_SOURCE_AUTHORITY","COMPARES_IDENTITIES","EVALUATES","PROPOSES_MATCH"]
capabilities: ["get","neighbors","slice","find","read-only","pattern"]
cardDigest: "sha256:1a4a4fbec9e760e776b39838d965aa518eb5f4437046cd688654f1d3187a9caf"
---
# Relationship ASSESSES



| | |
| --- | --- |
| id | `rel:ASSESSES` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [K](../modules/K.md) |
| stored direction | [Adjudication](../nodes/Adjudication.md) \| [Assessment](../nodes/Assessment.md) \| [Report](../nodes/Report.md) \| [Activity](../nodes/Activity.md) \| [ReportItem](../nodes/ReportItem.md) → [Assertion](../nodes/Assertion.md) \| [Subjectable](../interfaces/Subjectable.md) (always from → to) |
| edge properties | (none) |
| cardinality | Adjudication one_or_more Assertions; Assessment and Report one_or_more; Activity zero_or_more (EVIDENCE_MISSION exactly one Claim) | ROW → exactly_one (its option); SECTION → one_or_more (what the section is about, including target or population context) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | to [Subjectable](../interfaces/Subjectable.md) (57 members, kernel-traversal) |
| registered | yes (relationship register) |
| required indexes | (none) |
| write with | planner-emitted (kernel plumbing) — emitted by the planner as part of other proposals |

## Stored direction and GraphQL fields

- Stored: `(:Adjudication)-[:ASSESSES]->(:Assertion)` (other declared endpoints below).
- Fields in the stored direction (OUT): `Activity.about (OUT)`, `Adjudication.evaluates (OUT)`, `Assessment.about (OUT)`, `Report.about (OUT)`, `ReportItem.about (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `Assertion.adjudications (IN)`, `Claim.assessments (IN)`, `Claim.reports (IN)`

## Endpoints (5 declared, 225 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:ASSESSES --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Activity](../nodes/Activity.md) | [Subjectable](../interfaces/Subjectable.md) | 56 |
| [Adjudication](../nodes/Adjudication.md) | [Assertion](../nodes/Assertion.md) | 1 |
| [Assessment](../nodes/Assessment.md) | [Subjectable](../interfaces/Subjectable.md) | 56 |
| [Report](../nodes/Report.md) | [Subjectable](../interfaces/Subjectable.md) | 56 |
| [ReportItem](../nodes/ReportItem.md) | [Subjectable](../interfaces/Subjectable.md) | 56 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-AX-04`, `CQ-RC-01`, `CQ-RC-06`, `Q-D10-02`, `Q-D10-16`, `Q-K-05`, `Q-K-08`, `Q-K-09`, `Q-K-11`, `Q-K-13`, `Q-K-16`, `Q-K-19`, `Q-K-23`, `Q-K-25`, `Q-K-26`
- [D1/CQ-ID-03](../patterns/D1/CQ-ID-03.md) (supported)
- [D1/CQ-ID-04](../patterns/D1/CQ-ID-04.md) (supported)
- [D1/CQ-PF-01](../patterns/D1/CQ-PF-01.md) (supported)
- [D1/Q-D1-16](../patterns/D1/Q-D1-16.md) (supported)
- [D10/Q-D10-03](../patterns/D10/Q-D10-03.md) (supported)
- [D10/Q-D10-08](../patterns/D10/Q-D10-08.md) (supported)
- [D10/Q-D10-21](../patterns/D10/Q-D10-21.md) (supported)
- [D11/Q-D11-08](../patterns/D11/Q-D11-08.md) (supported)
- [D12/Q-D12-18](../patterns/D12/Q-D12-18.md) (supported)
- [D13/Q-D13-04#1](../patterns/D13/Q-D13-04--1.md) (supported)
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported)
- [D2/Q-D2-10](../patterns/D2/Q-D2-10.md) (supported)
- [D2/Q-D2-18](../patterns/D2/Q-D2-18.md) (supported)
- [D3/CQ-EV-05#1](../patterns/D3/CQ-EV-05--1.md) (supported)
- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported)
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported)
- [D5/Q-D5-17](../patterns/D5/Q-D5-17.md) (supported)
- [D5/Q-D5-20](../patterns/D5/Q-D5-20.md) (supported)
- [D6/CQ-PF-01#2](../patterns/D6/CQ-PF-01--2.md) (supported)
- [D7/Q-D7-08#1](../patterns/D7/Q-D7-08--1.md) (supported)

## Forbidden implications

(none)

## Tasks

- [What do we already know about X? (run before every research mission)](../tasks/what-do-we-know-about-entity.md)
- [Should I update an existing node or create a new one?](../tasks/decide-update-or-create.md)
- [Trace an assertion to its source span and adjudication](../tasks/trace-answer-to-source.md)
- [Stage something you found but cannot resolve or place](../tasks/stage-unresolved-mention.md)
- [Take a claim through vetting, an evidence mission and a published evidence report](../tasks/claim-to-evidence-report.md)
- [Record a financial interest or conflict and its disclosure](../tasks/interest-conflict-disclosure.md)

## v1 navigation aliases

- `rel:ABOUT` (merged): K: ASSESSES: Replaces EVALUATES, ABOUT, ASSESSES_SOURCE_AUTHORITY, PROPOSES_MATCH, COMPARES_IDENTITIES
- `rel:ASSESSES_EVENT` (merged): D13: kernel ASSESSES (Assessment.about → Subjectable)
- `rel:ASSESSES_SOURCE_AUTHORITY` (merged): K: ASSESSES: Replaces EVALUATES, ABOUT, ASSESSES_SOURCE_AUTHORITY, PROPOSES_MATCH, COMPARES_IDENTITIES
- `rel:COMPARES_IDENTITIES` (merged): K: ASSESSES: Replaces EVALUATES, ABOUT, ASSESSES_SOURCE_AUTHORITY, PROPOSES_MATCH, COMPARES_IDENTITIES
- `rel:EVALUATES` (merged): K: ASSESSES: Replaces EVALUATES, ABOUT, ASSESSES_SOURCE_AUTHORITY, PROPOSES_MATCH, COMPARES_IDENTITIES
- `rel:PROPOSES_MATCH` (merged): K: ASSESSES: Replaces EVALUATES, ABOUT, ASSESSES_SOURCE_AUTHORITY, PROPOSES_MATCH, COMPARES_IDENTITIES

## Source definition

- `release:registers/relationship-register.yaml#ASSESSES`
- `release:rules/temporal-rules.yaml#ASSESSES`
- `release:sdl/modules/kernel.graphql#L1145-L1215 (Activity)`
- `release:sdl/modules/kernel.graphql#L815-L865 (Adjudication)`
- `release:sdl/modules/kernel.graphql#L708-L803 (Assertion)`
- `release:sdl/modules/kernel.graphql#L953-L1030 (Assessment)`
- `release:sdl/modules/kernel.graphql#L885-L933 (Claim)`
- `release:sdl/modules/kernel.graphql#L1048-L1124 (Report)`
- `release:sdl/modules/D10.graphql#L187-L247 (ReportItem)`
