import type { ManagedTransaction, Transaction } from "neo4j-driver";
import { BksServiceError } from "@bks/contracts";
import { toJson, type GraphClient } from "./neo4j.js";
import { loadRelease, type ReleaseDdl } from "@bks/schema-workspace";
import { runOperationsCypher, type OperationsRunResult } from "./operations.js";
import type { WriteSchema } from "./write/release-model.js";

/**
 * Database-scoped canonical writer fence (SPECIFICATION 6.2 / 7.3, INTERFACES 6).
 *
 *   (:KsWriteFence {id: "canonical", graphRevision, lockSeq, lastEffectKey, lastWriterRunId, updatedAt})   exactly one
 *   (:KsRevocationFence {id: "canonical", generation, updatedAt})                                          local revocation fence
 *   (:KsReleaseMarker {releaseId, schemaReleaseDigest, installedAt, migrationRunId, ddlDigest})            written by the migrator
 *   (:KsIntentMarker {markerKey (unique), effectKey, installationId, applicationId, tenantId, intentId, intentDigest,
 *                     planRef, planDigest, status: applied|failed, attempts (JSON), receipt (JSON), receiptId, ...})
 *
 * Every canonical write transaction first takes the fence's write lock with a dependent property update
 * (`SET f.lockSeq = f.lockSeq + 1`), then validates; graphRevision advances by one only when graph effects commit.
 * Failure records also take the lock (they serialize with applies) but never advance graphRevision.
 *
 * Read side (for the reads role, `stable_revision` consistency): use `withStableRevision`. It runs the caller's
 * probes and dependency reads inside ONE explicit read transaction, reads the fence revision before and after, and
 * retries the whole read with fresh accumulators when the revision moved. The guarantee requires every canonical
 * writer and migrator to take this fence; unmanaged admin writes are outside it.
 */

export const FENCE_ID = "canonical";

/**
 * Release DDL (ddl/required.cypher, + ddl/enterprise.cypher on Enterprise) is the single DDL authority since
 * biotech-schema-v2.0.1: the operational names the writer needs (ks_write_fence_id, ks_revocation_fence_id,
 * ks_intent_marker_key, ks_release_marker_release_id, identifier_key, claim_proposition_hash, capture_subject,
 * activity_run, uid_<Label>, rel_<TYPE>_uid) are emitted by the schema authority. The writer keeps no statement list of
 * its own; `operationalDdlDrift` only cross-checks that the release still carries every name the writer relies on.
 */
export function releaseDdlStatements(ddl: ReleaseDdl, opts: { enterprise?: boolean; phase?: DdlPhase } = {}): string[] {
  return releaseDdlSelection(ddl, opts).statements;
}

/** `pre`: before migration (the migrator's first step); `post`: after migration; `all`: both (empty graphs, tests). */
export type DdlPhase = "pre" | "post" | "all";

export interface DdlSelection {
  phase: DdlPhase;
  enterprise: boolean;
  statements: string[];
  names: string[];
  /** Statements the release marks as not installable yet (e.g. `blocked-by-legacy-data`); never run, always reported. */
  blocked: Array<{ name: string; status: string; reason: string; enablingCondition?: string }>;
  counts: { pre: number; post: number; skippedEdition: number; skippedOptional: number };
}

/**
 * Selects the release DDL to run, from ddl.json (the statement list is the authority; the .cypher files are its
 * projections). Included: every `requirement: required` statement, plus `edition: enterprise` statements on an
 * Enterprise server. Community-only optional statements (vector indexes) are not part of the operational install.
 * Phase: `phase: post-migration` statements run in `post`; everything else (including v2.0.1 statements, which carry no
 * phase) runs in `pre`. Statements whose `status` is not active (`blocked-by-legacy-data`) are skipped and reported.
 */
