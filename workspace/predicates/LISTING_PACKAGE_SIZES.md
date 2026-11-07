---
id: "pred:LISTING_PACKAGE_SIZES"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#LISTING_PACKAGE_SIZES"]
aliases: ["listing package sizes"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:27cf9983e2abfe7b84f73d47e5aa8d5527a5001705a51b081d1842cf00f0a31c"
---
# Predicate LISTING_PACKAGE_SIZES

| | |
| --- | --- |
| id | `pred:LISTING_PACKAGE_SIZES` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [CertificationListing](../nodes/CertificationListing.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-PF-03b` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#LISTING_PACKAGE_SIZES`
