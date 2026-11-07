import { createPrivateKey, createPublicKey, generateKeyPairSync, randomUUID, sign, verify, type KeyObject } from "node:crypto";
import {
  ApplyWitness,
  BksServiceError,
  canonicalDigest,
  canonicalize,
  WITNESS_AUDIENCE,
  WITNESS_MAX_LIFETIME_SECONDS,
  WITNESS_V1,
  WitnessClaims,
  type IngestionPlanV2,
  type PartialPolicy,
  type Principal,
} from "@bks/contracts";

/**
 * Admission witness service (SPECIFICATION 7.2).
 *
 * Semantics: AUTHORIZATION AT ISSUANCE PLUS A BOUNDED IN-FLIGHT LEASE, not atomic cross-store revocation.
 *  - The issuer checks the authoritative grant/evidence state (GrantAuthority) and signs a short-lived (<= 60 s),
 *    audience-bound witness that binds actor/scope, effect key, intent/plan/release/evidence digests, the partial
 *    policy, policy/decision versions and the authoritative revocation generation at issuance.
 *  - An external revocation prevents NEW witnesses immediately. A witness issued before the revocation can still
 *    commit during its lease unless the revocation has already been delivered to the local KsRevocationFence in the
 *    graph (generation bump), which apply checks inside its transaction under the writer fence.
 *  - Unavailable required authority fails closed (BKS_AUTHORITY_UNAVAILABLE); no witness, no apply.
 *  - The exact witness (jti, kid, iss, iat, exp, generation, digest) is recorded on the receipt.
 * Never describe this as instantaneous cross-database authorization.
 *
 * Keys: verifiers pin issuer public keys from BKS_WITNESS_ISSUER_KEYS (`kid:<base64 SPKI DER>[,...]`); the dev
 * issuer signs with BKS_WITNESS_SIGNING_KEY (`kid:<base64 PKCS8 DER>`, development only). Tests generate key pairs.
 */

export interface WitnessKeyPair {
  kid: string;
  privateKey: KeyObject;
  publicKeyDer: string;
  privateKeyDer: string;
}

export function generateWitnessKeyPair(kid = `k-${randomUUID().slice(0, 8)}`): WitnessKeyPair {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  return {
    kid,
    privateKey,
    publicKeyDer: publicKey.export({ format: "der", type: "spki" }).toString("base64"),
    privateKeyDer: privateKey.export({ format: "der", type: "pkcs8" }).toString("base64"),
  };
}

export function parsePinnedKeys(text: string | undefined): Map<string, KeyObject> {
  const out = new Map<string, KeyObject>();
  for (const part of (text ?? "").split(",").map((s) => s.trim()).filter(Boolean)) {
    const i = part.indexOf(":");
    if (i <= 0) continue;
    out.set(part.slice(0, i), createPublicKey({ key: Buffer.from(part.slice(i + 1), "base64"), format: "der", type: "spki" }));
  }
  return out;
}

export function parseSigningKey(text: string | undefined): { kid: string; key: KeyObject } | null {
  if (!text) return null;
  const i = text.indexOf(":");
  if (i <= 0) return null;
  return { kid: text.slice(0, i), key: createPrivateKey({ key: Buffer.from(text.slice(i + 1), "base64"), format: "der", type: "pkcs8" }) };
}

export function partialPolicyDigest(policy: PartialPolicy): string {
  return canonicalDigest(policy === "all" ? { mode: "all" } : { mode: "include", include: [...new Set(policy.include)].sort() });
}

export function witnessDigest(w: ApplyWitness): string {
  return canonicalDigest(w);
}

export function signWitness(claims: WitnessClaims, signer: { kid: string; key: KeyObject }): ApplyWitness {
  const parsed = WitnessClaims.parse(claims);
  const payload = Buffer.from(canonicalize(parsed), "utf8");
  return { format: WITNESS_V1, alg: "Ed25519", kid: signer.kid, payload: payload.toString("base64url"), signature: sign(null, payload, signer.key).toString("base64url") };
}

