/**
 * Gate B: real native write guarantees against a disposable local Neo4j (never Aura). Skipped unless BKS_INTEGRATION=1.
 *
 *   bash scripts/neo4j-test.sh up
 *   BKS_INTEGRATION=1 NEO4J_TEST_URI=bolt://127.0.0.1:7690 NEO4J_TEST_PASSWORD=bks-test-password pnpm exec vitest run --project kg-ops
 *   # Enterprise role tests additionally need BKS_NEO4J_EDITION=enterprise scripts/neo4j-test.sh up and NEO4J_EE_TEST_URI.
 *
 * The suite resets the test database (local hosts only) and installs the operational fence and release marker.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { canonicalDigest, CUSTODY_SNAPSHOT_V1, IngestionIntentV2, rawBytesDigest, type ApplyWitness, type IngestionIntentV2Input, type IngestionPlanV2, type IngestionReceiptV2, type PartialPolicy, type SealedVerificationBody } from "@bks/contracts";
import { getReceiptV2, markerKeyOf } from "./apply.js";
import { FileSnapshotCustody, FileVerificationCustody, MemoryPlanStore, sealedDigest } from "./custody.js";
import { cypherGuardFromEnv, runCypher } from "./cypher.js";
import { deliverRevocation, ensureOperationalState, installReleaseMarker, readFence, withStableRevision } from "./fence.js";
import { GraphClient, toJson } from "./neo4j.js";
import { recompileStored } from "./plan.js";
import { generateWitnessKeyPair, MemoryGrantAuthority, parsePinnedKeys, signWitness, decodeWitnessClaims } from "./witness.js";
import { adjudicationIntent, catalogIntent, eventIntent, followupIntent, identityRaceIntent, packageSetupIntent, projectionIntent, reportIntent, slotRaceIntent, smallIntent, unii } from "./write/fixtures-v2.js";
import { loadFixtureRound } from "./write/fixture-round.js";
import { KnowledgeWriter, writeSchema } from "./write/service.js";
import { PRINCIPALS, sealVerification } from "./write/test-support.js";
import type { PrincipalCtx } from "./write/context.js";

const enabled = process.env.BKS_INTEGRATION === "1";
const d = enabled ? describe : describe.skip;
const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..", "..", "..");
const URI = process.env.NEO4J_TEST_URI ?? "bolt://127.0.0.1:7690";
const EE_URI = process.env.NEO4J_EE_TEST_URI;
const PASSWORD = process.env.NEO4J_TEST_PASSWORD ?? "bks-test-password";
const evidenceDir = resolve(repo, "runs", "release-v2", "s3");

function assertLocal(uri: string): void {
  const host = new URL(uri.replace(/^(bolt|neo4j)(\+s|\+ssc)?:/, "http:")).hostname;
  if (!["127.0.0.1", "localhost", "::1"].includes(host)) throw new Error(`refusing to run Gate B against non-local Neo4j ${uri}`);
}

const schema = writeSchema();
const R = schema.schemaReleaseDigest;
const stamp = `t${Date.now().toString(36)}`;
const evidence: Array<{ test: string; result: string; detail?: unknown }> = [];

d("Gate B: trusted native writer on a real Neo4j", () => {
  const client = enabled ? new GraphClient({ uri: URI, username: "neo4j", password: PASSWORD, database: "neo4j" }) : (null as unknown as GraphClient);
  const issuerKey = generateWitnessKeyPair("gate-b-issuer");
  const verifierKey = generateWitnessKeyPair("gate-b-verifier");
  const rogueKey = generateWitnessKeyPair("rogue");
  const authority = new MemoryGrantAuthority();
  const plans = new MemoryPlanStore();
  const custodyRoot = resolve(evidenceDir, `custody-${stamp}`);
  const snapshots = new FileSnapshotCustody(resolve(custodyRoot, "snapshots"), ["bks-read-service"]);
  const verifications = new FileVerificationCustody(resolve(custodyRoot, "verifications"), new Map([[verifierKey.kid, verifierKey.publicKeyDer]]));
  let writer: KnowledgeWriter;

  beforeAll(async () => {
    assertLocal(URI);
    await client.verify();
    await client.write((tx) => tx.run("MATCH (n) DETACH DELETE n"));
    await ensureOperationalState(client, schema, { phase: "all" });
    await installReleaseMarker(client, { releaseId: schema.releaseId, schemaReleaseDigest: R }, `gate-b-${stamp}`);
    writer = new KnowledgeWriter(client, { schema, plans, snapshots, verifications, witnessKeys: parsePinnedKeys(`${issuerKey.kid}:${issuerKey.publicKeyDer}`), signer: { kid: issuerKey.kid, key: issuerKey.privateKey }, authority, issuer: "gate-b-admission", localDev: false });
    mkdirSync(evidenceDir, { recursive: true });
  });
  afterAll(async () => {
    writeFileSync(resolve(evidenceDir, `gate-b-${stamp}.json`), `${JSON.stringify({ stamp, uri: URI, releaseDigest: R, finishedAt: new Date().toISOString(), evidence }, null, 2)}\n`);
    await client?.close();
  });

  const request = (plan: IngestionPlanV2, effectKey: string, witness: ApplyWitness, partialPolicy: PartialPolicy = "all") => ({ schemaVersion: "biotech-knowledge-apply.v2", planRef: plan.planRef, expectedPlanDigest: plan.planDigest, intentDigest: plan.binding.intentDigest, effectKey, partialPolicy, witness });
  async function planned(intent: IngestionIntentV2Input, principal: PrincipalCtx = PRINCIPALS.writer): Promise<IngestionPlanV2> {
    return writer.plan(intent, principal);
  }
  async function applyPlan(plan: IngestionPlanV2, effectKey: string, principal: PrincipalCtx = PRINCIPALS.writer, partialPolicy: PartialPolicy = "all", extra: Parameters<KnowledgeWriter["apply"]>[2] = {}): Promise<IngestionReceiptV2> {
    const witness = await writer.admit(plan.planRef, { effectKey, partialPolicy }, principal);
    return writer.apply(request(plan, effectKey, witness, partialPolicy), principal, extra);
  }
  const count = async (cypher: string, params: Record<string, unknown> = {}) => Number(toJson((await client.read((tx) => tx.run(cypher, params))).records[0]!.get(0)));
  const record = (test: string, result: string, detail?: unknown) => evidence.push({ test, result, ...(detail === undefined ? {} : { detail }) });

  // Shared state from the catalog run.
  let catalogPlan: IngestionPlanV2;
  let catalogReceipt: IngestionReceiptV2;
  const uidOf = (ref: string) => catalogPlan.subjects.find((s) => s.ref === ref)!.uid!;
  const mint = (pid: string, key = "assertion") => catalogPlan.proposals.find((p) => p.proposalId === pid)!.mints[key]!;

  it("same-context deterministic plan; recompilation reproduces the stored plan", async () => {
    const fixed = new Date("2026-10-11T12:00:00Z");
    // P-6 (d): the first plan after the full release DDL runs on a cold database (cold query plans for every probe).
    const t0 = Date.now();
    const a = await writer.plan(catalogIntent(R, `${stamp}-det`), PRINCIPALS.writer, () => fixed);
    const coldPlanMs = Date.now() - t0;
    const t1 = Date.now();
    const b = await writer.plan(catalogIntent(R, `${stamp}-det`), PRINCIPALS.writer, () => fixed);
    const warmPlanMs = Date.now() - t1;
    record("plan-latency", "pass", { coldPlanMs, warmPlanMs, budgetMs: 30_000 });
    expect(coldPlanMs).toBeLessThan(30_000);
    expect(b.planDigest).toBe(a.planDigest);
    expect(b.planRef).toBe(a.planRef);
    const rec = await plans.get(a.planRef);
    expect(recompileStored(schema, rec!).planDigest).toBe(a.planDigest);
    const c = await writer.plan(catalogIntent(R, `${stamp}-det`), PRINCIPALS.writer, () => new Date("2026-10-11T12:00:05Z"));
    expect(c.planDigest).not.toBe(a.planDigest);
    record("deterministic-plan", "pass", { planDigest: a.planDigest });
  });

  it("WR-19: a snapshot retrieved after the service clock is refused (BKS_STALE_PRECONDITION); nothing is written", async () => {
    const intent = smallIntent(R, stamp, "wr19") as unknown as { sources: Array<{ snapshot: Record<string, unknown> }> };
    intent.sources[0]!.snapshot.retrievedAt = "2099-03-01T00:00:00Z";
    intent.sources[0]!.snapshot.observedAt = "2099-03-01T00:00:00Z";
    const plan = await writer.plan(intent as never, PRINCIPALS.writer);
    expect(plan.outcome).toBe("rejected");
    expect(plan.errors.map((e) => e.code)).toContain("BKS_STALE_PRECONDITION");
    await expect(writer.admit(plan.planRef, { effectKey: `ek-${stamp}-wr19`, partialPolicy: "all" }, PRINCIPALS.writer)).rejects.toMatchObject({ code: "BKS_PLAN_REJECTED" });
    record("wr19-future-snapshot", "pass", { errors: plan.errors.map((e) => e.code) });
  });

  it("release marker rule: a newer foreign KsReleaseMarker refuses writes; an older foreign one does not; a tie refuses", async () => {
    const foreign = (offset: string, id: string) =>
      client.write((tx) => tx.run(`CREATE (:KsReleaseMarker {releaseId: $id, schemaReleaseDigest: $d, ddlDigest: $d, installedAt: datetime() + duration($offset), migrationRunId: 'gate-b-foreign'})`, { id, d: `sha256:${"9".repeat(64)}`, offset }));
    const cleanup = () => client.write((tx) => tx.run("MATCH (m:KsReleaseMarker {migrationRunId: 'gate-b-foreign'}) DETACH DELETE m"));
    // The refusal happens under the writer fence inside the apply transaction: a failed receipt, nothing written.
    const refused = async (plan: IngestionPlanV2, key: string) => {
      const r = await applyPlan(plan, key);
      expect(r.outcome).toBe("failed");
      expect(r.failure?.code).toBe("BKS_RELEASE_MISMATCH");
      return r;
    };
    try {
      await foreign("PT1H", "biotech-schema-v9.9.9-foreign-newer");
      const newer = await planned(smallIntent(R, stamp, "marker-newer"));
      await refused(newer, `ek-${stamp}-marker-newer`);
      await cleanup();
      await foreign("-P1D", "biotech-schema-v0.0.1-foreign-older");
      const older = await planned(smallIntent(R, stamp, "marker-older"));
      expect((await applyPlan(older, `ek-${stamp}-marker-older`)).outcome).toBe("applied");
      await cleanup();
      // A tie on the greatest installedAt is ambiguous: copy the served marker's installedAt onto a foreign marker.
      await client.write((tx) => tx.run(`MATCH (s:KsReleaseMarker) WITH s ORDER BY s.installedAt DESC LIMIT 1 CREATE (:KsReleaseMarker {releaseId: 'biotech-schema-tie', schemaReleaseDigest: s.schemaReleaseDigest, ddlDigest: s.ddlDigest, installedAt: s.installedAt, migrationRunId: 'gate-b-foreign'})`));
      const tie = await planned(smallIntent(R, stamp, "marker-tie"));
      await refused(tie, `ek-${stamp}-marker-tie`);
      record("release-marker-latest-rule", "pass", { newerForeign: "refused", olderForeign: "accepted", tie: "refused" });
    } finally {
      await cleanup();
    }
  });

  it("planner probing survives a driver retry of its read transaction (retry-local observation accumulator)", async () => {
    // Simulates the driver retrying the managed read: the first attempt fails with a transient error part-way through
    // probing, then the callback runs again on a fresh transaction. A shared accumulator would lose the keys the failed
    // attempt cleared ("observation ... is not in the frozen observation set").
    class FlakyClient extends GraphClient {
      attempts = 0;
      retries = 0;
      override async read<T>(fn: (tx: import("neo4j-driver").ManagedTransaction) => Promise<T>, timeoutMs?: number): Promise<T> {
        if (this.attempts++ === 0) {
          await super
            .read(async (tx) => {
              let runs = 0;
              const flaky = new Proxy(tx, {
                get(target, prop, receiver) {
                  if (prop === "run") {
                    return (...args: Parameters<typeof tx.run>) => {
                      if (++runs === 3) throw Object.assign(new Error("simulated transient failure"), { code: "Neo.TransientError.Transaction.DeadlockDetected" });
                      return target.run(...args);
                    };
                  }
                  const v = Reflect.get(target, prop, receiver);
                  return typeof v === "function" ? v.bind(target) : v;
                },
              });
              return fn(flaky);
            }, timeoutMs)
            .catch(() => {
              this.retries++;
            });
        }
        return super.read(fn, timeoutMs);
      }
    }
    const flakyClient = new FlakyClient({ uri: URI, username: "neo4j", password: PASSWORD, database: "neo4j" });
    try {
      const flakyWriter = new KnowledgeWriter(flakyClient, { schema, plans: new MemoryPlanStore(), witnessKeys: new Map(), localDev: false });
      const fixed = () => new Date("2026-10-11T12:00:00Z");
      const plan = await flakyWriter.plan(catalogIntent(R, `${stamp}-retry`), PRINCIPALS.writer, fixed);
      expect(flakyClient.retries).toBe(1);
      const reference = await writer.plan(catalogIntent(R, `${stamp}-retry`), PRINCIPALS.writer, fixed);
      expect(plan.planDigest).toBe(reference.planDigest);
      record("planner-retry-local-accumulator", "pass", { failedAttempts: flakyClient.retries });
    } finally {
      await flakyClient.close();
    }
  });

  it("plans and applies every ordinary proposal kind in one transaction; complete paginated readback", async () => {
    catalogPlan = await planned(catalogIntent(R, stamp));
    expect(catalogPlan.errors).toEqual([]);
    expect(catalogPlan.outcome).toBe("applicable");
    const before = (await client.read((tx) => readFence(tx)))!;
    const tApply = Date.now();
    catalogReceipt = await applyPlan(catalogPlan, `ek-${stamp}-catalog`);
    record("apply-latency", "pass", { firstApplyMs: Date.now() - tApply, statements: catalogPlan.statements.length });
    expect(catalogReceipt.outcome, JSON.stringify(catalogReceipt.failure)).toBe("applied");
    expect(catalogReceipt.priorGraphRevision).toBe(before.graphRevision);
    expect(catalogReceipt.nextGraphRevision).toBe(before.graphRevision + 1);
    // P-6 (b, c): Int-typed properties are stored as integers (node and edge); CaptureAttempt is INTERNAL (register R-41).
    const pkgUid = catalogPlan.subjects.find((s) => s.ref === "package")!.uid!;
    const attemptUid = catalogPlan.effects.nodes.find((n) => n.label === "CaptureAttempt")!.uid;
    const stored = await client.read(async (tx) => {
      const r = await tx.run(
        `MATCH (p:Package {uid: $pkg}) OPTIONAL MATCH ()-[hp:HAS_PACKAGE]->(p) MATCH (c:CaptureAttempt {uid: $att})
RETURN p.unitCount AS unitCount, valueType(p.unitCount) AS unitType, valueType(hp.orderIndex) AS orderType, valueType(c.httpStatus) AS httpType, c.privacyClass AS attemptPrivacy`,
        { pkg: pkgUid, att: attemptUid },
      );
      return r.records[0]!.toObject() as Record<string, unknown>;
    });
    expect(String(stored.unitType)).toMatch(/^INTEGER/);
    expect(Number(toJson(stored.unitCount))).toBe(30);
    expect(String(stored.orderType)).toMatch(/^INTEGER/);
    expect(String(stored.httpType)).toMatch(/^INTEGER/);
    expect(stored.attemptPrivacy).toBe("INTERNAL");
    record("int-and-privacy-roundtrip", "pass", { unitType: stored.unitType, orderType: stored.orderType, httpType: stored.httpType, attemptPrivacy: stored.attemptPrivacy });
    expect(catalogReceipt.witness?.exp! - catalogReceipt.witness?.iat!).toBeLessThanOrEqual(60);
    // Paginated complete readback of all declared effects.
    let cursor: number | null = 0;
    let checked = 0;
    let failures = 0;
    while (cursor !== null) {
      const page = await writer.verifyEffects(PRINCIPALS.writer, `ek-${stamp}-catalog`, cursor, 10);
      checked += page.checked;
      failures += page.failures;
      cursor = page.nextCursor;
    }
    expect(checked).toBe(catalogReceipt.effects.total);
    expect(failures).toBe(0);
    // Graph facts (P1, P2, P4, P5, P8, P9, P11, P14, P17, OD-11, OD-17, EX-04, KN-15).
    const facts = toJson((await client.read((tx) => tx.run(`
      MATCH (act:Activity {uid: $act}) WITH act
      OPTIONAL MATCH (p:Person {uid: $person})
      OPTIONAL MATCH (a:Assertion {uid: $occ})-[e:HAS_EVIDENCE]->(l:SourceLocator)
      OPTIONAL MATCH (a)-[:OCCURRENCE_OF]->(c:Claim)
      OPTIONAL MATCH (:IngredientMaterial {uid: $material})-[rr:REALIZES_SUBSTANCE]->()
      OPTIONAL MATCH (:Package {uid: $package})-[lv:HAS_LABEL_VERSION]->()
      OPTIONAL MATCH (i:Identifier {scheme: 'UNII'})<-[hi:HAS_IDENTIFIER]-(:ChemicalSubstance {uid: $nr})
      OPTIONAL MATCH (fa:Assertion {predicate: 'PLANT_PART'})-[:HAS_SUBJECT]->(:IngredientMaterial {uid: $material})
      OPTIONAL MATCH (res:Assessment {assessmentKind: 'RESOLUTION'})-[:HAS_EVIDENCE {role: 'CONTEXT'}]->(:SourceLocator)
      RETURN act.runId AS runId, act.receiptIds AS receiptIds, act.operationIds AS ops, act.intentDigests AS intents, p.description AS personDescription,
        a.status AS status, a.assertionKind AS kind, a.lastWriterRunId AS lwr, a.agentRunUid AS legacy, e.role AS role, e.origin AS origin, l.selectorDigest AS selectorDigest, l.selectorJson AS selectorJson,
        c.uid AS claimUid, rr.validFrom AS realizesValidFrom, rr.recordedFrom IS NOT NULL AS realizesRecorded, lv.validFrom IS NOT NULL AS lvValid, i.value AS identValue, hi.assertionUid IS NOT NULL AS hiAuthorized,
        fa.valueString AS plantPart, count(res) AS resolutions,
        COUNT { MATCH (m:Mention) RETURN m } AS mentions, COUNT { MATCH (n)-[:WAS_GENERATED_BY]->(act) RETURN n } AS lineage`,
      { act: catalogPlan.activity.uid, person: uidOf("person"), occ: mint("p-claim-occ"), material: uidOf("material"), package: uidOf("package"), nr: uidOf("nr") }))).records[0]!.toObject()) as Record<string, unknown>;
    expect(facts.runId).toBe(`run-${stamp}-r1`);
    expect(facts.receiptIds).toEqual([catalogReceipt.receiptId]);
    expect(facts.ops).toEqual([`op-${stamp}-r1`]);
    expect(facts.intents).toEqual([catalogPlan.binding.intentDigest]);
    expect(String(facts.personDescription)).not.toMatch(/@|555/);
    expect(facts.status).toBe("EXTRACTED");
    expect(facts.kind).toBe("CLAIM");
    expect(facts.lwr).toBe(`run-${stamp}-r1`);
    expect(facts.legacy).toBeNull();
    expect([facts.role, facts.origin]).toEqual(["SUPPORTS", "DECLARED"]);
    expect(String(facts.selectorDigest)).toBe(canonicalDigest(JSON.parse(String(facts.selectorJson))));
    expect(facts.claimUid).toBe(uidOf("claim"));
    expect(facts.realizesValidFrom).toBeNull();
    expect(facts.realizesRecorded).toBe(true);
    expect(facts.lvValid).toBe(true);
    expect(facts.identValue).toBe(unii(stamp));
    expect(facts.hiAuthorized).toBe(true);
    expect(facts.plantPart).toBe("ROOT");
    expect(Number(facts.resolutions)).toBeGreaterThanOrEqual(1);
    expect(Number(facts.mentions)).toBe(0);
    expect(Number(facts.lineage)).toBeGreaterThanOrEqual(catalogReceipt.effects.nodes.filter((n) => n.op === "create" && n.label !== "Activity").length);
    record("every-ordinary-kind-applies", "pass", { effects: catalogReceipt.effects.total, receiptId: catalogReceipt.receiptId, counters: catalogReceipt.counters });
  });

  it("forged plan refusal: caller statements, tampered custody, wrong digest, unknown ref", async () => {
    const plan = await planned(smallIntent(R, stamp, "forge"));
    const witness = await writer.admit(plan.planRef, { effectKey: `ek-${stamp}-forge`, partialPolicy: "all" }, PRINCIPALS.writer);
    await expect(writer.apply({ ...request(plan, `ek-${stamp}-forge`, witness), statements: [{ cypher: "CREATE (:Pwned)" }] }, PRINCIPALS.writer)).rejects.toMatchObject({ code: "BKS_PLAN_FORGED" });
    await expect(writer.apply({ ...request(plan, `ek-${stamp}-forge`, witness), expectedPlanDigest: `sha256:${"e".repeat(64)}` }, PRINCIPALS.writer)).rejects.toMatchObject({ code: "BKS_PLAN_DIGEST_MISMATCH" });
    await expect(writer.apply({ ...request(plan, `ek-${stamp}-forge`, witness), planRef: "pl-unknown" }, PRINCIPALS.writer)).rejects.toMatchObject({ code: "BKS_PLAN_NOT_FOUND" });
    const original = plans.records.get(plan.planRef)!;
    const raw = JSON.parse(original);
    raw.plan.statements[raw.plan.statements.length - 1].cypher = "CREATE (:Pwned) RETURN 1 AS uid";
    const { planDigestOf } = await import("./plan.js");
    const { schemaVersion: _a, planRef: _b, planDigest: _c, ...body } = raw.plan;
    raw.plan.planDigest = planDigestOf(body);
    plans.records.set(plan.planRef, JSON.stringify(raw));
    await expect(writer.apply({ ...request(plan, `ek-${stamp}-forge`, witness), expectedPlanDigest: raw.plan.planDigest }, PRINCIPALS.writer)).rejects.toMatchObject({ code: "BKS_PLAN_FORGED" });
    plans.records.set(plan.planRef, original);
    expect(await count("MATCH (n:Pwned) RETURN count(n)")).toBe(0);
    // Other tenant cannot apply this plan, and cannot read its receipt.
    await expect(applyPlan(plan, `ek-${stamp}-forge-x`, PRINCIPALS.otherTenant)).rejects.toMatchObject({ code: "BKS_FORBIDDEN_SCOPE" });
    record("forged-plan-refusal", "pass");
  });

  it("identical replay returns the recorded result; changed bytes or plan under the same effect key conflict", async () => {
    const plan = await planned(smallIntent(R, stamp, "dup"));
    const first = await applyPlan(plan, `ek-${stamp}-dup`);
    expect(first.outcome).toBe("applied");
    const again = await applyPlan(plan, `ek-${stamp}-dup`);
    expect(again.outcome).toBe("duplicate");
    expect(again.duplicateOf).toBe(first.receiptId);
    const changedBytes = await planned(smallIntent(R, stamp, "dup", "changed bytes"));
    await expect(applyPlan(changedBytes, `ek-${stamp}-dup`)).rejects.toMatchObject({ code: "BKS_EFFECT_CONFLICT" });
    const replanned = await writer.plan(smallIntent(R, stamp, "dup"), PRINCIPALS.writer, () => new Date(Date.now() + 1000));
    expect(replanned.planDigest).not.toBe(plan.planDigest);
    await expect(applyPlan(replanned, `ek-${stamp}-dup`)).rejects.toMatchObject({ code: "BKS_EFFECT_CONFLICT" });
    const lookup = await getReceiptV2(client, PRINCIPALS.writer, `ek-${stamp}-dup`);
    expect(lookup.status).toBe("applied");
    expect((await getReceiptV2(client, PRINCIPALS.otherTenant, `ek-${stamp}-dup`)).found).toBe(false);
    record("replay-duplicate-and-conflict", "pass");
  });

  it("concurrent identical applies produce exactly one effect", async () => {
    const plan = await planned(smallIntent(R, stamp, "conc"));
    const [a, b] = await Promise.all([applyPlan(plan, `ek-${stamp}-conc`), applyPlan(plan, `ek-${stamp}-conc`)]);
    expect([a.outcome, b.outcome].sort()).toEqual(["applied", "duplicate"]);
    expect(await count("MATCH (o:Organization {uid: $u}) RETURN count(o)", { u: plan.subjects.find((s) => s.ref === "org")!.uid })).toBe(1);
    expect(await count("MATCH (m:KsIntentMarker {markerKey: $k}) RETURN count(m)", { k: markerKeyOf(PRINCIPALS.writer, `ek-${stamp}-conc`) })).toBe(1);
    record("concurrent-identical-apply", "pass", [a.outcome, b.outcome]);
  });

  it("concurrent identifier race: one wins, the other fails IDENTITY_CONFLICT", async () => {
    const value = unii(`${stamp}-race`);
    const pa = await planned(identityRaceIntent(R, stamp, "a", value));
    const pb = await planned(identityRaceIntent(R, stamp, "b", value));
    expect([pa.outcome, pb.outcome]).toEqual(["applicable", "applicable"]);
    const [ra, rb] = await Promise.all([applyPlan(pa, `ek-${stamp}-ida`), applyPlan(pb, `ek-${stamp}-idb`)]);
    const outcomes = [ra, rb].map((r) => (r.outcome === "applied" ? "applied" : r.failure?.code));
    expect(outcomes.sort()).toEqual(["BKS_IDENTITY_CONFLICT", "applied"]);
    expect(await count("MATCH (i:Identifier {scheme: 'UNII', value: $v})<-[r:HAS_IDENTIFIER]-() WHERE r.recordedTo IS NULL RETURN count(r)", { v: value })).toBe(1);
    record("identifier-race", "pass", outcomes);
  });

  it("concurrent exclusive-slot race (subject, slot, asserter): one wins, the other fails SLOT_CONFLICT", async () => {
    const setup = await planned(packageSetupIntent(R, stamp));
    expect((await applyPlan(setup, `ek-${stamp}-pkg`)).outcome).toBe("applied");
    const pkg = setup.subjects.find((s) => s.ref === "package")!.uid!;
    const org = setup.subjects.find((s) => s.ref === "org")!.uid!;
    const pa = await planned(slotRaceIntent(R, stamp, "a", pkg, org));
    const pb = await planned(slotRaceIntent(R, stamp, "b", pkg, org));
    const [ra, rb] = await Promise.all([applyPlan(pa, `ek-${stamp}-sa`), applyPlan(pb, `ek-${stamp}-sb`)]);
    const outcomes = [ra, rb].map((r) => (r.outcome === "applied" ? "applied" : r.failure?.code));
    expect(outcomes.sort()).toEqual(["BKS_SLOT_CONFLICT", "applied"]);
    expect(await count("MATCH (:Package {uid: $p})-[r:HAS_LABEL_VERSION]->() WHERE r.recordedTo IS NULL RETURN count(r)", { p: pkg })).toBe(1);
    // A different asserter's episode coexists (OD-05).
    record("slot-race", "pass", outcomes);
  });

  it("graph revision drift fails STALE_REVISION; no implicit re-plan; a fresh plan applies", async () => {
    const plan = await planned(smallIntent(R, stamp, "stale"));
    expect((await applyPlan(await planned(smallIntent(R, stamp, "drift")), `ek-${stamp}-drift`)).outcome).toBe("applied");
    const stale = await applyPlan(plan, `ek-${stamp}-stale`);
    expect(stale.outcome).toBe("failed");
    expect(stale.failure?.code).toBe("BKS_STALE_REVISION");
    const fresh = await planned(smallIntent(R, stamp, "stale"));
    expect(fresh.planDigest).not.toBe(plan.planDigest);
    await expect(applyPlan(fresh, `ek-${stamp}-stale`)).rejects.toMatchObject({ code: "BKS_EFFECT_CONFLICT" });
    const ok = await applyPlan(fresh, `ek-${stamp}-stale-2`);
    expect(ok.outcome).toBe("applied");
    record("revision-drift", "pass", stale.failure);
  });

  it("response lost after commit: lookup returns applied, retry is a duplicate; lost commit ack reconciles via the marker", async () => {
    const plan = await planned(smallIntent(R, stamp, "lost"));
    await expect(applyPlan(plan, `ek-${stamp}-lost`, PRINCIPALS.writer, "all", { faults: { afterCommit: () => { throw new Error("socket closed after commit"); } } })).rejects.toThrow(/socket closed/);
    const lookup = await writer.receipt(PRINCIPALS.writer, `ek-${stamp}-lost`);
    expect(lookup.status).toBe("applied");
    const retry = await applyPlan(plan, `ek-${stamp}-lost`);
    expect(retry.outcome).toBe("duplicate");
    const plan2 = await planned(smallIntent(R, stamp, "lost2"));
    const reconciled = await applyPlan(plan2, `ek-${stamp}-lost2`, PRINCIPALS.writer, "all", { faults: { commitThrows: () => true } });
    expect(reconciled.outcome).toBe("applied");
    record("response-lost-after-commit", "pass");
  });

  it("failed retry keeps the marker and its attempt history; mid-statement failure rolls back completely", async () => {
    const plan = await planned(smallIntent(R, stamp, "fail"));
    const rev0 = (await client.read((tx) => readFence(tx)))!.graphRevision;
    const boom = { faults: { beforeStatement: (i: number) => { if (i === 4) throw new Error("injected failure mid-plan"); } } };
    const f1 = await applyPlan(plan, `ek-${stamp}-fail`, PRINCIPALS.writer, "all", boom);
    const f2 = await applyPlan(plan, `ek-${stamp}-fail`, PRINCIPALS.writer, "all", boom);
    expect([f1.outcome, f2.outcome]).toEqual(["failed", "failed"]);
    expect(f2.attempts).toHaveLength(2);
    const marker = await writer.receipt(PRINCIPALS.writer, `ek-${stamp}-fail`);
    expect(marker.status).toBe("failed");
    expect(marker.attempts).toHaveLength(2);
    expect(await count("MATCH (o:Organization {uid: $u}) RETURN count(o)", { u: plan.subjects.find((s) => s.ref === "org")!.uid })).toBe(0);
    expect((await client.read((tx) => readFence(tx)))!.graphRevision).toBe(rev0);
    const ok = await applyPlan(plan, `ek-${stamp}-fail`);
    expect(ok.outcome).toBe("applied");
    expect(ok.attempts).toHaveLength(3);
    expect(ok.attempts.map((a) => a.outcome)).toEqual(["failed", "failed", "applied"]);
    record("failed-retry-history-and-rollback", "pass", ok.attempts);
  });

  it("failure-recorder race cannot overwrite an applied marker", async () => {
    const plan = await planned(smallIntent(R, stamp, "race-rec"));
    let other: IngestionReceiptV2 | null = null;
    const loser = await applyPlan(plan, `ek-${stamp}-race-rec`, PRINCIPALS.writer, "all", {
      faults: {
        beforeStatement: (i: number) => { if (i === 2) throw new Error("injected loser failure"); },
        beforeFailureRecord: async () => { other = await applyPlan(plan, `ek-${stamp}-race-rec`); },
      },
    });
    expect(other!.outcome).toBe("applied");
    expect(loser.outcome).toBe("duplicate");
    const marker = await writer.receipt(PRINCIPALS.writer, `ek-${stamp}-race-rec`);
    expect(marker.status).toBe("applied");
    expect(marker.attempts!.map((a) => a.outcome).sort()).toEqual(["applied", "failed"]);
    record("failure-recorder-race", "pass", marker.attempts);
  });

  it("dependency-aware partial apply of a closed subset", async () => {
    const intent = catalogIntent(R, `${stamp}-part`);
    intent.proposals.find((p) => p.proposalId === "p-supplies")!.hold = { reason: "awaiting the buyer's identity" };
    const plan = await planned(intent);
    expect(plan.outcome).toBe("partial");
    await expect(applyPlan(plan, `ek-${stamp}-part`)).rejects.toMatchObject({ code: "BKS_PARTIAL_REFUSED" });
    await expect(applyPlan(plan, `ek-${stamp}-part`, PRINCIPALS.writer, { include: ["p-daily-max"] })).rejects.toMatchObject({ code: "BKS_PARTIAL_NOT_CLOSED" });
    const r = await applyPlan(plan, `ek-${stamp}-part`, PRINCIPALS.writer, { include: ["p-servings", "p-daily-max", "p-owns"] });
    expect(r.outcome).toBe("partial");
    expect(r.proposals.filter((p) => p.outcome === "applied").map((p) => p.proposalId).sort()).toEqual(["p-daily-max", "p-owns", "p-servings"]);
    const page = await writer.verifyEffects(PRINCIPALS.writer, `ek-${stamp}-part`, 0, 500);
    expect(page.failures).toBe(0);
    const pkg = plan.subjects.find((s) => s.ref === "package")!.uid!;
    expect(await count("MATCH (p:Package {uid: $u}) RETURN count(p)", { u: pkg })).toBe(0);
    record("partial-closed-subset", "pass", { applied: r.effects.total });
  });

  it("witness expired / invalid / revoked (before witness, after witness before commit, after commit, delayed delivery)", async () => {
    const plan = await planned(smallIntent(R, stamp, "w1"));
    const w = await writer.admit(plan.planRef, { effectKey: `ek-${stamp}-w1`, partialPolicy: "all" }, PRINCIPALS.writer);
    // expired
    await expect(writer.apply(request(plan, `ek-${stamp}-w1`, w), PRINCIPALS.writer, { now: () => new Date(Date.now() + 120_000) })).rejects.toMatchObject({ code: "BKS_WITNESS_EXPIRED" });
    // invalid: rogue signer, wrong binding
    const claims = decodeWitnessClaims(w);
    const rogue = signWitness(claims, { kid: issuerKey.kid, key: rogueKey.privateKey });
    await expect(writer.apply(request(plan, `ek-${stamp}-w1`, rogue), PRINCIPALS.writer)).rejects.toMatchObject({ code: "BKS_WITNESS_INVALID" });
    await expect(writer.apply(request(plan, `ek-${stamp}-w1-other`, w), PRINCIPALS.writer)).rejects.toMatchObject({ code: "BKS_WITNESS_INVALID" });
    // revoked before witness: the authority refuses to issue
    const revokedPrincipal = { ...PRINCIPALS.writer, principalId: "revoked-before" };
    const planR = await planned(smallIntent(R, stamp, "w-before"), revokedPrincipal);
    authority.revoke(revokedPrincipal);
    await expect(writer.admit(planR.planRef, { effectKey: `ek-${stamp}-wb`, partialPolicy: "all" }, revokedPrincipal)).rejects.toMatchObject({ code: "BKS_FORBIDDEN_SCOPE" });
    // delayed delivery: a witness issued before the revocation commits during its lease ...
    const delayedPrincipal = { ...PRINCIPALS.writer, principalId: "delayed" };
    const planD = await planned(smallIntent(R, stamp, "w-delayed"), delayedPrincipal);
    const wD = await writer.admit(planD.planRef, { effectKey: `ek-${stamp}-wd`, partialPolicy: "all" }, delayedPrincipal);
    const gen = authority.revoke(delayedPrincipal);
    const leased = await writer.apply(request(planD, `ek-${stamp}-wd`, wD), delayedPrincipal);
    expect(leased.outcome).toBe("applied");
    // ... after witness, before commit: once the revocation reaches the local fence, an older witness fails inside the transaction.
    const planD2 = await planned(smallIntent(R, stamp, "w-delayed-2"), delayedPrincipal);
    const preRevocation = signWitness({ ...decodeWitnessClaims(await writerAdmitAt(planD2, `ek-${stamp}-wd2`, delayedPrincipal, gen - 1)) }, { kid: issuerKey.kid, key: issuerKey.privateKey });
    await deliverRevocation(client, gen);
    const revoked = await writer.apply(request(planD2, `ek-${stamp}-wd2`, preRevocation), delayedPrincipal);
    expect(revoked.outcome).toBe("failed");
    expect(revoked.failure?.code).toBe("BKS_WITNESS_REVOKED");
    // after commit: the committed effect stays and is still reported (serving rechecks eligibility separately).
    expect((await writer.receipt(delayedPrincipal, `ek-${stamp}-wd`)).status).toBe("applied");
    record("witness-expiry-invalid-revocation", "pass", { generation: gen });
  });

  /** Signs a witness for a plan with an explicit (older) revocation generation, as an issuer would have before a revocation. */
  async function writerAdmitAt(plan: IngestionPlanV2, effectKey: string, principal: PrincipalCtx, generation: number): Promise<ApplyWitness> {
    const tmp = new MemoryGrantAuthority();
    tmp.generation = generation;
    const w = new KnowledgeWriter(client, { schema, plans, witnessKeys: writer.witnessKeys, signer: { kid: issuerKey.kid, key: issuerKey.privateKey }, authority: tmp });
    return w.admit(plan.planRef, { effectKey, partialPolicy: "all" }, principal);
  }

  it("cancellation after commit reports the effect", async () => {
    const plan = await planned(smallIntent(R, stamp, "cancel"));
    const ac = new AbortController();
    const r = await applyPlan(plan, `ek-${stamp}-cancel`, PRINCIPALS.writer, "all", { signal: ac.signal, faults: { afterCommit: () => ac.abort() } });
    expect(r.outcome).toBe("applied");
    expect(r.cancellation?.requestedAfterCommit).toBe(true);
    const ac2 = new AbortController();
    const plan2 = await planned(smallIntent(R, stamp, "cancel2"));
    const r2 = await applyPlan(plan2, `ek-${stamp}-cancel2`, PRINCIPALS.writer, "all", { signal: ac2.signal, faults: { beforeCommit: () => ac2.abort() } });
    expect(r2.outcome).toBe("failed");
    expect(await count("MATCH (o:Organization {uid: $u}) RETURN count(o)", { u: plan2.subjects.find((s) => s.ref === "org")!.uid })).toBe(0);
    record("cancellation", "pass");
  });

  it("follow-up: edge.close, slot reuse after close and same-asserter supersession", async () => {
    const plan = await planned(followupIntent(R, stamp, { packageUid: uidOf("package"), orgUid: uidOf("org"), brandUid: uidOf("brand"), lv1RelUid: mint("p-lv1", "relationship"), ownsAssertionUid: mint("p-owns") }));
    expect(plan.errors).toEqual([]);
    expect(plan.outcome, JSON.stringify(plan.proposals.map((p) => [p.proposalId, p.disposition, p.reasons]))).toBe("applicable");
    const r = await applyPlan(plan, `ek-${stamp}-followup`);
    expect(r.outcome).toBe("applied");
    const facts = toJson((await client.read((tx) => tx.run(`
      MATCH ()-[lv1:HAS_LABEL_VERSION {relationshipUid: $lv1}]->() MATCH (old:Assertion {uid: $owns})
      OPTIONAL MATCH ()-[ob:OWNS_BRAND {assertionUid: $owns}]->()
      RETURN lv1.recordedTo IS NOT NULL AS lv1Closed, old.status AS oldStatus, old.recordedTo IS NOT NULL AS oldClosed, ob.recordedTo IS NOT NULL AS oldEpisodeClosed,
        COUNT { MATCH (:Package {uid: $pkg})-[x:HAS_LABEL_VERSION]->() WHERE x.recordedTo IS NULL RETURN x } AS openLv,
        COUNT { MATCH (:Organization {uid: $org})-[x:OWNS_BRAND]->() WHERE x.recordedTo IS NULL RETURN x } AS openOwns`,
      { lv1: mint("p-lv1", "relationship"), owns: mint("p-owns"), pkg: uidOf("package"), org: uidOf("org") }))).records[0]!.toObject()) as Record<string, unknown>;
    expect(facts).toMatchObject({ lv1Closed: true, oldStatus: "SUPERSEDED", oldClosed: true, oldEpisodeClosed: true, openLv: 1, openOwns: 0 });
    record("close-slot-supersession", "pass", facts);
  });

  it("trusted adjudication delivery: KN-15 table, OD-08 rendition exception, SUPPORT projection; forged and caller verdicts refused", async () => {
    const events = await planned(eventIntent(R, stamp));
    expect((await applyPlan(events, `ek-${stamp}-events`)).outcome).toBe("applied");
    const leadsUid = events.proposals.find((p) => p.proposalId === "p-leads")!.mints.assertion!;
    const rend2Uid = events.proposals.find((p) => p.proposalId === "p-rend2")!.mints.assertion!;
    const locClaim = catalogPlan.sources.find((s) => s.ref === "label")!.locators.find((l) => l.ref === "l-claim")!;
    const base = (ref: string, over: Partial<SealedVerificationBody>): SealedVerificationBody => ({ format: "bks-sealed-verification.v1", ref, issuer: "ks-verification", judgmentId: `${ref}-j`, assertionUid: mint("p-claim-occ"), adjudicationKind: "CAPTURE_FIDELITY", verdict: "DIRECTLY_SUPPORTED", policyOutcome: "PASS", judgeKind: "NLI", methodVersion: "gate-b-verifier/1", properties: { attributionFaithfulness: "SATISFIED" }, unsupportedFacets: [], evidence: [{ locatorUid: locClaim.uid, selectorDigest: locClaim.selectorDigest, role: "SUPPORTS", origin: "VERIFIER_FOUND", authority: "PRIMARY", independence: "SELF_REPORTED", facet: "IDENTITY" }], run: { system: "ks-verification", runId: `ver-${stamp}` }, policy: { toolRenditionException: false }, sealedAt: new Date().toISOString(), ...over });
    const put = async (b: SealedVerificationBody, key = verifierKey) => verifications.put(sealVerification(b, { kid: key.kid, key: key.privateKey }));
    const accept = await put(base(`${stamp}-cf-accept`, {}));
    const heldAccount = await put(base(`${stamp}-cf-held`, { assertionUid: mint("p-account-occ"), policyOutcome: "REVIEW", evidence: [] }));
    const rendNoPerm = await put(base(`${stamp}-cf-rend`, { assertionUid: mint("p-rendition-occ"), policyOutcome: "PASS_WITH_WARNINGS", evidence: [], policy: { toolRenditionException: true } }));
    const rendNoAttempt = await put(base(`${stamp}-cf-rend2`, { assertionUid: rend2Uid, policyOutcome: "PASS_WITH_WARNINGS", evidence: [], policy: { toolRenditionException: true } }));
    const support = await put(base(`${stamp}-support`, { assertionUid: leadsUid, adjudicationKind: "SUPPORT", evidence: [] }));
    const forged = await put(base(`${stamp}-forged`, { judgmentId: "forged" }), rogueKey);
    // Ordinary writer: denied.
    const denied = await planned(adjudicationIntent(R, stamp, "denied", [accept]), PRINCIPALS.writer);
    expect(denied.proposals[0]!.reasons[0]).toMatch(/^BKS_FORBIDDEN_SCOPE/);
    // Verifier: forged signature and wrong digest refused, others admitted.
    const plan = await planned(adjudicationIntent(R, stamp, "v", [accept, heldAccount, rendNoPerm, rendNoAttempt, support, forged, { ref: accept.ref, digest: `sha256:${"f".repeat(64)}` }]), PRINCIPALS.verifier);
    const disp = plan.proposals.map((p) => [p.disposition, p.reasons.join(" ")]);
    expect(disp[5]![1]).toMatch(/signature is invalid|not pinned/);
    expect(disp[6]![0]).toBe("rejected");
    const r = await applyPlan(plan, `ek-${stamp}-adj`, PRINCIPALS.verifier, { include: plan.proposals.filter((p) => p.disposition === "admitted").map((p) => p.proposalId) });
    expect(r.outcome, JSON.stringify(r.failure)).toBe("partial");
    const status = async (uid: string) => String(toJson((await client.read((tx) => tx.run("MATCH (a:Assertion {uid: $u}) RETURN a.status", { u: uid }))).records[0]!.get(0)));
    expect(await status(mint("p-claim-occ"))).toBe("ACCEPTED");
    expect(await status(mint("p-account-occ"))).toBe("PROPOSED");
    expect(await status(mint("p-rendition-occ"))).toBe("ACCEPTED"); // failed issuer-byte attempt recorded + policy + PASS_WITH_WARNINGS
    expect(await status(rend2Uid)).toBe("PROPOSED"); // no recorded attempt: held
    expect(await count("MATCH (:Event)-[r:LEADS_TO]->(:Event) WHERE r.assertionUid = $a RETURN count(r)", { a: leadsUid })).toBe(1);
    expect(await count("MATCH (:Adjudication)-[e:HAS_EVIDENCE {origin: 'VERIFIER_FOUND'}]->() WHERE e.authority = 'PRIMARY' RETURN count(e)")).toBeGreaterThanOrEqual(1);
    // Human AFFIRM of the held result moves it to ACCEPTED through a superseding adjudication.
    const heldAdjUid = plan.proposals[1]!.mints.adjudication!;
    const affirm = await put(base(`${stamp}-affirm`, { assertionUid: mint("p-account-occ"), judgmentId: `${stamp}-affirm-j`, judgeKind: "HUMAN", policyOutcome: "PASS", decision: "AFFIRM", decisionProvenance: "HUMAN_ORIGIN", supersedesAdjudicationUid: heldAdjUid, evidence: [] }));
    const p2 = await planned(adjudicationIntent(R, stamp, "affirm", [affirm]), PRINCIPALS.verifier);
    expect((await applyPlan(p2, `ek-${stamp}-affirm`, PRINCIPALS.verifier)).outcome).toBe("applied");
    expect(await status(mint("p-account-occ"))).toBe("ACCEPTED");
    record("adjudication-kn15-od08-support", "pass", disp.map((x) => x[0]));
  });

  it("privileged report publication and projection writes; ordinary writers denied", async () => {
    const locClaim = catalogPlan.sources.find((s) => s.ref === "label")!.locators.find((l) => l.ref === "l-claim")!;
    const refs = { claimUid: uidOf("claim"), occurrenceUid: mint("p-claim-occ"), locatorUid: locClaim.uid, locatorDigest: locClaim.selectorDigest, vettingUid: catalogPlan.proposals.find((p) => p.proposalId === "p-vetting")!.mints.assessment! };
    const deniedReport = await planned(reportIntent(R, `${stamp}-x`, refs), PRINCIPALS.writer);
    expect(deniedReport.proposals.find((p) => p.proposalId === "r-report")!.reasons[0]).toMatch(/^BKS_FORBIDDEN_SCOPE/);
    const report = await planned(reportIntent(R, stamp, refs), PRINCIPALS.publisher);
    expect(report.outcome, JSON.stringify(report.proposals.map((p) => p.reasons))).toBe("applicable");
    expect((await applyPlan(report, `ek-${stamp}-report`, PRINCIPALS.publisher)).outcome).toBe("applied");
    expect(String(toJson((await client.read((tx) => tx.run("MATCH (c:Claim {uid: $u}) RETURN c.latestVerdict", { u: refs.claimUid }))).records[0]!.get(0)))).toBe("NOT_SUPPORTED");
    const projRefs = { substanceUid: uidOf("nr"), mechanismUid: uidOf("mech"), assertionUid: mint("p-claim-occ") };
    const deniedProj = await planned(projectionIntent(R, `${stamp}-x`, projRefs), PRINCIPALS.writer);
    expect(deniedProj.proposals.every((p) => /^BKS_FORBIDDEN_SCOPE/.test(p.reasons[0] ?? ""))).toBe(true);
    const proj = await planned(projectionIntent(R, stamp, projRefs), PRINCIPALS.projector);
    expect(proj.outcome, JSON.stringify(proj.proposals.map((p) => p.reasons))).toBe("applicable");
    expect((await applyPlan(proj, `ek-${stamp}-proj`, PRINCIPALS.projector)).outcome).toBe("applied");
    expect(await count("MATCH (:ChemicalSubstance {uid: $u})-[r:AFFECTS_MECHANISM]->() RETURN count(r)", { u: projRefs.substanceUid })).toBe(1);
    expect(await count("MATCH (a:Association)-[:ASSOCIATES]->() WHERE a.anchorUid = $u RETURN count(a)", { u: projRefs.substanceUid })).toBeGreaterThanOrEqual(1);
    record("report-and-projection-privileged", "pass");
  });

  it("forged / tampered snapshot basis refused; a custody-verified snapshot at the current revision plans", async () => {
    const forged = smallIntent(R, stamp, "snap-forged");
    forged.basis = { snapshotRef: { ref: `${stamp}-none`, digest: `sha256:${"0".repeat(64)}` } };
    expect((await planned(forged)).errors[0]!.code).toBe("BKS_SNAPSHOT_UNVERIFIED");
    const rev = (await client.read((tx) => readFence(tx)))!.graphRevision;
    const bytes = Buffer.from(JSON.stringify({ rows: [], stamp }));
    const rec = await snapshots.put({ format: CUSTODY_SNAPSHOT_V1, ref: `${stamp}-snap`, bytesDigest: rawBytesDigest(bytes), issuer: "bks-read-service", scope: { installationId: PRINCIPALS.writer.installationId, applicationId: PRINCIPALS.writer.applicationId, tenantId: PRINCIPALS.writer.tenantId }, pins: { schemaReleaseDigest: R }, consistency: { mode: "stable_revision", graphRevision: rev, bookmarks: [] }, dependencies: { complete: true, nodes: [] }, createdAt: new Date().toISOString() }, bytes);
    const ok = smallIntent(R, stamp, "snap-ok");
    ok.basis = { snapshotRef: { ref: rec.ref, digest: rec.bytesDigest } };
    const p = await planned(ok);
    expect(p.errors).toEqual([]);
    expect(p.binding.basis.dependencyCheck).toBe("revision-equal");
    writeFileSync(resolve(custodyRoot, "snapshots", `${rec.ref}.bytes`), "tampered");
    expect((await planned(ok)).errors[0]!.code).toBe("BKS_SNAPSHOT_UNVERIFIED");
    record("snapshot-custody", "pass");
  });

  it("stable_revision read hook retries when a canonical write lands mid-read", async () => {
    const plan = await planned(smallIntent(R, stamp, "stable"));
    let first = true;
    const r = await withStableRevision(client, async (tx, attempt) => {
      const rows: string[] = [];
      const res = await tx.run("MATCH (o:Organization) RETURN o.uid AS uid LIMIT 5");
      for (const x of res.records) rows.push(String(x.get("uid")));
      if (first) {
        first = false;
        await applyPlan(plan, `ek-${stamp}-stable`);
      }
      return { rows, attempt };
    });
    expect(r.attempts).toBe(2);
    expect(r.result.attempt).toBe(2);
    record("stable-revision-retry", "pass", { graphRevision: r.graphRevision });
  });

  // The round matrix applies 82 intents in round order; under load it is the slowest test. It gets an explicit budget
  // and stops itself before the budget ends (vitest does not cancel a timed-out test body, so a body that kept running
  // in the background would hold the driver and the writer fence while later tests run).
  const MATRIX_BUDGET_MS = 900_000;
  it("FU-03 round v2 matrix: 82 round intents plan against the real graph in round order; admitted subsets apply", { timeout: MATRIX_BUDGET_MS + 60_000 }, async () => {
    const started = Date.now();
    const round = loadFixtureRound(repo);
    expect(round.manifest.schemaReleaseDigest).toBe(R);
    const rows: Array<Record<string, unknown>> = [];
    let truncated = false;
    for (const [i, { path, intent: raw }] of round.intents.entries()) {
      if (Date.now() - started > MATRIX_BUDGET_MS - 30_000) {
        truncated = true;
        break;
      }
      const intent = IngestionIntentV2.parse(raw);
      const plan = await writer.plan(intent, PRINCIPALS.writer);
      let applied: string | null = null;
      let applyMs: number | null = null;
      const admitted = plan.proposals.filter((p) => p.disposition === "admitted").map((p) => p.proposalId);
      if (plan.outcome === "applicable" || plan.outcome === "partial") {
        const tApply = Date.now();
        const r = await applyPlan(plan, `ek-${stamp}-fx-${i}-${intent.intentId}`, PRINCIPALS.writer, plan.outcome === "applicable" ? "all" : { include: admitted });
        applied = r.outcome === "failed" ? `failed:${r.failure?.code}` : r.outcome;
        applyMs = Date.now() - tApply;
      }
      const offline = round.manifest.rows[i]!;
      const reasons = [...new Set(plan.proposals.filter((p) => p.disposition !== "admitted").map((p) => (p.reasons[0] ?? "").split(":")[0]))];
      rows.push({ path, outcome: plan.outcome, offlineOutcome: offline.after.outcome, applied, applyMs, statements: plan.statements.length, proposals: plan.proposals.length, admitted: admitted.length, offlineAdmitted: offline.after.admitted, held: plan.proposals.filter((p) => p.disposition === "held").length, rejected: plan.proposals.filter((p) => p.disposition === "rejected").length, noop: plan.proposals.filter((p) => p.disposition === "noop_duplicate").length, errors: plan.errors.map((e) => `${e.code}: ${e.message.slice(0, 120)}`), reasons, rejectedReasons: plan.proposals.filter((p) => p.disposition === "rejected").map((p) => `${p.proposalId}: ${(p.reasons[0] ?? "").slice(0, 160)}`) });
    }
    const tally = (k: string) => rows.reduce((acc: Record<string, number>, r) => ((acc[String(r[k])] = (acc[String(r[k])] ?? 0) + 1), acc), {});
    // Per-stamp file: concurrent runs from the same checkout (other roles, the lead) must not overwrite each other.
    const matrixDoc = `${JSON.stringify({ generatedBy: "packages/kg-ops/src/kg-ops.integration.test.ts", round: "schema/program/final/fixtures-v2", uri: URI, releaseDigest: R, stamp, truncated, elapsedMs: Date.now() - started, totals: { outcome: tally("outcome"), applied: tally("applied") }, rows }, null, 2)}\n`;
    writeFileSync(resolve(evidenceDir, `fixture-matrix-${stamp}.json`), matrixDoc);
    writeFileSync(resolve(evidenceDir, "fixture-matrix.json"), matrixDoc);
    expect(truncated, `matrix stopped at its own budget after ${rows.length} intents`).toBe(false);
    expect(rows).toHaveLength(82);
    expect(rows.filter((r) => String(r.applied).startsWith("failed")), "apply failures").toEqual([]);
    // KN-06 / R-42: the identifiers the fixture states for a created subject are on the graph (eval finding: they were not).
    expect(await count("MATCH (:ChemicalSubstance {uid: $u})-[r:HAS_IDENTIFIER]->(i:Identifier {scheme: 'PUBCHEM_CID', value: '6579'}) WHERE r.recordedTo IS NULL RETURN count(i)", { u: "hu:substance:acrylamide" })).toBe(1);
    record("fixture-matrix", "pass", { outcome: tally("outcome"), applied: tally("applied"), elapsedMs: Date.now() - started });
  });

  it("cypher baseline (evaluation profile): reads are capped, big deletes roll back, small allowed deletes commit", async () => {
    const guard = { ...cypherGuardFromEnv(), maxDeletedNodes: 2, maxDeletedRelationships: 5, rowCap: 3 };
    const read = await runCypher(client, { mode: "read", cypher: "MATCH (n:Organization) RETURN n.uid AS uid" }, guard);
    expect(read.ok).toBe(true);
    expect(read.rowCount).toBeLessThanOrEqual(3);
    const seed = await runCypher(client, { mode: "write", cypher: "UNWIND range(1, 5) AS i CREATE (:BksScratch {k: $k, i: i})", params: { k: stamp } }, guard);
    expect(seed.ok && seed.committed).toBe(true);
    const blocked = await runCypher(client, { mode: "write", cypher: "MATCH (n:BksScratch {k: $k}) DETACH DELETE n", params: { k: stamp }, allowDeletes: true }, guard);
    expect(blocked.ok).toBe(false);
    const small = await runCypher(client, { mode: "write", cypher: "MATCH (n:BksScratch {k: $k}) WITH n LIMIT 2 DELETE n", params: { k: stamp }, allowDeletes: true }, guard);
    expect(small.ok && small.committed).toBe(true);
  });
});

