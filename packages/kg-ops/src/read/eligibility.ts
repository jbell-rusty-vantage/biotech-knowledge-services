import { ELIGIBILITY_V1, type EligibilityItem, type MarkerOperation, type ReadEligibility, type ReadPartV3 } from "@bks/contracts";
import { markerKeyOf } from "../apply.js";
import { evaluateDecision, type DecisionLookup, type EligibilityAuthority } from "../admission/verification.js";
import type { CompiledOp } from "./typed.js";

/**
 * Eligibility-aware official reads (Sprint V SV-11, design section 7): a stale physical projection may exist in the
 * graph, but it must not authorize an official use after an observed revocation. For an official use the read service
 * revalidates every returned record that an admitted effect produced (reports, assertions, markers) against the
 * PostgreSQL authority: ineligible records are excluded and listed; an unavailable authority holds every part of the
 * official read (no record of any operation is served as eligible). Non-official reads are unchanged.
 *
 * R1 F8: every v3 operation is covered. `report`, `assertion` and `marker` rows always name their admission; for the
 * other operations (card, list, neighbors, resolve, evidence, history, association, status) every row that carries a
 * use decision reference anywhere in its projection (`useDecisionRef` on a projected Activity, Assessment, marker or
 * admission entry) is checked the same way and excluded when ineligible. Rows of those operations without a decision
 * reference are graph context, not admitted records, and are served as such (annotated on the part).
 */

/** Operations whose rows carry an admitted record (the Activity / marker names the use decision). */
export const ELIGIBILITY_SCOPED_OPS = new Set(["report", "assertion", "marker"]);

/** Admission fields of the generating Activity projected by v3 reads (kernel Activity, biotech-schema-v2.1.0/v2.2.0). */
export const ACTIVITY_ADMISSION_FIELDS = ["effectKey", "useDecisionRef", "useDecisionDigest", "boundEffectDigest", "revocationEpoch", "verificationRunRef", "runManifestDigest", "runSealKind"] as const;

const MARKER_FIELDS = ["markerKey", "effectKey", "status", "intentId", "intentDigest", "planRef", "planDigest", "receiptId", "graphRevision", "markerSchemaVersion", "dispatchId", "markerDigest", "payloadDigest", "boundEffectDigest", "useDecisionRef", "useDecisionDigest", "revocationEpoch", "appliedAt"];

/** `marker` lookup, always inside the principal's (installation, application, tenant) scope. */
export function compileMarker(o: MarkerOperation, scope: { installationId: string; applicationId: string; tenantId: string }): CompiledOp {
  const where = o.effectKey ? "m.markerKey = $markerKey" : o.dispatchId ? "m.dispatchId = $dispatchId" : "m.markerDigest = $markerDigest";
  const statement = `MATCH (m:KsIntentMarker) WHERE ${where} AND m.installationId = $installationId AND m.applicationId = $applicationId AND m.tenantId = $tenantId
RETURN m {${MARKER_FIELDS.map((f) => `.${f}`).join(", ")}} AS marker, toString(m.finishedAt) AS finishedAt
ORDER BY marker.markerKey LIMIT 2`;
  const params: Record<string, unknown> = { ...scope, markerKey: o.effectKey ? markerKeyOf(scope, o.effectKey) : null, dispatchId: o.dispatchId ?? null, markerDigest: o.markerDigest ?? null };
  return { opId: o.opId, op: o.op, steps: [{ statement, params }], annotations: { scope: "principal installation/application/tenant", markerShape: "bks-intent-marker.v2 (rules/operational-names.yaml markerShapes)" } };
}

interface Candidate {
  part: number;
  row: number;
  recordUid: string;
  refs: Array<{ id: string; digest: string | null }>;
}

const str = (v: unknown): string | null => (typeof v === "string" && v ? v : null);

