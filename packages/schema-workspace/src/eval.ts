/**
 * Deterministic schema-discovery retrieval evaluation (`bks-schema eval --tasks <file> --mode lexical --json`).
 *
 * Input: a frozen task file (evals/v2/schema-discovery/tasks.json format `{tasks: [{id, prompt, category, module}]}`,
 * a bare array, or JSONL) and gold card ids (`--gold <file>`, default the sibling gold.json `{gold: {<id>: {cardIds}}}`;
 * or `gold` / `goldCardIds` on each task). Gold ids are normalized to workspace ids (`relationship:` -> `rel:`,
 * `predicate:` -> `pred:`). The query is the task prompt with the release-binding preamble removed.
 *
 * Metrics (per task, then averaged over tasks with gold):
 *   recallAt10   |gold ∩ top-10 card hits| / |gold|
 *   hitAt10      1 when any gold card is in the top 10 (the protocol's "gold card in the top 10 hits")
 *   exactIdHit   1 when the top-1 card hit is a gold card (reported overall and for category `exact`)
 *   mrr          1 / rank of the first gold card (0 when absent from the top 10)
 * Hits are cards only: lookup rows (old v1 aliases, terms, questions) are dropped after their targets are expanded.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { LOOKUP_KINDS } from "./schema-contracts.js";
import type { SemanticRetriever } from "./semantic/retriever.js";
import { searchWorkspace, STRUCTURED_EXPANSION, type SearchMode, type Workspace } from "./workspace.js";

/** Discovery modes: plain search modes, or structured discovery (search + bounded path expansion). */
export type EvalMode = SearchMode | "structured" | "structured-hybrid";

export interface EvalTask {
  id: string;
  prompt: string;
  category?: string;
  module?: string;
  gold: string[];
}

export interface EvalTaskResult {
  id: string;
  category?: string;
  module?: string;
  query: string;
  gold: string[];
  top: string[];
  recallAt10: number;
  hitAt10: number;
  exactIdHit: number;
  firstGoldRank: number | null;
  /** Estimated tokens an agent reads before the first gold hit (all top-k snippets when none): ceil(bytes / 4). */
  discoveryTokens: number;
  /** Structured modes: candidates contributed by path expansion. */
  fromPath?: number;
  baseLimitUsed?: number | null;
  pathIntent?: string;
  elapsedMs?: number;
  degradation?: string;
  status: string;
}

export interface EvalReport {
  format: "bks-schema-eval.v1";
  mode: EvalMode;
  /** Structured modes: the configured base limit (`adaptive` unless overridden); null for plain search modes. */
  baseLimit: number | "adaptive" | null;
  k: number;
  release: { releaseId: string; schemaReleaseDigest: string; workspaceFingerprint: string };
  tasksFile?: string;
  goldFile?: string;
  tasks: number;
  scored: number;
  recallAt10: number;
  hitAt10: number;
  exactIdHitRate: number;
  exactIdHitRateExactCategory: number | null;
  mrr: number;
  medianDiscoveryTokens: number;
  ci: { recallAt10: [number, number]; hitAt10: [number, number]; paraphraseRecallAt10: [number, number] | null; method: string };
  latencyMs?: { p50: number; p95: number; max: number };
  byCategory: Record<string, { tasks: number; recallAt10: number; hitAt10: number; exactIdHitRate: number }>;
  byModule: Record<string, { tasks: number; recallAt10: number; hitAt10: number }>;
  statuses: Record<string, number>;
  perTask: EvalTaskResult[];
  definitions: Record<string, string>;
}

const PREFIX: Record<string, string> = { relationship: "rel", predicate: "pred", node: "node", enum: "enum", interface: "iface", union: "union", edge: "edge", module: "mod", domain: "dom", task: "task", assessment: "asmt" };

export function normalizeGoldId(id: string): string {
  const i = id.indexOf(":");
  if (i < 0) return id;
  const p = id.slice(0, i);
  return `${PREFIX[p] ?? p}:${id.slice(i + 1)}`;
}

/** Removes the release-binding preamble and unbound `${...}` placeholders from a frozen prompt. */
export function queryOfPrompt(prompt: string): string {
  return prompt
    .replace(/^Release under test:[\s\S]*?card id\.\s*/i, "")
    .replace(/\$\{[A-Z_]+\}/g, "")
    .trim();
}

