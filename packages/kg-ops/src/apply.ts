import { createHash, randomUUID, type KeyObject } from "node:crypto";
import neo4j, { type Transaction } from "neo4j-driver";
import {
  ApplyRequestV2,
  BksServiceError,
  canonicalDigest,
  canonicalize,
  INTENT_MARKER_V2,
  markerDigestOf,
  RECEIPT_V2,
  type ApplyWitness,
  type BksErrorCode,
  type IngestionPlanV2,
  type IngestionReceiptV2,
  type MarkerAttempt,
  type PartialPolicy,
  type PlannedStatementV2,
  type VerifyEffectsPage,
  type WitnessClaims,
} from "@bks/contracts";
import { countersToJson, toJson, toParams, type GraphClient } from "./neo4j.js";
import type { FileReceiptStore, PlanStore, SnapshotCustody, StoredPlanRecord } from "./custody.js";
import { advanceRevision, lockFence, type FenceState, releaseMarkerVerdict } from "./fence.js";
import { snapshotTemporalProblem } from "./write/compile.js";
import { EXECUTOR_VERSION, planDigestOf, recompileStored } from "./plan.js";
import type { PrincipalCtx } from "./write/context.js";
import { intervalsOverlap, q } from "./write/context.js";
import type { WriteSchema } from "./write/release-model.js";
import { partialPolicyDigest, verifyWitness, witnessDigest } from "./witness.js";

export const MARKER_LABEL = "KsIntentMarker";
export const APPLY_BUDGET_MS = 30_000;

export interface ApplyDeps {
  schema: WriteSchema;
  plans: PlanStore;
  snapshots: SnapshotCustody;
  witnessKeys: Map<string, KeyObject>;
  receipts?: FileReceiptStore;
  /** BKS_LOCAL_DEV=1: tolerate a missing KsReleaseMarker (recorded as an invariant warning). Never in production. */
  localDev?: boolean;
  executorVersion?: string;
}

/** Fault injection for Gate B tests (never set in production). */
export interface ApplyFaults {
  beforeStatement?: (index: number, statement: PlannedStatementV2) => Promise<void> | void;
  beforeCommit?: () => Promise<void> | void;
  /** Throws to simulate the commit acknowledgement being lost by the driver (executor-side uncertainty). */
  commitThrows?: () => boolean;
  /** Throws to simulate the response being lost between executor and caller after a successful commit. */
  afterCommit?: () => Promise<void> | void;
  beforeFailureRecord?: () => Promise<void> | void;
  /** Throws after the graph effects (and the Activity lineage) are written and before the marker (native rollback proof). */
  beforeMarker?: () => Promise<void> | void;
}

const neo4jInt = (n: number) => neo4j.int(n);

export interface ApplyOptions {
  principal: PrincipalCtx;
  now: () => Date;
  signal?: AbortSignal;
  faults?: ApplyFaults;
  budgetMs?: number;
  /** Called once after a successful commit with the session's causal bookmarks (diagnostic graph-commit reference). */
  onCommitted?: (info: { bookmarks: string[] }) => void;
}

export class ApplyError extends BksServiceError {}

export function markerKeyOf(scope: { installationId: string; applicationId: string; tenantId: string }, effectKey: string): string {
  return `mk-${createHash("sha256").update(canonicalize({ installationId: scope.installationId, applicationId: scope.applicationId, tenantId: scope.tenantId, effectKey })).digest("hex").slice(0, 40)}`;
}

function receiptIdOf(markerKey: string, planDigest: string, policy: PartialPolicy): string {
  return `rc-${createHash("sha256").update(`${markerKey}\n${planDigest}\n${partialPolicyDigest(policy)}`).digest("hex").slice(0, 32)}`;
}

/** Statements and proposals the partial policy selects (dependency-safe closed subset). */
export function selectStatements(plan: IngestionPlanV2, policy: PartialPolicy): { statements: PlannedStatementV2[]; included: Set<string>; excluded: Set<string> } {
  const all = new Set(plan.proposals.map((p) => p.proposalId));
  const byId = new Map(plan.proposals.map((p) => [p.proposalId, p]));
  let included: Set<string>;
  if (policy === "all") {
    const blocked = plan.proposals.filter((p) => p.disposition === "held" || p.disposition === "rejected");
    if (blocked.length) throw new ApplyError("BKS_PARTIAL_REFUSED", `partialPolicy "all" but ${blocked.length} proposal(s) are held or rejected; name the closed subset to apply with { include: [...] }`, { blocked: blocked.map((p) => p.proposalId) });
    included = all;
  } else {
    included = new Set(policy.include);
    for (const id of included) {
      const p = byId.get(id);
      if (!p) throw new ApplyError("BKS_PARTIAL_REFUSED", `include names unknown proposal ${id}`);
      if (p.disposition === "held" || p.disposition === "rejected") throw new ApplyError("BKS_PARTIAL_REFUSED", `include names ${p.disposition} proposal ${id}`);
    }
    const missing: string[] = [];
    for (const id of included) for (const dep of byId.get(id)!.dependsOn) if (!included.has(dep)) missing.push(`${id} -> ${dep}`);
    if (missing.length) throw new ApplyError("BKS_PARTIAL_NOT_CLOSED", `the included subset is not closed under its dependencies: ${missing.join(", ")}`, { missing });
  }
  // Group statements (sources/subjects) are included when an included statement needs a uid they create (transitively).
  const creators = new Map<string, string>();
  for (const e of plan.effects.nodes) if (e.op === "create" && !creators.has(e.uid)) creators.set(e.uid, e.statementId);
  const byStmt = new Map(plan.statements.map((s) => [s.id, s]));
  const take = new Set<string>();
  const queue: string[] = [];
  for (const s of plan.statements) {
    if (s.group === "activity" || (s.group === "proposal" && s.proposalId && included.has(s.proposalId)) || (policy === "all" && s.group !== "proposal")) {
      take.add(s.id);
      queue.push(s.id);
    }
  }
  while (queue.length) {
    const s = byStmt.get(queue.pop()!)!;
    for (const uid of s.needs) {
      const c = creators.get(uid);
      if (c && !take.has(c)) {
        const cs = byStmt.get(c)!;
        if (cs.group === "proposal" && cs.proposalId && !included.has(cs.proposalId)) throw new ApplyError("BKS_PARTIAL_NOT_CLOSED", `${s.id} needs ${uid}, created by excluded proposal ${cs.proposalId}`);
        take.add(c);
        queue.push(c);
      }
    }
  }
  // Link statements of groups (HAS_SNAPSHOT / HAS_LOCATOR: they create no node) come with the nodes they connect.
  const createsNode = new Set(plan.effects.nodes.filter((e) => e.op === "create").map((e) => e.statementId));
  for (const s of plan.statements) {
    if (s.group === "proposal" || s.group === "activity" || take.has(s.id) || createsNode.has(s.id)) continue;
    const created = s.needs.filter((u) => u !== plan.activity.uid && creators.has(u));
    if (created.length && created.every((u) => take.has(creators.get(u)!))) take.add(s.id);
  }
  const statements = plan.statements.filter((s) => take.has(s.id));
  const excluded = new Set([...all].filter((id) => !included.has(id)));
  return { statements, included, excluded };
}

