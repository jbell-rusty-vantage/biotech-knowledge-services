/**
 * Configuration of semantic search from the server-side environment, and the offline generation-compatibility
 * check used by `doctor`. Environment names (values never printed):
 *
 *   OPENAI_API_KEY                server-side key (never exposed to sandbox agents)
 *   BKS_SEMANTIC_ENABLED          "true" to enable semantic / hybrid search (default false)
 *   BKS_SEMANTIC_CUSTODY_DIR      generation custody directory (default runs/release-v2/custody/semantic)
 *   BKS_SEMANTIC_GENERATION       generation id to bind (default: current.json pointer)
 *   BKS_SEMANTIC_DEADLINE_MS      hosted search deadline (default 5000)
 *   BKS_SEMANTIC_MAX_REQUESTS     per-process hosted request ceiling (default 600)
 *   BKS_SEMANTIC_MAX_SPEND_USD    optional spend ceiling, enforced with BKS_SEMANTIC_COST_PER_SEARCH_USD
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { exportCorpus, type CorpusManifest } from "./corpus.js";
import { readSetting, SEMANTIC_ENV } from "./env.js";
import { defaultCustodyDir, readGeneration, readPointer } from "./generation.js";
import { openAIProvider, type VectorProvider } from "./provider.js";
import { notConfiguredRetriever, type SemanticRetriever, type SemanticStatus } from "./retriever.js";
import { createVectorStoreRetriever, type RetrieverCall } from "./vector-store-retriever.js";
import type { Workspace } from "../workspace.js";

export interface SemanticBinding {
  retriever: SemanticRetriever;
  status: SemanticStatus;
  generationId: string | null;
  custodyDir: string;
}

export function semanticFromEnv(ws: Workspace, opts: { provider?: VectorProvider; force?: boolean; onCall?: (c: RetrieverCall) => void; generationId?: string } = {}): SemanticBinding {
  const custodyDir = readSetting(SEMANTIC_ENV.custodyDir, { dotenv: false }) ?? defaultCustodyDir();
  const enabled = opts.force || (readSetting(SEMANTIC_ENV.enabled) ?? "false").toLowerCase() === "true";
  const off = (reason: string, state: SemanticStatus["state"] = "not-configured"): SemanticBinding => {
    const status: SemanticStatus = { state, generationId: null, reason };
    return { retriever: { id: "none", status: async () => status, search: async () => ({ status, hits: [] }) }, status, generationId: null, custodyDir };
  };
  if (!enabled) return { ...off("semantic search disabled (set BKS_SEMANTIC_ENABLED=true and bind a generation)"), retriever: notConfiguredRetriever };
  const generationId = opts.generationId ?? readSetting(SEMANTIC_ENV.generation, { dotenv: false }) ?? readPointer(custodyDir)?.generationId;
  if (!generationId) return off("no semantic generation is published (current.json missing)");
  const generation = readGeneration(generationId, custodyDir);
  if (!generation) return off(`semantic generation ${generationId} is not in custody`, "unavailable");
  let provider = opts.provider;
  if (!provider) {
    const key = readSetting(SEMANTIC_ENV.apiKey);
    if (!key) return off("no server-side provider credentials configured", "unavailable");
    provider = openAIProvider(key);
  }
  const num = (name: string) => {
    const v = readSetting(name, { dotenv: false });
    return v === undefined ? undefined : Number(v);
  };
  const retriever = createVectorStoreRetriever({
    provider,
    generation,
    workspace: { schemaReleaseDigest: ws.manifest.release.schemaReleaseDigest, workspaceFingerprint: ws.manifest.workspaceFingerprint },
    ...(num(SEMANTIC_ENV.deadlineMs) !== undefined ? { deadlineMs: num(SEMANTIC_ENV.deadlineMs)! } : {}),
    maxRequests: num(SEMANTIC_ENV.maxRequests) ?? 600,
    ...(num(SEMANTIC_ENV.maxSpendUsd) !== undefined ? { maxSpendUsd: num(SEMANTIC_ENV.maxSpendUsd)! } : {}),
    ...(num(SEMANTIC_ENV.costPerSearchUsd) !== undefined ? { costPerSearchUsd: num(SEMANTIC_ENV.costPerSearchUsd)! } : {}),
    ...(opts.onCall ? { onCall: opts.onCall } : {}),
  });
  return { retriever, status: { state: "available", generationId }, generationId, custodyDir };
}

export interface GenerationCompatibility {
  /**
   * compatible: same release, same workspace fingerprint, every document byte-identical.
   * refreshable: every document byte-identical but attributes differ (workspace fingerprint, release digest, card
   *   digests); `semantic refresh`
   *   reuses all uploaded files (attribute-only, zero uploads). Hosted hits are rejected until then.
   * stale: document bytes differ (cards changed) or the release differs; refresh uploads only the changed documents.
   */
  state: "compatible" | "refreshable" | "stale" | "not-ready" | "not-configured";
  generationId: string | null;
  reasons: string[];
  documents?: number;
  changedDocuments?: { changed: number; added: number; removed: number; attributesOnly: number };
}

