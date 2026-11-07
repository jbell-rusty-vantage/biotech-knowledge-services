/**
 * validation/validation-params.json (bks-validation-params.v2, FU-08) from the release registers, predicate registry and SDL.
 * Keeps the v1 key names the services read (uidTypeTokens, assertedTypes, derivedTypes, ruleOnlyDerivedTypes,
 * exclusiveTypes, implicationPairs, registeredPredicates, privateUidTokens, publicAnswerExcludedLabels) with v2 content
 * only: no inherited v1 type, predicate or token.
 */
import { RELEASE_ID, uniqueSorted } from "./common.mjs";

/** "D4.Metric" | "Source (K)" | "K.Assessment" | "Subjectable (K interface)" -> SDL type name. */
export function registerTypeName(s) {
  return String(s).replace(/\s*\(.*\)\s*$/, "").replace(/^(K|D\d+)\./, "").trim();
}
export function asList(v) {
  return v === undefined || v === null ? [] : Array.isArray(v) ? v : [v];
}

/** Normalizes the node register `mutations.executor` text/list into executor operations. */
export function executorOpsOf(mutations) {
  const raw = mutations?.executor;
  const text = Array.isArray(raw) ? raw.join("; ") : String(raw ?? "");
  const t = text.toLowerCase();
  if (!t || t === "unstated") return { ops: [], policy: text || "unstated", stated: false };
  const ops = new Set();
  if (/\bcreate\b|node\.upsert|insert-only/.test(t)) ops.add("create");
  const updateForbidden = /never update|create only|immutable|insert-only|never updated/.test(t) && !/update (endedat|descriptive|projection|observation|logicalidentity)/.test(t);
  if (!updateForbidden && /\bupdate|rewritten|re-materiali[sz]e|re-anchors|reuses the row/.test(t)) ops.add("update");
  if (/close once|close with|close\b|recordedto|withdrawal|supersession/.test(t)) ops.add("close");
  if (/may delete/.test(t)) ops.add("delete-unreferenced");
  if (/\bdelete\b/.test(t) && !/never (update or )?delete|never update or delete|nothing is deleted|may delete/.test(t)) ops.add("delete");
  return { ops: [...ops].sort(), policy: text, stated: true };
}