interface MarkerRow {
  markerKey: string;
  status: "applied" | "failed";
  intentDigest: string;
  planDigest: string;
  receipt: string | null;
  receiptId: string | null;
  attempts: string | null;
  installationId: string;
  applicationId: string;
  tenantId: string;
}

async function readMarker(tx: Transaction, markerKey: string): Promise<MarkerRow | null> {
  const res = await tx.run(`MATCH (m:${MARKER_LABEL} {markerKey: $markerKey}) RETURN m {.*} AS m`, { markerKey });
  return res.records.length ? (toJson(res.records[0]!.get("m")) as MarkerRow) : null;
}

function parseAttempts(raw: string | null | undefined): MarkerAttempt[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as MarkerAttempt[];
  } catch {
    return [];
  }
}

/** Runs one invariant inside the apply transaction. Returns a failure message or null. */
async function checkInvariant(tx: Transaction, schema: WriteSchema, inv: IngestionPlanV2["invariants"][number]): Promise<string | null> {
  const p = inv.params as Record<string, unknown>;
  switch (inv.kind) {
    case "uid-absent": {
      const res = await tx.run(`MATCH (n:${q(String(p.label))} {uid: $uid}) RETURN count(n) AS c`, { uid: p.uid });
      return Number(toJson(res.records[0]!.get("c"))) === 0 ? null : `uid ${String(p.uid)} now exists (${String(p.label)})`;
    }
    case "identifier-owner": {
      const res = await tx.run("MATCH (i:Identifier {scheme: $scheme, issuer: $issuer, value: $value})<-[r:HAS_IDENTIFIER]-(s) WHERE r.recordedTo IS NULL AND s.uid <> $owner RETURN s.uid AS uid LIMIT 1", { scheme: p.scheme, issuer: p.issuer, value: p.value, owner: p.ownerUid });
      return res.records.length ? `identifier ${String(p.scheme)}:${String(p.value)} (${String(p.issuer)}) now identifies ${String(res.records[0]!.get("uid"))}` : null;
    }
    case "slot-free": {
      const fromSpec = schema.nodeForUid(String(p.fromUid));
      const res = await tx.run(
        `MATCH (a${fromSpec ? `:${q(fromSpec.primaryLabel)}` : ""} {uid: $from})-[r:${q(String(p.type))}]->(b) WHERE r.recordedTo IS NULL AND b.uid <> $to AND NOT r.relationshipUid IN $closing
MATCH (x:Assertion {uid: r.assertionUid})-[:ASSERTED_BY]->(w {uid: $asserter})
RETURN r.relationshipUid AS rel, b.uid AS to, toString(r.validFrom) AS vf, toString(r.validTo) AS vt`,
        { from: p.fromUid, to: p.toUid, asserter: p.asserterUid, closing: p.closing ?? [] },
      );
      for (const r of res.records) {
        if (intervalsOverlap(r.get("vf") as string | null, r.get("vt") as string | null, (p.validFrom as string | null) ?? null, (p.validTo as string | null) ?? null)) return `${String(p.type)} slot of ${String(p.fromUid)} for asserter ${String(p.asserterUid)} is occupied by ${String(r.get("rel"))} -> ${String(r.get("to"))}`;
      }
      return null;
    }
    case "episode-absent": {
      const res = await tx.run(
        `MATCH (a {uid: $from})-[r:${q(String(p.type))}]->(b {uid: $to}) WHERE r.recordedTo IS NULL AND NOT r.relationshipUid IN $closing MATCH (x:Assertion {uid: r.assertionUid})-[:ASSERTED_BY]->(w {uid: $asserter}) RETURN r.relationshipUid AS rel LIMIT 1`,
        { from: p.fromUid, to: p.toUid, asserter: p.asserterUid, closing: (p.closing as string[] | undefined) ?? [] },
      );
      return res.records.length ? `an open ${String(p.type)} episode for this asserter now exists (${String(res.records[0]!.get("rel"))})` : null;
    }
    case "asserted-edge-provenance": {
      const res = await tx.run(
        `MATCH (s)-[r:${q(String(p.type))} {relationshipUid: $rel}]->(o) MATCH (a:Assertion {uid: r.assertionUid})
OPTIONAL MATCH (a)-[:HAS_SUBJECT]->(as) OPTIONAL MATCH (a)-[:HAS_OBJECT]->(ao) OPTIONAL MATCH (a)-[e:HAS_EVIDENCE {role: 'SUPPORTS'}]->(:SourceLocator)
RETURN a.predicate AS predicate, as.uid = s.uid AS subjectOk, (ao IS NULL OR ao.uid = o.uid) AS objectOk, count(e) AS supports, a.uid = $assertion AS assertionOk`,
        { rel: p.relationshipUid, assertion: p.assertionUid },
      );
      if (!res.records.length) return `asserted edge ${String(p.relationshipUid)} has no authorizing Assertion`;
      const r = toJson(res.records[0]!.toObject()) as Record<string, unknown>;
      if (r.predicate !== p.type && !(p.type === "HAS_IDENTIFIER" && r.predicate === "HAS_IDENTIFIER")) return `authorizing predicate ${String(r.predicate)} != ${String(p.type)}`;
      if (!r.subjectOk || !r.objectOk || !r.assertionOk) return `authorizing Assertion of ${String(p.relationshipUid)} does not bind its endpoints`;
      if (Number(r.supports) < 1) return `authorizing Assertion of ${String(p.relationshipUid)} has no SUPPORTS evidence`;
      return null;
    }
    case "evidence-chain": {
      const res = await tx.run(
        `MATCH (a:Assertion {uid: $uid})-[:HAS_EVIDENCE]->(l:SourceLocator)
OPTIONAL MATCH (src:Source)-[:HAS_SNAPSHOT]->(snap:SourceSnapshot)-[:HAS_LOCATOR]->(l)
RETURN l.uid AS loc, src IS NOT NULL AS chained`,
        { uid: p.assertionUid },
      );
      const broken = res.records.filter((r) => !r.get("chained")).map((r) => String(r.get("loc")));
      return broken.length ? `evidence of ${String(p.assertionUid)} does not chain to a captured Source: ${broken.join(", ")}` : null;
    }
    default:
      return null;
  }
}

