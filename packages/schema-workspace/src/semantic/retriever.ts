/**
 * Semantic retriever seam (S2 defines it; S5 implements the OpenAI Vector Stores adapter behind it).
 *
 * Contract (SPECIFICATION 4.2): hosted search supplies candidates, the pinned local bundle supplies truth.
 * - Every hosted hit is validated against the local workspace (card id known, card digest current, release and
 *   workspace identities equal) and rehydrated from local cards; unknown or stale hits are rejected, never shown.
 * - Provider timeout / quota / unavailable generation / pin mismatch => explicit degradation. A semantic-only
 *   request then returns status `unavailable`, never a false empty result; hybrid falls back to lexical-only.
 * - No retrieved text is executed. No provider credentials ever reach this package's callers.
 */
export interface SemanticStatus {
  state: "available" | "unavailable" | "not-configured";
  generationId: string | null;
  reason?: string;
}

export interface SemanticSearchRequest {
  query: string;
  limit: number;
  filters: { kind?: string[]; module?: string[] };
  release: { schemaReleaseDigest: string; workspaceFingerprint: string };
  deadlineMs: number;
}

/** One hosted hit as the provider adapter maps it back to local identities (file id -> card/section mapping kept outside the provider). */
export interface SemanticHit {
  cardId: string;
  cardDigest: string;
  sectionId?: string;
  score: number;
  schemaReleaseDigest?: string;
  workspaceFingerprint?: string;
  fileId?: string;
}

export interface SemanticResult {
  status: SemanticStatus;
  hits: SemanticHit[];
  /** Hits the adapter already rejected (unknown file id or attributes that disagree with the local mapping). */
  rejected?: number;
}

export interface SemanticRetriever {
  readonly id: string;
  status(): Promise<SemanticStatus>;
  search(request: SemanticSearchRequest): Promise<SemanticResult>;
}

/** The S2 default: no generation is bound; every semantic call reports `not-configured`. */
export const notConfiguredRetriever: SemanticRetriever = {
  id: "none",
  async status() {
    return { state: "not-configured", generationId: null, reason: "no semantic schema-index generation is bound to this workspace (S5 wires the OpenAI Vector Stores adapter)" };
  },
  async search() {
    return { status: await this.status(), hits: [] };
  },
};

export type HitRejection = "unknown-card" | "stale-digest" | "release-mismatch" | "workspace-mismatch";

export interface ValidatedHits {
  accepted: SemanticHit[];
  rejected: Array<{ hit: SemanticHit; reason: HitRejection }>;
}

/**
 * Validates hosted hits against the local workspace: card known, digest current, release / workspace identity equal
 * when the hit carries them. Order of accepted hits is preserved.
 */
export function validateHostedHits(local: { cardDigest(id: string): string | undefined; schemaReleaseDigest: string; workspaceFingerprint: string }, hits: readonly SemanticHit[]): ValidatedHits {
  const out: ValidatedHits = { accepted: [], rejected: [] };
  for (const hit of hits) {
    const digest = local.cardDigest(hit.cardId);
    if (hit.schemaReleaseDigest && hit.schemaReleaseDigest !== local.schemaReleaseDigest) out.rejected.push({ hit, reason: "release-mismatch" });
    else if (hit.workspaceFingerprint && hit.workspaceFingerprint !== local.workspaceFingerprint) out.rejected.push({ hit, reason: "workspace-mismatch" });
    else if (!digest) out.rejected.push({ hit, reason: "unknown-card" });
    else if (digest !== hit.cardDigest) out.rejected.push({ hit, reason: "stale-digest" });
    else out.accepted.push(hit);
  }
  return out;
}
