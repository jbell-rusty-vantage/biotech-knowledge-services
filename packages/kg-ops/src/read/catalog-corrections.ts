import type { CatalogTemplate } from "./templates.js";

/**
 * S4 catalog template corrections, delivered to the schema authority as a release patch (the release is never edited
 * here; the service keeps serving the released statements until a corrected release is pinned). Each correction keeps
 * the template id, parameters and output columns; tests prove (a) EXPLAIN on the release baseline no longer shows the
 * defect and (b) the corrected statement returns the same rows as the released one on the fixture graph (or, for
 * Q-D5-20, rows where the released statement can never return any).
 */
export interface TemplateCorrection {
  id: string;
  decision: string;
  defect: string;
  fix: string;
  statement: string;
}

/** Stored labels that do not carry Entity (release v2.0.x); a uid seek over them plus Entity covers every v2 record. */
export const NON_ENTITY_LABELS = ["Activity", "Adjudication", "Assertion", "Assessment", "Association", "CaptureAttempt", "Chunk", "MechanismEvidenceContext", "Report", "ReportItem", "SourceLocator", "SourceSnapshot"];

/** Index-backed replacement for `MATCH (v:$($label) {uid: $p})`: one uid seek per stored label family, label kept as a predicate. */
export function uidSeek(v: string, p: string): string {
  const branches = ["Entity", ...NON_ENTITY_LABELS].map((l) => `MATCH (${v}:${l} {uid: $${p}}) WHERE $label IN labels(${v}) RETURN ${v}`);
  return `CALL {\n  ${branches.join("\n  UNION\n  ")}\n}`;
}

const AX04_BODY = (s: string) => s.replace("MATCH (x:$($label) {uid: $uid})", uidSeek("x", "uid"));

export function correctionsFor(templates: CatalogTemplate[]): TemplateCorrection[] {
  const by = new Map(templates.map((t) => [t.id, t]));
  const out: TemplateCorrection[] = [];
  const t = (id: string) => {
    const x = by.get(id);
    if (!x) throw new Error(`catalog has no template ${id}`);
    return x;
  };

  out.push({
    id: "K/CQ-AX-04",
    decision: "FU-04 / S1 report section 5 (AllNodesScan)",
    defect: "`MATCH (x:$($label) {uid: $uid})`: a dynamic label cannot use a label/uid index on 5.26, so the planner scans all nodes",
    fix: "one uid seek per stored label family (Entity plus the 12 labels without Entity) in a UNION subquery, label kept as a predicate (`WHERE $label IN labels(x)`): every branch uses a uid constraint",
    statement: AX04_BODY(t("K/CQ-AX-04").statement),
  });
  out.push({
    id: "K/Q-K-23",
    decision: "FU-04 / S1 report section 5 (AllNodesScan)",
    defect: "`MATCH (p:$($label) {uid: $asserterUid})`: dynamic label, all-nodes scan",
    fix: "same per-label-family uid seek as CQ-AX-04",
    statement: t("K/Q-K-23").statement.replace("MATCH (p:$($label) {uid: $asserterUid})", uidSeek("p", "asserterUid")),
  });
  out.push({
    id: "D9/CQ-RC-05",
    decision: "FU-04 / S1 report section 5 (AllNodesScan)",
    defect: "`MATCH (r) WHERE (r:Assertion OR r:Assessment OR r:Report) AND r.uid IN $answerInputUids`: label disjunction in WHERE plans an all-nodes scan",
    fix: "seek each input uid per label in a UNION subquery (`uid_Assertion`, `uid_Assessment`, `uid_Report` constraints)",
    statement: t("D9/CQ-RC-05").statement.replace(
      "MATCH (r) WHERE (r:Assertion OR r:Assessment OR r:Report) AND r.uid IN $answerInputUids",
      "UNWIND $answerInputUids AS inputUid\nCALL (inputUid) {\n  MATCH (r:Assertion {uid: inputUid}) RETURN r\n  UNION\n  MATCH (r:Assessment {uid: inputUid}) RETURN r\n  UNION\n  MATCH (r:Report {uid: inputUid}) RETURN r\n}",
    ),
  });
  out.push({
    id: "D12/Q-D12-18",
    decision: "FU-04 / S1 report section 5 (AllNodesScan)",
    defect: "the claim-condition subject `(cs)` is unlabelled inside `CALL (lv) { OPTIONAL MATCH (cond)-[:HAS_SUBJECT]->(cs) WHERE cs.uid IN ... }`, planned as an all-nodes scan",
    fix: "label the subject `(cs:Entity)` (RegulatoryRecord and Claim both carry Entity) so the uid predicate seeks `entity_uid`",
    statement: t("D12/Q-D12-18").statement.replace("OPTIONAL MATCH (cond:Assertion {predicate: 'HAS_CLAIM_CONDITION'})-[:HAS_SUBJECT]->(cs)", "OPTIONAL MATCH (cond:Assertion {predicate: 'HAS_CLAIM_CONDITION'})-[:HAS_SUBJECT]->(cs:Entity)"),
  });
  const types = ["MENTIONS", "COVERS_LOCATOR", "AFFECTS_MECHANISM", "ASSOCIATES", "RESOLVES_TO_CONSTRAINT", "STATES_CONSTRAINT"];
  out.push({
    id: "QP/P-10a.4",
    decision: "FU-04 / S1 report section 5 (AllNodesScan)",
    defect: "`MATCH ()-[r:MENTIONS|COVERS_LOCATOR|...]->() WHERE r.lastWriterRunId IN runs`: a multi-type anonymous pattern is planned from an all-nodes scan",
    fix: "one single-type branch per derived relationship type in a UNION ALL subquery (relationship type scan / `rel_<TYPE>_writer` index seek)",
    statement: `// @id P-10a.4 derived edges written by the mission's projection runs (S4 correction: per-type branches)
MATCH (act:Activity {missionId: $missionId})
WITH collect(act.runId) AS runs
CALL (runs) {
${types.map((ty) => `  MATCH ()-[r:${ty}]->() WHERE r.lastWriterRunId IN runs RETURN r`).join("\n  UNION ALL\n")}
}
RETURN r.lastWriterRunId AS runId, type(r) AS relType, count(r) AS edges`,
  });
  out.push({
    id: "QP/P-10c.2",
    decision: "FU-04 / S1 report section 5 (AllNodesScan)",
    defect: "same multi-type anonymous relationship pattern as P-10a.4",
    fix: "per-type UNION ALL branches",
    statement: `// @id P-10c.2 derived edges citing M's Assertions (S4 correction: per-type branches)
MATCH (:Activity {missionId: $missionId})<-[:WAS_GENERATED_BY]-(a:Assertion)
WITH collect(a.uid) AS outUids
CALL (outUids) {
${types.map((ty) => `  MATCH ()-[r:${ty}]->() WHERE r.projectionOfAssertionUid IN outUids OR any(u IN coalesce(r.derivedFromAssertionUids, []) WHERE u IN outUids) RETURN r`).join("\n  UNION ALL\n")}
}
RETURN type(r) AS relType, count(r) AS edges`,
  });
  out.push({
    id: "D5/Q-D5-20",
    decision: "S1 report section 5 (unstored :Subjectable label)",
    defect: "`MATCH (x:Subjectable {uid: $xUid})`: Subjectable is a GraphQL interface, never a stored label, so the statement can return no row on a v2 graph",
    fix: "`MATCH (x:Entity {uid: $xUid})` (Subjectable implementers carry Entity); template status can move from held to supported once fixture rows exist",
    statement: t("D5/Q-D5-20").statement.replace("MATCH (x:Subjectable {uid: $xUid})", "MATCH (x:Entity {uid: $xUid})"),
  });
  out.push({
    id: "D9/Q-D9-02",
    decision: "MD-D9-03 (d)",
    defect: "the hard `*0..4` undirected organization path cannot reach a SELLER_OF_RECORD through MerchantListing -> Offer (5 hops) or a predicate-only maker (R-68)",
    fix: "replace the `*0..4` path with the final P-09 bounded `behind` set (brand owner, product brand owner, predicate-only maker/distributor/supplier, listing seller of record, the item itself) plus PARENT_OF{0,2}; relationHops becomes the matched `behind` route",
    statement: q9_02(t("D9/Q-D9-02").statement),
  });
  return out;
}

