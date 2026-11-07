# Stage: query patterns (S) — run log

Agent: S query-patterns, 2026-10-09 (UTC). Worktree `biotech-knowledge-services-S`, branch ft/schema-S. Writes: `final/query-patterns.md`, `final/_work/validate-patterns.mjs`, `final/_work/gen-patterns-ddl.mjs`, `final/_work/patterns-ddl.cypher`, this file. Scratch: `scratchpad/synth/qp/`. No `.env` values were read or printed. Paths passed to node use `C:/…` forms.

## Inputs read

- `.agents/skills/neo4j-cypher-skill/SKILL.md`, `neo4j-gds-skill/SKILL.md`, `neo4j-vector-index-skill/SKILL.md`.
- `fast-track/00-DIRECTIVE.md` (sections 1–5), `03-SYNTHESIS.md` (deliverable row `query-patterns.md`).
- `final/schema/final_biotech_schema_v2.ir.json` (digest `sha256:d233930272c7aaa75d9aac21103e83448bd96a79d1106c4749fb807f257dd705`), `final/decision-report.md` (R-01 … R-94 headings; R-04, R-12, R-13, R-17, R-19, R-22, R-27, R-47, R-48, R-49, R-50, R-68, R-75 … R-78, R-82 … R-85, R-91 in full), `final/_work/rulings.yaml`.
- Packets: `K/03-retrieval-patterns.md` (all), `D10/03-retrieval-patterns.md` (all), `D10/answer-kind-table.md` (summary + materialized rows); targeted sections of D2, D3, D4, D5, D7, D9, D12, D13 `03-retrieval-patterns.md`; scratch `inv/review-open-issues.json`.

## Commands and key output

1. `node scratchpad/synth/qp/dump.js` — compact dump of the IR → `scratchpad/synth/qp/schema-dump.txt` (79,834 B). IR arrays: nodes 69, relationshipTypes 106, unions 16, interfaces 2, edgePropertyTypes 20, enums 193.
2. IR classification (node one-liner over the IR): relClass asserted 64, derived 7, structural 35. By edge properties: validFrom+recordedFrom 26 types; recordedFrom only 37; DerivedEdge-style (derivedAt) 6; structural props only 28; no properties 9. Mismatches noted: MEASURES relClass derived with AssertedRecordedProperties; HAS_VARIANT, REQUIRES_INPUT_METRIC relClass asserted with StructuralEdgeProperties (open issue Q-3).
3. `docker ps` → `bks-neo4j-synth neo4j:5.26-community 0.0.0.0:7691->7687`; `CALL dbms.components()` → `Neo4j Kernel 5.26.31 community`; database empty (0 nodes), indexes `index_343aff4e`, `index_f7700477` (LOOKUP), 0 constraints.
4. cypher-shell probes: `CYPHER 25 EXPLAIN …` → "25 is not a valid option for cypher version. Valid options are: 5"; `CYPHER 5 EXPLAIN` ok; dynamic labels `$($label)` in MATCH ok; `CALL (n) {…}` ok; QPE `{1,4}` ok.
5. `node scratchpad/synth/qp/probe.mjs` (neo4j-driver from packages/kg-ops): COLLECT with UNION ok; QPE `-[:PARENT_OF]-{0,2}` ok; `OPTIONAL CALL` ok; `$asOf - duration({days: $days})` ok; `db.index.vector.queryNodes` and `db.index.fulltext.queryNodes` EXPLAIN ok; `CREATE VECTOR INDEX … vector.quantization.enabled/hnsw` ok; multi-label fulltext with list property ok; relationship-property index ok; composite uniqueness ok (all probe objects dropped).
6. `node scratchpad/synth/qp/probe2.mjs` — plan of `MATCH (x:$($label) {uid: $uid})`: `AllNodesScan → Filter x:$all($label)`; static label: `NodeUniqueIndexSeek`. (A third probe statement `WHERE x:$($label)` → SyntaxError "Dynamic Label and Types are only allowed in MATCH, CREATE, MERGE, SET and REMOVE clauses"; its probe constraint was dropped by probe3.)
7. `node scratchpad/synth/qp/probe3.mjs` — with a uniqueness constraint on a probe label, `MATCH (x:ProbeEntity {uid:$uid})<-[:HAS_SUBJECT]-(a:Assertion)` plans `NodeUniqueIndexSeek`; afterwards SHOW CONSTRAINTS → [] and SHOW INDEXES → the two lookup indexes (clean).
8. `node schema/program/final/_work/gen-patterns-ddl.mjs C:/…/final/schema/final_biotech_schema_v2.ir.json C:/…/final/_work/patterns-ddl.cypher` →
   `{"schemaDigest":"sha256:d2339302…dd705","uidConstraints":69,"relAssertionIndexes":63,"relWriterIndexes":97,"statements":229}`; file 233 lines.
