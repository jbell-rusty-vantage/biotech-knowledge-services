# Runlog: integrator stage (S team), 2026-10-09

Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`. Commands were run from the worktree root in Git Bash. `$F` = `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final`; `$SP` = `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/integrate`. No .env value was printed. Nothing was committed.

## 1. Assemble

```
node scripts/assemble-schema.mjs
→ {"ok": true, "out": "...\\final\\schema\\final_biotech_schema_v2.graphql", "modules": 14, "types": 300}   exit 0
wc -c -l schema/program/final/schema/final_biotech_schema_v2.graphql
→ 7269 lines, 385018 bytes
manifest sha256 d233930272c7aaa75d9aac21103e83448bd96a79d1106c4749fb807f257dd705
module digests (first 12): kernel ec981e2aab04, D1 eb0537ff69c0, D2 3d1f1a729fcd, D3 6a3cdc898207, D4 b62054b09a77, D5 7fb18a838e1b,
  D6 6b14b735ef1a, D7 83221ab14b26, D8 9eaf3f0f2348, D9 323e181a03ff, D10 356dbffe86c0, D11 ec9a90a90a15, D12 f7c6b4107e27, D13 24f8f6853a6b
```
No duplicate names, so no module edit was needed. A dangling-reference check followed (script saved as `final/_work/check-refs.mjs`):
```
node $F/_work/check-refs.mjs $F/schema/final_biotech_schema_v2.graphql
→ {"declared": 300, "dangling": []}
```
At the end of the stage, re-running `node scripts/assemble-schema.mjs` gave the same output and the same sha256, d233930272c7…d705. The module SDLs were not touched in this stage.

## 2. Map

```
node packages/schema-workspace/dist/cli.js map --sdl $F/schema/final_biotech_schema_v2.graphql --out $F/schema-map.md
→ {"ok": true, "bytes": 256847, "schemaDigest": "sha256:d233930272c7aaa75d9aac21103e83448bd96a79d1106c4749fb807f257dd705"}   (0.77 s)
Totals table: node types 69, interfaces 2, relationship fields 148, distinct relationship types 106,
  pairs after union/interface expansion 848, edge property profiles 20, unions 16, enums 193, domains 14
```
The mapper does attribute the modules from the `# ---- fragment <id> ----` banners. Two problems with its output:
- It numbers the domains D1–D14 in file order: its "Domain D1" is fragment K, its "D2" is fragment D1, and so on.
- It expands interface targets into every implementing domain. As a result the K row has 8 in every column.

I added a module-labelled section with this command:
```
node $F/_work/count-schema.mjs $F/schema/final_biotech_schema_v2.graphql --append-map $F/schema-map.md
```
The command replaces or appends the section `## Module seam matrix (integrator)` at the end of schema-map.md. Its header line reads "From→to pairs (collapsed): 181; cross-module: 86".

The map file's first line says "Rendered from the pinned SDL". That is the renderer's fixed wording. The digest printed on that line is the digest of the candidate.

## 3. Executable

Deployed options, using the recipe from the task:
```
time (BKS_SCHEMA_PATH=$F/schema/final_biotech_schema_v2.graphql NODE_OPTIONS=--max-old-space-size=8192 \
      pnpm --filter @bks/graphql-api print-schema "$SP/printed-deployed.graphql")
→ wrote ...printed-deployed.graphql (1734903 chars) in 2s        real 0m6.354s
wc -c -l → 34373 lines, 1735213 bytes;  grep -c '^input ' → 960;  '^enum ' → 196;  '^type ' → 524;  '^type Mutation' → none
grep -c 'validObservedAtPrecision\|CURATOR_CLASSIFICATION' → 10
```
The fallback was ruled out:
- The output is 1.7 MB, not the 55–58 MB of the pinned schema.
- It contains fields that exist only in the synthesis kernel.
- print-schema does not log its input path.

