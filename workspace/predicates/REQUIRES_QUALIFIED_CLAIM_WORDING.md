---
id: "pred:REQUIRES_QUALIFIED_CLAIM_WORDING"
kind: "predicate"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#REQUIRES_QUALIFIED_CLAIM_WORDING"]
aliases: ["requires qualified claim wording"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:8080de837d7abc6cff815b21f0062132f906a99d642414bf608616acee215bed"
---
# Predicate REQUIRES_QUALIFIED_CLAIM_WORDING

| | |
| --- | --- |
| id | `pred:REQUIRES_QUALIFIED_CLAIM_WORDING` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D10](../modules/D10.md) |
| subject types | [Claim](../nodes/Claim.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D10-09` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#REQUIRES_QUALIFIED_CLAIM_WORDING`
