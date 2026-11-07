/**
 * FU-06: canonical capture-method registry and the classification of every fixture captureMethod value.
 *
 *   buildCaptureMethodRegistry({ finalDir, actionSpaceText }) -> { files: Map<relPath, text>, report }
 *     files: vocabularies/capture-methods.yaml, reports/capture-methods.json
 *
 * Registry ids are the action-space entry ids (tooling/action-space.yaml, R-39 "<id>/<version>" convention).
 * Classification of a fixture value (extraction identical to final/_work/lint-capture-methods.mjs, so the totals
 * reconcile with the close-out measurement 579 values / 164 distinct):
 *   canonical  the value starts with a registry id
 *   mapped     ONLY through an explicit rule of RULES below (the free text names exactly one registry tool/API as the
 *              capture step; the matched evidence substring is recorded) or an explicit packet-scoped action-space alias
 *              written in the value (`tool:<alias>`), resolved through the action-space alias table of that packet
 *   ambiguous  no rule; an explicit error that needs adapter evidence (no mechanical guess)
 * The human description (the original free text) is always retained beside the id. Deterministic.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { YAML, orderedJson, toYaml, RELEASE_ID } from "./common.mjs";

/**
 * Explicit, reviewable rule table. `match` is tested against the value; `evidence` is the substring that names the tool.
 * Order matters only for readability; a value matching rules with different targets is ambiguous (reported).
 * `projection` names a registered text projection the value also states (EX-05 transformation, not the capture tool).
 */
