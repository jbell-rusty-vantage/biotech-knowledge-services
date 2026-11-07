import { existsSync, readFileSync } from "node:fs";
import { BksServiceError } from "@bks/contracts";
import type { VerificationCustody } from "../custody.js";

/**
 * Pluggable AUTHORITATIVE sources the domain admission service consults before issuing an apply witness and again at
 * serving time (SPECIFICATION 7.2). Every source fails CLOSED: unreachable, unreadable or malformed authority raises
 * BKS_AUTHORITY_UNAVAILABLE; it never degrades to "allowed".
 *
 *  - GrantSource: the Mission Control grant reference (`grantRef`) for the principal, scope, operation and effect key.
 *      FileGrantSource  `bks-grant-registry.v1` JSON written by the grant owner (local proofs, single-host installs)
 *      HttpGrantSource  POST <base>/grants/check (Mission Control grant service; contract below)
 *      MemoryGrantSource tests
 *  - EvidenceSource: the sealed verification references the plan relies on, hydrated from Knowledge Services custody
 *    (signature by a pinned verifier key + digest), plus the CURRENT verification state (a withdrawn result denies).
 *      CustodyEvidenceSource(custody, state?)  with FileVerificationStateSource / HttpVerificationStateSource
 */

export function authorityUnavailable(message: string): BksServiceError {
  return new BksServiceError("BKS_AUTHORITY_UNAVAILABLE", message);
}

export interface PrincipalScope {
  principalId: string;
  installationId: string;
  applicationId: string;
  tenantId: string;
}

export type GrantOperation = "knowledge.ingestion_apply" | "serving";

export interface GrantQuery {
  grantRef: string;
  principal: PrincipalScope;
  effectKey: string;
  operation: GrantOperation;
  planDigest?: string;
  now: Date;
}

export interface GrantDecision {
  allowed: boolean;
  reason?: string;
  grantRef: string;
  decisionVersion: string;
}

export interface GrantSource {
  readonly kind: string;
  check(q: GrantQuery): Promise<GrantDecision>;
}

export interface GrantRecord {
  grantRef: string;
  installationId: string;
  applicationId: string;
  tenantId: string;
  /** `null`/absent = any principal of the scope. */
  principalId?: string | null;
  operations: string[];
  effectKeyPrefix?: string;
  notAfter?: string;
  revoked?: boolean;
}

export const GRANT_REGISTRY_V1 = "bks-grant-registry.v1" as const;

/** Evaluates one grant record (shared by the file and memory sources). `serving` asks only whether the grant is still live. */
export function evaluateGrant(grant: GrantRecord | undefined, q: GrantQuery, decisionVersion: string): GrantDecision {
  const deny = (reason: string): GrantDecision => ({ allowed: false, reason, grantRef: q.grantRef, decisionVersion });
  if (!grant) return deny(`grant ${q.grantRef} is not known to the grant authority`);
  if (grant.revoked) return deny(`grant ${q.grantRef} is revoked`);
  if (grant.installationId !== q.principal.installationId || grant.applicationId !== q.principal.applicationId || grant.tenantId !== q.principal.tenantId) return deny(`grant ${q.grantRef} belongs to another scope`);
  if (grant.principalId && grant.principalId !== q.principal.principalId) return deny(`grant ${q.grantRef} names another principal`);
  if (grant.notAfter && Date.parse(grant.notAfter) <= q.now.getTime()) return deny(`grant ${q.grantRef} expired at ${grant.notAfter}`);
  if (q.operation !== "serving" && !grant.operations.includes(q.operation)) return deny(`grant ${q.grantRef} does not cover ${q.operation}`);
  if (q.operation !== "serving" && grant.effectKeyPrefix && !q.effectKey.startsWith(grant.effectKeyPrefix)) return deny(`effect key ${q.effectKey} is outside the grant's effect namespace`);
  return { allowed: true, grantRef: q.grantRef, decisionVersion };
}

