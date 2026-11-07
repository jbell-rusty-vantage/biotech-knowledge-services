#!/usr/bin/env bash
# Per-arm migration shadow for the migration-bound write tasks (WR-29, WR-30, WR-33). One container at a time:
# bks-neo4j-migwrite (Community 5.26.31, bolt 7721, http 7521). Arms run strictly in sequence (A, then B).
#
#   bash scripts/migration/eval-migration-shadow.sh up <arm>        fresh EMPTY database + <run>/target.env for the agent
#                                                                     (WR-29 restores and verifies into it; WR-30 dry-runs)
#   bash scripts/migration/eval-migration-shadow.sh migrate <arm>   apply mig-0b2e97d4b8e0 on the agent's restored copy
#                                                                     (restores first only if the database is still empty)
#   bash scripts/migration/eval-migration-shadow.sh executor <arm>  writer executor on :4151 for WR-33 (local-dev writer,
#                                                                     throwaway witness key, cwd = run dir, no repo .env)
#   bash scripts/migration/eval-migration-shadow.sh down            stop the executor and remove the container
#
# Run dir: runs/release-v2/eval-runs/migwrite-<arm>/ (gitignored custody). Bindings per arm: <run>/bindings.json.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO"
CMD="${1:-}"; ARM="${2:-}"
EXP="runs/release-v2/custody/backups/20261011T224403Z-aura-neo4j"
PLAN="$EXP/plans/mig-0b2e97d4b8e0"
RUN="runs/release-v2/eval-runs/migwrite-${ARM}"
export BKS_NEO4J_TEST_CONTAINER=bks-neo4j-migwrite BKS_NEO4J_TEST_BOLT_PORT=7721 BKS_NEO4J_TEST_HTTP_PORT=7521
unset BKS_NEO4J_EDITION || true
target_env() { export BKS_RESTORE_URI=neo4j://localhost:7721 BKS_RESTORE_PASSWORD=bks-test-password; }
need_arm() { [[ "$ARM" == "A" || "$ARM" == "B" ]] || { echo "arm must be A or B" >&2; exit 2; }; }
count() { node -e '
const neo4j=require(require("module").createRequire(process.cwd()+"/packages/kg-ops/package.json").resolve("neo4j-driver"));
const d=neo4j.driver("bolt://127.0.0.1:7721",neo4j.auth.basic("neo4j","bks-test-password"));const s=d.session();
s.run(process.argv[1]).then(r=>{console.log(r.records[0].get(0).toNumber());return s.close()}).then(()=>d.close());' "$1"; }
case "$CMD" in
  up)
    need_arm
    docker ps -a --format '{{.Names}}' | grep -qx bks-neo4j-migwrite && { echo "bks-neo4j-migwrite exists: run down first (one arm at a time)" >&2; exit 3; }
    mkdir -p "$RUN/executor"; : > "$RUN/empty.env"
    bash scripts/neo4j-test.sh up | tail -1
    cat > "$RUN/target.env" <<EOF
# Disposable restore target for arm $ARM (WR-29 / WR-30). Never the production host; scripts refuse *.databases.neo4j.io.
BKS_RESTORE_URI=neo4j://localhost:7721
BKS_RESTORE_USERNAME=neo4j
BKS_RESTORE_PASSWORD=bks-test-password
BKS_RESTORE_DATABASE=neo4j
EOF
    cat > "$RUN/bindings.json" <<EOF
{
  "ARM": "$ARM",
  "RELEASE_ID": "biotech-schema-v2.0.2",
  "SCHEMA_RELEASE_DIGEST": "sha256:5fffb593c8ca94b289b768ac0a0b02df5739cb338b7a04ec88173589708c5a42",
  "EXPORT_ID": "20261011T224403Z-aura-neo4j",
  "MIGRATION_RUN_ID": "mig-0b2e97d4b8e0",
  "EXPORT_DIR": "$EXP",
  "PLAN_DIR": "$PLAN",
  "TARGET_ENV": "$RUN/target.env",
  "EXECUTOR_URL": "http://127.0.0.1:4151 (after 'executor $ARM')"
}
EOF
    echo "arm $ARM: empty target ready; env $RUN/target.env; bindings $RUN/bindings.json"
    ;;
  migrate)
    need_arm; target_env
    n=$(count "MATCH (n) RETURN count(n)")
    if [[ "$n" == "0" ]]; then
      echo "database empty: restoring the export first"
      node scripts/migration/restore-graph.mjs --export "$EXP" --label "migwrite-$ARM" | tail -3
    fi
    [[ "$(count "MATCH (m:KsIntentMarker) RETURN count(m)")" == "0" ]] || echo "note: markers present; apply resumes by marker"
    node scripts/migration/apply-release-ddl.mjs --phase pre --report "$RUN/ddl-pre.json" | grep -E '"created"|"present"' | head -2 || true
    BKS_MIGRATION_APPLY_AUTHORIZED=mig-0b2e97d4b8e0 node packages/kg-ops/src/migration/apply-migration.mjs --plan "$PLAN" --export "$EXP" --mode apply | grep -E '"outcome"|"invariants"|"report"'
    ;;
  executor)
    need_arm
    # Import through pathToFileURL from the current directory (the repository root): a Git Bash path such as /c/Users/...
    # concatenated into a file:/// URL does not resolve on Windows.
    KEY=$(node --input-type=module -e 'const { pathToFileURL } = await import("node:url"); const k=(await import(pathToFileURL(process.cwd() + "/packages/kg-ops/dist/index.js").href)).generateWitnessKeyPair("migwrite"); console.log(JSON.stringify({kid:k.kid,pub:k.publicKeyDer,priv:k.privateKeyDer}))')
    echo "$KEY" > "$RUN/witness-key.json"
    KID=$(node -e 'console.log(JSON.parse(process.argv[1]).kid)' "$KEY"); PUB=$(node -e 'console.log(JSON.parse(process.argv[1]).pub)' "$KEY"); PRIV=$(node -e 'console.log(JSON.parse(process.argv[1]).priv)' "$KEY")
    cd "$RUN"
    DOTENV_CONFIG_PATH="$PWD/empty.env" BKS_BIOTECH_GRAPH_URI=bolt://127.0.0.1:7721 BKS_BIOTECH_GRAPH_USERNAME=neo4j BKS_BIOTECH_GRAPH_PASSWORD=bks-test-password BKS_BIOTECH_GRAPH_DATABASE=neo4j \
    BKS_WORKSPACE_DIR="$REPO/workspace" BKS_RELEASE_RUNS_DIR="$PWD/executor" BKS_RUNS_DIR="$PWD/executor" \
    BKS_LOCAL_DEV=1 BKS_LOCAL_DEV_ROLE=writer EXECUTOR_PORT=4151 BKS_DISABLE_READ_V1=1 \
    BKS_WITNESS_SIGNING_KEY="$KID:$PRIV" BKS_WITNESS_ISSUER_KEYS="$KID:$PUB" \
    nohup node "$REPO/apps/executor/dist/index.js" > executor.log 2>&1 &
    echo $! > executor.pid
    for i in $(seq 1 60); do curl -sf http://127.0.0.1:4151/healthz >/dev/null && break; sleep 1; done
    curl -s http://127.0.0.1:4151/healthz; echo
    ;;
  down)
    for p in runs/release-v2/eval-runs/migwrite-*/executor.pid; do [[ -f "$p" ]] && { kill "$(cat "$p")" 2>/dev/null || true; rm -f "$p"; }; done
    bash scripts/neo4j-test.sh down || true
    ;;
  *) sed -n '2,16p' "$0"; exit 2 ;;
esac
