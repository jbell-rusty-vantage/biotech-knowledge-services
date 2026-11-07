/**
 * S7 domain admission service without a database: authority checks before issuance (grant + sealed evidence), fail
 * closed on unavailable authority, durable ledger (file backend, explicit creation, concurrent updates), revocation
 * generations and outbox bookkeeping, serving-time eligibility, and executor-side witness verification.
 */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { canonicalize, type SealedVerificationBody } from "@bks/contracts";
import { FileVerificationCustody, MemoryPlanStore } from "../custody.js";
import { generateWitnessKeyPair, parsePinnedKeys, partialPolicyDigest, verifyWitness } from "../witness.js";
import { smallIntent } from "../write/fixtures-v2.js";
import { planOffline } from "../write/offline.js";
import { writeSchema } from "../write/service.js";
import { PRINCIPALS, sealVerification, storedRecordFrom } from "../write/test-support.js";
import { FileAdmissionLedger, MemoryAdmissionLedger } from "./ledger.js";
import { AdmissionService } from "./service.js";
import { CustodyEvidenceSource, FileGrantSource, FileVerificationStateSource, GRANT_REGISTRY_V1, HttpGrantSource, MemoryGrantSource, VERIFICATION_STATE_V1, type GrantRecord } from "./sources.js";

const schema = writeSchema();
const R = schema.schemaReleaseDigest;
const T0 = "2026-10-11T12:00:00Z";
const tmp = mkdtempSync(join(tmpdir(), "bks-s7-admission-"));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

const P = PRINCIPALS.writer;
const grant = (over: Partial<GrantRecord> = {}): GrantRecord => ({ grantRef: "grant-a", installationId: P.installationId, applicationId: P.applicationId, tenantId: P.tenantId, principalId: P.principalId, operations: ["knowledge.ingestion_apply"], ...over });

async function setup(opts: { verificationRefs?: Array<{ ref: string; digest: string }>; evidence?: CustodyEvidenceSource | null; grants?: MemoryGrantSource; ledger?: MemoryAdmissionLedger | FileAdmissionLedger; now?: () => Date } = {}) {
  const plans = new MemoryPlanStore();
  const { plan, observations } = planOffline(schema, smallIntent(R, "s7u", "a"), { principal: P, plannedAt: T0 });
  const withRefs = opts.verificationRefs ? { ...plan, binding: { ...plan.binding, custodyRefs: opts.verificationRefs.map((v) => ({ kind: "sealed-verification", ...v })) } } : plan;
  await plans.put(storedRecordFrom(withRefs, { intent: (await import("@bks/contracts")).IngestionIntentV2.parse(smallIntent(R, "s7u", "a")), observations, plannedAt: T0, executorVersion: "test", agentUid: "hu:agent:test", agentName: "test", principal: P, basis: { kind: "creationOnly", reason: "t", expectAbsent: [], expectPresent: [] } }));
  const key = generateWitnessKeyPair("s7-admission");
  const grants = opts.grants ?? new MemoryGrantSource([grant()]);
  const ledger = opts.ledger ?? new MemoryAdmissionLedger();
  const svc = new AdmissionService({ issuer: "bks-admission-s7", signer: { kid: key.kid, key: key.privateKey }, grants, evidence: opts.evidence === undefined ? null : opts.evidence, ledger, plans, now: opts.now ?? (() => new Date("2026-10-11T12:00:10Z")) });
  return { svc, plan: withRefs, key, grants, ledger };
}

const expectation = (plan: { planDigest: string; binding: { intentDigest: string; schemaReleaseDigest: string; evidenceDigest: string; policyVersion: string } }, effectKey: string, nowSeconds: number) => ({
  effectKey, scope: { installationId: P.installationId, applicationId: P.applicationId, tenantId: P.tenantId }, intentDigest: plan.binding.intentDigest, planDigest: plan.planDigest, schemaReleaseDigest: plan.binding.schemaReleaseDigest, evidenceDigest: plan.binding.evidenceDigest, partialPolicyDigest: partialPolicyDigest("all"), policyVersion: plan.binding.policyVersion, nowSeconds,
});

