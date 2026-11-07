import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { canonicalDigest, CONTRACT_VERSIONS, rawBytesDigest, WITNESS_MAX_LIFETIME_SECONDS } from "@bks/contracts";
import { loadRelease, repoRoot } from "@bks/schema-workspace";
import { capabilitiesFor, describe } from "../app.js";
import { requireRole } from "../auth.js";
import type { ExecutorContext } from "../context.js";
import type { ExecutorModule } from "./module.js";

/**
 * Capability descriptor for the Mission Control capability catalog (S7, IMPLEMENTATION S7 bullet 2).
 *
 * It states exactly what this deployment implements: contract versions, release/schema/query-catalog/DDL identities,
 * skill bundle digests, the admission policy digest, endpoint audience, read/write scopes, limits, partial policy,
 * receipt semantics and the consistency / recovery guarantees. Logical `knowledge.*` interfaces map onto the
 * capabilities the enabled modules register; anything not registered is `available: false` with its owner (nothing
 * planned-but-absent is advertised). `recovery.atomicCrossStore` is false: Neo4j, the admission ledger, Mission Control
 * PostgreSQL and Knowledge Services custody never share a transaction.
 *
 *   GET /capability     the live descriptor of this process (reader)
 *   apps/executor/capabilities/biotech-knowledge.capability.json   the catalog file for the production profile,
 *                       written / checked by `node apps/executor/scripts/capability.mjs write|check`
 */

export const CAPABILITY_FORMAT = "belllabs.knowledge-capability.v1" as const;
export const ENVELOPE_CONTRACTS = { request: "mc.knowledge_request.v1", delivery: "mc.knowledge_delivery.v1" } as const;
export const ADMISSION_POLICY = {
  policyVersion: "bks-admission-policy/v1",
  semantics: "authorization-at-issuance-plus-bounded-lease",
  witness: { format: CONTRACT_VERSIONS.applyWitness, alg: "Ed25519", audience: "bks-executor", maxLifetimeSeconds: WITNESS_MAX_LIFETIME_SECONDS },
  requiredAuthorities: ["mission-control grant reference", "knowledge-services sealed verification custody (when the plan cites verifications)"],
  revocation: { fence: "KsRevocationFence.generation", delivery: "durable outbox, at least once", servingRecheck: "GET /kg/eligibility" },
  failClosed: "BKS_AUTHORITY_UNAVAILABLE",
} as const;

/** Domain skills whose bundles agents load for this capability (digest = canonical digest of {path, sha256} per file). */
export const DOMAIN_SKILLS = ["biotech-schema-explore", "biotech-kg-query", "biotech-kg-ingest", "biotech-graph-ops", "biotech-graph-analyze"] as const;

export function treeDigest(dir: string): { digest: string; files: number } | null {
  let entries: Array<{ path: string; sha256: string }> = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d).sort()) {
      const p = join(d, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else if (st.isFile()) entries.push({ path: relative(dir, p).split("\\").join("/"), sha256: rawBytesDigest(readFileSync(p)) });
    }
  };
  try {
    walk(dir);
  } catch {
    return null;
  }
  entries = entries.sort((a, b) => (a.path < b.path ? -1 : 1));
  return { digest: canonicalDigest(entries), files: entries.length };
}

type Caps = Record<string, Record<string, unknown>>;
const has = (caps: Caps, name: string) => Boolean(caps[name]);

