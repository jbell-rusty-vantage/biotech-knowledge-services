# Handoff to biotech-meta: schema candidate v2 as the next ontology-lab run

Written by the S team's open-questions stage, 2026-10-09. This file says how the fast-track synthesis becomes the next ontology-lab run in `biotech-meta/docs/schema`, and how this repository re-pins once the owner accepts it. Nothing was written to biotech-meta by this stage. The candidate is a **proposal**: it is not accepted until the owner decides the open owner decisions and accepts it on measurements and fixtures (00-DIRECTIVE section 5).

Paths without a prefix are relative to `schema/program/` in this repository (the convention `decision-report.md` uses). biotech-meta paths are relative to `biotech-meta/docs/schema/`.

## 1. What biotech-meta receives

| item | value | source |
| --- | --- | --- |
| Assembled SDL | `final/schema/final_biotech_schema_v2.graphql`, 387,615 B, sha256 `c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793` (after the fix stage added the R-49 cache properties; was 385,018 B, `d233930272c7…d705`) | `sha256sum`, `wc -c` (`_runlog/fix.md`) |
| Modules | kernel K plus D1–D13, one fragment banner each; module SDLs in `final/schema/` | `final/schema/` |
| Size against budget | 69 node types (≤ 90), 106 relationship types (≤ 160), **848 expanded pairs (≤ 600: over by 248 on the directive's metric)**, 181 collapsed pairs (within ≤ 600 only if the owner adopts R-01 A), widest union 5 (≤ 6), 960 input types (≤ 4,000), 1,743,672 B printed (≤ 6 MB), in-process build 1.46 s (< 5 s; deployed recipe wall time 4.98 s), medians of 3 | `final/size-report.md` |
| Against the pinned proposal | 192 node types, 393 relationship types, 3,883 collapsed / 3,940 expanded pairs, 38,034 input types, 57,908,325 B, 24.65 s in-process build (median of 3), re-measured the same way | `final/size-report.md` |
| Rulings | 94 merge rulings (R-01 to R-94), 3 integration rulings (I-01 to I-03), 4 owner-decision rulings from the fix stage (R-95 to R-98) and 7 fix-stage rulings (F-01 to F-07); 13 rulings need the owner | `final/decision-report.md` |
| Open items | every packet's open questions merged and de-duplicated, with owner, evidence, status and computed priority | `final/open-questions.md` |

The other deliverables of `fast-track/03-SYNTHESIS.md` are written by sibling S stages under `final/`; at the time of writing, `00-SUMMARY.md`, `migration-notes.md`, `requests.md` and `RUNLOG.md` were not yet on disk (`ls final/`, `_runlog/openq.md`). Since then, `migration-notes.md` and `requests.md` (written by the fix stage) are on disk; `00-SUMMARY.md` and `RUNLOG.md` are the finalizer's. The finalizer's file list wins over this paragraph.

## 2. Conventions matched

Read in biotech-meta before writing this: `ontology-lab/README.md` (roles, round protocol, promotion gates 1–10, artifacts per round), `ontology-lab/proposal-index.md` (the 0.2.0 integration record, sections 1–10), `ontology-lab/round-template.md`, `ontology-lab/final-proposal-team/run-2026-10-04-fable51-01/README.md` and its `03-conflict-ledger.md`, `CHANGELOG.md` (the "Unreleased" entry for that run), and `OPEN-QUESTIONS.md` (the "Status after the final schema proposal run" section). The conventions this handoff follows:

- A proposal run is an **immutable run record** directory with a README file table; the standalone SDL is written outside it, next to `final_biotech_schema_proposal.graphql`; nothing replaces the catalog or the live schema.
- The CHANGELOG gets an "Unreleased" entry per run with "Breaking meaning changes", "Added" and "Fixed" lists, each line with its ruling id.
- `OPEN-QUESTIONS.md` gets a status section per run: what the run closed (with the ruling) and the new or sharpened questions with owner and evidence.
- Semantic decisions that are still contested go to **rounds** (`round-NNNN-<slug>.md`, from `round-template.md`): a Builder, a Challenger with a concrete failing case, the recorder's fixtures, and a decision status OPEN, ACCEPTED, REVISED, SPLIT, DEFERRED or REJECTED. Rounds 0001 to 0009 exist; the next free number is 0010.

## 3. Files to copy

Proposed run id: `run-2026-10-08-opus55-01` (the existing id pattern is `run-<start date>-<synthesizer model>-<sequence>`; the fast-track started 2026-10-08). Proposed location: `ontology-lab/schema-program/run-2026-10-08-opus55-01/`, a sibling of `final-proposal-team/`, because this run had its own contract (`fast-track/`), team (A1–A8 and S) and packet format. Placing it under `final-proposal-team/` instead changes only the proposal-index link.

Copy from this repository's commit of `ft/schema-S` (the coordinator commits; take the hash from that commit), keeping the `schema/program/` layout under the run directory so that every `packets/<P>/…` and `final/…` citation in the decision report resolves unchanged:

| source (this repo, `schema/program/`) | target (biotech-meta, `docs/schema/`) | note |
| --- | --- | --- |
| `final/schema/final_biotech_schema_v2.graphql` | `final_biotech_schema_v2.graphql` | New standalone SDL. Keep `final_biotech_schema_proposal.graphql`: it is the current pin source and the "v1" of the migration notes. |
| `final/` (all of it, including `_work/` scripts and `_runlog/`) | `ontology-lab/schema-program/<run>/final/` | 17 MB (`du -sh`). `_work/` holds the scripts that reproduce every count; `_runlog/` is concatenated into `final/RUNLOG.md` by the finalizer. |
| `packets/` (K, D1–D13) | `ontology-lab/schema-program/<run>/packets/` | 15 MB. The research and fixture evidence the rulings cite. |
| `fast-track/` (00-DIRECTIVE, 01-PACKET-CONTRACT, 02-TEAM, 03-SYNTHESIS, KICKOFF, README) and `PLAN.md` | `ontology-lab/schema-program/<run>/` | The run's contract, as `01-shared-contract.md` is for the 2026-10-04 run. |
| `domains/` | `ontology-lab/schema-program/<run>/domains/` | The 14 domain briefs. |
| — | `ontology-lab/schema-program/<run>/README.md` | New, written in biotech-meta: status line, file table (as in the 2026-10-04 run README), the commit hash of this repo it was copied from. |
| `final/vocabularies/` | stays inside the run directory | Becomes catalog content only through rounds (section 5); `catalog/schema.yaml` is not edited by a copy. |
| (none yet) | `neo4j/final_biotech_schema_v2_operations.cypher` | No v2 operations file exists (open-questions FU-07). Copy it when it is written and applied. |

Before copying: grep the fixtures for secrets and personal data (workspace rule: never commit secrets or PHI). The fixtures name public actors only by design (D7 privacy rules, open-questions OD-17), and capture bodies are byte copies of public pages; some captured artifacts referenced by fixtures were kept only in session scratch (open-questions OD-14), so a re-fetch is needed to make every fixture byte-reproducible.

## 4. Text for biotech-meta

### 4.1 proposal-index.md entry

Append as a new section after section 10 (the index is the 0.2.0 integration record; this keeps its numbering):

```markdown
## 11. Proposal runs after 0.2.0

| Run | Contract | Status | Standalone SDL | Record |
|---|---|---|---|---|
| run-2026-10-04-fable51-01 | domain-discovery handoff, 24 packets W00–W23 | Pinned in biotech-knowledge-services (`schema/pinned/PIN.json`, pinnedAt 2026-10-07); not accepted | `../final_biotech_schema_proposal.graphql` | `final-proposal-team/run-2026-10-04-fable51-01/` |
| run-2026-10-08-opus55-01 | schema program fast-track (`schema-program/<run>/fast-track/`), kernel K + domains D1–D13 | PROPOSED: awaiting the owner decisions OD-01 to OD-11, OD-45 and OD-46 (R-95 to R-98), and acceptance on measurements and fixtures | `../final_biotech_schema_v2.graphql` | `schema-program/run-2026-10-08-opus55-01/` |

Candidate v2 against the budget of the schema program's directive (numbers from the run's `final/size-report.md`): 69 node types (≤ 90), 106 relationship types (≤ 160), 848 from→to pairs expanded, the directive's metric, over the ≤ 600 budget by 248 (181 collapsed; adopting the collapsed count is owner decision OD-01), widest union target 5 (≤ 6), 960 executable input types (≤ 4,000), 1,743,672 B printed (≤ 6 MB), 1.46 s in-process build (< 5 s). The 2026-10-04 proposal measured the same way: 192 / 393 / 3,883 collapsed and 3,940 expanded / widest union 144 / 38,034 inputs / 57,908,325 B / 24.65 s.

Start at the run's `final/00-SUMMARY.md`. Merge rulings R-01 to R-94 and their evidence are in `final/decision-report.md`; open items with owner and evidence in `final/open-questions.md`; the v1 → v2 rename and replay tables in `final/migration-notes.md`. Contested semantic decisions are queued as rounds 0010 to 0016 (section 1 of this index gains a row when each round closes).
```

### 4.2 CHANGELOG.md "Unreleased" entry

```markdown
## Unreleased: schema program fast-track run 2026-10-08 (proposal only; live schema and catalog unchanged)

Artifacts: `final_biotech_schema_v2.graphql` (assembled from 14 modules; built and printed with `@neo4j/graphql` 7.6.3 by the run's print-schema; sha256 c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793), run directory `ontology-lab/schema-program/run-2026-10-08-opus55-01/` (14 packets, synthesis deliverables, rulings R-01..R-94). Each line below cites its ruling; the full list is the run's `final/migration-notes.md`.

### Breaking meaning changes (proposal)
- `mongoResearchRunId` → `lastWriterRunId` everywhere; one Activity per Mission Control run (R-13, owner decision pending).
- The pinned citation types DERIVED_FROM_ASSERTION, CONSIDERS_ASSESSMENT, CITES_ASSERTION, CITES_ASSESSMENT become one DERIVED_FROM (R-11).
- `Mention` and `Adjudication.considers` removed; a resolved surface form is a SourceLocator plus a RESOLUTION Assessment (R-09, owner decision pending).
- `StateEpisodeProperties` removed; exclusivity is a register flag (R-10, owner decision pending).
- One (scheme, issuer, normalized value) identifies at most one Subjectable; no joins through a shared Identifier (R-42).
- Retraction status: REVISES when the revising work is identified, HAS_REVISION_STATUS otherwise, never both (R-44).
- No GraphQL mutations (L2) and no aggregate filters on relationships (L1) (R-02, owner ratification pending).
```

(The "Added" and "Fixed" lists are written from `final/migration-notes.md` when it lands; this stage does not restate them.)

### 4.3 OPEN-QUESTIONS.md status section

```markdown
## Status after the schema program fast-track run 2026-10-08

The run's `final/open-questions.md` is the backlog for candidate v2 (owner, evidence, priority computed from question values). Items that touch this file:

- Priority 0, item 1 (variant vs formulation vs package): still OPEN; the run adds D6's five boundary rules and names the missing captures (run open question BM-04; continues round 0001).
- Priority 1, ingredient identity items 1–2, and molecular-weight policy OQ-L3-11: still OPEN; D1's identity-level scale and new-material rule are proposed (BM-01, BM-02); round 0016.
- Priority 1, botanical normalization (item 4) and non-viable microorganisms (item 5): OPEN (BM-03, run MD-D1-02).
- Priority 1, diagnostics (vendor clock vs publication version): OPEN (BM-05); the lab-report coding sample is an owner decision (OD-24).
- Priority 2, protocol stepKey alignment: OPEN (BM-06).
- Closed by run rulings, pending owner acceptance of the candidate: the asserter of a multi-author work and of a document that names nobody (R-15, R-16), PolicyVersion as a string (R-33), no stored RECOMMENDS edge (R-83), no Facility node until a promotion trigger (R-67).
```

## 5. Decisions that need a cooperative-adversarial round

A round is needed where the decision is semantic and the architects disagreed, or where a ruling rests on a fixture the challenger can break. The decision report names the 16 rulings where the chief chose between architect lenses (R-01, R-02, R-23, R-43, R-47, R-49, R-55, R-57, R-68, R-70, R-71, R-73, R-80, R-82, R-86, R-92); the rounds below cover the semantic ones among them plus the open owner decisions that change meaning. **Builder** = the owning module's model as ruled; **Challenger** = the lens the ruling overruled (named in the decision report), who must bring the failing case listed.

| round | title | owning module | decisions (open-questions / decision-report ids) | competency questions | case packet and the challenger's failing case |
| --- | --- | --- | --- | --- | --- |
| 0010 | Kernel evidence chain v2 | K | OD-04 (R-09), OD-05 (R-10 and the exclusivity scope), OD-06 (R-12), OD-07 (R-13), OD-11 (R-14 on state payloads), R-22 and R-23 (projection gate; same-asserter supersession, provenance over coverage), KN-15 (verdict order) | Q-K-01, Q-K-04, Q-K-05, Q-K-07, Q-K-08, Q-K-14, Q-D6-01, Q-D3-04, Q-D5-23, Q-D13-01 | `two-run-lineage` with a run that applies two intents; `label-versions-truniagen-dsld` with parallel episodes from two asserters; `sirolimus-label-interactions-harm` (labeler change inside one SPL set); `aspree-registry-history-harm` per-field locators |
| 0011 | Capture identity, tool renditions and selectors | K with D11 | OD-08 (R-36), R-35, R-37, R-38, OD-14 (durable storage), EX-05 (projection registry), MD-D11-01 (provider caching) | Q-K-10, Q-K-14, Q-D11-05, Q-D11-17 | `resveratrol-retraction-integrity` (notice only reachable as a rendition), EDGAR injected script tag, Wayback capture substitution (`sinclair-recommendation-disclosure-asof`), OpenAlex key re-ordering, WHOOP OpenAPI property order |
| 0012 | Scholarly works: renditions, revisions, authorship | D3 with D9, K | R-43 (provenance over coverage), R-44, R-71 (slim overruled), R-15, R-80, R-42 against shared-identifier joins, FX-10, MD-D5-07 | Q-K-21, Q-K-22, CQ-EV-05, Q-D3-08 | PMC manuscript and PubMed record of one article (`resveratrol-sirt1-evidence-mission`), `lesne-2006-retraction`, `resveratrol-retraction`, PREDIMED |
| 0013 | Outcome, Condition, Metric and Biomarker | D2 with D3, D4, D5 | R-70 (all three lenses disagreed), FX-01, MD-D5-01, MD-D4-01 | Q-D3-04, Q-D3-05, Q-D5-01, Q-D4-17, Q-D4-01 | ASPREE major hemorrhage and incident dementia reaching a Target; `antioxidant-exercise-disconfirmation`; `wearable-hrv-algorithm-changes` (RMSSD vs SDNN) |
| 0014 | Measured content of sold products | D8 with D1, D6, D12 | OD-10 (R-73 contested by a D12 fixture), R-62, R-64 (single CONTAINS as a measured option), FX-02, FX-03, FX-05 | Q-D12-03, Q-D12-06, CQ-PF-03a, CQ-MF-02, Q-D1-09, Q-D1-10 | `acrylamide-fried-potato-harm` acr-03 (survey row, no lot), `eurofins-coa-quantity-by-input`, the melatonin survey (Cohen et al. 2023) |
| 0015 | Derived knowledge: forms and materialization | D10 with D2, D9 | R-47, R-49 and FU-01, R-50, R-51, OD-23 (latency evidence), MD-D2-01 (roll-up rules) | Q-D2-03, Q-D2-06, Q-D2-18, CQ-CL-06, Q-D9-08, CQ-RC-06 | p95 latencies on the assembled fixture graph; NR → Nicotinate metabolism rolled up as MIXED |
| 0016 | Ingredient identity and equivalence | D1 | BM-01, BM-02, BM-03, MD-D1-02 | CQ-ID-06, CQ-ID-01, Q-D1-02, Q-D1-11, Q-D1-12 | a COA pair for one material from two suppliers; food- vs pharmaceutical-grade Niagen specifications; GSRS extract vs plant-part records |

Existing rounds that continue rather than open new ones: round 0001 (product continuity, OPEN) takes BM-04; round 0004 (diagnostic comparability) takes BM-05 and OD-24 as an addendum; ProtocolEdition stepKey alignment (BM-06) attaches to the protocol material of round 0008.

Owner decisions that need **no** round (measurement, policy or access, not semantics): OD-01, OD-02, OD-03 (counting method, levers, directive reading); OD-12 to OD-22 (licences, keys, storage, scraping, registry history, privacy, rights, rating values, tooling governance, GDS); OD-43 and OD-44 (live migration, embedding model). The remaining OD entries are small product choices the owner can take directly from `final/open-questions.md`.

## 6. Re-pin steps for this repository

Re-pin only after the gates in `final/open-questions.md` are closed: the owner decisions OD-01 to OD-11, OD-45 and OD-46, FU-12 (the R-18 pass), the six fixture requests of `final/requests.md` (FU-01 and FU-02 were closed by the fix stage), FU-03 (fixtures lint clean), MD-X-02 (`predicates.yaml`), FU-07 (operations file), FU-08 (validation params), FU-09 (sidecars), TL-02 (print-schema fails fast), OD-43 (live migration) and OD-44 (embedding dimensions). EX-01 with OD-09 (executor and contracts v2) gates the integration tests: the migration stage's planner probe applied 0 of 78 intents against the candidate IR with today's planner (`_runlog/migration.md` section 4).

1. **biotech-meta first.** Land the run (section 3) and record its commit; that commit's SDL path is the new `sourcePath`. Status stays PROPOSED until the owner's acceptance.
2. **Branch here.** Work on a branch from `main`; never edit `packets/` or `final/` of the run.
3. **File names.** The loaders hard-code the pinned file names: `packages/schema-workspace/src/load.ts:26` and `apps/graphql-api/src/server.ts:108` read `final_biotech_schema_proposal.graphql`, and `packages/kg-ops/src/operations.ts:34` reads `operations.cypher` (`grep -n`, `_runlog/openq.md`). Either write the v2 content under those names (PIN.json carries the true source path), or change the three loaders to take the file name from `PIN.json`; the second keeps one place that names the file.
4. **`schema/pinned/` contents.** The v2 SDL; the v2 `operations.cypher` (FU-07) and a decision on the Enterprise companion; a v2 `validation-params.json` (FU-08); a v2 `modules.yaml` for K and D1–D13 (from the module stamps in `final/node-register.yaml`).
5. **`PIN.json`.** Update `pinnedAt`, `sourceRun` (the run id), `catalogVersion` (owner's choice; the catalog stays 0.2.0 until rounds change it), and for every file `sourcePath`, `sha256` and `bytes` computed with `sha256sum` and `wc -c` on the copied files. Today's SDL: sha256 `c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793`, 387,615 B (FU-01 landed in the fix stage).
6. **Sidecars.** Re-key `schema/sidecars/*.yaml` (domains, identity-rules, ingestion-rules, task-routes, terminology) to v2 names using the rename tables in `final/migration-notes.md`; the migration stage measured 264 sidecar errors against the v2 IR (FU-09).
7. **Build and workspace.** `pnpm install && pnpm build`; `pnpm workspace:build` (writes `workspace/` with the schema digest and fingerprint); `pnpm workspace:verify` (must exit 0); `pnpm schema:map` and compare it with `final/schema-map.md`.
8. **Print check.** With `BKS_SCHEMA_PATH` unset: `NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <C:/ absolute out>`. The log must name `schema/pinned/…` and the output must be about 1.7 MB (`final/size-report.md`: 1,743,672 B after FU-01), not the 55–58 MB of the v1 pin.
9. **Tests.** `pnpm test`; `pnpm neo4j:test:up`; `node packages/kg-ops/dist/cli.js kg ensure-operations`; `pnpm test:integration`. Then plan every re-pathed fixture intent (`final/fixtures/*/*/intent*.json`) with `kg plan` and record applicable / rejected counts against the migration stage's probe.
10. **Repo consumers.** The migration stage found files naming v1-only types or fields in evals (2), examples (1), `biotech-*` agent skills (4), python (1), the GraphQL API (1), the executor app (1), kg-ops (4), contracts (5) and the sidecars (3) (`_runlog/migration.md` section 5). In particular `evals/baseline-comparison/tasks.json` checks `SUPPORTED_BY` (lines 46, 56) and `entityType` (line 64) (`grep -n`, `_runlog/openq.md`); v2 writes HAS_EVIDENCE and has no `entityType` marker, so those checks must be ported or every v2 ingestion task fails kernel compliance by construction.
11. **Deploy the GraphQL API.** `bash scripts/fly.sh deploy . --config apps/graphql-api/fly.toml --dockerfile apps/graphql-api/Dockerfile --remote-only` (usage line in `scripts/fly.sh`); the Dockerfile copies `schema/pinned` into the image (lines 15 and 27). The deployed database holds data written under v1 names: the live migration (OD-43, `final/migration-notes.md`) and `kg ensure-operations` against it are writes that need the owner's approval first. The machine size was chosen for the v1 executable; re-measure heap on v2 before changing it.
12. **Evals, old vs new.** Follow `evals/baseline-comparison/README.md`: a fresh database per condition (`bash scripts/neo4j-test.sh up`), `kg ensure-operations`, conditions A (intent executor) and B (Cypher baseline), same prompts, captures, seed, model and temperature; score with `python evals/baseline-comparison/score.py evals/runs/<run-id> --neo4j neo4j://localhost:7690 --password <test password> --report md`. Run it once on the v1 pin (a worktree at the pre-re-pin commit) and once on v2, under `evals/runs/<run-id>/`. The README says no run exists yet, so the v1 run is also the first baseline.
13. **Acceptance record.** The owner accepts or rejects on: the two eval reports, the re-measured size report, the fixture plan and replay counts, and the closed gates. Only then does biotech-meta's run status change from PROPOSED, the CHANGELOG entry move out of "Unreleased", and `PIN.json` point at v2 on `main`.
