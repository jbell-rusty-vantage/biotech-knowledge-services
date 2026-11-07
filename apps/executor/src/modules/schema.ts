import { z } from "zod";
import { BksServiceError, SliceRequest, SliceRequestV2 } from "@bks/contracts";
import { buildSlice, doctor, findCards, generationCompatibility, loadSidecars, neighbors, notConfiguredRetriever, paths, pattern, schemaContext, searchWorkspace, semanticFromEnv, type FindQuery, type SearchMode, type Workspace } from "@bks/schema-workspace";
import { requireRole } from "../auth.js";
import type { ExecutorContext } from "../context.js";
import type { ExecutorModule } from "./module.js";

/**
 * Schema workspace surfaces (bks-schema-workspace.v2; no database). Any authenticated role.
 *
 *   GET  /schema/manifest            manifest without the file inventory (inventoryCount instead)
 *   GET  /schema/search              q, mode lexical|semantic|hybrid, kind, module, domain, limit -> status / degradation
 *   GET  /schema/find                structured card filters (FindQuery)
 *   GET  /schema/neighbors/:id       direction, depth, expand, predicates
 *   GET  /schema/path                from, to, maxHops, limit, joins, via, avoid, predicates
 *   GET  /schema/pattern             question | template (query-catalog lookup; nothing is executed)
 *   GET  /schema/doctor              workspace / release health
 *   POST /schema/context             biotech-schema-context.v1 (advisory; grants no authority)
 *   GET  /schema/page/:id            one card page (maxBytes, section, field)
 *   POST /schema/slice               SliceRequestV2 (a v1 SliceRequest is still accepted)
 * MCP mirrors them as schema_* tools.
 */