describe("domain admission service (S7)", () => {
  it("issues an executor-verifiable witness only after the grant check, and records the issuance durably", async () => {
    const { svc, plan, key, ledger } = await setup();
    const out = await svc.issue({ planRef: plan.planRef, effectKey: "ek-s7-1", partialPolicy: "all", grantRef: "grant-a", principal: P });
    expect(out.admission.semantics).toBe("authorization-at-issuance-plus-bounded-lease");
    expect(out.claims.exp - out.claims.iat).toBeLessThanOrEqual(60);
    expect(out.claims.revocationGeneration).toBe(0);
    const claims = verifyWitness(out.witness, parsePinnedKeys(`${key.kid}:${key.publicKeyDer}`), expectation(plan, "ek-s7-1", out.claims.iat + 1));
    expect(claims.jti).toBe(out.claims.jti);
    const state = await ledger.read();
    expect(state.issuances.map((i) => [i.effectKey, i.grantRef, i.generation])).toEqual([["ek-s7-1", "grant-a", 0]]);
  });

  it("denies a missing, foreign-scope, expired or non-covering grant; unavailable authority fails closed", async () => {
    const grants = new MemoryGrantSource([grant(), grant({ grantRef: "grant-other", tenantId: "tenant-b" }), grant({ grantRef: "grant-old", notAfter: "2026-10-01T00:00:00Z" }), grant({ grantRef: "grant-read", operations: ["serving"] }), grant({ grantRef: "grant-ns", effectKeyPrefix: "mc/run-9/" })]);
    const { svc, plan } = await setup({ grants });
    for (const [grantRef, re] of [["grant-missing", /not known/], ["grant-other", /another scope/], ["grant-old", /expired/], ["grant-read", /does not cover/], ["grant-ns", /outside the grant/]] as const) {
      await expect(svc.issue({ planRef: plan.planRef, effectKey: "ek-s7-2", partialPolicy: "all", grantRef, principal: P })).rejects.toMatchObject({ code: "BKS_FORBIDDEN_SCOPE", message: expect.stringMatching(re) });
    }
    grants.available = false;
    await expect(svc.issue({ planRef: plan.planRef, effectKey: "ek-s7-2", partialPolicy: "all", grantRef: "grant-a", principal: P })).rejects.toMatchObject({ code: "BKS_AUTHORITY_UNAVAILABLE" });
    const file = new FileGrantSource(join(tmp, "absent-grants.json"));
    await expect(file.check({ grantRef: "grant-a", principal: P, effectKey: "x", operation: "knowledge.ingestion_apply", now: new Date() })).rejects.toMatchObject({ code: "BKS_AUTHORITY_UNAVAILABLE" });
    const http = new HttpGrantSource("http://127.0.0.1:9", null, 500);
    await expect(http.check({ grantRef: "grant-a", principal: P, effectKey: "x", operation: "knowledge.ingestion_apply", now: new Date() })).rejects.toMatchObject({ code: "BKS_AUTHORITY_UNAVAILABLE" });
  });

  it("requires sealed verification evidence from custody: missing authority fails closed, forged or withdrawn results deny", async () => {
    const verifier = generateWitnessKeyPair("ks-verifier");
    const rogue = generateWitnessKeyPair("rogue");
    const custody = new FileVerificationCustody(join(tmp, "verifications"), new Map([[verifier.kid, verifier.publicKeyDer]]));
    const body = (ref: string): SealedVerificationBody => ({ format: "bks-sealed-verification.v1", ref, issuer: "ks-verification", judgmentId: `${ref}-j`, assertionUid: "hu:assertion:s7-a", adjudicationKind: "CAPTURE_FIDELITY", verdict: "DIRECTLY_SUPPORTED", policyOutcome: "PASS", judgeKind: "DETERMINISTIC", methodVersion: "s7/1", properties: {}, unsupportedFacets: [], evidence: [], run: { system: "ks-verification", runId: "ver-s7" }, policy: { toolRenditionException: false }, sealedAt: "2026-10-11T11:00:00Z" });
    const good = await custody.put(sealVerification(body("ver-good"), { kid: verifier.kid, key: verifier.privateKey }));
    const forged = await custody.put(sealVerification(body("ver-forged"), { kid: rogue.kid, key: rogue.privateKey }));
    // No evidence authority configured while the plan cites a verification: fail closed.
    const none = await setup({ verificationRefs: [good] });
    await expect(none.svc.issue({ planRef: none.plan.planRef, effectKey: "ek-s7-3", partialPolicy: "all", grantRef: "grant-a", principal: P })).rejects.toMatchObject({ code: "BKS_AUTHORITY_UNAVAILABLE" });
    const statePath = join(tmp, "ver-state.json");
    writeFileSync(statePath, JSON.stringify({ format: VERIFICATION_STATE_V1, results: [{ ref: good.ref, digest: good.digest, state: "completed" }] }));
    const ok = await setup({ verificationRefs: [good], evidence: new CustodyEvidenceSource(custody, new FileVerificationStateSource(statePath)) });
    const issued = await ok.svc.issue({ planRef: ok.plan.planRef, effectKey: "ek-s7-3", partialPolicy: "all", grantRef: "grant-a", principal: P });
    expect(issued.admission.verifications).toEqual([{ ref: good.ref, digest: good.digest, state: "completed" }]);
    const bad = await setup({ verificationRefs: [forged], evidence: new CustodyEvidenceSource(custody) });
    await expect(bad.svc.issue({ planRef: bad.plan.planRef, effectKey: "ek-s7-4", partialPolicy: "all", grantRef: "grant-a", principal: P })).rejects.toMatchObject({ code: "BKS_EVIDENCE_UNVERIFIED" });
    writeFileSync(statePath, JSON.stringify({ format: VERIFICATION_STATE_V1, results: [{ ref: good.ref, digest: good.digest, state: "withdrawn" }] }));
    await expect(ok.svc.issue({ planRef: ok.plan.planRef, effectKey: "ek-s7-5", partialPolicy: "all", grantRef: "grant-a", principal: P })).rejects.toMatchObject({ code: "BKS_EVIDENCE_UNVERIFIED", message: expect.stringMatching(/withdrawn/) });
    rmSync(statePath);
    await expect(ok.svc.issue({ planRef: ok.plan.planRef, effectKey: "ek-s7-6", partialPolicy: "all", grantRef: "grant-a", principal: P })).rejects.toMatchObject({ code: "BKS_AUTHORITY_UNAVAILABLE" });
  });

  it("revocation: new generation + outbox entry; new witnesses refused; serving recheck denies while history stays", async () => {
    const { svc, plan, grants } = await setup();
    const w = await svc.issue({ planRef: plan.planRef, effectKey: "ek-s7-7", partialPolicy: "all", grantRef: "grant-a", principal: P });
    const applied = async () => ({ found: true, status: "applied" });
    expect((await svc.isCurrentlyEligible("ek-s7-7", P, { receipt: applied })).code).toBe("ELIGIBLE");
    expect((await svc.isCurrentlyEligible("ek-s7-unknown", P, { receipt: applied })).code).toBe("NOT_ADMITTED");
    expect((await svc.isCurrentlyEligible("ek-s7-7", P, { receipt: async () => ({ found: false }) })).code).toBe("NOT_APPLIED");
    const rv = await svc.revoke({ kind: "grant", target: "grant-a", scope: P, reason: "operator revoked the mission grant" });
    expect(rv).toEqual({ generation: 1, outboxId: "rv-1" });
    const e = await svc.isCurrentlyEligible("ek-s7-7", P, { receipt: applied });
    expect(e).toMatchObject({ eligible: false, code: "GRANT_REVOKED", receipt: { found: true, status: "applied" } });
    await expect(svc.issue({ planRef: plan.planRef, effectKey: "ek-s7-8", partialPolicy: "all", grantRef: "grant-a", principal: P })).rejects.toMatchObject({ code: "BKS_FORBIDDEN_SCOPE", message: expect.stringMatching(/revoked at generation 1/) });
    // The earlier witness still carries generation 0 (bounded lease): only the graph fence refuses it once delivered.
    expect(w.claims.revocationGeneration).toBe(0);
    // Authority unavailable at serving time fails closed.
    const s2 = await setup({ grants });
    await s2.svc.issue({ planRef: s2.plan.planRef, effectKey: "ek-s7-9", partialPolicy: "all", grantRef: "grant-a", principal: P });
    grants.available = false;
    expect((await s2.svc.isCurrentlyEligible("ek-s7-9", P, { receipt: applied })).code).toBe("BKS_AUTHORITY_UNAVAILABLE");
    (s2.ledger as MemoryAdmissionLedger).available = false;
    grants.available = true;
    expect((await s2.svc.isCurrentlyEligible("ek-s7-9", P)).code).toBe("BKS_AUTHORITY_UNAVAILABLE");
    // Effect-level revocation.
    (s2.ledger as MemoryAdmissionLedger).available = true;
    await s2.svc.revoke({ kind: "effect", target: "ek-s7-9", scope: P, reason: "evidence withdrawn" });
    expect((await s2.svc.isCurrentlyEligible("ek-s7-9", P, { receipt: applied })).code).toBe("EFFECT_REVOKED");
  });

  it("file ledger: explicit creation, fail closed when absent or corrupt, serialized concurrent updates", async () => {
    const path = join(tmp, "ledger", "ledger.json");
    await expect(new FileAdmissionLedger(path).read()).rejects.toMatchObject({ code: "BKS_AUTHORITY_UNAVAILABLE" });
    const ledger = new FileAdmissionLedger(path, { create: true });
    const { svc } = await setup({ ledger });
    await Promise.all(Array.from({ length: 8 }, (_, i) => svc.revoke({ kind: "effect", target: `ek-c-${i}`, reason: "concurrency" })));
    const state = await ledger.read();
    expect(state.generation).toBe(8);
    expect(state.outbox.map((o) => o.generation).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(new Set(state.outbox.map((o) => o.id)).size).toBe(8);
    // Re-opening never resets the generation.
    expect((await new FileAdmissionLedger(path, { create: true }).read()).generation).toBe(8);
    writeFileSync(path, "{ not json");
    await expect(new FileAdmissionLedger(path).read()).rejects.toMatchObject({ code: "BKS_AUTHORITY_UNAVAILABLE" });
  });

  it("a revocation landing during admission refuses the stale-generation witness", async () => {
    const { svc, plan, ledger } = await setup();
    const realUpdate = ledger.update.bind(ledger);
    let raced = false;
    (ledger as MemoryAdmissionLedger).update = async <T,>(fn: (s: Parameters<Parameters<typeof realUpdate>[0]>[0]) => T): Promise<T> => {
      if (!raced) {
        raced = true;
        await realUpdate((s) => {
          s.generation += 1;
        });
      }
      return realUpdate(fn);
    };
    await expect(svc.issue({ planRef: plan.planRef, effectKey: "ek-s7-race", partialPolicy: "all", grantRef: "grant-a", principal: P })).rejects.toMatchObject({ code: "BKS_WITNESS_REVOKED" });
  });

  it("the grant registry file format is the documented one", () => {
    expect(canonicalize({ format: GRANT_REGISTRY_V1, grants: [grant()] })).toContain('"format":"bks-grant-registry.v1"');
  });
});
