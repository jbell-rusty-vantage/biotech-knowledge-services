import { randomUUID } from "node:crypto";
import type { Transaction } from "neo4j-driver";
import { BksServiceError, canonicalDigest, canonicalize, CUSTODY_SNAPSHOT_V1, rawBytesDigest, type ReadResultStatus } from "@bks/contracts";
import { withStableRevision } from "../fence.js";
import type { GraphClient } from "../neo4j.js";
import type { SnapshotCustody } from "../custody.js";
import { checkCypherRead, CYPHER_PARSER, CYPHER_READ_POLICY, FORBIDDEN_PLAN_OPERATORS, planOperators, statementDigestOf } from "./cypher-policy.js";
import { CYPHER_READ_INTENT_V1, CypherReadIntentV1, READ_EXPLAIN_V1, READ_INTENT_V2, READ_RESULT_V2, READ_VALUES_V1, ReadIntentV2, type CypherReadIntentV1Input, type ExplainResultV1, type ReadIntentV2Input, type ReadLimits, type ReadPart, type ReadReason, type ReadResultV2 } from "./contracts.js";
import { CatalogTemplates, type CatalogTemplate } from "./templates.js";
import { TypedCompiler, type CompiledOp } from "./typed.js";
import { READ_INTENT_V3, READ_RESULT_V3, ReadIntentV3, type ReadIntentV3Input, type ReadPartV3, type ReadResultV3, type TypedOperation } from "@bks/contracts";
import type { EligibilityAuthority } from "../admission/verification.js";
import { applyEligibility, compileMarker, lookupDecisions } from "./eligibility.js";
import { bindParameter, normalizeValue, ValueLimitError } from "./values.js";
import { READ_VISIBILITY_POLICY, type ReadModel, type ReadScope } from "./visibility.js";

/**
 * Native read service (S4): typed reads v2, governed Cypher read artifacts and catalog templates through ONE path:
 * authorization (binding + scope), bounds, streaming execution in one explicit read transaction, truthful consistency
 * (observed | stable_revision), bks-read-values.v1 serialization, the digest triple and snapshot custody.
 */

export interface ReadBinding {
  ref: string;
  scope: ReadScope;
  client: GraphClient;
  /** `database-role`: the database principal is proven read-only (Enterprise role); `session-routing`: READ routing only (Community, admin principals). */
  readAuthority: "database-role" | "session-routing";
  /** `database-rbac`: the database principal's privileges enforce this scope's visibility (Enterprise fine-grained roles); `application`: typed reads / audited templates only. */
  visibility: "database-rbac" | "application";
  description?: string;
}

export interface ReadPrincipal {
  principalId: string;
  installationId: string;
  applicationId: string;
  tenantId: string;
  role: "reader" | "writer" | "admin";
  grants: string[];
}

/** Test hooks at the execution boundary (never configured in production). */
export interface ReadFaults {
  /** Called inside each attempt after a part streamed its rows (before the next part / commit). May throw (e.g. a transient error) or write. */
  afterPart?: (ctx: { attempt: number; partIndex: number; rowsSoFar: number }) => Promise<void>;
}

export interface ReadServiceConfig {
  model: ReadModel;
  bindings: ReadBinding[];
  /** Binding used when an intent names none: `public` scope by default. */
  defaultBindingRef?: string;
  snapshots?: SnapshotCustody | null;
  issuer?: string;
  workspaceFingerprint?: string | null;
  maxConcurrent?: number;
  maxConcurrentPerPrincipal?: number;
  /** Attempts for transient database failures (each attempt starts with empty accumulators). */
  transientAttempts?: number;
  faults?: ReadFaults;
  now?: () => Date;
  /** PostgreSQL eligibility authority for official-use reads (biotech-knowledge-read-intent.v3); null: official reads hold. */
  eligibility?: EligibilityAuthority | null;
}

export const READ_SERVICE_VERSION = "bks-read-service/2.0.0" as const;

class Semaphore {
  private active = 0;
  private readonly perKey = new Map<string, number>();
  constructor(private readonly max: number, private readonly maxPerKey: number) {}
  tryAcquire(key: string): (() => void) | null {
    const k = this.perKey.get(key) ?? 0;
    if (this.active >= this.max || k >= this.maxPerKey) return null;
    this.active++;
    this.perKey.set(key, k + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.active--;
      this.perKey.set(key, (this.perKey.get(key) ?? 1) - 1);
    };
  }
  async acquire(key: string, waitMs: number): Promise<(() => void) | null> {
    const deadline = Date.now() + waitMs;
    for (;;) {
      const r = this.tryAcquire(key);
      if (r || Date.now() >= deadline) return r;
      await new Promise((res) => setTimeout(res, 10));
    }
  }
}

const STATUS_RANK: Record<ReadResultStatus, number> = { forbidden: 7, failed: 6, stale: 5, unsupported: 4, skipped: 3, truncated: 2, ok: 1, empty: 0 };

function isTransient(e: unknown): boolean {
  const code = String((e as { code?: string }).code ?? "");
  return code.startsWith("Neo.TransientError") || code === "ServiceUnavailable" || code === "SessionExpired" || (e as { retriable?: boolean }).retriable === true;
}

function dbReason(e: unknown, timedOut: boolean): { status: ReadResultStatus; reason: ReadReason } {
  const code = String((e as { code?: string }).code ?? "");
  const msg = String((e as Error).message ?? e).split("\n")[0]!.slice(0, 500);
  if (timedOut || /TransactionTimedOut|Terminated/.test(code)) return { status: "failed", reason: { code: "TIMEOUT", message: `deadline exceeded: ${msg}` } };
  if (code.startsWith("Neo.ClientError.Security")) return { status: "forbidden", reason: { code: "DATABASE_FORBIDDEN", message: `the database principal refused the statement (${code}): ${msg}` } };
  return { status: "failed", reason: { code: "DATABASE_ERROR", message: `${code || "error"}: ${msg}` } };
}

