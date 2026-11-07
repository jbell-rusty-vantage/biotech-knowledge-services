import { CypherRequest, type CypherDiagnostic, type CypherResult } from "@bks/contracts";
import { countersToJson, recordToJson, toParams, type GraphClient } from "./neo4j.js";

export interface CypherGuardConfig {
  maxDeletedNodes: number;
  maxDeletedRelationships: number;
  rowCap: number;
  timeoutMs: number;
}

export function cypherGuardFromEnv(env: NodeJS.ProcessEnv = process.env): CypherGuardConfig {
  return {
    maxDeletedNodes: Number(env.BKS_CYPHER_MAX_DELETED_NODES ?? 5),
    maxDeletedRelationships: Number(env.BKS_CYPHER_MAX_DELETED_RELATIONSHIPS ?? 25),
    rowCap: Number(env.BKS_CYPHER_ROW_CAP ?? 200),
    timeoutMs: Number(env.BKS_CYPHER_TIMEOUT_MS ?? 30_000),
  };
}

/** Clauses that never run through the baseline tools, in any mode. */
const ALWAYS_FORBIDDEN: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /\bDROP\b/i, message: "DROP is not allowed." },
  { pattern: /\bCREATE\s+(OR\s+REPLACE\s+)?(INDEX|CONSTRAINT|DATABASE|USER|ROLE)\b/i, message: "Schema, database and security DDL is not allowed." },
  { pattern: /\bALTER\b/i, message: "ALTER is not allowed." },
  { pattern: /\bLOAD\s+CSV\b/i, message: "LOAD CSV is not allowed." },
  { pattern: /\bCALL\s*\{[^}]*\}\s*IN\s+TRANSACTIONS\b/i, message: "CALL { } IN TRANSACTIONS is not allowed (unbounded batches)." },
  { pattern: /\bapoc\.(periodic|trigger|cypher\.run(Many|File)|load|export|import|refactor|systemdb|schema)\b/i, message: "Admin, bulk and refactoring APOC procedures are not allowed." },
  { pattern: /\bdbms\.(security|cluster|setConfigValue|killQueries|killTransaction)/i, message: "DBMS admin procedures are not allowed." },
  { pattern: /\bdb\.(index\.(fulltext|vector)\.(create|drop)|createLabel|createProperty|createRelationshipType|clearQueryCaches)\b/i, message: "Index and schema procedures are not allowed." },
  { pattern: /\b(GRANT|REVOKE|DENY)\b/i, message: "Privilege statements are not allowed." },
  { pattern: /\bSHOW\s+(USERS|ROLES|PRIVILEGES|SERVERS|SETTINGS)\b/i, message: "Security and server introspection is not allowed." },
];

const WRITE_CLAUSES = /\b(CREATE|MERGE|SET|DELETE|DETACH|REMOVE|FOREACH)\b/i;
const DELETE_CLAUSES = /\b(DETACH\s+DELETE|DELETE)\b/i;
const PRIVATE_UID_PATTERNS = ["hu:private-", "hu:user-context", "hu:user-goal", "urn:hu:private", "hu:pcs-", "pcs:"];

export function validateCypher(cypher: string, mode: "read" | "write" | "explain"): CypherDiagnostic[] {
  const out: CypherDiagnostic[] = [];
  const stripped = cypher.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const f of ALWAYS_FORBIDDEN) if (f.pattern.test(stripped)) out.push({ severity: "error", message: f.message });
  if (mode !== "write" && WRITE_CLAUSES.test(stripped)) out.push({ severity: "error", message: `${mode} mode does not allow write clauses (CREATE/MERGE/SET/DELETE/REMOVE/FOREACH).` });
  if (/;\s*\S/.test(stripped.trim())) out.push({ severity: "error", message: "One statement per request; remove the ';' separator." });
  if (mode === "read" && !/\bLIMIT\b/i.test(stripped)) out.push({ severity: "info", message: "No LIMIT clause; the row cap applies and the result is marked truncated when exceeded." });
  if (mode === "write" && DELETE_CLAUSES.test(stripped)) out.push({ severity: "warning", message: "Statement deletes; the executor rolls back when the delete caps are exceeded or allowDeletes is false." });
  if (PRIVATE_UID_PATTERNS.some((p) => stripped.includes(p))) out.push({ severity: "error", message: "Private-personal uid prefixes never touch the shared graph." });
  if (/\bMATCH\s*\(\s*\w*\s*\)\s*(DETACH\s+)?DELETE\b/i.test(stripped)) out.push({ severity: "error", message: "Unfiltered MATCH () DELETE is a mass delete and is refused outright." });
  return out;
}

/**
 * Runs ad hoc Cypher under the baseline guard. Reads run in a read transaction (row cap enforced at the
 * cursor). Writes run in one transaction; the transaction is rolled back when the counters show deletes
 * beyond the caps or when deletes happened without `allowDeletes`.
 */
