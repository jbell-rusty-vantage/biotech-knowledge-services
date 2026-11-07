# Native knowledge executor (plan / admit / apply / receipt / reads / schema workspace) over the pinned Biotech schema
# release. Build from the repository root:
#   docker build -f apps/executor/Dockerfile -t bks-executor:v2.0.2 .
# The image carries the pinned release bundle (schema/pinned/PIN.json + release/**), the generated schema workspace,
# the capability descriptor template and lane mount, and the domain skills the capability descriptor digests. No .env is
# copied (.dockerignore) and none is loaded (BKS_NO_ENV_FILE=1): configuration comes from platform secrets. Connections
# to Aura hosts are refused unless BKS_TARGET=production.
FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@11.15.1 --activate
WORKDIR /repo
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json tsconfig.json ./
COPY packages/contracts/package.json packages/contracts/
COPY packages/schema-workspace/package.json packages/schema-workspace/
COPY packages/kg-ops/package.json packages/kg-ops/
COPY packages/graphql-client/package.json packages/graphql-client/
COPY apps/graphql-api/package.json apps/graphql-api/
COPY apps/product-bff/package.json apps/product-bff/
COPY apps/executor/package.json apps/executor/
RUN pnpm install --frozen-lockfile
COPY packages/contracts packages/contracts
COPY packages/schema-workspace packages/schema-workspace
COPY packages/kg-ops packages/kg-ops
COPY apps/executor apps/executor
RUN pnpm exec tsc -b --force packages/contracts/tsconfig.json packages/schema-workspace/tsconfig.json packages/kg-ops/tsconfig.json apps/executor/tsconfig.json \
 && ls apps/executor/dist/index.js packages/kg-ops/dist/index.js packages/schema-workspace/dist/index.js packages/contracts/dist/index.js

FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@11.15.1 --activate
WORKDIR /repo
ENV NODE_ENV=production \
    BKS_NO_ENV_FILE=1 \
    BKS_PROCESS_LABEL=bks-executor \
    EXECUTOR_PORT=4020
COPY --from=build /repo/package.json /repo/pnpm-workspace.yaml /repo/pnpm-lock.yaml ./
COPY --from=build /repo/packages/contracts/package.json packages/contracts/
COPY --from=build /repo/packages/contracts/dist packages/contracts/dist
COPY --from=build /repo/packages/contracts/json-schema packages/contracts/json-schema
COPY --from=build /repo/packages/schema-workspace/package.json packages/schema-workspace/
COPY --from=build /repo/packages/schema-workspace/dist packages/schema-workspace/dist
COPY --from=build /repo/packages/kg-ops/package.json packages/kg-ops/
COPY --from=build /repo/packages/kg-ops/dist packages/kg-ops/dist
COPY --from=build /repo/apps/executor/package.json apps/executor/
COPY --from=build /repo/apps/executor/dist apps/executor/dist
COPY --from=build /repo/apps/executor/capabilities apps/executor/capabilities
COPY --from=build /repo/apps/executor/lanes apps/executor/lanes
RUN pnpm install --frozen-lockfile --prod --filter @bks/executor... --config.confirmModulesPurge=false
# The pinned release (verified on every load), the generated workspace and the domain skills (digested by the capability
# descriptor; never executed). Vendored Neo4j skills are not copied.
COPY schema/pinned/PIN.json schema/pinned/PIN.json
COPY schema/pinned/release schema/pinned/release
COPY workspace workspace
COPY .agents/skills/skill-routing.json .agents/skills/skill-routing.json
COPY .agents/skills/biotech-schema-explore .agents/skills/biotech-schema-explore
COPY .agents/skills/biotech-kg-query .agents/skills/biotech-kg-query
COPY .agents/skills/biotech-kg-ingest .agents/skills/biotech-kg-ingest
COPY .agents/skills/biotech-graph-ops .agents/skills/biotech-graph-ops
COPY .agents/skills/biotech-graph-analyze .agents/skills/biotech-graph-analyze
# Plan / receipt / snapshot custody needs a persistent path (fly.toml mounts /data and sets BKS_RELEASE_RUNS_DIR=/data/runs).
RUN mkdir -p /data/runs && chown -R node:node /data
USER node
EXPOSE 4020
# Liveness only; /readyz (database, latest release marker, writer DDL ONLINE) is the traffic gate.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD wget -qO- http://127.0.0.1:${EXECUTOR_PORT:-4020}/healthz || exit 1
CMD ["node", "apps/executor/dist/index.js"]