const PRE_INVARIANTS = new Set(["uid-absent", "identifier-owner", "slot-free", "episode-absent"]);
const SPECIFICITY: BksErrorCode[] = ["BKS_IDENTITY_CONFLICT", "BKS_SLOT_CONFLICT", "BKS_STALE_PRECONDITION"];

/** Loads and authenticates the stored plan referenced by an apply request (custody, digest, recompilation). */
export async function loadAuthenticPlan(deps: ApplyDeps, planRef: string, expectedPlanDigest: string): Promise<StoredPlanRecord> {
  const record = await deps.plans.get(planRef);
  if (!record) throw new ApplyError("BKS_PLAN_NOT_FOUND", `no stored plan ${planRef}`);
  if (record.plan.planDigest !== expectedPlanDigest) throw new ApplyError("BKS_PLAN_DIGEST_MISMATCH", `plan ${planRef} has digest ${record.plan.planDigest}; the request expects ${expectedPlanDigest}`);
  const { schemaVersion: _v, planRef: _r, planDigest: _d, ...body } = record.plan;
  if (planDigestOf(body) !== record.plan.planDigest) throw new ApplyError("BKS_PLAN_FORGED", `stored plan ${planRef} content does not match its digest (custody tampering)`);
  if (record.plan.binding.schemaReleaseDigest !== deps.schema.schemaReleaseDigest || record.plan.binding.rulesDigest !== deps.schema.rulesDigest()) throw new ApplyError("BKS_RELEASE_MISMATCH", "the plan was compiled under another release or rule set; re-plan");
  const recompiled = recompileStored(deps.schema, record);
  if (recompiled.planDigest !== record.plan.planDigest || canonicalize(recompiled) !== canonicalize(record.plan)) throw new ApplyError("BKS_PLAN_FORGED", `stored plan ${planRef} is not the compiler's output for its frozen context`);
  return record;
}

/**
 * Applies a stored plan in ONE write transaction (SPECIFICATION 7.3):
 *  1. writer fence lock -> installed release marker -> witness revocation generation vs local fence
 *  2. scoped effect marker by effectKey (duplicate / conflict / retry of a failed attempt)
 *  3. identity and slot invariants, then strict graph-revision check (no implicit re-plan)
 *  4. compiler statements with exact row/counter expectations, asserted-edge provenance and evidence-chain checks
 *  5. receipt projection on the marker, Activity lineage lists (P14), next graphRevision -> single commit
 * Failures roll back; a separate failure-record transaction (under the fence) appends the attempt and never
 * overwrites an applied marker. A lost commit acknowledgement is `unresolved` and is reconciled through the marker.
 */
export async function applyV2(client: GraphClient, deps: ApplyDeps, requestInput: unknown, opts: ApplyOptions): Promise<IngestionReceiptV2> {
  const started = opts.now();
  if (requestInput && typeof requestInput === "object") {
    const forbidden = ["statements", "plan", "cypher", "planBody"].filter((k) => k in (requestInput as Record<string, unknown>));
    if (forbidden.length) throw new ApplyError("BKS_PLAN_FORGED", `apply accepts plan references only; caller-supplied ${forbidden.join(", ")} refused`);
  }
  const parsed = ApplyRequestV2.safeParse(requestInput);
  if (!parsed.success) throw new ApplyError("BKS_PARSE_REJECTED", "request does not match biotech-knowledge-apply.v2", { issues: parsed.error.issues.slice(0, 20) as unknown as Record<string, unknown>[] });
  return applyCore(client, deps, parsed.data, null, opts, started);
}

/**
 * Authorization of a Knowledge Services dispatch (biotech-knowledge-admission.v1, SV-11): the consumer has verified the
 * outbox row, the payload digest, the bound effect and the use decision against PostgreSQL before calling. It replaces
 * the witness (witness = null on the receipt) and adds the dispatch fields to the KsIntentMarker and the admission
 * binding to the effect's Activity, inside the SAME single apply transaction.
 */
export interface DispatchAuthorization {
  dispatchId: string;
  payloadDigest: string;
  boundEffectDigest: string;
  useDecision: { id: string; digest: string };
  revocationEpoch: number;
  verificationRunRef: string;
  runManifestDigest: string;
  runSealKind: "VERIFICATION_SNAPSHOT" | "DECISION_SNAPSHOT" | "ADMISSION_SNAPSHOT";
  originatingOrigin: string;
}

export interface AdmittedApplyRequest {
  planRef: string;
  expectedPlanDigest: string;
  intentDigest: string;
  effectKey: string;
}

/** Applies a stored plan under a verified dispatch authorization (partial policy "all"); same transaction discipline as applyV2. */
export async function applyAdmittedV2(client: GraphClient, deps: ApplyDeps, request: AdmittedApplyRequest, admission: DispatchAuthorization, opts: ApplyOptions): Promise<IngestionReceiptV2> {
  const started = opts.now();
  return applyCore(client, deps, { schemaVersion: "biotech-knowledge-apply.v2", ...request, partialPolicy: "all" }, admission, opts, started);
}

type CoreRequest = Omit<ApplyRequestV2, "witness"> & { witness?: ApplyRequestV2["witness"] };