const RULES = [
  { id: "firecrawl", match: /^firecrawl[\s\-/]|^Firecrawl CLI\b/i, target: "firecrawl-cli", why: "Firecrawl CLI 1.23.1 / MCP scrape (registry provider 'Firecrawl (CLI 1.23.1 + MCP)')" },
  { id: "tavily", match: /^(tavily-extract|tvly extract)\b/, target: "tavily-cli", why: "Tavily CLI 0.1.5 extract" },
  { id: "eutils", match: /NCBI E-utilities|\beutils efetch\b/, target: "ncbi-eutils-pubmed", why: "NCBI E-utilities efetch (registry ncbi-eutils-pubmed; aliases include D3:pmc-jats)" },
  { id: "crossref-labs", match: /Crossref Labs/, target: "crossref-labs", why: "Crossref Labs API" },
  { id: "crossref-rest", match: /Crossref REST/, target: "crossref-rest", why: "Crossref REST API" },
  { id: "epmc-fulltext", match: /Europe PMC REST fullTextXML|europepmc-rest fullTextXML/, target: "europepmc-fulltext-jats", why: "Europe PMC fullTextXML (JATS full text)" },
  { id: "epmc-search", match: /europepmc-rest search/, target: "europepmc-rest", why: "Europe PMC REST search" },
  { id: "epmc-bare", match: /^curl\/europepmc-rest$/, target: "europepmc-rest", why: "value names the registry id europepmc-rest" },
  { id: "dsld", match: /NIH DSLD API|\bdsld-api-v9\b/, target: "nih-dsld", why: "NIH DSLD API v9" },
  { id: "sec-edgar", match: /SEC EDGAR|data\.sec\.gov|\bsec-archives\b|\bsec-edgar-http\b|EDGAR_IDENTITY/, target: "sec-edgar", why: "SEC EDGAR (Archives / data.sec.gov; EDGAR identity User-Agent)" },
  { id: "shopify", match: /Shopify \/products/, target: "shopify-storefront-json", why: "Shopify storefront public JSON" },
  { id: "wikidata", match: /Wikidata Special:EntityData/, target: "wikidata", why: "Wikidata Special:EntityData" },
  { id: "faers", match: /openFDA drug\/event/, target: "openfda-faers", why: "openFDA drug/event (FAERS)" },
  { id: "openfda-label", match: /openFDA drug label API|openFDA drug\/label/, target: "openfda-drug-label", why: "openFDA drug/label" },
  { id: "drugsfda", match: /openFDA drugsfda/, target: "openfda-drugsfda", why: "openFDA drug/drugsfda" },
  { id: "food-enforcement", match: /openFDA food\/enforcement/, target: "openfda-food-enforcement", why: "openFDA food/enforcement" },
  { id: "openfda-device", match: /openFDA device\//, target: "openfda-device", why: "openFDA device endpoints" },
  { id: "wayback", match: /Wayback|wayback|web\.archive\.org/, target: "internet-archive-wayback", why: "Internet Archive Wayback id_ raw replay" },
  { id: "ecfr", match: /eCFR versioner|\becfr-versioner\b/, target: "ecfr-versioner", why: "eCFR versioner API" },
  { id: "ctgov", match: /ClinicalTrials\.gov API v2|\bctgov-api-v2\b/, target: "ctgov-v2-api", why: "ClinicalTrials.gov API v2 (alias D1:tool:ctgov-api-v2)" },
  { id: "isrctn", match: /ISRCTN query API/, target: "isrctn", why: "ISRCTN registry API" },
  { id: "openalex", match: /OpenAlex/, target: "openalex", why: "OpenAlex API" },
  { id: "regulations-api", match: /regulations\.gov API v4/, target: "regulations-gov-api", why: "regulations.gov API v4" },
  { id: "dailymed", match: /DailyMed/, target: "dailymed-spl", why: "NLM DailyMed web services / SPL zip" },
  { id: "fdc", match: /FDC API v1/, target: "usda-fdc", why: "USDA FoodData Central API v1" },
  { id: "bioc", match: /NCBI BioC PMC OA API/, target: "ncbi-bioc-pmcoa", why: "NCBI BioC PMC OA API" },
  { id: "pubchem", match: /PubChem PUG REST|\bpubchem-pug-rest\b/, target: "pubchem-pug-rest", why: "PubChem PUG REST" },
  { id: "ols4", match: /(tool:ebi-ols4)/, target: "ebi-ols4-chebi", why: "EMBL-EBI OLS4 (aliases D2:tool:ols4, D11:ebi-ols4-chebi)" },
  { id: "quickgo", match: /(tool:quickgo-api)/, target: "quickgo", why: "EMBL-EBI QuickGO API (alias D2:tool:quickgo)" },
  { id: "gsrs", match: /\bgsrs-api(-v1)?\b/, target: "fda-gsrs", why: "GSRS API (alias D1:tool:gsrs-api)" },
  { id: "lnhpd", match: /\blnhpd-api\b/, target: "health-canada-lnhpd", why: "Health Canada LNHPD API (alias D1:tool:lnhpd-api)" },
  { id: "gleif", match: /\bgleif-api-v1\b/, target: "gleif-lei", why: "GLEIF API (alias D7:tool:gleif-api)" },
  { id: "reporter", match: /\bnih-reporter-api-v2\b/, target: "nih-reporter", why: "NIH RePORTER API v2 (alias D7:tool:nih-reporter-api)" },
  { id: "discourse", match: /Discourse topic JSON/, target: "community-forums", why: "Discourse JSON (alias D5:tool:discourse-json)" },
  { id: "apple-docs", match: /Apple documentation JSON endpoint/, target: "wearable-api-docs", why: "Apple developer docs JSON (alias D4:tool:apple-developer-docs-json)" },
  { id: "oura-docs", match: /cloud\.ouraring\.com\/v2\/docs/, target: "wearable-api-docs", why: "Oura OpenAPI (alias D4:tool:oura-openapi)" },
  { id: "fda-media", match: /FDA media download/, target: "fda-web-pages", why: "fda.gov media download (alias D10:tool:fda-media-pdf)" },
  { id: "local-repo", match: /^local file read of the private repository/, target: "local-contracts", why: "local repository read (registry local-contracts: local repositories)" },
  // Plain HTTP capture of an origin URL that names no API or site with a dedicated registry entry: the registry's
  // http-capture entry is defined as exactly this ("plain HTTP capture with curl (raw bytes; browser User-Agent where needed)").
  { id: "http-generic", match: /^curl(\/8| 8\.x| 8\.2\.1)?( \(browser User-Agent\)| \(no auth\)| -A 'Mozilla\/5\.0' \(origin HTML, no rendering\))?$|^curl\/8 \(browser User-Agent\)$|^curl \(browser User-Agent\)$|^curl 8\.x \(browser User-Agent\)$/, target: "http-capture", why: "plain curl of an origin URL, no API named (registry http-capture)" },
  { id: "http-pdftotext", match: /^curl \+ pdftotext -layout$/, target: "http-capture", projection: "poppler-pdftotext", why: "plain curl then poppler pdftotext (projection recorded separately)" },
];
/** Projections stated in addition to the capture tool. */
const PROJECTIONS = [{ match: /h2t-v1 projection/, projection: "html-text-projection" }];

function walk(dir) {
  return readdirSync(dir)
    .sort()
    .flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? walk(p) : [p];
    });
}