/** Logical Mission Control interfaces -> native capability (or explicit unavailability with the owner). */
export function knowledgeInterfaces(caps: Caps): Record<string, Record<string, unknown>> {
  const unavailable = (owner: string, note: string) => ({ available: false, owner, note });
  const read = caps["read.typed"];
  return {
    "knowledge.describe": { available: true, native: "GET /describe", role: "reader" },
    "knowledge.query": read ? { available: true, native: "POST /kg/read", role: "reader", contract: read.contract ?? null, passthrough: "native read intent bytes; result status vocabulary biotech-knowledge-read-result.v2", cypher: has(caps, "read.cypher") ? "POST /kg/read/cypher" : null } : unavailable("biotech-knowledge-services (reads role)", "no read module enabled"),
    "knowledge.ingestion_plan": has(caps, "plan") ? { available: true, native: "POST /kg/plan", role: "writer", contract: CONTRACT_VERSIONS.ingestionIntent, output: CONTRACT_VERSIONS.ingestionPlan, writes: false } : unavailable("biotech-knowledge-services", "plan disabled"),
    "knowledge.ingestion_apply": has(caps, "apply") ? { available: true, native: "POST /kg/apply", role: "writer", contract: CONTRACT_VERSIONS.applyRequest, receipt: CONTRACT_VERSIONS.ingestionReceipt, requiresWitness: true, admission: has(caps, "admission.witness") ? "POST /kg/admission/witness" : has(caps, "admission.dev") ? "POST /kg/admit (development only)" : null } : unavailable("biotech-knowledge-services", "apply disabled"),
    "knowledge.receipt_get": has(caps, "receipt.get") ? { available: true, native: "GET /kg/receipt?effectKey=", role: "reader", notFound: 404 } : unavailable("biotech-knowledge-services", "receipt lookup disabled"),
    "knowledge.verify_result": has(caps, "verifyEffects") ? { available: true, native: "POST /kg/verify-effects", role: "reader", contract: CONTRACT_VERSIONS.effectVerification, paginated: true } : unavailable("biotech-knowledge-services", "effect verification disabled"),
    "knowledge.retrieve": unavailable("knowledge-services", "no Biotech retrieval capability in this release (retrieve: available false)"),
    "knowledge.capture_prepare": unavailable("knowledge-services", "capture/preparation is a Knowledge Services capability, not served by the Biotech executor"),
    "knowledge.verify": unavailable("knowledge-services", "verification algorithms live in Knowledge Services; Biotech consumes sealed verification references"),
    "knowledge.classify_propose": unavailable("knowledge-services", "no proved semantic classification endpoint"),
    "knowledge.classify_admit": unavailable("knowledge-services", "no proved semantic classification endpoint"),
  };
}

