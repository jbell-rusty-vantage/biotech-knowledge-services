---
id: "pred:PARENT_TAXON"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#PARENT_TAXON"]
aliases: ["parent taxon"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:b48526d0448345ae563d2e45ad7e4aeb394048737d3f5c236e765e30fb3cf1fc"
---
# Predicate PARENT_TAXON

| | |
| --- | --- |
| id | `pred:PARENT_TAXON` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | [Taxon](../nodes/Taxon.md) |
| object types | [Taxon](../nodes/Taxon.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D1-11`, `Q-D1-14`, `Q-D1-15` |

## Typed edge or Assertion only

A typed edge exists: [PARENT_TAXON](../relationships/PARENT_TAXON.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'PARENT_TAXON'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#PARENT_TAXON`
