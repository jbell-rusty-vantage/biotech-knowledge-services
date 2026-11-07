/**
 * knowledge-artifacts custody (S7, OD-14) against a LOCAL emulation of the Supabase Storage REST API (the project's
 * bucket does not exist yet; no remote call is made here). Exercises the real SupabaseStorageObjectStore HTTP code path:
 * create-if-absent with x-upsert false, authenticated reads, secret-key headers, content-addressed keys, digest checks
 * before use, immutable planRef index, snapshot verification, and tamper detection.
 */
import { createServer, type Server } from "node:http";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CUSTODY_SNAPSHOT_V1, IngestionIntentV2, rawBytesDigest } from "@bks/contracts";
import { smallIntent } from "../write/fixtures-v2.js";
import { planOffline } from "../write/offline.js";
import { writeSchema } from "../write/service.js";
import { PRINCIPALS, storedRecordFrom } from "../write/test-support.js";
import { ContentAddressedArtifacts, LocalObjectStore, SupabasePlanStore, SupabaseSnapshotCustody, SupabaseStorageObjectStore } from "./custody-supabase.js";

const SECRET = "sb_secret_local-emulator-only";
const objects = new Map<string, Buffer>();
const requests: Array<{ method: string; path: string; auth: boolean; upsert: string | undefined }> = [];
let server: Server;
let url = "";

beforeAll(async () => {
  server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => {
      const path = decodeURIComponent((req.url ?? "").split("?")[0]!);
      const auth = req.headers.apikey === SECRET && req.headers.authorization === `Bearer ${SECRET}`;
      requests.push({ method: req.method ?? "", path, auth, upsert: req.headers["x-upsert"] as string | undefined });
      const send = (status: number, body: unknown) => {
        res.writeHead(status, { "content-type": "application/json" });
        res.end(JSON.stringify(body));
      };
      if (!auth) return send(400, { statusCode: "403", error: "Unauthorized", message: "invalid key" });
      if (req.method === "GET" && path === "/storage/v1/bucket/knowledge-artifacts") return send(200, { id: "knowledge-artifacts", name: "knowledge-artifacts", public: false });
      if (req.method === "GET" && path.startsWith("/storage/v1/bucket/")) return send(400, { statusCode: "404", error: "Bucket not found", message: "Bucket not found" });
      let m = /^\/storage\/v1\/object\/knowledge-artifacts\/(.+)$/.exec(path);
      if (req.method === "POST" && m) {
        if (objects.has(m[1]!) && req.headers["x-upsert"] !== "true") return send(400, { statusCode: "409", error: "Duplicate", message: "The resource already exists" });
        objects.set(m[1]!, Buffer.concat(chunks));
        return send(200, { Key: `knowledge-artifacts/${m[1]}` });
      }
      m = /^\/storage\/v1\/object\/authenticated\/knowledge-artifacts\/(.+)$/.exec(path);
      if (req.method === "GET" && m) {
        const o = objects.get(m[1]!);
        if (!o) return send(400, { statusCode: "404", error: "not_found", message: "Object not found" });
        res.writeHead(200, { "content-type": "application/octet-stream" });
        return res.end(o);
      }
      send(404, { error: "route" });
    });
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", () => r()));
  const addr = server.address() as { port: number };
  url = `http://127.0.0.1:${addr.port}`;
});
afterAll(() => new Promise<void>((r) => server.close(() => r())));

const schema = writeSchema();
const R = schema.schemaReleaseDigest;
const P = PRINCIPALS.writer;
const tmp = mkdtempSync(join(tmpdir(), "bks-s7-custody-"));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

function planRecord(label: string) {
  const intent = IngestionIntentV2.parse(smallIntent(R, "s7c", label));
  const { plan, observations } = planOffline(schema, intent, { principal: P, plannedAt: "2026-10-11T12:00:00Z" });
  return storedRecordFrom(plan, { intent, observations, plannedAt: "2026-10-11T12:00:00Z", executorVersion: "test", agentUid: "hu:agent:test", agentName: "test", principal: P, basis: { kind: "creationOnly", reason: "t", expectAbsent: [], expectPresent: [] } });
}

