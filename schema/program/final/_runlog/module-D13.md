# Module D13 — module editor run log (S team, 2026-10-08)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-01–R-07, R-44, R-65, R-66, R-69, R-81, R-91, R-92, R-94 read in full; the other D13 mentions located by `grep -n D13`), `final/_work/rulings.yaml` (`global`, `modules.D13`), `final/schema/kernel.graphql`, `final/_runlog/module-K.md` (kernel changes 1–10), packets/D13 04, 05, 06, 09 (compile check), 10, and `scratchpad/inv/review-open-issues.json` (D13).

```
$ git rev-parse --short HEAD
e484fd2
$ sha256sum packets/D13/04-schema-proposal.graphql packets/D13/05-relationship-register.yaml packets/D13/06-node-register.yaml packets/D13/10-seams.yaml final/schema/kernel.graphql
e40285b99b2813402f19f65e20b02cb18e817500e7d21face846d0158fc9a479  packets/D13/04-schema-proposal.graphql
0c7095d74b813059e06f25a5c31a28e97dda084bdb3f67b02d8394f73891ba8e  packets/D13/05-relationship-register.yaml
d211c2036d16f99851871af3fa95c89ee06deedf287fb372389d16a4b3c4446c  packets/D13/06-node-register.yaml
c7e7adbd5885dc08ca178c89c78e03b050569b08e5f7fe1c4931c5b0bb67bba4  packets/D13/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
$ grep -n "D13" final/_work/rulings.yaml        # modules.D13 = 20 rows (R-44 x4, R-66 x3, R-69 x2, R-92 x2, R-52, R-21 x2, R-22, R-25, R-35, R-94, R-60, R-65)
$ grep -rn "INVOLVES" -A12 packets/D13/07-fixtures/*/assertions.yaml | grep "Person\|role"
  -> only lesne-2006-retraction writes INVOLVES to D7.Person (roles AUTHOR); PUBLISHER row is to an Organization
$ grep -n "RegulatoryPathway" -A40 packets/D8/04-schema-proposal.graphql   # 33 values, copied into the scratch stub
```

## SDL: `final/schema/D13.graphql`

```
$ cp packets/D13/04-schema-proposal.graphql final/schema/D13.graphql
```

Edits with the Edit tool; banner `# ---- fragment D13 ----` stays on line 1, followed by a six-line synthesis note.

| ruling | SDL edit |
| --- | --- |
| R-44 | `EventKind.PUBLICATION` removed; `RETRACTION` gets a value docstring (curated frontier milestone only, EVENT_ABOUT → D3 Publication, clock cites the notice locator, no second date Assertion) |
| R-44 | `EventRole.AUTHOR` and `EventRole.PUBLISHER` removed; `Event.involvedPeople` docstring drops "authors of a retracted paper" and the CQ-EV-05 question (authors via D3 AUTHORED_BY) |
| R-66 | `enum ApprovalPathway` and `enum DesignationType` removed; `Event.approvalPathway` and `Event.designationType` retyped to D8 `RegulatoryPathway`, docstrings carry the OQ-D8-02 mapping |
| R-66 | `EventRole.APPLICANT`, `REGULATOR`, `ISSUER` docstrings: only without DOCUMENTED_BY_RECORD, executor-enforced; Event docstring: one record + at most one Event, no re-asserted D3/D8 date, process chains from the D8 application identifier |

Unchanged on purpose: the 23 L3 directives (`@filterable(byValue: false …) @sortable(byValue: false)`) the packet already carried. R-02 makes L3 an owner lever and not a program default, but no ruling asks D13 to remove them (see issues).

```
$ grep -n "ApprovalPathway\|DesignationType\|PUBLICATION\|\bAUTHOR\b\|PUBLISHER\|SPEAKS_AT\|StateEpisode\|HAS_REVISION_STATUS\|NORMALIZED_TEXT" final/schema/D13.graphql
  -> only the synthesis note (lines 3-5), the RETRACTION docstring (line 48) and the pinned-merge history in the EventRole docstring (line 110)
$ grep -c "^enum " final/schema/D13.graphql            -> 8   (packet: 10)
$ awk '/^enum EventKind/,/^}/' … | grep -c value       -> 26  (packet: 27)
$ awk '/^enum EventRole/,/^}/' … | grep -c value       -> 14  (packet: 16)
$ wc -c -l final/schema/D13.graphql                    -> 367 lines, 27,203 bytes (packet: 25,812 bytes)
$ sha256sum final/schema/D13.graphql                   -> 24f8f6853a6b74e72569f9a7b6bc60abe2a58a16b337cac1928ab26aa7ae0508
```

