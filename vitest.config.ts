import { createRequire } from "node:module";
import { defineConfig } from "vitest/config";

const graphqlCjs = createRequire(new URL("./apps/graphql-api/package.json", import.meta.url)).resolve("graphql");

export default defineConfig({
  test: {
    projects: [
      { test: { name: "contracts", root: "packages/contracts", include: ["src/**/*.test.ts"] } },
      { test: { name: "schema-workspace", root: "packages/schema-workspace", include: ["src/**/*.test.ts"] } },
      {
        // Node loads graphql's CommonJS build for both the app and @neo4j/graphql; Vite would pick the .mjs build for
        // the app and the schema objects would come from two "realms". Pin the CommonJS entry to match production.
        resolve: { alias: [{ find: /^graphql$/, replacement: graphqlCjs }] },
        test: { name: "graphql-api", root: "apps/graphql-api", include: ["src/**/*.test.ts"], testTimeout: 60_000 },
      },
      { test: { name: "graphql-client", root: "packages/graphql-client", include: ["src/**/*.test.ts"] } },
      {
        resolve: { alias: [{ find: /^graphql$/, replacement: graphqlCjs }] },
        test: { name: "product-bff", root: "apps/product-bff", include: ["src/**/*.test.ts"], testTimeout: 60_000, hookTimeout: 120_000 },
      },
      { test: { name: "kg-ops", root: "packages/kg-ops", include: ["src/**/*.test.ts"], testTimeout: 120_000, hookTimeout: 180_000 } },
      { test: { name: "executor", root: "apps/executor", include: ["src/**/*.test.ts"], testTimeout: 60_000 } },
    ],
  },
});
