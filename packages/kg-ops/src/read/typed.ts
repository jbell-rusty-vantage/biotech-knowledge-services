import neo4j from "neo4j-driver";
import type { NodeType } from "@bks/schema-workspace";
import type { ReadLimits, ReadReason, TypedOperation } from "./contracts.js";
import type { ReadModel, ReadScope } from "./visibility.js";
import { writeSchema } from "../write/service.js";
import { ACTIVITY_ADMISSION_FIELDS } from "./eligibility.js";

/**
 * Typed read operations v2 (biotech-knowledge-read-intent.v2) compiled to parameterized Cypher 5 over the v2 patterns:
 * HAS_EVIDENCE {role, origin} -> SourceLocator <- HAS_LOCATOR - SourceSnapshot <- HAS_SNAPSHOT - Source; Adjudication
 * -ASSESSES-> Assertion; WAS_GENERATED_BY -> Activity {runId}; OCCURRENCE_OF -> Claim; DERIVED_FROM; asserted episodes
 * (relationshipUid, assertionUid, valid*, recorded*); HAS_IDENTIFIER episodes; LabelVersion and other versioned state.
 *
 * Every node variable carries the visibility predicate of the binding scope (ReadModel.visible) and every projection
 * names release properties (ReadModel.projectableProperties); nothing is spliced from caller text: labels and property
 * names come from the release model, values are parameters. Each statement orders its rows deterministically.
 */

export interface CompiledStep {
  statement: string;
  params: Record<string, unknown>;
  /** Row cap of this step (the statement LIMIT is rowCap + 1: the overflow probe). */
  rowCap?: number;
  /** rowCap applies to this step alone (several independent steps feed one part, e.g. resolve mentions). */
  perStep?: boolean;
  /** Post-processing of normalized rows (pure, deterministic). */
  post?: (rows: Array<Record<string, unknown>>) => Array<Record<string, unknown>>;
}

export interface CompiledOp {
  opId: string;
  op: string;
  steps: CompiledStep[];
  /** A static answer when the operation cannot run (unsupported / forbidden), with typed reasons. */
  refused?: { status: "unsupported" | "forbidden"; reasons: ReadReason[] };
  /** Notes attached to the part (e.g. status meanings, policy versions); semantic, part of the result digest. */
  annotations?: Record<string, unknown>;
}

/** KN-15 claim-lifecycle decision table meanings (rules/projection-rules.yaml PR-04): status is capture fidelity, never truth. */
export const STATUS_MEANING: Record<string, string> = {
  EXTRACTED: "captured but unadjudicated (capture fidelity unknown; not a truth value)",
  PROPOSED: "held for review (capture fidelity not accepted; not a truth value)",
  ACCEPTED: "capture fidelity accepted: the record matches its declared span; NOT a scientific truth or support verdict",
  REJECTED: "capture fidelity rejected",
  SUPERSEDED: "replaced by a later assertion of the same asserter (supersedesUid); historical",
  RETRACTED: "withdrawn by its asserter",
};

const EPISODE_VALIDITY = (r: string, vt: string) => `CASE
  WHEN ${vt} IS NULL THEN 'NOT_REQUESTED'
  WHEN (${r}.validFrom IS NOT NULL AND ${r}.validFrom > ${vt}) OR (${r}.validTo IS NOT NULL AND ${r}.validTo <= ${vt}) THEN 'OUTSIDE'
  WHEN ${r}.validFrom IS NOT NULL AND ${r}.validTo IS NOT NULL THEN 'KNOWN_WITHIN'
  WHEN ${r}.validFrom IS NULL AND ${r}.validTo IS NOT NULL THEN 'UNKNOWN_START'
  WHEN ${r}.validFrom IS NULL AND ${r}.validTo IS NULL THEN 'UNKNOWN_BOTH_BOUNDS'
  ELSE 'OPEN_END_UNVERIFIED' END`;

const RECORDED_AT = (r: string, rt: string, from = "recordedFrom") => `(${rt} IS NULL AND ${r}.recordedTo IS NULL OR ${rt} IS NOT NULL AND (${r}.${from} IS NULL OR ${r}.${from} <= ${rt}) AND (${r}.recordedTo IS NULL OR ${r}.recordedTo > ${rt}))`;

function dt(v: string | undefined): unknown {
  return v ? neo4j.types.DateTime.fromStandardDate(new Date(v)) : null;
}

