/**
 * Operational DDL (FU-07, MD-D9-03 a, FU-14 d, INTERFACES section 6) from the release SDL, registers and query sources.
 *   ddl/required.cypher   community-compatible required constraints and indexes (stable names)
 *   ddl/enterprise.cypher capability-gated Enterprise additions (existence / property-type constraints)
 *   ddl/optional.cypher   optional, disabled-by-default profiles (OD-44 vectors)
 *   ddl/ddl.json          machine list: name, kind, type, entity, labelsOrTypes, properties, statement, requirement,
 *                         edition, file, source, purpose; plus readiness checks and bootstrap commands
 */
import { RELEASE_ID } from "./common.mjs";

const q = (s) => (/^[A-Za-z_][A-Za-z0-9_]*$/.test(s) ? s : `\`${s}\``);

function nodeUnique(name, label, props) {
  const req = props.length === 1 ? `n.${q(props[0])}` : `(${props.map((p) => `n.${q(p)}`).join(", ")})`;
  return `CREATE CONSTRAINT ${name} IF NOT EXISTS FOR (n:${q(label)}) REQUIRE ${req} IS UNIQUE`;
}
function nodeRange(name, label, props) {
  return `CREATE INDEX ${name} IF NOT EXISTS FOR (n:${q(label)}) ON (${props.map((p) => `n.${q(p)}`).join(", ")})`;
}
function relRange(name, type, props) {
  return `CREATE INDEX ${name} IF NOT EXISTS FOR ()-[r:${q(type)}]-() ON (${props.map((p) => `r.${q(p)}`).join(", ")})`;
}
function fulltext(name, labels, props) {
  return `CREATE FULLTEXT INDEX ${name} IF NOT EXISTS FOR (n:${labels.map(q).join("|")}) ON EACH [${props.map((p) => `n.${q(p)}`).join(", ")}]`;
}
function vector(name, label, prop, dims, fn) {
  return `CREATE VECTOR INDEX ${name} IF NOT EXISTS FOR (n:${q(label)}) ON (n.${q(prop)}) OPTIONS { indexConfig: { \`vector.dimensions\`: ${dims}, \`vector.similarity_function\`: '${fn}' } }`;
}
function nodeExists(name, label, prop) {
  return `CREATE CONSTRAINT ${name} IF NOT EXISTS FOR (n:${q(label)}) REQUIRE n.${q(prop)} IS NOT NULL`;
}
function nodeType(name, label, prop, type) {
  return `CREATE CONSTRAINT ${name} IF NOT EXISTS FOR (n:${q(label)}) REQUIRE n.${q(prop)} IS :: ${type}`;
}
function relExists(name, type, prop) {
  return `CREATE CONSTRAINT ${name} IF NOT EXISTS FOR ()-[r:${q(type)}]-() REQUIRE r.${q(prop)} IS NOT NULL`;
}

