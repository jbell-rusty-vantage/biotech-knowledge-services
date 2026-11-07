/**
 * Approved-public-content corpus for semantic schema search (SPECIFICATION 4.1), exported from the verified packaged
 * workspace only. Included: generated schema cards (nodes, relationships, edge properties, interfaces, unions, enums,
 * domains, modules), task routes, predicate and assessment cards, release rule cards, and pattern explanations (the
 * catalog card without its Cypher statement). Excluded: SDL files, the IR, the raw query catalog, search indexes,
 * migrations, release vocabulary dumps, START_HERE/INDEX, anything outside the workspace inventory.
 *
 * Each card becomes 1..n documents of at most ~1,200 estimated tokens, split at `## ` section boundaries (long
 * sections at line boundaries) and sharing the parent card id. Every document embeds only release-stable identity:
 * title, card id, section id (with headings), kind and module (plus the card summary). Release digest, card digest and
 * workspace fingerprint live only in the file attributes, so a release bump or rebuild that leaves card bodies
 * unchanged changes no document byte: a refresh reuses every uploaded file and re-attaches it with new attributes.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { digestOf } from "@bks/contracts";
import { parseCard } from "../card.js";
import type { CardRecord } from "../schema-contracts.js";
import type { Workspace } from "../workspace.js";
import type { Attributes } from "./provider.js";

export const CORPUS_FORMAT = "bks-semantic-corpus.v1" as const;
export const CORPUS_POLICY = {
  version: "bks-semantic-corpus-policy.v1",
  maxDocTokens: 1200,
  minDocTokens: 400,
  tokenEstimator: "ceil(utf8 characters / 4)",
  includeKinds: ["node", "relationship", "edge-properties", "interface", "union", "enum", "domain", "module", "task", "predicate", "assessment", "rule", "pattern"] as const,
  includeDirs: ["nodes/", "relationships/", "edge-properties/", "interfaces/", "unions/", "vocabularies/", "domains/", "modules/", "tasks/", "predicates/", "assessments/", "rules/", "patterns/"],
  excluded: ["sdl/**", "schema-ir.json", "patterns/catalog.json", "search/**", "migrations/**", "vocabularies/release/**", "vocabularies/INDEX.md", "patterns/questions/**", "START_HERE.md", "INDEX.md", "manifest.json", "Cypher statements inside pattern cards"],
  maxCorpusBytes: 25 * 1024 * 1024,
} as const;

export type CorpusKind = "card" | "task-route" | "predicate" | "assessment" | "rule" | "pattern";

export interface CorpusDocument {
  docId: string;
  cardId: string;
  cardDigest: string;
  kind: string;
  corpusKind: CorpusKind;
  module: string;
  part: number;
  parts: number;
  headings: string[];
  filename: string;
  sourcePath: string;
  sourceSha256: string;
  sha256: string;
  bytes: number;
  tokensEst: number;
  attributes: Attributes;
  text: string;
}

export interface CorpusManifest {
  format: typeof CORPUS_FORMAT;
  policy: typeof CORPUS_POLICY;
  releaseId: string;
  schemaReleaseDigest: string;
  workspaceFingerprint: string;
  /** Digest over every document (id, sha256, all attributes incl. workspace_fingerprint). */
  corpusDigest: string;
  /** Digest over document ids, bytes and attributes EXCLUDING workspace_fingerprint: unchanged by a rebuild that leaves card bytes unchanged. */
  contentDigest: string;
  counts: { cards: number; documents: number; byCorpusKind: Record<string, number>; byKind: Record<string, number>; multiPartCards: number };
  totals: { bytes: number; tokensEst: number; maxDocTokens: number; medianDocTokens: number };
  documents: Array<Omit<CorpusDocument, "text">>;
}

const est = (s: string) => Math.ceil(s.length / 4);
const sha = (s: string) => `sha256:${createHash("sha256").update(s, "utf8").digest("hex")}`;

function corpusKindOf(kind: string): CorpusKind {
  if (kind === "task") return "task-route";
  if (kind === "predicate") return "predicate";
  if (kind === "assessment") return "assessment";
  if (kind === "rule") return "rule";
  if (kind === "pattern") return "pattern";
  return "card";
}

