---
id: "task:attach-identifier"
kind: "task"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/task-routes.yaml#attach-identifier"]
aliases: ["attach-identifier","attach identifier"]
capabilities: ["get","slice","propose:identifier.attach"]
cardDigest: "sha256:d6378f5de730686663e04b931fbd083a9e63ae07fb40cc6227f7ada1ae229dce"
---
# Task: Attach an external identifier to a node

Id `task:attach-identifier` · phase **ingestion** · domains [kernel-and-provenance](../domains/kernel-and-provenance.md) · write route

An Identifier node is unique on (scheme, issuer, normalized value) and identifies at most one Subjectable; the HAS_IDENTIFIER edge is asserted (IdentifierLinkProperties) and cites the record where the identifier was read.

## Elements

- Node types: [Identifier](../nodes/Identifier.md)
- Relationship types: [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md)
- Read operations (`bks kg read`): `node.resolve`
- Proposal kinds (`biotech-knowledge-intent.v2`): `identifier.attach`
- Pending proposal kinds: (none)

## Steps

1. Use the release register's scheme code (vocabularies/identifier-schemes.yaml) and the issuing authority as issuer; only writeStatus active schemes are accepted.
2. Trade identifiers (GTIN, ASIN, SKU) are ordinary Identifiers in v2 (TradeItemIdentifier is gone); GTIN is normalized to GTIN-14 digits.

## Pitfalls

- Normalize before attaching (DOI lowercase, InChIKey uppercase) and name the rule in normalizationRule.
- Never join two records through a shared Identifier; renditions use RENDITION_OF.

## Mandatory rules for this route

- [identity-rules](../rules/identity-rules.md)
- [ingestion-rules](../rules/ingestion-rules.md)
- [temporal-rules](../rules/temporal-rules.md)
- [evidence-path](../rules/evidence-path.md)

A budgeted slice keeps these rules even beyond its budget: `bks-schema slice --tasks attach-identifier --out <dir>`.

## v1 navigation aliases

(none)
