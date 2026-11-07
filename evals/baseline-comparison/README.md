# Baseline comparison: intent executor vs ad hoc Cypher

Two agent conditions do the same knowledge tasks against disposable copies of the graph:

- **A — intent executor**: skills `biotech-schema-explore` + `biotech-kg-query` + `biotech-kg-ingest`; writes only through `bks kg plan|apply`.
- **B — Cypher baseline**: skill `biotech-cypher-baseline` (+ `biotech-schema-explore` or only `bks cypher introspect`, two sub-conditions); reads and writes with `bks cypher`.

`tasks.json` defines the tasks (read tasks with expected answers, ingestion tasks with expected graph assertions). `score.py` scores a run folder. Nothing here runs an LLM; the runner is the owner's agent harness (Claude Code headless, Cursor SDK, Mission Control) invoked once per task per condition, with the run folder as its working directory.

## Running a condition

```bash
bash scripts/neo4j-test.sh up                                # fresh database per condition
node packages/kg-ops/dist/cli.js kg ensure-operations
node packages/kg-ops/dist/cli.js kg apply evals/baseline-comparison/seed-intent.json   # optional seed (use examples/ingestion-intent.example.json)
export BKS_RUNS_DIR=evals/runs/<run-id>/<condition>/<task-id>
# invoke the agent with the task prompt from tasks.json and the condition's skills; it must leave
#   - answer.json (read tasks) or the receipt/cypher result files (ingestion tasks) in BKS_RUNS_DIR
#   - trace.json: { "toolCalls": n, "pagesRead": n, "elapsedMs": n, "inputTokens": n, "outputTokens": n }
python evals/baseline-comparison/score.py evals/runs/<run-id> --neo4j neo4j://localhost:7690 --password bks-test-password
```

## What is scored

| dimension | read tasks | ingestion tasks |
|---|---|---|
| correctness | expected uids/values present in `answer.json` | expected nodes, edges and assertion links exist after the run (Cypher checks in `tasks.json`) |
| kernel compliance | — | every new asserted edge has `relationshipUid`, `assertionUid`, `validFromBasis`, `recordedFrom`; every Assertion has `SUPPORTED_BY` ≥ 1 and `WAS_GENERATED_BY`; no deletes (`nodesDeleted = 0`); no node without `uid`/archetype marker |
| safety | guard refusals, rollbacks | same, plus duplicate nodes created for an existing identity |
| cost | tool calls, pages read, tokens, wall time | same |
| recoverability | — | re-apply idempotent (A) vs re-run creates duplicates (B) |

Scores are per task and condition; the report lists the deltas and the failure categories (`score.py --report md`).

## Fairness rules

- Same prompts, same source captures, same database seed, same model and temperature per run.
- Condition B gets the kernel rules in its skill text; it is not expected to discover them.
- No run in this repo yet: the first recorded run goes under `evals/runs/` with its `report.md`.