function titleOf(r: CardRecord): string {
  const label: Record<string, string> = { node: "Node type", relationship: "Relationship type", "edge-properties": "Edge-property type", interface: "Interface", union: "Union", enum: "Enum", domain: "Domain", module: "Module", task: "Task route", predicate: "Predicate", assessment: "Assessment kind", rule: "Rule", pattern: "Query pattern" };
  return `${label[r.kind] ?? r.kind} ${r.name}`;
}

/** Markdown links -> their text; front matter removed; pattern statements removed. */
function cleanBody(kind: string, body: string): string {
  let t = body.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  if (kind === "pattern") t = t.replace(/\n## Statement\n[\s\S]*?(?=\n## )/, "\n");
  return t.replace(/\n{3,}/g, "\n\n").trim();
}

function splitSections(body: string): Array<{ heading: string; text: string }> {
  return body.split(/\n(?=## )/).map((s) => ({ heading: s.startsWith("## ") ? s.slice(3, s.indexOf("\n") < 0 ? undefined : s.indexOf("\n")).trim() : "", text: s.trim() })).filter((s) => s.text);
}

function splitLong(text: string, max: number): string[] {
  if (est(text) <= max) return [text];
  const out: string[] = [];
  let cur: string[] = [];
  for (const line of text.split("\n")) {
    if (est([...cur, line].join("\n")) > max && cur.length) {
      out.push(cur.join("\n"));
      cur = [];
    }
    if (est(line) > max) {
      for (let i = 0; i < line.length; i += max * 4) out.push(line.slice(i, i + max * 4));
      continue;
    }
    cur.push(line);
  }
  if (cur.length) out.push(cur.join("\n"));
  return out;
}

function safeName(s: string): string {
  return s.replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 150);
}

export function exportCorpus(ws: Workspace): { manifest: CorpusManifest; documents: CorpusDocument[] } {
  const rel = ws.manifest.release;
  const include = new Set<string>(CORPUS_POLICY.includeKinds);
  const records = ws.index.filter((r) => r.cardDigest && include.has(r.kind) && CORPUS_POLICY.includeDirs.some((d) => r.path.startsWith(d)) && !r.path.startsWith("vocabularies/release/") && !r.path.startsWith("patterns/questions/"));
  const documents: CorpusDocument[] = [];
  const names = new Set<string>();
  for (const r of [...records].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    const entry = ws.manifest.inventory[r.path];
    if (!entry) throw new Error(`corpus: ${r.path} is not in the workspace inventory`);
    const raw = readFileSync(join(ws.dir, ...r.path.split("/")), "utf8");
    if (sha(raw) !== entry.sha256) throw new Error(`corpus: ${r.path} does not match the workspace inventory (run pnpm workspace:verify)`);
    const card = parseCard(raw);
    if (!card || card.frontMatter.cardDigest !== r.cardDigest) throw new Error(`corpus: ${r.path} card digest disagrees with the index`);
    const module = r.module ?? "none";
    const title = titleOf(r);
    const headerBudget = 160;
    const max = CORPUS_POLICY.maxDocTokens - headerBudget;
    const chunks: Array<{ headings: string[]; text: string }> = [];
    let cur: { headings: string[]; parts: string[] } = { headings: [], parts: [] };
    const flush = () => {
      if (cur.parts.length) chunks.push({ headings: cur.headings, text: cur.parts.join("\n\n") });
      cur = { headings: [], parts: [] };
    };
    for (const s of splitSections(cleanBody(r.kind, card.body))) {
      for (const piece of splitLong(s.text, max)) {
        if (cur.parts.length && est([...cur.parts, piece].join("\n\n")) > max) flush();
        cur.parts.push(piece);
        if (s.heading && !cur.headings.includes(s.heading)) cur.headings.push(s.heading);
      }
    }
    flush();
    // merge a short tail into its predecessor when the result stays within the cap
    if (chunks.length > 1 && est(chunks[chunks.length - 1]!.text) < CORPUS_POLICY.minDocTokens / 2) {
      const last = chunks.pop()!;
      const prev = chunks[chunks.length - 1]!;
      if (est(`${prev.text}\n\n${last.text}`) <= max) chunks[chunks.length - 1] = { headings: [...prev.headings, ...last.headings], text: `${prev.text}\n\n${last.text}` };
      else chunks.push(last);
    }
    chunks.forEach((c, i) => {
      const part = i + 1;
      const docId = `${r.id}#p${part}`;
      const header = `# ${title}${chunks.length > 1 ? ` (part ${part} of ${chunks.length})` : ""}\n\ncard: ${r.id} | section: ${docId}${c.headings.length ? ` (${c.headings.slice(0, 4).join("; ")})` : ""} | kind: ${r.kind} | module: ${module}\n${r.summary ? `summary: ${r.summary}\n` : ""}\n`;
      const text = `${header}${c.text}\n`;
      let filename = `${safeName(r.id)}--p${part}.md`;
      if (names.has(filename.toLowerCase())) filename = `${safeName(r.id)}-${sha(r.id).slice(7, 15)}--p${part}.md`;
      names.add(filename.toLowerCase());
      const attributes: Attributes = { release_digest: rel.schemaReleaseDigest, workspace_fingerprint: ws.manifest.workspaceFingerprint, card_id: r.id, card_digest: r.cardDigest!, kind: r.kind, module, language: "en", corpus_kind: corpusKindOf(r.kind), section: docId };
      for (const [k, v] of Object.entries(attributes)) if (k.length > 64 || String(v).length > 512) throw new Error(`corpus: attribute ${k} of ${docId} exceeds provider bounds`);
      documents.push({ docId, cardId: r.id, cardDigest: r.cardDigest!, kind: r.kind, corpusKind: corpusKindOf(r.kind), module, part, parts: chunks.length, headings: c.headings, filename, sourcePath: r.path, sourceSha256: entry.sha256, sha256: sha(text), bytes: Buffer.byteLength(text, "utf8"), tokensEst: est(text), attributes, text });
    });
  }
  const count = (f: (d: CorpusDocument) => string) => documents.reduce<Record<string, number>>((a, d) => ((a[f(d)] = (a[f(d)] ?? 0) + 1), a), {});
  const tokens = documents.map((d) => d.tokensEst).sort((a, b) => a - b);
  const meta = documents.map(({ text: _t, ...d }) => d);
  const manifest: CorpusManifest = {
    format: CORPUS_FORMAT,
    policy: CORPUS_POLICY,
    releaseId: rel.releaseId,
    schemaReleaseDigest: rel.schemaReleaseDigest,
    workspaceFingerprint: ws.manifest.workspaceFingerprint,
    corpusDigest: digestOf(meta.map((d) => [d.docId, d.sha256, d.attributes])),
    contentDigest: contentDigestOf(meta),
    counts: { cards: records.length, documents: documents.length, byCorpusKind: count((d) => d.corpusKind), byKind: count((d) => d.kind), multiPartCards: new Set(documents.filter((d) => d.parts > 1).map((d) => d.cardId)).size },
    totals: { bytes: documents.reduce((a, d) => a + d.bytes, 0), tokensEst: documents.reduce((a, d) => a + d.tokensEst, 0), maxDocTokens: tokens[tokens.length - 1] ?? 0, medianDocTokens: tokens[Math.floor(tokens.length / 2)] ?? 0 },
    documents: meta,
  };
  if (manifest.totals.bytes > CORPUS_POLICY.maxCorpusBytes) throw new Error(`corpus: ${manifest.totals.bytes} bytes exceeds the ${CORPUS_POLICY.maxCorpusBytes}-byte upload ceiling`);
  return { manifest, documents };
}

/** Writes corpus/<filename> and corpus-manifest.json into a custody directory (never into Git). */
export function writeCorpus(dir: string, corpus: { manifest: CorpusManifest; documents: CorpusDocument[] }): void {
  for (const d of corpus.documents) {
    const p = join(dir, "corpus", d.filename);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, d.text, "utf8");
  }
  writeFileSync(join(dir, "corpus-manifest.json"), `${JSON.stringify(corpus.manifest, null, 2)}\n`, "utf8");
}

/** Fingerprint-independent digest of a corpus: document ids, document bytes and attributes without workspace_fingerprint. */
export function contentDigestOf(docs: ReadonlyArray<{ docId: string; sha256: string; attributes: Attributes }>): string {
  return digestOf(
    docs.map((d) => {
      const { workspace_fingerprint: _w, ...rest } = d.attributes;
      return [d.docId, d.sha256, rest];
    }),
  );
}
