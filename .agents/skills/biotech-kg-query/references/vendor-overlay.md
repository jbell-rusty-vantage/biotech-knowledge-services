# Vendor overlay (state before loading a vendored Neo4j skill)

Source of the overrides: `docs/plans/schema-v2-service-release/SKILL-REVIEW.md` section 3 and
`.agents/skills/skill-routing.json` (`read.familiar`, `read.advanced`). Routes that may load vendor skills on demand:
`neo4j-cypher-skill` (read.familiar: only `references/syntax-traps.md` to understand a template; read.advanced: to
draft one parameterized read) and `neo4j-query-tuning-skill` (read.advanced: only when EXPLAIN shows a budget risk).
The vendored files are unmodified upstream copies; these rules win wherever they disagree.

| Override | Vendor guidance | Rule for Biotech reads |
| --- | --- | --- |
| OV-CYPHER-VERSION | `CYPHER 25` as first token; GQL clauses | Cypher 5 only. `CYPHER 5` prefix allowed. `CYPHER 25`, `LET`, `FILTER`, `FINISH`, `WHEN`, `NEXT`, `INSERT`, `SEARCH` are refused by the read policy (CLAUSE_FORBIDDEN / PARSE_REJECTED) |
| OV-SCHEMA-SOURCE | read `*-schema.json` or `db.schema.*` | The pinned release (`/describe`, biotech-schema-context.v1) is the schema. `db.schema.*` / `db.labels()` are refused procedures; the live graph also holds legacy v0 records that would mislead |
| OV-ELEMENT-ID | `elementId(n)` as an address | Not identity (every elementId changed across the S8 restore). Use `uid`; `elementId()` / `id()` are refused functions |
| OV-READ-ROUTING | READ session / `executeRead` = read-only | Routing only. Read-only effect comes from the database principal (`bks_reader_*` roles); without a proven principal arbitrary Cypher is `unsupported` |
| OV-GENERIC-WRITES | MERGE / CREATE / SET / DELETE / LOAD CSV examples | Never in a read artifact (refused by the parser policy and by the role). Canonical writes go intent -> plan -> apply (biotech-kg-ingest) |
| OV-VECTOR-SEARCH | `SEARCH`, `db.index.vector.*`, `ai.text.*` | Native data vectors are disabled (OD-44): templates using them are `unsupported` (VECTOR_SEARCH_DISABLED) |
| OV-GDS-WRITEBACK | `gds.*` stream/write | Analytics are not a read route (biotech-graph-analyze; disabled this release) |

Also binding for reads: return projected release properties, never whole nodes (`properties(n)`, `{.*}`, `RETURN n` are
refused); every node pattern carries a release label; relationship patterns name release types and bounded lengths.
