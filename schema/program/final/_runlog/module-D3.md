# Module D3 — module editor run log (S team, 2026-10-08)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md`. I read R-01 to R-10, R-14 to R-20, R-26, R-28 to R-30, R-43, R-44, R-52, R-53, R-56, R-58, R-59, R-63, R-70 to R-72, R-80, R-82 and R-94 in full.
- `final/_work/rulings.yaml`: `global` and `modules.D3`, plus every other module's rows that name a D3 type.
- `final/schema/kernel.graphql`, `final/_work/registers/K.*.yaml` and `final/_runlog/module-K.md`. The last one lists the kernel changes and gives the K print-schema baseline.
- `scratchpad/inv/review-open-issues.json` (D3) and `scratchpad/inv/inventory-final.md` (D3 rows).

```
$ git rev-parse --short HEAD
e484fd2
$ sha256sum packets/D3/04-schema-proposal.graphql packets/D3/05-relationship-register.yaml packets/D3/06-node-register.yaml packets/D3/10-seams.yaml
96aa64ce076128e5321c69be4e048923052f80e29e77dbd2f229a7ca21c0f5e6 *packets/D3/04-schema-proposal.graphql
9d6f1082015217387587ccef21ac56dbdbc7362c3ecc7b091b1cc329b3c5a408 *packets/D3/05-relationship-register.yaml
7d1a102b6e9726839d251fe7cc4b4f0b5be2b0fb59ce86676f5d0d96f8548541 *packets/D3/06-node-register.yaml
e8986aebb8558d3a7c655fef10ff190c1f16b7befaccadf878527254c226a882 *packets/D3/10-seams.yaml
```

## SDL: `final/schema/D3.graphql`

```
$ cp packets/D3/04-schema-proposal.graphql final/schema/D3.graphql
```

I made the edits with the Edit tool and one asserted Python replace (R-63). The banner `# ---- fragment D3 ----` stays on line 1, and a synthesis block was added to the header comment.

| ruling | SDL edit |
| --- | --- |
| R-10 | `Study.registrationVersions` (HAS_REGISTRATION_VERSION): `properties: "AssertedEdgeProperties"` (was StateEpisodeProperties). The docstring names `exclusive: true` |
| R-44 | removed `enum PublicationRevisionStatus`. `Publication.revisionStatus: SourceRevisionKind`, whose docstring reads "null = none known; single work-level cache". RevisionEdgeProperties docstring: recorded when the revising work is identified, per asserter, never recorded both ways |
| R-58 | removed `enum QuantityBasis`. `InterventionComponent.quantityBasis: AmountBasis` (D6). `AdministrationRoute` gains `INTRAPERITONEAL` and `IN_MEDIUM`, with an enum docstring |
| R-72 | `union AdministeredMaterial = IngredientMaterial \| ProductVariant \| Intervention \| FoodItem \| DietaryPattern` (Device removed, 6 → 5). Docstring: a device used as an intervention is reached through ProductVariant or Intervention |
| R-63 | AdministeredMaterial docstring: an eating pattern is administered as a DietaryPattern (no type change) |
| R-70 | OutcomeDefinition docstring: TargetMeasure = Metric \| Biomarker \| Outcome \| Condition. The clause "D2 Condition terms do not reach a Target" is removed |
| R-71 | `Publication.venueName` docstring: "venue name only, no container node" |
| R-43 | new field `Publication.renditions: [Source!]!` on `RENDITION_OF`, direction IN, `AssertedRecordedProperties`, `[CONNECT]`, aggregate false, `@filterable(byValue: true, byAggregate: false)`. The Publication docstring now says renditions are grouped by RENDITION_OF, not by a shared Identifier (R-42) |
| R-71, R-80 | Publication docstring: owner D3. Authors are AUTHORED_BY → D7 Person \| Organization, registered by D3. The stale sentence "kernel map still lists Publication under D9" is removed |

Unchanged: RESULT_FOR keeps its name, because D8 renames to QUALITY_RESULT_FOR (R-53). SexScope and EstimateDirection stay declared here (R-56, R-59).

