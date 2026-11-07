---
id: "rel:ASSIGNED_TO"
kind: "relationship"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#ASSIGNED_TO","release:rules/temporal-rules.yaml#ASSIGNED_TO","release:sdl/modules/D8.graphql#L645-L689 (Patent)"]
aliases: ["assigned to","rel:ASSIGNED_PATENT","ASSIGNED_PATENT"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:fbc0f6ca0720cf7914be9e80d4dfe3f0fb6f7339a581ad659f355c5af862fa8e"
---
# Relationship ASSIGNED_TO



| | |
| --- | --- |
| id | `rel:ASSIGNED_TO` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D8](../modules/D8.md) |
| stored direction | [Patent](../nodes/Patent.md) → [Organization](../nodes/Organization.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | one_or_more; many episodes |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_ASSIGNED_TO_assertion`, `rel_ASSIGNED_TO_uid`, `rel_ASSIGNED_TO_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Patent)-[:ASSIGNED_TO]->(:Organization)`.
- Fields in the stored direction (OUT): `Patent.assignees (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:ASSIGNED_TO --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Patent](../nodes/Patent.md) | [Organization](../nodes/Organization.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [ASSIGNED_TO](../predicates/ASSIGNED_TO.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-EC-01`, `Q-D8-10`, `Q-D8-11`
- [D8/Q-D8-10](../patterns/D8/Q-D8-10.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:ASSIGNED_PATENT` (renamed): D8: ASSIGNED_TO: Replaces ASSIGNED_PATENT

## Source definition

- `release:registers/relationship-register.yaml#ASSIGNED_TO`
- `release:rules/temporal-rules.yaml#ASSIGNED_TO`
- `release:sdl/modules/D8.graphql#L645-L689 (Patent)`
