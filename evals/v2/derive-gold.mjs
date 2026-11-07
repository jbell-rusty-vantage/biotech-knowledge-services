#!/usr/bin/env node
// Resolves every gold-spec selector against the accepted sources and writes <suite>/gold.json plus FREEZE.json.
//
//   node evals/v2/derive-gold.mjs           # write gold.json files and FREEZE.json
//   node evals/v2/derive-gold.mjs --check   # recompute and fail on any drift (sources or task files changed)
//
// Sources (digests recorded in FREEZE.json): node-register.yaml, relationship-register.yaml, vocabularies/predicates.yaml,
// the candidate SDL, fixtures, and INTERFACES.md (error codes, receipt outcomes, read statuses). A selector that does
// not resolve FAILS the derivation: no gold is ever typed by hand. Run-time selectors (migration manifest pointers,
// migration run reports) are kept as deferred bindings and resolved by score.mjs.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { YAML, canonical } from "../../scripts/migration/lib/common.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..");
const FINAL = path.join(REPO, "schema", "program", "final");
// Gold binds to the PINNED release bundle (loadRelease verifies its bytes); fixtures stay the frozen run-record fixtures.
const { loadRelease } = await import(new URL("../../packages/schema-workspace/dist/index.js", import.meta.url).href);
const RELEASE = loadRelease();
const RDIR = RELEASE.dir;
const SRC = {
  nodeRegister: path.join(RDIR, "registers", "node-register.yaml"),
  relationshipRegister: path.join(RDIR, "registers", "relationship-register.yaml"),
  predicates: path.join(RDIR, "vocabularies", "predicates.yaml"),
  sdl: path.join(RDIR, "sdl", "assembled.graphql"),
  interfaces: path.join(REPO, "docs", "plans", "schema-v2-service-release", "INTERFACES.md"),
};
const sha = (b) => "sha256:" + createHash("sha256").update(b).digest("hex");
const nodes = YAML.parse(fs.readFileSync(SRC.nodeRegister, "utf8")).nodes;
const rels = YAML.parse(fs.readFileSync(SRC.relationshipRegister, "utf8")).relationships;
const preds = YAML.parse(fs.readFileSync(SRC.predicates, "utf8")).predicates;
const sdl = fs.readFileSync(SRC.sdl, "utf8");
const interfaces = fs.readFileSync(SRC.interfaces, "utf8");
const sdlTypes = new Set([...sdl.matchAll(/^(?:type|interface|union|enum)\s+([A-Za-z0-9_]+)/gm)].map((m) => m[1]));
const errorCodes = new Set([...interfaces.matchAll(/`(RELEASE_MISMATCH|[A-Z_]{4,})`/g)].map((m) => m[1]).filter((c) => interfaces.includes("Error codes") && new RegExp("Error codes[^\\n]*" ).test(interfaces)));
const errLine = interfaces.split("\n").find((l) => l.startsWith("Error codes"));
const ERRORS = new Set([...(errLine ?? "").matchAll(/`([A-Z_]+)`/g)].map((m) => m[1]));
const outcomeLine = interfaces.split("\n").find((l) => l.includes("biotech-knowledge-receipt.v2"));
const OUTCOMES = new Set([...(outcomeLine ?? "").matchAll(/outcome: ([a-z|]+)/g)].flatMap((m) => m[1].split("|")));
const statusLine = interfaces.split("\n").find((l) => l.includes("biotech-knowledge-read-result.v2"));
const STATUSES = new Set([...(statusLine ?? "").matchAll(/status: ([a-z|]+)/g)].flatMap((m) => m[1].split("|")));
if (!ERRORS.size || !OUTCOMES.size || !STATUSES.size) throw new Error("could not parse INTERFACES.md error codes / outcomes / statuses");
void errorCodes;

const strip = (t) => String(t).replace(/^(K|D\d+)\./, "").replace(/\s*\(.*\)$/, "").trim();
const asList = (v) => (Array.isArray(v) ? v : String(v).split(/\s*\|\s*/)).map(strip);
const enumValues = (name) => {
  const m = new RegExp(`^enum ${name} [^{]*\\{([^}]*)\\}`, "m").exec(sdl);
  if (!m) return null;
  return m[1].split("\n").map((l) => l.trim()).filter((l) => /^[A-Z][A-Z0-9_]*$/.test(l));
};
const relRows = (type) => rels.filter((r) => r.type === type);
const cardId = (kind, name) => `${kind}:${name}`;

