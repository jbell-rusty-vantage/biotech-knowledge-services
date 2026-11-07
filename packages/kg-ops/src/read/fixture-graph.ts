import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { IngestionIntentV2, rawBytesDigest, type IngestionIntentV2Input, type IngestionPlanV2, type PartialPolicy, type SealedVerificationBody } from "@bks/contracts";
import { loadRelease, repoRoot } from "@bks/schema-workspace";
import { FileSnapshotCustody, FileVerificationCustody, MemoryPlanStore } from "../custody.js";
import { ensureOperationalState, installReleaseMarker } from "../fence.js";
import type { GraphClient } from "../neo4j.js";
import { generateWitnessKeyPair, MemoryGrantAuthority, parsePinnedKeys } from "../witness.js";
import { adjudicationIntent, catalogIntent, eventIntent, followupIntent, POLICY_VERSION, projectionIntent, reportIntent } from "../write/fixtures-v2.js";
import { migrateIntentV1 } from "../write/migrate-v1.js";
import { KnowledgeWriter, writeSchema } from "../write/service.js";
import { PRINCIPALS, sealVerification } from "../write/test-support.js";
import type { PrincipalCtx } from "../write/context.js";

/**
 * Read-side fixture graph (S4 Gate B and query-catalog result assertions). Every domain record is written through
 * the v2 trusted writer (plan -> development admission witness -> apply), never by hand. The only exception is
 * `seedOperationalRecords`: the operational records only the migrator writes (LegacyV0 nodes, MIGRATED_FROM,
 * KsIntentMarker), which the visibility tests need.
 *
 * SYNTHETIC data: the S3 Gate B fixtures (fixtures.bks.test sources), the FU-03 migrated packet intents
 * (schema/program/final/fixtures/**, mechanically migrated, admitted subsets only) and the S4 read fixture below.
 * Only local disposable databases (127.0.0.1 / localhost / ::1) are accepted; seeding resets the database.
 */

export interface FixtureGraph {
  stamp: string;
  writer: KnowledgeWriter;
  /** uid by subject ref (catalog refs: org, brand, product, variant, package, lv1, lv2, material, nr, sp1, mech, person, account, claim; S4 refs: lab, secret). */
  uids: Record<string, string>;
  /** minted uids keyed `${proposalId}.${kind}` (assertion / relationship / assessment / adjudication / report ...). */
  mints: Record<string, string>;
  /** locator uid + selectorDigest by locator ref. */
  locators: Record<string, { uid: string; selectorDigest: string }>;
  plans: Record<string, IngestionPlanV2>;
  activityUids: Record<string, string>;
  runIds: Record<string, string>;
  missionId: string;
  fu03: { intents: number; applied: number; rejected: number; errors: string[] };
}

export function assertLocalUri(uri: string): void {
  const host = new URL(uri.replace(/^(bolt|neo4j)(\+s|\+ssc)?:/, "http:")).hostname;
  if (!["127.0.0.1", "localhost", "::1", "[::1]"].includes(host)) throw new Error(`refusing to seed a fixture graph on non-local Neo4j ${uri}`);
}