## Registers

The registers were built from the packet's 05, 06 and 10 files. Every entry keeps the contract fields and adds `module: D3`. Fixture paths were rewritten to `final/fixtures/D3/<folder>`. RENDITION_OF uses the K fixture, `final/fixtures/K/resveratrol-sirt1-evidence-mission`.

- `D3.node.yaml`: a Python string-replace script (stdin). Each replace is asserted to match exactly once. The edits are `module: D3` on the 8 nodes, the quantityBasis note (R-58), the revisionStatus note (R-44), the Publication whyNode (R-43) and a header note on how `mutations` is read (R-03).
- `D3.relationship.yaml`: `scratchpad/synth/module-D3/build_rel.py`, run from `schema/program` with `python -I`; every replace is asserted.
  - R-10: HAS_REGISTRATION_VERSION uses `edgeProperties: AssertedEdgeProperties` and gains `exclusive: true`.
  - R-72: ADMINISTERS `to` no longer lists D4.Device.
  - R-44: REVISES rationale.
  - R-70: MEASURES rationale.
  - R-07: INVESTIGATES questions are now `[Q-D3-10, Q-D2-06]`.
  - R-43: new RENDITION_OF entry with `meaning: kernel`, `from: K.Source`, `declaredOn` and `ruling`.
  - predicateOnly changes:
    - AUTHORED_BY: registrar D3, with the subjects, objects and aliases of R-80.
    - FUNDER_ROLE_STATEMENT becomes FUNDED_BY: object D7.Organization, qualifier `roleText:`, aliases (R-82).
    - COMPETING_INTEREST_STATED is removed and becomes a DISCLOSES_INTEREST predicate seam (R-82).
    - ADMINISTERED_MATERIAL_PURITY is added: FIELD, subject InterventionComponent (R-52).
  - deferred: notes added to USES_INTERVENTION_DEVICE (R-72) and CORRECTS (the K convention is a different meaning, R-20/R-52).
  - The first run failed `yaml.safe_load` on line 44: the plain scalar contained `exclusive: true, R-10`. I reworded it and re-ran.
- `D3.seams.yaml` was written by hand from 10-seams.yaml.
  - Relationship seams: 25 rows. Each carries `status` and `ruling`. "packet" means accepted as published, with no ruling changing it. One row is cut: ADMINISTERS → D4.Device (R-72). One row is new: RENDITION_OF K.Source → D3.Publication (direction IN, owner this; R-43).
  - `predicateSeams` (R-94): 11 rows. D3 is registrar of AUTHORED_BY, FUNDED_BY, MATERIAL_PROVIDED_BY and ADMINISTERED_MATERIAL_PURITY. The other registrars: DISCLOSES_INTEREST (D9); the D1 amount predicates; the D12 food predicates; EVENT_ABOUT and CONTINGENT_ON (D13); HAS_REVISION_STATUS and HAS_IDENTIFIER (K).
  - `kernelTypesReferenced`: StateEpisodeProperties becomes AssertedEdgeProperties, and Source is added. `dependsOn`: OPERATIONALIZED_BY gains D2.Condition (R-70). `sharedVocabularies`: AmountBasis (D6), AdministrationRoute, the EstimateDirection consumer D2 (R-59), predicates, assessment-vocabularies, and final vocabulary paths with pins (R-60).

```
$ python -I .../synth/module-D3/build_rel.py          -> ok
$ python -c "yaml.safe_load(...)"   # per file
D3.node.yaml         {'version': 1, 'module': 'D3', 'nodes': 8, 'deferred': 3, 'mergedInto': 12}
D3.relationship.yaml {'version': 1, 'module': 'D3', 'relationships': 15, 'predicateOnly': 18, 'deferred': 46}
D3.seams.yaml        seams 25 (accepted 24, cut 1), predicateSeams 11
```

I cross-checked the contract fields against the SDL with Python (yaml plus a regex over `D3.graphql`):

