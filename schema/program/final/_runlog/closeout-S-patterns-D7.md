# Close-out: S final-SDL pattern writer, packet D7

2026-10-09. Worktree `biotech-knowledge-services-S` (branch ft/schema-S, base 31390a6). No SDL change, no commit.

## Inputs

- `final/_work/pattern-lint.json`, D7 entry: total 34, ok 24, failing 8, packetBug 1, rulingBroken 7, gds-unvalidated 2.
  - packetBug: Q-D7-04 (EXPLAIN type mismatch on `inv`). The owner fixed it in A6. It is an uncommitted edit at lines 310–311 and is the only diff in `packets/D7/03-retrieval-patterns.md`.
  - rulingBroken (7):
    - CQ-CL-05 L23 and Q-D7-06 L354: R-19 pendingEdit. T was not read from the OCCURS_IN MediaWork's `publishedAt`.
    - CQ-EC-04 L166, Q-D7-22 L698 and Q-D7-25 L764: R-80. The pattern uses AUTHORED, which is retired. It becomes AUTHORED_BY.
    - Q-D7-02 L263 and Q-D7-08 L411: R-30. `r.roleTitleVerbatim` is not on RoleEdgeProperties.
  - gds-unvalidated: Q-D7-03 and Q-D7-23 are discovery variants. They are not ruling-broken and are left as they are.
- Owner patterns: `biotech-knowledge-services-A6/schema/program/packets/D7/03-retrieval-patterns.md` (HEAD 2ca247a plus the Q-D7-04 fix). The lint line numbers still match the file (checked with `sed -n` on lines 166, 263, 411, 698 and 764).
- Final SDL: `final/schema/final_biotech_schema_v2.graphql`, sha256 c7cf1235dba876b2…4793. Checked by hand:
  - MediaWork has `publishedAt` and `publishedAtPrecision`. It also has `occurrences` (OCCURS_IN, IN) and `renditions` (RENDITION_OF, IN).
  - Assertion has `qualifiers`, `validObservedAt`, `polarity`, `speechAct` and `assertionKind`.
  - Assessment has `verdict`, `rationale`, `conclusionCode`, `facets`, `assessmentSubkind` and `recordedTo`.
  - Identifier has `scheme` and `value`.
  - `roleTitleVerbatim` is removed (SDL comments at lines 4648 and 6947).
- Predicate registry `final/vocabularies/predicates.yaml`:
  - AUTHORED_BY (D3): subject Publication, Protocol or ProtocolEdition; object Person or Organization.
  - AUTHORED is `alias-of:AUTHORED_BY`, kind retired.
  - DISCLOSES_INTEREST (D9): subject MediaWork, Organization, Person or Publication; object Organization.
  - FUNDED_BY (D3): Publication → Organization.
  - INVENTOR_ON_PATENT_ASSIGNED_TO (D7): Person → Organization.
  - NOMINATES_DIRECTOR (D7): Organization → Person.
- Rulings: `_work/rulings.yaml` lines 68, 71, 73, 134 and 207–209 (R-19, R-80 and R-82), and line 3598 for R-30 `roleText:`. Also decision-report R-19, R-30, R-80 and R-82.

## Output

`final/patterns-by-question/D7.md` has a header with counts and a per-question table, then 7 sections:

- CQ-CL-05 (R-19, plus R-82)
- CQ-EC-04 (R-80, plus R-82)
- Q-D7-02 (R-30)
- Q-D7-06 (R-19, plus R-82)
- Q-D7-08 (R-30)
- Q-D7-22 (R-80)
- Q-D7-25 (R-80)

All 7 are rewritten. None is answered through another path, and none is lost. The kernel TRACE chain is kept in every section.

The file was already present at the start of this pass (03:06, written by an earlier pass in this role). This pass reviewed it against the lint, the owner file, the SDL and the predicate registry, made no content edits, and re-ran the validator with `--fill`.

## Validator

I reused the shared `final/_work/validate-by-question.mjs` without changing it.

```
cd C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --packets D7 --fill
# D7: {"questions":7,"ok":7,"failing":0,"gdsUnvalidated":0,"fragment":0,"statements":7,"statementsExplainOk":7,"staticFindings":0}
# every statement: EXPLAIN ok (Neo4j 5.26.31 community, bks-neo4j-synth, bolt://localhost:7691)

node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --out <scratchpad>/bq-all   # all files, no fill
# D13 4/4 ok, D2 2/2 ok, D3 2/2 ok (3 statements), D5 3/3 ok, D7 7/7 ok; 0 static findings
```

The report is at `final/_work/by-question/D7.json`.

## Open items (reported, not acted on)

- The D7 Attia fixture names a "D9 container" in a comment but writes no MediaWork, OCCURS_IN or RENDITION_OF. On that fixture, Q-D7-06 and CQ-CL-05 take the snapshot fallback (`tBasis = SNAPSHOT_FALLBACK`). This is a pending fixture edit. It is not in the FU-03 table in `fixtures/README.md`, so it goes to the coordinator or the fixture editor.
- The validator checks that each predicate is registered. It does not check the subject/object slot order. AUTHORED_BY (Publication subject, Person object) was checked by hand.