export function releaseDdlSelection(ddl: ReleaseDdl, opts: { enterprise?: boolean; phase?: DdlPhase } = {}): DdlSelection {
  const phase = opts.phase ?? "all";
  const enterprise = Boolean(opts.enterprise);
  const sel: DdlSelection = { phase, enterprise, statements: [], names: [], blocked: [], counts: { pre: 0, post: 0, skippedEdition: 0, skippedOptional: 0 } };
  for (const raw of ddl.manifest.statements) {
    const st = raw as typeof raw & { phase?: string; status?: string; blockedReason?: string; enablingCondition?: string };
    const isEnterprise = st.edition === "enterprise";
    if (isEnterprise && !enterprise) {
      sel.counts.skippedEdition++;
      continue;
    }
    if (!isEnterprise && st.requirement !== "required") {
      sel.counts.skippedOptional++;
      continue;
    }
    const stPhase: "pre" | "post" = st.phase === "post-migration" ? "post" : "pre";
    if (phase !== "all" && stPhase !== phase) continue;
    if (st.status && st.status !== "active") {
      sel.blocked.push({ name: st.name, status: st.status, reason: st.blockedReason ?? "", ...(st.enablingCondition ? { enablingCondition: st.enablingCondition } : {}) });
      continue;
    }
    sel.statements.push(st.statement);
    sel.names.push(st.name);
    sel.counts[stPhase]++;
  }
  return sel;
}

/** Names of DDL rules the writer relies on (correctness: identity uniqueness, markers, fences; performance: lookups). */
export function writerDdlNames(schema?: WriteSchema): string[] {
  const names = ["ks_write_fence_id", "ks_revocation_fence_id", "ks_intent_marker_key", "ks_intent_marker_effect_key_lookup", "ks_release_marker_release_id", "identifier_key", "claim_proposition_hash", "capture_subject", "activity_run"];
  if (schema) {
    for (const n of schema.nodes.values()) names.push(`uid_${n.primaryLabel}`);
    for (const r of schema.rels.values()) if (r.relClass === "asserted") names.push(`rel_${r.type}_uid`);
  }
  return [...new Set(names)].sort();
}

/** Writer-required DDL names missing from the release DDL manifest (empty = no drift). */
export function operationalDdlDrift(ddl: ReleaseDdl, schema?: WriteSchema): string[] {
  const present = new Set(ddl.manifest.statements.filter((s) => s.requirement === "required").map((s) => s.name));
  return writerDdlNames(schema).filter((n) => !present.has(n));
}

/** Bootstrap statements of the release (both fences), falling back to the documented MERGE shapes. */
export function releaseBootstrap(ddl: ReleaseDdl | undefined): Array<{ name: string; cypher: string }> {
  const listed = (ddl?.manifest.bootstrap ?? []).filter((b): b is { name: string; cypher: string } => typeof b.name === "string" && typeof b.cypher === "string");
  if (listed.length) return listed;
  return [
    { name: "ks-write-fence", cypher: `MERGE (f:KsWriteFence {id: '${FENCE_ID}'}) ON CREATE SET f.graphRevision = 0, f.lockSeq = 0, f.updatedAt = datetime()` },
    { name: "ks-revocation-fence", cypher: `MERGE (r:KsRevocationFence {id: '${FENCE_ID}'}) ON CREATE SET r.generation = 0, r.updatedAt = datetime()` },
  ];
}

export async function isEnterprise(client: GraphClient): Promise<boolean> {
  const session = client.driver.session({ database: "system" });
  try {
    const res = await session.run("CALL dbms.components() YIELD edition RETURN edition");
    return res.records.some((r) => String(r.get("edition")).toLowerCase() === "enterprise");
  } catch {
    return false;
  } finally {
    await session.close();
  }
}

export interface EnsureOperationsResult extends OperationsRunResult {
  releaseId: string;
  enterprise: boolean;
  phase: DdlPhase;
  drift: string[];
  bootstrap: string[];
  /** Release statements not installed because the release marks them blocked (reported, never run). */
  blocked: DdlSelection["blocked"];
  counts: DdlSelection["counts"];
}

/**
 * Applies the release DDL (required, + enterprise on an Enterprise server) and the release bootstrap (both fences).
 * Tests, BKS_LOCAL_DEV and `kg ensure-operations` use it; production installs run the same statements through the
 * migrator. Throws when a statement fails (already-existing rules are skipped) or the release lacks a writer name.
 */
