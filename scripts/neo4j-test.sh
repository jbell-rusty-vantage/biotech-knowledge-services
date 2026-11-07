#!/usr/bin/env bash
# Disposable Neo4j 5.26 (+ APOC core) for integration tests and local development. Never points at Aura.
# Guard ports (7690 bolt / 7490 http) keep it apart from any Aura tunnel or other local instance.
#
#   scripts/neo4j-test.sh up      # start (idempotent), wait for bolt
#   scripts/neo4j-test.sh down    # stop and remove the container and its anonymous volume
#   scripts/neo4j-test.sh logs
#
# Editions:
#   BKS_NEO4J_EDITION=community (default)  image neo4j:5.26-community
#   BKS_NEO4J_EDITION=enterprise           image neo4j:5.26-enterprise with NEO4J_ACCEPT_LICENSE_AGREEMENT=eval
#                                          (evaluation licence; role-based reader/writer principals for the
#                                          read-authority tests). Default container bks-neo4j-test-ee, bolt 7695, http 7495,
#                                          so both editions can run side by side.
set -euo pipefail
EDITION="${BKS_NEO4J_EDITION:-community}"
case "$EDITION" in
  community)
    DEFAULT_NAME=bks-neo4j-test; DEFAULT_BOLT=7690; DEFAULT_HTTP=7490; DEFAULT_IMAGE=neo4j:5.26-community ;;
  enterprise)
    DEFAULT_NAME=bks-neo4j-test-ee; DEFAULT_BOLT=7695; DEFAULT_HTTP=7495; DEFAULT_IMAGE=neo4j:5.26-enterprise ;;
  *)
    echo "BKS_NEO4J_EDITION must be community or enterprise" >&2; exit 2 ;;
esac
NAME="${BKS_NEO4J_TEST_CONTAINER:-$DEFAULT_NAME}"
BOLT_PORT="${BKS_NEO4J_TEST_BOLT_PORT:-$DEFAULT_BOLT}"
HTTP_PORT="${BKS_NEO4J_TEST_HTTP_PORT:-$DEFAULT_HTTP}"
PASSWORD="${NEO4J_TEST_PASSWORD:-bks-test-password}"
IMAGE="${BKS_NEO4J_IMAGE:-$DEFAULT_IMAGE}"

case "${1:-up}" in
  up)
    if docker ps --format '{{.Names}}' | grep -qx "$NAME"; then
      echo "already running: $NAME (bolt ${BOLT_PORT}, ${EDITION})"
    else
      docker rm -f "$NAME" >/dev/null 2>&1 || true
      extra=()
      if [ "$EDITION" = "enterprise" ]; then
        extra+=(-e NEO4J_ACCEPT_LICENSE_AGREEMENT=eval)
      fi
      docker run -d --name "$NAME" \
        -p "${BOLT_PORT}:7687" -p "${HTTP_PORT}:7474" \
        -e NEO4J_AUTH="neo4j/${PASSWORD}" \
        -e NEO4J_PLUGINS='["apoc"]' \
        -e NEO4J_dbms_security_procedures_unrestricted='apoc.*' \
        -e NEO4J_server_memory_heap_max__size=1G \
        -e NEO4J_server_memory_heap_initial__size=512M \
        -e NEO4J_server_memory_pagecache_size="${BKS_NEO4J_PAGECACHE:-256M}" \
        --memory="${BKS_NEO4J_CONTAINER_MEMORY:-1536m}" \
        "${extra[@]}" \
        "$IMAGE" >/dev/null
      echo "started $NAME ($EDITION, $IMAGE)"
    fi
    for i in $(seq 1 90); do
      if docker exec "$NAME" cypher-shell -u neo4j -p "$PASSWORD" "RETURN 1" >/dev/null 2>&1; then
        echo "ready: bolt://localhost:${BOLT_PORT}  http://localhost:${HTTP_PORT}  (neo4j / ${PASSWORD}, ${EDITION})"
        if [ "$EDITION" = "enterprise" ]; then
          echo "export NEO4J_EE_TEST_URI=neo4j://localhost:${BOLT_PORT} NEO4J_TEST_PASSWORD=${PASSWORD} BKS_INTEGRATION=1"
        else
          echo "export NEO4J_TEST_URI=neo4j://localhost:${BOLT_PORT} NEO4J_TEST_PASSWORD=${PASSWORD} BKS_INTEGRATION=1"
        fi
        exit 0
      fi
      sleep 2
    done
    echo "neo4j did not become ready" >&2
    docker logs "$NAME" | tail -20 >&2
    exit 1
    ;;
  down)
    docker rm -f -v "$NAME" >/dev/null 2>&1 && echo "removed $NAME" || echo "not running"
    ;;
  logs)
    docker logs "$NAME"
    ;;
  *)
    echo "usage: [BKS_NEO4J_EDITION=community|enterprise] $0 up|down|logs" >&2
    exit 2
    ;;
esac
