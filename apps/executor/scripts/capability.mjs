#!/usr/bin/env node
// Writes or checks the catalog capability descriptor for the PRODUCTION profile of the executor (S7):
// service tokens (no local dev), domain admission enabled, v1 reads retired, no baseline Cypher tools.
// No database, no network, no secrets: placeholder token hashes and an unparsed signing-key marker only make the
// modules register; the descriptor never contains configuration values.
//
//   pnpm build && node apps/executor/scripts/capability.mjs write   # apps/executor/capabilities/biotech-knowledge.capability.json
//   node apps/executor/scripts/capability.mjs check                 # exit 1 on drift
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GraphClient } from "@bks/kg-ops";
import { createContext } from "../dist/context.js";
import { loadModules } from "../dist/modules/loader.js";
import { buildCapabilityDescriptor } from "../dist/modules/capability.js";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "..", "capabilities", "biotech-knowledge.capability.json");
const profile = {
  BKS_EXECUTOR_TOKENS: JSON.stringify([{ tokenSha256: "0".repeat(64), role: "writer", principalId: "catalog-profile", installationId: "catalog", applicationId: "biotech", tenantId: "catalog" }]),
  BKS_ADMISSION_ENABLED: "1",
  BKS_WITNESS_SIGNING_KEY: "catalog-profile:not-a-key",
  BKS_ADMISSION_GRANT_SOURCE: "https://mission-control.invalid/grants",
  BKS_DISABLE_READ_V1: "1",
};
const client = new GraphClient({ uri: "bolt://127.0.0.1:1", username: "neo4j", password: "unused", database: "neo4j" });
const ctx = createContext(profile, { graph: () => client });
const descriptor = buildCapabilityDescriptor(ctx, await loadModules(resolve(here, "..", "dist", "modules")));
await client.close();
const text = `${JSON.stringify(descriptor, null, 2)}\n`;
const mode = process.argv[2] ?? "check";
if (mode === "write") {
  writeFileSync(out, text);
  console.log(`wrote ${out} ${descriptor.descriptorDigest}`);
} else {
  let current = "";
  try { current = readFileSync(out, "utf8"); } catch { /* missing */ }
  if (current !== text) {
    console.error(`capability descriptor drift: ${out} != generated ${descriptor.descriptorDigest} (run: node apps/executor/scripts/capability.mjs write)`);
    process.exit(1);
  }
  console.log(`capability descriptor current ${descriptor.descriptorDigest}`);
}
