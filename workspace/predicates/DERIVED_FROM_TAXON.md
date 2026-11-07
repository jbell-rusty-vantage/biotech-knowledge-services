---
id: "pred:DERIVED_FROM_TAXON"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#DERIVED_FROM_TAXON"]
aliases: ["derived from taxon"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:e829d941084f3c11cc4a8d475096870a3a605a354be395eb8f9c50f97258d073"
---
# Predicate DERIVED_FROM_TAXON

| | |
| --- | --- |
| id | `pred:DERIVED_FROM_TAXON` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | [IngredientMaterial](../nodes/IngredientMaterial.md) |
| object types | [Taxon](../nodes/Taxon.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D1-11`, `Q-D1-12`, `Q-D1-14`, `Q-D1-15` |

## Typed edge or Assertion only

A typed edge exists: [DERIVED_FROM_TAXON](../relationships/DERIVED_FROM_TAXON.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'DERIVED_FROM_TAXON'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#DERIVED_FROM_TAXON`