/** Every use decision reference anywhere in a row value (depth-bounded), with the uid of the record that carries it. */
function collectRefs(value: unknown, refs: Candidate["refs"], uids: string[], depth = 0): void {
  if (depth > 8 || value === null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const v of value) collectRefs(v, refs, uids, depth + 1);
    return;
  }
  const o = value as Record<string, unknown>;
  const id = str(o.useDecisionRef);
  if (id) {
    if (!refs.some((x) => x.id === id)) refs.push({ id, digest: str(o.useDecisionDigest) });
    const uid = str(o.uid) ?? str(o.markerKey);
    if (uid) uids.push(uid);
  }
  for (const v of Object.values(o)) collectRefs(v, refs, uids, depth + 1);
}

function candidatesOf(parts: ReadPartV3[]): Candidate[] {
  const out: Candidate[] = [];
  parts.forEach((p, pi) => {
    if (!ELIGIBILITY_SCOPED_OPS.has(p.op)) {
      p.rows.forEach((r, ri) => {
        const refs: Candidate["refs"] = [];
        const uids: string[] = [];
        collectRefs(r, refs, uids);
        if (!refs.length) return;
        const top = (r.node ?? r.record ?? r) as Record<string, unknown>;
        out.push({ part: pi, row: ri, recordUid: str(top.uid) ?? uids[0] ?? `${p.op}#${ri}`, refs });
      });
      return;
    }
    p.rows.forEach((r, ri) => {
      let recordUid = "";
      const refs: Candidate["refs"] = [];
      if (p.op === "marker") {
        const m = (r.marker ?? {}) as Record<string, unknown>;
        recordUid = String(m.markerKey ?? "");
        const id = str(m.useDecisionRef);
        if (id) refs.push({ id, digest: str(m.useDecisionDigest) });
      } else {
        const rec = ((p.op === "report" ? r.report : r.assertion) ?? {}) as Record<string, unknown>;
        recordUid = String(rec.uid ?? "");
        for (const act of (r.admission as Array<Record<string, unknown>> | undefined) ?? []) {
          const id = str(act.useDecisionRef);
          if (id && !refs.some((x) => x.id === id)) refs.push({ id, digest: str(act.useDecisionDigest) });
        }
      }
      out.push({ part: pi, row: ri, recordUid, refs });
    });
  });
  return out;
}

