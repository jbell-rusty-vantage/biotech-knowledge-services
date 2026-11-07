---
id: "pred:PARTICIPATES_IN"
kind: "predicate"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#PARTICIPATES_IN"]
aliases: ["participates in"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:fc188bd28d5a957d2da939cd9e7c7f1bc7948d14b3aec21360886060c6d26e0a"
---
# Predicate PARTICIPATES_IN

| | |
| --- | --- |
| id | `pred:PARTICIPATES_IN` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D2](../modules/D2.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [MolecularEntity](../nodes/MolecularEntity.md) |
| object types | [Mechanism](../nodes/Mechanism.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-MX-01`, `Q-D1-08`, `Q-D2-02`, `Q-D2-03`, `Q-D2-08`, `Q-D2-11`, `Q-D2-13`, `Q-D2-14`, `Q-D2-19`, `Q-D2-26`, `Q-D4-01`, `Q-D4-17` |

## Typed edge or Assertion only

A typed edge exists: [PARTICIPATES_IN](../relationships/PARTICIPATES_IN.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'PARTICIPATES_IN'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#PARTICIPATES_IN`