function resolveSchema(spec) {
  switch (spec.kind) {
    case "node": {
      const n = nodes.find((x) => x.name === spec.name);
      if (!n || !sdlTypes.has(spec.name)) throw new Error(`node ${spec.name} not in register/SDL`);
      const answer = Object.fromEntries(spec.fields.map((f) => [f, n[f] ?? null]));
      return { cardIds: [cardId("node", spec.name)], answer: { type: spec.name, ...answer } };
    }
    case "relationship": {
      const rows = relRows(spec.type);
      if (!rows.length) throw new Error(`relationship ${spec.type} not in register`);
      const answer = rows.map((r) => Object.fromEntries([["module", r.module], ...spec.fields.map((f) => [f, f === "from" || f === "to" ? asList(r[f]) : r[f] ?? null])]));
      return { cardIds: [cardId("relationship", spec.type)], answer: { type: spec.type, rows: answer } };
    }
    case "predicate": {
      const p = preds.filter((x) => x.predicate === spec.name);
      if (!p.length) throw new Error(`predicate ${spec.name} not in vocabulary`);
      return { cardIds: [cardId("predicate", spec.name)], answer: { predicate: spec.name, rows: p.map((x) => Object.fromEntries(spec.fields.map((f) => [f, x[f] ?? null]))) } };
    }
    case "enum": {
      const v = enumValues(spec.name);
      if (!v) throw new Error(`enum ${spec.name} not in SDL`);
      for (const bad of spec.mustNotContain ?? []) if (v.includes(bad)) throw new Error(`enum ${spec.name} unexpectedly contains ${bad}`);
      return { cardIds: [cardId("enum", spec.name)], answer: { enum: spec.name, values: v, mustNotContain: spec.mustNotContain ?? [] } };
    }
    case "absent": {
      if (nodes.some((x) => x.name === spec.name) || sdlTypes.has(spec.name)) throw new Error(`${spec.name} exists; not a negative task`);
      for (const r of spec.replacementTypes) if (!nodes.some((x) => x.name === r)) throw new Error(`replacement ${r} missing`);
      return { cardIds: spec.replacementTypes.map((r) => cardId("node", r)), answer: { exists: false, name: spec.name, replacementTypes: spec.replacementTypes } };
    }
    case "path": {
      if (spec.noDirect) {
        const [a, b] = spec.noDirect;
        const direct = rels.filter((r) => asList(r.from).includes(a) && asList(r.to).includes(b));
        if (direct.length) throw new Error(`direct ${a}->${b} exists: ${direct.map((r) => r.type)}`);
      }
      const hops = spec.hops.map(([type, from, to, dir]) => {
        const row = relRows(type).find((r) => asList(r.from).includes(from) && asList(r.to).includes(to));
        if (!row) throw new Error(`hop ${from}-[${type}]->${to} not in register`);
        return { type, from, to, traversal: dir === "reverse" ? "against-direction" : "along-direction", class: row.class, module: row.module };
      });
      return { cardIds: hops.map((h) => cardId("relationship", h.type)), answer: { hops, noDirect: spec.noDirect ?? null } };
    }
    default:
      throw new Error(`unknown schema gold kind ${spec.kind}`);
  }
}

