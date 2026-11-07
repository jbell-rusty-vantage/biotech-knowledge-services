---
id: "rel:PART_OF_MECHANISM"
kind: "relationship"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#PART_OF_MECHANISM","release:rules/temporal-rules.yaml#PART_OF_MECHANISM","release:sdl/modules/D2.graphql#L255-L288 (Mechanism)"]
aliases: ["part of mechanism","rel:INVOLVES_PATHWAY","INVOLVES_PATHWAY"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert"]
cardDigest: "sha256:bb349715701c7ab9012cd4268bd8fa0e8cd26422125bd0384aee9d4f23e3e618"
---
# Relationship PART_OF_MECHANISM



| | |
| --- | --- |
| id | `rel:PART_OF_MECHANISM` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D2](../modules/D2.md) |
| stored direction | [Mechanism](../nodes/Mechanism.md) → [Mechanism](../nodes/Mechanism.md) (always from → to) |
| edge properties | [MechanismReferenceProperties](../edge-properties/MechanismReferenceProperties.md) |
| cardinality | many (a mechanism can sit under several parents: Reactome hasEvent, GO part_of, BellLabs hallmark mapping); one episode per authorizing Assertion |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_PART_OF_MECHANISM_assertion`, `rel_PART_OF_MECHANISM_uid`, `rel_PART_OF_MECHANISM_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Mechanism)-[:PART_OF_MECHANISM]->(:Mechanism)`.
- Fields in the stored direction (OUT): `Mechanism.partOf (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:PART_OF_MECHANISM --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Mechanism](../nodes/Mechanism.md) | [Mechanism](../nodes/Mechanism.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [PART_OF_MECHANISM](../predicates/PART_OF_MECHANISM.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D2-02`, `Q-D2-12`
(none)

## Forbidden implications

(none)

## Tasks

- [Record mechanism evidence (measured vs inferred) for a substance](../tasks/ingest-mechanism-evidence.md)

## v1 navigation aliases

- `rel:INVOLVES_PATHWAY` (renamed): D2: PART_OF_MECHANISM: Replaces pinned INVOLVES_PATHWAY (Mechanism→Pathway, Condition→Pathway) and the implicit hallmark grouping

## Source definition

- `release:registers/relationship-register.yaml#PART_OF_MECHANISM`
- `release:rules/temporal-rules.yaml#PART_OF_MECHANISM`
- `release:sdl/modules/D2.graphql#L255-L288 (Mechanism)`
