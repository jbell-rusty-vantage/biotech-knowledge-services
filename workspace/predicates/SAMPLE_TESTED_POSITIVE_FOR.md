---
id: "pred:SAMPLE_TESTED_POSITIVE_FOR"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#SAMPLE_TESTED_POSITIVE_FOR"]
aliases: ["sample tested positive for","SAMPLE_POSITIVE_OUTBREAK_STRAIN","sample positive outbreak strain"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:8c708d4e17d1b19a742e4722ddebce75141df61a7520357d17047904e243289c"
---
# Predicate SAMPLE_TESTED_POSITIVE_FOR

| | |
| --- | --- |
| id | `pred:SAMPLE_TESTED_POSITIVE_FOR` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [Lot](../nodes/Lot.md), [Product](../nodes/Product.md) |
| object types | [Taxon](../nodes/Taxon.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | [SAMPLE_POSITIVE_OUTBREAK_STRAIN](SAMPLE_POSITIVE_OUTBREAK_STRAIN.md) |
| questions | (none) |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'SAMPLE_TESTED_POSITIVE_FOR'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named SAMPLE_TESTED_POSITIVE_FOR.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#SAMPLE_TESTED_POSITIVE_FOR`
