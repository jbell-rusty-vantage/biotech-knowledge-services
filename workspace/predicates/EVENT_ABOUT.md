---
id: "pred:EVENT_ABOUT"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#EVENT_ABOUT"]
aliases: ["event about"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:295f8dd785292012ca704c72422e3670604c92b439f761250e73126cb517c4f0"
---
# Predicate EVENT_ABOUT

| | |
| --- | --- |
| id | `pred:EVENT_ABOUT` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | (none) |
| object types | [Subjectable](../interfaces/Subjectable.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D13-02`, `Q-D13-03`, `Q-D13-05`, `Q-D13-07`, `Q-D13-16`, `Q-D13-26`, `Q-D13-33` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'EVENT_ABOUT'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named EVENT_ABOUT.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#EVENT_ABOUT`
