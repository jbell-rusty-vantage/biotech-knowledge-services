/**
 * S4 proposed release templates for held questions (patch for the schema authority). Each is a Cypher 5 read that
 * passes the S4 read policy, is executed as a governed Cypher artifact on the Enterprise RBAC bindings with gold
 * assertions against the fixture graph (read-enterprise.integration.test.ts), and is answered by a typed operation too
 * where one exists. Until the schema authority releases them they are served only as ad hoc artifacts.
 */
export interface ProposedTemplate {
  id: string;
  questionIds: string[];
  statement: string;
  parameters: Record<string, { type: string; pattern?: string; neo4jType?: string }>;
  outputColumns: string[];
  typedEquivalent: string | null;
  notes: string;
}

export const PROPOSED_TEMPLATES: ProposedTemplate[] = [
  {
    id: "K/Q-K-09",
    questionIds: ["Q-K-09"],
    statement: `MATCH (c:Claim {uid: $claimUid})<-[:OCCURRENCE_OF]-(o:Assertion)
WHERE o.recordedTo IS NULL
OPTIONAL MATCH (o)-[:ASSERTED_BY]->(who:Entity)
OPTIONAL MATCH (o)-[:OCCURS_IN]->(w:MediaWork)
RETURN o.uid AS occurrence, who.uid AS asserterUid, who.name AS asserter, w.uid AS container, o.speechAct AS speechAct,
  o.basisKind AS basisKind, o.polarity AS polarity, o.status AS status, coalesce(o.validFrom, o.validObservedAt) AS statedAt,
  COLLECT { MATCH (o)-[e:HAS_EVIDENCE]->(l:SourceLocator)<-[:HAS_LOCATOR]-(s:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
            RETURN {role: e.role, origin: e.origin, locator: l.uid, selectorDigest: l.selectorDigest, retrievedAt: s.retrievedAt, uri: src.canonicalUri} } AS spans,
  COLLECT { MATCH (v:Assessment {assessmentKind: 'VETTING'})-[:ASSESSES]->(c) WHERE v.recordedTo IS NULL
            RETURN {vetting: v.uid, disposition: v.disposition} } AS vetting
ORDER BY occurrence`,
    parameters: { claimUid: { type: "string", pattern: "^hu:" } },
    outputColumns: ["occurrence", "asserterUid", "asserter", "container", "speechAct", "basisKind", "polarity", "status", "statedAt", "spans", "vetting"],
    typedEquivalent: "assertion {about: {uid: <subject>, predicate}} filtered by occurrenceOf.uid = claim (spans, asserter, speech act, basis)",
    notes: "every current occurrence of claim C with asserter, container, located spans (HAS_EVIDENCE role/origin -> locator -> snapshot -> source), date, speech act, basis and the current VETTING disposition",
  },
  {
    id: "K/Q-K-12#identifiers",
    questionIds: ["Q-K-12"],
    statement: `MATCH (x:Entity {uid: $uid})-[h:HAS_IDENTIFIER]->(i:Identifier)
RETURN i.scheme AS scheme, i.issuer AS issuer, i.value AS value, h.isPrimary AS isPrimary, h.validFrom AS validFrom, h.validTo AS validTo,
  h.recordedFrom AS recordedFrom, h.recordedTo AS recordedTo, h.assertionUid AS authorizedBy
ORDER BY scheme, issuer, value, recordedFrom`,
    parameters: { uid: { type: "string", pattern: "^hu:" } },
    outputColumns: ["scheme", "issuer", "value", "isPrimary", "validFrom", "validTo", "recordedFrom", "recordedTo", "authorizedBy"],
    typedEquivalent: "card {uid} -> identifiers (open episodes); resolve {identifiers} for the reverse lookup",
    notes: "which identifiers X carries, from which issuer, valid when (all episodes, open and closed)",
  },
  {
    id: "K/Q-K-12#carrier",
    questionIds: ["Q-K-12"],
    statement: `MATCH (i:Identifier {scheme: $scheme, value: $value})<-[h:HAS_IDENTIFIER]-(x:Entity)
WHERE h.recordedTo IS NULL
RETURN x.uid AS uid, x.name AS name, i.issuer AS issuer, h.isPrimary AS isPrimary, h.assertionUid AS authorizedBy
ORDER BY uid, issuer`,
    parameters: { scheme: { type: "string" }, value: { type: "string" } },
    outputColumns: ["uid", "name", "issuer", "isPrimary", "authorizedBy"],
    typedEquivalent: "resolve {mentions: [{identifiers: [{scheme, value}]}]}",
    notes: "which entity carries identifier (scheme, value): normalized value; one Identifier identifies at most one record (R-42); several issuers are listed, never merged",
  },
  {
    id: "K/Q-K-11",
    questionIds: ["Q-K-11"],
    statement: `MATCH (r:Report {reportKind: 'EVIDENCE_REPORT'})-[:ASSESSES]->(c:Claim)
WHERE r.recordedTo IS NULL AND r.verdict IN ['NOT_SUPPORTED', 'CONTRADICTED']
RETURN c.uid AS claim, c.proposition AS proposition, r.uid AS report, r.verdict AS verdict, r.publishedAt AS publishedAt, r.recordedAt AS reportRecordedAt,
  COLLECT { MATCH (c)<-[:OCCURRENCE_OF]-(o:Assertion) WHERE o.recordedTo IS NULL AND coalesce(o.validFrom, o.validObservedAt, o.recordedAt) > coalesce(r.publishedAt, r.recordedAt)
            RETURN o.uid } AS repeatedSince
ORDER BY claim, report
LIMIT 100`,
    parameters: {},
    outputColumns: ["claim", "proposition", "report", "verdict", "publishedAt", "reportRecordedAt", "repeatedSince"],
    typedEquivalent: null,
    notes: "claims an evidence mission reported NOT_SUPPORTED or CONTRADICTED, and the occurrences stated (or, without a stated date, recorded) after the report",
  },
];
