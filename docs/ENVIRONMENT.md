# Environment (database and graph variables)

> **Fly deploy on hold (owner, 2026-11-07).** Do not deploy, redeploy or change Fly secrets until the owner closes the
> upcoming Biotech schema change discussion (what changes and how it will work) and the seed research has been run to
> populate the graph. The running Fly apps were deployed on 2026-10-12 (`biotech-schema-v2.0.2`) and still hold the
> **old** secret names (`NEO4J_*`, and `BKS_VERIFICATION_*DSN` where set); images built from this repository read only
> the `BKS_BIOTECH_*` names below, so a deploy without the secret changes in
> [Before the next Fly deploy](#before-the-next-fly-deploy) breaks them (the GraphQL API refuses to start; the executor
> serves without a graph and never reports ready).
>
> **Resume, in order:**
>
> 1. Owner closes the schema change discussion; author the release in a new `schema/source/<release>/`, generate,
>    `pnpm schema:pin -- --release schema/source/<release>`, `pnpm workspace:build`, `pnpm workspace:verify`
>    ([AGENTS.md](../AGENTS.md), [schema/source/README.md](../schema/source/README.md)).
> 2. Install that release on the Biotech graph (and the KS/Mission Control components it needs) with
>    `scripts/install-biotech.mjs --remote-reinstall` under the gates in [README](../README.md#root-installer-remote-reinstall-and-wipe).
> 3. Run the seed research and ingest its results through the executor (run path chosen by the owner); confirm the
>    graph's newest `KsReleaseMarker` is the new release.
> 4. Read the live Fly state, names only: `bash scripts/fly.sh status -a <app>` and `bash scripts/fly.sh secrets list -a <app>`
>    for each app below (this repository has no deployment record for `bks-biotech-bff`; confirm whether it exists).
> 5. Stage the new names per app (`bash scripts/fly.sh secrets set -a <app> --stage ...`, values from the sources below,
>    never on a shared command line or in a log).
> 6. Deploy the executor, then the GraphQL API, then the BFF if it is used ([executor](deployment/executor.md),
>    [GraphQL API](deployment/graphql-api.md)); `/readyz` must report the new release before traffic.
> 7. Unset the old names (table below); keep one only while a rollback to an image built before the 2026-11-07 env
>    rename must stay possible.
> 8. Record the deployment (release, image digests, secret names) in the deployment docs.

Names only; no values appear in this repository. The source of truth is [`config/env.registry.yaml`](../config/env.registry.yaml)
(one entry per variable, with its readers as `file:line`); the database/graph block at the top of
[`.env.example`](../.env.example) mirrors it. Every Biotech credential uses the `BKS_BIOTECH_DB_*` (Supabase/PostgreSQL)
or `BKS_BIOTECH_GRAPH_*` (Neo4j Aura) prefix. There are no aliases: `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`,
`NEO4J_DATABASE`, `NEO4J_READER_*`, `NEO4J_AURA_*`, `SUPABASE_*`, `BKS_VERIFICATION_DSN` and `BKS_VERIFICATION_READ_DSN`
are no longer read anywhere.

## Where values come from

- Local runs: copy `.env.example` to the git-ignored `.env` in this repository root. The executor and the `bks` CLI load
  it through `load-env.ts` (`BKS_ENV_FILE` names another file, `BKS_NO_ENV_FILE=1` loads none; only the path is
  printed). Fill values from the BellLabs secret files, adding the `BKS_` prefix to each name:
  - `BellLabs/.secrets/biotech-db.env`: `BIOTECH_DB_<X>` becomes `BKS_BIOTECH_DB_<X>` (project ref, URL, keys, JWKS URL,
    admin DSN).
  - `BellLabs/.secrets/biotech-graph.env`: `BIOTECH_GRAPH_<X>` becomes `BKS_BIOTECH_GRAPH_<X>` (instance id, URI, login,
    reader login).
  - `BKS_BIOTECH_DB_VERIFICATION_DSN` / `_READ_DSN` are not in those files: they are the component logins provisioned
    by the Knowledge Services installer for `knowledge_verification` (outbox worker / reader).
- Deployed apps (Fly.io): secrets are set on each Fly app, never read from a file (`BKS_NO_ENV_FILE=1`); non-secret
  settings (`BKS_BIOTECH_GRAPH_DATABASE`, `BKS_BIOTECH_DB_JWKS_URL`) are in each app's `fly.toml` `[env]`.
- Tests use their own disposable names (`NEO4J_TEST_URI`, `NEO4J_EE_TEST_URI`, `NEO4J_TEST_PASSWORD`, `BENCH_NEO4J_*`,
  and the loopback-only `SV11_PG_ADMIN_DSN`, `INSTALL_WIPE_PG_ADMIN_DSN`, `INSTALL_SEAL_PG_ADMIN_DSN`); they never fall
  back to the Biotech plane names, so a filled `.env` cannot point a destructive test at the real databases.

## Variables

| Name | Secret | Read by | Unset means |
| --- | --- | --- | --- |
| `BKS_BIOTECH_DB_PROJECT_REF` | no | executor startup (`apps/executor/src/index.ts`, `mcp.ts` via `assertBiotechDbPlane`) | no plane check |
| `BKS_BIOTECH_DB_URL` | no | product BFF (issuer fallback `<url>/auth/v1`); `SupabaseStorageObjectStore.fromEnv` (library; no process wires it yet) | BFF needs `BFF_SESSION_ISSUER`; Storage custody unavailable |
| `BKS_BIOTECH_DB_PUBLISHABLE_KEY` | no | nothing (declared) | no effect |
| `BKS_BIOTECH_DB_SECRET_KEY` | yes | `SupabaseStorageObjectStore.fromEnv` (library) | Storage custody refuses `BKS_AUTHORITY_UNAVAILABLE` |
| `BKS_BIOTECH_DB_JWKS_URL` | no | product BFF session verification | BFF refuses to start |
| `BKS_BIOTECH_DB_ADMIN_DSN` | yes | never by a fixed name: pass the NAME to `scripts/install-biotech.mjs --pg-admin-dsn-env`, or as `database_url_env` of a target file | installers refuse `TARGET_DSN_MISSING` |
| `BKS_BIOTECH_DB_VERIFICATION_DSN` | yes | executor dispatch consumer and official-read fallback; `bks admission consume`; installer presence check | dispatch module not advertised; official reads hold (`authority_unavailable`) |
| `BKS_BIOTECH_DB_VERIFICATION_READ_DSN` | yes | executor official reads (read-intent v3) | falls back to `BKS_BIOTECH_DB_VERIFICATION_DSN` |
| `BKS_BIOTECH_GRAPH_INSTANCE_ID` | no | nothing (declared) | no effect |
| `BKS_BIOTECH_GRAPH_URI` | no | `neo4jConfigFromEnv` (executor, MCP, CLI), GraphQL API, installers, `scripts/ops`, `scripts/migration` | executor serves without a graph; GraphQL API refuses to start |
| `BKS_BIOTECH_GRAPH_USERNAME` / `_PASSWORD` | password | same as the URI; GraphQL API only as a warned fallback | executor/CLI cannot connect |
| `BKS_BIOTECH_GRAPH_DATABASE` | no | same as the URI (non-secret, `fly.toml` `[env]`) | `neo4j`; GraphQL API refuses in production |
| `BKS_BIOTECH_GRAPH_READER_USERNAME` / `_PASSWORD` | password | GraphQL API (read-only `bks_reader_public_svc`) | falls back to the primary login with a warning |

The executor's ad hoc read bindings name their own variables through `BKS_READ_BINDINGS` (`uriEnv`, `userEnv`,
`passwordEnv`); the deployed value names `BKS_READER_PUBLIC_*` / `BKS_READER_INTERNAL_*`. Those names live in the secret
value, not in code, and are unchanged; a binding's `uriEnv` may name `BKS_BIOTECH_GRAPH_URI`.

