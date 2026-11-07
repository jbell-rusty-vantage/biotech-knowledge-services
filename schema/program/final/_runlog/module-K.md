# Module K — kernel editor run log (S team, 2026-10-08)

## Kernel changes in synthesis (domain editors: follow these)

Two of these break the published kernel pattern (packets/K/09-reasoning.md). They are marked **non-additive**.

1. **Non-additive. `StateEpisodeProperties` is removed (R-10).** Edges that attach an entity to a versioned state use `AssertedEdgeProperties`: D3 HAS_REGISTRATION_VERSION, D5 HAS_EDITION and D6 HAS_LABEL_VERSION. Their 05 entries carry the new register field `exclusive: true`, and the executor enforces non-overlap per relationship type. The M11 verbatim-base list is now AssertedEdgeProperties, AssertedRecordedProperties, StructuralEdgeProperties and **DerivedEdgeProperties** (added by R-47). A domain superset type based on StateEpisodeProperties now copies AssertedEdgeProperties; the field list is identical.
2. **Non-additive, by extension of pattern item 11. RENDITION_OF has kernel meaning (R-43).** It runs Source → D9 MediaWork | D3 Publication. It is asserted with recorded time only (`AssertedRecordedProperties`, `[CONNECT]`) and is declared IN on `MediaWork.renditions` and `Publication.renditions`. D3 registers it. The kernel-meaning types are now DERIVED_FROM, ASSESSES, MENTIONS and RENDITION_OF. Source family is the OCCURS_IN work, else the RENDITION_OF work, else the Source.
3. `Assertion.validObservedAtPrecision: TimePrecision` is added (R-24).
4. `BasisKind.CURATOR_CLASSIFICATION` is added (R-25). Use it for ON_FRONTIER, the D2 hallmark mapping, D5 OPERATIONALIZED_BY and D4 curator attachments.
5. `SourceRevisionKind` (K) is the only revision vocabulary (R-44). D3 REVISES records a revising work once it is identified. HAS_REVISION_STATUS is only for non-scholarly Sources and for flags with no notice. One (asserter, notice) is never recorded both ways.
6. ASSERTED_BY also admits D3 Publication and D9 MediaWork, for a multi-author work's own voice (R-15, P20).
7. The kernel predicate conventions have registrar K (R-52): FIELD_NOT_REPORTED, HAS_REVISION_STATUS, RATES_CLAIM, CORRECTS (new), HAS_IDENTIFIER, CITES_AS_SUPPORT and HAS_CREDENTIAL. Domains remove their own registrations of these.
8. Only D10 ASSOCIATES and D5 STEP_USES may target Subjectable outside the kernel-meaning types (R-28).
9. `contentHashBasis` has five values (R-35): RAW_BYTES, CANONICAL_PROJECTION, TOOL_RENDITION, STORED_EXCERPT_TEXT and SYNTHETIC_FIXTURE.
10. `DerivedEdgeProperties.score` is a retrieval score only. It is never set between two domain entities (R-47).

