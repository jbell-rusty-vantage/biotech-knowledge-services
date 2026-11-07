# Empty, unknown, truncated: what to say

| result | what it means | what to tell the user / next step |
| --- | --- | --- |
| `empty` | the read ran and no record visible to this binding matches | "The graph holds no record of X (as of <readInterval>, release <id>)". Not "X does not exist in the world". If the scope is public, internal records may exist |
| `ok` with `gaps` | records exist but evidence/adjudication/time is missing | name the gaps: unadjudicated, no declared span, valid time unknown, lineage not visible |
| row `emptyAnswerKind` (CQ-AX-04 family) | ANSWERED / MEASURED_ABSENT / NOT_REPORTED / BLOCKED / SEARCHED_NOTHING_FOUND / UNKNOWN | quote the kind: "not reported by the label" differs from "never searched" |
| `evidenceState: UNKNOWN` | the snapshot or source is not visible | evidence status unknown, not absent |
| `truncated` ROW_CAP | more rows exist (overflow probe) | page (`list.after`), narrow, or raise rowCap within the ceiling; never present a prefix as complete |
| `truncated` BYTE_CAP | the next row would exceed the byte cap | project fewer columns |
| `truncated` LIST_CAP | a collected list was cut (path in the reason) | aggregate counts instead of lists, or page |
| `failed` TIMEOUT | the deadline ended the transaction | narrow the anchor; reduce depth; this is not "no result" |
| `failed` NESTING_CAP / RESULT_SCHEMA_MISMATCH / DATABASE_ERROR / PARSE_REJECTED | the read did not produce an answer | fix the artifact |
| `skipped` | not executed (CONCURRENCY_LIMIT, an earlier part aborted the transaction) | retry later; nothing is known |
| `unsupported` | the capability is absent (vectors, GDS, ontology expansion, no read-only principal for ad hoc Cypher) | use another route; nothing is known |
| `stale` | RELEASE_MISMATCH, CATALOG_MISMATCH, or STALE_REVISION (stable_revision: the graph kept changing) | re-pin / re-fetch / retry |
| `forbidden` | outside the scope, policy or database privileges | do not retry with another tool; ask for the right binding/grant |

`ambiguous` identity: present the candidates with their basis and identifiers; never merge or pick by name.

Per-operation status is authoritative: read `parts[].status` for each operation. The top-level `status` summarizes
the parts that answered (truncated if any answered part is truncated, else ok if any has rows, else empty); a
refused or failed operation never turns the other operations' answers into `forbidden` / `failed` / `skipped`. Only
request-wide refusals (binding, release pin, concurrency, stable_revision staleness) set the top level for all parts.

Budgets: `limits.timeoutMs` is per operation. In `observed` mode each operation runs in its own read transaction
(own budget, own transient retries, bookmarks chained); in `stable_revision` all operations share one transaction
whose budget is `timeoutMs` x the number of operations (one revision for all parts, so a timeout fails them together).
An unreachable database fails at the budget (`failed TIMEOUT`), including connection acquisition.