interface PartPlan {
  opId: string;
  op: string;
  refused?: { status: ReadResultStatus; reasons: ReadReason[] };
  steps: Array<{ statement: string; params: Record<string, unknown>; rowCap?: number; perStep?: boolean; post?: (rows: Array<Record<string, unknown>>) => Array<Record<string, unknown>> }>;
  expectColumns?: string[];
  finish?: (rows: Array<Record<string, unknown>>) => Array<Record<string, unknown>>;
  annotations?: Record<string, unknown>;
  explainFirst?: boolean;
}

interface AttemptOutput {
  parts: ReadPart[];
  /** a database error aborted the explicit transaction (later parts are skipped; the transaction is rolled back, not committed) */
  aborted: boolean;
  plans: Record<string, unknown>;
  bytes: number;
}

export class ReadService {
  readonly model: ReadModel;
  readonly catalog: CatalogTemplates;
  private readonly bindings = new Map<string, ReadBinding>();
  private readonly sem: Semaphore;
  private readonly serverInfo = new Map<string, { agent: string | null; edition: string | null }>();

  constructor(readonly config: ReadServiceConfig) {
    this.model = config.model;
    this.catalog = new CatalogTemplates(config.model);
    for (const b of config.bindings) this.bindings.set(b.ref, b);
    this.sem = new Semaphore(config.maxConcurrent ?? 8, config.maxConcurrentPerPrincipal ?? 4);
  }

  private now(): Date {
    return this.config.now?.() ?? new Date();
  }

  /** Bindings a principal may use: public-scope bindings for every reader; internal scope needs grant `read.internal` (or an admin). */
  bindingsFor(principal: ReadPrincipal): ReadBinding[] {
    return [...this.bindings.values()].filter((b) => b.scope === "public" || principal.role === "admin" || principal.grants.includes("read.internal"));
  }

  private resolveBinding(principal: ReadPrincipal, ref: string | undefined): ReadBinding | ReadReason {
    const wanted = ref ?? this.config.defaultBindingRef ?? [...this.bindings.values()].find((b) => b.scope === "public")?.ref ?? [...this.bindings.keys()][0];
    const b = wanted ? this.bindings.get(wanted) : undefined;
    if (!b) return { code: "BINDING_FORBIDDEN", message: `no read binding ${wanted ?? "(none configured)"}` };
    if (!this.bindingsFor(principal).includes(b)) return { code: "BINDING_FORBIDDEN", message: `binding ${b.ref} (scope ${b.scope}) is not granted to principal ${principal.principalId}; scope internal needs grant read.internal` };
    return b;
  }

  /** Release pins: the current schemaReleaseDigest, or a parent release with byte-identical SDL (release readCompatibility rule). */
  private pinReason(pins: { schemaReleaseDigest: string; queryCatalogDigest?: string | undefined }, template?: CatalogTemplate): ReadReason | null {
    const accepted = new Set([this.model.schemaReleaseDigest]);
    const parent = (this.model.release.manifest as unknown as { parentRelease?: { schemaDigest?: string; schemaReleaseDigest?: string } }).parentRelease;
    if (parent?.schemaReleaseDigest && parent.schemaDigest === this.model.schemaDigest) accepted.add(parent.schemaReleaseDigest);
    if (!accepted.has(pins.schemaReleaseDigest)) return { code: "RELEASE_MISMATCH", message: `artifact pins schemaReleaseDigest ${pins.schemaReleaseDigest}; this service reads ${this.model.releaseId} (${this.model.schemaReleaseDigest}) and accepts only read-compatible releases` };
    if (pins.queryCatalogDigest && pins.queryCatalogDigest !== this.model.queryCatalogDigest && !template) return { code: "CATALOG_MISMATCH", message: `artifact pins queryCatalogDigest ${pins.queryCatalogDigest}; served catalog is ${this.model.queryCatalogDigest}` };
    return null;
  }

  // ------------------------------------------------------------------------------------------------------------
  // Public entry points
  // ------------------------------------------------------------------------------------------------------------

  async typed(input: ReadIntentV2Input | unknown, principal: ReadPrincipal): Promise<ReadResultV2> {
    const intent = ReadIntentV2.parse(input);
    const binding = this.resolveBinding(principal, intent.bindingRef);
    const scope: ReadScope = "ref" in binding ? binding.scope : "public";
    const compiler = new TypedCompiler(this.model, scope, intent.limits);
    const plans: PartPlan[] = intent.operations.map((op) => {
      const c: CompiledOp = compiler.compile(op);
      return { opId: c.opId, op: c.op, steps: c.steps, ...(c.refused ? { refused: c.refused } : {}), ...(c.op === "resolve" ? { finish: TypedCompiler.finishResolve } : {}), ...(c.annotations ? { annotations: c.annotations } : {}) };
    });
    const query = { kind: READ_INTENT_V2, operations: intent.operations, statementDigest: null, templateId: null, parameters: {} as Record<string, unknown> };
    return this.run(intent, principal, binding, plans, query, "operation", null);
  }

