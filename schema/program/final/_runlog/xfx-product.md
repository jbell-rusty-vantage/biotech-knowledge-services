# Runlog: cross-domain fixture 2, product comparison (D6+D1+D8), S team, 2026-10-09

Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`. Shell: Git Bash. `$F` = `.../schema/program/final`; `$SP` = `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/xfx-product`. Writes only under `$F/fixtures/cross-domain/product-comparison/` and this file; raw captures and scripts stay in `$SP` (not committed). No .env value printed. Nothing committed.

## 1. Orientation (read-only)

```
node -e '<dump of $F/schema/final_biotech_schema_v2.ir.json: nodes, relationshipTypes, enums>' > $SP/typemap.txt
→ 69 node types; relationship types used here: DECLARES_COMPONENT (LabelVersion→IngredientMaterial, ComponentLineProperties),
  HAS_LABEL_VERSION, HAS_VARIANT, HAS_PACKAGE, NAMES_RESPONSIBLE_PARTY, REALIZES_SUBSTANCE, HAS_ACTIVE_MOIETY, COVERS
  (CertificationListing→Product|ProductVariant|Lot), ISSUED_BY, LOT_OF, USES_CRITERION, HAS_ITEM, ASSESSES, DERIVED_FROM,
  HAS_SUBJECT/HAS_OBJECT/ASSERTED_BY/HAS_EVIDENCE/WAS_GENERATED_BY (kernel)
  enums checked: MassBasis {SALT_FORM ACTIVE_MOIETY NUTRIENT_EQUIVALENT MATERIAL_AS_IS UNSPECIFIED}, CriterionKind {SCORE BLOCK FILTER TIEBREAK},
  CriterionDirection, OptionDisposition {SELECTED ALTERNATIVE REJECTED BLOCKED NOT_EVALUATED}, CertifiedObjectKind, ReportKind (COMPARISON)
grep rulings: R-14 (FIELD assertions), R-40 (intent v1 gap), R-52 (predicate registry), R-73 (COVERS→ProductVariant kept with a fixture request), R-85, R-87 (one Assertion per label line)
```

## 2. Candidate search (probe; not the fixture captures)

```
curl -s "https://api.ods.od.nih.gov/dsld/v9/search-filter?q=%22nicotinamide%20riboside%22&size=100" → 93 hits
  chosen: 323170 Tru Niagen 300 mg (ChromaDex), 323125 NiaCel 400 (Thorne, entered 2025-01-23), 333430 Liposomal Nicotinamide Riboside+ (Codeage)
  probe of labels: 323170 row "Niagen" 300 mg, form Nicotinamide Riboside Chloride (UNII 8XM2XT8VWI);
                   323125 row "Nicotinamide Riboside Hydrogen Malate" 415 mg, no form, maxDailyServings 1;
                   333430 row "Nicotinamide Riboside" 500 mg, no form; also 270933/205969 Basis (Elysium) 250 mg per 2 caps, no form (not used)
curl GSRS search "NICOTINAMIDE RIBOSIDE MALATE" → total 0; "nicotinamide riboside" → 108 (only 0I8H2M0L7N and 8XM2XT8VWI are NR records)
curl PubChem name "nicotinamide riboside hydrogen malate" → PUGREST.NotFound; "nicotinamide riboside malate" → CID 146673021, C15H20N2O10, MW 388.33
curl nsfsport.com search-results.php?keyword=niacel → listing-detail.php?id=1423140 (Thorne NiaCel 400, lot-scoped)
curl nsfsport.com listing-detail.php?id=1263423 → TRU NIAGEN 300mg, Lot # All, Package Size 30, 60, 90
curl info.nsf.org Listings.asp?TradeName=nicotinamide& → NSF/ANSI 173, Codeage LLC, Liposomal Nicotinamide Riboside+, Product ID All
firecrawl_scrape (MCP, maxAge 0) https://www.thorne.com/products/dp/niacel-400 → JS-rendered comparison widget says "Nicotinamide Riboside 415 mg";
  raw HTML (curl, 397,651 B) carries only "Nicotinamide Riboside Hydrogen Malate" / "415mg"; the widget text is not in the raw bytes → not used

## 3. Fresh captures (the fixture's snapshots)

