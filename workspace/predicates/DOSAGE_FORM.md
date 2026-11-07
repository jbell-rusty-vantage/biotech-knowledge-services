---
id: "pred:DOSAGE_FORM"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#DOSAGE_FORM"]
aliases: ["dosage form"]
capabilities: ["get","propose:node.upsert"]
cardDigest: "sha256:63fb4cbd4bbc57c638c85a9322dfcc33549811c97fbb20c925b200749e07f978"
---
# Predicate DOSAGE_FORM

| | |
| --- | --- |
| id | `pred:DOSAGE_FORM` |
| kind | **field** |
| route | **field** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [InterventionComponent](../nodes/InterventionComponent.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

FIELD predicate: an Assertion certifying a node field (`InterventionComponent.dosageForm`); the value is written to the node and the Assertion carries its evidence.

## Write route

Proposal kinds: `node.upsert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#DOSAGE_FORM`