export class MemoryGrantSource implements GrantSource {
  readonly kind = "memory";
  available = true;
  readonly grants = new Map<string, GrantRecord>();
  constructor(grants: GrantRecord[] = [], readonly decisionVersion = "memory-grants/v1") {
    for (const g of grants) this.grants.set(g.grantRef, g);
  }
  async check(q: GrantQuery): Promise<GrantDecision> {
    if (!this.available) throw authorityUnavailable("grant authority unavailable; failing closed");
    return evaluateGrant(this.grants.get(q.grantRef), q, this.decisionVersion);
  }
}

/** Reads the registry on every check (the grant owner rewrites it atomically); missing or malformed fails closed. */
export class FileGrantSource implements GrantSource {
  readonly kind = "file";
  constructor(readonly path: string) {}
  async check(q: GrantQuery): Promise<GrantDecision> {
    if (!existsSync(this.path)) throw authorityUnavailable(`grant registry ${this.path} is unavailable; failing closed`);
    let doc: { format?: string; decisionVersion?: string; grants?: GrantRecord[] };
    try {
      doc = JSON.parse(readFileSync(this.path, "utf8")) as typeof doc;
    } catch (e) {
      throw authorityUnavailable(`grant registry ${this.path} unreadable: ${(e as Error).message}`);
    }
    if (doc.format !== GRANT_REGISTRY_V1 || !Array.isArray(doc.grants)) throw authorityUnavailable(`grant registry ${this.path} has an unknown format; failing closed`);
    return evaluateGrant(doc.grants.find((g) => g.grantRef === q.grantRef), q, doc.decisionVersion ?? "file-grants/v1");
  }
}

/**
 * Mission Control grant service contract (consumed, not implemented here):
 *   POST <base>/grants/check  {grantRef, principal{principalId,installationId,applicationId,tenantId}, effectKey, operation, planDigest?}
 *   200 {allowed: boolean, reason?: string, decisionVersion: string}. Any transport error, timeout or non-200 is
 *   BKS_AUTHORITY_UNAVAILABLE (fail closed).
 */
export class HttpGrantSource implements GrantSource {
  readonly kind = "http";
  constructor(
    readonly baseUrl: string,
    private readonly token: string | null = null,
    private readonly timeoutMs = 3000,
  ) {}
  async check(q: GrantQuery): Promise<GrantDecision> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl.replace(/\/$/, "")}/grants/check`, {
        method: "POST",
        headers: { "content-type": "application/json", ...(this.token ? { authorization: `Bearer ${this.token}` } : {}) },
        body: JSON.stringify({ grantRef: q.grantRef, principal: q.principal, effectKey: q.effectKey, operation: q.operation, ...(q.planDigest ? { planDigest: q.planDigest } : {}) }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (e) {
      throw authorityUnavailable(`grant authority ${this.baseUrl} unreachable: ${(e as Error).message}`);
    }
    if (res.status !== 200) throw authorityUnavailable(`grant authority ${this.baseUrl} answered ${res.status}; failing closed`);
    const body = (await res.json().catch(() => null)) as { allowed?: unknown; reason?: unknown; decisionVersion?: unknown } | null;
    if (!body || typeof body.allowed !== "boolean" || typeof body.decisionVersion !== "string") throw authorityUnavailable(`grant authority ${this.baseUrl} returned a malformed decision`);
    return { allowed: body.allowed, ...(typeof body.reason === "string" ? { reason: body.reason } : {}), grantRef: q.grantRef, decisionVersion: body.decisionVersion };
  }
}

// ---------------------------------------------------------------------------------------------
// Sealed verification evidence (Knowledge Services custody)
// ---------------------------------------------------------------------------------------------

export type VerificationCurrentState = "completed" | "withdrawn" | "unknown";

export interface VerificationStateSource {
  readonly kind: string;
  current(ref: string, digest: string): Promise<VerificationCurrentState>;
}

export const VERIFICATION_STATE_V1 = "ks-verification-state.v1" as const;

export class FileVerificationStateSource implements VerificationStateSource {
  readonly kind = "file";
  constructor(readonly path: string) {}
  async current(ref: string, digest: string): Promise<VerificationCurrentState> {
    if (!existsSync(this.path)) throw authorityUnavailable(`verification state ${this.path} is unavailable; failing closed`);
    let doc: { format?: string; results?: Array<{ ref: string; digest: string; state: VerificationCurrentState }> };
    try {
      doc = JSON.parse(readFileSync(this.path, "utf8")) as typeof doc;
    } catch (e) {
      throw authorityUnavailable(`verification state ${this.path} unreadable: ${(e as Error).message}`);
    }
    if (doc.format !== VERIFICATION_STATE_V1 || !Array.isArray(doc.results)) throw authorityUnavailable(`verification state ${this.path} has an unknown format`);
    return doc.results.find((r) => r.ref === ref && r.digest === digest)?.state ?? "unknown";
  }
}

/** GET <base>/verifications/state?ref=&digest= -> {state}; transport failure is BKS_AUTHORITY_UNAVAILABLE. */
export class HttpVerificationStateSource implements VerificationStateSource {
  readonly kind = "http";
  constructor(readonly baseUrl: string, private readonly token: string | null = null, private readonly timeoutMs = 3000) {}
  async current(ref: string, digest: string): Promise<VerificationCurrentState> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl.replace(/\/$/, "")}/verifications/state?ref=${encodeURIComponent(ref)}&digest=${encodeURIComponent(digest)}`, { headers: this.token ? { authorization: `Bearer ${this.token}` } : {}, signal: AbortSignal.timeout(this.timeoutMs) });
    } catch (e) {
      throw authorityUnavailable(`verification state ${this.baseUrl} unreachable: ${(e as Error).message}`);
    }
    if (res.status !== 200) throw authorityUnavailable(`verification state ${this.baseUrl} answered ${res.status}`);
    const body = (await res.json().catch(() => null)) as { state?: unknown } | null;
    if (body?.state !== "completed" && body?.state !== "withdrawn" && body?.state !== "unknown") throw authorityUnavailable("verification state source returned a malformed state");
    return body.state;
  }
}

