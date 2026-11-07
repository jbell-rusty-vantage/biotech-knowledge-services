---
id: "pred:MEASURES_ANALYTE"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MEASURES_ANALYTE"]
aliases: ["measures analyte"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:f508c4b221b7b254713e2106f0cc2668ca41b0618f3097ca3076261b704ff774"
---
# Predicate MEASURES_ANALYTE

| | |
| --- | --- |
| id | `pred:MEASURES_ANALYTE` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [QualityResult](../nodes/QualityResult.md) |
| object types | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Constituent](../nodes/Constituent.md), [IngredientMaterial](../nodes/IngredientMaterial.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-AX-19`, `Q-D8-06` |

## Typed edge or Assertion only

A typed edge exists: [MEASURES_ANALYTE](../relationships/MEASURES_ANALYTE.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'MEASURES_ANALYTE'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MEASURES_ANALYTE`