export interface WitnessExpectation {
  effectKey: string;
  scope: { installationId: string; applicationId: string; tenantId: string };
  intentDigest: string;
  planDigest: string;
  schemaReleaseDigest: string;
  evidenceDigest: string;
  partialPolicyDigest: string;
  policyVersion: string;
  nowSeconds: number;
  skewSeconds?: number;
}

/** Verifies signature, audience, lifetime, expiry and every binding. Revocation generation is checked in the apply transaction. */
export function verifyWitness(raw: unknown, keys: Map<string, KeyObject>, expect: WitnessExpectation): WitnessClaims {
  const w = ApplyWitness.safeParse(raw);
  if (!w.success) throw new BksServiceError("BKS_WITNESS_INVALID", "witness envelope is malformed");
  const key = keys.get(w.data.kid);
  if (!key) throw new BksServiceError("BKS_WITNESS_INVALID", `witness key ${w.data.kid} is not a pinned issuer key`);
  const payload = Buffer.from(w.data.payload, "base64url");
  let ok = false;
  try {
    ok = verify(null, payload, key, Buffer.from(w.data.signature, "base64url"));
  } catch {
    ok = false;
  }
  if (!ok) throw new BksServiceError("BKS_WITNESS_INVALID", "witness signature does not verify");
  let claims: WitnessClaims;
  try {
    claims = WitnessClaims.parse(JSON.parse(payload.toString("utf8")));
  } catch {
    throw new BksServiceError("BKS_WITNESS_INVALID", "witness claims are malformed or have the wrong audience");
  }
  if (canonicalize(claims) !== payload.toString("utf8")) throw new BksServiceError("BKS_WITNESS_INVALID", "witness payload is not canonical");
  if (claims.aud !== WITNESS_AUDIENCE) throw new BksServiceError("BKS_WITNESS_INVALID", "witness audience mismatch");
  const skew = expect.skewSeconds ?? 5;
  if (claims.exp - claims.iat > WITNESS_MAX_LIFETIME_SECONDS || claims.exp <= claims.iat) throw new BksServiceError("BKS_WITNESS_INVALID", `witness lifetime ${claims.exp - claims.iat}s exceeds ${WITNESS_MAX_LIFETIME_SECONDS}s`);
  if (claims.iat > expect.nowSeconds + skew) throw new BksServiceError("BKS_WITNESS_INVALID", "witness issued in the future");
  if (claims.exp <= expect.nowSeconds) throw new BksServiceError("BKS_WITNESS_EXPIRED", `witness expired at ${claims.exp} (now ${expect.nowSeconds})`);
  const mismatches: string[] = [];
  const cmp = (name: string, a: unknown, b: unknown) => {
    if (a !== b) mismatches.push(name);
  };
  cmp("effectKey", claims.effectKey, expect.effectKey);
  cmp("scope.installationId", claims.scope.installationId, expect.scope.installationId);
  cmp("scope.applicationId", claims.scope.applicationId, expect.scope.applicationId);
  cmp("scope.tenantId", claims.scope.tenantId, expect.scope.tenantId);
  cmp("intentDigest", claims.intentDigest, expect.intentDigest);
  cmp("planDigest", claims.planDigest, expect.planDigest);
  cmp("schemaReleaseDigest", claims.schemaReleaseDigest, expect.schemaReleaseDigest);
  cmp("evidenceDigest", claims.evidenceDigest, expect.evidenceDigest);
  cmp("partialPolicyDigest", claims.partialPolicyDigest, expect.partialPolicyDigest);
  cmp("policyVersion", claims.policyVersion, expect.policyVersion);
  if (mismatches.length) throw new BksServiceError("BKS_WITNESS_INVALID", `witness does not bind this apply (${mismatches.join(", ")})`, { mismatches });
  return claims;
}

/** Authoritative grant / revocation state (Mission Control or Supabase in production). */
export interface GrantAuthority {
  /** Throws when unavailable; the issuer fails closed. */
  check(principal: Omit<Principal, "role">, plan: IngestionPlanV2): Promise<{ allowed: boolean; reason?: string; revocationGeneration: number; decisionVersion: string }>;
}