  /**
   * biotech-knowledge-read-intent.v3 (SV-11): v2 typed operations + `marker`, with the Activity admission fields. For an
   * official use (use.officialUse, or a use name `official.*`) every report / assertion / marker row is revalidated
   * against the PostgreSQL authority: ineligible rows are excluded; authority unavailable holds (nothing served as
   * eligible). Non-official v3 reads are the v2 answer plus the admission fields.
   */
  async typedV3(input: ReadIntentV3Input | unknown, principal: ReadPrincipal, authority: EligibilityAuthority | null = this.config.eligibility ?? null): Promise<ReadResultV3> {
    const intent = ReadIntentV3.parse(input);
    const official = intent.use.officialUse || (intent.use.useName?.startsWith("official.") ?? false);
    if (official && intent.persistSnapshot) throw new BksServiceError("BKS_PARSE_REJECTED", "persistSnapshot is not available for an official-use read: eligibility is evaluated per request and is not a snapshot basis");
    const binding = this.resolveBinding(principal, intent.bindingRef);
    const scope: ReadScope = "ref" in binding ? binding.scope : "public";
    const compiler = new TypedCompiler(this.model, scope, intent.limits, { admissionFields: true });
    const markerScope = { installationId: principal.installationId, applicationId: principal.applicationId, tenantId: principal.tenantId };
    const plans: PartPlan[] = intent.operations.map((op) => {
      const c: CompiledOp = op.op === "marker" ? compileMarker(op, markerScope) : compiler.compile(op as TypedOperation);
      return { opId: c.opId, op: c.op, steps: c.steps, ...(c.refused ? { refused: c.refused } : {}), ...(c.op === "resolve" ? { finish: TypedCompiler.finishResolve } : {}), ...(c.annotations ? { annotations: c.annotations } : {}) };
    });
    const use = { officialUse: official, useName: intent.use.useName ?? null, audience: intent.use.audience ?? null };
    const query = { kind: READ_INTENT_V3, operations: intent.operations, statementDigest: null, templateId: null, parameters: { use } as Record<string, unknown> };
    const base = await this.run(intent, principal, binding, plans, query, "operation", null);
    const v3 = (parts: ReadPartV3[], status: ReadResultStatus, eligibility: ReadResultV3["eligibility"], digests: ReadResultV3["digests"]): ReadResultV3 => ({ ...base, schemaVersion: READ_RESULT_V3, intentKind: READ_INTENT_V3, status, parts, digests, use, eligibility });
    if (!official) return v3(base.parts as ReadPartV3[], base.status, null, base.digests);
    const lk = await lookupDecisions(authority, principal.tenantId, base.parts as ReadPartV3[]);
    const applied = applyEligibility(base.parts as ReadPartV3[], { ...lk, tenantId: principal.tenantId }, this.now());
    const status: ReadResultStatus = base.reasons.length ? base.status : aggregateReadStatus(applied.parts.map((p) => p.status));
    const el = applied.eligibility;
    const resultDigest = canonicalDigest({ format: "bks-read-result-digest.v2", status, reasons: base.reasons, ordering: base.ordering, parts: applied.parts.map((p) => ({ opId: p.opId, op: p.op, status: p.status, reasons: p.reasons, columns: p.columns, rows: p.rows, truncations: p.truncations })), eligibility: { state: el.state, authoritativeEpoch: el.authoritativeEpoch, items: el.items } });
    const receiptDigest = canonicalDigest({ format: "bks-read-receipt-digest.v2", queryDigest: base.digests.queryDigest, resultDigest, consistency: base.consistency, receipt: jsonSafe(base.receipt), binding: base.binding, eligibility: jsonSafe(el) });
    return v3(applied.parts, status, el, { queryDigest: base.digests.queryDigest, resultDigest, receiptDigest });
  }

  async cypher(input: CypherReadIntentV1Input | unknown, principal: ReadPrincipal): Promise<ReadResultV2> {
    const intent = CypherReadIntentV1.parse(input);
    const binding = this.resolveBinding(principal, intent.bindingRef);
    const prepared = this.prepareCypher(intent, binding);
    const query = { kind: CYPHER_READ_INTENT_V1, operations: null, statementDigest: prepared.statementDigest, templateId: prepared.template?.id ?? null, parameters: intent.parameters };
    return this.run(intent, principal, binding, [prepared.part], query, intent.ordering, prepared.template ?? null, prepared.policy);
  }

  async explain(input: CypherReadIntentV1Input | unknown, principal: ReadPrincipal): Promise<ExplainResultV1> {
    const intent = CypherReadIntentV1.parse(input);
    const binding = this.resolveBinding(principal, intent.bindingRef);
    const prepared = this.prepareCypher(intent, binding);
    const reasons = [...(prepared.part.refused?.reasons ?? [])];
    if (!("ref" in binding)) reasons.push(binding);
    const pin = this.pinReason(intent.pins, prepared.template ?? undefined);
    if (pin) reasons.push(pin);
    let plan: Record<string, unknown> | null = null;
    let flags: string[] = [];
    let est: number | null = null;
    if (!reasons.length && "ref" in binding) {
      const step = prepared.part.steps[0]!;
      try {
        const session = binding.client.session("READ");
        try {
          const res = await session.executeRead((tx) => tx.run(`EXPLAIN ${step.statement}`, step.params), { timeout: intent.limits.timeoutMs });
          const p = res.summary.plan as unknown as Record<string, unknown> | false;
          if (p) {
            const ops = planOperators(p);
            flags = [...new Set(ops.filter((o) => /AllNodesScan|CartesianProduct|Eager|NodeByLabelScan|ProcedureCall|Expand\(All\)|VarLengthExpand/.test(o)))].sort();
            const bad = ops.filter((o) => FORBIDDEN_PLAN_OPERATORS.test(o));
            if (bad.length) reasons.push({ code: "CLAUSE_FORBIDDEN", message: `plan contains write/side-effect operators: ${bad.join(", ")}` });
            plan = compactPlan(p);
            est = Number((p as { arguments?: { EstimatedRows?: number } }).arguments?.EstimatedRows ?? NaN);
            if (!Number.isFinite(est)) est = null;
          }
        } finally {
          await session.close();
        }
      } catch (e) {
        reasons.push(dbReason(e, false).reason);
      }
    }
    return { schemaVersion: READ_EXPLAIN_V1, intentId: intent.intentId, accepted: reasons.length === 0, reasons, statementDigest: prepared.statementDigest, policy: { policy: CYPHER_READ_POLICY, parser: CYPHER_PARSER, visibility: READ_VISIBILITY_POLICY, facts: (prepared.policy ?? null) as never }, plan, planFlags: flags, estimatedRows: est };
  }

  // ------------------------------------------------------------------------------------------------------------
  // Cypher artifact / template preparation
  // ------------------------------------------------------------------------------------------------------------

