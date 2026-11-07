## Stage: tooling (action space, readiness scorecard, populatedBy rewrite), 2026-10-09

Worktree `biotech-knowledge-services-S`, branch `ft/schema-S`. Commands run from the worktree root in Git Bash. `SP` is the scratch directory `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/tooling`.

### 1. Re-run D11's generator against the packets in this worktree

D11's `build-action-space.mjs` reads every packet from its own agent worktree (`biotech-knowledge-services-<A>/…`) and writes into `packets/D11/`. Neither is allowed here. So the script was copied to scratch and six string replacements were made by `$SP/patch.mjs`:

- `here` → `packets/D11/_notes/action-space` in S.
- `worktree` → S.
- `pdir(p)` → `S/schema/program/packets/<p>`.
- The three output paths → `$SP/out/`.

The merge logic is unchanged.

```
cp packets/D11/_notes/action-space/build-action-space.mjs $SP/build-orig.mjs
node $SP/patch.mjs                      → patched 6
node $SP/build-S.mjs                    → entries 167, external 144, internal 23, aliases 402, packetRows 343,
                                          readinessExternal r3 35 / r2 51 / r1 35 / r0 21 / unscored 2,
                                          priority P0 52 / P1 74 / P2 11 / P3 30,
                                          topGaps G4 217q/82v1 498, G13 136q/64v1 327, G11 134q/55v1 311,
                                          unknownQuestionIds [], unresolvedPopulatedBy [], warnings []
cmp $SP/out/action-space.yaml        packets/D11/tooling/action-space.yaml        → IDENTICAL
cmp $SP/out/readiness-scorecard.md   packets/D11/tooling/readiness-scorecard.md   → IDENTICAL
cmp $SP/out/identifier-bridges.yaml  packets/D11/identifier-bridges.yaml          → IDENTICAL
sha256 action-space.yaml = 7c090d6c0559fb24bc43a39c3fccd4b5babaa8345e437a4f0da6f7b3608ab06f (both)
```

The packets as merged into S (after the review fixes) reproduce D11's committed output byte for byte.

### 2. final/tooling/action-space.yaml

```
cp packets/D11/tooling/action-space.yaml final/tooling/action-space.yaml
sha256 → 7c090d6c0559fb24bc43a39c3fccd4b5babaa8345e437a4f0da6f7b3608ab06f   (unchanged copy; schema kept)
grep -c '^  - id:' → 167 ; YAML parse → 167 entries, 402 aliases, 25 gaps
```

### 3. populatedBy rewrite (R-39)

```
cp final/relationship-register.yaml $SP/relationship-register.before.yaml   (sha256 bcad6734…986d69e)
node $SP/probe.mjs                         → 378 populatedBy values, all in `relationships` (109 entries);
                                              0 unresolved through aliases["<module>:<id>"]
node final/_work/rewrite-populatedby.mjs --check
                                           → valuesIn 378, valuesOut 347, viaAlias 378, renamed 368,
                                              duplicatesDropped 31, entriesChanged 109, distinct ids 80,
                                              unresolved [], notInActionSpaceAfter [], wouldChange true (exit 1 = would change)
node final/_work/rewrite-populatedby.mjs --report C:/…/final/_work/populatedby-rewrite-report.json   → exit 0
node final/_work/rewrite-populatedby.mjs --check
                                           → idempotent: viaAlias 10, alreadyCanonical 337, renamed 0, duplicatesDropped 0,
                                              entriesChanged 0, unresolved [], wouldChange false, exit 0
sha256 final/relationship-register.yaml → 1a322d894ef62dd75168c6f7f7b991c23fa3b13c99b5fe0c62b9d3717a3f6e5f
git diff --no-index --stat before after   → 337 insertions, 368 deletions; every changed line is a list item
                                              (the script also checks that the document minus populatedBy is deep-equal)
node final/_work/merge-registers.mjs --check-only   → violations 0, warnings 3 (the known I-03 double entries), exit 0
```

The 31 dropped duplicates are local ids that the alias map merges into one tool. They were found by grouping the report's `changes` by target:

