import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { rawBytesDigest, IngestionIntentV2 } from "@bks/contracts";
import { writeSchema, migrateIntentV1 } from "./dist/index.js";
import { planOffline } from "./dist/write/offline.js";
const s = writeSchema();
const files = []; (function w(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) w(p); else if (/^intent.*\.json$/.test(f)) files.push(p); } })("../../schema/program/final/fixtures");
const P = { principalId: "t", installationId: "i", applicationId: "a", tenantId: "t", grants: [] };
const cat = new Map(); const ex = new Map();
for (const f of files) {
  const b = readFileSync(f); const m = migrateIntentV1(JSON.parse(b), s, { rawBytesDigest: rawBytesDigest(b) });
  const { plan } = planOffline(s, IngestionIntentV2.parse(m.intent), { principal: P, plannedAt: "2026-10-11T00:00:00Z" });
  for (const x of plan.subjects) if (x.disposition !== "create" && x.disposition !== "use_existing") for (const r of x.reasons.slice(0,1)) { const k = x.disposition + " " + r.replace(/:.*/, "") + " " + (r.match(/^REQUIRED_PROPERTY_MISSING: (\w+)/)?.[1] ?? r.match(/^(\w+): (\w+)\./)?.[2] ?? ""); cat.set(k, (cat.get(k) ?? 0) + 1); if (!ex.has(k)) ex.set(k, r.slice(0, 160)); }
}
for (const [k, n] of [...cat].sort((a, b) => b[1] - a[1])) console.log(n, k, "::", ex.get(k));