export async function ensureOperationalState(client: GraphClient, schema?: WriteSchema, opts: { enterprise?: boolean; ddl?: ReleaseDdl; releaseId?: string; phase?: DdlPhase } = {}): Promise<EnsureOperationsResult> {
  const ddl = opts.ddl ?? schema?.release.ddl ?? loadRelease().ddl;
  const releaseId = opts.releaseId ?? (opts.ddl ? ddl.manifest.releaseId : schema?.release.ddl ? schema.releaseId : ddl.manifest.releaseId);
  const enterprise = opts.enterprise ?? (await isEnterprise(client));
  const phase = opts.phase ?? "all";
  const drift = operationalDdlDrift(ddl, schema);
  if (drift.length) throw new Error(`release ${releaseId} DDL lacks writer-required rules: ${drift.join(", ")}`);
  const selection = releaseDdlSelection(ddl, { enterprise, phase });
  const run = await runOperationsCypher(client, selection.statements);
  if (run.failed.length) throw new Error(`release DDL failed: ${run.failed.slice(0, 3).map((f) => `${f.statement}: ${f.error}`).join(" | ")}`);
  // Indexes created above populate asynchronously; queries planned before they are ONLINE fall back to scans (the cold
  // path that once pushed a first plan / apply past its 30 s budget). Wait for them before the graph is used.
  const awaitSession = client.session("READ");
  try {
    await awaitSession.run("CALL db.awaitIndexes(300)");
  } finally {
    await awaitSession.close();
  }
  const result = { ...run, releaseId, enterprise, drift, phase, blocked: selection.blocked, counts: selection.counts };
  // Post-migration DDL only adds rules; the writer names and the fences are installed by the pre phase.
  if (phase === "post") return { ...result, bootstrap: [] };
  // A same-named rule of another shape (e.g. a pre-v2.0.1 CREATE INDEX claim_proposition_hash) is skipped as "already
  // exists" by IF NOT EXISTS; verify the writer names are present AS the release defines them (kind), not just by name.
  const kinds = new Map(ddl.manifest.statements.map((st) => [st.name, st.kind]));
  const present = await client.read(async (tx) => {
    const c = await tx.run("SHOW CONSTRAINTS YIELD name RETURN collect(name) AS names");
    const i = await tx.run("SHOW INDEXES YIELD name, owningConstraint WHERE owningConstraint IS NULL RETURN collect(name) AS names");
    return { constraint: new Set(c.records[0]!.get("names") as string[]), index: new Set(i.records[0]!.get("names") as string[]) };
  });
  const wrong = writerDdlNames(schema).filter((n) => !(kinds.get(n) === "constraint" ? present.constraint : present.index).has(n));
  if (wrong.length) throw new Error(`graph lacks release DDL rules (or holds a same-named rule of another kind): ${wrong.slice(0, 10).join(", ")}${wrong.length > 10 ? ` (+${wrong.length - 10})` : ""}`);
  const boot = releaseBootstrap(ddl);
  await client.write(async (tx) => {
    for (const b of boot) await tx.run(b.cypher);
  });
  return { ...result, bootstrap: boot.map((b) => b.name) };
}

/** Installs the release marker (the migrator's job after DDL + migration checks; provided for tests and local dev). */
export async function installReleaseMarker(client: GraphClient, release: { releaseId: string; schemaReleaseDigest: string; ddlDigest?: string }, migrationRunId: string, ddlDigest: string | null = null): Promise<void> {
  // The marker records the DDL identity it was installed with (Enterprise DDL requires KsReleaseMarker.ddlDigest): an
  // explicit digest, else the release identity, else the pinned release when it is the same release.
  let digest = ddlDigest ?? release.ddlDigest ?? null;
  if (!digest) {
    const pinned = loadRelease();
    if (pinned.schemaReleaseDigest === release.schemaReleaseDigest) digest = pinned.manifest.identities?.ddlDigest ?? pinned.pin?.ddlDigest ?? null;
  }
  ddlDigest = digest;
  await client.write(async (tx) => {
    await lockFence(tx);
    await tx.run(
      `MERGE (m:KsReleaseMarker {releaseId: $releaseId})
SET m.schemaReleaseDigest = $digest, m.installedAt = datetime(), m.migrationRunId = $migrationRunId, m.ddlDigest = $ddlDigest`,
      { releaseId: release.releaseId, digest: release.schemaReleaseDigest, migrationRunId, ddlDigest },
    );
  });
}