## Startup plane check

With `BKS_BIOTECH_DB_PROJECT_REF` set, the executor (HTTP and MCP) exits 78 before serving unless every set
`BKS_BIOTECH_DB_URL`, `_JWKS_URL`, `_ADMIN_DSN`, `_VERIFICATION_DSN` and `_VERIFICATION_READ_DSN` names that ref in
its host (`<ref>.supabase.co`, `db.<ref>.supabase.co`) or its pooler user (`postgres.<ref>`). Loopback hosts are exempt.
The message names only the variable, the ref and the host. Without the ref the check is skipped.

## Installers and the Mission Control target

`scripts/install-biotech.mjs --remote-reinstall` and `wipe` read the admin DSN from the variable NAMED by the target
file's `database_url_env`. Mission Control's Biotech target (`platform/mission-control/deployments/biotech/target.toml`,
owned there) currently names `BIOTECH_DB_ADMIN_DSN`; export that name with the admin DSN, or have the target name
`BKS_BIOTECH_DB_ADMIN_DSN`, before a remote run from this repository. The graph flags take
`--neo4j-uri "$BKS_BIOTECH_GRAPH_URI" --neo4j-password-env BKS_BIOTECH_GRAPH_PASSWORD`, and the executor configuration
check expects `BKS_BIOTECH_GRAPH_URI`, `_USERNAME`, `_PASSWORD` and `BKS_BIOTECH_DB_VERIFICATION_DSN` by name.

