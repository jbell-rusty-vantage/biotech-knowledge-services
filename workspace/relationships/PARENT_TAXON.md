---
id: "rel:PARENT_TAXON"
kind: "relationship"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#PARENT_TAXON","release:rules/temporal-rules.yaml#PARENT_TAXON","release:sdl/modules/D1.graphql#L396-L417 (Taxon)"]
aliases: ["parent taxon","rel:STRAIN_OF","STRAIN_OF"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert"]
cardDigest: "sha256:e0770fd2db6b4bfdec85efa521357aae7fc193470bb9581042c5132d7e0fbf8d"
---
# Relationship PARENT_TAXON



| | |
| --- | --- |
| id | `rel:PARENT_TAXON` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D1](../modules/D1.md) |
| stored direction | [Taxon](../nodes/Taxon.md) → [Taxon](../nodes/Taxon.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | zero_or_one open episode |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_PARENT_TAXON_assertion`, `rel_PARENT_TAXON_uid`, `rel_PARENT_TAXON_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Taxon)-[:PARENT_TAXON]->(:Taxon)`.
- Fields in the stored direction (OUT): `Taxon.parents (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:PARENT_TAXON --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Taxon](../nodes/Taxon.md) | [Taxon](../nodes/Taxon.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [PARENT_TAXON](../predicates/PARENT_TAXON.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D1-11`, `Q-D1-14`, `Q-D1-15`
(none)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:STRAIN_OF` (renamed): D1: PARENT_TAXON: Replaces pinned STRAIN_OF and the implicit genus/species links

## Source definition

- `release:registers/relationship-register.yaml#PARENT_TAXON`
- `release:rules/temporal-rules.yaml#PARENT_TAXON`
- `release:sdl/modules/D1.graphql#L396-L417 (Taxon)`