export function loadEvalTasks(tasksFile: string, goldFile?: string): { tasks: EvalTask[]; goldFile?: string } {
  const path = resolve(tasksFile);
  const text = readFileSync(path, "utf8");
  let raw: unknown[];
  if (path.endsWith(".jsonl")) raw = text.split("\n").filter(Boolean).map((l) => JSON.parse(l));
  else {
    const j = JSON.parse(text) as unknown;
    raw = Array.isArray(j) ? j : ((j as { tasks?: unknown[] }).tasks ?? []);
  }
  const gPath = goldFile ? resolve(goldFile) : existsSync(join(dirname(path), "gold.json")) ? join(dirname(path), "gold.json") : undefined;
  const gold = gPath ? ((JSON.parse(readFileSync(gPath, "utf8")) as { gold?: Record<string, { cardIds?: string[] }> }).gold ?? {}) : {};
  const tasks = raw.map((t) => {
    const x = t as { id: string; prompt?: string; query?: string; question?: string; category?: string; module?: string; gold?: string[]; goldCardIds?: string[] };
    const g = x.gold ?? x.goldCardIds ?? gold[x.id]?.cardIds ?? [];
    return { id: x.id, prompt: x.prompt ?? x.query ?? x.question ?? "", ...(x.category ? { category: x.category } : {}), ...(x.module ? { module: x.module } : {}), gold: g.map(normalizeGoldId) };
  });
  return { tasks, ...(gPath ? { goldFile: gPath } : {}) };
}

export async function evalSearch(ws: Workspace, input: { tasks: EvalTask[]; mode?: EvalMode; k?: number; retriever?: SemanticRetriever; tasksFile?: string; goldFile?: string; measure?: boolean; baseLimit?: number }): Promise<EvalReport> {
  const k = input.k ?? 10;
  const mode = input.mode ?? "lexical";
  const perTask: EvalTaskResult[] = [];
  for (const t of input.tasks) {
    const query = queryOfPrompt(t.prompt).slice(0, ws.manifest.limits.search.maxQueryChars);
    const started = Date.now();
    const structured = mode === "structured" || mode === "structured-hybrid";
    const baseMode: SearchMode = mode === "structured" ? "lexical" : mode === "structured-hybrid" ? "hybrid" : mode;
    const res = await searchWorkspace(ws, { query, mode: baseMode, limit: structured ? 10 : ws.manifest.limits.search.maxLimit, ...(structured ? { expand: "paths" as const, ...(input.baseLimit !== undefined ? { baseLimit: input.baseLimit } : {}) } : {}), ...(input.retriever ? { retriever: input.retriever } : {}) });
    const elapsedMs = Date.now() - started;
    const cardHits = res.hits.filter((h) => !LOOKUP_KINDS.includes(h.kind)).filter((h, i, a) => a.findIndex((x) => x.id === h.id) === i).slice(0, k);
    const top = cardHits.map((h) => h.id);
    const goldSet = new Set(t.gold);
    const found = top.filter((id) => goldSet.has(id)).length;
    const first = top.findIndex((id) => goldSet.has(id));
    perTask.push({
      id: t.id,
      ...(t.category ? { category: t.category } : {}),
      ...(t.module ? { module: t.module } : {}),
      query,
      gold: t.gold,
      top,
      recallAt10: t.gold.length ? found / t.gold.length : 0,
      hitAt10: found > 0 ? 1 : 0,
      exactIdHit: top[0] !== undefined && goldSet.has(top[0]) ? 1 : 0,
      firstGoldRank: first >= 0 ? first + 1 : null,
      status: res.status,
      discoveryTokens: discoveryTokensOf(cardHits, new Set(t.gold)),
      ...(res.route ? { fromPath: res.route.filter((r) => r.source !== "search").length, baseLimitUsed: res.expansion?.baseLimit ?? null, pathIntent: res.expansion?.pathIntent ?? "none" } : {}),
      ...(input.measure ? { elapsedMs } : {}),
      ...(res.degradation ? { degradation: res.degradation.reason.slice(0, 160) } : {}),
    });
  }
  const scored = perTask.filter((r) => r.gold.length);
  const mean = (xs: number[]) => (xs.length ? round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);
  const group = <K extends "category" | "module">(key: K) => {
    const out: Record<string, EvalTaskResult[]> = {};
    for (const r of scored) (out[r[key] ?? "(none)"] ??= []).push(r);
    return out;
  };
  const exact = scored.filter((r) => r.category === "exact");
  const statuses: Record<string, number> = {};
  for (const r of perTask) statuses[r.status] = (statuses[r.status] ?? 0) + 1;
  return {
    format: "bks-schema-eval.v1",
    mode,
    baseLimit: mode === "structured" || mode === "structured-hybrid" ? (input.baseLimit !== undefined ? Math.min(Math.max(input.baseLimit, 1), STRUCTURED_EXPANSION.candidates) : "adaptive") : null,
    k,
    release: { releaseId: ws.manifest.release.releaseId, schemaReleaseDigest: ws.manifest.release.schemaReleaseDigest, workspaceFingerprint: ws.manifest.workspaceFingerprint },
    ...(input.tasksFile ? { tasksFile: input.tasksFile } : {}),
    ...(input.goldFile ? { goldFile: input.goldFile } : {}),
    tasks: perTask.length,
    scored: scored.length,
    recallAt10: mean(scored.map((r) => r.recallAt10)),
    hitAt10: mean(scored.map((r) => r.hitAt10)),
    exactIdHitRate: mean(scored.map((r) => r.exactIdHit)),
    exactIdHitRateExactCategory: exact.length ? mean(exact.map((r) => r.exactIdHit)) : null,
    mrr: mean(scored.map((r) => (r.firstGoldRank ? 1 / r.firstGoldRank : 0))),
    medianDiscoveryTokens: median(scored.map((r) => r.discoveryTokens)),
    ci: {
      recallAt10: bootstrapCI(scored.map((r) => r.recallAt10)),
      hitAt10: bootstrapCI(scored.map((r) => r.hitAt10)),
      paraphraseRecallAt10: scored.some((r) => r.category === "paraphrase") ? bootstrapCI(scored.filter((r) => r.category === "paraphrase").map((r) => r.recallAt10)) : null,
      method: "percentile bootstrap, 10,000 resamples, seed 20261011",
    },
    ...(input.measure ? { latencyMs: latency(perTask.map((r) => r.elapsedMs ?? 0)) } : {}),
    byCategory: Object.fromEntries(Object.entries(group("category")).sort(([a], [b]) => (a < b ? -1 : 1)).map(([c, rs]) => [c, { tasks: rs.length, recallAt10: mean(rs.map((r) => r.recallAt10)), hitAt10: mean(rs.map((r) => r.hitAt10)), exactIdHitRate: mean(rs.map((r) => r.exactIdHit)) }])),
    byModule: Object.fromEntries(Object.entries(group("module")).sort(([a], [b]) => (a < b ? -1 : 1)).map(([m, rs]) => [m, { tasks: rs.length, recallAt10: mean(rs.map((r) => r.recallAt10)), hitAt10: mean(rs.map((r) => r.hitAt10)) }])),
    statuses,
    perTask,
    definitions: {
      recallAt10: "mean over tasks with gold of |gold ∩ top-10 card hits| / |gold|",
      hitAt10: "mean over tasks with gold of [any gold card in the top 10]",
      exactIdHitRate: "mean over tasks with gold of [top-1 card hit is a gold card]",
      mrr: "mean of 1/rank of the first gold card within the top 10 (0 when absent)",
      query: "task prompt with the 'Release under test: ... card id.' preamble removed",
      discoveryTokens: "ceil(bytes of id + path + summary of the card hits up to and including the first gold hit, or all top-k hits when none is gold, / 4)",
      hits: "cards only; lookup rows (aliases, terms, questions) are dropped after their targets are expanded",
    },
  };
}

