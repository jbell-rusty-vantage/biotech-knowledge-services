#!/usr/bin/env node
// Plans the legacy v0 -> v2 migration WITHOUT writing anything (bks-migration-manifest.v1 + bks-migration-accounting.v1).
//
//   node packages/kg-ops/src/migration/plan-migration.mjs --export <exportDir>
//        [--map schema/program/final/migration/legacy-map.yaml] [--out <dir>] [--schema-release-digest sha256:...]
//
// Reads a verified bks-graph-export.v1 export and the legacy map, refuses on any uncovered label / triple / property,
// mints deterministic v2 uids, decides every node and relationship (migrate | retain-legacy | quarantine), builds the
// provenance spine, deterministic batches with checkpoint identities, expected counts and invariants, and the accounting
// report whose totals reconcile with the export counts. Output defaults to <exportDir>/plans/<migrationRunId>/ (custody:
// uid maps contain name slugs and must not go to Git). Pure with respect to time: the apply clock fills time fields.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { canonical, readJsonl, sha256, verifyExportFiles, writeJson, YAML, JsonlWriter, labelKey, tripleKey } from "../../../../scripts/migration/lib/common.mjs";
import { PLANNER_VERSION, builderFieldKeys, builders, edgeCondition, enumLookup, isoInstant, isoString, legacyKeyOf, legacyKeyProp, mintUid, shortHash, slugify, urlHost } from "./transforms.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..", "..", "..");
// Release binding and S3 identity rules come from the built packages (never re-implemented or hardcoded here).
const { loadRelease } = await import(pathToFileURL(path.join(REPO, "packages", "schema-workspace", "dist", "index.js")).href);
const kgOps = await import(pathToFileURL(path.join(REPO, "packages", "kg-ops", "dist", "index.js")).href);
/** S3 activityUidFor (packages/kg-ops/src/write/context.ts; not exported): hu:activity:<slug(system,20)>-<slug(runId,60)>-<sha256(system\nrunId)[0:8]>. */
export const activityUidFor = (system, runId) => `hu:activity:${slugify(system, 20)}-${slugify(runId, 60)}-${sha256(`${system}\n${runId}`).slice(0, 8)}`;
/** Release identities the plan binds (pinned release unless BKS_SCHEMA_RELEASE_DIR / dir overrides; loadRelease verifies every byte). */
export function releaseBinding(dir) {
  const r = loadRelease(dir ? { dir } : {});
  const releaseId = r.pin?.releaseId ?? r.manifest?.releaseId;
  const ddlDigest = r.manifest?.identities?.ddlDigest ?? r.pin?.ddlDigest ?? null;
  const mapMeta = r.manifest?.files?.["migration/legacy-map.yaml"] ?? null;
  return { release: r, releaseId, schemaReleaseDigest: r.schemaReleaseDigest, schemaDigest: r.schemaDigest, ddlDigest, dir: r.dir, source: r.source, mapPath: path.join(r.dir, "migration", "legacy-map.yaml"), mapSha256: mapMeta?.sha256 ?? null };
}
export const MANIFEST_FORMAT = "bks-migration-manifest.v1";
export const ACCOUNTING_FORMAT = "bks-migration-accounting.v1";
const BATCH = 200;