export function buildCapabilityDescriptor(ctx: ExecutorContext, modules: ExecutorModule[]): Record<string, unknown> {
  const write = ctx.writeSchema();
  const release = loadRelease();
  let workspaceFingerprint: string | null = null;
  try {
    workspaceFingerprint = ctx.workspace().manifest.workspaceFingerprint;
  } catch {
    workspaceFingerprint = null;
  }
  const caps = capabilitiesFor(modules, ctx, null) as Caps;
  const described = describe(modules, ctx, null) as { consistency?: Record<string, unknown> };
  const skills = Object.fromEntries(DOMAIN_SKILLS.map((s) => [s, treeDigest(resolve(repoRoot, ".agents", "skills", s))]));
  const routing = (() => {
    try {
      return rawBytesDigest(readFileSync(resolve(repoRoot, ".agents", "skills", "skill-routing.json")));
    } catch {
      return null;
    }
  })();
  const body = {
    format: CAPABILITY_FORMAT,
    capabilityId: "biotech-knowledge-services",
    application: "biotech",
    service: "biotech-knowledge-services",
    executorVersion: ctx.executorVersion,
    endpoint: { audience: "bks-executor", transport: "http", auth: ["x-api-key", "Authorization: Bearer"], baseUrlEnv: "BIOTECH_EXECUTOR_URL", tokenEnv: "BIOTECH_EXECUTOR_TOKEN", tokenKind: "short-lived scoped service token (host-side; never in agent workspaces)" },
    contracts: { native: CONTRACT_VERSIONS, envelope: ENVELOPE_CONTRACTS, canonicalJson: CONTRACT_VERSIONS.canonicalJson },
    release: { releaseId: write.releaseId, schemaReleaseDigest: write.schemaReleaseDigest, schemaDigest: write.schemaDigest, queryCatalogDigest: release.pin?.queryCatalogDigest ?? null, ddlDigest: release.pin?.ddlDigest ?? null, workspaceFingerprint },
    skills: { bundles: skills, routingDigest: routing },
    policy: { ...ADMISSION_POLICY, policyDigest: canonicalDigest(ADMISSION_POLICY) },
    interfaces: knowledgeInterfaces(caps),
    nativeCapabilities: Object.fromEntries(Object.entries(caps).map(([k, v]) => [k, { available: v.available !== false, role: v.role ?? null }])),
    scopes: {
      read: ["schema.*", "read.typed", "read.templates", "read.cypher (only with a proven read-only principal)", "receipt.get", "verifyEffects", "serving.eligibility"],
      write: ["plan", "apply (witness required)"],
      privilegedGrants: ["adjudication.deliver", "projection.write", "report.publish", "assessment.accept"],
      admin: ["admission.revocation", "baseline.cypher (evaluation profile only)"],
    },
    limits: { maxProposalsPerIntent: 500, applyTransactionMs: 30_000, witnessLifetimeSeconds: WITNESS_MAX_LIFETIME_SECONDS, verifyEffectsPageSizeMax: 500 },
    partialPolicy: { modes: ["all", "include"], all: "refused when any proposal is held or rejected (BKS_PARTIAL_REFUSED)", include: "closed under dependencies (BKS_PARTIAL_NOT_CLOSED otherwise)" },
    receipts: {
      contract: CONTRACT_VERSIONS.ingestionReceipt,
      lookup: "GET /kg/receipt?effectKey= (scoped by installation/application/tenant)",
      outcomes: ["applied", "noop", "partial", "rejected", "failed", "duplicate", "unresolved"],
      deliveryMapping: { applied: "applied", partial: "applied", noop: "applied", duplicate: "applied", rejected: "rejected", failed: "rejected | pending (BKS_WITNESS_EXPIRED, BKS_TIMEOUT, BKS_AUTHORITY_UNAVAILABLE, BKS_EFFECT_PENDING)", unresolved: "unresolved" },
      idempotency: "same effectKey + same intent and plan digests returns the recorded receipt (duplicate); a changed payload or plan is BKS_EFFECT_CONFLICT",
      heldItems: "held proposals are recorded with their reason; verification completion with held graph admission is delivery pending, never a successful write",
    },
    consistency: { ...(described.consistency ?? {}), writer: "database-scoped writer fence (KsWriteFence.graphRevision), one transaction per effect", stale: "strict (BKS_STALE_REVISION; no implicit re-plan)", graphRevisionIsNotAKnowledgeSequence: true },
    recovery: {
      receiptLookup: true,
      atomicCrossStore: false,
      lostResponse: "unresolved; reconcile by GET /kg/receipt with the original effectKey before any repeat",
      cancellation: "client-side stop-new-work plus receipt reconciliation; the HTTP apply has no native cancellation; a committed effect stands and keeps its receipt",
      revocation: "authorization at issuance plus bounded lease (<= 60 s); KsRevocationFence refuses older witnesses once delivered; serving recheck denies revoked effects while history is retained",
    },
    custody: {
      plans: "executor file custody (runs/release-v2/plans)",
      knowledgeArtifacts: "adapter implemented (Supabase Storage, content-addressed, digest-checked); blocked: bucket knowledge-artifacts not present in the Biotech Supabase project",
    },
  };
  return { ...body, descriptorDigest: canonicalDigest(body) };
}

let loaded: Promise<ExecutorModule[]> | null = null;

export const executorModule: ExecutorModule = {
  id: "capability",
  enabled: () => true,
  capabilities: () => [{ name: "capability.descriptor", role: "reader", details: { format: CAPABILITY_FORMAT, route: "GET /capability" } }],
  http(app, ctx) {
    app.get("/capability", async (c) => {
      requireRole(c.get("principal"), "reader", "capability.descriptor");
      loaded ??= import("./loader.js").then((m) => m.loadModules());
      return c.json(buildCapabilityDescriptor(ctx, await loaded));
    });
  },
};
