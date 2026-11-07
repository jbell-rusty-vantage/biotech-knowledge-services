/**
 * Card front matter (workspace v2). Every card file starts with a generated block:
 *
 *   ---
 *   id: "node:Product"
 *   kind: "node"
 *   module: "D6"
 *   schemaReleaseDigest: "sha256:..."
 *   sourceRefs: ["release:sdl/modules/D6.graphql#L120-L188", ...]
 *   aliases: [...]
 *   capabilities: [...]
 *   cardDigest: "sha256:..."
 *   ---
 *
 * Values are JSON (valid YAML flow scalars/sequences), keys in this fixed order. `cardDigest` is the sha256 of the
 * canonical JSON of `{ frontMatter (without cardDigest), body }`. The front matter is a projection of the same IR row
 * that search/index.jsonl carries; it is never maintained separately.
 */
import { digestOf } from "@bks/contracts";

export interface FrontMatter {
  id: string;
  kind: string;
  module: string | null;
  schemaReleaseDigest: string;
  sourceRefs: string[];
  aliases: string[];
  capabilities: string[];
}

export interface ParsedCard {
  frontMatter: FrontMatter & { cardDigest: string };
  body: string;
}

const KEYS = ["id", "kind", "module", "schemaReleaseDigest", "sourceRefs", "aliases", "capabilities"] as const;

export function cardDigestOf(frontMatter: FrontMatter, body: string): string {
  const fm: Record<string, unknown> = {};
  for (const k of KEYS) fm[k] = frontMatter[k];
  return digestOf({ frontMatter: fm, body });
}

export function renderCard(frontMatter: FrontMatter, body: string): { text: string; cardDigest: string } {
  const cardDigest = cardDigestOf(frontMatter, body);
  const lines = ["---", ...KEYS.map((k) => `${k}: ${JSON.stringify(frontMatter[k])}`), `cardDigest: ${JSON.stringify(cardDigest)}`, "---", ""];
  return { text: `${lines.join("\n")}${body}`, cardDigest };
}

/** Parses a card; returns null for files without generated front matter (START_HERE, INDEX, SDL, JSON). */
export function parseCard(text: string): ParsedCard | null {
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) return null;
  const header = text.slice(4, end).split("\n");
  const values: Record<string, unknown> = {};
  for (const line of header) {
    const i = line.indexOf(": ");
    if (i < 0) return null;
    try {
      values[line.slice(0, i)] = JSON.parse(line.slice(i + 2));
    } catch {
      return null;
    }
  }
  if (typeof values.id !== "string" || typeof values.cardDigest !== "string") return null;
  return { frontMatter: values as unknown as ParsedCard["frontMatter"], body: text.slice(end + 5) };
}

/** Recomputes a parsed card's digest; true when the stored cardDigest matches. */
export function verifyCardDigest(card: ParsedCard): boolean {
  const { cardDigest, ...fm } = card.frontMatter;
  return cardDigestOf(fm, card.body) === cardDigest;
}

/** Splits a card body into `## ` sections (heading text -> section text including the heading). */
export function sectionsOf(body: string): Array<{ heading: string; text: string }> {
  const out: Array<{ heading: string; text: string }> = [];
  const lines = body.split("\n");
  let current: { heading: string; lines: string[] } = { heading: "", lines: [] };
  for (const line of lines) {
    if (line.startsWith("## ")) {
      out.push({ heading: current.heading, text: current.lines.join("\n") });
      current = { heading: line.slice(3).trim(), lines: [line] };
    } else current.lines.push(line);
  }
  out.push({ heading: current.heading, text: current.lines.join("\n") });
  return out.filter((s) => s.text.trim().length > 0);
}

/** Section slug used by `get --section`: lowercase, non-alphanumerics to '-', parenthesized counts dropped. */
export function sectionSlug(heading: string): string {
  return heading
    .replace(/\(\d+[^)]*\)/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
