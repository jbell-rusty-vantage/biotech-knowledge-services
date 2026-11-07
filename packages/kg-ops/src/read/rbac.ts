import { RESTRICTED_PUBLIC_PROPERTIES, type ReadModel, type ReadScope } from "./visibility.js";

/**
 * Database read principals (Neo4j Enterprise fine-grained privileges) that make the read scopes real database
 * authority, not routing. Proven by the Gate B read tests on the Enterprise evaluation image; Community has no roles.
 * The lead applies the same statements on Aura before S9 (system database, admin principal). Never used by agents.
 *
 *   bks_reader_internal  every v2 record (PUBLIC + INTERNAL); operational / legacy records denied; no writes
 *   bks_reader_public    only records with privacyClass = 'PUBLIC' (null fails closed); span text denied; no writes
 *
 * Both: ACCESS on the database; no WRITE / NAME / INDEX / CONSTRAINT / admin privileges; DENY LOAD (LOAD CSV);
 * DENY EXECUTE of admin, side-effect and analytics procedure namespaces and every APOC / GDS / GenAI function. The
 * fence probe of `stable_revision` needs TRAVERSE + READ on the three fence/marker labels only.
 */
export const READER_ROLES: Record<ReadScope, string> = { internal: "bks_reader_internal", public: "bks_reader_public" };

const FENCE_READ: Array<[string, string[]]> = [
  ["KsWriteFence", ["id", "graphRevision", "lockSeq"]],
  ["KsRevocationFence", ["id", "generation"]],
  // the consumer API readiness check also reads installedAt / migrationRunId / ddlDigest
  ["KsReleaseMarker", ["releaseId", "schemaReleaseDigest", "installedAt", "migrationRunId", "ddlDigest"]],
];

/**
 * Read-only informational dbms procedures stay executable (PUBLIC grants EXECUTE on every procedure; these are simply
 * not denied): dbms.components (called by @neo4j/graphql on every request), dbms.info, dbms.showCurrentUser,
 * dbms.routing.getRoutingTable. Every other dbms procedure of 5.26 (admin, config, cluster, connections, locks, pools,
 * JMX, scheduler, security, allocation, upgrade) is denied by name or glob.
 */
export const ALLOWED_DBMS_PROCEDURES = ["dbms.components", "dbms.info", "dbms.showCurrentUser", "dbms.routing.getRoutingTable"];
const DENIED_DBMS = ["dbms.checkConfigValue", "dbms.cluster.*", "dbms.killConnection", "dbms.killConnections", "dbms.listActiveLocks", "dbms.listCapabilities", "dbms.listConfig", "dbms.listConnections", "dbms.listPools", "dbms.quarantineDatabase", "dbms.queryJmx", "dbms.scheduler.*", "dbms.security.*", "dbms.setConfigValue", "dbms.setDatabaseAllocator", "dbms.setDefaultAllocationNumbers", "dbms.setDefaultDatabase", "dbms.showTopologyGraphConfig", "dbms.upgrade*",
  // Aura 5.27 / APOC 2026.09 inventory (runs/release-v2/custody/s9/aura-functions-procedures.json)
  "dbms.recreateDatabase", "dbms.unquarantineDatabase"];
const DENIED_PROCEDURES = ["apoc.*", ...DENIED_DBMS, "gds.*", "genai.*", "tx.*", "cdc.*", "db.create*", "db.index.vector*", "db.clearQueryCaches", "db.schema.*", "db.stats.*", "db.prepareForReplanning", "db.checkpoint", "db.awaitIndex*", "db.resampleIndex", "db.resampleOutdatedIndexes",
  // every other db.* procedure (only db.index.fulltext.queryNodes stays executable: the policy allowlist)
  "db.cdc.*", "db.index.fulltext.awaitEventuallyConsistentIndexRefresh", "db.index.fulltext.listAvailableAnalyzers", "db.index.fulltext.queryRelationships", "db.index.fulltext.drop*", "db.info", "db.labels", "db.listLocks", "db.ping", "db.propertyKeys", "db.relationshipTypes",
  // provider namespaces that are not on the tested servers (defensive)
  "aura.*"];
/**
 * APOC functions the consumer GraphQL API (@neo4j/graphql 7.6.3) emits: only `apoc.date.convertFormat` (date field
 * formatting; 644 calls in apps/graphql-api/benchmarks/2026-10-12-plans.json and the only APOC function in its
 * generated Cypher there). It is pure. PUBLIC grants EXECUTE on every function and a DENY always wins, so the deny list
 * names every other APOC function family instead of `apoc.*`: each namespace of APOC core 5.26.31 (`SHOW FUNCTIONS`)
 * except `apoc.date`, plus the namespaces of extended / Aura APOC, plus every `apoc.date.*` function except
 * convertFormat. `functionDenied()` lets a test check completeness against a server's `SHOW FUNCTIONS`; re-run that
 * check after any APOC upgrade (Aura runs APOC 2026.09). `apoc.util.validatePredicate` (emitted only for
 * @authorization validate rules, which the projection does not use) stays denied.
 */