```
bash $SP/bin/capture.sh $SP/raw < $SP/bin/sources.tsv   (first 10 rows), then < $SP/bin/sources2.tsv (last 3 rows; see 'Later additions')
  (curl -s -m 90, browser User-Agent; prints key, url, retrievedAt, http, bytes, sha256)
  dsld_323170.json  2026-10-09T04:19:41Z  http 200  4452 B  sha256:d90025929a353034c6c549b41eb1558e7673ce3eba2a0109ca48fed9830c003d
  dsld_323125.json  2026-10-09T04:19:42Z  http 200  4933 B  sha256:f76f932080400688993edc41e571dad97bee30f9f40b88f3ef6ce4dc73997ff0
  dsld_333430.json  2026-10-09T04:19:43Z  http 200  6295 B  sha256:bbb1d1a2564c059191c852a251233182e1076ca434a1eb184cf2bdeb1d22b2ba
  gsrs_8XM2XT8VWI_full.json  2026-10-09T04:19:44Z  http 200  16358 B  sha256:1a3167f256ef0426c33d505f49e91c523392046d0edcbec97c9d36c976eab58b
  gsrs_0I8H2M0L7N_full.json  2026-10-09T04:19:44Z  http 200  19145 B  sha256:3316792f5779d6e2a6c179ae2d5956d662250736e9c35a209f678ed434a8a9ad
  pubchem_146673021_props.json  2026-10-09T04:19:45Z  http 200  373 B  sha256:5497e09d836271cf139dedc45ced8190420463faee3452217fe0194d2d4ed0e5
  pubchem_146673021_synonyms.json  2026-10-09T04:19:46Z  http 200  607 B  sha256:16442d4def5e2d9895b0e3d6098efbd34f51a900cf4f51d3ecf8c3c85ff29ef7
  nsfsport_1263423.html  2026-10-09T04:19:47Z  http 200  19949 B  sha256:e0f0b05e0c911848b23eda2005e4bcfec064eceaac7f25dcb2bad30d329262a8
  nsfsport_1423140.html  2026-10-09T04:19:47Z  http 200  19988 B  sha256:fe7f5eb6fb379c4016c354b23d75b59222b05ae04b8c5865739aa61a0c224a51
  nsf173_nicotinamide.html  2026-10-09T04:19:48Z  http 200  10049 B  sha256:b0045665dcae22dff20594e82b4e19e747e1ec1700346d487f78c609f78dd943
  dsld_298081.json  2026-10-09T04:21:29Z  http 200  4891 B  sha256:3fea23ce9945b8498be75864b118c12a5214bc582cc771b571649de9a298b332
  thorne_niacel400.html  2026-10-09T04:21:29Z  http 200  397634 B  sha256:572faadab7de6f04d87a9dc2dfc5d24681a0ea55c649d71cfae56437df3a8a83
  truniagen_300mg.js  2026-10-09T04:21:31Z  http 200  16441 B  sha256:4c2f6a1c3c33b4e5f64353b733bb18fa1ec1249e62054b30c2cd8681255c090a
```
Cross-checks with packet fixtures: dsld_323170.json and both GSRS records are byte-identical to packets/D1/07-fixtures/nr-salt-moiety-us-canada
(sha256 d9002592…, 1a3167f2…, 3316792f…); truniagen_300mg.js is byte-identical to D6 offer-roles-price-kinds-truniagen shopify-tn-live (4c2f6a1c…).
All captures decode as UTF-8.

## 4. Locators

```
python -I $SP/bin/build_locators.py $SP/raw $SP/captures.tsv $F/fixtures/cross-domain/product-comparison/locators.yaml $SP/locators.json
→ ok snapshots=13 locators=66 (every quote re-selected from the raw bytes; sha256 of each capture re-checked against captures.tsv)
  occurrencesInSnapshot = 1 for 65 locators; l-th-price-visible = 2 (the Thorne page renders the price block twice; first occurrence selected)
  offsets of the DSLD 323170 locators equal D1's (l-tn-qty 3286–3327, l-tn-row 3540–3647, l-tn-form 3739–3850, l-tn-maxdaily 1216–1267)
```

## 5. Derived amounts (rule:mw-ratio.v1, rule:daily-max.v1; inputs are the located MW and label values)