describe("knowledge-artifacts custody adapter (Supabase Storage API, local emulation)", () => {
  it("verifies the private bucket read-only and refuses a wrong key", async () => {
    const store = new SupabaseStorageObjectStore({ url, secretKey: SECRET });
    expect(await store.verifyBucket()).toEqual({ exists: true, public: false, status: 200 });
    expect((await new SupabaseStorageObjectStore({ url, secretKey: SECRET, bucket: "absent" }).verifyBucket()).exists).toBe(false);
    await expect(new SupabaseStorageObjectStore({ url, secretKey: "wrong" }).putIfAbsent("x/y", Buffer.from("z"), "text/plain")).rejects.toMatchObject({ code: "BKS_AUTHORITY_UNAVAILABLE" });
    expect(store.location).not.toContain(SECRET);
  });

  it("stores plans content-addressed and immutable; reads verify digests; KnowledgeWriter-compatible PlanStore", async () => {
    const artifacts = new ContentAddressedArtifacts(new SupabaseStorageObjectStore({ url, secretKey: SECRET }), "bks/local-test/bks-gate-b");
    const plans = new SupabasePlanStore(artifacts);
    const rec = planRecord("p1");
    await plans.put(rec);
    await plans.put(rec); // identical re-put is a no-op
    const back = await plans.get(rec.plan.planRef);
    expect(back?.plan.planDigest).toBe(rec.plan.planDigest);
    const keys = [...objects.keys()].filter((k) => k.includes("/plans/"));
    expect(keys.some((k) => /\/plans\/sha256\/[0-9a-f]{2}\/[0-9a-f]{64}$/.test(k))).toBe(true);
    expect(keys.some((k) => k.endsWith(`/plans/by-ref/${rec.plan.planRef}.json`))).toBe(true);
    expect(requests.filter((r) => r.method === "POST").every((r) => r.upsert === "false")).toBe(true);
    // A different plan under the same planRef is refused (immutability).
    const forged = { ...rec, plan: { ...rec.plan, planDigest: `sha256:${"0".repeat(64)}` } };
    await expect(plans.put(forged)).rejects.toMatchObject({ code: "BKS_PLAN_FORGED" });
    // Tampered object bytes are detected before use.
    const objKey = keys.find((k) => /\/plans\/sha256\//.test(k))!;
    objects.set(objKey, Buffer.concat([objects.get(objKey)!, Buffer.from(" ")]));
    await expect(plans.get(rec.plan.planRef)).rejects.toMatchObject({ code: "BKS_EVIDENCE_UNVERIFIED" });
    expect(await plans.get("pl-absent")).toBeNull();
  });

  it("snapshot custody: bytes + record content-addressed, issuer/scope/release checks as in FileSnapshotCustody", async () => {
    const custody = new SupabaseSnapshotCustody(new ContentAddressedArtifacts(new SupabaseStorageObjectStore({ url, secretKey: SECRET }), "bks/local-test/bks-gate-b"), ["bks-read-service"]);
    const bytes = Buffer.from(JSON.stringify({ rows: [{ uid: "hu:organization:x" }] }));
    const record = { format: CUSTODY_SNAPSHOT_V1, ref: "snap-s7-1", bytesDigest: rawBytesDigest(bytes), issuer: "bks-read-service", scope: { installationId: P.installationId, applicationId: P.applicationId, tenantId: P.tenantId }, pins: { schemaReleaseDigest: R }, consistency: { mode: "stable_revision" as const, graphRevision: 3, bookmarks: [] }, dependencies: { complete: true, nodes: [] }, createdAt: "2026-10-11T12:00:00Z" };
    await custody.put(record, bytes);
    const expectOk = { scope: record.scope, schemaReleaseDigest: R };
    expect((await custody.verify("snap-s7-1", record.bytesDigest, expectOk)).consistency.graphRevision).toBe(3);
    await expect(custody.verify("snap-s7-1", `sha256:${"1".repeat(64)}`, expectOk)).rejects.toMatchObject({ code: "BKS_SNAPSHOT_UNVERIFIED" });
    await expect(custody.verify("snap-s7-1", record.bytesDigest, { ...expectOk, scope: { ...record.scope, tenantId: "tenant-b" } })).rejects.toMatchObject({ code: "BKS_FORBIDDEN_SCOPE" });
    await expect(custody.verify("snap-s7-1", record.bytesDigest, { ...expectOk, schemaReleaseDigest: `sha256:${"2".repeat(64)}` })).rejects.toMatchObject({ code: "BKS_RELEASE_MISMATCH" });
    await expect(custody.put({ ...record, bytesDigest: `sha256:${"3".repeat(64)}` }, bytes)).rejects.toMatchObject({ code: "BKS_SNAPSHOT_UNVERIFIED" });
  });

  it("the local filesystem emulation has the same create-if-absent and verification semantics", async () => {
    const artifacts = new ContentAddressedArtifacts(new LocalObjectStore(join(tmp, "objects")), "bks/local");
    const a = await artifacts.put("receipts", Buffer.from("receipt-1"));
    const again = await artifacts.put("receipts", Buffer.from("receipt-1"));
    expect(again).toMatchObject({ digest: a.digest, existed: true });
    writeFileSync(join(tmp, "objects", a.key), "altered");
    await expect(artifacts.getVerified("receipts", a.digest)).rejects.toMatchObject({ code: "BKS_EVIDENCE_UNVERIFIED" });
    expect(() => new ContentAddressedArtifacts(new LocalObjectStore(tmp), "../escape")).toThrow();
  });
});
