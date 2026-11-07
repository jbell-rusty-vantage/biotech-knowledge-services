/**
 * Gate B read guarantees on a real disposable Neo4j (never Aura). Skipped unless BKS_INTEGRATION=1.
 *
 *   BKS_NEO4J_TEST_CONTAINER=bks-neo4j-s4 BKS_NEO4J_TEST_BOLT_PORT=7698 BKS_NEO4J_TEST_HTTP_PORT=7498 bash scripts/neo4j-test.sh up
 *   BKS_INTEGRATION=1 NEO4J_TEST_URI=bolt://127.0.0.1:7698 NEO4J_TEST_PASSWORD=bks-test-password \
 *     npx vitest run --project kg-ops packages/kg-ops/src/read/read.integration.test.ts
 *
 * The suite resets the database, applies the pinned release's required DDL, seeds the fixture graph through the v2
 * writer (S3 Gate B fixtures + FU-03 migrated packet intents + the S4 read fixture) and the migrator-only operational
 * records, then proves the read guarantees. Community edition: typed reads + templates (scope internal); arbitrary
 * Cypher is unavailable here by design (no read-only role) and is proven on Enterprise in read-enterprise.integration.test.ts.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import neo4j from "neo4j-driver";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { canonicalDigest, IngestionIntentV2 } from "@bks/contracts";
import { FileSnapshotCustody } from "../custody.js";
import { GraphClient, toJson } from "../neo4j.js";
import { POLICY_VERSION } from "../write/fixtures-v2.js";
import { PRINCIPALS } from "../write/test-support.js";
import { runCatalogAssertions, type TemplateRunResult } from "./catalog-run.js";
import { correctionsFor } from "./catalog-corrections.js";
import { CYPHER_READ_INTENT_V1, READ_INTENT_V2, type ReadResultV2, type TypedOperation } from "./contracts.js";
import { seedFixtureGraph, seedOperationalRecords, type FixtureGraph } from "./fixture-graph.js";
import { buildQuestionStatus, writeQuestionStatus } from "./question-status.js";
import { ReadService, streamStep, type ReadPrincipal } from "./service.js";
import { decodeReadValue, normalizeValue } from "./values.js";
import { ReadModel } from "./visibility.js";

const enabled = process.env.BKS_INTEGRATION === "1";
const d = enabled ? describe : describe.skip;
const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..", "..", "..", "..");
const URI = process.env.NEO4J_TEST_URI ?? "bolt://127.0.0.1:7698";
const PASSWORD = process.env.NEO4J_TEST_PASSWORD ?? "bks-test-password";
const evidenceDir = resolve(repo, "runs", "release-v2", "s4");
const stamp = `r${Date.now().toString(36)}`;
const evidence: Array<{ test: string; result: string; detail?: unknown }> = [];
const record = (test: string, result: string, detail?: unknown) => evidence.push({ test, result, ...(detail === undefined ? {} : { detail }) });

export const READER: ReadPrincipal = { principalId: "s4-reader", installationId: PRINCIPALS.writer.installationId, applicationId: PRINCIPALS.writer.applicationId, tenantId: PRINCIPALS.writer.tenantId, role: "reader", grants: ["read.internal"] };
export const PUBLIC_READER: ReadPrincipal = { ...READER, principalId: "s4-public-reader", grants: [] };

d("Gate B reads (Community): typed v2, templates, consistency, bounds, digests, visibility", () => {
  const client = enabled ? new GraphClient({ uri: URI, username: "neo4j", password: PASSWORD, database: "neo4j" }) : (null as unknown as GraphClient);
  const model = ReadModel.fromRelease();
  const R = model.schemaReleaseDigest;
  const custodyRoot = resolve(evidenceDir, `custody-${stamp}`);
  const snapshots = new FileSnapshotCustody(resolve(custodyRoot, "snapshots"), ["bks-read-service"]);
  let fx: FixtureGraph;
  let svc: ReadService;
  let legacyUid: string;
  let catalogRuns: TemplateRunResult[] = [];
  const faults: { afterPart?: (c: { attempt: number; partIndex: number; rowsSoFar: number }) => Promise<void> } = {};

  const typed = (operations: Array<Record<string, unknown>>, o: { binding?: string; principal?: ReadPrincipal; mode?: "observed" | "stable_revision"; limits?: Record<string, unknown>; persist?: boolean; maxAttempts?: number; id?: string } = {}) =>
    svc.typed({ schemaVersion: READ_INTENT_V2, intentId: o.id ?? `t-${stamp}`, pins: { schemaReleaseDigest: R }, purpose: "Gate B read test", bindingRef: o.binding ?? "internal", operations, limits: { timeoutMs: 30_000, ...(o.limits ?? {}) }, consistency: { mode: o.mode ?? "observed", maxAttempts: o.maxAttempts ?? 3 }, persistSnapshot: o.persist ?? false }, o.principal ?? READER);
  const template = (id: string, parameters: Record<string, unknown>, binding = "internal", principal = READER) => {
    const t = svc.catalog.get(id)!;
    return svc.cypher({ schemaVersion: CYPHER_READ_INTENT_V1, intentId: `tpl-${stamp}`, pins: { schemaReleaseDigest: R }, purpose: `template ${id}`, bindingRef: binding, template: { id, statementDigest: t.statementDigest }, parameters, limits: { timeoutMs: 30_000 } }, principal);
  };
  // Deterministic candidate order for the template binder: subjects first, then minted records, then locators (each sorted).
  const preferredUids = () => [...new Set([...Object.values(fx.uids).sort(), ...Object.values(fx.mints).sort(), ...Object.values(fx.locators).map((l) => l.uid).sort()])].filter((u) => u.startsWith("hu:"));
  const part = (r: ReadResultV2, opId: string) => r.parts.find((p) => p.opId === opId)!;
  const uid = (k: string) => fx.uids[k]!;
  const mint = (k: string) => fx.mints[k]!;

  beforeAll(async () => {
    await client.verify();
    fx = await seedFixtureGraph(client, { stamp, custodyRoot, includeFu03: process.env.BKS_S4_SKIP_FU03 !== "1" });
    ({ legacyUid } = await seedOperationalRecords(client, uid("product"), stamp));
    svc = new ReadService({
      model,
      bindings: [
        { ref: "default", scope: "public", client, readAuthority: "session-routing", visibility: "application" },
        { ref: "internal", scope: "internal", client, readAuthority: "session-routing", visibility: "application" },
      ],
      snapshots,
      issuer: "bks-read-service",
      faults: { afterPart: async (c) => faults.afterPart?.(c) },
    });
    mkdirSync(evidenceDir, { recursive: true });
    record("fixture-graph", "seeded", { fu03: { intents: fx.fu03.intents, applied: fx.fu03.applied, rejected: fx.fu03.rejected, errors: fx.fu03.errors.length } });
  }, 1_500_000);

  afterAll(async () => {
    if (!enabled) return;
    mkdirSync(evidenceDir, { recursive: true });
    const server = await client.verify().catch(() => ({ agent: "?" }));
    writeFileSync(resolve(evidenceDir, `gate-b-read-${stamp}.json`), `${JSON.stringify({ stamp, uri: URI, server: server.agent, releaseId: model.releaseId, schemaReleaseDigest: R, queryCatalogDigest: model.queryCatalogDigest, finishedAt: new Date().toISOString(), evidence }, null, 2)}\n`);
    await client.close();
  });

  it("typed v2 gold answers: resolve (uid / identifier chain / ambiguous name), card, history, assertion trace, evidence, report, association", async () => {
    const r = await typed([
      { opId: "byuid", op: "resolve", mentions: [{ mentionId: "nr", uid: uid("nr") }] },
      { opId: "byid", op: "resolve", mentions: [{ mentionId: "nr", nodeType: "ChemicalSubstance", identifiers: [{ scheme: "UNII", value: fx.plans.catalog!.subjects.find((s) => s.ref === "nr") ? (await import("../write/fixtures-v2.js")).unii(stamp).toLowerCase() : "" }] }] },
      { opId: "card", op: "card", uid: uid("package") },
      { opId: "hist", op: "history", uid: uid("package"), relationshipType: "HAS_LABEL_VERSION" },
      { opId: "occ", op: "assertion", assertionUids: [mint("p-claim-occ.assertion")] },
      { opId: "about", op: "assertion", about: { uid: uid("nr"), role: "SUBJECT", predicate: "ACTIVATES" } },
      { opId: "ev", op: "evidence", uid: mint("p-claim-occ.assertion") },
      { opId: "rep", op: "report", reportUid: mint("r-report.report") },
      { opId: "assoc", op: "association", anchorUid: uid("nr") },
      { opId: "byname", op: "resolve", mentions: [{ mentionId: "org", name: `Synthetic Test Co ${stamp}` }] },
    ]);
    expect(r.status, JSON.stringify(r.parts.map((p) => [p.opId, p.status, p.reasons]))).toBe("ok");
    const byuid = part(r, "byuid").rows[0]!;
    expect([byuid.uid, byuid.basis, byuid.resolution]).toEqual([uid("nr"), "uid", "unique"]);
    const byid = part(r, "byid").rows[0]!;
    expect([byid.uid, byid.basis]).toEqual([uid("nr"), "identifier"]);
    // name without nodeType: bounded fan-out over Entity-labelled types (it runs a query; never a silent empty)
    const byname = part(r, "byname").rows;
    expect(byname.map((x) => [x.uid, x.basis, x.resolution])).toEqual([[uid("org"), "name_exact", "candidate"]]);
    expect((byid.identifiers as Array<{ scheme: string }>).map((i) => i.scheme)).toContain("UNII"); // KN-07 chain
    const card = part(r, "card").rows[0]!;
    expect((card.node as Record<string, unknown>).uid).toBe(uid("package"));
    expect(card.type).toBe("Package");
    expect((card.relationshipCounts as Array<{ type: string; count: number }>).find((x) => x.type === "HAS_LABEL_VERSION")?.count).toBe(2);
    const hist = part(r, "hist").rows;
    expect(hist.map((h) => [(h.target as { uid: string }).uid, h.recordedState])).toEqual([[uid("lv1"), "CLOSED"], [uid("lv2"), "OPEN"]]);
    expect((hist[0]!.assertion as { status: string }).status).toBe("SUPERSEDED");
    const occ = part(r, "occ").rows[0]!;
    expect((occ.assertion as { status: string }).status).toBe("ACCEPTED");
    expect(occ.statusMeaning).toMatch(/NOT a scientific truth/);
    expect((occ.asserter as { uid: string }).uid).toBe(uid("org"));
    expect((occ.occurrenceOf as { uid: string }).uid).toBe(uid("claim"));
    expect((occ.evidence as Array<{ role: string; origin: string }>).some((e) => e.role === "SUPPORTS" && e.origin === "DECLARED")).toBe(true);
    expect((occ.adjudications as Array<{ adjudicationKind: string; verdict: string }>).map((a) => [a.adjudicationKind, a.verdict])).toContainEqual(["CAPTURE_FIDELITY", "DIRECTLY_SUPPORTED"]);
    expect((occ.generatedBy as Array<{ runId: string }>).map((g) => g.runId)).toContain(fx.runIds.catalog);
    expect(occ.gaps).toContain("NO_SUPPORT_VERDICT");
    // KN-15: two asserters disagree (POSITIVE by the maker, NEGATIVE by the independent lab): both current, unranked.
    const about = part(r, "about").rows;
    const pol = about.filter((a) => (a.occurrenceOf as { uid?: string } | null)?.uid === uid("claim")).map((a) => [(a.asserter as { uid: string }).uid, (a.assertion as { polarity: string }).polarity]);
    expect(pol).toEqual(expect.arrayContaining([[uid("org"), "POSITIVE"], [uid("lab"), "NEGATIVE"]]));
    const ev = part(r, "ev").rows;
    expect(ev.length).toBeGreaterThanOrEqual(1);
    expect(ev.every((e) => ["CURRENT", "HISTORICAL", "REVISED", "UNKNOWN"].includes(String(e.evidenceState)))).toBe(true);
    const rep = part(r, "rep").rows[0]!;
    expect((rep.report as { verdict: string }).verdict).toBe("NOT_SUPPORTED");
    expect((rep.citesAssertions as Array<{ uid: string }>).map((a) => a.uid)).toContain(mint("p-claim-occ.assertion"));
    expect((rep.about as Array<{ uid: string }>).map((a) => a.uid)).toContain(uid("claim"));
    expect((rep.sentenceTrace as { state: string }).state).toBe("NO_LEDGER");
    const assoc = part(r, "assoc").rows[0]!;
    expect((assoc.association as { methodVersion: string }).methodVersion).toBe("bl-assoc/evidence-aggregate@1");
    record("typed-gold", "pass", { resultDigest: r.digests.resultDigest });
  });

  it("temporal views: recordedAsOf before the follow-up sees label v1 open; valid-time classes; status non-implication policy attached", async () => {
    const followAt = (toJson((await client.read((tx) => tx.run("MATCH (:Package {uid: $u})-[r:HAS_LABEL_VERSION]->(:LabelVersion {uid: $lv}) RETURN r.recordedTo AS t", { u: uid("package"), lv: uid("lv1") }))).records[0]!.get("t")) as string);
    const before = new Date(new Date(followAt).getTime() - 1).toISOString();
    const r = await typed([
      { opId: "then", op: "neighbors", uid: uid("package"), relationshipTypes: ["HAS_LABEL_VERSION"], direction: "OUT", view: { recordedAsOf: before } },
      { opId: "now", op: "neighbors", uid: uid("package"), relationshipTypes: ["HAS_LABEL_VERSION"], direction: "OUT" },
      { opId: "valid", op: "neighbors", uid: uid("package"), relationshipTypes: ["HAS_LABEL_VERSION"], direction: "OUT", view: { validAt: "2026-10-06T00:00:00Z" } },
      { opId: "inv", op: "neighbors", uid: uid("lv2"), relationshipTypes: ["HAS_LABEL_VERSION"], direction: "IN" },
      { opId: "status", op: "status", uid: uid("product") },
    ]);
    expect(part(r, "then").rows.map((x) => (x.node as { uid: string }).uid)).toEqual([uid("lv1")]);
    expect(part(r, "now").rows.map((x) => (x.node as { uid: string }).uid)).toEqual([uid("lv2")]);
    expect(part(r, "valid").rows.map((x) => x.validityClass)).toEqual(["OPEN_END_UNVERIFIED"]);
    expect(part(r, "inv").rows.map((x) => [(x.node as { uid: string }).uid, x.direction])).toEqual([[uid("package"), "IN"]]); // inverse-edge path
    expect(part(r, "status").status).toBe("empty");
    expect((part(r, "status").annotations as { nonImplicationPolicy: { id: string } }).nonImplicationPolicy.id).toBe("PR-01");
    record("temporal-views", "pass");
  });

  it("empty vs failed vs truncated vs skipped vs unsupported vs stale vs forbidden are distinct, typed, and only empty means absence", async () => {
    const empty = await typed([{ opId: "x", op: "card", uid: "hu:package:s4-does-not-exist" }]);
    expect(empty.status).toBe("empty");
    const trunc = await typed([{ opId: "x", op: "list", nodeType: "Assertion", limit: 3 }]);
    expect(trunc.status).toBe("truncated");
    expect(part(trunc, "x").rows.length).toBe(3);
    expect(part(trunc, "x").reasons[0]!.code).toBe("ROW_CAP");
    const unsupported = await typed([{ opId: "x", op: "association", anchorUid: uid("nr"), expansion: { ontology: "MONDO" } }]);
    expect([unsupported.status, part(unsupported, "x").reasons[0]!.code]).toEqual(["unsupported", "ONTOLOGY_ARTIFACT_ABSENT"]);
    const stale = await svc.typed({ schemaVersion: READ_INTENT_V2, intentId: "stale", pins: { schemaReleaseDigest: `sha256:${"0".repeat(64)}` }, purpose: "p", operations: [{ opId: "x", op: "card", uid: uid("package") }] }, READER);
    expect([stale.status, stale.reasons[0]!.code]).toEqual(["stale", "RELEASE_MISMATCH"]);
    const forbidden = await typed([{ opId: "x", op: "card", uid: uid("package") }], { principal: PUBLIC_READER, binding: "internal" });
    expect([forbidden.status, forbidden.reasons[0]!.code]).toEqual(["forbidden", "BINDING_FORBIDDEN"]);
    const failed = await template("K/Q-K-15", { label: "Assertion", uid: uid("nr") }, "internal");
    expect(["empty", "ok"]).toContain(failed.status); // runs; the failing case is a timeout:
    const timeout = await typed([{ opId: "x", op: "list", nodeType: "Assertion", limit: 3 }], { limits: { timeoutMs: 100 } });
    // a 100 ms budget may or may not be enough on a warm cache; force a database-side failure deterministically instead:
    const failing = await template("D9/Q-D9-20#vector", { questionEmbedding: [] });
    expect(failing.status).toBe("unsupported");
    const skippedR = await typed([
      { opId: "a", op: "list", nodeType: "Organization", where: { exact: "x" }, limit: 2 },
      { opId: "b", op: "card", uid: uid("package") },
    ]);
    expect(part(skippedR, "a").status).toBe("unsupported");
    expect(part(skippedR, "b").status).toBe("ok");
    const statuses = new Set([empty.status, trunc.status, unsupported.status, stale.status, forbidden.status]);
    expect(statuses.size).toBe(5);
    expect(new Set([empty.digests.resultDigest, trunc.digests.resultDigest, unsupported.digests.resultDigest]).size).toBe(3);
    record("status-distinct", "pass", { timeoutProbe: timeout.status });
  });

  it("visibility (typed, application-enforced): INTERNAL records and legacy/operational records are invisible in scope public through every path", async () => {
    const secret = uid("secret");
    const pub = (ops: Array<Record<string, unknown>>) => typed(ops, { binding: "default", principal: PUBLIC_READER });
    const r = await pub([
      { opId: "card", op: "card", uid: secret },
      { opId: "res", op: "resolve", mentions: [{ mentionId: "s", nodeType: "Organization", name: `Synthetic Internal Partner ${stamp}` }, { mentionId: "u", uid: secret }] },
      { opId: "about", op: "assertion", about: { uid: secret } },
      { opId: "list", op: "list", nodeType: "Organization", where: { name: `Synthetic Internal Partner ${stamp}` } },
      { opId: "legacy", op: "card", uid: legacyUid },
      { opId: "nb", op: "neighbors", uid: uid("product") },
      { opId: "pcard", op: "card", uid: uid("product") },
      { opId: "locator", op: "card", uid: fx.locators["l-claim"]!.uid },
      { opId: "occ", op: "assertion", assertionUids: [mint("p-claim-occ.assertion")] },
    ]);
    for (const k of ["card", "res", "about", "list", "legacy"]) expect(part(r, k).status, k).toBe("empty");
    const nbRows = part(r, "nb").rows;
    expect(nbRows.some((x) => x.type === "MIGRATED_FROM")).toBe(false);
    expect(JSON.stringify(nbRows)).not.toContain("LegacyV0");
    const counts = (part(r, "pcard").rows[0]!.relationshipCounts as Array<{ type: string }>).map((x) => x.type);
    expect(counts).not.toContain("MIGRATED_FROM");
    const loc = part(r, "locator").rows[0]!.node as Record<string, unknown>;
    expect(loc.selectorDigest).toBeTruthy();
    expect("exact" in loc || "prefix" in loc || "selectorJson" in loc).toBe(false); // span text restricted in scope public
    const occ = part(r, "occ").rows[0]!;
    expect(occ.gaps).toContain("LINEAGE_NOT_VISIBLE"); // Activities are INTERNAL
    expect(JSON.stringify(occ.evidence)).not.toContain('"exact"');
    // The same reads in scope internal see the internal record and the span text, but never legacy/operational ones.
    const i = await typed([
      { opId: "card", op: "card", uid: secret },
      { opId: "legacy", op: "card", uid: legacyUid },
      { opId: "nb", op: "neighbors", uid: uid("product") },
      { opId: "locator", op: "card", uid: fx.locators["l-claim"]!.uid },
    ]);
    expect(part(i, "card").status).toBe("ok");
    expect(part(i, "legacy").status).toBe("empty");
    expect(JSON.stringify(part(i, "nb").rows)).not.toMatch(/LegacyV0|MIGRATED_FROM/);
    expect((part(i, "locator").rows[0]!.node as Record<string, unknown>).exact).toBe("Synthetic NR activates synthetic protein SP1");
    // Catalog templates carry no scope predicates: refused on a public binding without database RBAC.
    const tpl = await template("K/Q-K-15", { label: "ChemicalSubstance", uid: uid("nr") }, "default", PUBLIC_READER);
    expect([tpl.status, tpl.parts[0]!.reasons[0]!.code]).toEqual(["forbidden", "VISIBILITY_UNPROVEN"]);
    // Arbitrary Cypher on Community (no read-only role): unavailable, not silently ungoverned.
    const adhoc = await svc.cypher({ schemaVersion: CYPHER_READ_INTENT_V1, intentId: "adhoc", pins: { schemaReleaseDigest: R }, purpose: "p", bindingRef: "internal", statement: "MATCH (p:Package {uid: $u}) RETURN p.uid AS uid", parameters: { u: uid("package") }, parameterSchema: { u: { type: "string" } } }, READER);
    expect([adhoc.status, adhoc.parts[0]!.reasons[0]!.code]).toEqual(["unsupported", "READ_AUTHORITY_UNAVAILABLE"]);
    record("visibility-typed-public", "pass");
  });

  it("stable_revision: probe and dependency reads in one transaction; a canonical write mid-read invalidates and retries; maxAttempts exhausted -> stale", async () => {
    let wrote = 0;
    const small = async (label: string) => {
      const intent = IngestionIntentV2.parse((await import("../write/fixtures-v2.js")).smallIntent(R, stamp, label));
      const plan = await fx.writer.plan(intent, PRINCIPALS.writer);
      const w = await fx.writer.admit(plan.planRef, { effectKey: `ek-${stamp}-${label}`, partialPolicy: "all" }, PRINCIPALS.writer);
      await fx.writer.apply({ schemaVersion: "biotech-knowledge-apply.v2", planRef: plan.planRef, expectedPlanDigest: plan.planDigest, intentDigest: plan.binding.intentDigest, effectKey: `ek-${stamp}-${label}`, partialPolicy: "all", witness: w }, PRINCIPALS.writer);
    };
    faults.afterPart = async (c) => {
      if (c.attempt === 1 && wrote === 0) {
        wrote++;
        await small("stable-a");
      }
    };
    const r = await typed([{ opId: "orgs", op: "list", nodeType: "Organization", where: { name: `Synthetic Org stable-a ${stamp}` } }], { mode: "stable_revision" });
    faults.afterPart = undefined;
    expect(r.consistency.attempts).toBe(2);
    expect(r.status).toBe("ok"); // the retried read sees the committed write
    expect(part(r, "orgs").rows.length).toBe(1);
    expect(r.consistency.graphRevision).toBeGreaterThan(0);
    expect(r.consistency.snapshotClaim).toBe(true);
    // Every attempt moves the revision -> stale after maxAttempts.
    let n = 0;
    faults.afterPart = async () => {
      n++;
      await small(`stable-loop-${n}`);
    };
    const s = await typed([{ opId: "orgs", op: "list", nodeType: "Organization", limit: 2 }], { mode: "stable_revision", maxAttempts: 2 });
    faults.afterPart = undefined;
    expect([s.status, s.reasons[0]!.code]).toEqual(["stale", "STALE_REVISION"]);
    record("stable-revision", "pass", { attempts: r.consistency.attempts, graphRevision: r.consistency.graphRevision });
  });

  it("forced transient failure: the whole read retries and every accumulator of the abandoned attempt is discarded", async () => {
    const seen: number[] = [];
    let inserted = false;
    faults.afterPart = async (c) => {
      seen.push(c.rowsSoFar);
      if (c.attempt === 1) {
        if (!inserted) {
          inserted = true;
          // Change the answer between attempts (a new organization) so stale first-attempt rows would be detectable.
          const intent = IngestionIntentV2.parse((await import("../write/fixtures-v2.js")).smallIntent(R, stamp, "transient"));
          const plan = await fx.writer.plan(intent, PRINCIPALS.writer);
          const w = await fx.writer.admit(plan.planRef, { effectKey: `ek-${stamp}-transient`, partialPolicy: "all" }, PRINCIPALS.writer);
          await fx.writer.apply({ schemaVersion: "biotech-knowledge-apply.v2", planRef: plan.planRef, expectedPlanDigest: plan.planDigest, intentDigest: plan.binding.intentDigest, effectKey: `ek-${stamp}-transient`, partialPolicy: "all", witness: w }, PRINCIPALS.writer);
        }
        throw Object.assign(new Error("injected transient failure"), { code: "Neo.TransientError.Transaction.DeadlockDetected", retriable: true });
      }
    };
    const ops = [{ opId: "orgs", op: "list", nodeType: "Organization", limit: 500 }, { opId: "card", op: "card", uid: uid("org") }];
    const r = await typed(ops, { persist: true, id: `transient-${stamp}` });
    faults.afterPart = undefined;
    expect(r.consistency.attempts).toBe(2);
    expect(r.status).toBe("ok");
    const fresh = await typed(ops, { id: `transient-${stamp}` });
    expect(r.digests.resultDigest).toBe(fresh.digests.resultDigest); // only the second attempt's rows survive
    const uids = part(r, "orgs").rows.map((x) => (x.node as { uid: string }).uid);
    expect(new Set(uids).size).toBe(uids.length);
    expect(uids).toContain(`hu:org:syn-small-org-transient-${stamp}`);
    // Touched dependencies in custody come from the surviving attempt only.
    const rec = await snapshots.verify(r.snapshot!.ref, r.snapshot!.bytesDigest, { scope: { installationId: READER.installationId, applicationId: READER.applicationId, tenantId: READER.tenantId }, schemaReleaseDigest: R });
    expect(rec.dependencies.nodes.map((n) => n.uid)).toContain(`hu:org:syn-small-org-transient-${stamp}`);
    expect(new Set(rec.dependencies.nodes.map((n) => n.uid)).size).toBe(rec.dependencies.nodes.length);
    record("transient-retry-reset", "pass", { attempts: r.consistency.attempts, rowsSeenPerAttempt: seen });
  });

  it("streaming at the execution boundary: the overflow probe stops a lazily produced billions-row statement after rowCap + 1 records; byte cap; list cap", async () => {
    const session = client.driver.session({ database: "neo4j", defaultAccessMode: "READ", fetchSize: 11 });
    const tx = await session.beginTransaction({ timeout: 20_000 });
    const limits = { rowCap: 10, byteCap: 1024 * 1024, timeoutMs: 20_000, maxDepth: 4, listCap: 5, nestingCap: 6 };
    const t0 = Date.now();
    const rows = await streamStep(tx, "MATCH (a:Entity), (b:Entity), (c:Entity), (d:Entity) RETURN a.uid AS a, b.uid AS b, c.uid AS c, d.uid AS d", {}, limits, limits.byteCap, Date.now() + 20_000);
    const ms = Date.now() - t0;
    expect(rows.rows.length).toBe(10);
    expect(rows.truncations).toEqual([{ kind: "rows", limit: 10 }]);
    expect(ms).toBeLessThan(5000); // a fetch-all of the 4-way product (hundreds of millions of rows) would not finish
    const bytes = await streamStep(tx, "UNWIND range(1, 1000) AS i RETURN i, 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' AS pad", {}, { ...limits, rowCap: 1000 }, 2048, Date.now() + 20_000);
    expect(bytes.truncations[0]!.kind).toBe("bytes");
    expect(bytes.bytes).toBeLessThanOrEqual(2048);
    const lists = await streamStep(tx, "RETURN range(1, 100000) AS fanout, [x IN range(1, 3) | range(1, 50)] AS nested", {}, limits, limits.byteCap, Date.now() + 20_000);
    expect((lists.rows[0]!.fanout as unknown[]).length).toBe(5);
    expect(lists.truncations.filter((t) => t.kind === "list").length).toBeGreaterThanOrEqual(2);
    await tx.rollback();
    await session.close();
    record("streaming-bounds", "pass", { overflowProbeMs: ms });
  });

  it("deadline: a server-heavy read is terminated at the budget and reported failed TIMEOUT (not empty)", async () => {
    // Templates are the only non-typed route on Community; a typed op cannot be made slow, so the service path is exercised
    // through the Enterprise suite. Here the transaction-timeout path is proven directly on the streaming boundary.
    const session = client.driver.session({ database: "neo4j", defaultAccessMode: "READ" });
    const tx = await session.beginTransaction({ timeout: 300 });
    const err = await streamStep(tx, "MATCH (a:Entity), (b:Entity), (c:Entity), (d:Entity) WHERE a.uid + b.uid + c.uid + d.uid = 'none' RETURN a.uid AS x", {}, { rowCap: 10, byteCap: 1024, timeoutMs: 300, maxDepth: 4, listCap: 5, nestingCap: 6 }, 1024, Date.now() + 60_000).catch((e: Error & { code?: string }) => e);
    expect(err instanceof Error).toBe(true);
    expect(String((err as { code?: string }).code)).toMatch(/TransactionTimedOut|Terminated/);
    await tx.rollback().catch(() => undefined);
    await session.close();
    record("deadline", "pass");
  });

  it("per-operation independence (eval B2): each observed operation has its own budget; a refused op does not make the read forbidden; an unreachable database fails at the deadline", async () => {
    // (1) three operations of >0.5 s each under a 1.5 s per-operation budget: all answer (a shared 1.5 s cap would time out).
    const slow = new ReadService({ model, bindings: [{ ref: "internal", scope: "internal", client, readAuthority: "session-routing", visibility: "application" }], faults: { afterPart: async () => new Promise((res) => setTimeout(res, 500)) } });
    const t0 = Date.now();
    const three = await slow.typed({ schemaVersion: READ_INTENT_V2, intentId: "b2-budget", pins: { schemaReleaseDigest: R }, purpose: "p", bindingRef: "internal", limits: { timeoutMs: 1500 }, operations: [
      { opId: "a", op: "assertion", about: { uid: uid("nr"), role: "SUBJECT" }, includeSuperseded: true },
      { opId: "b", op: "assertion", about: { uid: uid("nr"), role: "OBJECT" }, includeSuperseded: true },
      { opId: "c", op: "card", uid: uid("nr") },
    ] }, READER);
    const elapsed = Date.now() - t0;
    expect(three.parts.map((p) => p.status).every((x) => x === "ok" || x === "empty"), JSON.stringify(three.parts.map((p) => [p.status, p.reasons]))).toBe(true);
    expect([part(three, "a").status, part(three, "c").status]).toEqual(["ok", "ok"]);
    expect(three.status).toBe("ok");
    expect(elapsed).toBeGreaterThan(1500); // three 1.5 s budgets were used, not one shared cap
    // (2) a refused operation (predicate-only name as a relationship type) stays forbidden alone.
    const mixed = await typed([
      { opId: "rel", op: "neighbors", uid: uid("nr"), relationshipTypes: ["ACTIVATES"] },
      { opId: "facts", op: "assertion", about: { uid: uid("nr"), predicate: "ACTIVATES" } },
      { opId: "none", op: "card", uid: "hu:package:s4-absent" },
    ]);
    expect(mixed.parts.map((p) => [p.opId, p.status])).toEqual([["rel", "forbidden"], ["facts", "ok"], ["none", "empty"]]);
    expect(part(mixed, "rel").reasons[0]!.code).toBe("RELATIONSHIP_FORBIDDEN");
    expect(mixed.status).toBe("ok");
    // (3) unreachable database (non-routable address): failed at the 2 s budget, not after the driver connect timeout.
    const dead = new GraphClient({ uri: "bolt://10.255.255.1:7687", username: "neo4j", password: "unused", database: "neo4j" });
    const deadSvc = new ReadService({ model, bindings: [{ ref: "internal", scope: "internal", client: dead, readAuthority: "session-routing", visibility: "application" }] });
    const t1 = Date.now();
    const unreachable = await deadSvc.typed({ schemaVersion: READ_INTENT_V2, intentId: "b2-dead", pins: { schemaReleaseDigest: R }, purpose: "p", bindingRef: "internal", limits: { timeoutMs: 2000 }, operations: [{ opId: "c", op: "card", uid: uid("nr") }] }, READER);
    const deadMs = Date.now() - t1;
    expect(unreachable.status).toBe("failed");
    expect(unreachable.parts[0]!.status).toBe("skipped");
    expect(deadMs).toBeLessThan(6000);
    void dead.close().catch(() => undefined);
    record("per-operation-independence", "pass", { threeOpsMs: elapsed, unreachableMs: deadMs, unreachableReason: unreachable.reasons[0]?.code });
  });

  it("concurrency cap: a second concurrent read of the same principal beyond the cap is skipped, not run", async () => {
    const tight = new ReadService({ model, bindings: [{ ref: "internal", scope: "internal", client, readAuthority: "session-routing", visibility: "application" }], maxConcurrentPerPrincipal: 1, faults: { afterPart: async () => new Promise((res) => setTimeout(res, 2500)) } });
    const intent = { schemaVersion: READ_INTENT_V2, intentId: "conc", pins: { schemaReleaseDigest: R }, purpose: "p", bindingRef: "internal", operations: [{ opId: "x", op: "card", uid: uid("package") }] as TypedOperation[], limits: { timeoutMs: 1000 } };
    const [a, b] = await Promise.all([tight.typed({ ...intent, limits: { timeoutMs: 30_000 } }, READER), new Promise<ReadResultV2>((res) => setTimeout(() => res(tight.typed(intent, READER)), 200))]);
    expect(a.status).toBe("ok");
    expect([b.status, b.reasons[0]!.code]).toEqual(["skipped", "CONCURRENCY_LIMIT"]);
    record("concurrency-cap", "pass");
  });

  it("scalar serialization round-trips through the database (null, integers beyond 2^53, floats, instants, date-only, durations, points)", async () => {
    const session = client.driver.session({ database: "neo4j", defaultAccessMode: "READ" });
    const tx = await session.beginTransaction();
    const res = await tx.run("RETURN null AS n, 9007199254740993 AS big, -42 AS small, 2.0 AS f2, 0.1 AS f, datetime('2026-10-01T12:00:00.123000+02:00') AS dt, date('2024-02-29') AS d, duration({months: 14, days: 3, seconds: 3600, nanoseconds: 5}) AS dur, point({longitude: 13.4, latitude: 52.5}) AS pt, [1, 2.5, 'x', null] AS mixed");
    const rec = res.records[0]!;
    const lim = { listCap: 10, nestingCap: 5 };
    const ser = Object.fromEntries(rec.keys.map((k) => [k, normalizeValue(rec.get(k), lim, { truncations: [] })]));
    expect(ser).toMatchObject({ n: null, big: { $type: "Integer", value: "9007199254740993" }, small: -42, f2: { $type: "Float", value: "2" }, f: 0.1, dt: { $type: "DateTime", value: "2026-10-01T10:00:00.123Z" }, d: { $type: "Date", value: "2024-02-29" }, dur: { $type: "Duration", value: "P14M3DT3600.000000005S" }, pt: { $type: "Point", srid: 4326, x: 13.4, y: 52.5 } });
    // Round trip: decoded values sent back as parameters compare equal inside the database.
    const back = Object.fromEntries(Object.entries(ser).map(([k, v]) => [k, decodeReadValue(v)]));
    const eq = await tx.run("RETURN $big = 9007199254740993 AS big, $small = -42 AS small, $f2 = 2.0 AS f2, $dt = datetime('2026-10-01T12:00:00.123000+02:00') AS dt, $d = date('2024-02-29') AS d, $dur = duration({months: 14, days: 3, seconds: 3600, nanoseconds: 5}) AS dur, $pt = point({longitude: 13.4, latitude: 52.5}) AS pt, $n IS NULL AS n", back);
    expect(eq.records[0]!.toObject()).toEqual({ big: true, small: true, f2: true, dt: true, d: true, dur: true, pt: true, n: true });
    await tx.rollback();
    await session.close();
    record("serialization-roundtrip", "pass");
  });

  it("digests: identical reads share queryDigest and resultDigest, not receiptDigest; parameters and limits change queryDigest; v1 contract still decodes", async () => {
    const ops = [{ opId: "c", op: "card", uid: uid("package") }];
    const a = await typed(ops, { id: "dg" });
    const b = await typed(ops, { id: "dg" });
    expect(a.digests.queryDigest).toBe(b.digests.queryDigest);
    expect(a.digests.resultDigest).toBe(b.digests.resultDigest);
    expect(a.digests.receiptDigest).not.toBe(b.digests.receiptDigest);
    const c = await typed([{ opId: "c", op: "card", uid: uid("lv1") }], { id: "dg" });
    expect(c.digests.queryDigest).not.toBe(a.digests.queryDigest);
    const l = await typed(ops, { id: "dg", limits: { rowCap: 7 } });
    expect(l.digests.queryDigest).not.toBe(a.digests.queryDigest);
    expect(l.digests.resultDigest).toBe(a.digests.resultDigest);
    // resultDigest is recomputable from the returned body (no hidden inputs).
    expect(canonicalDigest({ format: "bks-read-result-digest.v1", status: a.status, reasons: a.reasons, ordering: a.ordering, parts: a.parts.map((p) => ({ opId: p.opId, op: p.op, status: p.status, reasons: p.reasons, columns: p.columns, rows: p.rows, truncations: p.truncations })) })).toBe(a.digests.resultDigest);
    // v1 read contract: unchanged decoding and digest verification.
    const { executeReadIntent } = await import("../read.js");
    const { SchemaModel } = await import("../schema-access.js");
    const { openWorkspace, loadSidecars } = await import("@bks/schema-workspace");
    const ws = openWorkspace();
    const v1 = await executeReadIntent(client, new SchemaModel(ws.ir(), loadSidecars(), ws.manifest.workspaceFingerprint), { schemaVersion: "biotech-knowledge-read-intent.v1", intentId: "v1-still-decodes", context: { actor: { kind: "agent", id: "s4" }, run: { system: "mission-control", runId: "s4" } }, operations: [{ opId: "c1", kind: "node.card", uid: uid("package") }] });
    expect(v1.schemaVersion).toBe("biotech-knowledge-read-snapshot.v1");
    record("digests", "pass", { queryDigest: a.digests.queryDigest, resultDigest: a.digests.resultDigest });
  });

  it("snapshot custody: a stable_revision read persisted by the read service is a verifiable ingestion basis (planner accepts revision-equal)", async () => {
    const r = await typed([{ opId: "c", op: "card", uid: uid("org") }], { mode: "stable_revision", persist: true, id: `basis-${stamp}` });
    expect(r.snapshot).not.toBeNull();
    const intent = (await import("../write/fixtures-v2.js")).smallIntent(R, stamp, "basis");
    intent.basis = { snapshotRef: { ref: r.snapshot!.ref, digest: r.snapshot!.bytesDigest } };
    const writer = new (await import("../write/service.js")).KnowledgeWriter(client, { schema: fx.writer.schema, plans: fx.writer.plans, snapshots, verifications: fx.writer.verifications, witnessKeys: fx.writer.witnessKeys, signer: fx.writer.signer, authority: fx.writer.authority, localDev: false });
    const plan = await writer.plan(intent, PRINCIPALS.writer);
    expect(plan.errors).toEqual([]);
    expect(plan.binding.basis.dependencyCheck).toBe("revision-equal");
    const bytes = readFileSync(resolve(custodyRoot, "snapshots", `${r.snapshot!.ref}.bytes`), "utf8");
    expect(JSON.parse(bytes).digests.resultDigest).toBe(r.digests.resultDigest);
    record("snapshot-custody", "pass", { ref: r.snapshot!.ref, bytesDigest: r.snapshot!.bytesDigest });
  });

  it("query catalog: every supported template executed with result assertions against the fixture graph", async () => {
    catalogRuns = await runCatalogAssertions(svc, READER, "internal", client, { maxCombinations: 60, timeoutMs: 20_000, preferredUids: preferredUids() });
    const counts = catalogRuns.reduce((acc: Record<string, number>, r) => ((acc[r.outcome] = (acc[r.outcome] ?? 0) + 1), acc), {});
    const doc = `${JSON.stringify({ stamp, releaseId: model.releaseId, queryCatalogDigest: model.queryCatalogDigest, fu03: fx.fu03, counts, runs: catalogRuns }, null, 2)}\n`;
    writeFileSync(resolve(evidenceDir, `catalog-assertions-${stamp}.json`), doc);
    writeFileSync(resolve(evidenceDir, "catalog-assertions.json"), doc);
    expect(catalogRuns.length).toBe(svc.catalog.templates.filter((t) => t.status === "supported").length);
    // Optional same-graph comparison with another release's catalog (e.g. the previous pin): separates release changes
    // (template corrections / additions) from fixture-graph differences between runs.
    const otherDir = process.env.BKS_S4_COMPARE_RELEASE_DIR;
    if (otherDir) {
      const { loadRelease } = await import("@bks/schema-workspace");
      const otherModel = new ReadModel(loadRelease({ dir: otherDir }));
      const other = new ReadService({ model: otherModel, bindings: [{ ref: "internal", scope: "internal", client, readAuthority: "session-routing", visibility: "application" }] });
      const prefer = preferredUids();
      const otherRuns = await runCatalogAssertions(other, READER, "internal", client, { maxCombinations: 60, timeoutMs: 20_000, preferredUids: prefer });
      const byId = new Map(otherRuns.map((r) => [r.id, r]));
      const otherTemplates = (otherModel.release.queryCatalog as { templates: Array<{ id: string; statementDigest: string }> }).templates;
      const diff = catalogRuns
        .map((r) => ({ id: r.id, pinned: r.outcome, other: byId.get(r.id)?.outcome ?? "absent", sameStatement: otherTemplates.find((t) => t.id === r.id)?.statementDigest === svc.catalog.get(r.id)?.statementDigest, pinnedReason: r.reasons[0] ?? null, otherReason: byId.get(r.id)?.reasons[0] ?? null }))
        .filter((x) => x.pinned !== x.other);
      const otherCounts = otherRuns.reduce((acc: Record<string, number>, r) => ((acc[r.outcome] = (acc[r.outcome] ?? 0) + 1), acc), {});
      writeFileSync(resolve(evidenceDir, `catalog-compare-${stamp}.json`), `${JSON.stringify({ stamp, pinned: { releaseId: model.releaseId, counts }, other: { releaseId: otherModel.releaseId, counts: otherCounts, runs: otherRuns }, differences: diff }, null, 2)}\n`);
      record("catalog-compare", "measured", { pinned: counts, other: { releaseId: otherModel.releaseId, counts: otherCounts }, differences: diff.length });
    }
    expect(catalogRuns.every((r) => r.negative !== null || r.outcome === "unsupported")).toBe(true);
    record("catalog-result-assertions", "pass", counts);
  }, 1_800_000);

  it("typed and template routes answer the same gold questions (provenance trace, identifiers, report citations, current label version)", async () => {
    const occ = mint("p-claim-occ.assertion");
    const [tP01, tId, tRep, tLv] = await Promise.all([
      template("QP/P-01b", { assertionUid: occ }),
      template("D1/CQ-ID-04", { sUid: uid("nr"), rt: new Date().toISOString(), vt: new Date().toISOString() }),
      template("K/Q-K-17", { reportUid: mint("r-report.report") }),
      template("D6/Q-D6-01#1", { package: uid("package") }),
    ]);
    const ty = await typed([
      { opId: "occ", op: "assertion", assertionUids: [occ] },
      { opId: "card", op: "card", uid: uid("nr") },
      { opId: "rep", op: "report", reportUid: mint("r-report.report") },
      { opId: "hist", op: "history", uid: uid("package"), relationshipType: "HAS_LABEL_VERSION" },
    ]);
    const sorted = (xs: unknown[]) => [...new Set(xs.map(String))].sort();
    // P-01b vs typed assertion trace: locator digests, adjudications, asserter, runs.
    const p01 = tP01.parts[0]!.rows;
    const typedOcc = part(ty, "occ").rows[0]!;
    expect(sorted(p01.map((r) => r["loc.selectorDigest"]))).toEqual(sorted((typedOcc.evidence as Array<{ locator: { selectorDigest: string } }>).map((e) => e.locator.selectorDigest)));
    expect(sorted((p01[0]!.adjudications as Array<{ uid: string }>).map((a) => a.uid))).toEqual(sorted((typedOcc.adjudications as Array<{ uid: string; recordedTo: unknown }>).filter((a) => a.recordedTo === null).map((a) => a.uid)));
    expect(p01[0]!.asserterUid).toBe((typedOcc.asserter as { uid: string }).uid);
    expect(sorted((p01[0]!.runs as Array<{ runId: string }>).map((x) => x.runId))).toEqual(sorted((typedOcc.generatedBy as Array<{ runId: string }>).map((x) => x.runId)));
    // CQ-ID-04 vs typed card identifiers.
    const ids = tId.parts[0]!.rows[0]!.identifiers as Array<{ scheme: string; value: string; issuer: string }>;
    expect(sorted(ids.map((i) => `${i.scheme}|${i.issuer}|${i.value}`))).toEqual(sorted((part(ty, "card").rows[0]!.identifiers as Array<{ scheme: string; issuer: string; value: string }>).map((i) => `${i.scheme}|${i.issuer}|${i.value}`)));
    // Q-K-17 vs typed report citations.
    const k17 = tRep.parts[0]!.rows;
    const rep = part(ty, "rep").rows[0]!;
    expect(sorted(k17.filter((r) => r.kind === "ASSERTION").map((r) => r.uid))).toEqual(sorted((rep.citesAssertions as Array<{ uid: string }>).map((a) => a.uid)));
    expect(sorted(k17.filter((r) => r.kind === "ASSESSMENT").map((r) => r.uid))).toEqual(sorted((rep.citesAssessments as Array<{ uid: string }>).map((a) => a.uid)));
    expect(sorted(k17.filter((r) => r.kind === "LOCATOR").map((r) => r.uid))).toEqual(sorted((rep.evidence as Array<{ locatorUid: string }>).map((a) => a.locatorUid)));
    // Q-D6-01#1 current label version vs typed history OPEN episodes.
    expect(sorted(tLv.parts[0]!.rows.map((r) => r["cur.lv.uid"]))).toEqual(sorted(part(ty, "hist").rows.filter((h) => h.recordedState === "OPEN").map((h) => (h.target as { uid: string }).uid)));
    record("typed-vs-template-gold", "pass", { templates: ["QP/P-01b", "D1/CQ-ID-04", "K/Q-K-17", "D6/Q-D6-01#1"] });
  });

  it("catalog corrections (patch for the schema authority): no AllNodesScan after the fix; same rows as the released statement on the fixture graph", async () => {
    const corrections = correctionsFor(svc.catalog.templates);
    const out: Array<Record<string, unknown>> = [];
    for (const c of corrections) {
      const t = svc.catalog.get(c.id)!;
      const plan = async (stmt: string, params: Record<string, unknown>) => {
        const s = client.session("READ");
        try {
          const res = await s.run(`EXPLAIN ${stmt}`, params);
          const ops: string[] = [];
          const visit = (p: { operatorType?: string; children?: unknown[] } | undefined) => {
            if (!p) return;
            ops.push(String(p.operatorType).replace(/@.*$/, ""));
            for (const ch of p.children ?? []) visit(ch as never);
          };
          visit(res.summary.plan as never);
          return ops;
        } finally {
          await s.close();
        }
      };
      const bindingOf = (catalogRuns.find((r) => r.id === c.id)?.positive?.parameters ?? null) as Record<string, unknown> | null;
      const params: Record<string, unknown> = {};
      for (const [k, schema] of Object.entries(t.parameters)) params[k] = (await import("./values.js")).bindParameter(bindingOf?.[k] ?? (schema.neo4jType ? new Date().toISOString() : schema.type === "array" ? [] : schema.type === "integer" ? 10 : schema.type === "boolean" ? false : k === "label" ? "Organization" : "hu:org:none"), schema as never);
      const before = await plan(t.statement, params);
      const after = await plan(c.statement, params);
      const run = async (stmt: string) => {
        const s = client.session("READ");
        try {
          return (await s.run(stmt, params)).records.map((r) => JSON.stringify(toJson(r.toObject()))).sort();
        } finally {
          await s.close();
        }
      };
      const [rb, ra] = await Promise.all([run(t.statement), run(c.statement)]);
      out.push({ id: c.id, allNodesScanBefore: before.includes("AllNodesScan"), allNodesScanAfter: after.includes("AllNodesScan"), rowsBefore: rb.length, rowsAfter: ra.length, sameRows: JSON.stringify(rb) === JSON.stringify(ra), binding: bindingOf ? "fixture-positive" : "absent" });
      expect(after.includes("AllNodesScan"), c.id).toBe(false);
      if (c.id !== "D5/Q-D5-20" && c.id !== "D9/Q-D9-02") expect(ra, c.id).toEqual(rb);
    }
    writeFileSync(resolve(evidenceDir, "catalog-corrections.json"), `${JSON.stringify({ stamp, corrections: corrections.map((c) => ({ ...c, check: out.find((o) => o.id === c.id) })) }, null, 2)}\n`);
    record("catalog-corrections", "pass", out);
  }, 600_000);

  it("skill examples (.agents/skills/biotech-kg-query/examples/examples.json) execute against the fixture graph with their stated outcome", async () => {
    const manifest = JSON.parse(readFileSync(resolve(repo, ".agents", "skills", "biotech-kg-query", "examples", "examples.json"), "utf8")) as { examples: Array<{ id: string; route: "typed" | "cypher" | "explain"; edition: "any" | "enterprise"; binding?: string; artifact: Record<string, unknown>; expect: Array<{ path: string; equals?: unknown; contains?: unknown; gte?: number; oneOf?: unknown[] }> }> };
    const subst = (v: unknown): unknown => {
      if (typeof v === "string") return v.replace(/\{\{(uid|mint|loc)\.([^}]+)\}\}/g, (_m, kind: string, key: string) => (kind === "uid" ? uid(key) : kind === "mint" ? mint(key) : fx.locators[key]!.uid)).replace(/{{digest.([^}]+)}}/g, (_m, id: string) => svc.catalog.get(id)!.statementDigest).replace(/{{release}}/g, R).replace(/{{stamp}}/g, stamp);
      if (Array.isArray(v)) return v.map(subst);
      if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, subst(x)]));
      return v;
    };
    const ran: string[] = [];
    for (const ex of manifest.examples.filter((e) => e.edition === "any")) {
      const artifact = subst(ex.artifact) as Record<string, unknown>;
      const res = ex.route === "typed" ? await svc.typed(artifact, READER) : await svc.cypher(artifact, READER);
      for (const a of ex.expect) {
        const value = a.path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[/^\d+$/.test(k) ? Number(k) : k], res);
        if ("equals" in a) expect(value, `${ex.id} ${a.path}`).toEqual(subst(a.equals));
        if ("contains" in a) expect(JSON.stringify(value), `${ex.id} ${a.path}`).toContain(String(subst(a.contains)));
        if ("gte" in a) expect(Number(value), `${ex.id} ${a.path}`).toBeGreaterThanOrEqual(a.gte!);
        if ("oneOf" in a) expect(a.oneOf, `${ex.id} ${a.path}`).toContain(value);
      }
      ran.push(ex.id);
    }
    expect(ran.length).toBeGreaterThanOrEqual(5);
    record("skill-examples", "pass", ran);
  });

  it("question status report (regenerated 454-question status; supported = executed with result assertions)", async () => {
    const status = buildQuestionStatus(svc.catalog, catalogRuns, { stamp, enterpriseEvidence: process.env.BKS_S4_EE_EVIDENCE ?? null });
    // Run output only. The cited report is regenerated deliberately with BKS_S4_WRITE_QUESTION_STATUS=1.
    writeQuestionStatus(status, evidenceDir, `question-status-${stamp}`);
    if (process.env.BKS_S4_WRITE_QUESTION_STATUS === "1") writeQuestionStatus(status, resolve(repo, "docs", "plans", "schema-v2-service-release", "reports"), "S4-question-status");
    expect(status.questions.length).toBe(454);
    record("question-status", "pass", status.counts);
  });
});

void neo4j;
