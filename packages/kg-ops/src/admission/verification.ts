import { createHash } from "node:crypto";
import pg from "pg";

/**
 * The PostgreSQL authority of Biotech admission (Sprint V SV-11): the Knowledge Services common component
 * `knowledge_verification` (component 2.0.0) installed in the Biotech application PostgreSQL. Two ports:
 *
 *   OutboxAuthority       the dispatch outbox, the payload custody, the bound effect and the decision, used by the
 *                         DispatchConsumer with the component role knowledge_verification_outbox_worker
 *   EligibilityAuthority  use decisions + the authoritative revocation epoch, used by official reads (same role, or the
 *                         reader role): read-only
 *
 * The component owns every object; BKS never writes them except through the granted functions claim_dispatches,
 * acknowledge_dispatch and fail_dispatch. Tenant isolation is forced RLS on `app.tenant_id`; every call runs in its own
 * transaction with set_config('app.tenant_id', <tenant>, true). The DSN is read from the environment by NAME and never
 * printed (BKS_BIOTECH_DB_VERIFICATION_DSN; official reads may use BKS_BIOTECH_DB_VERIFICATION_READ_DSN).
 */

export type OutboxState = "pending" | "dispatched" | "acknowledged" | "failed" | "revoked" | "refused";

export interface OutboxRow {
  tenantId: string;
  dispatchId: string;
  effectKey: string;
  targetBinding: string;
  payloadDigest: string;
  state: OutboxState;
  attempts: number;
  availableAt: string;
  ackDigest: string | null;
  lastError: string | null;
  /** Enqueue order (dispatch_outbox.created_at); claimed rows are processed in this order. */
  createdAt: string;
  /**
   * Component 2.2.0 dispatch binding (null on a 2.1.0 component): how the acknowledgment digest is verified
   * (`ks-intent-marker.v1`: the precomputed `expected_marker_digest`; `bks-intent-marker-digest.v1`: the BKS-native
   * digest over this row's payload digest and the plan digest) and the fields the expected digest binds.
   */
  markerScheme?: string | null;
  expectedMarkerDigest?: string | null;
  boundEffectDigest?: string | null;
  useDecisionId?: string | null;
  revocationEpoch?: number | null;
  /** The acknowledgment record stored with the acknowledgment (2.2.0 `ack_record`). */
  ackRecord?: Record<string, unknown> | null;
}

/** The scheme the KS component precomputes at enqueue (component 2.2.0 `intent_marker_digest`). */
export const KS_INTENT_MARKER_SCHEME = "ks-intent-marker.v1" as const;
/** The BKS-native scheme (`markerDigestOf(payloadDigest, planDigest)`), verified by the component from the ack record. */
export const BKS_INTENT_MARKER_SCHEME = "bks-intent-marker-digest.v1" as const;

/**
 * knowledge_verification.intent_marker_digest (2.2.0), recomputed by BKS: sha256 over the UTF-8 text
 * "ks-intent-marker.v1 LF tenant LF dispatch_id LF effect_key LF bound_effect_digest LF use_decision_id LF revocation_epoch".
 * Null when the row lacks a bound field (it cannot be acknowledged under this scheme).
 */
