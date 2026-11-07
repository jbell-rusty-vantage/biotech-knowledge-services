import { createPublicKey, verify as verifySig } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  BksServiceError,
  canonicalDigest,
  canonicalize,
  CustodySnapshotRecord,
  IngestionPlanV2,
  rawBytesDigest,
  SealedVerification,
  type IngestionIntentV2,
  type SealedVerificationBody,
} from "@bks/contracts";
import { repoRoot } from "@bks/schema-workspace";

/**
 * Executor custody (SPECIFICATION 7.2, OD-14). Plans are server-stored and addressed by `planRef`; apply loads the
 * stored record, never a caller-supplied plan. The file backend lives under `runs/release-v2/` (gitignored); a
 * Supabase `knowledge-artifacts` backend can implement the same interfaces later.
 */

/** Everything needed to recompile the plan: the frozen context plus the compiler output. */
export interface StoredPlanRecord {
  format: "bks-plan-record.v1";
  plan: IngestionPlanV2;
  frozen: {
    intent: IngestionIntentV2;
    observations: Record<string, unknown>;
    plannedAt: string;
    executorVersion: string;
    agentUid: string;
    agentName: string;
    principal: { principalId: string; installationId: string; applicationId: string; tenantId: string; grants: string[] };
    basis: import("./write/context.js").BasisCtx;
    verifications: Array<{ ref: string; digest: string; body?: SealedVerificationBody; error?: { code: string; message: string } }>;
  };
  storedAt: string;
}

export interface PlanStore {
  put(record: StoredPlanRecord): Promise<void>;
  get(planRef: string): Promise<StoredPlanRecord | null>;
}

export function defaultCustodyRoot(env: NodeJS.ProcessEnv = process.env): string {
  return resolve(env.BKS_RELEASE_RUNS_DIR ?? resolve(repoRoot, "runs", "release-v2"));
}

const REF_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/;
const fileName = (ref: string) => {
  if (!REF_RE.test(ref)) throw new BksServiceError("BKS_PLAN_NOT_FOUND", `invalid ref ${ref}`);
  return ref.replace(/:/g, "_");
};

function atomicWrite(path: string, text: string): void {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tmp, text, "utf8");
  renameSync(tmp, path);
}

export class FilePlanStore implements PlanStore {
  constructor(readonly dir: string = resolve(defaultCustodyRoot(), "plans")) {}

  async put(record: StoredPlanRecord): Promise<void> {
    const path = resolve(this.dir, `${fileName(record.plan.planRef)}.json`);
    if (existsSync(path)) {
      // Plans are immutable: the same planRef is the same digest (planRef derives from the digest).
      const prior = JSON.parse(readFileSync(path, "utf8")) as StoredPlanRecord;
      if (prior.plan.planDigest !== record.plan.planDigest) throw new BksServiceError("BKS_PLAN_FORGED", `planRef ${record.plan.planRef} already stores a different plan`);
      return;
    }
    atomicWrite(path, `${JSON.stringify(record)}\n`);
  }

  async get(planRef: string): Promise<StoredPlanRecord | null> {
    const path = resolve(this.dir, `${fileName(planRef)}.json`);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as StoredPlanRecord;
  }
}

export class MemoryPlanStore implements PlanStore {
  readonly records = new Map<string, string>();
  async put(record: StoredPlanRecord): Promise<void> {
    const prior = this.records.get(record.plan.planRef);
    if (prior && (JSON.parse(prior) as StoredPlanRecord).plan.planDigest !== record.plan.planDigest) throw new BksServiceError("BKS_PLAN_FORGED", `planRef ${record.plan.planRef} already stores a different plan`);
    this.records.set(record.plan.planRef, JSON.stringify(record));
  }
  async get(planRef: string): Promise<StoredPlanRecord | null> {
    const raw = this.records.get(planRef);
    return raw ? (JSON.parse(raw) as StoredPlanRecord) : null;
  }
}

