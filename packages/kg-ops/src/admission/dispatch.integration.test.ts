/**
 * SV-11 T1: the Knowledge Services dispatch outbox consumer on a disposable Neo4j (scripts/neo4j-test.sh) and a
 * disposable Biotech PostgreSQL database holding the common component knowledge_verification (installed with the KS
 * installer CLI `knowledge-db install --application biotech`). Skipped unless BKS_INTEGRATION=1 and SV11_PG_ADMIN_DSN.
 *
 *   bash scripts/neo4j-test.sh up
 *   BKS_INTEGRATION=1 NEO4J_TEST_URI=neo4j://localhost:7690 NEO4J_TEST_PASSWORD=bks-test-password \
 *   SV11_PG_ADMIN_DSN=postgresql://<admin>@127.0.0.1:55433/<throwaway db> \
 *     pnpm exec vitest run --project kg-ops src/admission/dispatch.integration.test.ts
 *
 * Cases: both report kinds dispatched and applied; duplicate delivery; reordered delivery; revoked in transit (row
 * revoked, and decision invalidated after claim); lost acknowledgment; graph unavailable -> fail_dispatch + retry;
 * native rollback (failure after the effect write, before the marker); official read eligible / revoked / authority
 * unavailable. The fixture seeds a sealed run, admitted use decisions and outbox rows with plain SQL; the consumer runs
 * as a login role holding knowledge_verification_outbox_worker only.
 */
import { createHash, generateKeyPairSync, randomUUID, sign } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMISSION_PAYLOAD_MEDIA_TYPE, boundEffectDigestOf, canonicalDigest, canonicalize, rawBytesDigest, READ_INTENT_V3, type AdmissionDispatchV1Input } from "@bks/contracts";
import { FileSnapshotCustody, FileVerificationCustody, MemoryPlanStore } from "../custody.js";
import { ensureOperationalState, installReleaseMarker } from "../fence.js";
import { GraphClient, toJson } from "../neo4j.js";
import { ReadModel } from "../read/visibility.js";
import { ReadService } from "../read/service.js";
import { KnowledgeWriter, writeSchema } from "../write/service.js";
import { DispatchConsumer } from "./dispatch.js";
import { PgVerificationAuthority } from "./verification.js";

const enabled = process.env.BKS_INTEGRATION === "1" && Boolean(process.env.SV11_PG_ADMIN_DSN);
const d = enabled ? describe : describe.skip;
const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..", "..", "..", "..");
const URI = process.env.NEO4J_TEST_URI ?? "neo4j://localhost:7690";
const PASSWORD = process.env.NEO4J_TEST_PASSWORD ?? "bks-test-password";
const ADMIN = process.env.SV11_PG_ADMIN_DSN ?? "";
const stamp = `sv11${Date.now().toString(36)}`;
const evidenceDir = resolve(repo, ".scratch", "sprint-v", "proofs", "SV-11", "run-1");
const evidence: Array<{ test: string; result: string; detail?: unknown }> = [];
const record = (test: string, result: string, detail?: unknown) => evidence.push({ test, result, ...(detail === undefined ? {} : { detail }) });

// Fresh tenant and run per execution: the throwaway database keeps earlier runs (append-only records).
const TENANT = randomUUID();
const INSTALLATION = "3c1f0e9a-7b2d-4e6f-8a1c-5d9e0f2b4a6c";
const RUN = randomUUID();
const dig = (s: string) => `sha256:${createHash("sha256").update(s).digest("hex")}`;
const ORIGIN = { kind: "standalone", installationId: INSTALLATION, applicationId: "biotech", tenantId: TENANT, issuer: "sv11-fixture", subject: "ks-biotech-graph", mission: null, recoveryAuthorityRef: null };
const ORIGIN_DIGEST = canonicalDigest(ORIGIN);

function assertLocal(uri: string): void {
  const host = new URL(uri.replace(/^(bolt|neo4j)(\+s|\+ssc)?:/, "http:").replace(/^postgres(ql)?:/, "http:")).hostname;
  if (!["127.0.0.1", "localhost", "::1"].includes(host)) throw new Error(`refusing to run SV-11 integration against non-local ${uri.replace(/\/\/[^@]*@/, "//<credentials>@")}`);
}

