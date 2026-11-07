---
id: "rel:CONTENT_SPONSORED_BY"
kind: "relationship"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#CONTENT_SPONSORED_BY","release:rules/temporal-rules.yaml#CONTENT_SPONSORED_BY","release:sdl/modules/D9.graphql#L233-L283 (MediaWork)"]
aliases: ["content sponsored by","rel:SPONSORS_CONTENT","SPONSORS_CONTENT"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:75f31db9e6b2a3a79eb634842aefdba57c4bc80ea6e48402dd233ce23fbf54b8"
---
# Relationship CONTENT_SPONSORED_BY



| | |
| --- | --- |
| id | `rel:CONTENT_SPONSORED_BY` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D9](../modules/D9.md) |
| stored direction | [MediaWork](../nodes/MediaWork.md) → [ContentSponsor](../unions/ContentSponsor.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | many per work; one episode per (sponsor, observed rendition window) |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_CONTENT_SPONSORED_BY_assertion`, `rel_CONTENT_SPONSORED_BY_uid`, `rel_CONTENT_SPONSORED_BY_writer`, `sponsored_by_valid` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:MediaWork)-[:CONTENT_SPONSORED_BY]->(:ContentSponsor)`.
- Fields in the stored direction (OUT): `MediaWork.sponsors (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 2 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:CONTENT_SPONSORED_BY --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [MediaWork](../nodes/MediaWork.md) | [ContentSponsor](../unions/ContentSponsor.md) | 2 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [CONTENT_SPONSORED_BY](../predicates/CONTENT_SPONSORED_BY.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-CL-05`, `CQ-CL-08`, `Q-D9-06`
- [D9/CQ-CL-05](../patterns/D9/CQ-CL-05.md) (supported)
- [D9/CQ-CL-08](../patterns/D9/CQ-CL-08.md) (supported)

## Forbidden implications

- `CONTENT_SPONSORED_BY` does NOT imply `RECOMMENDS_USE`

## Tasks

- [Record a financial interest or conflict and its disclosure](../tasks/interest-conflict-disclosure.md)

## v1 navigation aliases

- `rel:SPONSORS_CONTENT` (renamed): D9: CONTENT_SPONSORED_BY: Replaces pinned SPONSORS_CONTENT (SponsorableTarget union)

## Source definition

- `release:registers/relationship-register.yaml#CONTENT_SPONSORED_BY`
- `release:rules/temporal-rules.yaml#CONTENT_SPONSORED_BY`
- `release:sdl/modules/D9.graphql#L233-L283 (MediaWork)`
