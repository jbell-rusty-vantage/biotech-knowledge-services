import { CYPHER_READ_INTENT_V1, type ReadResultV2 } from "./contracts.js";
import type { CatalogTemplate } from "./templates.js";
import type { ReadPrincipal, ReadService } from "./service.js";
import type { GraphClient } from "../neo4j.js";
import { toJson } from "../neo4j.js";

/**
 * Query-catalog result assertions (FU-04): every servable template is executed through the read service against the
 * fixture graph with (a) a positive binding searched from fixture records and (b) a negative (absent) binding.
 *
 *   fixture-positive  some binding returned rows; declared output columns match exactly; values serialize; the
 *                     absent binding does not fail and differs from the positive answer      -> supported
 *   contract-only     every binding executed but no fixture record yields a non-empty answer -> held (needs fixtures)
 *   failed            the template errors on the release baseline                             -> held (template defect)
 *   unsupported       GDS / vector / non-read                                                  -> unsupported
 *
 * Binding inference reads the statement only to find which label/property a `$param` is matched against
 * (`(x:Label {prop: $p})`, `x.prop = $p`, `x.prop IN $p`), then samples DISTINCT values of that label/property from
 * the fixture graph through a test (admin) client. It never edits a template.
 */

export interface TemplateRunResult {
  id: string;
  questionIds: string[];
  module: string;
  outcome: "fixture-positive" | "contract-only" | "failed" | "unsupported";
  positive: { status: string; rowCount: number; parameters: Record<string, unknown>; resultDigest: string } | null;
  negative: { status: string; rowCount: number; resultDigest: string } | null;
  combinationsTried: number;
  columnsMatch: boolean | null;
  reasons: string[];
  planFlags: string[];
  /** wall time of the first execution (includes cold planning) and of the slowest binding, ms */
  firstRunMs: number | null;
  maxRunMs: number | null;
}

interface Inference {
  label: string | null;
  prop: string | null;
}

const NOW = () => new Date().toISOString();
const svc_label = (l: string) => l;

function inferParam(statement: string, param: string): Inference {
  const s = statement.replace(/\/\/.*$/gm, "");
  const p = param.replace(/[$]/g, "");
  const inMap = new RegExp(`\\((\\w*)\\s*:\\s*\`?(\\w+)\`?(?:\\s*[:|&]\\s*\`?\\w+\`?)*\\s*\\{[^}]*?\\b(\\w+)\\s*:\\s*\\$${p}\\b`).exec(s);
  if (inMap) return { label: inMap[2]!, prop: inMap[3]! };
  const eq = new RegExp(`\\b(\\w+)\\.(\\w+)\\s*(?:=|IN|<=|>=|<|>|STARTS WITH|CONTAINS)\\s*\\$${p}\\b`).exec(s) ?? new RegExp(`\\$${p}\\s*(?:=|IN)\\s*(\\w+)\\.(\\w+)`).exec(s);
  if (eq) {
    const v = eq[1]!;
    const lab = new RegExp(`\\(${v}\\s*:\\s*\`?(\\w+)`).exec(s);
    return { label: lab ? lab[1]! : null, prop: eq[2]! };
  }
  const prop = new RegExp(`\\{[^}]*?\\b(\\w+)\\s*:\\s*\\$${p}\\b`).exec(s);
  if (prop) return { label: null, prop: prop[1]! };
  // `UNWIND $p AS v ... (x:Label {prop: v})`: infer through the unwound variable (first labelled match).
  const unwind = new RegExp(`UNWIND\\s+\\$${p}\\s+AS\\s+(\\w+)`).exec(s);
  if (unwind) {
    const v = unwind[1]!;
    const via = new RegExp(`\\((\\w*)\\s*:\\s*\`?(\\w+)\`?[^)]*?\\{[^}]*?\\b(\\w+)\\s*:\\s*${v}\\b`).exec(s);
    if (via) return { label: via[2]!, prop: via[3]! };
  }
  return { label: null, prop: null };
}

async function sample(admin: GraphClient, label: string | null, prop: string, limit = 10): Promise<unknown[]> {
  const q = label
    ? `MATCH (n:\`${label}\`) WHERE n.\`${prop}\` IS NOT NULL AND NOT n:LegacyV0 RETURN DISTINCT n.\`${prop}\` AS v ORDER BY v LIMIT ${limit}`
    : `MATCH (n) WHERE n.\`${prop}\` IS NOT NULL AND NOT n:LegacyV0 AND n.uid IS NOT NULL RETURN DISTINCT n.\`${prop}\` AS v ORDER BY v LIMIT ${limit}`;
  try {
    const res = await admin.read((tx) => tx.run(q));
    return res.records.map((r) => toJson(r.get("v"))).filter((v) => v !== null && (typeof v === "string" || typeof v === "number" || typeof v === "boolean"));
  } catch {
    return [];
  }
}

