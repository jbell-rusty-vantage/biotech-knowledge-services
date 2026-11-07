---
id: "rel:RECEIVES_VALUE_FROM"
kind: "relationship"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#RECEIVES_VALUE_FROM","release:rules/temporal-rules.yaml#RECEIVES_VALUE_FROM","release:sdl/modules/D7.graphql#L355-L390 (Person)"]
aliases: ["receives value from","rel:HAS_IP_INTEREST_IN","rel:RECEIVES_COMPENSATION_FROM","HAS_IP_INTEREST_IN","RECEIVES_COMPENSATION_FROM"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:21fb802bc2aeddf397390cd2e054cca55f00e70b3e65cb96189715bc98b482fb"
---
# Relationship RECEIVES_VALUE_FROM



| | |
| --- | --- |
| id | `rel:RECEIVES_VALUE_FROM` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D7](../modules/D7.md) |
| stored direction | [Person](../nodes/Person.md) → [Organization](../nodes/Organization.md) (always from → to) |
| edge properties | [ValueEdgeProperties](../edge-properties/ValueEdgeProperties.md) |
| cardinality | many (one episode per authorizing Assertion; the payer is the target) |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_RECEIVES_VALUE_FROM_assertion`, `rel_RECEIVES_VALUE_FROM_uid`, `rel_RECEIVES_VALUE_FROM_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Person)-[:RECEIVES_VALUE_FROM]->(:Organization)`.
- Fields in the stored direction (OUT): `Person.receivesValueFrom (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:RECEIVES_VALUE_FROM --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Person](../nodes/Person.md) | [Organization](../nodes/Organization.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [RECEIVES_VALUE_FROM](../predicates/RECEIVES_VALUE_FROM.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-AX-18`, `CQ-CL-05`, `CQ-EC-03`, `CQ-EC-04`, `Q-D7-06`, `Q-D7-07`, `Q-D7-16`, `Q-D7-18`
- [D7/CQ-EC-04#1](../patterns/D7/CQ-EC-04--1.md) (supported)
- [K/Q-K-15](../patterns/K/Q-K-15.md) (supported)

## Forbidden implications

- `RECEIVES_VALUE_FROM` does NOT imply `RECOMMENDS_USE`

## Tasks

- [Record a financial interest or conflict and its disclosure](../tasks/interest-conflict-disclosure.md)

## v1 navigation aliases

- `rel:HAS_IP_INTEREST_IN` (merged): D7: RECEIVES_VALUE_FROM: Replaces pinned RECEIVES_COMPENSATION_FROM and HAS_IP_INTEREST_IN
- `rel:RECEIVES_COMPENSATION_FROM` (merged): D7: RECEIVES_VALUE_FROM: Replaces pinned RECEIVES_COMPENSATION_FROM and HAS_IP_INTEREST_IN

## Source definition

- `release:registers/relationship-register.yaml#RECEIVES_VALUE_FROM`
- `release:rules/temporal-rules.yaml#RECEIVES_VALUE_FROM`
- `release:sdl/modules/D7.graphql#L355-L390 (Person)`
