/**
 * Query catalog generator (bks-query-catalog.v1) for the schema release.
 *
 *   buildCatalog({ releaseDir, sdlText, ddl, explain }) -> { catalog, text, report }
 *
 * Inputs (all inside the release dir, promoted from the frozen candidate):
 *   query-catalog/sources/patterns-by-question/*.md   final-SDL rewrites per question (FU-04), incl. OD-10 option A
 *   query-catalog/sources/query-patterns.md           canonical cross-domain patterns P-01..P-13
 *   query-catalog/sources/questions-catalog.md        the 454 distinct questions (value, polarity, answer kind, pattern refs)
 * `ddl` is the parsed ddl/ddl.json (or null), `explain` the parsed query-catalog/explain.json (or null).
 * Deterministic: no clock, sorted outputs, LF.
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { RELEASE_ID, orderedJson, sha256Hex } from "./common.mjs";

export const CATALOG_FORMAT = "bks-query-catalog.v1";
export const DEFAULT_LIMITS = { maxRows: 1000, timeoutMs: 15000, maxDepth: 5 };
const QID_RE = /\b(?:Q-(?:K|D\d{1,2})-\d{2}[a-z]?|CQ-[A-Z]{2}-\d{2}[a-z]?)\b/g;
const SOURCES = "query-catalog/sources";

const STATUS_MEANING =
  "supported: a release-validated template (static extraction from the final-SDL pattern sources plus EXPLAIN on the Neo4j 5.26 Community baseline with the required DDL applied); result assertions against fixtures are NOT run here (validation.resultAssertions = not_run) and S4 must add them before the read capability is advertised. " +
  "held: no release template yet (only a packet pattern written against the packet SDL, or a write/projection shape owned by the executor), or a template without an EXPLAIN result; S4 promotes. " +
  "unsupported: the template failed EXPLAIN, needs an optional capability absent from the core release (GDS, OD-22), or the question's pattern is broken by a ruling with no validated rewrite.";

// --------------------------------------------------------------------------------------------
// Cypher text helpers
// --------------------------------------------------------------------------------------------

/** Removes // comments and replaces string literal contents (keeps quotes) so keyword scans do not see them. */
export function codeOf(text) {
  let out = "";
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === "'" || c === '"') {
      const q = c;
      out += q;
      i++;
      while (i < text.length && text[i] !== q) {
        if (text[i] === "\\") i++;
        i++;
      }
      out += q;
      i++;
      continue;
    }
    if (c === "`") {
      const j = text.indexOf("`", i + 1);
      const end = j < 0 ? text.length : j + 1;
      out += text.slice(i, end);
      i = end;
      continue;
    }
    if (c === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/** Splits `s` at top-level commas (outside (), [], {}). */
function splitTopLevel(s, sep = ",") {
  const parts = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if ("([{".includes(ch)) depth++;
    if (")]}".includes(ch)) depth--;
    if (ch === sep && depth === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}

/** Index of the matching close bracket for the open bracket at `open`. */
function matchClose(s, open) {
  const pairs = { "(": ")", "[": "]", "{": "}" };
  const want = pairs[s[open]];
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === s[open]) depth++;
    else if (s[i] === want) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Top-level (depth 0) keyword positions in code. */
function topLevelKeywords(code, re) {
  const hits = [];
  let depth = 0;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    if ("([{".includes(ch)) depth++;
    else if (")]}".includes(ch)) depth--;
    else if (depth === 0) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (m && m.index === i && (i === 0 || !/[\w.$]/.test(code[i - 1]))) hits.push({ index: i, word: m[0].toUpperCase() });
    }
  }
  return hits;
}

function outputColumnsOf(code) {
  const returns = topLevelKeywords(code, /RETURN\b/iy);
  if (!returns.length) return [];
  const start = returns[returns.length - 1].index + "RETURN".length;
  const rest = code.slice(start);
  const stops = topLevelKeywords(rest, /(ORDER\s+BY|SKIP|LIMIT|UNION)\b/iy);
  const body = (stops.length ? rest.slice(0, stops[0].index) : rest).replace(/^\s*DISTINCT\b/i, "").replace(/;\s*$/, "");
  return splitTopLevel(body)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((p) => {
      const m = /\s+AS\s+(`[^`]+`|\w+)\s*$/i.exec(p);
      return m ? m[1].replace(/`/g, "") : p;
    });
}

function limitOf(code) {
  const hits = topLevelKeywords(code, /LIMIT\b/iy);
  if (!hits.length) return null;
  const m = /^LIMIT\s+(\d+|\$\w+)/i.exec(code.slice(hits[hits.length - 1].index));
  return m ? m[1] : null;
}

// --------------------------------------------------------------------------------------------
// Macros (```cypher-macros blocks: NAME(P1, P2) = body), expanded per source file before EXPLAIN
// --------------------------------------------------------------------------------------------