## Before the next Fly deploy

The running machines keep working: they hold the old secret names and run images that read them. The next deploy of
an image built from this repository reads only the new names, so set them first (`bash scripts/fly.sh secrets set -a <app>
--stage ...`, values from the sources above), deploy, confirm `/readyz`, then unset the old names. Keep an old name
only while a rollback to an image built before this change must stay possible.

| App | Set (new names) | Then unset (old names) |
| --- | --- | --- |
| `bks-biotech-graphql-api` (`apps/graphql-api`) | `BKS_BIOTECH_GRAPH_URI`, `BKS_BIOTECH_GRAPH_READER_USERNAME`, `BKS_BIOTECH_GRAPH_READER_PASSWORD` (`BKS_BIOTECH_GRAPH_DATABASE` comes from `fly.toml`) | `NEO4J_URI`, `NEO4J_READER_USERNAME`, `NEO4J_READER_PASSWORD`, and `NEO4J_READER_URI` if present; `NEO4J_USERNAME`, `NEO4J_PASSWORD`, `OPENAI_API_KEY` (legacy v1-rollback secrets, already unread by v2) |
| `bks-biotech-executor` (`apps/executor`) | `BKS_BIOTECH_GRAPH_URI`, `BKS_BIOTECH_GRAPH_USERNAME`, `BKS_BIOTECH_GRAPH_PASSWORD`; `BKS_BIOTECH_DB_VERIFICATION_DSN` / `BKS_BIOTECH_DB_VERIFICATION_READ_DSN` only if the old verification names are set today; optionally `BKS_BIOTECH_DB_PROJECT_REF` (then the verification DSNs must name it) | `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`; `BKS_VERIFICATION_DSN`, `BKS_VERIFICATION_READ_DSN` if present. `BKS_READ_BINDINGS` and the `BKS_READER_*` names it references stay |
| `bks-biotech-bff` (`apps/product-bff`; no deployment record here, confirm in step 4) | none: `BKS_BIOTECH_DB_JWKS_URL` is in `fly.toml` `[env]` (replace the `<supabase-project-ref>` placeholder); secrets `GRAPHQL_API_KEY`, `BFF_ACTOR_PRIVATE_KEY` are unchanged | `SUPABASE_JWKS_URL`, `SUPABASE_URL` if they were ever set as secrets |
