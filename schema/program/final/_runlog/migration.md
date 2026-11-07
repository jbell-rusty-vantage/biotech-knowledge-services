# Runlog: migration notes (S, MIGRATION NOTES role), 2026-10-09

Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`. Writes only `final/migration-notes.md`, `final/_work/diff-v1-v2.mjs` (+ its outputs `diff-v1-v2.json`, `diff-v1-v2.tables.md`), `final/_work/planner-probe-v2.mjs`, `final/_work/consumer-check-v2.mjs`, and this log. Scratch: `<scratchpad>/synth/mig/` (probe and consumer-check JSON outputs). Nothing committed; no packet, pinned, workspace, scripts or packages file touched.

## 1. Inputs surveyed

```
$ git log --oneline -1   -> e484fd2 Schema program checkpoint
$ ls schema/program/final -> decision-report.md node-register.yaml relationship-register.yaml schema-map.md seams.yaml size-report.md _work/ _runlog/ schema/
$ v1 IR: workspace/schema-ir.json  (irVersion bks-schema-ir.v1, nodes 192, relationshipTypes 393, enums 183, unions 39, interfaces 11, edgePropertyTypes 47)
$ v2 IR: final/schema/final_biotech_schema_v2.ir.json (schemaDigest sha256:d233930272c7…, nodes 69, relationshipTypes 106, enums 193, unions 16, interfaces 2, edgePropertyTypes 20)
$ node <scratch>/mig/peek.mjs  -> packet 06 mergedInto shapes: K/D5/D8/D9/D11/D12/D13 {pinned,into,...}; D1/D4/D7/D10 {from,into,how}; D2 {type,into,how}; D3/D6 {name,into,how|reason}
$ node <scratch>/mig/peek2.mjs -> final/node-register.yaml: nodes 69, deferred 108, mergedInto 227, retiredEnums 2, unionsRetired 8
                                  final/relationship-register.yaml: relationships 109, predicateOnly 203, deferred 386, mergedInto 2, removedRegistrations 6
                                  packets (sum): mergedInto 227, node deferred 107, rel deferred 375, predicateOnly 229
