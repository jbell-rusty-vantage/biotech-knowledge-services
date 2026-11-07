import { describe, expect, it } from "vitest";
import { configFromEnv } from "./config.js";

const base = { BKS_BIOTECH_GRAPH_URI: "neo4j://127.0.0.1:7692", BKS_BIOTECH_GRAPH_READER_USERNAME: "bks_reader", BKS_BIOTECH_GRAPH_READER_PASSWORD: "x", GRAPHQL_ACTOR_PUBLIC_KEY: "-----BEGIN PUBLIC KEY-----\nx\n-----END PUBLIC KEY-----" };
const prod = { ...base, NODE_ENV: "production", BKS_BIOTECH_GRAPH_DATABASE: "neo4j", GRAPHQL_API_KEY: "k".repeat(40) };

describe("configuration", () => {
  it("applies the release policy defaults", () => {
    const c = configFromEnv(base);
    expect(c).toMatchObject({ profile: "product", requestBodyLimitBytes: 262144, maxResponseBytes: 2097152, dbTimeoutMs: 5000, deadlineMs: 8000 });
    expect(c.limits).toMatchObject({ maxDepth: 8, rootDefault: 25, rootMax: 100, nestedMax: 25 });
    expect(c.neo4j).toMatchObject({ username: "bks_reader", credentialSource: "reader", database: "neo4j" });
    expect(c.pool.maxConnectionPoolSize).toBeLessThanOrEqual(100);
  });

  it("refuses startup DDL, mutations, vector and skipped release checks in production", () => {
    expect(() => configFromEnv({ ...prod, GRAPHQL_ENSURE_OPERATIONS: "true" })).toThrow(/migration job/);
    expect(() => configFromEnv({ ...prod, GRAPHQL_ALLOW_MUTATIONS: "true" })).toThrow(/Mutation root/);
    expect(() => configFromEnv({ ...prod, GRAPHQL_ENABLE_VECTOR: "true" })).toThrow(/vector/);
    expect(() => configFromEnv({ ...prod, GRAPHQL_READINESS_RELEASE_CHECK: "skip" })).toThrow(/not allowed in production/);
    expect(() => configFromEnv(prod)).not.toThrow();
  });

  it("warns instead of refusing outside production, and still never runs DDL", () => {
    const c = configFromEnv({ ...base, GRAPHQL_ENSURE_OPERATIONS: "true", GRAPHQL_READINESS_RELEASE_CHECK: "skip" });
    expect(c.warnings.join("\n")).toMatch(/GRAPHQL_ENSURE_OPERATIONS=true.*ignored outside production/);
    expect(c.readiness.skipReleaseCheck).toBe(true);
  });

  it("requires a service credential, an explicit database and the actor key in production", () => {
    expect(() => configFromEnv({ ...prod, GRAPHQL_API_KEY: "" })).toThrow(/GRAPHQL_API_KEY/);
    expect(() => configFromEnv({ ...prod, GRAPHQL_API_KEY: "short" })).toThrow(/GRAPHQL_API_KEY/);
    expect(() => configFromEnv({ ...prod, BKS_BIOTECH_GRAPH_DATABASE: "" })).toThrow(/BKS_BIOTECH_GRAPH_DATABASE/);
    expect(() => configFromEnv({ ...prod, GRAPHQL_ACTOR_PUBLIC_KEY: "" })).toThrow(/GRAPHQL_ACTOR_PUBLIC_KEY/);
  });

  it("falls back to the primary BKS_BIOTECH_GRAPH_* login with a warning", () => {
    const c = configFromEnv({ BKS_BIOTECH_GRAPH_URI: "neo4j://h", BKS_BIOTECH_GRAPH_USERNAME: "neo4j", BKS_BIOTECH_GRAPH_PASSWORD: "p", GRAPHQL_ACTOR_PUBLIC_KEY: "k" });
    expect(c.neo4j.credentialSource).toBe("fallback");
    expect(c.warnings.join("\n")).toMatch(/read-only principal/);
  });

  it("lets environment values tighten bounds but never loosen them", () => {
    expect(configFromEnv({ ...base, GRAPHQL_MAX_DEPTH: "6" }).limits.maxDepth).toBe(6);
    expect(() => configFromEnv({ ...base, GRAPHQL_MAX_DEPTH: "12" })).toThrow(/loosens/);
    expect(() => configFromEnv({ ...base, GRAPHQL_BODY_LIMIT_BYTES: String(10 * 1024 * 1024) })).toThrow(/loosens/);
    expect(() => configFromEnv({ ...base, GRAPHQL_TX_TIMEOUT_MS: "15000" })).toThrow(/loosens/);
    expect(() => configFromEnv({ ...base, GRAPHQL_TX_TIMEOUT_MS: "4000", GRAPHQL_DEADLINE_MS: "3000" })).toThrow(/below/);
  });

  it("requires a strong key for the engineering profile and the actor key for the product profile", () => {
    expect(() => configFromEnv({ ...base, GRAPHQL_PROFILE: "engineering" })).toThrow(/GRAPHQL_ENGINEERING_KEY/);
    expect(configFromEnv({ ...base, GRAPHQL_PROFILE: "engineering", GRAPHQL_ENGINEERING_KEY: "e".repeat(40), GRAPHQL_ACTOR_PUBLIC_KEY: "" }).profile).toBe("engineering");
    expect(() => configFromEnv({ ...base, GRAPHQL_ACTOR_PUBLIC_KEY: "" })).toThrow(/product profile requires/);
    expect(() => configFromEnv({ ...base, GRAPHQL_PROFILE: "debug" })).toThrow(/GRAPHQL_PROFILE/);
  });
});
