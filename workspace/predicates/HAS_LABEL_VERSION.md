---
id: "pred:HAS_LABEL_VERSION"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_LABEL_VERSION"]
aliases: ["has label version"]
capabilities: ["get","neighbors","propose:state.attach"]
cardDigest: "sha256:6348af73d698b16001463d35cbbf980025377fd648d4248ea85ca62f27cfe344"
---
# Predicate HAS_LABEL_VERSION

| | |
| --- | --- |
| id | `pred:HAS_LABEL_VERSION` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [Package](../nodes/Package.md) |
| object types | [LabelVersion](../nodes/LabelVersion.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-AX-06`, `CQ-AX-17`, `CQ-AX-19`, `CQ-AX-25`, `CQ-ID-02`, `CQ-ID-05`, `CQ-MX-04`, `CQ-PF-01`, `CQ-PF-02`, `CQ-PF-03`, `CQ-PV-04`, `CQ-ST-02`, `Q-D11-11`, `Q-D11-12`, `Q-D11-21`, `Q-D6-01`, `Q-D6-02`, `Q-D6-08`, `Q-D6-09`, `Q-D6-10`, `Q-D6-11`, `Q-D6-12`, `Q-D6-21` |

## Typed edge or Assertion only

A typed edge exists: [HAS_LABEL_VERSION](../relationships/HAS_LABEL_VERSION.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'HAS_LABEL_VERSION'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `state.attach`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_LABEL_VERSION`
