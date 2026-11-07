---
id: "pred:BEARS_SEAL"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#BEARS_SEAL"]
aliases: ["bears seal"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:76b95893610625bb19e0d99ff539e158693ca09c6b4e50cd96276b4d84ff309f"
---
# Predicate BEARS_SEAL

| | |
| --- | --- |
| id | `pred:BEARS_SEAL` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [LabelVersion](../nodes/LabelVersion.md) |
| object types | [CertificationListing](../nodes/CertificationListing.md), [LabelVersion](../nodes/LabelVersion.md), [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'BEARS_SEAL'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named BEARS_SEAL.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#BEARS_SEAL`