function q9_02(original: string): string {
  const from = original.indexOf("MATCH rel = (item)");
  const to = original.indexOf("WITH p, o, item, w, T, i, org, min(length(rel)) AS relationHops");
  if (from < 0 || to < 0) return original;
  const behind = `WITH p, o, item, w, T, i, org, COLLECT {
       MATCH (item)-[:BRANDED_AS]->(:Brand)<-[:OWNS_BRAND]-(b:Organization) RETURN {org: b, route: 2} AS hit
       UNION
       MATCH (item)<-[:HAS_VARIANT]-(:Product)-[:BRANDED_AS]->(:Brand)<-[:OWNS_BRAND]-(b:Organization) RETURN {org: b, route: 3} AS hit
       UNION
       MATCH (item)<-[:HAS_OBJECT]-(mf:Assertion)-[:HAS_SUBJECT]->(b:Organization)
       WHERE mf.predicate IN ['MANUFACTURES', 'CONTRACT_MANUFACTURES_FOR', 'DISTRIBUTES', 'SUPPLIES_MATERIAL'] AND mf.recordedTo IS NULL
       RETURN {org: b, route: 1} AS hit
       UNION
       MATCH (item)-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)<-[:LISTING_FOR]-(:MerchantListing)-[:HAS_OFFER]->(:Offer)-[:SELLER_OF_RECORD]->(b:Organization)
       RETURN {org: b, route: 5} AS hit
       UNION
       WITH item AS b WHERE b:Organization RETURN {org: b, route: 0} AS hit
     } AS behind
WITH p, o, item, w, T, i, org, [x IN behind WHERE EXISTS { MATCH (org)-[:PARENT_OF]-{0,2}(q:Organization) WHERE q = x.org } | x.route] AS routes
WHERE size(routes) > 0
`;
  return original.slice(0, from) + behind + original.slice(to).replace("WITH p, o, item, w, T, i, org, min(length(rel)) AS relationHops", "WITH p, o, item, w, T, i, org, reduce(m = 99, r IN routes | CASE WHEN r < m THEN r ELSE m END) AS relationHops");
}
