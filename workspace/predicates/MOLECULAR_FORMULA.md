---
id: "pred:MOLECULAR_FORMULA"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MOLECULAR_FORMULA"]
aliases: ["molecular formula"]
capabilities: ["get","propose:node.upsert"]
cardDigest: "sha256:33b634d4f84009632f745066b19632eeb82f5e45577b7581621a87a510894009"
---
# Predicate MOLECULAR_FORMULA

| | |
| --- | --- |
| id | `pred:MOLECULAR_FORMULA` |
| kind | **field** |
| route | **field** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

FIELD predicate: an Assertion certifying a node field (`ChemicalSubstance.molecularFormula`); the value is written to the node and the Assertion carries its evidence.

## Write route

Proposal kinds: `node.upsert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MOLECULAR_FORMULA`
