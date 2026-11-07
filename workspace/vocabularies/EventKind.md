---
id: "enum:EventKind"
kind: "enum"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D13.graphql#L44-L72"]
aliases: ["event kind"]
capabilities: ["get"]
cardDigest: "sha256:891b92013676b4d33d1db137ec16a08ce99767bd98f28c8d3ce15933652e1a23"
---
# Enum EventKind

Kind of event (vocab-frontiers.yaml section 5). One enum replaces the pinned EventCategory + eventType pair; the family is a lookup, not a stored field.

Id `enum:EventKind` · module [D13](../modules/D13.md) · 26 values · used by 1 fields · raw SDL [sdl:EventKind](../sdl/EventKind.graphql)

## Values (26)

| value | description |
| --- | --- |
| `TRIAL_START` |  |
| `READOUT` |  |
| `DATA_PRESENTATION` |  |
| `RETRACTION` | A curated frontier milestone only (R-44): EVENT_ABOUT → D3 Publication; its clock cites the retraction notice's locator and no second date Assertion is written; the revision itself is D3 REVISES (or… |
| `REGULATORY_SUBMISSION` |  |
| `REGULATORY_ACCEPTANCE` |  |
| `REGULATORY_DESIGNATION` |  |
| `ADVISORY_COMMITTEE` |  |
| `APPROVAL` |  |
| `REJECTION` |  |
| `CLINICAL_HOLD` |  |
| `CLINICAL_HOLD_LIFTED` |  |
| `REGULATORY_STATUS_CHANGE` |  |
| `ENFORCEMENT_ACTION` |  |
| `POLICY_CHANGE` |  |
| `LAUNCH` |  |
| `RECALL` |  |
| `MARKET_WITHDRAWAL` |  |
| `SAFETY_SIGNAL` |  |
| `PROGRAM_DISCONTINUATION` |  |
| `FINANCING` |  |
| `ACQUISITION` |  |
| `PARTNERSHIP` |  |
| `AWARD` |  |
| `LEGAL_ACTION` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Event](../nodes/Event.md).`eventKind`
