# Bounded consumer GraphQL API over the pinned Biotech schema v2 release.
# Build from the repository root:  docker build -f apps/graphql-api/Dockerfile -t bks-graphql-api .
# The image carries the pinned release bundle (schema/pinned/PIN.json + schema/pinned/release/**), the projection
# manifest, the operation safelist and the generated identities. Production starts only from that bundle.
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
COPY apps/graphql-api apps/graphql-api
RUN pnpm exec tsc -b --force packages/contracts/tsconfig.json packages/schema-workspace/tsconfig.json apps/graphql-api/tsconfig.json \
 && ls apps/graphql-api/dist/main.js packages/schema-workspace/dist/index.js packages/contracts/dist/index.js

FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@11.15.1 --activate
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/package.json /repo/pnpm-workspace.yaml /repo/pnpm-lock.yaml ./
COPY --from=build /repo/packages/contracts/package.json packages/contracts/
COPY --from=build /repo/packages/contracts/dist packages/contracts/dist
COPY --from=build /repo/packages/schema-workspace/package.json packages/schema-workspace/
COPY --from=build /repo/packages/schema-workspace/dist packages/schema-workspace/dist
COPY --from=build /repo/apps/graphql-api/package.json apps/graphql-api/
COPY --from=build /repo/apps/graphql-api/dist apps/graphql-api/dist
COPY --from=build /repo/apps/graphql-api/projection apps/graphql-api/projection
COPY --from=build /repo/apps/graphql-api/operations apps/graphql-api/operations
COPY --from=build /repo/apps/graphql-api/generated apps/graphql-api/generated
RUN pnpm install --frozen-lockfile --prod --filter @bks/graphql-api... --config.confirmModulesPurge=false
# The pinned release: PIN.json plus the verified bundle. No v1 file name, no candidate SDL, no DDL at startup.
COPY schema/pinned/PIN.json schema/pinned/PIN.json
COPY schema/pinned/release schema/pinned/release
USER node
EXPOSE 4010
# Liveness only; readiness (/readyz: release marker, required indexes ONLINE, plan warm-up) is the deploy gate.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD wget -qO- http://127.0.0.1:${PORT:-4010}/healthz || exit 1
CMD ["node", "apps/graphql-api/dist/main.js"]
