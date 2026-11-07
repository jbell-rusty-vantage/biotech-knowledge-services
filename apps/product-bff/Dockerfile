# Reference product BFF (session verification, entitlements, BFF-signed actor context, safelisted forwarding).
# Build from the repository root:  docker build -f apps/product-bff/Dockerfile -t bks-bff .
# The image holds no secrets: BKS_BIOTECH_DB_JWKS_URL / issuer / audience are configuration; GRAPHQL_API_KEY and
# BFF_ACTOR_PRIVATE_KEY are runtime secrets. It refuses to start without them.
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
COPY packages/graphql-client packages/graphql-client
COPY apps/product-bff apps/product-bff
RUN pnpm exec tsc -b --force packages/graphql-client/tsconfig.json apps/product-bff/tsconfig.json \
 && ls apps/product-bff/dist/main.js packages/graphql-client/dist/index.js

FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@11.15.1 --activate
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/package.json /repo/pnpm-workspace.yaml /repo/pnpm-lock.yaml ./
COPY --from=build /repo/packages/graphql-client/package.json packages/graphql-client/
COPY --from=build /repo/packages/graphql-client/dist packages/graphql-client/dist
COPY --from=build /repo/apps/product-bff/package.json apps/product-bff/
COPY --from=build /repo/apps/product-bff/dist apps/product-bff/dist
RUN pnpm install --frozen-lockfile --prod --filter @bks/product-bff... --config.confirmModulesPurge=false
USER node
EXPOSE 4020
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD wget -qO- http://127.0.0.1:${PORT:-4020}/healthz || exit 1
CMD ["node", "apps/product-bff/dist/main.js"]
