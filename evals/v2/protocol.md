# v2 evaluation protocol (frozen 2026-10-11)

Frozen task suites for the Biotech schema v2 release. No LLM run has happened; this file fixes how runs are made and
scored so results are comparable. Budgets and gates come from IMPLEMENTATION.md section 3 and KICKOFF Gates B, C, E, F;
nothing here weakens them.

## 1. Suites

| Suite | Tasks | Composition | Gold source |
| --- | ---: | --- | --- |
| `schema-discovery/` | 68 | all 14 modules (K, D1-D13; 4-7 each); 24 exact, 20 paraphrase, 14 negative, 10 cross-domain | node/relationship registers, predicate vocabulary, candidate SDL |
| `native-read/` | 33 | 14 trace, 4 history, 7 identifier resolution, 3 status/negative, 5 migration-rehearsal | release fixtures (`schema/program/final/fixtures`), INTERFACES.md read statuses, migration manifest (run-time) |
| `write-recovery/` | 33 | 31 critical; every Gate B/E provenance, admission and recovery case plus Gate F migration cases | INTERFACES.md section 5 (error codes, receipt outcomes, read statuses), migration run reports (run-time) |

Files per suite: `tasks.json` (prompt-visible), `gold-spec.json` (selectors), `gold.json` (derived values). `FREEZE.json`
records sha256 of every task/gold file and of each source. Rebuild and check:

```bash
node evals/v2/build-tasks.mjs --check     # task files equal a fresh deterministic build
node evals/v2/derive-gold.mjs --check     # gold re-derives byte-identically from the sources
node evals/v2/od35/build-frame.mjs --check
node evals/v2/score.mjs --self-test       # SYNTHETIC arms only: proves scorer and gate logic
```

A source change (registers, SDL, fixtures, INTERFACES) makes `derive-gold --check` fail; re-freeze deliberately and
record the new FREEZE.json with the release, never silently.

## 2. Blinding

- The agent workspace for a run is a copy of the repository **without `evals/`** (and without `runs/`). The runner
  passes only `tasks[i].prompt` and `answerShape`. `gold-spec.json` and `gold.json` are never mounted.
- Paraphrase prompts are checked mechanically: a paraphrase prompt that names its gold type/relationship fails
  `derive-gold`.
- Gold is never typed by hand: every value resolves from an accepted source or the run's own migration manifest.

## 3. Release binding

Prompts carry placeholders bound once per run in `bindings.json`: `RELEASE_ID`, `SCHEMA_RELEASE_DIGEST`,
`WORKSPACE_FINGERPRINT`, `QUERY_CATALOG_DIGEST`, `EXECUTOR_VERSION`, `SKILL_BUNDLE_VERSION`, `MIGRATION_RUN_ID`,
`SEMANTIC_GENERATION_ID`, `FIXTURE_GRAPH_ID`, `EXPORT_ID`. Every schema citation must carry the bound
`SCHEMA_RELEASE_DIGEST` (pin-valid citation gate). Card ids are normalized by the runner adapter to `<kind>:<Name>`
(`node:`, `relationship:`, `predicate:`, `enum:`) from the S2 workspace manifest before scoring.

## 4. Arms and pairing

Every comparison is paired: same tasks in the same seeded order, same model id and settings (temperature, max tokens,
tool budget, wall-clock budget), same data (fixture graph or migration rehearsal graph restored from the same export),
same release bindings. One fresh disposable database per arm for write suites.

| Family | Arms | Question |
| --- | --- | --- |
| A. discovery route | A1 filesystem-only (`rg`/`ls`/`cat` over `workspace/`), A2 structured CLI (`bks-schema search --mode structured`: lexical search top-10, then bounded deterministic `path` expansion between the top node hits, capped at 10 candidates in total), A3 hybrid (lexical + OpenAI semantic, rehydrated from the local pin) | does hybrid earn default routing? (IMPLEMENTATION section 3 lists exactly these three arms) |
| B. read route | B1 typed operations and templates only, B2 typed + native Cypher read artifacts | do native reads add success without safety loss? |
| C. skill enrichment | C1 first-party skills only, C2 first-party + vendored Neo4j skills per `skill-routing.json` (overrides loaded first), C0 `biotech-cypher-baseline` (disposable raw-write comparison only) | does targeted vendor enrichment help? |

