---
id: "task:ingest-organization-profile"
kind: "task"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/task-routes.yaml#ingest-organization-profile"]
aliases: ["ingest-organization-profile","ingest organization profile"]
capabilities: ["get","slice","propose:node.upsert","propose:identifier.attach","propose:edge.assert","propose:assertion.literal"]
cardDigest: "sha256:0e4521f14c1490044aff733313aebff84d11403e934776dde79c4ddc3a480a9d"
---
# Task: Ingest an organization profile (roles, stakes, brands, control)

Id `task:ingest-organization-profile` · phase **ingestion** · domains [actors-and-institutions](../domains/actors-and-institutions.md) · write route

Organization identity by registry identifier (LEI, SEC CIK, ROR) or (normalized legal name, jurisdiction); people hold roles and stakes through asserted, time-bounded edges; field facts (headcount, HQ, status) are FIELD Assertions whose node values are caches.

## Elements

- Node types: [Organization](../nodes/Organization.md), [Person](../nodes/Person.md), [Brand](../nodes/Brand.md), [Award](../nodes/Award.md)
- Relationship types: [HOLDS_ROLE](../relationships/HOLDS_ROLE.md), [HOLDS_STAKE](../relationships/HOLDS_STAKE.md), [PARENT_OF](../relationships/PARENT_OF.md), [OWNS_BRAND](../relationships/OWNS_BRAND.md), [AWARDED_TO](../relationships/AWARDED_TO.md), [AWARDED_BY](../relationships/AWARDED_BY.md), [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md)
- Read operations (`bks kg read`): `node.resolve`, `node.card`, `state.asOf`
- Proposal kinds (`biotech-knowledge-intent.v2`): `node.upsert`, `identifier.attach`, `edge.assert`, `assertion.literal`
- Pending proposal kinds: (none)

## Steps

1. Resolve the organization; attach LEI / SEC_CIK / ROR identifiers (only writeStatus active schemes are accepted).
2. Roles are `edge.assert` HOLDS_ROLE with RoleEdgeProperties (roleKind) and validity from the source; the printed title is the qualifier roleText:<label>.
3. A former name is the FORMER_NAME literal predicate; a rename alone does not create a new Organization (MD-D7-10).

## Pitfalls

- Holding a role never implies recommending or endorsing the organization's product.
- A brand is its own Brand record; OWNS_BRAND needs ownership evidence, operating a brand is the OPERATED_BY predicate.

## Mandatory rules for this route

- [identity-rules](../rules/identity-rules.md)
- [ingestion-rules](../rules/ingestion-rules.md)
- [temporal-rules](../rules/temporal-rules.md)
- [evidence-path](../rules/evidence-path.md)

A budgeted slice keeps these rules even beyond its budget: `bks-schema slice --tasks ingest-organization-profile --out <dir>`.

## v1 navigation aliases

(none)