export interface FenceState {
  graphRevision: number;
  lockSeq: number;
  revocationGeneration: number;
  releaseDigests: string[];
  /** The release marker(s) with the greatest installedAt (more than one = ambiguous installation). */
  latestMarkers: ReleaseMarkerRow[];
}

export interface ReleaseMarkerRow {
  releaseId: string | null;
  schemaReleaseDigest: string | null;
  ddlDigest: string | null;
  installedAt: string | null;
}

function latestOf(rows: ReleaseMarkerRow[]): ReleaseMarkerRow[] {
  const t = (r: ReleaseMarkerRow) => (r.installedAt ? Date.parse(r.installedAt) : Number.NEGATIVE_INFINITY);
  const max = Math.max(...rows.map(t));
  return rows.filter((r) => t(r) === max);
}

/**
 * Release-marker rule (same as the GraphQL readiness check): the marker with the greatest installedAt must carry the
 * served releaseId, schemaReleaseDigest and (when known) ddlDigest; a tie on the greatest installedAt is refused.
 * Returns null when the graph is installed with the served release, else the refusal reason.
 */
export function releaseMarkerVerdict(latest: ReleaseMarkerRow[], expected: { releaseId: string; schemaReleaseDigest: string; ddlDigest?: string | null }): string | null {
  if (!latest.length) return `the graph has no KsReleaseMarker (served release ${expected.releaseId})`;
  if (latest.length > 1) return `${latest.length} KsReleaseMarker nodes share the latest installedAt ${latest[0]!.installedAt ?? "null"}; the installed release is ambiguous`;
  const m = latest[0]!;
  if (m.releaseId !== expected.releaseId || m.schemaReleaseDigest !== expected.schemaReleaseDigest) return `the latest KsReleaseMarker is ${m.releaseId ?? "?"} (${m.schemaReleaseDigest ?? "?"}); the executor serves ${expected.releaseId} (${expected.schemaReleaseDigest})`;
  if (expected.ddlDigest && m.ddlDigest !== expected.ddlDigest) return `the latest KsReleaseMarker records ddlDigest ${m.ddlDigest ?? "none"}; the served release has ${expected.ddlDigest}`;
  return null;
}

/** Takes the canonical writer lock (dependent property update) and returns the fence state as of the lock. */
export async function lockFence(tx: Transaction | ManagedTransaction): Promise<FenceState> {
  // 1. Exclusive lock with a write that reads nothing (no shared lock to upgrade, so concurrent writers queue instead
  //    of deadlocking on a shared->exclusive upgrade). 2. Under the held lock: the dependent update and a fresh read of
  //    the committed fence state (read committed: it now includes every writer that committed before us).
  const locked = await tx.run(`MATCH (f:KsWriteFence {id: $id}) SET f.locked = true RETURN count(f) AS c`, { id: FENCE_ID });
  if (Number(toJson(locked.records[0]?.get("c")) ?? 0) !== 1) throw new BksServiceError("BKS_RELEASE_MISMATCH", "KsWriteFence is not installed; the migrator (or BKS_LOCAL_DEV bootstrap) must create it before canonical writes");
  const res = await tx.run(
    `MATCH (f:KsWriteFence {id: $id})
SET f.lockSeq = coalesce(f.lockSeq, 0) + 1
WITH f
OPTIONAL MATCH (rv:KsRevocationFence {id: $id})
OPTIONAL MATCH (m:KsReleaseMarker)
RETURN f.graphRevision AS graphRevision, f.lockSeq AS lockSeq, coalesce(rv.generation, 0) AS gen, collect(DISTINCT m.schemaReleaseDigest) AS digests,
  [x IN collect(m) | {releaseId: x.releaseId, schemaReleaseDigest: x.schemaReleaseDigest, ddlDigest: x.ddlDigest, installedAt: toString(x.installedAt)}] AS markers`,
    { id: FENCE_ID },
  );
  if (!res.records.length) throw new BksServiceError("BKS_RELEASE_MISMATCH", "KsWriteFence is not installed; the migrator (or BKS_LOCAL_DEV bootstrap) must create it before canonical writes");
  const r = res.records[0]!;
  return {
    graphRevision: Number(toJson(r.get("graphRevision")) ?? 0),
    lockSeq: Number(toJson(r.get("lockSeq")) ?? 0),
    revocationGeneration: Number(toJson(r.get("gen")) ?? 0),
    releaseDigests: (toJson(r.get("digests")) as string[]).sort(),
    latestMarkers: latestOf(toJson(r.get("markers")) as ReleaseMarkerRow[]),
  };
}

