"""Extract every question row from every packet's 02-questions.md (cross-packet pass).

Usage (Git Bash, from any directory; pass C:/ paths, not /c/ paths):
    python schema/program/packets/D10/_notes/answer_kind_extract.py C:/Users/Pinda/Proyectos/Biotech [out.json]

Reads the first table whose header row starts with `| id |` in each packet's
02-questions.md, from the worktree that owns the packet (PACKETS below), and
writes one JSON object per question row. Stdlib only.
"""
import json
import re
import sys
from pathlib import Path

PACKETS = [
    ("K", "A1"), ("D1", "A2"), ("D2", "A3"), ("D3", "A4"), ("D4", "A3"),
    ("D5", "A5"), ("D6", "A6"), ("D7", "A6"), ("D8", "A7"), ("D9", "A8"),
    ("D10", "A1"), ("D11", "A8"), ("D12", "A2"), ("D13", "A7"),
]
ID_RE = re.compile(r"^(Q-[A-Z0-9]+-\d+[a-z]?|CQ-[A-Z]+-\d+[a-z]?)$")
COLS = ["id", "question", "audience", "value", "polarity", "answer kind",
        "answer shape", "sources", "fixture"]


def split_row(line: str) -> list[str]:
    body = line.strip()
    if body.startswith("|"):
        body = body[1:]
    if body.endswith("|"):
        body = body[:-1]
    cells, cur, i = [], [], 0
    while i < len(body):
        ch = body[i]
        if ch == "\\" and i + 1 < len(body) and body[i + 1] == "|":
            cur.append("|")
            i += 2
            continue
        if ch == "|":
            cells.append("".join(cur).strip())
            cur = []
        else:
            cur.append(ch)
        i += 1
    cells.append("".join(cur).strip())
    return cells


def extract(root: Path, packet: str, agent: str) -> list[dict]:
    path = root / f"biotech-knowledge-services-{agent}" / "schema" / "program" / "packets" / packet / "02-questions.md"
    rows, in_table, header = [], False, None
    for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not in_table:
            if line.strip().lower().startswith("| id |"):
                header = [c.lower() for c in split_row(line)]
                in_table = True
            continue
        if not line.strip().startswith("|"):
            break
        cells = split_row(line)
        cid = cells[0].strip("` *")
        if not ID_RE.match(cid):
            continue
        rec = {"packet": packet, "agent": agent, "line": n, "id": cid}
        for col in COLS[1:]:
            idx = header.index(col) if col in header else None
            rec[col.replace(" ", "_")] = cells[idx] if idx is not None and idx < len(cells) else ""
        rows.append(rec)
    if header != COLS:
        print(f"warn: {packet} header differs: {header}", file=sys.stderr)
    return rows


def main() -> None:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "C:/Users/Pinda/Proyectos/Biotech")
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).with_name("answer-kind-rows.json")
    allrows = []
    for packet, agent in PACKETS:
        rows = extract(root, packet, agent)
        print(f"{packet}: {len(rows)} rows", file=sys.stderr)
        allrows.extend(rows)
    out.write_text(json.dumps(allrows, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"total {len(allrows)} -> {out}", file=sys.stderr)


if __name__ == "__main__":
    main()