export function buildValidationParams({ model, nodeRegister, relRegister, predicates, identifierSchemes, schemaDigest, releaseId = RELEASE_ID, operational = null }) {
  const problems = [];
  const nodeNames = new Set(model.nodes.keys());
  // uid tokens and executor permissions from the node register (every current node gets a token: FU-08)
  const uidTypeTokens = {};
  const executorOps = {};
  for (const n of nodeRegister.nodes) {
    if (!nodeNames.has(n.name)) problems.push(`node register names ${n.name}, absent from the SDL`);
    if (!n.uidToken) problems.push(`node ${n.name} has no uid token`);
    uidTypeTokens[n.name] = n.uidToken;
    executorOps[n.name] = executorOpsOf(n.mutations);
  }
  for (const name of nodeNames) if (!uidTypeTokens[name]) problems.push(`SDL node ${name} has no register uid token`);
  const tokens = Object.values(uidTypeTokens);
  if (new Set(tokens).size !== tokens.length) problems.push("duplicate uid tokens in the node register");
  // relationship classes from the relationship register (MEASURES asserted; HAS_VARIANT / REQUIRES_INPUT_METRIC structural)
  const classOf = new Map();
  const exclusive = new Set();
  const gates = {};
  for (const r of relRegister.relationships) {
    const prev = classOf.get(r.type);
    if (prev && prev !== r.class) problems.push(`relationship ${r.type} has classes ${prev} and ${r.class} in the register`);
    classOf.set(r.type, r.class);
    if (r.exclusive === true) exclusive.add(r.type);
    if (r.projectionGate) gates[r.type] = r.projectionGate;
  }
  for (const t of model.relTypes.keys()) if (!classOf.has(t)) problems.push(`SDL relationship ${t} is not in the relationship register`);
  for (const t of classOf.keys()) if (!model.relTypes.has(t)) problems.push(`register relationship ${t} is not in the SDL`);
  const byClass = (c) => uniqueSorted([...classOf].filter(([, v]) => v === c).map(([k]) => k));
  // derived types whose rule alone (no stored authorizing Assertion) produces them
  const ruleOnlyDerived = uniqueSorted(relRegister.relationships.filter((r) => r.class === "derived" && r.derivationRule).map((r) => r.type));
  // predicates
  const registered = [];
  const aliases = {};
  const retired = {};
  for (const p of predicates.predicates) {
    if (p.status === "registered") registered.push(p.predicate);
    else if (p.status.startsWith("alias-of:")) aliases[p.predicate] = p.status.slice("alias-of:".length);
    else if (p.status.startsWith("retired-by:")) retired[p.predicate] = { ruling: p.status.slice("retired-by:".length), replacedBy: asList(p.replacedBy) };
  }
  for (const [a, target] of Object.entries(aliases)) if (!registered.includes(target)) problems.push(`alias ${a} -> ${target} is not registered`);
  // forbidden implications at the predicate / relationship-type level (v2 names only)
  const v2Names = new Set([...registered, ...model.relTypes.keys()]);
  const implicationPairs = [
    ["HOLDS_ROLE", "RECOMMENDS_USE", "a role (advisor, employee, officer) never implies a recommendation or endorsement (pinned ADVISES_ORGANIZATION -> ENDORSES_PRODUCT; migration-notes 5.7 ingest-03)"],
    ["RECEIVES_VALUE_FROM", "RECOMMENDS_USE", "a financial interest never implies a recommendation (pinned HAS_FINANCIAL_INTEREST -> ENDORSES_PRODUCT)"],
    ["CONTENT_SPONSORED_BY", "RECOMMENDS_USE", "sponsorship of content never implies endorsement (pinned SPONSORS_CONTENT -> ENDORSES_PRODUCT)"],
    ["HOLDS_STAKE", "OWNS_BRAND", "a stake never implies brand ownership (MD-D7-08: OWNS_BRAND requires ownership evidence)"],
    ["OPERATED_BY", "OWNS_BRAND", "operating a brand or channel is not ownership (MD-D7-08)"],
    ["LISTING_FOR", "SELLER_OF_RECORD", "hosting a listing never implies being the seller of record (pinned HOSTS_LISTING -> SELLS_PRODUCT)"],
    ["MEASURED_CONTENT_IN_PRODUCT", "DECLARES_COMPONENT", "a lab measurement never becomes a label declaration (FX-05)"],
    ["LICENSED_TO", "STATUS_OF", "licence validity never implies market presence or approval status (MD-D8-02, MD-D10-05)"],
  ].filter(([a, b, why]) => {
    const ok = v2Names.has(a) && v2Names.has(b);
    if (!ok) problems.push(`implication pair ${a} -> ${b} names a non-v2 name (${why})`);
    return ok;
  });
  const activeSchemes = identifierSchemes.schemes.filter((s) => s.writeStatus === "active").map((s) => s.code).sort();
  // labels and edge profiles
  const nodeLabels = {};
  for (const n of model.nodes.values()) nodeLabels[n.name] = n.labels;
  const edgeProfiles = {};
  for (const [t, r] of model.relTypes) edgeProfiles[t] = [...r.properties].sort();
  return {
    params: {
      format: "bks-validation-params.v2",
      releaseId,
      schemaDigest,
      generatedBy: "scripts/release/generate.mjs (lib/params.mjs)",
      uidTypeTokens,
      uidPattern: "^hu:<token>:<opaque>$",
      privateUidTokens: [],
      privateUidTokensNote: "v2 holds no private-personal node type (private context is a separate store, round 0008); any uid starting hu:private- or urn:hu:private is rejected by the executor",
      publicAnswerExcludedLabels: [],
      publicAnswerExcludedLabelsNote: "no v1 label exclusion is inherited (its labels are v1-only); answer visibility is per record (privacyClass) under the S4/S6 visibility rules",
      assertedTypes: byClass("asserted"),
      structuralTypes: byClass("structural"),
      derivedTypes: byClass("derived"),
      ruleOnlyDerivedTypes: ruleOnlyDerived,
      exclusiveTypes: [...exclusive].sort(),
      exclusivityScope: "(subject, relationship/predicate slot, asserter): same-asserter overlap rejected, different asserters coexist (OD-05)",
      projectionGates: gates,
      implicationPairs: implicationPairs.map(([a, b]) => [a, b]),
      implicationNotes: Object.fromEntries(implicationPairs.map(([a, b, why]) => [`${a}->${b}`, why])),
      registeredPredicates: registered.sort(),
      predicateAliases: aliases,
      retiredPredicates: retired,
      activeIdentifierSchemes: activeSchemes,
      nodeLabels,
      edgeProfiles,
      executorOps,
      legacyTypes: [],
      ...(operational ? { operationalNames: operationalParams(operational, model, problems) } : {}),
    },
    problems,
  };
}

/**
 * v2.0.1+: release-known operational names (rules/operational-names.yaml). They are not SDL types: validators and the
 * planner recognize them (so a legacy label or MIGRATED_FROM edge is never mistaken for an unknown or v2 domain name),
 * never project them, and never let an ordinary agent write them.
 */
function operationalParams(op, model, problems) {
  const v2Labels = new Set(model.labels);
  for (const l of op.labels) if (v2Labels.has(l.name)) problems.push(`operational label ${l.name} collides with a v2 SDL label`);
  for (const r of op.relationshipTypes) if (model.relTypes.has(r.name)) problems.push(`operational relationship ${r.name} collides with a v2 SDL relationship type`);
  return {
    class: "operational",
    labels: op.labels.map((l) => l.name).sort(),
    relationshipTypes: op.relationshipTypes.map((r) => r.name).sort(),
    properties: op.properties.map((p) => p.name).sort(),
    qualifierPrefixes: op.qualifierFamilies.flatMap((f) => f.members).sort(),
    projection: "excluded",
    agentWrite: "forbidden",
    writers: [...new Set([...op.labels, ...op.relationshipTypes, ...op.properties].flatMap((x) => x.writers ?? []))].sort(),
    source: "rules/operational-names.yaml",
  };
}
