# Module editor D11 (S team, 2026-10-08)

Scratch: `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/module-D11/` (`$S` below).

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-03, R-04, R-09, R-10, R-13, R-16, R-17, R-27, R-35, R-36, R-38, R-39, R-41 to R-46, R-50, R-52, R-53, R-54, R-71, R-72, R-82, R-84, R-85, R-88, R-94 read); `final/_work/rulings.yaml` (`global`, `modules.D11`, and the D5 row R-85 naming D11); `final/_runlog/module-K.md` "Kernel changes in synthesis"; `final/schema/kernel.graphql`.

```
$ sha256sum packets/D11/04-schema-proposal.graphql packets/D11/05-relationship-register.yaml packets/D11/06-node-register.yaml packets/D11/10-seams.yaml final/schema/kernel.graphql
80ada99d67ec8cf0b077f98f051455d19b361bf5137f4754ac3eb73b25d63225  packets/D11/04-schema-proposal.graphql
4f4f9734ec88a78f8734ac604580995d47666fb21cb9c937cc0dcbd5e6fff41a  packets/D11/05-relationship-register.yaml
4a8886ff18fd413f9d18f8407315c4fb21e61359769686f723e4e4843fb99ca6  packets/D11/06-node-register.yaml
7bcba2d443732405a4000936d780d6f23330e76b95c629eddfd1aaa00e4fe894  packets/D11/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
$ node scripts/packet-check.mjs D11      -> exit 0, ok true; nodeTypes 1, relationshipTypes 0, pairs 0, questions 30, fixtures 5
```

## Rulings applied

`modules.D11` in rulings.yaml has 9 rows.