/** In-memory authority for local development and tests: revocations bump the generation and deny the revoked principals. */
export class MemoryGrantAuthority implements GrantAuthority {
  generation = 0;
  readonly revoked = new Set<string>();
  available = true;
  async check(principal: Omit<Principal, "role">): Promise<{ allowed: boolean; reason?: string; revocationGeneration: number; decisionVersion: string }> {
    if (!this.available) throw new BksServiceError("BKS_AUTHORITY_UNAVAILABLE", "grant authority unavailable; failing closed");
    const key = `${principal.installationId}/${principal.applicationId}/${principal.tenantId}/${principal.principalId}`;
    if (this.revoked.has(key)) return { allowed: false, reason: `grant revoked for ${key}`, revocationGeneration: this.generation, decisionVersion: "memory-authority/v1" };
    return { allowed: true, revocationGeneration: this.generation, decisionVersion: "memory-authority/v1" };
  }
  revoke(principal: { principalId: string; installationId: string; applicationId: string; tenantId: string }): number {
    this.revoked.add(`${principal.installationId}/${principal.applicationId}/${principal.tenantId}/${principal.principalId}`);
    return ++this.generation;
  }
}

export interface IssueOptions {
  issuer: string;
  signer: { kid: string; key: KeyObject };
  authority: GrantAuthority;
  /** Seconds since epoch (injected clock). */
  nowSeconds: number;
  lifetimeSeconds?: number;
}

/** Admission: checks authority for the stored plan, then signs a witness for this exact apply. */
export async function issueWitness(plan: IngestionPlanV2, req: { effectKey: string; partialPolicy: PartialPolicy; principal: Omit<Principal, "role"> }, opts: IssueOptions): Promise<ApplyWitness> {
  const lifetime = Math.min(opts.lifetimeSeconds ?? 45, WITNESS_MAX_LIFETIME_SECONDS);
  const b = plan.binding;
  if (b.principal.installationId !== req.principal.installationId || b.principal.applicationId !== req.principal.applicationId || b.principal.tenantId !== req.principal.tenantId) {
    throw new BksServiceError("BKS_FORBIDDEN_SCOPE", "the plan was compiled for another scope");
  }
  let decision: Awaited<ReturnType<GrantAuthority["check"]>>;
  try {
    decision = await opts.authority.check(req.principal, plan);
  } catch (e) {
    throw e instanceof BksServiceError ? e : new BksServiceError("BKS_AUTHORITY_UNAVAILABLE", `grant authority unavailable: ${(e as Error).message}`);
  }
  if (!decision.allowed) throw new BksServiceError("BKS_FORBIDDEN_SCOPE", `admission denied: ${decision.reason ?? "not granted"}`);
  if (plan.outcome === "rejected") throw new BksServiceError("BKS_PLAN_REJECTED", "a rejected plan is not admitted");
  if (plan.outcome === "held") throw new BksServiceError("BKS_PLAN_REJECTED", "a plan whose proposals are all held writes nothing and is not admitted");
  return signWitness(
    {
      iss: opts.issuer,
      aud: WITNESS_AUDIENCE,
      jti: randomUUID(),
      sub: req.principal.principalId,
      scope: { installationId: req.principal.installationId, applicationId: req.principal.applicationId, tenantId: req.principal.tenantId },
      effectKey: req.effectKey,
      intentDigest: b.intentDigest,
      planDigest: plan.planDigest,
      schemaReleaseDigest: b.schemaReleaseDigest,
      evidenceDigest: b.evidenceDigest,
      partialPolicyDigest: partialPolicyDigest(req.partialPolicy),
      policyVersion: b.policyVersion,
      decisionVersion: decision.decisionVersion,
      iat: opts.nowSeconds,
      exp: opts.nowSeconds + lifetime,
      revocationGeneration: decision.revocationGeneration,
    },
    opts.signer,
  );
}

export function decodeWitnessClaims(w: ApplyWitness): WitnessClaims {
  return WitnessClaims.parse(JSON.parse(Buffer.from(w.payload, "base64url").toString("utf8")));
}
