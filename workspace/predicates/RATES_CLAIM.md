---
id: "pred:RATES_CLAIM"
kind: "predicate"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#RATES_CLAIM"]
aliases: ["rates claim","STATES_REGULATORY_STATUS","states regulatory status"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:118f43e2205a7becb29ca566ff0b433a7deae242875bd36df438ae55aae7d76e"
---
# Predicate RATES_CLAIM

| | |
| --- | --- |
| id | `pred:RATES_CLAIM` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [K](../modules/K.md) |
| subject types | [Claim](../nodes/Claim.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | [STATES_REGULATORY_STATUS](STATES_REGULATORY_STATUS.md) |
| questions | `CQ-MF-06`, `Q-D4-08`, `Q-D8-02`, `Q-D8-03`, `Q-D8-05`, `Q-D8-08`, `Q-D8-16`, `Q-D8-18`, `Q-D8-21`, `Q-D8-23`, `Q-K-23`, `Q-K-27` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#RATES_CLAIM`