function parseMacros(text) {
  const macros = [];
  const re = /```cypher-macros\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text))) {
    let cur = null;
    for (const line of m[1].split("\n")) {
      const def = /^([A-Z][A-Z0-9_]*)\(([^)]*)\)\s*=\s*(.*)$/.exec(line);
      if (def) {
        if (cur) macros.push(cur);
        cur = { name: def[1], params: def[2].split(",").map((s) => s.trim()).filter(Boolean), body: [def[3]] };
      } else if (/^\/\//.test(line)) {
        if (cur) macros.push(cur);
        cur = null;
      } else if (cur) cur.body.push(line);
    }
    if (cur) macros.push(cur);
  }
  return macros.map((x) => ({ ...x, body: x.body.map((l) => l.replace(/\s+\/\/.*$/, "")).join("\n").trim() }));
}

function substituteParams(body, params, args) {
  let out = "";
  let i = 0;
  while (i < body.length) {
    const c = body[i];
    if (c === "'" || c === '"') {
      const j = body.indexOf(c, i + 1);
      out += body.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    const m = /^[A-Za-z_]\w*/.exec(body.slice(i));
    if (m) {
      const prev = i > 0 ? body[i - 1] : "";
      const k = params.indexOf(m[0]);
      out += k >= 0 && !/[.$:]/.test(prev) ? args[k] : m[0];
      i += m[0].length;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function expandMacros(statement, macros) {
  if (!macros.length) return { text: statement, used: [] };
  const used = new Set();
  let text = statement;
  for (let pass = 0; pass < 6; pass++) {
    let changed = false;
    for (const mac of macros) {
      const re = new RegExp(`(?<![\\w.$])${mac.name}\\(`, "g");
      let m;
      let out = "";
      let last = 0;
      while ((m = re.exec(text))) {
        const lineStart = text.lastIndexOf("\n", m.index) + 1;
        if (/\/\//.test(text.slice(lineStart, m.index))) continue; // inside a comment
        const open = m.index + mac.name.length;
        const close = matchClose(text, open);
        if (close < 0) continue;
        const args = splitTopLevel(text.slice(open + 1, close)).map((a) => a.trim());
        if (args.length !== mac.params.length) continue;
        out += text.slice(last, m.index) + substituteParams(mac.body, mac.params, args);
        last = close + 1;
        re.lastIndex = close + 1;
        used.add(mac.name);
        changed = true;
      }
      text = out + text.slice(last);
    }
    if (!changed) break;
  }
  return { text, used: [...used].sort() };
}

// --------------------------------------------------------------------------------------------
// Statement extraction
// --------------------------------------------------------------------------------------------

/** Splits a cypher block into statements: `// @id` lines start one, a code line ending in `;` ends one. */
function splitStatements(block) {
  const stmts = [];
  let cur = [];
  let curId = null;
  const hasCode = () => cur.some((l) => codeOf(l).trim());
  const flush = () => {
    if (hasCode()) stmts.push({ explicitId: curId, lines: cur });
    cur = [];
    curId = null;
  };
  for (const line of block.split("\n")) {
    const id = /^\s*\/\/\s*@id\s+(\S+)/.exec(line);
    if (id) {
      if (hasCode()) flush();
      curId = id[1];
    }
    cur.push(line);
    if (/;\s*$/.test(codeOf(line))) flush();
  }
  flush();
  return stmts.map((s) => {
    let text = s.lines.join("\n").replace(/\s+$/, "");
    text = text.replace(/;\s*$/, "");
    // keep trailing comment-only lines out of the statement end
    return { explicitId: s.explicitId, text };
  });
}

function blockMarker(block) {
  const m = /^\s*\/\/\s*@(gds|ddl)\b\s*(\S*)/m.exec(block);
  return m ? { marker: m[1], id: m[2] && /^[A-Z]/.test(m[2]) ? m[2] : null } : null;
}

function classify(code) {
  if (/^\s*CREATE\s+(CONSTRAINT|(?:FULLTEXT\s+|VECTOR\s+|RANGE\s+|TEXT\s+|POINT\s+|LOOKUP\s+)?INDEX)\b/i.test(code)) return "ddl";
  if (/\bCALL\s+gds\./i.test(code)) return "gds";
  if (/\bgds\.graph\.project\s*\(/i.test(code)) return "gds-projection";
  if (/(?<![\w.$])(CREATE|MERGE|SET|DELETE|REMOVE)\b/.test(code)) return "write";
  return "read";
}

/** Markdown sections: { heading, level, start, end }. */
function sectionsOf(text) {
  const lines = text.split("\n");
  const heads = [];
  let offset = 0;
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) inFence = !inFence;
    if (!inFence) {
      const m = /^(#{2,3})\s+(.*)$/.exec(line);
      if (m) heads.push({ level: m[1].length, heading: m[2].trim(), start: offset });
    }
    offset += line.length + 1;
  }
  return heads.map((h, i) => {
    const next = heads.slice(i + 1).find((x) => x.level <= h.level);
    return { ...h, end: next ? next.start : text.length };
  });
}

function slug(heading) {
  return heading.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
}

const truncate = (s, n = 600) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** Bullet lines ("- key: ...") in a text span, grouped into notes. */
function bulletNotes(span) {
  const temporal = [];
  const evidence = [];
  const notes = [];
  const prior = [];
  for (const raw of span.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("- ")) continue;
    const body = line.slice(2).trim();
    const key = (/^\**([A-Za-z][\w /().-]*?)\**\s*:/.exec(body)?.[1] ?? "").toLowerCase();
    if (/^(trace|answer kind)/.test(key)) evidence.push(truncate(body));
    else if (/bitemporal|as-of|as of|as-recorded|refresh|temporal/.test(key)) temporal.push(truncate(body));
    else if (/^(explain|validation)/.test(key)) prior.push(truncate(body, 300));
    else if (/ruling|status|what changed|how the question|^rulings/.test(key)) notes.push(truncate(body, 400));
  }
  return { temporal, evidence, notes, prior };
}

// --------------------------------------------------------------------------------------------
// Parameters
// --------------------------------------------------------------------------------------------

/** Temporal parameters bind a Neo4j DateTime (driver temporal value), not a string: the planner type-checks them. */
const TEMPORAL = {
  type: "string",
  format: "date-time",
  neo4jType: "DateTime",
  description: "bind as a Neo4j DateTime (driver temporal type); an ISO string is rejected where the statement compares it with stored DateTime values",
};

function inferParameters(text, code) {
  const params = {};
  const hints = {};
  for (const m of text.matchAll(/@param\s+(\w+)\s*:\s*(\w+)/g)) hints[m[1]] = m[2].toLowerCase();
  const names = [...new Set([...code.matchAll(/\$([A-Za-z_]\w*)/g)].map((m) => m[1]))].sort();
  for (const name of names) {
    const esc = name.replace(/\$/g, "");
    const near = (re) => re.test(code);
    let p;
    const hint = hints[name];
    if (hint) {
      if (hint === "datetime") p = { ...TEMPORAL, inferredFrom: "@param hint" };
      else if (hint === "strings" || hint === "list") p = { type: "array", items: /Uids$/.test(name) ? { type: "string", pattern: "^hu:" } : { type: "string" }, inferredFrom: "@param hint" };
      else p = { type: { bool: "boolean", boolean: "boolean", int: "integer", integer: "integer", float: "number", number: "number" }[hint] ?? "string", inferredFrom: "@param hint" };
    } else if (/embedding/i.test(name)) p = { type: "array", items: { type: "number" }, description: "embedding vector (model/dimensions per the selected profile)", inferredFrom: "name" };
    else if (name === "rows") p = { type: "array", items: { type: "object" }, inferredFrom: "name" };
    else if (near(new RegExp(`\\bIN\\s+\\$${esc}\\b`, "i")) || /(Uids|Keys|Predicates|Labels|List|Set|Kinds|Ids)$/.test(name))
      p = { type: "array", items: /Uids$/.test(name) ? { type: "string", pattern: "^hu:" } : { type: "string" }, inferredFrom: "IN / plural name" };
    else if (/^(limit|k|topK|top|n|maxHops|depth|months|days|years|minCount|window|windowMonths|skip|offset)$/i.test(name) || near(new RegExp(`\\b(LIMIT|SKIP)\\s+\\$${esc}\\b`, "i")))
      p = { type: "integer", minimum: 0, inferredFrom: "name / LIMIT" };
    else if (/^(asOf|validAt|V|V1|V2|R|R1|R2|rt|vt|recAt|at|since|until|computedAt|staleAfter|from|to|start|end|startAt|endAt)$/.test(name) || /(At|Date|Time)$/.test(name) || near(new RegExp(`(datetime|date)\\(\\s*\\$${esc}\\s*\\)`, "i")))
      p = { ...TEMPORAL, inferredFrom: "temporal name" };
    else if (/^(is|has|include|only|human|diagnostic)[A-Z]|Only$/.test(name) || near(new RegExp(`(\\bAND|\\bOR|\\bWHERE|\\bNOT)\\s+\\$${esc}\\b(?!\\s*(=|<|>|IN\\b|IS\\b|STARTS))`)))
      p = { type: "boolean", inferredFrom: "boolean use / name" };
    else if (/^(threshold|minScore|score|weight|cutoff)$/i.test(name)) p = { type: "number", inferredFrom: "name" };
    else if (/[Uu]id$/.test(name) || near(new RegExp(`uid\\s*[:=]\\s*\\$${esc}\\b`)) || ["entity", "package", "label", "assertion", "product", "substance", "material", "frontier", "claim", "report", "person", "organization", "study"].includes(name))
      p = { type: "string", pattern: "^hu:", inferredFrom: "uid lookup" };
    else p = { type: "string", inferredFrom: "default" };
    params[name] = p;
  }
  return params;
}

/** Dummy binding for EXPLAIN; `temporal(iso)` builds a driver DateTime for neo4jType DateTime parameters. */
export function dummyValue(p, temporal = null) {
  switch (p.type) {
    case "boolean":
      return false;
    case "integer":
      return 10;
    case "number":
      return 0.5;
    case "array":
      if (p.items?.type === "number") return [0.1, 0.2, 0.3];
      if (p.items?.type === "object") return [];
      return [p.items?.pattern ? "hu:explain:x" : "x"];
    default:
      if (p.format === "date-time") return temporal ? temporal("2026-01-01T00:00:00Z") : "2026-01-01T00:00:00Z";
      if (p.pattern) return "hu:explain:x";
      return "x";
  }
}

// --------------------------------------------------------------------------------------------
// Required indexes
// --------------------------------------------------------------------------------------------

function bindingsOf(code) {
  const nodeLabels = new Map();
  const nodeProps = new Map();
  const relTypes = new Map();
  const relProps = new Map();
  const add = (map, k, vals) => {
    const s = map.get(k) ?? new Set();
    for (const v of vals) s.add(v);
    map.set(k, s);
  };
  for (const m of code.matchAll(/\(\s*(\w*)\s*((?::\s*`?\w+`?\s*(?:\|\s*`?\w+`?\s*)*)*)\s*(\{[^{}]*\})?\s*\)/g)) {
    const v = m[1] || `_anon${m.index}`;
    const labels = (m[2] || "").split(/[:|]/).map((s) => s.replace(/`/g, "").trim()).filter(Boolean);
    if (labels.length) add(nodeLabels, v, labels);
    if (m[3]) add(nodeProps, v, [...m[3].matchAll(/(\w+)\s*:/g)].map((x) => x[1]));
  }
  for (const m of code.matchAll(/\[\s*(\w*)\s*:\s*([\w|`]+)\s*(?:\*[\d.]*)?\s*(\{[^{}]*\})?\s*\]/g)) {
    const v = m[1] || `_anonr${m.index}`;
    add(relTypes, v, m[2].split("|").map((s) => s.replace(/`/g, "").trim()));
    if (m[3]) add(relProps, v, [...m[3].matchAll(/(\w+)\s*:/g)].map((x) => x[1]));
  }
  for (const m of code.matchAll(/\b(\w+):(\w+)\b(?!\s*[\]{])/g)) if (nodeLabels.has(m[1])) add(nodeLabels, m[1], [m[2]]);
  for (const m of code.matchAll(/\b(\w+)\.(\w+)\s*(=|<>|<=|>=|<|>|IN\b|STARTS\s+WITH)/gi)) {
    if (nodeLabels.has(m[1])) add(nodeProps, m[1], [m[2]]);
    if (relTypes.has(m[1])) add(relProps, m[1], [m[2]]);
  }
  return { nodeLabels, nodeProps, relTypes, relProps };
}

function requiredIndexesOf(code, ddlEntries) {
  const names = new Set();
  const unresolved = new Set();
  const ddlNames = new Set(ddlEntries.map((e) => e.name));
  const { nodeLabels, nodeProps, relTypes, relProps } = bindingsOf(code);
  const want = (name) => {
    if (!ddlEntries.length || ddlNames.has(name)) names.add(name);
    else unresolved.add(name);
  };
  for (const [v, labels] of nodeLabels) {
    const props = nodeProps.get(v) ?? new Set();
    if (props.has("uid")) for (const l of labels) want(l === "Entity" ? "entity_uid" : `uid_${l}`);
    for (const e of ddlEntries) {
      if (e.entity === "RELATIONSHIP" || !e.properties?.length) continue;
      if (/FULLTEXT|VECTOR/i.test(e.type ?? "")) continue;
      if (e.labelsOrTypes?.some((l) => labels.has(l)) && props.has(e.properties[0])) names.add(e.name);
    }
  }
  for (const [v, types] of relTypes) {
    const props = relProps.get(v) ?? new Set();
    for (const e of ddlEntries) {
      if (e.entity !== "RELATIONSHIP" || !e.properties?.length) continue;
      if (e.labelsOrTypes?.some((t) => types.has(t)) && props.has(e.properties[0])) names.add(e.name);
    }
  }
  if (/\{\s*uid\s*:\s*\w+\.assertionUid\s*\}/.test(code)) want("uid_Assertion");
  for (const m of code.matchAll(/db\.index\.(?:fulltext|vector)\.query(?:Nodes|Relationships)\(\s*'([^']+)'/g)) want(m[1]);
  // the vector/fulltext names are string literals; codeOf blanks string contents, so scan raw text separately by caller
  return { names, unresolved };
}

function procedureIndexNames(text) {
  return [...text.matchAll(/db\.index\.(?:fulltext|vector)\.query(?:Nodes|Relationships)\(\s*'([^']+)'/g)].map((m) => m[1]);
}

// --------------------------------------------------------------------------------------------
// Questions catalog
// --------------------------------------------------------------------------------------------

function parseQuestions(text) {
  const start = text.indexOf("## By domain (master table)");
  const end = text.indexOf("## Synthesis effects on questions");
  const body = text.slice(start, end < 0 ? text.length : end);
  const questions = new Map();
  const aliases = new Map();
  let packet = null;
  for (const line of body.split("\n")) {
    const h = /^###\s+(K|D\d{1,2}):/.exec(line);
    if (h) {
      packet = h[1];
      continue;
    }
    if (!line.startsWith("| **")) continue;
    const cells = splitRow(line);
    const idCell = cells[0];
    const id = /\*\*([^*]+)\*\*/.exec(idCell)?.[1]?.trim();
    if (!id) continue;
    const packetId = /\(packet id ([^)]+)\)/.exec(idCell)?.[1]?.trim();
    if (packetId && packetId !== id) {
      const a = aliases.get(packetId) ?? { alias: packetId, canonical: [], kind: "split", source: `${SOURCES}/questions-catalog.md (R-08 split; FU-10)`, packets: [] };
      if (!a.canonical.includes(id)) a.canonical.push(id);
      if (!a.packets.includes(packet)) a.packets.push(packet);
      aliases.set(packetId, a);
    }
    const existing = questions.get(id);
    if (existing) {
      if (!existing.packets.includes(packet)) existing.packets.push(packet);
      continue;
    }
    const [, question, audience, value, polarity, kind, pattern, fixture, survived] = cells;
    const kindText = (kind ?? "").replace(/⚑/g, "").trim();
    const answerKind = (kindText.includes("→") ? kindText.split("→")[1] : kindText).replace(/\+ published variant/, "").replace(/[*()]/g, "").trim().split(/\s+/)[0] || null;
    questions.set(id, {
      id,
      module: packet,
      packets: [packet],
      ...(packetId && packetId !== id ? { packetId } : {}),
      question: truncate((question ?? "").trim(), 400),
      audience: (audience ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      value: Number.parseInt(value, 10) || null,
      polarity: (polarity ?? "").trim() || null,
      answerKind,
      publishedVariant: /published variant/.test(kindText),
      fixture: /^yes/.test((fixture ?? "").trim()),
      patternRefs: [...(pattern ?? "").matchAll(/`([^`]+)`/g)].map((m) => m[1]),
      survived: truncate((survived ?? "").trim(), 240),
      extends: [...(question ?? "").matchAll(/extends (CQ-FL-C0\d)/g)].map((m) => m[1]),
      reuses: [...new Set([...(question ?? "").matchAll(/\(reuses ([^;)]*)/g)].flatMap((m) => m[1].match(QID_RE) ?? []))].sort(),
    });
  }
  return { questions, aliases };
}