/** Receipts are also retained in custody (the KsIntentMarker holds the authoritative projection). */
export class FileReceiptStore {
  constructor(readonly dir: string = resolve(defaultCustodyRoot(), "receipts")) {}
  put(markerKey: string, attemptId: string, receipt: unknown): void {
    try {
      atomicWrite(resolve(this.dir, `${markerKey.replace(/[^A-Za-z0-9._-]/g, "_")}--${attemptId}.json`), `${JSON.stringify(receipt, null, 2)}\n`);
    } catch {
      /* custody copy is best effort; the marker is authoritative */
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Read snapshots (basis.snapshotRef): written by the read service (S4), verified here
// ---------------------------------------------------------------------------------------------

export interface SnapshotCustody {
  /** S4 writes a read result: record + exact bytes. Returns the stored record. */
  put(record: CustodySnapshotRecord, bytes: Uint8Array): Promise<CustodySnapshotRecord>;
  /** Loads and verifies a snapshot: bytes digest, declared digest, issuer, scope and release pin. */
  verify(ref: string, digest: string, expect: { scope: { installationId: string; applicationId: string; tenantId: string }; schemaReleaseDigest: string }): Promise<CustodySnapshotRecord>;
}

export class FileSnapshotCustody implements SnapshotCustody {
  constructor(
    readonly dir: string = resolve(defaultCustodyRoot(), "custody", "snapshots"),
    /** Trusted snapshot issuers (the read service identities). */
    readonly trustedIssuers: string[] = (process.env.BKS_SNAPSHOT_ISSUERS ?? "bks-read-service,bks-executor").split(",").map((s) => s.trim()).filter(Boolean),
  ) {}

  async put(record: CustodySnapshotRecord, bytes: Uint8Array): Promise<CustodySnapshotRecord> {
    const parsed = CustodySnapshotRecord.parse(record);
    if (rawBytesDigest(bytes) !== parsed.bytesDigest) throw new BksServiceError("BKS_SNAPSHOT_UNVERIFIED", "snapshot bytes do not match bytesDigest");
    const base = resolve(this.dir, fileName(parsed.ref));
    mkdirSync(this.dir, { recursive: true });
    writeFileSync(`${base}.bytes`, bytes);
    atomicWrite(`${base}.json`, `${JSON.stringify(parsed)}\n`);
    return parsed;
  }

  async verify(ref: string, digest: string, expect: { scope: { installationId: string; applicationId: string; tenantId: string }; schemaReleaseDigest: string }): Promise<CustodySnapshotRecord> {
    const base = resolve(this.dir, fileName(ref));
    if (!existsSync(`${base}.json`) || !existsSync(`${base}.bytes`)) throw new BksServiceError("BKS_SNAPSHOT_UNVERIFIED", `snapshot ${ref} is not in custody`);
    const record = CustodySnapshotRecord.parse(JSON.parse(readFileSync(`${base}.json`, "utf8")));
    const bytes = readFileSync(`${base}.bytes`);
    const actual = rawBytesDigest(bytes);
    if (actual !== record.bytesDigest) throw new BksServiceError("BKS_SNAPSHOT_UNVERIFIED", `snapshot ${ref} bytes were altered in custody`);
    if (digest !== record.bytesDigest) throw new BksServiceError("BKS_SNAPSHOT_UNVERIFIED", `intent cites snapshot digest ${digest}; custody holds ${record.bytesDigest}`);
    if (!this.trustedIssuers.includes(record.issuer)) throw new BksServiceError("BKS_SNAPSHOT_UNVERIFIED", `snapshot issuer ${record.issuer} is not trusted`);
    const s = record.scope;
    if (s.installationId !== expect.scope.installationId || s.applicationId !== expect.scope.applicationId || s.tenantId !== expect.scope.tenantId) throw new BksServiceError("BKS_FORBIDDEN_SCOPE", `snapshot ${ref} belongs to another scope`);
    if (record.pins.schemaReleaseDigest !== expect.schemaReleaseDigest) throw new BksServiceError("BKS_RELEASE_MISMATCH", `snapshot ${ref} was read under release ${record.pins.schemaReleaseDigest}`);
    return record;
  }
}

// ---------------------------------------------------------------------------------------------
// Sealed verification results (adjudication delivery)
// ---------------------------------------------------------------------------------------------

export interface VerificationCustody {
  put(sealed: SealedVerification): Promise<{ ref: string; digest: string }>;
  /** Hydrates and verifies a sealed result: digest, signature by a pinned verifier key. */
  get(ref: string, digest: string): Promise<SealedVerificationBody>;
}

function parseKeyList(text: string | undefined): Map<string, string> {
  const out = new Map<string, string>();
  for (const part of (text ?? "").split(",").map((s) => s.trim()).filter(Boolean)) {
    const i = part.indexOf(":");
    if (i > 0) out.set(part.slice(0, i), part.slice(i + 1));
  }
  return out;
}

export function sealedDigest(sealed: SealedVerification): string {
  return canonicalDigest(sealed);
}

export class FileVerificationCustody implements VerificationCustody {
  constructor(
    readonly dir: string = resolve(defaultCustodyRoot(), "custody", "verifications"),
    /** kid -> base64 SPKI DER Ed25519 public key of trusted verifiers (BKS_VERIFIER_ISSUER_KEYS). */
    readonly keys: Map<string, string> = parseKeyList(process.env.BKS_VERIFIER_ISSUER_KEYS),
  ) {}

  async put(sealed: SealedVerification): Promise<{ ref: string; digest: string }> {
    const parsed = SealedVerification.parse(sealed);
    atomicWrite(resolve(this.dir, `${fileName(parsed.body.ref)}.json`), `${JSON.stringify(parsed)}\n`);
    return { ref: parsed.body.ref, digest: sealedDigest(parsed) };
  }

  async get(ref: string, digest: string): Promise<SealedVerificationBody> {
    const path = resolve(this.dir, `${fileName(ref)}.json`);
    if (!existsSync(path)) throw new BksServiceError("BKS_EVIDENCE_UNVERIFIED", `sealed verification ${ref} is not in custody`);
    const sealed = SealedVerification.parse(JSON.parse(readFileSync(path, "utf8")));
    if (sealedDigest(sealed) !== digest) throw new BksServiceError("BKS_EVIDENCE_UNVERIFIED", `sealed verification ${ref} digest ${sealedDigest(sealed)} != cited ${digest}`);
    const key = this.keys.get(sealed.kid);
    if (!key) throw new BksServiceError("BKS_EVIDENCE_UNVERIFIED", `verifier key ${sealed.kid} is not pinned (BKS_VERIFIER_ISSUER_KEYS)`);
    const ok = verifySig(null, Buffer.from(canonicalize(sealed.body), "utf8"), createPublicKey({ key: Buffer.from(key, "base64"), format: "der", type: "spki" }), Buffer.from(sealed.signature, "base64url"));
    if (!ok) throw new BksServiceError("BKS_EVIDENCE_UNVERIFIED", `sealed verification ${ref} signature is invalid (forged verdict refused)`);
    if (sealed.body.ref !== ref) throw new BksServiceError("BKS_EVIDENCE_UNVERIFIED", `sealed verification body names ref ${sealed.body.ref}`);
    return sealed.body;
  }
}