/** Advances graphRevision under the lock already held; called once per committed effect. */
export async function advanceRevision(tx: Transaction, effectKey: string, runId: string): Promise<number> {
  const res = await tx.run(
    `MATCH (f:KsWriteFence {id: $id}) SET f.graphRevision = f.graphRevision + 1, f.lastEffectKey = $effectKey, f.lastWriterRunId = $runId, f.updatedAt = datetime() RETURN f.graphRevision AS rev`,
    { id: FENCE_ID, effectKey, runId },
  );
  return Number(toJson(res.records[0]!.get("rev")));
}

/** Delivers a revocation to the local fence (generation only moves forward). Serialized with applies by the writer lock. */
export async function deliverRevocation(client: GraphClient, generation: number): Promise<number> {
  return client.write(async (tx) => {
    await lockFence(tx);
    const res = await tx.run(
      `MATCH (r:KsRevocationFence {id: $id}) SET r.generation = CASE WHEN r.generation >= $g THEN r.generation ELSE $g END, r.updatedAt = datetime() RETURN r.generation AS g`,
      { id: FENCE_ID, g: generation },
    );
    return Number(toJson(res.records[0]!.get("g")));
  });
}

/** Read-only probe of the fence (no lock). */
export async function readFence(tx: Transaction | ManagedTransaction): Promise<FenceState | null> {
  const res = await tx.run(
    `OPTIONAL MATCH (f:KsWriteFence {id: $id}) OPTIONAL MATCH (rv:KsRevocationFence {id: $id}) OPTIONAL MATCH (m:KsReleaseMarker)
RETURN f IS NOT NULL AS has, f.graphRevision AS graphRevision, f.lockSeq AS lockSeq, coalesce(rv.generation, 0) AS gen, collect(DISTINCT m.schemaReleaseDigest) AS digests,
  [x IN collect(m) | {releaseId: x.releaseId, schemaReleaseDigest: x.schemaReleaseDigest, ddlDigest: x.ddlDigest, installedAt: toString(x.installedAt)}] AS markers`,
    { id: FENCE_ID },
  );
  const r = res.records[0]!;
  if (!r.get("has")) return null;
  return { graphRevision: Number(toJson(r.get("graphRevision")) ?? 0), lockSeq: Number(toJson(r.get("lockSeq")) ?? 0), revocationGeneration: Number(toJson(r.get("gen")) ?? 0), releaseDigests: (toJson(r.get("digests")) as string[]).sort(), latestMarkers: latestOf(toJson(r.get("markers")) as ReleaseMarkerRow[]) };
}

/**
 * Read-side hook for `stable_revision` reads (reads role). `fn` receives the open read transaction and MUST allocate
 * its accumulators inside the call (each attempt starts empty; rows of an abandoned attempt are discarded).
 * Returns the result with the revision it is stable at, or throws BKS_STALE_REVISION after `maxAttempts`.
 */