const csv = (v: string | undefined): string[] | undefined => {
  const parts = (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : undefined;
};
const bool = (v: string | undefined): boolean | undefined => (v === undefined ? undefined : v === "true" || v === "1");
const int = (v: string | undefined): number | undefined => (v === undefined || v === "" ? undefined : Number(v));
function defined<T extends Record<string, unknown>>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

/** Manifest without the ~1,336-entry file inventory (the fingerprint already commits to it). */
export function manifestSummary(ws: Workspace): Record<string, unknown> {
  const { inventory, ...rest } = ws.manifest;
  return { ...rest, inventoryCount: Object.keys(inventory ?? {}).length };
}

type Binding = ReturnType<typeof semanticFromEnv>;
const bindings = new WeakMap<Workspace, Binding>();
/**
 * The semantic retriever is bound only when the advertised modes include semantic (manifest available + compatible
 * generation); otherwise searches get the not-configured retriever (semantic -> unavailable, hybrid -> degraded) and no
 * provider is ever called.
 */
function semanticBinding(ctx: ExecutorContext): Pick<Binding, "retriever"> {
  const ws = ctx.workspace();
  if (!searchModes(ctx).includes("semantic")) return { retriever: notConfiguredRetriever };
  let b = bindings.get(ws);
  if (!b) {
    b = semanticFromEnv(ws);
    bindings.set(ws, b);
  }
  return b;
}

const compat = new WeakMap<Workspace, string>();
function compatibilityState(ws: Workspace): string {
  let s = compat.get(ws);
  if (s === undefined) {
    try {
      s = generationCompatibility(ws).state;
    } catch {
      s = "unavailable";
    }
    compat.set(ws, s);
  }
  return s;
}

/**
 * Search modes this process can serve: lexical always; semantic / hybrid only when the workspace manifest says
 * `semantic.status: available` AND the bound generation is `compatible` with this workspace (S5 generationCompatibility).
 * The generation id stays in custody; it is never advertised.
 */
export function searchModes(ctx: ExecutorContext): SearchMode[] {
  const ws = ctx.workspace();
  const available = ws.manifest.semantic?.status === "available" && compatibilityState(ws) === "compatible";
  return available ? ["lexical", "semantic", "hybrid"] : ["lexical"];
}

const StrOrList = z.union([z.string(), z.array(z.string())]);
const FindInput = z.object({
  kind: StrOrList.optional(),
  module: StrOrList.optional(),
  domain: z.string().optional(),
  name: z.string().optional(),
  property: z.string().optional(),
  executorOp: z.string().optional(),
  proposalKind: z.string().optional(),
  relClass: z.string().optional(),
  temporal: z.string().optional(),
  exclusive: z.boolean().optional(),
  predicateKind: z.string().optional(),
  status: z.string().optional(),
  label: z.string().optional(),
  interface: z.string().optional(),
  identifierScheme: z.string().optional(),
  uidToken: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  question: z.string().optional(),
  capability: z.string().optional(),
  migrationKind: z.string().optional(),
  limit: z.number().int().min(1).max(500).optional(),
});
const SearchInput = z.object({
  query: z.string(),
  mode: z.enum(["lexical", "semantic", "hybrid"]).default("lexical"),
  kind: StrOrList.optional(),
  module: StrOrList.optional(),
  domain: StrOrList.optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
const NeighborsInput = z.object({ id: z.string().min(1), direction: z.enum(["out", "in", "both"]).optional(), depth: z.number().int().min(1).max(5).optional(), expand: z.boolean().optional(), predicates: z.boolean().optional() });
const PathInput = z.object({ from: z.string().min(1), to: z.string().min(1), maxHops: z.number().int().min(1).max(8).optional(), limit: z.number().int().min(1).max(50).optional(), joins: z.enum(["fill", "include", "exclude"]).optional(), via: z.array(z.string()).optional(), avoid: z.array(z.string()).optional(), predicates: z.boolean().optional() });
const PatternShape = { question: z.string().optional(), template: z.string().optional() };
const PatternInput = z.object(PatternShape).refine((v) => Boolean(v.question || v.template), "question or template is required");
const ContextInput = z.object({
  intent: z.string().max(500).optional(),
  taskIds: z.array(z.string()).optional(),
  questionIds: z.array(z.string()).optional(),
  cardIds: z.array(z.string()).optional(),
  sections: z.record(z.string(), z.array(z.string())).optional(),
  reasons: z.record(z.string(), z.string()).optional(),
  omissions: z.array(z.object({ element: z.string(), reason: z.string() })).optional(),
});

/** v2 slice requests; a v1 request (no v2-only keys) is accepted and upgraded by the renderer. */
function parseSlice(body: unknown): SliceRequest | SliceRequestV2 {
  const v1 = SliceRequest.safeParse(body);
  if (v1.success) return v1.data;
  return SliceRequestV2.parse(body);
}

function sliceOf(ctx: ExecutorContext, request: unknown) {
  const ws = ctx.workspace();
  return buildSlice(ws, ws.ir(), loadSidecars(), parseSlice(request));
}

async function search(ctx: ExecutorContext, input: z.infer<typeof SearchInput>) {
  return searchWorkspace(ctx.workspace(), { ...defined({ kind: input.kind, module: input.module, domain: input.domain, limit: input.limit }), query: input.query, mode: input.mode, retriever: semanticBinding(ctx).retriever });
}

export const executorModule: ExecutorModule = {
  id: "schema",
  enabled: () => true,
  capabilities: (ctx) => [
    { name: "schema.search", role: "reader", details: { modes: searchModes(ctx), semantic: ctx.workspace().manifest.semantic?.status ?? "not-configured", contract: "bks-schema-card.v1" } },
    { name: "schema.get", role: "reader", details: { contract: "bks-schema-workspace.v2" } },
    { name: "schema.find", role: "reader" },
    { name: "schema.neighbors", role: "reader" },
    { name: "schema.path", role: "reader" },
    { name: "schema.pattern", role: "reader" },
    { name: "schema.doctor", role: "reader" },
    { name: "schema.context", role: "reader", details: { contract: "biotech-schema-context.v1", advisory: true } },
    { name: "schema.slice", role: "reader", details: { contracts: ["bks-schema-slice.v2", "bks-schema-workspace-slice-request.v1 (accepted)"] } },
  ],
  http(app, ctx) {
    app.get("/schema/manifest", (c) => {
      requireRole(c.get("principal"), "reader", "schema.get");
      return c.json(manifestSummary(ctx.workspace()));
    });
    app.get("/schema/search", async (c) => {
      requireRole(c.get("principal"), "reader", "schema.search");
      const q = c.req.query();
      const input = SearchInput.parse(defined({ query: q.q ?? q.query ?? "", mode: q.mode, kind: csv(q.kind), module: csv(q.module), domain: csv(q.domain), limit: int(q.limit) }));
      return c.json(await search(ctx, input));
    });
    app.get("/schema/find", (c) => {
      requireRole(c.get("principal"), "reader", "schema.get");
      const q = c.req.query();
      const input = FindInput.parse(defined({ ...q, kind: csv(q.kind), module: csv(q.module), exclusive: bool(q.exclusive), limit: int(q.limit) }));
      return c.json(findCards(ctx.workspace(), input as FindQuery));
    });
    app.get("/schema/neighbors/:id", (c) => {
      requireRole(c.get("principal"), "reader", "schema.get");
      const q = c.req.query();
      const { id, ...opts } = NeighborsInput.parse(defined({ id: c.req.param("id"), direction: q.direction, depth: int(q.depth), expand: bool(q.expand), predicates: bool(q.predicates) }));
      return c.json(neighbors(ctx.workspace(), id, opts));
    });
    app.get("/schema/path", (c) => {
      requireRole(c.get("principal"), "reader", "schema.get");
      const q = c.req.query();
      const { from, to, ...opts } = PathInput.parse(defined({ from: q.from, to: q.to, maxHops: int(q.maxHops), limit: int(q.limit), joins: q.joins, via: csv(q.via), avoid: csv(q.avoid), predicates: bool(q.predicates) }));
      return c.json(paths(ctx.workspace(), from, to, opts));
    });
    app.get("/schema/pattern", (c) => {
      requireRole(c.get("principal"), "reader", "schema.get");
      const q = c.req.query();
      return c.json(pattern(ctx.workspace(), PatternInput.parse(defined({ question: q.question, template: q.template }))));
    });
    app.get("/schema/doctor", async (c) => {
      requireRole(c.get("principal"), "reader", "schema.get");
      return c.json(await doctor(ctx.workspace().dir, { retriever: semanticBinding(ctx).retriever }));
    });
    app.post("/schema/context", async (c) => {
      requireRole(c.get("principal"), "reader", "schema.get");
      return c.json(schemaContext(ctx.workspace(), ContextInput.parse(await c.req.json())));
    });
    app.get("/schema/page/:id", (c) => {
      requireRole(c.get("principal"), "reader", "schema.get");
      const q = c.req.query();
      return c.json(ctx.workspace().page(c.req.param("id"), defined({ maxBytes: int(q.maxBytes) ?? 24_000, section: q.section, field: q.field })));
    });
    app.post("/schema/slice", async (c) => {
      requireRole(c.get("principal"), "reader", "schema.slice");
      const { pages, ...meta } = sliceOf(ctx, await c.req.json());
      return c.json({ ...meta, pages: Object.fromEntries(pages) });
    });
  },
  mcp(server, ctx) {
    const text = (v: unknown) => ({ content: [{ type: "text" as const, text: typeof v === "string" ? v : JSON.stringify(v, null, 2) }] });
    const guarded = async (fn: () => unknown) => {
      try {
        return text(await fn());
      } catch (e) {
        const err = e as Error & { code?: string; bksCode?: string; details?: unknown };
        const code = e instanceof BksServiceError ? e.code : (err.bksCode ?? err.code ?? "ERROR");
        return text({ ok: false, code, message: err.message, ...(err.details ? { details: err.details } : {}) });
      }
    };
    server.registerTool("schema_manifest", { description: "Release identities, workspace fingerprint, counts, layers, modules, domains, limits and semantic status of the pinned schema workspace (the file inventory is summarized as inventoryCount).", inputSchema: {} }, async () => guarded(() => manifestSummary(ctx.workspace())));
    server.registerTool(
      "schema_search",
      {
        description: `Ranked schema search over workspace cards (nodes, relationships, predicates, vocabularies, modules, domains, tasks, patterns, questions, terms); filter by kind / module / domain. Start here, then open cards with schema_get, follow schema_neighbors / schema_path, or narrow with schema_find. Modes served: ${searchModes(ctx).join(", ")}; a semantic or hybrid request without a configured retriever returns status unavailable (semantic) or degraded with a lexical-only fallback (hybrid).`,
        inputSchema: SearchInput.shape,
      },
      async (input) => guarded(() => search(ctx, SearchInput.parse(input))),
    );
    server.registerTool("schema_find", { description: "Structured card filters: kind, module, domain, name, property, executorOp, proposalKind, relClass, temporal, exclusive, predicateKind, status, label, interface, identifierScheme, uidToken, from, to, question, capability, migrationKind.", inputSchema: FindInput.shape }, async (input) => guarded(() => findCards(ctx.workspace(), FindInput.parse(input) as FindQuery)));
    server.registerTool("schema_neighbors", { description: "Typed relationship and predicate-join neighbors of a node card id (node:<Type>) within a bounded depth.", inputSchema: NeighborsInput.shape }, async (input) =>
      guarded(() => {
        const { id, ...opts } = NeighborsInput.parse(input);
        return neighbors(ctx.workspace(), id, opts);
      }),
    );
    server.registerTool("schema_path", { description: "Legal schema paths between two node types (bounded hops; typed edges before predicate joins).", inputSchema: PathInput.shape }, async (input) =>
      guarded(() => {
        const { from, to, ...opts } = PathInput.parse(input);
        return paths(ctx.workspace(), from, to, opts);
      }),
    );
    server.registerTool("schema_pattern", { description: "Query-catalog lookup for a competency question or template id (status, templates, parameters); nothing is executed.", inputSchema: PatternShape }, async (input) => guarded(() => pattern(ctx.workspace(), PatternInput.parse(input))));
    server.registerTool("schema_doctor", { description: "Workspace and release health: format, fingerprint, pinned release agreement, card digests, semantic status.", inputSchema: {} }, async () => guarded(() => doctor(ctx.workspace().dir, { retriever: semanticBinding(ctx).retriever })));
    server.registerTool("schema_context", { description: "Advisory biotech-schema-context.v1 for an intent, tasks, questions or card ids (identity, predicate routes, temporal rules, read operations, proposal kinds). Grants no authority.", inputSchema: ContextInput.shape }, async (input) => guarded(() => schemaContext(ctx.workspace(), ContextInput.parse(input))));
    server.registerTool(
      "schema_get",
      { description: "One workspace card by id (node:<Type>, rel:<TYPE>, pred:<NAME>, mod:<id>, dom:<slug>, enum:<Enum>, ...) or path; section / field narrow it.", inputSchema: { id: z.string(), maxBytes: z.number().int().min(1000).max(512_000).default(24_000), section: z.string().optional(), field: z.string().optional() } },
      async ({ id, maxBytes, section, field }) => guarded(() => ctx.workspace().page(id, defined({ maxBytes, section, field }))),
    );
    server.registerTool("schema_slice", { description: "Budgeted schema bundle (bks-schema-slice.v2) for the selected types, modules, domains, tasks, questions or predicates, with combined SDL; a v1 slice request is accepted.", inputSchema: SliceRequestV2.partial().shape }, async (request) =>
      guarded(() => {
        const { pages, combinedSdl, ...meta } = sliceOf(ctx, request);
        return { ...meta, pageCount: pages.size, combinedSdl: combinedSdl.length > 60_000 ? `${combinedSdl.slice(0, 60_000)}\n# [truncated]` : combinedSdl };
      }),
    );
  },
};
