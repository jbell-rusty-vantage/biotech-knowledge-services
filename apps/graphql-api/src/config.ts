import { DEFAULT_ADMISSION_LIMITS, type AdmissionLimits } from "./limits.js";

/**
 * Consumer API configuration (SPECIFICATION 5.2 initial consumer limits). Environment values may tighten a bound but
 * never loosen it past the release policy; production refuses settings that would reintroduce startup DDL,
 * mutations, vector/provider wiring or skipped release checks.
 */

export type Profile = "product" | "engineering";

export interface ApiConfig {
  production: boolean;
  profile: Profile;
  port: number;
  neo4j: { uri: string; username: string; password: string; database: string; credentialSource: "reader" | "fallback" };
  pool: { maxConnectionPoolSize: number; connectionAcquisitionTimeoutMs: number; connectionTimeoutMs: number; maxTransactionRetryTimeMs: number };
  /** Service credential the BFF presents in `x-api-key`; required in production. */
  serviceApiKey: string | null;
  /** Engineering profile key (`x-bks-engineering-key`). */
  engineeringKey: string | null;
  actor: { issuer: string; audience: string; publicKey: string } | null;
  limits: AdmissionLimits;
  requestBodyLimitBytes: number;
  maxResponseBytes: number;
  dbTimeoutMs: number;
  deadlineMs: number;
  maxTokens: number;
  readiness: { skipReleaseCheck: boolean; cacheMs: number };
  /** Execute every safelisted document once after start to warm the Cypher plan cache (readiness waits for it). */
  warmup: boolean;
  corsOrigins: string[];
  warnings: string[];
}

export const RELEASE_POLICY = {
  maxDepth: 8,
  requestBodyLimitBytes: 256 * 1024,
  maxResponseBytes: 2 * 1024 * 1024,
  dbTimeoutMs: 5000,
  deadlineMs: 8000,
  maxTokens: 5000,
} as const;

export class ConfigError extends Error {
  constructor(message: string) {
    super(`configuration refused: ${message}`);
    this.name = "ConfigError";
  }
}

function int(env: NodeJS.ProcessEnv, name: string, fallback: number, ceiling?: number): number {
  const raw = env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) throw new ConfigError(`${name} must be a positive integer, got "${raw}"`);
  if (ceiling !== undefined && value > ceiling) throw new ConfigError(`${name}=${value} loosens the release bound ${ceiling}; values may only tighten it`);
  return value;
}