Run each suite once per arm with seed 20261011 for task order; repeat with three seeds when a gate is within its CI.
Record per task `answer.json` and `trace.json` (`toolCalls`, `inputTokens`, `outputTokens`, `elapsedMs`, `paidUsd`).

## 5. Scoring

`node evals/v2/score.mjs --run <runDir> --bindings bindings.json [--manifest <migration-manifest.json>] --report md`

- Per arm and suite: success with bootstrap 95% CI (percentile, 10,000 resamples, seeded), discovery Recall@10 and
  paraphrase Recall@10 with CIs, pin-valid citation rate, critical failures, per-module failures, median tokens, p95
  latency, paid usage.
- **Recall@10 is computed over the 10-candidate discovery result of each arm**: the arm's ranked candidate list
  (`hits`, at most 10 normalized card ids; for A2 this is the structured result after path expansion, never more than
  10) scores 1 when it contains at least one gold card of the task (for cross-domain tasks the gold is the card set of
  the gold path's relationship hops). Card sets are derived from the release registers by `derive-gold.mjs`.
- Task-design notes (`check-path-reachability.mjs`, 2026-10-12, release v2.0.1; gold unchanged): every cross-domain gold
  hop is a legal register relationship. In the frozen suite, SD-X-01 needs 5 hops (beyond a 3-hop expansion budget) and
  SD-X-08 is a fan-out from one type rather than a chain. Cross-domain endpoint pairs generally have several other legal
  short paths, so exact-path answers are compared with the gold path while Recall@10 is card-based. Results for the
  blinded certification set are kept in custody only (`runs/release-v2/custody/.../wave3/path-reachability-*.json`).
- Paired: success difference and paraphrase Recall@10 difference with bootstrap CIs; median discovery token change.
- A missing answer is a failure. An `unsupported` or `failed` status is never scored as `empty`.

## 6. Gates (binding)

| Gate | Threshold |
| --- | --- |
| pin-valid citations and exact-ID lookups | 100% |
| critical provenance / admission / recovery tasks | zero failures (any arm proposed for release) |
| authority or invariant bypass, lost provenance, unexplained identity duplication | zero |
| discovery Recall@10 on supported tasks | >= 0.95 |
| end-to-end supported-task success | >= 0.90 |
| hybrid as default | paraphrase Recall@10 +5 pp, or median discovery tokens -15%, without success regression; else keep lexical default and qualify semantic-on-demand |

Averages never waive a hard gate; per-domain failures are reported. Report paid usage and p95; do not claim semantic
retrieval is always faster.

## 7. Migration-bound tasks

`NR-M-*`, `WR-29`, `WR-30`, `WR-33` run on the restored rehearsal graph of `${EXPORT_ID}` with migration run
`${MIGRATION_RUN_ID}`; their gold pointers resolve in that run's `migration-manifest.json` (custody). They are scored only
with `--manifest`.

## 8. OD-35 review set

Specified in [od35-review-set.md](od35-review-set.md); frame and seeded draw in `od35/`.

## 9. Recorded deviations

**DEV-1: seeded native-read gold.** Authorized by the lead on 2026-10-12. Recorded in `FREEZE.json` under `deviations`.

- **Reason.** `native-read/gold.json` resolves from the v1 run-record fixtures (`schema/program/final/fixtures/*/assertions.yaml`). The arms read a different graph: the fixture round `fixtures-v2/ROUND.json`, seeded through the executor (plan, admit, apply). There, 19 plans were held, 58 applied only their admitted subset, and the writer mints uids from `uidSegment` (for example `hu:org:` where v1 has `hu:organization:`). Twenty gold facts were never written, and some uids differ in prefix. Scored against `gold.json`, an arm is measured on the environment, not on the skills.
- **Rule.**
  - `derive-gold-seeded.mjs` re-derives the gold mechanically from the seeded environment's own plans and receipts, plus the fixtures-v2 intents they were compiled from. It never reads an arm's answers.
  - A trace task is matched by predicate and by the uid segment of its subject and object. Its gold is positive only when a receipt applied the matching proposal and created its assertion.
  - A resolve task is positive only when a receipt created the prompt's identifier on the node.
  - Every fact that was never applied gets a **negative** expectation, `{status: "empty"}`, so a truthful "absent" answer scores.
  - Status, literal and migration-pointer tasks are unchanged.
  - `gold.json` stays unchanged for the record. The re-derived gold is `native-read/gold.seeded.json`, with its derivation log `gold.seeded.derivation-log.json`.
- **Adapter.** One structural adapter is applied to every arm: `score.mjs --adapter trace-evidence` fills `trace.snapshotContentHashes` from `trace.evidence[].snapshotContentHash` when the flat list is absent. The task `answerShape` does not name the field.
- **Pairing precondition.** Both arms must have read the same seeded graph. `derive-gold-seeded.mjs --compare <A> <B>` checks receipt counts, created node and relationship sets, and per-proposal outcomes. If they differ, each arm is scored against gold seeded from its own run.
- **Freeze.** The seeded gold was frozen before any condition-B answer existed.
- **Scoring command.** `node evals/v2/score.mjs --run <runDir> --bindings <bindings.json> --manifest <migration-manifest.json> --gold native-read=gold.seeded.json --adapter trace-evidence`.
- **Migration-bound tasks** (`NR-M-*`, section 7) are scored only from a pass that ran on the migrated rehearsal graph. In a fixture-graph pass they are reported, not counted.

## 10. Write-recovery pass: environment and scoring rules

These rules were declared before either arm ran the write pass. The lead decided them on 2026-10-12, and they are recorded in `FREEZE.json` as `deviations[DEV-2]`.

**Fixture environment, per arm (WR-01..28, WR-31, WR-32).**
- Each arm gets one fresh disposable database.
- It is seeded by `evals/v2/write-recovery/seed-write-pass.mjs --arm A|B`, using the fixture round in ROUND order **minus** `evals/v2/write-recovery/write-seed-exclusions.json`.
- The exclusion is exactly `schema/program/final/fixtures-v2/D4/hba1c-two-labs-interference/intent.json` (`ft-d4-a1c-2026-10-08`, round index 36). That fixture holds the Labcorp HbA1c MEASURES_METRIC that WR-01 re-submits and WR-21 wraps.
- No other round intent depends on it: the shared subjects `labcorp` and `bks-curation-d4` are created with `onMatch: use_existing` elsewhere.
- The seed script checks the ROUND and exclusion digests, and stops if the database is not fresh.

**Pairing precondition.** Before pairing, `node evals/v2/derive-gold-seeded.mjs --compare <armA run> <armB run>` must report identical seeded graphs: the same receipt counts, created node and relationship sets, and per-proposal outcomes. If they differ, each arm is scored alone and the difference is reported.

**Migration-bound tasks (WR-29, WR-30, WR-33).** These use one per-arm shadow, `scripts/migration/eval-migration-shadow.sh`, with container `bks-neo4j-migwrite`, strictly A then B and one container at a time.
- `up <arm>` creates an empty target and `target.env`. WR-29 restores and verifies into it; WR-30 dry-runs `${MIGRATION_RUN_ID}` on the restored copy.
- `migrate <arm>` applies the migration.
- `executor <arm>` starts a writer executor on :4151 for WR-33.
- `down` resets the shadow before the next arm.
- Per-arm bindings are in `runs/release-v2/eval-runs/migwrite-<arm>/bindings.json`, with `MIGRATION_RUN_ID=mig-0b2e97d4b8e0` and `EXPORT_ID=20261011T224403Z-aura-neo4j`.

**Scoring.**
- Command: `node evals/v2/score.mjs --run <runDir> --bindings <bindings.json> --manifest <exp>/plans/mig-0b2e97d4b8e0/migration-manifest.json --report md`.
- Gold: the frozen `write-recovery/gold.json`, unchanged. No seeded variant applies to this suite.
- No adapter is declared. An adapter found necessary later must be structural only, applied to both arms, and recorded in `FREEZE.json` before either arm is scored with it.

**Duplicate rule.**
- WR-01 / WR-21: the fact is not pre-seeded, so gold `applied` stands, and a `duplicate` answer is a **failure**.
- WR-07 (same effectKey, identical bytes) and WR-14 (lost response): `duplicate` and receipt lookup are the correct recovery behaviour, as their gold already states.
- WR-08: a changed payload under the same key is `BKS_EFFECT_CONFLICT`.

**Gates.** Critical tasks (`critical: true`) are gates: zero critical failures. End-to-end success has a bootstrap 95% CI, seed 20261011. Write tasks have no recall gate.

**Answers are never edited.** A missing `answer.json` is a failure. Answers are scored from a custody copy of the run's artifacts, with sha256 recorded.

**Machine-readable form.** `evals/v2/write-recovery/scoring-rules.json` holds the per-task environment, gold kind, critical flag, invariant keys and duplicate rule, plus the input digests. Under DEV-3 (section 11, in force), the answer contract is given to both arms identically.

## 11. Answer shapes: the field-naming defect and the next-round contract

**Defect (recorded 2026-10-12, S8).** `answerShape` strings name containers but not the fields the scorer reads:
- `trace{}` in native-read, `invariants{}` in write-recovery.
- The NR-M tasks (counts and values) use the generic trace shape.

The effect in this round:
- Arm B2 put snapshot hashes under `assertions[].locators[]` instead of `trace{}` and lost five tasks on shape.
- The NR-M answers were unscorable by `score.mjs`, which led to rubric DEV-1b.
- Seventeen write-recovery tasks are scored on invariant keys that no prompt names.

The frozen task files of this round are **not** changed. The fields below are the shapes for the next round; `derive-gold.mjs` and `score.mjs` read exactly these paths.

| Suite / kind | Required fields (JSON paths in `answer.json`) |
| --- | --- |
| native-read, trace (`NR-T-*`) | `status`; `uids.start`, `uids.assertion`, `uids.object`, `uids.asserter`; `trace.snapshotContentHashes[]` (every snapshot behind the cited evidence); optional `trace.evidence[]` with `{locatorUid, snapshotContentHash, quoteHash}`; `queryDigest`, `resultDigest` |
| native-read, resolve (`NR-R-*`) | `status`; `uids.node`; `basis` (`uid` / `identifier` / `name`) |
| native-read, status (`NR-S-*`) | `status` (the service's read status, verbatim) |
| native-read, migration (`NR-M-*`) | `status`; `value` (the asked count, or the asked scalar); `valueStatus` (the record status asked about, e.g. EXTRACTED); `sourceKind` and `snapshotContentHash` where asked; `reason` (free text) |
| write-recovery, single | one of `outcome` / `error` / `status` (whichever the service returned; `error` is the `BKS_*` code); `markerStatus` where asked; `outcomes[]` for concurrent tasks; `invariants{key: true|false}` with the keys listed per task; `receiptIds[]`, `effectKey` |
| write-recovery, sequence | `sequence[]`, one object per step in the order the prompt names, each in the single form |

**Next-round changes.**
- Every `answerShape` string lists these paths.
- Every task that is scored on invariants lists its keys, each with a neutral yes/no question (the form of `write-recovery/answer-contract.json`).
- `answerShape` text is part of the frozen task digest.

**DEV-3 (in force for the current write pass; approved by the lead 2026-10-12).** The write-pass runners read only `tasks.json` and `answer-contract.json`. `build-answer-contract.mjs --check` fails (exit 3) if any gold value other than an invariant key appears in the contract: outcomes, error codes, statuses, marker states, deferred sources, numbers. Entries contain no uids, digests, counts or outcomes. Runners hand `write-recovery/answer-contract.json[taskId]` to the agent next to `prompt` and `answerShape`, identically for every arm. The contract is generated mechanically from `gold.json` by `build-answer-contract.mjs` (with `--check`). It never reveals an expected value:
- every task lists `outcome | error | status` as "fill whichever the service returned";
- invariants are asked as yes/no questions keyed exactly as the scorer reads them.

Without it, a correct agent fails 17 of 33 tasks on shape, and the zero-critical-failures gate fails in both arms (31 tasks are critical). The task files and gold stay unchanged either way.
