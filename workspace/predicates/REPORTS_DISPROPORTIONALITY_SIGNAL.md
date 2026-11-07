---
id: "pred:REPORTS_DISPROPORTIONALITY_SIGNAL"
kind: "predicate"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#REPORTS_DISPROPORTIONALITY_SIGNAL"]
aliases: ["reports disproportionality signal"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:d331c96c726c0198383ae5b91b355f7f97d14ff99fe8dfdf1b960ebe5e2c45ab"
---
# Predicate REPORTS_DISPROPORTIONALITY_SIGNAL

| | |
| --- | --- |
| id | `pred:REPORTS_DISPROPORTIONALITY_SIGNAL` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D10](../modules/D10.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md) |
| object types | [Condition](../nodes/Condition.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D10-06` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'REPORTS_DISPROPORTIONALITY_SIGNAL'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named REPORTS_DISPROPORTIONALITY_SIGNAL.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#REPORTS_DISPROPORTIONALITY_SIGNAL`
