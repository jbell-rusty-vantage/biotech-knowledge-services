import { BksServiceError, type AdmissionConsumeReportV1 } from "@bks/contracts";
import type { KnowledgeWriter } from "../write/service.js";
import { DispatchConsumer } from "./dispatch.js";
import { PgVerificationAuthority } from "./verification.js";

/**
 * Host configuration of the dispatch consumer (environment variable NAMES only; values are never printed):
 *
 *   BKS_BIOTECH_DB_VERIFICATION_DSN       login role holding knowledge_verification_outbox_worker in the Biotech
 *                                         application PostgreSQL (the common component knowledge_verification)
 *   BKS_VERIFICATION_TENANTS              comma-separated knowledge_verification tenant uuids this executor consumes for
 *   BKS_ADMISSION_CONSUMER_GRANTS         planner grants of the dispatch principal (default report.publish,assessment.accept,adjudication.deliver)
 *   BKS_ADMISSION_CONSUMER_LIMIT          dispatches per claim (default 10, max 100)
 *   BKS_BIOTECH_DB_VERIFICATION_READ_DSN  optional reader role for official-use reads (defaults to BKS_BIOTECH_DB_VERIFICATION_DSN)
 */
export interface ConsumerConfig {
  tenants: string[];
  grants: string[] | undefined;
  limit: number;
}

export function consumerConfigFromEnv(env: NodeJS.ProcessEnv = process.env): ConsumerConfig {
  const tenants = (env.BKS_VERIFICATION_TENANTS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const grants = env.BKS_ADMISSION_CONSUMER_GRANTS ? env.BKS_ADMISSION_CONSUMER_GRANTS.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
  return { tenants, grants, limit: Math.max(1, Math.min(100, Number(env.BKS_ADMISSION_CONSUMER_LIMIT ?? 10))) };
}

export function consumerConfigured(env: NodeJS.ProcessEnv = process.env): { ok: boolean; missing: string[] } {
  const missing = ["BKS_BIOTECH_DB_VERIFICATION_DSN", "BKS_VERIFICATION_TENANTS"].filter((k) => !env[k]?.trim());
  return { ok: missing.length === 0, missing };
}

/** One claim + process pass for every configured tenant (or the named one). Used by `bks admission consume --once`. */
export async function consumeOnceFromEnv(writer: KnowledgeWriter, env: NodeJS.ProcessEnv = process.env, opts: { tenantId?: string; limit?: number } = {}): Promise<AdmissionConsumeReportV1[]> {
  const c = consumerConfigured(env);
  if (!c.ok) throw new BksServiceError("BKS_AUTHORITY_UNAVAILABLE", `dispatch consumer is not configured: missing ${c.missing.join(", ")}`);
  const cfg = consumerConfigFromEnv(env);
  const tenants = opts.tenantId ? [opts.tenantId] : cfg.tenants;
  if (opts.tenantId && !cfg.tenants.includes(opts.tenantId)) throw new BksServiceError("BKS_FORBIDDEN_SCOPE", "tenant is not one of BKS_VERIFICATION_TENANTS");
  const authority = PgVerificationAuthority.fromEnv(env)!;
  try {
    const consumer = new DispatchConsumer({ authority, writer, ...(cfg.grants ? { grants: cfg.grants } : {}) });
    const out: AdmissionConsumeReportV1[] = [];
    for (const t of tenants) out.push(await consumer.consumeOnce(t, opts.limit ?? cfg.limit));
    return out;
  } finally {
    await authority.close();
  }
}
