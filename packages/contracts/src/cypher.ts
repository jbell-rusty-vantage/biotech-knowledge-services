import { z } from "zod";
import { JsonValue } from "./common.js";

export const CYPHER_REQUEST_VERSION = "biotech-cypher-request.v1" as const;

/**
 * Ad hoc Cypher (baseline tools). Reads run in a read transaction with a row cap.
 * Writes run in a write transaction that is rolled back when the delete caps are exceeded,
 * when a forbidden clause is present, or when `allowDeletes` is false and anything was deleted.
 */
export const CypherRequest = z.strictObject({
  schemaVersion: z.literal(CYPHER_REQUEST_VERSION).default(CYPHER_REQUEST_VERSION),
  mode: z.enum(["read", "write", "explain"]),
  cypher: z.string().min(1).max(20_000),
  params: z.record(z.string(), JsonValue).default({}),
  rowCap: z.number().int().min(1).max(2000).optional(),
  timeoutMs: z.number().int().min(100).max(120_000).optional(),
  purpose: z.string().max(500).optional(),
  /** Write mode only: permit deletes up to the configured caps. Big deletes are always refused. */
  allowDeletes: z.boolean().default(false),
  runId: z.string().max(200).optional(),
});
export type CypherRequest = z.infer<typeof CypherRequest>;
export type CypherRequestInput = z.input<typeof CypherRequest>;

export const CypherCounters = z.strictObject({
  nodesCreated: z.number().int(),
  nodesDeleted: z.number().int(),
  relationshipsCreated: z.number().int(),
  relationshipsDeleted: z.number().int(),
  propertiesSet: z.number().int(),
  labelsAdded: z.number().int(),
  labelsRemoved: z.number().int(),
});
export type CypherCounters = z.infer<typeof CypherCounters>;

export const CypherDiagnostic = z.strictObject({
  severity: z.enum(["error", "warning", "info"]),
  message: z.string(),
});
export type CypherDiagnostic = z.infer<typeof CypherDiagnostic>;

export const CypherResult = z.strictObject({
  ok: z.boolean(),
  mode: z.enum(["read", "write", "explain"]),
  rows: z.array(z.record(z.string(), JsonValue)),
  rowCount: z.number().int(),
  truncated: z.boolean(),
  counters: CypherCounters.optional(),
  committed: z.boolean(),
  rolledBackReason: z.string().optional(),
  diagnostics: z.array(CypherDiagnostic),
  elapsedMs: z.number().int(),
  error: z.string().optional(),
  plan: JsonValue.optional(),
});
export type CypherResult = z.infer<typeof CypherResult>;