const fixtureCache = new Map();
function fixture(name) {
  if (!fixtureCache.has(name)) {
    const base = path.join(FINAL, "fixtures", name);
    const a = YAML.parse(fs.readFileSync(path.join(base, "assertions.yaml"), "utf8"));
    const l = fs.existsSync(path.join(base, "locators.yaml")) ? YAML.parse(fs.readFileSync(path.join(base, "locators.yaml"), "utf8")) : { snapshots: [], locators: [] };
    fixtureCache.set(name, { a, l, digest: sha(fs.readFileSync(path.join(base, "assertions.yaml"))) });
  }
  return fixtureCache.get(name);
}
function resolveRead(spec) {
  switch (spec.kind) {
    case "fixtureAssertion": {
      const { a, l, digest } = fixture(spec.fixture);
      const ents = new Map((a.entities ?? []).map((e) => [e.ref, e]));
      const uidOf = (x) => (x && typeof x === "object" ? x.uid ?? ents.get(x.ref)?.uid ?? null : null);
      const r = (a.assertions ?? []).find((x) => x.id === spec.rowId);
      if (!r) throw new Error(`row ${spec.rowId} missing in ${spec.fixture}`);
      // Fixture locator/snapshot shapes vary by packet: locators are keyed ref|id and point at a snapshot by
      // snapshotRef|snapshot (ref/id) or carry snapshotDigest; snapshots are keyed ref|id|source with contentHash|snapshotDigest.
      const locRefs = (r.locators ?? r.evidence ?? []).map((e) => (typeof e === "string" ? e : e.ref ?? e.locator ?? e.id)).filter(Boolean);
      const locKey = (x) => x.ref ?? x.id;
      const locs = locRefs.map((ref) => (l.locators ?? []).find((x) => locKey(x) === ref)).filter(Boolean);
      const snapOf = (x) => {
        if (x.snapshotDigest) return x.snapshotDigest;
        const key = x.snapshotRef ?? x.snapshot;
        const s = (l.snapshots ?? []).find((s) => (s.ref ?? s.id ?? s.source) === key);
        return s?.contentHash ?? s?.snapshotDigest ?? null;
      };
      if (!locRefs.length || locs.length !== locRefs.length) throw new Error(`${spec.fixture} ${spec.rowId}: ${locRefs.length - locs.length} locator ref(s) do not resolve`);
      const snapshotContentHashes = [...new Set(locs.map(snapOf).filter(Boolean))].sort();
      if (!snapshotContentHashes.length) throw new Error(`${spec.fixture} ${spec.rowId}: no snapshot content hash resolves`);
      const quoteHashes = [...new Set(locs.map((x) => x.quoteHash).filter(Boolean))].sort();
      return { fixtureDigest: digest, answer: { predicate: r.predicate, subjectUid: uidOf(r.subject), objectUid: uidOf(r.object), asserterUid: uidOf(r.asserter), assertionUid: r.uid ?? null, status: r.status ?? null, locatorRefs: locRefs, locatorsResolved: locs.length, snapshotContentHashes, quoteHashes, validTime: r.validTime ?? null } };
    }
    case "fixtureEntity": {
      const { a, digest } = fixture(spec.fixture);
      const e = (a.entities ?? []).find((x) => x.ref === spec.ref);
      if (!e?.uid) throw new Error(`entity ${spec.ref} missing in ${spec.fixture}`);
      return { fixtureDigest: digest, answer: { uid: e.uid, nodeType: e.type, basis: spec.basis } };
    }
    case "readStatus":
      if (!STATUSES.has(spec.status)) throw new Error(`status ${spec.status} not in INTERFACES read-result statuses`);
      return { answer: { status: spec.status, ...(spec.reason ? { reason: spec.reason } : {}), ...(spec.note ? { note: spec.note } : {}) } };
    case "literal":
      return { answer: { value: spec.value, reason: spec.reason } };
    case "manifestPointer":
      return { deferred: { source: "migration-manifest.json", pointer: spec.pointer }, answer: { ...(spec.status ? { status: spec.status } : {}), ...(spec.sourceKind ? { sourceKind: spec.sourceKind } : {}), ...(spec.reason ? { reason: spec.reason } : {}) } };
    default:
      throw new Error(`unknown read gold kind ${spec.kind}`);
  }
}
function resolveWrite(spec) {
  const one = (s) => {
    if (s.kind === "error") {
      if (!ERRORS.has(s.code)) throw new Error(`error code ${s.code} not in INTERFACES section 5`);
      return { error: `BKS_${s.code}` };
    }
    if (s.kind === "outcome") {
      if (!OUTCOMES.has(s.outcome)) throw new Error(`outcome ${s.outcome} not in receipt outcomes`);
      return { outcome: s.outcome, invariants: s.invariants ?? [] };
    }
    if (s.kind === "status") {
      if (!STATUSES.has(s.status)) throw new Error(`status ${s.status} not in read-result statuses`);
      return { status: s.status, invariants: s.invariants ?? [] };
    }
    if (s.kind === "marker") return { markerStatus: s.status, invariants: s.invariants };
    if (s.kind === "invariant") return { invariants: s.invariants };
    if (s.kind === "migrationRun") return { deferred: { source: "migration run reports (verify/apply)" }, invariants: s.invariants };
    if (s.kind === "race") {
      for (const c of s.otherOneOf) if (!ERRORS.has(c)) throw new Error(`race code ${c} unknown`);
      return { oneOf: s.oneOf, otherOneOf: s.otherOneOf.map((c) => `BKS_${c}`), invariants: s.invariants };
    }
    if (s.kind === "sequence") return { sequence: s.steps.map(one) };
    throw new Error(`unknown write gold kind ${s.kind}`);
  };
  return { answer: one(spec) };
}