/** Parses `CREATE ...` statements of a DDL block into structured specs. */
export function parseDdlStatements(text) {
  const out = [];
  for (const raw of text.split(/;\s*(?:\n|$)/)) {
    const s = raw.split("\n").filter((l) => !l.trim().startsWith("//")).join(" ").replace(/\s+/g, " ").trim();
    if (!s.startsWith("CREATE")) continue;
    let m;
    if ((m = /^CREATE CONSTRAINT (\w+) IF NOT EXISTS FOR \(\w+:(\w+)\) REQUIRE (.+) IS UNIQUE$/.exec(s))) out.push({ name: m[1], kind: "constraint", type: "UNIQUENESS", entity: "NODE", labelsOrTypes: [m[2]], properties: [...m[3].matchAll(/\.(\w+)/g)].map((x) => x[1]) });
    else if ((m = /^CREATE INDEX (\w+) IF NOT EXISTS FOR \(\)-\[\w+:(\w+)\]-\(\) ON \((.+)\)$/.exec(s))) out.push({ name: m[1], kind: "index", type: "RANGE", entity: "RELATIONSHIP", labelsOrTypes: [m[2]], properties: [...m[3].matchAll(/\.(\w+)/g)].map((x) => x[1]) });
    else if ((m = /^CREATE INDEX (\w+) IF NOT EXISTS FOR \(\w+:(\w+)\) ON \((.+)\)$/.exec(s))) out.push({ name: m[1], kind: "index", type: "RANGE", entity: "NODE", labelsOrTypes: [m[2]], properties: [...m[3].matchAll(/\.(\w+)/g)].map((x) => x[1]) });
    else if ((m = /^CREATE FULLTEXT INDEX (\w+) IF NOT EXISTS FOR \(\w+:([\w|]+)\) ON EACH \[(.+)\]$/.exec(s))) out.push({ name: m[1], kind: "index", type: "FULLTEXT", entity: "NODE", labelsOrTypes: m[2].split("|"), properties: [...m[3].matchAll(/\.(\w+)/g)].map((x) => x[1]) });
    else if ((m = /^CREATE VECTOR INDEX (\w+) IF NOT EXISTS FOR \(\w+:(\w+)\) ON \(\w+\.(\w+)\) OPTIONS .*`vector\.dimensions`: (\d+), `vector\.similarity_function`: '(\w+)'/.exec(s))) out.push({ name: m[1], kind: "index", type: "VECTOR", entity: "NODE", labelsOrTypes: [m[2]], properties: [m[3]], dimensions: Number(m[4]), similarity: m[5] });
    else throw new Error(`unparsed DDL statement: ${s}`);
  }
  return out;
}

/** Extracts the fenced cypher block whose first line is `// @ddl <id>` from a markdown text. */
export function ddlBlock(markdown, id) {
  const re = /```cypher\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(markdown))) if (m[1].startsWith(`// @ddl ${id} `)) return m[1];
  throw new Error(`no @ddl ${id} block`);
}

