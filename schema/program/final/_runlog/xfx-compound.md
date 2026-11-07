# Runlog: cross-domain fixture 1, compound profile (xfx-compound)

Stage: S, cross-domain fixture 1 (D1+D2+D3+D6). Agent: claude-opus-5-5 (S sub-agent). Date: 2026-10-09 (UTC).
Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`. I wrote only under
`schema/program/final/fixtures/cross-domain/compound-profile/` and this runlog. Scratch is
`C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/xfx-compound/`
(`$SCR` below). Raw captures are in `$SCR/fresh/` and the build scripts in `$SCR/`; neither is committed. No `.env` value was read or printed.
Nothing was committed.

Output: `final/fixtures/cross-domain/compound-profile/` with `source.md`, `locators.yaml`, `assertions.yaml`, `intent.json`, `questions.md` and `walk.md`.

## 1. Inputs read

- `schema/program/fast-track/03-SYNTHESIS.md`: deliverables, and step 8 (fixtures; the planner check "where feasible").
- `final/schema-map.md` totals: 69 node types, 106 relationship types, 848 expanded pairs, 16 unions.
- `final/_work/rulings.yaml`, the rulings relied on:
  - R-14 node values are caches of FIELD Assertions;
  - R-15 a Publication may be the asserter;
  - R-16 asserter defaults;
  - R-22 one episode per asserter;
  - R-26 structural vs asserted;
  - R-27 MENTIONS are retrieval only;
  - R-42 identifier uniqueness;
  - R-47 AFFECTS_MECHANISM score null;
  - R-52 predicate registry;
  - R-59 EstimateDirection;
  - R-82 FUNDED_BY;
  - R-89 interest edges.
- `final/schema/final_biotech_schema_v2.ir.json`. `node $SCR/dump-ir.js <types>` wrote `$SCR/ir-dump.txt`: 69 nodes, every relationship triple (concrete from → to),
  16 unions, 20 edge property types and 193 enums. The type-checker in step 4 reads the same IR.
- `final/relationship-register.yaml` predicateOnly list (the 11 FIELD predicates in step 4 are checked against it).
- `final/query-patterns.md` (sha256 `ed6ab40c46ccc52c406da25856e87db5067775953499f67c67ae579ecaac3fa5`). It appeared while this stage was running, and the walk runs its
  P-xx blocks unchanged (step 7). Earlier, the walk used K's trace convention from `packets/K/03-retrieval-patterns.md` (Q-K-01..03).
- Packet fixtures reused:
  - `packets/D1/07-fixtures/nr-trial-unstructured` (Conze dose basis, printed registry id);
  - `packets/D1/07-fixtures/nr-salt-moiety-us-canada` (GSRS, DSLD 323170);
  - `packets/D2/07-fixtures/nr-muscle-unstructured` (Elhassan 2019);
  - `packets/D6/07-fixtures/label-versions-truniagen-dsld`;
  - for shapes only: `packets/D3/07-fixtures/aspree-registry-history-harm/assertions.yaml` (StudyResult / STATED_IN) and `packets/D3/09-reasoning.md` (applicability vocabulary).
- `packets/D10/answer-kind-table.md` gives the kinds in `questions.md` (grep per question id).
- Compound chosen: **nicotinamide riboside**, as the chloride salt in the branded material NIAGEN. It is the one compound that the D1, D2 and D6 packet fixtures all touched,
  and D3-shaped trial records exist for it (NCT02712593, NCT02950441).

## 2. Fresh captures (all re-fetched 2026-10-09 with curl; MCP and Firecrawl were not needed)

Command: in `$SCR/fresh`, one `curl -sS -L -A <UA> -o <file> -w "<file> http=%{http_code} bytes=%{size_download}"` per URL, then `date -u`.

| file | url | http | bytes | retrievedAt (UTC) |
| --- | --- | --- | ---: | --- |
| gsrs_8XM2XT8VWI.json | https://gsrs.ncats.nih.gov/api/v1/substances(8XM2XT8VWI)?view=full | 200 | 16358 | 2026-10-09T04:16:57Z |
| gsrs_0I8H2M0L7N.json | https://gsrs.ncats.nih.gov/api/v1/substances(0I8H2M0L7N)?view=full | 200 | 19145 | 2026-10-09T04:16:58Z |
| epmc_PMC6611812_fulltext.xml | https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6611812/fullTextXML | 200 | 146708 | 2026-10-09T04:17:00Z |
| ctgov_NCT02712593.json | https://clinicaltrials.gov/api/v2/studies/NCT02712593 | 200 | 8747 | 2026-10-09T04:17:00Z |
| epmc_PMC6702140_fulltext.xml | https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6702140/fullTextXML | 200 | 189550 | 2026-10-09T04:17:02Z |
| ctgov_NCT02950441.json | https://clinicaltrials.gov/api/v2/studies/NCT02950441 | 200 | 6822 | 2026-10-09T04:17:02Z |
| dsld_323170.json | https://api.ods.od.nih.gov/dsld/v9/label/323170 | 200 | 4452 | 2026-10-09T04:17:03Z |
| ctgov_NCT0271593.txt | https://clinicaltrials.gov/api/v2/studies/NCT0271593 | 404 | 31 | 2026-10-09T04:20:28Z |
| quickgo_GO0006476.json | https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/GO:0006476 | 200 | 603 | 2026-10-09T04:20:29Z |
| ols_chebi_15846.json | https://www.ebi.ac.uk/ols4/api/ontologies/chebi/terms?obo_id=CHEBI:15846 | 200 | 9115 | 2026-10-09T04:20:30Z |
| ols_chebi_18304.json | https://www.ebi.ac.uk/ols4/api/ontologies/chebi/terms?obo_id=CHEBI:18304 | 200 | 7789 | 2026-10-09T04:20:30Z |
| ols_uberon_0001379.json | https://www.ebi.ac.uk/ols4/api/ontologies/uberon/terms?obo_id=UBERON:0001379 | 200 | 7121 | 2026-10-09T04:58:16Z |
| ols_uberon_0000178.json | https://www.ebi.ac.uk/ols4/api/ontologies/uberon/terms?obo_id=UBERON:0000178 | 200 | 10596 | 2026-10-09T04:58:17Z |

`sha256sum` (RAW_BYTES):

```
1a3167f256ef0426c33d505f49e91c523392046d0edcbec97c9d36c976eab58b  gsrs_8XM2XT8VWI.json
3316792f5779d6e2a6c179ae2d5956d662250736e9c35a209f678ed434a8a9ad  gsrs_0I8H2M0L7N.json
ae7b5a420c48282b6604bd3c6e22ac818dcd0fc5a9fbaba0d45abf62e34661d2  epmc_PMC6611812_fulltext.xml
b4f637f2a707990d2b651a3c926982fdbc2e78a02be6ac5488f7d4c0ab1ffdaf  ctgov_NCT02712593.json
fb1c0ad79ed4a06783c98d48dd51e7ec0a9640f71d8233626bdbd7c245820a03  epmc_PMC6702140_fulltext.xml
79e06200c9ddbe0d461add746395259ea3995ddfee7f16bf235ee5b2c17fdf48  ctgov_NCT02950441.json
d90025929a353034c6c549b41eb1558e7673ce3eba2a0109ca48fed9830c003d  dsld_323170.json
9707cbeb19b1c589560a481b948ce6a043990896f5c6402c517123bc0cbef04e  ctgov_NCT0271593.txt
211c7658247aad552093bdf79dabdb185ac9c67eba96a09b658de8baf84415cc  quickgo_GO0006476.json
cd764d214432cb22a109642d1b5e34e6f472785e7cabdc930ccc9835aba12353  ols_chebi_15846.json
e6c08e08954519be0e1373b8409da14543f04afec3bb30e81b1c15340d356cae  ols_chebi_18304.json
dbbd73a9f8762f0a59f9b2ecce50cccf1f4299c71042fd394b4217c4b3539dbf  ols_uberon_0001379.json
e6a51f559811919b854cc6f88e7490e3ac7dd7d2148c0d6628386f151605252d  ols_uberon_0000178.json
```

**Comparison with the packet captures of 2026-10-08.**

- Byte-identical to the digests the packets record (D1 nr-salt-moiety-us-canada, D1 nr-trial-unstructured, D2 nr-muscle-unstructured): both GSRS records,
  both Europe PMC JATS files, NCT02950441, DSLD 323170 and the 404 body.
- Changed: NCT02712593 (8,747 bytes today; D1 recorded 8,748 bytes, sha256:120b38f3…). Every value quoted from it was re-selected in today's bytes.

**Content probes.** Run with `python -I` and stdout utf-8; they read the captures to choose quotes and found:

- GSRS: version 18 (salt) and 24 (cation); codes UNII, CAS, PUBCHEM, CHEBI and DRUG BANK; `relationships[0].type` "ACTIVE MOIETY"; mwt 290.7006 / 255.2476.
- Conze 2019:
  - the abstract;
  - the Results "Blood NAD+" paragraph (Par26), where the day-14 sentence reads "142 ± 14%";
  - the AE paragraph (Par28: "Ninety-five AEs were reported by 61 participants"; "There were no serious AEs …");
  - the Figure 3 caption ("Error bars represent standard error of the mean.");
  - the competing-interests note ("ChromaDex funded the study.");
  - the Brenner `<contrib>` with ORCID 0000-0002-4955-3226.
- Elhassan 2019: the Results (acetylation; NAAD / NAD+), the line "NR chloride (Niagen) … 250-mg capsules (ChromaDex)", the Declaration of Interests, and the registry
  id in the STAR Methods.
- Registries:
  - NCT02712593: secondary outcome "Blood Nicotinamide Riboside Metabolites", placebo arm typed EXPERIMENTAL, `hasResults` false;
  - NCT02950441: arm description "1000mg (2x250mg tablets twice daily)", status UNKNOWN / last known RECRUITING.
- DSLD 323170: ingredientRows (Niagen 300 mg, form Nicotinamide Riboside Chloride 8XM2XT8VWI), maxDailyServings 3, "Distributed by" / "ChromaDex, Inc", entered 2025-04-24.

## 3. Locators (`python -I $SCR/build_locators.py $SCR/fresh $SCR/locators.json`)

Every quote is cut from the capture by start and end anchors and is never typed. Offsets are 0-based code points into the UTF-8-decoded raw bytes, end exclusive.
`quoteHash` is the sha256 of the exact text. A JSON_POINTER quote must contain the pointer's value. The re-selection `snapshot[start:end] == exact` is checked.
Final run: `snapshots=13 locators=99 failures=0`. Notes: `l-cz-mention-nrcl` occurs 3 times (first occurrence used, as in D1), and `l-cz-sem` occurs 2 times (the Figure 3 caption, selected by anchor).
The Conze offsets match packet D1's for the shared spans (l-cz-capsule 28769, l-cz-arms 29785, l-cz-registry 22841, l-cz-period 36701, l-cz-gras 5731).
The chunk `<sec id="Sec6">` span 28532–30482 has span digest `sha256:564450bd…`, which equals D1's chunk-sec6 `spanDigest`.

## 4. Build and type-check against the final IR (`python -I $SCR/build_fixture.py $SCR <IR> $SCR/out`)

Final run (builtAt 2026-10-09T05:01:14Z): `errors 0`;
`counts nodes=67 assertions=80 assessments=12 adjudications=80 structural=36 derived=9 chunks=2 locators=99 snapshots=13` (plus 2 RENDITION_OF assertions and their 2 adjudications).
The fixture uses 27 node types and 39 relationship types.

**What the type-check covers:**

- every node type and property is in the IR;
- enum values are checked against the IR enums;
- required properties are present;
- every typed edge's (from, to) is an IR triple;
- edge-property keys and enums are checked, as are required edge properties;
- ASSERTED_BY, HAS_SUBJECT and HAS_OBJECT targets are allowed for the referenced types;
- every evidence locator exists;
- a typed edge's type equals its Assertion's predicate;
- no predicate-only assertion uses a relationship-type name;
- every propertyEvidence locator exists.

**Fixes made during the build:**

- The first run gave 22 errors `HAS_OBJECT -> Identifier`: Identifier is Entity-only, not Subjectable. HAS_IDENTIFIER assertions now carry a literal object (`scheme:value`),
  and the typed episode points at the Identifier node. That is the kernel convention in the SDL docstring.
- The first cut had 16 locators that no record cited. Each node now carries a `propertyEvidence` map (R-14), and `verify_yaml.py` reports `unusedLocators=[]`.

**Typecheck notes.** These are not errors: 11 FIELD predicates are not in the final predicateOnly list (DOSAGE_FORM ×3, DURATION_ISO, MAX_DAILY_SERVINGS, MOLECULAR_FORMULA, MOLECULAR_WEIGHT ×2,
QUANTITY ×2, REGISTRY_ID_AS_PRINTED). Ten of them follow the R-14 property-name convention. `final/vocabularies/predicates.yaml` (R-52) does not exist, so their registration
cannot be checked. REGISTRY_ID_AS_PRINTED is packet D1's predicate and is not registered in the final register.

**Computed numbers** (command `python -I -c …`, output recorded):

- ratio 255.2476 / 290.7006 = 0.878043;
- trial 1000 mg salt → 878.04 mg cation;
- label 300 mg salt → 263.41 mg cation;
- label maximum 900 mg/d salt → 790.24 mg/d cation;
- label maximum / trial top arm = 0.9; in P-03, score = study / use = 1000 / 900 = 1.11;
- UPC 850015311116: computed check digit 6 = printed 6; GTIN-14 00850015311116.

**Digests computed by the builder:**

- `LabelVersion.contentDigest` / `compositionDigest`: sha256 of canonical JSON of DSLD panel fields;
- `payloadHash` of arms: the locator quoteHash; of components: sha256 of canonical properties; of RegistrationVersion: the snapshot hash.

These are this fixture's own canonicalization and are not comparable with packet D6's digests.

## 5. Intent (`python -I $SCR/gen_intent.py …` and `node $SCR/validate_intent.mjs <worktree> $SCR/out/intent.json`)

`subjects=42 proposals=103 sources=13 locators=99 notExpressed=13 errors=0`, made of edge.assert 37, edge.structural 31, identifier.attach 22 and assertion.literal 13.
Validation against `packages/contracts` IngestionIntent (zod) printed `OK … 103 proposals, 42 subjects, 13 sources, 99 locators`.
The gen_intent check confirms that every nodeType, triple and subject property exists in the final IR. `schemaDigest` = the candidate IR digest.

Not expressible in intent v1 (listed in `intent.json` notes):

- predicate-only object assertions (FUNDED_BY, 4 mechanism assertions, 3 COMPUTATION assertions with an object);
- OBSERVED_IN_CONTEXT;
- Assessments and Adjudications;
- DERIVED_FROM inputs;
- the asserters of identifier.attach;
- RENDITION_OF;
- D9 chunks and derived edges;
- run-lineage edges between Activities.

**Planner check (03-SYNTHESIS step 8): not feasible here.** `node packages/kg-ops/dist/cli.js kg plan` loads `SchemaModel.fromWorkspace()`, which reads the pinned workspace.
`bks-schema build` has no SDL override, and pointing it at the candidate would mean editing `workspace/` or the scripts. Both are out of scope for S.

## 6. Graph load on the disposable Neo4j (`bks-neo4j-synth`, bolt 7691)

1. `python -I $SCR/gen_cypher.py $SCR <IR>` wrote `$SCR/load.cypher` (1,573 statements in the final run). Labels come from the IR. Every node and edge carries `fixtureTag: 'xfx-cp'`.
2. Loaded with `docker cp` + `docker exec bks-neo4j-synth cypher-shell -u neo4j -p bks-test-password -f /tmp/xfx-cp-load.cypher`.
3. The first ever load stopped at one statement with "Could not compile query due to insanely frequent schema changes" (354 nodes, 987 of 1,030 rels).
   After `cleanup.cypher` (`MATCH (n {fixtureTag: 'xfx-cp'}) DETACH DELETE n`), the reload was complete. The final run loaded 370 nodes and 1,203 relationships.
4. The synth DB also held 203 untagged nodes from another S fixture (cross-domain fixture 2). With an identifier-value entry, my first W1 returned their NR nodes too.
   The value-entry statements W1, W7a, W7d and the walk version of P-03 are therefore scoped by `fixtureTag` and marked as harness-only. No other container was touched and no volume was pruned.

## 7. Walk queries (all on the loaded fixture graph)

- **Fixture walk W0–W10** (`$SCR/walk/queries.cypher`, split per id). Each statement ran as `EXPLAIN` and then for real (`--format plain`).
  `EXPLAIN-OK count: 11` for W1–W10 and 1 for W0. Outputs are in `$SCR/walk/results.txt` and `results-W0.txt`; walk.md quotes them.
- **`final/query-patterns.md` blocks**, extracted by `@id` and run unchanged with fixture parameters (`python -I $SCR/walk/run_patterns.py <query-patterns.md> $SCR/walk/patterns`).
  All 14 were ok. Rows returned:

  | statement | rows | statement | rows |
  | --- | ---: | --- | ---: |
  | P-01b | 5 | P-04e | 5 |
  | P-01c | 82 | P-10a | 27 |
  | P-02a | 6 | P-10a.2 | 13 |
  | P-02b | 2 | P-10a.3 | 94 |
  | P-03 | 5 | P-10a.4 | 3 |
  | P-04b | 8 | P-10b | 2 |
  | P-04d | 5 | P-12 | 1 |

  Block sha256 prefixes are in `patterns-results.txt`.
  - Before restructuring, P-03 needed the D3 vocabulary shape: a parent `D3.applicability` plus `D3.applicability.dimension` children with `conclusionCode`, `facets`
    `dimension=` / `missing=` and `score`, ASSESSING the Study and a ProductVariant. The fixture was rebuilt to that shape.
  - P-01/P-04 read `expectedSelectedContentDigest`, so every HAS_EVIDENCE now carries it (= locator quoteHash).
  - P-12 read `compartmentOntologyId`, so the UBERON captures were added.
  - P-01c had flagged the 2 RENDITION_OF assertions as unadjudicated, so they now have adjudications.
- **GraphQL.**
  - Validation: `node $SCR/walk/validate_graphql.mjs <graphql@16.14.2> <printed> $SCR/walk/graphql-walk.graphql` printed `OK: 4 operations valid` against
    `synth/integrate/printed-deployed.graphql` (1,735,213 B, sha256 269a1534…) and against `printed-L3.graphql`.
    In the first draft, `assertions.subject` needed the `some` filter (`SubjectableRelationshipFilters`); fixed.
  - Execution: `node $SCR/walk/exec_graphql.mjs <worktree> <final SDL> …` used `createNeo4jGraphQL` from `apps/graphql-api/dist/server.js` with an explicit driver to
    bolt://localhost:7691 (no server, no env credentials). The first attempt used the ESM graphql instance and failed in `assertSchema` (two graphql realms);
    the fix was to require the CJS instance next to `@neo4j/graphql`.
    Final: schema built in 1,335 ms; G1 ok 245 ms, G2 ok 139 ms, G3 ok 2,794 ms, G4 ok 1,083 ms. Output is in `$SCR/walk/graphql-results.json`.
- **Full pipeline.** `bash $SCR/run_all.sh` ran end to end: captures check, build, intent, source.md, copy to final, `verify_yaml.py`, load, walk, patterns, GraphQL, cleanup. Exit 0.
  - `verify_yaml.py` re-parses the written YAML, re-hashes every capture and re-selects every quote: `snapshots=13 locators=99 evidenceRefs=149 assertions=80 assessments=12 failures=0 unusedLocators=[]`.
  - Cleanup: `MATCH (n {fixtureTag:'xfx-cp'}) DETACH DELETE n`, then `rm -f /tmp/xfx-cp-*.cypher` in the container. Check: `remainingFixtureNodes 0`.

## 8. Findings handed to the finalizer (details in walk.md "What the walk found")

1. The compound-first join runs in Cypher. In GraphQL it must be written owner-first with nested `some` filters, because IngredientMaterial / ChemicalSubstance have no inverse fields
   for ADMINISTERS, DECLARES_COMPONENT, REALIZES_SUBSTANCE or HAS_ACTIVE_MOIETY, and entities have no field to their Assertions. Assertion has no field to its MechanismEvidenceContext.
2. Multi-asserter asserted edges (REALIZES_SUBSTANCE, ADMINISTERS) duplicate traversal rows unless the query de-duplicates.
3. P-10a.2 cannot see HAS_IDENTIFIER authorizations (literal-object Assertions). There are 22 in this fixture.
4. P-01c flags CALCULATED assertions as `noLocator`, and every snapshot here as `irreproducible`, because there is no durable `storageUri`.
5. The "one locator per reported number" rule has no field on `EvidenceEdgeProperties`: there is `facet` but no field name. Two numbers sharing a locator give identical HAS_EVIDENCE edges.
6. Two cross-domain fixtures minted separate Identifier nodes for UNII 0I8H2M0L7N. Merging them under `identifier_key` (R-42) would join the compound profile to the product comparison.
7. Predicate gaps: `final/vocabularies/predicates.yaml` is absent, and REGISTRY_ID_AS_PRINTED is unregistered.

## 9. Files written

- `schema/program/final/fixtures/cross-domain/compound-profile/source.md`: 13 blocks; the first `kind:` line is `unstructured-to-entity`.
- `…/locators.yaml`: 13 snapshots, 99 locators.
- `…/assertions.yaml`:
  - 67 nodes, 13 sources, 2 chunks;
  - 80 assertions + 2 RENDITION_OF;
  - 12 assessments, 80 adjudications (82 in the graph with the renditions');
  - 36 structural and 9 derived edges.
- `…/intent.json`: biotech-knowledge-intent.v1, 103 proposals, valid.
- `…/questions.md`: 32 question rows plus the cross-domain question.
- `…/walk.md`.
- `schema/program/final/_runlog/xfx-compound.md`: this file.