export function buildCaptureMethodRegistry({ finalDir, actionSpaceText }) {
  const as = YAML.parse(actionSpaceText);
  const ids = new Set(as.entries.map((e) => e.id));
  const aliasTable = as.aliases ?? {};

  const registry = {
    format: "bks-capture-methods.v1",
    releaseId: RELEASE_ID,
    decision: "FU-06 (R-39): a captureMethod is '<registry id>/<version> <free-text human description>'; the id is one of these entries; ambiguous historical values stay errors until adapter evidence names the tool.",
    source: "tooling/action-space.yaml (registry biotech-action-space, version 2)",
    entries: as.entries
      .map((e) => ({ id: e.id, class: e.class, provider: e.provider, kind: [...(e.kind ?? [])], access: [...(e.access ?? [])], aliases: [...(e.aliases ?? [])].sort() }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  };

  const root = join(finalDir, "fixtures");
  const files = walk(root).filter((f) => /(assertions\.yaml|locators\.yaml|intent[^\/\\]*\.json)$/.test(f));
  const occ = new Map(); // value -> { count, files:Set, packets:Set }
  let total = 0;
  for (const f of files) {
    const rel = relative(root, f).split(sep).join("/");
    const packet = rel.split("/")[0];
    const t = readFileSync(f, "utf8");
    for (const m of t.matchAll(/captureMethod"?\s*:\s*("(?:[^"\\]|\\.)*"|'[^']*'|[^\n,}]+)/g)) {
      const v = m[1].trim().replace(/^["']|["']$/g, "");
      total++;
      const o = occ.get(v) ?? { count: 0, files: new Set(), packets: new Set() };
      o.count++;
      o.files.add(rel);
      o.packets.add(packet);
      occ.set(v, o);
    }
  }

  const classify = (value, packets) => {
    const prefix = value.split(/[\/\s(]/)[0];
    if (ids.has(prefix)) return { classification: "canonical", id: prefix, evidence: prefix };
    // Packet-scoped action-space alias written in the value: "(tool:<alias>)".
    const am = value.match(/\(tool:([a-z0-9-]+)\)/);
    if (am) {
      const targets = new Set([...packets].map((p) => aliasTable[`${p}:tool:${am[1]}`]).filter(Boolean));
      if (targets.size === 1 && [...packets].every((p) => aliasTable[`${p}:tool:${am[1]}`])) return { classification: "mapped", id: [...targets][0], rule: `alias:${[...packets].map((p) => `${p}:tool:${am[1]}`).join("|")}`, evidence: am[0] };
      // Value from a packet without that alias (cross-domain fixtures): accept only when every packet alias of that name agrees.
      const anyKeys = Object.keys(aliasTable).filter((k) => k.endsWith(`:tool:${am[1]}`)).sort();
      const anyTargets = new Set(anyKeys.map((k) => aliasTable[k]));
      if (anyKeys.length && anyTargets.size === 1) return { classification: "mapped", id: [...anyTargets][0], rule: `alias-all-packets-agree:${anyKeys.join("|")}`, evidence: am[0] };
    }
    const hits = RULES.filter((r) => r.match.test(value));
    const targets = new Set(hits.map((r) => r.target));
    if (targets.size === 1) {
      const r = hits[0];
      const ev = value.match(r.match)?.[0] ?? "";
      const projection = r.projection ?? PROJECTIONS.find((p) => p.match.test(value))?.projection;
      return { classification: "mapped", id: r.target, rule: hits.map((h) => h.id).join("+"), evidence: ev, why: r.why, ...(projection ? { projection } : {}) };
    }
    if (targets.size > 1) return { classification: "ambiguous", reason: `rules disagree: ${hits.map((h) => `${h.id}->${h.target}`).join(", ")}` };
    return { classification: "ambiguous", reason: "free text names no registry tool/API unambiguously; needs adapter evidence (no mechanical guess)" };
  };

  const values = [...occ.keys()].sort().map((value) => {
    const o = occ.get(value);
    return { value, occurrences: o.count, packets: [...o.packets].sort(), files: [...o.files].sort(), humanDescription: value, ...classify(value, o.packets) };
  });
  const sum = (cls, key) => values.filter((v) => v.classification === cls).reduce((a, v) => a + (key === "values" ? v.occurrences : 1), 0);
  const counts = {
    values: total,
    distinct: values.length,
    canonical: { values: sum("canonical", "values"), distinct: sum("canonical") },
    mapped: { values: sum("mapped", "values"), distinct: sum("mapped") },
    ambiguous: { values: sum("ambiguous", "values"), distinct: sum("ambiguous") },
  };
  const reconciled = counts.canonical.values + counts.mapped.values + counts.ambiguous.values === total && counts.canonical.distinct + counts.mapped.distinct + counts.ambiguous.distinct === values.length;
  const reportDoc = {
    format: "bks-capture-method-report.v1",
    releaseId: RELEASE_ID,
    decision: "FU-06",
    scope: "schema/program/final/fixtures/**/{assertions.yaml,locators.yaml,intent*.json} (BKS 431c8a7); extraction identical to final/_work/lint-capture-methods.mjs (values the regex truncates at ',' or '}' are counted as extracted, as in the close-out measurement)",
    counts,
    reconciled,
    note: "Fixtures are not rewritten here (FU-03 fixture round, S3). 'ambiguous' values are explicit errors: each needs adapter evidence naming the capture tool before a canonical id is written.",
    rules: RULES.map((r) => ({ id: r.id, target: r.target, match: String(r.match), why: r.why, ...(r.projection ? { projection: r.projection } : {}) })),
    values,
  };
  const out = new Map();
  out.set("vocabularies/capture-methods.yaml", toYaml(registry, "# GENERATED by scripts/release/lib/capture-methods.mjs from tooling/action-space.yaml; do not edit by hand.\n"));
  out.set("reports/capture-methods.json", orderedJson(reportDoc));
  return { files: out, report: { counts, reconciled, ambiguous: values.filter((v) => v.classification === "ambiguous").map((v) => v.value) } };
}