async function applyCore(client: GraphClient, deps: ApplyDeps, req: CoreRequest, admission: DispatchAuthorization | null, opts: ApplyOptions, started: Date): Promise<IngestionReceiptV2> {
  const budget = opts.budgetMs ?? APPLY_BUDGET_MS;
  const scope = { installationId: opts.principal.installationId, applicationId: opts.principal.applicationId, tenantId: opts.principal.tenantId };
  const record = await loadAuthenticPlan(deps, req.planRef, req.expectedPlanDigest);
  const plan = record.plan;
  const b = plan.binding;
  if (req.intentDigest !== b.intentDigest) throw new ApplyError("BKS_PLAN_DIGEST_MISMATCH", `the plan binds intent ${b.intentDigest}; the request names ${req.intentDigest}`);
  if (b.principal.installationId !== scope.installationId || b.principal.applicationId !== scope.applicationId || b.principal.tenantId !== scope.tenantId) throw new ApplyError("BKS_FORBIDDEN_SCOPE", "the plan belongs to another installation/application/tenant scope");
  if (plan.outcome === "rejected") throw new ApplyError("BKS_PLAN_REJECTED", "a rejected plan cannot be applied", { errors: plan.errors as unknown as Record<string, unknown>[] });
  if (plan.outcome === "held") throw new ApplyError("BKS_PLAN_REJECTED", "every proposal of this plan is held; it writes nothing (resolve the holds and plan again)", { held: plan.proposals.filter((p) => p.disposition === "held").map((p) => p.proposalId) as unknown as Record<string, unknown>[] });
  // WR-19: re-check the temporal precondition with the apply clock, so a plan made before a cited snapshot time cannot
  // be applied early either. Refused before the transaction; nothing is written.
  const applyInstant = started.toISOString();
  for (const src of record.frozen.intent.sources ?? []) {
    if (!src.snapshot) continue;
    const problem = snapshotTemporalProblem(src.snapshot, applyInstant);
    if (problem) throw new ApplyError("BKS_STALE_PRECONDITION", `${src.ref}: ${problem}`);
  }
  const selection = selectStatements(plan, req.partialPolicy);
  const nowSeconds = () => Math.floor(opts.now().getTime() / 1000);
  if (!admission && !req.witness) throw new ApplyError("BKS_WITNESS_INVALID", "apply needs an admission witness");
  if (admission && req.partialPolicy !== "all") throw new ApplyError("BKS_PARTIAL_REFUSED", "a dispatch applies its exact effect: partial policy must be all");
  const claims: WitnessClaims | null = admission
    ? null
    : verifyWitness(req.witness!, deps.witnessKeys, {
        effectKey: req.effectKey, scope, intentDigest: b.intentDigest, planDigest: plan.planDigest, schemaReleaseDigest: b.schemaReleaseDigest, evidenceDigest: b.evidenceDigest, partialPolicyDigest: partialPolicyDigest(req.partialPolicy), policyVersion: b.policyVersion, nowSeconds: nowSeconds(),
      });
  const markerDigest = admission ? markerDigestOf(admission.payloadDigest, plan.planDigest) : null;
  // Snapshot authenticity is rechecked before the transaction (no transaction is held across custody calls).
  if (b.basis.kind === "snapshot" && b.basis.snapshotRef && b.basis.snapshotDigest) {
    await deps.snapshots.verify(b.basis.snapshotRef, b.basis.snapshotDigest, { scope, schemaReleaseDigest: b.schemaReleaseDigest }).catch((e: unknown) => {
      throw e instanceof BksServiceError ? e : new ApplyError("BKS_SNAPSHOT_UNVERIFIED", (e as Error).message);
    });
  }
  const markerKey = markerKeyOf(scope, req.effectKey);
  const attemptId = `at-${randomUUID()}`;
  const receiptId = receiptIdOf(markerKey, plan.planDigest, req.partialPolicy);
  const executorVersion = deps.executorVersion ?? EXECUTOR_VERSION;
  const witnessRef = claims && req.witness ? { jti: claims.jti, kid: req.witness.kid, iss: claims.iss, iat: claims.iat, exp: claims.exp, revocationGeneration: claims.revocationGeneration, digest: witnessDigest(req.witness) } : null;
  const effectScope = { effectKey: req.effectKey, markerKey, scope };
  const includedStmtIds = new Set(selection.statements.map((s) => s.id));
  const effects = {
    nodes: plan.effects.nodes.filter((e) => includedStmtIds.has(e.statementId)),
    relationships: plan.effects.relationships.filter((e) => includedStmtIds.has(e.statementId)),
  };
  const proposalOutcomes = (applied: boolean): IngestionReceiptV2["proposals"] =>
    plan.proposals.map((p) => {
      if (selection.excluded.has(p.proposalId)) return { proposalId: p.proposalId, outcome: p.disposition === "held" ? "held" : p.disposition === "rejected" ? "rejected" : "excluded", reason: p.reasons[0] ?? "excluded by partial policy" };
      if (p.disposition === "noop_duplicate") return { proposalId: p.proposalId, outcome: "noop", ...(p.reasons[0] ? { reason: p.reasons[0] } : {}) };
      return { proposalId: p.proposalId, outcome: applied ? "applied" : "failed" };
    });
  const baseReceipt = (): Omit<IngestionReceiptV2, "outcome" | "failure" | "invariants" | "counters" | "priorGraphRevision" | "nextGraphRevision" | "proposals" | "attempts" | "duplicateOf"> => ({
    schemaVersion: RECEIPT_V2,
    receiptId,
    effect: effectScope,
    intent: { intentId: b.intentId, intentDigest: b.intentDigest },
    plan: { planRef: plan.planRef, planDigest: plan.planDigest, partialPolicy: req.partialPolicy as never },
    release: { schemaReleaseDigest: b.schemaReleaseDigest, executorVersion, rulesDigest: b.rulesDigest },
    attemptId,
    witness: witnessRef,
    activityUid: plan.activity.uid,
    effects: { ...effects, total: effects.nodes.length + effects.relationships.length },
    recovery: { effectKey: req.effectKey, markerKey, attemptId, lookup: `/kg/receipt?effectKey=${encodeURIComponent(req.effectKey)}` },
    executedAt: started.toISOString(),
  });

  const session = client.session("WRITE");
  const tx = await session.beginTransaction({ timeout: budget });
  let committed = false;
  let fence: FenceState | null = null;
  const invariantResults: IngestionReceiptV2["invariants"] = [];
  try {
    // 1. Writer fence, release marker, local revocation fence.
    fence = await lockFence(tx);
    // Latest-marker rule (same as GraphQL readiness): the newest KsReleaseMarker must be the served release.
    const markerProblem = releaseMarkerVerdict(fence.latestMarkers, { releaseId: deps.schema.releaseId, schemaReleaseDigest: b.schemaReleaseDigest, ddlDigest: deps.schema.release.ddlDigest ?? null });
    if (markerProblem) {
      if (deps.localDev) invariantResults.push({ id: "release-marker", ok: true, detail: `BKS_LOCAL_DEV=1 development bypass: ${markerProblem}` });
      else throw new ApplyError("BKS_RELEASE_MISMATCH", markerProblem);
    } else invariantResults.push({ id: "release-marker", ok: true });
    if (claims && claims.revocationGeneration < fence.revocationGeneration) throw new ApplyError("BKS_WITNESS_REVOKED", `witness generation ${claims.revocationGeneration} is older than the delivered revocation generation ${fence.revocationGeneration}`);
    // 2. Scoped effect marker.
    const marker = await readMarker(tx, markerKey);
    if (marker) {
      if (marker.installationId !== scope.installationId || marker.applicationId !== scope.applicationId || marker.tenantId !== scope.tenantId) throw new ApplyError("BKS_FORBIDDEN_SCOPE", "effect marker scope mismatch");
      // A dispatch is identified by its exact native intent (bound effect): a redelivery may re-plan against a moved
      // graph, so the plan digest is not part of its identity; a witness apply keeps the strict intent + plan match.
      const same = marker.intentDigest === b.intentDigest && (admission !== null || marker.planDigest === plan.planDigest);
      if (marker.status === "applied") {
        await tx.rollback();
        if (!same) throw new ApplyError("BKS_EFFECT_CONFLICT", `effectKey ${req.effectKey} was applied with intent ${marker.intentDigest} / plan ${marker.planDigest}; a changed payload or plan needs a new effect key`, { recordedIntentDigest: marker.intentDigest, recordedPlanDigest: marker.planDigest });
        const prior = JSON.parse(marker.receipt!) as IngestionReceiptV2;
        return { ...prior, outcome: "duplicate", duplicateOf: prior.receiptId, attemptId, attempts: parseAttempts(marker.attempts), executedAt: started.toISOString() };
      }
      if (!same) throw new ApplyError("BKS_EFFECT_CONFLICT", `effectKey ${req.effectKey} has a failed attempt for a different intent/plan; use a new effect key`);
    }
    // 2b. A dispatch binds its Activity to exactly one admitted effect (Activity.effectKey, R-SV10): an existing run
    // Activity must already carry this effect key, otherwise the admission binding would be ambiguous.
    if (admission && plan.activity.exists) {
      const act = await tx.run("MATCH (act:Activity {uid: $uid}) RETURN act.effectKey AS effectKey", { uid: plan.activity.uid });
      const bound = act.records[0]?.get("effectKey") as string | null | undefined;
      if (bound !== req.effectKey) throw new ApplyError("BKS_EFFECT_CONFLICT", `run Activity ${plan.activity.uid} is ${bound ? `bound to effect ${bound}` : "not bound to an admitted effect"}; a dispatch needs its own run Activity (one Activity per admitted effect)`);
    }
    // 3. Invariants (most specific failure first), then strict revision.
    const proposalsIncluded = selection.included;
    const creatorOf = new Map(plan.effects.nodes.filter((e) => e.op === "create").map((e) => [e.uid, e.statementId]));
    const relevant = plan.invariants.filter((i) => (i.proposalId ? proposalsIncluded.has(i.proposalId) : i.kind !== "uid-absent" || includedStmtIds.has(creatorOf.get(String((i.params as Record<string, unknown>).uid)) ?? "")));
    const failures: Array<{ code: BksErrorCode; message: string }> = [];
    for (const inv of relevant.filter((i) => PRE_INVARIANTS.has(i.kind))) {
      const msg = await checkInvariant(tx, deps.schema, inv);
      invariantResults.push({ id: inv.id, ok: !msg, ...(msg ? { detail: msg } : {}) });
      if (msg) failures.push({ code: inv.failure, message: msg });
    }
    if (failures.length) {
      failures.sort((a, b2) => SPECIFICITY.indexOf(a.code) - SPECIFICITY.indexOf(b2.code));
      throw new ApplyError(failures[0]!.code, failures[0]!.message, { failures: failures.slice(0, 20) as unknown as Record<string, unknown>[] });
    }
    if (fence.graphRevision !== b.observedGraphRevision) throw new ApplyError("BKS_STALE_REVISION", `graph revision is ${fence.graphRevision}; the plan observed ${b.observedGraphRevision}. Re-plan (strict stale failure; no implicit re-plan)`, { observed: b.observedGraphRevision, current: fence.graphRevision });
    // 4. Compiler statements.
    const counters: Record<string, number> = {};
    for (const [i, s] of selection.statements.entries()) {
      if (opts.signal?.aborted) throw new ApplyError("BKS_TIMEOUT", "cancelled before commit; nothing was written");
      if (opts.now().getTime() - started.getTime() > budget) throw new ApplyError("BKS_TIMEOUT", `apply exceeded the ${budget} ms budget`);
      await opts.faults?.beforeStatement?.(i, s);
      const res = await tx.run(s.cypher, toParams(s.params));
      const c = countersToJson(res.summary.counters);
      for (const [k, v] of Object.entries(c)) counters[k] = (counters[k] ?? 0) + v;
      if (res.records.length !== s.expectRows || c.nodesCreated !== s.expectNodesCreated || c.relationshipsCreated !== s.expectRelationshipsCreated || c.nodesDeleted || c.relationshipsDeleted) {
        throw new ApplyError("BKS_STALE_PRECONDITION", `statement ${s.id} (${s.purpose}) returned ${res.records.length} row(s), created ${c.nodesCreated} node(s) / ${c.relationshipsCreated} relationship(s); the plan declared ${s.expectRows} / ${s.expectNodesCreated} / ${s.expectRelationshipsCreated}`, { statementId: s.id });
      }
    }
    for (const inv of relevant.filter((i) => !PRE_INVARIANTS.has(i.kind))) {
      const msg = await checkInvariant(tx, deps.schema, inv);
      invariantResults.push({ id: inv.id, ok: !msg, ...(msg ? { detail: msg } : {}) });
      if (msg) throw new ApplyError(inv.failure, msg);
    }
    if (claims && claims.exp <= nowSeconds()) throw new ApplyError("BKS_WITNESS_EXPIRED", "witness expired before commit");
    // 5. Receipt projection, lineage, revision, single commit.
    const nextGraphRevision = await advanceRevision(tx, req.effectKey, plan.activity.runId);
    const attempts: MarkerAttempt[] = [...parseAttempts(marker?.attempts), { attemptId, at: started.toISOString(), outcome: "applied", code: null, message: null, planDigest: plan.planDigest }];
    const appliedCount = plan.proposals.filter((p) => selection.included.has(p.proposalId) && p.disposition === "admitted").length;
    const outcome: IngestionReceiptV2["outcome"] = appliedCount === 0 ? "noop" : selection.excluded.size ? "partial" : "applied";
    const appliedAt = opts.now().toISOString();
    const receiptAdmission = admission && markerDigest
      ? { markerSchemaVersion: INTENT_MARKER_V2, dispatchId: admission.dispatchId, markerDigest, payloadDigest: admission.payloadDigest, boundEffectDigest: admission.boundEffectDigest, useDecision: { id: admission.useDecision.id, digest: admission.useDecision.digest }, revocationEpoch: admission.revocationEpoch, appliedAt }
      : null;
    const receipt: IngestionReceiptV2 = { ...baseReceipt(), outcome, duplicateOf: null, priorGraphRevision: fence.graphRevision, nextGraphRevision, proposals: proposalOutcomes(true), invariants: invariantResults, counters, failure: null, attempts, ...(receiptAdmission ? { admission: receiptAdmission } : {}) };
    const receiptText = JSON.stringify(receipt);
    await tx.run(
      `MATCH (act:Activity {uid: $activityUid})
SET act.operationIds = CASE WHEN $operationId IS NULL OR $operationId IN coalesce(act.operationIds, []) THEN coalesce(act.operationIds, []) ELSE coalesce(act.operationIds, []) + $operationId END,
    act.intentDigests = coalesce(act.intentDigests, []) + $intentDigest, act.planDigests = coalesce(act.planDigests, []) + $planDigest, act.receiptIds = coalesce(act.receiptIds, []) + $receiptId,
    act.endedAt = datetime.transaction(), act.updatedAt = datetime.transaction(), act.lastWriterRunId = $runId`,
      { activityUid: plan.activity.uid, operationId: record.frozen.intent.context.run.operationId ?? null, intentDigest: b.intentDigest, planDigest: plan.planDigest, receiptId, runId: plan.activity.runId },
    );
    if (admission) {
      // Admission binding of the effect's Activity (kernel Activity fields of biotech-schema-v2.1.0/v2.2.0).
      await tx.run(
        `MATCH (act:Activity {uid: $activityUid})
SET act.effectKey = $effectKey, act.useDecisionRef = $useDecisionRef, act.useDecisionDigest = $useDecisionDigest, act.boundEffectDigest = $boundEffectDigest,
    act.revocationEpoch = $revocationEpoch, act.verificationRunRef = $verificationRunRef, act.runManifestDigest = $runManifestDigest, act.runSealKind = $runSealKind,
    act.originatingOrigin = $originatingOrigin`,
        { activityUid: plan.activity.uid, effectKey: req.effectKey, useDecisionRef: admission.useDecision.id, useDecisionDigest: admission.useDecision.digest, boundEffectDigest: admission.boundEffectDigest, revocationEpoch: neo4jInt(admission.revocationEpoch), verificationRunRef: admission.verificationRunRef, runManifestDigest: admission.runManifestDigest, runSealKind: admission.runSealKind, originatingOrigin: admission.originatingOrigin },
      );
    }
    // Fault point for the native-rollback proof: graph effects are written, the marker is not.
    await opts.faults?.beforeMarker?.();
    await tx.run(
      `MERGE (m:${MARKER_LABEL} {markerKey: $markerKey})
ON CREATE SET m.startedAt = datetime.transaction()
SET m.status = 'applied', m.effectKey = $effectKey, m.installationId = $installationId, m.applicationId = $applicationId, m.tenantId = $tenantId,
    m.intentId = $intentId, m.intentDigest = $intentDigest, m.planRef = $planRef, m.planDigest = $planDigest, m.receiptId = $receiptId, m.receipt = $receipt,
    m.attempts = $attempts, m.lastAttemptId = $attemptId, m.graphRevision = $rev, m.executorVersion = $executorVersion, m.finishedAt = datetime.transaction()`,
      { markerKey, effectKey: req.effectKey, ...scope, intentId: b.intentId, intentDigest: b.intentDigest, planRef: plan.planRef, planDigest: plan.planDigest, receiptId, receipt: receiptText, attempts: JSON.stringify(attempts), attemptId, rev: nextGraphRevision, executorVersion },
    );
    if (receiptAdmission) {
      // bks-intent-marker.v2 dispatch fields (rules/operational-names.yaml markerShapes, R-SV11), same transaction.
      await tx.run(
        `MATCH (m:${MARKER_LABEL} {markerKey: $markerKey})
SET m.markerSchemaVersion = $markerSchemaVersion, m.dispatchId = $dispatchId, m.markerDigest = $markerDigest, m.payloadDigest = $payloadDigest,
    m.boundEffectDigest = $boundEffectDigest, m.useDecisionRef = $useDecisionRef, m.useDecisionDigest = $useDecisionDigest,
    m.revocationEpoch = $revocationEpoch, m.appliedAt = $appliedAt`,
        { markerKey, markerSchemaVersion: receiptAdmission.markerSchemaVersion, dispatchId: receiptAdmission.dispatchId, markerDigest: receiptAdmission.markerDigest, payloadDigest: receiptAdmission.payloadDigest, boundEffectDigest: receiptAdmission.boundEffectDigest, useDecisionRef: receiptAdmission.useDecision.id, useDecisionDigest: receiptAdmission.useDecision.digest, revocationEpoch: neo4jInt(receiptAdmission.revocationEpoch), appliedAt },
      );
    }
    await opts.faults?.beforeCommit?.();
    if (opts.signal?.aborted) throw new ApplyError("BKS_TIMEOUT", "cancelled before commit; nothing was written");
    try {
      if (opts.faults?.commitThrows?.()) {
        await tx.commit();
        throw new Error("simulated: commit acknowledgement lost");
      }
      await tx.commit();
      committed = true;
      try {
        opts.onCommitted?.({ bookmarks: [...(session.lastBookmarks() as unknown as Iterable<string>)].map(String) });
      } catch {
        /* bookmark capture is diagnostic only */
      }
    } catch (commitError) {
      committed = true; // uncertain: never record a failure for an attempt that may have committed
      await session.close().catch(() => undefined);
      return reconcileUnresolved(client, markerKey, attemptId, { ...baseReceipt(), outcome: "unresolved", duplicateOf: null, priorGraphRevision: fence.graphRevision, nextGraphRevision: null, proposals: proposalOutcomes(false), invariants: invariantResults, counters: null, failure: { code: "BKS_EFFECT_UNRESOLVED", message: `commit outcome unknown: ${(commitError as Error).message}; reconcile with the receipt lookup` }, attempts: [] });
    }
    deps.receipts?.put(markerKey, attemptId, receipt);
    await opts.faults?.afterCommit?.();
    if (opts.signal?.aborted) return { ...receipt, cancellation: { requestedAfterCommit: true } };
    return { ...receipt, durationMs: Math.max(0, opts.now().getTime() - started.getTime()) };
  } catch (error) {
    if (committed) throw error;
    try {
      await tx.rollback();
    } catch {
      /* already closed */
    }
    if (error instanceof BksServiceError && ["BKS_EFFECT_CONFLICT", "BKS_FORBIDDEN_SCOPE"].includes(error.code)) throw error;
    const failure = error instanceof BksServiceError ? { code: error.code, message: error.message, details: error.details } : { code: "BKS_STALE_PRECONDITION" as BksErrorCode, message: (error as Error).message };
    await opts.faults?.beforeFailureRecord?.();
    const recorded = await recordFailedAttempt(client, { markerKey, effectKey: req.effectKey, scope, intentId: b.intentId, intentDigest: b.intentDigest, planRef: plan.planRef, planDigest: plan.planDigest, attemptId, at: started.toISOString(), code: failure.code, message: failure.message, executorVersion });
    if (recorded.appliedReceipt) {
      // Another attempt committed this effect; the failure is only appended to history.
      const prior = JSON.parse(recorded.appliedReceipt) as IngestionReceiptV2;
      return { ...prior, outcome: "duplicate", duplicateOf: prior.receiptId, attemptId, attempts: recorded.attempts, executedAt: started.toISOString() };
    }
    return { ...baseReceipt(), outcome: "failed", duplicateOf: null, priorGraphRevision: fence?.graphRevision ?? null, nextGraphRevision: null, proposals: proposalOutcomes(false), invariants: invariantResults, counters: null, failure: failure as IngestionReceiptV2["failure"], attempts: recorded.attempts };
  } finally {
    await session.close().catch(() => undefined);
  }
}

