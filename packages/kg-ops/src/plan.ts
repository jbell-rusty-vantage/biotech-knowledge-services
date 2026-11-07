import {
  BksServiceError,
  canonicalDigest,
  INTENT_V2_DIGEST_PROFILE,
  IngestionIntentV2,
  PLAN_V2,
  PLAN_V2_DIGEST_PROFILE,
  type IngestionPlanV2,
} from "@bks/contracts";
import type { GraphClient } from "./neo4j.js";
import type { PlanStore, SnapshotCustody, StoredPlanRecord, VerificationCustody } from "./custody.js";
import { compile, type CompiledPlanBody } from "./write/compile.js";
import type { BasisCtx, PrincipalCtx, VerificationCtx } from "./write/context.js";
import { fetchObservations, Observations } from "./write/observations.js";
import type { WriteSchema } from "./write/release-model.js";

export const EXECUTOR_VERSION = "bks-kg-ops/2.0.0";

export interface PlannerDeps {
  schema: WriteSchema;
  plans: PlanStore;
  snapshots: SnapshotCustody;
  verifications: VerificationCustody;
}

export interface PlannerOptions {
  principal: PrincipalCtx;
  /** Injected planning clock (frozen into the plan). */
  now: () => Date;
  agentUid?: string;
  agentName?: string;
  executorVersion?: string;
  /** Read timeout for the observation transaction. */
  timeoutMs?: number;
}

export const DEFAULT_AGENT_UID = "hu:agent:bks-executor";

/** The intent's semantic digest (bks-canonical-json.v2 over the normalized intent; dependsOn/qualifier lists are sets). */
export function intentDigestOf(intent: IngestionIntentV2): string {
  return canonicalDigest(intent, INTENT_V2_DIGEST_PROFILE);
}

/** The plan digest: canonical v2 over the plan body (everything except schemaVersion / planRef / planDigest). */
export function planDigestOf(body: CompiledPlanBody): string {
  return canonicalDigest(body, PLAN_V2_DIGEST_PROFILE);
}

export function planRefOf(planDigest: string): string {
  return `pl-${planDigest.slice("sha256:".length, "sha256:".length + 40)}`;
}

/** Resolves the basis (custody-verified snapshot or creation-only) before planning (no transaction is held across custody calls). */
async function resolveBasis(deps: PlannerDeps, intent: IngestionIntentV2, principal: PrincipalCtx): Promise<BasisCtx> {
  if ("creationOnly" in intent.basis) {
    return { kind: "creationOnly", reason: intent.basis.creationOnly.reason, expectAbsent: [...intent.basis.creationOnly.expectAbsent].sort(), expectPresent: [...intent.basis.creationOnly.expectPresent].sort() };
  }
  const { ref, digest } = intent.basis.snapshotRef;
  try {
    const record = await deps.snapshots.verify(ref, digest, { scope: principal, schemaReleaseDigest: deps.schema.schemaReleaseDigest });
    return { kind: "snapshot", snapshotRef: ref, snapshotDigest: digest, snapshotGraphRevision: record.consistency.graphRevision, dependencies: record.dependencies, expectAbsent: [], expectPresent: [] };
  } catch (e) {
    const err = e instanceof BksServiceError ? { code: e.code, message: e.message } : { code: "BKS_SNAPSHOT_UNVERIFIED" as const, message: (e as Error).message };
    return { kind: "snapshot", snapshotRef: ref, snapshotDigest: digest, expectAbsent: [], expectPresent: [], error: err };
  }
}

async function hydrateVerifications(deps: PlannerDeps, intent: IngestionIntentV2): Promise<Map<string, VerificationCtx>> {
  const out = new Map<string, VerificationCtx>();
  for (const p of intent.proposals) {
    if (p.kind !== "adjudication") continue;
    const { ref, digest } = p.verificationRef;
    const key = `${ref}|${digest}`;
    if (out.has(key)) continue;
    try {
      out.set(key, { ref, digest, body: await deps.verifications.get(ref, digest) });
    } catch (e) {
      out.set(key, { ref, digest, error: e instanceof BksServiceError ? { code: e.code, message: e.message } : { code: "BKS_EVIDENCE_UNVERIFIED", message: (e as Error).message } });
    }
  }
  return new Map([...out.entries()].sort(([a], [b]) => (a < b ? -1 : 1)));
}

