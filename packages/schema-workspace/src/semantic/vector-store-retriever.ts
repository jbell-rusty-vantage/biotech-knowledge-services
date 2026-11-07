/**
 * SemanticRetriever over one bound, ready generation (SPECIFICATION 4.2 step 4-7).
 *
 * - Direct Vector Store search with an exact release filter (`release_digest` eq the workspace's release, plus
 *   optional `kind` / `module` `in` filters), `max_num_results` 20, `rewrite_query` false, logged ranker and score
 *   threshold, a hard deadline (default 5 s, no SDK retries inside it) and a 2,000-character query limit.
 * - Every returned file id must be in the generation's local mapping and its attributes must equal the mapped ones
 *   (card id, card digest, section, release, workspace); otherwise the hit is rejected. searchWorkspace then checks
 *   the card digest against the local workspace and rehydrates local cards.
 * - Request and spend ceilings; an in-memory cache keyed by generation, normalized query, filters and ranking config.
 * - Every provider failure becomes an explicit `unavailable` status with a reason (timeout, quota, not-found ...);
 *   the caller degrades to lexical-only (hybrid) or reports `unavailable` (semantic-only).
 */
import { normalizeTerm } from "../search.js";
import type { SemanticHit, SemanticResult, SemanticRetriever, SemanticSearchRequest, SemanticStatus } from "./retriever.js";
import { classifyProviderError, type Filter, type SearchParams, type VectorProvider } from "./provider.js";
import { SEARCH_CONFIG, type GenerationRecord, type MapEntry } from "./generation.js";

export interface RetrieverCall {
  at: string;
  query: string;
  cached: boolean;
  elapsedMs: number;
  results: number;
  accepted: number;
  rejected: number;
  failure?: string;
}

export interface VectorStoreRetrieverOptions {
  provider: VectorProvider;
  generation: { record: GenerationRecord; mapping: Record<string, MapEntry> };
  /** Identity of the workspace the caller serves; a different release or fingerprint makes the generation stale. */
  workspace: { schemaReleaseDigest: string; workspaceFingerprint: string };
  deadlineMs?: number;
  maxQueryChars?: number;
  maxRequests?: number;
  maxSpendUsd?: number;
  costPerSearchUsd?: number;
  ranker?: SearchParams["ranker"];
  scoreThreshold?: number;
  /** Override the release filter (tests: prove that a wrong release filter returns nothing usable). */
  releaseFilterOverride?: string;
  onCall?: (call: RetrieverCall) => void;
  cache?: Map<string, SemanticResult>;
}

export interface VectorStoreRetriever extends SemanticRetriever {
  stats(): { requests: number; cacheHits: number; rejected: number; failures: Record<string, number> };
  config(): Record<string, unknown>;
}

