import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { BksServiceError, canonicalize, CustodySnapshotRecord, rawBytesDigest } from "@bks/contracts";
import type { PlanStore, SnapshotCustody, StoredPlanRecord } from "../custody.js";

/**
 * Supabase Storage `knowledge-artifacts` custody (OD-14, SPECIFICATION 8): immutable, content-addressed objects for
 * plans, read snapshots and receipts behind the S3 `PlanStore` / `SnapshotCustody` interfaces.
 *
 *  - Object keys are content addressed: `<prefix>/<kind>/sha256/<hh>/<hex>` where hex = sha256 of the exact stored bytes.
 *    Reference indexes (`<prefix>/<kind>/by-ref/<ref>.json`) map an opaque ref to its object digest; both are written
 *    with `x-upsert: false`, so an existing key is never overwritten (an identical re-put is a no-op, a different body
 *    is refused as tampering / BKS_PLAN_FORGED).
 *  - Every read recomputes the digest of the fetched bytes before use; signed URLs are never the custody record (the
 *    store reads through the authenticated object endpoint with a server-side key).
 *  - `prefix` scopes custody per installation/application (app-scoped bucket, OD-14).
 *
 * STATUS (2026-10-12): the Biotech Supabase project has NO `knowledge-artifacts` bucket (read-only listing returned an
 * empty bucket list; evidence runs/release-v2/custody/s7/supabase-bucket-probe.json). The adapter is exercised against
 * the local HTTP emulation of the Storage API in custody-supabase.test.ts and against `LocalObjectStore`; it is not
 * wired as the executor's default custody (the executor keeps its file stores until the bucket exists).
 */

export const KNOWLEDGE_ARTIFACTS_BUCKET = "knowledge-artifacts";

export interface ObjectStore {
  readonly location: string;
  /** Creates the object if absent. Never overwrites: returns `existed: true` and leaves the stored bytes unchanged. */
  putIfAbsent(key: string, bytes: Uint8Array, contentType: string): Promise<{ existed: boolean }>;
  get(key: string): Promise<Uint8Array | null>;
}

const KEY_RE = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,900}$/;
function checkKey(key: string): string {
  if (!KEY_RE.test(key) || key.includes("..") || key.includes("//")) throw new BksServiceError("BKS_PARSE_REJECTED", `invalid custody object key ${key}`);
  return key;
}

/** Filesystem emulation of the Storage semantics used here (create-if-absent, read). */
export class LocalObjectStore implements ObjectStore {
  readonly location: string;
  constructor(readonly root: string) {
    this.location = `local:${root}`;
  }
  async putIfAbsent(key: string, bytes: Uint8Array): Promise<{ existed: boolean }> {
    const path = resolve(this.root, checkKey(key));
    if (existsSync(path)) return { existed: true };
    mkdirSync(dirname(path), { recursive: true });
    const tmp = `${path}.${process.pid}.${Date.now()}.tmp`;
    writeFileSync(tmp, bytes);
    if (existsSync(path)) return { existed: true };
    renameSync(tmp, path);
    return { existed: false };
  }
  async get(key: string): Promise<Uint8Array | null> {
    const path = resolve(this.root, checkKey(key));
    return existsSync(path) ? new Uint8Array(readFileSync(path)) : null;
  }
}

/**
 * Supabase Storage REST client for one private bucket. Auth uses the server-side secret key from the environment
 * (`BKS_BIOTECH_DB_URL`, `BKS_BIOTECH_DB_SECRET_KEY`); the key is never logged, returned or put into an artifact.
 */
export class SupabaseStorageObjectStore implements ObjectStore {
  readonly location: string;
  private readonly base: string;
  constructor(private readonly cfg: { url: string; secretKey: string; bucket?: string; fetch?: typeof fetch; timeoutMs?: number }) {
    this.base = cfg.url.replace(/\/$/, "");
    this.location = `supabase:${new URL(this.base).hostname.split(".")[0]}/${this.bucket}`;
  }