  private prepareCypher(intent: CypherReadIntentV1, binding: ReadBinding | ReadReason): { part: PartPlan; statementDigest: string | null; template?: CatalogTemplate | undefined; policy?: Record<string, unknown> } {
    const refuse = (status: ReadResultStatus, reasons: ReadReason[], statementDigest: string | null, template?: CatalogTemplate) => ({ part: { opId: "cypher", op: template ? "template" : "cypher", steps: [], refused: { status, reasons } }, statementDigest, template });
    const scope: ReadScope = "ref" in binding ? binding.scope : "public";
    if (intent.template) {
      const t = this.catalog.get(intent.template.id);
      if (!t) return refuse("unsupported", [{ code: "TEMPLATE_NOT_FOUND", message: `no template ${intent.template.id} in ${this.model.releaseId}` }], null);
      if (t.statementDigest !== intent.template.statementDigest) return refuse("stale", [{ code: "CATALOG_MISMATCH", message: `template ${t.id} statementDigest is ${t.statementDigest}; the artifact cites ${intent.template.statementDigest}` }], t.statementDigest, t);
      const unsupported = this.catalog.unsupportedReason(t);
      if (unsupported) return refuse("unsupported", [unsupported], t.statementDigest, t);
      if ("ref" in binding && binding.scope === "public" && binding.visibility !== "database-rbac") {
        return refuse("forbidden", [{ code: "VISIBILITY_UNPROVEN", message: `catalog templates do not carry scope predicates; binding ${binding.ref} cannot prove public-scope visibility in the database (no RBAC), so templates run only in scope internal or on an RBAC-enforced binding. Use typed reads (visibility compiled in).` }], t.statementDigest, t);
      }
      const bound = this.catalog.bind(t, intent.parameters);
      if (!bound.ok) return refuse("failed", [bound.reason], t.statementDigest, t);
      return { part: { opId: "cypher", op: "template", steps: [{ statement: t.statement, params: bound.params }], expectColumns: t.outputColumns, annotations: { templateId: t.id, questionIds: t.questionIds } }, statementDigest: t.statementDigest, template: t };
    }
    const statement = intent.statement!;
    const digest = statementDigestOf(statement);
    if (intent.statementDigest && intent.statementDigest !== digest) return refuse("failed", [{ code: "PARSE_REJECTED", message: `statementDigest ${intent.statementDigest} does not match the UTF-8 statement bytes (${digest})` }], digest);
    if ("ref" in binding && binding.readAuthority !== "database-role") {
      return refuse("unsupported", [{ code: "READ_AUTHORITY_UNAVAILABLE", message: `binding ${binding.ref} has no proven read-only database principal (session READ routing is not enforcement); arbitrary Cypher reads are unavailable here. Use typed reads or catalog templates.` }], digest);
    }
    if ("ref" in binding && binding.scope === "public" && binding.visibility !== "database-rbac") {
      return refuse("forbidden", [{ code: "VISIBILITY_UNPROVEN", message: `scope public on binding ${binding.ref} is not enforced by database privileges; arbitrary Cypher would see records outside the scope. Use typed reads or an RBAC-enforced binding.` }], digest);
    }
    const verdict = checkCypherRead(statement, { model: this.model, scope, maxDepth: intent.limits.maxDepth, declared: intent.scope });
    const policy = verdict.facts as unknown as Record<string, unknown>;
    if (!verdict.accepted) return { ...refuse(verdict.reasons.some((r) => r.code === "PARSE_REJECTED") ? "failed" : "forbidden", verdict.reasons, digest), policy };
    if (intent.ordering === "statement" && !verdict.facts.hasFinalOrderBy) return { ...refuse("failed", [{ code: "PARSE_REJECTED", message: "ordering 'statement' requires a final ORDER BY" }], digest), policy };
    const declared = new Set(Object.keys(intent.parameterSchema));
    const provided = new Set(Object.keys(intent.parameters));
    const problems: ReadReason[] = [];
    for (const p of verdict.facts.parameters) {
      if (!declared.has(p)) problems.push({ code: "PARAMETER_INVALID", message: `$${p} has no parameterSchema entry`, path: p });
      if (!provided.has(p)) problems.push({ code: "PARAMETER_INVALID", message: `$${p} has no value`, path: p });
    }
    for (const p of provided) if (!verdict.facts.parameters.includes(p)) problems.push({ code: "PARAMETER_INVALID", message: `parameter ${p} is not used by the statement`, path: p });
    const params: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(intent.parameters)) {
      const err = this.catalog.validateValue(v, intent.parameterSchema[k] as never, k);
      if (err) problems.push(err);
      else params[k] = bindParameter(v, intent.parameterSchema[k] as never);
    }
    for (const proc of verdict.facts.procedures) if (proc === "db.index.fulltext.queryNodes") {
      // index name must be a release fulltext index (checked on the bound value when given as a parameter)
      const names = [...this.model.fulltextIndexes.keys()];
      const lit = /db\.index\.fulltext\.queryNodes\s*\(\s*(?:'([^']+)'|"([^"]+)"|\$(\w+))/.exec(statement);
      const name = lit ? lit[1] ?? lit[2] ?? (lit[3] ? String(intent.parameters[lit[3]] ?? "") : "") : "";
      if (!names.includes(name)) problems.push({ code: "PROCEDURE_FORBIDDEN", message: `fulltext index ${name || "(unknown)"} is not a release fulltext index` });
    }
    if (problems.length) return { ...refuse("failed", problems, digest), policy };
    return { part: { opId: "cypher", op: "cypher", steps: [{ statement, params }], ...(intent.resultSchema ? { expectColumns: intent.resultSchema.columns.map((c) => c.name) } : {}), explainFirst: true }, statementDigest: digest, policy };
  }

  // ------------------------------------------------------------------------------------------------------------
  // Execution
  // ------------------------------------------------------------------------------------------------------------

  private async run(
    intent: { intentId: string; pins: { schemaReleaseDigest: string; queryCatalogDigest?: string | undefined }; limits: ReadLimits; consistency: { mode: "observed" | "stable_revision"; bookmarks: string[]; maxAttempts: number }; persistSnapshot: boolean; bindingRef?: string | undefined; questionIds: string[] },
    principal: ReadPrincipal,
    bindingOrReason: ReadBinding | ReadReason,
    plans: PartPlan[],
    query: { kind: string; operations: unknown; statementDigest: string | null; templateId: string | null; parameters: Record<string, unknown> },
    ordering: "statement" | "set" | "operation",
    template: CatalogTemplate | null,
    policyFacts?: Record<string, unknown>,
  ): Promise<ReadResultV2> {
    const requestId = randomUUID();
    const startedAt = this.now();
    const t0 = Date.now();
    const limits = intent.limits;
    const binding = "ref" in bindingOrReason ? bindingOrReason : null;
    const scope: ReadScope = binding?.scope ?? "public";
    const top: ReadReason[] = [];
    let topStatus: ReadResultStatus | null = null;
    let parts: ReadPart[] = [];
    let attempts = 0;
    let graphRevision: number | null = null;
    let bookmarks: string[] = [];
    let plan: Record<string, unknown> | null = null;

    const pinReason = this.pinReason(intent.pins, template ?? undefined);
    if (!binding) {
      topStatus = "forbidden";
      top.push(bindingOrReason as ReadReason);
    } else if (pinReason) {
      topStatus = "stale";
      top.push(pinReason);
    }

    const release = topStatus ? null : await this.sem.acquire(principal.principalId, Math.min(2000, limits.timeoutMs));
    if (!topStatus && !release) {
      topStatus = "skipped";
      top.push({ code: "CONCURRENCY_LIMIT", message: `read concurrency limit reached for principal ${principal.principalId} or the service; nothing was executed` });
    }

    try {
      if (!topStatus && binding) {
        if (plans.every((p) => p.refused)) {
          parts = plans.map((p) => refusedPart(p));
        } else if (intent.consistency.mode === "observed" && plans.length > 1) {
          // observed (no snapshot claim): every operation runs in its own read transaction with its own timeoutMs budget
          // and its own transient retries, chained by causal bookmarks. A slow, failed or refused operation never turns
          // the other operations into `skipped` / `forbidden` (per-operation status).
          let bm = intent.consistency.bookmarks;
          const merged: Record<string, unknown> = {};
          for (const p of plans) {
            if (p.refused) {
              parts.push(refusedPart(p));
              continue;
            }
            const out = await this.attemptLoop(binding, { ...intent.consistency, bookmarks: bm }, limits, [p]);
            attempts = Math.max(attempts, out.attempts);
            if ("error" in out) {
              parts.push(refusedPart(p, { status: out.error.status === "stale" ? "stale" : out.error.status, reasons: [out.error.reason] }));
              continue;
            }
            parts.push(...out.output.parts);
            Object.assign(merged, out.output.plans);
            if (out.bookmarks.length) bm = out.bookmarks;
          }
          bookmarks = bm;
          plan = Object.keys(merged).length ? merged : null;
        } else {
          // one operation, or stable_revision (the fence probe and every dependency read in ONE transaction): the
          // transaction budget is timeoutMs per operation.
          const txLimits = { ...limits, timeoutMs: Math.min(limits.timeoutMs * Math.max(1, plans.length), 120_000) };
          const out = await this.attemptLoop(binding, intent.consistency, txLimits, plans);
          attempts = out.attempts;
          graphRevision = out.graphRevision;
          bookmarks = out.bookmarks;
          if ("error" in out) {
            topStatus = out.error.status;
            top.push(out.error.reason);
            parts = plans.map((p) => refusedPart(p, { status: "skipped", reasons: [{ code: out.error.reason.code, message: "not executed: the read attempt was abandoned" }] }));
          } else {
            parts = out.output.parts;
            plan = Object.keys(out.output.plans).length ? out.output.plans : null;
          }
        }
      } else {
        parts = plans.map((p) => refusedPart(p, { status: "skipped", reasons: [{ code: top[0]!.code, message: "not executed" }] }));
      }
    } finally {
      release?.();
    }
    if (ordering === "set") for (const p of parts) p.rows = [...p.rows].sort((a, b) => cmp(canonicalize(a), canonicalize(b)));

    const status: ReadResultStatus = topStatus ?? aggregateReadStatus(parts.map((p) => p.status));
    const finishedAt = this.now();
    // Receipt metadata only: bounded (1 s) and never allowed to extend a read past its budget (an unreachable server yields nulls).
    const server = binding ? await withDeadline(this.server(binding), 1000, () => undefined).catch(() => ({ agent: null, edition: null })) : { agent: null, edition: null };
    const pins = { releaseId: this.model.releaseId, schemaReleaseDigest: this.model.schemaReleaseDigest, schemaDigest: this.model.schemaDigest, queryCatalogDigest: this.model.queryCatalogDigest, workspaceFingerprint: this.config.workspaceFingerprint ?? null };
    const queryDigest = canonicalDigest({
      format: "bks-read-query-digest.v1",
      kind: query.kind,
      statementDigest: query.statementDigest,
      templateId: query.templateId,
      operations: query.operations ?? null,
      parameters: jsonSafe(query.parameters),
      pins: { schemaReleaseDigest: this.model.schemaReleaseDigest, queryCatalogDigest: this.model.queryCatalogDigest },
      scope,
      limits,
      consistencyMode: intent.consistency.mode,
      ordering,
      policies: [READ_VISIBILITY_POLICY, CYPHER_READ_POLICY, READ_VALUES_V1],
    });
    const resultDigest = canonicalDigest({ format: "bks-read-result-digest.v1", status, reasons: top, ordering, parts: parts.map((p) => ({ opId: p.opId, op: p.op, status: p.status, reasons: p.reasons, columns: p.columns, rows: p.rows, truncations: p.truncations })) });
    const consistency = { mode: intent.consistency.mode, graphRevision, attempts, bookmarks, readInterval: { startedAt: startedAt.toISOString(), finishedAt: finishedAt.toISOString() }, snapshotClaim: intent.consistency.mode === "stable_revision" && graphRevision !== null && (status === "ok" || status === "empty" || status === "truncated") };
    const receipt = { requestId, principalId: principal.principalId, startedAt: startedAt.toISOString(), finishedAt: finishedAt.toISOString(), elapsedMs: Date.now() - t0, attempts, server, plan };
    const bindingView = binding ? { ref: binding.ref, scope: binding.scope, readAuthority: binding.readAuthority, visibility: binding.visibility } : { ref: intent.bindingRef ?? "(none)", scope: "public" as const, readAuthority: "session-routing" as const, visibility: "application" as const };
    const receiptDigest = canonicalDigest({ format: "bks-read-receipt-digest.v1", queryDigest, resultDigest, consistency, receipt: jsonSafe(receipt), binding: bindingView, policyFacts: jsonSafe(policyFacts ?? null) });
    const result: ReadResultV2 = {
      schemaVersion: READ_RESULT_V2,
      intentId: intent.intentId,
      intentKind: query.kind as ReadResultV2["intentKind"],
      status,
      reasons: top,
      parts,
      serialization: READ_VALUES_V1,
      ordering,
      pins,
      binding: bindingView,
      consistency,
      query: { statementDigest: query.statementDigest, templateId: query.templateId, language: "CYPHER_5" },
      digests: { queryDigest, resultDigest, receiptDigest },
      snapshot: null,
      receipt: jsonSafe(receipt) as ReadResultV2["receipt"],
    };
    if (intent.persistSnapshot) {
      if (!this.config.snapshots) throw new BksServiceError("BKS_AUTHORITY_UNAVAILABLE", "snapshot custody is not configured; the read was not persisted");
      if (status === "ok" || status === "empty" || status === "truncated") {
        const bytes = Buffer.from(canonicalize(result), "utf8");
        const ref = `rs-${intent.intentId.replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 80)}-${resultDigest.slice(7, 23)}-${requestId.slice(0, 8)}`;
        const record = await this.config.snapshots.put(
          {
            format: CUSTODY_SNAPSHOT_V1,
            ref,
            bytesDigest: rawBytesDigest(bytes),
            issuer: this.config.issuer ?? "bks-read-service",
            scope: { installationId: principal.installationId, applicationId: principal.applicationId, tenantId: principal.tenantId },
            pins: { schemaReleaseDigest: this.model.schemaReleaseDigest },
            consistency: { mode: intent.consistency.mode, graphRevision, bookmarks },
            dependencies: { complete: false, nodes: touched(parts) },
            digests: { queryDigest, resultDigest, receiptDigest },
            createdAt: finishedAt.toISOString(),
          },
          bytes,
        );
        result.snapshot = { ref: record.ref, bytesDigest: record.bytesDigest };
      }
    }
    return result;
  }

  private async server(binding: ReadBinding): Promise<{ agent: string | null; edition: string | null }> {
    const cached = this.serverInfo.get(binding.ref);
    if (cached) return cached;
    const info = await binding.client.verify().catch(() => ({ agent: "" }));
    let edition: string | null = null;
    try {
      edition = await binding.client.read(async (tx) => String((await tx.run("CALL dbms.components() YIELD edition RETURN edition")).records[0]?.get("edition") ?? ""));
    } catch {
      edition = null;
    }
    const v = { agent: info.agent || null, edition: edition || null };
    this.serverInfo.set(binding.ref, v);
    return v;
  }

  /**
   * Runs all parts inside ONE explicit read transaction per attempt. Transient failures retry the whole read; every
   * attempt allocates fresh accumulators (rows, bytes, truncations, plans), so nothing of an abandoned attempt survives.
   * stable_revision: S3's withStableRevision probes the fence before and after inside the same transaction and retries on
   * a moved revision (BKS_STALE_REVISION after maxAttempts).
   */
  private async attemptLoop(binding: ReadBinding, consistency: { mode: "observed" | "stable_revision"; bookmarks: string[]; maxAttempts: number }, limits: ReadLimits, plans: PartPlan[]): Promise<({ output: AttemptOutput } | { error: { status: ReadResultStatus; reason: ReadReason } }) & { attempts: number; graphRevision: number | null; bookmarks: string[] }> {
    const transientMax = this.config.transientAttempts ?? 3;
    const deadline = Date.now() + limits.timeoutMs;
    let attempts = 0;
    for (let t = 1; t <= transientMax; t++) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) return { error: { status: "failed", reason: { code: "TIMEOUT", message: `deadline ${limits.timeoutMs} ms exhausted before attempt ${t}` } }, attempts, graphRevision: null, bookmarks: [] };
      let timedOut = false;
      try {
        if (consistency.mode === "stable_revision") {
          const res = await withDeadline(
            withStableRevision(binding.client, async (tx, revAttempt) => {
              attempts++;
              return this.attempt(tx, attempts, limits, plans, deadline, revAttempt);
            }, { maxAttempts: consistency.maxAttempts, timeoutMs: Math.max(100, remaining), bookmarks: consistency.bookmarks }),
            remaining,
            () => (timedOut = true),
          );
          return { output: res.result, attempts, graphRevision: res.graphRevision, bookmarks: res.bookmarks };
        }
        const session = binding.client.driver.session({ database: binding.client.config.database, defaultAccessMode: "READ", fetchSize: Math.min(limits.rowCap + 1, 1000), ...(consistency.bookmarks.length ? { bookmarks: consistency.bookmarks } : {}) });
        try {
          // Connection acquisition and BEGIN are bounded by the same deadline (an unreachable database fails at the
          // budget, not after the driver connection timeout).
          const tx = await withDeadline(session.beginTransaction({ timeout: Math.max(100, remaining) }), remaining, () => (timedOut = true));
          try {
            attempts++;
            const output = await withDeadline(this.attempt(tx, attempts, limits, plans, deadline, 1), remaining, () => {
              timedOut = true;
              void tx.rollback().catch(() => undefined);
            });
            if (output.aborted) await tx.rollback().catch(() => undefined);
            else await tx.commit();
            return { output, attempts, graphRevision: null, bookmarks: output.aborted ? [] : session.lastBookmarks() };
          } catch (e) {
            // After a client deadline the server may still be planning/executing: never wait for it (the caller gets
            // TIMEOUT at the deadline; the transaction timeout and the rollback end the server work).
            if (timedOut) void tx.rollback().catch(() => undefined);
            else await tx.rollback().catch(() => undefined);
            throw e;
          }
        } finally {
          if (timedOut) void session.close().catch(() => undefined);
          else await session.close().catch(() => undefined);
        }
      } catch (e) {
        if (e instanceof BksServiceError && e.code === "BKS_STALE_REVISION") return { error: { status: "stale", reason: { code: "STALE_REVISION", message: e.message } }, attempts, graphRevision: null, bookmarks: [] };
        if (e instanceof BksServiceError && e.code === "BKS_RELEASE_MISMATCH") return { error: { status: "unsupported", reason: { code: "RELEASE_MISMATCH", message: e.message } }, attempts, graphRevision: null, bookmarks: [] };
        if (!timedOut && isTransient(e) && t < transientMax && deadline - Date.now() > 50) continue;
        if (!timedOut && isTransient(e) && deadline - Date.now() <= 50) return { error: { status: "failed", reason: { code: "TIMEOUT", message: `deadline ${limits.timeoutMs} ms exhausted by transient database failures after ${t} attempt(s): ${String((e as Error).message).split("\n")[0]}` } }, attempts, graphRevision: null, bookmarks: [] };
        if (!timedOut && isTransient(e)) return { error: { status: "failed", reason: { code: "TRANSIENT_RETRIES_EXHAUSTED", message: `transient database failures on ${t} attempts: ${String((e as Error).message).split("\n")[0]}` } }, attempts, graphRevision: null, bookmarks: [] };
        const r = dbReason(e, timedOut);
        return { error: r, attempts, graphRevision: null, bookmarks: [] };
      }
    }
    return { error: { status: "failed", reason: { code: "TRANSIENT_RETRIES_EXHAUSTED", message: "no attempt completed" } }, attempts, graphRevision: null, bookmarks: [] };
  }

  /** One attempt: fresh accumulators; streams each step with the overflow probe, byte, list and nesting caps. */
  private async attempt(tx: Transaction, attemptNo: number, limits: ReadLimits, plans: PartPlan[], deadline: number, _revAttempt: number): Promise<AttemptOutput> {
    const out: AttemptOutput = { parts: [], plans: {}, bytes: 0, aborted: false };
    let aborted: ReadReason | null = null;
    for (let i = 0; i < plans.length; i++) {
      const p = plans[i]!;
      if (p.refused) {
        out.parts.push(refusedPart(p));
        continue;
      }
      if (!p.steps.length) {
        // `empty` means "a query ran and found no visible record"; an operation that compiled to no query is never empty.
        out.parts.push(refusedPart(p, { status: "unsupported", reasons: [{ code: "PARAMETER_INVALID", message: `operation ${p.opId} compiled to no query` }] }));
        continue;
      }
      if (aborted) {
        out.parts.push(refusedPart(p, { status: "skipped", reasons: [{ code: aborted.code, message: `not executed: an earlier part aborted the transaction (${aborted.message.slice(0, 200)})` }] }));
        continue;
      }
      const part: ReadPart = { opId: p.opId, op: p.op, status: "ok", reasons: [], columns: [], rows: [], rowCount: 0, truncations: [] };
      try {
        for (const step of p.steps) {
          if (p.explainFirst) {
            const ex = await tx.run(`EXPLAIN ${step.statement}`, step.params);
            const pl = ex.summary.plan as unknown;
            const ops = planOperators(pl);
            const bad = ops.filter((o) => FORBIDDEN_PLAN_OPERATORS.test(o));
            if (bad.length) throw Object.assign(new Error(`plan contains write/side-effect operators: ${bad.join(", ")}`), { policy: "CLAUSE_FORBIDDEN" });
            out.plans[p.opId] = { operators: [...new Set(ops)].sort(), flags: [...new Set(ops.filter((o) => /AllNodesScan|CartesianProduct|Eager/.test(o)))].sort() };
          }
          const remainingRows = step.perStep ? Math.min(step.rowCap ?? limits.rowCap, limits.rowCap - part.rows.length) : Math.min(step.rowCap ?? limits.rowCap, limits.rowCap) - part.rows.length;
          const r = await streamStep(tx, step.statement, step.params, { ...limits, rowCap: Math.max(0, remainingRows) }, limits.byteCap - out.bytes, deadline);
          if (!part.columns.length) part.columns = r.columns;
          const rows = step.post ? step.post(r.rows) : r.rows;
          part.rows.push(...rows);
          out.bytes += r.bytes;
          part.truncations.push(...r.truncations);
          if (r.truncations.some((x) => x.kind !== "list")) break;
        }
        if (p.finish) part.rows = p.finish(part.rows);
        part.rowCount = part.rows.length;
        if (p.expectColumns && part.columns.length && p.expectColumns.join(",") !== part.columns.join(",")) {
          part.status = "failed";
          part.reasons.push({ code: "RESULT_SCHEMA_MISMATCH", message: `columns [${part.columns.join(", ")}] differ from the declared [${p.expectColumns.join(", ")}]` });
        } else if (part.truncations.length) {
          part.status = "truncated";
          for (const tr of part.truncations) part.reasons.push({ code: tr.kind === "rows" ? "ROW_CAP" : tr.kind === "bytes" ? "BYTE_CAP" : "LIST_CAP", message: tr.kind === "rows" ? `more than ${tr.limit} rows exist (one-row overflow probe); the result is a prefix` : tr.kind === "bytes" ? `the next row would exceed the ${tr.limit}-byte cap; the result is a prefix` : `a list value at ${tr.path} has more than ${tr.limit} members; it is cut to the first ${tr.limit}`, limit: tr.limit, ...(tr.path ? { path: tr.path } : {}) });
        } else part.status = part.rows.length ? "ok" : "empty";
      } catch (e) {
        if (e instanceof ValueLimitError) {
          part.status = e.code === "FULL_ENTITY_RETURN" ? "forbidden" : "failed";
          part.reasons.push({ code: e.code, message: e.message, path: e.path });
          part.rows = [];
          part.rowCount = 0;
        } else if ((e as { policy?: string }).policy) {
          part.status = "forbidden";
          part.reasons.push({ code: "CLAUSE_FORBIDDEN", message: (e as Error).message });
        } else if (isTransient(e)) {
          throw e; // the whole attempt is retried with fresh accumulators
        } else {
          const r = dbReason(e, Date.now() >= deadline);
          if (r.reason.code === "TIMEOUT") throw e;
          part.status = r.status;
          part.reasons.push(r.reason);
          part.rows = [];
          part.rowCount = 0;
          aborted = r.reason; // a database error aborts the explicit transaction: later parts are skipped
          out.aborted = true;
        }
      }
      out.parts.push(withAnnotations(part, p.annotations));
      await this.config.faults?.afterPart?.({ attempt: attemptNo, partIndex: i, rowsSoFar: part.rows.length });
    }
    return out;
  }
}

