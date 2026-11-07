/**
 * S7 admission + revocation races on a real disposable Neo4j (never Aura). Skipped unless BKS_INTEGRATION=1.
 *
 *   BKS_NEO4J_TEST_CONTAINER=bks-neo4j-s7 BKS_NEO4J_TEST_BOLT_PORT=7704 BKS_NEO4J_TEST_HTTP_PORT=7504 bash scripts/neo4j-test.sh up
 *   BKS_INTEGRATION=1 NEO4J_TEST_URI=bolt://127.0.0.1:7704 NEO4J_TEST_PASSWORD=bks-test-password \
 *     pnpm exec vitest run --project kg-ops src/admission/admission.integration.test.ts
 *
 * SPECIFICATION 7.2 test list: revocation before witness, after witness / before commit (delivered vs not yet
 * delivered = bounded lease), after commit (serving recheck denies, history kept), delayed delivery, expired witness,
 * at-least-once delivery with a crash between graph write and ledger update, fence regression reconciliation; plus
 * the knowledge-artifacts PlanStore adapter used by the real writer (local Storage emulation, no remote call).
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { IngestionPlanV2, PartialPolicy } from "@bks/contracts";
import { getReceiptV2 } from "../apply.js";
import { FileSnapshotCustody, FileVerificationCustody, MemoryPlanStore } from "../custody.js";
import { ensureOperationalState, installReleaseMarker, readFence } from "../fence.js";
import { GraphClient, toJson } from "../neo4j.js";
import { generateWitnessKeyPair, parsePinnedKeys } from "../witness.js";
import { smallIntent } from "../write/fixtures-v2.js";
import { KnowledgeWriter, writeSchema } from "../write/service.js";
import { PRINCIPALS } from "../write/test-support.js";
import { ContentAddressedArtifacts, LocalObjectStore, SupabasePlanStore } from "./custody-supabase.js";
import { FileAdmissionLedger } from "./ledger.js";
import { AdmissionService } from "./service.js";
import { MemoryGrantSource } from "./sources.js";

const enabled = process.env.BKS_INTEGRATION === "1";
const d = enabled ? describe : describe.skip;
const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..", "..", "..", "..");
const URI = process.env.NEO4J_TEST_URI ?? "bolt://127.0.0.1:7704";
const PASSWORD = process.env.NEO4J_TEST_PASSWORD ?? "bks-test-password";
const evidenceDir = resolve(repo, "runs", "release-v2", "custody", "s7");
const stamp = `s7${Date.now().toString(36)}`;
const evidence: Array<{ test: string; result: string; detail?: unknown }> = [];
const record = (test: string, result: string, detail?: unknown) => evidence.push({ test, result, ...(detail === undefined ? {} : { detail }) });

function assertLocal(uri: string): void {
  const host = new URL(uri.replace(/^(bolt|neo4j)(\+s|\+ssc)?:/, "http:")).hostname;
  if (!["127.0.0.1", "localhost", "::1"].includes(host)) throw new Error(`refusing to run S7 integration against non-local Neo4j ${uri}`);
}

d("S7 admission, revocation delivery and serving rechecks on a real Neo4j", () => {
  const client = enabled ? new GraphClient({ uri: URI, username: "neo4j", password: PASSWORD, database: "neo4j" }) : (null as unknown as GraphClient);
  const schema = writeSchema();
  const R = schema.schemaReleaseDigest;
  const P = PRINCIPALS.writer;
  const key = generateWitnessKeyPair("s7-admission");
  const tmp = mkdtempSync(join(tmpdir(), "bks-s7-int-"));
  const plans = new SupabasePlanStore(new ContentAddressedArtifacts(new LocalObjectStore(join(tmp, "knowledge-artifacts")), `bks/${P.installationId}/${P.applicationId}`));
  const grants = new MemoryGrantSource([{ grantRef: "grant-s7", installationId: P.installationId, applicationId: P.applicationId, tenantId: P.tenantId, principalId: P.principalId, operations: ["knowledge.ingestion_apply"] }]);
  let writer: KnowledgeWriter;
  let svc: AdmissionService;
  let now = new Date();

  beforeAll(async () => {
    assertLocal(URI);
    await client.verify();
    await client.write((tx) => tx.run("MATCH (n) DETACH DELETE n"));
    await ensureOperationalState(client, schema);
    await installReleaseMarker(client, { releaseId: schema.releaseId, schemaReleaseDigest: R }, `s7-${stamp}`);
    writer = new KnowledgeWriter(client, { schema, plans, snapshots: new FileSnapshotCustody(join(tmp, "snapshots")), verifications: new FileVerificationCustody(join(tmp, "verifications"), new Map()), witnessKeys: parsePinnedKeys(`${key.kid}:${key.publicKeyDer}`), signer: null, authority: null, localDev: false, now: () => now });
    svc = new AdmissionService({ issuer: "bks-admission-s7", signer: { kid: key.kid, key: key.privateKey }, grants, evidence: null, ledger: new FileAdmissionLedger(join(tmp, "ledger.json"), { create: true }), plans, now: () => now });
    mkdirSync(evidenceDir, { recursive: true });
  });
  afterAll(async () => {
    writeFileSync(resolve(evidenceDir, `admission-integration-${stamp}.json`), `${JSON.stringify({ stamp, uri: URI, releaseDigest: R, finishedAt: new Date().toISOString(), evidence }, null, 2)}\n`);
    await client?.close();
    rmSync(tmp, { recursive: true, force: true });
  });

  const applyReq = (plan: IngestionPlanV2, effectKey: string, witness: unknown, partialPolicy: PartialPolicy = "all") => ({ schemaVersion: "biotech-knowledge-apply.v2", planRef: plan.planRef, expectedPlanDigest: plan.planDigest, intentDigest: plan.binding.intentDigest, effectKey, partialPolicy, witness });
  const fenceGen = async () => (await client.read((tx) => readFence(tx)))!.revocationGeneration;
  const markerCount = async (effectKey: string) => Number(toJson((await client.read((tx) => tx.run("MATCH (m:KsIntentMarker {effectKey: $k, status: 'applied'}) RETURN count(m)", { k: effectKey }))).records[0]!.get(0)));

  it("plans are stored content-addressed in knowledge-artifacts custody and applied by the real writer", async () => {
    now = new Date();
    const plan = await writer.plan(smallIntent(R, stamp, "a"), P);
    expect(plan.outcome).toBe("applicable");
    expect((await plans.get(plan.planRef))?.plan.planDigest).toBe(plan.planDigest);
    const { witness } = await svc.issue({ planRef: plan.planRef, effectKey: `ek-${stamp}-a`, partialPolicy: "all", grantRef: "grant-s7", principal: P });
    const r = await writer.apply(applyReq(plan, `ek-${stamp}-a`, witness), P);
    expect(r.outcome, JSON.stringify(r.failure)).toBe("applied");
    expect((await svc.isCurrentlyEligible(`ek-${stamp}-a`, P, { receipt: (k) => getReceiptV2(client, P, k) })).code).toBe("ELIGIBLE");
    record("supabase-plan-store-apply", "pass", { planRef: plan.planRef, receiptId: r.receiptId });
  });

  it("revocation before witness: refused at issuance", async () => {
    const plan = await writer.plan(smallIntent(R, stamp, "b"), P);
    await svc.revoke({ kind: "effect", target: `ek-${stamp}-b`, scope: P, reason: "revoked before admission" });
    await expect(svc.issue({ planRef: plan.planRef, effectKey: `ek-${stamp}-b`, partialPolicy: "all", grantRef: "grant-s7", principal: P })).rejects.toMatchObject({ code: "BKS_FORBIDDEN_SCOPE" });
    record("revocation-before-witness", "pass");
  });

  it("revocation after witness, not yet delivered: the bounded lease lets the in-flight witness commit; serving denies it", async () => {
    const plan = await writer.plan(smallIntent(R, stamp, "c"), P);
    const { witness, claims } = await svc.issue({ planRef: plan.planRef, effectKey: `ek-${stamp}-c`, partialPolicy: "all", grantRef: "grant-s7", principal: P });
    await svc.revoke({ kind: "effect", target: `ek-${stamp}-c`, scope: P, reason: "revoked during the lease" });
    expect(await fenceGen()).toBeLessThan((await svc.opts.ledger.read()).generation); // delivery delayed
    const r = await writer.apply(applyReq(plan, `ek-${stamp}-c`, witness), P);
    expect(r.outcome).toBe("applied"); // authorization at issuance plus bounded lease: NOT atomic cross-store revocation
    expect(r.witness?.revocationGeneration).toBe(claims.revocationGeneration);
    const e = await svc.isCurrentlyEligible(`ek-${stamp}-c`, P, { receipt: (k) => getReceiptV2(client, P, k) });
    expect(e).toMatchObject({ eligible: false, code: "EFFECT_REVOKED", receipt: { found: true, status: "applied" } });
    record("revocation-after-witness-undelivered", "pass", { applied: r.receiptId, serving: e.code, historyRetained: e.receipt });
  });

  it("revocation delivered before commit: the executor refuses the older witness (BKS_WITNESS_REVOKED); at-least-once delivery survives a crash", async () => {
    const plan = await writer.plan(smallIntent(R, stamp, "d"), P);
    const { witness } = await svc.issue({ planRef: plan.planRef, effectKey: `ek-${stamp}-d`, partialPolicy: "all", grantRef: "grant-s7", principal: P });
    await svc.revoke({ kind: "principal", target: "someone-else", scope: P, reason: "unrelated principal revoked (any delivery bumps the fence)" });
    // Crash between the graph write and the ledger update: the graph has the generation, the outbox still says pending.
    await expect(svc.deliverRevocations(client, { afterGraphWrite: () => { throw new Error("simulated crash after graph delivery"); } })).rejects.toThrow(/simulated crash/);
    const ledger = await svc.opts.ledger.read();
    expect(ledger.outbox.filter((o) => !o.deliveredAt).length).toBeGreaterThan(0);
    expect(await fenceGen()).toBe(ledger.generation);
    // Redelivery is idempotent (max-monotonic) and settles the outbox.
    const again = await svc.deliverRevocations(client);
    expect(again.pending).toEqual([]);
    expect(again.fenceGeneration).toBe(ledger.generation);
    const r = await writer.apply(applyReq(plan, `ek-${stamp}-d`, witness), P);
    expect(r.outcome).toBe("failed");
    expect(r.failure?.code).toBe("BKS_WITNESS_REVOKED");
    expect(await markerCount(`ek-${stamp}-d`)).toBe(0);
    // A fresh witness (current generation) for the same effect applies.
    const fresh = await svc.issue({ planRef: plan.planRef, effectKey: `ek-${stamp}-d`, partialPolicy: "all", grantRef: "grant-s7", principal: P });
    expect((await writer.apply(applyReq(plan, `ek-${stamp}-d`, fresh.witness), P)).outcome).toBe("applied");
    record("revocation-delivered-before-commit", "pass", { refused: r.failure?.code, redelivered: again.delivered });
  });

  it("revocation after commit: history and receipt retained, serving denied; grant revocation covers every effect it admitted", async () => {
    const plan = await writer.plan(smallIntent(R, stamp, "e"), P);
    const { witness } = await svc.issue({ planRef: plan.planRef, effectKey: `ek-${stamp}-e`, partialPolicy: "all", grantRef: "grant-s7", principal: P });
    expect((await writer.apply(applyReq(plan, `ek-${stamp}-e`, witness), P)).outcome).toBe("applied");
    await svc.revoke({ kind: "grant", target: "grant-s7", scope: P, reason: "mission grant revoked after commit" });
    await svc.deliverRevocations(client);
    for (const k of [`ek-${stamp}-a`, `ek-${stamp}-e`]) {
      const e = await svc.isCurrentlyEligible(k, P, { receipt: (x) => getReceiptV2(client, P, x) });
      expect(e.code, k).toBe("GRANT_REVOKED");
      expect(e.receipt?.status).toBe("applied");
      expect(await markerCount(k)).toBe(1);
    }
    record("revocation-after-commit", "pass");
  });

  it("expired witness is refused; fence regression is reconciled by redelivery", async () => {
    grants.grants.set("grant-s7b", { grantRef: "grant-s7b", installationId: P.installationId, applicationId: P.applicationId, tenantId: P.tenantId, principalId: P.principalId, operations: ["knowledge.ingestion_apply"] });
    const plan = await writer.plan(smallIntent(R, stamp, "f"), P);
    const t0 = new Date();
    now = t0;
    const { witness } = await svc.issue({ planRef: plan.planRef, effectKey: `ek-${stamp}-f`, partialPolicy: "all", grantRef: "grant-s7b", principal: P, lifetimeSeconds: 5 });
    now = new Date(t0.getTime() + 10_000);
    await expect(writer.apply(applyReq(plan, `ek-${stamp}-f`, witness), P)).rejects.toMatchObject({ code: "BKS_WITNESS_EXPIRED" });
    now = new Date();
    // Simulate a restored graph whose fence generation went backwards.
    const ledgerGen = (await svc.opts.ledger.read()).generation;
    await client.write((tx) => tx.run("MATCH (r:KsRevocationFence {id: 'canonical'}) SET r.generation = 0"));
    const rep = await svc.reconcile(client);
    expect(rep.regressed.length).toBeGreaterThan(0);
    expect(rep.inSync).toBe(true);
    expect(await fenceGen()).toBe(ledgerGen);
    record("expired-witness-and-fence-regression", "pass", { regressed: rep.regressed.length, fence: rep.fenceGeneration });
  });
});
