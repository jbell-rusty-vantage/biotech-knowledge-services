# Module D9 — module editor run log (S team, 2026-10-08)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-01 to R-06, R-15 to R-29, R-43, R-49, R-50, R-52 to R-55, R-65, R-67, R-74, R-79 to R-84, R-88, R-94 read in full); `final/_work/rulings.yaml` (`global`, `modules.D9`, and every other module's rows that name a D9 type or predicate); `final/schema/kernel.graphql`; `final/_runlog/module-K.md` ("Kernel changes in synthesis"); `final/_work/registers/K.*.yaml`; `scratchpad/inv/review-open-issues.json` (D9 block).

```
$ git rev-parse --short HEAD
e484fd2
$ sha256sum packets/D9/04-schema-proposal.graphql packets/D9/05-relationship-register.yaml packets/D9/06-node-register.yaml packets/D9/10-seams.yaml final/schema/kernel.graphql
bb5d7e250a4a1fa0a84e2fb33cbd8c03280e560da2fa1c118f33b2ef44509644  packets/D9/04-schema-proposal.graphql
350623eab56e72f0765d3fb5e1335c0fb9ca1e3a68e8e0aab142363a889552c5  packets/D9/05-relationship-register.yaml
e21fa2eca34ac8ae1fd3e9ffe1fe52dfedf158a17afbda24b8317803acc5acfb  packets/D9/06-node-register.yaml
1fcb16336dd0c5af1b039e9229c77408682a8df1492c5d1d87786246ff000af0  packets/D9/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
```

## Commands

```
$ cp packets/D9/04-schema-proposal.graphql final/schema/D9.graphql
```

The SDL edits were made with the Edit tool and with a Python string-replace script (each replace asserted to match exactly once). The banner `# ---- fragment D9 ----` stays on line 1. Line endings are LF (`grep -c $'\r'` → 0).

| ruling | SDL edit (final/schema/D9.graphql) |
| --- | --- |
| R-43, R-26 | `MediaWork.renditions` (RENDITION_OF): `properties: "StructuralEdgeProperties"` → `"AssertedRecordedProperties"`; docstring `class: asserted`, kernel meaning (Source → MediaWork \| D3 Publication; declared by D9 and D3; registered by D3), recorded time only, source-family rule. `nestedOperations: [CONNECT]` unchanged (R-03 asserted). |
| R-19 | `MediaWork.occurrences` (OCCURS_IN) docstring: every Assertion whose evidence is in this work, not only CLAIM; exactly one container per Assertion. MediaWork type docstring, first sentence, likewise. |
| R-15 | MediaWork type docstring: a multi-byline work is the ASSERTED_BY target of what it states in its own voice; a bylined web article is asserted by its single named author, else the site owner. |
| R-94 | Header: `Mention;` dropped from the "What D9 does NOT declare" kernel types list. A synthesis line was added to the header. |

No type, field, enum or union was added or removed. The rest of the D9 rulings change no SDL:
- R-17: Chunk keeps `@node(labels: ["Chunk"])` (confirmed).
- R-79: OPERATED_BY and REPUBLISHES stay predicate-only (confirmed).
- R-52, R-65, R-55, R-82, R-83 are register and seam edits.
- R-20 (closes K-2, K-3), R-65 (closes D13-2), R-49 (fixture edit), R-55 (fixture re-key) and R-50 (CQ-CL-07 answer kind retrieved → assessment) touch 11-open-questions, fixtures or 02-questions. None of those is a deliverable of this stage. They are listed under "Left for later stages".

```
$ diff packets/D9/04-schema-proposal.graphql final/schema/D9.graphql   # 6 hunks, exactly the edits above
$ wc -c -l packets/D9/04-schema-proposal.graphql final/schema/D9.graphql
  343 18943 packets/D9/04-schema-proposal.graphql
  348 19862 final/schema/D9.graphql            (+5 lines, +919 bytes)
```

Registers were built from the packet's 05, 06 and 10 files. Every entry keeps every contract field and adds `module: D9`.
- `D9.node.yaml` was built from 06 by a Python string-replace script (stdin), each replace asserted to match once.
- `D9.relationship.yaml` and `D9.seams.yaml` were written by hand from 05 and 10.

### Register edits

