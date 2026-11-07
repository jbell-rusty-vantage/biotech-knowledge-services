export * from "./ir.js";
export { parseSchema, parseClassDoc, summarize, cleanText, registerTypeName, type ParseOptions, type ReleaseInputs } from "./parse.js";
export { loadRelease, classifyName, type NameClass, clearReleaseCache, resolveReleaseDir, toValidationParams, pinnedRoot, ReleaseError, type ReleaseErrorCode, type ReleaseBundle, type ReleaseManifest, type ReleaseDdl, type DdlStatement, type PinV2, type FileDigest } from "./release.js";
export { readPin, readPinnedSdl, readValidationParams, readRelease, repoRoot, pinnedDir, sidecarDir, defaultWorkspaceDir, type PinManifest } from "./load.js";
export { loadSidecars, validateSidecars, domainOfFragment, type Sidecars, type DomainSidecar, type TaskSidecar, type TermSidecar, type IdentityRulesSidecar, type IngestionRulesSidecar, type AliasesSidecar, type AliasEntry } from "./sidecars.js";
// ---- workspace v2 (S2) ----------------------------------------------------------------------------------------
export { renderWorkspace, writeWorkspace, validateGeneratedPath, fingerprintOf, linksOf, patternPath, predicateRoute, RENDERER_VERSION, LAYERS, SEARCH_LIMITS, SLICE_TARGET_TOKENS, TOKEN_ESTIMATOR, WorkspaceWriteError, type RenderInput, type RenderResult } from "./render.js";
export { renderCard, parseCard, verifyCardDigest, cardDigestOf, sectionsOf, sectionSlug, type FrontMatter, type ParsedCard } from "./card.js";
export { searchIndex, lexicalSearch, prepareIndex, reciprocalRankFusion, tokenize, normalizeTerm, stem, compareHits, type SearchHit, type SearchFilters, type PreparedIndex } from "./search.js";
export { openWorkspace, getPage, conventionalPath, searchWorkspace, STRUCTURED_EXPANSION, PATH_WORDING, adaptiveBaseLimit, shortestPathLength, queryNodeTypes, type RouteEntry, verifyWorkspaceFiles, listFiles, WorkspaceError, SEARCH_NOTE, type Workspace, type WorkspaceErrorCode, type Page, type PageOptions, type ResolvedId, type QueryCatalog, type SearchMode, type SearchOptions, type SearchResponse, type IntegrityReport } from "./workspace.js";
export { findCards, FIND_LIMITS, type FindQuery, type FindResult } from "./find.js";
export { buildAdjacency, stepIndex, TOPOLOGY_NOTE, type Adjacency, type AdjArc, type PredicateJoin, type Step } from "./topology.js";
export { neighborsOf, NEIGHBOR_LIMITS, NeighborError, type NeighborOptions, type NeighborsResult, type NeighborArc } from "./neighbors.js";
export { findPaths, PATH_LIMITS, PathError, type PathOptions, type PathsResult, type SchemaPath, type PathHop } from "./path.js";
export { patternLookup, type PatternResult } from "./pattern.js";
export { doctor, type DoctorReport, type DoctorCheck, type DoctorOptions } from "./doctor.js";
export { schemaContext, type SchemaContextInput } from "./context.js";
export { buildSlice, writeSlice, referencedTypes, estimateTokens, SliceError, type SliceBundle, type SliceTrace, type SliceOmission, type SlicePage } from "./slice.js";
export { evalSearch, loadEvalTasks, normalizeGoldId, queryOfPrompt, type EvalMode, type EvalTask, type EvalReport, type EvalTaskResult } from "./eval.js";
export { build as buildWorkspaceInMemory, verifyWorkspace, type VerifyReport } from "./build.js";
export { notConfiguredRetriever, validateHostedHits, type SemanticRetriever, type SemanticStatus, type SemanticHit, type SemanticSearchRequest, type SemanticResult, type ValidatedHits, type HitRejection } from "./semantic/retriever.js";
export * from "./schema-contracts.js";
export { renderSchemaMap, MAP_RENDERER_VERSION, type MapOptions } from "./map.js";

import type { Workspace } from "./workspace.js";
import { neighborsOf, type NeighborOptions } from "./neighbors.js";
import { findPaths, type PathOptions } from "./path.js";
/** Executor-facing convenience: neighbors over an open workspace. */
export function neighbors(ws: Workspace, id: string, options: NeighborOptions = {}) {
  return neighborsOf(ws.adjacency(), id, options);
}
/** Executor-facing convenience: legal schema paths over an open workspace. */
export function paths(ws: Workspace, from: string, to: string, options: PathOptions = {}) {
  return findPaths(ws.adjacency(), from, to, options);
}
export { patternLookup as pattern } from "./pattern.js";
// ---- semantic schema retrieval (S5) ---------------------------------------------------------------------------
export { exportCorpus, writeCorpus, CORPUS_FORMAT, CORPUS_POLICY, type CorpusDocument, type CorpusManifest, type CorpusKind } from "./semantic/corpus.js";
export { generate, refreshGeneration, recheckGeneration, GenerationAbort, publishGeneration, retireGeneration, deleteGeneration, readGeneration, readPointer, readLedger, newGenerationId, storeNameOf, defaultCustodyDir, DEFAULT_CHUNKING, SEARCH_CONFIG, BUDGET, type GenerationRecord, type MapEntry, type CurrentPointer, type UsageLedger } from "./semantic/generation.js";
export { createVectorStoreRetriever, type VectorStoreRetriever, type VectorStoreRetrieverOptions, type RetrieverCall } from "./semantic/vector-store-retriever.js";
export { semanticFromEnv, generationCompatibility, type SemanticBinding, type GenerationCompatibility } from "./semantic/config.js";
export { openAIProvider, classifyProviderError, ProviderError, OPENAI_SDK_VERSION, type VectorProvider, type ProviderFailure, type SearchParams, type SearchResult } from "./semantic/provider.js";
export { qualify, type QualificationReport } from "./semantic/qualify.js";
export { SEMANTIC_ENV } from "./semantic/env.js";