export const ALLOWED_APOC_FUNCTIONS = ["apoc.date.convertFormat"];
const APOC_FUNCTION_NAMESPACES = [
  "agg", "any", "bitwise", "coll", "convert", "create", "cypher", "data", "diff", "hashing", "json", "label", "map", "math", "meta", "node", "nodes", "number", "path", "rel", "schema", "scoring", "temporal", "text", "util", "xml",
  // extended / Aura APOC families (functions or procedures; denying a family with no functions is harmless)
  "atomic", "bolt", "case", "config", "couchbase", "custom", "do", "es", "export", "generate", "get", "graph", "import", "jdbc", "load", "lock", "log", "merge", "metrics", "ml", "mongo", "mongodb", "monitor", "neighbors", "nlp", "periodic", "redis", "refactor", "s3", "search", "spatial", "static", "stats", "systemdb", "trigger", "ttl", "uuid", "warmup", "when",
];
const APOC_DATE_FUNCTIONS = ["apoc.date.add", "apoc.date.convert", "apoc.date.currentTimestamp", "apoc.date.field", "apoc.date.fields", "apoc.date.format", "apoc.date.fromISO8601", "apoc.date.parse", "apoc.date.systemTimezone", "apoc.date.toISO8601", "apoc.date.toYears"];
const DENIED_FUNCTIONS = [...APOC_FUNCTION_NAMESPACES.map((n) => `apoc.${n}.*`), "apoc.version", ...APOC_DATE_FUNCTIONS, "gds.*", "genai.*", "ai.*"];

/** True when the reader roles' DENY EXECUTE FUNCTION list covers `name` (glob semantics: `*` matches any suffix). */
export function functionDenied(name: string): boolean {
  return DENIED_FUNCTIONS.some((g) => (g.endsWith("*") ? name.startsWith(g.slice(0, -1)) : name === g));
}

export function readerRoleStatements(model: ReadModel, scope: ReadScope, database = "neo4j", role = READER_ROLES[scope]): string[] {
  const g = `GRAPH \`${database}\``;
  const s: string[] = [`CREATE ROLE ${role} IF NOT EXISTS`, `GRANT ACCESS ON DATABASE \`${database}\` TO ${role}`];
  // consumer API readiness (SHOW INDEXES / SHOW CONSTRAINTS): read-only schema metadata
  s.push(`GRANT SHOW INDEX ON DATABASE \`${database}\` TO ${role}`, `GRANT SHOW CONSTRAINT ON DATABASE \`${database}\` TO ${role}`);
  if (scope === "internal") {
    s.push(`GRANT MATCH {*} ON ${g} NODES * TO ${role}`);
  } else {
    s.push(`GRANT TRAVERSE ON ${g} FOR (n) WHERE n.privacyClass = 'PUBLIC' TO ${role}`);
    s.push(`GRANT READ {*} ON ${g} FOR (n) WHERE n.privacyClass = 'PUBLIC' TO ${role}`);
    for (const [type, props] of Object.entries(RESTRICTED_PUBLIC_PROPERTIES)) {
      const label = model.node(type)?.primaryLabel ?? type;
      s.push(`DENY READ {${props.join(", ")}} ON ${g} NODES ${label} TO ${role}`);
    }
  }
  s.push(`GRANT MATCH {*} ON ${g} RELATIONSHIPS * TO ${role}`);
  for (const [label, props] of FENCE_READ) {
    s.push(`GRANT TRAVERSE ON ${g} NODES ${label} TO ${role}`);
    s.push(`GRANT READ {${props.join(", ")}} ON ${g} NODES ${label} TO ${role}`);
  }
  const fence = new Set(FENCE_READ.map(([l]) => l));
  const denyLabels = [...model.operationalLabels].filter((l) => !fence.has(l)).sort();
  if (denyLabels.length) s.push(`DENY TRAVERSE ON ${g} NODES ${denyLabels.join(", ")} TO ${role}`);
  const denyRels = [...model.operationalRelationshipTypes].sort();
  if (denyRels.length) s.push(`DENY TRAVERSE ON ${g} RELATIONSHIPS ${denyRels.join(", ")} TO ${role}`);
  const denyProps = [...model.operationalProperties].sort();
  if (denyProps.length) s.push(`DENY READ {${denyProps.join(", ")}} ON ${g} NODES * TO ${role}`);
  s.push(`DENY LOAD ON ALL DATA TO ${role}`);
  s.push(`DENY EXECUTE PROCEDURE ${DENIED_PROCEDURES.join(", ")} ON DBMS TO ${role}`);
  s.push(`DENY EXECUTE BOOSTED PROCEDURE * ON DBMS TO ${role}`);
  s.push(`DENY EXECUTE FUNCTION ${DENIED_FUNCTIONS.join(", ")} ON DBMS TO ${role}`);
  return s;
}

/** User creation for a disposable test instance (production users are created by the lead with secret passwords). */
export function readerUserStatements(user: string, password: string, role: string): string[] {
  return [`CREATE OR REPLACE USER ${user} SET PASSWORD '${password.replace(/'/g, "")}' CHANGE NOT REQUIRED`, `GRANT ROLE ${role} TO ${user}`];
}