export function planMigration({ exportDir, mapFile, binding }) {
  if (!binding?.schemaReleaseDigest) throw new Error("planMigration needs a release binding (releaseBinding())");
  const schemaReleaseDigest = binding.schemaReleaseDigest;
  const exportManifest = JSON.parse(fs.readFileSync(path.join(exportDir, "manifest.json"), "utf8"));
  const integrity = verifyExportFiles(exportDir, exportManifest);
  if (!integrity.ok) throw new Error(`export integrity failure: ${JSON.stringify(integrity.mismatches)}`);
  const mapBytes = fs.readFileSync(mapFile);
  const map = YAML.parse(mapBytes.toString("utf8"));
  const mapDigest = "sha256:" + sha256(mapBytes);
  if (map.format !== "bks-legacy-map.v1") throw new Error(`unsupported map format ${map.format}`);
  const exportDigest = exportManifest.exportDigest;
  const runId = `mig-${shortHash(`${exportDigest}|${mapDigest}|${schemaReleaseDigest}|${PLANNER_VERSION}`, 12)}`;

  const nodes = [...readJsonl(path.join(exportDir, "nodes.jsonl"))];
  const rels = [...readJsonl(path.join(exportDir, "relationships.jsonl"))];
  const byId = new Map(nodes.map((n) => [n.elementId, n]));
  const primary = (n) => {
    if (n.labels.length !== 1) throw new Error(`node ${n.elementId} has ${n.labels.length} labels; the map expects exactly one legacy label`);
    return n.labels[0];
  };
  const tripleOf = (r) => ({ type: r.type, from: primary(byId.get(r.start)), to: primary(byId.get(r.end)) });
  const relRule = (r) => {
    const t = tripleOf(r);
    return map.relationships.find((x) => x.type === t.type && x.from === t.from && x.to === t.to);
  };

  // ---------- coverage (fail closed) ----------
  const gaps = [];
  const liveLabels = new Set(nodes.map(primary));
  for (const l of liveLabels) if (!map.nodes[l]) gaps.push({ kind: "label", label: l });
  const liveTriples = new Set(rels.map((r) => tripleKey(tripleOf(r).from, r.type, tripleOf(r).to)));
  for (const t of liveTriples) if (!map.relationships.some((x) => tripleKey(x.from, x.type, x.to) === t)) gaps.push({ kind: "triple", triple: t });
  const liveNodeKeys = {};
  for (const n of nodes) for (const k of Object.keys(n.properties)) (liveNodeKeys[primary(n)] ??= new Set()).add(k);
  for (const [label, keys] of Object.entries(liveNodeKeys)) {
    const rule = map.nodes[label];
    if (!rule || rule.disposition !== "migrate") continue; // non-migrated elements keep every property with the element (map header rule)
    for (const k of keys) if (!rule.properties?.[k] && !map.commonProperties?.[k]) gaps.push({ kind: "nodeProperty", label, key: k });
  }
  const liveRelKeys = {};
  for (const r of rels) for (const k of Object.keys(r.properties)) (liveRelKeys[tripleKey(tripleOf(r).from, r.type, tripleOf(r).to)] ??= new Set()).add(k);
  for (const [t, keys] of Object.entries(liveRelKeys)) {
    const rule = map.relationships.find((x) => tripleKey(x.from, x.type, x.to) === t);
    if (!rule || rule.disposition !== "migrate") continue;
    for (const k of keys) if (!rule.properties?.[k] && !map.commonEdgeProperties?.[k]) gaps.push({ kind: "relationshipProperty", triple: t, key: k });
  }
  // map/code parity: every `fields` key in the map has a builder output
  for (const [label, rule] of Object.entries(map.nodes)) {
    if (rule.disposition !== "migrate") continue;
    if (!builders[label]) gaps.push({ kind: "builder", label });
    for (const f of Object.keys(rule.fields ?? {})) if (!(builderFieldKeys[label] ?? []).includes(f)) gaps.push({ kind: "builderField", label, field: f });
  }
  // unmapped v1 relationship classes must not be present
  const v1Seven = ["ABOUT_CONDITION", "ASSESSES_CLAIM_EVIDENCE", "CLAIM_EVIDENCE_BASED_ON", "DEPENDS_ON", "HOSTS_CHANNEL", "PART_OF_PLAN", "USES_COMPONENT"];
  const v1Present = v1Seven.filter((t) => rels.some((r) => r.type === t));
  if (v1Present.length) gaps.push({ kind: "v1-shaped", types: v1Present, note: "plan with migration/v1-map.yaml" });
  if (gaps.length) {
    const e = new Error(`legacy map does not cover the export (${gaps.length} gaps)`);
    e.gaps = gaps;
    throw e;
  }

  // ---------- derivations over the raw legacy graph ----------
  const out = new Map(); // elementId -> outgoing rels
  const inc = new Map();
  for (const r of rels) {
    (out.get(r.start) ?? out.set(r.start, []).get(r.start)).push(r);
    (inc.get(r.end) ?? inc.set(r.end, []).get(r.end)).push(r);
  }
  const decisions = new Map(); // elementId -> {disposition, category, reason, code, uid, v2Type, ...}
  const uidOf = (eid) => decisions.get(eid)?.uid ?? null;
  const unique = (arr) => [...new Map(arr.map((x) => [x.elementId, x])).values()];
  const derive = {
    metricIssuer(bm) {
      const orgs = [];
      for (const r1 of inc.get(bm.elementId) ?? []) {
        if (!["MEASURES", "INCLUDES_BIOMARKER"].includes(r1.type)) continue;
        for (const r2 of inc.get(r1.start) ?? []) {
          if (!["DELIVERS_LABTEST", "IMPLEMENTS_PANEL"].includes(r2.type)) continue;
          for (const r3 of inc.get(r2.start) ?? []) if (r3.type === "OFFERS") orgs.push(byId.get(r3.start));
        }
      }
      const u = unique(orgs);
      return u.length === 1 ? { elementId: u[0].elementId, name: u[0].properties.legalName ?? u[0].properties.displayName ?? u[0].properties.name } : null;
    },
    developerOrganization(tp) {
      const u = unique((inc.get(tp.elementId) ?? []).filter((r) => r.type === "DEVELOPS_PLATFORM").map((r) => byId.get(r.start)));
      return u.length === 1 ? { elementId: u[0].elementId, uid: uidOf(u[0].elementId) } : null;
    },
    hostMatchesLister(listing) {
      const listers = (inc.get(listing.elementId) ?? []).filter((r) => r.type === "LISTS").map((r) => byId.get(r.start));
      return listers.length === 1 && urlHost(listing.properties.url) && urlHost(listing.properties.url) === urlHost(listers[0].properties.websiteUrl);
    },
    hostMatchesListerEdge(rel) {
      const org = byId.get(rel.start);
      const listing = byId.get(rel.end);
      return Boolean(urlHost(listing.properties.url)) && urlHost(listing.properties.url) === urlHost(org.properties.websiteUrl);
    },
    eventPrimarySubject(ev) {
      const u = unique((out.get(ev.elementId) ?? []).filter((r) => r.type === "ABOUT" && primary(byId.get(r.end)) === "Organization").map((r) => byId.get(r.end)));
      return u.length === 1 ? { uid: uidOf(u[0].elementId) } : null;
    },
    publicActorBasis(person) {
      const b = new Set();
      const execRoles = new Set(["EXECUTIVE_OFFICER"]);
      for (const r of [...(out.get(person.elementId) ?? []), ...(inc.get(person.elementId) ?? [])]) {
        const other = byId.get(r.start === person.elementId ? r.end : r.start);
        const otherDecision = decisions.get(other.elementId);
        if (otherDecision?.disposition !== "migrate") continue;
        const rule = relRule(r);
        if (rule?.disposition !== "migrate" || !edgeCondition(rule.condition, r, { derive })) continue;
        if (r.type === "ADVISES") b.add("OTHER_PUBLIC_ROLE");
        else if (r.type === "FOUNDED_BY") b.add("FOUNDER_OR_INVESTOR");
        else if (r.type === "HAS_CEO") b.add("OFFICER_OR_DIRECTOR");
        else if (r.type === "EMPLOYS") {
          const rk = enumLookup(rule.enumMaps?.role, r.properties.role);
          b.add(execRoles.has(rk.value) ? "OFFICER_OR_DIRECTOR" : "OTHER_PUBLIC_ROLE");
        } else if (r.type === "INVESTIGATED_BY") b.add("AUTHOR_OR_INVESTIGATOR");
      }
      return [...b].sort();
    },
    personOrganizations(person) {
      const orgs = [];
      for (const r of [...(out.get(person.elementId) ?? []), ...(inc.get(person.elementId) ?? [])]) {
        const other = byId.get(r.start === person.elementId ? r.end : r.start);
        if (primary(other) === "Organization" && uidOf(other.elementId)) orgs.push(uidOf(other.elementId));
      }
      return [...new Set(orgs)].sort();
    },
  };
  const ctx = { derive };

  // ---------- node decisions (Organization first; Person last because its basis depends on migrated endpoints) ----------
  const order = (l) => (l === "Organization" ? 0 : l === "Study" ? 1 : l === "Person" ? 9 : 5);
  const sortedNodes = [...nodes].sort((a, b) => order(primary(a)) - order(primary(b)) || (a.elementId < b.elementId ? -1 : 1));
  const v2Nodes = [];
  const identifierRows = [];
  for (const n of sortedNodes) {
    const label = primary(n);
    const rule = map.nodes[label];
    const legacyKey = legacyKeyOf(label, n.properties);
    const base = { elementId: n.elementId, legacyLabel: label, legacyKey, file: "nodes.jsonl" };
    if (rule.disposition !== "migrate") {
      decisions.set(n.elementId, { ...base, disposition: rule.disposition, category: rule.disposition === "quarantine" ? "held" : "unchanged-retained", code: rule.disposition === "quarantine" ? "MAP_QUARANTINE" : "RETAIN_LEGACY", reason: rule.reason });
      continue;
    }
    if (!legacyKey) {
      decisions.set(n.elementId, { ...base, disposition: "quarantine", category: "held", code: "IDENTITY_UNRESOLVED", reason: "legacy key missing" });
      continue;
    }
    const built = builders[label](n, rule, ctx);
    if (built.hold) {
      decisions.set(n.elementId, { ...base, disposition: "quarantine", category: "held", code: built.hold.code, reason: built.hold.reason });
      continue;
    }
    const uid = mintUid(rule.target.token, built.nameBasis, label, legacyKey);
    const props = { uid, id: uid.slice(uid.indexOf(":", 3) + 1), privacyClass: built.fields.privacyClass ?? "PUBLIC", ...stripNulls(built.fields) };
    decisions.set(n.elementId, { ...base, disposition: "migrate", category: "migrated", uid, v2Type: rule.target.type, v2Labels: rule.target.labels, identity: built.identity });
    v2Nodes.push({ elementId: n.elementId, legacyLabel: label, legacyKey, uid, v2Type: rule.target.type, labels: rule.target.labels, props, identity: built.identity, heldWork: rule.heldWork ?? [] });
    for (const idr of built.identifiers ?? []) identifierRows.push({ ofUid: uid, ofLabel: rule.target.labels[0], ofElementId: n.elementId, ...idr });
  }

  // uid uniqueness (fail closed)
  const seen = new Map();
  for (const v of v2Nodes) {
    if (seen.has(v.uid)) throw new Error(`uid collision ${v.uid} between ${seen.get(v.uid)} and ${v.elementId}`);
    seen.set(v.uid, v.elementId);
  }

  // ---------- provenance spine ----------
  const agentFields = { name: "legacy-import", agentKind: "DATA_ANALYSIS_PIPELINE", toolVersion: `bks-migration/${PLANNER_VERSION}` };
  const agentUid = `hu:agent:legacy-import-${shortHash(`${agentFields.agentKind}|${agentFields.toolVersion}`)}`;
  const idOf = (u) => u.slice(u.indexOf(":", 3) + 1);
  const agent = { uid: agentUid, id: idOf(agentUid), privacyClass: "INTERNAL", ...agentFields };
  const activity = { uid: activityUidFor("bks-migration", runId), id: idOf(activityUidFor("bks-migration", runId)), privacyClass: "INTERNAL", name: `legacy v0 migration ${runId}`, activityKind: "INGESTION", externalRunSystem: "bks-migration", runId, operationKind: "legacy-v0-migration", methodVersion: `legacy-map ${map.mapVersion} / planner ${PLANNER_VERSION}` };
  const canonicalUri = kgOps.canonicalizeUri(`bks-custody://release-v2/backups/${exportManifest.exportId}`).uri;
  const sourceUid = kgOps.sourceUidFor(canonicalUri);
  const source = { uid: sourceUid, id: idOf(sourceUid), privacyClass: "INTERNAL", name: `BellLabs legacy biotech-kg graph export ${exportManifest.exportId}`, canonicalUri, sourceKind: "DATASET", genre: "LEGACY_GRAPH_EXPORT", logicalIdentity: exportDigest };
  const snapshot = {
    uid: `hu:snapshot:${shortHash(exportDigest)}`,
    id: shortHash(exportDigest),
    privacyClass: "INTERNAL",
    retrievedAt: isoInstant(exportManifest.startedAt),
    contentHash: exportDigest,
    contentHashBasis: "CANONICAL_PROJECTION:bks-graph-export.v1",
    captureMethod: `bks-export-graph/${exportManifest.scriptVersion}`,
    captureCompleteness: "COMPLETE",
    storageUri: `bks-custody://release-v2/backups/${exportManifest.exportId}/`,
    mimeType: "application/x-ndjson",
  };
  const runIds = new Set();

  // ---------- relationships ----------
  const assertions = [];
  const domainRels = [];
  const locators = new Map(); // key file|elementId -> locator
  const relDecisions = [];
  const lineFor = (file, rec) => canonical(rec);
  const locatorFor = (file, rec) => {
    const key = `${file}|${rec.elementId}`;
    if (!locators.has(key)) {
      const selector = { basis: "bks-graph-export.v1", file, elementId: rec.elementId };
      const selectorJson = canonical(selector);
      const selectorDigest = "sha256:" + sha256(selectorJson);
      const quoteHash = "sha256:" + sha256(lineFor(file, rec));
      const luid = `hu:locator:${shortHash(`${snapshot.uid}|${selectorDigest}`, 16)}`;
      locators.set(key, { uid: luid, id: idOf(luid), privacyClass: "INTERNAL", selectorKind: "DATASET", selectorDigest, selectorJson, quoteHash });
    }
    return locators.get(key);
  };
  const legacyFingerprint = (r) => {
    const a = byId.get(r.start);
    const b = byId.get(r.end);
    return canonical({ type: r.type, from: [primary(a), legacyKeyOf(primary(a), a.properties)], to: [primary(b), legacyKeyOf(primary(b), b.properties)], properties: r.properties });
  };
  for (const r of rels) {
    const rule = relRule(r);
    const t = tripleOf(r);
    const base = { elementId: r.elementId, type: r.type, triple: tripleKey(t.from, r.type, t.to), file: "relationships.jsonl" };
    if (rule.disposition !== "migrate") {
      relDecisions.push({ ...base, disposition: rule.disposition, category: rule.disposition === "quarantine" ? "held" : "unchanged-retained", code: rule.disposition === "quarantine" ? "MAP_QUARANTINE" : "RETAIN_LEGACY", reason: rule.reason });
      continue;
    }
    if (!edgeCondition(rule.condition, r, ctx)) {
      relDecisions.push({ ...base, disposition: "quarantine", category: "held", code: "CONDITION_UNMET", reason: `condition not met: ${rule.condition}` });
      continue;
    }
    const sd = decisions.get(r.start);
    const ed = decisions.get(r.end);
    if (sd.disposition !== "migrate" || ed.disposition !== "migrate") {
      relDecisions.push({ ...base, disposition: "quarantine", category: "held", code: "ENDPOINT_HELD", reason: `endpoint not migrated (${sd.disposition === "migrate" ? "" : `from ${sd.legacyLabel}: ${sd.code}`}${ed.disposition === "migrate" ? "" : ` to ${ed.legacyLabel}: ${ed.code}`})`.replace("( ", "(") });
      continue;
    }
    const tgt = rule.target;
    let subj = sd;
    let obj = ed;
    if (tgt.kind === "asserted-relationship" && tgt.direction === "reversed") [subj, obj] = [ed, sd];
    if (tgt.kind === "predicate-assertion") {
      subj = tgt.subject === "from" ? sd : ed;
      obj = tgt.object === "to" ? ed : sd;
    }
    let roleKind = null;
    if (tgt.roleKind) {
      if (String(tgt.roleKind).startsWith("enumMap ")) {
        const lk = enumLookup(rule.enumMaps?.[tgt.roleKind.slice(8)], r.properties[tgt.roleKind.slice(8)]);
        if (lk.miss !== undefined) {
          relDecisions.push({ ...base, disposition: "quarantine", category: "held", code: "ENUM_UNMAPPED", reason: `${tgt.roleKind} miss ${JSON.stringify(lk.miss)}` });
          continue;
        }
        roleKind = lk.value;
      } else roleKind = tgt.roleKind;
    }
    const predicate = tgt.kind === "asserted-relationship" ? tgt.type : tgt.predicate;
    const fp = legacyFingerprint(r);
    const assertionUid = `hu:assertion:${slugify(predicate, 40)}-${shortHash(`${predicate}|${subj.uid}|${obj.uid}|${fp}`, 16)}`;
    const loc = locatorFor("relationships.jsonl", r);
    const qualifiers = [];
    if (r.properties.recordedFrom !== undefined) qualifiers.push(`legacy:recordedFrom=${isoString(r.properties.recordedFrom)}`);
    if (r.properties.extractedAt !== undefined) qualifiers.push(`legacy:extractedAt=${isoString(r.properties.extractedAt)}`);
    if (r.properties.mongoResearchRunId) {
      qualifiers.push(`legacy:runId=${r.properties.mongoResearchRunId}`);
      runIds.add(r.properties.mongoResearchRunId);
    }
    const validFrom = isoInstant(r.properties.validFrom);
    const aProps = stripNulls({
      uid: assertionUid,
      id: idOf(assertionUid),
      privacyClass: "PUBLIC",
      predicate,
      assertionKind: "RELATIONSHIP",
      status: "EXTRACTED",
      basisKind: "UNSTATED",
      extractionConfidence: typeof r.properties.confidence === "number" ? r.properties.confidence : null,
      validFrom,
      validFromBasis: "UNKNOWN",
      validToBasis: "UNKNOWN",
      qualifiers: qualifiers.length ? qualifiers.sort() : null,
    });
    aProps.contentHash = "sha256:" + sha256(canonical({ ...aProps, subject: subj.uid, object: obj.uid, evidence: [loc.uid], asserter: agent.uid }));
    assertions.push({ uid: assertionUid, props: aProps, subjectUid: subj.uid, subjectLabel: subj.v2Labels[0], objectUid: obj.uid, objectLabel: obj.v2Labels[0], locatorUid: loc.uid, quoteHash: loc.quoteHash, legacyElementId: r.elementId });
    let relUid = null;
    if (tgt.kind === "asserted-relationship") {
      relUid = `hu:rel:${shortHash(`${tgt.type}|${subj.uid}|${obj.uid}|${fp}`, 16)}`;
      const ep = { relationshipUid: relUid, assertionUid };
      if (tgt.edgeProperties !== "AssertedRecordedProperties") Object.assign(ep, stripNulls({ validFrom, validFromBasis: "UNKNOWN", validToBasis: "UNKNOWN" }));
      if (tgt.edgeProperties === "RoleEdgeProperties") ep.roleKind = roleKind;
      domainRels.push({ type: tgt.type, fromUid: subj.uid, fromLabel: subj.v2Labels[0], toUid: obj.uid, toLabel: obj.v2Labels[0], props: ep, legacyElementId: r.elementId });
    }
    relDecisions.push({ ...base, disposition: "migrate", category: "migrated", v2: { assertionUid, predicate, relationshipUid: relUid, relationshipType: tgt.kind === "asserted-relationship" ? tgt.type : null, subjectUid: subj.uid, objectUid: obj.uid } });
  }
  // node-level legacy run ids
  for (const v of v2Nodes) {
    const rid = byId.get(v.elementId).properties.mongoResearchRunId;
    if (rid) runIds.add(rid);
  }

  // LegalStatus identity: fill the STATUS_OF subject
  for (const v of v2Nodes.filter((x) => x.v2Type === "LegalStatus")) {
    const subjects = domainRels.filter((d) => d.type === "STATUS_OF" && d.fromUid === v.uid).map((d) => d.toUid);
    v.identity.tuple[0] = subjects.length === 1 ? subjects[0] : null;
    if (subjects.length !== 1) v.identity.tier = "provisional";
  }

  // Identifiers (DOI) + HAS_IDENTIFIER assertions citing the node record
  const identifiers = [];
  for (const idr of identifierRows) {
    const iuid = `hu:identifier:${slugify(idr.scheme, 12)}-${shortHash(`${idr.scheme}|${idr.issuer}|${idr.value}`, 16)}`;
    if (identifiers.some((x) => x.uid === iuid)) throw new Error(`identifier ${idr.scheme} ${idr.value} claimed by two legacy records (identity conflict)`);
    identifiers.push({ uid: iuid, props: { uid: iuid, id: idOf(iuid), privacyClass: "PUBLIC", name: `${idr.scheme} ${idr.value}`, scheme: idr.scheme, issuer: idr.issuer, value: idr.value, normalizationRule: idr.normalizationRule } });
    const rec = byId.get(idr.ofElementId);
    const loc = locatorFor("nodes.jsonl", rec);
    const auid = `hu:assertion:has-identifier-${shortHash(`HAS_IDENTIFIER|${idr.ofUid}|${iuid}`, 16)}`;
    const aProps = { uid: auid, id: idOf(auid), privacyClass: "PUBLIC", predicate: "HAS_IDENTIFIER", assertionKind: "RELATIONSHIP", status: "EXTRACTED", basisKind: "UNSTATED", validFromBasis: "UNKNOWN", validToBasis: "UNKNOWN" };
    aProps.contentHash = "sha256:" + sha256(canonical({ ...aProps, subject: idr.ofUid, object: iuid, evidence: [loc.uid], asserter: agent.uid }));
    assertions.push({ uid: auid, props: aProps, subjectUid: idr.ofUid, subjectLabel: idr.ofLabel, objectUid: iuid, objectLabel: "Identifier", locatorUid: loc.uid, quoteHash: loc.quoteHash, legacyElementId: idr.ofElementId });
    const relUid = `hu:rel:${shortHash(`HAS_IDENTIFIER|${idr.ofUid}|${iuid}`, 16)}`;
    domainRels.push({ type: "HAS_IDENTIFIER", fromUid: idr.ofUid, fromLabel: idr.ofLabel, toUid: iuid, toLabel: "Identifier", props: { relationshipUid: relUid, assertionUid: auid, validFromBasis: "UNKNOWN", validToBasis: "UNKNOWN", isPrimary: Boolean(idr.isPrimary) }, legacyElementId: idr.ofElementId });
  }

  const research = [...runIds].sort().map((rid) => ({ uid: activityUidFor("biotech-kg-mongo", rid), id: idOf(activityUidFor("biotech-kg-mongo", rid)), privacyClass: "INTERNAL", name: `legacy research run ${rid}`, activityKind: "RESEARCH", externalRunSystem: "biotech-kg-mongo", runId: rid }));

  // identity candidates (never merged)
  const groups = new Map();
  for (const v of v2Nodes) {
    const k = `${v.v2Type}|${canonical(v.identity.tuple)}`;
    (groups.get(k) ?? groups.set(k, []).get(k)).push(v.uid);
  }
  const identityCandidates = [...groups.entries()].filter(([, u]) => u.length > 1).map(([k, u]) => ({ v2Type: k.split("|")[0], uids: u.sort(), code: "IDENTITY_CANDIDATE" }));

  // ---------- batches ----------
  const batches = [];
  const push = (kind, extra, rows, uids = []) => {
    const content = { kind, ...extra, rows };
    const id = `b${String(batches.length).padStart(3, "0")}-${kind}${extra.labels ? "-" + extra.labels[0] : extra.type ? "-" + extra.type : extra.label ? "-" + extra.label : extra.v2Label ? "-" + extra.v2Label : ""}`;
    batches.push({ batchId: id, kind, ...extra, rows, uids, count: Array.isArray(rows) ? rows.length : 1, batchDigest: "sha256:" + sha256(canonical(content)), effectKey: `migration:${runId}:${id}` });
  };
  push("spine", {}, { agent, activity, research, source, snapshot }, [agent.uid, activity.uid, source.uid, snapshot.uid, ...research.map((x) => x.uid)]);
  const byType = groupBy(v2Nodes, (v) => v.v2Type);
  for (const [, vs] of [...byType.entries()].sort(([a], [b]) => (a < b ? -1 : 1)))
    for (const chunk of chunks(vs, BATCH)) push("nodes", { labels: chunk[0].labels, activityUid: activity.uid }, chunk.map((v) => ({ props: v.props })), chunk.map((v) => v.uid));
  if (identifiers.length) push("identifiers", { activityUid: activity.uid }, identifiers.map((i) => ({ props: i.props })), identifiers.map((i) => i.uid));
  const locs = [...locators.values()].sort((a, b) => (a.uid < b.uid ? -1 : 1));
  for (const chunk of chunks(locs, BATCH)) push("locators", { snapshotUid: snapshot.uid }, chunk.map((l) => ({ props: l })), chunk.map((l) => l.uid));
  const aGroups = groupBy(assertions, (a) => `${a.subjectLabel}|${a.objectLabel}`);
  for (const [k, as] of [...aGroups.entries()].sort(([a], [b]) => (a < b ? -1 : 1)))
    for (const chunk of chunks(as, BATCH)) push("assertions", { subjectLabel: k.split("|")[0], objectLabel: k.split("|")[1], agentUid: agent.uid, activityUid: activity.uid }, chunk.map((a) => ({ props: a.props, subjectUid: a.subjectUid, objectUid: a.objectUid, locatorUid: a.locatorUid, quoteHash: a.quoteHash })), chunk.map((a) => a.uid));
  const rGroups = groupBy(domainRels, (d) => `${d.type}|${d.fromLabel}|${d.toLabel}`);
  for (const [k, ds] of [...rGroups.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
    const [type, fromLabel, toLabel] = k.split("|");
    for (const chunk of chunks(ds, BATCH)) push("relationships", { type, fromLabel, toLabel }, chunk.map((d) => ({ fromUid: d.fromUid, toUid: d.toUid, props: d.props })));
  }
  const mfGroups = groupBy(v2Nodes, (v) => `${v.labels[0]}|${v.legacyLabel}`);
  for (const [k, vs] of [...mfGroups.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
    const [v2Label, legacyLabel] = k.split("|");
    for (const chunk of chunks(vs, BATCH))
      push("migratedFrom", { v2Label, legacyLabel, keyProp: legacyKeyProp(legacyLabel) }, chunk.map((v) => ({ uid: v.uid, legacyKey: v.legacyKey, props: { legacyElementId: v.elementId, legacyId: v.legacyKey, legacyLabel: v.legacyLabel, legacyExportDigest: exportDigest, mapVersion: map.mapVersion } })));
  }
  const relabelSet = new Set(map.policy.legacyPreservation.relabel.relabelLabels);
  const tagSet = new Set(map.policy.legacyPreservation.relabel.tagOnly);
  for (const label of [...liveLabels].sort()) {
    if (!relabelSet.has(label) && !tagSet.has(label)) throw new Error(`label ${label} is neither relabeled nor tagged`);
    const keys = nodes.filter((n) => primary(n) === label).map((n) => legacyKeyOf(label, n.properties));
    if (keys.some((k) => !k)) throw new Error(`label ${label} has nodes without a durable legacy key`);
    push("relabel", { label, mode: relabelSet.has(label) ? "relabel" : "tag", keyProp: legacyKeyProp(label), keys: keys.sort() }, null);
  }

  // ---------- expectations / invariants ----------
  const expected = {
    v2NodesByLabel: countBy(v2Nodes, (v) => v.labels[0]),
    provenanceNodes: { Agent: 1, Activity: 1 + research.length, Source: 1, SourceSnapshot: 1, SourceLocator: locs.length, Identifier: identifiers.length, Assertion: assertions.length },
    relationshipsByType: { ...countBy(domainRels, (d) => d.type), HAS_SUBJECT: assertions.length, HAS_OBJECT: assertions.length, ASSERTED_BY: assertions.length, HAS_EVIDENCE: assertions.length, MIGRATED_FROM: v2Nodes.length, HAS_LOCATOR: locs.length, HAS_SNAPSHOT_spine: 1, WAS_ASSOCIATED_WITH: 1, WAS_INFORMED_BY: research.length, WAS_GENERATED_BY: v2Nodes.length + identifiers.length + assertions.length },
    assertionsByPredicate: countBy(assertions, (a) => a.props.predicate),
    legacyNodes: nodes.length,
    legacyRelationships: rels.length,
    relabeled: nodes.filter((n) => relabelSet.has(primary(n))).length,
    tagged: nodes.filter((n) => tagSet.has(primary(n))).length,
  };
  const v2LabelSet = [...new Set(v2Nodes.flatMap((v) => v.labels))].sort();
  const irNodes = Object.values(binding.release.ir.nodes ?? {});
  const irRels = Object.values(binding.release.ir.relationshipTypes ?? {});
  const exclusiveSlots = [...new Set(irNodes.flatMap((n) => n.exclusiveSlots ?? []))].sort();
  const assertedTypes = irRels.filter((r) => r.relClass === "asserted").map((r) => r.type).sort();
  const invariants = buildInvariants({ expected, v2LabelSet, domainRelTypes: Object.keys(countBy(domainRels, (d) => d.type)), exclusiveSlots, assertedTypes });

  // ---------- accounting ----------
  const nodeRecords = nodes.map((n) => {
    const d = decisions.get(n.elementId);
    return { record: "node", elementId: n.elementId, legacyLabel: d.legacyLabel, category: d.category, disposition: d.disposition, code: d.code ?? "MIGRATED", reason: d.reason ?? null, v2: d.uid ? { uid: d.uid, type: d.v2Type } : null, retainedAs: relabelSet.has(d.legacyLabel) ? `LegacyV0_${d.legacyLabel}` : d.legacyLabel };
  });
  const relRecords = relDecisions.map((d) => ({ record: "relationship", elementId: d.elementId, legacyType: d.type, triple: d.triple, category: d.category, disposition: d.disposition, code: d.code ?? "MIGRATED", reason: d.reason ?? null, v2: d.v2 ?? null, retainedAs: "legacy relationship (unchanged, between LegacyV0 nodes)" }));
  // property accounting for migrated elements
  const propAcc = {};
  for (const n of nodes) {
    const d = decisions.get(n.elementId);
    const rule = map.nodes[d.legacyLabel];
    for (const k of Object.keys(n.properties)) {
      const disp = d.disposition !== "migrate" ? (d.disposition === "quarantine" ? "held-with-node" : "retained-with-node") : (rule.properties?.[k] ?? map.commonProperties[k]).disposition;
      const key = `${d.legacyLabel}.${k}`;
      (propAcc[key] ??= {})[disp] = (propAcc[key][disp] ?? 0) + 1;
    }
  }
  for (const r of rels) {
    const rule = relRule(r);
    const d = relDecisions.find((x) => x.elementId === r.elementId);
    for (const k of Object.keys(r.properties)) {
      const disp = d.disposition !== "migrate" ? (d.disposition === "quarantine" ? "held-with-relationship" : "retained-with-relationship") : (rule.properties?.[k] ?? map.commonEdgeProperties[k]).disposition;
      const key = `${d.triple}.${k}`;
      (propAcc[key] ??= {})[disp] = (propAcc[key][disp] ?? 0) + 1;
    }
  }
  const tally = (recs) => {
    const t = { migrated: 0, "unchanged-retained": 0, held: 0, excluded: 0 };
    for (const r of recs) t[r.category]++;
    return t;
  };
  const nodeTotals = tally(nodeRecords);
  const relTotals = tally(relRecords);
  const reconcile = {
    nodes: { input: exportManifest.counts.nodes, accounted: nodeRecords.length, ok: nodeRecords.length === exportManifest.counts.nodes && Object.values(nodeTotals).reduce((a, b) => a + b, 0) === exportManifest.counts.nodes },
    relationships: { input: exportManifest.counts.relationships, accounted: relRecords.length, ok: relRecords.length === exportManifest.counts.relationships && Object.values(relTotals).reduce((a, b) => a + b, 0) === exportManifest.counts.relationships },
  };
  const byLabel = {};
  for (const r of nodeRecords) ((byLabel[r.legacyLabel] ??= { migrated: 0, "unchanged-retained": 0, held: 0, excluded: 0, total: 0 })[r.category]++, byLabel[r.legacyLabel].total++);
  const byTriple = {};
  for (const r of relRecords) ((byTriple[r.triple] ??= { migrated: 0, "unchanged-retained": 0, held: 0, excluded: 0, total: 0 })[r.category]++, byTriple[r.triple].total++);
  const heldReasons = countBy([...nodeRecords, ...relRecords].filter((r) => r.category === "held"), (r) => `${r.record}:${r.code}`);
  const accounting = {
    format: ACCOUNTING_FORMAT,
    migrationRunId: runId,
    exportId: exportManifest.exportId,
    exportDigest,
    mapDigest,
    totals: { nodes: nodeTotals, relationships: relTotals },
    reconcile,
    byLabel: sortObj(byLabel),
    byTriple: sortObj(byTriple),
    heldReasons: sortObj(heldReasons),
    identityCandidates,
    heldWork: countBy(v2Nodes.flatMap((v) => v.heldWork.map((w) => `${v.v2Type}: ${w}`)), (w) => w),
    properties: sortObj(propAcc),
    v2Created: { nodes: expected.v2NodesByLabel, provenance: expected.provenanceNodes, relationships: expected.relationshipsByType, assertionsByPredicate: expected.assertionsByPredicate },
  };

  const manifest = {
    format: MANIFEST_FORMAT,
    migrationRunId: runId,
    plannerVersion: PLANNER_VERSION,
    map: { path: path.relative(REPO, mapFile).replace(/\\/g, "/"), digest: mapDigest, mapVersion: map.mapVersion },
    source: { kind: "live-legacy-graph", exportId: exportManifest.exportId, exportDigest, exportFormat: exportManifest.format, server: exportManifest.source?.agent, counts: { nodes: exportManifest.counts.nodes, relationships: exportManifest.counts.relationships, labels: exportManifest.counts.labels, relationshipTypes: exportManifest.counts.relationshipTypes }, files: Object.fromEntries(Object.entries(exportManifest.files).map(([k, v]) => [k, v.sha256])) },
    target: { releaseId: binding.releaseId, mapTargetReleaseId: map.target.releaseId, parentBaseline: map.target.parentBaseline, schemaReleaseDigest, schemaReleaseDigestBound: true, schemaDigest: binding.schemaDigest, ddlDigest: binding.ddlDigest, releaseSource: binding.source, boundFrom: "loadRelease() (@bks/schema-workspace); never a literal", mapBoundToRelease: binding.mapSha256 === mapDigest.slice(7), note: "apply verifies the same release is pinned at apply time and that release DDL is installed and ONLINE" },
    uidMap: { file: "uid-map.jsonl", entries: v2Nodes.length + identifiers.length + assertions.length + locs.length },
    transformations: { enumMaps: collectEnumMaps(map), propertyMapRef: "accounting.properties", transforms: Object.keys(map.transforms) },
    temporal: map.policy.temporal,
    provenance: { agentUid: agent.uid, activityUid: activity.uid, researchActivityUids: research.map((x) => x.uid), sourceUid: source.uid, snapshotUid: snapshot.uid, locators: locs.length, assertionStatus: "EXTRACTED", evidenceEdge: { role: "CONTEXT", origin: "DECLARED" } },
    batches: batches.map(({ rows, uids, ...b }) => ({ ...b, uidCount: uids.length })),
    checkpoint: { identity: "(migrationRunId, batchId, batchDigest)", marker: "KsIntentMarker {effectKey: migration:<runId>:<batchId>, intentDigest: batchDigest}", transaction: "one explicit write transaction per batch: lock KsWriteFence, claim marker (applied with same digest -> skip; different digest -> EFFECT_CONFLICT), precondition, statements, marker applied, commit", restart: "re-run apply with the same manifest; applied batches are skipped by marker, a failed batch is retried with a new attempt appended" },
    expected,
    invariants,
    quarantine: { nodes: nodeTotals.held, relationships: relTotals.held, reasons: accounting.heldReasons, identityCandidates: identityCandidates.length },
    releaseMarker: { label: "KsReleaseMarker", writtenLast: true, fields: ["releaseId", "schemaReleaseDigest", "installedAt", "migrationRunId", "ddlDigest", "legacyExportDigest", "migrationManifestDigest"] },
    rollback: {
      material: { exportId: exportManifest.exportId, exportDigest, custodyPath: `runs/release-v2/custody/backups/${exportManifest.exportId}/` },
      beforeV2Writes: ["switch bindings back to the retained legacy graph (legacy rows untouched except relabel/tag)", "reverse relabel per policy.legacyPreservation.relabel.reverse", "v2 elements of this run are identified by lastWriterRunId = migrationRunId and remain inert for legacy readers"],
      afterV2Writes: "freeze and reconcile; prefer forward repair; restoring the export into a fresh database is the data rollback (accepted data-loss policy required)",
    },
    accountingSummary: { totals: accounting.totals, reconcile },
  };
  return { manifest, accounting, nodeRecords, relRecords, v2Nodes, assertions, identifiers, locators: locs, batches, runId };
}

function buildInvariants({ expected, v2LabelSet, domainRelTypes, exclusiveSlots = [], assertedTypes = [] }) {
  const inv = [];
  for (const [label, n] of Object.entries(expected.v2NodesByLabel)) inv.push({ id: `count.${label}`, statement: `MATCH (n:\`${label}\`) WHERE n.lastWriterRunId = $run RETURN count(n) AS value`, expect: n });
  for (const [label, n] of Object.entries(expected.provenanceNodes)) inv.push({ id: `count.${label}`, statement: `MATCH (n:\`${label}\`) WHERE n.lastWriterRunId = $run RETURN count(n) AS value`, expect: n });
  for (const t of domainRelTypes) {
    inv.push({ id: `count.rel.${t}`, statement: `MATCH ()-[r:\`${t}\`]->() WHERE r.lastWriterRunId = $run RETURN count(r) AS value`, expect: expected.relationshipsByType[t] });
    inv.push({ id: `assertedEdgeBacked.${t}`, statement: `MATCH ()-[r:\`${t}\`]->() WHERE r.lastWriterRunId = $run AND NOT EXISTS { MATCH (a:Assertion {uid: r.assertionUid}) WHERE a.predicate = '${t}' } RETURN count(r) AS value`, expect: 0 });
  }
  inv.push({ id: "assertion.evidence", statement: "MATCH (a:Assertion) WHERE a.lastWriterRunId = $run AND NOT EXISTS { MATCH (a)-[e:HAS_EVIDENCE]->(:SourceLocator) WHERE e.role = 'CONTEXT' AND e.origin = 'DECLARED' } RETURN count(a) AS value", expect: 0 });
  inv.push({ id: "assertion.asserter", statement: "MATCH (a:Assertion) WHERE a.lastWriterRunId = $run AND NOT EXISTS { MATCH (a)-[:ASSERTED_BY]->(:Agent) } RETURN count(a) AS value", expect: 0 });
  inv.push({ id: "assertion.status", statement: "MATCH (a:Assertion) WHERE a.lastWriterRunId = $run AND a.status <> 'EXTRACTED' RETURN count(a) AS value", expect: 0 });
  inv.push({ id: "assertion.subjectObject", statement: "MATCH (a:Assertion) WHERE a.lastWriterRunId = $run AND (COUNT { (a)-[:HAS_SUBJECT]->() } <> 1 OR COUNT { (a)-[:HAS_OBJECT]->() } <> 1) RETURN count(a) AS value", expect: 0 });
  inv.push({ id: "locator.anchored", statement: "MATCH (l:SourceLocator) WHERE l.lastWriterRunId = $run AND NOT EXISTS { MATCH (:SourceSnapshot)-[:HAS_LOCATOR]->(l) } RETURN count(l) AS value", expect: 0 });
  inv.push({ id: "node.migratedFrom", statement: "MATCH (n:Entity) WHERE n.lastWriterRunId = $run AND NOT n:Agent AND NOT n:Source AND NOT n:Identifier AND COUNT { (n)-[:MIGRATED_FROM]->(:LegacyV0) } <> 1 RETURN count(n) AS value", expect: 0 });
  inv.push({ id: "node.generatedBy", statement: "MATCH (n:Entity) WHERE n.lastWriterRunId = $run AND NOT n:Agent AND NOT n:Source AND NOT EXISTS { MATCH (n)-[:WAS_GENERATED_BY]->(:Activity) } RETURN count(n) AS value", expect: 0 });
  inv.push({ id: "uid.unique", statement: "MATCH (n) WHERE n.lastWriterRunId = $run AND n.uid IS NOT NULL WITH n.uid AS u, count(*) AS c WHERE c > 1 RETURN count(u) AS value", expect: 0 });
  inv.push({ id: "legacy.noV2Label", statement: "MATCH (n:LegacyV0) WHERE any(l IN labels(n) WHERE l IN $v2Labels) RETURN count(n) AS value", params: { v2Labels: v2LabelSet }, expect: 0 });
  inv.push({ id: "legacy.nodesRetained", statement: "MATCH (n:LegacyV0) RETURN count(n) AS value", expect: expected.legacyNodes });
  inv.push({ id: "legacy.relationshipsRetained", statement: "MATCH (:LegacyV0)-[r]->(:LegacyV0) RETURN count(r) AS value", expect: expected.legacyRelationships });
  inv.push({ id: "legacy.untagged", statement: "MATCH (n) WHERE n.uid IS NULL AND NOT n:LegacyV0 AND NOT n:KsWriteFence AND NOT n:KsRevocationFence AND NOT n:KsIntentMarker AND NOT n:KsReleaseMarker RETURN count(n) AS value", expect: 0 });
  inv.push({ id: "legacy.relabeled", statement: "MATCH (n:LegacyV0) WHERE any(l IN labels(n) WHERE l STARTS WITH 'LegacyV0_') RETURN count(n) AS value", expect: expected.relabeled });
  inv.push({ id: "legacy.tagOnly", statement: "MATCH (n:LegacyV0) WHERE none(l IN labels(n) WHERE l STARTS WITH 'LegacyV0_') RETURN count(n) AS value", expect: expected.tagged });
  // graph-wide invariants (Gate F): identifiers, uids, evidence, asserted-edge backing, exclusive episodes
  inv.push({ id: "graph.identifier.unique", statement: "MATCH (i:Identifier) WITH i.scheme AS s, i.issuer AS iss, i.value AS v, count(*) AS c WHERE c > 1 RETURN count(*) AS value", expect: 0 });
  inv.push({ id: "graph.uid.unique", statement: "MATCH (n) WHERE n.uid IS NOT NULL WITH n.uid AS u, count(*) AS c WHERE c > 1 RETURN count(u) AS value", expect: 0 });
  inv.push({ id: "graph.evidence.targetsLocator", statement: "MATCH (:Assertion)-[:HAS_EVIDENCE]->(x) WHERE NOT x:SourceLocator RETURN count(x) AS value", expect: 0 });
  inv.push({ id: "graph.evidence.noOrphanLocator", statement: "MATCH (l:SourceLocator) WHERE NOT EXISTS { MATCH (:SourceSnapshot)-[:HAS_LOCATOR]->(l) } RETURN count(l) AS value", expect: 0 });
  inv.push({ id: "graph.evidence.snapshotAnchored", statement: "MATCH (p:SourceSnapshot) WHERE NOT EXISTS { MATCH (:Source)-[:HAS_SNAPSHOT]->(p) } RETURN count(p) AS value", expect: 0 });
  inv.push({ id: "run.locator.cited", statement: "MATCH (l:SourceLocator) WHERE l.lastWriterRunId = $run AND NOT EXISTS { MATCH (:Assertion)-[:HAS_EVIDENCE]->(l) } RETURN count(l) AS value", expect: 0 });
  inv.push({ id: "graph.assertedEdge.backed", statement: "MATCH (a)-[r]->(b) WHERE type(r) IN $assertedTypes AND NOT a:LegacyV0 AND NOT b:LegacyV0 AND NOT EXISTS { MATCH (x:Assertion {uid: r.assertionUid}) WHERE x.predicate = type(r) } RETURN count(r) AS value", params: { assertedTypes }, expect: 0 });
  for (const t of exclusiveSlots)
    inv.push({ id: `graph.exclusive.${t}`, statement: `MATCH (s)-[r1:${"`"}${t}${"`"}]->(), (s)-[r2:${"`"}${t}${"`"}]->() WHERE elementId(r1) < elementId(r2) AND r1.validTo IS NULL AND r2.validTo IS NULL MATCH (a1:Assertion {uid: r1.assertionUid})-[:ASSERTED_BY]->(g)<-[:ASSERTED_BY]-(a2:Assertion {uid: r2.assertionUid}) RETURN count(*) AS value`, expect: 0 });
  inv.push({ id: "od44.noV2Vectors", statement: "MATCH (n) WHERE n.lastWriterRunId = $run AND n.searchEmbedding IS NOT NULL RETURN count(n) AS value", expect: 0 });
  inv.push({ id: "releaseMarker.single", statement: "MATCH (r:KsReleaseMarker {migrationRunId: $run}) RETURN count(r) AS value", expect: 1, phase: "after-marker" });
  return inv;
}

function collectEnumMaps(map) {
  const out = {};
  for (const [label, rule] of Object.entries(map.nodes)) if (rule.enumMaps) out[label] = rule.enumMaps;
  for (const r of map.relationships) if (r.enumMaps) out[`${r.from}-${r.type}->${r.to}`] = r.enumMaps;
  return out;
}
function stripNulls(o) {
  const out = {};
  for (const [k, v] of Object.entries(o)) if (v !== null && v !== undefined) out[k] = v;
  return out;
}
function groupBy(xs, f) {
  const m = new Map();
  for (const x of xs) {
    const k = f(x);
    (m.get(k) ?? m.set(k, []).get(k)).push(x);
  }
  return m;
}
function countBy(xs, f) {
  const o = {};
  for (const x of xs) o[f(x)] = (o[f(x)] ?? 0) + 1;
  return sortObj(o);
}
function chunks(xs, n) {
  const out = [];
  for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n));
  return out;
}
function sortObj(o) {
  return Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

export function writePlan(plan, outDir) {
  const existing = path.join(outDir, "migration-manifest.json");
  if (fs.existsSync(existing)) {
    const prev = JSON.parse(fs.readFileSync(existing, "utf8"));
    const next = "sha256:" + sha256(canonical({ ...plan.manifest, manifestDigest: undefined, files: prev.files }));
    if (prev.migrationRunId !== plan.runId) throw new Error(`refusing to overwrite plan ${prev.migrationRunId} in ${outDir}`);
    void next;
  }
  fs.mkdirSync(outDir, { recursive: true });
  const uidW = new JsonlWriter(path.join(outDir, "uid-map.jsonl"));
  for (const v of plan.v2Nodes) uidW.write({ kind: "node", legacyElementId: v.elementId, legacyLabel: v.legacyLabel, legacyKey: v.legacyKey, uid: v.uid, v2Type: v.v2Type, identity: v.identity });
  for (const i of plan.identifiers) uidW.write({ kind: "identifier", uid: i.uid, scheme: i.props.scheme });
  for (const a of plan.assertions) uidW.write({ kind: "assertion", uid: a.uid, predicate: a.props.predicate, legacyElementId: a.legacyElementId, locatorUid: a.locatorUid });
  for (const l of plan.locators) uidW.write({ kind: "locator", uid: l.uid, selectorJson: l.selectorJson });
  const uidFile = uidW.close();
  const recW = new JsonlWriter(path.join(outDir, "accounting-records.jsonl"));
  for (const r of [...plan.nodeRecords, ...plan.relRecords]) recW.write(r);
  const recFile = recW.close();
  const batchW = new JsonlWriter(path.join(outDir, "batches.jsonl"));
  for (const b of plan.batches) batchW.write(b);
  const batchFile = batchW.close();
  plan.manifest.files = { "uid-map.jsonl": uidFile.sha256, "accounting-records.jsonl": recFile.sha256, "batches.jsonl": batchFile.sha256 };
  plan.accounting.recordsFile = { name: "accounting-records.jsonl", sha256: recFile.sha256, lines: recFile.lines };
  const acc = writeJson(path.join(outDir, "accounting.json"), plan.accounting);
  plan.manifest.files["accounting.json"] = acc.sha256;
  plan.manifest.manifestDigest = "sha256:" + sha256(canonical({ ...plan.manifest, manifestDigest: undefined }));
  writeJson(path.join(outDir, "migration-manifest.json"), plan.manifest);
  return plan.manifest.manifestDigest;
}

// ---------- CLI ----------
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith("--")) args[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
  if (!args.export) {
    console.error("usage: plan-migration.mjs --export <exportDir> [--map <legacy-map.yaml>] [--out <dir>] [--schema-release-digest sha256:...]");
    process.exit(2);
  }
  const exportDir = path.resolve(args.export);
  const binding = releaseBinding(args["release-dir"] ? path.resolve(args["release-dir"]) : undefined);
  const mapFile = path.resolve(args.map ?? binding.mapPath);
  try {
    const plan = planMigration({ exportDir, mapFile, binding });
    const outDir = path.resolve(args.out ?? path.join(exportDir, "plans", plan.runId));
    const digest = writePlan(plan, outDir);
    console.log(JSON.stringify({ ok: true, migrationRunId: plan.runId, manifestDigest: digest, outDir: path.relative(REPO, outDir), batches: plan.batches.length, totals: plan.accounting.totals, reconcile: plan.accounting.reconcile, heldReasons: plan.accounting.heldReasons, identityCandidates: plan.accounting.identityCandidates.length }, null, 2));
  } catch (e) {
    console.error(JSON.stringify({ ok: false, error: e.message, gaps: e.gaps ?? undefined }, null, 2));
    process.exit(1);
  }
}
