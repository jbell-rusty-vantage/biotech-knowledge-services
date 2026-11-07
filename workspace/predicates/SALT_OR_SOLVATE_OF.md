---
id: "pred:SALT_OR_SOLVATE_OF"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#SALT_OR_SOLVATE_OF"]
aliases: ["salt or solvate of"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:9211b6c0dc6c42f484519467bf2e2f9888898854a22e6f33f473eaeb2adb65ac"
---
# Predicate SALT_OR_SOLVATE_OF

| | |
| --- | --- |
| id | `pred:SALT_OR_SOLVATE_OF` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | (none) |
| object types | (none) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'SALT_OR_SOLVATE_OF'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named SALT_OR_SOLVATE_OF.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#SALT_OR_SOLVATE_OF`
