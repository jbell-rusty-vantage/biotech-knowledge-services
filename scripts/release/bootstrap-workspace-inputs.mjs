#!/usr/bin/env node
/**
 * FU-09 bootstrap: generates two release workspace inputs deterministically from the release sources and the v1
 * sidecars recorded at the frozen BKS commit (git show 431c8a7:schema/sidecars/*.yaml):
 *   workspace-inputs/identity-rules.yaml  types/keys from registers/node-register.yaml, scheme codes and write status
 *                                         from vocabularies/identifier-schemes.yaml, executor normalization rule names
 *   workspace-inputs/aliases.yaml         every v1 workspace id (v1 IR names in migration/v1-map.yaml, v1 fragments,
 *                                         domains, tasks and terms) -> v2 ids or a migration explanation
 * The other four workspace inputs (domains, terminology, task-routes, ingestion-rules) are hand-authored upstream.
 *
 *   node scripts/release/bootstrap-workspace-inputs.mjs [--release <dir>] [--check]
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { arg, BKS_COMMIT, BKS_ROOT, DEFAULT_RELEASE_DIR, flag, graphql, readText, RELEASE_ID, toYaml, writeTree, YAML } from "./lib/common.mjs";

const releaseDir = resolve(arg("--release", DEFAULT_RELEASE_DIR));
const read = (p) => readText(resolve(releaseDir, p));
const readY = (p) => YAML.parse(read(p));
const v1Sidecar = (name) => YAML.parse(execFileSync("git", ["-C", BKS_ROOT, "show", `${BKS_COMMIT}:schema/sidecars/${name}`], { encoding: "utf8" }).replace(/\r\n/g, "\n"));

// ---- v2 SDL names --------------------------------------------------------------------------------------------
const sdl = graphql.parse(read("sdl/assembled.graphql"), { noLocation: true });
const v2 = { node: new Map(), rel: new Set(), enum: new Set(), union: new Set(), iface: new Set(), edge: new Set() };
for (const d of sdl.definitions) {
  const name = d.name?.value;
  if (!name) continue;
  const dir = (n) => (d.directives ?? []).some((x) => x.name.value === n);
  if (d.kind === "EnumTypeDefinition") v2.enum.add(name);
  if (d.kind === "UnionTypeDefinition") v2.union.add(name);
  if (d.kind === "InterfaceTypeDefinition") v2.iface.add(name);
  if (d.kind === "ObjectTypeDefinition" && dir("relationshipProperties")) v2.edge.add(name);
  if (d.kind === "ObjectTypeDefinition" && dir("node")) v2.node.set(name, new Set((d.fields ?? []).map((f) => f.name.value)));
  for (const f of d.fields ?? []) {
    const rel = (f.directives ?? []).find((x) => x.name.value === "relationship");
    const t = rel?.arguments.find((a) => a.name.value === "type");
    if (t) v2.rel.add(t.value.value);
  }
}
/** A v2 name -> its workspace id (first kind that has it). */
const idOf = (name) => {
  if (v2.node.has(name)) return `node:${name}`;
  if (v2.rel.has(name)) return `rel:${name}`;
  if (v2.enum.has(name)) return `enum:${name}`;
  if (v2.union.has(name)) return `union:${name}`;
  if (v2.iface.has(name)) return `iface:${name}`;
  if (v2.edge.has(name)) return `edge:${name}`;
  return null;
};

