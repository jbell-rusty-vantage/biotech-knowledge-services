import neo4j, {
  Driver,
  Integer,
  isDate,
  isDateTime,
  isDuration,
  isInt,
  isLocalDateTime,
  isLocalTime,
  isPoint,
  isTime,
  type ManagedTransaction,
  type Record as Neo4jRecord,
  type Session,
} from "neo4j-driver";

export interface Neo4jConfig {
  uri: string;
  username: string;
  password: string;
  database: string;
}

/** Reads the Biotech graph login BKS_BIOTECH_GRAPH_* (no fallback to older names). */
export function neo4jConfigFromEnv(env: NodeJS.ProcessEnv = process.env): Neo4jConfig {
  const uri = env.BKS_BIOTECH_GRAPH_URI;
  const username = env.BKS_BIOTECH_GRAPH_USERNAME;
  const password = env.BKS_BIOTECH_GRAPH_PASSWORD;
  if (!uri || !username || !password) {
    throw new Error("Missing Neo4j env: BKS_BIOTECH_GRAPH_URI, BKS_BIOTECH_GRAPH_USERNAME, BKS_BIOTECH_GRAPH_PASSWORD");
  }
  return { uri, username, password, database: env.BKS_BIOTECH_GRAPH_DATABASE ?? "neo4j" };
}

/** Hosts of the managed production databases (Neo4j Aura). */
const PRODUCTION_HOST = /(^|\.)databases\.neo4j\.io$/i;

export class TargetGuardError extends Error {}

/**
 * Production guard: a connection to an Aura-hosted database (`*.databases.neo4j.io`) is refused unless the process was
 * started for production explicitly (`BKS_TARGET=production`). Tests, local development and the CLI therefore cannot
 * reach production by picking up a repository .env by accident. Throws TargetGuardError; never prints the URI.
 */
export function assertTargetAllowed(uri: string, env: NodeJS.ProcessEnv = process.env): void {
  let host = "";
  try {
    host = new URL(uri.replace(/^(neo4j|bolt)(\+s|\+ssc)?:\/\//i, "http://")).hostname;
  } catch {
    host = "";
  }
  if (PRODUCTION_HOST.test(host) && env.BKS_TARGET !== "production") {
    throw new TargetGuardError("BKS_TARGET guard: BKS_BIOTECH_GRAPH_URI points at a production Aura host (*.databases.neo4j.io); set BKS_TARGET=production explicitly to connect, or point BKS_BIOTECH_GRAPH_URI at a local database");
  }
}

/** Bounded connect / acquisition timeouts (ms) so an unreachable database fails promptly instead of after 30 s. */
const ACQUISITION_TIMEOUT_MS = Number(process.env.BKS_NEO4J_ACQUISITION_TIMEOUT_MS ?? 10_000);
const CONNECT_TIMEOUT_MS = Number(process.env.BKS_NEO4J_CONNECT_TIMEOUT_MS ?? 5_000);

export class GraphClient {
  readonly driver: Driver;
  constructor(
    readonly config: Neo4jConfig,
    env: NodeJS.ProcessEnv = process.env,
  ) {
    assertTargetAllowed(config.uri, env);
    this.driver = neo4j.driver(config.uri, neo4j.auth.basic(config.username, config.password), {
      maxConnectionPoolSize: 50,
      connectionAcquisitionTimeout: ACQUISITION_TIMEOUT_MS,
      connectionTimeout: CONNECT_TIMEOUT_MS,
      maxTransactionRetryTime: 15_000,
      disableLosslessIntegers: false,
    });
  }

  static fromEnv(env: NodeJS.ProcessEnv = process.env): GraphClient {
    return new GraphClient(neo4jConfigFromEnv(env), env);
  }

  async verify(): Promise<{ address: string; agent: string; protocolVersion: number | undefined }> {
    const info = await this.driver.getServerInfo({ database: this.config.database });
    return { address: info.address ?? "", agent: info.agent ?? "", protocolVersion: info.protocolVersion === undefined ? undefined : Number(info.protocolVersion) };
  }

  session(mode: "READ" | "WRITE"): Session {
    return this.driver.session({ database: this.config.database, defaultAccessMode: mode === "READ" ? neo4j.session.READ : neo4j.session.WRITE });
  }

  async read<T>(fn: (tx: ManagedTransaction) => Promise<T>, timeoutMs?: number): Promise<T> {
    const session = this.session("READ");
    try {
      return await session.executeRead(fn, timeoutMs ? { timeout: timeoutMs } : undefined);
    } finally {
      await session.close();
    }
  }

  async write<T>(fn: (tx: ManagedTransaction) => Promise<T>, timeoutMs?: number): Promise<T> {
    const session = this.session("WRITE");
    try {
      return await session.executeWrite(fn, timeoutMs ? { timeout: timeoutMs } : undefined);
    } finally {
      await session.close();
    }
  }

  async close(): Promise<void> {
    await this.driver.close();
  }
}

/** Converts driver values (Integer, temporal types, nodes, relationships, paths) to plain JSON. */
export function toJson(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (isInt(value)) return (value as Integer).inSafeRange() ? (value as Integer).toNumber() : (value as Integer).toString();
  if (typeof value === "bigint") return Number.isSafeInteger(Number(value)) ? Number(value) : value.toString();
  if (isDateTime(value) || isLocalDateTime(value) || isDate(value) || isTime(value) || isLocalTime(value) || isDuration(value)) return value.toString();
  if (isPoint(value)) return { srid: toJson(value.srid), x: value.x, y: value.y, z: value.z ?? null };
  if (Array.isArray(value)) return value.map(toJson);
  if (typeof value === "object") {
    const v = value as Record<string, unknown>;
    if ("labels" in v && "properties" in v && "elementId" in v) return { labels: v.labels, elementId: v.elementId, properties: toJson(v.properties) };
    if ("type" in v && "properties" in v && "startNodeElementId" in v) return { type: v.type, elementId: v.elementId, start: v.startNodeElementId, end: v.endNodeElementId, properties: toJson(v.properties) };
    if ("segments" in v && "start" in v && "end" in v) return { path: true, length: (v.segments as unknown[]).length, start: toJson(v.start), end: toJson(v.end) };
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) out[k] = toJson(val);
    return out;
  }
  return value;
}

export function recordToJson(record: Neo4jRecord): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of record.keys) out[String(key)] = toJson(record.get(key));
  return out;
}

export function countersToJson(counters: { updates(): Record<string, number> }): {
  nodesCreated: number;
  nodesDeleted: number;
  relationshipsCreated: number;
  relationshipsDeleted: number;
  propertiesSet: number;
  labelsAdded: number;
  labelsRemoved: number;
} {
  const u = counters.updates();
  return {
    nodesCreated: u.nodesCreated ?? 0,
    nodesDeleted: u.nodesDeleted ?? 0,
    relationshipsCreated: u.relationshipsCreated ?? 0,
    relationshipsDeleted: u.relationshipsDeleted ?? 0,
    propertiesSet: u.propertiesSet ?? 0,
    labelsAdded: u.labelsAdded ?? 0,
    labelsRemoved: u.labelsRemoved ?? 0,
  };
}

/** Cypher parameters must be driver-safe: plain JSON values pass through; ISO datetimes stay strings (callers cast with datetime($p) in Cypher). */
export function toParams(params: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(params)) as Record<string, unknown>;
}

export function cypherList(values: string[]): string {
  return `[${values.map((v) => JSON.stringify(v)).join(", ")}]`;
}

export { neo4j };