function assemble(body: CompiledPlanBody): IngestionPlanV2 {
  const planDigest = planDigestOf(body);
  return { schemaVersion: PLAN_V2, planRef: planRefOf(planDigest), planDigest, ...body };
}

/**
 * Plans an intent: normalize -> verify custody inputs -> probe the graph (one read transaction, until the compiler
 * asks for nothing new) -> compile (pure) -> digest -> store. Writes nothing to the graph.
 */
export async function planIntentV2(client: GraphClient, deps: PlannerDeps, intentInput: unknown, opts: PlannerOptions): Promise<IngestionPlanV2> {
  const parsed = IngestionIntentV2.safeParse(intentInput);
  if (!parsed.success) throw new BksServiceError("BKS_PARSE_REJECTED", "intent does not match biotech-knowledge-intent.v2", { issues: parsed.error.issues.slice(0, 50) as unknown as Record<string, unknown>[] });
  const intent = parsed.data;
  const intentDigest = intentDigestOf(intent);
  const plannedAt = opts.now().toISOString();
  const executorVersion = opts.executorVersion ?? EXECUTOR_VERSION;
  const agentUid = opts.agentUid ?? DEFAULT_AGENT_UID;
  const agentName = opts.agentName ?? "BellLabs knowledge executor";
  const basis = await resolveBasis(deps, intent, opts.principal);
  const verifications = await hydrateVerifications(deps, intent);

  // Every observation of a plan comes from ONE read transaction. The managed transaction may be retried by the driver
  // (transient errors), so the accumulator is created inside the callback: a retried attempt starts from an empty
  // observation set instead of inheriting keys a failed attempt cleared or values it read from another snapshot.
  const obs = await client.read(async (tx) => {
    const attempt = new Observations("probe");
    attempt.get("fence");
    for (let round = 0; round < 12; round++) {
      const keys = [...attempt.missing].sort();
      attempt.missing.clear();
      if (!keys.length) break;
      await fetchObservations(tx, deps.schema, attempt, keys);
      compile({ intent, intentDigest, schema: deps.schema, obs: attempt, plannedAt, executorVersion, agentUid, agentName, principal: opts.principal, basis, verifications });
      if (round === 11 && attempt.missing.size) throw new BksServiceError("BKS_LIMIT_EXCEEDED", "observation probing did not converge in 12 rounds");
    }
    return attempt;
  }, opts.timeoutMs ?? 30_000);

  const frozen = new Observations("frozen", obs.toJSON());
  const body = compile({ intent, intentDigest, schema: deps.schema, obs: frozen, plannedAt, executorVersion, agentUid, agentName, principal: opts.principal, basis, verifications });
  const plan = assemble(body);
  const record: StoredPlanRecord = {
    format: "bks-plan-record.v1",
    plan,
    frozen: {
      intent,
      observations: frozen.toJSON(),
      plannedAt,
      executorVersion,
      agentUid,
      agentName,
      principal: { ...opts.principal, grants: [...opts.principal.grants].sort() },
      basis,
      verifications: [...verifications.values()].map((v) => ({ ref: v.ref, digest: v.digest, ...(v.body ? { body: v.body } : {}), ...(v.error ? { error: v.error } : {}) })),
    },
    storedAt: plannedAt,
  };
  await deps.plans.put(record);
  return plan;
}

/**
 * Recompiles a stored plan from its frozen context and returns the recompiled plan. Apply refuses the stored plan
 * unless the recompilation reproduces it byte for byte (tampered custody or a non-compiler statement list = BKS_PLAN_FORGED).
 */
export function recompileStored(schema: WriteSchema, record: StoredPlanRecord): IngestionPlanV2 {
  const f = record.frozen;
  const intent = IngestionIntentV2.parse(f.intent);
  const obs = new Observations("frozen", f.observations);
  const verifications = new Map<string, VerificationCtx>(f.verifications.map((v) => [`${v.ref}|${v.digest}`, v as VerificationCtx]));
  let body: CompiledPlanBody;
  try {
    body = compile({ intent, intentDigest: intentDigestOf(intent), schema, obs, plannedAt: f.plannedAt, executorVersion: f.executorVersion, agentUid: f.agentUid, agentName: f.agentName, principal: f.principal, basis: f.basis, verifications });
  } catch (e) {
    throw new BksServiceError("BKS_PLAN_FORGED", `stored plan ${record.plan.planRef} cannot be recompiled from its frozen context: ${(e as Error).message}`);
  }
  return assemble(body);
}