export async function withStableRevision<T>(client: GraphClient, fn: (tx: Transaction, attempt: number) => Promise<T>, opts: { maxAttempts?: number; timeoutMs?: number; bookmarks?: string[]; /** Records pulled per batch (e.g. rowCap + 1 for capped reads; driver default 1000). */ fetchSize?: number } = {}): Promise<{ result: T; graphRevision: number; attempts: number; bookmarks: string[] }> {
  const max = opts.maxAttempts ?? 3;
  for (let attempt = 1; attempt <= max; attempt++) {
    const session = client.driver.session({ database: client.config.database, defaultAccessMode: "READ", ...(opts.bookmarks?.length ? { bookmarks: opts.bookmarks } : {}), ...(opts.fetchSize ? { fetchSize: opts.fetchSize } : {}) });
    const tx = await session.beginTransaction(opts.timeoutMs ? { timeout: opts.timeoutMs } : undefined);
    try {
      const before = await readFence(tx);
      if (!before) throw new BksServiceError("BKS_RELEASE_MISMATCH", "KsWriteFence is not installed; stable_revision reads are unavailable");
      const result = await fn(tx, attempt);
      const after = await readFence(tx);
      await tx.commit();
      const bookmarks = session.lastBookmarks();
      if (after && after.graphRevision === before.graphRevision) return { result, graphRevision: before.graphRevision, attempts: attempt, bookmarks };
    } catch (e) {
      try {
        await tx.rollback();
      } catch {
        /* closed */
      }
      throw e;
    } finally {
      await session.close();
    }
  }
  throw new BksServiceError("BKS_STALE_REVISION", `graph revision kept moving during ${max} stable_revision read attempts`);
}

export interface WriterReadiness {
  ready: boolean;
  checks: Array<{ name: string; ok: boolean; detail?: string }>;
  releaseId: string;
  schemaReleaseDigest: string;
}

async function within<T>(ms: number, p: Promise<T>): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([p, new Promise<T>((_, reject) => (timer = setTimeout(() => reject(new Error(`no answer within ${ms} ms`)), ms)))]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Liveness probe of the database connection (bounded). */
export async function databaseReachable(client: GraphClient, timeoutMs = 2_000): Promise<boolean> {
  try {
    await within(timeoutMs, client.driver.verifyConnectivity({ database: client.config.database }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Writer readiness (same semantics as the GraphQL API's /readyz): (1) the database answers, (2) the latest
 * KsReleaseMarker is the served release (releaseMarkerVerdict), (3) the writer fences exist and every writer-required
 * DDL rule is present and ONLINE. Never creates anything.
 */
export async function checkWriterReadiness(client: GraphClient, schema: WriteSchema, timeoutMs = 3_000): Promise<WriterReadiness> {
  const out: WriterReadiness = { ready: false, checks: [], releaseId: schema.releaseId, schemaReleaseDigest: schema.schemaReleaseDigest };
  if (!(await databaseReachable(client, timeoutMs))) {
    out.checks.push({ name: "database", ok: false, detail: "unreachable" });
    return out;
  }
  out.checks.push({ name: "database", ok: true });
  try {
    const state = await within(timeoutMs, client.read(async (tx) => {
      const fence = await readFence(tx);
      const idx = await tx.run("SHOW INDEXES YIELD name, state RETURN collect({name: name, state: state}) AS idx");
      const cons = await tx.run("SHOW CONSTRAINTS YIELD name RETURN collect(name) AS names");
      return { fence, idx: toJson(idx.records[0]!.get("idx")) as Array<{ name: string; state: string }>, cons: new Set(toJson(cons.records[0]!.get("names")) as string[]) };
    }, timeoutMs));
    out.checks.push({ name: "writer-fence", ok: state.fence !== null, ...(state.fence ? {} : { detail: "KsWriteFence missing" }) });
    const verdict = state.fence ? releaseMarkerVerdict(state.fence.latestMarkers, { releaseId: schema.releaseId, schemaReleaseDigest: schema.schemaReleaseDigest, ddlDigest: schema.release.ddlDigest ?? null }) : "no fence";
    out.checks.push({ name: "release-marker", ok: verdict === null, ...(verdict ? { detail: verdict } : {}) });
    const online = new Map(state.idx.map((i) => [i.name, i.state]));
    const missing = writerDdlNames(schema).filter((n) => !state.cons.has(n) && online.get(n) !== "ONLINE");
    out.checks.push({ name: "writer-ddl", ok: missing.length === 0, ...(missing.length ? { detail: `missing or not ONLINE: ${missing.slice(0, 10).join(", ")}` } : {}) });
  } catch (e) {
    out.checks.push({ name: "graph-state", ok: false, detail: (e as Error).message.slice(0, 200) });
  }
  out.ready = out.checks.every((c) => c.ok);
  return out;
}
