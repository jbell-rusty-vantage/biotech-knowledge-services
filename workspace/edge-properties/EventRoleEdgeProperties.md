---
id: "edge:EventRoleEdgeProperties"
kind: "edge-properties"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D13.graphql#L170-L177"]
aliases: ["event role edge properties"]
capabilities: ["get"]
cardDigest: "sha256:cf9a10b73ba4d3c8ac214df4ce8f5893c1727819774b2c7fd71852055224b294"
---
# Edge properties EventRoleEdgeProperties

Asserted recorded-time episode for INVOLVES (Event → Organization | Person). Domain-local superset of the kernel base type AssertedRecordedProperties (kernel rule M11): its five fields verbatim and in order (same names, types, nullability; executor-set from the one authorizing Assertion, predicate INVOLVES), then the qualifiers investor questions filter on: the event role only (Q-D13-03 sponsors and applicants, Q-D13-06 investors, lenders and issuers, Q-D13-14 regulators and sponsors, Q-D13-33 sponsors). No valid-time fields: an involvement has no validity of its own beyond the event's clocks (09-reasoning.md, bitemporal table); any time the source states stays on the authorizing Assertion. Class asserted (the base type's class). `role` is copied from the authorizing Assertion's qualifier `role=<EventRole>`; what the source printed ("lead investor", "sole book-running manager") stays on that Assertion as the qualifier `roleText:<label>` (kernel rule M11(3): a field that only reproduces the source's wording is not an edge field).

| | |
| --- | --- |
| id | `edge:EventRoleEdgeProperties` · raw SDL [sdl:EventRoleEdgeProperties](../sdl/EventRoleEdgeProperties.graphql) |
| module | [D13](../modules/D13.md) |
| used by relationship types | [INVOLVES](../relationships/INVOLVES.md) |
| set by the executor | `relationshipUid`, `assertionUid`, `recordedFrom`, `lastWriterRunId` |

## Properties (6)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `relationshipUid` | `String!` | yes | create+update |  | D13.graphql:L171 |
| `assertionUid` | `String!` | yes | create+update |  | D13.graphql:L172 |
| `recordedFrom` | `DateTime!` | yes | create+update |  | D13.graphql:L173 |
| `recordedTo` | `DateTime` |  | create+update |  | D13.graphql:L174 |
| `lastWriterRunId` | `String` |  | create+update |  | D13.graphql:L175 |
| `role` | [EventRole](../vocabularies/EventRole.md) | yes | create+update |  | D13.graphql:L176 |

## Declared on (2 fields)

- [Event](../nodes/Event.md).`involvedOrganizations` ([INVOLVES](../relationships/INVOLVES.md))
- [Event](../nodes/Event.md).`involvedPeople` ([INVOLVES](../relationships/INVOLVES.md))

## Source definition

- `release:sdl/modules/D13.graphql#L170-L177`