async function sampleRelProp(admin: GraphClient, prop: string, limit = 10): Promise<unknown[]> {
  try {
    const res = await admin.read((tx) => tx.run(`MATCH ()-[r]->() WHERE r.\`${prop}\` IS NOT NULL RETURN DISTINCT r.\`${prop}\` AS v ORDER BY v LIMIT ${limit}`));
    return res.records.map((r) => toJson(r.get("v"))).filter((v) => typeof v === "string" || typeof v === "number");
  } catch {
    return [];
  }
}

/** `$label` names the anchor uid's label: the released dynamic form `(x:$($label) {uid})` or the corrected `WHERE $label IN labels(x)` form. */
const dynamicLabel = (t: CatalogTemplate) => /\$\(\$label\)|\$label IN labels\(/.test(t.statement);

async function candidatesFor(admin: GraphClient, t: CatalogTemplate, name: string, uidPool: Array<{ uid: string; label: string }>, preferred: string[]): Promise<unknown[]> {
  const schema = t.parameters[name]!;
  // Temporal parameters: the current view, and an early instant so that (from, to] windows such as R1/R2 can be formed.
  if (schema.neo4jType === "DateTime") return /^(R1|V1|from|since|start)/i.test(name) ? ["2000-01-01T00:00:00Z", NOW()] : [NOW(), "2000-01-01T00:00:00Z"];
  if (schema.type === "boolean") return [false, true];
  if (schema.type === "integer") return [/day/i.test(name) ? 3650 : /^(k|n|limit|top)$/i.test(name) ? 10 : 10];
  if (schema.type === "number") return [0.5];
  if (schema.type === "array" && schema.items?.type === "number") return [[]];
  if (schema.type === "array" && schema.items?.type === "object") return [[]];
  if (name === "label" && dynamicLabel(t)) return [...new Set(uidPool.map((u) => u.label))].slice(0, 12);
  const inf = inferParam(t.statement, name);
  let vals: unknown[] = [];
  const uidLike = schema.pattern === "^hu:" || /uid$/i.test(name) || (schema.type === "array" && schema.items?.pattern === "^hu:") || inf.prop === "uid";
  if (uidLike) {
    // Fixture records first (the subjects and minted records the fixtures were written about), then a label sample.
    let label = inf.label ? svc_label(inf.label) : null;
    let fromPool = label ? uidPool.filter((u) => u.label === label).map((u) => u.uid) : [];
    if (label && !fromPool.length) {
      label = null;
      fromPool = [];
    }
    const pref = preferred.filter((u) => !label || fromPool.includes(u));
    vals = [...new Set([...pref, ...fromPool.slice(0, 20), ...(label ? [] : preferred)])].slice(0, 40);
  }
  if (!vals.length && inf.prop) {
    vals = await sample(admin, inf.label, inf.prop);
    if (!vals.length && !inf.label) vals = await sampleRelProp(admin, inf.prop);
  }
  if (!vals.length && uidLike) vals = preferred.slice(0, 40);
  if (!vals.length) vals = ["__s4_absent__"];
  if (schema.type === "array") return [vals.slice(0, 10), ...vals.slice(0, 3).map((v) => [v])];
  return vals;
}

function absentValue(t: CatalogTemplate, name: string): unknown {
  const schema = t.parameters[name]!;
  if (schema.neo4jType === "DateTime") return NOW();
  if (schema.type === "boolean") return false;
  if (schema.type === "integer") return 10;
  if (schema.type === "number") return 0.5;
  if (schema.type === "array") return [];
  if (name === "label" && dynamicLabel(t)) return "Assertion";
  if (schema.pattern === "^hu:" || /uid$/i.test(name)) return "hu:assertion:s4-absent-probe";
  return "__s4_absent__";
}

function* combinations(lists: Array<[string, unknown[]]>, max: number): Generator<Record<string, unknown>> {
  if (!lists.length) {
    yield {};
    return;
  }
  const idx = lists.map(() => 0);
  let n = 0;
  for (;;) {
    yield Object.fromEntries(lists.map(([k, v], i) => [k, v[idx[i]!]]));
    if (++n >= max) return;
    let i = lists.length - 1;
    while (i >= 0) {
      idx[i]!++;
      if (idx[i]! < lists[i]![1].length) break;
      idx[i] = 0;
      i--;
    }
    if (i < 0) return;
  }
}

export async function runCatalogAssertions(svc: ReadService, principal: ReadPrincipal, bindingRef: string, admin: GraphClient, opts: { maxCombinations?: number; timeoutMs?: number; only?: string[]; preferredUids?: string[] } = {}): Promise<TemplateRunResult[]> {
  const pool = (await admin.read((tx) => tx.run(`MATCH (n) WHERE n.uid IS NOT NULL AND NOT n:LegacyV0 WITH labels(n) AS ls, n.uid AS uid ORDER BY uid RETURN uid, ls`))).records.map((r) => ({ uid: String(r.get("uid")), labels: r.get("ls") as string[] }));
  const uidPool = pool.map((p) => ({ uid: p.uid, label: svc.model.primaryType(p.labels) ? svc.model.node(svc.model.primaryType(p.labels)!)!.primaryLabel : p.labels[0]! }));
  const out: TemplateRunResult[] = [];
  const pins = { schemaReleaseDigest: svc.model.schemaReleaseDigest, queryCatalogDigest: svc.model.queryCatalogDigest };
  for (const t of svc.catalog.templates) {
    if (t.status !== "supported") continue;
    if (opts.only && !opts.only.includes(t.id)) continue;
    const base: TemplateRunResult = { id: t.id, questionIds: t.questionIds, module: t.module, outcome: "unsupported", positive: null, negative: null, combinationsTried: 0, columnsMatch: null, reasons: [], planFlags: t.validation?.planFlags ?? [], firstRunMs: null, maxRunMs: null };
    const why = svc.catalog.unsupportedReason(t);
    if (why) {
      out.push({ ...base, reasons: [`${why.code}: ${why.message}`] });
      continue;
    }
    const names = Object.keys(t.parameters).sort();
    const lists: Array<[string, unknown[]]> = [];
    const preferred = opts.preferredUids ?? [];
    for (const n of names) lists.push([n, await candidatesFor(admin, t, n, uidPool, preferred)]);
    // `$($label)` + uid pairs: bind the uid's own primary label.
    const pairLabel = dynamicLabel(t) && names.includes("label") && names.some((n) => /uid$/i.test(n));
    const pairUid = names.find((n) => /uid$/i.test(n));
    const times: number[] = [];
    const run = async (params: Record<string, unknown>): Promise<ReadResultV2> => {
      const t0 = Date.now();
      const r = await svc.cypher({ schemaVersion: CYPHER_READ_INTENT_V1, intentId: `cat-${t.id.replace(/[^A-Za-z0-9._-]/g, "-")}`.slice(0, 110), pins, purpose: `catalog result assertion ${t.id}`, bindingRef, template: { id: t.id, statementDigest: t.statementDigest }, parameters: params, limits: { rowCap: 50, timeoutMs: opts.timeoutMs ?? 15_000 } }, principal);
      times.push(Date.now() - t0);
      return r;
    };
    let positive: ReadResultV2 | null = null;
    let positiveParams: Record<string, unknown> = {};
    let tried = 0;
    let lastFailure: string | null = null;
    const effective = pairLabel ? lists.filter(([k]) => k !== "label") : lists;
    for (const combo of combinations(effective, opts.maxCombinations ?? 30)) {
      if (pairLabel) {
        const u = uidPool.find((x) => x.uid === combo[pairUid!]);
        combo.label = u?.label ?? "Assertion";
      }
      tried++;
      const r = await run(combo);
      if (r.status === "ok" || r.status === "truncated") {
        positive = r;
        positiveParams = combo;
        break;
      }
      if (r.status === "failed" || r.status === "forbidden" || r.status === "unsupported") {
        lastFailure = `${r.status}: ${[...r.reasons, ...r.parts.flatMap((p) => p.reasons)].map((x) => `${x.code} ${x.message}`).join("; ").slice(0, 400)}`;
        if (r.parts.some((p) => p.reasons.some((x) => x.code === "DATABASE_ERROR" || x.code === "RESULT_SCHEMA_MISMATCH"))) break;
      }
    }
    const absent = Object.fromEntries(names.map((n) => [n, absentValue(t, n)]));
    const neg = await run(absent);
    const negPart = neg.parts[0];
    const posPart = positive?.parts[0];
    const columnsMatch = posPart ? posPart.columns.join(",") === t.outputColumns.join(",") : negPart && negPart.columns.length ? negPart.columns.join(",") === t.outputColumns.join(",") : null;
    const reasons: string[] = [];
    let outcome: TemplateRunResult["outcome"];
    if (positive && columnsMatch !== false && (names.length === 0 || (neg.status !== "failed" && neg.digests.resultDigest !== positive.digests.resultDigest))) outcome = "fixture-positive";
    else if (positive && columnsMatch === false) {
      outcome = "failed";
      reasons.push(`declared outputColumns [${t.outputColumns.join(", ")}] differ from returned [${posPart?.columns.join(", ")}]`);
    } else if (lastFailure && !positive) {
      outcome = "failed";
      reasons.push(lastFailure);
    } else if (positive) {
      outcome = "contract-only";
      reasons.push(`absent binding ${neg.status === "failed" ? "failed" : "returned the same answer as the positive binding"}`);
    } else {
      outcome = "contract-only";
      reasons.push(`executed ${tried} binding(s) from fixture records; every answer was empty (no fixture record exercises this pattern)`);
    }
    if (neg.status === "failed") reasons.push(`absent binding failed: ${neg.parts.flatMap((p) => p.reasons).map((x) => x.message).join("; ").slice(0, 300)}`);
    out.push({
      ...base,
      outcome,
      positive: positive ? { status: positive.status, rowCount: positive.parts[0]?.rowCount ?? 0, parameters: positiveParams, resultDigest: positive.digests.resultDigest } : null,
      negative: { status: neg.status, rowCount: negPart?.rowCount ?? 0, resultDigest: neg.digests.resultDigest },
      combinationsTried: tried,
      firstRunMs: times[0] ?? null,
      maxRunMs: times.length ? Math.max(...times) : null,
      columnsMatch,
      reasons,
    });
  }
  return out;
}