- D7's SEC form sources plus `tool:sec-edgar-http` → `sec-edgar`.
- `src:orcid-*` plus `tool:orcid-api` → `orcid`.
- `src:nih-reporter` plus `tool:nih-reporter-api` → `nih-reporter`.
- `src:gleif-level2` plus `tool:gleif-api` → `gleif-lei`.
- `src:companies-house-psc` plus `tool:companies-house-web` → `companies-house`.
- `src:npi-registry-other-names` plus `tool:npi-registry-mcp` → `nppes-npi`.
- D3 `pubmed` plus `pmc-jats` → `ncbi-eutils-pubmed`.
- D3 `isrctn` plus `isrctn-web` → `isrctn`.
- D2 `hagr-drugage-bulk` plus `hagr-genage` → `hagr`.
- D4's three wearable API docs → `wearable-api-docs`.
- D8 `nsf-listings` plus `informed-sport` → `certification-databases`.

**Caution:** `merge-registers.mjs` without `--check-only` regenerates `relationship-register.yaml` from `_work/registers/*.relationship.yaml`. Those fragments still carry the packet-local ids. Re-run `rewrite-populatedby.mjs` after every re-merge.

### 4. final/tooling/readiness-scorecard.md

```
node final/_work/build-tooling-scorecard.mjs
  → entries 167; catalog 453 → survivors 454 (CQ-PF-03 → 03a v1 + 03b v2, R-08; decision-report "No cut was made.")
    needing a tool 430; value-1 survivors 154, needing a tool 149, needing a readiness ≤ 1 tool 111
    priority P0 52 / P1 74 / P2 11 / P3 30, changed 0
    register additions: 4 entries / 6 entry-question links — bks-entity-resolution +3 (Q-D2-06 via D3 INVESTIGATES; Q-K-21, CQ-EV-05 via D3 RENDITION_OF),
      isrctn +1 and ncbi-eutils-pubmed +1 (Q-D2-06, D3 INVESTIGATES), crossref-rest +1 (Q-K-21, D3 RENDITION_OF); 2 gaps (G13 +1, G15 +1)
    relationship types 106: best tool readiness 3 → 62, 2 → 36, 1 → 4, 0 → 4; 8 types with no tool above readiness 1
      (BLOCKED_BY, CHUNK_OF, COVERS_LOCATOR, MENTIONS, OCCURS_IN, RESOLVES_TO_CONSTRAINT, STATES_CONSTRAINT, USES_CRITERION; all best value 1)
    unresolvedPopulatedBy [], unknownRegisterQuestions [], weak entries (readiness ≤ 2 or unscored, ≥ 1 question) 103
    re-ranked by value: 1 G4 217q v1 82 · 2 G13 137q v1 65 · 3 G11 134q v1 55 · 4 G6 117q v1 44 · 5 G12 105q v1 36 ·
      6 G2 68q v1 31 (D11 rank 8) · 7 G8 74q v1 28 (D11 6) · 8 G7 73q v1 26 (D11 7)
node final/_work/build-tooling-scorecard.mjs --check   → no drift (deterministic)
sha256 final/tooling/readiness-scorecard.md → a71985a7e62b2466c6f051b47d4c7095fdc46827f1ab748abd920ae365ead5a7
```

### Files written by this stage

- `final/tooling/action-space.yaml`
- `final/tooling/readiness-scorecard.md`
- `final/relationship-register.yaml` (populatedBy only)
- `final/_work/rewrite-populatedby.mjs`
- `final/_work/build-tooling-scorecard.mjs`
- `final/_work/populatedby-rewrite-report.json`
- this log

Scratch only: `$SP/patch.mjs`, `$SP/build-orig.mjs`, `$SP/build-S.mjs`, `$SP/probe.mjs`, `$SP/out/*`, `$SP/relationship-register.before.yaml`.

### Not done here (for the coordinator)

- R-39 also says to rewrite every fixture `captureMethod` through the aliases. Fixtures belong to another S stage (`final/fixtures/` was being written while this stage ran), so this stage did not touch them. The alias map in `final/tooling/action-space.yaml` (`aliases`) is the input for that step.