export function configFromEnv(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  const production = env.NODE_ENV === "production";
  const warnings: string[] = [];
  const refuseOrWarn = (condition: boolean, message: string) => {
    if (!condition) return;
    if (production) throw new ConfigError(message);
    warnings.push(`${message} (ignored outside production)`);
  };
  refuseOrWarn(env.GRAPHQL_ENSURE_OPERATIONS === "true", "GRAPHQL_ENSURE_OPERATIONS=true: DDL belongs to the migration job, the API never runs DDL at startup");
  refuseOrWarn(env.GRAPHQL_ALLOW_MUTATIONS === "true", "GRAPHQL_ALLOW_MUTATIONS=true: the consumer executable has no Mutation root; writes are typed ingestion intents through the executor");
  refuseOrWarn(env.GRAPHQL_ENABLE_VECTOR === "true", "GRAPHQL_ENABLE_VECTOR=true: product vector search is unsupported in this release (no provider wiring exists)");
  const releaseCheck = env.GRAPHQL_READINESS_RELEASE_CHECK?.trim() || "enforce";
  if (releaseCheck !== "enforce" && releaseCheck !== "skip") throw new ConfigError(`GRAPHQL_READINESS_RELEASE_CHECK must be enforce or skip, got ${releaseCheck}`);
  if (releaseCheck === "skip" && production) throw new ConfigError("GRAPHQL_READINESS_RELEASE_CHECK=skip is not allowed in production");
  if (releaseCheck === "skip") warnings.push("readiness release check SKIPPED (non-production only)");

  const profileRaw = env.GRAPHQL_PROFILE?.trim() || "product";
  if (profileRaw !== "product" && profileRaw !== "engineering") throw new ConfigError(`GRAPHQL_PROFILE must be product or engineering, got ${profileRaw}`);
  const profile: Profile = profileRaw;

  const uri = env.BKS_BIOTECH_GRAPH_URI?.trim();
  let username = env.BKS_BIOTECH_GRAPH_READER_USERNAME?.trim();
  let password = env.BKS_BIOTECH_GRAPH_READER_PASSWORD;
  let credentialSource: "reader" | "fallback" = "reader";
  if (!username || !password) {
    username = env.BKS_BIOTECH_GRAPH_USERNAME?.trim();
    password = env.BKS_BIOTECH_GRAPH_PASSWORD;
    credentialSource = "fallback";
    warnings.push("BKS_BIOTECH_GRAPH_READER_USERNAME/BKS_BIOTECH_GRAPH_READER_PASSWORD not set; falling back to BKS_BIOTECH_GRAPH_USERNAME/BKS_BIOTECH_GRAPH_PASSWORD. Use a read-only principal (bks_reader) for the consumer API.");
  }
  if (!uri || !username || !password) throw new ConfigError("BKS_BIOTECH_GRAPH_URI and the reader (or fallback) username/password are required");
  const database = env.BKS_BIOTECH_GRAPH_DATABASE?.trim();
  if (!database && production) throw new ConfigError("BKS_BIOTECH_GRAPH_DATABASE must be set explicitly in production");

  const serviceApiKey = env.GRAPHQL_API_KEY?.trim() || null;
  if (production && (!serviceApiKey || serviceApiKey.length < 32)) throw new ConfigError("production requires GRAPHQL_API_KEY (>= 32 characters), presented by the BFF in x-api-key");
  const engineeringKey = env.GRAPHQL_ENGINEERING_KEY?.trim() || null;
  if (profile === "engineering" && (!engineeringKey || engineeringKey.length < 32)) throw new ConfigError("GRAPHQL_PROFILE=engineering requires GRAPHQL_ENGINEERING_KEY (>= 32 characters)");

  const publicKey = env.GRAPHQL_ACTOR_PUBLIC_KEY?.trim();
  const actor = publicKey
    ? { issuer: env.GRAPHQL_ACTOR_ISSUER?.trim() || "bks-product-bff", audience: env.GRAPHQL_ACTOR_AUDIENCE?.trim() || "bks-graphql-api", publicKey: publicKey.replace(/\\n/g, "\n") }
    : null;
  if (profile === "product" && !actor) throw new ConfigError("the product profile requires GRAPHQL_ACTOR_PUBLIC_KEY (the BFF actor-context Ed25519 public key or JWKS)");

  const limits: AdmissionLimits = {
    ...DEFAULT_ADMISSION_LIMITS,
    maxDepth: int(env, "GRAPHQL_MAX_DEPTH", RELEASE_POLICY.maxDepth, RELEASE_POLICY.maxDepth),
    maxCost: int(env, "GRAPHQL_MAX_COST", DEFAULT_ADMISSION_LIMITS.maxCost, DEFAULT_ADMISSION_LIMITS.maxCost),
    maxOffset: int(env, "GRAPHQL_MAX_OFFSET", DEFAULT_ADMISSION_LIMITS.maxOffset, DEFAULT_ADMISSION_LIMITS.maxOffset),
  };
  const dbTimeoutMs = int(env, "GRAPHQL_TX_TIMEOUT_MS", RELEASE_POLICY.dbTimeoutMs, RELEASE_POLICY.dbTimeoutMs);
  const deadlineMs = int(env, "GRAPHQL_DEADLINE_MS", RELEASE_POLICY.deadlineMs, RELEASE_POLICY.deadlineMs);
  if (dbTimeoutMs >= deadlineMs) throw new ConfigError("GRAPHQL_TX_TIMEOUT_MS must be below GRAPHQL_DEADLINE_MS");

  return {
    production,
    profile,
    port: int(env, "PORT", 4010),
    neo4j: { uri, username, password, database: database || "neo4j", credentialSource },
    pool: {
      maxConnectionPoolSize: int(env, "NEO4J_MAX_POOL_SIZE", 20, 100),
      connectionAcquisitionTimeoutMs: int(env, "NEO4J_ACQUISITION_TIMEOUT_MS", 2000, 5000),
      connectionTimeoutMs: int(env, "NEO4J_CONNECTION_TIMEOUT_MS", 3000, 5000),
      maxTransactionRetryTimeMs: int(env, "NEO4J_MAX_RETRY_TIME_MS", 1000, 3000),
    },
    serviceApiKey,
    engineeringKey,
    actor,
    limits,
    requestBodyLimitBytes: int(env, "GRAPHQL_BODY_LIMIT_BYTES", RELEASE_POLICY.requestBodyLimitBytes, RELEASE_POLICY.requestBodyLimitBytes),
    maxResponseBytes: int(env, "GRAPHQL_MAX_RESPONSE_BYTES", RELEASE_POLICY.maxResponseBytes, RELEASE_POLICY.maxResponseBytes),
    dbTimeoutMs,
    deadlineMs,
    maxTokens: int(env, "GRAPHQL_MAX_TOKENS", RELEASE_POLICY.maxTokens, RELEASE_POLICY.maxTokens),
    readiness: { skipReleaseCheck: releaseCheck === "skip", cacheMs: int(env, "GRAPHQL_READINESS_CACHE_MS", 5000, 60000) },
    warmup: env.GRAPHQL_WARMUP !== "false",
    corsOrigins: (env.WEB_ORIGIN ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && s !== "*"),
    warnings,
  };
}
