/**
 * Unit tests of the v2 trusted writer that need no database: pure compiler determinism, registry validation,
 * plan custody / forgery refusal, partial-policy closure, witness verification, canonical URI identity, qualifier
 * grammar, KN-15 / OD-08 adjudication mapping, OD-17 contact stripping and the FU-03 fixture migration matrix.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { canonicalize, IngestionIntentV2, rawBytesDigest, type SealedVerificationBody } from "@bks/contracts";
import { applyV2, loadAuthenticPlan, selectStatements } from "./apply.js";
import { MemoryPlanStore } from "./custody.js";
import { intentDigestOf, planIntentV2 } from "./plan.js";
import { generateWitnessKeyPair, issueWitness, MemoryGrantAuthority, parsePinnedKeys, partialPolicyDigest, signWitness, verifyWitness } from "./witness.js";
import { catalogIntent, eventIntent, smallIntent } from "./write/fixtures-v2.js";
import { loadRelease, type ReleaseDdl } from "@bks/schema-workspace";
import { operationalDdlDrift, releaseDdlSelection, writerDdlNames } from "./fence.js";
import { splitCypherStatements } from "./operations.js";
import { loadPinnedRelease } from "./release-adapter.js";
import { buildFixtureRound, loadFixtureRound } from "./write/fixture-round.js";
import { migrateIntentV1 } from "./write/migrate-v1.js";
import { WriteSchema } from "./write/release-model.js";
import { planOffline } from "./write/offline.js";
import { writeSchema } from "./write/service.js";
import { PRINCIPALS, storedRecordFrom } from "./write/test-support.js";
import { canonicalizeUri, sourceUidFor } from "./write/uri.js";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..", "..", "..");
const schema = writeSchema();
const R = schema.schemaReleaseDigest;
const T0 = "2026-10-11T12:00:00Z";

function offline(intent: unknown, principal = PRINCIPALS.writer, plannedAt = T0, seed?: Record<string, unknown>, verifications?: Parameters<typeof planOffline>[2]["verifications"]) {
  return planOffline(schema, intent, { principal, plannedAt, ...(seed ? { seed } : {}), ...(verifications ? { verifications } : {}) });
}

describe("pure compiler", () => {
  it("is deterministic for the same context and binds the clock", () => {
    const a = offline(catalogIntent(R, "u1")).plan;
    const b = offline(catalogIntent(R, "u1")).plan;
    expect(b.planDigest).toBe(a.planDigest);
    expect(canonicalize(b)).toBe(canonicalize(a));
    const c = offline(catalogIntent(R, "u1"), PRINCIPALS.writer, "2026-10-11T12:00:01Z").plan;
    expect(c.planDigest).not.toBe(a.planDigest);
    expect(a.binding.plannedAt).toBe(T0);
    expect(a.binding.intentDigest).toBe(intentDigestOf(IngestionIntentV2.parse(catalogIntent(R, "u1"))));
  });

  it("admits every ordinary proposal kind of the catalog fixture and records P1/P9/P17/OD-17 effects", () => {
    const { plan } = offline(catalogIntent(R, "u1"));
    expect(plan.errors).toEqual([]);
    expect(plan.outcome).toBe("applicable");
    expect(new Set(plan.proposals.map((p) => p.kind))).toEqual(new Set(["lineage.start", "edge.structural", "edge.assert", "identifier.attach", "node.upsert", "assertion.literal", "assertion.relate", "assessment.record", "mention.stage"]));
    const cypher = plan.statements.map((s) => s.cypher).join("\n");
    expect(cypher).not.toMatch(/mongoResearchRunId|SUPPORTED_BY|agentRunUid|:Mention\b|MERGE \(m:KsIntentMarker/);
    expect(cypher).toMatch(/lastWriterRunId/);
    expect(plan.statements.every((s) => s.params.runId === "run-u1-r1")).toBe(true);
    // P17: REALIZES_SUBSTANCE is recorded-only; the episode statement carries no valid-time fields.
    const realizes = plan.statements.find((s) => s.purpose.startsWith("REALIZES_SUBSTANCE episode"))!;
    expect(realizes.cypher).not.toMatch(/validFrom/);
    const lv = plan.statements.find((s) => s.purpose.startsWith("HAS_LABEL_VERSION episode"))!;
    expect(lv.cypher).toMatch(/validFrom/);
    // OD-17: contact details stripped from the Person subject.
    const person = plan.subjects.find((s) => s.ref === "person")!;
    expect(person.rewrites.some((r) => r.rule === "OD-17")).toBe(true);
    expect(JSON.stringify(plan.statements)).not.toMatch(/advisor@example\.test|555\) 123-4567/);
    // OD-11: the plantPart field gets its own FIELD Assertion from the locator that reports it.
    expect(plan.proposals.find((p) => p.proposalId === "p-plantpart")!.mints.fieldAssertions).toMatch(/^hu:assertion:/);
    // P8: mention.stage -> RESOLUTION Assessment, no Mention node.
    expect(plan.statements.some((s) => s.purpose === "Assessment RESOLUTION")).toBe(true);
    // EX-04: tracking key stripped, query sorted, identity is the canonical-URI digest.
    const src = plan.sources.find((s) => s.ref === "label")!;
    expect(src.canonicalUri).toBe("https://fixtures.bks.test/u1/label?a=1&b=2");
    expect(src.sourceUid).toBe(sourceUidFor(src.canonicalUri));
  });

  it("holds SUPPORT-gated edges and rejects derived and unregistered writes", () => {
    const { plan } = offline(eventIntent(R, "u2"));
    const leads = plan.proposals.find((p) => p.proposalId === "p-leads")!;
    expect(leads.disposition).toBe("admitted");
    expect(leads.warnings.join(" ")).toMatch(/PROJECTION_GATED_SUPPORT/);
    expect(plan.statements.some((s) => /LEADS_TO episode/.test(s.purpose))).toBe(false);
    const bad = catalogIntent(R, "u3");
    bad.proposals = [
      { proposalId: "d1", kind: "edge.assert", relationshipType: "AFFECTS_MECHANISM", fromRef: "nr", toRef: "mech", evidence: ["l-claim"], asserterRef: "org" },
      { proposalId: "d2", kind: "assertion.relate", subjectRef: "nr", objectRef: "sp1", evidence: ["l-claim"], asserterRef: "org", assertion: { predicate: "MAGICALLY_CURES" } },
      { proposalId: "d3", kind: "assertion.literal", subjectRef: "org", evidence: ["l-maker"], asserterRef: "org", assertion: { predicate: "LEGAL_NAME", qualifiers: ["comparator:GE"] }, value: { valueString: "x" } },
      { proposalId: "d4", kind: "edge.assert", relationshipType: "OWNS_BRAND", fromRef: "org", toRef: "brand", evidence: [], asserterRef: "org" },
      { proposalId: "d5", kind: "assertion.relate", subjectRef: "nr", objectRef: "sp1", evidence: ["l-claim"], asserterRef: "brand", assertion: { predicate: "ACTIVATES" } },
      { proposalId: "d6", kind: "adjudication", verificationRef: { ref: "nope", digest: `sha256:${"0".repeat(64)}` } },
      { proposalId: "d7", kind: "report.publish", reportKind: "ANSWER", name: "x", policyVersion: "p", bodyDigest: `sha256:${"1".repeat(64)}`, citesAssertions: [{ proposal: "d2" }] },
      { proposalId: "d8", kind: "assertion.literal", subjectRef: "person", evidence: ["l-person"], asserterRef: "org", assertion: { predicate: "SPOUSE_OF" }, value: { valueString: "x" } },
    ];
    const p = offline(bad).plan;
    const r = Object.fromEntries(p.proposals.map((x) => [x.proposalId, x.reasons[0] ?? ""]));
    expect(r.d1).toMatch(/^DERIVED_EDGE_PROJECTION_ONLY/);
    expect(r.d2).toMatch(/^UNREGISTERED_PREDICATE/);
    expect(r.d3).toMatch(/comparator/);
    expect(r.d4).toMatch(/^EVIDENCE_REQUIRED/);
    expect(r.d5).toMatch(/^ASSERTER_TYPE_INVALID/);
    expect(r.d6).toMatch(/^BKS_FORBIDDEN_SCOPE/);
    expect(r.d7).toMatch(/^BKS_FORBIDDEN_SCOPE/);
    expect(r.d8).toMatch(/^PRIVATE_PERSON_DATA|^UNREGISTERED_PREDICATE/);
  });

  it("refuses a release mismatch and an unverifiable snapshot basis", () => {
    const mismatch = smallIntent(`sha256:${"9".repeat(64)}`, "u4", "a");
    expect(offline(mismatch).plan.errors[0]!.code).toBe("BKS_RELEASE_MISMATCH");
    const snap = smallIntent(R, "u4", "b");
    snap.basis = { snapshotRef: { ref: "forged-snapshot", digest: `sha256:${"a".repeat(64)}` } };
    const p = offline(snap).plan;
    expect(p.outcome).toBe("rejected");
    expect(p.errors[0]!.code).toBe("BKS_SNAPSHOT_UNVERIFIED");
  });
});

describe("plan custody and forgery refusal", () => {
  async function stored() {
    const intent = IngestionIntentV2.parse(smallIntent(R, "u5", "a"));
    const { plan, observations } = offline(intent);
    const store = new MemoryPlanStore();
    await store.put(storedRecordFrom(plan, { intent, observations, plannedAt: T0, executorVersion: plan.binding.executorVersion, agentUid: plan.activity.agentUid, agentName: "BellLabs knowledge executor", principal: { ...PRINCIPALS.writer, grants: [] }, basis: { kind: "creationOnly", reason: intent.basis && "creationOnly" in intent.basis ? intent.basis.creationOnly.reason : "", expectAbsent: [], expectPresent: [] } }));
    return { plan, store };
  }
  const deps = (store: MemoryPlanStore) => ({ schema, plans: store, snapshots: {} as never, witnessKeys: new Map() });

  it("loads an authentic stored plan by recompiling its frozen context", async () => {
    const { plan, store } = await stored();
    const rec = await loadAuthenticPlan(deps(store), plan.planRef, plan.planDigest);
    expect(rec.plan.planDigest).toBe(plan.planDigest);
  });

  it("refuses unknown refs, digest mismatches and tampered statements even with a recomputed hash", async () => {
    const { plan, store } = await stored();
    await expect(loadAuthenticPlan(deps(store), "pl-unknown", plan.planDigest)).rejects.toMatchObject({ code: "BKS_PLAN_NOT_FOUND" });
    await expect(loadAuthenticPlan(deps(store), plan.planRef, `sha256:${"b".repeat(64)}`)).rejects.toMatchObject({ code: "BKS_PLAN_DIGEST_MISMATCH" });
    // Tamper: replace a statement and re-hash the stored plan consistently. Recompilation exposes it.
    const raw = JSON.parse(store.records.get(plan.planRef)!);
    raw.plan.statements[0].cypher = "MATCH (n) DETACH DELETE n";
    const { planDigestOf } = await import("./plan.js");
    const { schemaVersion: _a, planRef: _b, planDigest: _c, ...body } = raw.plan;
    raw.plan.planDigest = planDigestOf(body);
    store.records.set(plan.planRef, JSON.stringify(raw));
    await expect(loadAuthenticPlan(deps(store), plan.planRef, raw.plan.planDigest)).rejects.toMatchObject({ code: "BKS_PLAN_FORGED" });
    // Tamper without re-hash: content no longer matches the digest.
    raw.plan.planDigest = plan.planDigest;
    store.records.set(plan.planRef, JSON.stringify(raw));
    await expect(loadAuthenticPlan(deps(store), plan.planRef, plan.planDigest)).rejects.toMatchObject({ code: "BKS_PLAN_FORGED" });
  });

  it("refuses a different plan under an existing planRef", async () => {
    const { plan, store } = await stored();
    const other = JSON.parse(store.records.get(plan.planRef)!);
    other.plan.planDigest = `sha256:${"c".repeat(64)}`;
    await expect(store.put(other)).rejects.toMatchObject({ code: "BKS_PLAN_FORGED" });
  });
});

describe("partial policy closure", () => {
  it("refuses 'all' with held proposals and non-closed subsets; selects a closed subset", () => {
    const intent = catalogIntent(R, "u6");
    intent.proposals.find((p) => p.proposalId === "p-supplies")!.hold = { reason: "awaiting buyer identity" };
    const { plan } = offline(intent);
    expect(plan.outcome).toBe("partial");
    expect(() => selectStatements(plan, "all")).toThrowError(/held or rejected/);
    expect(() => selectStatements(plan, { include: ["p-daily-max"] })).toThrowError(/not closed/);
    expect(() => selectStatements(plan, { include: ["p-supplies"] })).toThrowError(/held/);
    const sel = selectStatements(plan, { include: ["p-servings", "p-daily-max", "p-owns"] });
    expect(sel.included).toEqual(new Set(["p-servings", "p-daily-max", "p-owns"]));
    const purposes = sel.statements.map((s) => s.purpose);
    expect(purposes.some((p) => /OWNS_BRAND episode/.test(p))).toBe(true);
    expect(purposes.some((p) => /HAS_LABEL_VERSION episode/.test(p))).toBe(false);
    expect(purposes.some((p) => /create subject lv1/.test(p))).toBe(true);
    expect(purposes.some((p) => /create subject person/.test(p))).toBe(false);
  });
});

describe("admission witness", () => {
  const kp = generateWitnessKeyPair("k-test");
  const keys = parsePinnedKeys(`k-test:${kp.publicKeyDer}`);
  const { plan } = offline(smallIntent(R, "u7", "a"));
  const now = 1_800_000_000;
  const expect0 = { effectKey: "ek-1", scope: PRINCIPALS.writer, intentDigest: plan.binding.intentDigest, planDigest: plan.planDigest, schemaReleaseDigest: R, evidenceDigest: plan.binding.evidenceDigest, partialPolicyDigest: partialPolicyDigest("all"), policyVersion: plan.binding.policyVersion, nowSeconds: now + 5 };

  it("issues after an authority check and verifies every binding", async () => {
    const authority = new MemoryGrantAuthority();
    const w = await issueWitness(plan, { effectKey: "ek-1", partialPolicy: "all", principal: PRINCIPALS.writer }, { issuer: "test", signer: { kid: kp.kid, key: kp.privateKey }, authority, nowSeconds: now });
    const claims = verifyWitness(w, keys, expect0);
    expect(claims.aud).toBe("bks-executor");
    expect(claims.exp - claims.iat).toBeLessThanOrEqual(60);
    expect(() => verifyWitness(w, keys, { ...expect0, nowSeconds: now + 120 })).toThrowError(/expired/);
    expect(() => verifyWitness(w, keys, { ...expect0, effectKey: "other" })).toThrowError(/does not bind/);
    expect(() => verifyWitness(w, parsePinnedKeys(`k-test:${generateWitnessKeyPair("x").publicKeyDer}`), expect0)).toThrowError(/signature/);
    expect(() => verifyWitness({ ...w, kid: "unknown" }, keys, expect0)).toThrowError(/not a pinned issuer key/);
    const tampered = { ...w, payload: Buffer.from(Buffer.from(w.payload, "base64url").toString("utf8").replace('"ek-1"', '"ek-2"')).toString("base64url") };
    expect(() => verifyWitness(tampered, keys, expect0)).toThrowError(/signature/);
  });

  it("refuses long-lived witnesses, revoked principals and unavailable authority", async () => {
    const long = signWitness({ iss: "t", aud: "bks-executor", jti: "j-123456789", sub: "s", scope: { installationId: PRINCIPALS.writer.installationId, applicationId: PRINCIPALS.writer.applicationId, tenantId: PRINCIPALS.writer.tenantId }, effectKey: "ek-1", intentDigest: plan.binding.intentDigest, planDigest: plan.planDigest, schemaReleaseDigest: R, evidenceDigest: plan.binding.evidenceDigest, partialPolicyDigest: partialPolicyDigest("all"), policyVersion: plan.binding.policyVersion, decisionVersion: "d", iat: now, exp: now + 120, revocationGeneration: 0 }, { kid: kp.kid, key: kp.privateKey });
    expect(() => verifyWitness(long, keys, expect0)).toThrowError(/lifetime/);
    const authority = new MemoryGrantAuthority();
    authority.revoke(PRINCIPALS.writer);
    await expect(issueWitness(plan, { effectKey: "ek-1", partialPolicy: "all", principal: PRINCIPALS.writer }, { issuer: "t", signer: { kid: kp.kid, key: kp.privateKey }, authority, nowSeconds: now })).rejects.toMatchObject({ code: "BKS_FORBIDDEN_SCOPE" });
    const down = new MemoryGrantAuthority();
    down.available = false;
    await expect(issueWitness(plan, { effectKey: "ek-1", partialPolicy: "all", principal: PRINCIPALS.writer }, { issuer: "t", signer: { kid: kp.kid, key: kp.privateKey }, authority: down, nowSeconds: now })).rejects.toMatchObject({ code: "BKS_AUTHORITY_UNAVAILABLE" });
  });
});

describe("canonical URI identity (EX-04)", () => {
  it("keeps semantic query keys, strips tracking keys and normalizes order and aliases", () => {
    const a = canonicalizeUri("https://www.youtube.com/watch?v=AAA&utm_source=x");
    const b = canonicalizeUri("https://www.youtube.com/watch?v=BBB");
    expect(a.uri).toBe("https://www.youtube.com/watch?v=AAA");
    expect(sourceUidFor(a.uri)).not.toBe(sourceUidFor(b.uri));
    expect(canonicalizeUri("https://youtu.be/AAA?si=tracking").uri).toBe("https://www.youtube.com/watch?v=AAA");
    expect(canonicalizeUri("HTTPS://Example.TEST:443/p/?b=2&a=1#frag").uri).toBe("https://example.test/p?a=1&b=2");
  });
});

describe("KN-15 adjudication table and OD-08 rendition exception", () => {
  const assertionUid = "hu:assertion:kn15-test";
  const seedFor = (status: string, basis: string, attempts: unknown[] | null) => ({
    [`assertion:${assertionUid}`]: { predicate: "ACTIVATES", assertionKind: "RELATIONSHIP", status, polarity: "POSITIVE", recordedTo: null, subjectUid: "hu:substance:x", objectUid: "hu:molecular-entity:y", asserterUid: "hu:org:z", evidence: [{ uid: "hu:locator:l1", role: "SUPPORTS", snapshotUid: "hu:snapshot:s1", contentHashBasis: basis, sourceUid: "hu:source:s" }] },
    "attempts:hu:source:s": attempts,
  });
  const body = (over: Partial<SealedVerificationBody>): SealedVerificationBody => ({ format: "bks-sealed-verification.v1", ref: "v1", issuer: "ks-verification", judgmentId: `j-${Math.random()}`, assertionUid, adjudicationKind: "CAPTURE_FIDELITY", verdict: "DIRECTLY_SUPPORTED", policyOutcome: "PASS", judgeKind: "NLI", methodVersion: "verifier/1", properties: {}, unsupportedFacets: [], evidence: [], run: { system: "ks-verification", runId: "vr-1" }, policy: { toolRenditionException: false }, sealedAt: T0, ...over });
  const run = (status: string, basis: string, attempts: unknown[] | null, b: SealedVerificationBody) => {
    const intent = { schemaVersion: "biotech-knowledge-intent.v2", intentId: "kn15", pins: { schemaReleaseDigest: R, policyVersion: "p" }, context: { actor: { kind: "service", id: "v" }, run: { system: "ks-verification", runId: "vr-1" }, activityKind: "VERIFICATION" }, basis: { creationOnly: { reason: "unit test of the KN-15 table" } }, proposals: [{ proposalId: "a", kind: "adjudication", verificationRef: { ref: "v1", digest: `sha256:${"d".repeat(64)}` } }] };
    const { plan } = offline(intent, PRINCIPALS.verifier, T0, seedFor(status, basis, attempts), new Map([[`v1|sha256:${"d".repeat(64)}`, { ref: "v1", digest: `sha256:${"d".repeat(64)}`, body: b }]]));
    const p = plan.proposals[0]!;
    const transition = plan.statements.find((s) => /KN-15/.test(s.purpose));
    return { disposition: p.disposition, to: (transition?.params.to as string | undefined) ?? null, warnings: p.warnings.join(" ") };
  };
  it("maps verdict x policy to status, never lets SUPPORT or synthetic decisions change it, and holds human decisions to held results", () => {
    expect(run("EXTRACTED", "RAW_BYTES", null, body({})).to).toBe("ACCEPTED");
    expect(run("EXTRACTED", "RAW_BYTES", null, body({ policyOutcome: "REVIEW" })).to).toBe("PROPOSED");
    expect(run("EXTRACTED", "RAW_BYTES", null, body({ verdict: "CONTRADICTED" })).to).toBe("REJECTED");
    expect(run("EXTRACTED", "RAW_BYTES", null, body({ verdict: "SOURCE_UNAVAILABLE" })).to).toBe("UNRESOLVED");
    expect(run("EXTRACTED", "RAW_BYTES", null, body({ mechanicalStatus: "failed" })).to).toBe("DISPUTED");
    expect(run("EXTRACTED", "RAW_BYTES", null, body({ adjudicationKind: "SUPPORT" })).to).toBeNull();
    expect(run("PROPOSED", "RAW_BYTES", null, body({ decision: "AFFIRM", decisionProvenance: "HUMAN_ORIGIN" })).to).toBe("ACCEPTED");
    expect(run("PROPOSED", "RAW_BYTES", null, body({ decision: "REJECT", decisionProvenance: "HUMAN_ORIGIN" })).to).toBe("REJECTED");
    expect(run("PROPOSED", "RAW_BYTES", null, body({ decision: "DEFER", decisionProvenance: "HUMAN_ORIGIN" })).to).toBeNull();
    expect(run("PROPOSED", "RAW_BYTES", null, body({ decision: "AFFIRM", decisionProvenance: "SYNTHETIC_ENGINEERING" })).to).toBeNull();
    expect(run("PROPOSED", "RAW_BYTES", null, body({ decision: "AFFIRM", decisionProvenance: "HUMAN_ORIGIN", mechanicalStatus: "failed" })).warnings).toMatch(/MECHANICAL_FAILURE_STANDS/);
  });
  it("accepts tool-rendition-only evidence only with PASS_WITH_WARNINGS, policy permission and a recorded failed attempt", () => {
    expect(run("EXTRACTED", "TOOL_RENDITION", null, body({ policyOutcome: "PASS_WITH_WARNINGS", policy: { toolRenditionException: true } })).to).toBe("PROPOSED");
    expect(run("EXTRACTED", "TOOL_RENDITION", [{ uid: "a", outcome: "FAILED", failureKind: "BOT_CHALLENGE" }], body({ policyOutcome: "PASS_WITH_WARNINGS", policy: { toolRenditionException: false } })).to).toBe("PROPOSED");
    expect(run("EXTRACTED", "TOOL_RENDITION", [{ uid: "a", outcome: "FAILED", failureKind: "BOT_CHALLENGE" }], body({ policyOutcome: "PASS_WITH_WARNINGS", policy: { toolRenditionException: true } })).to).toBe("ACCEPTED");
    expect(run("EXTRACTED", "TOOL_RENDITION", [{ uid: "a", outcome: "FAILED", failureKind: "BOT_CHALLENGE" }], body({ policyOutcome: "PASS_WITH_WARNINGS", policy: { toolRenditionException: true } })).warnings).toMatch(/OD08_RENDITION_EXCEPTION/);
  });
  it("refuses ordinary writers declaring adjudications", () => {
    const intent = { schemaVersion: "biotech-knowledge-intent.v2", intentId: "kn15b", pins: { schemaReleaseDigest: R, policyVersion: "p" }, context: { actor: { kind: "agent", id: "a" }, run: { system: "mission-control", runId: "r" }, activityKind: "INGESTION" }, basis: { creationOnly: { reason: "unit test denied adjudication" } }, proposals: [{ proposalId: "a", kind: "adjudication", verificationRef: { ref: "v1", digest: `sha256:${"d".repeat(64)}` } }] };
    const { plan } = offline(intent, PRINCIPALS.writer, T0, seedFor("EXTRACTED", "RAW_BYTES", null), new Map([[`v1|sha256:${"d".repeat(64)}`, { ref: "v1", digest: `sha256:${"d".repeat(64)}`, body: body({}) }]]));
    expect(plan.proposals[0]!.reasons[0]).toMatch(/^BKS_FORBIDDEN_SCOPE/);
  });
});

describe("v2 example and cross-language digest golden", () => {
  it("the v2 example pins the served release and plans applicable", () => {
    const ex = JSON.parse(readFileSync(resolve(repo, "examples", "ingestion-intent.v2.example.json"), "utf8"));
    expect(ex.pins.schemaReleaseDigest).toBe(R);
    const { plan } = offline(ex);
    expect(plan.outcome).toBe("applicable");
  });

  it("intent and plan digests of the example match packages/contracts/golden/intent-digest.v2.json (also verified by Python)", () => {
    const ex = JSON.parse(readFileSync(resolve(repo, "examples", "ingestion-intent.v2.example.json"), "utf8"));
    const normalized = IngestionIntentV2.parse(ex);
    const { plan } = offline(ex);
    const { schemaVersion: _a, planRef: _b, planDigest: _c, ...body } = plan;
    const golden = { format: "bks-digest-golden.v2", description: "Normalized v2 example intent and its offline plan body with their bks-canonical-json.v2 digests. Regenerate with BKS_UPDATE_GOLDEN=1.", intent: { normalized, profile: { sets: ["proposals[].dependsOn", "proposals[].assertion.qualifiers", "proposals[].qualifiers", "proposals[].facets", "basis.creationOnly.expectAbsent", "basis.creationOnly.expectPresent", "sources[].locators[].reportsFields"] }, digest: intentDigestOf(normalized) }, plan: { body, profile: { sets: ["binding.principal.grants"] }, digest: plan.planDigest } };
    const path = resolve(repo, "packages", "contracts", "golden", "intent-digest.v2.json");
    if (process.env.BKS_UPDATE_GOLDEN === "1") writeFileSync(path, `${JSON.stringify(golden, null, 2)}\n`);
    const stored = JSON.parse(readFileSync(path, "utf8"));
    expect(stored.intent.digest).toBe(golden.intent.digest);
    expect(stored.plan.digest).toBe(golden.plan.digest);
    expect(canonicalize(stored.intent.normalized)).toBe(canonicalize(normalized));
  });
});

describe("FU-03 fixture migration (77 packet intents + example + cross-domain)", () => {
  it("migrates every v1 intent to v2, plans it without throwing and states a reason for every non-admitted proposal", () => {
    const root = resolve(repo, "schema", "program", "final", "fixtures");
    const files: string[] = [];
    (function walk(d: string) {
      for (const f of readdirSync(d)) {
        const p = join(d, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/^intent.*\.json$/.test(f)) files.push(p);
      }
    })(root);
    files.push(resolve(repo, "examples", "ingestion-intent.example.json"));
    expect(files.length).toBe(82);
    const rows: Array<Record<string, unknown>> = [];
    for (const f of files.sort()) {
      const bytes = readFileSync(f);
      const m = migrateIntentV1(JSON.parse(bytes.toString("utf8")), schema, { path: relative(repo, f).replace(/\\/g, "/"), rawBytesDigest: rawBytesDigest(bytes) });
      const intent = IngestionIntentV2.parse(m.intent);
      const { plan } = offline(intent);
      expect(["applicable", "partial", "held", "rejected", "noop"]).toContain(plan.outcome);
      for (const p of plan.proposals) if (p.disposition === "held" || p.disposition === "rejected") expect(p.reasons.length).toBeGreaterThan(0);
      if (plan.outcome === "rejected" && !plan.errors.length) expect(plan.proposals.every((p) => p.reasons.length > 0)).toBe(true);
      const count = (d: string) => plan.proposals.filter((p) => p.disposition === d).length;
      const firstReasons = [...new Set(plan.proposals.filter((p) => p.disposition === "held" || p.disposition === "rejected").map((p) => (p.reasons[0] ?? "").split(":")[0]))].slice(0, 6);
      rows.push({ path: relative(repo, f).replace(/\\/g, "/"), intentId: intent.intentId, outcome: plan.outcome, proposals: plan.proposals.length, admitted: count("admitted"), noop: count("noop_duplicate"), held: count("held"), rejected: count("rejected"), errors: plan.errors.map((e) => e.code), reasons: firstReasons, subjectsBlocked: plan.subjects.filter((s) => s.disposition !== "create" && s.disposition !== "use_existing").map((s) => (s.reasons[0] ?? "").split(":")[0]).filter((x, i, a) => a.indexOf(x) === i), edits: m.edits.length, mappedHints: m.mappedHints, gapsHeld: m.gaps.filter((g) => g.handling === "held").length, gapsRecorded: m.gaps.filter((g) => g.handling === "recorded").length, planDigest: plan.planDigest });
    }
    const out = resolve(repo, "runs", "release-v2", "s3");
    mkdirSync(out, { recursive: true });
    writeFileSync(resolve(out, "fixture-matrix.offline.json"), `${JSON.stringify({ generatedBy: "packages/kg-ops/src/write.test.ts", releaseDigest: R, mode: "offline (empty graph)", rows }, null, 2)}\n`);
    expect(rows.length).toBe(82);
  });
});

describe("FU-03 fixture round v2 (schema/program/final/fixtures-v2)", () => {
  it("is reproducible from the original fixtures; no proposal is left rejected; every hold names a gap class", { timeout: 600_000 }, () => {
    const built = buildFixtureRound({ repo, schema, principal: PRINCIPALS.writer, plannedAt: T0, write: process.env.BKS_UPDATE_ROUND === "1" });
    const stored = loadFixtureRound(repo);
    expect(stored.manifest.schemaReleaseDigest).toBe(R);
    expect(built.order).toEqual(stored.manifest.order);
    expect(built.totals).toEqual(stored.manifest.totals);
    expect(built.rows.length).toBe(82);
    for (const [i, row] of built.rows.entries()) {
      expect(canonicalize(JSON.parse(readFileSync(resolve(repo, row.out), "utf8")))).toBe(canonicalize(stored.intents[i]!.intent));
      expect(row.after.rejected, row.path).toBe(0);
      expect(row.after.errors, row.path).toEqual([]);
      for (const h of row.residualHolds) expect(["EVIDENCE_GAP", "DEPENDENCY", "SEMANTIC"]).toContain(h.gapClass);
      // Required-property fills cite a value the fixture itself states.
      for (const e of row.edits.filter((x) => x.rule === "required-property")) expect(e.provenance).toMatch(/^stated by the fixture: /);
      // Schema unknown markers (lead decision, OD-24 / OD-25): kind fields only, the enum's explicit unknown member,
      // recorded as not stated in the intent provenance as well as in ROUND.json.
      const markers = row.edits.filter((x) => x.rule === "schema-unknown-marker");
      const prov = ((stored.intents[i]!.intent as { provenance?: { edits?: Array<{ at: string; rule: string }> } }).provenance?.edits ?? []).filter((x) => x.rule === "schema-unknown-marker");
      expect(prov.map((x) => x.at).sort()).toEqual(markers.map((x) => x.at).sort());
      for (const e of markers) {
        expect(e.at).toMatch(/(Kind|Family|Type)$/);
        expect(["UNSPECIFIED", "UNRESOLVED", "UNKNOWN", "NOT_REPORTED", "NOT_STATED"]).toContain(e.to);
        expect(e.provenance).toMatch(/^not stated by the fixture source/);
      }
    }
    // KN-06 / R-42: identifiers a fixture states with a locator are attached in the same plan as the created subject.
    const acryl = stored.intents.find((x) => x.path.includes("acrylamide-fried-potato-harm"))!;
    const { plan: acrylPlan } = offline(acryl.intent);
    expect(acrylPlan.proposals.find((p) => p.proposalId === "id.acrylamide.pubchem-cid")?.disposition).toBe("admitted");
    expect(acrylPlan.effects.nodes.some((n) => n.label === "Identifier" && n.op === "create")).toBe(true);
    expect(acrylPlan.effects.relationships.some((r) => r.type === "HAS_IDENTIFIER" && r.op === "create")).toBe(true);
    expect(built.totals.edits["identifier-evidence"]).toBeGreaterThan(0);
    const out = resolve(repo, "runs", "release-v2", "s3");
    mkdirSync(out, { recursive: true });
    writeFileSync(resolve(out, "fixture-matrix.round-v2.offline.json"), `${JSON.stringify({ generatedBy: "packages/kg-ops/src/write.test.ts", releaseDigest: R, mode: "offline, round order, earlier effects seeded", totals: built.totals, rows: built.rows.map((r) => ({ path: r.out, before: r.before, after: r.after, edits: r.edits.length, holdsAdded: r.holdsAdded.length, residualHolds: r.residualHolds.length })) }, null, 2)}\n`);
  });
});

describe("release override (loadRelease({dir}))", () => {
  // Formerly the staged upstream ../biotech-meta v2.0.1 bundle (absent, retired). The in-repo, non-pinned v2.1.0 source
  // release exercises the same explicit override path.
  it("the writer serves a non-pinned in-repo release (biotech-schema-v2.1.0 source) through an explicit override directory", () => {
    const dir = resolve(repo, "schema", "source", "biotech-schema-v2.1.0");
    const inputs = loadPinnedRelease({ dir });
    expect(inputs.bundle?.source).toBe("override");
    expect(inputs.releaseId).toBe("biotech-schema-v2.1.0");
    const s = new WriteSchema(inputs);
    expect(s.executorOpsSource).toBe("release");
    expect(operationalDdlDrift(inputs.ddl!, s)).toEqual([]);
    const ex = JSON.parse(readFileSync(resolve(repo, "examples", "ingestion-intent.v2.example.json"), "utf8"));
    ex.pins.schemaReleaseDigest = s.schemaReleaseDigest;
    const { plan } = planOffline(s, ex, { principal: PRINCIPALS.writer, plannedAt: T0 });
    expect(plan.outcome).toBe("applicable");
    expect(s.node("QualityResult")!.executorOps.has("update")).toBe(true);
    expect(s.node("Chunk")!.projectionOnly).toBe(true);
  });
});

describe("phase-aware release DDL (v2.0.1 pinned, v2.0.2 staged) and MEASURES assertionUid", () => {
  it("v2.0.1: statements without a phase are pre-migration; the selection equals required.cypher (+ enterprise.cypher)", () => {
    // v2.0.1 (no phase field) loaded as an override; the pinned release is v2.0.2 (phased).
    const dir = resolve(repo, "..", "biotech-meta", "docs", "schema", "releases", "biotech-schema-v2.0.1");
    if (!existsSync(join(dir, "release.json"))) return;
    const ddl = loadRelease({ dir, cache: false }).ddl;
    const all = releaseDdlSelection(ddl, { enterprise: true, phase: "all" });
    expect(releaseDdlSelection(ddl, { enterprise: true, phase: "pre" }).statements).toEqual(all.statements);
    expect(releaseDdlSelection(ddl, { enterprise: true, phase: "post" }).statements).toEqual([]);
    expect(all.blocked).toEqual([]);
    {
      const norm = (xs: string[]) => xs.map((x) => x.replace(/\s+/g, " ").trim()).sort();
      expect(norm(all.statements)).toEqual(norm([...splitCypherStatements(ddl.required), ...splitCypherStatements(ddl.enterprise)]));
      expect(norm(releaseDdlSelection(ddl, { enterprise: false }).statements)).toEqual(norm(splitCypherStatements(ddl.required)));
    }
  });

  it("v2.0.2 (pinned): pre / post phases, blocked-by-legacy-data statements are skipped and reported", () => {
    const pinned = releaseDdlSelection(schema.release.ddl!, { enterprise: true, phase: "all" });
    expect([...pinned.names].sort()).toEqual([...releaseDdlSelection(schema.release.ddl!, { enterprise: true, phase: "pre" }).names, ...releaseDdlSelection(schema.release.ddl!, { enterprise: true, phase: "post" }).names].sort());
    const dir = resolve(repo, "..", "biotech-meta", "docs", "schema", "releases", "biotech-schema-v2.0.2");
    if (!existsSync(join(dir, "ddl", "ddl.json"))) return;
    let ddl: ReleaseDdl;
    try {
      ddl = loadRelease({ dir, cache: false }).ddl;
    } catch {
      // A staged bundle may not verify yet; the selection only needs ddl.json.
      ddl = { manifest: JSON.parse(readFileSync(join(dir, "ddl", "ddl.json"), "utf8")), required: "", enterprise: "", optional: "" } as ReleaseDdl;
    }
    const pre = releaseDdlSelection(ddl, { enterprise: true, phase: "pre" });
    const post = releaseDdlSelection(ddl, { enterprise: true, phase: "post" });
    const all = releaseDdlSelection(ddl, { enterprise: true, phase: "all" });
    expect(all.statements.length).toBe(pre.statements.length + post.statements.length);
    expect(post.blocked.map((b) => b.name)).toContain("rel_MEASURES_assertion_exists");
    expect(all.names).not.toContain("rel_MEASURES_assertion_exists");
    expect(pre.blocked).toEqual([]);
    expect(releaseDdlSelection(ddl, { enterprise: false, phase: "post" }).blocked).toEqual([]);
    for (const n of writerDdlNames()) expect(pre.names).toContain(n);
  });

  it("the writer stamps assertionUid on new MEASURES edges (the blocked Enterprise existence constraint is enforced by the executor)", () => {
    const intent = smallIntent(R, "measures", "m") as unknown as { subjects: unknown[]; proposals: unknown[] };
    intent.subjects.push(
      { ref: "od", mode: "new", nodeType: "OutcomeDefinition", name: "Synthetic outcome definition (MEASURES test)", uidSegment: "syn-od-measures", properties: { outcomeKey: "syn-od-1", priority: "PRIMARY", measureKind: "BIOMARKER" }, onMatch: "use_existing" },
      { ref: "bm", mode: "new", nodeType: "Biomarker", name: "Synthetic biomarker (MEASURES test)", uidSegment: "syn-bm-measures", properties: { biomarkerKind: "METABOLITE" }, onMatch: "use_existing" },
    );
    intent.proposals.push({ proposalId: "p-measures", kind: "edge.assert", relationshipType: "MEASURES", fromRef: "od", toRef: "bm", asserterRef: "org", evidence: ["l"], assertion: { validity: {} } });
    const { plan } = offline(intent);
    const p = plan.proposals.find((x) => x.proposalId === "p-measures")!;
    expect(p.disposition, p.reasons.join(" | ")).toBe("admitted");
    const edge = plan.effects.relationships.find((r) => r.type === "MEASURES" && r.op === "create")!;
    expect(edge.assertionUid).toBe(p.mints.assertion);
    const stmt = plan.statements.find((s) => s.id === edge.statementId)!;
    expect(stmt.cypher).toMatch(/r\.assertionUid = \$assertionUid/);
    expect(stmt.params.assertionUid).toBe(p.mints.assertion);
  });
});

describe("WR-19 temporal precondition: a cited snapshot cannot be retrieved after the service instant", () => {
  const withSnapshot = (retrievedAt: string, observedAt?: string) => {
    const intent = smallIntent(R, "wr19", `t${retrievedAt.replace(/[^0-9]/g, "").slice(0, 12)}${observedAt ? "o" : ""}`) as unknown as { sources: Array<{ snapshot: Record<string, unknown> }> };
    intent.sources[0]!.snapshot.retrievedAt = retrievedAt;
    if (observedAt) intent.sources[0]!.snapshot.observedAt = observedAt;
    else delete intent.sources[0]!.snapshot.observedAt;
    return intent;
  };

  it("plan time: a future retrievedAt (or observedAt after retrievedAt) rejects with BKS_STALE_PRECONDITION; an equal instant is accepted", () => {
    const future = offline(withSnapshot("2027-03-01T00:00:00Z", "2027-03-01T00:00:00Z")).plan;
    expect(future.outcome).toBe("rejected");
    const e = future.errors.find((x) => x.code === "BKS_STALE_PRECONDITION")!;
    expect(e.message).toMatch(/^s: snapshot retrievedAt 2027-03-01T00:00:00Z is after the service instant 2026-10-11T12:00:00Z/);
    const observedLater = offline(withSnapshot("2026-10-01T00:00:00Z", "2026-10-02T00:00:00Z")).plan;
    expect(observedLater.outcome).toBe("rejected");
    expect(observedLater.errors.find((x) => x.code === "BKS_STALE_PRECONDITION")!.message).toMatch(/observedAt 2026-10-02T00:00:00Z is after its retrievedAt/);
    const boundary = offline(withSnapshot(T0, T0)).plan;
    expect(boundary.outcome, JSON.stringify(boundary.errors)).toBe("applicable");
  });

  it("apply time: the apply clock re-checks it, so a plan made at the snapshot instant cannot be applied before it", async () => {
    const intent = IngestionIntentV2.parse(withSnapshot(T0, T0));
    const { plan, observations } = offline(intent);
    expect(plan.outcome).toBe("applicable");
    const store = new MemoryPlanStore();
    await store.put(storedRecordFrom(plan, { intent, observations, plannedAt: T0, executorVersion: plan.binding.executorVersion, agentUid: plan.activity.agentUid, agentName: "BellLabs knowledge executor", principal: { ...PRINCIPALS.writer, grants: [] }, basis: { kind: "creationOnly", reason: "creationOnly" in intent.basis ? intent.basis.creationOnly.reason : "", expectAbsent: [], expectPresent: [] } }));
    const deps = { schema, plans: store, snapshots: {} as never, witnessKeys: new Map() };
    const req = { schemaVersion: "biotech-knowledge-apply.v2", planRef: plan.planRef, expectedPlanDigest: plan.planDigest, intentDigest: plan.binding.intentDigest, effectKey: "ek-wr19", partialPolicy: "all", witness: { format: "bks-apply-witness.v1", kid: "none", alg: "Ed25519", payload: "e30", signature: "AA" } };
    // One second before the snapshot instant: refused before any witness or database work.
    await expect(applyV2(null as never, deps, req, { principal: PRINCIPALS.writer, now: () => new Date(Date.parse(T0) - 1000) })).rejects.toMatchObject({ code: "BKS_STALE_PRECONDITION" });
    // At the instant itself the temporal rule passes; the request then fails later on the (deliberately invalid) witness.
    await expect(applyV2(null as never, deps, req, { principal: PRINCIPALS.writer, now: () => new Date(T0) })).rejects.not.toMatchObject({ code: "BKS_STALE_PRECONDITION" });
  });
});
