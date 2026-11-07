---
id: "rel:NAMES_RESPONSIBLE_PARTY"
kind: "relationship"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#NAMES_RESPONSIBLE_PARTY","release:rules/temporal-rules.yaml#NAMES_RESPONSIBLE_PARTY","release:sdl/modules/D6.graphql#L384-L433 (LabelVersion)"]
aliases: ["names responsible party"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:466d7464a8537cdc7bbed0f4010b93edb371f7bd64bb328ec1af31f8d074b765"
---
# Relationship NAMES_RESPONSIBLE_PARTY



| | |
| --- | --- |
| id | `rel:NAMES_RESPONSIBLE_PARTY` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D6](../modules/D6.md) |
| stored direction | [LabelVersion](../nodes/LabelVersion.md) → [Organization](../nodes/Organization.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | zero_or_one |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_NAMES_RESPONSIBLE_PARTY_assertion`, `rel_NAMES_RESPONSIBLE_PARTY_uid`, `rel_NAMES_RESPONSIBLE_PARTY_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:LabelVersion)-[:NAMES_RESPONSIBLE_PARTY]->(:Organization)`.
- Fields in the stored direction (OUT): `LabelVersion.responsibleParty (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:NAMES_RESPONSIBLE_PARTY --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [LabelVersion](../nodes/LabelVersion.md) | [Organization](../nodes/Organization.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [NAMES_RESPONSIBLE_PARTY](../predicates/NAMES_RESPONSIBLE_PARTY.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D6-04`, `Q-D6-16`
- [D8/CQ-MF-01](../patterns/D8/CQ-MF-01.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest a product label (supplement facts) as a label version with its component lines](../tasks/ingest-product-label.md)

## v1 navigation aliases

(none)

## Source definition

- `release:registers/relationship-register.yaml#NAMES_RESPONSIBLE_PARTY`
- `release:rules/temporal-rules.yaml#NAMES_RESPONSIBLE_PARTY`
- `release:sdl/modules/D6.graphql#L384-L433 (LabelVersion)`
