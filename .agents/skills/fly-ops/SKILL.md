---
name: fly-ops
description: >-
  Use when deploying, inspecting, or operating the BellLabs GraphQL API on Fly.io (app
  bks-biotech-graphql-api): deploy a new image, check status and logs, set or rotate secrets, smoke-test
  the remote endpoint, scale or restart Machines, or mint a narrower Fly token. Wraps flyctl through
  scripts/fly.sh so the credential comes from .env and never appears in output. Not for the knowledge
  executor or for Neo4j writes (use biotech-kg-ingest).
allowed-tools:
  - Bash(bash scripts/fly.sh *)
  - Bash(curl *)
---

# fly-ops — the GraphQL API on Fly.io

The API in `apps/graphql-api` runs on **Fly Machines** (not Sprites) in the `personal` org, app
`bks-biotech-graphql-api`, region `iad`, one always-on shared-cpu-2x Machine with 4 GB (the built schema retains ~2 GB of heap; 2 GB machines crash with heap OOM). Neo4j stays on Aura. Config:
`apps/graphql-api/fly.toml`; variables and endpoints: `docs/deployment/graphql-api.md`.
URL: `https://bks-biotech-graphql-api.fly.dev` (`/graphql`, `/healthz`, `/schema.graphql`).

## Credential

Always call flyctl as `bash scripts/fly.sh <args>` from the repository root. It uses `FLY_ACCESS_TOKEN` or
`FLY_API_TOKEN` from the environment, else `FLY_TOKEN` from `.env`, and finds flyctl in `~/.fly/bin` on
Windows where it is often not on PATH. Never print, log, or commit a token; never run `fly auth token`.
Check what a token can reach with `fly tokens debug` piped through `grep -v FlyV1`. If flyctl is missing or
the token is rejected, stop and ask the owner (install/login steps: https://fly.io/agent-ready.md,
credentials: https://fly.io/auth.md). Do not start `fly auth login` without asking.

## Deploy

```bash
bash scripts/fly.sh deploy . --config apps/graphql-api/fly.toml --dockerfile apps/graphql-api/Dockerfile --remote-only
bash scripts/fly.sh status -a bks-biotech-graphql-api
```

The build context is the repository root (the image needs `packages/contracts` and `schema/pinned`);
Fly's remote builder does the build, no local Docker needed. Boot builds the GraphQL schema (~30 s+), so
the health check has a 120 s grace period; a deploy that looks stuck for two minutes is normal. Run
`pnpm build && pnpm test` before deploying.

## Secrets

Runtime secrets (code since 2026-11-07): `BKS_BIOTECH_GRAPH_URI`, `BKS_BIOTECH_GRAPH_READER_USERNAME`,
`BKS_BIOTECH_GRAPH_READER_PASSWORD`, `GRAPHQL_API_KEY`. **Deploys are on hold** and the running apps still hold the
old `NEO4J_*` secrets: follow the resume steps and per-app set/unset list in `docs/ENVIRONMENT.md` before any deploy.
Non-secret settings live in `fly.toml [env]`. Set secrets from `.env` by piping `NAME=value` lines into
`bash scripts/fly.sh secrets import -a bks-biotech-graphql-api` (add `--stage` to apply on the next
deploy); never put values on the command line or in chat. `secrets list` shows names and digests only.
Rotating `GRAPHQL_API_KEY` breaks the web app and dashboard until their env is updated too.

## Smoke test

```bash
KEY=$(grep '^GRAPHQL_API_KEY=' .env | cut -d= -f2- | tr -d '\r')
curl -s https://bks-biotech-graphql-api.fly.dev/healthz
curl -s -H 'content-type: application/json' -H "x-api-key: $KEY" \
  -d '{"query":"{ products(limit: 3) { uid name } }"}' https://bks-biotech-graphql-api.fly.dev/graphql
curl -s -o /dev/null -w '%{http_code}\n' -H 'content-type: application/json' \
  -d '{"query":"{ __typename }"}' https://bks-biotech-graphql-api.fly.dev/graphql   # expect 401
```

## Operate

- `logs -a bks-biotech-graphql-api --no-tail` for recent logs; `machine list`, `machine restart <id>`.
- `scale memory 4096` / `scale count 1`; keep `min_machines_running = 1` or every cold start pays the schema build.
- `releases -a bks-biotech-graphql-api` and `deploy --image <previous image ref>` to roll back.
- Destroying the app, deleting volumes, or revoking tokens you did not create: ask first.

## Narrower tokens

For CI or unattended work, mint the narrowest token with an expiry and a name, for example
`bash scripts/fly.sh tokens create deploy -a bks-biotech-graphql-api --expiry 720h --name bks-graphql-deploy`,
store it as a secret (never in the repo), and revoke one-off tokens when the job is done.