export interface EvidenceItem {
  ref: string;
  digest: string;
  state: "completed" | "withdrawn" | "invalid";
  detail?: string;
}

export interface EvidenceDecision {
  ok: boolean;
  reason?: string;
  items: EvidenceItem[];
}

export interface EvidenceSource {
  readonly kind: string;
  check(refs: Array<{ ref: string; digest: string }>): Promise<EvidenceDecision>;
}

/**
 * Hydrates every sealed verification from custody (pinned verifier signature + cited digest) and, when a state source is
 * configured, requires its CURRENT state to be `completed`. A custody/state transport failure is AUTHORITY_UNAVAILABLE;
 * a forged, altered or withdrawn result is a denial with the item listed.
 */
export class CustodyEvidenceSource implements EvidenceSource {
  readonly kind = "ks-custody";
  constructor(private readonly custody: VerificationCustody, private readonly state: VerificationStateSource | null = null) {}
  async check(refs: Array<{ ref: string; digest: string }>): Promise<EvidenceDecision> {
    const items: EvidenceItem[] = [];
    for (const r of refs) {
      try {
        await this.custody.get(r.ref, r.digest);
      } catch (e) {
        if (e instanceof BksServiceError && e.code === "BKS_EVIDENCE_UNVERIFIED") {
          items.push({ ref: r.ref, digest: r.digest, state: "invalid", detail: e.message });
          continue;
        }
        throw authorityUnavailable(`verification custody unavailable: ${(e as Error).message}`);
      }
      const current = this.state ? await this.state.current(r.ref, r.digest) : "completed";
      items.push({ ref: r.ref, digest: r.digest, state: current === "completed" ? "completed" : current === "withdrawn" ? "withdrawn" : "invalid", ...(current === "unknown" ? { detail: "verification state unknown to Knowledge Services" } : {}) });
    }
    const bad = items.filter((i) => i.state !== "completed");
    return bad.length ? { ok: false, reason: `sealed verification(s) not admissible: ${bad.map((b) => `${b.ref} (${b.state})`).join(", ")}`, items } : { ok: true, items };
  }
}