/** Failure record: its own transaction under the writer fence; appends the attempt; never deletes; never overwrites `applied`. */
async function recordFailedAttempt(client: GraphClient, a: { markerKey: string; effectKey: string; scope: { installationId: string; applicationId: string; tenantId: string }; intentId: string; intentDigest: string; planRef: string; planDigest: string; attemptId: string; at: string; code: string; message: string; executorVersion: string }): Promise<{ attempts: MarkerAttempt[]; appliedReceipt: string | null }> {
  try {
    return await client.write(async (tx) => {
      await lockFence(tx);
      const res = await tx.run(`MATCH (m:${MARKER_LABEL} {markerKey: $markerKey}) RETURN m.status AS status, m.attempts AS attempts, m.receipt AS receipt`, { markerKey: a.markerKey });
      const existing = res.records[0];
      const prior = parseAttempts(existing ? (toJson(existing.get("attempts")) as string | null) : null);
      if (prior.some((x) => x.attemptId === a.attemptId)) return { attempts: prior, appliedReceipt: existing && existing.get("status") === "applied" ? (existing.get("receipt") as string) : null };
      const attempts = [...prior, { attemptId: a.attemptId, at: a.at, outcome: "failed" as const, code: a.code, message: a.message.slice(0, 1000), planDigest: a.planDigest }];
      if (existing && existing.get("status") === "applied") {
        await tx.run(`MATCH (m:${MARKER_LABEL} {markerKey: $markerKey}) WHERE m.status = 'applied' SET m.attempts = $attempts`, { markerKey: a.markerKey, attempts: JSON.stringify(attempts) });
        return { attempts, appliedReceipt: existing.get("receipt") as string };
      }
      await tx.run(
        `MERGE (m:${MARKER_LABEL} {markerKey: $markerKey})
ON CREATE SET m.startedAt = datetime(), m.effectKey = $effectKey, m.installationId = $installationId, m.applicationId = $applicationId, m.tenantId = $tenantId,
  m.intentId = $intentId, m.intentDigest = $intentDigest, m.planRef = $planRef, m.planDigest = $planDigest
WITH m WHERE coalesce(m.status, 'failed') <> 'applied'
SET m.status = 'failed', m.attempts = $attempts, m.lastAttemptId = $attemptId, m.lastFailureCode = $code, m.executorVersion = $executorVersion, m.finishedAt = datetime()`,
        { markerKey: a.markerKey, effectKey: a.effectKey, ...a.scope, intentId: a.intentId, intentDigest: a.intentDigest, planRef: a.planRef, planDigest: a.planDigest, attempts: JSON.stringify(attempts), attemptId: a.attemptId, code: a.code, executorVersion: a.executorVersion },
      );
      return { attempts, appliedReceipt: null };
    });
  } catch {
    // The database may be unreachable; the caller still gets the failed receipt (the marker is reconciled later).
    return { attempts: [], appliedReceipt: null };
  }
}