## Compile check

Scratch (`scratchpad/synth/module-D13/`): `stubs.graphql` (1,964 bytes) = D7 `Organization`, D7 `Person`, D3 `Study`, D8 `RegulatoryRecord` (each `Entity & Subjectable`, the seven Entity fields only, `@query(aggregate:false) @mutation(operations:[])`) + D8 `enum RegulatoryPathway` (33 values copied from packets/D8). `kernel+stubs.graphql` = kernel.graphql + stubs; `compile.graphql` = kernel+stubs + final D13; `compile-packet.graphql` = kernel+stubs + packets/D13 04 (for the delta).

```
$ for n in kernel+stubs compile compile-packet; do
    BKS_SCHEMA_PATH=C:/…/scratchpad/synth/module-D13/$n.graphql NODE_OPTIONS=--max-old-space-size=8192 \
      pnpm --filter @bks/graphql-api print-schema C:/…/scratchpad/synth/module-D13/$n.printed.graphql; done
wrote …\kernel+stubs.printed.graphql (346841 chars) in 3s      exit 0, wall 46 s (first run, tsx warm-up)
wrote …\compile.printed.graphql (423117 chars) in 2s           exit 0, wall 20 s
wrote …\compile-packet.printed.graphql (421943 chars) in 2s    exit 0, wall 12 s
$ BKS_SCHEMA_PATH=C:/…/final/schema/kernel.graphql … print-schema C:/…/module-D13/kernel.printed.graphql
wrote …\kernel.printed.graphql (326571 chars) in 1s            exit 0
```

No errors or warnings. Source confirmation (the printer does not name its SDL): every output is 0.33–0.42 MB, not the ~55 MB pinned fallback, and `compile.printed.graphql` contains the final-only edits:

```
$ grep -c "RegulatoryPathway" compile.printed.graphql                       -> 13
$ grep -c "A curated frontier milestone only" compile.printed.graphql       -> 1
$ grep -c "ApprovalPathway\|DesignationType" compile.printed.graphql        -> 0
$ awk '/^enum EventRole/,…' | grep -c "AUTHOR\|PUBLISHER"                   -> 0
$ grep -n "approvalPathway" compile.printed.graphql                         -> approvalPathway: RegulatoryPathway; RegulatoryPathwayEnumScalarFilters
$ grep -c "^type Mutation" compile.printed.graphql                          -> 0
```

| build | bytes | lines | `^input` | `^enum` | `^type` |
| --- | ---: | ---: | ---: | ---: | ---: |
| kernel alone | 326,595 | 6,498 | 179 | 35 | — |
| kernel + 4 stubs (+ unused RegulatoryPathway) | 346,865 | 6,838 | 187 | 35 | 117 |
| kernel + stubs + **final D13** | **423,189** | **8,409** | **231** | 44 | 139 |
| kernel + stubs + packet D13 | 421,999 | 8,407 | 232 | 45 | 139 |

(`wc -c`, `wc -l`, `grep -c '^input '`, `grep -c '^enum '`, `grep -c '^type '` on each printed file.)

- **Marginal cost of final D13 over kernel + stubs: +76,324 bytes, +1,571 lines, +44 input types.**
- Over the kernel alone (stubs included in the delta): +96,594 bytes, +1,911 lines, +52 input types.
- Final vs packet D13 on the same kernel + stubs: +1,190 bytes (docstrings for R-44/R-66), −1 input type and −1 enum (two D13 enum filter inputs replaced by one `RegulatoryPathwayEnumScalarFilters`; in the assembled schema D8 pays for that input).

## Registers