/** biotech-knowledge-intent.v2 of an evidence report (Claim + occurrence assertion + EVIDENCE_REPORT). */
function evidenceIntent(release: string, n: string): Record<string, unknown> {
  return {
    schemaVersion: "biotech-knowledge-intent.v2",
    intentId: `sv11-ev-${n}`,
    pins: { schemaReleaseDigest: release, policyVersion: "bks-admission-policy/v1" },
    context: { actor: { kind: "agent", id: "ks-biotech-graph", model: "synthetic" }, run: { system: "ks-verification", runId: `${RUN}/${n}`, operationId: `op-${n}` }, activityKind: "EVIDENCE_MISSION" },
    basis: { creationOnly: { reason: "SV-11 synthetic dispatch fixture: first capture of these synthetic entities" } },
    sources: [{
      ref: "post",
      source: { canonicalUri: `https://fixtures.bks.test/sv11/${n}/post`, sourceKind: "WEB_PAGE" },
      snapshot: { retrievedAt: "2026-10-25T08:00:00Z", observedAt: "2026-10-25T08:00:00Z", contentHash: dig(`post-${n}`), contentHashBasis: "SYNTHETIC_FIXTURE", captureMethod: "bks-fixture/1", captureCompleteness: "COMPLETE" },
      locators: [{ ref: "l-claim", selectorKind: "TEXT_QUOTE", selector: { basis: "raw-capture/v1", type: "TextQuoteSelector", exact: "Synthetic NR activates synthetic protein SP1", refinedBy: { type: "TextPositionSelector", start: 100, end: 144 } }, exact: "Synthetic NR activates synthetic protein SP1", startOffset: 100, endOffset: 144 }],
    }],
    subjects: [
      { ref: "org", mode: "new", nodeType: "Organization", name: `Synthetic Claimant ${n}`, uidSegment: `sv11-org-${n}`, properties: { entityKind: "LEGAL_ENTITY" }, onMatch: "use_existing" },
      { ref: "nr", mode: "new", nodeType: "ChemicalSubstance", name: `Synthetic NR ${n}`, uidSegment: `sv11-nr-${n}`, properties: {}, onMatch: "use_existing" },
      { ref: "sp1", mode: "new", nodeType: "MolecularEntity", name: `Synthetic protein SP1 ${n}`, uidSegment: `sv11-sp1-${n}`, properties: {}, onMatch: "use_existing" },
      { ref: "claim", mode: "new", nodeType: "Claim", name: `Synthetic NR activates SP1 (${n})`, properties: { proposition: `Synthetic NR ${n} directly activates synthetic protein SP1`, claimType: "RELATIONSHIP" }, onMatch: "use_existing" },
    ],
    proposals: [
      { proposalId: "lineage", kind: "lineage.start", about: ["claim"] },
      { proposalId: "occurrence", kind: "assertion.relate", subjectRef: "nr", objectRef: "sp1", asserterRef: "org", evidence: ["l-claim"], assertion: { predicate: "ACTIVATES", assertionKind: "CLAIM", claimType: "RELATIONSHIP", occurrenceOf: { claimRef: "claim" }, speechAct: "STATES", basisKind: "MANUFACTURER_CLAIM", validity: { validObservedAt: "2026-10-25T00:00:00Z" } } },
      { proposalId: "report", kind: "report.publish", reportKind: "EVIDENCE_REPORT", name: `Synthetic evidence report ${n}`, policyVersion: "bks-admission-policy/v1", bodyDigest: dig(`body-ev-${n}`), ledgerDigest: dig(`ledger-ev-${n}`), verdict: "NOT_SUPPORTED", about: ["claim"], citesAssertions: [{ proposal: "occurrence" }], evidence: ["l-claim"], reportRevisionRef: `rr-ev-${n}`, reportSchema: "research-report.v2", reportKindRef: "evidence_report@1.0.0", structuredBodyDigest: dig(`structured-ev-${n}`), custodyKind: "knowledge_verification.artifact_custody" },
    ],
  };
}

/** biotech-knowledge-intent.v2 of a study appraisal (Study + QUALITY/D3.evidence-strength Assessment + STUDY_APPRAISAL). */
function studyIntent(release: string, n: string): Record<string, unknown> {
  return {
    schemaVersion: "biotech-knowledge-intent.v2",
    intentId: `sv11-sa-${n}`,
    pins: { schemaReleaseDigest: release, policyVersion: "bks-admission-policy/v1" },
    context: { actor: { kind: "agent", id: "ks-biotech-graph", model: "synthetic" }, run: { system: "ks-verification", runId: `${RUN}/${n}`, operationId: `op-${n}` }, activityKind: "EVIDENCE_MISSION" },
    basis: { creationOnly: { reason: "SV-11 synthetic dispatch fixture: first capture of this synthetic study" } },
    sources: [{
      ref: "pub",
      source: { canonicalUri: `https://fixtures.bks.test/sv11/${n}/trial`, sourceKind: "WEB_PAGE" },
      snapshot: { retrievedAt: "2026-10-25T08:00:00Z", contentHash: dig(`trial-${n}`), contentHashBasis: "SYNTHETIC_FIXTURE", captureMethod: "bks-fixture/1", captureCompleteness: "COMPLETE" },
      locators: [{ ref: "l-study", selectorKind: "TEXT_QUOTE", selector: { basis: "raw-capture/v1", type: "TextQuoteSelector", exact: "a randomized trial of synthetic NR in 40 adults", refinedBy: { type: "TextPositionSelector", start: 10, end: 57 } }, exact: "a randomized trial of synthetic NR in 40 adults", startOffset: 10, endOffset: 57 }],
    }],
    subjects: [{ ref: "study", mode: "new", nodeType: "Study", name: `Synthetic NR randomized trial ${n}`, uidSegment: `sv11-study-${n}`, properties: { studyKind: "INTERVENTIONAL_RANDOMIZED" }, onMatch: "use_existing" }],
    proposals: [
      // No lineage.start: an EVIDENCE_MISSION Activity ASSESSES exactly one Claim (OD-06); a study appraisal has none.
      { proposalId: "appraisal", kind: "assessment.record", assessmentKind: "QUALITY", assessmentSubkind: "D3.evidence-strength", about: ["study"], methodVersion: "d3-evidence-strength/v1", summary: "Synthetic appraisal: small sample, unclear allocation concealment", facets: ["downgrade=imprecision"], evidence: ["l-study"] },
      { proposalId: "report", kind: "report.publish", reportKind: "STUDY_APPRAISAL", name: `Synthetic study appraisal ${n}`, policyVersion: "bks-admission-policy/v1", bodyDigest: dig(`body-sa-${n}`), ledgerDigest: dig(`ledger-sa-${n}`), about: ["study"], citesAssessments: [{ proposal: "appraisal" }], evidence: ["l-study"], reportRevisionRef: `rr-sa-${n}`, reportSchema: "research-report.v2", reportKindRef: "study_appraisal@1.0.0", structuredBodyDigest: dig(`structured-sa-${n}`), custodyKind: "knowledge_verification.artifact_custody" },
    ],
  };
}

