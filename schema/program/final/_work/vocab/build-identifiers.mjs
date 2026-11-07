// Merge K identifier-schemes.yaml v2 + D11 identifier-bridges.yaml + final node-register identifierSchemes + R-42 additions
// into final/vocabularies/identifier-schemes.yaml. usage: node build-identifiers.mjs <worktree>
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

const wt = process.argv[2];
const P = (p) => resolve(wt, "schema/program", p);
const require = createRequire(resolve(wt, "packages/schema-workspace/package.json"));
const YAML = require("yaml");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const load = (p) => YAML.parse(readFileSync(P(p), "utf8"));

const K = load("packets/K/identifier-schemes.yaml");
const D11 = load("packets/D11/identifier-bridges.yaml");
const NR = load("final/node-register.yaml");

// ---- alias map from D11 / free spellings to kernel codes
const ALIAS = { EU_CT: "EUCT", EudraCT: "EUDRACT", DSLD_LABEL_ID: "DSLD", MESH_UI: "MESH", CIK: "SEC_CIK", NCIt: "NCIT", ticker: "TICKER", "MONDO/EFO": ["MONDO", "EFO"] };

// ---- R-42 additions (decision-report R-42; packets/D11 rows; packets/D12/11-open-questions.md OQ-D12-08)
const d11Row = (s) => D11.schemes.find((r) => r.scheme === s);
const added = [
  { code: "SPL_SET_ID", name: "FDA Structured Product Labeling set id (label lineage)", issuer: d11Row("SPL_SET_ID").issuer, pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", patternOrigin: "S: regex form of D11's 'UUID' over the uuid-lower-v1 normalized value", normalization: "lower-case UUID; the version number and effectiveTime identify one label version and are not part of the value", domains: ["D11"], requestedBy: "D11 (Q-D11-11, CQ-PV-05)" },
  { code: "EIN", name: "US Employer Identification Number", issuer: d11Row("EIN").issuer, pattern: d11Row("EIN").pattern, normalization: "digits only (remove the hyphen)", domains: ["D11"], requestedBy: "D11 (Q-D11-15)" },
  { code: "ORG_STUDY_ID", name: "sponsor's organization study id (registry secondary id)", issuer: "the sponsor (issuer = sponsor organization uid)", pattern: null, normalization: "as published; never compared across sponsors (issuer scoping mandatory)", domains: ["D11"], requestedBy: "D11 (bridge B04)" },
  { code: "NDB_NUMBER", name: "USDA SR NDB number", issuer: "USDA ARS (Standard Reference)", pattern: null, normalization: "digits only", domains: ["D12"], requestedBy: "D12 (OQ-D12-08)" },
  { code: "FNDDS_FOOD_CODE", name: "FNDDS survey food code (with validity window)", issuer: "USDA ARS (FNDDS)", pattern: "^[0-9]{8}$", patternOrigin: "OQ-D12-08 '8-digit'", normalization: "digits only; the FNDDS release validity window is Identifier.validFrom/validTo", domains: ["D12"], requestedBy: "D12 (OQ-D12-08)" },
  { code: "FOODON", name: "FoodOn ontology term", issuer: "FoodOn (OBO Foundry)", pattern: "^FOODON_[0-9]{8}$", patternOrigin: "OQ-D12-08 'FOODON_nnnnnnnn'", normalization: "IRI local part in underscore form", domains: ["D12"], requestedBy: "D12 (OQ-D12-08)" },
  { code: "PHENOL_EXPLORER_FOOD", name: "Phenol-Explorer food id", issuer: "Phenol-Explorer (phenol-explorer.eu)", pattern: null, normalization: "as published", domains: ["D12"], requestedBy: "D12 (OQ-D12-08)" },
  { code: "WWEIA_CATEGORY", name: "WWEIA food category code", issuer: "USDA ARS (What We Eat in America)", pattern: "^[0-9]{4}$", patternOrigin: "OQ-D12-08 '4-digit'", normalization: "digits only", domains: ["D12"], requestedBy: "D12 (OQ-D12-08)" },
  { code: "FOODEX2", name: "EFSA FoodEx2 term code", issuer: "EFSA", pattern: null, normalization: "as published", domains: ["D12"], requestedBy: "D12 (OQ-D12-08)" },
  { code: "LANGUAL", name: "LanguaL facet code", issuer: "LanguaL (food description thesaurus)", pattern: null, normalization: "as published", domains: ["D12"], requestedBy: "D12 (OQ-D12-08)" },
];

// ---- normalization rule ids: D11's ids where a D11 row exists, else minted by S (R-42)
const d11ByKernel = {};
for (const r of D11.schemes) {
  const kc = /^[A-Z][A-Z0-9_]+$/.test(String(r.kernelCode)) ? r.kernelCode : (/requested: ([A-Z_]+)/.exec(String(r.kernelCode)) || [])[1];
  if (kc) d11ByKernel[kc] = r;
}
const mintRule = (code, text) => {
  const t = String(text || "").toLowerCase().trim();
  if (t === "digits only") return "digits-v1";
  if (t === "upper case") return "upper-v1";
  if (t.startsWith("as published") || t.startsWith("as printed")) return "verbatim-v1";
  return code.toLowerCase().replace(/_/g, "-") + "-v1";
};

// ---- node register usage (final names)
const usedBy = {};
const unparsed = [];
for (const n of NR.nodes) {
  for (const s of n.identifierSchemes || []) {
    const m = /^([A-Z][A-Z0-9_]+)\b/.exec(String(s));
    if (!m) { unparsed.push(`${n.module}.${n.name}: ${s}`); continue; }
    (usedBy[m[1]] ||= new Set()).add(`${n.module}.${n.name}`);
  }
}

// ---- D11 reconciliation (routes, readiness)
const recon = Object.fromEntries((D11.reconciliation?.schemes || []).map((r) => [r.code, r]));

// ---- bridge table normalized to kernel codes
const codeOf = (s) => {
  const base = String(s).replace(/\s*\(.*\)\s*$/, "").trim();
  const a = ALIAS[base] ?? base;
  return a;
};
const bridgeTable = D11.bridges.map((b) => {
  const from = [].concat(codeOf(b.from)).flat();
  const to = [].concat(b.to).flatMap((t) => [].concat(codeOf(t)));
  return { id: b.id, from, to, fromAsWritten: b.from, toAsWritten: b.to, via: b.via, kind: b.kind, readiness: b.readiness, ...(b.gap ? { gap: b.gap } : {}), failureModes: b.failureModes };
});

// ---- merge
const crosswalk = Object.fromEntries((K.crosswalk || []).map((c) => [c.code, c]));
const kCodes = new Set(K.schemes.map((s) => s.code));
const all = [...K.schemes.map((s) => ({ ...s, _origin: s.status === "requested" ? "K-v2" : "K-v1" })), ...added.map((s) => ({ ...s, status: "requested", _origin: "S-R-42" }))];
const codes = new Set(all.map((s) => s.code));
const entries = [];
for (const s of all) {
  const d = d11ByKernel[s.code];
  const d11Rule = d ? String(d.normalizationRule).split(/\s/)[0] : null;
  const ruleId = d11Rule && d11Rule !== "none" ? d11Rule : mintRule(s.code, s.normalization);
  const kb = (s.bridgesTo || []).map((t) => ({ to: t, basis: "K register bridgesTo" }));
  const ob = bridgeTable.filter((b) => b.from.includes(s.code) || b.to.includes(s.code)).map((b) => ({
    bridge: b.id, direction: b.from.includes(s.code) ? "from" : "to",
    other: (b.from.includes(s.code) ? b.to : b.from).filter((c) => c !== s.code), kind: b.kind, readiness: b.readiness,
  }));
  const r = recon[s.code];
  const patternNotes = [];
  if (d && d.pattern && s.pattern && d.pattern !== s.pattern) patternNotes.push(`D11 pattern ${JSON.stringify(d.pattern)} differs; the K pattern is kept (precedence: kernel packet over D11; R-42: patterns validate the normalized value)`);
  if (d && d.pattern && !s.pattern && /^\^/.test(d.pattern)) patternNotes.push(`D11 pattern ${JSON.stringify(d.pattern)} available`);
  entries.push({
    code: s.code,
    name: s.name,
    authority: s.issuer,
    pattern: s.pattern ?? null,
    ...(s.patternOrigin ? { patternOrigin: s.patternOrigin } : {}),
    normalization: { rule: ruleId, ruleOrigin: d11Rule && d11Rule !== "none" ? "D11 identifier-bridges.yaml (proposed id)" : "S (R-42), rule text from " + (s._origin === "S-R-42" ? "the requesting packet" : "K"), text: s.normalization ?? null },
    checkDigit: d?.checkDigit ?? null,
    resolver: s.resolver ?? null,
    bridges: [...kb, ...ob],
    usedByNodeTypes: [...(usedBy[s.code] || [])].sort(),
    domains: s.domains || [],
    authorityRoutes: r ? r.routes : (d?.authorityRoute ? [d.authorityRoute] : []),
    bestRouteReadiness: r ? r.bestRouteReadiness : null,
    ...(crosswalk[s.code] ? { crosswalk: { bioregistryPrefix: crosswalk[s.code].bioregistryPrefix, wikidataProperty: crosswalk[s.code].wikidataProperty, verifiedBy: crosswalk[s.code].verifiedBy } } : {}),
    status: s.status === "requested" ? "requested" : "seed",
    registeredBy: s._origin,
    ...(s.requestedBy ? { requestedBy: s.requestedBy } : {}),
    ...(patternNotes.length ? { notes: patternNotes } : {}),
    sources: [
      s._origin === "S-R-42" ? "final/decision-report.md R-42" : "packets/K/identifier-schemes.yaml v2",
      ...(d ? [`packets/D11/identifier-bridges.yaml schemes[${d.scheme}]`] : []),
      ...(r ? ["packets/D11/identifier-bridges.yaml reconciliation"] : []),
      ...(usedBy[s.code] ? ["final/node-register.yaml identifierSchemes"] : []),
    ],
  });
}
entries.sort((a, b) => a.code.localeCompare(b.code));

// ---- checks
const problems = [];
for (const [c, set] of Object.entries(usedBy)) if (!codes.has(c)) problems.push(`node register uses ${c} (${[...set]}) not in the register`);
for (const e of entries) {
  if (e.pattern) { try { new RegExp(e.pattern); } catch (err) { problems.push(`${e.code}: pattern does not compile: ${err.message}`); } }
  for (const b of e.bridges) if (b.to && !codes.has(b.to)) problems.push(`${e.code}: K bridgesTo ${b.to} not a register code`);
}
const bridgeUnknown = [...new Set(bridgeTable.flatMap((b) => [...b.from, ...b.to]).filter((c) => !codes.has(c)))];
const notAdded = (D11.reconciliation?.missingFromKernel || []).filter((c) => !codes.has(c));
const unusedCodes = entries.filter((e) => !e.usedByNodeTypes.length).map((e) => e.code);

const out = {
  version: 3,
  status: "synthesis-final-candidate",
  published: "2026-10-09",
  owner: "K (register); D11 (bridge table and routes)",
  rules: {
    identity: "An Identifier is (scheme, issuer, normalized value). The same (scheme, value) from two issuers is two Identifiers and never establishes identity; names never establish identity (K register header).",
    uniqueness: "One (scheme, issuer, normalized value) identifies at most one Subjectable; the executor enforces it. Cross-type joins through a shared Identifier are not a modeling pattern (R-42; renditions use RENDITION_OF, R-43; condition-coded targets use TargetMeasure, R-70).",
    schemeField: "Identifier.scheme is a String code validated against this register, not a GraphQL enum (D11 kernelRecommendations, accepted); the register grows without a schema change.",
    normalization: "Identifier.normalizationRule stores normalization.rule; the executor applies it before the uniqueness check, and `pattern` validates the normalized value (R-42).",
    registrationStatus: "Identifier.registrationStatus (D11 request) is declined: assignment status lives on the HAS_IDENTIFIER episode, a lapse is an Assertion; scheme-level validity of the string uses Identifier.validFrom / validTo (R-42).",
    bridges: "A bridge is never an Identifier→Identifier edge. Observed in an authority record: a HAS_IDENTIFIER Assertion citing the authority snapshot. Inferred by BellLabs: an Assessment of kind RESOLUTION or EQUIVALENCE until adjudicated (D11 header; kernel).",
    computed: "Computed identifiers (INCHIKEY) carry issuer = algorithm + version (D11 kernelRecommendations).",
    status: "seed = K v1 seed row; requested = added in K v2 or by synthesis (R-42); a requested code is usable by the executor, its pattern may be null (no verified pattern).",
  },
  fields: ["code", "name", "authority", "pattern", "normalization{rule,ruleOrigin,text}", "checkDigit", "resolver", "bridges", "usedByNodeTypes", "domains", "authorityRoutes", "bestRouteReadiness", "crosswalk", "status", "registeredBy", "requestedBy", "notes", "sources"],
  counts: {
    schemes: entries.length,
    seed: entries.filter((e) => e.status === "seed").length,
    requested: entries.filter((e) => e.status === "requested").length,
    addedBySynthesis: entries.filter((e) => e.registeredBy === "S-R-42").length,
    withPattern: entries.filter((e) => e.pattern).length,
    usedByAtLeastOneNodeType: entries.filter((e) => e.usedByNodeTypes.length).length,
    bridgeRows: bridgeTable.length,
  },
  schemes: entries,
  bridgeTable,
  noBridge: D11.noBridge,
  notRegistered: [
    ...notAdded.map((c) => ({ code: c, reason: c === "NCIT" ? "optional in D11 (observed on GSRS); R-42 adds only SPL_SET_ID, EIN, ORG_STUDY_ID and the seven D12 food schemes; request again with a question id" : "not requested by R-42" })),
    { code: "UCUM", reason: "a unit vocabulary (Assertion.unitCode), not an Identifier scheme (D11 schemes row UCUM)" },
  ],
  unusedByNodeRegister: unusedCodes,
  sources: {
    "packets/K/identifier-schemes.yaml": sha(P("packets/K/identifier-schemes.yaml")),
    "packets/D11/identifier-bridges.yaml": sha(P("packets/D11/identifier-bridges.yaml")),
    "final/node-register.yaml": sha(P("final/node-register.yaml")),
    "final/decision-report.md (R-42)": sha(P("final/decision-report.md")),
    "packets/D12/11-open-questions.md (OQ-D12-08)": sha(P("packets/D12/11-open-questions.md")),
  },
};
const header = `# Identifier scheme register — final vocabulary (synthesis, VOCABULARIES stage, 2026-10-09).
# GENERATED by scratch synth/vocab/build-identifiers.mjs (see final/_runlog/vocabularies.md); edit the inputs and re-run.
# Merges: packets/K/identifier-schemes.yaml v2 (kernel register, precedence) + packets/D11/identifier-bridges.yaml (rule ids,
# check digits, authority routes, readiness, bridge table) + every scheme the final node registers list
# (final/node-register.yaml identifierSchemes) + the R-42 additions (final/decision-report.md R-42).
# One entry per scheme. Identifier.scheme in final/schema/final_biotech_schema_v2.graphql is a String validated against \`code\`.
`;
writeFileSync(P("final/vocabularies/identifier-schemes.yaml"), header + YAML.stringify(out, { lineWidth: 0 }));
console.log(JSON.stringify({ ...out.counts, problems, unparsedRegisterItems: unparsed, bridgeCodesNotInRegister: bridgeUnknown, notRegistered: out.notRegistered.map((x) => x.code), unusedByNodeRegister: unusedCodes }, null, 1));
