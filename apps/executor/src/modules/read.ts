import { z } from "zod";
import { BksServiceError, ReadIntent, type Principal } from "@bks/contracts";
import {
  CYPHER_PARSER,
  CYPHER_READ_INTENT_V1,
  CYPHER_READ_POLICY,
  CypherReadIntentV1,
  executeReadIntent,
  FileSnapshotCustody,
  GraphClient,
  READ_INTENT_V2,
  READ_RESULT_V2,
  READ_SERVICE_VERSION,
  READ_VALUES_V1,
  READ_VISIBILITY_POLICY,
  ReadIntentV2,
  ReadModel,
  ReadService,
  PgVerificationAuthority,
  type EligibilityAuthority,
  type ReadBinding,
} from "@bks/kg-ops";
import { READ_INTENT_V3, READ_RESULT_V3, ReadIntentV3 } from "@bks/contracts";
import { requireRole } from "../auth.js";
import type { ExecutorContext } from "../context.js";
import type { ExecutorModule } from "./module.js";

/**
 * Native reads (S4): typed reads v2, governed Cypher read artifacts, EXPLAIN and the release query catalog.
 *
 *   POST /kg/read            biotech-knowledge-read-intent.v2 (typed); a biotech-knowledge-read-intent.v1 body is still
 *                            decoded and answered by the v1 executor (contract kept decodable) unless BKS_READ_V1_RETIRED=1
 *   POST /kg/read/cypher     biotech-cypher-read-intent.v1 (one statement, or a catalog template by id + statementDigest)
 *   POST /kg/read/explain    the same artifact: policy verdict + server EXPLAIN plan; nothing executes
 *   GET  /kg/catalog/templates?status=&module=&questionId=
 *
 * Bindings (database principals the reads run as) are host configuration, never part of an artifact:
 *   BKS_READ_BINDINGS = JSON [{ "ref": "public", "scope": "public"|"internal", "uriEnv": "BKS_BIOTECH_GRAPH_URI",
 *                               "userEnv": "BKS_BIOTECH_GRAPH_READER_USERNAME", "passwordEnv": "BKS_BIOTECH_GRAPH_READER_PASSWORD",
 *                               "readAuthority": "database-role"|"session-routing", "visibility": "database-rbac"|"application" }]
 *   Without it: bindings `default` (scope public) and `internal` over the executor's BKS_BIOTECH_GRAPH_* connection, with
 *   BKS_READ_AUTHORITY / BKS_READ_VISIBILITY (defaults session-routing / application: typed reads and internal-scope
 *   templates only; arbitrary Cypher is unavailable until a read-only principal is configured and proven).
 *   A binding declared `database-role` is probed once (a write attempt that must be refused, always rolled back);
 *   if the database accepts the write the binding is downgraded to session-routing.
 *
 * NOTE for the executor owner: `modules/read-v1.ts` registers POST /kg/read first (module order); set
 * BKS_DISABLE_READ_V1=1 (this module decodes v1 bodies) or apply the S4 patch that retires that route.
 */

const services = new WeakMap<ExecutorContext, { svc: ReadService; proofs: Map<string, Promise<void>> }>();
const authorities = new WeakMap<ExecutorContext, { authority: EligibilityAuthority | null }>();

/**
 * Eligibility authority of official-use reads (SV-11): BKS_BIOTECH_DB_VERIFICATION_READ_DSN (a role with SELECT on
 * knowledge_verification.use_decision / invalidation* and EXECUTE on current_revocation_epoch, e.g. the component
 * reader or outbox-worker role), else BKS_BIOTECH_DB_VERIFICATION_DSN. Not configured: official reads hold (authority_unavailable).
 */
export function eligibilityAuthorityFor(ctx: ExecutorContext): EligibilityAuthority | null {
  let entry = authorities.get(ctx);
  if (!entry) {
    entry = { authority: PgVerificationAuthority.fromEnv(ctx.env, "BKS_BIOTECH_DB_VERIFICATION_READ_DSN") ?? PgVerificationAuthority.fromEnv(ctx.env, "BKS_BIOTECH_DB_VERIFICATION_DSN") };
    authorities.set(ctx, entry);
  }
  return entry.authority;
}

