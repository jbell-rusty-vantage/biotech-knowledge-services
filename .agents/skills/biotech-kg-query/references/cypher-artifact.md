# Cypher read artifact (biotech-cypher-read-intent.v1) and the read policy

Fields beyond the common envelope (see typed-operations.md):

| field | meaning |
| --- | --- |
| `language` | `CYPHER_5` (the only value) |
| `statement` | one Cypher 5 statement, UTF-8; exactly one of `statement` / `template` |
| `statementDigest` | optional `sha256:` of the exact statement bytes; must match when given |
| `template` | `{ id, statementDigest }` of a release catalog template (`GET /kg/catalog/templates`) |
| `parameters` | values; every `$param` must be declared and given, no extras |
| `parameterSchema` | `{ name: { type, items?, pattern?, neo4jType? } }`; `neo4jType: DateTime` binds an RFC 3339 string as a driver DateTime |
| `resultSchema.columns` | declared output columns in order (mismatch -> `failed` RESULT_SCHEMA_MISMATCH); or `resultSchemaRef` |
| `scope` | `{ labels[], relationshipTypes[], procedures[] }` the statement may use (subset of the release; empty = release) |
| `ordering` | `statement` (rows in final ORDER BY order; required) or `set` (rows sorted canonically for the digest) |

Who may run what:

| binding | typed | templates | ad hoc statements |
| --- | --- | --- | --- |
| scope internal, any database | yes | yes | only if the principal is proven read-only (`database-role`) |
| scope public, application visibility (Community, admin principal) | yes | `forbidden` VISIBILITY_UNPROVEN | `unsupported` / `forbidden` |
| scope public, `database-rbac` (Enterprise `bks_reader_public`) | yes | yes | yes |

The policy (`bks-cypher-read-policy.v1`) runs on the grammar parse tree of Neo4j's own parser
(`@neo4j-cypher/language-support` 2.0.0-next.37) as an allowlist of grammar rules plus semantic checks: release labels and
relationship types only; label negation/wildcards and dynamic labels refused; unlabelled node patterns only as a
reference to a labelled variable in scope (resolved by the parser's scope analysis); bounded lengths; pure-function
allowlist; procedure allowlist (`db.index.fulltext.queryNodes` on a release fulltext index); no whole-entity returns
(static check plus a serializer that refuses Node/Relationship/Path values even after aliasing); restricted and
operational properties refused. Before execution the service runs `EXPLAIN` in the same transaction and refuses
plans with write or side-effect operators. The database principal is the security boundary; the parser and EXPLAIN are
defense in depth. A refusal is `forbidden` with typed reasons; a syntax error is `failed` PARSE_REJECTED.

Ad hoc arbitrary reads are therefore unavailable on Community and on any binding whose principal can write; there the
supported routes are typed reads and (scope internal) the audited catalog templates.