async function reconcileUnresolved(client: GraphClient, markerKey: string, attemptId: string, unresolved: IngestionReceiptV2): Promise<IngestionReceiptV2> {
  try {
    const m = await client.read(async (tx) => {
      const res = await tx.run(`MATCH (m:${MARKER_LABEL} {markerKey: $markerKey}) RETURN m.status AS status, m.lastAttemptId AS last, m.receipt AS receipt`, { markerKey });
      return res.records[0] ? { status: res.records[0].get("status") as string, last: res.records[0].get("last") as string, receipt: res.records[0].get("receipt") as string | null } : null;
    });
    if (m && m.status === "applied" && m.last === attemptId && m.receipt) return { ...(JSON.parse(m.receipt) as IngestionReceiptV2), outcome: "applied" };
  } catch {
    /* still unresolved */
  }
  return unresolved;
}

// ---------------------------------------------------------------------------------------------
// Receipt lookup (scoped) and paginated complete effect verification
// ---------------------------------------------------------------------------------------------

export interface ReceiptLookup {
  found: boolean;
  status?: "applied" | "failed";
  receipt?: IngestionReceiptV2;
  attempts?: MarkerAttempt[];
  intentDigest?: string;
  planDigest?: string;
}

/** Receipt lookup by effect key within the caller's scope (the marker key derives from the scope; scope is re-verified). */
export async function getReceiptV2(client: GraphClient, scope: { installationId: string; applicationId: string; tenantId: string }, effectKey: string): Promise<ReceiptLookup> {
  const markerKey = markerKeyOf(scope, effectKey);
  return client.read(async (tx) => {
    const res = await tx.run(`MATCH (m:${MARKER_LABEL} {markerKey: $markerKey}) RETURN m {.*} AS m`, { markerKey });
    if (!res.records.length) return { found: false };
    const m = toJson(res.records[0]!.get("m")) as MarkerRow;
    if (m.installationId !== scope.installationId || m.applicationId !== scope.applicationId || m.tenantId !== scope.tenantId) return { found: false };
    return { found: true, status: m.status, ...(m.receipt ? { receipt: JSON.parse(m.receipt) as IngestionReceiptV2 } : {}), attempts: parseAttempts(m.attempts), intentDigest: m.intentDigest, planDigest: m.planDigest };
  });
}

