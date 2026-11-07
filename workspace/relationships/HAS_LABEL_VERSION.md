---
id: "rel:HAS_LABEL_VERSION"
kind: "relationship"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_LABEL_VERSION","release:rules/temporal-rules.yaml#HAS_LABEL_VERSION","release:sdl/modules/D6.graphql#L341-L366 (Package)"]
aliases: ["has label version","rel:DECLARES_FORMULATION","rel:HAS_FORMULATION_VERSION","rel:LABEL_FOR","DECLARES_FORMULATION","HAS_FORMULATION_VERSION","LABEL_FOR"]
capabilities: ["get","neighbors","slice","find","propose:state.attach","pattern"]
cardDigest: "sha256:dc310e303fc67ecd680e1ee859c9f6889b95ab7e03a165a60cb80ac2afa83775"
---
# Relationship HAS_LABEL_VERSION



| | |
| --- | --- |
| id | `rel:HAS_LABEL_VERSION` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D6](../modules/D6.md) |
| stored direction | [Package](../nodes/Package.md) → [LabelVersion](../nodes/LabelVersion.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | many episodes; exclusive (R-10, scope per exclusiveNote); one episode per (package, label version, asserter) (R-22); readers group by LabelVersion (Q-D6-01) |
| temporal | **episode** · **exclusive** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_LABEL_VERSION_assertion`, `rel_HAS_LABEL_VERSION_uid`, `rel_HAS_LABEL_VERSION_writer` |
| write with | `state.attach` |

## Stored direction and GraphQL fields

- Stored: `(:Package)-[:HAS_LABEL_VERSION]->(:LabelVersion)`.
- Fields in the stored direction (OUT): `Package.labelVersions (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_LABEL_VERSION --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Package](../nodes/Package.md) | [LabelVersion](../nodes/LabelVersion.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [HAS_LABEL_VERSION](../predicates/HAS_LABEL_VERSION.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Exclusivity: R-10 sets exclusive: true (StateEpisodeProperties retired). The packet had declared this type NON-EXCLUSIVE: several open episodes coexist, one per asserting source (brand, DSLD, crowd database) and per attested version, and readers group by LabelVersion (packet 03 Q-D6-01; adversarial-review fix M14). R-22 keeps one episode per (from, to, type, asserter). Whether the executor's non-overlap check runs per (package, type) or per (package, type, asserter) is not fixed by R-10; the D6 fixtures are consistent with the per-asserter reading (one asserter, NIH ODS, closes V09.2 before V12.3 opens on the 30-count package). Owner/integrator confirms the scope.
- Exclusivity scope (TM-01): Exclusive (non-overlapping) episodes are scoped to (subject, relationship/predicate slot, asserter): same-asserter overlap is rejected; different asserters coexist and cross-source disagreement is preserved. Separately defined global identity constraints are not weakened. K owns CQ-TM-05 and the exclusivity contract; module register rows supply slot policies (exclusive: true).
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-AX-25`, `CQ-ID-02`, `CQ-ID-05`, `Q-D6-01`, `Q-D6-09`, `Q-D6-10`, `Q-D6-11`, `Q-D6-12`
- [D1/Q-D1-16](../patterns/D1/Q-D1-16.md) (supported)
- [D12/Q-D12-18](../patterns/D12/Q-D12-18.md) (supported)
- [D6/CQ-AX-25#1](../patterns/D6/CQ-AX-25--1.md) (supported)
- [D6/Q-D6-01#1](../patterns/D6/Q-D6-01--1.md) (supported)
- [D6/Q-D6-08#1](../patterns/D6/Q-D6-08--1.md) (supported)
- [D6/Q-D6-10#1](../patterns/D6/Q-D6-10--1.md) (supported)
- [D6/Q-D6-11#1](../patterns/D6/Q-D6-11--1.md) (supported)
- [D8/CQ-MF-01](../patterns/D8/CQ-MF-01.md) (supported)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest a product label (supplement facts) as a label version with its component lines](../tasks/ingest-product-label.md)
- [Compare measured content of a sold product with its label declaration (OD-10 option A)](../tasks/measured-versus-declared-content.md)

## v1 navigation aliases

- `rel:DECLARES_FORMULATION` (merged): D6: HAS_LABEL_VERSION: Replaces the pinned LABEL_FOR, DECLARES_FORMULATION and HAS_FORMULATION_VERSION: composition time is label time
- `rel:HAS_FORMULATION_VERSION` (merged): D6: HAS_LABEL_VERSION: Replaces the pinned LABEL_FOR, DECLARES_FORMULATION and HAS_FORMULATION_VERSION: composition time is label time
- `rel:LABEL_FOR` (merged): D6: HAS_LABEL_VERSION: Replaces the pinned LABEL_FOR, DECLARES_FORMULATION and HAS_FORMULATION_VERSION: composition time is label time

## Source definition

- `release:registers/relationship-register.yaml#HAS_LABEL_VERSION`
- `release:rules/temporal-rules.yaml#HAS_LABEL_VERSION`
- `release:sdl/modules/D6.graphql#L341-L366 (Package)`