- **Relationship register** (`D9.relationship.yaml`):
  - `module: D9` is added to every entry. Every `fixture` now points at `final/fixtures/D9/hl52-transcript-nmn-practice`.
  - RENDITION_OF (R-43, R-26): class asserted, AssertedRecordedProperties, `kernelMeaning: true`, `registrar: D3`, `declaredBy: [D9, D3]`. The rationale now says a wrong join is corrected by a superseding episode. The entry stays because D9 declares `MediaWork.renditions`. D3's register holds the registration.
  - OCCURS_IN (R-19): `from`, cardinality and rationale cover every Assertion whose evidence is in a MediaWork. T falls back to the snapshot.
  - MENTIONS (R-27): `kernelMeaning: true` and `registrar: D9`. It is licensed by entity-link/vN, and RESOLUTION is needed only on a surface-form binding.
  - COVERS_LOCATOR (R-27): answers cite HAS_EVIDENCE.
  - APPEARS_IN (R-80, R-81): rationale only.
  - New list `authorizingPredicates` (R-53, R-52): APPEARS_IN and CONTENT_SPONSORED_BY. These Assertion predicates authorize D9's typed asserted edges. They need registration (the executor rejects unregistered predicates), but they cannot be predicateOnly entries. This follows K's HAS_IDENTIFIER handling.
  - `predicateOnly`:
    - Every entry has `registrar: D9`.
    - CORRECTS is removed (K registers it, R-20, R-52). It is recorded under `deferred`.
    - RECOMMENDS_AGAINST is added (R-52, R-83).
    - RECOMMENDS_USE gets aliases RECOMMENDS_FOR and ENDORSES_PRODUCT. Its subject is the means, never a Target, and a goal is the qualifier `target:<key>` (R-83).
    - DISCLOSES_INTEREST is rewritten as the one disclosure predicate, with its aliases (R-82).
    - OPERATED_BY gets alias OPERATES_CHANNEL and the R-79 promotion trigger. REPUBLISHES cites R-79.
    - RECORDING_OF cites R-65. CITES_CONTENT cites R-74.
  - `deferred`: the reasons for RECOMMENDS (R-83), RETELLS (R-21), QUALIFIED_BY and ASSESSES_RETELLING… (R-20), RECORDING_OF… (R-65, R-81), AUTHORED_BY (R-80) and REPORTS_ADVERSE_EXPERIENCE (R-84) are updated, and a CORRECTS row is added.
- **Node register** (`D9.node.yaml`):
  - `module: D9` is added to each of the 3 nodes.
  - The header lists the synthesis edits.
  - mergedInto `Conference` follows R-65: Channel EVENT_SERIES + D13 DATA_PRESENTATION Events, with edition and session as qualifiers on PRESENTED_AT_CONFERENCE.
  - mergedInto `ConflictRelevanceAssessment` follows R-55: registrar D7, and D9 contributes the disclosure facets.
  - The MediaWork whyNode follows R-15.
  - The Chunk mutationsNote records R-17 (labels `["Chunk"]`).
- **Seams** (`D9.seams.yaml`):
  - `seams` and `predicateSeams` are separate lists (R-94). Every row has `module: D9`, `status` (accepted \| cut) and `ruling` (`none` = carried unchanged).
  - Rows added:
    - RENDITION_OF, K.Source → D9.MediaWork (R-43).
    - ASSERTED_BY → MediaWork \| ACCOUNT Channel (R-15).
    - The predicate seams DISCLOSES_INTEREST (R-82), RECOMMENDS_USE \| RECOMMENDS_AGAINST (R-83), PRESENTED_AT_CONFERENCE (D13 → D9.Channel, R-65) and CORRECTS (registrar K, R-20).
  - Cut: RECOMMENDS (derived, not declared; R-83).
  - Notes updated:
    - ASSESSES: R-20, R-49 and R-55. The merged disclosureFinding list is written out. DISCOURSE_METRIC and the interim OTHER form are withdrawn.
    - DERIVED_FROM: R-20 and R-21.
    - OCCURS_IN and HOLDS_* reads: R-19.
    - ON_FRONTIER: R-91.
  - Vocabulary files now point at `final/` (targets pin 0.2.2, frontiers pin 0.2.1, R-60), not at sibling worktrees.

Contract-field and SDL cross-check (Python, yaml + regex over `final/schema/D9.graphql`; script `scratchpad/synth/module-D9/check.py`):

```
$ python .../synth/module-D9/check.py final/_work/registers
relationship {'version': 1, 'module': 'D9', 'relationships': 8, 'authorizingPredicates': 2, 'predicateOnly': 10, 'deferred': 18}
node {'version': 1, 'module': 'D9', 'nodes': 3, 'deferred': 11, 'mergedInto': 31, 'unionsRetired': 8}
seams {'version': 1, 'module': 'D9', 'seams': 12, 'predicateSeams': 11, 'sharedVocabularies': 7}
rel missing []
seam missing []
pseam missing []
sdl rel types ['APPEARS_IN', 'CHUNK_OF', 'CONTENT_SPONSORED_BY', 'COVERS_LOCATOR', 'MENTIONS', 'OCCURS_IN', 'PUBLISHES', 'RENDITION_OF'] True
predicateOnly & reltypes set() predicateOnly without registrar []
nodes ['Channel', 'Chunk', 'MediaWork'] True
packet predicateOnly ['CITES_CONTENT', 'CORRECTS', 'DEPICTS', 'DISCLOSES_INTEREST', 'LINKS_TO_OFFER', 'OPERATED_BY', 'RECOMMENDS_USE', 'RECORDING_OF', 'REPUBLISHES', 'TAKES']
final predicateOnly ['CITES_CONTENT', 'DEPICTS', 'DISCLOSES_INTEREST', 'LINKS_TO_OFFER', 'OPERATED_BY', 'RECOMMENDS_AGAINST', 'RECOMMENDS_USE', 'RECORDING_OF', 'REPUBLISHES', 'TAKES']
fixtures ['final/fixtures/D9/hl52-transcript-nmn-practice']
Channel lost [] / MediaWork lost [] / Chunk lost []      # no packet node-register field dropped
(no packet relationship-register field dropped)
```

