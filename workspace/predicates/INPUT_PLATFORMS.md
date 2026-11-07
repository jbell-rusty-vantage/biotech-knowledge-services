---
id: "pred:INPUT_PLATFORMS"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#INPUT_PLATFORMS"]
aliases: ["input platforms","AlgorithmVersion.inputPlatforms","algorithmversion.inputplatforms"]
capabilities: ["get","propose:node.upsert"]
cardDigest: "sha256:b5932ada31b684e119c7b131612255d3d2ac82ab9900130329244d180ed4b410"
---
# Predicate INPUT_PLATFORMS

| | |
| --- | --- |
| id | `pred:INPUT_PLATFORMS` |
| kind | **field** |
| route | **field** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [AlgorithmVersion](../nodes/AlgorithmVersion.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | [AlgorithmVersion.inputPlatforms](AlgorithmVersion.inputPlatforms.md) |
| questions | (none) |

## Typed edge or Assertion only

FIELD predicate: an Assertion certifying a node field (`AlgorithmVersion.inputPlatforms`); the value is written to the node and the Assertion carries its evidence.

## Write route

Proposal kinds: `node.upsert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#INPUT_PLATFORMS`
