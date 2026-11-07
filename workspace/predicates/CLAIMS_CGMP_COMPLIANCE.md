---
id: "pred:CLAIMS_CGMP_COMPLIANCE"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CLAIMS_CGMP_COMPLIANCE"]
aliases: ["claims cgmp compliance"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:8bfe36fcb2752db9b6cfe3021a579cf2e6dda0e33fe556710c61018af64dc99c"
---
# Predicate CLAIMS_CGMP_COMPLIANCE

| | |
| --- | --- |
| id | `pred:CLAIMS_CGMP_COMPLIANCE` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | (none) |
| object types | (none) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-MF-06` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'CLAIMS_CGMP_COMPLIANCE'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named CLAIMS_CGMP_COMPLIANCE.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CLAIMS_CGMP_COMPLIANCE`
