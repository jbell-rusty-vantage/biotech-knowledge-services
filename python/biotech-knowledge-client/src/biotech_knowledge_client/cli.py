"""`bks-py` — thin CLI over KnowledgeClient for adapters and smoke checks.

  bks-py health | describe
  bks-py schema search "<words>" [--limit 10]
  bks-py schema get <id>
  bks-py validate <contract> <file.json>          # contract: intent | plan | apply | receipt | witness | read-intent | intent-v1 | ...
  bks-py digest <file.json> [--v1]                # bks-canonical-json.v2 digest (v1 digest with --v1)
  bks-py read <read-intent.json>
  bks-py plan <intent.v2.json>                    # server-stored plan: planRef + planDigest + view
  bks-py admit <planRef> --effect-key K           # development admission witness (local-dev executor only)
  bks-py apply <apply-request.v2.json>            # references only (planRef, expected digest, effect key, witness)
  bks-py receipt <effectKey>
  bks-py verify <effectKey> [--page-size 100]     # paginated readback of every declared effect
Env: BKS_EXECUTOR_URL (default http://127.0.0.1:4020), BKS_EXECUTOR_API_KEY
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

from .canonical import canonical_digest
from .client import KnowledgeClient, KnowledgeClientError
from .digest import digest_of
from .models import validate_contract


def _load(path: str) -> dict:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def _print(value: object) -> None:
    if hasattr(value, "model_dump"):
        value = value.model_dump(by_alias=True)  # type: ignore[union-attr]
    print(json.dumps(value, indent=2, ensure_ascii=False))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="bks-py", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("health")
    sub.add_parser("describe")
    schema = sub.add_parser("schema")
    schema_sub = schema.add_subparsers(dest="schema_cmd", required=True)
    s_search = schema_sub.add_parser("search")
    s_search.add_argument("query")
    s_search.add_argument("--limit", type=int, default=10)
    s_get = schema_sub.add_parser("get")
    s_get.add_argument("id")
    v = sub.add_parser("validate")
    v.add_argument("contract")
    v.add_argument("file")
    d = sub.add_parser("digest")
    d.add_argument("file")
    d.add_argument("--v1", action="store_true")
    r = sub.add_parser("read")
    r.add_argument("file")
    p = sub.add_parser("plan")
    p.add_argument("file")
    ad = sub.add_parser("admit")
    ad.add_argument("plan_ref")
    ad.add_argument("--effect-key", required=True)
    a = sub.add_parser("apply")
    a.add_argument("file")
    rc = sub.add_parser("receipt")
    rc.add_argument("effect_key")
    vf = sub.add_parser("verify")
    vf.add_argument("effect_key")
    vf.add_argument("--page-size", type=int, default=100)
    args = parser.parse_args(argv)

    if args.cmd == "validate":
        errors = validate_contract(args.contract, _load(args.file))
        _print({"ok": not errors, "errors": errors})
        return 0 if not errors else 1
    if args.cmd == "digest":
        print(digest_of(_load(args.file)) if args.v1 else canonical_digest(_load(args.file)))
        return 0

    client = KnowledgeClient(os.environ.get("BKS_EXECUTOR_URL", "http://127.0.0.1:4020"), os.environ.get("BKS_EXECUTOR_API_KEY"))
    try:
        if args.cmd == "health":
            _print(client.health())
        elif args.cmd == "describe":
            _print(client.describe())
        elif args.cmd == "schema" and args.schema_cmd == "search":
            _print(client.schema_search(args.query, args.limit))
        elif args.cmd == "schema":
            page = client.schema_page(args.id)
            sys.stdout.write(page["text"])
        elif args.cmd == "read":
            _print(client.read(_load(args.file)))
        elif args.cmd == "plan":
            view = client.plan(_load(args.file))
            _print(view)
            return 0 if view.outcome != "rejected" else 1
        elif args.cmd == "admit":
            _print(client.admit(args.plan_ref, args.effect_key))
        elif args.cmd == "apply":
            receipt = client.apply(_load(args.file))
            _print(receipt)
            return 0 if receipt.outcome in ("applied", "noop", "duplicate", "partial") else 1
        elif args.cmd == "receipt":
            _print(client.receipt(args.effect_key))
        elif args.cmd == "verify":
            failures = 0
            for page in client.iter_effect_pages(args.effect_key, args.page_size):
                failures += page.failures
                _print({"cursor": page.cursor, "checked": page.checked, "failures": page.failures, "complete": page.complete})
            return 0 if failures == 0 else 1
        return 0
    except KnowledgeClientError as error:
        _print({"ok": False, "code": error.code, "message": error.message, "details": error.details})
        return 3 if error.code in ("BKS_EFFECT_CONFLICT", "BKS_EFFECT_PENDING") else 1
    finally:
        client.close()


if __name__ == "__main__":
    sys.exit(main())
