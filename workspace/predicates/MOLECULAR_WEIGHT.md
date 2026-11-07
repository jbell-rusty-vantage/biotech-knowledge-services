---
id: "pred:MOLECULAR_WEIGHT"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MOLECULAR_WEIGHT"]
aliases: ["molecular weight"]
capabilities: ["get","propose:node.upsert"]
cardDigest: "sha256:28bffffc0b3ed104c26b05f27b7bf6e6532101d1e8778ef74f6d780237adb8ed"
---
# Predicate MOLECULAR_WEIGHT

| | |
| --- | --- |
| id | `pred:MOLECULAR_WEIGHT` |
| kind | **field** |
| route | **field** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md) |
| object types | (none) |
| literal forms | `valueNumber` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D1-01` |

## Typed edge or Assertion only

FIELD predicate: an Assertion certifying a node field (`ChemicalSubstance.molecularWeight`); the value is written to the node and the Assertion carries its evidence.

## Write route

Proposal kinds: `node.upsert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MOLECULAR_WEIGHT`
