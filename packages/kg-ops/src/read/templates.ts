import type { ReadReason } from "./contracts.js";
import { bindParameter } from "./values.js";
import type { ReadModel } from "./visibility.js";

/**
 * Release query catalog (`query-catalog/catalog.json`, bks-query-catalog.v1) as immutable, audited read artifacts:
 * a template is one resolved Cypher 5 statement with typed parameters, run through the same read path (bounds,
 * streaming, consistency, digests) as an ad hoc artifact. Templates are never edited here; corrections go to the
 * schema authority as a release patch (see read/catalog-corrections.ts).
 */

export interface TemplateParameter {
  type: "string" | "integer" | "number" | "boolean" | "array" | "object" | "null";
  items?: TemplateParameter;
  pattern?: string;
  neo4jType?: "DateTime" | "Date" | "Duration" | "LocalDateTime";
  format?: string;
  inferredFrom?: string;
  enum?: unknown[];
}

export interface CatalogTemplate {
  id: string;
  questionIds: string[];
  module: string;
  language: string;
  statementKind: string;
  statement: string;
  statementDigest: string;
  parameters: Record<string, TemplateParameter>;
  outputColumns: string[];
  limits?: { maxRows?: number; timeoutMs?: number; maxDepth?: number };
  requiredIndexes?: string[];
  status: "supported" | "held" | "unsupported";
  reason?: string;
  validation?: { explain?: string; planFlags?: string[]; resultAssertions?: string };
  temporalNotes?: string[];
  evidenceNotes?: string[];
  source?: string;
}

export interface CatalogQuestion {
  id: string;
  module: string;
  question: string;
  value?: number;
  status: "supported" | "held" | "unsupported";
  reason?: string;
  templates: string[];
  fixture?: boolean;
  answerKind?: string;
  polarity?: string;
  reuses?: string[];
}

export class CatalogTemplates {
  readonly templates: CatalogTemplate[];
  readonly questions: CatalogQuestion[];
  readonly aliases: Array<{ alias: string; canonical: string[]; kind: string }>;
  private readonly byId: Map<string, CatalogTemplate>;

  constructor(readonly model: ReadModel) {
    const c = model.release.queryCatalog as { templates?: CatalogTemplate[]; questions?: CatalogQuestion[]; aliases?: Array<{ alias: string; canonical: string[]; kind: string }> };
    this.templates = c.templates ?? [];
    this.questions = c.questions ?? [];
    this.aliases = c.aliases ?? [];
    this.byId = new Map(this.templates.map((t) => [t.id, t]));
  }

  get(id: string): CatalogTemplate | undefined {
    return this.byId.get(id);
  }

  /** Public listing (GET /kg/catalog/templates): ids, questions, parameters, columns, status; statements included. */
  list(filter: { status?: string; module?: string; questionId?: string } = {}): Array<Record<string, unknown>> {
    return this.templates
      .filter((t) => (!filter.status || t.status === filter.status) && (!filter.module || t.module === filter.module) && (!filter.questionId || t.questionIds.includes(filter.questionId)))
      .map((t) => ({ id: t.id, questionIds: t.questionIds, module: t.module, statementKind: t.statementKind, status: t.status, reason: t.reason ?? null, statementDigest: t.statementDigest, statement: t.statement, parameters: t.parameters, outputColumns: t.outputColumns, limits: t.limits ?? null, requiredIndexes: t.requiredIndexes ?? [], planFlags: t.validation?.planFlags ?? [], servable: this.unsupportedReason(t) === null }));
  }

  /** Why a template cannot be served as a read (non-read kinds, GDS, disabled vectors, held), or null. */
  unsupportedReason(t: CatalogTemplate): ReadReason | null {
    if (t.statementKind !== "read") return { code: "TEMPLATE_UNSUPPORTED", message: `template ${t.id} is a ${t.statementKind} statement; only read templates are served (GDS/AGA analytics are disabled, OD-22)` };
    if (t.status !== "supported") return { code: "TEMPLATE_UNSUPPORTED", message: `template ${t.id} is ${t.status} in the release catalog: ${t.reason ?? ""}`.trim() };
    if (/db\.index\.vector|vector\.similarity|genai\.|ai\.text/i.test(t.statement)) return { code: "VECTOR_SEARCH_DISABLED", message: `template ${t.id} needs a native vector index; native data vectors are disabled in this release (OD-44)` };
    if (/\bgds\./.test(t.statement)) return { code: "TEMPLATE_UNSUPPORTED", message: `template ${t.id} calls GDS; analytics are disabled (OD-22)` };
    return null;
  }

  validateValue(v: unknown, schema: TemplateParameter | undefined, name: string): ReadReason | null {
    if (!schema) return { code: "PARAMETER_INVALID", message: `parameter ${name} has no declared schema`, path: name };
    if (v === null) return null;
    const bad = (m: string): ReadReason => ({ code: "PARAMETER_INVALID", message: `parameter ${name}: ${m}`, path: name });
    switch (schema.type) {
      case "string":
        if (typeof v !== "string") return bad("expected a string");
        if (schema.pattern && !new RegExp(schema.pattern).test(v)) return bad(`does not match ${schema.pattern}`);
        if (schema.neo4jType === "DateTime" && Number.isNaN(Date.parse(v))) return bad("expected an RFC 3339 date-time");
        if (v.length > 100_000) return bad("too long");
        return null;
      case "integer":
        return typeof v === "number" && Number.isInteger(v) ? null : bad("expected an integer");
      case "number":
        return typeof v === "number" && Number.isFinite(v) ? null : bad("expected a finite number");
      case "boolean":
        return typeof v === "boolean" ? null : bad("expected a boolean");
      case "array": {
        if (!Array.isArray(v)) return bad("expected an array");
        if (v.length > 5000) return bad("more than 5000 members");
        for (let i = 0; i < v.length; i++) {
          const e = this.validateValue(v[i], schema.items ?? { type: typeof v[i] === "number" ? "number" : "string" }, `${name}[${i}]`);
          if (e) return e;
        }
        return null;
      }
      case "object":
        return v && typeof v === "object" && !Array.isArray(v) ? null : bad("expected an object");
      default:
        return null;
    }
  }

  /** Validates and binds every declared parameter (all are required; null is allowed and binds as null). */
  bind(t: CatalogTemplate, params: Record<string, unknown>): { ok: true; params: Record<string, unknown> } | { ok: false; reason: ReadReason } {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(params)) if (!(k in t.parameters)) return { ok: false, reason: { code: "PARAMETER_INVALID", message: `template ${t.id} has no parameter ${k}`, path: k } };
    for (const [k, schema] of Object.entries(t.parameters)) {
      if (!(k in params)) return { ok: false, reason: { code: "PARAMETER_INVALID", message: `template ${t.id} parameter ${k} is required (null allowed)`, path: k } };
      const err = this.validateValue(params[k], schema, k);
      if (err) return { ok: false, reason: err };
      out[k] = bindParameter(params[k], schema as never);
    }
    return { ok: true, params: out };
  }
}
