import { int, type ManagedTransaction } from "neo4j-driver";
import { digestOf, READ_SNAPSHOT_VERSION, ReadIntent, type ReadOperation, type ReadOperationResult, type ReadSnapshot, type TouchedNode } from "@bks/contracts";
import { cypherList, recordToJson, type GraphClient } from "./neo4j.js";
import { luceneEscape, resolveMentions } from "./resolve.js";
import type { SchemaModel } from "./schema-access.js";

/** Executes a read intent: every operation compiles to parameterized Cypher, runs in one read transaction, and the touched set is recorded for preconditions. */
export async function executeReadIntent(client: GraphClient, schema: SchemaModel, intentInput: unknown): Promise<ReadSnapshot> {
  const intent = ReadIntent.parse(intentInput);
  const intentDigest = digestOf(intent);
  const executedAt = new Date().toISOString();
  const touched = new Map<string, TouchedNode>();
  const results: ReadOperationResult[] = [];

  await client.read(async (tx) => {
    for (const op of intent.operations) {
      const started = Date.now();
      try {
        const { rows, cypher } = await runOperation(tx, schema, op, intent.limits.rowCap);
        const truncated = rows.length > intent.limits.rowCap;
        const kept = rows.slice(0, intent.limits.rowCap);
        for (const row of kept) collectTouched(touched, row);
        results.push({ opId: op.opId, kind: op.kind, status: truncated ? "truncated" : kept.length ? "ok" : "empty", rows: kept, rowCount: kept.length, truncated, elapsedMs: Date.now() - started, cypher });
      } catch (error) {
        results.push({ opId: op.opId, kind: op.kind, status: "failed", rows: [], rowCount: 0, truncated: false, elapsedMs: Date.now() - started, error: (error as Error).message });
      }
    }
  }, intent.limits.timeoutMs);

  const touchedList = [...touched.values()].sort((a, b) => a.uid.localeCompare(b.uid));
  const body = { intentId: intent.intentId, intentDigest, schemaDigest: schema.schemaDigest, operations: results, touched: touchedList };
  const snapshotDigest = digestOf(body);
  return {
    schemaVersion: READ_SNAPSHOT_VERSION,
    snapshotId: `snap-${intent.intentId}-${snapshotDigest.slice(7, 15)}`,
    intentId: intent.intentId,
    intentDigest,
    schemaDigest: schema.schemaDigest,
    executedAt,
    database: client.config.database,
    operations: results,
    touched: touchedList,
    snapshotDigest,
  };
}

function collectTouched(touched: Map<string, TouchedNode>, row: Record<string, unknown>): void {
  const visit = (v: unknown) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) {
      for (const x of v) visit(x);
      return;
    }
    const o = v as Record<string, unknown>;
    if (typeof o.uid === "string" && o.uid.startsWith("hu:") && Array.isArray(o.labels)) {
      touched.set(o.uid, { uid: o.uid, labels: o.labels as string[], updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : null });
    }
    for (const x of Object.values(o)) visit(x);
  };
  visit(row);
}

const NODE_PROJECTION = "{uid: n.uid, labels: labels(n), name: n.name, updatedAt: toString(n.updatedAt)}";