9. Negative control: `node …/validate-patterns.mjs --doc scratchpad/synth/qp/negative-control.md` → NEG-1 `Neo.ClientError.Statement.SyntaxError: Invalid input 'AS'…`; NEG-2 `SyntaxError: Variable \`b\` not defined`; an unmarked block → "block has no @ddl/@id/@gds marker". The validator reports syntax and semantic errors.
10. Validator run A (no `--fill`): 278 DDL accepted; 39 query statements, 9 projection sources, 1 GDS input query EXPLAIN ok; 19 CALL gds.* not run; failed 0; 13 fulltext/vector indexes not yet ONLINE at the state check (populating); CartesianProduct in P-10d, G-0, G-5; NodeByLabelScan in P-09 (from `MATCH (org:Organization) WHERE org = x`). 278 objects dropped after the run. Fixes: P-09 branch → `WITH x AS org WHERE org:Organization`; G-5 frontier moved into the EXISTS; validator calls `db.awaitIndexes(300)` before the state check.
11. Validator run B (`--fill`): failed 0; 280/280 indexes ONLINE; 278 dropped. Post-check: 2 indexes, 0 constraints, but **354 nodes** — another S agent had started loading the cross-domain fixture graph (`mission:ft-S-xfx-fixtures`) into the shared instance.
12. Read-only peek at that graph (labels and relationship types, assembled names) and sample uids.
13. Smoke run 1 (`node scratchpad/synth/qp/smoke.mjs …query-patterns.md`, READ session): `labels(who)[0]` returned `Entity` (Organization asserter) and `labels(n)[0]` returned `EvidenceAssessment` (Adjudication); P-04b 0 rows (the chunk's spans hold assertions about the intervention component, filtered out by the about-X EXISTS); P-12 0 rows (no Biomarker in the fixture; hop 2 was mandatory). Fixes: KIND convention (16 replacements of `labels(x)[0]`), P-04b returns all covered assertions with `aboutX`, P-12 hop 2 `OPTIONAL CALL`.
14. Smoke run 2 — output below.
15. Validator run C and D (`--fill`, 04:38Z, 681 nodes present): exit 1 — D-1#4 `Neo.DatabaseError.Schema.ConstraintCreationFailed: Unable to create Constraint( name='identifier_key', … (:Identifier {scheme, issuer, value}) )`. Read-only check found 4 duplicate keys: (UNII, FDA GSRS, 8XM2XT8VWI) on `hu:identifier:xfx-cp-ident-sub-nrcl-unii` and `hu:identifier:unii-8xm2xt8vwi`; (UNII, FDA GSRS, 0I8H2M0L7N); (PUBCHEM_CID, NCBI PubChem, 439924); (DSLD, NIH ODS, 323170) — the cross-domain fixture and a packet fixture mint different uids for one identifier (open issue Q-7). A transient check at 04:37Z (327 nodes) showed none, so the graph was being reloaded.
16. Validator change: a `ConstraintCreationFailed` is reported as a data conflict (statement accepted by the parser and planner, refused by the store), never as a pattern failure.
17. Validator run E (final, `--fill`, 2026-10-09T04:39:17Z → 04:39:33Z): exit 0. Output below.
18. Final instance check: `SHOW INDEXES` → 2 (the instance's own LOOKUP indexes), `SHOW CONSTRAINTS` → 0. Every object this stage created was dropped (run E: 277).

## Smoke run 2 (read-only, in-progress fixture graph; not acceptance evidence)

```text
nodes in graph: 556 at 2026-10-09T04:37:25.744Z
P-01b {"assertionUid":"hu:assertion:xfx-cp-id-sub-nrcl-unii"} rows=1 {"a.uid":"hu:assertion:xfx-cp-id-sub-nrcl-unii","a.predicate":"HAS_IDENTIFIER","a.status":"ACCEPTED","a.assertionKind":"RELATIONSHIP","asserterKind":"Organization","asserterUid":"hu:org:xfx-cp-org-fda","container":null,"ev.role":"SUPPORTS","ev.origin":"DECLARED","ev.authority":null,"ev.independence"
P-01c {} rows=82 {"a.uid":"hu:assertion:xfx-cp-id-person-brenner-orcid","a.predicate":"HAS_IDENTIFIER","noLocator":false,"noAdjudication":false,"irreproducible":true,"noLineage":false}
P-02a {"uid":"hu:substance:xfx-cp-sub-nr"} rows=13 {"a.uid":"hu:assertion:xfx-cp-a-moiety","a.predicate":"HAS_ACTIVE_MOIETY","a.valueString":null,"a.valueNumber":null,"a.unitCode":null,"a.status":"ACCEPTED","a.validFrom":null,"a.validTo":null,"a.validFromBasis":"UNKNOWN","a.validObservedAt":null,"a.recordedAt":{"year":2026,"month":10,"day":9,"hour":
P-02b {"uid":"hu:substance:xfx-cp-sub-nrcl"} rows=6 {"relType":"HAS_ACTIVE_MOIETY","outgoing":true,"otherUid":"hu:substance:xfx-cp-sub-nr","episodeKind":"RECORDED_ONLY","r.validFrom":null,"r.validTo":null,"r.validFromBasis":null,"r.recordedFrom":{"year":2026,"month":10,"day":9,"hour":4,"minute":32,"second":44,"nanosecond":0,"timeZoneOffsetSeconds":0}
P-02d {"uid":"hu:substance:xfx-cp-sub-nr"} rows=32 {"kind":"ASSERTION","uid":"hu:assertion:xfx-cp-c-label-max-moiety","what":"MOIETY_EQUIVALENT_AMOUNT","opened":{"year":2026,"month":10,"day":9,"hour":4,"minute":32,"second":44,"nanosecond":0,"timeZoneOffsetSeconds":0},"closed":null,"basis":null,"change":"OPENED"}
P-04b {"entityUid":"hu:substance:xfx-cp-sub-nrcl"} rows=8 {"chunkUid":"hu:chunk:xfx-cp-chunk-cz-sec6","linker":"entity-link/v1","linkScore":null,"assertionUid":"hu:assertion:xfx-cp-f-cz-purity","a.predicate":"ADMINISTERED_MATERIAL_PURITY","aboutX":false,"ev.role":"SUPPORTS","loc.exact":"The NR capsule consisted of 100 mg or 250 mg of NR chloride (99% purit
P-04e {"chunkUid":"hu:chunk:xfx-cp-chunk-cz-sec6"} rows=8 {"a.uid":"hu:assertion:xfx-cp-f-cz-qty","a.predicate":"QUANTITY","locatorUid":"hu:locator:xfx-cp-l-cz-arms","loc.selectorJson":"{\"basis\":\"raw-utf8-codepoints@1\",\"end\":30075,\"exact\":\"The 4 capsules amounted to a single dose of either placebo (a total of 4 placebo capsules) or 100 mg NR (1 ca
P-09 {"itemUid":"hu:product:xfx-cp-prod-tn"} rows=0 
P-10a {"missionId":"mission:ft-S-xfx-fixtures"} rows=24 {"act.runId":"run:ft-S-xfx-compound-ingest","act.activityKind":"INGESTION","label":"Activity","createdCount":3,"updatedCount":0}
P-10a.2 {"missionId":"mission:ft-S-xfx-fixtures"} rows=13 {"act.runId":"run:ft-S-xfx-compound-ingest","relType":"ADMINISTERS","edges":3}
P-10a.3 {"missionId":"mission:ft-S-xfx-fixtures"} rows=87 {"act.runId":"run:ft-S-xfx-compound-ingest","kind":"Assessment","out.uid":"hu:assessment:xfx-cp-r-mention-nrcl","subkind":"RESOLUTION"}
P-10a.4 {"missionId":"mission:ft-S-xfx-fixtures"} rows=3 {"runId":"run:ft-S-xfx-compound-projection","relType":"AFFECTS_MECHANISM","edges":1}
P-10b {"uid":"hu:substance:xfx-cp-sub-nr"} rows=2 {"act.missionId":"mission:ft-S-xfx-fixtures","act.runId":"run:ft-S-xfx-compound-ingest","act.activityKind":"INGESTION","act.startedAt":{"year":2026,"month":10,"day":9,"hour":4,"minute":32,"second":44,"nanosecond":0,"timeZoneOffsetSeconds":0},"act.endedAt":null,"roles":["WROTE","ASSERTED_ABOUT"]}
P-10c {"missionId":"mission:ft-S-xfx-fixtures"} rows=0 
P-10c.2 {"missionId":"mission:ft-S-xfx-fixtures"} rows=1 {"relType":"AFFECTS_MECHANISM","edges":1}
P-10c.3 {"missionId":"mission:ft-S-xfx-fixtures"} rows=0 
P-10d {"r1":"run:ft-S-xfx-compound-ingest","r2":"run:ft-S-xfx-compound-verify"} rows=80 {"label":"Adjudication","n.uid":"hu:adjudication:xfx-cp-adj-a-sr-nad-d14","change":"CREATED","n.supersedesUid":null,"alsoWrittenByR1":false}
P-10d.2 {"r2":"run:ft-S-xfx-compound-ingest"} rows=39 {"relType":"STATED_IN","e.relationshipUid":"rel:xfx-cp-a-sr-ae-serious","state":"OPEN","e.recordedFrom":{"year":2026,"month":10,"day":9,"hour":4,"minute":32,"second":44,"nanosecond":0,"timeZoneOffsetSeconds":0},"e.recordedTo":null}
P-10e {"uid":"hu:substance:xfx-cp-sub-nr"} rows=1 {"act.missionId":"mission:ft-S-xfx-fixtures","act.runId":"run:ft-S-xfx-compound-ingest","act.activityKind":"INGESTION","act.operationKind":null,"act.startedAt":{"year":2026,"month":10,"day":9,"hour":4,"minute":32,"second":44,"nanosecond":0,"timeZoneOffsetSeconds":0},"act.endedAt":null,"act.intentDig
P-12 {"startUid":"hu:material:xfx-cp-mat-niagen"} rows=1 {"startUid":"hu:material:xfx-cp-mat-niagen","via":"realizes+moiety","modulatorUid":"hu:substance:xfx-cp-sub-nr","modulator":"NICOTINAMIDE RIBOSIDE","mechanismUid":"hu:mechanism:xfx-cp-mech-deacetylation","mechanism":"protein deacetylation","am.direction":"NO_CHANGE","am.bestBasis":"DIRECT_MEASUREMEN
P-12 {"startUid":"hu:substance:xfx-cp-sub-nr"} rows=1 {"startUid":"hu:substance:xfx-cp-sub-nr","via":"self","modulatorUid":"hu:substance:xfx-cp-sub-nr","modulator":"NICOTINAMIDE RIBOSIDE","mechanismUid":"hu:mechanism:xfx-cp-mech-deacetylation","mechanism":"protein deacetylation","am.direction":"NO_CHANGE","am.bestBasis":"DIRECT_MEASUREMENT","am.humanMe
```

## Final validator run (E)

### validate-patterns.mjs output

```json
{
  "neo4j": "5.26.31 community",
  "ddlExecuted": 278,
  "ddlFailed": 0,
  "ddlDataConflicts": [
    "D-1#4: Neo.DatabaseError.Schema.ConstraintCreationFailed: Unable to create Constraint( name='identifier_key', type='UNIQUENESS', schema=(:Identifier {scheme, issuer, value}) ):"
  ],
  "nodesInDatabase": 681,
  "indexesAfterDdl": {
    "total": 279,
    "online": 279,
    "notOnline": []
  },
  "queryStatements": 39,
  "queryOk": 39,
  "gdsProjectionSources": 9,
  "gdsProjectionSourcesOk": 9,
  "gdsInputQueries": 1,
  "gdsInputQueriesOk": 1,
  "gdsCallsNotRun": 19,
  "failed": 0,
  "withAllNodesScan": [],
  "withCartesianProduct": [
    "P-10d",
    "G-0"
  ],
  "otherNotifications": [
    "P-10d: Neo.ClientNotification.Statement.CartesianProduct",
    "G-0: Neo.ClientNotification.Statement.CartesianProduct",
    "G-5: Neo.ClientNotification.Statement.CartesianProduct"
  ],
  "missingParams": [],
  "droppedAfterRun": 277,
  "kept": false
}
```

| statement | kind | result | plan operators | notes |
| --- | --- | --- | --- | --- |
| D-2#1 | ddl | ok |  |  |
| D-2#2 | ddl | ok |  |  |
| D-2#3 | ddl | ok |  |  |
| D-2#4 | ddl | ok |  |  |
| D-2#5 | ddl | ok |  |  |
| D-2#6 | ddl | ok |  |  |
| D-2#7 | ddl | ok |  |  |
| D-2#8 | ddl | ok |  |  |
| D-2#9 | ddl | ok |  |  |
| D-2#10 | ddl | ok |  |  |
| D-2#11 | ddl | ok |  |  |
| D-2#12 | ddl | ok |  |  |
| D-2#13 | ddl | ok |  |  |
| D-2#14 | ddl | ok |  |  |
| D-2#15 | ddl | ok |  |  |
| D-2#16 | ddl | ok |  |  |
| D-2#17 | ddl | ok |  |  |
| D-2#18 | ddl | ok |  |  |
| D-2#19 | ddl | ok |  |  |
| D-2#20 | ddl | ok |  |  |
| D-2#21 | ddl | ok |  |  |
| D-2#22 | ddl | ok |  |  |
| D-2#23 | ddl | ok |  |  |
| D-2#24 | ddl | ok |  |  |
| D-2#25 | ddl | ok |  |  |
| D-2#26 | ddl | ok |  |  |
| D-2#27 | ddl | ok |  |  |
| D-2#28 | ddl | ok |  |  |
| D-2#29 | ddl | ok |  |  |
| D-2#30 | ddl | ok |  |  |
| D-2#31 | ddl | ok |  |  |
| D-2#32 | ddl | ok |  |  |
| D-2#33 | ddl | ok |  |  |
| D-2#34 | ddl | ok |  |  |
| D-2#35 | ddl | ok |  |  |
| D-2#36 | ddl | ok |  |  |
| D-2#37 | ddl | ok |  |  |
| D-2#38 | ddl | ok |  |  |
| D-2#39 | ddl | ok |  |  |
| D-2#40 | ddl | ok |  |  |
| D-2#41 | ddl | ok |  |  |
| D-2#42 | ddl | ok |  |  |
| D-2#43 | ddl | ok |  |  |
| D-2#44 | ddl | ok |  |  |
| D-2#45 | ddl | ok |  |  |
| D-2#46 | ddl | ok |  |  |
| D-2#47 | ddl | ok |  |  |
| D-2#48 | ddl | ok |  |  |
| D-2#49 | ddl | ok |  |  |
| D-2#50 | ddl | ok |  |  |
| D-2#51 | ddl | ok |  |  |
| D-2#52 | ddl | ok |  |  |
| D-2#53 | ddl | ok |  |  |
| D-2#54 | ddl | ok |  |  |
| D-2#55 | ddl | ok |  |  |
| D-2#56 | ddl | ok |  |  |
| D-2#57 | ddl | ok |  |  |
| D-2#58 | ddl | ok |  |  |
| D-2#59 | ddl | ok |  |  |
| D-2#60 | ddl | ok |  |  |
| D-2#61 | ddl | ok |  |  |
| D-2#62 | ddl | ok |  |  |
| D-2#63 | ddl | ok |  |  |
| D-2#64 | ddl | ok |  |  |
| D-2#65 | ddl | ok |  |  |
| D-2#66 | ddl | ok |  |  |
| D-2#67 | ddl | ok |  |  |
| D-2#68 | ddl | ok |  |  |
| D-2#69 | ddl | ok |  |  |
| D-2#70 | ddl | ok |  |  |
| D-2#71 | ddl | ok |  |  |
| D-2#72 | ddl | ok |  |  |
| D-2#73 | ddl | ok |  |  |
| D-2#74 | ddl | ok |  |  |
| D-2#75 | ddl | ok |  |  |
| D-2#76 | ddl | ok |  |  |
| D-2#77 | ddl | ok |  |  |
| D-2#78 | ddl | ok |  |  |
| D-2#79 | ddl | ok |  |  |
| D-2#80 | ddl | ok |  |  |
| D-2#81 | ddl | ok |  |  |
| D-2#82 | ddl | ok |  |  |
| D-2#83 | ddl | ok |  |  |
| D-2#84 | ddl | ok |  |  |
| D-2#85 | ddl | ok |  |  |
| D-2#86 | ddl | ok |  |  |
| D-2#87 | ddl | ok |  |  |
| D-2#88 | ddl | ok |  |  |
| D-2#89 | ddl | ok |  |  |
| D-2#90 | ddl | ok |  |  |
| D-2#91 | ddl | ok |  |  |
| D-2#92 | ddl | ok |  |  |
| D-2#93 | ddl | ok |  |  |
| D-2#94 | ddl | ok |  |  |
| D-2#95 | ddl | ok |  |  |
| D-2#96 | ddl | ok |  |  |
| D-2#97 | ddl | ok |  |  |
| D-2#98 | ddl | ok |  |  |
| D-2#99 | ddl | ok |  |  |
| D-2#100 | ddl | ok |  |  |
| D-2#101 | ddl | ok |  |  |
| D-2#102 | ddl | ok |  |  |
| D-2#103 | ddl | ok |  |  |
| D-2#104 | ddl | ok |  |  |
| D-2#105 | ddl | ok |  |  |
| D-2#106 | ddl | ok |  |  |
| D-2#107 | ddl | ok |  |  |
| D-2#108 | ddl | ok |  |  |
| D-2#109 | ddl | ok |  |  |
| D-2#110 | ddl | ok |  |  |
| D-2#111 | ddl | ok |  |  |
| D-2#112 | ddl | ok |  |  |
| D-2#113 | ddl | ok |  |  |
| D-2#114 | ddl | ok |  |  |
| D-2#115 | ddl | ok |  |  |
| D-2#116 | ddl | ok |  |  |
| D-2#117 | ddl | ok |  |  |
| D-2#118 | ddl | ok |  |  |
| D-2#119 | ddl | ok |  |  |
| D-2#120 | ddl | ok |  |  |
| D-2#121 | ddl | ok |  |  |
| D-2#122 | ddl | ok |  |  |
| D-2#123 | ddl | ok |  |  |
| D-2#124 | ddl | ok |  |  |
| D-2#125 | ddl | ok |  |  |
| D-2#126 | ddl | ok |  |  |
| D-2#127 | ddl | ok |  |  |
| D-2#128 | ddl | ok |  |  |
| D-2#129 | ddl | ok |  |  |
| D-2#130 | ddl | ok |  |  |
| D-2#131 | ddl | ok |  |  |
| D-2#132 | ddl | ok |  |  |
| D-2#133 | ddl | ok |  |  |
| D-2#134 | ddl | ok |  |  |
| D-2#135 | ddl | ok |  |  |
| D-2#136 | ddl | ok |  |  |
| D-2#137 | ddl | ok |  |  |
| D-2#138 | ddl | ok |  |  |
| D-2#139 | ddl | ok |  |  |
| D-2#140 | ddl | ok |  |  |
| D-2#141 | ddl | ok |  |  |
| D-2#142 | ddl | ok |  |  |
| D-2#143 | ddl | ok |  |  |
| D-2#144 | ddl | ok |  |  |
| D-2#145 | ddl | ok |  |  |
| D-2#146 | ddl | ok |  |  |
| D-2#147 | ddl | ok |  |  |
| D-2#148 | ddl | ok |  |  |
| D-2#149 | ddl | ok |  |  |
| D-2#150 | ddl | ok |  |  |
| D-2#151 | ddl | ok |  |  |
| D-2#152 | ddl | ok |  |  |
| D-2#153 | ddl | ok |  |  |
| D-2#154 | ddl | ok |  |  |
| D-2#155 | ddl | ok |  |  |
| D-2#156 | ddl | ok |  |  |
| D-2#157 | ddl | ok |  |  |
| D-2#158 | ddl | ok |  |  |
| D-2#159 | ddl | ok |  |  |
| D-2#160 | ddl | ok |  |  |
| D-2#161 | ddl | ok |  |  |
| D-2#162 | ddl | ok |  |  |
| D-2#163 | ddl | ok |  |  |
| D-2#164 | ddl | ok |  |  |
| D-2#165 | ddl | ok |  |  |
| D-2#166 | ddl | ok |  |  |
| D-2#167 | ddl | ok |  |  |
| D-2#168 | ddl | ok |  |  |
| D-2#169 | ddl | ok |  |  |
| D-2#170 | ddl | ok |  |  |
| D-2#171 | ddl | ok |  |  |
| D-2#172 | ddl | ok |  |  |
| D-2#173 | ddl | ok |  |  |
| D-2#174 | ddl | ok |  |  |
| D-2#175 | ddl | ok |  |  |
| D-2#176 | ddl | ok |  |  |
| D-2#177 | ddl | ok |  |  |
| D-2#178 | ddl | ok |  |  |
| D-2#179 | ddl | ok |  |  |
| D-2#180 | ddl | ok |  |  |
| D-2#181 | ddl | ok |  |  |
| D-2#182 | ddl | ok |  |  |
| D-2#183 | ddl | ok |  |  |
| D-2#184 | ddl | ok |  |  |
| D-2#185 | ddl | ok |  |  |
| D-2#186 | ddl | ok |  |  |
| D-2#187 | ddl | ok |  |  |
| D-2#188 | ddl | ok |  |  |
| D-2#189 | ddl | ok |  |  |
| D-2#190 | ddl | ok |  |  |
| D-2#191 | ddl | ok |  |  |
| D-2#192 | ddl | ok |  |  |
| D-2#193 | ddl | ok |  |  |
| D-2#194 | ddl | ok |  |  |
| D-2#195 | ddl | ok |  |  |
| D-2#196 | ddl | ok |  |  |
| D-2#197 | ddl | ok |  |  |
| D-2#198 | ddl | ok |  |  |
| D-2#199 | ddl | ok |  |  |
| D-2#200 | ddl | ok |  |  |
| D-2#201 | ddl | ok |  |  |
| D-2#202 | ddl | ok |  |  |
| D-2#203 | ddl | ok |  |  |
| D-2#204 | ddl | ok |  |  |
| D-2#205 | ddl | ok |  |  |
| D-2#206 | ddl | ok |  |  |
| D-2#207 | ddl | ok |  |  |
| D-2#208 | ddl | ok |  |  |
| D-2#209 | ddl | ok |  |  |
| D-2#210 | ddl | ok |  |  |
| D-2#211 | ddl | ok |  |  |
| D-2#212 | ddl | ok |  |  |
| D-2#213 | ddl | ok |  |  |
| D-2#214 | ddl | ok |  |  |
| D-2#215 | ddl | ok |  |  |
| D-2#216 | ddl | ok |  |  |
| D-2#217 | ddl | ok |  |  |
| D-2#218 | ddl | ok |  |  |
| D-2#219 | ddl | ok |  |  |
| D-2#220 | ddl | ok |  |  |
| D-2#221 | ddl | ok |  |  |
| D-2#222 | ddl | ok |  |  |
| D-2#223 | ddl | ok |  |  |
| D-2#224 | ddl | ok |  |  |
| D-2#225 | ddl | ok |  |  |
| D-2#226 | ddl | ok |  |  |
| D-2#227 | ddl | ok |  |  |
| D-2#228 | ddl | ok |  |  |
| D-2#229 | ddl | ok |  |  |
| D-1#1 | ddl | ok |  |  |
| D-1#2 | ddl | ok |  |  |
| D-1#3 | ddl | ok |  |  |
| D-1#4 | ddl | DATA CONFLICT Neo.DatabaseError.Schema.ConstraintCreationFailed: Unable to create Constraint( name='identifier_key', type='UNIQUENESS', schema=(:Identifier {scheme, issuer, value}) ): |  |  |
| D-1#5 | ddl | ok |  |  |
| D-1#6 | ddl | ok |  |  |
| D-1#7 | ddl | ok |  |  |
| D-1#8 | ddl | ok |  |  |
| D-1#9 | ddl | ok |  |  |
| D-1#10 | ddl | ok |  |  |
| D-1#11 | ddl | ok |  |  |
| D-1#12 | ddl | ok |  |  |
| D-1#13 | ddl | ok |  |  |
| D-1#14 | ddl | ok |  |  |
| D-1#15 | ddl | ok |  |  |
| D-1#16 | ddl | ok |  |  |
| D-1#17 | ddl | ok |  |  |
| D-1#18 | ddl | ok |  |  |
| D-1#19 | ddl | ok |  |  |
| D-1#20 | ddl | ok |  |  |
| D-1#21 | ddl | ok |  |  |
| D-1#22 | ddl | ok |  |  |
| D-1#23 | ddl | ok |  |  |
| D-1#24 | ddl | ok |  |  |
| D-1#25 | ddl | ok |  |  |
| D-1#26 | ddl | ok |  |  |
| D-1#27 | ddl | ok |  |  |
| D-1#28 | ddl | ok |  |  |
| D-1#29 | ddl | ok |  |  |
| D-1#30 | ddl | ok |  |  |
| D-1#31 | ddl | ok |  |  |
| D-1#32 | ddl | ok |  |  |
| D-3#1 | ddl | ok |  |  |
| D-3#2 | ddl | ok |  |  |
| D-3#3 | ddl | ok |  |  |
| D-3#4 | ddl | ok |  |  |
| D-3#5 | ddl | ok |  |  |
| D-3#6 | ddl | ok |  |  |
| D-3#7 | ddl | ok |  |  |
| D-3#8 | ddl | ok |  |  |
| D-3#9 | ddl | ok |  |  |
| D-3#10 | ddl | ok |  |  |
| D-3#11 | ddl | ok |  |  |
| D-3#12 | ddl | ok |  |  |
| D-3#13 | ddl | ok |  |  |
| D-3#14 | ddl | ok |  |  |
| D-4#1 | ddl | ok |  |  |
| D-4#2 | ddl | ok |  |  |
| D-4#3 | ddl | ok |  |  |
| P-01a | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Top, Apply, OptionalExpand(All), NodeUniqueIndexSeek, Distinct, Union, Filter, VarLengthExpand(Pruning,BFS,All), Argument, Expand(All), LetSemiApply, Expand(Into) | 6 token warnings |
| P-01b | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Sort, OptionalExpand(All), Filter, Expand(All), NodeUniqueIndexSeek, Argument | 2 token warnings |
| P-01c | query | ok | ProduceResults, Projection, CacheProperties, Limit, Filter, LetAntiSemiApply, LetSemiApply, NodeByLabelScan, Expand(All), Argument | 1 token warnings |
| P-02a | query | ok | ProduceResults, Projection, CacheProperties, Top, Filter, Expand(All), NodeUniqueIndexSeek |  |
| P-02b | query | ok | ProduceResults, Projection, CacheProperties, Top, Filter, Expand(All), NodeUniqueIndexSeek |  |
| P-02c | query | ok | ProduceResults, Projection, CacheProperties, NodeUniqueIndexSeek |  |
| P-02d | query | ok | ProduceResults, Projection, Sort, Apply, NodeUniqueIndexSeek, Distinct, Union, CacheProperties, Filter, Expand(All), Argument |  |
| P-02e | query | ok | ProduceResults, Projection, CacheProperties, Sort, Filter, Expand(All), NodeUniqueIndexSeek |  |
| P-03 | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Sort, Filter, Expand(All), NodeUniqueIndexSeek, Argument | 1 token warnings |
| P-04a | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Top, Filter, Expand(All), SemiApply, ProcedureCall, Expand(Into), Argument | 3 token warnings |
| P-04b | query | ok | ProduceResults, Projection, CacheProperties, Sort, LetSemiApply, Filter, Expand(All), Top, NodeUniqueIndexSeek, Expand(Into), Argument | 2 token warnings |
| P-04c | query | ok | ProduceResults, Projection, CacheProperties, Filter, Expand(All), Top, ProcedureCall |  |
| P-04d | query | ok | ProduceResults, Projection, CacheProperties, Filter, Expand(All), NodeUniqueIndexSeek | 3 token warnings |
| P-04e | query | ok | ProduceResults, Projection, CacheProperties, Filter, Expand(All), NodeUniqueIndexSeek |  |
| P-05a | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, PartialSort, Unwind, Apply, EagerAggregation, Filter, NodeIndexSeek, NodeUniqueIndexSeek, Expand(All), Argument | 5 token warnings |
| P-05b | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Sort, OptionalExpand(All), Filter, AntiSemiApply, Expand(All), NodeUniqueIndexSeek, NodeIndexSeek, Argument |  |
| P-05c | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Sort, OptionalExpand(All), Expand(All), Filter, NodeUniqueIndexSeek, Argument |  |
| P-06a | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Top, OptionalExpand(All), Filter, Expand(All), SemiApply, Distinct, Union, NodeIndexSeek, NodeUniqueIndexSeek, Argument, Expand(Into) | 2 token warnings |
| P-06b | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Limit, Filter, Expand(All), Distinct, Union, NodeIndexSeek, NodeUniqueIndexSeek, Argument | 9 token warnings |
| P-07 | query | ok | ProduceResults, Projection, CacheProperties, Top, EagerAggregation, Apply, Distinct, Union, NodeIndexSeek, NodeUniqueIndexSeek, Expand(All), Filter, Argument | 5 token warnings |
| P-08a | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Sort, Filter, Expand(All), Distinct, Union, NodeIndexSeek, NodeUniqueIndexSeek, Argument | 3 token warnings |
| P-08b | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Top, EagerAggregation, Sort, Filter, Expand(All), NodeUniqueIndexSeek, Expand(Into), Argument | 1 token warnings |
| P-08c | query | ok | ProduceResults, Projection, Top, Filter, VarLengthExpand(All), NodeUniqueIndexSeek |  |
| P-09 | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Top, Filter, Expand(All), OptionalExpand(All), NodeUniqueIndexSeek, Distinct, Union, Argument, Apply, Repeat(Trail), Optional, SemiApply, Expand(Into) | 2 token warnings |
| P-10a | query | ok | ProduceResults, PartialSort, OrderedAggregation, LetAntiSemiApply, Expand(All), CacheProperties, Sort, Projection, NodeIndexSeek, Filter, Argument |  |
| P-10a.2 | query | ok | ProduceResults, Sort, EagerAggregation, Filter, Expand(Into), Expand(All), NodeIndexSeek |  |
| P-10a.3 | query | ok | ProduceResults, Projection, CacheProperties, Filter, Expand(All), NodeIndexSeek |  |
| P-10a.4 | query | ok | ProduceResults, EagerAggregation, Apply, NodeIndexSeek, Distinct, CacheProperties, Union, DirectedRelationshipIndexSeek |  |
| P-10b | query | ok | ProduceResults, Sort, EagerAggregation, CacheProperties, Apply, NodeUniqueIndexSeek, Distinct, Union, Projection, Filter, Expand(All), Argument, NodeIndexSeek |  |
| P-10c | query | ok | ProduceResults, Top, EagerAggregation, CacheProperties, Filter, VarLengthExpand(All), Unwind, Apply, Expand(All), NodeIndexSeek, Projection, Argument |  |
| P-10c.2 | query | ok | ProduceResults, EagerAggregation, Filter, Apply, Expand(All), NodeIndexSeek, DirectedUnionRelationshipTypesScan | 1 token warnings |
| P-10c.3 | query | ok | ProduceResults, Sort, EagerAggregation, CacheProperties, Filter, VarLengthExpand(Pruning,BFS,All), NodeIndexSeek |  |
| P-10d | query | ok | ProduceResults, Projection, CacheProperties, LetSemiApply, Sort, LetAntiSemiApply, CartesianProduct, NodeIndexSeek, Expand(All), Filter, Argument, Expand(Into) | Neo.ClientNotification.Statement.CartesianProduct |
| P-10d.2 | query | ok | ProduceResults, Projection, CacheProperties, Filter, Expand(Into), Expand(All), NodeIndexSeek |  |
| P-10e | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Sort, Filter, Expand(All), NodeUniqueIndexSeek, Argument | 6 token warnings |
| P-11a | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Sort, Apply, NodeUniqueIndexSeek, Distinct, Union, Argument, NodeIndexSeek, OptionalExpand(All), Optional, Expand(Into), Filter, Expand(All) | 5 token warnings |
| P-11b | query | ok | ProduceResults, Projection, CacheProperties, Top, Apply, Filter, AntiSemiApply, Expand(All), NodeIndexScan, Expand(Into), NodeIndexSeek, EagerAggregation, Argument | 1 token warnings |
| P-12 | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Top, Apply, Filter, Expand(All), NodeUniqueIndexSeek, Distinct, Union, Argument, Unwind, Optional, OptionalExpand(All) | 5 token warnings |
| G-0 | query | ok | ProduceResults, EmptyResult, Create, Apply, Unwind, SetProperty, Eager, Filter, NodeIndexSeek, CartesianProduct, NodeUniqueIndexSeek(Locking), Optional, Expand(Into) | Neo.ClientNotification.Statement.CartesianProduct |
| G-1 | gds-input | ok | ProduceResults, Projection, Filter, EagerAggregation, Expand(All), NodeIndexSeek |  |
| G-2 | gds-projection-source | ok | ProduceResults, Projection, Filter, Expand(All), NodeIndexSeek |  |
| G-2#2 | gds-call | not run (GDS) |  |  |
| G-2#3 | gds-call | not run (GDS) |  |  |
| G-3 | gds-projection-source | ok | ProduceResults, Projection, Filter, Expand(All), NodeUniqueIndexSeek |  |
| G-3#2 | gds-call | not run (GDS) |  |  |
| G-3#3 | gds-call | not run (GDS) |  |  |
| G-4 | gds-projection-source | ok | ProduceResults, Projection, Apply, EagerAggregation, Filter, Expand(All), NodeUniqueIndexSeek, Distinct, Union, Unwind, Argument |  |
| G-4#2 | gds-call | not run (GDS) |  |  |
| G-4#3 | gds-call | not run (GDS) |  |  |
| G-5 | gds-projection-source | ok | ProduceResults, Projection, EagerAggregation, Filter, Expand(All), SemiApply, NodeIndexSeekByRange, SelectOrSemiApply, LetSemiApply, Argument, Expand(Into), NodeUniqueIndexSeek, NodeHashJoin | 1 token warnings; Neo.ClientNotification.Statement.CartesianProduct |
| G-5#2 | gds-call | not run (GDS) |  |  |
| G-5#3 | gds-call | not run (GDS) |  |  |
| G-6 | gds-projection-source | ok | ProduceResults, Projection, OrderedDistinct, Filter, Expand(All), NodeByLabelScan |  |
| G-6#2 | gds-call | not run (GDS) |  |  |
| G-6#3 | gds-call | not run (GDS) |  |  |
| G-7 | gds-projection-source | ok | ProduceResults, Projection, Filter, Expand(All), NodeByLabelScan | 1 token warnings |
| G-7#2 | gds-call | not run (GDS) |  |  |
| G-7#3 | gds-call | not run (GDS) |  |  |
| G-8 | gds-projection-source | ok | ProduceResults, Projection, Unwind, EagerAggregation, Filter, Expand(All), NodeByLabelScan | 1 token warnings |
| G-8#2 | gds-call | not run (GDS) |  |  |
| G-8#3 | gds-call | not run (GDS) |  |  |
| G-9 | gds-projection-source | ok | ProduceResults, Projection, Filter, Expand(All), DirectedRelationshipTypeScan | 2 token warnings |
| G-9#2 | gds-call | not run (GDS) |  |  |
| G-9#3 | gds-call | not run (GDS) |  |  |
| G-10 | gds-projection-source | ok | ProduceResults, Projection, Filter, Expand(All), NodeByLabelScan |  |
| G-10#2 | gds-call | not run (GDS) |  |  |
| G-10#3 | gds-call | not run (GDS) |  |  |
| G-10#4 | gds-call | not run (GDS) |  |  |