// ---- identity-rules.yaml ------------------------------------------------------------------------------------
const nodeRegister = readY("registers/node-register.yaml");
const schemeRegister = readY("vocabularies/identifier-schemes.yaml");
const schemes = new Map(schemeRegister.schemes.map((s) => [s.code, s]));
/** Register normalization rule id -> the executor's coarse rule (kg-ops schema-access normalizeIdentifier). */
const EXECUTOR_RULE = {
  "digits-v1": "digits", "pmid-digits-v1": "digits", "grn-digits-v1": "digits", "ndin-digits-v1": "digits", "gtin14-v1": "digits",
  "cik10-v1": "digits", "ndc11-v1": "digits", "udidi-v1": "digits",
  "upper-v1": "uppercase", "unii-upper-v1": "uppercase", "inchikey-upper-v1": "uppercase", "nct-upper-v1": "uppercase", "pmcid-upper-v1": "uppercase",
  "isrctn-upper-v1": "uppercase", "lei-upper-v1": "uppercase", "hgnc-v1": "uppercase", "uniprot-v1": "uppercase", "reactome-v1": "uppercase",
  "doi-lowercase-v1": "lowercase", "uuid-lower-v1": "lowercase",
  "ror-v1": "lowercase-url",
  "web-domain-v1": "lowercase-host",
};
const identifierNormalization = {};
const registerNormalization = {};
for (const s of [...schemes.values()].sort((a, b) => (a.code < b.code ? -1 : 1))) {
  const rule = s.normalization?.rule;
  if (!rule) continue;
  identifierNormalization[s.code] = EXECUTOR_RULE[rule] ?? "as-is";
  registerNormalization[s.code] = rule;
}
const NAME_PROPS = {
  Organization: ["name", "legalName"], Product: ["name", "marketedName"], Taxon: ["name", "scientificName"], Target: ["name", "label"],
  FoodCategory: ["name", "label"], Channel: ["name", "handle"], MerchantListing: ["name", "titleAsDisplayed"], Brand: ["name"],
};
const KEY_SLUG = new Set(["Target", "Frontier", "Mechanism", "Condition", "Outcome"]);
const unknownSchemes = [];
const types = {};
for (const n of [...nodeRegister.nodes].sort((a, b) => (a.name < b.name ? -1 : 1))) {
  const props = v2.node.get(n.name);
  if (!props) throw new Error(`node register ${n.name} not in the SDL`);
  const codes = [];
  for (const raw of n.identifierSchemes ?? []) {
    const code = String(raw).split(/[\s(]/)[0];
    if (schemes.has(code)) codes.push(code);
    else unknownSchemes.push(`${n.name}: ${raw}`);
  }
  const identifierSchemes = [...new Set(codes)];
  const rule = { identityKeys: (n.identityKeys ?? []).map(String), identifierSchemes, activeIdentifierSchemes: identifierSchemes.filter((c) => schemes.get(c).writeStatus === "active") };
  const nameProperties = (NAME_PROPS[n.name] ?? ["name"]).filter((p) => props.has(p));
  rule.nameProperties = nameProperties;
  if (KEY_SLUG.has(n.name) && props.has("key")) rule.uidSlugFrom = "key";
  types[n.name] = rule;
}
const identityRules = {
  version: 2,
  releaseId: RELEASE_ID,
  defaults: { nameProperties: ["name"], uidSlugFrom: "name", fulltextIsCandidateOnly: true, identifierNormalization },
  registerNormalization,
  types,
  notes: {
    resolutionOrder: "explicit uid > identifier (scheme + issuer + normalized value; R-42) > exact name on a name property > alias / normalized name > fulltext (candidate only, never auto-adopted)",
    identityKeys: "node-register identityKeys as stated (may be prose); the uid is minted from the register identity rule, names are presentation only",
    activeIdentifierSchemes: "only writeStatus active schemes (KN-06, MD-X-01) are accepted by identifier.attach; disabled schemes stay listed as registry history",
    normalization: "identifierNormalization is the executor's coarse rule; registerNormalization names the exact versioned rule of the release register that the executor-v2 normalizer (S3) applies",
    skippedRegisterEntries: unknownSchemes,
  },
};

// ---- aliases.yaml -------------------------------------------------------------------------------------------
const v1map = readY("migration/v1-map.yaml");
const aliases = {};
const asList = (v) => (v === null || v === undefined ? [] : Array.isArray(v) ? v : [v]);
const v2Ids = (targets) => asList(targets).map((t) => idOf(String(t).trim())).filter(Boolean);
const predicateOf = (targets) => asList(targets).map(String).filter((t) => t.startsWith("predicate ")).map((t) => t.slice("predicate ".length));
const add = (from, entry) => {
  if (aliases[from]) return;
  aliases[from] = entry;
};
const fromRow = (kind, row, section) => {
  const from = `${kind}:${row.v1}`;
  const ids = v2Ids(row.v2);
  const source = `migration/v1-map.yaml#${section}/${row.v1}`;
  const note = row.note ? String(row.note) : "";
  const preds = predicateOf(row.v2);
  const d = row.disposition;
  if ((d === "kept" || d === "unchanged" || d === "kept-changed") && idOf(row.v1) === from) {
    add(from, { kind: "kept", to: [from], explanation: note || `same name in v2 (${d})`, source });
  } else if (d === "renamed" && ids.length === 1) {
    add(from, { kind: "renamed", to: ids, explanation: note || `renamed to ${ids[0]}`, source });
  } else if ((d === "merged" || d === "replaced" || d === "kept" || d === "kept-changed") && ids.length) {
    add(from, { kind: ids.length > 1 ? "split" : "merged", to: ids, explanation: note || `${d} into ${ids.join(", ")}`, source });
  } else {
    const why = {
      folded: "no record of its own in v2: its meaning is a property, qualifier or locator of another record",
      retired: "deliberately not carried into v2 (cut or deferred by a ruling); no substitute type",
      "predicate-only": `no typed edge in v2: an Assertion with predicate ${preds.join(", ") || "(see note)"} (vocabularies/predicates.yaml)`,
      "carried-by-pattern": "no typed edge in v2: the meaning is carried by the kernel pattern edges listed under seeAlso",
      unmapped: "no register or ruling row; handled by the DECISIONS policy for the seven unmapped legacy relationships (migration/v1-map.yaml unmappedEdges)",
      replaced: "replaced by a v2 construct named in the explanation",
    }[d] ?? `v1 disposition ${d}`;
    const entry = { kind: "removed", to: [], explanation: `${why}${note ? `. ${note}` : ""}`, source };
    const seeAlso = d === "predicate-only" ? ["node:Assertion"] : ids;
    if (seeAlso.length) entry.seeAlso = [...new Set(seeAlso)];
    add(from, entry);
  }
};
for (const r of v1map.nodeTypes) fromRow("node", r, "nodeTypes");
for (const r of v1map.relationshipTypes) fromRow("rel", r, "relationshipTypes");
for (const r of v1map.enums.types) fromRow("enum", r, "enums");
for (const r of v1map.unions) fromRow("union", r, "unions");
for (const r of v1map.interfaces) fromRow("iface", r, "interfaces");
for (const r of v1map.edgePropertyTypes) fromRow("edge", r, "edgePropertyTypes");

// v1 fragments (W00..W23, SEAM) -> release modules.
const FRAG = {
  W00: [["K"], "kernel: archetypes, identity, time, assertion, evidence provenance"],
  W01: [["D7"], "actors and institutions -> D7 organizations, people and money"],
  W02: [["D1"], "substances and materials -> D1 compounds and ingredients"],
  W03: [["D2"], "biology and mechanisms -> D2 mechanisms and biology of aging"],
  W04: [["D6"], "products, formulations and labels -> D6 (FormulationVersion folded into LabelVersion)"],
  W05: [["D12", "D5"], "food -> D12 food and nutrition; lifestyle and exposures -> D5 Intervention"],
  W06: [["D5"], "treatments, procedures and modalities -> D5 Intervention"],
  W07: [["D4"], "diagnostics and measurement -> D4"],
  W08: [["D4"], "platforms, instruments and devices -> D4 Device / AssayVersion"],
  W09: [["D3"], "studies, interventions and results -> D3"],
  W10: [["K", "D3"], "evidence assessment, applicability and synthesis -> kernel Assessment kinds (K) over D3 evidence"],
  W11: [["D8"], "manufacturing and specifications -> D8 (capability is the HAS_CAPABILITY_STAGE predicate)"],
  W12: [["D8"], "quality testing and certification -> D8 QualityResult / CertificationListing"],
  W13: [["D8"], "regulation and jurisdictions -> D8 RegulatoryRecord / LegalStatus"],
  W14: [["D8"], "intellectual property and licensing -> D8 Patent"],
  W15: [["D6"], "commerce and access to products -> D6 MerchantListing / Offer"],
  W16: [["D5"], "protocols and public workflow definitions -> D5 Protocol / ProtocolEdition / ProtocolStep"],
  W17: [["D5"], "safety and use constraints -> D5 UseConstraint (safety signals are SAFETY_SIGNAL Assessments)"],
  W18: [["D9", "D13"], "communities -> D9 Channel; events and narrative arcs -> D13 Event and D10 / kernel Reports"],
  W19: [["K", "D11"], "source intelligence -> kernel Source / SOURCE_AUTHORITY Assessments and D11 CaptureAttempt"],
  W20: [["K", "D9"], "documents and text versions -> kernel Source / SourceSnapshot; chunks -> D9 Chunk"],
  W21: [["D9", "K"], "narrative media and speakers -> D9 Channel / MediaWork; claims -> kernel Claim and claim-occurrence Assertions"],
  W22: [["D9"], "media assets -> D9 MediaWork (IMAGE works); regions are SourceLocators; depiction and rights are predicate-only / custody metadata"],
  W23: [["D10", "K"], "access, answers and policy -> kernel Report and D10 DecisionCriterion / ReportItem; private context lives outside the graph"],
};
for (const [w, [mods, why]] of Object.entries(FRAG)) add(`frag:${w}`, { kind: mods.length > 1 ? "split" : "merged", to: mods.map((m) => `frag:${m}`), explanation: `v1 fragment ${w} (${why})`, source: "workspace-inputs/domains.yaml (module grouping); migration/v1-map.yaml" });
add("frag:SEAM", { kind: "removed", to: [], explanation: "v1 seam-closure fragment: v2 has no seam module; its RecommendableTarget union was replaced by the kernel Subjectable pattern (a recommendation is a claim occurrence with speechAct RECOMMENDS)", source: "migration/v1-map.yaml#unions" });

// v1 domains, tasks and terms.
const DOM_RENAMED = { "access-and-answers": "derived-knowledge-and-reports" };
const v2Domains = new Set(readY("workspace-inputs/domains.yaml").domains.map((d) => d.slug));
const v2Tasks = new Set(readY("workspace-inputs/task-routes.yaml").tasks.map((t) => t.slug));
const v2Terms = new Set(readY("workspace-inputs/terminology.yaml").terms.map((t) => t.term.toLowerCase().replace(/\s+/g, "-")));
for (const d of v1Sidecar("domains.yaml").domains) {
  const from = `dom:${d.slug}`;
  if (v2Domains.has(d.slug)) add(from, { kind: "kept", to: [from], explanation: `domain kept; v1 fragments ${d.fragments.join(", ")} are now release modules (workspace-inputs/domains.yaml)`, source: "workspace-inputs/domains.yaml" });
  else if (DOM_RENAMED[d.slug]) add(from, { kind: "renamed", to: [`dom:${DOM_RENAMED[d.slug]}`], explanation: "v1 access/answers/policy domain: answers are kernel Reports, criteria and report items are D10; the private-store boundary has no graph types", source: "workspace-inputs/domains.yaml" });
  else add(from, { kind: "removed", to: [], explanation: "v1 seam-closure domain: no seam module in v2", source: "workspace-inputs/domains.yaml" });
}
for (const t of v1Sidecar("task-routes.yaml").tasks) {
  const from = `task:${t.slug}`;
  if (!v2Tasks.has(t.slug)) throw new Error(`v1 task ${t.slug} has no v2 route`);
  add(from, { kind: "kept", to: [from], explanation: "task route kept, rewritten on the v2 kernel pattern", source: "workspace-inputs/task-routes.yaml" });
}
for (const t of v1Sidecar("terminology.yaml").terms) {
  const slug = t.term.toLowerCase().replace(/\s+/g, "-");
  const from = `term:${slug}`;
  if (!v2Terms.has(slug)) throw new Error(`v1 term ${t.term} has no v2 term`);
  add(from, { kind: "kept", to: [from], explanation: "term kept with v2 ids; its v1 type names are search aliases", source: "workspace-inputs/terminology.yaml" });
}
// v1 sidecar ids not in the v1 map are an error (every old id must route).
const missing = [];
for (const t of v1Sidecar("terminology.yaml").terms) for (const id of t.ids) if (!aliases[id] && !/^(dom|task):/.test(id)) missing.push(id);
for (const t of v1Sidecar("task-routes.yaml").tasks) {
  for (const n of t.nodeTypes ?? []) if (!aliases[`node:${n}`]) missing.push(`node:${n}`);
  for (const r of t.relationshipTypes ?? []) if (!aliases[`rel:${r}`]) missing.push(`rel:${r}`);
}
for (const d of v1Sidecar("domains.yaml").domains) for (const n of d.entryTypes ?? []) if (!aliases[`node:${n}`]) missing.push(`node:${n}`);
if (missing.length) throw new Error(`v1 sidecar ids without an alias: ${[...new Set(missing)].join(", ")}`);

const sorted = Object.fromEntries(Object.entries(aliases).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
const counts = {};
for (const a of Object.values(sorted)) counts[a.kind] = (counts[a.kind] ?? 0) + 1;
const aliasesDoc = {
  format: "bks-workspace-aliases.v1",
  releaseId: RELEASE_ID,
  rule: "Old v1 workspace ids resolve here: kept (still live), renamed / merged / split (to live v2 ids), removed (no substitute type; the explanation says where the meaning went, seeAlso names related live ids). Navigation only, never an execution script; data migration is migration/v1-map.yaml and migration/legacy-map.yaml (S8).",
  counts: { total: Object.keys(sorted).length, byKind: counts },
  aliases: sorted,
};

const header = (title, decisions) => `# ${title}, release ${RELEASE_ID}.\n# GENERATED by scripts/release/bootstrap-workspace-inputs.mjs (FU-09; ${decisions}) from the release registers, vocabularies,\n# migration/v1-map.yaml and the v1 sidecars at BKS ${BKS_COMMIT.slice(0, 7)}; re-run the script instead of editing by hand.\n`;
const out = new Map([
  ["workspace-inputs/identity-rules.yaml", toYaml(identityRules, header("Identity resolution rules", "KN-06, MD-X-01, R-42"))],
  ["workspace-inputs/aliases.yaml", toYaml(aliasesDoc, header("Workspace navigation aliases (v1 -> v2)", "FU-09, OD-04"))],
]);
if (flag("--check")) {
  const drift = [...out].filter(([p, t]) => !existsSync(resolve(releaseDir, p)) || readFileSync(resolve(releaseDir, p), "utf8") !== t).map(([p]) => p);
  console.log(JSON.stringify({ ok: drift.length === 0, drift }, null, 2));
  process.exit(drift.length ? 1 : 0);
}
const changed = writeTree(releaseDir, out);
console.log(JSON.stringify({ ok: true, changed, identityTypes: Object.keys(types).length, normalizationSchemes: Object.keys(identifierNormalization).length, skippedRegisterEntries: unknownSchemes.length, aliases: aliasesDoc.counts }, null, 2));
