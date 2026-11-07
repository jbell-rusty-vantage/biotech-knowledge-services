/**
 * S7 shared boundary on the executor surface (no database): /describe advertises only implemented capabilities and
 * `recovery.atomicCrossStore: false`; the capability descriptor maps the logical knowledge.* interfaces truthfully; the
 * domain admission routes issue executor-verifiable witnesses only after the grant check and fail closed when an
 * authority is unavailable; the committed catalog file and lane mount manifest are self-consistent.
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe as suite, expect, it } from "vitest";
import { canonicalDigest, IngestionIntentV2 } from "@bks/contracts";
import { generateWitnessKeyPair, GraphClient, KnowledgeWriter, MemoryPlanStore, parsePinnedKeys, partialPolicyDigest, verifyWitness, writeSchema } from "@bks/kg-ops";
import { smallIntent } from "../../../packages/kg-ops/dist/write/fixtures-v2.js";
import { planOffline } from "../../../packages/kg-ops/dist/write/offline.js";
import { storedRecordFrom } from "../../../packages/kg-ops/dist/write/test-support.js";
import { createApp } from "./app.js";
import { createContext } from "./context.js";
import { loadModules } from "./modules/loader.js";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "..");
const tmp = mkdtempSync(join(tmpdir(), "bks-s7-boundary-"));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

const scope = { installationId: "inst-s7", applicationId: "biotech", tenantId: "tenant-s7" };
const tokens = JSON.stringify([
  { token: "reader-token", role: "reader", principalId: "r", ...scope },
  { token: "writer-token", role: "writer", principalId: "mc-biotech-adapter", ...scope },
  { token: "admin-token", role: "admin", principalId: "ops", ...scope },
]);
const IMPLEMENTED = new Set(["schema.search", "schema.get", "schema.find", "schema.neighbors", "schema.path", "schema.pattern", "schema.doctor", "schema.context", "schema.slice", "read.typed", "read.typed.v1", "read.templates", "read.cypher", "plan", "apply", "receipt.get", "verifyEffects", "admission.dev", "admission.witness", "admission.revocation", "admission.dispatch", "read.official", "serving.eligibility", "capability.descriptor", "baseline.cypher", "retrieve", "analytics"]);

const schema = writeSchema();
const key = generateWitnessKeyPair("s7-admission");
const grantsPath = join(tmp, "grants.json");
writeFileSync(grantsPath, JSON.stringify({ format: "bks-grant-registry.v1", decisionVersion: "mc-grants/test", grants: [{ grantRef: "grant-run-1", ...scope, principalId: "mc-biotech-adapter", operations: ["knowledge.ingestion_apply"] }] }));

async function appWith(env: Record<string, string>) {
  const client = new GraphClient({ uri: "bolt://127.0.0.1:1", username: "neo4j", password: "unused", database: "neo4j" });
  const plans = new MemoryPlanStore();
  const principal = { principalId: "mc-biotech-adapter", ...scope, grants: [] };
  const intent = IngestionIntentV2.parse(smallIntent(schema.schemaReleaseDigest, "s7b", "a"));
  const { plan, observations } = planOffline(schema, intent, { principal, plannedAt: "2026-10-11T12:00:00Z" });
  await plans.put(storedRecordFrom(plan, { intent, observations, plannedAt: "2026-10-11T12:00:00Z", executorVersion: "test", agentUid: "hu:agent:test", agentName: "test", principal, basis: { kind: "creationOnly", reason: "t", expectAbsent: [], expectPresent: [] } }));
  const ctx = createContext({ ...env } as NodeJS.ProcessEnv, { graph: () => client, writer: () => new KnowledgeWriter(client, { schema, plans, witnessKeys: new Map() }) });
  return { app: createApp(ctx, await loadModules()), client, plan, ctx };
}
const admissionEnv = (over: Record<string, string> = {}) => ({ BKS_EXECUTOR_TOKENS: tokens, BKS_ADMISSION_ENABLED: "1", BKS_WITNESS_SIGNING_KEY: `${key.kid}:${key.privateKeyDer}`, BKS_WITNESS_ISSUER: "bks-admission-test", BKS_ADMISSION_GRANT_SOURCE: `file:${grantsPath}`, BKS_ADMISSION_LEDGER: join(tmp, `ledger-${Math.random().toString(36).slice(2)}.json`), BKS_ADMISSION_LEDGER_CREATE: "1", ...over });
const req = (app: Awaited<ReturnType<typeof appWith>>["app"], method: string, path: string, token: string, body?: unknown) => app.request(path, { method, headers: { "x-api-key": token, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });

suite("S7 boundary: describe, capability descriptor, admission routes", () => {
  it("describe advertises only implemented capabilities; atomicCrossStore is false; admission only when configured", async () => {
    for (const env of [{ BKS_EXECUTOR_TOKENS: tokens }, admissionEnv(), { BKS_EXECUTOR_TOKENS: tokens, BKS_ADMISSION_ENABLED: "1" }]) {
      const { app, client } = await appWith(env);
      const d = (await (await req(app, "GET", "/describe", "admin-token")).json()) as { capabilities: Record<string, { available: boolean }>; recovery: Record<string, unknown> };
      for (const name of Object.keys(d.capabilities)) expect(IMPLEMENTED.has(name), name).toBe(true);
      expect(d.capabilities.retrieve).toEqual({ available: false });
      expect(d.capabilities.analytics).toEqual({ available: false });
      expect(d.recovery.atomicCrossStore).toBe(false);
      const configured = env.BKS_ADMISSION_GRANT_SOURCE !== undefined;
      expect(Boolean(d.capabilities["admission.witness"])).toBe(configured);
      if (!configured) expect((await req(app, "POST", "/kg/admission/witness", "writer-token", {})).status).toBe(404);
      await client.close();
    }
  });

  it("capability descriptor: truthful knowledge.* map, digests, no planned-but-absent capability", async () => {
    const { app, client } = await appWith(admissionEnv());
    const res = await req(app, "GET", "/capability", "reader-token");
    expect(res.status).toBe(200);
    const c = (await res.json()) as Record<string, any>;
    const { descriptorDigest, ...body } = c;
    expect(descriptorDigest).toBe(canonicalDigest(body));
    expect(c.recovery.atomicCrossStore).toBe(false);
    expect(c.release.schemaReleaseDigest).toBe(schema.schemaReleaseDigest);
    expect(c.contracts.envelope.request).toBe("mc.knowledge_request.v1");
    for (const k of ["knowledge.retrieve", "knowledge.capture_prepare", "knowledge.verify", "knowledge.classify_propose", "knowledge.classify_admit"]) expect(c.interfaces[k].available, k).toBe(false);
    for (const k of ["knowledge.describe", "knowledge.ingestion_plan", "knowledge.ingestion_apply", "knowledge.receipt_get", "knowledge.verify_result"]) expect(c.interfaces[k].available, k).toBe(true);
    expect(c.interfaces["knowledge.ingestion_apply"].admission).toBe("POST /kg/admission/witness");
    expect(Object.keys(c.interfaces)).toHaveLength(11);
    const d = (await (await req(app, "GET", "/describe", "admin-token")).json()) as { capabilities: Record<string, unknown> };
    for (const name of Object.keys(c.nativeCapabilities)) expect(d.capabilities[name], name).toBeTruthy();
    expect(JSON.stringify(c)).not.toMatch(/sb_secret|PRIVATE KEY|password/i);
    await client.close();
  });

  it("admission witness: grant checked first, executor-verifiable, bounded lease; roles enforced; fail closed", async () => {
    const { app, client, plan } = await appWith(admissionEnv());
    const ok = await req(app, "POST", "/kg/admission/witness", "writer-token", { planRef: plan.planRef, effectKey: "mc/run-1/ek-1", partialPolicy: "all", grantRef: "grant-run-1", lifetimeSeconds: 30 });
    expect(ok.status).toBe(200);
    const out = (await ok.json()) as { witness: unknown; admission: { semantics: string; lease: { seconds: number }; revocationGeneration: number } };
    expect(out.admission.semantics).toBe("authorization-at-issuance-plus-bounded-lease");
    expect(out.admission.lease.seconds).toBe(30);
    const claims = verifyWitness(out.witness, parsePinnedKeys(`${key.kid}:${key.publicKeyDer}`), { effectKey: "mc/run-1/ek-1", scope, intentDigest: plan.binding.intentDigest, planDigest: plan.planDigest, schemaReleaseDigest: plan.binding.schemaReleaseDigest, evidenceDigest: plan.binding.evidenceDigest, partialPolicyDigest: partialPolicyDigest("all"), policyVersion: plan.binding.policyVersion, nowSeconds: Math.floor(Date.now() / 1000) });
    expect(claims.iss).toBe("bks-admission-test");
    expect((await req(app, "POST", "/kg/admission/witness", "writer-token", { planRef: plan.planRef, effectKey: "mc/run-1/ek-2", partialPolicy: "all", grantRef: "grant-unknown" })).status).toBe(403);
    expect((await req(app, "POST", "/kg/admission/witness", "reader-token", { planRef: plan.planRef, effectKey: "mc/run-1/ek-2", partialPolicy: "all", grantRef: "grant-run-1" })).status).toBe(403);
    expect((await req(app, "POST", "/kg/admission/revocations", "writer-token", { kind: "grant", target: "grant-run-1", reason: "x" })).status).toBe(403);
    const rv = await req(app, "POST", "/kg/admission/revocations", "admin-token", { kind: "grant", target: "grant-run-1", reason: "mission cancelled" });
    expect(((await rv.json()) as { generation: number }).generation).toBe(1);
    const denied = await req(app, "POST", "/kg/admission/witness", "writer-token", { planRef: plan.planRef, effectKey: "mc/run-1/ek-3", partialPolicy: "all", grantRef: "grant-run-1" });
    expect(denied.status).toBe(403);
    // Serving recheck cannot reach the receipt store here (no database): fails closed.
    const elig = await req(app, "GET", "/kg/eligibility?effectKey=mc/run-1/ek-1", "reader-token");
    expect(elig.status).toBe(503);
    expect(((await elig.json()) as { eligible: boolean }).eligible).toBe(false);
    await client.close();
    // Grant authority unavailable: 503 BKS_AUTHORITY_UNAVAILABLE, no witness.
    const down = await appWith(admissionEnv({ BKS_ADMISSION_GRANT_SOURCE: `file:${join(tmp, "missing-grants.json")}` }));
    const r = await req(down.app, "POST", "/kg/admission/witness", "writer-token", { planRef: down.plan.planRef, effectKey: "mc/run-1/ek-4", partialPolicy: "all", grantRef: "grant-run-1" });
    expect(r.status).toBe(503);
    expect(((await r.json()) as { code: string }).code).toBe("BKS_AUTHORITY_UNAVAILABLE");
    await down.client.close();
    // A missing ledger without explicit creation also fails closed.
    const noLedger = await appWith(admissionEnv({ BKS_ADMISSION_LEDGER_CREATE: "0" }));
    expect((await req(noLedger.app, "POST", "/kg/admission/witness", "writer-token", { planRef: noLedger.plan.planRef, effectKey: "mc/run-1/ek-5", partialPolicy: "all", grantRef: "grant-run-1" })).status).toBe(503);
    await noLedger.client.close();
  });

  it("committed catalog file and lane mount manifest are self-consistent (regenerate with apps/executor/scripts/*.mjs)", () => {
    const cap = JSON.parse(readFileSync(resolve(appRoot, "capabilities", "biotech-knowledge.capability.json"), "utf8")) as Record<string, any>;
    const { descriptorDigest, ...body } = cap;
    expect(descriptorDigest).toBe(canonicalDigest(body));
    expect(cap.recovery.atomicCrossStore).toBe(false);
    expect(cap.interfaces["knowledge.retrieve"].available).toBe(false);
    const mount = JSON.parse(readFileSync(resolve(appRoot, "lanes", "workspace-mount.json"), "utf8")) as Record<string, any>;
    const { fingerprint, ...mountBody } = mount;
    expect(fingerprint).toBe(canonicalDigest(mountBody));
    expect(mount.mode).toBe("read-only");
    expect(mount.excluded).toEqual(expect.arrayContaining([".env", "runs/**"]));
    for (const m of mount.mounts as Array<{ path: string; digest: string; access: string }>) {
      expect(m.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(m.access).toBe("read-only");
      expect(m.path).not.toMatch(/(^|\/)\.env|^runs\//);
    }
  });
});
