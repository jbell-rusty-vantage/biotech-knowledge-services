---
id: "pred:CONCERNS"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CONCERNS"]
aliases: ["concerns"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:103c578d1887ceadf4408600c172ef1a6d9a3d3e62c981c7ae5d57439e208f62"
---
# Predicate CONCERNS

| | |
| --- | --- |
| id | `pred:CONCERNS` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [Patent](../nodes/Patent.md), [RegulatoryRecord](../nodes/RegulatoryRecord.md) |
| object types | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [IngredientMaterial](../nodes/IngredientMaterial.md), [Lot](../nodes/Lot.md), [Product](../nodes/Product.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-EC-01`, `Q-D8-02`, `Q-D8-04`, `Q-D8-10`, `Q-D8-11`, `Q-D8-13`, `Q-D8-16`, `Q-D8-17`, `Q-D8-18`, `Q-D8-19`, `Q-D8-23` |

## Typed edge or Assertion only

A typed edge exists: [CONCERNS](../relationships/CONCERNS.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'CONCERNS'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CONCERNS`
