#!/usr/bin/env node
// Seeded schema-discovery task generator (no LLM, no network, no graph).
//
//   node evals/v2/generate-schema-tasks.mjs --seed <int> --out <suiteDir> [--check]
//
// Draws a fresh task set from the PINNED release (registers, SDL docstrings, migration/v1-map.yaml) with the same
// category mix as the frozen suite: 24 exact, 20 paraphrase, 14 negative, 10 cross-domain (68) over all 14 modules
// (>= 4 per module). Writes tasks.json (prompt-visible) and gold-spec.json (selectors; derive-gold.mjs resolves them).
// Paraphrase prompts are SDL "Purpose:" sentences with the gold type's names masked; the leak guard rejects any prompt
// that still names its gold. Cross-domain tasks only use (A, C) pairs with exactly one 2-hop register path and no
// direct edge, so the gold is unique. Same seed + same release -> identical bytes.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { YAML, canonical } from "../../scripts/migration/lib/common.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = {};
for (let i = 2; i < process.argv.length; i++) if (process.argv[i].startsWith("--")) args[process.argv[i].slice(2)] = process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[++i] : true;
if (!args.seed || !args.out) {
  console.error("usage: generate-schema-tasks.mjs --seed <int> --out <suiteDir> [--check]");
  process.exit(2);
}
const { loadRelease } = await import(new URL("../../packages/schema-workspace/dist/index.js", import.meta.url).href);
const release = loadRelease();
const RD = release.dir;
const nodes = YAML.parse(fs.readFileSync(path.join(RD, "registers", "node-register.yaml"), "utf8")).nodes;
const rels = YAML.parse(fs.readFileSync(path.join(RD, "registers", "relationship-register.yaml"), "utf8")).relationships;
const v1 = YAML.parse(fs.readFileSync(path.join(RD, "migration", "v1-map.yaml"), "utf8"));
const sdl = fs.readFileSync(path.join(RD, "sdl", "assembled.graphql"), "utf8");
const MODULES = ["K", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13"];
const MIX = { exact: 24, paraphrase: 20, negative: 14, "cross-domain": 10 };
const ctxLine = "Release under test: ${RELEASE_ID} (schemaReleaseDigest ${SCHEMA_RELEASE_DIGEST}, workspace ${WORKSPACE_FINGERPRINT}). Cite every schema card you rely on with its release-bound card id.";

let x = Number(args.seed) >>> 0 || 1;
const rnd = () => {
  x = (x + 0x6d2b79f5) >>> 0;
  let t = x;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
const strip = (t) => String(t).replace(/^(K|D\d+)\./, "").replace(/\s*\(.*\)$/, "").trim();
const asList = (v) => (Array.isArray(v) ? v : String(v).split(/\s*\|\s*/)).map(strip);
const nodeByName = new Map(nodes.map((n) => [n.name, n]));
const moduleOf = (name) => nodeByName.get(name)?.module ?? null;

// ---------- candidate pools per module and category ----------
function purposeOf(name) {
  const at = sdl.indexOf(`\ntype ${name} implements`);
  if (at < 0) return null;
  const close = sdl.lastIndexOf('"""', at);
  const open = close > 0 ? sdl.lastIndexOf('"""', close - 1) : -1;
  if (open < 0 || at - close > 4) return null; // the docstring must sit directly above the type
  const doc = sdl.slice(open + 3, close);
  const p = /Purpose:\s*([\s\S]*?)(?:\nIdentity rule:|\nuid token|\nQuestions:|$)/.exec(doc);
  if (!p) return null;
  const text = p[1].replace(/\s+/g, " ").trim();
  const first = text.split(/(?<=[.;])\s/)[0];
  return (first.length > 40 ? first : text).slice(0, 260);
}
function mask(text, name, token) {
  const words = name.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ");
  const variants = [name, words.join(" "), words.join("-"), token, token?.replace(/-/g, " ")].filter(Boolean);
  let out = text;
  for (const v of variants.sort((a, b) => b.length - a.length)) out = out.replace(new RegExp(`\\b${v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}s?\\b`, "gi"), "this type");
  return out;
}
const leaks = (prompt, name, token) => {
  const words = name.replace(/([a-z])([A-Z])/g, "$1 $2");
  return [name, words, token].filter(Boolean).some((v) => new RegExp(`\\b${v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(prompt));
};
const pools = Object.fromEntries(MODULES.map((m) => [m, { exact: [], paraphrase: [], negative: [], "cross-domain": [] }]));
for (const n of nodes) {
  if (!pools[n.module]) continue;
  pools[n.module].exact.push({ prompt: `Give the uid token and the identity keys of the ${n.name} node type.`, gold: { kind: "node", name: n.name, fields: ["uidToken", "identityKeys"] } });
  const purpose = purposeOf(n.name);
  if (purpose) {
    const masked = mask(purpose, n.name, n.uidToken);
    const prompt = `Which node type is described as follows: "${masked}"? Name it and give its uid token.`;
    if (!leaks(prompt, n.name, n.uidToken) && masked.length > 30) pools[n.module].paraphrase.push({ prompt, gold: { kind: "node", name: n.name, fields: ["uidToken", "module"] } });
  }
}
for (const r of rels) {
  if (!pools[r.module]) continue;
  pools[r.module].exact.push({ prompt: `Describe the ${r.type} relationship: endpoint types, class and temporal model.`, gold: { kind: "relationship", type: r.type, fields: ["from", "to", "class", "temporal"] } });
}
for (const m of MODULES) {
  const f = path.join(RD, "sdl", "modules", `${m === "K" ? "kernel" : m}.graphql`);
  if (!fs.existsSync(f)) continue;
  const text = fs.readFileSync(f, "utf8");
  for (const e of [...text.matchAll(/^enum ([A-Za-z0-9_]+)\s/gm)].map((x) => x[1])) if (new RegExp(`^enum ${e} `, "m").test(sdl)) pools[m].exact.push({ prompt: `List the values of the ${e} enum.`, gold: { kind: "enum", name: e } });
}
const preds = YAML.parse(fs.readFileSync(path.join(RD, "vocabularies", "predicates.yaml"), "utf8")).predicates ?? [];
for (const p of preds) {
  if (p.status !== "registered" || !pools[p.registrar] || p.kind === "authorizing") continue;
  pools[p.registrar].exact.push({ prompt: `Is ${p.predicate} a relationship type or an assertion predicate in this release? Give its kind, subject types and object types.`, gold: { kind: "predicate", name: p.predicate, fields: ["kind", "subjectTypes", "objectTypes", "registrar"] } });
}
for (const v of v1.nodeTypes ?? []) {
  if (!["merged", "renamed"].includes(v.disposition)) continue;
  const targets = String(v.v2 ?? "").split(/[,;|+]/).map((s) => strip(s.trim())).filter((t) => nodeByName.has(t));
  if (!targets.length || nodeByName.has(v.v1)) continue;
  const mod = moduleOf(targets[0]);
  if (!pools[mod]) continue;
  pools[mod].negative.push({ prompt: `Is ${v.v1} a node type in this release? If it is not, name the type(s) that now carry it.`, gold: { kind: "absent", name: v.v1, in: "node", replacementTypes: targets } });
}
// cross-domain: (A, C) with exactly one A-[r1]->B-[r2]->C path, B and C in a module different from A, and no direct A->C edge
const out = new Map();
for (const r of rels) for (const f of asList(r.from)) for (const t of asList(r.to)) if (nodeByName.has(f) && nodeByName.has(t)) (out.get(f) ?? out.set(f, []).get(f)).push({ type: r.type, to: t });
for (const a of nodes) {
  const paths = new Map();
  for (const h1 of out.get(a.name) ?? []) for (const h2 of out.get(h1.to) ?? []) {
    if (h2.to === a.name || h1.to === h2.to) continue;
    (paths.get(h2.to) ?? paths.set(h2.to, []).get(h2.to)).push([h1, h2]);
  }
  for (const [c, ps] of paths) {
    if (ps.length !== 1 || moduleOf(c) === a.module) continue;
    if ((out.get(a.name) ?? []).some((h) => h.to === c)) continue;
    const [h1, h2] = ps[0];
    if (!pools[a.module]) continue;
    pools[a.module]["cross-domain"].push({ prompt: `Trace the schema path from a ${a.name} to a ${c} through exactly one intermediate node type. Give each relationship type and node type in order.`, gold: { kind: "path", hops: [[h1.type, a.name, h1.to], [h2.type, h1.to, c]], modules: [...new Set([a.module, moduleOf(h1.to), moduleOf(c)])] } });
  }
}
// --exclude <suiteDir[,suiteDir]>: never reuse a gold selector of an earlier set (e.g. a development set already analysed)
const excluded = new Set();
for (const d of String(args.exclude ?? "").split(",").filter(Boolean)) for (const g of Object.values(JSON.parse(fs.readFileSync(path.join(path.resolve(d), "gold-spec.json"), "utf8")).gold)) excluded.add(canonical(g));
// Excluded selectors stay available ONLY as a last-resort fallback for the per-module floor (never for cross-domain).
const fallback = Object.fromEntries(MODULES.map((m) => [m, {}]));
for (const m of MODULES) for (const c of Object.keys(MIX)) {
  fallback[m][c] = c === "cross-domain" ? [] : shuffle(pools[m][c].filter((t) => excluded.has(canonical(t.gold))));
  pools[m][c] = shuffle(pools[m][c].filter((t) => !excluded.has(canonical(t.gold))));
}
let fallbackUsed = 0;

// ---------- draw: per category round-robin over shuffled modules; then guarantee >= 4 per module ----------
const chosen = [];
const used = new Set();
const key = (t) => canonical(t.gold);
const take = (m, c, allowFallback = false) => {
  let t = pools[m][c].find((z) => !used.has(key(z)));
  if (!t && allowFallback) {
    t = fallback[m][c].find((z) => !used.has(key(z)));
    if (t) fallbackUsed++;
  }
  if (!t) return false;
  used.add(key(t));
  chosen.push({ module: m, category: c, ...t });
  return true;
};
for (const [c, n] of Object.entries(MIX)) {
  let got = 0;
  let guard = 0;
  while (got < n && guard < 1000) {
    for (const m of shuffle(MODULES)) {
      if (got >= n) break;
      if (take(m, c)) got++;
    }
    guard++;
  }
  if (got < n) throw new Error(`category ${c}: only ${got}/${n} candidates`);
}
// rebalance: move tasks so every module has >= 4 (swap a surplus module's task for a deficit module's task of the same category)
for (let pass = 0; pass < 50; pass++) {
  const per = Object.fromEntries(MODULES.map((m) => [m, chosen.filter((t) => t.module === m).length]));
  const low = MODULES.find((m) => per[m] < 4);
  if (!low) break;
  const high = MODULES.filter((m) => per[m] > 4).sort((a, b) => per[b] - per[a])[0];
  const avail = (c) => pools[low][c].some((z) => !used.has(key(z))) || fallback[low][c].some((z) => !used.has(key(z)));
  const victimIdx = chosen.findIndex((t) => t.module === high && avail(t.category));
  if (victimIdx < 0) throw new Error(`cannot rebalance module ${low}`);
  const cat = chosen[victimIdx].category;
  used.delete(key(chosen[victimIdx]));
  chosen.splice(victimIdx, 1);
  take(low, cat, true);
}
const order = shuffle(chosen);
const tag = String(args.seed).slice(-3);
const tasks = order.map((t, i) => ({ id: `SC-${String(i + 1).padStart(3, "0")}`, module: t.module, category: t.category, prompt: `${ctxLine} ${t.prompt}`, answerShape: "answer.json {answer, citations[{cardId, releaseDigest}], hits[ranked cardIds, <=10]}" }));
const gold = Object.fromEntries(order.map((t, i) => [`SC-${String(i + 1).padStart(3, "0")}`, t.gold]));
const meta = { ...(excluded.size ? { excludesSelectorsOf: String(args.exclude).split(",").map((d) => path.basename(path.resolve(d))), reusedForModuleFloor: fallbackUsed } : {}), format: "bks-eval-tasks.v1", suite: path.basename(path.resolve(args.out)), generator: "evals/v2/generate-schema-tasks.mjs", seedTag: `...${tag}`, mix: MIX, frozenAt: "2026-10-12", release: { releaseId: release.pin?.releaseId, schemaReleaseDigest: release.schemaReleaseDigest }, bindings: ["RELEASE_ID", "SCHEMA_RELEASE_DIGEST", "WORKSPACE_FINGERPRINT"], count: tasks.length, goldFile: "gold-spec.json (never mounted for the agent)", blinding: "certification set: not shared with the workspace role; the lead runs it after their ranking round" };
const files = [["tasks.json", { ...meta, tasks }], ["gold-spec.json", { format: "bks-eval-gold-spec.v1", suite: meta.suite, seed: Number(args.seed), gold }]];
const dir = path.resolve(args.out);
fs.mkdirSync(dir, { recursive: true });
let drift = 0;
for (const [name, obj] of files) {
  const text = JSON.stringify(JSON.parse(canonical(obj)), null, 2) + "\n";
  const f = path.join(dir, name);
  if (args.check) {
    if (!fs.existsSync(f) || fs.readFileSync(f, "utf8") !== text) drift++;
  } else fs.writeFileSync(f, text);
}
const per = {};
for (const t of tasks) per[t.module] = (per[t.module] ?? 0) + 1;
const cats = {};
for (const t of tasks) cats[t.category] = (cats[t.category] ?? 0) + 1;
console.log(JSON.stringify({ ok: drift === 0, mode: args.check ? "check" : "write", count: tasks.length, categories: cats, modules: per }));
process.exit(drift ? 1 : 0);
