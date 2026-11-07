/**
 * Gate C search qualification: the frozen schema-discovery tasks in lexical, semantic and hybrid modes, the paired
 * hybrid-vs-lexical comparison and the default-routing decision (IMPLEMENTATION section 3), exact round-trip checks
 * of indexed documents, and the stale-generation / outage / wrong-release / injected-hit fallback tests.
 */
import { evalSearch, median, pairedBootstrapCI, type EvalReport, type EvalTask } from "../eval.js";
import { searchWorkspace, type Workspace } from "../workspace.js";
import type { CorpusManifest } from "./corpus.js";
import type { GenerationRecord, MapEntry } from "./generation.js";
import type { SearchResult, VectorProvider } from "./provider.js";
import { createVectorStoreRetriever, type RetrieverCall } from "./vector-store-retriever.js";

export interface QualificationReport {
  format: "bks-semantic-qualification.v1";
  generationId: string;
  release: { releaseId: string; schemaReleaseDigest: string; workspaceFingerprint: string };
  modes: { lexical: Summary; semantic: Summary; hybrid: Summary };
  paired: { paraphraseRecallDelta: number; paraphraseRecallDeltaCI: [number, number]; recallDelta: number; recallDeltaCI: [number, number]; hitDelta: number; medianTokensChange: number };
  decision: { hybridDefault: boolean; rule: string; reasons: string[] };
  roundTrip: { sampled: number; found: number; top1: number; misses: string[] };
  fallback: Array<{ test: string; expected: string; observed: string; passed: boolean }>;
  usage: { searchCalls: number; cacheHits: number; rejectedHits: number; failures: Record<string, number> };
  reports: { lexical: EvalReport; semantic: EvalReport; hybrid: EvalReport };
}

interface Summary {
  recallAt10: number;
  recallAt10CI: [number, number];
  hitAt10: number;
  hitAt10CI: [number, number];
  exactIdHitRate: number;
  exactIdHitRateExactCategory: number | null;
  mrr: number;
  medianDiscoveryTokens: number;
  latencyMs?: { p50: number; p95: number; max: number };
  byCategory: EvalReport["byCategory"];
  byModule: EvalReport["byModule"];
  statuses: Record<string, number>;
}

const summary = (r: EvalReport): Summary => ({ recallAt10: r.recallAt10, recallAt10CI: r.ci.recallAt10, hitAt10: r.hitAt10, hitAt10CI: r.ci.hitAt10, exactIdHitRate: r.exactIdHitRate, exactIdHitRateExactCategory: r.exactIdHitRateExactCategory, mrr: r.mrr, medianDiscoveryTokens: r.medianDiscoveryTokens, ...(r.latencyMs ? { latencyMs: r.latencyMs } : {}), byCategory: r.byCategory, byModule: r.byModule, statuses: r.statuses });

export interface QualifyInput {
  ws: Workspace;
  tasks: EvalTask[];
  provider: VectorProvider;
  generation: { record: GenerationRecord; mapping: Record<string, MapEntry> };
  corpus: CorpusManifest;
  roundTripSample?: number;
  onCall?: (c: RetrieverCall) => void;
  log?: (s: string) => void;
}