export interface EligibilityOutcome {
  parts: ReadPartV3[];
  eligibility: ReadEligibility;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Looks up the decisions of every candidate; never throws (an unavailable authority is a result). */
export async function lookupDecisions(authority: EligibilityAuthority | null, tenantId: string, parts: ReadPartV3[]): Promise<{ lookup: DecisionLookup | null; detail: string | null }> {
  const ids = [...new Set(candidatesOf(parts).flatMap((c) => c.refs.map((r) => r.id)))];
  if (!authority) return { lookup: null, detail: "no verification authority is configured (BKS_BIOTECH_DB_VERIFICATION_READ_DSN / BKS_BIOTECH_DB_VERIFICATION_DSN)" };
  if (!UUID.test(tenantId)) return { lookup: null, detail: "the principal tenant is not a knowledge_verification tenant uuid" };
  try {
    return { lookup: await authority.decisions(tenantId, ids), detail: null };
  } catch (e) {
    return { lookup: null, detail: (e as Error).message.slice(0, 400) };
  }
}

/**
 * Applies eligibility to the parts of an official read. Authority unavailable: every eligibility-scoped part with rows
 * is held (status skipped, READ_AUTHORITY_UNAVAILABLE, rows withheld). Otherwise ineligible rows are excluded.
 */
export function applyEligibility(parts: ReadPartV3[], authority: { lookup: DecisionLookup | null; detail: string | null; tenantId: string | null }, now: Date): EligibilityOutcome {
  const candidates = candidatesOf(parts);
  const items: EligibilityItem[] = [];
  const excludedRows = new Map<number, Set<number>>();
  const revokedIn = new Set<number>();
  const exclude = (c: Candidate) => {
    if (!excludedRows.has(c.part)) excludedRows.set(c.part, new Set());
    excludedRows.get(c.part)!.add(c.row);
  };
  const lookup = authority.lookup;
  let held = 0;
  let decisionEpoch: number | null = null;
  for (const c of candidates) {
    const part = parts[c.part]!;
    const base = { opId: part.opId, recordUid: c.recordUid, useDecisionId: c.refs[0]?.id ?? null, useDecisionDigest: c.refs[0]?.digest ?? null };
    if (!lookup) {
      items.push({ ...base, state: "authority_unavailable", served: false, reason: authority.detail, decisionEpoch: null, disposition: null, expiresAt: null });
      continue;
    }
    if (!c.refs.length) {
      exclude(c);
      items.push({ ...base, state: "unadmitted", served: false, reason: "no use decision reference on the generating Activity / marker", decisionEpoch: null, disposition: null, expiresAt: null });
      continue;
    }
    let state: EligibilityItem["state"] = "eligible";
    let reason: string | null = null;
    let rec = undefined as ReturnType<DecisionLookup["records"]["get"]>;
    for (const ref of c.refs) {
      rec = lookup.records.get(ref.id);
      const v = evaluateDecision(rec, { digest: ref.digest }, now);
      if (rec) decisionEpoch = decisionEpoch === null ? rec.revocationEpoch : Math.min(decisionEpoch, rec.revocationEpoch);
      if (v.state !== "eligible") {
        state = v.state;
        reason = v.reason;
        if (v.state === "revoked") break;
      }
    }
    const served = state === "eligible";
    if (!served) exclude(c);
    if (state === "revoked") revokedIn.add(c.part);
    items.push({ ...base, state, served, reason, decisionEpoch: rec?.revocationEpoch ?? null, disposition: rec?.disposition ?? null, expiresAt: rec?.expiresAt ?? null });
  }
  const scopedParts = new Set(candidates.map((c) => c.part));
  // Authority unavailable: the whole official read holds, every operation (no record served as eligible).
  if (!lookup) held = parts.reduce((n, p) => n + p.rows.length, 0);
  const out = parts.map((p, pi): ReadPartV3 => {
    if (!lookup && p.rows.length) return { ...p, status: "skipped", rows: [], rowCount: 0, reasons: [...p.reasons, { code: "READ_AUTHORITY_UNAVAILABLE", message: `official use holds: eligibility authority unavailable (${authority.detail ?? "unknown"}); ${p.rows.length} record(s) withheld, none served as eligible` }] };
    const context = !ELIGIBILITY_SCOPED_OPS.has(p.op) ? { annotations: { ...(p.annotations ?? {}), officialUse: "rows carrying a use decision reference were revalidated; rows without one are graph context, not admitted records" } } : {};
    if (!scopedParts.has(pi)) return { ...p, ...context };
    const ex = excludedRows.get(pi);
    if (!ex?.size) return { ...p, ...context };
    const rows = p.rows.filter((_r, ri) => !ex.has(ri));
    const reasons = [...p.reasons, { code: "USE_INELIGIBLE" as const, message: `${ex.size} record(s) excluded: not eligible for official use at the authoritative epoch (see eligibility.items)` }];
    const status = rows.length ? p.status : revokedIn.has(pi) ? "forbidden" : "stale";
    return { ...p, ...context, rows, rowCount: rows.length, reasons, status };
  });
  const excluded = [...excludedRows.values()].reduce((n, s) => n + s.size, 0);
  const state: ReadEligibility["state"] = !lookup ? "authority_unavailable" : items.some((i) => i.state === "revoked") ? "revoked" : items.some((i) => i.state !== "eligible") ? "stale" : "eligible";
  return {
    parts: out,
    eligibility: {
      format: ELIGIBILITY_V1,
      checkedAt: now.toISOString(),
      authoritativeEpoch: lookup?.authoritativeEpoch ?? null,
      decisionEpoch,
      state,
      authority: { component: "knowledge_verification", available: Boolean(lookup), tenantId: authority.tenantId, detail: authority.detail },
      items,
      excluded,
      held,
    },
  };
}