function withAnnotations(part: ReadPart, annotations: Record<string, unknown> | undefined): ReadPart {
  if (!annotations) return part;
  // Annotations are semantic (policy meanings, temporal views); they travel as a reserved first-class field.
  return Object.assign(part, { annotations: jsonSafe(annotations) }) as ReadPart;
}

function refusedPart(p: PartPlan, override?: { status: ReadResultStatus; reasons: ReadReason[] }): ReadPart {
  const r = override ?? p.refused ?? { status: "skipped" as ReadResultStatus, reasons: [] };
  return withAnnotations({ opId: p.opId, op: p.op, status: r.status, reasons: r.reasons, columns: [], rows: [], rowCount: 0, truncations: [] }, p.annotations);
}

/**
 * Request-level status. Each part's status is authoritative for its operation; the top level summarizes the parts
 * that ANSWERED (ok / truncated / empty) so one refused or failed operation never turns the whole read into
 * `forbidden` / `failed`: truncated if any answered part is truncated, else ok if any answered part has rows, else
 * empty. Only when no part answered does the most severe part status propagate. Request-wide refusals (binding, pin,
 * concurrency, stable_revision staleness) are set before this and are not affected.
 */
export function aggregateReadStatus(statuses: ReadResultStatus[]): ReadResultStatus {
  if (!statuses.length) return "empty";
  const answered = statuses.filter((s) => s === "ok" || s === "truncated" || s === "empty");
  if (answered.length) return answered.includes("truncated") ? "truncated" : answered.includes("ok") ? "ok" : "empty";
  return statuses.reduce((a, b) => (STATUS_RANK[b] > STATUS_RANK[a] ? b : a), "skipped" as ReadResultStatus);
}