function bindingsFromEnv(ctx: ExecutorContext): ReadBinding[] {
  const env = ctx.env;
  const raw = env.BKS_READ_BINDINGS?.trim();
  if (raw) {
    const list = JSON.parse(raw) as Array<{ ref: string; scope: "public" | "internal"; uriEnv?: string; userEnv?: string; passwordEnv?: string; database?: string; readAuthority?: ReadBinding["readAuthority"]; visibility?: ReadBinding["visibility"] }>;
    return list.map((b) => {
      const client = b.uriEnv ? new GraphClient({ uri: String(env[b.uriEnv] ?? ""), username: String(env[b.userEnv ?? ""] ?? ""), password: String(env[b.passwordEnv ?? ""] ?? ""), database: b.database ?? env.BKS_BIOTECH_GRAPH_DATABASE ?? "neo4j" }) : ctx.graph();
      return { ref: b.ref, scope: b.scope, client, readAuthority: b.readAuthority ?? "session-routing", visibility: b.visibility ?? "application" };
    });
  }
  const readAuthority = env.BKS_READ_AUTHORITY === "database-role" ? "database-role" : "session-routing";
  const visibility = env.BKS_READ_VISIBILITY === "database-rbac" ? "database-rbac" : "application";
  const client = ctx.graph();
  return [
    { ref: "default", scope: "public", client, readAuthority, visibility, description: "executor connection, scope public" },
    { ref: "internal", scope: "internal", client, readAuthority, visibility: "application", description: "executor connection, scope internal (grant read.internal)" },
  ];
}

/** A `database-role` binding must refuse a write; otherwise it is downgraded (never trusted by declaration alone). */
async function proveReadOnly(b: ReadBinding): Promise<void> {
  if (b.readAuthority !== "database-role") return;
  const session = b.client.session("WRITE");
  const tx = await session.beginTransaction({ timeout: 5000 });
  let refused = false;
  try {
    await tx.run("CREATE (:BksReadAuthorityProbe {at: datetime()})");
  } catch (e) {
    refused = /Security|not allowed|Permission|denied|Forbidden/i.test(String((e as { code?: string }).code ?? "") + String((e as Error).message));
  } finally {
    await tx.rollback().catch(() => undefined);
    await session.close().catch(() => undefined);
  }
  if (!refused) {
    console.warn(`[bks-read] binding ${b.ref} declared database-role but its principal accepted a write (rolled back); downgraded to session-routing: arbitrary Cypher disabled`);
    (b as { readAuthority: ReadBinding["readAuthority"] }).readAuthority = "session-routing";
  }
}

export function readServiceFor(ctx: ExecutorContext): { svc: ReadService; ready(): Promise<void> } {
  let entry = services.get(ctx);
  if (!entry) {
    const model = ReadModel.fromRelease();
    let fingerprint: string | null = null;
    try {
      fingerprint = ctx.workspace().manifest.workspaceFingerprint;
    } catch {
      fingerprint = null;
    }
    const svc = new ReadService({ model, bindings: bindingsFromEnv(ctx), snapshots: new FileSnapshotCustody(), issuer: "bks-read-service", workspaceFingerprint: fingerprint, maxConcurrent: Number(ctx.env.BKS_READ_MAX_CONCURRENT ?? 8), maxConcurrentPerPrincipal: Number(ctx.env.BKS_READ_MAX_CONCURRENT_PER_PRINCIPAL ?? 4) });
    entry = { svc, proofs: new Map() };
    services.set(ctx, entry);
  }
  const e = entry;
  return {
    svc: e.svc,
    ready: async () => {
      for (const b of e.svc.config.bindings) {
        if (!e.proofs.has(b.ref)) e.proofs.set(b.ref, proveReadOnly(b).catch(() => undefined));
        await e.proofs.get(b.ref);
      }
    },
  };
}

const toReader = (p: Principal) => ({ principalId: p.principalId, installationId: p.installationId, applicationId: p.applicationId, tenantId: p.tenantId, role: p.role, grants: p.grants });

