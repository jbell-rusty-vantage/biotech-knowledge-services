---
id: "rel:LICENSED_TO"
kind: "relationship"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#LICENSED_TO","release:rules/temporal-rules.yaml#LICENSED_TO","release:sdl/modules/D8.graphql#L645-L689 (Patent)"]
aliases: ["licensed to","rel:GRANTS_PATENT_LICENSE","rel:LICENSES_PATENT","GRANTS_PATENT_LICENSE","LICENSES_PATENT"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert"]
cardDigest: "sha256:b7e9ece43d62cea202224f9e75698ecd635c6dd9b3bd4b00a63057236b96bdf7"
---
# Relationship LICENSED_TO



| | |
| --- | --- |
| id | `rel:LICENSED_TO` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D8](../modules/D8.md) |
| stored direction | [Patent](../nodes/Patent.md) → [Organization](../nodes/Organization.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | many; many episodes |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_LICENSED_TO_assertion`, `rel_LICENSED_TO_uid`, `rel_LICENSED_TO_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Patent)-[:LICENSED_TO]->(:Organization)`.
- Fields in the stored direction (OUT): `Patent.licensees (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:LICENSED_TO --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Patent](../nodes/Patent.md) | [Organization](../nodes/Organization.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [LICENSED_TO](../predicates/LICENSED_TO.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-EC-01`, `Q-D8-11`, `Q-D8-21`
(none)

## Forbidden implications

- `LICENSED_TO` does NOT imply `STATUS_OF`

## Tasks

(none)

## v1 navigation aliases

- `rel:GRANTS_PATENT_LICENSE` (merged): D8: LICENSED_TO: Replaces the PatentLicense node, LICENSES_PATENT and GRANTS_PATENT_LICENSE
- `rel:LICENSES_PATENT` (merged): D8: LICENSED_TO: Replaces the PatentLicense node, LICENSES_PATENT and GRANTS_PATENT_LICENSE

## Source definition

- `release:registers/relationship-register.yaml#LICENSED_TO`
- `release:rules/temporal-rules.yaml#LICENSED_TO`
- `release:sdl/modules/D8.graphql#L645-L689 (Patent)`