The retired names that remain in the final files (OPERATES_CHANNEL, RECOMMENDS_FOR, COMPETING_INTEREST_STATED, REPORTS_ADVERSE_EXPERIENCE, DISCOURSE_METRIC, StateEpisodeProperties) appear only as `aliases`, as "retired" or "withdrawn" notes, or in the SDL's "absorbs pinned …" history line.

## Compile check (kernel + D9 + scratch seam stubs)

The stubs live in scratch only (`scratchpad/synth/module-D9/mods*/seam-closure.graphql`). They are D7 Person, Organization and Brand, each `implements Entity & Subjectable` with the 7 Entity fields, `@query(aggregate: false)` and `@mutation(operations: [])`.

```
$ node scripts/assemble-schema.mjs --modules .../synth/module-D9/mods    --out .../synth/module-D9/K+D9.graphql      # ok, modules 3, types 66
$ node scripts/assemble-schema.mjs --modules .../synth/module-D9/mods-ks --out .../synth/module-D9/K+stubs.graphql   # ok, modules 2, types 54
$ node scripts/assemble-schema.mjs --modules .../synth/module-D9/mods-pk --out .../synth/module-D9/K+D9packet.graphql  # packet D9 SDL, same kernel + stubs
  K+D9 manifest: kernel.graphql ec981e2a…, D9.graphql 323e181a…, seam-closure.graphql d4242b2d…; assembled sha256 25f34429…
$ BKS_SCHEMA_PATH=C:/Users/Pinda/AppData/Local/Temp/claude/.../synth/module-D9/K+D9.graphql NODE_OPTIONS=--max-old-space-size=8192 \
  pnpm --filter @bks/graphql-api print-schema C:/.../synth/module-D9/K+D9.printed.graphql
wrote ...\K+D9.printed.graphql (445125 chars) in 1s          wall 7 s
$ ... K+stubs.graphql    -> wrote ...\K+stubs.printed.graphql (341798 chars) in 1s     wall 7 s
$ ... final/schema/kernel.graphql -> wrote ...\K.printed.graphql (326571 chars) in 1s
$ ... K+D9packet.graphql -> wrote ...\K+D9packet.printed.graphql (440480 chars) in 1s
$ wc -c / wc -l / grep -c '^input ' / '^enum ' / '^type ' / '^union '
K           bytes=326595 lines=6498 inputs=179 enums=35 types=105 unions=0
K+stubs     bytes=341822 lines=6756 inputs=185 enums=35 types=114 unions=0
K+D9        bytes=445199 lines=8701 inputs=236 enums=42 types=143 unions=1
K+D9packet  bytes=440552 lines=8642 inputs=234 enums=42 types=142
$ grep -c "^type MediaWork \|^type Chunk \|^type Channel " K+D9.printed.graphql   -> 3
$ grep -A4 "^type MediaWorkRenditionsRelationship" K+D9.printed.graphql           -> properties: AssertedRecordedProperties!
$ grep -c Mutation K+D9.printed.graphql                                           -> 0
$ diff <(grep '^input ' K+D9packet.printed | sort) <(grep '^input ' K+D9.printed | sort)
> input AssertedRecordedPropertiesSort {
> input AssertedRecordedPropertiesWhere {
```

There were no compile errors. The print-schema log does not name the SDL it used. I confirmed the source two ways: every output is 0.3–0.45 MB, not the ~55 MB pinned fallback, and K+D9 contains the D9 types plus the R-43 edge-property change.

| measure | K alone | K + stubs | K + D9 + stubs | D9 marginal over K + stubs | D9 marginal over K alone | packet D9 marginal over K + stubs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| printed bytes | 326,595 | 341,822 | 445,199 | +103,377 | +118,604 | +98,730 |
| printed lines | 6,498 | 6,756 | 8,701 | +1,945 | +2,203 | — |
| input types | 179 | 185 | 236 | +51 | +57 | +49 |
| enums | 35 | 35 | 42 | +7 | +7 | +7 |
| object types | 105 | 114 | 143 | +29 | +38 | +28 |