```
rel missing: []    node missing: []    seam missing: []
rel types SDL==register: True 15
nodes SDL==register: True 8
predicateOnly & relTypes: set()
retired names in SDL outside comments: []      # StateEpisodeProperties, PublicationRevisionStatus, QuantityBasis, COMPETING_INTEREST_STATED, FUNDER_ROLE_STATEMENT
no kernel conventions in predicateOnly         # FIELD_NOT_REPORTED, HAS_REVISION_STATUS, RATES_CLAIM, CORRECTS, HAS_IDENTIFIER, CITES_AS_SUPPORT, HAS_CREDENTIAL
```

## Counts (`scratchpad/synth/module-D3/count.mjs`, graphql parse; unions expanded per member)

```
$ node .../count.mjs C:/.../final/schema/D3.graphql
nodeTypes 8: Study, RegistrationVersion, StudyArm, InterventionComponent, StudyPopulation, OutcomeDefinition, StudyResult, Publication
relationshipTypes 15: HAS_REGISTRATION_VERSION, HAS_ARM, HAS_POPULATION, HAS_OUTCOME, HAS_STUDY_ROLE, INVESTIGATES, HAS_COMPONENT, STATED_IN, ADMINISTERS, MEASURES, RESULT_FOR, RESULT_FOR_ARM, REPORTS_ON, REVISES, RENDITION_OF
fieldPairs 31 (kernel-meaning 1; module-owned 30)
unions: AdministeredMaterial=5, StatingRecord=2, OutcomeMeasureTarget=4, StudyParty=3
$ node .../count.mjs C:/.../packets/D3/04-schema-proposal.graphql
nodeTypes 8 · relationshipTypes 14 · fieldPairs 31 (kernel-meaning 0) · unions: AdministeredMaterial=6, StatingRecord=2, OutcomeMeasureTarget=4, StudyParty=3
```

Under R-01, RENDITION_OF is a kernel-meaning type and is counted once in K. The D3-owned figures are therefore 14 relationship types and 30 pairs, with no interface targets. The packet had 31 pairs; the change is −1 for ADMINISTERS → Device and +1 for RENDITION_OF.

## Compile check (print-schema)

The scratch stubs live in `scratchpad/synth/module-D3/stubs.graphql` and are never published. They are minimal `@node @query(aggregate:false) @mutation(operations: [])` types for IngredientMaterial, ProductVariant, Intervention, FoodItem, DietaryPattern, Metric, Biomarker, Outcome, Condition, Organization, Person and Award, plus the enums MassBasis (D1) and AmountBasis (D6). The inputs were assembled with `cat`: kernel only; kernel + stubs; kernel + stubs + D3.

```
$ BKS_SCHEMA_PATH=C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/module-D3/<name>.graphql \
  NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema \
  C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/module-D3/<name>.printed.graphql
kernel-only        wrote ... (326571 chars) in 3s   (wall 56 s, first run)
kernel+stubs       wrote ... (341926 chars) in 2s   (wall 20 s)
kernel+stubs+D3    wrote ... (543390 chars) in 2s   (wall 29 s; final SDL, re-run after the R-63 docstring edit)
```

It compiled on the first attempt with no errors. The print-schema log does not name the SDL it used. I confirmed the source in three ways:
- the outputs are 0.3–0.5 MB, not the ~55 MB pinned fallback;
- the D3 output contains the new `INTRAPERITONEAL` / `IN_MEDIUM` values and the 5-member `union AdministeredMaterial`;
- it contains the docstring text "R-63", which exists only in `final/schema/D3.graphql`.

`grep -c "StateEpisodeProperties\|QuantityBasis\|PublicationRevisionStatus"` over the D3 output gives 0.

| printed | bytes | lines | `^input ` | `^enum ` | `^type ` | `^union ` | Mutation fields |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| kernel only | 326,595 | 6,498 | 179 | 35 | 105 | 0 | 0 |
| kernel + stubs | 341,950 | 6,930 | 203 | 35 | 141 | 0 | 0 |
| kernel + stubs + D3 (final) | 543,440 | 11,160 | 343 | 65 | 203 | 4 | 0 |

