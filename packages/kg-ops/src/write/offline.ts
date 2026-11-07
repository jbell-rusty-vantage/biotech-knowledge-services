import { IngestionIntentV2, type IngestionPlanV2 } from "@bks/contracts";
import { intentDigestOf, planDigestOf, planRefOf, EXECUTOR_VERSION, DEFAULT_AGENT_UID } from "../plan.js";
import { compile } from "./compile.js";
import type { BasisCtx, PrincipalCtx, VerificationCtx } from "./context.js";
import { Observations } from "./observations.js";
import type { WriteSchema } from "./release-model.js";

/**
 * Offline planning against an EMPTY graph (every observation absent, fence at revision 0): the same pure compiler,
 * with a deterministic in-memory observer. Used by unit tests (no Docker) and the fixture matrix; integration tests
 * plan the same intents against a real disposable Neo4j.
 */
export function planOffline(schema: WriteSchema, intentInput: unknown, opts: { principal: PrincipalCtx; plannedAt: string; seed?: Record<string, unknown>; verifications?: Map<string, VerificationCtx> }): { plan: IngestionPlanV2; observations: Record<string, unknown> } {
  const intent = IngestionIntentV2.parse(intentInput);
  const intentDigest = intentDigestOf(intent);
  const basis: BasisCtx = "creationOnly" in intent.basis
    ? { kind: "creationOnly", reason: intent.basis.creationOnly.reason, expectAbsent: [...intent.basis.creationOnly.expectAbsent].sort(), expectPresent: [...intent.basis.creationOnly.expectPresent].sort() }
    : { kind: "snapshot", snapshotRef: intent.basis.snapshotRef.ref, snapshotDigest: intent.basis.snapshotRef.digest, expectAbsent: [], expectPresent: [], error: { code: "BKS_SNAPSHOT_UNVERIFIED", message: "offline planning has no custody" } };
  const obs = new Observations("probe", { fence: { exists: true, graphRevision: 0, revocationGeneration: 0, releaseDigests: [schema.schemaReleaseDigest] }, ...(opts.seed ?? {}) });
  const input = { intent, intentDigest, schema, plannedAt: opts.plannedAt, executorVersion: EXECUTOR_VERSION, agentUid: DEFAULT_AGENT_UID, agentName: "BellLabs knowledge executor", principal: opts.principal, basis, verifications: opts.verifications ?? new Map() };
  for (let round = 0; round < 12; round++) {
    obs.missing.clear();
    compile({ ...input, obs });
    if (!obs.missing.size) break;
    for (const k of obs.missing) obs.set(k, null);
  }
  const frozen = new Observations("frozen", obs.toJSON());
  const body = compile({ ...input, obs: frozen });
  const planDigest = planDigestOf(body);
  return { plan: { schemaVersion: "biotech-knowledge-plan.v2", planRef: planRefOf(planDigest), planDigest, ...body }, observations: frozen.toJSON() };
}
