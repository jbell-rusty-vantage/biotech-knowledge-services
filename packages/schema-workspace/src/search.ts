/**
 * Schema search (bks-lexical.v1) over search/index.jsonl, plus the mode router for semantic / hybrid search.
 *
 * Lexical ranking, highest tier first (exact lookups always precede fuzzy ranking):
 *   1000 exact id · 950 exact name · 900 exact alias
 *    600 name mentioned in the query (code-like names: `LabelVersion`, `HAS_EVIDENCE`, `Mention`)
 *    400 multi-word alias phrase mentioned in the query
 *    300 name prefix · 200 name / alias contains the query
 *    + 0..100 idf-weighted token overlap (the only score below the tiers; a tie-breaker inside a tier)
 * A query that names a kind ("which relationship", "node type", "predicate") adds a small bonus (12) to records of
 * that kind that already match on tokens. Ties break on kind priority then id, so equal inputs give equal outputs. Lookup rows (old v1 aliases, terms,
 * questions) are followed by the cards they resolve to (`via`), so a removed concept is explained first and its
 * live targets come next, never silently substituted.
 */
import type { CardKind, CardRecord } from "./schema-contracts.js";
import { LOOKUP_KINDS } from "./schema-contracts.js";

const STOP = new Set(["the", "a", "an", "of", "and", "or", "to", "in", "on", "for", "is", "are", "with", "by", "as", "at", "it", "this", "that", "be", "its", "their", "which", "what", "where", "when", "who", "how", "does", "do", "there", "if", "not", "give", "name", "say", "list", "one", "some", "such", "example", "from", "into", "can", "has", "have", "any", "each", "every", "type", "types", "node", "relationship", "release", "schema", "exist", "exists", "here", "them", "they", "so", "than", "then", "was", "were", "been"]);