const suites = { "schema-discovery": resolveSchema, "native-read": resolveRead, "write-recovery": resolveWrite };
// blinded certification set (generated by generate-schema-tasks.mjs; never shared with the workspace role)
for (const dir of fs.readdirSync(HERE).filter((n) => n.startsWith("schema-discovery-certify")).sort()) if (fs.existsSync(path.join(HERE, dir, "gold-spec.json"))) suites[dir] = resolveSchema;
const check = process.argv.includes("--check");
const freeze = { format: "bks-eval-freeze.v1", frozenAt: "2026-10-12", release: { releaseId: RELEASE.pin?.releaseId, schemaReleaseDigest: RELEASE.schemaReleaseDigest, schemaDigest: RELEASE.schemaDigest }, sources: Object.fromEntries(Object.entries(SRC).map(([k, f]) => [k, { path: path.relative(REPO, f).replace(/\\/g, "/"), sha256: sha(fs.readFileSync(f)) }])), suites: {} };
// Recorded deviations (protocol section 9) are owned by derive-gold-seeded.mjs and kept verbatim.
{
  const prior = fs.existsSync(path.join(HERE, "FREEZE.json")) ? JSON.parse(fs.readFileSync(path.join(HERE, "FREEZE.json"), "utf8")) : {};
  if (prior.deviations) freeze.deviations = prior.deviations;
}
let drift = 0;
for (const [suite, resolve] of Object.entries(suites)) {
  const spec = JSON.parse(fs.readFileSync(path.join(HERE, suite, "gold-spec.json"), "utf8"));
  const tasks = JSON.parse(fs.readFileSync(path.join(HERE, suite, "tasks.json"), "utf8"));
  const gold = {};
  for (const [id, s] of Object.entries(spec.gold)) gold[id] = resolve(s);
  // prompt-leak guard: a schema-discovery gold type/predicate name must not appear in a paraphrase prompt
  if (suite.startsWith("schema-discovery")) {
    for (const t of tasks.tasks) {
      if (t.category !== "paraphrase") continue;
      const s = spec.gold[t.id];
      const leaked = [s.name, s.type].filter(Boolean).filter((n) => new RegExp(`\\b${n}\\b`).test(t.prompt));
      if (leaked.length) throw new Error(`${t.id}: paraphrase prompt names its gold ${leaked.join(",")}`);
    }
  }
  const doc = { format: "bks-eval-gold.v1", suite, derivedFrom: Object.keys(SRC), gold };
  const text = JSON.stringify(JSON.parse(canonical(doc)), null, 2) + "\n";
  const file = path.join(HERE, suite, "gold.json");
  if (check) {
    if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== text) {
      drift++;
      console.error(`drift: ${suite}/gold.json`);
    }
  } else fs.writeFileSync(file, text);
  freeze.suites[suite] = { tasks: sha(fs.readFileSync(path.join(HERE, suite, "tasks.json"))), goldSpec: sha(fs.readFileSync(path.join(HERE, suite, "gold-spec.json"))), gold: sha(Buffer.from(text)), count: tasks.tasks.length };
}
const ftext = JSON.stringify(freeze, null, 2) + "\n";
if (check) {
  if (fs.readFileSync(path.join(HERE, "FREEZE.json"), "utf8") !== ftext) {
    drift++;
    console.error("drift: FREEZE.json");
  }
} else fs.writeFileSync(path.join(HERE, "FREEZE.json"), ftext);
console.log(JSON.stringify({ ok: drift === 0, mode: check ? "check" : "write", suites: freeze.suites }, null, 2));
process.exit(drift ? 1 : 0);