const sortBy = (keys: string[]) => (a: Record<string, unknown>, b: Record<string, unknown>) => {
  for (const k of keys) {
    const x = JSON.stringify(a[k] ?? null);
    const y = JSON.stringify(b[k] ?? null);
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
};

export class TypedCompiler {
  constructor(private readonly model: ReadModel, private readonly scope: ReadScope, private readonly limits: ReadLimits, private readonly options: { admissionFields?: boolean } = {}) {}

  /**
   * v3 reads (SV-11): an `admission` column with the admission binding of the generating Activity (use decision ref /
   * digest, effect key, epoch). These are immutable references, projected even when the (INTERNAL) Activity itself is
   * not visible in the binding scope, because an official use must be able to revalidate the record it is served.
   */
  private admission(v: string): string {
    if (!this.options.admissionFields) return "";
    return `,\n  COLLECT { MATCH (${v})-[:WAS_GENERATED_BY]->(adm:Activity) WHERE adm.useDecisionRef IS NOT NULL RETURN {${ACTIVITY_ADMISSION_FIELDS.map((f) => `${f}: adm.${f}`).join(", ")}} } AS admission`;
  }

  private vis(v: string): string {
    return this.model.visible(v, this.scope);
  }

  /** `v {.p1, .p2, ...}` with the release-declared, policy-permitted properties of `type`. */
  private proj(v: string, type: string, extra = ""): string {
    const props = this.model.projectableProperties(type, this.scope).filter((p) => p !== "id");
    return `${v} {${[...props.map((p) => `.${p}`), ...(extra ? [extra] : [])].join(", ")}}`;
  }

  private summary(v: string): string {
    return `{uid: ${v}.uid, name: ${v}.name, labels: [__lb IN labels(${v}) WHERE NOT __lb IN $__opLabels], updatedAt: ${v}.updatedAt}`;
  }

  private edgeProj(r: string, types: string[]): string {
    const f = this.model.edgeFields(types);
    return `${r} {${f.map((p) => `.${p}`).join(", ")}}`;
  }

  private cap(limit: number): number {
    return Math.min(limit, this.limits.rowCap) + 1; // one-row overflow probe
  }

  private anchor(uid: string): NodeType | null {
    return this.model.typeOfUid(uid);
  }

  private unknownType(o: { opId: string; op: string }, uid: string): CompiledOp {
    return { opId: o.opId, op: o.op, steps: [], refused: { status: "unsupported", reasons: [{ code: "UNKNOWN_TYPE", message: `uid ${uid} does not carry a release uid token` }] } };
  }

  compile(o: TypedOperation): CompiledOp {
    const vp = this.model.visibilityParams();
    switch (o.op) {
      case "resolve":
        return this.resolve(o, vp);
      case "card": {
        const t = this.anchor(o.uid);
        if (!t) return this.unknownType(o, o.uid);
        const statement = `MATCH (n:\`${t.primaryLabel}\` {uid: $uid}) WHERE ${this.vis("n")}
RETURN ${this.proj("n", t.name)} AS node, [__lb IN labels(n) WHERE NOT __lb IN $__opLabels] AS labels,
  COLLECT { MATCH (n)-[h:HAS_IDENTIFIER]->(i:Identifier) WHERE h.recordedTo IS NULL AND ${this.vis("i")} RETURN {scheme: i.scheme, issuer: i.issuer, value: i.value, isPrimary: h.isPrimary, validFrom: h.validFrom, validTo: h.validTo} } AS identifiers,
  COLLECT { MATCH (n)-[r]-(m) WHERE ${this.model.visibleRel("r")} AND ${this.vis("m")} WITH type(r) AS t, CASE WHEN startNode(r) = n THEN 'OUT' ELSE 'IN' END AS d, count(*) AS c RETURN {type: t, direction: d, count: c} } AS relationshipCounts${this.admission("n")}`;
        return {
          opId: o.opId,
          op: o.op,
          steps: [{ statement, params: { ...vp, uid: o.uid }, post: (rows) => rows.map((r) => ({ ...r, type: t.name, identifiers: [...((r.identifiers as Array<Record<string, unknown>>) ?? [])].sort(sortBy(["scheme", "issuer", "value"])), relationshipCounts: [...((r.relationshipCounts as Array<Record<string, unknown>>) ?? [])].sort(sortBy(["type", "direction"])), labels: [...((r.labels as string[]) ?? [])].sort() })) }],
          annotations: { projection: `release properties of ${t.name}${this.model.restrictedProperties(t.name, this.scope).length ? `; restricted in scope ${this.scope}: ${this.model.restrictedProperties(t.name, this.scope).join(", ")}` : ""}` },
        };
      }
      case "list": {
        const t = this.model.node(o.nodeType);
        if (!t) return { opId: o.opId, op: o.op, steps: [], refused: { status: "unsupported", reasons: [{ code: "UNKNOWN_TYPE", message: `${o.nodeType} is not a release node type` }] } };
        const allowed = new Set(this.model.projectableProperties(t.name, this.scope));
        const conds = [this.vis("n"), "($after IS NULL OR n.uid > $after)"];
        const params: Record<string, unknown> = { ...vp, after: o.after ?? null, lim: neo4j.int(this.cap(o.limit)) };
        let i = 0;
        for (const [k, v] of Object.entries(o.where)) {
          if (!allowed.has(k)) {
            const restricted = this.model.restrictedProperties(t.name, this.scope).includes(k) || this.model.operationalProperties.has(k);
            return { opId: o.opId, op: o.op, steps: [], refused: { status: restricted ? "forbidden" : "unsupported", reasons: [{ code: restricted ? "PROPERTY_FORBIDDEN" : "PARAMETER_INVALID", message: `${t.name}.${k} is ${restricted ? "restricted in this scope" : "not a release property"}`, path: k }] } };
          }
          const prop = t.properties.find((p) => p.storedName === k)!;
          const key = `w${i++}`;
          const temporal = prop.namedType === "DateTime";
          conds.push(`n.\`${k}\` = $${key}`);
          params[key] = temporal && typeof v === "string" ? dt(v) : typeof v === "number" && Number.isInteger(v) && prop.namedType === "Int" ? neo4j.int(v) : v;
        }
        return { opId: o.opId, op: o.op, steps: [{ statement: `MATCH (n:\`${t.primaryLabel}\`) WHERE ${conds.join(" AND ")} RETURN ${this.proj("n", t.name)} AS node${this.admission("n")} ORDER BY n.uid LIMIT $lim`, params, rowCap: this.cap(o.limit) - 1 }] };
      }
      case "neighbors": {
        const t = this.anchor(o.uid);
        if (!t) return this.unknownType(o, o.uid);
        for (const rt of o.relationshipTypes) if (!this.model.isPermittedRelationshipType(rt)) return { opId: o.opId, op: o.op, steps: [], refused: { status: "forbidden", reasons: [{ code: "RELATIONSHIP_FORBIDDEN", message: `${rt} is not a readable release relationship type`, path: rt }] } };
        const typeExpr = o.relationshipTypes.length ? `:${o.relationshipTypes.map((x) => `\`${x}\``).join("|")}` : "";
        const pattern = o.direction === "OUT" ? `(n)-[r${typeExpr}]->(m)` : o.direction === "IN" ? `(n)<-[r${typeExpr}]-(m)` : `(n)-[r${typeExpr}]-(m)`;
        const statement = `MATCH (n:\`${t.primaryLabel}\` {uid: $uid}) WHERE ${this.vis("n")}
MATCH ${pattern} WHERE ${this.model.visibleRel("r")} AND ${this.vis("m")} AND ${RECORDED_AT("r", "$rt")}
WITH n, r, m, ${EPISODE_VALIDITY("r", "$vt")} AS validityClass WHERE validityClass <> 'OUTSIDE'
RETURN type(r) AS type, CASE WHEN startNode(r) = n THEN 'OUT' ELSE 'IN' END AS direction, ${this.summary("m")} AS node, ${this.edgeProj("r", o.relationshipTypes)} AS edge, validityClass${this.admission("m")}
ORDER BY type, direction, node.uid, edge.relationshipUid LIMIT $lim`;
        return { opId: o.opId, op: o.op, steps: [{ statement, params: { ...vp, uid: o.uid, rt: dt(o.view.recordedAsOf), vt: dt(o.view.validAt), lim: neo4j.int(this.cap(o.limit)) }, rowCap: this.cap(o.limit) - 1 }], annotations: { temporalView: { recordedAsOf: o.view.recordedAsOf ?? "current (open episodes)", validAt: o.view.validAt ?? "not requested" } } };
      }
      case "assertion":
        return this.assertion(o, vp);
      case "evidence": {
        const t = this.anchor(o.uid);
        if (!t) return this.unknownType(o, o.uid);
        const statement = `MATCH (x:\`${t.primaryLabel}\` {uid: $uid}) WHERE ${this.vis("x")}
MATCH (x)-[e:HAS_EVIDENCE]->(l:SourceLocator) WHERE ${this.vis("l")}
OPTIONAL MATCH (snap:SourceSnapshot)-[:HAS_LOCATOR]->(l) WHERE ${this.vis("snap")}
OPTIONAL MATCH (src:Source)-[:HAS_SNAPSHOT]->(snap) WHERE ${this.vis("src")}
WITH x, e, l, snap, src, COLLECT { MATCH (src)-[:HAS_SNAPSHOT]->(later:SourceSnapshot) WHERE ${this.vis("later")} AND later.retrievedAt > snap.retrievedAt RETURN {uid: later.uid, retrievedAt: later.retrievedAt, revisionKind: later.revisionKind, revisesSnapshotUid: later.revisesSnapshotUid} } AS laterCaptures
RETURN {role: e.role, origin: e.origin, authority: e.authority, independence: e.independence, facet: e.facet, expectedSelectedContentDigest: e.expectedSelectedContentDigest} AS edge,
  ${this.proj("l", "SourceLocator")} AS locator, CASE WHEN snap IS NULL THEN NULL ELSE ${this.proj("snap", "SourceSnapshot")} END AS snapshot,
  CASE WHEN src IS NULL THEN NULL ELSE ${this.proj("src", "Source")} END AS source, laterCaptures,
  CASE WHEN snap IS NULL OR src IS NULL THEN 'UNKNOWN'
       WHEN any(s IN laterCaptures WHERE s.revisionKind IS NOT NULL) THEN 'REVISED'
       WHEN size(laterCaptures) > 0 THEN 'HISTORICAL'
       ELSE 'CURRENT' END AS evidenceState${this.admission("x")}
ORDER BY edge.role, edge.origin, locator.uid LIMIT $lim`;
        return { opId: o.opId, op: o.op, steps: [{ statement, params: { ...vp, uid: o.uid, lim: neo4j.int(this.cap(o.limit)) }, rowCap: this.cap(o.limit) - 1, post: (rows) => rows.map((r) => ({ ...r, laterCaptures: [...((r.laterCaptures as Array<Record<string, unknown>>) ?? [])].sort(sortBy(["uid"])) })) }], annotations: { evidenceStates: { CURRENT: "the cited snapshot is the latest visible capture of its source", HISTORICAL: "a later capture of the same source exists; the citation is to an earlier version", REVISED: "a later capture records a publisher revision (retraction, erratum, ...)", UNKNOWN: "the snapshot or source is not visible or missing: evidence state unknown, not absent" } } };
      }
      case "history": {
        const t = this.anchor(o.uid);
        if (!t) return this.unknownType(o, o.uid);
        if (!this.model.isPermittedRelationshipType(o.relationshipType)) return { opId: o.opId, op: o.op, steps: [], refused: { status: "forbidden", reasons: [{ code: "RELATIONSHIP_FORBIDDEN", message: `${o.relationshipType} is not readable` }] } };
        const statement = `MATCH (n:\`${t.primaryLabel}\` {uid: $uid}) WHERE ${this.vis("n")}
MATCH (n)-[r:\`${o.relationshipType}\`]->(m) WHERE ${this.vis("m")}
WITH n, r, m, COLLECT { MATCH (a:Assertion {uid: r.assertionUid}) WHERE ${this.vis("a")} RETURN {uid: a.uid, status: a.status, polarity: a.polarity, supersedesUid: a.supersedesUid, recordedAt: a.recordedAt, recordedTo: a.recordedTo} } AS auth
RETURN ${this.summary("m")} AS target, ${this.edgeProj("r", [o.relationshipType])} AS episode, auth[0] AS assertion,
  CASE WHEN r.recordedTo IS NULL THEN 'OPEN' ELSE 'CLOSED' END AS recordedState,
  CASE WHEN $rt IS NULL THEN NULL ELSE (r.recordedFrom IS NULL OR r.recordedFrom <= $rt) AND (r.recordedTo IS NULL OR r.recordedTo > $rt) END AS currentAtRecordedAsOf,
  ${EPISODE_VALIDITY("r", "$vt")} AS validityClass
ORDER BY episode.recordedFrom, episode.validFrom, episode.relationshipUid LIMIT $lim`;
        return { opId: o.opId, op: o.op, steps: [{ statement, params: { ...vp, uid: o.uid, rt: dt(o.view.recordedAsOf), vt: dt(o.view.validAt), lim: neo4j.int(this.cap(o.limit)) }, rowCap: this.cap(o.limit) - 1 }], annotations: { relationshipClass: this.model.relationshipClass(o.relationshipType), temporal: "recorded time (recordedFrom/recordedTo: when the graph knew) and valid time (validFrom/validTo: when it held in the world) are independent; null bounds are unknown, never 'ongoing'" } };
      }
      case "report": {
        const statement = `MATCH (r:Report {uid: $uid}) WHERE ${this.vis("r")}
RETURN ${this.proj("r", "Report")} AS report,
  COLLECT { MATCH (r)-[:ASSESSES]->(x) WHERE ${this.vis("x")} RETURN ${this.summary("x")} } AS about,
  COLLECT { MATCH (r)-[:DERIVED_FROM]->(a:Assertion) WHERE ${this.vis("a")} RETURN {uid: a.uid, predicate: a.predicate, status: a.status, polarity: a.polarity} } AS citesAssertions,
  COLLECT { MATCH (r)-[:DERIVED_FROM]->(s:Assessment) WHERE ${this.vis("s")} RETURN {uid: s.uid, assessmentKind: s.assessmentKind, disposition: s.disposition, verdict: s.verdict} } AS citesAssessments,
  COLLECT { MATCH (r)-[e:HAS_EVIDENCE]->(l:SourceLocator) WHERE ${this.vis("l")} RETURN {role: e.role, origin: e.origin, locatorUid: l.uid, selectorDigest: l.selectorDigest} } AS evidence,
  COLLECT { MATCH (r)-[:WAS_GENERATED_BY]->(act:Activity) WHERE ${this.vis("act")} RETURN {uid: act.uid, activityKind: act.activityKind, externalRunSystem: act.externalRunSystem, runId: act.runId, missionId: act.missionId, policyVersion: act.policyVersion, bundleDigest: act.bundleDigest} } AS generatedBy,
  COLLECT { MATCH (r)-[h:HAS_ITEM]->(it:ReportItem) WHERE ${this.vis("it")} RETURN {itemKey: it.itemKey, itemKind: it.itemKind, sectionKind: it.sectionKind, uid: it.uid, derivedFrom: COLLECT { MATCH (it)-[:DERIVED_FROM]->(d) WHERE ${this.vis("d")} RETURN d.uid }} } AS items${this.admission("r")}`;
        return {
          opId: o.opId,
          op: o.op,
          steps: [{ statement, params: { ...vp, uid: o.reportUid }, post: (rows) => rows.map((r) => {
            const sorted: Record<string, unknown> = { ...r };
            for (const k of ["about", "citesAssertions", "citesAssessments", "evidence", "generatedBy", "items"]) sorted[k] = [...((r[k] as Array<Record<string, unknown>>) ?? [])].sort(sortBy(["uid", "locatorUid", "itemKey"]));
            if (r.admission !== undefined) sorted.admission = [...((r.admission as Array<Record<string, unknown>>) ?? [])].sort(sortBy(["useDecisionRef", "effectKey"]));
            const rep = r.report as Record<string, unknown> | null;
            sorted.sentenceTrace = rep?.ledgerDigest ? { ledgerDigest: rep.ledgerDigest, state: "LEDGER_IN_REPORT_CUSTODY", note: "KN-11: sentence-level evidence is the sealed report ledger keyed by sentence id/digest; resolve the ledger bytes by digest in report custody" } : { ledgerDigest: null, state: "NO_LEDGER", note: "this report has no sealed sentence ledger; only report-level citations (DERIVED_FROM / HAS_EVIDENCE) are available" };
            return sorted;
          }) }],
        };
      }
      case "association": {
        const t = this.anchor(o.anchorUid);
        if (!t) return this.unknownType(o, o.anchorUid);
        if (o.expansion) {
          return { opId: o.opId, op: o.op, steps: [], refused: { status: "unsupported", reasons: [{ code: "ONTOLOGY_ARTIFACT_ABSENT", message: `MD-D2-03: ${o.expansion.ontology} ancestor expansion needs a versioned ontology/ancestor mapping artifact; the pinned release ships none${o.expansion.artifact ? " and this service has no ontology-artifact custody to verify the cited one" : ""}. Query the anchor without expansion.` }] } };
        }
        const statement = `MATCH (x:\`${t.primaryLabel}\` {uid: $uid}) WHERE ${this.vis("x")}
MATCH (a:Association) WHERE a.anchorUid = x.uid AND ${this.vis("a")} AND a.recordedTo IS NULL
RETURN ${this.proj("a", "Association")} AS association,
  COLLECT { MATCH (a)-[e:ASSOCIATES]->(m) WHERE ${this.vis("m")} RETURN {member: ${this.summary("m")}, score: e.score, derivationRule: e.derivationRule} } AS members,
  COLLECT { MATCH (a)-[:DERIVED_FROM]->(i:Assertion) WHERE ${this.vis("i")} RETURN i.uid } AS inputs
ORDER BY association.uid LIMIT $lim`;
        return { opId: o.opId, op: o.op, steps: [{ statement, params: { ...vp, uid: o.anchorUid, lim: neo4j.int(this.cap(o.limit)) }, rowCap: this.cap(o.limit) - 1, post: (rows) => rows.map((r) => ({ ...r, members: [...((r.members as Array<Record<string, unknown>>) ?? [])].sort((p, q) => sortBy(["uid"])((p.member as Record<string, unknown>) ?? {}, (q.member as Record<string, unknown>) ?? {})), inputs: [...((r.inputs as string[]) ?? [])].sort() })) }], annotations: { meaning: "an Association is a derived analytical projection (method + inputs), never a sourced fact" } };
      }
      case "status": {
        const t = this.anchor(o.uid);
        if (!t) return this.unknownType(o, o.uid);
        const statement = `MATCH (x:\`${t.primaryLabel}\` {uid: $uid}) WHERE ${this.vis("x")}
MATCH (ls:LegalStatus)-[r:STATUS_OF]->(x) WHERE ${this.vis("ls")} AND ${RECORDED_AT("r", "$rt")}
WITH ls, r, ${EPISODE_VALIDITY("r", "$vt")} AS validityClass WHERE validityClass <> 'OUTSIDE'
RETURN ${this.proj("ls", "LegalStatus")} AS status, ${this.edgeProj("r", ["STATUS_OF"])} AS episode, validityClass,
  COLLECT { MATCH (ls)-[:STATUS_FROM]->(rec) WHERE ${this.vis("rec")} RETURN ${this.summary("rec")} } AS establishedBy
ORDER BY status.statusFamily, status.statusKind, status.uid LIMIT $lim`;
        const policy = this.nonImplication();
        return {
          opId: o.opId,
          op: o.op,
          steps: [{ statement, params: { ...vp, uid: o.uid, rt: dt(o.view.recordedAsOf), vt: dt(o.view.validAt), lim: neo4j.int(this.cap(o.limit)) }, rowCap: this.cap(o.limit) - 1, post: (rows) => rows.map((r) => {
            const s = (r.status as Record<string, unknown>) ?? {};
            const fam = String(s.statusFamily ?? "");
            const kind = String(s.statusKind ?? "");
            const notImplied = policy.cases.filter((c) => (fam === "IP_RIGHT" && /patent/i.test(c.premise)) || (fam === "MARKET_ACCESS" && kind === "APPROVAL" && /approval for one/i.test(c.premise)) || (fam === "MARKET_ACCESS" && kind !== "APPROVAL" && /registration|listing|notice/i.test(c.premise)) || (fam === "EXCLUSIVITY" && /licence/i.test(c.premise)) || /withdrawal|no current listing/i.test(c.premise)).map((c) => ({ premise: c.premise, notImplied: c.notImplied, rule: c.rule, decision: c.decision }));
            return { ...r, establishedBy: [...((r.establishedBy as Array<Record<string, unknown>>) ?? [])].sort(sortBy(["uid"])), notImplied };
          }) }],
          annotations: { nonImplicationPolicy: { id: policy.id, name: policy.name, rule: policy.rule, source: "rules/projection-rules.yaml" } },
        };
      }
    }
  }

  private nonImplication(): { id: string; name: string; rule: string; cases: Array<{ premise: string; notImplied: string; rule: string; decision: string }> } {
    const rules = (this.model.release.rules as Record<string, { policies?: Array<Record<string, unknown>> }>).projection;
    const p = (rules?.policies ?? []).find((x) => x.id === "PR-01") as { id: string; name: string; rule: string; negativeCases?: Array<{ premise: string; notImplied: string; rule: string; decision: string }> } | undefined;
    return { id: p?.id ?? "PR-01", name: p?.name ?? "status-nonimplication/v1", rule: p?.rule ?? "", cases: p?.negativeCases ?? [] };
  }

  private resolve(o: Extract<TypedOperation, { op: "resolve" }>, vp: Record<string, unknown>): CompiledOp {
    const ws = writeSchema();
    const steps: CompiledStep[] = [];
    const lim = neo4j.int(Math.min(o.limitPerMention, this.limits.rowCap));
    const chain = o.identifierChain
      ? `COLLECT { MATCH (n)-[h2:HAS_IDENTIFIER]->(j:Identifier) WHERE h2.recordedTo IS NULL AND ${this.vis("j")} RETURN {scheme: j.scheme, issuer: j.issuer, value: j.value, isPrimary: h2.isPrimary} }`
      : "[]";
    const out = (basis: string, score: number) => `RETURN $mentionId AS mentionId, n.uid AS uid, [__lb IN labels(n) WHERE NOT __lb IN $__opLabels] AS labels, n.name AS name, '${basis}' AS basis, ${score} AS score, n.updatedAt AS updatedAt, ${chain} AS identifiers`;
    for (const m of o.mentions) {
      const typed = m.nodeType ? this.model.node(m.nodeType) : null;
      if (m.nodeType && !typed) return { opId: o.opId, op: o.op, steps: [], refused: { status: "unsupported", reasons: [{ code: "UNKNOWN_TYPE", message: `${m.nodeType} is not a release node type` }] } };
      // Every mention must produce at least one query: an operation that runs nothing must never answer `empty`.
      if (!m.uid && !m.identifiers.length && !m.name) return { opId: o.opId, op: o.op, steps: [], refused: { status: "unsupported", reasons: [{ code: "PARAMETER_INVALID", message: `mention ${m.mentionId} has no uid, identifier or name to resolve`, path: m.mentionId }] } };
      if (m.uid) {
        const t = typed ?? this.anchor(m.uid);
        if (!t) return { opId: o.opId, op: o.op, steps: [], refused: { status: "unsupported", reasons: [{ code: "UNKNOWN_TYPE", message: `mention ${m.mentionId}: uid ${m.uid} carries no release uid token; give nodeType`, path: m.mentionId }] } };
        steps.push({ statement: `MATCH (n:\`${t.primaryLabel}\` {uid: $uid}) WHERE ${this.vis("n")} ${out("uid", 1.0)}, null AS matchedIdentifier LIMIT 1`, params: { ...vp, mentionId: m.mentionId, uid: m.uid }, rowCap: 1, perStep: true });
      }
      for (const ident of m.identifiers) {
        const scheme = ws.schemes.get(ident.scheme) ?? ws.schemes.get(ident.scheme.toUpperCase());
        const value = scheme ? ws.normalizeIdentifier(scheme, ident.value) : ident.value.trim();
        const typeLabel = typed ? `:\`${typed.primaryLabel}\`` : "";
        steps.push({
          statement: `MATCH (i:Identifier) WHERE i.scheme = $scheme AND i.value = $value AND ($issuer IS NULL OR i.issuer = $issuer) AND ${this.vis("i")}
MATCH (n${typeLabel})-[h:HAS_IDENTIFIER]->(i) WHERE h.recordedTo IS NULL AND ${this.vis("n")}
${out("identifier", 0.98)}, {scheme: i.scheme, issuer: i.issuer, value: i.value} AS matchedIdentifier ORDER BY uid LIMIT $lim`,
          params: { ...vp, mentionId: m.mentionId, scheme: scheme?.code ?? ident.scheme, value, issuer: ident.issuer ?? null, lim: neo4j.int(Math.min(o.limitPerMention, this.limits.rowCap) + 1) },
          rowCap: Math.min(o.limitPerMention, this.limits.rowCap),
          perStep: true,
        });
      }
      if (m.name) {
        // With nodeType: exact name on that type. Without: a bounded fan-out over every Entity-labelled type (all
        // Subjectable records carry Entity), with a one-row overflow probe so a capped fan-out is `truncated`, not `empty`.
        const label = typed ? typed.primaryLabel : "Entity";
        const capN = Math.min(o.limitPerMention, this.limits.rowCap);
        steps.push({ statement: `MATCH (n:\`${label}\`) WHERE toLower(trim(n.name)) = $name AND ${this.vis("n")} ${out("name_exact", 0.85)}, null AS matchedIdentifier ORDER BY uid LIMIT $lim`, params: { ...vp, mentionId: m.mentionId, name: m.name.trim().toLowerCase().replace(/\s+/g, " "), lim: neo4j.int(capN + 1) }, rowCap: capN, perStep: true });
      }
    }
    return {
      opId: o.opId,
      op: o.op,
      steps,
      annotations: { basisOrder: ["uid", "identifier", "name_exact"], rule: "uid > identifier (scheme, issuer, normalized value; open HAS_IDENTIFIER episode) > exact name (on nodeType, or fanned out over every Entity-labelled type when nodeType is absent; capped per mention with an overflow probe); a name never establishes identity alone; more than one candidate is ambiguous, never auto-picked" },
    };
  }

  /** Groups resolve rows by mention, dedupes candidates (strongest basis first) and marks ambiguity. */
  static finishResolve(rows: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
    const byMention = new Map<string, Map<string, Record<string, unknown>>>();
    for (const r of rows) {
      const mid = String(r.mentionId);
      const m = byMention.get(mid) ?? new Map();
      const prior = m.get(String(r.uid));
      if (!prior || Number(prior.score) < Number(r.score)) m.set(String(r.uid), { ...r, identifiers: [...((r.identifiers as Array<Record<string, unknown>>) ?? [])].sort(sortBy(["scheme", "issuer", "value"])), labels: [...((r.labels as string[]) ?? [])].sort() });
      byMention.set(mid, m);
    }
    const out: Array<Record<string, unknown>> = [];
    for (const [mid, m] of [...byMention.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
      const cands = [...m.values()].sort((a, b) => Number(b.score) - Number(a.score) || (String(a.uid) < String(b.uid) ? -1 : 1));
      const top = cands.filter((c) => Number(c.score) === Number(cands[0]!.score));
      const resolution = cands.length === 0 ? "none" : top.length > 1 || (cands[0]!.basis === "name_exact" && cands.length > 1) ? "ambiguous" : cands[0]!.basis === "name_exact" ? "candidate" : "unique";
      cands.forEach((c, i) => out.push({ ...c, mentionId: mid, rank: i + 1, resolution }));
    }
    return out;
  }

  private assertion(o: Extract<TypedOperation, { op: "assertion" }>, vp: Record<string, unknown>): CompiledOp {
    const parts: string[] = [];
    const params: Record<string, unknown> = { ...vp, rt: dt(o.view.recordedAsOf), vt: dt(o.view.validAt), lim: neo4j.int(this.cap(o.limit)) };
    if (o.assertionUids.length) {
      parts.push(`UNWIND $uids AS u MATCH (a:Assertion {uid: u})`);
      params.uids = [...o.assertionUids].sort();
    } else if (o.about) {
      const t = this.anchor(o.about.uid);
      if (!t) return this.unknownType(o, o.about.uid);
      const rel = o.about.role === "SUBJECT" ? "HAS_SUBJECT" : o.about.role === "OBJECT" ? "HAS_OBJECT" : "HAS_SUBJECT|HAS_OBJECT";
      parts.push(`MATCH (s:\`${t.primaryLabel}\` {uid: $about}) WHERE ${this.vis("s")} MATCH (a:Assertion)-[:${rel}]->(s) WHERE ($predicate IS NULL OR a.predicate = $predicate)`);
      params.about = o.about.uid;
      params.predicate = o.about.predicate ?? null;
    } else {
      return { opId: o.opId, op: o.op, steps: [], refused: { status: "unsupported", reasons: [{ code: "PARAMETER_INVALID", message: "assertion needs assertionUids or about" }] } };
    }
    const recorded = o.includeSuperseded && !o.view.recordedAsOf ? "true" : RECORDED_AT("a", "$rt", "recordedAt");
    const statement = `${parts.join("\n")}
WITH DISTINCT a WHERE ${this.vis("a")} AND ${recorded}
  AND NOT EXISTS { MATCH (a)-[:HAS_SUBJECT|HAS_OBJECT|ASSERTED_BY]->(hidden) WHERE NOT ${this.vis("hidden")} }
WITH a, ${EPISODE_VALIDITY("a", "$vt")} AS validityClass WHERE validityClass <> 'OUTSIDE'
RETURN ${this.proj("a", "Assertion")} AS assertion, validityClass,
  COLLECT { MATCH (a)-[:HAS_SUBJECT]->(s) RETURN ${this.summary("s")} } AS subject,
  COLLECT { MATCH (a)-[:HAS_OBJECT]->(x) RETURN ${this.summary("x")} } AS object,
  COLLECT { MATCH (a)-[:ASSERTED_BY]->(w) RETURN ${this.summary("w")} } AS asserter,
  COLLECT { MATCH (a)-[e:HAS_EVIDENCE]->(l:SourceLocator) WHERE ${this.vis("l")}
            OPTIONAL MATCH (snap:SourceSnapshot)-[:HAS_LOCATOR]->(l) WHERE ${this.vis("snap")}
            OPTIONAL MATCH (src:Source)-[:HAS_SNAPSHOT]->(snap) WHERE ${this.vis("src")}
            RETURN {role: e.role, origin: e.origin, locator: ${this.proj("l", "SourceLocator")}, snapshotUid: snap.uid, retrievedAt: snap.retrievedAt, contentHash: snap.contentHash, contentHashBasis: snap.contentHashBasis, captureCompleteness: snap.captureCompleteness, sourceUid: src.uid, canonicalUri: src.canonicalUri, sourceKind: src.sourceKind} } AS evidence,
  COLLECT { MATCH (adj:Adjudication)-[:ASSESSES]->(a) WHERE ${this.vis("adj")} AND ($rt IS NULL OR adj.recordedAt <= $rt)
            RETURN {uid: adj.uid, adjudicationKind: adj.adjudicationKind, verdict: adj.verdict, policyOutcome: adj.policyOutcome, judgeKind: adj.judgeKind, methodVersion: adj.methodVersion, decision: adj.decision, supersedesUid: adj.supersedesUid, recordedAt: adj.recordedAt, recordedTo: adj.recordedTo, evidenceSupport: adj.evidenceSupport, worldCorrectness: adj.worldCorrectness, attributionFaithfulness: adj.attributionFaithfulness} } AS adjudications,
  COLLECT { MATCH (a)-[:WAS_GENERATED_BY]->(act:Activity) WHERE ${this.vis("act")} RETURN {uid: act.uid, activityKind: act.activityKind, externalRunSystem: act.externalRunSystem, runId: act.runId, missionId: act.missionId} } AS generatedBy,${this.options.admissionFields ? `${this.admission("a").slice(1)},` : ""}
  COLLECT { MATCH (a)-[:DERIVED_FROM]->(d:Assertion) WHERE ${this.vis("d")} RETURN d.uid } AS derivedFrom,
  COLLECT { MATCH (a)-[:OCCURRENCE_OF]->(c:Claim) WHERE ${this.vis("c")} RETURN {uid: c.uid, proposition: c.proposition, claimType: c.claimType, lifecycleState: c.lifecycleState, latestVerdict: c.latestVerdict} } AS occurrenceOf
ORDER BY assertion.recordedAt, assertion.uid LIMIT $lim`;
    return {
      opId: o.opId,
      op: o.op,
      steps: [{ statement, params, rowCap: this.cap(o.limit) - 1, post: (rows) => rows.map((r) => this.finishAssertion(r)) }],
      annotations: { statusMeaning: STATUS_MEANING, rule: "status is capture fidelity, never truth (KN-15); a SUPPORT verdict lives on SUPPORT Adjudications; disagreement between asserters is preserved, never ranked" },
    };
  }

  private finishAssertion(r: Record<string, unknown>): Record<string, unknown> {
    const a = (r.assertion as Record<string, unknown>) ?? {};
    const evidence = [...((r.evidence as Array<Record<string, unknown>>) ?? [])].sort((p, q) => sortBy(["role", "origin"])(p, q) || sortBy(["uid"])((p.locator as Record<string, unknown>) ?? {}, (q.locator as Record<string, unknown>) ?? {}));
    const adjudications = [...((r.adjudications as Array<Record<string, unknown>>) ?? [])].sort(sortBy(["recordedAt", "uid"]));
    const one = (k: string) => ((r[k] as unknown[]) ?? [])[0] ?? null;
    const gaps: string[] = [];
    if (!evidence.some((e) => e.role === "SUPPORTS" && e.origin === "DECLARED")) gaps.push("NO_DECLARED_SUPPORTING_SPAN");
    if (!adjudications.length) gaps.push("NOT_ADJUDICATED");
    if (!adjudications.some((x) => x.adjudicationKind === "SUPPORT")) gaps.push("NO_SUPPORT_VERDICT");
    if (a.validFrom == null && a.validTo == null && a.validObservedAt == null) gaps.push("VALID_TIME_UNKNOWN");
    if (!((r.generatedBy as unknown[]) ?? []).length) gaps.push("LINEAGE_NOT_VISIBLE");
    if (evidence.some((e) => !e.snapshotUid || !e.sourceUid)) gaps.push("EVIDENCE_CHAIN_INCOMPLETE");
    return {
      assertion: a,
      validityClass: r.validityClass,
      subject: one("subject"),
      object: one("object"),
      asserter: one("asserter"),
      evidence,
      adjudications,
      generatedBy: [...((r.generatedBy as Array<Record<string, unknown>>) ?? [])].sort(sortBy(["uid"])),
      derivedFrom: [...((r.derivedFrom as string[]) ?? [])].sort(),
      occurrenceOf: one("occurrenceOf"),
      statusMeaning: STATUS_MEANING[String(a.status)] ?? "unregistered status value",
      gaps,
      ...(r.admission !== undefined ? { admission: [...((r.admission as Array<Record<string, unknown>>) ?? [])].sort(sortBy(["useDecisionRef", "effectKey"])) } : {}),
    };
  }
}
