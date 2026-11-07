---
id: "rel:HAS_REGISTRATION_VERSION"
kind: "relationship"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_REGISTRATION_VERSION","release:rules/temporal-rules.yaml#HAS_REGISTRATION_VERSION","release:sdl/modules/D3.graphql#L426-L478 (Study)"]
aliases: ["has registration version","rel:REGISTERED_AS","REGISTERED_AS"]
capabilities: ["get","neighbors","slice","find","propose:state.attach"]
cardDigest: "sha256:eb9a01b18c94325b949ad7d778f6d4de6802c9e54033b6a949f3d01e6862fc9a"
---
# Relationship HAS_REGISTRATION_VERSION



| | |
| --- | --- |
| id | `rel:HAS_REGISTRATION_VERSION` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D3](../modules/D3.md) |
| stored direction | [Study](../nodes/Study.md) → [RegistrationVersion](../nodes/RegistrationVersion.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | many (EXCLUSIVE per registry in valid × recorded time; one open episode per registry; executor-enforced by the register flag `exclusive`, R-10) |
| temporal | **episode** · **exclusive** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_REGISTRATION_VERSION_assertion`, `rel_HAS_REGISTRATION_VERSION_uid`, `rel_HAS_REGISTRATION_VERSION_writer` |
| write with | `state.attach` |

## Stored direction and GraphQL fields

- Stored: `(:Study)-[:HAS_REGISTRATION_VERSION]->(:RegistrationVersion)`.
- Fields in the stored direction (OUT): `Study.registrationVersions (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_REGISTRATION_VERSION --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Study](../nodes/Study.md) | [RegistrationVersion](../nodes/RegistrationVersion.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [HAS_REGISTRATION_VERSION](../predicates/HAS_REGISTRATION_VERSION.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Exclusivity scope (TM-01): Exclusive (non-overlapping) episodes are scoped to (subject, relationship/predicate slot, asserter): same-asserter overlap is rejected; different asserters coexist and cross-source disagreement is preserved. Separately defined global identity constraints are not weakened. K owns CQ-TM-05 and the exclusivity contract; module register rows supply slot policies (exclusive: true).
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-ST-04`, `CQ-ST-08`, `Q-D3-02`, `Q-D3-16`, `Q-D3-18`
(none)

## Forbidden implications

(none)

## Tasks

- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md)

## v1 navigation aliases

- `rel:HAS_REGISTRATION_VERSION` is unchanged from v1.
- `rel:REGISTERED_AS` (merged): D3: HAS_REGISTRATION_VERSION: Replaces pinned TrialRegistration -HAS_REGISTRATION_VERSION-> and Study -REGISTERED_AS-> (registration ids are kernel Identifiers…

## Source definition

- `release:registers/relationship-register.yaml#HAS_REGISTRATION_VERSION`
- `release:rules/temporal-rules.yaml#HAS_REGISTRATION_VERSION`
- `release:sdl/modules/D3.graphql#L426-L478 (Study)`