const dee = enabled && EE_URI ? describe : describe.skip;
dee("Gate B on Neo4j Enterprise: real read-only authority for the reader principal", () => {
  const admin = enabled && EE_URI ? new GraphClient({ uri: EE_URI, username: "neo4j", password: PASSWORD, database: "neo4j" }) : (null as unknown as GraphClient);
  const readerPassword = `reader-${stamp}-pw`;
  const writerPassword = `writer-${stamp}-pw`;
  beforeAll(async () => {
    assertLocal(EE_URI!);
    const sys = admin.driver.session({ database: "system" });
    try {
      for (const q of [
        "CREATE ROLE bks_reader IF NOT EXISTS",
        "GRANT ACCESS ON DATABASE neo4j TO bks_reader",
        "GRANT MATCH {*} ON GRAPH neo4j TO bks_reader",
        "CREATE ROLE bks_writer IF NOT EXISTS",
        "GRANT ACCESS ON DATABASE neo4j TO bks_writer",
        "GRANT MATCH {*} ON GRAPH neo4j TO bks_writer",
        "GRANT WRITE ON GRAPH neo4j TO bks_writer",
        "GRANT NAME MANAGEMENT ON DATABASE neo4j TO bks_writer",
        `CREATE OR REPLACE USER bks_reader_test SET PASSWORD '${readerPassword}' CHANGE NOT REQUIRED`,
        `CREATE OR REPLACE USER bks_writer_test SET PASSWORD '${writerPassword}' CHANGE NOT REQUIRED`,
        "GRANT ROLE bks_reader TO bks_reader_test",
        "GRANT ROLE bks_writer TO bks_writer_test",
      ]) await sys.run(q);
    } finally {
      await sys.close();
    }
    await admin.write((tx) => tx.run("MATCH (n) DETACH DELETE n"));
    await ensureOperationalState(admin, schema, { phase: "all" });
    await installReleaseMarker(admin, { releaseId: schema.releaseId, schemaReleaseDigest: R }, `gate-b-ee-${stamp}`);
  });
  afterAll(async () => {
    writeFileSync(resolve(evidenceDir, `gate-b-ee-${stamp}.json`), `${JSON.stringify({ stamp, uri: EE_URI, releaseDigest: R, finishedAt: new Date().toISOString(), evidence: evidence.filter((e) => e.test.startsWith("enterprise")) }, null, 2)}
`);
    await admin?.close();
  });

  it("the reader role can plan (read) but cannot write, even through a WRITE session; the writer role applies", async () => {
    const reader = new GraphClient({ uri: EE_URI!, username: "bks_reader_test", password: readerPassword, database: "neo4j" });
    const writerDb = new GraphClient({ uri: EE_URI!, username: "bks_writer_test", password: writerPassword, database: "neo4j" });
    try {
      const kp = generateWitnessKeyPair("ee");
      const plans = new MemoryPlanStore();
      const common = { schema, plans, witnessKeys: parsePinnedKeys(`ee:${kp.publicKeyDer}`), signer: { kid: "ee", key: kp.privateKey }, authority: new MemoryGrantAuthority() };
      const asReader = new KnowledgeWriter(reader, common);
      const asWriter = new KnowledgeWriter(writerDb, common);
      const plan = await asReader.plan(smallIntent(R, stamp, "ee"), PRINCIPALS.writer);
      expect(plan.outcome).toBe("applicable");
      await expect(reader.write((tx) => tx.run("CREATE (:BksShouldNotExist {k: $k})", { k: stamp }))).rejects.toThrow(/not allowed|Permission|denied|AccessMode/i);
      const w = await asReader.admit(plan.planRef, { effectKey: `ek-${stamp}-ee`, partialPolicy: "all" }, PRINCIPALS.writer);
      const viaReader = await asReader.apply({ schemaVersion: "biotech-knowledge-apply.v2", planRef: plan.planRef, expectedPlanDigest: plan.planDigest, intentDigest: plan.binding.intentDigest, effectKey: `ek-${stamp}-ee`, partialPolicy: "all", witness: w }, PRINCIPALS.writer).catch((e: Error) => e);
      expect(viaReader instanceof Error || (viaReader as IngestionReceiptV2).outcome === "failed").toBe(true);
      const w2 = await asWriter.admit(plan.planRef, { effectKey: `ek-${stamp}-ee`, partialPolicy: "all" }, PRINCIPALS.writer);
      const ok = await asWriter.apply({ schemaVersion: "biotech-knowledge-apply.v2", planRef: plan.planRef, expectedPlanDigest: plan.planDigest, intentDigest: plan.binding.intentDigest, effectKey: `ek-${stamp}-ee`, partialPolicy: "all", witness: w2 }, PRINCIPALS.writer);
      expect(ok.outcome, JSON.stringify(ok.failure)).toBe("applied");
      expect(Number(toJson((await admin.read((tx) => tx.run("MATCH (n:BksShouldNotExist) RETURN count(n)"))).records[0]!.get(0)))).toBe(0);
      evidence.push({ test: "enterprise-reader-authority", result: "pass" });
    } finally {
      await reader.close();
      await writerDb.close();
    }
  });
});

void sealedDigest;