async function runOperation(tx: ManagedTransaction, schema: SchemaModel, op: ReadOperation, rowCap: number): Promise<{ rows: Array<Record<string, unknown>>; cypher?: string }> {
  const cap = int(rowCap + 1);
  switch (op.kind) {
    case "node.resolve": {
      for (const m of op.mentions) if (m.nodeType) schema.node(m.nodeType);
      const resolved = await resolveMentions(tx, schema, op.mentions, op.limitPerMention);
      return { rows: resolved.map((r) => ({ mentionId: r.mentionId, strongest: r.strongest, matches: r.matches })) };
    }
    case "node.card": {
      const cypher = `MATCH (n {uid: $uid})
CALL { WITH n OPTIONAL MATCH (n)-[r]->() RETURN collect({type: type(r), direction: 'OUT'}) AS outs }
CALL { WITH n OPTIONAL MATCH (n)<-[r]-() RETURN collect({type: type(r), direction: 'IN'}) AS ins }
WITH n, outs + ins AS edges
UNWIND CASE WHEN size(edges) = 0 THEN [null] ELSE edges END AS e
WITH n, e WHERE e IS NULL OR e.type IS NOT NULL
WITH n, e.type AS type, e.direction AS direction, count(e) AS c
WITH n, collect(CASE WHEN type IS NULL THEN NULL ELSE {type: type, direction: direction, count: c} END) AS relationshipCounts
RETURN {uid: n.uid, labels: labels(n), name: n.name, updatedAt: toString(n.updatedAt), properties: properties(n), relationshipCounts: [x IN relationshipCounts WHERE x IS NOT NULL]} AS node`;
      const res = await tx.run(cypher, { uid: op.uid });
      const rows = res.records.map(recordToJson);
      if (op.neighbors && rows.length) {
        const nres = await tx.run(
          `MATCH (n {uid: $uid})-[r]-(m) WHERE m.uid IS NOT NULL
RETURN type(r) AS type, CASE WHEN startNode(r) = n THEN 'OUT' ELSE 'IN' END AS direction, ${NODE_PROJECTION.replace(/n\./g, "m.").replace("labels(n)", "labels(m)")} AS node, properties(r) AS edge
ORDER BY type, direction, node.uid LIMIT $limit`,
          { uid: op.uid, limit: int(op.neighborLimit) },
        );
        ((rows[0] as Record<string, unknown>).node as Record<string, unknown>).neighbors = nres.records.map(recordToJson);
      }
      return { rows, cypher };
    }
    case "node.search": {
      const node = schema.node(op.nodeType);
      const ft = schema.fulltextIndex(node.name);
      if (ft) {
        const cypher = `CALL db.index.fulltext.queryNodes($index, $phrase) YIELD node AS n, score WHERE n:${node.primaryLabel} AND n.uid IS NOT NULL RETURN ${NODE_PROJECTION} AS node, score ORDER BY score DESC LIMIT $limit`;
        try {
          const res = await tx.run(cypher, { index: ft.indexName, phrase: luceneEscape(op.phrase), limit: int(op.limit) });
          return { rows: res.records.map(recordToJson), cypher };
        } catch {
          /* fall through to CONTAINS when the index is not present in this database */
        }
      }
      const cypher = `MATCH (n:${node.primaryLabel}) WHERE n.uid IS NOT NULL AND (toLower(coalesce(n.name, '')) CONTAINS $q OR toLower(coalesce(n.description, '')) CONTAINS $q) RETURN ${NODE_PROJECTION} AS node, 0.0 AS score ORDER BY n.name LIMIT $limit`;
      const res = await tx.run(cypher, { q: op.phrase.toLowerCase(), limit: int(op.limit) });
      return { rows: res.records.map(recordToJson), cypher };
    }
    case "node.list": {
      const node = schema.node(op.nodeType);
      const conditions: string[] = ["n.uid IS NOT NULL"];
      const params: Record<string, unknown> = { limit: int(op.limit) };
      let i = 0;
      for (const [k, v] of Object.entries(op.where)) {
        const p = schema.property(node.name, k);
        if (!p) throw new Error(`unknown property ${node.name}.${k}`);
        const err = schema.validatePropertyValue(p, v);
        if (err) throw new Error(err);
        const key = `w${i++}`;
        conditions.push(schema.isTemporalProperty(p) ? `n.${p.storedName} = datetime($${key})` : `n.${p.storedName} = $${key}`);
        params[key] = v;
      }
      const cypher = `MATCH (n:${node.primaryLabel}) WHERE ${conditions.join(" AND ")} RETURN ${NODE_PROJECTION} AS node, properties(n) AS properties ORDER BY n.uid LIMIT $limit`;
      const res = await tx.run(cypher, params);
      return { rows: res.records.map(recordToJson), cypher };
    }
    case "node.neighbors": {
      const typeFilter = op.relationshipTypes.length ? `AND type(r) IN ${cypherList(op.relationshipTypes)}` : "";
      const pattern = op.direction === "OUT" ? "(n {uid: $uid})-[r]->(m)" : op.direction === "IN" ? "(n {uid: $uid})<-[r]-(m)" : "(n {uid: $uid})-[r]-(m)";
      const cypher = `MATCH ${pattern} WHERE m.uid IS NOT NULL ${typeFilter}
RETURN type(r) AS type, CASE WHEN startNode(r) = n THEN 'OUT' ELSE 'IN' END AS direction, {uid: m.uid, labels: labels(m), name: m.name, updatedAt: toString(m.updatedAt)} AS node, properties(r) AS edge
ORDER BY type, direction, node.uid LIMIT $limit`;
      const res = await tx.run(cypher, { uid: op.uid, limit: int(op.limit) });
      return { rows: res.records.map(recordToJson), cypher };
    }
    case "assertion.trace": {
      const cypher = `MATCH (a:Assertion) WHERE a.uid IN $uids AND ($recordedAsOf IS NULL OR a.recordedAt <= datetime($recordedAsOf))
CALL { WITH a OPTIONAL MATCH (a)-[:HAS_SUBJECT]->(s) OPTIONAL MATCH (a)-[:HAS_OBJECT]->(o)
  RETURN collect(DISTINCT {uid: s.uid, labels: labels(s), name: s.name, updatedAt: toString(s.updatedAt)})[0] AS subject, collect(DISTINCT CASE WHEN o IS NULL THEN NULL ELSE {uid: o.uid, labels: labels(o), name: o.name, updatedAt: toString(o.updatedAt)} END)[0] AS object }
CALL { WITH a OPTIONAL MATCH (a)-[:ASSERTED_BY]->(asserter) RETURN collect(DISTINCT {uid: asserter.uid, labels: labels(asserter), name: asserter.name})[0] AS asserter }
CALL { WITH a OPTIONAL MATCH (a)-[:SUPPORTED_BY]->(loc:SourceLocator) OPTIONAL MATCH (snap:SourceSnapshot)-[:HAS_LOCATOR]->(loc) OPTIONAL MATCH (src:Source)-[:HAS_SNAPSHOT]->(snap)
  RETURN collect(DISTINCT CASE WHEN loc IS NULL THEN NULL ELSE {locatorUid: loc.uid, uri: loc.uri, selectorKind: loc.selectorKind, section: loc.section, page: loc.page, exact: loc.exact, snapshotUid: snap.uid, observedAt: toString(snap.observedAt), retrievedAt: toString(snap.retrievedAt), contentHash: snap.contentHash, sourceUid: src.uid, canonicalUri: src.canonicalUri, sourceKind: src.sourceKind} END) AS supports }
CALL { WITH a OPTIONAL MATCH (adj:Adjudication)-[:EVALUATES]->(a) WHERE $recordedAsOf IS NULL OR adj.recordedAt <= datetime($recordedAsOf)
  RETURN collect(DISTINCT CASE WHEN adj IS NULL THEN NULL ELSE {uid: adj.uid, kind: adj.adjudicationKind, verdict: adj.verdict, status: adj.status, recordedAt: toString(adj.recordedAt)} END) AS adjudications }
CALL { WITH a OPTIONAL MATCH (a)-[:WAS_GENERATED_BY]->(act:Activity) RETURN collect(DISTINCT {uid: act.uid, externalRunSystem: act.externalRunSystem, externalRunId: act.externalRunId})[0] AS generatedBy }
RETURN {uid: a.uid, predicate: a.predicate, status: a.status, polarity: a.polarity, recordedAt: toString(a.recordedAt), recordedTo: toString(a.recordedTo), validFrom: toString(a.validFrom), validTo: toString(a.validTo), validFromBasis: a.validFromBasis, validToBasis: a.validToBasis, valueString: a.valueString, valueNumber: a.valueNumber, unitCode: a.unitCode, assertionBasis: a.assertionBasis, speechAct: a.speechAct} AS assertion,
  subject, object, asserter, [x IN supports WHERE x IS NOT NULL] AS supports, [x IN adjudications WHERE x IS NOT NULL] AS adjudications, generatedBy,
  [g IN [CASE WHEN size([x IN supports WHERE x IS NOT NULL]) = 0 THEN 'NO_SUPPORTING_LOCATOR' END, CASE WHEN size([x IN adjudications WHERE x IS NOT NULL]) = 0 THEN 'NOT_ADJUDICATED' END, CASE WHEN a.validFrom IS NULL AND a.validTo IS NULL THEN 'VALID_TIME_UNKNOWN' END] WHERE g IS NOT NULL] AS gaps
ORDER BY a.uid LIMIT $limit`;
      const res = await tx.run(cypher, { uids: op.assertionUids, recordedAsOf: op.recordedAsOf ?? null, limit: cap });
      return { rows: res.records.map(recordToJson), cypher };
    }
    case "assertion.about": {
      const cypher = `MATCH (a:Assertion)-[rel:HAS_SUBJECT|HAS_OBJECT]->(n {uid: $uid}) WHERE $predicate IS NULL OR a.predicate = $predicate
OPTIONAL MATCH (a)-[:HAS_SUBJECT]->(s) OPTIONAL MATCH (a)-[:HAS_OBJECT]->(o)
WITH a, type(rel) AS role, s, o ORDER BY a.recordedAt DESC
RETURN {uid: a.uid, predicate: a.predicate, status: a.status, polarity: a.polarity, recordedAt: toString(a.recordedAt), recordedTo: toString(a.recordedTo), validFrom: toString(a.validFrom), validTo: toString(a.validTo), valueString: a.valueString, valueNumber: a.valueNumber, unitCode: a.unitCode, speechAct: a.speechAct, assertionBasis: a.assertionBasis} AS assertion,
  role, {uid: s.uid, labels: labels(s), name: s.name, updatedAt: toString(s.updatedAt)} AS subject, CASE WHEN o IS NULL THEN NULL ELSE {uid: o.uid, labels: labels(o), name: o.name, updatedAt: toString(o.updatedAt)} END AS object,
  size([(a)-[:SUPPORTED_BY]->(l) | l]) AS supportCount
LIMIT $limit`;
      const res = await tx.run(cypher, { uid: op.uid, predicate: op.predicate ?? null, limit: int(op.limit) });
      return { rows: res.records.map(recordToJson), cypher };
    }
    case "state.asOf": {
      const cypher = `MATCH (n {uid: $uid})-[r:${op.relationshipType}]->(s)
WHERE ($recordedAsOf IS NULL OR (r.recordedFrom IS NULL OR r.recordedFrom <= datetime($recordedAsOf)) AND (r.recordedTo IS NULL OR r.recordedTo > datetime($recordedAsOf)))
WITH n, r, s,
  CASE
    WHEN $validAt IS NULL THEN 'ALL'
    WHEN (r.validFrom IS NOT NULL AND r.validFrom > datetime($validAt)) OR (r.validTo IS NOT NULL AND r.validTo <= datetime($validAt)) THEN 'EXCLUDED'
    WHEN r.validFrom IS NOT NULL AND r.validTo IS NOT NULL THEN 'KNOWN_WITHIN'
    WHEN r.validFrom IS NULL AND r.validTo IS NOT NULL THEN 'UNKNOWN_START'
    WHEN r.validFrom IS NULL AND r.validTo IS NULL THEN 'UNKNOWN_BOTH_BOUNDS'
    ELSE 'OPEN_END_UNVERIFIED'
  END AS validityClass
WHERE validityClass <> 'EXCLUDED'
RETURN {uid: s.uid, labels: labels(s), name: s.name, updatedAt: toString(s.updatedAt), properties: properties(s)} AS state, properties(r) AS episode, validityClass
ORDER BY r.recordedFrom DESC LIMIT $limit`;
      const res = await tx.run(cypher, { uid: op.uid, validAt: op.validAt ?? null, recordedAsOf: op.recordedAsOf ?? null, limit: cap });
      return { rows: res.records.map(recordToJson), cypher };
    }
    case "count.byType": {
      const types = op.nodeTypes.length ? op.nodeTypes.map((t) => schema.node(t).primaryLabel) : null;
      const cypher = types
        ? `UNWIND ${cypherList(types)} AS label CALL { WITH label MATCH (n) WHERE label IN labels(n) RETURN count(n) AS c } RETURN label, c AS count ORDER BY label`
        : `MATCH (n) UNWIND labels(n) AS label WITH label, count(*) AS c RETURN label, c AS count ORDER BY c DESC, label LIMIT $limit`;
      const res = await tx.run(cypher, { limit: cap });
      return { rows: res.records.map(recordToJson), cypher };
    }
    case "count.relationships": {
      const cypher = op.uid
        ? `MATCH (n {uid: $uid})-[r]-() RETURN type(r) AS type, CASE WHEN startNode(r) = n THEN 'OUT' ELSE 'IN' END AS direction, count(r) AS count ORDER BY count DESC, type LIMIT $limit`
        : `MATCH ()-[r]->() RETURN type(r) AS type, count(r) AS count ORDER BY count DESC, type LIMIT $limit`;
      const res = await tx.run(cypher, { uid: op.uid ?? null, limit: cap });
      return { rows: res.records.map(recordToJson), cypher };
    }
  }
}
