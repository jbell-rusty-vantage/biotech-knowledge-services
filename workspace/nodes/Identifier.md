---
id: "node:Identifier"
kind: "node"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L1253-L1277","release:registers/node-register.yaml#Identifier","release:workspace-inputs/identity-rules.yaml#Identifier"]
aliases: ["identifier","node:TradeItemIdentifier","TradeItemIdentifier"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:d2bdbf4bb3896f2703db8ddd0c82aaaf1416601c1ed5f4157ac4fd5137868b11"
---
# Identifier

Purpose: an external identifier string with scheme and issuer (PMID, DOI, NCT, UNII, CAS, GTIN, LOINC, ...; the scheme register is packets/K/identifier-schemes.yaml). Identity rule: (scheme, issuer, normalized value), unique; the same (scheme, value) from two issuers never establishes identity; names never establish identity; one Identifier identifies at most one Subjectable, so no cross-type join runs through a shared Identifier (R-42). Trade-item identifiers (GTIN, UPC, EAN, ASIN, SKU) are Identifiers with those schemes. uid token: `identifier`. Questions: Q-K-12, Q-K-13.

## Identity

| | |
| --- | --- |
| id | `node:Identifier` · raw SDL [sdl:Identifier](../sdl/Identifier.graphql) |
| module / domain | [K](../modules/K.md) / [Kernel, identity, time and provenance](../domains/kernel-and-provenance.md) |
| uid | `hu:identifier:<opaque>` |
| stored labels | `Identifier` `Entity` (primary `Identifier`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md) |
| identity rule (register) | `scheme` + `issuer` + `value` |
| identity keys | `uid`, `scheme`, `issuer`, `value`, `name` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (13)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | kernel.graphql:L1257 |
| `uid` | `String!` | yes | create+update |  | kernel.graphql:L1258 |
| `scheme` | `String!` | yes | create+update | Scheme code from the register (upper case). | kernel.graphql:L1265 |
| `issuer` | `String!` | yes | create+update |  | kernel.graphql:L1266 |
| `value` | `String!` | yes | create+update | Normalized value (normalizationRule applied). | kernel.graphql:L1268 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | kernel.graphql:L1259 |
| `lastWriterRunId` | `String` |  | create+update |  | kernel.graphql:L1261 |
| `normalizationRule` | `String` |  | create+update |  | kernel.graphql:L1269 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | kernel.graphql:L1262 |
| `updatedAt` | `DateTime` |  | create+update |  | kernel.graphql:L1263 |
| `validFrom` | `DateTime` |  | create+update | Scheme-level validity of the identifier string itself (e.g. a deprecated code). | kernel.graphql:L1271 |
| `validTo` | `DateTime` |  | create+update |  | kernel.graphql:L1272 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | kernel.graphql:L1260 |

## Outgoing relationships (1)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Identifier --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (1)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) | [Subjectable](../interfaces/Subjectable.md) (56 members) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |

## Legal predicates (1)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | object | authorizing | typed-edge | K |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Identifier does not implement Subjectable: no Assertion takes it as subject; its records carry lineage through `WAS_GENERATED_BY`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (8)

- [D1/CQ-ID-04](../patterns/D1/CQ-ID-04.md) (supported; CQ-ID-04)
- [D11/CQ-PV-05](../patterns/D11/CQ-PV-05.md) (supported; CQ-PV-05)
- [D11/Q-D11-08](../patterns/D11/Q-D11-08.md) (supported; Q-D11-08)
- [D11/Q-D11-19](../patterns/D11/Q-D11-19.md) (supported; Q-D11-19)
- [D7/Q-D7-25#1](../patterns/D7/Q-D7-25--1.md) (supported; Q-D7-25)
- [K/Q-K-12#carrier](../patterns/K/Q-K-12--carrier.md) (supported; Q-K-12)
- [K/Q-K-12#identifiers](../patterns/K/Q-K-12--identifiers.md) (supported; Q-K-12)
- [QP/P-10a.2](../patterns/QP/P-10a.2.md) (supported; Q-K-03, Q-K-04, Q-K-05, Q-K-06, Q-K-07)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`
- Policy: create; never delete (deprecation is validTo)
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [What do we already know about X? (run before every research mission)](../tasks/what-do-we-know-about-entity.md)
- [Should I update an existing node or create a new one?](../tasks/decide-update-or-create.md)
- [Record an observed price for a listing](../tasks/record-price-observation.md)
- [Attach an external identifier to a node](../tasks/attach-identifier.md)

## v1 navigation aliases

- `node:Identifier` is unchanged from v1.
- `node:TradeItemIdentifier` (merged): K: K.Identifier (schemes GTIN, ASIN, SKU)

## Source definition

- `release:sdl/modules/kernel.graphql#L1253-L1277`
- `release:registers/node-register.yaml#Identifier`
- `release:workspace-inputs/identity-rules.yaml#Identifier`
