---
id: "rel:HOLDS_STAKE"
kind: "relationship"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HOLDS_STAKE","release:rules/temporal-rules.yaml#HOLDS_STAKE","release:sdl/modules/D7.graphql#L308-L340 (Organization)","release:sdl/modules/D7.graphql#L355-L390 (Person)"]
aliases: ["holds stake","rel:HOLDS_EQUITY_IN","rel:INVESTED_IN","HOLDS_EQUITY_IN","INVESTED_IN"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:c0c9dedbda5887f2dffc946759310ab87c431a5558bc505b50ce5a337781d58d"
---
# Relationship HOLDS_STAKE



| | |
| --- | --- |
| id | `rel:HOLDS_STAKE` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D7](../modules/D7.md) |
| stored direction | [Person](../nodes/Person.md) \| [Organization](../nodes/Organization.md) → [Organization](../nodes/Organization.md) (always from → to) |
| edge properties | [StakeEdgeProperties](../edge-properties/StakeEdgeProperties.md) |
| cardinality | many (one episode per authorizing Assertion) |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HOLDS_STAKE_assertion`, `rel_HOLDS_STAKE_uid`, `rel_HOLDS_STAKE_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Person)-[:HOLDS_STAKE]->(:Organization)` (other declared endpoints below).
- Fields in the stored direction (OUT): `Organization.holdsStakes (OUT)`, `Person.holdsStakes (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (2 declared, 2 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HOLDS_STAKE --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Organization](../nodes/Organization.md) | [Organization](../nodes/Organization.md) | 1 |
| [Person](../nodes/Person.md) | [Organization](../nodes/Organization.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [HOLDS_STAKE](../predicates/HOLDS_STAKE.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-AX-18`, `CQ-CL-05`, `CQ-EC-01`, `CQ-EC-03`, `Q-D7-01`, `Q-D7-03`, `Q-D7-06`, `Q-D7-11`, `Q-D7-12`, `Q-D7-13`, `Q-D7-14`, `Q-D7-16`
- [D7/CQ-EC-04#1](../patterns/D7/CQ-EC-04--1.md) (supported)
- [K/Q-K-15](../patterns/K/Q-K-15.md) (supported)

## Forbidden implications

- `HOLDS_STAKE` does NOT imply `OWNS_BRAND`

## Tasks

- [Ingest an organization profile (roles, stakes, brands, control)](../tasks/ingest-organization-profile.md)
- [Record a financial interest or conflict and its disclosure](../tasks/interest-conflict-disclosure.md)

## v1 navigation aliases

- `rel:HOLDS_EQUITY_IN` (merged): D7: HOLDS_STAKE: Replaces pinned INVESTED_IN and HOLDS_EQUITY_IN (kept apart by stakeKind EQUITY vs INVESTOR_UNSPECIFIED)
- `rel:INVESTED_IN` (merged): D7: HOLDS_STAKE: Replaces pinned INVESTED_IN and HOLDS_EQUITY_IN (kept apart by stakeKind EQUITY vs INVESTOR_UNSPECIFIED)

## Source definition

- `release:registers/relationship-register.yaml#HOLDS_STAKE`
- `release:rules/temporal-rules.yaml#HOLDS_STAKE`
- `release:sdl/modules/D7.graphql#L308-L340 (Organization)`
- `release:sdl/modules/D7.graphql#L355-L390 (Person)`
