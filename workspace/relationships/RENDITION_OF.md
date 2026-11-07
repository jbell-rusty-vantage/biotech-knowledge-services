---
id: "rel:RENDITION_OF"
kind: "relationship"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#RENDITION_OF","release:rules/temporal-rules.yaml#RENDITION_OF","release:sdl/modules/D9.graphql#L233-L283 (MediaWork)","release:sdl/modules/D3.graphql#L831-L868 (Publication)"]
aliases: ["rendition of","rel:HAS_MEDIA_VARIANT","rel:IN_RENDITION","HAS_MEDIA_VARIANT","IN_RENDITION"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:aadab1d371fa15636ab233430d90293f88c511d0dbad805882631a9a62c3570c"
---
# Relationship RENDITION_OF



| | |
| --- | --- |
| id | `rel:RENDITION_OF` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [K](../modules/K.md) |
| stored direction | [Source](../nodes/Source.md) → [Publication](../nodes/Publication.md) \| [MediaWork](../nodes/MediaWork.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | many (one kernel Source per rendition endpoint of the work; each Source a rendition of at most one work) | many renditions per work; zero_or_one work per Source |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_RENDITION_OF_assertion`, `rel_RENDITION_OF_uid`, `rel_RENDITION_OF_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Source)-[:RENDITION_OF]->(:Publication)` (other declared endpoints below).
- Fields in the stored direction (OUT): (none)
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `MediaWork.renditions (IN)`, `Publication.renditions (IN)`

## Endpoints (2 declared, 2 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:RENDITION_OF --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Source](../nodes/Source.md) | [MediaWork](../nodes/MediaWork.md) | 1 |
| [Source](../nodes/Source.md) | [Publication](../nodes/Publication.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [RENDITION_OF](../predicates/RENDITION_OF.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-CL-01`, `CQ-CL-05`, `CQ-EV-05`, `CQ-PV-02`, `Q-D9-02`, `Q-D9-06`, `Q-D9-07`, `Q-D9-16`, `Q-D9-17`, `Q-D9-18`, `Q-K-21`
- [D10/Q-D10-21](../patterns/D10/Q-D10-21.md) (supported)
- [D11/CQ-PV-05](../patterns/D11/CQ-PV-05.md) (supported)
- [D11/Q-D11-05](../patterns/D11/Q-D11-05.md) (supported)
- [D11/Q-D11-19](../patterns/D11/Q-D11-19.md) (supported)
- [D3/CQ-EV-05#1](../patterns/D3/CQ-EV-05--1.md) (supported)
- [D3/CQ-EV-05#2](../patterns/D3/CQ-EV-05--2.md) (supported)
- [D7/CQ-CL-05#1](../patterns/D7/CQ-CL-05--1.md) (supported)
- [D7/Q-D7-06#1](../patterns/D7/Q-D7-06--1.md) (supported)
- [D9/CQ-CL-01](../patterns/D9/CQ-CL-01.md) (supported)
- [D9/CQ-CL-02](../patterns/D9/CQ-CL-02.md) (supported)
- [D9/CQ-CL-03](../patterns/D9/CQ-CL-03.md) (supported)
- [D9/CQ-CL-04](../patterns/D9/CQ-CL-04.md) (supported)
- [D9/CQ-CL-05](../patterns/D9/CQ-CL-05.md) (supported)
- [D9/CQ-CL-06](../patterns/D9/CQ-CL-06.md) (supported)
- [D9/CQ-CL-07](../patterns/D9/CQ-CL-07.md) (supported)
- [D9/CQ-CL-08](../patterns/D9/CQ-CL-08.md) (supported)
- [D9/CQ-CM-04](../patterns/D9/CQ-CM-04.md) (supported)
- [D9/CQ-PV-04](../patterns/D9/CQ-PV-04.md) (supported)
- [D9/CQ-PV-05](../patterns/D9/CQ-PV-05.md) (supported)
- [D9/CQ-RC-05](../patterns/D9/CQ-RC-05.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest claims made in a podcast or video episode](../tasks/ingest-podcast-claims.md)

## v1 navigation aliases

- `rel:RENDITION_OF` is unchanged from v1.
- `rel:HAS_MEDIA_VARIANT` (merged): D9: RENDITION_OF: Replaces pinned RENDITION_OF, IN_RENDITION, HAS_MEDIA_VARIANT
- `rel:IN_RENDITION` (merged): D9: RENDITION_OF: Replaces pinned RENDITION_OF, IN_RENDITION, HAS_MEDIA_VARIANT

## Source definition

- `release:registers/relationship-register.yaml#RENDITION_OF`
- `release:rules/temporal-rules.yaml#RENDITION_OF`
- `release:sdl/modules/D9.graphql#L233-L283 (MediaWork)`
- `release:sdl/modules/D3.graphql#L831-L868 (Publication)`