- `D13.relationship.yaml`: written by hand from 05. Edits: R-22 (`projectionGate: SUPPORT` on LEADS_TO, RESPONDS_TO; packet text kept as `projectionGateNote`), R-25 (`basisKind: CURATOR_CLASSIFICATION` on ON_FRONTIER), R-44 (INVOLVES: CQ-EV-05 dropped from the Event → Person pair, lesne removed from otherFixtures, `pairFixtures` records that Event → Person has no fixture left), R-66 and R-69 (INVOLVES and DOCUMENTED_BY_RECORD rationale; LEADS_TO rationale), R-92 (FINANCING_AMOUNT + ROUND_TOTAL / REMAINING; DATE_OF_FIRST_SALE, INVESTOR_COUNT added), R-52 (HAS_REVISION_STATUS and RECORDING_OF predicateOnly rows removed), R-07 (`demotionCandidate` on DOCUMENTED_BY_RECORD). Fixtures rewritten to `final/fixtures/D13/<folder>`.
- `D13.node.yaml`: built from 06 by a Python string-replace script (stdin); each replace asserted to match exactly once. Edits: `module: D13`; R-03 `mutations: { graphql: none, executor: … }`; R-66 note on approvalPathway / designationType; R-69 FinancingRound note; R-65 Conference note; EventKind count note (27 → 26, R-44).
- `D13.seams.yaml`: written by hand from 10. `seams` (10) and `predicateSeams` (11) split per R-94; every row `status: accepted` with its ruling (none cut). Added rows: REVISES D3.Publication → D3.Publication (R-44), predicate seams EVENT_ABOUT → D7.Award (R-69), DATE_OF_FIRST_SALE, INVESTOR_COUNT (R-92), AUTHORED_BY (R-44/R-80), HAS_REVISION_STATUS (R-44/R-52/R-21); sharedVocabularies refs point at final/ (R-09), targets @0.2.2 (R-60), new `regulatory-pathways` (consumed from D8, R-66).

```
$ python - <<'EOF' … (D13.node.yaml build) … EOF
ok 4                       # occurrences of "module: D13"
$ python (yaml.safe_load + regex over final/schema/D13.graphql)
node {'nodes': 2, 'deferred': 9, 'mergedInto': 15}
rel {'relationships': 5, 'predicateOnly': 17, 'deferred': 25}
seams {'seams': 10, 'predicateSeams': 11, 'sharedVocabularies': 5}
rel missing [] / node missing [] / seam missing [] / pseam missing []
SDL rel types ['DOCUMENTED_BY_RECORD', 'INVOLVES', 'LEADS_TO', 'ON_FRONTIER', 'RESPONDS_TO'] True   # SDL == register
rel fields/pairs 7          # frontiers, leadsTo, respondsTo, involvedOrganizations, involvedPeople, regulatoryRecords, studies (IN)
node types ['Event', 'Frontier']
predicateOnly & relTypes set()        # R-53
enums ['EventKind', 'EventStatus', 'ReadoutStage', 'EndpointStatement', 'DiscontinuationScope', 'EventRole', 'FrontierGranularity', 'FrontierCurationStatus']
unions []
$ wc -c -l final/_work/registers/D13.*.yaml
  126 / 10,628  D13.node.yaml;  278 / 23,682  D13.relationship.yaml;  277 / 16,006  D13.seams.yaml
```

## Module numbers

2 node types, 5 relationship types, 7 from→to pairs (collapsed = expanded: no interface or union targets), 0 unions, 1 edge-property type, 8 enums.

## Not applied here (other files or stages)

- R-21, R-35, R-44 fixture edits (lesne a09–a11 → REVISES, drop INVOLVES PUBLISHER/AUTHOR rows, a10/a11 and bioage `derivedFrom=` → DERIVED_FROM, contentHashBasis NORMALIZED_TEXT → CANONICAL_PROJECTION): fixtures stage.
- R-21 Q-D13-22 pattern, R-94 03 line ~188, R-44/R-66/R-69 text in 09-reasoning: patterns and reasoning are not final-module files.
- R-66 vocab-frontiers `breakthroughCriteria` remap to RegulatoryPathway: vocabularies stage (recorded in D13.seams.yaml sharedVocabularies).

## Open issues for the coordinator

1. R-06: INVOLVES Event → D7.Person has no fixture after R-44 (its only rows were lesne AUTHOR roles). R-81 names INVOLVES {PRESENTER} (deciding CQ-CL-05, v1, a D7/D9 question); D13's own questions on the pair are Q-D13-14 (v2) and Q-D13-25 (v3). Needs a numbered request in final/requests.md or a cut to a predicate.
2. R-02: the packet's 23 L3 directives are kept (no ruling removes them); the owner lever decision applies to D13 and D3/D8/D11 alike.