  static fromEnv(env: NodeJS.ProcessEnv = process.env, bucket = KNOWLEDGE_ARTIFACTS_BUCKET): SupabaseStorageObjectStore {
    if (!env.BKS_BIOTECH_DB_URL || !env.BKS_BIOTECH_DB_SECRET_KEY) throw new BksServiceError("BKS_AUTHORITY_UNAVAILABLE", "BKS_BIOTECH_DB_URL / BKS_BIOTECH_DB_SECRET_KEY are not configured for knowledge-artifacts custody");
    return new SupabaseStorageObjectStore({ url: env.BKS_BIOTECH_DB_URL, secretKey: env.BKS_BIOTECH_DB_SECRET_KEY, bucket });
  }

  get bucket(): string {
    return this.cfg.bucket ?? KNOWLEDGE_ARTIFACTS_BUCKET;
  }

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    return { apikey: this.cfg.secretKey, authorization: `Bearer ${this.cfg.secretKey}`, ...extra };
  }

  private async call(path: string, init: RequestInit): Promise<Response> {
    try {
      return await (this.cfg.fetch ?? fetch)(`${this.base}${path}`, { ...init, signal: AbortSignal.timeout(this.cfg.timeoutMs ?? 15_000) });
    } catch (e) {
      throw new BksServiceError("BKS_AUTHORITY_UNAVAILABLE", `knowledge-artifacts custody unreachable (${this.location}): ${(e as Error).name}`);
    }
  }

  /** Read-only verification that the private bucket exists (GET /storage/v1/bucket/<id>). */
  async verifyBucket(): Promise<{ exists: boolean; public: boolean | null; status: number }> {
    const res = await this.call(`/storage/v1/bucket/${encodeURIComponent(this.bucket)}`, { method: "GET", headers: this.headers() });
    if (res.status === 200) {
      const body = (await res.json().catch(() => ({}))) as { public?: boolean };
      return { exists: true, public: body.public ?? null, status: 200 };
    }
    return { exists: false, public: null, status: res.status };
  }

  async putIfAbsent(key: string, bytes: Uint8Array, contentType: string): Promise<{ existed: boolean }> {
    const res = await this.call(`/storage/v1/object/${encodeURIComponent(this.bucket)}/${checkKey(key)}`, { method: "POST", headers: this.headers({ "content-type": contentType, "x-upsert": "false", "cache-control": "max-age=31536000, immutable" }), body: bytes });
    if (res.status === 200 || res.status === 201) return { existed: false };
    const text = await res.text().catch(() => "");
    // Storage reports an existing key as 409 (or 400 with "Duplicate"/"already exists"); never overwrite.
    if (res.status === 409 || /duplicate|already exists/i.test(text)) return { existed: true };
    throw new BksServiceError("BKS_AUTHORITY_UNAVAILABLE", `knowledge-artifacts put ${key} failed with ${res.status}`);
  }

  async get(key: string): Promise<Uint8Array | null> {
    const res = await this.call(`/storage/v1/object/authenticated/${encodeURIComponent(this.bucket)}/${checkKey(key)}`, { method: "GET", headers: this.headers() });
    if (res.status === 200) return new Uint8Array(await res.arrayBuffer());
    if (res.status === 404 || res.status === 400) return null;
    throw new BksServiceError("BKS_AUTHORITY_UNAVAILABLE", `knowledge-artifacts get ${key} failed with ${res.status}`);
  }
}

const hexOf = (digest: string) => digest.slice("sha256:".length);
const REF_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/;
const refKey = (ref: string) => {
  if (!REF_RE.test(ref)) throw new BksServiceError("BKS_PLAN_NOT_FOUND", `invalid ref ${ref}`);
  return ref.replace(/:/g, "_");
};

/** Content-addressed immutable artifacts over any ObjectStore, with digest verification on every read. */
export class ContentAddressedArtifacts {
  constructor(readonly store: ObjectStore, readonly prefix: string) {
    checkKey(prefix);
  }