| ruling | where | change |
| --- | --- | --- |
| R-17 | D11.graphql, D11.node.yaml, D11.seams.yaml | `@node(labels: ["CaptureAttempt", "Occurrence"])` (was `"Entity"`); docstring, `labels`, `archetype`, kernelTypesReferenced |
| R-41 | D11.graphql, D11.node.yaml, D11.seams.yaml | privacyClass INTERNAL by default; FAILED / PARTIAL only, not Subjectable, not a second lineage mechanism (docstring, lineage, privacy, seam note) |
| R-39 | D11.graphql (toolId docstring), D11.node.yaml, D11.seams.yaml | toolId = canonical action-space id, never an alias; populatedBy checked canonical; alias map referenced (see checks) |
| R-35 | D11.graphql (LOSSY_RENDITION docstring), D11.seams.yaml | names contentHashBasis TOOL_RENDITION; projection registry belongs in the action space (see issues) |
| R-82 | D11.relationship.yaml, D11.seams.yaml | predicateOnly FUNDED_BY, DISCLOSES_SUPPORT_FROM, DECLARES_NO_COMPETING_INTEREST removed; predicateSeams FUNDED_BY (D3), DISCLOSES_INTEREST (D9) added |
| R-52 | D11.relationship.yaml | names already SCREAMING_SNAKE (adversarial review); `registrar` added to each remaining predicateOnly entry |
| R-50 | D11.seams.yaml | WAS_GENERATED_BY Report -> Activity note: Q-D11-22 materialized by a PROJECTION Activity; Report{PROFILE} only when BellLabs publishes coverage |
| R-44 | D11.seams.yaml | REVISES note (SourceRevisionKind); added RENDITION_OF K.Source -> D3.Publication and predicate seam HAS_REVISION_STATUS (Q-D11-04/05 read both branches). Fixture edit (resveratrol) is the fixtures stage's |
| R-42 | D11.node.yaml | Identifier.registrationStatus declined: recorded as a deferred row (the 11-OQ close is the open-questions stage's) |

Global / other rulings that touch D11 text: R-03 (node `mutations` = `{ graphql: none, executor }`), R-10 (HAS_REGISTRATION_VERSION, HAS_LABEL_VERSION notes), R-72 (CONCERNS union), R-84/R-85/R-88 (predicate seams; targets consumer list), R-16 (FIELD_NOT_REPORTED note), R-27/R-38 (MENTIONS, COVERS_LOCATOR notes; ANNOTATED_BY deferred reason), R-09 (Mention cut; vocabulary paths -> final/vocabularies/), R-43/R-42 (RENDITION_OF_RECORD and SAME_AS deferred reasons), R-46 (uid pointers), R-28 (ATTEMPTED_FOR), R-04 (dependsOn indexes are deployment DDL), R-60 (pins), R-54 (D11.quantity-basis subkind), R-94 (seam/predicateSeam split; rows re-checked against final SDLs).

## Commands

```
$ cp packets/D11/04-schema-proposal.graphql final/schema/D11.graphql      # then 6 Edit-tool edits; banner `# ---- fragment D11 ----` stays on line 1
$ wc -c -l packets/D11/04-schema-proposal.graphql final/schema/D11.graphql
  120 8368 packets/D11/04-schema-proposal.graphql
  126 9176 final/schema/D11.graphql                                       # +6 lines, +808 B (docstrings + banner)
```

Registers were written by hand from 05, 06 and 10 (Write tool), every entry with `module: D11`; fixture path `final/fixtures/D11/capture-failures-coverage`.

Final SDL declarations of every seam type (graphql@16 parse of `final/schema/*.graphql`, script `$S/rels.cjs`):

```
$ node $S/rels.cjs REPORTS_ON REVISES HAS_REGISTRATION_VERSION HAS_ARM HAS_COMPONENT ADMINISTERS HAS_STUDY_ROLE REALIZES_SUBSTANCE HAS_ACTIVE_MOIETY HAS_LABEL_VERSION DECLARES_COMPONENT STATUS_OF STATUS_FROM CONCERNS LOT_OF CHUNK_OF COVERS_LOCATOR MENTIONS RENDITION_OF OCCURRENCE_OF
ADMINISTERS  D3 InterventionComponent.administers OUT -> AdministeredMaterial  AssertedRecordedProperties [CONNECT]
CHUNK_OF     D9 Chunk.snapshot OUT -> SourceSnapshot  StructuralEdgeProperties
CONCERNS     D8 RegulatoryRecord.concerns OUT -> RegulatoryRecordTopic  AssertedRecordedProperties
COVERS_LOCATOR D9 Chunk.locators OUT -> SourceLocator  DerivedEdgeProperties []
DECLARES_COMPONENT D6 LabelVersion.components OUT -> DeclaredComponentTarget  ComponentLineProperties
HAS_ACTIVE_MOIETY D1 ChemicalSubstance.activeMoieties OUT -> ChemicalSubstance  AssertedRecordedProperties
HAS_ARM / HAS_COMPONENT D3 StructuralEdgeProperties [CREATE, CONNECT]
HAS_LABEL_VERSION D6 Package.labelVersions OUT -> LabelVersion  AssertedEdgeProperties
HAS_REGISTRATION_VERSION D3 Study.registrationVersions OUT -> RegistrationVersion  AssertedEdgeProperties
HAS_STUDY_ROLE D3 Study.roles OUT -> StudyParty  StudyRoleEdgeProperties
LOT_OF       D8 Lot.lotOf OUT -> LotOfTarget  AssertedRecordedProperties
MENTIONS     D9 Chunk.mentions OUT -> Subjectable  DerivedEdgeProperties []
REALIZES_SUBSTANCE D1 IngredientMaterial.substances OUT -> ChemicalSubstance  AssertedRecordedProperties
RENDITION_OF D3 Publication.renditions IN -> Source ; D9 MediaWork.renditions IN -> Source  AssertedRecordedProperties
REPORTS_ON   D3 Publication.reportsOn OUT -> Study  AssertedRecordedProperties
REVISES      D3 Publication.revises OUT -> Publication  RevisionEdgeProperties (revisionKind: SourceRevisionKind!)
STATUS_FROM  D8 LegalStatus.establishedBy OUT -> RegulatoryRecord ; STATUS_OF D8 LegalStatus.statusOf OUT -> LegalStatusSubject AssertedEdgeProperties
union AdministeredMaterial = IngredientMaterial | ProductVariant | Intervention | FoodItem | DietaryPattern
union StudyParty = Organization | Person | Award
union DeclaredComponentTarget = IngredientMaterial | Constituent | FoodItem
union RegulatoryRecordTopic = ChemicalSubstance | IngredientMaterial | Product | Lot
union LegalStatusSubject = ChemicalSubstance | IngredientMaterial | Product | Patent
union LotOfTarget = Product | ProductVariant
```

(These are the other module editors' files as they stood when read; their own runlogs are authoritative.)

Action-space aliases (R-39), parsed with yaml@2 (PyYAML 1.1 fails on line 2931, a `?updated=` inside a flow sequence):

```
$ grep -c "^  - id: <id>$" tooling/action-space.yaml   # for each of the 10 node populatedBy ids + ncbi-eutils-pubmed -> 1 each
$ node -e "...yaml.parse(action-space.yaml)..."
entries 167 aliases 402 unresolved 0
D11 aliases whose canonical id differs from the local id: []
```

Register validation (`$S/check.cjs`: yaml@2 + graphql@16 over the final files):

```
node { nodes: 1, deferred: 9, mergedInto: 3 }
rel { relationships: 0, predicateOnly: 2, deferred: 9 }
seams { seams: 24, predicateSeams: 6, shared: 8, status: { accepted: 26, added: 4 } }
node missing []                                     # contract fields present
SDL object types [ 'CaptureAttempt' ] enums [ 'CaptureOutcome', 'CaptureFailureKind' ]
@node(labels: ["CaptureAttempt", "Occurrence"])
own props 14 = filter 5 + other 9 true
filterProps missing in SDL []
relationship fields 0
predicateOnly colliding with rel types []           # R-53, over every final/schema/*.graphql
seam types not declared in final SDL []
```

## Compile check

D11 declares no relationship field and references only kernel types (Entity, PrivacyClass), so no seam stubs were needed: the compile input is `kernel.graphql` + `D11.graphql`.

```
$ cat final/schema/kernel.graphql final/schema/D11.graphql > $S/compile.graphql ; cp final/schema/kernel.graphql $S/kernel-only.graphql
$ wc -c -l  -> compile.graphql 1316 lines 65216 B ; kernel-only.graphql 1190 lines 56040 B
$ BKS_SCHEMA_PATH=$S/compile.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema $S/compile.printed.graphql
wrote ...\module-D11\compile.printed.graphql (340949 chars) in 3s          # wall 39.7 s (pnpm + tsx startup)
$ BKS_SCHEMA_PATH=$S/kernel-only.graphql ... print-schema $S/kernel.printed.graphql
wrote ...\module-D11\kernel.printed.graphql (326571 chars) in 2s          # wall 19.0 s
```

The printer log does not name the SDL. Source confirmed: output is 0.34 MB (not the ~55 MB pinned fallback), and it contains the docstring text "never :Entity (R-17)" that exists only in `final/schema/D11.graphql`; `enum EntityImplementation` lists CaptureAttempt.

| measure | kernel alone | kernel + D11 | D11 marginal |
| --- | ---: | ---: | ---: |
| printed bytes | 326,595 | 340,973 | **+14,378** |
| printed lines | 6,498 | 6,779 | +281 |
| input types (`grep -c '^input '`) | 179 | 183 | **+4** |
| enums | 35 | 37 | +2 |
| object types | 105 | 108 | +3 |
| build (printer's own "in Ns") | 2 s | 3 s | |

Type diff (kernel vs kernel + D11): enums CaptureFailureKind, CaptureOutcome; inputs CaptureAttemptSort, CaptureAttemptWhere, CaptureFailureKindEnumScalarFilters, CaptureOutcomeEnumScalarFilters; types CaptureAttempt, CaptureAttemptEdge, CaptureAttemptsConnection. The packet reported +14,028 B / +4 inputs against A1's kernel; the +350 B difference is the synthesis docstrings.

```
$ node scripts/schema-size.mjs $S/compile.printed.graphql
printed size 0.3 MB | printed lines 6,780 | input types 183 | object types 108 | enums 37 | Query fields 28 | Mutation fields 0
(its SDL rows 192 / 3940 describe the pinned default SDL, not this file)
$ node packages/schema-workspace/dist/cli.js map --sdl $S/compile.graphql --out $S/compile-map.md
schemaDigest sha256:667728bebb61e5a8d069f5242238bf228fee173de10278a0b7bdc5618293f1e8
node types 12 | relationship fields 32 | distinct relationship types 13 | from→to pairs after expansion 48   # kernel alone: 11 / 32 / 13 / 47
```

D11 module counts: 1 node type, 0 relationship types, 0 pairs (collapsed, R-01). Expanded: +1 (kernel WAS_GENERATED_BY Activity.generated -> Entity gains the CaptureAttempt implementer; counted once in K under R-01).

Cypher check on the disposable Neo4j 5.26 (Q-D11-17 with the final labels):

```
$ docker exec bks-neo4j-synth cypher-shell -u neo4j -p bks-test-password "EXPLAIN CYPHER 25 MATCH ..."
25 is not a valid option for cypher version. Valid options are: 5          # 5.26 has no CYPHER 25 prefix
$ docker exec bks-neo4j-synth cypher-shell ... --format plain "EXPLAIN MATCH (act:Activity {missionId: 'm'})<-[:WAS_GENERATED_BY]-(c:CaptureAttempt:Occurrence) RETURN act.runId, c.toolId, c.outcome, c.failureKind ORDER BY act.runId, c.attemptedAt"
Planner "COST", Runtime "SLOTTED" ; exit 0
```

## Outputs

```
$ wc -c -l ; sha256sum
  126  9176  ec9a90a90a15bb7cea1390504fdaf1df115a32a0312bd51238a28f1fea286ee6  final/schema/D11.graphql
   81  9207  c9d0a7a58d2bc94b5c5da563cbf5846688c606526de99f47053c627da007d239  final/_work/registers/D11.node.yaml
   81  7088  7c7df51962768655bffa428d58dbd33e6b77ca7664c6941fbe17da6feeffb93b  final/_work/registers/D11.relationship.yaml
  110 18593  8b5ae2c0144b68793c21bb30efbd8b2f122b0e5fc1f19c4a922d88ec6dce9bce  final/_work/registers/D11.seams.yaml
```

## Issues for other stages

1. CQ-PV-05 (packets/D11/03) joins two Sources through one shared Identifier node, which R-42 forbids; the join must go through the record both describe (e.g. the D3 Study with the NCT). Flagged in the RENDITION_OF_RECORD deferred row; query-patterns stage.
2. Registrar of PROSPECTIVE_REGISTRATION_FLAG (subject D3.Study: R-52 rule 3 gives D3) and RECORD_LAST_UPDATED (subject K Source; not in K's closed convention list) left as D11 (only existing registrar); predicates.yaml stage decides.
3. R-35 / R-39 text: the projection registry (h2t-v1, xml-textcontent/v1, canonical-json, EDGAR tag strip) is not yet in `tooling/action-space.yaml` (generated file; its generator lives in packets/D11/_notes). The 402-alias map already exists there (0 unresolved).
4. Assessment subkind D11.quantity-basis (APPLICABILITY) must be in final/vocabularies/assessment-vocabularies.yaml (R-54).
5. Packet patterns use the `CYPHER 25` prefix, which Neo4j 5.26 rejects.
6. Text edits to packets/D11 09, 03, 11 (R-17, R-39, R-41, R-42 close, R-50 Q-D11-22) and the resveratrol fixture (R-44) belong to the query-patterns, open-questions and fixtures stages.
