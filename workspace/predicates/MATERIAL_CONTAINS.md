---
id: "pred:MATERIAL_CONTAINS"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MATERIAL_CONTAINS"]
aliases: ["material contains"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:824f2b62ebb3e0d5a7680837599b5c059ea8e882f9a4215d25a505f56e4fbac8"
---
# Predicate MATERIAL_CONTAINS

| | |
| --- | --- |
| id | `pred:MATERIAL_CONTAINS` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | [IngredientMaterial](../nodes/IngredientMaterial.md) |
| object types | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Constituent](../nodes/Constituent.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-ID-03`, `Q-D1-11`, `Q-D1-13`, `Q-D10-07` |

## Typed edge or Assertion only

A typed edge exists: [MATERIAL_CONTAINS](../relationships/MATERIAL_CONTAINS.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'MATERIAL_CONTAINS'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MATERIAL_CONTAINS`
