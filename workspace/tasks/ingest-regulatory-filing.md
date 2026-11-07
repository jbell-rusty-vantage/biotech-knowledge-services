---
id: "task:ingest-regulatory-filing"
kind: "task"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/task-routes.yaml#ingest-regulatory-filing"]
aliases: ["ingest-regulatory-filing","ingest regulatory filing"]
capabilities: ["get","slice","propose:node.upsert","propose:edge.assert","propose:identifier.attach","propose:assertion.literal"]
cardDigest: "sha256:5251bb5bb3940de671e00a5ae1a2751969266a9d9825419791b2edf1989d5153"
---
# Task: Ingest a regulatory record (filing, letter, recall, inspection) and the status it establishes

Id `task:ingest-regulatory-filing` · phase **ingestion** · domains [manufacturing-quality-regulatory-ip](../domains/manufacturing-quality-regulatory-ip.md) · write route

The document is a RegulatoryRecord (recordKind, pathway, jurisdiction) ADDRESSED_TO the organization and CONCERNS its topic; a resulting standing is a LegalStatus episode (STATUS_OF its subject, STATUS_FROM the record); filing never implies capability or approval.

## Elements

- Node types: [RegulatoryRecord](../nodes/RegulatoryRecord.md), [LegalStatus](../nodes/LegalStatus.md), [Organization](../nodes/Organization.md), [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Product](../nodes/Product.md)
- Relationship types: [ADDRESSED_TO](../relationships/ADDRESSED_TO.md), [ISSUED_BY](../relationships/ISSUED_BY.md), [CONCERNS](../relationships/CONCERNS.md), [STATUS_OF](../relationships/STATUS_OF.md), [STATUS_FROM](../relationships/STATUS_FROM.md)
- Read operations (`bks kg read`): `node.resolve`, `node.list`
- Proposal kinds (`biotech-knowledge-intent.v2`): `node.upsert`, `edge.assert`, `identifier.attach`, `assertion.literal`
- Pending proposal kinds: (none)

## Steps

1. Resolve the subject (substance, material, product) and the issuing agency (Organization).
2. Create the RegulatoryRecord with the agency's record identifiers (FDA_GRN, FDA_NDI, FDA_RECALL ...; active schemes only).
3. `edge.assert` STATUS_OF from a create-only LegalStatus with jurisdiction and validity from the record, and STATUS_FROM to the record.

## Pitfalls

- A GRAS no-questions letter is not approval; an NDI acknowledgement is not approval; licence validity never implies marketed (status non-implication policy).
- An EFSA opinion alone is not an EU authorization (MD-D8-03); keep each source date with its semantic role (MD-D8-05).

## Mandatory rules for this route

- [identity-rules](../rules/identity-rules.md)
- [ingestion-rules](../rules/ingestion-rules.md)
- [temporal-rules](../rules/temporal-rules.md)
- [evidence-path](../rules/evidence-path.md)

A budgeted slice keeps these rules even beyond its budget: `bks-schema slice --tasks ingest-regulatory-filing --out <dir>`.

## v1 navigation aliases

(none)
