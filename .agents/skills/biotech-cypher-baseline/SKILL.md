---
name: biotech-cypher-baseline
description: >-
  Baseline comparison tools: explore the BellLabs biotech Neo4j graph with ad hoc Cypher (read, explain,
  database introspection) and, when a comparison run explicitly allows it, write with ad hoc Cypher under
  the delete caps. Use only in baseline/eval runs that compare "agent writes Cypher" against the intent
  executor (biotech-kg-ingest), or for bounded read-only exploration the typed reads cannot express.
  Ad hoc results are never evidence and ad hoc writes carry no receipt beyond the guard's counters.
allowed-tools:
  - Bash(bks cypher *)
  - Bash(node packages/kg-ops/dist/cli.js cypher *)
---

# biotech-cypher-baseline — the un-typed path, guarded

`bks cypher read "<cypher>"` runs one statement in a read transaction (row cap, timeout).
`bks cypher explain "<cypher>"` returns the plan. `bks cypher introspect` lists labels, relationship
types, label counts and indexes **of the database** (what exists), as opposed to the schema workspace
(what may exist). `bks cypher write "<cypher>" [--allow-deletes]` runs one statement in a write
transaction that the guard rolls back when it deletes anything without `--allow-deletes`, or more than
the caps (`BKS_CYPHER_MAX_DELETED_NODES`, default 5; `BKS_CYPHER_MAX_DELETED_RELATIONSHIPS`, default 25).
Run from the repository root (`node packages/kg-ops/dist/cli.js cypher …`).

## What the guard refuses outright (any mode)

DDL (`CREATE/DROP INDEX|CONSTRAINT`, `ALTER`), `LOAD CSV`, `CALL { } IN TRANSACTIONS`, admin/bulk APOC
(`apoc.periodic`, `apoc.trigger`, `apoc.load/export/import/refactor`), DBMS security procedures,
multiple statements per request, private-personal uid prefixes, and unfiltered `MATCH () DELETE`.
Read mode also refuses `CREATE/MERGE/SET/DELETE/REMOVE/FOREACH`.

## Baseline-run rules (so the comparison is fair and the graph survives)

1. **Same task, same evidence.** Use the same source captures and the same mission brief the intent path got. Write the Source / SourceSnapshot / SourceLocator nodes yourself if you want your facts to be traceable; the executor does this for the intent path automatically.
2. **Kernel rules still apply, by hand.** Every stored node needs `uid` (`hu:<token>:<opaque>`, token per type from `schema/pinned/release/validation/validation-params.json#uidTypeTokens`), `id` (the opaque segment), the v2 stored labels from the node register (no v1 archetype marker properties), `createdAt`, `updatedAt`, `lastWriterRunId`. Asserted edges need an `Assertion` (`HAS_SUBJECT`, `HAS_OBJECT`, `HAS_EVIDENCE {role, origin}` to a `SourceLocator`, `ASSERTED_BY`, `WAS_GENERATED_BY`) and `relationshipUid`, `assertionUid`, `validFromBasis`, `validToBasis`, `recordedFrom` on the edge. The scorer checks these.
3. **Bounded reads.** Always `LIMIT`; `--row-cap` defaults to 200.
4. **No deletes unless the task says so**, and then `--allow-deletes` with a filtered pattern and a `LIMIT`. Big deletes are refused.
5. **Record everything.** Save each request and result (`--out`) under the run folder; the eval harness (`evals/baseline-comparison`) reads them.
6. **Stop at the first guard error.** Diagnostics explain the refusal; rewrite rather than retry verbatim.

## Useful shapes

```cypher
// what is stored for a uid
MATCH (n {uid: $uid}) OPTIONAL MATCH (n)-[r]-(m) RETURN n, type(r) AS t, m.uid AS other LIMIT 50
// which labels carry a property
MATCH (n) WHERE n.canonicalUri IS NOT NULL RETURN labels(n) AS labels, count(*) AS c ORDER BY c DESC LIMIT 20
// assertions about a node with their locators
MATCH (a:Assertion)-[:HAS_SUBJECT]->(n {uid: $uid}) OPTIONAL MATCH (a)-[:SUPPORTED_BY]->(l) RETURN a.uid, a.predicate, a.status, collect(l.uid) AS locators LIMIT 50
```

## MCP equivalents

`cypher_run` (modes read/write/explain) and `cypher_introspect` on the executor MCP server.
