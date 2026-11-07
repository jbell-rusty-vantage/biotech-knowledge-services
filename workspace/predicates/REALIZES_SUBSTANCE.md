---
id: "pred:REALIZES_SUBSTANCE"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#REALIZES_SUBSTANCE"]
aliases: ["realizes substance"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:0b89874f05df308e2518dff2ceeb16830fd1f1e41495ab117db93cb49c19c4dc"
---
# Predicate REALIZES_SUBSTANCE

| | |
| --- | --- |
| id | `pred:REALIZES_SUBSTANCE` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | [IngredientMaterial](../nodes/IngredientMaterial.md) |
| object types | [ChemicalSubstance](../nodes/ChemicalSubstance.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-ID-03`, `CQ-ID-06`, `CQ-ST-02`, `Q-D1-05`, `Q-D1-07`, `Q-D1-17`, `Q-D1-26`, `Q-D10-07`, `Q-D10-11` |

## Typed edge or Assertion only

A typed edge exists: [REALIZES_SUBSTANCE](../relationships/REALIZES_SUBSTANCE.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'REALIZES_SUBSTANCE'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#REALIZES_SUBSTANCE`