d("SV-11 dispatch consumer on disposable Neo4j + Biotech component PostgreSQL", () => {
  const client = enabled ? new GraphClient({ uri: URI, username: "neo4j", password: PASSWORD, database: "neo4j" }) : (null as unknown as GraphClient);
  const schema = writeSchema();
  const R = schema.schemaReleaseDigest;
  const tmp = mkdtempSync(join(tmpdir(), "bks-sv11-int-"));
  const outboxRole = `sv11_outbox_${stamp}`;
  const writerRole = `sv11_writer_${stamp}`;
  const rolePassword = `sv11-disposable-${stamp}`;
  let admin: pg.Client;
  let outboxDsn = "";
  let authority: PgVerificationAuthority;
  let writer: KnowledgeWriter;
  let now = new Date("2026-10-25T10:00:00.000Z");
  const clock = () => now;
  const decisions = new Map<string, { id: string; digest: string }>();
  const effects = new Map<string, { semantic: string; bound: string; intent: Record<string, unknown> }>();

  const asTenant = async <T>(c: pg.Client, fn: () => Promise<T>): Promise<T> => {
    await c.query("begin");
    try {
      await c.query("select set_config('app.tenant_id', $1, true)", [TENANT]);
      const out = await fn();
      await c.query("commit");
      return out;
    } catch (e) {
      await c.query("rollback");
      throw e;
    }
  };

  /** Binds the effect and an admitted use decision (once per effect key) and enqueues one dispatch. */
  /**
   * `review`: a review-conditioned decision approved by an adjudication under that reviewer grant (component 2.2.0).
   * `targetBinding` / `mediaType`: a dispatch for another target, or a payload the consumer must refuse.
   */
  async function enqueue(n: string, kind: "evidence" | "study", opts: { effectKey?: string; dispatchId?: string; availableAt?: string; review?: { reviewerId: string; grantId: string }; targetBinding?: string; mediaType?: string } = {}): Promise<{ dispatchId: string; effectKey: string; payloadDigest: string }> {
    const effectKey = opts.effectKey ?? `ks:sv11/${stamp}/${n}`;
    const dispatchId = opts.dispatchId ?? `dsp-${stamp}-${n}`;
    let e = effects.get(effectKey);
    if (!e) {
      const intent = kind === "evidence" ? evidenceIntent(R, `${stamp}${n}`) : studyIntent(R, `${stamp}${n}`);
      const semantic = rawBytesDigest(Buffer.from(canonicalize(intent), "utf8"));
      e = { semantic, bound: boundEffectDigestOf(semantic, ORIGIN), intent };
      effects.set(effectKey, e);
      const decisionId = `ud-${stamp}-${n}`;
      const decisionDigest = dig(`decision-${decisionId}`);
      decisions.set(effectKey, { id: decisionId, digest: decisionDigest });
      await asTenant(admin, async () => {
        await admin.query("select knowledge_verification.bind_effect($1::uuid, $2, $3, $4, $5)", [TENANT, effectKey, semantic, ORIGIN_DIGEST, e!.bound]);
        const subject = kind === "evidence" ? "rr-ev" : "rr-sa";
        let adjudicationId: string | null = null;
        if (opts.review) {
          // The reviewer signs this exact report subject and effect digest under a live grant (trigger-checked).
          adjudicationId = `adj-${stamp}-${n}`;
          await admin.query(
            `insert into knowledge_verification.adjudication (tenant_id, adjudication_id, subject_kind, subject_id, subject_digest, bound_effect_digest, reviewer_id, decision, rationale, digest, grant_id)
             values ($1::uuid, $2, 'report', $3, $4, $5, $6, 'approve', 'SV-11 synthetic reviewer approval', $7, $8::uuid)`,
            [TENANT, adjudicationId, subject, dig(subject), e!.bound, opts.review.reviewerId, dig(`adjudication-${adjudicationId}`), opts.review.grantId],
          );
        }
        await admin.query(
          // Component 2.2.0: a report-subject decision binds no qualifiers digest and carries normalized values + digest.
          `insert into knowledge_verification.use_decision (tenant_id, use_decision_id, schema_version, subject_kind, subject_id, subject_digest, run_id, bound_effect_digest, use_name, audience, disposition, conditions, policy_ref, rubric_ref, qualifiers_digest, revocation_epoch, reviewer_adjudication_id, normalized_values, normalized_values_digest, record, digest)
           values ($1::uuid, $2, 'research-core.use_decision.v2', 'report', $3, $4, $5::uuid, $6, 'official.publication', 'biotech-public', 'admitted', $9::jsonb, 'policy/sv11@1', 'rubric/sv11@1', null, 0, $10, '{}'::jsonb, $7, '{}'::jsonb, $8)`,
          [TENANT, decisionId, subject, dig(subject), RUN, e!.bound, canonicalDigest({}), decisionDigest, JSON.stringify(adjudicationId ? ["review_required"] : []), adjudicationId],
        );
      });
    }
    const decision = decisions.get(effectKey)!;
    const payload: AdmissionDispatchV1Input = {
      schemaVersion: "biotech-knowledge-admission.v1",
      tenantId: TENANT,
      installationId: INSTALLATION,
      applicationId: "biotech",
      targetBinding: "biotech-graph",
      dispatchId,
      effectKey,
      boundEffectDigest: e.bound,
      semanticPayloadDigest: e.semantic,
      originatingOriginDigest: ORIGIN_DIGEST,
      useDecision: decision,
      report: { reportRevisionId: kind === "evidence" ? "rr-ev" : "rr-sa", reportId: `report-${kind}`, revision: 1, reportKind: kind === "evidence" ? "evidence_report" : "study_appraisal", reportKindRef: `${kind === "evidence" ? "evidence_report" : "study_appraisal"}@1.0.0`, reportSchema: "research-report.v2", digest: dig(kind === "evidence" ? "rr-ev" : "rr-sa") },
      run: { runId: RUN, manifestDigest: dig("manifest-sv11"), sealKind: "verification_snapshot" },
      revocationEpochAtDecision: 0,
      decidedAt: "2026-10-25T09:00:00.000Z",
      intent: e.intent as never,
      custody: [],
      expectedMarkerSchemaVersion: "bks-intent-marker.v2",
    };
    const bytes = Buffer.from(canonicalize(payload), "utf8");
    const payloadDigest = rawBytesDigest(bytes);
    await asTenant(admin, async () => {
      await admin.query("insert into knowledge_verification.artifact_custody (tenant_id, artifact_id, digest, byte_length, media_type, custody_kind, inline_bytes) values ($1::uuid, $2, $3, $4, $5, 'inline', $6)", [TENANT, `payload-${dispatchId}`, payloadDigest, bytes.length, opts.mediaType ?? ADMISSION_PAYLOAD_MEDIA_TYPE, bytes]);
      // The only enqueue path of component 2.2.0 (admits the decision now, records the epoch and the expected
      // ks-intent-marker.v1 digest); the test then schedules the row on the fixture clock (available_at only).
      const epoch = await admin.query("select knowledge_verification.current_revocation_epoch($1::uuid)::bigint as e", [TENANT]);
      await admin.query("select dispatch_id from knowledge_verification.enqueue_dispatch($1::uuid, $2, $3, $8, $4, $5, $6, $7, null, 'ks-intent-marker.v1')", [TENANT, dispatchId, effectKey, payloadDigest, decisions.get(effectKey)!.id, e.bound, Number(epoch.rows[0].e), opts.targetBinding ?? "biotech-graph"]);
      await admin.query("update knowledge_verification.dispatch_outbox set available_at = $3::timestamptz where tenant_id = $1::uuid and dispatch_id = $2", [TENANT, dispatchId, opts.availableAt ?? "2026-10-25T09:00:00.000Z"]);
    });
    return { dispatchId, effectKey, payloadDigest };
  }

  const outboxRow = async (dispatchId: string) => asTenant(admin, async () => (await admin.query("select state, attempts, ack_digest, last_error, marker_scheme, expected_marker_digest, ack_record from knowledge_verification.dispatch_outbox where tenant_id = $1::uuid and dispatch_id = $2", [TENANT, dispatchId])).rows[0]);
  const marker = async (effectKey: string) => {
    const res = await client.read((tx) => tx.run("MATCH (m:KsIntentMarker {effectKey: $k}) RETURN m {.status, .dispatchId, .markerDigest, .useDecisionRef, .useDecisionDigest, .revocationEpoch, .markerSchemaVersion, .payloadDigest} AS m", { k: effectKey }));
    return res.records.map((r) => toJson(r.get("m")) as Record<string, unknown>);
  };
  const revision = async () => Number(toJson((await client.read((tx) => tx.run("MATCH (f:KsWriteFence {id: 'canonical'}) RETURN f.graphRevision AS r"))).records[0]!.get("r")));
  const consumer = (extra: Partial<ConstructorParameters<typeof DispatchConsumer>[0]> = {}) => new DispatchConsumer({ authority, writer, now: clock, ...extra });

  beforeAll(async () => {
    assertLocal(URI);
    assertLocal(ADMIN);
    await client.verify();
    await client.write((tx) => tx.run("MATCH (n) DETACH DELETE n"));
    await ensureOperationalState(client, schema);
    await installReleaseMarker(client, { releaseId: schema.releaseId, schemaReleaseDigest: R }, `sv11-${stamp}`);
    writer = new KnowledgeWriter(client, { schema, plans: new MemoryPlanStore(), snapshots: new FileSnapshotCustody(join(tmp, "snapshots")), verifications: new FileVerificationCustody(join(tmp, "verifications"), new Map()), witnessKeys: new Map(), signer: null, authority: null, localDev: false, now: clock });
    admin = new pg.Client({ connectionString: ADMIN });
    await admin.connect();
    // Login roles holding exactly one component capability role each (cluster-wide; dropped in afterAll).
    await admin.query(`create role ${outboxRole} login password '${rolePassword}' in role knowledge_verification_outbox_worker`);
    await admin.query(`create role ${writerRole} login password '${rolePassword}' in role knowledge_verification_writer`);
    const u = new URL(ADMIN);
    u.username = outboxRole;
    u.password = rolePassword;
    outboxDsn = u.toString();
    authority = new PgVerificationAuthority({ connectionString: outboxDsn, timeoutMs: 5_000 });
    // Sealed verification run with two report revisions (plain SQL through the component's tables and seal_run).
    await asTenant(admin, async () => {
      await admin.query("insert into knowledge_verification.origin (tenant_id, origin_digest, kind, installation_id, application_id, issuer, subject, identity) values ($1::uuid, $2, 'standalone', $3, 'biotech', 'sv11-fixture', 'ks-biotech-graph', $4::jsonb)", [TENANT, ORIGIN_DIGEST, INSTALLATION, JSON.stringify(ORIGIN)]);
      await admin.query("insert into knowledge_verification.verification_task (tenant_id, task_id, schema_version, task_digest, original_task_ref, use_name, audience, minimum_risk, rubric_ref, policy_ref, body) values ($1::uuid, 'task-sv11', 'research-core.task.v2', $2, '{}'::jsonb, 'official.publication', 'biotech-public', 'medium', 'rubric/sv11@1', 'policy/sv11@1', '{}'::jsonb)", [TENANT, dig("task-sv11")]);
      await admin.query("insert into knowledge_verification.verification_run (tenant_id, run_id, task_id, binding, state, originating_origin_digest) values ($1::uuid, $2::uuid, 'task-sv11', 'biotech-graph', 'observing', $3)", [TENANT, RUN, ORIGIN_DIGEST]);
      for (const k of ["ev", "sa"]) {
        for (const part of ["structured", "body", "ledger"]) {
          const bytes = Buffer.from(`${part}-${k}`);
          await admin.query("insert into knowledge_verification.artifact_custody (tenant_id, artifact_id, digest, byte_length, media_type, custody_kind, inline_bytes) values ($1::uuid, $2, $3, $4, 'text/markdown', 'inline', $5)", [TENANT, `${part}-${k}`, rawBytesDigest(bytes), bytes.length, bytes]);
        }
        await admin.query(
          `insert into knowledge_verification.report_revision (tenant_id, report_revision_id, report_id, revision, schema_version, report_kind, task_id, run_id, structured_body_artifact_id, body_artifact_id, ledger_artifact_id, body_digest, renderer_version, assertion_refs, time_coverage, record, digest)
           values ($1::uuid, $2, $3, 1, 'research-report.v2', $4, 'task-sv11', $5::uuid, $6, $7, $8, $9, 'renderer/1', '[]'::jsonb, '{}'::jsonb, $11::jsonb, $10)`,
          [TENANT, `rr-${k}`, `report-${k}`, k === "ev" ? "evidence_report" : "study_appraisal", RUN, `structured-${k}`, `body-${k}`, `ledger-${k}`, rawBytesDigest(Buffer.from(`body-${k}`)), dig(`rr-${k}`), JSON.stringify({ kind: { id: `${k === "ev" ? "evidence_report" : "study_appraisal"}@1.0.0`, version: "research-report-kind.v1", digest: dig(`kind-${k}`) } })],
        );
      }
      // Component 2.2.0 seal: a pinned Ed25519 key (owner-written registry) and a detached signature over the canonical
      // bytes of {manifestDigest, signer, signedAt, keyId}; the manifest names its run and kind; all four families.
      const { publicKey, privateKey } = generateKeyPairSync("ed25519");
      const keyId = `sv11-fixture-${stamp}`;
      await admin.query("insert into knowledge_verification.seal_signing_key (key_id, algorithm, public_key, issuer) values ($1, 'Ed25519', $2, 'bks-fixture')", [keyId, Buffer.from(publicKey.export({ format: "jwk" }).x as string, "base64url")]);
      const manifestDigest = dig("manifest-sv11");
      const signerContext = { manifestDigest, signer: "sv11-fixture", signedAt: "2026-10-25T08:59:00Z", keyId };
      const signature = sign(null, Buffer.from(canonicalize(signerContext), "utf8"), privateKey);
      await admin.query(
        "select knowledge_verification.seal_run($1::uuid, $2::uuid, null, 'verification_snapshot', $3::jsonb, $4, $5::jsonb, 'sv11-fixture', 'Ed25519', $6, $7, $8::jsonb)",
        [TENANT, RUN, JSON.stringify({ snapshot: "verification_snapshot", run: { id: RUN }, families: 4 }), manifestDigest, JSON.stringify({ capture: dig("capture"), claims: dig("claims"), report: dig("report"), observations: dig("observations") }), keyId, signature, JSON.stringify(signerContext)],
      );
    });
    mkdirSync(evidenceDir, { recursive: true });
  });

  afterAll(async () => {
    writeFileSync(resolve(evidenceDir, `dispatch-integration-${stamp}.json`), `${JSON.stringify({ stamp, neo4j: URI, release: { releaseId: schema.releaseId, schemaReleaseDigest: R }, finishedAt: new Date().toISOString(), evidence }, null, 2)}\n`);
    await authority?.close();
    if (admin) {
      for (const r of [outboxRole, writerRole]) await admin.query(`drop owned by ${r}`).then(() => admin.query(`drop role ${r}`)).catch(() => undefined);
      await admin.end();
    }
    await client?.close();
    rmSync(tmp, { recursive: true, force: true });
  });

  it("both report kinds (evidence_report, study_appraisal) are dispatched, applied with their marker in one transaction and acknowledged", async () => {
    const ev = await enqueue("ev1", "evidence");
    const sa = await enqueue("sa1", "study", { availableAt: "2026-10-25T09:00:01.000Z" });
    const report = await consumer().consumeOnce(TENANT, 10, now);
    record("both-report-kinds", "observed", report.results.map((r) => ({ dispatchId: r.dispatchId, outcome: r.outcome, acknowledged: r.acknowledged, reason: r.reason })));
    expect(report.results.map((r) => [r.dispatchId, r.outcome, r.acknowledged])).toEqual([[ev.dispatchId, "applied", true], [sa.dispatchId, "applied", true]]);
    for (const [x, r] of [[ev, report.results[0]!], [sa, report.results[1]!]] as const) {
      const [m] = await marker(x.effectKey);
      expect(m).toMatchObject({ status: "applied", dispatchId: x.dispatchId, markerDigest: r.markerDigest, useDecisionRef: decisions.get(x.effectKey)!.id, useDecisionDigest: decisions.get(x.effectKey)!.digest, markerSchemaVersion: "bks-intent-marker.v2", payloadDigest: x.payloadDigest });
      // 2.2.0: the row is acknowledged with the component's expected digest; the native marker digest is on the marker
      // (asserted above) and in the stored acknowledgment record.
      const acked = await outboxRow(x.dispatchId);
      expect(acked).toMatchObject({ state: "acknowledged", marker_scheme: "ks-intent-marker.v1", ack_record: { markerDigest: r.markerDigest, payloadDigest: x.payloadDigest } });
      expect(acked.ack_digest).toBe(acked.expected_marker_digest);
    }
    const reports = await client.read((tx) => tx.run("MATCH (r:Report)-[:WAS_GENERATED_BY]->(a:Activity) WHERE r.reportRevisionRef STARTS WITH 'rr-' RETURN r.reportKind AS kind, r.reportKindRef AS ref, r.structuredBodyDigest AS sbd, a.useDecisionRef AS ud, a.useDecisionDigest AS udd, a.effectKey AS ek, a.runSealKind AS seal ORDER BY kind"));
    const rows = reports.records.map((r) => toJson(r.toObject()) as Record<string, unknown>);
    record("report-projection", "observed", rows);
    expect(rows.map((r) => [r.kind, r.ref, r.ek, r.seal])).toEqual([["EVIDENCE_REPORT", "evidence_report@1.0.0", ev.effectKey, "VERIFICATION_SNAPSHOT"], ["STUDY_APPRAISAL", "study_appraisal@1.0.0", sa.effectKey, "VERIFICATION_SNAPSHOT"]]);
  });

  it("duplicate delivery of an applied effect acknowledges again with the stored marker digest; nothing is re-applied", async () => {
    const effectKey = `ks:sv11/${stamp}/ev1`;
    const before = await revision();
    const dup = await enqueue("ev1", "evidence", { effectKey, dispatchId: `dsp-${stamp}-ev1-redelivery`, availableAt: "2026-10-25T09:10:00.000Z" });
    const report = await consumer().consumeOnce(TENANT, 10, now);
    const [m] = await marker(effectKey);
    record("duplicate-delivery", "observed", { result: report.results[0], revisionBefore: before, revisionAfter: await revision() });
    expect(report.results[0]).toMatchObject({ dispatchId: dup.dispatchId, outcome: "duplicate", acknowledged: true, markerDigest: m!.markerDigest });
    expect(await revision()).toBe(before);
    expect(await marker(effectKey)).toHaveLength(1);
    expect(m!.dispatchId).toBe(`dsp-${stamp}-ev1`);
  });

  it("reordered delivery: two dispatches of one effect key out of order apply once and both acknowledge with one digest", async () => {
    const effectKey = `ks:sv11/${stamp}/reorder`;
    const late = await enqueue("reorder", "evidence", { effectKey, dispatchId: `dsp-${stamp}-reorder-2`, availableAt: "2026-10-25T09:20:00.000Z" });
    const early = await enqueue("reorder", "evidence", { effectKey, dispatchId: `dsp-${stamp}-reorder-1`, availableAt: "2026-10-25T09:30:00.000Z" });
    const report = await consumer().consumeOnce(TENANT, 10, now);
    record("reordered-delivery", "observed", report.results);
    expect(report.results.map((r) => [r.dispatchId, r.outcome])).toEqual([[late.dispatchId, "applied"], [early.dispatchId, "duplicate"]]);
    expect(report.results[1]!.markerDigest).toBe(report.results[0]!.markerDigest);
    expect(await marker(effectKey)).toHaveLength(1);
  });

  it("revoked in transit: revoke_pending_dispatches after claim, before apply -> revoked, no graph write", async () => {
    const x = await enqueue("rv", "evidence");
    const writerDsn = new URL(ADMIN);
    writerDsn.username = writerRole;
    writerDsn.password = rolePassword;
    const report = await consumer({
      hooks: {
        afterClaim: async () => {
          const w = new pg.Client({ connectionString: writerDsn.toString() });
          await w.connect();
          await w.query("begin");
          await w.query("select set_config('app.tenant_id', $1, true)", [TENANT]);
          await w.query("select knowledge_verification.revoke_pending_dispatches($1::uuid, $2)", [TENANT, x.effectKey]);
          await w.query("commit");
          await w.end();
        },
      },
    }).consumeOnce(TENANT, 10, now);
    record("revoked-in-transit", "observed", report.results);
    expect(report.results[0]).toMatchObject({ outcome: "revoked", acknowledged: false, componentState: "revoked" });
    expect(await marker(x.effectKey)).toHaveLength(0);
    expect((await outboxRow(x.dispatchId)).state).toBe("revoked");
  });

  it("decision invalidated in transit (record_invalidation + affected decision after claim) -> revoked, no graph write", async () => {
    const x = await enqueue("inv", "study");
    const report = await consumer({
      hooks: {
        afterClaim: async () => {
          await asTenant(admin, async () => {
            const inv = await admin.query("select invalidation_id from knowledge_verification.record_invalidation($1::uuid, 'report', 'rr-sa', 'sv11 correction')", [TENANT]);
            await admin.query("insert into knowledge_verification.invalidation_affected (tenant_id, invalidation_id, affected_kind, affected_id) values ($1::uuid, $2::uuid, 'use_decision', $3)", [TENANT, inv.rows[0].invalidation_id, decisions.get(x.effectKey)!.id]);
            await admin.query("update knowledge_verification.invalidation set closure_processed_at = now() where tenant_id = $1::uuid and invalidation_id = $2::uuid", [TENANT, inv.rows[0].invalidation_id]);
          });
        },
      },
    }).consumeOnce(TENANT, 10, now);
    record("invalidated-in-transit", "observed", report.results);
    // 2.2.0: listing the affected decision revokes its pending/dispatched rows (trigger), so the consumer's row recheck
    // sees `revoked` before the decision recheck.
    expect(report.results[0]).toMatchObject({ outcome: "revoked", reason: { code: "DISPATCH_REVOKED" }, componentState: "revoked" });
    expect((await outboxRow(x.dispatchId)).state).toBe("revoked");
    expect(await marker(x.effectKey)).toHaveLength(0);
  });

  it("lost acknowledgment: committed effect, acknowledgment fails; the next claim finds the marker and acknowledges", async () => {
    const x = await enqueue("lost", "evidence");
    let failed = false;
    const flaky = Object.create(authority) as PgVerificationAuthority;
    flaky.acknowledge = async (...args: Parameters<PgVerificationAuthority["acknowledge"]>) => {
      if (!failed) {
        failed = true;
        throw new Error("simulated: acknowledgment response lost");
      }
      return authority.acknowledge(...args);
    };
    const first = await consumer({ authority: flaky }).consumeOnce(TENANT, 10, now);
    // R1 F14: without a verified PostgreSQL acknowledgment the outcome is `deferred` (the graph commit is a confirmation only).
    expect(first.results[0]).toMatchObject({ outcome: "deferred", acknowledged: false, reason: { code: "ACK_PENDING" } });
    expect((await outboxRow(x.dispatchId)).state).toBe("dispatched");
    const second = await consumer().consumeOnce(TENANT, 10, new Date(now.getTime() + 61_000));
    record("lost-acknowledgment", "observed", { first: first.results[0], second: second.results });
    const mine = second.results.find((r) => r.dispatchId === x.dispatchId)!;
    expect(mine).toMatchObject({ outcome: "duplicate", acknowledged: true, markerDigest: first.results[0]!.markerDigest });
    const acked = await outboxRow(x.dispatchId);
    expect(acked).toMatchObject({ state: "acknowledged", ack_record: { markerDigest: first.results[0]!.markerDigest } });
    expect(acked.ack_digest).toBe(acked.expected_marker_digest);
    expect(await marker(x.effectKey)).toHaveLength(1);
  });

  it("graph unavailable -> fail_dispatch with retry and no marker; the retry applies", async () => {
    const x = await enqueue("down", "study");
    const dead = new GraphClient({ uri: "bolt://127.0.0.1:7999", username: "neo4j", password: "unused", database: "neo4j" });
    const deadWriter = new KnowledgeWriter(dead, { schema, plans: new MemoryPlanStore(), snapshots: new FileSnapshotCustody(join(tmp, "snapshots")), verifications: new FileVerificationCustody(join(tmp, "verifications"), new Map()), witnessKeys: new Map(), signer: null, authority: null, localDev: false, now: clock });
    const report = await consumer({ writer: deadWriter, retry: { transientSeconds: 1 } }).consumeOnce(TENANT, 10, now);
    await dead.close();
    const row = await outboxRow(x.dispatchId);
    record("graph-unavailable", "observed", { result: report.results[0], row });
    expect(report.results[0]).toMatchObject({ outcome: "deferred", reason: { code: "GRAPH_UNAVAILABLE" }, componentState: "pending" });
    expect(row).toMatchObject({ state: "pending", attempts: 1 });
    expect(String(row.last_error)).toMatch(/^GRAPH_UNAVAILABLE/);
    expect(await marker(x.effectKey)).toHaveLength(0);
    await new Promise((r) => setTimeout(r, 1_200));
    const retry = await consumer().consumeOnce(TENANT, 10, new Date());
    const mine = retry.results.find((r) => r.dispatchId === x.dispatchId)!;
    record("graph-unavailable-retry", "observed", mine);
    expect(mine).toMatchObject({ outcome: "applied", acknowledged: true });
  });

  it("native rollback: a failure after the effect write and before the marker persists nothing; the retry applies", async () => {
    const x = await enqueue("rb", "evidence");
    const before = await revision();
    const report = await consumer({ retry: { transientSeconds: 1 }, hooks: { applyFaults: { beforeMarker: () => { throw new Error("injected failure after the effect write, before the KsIntentMarker"); } } } }).consumeOnce(TENANT, 10, now);
    const reportNodes = Number(toJson((await client.read((tx) => tx.run("MATCH (r:Report {reportRevisionRef: $ref}) RETURN count(r) AS c", { ref: `rr-ev-${stamp}rb` }))).records[0]!.get("c")));
    const markers = await marker(x.effectKey);
    record("native-rollback", "observed", { result: report.results[0], reportNodes, markers, revisionBefore: before, revisionAfter: await revision() });
    expect(report.results[0]).toMatchObject({ outcome: "deferred", componentState: "pending" });
    expect(reportNodes).toBe(0);
    expect(markers.every((m) => m.status === "failed" && m.dispatchId === null)).toBe(true);
    expect(await revision()).toBe(before);
    await new Promise((r) => setTimeout(r, 1_200));
    const retry = await consumer().consumeOnce(TENANT, 10, new Date());
    expect(retry.results.find((r) => r.dispatchId === x.dispatchId)).toMatchObject({ outcome: "applied", acknowledged: true });
  });

  it("R1 F1: review-conditioned decisions; reviewer grant revoked after admission -> official read excludes the applied report, the consumer settles a pending dispatch revoked", async () => {
    const reviewerId = `sv11-reviewer-${stamp}`;
    const grant = await asTenant(admin, async () =>
      (await admin.query("insert into knowledge_verification.reviewer_grant (tenant_id, reviewer_id, scope, granted_by, granted_at) values ($1::uuid, $2, $3::jsonb, 'sv11-fixture', now() - interval '1 hour') returning grant_id::text", [TENANT, reviewerId, JSON.stringify({ uses: ["*"], audiences: ["*"], reportKinds: ["*"] })])).rows[0].grant_id as string,
    );
    const applied = await enqueue("rva", "evidence", { review: { reviewerId, grantId: grant }, availableAt: "2026-10-25T09:40:00.000Z" });
    const first = await consumer().consumeOnce(TENANT, 10, now);
    expect(first.results.find((r) => r.dispatchId === applied.dispatchId)).toMatchObject({ outcome: "applied", acknowledged: true });
    const pending = await enqueue("rvb", "evidence", { review: { reviewerId, grantId: grant }, availableAt: "2026-10-25T09:41:00.000Z" });
    await asTenant(admin, () => admin.query("update knowledge_verification.reviewer_grant set revoked_at = now() where tenant_id = $1::uuid and grant_id = $2::uuid", [TENANT, grant]));
    // Official read of the applied report: the component rule now holds the decision REVIEW_REQUIRED -> excluded.
    const reportUid = String(toJson((await client.read((tx) => tx.run("MATCH (r:Report {reportRevisionRef: $ref}) RETURN r.uid AS uid", { ref: `rr-ev-${stamp}rva` }))).records[0]!.get("uid")));
    const model = ReadModel.fromRelease();
    const svc = new ReadService({ model, bindings: [{ ref: "default", scope: "public", client, readAuthority: "session-routing", visibility: "application" }] });
    const principal = { principalId: "ks-biotech-graph", installationId: INSTALLATION, applicationId: "biotech", tenantId: TENANT, role: "reader" as const, grants: [] };
    const readAuthority = new PgVerificationAuthority({ connectionString: outboxDsn });
    const official = await svc.typedV3({ schemaVersion: READ_INTENT_V3, intentId: "sv11-read-review", pins: { schemaReleaseDigest: R }, purpose: "R1 F1 grant revocation", use: { officialUse: true, useName: "official.publication" }, operations: [{ opId: "rep", op: "report", reportUid }] }, principal, readAuthority);
    await readAuthority.close();
    record("review-grant-revoked-official-read", "observed", { eligibility: official.eligibility, parts: official.parts.map((p) => ({ status: p.status, rows: p.rowCount })) });
    expect(official.eligibility).toMatchObject({ state: "revoked", excluded: 1 });
    expect(official.eligibility!.items[0]).toMatchObject({ state: "revoked", reason: "REVIEW_REQUIRED", served: false });
    expect(official.parts[0]).toMatchObject({ status: "forbidden", rowCount: 0 });
    // The dispatch still pending at revocation: the pre-apply recheck settles it revoked; nothing reaches the graph.
    const second = await consumer().consumeOnce(TENANT, 10, now);
    const mine = second.results.find((r) => r.dispatchId === pending.dispatchId)!;
    record("review-grant-revoked-consumer", "observed", mine);
    expect(mine).toMatchObject({ outcome: "revoked", reason: { code: "REVIEW_REQUIRED" }, componentState: "revoked" });
    expect(await outboxRow(pending.dispatchId)).toMatchObject({ state: "revoked" });
    expect(await marker(pending.effectKey)).toHaveLength(0);
  });

  it("R1 F13: a refused dispatch is settled `refused`; another target binding's dispatch is never claimed", async () => {
    const refused = await enqueue("refuse", "study", { mediaType: "application/octet-stream", availableAt: "2026-10-25T09:42:00.000Z" });
    const foreign = await enqueue("foreign", "study", { targetBinding: "other-graph", availableAt: "2026-10-25T09:42:01.000Z" });
    const report = await consumer().consumeOnce(TENANT, 10, now);
    record("refused-and-foreign", "observed", report.results);
    expect(report.results.find((r) => r.dispatchId === foreign.dispatchId)).toBeUndefined();
    expect(report.results.find((r) => r.dispatchId === refused.dispatchId)).toMatchObject({ outcome: "refused", reason: { code: "PAYLOAD_MEDIA_TYPE" }, componentState: "refused" });
    const settled = await asTenant(admin, async () => (await admin.query("select state, settled_at is not null as settled, attempts from knowledge_verification.dispatch_outbox where tenant_id = $1::uuid and dispatch_id = $2", [TENANT, refused.dispatchId])).rows[0]);
    expect(settled).toMatchObject({ state: "refused", settled: true });
    expect(await outboxRow(foreign.dispatchId)).toMatchObject({ state: "pending", attempts: 0 });
  });

  it("official reads: eligible report served; revoked decision excluded; authority unavailable holds", async () => {
    const effectKey = `ks:sv11/${stamp}/ev1`;
    const reportUid = String(toJson((await client.read((tx) => tx.run("MATCH (r:Report {reportRevisionRef: $ref}) RETURN r.uid AS uid", { ref: `rr-ev-${stamp}ev1` }))).records[0]!.get("uid")));
    const model = ReadModel.fromRelease();
    const svc = new ReadService({ model, bindings: [{ ref: "default", scope: "public", client, readAuthority: "session-routing", visibility: "application" }] });
    const principal = { principalId: "ks-biotech-graph", installationId: INSTALLATION, applicationId: "biotech", tenantId: TENANT, role: "reader" as const, grants: [] };
    const intent = (official: boolean, extra: Array<Record<string, unknown>> = []) => ({ schemaVersion: READ_INTENT_V3, intentId: `sv11-read-${official ? "o" : "n"}`, pins: { schemaReleaseDigest: R }, purpose: "SV-11 official read proof", use: { officialUse: official, useName: official ? "official.publication" : "exploration" }, operations: [{ opId: "rep", op: "report", reportUid }, { opId: "mk", op: "marker", effectKey }, ...extra] });
    const readAuthority = new PgVerificationAuthority({ connectionString: outboxDsn });
    const eligible = await svc.typedV3(intent(true), principal, readAuthority);
    record("official-read-eligible", "observed", { status: eligible.status, eligibility: eligible.eligibility, rows: eligible.parts.map((p) => p.rowCount) });
    expect(eligible.eligibility).toMatchObject({ state: "eligible", excluded: 0, held: 0 });
    expect(eligible.parts.map((p) => p.rowCount)).toEqual([1, 1]);
    // Revoke: invalidation affecting this decision, closure processed.
    await asTenant(admin, async () => {
      const inv = await admin.query("select invalidation_id from knowledge_verification.record_invalidation($1::uuid, 'report', 'rr-ev', 'sv11 official-read revocation')", [TENANT]);
      await admin.query("insert into knowledge_verification.invalidation_affected (tenant_id, invalidation_id, affected_kind, affected_id) values ($1::uuid, $2::uuid, 'use_decision', $3)", [TENANT, inv.rows[0].invalidation_id, decisions.get(effectKey)!.id]);
      await admin.query("update knowledge_verification.invalidation set closure_processed_at = now() where tenant_id = $1::uuid and invalidation_id = $2::uuid", [TENANT, inv.rows[0].invalidation_id]);
    });
    const revoked = await svc.typedV3(intent(true), principal, readAuthority);
    record("official-read-revoked", "observed", { status: revoked.status, eligibility: revoked.eligibility, parts: revoked.parts.map((p) => ({ op: p.op, status: p.status, rows: p.rowCount, reasons: p.reasons.map((r) => r.code) })) });
    expect(revoked.eligibility).toMatchObject({ state: "revoked", excluded: 2 });
    expect(revoked.parts.map((p) => [p.status, p.rowCount])).toEqual([["forbidden", 0], ["forbidden", 0]]);
    const revokedCard = await svc.typedV3(intent(true, [{ opId: "cd", op: "card", uid: reportUid }]), principal, readAuthority);
    record("official-read-revoked-card", "observed", { eligibility: revokedCard.eligibility?.items.map((i) => [i.opId, i.state]), parts: revokedCard.parts.map((p) => [p.op, p.status, p.rowCount]) });
    expect(revokedCard.parts.find((p) => p.opId === "cd")).toMatchObject({ status: "forbidden", rowCount: 0 });
    const nonOfficial = await svc.typedV3(intent(false), principal, readAuthority);
    expect(nonOfficial.eligibility).toBeNull();
    expect(nonOfficial.parts.map((p) => p.rowCount)).toEqual([1, 1]);
    await readAuthority.close();
    const down = new PgVerificationAuthority({ connectionString: "postgresql://nobody:x@127.0.0.1:1/none", timeoutMs: 1_500 });
    // R1 F8: a non-scoped operation (card of the same Report) is held too; nothing official is served.
    const held = await svc.typedV3(intent(true, [{ opId: "cd", op: "card", uid: reportUid }]), principal, down);
    await down.close();
    record("official-read-authority-unavailable", "observed", { status: held.status, eligibility: { state: held.eligibility?.state, held: held.eligibility?.held, available: held.eligibility?.authority.available }, parts: held.parts.map((p) => ({ status: p.status, rows: p.rowCount, reasons: p.reasons.map((r) => r.code) })) });
    expect(held.eligibility).toMatchObject({ state: "authority_unavailable", held: 3, authoritativeEpoch: null });
    expect(held.parts.map((p) => [p.op, p.status, p.rowCount, p.reasons.at(-1)?.code])).toEqual([["report", "skipped", 0, "READ_AUTHORITY_UNAVAILABLE"], ["marker", "skipped", 0, "READ_AUTHORITY_UNAVAILABLE"], ["card", "skipped", 0, "READ_AUTHORITY_UNAVAILABLE"]]);
  });
});