The kernel-only numbers equal module-K's run (326,595 B, 179 inputs).

**Marginal cost of D3:**
- Over kernel + stubs: **+201,490 B, +4,230 lines, +140 input types, +30 enums.**
- Over the kernel alone: +216,845 B and +164 inputs. This figure includes the stubs (+15,355 B, +24 inputs).

The final D3 SDL is 45,070 B and 868 lines; the packet's was 42,827 B and 865 lines.

**Packet comparison** (same method). The unedited packet D3 was compiled against the final kernel, the same stubs, a Device stub and a stub copy of StateEpisodeProperties. It needs those last two because the kernel removed StateEpisodeProperties.

| printed | bytes | lines | `^input ` | `^enum ` |
| --- | ---: | ---: | ---: | ---: |
| kernel + stubs + extra | 343,150 | 6,966 | 205 | 35 |
| kernel + stubs + extra + packet D3 | 540,575 | 11,112 | 344 | 66 |

- Packet D3 marginal: +197,425 B, +139 inputs, +31 enums.
- Final D3 marginal: +201,490 B, +140 inputs, +30 enums.
- Delta, final minus packet: **+4,065 B, +1 input, −1 enum**. The new RENDITION_OF field and its filters outweigh the removals: Device member, QuantityBasis, PublicationRevisionStatus and StateEpisodeProperties. The extra docstrings are part of the bytes.

## Cypher check (bks-neo4j-synth, Neo4j 5.26)

```
$ docker exec bks-neo4j-synth cypher-shell -u neo4j -p bks-test-password "EXPLAIN MATCH (src:Source)-[r:RENDITION_OF]->(p:Publication)<-[v:REVISES]-(n:Publication) WHERE r.recordedTo IS NULL AND v.recordedTo IS NULL RETURN src.uid, p.uid, n.uid, v.revisionKind"
Planner: "COST"   Runtime: "SLOTTED"   (plans; R-44 revision branch over R-43)
```

## Open items for other S stages (not edited here: outside final/schema and registers, or not required by a ruling)

1. Fixtures (D3 folders): `revisionStatus` must be remapped. NONE_KNOWN becomes null (5 occurrences) and RETRACTED becomes RETRACTION (9 occurrences, R-44).
   - dq-bone a63 uses COMPETING_INTEREST_STATED with a literal object. Under DISCLOSES_INTEREST (R-82) the object is an Organization (Mayo Clinic), and per R-15 the author statements are asserted by the D7 Persons.
   - dq-bone a64 uses FUNDER_ROLE_STATEMENT with a literal and names no funder. FUNDED_BY needs a D7.Organization object with `roleText:` as a qualifier, so the fixtures editor must attach it to the named funder(s).
   - `source.md` (aspree) names StateEpisodeProperties.
2. RENDITION_OF fixture: K `resveratrol-sirt1-evidence-mission` has no RENDITION_OF rows yet; its questions.md says "no … RENDITION_OF in the K fixtures". The rows pmc-3799917 / pubmed-23471411 → Publication must be added for R-06.
3. Patterns: D3 03 CQ-EV-05 (lines 231, 239) joins Publication-HAS_IDENTIFIER->Identifier<-HAS_IDENTIFIER-Source. That join is forbidden by R-42/R-43, so the final query patterns should use Source -RENDITION_OF-> Publication.
4. R-14 (global): D3 cites RegistrationVersion field facts as locators on the HAS_REGISTRATION_VERSION attach Assertion and has "no per-field predicates". R-14 asks for FIELD Assertions with registered field predicates. No D3 ruling row covers this, so it is left unchanged and needs a chief ruling.
5. OQ-D1-26 names UNIT_DOSE_AMOUNT, ADMINISTERED_AMOUNT and REGISTRY_ID_AS_PRINTED as D3 predicates. No ruling registers them, so they are not added.