```
python -I -c "<mw_nr=255.2476 (GSRS 0I8H2M0L7N v24); mw_cl=290.7006 (GSRS 8XM2XT8VWI v18); mw_mal=388.33 (PubChem CID 146673021)>"
→ ratio chloride 0.8780429073761802; ratio hydrogen malate 0.657295599103855
  Tru Niagen 300 mg salt → 263.41287221285404 mg NR/capsule; × 3 servings/day → 790.2386166385621 mg/d; salt 900 mg/d
  NiaCel 400 415 mg salt → 272.7776736280998 mg NR/capsule; × 1 (label 323125) → 272.78 mg/d; × 2 (label 298081) → 545.5553472561996 mg/d
  PubChem-only cross-check 415 × 255.25/388.33 = 272.7802384569825 (same to 0.1 mg)
  Tru Niagen price: 4900 cents / (30 × 263.41287) mg × 100 = 0.6200658759050689 USD per 100 mg NR (one-time, 30-count)
  Codeage 500 mg, mass basis unstated: not derived (sensitivity only: 500 × 0.87804 = 439.0214536880901 if it were the chloride salt)
```

Later additions to the captures and locators (same procedure; captures.tsv appended; the sources2 rows are also listed in section 3):
```
bash $SP/bin/capture.sh $SP/raw < $SP/bin/sources2.tsv
  dsld_298081.json  2026-10-09T04:21:29Z  http 200  4891 B  sha256:3fea23ce9945b8498be75864b118c12a5214bc582cc771b571649de9a298b332
  thorne_niacel400.html  2026-10-09T04:21:29Z  http 200  397634 B  sha256:572faadab7de6f04d87a9dc2dfc5d24681a0ea55c649d71cfae56437df3a8a83
  truniagen_300mg.js  2026-10-09T04:21:31Z  http 200  16441 B  sha256:4c2f6a1c3c33b4e5f64353b733bb18fa1ec1249e62054b30c2cd8681255c090a
curl PubChem .../cid/146673021/cids/JSON?cids_type=component → CID [222656, 439924]   (probe; then captured:)
  pubchem_146673021_components.json  2026-10-09T04:25:19Z  http 200  76 B  sha256:a16db13d60129ad317900a757a864a692f7988628de97f796e04775af9aba174
grep GSRS 0I8H2M0L7N: "codeSystem":"PUBCHEM","code":"439924","type":"PRIMARY" (1 occurrence)
grep thorne_niacel400.html: '"price":44' 1 occurrence; '>$74<' 1 occurrence (the rendered block appears twice with its spans)
python GTIN check: 8 50015 31111 6 → 00850015311116 ok; 850015311857 → 00850015311857 ok; 6 93749 01208 5 → 00693749012085 ok; 8 50049 60921 0 → 00850049609210 ok
UNII locators re-anchored on the record's top-level approvalID ("access":["admin"]}],"approvalID":…): the first plain occurrence of 0I8H2M0L7N is a relatedSubstance reference
python -I $SP/bin/build_locators.py … → ok snapshots=14 locators=77 (all quotes re-selected; every capture digest re-checked)
```

## 6. Fixture records, IR checks, intent

```
python -I $SP/bin/build_fixture.py $F/schema/final_biotech_schema_v2.ir.json $SP/locators.json $F/fixtures/cross-domain/product-comparison $SP
  checks: node types, property names, required properties, enum values (node props, Assertion fields, ComponentLineProperties, TimePrecision),
  typed (type, from, to) triples for every asserted and structural edge, HAS_SUBJECT/HAS_OBJECT/ASSERTED_BY/ASSESSES/DERIVED_FROM/HAS_ITEM/USES_CRITERION
  pairs, edge-property names, locator refs, derivedFrom refs, body citations, unique ranks; every CALCULATED number recomputed from the quotes
  run 1 → 5 errors (AgentKind LLM_AGENT/SERVICE, ListingKind BRAND_STORE not in enums) → fixed (AUTOMATED_AGENT, DATA_ANALYSIS_PIPELINE, DTC_PRODUCT_PAGE; TimePrecision has no SECOND/MINUTE → INSTANT)
  run 3 → 31 errors: (Assertion)-[:HAS_OBJECT]->(Identifier) not in IR → identifier assertions rewritten per K 09 item 3 (literal scheme:value, HAS_IDENTIFIER edge to the Identifier)
  final → ok entities 97 assertions 111 assessments 5 items 8 typesUsed 15; unused locators []
  calc tn 263.4128722128540498368424420 / 790.2386166385621495105273260; nc 272.7776736280998120155537816 / 272.7776736280998120155537816; nc0 … / 545.5553472561996240311075632
  composed-body.txt bodyDigest sha256:8701c9c51404081b2c35c73d05b7cbada680e8d39a44e9f98ac77edb9bcaa36b (3,061 B), citationCompleteness 0.667 (10 of 15 sentences cite; SCOPE 4 and INTERESTS 1 uncited framing, OPTIONS rows 0 uncited)
python -I $SP/bin/emit.py <IR> $SP/locators.json $SP/fixture.json $F/fixtures/cross-domain/product-comparison $SP
  → assertions.yaml; intent proposals 155, subjects 57, sources 14, excluded 13 (R-40 kinds); load.cypher 1,349 statements
node $SP/bin/validate_intent.mjs packages/contracts/dist $F/fixtures/cross-domain/product-comparison/intent.json
  → OK 155 proposals {node.upsert 46, edge.structural 9, edge.assert 61, assertion.literal 12, identifier.attach 27}; subjects 57; locators 77; danglingRefs 0
```