function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** JSON-safe copy (drops undefined; keeps canonical-admissible values). */
function jsonSafe<T>(v: T): T {
  return v === undefined ? (null as T) : (JSON.parse(JSON.stringify(v, (_k, x) => (typeof x === "bigint" ? x.toString() : x))) as T);
}

function touched(parts: ReadPart[]): Array<{ uid: string; updatedAt: string | null }> {
  const out = new Map<string, string | null>();
  const visit = (v: unknown) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) return v.forEach(visit);
    const o = v as Record<string, unknown>;
    if (typeof o.uid === "string" && /^hu:[a-z0-9-]+:[A-Za-z0-9][A-Za-z0-9._\-/]*$/.test(o.uid)) {
      const u = o.updatedAt as { value?: string } | string | null | undefined;
      const val = typeof u === "string" ? u : u && typeof u === "object" ? String(u.value ?? "") || null : null;
      if (!out.has(o.uid) || (val && !out.get(o.uid))) out.set(o.uid, val);
    }
    for (const x of Object.values(o)) visit(x);
  };
  for (const p of parts) visit(p.rows);
  return [...out.entries()].sort(([a], [b]) => cmp(a, b)).slice(0, 5000).map(([uid, updatedAt]) => ({ uid, updatedAt }));
}

async function withDeadline<T>(p: Promise<T>, ms: number, onTimeout: () => void): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      p,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          onTimeout();
          reject(Object.assign(new Error(`client deadline of ${ms} ms exceeded`), { code: "Neo.ClientError.Transaction.TransactionTimedOutClientConfiguration" }));
        }, Math.max(1, ms));
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Streams one statement at the execution boundary: records are pulled in fetch-size batches and consumed one by one;
 * after rowCap rows the next record is the overflow probe, then iteration stops and the rest is discarded (never
 * fetch-all-then-slice). The byte cap counts the canonical UTF-8 bytes of each serialized row.
 */
