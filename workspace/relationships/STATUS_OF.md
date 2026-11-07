---
id: "rel:STATUS_OF"
kind: "relationship"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#STATUS_OF","release:rules/temporal-rules.yaml#STATUS_OF","release:sdl/modules/D8.graphql#L456-L486 (LegalStatus)"]
aliases: ["status of","rel:HAS_REGULATORY_STATUS","rel:IP_STATUS_OF","HAS_REGULATORY_STATUS","IP_STATUS_OF"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:af9c321f051ba4b5e64c02d1f3c1f9443bf1b20ab93a672b3e533642dadbc299"
---
# Relationship STATUS_OF



| | |
| --- | --- |
| id | `rel:STATUS_OF` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D8](../modules/D8.md) |
| stored direction | [LegalStatus](../nodes/LegalStatus.md) → [ChemicalSubstance](../nodes/ChemicalSubstance.md) \| [IngredientMaterial](../nodes/IngredientMaterial.md) \| [Product](../nodes/Product.md) \| [Patent](../nodes/Patent.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | exactly_one subject per status; many episodes |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_STATUS_OF_assertion`, `rel_STATUS_OF_uid`, `rel_STATUS_OF_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:LegalStatus)-[:STATUS_OF]->(:ChemicalSubstance)` (other declared endpoints below).
- Fields in the stored direction (OUT): `LegalStatus.statusOf (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (4 declared, 4 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:STATUS_OF --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [LegalStatus](../nodes/LegalStatus.md) | [ChemicalSubstance](../nodes/ChemicalSubstance.md) | 1 |
| [LegalStatus](../nodes/LegalStatus.md) | [IngredientMaterial](../nodes/IngredientMaterial.md) | 1 |
| [LegalStatus](../nodes/LegalStatus.md) | [Patent](../nodes/Patent.md) | 1 |
| [LegalStatus](../nodes/LegalStatus.md) | [Product](../nodes/Product.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [STATUS_OF](../predicates/STATUS_OF.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-AX-23`, `CQ-MF-02`, `CQ-PF-04`, `Q-D8-01`, `Q-D8-12`, `Q-D8-13`, `Q-D8-14`, `Q-D8-18`, `Q-D8-20`, `Q-D8-23`
- [D8/Q-D8-13](../patterns/D8/Q-D8-13.md) (supported)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported)
- [D8/Q-D8-23](../patterns/D8/Q-D8-23.md) (supported)
- [D9/Q-D9-21](../patterns/D9/Q-D9-21.md) (supported)

## Forbidden implications

- `LICENSED_TO` does NOT imply `STATUS_OF`

## Tasks

- [Ingest a regulatory record (filing, letter, recall, inspection) and the status it establishes](../tasks/ingest-regulatory-filing.md)

## v1 navigation aliases

- `rel:STATUS_OF` is unchanged from v1.
- `rel:HAS_REGULATORY_STATUS` (merged): D8: STATUS_OF: Replaces HAS_REGULATORY_STATUS, STATUS_OF (W13) and IP_STATUS_OF
- `rel:IP_STATUS_OF` (merged): D8: STATUS_OF: Replaces HAS_REGULATORY_STATUS, STATUS_OF (W13) and IP_STATUS_OF

## Source definition

- `release:registers/relationship-register.yaml#STATUS_OF`
- `release:rules/temporal-rules.yaml#STATUS_OF`
- `release:sdl/modules/D8.graphql#L456-L486 (LegalStatus)`