The rest are docstring changes in `kernel.graphql`, made only to align it with R-09, R-14, R-16, R-18, R-19, R-20, R-22, R-23, R-31, R-37, R-38 and R-42. None of them changes a type or a field.

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-09 to R-53 read in full for the kernel); `final/_work/rulings.yaml` (`global`, `modules.K`, and every other module's rows that name a K type).

```
$ sha256sum packets/K/04-schema-proposal.graphql packets/K/05-relationship-register.yaml packets/K/06-node-register.yaml packets/K/10-seams.yaml
b2c2b1b0094ead58428513868e38fa893f72d977adbc66ae7a89924a8cb7d5c7  packets/K/04-schema-proposal.graphql
4d296e0ea5fdf0d42b627b699504f1c82aebd333bd6079130356ec85b16ed9bf  packets/K/05-relationship-register.yaml
b1c9fd55358d664a668cbb1792c261931eb1e868be779406b9ec1e6663676dca  packets/K/06-node-register.yaml
47d2e171ff797457a1942689560fa7c49eae3193f97754a34469798cf5b10937  packets/K/10-seams.yaml
```

## Commands

```
$ mkdir -p final/schema final/_work/registers final/_runlog
$ cp packets/K/04-schema-proposal.graphql final/schema/kernel.graphql
```

The SDL edits were made with the Edit tool. The banner `# ---- fragment K ----` stays on line 1.

| ruling | SDL edit |
| --- | --- |
| R-10 | removed `type StateEpisodeProperties`; AssertedEdgeProperties docstring now states the `exclusive: true` rule |
| R-22 | AssertedEdgeProperties docstring: projection gate and one episode per (from, to, type, asserter) |
| R-24 | `Assertion.validObservedAtPrecision: TimePrecision`; qualifier `sourceRecordRemovedAt:` in the qualifiers docstring |
| R-25 | `BasisKind.CURATOR_CLASSIFICATION` (placed before UNSTATED), with the enum docstring |
| R-47 | `DerivedEdgeProperties.score` docstring; M11 base |
| R-44 | `SourceRevisionKind` docstring; `SourceSnapshot.revisionKind` is a capture cache; HAS_REVISION_STATUS convention in the Assertion docstring |
| R-09, R-43, R-26 | Source docstring (D9 containers MediaWork and Channel; D3 Publications; RENDITION_OF; source family; curation files as Sources) |
| R-43 | `Report.distinctSourceFamilyCount` docstring |
| R-35, R-37 | `contentHashBasis` five values; `contentHash` identity vs `canonicalProjectionHash` change detection; durable `storageUri` |
| R-38 | `SourceLocator.selectorJson`: `basis` is mandatory |
| R-15, R-16 | Assertion docstring (asserter defaults); `assertedBy` field docstring (Publication, MediaWork) |
| R-14, R-19, R-20, R-23, R-31, R-52 | Assertion docstring (FIELD / RELATIONSHIP / CLAIM kinds; CORRECTS; RATES_CLAIM object slot; supersedesUid same asserter) |
| R-20 | Assessment docstring: `occurrence=` facet, "and the speaker" |
| R-18, R-28 | Subjectable docstring (versioned-state rule; the two domain exceptions) |
| R-42 | Identifier docstring (uniqueness) |

Registers were built from the packet's 05, 06 and 10 files. Every entry keeps every contract field and adds `module: K`.
- `K.relationship.yaml` is written by hand from 05.
- `K.node.yaml` is built from 06 by a Python string-replace script (stdin). Each replace was asserted to match exactly once.
- `K.seams.yaml` is written by hand from 10.

```
$ python - <<'EOF' ... (K.node.yaml build) ... EOF
13                       # occurrences of "module: K" (top + 11 nodes + header comment)
$ python -c "yaml.safe_load(...)"   # per file
K.node.yaml {'version': 1, 'module': 'K', 'nodes': 11, 'deferred': 10, 'mergedInto': 33}
K.relationship.yaml {'version': 1, 'module': 'K', 'relationships': 13, 'predicateOnly': 6, 'authorizingPredicates': 1, 'deferred': 43}
K.seams.yaml {'version': 1, 'module': 'K', 'seams': 27, 'predicateSeams': 1, 'sharedVocabularies': 6}
```

Contract-field and SDL cross-check (Python, yaml + regex over `kernel.graphql`):

```
rel missing: []
node missing: []
seam missing: []
13 True                      # relationship types in SDL == register entries
predicateOnly & relTypes: set()
11 True                      # node types in SDL == node register
relationshipProperties types: ['AssertedEdgeProperties', 'DerivedEdgeProperties', 'StructuralEdgeProperties', 'AssertedRecordedProperties', 'IdentifierLinkProperties', 'EvidenceEdgeProperties']
```

Compiling the kernel alone with print-schema:

```
$ BKS_SCHEMA_PATH=C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/schema/kernel.graphql \
  NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema \
  C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/module-K/kernel.printed.graphql
wrote ...\synth\module-K\kernel.printed.graphql (326571 chars) in 1s
wall: 7 s
$ wc -c -l kernel.printed.graphql      -> 6498 lines, 326595 bytes
$ grep -c '^input '                    -> 179
$ grep -c '^enum '                     -> 35
$ grep -c '^type '                     -> 105
$ grep -c validObservedAtPrecision     -> 5
$ grep -c CURATOR_CLASSIFICATION       -> 2
$ grep -c StateEpisodeProperties       -> 0
```

The print-schema log does not name the SDL it used. I confirmed the source in two ways: the output is 0.3 MB, not the ~55 MB pinned fallback, and it contains the two additions made only in `final/schema/kernel.graphql` (`validObservedAtPrecision`, `CURATOR_CLASSIFICATION`).

Comparison with the K packet SDL compiled the same way:

```
$ BKS_SCHEMA_PATH=.../packets/K/04-schema-proposal.graphql ... print-schema .../synth/module-K/K-packet.printed.graphql
wrote ... (322880 chars) in 1s
-> 6466 lines, 322904 bytes, 179 inputs, 35 enums, 105 types, StateEpisodeProperties 0
```

| measure | K packet | final kernel | delta |
| --- | ---: | ---: | ---: |
| SDL bytes / lines | 51,355 / 1,171 | 56,040 / 1,190 | +4,685 / +19 |
| printed bytes | 322,904 | 326,595 | +3,691 |
| printed lines | 6,466 | 6,498 | +32 |
| input types | 179 | 179 | 0 |
| enums | 35 | 35 | 0 |

When the kernel is compiled alone, removing StateEpisodeProperties saves 0 printed bytes: no kernel field uses it, so it never reached the printed output. Its saving shows only in the assembled schema (decision report, −6,997 B and −2 inputs, measured in the state variant). The +3,691 B comes from docstrings and the one new field.

```
$ node packages/schema-workspace/dist/cli.js map --sdl .../final/schema/kernel.graphql --out .../synth/module-K/kernel-map.md
"schemaDigest": "sha256:ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71"
node types 11 | relationship fields 32 | distinct relationship types 13 | from→to pairs after expansion 47 (kernel alone: Subjectable has 3 implementers)
$ node scripts/schema-size.mjs .../synth/module-K/kernel.printed.graphql
printed size 0.3 MB | printed lines 6,499 | input types 179 | object types 105 | enums 35 | Query fields 26 | Mutation fields 0
(its "SDL node types 192 / pairs 3940" rows describe the pinned SDL, which is its default, not the kernel)
$ sha256sum final/schema/kernel.graphql final/_work/registers/K.*.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
5409bbe9ee92c6dcc3a897ccbadd97ea843b24a139a7f76addee267a6ebf1ab4  final/_work/registers/K.node.yaml
90243b5c2ee5a18f62b20a9e528f0e4a5c850a040aa6c64f791fcf16d994d170  final/_work/registers/K.relationship.yaml
bcc2b8b113d45779a87a825c3e17f82549494e1b1547f50fa30a26dbc9bd8b5e  final/_work/registers/K.seams.yaml
```

## Register edits (summary)

- **Relationship register:**
  - `module: K` is added to every entry.
  - ASSERTED_BY: the cardinality and rationale follow R-15 and R-16.
  - DERIVED_FROM: the rationale follows R-11, R-20, R-21 and R-48. citesAssociations stays cut.
  - HAS_IDENTIFIER: the uniqueness rule from R-42.
  - predicateOnly: every entry gets `registrar: K`, and CORRECTS is added (R-20, R-52). The meanings of RATES_CLAIM (R-31), HAS_REVISION_STATUS (R-44) and FIELD_NOT_REPORTED (R-16) are updated.
  - HAS_IDENTIFIER moves to a new list, `authorizingPredicates`, under R-53.
  - deferred: CORRECTS is added. The reasons for RENDITION_OF (R-43), ANNOUNCED_IN and REVISES_SOURCE (R-44) and RESOLVES_MENTION (R-27) are updated.
- **Node register:**
  - `module: K` is added to every entry.
  - Assertion `otherProperties` goes from 17 to 18 (R-24).
  - The Source whyNode is updated (R-43, R-42).
  - The Mention, RetractionNotice and SourceRevisionEvent rows are updated (R-09, R-44).
- **Seams:**
  - Removed: DERIVED_FROM ReportItem→Association and BLOCKED_BY ReportItem→Assertion (R-09).
  - Added: RENDITION_OF Source→D3.Publication (R-43), REVISES D3.Publication→D3.Publication (R-44), STEP_USES D5.ProtocolStep→Subjectable (R-28) and HOLDS_ROLE D7.Person→D7.Organization (R-15).
  - A new `predicateSeams` list holds AUTHORED_BY, registrar D3 (R-94, R-15).
  - Notes are updated on MENTIONS (R-27), OCCURS_IN (R-19), RENDITION_OF→MediaWork (R-43), ASSERTED_BY (R-15), ASSOCIATES (R-28, R-48), OBSERVED_IN_CONTEXT and RESOLVES_TO_CONSTRAINT (R-29, R-76), and WAS_GENERATED_BY CaptureAttempt (R-41, R-17, R-09).
  - sharedVocabularies point at `final/` (R-09). Pins are targets 0.2.2 and frontiers 0.2.1 (R-60). The predicates and assessment-vocabularies registers are added (R-52, R-54).

## Not done here (other deliverables or owner)

- Text edits to 09-reasoning, 03-retrieval-patterns, 02-questions and 11-open-questions. These cover R-09, R-10, R-14 to R-31, R-37, R-38, R-43, R-44, R-45, R-46, R-48, R-49, R-50 and R-76. They belong to query-patterns, questions-catalog and open-questions.
- The `identifier-schemes.yaml` edits for R-42 (new schemes, normalizationRule ids, the uniqueness rule). They belong to the vocabulary editor.
- R-12 and R-13 are owner confirmations. The removals in R-09 and R-10 are non-additive and wait for owner confirmation.