export async function runCypher(client: GraphClient, requestInput: unknown, guard: CypherGuardConfig): Promise<CypherResult> {
  const request = CypherRequest.parse(requestInput);
  const started = Date.now();
  const diagnostics = validateCypher(request.cypher, request.mode);
  const rowCap = Math.min(request.rowCap ?? guard.rowCap, 2000);
  const timeoutMs = Math.min(request.timeoutMs ?? guard.timeoutMs, 120_000);
  const base = { mode: request.mode, rows: [] as Array<Record<string, unknown>>, rowCount: 0, truncated: false, diagnostics, committed: false };
  if (diagnostics.some((d) => d.severity === "error")) {
    return { ...base, ok: false, elapsedMs: Date.now() - started, error: "Blocked by the Cypher guard; see diagnostics." };
  }
  const params = toParams(request.params);

  if (request.mode === "explain") {
    try {
      const plan = await client.read(async (tx) => {
        const res = await tx.run(`EXPLAIN ${request.cypher}`, params);
        return res.summary.plan ? JSON.parse(JSON.stringify(res.summary.plan)) : null;
      }, timeoutMs);
      return { ...base, ok: true, committed: false, elapsedMs: Date.now() - started, plan };
    } catch (error) {
      return { ...base, ok: false, elapsedMs: Date.now() - started, error: (error as Error).message };
    }
  }

  if (request.mode === "read") {
    try {
      // Stream at the execution boundary (AGENT-SKILLS section 3 repair): stop after rowCap rows plus a one-row overflow
      // probe instead of fetching every record and slicing. The governed read path is read/service.ts.
      const { rows, truncated } = await client.read(async (tx) => {
        const out: Array<Record<string, unknown>> = [];
        let over = false;
        for await (const rec of tx.run(request.cypher, params)) {
          if (out.length >= rowCap) {
            over = true;
            break;
          }
          out.push(recordToJson(rec));
        }
        return { rows: out, truncated: over };
      }, timeoutMs);
      return { ...base, ok: true, rows, rowCount: rows.length, truncated, committed: false, elapsedMs: Date.now() - started };
    } catch (error) {
      return { ...base, ok: false, elapsedMs: Date.now() - started, error: (error as Error).message };
    }
  }

  // write
  const session = client.session("WRITE");
  const tx = await session.beginTransaction({ timeout: timeoutMs });
  try {
    const res = await tx.run(request.cypher, params);
    const counters = countersToJson(res.summary.counters);
    const all = res.records.map(recordToJson);
    const rows = all.slice(0, rowCap);
    const deleted = counters.nodesDeleted + counters.relationshipsDeleted;
    let rolledBackReason: string | undefined;
    if (deleted > 0 && !request.allowDeletes) rolledBackReason = `Statement deleted ${counters.nodesDeleted} nodes / ${counters.relationshipsDeleted} relationships but allowDeletes is false.`;
    else if (counters.nodesDeleted > guard.maxDeletedNodes) rolledBackReason = `Statement would delete ${counters.nodesDeleted} nodes; cap is ${guard.maxDeletedNodes}.`;
    else if (counters.relationshipsDeleted > guard.maxDeletedRelationships) rolledBackReason = `Statement would delete ${counters.relationshipsDeleted} relationships; cap is ${guard.maxDeletedRelationships}.`;
    if (rolledBackReason) {
      await tx.rollback();
      return { ...base, ok: false, rows, rowCount: rows.length, truncated: all.length > rowCap, counters, committed: false, rolledBackReason, elapsedMs: Date.now() - started, error: "Rolled back by the Cypher guard." };
    }
    await tx.commit();
    return { ...base, ok: true, rows, rowCount: rows.length, truncated: all.length > rowCap, counters, committed: true, elapsedMs: Date.now() - started };
  } catch (error) {
    try {
      await tx.rollback();
    } catch {
      /* already closed */
    }
    return { ...base, ok: false, committed: false, elapsedMs: Date.now() - started, error: (error as Error).message };
  } finally {
    await session.close();
  }
}

/** Database-side schema introspection for the baseline agent (labels, relationship types, property keys, indexes). */
export async function introspectDatabase(client: GraphClient): Promise<Record<string, unknown>> {
  return client.read(async (tx) => {
    const labels = (await tx.run("CALL db.labels() YIELD label RETURN label ORDER BY label")).records.map((r) => String(r.get("label")));
    const relTypes = (await tx.run("CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType ORDER BY relationshipType")).records.map((r) => String(r.get("relationshipType")));
    const counts = (await tx.run("MATCH (n) UNWIND labels(n) AS l RETURN l AS label, count(*) AS c ORDER BY c DESC LIMIT 300")).records.map(recordToJson);
    const indexes = (await tx.run("SHOW INDEXES YIELD name, type, labelsOrTypes, properties RETURN name, type, labelsOrTypes, properties")).records.map(recordToJson);
    return { labels, relationshipTypes: relTypes, labelCounts: counts, indexes };
  });
}