export async function streamStep(tx: Transaction, statement: string, params: Record<string, unknown>, limits: ReadLimits, byteBudget: number, deadline: number): Promise<{ columns: string[]; rows: Array<Record<string, unknown>>; bytes: number; truncations: ReadPart["truncations"] }> {
  const result = tx.run(statement, params);
  const rows: Array<Record<string, unknown>> = [];
  const truncations: ReadPart["truncations"] = [];
  let bytes = 0;
  let columns: string[] = [];
  for await (const rec of result) {
    if (!columns.length) columns = rec.keys.map(String);
    if (Date.now() > deadline) throw Object.assign(new Error("client deadline exceeded while streaming"), { code: "Neo.ClientError.Transaction.TransactionTimedOutClientConfiguration" });
    if (rows.length >= limits.rowCap) {
      truncations.push({ kind: "rows", limit: limits.rowCap });
      break;
    }
    const state = { truncations: [] as Array<{ kind: "list"; limit: number; path: string }> };
    const row: Record<string, unknown> = {};
    for (const k of rec.keys) row[String(k)] = normalizeValue(rec.get(k), limits, state, `rows[${rows.length}].${String(k)}`);
    const size = Buffer.byteLength(canonicalize(row), "utf8");
    if (bytes + size > byteBudget) {
      truncations.push({ kind: "bytes", limit: byteBudget });
      break;
    }
    bytes += size;
    rows.push(row);
    truncations.push(...state.truncations);
  }
  if (!columns.length) columns = (await result.keys()).map(String);
  return { columns, rows, bytes, truncations };
}

function compactPlan(p: unknown): Record<string, unknown> {
  const o = p as { operatorType?: string; identifiers?: string[]; arguments?: Record<string, unknown>; children?: unknown[] };
  return { operator: o.operatorType ?? "?", estimatedRows: Number(o.arguments?.EstimatedRows ?? 0), details: String(o.arguments?.Details ?? "").slice(0, 300), children: (o.children ?? []).map(compactPlan) };
}