export function ksIntentMarkerDigest(row: OutboxRow): string | null {
  if (!row.boundEffectDigest || !row.useDecisionId || row.revocationEpoch === null || row.revocationEpoch === undefined) return null;
  const text = [KS_INTENT_MARKER_SCHEME, row.tenantId, row.dispatchId, row.effectKey, row.boundEffectDigest, row.useDecisionId, String(row.revocationEpoch)].join("\n");
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

export interface PayloadArtifact {
  artifactId: string;
  digest: string;
  mediaType: string;
  custodyKind: "inline" | "bucket" | "volume" | "external";
  bytes: Buffer | null;
  custodyUri: string | null;
}

export interface EffectRecord {
  effectKey: string;
  semanticPayloadDigest: string;
  boundEffectDigest: string;
  originatingOriginDigest: string;
  /** knowledge_verification.origin.identity of the originating origin (null when the row is not visible). */
  originIdentity: unknown;
}

/** One use decision with the facts the exact-use predicate needs (mirrors admit_exact_use, component 0003). */
export interface DecisionRecord {
  useDecisionId: string;
  digest: string;
  disposition: "admitted" | "held" | "rejected";
  boundEffectDigest: string;
  revocationEpoch: number;
  expiresAt: string | null;
  useName: string;
  audience: string;
  subjectKind: string;
  subjectId: string;
  runId: string;
  superseded: boolean;
  invalidated: boolean;
  closureIncomplete: boolean;
  /**
   * The component's own verdict (knowledge_verification 2.2.0 `check_use_eligibility`: the one exact-use rule, including
   * review conditions and reviewer-grant liveness) for this decision's admitted effect. Always set by the PostgreSQL
   * authority; absent only in the in-memory fake, where `evaluateDecision` falls back to its local mirror.
   */
  component?: { state: "admitted" | "held" | "rejected"; reason: string } | null;
}

export interface DecisionLookup {
  authoritativeEpoch: number;
  records: Map<string, DecisionRecord>;
}

export interface EligibilityAuthority {
  decisions(tenantId: string, useDecisionIds: string[]): Promise<DecisionLookup>;
}

export interface OutboxAuthority extends EligibilityAuthority {
  claim(tenantId: string, limit: number, now?: Date): Promise<OutboxRow[]>;
  row(tenantId: string, dispatchId: string): Promise<OutboxRow | null>;
  payload(tenantId: string, digest: string): Promise<PayloadArtifact | null>;
  effect(tenantId: string, effectKey: string): Promise<EffectRecord | null>;
  /** `record` (2.2.0 `ack_record`) is passed only for a row that carries a marker scheme. */
  acknowledge(tenantId: string, dispatchId: string, ackDigest: string, now?: Date, record?: Record<string, unknown>): Promise<OutboxRow>;
  fail(tenantId: string, dispatchId: string, error: string, retryAfterSeconds: number): Promise<OutboxRow>;
  /**
   * Terminal not-applied settlement (component 2.2.0 `settle_dispatch`): the dispatch is closed as revoked with a
   * reason record instead of being parked for retry. Optional: a 2.1.0 component has no such function.
   */
  settle?(tenantId: string, dispatchId: string, outcome: "revoked" | "refused", detail: Record<string, unknown>): Promise<OutboxRow>;
  close(): Promise<void>;
}

/** Component error raised by a granted function (SQLSTATE + the component code in the message, e.g. DISPATCH_REVOKED). */
export class AuthorityError extends Error {
  constructor(readonly code: string, message: string, readonly sqlState: string | null = null) {
    super(message);
    this.name = "AuthorityError";
  }
}

/** The authority could not be reached or answered (connection, timeout, permission): callers hold. */
export class AuthorityUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorityUnavailableError";
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Exact-use evaluation (pure)
// ---------------------------------------------------------------------------------------------------------------

export type DecisionVerdict = { state: "eligible"; reason: "OK" } | { state: "revoked" | "stale"; reason: string };

/**
 * The exact-use predicate of knowledge_verification.admit_exact_use, evaluated over a read of the same rows (the
 * outbox worker and reader roles may not execute admit_exact_use): revoked = not found / digest or effect mismatch /
 * rejected / invalidated; stale = superseded / held / expired / invalidation closure incomplete.
 */
export function evaluateDecision(rec: DecisionRecord | undefined, expect: { digest?: string | null; boundEffectDigest?: string | null }, now: Date): DecisionVerdict {
  if (!rec) return { state: "revoked", reason: "DECISION_NOT_FOUND" };
  // The reference itself (the graph record or payload names this exact decision and effect): checked here.
  if (expect.digest && rec.digest !== expect.digest) return { state: "revoked", reason: "DECISION_DIGEST_MISMATCH" };
  if (expect.boundEffectDigest && rec.boundEffectDigest !== expect.boundEffectDigest) return { state: "revoked", reason: "EFFECT_DIGEST_MISMATCH" };
  // Current eligibility: ONE authority, the component rule (R1 F1). A review-conditioned decision whose reviewer grant
  // was revoked (REVIEW_REQUIRED) is no longer an authorized use: revoked, like a rejected or invalidated decision.
  if (rec.component) {
    const { state, reason } = rec.component;
    if (state === "admitted") return { state: "eligible", reason: "OK" };
    if (state === "rejected" || reason === "REVIEW_REQUIRED") return { state: "revoked", reason };
    return { state: "stale", reason };
  }
  // In-memory fake only (no component verdict): the local mirror of the same rule.
  if (rec.invalidated) return { state: "revoked", reason: "DECISION_INVALIDATED" };
  if (rec.disposition === "rejected") return { state: "revoked", reason: "DECISION_REJECTED" };
  if (rec.superseded) return { state: "stale", reason: "STALE_DECISION" };
  if (rec.disposition !== "admitted") return { state: "stale", reason: `DECISION_${rec.disposition.toUpperCase()}` };
  if (rec.expiresAt && Date.parse(rec.expiresAt) <= now.getTime()) return { state: "stale", reason: "DECISION_EXPIRED" };
  if (rec.closureIncomplete) return { state: "stale", reason: "INVALIDATION_CLOSURE_INCOMPLETE" };
  return { state: "eligible", reason: "OK" };
}

// ---------------------------------------------------------------------------------------------------------------
// PostgreSQL implementation
// ---------------------------------------------------------------------------------------------------------------

const CONNECTION_STATES = new Set(["08000", "08001", "08003", "08004", "08006", "57P01", "57P02", "57P03", "53300", "28000", "28P01", "3D000"]);

function classify(error: unknown): Error {
  const e = error as { code?: string; message?: string };
  const message = String(e?.message ?? error);
  const code = typeof e?.code === "string" ? e.code : null;
  const component = /^([A-Z][A-Z0-9_]{3,})/.exec(message)?.[1] ?? null;
  if (code && /^[0-9A-Z]{5}$/.test(code) && !CONNECTION_STATES.has(code) && component) return new AuthorityError(component, message, code);
  if (code === "42501" && !component) return new AuthorityUnavailableError(`verification authority refused the role: ${message}`);
  if (code && /^[0-9A-Z]{5}$/.test(code) && !CONNECTION_STATES.has(code)) return new AuthorityError(code, message, code);
  return new AuthorityUnavailableError(`verification authority unavailable: ${message.replace(/postgres(ql)?:\/\/[^\s]+/gi, "<dsn>")}`);
}

const iso = (v: unknown): string | null => (v === null || v === undefined ? null : v instanceof Date ? v.toISOString() : String(v));

function rowOf(r: Record<string, unknown>): OutboxRow {
  return {
    tenantId: String(r.tenant_id),
    dispatchId: String(r.dispatch_id),
    effectKey: String(r.effect_key),
    targetBinding: String(r.target_binding),
    payloadDigest: String(r.payload_digest),
    state: String(r.state) as OutboxState,
    attempts: Number(r.attempts),
    availableAt: iso(r.available_at) ?? "",
    ackDigest: (r.ack_digest as string | null) ?? null,
    lastError: (r.last_error as string | null) ?? null,
    createdAt: iso(r.created_at) ?? "",
    markerScheme: (r.marker_scheme as string | null | undefined) ?? null,
    expectedMarkerDigest: (r.expected_marker_digest as string | null | undefined) ?? null,
    boundEffectDigest: (r.bound_effect_digest as string | null | undefined) ?? null,
    useDecisionId: (r.use_decision_id as string | null | undefined) ?? null,
    revocationEpoch: r.revocation_epoch === null || r.revocation_epoch === undefined ? null : Number(r.revocation_epoch),
    ackRecord: r.ack_record && typeof r.ack_record === "object" ? (r.ack_record as Record<string, unknown>) : null,
  };
}

export interface PgAuthorityOptions {
  /** Connection string (never logged). */
  connectionString: string;
  /** Statement/connection timeout per call (ms). */
  timeoutMs?: number;
  max?: number;
  /** The dispatch target this consumer claims (default `biotech-graph`). */
  targetBinding?: string;
}

export class PgVerificationAuthority implements OutboxAuthority {
  private readonly targetBinding: string;
  private readonly pool: pg.Pool;

  constructor(opts: PgAuthorityOptions) {
    this.targetBinding = opts.targetBinding ?? "biotech-graph";
    const timeout = opts.timeoutMs ?? 5_000;
    this.pool = new pg.Pool({ connectionString: opts.connectionString, max: opts.max ?? 4, connectionTimeoutMillis: timeout, statement_timeout: timeout, query_timeout: timeout + 1_000, idleTimeoutMillis: 10_000, allowExitOnIdle: true });
    this.pool.on("error", () => undefined);
  }

  /** From the environment variable NAME (default BKS_BIOTECH_DB_VERIFICATION_DSN); null when it is not set. */
  static fromEnv(env: NodeJS.ProcessEnv = process.env, name = "BKS_BIOTECH_DB_VERIFICATION_DSN"): PgVerificationAuthority | null {
    const dsn = env[name]?.trim();
    if (!dsn) return null;
    return new PgVerificationAuthority({ connectionString: dsn, timeoutMs: Number(env.BKS_VERIFICATION_TIMEOUT_MS ?? 5_000) });
  }

  private async tx<T>(tenantId: string, fn: (c: pg.PoolClient) => Promise<T>): Promise<T> {
    let client: pg.PoolClient;
    try {
      client = await this.pool.connect();
    } catch (e) {
      throw classify(e);
    }
    try {
      await client.query("begin");
      await client.query("select set_config('app.tenant_id', $1, true)", [tenantId]);
      const out = await fn(client);
      await client.query("commit");
      return out;
    } catch (e) {
      await client.query("rollback").catch(() => undefined);
      throw e instanceof AuthorityError || e instanceof AuthorityUnavailableError ? e : classify(e);
    } finally {
      client.release();
    }
  }

  async claim(tenantId: string, limit: number, now?: Date): Promise<OutboxRow[]> {
    const sort = (rows: OutboxRow[]) => rows.sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : a.dispatchId < b.dispatchId ? -1 : 1));
    try {
      // 2.2.0: claim only this consumer's target binding (other targets' rows are never claimed or touched).
      return await this.tx(tenantId, async (c) => {
        const res = await c.query("select * from knowledge_verification.claim_dispatches($1::uuid, $2::integer, coalesce($3::timestamptz, now()), $4)", [tenantId, limit, now ? now.toISOString() : null, this.targetBinding]);
        return sort(res.rows.map(rowOf));
      });
    } catch (e) {
      // 42883: a 2.1.0 component has no target-filtered claim; the consumer then refuses foreign rows itself.
      if (!(e instanceof AuthorityError && (e.sqlState === "42883" || e.code === "42883"))) throw e;
    }
    return this.tx(tenantId, async (c) => {
      const res = now ? await c.query("select * from knowledge_verification.claim_dispatches($1::uuid, $2::integer, $3::timestamptz)", [tenantId, limit, now.toISOString()]) : await c.query("select * from knowledge_verification.claim_dispatches($1::uuid, $2::integer)", [tenantId, limit]);
      return sort(res.rows.map(rowOf));
    });
  }

  async row(tenantId: string, dispatchId: string): Promise<OutboxRow | null> {
    return this.tx(tenantId, async (c) => {
      const res = await c.query("select * from knowledge_verification.dispatch_outbox where tenant_id = $1::uuid and dispatch_id = $2", [tenantId, dispatchId]);
      return res.rows[0] ? rowOf(res.rows[0]) : null;
    });
  }

  async payload(tenantId: string, digest: string): Promise<PayloadArtifact | null> {
    return this.tx(tenantId, async (c) => {
      const res = await c.query("select artifact_id, digest, media_type, custody_kind, custody_uri, inline_bytes from knowledge_verification.artifact_custody where tenant_id = $1::uuid and digest = $2", [tenantId, digest]);
      const r = res.rows[0];
      if (!r) return null;
      return { artifactId: String(r.artifact_id), digest: String(r.digest), mediaType: String(r.media_type), custodyKind: r.custody_kind, bytes: r.inline_bytes ? Buffer.from(r.inline_bytes) : null, custodyUri: r.custody_uri ?? null };
    });
  }

  async effect(tenantId: string, effectKey: string): Promise<EffectRecord | null> {
    return this.tx(tenantId, async (c) => {
      const res = await c.query(
        `select e.effect_key, e.semantic_payload_digest, e.bound_effect_digest, e.originating_origin_digest, o.identity
           from knowledge_verification.effect e
           left join knowledge_verification.origin o on o.tenant_id = e.tenant_id and o.origin_digest = e.originating_origin_digest
          where e.tenant_id = $1::uuid and e.effect_key = $2`,
        [tenantId, effectKey],
      );
      const r = res.rows[0];
      if (!r) return null;
      return { effectKey: String(r.effect_key), semanticPayloadDigest: String(r.semantic_payload_digest), boundEffectDigest: String(r.bound_effect_digest), originatingOriginDigest: String(r.originating_origin_digest), originIdentity: r.identity ?? null };
    });
  }

  async decisions(tenantId: string, useDecisionIds: string[]): Promise<DecisionLookup> {
    return this.tx(tenantId, async (c) => {
      const epoch = await c.query("select knowledge_verification.current_revocation_epoch($1::uuid) as epoch", [tenantId]);
      const records = new Map<string, DecisionRecord>();
      const ids = [...new Set(useDecisionIds)].sort();
      if (ids.length) {
        const res = await c.query(
          `select d.use_decision_id, d.digest, d.disposition, d.bound_effect_digest, d.revocation_epoch, d.expires_at, d.use_name, d.audience,
                  d.subject_kind, d.subject_id, d.run_id,
                  exists (select 1 from knowledge_verification.use_decision s where s.tenant_id = d.tenant_id and s.supersedes_use_decision_id = d.use_decision_id) as superseded,
                  exists (select 1 from knowledge_verification.invalidation_affected a where a.tenant_id = d.tenant_id and a.affected_kind = 'use_decision' and a.affected_id = d.use_decision_id) as invalidated,
                  exists (select 1 from knowledge_verification.invalidation i where i.tenant_id = d.tenant_id and i.epoch > d.revocation_epoch and i.closure_processed_at is null) as closure_incomplete
             from knowledge_verification.use_decision d
            where d.tenant_id = $1::uuid and d.use_decision_id = any($2::text[])`,
          [tenantId, ids],
        );
        for (const r of res.rows) {
          records.set(String(r.use_decision_id), {
            useDecisionId: String(r.use_decision_id),
            digest: String(r.digest),
            disposition: r.disposition,
            boundEffectDigest: String(r.bound_effect_digest),
            revocationEpoch: Number(r.revocation_epoch),
            expiresAt: iso(r.expires_at),
            useName: String(r.use_name),
            audience: String(r.audience),
            subjectKind: String(r.subject_kind),
            subjectId: String(r.subject_id),
            runId: String(r.run_id),
            superseded: Boolean(r.superseded),
            invalidated: Boolean(r.invalidated),
            closureIncomplete: Boolean(r.closure_incomplete),
          });
        }
      }
      // The component's exact-use rule for each decision (review conditions and grant liveness included); a component
      // without check_use_eligibility (< 2.2.0) cannot answer: the authority is unavailable and official reads hold.
      for (const rec of records.values()) {
        let res;
        try {
          res = await c.query("select state, reason from knowledge_verification.check_use_eligibility($1::uuid, $2, $3)", [tenantId, rec.useDecisionId, rec.boundEffectDigest]);
        } catch (e) {
          if ((e as { code?: string }).code === "42883") throw new AuthorityUnavailableError("knowledge_verification.check_use_eligibility is not available (component < 2.2.0); eligibility cannot be established");
          throw e;
        }
        const v = res.rows[0];
        if (!v) throw new AuthorityUnavailableError(`check_use_eligibility returned no verdict for ${rec.useDecisionId}`);
        rec.component = { state: v.state, reason: String(v.reason) };
      }
      return { authoritativeEpoch: Number(epoch.rows[0]?.epoch ?? 0), records };
    });
  }

  async acknowledge(tenantId: string, dispatchId: string, ackDigest: string, now?: Date, record?: Record<string, unknown>): Promise<OutboxRow> {
    return this.tx(tenantId, async (c) => {
      // 2.2.0 rows (marker scheme set) use the 5-argument form with the acknowledgment record; 2.1.0 has only 3/4 args.
      const res = record
        ? await c.query("select * from knowledge_verification.acknowledge_dispatch($1::uuid, $2, $3, coalesce($4::timestamptz, now()), $5::jsonb)", [tenantId, dispatchId, ackDigest, now ? now.toISOString() : null, JSON.stringify(record)])
        : now
          ? await c.query("select * from knowledge_verification.acknowledge_dispatch($1::uuid, $2, $3, $4::timestamptz)", [tenantId, dispatchId, ackDigest, now.toISOString()])
          : await c.query("select * from knowledge_verification.acknowledge_dispatch($1::uuid, $2, $3)", [tenantId, dispatchId, ackDigest]);
      return rowOf(res.rows[0]);
    });
  }


  async fail(tenantId: string, dispatchId: string, error: string, retryAfterSeconds: number): Promise<OutboxRow> {
    return this.tx(tenantId, async (c) => {
      const res = await c.query("select * from knowledge_verification.fail_dispatch($1::uuid, $2, $3, make_interval(secs => $4::double precision))", [tenantId, dispatchId, error.slice(0, 2000), retryAfterSeconds]);
      return rowOf(res.rows[0]);
    });
  }

  async settle(tenantId: string, dispatchId: string, outcome: "revoked" | "refused", detail: Record<string, unknown>): Promise<OutboxRow> {
    return this.tx(tenantId, async (c) => {
      const res = await c.query("select * from knowledge_verification.settle_dispatch($1::uuid, $2, $3, $4::jsonb)", [tenantId, dispatchId, outcome, JSON.stringify(detail)]);
      return rowOf(res.rows[0]);
    });
  }

  async close(): Promise<void> {
    await this.pool.end().catch(() => undefined);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// In-memory fake (T0): the same state machine as component 0003 for the functions BKS calls.
// ---------------------------------------------------------------------------------------------------------------

export interface MemoryDispatch {
  row: OutboxRow;
  payload: PayloadArtifact;
  effect: EffectRecord;
}

export class MemoryVerificationAuthority implements OutboxAuthority {
  readonly rows = new Map<string, OutboxRow>();
  readonly payloads = new Map<string, PayloadArtifact>();
  readonly effects = new Map<string, EffectRecord>();
  readonly decisionsById = new Map<string, DecisionRecord>();
  epoch = 0;
  /** When set, every call throws AuthorityUnavailableError (authority outage). */
  unavailable = false;
  /** One-shot failure injection on the next acknowledge (lost acknowledgment). */
  failNextAcknowledge = false;
  readonly calls: string[] = [];

  private guard(name: string): void {
    this.calls.push(name);
    if (this.unavailable) throw new AuthorityUnavailableError("verification authority unavailable (fake outage)");
  }

  add(d: MemoryDispatch): void {
    this.rows.set(d.row.dispatchId, { ...d.row });
    this.payloads.set(d.payload.digest, d.payload);
    this.effects.set(d.effect.effectKey, d.effect);
  }

  async claim(_tenantId: string, limit: number, now: Date = new Date()): Promise<OutboxRow[]> {
    this.guard("claim");
    const out: OutboxRow[] = [];
    for (const r of [...this.rows.values()].sort((a, b) => (a.availableAt < b.availableAt ? -1 : 1))) {
      if (out.length >= limit) break;
      if ((r.state === "pending" || r.state === "dispatched") && Date.parse(r.availableAt) <= now.getTime()) {
        r.state = "dispatched";
        r.attempts += 1;
        r.availableAt = new Date(now.getTime() + 60_000).toISOString();
        out.push({ ...r });
      }
    }
    return out;
  }

  async row(_tenantId: string, dispatchId: string): Promise<OutboxRow | null> {
    this.guard("row");
    const r = this.rows.get(dispatchId);
    return r ? { ...r } : null;
  }

  async payload(_tenantId: string, digest: string): Promise<PayloadArtifact | null> {
    this.guard("payload");
    return this.payloads.get(digest) ?? null;
  }

  async effect(_tenantId: string, effectKey: string): Promise<EffectRecord | null> {
    this.guard("effect");
    return this.effects.get(effectKey) ?? null;
  }

  async decisions(_tenantId: string, ids: string[]): Promise<DecisionLookup> {
    this.guard("decisions");
    const records = new Map<string, DecisionRecord>();
    for (const id of ids) {
      const d = this.decisionsById.get(id);
      if (d) records.set(id, { ...d });
    }
    return { authoritativeEpoch: this.epoch, records };
  }

  async acknowledge(_tenantId: string, dispatchId: string, ackDigest: string, _now?: Date, record?: Record<string, unknown>): Promise<OutboxRow> {
    this.guard("acknowledge");
    if (this.failNextAcknowledge) {
      this.failNextAcknowledge = false;
      throw new AuthorityUnavailableError("acknowledgment lost (fake)");
    }
    const r = this.rows.get(dispatchId);
    if (!r) throw new AuthorityError("DISPATCH_NOT_FOUND", "DISPATCH_NOT_FOUND");
    if (r.state === "acknowledged") {
      if (r.ackDigest !== ackDigest) throw new AuthorityError("ACK_CONFLICT", "ACK_CONFLICT");
      return { ...r };
    }
    if (r.state === "revoked") throw new AuthorityError("DISPATCH_REVOKED", "DISPATCH_REVOKED");
    // 2.2.0 scheme verification (mirrors acknowledge_dispatch): only from dispatched; the digest must verify.
    if (r.markerScheme) {
      if (r.state !== "dispatched") throw new AuthorityError("DISPATCH_NOT_DISPATCHED", "DISPATCH_NOT_DISPATCHED");
      const expected = r.markerScheme === KS_INTENT_MARKER_SCHEME ? r.expectedMarkerDigest : null;
      if (r.markerScheme === KS_INTENT_MARKER_SCHEME && (expected === null || expected !== ackDigest)) throw new AuthorityError("MARKER_MISMATCH", "MARKER_MISMATCH");
      r.ackRecord = record ?? {};
    }
    r.state = "acknowledged";
    r.ackDigest = ackDigest;
    r.lastError = null;
    return { ...r };
  }

  async fail(_tenantId: string, dispatchId: string, error: string, retryAfterSeconds: number): Promise<OutboxRow> {
    this.guard("fail");
    const r = this.rows.get(dispatchId);
    if (!r || r.state !== "dispatched") throw new AuthorityError("DISPATCH_NOT_CLAIMED", "DISPATCH_NOT_CLAIMED");
    r.state = r.attempts >= 8 ? "failed" : "pending";
    r.lastError = error.slice(0, 2000);
    r.availableAt = new Date(Date.now() + retryAfterSeconds * 1000).toISOString();
    return { ...r };
  }

  /** knowledge_verification.settle_dispatch (2.2.0): terminal, idempotent, never after an acknowledgment. */
  async settle(_tenantId: string, dispatchId: string, outcome: "revoked" | "refused", detail: Record<string, unknown>): Promise<OutboxRow> {
    this.guard("settle");
    const r = this.rows.get(dispatchId);
    if (!r) throw new AuthorityError("DISPATCH_NOT_FOUND", "DISPATCH_NOT_FOUND");
    if (r.state === "acknowledged") throw new AuthorityError("DISPATCH_ALREADY_ACKNOWLEDGED", "DISPATCH_ALREADY_ACKNOWLEDGED");
    r.state = outcome;
    r.lastError = String(detail.reason ?? outcome).slice(0, 2000);
    return { ...r };
  }

  /** knowledge_verification.revoke_pending_dispatches */
  revokePending(effectKey: string): number {
    let n = 0;
    for (const r of this.rows.values()) if (r.effectKey === effectKey && (r.state === "pending" || r.state === "dispatched")) {
      r.state = "revoked";
      n++;
    }
    return n;
  }

  async close(): Promise<void> {}
}
