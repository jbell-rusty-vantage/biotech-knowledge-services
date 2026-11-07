---
id: "rel:OWNS_BRAND"
kind: "relationship"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#OWNS_BRAND","release:rules/temporal-rules.yaml#OWNS_BRAND","release:sdl/modules/D7.graphql#L402-L419 (Brand)"]
aliases: ["owns brand"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:0812b539771de46424867cb5e3354894af0391404249e08e747a4bc5f7781bf0"
---
# Relationship OWNS_BRAND



| | |
| --- | --- |
| id | `rel:OWNS_BRAND` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D7](../modules/D7.md) |
| stored direction | [Organization](../nodes/Organization.md) → [Brand](../nodes/Brand.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | many over time (one open holder episode expected per brand) |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_OWNS_BRAND_assertion`, `rel_OWNS_BRAND_uid`, `rel_OWNS_BRAND_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Organization)-[:OWNS_BRAND]->(:Brand)`.
- Fields in the stored direction (OUT): (none)
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `Brand.owners (IN)`

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:OWNS_BRAND --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Organization](../nodes/Organization.md) | [Brand](../nodes/Brand.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [OWNS_BRAND](../predicates/OWNS_BRAND.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-CL-05`, `CQ-EC-02`, `Q-D7-06`, `Q-D7-10`, `Q-D7-11`, `Q-D7-19`
- [D12/Q-D12-06#option-a](../patterns/D12/Q-D12-06--option-a.md) (supported)
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported)
- [D6/Q-D6-11#1](../patterns/D6/Q-D6-11--1.md) (supported)
- [D7/CQ-CL-05#1](../patterns/D7/CQ-CL-05--1.md) (supported)
- [D7/Q-D7-06#1](../patterns/D7/Q-D7-06--1.md) (supported)
- [D8/CQ-MF-01](../patterns/D8/CQ-MF-01.md) (supported)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported)
- [K/Q-K-15](../patterns/K/Q-K-15.md) (supported)
- [QP/P-09](../patterns/QP/P-09.md) (supported)

## Forbidden implications

- `HOLDS_STAKE` does NOT imply `OWNS_BRAND`
- `OPERATED_BY` does NOT imply `OWNS_BRAND`

## Tasks

- [Ingest an organization profile (roles, stakes, brands, control)](../tasks/ingest-organization-profile.md)

## v1 navigation aliases

- `rel:OWNS_BRAND` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#OWNS_BRAND`
- `release:rules/temporal-rules.yaml#OWNS_BRAND`
- `release:sdl/modules/D7.graphql#L402-L419 (Brand)`
