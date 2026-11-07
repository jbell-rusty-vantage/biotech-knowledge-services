---
id: "pred:COUNTS_TOWARD_NUTRIENT"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#COUNTS_TOWARD_NUTRIENT"]
aliases: ["counts toward nutrient"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:4992adb89ccd707625e2fa79d8203da83047846c66e4bb5e4a83788643daba78"
---
# Predicate COUNTS_TOWARD_NUTRIENT

| | |
| --- | --- |
| id | `pred:COUNTS_TOWARD_NUTRIENT` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md) |
| object types | [Constituent](../nodes/Constituent.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D1-03`, `Q-D1-04`, `Q-D1-19`, `Q-D1-22`, `Q-D1-28` |

## Typed edge or Assertion only

A typed edge exists: [COUNTS_TOWARD_NUTRIENT](../relationships/COUNTS_TOWARD_NUTRIENT.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'COUNTS_TOWARD_NUTRIENT'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#COUNTS_TOWARD_NUTRIENT`