/** S4 read fixture: a second asserter that disagrees (KN-15 disagreement preserved), and an INTERNAL-class entity (visibility). */
export function readFixtureIntent(releaseDigest: string, stamp: string, refs: { nrUid: string; sp1Uid: string; claimUid: string }): IngestionIntentV2Input {
  const base = `https://fixtures.bks.test/${stamp}/s4`;
  const sel = (exact: string, start: number) => ({ basis: "raw-capture/v1", type: "TextQuoteSelector", exact, refinedBy: { type: "TextPositionSelector", start, end: start + exact.length } });
  const loc = (ref: string, exact: string, start: number) => ({ ref, selectorKind: "TEXT_QUOTE", selector: sel(exact, start), exact, startOffset: start, endOffset: start + exact.length });
  return {
    schemaVersion: "biotech-knowledge-intent.v2",
    intentId: `s4-${stamp}-read`,
    pins: { schemaReleaseDigest: releaseDigest, policyVersion: POLICY_VERSION },
    context: { actor: { kind: "agent", id: "s4-read-fixtures", model: "synthetic" }, run: { system: "mission-control", runId: `run-${stamp}-s4`, missionId: `mission-${stamp}`, operationId: `op-${stamp}-s4` }, activityKind: "INGESTION" },
    basis: { creationOnly: { reason: "S4 read fixture: synthetic disagreement and an internal entity" } },
    sources: [
      {
        ref: "paper",
        source: { canonicalUri: `${base}/paper`, title: "Synthetic disconfirming paper", sourceKind: "WEB_PAGE" },
        snapshot: { retrievedAt: "2026-10-02T10:00:00Z", observedAt: "2026-10-02T10:00:00Z", contentHash: rawBytesDigest(`s4-paper-${stamp}`), contentHashBasis: "SYNTHETIC_FIXTURE", captureMethod: "bks-fixture/1", captureCompleteness: "COMPLETE" },
        locators: [loc("l-deny", "Synthetic NR did not activate SP1 in our assay", 10), loc("l-internal", "Internal synthetic partner note", 120)],
      },
    ],
    subjects: [
      { ref: "nr", mode: "resolved", uid: refs.nrUid, nodeType: "ChemicalSubstance" },
      { ref: "sp1", mode: "resolved", uid: refs.sp1Uid, nodeType: "MolecularEntity" },
      { ref: "claim", mode: "resolved", uid: refs.claimUid, nodeType: "Claim" },
      { ref: "lab", mode: "new", nodeType: "Organization", name: `Synthetic Independent Lab ${stamp}`, uidSegment: `syn-s4-lab-${stamp}`, properties: { entityKind: "LEGAL_ENTITY" }, onMatch: "use_existing" },
      { ref: "secret", mode: "new", nodeType: "Organization", name: `Synthetic Internal Partner ${stamp}`, uidSegment: `syn-s4-internal-${stamp}`, properties: { entityKind: "LEGAL_ENTITY", privacyClass: "INTERNAL" }, onMatch: "use_existing" },
    ],
    proposals: [
      { proposalId: "s4-deny", kind: "assertion.relate", subjectRef: "nr", objectRef: "sp1", asserterRef: "lab", evidence: ["l-deny"], assertion: { predicate: "ACTIVATES", assertionKind: "CLAIM", claimType: "RELATIONSHIP", occurrenceOf: { claimRef: "claim" }, polarity: "NEGATIVE", speechAct: "STATES", basisKind: "DIRECT_MEASUREMENT", validity: {} } },
      { proposalId: "s4-internal-legal", kind: "assertion.literal", subjectRef: "secret", asserterRef: "secret", evidence: ["l-internal"], assertion: { predicate: "LEGAL_NAME", validity: {} }, value: { valueString: `Synthetic Internal Partner ${stamp} GmbH` } },
    ],
    notes: "S4 synthetic read fixture. Not sourced knowledge.",
  };
}

/** Drops every constraint and non-lookup index of a local disposable database (deterministic DDL state for the suite). */
export async function dropSchema(client: GraphClient): Promise<void> {
  assertLocalUri(client.config.uri);
  const run = async (q: string) => {
    const s = client.session("WRITE");
    try {
      return await s.run(q);
    } finally {
      await s.close();
    }
  };
  for (const r of (await run("SHOW CONSTRAINTS YIELD name RETURN name")).records) await run(`DROP CONSTRAINT \`${String(r.get("name"))}\` IF EXISTS`);
  for (const r of (await run("SHOW INDEXES YIELD name, type, owningConstraint WHERE type <> 'LOOKUP' AND owningConstraint IS NULL RETURN name")).records) await run(`DROP INDEX \`${String(r.get("name"))}\` IF EXISTS`);
}

/** Applies the pinned release's required DDL (`loadRelease().ddl`, file ddl/required.cypher) to a local disposable database. */
export async function applyReleaseDdl(client: GraphClient, file = "ddl/required.cypher"): Promise<{ applied: number; existing: number }> {
  assertLocalUri(client.config.uri);
  const manifest = loadRelease().ddl.manifest as unknown as { statements: Array<{ statement: string; file: string }> };
  let applied = 0;
  let existing = 0;
  for (const s of manifest.statements.filter((x) => x.file === file)) {
    const session = client.session("WRITE");
    try {
      await session.run(s.statement);
      applied++;
    } catch (e) {
      if (/already exists|equivalent/i.test((e as Error).message)) existing++;
      else throw e;
    } finally {
      await session.close();
    }
  }
  const session = client.session("WRITE");
  try {
    await session.run("CALL db.awaitIndexes(300)");
  } finally {
    await session.close();
  }
  return { applied, existing };
}

