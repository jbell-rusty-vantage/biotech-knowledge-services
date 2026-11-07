---
id: "pred:REPORTS_REPORT_COUNT"
kind: "predicate"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#REPORTS_REPORT_COUNT"]
aliases: ["reports report count"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:20fc3da82ab48b73f2fff5be8e5544de3965c9d714b388ab0e61b8030762565a"
---
# Predicate REPORTS_REPORT_COUNT

| | |
| --- | --- |
| id | `pred:REPORTS_REPORT_COUNT` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D10](../modules/D10.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Condition](../nodes/Condition.md), [Organization](../nodes/Organization.md) |
| object types | [Condition](../nodes/Condition.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D10-06` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'REPORTS_REPORT_COUNT'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named REPORTS_REPORT_COUNT.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#REPORTS_REPORT_COUNT`
