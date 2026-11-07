---
id: "rel:HAS_IDENTIFIER"
kind: "relationship"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_IDENTIFIER","release:rules/temporal-rules.yaml#HAS_IDENTIFIER","release:sdl/modules/kernel.graphql#L1253-L1277 (Identifier)"]
aliases: ["has identifier"]
capabilities: ["get","neighbors","slice","find","propose:identifier.attach","pattern"]
cardDigest: "sha256:e8ea71a782bff68f742e0e429ae3437d028e6c402838db6e1e126533da237d66"
---
# Relationship HAS_IDENTIFIER



| | |
| --- | --- |
| id | `rel:HAS_IDENTIFIER` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [K](../modules/K.md) |
| stored direction | [Subjectable](../interfaces/Subjectable.md) → [Identifier](../nodes/Identifier.md) (always from → to) |
| edge properties | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) |
| cardinality | many (one episode per authorizing Assertion); one (scheme, issuer, normalized value) identifies at most one Subjectable (R-42) |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | from [Subjectable](../interfaces/Subjectable.md) (56 members, kernel-traversal) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_IDENTIFIER_assertion`, `rel_HAS_IDENTIFIER_uid`, `rel_HAS_IDENTIFIER_writer` |
| write with | `identifier.attach` — emitted by the planner as part of other proposals |

## Stored direction and GraphQL fields

- Stored: `(:Subjectable)-[:HAS_IDENTIFIER]->(:Identifier)`.
- Fields in the stored direction (OUT): (none)
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `Identifier.identifies (IN)`

## Endpoints (1 declared, 56 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_IDENTIFIER --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Subjectable](../interfaces/Subjectable.md) | [Identifier](../nodes/Identifier.md) | 56 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-K-12`, `Q-K-29`
- [D1/CQ-ID-04](../patterns/D1/CQ-ID-04.md) (supported)
- [D11/CQ-PV-05](../patterns/D11/CQ-PV-05.md) (supported)
- [D11/Q-D11-08](../patterns/D11/Q-D11-08.md) (supported)
- [D11/Q-D11-19](../patterns/D11/Q-D11-19.md) (supported)
- [D7/Q-D7-25#1](../patterns/D7/Q-D7-25--1.md) (supported)
- [K/Q-K-12#carrier](../patterns/K/Q-K-12--carrier.md) (supported)
- [K/Q-K-12#identifiers](../patterns/K/Q-K-12--identifiers.md) (supported)
- [QP/P-10a.2](../patterns/QP/P-10a.2.md) (supported)

## Forbidden implications

(none)

## Tasks

- [What do we already know about X? (run before every research mission)](../tasks/what-do-we-know-about-entity.md)
- [Should I update an existing node or create a new one?](../tasks/decide-update-or-create.md)
- [Ingest a product label (supplement facts) as a label version with its component lines](../tasks/ingest-product-label.md)
- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md)
- [Ingest an organization profile (roles, stakes, brands, control)](../tasks/ingest-organization-profile.md)
- [Record an observed price for a listing](../tasks/record-price-observation.md)
- [Attach an external identifier to a node](../tasks/attach-identifier.md)

## v1 navigation aliases

- `rel:HAS_IDENTIFIER` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#HAS_IDENTIFIER`
- `release:rules/temporal-rules.yaml#HAS_IDENTIFIER`
- `release:sdl/modules/kernel.graphql#L1253-L1277 (Identifier)`