## 7. Planner probe (03-SYNTHESIS step 8; read-only, current kg-ops dist, final/_work/planner-probe-v2.mjs)

```
NEO4J_PROBE_PASSWORD=*** node schema/program/final/_work/planner-probe-v2.mjs $SP/planner-probe.json $F/fixtures/cross-domain/product-comparison/intent.json
 run 1 (first emit): v2 rejected, errors INVALID_SOURCE_PROPERTY (source.properties.tool); subject reasons REQUIRED_PROPERTY_MISSING entityKind ×9, hostItemId ×2;
        INVALID_PROPERTY IngredientMaterial.searchText ("a derived search projection") ×3
   fixes in the fixture: Organization entityKind/organizationKind (fixture classifications), MerchantListing hostItemId (Shopify product id 7387359477829,
   Thorne sku SP654, both located: l-tns-id, l-th-sku), searchText dropped, source.properties emptied, snapshot.properties without bytes;
   build_fixture.py now also checks required properties
 run 2: v1 thrown (rolled-back transaction, as in _runlog/migration.md section 4)
        v2    rejected: SUBJECT_CONFLICT 155; subject TYPE_NOT_CREATABLE 57 (no v2 type allows CREATE, R-03); no uid token for Lot 19, Package 4, LabelVersion 4
        v2sim partial: admitted 40, rejected 114, no_op_duplicate 1; subjects create 27, use_existing 3, conflict 27 (the no-uid-token types);
              RELATIONSHIP_ENDPOINTS_INVALID 1 ("ChemicalSubstance has no HAS_IDENTIFIER field": planner reads a forward field, v2 declares Identifier.identifies);
              write audit: planner still writes v1 keys (maturity, schemaVersion, mongoResearchRunId, SUPPORTED_BY ×16, Assertion.statedAsOf …), as recorded in migration.md
 → every remaining reason is a planner/IR-params gap already listed in migration notes; no fixture-side error remains.
```

## 8. Walk in the disposable Neo4j (walk.md)