/** Reads back every declared effect of a receipt, one page at a time (SPECIFICATION 7.4). */
export async function verifyEffects(client: GraphClient, schema: WriteSchema, receipt: IngestionReceiptV2, cursor = 0, pageSize = 100): Promise<VerifyEffectsPage> {
  const items = [...receipt.effects.nodes.map((n) => ({ kind: "node" as const, n })), ...receipt.effects.relationships.map((r) => ({ kind: "relationship" as const, r }))];
  const page = items.slice(cursor, cursor + pageSize);
  // The page accumulator lives inside the (retryable) managed transaction: a driver retry starts a fresh page.
  const out = await client.read(async (tx) => {
    const out: VerifyEffectsPage["items"] = [];
    for (const it of page) {
      if (it.kind === "node") {
        const e = it.n;
        const res = await tx.run(
          `MATCH (n:${q(e.label)} {uid: $uid})
OPTIONAL MATCH (n)-[:WAS_GENERATED_BY]->(act:Activity)
WITH n, collect(act.uid) AS acts
OPTIONAL MATCH (n)-[ev:HAS_EVIDENCE]->(l:SourceLocator) OPTIONAL MATCH (src:Source)-[:HAS_SNAPSHOT]->(:SourceSnapshot)-[:HAS_LOCATOR]->(l)
WITH n, acts, collect({loc: l.uid, chained: src IS NOT NULL, role: ev.role}) AS evidence
OPTIONAL MATCH (n)-[:HAS_SUBJECT]->(s) OPTIONAL MATCH (n)-[:ASSERTED_BY]->(w)
RETURN properties(n) AS props, acts, evidence, s.uid AS subjectUid, w.uid AS asserterUid`,
          { uid: e.uid },
        );
        const checks: Array<{ name: string; ok: boolean; detail?: string }> = [];
        if (!res.records.length) checks.push({ name: "exists", ok: false, detail: `${e.label} ${e.uid} not found` });
        else {
          const row = toJson(res.records[0]!.toObject()) as { props: Record<string, unknown>; acts: string[]; evidence: Array<{ loc: string | null; chained: boolean; role: string | null }>; subjectUid: string | null; asserterUid: string | null };
          checks.push({ name: "exists", ok: true });
          const missing = e.properties.filter((p) => row.props[p] === undefined || row.props[p] === null);
          checks.push({ name: "properties", ok: missing.length === 0, ...(missing.length ? { detail: `missing ${missing.join(", ")}` } : {}) });
          // A supersession close of an Assertion (recordedTo / status only) keeps its creating Activity as lineage; the closing
          // run is recorded on the superseding Assertion (supersedesUid), so no WAS_GENERATED_BY to this run is expected.
          const supersessionClose = e.label === "Assertion" && e.op === "update" && e.properties.every((p) => p === "recordedTo" || p === "status");
          if ((e.label !== "Activity" || e.op === "update") && !supersessionClose) checks.push({ name: "lineage", ok: row.acts.includes(receipt.activityUid ?? "") || (e.label === "Activity" && row.acts.length > 0) || e.label === "Activity", ...(row.acts.includes(receipt.activityUid ?? "") ? {} : { detail: `WAS_GENERATED_BY ${row.acts.join(", ") || "none"}` }) });
          if (e.label === "Assertion" && e.op === "create") {
            const ev = row.evidence.filter((x) => x.loc);
            checks.push({ name: "evidence-chain", ok: ev.length > 0 && ev.every((x) => x.chained) && ev.some((x) => x.role === "SUPPORTS"), detail: `${ev.length} span(s)` });
            checks.push({ name: "subject+asserter", ok: Boolean(row.subjectUid && row.asserterUid) });
          }
          if (e.properties.includes("recordedTo") && e.op === "update") checks.push({ name: "closed", ok: row.props.recordedTo !== undefined && row.props.recordedTo !== null });
        }
        out.push({ kind: "node", key: e.uid, ok: checks.every((c) => c.ok), checks });
      } else {
        const e = it.r;
        const checks: Array<{ name: string; ok: boolean; detail?: string }> = [];
        if (e.relationshipUid) {
          const res = await tx.run(
            `MATCH (a)-[r:${q(e.type)} {relationshipUid: $rel}]->(b)
OPTIONAL MATCH (x:Assertion {uid: r.assertionUid})
RETURN a.uid AS fromUid, b.uid AS toUid, r.recordedTo IS NULL AS open, r.assertionUid AS assertionUid, x.predicate AS predicate`,
            { rel: e.relationshipUid },
          );
          if (!res.records.length) checks.push({ name: "exists", ok: false, detail: `${e.type} ${e.relationshipUid} not found` });
          else {
            const row = toJson(res.records[0]!.toObject()) as Record<string, unknown>;
            checks.push({ name: "exists", ok: true });
            checks.push({ name: "endpoints", ok: row.fromUid === e.fromUid && row.toUid === e.toUid });
            if (e.op === "create") {
              checks.push({ name: "open", ok: row.open === true });
              checks.push({ name: "authorizing-assertion", ok: row.assertionUid === e.assertionUid && (row.predicate === e.type), detail: `predicate ${String(row.predicate)}` });
            } else checks.push({ name: "closed", ok: row.open === false });
          }
        } else {
          const fs = schema.nodeForUid(e.fromUid);
          const ts = schema.nodeForUid(e.toUid);
          const res = await tx.run(`MATCH (a${fs ? `:${q(fs.primaryLabel)}` : ""} {uid: $from})-[r:${q(e.type)}]->(b${ts ? `:${q(ts.primaryLabel)}` : ""} {uid: $to}) RETURN count(r) AS c`, { from: e.fromUid, to: e.toUid });
          const c = Number(toJson(res.records[0]!.get("c")));
          checks.push({ name: "exists", ok: c >= 1, detail: `${c} edge(s)` });
        }
        out.push({ kind: "relationship", key: e.key, ok: checks.every((c) => c.ok), checks });
      }
    }
    return out;
  });
  const next = cursor + page.length < items.length ? cursor + page.length : null;
  return { schemaVersion: "bks-effect-verification.v1", effectKey: receipt.effect.effectKey, receiptId: receipt.receiptId, total: items.length, cursor, nextCursor: next, complete: next === null, checked: page.length, failures: out.filter((x) => !x.ok).length, items: out };
}

export type { ApplyWitness };
export const receiptSemanticDigest = (r: IngestionReceiptV2) => {
  const { executedAt: _e, durationMs: _d, attempts: _a, attemptId: _i, ...rest } = r;
  return canonicalDigest(rest);
};
