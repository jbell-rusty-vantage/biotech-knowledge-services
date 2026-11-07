---
id: "pred:CHARACTERIZES_REGULATORY_RECORD"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CHARACTERIZES_REGULATORY_RECORD"]
aliases: ["characterizes regulatory record"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:1f92531ef19d2f735646d687b34b26d91583d3443e86626542bc3bd8a3e09ea1"
---
# Predicate CHARACTERIZES_REGULATORY_RECORD

| | |
| --- | --- |
| id | `pred:CHARACTERIZES_REGULATORY_RECORD` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | (none) |
| object types | [RegulatoryRecord](../nodes/RegulatoryRecord.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-MF-03` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'CHARACTERIZES_REGULATORY_RECORD'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named CHARACTERIZES_REGULATORY_RECORD.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CHARACTERIZES_REGULATORY_RECORD`
