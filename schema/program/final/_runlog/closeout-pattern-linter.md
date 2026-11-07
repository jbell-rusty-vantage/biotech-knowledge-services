# Close-out round: pattern linter (S), 2026-10-09

Role: PATTERN LINTER. Scope: FU-04 (packet pattern rewrites the rulings require). No SDL change; nothing committed (the coordinator commits).

## Deliverables

- `final/_work/lint-packet-patterns.mjs`: reproducible linter (Node 22+, `neo4j-driver` from `packages/kg-ops`, `graphql` and `yaml` from `packages/schema-workspace`).
- `final/_work/pattern-lint.json`: full report (inputs with sha256 and worktree HEADs, self-check, per-block statements, findings, classes, FU-04 confirmation).
- `final/_work/pattern-lint.md`: readable report (summary, FU-04 table, inline-code prose findings, rulings.yaml edit-pattern ops, then one table per packet: line, question, class, reason).

## Inputs

- Packet patterns, SDLs and 05 registers are read from the owner worktrees `biotech-knowledge-services-A1` … `-A8` (K→A1, D10→A1, D1→A2, D12→A2, D2→A3, D4→A3, D3→A4, D5→A5, D6→A6, D7→A6, D8→A7, D13→A7, D9→A8, D11→A8), never from the S copies. The S copies of `03-retrieval-patterns.md` were confirmed byte-identical to the owner copies (`diff -q`, 14 of 14 "same").
- Final: `final/schema/final_biotech_schema_v2.ir.json` (relationship triples, labels, properties, enums) and the printed SDL (self-check only); `final/relationship-register.yaml`; `final/vocabularies/predicates.yaml` when present (it appeared during this round from the predicate-registry role; the run used sha256 f3465df9…080d2, recorded in the JSON); `_work/rulings.yaml`; `decision-report.md`; DDL from `_work/patterns-ddl.cypher` and the D-1, D-3 and D-4 blocks of `query-patterns.md`.

## Commands

```bash
# environment (container state before the runs)
docker exec bks-neo4j-synth cypher-shell -u neo4j -p bks-test-password "CALL dbms.components() YIELD versions, edition RETURN versions, edition; MATCH (n) RETURN count(n); SHOW INDEXES YIELD name RETURN count(*); SHOW CONSTRAINTS YIELD name RETURN count(*);"
#   5.26.31 community; 0 nodes; 2 indexes (the default lookup indexes); 0 constraints

# static-only development runs
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --no-db --json <scratch>/nodb.json --md <scratch>/nodb.md

# final run (EXPLAIN on bks-neo4j-synth; writes final/_work/pattern-lint.{json,md}; drops the DDL it created)
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs
#   ~55 s; exit 0

# container state after the run
docker exec bks-neo4j-synth cypher-shell -u neo4j -p bks-test-password "SHOW INDEXES YIELD name RETURN count(*); SHOW CONSTRAINTS YIELD name RETURN count(*);"
#   2 indexes, 0 constraints (as found)
```

## Key output (final run, 2026-10-09T06:48Z)

- Self-check: the linter's SDL reader on the printed final SDL reproduces the IR exactly (labels, 106 relationship types' triples, node properties): 0 differences. The packet world (14 owner SDLs) has the same 69 node-type and 106 relationship-type names as the final schema, so ruling breakage shows up as cut pairs, removed properties, enum values, retired predicates and pending pattern edits, not as renamed types.
- DDL: 299 statements executed, 298 accepted (229 generated + 32 D-1 + 14 D-3 + 3 D-4 + packet DDL). The one error is D9 03 line 42 (`CYPHER 25` vector index with an in-index `WITH [...]` filter, 2026.01+ syntax). 282 indexes/constraints created by the run were dropped afterwards.
- 505 blocks: ok 297, fragment 31, gds-unvalidated 6, packetBug 113, rulingBroken 58; failing 171. 24 packetBug blocks also carry ruling-level findings. 76 blocks start with `CYPHER 25` (K 35, D11 30, D9 5, D1/D3/D4/D8/D10/D13 1 each); 46 packetBug blocks have that prefix as their only problem.

| packet | blocks | failing | packetBug | rulingBroken | fragment | gds-unvalidated | ok |
| --- | --- | --- | --- | --- | --- | --- | --- |
| K | 36 | 35 | 35 | 0 | 0 | 0 | 1 |
| D1 | 36 | 9 | 6 | 3 | 2 | 0 | 25 |
| D2 | 39 | 5 | 3 | 2 | 10 | 1 | 23 |
| D3 | 33 | 6 | 5 | 1 | 1 | 1 | 25 |
| D4 | 38 | 3 | 3 | 0 | 2 | 1 | 32 |
| D5 | 35 | 4 | 2 | 2 | 7 | 1 | 23 |
| D6 | 41 | 8 | 3 | 5 | 4 | 0 | 29 |
| D7 | 34 | 8 | 1 | 7 | 0 | 2 | 24 |
| D8 | 35 | 8 | 2 | 6 | 2 | 0 | 25 |
| D9 | 40 | 30 | 5 | 25 | 1 | 0 | 9 |
| D10 | 37 | 7 | 4 | 3 | 0 | 0 | 30 |
| D11 | 30 | 30 | 30 | 0 | 0 | 0 | 0 |
| D12 | 36 | 9 | 9 | 0 | 2 | 0 | 25 |
| D13 | 35 | 9 | 5 | 4 | 0 | 0 | 26 |