export function buildDdl({ model, nodeRegister, relRegister, queryPatternsMd, d9PatternsMd, schemaDigest, releaseId = RELEASE_ID, operational = null, policy = null }) {
  const problems = [];
  const entries = [];
  const seen = new Set();
  const nodeProps = (label) => {
    const set = new Set();
    for (const n of model.nodes.values()) if (n.labels.includes(label)) for (const p of n.props) set.add(p.name);
    return set;
  };
  const relProps = (type) => {
    const set = new Set();
    for (const prof of model.relTypes.get(type)?.properties ?? []) for (const f of model.edgeProps.get(prof) ?? []) set.add(f.name);
    return set;
  };
  const add = (e) => {
    if (seen.has(e.name)) return;
    seen.add(e.name);
    // Schema check: labels/types and properties exist (database-only vector/search properties are allowed with a note).
    if (!e.operational) {
      for (const lt of e.labelsOrTypes) {
        if (e.entity === "NODE" && !model.labels.includes(lt)) problems.push(`${e.name}: label ${lt} not in the SDL`);
        if (e.entity === "RELATIONSHIP" && !model.relTypes.has(lt)) problems.push(`${e.name}: relationship type ${lt} not in the SDL`);
      }
      if (!e.databaseOnly) {
        for (const p of e.properties) {
          const ok = e.labelsOrTypes.some((lt) => (e.entity === "NODE" ? nodeProps(lt) : relProps(lt)).has(p));
          if (!ok) problems.push(`${e.name}: property ${p} is not declared on ${e.labelsOrTypes.join("|")}`);
        }
      }
    }
    entries.push(e);
  };
  const spec = (s, extra) => {
    const st =
      s.type === "UNIQUENESS" ? nodeUnique(s.name, s.labelsOrTypes[0], s.properties)
      : s.type === "FULLTEXT" ? fulltext(s.name, s.labelsOrTypes, s.properties)
      : s.type === "VECTOR" ? vector(s.name, s.labelsOrTypes[0], s.properties[0], s.dimensions, s.similarity)
      : s.entity === "RELATIONSHIP" ? relRange(s.name, s.labelsOrTypes[0], s.properties)
      : nodeRange(s.name, s.labelsOrTypes[0], s.properties);
    return { ...s, statement: st, ...extra };
  };

  // ---- required: uid uniqueness on every stored label (second defense; not every node carries :Entity) ----
  add(spec({ name: "entity_uid", kind: "constraint", type: "UNIQUENESS", entity: "NODE", labelsOrTypes: ["Entity"], properties: ["uid"] }, { requirement: "required", edition: "community", section: "A uid uniqueness", source: "query-patterns D-1 (entity_uid)", purpose: "uid seek for any Entity (static label; FU-14 h)", invariant: true }));
  for (const label of model.labels) {
    if (label === "Entity") continue;
    add(spec({ name: `uid_${label}`, kind: "constraint", type: "UNIQUENESS", entity: "NODE", labelsOrTypes: [label], properties: ["uid"] }, { requirement: "required", edition: "community", section: "A uid uniqueness", source: "SDL @node labels (FU-07; patterns-ddl section A)", purpose: `uid identity on :${label}`, invariant: true }));
  }
  // ---- required: kernel / pattern constraints and range indexes (query-patterns D-1) ----
  for (const s of parseDdlStatements(ddlBlock(queryPatternsMd, "D-1"))) add(spec(s, { requirement: "required", edition: "community", section: "B kernel and pattern constraints/indexes", source: "query-catalog/sources/query-patterns.md D-1", purpose: "pattern seek / identity", invariant: s.kind === "constraint" }));
  // ---- required: FU-14 (d) Identifier(scheme, value) lookup; register composite ranges; D9 indexes (MD-D9-03 a) ----
  add(spec({ name: "identifier_scheme_value", kind: "index", type: "RANGE", entity: "NODE", labelsOrTypes: ["Identifier"], properties: ["scheme", "value"] }, { requirement: "required", edition: "community", section: "C lookup indexes", source: "FU-14 (d) / CQ-ID-04", purpose: "cross-issuer identifier lookup by (scheme, value)", invariant: false }));
  const REGISTER_RANGES = [
    ["FoodItem", ["definingSystem", "sourceRecordId"], "fooditem_source_record"],
    ["FoodCategory", ["system", "code"], "foodcategory_system_code"],
    ["DietaryPattern", ["definedBySourceUid", "patternKey", "version"], "dietarypattern_key_version"],
  ];
  for (const [label, props, name] of REGISTER_RANGES) {
    const reg = nodeRegister.nodes.find((n) => n.name === label);
    if (!reg?.indexes?.some((x) => props.every((p) => String(x).includes(p)))) problems.push(`register index ${name} not found in node register ${label}.indexes`);
    add(spec({ name, kind: "index", type: "RANGE", entity: "NODE", labelsOrTypes: [label], properties: props }, { requirement: "required", edition: "community", section: "C lookup indexes", source: `registers/node-register.yaml ${label}.indexes`, purpose: "source-record identity lookup", invariant: false }));
  }
  for (const s of parseDdlStatements(d9PatternsMd.slice(d9PatternsMd.indexOf("CREATE FULLTEXT INDEX assertion_proposition")).split("```")[0])) add(spec(s, { requirement: "required", edition: "community", section: "C lookup indexes", source: "query-catalog/sources/patterns-by-question/D9.md (MD-D9-03 a)", purpose: "D9 pattern seek", invariant: false }));
  // ---- required: relationship-property indexes (kernel P13): assertionUid and lastWriterRunId on every type that stores them ----
  for (const type of [...model.relTypes.keys()].sort()) {
    const props = relProps(type);
    if (props.has("assertionUid")) add(spec({ name: `rel_${type}_assertion`, kind: "index", type: "RANGE", entity: "RELATIONSHIP", labelsOrTypes: [type], properties: ["assertionUid"] }, { requirement: "required", edition: "community", section: "D relationship-property indexes", source: "kernel P13; patterns-ddl section B", purpose: "edge episode -> authorizing Assertion", invariant: false }));
    if (props.has("lastWriterRunId")) add(spec({ name: `rel_${type}_writer`, kind: "index", type: "RANGE", entity: "RELATIONSHIP", labelsOrTypes: [type], properties: ["lastWriterRunId"] }, { requirement: "required", edition: "community", section: "D relationship-property indexes", source: "kernel P13; patterns-ddl section B", purpose: "lineage by writer run", invariant: false }));
  }
  if (operational) {
    const assertedClass = new Set(relRegister.relationships.filter((x) => x.class === "asserted").map((x) => x.type));
    for (const type of [...model.relTypes.keys()].sort()) {
      if (assertedClass.has(type) && relProps(type).has("relationshipUid")) add(spec({ name: `rel_${type}_uid`, kind: "index", type: "RANGE", entity: "RELATIONSHIP", labelsOrTypes: [type], properties: ["relationshipUid"] }, { requirement: "required", edition: "community", section: "D relationship-property indexes", source: "S3 operationalDdl() rel_uid_<type> (relationshipUid per asserted type)", purpose: "asserted edge episode by relationshipUid (executor identity / close)", invariant: false }));
    }
  }
  // ---- required: fulltext (query-patterns D-3 + register FoodCategory) ----
  for (const s of parseDdlStatements(ddlBlock(queryPatternsMd, "D-3"))) add(spec(s, { requirement: "required", edition: "community", section: "E fulltext", source: "query-catalog/sources/query-patterns.md D-3 (R-04)", purpose: "entry by text (candidate generation only; never identity)", invariant: false }));
  add(spec({ name: "food_category_search", kind: "index", type: "FULLTEXT", entity: "NODE", labelsOrTypes: ["FoodCategory"], properties: ["label", "definitionVerbatim"] }, { requirement: "required", edition: "community", section: "E fulltext", source: "registers/node-register.yaml FoodCategory.indexes", purpose: "entity linking of food category phrases", invariant: false }));
  // ---- required: operational labels (INTERFACES section 6) ----
  const OPS = [
    ["ks_write_fence_id", "KsWriteFence", ["id"], "constraint", "singleton key: exactly one node {id: 'canonical'}; every canonical write locks it first"],
    ...(operational ? [] : [["ks_intent_marker_effect_key", "KsIntentMarker", ["effectKey"], "constraint", "one marker per effect key (idempotent apply)"]]),
    ["ks_release_marker_release_id", "KsReleaseMarker", ["releaseId"], "constraint", "one installed-release marker per release id"],
  ];
  for (const [name, label, props, , purpose] of OPS) add({ ...spec({ name, kind: "constraint", type: "UNIQUENESS", entity: "NODE", labelsOrTypes: [label], properties: props }, {}), requirement: "required", edition: "community", section: "F operational labels", source: "INTERFACES.md section 6", purpose, invariant: true, operational: true });
  add({ ...spec({ name: "ks_intent_marker_status", kind: "index", type: "RANGE", entity: "NODE", labelsOrTypes: ["KsIntentMarker"], properties: ["status"] }, {}), requirement: "required", edition: "community", section: "F operational labels", source: "INTERFACES.md section 6", purpose: "pending/unresolved marker scan for recovery", invariant: false, operational: true });
  add({ ...spec({ name: "ks_release_marker_installed", kind: "index", type: "RANGE", entity: "NODE", labelsOrTypes: ["KsReleaseMarker"], properties: ["installedAt"] }, {}), requirement: "required", edition: "community", section: "F operational labels", source: "INTERFACES.md section 6", purpose: "latest installed release lookup (readiness)", invariant: false, operational: true });
  // v2.0.1+: operational names of the migration (rules/operational-names.yaml); absent in v2.0.0, which stays byte-identical.
  if (operational) {
    // S3 native executor (S3-native-executor.md section 10 items 2-5; packages/kg-ops/src/fence.ts operationalDdl()).
    add({ ...spec({ name: "ks_intent_marker_key", kind: "constraint", type: "UNIQUENESS", entity: "NODE", labelsOrTypes: ["KsIntentMarker"], properties: ["markerKey"] }, {}), requirement: "required", edition: "community", section: "F operational labels", source: "S3 operationalDdl(): markerKey = mk-<sha256(canonical{installationId, applicationId, tenantId, effectKey})>", purpose: "one marker per (scope, effect key): idempotent apply; failure never overwrites applied", invariant: true, operational: true });
    add({ ...spec({ name: "ks_intent_marker_effect_key_lookup", kind: "index", type: "RANGE", entity: "NODE", labelsOrTypes: ["KsIntentMarker"], properties: ["effectKey"] }, {}), requirement: "required", edition: "community", section: "F operational labels", source: "S3 section 10 item 2 (effectKey kept as an index; uniqueness moved to markerKey)", purpose: "receipt lookup by effect key within a scope", invariant: false, operational: true });
    add({ ...spec({ name: "ks_revocation_fence_id", kind: "constraint", type: "UNIQUENESS", entity: "NODE", labelsOrTypes: ["KsRevocationFence"], properties: ["id"] }, {}), requirement: "required", edition: "community", section: "F operational labels", source: "S3 operationalDdl(): KsRevocationFence {id: 'canonical', generation}", purpose: "singleton local revocation fence", invariant: true, operational: true });
    add({ ...spec({ name: "ks_intent_marker_plan_ref", kind: "index", type: "RANGE", entity: "NODE", labelsOrTypes: ["KsIntentMarker"], properties: ["planRef"] }, {}), requirement: "required", edition: "community", section: "F operational labels", source: "rules/operational-names.yaml (migration markers: effectKey migration:<runId>:<batchId>, planRef = migrationRunId)", purpose: "find every marker of one plan or migration run for recovery", invariant: false, operational: true });
    add({ ...spec({ name: "legacy_v0_export_digest", kind: "index", type: "RANGE", entity: "NODE", labelsOrTypes: ["LegacyV0"], properties: ["legacyExportDigest"] }, {}), requirement: "required", edition: "community", section: "F operational labels", source: "rules/operational-names.yaml (legacy-map policy.legacyPreservation.reverse)", purpose: "reverse relabel and accounting of preserved legacy nodes by export digest", invariant: false, operational: true });
    // v2.2.0+ (R-SV11): operational DDL declared by the release source itself (rules/operational-names.yaml `ddl:`).
    // Releases without the key generate byte-identical DDL. Only operational labels; RANGE indexes or single-label uniqueness.
    const known = new Set((operational.labels ?? []).map((l) => l.name));
    for (const d of operational.ddl ?? []) {
      if (!known.has(d.label)) problems.push(`${d.name}: operational DDL label ${d.label} is not a registered operational label`);
      const type = d.kind === "constraint" ? "UNIQUENESS" : "RANGE";
      add({ ...spec({ name: d.name, kind: d.kind === "constraint" ? "constraint" : "index", type, entity: "NODE", labelsOrTypes: [d.label], properties: d.properties }, {}), requirement: "required", edition: "community", section: "F operational labels", source: d.source ?? "rules/operational-names.yaml ddl", purpose: d.purpose, invariant: d.kind === "constraint", operational: true });
    }
  }
  // ---- optional (disabled by default): OD-44 vectors ----
  for (const s of parseDdlStatements(ddlBlock(queryPatternsMd, "D-4"))) add(spec(s, { requirement: "optional", edition: "community", section: "G optional vector profile", source: "query-catalog/sources/query-patterns.md D-4", purpose: "OD-44 native embedding profile text-embedding-3-small/1536/cosine; recorded, not served in this release", invariant: false, databaseOnly: true, profile: "OD-44" }));
  // ---- enterprise (capability-gated): existence and property-type constraints ----
  const primaryLabels = [...new Set([...model.nodes.values()].map((n) => n.primaryLabel))].sort();
  for (const label of primaryLabels) {
    add({ name: `uid_exists_${label}`, kind: "constraint", type: "NODE_PROPERTY_EXISTENCE", entity: "NODE", labelsOrTypes: [label], properties: ["uid"], statement: nodeExists(`uid_exists_${label}`, label, "uid"), requirement: "optional", edition: "enterprise", section: "H enterprise existence/type", source: "FU-07 (edition-specific defense in depth)", purpose: "uid present on every stored node", invariant: true });
    add({ name: `uid_type_${label}`, kind: "constraint", type: "NODE_PROPERTY_TYPE", entity: "NODE", labelsOrTypes: [label], properties: ["uid"], statement: nodeType(`uid_type_${label}`, label, "uid", "STRING"), requirement: "optional", edition: "enterprise", section: "H enterprise existence/type", source: "FU-07", purpose: "uid is a string", invariant: true });
  }
  const assertedTypes = new Set(relRegister.relationships.filter((r) => r.class === "asserted").map((r) => r.type));
  for (const type of [...assertedTypes].sort()) {
    const required = [...(model.relTypes.get(type)?.properties ?? [])].every((prof) => (model.edgeProps.get(prof) ?? []).some((f) => f.name === "assertionUid" && f.required));
    if (!required) continue;
    add({ name: `rel_${type}_assertion_exists`, kind: "constraint", type: "RELATIONSHIP_PROPERTY_EXISTENCE", entity: "RELATIONSHIP", labelsOrTypes: [type], properties: ["assertionUid"], statement: relExists(`rel_${type}_assertion_exists`, type, "assertionUid"), requirement: "optional", edition: "enterprise", section: "H enterprise existence/type", source: "FU-07; asserted edges carry assertionUid (kernel)", purpose: "every asserted edge names its authorizing Assertion", invariant: true });
  }
  const OPS_ENT = [
    ["ks_write_fence_revision_exists", "KsWriteFence", "graphRevision", "exists"],
    ["ks_write_fence_revision_type", "KsWriteFence", "graphRevision", "INTEGER"],
    ["ks_intent_marker_effect_key_exists", "KsIntentMarker", "effectKey", "exists"],
    ["ks_intent_marker_status_exists", "KsIntentMarker", "status", "exists"],
    ["ks_release_marker_digest_exists", "KsReleaseMarker", "schemaReleaseDigest", "exists"],
  ];
  for (const [name, label, prop, kind] of OPS_ENT) add({ name, kind: "constraint", type: kind === "exists" ? "NODE_PROPERTY_EXISTENCE" : "NODE_PROPERTY_TYPE", entity: "NODE", labelsOrTypes: [label], properties: [prop], statement: kind === "exists" ? nodeExists(name, label, prop) : nodeType(name, label, prop, kind), requirement: "optional", edition: "enterprise", section: "H enterprise existence/type", source: "INTERFACES.md section 6", purpose: "operational marker shape", invariant: true, operational: true });
  if (operational) {
    for (const [name, label, prop] of [["ks_intent_marker_key_exists", "KsIntentMarker", "markerKey"], ["ks_revocation_fence_generation_exists", "KsRevocationFence", "generation"], ["ks_write_fence_lock_seq_exists", "KsWriteFence", "lockSeq"]]) add({ name, kind: "constraint", type: "NODE_PROPERTY_EXISTENCE", entity: "NODE", labelsOrTypes: [label], properties: [prop], statement: nodeExists(name, label, prop), requirement: "optional", edition: "enterprise", section: "H enterprise existence/type", source: "S3 section 10 items 2-4", purpose: "executor marker / fence shape", invariant: true, operational: true });
    for (const [name, prop] of [["ks_release_marker_release_id_exists", "releaseId"], ["ks_release_marker_ddl_digest_exists", "ddlDigest"], ["ks_release_marker_installed_at_exists", "installedAt"]]) add({ name, kind: "constraint", type: "NODE_PROPERTY_EXISTENCE", entity: "NODE", labelsOrTypes: ["KsReleaseMarker"], properties: [prop], statement: nodeExists(name, "KsReleaseMarker", prop), requirement: "optional", edition: "enterprise", section: "H enterprise existence/type", source: "rules/operational-names.yaml markerShapes", purpose: "installed-release marker shape", invariant: true, operational: true });
  }

  // ---- files ----
  const header = (title, what) => `// ${title} — release ${releaseId} (schema ${schemaDigest}).\n// GENERATED by scripts/release/generate.mjs (lib/ddl.mjs) from the release SDL, registers and query sources; do not edit by hand.\n// ${what}\n// Every statement is idempotent (IF NOT EXISTS). Apply in order; verify with the checks in ddl/ddl.json (all ONLINE).\n`;
  const render = (list) => {
    let out = "";
    let section = "";
    for (const e of list) {
      if (e.section !== section) {
        section = e.section;
        out += `\n// ---- ${section} ----\n`;
      }
      out += `${e.statement};\n`;
    }
    return out;
  };
  // v2.0.2+: installer phases and blocked statements (rules/ddl-policy.yaml). Absent before v2.0.2 (byte-identical).
  const phased = Boolean(policy);
  if (phased) {
    const postLabels = new Set(policy.postMigration.uidExistsLabels);
    const blocked = new Map((policy.exceptions ?? []).map((x) => [x.name, x]));
    for (const name of blocked.keys()) if (!entries.some((e) => e.name === name)) problems.push(`ddl policy: exception ${name} names no DDL statement`);
    for (const e of entries) {
      const m = /^uid_exists_(.+)$/.exec(e.name);
      e.phase = (m && postLabels.has(m[1])) || /^rel_.+_assertion_exists$/.test(e.name) ? "post-migration" : "pre-migration";
      const x = blocked.get(e.name);
      e.status = x ? x.status : "active";
      if (x) Object.assign(e, { installed: false, blockedReason: x.reason, enablingCondition: x.enablingCondition });
    }
    if (entries.filter((e) => /^uid_exists_/.test(e.name) && e.phase === "post-migration").length !== postLabels.size) problems.push("ddl policy: a post-migration uid_exists label has no statement");
  }
  const active = (e) => !phased || e.status === "active";
  const required = entries.filter((e) => e.requirement === "required" && active(e));
  const enterprise = entries.filter((e) => e.edition === "enterprise" && active(e));
  const optional = entries.filter((e) => e.requirement === "optional" && e.edition === "community" && active(e));
  const files = {
    "ddl/required.cypher": header("Required DDL (Neo4j 5.26 Community compatible)", "Required for every deployment: the executor refuses to report ready when any of these is missing or not ONLINE.") + render(required),
    "ddl/enterprise.cypher": header("Enterprise additions (capability-gated)", "Apply only on Neo4j Enterprise / Aura (existence and property-type constraints). Community rejects them; their absence is reported, not fatal.") + render(enterprise),
    "ddl/optional.cypher": header("Optional profiles (disabled by default)", "OD-44 native vector profile: recorded, not served in this release. Create only when the profile is qualified and enabled.") + render(optional),
  };
  if (phased) {
    const view = (list, phase) => list.filter((e) => e.phase === phase);
    const note = "Generated phase view of the combined file. Installer order: required.pre + enterprise.pre (Enterprise) -> migration (S8 manifests) -> required.post + enterprise.post (Enterprise) -> KsReleaseMarker.";
    files["ddl/required.pre.cypher"] = header("Required DDL, pre-migration phase", note) + render(view(required, "pre-migration"));
    files["ddl/required.post.cypher"] = header("Required DDL, post-migration phase", `${note} Empty when every required statement holds on a graph that still carries legacy rows.`) + render(view(required, "post-migration"));
    files["ddl/enterprise.pre.cypher"] = header("Enterprise additions, pre-migration phase", note) + render(view(enterprise, "pre-migration"));
    files["ddl/enterprise.post.cypher"] = header("Enterprise additions, post-migration phase", `${note} Constraints that cannot hold while legacy rows still carry the label or type; blocked statements are not installed (ddl.json exceptions).`) + render(view(enterprise, "post-migration"));
  }
  for (const e of entries) {
    e.file = phased && !active(e) ? null : e.edition === "enterprise" ? "ddl/enterprise.cypher" : e.requirement === "required" ? "ddl/required.cypher" : "ddl/optional.cypher";
    if (phased && active(e) && e.file !== "ddl/optional.cypher") e.phaseFile = e.file.replace(/\.cypher$/, e.phase === "pre-migration" ? ".pre.cypher" : ".post.cypher");
  }
  const ddl = {
    format: "bks-ddl.v1",
    releaseId,
    schemaDigest,
    cypher: "CYPHER 5",
    baseline: "Neo4j 5.26 Community (tested); 5.27-aura Enterprise (target)",
    counts: {
      total: entries.length,
      required: required.length,
      enterprise: enterprise.length,
      optional: optional.length,
      byType: Object.fromEntries([...new Set(entries.map((e) => e.type))].sort().map((t) => [t, entries.filter((e) => e.type === t).length])),
    },
    statements: entries.map(({ section, ...e }) => ({ ...e, section })),
    checks: [
      { name: "required-present", cypher: "SHOW CONSTRAINTS YIELD name RETURN collect(name) AS names UNION ALL SHOW INDEXES YIELD name RETURN collect(name) AS names", expect: "every required statement name is present" },
      { name: "indexes-online", cypher: "SHOW INDEXES YIELD name, state WHERE state <> 'ONLINE' RETURN name, state", expect: "zero rows" },
      { name: "ks-write-fence-singleton", cypher: "MATCH (f:KsWriteFence) RETURN count(f) AS n, collect(f.id) AS ids", expect: "n = 1 and ids = ['canonical'] once the migrator bootstrapped the fence" },
      { name: "release-marker", cypher: "MATCH (m:KsReleaseMarker) RETURN m.releaseId, m.schemaReleaseDigest, m.ddlDigest, m.installedAt ORDER BY m.installedAt DESC LIMIT 1", expect: "the accepted release (written by the migrator after DDL and migration checks, S8)" },
    ],
    ...(operational ? {
      markerShapes: operational.markerShapes,
      operationalNames: { labels: operational.labels.map((l) => l.name), relationshipTypes: operational.relationshipTypes.map((r) => r.name) },
      migrationCommands: [
        { name: "drop-v2.0.0-effect-key-uniqueness", cypher: "DROP CONSTRAINT ks_intent_marker_effect_key IF EXISTS", when: "once, before ddl/required.cypher, on a graph that received biotech-schema-v2.0.0 DDL (uniqueness moved to ks_intent_marker_key on markerKey)", owner: "S8 migrator" },
      ],
      executorReconciliation: operational.executorReconciliation ?? null,
    } : {}),
    ...(phased ? {
      phases: {
        order: ["pre-migration DDL (required.pre.cypher; enterprise.pre.cypher on Enterprise)", "migration (S8 manifests, under KsWriteFence)", "post-migration DDL (required.post.cypher; enterprise.post.cypher on Enterprise)", "KsReleaseMarker (migrator, last)"],
        rule: policy.rule,
        postMigrationUidExistsLabels: [...policy.postMigration.uidExistsLabels].sort(),
        counts: Object.fromEntries(["pre-migration", "post-migration"].map((p) => [p, entries.filter((e) => e.phase === p && active(e)).length])),
      },
      exceptions: entries.filter((e) => !active(e)).map((e) => ({ name: e.name, status: e.status, reason: e.blockedReason, enablingCondition: e.enablingCondition, enforcedInstead: (policy.exceptions.find((x) => x.name === e.name) ?? {}).enforcedInstead ?? null })),
    } : {}),
    bootstrap: operational ? [
      { name: "ks-write-fence", owner: "S3/S8 migrator", cypher: "MERGE (f:KsWriteFence {id: 'canonical'}) ON CREATE SET f.graphRevision = 0, f.lockSeq = 0, f.updatedAt = datetime()", note: "run once after required DDL; never by a knowledge agent" },
      { name: "ks-revocation-fence", owner: "S3/S8 migrator", cypher: "MERGE (r:KsRevocationFence {id: 'canonical'}) ON CREATE SET r.generation = 0, r.updatedAt = datetime()", note: "run once after required DDL; never by a knowledge agent" },
    ] : [
      { name: "ks-write-fence", owner: "S3/S8 migrator", cypher: "MERGE (f:KsWriteFence {id: 'canonical'}) ON CREATE SET f.graphRevision = 0, f.updatedAt = datetime()", note: "run once after required DDL; never by a knowledge agent" },
    ],
  };
  return { files, ddl, problems };
}
