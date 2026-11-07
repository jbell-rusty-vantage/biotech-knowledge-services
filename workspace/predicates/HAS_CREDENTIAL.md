---
id: "pred:HAS_CREDENTIAL"
kind: "predicate"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_CREDENTIAL"]
aliases: ["has credential"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:230b94525e623eb07280c2b30629420097f8b4c15a37b65e39df159482cddd8f"
---
# Predicate HAS_CREDENTIAL

| | |
| --- | --- |
| id | `pred:HAS_CREDENTIAL` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [K](../modules/K.md) |
| subject types | (none) |
| object types | (none) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'HAS_CREDENTIAL'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named HAS_CREDENTIAL.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_CREDENTIAL`
