---
id: "rel:APPEARS_IN"
kind: "relationship"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#APPEARS_IN","release:rules/temporal-rules.yaml#APPEARS_IN","release:sdl/modules/D9.graphql#L233-L283 (MediaWork)"]
aliases: ["appears in","rel:ATTRIBUTES_TO","rel:SPEAKS_AT","ATTRIBUTES_TO","SPEAKS_AT"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:c2a46bb994be74084682f96f02736ffee813b2c445950ab11a729fd75353fc97"
---
# Relationship APPEARS_IN



| | |
| --- | --- |
| id | `rel:APPEARS_IN` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D9](../modules/D9.md) |
| stored direction | [Person](../nodes/Person.md) → [MediaWork](../nodes/MediaWork.md) (always from → to) |
| edge properties | [AppearanceEdgeProperties](../edge-properties/AppearanceEdgeProperties.md) |
| cardinality | many per work; role on the edge (two roles = two episodes) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_APPEARS_IN_assertion`, `rel_APPEARS_IN_uid`, `rel_APPEARS_IN_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Person)-[:APPEARS_IN]->(:MediaWork)`.
- Fields in the stored direction (OUT): (none)
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `MediaWork.appearances (IN)`

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:APPEARS_IN --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Person](../nodes/Person.md) | [MediaWork](../nodes/MediaWork.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [APPEARS_IN](../predicates/APPEARS_IN.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-CL-08`, `Q-D9-16`, `Q-D9-18`
- [D9/CQ-CL-08](../patterns/D9/CQ-CL-08.md) (supported)
- [D9/Q-D9-18](../patterns/D9/Q-D9-18.md) (supported)
- [K/Q-K-15](../patterns/K/Q-K-15.md) (supported)
- [K/Q-K-23](../patterns/K/Q-K-23.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest claims made in a podcast or video episode](../tasks/ingest-podcast-claims.md)

## v1 navigation aliases

- `rel:APPEARS_IN` is unchanged from v1.
- `rel:ATTRIBUTES_TO` (merged): D9: APPEARS_IN: Replaces pinned APPEARS_IN, SPEAKS_AT (talks are works), ATTRIBUTES_TO
- `rel:SPEAKS_AT` (merged): D9: APPEARS_IN: Replaces pinned APPEARS_IN, SPEAKS_AT (talks are works), ATTRIBUTES_TO

## Source definition

- `release:registers/relationship-register.yaml#APPEARS_IN`
- `release:rules/temporal-rules.yaml#APPEARS_IN`
- `release:sdl/modules/D9.graphql#L233-L283 (MediaWork)`
