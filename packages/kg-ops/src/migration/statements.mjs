// Cypher 5 statement templates for migration batches (bks-migration-manifest.v1).
// Every statement is parameterized; labels/types come only from the release-validated plan (backtick-quoted).
// Time-valued fields are set from $now (apply clock), never from the plan, so the plan stays clock-free.
const q = (name) => "`" + String(name).replace(/`/g, "``") + "`";
const L = (labels) => labels.map((l) => ":" + q(l)).join("");
export const CYPHER_PREFIX = "CYPHER 5 ";

/** Returns [{statement, params}] for one batch. `ctx` = {runId, exportDigest, mapVersion}. */
export function statementsFor(batch, ctx) {
  const run = ctx.runId;
  const S = (statement, params) => ({ statement: CYPHER_PREFIX + statement, params: { ...params, run } });
  switch (batch.kind) {
    case "spine": {
      const { agent, activity, research, source, snapshot } = batch.rows;
      return [
        S(`CREATE (g:Agent:Entity) SET g = $agent, g.createdAt = $now, g.updatedAt = $now, g.lastWriterRunId = $run
           CREATE (a:Activity:Occurrence) SET a = $activity, a.startedAt = $now, a.createdAt = $now, a.updatedAt = $now, a.lastWriterRunId = $run
           CREATE (a)-[:WAS_ASSOCIATED_WITH]->(g)
           CREATE (s:Source:Entity) SET s = $source, s.createdAt = $now, s.updatedAt = $now, s.lastWriterRunId = $run
           CREATE (p:SourceSnapshot:InformationArtifact) SET p = $snapshot, p.createdAt = $now, p.updatedAt = $now, p.lastWriterRunId = $run
           CREATE (s)-[:HAS_SNAPSHOT {lastWriterRunId: $run}]->(p)
           WITH a UNWIND $research AS r
           CREATE (x:Activity:Occurrence) SET x = r, x.createdAt = $now, x.updatedAt = $now, x.lastWriterRunId = $run
           CREATE (a)-[:WAS_INFORMED_BY]->(x)`,
          { agent, activity, research, source, snapshot },
        ),
      ];
    }
    case "nodes":
      return [
        S(`UNWIND $rows AS row CREATE (n${L(batch.labels)}) SET n = row.props, n.createdAt = $now, n.updatedAt = $now, n.lastWriterRunId = $run
           WITH n MATCH (a:Activity {uid: $activityUid}) CREATE (n)-[:WAS_GENERATED_BY]->(a)`,
          { rows: batch.rows, activityUid: batch.activityUid },
        ),
      ];
    case "locators":
      return [
        S(`MATCH (p:SourceSnapshot {uid: $snapshotUid})
           UNWIND $rows AS row CREATE (l:SourceLocator:InformationArtifact) SET l = row.props, l.createdAt = $now, l.updatedAt = $now, l.lastWriterRunId = $run
           CREATE (p)-[:HAS_LOCATOR {lastWriterRunId: $run}]->(l)`,
          { rows: batch.rows, snapshotUid: batch.snapshotUid },
        ),
      ];
    case "identifiers":
      return [
        S(`UNWIND $rows AS row CREATE (i:Identifier:Entity) SET i = row.props, i.createdAt = $now, i.updatedAt = $now, i.lastWriterRunId = $run
           WITH i MATCH (a:Activity {uid: $activityUid}) CREATE (i)-[:WAS_GENERATED_BY]->(a)`,
          { rows: batch.rows, activityUid: batch.activityUid },
        ),
      ];
    case "assertions":
      // Group = (subjectLabel, objectLabel). Creates the Assertion and its kernel spine edges.
      return [
        S(`MATCH (g:Agent {uid: $agentUid}) MATCH (act:Activity {uid: $activityUid})
           UNWIND $rows AS row
           MATCH (s${L([batch.subjectLabel])} {uid: row.subjectUid})
           MATCH (o${L([batch.objectLabel])} {uid: row.objectUid})
           MATCH (loc:SourceLocator {uid: row.locatorUid})
           CREATE (x:Assertion) SET x = row.props, x.recordedAt = $now, x.createdAt = $now, x.updatedAt = $now, x.lastWriterRunId = $run
           CREATE (x)-[:HAS_SUBJECT]->(s)
           CREATE (x)-[:HAS_OBJECT]->(o)
           CREATE (x)-[:ASSERTED_BY]->(g)
           CREATE (x)-[:HAS_EVIDENCE {role: 'CONTEXT', origin: 'DECLARED', expectedSelectedContentDigest: row.quoteHash, lastWriterRunId: $run}]->(loc)
           CREATE (x)-[:WAS_GENERATED_BY]->(act)`,
          { rows: batch.rows, agentUid: batch.agentUid, activityUid: batch.activityUid },
        ),
      ];
    case "relationships":
      return [
        S(`UNWIND $rows AS row
           MATCH (a${L([batch.fromLabel])} {uid: row.fromUid})
           MATCH (b${L([batch.toLabel])} {uid: row.toUid})
           CREATE (a)-[r:${q(batch.type)}]->(b) SET r = row.props, r.recordedFrom = $now, r.lastWriterRunId = $run`,
          { rows: batch.rows },
        ),
      ];
    case "migratedFrom":
      // Legacy rows are matched by their durable legacy key (never by elementId, which is not durable across restores).
      return [
        S(`UNWIND $rows AS row
           MATCH (v${L([batch.v2Label])} {uid: row.uid})
           MATCH (l${L([batch.legacyLabel])}) WHERE l[$keyProp] = row.legacyKey
           CREATE (v)-[m:MIGRATED_FROM]->(l) SET m = row.props, m.migrationRunId = $run`,
          { rows: batch.rows, keyProp: batch.keyProp },
        ),
      ];
    case "relabel":
      if (batch.mode === "relabel") {
        return [
          S(`MATCH (l${L([batch.label])}) WHERE l[$keyProp] IN $keys
             REMOVE l${L([batch.label])}
             SET l${L(["LegacyV0_" + batch.label, "LegacyV0"])}, l.legacyLabels = $legacyLabels, l.legacyExportDigest = $exportDigest`,
            { keys: batch.keys, keyProp: batch.keyProp, legacyLabels: [batch.label], exportDigest: ctx.exportDigest },
          ),
        ];
      }
      return [
        S(`MATCH (l${L([batch.label])}) WHERE l[$keyProp] IN $keys
           SET l:LegacyV0, l.legacyLabels = $legacyLabels, l.legacyExportDigest = $exportDigest`,
          { keys: batch.keys, keyProp: batch.keyProp, legacyLabels: [batch.label], exportDigest: ctx.exportDigest },
        ),
      ];
    default:
      throw new Error(`unknown batch kind ${batch.kind}`);
  }
}

/** Precondition per batch, evaluated inside the batch transaction: no uid of this batch may already exist. */
export function preconditionFor(batch) {
  const uids = batch.uids ?? [];
  if (!uids.length) return null;
  return { statement: CYPHER_PREFIX + "MATCH (n) WHERE n.uid IN $uids RETURN count(n) AS existing", params: { uids } };
}

/** Writer fence + checkpoint marker participation (S3 protocol, INTERFACES section 10; packages/kg-ops/src/fence.ts lockFence). */
// 1. exclusive lock with a write that reads nothing; 2. dependent lockSeq update and fresh read under the held lock.
export const FENCE_LOCK_1 = CYPHER_PREFIX + "MATCH (f:KsWriteFence {id: 'canonical'}) SET f.locked = true RETURN count(f) AS c";
export const FENCE_LOCK_2 = CYPHER_PREFIX + "MATCH (f:KsWriteFence {id: 'canonical'}) SET f.lockSeq = coalesce(f.lockSeq, 0) + 1 RETURN f.graphRevision AS graphRevision, f.lockSeq AS lockSeq";
// graphRevision advances once per committed effect (a batch with graph effects), never for a skipped batch.
export const FENCE_ADVANCE = CYPHER_PREFIX + "MATCH (f:KsWriteFence {id: 'canonical'}) SET f.graphRevision = f.graphRevision + 1, f.lastEffectKey = $effectKey, f.lastWriterRunId = $run, f.updatedAt = datetime.transaction() RETURN f.graphRevision AS rev";
export const MARKER_LOOKUP = CYPHER_PREFIX + "MATCH (m:KsIntentMarker {markerKey: $markerKey}) RETURN m.status AS status, m.intentDigest AS intentDigest, m.attempts AS attempts, m.receiptId AS receiptId";
// Persisted status is applied | failed only; the marker is written in the same transaction as the batch effects.
export const MARKER_APPLIED = CYPHER_PREFIX + `MERGE (m:KsIntentMarker {markerKey: $markerKey})
ON CREATE SET m.startedAt = datetime.transaction()
SET m.status = 'applied', m.effectKey = $effectKey, m.installationId = $installationId, m.applicationId = $applicationId, m.tenantId = $tenantId,
    m.intentId = $batchId, m.intentDigest = $batchDigest, m.planRef = $runId, m.planDigest = $manifestDigest, m.receiptId = $receiptId, m.receipt = $receipt,
    m.attempts = $attempts, m.lastAttemptId = $attemptId, m.graphRevision = $rev, m.executorVersion = $executorVersion, m.finishedAt = datetime.transaction()`;
export const RELEASE_MARKER = CYPHER_PREFIX + `MERGE (r:KsReleaseMarker {releaseId: $releaseId})
ON CREATE SET r.schemaReleaseDigest = $schemaReleaseDigest, r.ddlDigest = $ddlDigest, r.installedAt = datetime.transaction(), r.migrationRunId = $run,
    r.legacyExportDigest = $exportDigest, r.migrationManifestDigest = $manifestDigest
RETURN r.migrationRunId AS run, r.schemaReleaseDigest AS digest`;
