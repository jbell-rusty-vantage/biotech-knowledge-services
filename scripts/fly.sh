#!/usr/bin/env bash
# flyctl with the repository's Fly credential, for agents and humans alike.
# Resolves the token the way flyctl does (FLY_ACCESS_TOKEN > FLY_API_TOKEN), falling back to FLY_TOKEN
# (or FLY_API_TOKEN) from .env. The token is exported to flyctl only; it is never echoed.
#   scripts/fly.sh status -a bks-biotech-graphql-api
#   scripts/fly.sh deploy . --config apps/graphql-api/fly.toml --dockerfile apps/graphql-api/Dockerfile --remote-only
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -z "${FLY_ACCESS_TOKEN:-}" && -z "${FLY_API_TOKEN:-}" && -f "$ROOT/.env" ]]; then
  token="$(grep -E '^(FLY_API_TOKEN|FLY_TOKEN)=' "$ROOT/.env" | head -1 | cut -d= -f2- | tr -d '"\r' || true)"
  [[ -n "$token" ]] && export FLY_API_TOKEN="$token"
fi

FLYCTL="$(command -v flyctl || command -v fly || true)"
if [[ -z "$FLYCTL" ]]; then
  for candidate in "$HOME/.fly/bin/flyctl" "$HOME/.fly/bin/flyctl.exe" "${USERPROFILE:-}/.fly/bin/flyctl.exe"; do
    [[ -x "$candidate" ]] && FLYCTL="$candidate" && break
  done
fi
[[ -n "$FLYCTL" ]] || { echo "flyctl not found; install: https://fly.io/agent-ready.md" >&2; exit 127; }

exec "$FLYCTL" "$@"
