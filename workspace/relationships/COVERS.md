---
id: "rel:COVERS"
kind: "relationship"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#COVERS","release:rules/temporal-rules.yaml#COVERS","release:sdl/modules/D8.graphql#L598-L633 (CertificationListing)"]
aliases: ["covers","rel:CERTIFIED_UNDER","rel:CERTIFIES_RESULTS_FOR","rel:HAS_CERTIFICATION_SCOPE","rel:PROGRAM_HAS_LISTING","CERTIFIED_UNDER","CERTIFIES_RESULTS_FOR","HAS_CERTIFICATION_SCOPE","PROGRAM_HAS_LISTING"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:ea6245feb06cc0d637009608a1956dbffaadcb7f03a1f11d81a70ed1c685519d"
---
# Relationship COVERS



| | |
| --- | --- |
| id | `rel:COVERS` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D8](../modules/D8.md) |
| stored direction | [CertificationListing](../nodes/CertificationListing.md) → [Product](../nodes/Product.md) \| [ProductVariant](../nodes/ProductVariant.md) \| [Lot](../nodes/Lot.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | zero_or_more; many episodes |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_COVERS_assertion`, `rel_COVERS_uid`, `rel_COVERS_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:CertificationListing)-[:COVERS]->(:Product)` (other declared endpoints below).
- Fields in the stored direction (OUT): `CertificationListing.covers (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (3 declared, 3 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:COVERS --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [CertificationListing](../nodes/CertificationListing.md) | [Lot](../nodes/Lot.md) | 1 |
| [CertificationListing](../nodes/CertificationListing.md) | [Product](../nodes/Product.md) | 1 |
| [CertificationListing](../nodes/CertificationListing.md) | [ProductVariant](../nodes/ProductVariant.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [COVERS](../predicates/COVERS.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-PF-03a`, `Q-D8-08`, `Q-D8-19`
- [D8/Q-D8-19](../patterns/D8/Q-D8-19.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:COVERS` is unchanged from v1.
- `rel:CERTIFIED_UNDER` (merged): D8: COVERS: Replaces COVERS (W12), HAS_CERTIFICATION_SCOPE, CERTIFIED_UNDER, PROGRAM_HAS_LISTING, CERTIFIES_RESULTS_FOR
- `rel:CERTIFIES_RESULTS_FOR` (merged): D8: COVERS: Replaces COVERS (W12), HAS_CERTIFICATION_SCOPE, CERTIFIED_UNDER, PROGRAM_HAS_LISTING, CERTIFIES_RESULTS_FOR
- `rel:HAS_CERTIFICATION_SCOPE` (merged): D8: COVERS: Replaces COVERS (W12), HAS_CERTIFICATION_SCOPE, CERTIFIED_UNDER, PROGRAM_HAS_LISTING, CERTIFIES_RESULTS_FOR
- `rel:PROGRAM_HAS_LISTING` (merged): D8: COVERS: Replaces COVERS (W12), HAS_CERTIFICATION_SCOPE, CERTIFIED_UNDER, PROGRAM_HAS_LISTING, CERTIFIES_RESULTS_FOR

## Source definition

- `release:registers/relationship-register.yaml#COVERS`
- `release:rules/temporal-rules.yaml#COVERS`
- `release:sdl/modules/D8.graphql#L598-L633 (CertificationListing)`