Rulings named on ruling-broken blocks (count of blocks): F-05 30 (D9's `ClaimOccurrence` label), R-30 11, R-42 7, R-44 5, R-80 5, R-68 4, and 1–2 each for R-15, R-19, R-21, R-43, R-47, R-52, R-59, R-62, R-66, R-72, R-73, R-82, R-83, R-89, R-93, R-94, R-95, R-09.

## FU-04 items (all detected)

| item | detected | where |
| --- | --- | --- |
| R-42 shared-Identifier joins | yes | D3 CQ-EV-05 (two joins, line 231, 239), D11 CQ-PV-05 (section intent); also D1 CQ-ID-04, D5 Q-D5-20, D9 Q-D9-13, D11 Q-D11-05, Q-D11-19 |
| R-83 guideline branches | yes | D10 Q-D10-03, Q-D10-08 (RECOMMENDS_AGAINST with a Target; register ruleNote) |
| R-94 stale names | yes | D10 line 744 (trace prose `D9 Episode/Publication`); D13 line 188 already applied in the owner copy (no DocumentTextVersion / Episode below the header); the block there still fails on `CYPHER 25` + `SEARCH` |
| R-89 Q-D2-21 | yes | HOLDS_EQUITY_IN, CONSULTS_FOR, INVENTOR_OF_PATENT_LICENSED_TO unregistered (predicates.yaml maps them to HOLDS_STAKE / HOLDS_ROLE / RECEIVES_VALUE_FROM) |
| R-47 Q-D2-18 | yes | AFFECTS_MECHANISM ranking; `r.nNoChangeContexts` not on MechanismProjectionProperties |
| R-30 Q-D6-01 | yes | `c.declaredNameVerbatim`; same property also in D1 CQ-PF-01, CQ-ID-03 and D6 CQ-PF-01, CQ-AX-25, Q-D6-08, Q-D6-10, Q-D6-11, D12 Q-D12-18; `roleTitleVerbatim` in D7 Q-D7-02, Q-D7-08 |
| R-09 CQ-AX-04 | yes | EMPTY_RESULT in the section's pattern line (the block is also `CYPHER 25`) |
| fix-1 HAS_IDENTIFIER direction | yes | D1 214, 234, 460, 666, 670; D2 433; D12 153, 761 (blocks) and D12 3 (inline code in the preamble); also D4 Q-D4-09 line 382 (not in the FU-04 list) |
| fix-2 RESULT_FOR | yes | D12 Q-D12-03, Q-D12-06 (pair absent at packet level too: D8 declares QUALITY_RESULT_FOR; related R-95) |
| fix-3 Q-D8-23 | yes | STATUS_OF → Device and CONCERNS → Device (R-72) |
| fix-4 Q-D2-16 | yes | (Assessment)-[:ASSESSES]->(Assertion); the same pair in D13 Q-D13-17, Q-D13-24 |
| CYPHER 25 prefix | yes | 76 blocks |

## Design decisions and limits

- Packet level = the owner packet SDL + the K kernel, with sibling packet SDLs accepted for seam names (a seam name is noted, not failed). A name, pair, property or predicate that no packet declares is a packetBug; one the packets declare but the final schema (or `predicates.yaml`) does not is rulingBroken.
- `ClaimOccurrence` is documented in K's Assertion docstring ("stored extra label") but declared by no `@node`; the linter accepts docstring-documented extra labels for the packet world, so D9's 30 uses classify as rulingBroken under F-05 rather than packetBug.
- Macros are expanded from the Conventions definitions (D3 ASOF/VALID/LIVE, D10 ASOF/VALIDAT, D12 AS_OF/AS_OF_REC, D8 AS_OF/KNOWN_AT; TRACE becomes a unique null). A question block that elides a convention fragment (`// + TRACE(a)`, `// DOSE`) and reads its variables cannot be planned; it is a fragment unless its static findings classify it.
- Statements are split at `;` and, for blocks holding several queries without `;`, at a new top-level clause after a top-level RETURN. Templates with `<PLACEHOLDER>` (K line 27–28) are not run.
- GDS: `gds.graph.project(...)` source queries are EXPLAINed after rewriting the call to a map literal; `CALL gds.*` and statements reading columns a GDS call yields are gds-unvalidated.
- Edit-pattern ops in `rulings.yaml` are tested textually against the owner section (the PENDING table); R-19 Q-K-09 has no textual marker and is reported "not testable". Q-D4-10 (R-94) is applied in the owner copy.
- Prose checks: module-qualified type names in a block's trace lines and comments (`D9 Episode`), and backtick Cypher in 03 prose outside fences (direction, pair, type, label only). Both are reported separately and not counted as failing blocks.
- Static analysis is regex-based. Variables are scoped per UNION branch; a variable re-bound by `expr AS v` is not type-checked after that. Variable-length patterns are checked for type names only, not for endpoint pairs.