```

## 2. Code read (no command output; line references used in migration-notes)

`packages/kg-ops/src/plan.ts` (840 lines), `read.ts`, `resolve.ts`, `schema-access.ts`, `operations.ts`; `apps/graphql-api/src/server.ts`, `print-schema.ts`, `limits.ts`, `Dockerfile`; `packages/contracts/src/ingest.ts`, `common.ts`; `schema/sidecars/*.yaml`; `packages/schema-workspace/src/sidecars.ts`, `build.ts`; `packets/K/11-open-questions.md` (P1–P21), every packet's 11-open-questions intent-gap item; `final/decision-report.md` R-02, R-03, R-04, R-11, R-40.

```
$ grep -n "mongoResearchRunId|Mention|SUPPORTED_BY|externalRun|TradeItem" packages/kg-ops/src/*.ts apps/executor/src/*.ts
  plan.ts:141 nodeDefaults …mongoResearchRunId; :176 ON MATCH SET n.mongoResearchRunId; :196-197 externalRunSystem/externalRunId; :517 MERGE (a)-[:SUPPORTED_BY]->(loc);
  :524 EXECUTOR_EDGE_FIELDS …"mongoResearchRunId"; :608 "TradeItemIdentifier"; :627 :657 :701 :757 :763 :809 r./n.mongoResearchRunId; :796 (a)-[:SUPPORTED_BY]->; :823-828 Mention
  read.ts:144 :162 SUPPORTED_BY; :148 externalRunSystem/externalRunId
$ grep -n "INTENT_VERSION|…" packages/contracts/src/*.ts -> ingest.ts:18 biotech-knowledge-intent.v1, :19 plan.v1, :20 receipt.v1; read.ts:15 read-intent.v1; common.ts:19 "runId is the external run id the Activity node records as externalRunId"
$ grep apps/graphql-api/Dockerfile -> :15 COPY schema/pinned schema/pinned; :27 COPY --from=build /repo/schema/pinned apps/graphql-api/dist/schema
```

## 3. Type-level diff (script)

```
$ node schema/program/final/_work/diff-v1-v2.mjs
  -> writes final/_work/diff-v1-v2.json (607,137 B) and final/_work/diff-v1-v2.tables.md (200,610 B)
  inputs: v1 sha256:8313a6f8… nodes 192 rels 393 enums 183 unions 39 interfaces 11 edgeProps 47
          v2 sha256:d2339302… nodes 69 rels 106 enums 193 unions 16 interfaces 2 edgeProps 20
          mergedInto rows 227, node deferred rows 108, rel deferred rows 761 (final + packets; de-duplicated per module/name/reason when applied), predicate rows 434
  nodes: kept 49, merged 119, renamed 3, removed:folded 13, removed:deferred 8   (sum 192)
         v2-only 20 = new 6 + absorbing >1 v1 type 11 + rename targets 3
  relationship types: kept 50, merged 111, renamed 15, demoted 30, removed:pattern 66, removed:deferred 114, removed:unmapped 7   (sum 393)
         v2-only 56 = new 17 + absorbing >1 v1 type 24 + rename targets 15
  kept relationship types: class changed 7, edge-property type changed 31
  properties: verified renames 9 (mongoResearchRunId→lastWriterRunId on every mapped type + 8 others); types compared 178; fields removed 2,172, added 1,991
  mongoResearchRunId: v1 on 192 node types + 42 edge-property types; v2 on 0; lastWriterRunId on 69 node types + 20 of 20 edge-property types
  enums: kept 59 (29 with value changes), removed 124 (9 with a named replacement), new 134; unions kept 1 / removed 38 / new 15; interfaces kept 1 / removed 10 / new 1; edge-property types kept 6 / removed 41 / new 14
```

Iterations (same command; the script was edited between runs). Run 1 left 13 relationship types unmapped and classed only 13 as demoted. Added, in order: (a) "Replaces A, B" scanning of v2 relationship-register entries and v2 relationship docstrings (SUPPORTED_BY → HAS_EVIDENCE, EVALUATES → ASSESSES, HAS_EPISODE/HAS_SERIES/DISTRIBUTES_RENDITION → PUBLISHES …); (b) deferred reasons that are themselves a v2 type name; (c) predicate detection in deferred reasons; (d) slash-list pairing for property renames (run 1 paired `ciUpper → intervalLower`); (e) `into` texts starting "string id / property / enum" classed as folded (PolicyVersion); (f) arrows count only with the deferred type on their left (run 3 mapped RECOMMENDS → HAS_SUBJECT from an unrelated arrow; now demoted → RECOMMENDS_USE). A Python patch left one literal backspace byte in the script (`\b` → 0x08); found with `od -c`, replaced, `grep -c $'\x08'` → 0. Final-run numbers are the block above.

```
$ node <scratch>/mig/evals-map.cjs     (per eval task: v1-only names and their v2 class)
read-01-what-do-we-know: MARKETS_PRODUCT (removed:pattern → NAMES_RESPONSIBLE_PARTY/SELLER_OF_RECORD)
read-02-as-of: none
ingest-01-price-observation: CONTAINS (removed:deferred), HAS_PRICE_OBSERVATION (removed:deferred), PriceObservation (merged → Offer)
ingest-02-correction: HAS_FORMULATION_VERSION (merged → HAS_LABEL_VERSION), SUPPORTED_BY (merged → HAS_EVIDENCE), FormulationVersion (merged → LabelVersion)
ingest-03-forbidden: ADVISES_ORGANIZATION (merged → HOLDS_ROLE), ENDORSES_PRODUCT (demoted → predicate RECOMMENDS_USE), RECOMMENDS (demoted → predicate RECOMMENDS_USE), SUPPORTED_BY (merged → HAS_EVIDENCE)
$ node -e (v2 IR inspection) -> AssertedRecordedProperties: relationshipUid!, assertionUid!, recordedFrom!, recordedTo, lastWriterRunId (30 v2 types use it; AssertedEdgeProperties 19)
     SourceLocator requires selectorKind!, selectorDigest!, selectorJson!; Activity requires activityKind!, externalRunSystem!, runId!
     SelectorKind v1 7 values → v2 13 (TEXT_POSITION, MEDIA_TIME, PDF_PAGE, IMAGE_REGION, SECTION gone); ActivityKind v1 15 → v2 7 (no overlap)
     SourceSnapshot.contentHashBasis: v1 enum ContentHashBasis → v2 String (R-35 vocabulary); Source.genre String
     Adjudication.evaluates = ASSESSES → Assertion
```

## 4. Planner probe (current kg-ops dist, read-only against bks-neo4j-synth)

```
$ docker exec bks-neo4j-synth cypher-shell -u neo4j -p *** "SHOW FULLTEXT INDEXES YIELD name RETURN count(*) AS fulltext"  -> 0
$ docker exec bks-neo4j-synth cypher-shell -u neo4j -p *** "MATCH (n) RETURN count(n) AS nodes"                          -> 0
$ NEO4J_PROBE_PASSWORD=*** node schema/program/final/_work/planner-probe-v2.mjs <scratch>/mig/planner-probe.json <77 packet intents (packets/*/07-fixtures/*/intent*.json) + examples/ingestion-intent.example.json>
  intents 78; context.activityKind: EXTRACTION 40, INGESTION 37, RESEARCH 1
  v1 model (pinned IR): thrown 77 ("Cannot run query in this transaction, because it has been rolled back"), rejected 1. The probe DB has 0 fulltext indexes;
     resolveMentions' fulltext query fails inside the managed read transaction and its catch cannot revive the transaction. Not a usable baseline on this DB.
  v2 model (candidate IR, planner unchanged): applicable 0, partial 0, rejected 63, thrown 15 (UNKNOWN_NODE_TYPE: unknown node type Mention)
     plan errors: INVALID_ACTIVITY_KIND 32, INVALID_SOURCE_PROPERTY 4, LOCATOR_WITHOUT_SNAPSHOT 1
     subject reasons: TYPE_NOT_CREATABLE 791 ("<T> excludes CREATE in @mutation"), REQUIRED_PROPERTY_MISSING 289, "node type X has no registered uid token" 90, INVALID_PROPERTY 37
  v2sim (v2 + every node creatable + EXTRACTION→INGESTION + mention.stage proposals dropped): applicable 1, partial 32, rejected 41, thrown 4
     thrown: TypeError at plan.js:761 (assertion.literal: `assertion.properties.find((p) => p.name === k)!` is undefined for quantityBasis/massBasis/amountReferent) in 3 packet intents + examples/ingestion-intent.example.json
     proposal reasons: SUBJECT_CONFLICT 416, SUBJECT_REVIEW_REQUIRED 268, SUBJECT_MISSING 138, RELATIONSHIP_NOT_IN_SCHEMA 35 (DIRECTLY_ACTIVATES 12, CAUSES_ADVERSE_EFFECT 6, USE_CONSTRAINED_IN 4, INTERACTS_WITH 3, REPORTS_ASSOCIATION_SCORE 2, …),
        LITERAL_VALUE_REQUIRED 34, RELATIONSHIP_ENDPOINTS_INVALID 32 ("<T> has no HAS_IDENTIFIER field": ChemicalSubstance 19, Study 4, MerchantListing 4, Publication 2, Device 2, …),
        INVALID_EDGE_PROPERTY 29 (RoleEdgeProperties.roleTitleVerbatim 13, StakeEdgeProperties.stakeClassVerbatim 13, FoodContentProperties.statementKind missing 2, RevisionEdgeProperties.reasonsVerbatim 1), EPISODE_NOT_FOUND 2, DEPENDS_ON_HELD 3, INVALID_ASSERTION 1
     subject reasons: REQUIRED_PROPERTY_MISSING 326 (entityKind 134, productKind+marketedName 31, materialKind 27, descriptionVerbatim+definingSystem 14, brandKind 14, …), NO_UID_TOKEN 116 (LabelVersion 16, Intervention 15, Brand 15, Package 12, FoodCategory 9, …),
        INVALID_PROPERTY 37 (SourceRevisionKind "RETRACTED" 9 / "NONE_KNOWN" 5 on Publication.revisionStatus; Metric/Biomarker/IngredientMaterial.searchText "derived search projection" 16)
  v2sim write audit (statements of the non-rejected plans): relationship SUPPORTED_BY written 238× in 32 intents (absent in v2); edge property mongoResearchRunId 310× in 28 intents;
     153 (label, property) pairs absent in v2: maturity, schemaVersion, mongoResearchRunId on 39 labels; Activity.description, Activity.externalRunId;
     Assertion.agentRunUid, amountReferent, assertionBasis, extractionMethod, jurisdiction, massBasis, predicateClass, quantityBasis, segmentKind, statedAsOf, statedAsOfPrecision, statedTense;
     SourceLocator.uri, section + 13 fixture-supplied keys (byteStart, byteEnd, jsonPointer, xpath, htmlSelector, normalization, …); SourceSnapshot.canonicalUri + 7 fixture-supplied keys
```

Iterations: run 1 had only v1/v2 (v2 plans all rejected, so the write audit saw no statements); added the v2sim model; run 2 added reason samples; one Python patch turned `"\n"` into a real newline in the script (syntax error), fixed with Edit.

## 5. Consumer check (sidecars, renderer, operations file, replay set, repo consumers)

```
$ node schema/program/final/_work/consumer-check-v2.mjs <scratch>/integrate/printed-deployed.graphql C:/Users/Pinda/Proyectos/Biotech/biotech-meta/docs/schema <scratch>/mig/consumer-check.json
  sidecars: validateSidecars(v2 IR) 264 errors (domains.yaml 75, terminology.yaml 90, task-routes.yaml 64, identity-rules.yaml 32, ingestion-rules.yaml 3); the same sidecars on the v1 IR: 0
            ingestion-rules.yaml: kernel plumbing SUPPORTED_BY and USED do not exist; edge profile StateEpisodeProperties does not exist
            renderWorkspace(v2 IR) renders 752 files without throwing (build.ts:12-13 runs validateSidecars first and throws)
  operations.cypher (pinned): 1,151 statements (564 constraints, 336 indexes, 32 fulltext, 3 vector, 216 other); 561 name a label absent in v2 (155 labels); 314 name a relationship type absent in v2 (142 types)
  validation params inherited by the v2 IR: 190 uid tokens (141 for types absent in v2; 20 v2 node types without one); 482 registered predicates (pinned registry);
            assertedTypes absent in v2 125, derivedTypes 39, exclusiveTypes 6; v2 node types whose SDL allows CREATE: 0 of 69
  GraphQL ops of the replay set (7 files, 25 operations) validated against the printed v2 API: valid 4, invalid 21 (7 mutations: v2 has no Mutation root; 14 unknown field / type / enum value)
     per file: roundtrip-ops.json 2/6, W00 graphql-ops-T1 0/2, T2 1/4, T3 0/1, T4 1/4, T5 0/4, T6 0/4
  Cypher files of the replay set: 257 — replays (names unchanged) 3, rewrite: remodel (>= half of references unchanged) 197, rewrite: remodel (< half) 50, lost (> half of references to removed types) 3, no schema references 4; median kept share 0.65
     most common removed names (files): :VersionedState 113, SUPERSEDES 47, :Facility 21, REANCHORS 19, :PolicyVersion 18, USED 18, AUTHORIZED_BY 15, ASSESSES_APPLICABILITY_TO 14, HAS_PRICE_OBSERVATION 13, HAS_EVIDENCE_TARGET 13
  repo consumers naming v1-only types/fields (quoted or label-like uses): evals 2 files, examples 1, biotech-* skills 4, python 1, graphql-api 1, executor app 1, kg-ops src 4, contracts src 5, sidecars 3
```

Iterations: run 1 counted mutation operations as valid (graphql.validate has no rule for a missing Mutation root; added an explicit check: 11 valid → 4) and matched skills under every path containing "biotech-" (the worktree path itself); run 2 matched prose words ("Community", "CONTAINS"); the final run restricts name matches to quoted / label-like uses and to `.agents/skills/biotech-*`, and the graphql-api scan to `src/`, Dockerfile, fly.toml, package.json.

Spot checks used in the notes:

```
$ node (apps/graphql-api) per-operation validate of the 25 replay GraphQL operations against the printed v2 API
  valid: roundtrip "read product back", "read Cypher-ingested assertion", T2d, T4d; mutations (no Mutation root): roundtrip 3 + T5 4;
  others: Query.documents, Query.sourceRevisionEvents, Query.equivalenceAssessments, type FormulationVersion, Assertion.supersedesConnection/massBasis/quantityBasis/predicateClass,
          Adjudication.status/supersedesConnection/considersAssessments, SourceLocator.artifactType, Source.sourceKindNote/renditionOfPublication/revisionEvents, Activity.usedAssertions, ActivityKind ANSWER_COMPOSITION
$ grep -l (packet intents) -> Publication.revisionStatus RETRACTED|NONE_KNOWN: D3 aspree-registry-history-harm, dq-bone-trial-unstructured, resveratrol-retraction
                              roleTitleVerbatim|stakeClassVerbatim: D7 ×5, D9 ×3; searchText: D1 ×4, D4 ×6; mention.stage: 14 intents; GTIN/UPC/EAN/ASIN/SKU schemes: 5 intents
$ node (IR) v1 SPONSORS_CONTENT Organization|ConsumerBrand → Channel|Conference|Document|Episode|Series; v2 CONTENT_SPONSORED_BY MediaWork → Brand|Organization (direction reversed)
$ read W00/fixtures/00-common-base.cypher, 06-two-archetype-labels-must-fail.cypher, W07/fixtures/w07-00-sources.cypher -> v1 property/enum shapes (activityKind EXTRACTION, entityType, artifactType, sourceKind genre values, SourceLocator.uri, selectorKind SECTION)
```

## 7. Data-migration statements (EXPLAIN only, bks-neo4j-synth, Neo4j 5.26)

```
$ docker exec bks-neo4j-synth cypher-shell -u neo4j -p *** --format plain "EXPLAIN <stmt>"   (8 statements, as printed in migration-notes §5.8)
OK  MATCH (n) WHERE n.mongoResearchRunId IS NOT NULL CALL { … } IN TRANSACTIONS OF 10000 ROWS
OK  MATCH ()-[r]->() WHERE r.mongoResearchRunId IS NOT NULL CALL { … } IN TRANSACTIONS OF 10000 ROWS
OK  MATCH (a:Assertion)-[r:SUPPORTED_BY]->(l:SourceLocator) CALL { … MERGE (a)-[e:HAS_EVIDENCE]->(l) … } IN TRANSACTIONS OF 10000 ROWS
OK  MATCH (a:Assertion)-[r:CONTRADICTED_BY]->(l:SourceLocator) CALL { … } IN TRANSACTIONS OF 10000 ROWS
OK  MATCH (adj:Adjudication)-[r:EVALUATES]->(a:Assertion) CALL { … MERGE (adj)-[:ASSESSES]->(a) DELETE r } IN TRANSACTIONS OF 10000 ROWS
OK  MATCH (act:Activity) WHERE act.externalRunId IS NOT NULL AND act.runId IS NULL SET act.runId = act.externalRunId REMOVE act.externalRunId
OK  MATCH (n:ConsumerBrand) SET n:Brand REMOVE n:ConsumerBrand
OK  MATCH (n:VersionedState) REMOVE n:VersionedState
```

## 8. Output

```
$ node <scratch>/mig/assemble-notes.cjs <scratch>/mig/migration-notes.head.md final/_work/diff-v1-v2.tables.md final/migration-notes.md
  -> final/migration-notes.md 176,688 B, 1,436 lines; appendices A1, A2, A3, A4, A5, A7, A8 copied verbatim from the generated tables (A6, the per-type field diff, stays in _work/diff-v1-v2.tables.md)
```
The narrative (sections 0–8) was written from the numbers in §§3–7; line references were re-checked with grep (plan.ts assertionProps :449–485, read.ts assertion.trace :139–154 and gap test :151, resolve.ts catch :119, server.ts loadPinnedSdl :103, createNeo4jGraphQL :163, excludeDeprecatedFields :168).