export interface SeedOptions {
  stamp: string;
  custodyRoot: string;
  includeFu03?: boolean;
  reset?: boolean;
  log?: (m: string) => void;
}

export async function seedFixtureGraph(client: GraphClient, opts: SeedOptions): Promise<FixtureGraph> {
  assertLocalUri(client.config.uri);
  const schema = writeSchema();
  const R = schema.schemaReleaseDigest;
  const { stamp } = opts;
  const log = opts.log ?? (() => undefined);
  if (opts.reset !== false) {
    await client.write((tx) => tx.run("MATCH (n) DETACH DELETE n"));
    await dropSchema(client);
  }
  await applyReleaseDdl(client);
  await ensureOperationalState(client, schema);
  const rel = loadRelease();
  const ddlDigest = String((rel.manifest as unknown as { identities?: { ddlDigest?: string } }).identities?.ddlDigest ?? rel.pin?.ddlDigest ?? "") || null;
  await installReleaseMarker(client, { releaseId: schema.releaseId, schemaReleaseDigest: R }, `s4-fixture-${stamp}`, ddlDigest);

  const issuerKey = generateWitnessKeyPair("s4-issuer");
  const verifierKey = generateWitnessKeyPair("s4-verifier");
  const plans = new MemoryPlanStore();
  const snapshots = new FileSnapshotCustody(resolve(opts.custodyRoot, "snapshots"), ["bks-read-service"]);
  const verifications = new FileVerificationCustody(resolve(opts.custodyRoot, "verifications"), new Map([[verifierKey.kid, verifierKey.publicKeyDer]]));
  const writer = new KnowledgeWriter(client, { schema, plans, snapshots, verifications, witnessKeys: parsePinnedKeys(`${issuerKey.kid}:${issuerKey.publicKeyDer}`), signer: { kid: issuerKey.kid, key: issuerKey.privateKey }, authority: new MemoryGrantAuthority(), issuer: "s4-fixture-admission", localDev: false });

  const out: FixtureGraph = { stamp, writer, uids: {}, mints: {}, locators: {}, plans: {}, activityUids: {}, runIds: {}, missionId: `mission-${stamp}`, fu03: { intents: 0, applied: 0, rejected: 0, errors: [] } };
  const collect = (name: string, plan: IngestionPlanV2) => {
    out.plans[name] = plan;
    for (const s of plan.subjects) if (s.uid && !out.uids[s.ref] && !name.startsWith("fx-")) out.uids[s.ref] = s.uid;
    for (const p of plan.proposals) for (const [k, v] of Object.entries(p.mints ?? {})) if (!name.startsWith("fx-")) out.mints[`${p.proposalId}.${k}`] = v as string;
    for (const s of plan.sources ?? []) for (const l of s.locators ?? []) if (!name.startsWith("fx-")) out.locators[l.ref] = { uid: l.uid, selectorDigest: l.selectorDigest };
    out.activityUids[name] = plan.activity.uid;
  };
  async function run(name: string, intent: IngestionIntentV2Input, principal: PrincipalCtx = PRINCIPALS.writer, require: "all" | "admitted" = "all"): Promise<IngestionPlanV2> {
    // A cold database (fresh plan cache, full release DDL) can exceed the planner read budget on the first plans:
    // planning is pure, so retry the plan (never the apply).
    let plan: IngestionPlanV2 | null = null;
    for (let i = 1; !plan; i++) {
      try {
        plan = await writer.plan(intent, principal);
      } catch (e) {
        if (i >= 4 || !/terminated|timed out|TransactionTimedOut|not in the frozen observation set/i.test(String((e as Error).message))) throw e;
        log(`fixture ${name}: planner read timed out on a cold database, retry ${i}`);
      }
    }
    if (require === "all" && plan.outcome !== "applicable") {
      throw new Error(`fixture ${name} did not plan applicable: ${plan.outcome} ${JSON.stringify(plan.errors)} ${JSON.stringify(plan.proposals.filter((p) => p.disposition !== "admitted").map((p) => [p.proposalId, p.reasons]))}`);
    }
    const admitted = plan.proposals.filter((p) => p.disposition === "admitted").map((p) => p.proposalId);
    if (!admitted.length) return plan;
    const partialPolicy: PartialPolicy = plan.outcome === "applicable" ? "all" : { include: admitted };
    const effectKey = `ek-${stamp}-${name}`.slice(0, 190);
    const witness = await writer.admit(plan.planRef, { effectKey, partialPolicy }, principal);
    const receipt = await writer.apply({ schemaVersion: "biotech-knowledge-apply.v2", planRef: plan.planRef, expectedPlanDigest: plan.planDigest, intentDigest: plan.binding.intentDigest, effectKey, partialPolicy, witness }, principal);
    if (receipt.outcome !== "applied" && receipt.outcome !== "partial") throw new Error(`fixture ${name} apply ${receipt.outcome}: ${JSON.stringify(receipt.failure)}`);
    collect(name, plan);
    log(`fixture ${name}: ${receipt.outcome}`);
    return plan;
  }

  await run("catalog", catalogIntent(R, stamp));
  out.runIds.catalog = `run-${stamp}-r1`;
  const m = (pid: string, k = "assertion") => {
    const v = out.mints[`${pid}.${k}`];
    if (!v) throw new Error(`fixture mint ${pid}.${k} missing`);
    return v;
  };
  await run("followup", followupIntent(R, stamp, { packageUid: out.uids.package!, orgUid: out.uids.org!, brandUid: out.uids.brand!, lv1RelUid: m("p-lv1", "relationship"), ownsAssertionUid: m("p-owns") }));
  out.runIds.followup = `run-${stamp}-r2`;
  const events = await run("events", eventIntent(R, stamp));
  for (const s of events.subjects) if (s.uid) out.uids[`event.${s.ref}`] = s.uid;

  // Adjudications from sealed verification results (privileged verifier principal; S3's trusted delivery path).
  const locClaim = out.locators["l-claim"]!;
  const base = (ref: string, over: Partial<SealedVerificationBody>): SealedVerificationBody => ({
    format: "bks-sealed-verification.v1",
    ref,
    issuer: "ks-verification",
    judgmentId: `${ref}-j`,
    assertionUid: m("p-claim-occ"),
    adjudicationKind: "CAPTURE_FIDELITY",
    verdict: "DIRECTLY_SUPPORTED",
    policyOutcome: "PASS",
    judgeKind: "NLI",
    methodVersion: "s4-fixture-verifier/1",
    properties: { attributionFaithfulness: "SATISFIED" },
    unsupportedFacets: [],
    evidence: [{ locatorUid: locClaim.uid, selectorDigest: locClaim.selectorDigest, role: "SUPPORTS", origin: "VERIFIER_FOUND", authority: "PRIMARY", independence: "SELF_REPORTED", facet: "IDENTITY" }],
    run: { system: "ks-verification", runId: `ver-${stamp}` },
    policy: { toolRenditionException: false },
    sealedAt: "2026-10-07T00:00:00.000Z",
    ...over,
  });
  const put = (b: SealedVerificationBody) => verifications.put(sealVerification(b, { kid: verifierKey.kid, key: verifierKey.privateKey }));
  const leadsUid = events.proposals.find((p) => p.proposalId === "p-leads")!.mints.assertion!;
  out.mints["p-leads.assertion"] = leadsUid;
  const accept = await put(base(`${stamp}-cf-accept`, {}));
  const heldAccount = await put(base(`${stamp}-cf-held`, { assertionUid: m("p-account-occ"), policyOutcome: "REVIEW", evidence: [] }));
  const support = await put(base(`${stamp}-support`, { assertionUid: leadsUid, adjudicationKind: "SUPPORT", evidence: [] }));
  await run("adjudication", adjudicationIntent(R, stamp, "v", [accept, heldAccount, support]), PRINCIPALS.verifier, "admitted");
  out.runIds.adjudication = `ver-${stamp}-v`;
  await run("report", reportIntent(R, stamp, { claimUid: out.uids.claim!, occurrenceUid: m("p-claim-occ"), locatorUid: locClaim.uid, locatorDigest: locClaim.selectorDigest, vettingUid: m("p-vetting", "assessment") }), PRINCIPALS.publisher);
  out.runIds.mission = `run-${stamp}-mission`;
  await run("projection", projectionIntent(R, stamp, { substanceUid: out.uids.nr!, mechanismUid: out.uids.mech!, assertionUid: m("p-claim-occ") }), PRINCIPALS.projector);
  await run("s4", readFixtureIntent(R, stamp, { nrUid: out.uids.nr!, sp1Uid: out.uids.sp1!, claimUid: out.uids.claim! }));
  out.runIds.s4 = `run-${stamp}-s4`;

  if (opts.includeFu03 !== false) {
    const root = resolve(repoRoot, "schema", "program", "final", "fixtures");
    const files: string[] = [];
    (function walk(dir: string) {
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/^intent.*\.json$/.test(f)) files.push(p);
      }
    })(root);
    for (const f of files.sort()) {
      const bytes = readFileSync(f);
      const mig = migrateIntentV1(JSON.parse(bytes.toString("utf8")) as Record<string, unknown>, schema, { path: relative(repoRoot, f).replace(/\\/g, "/"), rawBytesDigest: rawBytesDigest(bytes) });
      const intent = IngestionIntentV2.parse(mig.intent);
      out.fu03.intents++;
      try {
        const plan = await run(`fx-${intent.intentId}`, intent, PRINCIPALS.writer, "admitted");
        if (plan.proposals.some((p) => p.disposition === "admitted")) out.fu03.applied++;
        else out.fu03.rejected++;
      } catch (e) {
        out.fu03.rejected++;
        out.fu03.errors.push(`${intent.intentId}: ${(e as Error).message.slice(0, 200)}`);
      }
    }
  }
  return out;
}