export async function qualify(input: QualifyInput): Promise<QualificationReport> {
  const { ws, provider, generation } = input;
  const log = input.log ?? (() => undefined);
  const identity = { schemaReleaseDigest: ws.manifest.release.schemaReleaseDigest, workspaceFingerprint: ws.manifest.workspaceFingerprint };
  const cache = new Map();
  const retriever = createVectorStoreRetriever({ provider, generation, workspace: identity, cache, ...(input.onCall ? { onCall: input.onCall } : {}) });
  log("eval lexical");
  const lexical = await evalSearch(ws, { tasks: input.tasks, mode: "lexical", measure: true });
  log("eval semantic");
  const semantic = await evalSearch(ws, { tasks: input.tasks, mode: "semantic", retriever, measure: true });
  log("eval hybrid (semantic results cached per query)");
  const hybrid = await evalSearch(ws, { tasks: input.tasks, mode: "hybrid", retriever, measure: true });

  const para = (r: EvalReport) => r.perTask.filter((t) => t.category === "paraphrase" && t.gold.length).map((t) => t.recallAt10);
  const all = (r: EvalReport) => r.perTask.filter((t) => t.gold.length).map((t) => t.recallAt10);
  const paraDelta = round(mean(para(hybrid)) - mean(para(lexical)));
  const recallDelta = round(hybrid.recallAt10 - lexical.recallAt10);
  const hitDelta = round(hybrid.hitAt10 - lexical.hitAt10);
  const tokensChange = lexical.medianDiscoveryTokens ? round((hybrid.medianDiscoveryTokens - lexical.medianDiscoveryTokens) / lexical.medianDiscoveryTokens) : 0;
  const reasons: string[] = [];
  const benefit = paraDelta >= 0.05 || tokensChange <= -0.15;
  const noRegression = hybrid.recallAt10 >= lexical.recallAt10 && hybrid.hitAt10 >= lexical.hitAt10 && hybrid.exactIdHitRate >= lexical.exactIdHitRate - 1e-9;
  reasons.push(`paraphrase Recall@10 ${fmt(mean(para(lexical)))} -> ${fmt(mean(para(hybrid)))} (${paraDelta >= 0 ? "+" : ""}${(paraDelta * 100).toFixed(1)} pp; threshold +5 pp)`);
  reasons.push(`median discovery tokens ${lexical.medianDiscoveryTokens} -> ${hybrid.medianDiscoveryTokens} (${(tokensChange * 100).toFixed(1)}%; threshold -15%)`);
  reasons.push(`overall Recall@10 ${fmt(lexical.recallAt10)} -> ${fmt(hybrid.recallAt10)}, hit@10 ${fmt(lexical.hitAt10)} -> ${fmt(hybrid.hitAt10)}, exact-ID ${fmt(lexical.exactIdHitRate)} -> ${fmt(hybrid.exactIdHitRate)} (${noRegression ? "no regression" : "regression"})`);

  // ---- exact round trip: an indexed document is found again under its own card filter -------------------------
  const sampleN = input.roundTripSample ?? 20;
  const docs = input.corpus.documents;
  const step = Math.max(1, Math.floor(docs.length / sampleN));
  const sample = docs.filter((_, i) => i % step === 0).slice(0, sampleN);
  const byDoc = new Map(Object.entries(generation.mapping).map(([fileId, m]) => [m.docId, fileId]));
  let found = 0;
  let top1 = 0;
  const misses: string[] = [];
  for (const d of sample) {
    const fileId = byDoc.get(d.docId);
    let results: SearchResult[] = [];
    try {
      results = await provider.search(generation.record.storeId!, { query: `${d.cardId} ${d.headings.join(" ")}`.slice(0, 2000), maxNumResults: 20, rewriteQuery: false, ranker: "auto", scoreThreshold: 0, filters: { type: "and", filters: [{ type: "eq", key: "release_digest", value: identity.schemaReleaseDigest }, { type: "eq", key: "card_id", value: d.cardId }] } }, { timeoutMs: 10_000 });
    } catch (error) {
      misses.push(`${d.docId}: ${(error as Error).message.slice(0, 80)}`);
      continue;
    }
    input.onCall?.({ at: new Date().toISOString(), query: `roundtrip ${d.docId}`, cached: false, elapsedMs: 0, results: results.length, accepted: results.length, rejected: 0 });
    const ids = results.map((r) => r.fileId);
    const allMapped = results.every((r) => generation.mapping[r.fileId]?.cardId === d.cardId && r.attributes?.card_digest === d.cardDigest);
    if (fileId && ids.includes(fileId) && allMapped) found++;
    else misses.push(`${d.docId}: ${fileId ? (ids.includes(fileId) ? "foreign attributes in results" : "own file not returned") : "unmapped"}`);
    if (fileId && ids[0] === fileId) top1++;
  }

  // ---- fallback / stale / rejection tests ---------------------------------------------------------------------
  const fallback: QualificationReport["fallback"] = [];
  const probe = "label version per serving";
  const wrongGen = createVectorStoreRetriever({ provider, generation: { record: { ...generation.record, generationId: `${generation.record.generationId}-missing`, storeId: "vs_000000000000000000000000" }, mapping: generation.mapping }, workspace: identity, ...(input.onCall ? { onCall: input.onCall } : {}) });
  const w = await searchWorkspace(ws, { query: probe, mode: "hybrid", retriever: wrongGen });
  fallback.push({ test: "wrong generation (store id that does not exist)", expected: "hybrid degraded to lexical-only with hits", observed: `${w.status}/${w.mode}: ${w.degradation?.reason.slice(0, 120) ?? ""}; ${w.hits.length} hits`, passed: w.status === "degraded" && w.mode === "lexical-only" && w.hits.length > 0 });
  const wSem = await searchWorkspace(ws, { query: probe, mode: "semantic", retriever: wrongGen });
  fallback.push({ test: "wrong generation, semantic-only", expected: "explicit unavailable, no hits", observed: `${wSem.status}; ${wSem.hits.length} hits`, passed: wSem.status === "unavailable" && wSem.hits.length === 0 });
  const slow = createVectorStoreRetriever({ provider, generation, workspace: identity, deadlineMs: 1, ...(input.onCall ? { onCall: input.onCall } : {}) });
  const t = await searchWorkspace(ws, { query: `${probe} timeout probe`, mode: "hybrid", retriever: slow });
  fallback.push({ test: "provider timeout (1 ms deadline)", expected: "hybrid degraded to lexical-only", observed: `${t.status}/${t.mode}: ${t.degradation?.reason.slice(0, 120) ?? ""}`, passed: t.status === "degraded" && t.mode === "lexical-only" && t.hits.length > 0 });
  const wrongRelease = createVectorStoreRetriever({ provider, generation, workspace: identity, releaseFilterOverride: `sha256:${"0".repeat(64)}`, ...(input.onCall ? { onCall: input.onCall } : {}) });
  const wr = await wrongRelease.search({ query: probe, limit: 20, filters: {}, release: identity, deadlineMs: 5000 });
  fallback.push({ test: "wrong release filter", expected: "no hosted hits pass the exact release filter", observed: `${wr.status.state}; ${wr.hits.length} hits`, passed: wr.hits.length === 0 });
  const stale = createVectorStoreRetriever({ provider, generation, workspace: { ...identity, workspaceFingerprint: `sha256:${"1".repeat(64)}` } });
  const s = await searchWorkspace(ws, { query: probe, mode: "hybrid", retriever: stale });
  fallback.push({ test: "stale generation (workspace fingerprint differs)", expected: "no provider call; lexical-only", observed: `${s.status}/${s.mode}: ${s.degradation?.reason.slice(0, 120) ?? ""}`, passed: s.status === "degraded" && s.mode === "lexical-only" });
  const injecting: VectorProvider = { ...provider, search: async (id, p, o) => [{ fileId: "file-injected-unknown", filename: "x.md", score: 0.99, attributes: { card_id: "node:Product", card_digest: `sha256:${"2".repeat(64)}`, section: "node:Product#p1", release_digest: identity.schemaReleaseDigest, workspace_fingerprint: identity.workspaceFingerprint }, text: "injected" }, ...(await provider.search(id, p, o))] };
  const inj = createVectorStoreRetriever({ provider: injecting, generation, workspace: identity, ...(input.onCall ? { onCall: input.onCall } : {}) });
  const ij = await searchWorkspace(ws, { query: `${probe} injection probe`, mode: "semantic", retriever: inj });
  fallback.push({ test: "injected unknown hosted hit", expected: "rejected, never shown", observed: `${ij.status}; rejected ${ij.rejectedHostedHits ?? 0} hosted hit(s)`, passed: (ij.rejectedHostedHits ?? 0) >= 1 });

  const st = retriever.stats();
  return {
    format: "bks-semantic-qualification.v1",
    generationId: generation.record.generationId,
    release: { releaseId: ws.manifest.release.releaseId, ...identity },
    modes: { lexical: summary(lexical), semantic: summary(semantic), hybrid: summary(hybrid) },
    paired: { paraphraseRecallDelta: paraDelta, paraphraseRecallDeltaCI: pairedBootstrapCI(para(lexical), para(hybrid)), recallDelta, recallDeltaCI: pairedBootstrapCI(all(lexical), all(hybrid)), hitDelta, medianTokensChange: tokensChange },
    decision: { hybridDefault: benefit && noRegression, rule: "hybrid default iff (paraphrase Recall@10 +5 pp or median discovery tokens -15%) and no regression in Recall@10, hit@10 and exact-ID rate; else lexical default with semantic-on-demand", reasons },
    roundTrip: { sampled: sample.length, found, top1, misses },
    fallback,
    usage: { searchCalls: st.requests, cacheHits: st.cacheHits, rejectedHits: st.rejected, failures: st.failures },
    reports: { lexical, semantic, hybrid },
  };
}

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}
function round(x: number): number {
  return Math.round(x * 10000) / 10000;
}
function fmt(x: number): string {
  return x.toFixed(4);
}
export { median };
