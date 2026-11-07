---
id: "pred:STATUS_OF"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#STATUS_OF"]
aliases: ["status of"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:06b18143f0749fd06dbc5db971290e482bc277111f25d294a0d60e52c7459f94"
---
# Predicate STATUS_OF

| | |
| --- | --- |
| id | `pred:STATUS_OF` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [LegalStatus](../nodes/LegalStatus.md) |
| object types | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [IngredientMaterial](../nodes/IngredientMaterial.md), [Patent](../nodes/Patent.md), [Product](../nodes/Product.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-AX-23`, `CQ-MF-02`, `CQ-PF-04`, `Q-D11-14`, `Q-D8-01`, `Q-D8-12`, `Q-D8-13`, `Q-D8-14`, `Q-D8-18`, `Q-D8-20`, `Q-D8-23` |

## Typed edge or Assertion only

A typed edge exists: [STATUS_OF](../relationships/STATUS_OF.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'STATUS_OF'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#STATUS_OF`