const TemplateQuery = z.object({ status: z.enum(["supported", "held", "unsupported"]).optional(), module: z.string().max(10).optional(), questionId: z.string().max(40).optional() });

export const executorModule: ExecutorModule = {
  id: "read",
  enabled: () => true,
  capabilities: (ctx) => {
    let model: ReadModel | null = null;
    try {
      model = readServiceFor(ctx).svc.model;
    } catch {
      model = null;
    }
    const svc = model ? readServiceFor(ctx).svc : null;
    const cypherBindings = svc ? svc.config.bindings.filter((b) => b.readAuthority === "database-role").map((b) => ({ ref: b.ref, scope: b.scope, visibility: b.visibility })) : [];
    const common = { readModes: ["observed", "stable_revision"], queryCatalogDigest: model?.queryCatalogDigest ?? null, releaseId: model?.releaseId ?? null, serialization: READ_VALUES_V1, result: READ_RESULT_V2, visibilityPolicy: READ_VISIBILITY_POLICY, service: READ_SERVICE_VERSION };
    const caps: Array<{ name: string; role: "reader"; details: Record<string, unknown> }> = [
      { name: "read.typed", role: "reader", details: { contract: READ_INTENT_V2, legacyContract: "biotech-knowledge-read-intent.v1", operations: ["resolve", "card", "list", "neighbors", "assertion", "evidence", "history", "report", "association", "status"], bindings: svc ? svc.config.bindings.map((b) => ({ ref: b.ref, scope: b.scope })) : [], ...common } },
      { name: "read.official", role: "reader", details: { contract: READ_INTENT_V3, result: READ_RESULT_V3, operations: ["resolve", "card", "list", "neighbors", "assertion", "evidence", "history", "report", "association", "status", "marker"], eligibility: "use.officialUse: report / assertion / marker rows revalidated against knowledge_verification; ineligible excluded; authority unavailable holds", authorityConfigured: Boolean(ctx.env.BKS_BIOTECH_DB_VERIFICATION_READ_DSN?.trim() || ctx.env.BKS_BIOTECH_DB_VERIFICATION_DSN?.trim()) } },
      { name: "read.templates", role: "reader", details: { contract: CYPHER_READ_INTENT_V1, templates: svc ? svc.catalog.templates.filter((t) => svc.catalog.unsupportedReason(t) === null).length : 0, ...common } },
    ];
    if (cypherBindings.length) caps.push({ name: "read.cypher", role: "reader", details: { contract: CYPHER_READ_INTENT_V1, language: "CYPHER_5", policy: CYPHER_READ_POLICY, parser: CYPHER_PARSER, bindings: cypherBindings, ...common } });
    return caps;
  },
  http(app, ctx) {
    app.post("/kg/read", async (c) => {
      const principal = c.get("principal");
      requireRole(principal, "reader", "read.typed");
      const body = (await c.req.json()) as { schemaVersion?: string };
      if (body?.schemaVersion === "biotech-knowledge-read-intent.v1") {
        if (ctx.env.BKS_READ_V1_RETIRED === "1") throw new BksServiceError("BKS_UNSUPPORTED", "biotech-knowledge-read-intent.v1 is retired on this executor; send biotech-knowledge-read-intent.v2");
        return c.json(await executeReadIntent(ctx.graph(), ctx.readModel(), ReadIntent.parse(body)));
      }
      const { svc, ready } = readServiceFor(ctx);
      await ready();
      if (body?.schemaVersion === READ_INTENT_V3) return c.json(await svc.typedV3(ReadIntentV3.parse(body), toReader(principal), eligibilityAuthorityFor(ctx)));
      return c.json(await svc.typed(ReadIntentV2.parse(body), toReader(principal)));
    });
    app.post("/kg/read/cypher", async (c) => {
      const principal = c.get("principal");
      requireRole(principal, "reader", "read.cypher");
      const { svc, ready } = readServiceFor(ctx);
      await ready();
      return c.json(await svc.cypher(CypherReadIntentV1.parse(await c.req.json()), toReader(principal)));
    });
    app.post("/kg/read/explain", async (c) => {
      const principal = c.get("principal");
      requireRole(principal, "reader", "read.cypher");
      const { svc, ready } = readServiceFor(ctx);
      await ready();
      return c.json(await svc.explain(CypherReadIntentV1.parse(await c.req.json()), toReader(principal)));
    });
    app.get("/kg/catalog/templates", (c) => {
      requireRole(c.get("principal"), "reader", "read.templates");
      const { svc } = readServiceFor(ctx);
      const q = TemplateQuery.parse({ status: c.req.query("status"), module: c.req.query("module"), questionId: c.req.query("questionId") });
      const templates = svc.catalog.list(q);
      return c.json({ releaseId: svc.model.releaseId, queryCatalogDigest: svc.model.queryCatalogDigest, count: templates.length, templates });
    });
  },
  mcp(server, ctx, principal) {
    const text = (v: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(v, null, 2) }] });
    const guard = async (f: () => Promise<unknown>) => {
      try {
        return text(await f());
      } catch (e) {
        return text(e instanceof BksServiceError ? { ok: false, ...e.toJSON() } : { ok: false, code: "ERROR", message: (e as Error).message });
      }
    };
    const reader = toReader(principal);
    server.registerTool("kg_read_v2", { description: "Typed read (biotech-knowledge-read-intent.v2): resolve | card | list | neighbors | assertion | evidence | history | report | association | status. Returns biotech-knowledge-read-result.v2 (status ok|empty|truncated|failed|skipped|unsupported|stale|forbidden, digests, consistency).", inputSchema: { intent: z.record(z.string(), z.unknown()) } }, async ({ intent }) =>
      guard(async () => {
        const { svc, ready } = readServiceFor(ctx);
        await ready();
        return svc.typed(ReadIntentV2.parse(intent), reader);
      }),
    );
    server.registerTool("kg_read_v3", { description: "Typed read for an official or consequential use (biotech-knowledge-read-intent.v3): the v2 operations plus marker; with use.officialUse every report / assertion / marker row is revalidated against the Knowledge Services authority, ineligible rows are excluded and an unavailable authority holds. Returns biotech-knowledge-read-result.v3 with an eligibility block.", inputSchema: { intent: z.record(z.string(), z.unknown()) } }, async ({ intent }) =>
      guard(async () => {
        const { svc, ready } = readServiceFor(ctx);
        await ready();
        return svc.typedV3(ReadIntentV3.parse(intent), reader, eligibilityAuthorityFor(ctx));
      }),
    );
    server.registerTool("kg_read_cypher", { description: "Governed Cypher read artifact (biotech-cypher-read-intent.v1): one Cypher 5 statement with declared parameters, or a release catalog template {id, statementDigest}. Writes, procedures outside the allowlist, unlabelled patterns and whole-entity returns are refused.", inputSchema: { artifact: z.record(z.string(), z.unknown()) } }, async ({ artifact }) =>
      guard(async () => {
        const { svc, ready } = readServiceFor(ctx);
        await ready();
        return svc.cypher(CypherReadIntentV1.parse(artifact), reader);
      }),
    );
    server.registerTool("kg_read_explain", { description: "Policy verdict and server EXPLAIN plan for a biotech-cypher-read-intent.v1 artifact; executes nothing.", inputSchema: { artifact: z.record(z.string(), z.unknown()) } }, async ({ artifact }) =>
      guard(async () => {
        const { svc, ready } = readServiceFor(ctx);
        await ready();
        return svc.explain(CypherReadIntentV1.parse(artifact), reader);
      }),
    );
    server.registerTool("kg_catalog_templates", { description: "Release query catalog templates (id, questions, statement, digest, parameters, output columns, servable).", inputSchema: { status: z.enum(["supported", "held", "unsupported"]).optional(), module: z.string().optional(), questionId: z.string().optional() } }, async (q) => guard(async () => ({ queryCatalogDigest: readServiceFor(ctx).svc.model.queryCatalogDigest, templates: readServiceFor(ctx).svc.catalog.list(q) })));
  },
};
