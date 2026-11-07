/**
 * Shared helpers for the schema release tooling (scripts/release/*.mjs). Pure Node, no network.
 * Every generator built on these helpers is deterministic: same inputs -> same bytes (LF line endings, sorted keys
 * where a map has no meaningful order, no timestamps other than the frozen release createdAt).
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
/** biotech-knowledge-services repository root. */
export const BKS_ROOT = resolve(here, "..", "..", "..");
/** Frozen candidate inputs (BKS commit 431c8a7). */
export const FINAL_DIR = resolve(BKS_ROOT, "schema", "program", "final");
export const PLAN_DIR = resolve(BKS_ROOT, "docs", "plans", "schema-v2-service-release");
/** Historical upstream checkout of v2.0.x (absent since 2026-10; provenance only, not an edit destination). */
export const BIOTECH_META_ROOT = resolve(BKS_ROOT, "..", "biotech-meta");
export const RELEASE_ID = "biotech-schema-v2.0.0";
export const DEFAULT_RELEASE_DIR = resolve(BIOTECH_META_ROOT, "docs", "schema", "releases", RELEASE_ID);
/** Authored release sources (owner decision SV-D10, 2026-10-24): this repository is the schema author. */
export const SOURCE_ROOT = resolve(BKS_ROOT, "schema", "source");
/** Current authored release (default --release of generate/verify/apply-ddl/explain-catalog). DEFAULT_RELEASE_DIR and
 * RELEASE_ID above stay the historical v2.0.0 defaults of promote.mjs and bootstrap-workspace-inputs.mjs. */
export const CURRENT_RELEASE_ID = "biotech-schema-v2.1.0";
export const CURRENT_RELEASE_DIR = resolve(SOURCE_ROOT, CURRENT_RELEASE_ID);
/** Frozen release clock (createdAt). Never `new Date()` in a generator. */
export const RELEASE_CREATED_AT = "2026-10-11T00:00:00.000Z";
export const BASELINE_SCHEMA_DIGEST = "sha256:c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793";
export const BKS_COMMIT = "431c8a7c287ee3d914843390a080dbfbe949acdc";
export const BIOTECH_META_COMMIT = "638aef572383062401b341802adcf01521136ff7";

const requireFromWorkspace = createRequire(resolve(BKS_ROOT, "packages", "schema-workspace", "package.json"));
/** The `yaml` 2.x package of the schema-workspace package (same parser the TS loader uses). */
export const YAML = requireFromWorkspace("yaml");
/** graphql-js 16 of the schema-workspace package. */
export const graphql = requireFromWorkspace("graphql");
export const versions = {
  yaml: requireFromWorkspace("yaml/package.json").version,
  graphql: requireFromWorkspace("graphql/package.json").version,
};

export function sha256Hex(data) {
  return createHash("sha256").update(data).digest("hex");
}
export function sha256Tagged(data) {
  return `sha256:${sha256Hex(data)}`;
}

/** Reads a text file and normalizes CRLF to LF (frozen inputs are LF; this guards a Windows checkout). */
export function readText(path) {
  return readFileSync(path, "utf8").replace(/\r\n/g, "\n");
}
export function readYaml(path) {
  return YAML.parse(readText(path));
}
export function readJson(path) {
  return JSON.parse(readText(path));
}

/** Recursively sorts object keys (arrays keep their order). */
export function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const out = {};
    for (const k of Object.keys(value).sort()) if (value[k] !== undefined) out[k] = sortKeys(value[k]);
    return out;
  }
  return value;
}
/** Canonical compact JSON (sorted keys, no whitespace): the byte form digests are computed over. */
export function canonicalJson(value) {
  return JSON.stringify(sortKeys(value));
}
/** Pretty, sorted-key JSON with a trailing newline (the on-disk form of generated JSON). */
export function prettyJson(value) {
  return `${JSON.stringify(sortKeys(value), null, 2)}\n`;
}
/** Pretty JSON that keeps the caller's key order (for documents whose key order is meaningful). */
export function orderedJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}
/**
 * YAML with stable options (no line folding, so long strings stay on one line). Emitted with YAML 1.1 scalar rules so
 * every string a YAML 1.1 reader (PyYAML) would retype (yes/no/on/off, dates, octal-looking, 1e3) is quoted; the output
 * parses identically under YAML 1.2 (Node `yaml`) and PyYAML (TL-04).
 */
export function toYaml(value, header = "") {
  // A bare `=` is the YAML 1.1 !!value tag (PyYAML cannot construct it); the `yaml` 1.1 emitter does not quote it.
  const body = YAML.stringify(value, { version: "1.1", lineWidth: 0, minContentWidth: 0, aliasDuplicateObjects: false }).replace(/^(\s*(?:- +|[^\n:#]+: +))=$/gm, '$1"="');
  return `${header}${body}`;
}

/** Lists files under dir (POSIX-style relative paths, sorted). */
export function listFiles(dir, base = dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...listFiles(p, base));
    else out.push(relative(base, p).split(sep).join("/"));
  }
  return out.sort();
}

export function writeFileEnsured(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

/** Writes a Map<relPath, string|Buffer> under dir; returns the paths whose bytes changed. */
export function writeTree(dir, files) {
  const changed = [];
  for (const [rel, content] of [...files.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const target = resolve(dir, rel);
    if (!target.startsWith(resolve(dir) + sep)) throw new Error(`path escapes ${dir}: ${rel}`);
    const bytes = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
    if (existsSync(target) && readFileSync(target).equals(bytes)) continue;
    writeFileEnsured(target, bytes);
    changed.push(rel);
  }
  return changed;
}

/** Atomic directory replace: build in `${target}.staging-<pid>`, then swap via rename. */
export function replaceDirAtomically(target, fill) {
  const staging = `${target}.staging-${process.pid}`;
  const old = `${target}.old-${process.pid}`;
  rmSync(staging, { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });
  fill(staging);
  if (existsSync(target)) renameSync(target, old);
  try {
    renameSync(staging, target);
  } catch (error) {
    if (existsSync(old)) renameSync(old, target);
    throw error;
  }
  rmSync(old, { recursive: true, force: true });
}

export function arg(name, def) {
  const args = process.argv.slice(2);
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
}
export function flag(name) {
  return process.argv.slice(2).includes(name);
}

/** Replaces exactly one occurrence of `find` in `text`; throws when it occurs 0 or >1 times (corrections are exact). */
export function replaceOnce(text, find, replacement, label) {
  const first = text.indexOf(find);
  if (first < 0) throw new Error(`correction ${label}: anchor not found: ${JSON.stringify(find.slice(0, 120))}`);
  if (text.indexOf(find, first + 1) >= 0) throw new Error(`correction ${label}: anchor not unique: ${JSON.stringify(find.slice(0, 120))}`);
  return text.slice(0, first) + replacement + text.slice(first + find.length);
}

export function uniqueSorted(values) {
  return [...new Set(values)].sort();
}
