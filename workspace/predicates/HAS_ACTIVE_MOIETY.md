---
id: "pred:HAS_ACTIVE_MOIETY"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_ACTIVE_MOIETY"]
aliases: ["has active moiety"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:3d29597c938a8902b0eb1082c13ed09c51cb8e1891f4a9ef82deeed5ead63ba8"
---
# Predicate HAS_ACTIVE_MOIETY

| | |
| --- | --- |
| id | `pred:HAS_ACTIVE_MOIETY` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md) |
| object types | [ChemicalSubstance](../nodes/ChemicalSubstance.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D1-01`, `Q-D1-03`, `Q-D1-04`, `Q-D1-05`, `Q-D1-24`, `Q-D10-07`, `Q-D10-11`, `Q-D11-09` |

## Typed edge or Assertion only

A typed edge exists: [HAS_ACTIVE_MOIETY](../relationships/HAS_ACTIVE_MOIETY.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'HAS_ACTIVE_MOIETY'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_ACTIVE_MOIETY`