/**
 * Operational records only the migrator writes (S0 section 5 item 2): a legacy node relabeled `LegacyV0_<Label>` and
 * tagged `:LegacyV0`, linked from a v2 node by `MIGRATED_FROM`, a legacy relationship between legacy nodes, and a
 * KsIntentMarker. Used only to prove reads never surface them. Admin session, local disposable database only.
 */
export async function seedOperationalRecords(client: GraphClient, v2Uid: string, stamp: string): Promise<{ legacyUid: string; legacyEdgeNote: string | null }> {
  assertLocalUri(client.config.uri);
  const legacyUid = `hu:product:legacy-shadow-${stamp}`;
  const params = { uid: v2Uid, digest: rawBytesDigest(`legacy-${stamp}`), lid: `legacy-${stamp}`, lid2: `legacy2-${stamp}`, luid: legacyUid, run: `migration-${stamp}`, mk: `mk-${stamp}-probe` };
  const stmt = (edgeProps: string) => `MATCH (v {uid: $uid})
CREATE (l:LegacyV0:LegacyV0_Product {legacyLabels: ['Product'], legacyExportDigest: $digest, id: $lid, name: 'Legacy Synthetic Product', privacyClass: 'PUBLIC', uid: $luid})
CREATE (l2:LegacyV0:LegacyV0_Biomarker {legacyLabels: ['Biomarker'], legacyExportDigest: $digest, id: $lid2, name: 'Legacy Synthetic Biomarker', privacyClass: 'PUBLIC'})
CREATE (v)-[:MIGRATED_FROM {migrationRunId: $run}]->(l)
CREATE (l)-[:MEASURES ${edgeProps}]->(l2)
CREATE (:KsIntentMarker {markerKey: $mk, effectKey: 'ek-operational-probe', status: 'applied', tenantId: 'tenant-a', installationId: 'local-test', applicationId: 'bks-gate-b', intentId: 'probe', intentDigest: $digest, planRef: 'pl-probe', planDigest: $digest, attempts: '[]', receipt: '{}', receiptId: 'probe'})`;
  try {
    await client.write((tx) => tx.run(stmt("{confidence: 0.9}"), params));
    return { legacyUid, legacyEdgeNote: null };
  } catch (e) {
    // The Enterprise release DDL requires assertionUid on EVERY relationship of an asserted type (e.g.
    // rel_MEASURES_assertion_exists), which a retained legacy edge of the same type (legacy MEASURES between LegacyV0 nodes)
    // cannot satisfy. Reported to the migration and schema roles; the probe keeps placeholders so visibility checks run.
    const note = String((e as Error).message).split("\n")[0]!;
    if (!/must have the property/i.test(note)) throw e;
    await client.write((tx) => tx.run(stmt("{confidence: 0.9, assertionUid: 'legacy:unauthorized', relationshipUid: 'legacy:unauthorized', recordedFrom: datetime()}"), params));
    return { legacyUid, legacyEdgeNote: note };
  }
}
