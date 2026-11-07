---
id: "pred:NUTRIENT_EXPRESSED_AS"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#NUTRIENT_EXPRESSED_AS"]
aliases: ["nutrient expressed as"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:921faefc79ab4820ce8d16488f83547a61278cdfebdbd0ecb01c081ef445bdee"
---
# Predicate NUTRIENT_EXPRESSED_AS

| | |
| --- | --- |
| id | `pred:NUTRIENT_EXPRESSED_AS` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | [Constituent](../nodes/Constituent.md) |
| object types | [ChemicalSubstance](../nodes/ChemicalSubstance.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D1-02` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'NUTRIENT_EXPRESSED_AS'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named NUTRIENT_EXPRESSED_AS.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#NUTRIENT_EXPRESSED_AS`
