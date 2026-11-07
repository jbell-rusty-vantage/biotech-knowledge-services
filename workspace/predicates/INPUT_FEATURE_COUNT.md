---
id: "pred:INPUT_FEATURE_COUNT"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#INPUT_FEATURE_COUNT"]
aliases: ["input feature count","AlgorithmVersion.inputFeatureCount","algorithmversion.inputfeaturecount"]
capabilities: ["get","propose:node.upsert"]
cardDigest: "sha256:a3a2c61d83272b9b59a8ffe68bc39f4a57f31fbbdc98a5b99e7fef77b934500b"
---
# Predicate INPUT_FEATURE_COUNT

| | |
| --- | --- |
| id | `pred:INPUT_FEATURE_COUNT` |
| kind | **field** |
| route | **field** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [AlgorithmVersion](../nodes/AlgorithmVersion.md) |
| object types | (none) |
| literal forms | `valueNumber` |
| qualifiers | (none) |
| aliases | [AlgorithmVersion.inputFeatureCount](AlgorithmVersion.inputFeatureCount.md) |
| questions | (none) |

## Typed edge or Assertion only

FIELD predicate: an Assertion certifying a node field (`AlgorithmVersion.inputFeatureCount`); the value is written to the node and the Assertion carries its evidence.

## Write route

Proposal kinds: `node.upsert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#INPUT_FEATURE_COUNT`