To time the build precisely and to measure L3, I used the K lever printer, copied to `$SP/print2.mjs` and re-pointed from the A1 worktree to this worktree's `apps/graphql-api` with `sed s#biotech-knowledge-services-A1#biotech-knowledge-services-S#`:
```
NODE_OPTIONS=--max-old-space-size=8192 node $SP/print2.mjs $F/schema/final_biotech_schema_v2.graphql $SP/printed-none.graphql none   (x3)
→ {"bytes":1734903,"lines":34374,"inputs":960,"ms":1780} / {"ms":1731} / {"ms":1561}
cmp printed-none.graphql printed-deployed.graphql → IDENTICAL
NODE_OPTIONS=--max-old-space-size=8192 node $SP/print2.mjs $F/schema/final_biotech_schema_v2.graphql $SP/printed-L3.graphql all    (x3)
→ {"bytes":728774,"lines":22797,"inputs":960,"ms":1258} / {"ms":1315} / {"ms":1330}
wc -c -l printed-L3.graphql → 22796 lines, 729084 bytes; '^type ' 524; '^enum ' 196; no Mutation
sha256 (first 16): printed-deployed 269a15347ca86c0c, printed-L3 41d98d5f68f6d0ea
```
`bytes` in print2 is a JS string length (chars). The byte figures in the reports come from `wc -c`.

Pinned baseline, printed the same way:
```
time (NODE_OPTIONS=--max-old-space-size=8192 node $SP/print2.mjs .../schema/pinned/final_biotech_schema_proposal.graphql $SP/printed-pinned.graphql none)
→ {"bytes":57908217,"lines":693831,"inputs":38034,"ms":34001}   real 1m14.822s
wc -c → 57908325; wc -l → 693830; sha256 (first 16) e0120c0799e4f9dc   (scratch print deleted afterwards, 58 MB)
```

IR, built with the same `parseSchema` call that the map command uses (new script `final/_work/build-ir.mjs`):
```
node $F/_work/build-ir.mjs $F/schema/final_biotech_schema_v2.graphql $F/schema/final_biotech_schema_v2.ir.json
→ {"ok":true,"schemaDigest":"sha256:d233930272c7…d705","nodes":69,...}   2,091,344 bytes (contains a parsedAt timestamp)
```

schema-size:
```
node scripts/schema-size.mjs $SP/printed-deployed.graphql --ir $F/schema/final_biotech_schema_v2.ir.json --out $SP/size-deployed.md
node scripts/schema-size.mjs $SP/printed-L3.graphql       --ir $F/schema/final_biotech_schema_v2.ir.json --out $SP/size-L3.md
→ headline (both): input 960, object 524, enums 196, Query fields 158, Mutation 0, SDL node types 69, relationship fields 148, pairs 848
  deployed: 1.7 MB, 34,374 lines, Where family 13,769 lines;  L3: 0.7 MB, 22,797 lines, Where family 2,192 lines
```
`final/size-report.md` was put together from three parts:
1. A headline section written by hand, using only the numbers above and those in step 4.
2. The deployed schema-size output.
3. The L3 schema-size output.

## 4. Counts and budget

Counting script `final/_work/count-schema.mjs`, new. It attributes modules from the `# MODULE` banners. The collapsed count follows R-01 option A; the expanded count follows option B.
```
node $F/_work/count-schema.mjs $F/schema/final_biotech_schema_v2.graphql --json $SP/count.json --matrix $SP/matrix.md
→ nodeTypes 69; interfaces Entity 69 / Subjectable 56 implementers; relationshipTypes 106; relationshipFields 148;
  pairsCollapsed 181; pairsExpanded 848; unions 16; widest union as target AdministeredMaterial 5; enums 193
  perModule (nodes / rel types / collapsed pairs): K 11/13/33, D1 4/6/7, D2 5/6/10, D3 8/15/32, D4 7/13/17, D5 6/6/9, D6 6/9/11,
  D7 4/7/9, D8 6/11/25, D9 3/7/8, D10 3/4/5, D11 1/0/0, D12 3/4/8, D13 2/5/7
cross-check with the slim architect's pairs.mjs: "collapsed(interface=1) 181 expanded 848 Subjectable implementers 56 Entity 69"
```
The pinned SDL was counted by the same method:
```
node $F/_work/count-schema.mjs .../schema/pinned/final_biotech_schema_proposal.graphql
→ nodeTypes 192, relationshipTypes 393, relationshipFields 1082, pairsCollapsed 3883, pairsExpanded 3940, unions 39, widest AssertionSubjectTarget 144
```
Budget result: every line passes under option A. Expanded pairs are 848 against a limit of 600, which is the R-01 owner decision. No cut was made.

