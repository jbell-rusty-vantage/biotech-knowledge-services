import { serve } from "@hono/node-server";
import { createBffApp } from "./app.js";
import { bffConfigFromEnv, type BffConfig } from "./config.js";

let config: BffConfig;
try {
  config = bffConfigFromEnv();
} catch (error) {
  // Refuse to start without the session issuer, the signing key or the service credential.
  console.error(`bks-product-bff refused to start: ${(error as Error).message}`);
  process.exit(1);
}
const { app } = createBffApp(config);
const server = serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`bks-product-bff on :${info.port} -> ${config.upstream.url} (session issuer ${config.session.issuer}, actor audience ${config.actor.audience}, ttl ${config.actor.ttlSeconds}s)`);
});
const shutdown = () => server.close(() => process.exit(0));
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