export function createVectorStoreRetriever(o: VectorStoreRetrieverOptions): VectorStoreRetriever {
  const deadlineMs = o.deadlineMs ?? SEARCH_CONFIG.deadlineMs;
  const maxQueryChars = o.maxQueryChars ?? SEARCH_CONFIG.maxQueryChars;
  const ranker = o.ranker ?? SEARCH_CONFIG.ranker;
  const scoreThreshold = o.scoreThreshold ?? SEARCH_CONFIG.scoreThreshold;
  const cache = o.cache ?? new Map<string, SemanticResult>();
  const rec = o.generation.record;
  let requests = 0;
  let cacheHits = 0;
  let rejectedTotal = 0;
  const failures: Record<string, number> = {};
  const base = { generationId: rec.generationId };
  const staticStatus = (): SemanticStatus => {
    if (rec.status !== "ready") return { state: "unavailable", ...base, reason: `generation ${rec.generationId} is ${rec.status}; partial or inactive generations are not served` };
    if (!rec.storeId) return { state: "unavailable", ...base, reason: "generation has no store" };
    if (rec.schemaReleaseDigest !== o.workspace.schemaReleaseDigest) return { state: "unavailable", ...base, reason: `stale generation: built for release ${rec.schemaReleaseDigest}, workspace serves ${o.workspace.schemaReleaseDigest}` };
    if (rec.workspaceFingerprint !== o.workspace.workspaceFingerprint) return { state: "unavailable", ...base, reason: `stale generation: built for workspace ${rec.workspaceFingerprint}, workspace is ${o.workspace.workspaceFingerprint}` };
    return { state: "available", ...base };
  };
  const config = () => ({ provider: o.provider.id, generationId: rec.generationId, maxNumResults: SEARCH_CONFIG.maxNumResults, rewriteQuery: SEARCH_CONFIG.rewriteQuery, ranker, scoreThreshold, deadlineMs, maxQueryChars, maxRequests: o.maxRequests ?? null, maxSpendUsd: o.maxSpendUsd ?? null, releaseFilter: o.releaseFilterOverride ?? o.workspace.schemaReleaseDigest });
  return {
    id: `openai-vector-store:${rec.generationId}`,
    async status() {
      return staticStatus();
    },
    config,
    stats: () => ({ requests, cacheHits, rejected: rejectedTotal, failures: { ...failures } }),
    async search(req: SemanticSearchRequest): Promise<SemanticResult> {
      const st = staticStatus();
      if (st.state !== "available") return { status: st, hits: [] };
      if (req.query.length > maxQueryChars) return { status: { state: "unavailable", ...base, reason: `query longer than ${maxQueryChars} characters` }, hits: [] };
      const filters: Filter[] = [{ type: "eq", key: "release_digest", value: o.releaseFilterOverride ?? req.release.schemaReleaseDigest }];
      if (req.filters.kind?.length) filters.push({ type: "in", key: "kind", value: req.filters.kind.map((k) => (k === "rel" ? "relationship" : k === "pred" ? "predicate" : k)) });
      if (req.filters.module?.length) filters.push({ type: "in", key: "module", value: req.filters.module });
      const params: SearchParams = { query: req.query, maxNumResults: Math.min(Math.max(req.limit, 1), SEARCH_CONFIG.maxNumResults), rewriteQuery: SEARCH_CONFIG.rewriteQuery, filters: filters.length === 1 ? filters[0] : { type: "and", filters }, ranker, scoreThreshold };
      const key = JSON.stringify([rec.generationId, normalizeTerm(req.query), params.filters, params.maxNumResults, ranker, scoreThreshold]);
      const hit = cache.get(key);
      const started = Date.now();
      if (hit) {
        cacheHits++;
        o.onCall?.({ at: new Date().toISOString(), query: req.query, cached: true, elapsedMs: 0, results: hit.hits.length, accepted: hit.hits.length, rejected: hit.rejected ?? 0 });
        return hit;
      }
      if (o.maxRequests !== undefined && requests >= o.maxRequests) return { status: { state: "unavailable", ...base, reason: `semantic request ceiling reached (${o.maxRequests})` }, hits: [] };
      if (o.maxSpendUsd !== undefined && o.costPerSearchUsd !== undefined && (requests + 1) * o.costPerSearchUsd > o.maxSpendUsd) return { status: { state: "unavailable", ...base, reason: `semantic spend ceiling reached (${o.maxSpendUsd} USD)` }, hits: [] };
      requests++;
      try {
        const results = await o.provider.search(rec.storeId!, params, { timeoutMs: Math.min(deadlineMs, req.deadlineMs || deadlineMs) });
        const hits: SemanticHit[] = [];
        let rejected = 0;
        for (const r of results) {
          const m = o.generation.mapping[r.fileId];
          const a = r.attributes ?? {};
          if (!m || a.card_id !== m.cardId || a.card_digest !== m.cardDigest || a.section !== m.docId || a.release_digest !== rec.schemaReleaseDigest || a.workspace_fingerprint !== rec.workspaceFingerprint) {
            rejected++;
            continue;
          }
          hits.push({ cardId: m.cardId, cardDigest: String(a.card_digest), sectionId: m.docId, score: r.score, schemaReleaseDigest: String(a.release_digest), workspaceFingerprint: String(a.workspace_fingerprint), fileId: r.fileId });
        }
        rejectedTotal += rejected;
        const out: SemanticResult = { status: { state: "available", ...base }, hits, rejected };
        cache.set(key, out);
        o.onCall?.({ at: new Date().toISOString(), query: req.query, cached: false, elapsedMs: Date.now() - started, results: results.length, accepted: hits.length, rejected });
        return out;
      } catch (error) {
        const e = classifyProviderError(error);
        failures[e.failure] = (failures[e.failure] ?? 0) + 1;
        o.onCall?.({ at: new Date().toISOString(), query: req.query, cached: false, elapsedMs: Date.now() - started, results: 0, accepted: 0, rejected: 0, failure: e.failure });
        return { status: { state: "unavailable", ...base, reason: `${e.failure}: ${e.message.slice(0, 200)}` }, hits: [] };
      }
    },
  };
}