```
docker cp $SP/load.cypher bks-neo4j-synth:/tmp/xfx-product-load.cypher
docker exec bks-neo4j-synth cypher-shell -u neo4j -p *** -f /tmp/xfx-product-load.cypher → exit 0 (first load 22.6 s wall)
  (the DB already held 354 nodes from another S stage; every statement here is scoped to fixture:'xfx-product')
MATCH (n {fixture:'xfx-product'}) … → 327 nodes, 1,020 relationships; 22 primary labels
python -I $SP/bin/run_walk.py $SP/walk-queries.cypher $SP/walk-results.md   (cypher-shell --format plain, -P {T: …})
 run 1: W1–W6 exit 0; W7 exit 1 (toString(list) type mismatch → reduce())
        W2 at 2024-06-01 ranked NiaCel on a COVERS episode observed in 2026 → query now counts an unknown-start episode only from its
        Assertion's validObservedAt; an option covered only later is "NOT_EVALUATED (certification at T unknown)"
 run 2 (after cellValues fix, reload: 327 nodes / 1,020 rels, exit 0):
   W1 T=2026-10-09: Codeage 500 mg UNSPECIFIED → NR, daily NULL; NiaCel SP654 LSP65404 415 mg SALT_FORM → 272.8 mg/d PROPOSED; Tru Niagen V12.3 300 mg SALT_FORM → 790.2 mg/d ACCEPTED
   W1 T=2024-06-01: NiaCel SP654 LSP65403 → 545.6 mg/d (only option with a label in force)
   W2 T=2026-10-09: NiaCel RANKED 1 (lotScore 1, NSF CfS LOT x19); Tru Niagen RANKED 2 (lotScore 0, PRODUCT_ALL_SIZES x1); Codeage NOT_EVALUATED (no moiety amount; NSF/ANSI 173)
   W2 T=2024-06-01: NiaCel NOT_EVALUATED (certification at T unknown)
   W3 17 rows: every non-CALCULATED input of c-nc-day has locator + snapshot digest
   W4: run:ft-S-xfx-product-ingest 32 records; run:ft-S-xfx-product-project 2 records, informedBy ingest
   W5: 8 items; rows SELECTED 1 / ALTERNATIVE 2 / NOT_EVALUATED, cites 7 / 6 / 4
   W6: 414956 and 417281 listed (1423140, observed 2026-10-09T04:19:47Z); 999999 none
   W7: field silent (Codeage), offer package without label version (Tru Niagen store), price disagreement 44 / 74 USD (Thorne)
python -I <assemble walk.md from walk.template.md + walk-queries.cypher + walk-results.md>  → walk.md (results pasted by script, not by hand)
MATCH (n {fixture:'xfx-product'}) DETACH DELETE n → 327 deleted; remaining 0; /tmp/xfx-product-load.cypher removed
```

## 9. Final checks

```
python -I $SP/bin/verify.py $F/fixtures/cross-domain/product-comparison $SP/raw
  → locators 77, snapshots 14, problems [] (digest, offsets, quoteHash, occurrence counts), unresolved refs [], unused []
  → bodyDigest match True; assertions 111; producedBy on all True
python -I -c "<yaml.safe_load assertions.yaml>" → predicates: HAS_IDENTIFIER 31, COVERS 21, LOT_OF 19, DECLARES_COMPONENT 4, MAX_DAILY_SERVINGS 4,
  HAS_LABEL_VERSION 4, MOLECULAR_WEIGHT 3, REALIZES_SUBSTANCE 3, NAMES_RESPONSIBLE_PARTY 3, OFFER_PRICE_ONE_TIME 3, ISSUED_BY 3,
  MOIETY_EQUIVALENT_AMOUNT 3, PER_MAX_DAILY_DOSE_AMOUNT 3, HAS_ACTIVE_MOIETY 2, LISTING_FOR 2, MOLECULAR_FORMULA 1, FIELD_NOT_REPORTED 1, BEARS_SEAL 1;
  89 entities (+3 activities), 5 decision criteria, 5 assessments, 8 report items
```

## 10. Files written

`$F/fixtures/cross-domain/product-comparison/`: source.md, locators.yaml (77 locators, 14 snapshots), assertions.yaml (record of truth),
intent.json (ingestion run, zod-valid), questions.md, walk.md, composed-body.txt (draft report body; its sha256 is Report.bodyDigest).
This runlog. Scratch only (not committed): $SP/raw (14 captures; candidate probes in $SP/probe), $SP/bin/*, $SP/fixture.json, $SP/load.cypher,
$SP/walk-queries.cypher, $SP/walk-results.md, $SP/planner-probe.json.

## 11. Open points for the coordinator / owner

1. Asserter of DSLD-relayed label lines: this fixture follows R-16 rule 1 (labeler of record, qualifier relayedBy:NIH ODS DSLD …), as packets/D1 does;
   packets/D6 label-versions-truniagen-dsld asserts its lines by NIH ODS. No ruling names the asserter of a registry-relayed label; one is needed.
2. COVERS → ProductVariant now has a fixture (k-tn-covers: NSF listing 1263423 names the 300 mg variant), which is the R-73 fixture request for CQ-PF-03a.
3. Candidate IR params: no uid token for LabelVersion, Package, Lot (planner NO_UID_TOKEN); planner reads HAS_IDENTIFIER as a forward field; both already in migration notes.
4. NR hydrogen malate has no GSRS record; its MW (388.33, 2 decimals) and moiety link come from PubChem + BellLabs curation (PROPOSED). The NiaCel rank rests on it.
5. The criteria set bl:compare:nr-products@1 is fixture-illustrative; the report is a PROPOSED draft (no report.publish in intent v1, R-40).
