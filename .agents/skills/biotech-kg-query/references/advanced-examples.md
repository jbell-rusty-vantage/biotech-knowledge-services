# Advanced reads, measured

Measured on the S4 fixture graph (synthetic; Neo4j 5.26.31, local disposable containers capped at 1.5 GiB / 256 MiB page
cache), 2026-10-12, by `packages/kg-ops/src/read/read.integration.test.ts` (Community, run `rmv4oh5gq`) and
`read-enterprise.integration.test.ts` (Enterprise, reader principals, run `emv4opu14`). Times are service wall time
(parse + EXPLAIN + execute + serialize), not database-only time. They are orientation, not budgets.

| read | route | measured | notes |
| --- | --- | --- | --- |
| label versions of a package (6.1 example) | ad hoc artifact, `bks_reader_internal` | 93 ms | uid seek + one hop; ordering `statement` |
| claims a maker states, with denials (`advanced-maker-claims-with-denials`) | ad hoc artifact, `stable_revision` | 221 ms | fence probe before/after in the same transaction; COUNT subquery |
| 120 supported catalog templates, first execution each | templates, scope internal | median 120 ms, p90 315 ms, max 1.27 s | cold plan cache; heavy templates (D9/Q-D9-02, D9/Q-D9-13, D10/Q-D10-03) plan in 0.4-1.7 s here, up to 15 s with the full DDL on a loaded host (S1 observation) |
| D9/Q-D9-02 released vs corrected (P-09 `behind` set) | EXPLAIN cold | 1.65 s vs 1.77 s plan, 176 ms vs 153 ms warm run | corrected removes the `*0..4` VarLengthExpand; neither has AllNodesScan |
| overflow probe on a 4-way Entity product (billions of rows) | streaming boundary | < 5 s to return 10 rows + probe | the remaining rows are never produced |
| deadline on a 4-way product filter | ad hoc artifact, timeoutMs 800 | failed TIMEOUT after about 1.0 s | client deadline returns without waiting for the server |

Tuning order when a read is slow (load `neo4j-query-tuning-skill` only after stating the overrides in
vendor-overlay.md): anchor on a uid or identifier (`(x:Label {uid: $u})` seeks the per-label uid constraint), name
relationship types and direction, bound variable lengths, push filters into the pattern, aggregate with COUNT / COLLECT
subqueries instead of collecting whole lists, project only the columns you need. EXPLAIN (`POST /kg/read/explain`) shows
the plan operators; it is not a cost or correctness certificate. PROFILE is not offered on the read routes.

Known costly templates (planning dominated, first execution): D9/Q-D9-02, D9/Q-D9-13, D10/Q-D10-03, D10/Q-D10-08.
Give them `limits.timeoutMs` 20000 on a cold service; a stall returns `failed TIMEOUT`, never hangs the caller.