  keyFor(kind: string, digest: string): string {
    const hex = hexOf(digest);
    return `${this.prefix}/${kind}/sha256/${hex.slice(0, 2)}/${hex}`;
  }

  /** Stores exact bytes; returns their digest and key. A pre-existing object must hold the same bytes. */
  async put(kind: string, bytes: Uint8Array, contentType = "application/octet-stream"): Promise<{ digest: string; key: string; existed: boolean }> {
    const digest = rawBytesDigest(bytes);
    const key = this.keyFor(kind, digest);
    const { existed } = await this.store.putIfAbsent(key, bytes, contentType);
    if (existed) await this.getVerified(kind, digest);
    return { digest, key, existed };
  }

  /** Fetches and verifies; altered or missing bytes are refused (never used unverified). */
  async getVerified(kind: string, digest: string): Promise<Uint8Array> {
    const bytes = await this.store.get(this.keyFor(kind, digest));
    if (!bytes) throw new BksServiceError("BKS_EVIDENCE_UNVERIFIED", `custody object ${kind} ${digest} is missing`);
    if (rawBytesDigest(bytes) !== digest) throw new BksServiceError("BKS_EVIDENCE_UNVERIFIED", `custody object ${kind} ${digest} bytes were altered`);
    return bytes;
  }

  async putIndex(kind: string, ref: string, body: Record<string, unknown>): Promise<{ existed: boolean; current: Record<string, unknown> }> {
    const key = `${this.prefix}/${kind}/by-ref/${refKey(ref)}.json`;
    const bytes = Buffer.from(canonicalize(body), "utf8");
    const { existed } = await this.store.putIfAbsent(key, bytes, "application/json");
    if (!existed) return { existed, current: body };
    const prior = await this.store.get(key);
    return { existed, current: prior ? (JSON.parse(Buffer.from(prior).toString("utf8")) as Record<string, unknown>) : {} };
  }

  async getIndex(kind: string, ref: string): Promise<Record<string, unknown> | null> {
    const bytes = await this.store.get(`${this.prefix}/${kind}/by-ref/${refKey(ref)}.json`);
    return bytes ? (JSON.parse(Buffer.from(bytes).toString("utf8")) as Record<string, unknown>) : null;
  }
}

/** PlanStore over knowledge-artifacts: plan record bytes content-addressed, `planRef` index immutable. */
export class SupabasePlanStore implements PlanStore {
  constructor(readonly artifacts: ContentAddressedArtifacts) {}

  async put(record: StoredPlanRecord): Promise<void> {
    const bytes = Buffer.from(canonicalize(record), "utf8");
    const { digest, key } = await this.artifacts.put("plans", bytes, "application/json");
    const idx = await this.artifacts.putIndex("plans", record.plan.planRef, { format: "bks-custody-index.v1", ref: record.plan.planRef, planDigest: record.plan.planDigest, recordDigest: digest, key });
    if (idx.existed && idx.current.planDigest !== record.plan.planDigest) throw new BksServiceError("BKS_PLAN_FORGED", `planRef ${record.plan.planRef} already stores a different plan`);
  }

  async get(planRef: string): Promise<StoredPlanRecord | null> {
    const idx = await this.artifacts.getIndex("plans", planRef);
    if (!idx) return null;
    const bytes = await this.artifacts.getVerified("plans", String(idx.recordDigest));
    const record = JSON.parse(Buffer.from(bytes).toString("utf8")) as StoredPlanRecord;
    if (record.plan.planRef !== planRef || record.plan.planDigest !== idx.planDigest) throw new BksServiceError("BKS_PLAN_FORGED", `custody index for ${planRef} does not match its record`);
    return record;
  }
}