Step-7 checks (`final/_work/rel-values.mjs`, new; run after merge-registers):
```
node $F/_work/rel-values.mjs
→ node types with < 2 filterProperties in the register: none
  {"questionIdsWithValue":455,"relationshipTypes":106,"bestValue1":95,"bestValue2":11,"bestValue3":0,"noValue":0}
  best v2: ASSIGNED_TO, DERIVED_FROM_TAXON, DOCUMENTED_BY_RECORD, INCLUDES_TEST, INTERVAL_FOR, LICENSED_TO, MATERIAL_CONTAINS,
           MEASURES_ANALYTE, PARENT_TAXON, PART_OF_MECHANISM, WAS_ASSOCIATED_WITH
```
The first run reported 453 ids and `COVERS: CQ-PF-03a | ISSUED_BY: CQ-PF-03a` without a value. I then added the R-08 split ids: CQ-PF-03a is v1 and CQ-PF-03b is v2.

Hub check, from count.json: the most relationship fields per node are Assertion 8, Study 6 and ReportItem 6. No node exceeds 12.

## 5. Registers

Merge script: `final/_work/merge-registers.mjs`, new. It writes final/node-register.yaml, final/relationship-register.yaml and final/seams.yaml.

All 42 fragments parsed with yaml@2. Their top-level keys were listed with `$SP/explore.mjs`.

Run 1, `--check-only`: 0 violations and 7 warnings. Two of the warnings were false positives from my endpoint parser:
- A parenthetical "(member of union CertificationCoverageTarget)" was read as an endpoint.
- Claim was not seen as a Subjectable implementer.

I fixed the parser in two ways: parenthetical remarks are stripped, and an interface named in a register covers its implementers.

Run 2: 0 violations and 3 warnings, which were the duplicate entries described in I-03. I then added a check that every cross-module SDL pair has a seam row on both sides, as contract rule 8 requires.

Run 3, the first write: 86 cross-module edges, 8 of them one-sided. Two of those were false. STEP_USES rows name concrete members of Subjectable, so I changed the matcher to let a row naming an implementer match an interface pair. That left 6 genuinely one-sided pairs, which are listed under I-01.

Fragment fixes:
- **I-01:** I added seam rows for the 6 pairs:
  - 3 in `D9.seams.yaml`: CHUNK_OF, COVERS_LOCATOR, MENTIONS.
  - 2 in `D10.seams.yaml`: DERIVED_FROM, from ReportItem and from Association.
  - 1 in `D5.seams.yaml`: RESOLVES_TO_CONSTRAINT.
  - Re-merge: crossModuleEdgesOneSided 0.
- **Warning cleanup:** the cut row `ASSOCIATES Association → D12.FoodItem` matched through Subjectable. Now only exact pairs are checked against cut rows. Statuses are normalized to their first word.
- **I-02:** `sed -i 's#^    fixture: 07-fixtures/#    fixture: final/fixtures/K/#' K.relationship.yaml` changed 13 lines. I added a check that every fixture path is under `final/fixtures/<module>/`.

Final run:
```
node schema/program/final/_work/merge-registers.mjs      exit 0
→ sdl: nodeTypes 69, relationshipTypes 106, pairsCollapsed 181, crossModulePairs 86
  nodeRegister: nodes 69, deferred 108, mergedInto 227, retiredEnums 2, unionsRetired 8
  relationshipRegister: relationships 109, predicateOnly 203, authorizingPredicates 10, deferred 386, ruleNotes 2, removedPredicates 5,
                        registeredElsewhere 8, mergedInto 2, removedRegistrations 6
  seams: seams 331, predicateSeams 156, facetSeams 1, crossModuleEdges 86 (all accepted, 0 one-sided), cutEdges 19
  violations 0, warnings 3 (ASSESSES K+D10, DERIVED_FROM K+D10, RENDITION_OF D3+D9 registrar D3: kernel-meaning types, counted once), stampIssues 0
```
The checks found:
- **Relationship types:** all 106 SDL types have a register entry with non-empty questions, pattern, populatedBy and fixture.
- **Node types:** all 69 have whyNode and identityKeys.
- **Predicates:** the 213 predicateOnly and authorizingPredicates values are unique, so no predicate has two registrars. None equals an SDL relationship type name.
- **Fixture requests:** three relationship entries carry a `fixtureRequest` and also a fixture. They are D5 OPERATIONALIZED_BY, D8 STATUS_OF and D8 COVERS.

decision-report.md:
- I added "### Integration rulings (integrator, 2026-10-09)", I-01 to I-03, under "## Merge rulings" after the Tally.
- I filled in "## Cuts to budget": no cut was made, with the numbers and the next demotion tier.