export function tokenize(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

export function normalizeTerm(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Light suffix stemmer (plural / -ing / -ed) applied to index and query tokens alike. */
export function stem(t: string): string {
  if (t.length > 4 && t.endsWith("ies")) return `${t.slice(0, -3)}y`;
  if (t.length > 4 && /(sses|ches|shes|xes)$/.test(t)) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss") && !t.endsWith("us") && !t.endsWith("is")) return t.slice(0, -1);
  if (t.length > 5 && t.endsWith("ing")) return t.slice(0, -3);
  if (t.length > 4 && t.endsWith("ed")) return t.slice(0, -2);
  return t;
}

export interface SearchHit {
  id: string;
  kind: CardKind;
  name: string;
  path: string;
  module?: string;
  domain?: string;
  summary: string;
  score: number;
  matchedOn: string;
  cardDigest?: string;
  /** Set when the hit was reached through a lookup row (old v1 alias, term, question). */
  via?: string;
}

export interface SearchFilters {
  kind?: string | string[];
  module?: string | string[];
  domain?: string | string[];
}

const KIND_PRIORITY: Record<string, number> = { alias: 0, task: 1, node: 2, relationship: 3, predicate: 4, term: 5, question: 6, domain: 7, module: 8, rule: 9, pattern: 10, assessment: 11, enum: 12, "edge-properties": 13, interface: 14, union: 15, vocabulary: 16, "question-set": 17, migration: 18 };
const CODE_LIKE: ReadonlySet<string> = new Set(["node", "relationship", "predicate", "enum", "edge-properties", "interface", "union", "alias", "assessment"]);

interface Prepared {
  rec: CardRecord;
  idL: string;
  nameL: string;
  aliasesL: string[];
  phraseAliases: string[];
  codeName: RegExp | null;
  doc: Set<string>;
  nameTokens: Set<string>;
}

export interface PreparedIndex {
  readonly records: readonly CardRecord[];
  readonly byId: ReadonlyMap<string, CardRecord>;
  readonly items: readonly Prepared[];
  readonly idf: ReadonlyMap<string, number>;
}

/**
 * Scoring uses names / aliases (weight 1.0) and tokens + summary (0.6). The index rows' `keywords` and `bodyTokens`
 * (section-level fields) are carried for consumers (e.g. corpus sections) but are deliberately not scored: a
 * weighted keyword / body round was evaluated and not kept (report S2-workspace.md, lexical improvement round).
 */
export function prepareIndex(records: readonly CardRecord[]): PreparedIndex {
  const items: Prepared[] = records.map((rec) => {
    const aliasesL = rec.aliases.map(normalizeTerm);
    const nameTokens = new Set([...tokenize(rec.name), ...rec.aliases.flatMap(tokenize)].map(stem));
    const doc = new Set([...rec.tokens.map(stem), ...nameTokens, ...tokenize(rec.summary).map(stem)]);
    const codeName = CODE_LIKE.has(rec.kind) && /^[A-Za-z][A-Za-z0-9_]{2,}$/.test(rec.name) && /[A-Z]/.test(rec.name) ? new RegExp(`(^|[^A-Za-z0-9_])${rec.name}([^A-Za-z0-9_]|$)`) : null;
    return { rec, idL: rec.id.toLowerCase(), nameL: normalizeTerm(rec.name), aliasesL, phraseAliases: aliasesL.filter((a) => a.split(" ").length >= 2 && a.length >= 8), codeName, doc, nameTokens };
  });
  const df = new Map<string, number>();
  for (const it of items) for (const t of it.doc) df.set(t, (df.get(t) ?? 0) + 1);
  const n = items.length || 1;
  const idf = new Map<string, number>();
  for (const [t, f] of df) idf.set(t, Math.log(1 + n / f));
  return { records, byId: new Map(records.map((r) => [r.id, r])), items, idf };
}

const prepCache = new WeakMap<readonly CardRecord[], PreparedIndex>();
function prepared(records: readonly CardRecord[]): PreparedIndex {
  let p = prepCache.get(records);
  if (!p) {
    p = prepareIndex(records);
    prepCache.set(records, p);
  }
  return p;
}

/** Ranked lexical search (deterministic). `limit` applies after lookup expansion and filters. */
export function lexicalSearch(index: PreparedIndex, query: string, options: SearchFilters & { limit?: number } = {}): SearchHit[] {
  const raw = query.trim();
  const q = normalizeTerm(raw);
  if (!q) return [];
  const qTokens = [...new Set(tokenize(raw).map(stem))];
  const qWeight = qTokens.reduce((a, t) => a + (index.idf.get(t) ?? Math.log(1 + index.items.length)), 0);
  const padded = ` ${q.replace(/[^a-z0-9+]+/g, " ")} `;
  const hinted = kindHints(q);
  const scored: SearchHit[] = [];
  for (const it of index.items) {
    let tier = 0;
    let matchedOn = "";
    if (it.idL === q) [tier, matchedOn] = [1000, "id"];
    else if (it.nameL === q) [tier, matchedOn] = [950, "name"];
    else if (it.aliasesL.includes(q)) [tier, matchedOn] = [900, "alias"];
    else if (it.codeName && it.codeName.test(raw)) [tier, matchedOn] = [600 + Math.min(it.rec.name.length, 40), "mention"];
    else {
      const phrase = it.phraseAliases.find((a) => padded.includes(` ${a.replace(/[^a-z0-9+]+/g, " ")} `));
      if (phrase) [tier, matchedOn] = [400 + Math.min(phrase.length, 40), "alias-mention"];
      else if (q.length >= 3 && it.nameL.startsWith(q)) [tier, matchedOn] = [300, "name-prefix"];
      else if (q.length >= 3 && (it.nameL.includes(q) || it.aliasesL.some((a) => a.includes(q)))) [tier, matchedOn] = [200, "contains"];
    }
    let tokenScore = 0;
    if (qTokens.length && qWeight > 0) {
      let hit = 0;
      for (const t of qTokens) if (it.doc.has(t)) hit += (index.idf.get(t) ?? 0) * (it.nameTokens.has(t) ? 1 : 0.6);
      tokenScore = (hit / qWeight) * 100;
    }
    if (tokenScore > 0 && hinted.has(it.rec.kind)) tokenScore += KIND_HINT_BONUS;
    if (!tier && tokenScore < 8) continue;
    const score = Math.round((tier + tokenScore) * 1000) / 1000;
    scored.push(toHit(it.rec, score, matchedOn || "tokens"));
  }
  scored.sort(compareHits);
  const expanded = expandLookups(index, scored);
  return applyFilters(expanded, options).slice(0, options.limit ?? 10);
}

/** Soft kind hint from explicit kind words in the query ("which relationship", "node type", "predicate", "enum values"). */
export const KIND_HINT_BONUS = 12;
export function kindHints(q: string): Set<string> {
  const out = new Set<string>();
  if (/\b(relationship|relationships|edge)\b/.test(q)) out.add("relationship");
  if (/\bnode types?\b|\bwhich types?\b/.test(q)) out.add("node");
  if (/\bpredicates?\b/.test(q)) out.add("predicate");
  if (/\benum\b|\ballowed values\b|\bvocabulary\b/.test(q)) out.add("enum");
  if (/\bassessments?\b/.test(q)) out.add("assessment");
  return out;
}

export function compareHits(a: SearchHit, b: SearchHit): number {
  return b.score - a.score || (KIND_PRIORITY[a.kind] ?? 99) - (KIND_PRIORITY[b.kind] ?? 99) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

function toHit(rec: CardRecord, score: number, matchedOn: string, via?: string): SearchHit {
  return {
    id: rec.id,
    kind: rec.kind,
    name: rec.name,
    path: rec.path,
    ...(rec.module ? { module: rec.module } : {}),
    ...(rec.domain ? { domain: rec.domain } : {}),
    summary: rec.summary.length > 200 ? `${rec.summary.slice(0, 199)}…` : rec.summary,
    score,
    matchedOn,
    ...(rec.cardDigest ? { cardDigest: rec.cardDigest } : {}),
    ...(via ? { via } : {}),
  };
}

/** Inserts the targets of lookup rows right after them (once; a target already ranked higher keeps its place). */
function expandLookups(index: PreparedIndex, hits: SearchHit[]): SearchHit[] {
  const out: SearchHit[] = [];
  const placed = new Set<string>();
  const later = new Set(hits.map((h) => h.id));
  for (const h of hits) {
    if (placed.has(h.id)) continue;
    out.push(h);
    placed.add(h.id);
    if (!LOOKUP_KINDS.includes(h.kind)) continue;
    const rec = index.byId.get(h.id);
    const targets = [...(rec?.targets ?? []), ...(rec?.seeAlso ?? [])];
    for (const t of targets) {
      if (placed.has(t)) continue;
      const target = index.byId.get(t);
      if (!target) continue;
      // a target that would rank above the lookup row on its own merit keeps that rank
      if (later.has(t) && (hits.find((x) => x.id === t)?.score ?? 0) > h.score) continue;
      out.push(toHit(target, h.score, `via:${h.matchedOn}`, h.id));
      placed.add(t);
    }
  }
  return out;
}

function applyFilters(hits: SearchHit[], f: SearchFilters): SearchHit[] {
  const set = (x: string | string[] | undefined) => (x === undefined ? null : new Set(Array.isArray(x) ? x : [x]));
  const kinds = set(f.kind);
  const modules = set(f.module);
  const domains = set(f.domain);
  return hits.filter((h) => (!kinds || kinds.has(h.kind) || kinds.has(kindAlias(h.kind))) && (!modules || (h.module !== undefined && modules.has(h.module))) && (!domains || (h.domain !== undefined && domains.has(h.domain))));
}

function kindAlias(kind: string): string {
  return kind === "relationship" ? "rel" : kind === "predicate" ? "pred" : kind;
}

/** v1-compatible synchronous search (exact > mention > prefix > tokens), used by Workspace.search. */
export function searchIndex(entries: readonly CardRecord[], query: string, limit = 10): SearchHit[] {
  return lexicalSearch(prepared(entries), query, { limit });
}

/** Reciprocal-rank fusion (k = 60, equal weights by default); returns ids in fused order with deterministic ties. */
export function reciprocalRankFusion(lists: ReadonlyArray<readonly string[]>, k = 60, weights?: readonly number[]): Array<{ id: string; score: number }> {
  const scores = new Map<string, number>();
  lists.forEach((l, i) => l.forEach((id, rank) => scores.set(id, (scores.get(id) ?? 0) + (weights?.[i] ?? 1) / (k + rank + 1))));
  return [...scores.entries()].map(([id, score]) => ({ id, score })).sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export { prepared as preparedIndexOf };
