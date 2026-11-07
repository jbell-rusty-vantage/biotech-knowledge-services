---
id: "pred:LISTING_LOT_SCOPE"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#LISTING_LOT_SCOPE"]
aliases: ["listing lot scope"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:49980cd4e0bc31769e50ae6ff593262109c15f878d166599e6f287c2bd73e781"
---
# Predicate LISTING_LOT_SCOPE

| | |
| --- | --- |
| id | `pred:LISTING_LOT_SCOPE` |
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

- `release:vocabularies/predicates.yaml#LISTING_LOT_SCOPE`