function round(x: number): number {
  return Math.round(x * 10000) / 10000;
}

function discoveryTokensOf(hits: Array<{ id: string; path: string; summary: string }>, gold: Set<string>): number {
  let bytes = 0;
  for (const h of hits) {
    bytes += Buffer.byteLength(`${h.id} ${h.path} ${h.summary}`, "utf8");
    if (gold.has(h.id)) break;
  }
  return Math.ceil(bytes / 4);
}

export function median(xs: number[]): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

function latency(xs: number[]): { p50: number; p95: number; max: number } {
  const s = [...xs].sort((a, b) => a - b);
  const q = (p: number) => s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)] ?? 0;
  return { p50: q(0.5), p95: q(0.95), max: s[s.length - 1] ?? 0 };
}

/** Seeded PRNG (mulberry32) so bootstrap intervals are reproducible. */
export function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Percentile bootstrap 95% CI of the mean (10,000 resamples, seed 20261011). */
export function bootstrapCI(xs: number[], resamples = 10_000, seed = 20261011): [number, number] {
  if (!xs.length) return [0, 0];
  const rnd = prng(seed);
  const means: number[] = [];
  for (let i = 0; i < resamples; i++) {
    let sum = 0;
    for (let j = 0; j < xs.length; j++) sum += xs[Math.floor(rnd() * xs.length)]!;
    means.push(sum / xs.length);
  }
  means.sort((a, b) => a - b);
  return [round(means[Math.floor(0.025 * resamples)]!), round(means[Math.ceil(0.975 * resamples) - 1]!)];
}

/** Paired bootstrap 95% CI of mean(b - a) over the same tasks. */
export function pairedBootstrapCI(a: number[], b: number[], resamples = 10_000, seed = 20261011): [number, number] {
  return bootstrapCI(a.map((x, i) => (b[i] ?? 0) - x), resamples, seed);
}
