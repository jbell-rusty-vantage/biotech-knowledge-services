"""Score a baseline-comparison run folder.

Usage:
    python evals/baseline-comparison/score.py <run-dir> --neo4j neo4j://localhost:7690 --password ... [--report md]

Layout expected under <run-dir>/<condition>/<task-id>/:
    answer.json            read tasks: the agent's answer
    trace.json             { toolCalls, pagesRead, elapsedMs, inputTokens, outputTokens }
    *-receipt-*.json       ingestion tasks (condition A): executor receipts
    *cypher*.json          ingestion tasks (condition B): guard results (ok, counters, rolledBackReason)

Graph checks run against the database the condition used (one database per condition; pass --neo4j per invocation
or a <condition>=<uri> mapping with --neo4j-map). Requires `pip install neo4j` (or `uv run --with neo4j`).
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
TASKS = json.loads((HERE / "tasks.json").read_text(encoding="utf-8"))


def compare(expected: str, actual: object) -> bool:
    if isinstance(expected, str) and expected[:2] in (">=", "<=", "!="):
        op, value = expected[:2], float(expected[2:])
        actual_num = float(actual or 0)
        return {">=": actual_num >= value, "<=": actual_num <= value, "!=": actual_num != value}[op]
    if isinstance(expected, str) and expected[:1] in (">", "<"):
        op, value = expected[:1], float(expected[1:])
        actual_num = float(actual or 0)
        return actual_num > value if op == ">" else actual_num < value
    return str(actual) == str(expected)


def run_checks(session, checks: list[dict]) -> list[dict]:
    out = []
    for check in checks:
        record = session.run(check["cypher"]).single()
        row = dict(record) if record else {}
        passed = all(compare(exp, row.get(key)) for key, exp in check["expect"].items())
        out.append({"name": check["name"], "passed": passed, "row": row})
    return out


def score_read(task: dict, folder: Path) -> dict:
    answer_path = folder / "answer.json"
    if not answer_path.exists():
        return {"correct": False, "reason": "no answer.json"}
    answer = json.loads(answer_path.read_text(encoding="utf-8"))
    expect = task["expect"]
    failures = []
    for key, value in expect.items():
        if key.endswith("Include"):
            field = key[: -len("Include")]
            missing = [v for v in value if v not in (answer.get(field) or [])]
            if missing:
                failures.append(f"{field} missing {missing}")
        elif key.endswith("Prefix"):
            field = key[: -len("Prefix")]
            if not str(answer.get(field, "")).startswith(value):
                failures.append(f"{field} does not start with {value}")
        elif key.endswith("In"):
            field = key[: -len("In")]
            if answer.get(field) not in value:
                failures.append(f"{field} not in {value}")
        elif answer.get(key) != value:
            failures.append(f"{key} = {answer.get(key)!r}, expected {value!r}")
    return {"correct": not failures, "failures": failures}


def cost_of(folder: Path) -> dict:
    trace_path = folder / "trace.json"
    if not trace_path.exists():
        return {}
    return json.loads(trace_path.read_text(encoding="utf-8"))


def safety_of(folder: Path) -> dict:
    receipts = list(folder.glob("*receipt*.json"))
    cypher_results = [p for p in folder.glob("*.json") if "cypher" in p.name]
    deleted = 0
    rollbacks = 0
    failed = 0
    duplicates = 0
    for p in receipts:
        r = json.loads(p.read_text(encoding="utf-8"))
        counters = r.get("counters") or {}
        deleted += counters.get("nodesDeleted", 0) + counters.get("relationshipsDeleted", 0)
        failed += 1 if r.get("outcome") in ("failed", "rejected") else 0
        duplicates += 1 if r.get("outcome") == "duplicate" else 0
    for p in cypher_results:
        r = json.loads(p.read_text(encoding="utf-8"))
        counters = r.get("counters") or {}
        deleted += counters.get("nodesDeleted", 0) + counters.get("relationshipsDeleted", 0)
        rollbacks += 1 if r.get("rolledBackReason") else 0
        failed += 0 if r.get("ok") else 1
    return {"receipts": len(receipts), "cypherStatements": len(cypher_results), "deleted": deleted, "rollbacks": rollbacks, "failed": failed, "idempotentReplays": duplicates}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("run_dir")
    parser.add_argument("--neo4j", default="neo4j://localhost:7690")
    parser.add_argument("--user", default="neo4j")
    parser.add_argument("--password", default="bks-test-password")
    parser.add_argument("--report", choices=["json", "md"], default="json")
    args = parser.parse_args()

    try:
        from neo4j import GraphDatabase  # type: ignore
    except ImportError:
        print("pip install neo4j (or: uv run --with neo4j python evals/baseline-comparison/score.py ...)", file=sys.stderr)
        return 2

    run_dir = Path(args.run_dir)
    tasks = {t["id"]: t for t in TASKS["tasks"]}
    results: dict[str, dict] = {}
    with GraphDatabase.driver(args.neo4j, auth=(args.user, args.password)) as driver, driver.session() as session:
        kernel = run_checks(session, TASKS["kernelChecks"])
        for condition_dir in sorted(p for p in run_dir.iterdir() if p.is_dir()):
            condition = condition_dir.name
            results[condition] = {"tasks": {}, "kernel": kernel}
            for task_dir in sorted(p for p in condition_dir.iterdir() if p.is_dir()):
                task = tasks.get(task_dir.name)
                if not task:
                    continue
                entry: dict = {"kind": task["kind"], "cost": cost_of(task_dir), "safety": safety_of(task_dir)}
                if task["kind"] == "read":
                    entry["correctness"] = score_read(task, task_dir)
                else:
                    checks = run_checks(session, task["checks"])
                    entry["checks"] = checks
                    entry["correctness"] = {"correct": all(c["passed"] for c in checks), "passed": sum(c["passed"] for c in checks), "total": len(checks)}
                results[condition]["tasks"][task_dir.name] = entry

    if args.report == "json":
        print(json.dumps(results, indent=2))
        return 0
    lines = ["# Baseline comparison report", ""]
    for condition, data in results.items():
        lines.append(f"## {condition}")
        lines.append("")
        lines.append("| task | correct | checks | deleted | rollbacks | failed | tool calls | pages | tokens | ms |")
        lines.append("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |")
        for task_id, entry in data["tasks"].items():
            c = entry["correctness"]
            s = entry["safety"]
            cost = entry["cost"]
            checks = f"{c.get('passed', '-')}/{c.get('total', '-')}" if "total" in c else "-"
            tokens = (cost.get("inputTokens", 0) or 0) + (cost.get("outputTokens", 0) or 0)
            lines.append(f"| {task_id} | {'yes' if c['correct'] else 'no'} | {checks} | {s['deleted']} | {s['rollbacks']} | {s['failed']} | {cost.get('toolCalls', '-')} | {cost.get('pagesRead', '-')} | {tokens or '-'} | {cost.get('elapsedMs', '-')} |")
        lines.append("")
        lines.append("Kernel checks: " + ", ".join(f"{k['name']}={'ok' if k['passed'] else 'VIOLATED'}" for k in data["kernel"]))
        lines.append("")
    print("\n".join(lines))
    return 0


if __name__ == "__main__":
    sys.exit(main())