function splitRow(line) {
  const cells = [];
  let cur = "";
  let tick = false;
  for (let i = 1; i < line.length; i++) {
    const ch = line[i];
    if (ch === "`") tick = !tick;
    if (ch === "|" && !tick && line[i - 1] !== "\\") {
      cells.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  return cells;
}

// --------------------------------------------------------------------------------------------
// Main
// --------------------------------------------------------------------------------------------

export function extractTemplates(releaseDir) {
  const dir = resolve(releaseDir, SOURCES);
  const files = [
    ...readdirSync(resolve(dir, "patterns-by-question"))
      .filter((f) => f.endsWith(".md"))
      .sort((a, b) => moduleOrder(a) - moduleOrder(b))
      .map((f) => ({ key: f.replace(/\.md$/, ""), rel: `patterns-by-question/${f}` })),
    { key: "QP", rel: "query-patterns.md" },
  ];
  const templates = [];
  const skipped = [];
  for (const { key, rel } of files) {
    const text = readFileSync(resolve(dir, rel), "utf8").replace(/\r\n/g, "\n");
    const macros = parseMacros(text);
    const sections = sectionsOf(text);
    const gTable = key === "QP" ? gdsTable(text) : new Map();
    const re = /```cypher\n([\s\S]*?)```/g;
    let m;
    const seenIds = new Map();
    const blocks = [];
    while ((m = re.exec(text))) blocks.push({ body: m[1], start: m.index, end: m.index + m[0].length });
    blocks.forEach((blk, bi) => {
      const sec = [...sections].filter((s) => s.level === 2 && s.start <= blk.start && s.end > blk.start).pop();
      const heading = sec?.heading ?? "";
      const headingQid = /^((?:Q|CQ)-[A-Z0-9-]+?[a-z]?)(?:\s|$)/.exec(heading)?.[1] ?? null;
      const sectionKey = key === "QP" ? /^(P-\d{2}|\d+\.)/.exec(heading)?.[1] ?? slug(heading) : headingQid ?? slug(heading);
      const sectionQuestions = key === "QP" ? [...new Set((/^Questions:\s*(.*)$/m.exec(text.slice(sec?.start ?? 0, sec?.end ?? 0))?.[1] ?? "").match(QID_RE) ?? [])] : headingQid ? [headingQid] : [];
      const preamble = text.slice(sec?.start ?? 0, blocks.filter((b) => b.start >= (sec?.start ?? 0))[0]?.start ?? blk.start);
      const afterEnd = Math.min(blocks[bi + 1]?.start ?? text.length, sec?.end ?? text.length);
      const after = text.slice(blk.end, afterEnd);
      const marker = blockMarker(blk.body);
      if (marker?.marker === "ddl") {
        skipped.push({ source: `${SOURCES}/${rel}#${slug(heading)}`, reason: "DDL block (owned by ddl/ddl.json)" });
        return;
      }
      const stmts = splitStatements(blk.body);
      stmts.forEach((st, si) => {
        let local;
        if (st.explicitId) local = st.explicitId;
        else {
          const base = marker?.id ?? sectionKey;
          local = `${base}#${countSection(templates, key, base) + 1}`;
        }
        let id = `${key}/${local}`;
        const n = (seenIds.get(id) ?? 0) + 1;
        seenIds.set(id, n);
        if (n > 1) id = `${id}.${n}`;
        const expanded = expandMacros(st.text, macros);
        const code = codeOf(expanded.text);
        const kind = classify(code);
        if (kind === "ddl") {
          skipped.push({ source: `${SOURCES}/${rel}#${slug(heading)}`, reason: "DDL statement (owned by ddl/ddl.json)" });
          return;
        }
        const idBase = local.split("#")[0];
        let questionIds = sectionQuestions;
        if (key !== "QP" && /^(?:Q|CQ)-/.test(idBase)) questionIds = [idBase];
        if (key === "QP" && gTable.has(idBase)) questionIds = gTable.get(idBase);
        const notes = bulletNotes(after);
        const pre = key === "QP" ? { notes: [], temporal: [], evidence: [], prior: [] } : bulletNotes(preamble);
        templates.push({
          id,
          sourceKey: key,
          rel,
          heading,
          kind,
          markers: marker?.marker === "gds" ? ["gds"] : [],
          questionIds: [...new Set(questionIds)].sort(),
          sourceText: st.text,
          statement: expanded.text,
          macros: expanded.used,
          code,
          notes: [...pre.notes, ...notes.notes],
          temporalNotes: [...pre.temporal, ...notes.temporal],
          evidenceNotes: [...pre.evidence, ...notes.evidence],
          priorValidation: notes.prior,
        });
      });
    });
  }
  return { templates, skipped };
}

function countSection(templates, key, local) {
  return templates.filter((t) => t.sourceKey === key && t.id.startsWith(`${key}/${local}#`)).length;
}

function moduleOrder(f) {
  const b = f.replace(/\.md$/, "");
  if (b === "K") return 0;
  const m = /^D(\d+)$/.exec(b);
  return m ? Number(m[1]) : 99;
}

/** P-13 table: G-n -> question ids. */
function gdsTable(text) {
  const out = new Map();
  for (const line of text.split("\n")) {
    const m = /^\|\s*(G-\d+)\s*\|\s*([^|]+)\|/.exec(line);
    if (m) out.set(m[1], [...new Set(m[2].match(QID_RE) ?? [])]);
  }
  return out;
}

/** BM-07: the W05 food competency candidates CQ-FL-C01..C05 promoted to numbered CQ-FL-0n (bijective). */
function foodAliases(questions) {
  const extendedBy = new Map();
  for (const q of questions.values()) for (const e of q.extends) extendedBy.set(e, [...(extendedBy.get(e) ?? []), q.id].sort());
  return [1, 2, 3, 4, 5].map((n) => ({
    alias: `CQ-FL-C0${n}`,
    canonical: [`CQ-FL-0${n}`],
    kind: "renumbered",
    extendedBy: extendedBy.get(`CQ-FL-C0${n}`) ?? [],
    source:
      "BM-07 (DECISIONS.md); candidates in biotech-meta ontology-lab/final-proposal-team/run-2026-10-04-fable51-01/workers/W05/02-cq-coverage.md; D12 rows say 'extends CQ-FL-C0n' (packets/D12/02-questions.md, OQ-D12-14). The CQ-FL-0n ids are the supported catalog ids; competency-questions.md gains them when biotech-meta records the promotion.",
  }));
}

const KNOWN_GAPS = {
  "Q-D9-19":
    "MD-D9-03(c): the question weights retellings by accepted RETELLING_FIDELITY matches (deduplicated) as well as DERIVED_FROM; this statement counts DERIVED_FROM only. Not rewritten here (needs a validated statement); the D9 owner's choice.",
  "Q-D9-02":
    "MD-D9-03(d): the <= 4-hop organization path cannot reach a SELLER_OF_RECORD through MerchantListing -> Offer (5 hops) or a predicate-only maker (R-68); the final P-09 bounded `behind` path set (QP/P-09) replaces the hard 4-hop interest assumption for those cases.",
};

export function buildCatalog({ releaseDir, sdlText = null, ddl = null, explain = null, releaseId = RELEASE_ID, capabilityGates = null, catalogPatch = null, questionStatus = null }) {
  const dir = resolve(releaseDir, SOURCES);
  const qtext = readFileSync(resolve(dir, "questions-catalog.md"), "utf8").replace(/\r\n/g, "\n");
  const { questions, aliases: splitAliases } = parseQuestions(qtext);
  const { templates: extracted, skipped } = extractTemplates(releaseDir);
  // v2.0.2+: the reads role's (S4) catalog patch: corrected statements replace released ones only when the released
  // statement digest matches; proposed templates are added. Questions take S4's executed status (questionStatus).
  const raw = catalogPatch ? applyCatalogPatch(extracted, catalogPatch.patch, catalogPatch.path) : extracted;
  const s4Outcome = new Map();
  if (questionStatus) for (const q of questionStatus.status.questions) for (const x of q.templates ?? []) s4Outcome.set(x.id, x.outcome);
  if (catalogPatch) for (const p of catalogPatch.patch.proposedTemplates ?? []) if (/^supported/.test(p.status)) s4Outcome.set(p.id, `executed: ${p.status.replace(/^supported\s*/, "").replace(/^\(|\)$/g, "")}`);
  const ddlEntries = (ddl?.statements ?? ddl?.entries ?? []).map((e) => ({ ...e, entity: (e.entity ?? e.entityType ?? "NODE").toUpperCase() }));
  const sdlNames = sdlText ? new Set([...sdlText.matchAll(/^\s*(?:type|interface|union|enum)\s+(\w+)/gm)].map((m) => m[1])) : null;
  const splitByAlias = new Map([...splitAliases.values()].map((a) => [a.alias, a]));

  const templates = [];
  const unknownQuestionRefs = new Set();
  for (const t of raw) {
    // resolve split ids (CQ-PF-03 -> CQ-PF-03a (D8) / CQ-PF-03b (D6)) by the source module
    const questionIds = t.questionIds.flatMap((q) => {
      if (questions.has(q)) return [q];
      const a = splitByAlias.get(q);
      if (a) {
        const byPacket = a.canonical.filter((c) => questions.get(c)?.module === t.sourceKey);
        return byPacket.length ? byPacket : a.canonical;
      }
      unknownQuestionRefs.add(q);
      return [];
    });
    const params = inferParameters(t.statement, t.code);
    const idx = requiredIndexesOf(t.code, ddlEntries);
    for (const n of procedureIndexNames(t.statement)) (ddlEntries.length && !ddlEntries.some((e) => e.name === n) ? idx.unresolved : idx.names).add(n);
    const lim = limitOf(t.code);
    const ex = explain?.results?.[t.id] ?? null;
    const digest = sha256Hex(t.statement);
    let explainState = "not_run";
    if (ex) explainState = ex.statementDigest !== digest ? "stale" : ex.ok ? "ok" : ex.skipped ? "skipped" : "failed";
    let status;
    let reason;
    if (t.kind === "gds" || t.kind === "gds-projection") {
      status = "unsupported";
      reason = "requires GDS, an optional analytics capability absent from the core release (OD-22); the projection source query is EXPLAIN-checked where it can be rewritten, algorithm/drop calls are not validated";
    } else if (t.kind === "write") {
      status = "held";
      reason = "write shape (projection/apply); writes run only through the executor apply path under KsIntentMarker (S3), not as a catalog read";
    } else if (explainState === "ok") {
      status = "supported";
      reason = "EXPLAIN ok on the release baseline; result assertions not run (S4)";
    } else if (explainState === "failed") {
      status = "unsupported";
      reason = `EXPLAIN failed: ${ex.error}`;
    } else {
      status = "held";
      reason = explainState === "stale" ? "explain result is for different statement bytes (re-run explain-catalog)" : "no EXPLAIN result";
    }
    // v2.0.2+: a template that needs an optional, disabled capability index (e.g. OD-44 native vectors) is unsupported.
    const requires = capabilityGates ? [...new Set([...idx.names].map((n) => capabilityGates[n]).filter(Boolean))].sort() : [];
    if (requires.length) {
      status = "unsupported";
      reason = `requires the optional capability ${requires.join(", ")} (disabled in this release: its index is optional and not installed); EXPLAIN ${explainState} on a database where the index exists`;
    }
    const knownGaps = questionIds.filter((q) => KNOWN_GAPS[q]).map((q) => KNOWN_GAPS[q]);
    const stored = storedLabelsOf(sdlText);
    const usedLabels = new Set([...bindingsOf(t.code).nodeLabels.values()].flatMap((x) => [...x]));
    const labelsNotStored = stored ? [...usedLabels].filter((l) => !stored.has(l)).sort() : [];
    if (labelsNotStored.length && status === "supported") {
      status = "held";
      reason = `EXPLAIN ok but the statement matches non-stored label(s) ${labelsNotStored.join(", ")}; needs a rewrite (S4) before it can be supported`;
    }
    if (labelsNotStored.length) knownGaps.push(`matches label(s) ${labelsNotStored.join(", ")} that no @node stores (interface/union names are not stored labels; Subjectable implementers carry Entity): the statement plans but returns no rows on a v2 graph until rewritten`);
    const missingTypes = sdlNames ? [...new Set([...t.code.matchAll(/:\s*([A-Z]\w+)/g)].map((m) => m[1]))].filter((l) => !sdlNames.has(l) && !["Entity", "Occurrence", "InformationArtifact", "EvidenceAssessment"].includes(l) && !/^[A-Z_]+$/.test(l)) : [];
    templates.push({
      id: t.id,
      questionIds,
      module: t.sourceKey === "QP" ? "cross" : t.sourceKey,
      language: "CYPHER_5",
      statementKind: t.kind,
      statement: t.statement,
      statementDigest: `sha256:${digest}`,
      ...(t.macros.length ? { macrosExpanded: t.macros, sourceStatementDigest: `sha256:${sha256Hex(t.sourceText)}` } : {}),
      parameters: params,
      outputColumns: outputColumnsOf(t.code),
      limits: { ...DEFAULT_LIMITS, ...(lim ? { maxRows: /^\d+$/.test(lim) ? Math.min(Number(lim), DEFAULT_LIMITS.maxRows) : DEFAULT_LIMITS.maxRows, statementLimit: lim } : {}) },
      requiredIndexes: [...idx.names].sort(),
      ...(idx.unresolved.size ? { unresolvedIndexes: [...idx.unresolved].sort() } : {}),
      temporalNotes: t.temporalNotes,
      evidenceNotes: t.evidenceNotes,
      ...(t.notes.length ? { notes: t.notes } : {}),
      ...(knownGaps.length ? { knownGaps } : {}),
      ...(missingTypes.length ? { labelsNotInSdl: missingTypes.sort() } : {}),
      ...(labelsNotStored.length ? { labelsNotStored } : {}),
      source: `${SOURCES}/${t.rel}#${slug(t.heading)}`,
      status,
      reason,
      ...(requires.length ? { requires } : {}),
      validation: {
        explain: explainState,
        ...(explain?.neo4j ? { neo4j: `${explain.neo4j.version} ${explain.neo4j.edition}` } : {}),
        ...(ex?.error ? { error: ex.error } : {}),
        ...(ex?.skipped ? { skipped: ex.skipped } : {}),
        ...(ex?.explainedForm ? { explainedForm: ex.explainedForm } : {}),
        ...(ex?.planFlags?.length ? { planFlags: ex.planFlags } : {}),
        ...(t.priorValidation.length ? { prior: t.priorValidation } : {}),
        resultAssertions: s4Outcome.get(t.id) ?? "not_run",
        ...(s4Outcome.has(t.id) ? { resultAssertionsSource: questionStatus?.path ?? catalogPatch?.path } : {}),
      },
      ...(t.patch ? { patch: t.patch } : {}),
    });
  }

  // a question whose catalog pattern column cites a query-patterns.md section (`final/query-patterns.md#p-NN-...`)
  // is served by that section's templates
  for (const q of questions.values()) {
    for (const ref of q.patternRefs) {
      const m = /query-patterns\.md#p-(\d{2})/.exec(ref);
      if (!m) continue;
      for (const t of templates) if (t.module === "cross" && t.id.startsWith(`QP/P-${m[1]}`) && !t.questionIds.includes(q.id)) t.questionIds = [...t.questionIds, q.id].sort();
    }
  }
  const byQuestion = new Map();
  for (const t of templates) for (const q of t.questionIds) byQuestion.set(q, [...(byQuestion.get(q) ?? []), t]);

  const questionRows = [...questions.values()]
    .sort((a, b) => moduleOrder(`${a.module}.md`) - moduleOrder(`${b.module}.md`) || qOrder(a.id) - qOrder(b.id) || a.id.localeCompare(b.id))
    .map((q) => {
      const ts = byQuestion.get(q.id) ?? [];
      const brokenPacket = /pattern broken/.test(q.survived);
      let status;
      let reason;
      if (ts.some((t) => t.status === "supported")) {
        status = "supported";
        reason = `release template(s) ${ts.filter((t) => t.status === "supported").map((t) => t.id).join(", ")} EXPLAIN ok; result assertions not run (S4)`;
      } else if (ts.length) {
        const needsGds = ts.some((t) => t.statementKind === "gds" || t.statementKind === "gds-projection");
        status = !needsGds && ts.some((t) => t.status === "held") ? "held" : "unsupported";
        reason = ts.map((t) => `${t.id}: ${t.reason}`).join("; ");
      } else if (brokenPacket) {
        status = "unsupported";
        reason = "packet pattern broken by a ruling and no validated final-SDL rewrite in the release sources";
      } else {
        status = "held";
        const packetRef = q.patternRefs.find((r) => r.startsWith("packets/"));
        reason = packetRef
          ? `packet pattern only (${packetRef}), valid against the final SDL per the FU-04 lint; S4 promotes it into the release catalog with result assertions`
          : `no release template; catalog pattern reference ${q.patternRefs.join(", ") || "none"}`;
      }
      const { extends: ext, reuses, ...rest } = q;
      if (reuses.length) rest.reuses = reuses;
      return {
        ...rest,
        ...(ext.length ? { extends: ext.map((e) => e.replace("C0", "0")) } : {}),
        templates: ts.map((t) => t.id).sort(),
        ...s4Status(q.id, ts, status, reason, questionStatus, catalogPatch),
        ...(KNOWN_GAPS[q.id] ? { knownGaps: [KNOWN_GAPS[q.id]] } : {}),
      };
    });

  // 0.2.0 competency ids that packet rows reuse ("(reuses CQ-...)") and that are not catalog questions themselves
  // resolve to the reusing questions (KN-12: CQ-PV-01 is answered by Q-K-01 / P-01).
  const reusedBy = new Map();
  for (const q of questions.values()) for (const r of q.reuses) if (!questions.has(r) && !splitByAlias.has(r)) reusedBy.set(r, [...(reusedBy.get(r) ?? []), q.id]);
  const reuseAliases = [...reusedBy].map(([alias, canonical]) => ({
    alias,
    canonical: [...new Set(canonical)].sort(),
    kind: "reused",
    source: `${SOURCES}/questions-catalog.md: question rows that say "(reuses ${alias})" (biotech-meta ontology-lab/competency-questions.md 0.2.0 id)`,
  }));
  const aliasRows = [...reuseAliases, ...[...splitAliases.values()].map((a) => ({ ...a, canonical: [...a.canonical].sort(), packets: [...a.packets].sort() })), ...foodAliases(questions)].sort((a, b) => a.alias.localeCompare(b.alias));

  const count = (rows, key) => rows.reduce((acc, r) => ((acc[r[key]] = (acc[r[key]] ?? 0) + 1), acc), {});
  const sortObj = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
  const counts = {
    questions: questionRows.length,
    questionsByStatus: sortObj(count(questionRows, "status")),
    valueOneByStatus: sortObj(count(questionRows.filter((q) => q.value === 1), "status")),
    templates: templates.length,
    templatesByStatus: sortObj(count(templates, "status")),
    templatesByKind: sortObj(count(templates, "statementKind")),
    templatesByExplain: sortObj(templates.reduce((a, t) => ((a[t.validation.explain] = (a[t.validation.explain] ?? 0) + 1), a), {})),
    aliases: aliasRows.length,
  };
  const catalog = {
    format: CATALOG_FORMAT,
    releaseId,
    language: "CYPHER_5",
    neo4jBaseline: "5.26",
    defaults: { limits: DEFAULT_LIMITS },
    statusMeaning: questionStatus ? `questions: ${questionStatus.status.statusMeaning} Templates: supported = EXPLAIN ok on the release baseline with the required DDL (validation.resultAssertions carries the S4 executed outcome per template).` : STATUS_MEANING,
    ...(questionStatus ? { questionStatusSource: { path: questionStatus.path, releaseId: questionStatus.status.releaseId, queryCatalogDigest: questionStatus.status.queryCatalogDigest, stamp: questionStatus.status.stamp } } : {}),
    ...(catalogPatch ? { catalogPatchSource: { path: catalogPatch.path, format: catalogPatch.patch.format, baseRelease: catalogPatch.patch.baseRelease, baseQueryCatalogDigest: catalogPatch.patch.baseQueryCatalogDigest, corrections: catalogPatch.patch.corrections.length, proposedTemplates: (catalogPatch.patch.proposedTemplates ?? []).length } } : {}),
    sources: [`${SOURCES}/patterns-by-question/*.md`, `${SOURCES}/query-patterns.md`, `${SOURCES}/questions-catalog.md`],
    counts,
    questions: questionRows,
    templates: [...templates].sort((a, b) => tOrder(a.id) - tOrder(b.id) || a.id.localeCompare(b.id)),
    aliases: aliasRows,
  };
  const byModule = {};
  for (const q of questionRows) {
    byModule[q.module] ??= {};
    byModule[q.module][q.status] = (byModule[q.module][q.status] ?? 0) + 1;
  }
  const report = {
    counts,
    byModule: sortObj(byModule),
    unresolvedIndexes: sortObj(Object.fromEntries(templates.filter((t) => t.unresolvedIndexes).map((t) => [t.id, t.unresolvedIndexes]))),
    templatesWithoutQuestion: templates.filter((t) => !t.questionIds.length).map((t) => t.id),
    unknownQuestionRefs: [...unknownQuestionRefs].sort(),
    explainFailed: templates.filter((t) => t.validation.explain === "failed").map((t) => ({ id: t.id, error: t.validation.error })),
    labelsNotStored: sortObj(Object.fromEntries(templates.filter((t) => t.labelsNotStored).map((t) => [t.id, t.labelsNotStored]))),
    labelsNotInSdl: sortObj(Object.fromEntries(templates.filter((t) => t.labelsNotInSdl).map((t) => [t.id, t.labelsNotInSdl]))),
    skippedBlocks: skipped,
    questionsWithoutTemplate: questionRows.filter((q) => !q.templates.length).length,
  };
  return { catalog, text: orderedJson(catalog), report };
}

/** Stored node labels of the SDL: @node(labels: [...]) or the type name; plus the operational Ks* labels. */
function storedLabelsOf(sdlText) {
  if (!sdlText) return null;
  const out = new Set(["KsWriteFence", "KsIntentMarker", "KsReleaseMarker"]);
  const re = /^type\s+(\w+)[^{]*?@node(\(\s*labels:\s*\[([^\]]*)\])?/gm;
  let m;
  while ((m = re.exec(sdlText))) {
    if (m[3]) for (const l of m[3].matchAll(/"(\w+)"/g)) out.add(l[1]);
    else out.add(m[1]);
  }
  return out;
}

function qOrder(id) {
  const m = /^Q-(K|D(\d+))-/.exec(id);
  if (m) return m[1] === "K" ? 0 : Number(m[2]);
  return 50;
}
function tOrder(id) {
  const k = id.split("/")[0];
  if (k === "K") return 0;
  if (k === "QP") return 100;
  return Number(k.slice(1)) || 99;
}

/** Applies a bks-s4-catalog-patch.v1: corrections must name a released template by id and statement digest. */
function applyCatalogPatch(templates, patch, path) {
  const byId = new Map(templates.map((x) => [x.id, x]));
  const out = templates.map((x) => ({ ...x }));
  const index = new Map(out.map((x, i) => [x.id, i]));
  for (const c of patch.corrections) {
    const cur = byId.get(c.id);
    if (!cur) throw new Error(`catalog patch: correction ${c.id} names no released template`);
    const released = `sha256:${sha256Hex(cur.statement)}`;
    if (released !== c.releasedStatementDigest) throw new Error(`catalog patch: ${c.id} released digest ${c.releasedStatementDigest} != ${released}`);
    if (c.statementDigest && c.statementDigest !== `sha256:${sha256Hex(c.statement)}`) throw new Error(`catalog patch: ${c.id} statement digest mismatch`);
    const code = codeOf(c.statement);
    out[index.get(c.id)] = { ...cur, statement: c.statement, sourceText: c.statement, code, kind: classify(code), macros: [], patch: { source: path, decision: c.decision, defect: c.defect, fix: c.fix, releasedStatementDigest: c.releasedStatementDigest, check: c.check } };
  }
  for (const p of patch.proposedTemplates ?? []) {
    if (byId.has(p.id)) throw new Error(`catalog patch: proposed template ${p.id} already exists`);
    if (p.statementDigest && p.statementDigest !== `sha256:${sha256Hex(p.statement)}`) throw new Error(`catalog patch: ${p.id} statement digest mismatch`);
    const code = codeOf(p.statement);
    out.push({ id: p.id, sourceKey: p.id.split("/")[0], rel: path.replace(/^query-catalog\/sources\//, ""), heading: p.id, kind: classify(code), markers: [], questionIds: [...p.questionIds].sort(), sourceText: p.statement, statement: p.statement, macros: [], code, notes: [p.notes, p.typedEquivalent ? `typed equivalent: ${p.typedEquivalent}` : null].filter(Boolean), temporalNotes: [], evidenceNotes: [], priorValidation: [], patch: { source: path, proposed: true, status: p.status } });
  }
  return out;
}

/** Question status from the reads role's executed result assertions (S4), plus promotions by proposed templates. */
function s4Status(id, ts, status, reason, questionStatus, catalogPatch) {
  if (!questionStatus) return { status, reason };
  const row = questionStatus.status.questions.find((q) => q.id === id);
  const proposed = (catalogPatch?.patch.proposedTemplates ?? []).filter((p) => p.questionIds.includes(id) && /^supported/.test(p.status));
  if (proposed.length) return { status: "supported", reason: `promoted by proposed template(s) ${proposed.map((p) => p.id).join(", ")} with executed result assertions (${proposed[0].status}); ${row?.reason ?? ""}`.trim(), qualification: { source: catalogPatch.path, assertion: "gold", templates: proposed.map((p) => p.id) } };
  if (!row) return { status, reason };
  // A capability-gated template stays unsupported whatever the run says; S4's status never promotes past the catalog.
  const s = status === "unsupported" && row.status !== "unsupported" ? "unsupported" : row.status;
  return { status: s, reason: row.reason, qualification: { source: questionStatus.path, assertion: row.assertion ?? "none", previous: row.previous, templateOutcomes: row.templates ?? [] } };
}