The synthesis edits cost +4,647 printed bytes, +2 inputs (AssertedRecordedPropertiesSort/Where) and +1 object type (AssertedRecordedProperties), all from R-43. No kernel field uses AssertedRecordedProperties, so D9's RENDITION_OF is the first field to print it. In the full assembly D3 Publication.renditions and the other domains' AssertedRecordedProperties edges share it.

Pairs and types:

```
$ node .../synth/module-D9/d9pairs.mjs final/schema/D9.graphql
node types 3 Channel,MediaWork,Chunk | relationship types 8 | pairs collapsed 9 | pairs excl. kernel-meaning 7 | unions ContentSponsor=2
  APPEARS_IN|Person|MediaWork, CHUNK_OF|Chunk|SourceSnapshot, CONTENT_SPONSORED_BY|MediaWork|Brand, CONTENT_SPONSORED_BY|MediaWork|Organization,
  COVERS_LOCATOR|Chunk|SourceLocator, MENTIONS|Chunk|Subjectable, OCCURS_IN|Assertion|MediaWork, PUBLISHES|Channel|MediaWork, RENDITION_OF|Source|MediaWork
$ node .../synth/arch-slim/pairs.mjs K+stubs.graphql      -> collapsed(interface=1) 29 expanded 71 Subjectable implementers 6 Entity 14
$ node .../synth/arch-slim/pairs.mjs K+D9.graphql         -> collapsed(interface=1) 38 expanded 104 Subjectable implementers 8 Entity 17
$ node .../synth/arch-slim/pairs.mjs K+D9packet.graphql   -> collapsed(interface=1) 38 expanded 104 Subjectable implementers 8 Entity 17
$ node packages/schema-workspace/dist/cli.js map --sdl .../K+D9.graphql --out .../K+D9-map.md
  node types 17 | relationship fields 40 | distinct relationship types 21 | pairs after expansion 104 | schemaDigest sha256:25f34429…
```

D9 adds 3 node types, 8 relationship types and 9 collapsed pairs (+9 over K + stubs: 29 → 38). Under R-01, 7 of those pairs are D9-owned once the kernel-meaning types RENDITION_OF and MENTIONS are counted in K. The widest union is ContentSponsor with 2 members, within the ≤6 limit. R-43 changes no pair count: the packet SDL and the final SDL give the same 38 / 104.

```
$ sha256sum final/schema/D9.graphql final/_work/registers/D9.*.yaml
323e181a03ff6a268bf732b07348cb86a223e758e9b63831d0120fffc96744bb  final/schema/D9.graphql
882cd4b3b4f961535dcf7e7fb7b0eae2ddec59d8c88c51606eef2feb2617aafa  final/_work/registers/D9.node.yaml
17a7c68ab0a220a01074ebfb42d75d9bbd5b3e9348d98990ae50714429af08f2  final/_work/registers/D9.relationship.yaml
446725ac129b1c8e42016af47a38a75b9f16af0c75e36b566e197c79374a54cf  final/_work/registers/D9.seams.yaml
```

## Left for later stages (not deliverables of the module editor)

- **Fixtures (R-43, R-26).** Nine RENDITION_OF rows in five D9 fixtures (`grep -c RENDITION_OF packets/D9/07-fixtures/*/assertions.yaml`: hl52 3, hl-essentials 3, lifespan 1, longecity 1, rapa 1, sinclair 0) are written `class: structural`. Under R-43 each needs an authorizing Assertion (predicate RENDITION_OF, registrar D3) and AssertedRecordedProperties.
- **Fixtures (R-49).** `hl-essentials-recut-nmncom-retelling/assertions.yaml:152` still carries `assessmentKind: OTHER # interim; kernel request K-10 DISCOURSE_METRIC`. R-49 removes it, and metrics become projection-cache properties.
- **Fixtures (R-55).** Re-key the disclosureFinding values to the merged list. One fixture (hl52 or sinclair) must give the same Assessment through the D7 and D9 patterns.
- **R-49 schema form.** The ruling puts the metrics on the measured node (Claim, Channel or Person) as projection-cache properties. rulings.yaml lists only a fixture edit for D9, so no property was added to Channel ("2–3 scalar properties per measured type, not measured"). This is for the integrator or the owner.
- **11-open-questions closures.** K-2 and K-3 (R-20), D13-2 (R-65), C-6/C-10 (R-17) and C-9 (R-79). **02-questions:** the CQ-CL-07 answer kind changes from retrieved to assessment (R-50).
- **Vocabulary stage.** `final/vocabularies/predicates.yaml` must carry D9's ten predicateOnly entries, the two authorizingPredicates and the aliases. `vocab-source-genres.yaml` still lives in `packets/D9/`.