/** SnapshotCustody over knowledge-artifacts with the same checks as FileSnapshotCustody. */
export class SupabaseSnapshotCustody implements SnapshotCustody {
  constructor(readonly artifacts: ContentAddressedArtifacts, readonly trustedIssuers: string[] = (process.env.BKS_SNAPSHOT_ISSUERS ?? "bks-read-service,bks-executor").split(",").map((s) => s.trim()).filter(Boolean)) {}

  async put(record: CustodySnapshotRecord, bytes: Uint8Array): Promise<CustodySnapshotRecord> {
    const parsed = CustodySnapshotRecord.parse(record);
    if (rawBytesDigest(bytes) !== parsed.bytesDigest) throw new BksServiceError("BKS_SNAPSHOT_UNVERIFIED", "snapshot bytes do not match bytesDigest");
    await this.artifacts.put("snapshots", bytes, "application/octet-stream");
    const recordBytes = Buffer.from(canonicalize(parsed), "utf8");
    const rec = await this.artifacts.put("snapshot-records", recordBytes, "application/json");
    const idx = await this.artifacts.putIndex("snapshots", parsed.ref, { format: "bks-custody-index.v1", ref: parsed.ref, bytesDigest: parsed.bytesDigest, recordDigest: rec.digest });
    if (idx.existed && idx.current.recordDigest !== rec.digest) throw new BksServiceError("BKS_SNAPSHOT_UNVERIFIED", `snapshot ref ${parsed.ref} already holds a different record`);
    return parsed;
  }

  async verify(ref: string, digest: string, expect: { scope: { installationId: string; applicationId: string; tenantId: string }; schemaReleaseDigest: string }): Promise<CustodySnapshotRecord> {
    const idx = await this.artifacts.getIndex("snapshots", ref);
    if (!idx) throw new BksServiceError("BKS_SNAPSHOT_UNVERIFIED", `snapshot ${ref} is not in custody`);
    const record = CustodySnapshotRecord.parse(JSON.parse(Buffer.from(await this.artifacts.getVerified("snapshot-records", String(idx.recordDigest))).toString("utf8")));
    await this.artifacts.getVerified("snapshots", record.bytesDigest);
    if (digest !== record.bytesDigest) throw new BksServiceError("BKS_SNAPSHOT_UNVERIFIED", `intent cites snapshot digest ${digest}; custody holds ${record.bytesDigest}`);
    if (!this.trustedIssuers.includes(record.issuer)) throw new BksServiceError("BKS_SNAPSHOT_UNVERIFIED", `snapshot issuer ${record.issuer} is not trusted`);
    const s = record.scope;
    if (s.installationId !== expect.scope.installationId || s.applicationId !== expect.scope.applicationId || s.tenantId !== expect.scope.tenantId) throw new BksServiceError("BKS_FORBIDDEN_SCOPE", `snapshot ${ref} belongs to another scope`);
    if (record.pins.schemaReleaseDigest !== expect.schemaReleaseDigest) throw new BksServiceError("BKS_RELEASE_MISMATCH", `snapshot ${ref} was read under release ${record.pins.schemaReleaseDigest}`);
    return record;
  }
}

/** Receipt copies (the KsIntentMarker stays authoritative); shape-compatible with FileReceiptStore. */
export class SupabaseReceiptStore {
  readonly dir: string;
  readonly errors: string[] = [];
  constructor(readonly artifacts: ContentAddressedArtifacts) {
    this.dir = `${artifacts.store.location}/${artifacts.prefix}/receipts`;
  }
  put(markerKey: string, attemptId: string, receipt: unknown): void {
    const bytes = Buffer.from(canonicalize(receipt), "utf8");
    void this.artifacts
      .put("receipts", bytes, "application/json")
      .then((r) => this.artifacts.putIndex("receipts", `${markerKey}--${attemptId}`.slice(0, 200), { format: "bks-custody-index.v1", markerKey, attemptId, receiptDigest: r.digest }))
      .catch((e: unknown) => this.errors.push((e as Error).message));
  }
}