/** Offline: compares the published generation's corpus manifest with this workspace's corpus, document by document. */
export function generationCompatibility(ws: Workspace, custodyDir = readSetting(SEMANTIC_ENV.custodyDir, { dotenv: false }) ?? defaultCustodyDir()): GenerationCompatibility {
  const pointer = readPointer(custodyDir);
  if (!pointer) return { state: "not-configured", generationId: null, reasons: ["no published generation (current.json)"] };
  const g = readGeneration(pointer.generationId, custodyDir);
  if (!g) return { state: "not-ready", generationId: pointer.generationId, reasons: ["pointer names a generation missing from custody"] };
  const mapped = Object.keys(g.mapping).length;
  if (g.record.status !== "ready" || mapped !== g.record.documents) return { state: "not-ready", generationId: pointer.generationId, reasons: [`generation status ${g.record.status}; mapping covers ${mapped} of ${g.record.documents} documents`], documents: g.record.documents };
  const reasons: string[] = [];
  const releaseDiffers = g.record.schemaReleaseDigest !== ws.manifest.release.schemaReleaseDigest;
  if (releaseDiffers) reasons.push("release digest differs from the workspace (attributes)");
  const indexed = readCorpusManifest(pointer.generationId, custodyDir);
  let changed = 0;
  let attributesOnly = 0;
  let added = 0;
  let removed = 0;
  try {
    const current = exportCorpus(ws).manifest.documents;
    const before = new Map((indexed?.documents ?? []).map((d) => [d.docId, d]));
    const noFp = (a: Record<string, unknown>) => JSON.stringify(Object.entries(a).filter(([k]) => k !== "workspace_fingerprint").sort(([x], [y]) => (x < y ? -1 : 1)));
    for (const d of current) {
      const b = before.get(d.docId);
      if (!b) added++;
      else if (b.sha256 !== d.sha256) changed++;
      else if (noFp(b.attributes) !== noFp(d.attributes)) attributesOnly++;
      before.delete(d.docId);
    }
    removed = before.size;
    if (!indexed) reasons.push("indexed corpus manifest missing from custody");
  } catch (error) {
    reasons.push(`corpus export failed: ${(error as Error).message}`);
  }
  const contentChanged = changed + added + removed > 0;
  if (contentChanged) reasons.push(`${changed} documents changed, ${added} added, ${removed} removed since indexing`);
  if (attributesOnly) reasons.push(`${attributesOnly} documents differ only in attributes (release / card digest)`);
  const fpDiffers = g.record.workspaceFingerprint !== ws.manifest.workspaceFingerprint;
  if (fpDiffers) reasons.push(`workspace fingerprint differs (attribute only)`);
  const state = reasons.some((r) => r.startsWith("corpus export") || r.startsWith("indexed corpus")) || contentChanged ? "stale" : fpDiffers || releaseDiffers || attributesOnly ? "refreshable" : "compatible";
  return { state, generationId: pointer.generationId, reasons, documents: g.record.documents, changedDocuments: { changed, added, removed, attributesOnly } };
}

function readCorpusManifest(generationId: string, custodyDir: string): CorpusManifest | null {
  const p = join(custodyDir, generationId, "corpus-manifest.json");
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as CorpusManifest) : null;
}
