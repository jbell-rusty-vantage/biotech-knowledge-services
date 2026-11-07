/**
 * migration/v1-map.yaml generator (S1): v1 proposal (pinned final_biotech_schema_proposal.graphql, digest 8313a6f8...)
 * -> v2 dispositions, from the frozen diff final/_work/diff-v1-v2.json (BKS 431c8a7) plus the sourced enum value
 * mappings (decision-report R-57, _work/rulings.yaml, vocabularies/frontiers.yaml synthesis.regulatoryPathwayMapping
 * R-66 / OQ-D8-02). Deterministic. Also the placeholder for migration/legacy-map.yaml (owned by S8).
 *
 *   buildV1Map({ finalDir }) -> { text, report }
 *   buildLegacyMapPlaceholder() -> text
 */
import { resolve } from "node:path";
import { readJson, readYaml, toYaml, RELEASE_ID } from "./common.mjs";

/** DECISIONS.md "Seven unmapped legacy relationships" (selected handling, verbatim). */
const UNMAPPED = [
  { v1: "ABOUT_CONDITION", handling: "Convert the sourced observation to an Assertion about Condition with registered predicate/context; retain old edge ID in mapping lineage.", v2: ["Assertion", "Condition"], retainOldEdgeIdInLineage: true, quarantine: false },
  { v1: "ASSESSES_CLAIM_EVIDENCE", handling: "Map assessment to Claim through ASSESSES and link judged assertions by DERIVED_FROM; do not point Assessment at unsupported Assertion targets.", v2: ["ASSESSES", "DERIVED_FROM"], retainOldEdgeIdInLineage: true, quarantine: false },
  { v1: "CLAIM_EVIDENCE_BASED_ON", handling: "Preserve the evidence dependency through DERIVED_FROM and locator-backed HAS_EVIDENCE as appropriate; no invented support verdict.", v2: ["DERIVED_FROM", "HAS_EVIDENCE"], retainOldEdgeIdInLineage: true, quarantine: false },
  { v1: "DEPENDS_ON", handling: "Keep dependency semantics in the versioned protocol execution/step artifact until a registered v2 representation is accepted; quarantine graph-only migration, retain old edge, report unsupported traversal. Do not turn dependency into mere ordering.", v2: [], retainOldEdgeIdInLineage: true, quarantine: true, unsupportedTraversal: true },
  { v1: "HOSTS_CHANNEL", handling: "Map hosting/distribution meaning to supported Channel/platform properties or registered operator/distribution predicate only after endpoint inspection; ambiguous hosting is retained in migration quarantine.", v2: ["Channel"], retainOldEdgeIdInLineage: true, quarantine: "when-ambiguous" },
  { v1: "PART_OF_PLAN", handling: "Map evidenced membership to ProtocolEdition/step containment; retain unsupported runtime-plan membership externally.", v2: ["ProtocolEdition"], retainOldEdgeIdInLineage: true, quarantine: "runtime-plan-membership-retained-externally" },
  { v1: "USES_COMPONENT", handling: "Map true intervention means to registered regimen/step/component representations; unresolved dose/role meaning is quarantined.", v2: ["Intervention", "InterventionComponent"], retainOldEdgeIdInLineage: true, quarantine: "when-unresolved" },
];

const textOf = (e) => (Array.isArray(e) ? e.map((x) => (typeof x === "string" ? x : x.text ?? x.into ?? x.reason ?? "")).filter(Boolean) : []);
const rulingOf = (s) => {
  const m = String(s ?? "").match(/\b(R-\d+|F-\d+|I-\d+)\b/g);
  return m ? [...new Set(m)].join(", ") : null;
};
const clip = (s, n = 400) => {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

function nodeDisposition(v) {
  if (v.cls === "removed") return v.sub === "folded" ? "folded" : v.sub === "deferred" ? "retired" : `removed-${v.sub}`;
  return v.cls; // kept | merged | renamed
}
function relDisposition(v) {
  if (v.cls === "removed") return { unmapped: "unmapped", deferred: "retired", pattern: "carried-by-pattern" }[v.sub] ?? `removed-${v.sub}`;
  if (v.cls === "demoted") return "predicate-only";
  return v.cls; // kept | merged | renamed
}

/** Enum value-level mappings referenced by the corrected SDL docstrings. Never guessed: multi-valued and missing are explicit. */
function valueMappings(finalDir) {
  // R-57 (decision-report section R-57; _work/rulings.yaml remove-enum SpecComparator note; ThresholdComparator retiredEnums row).
  const quantity = {
    v2Enum: "QuantityComparator",
    owner: "D1",
    ruling: "R-57",
    sources: ["schema/program/final/decision-report.md R-57", "schema/program/final/_work/rulings.yaml (remove-enum SpecComparator)", "schema/program/final/node-register.yaml retiredEnums ThresholdComparator"],
    from: {
      SpecComparator: {
        owner: "D8",
        values: [
          { v1: "NOT_LESS_THAN", v2: "GTE" },
          { v1: "NOT_MORE_THAN", v2: "LTE" },
          { v1: "RANGE", v2: "BETWEEN", note: "quantity null; bounds in the Assertion qualifier range:<low>-<high>" },
          { v1: "EQUALS", v2: "EQ", note: "packet D8 value; absent from the pinned v1 SpecComparator" },
          { v1: "ABSENT_IN", v2: "ABSENT" },
          { v1: "CONFORMS_TO_DESCRIPTION", v2: "CONFORMS_TO_DESCRIPTION", note: "same name in QuantityComparator" },
          { v1: "REFERENCE_ONLY", v2: "REFERENCE_ONLY", note: "same name in QuantityComparator" },
          { v1: "UNKNOWN", v2: "UNKNOWN", note: "packet D8 value; same name in QuantityComparator" },
        ],
      },
      ThresholdComparator: {
        owner: "D5",
        values: ["GT", "GTE", "LT", "LTE", "BETWEEN", "OUTSIDE_REFERENCE_RANGE"].map((v) => ({ v1: v, v2: v, note: "1:1 (R-57)" })),
      },
    },
  };
  // R-66 / OQ-D8-02: vocabularies/frontiers.yaml synthesis.regulatoryPathwayMapping.
  const frontiers = readYaml(resolve(finalDir, "vocabularies", "frontiers.yaml"));
  const rpm = frontiers?.synthesis?.regulatoryPathwayMapping ?? {};
  const toRows = (map) =>
    Object.entries(map ?? {}).map(([v1, raw]) => {
      const s = String(raw);
      if (/^[A-Z][A-Z0-9_]*$/.test(s)) return { v1, v2: s };
      const options = [...s.matchAll(/\b([A-Z]{2}_[A-Z0-9_]+)\b/g)].map((m) => m[1]);
      if (options.length >= 2) return { v1, v2: null, disposition: "conditional", options, note: s };
      return { v1, v2: null, disposition: "unmapped", reason: s };
    });
  const pathway = {
    v2Enum: "RegulatoryPathway",
    owner: "D8",
    ruling: "R-56, R-66 (OQ-D8-02)",
    sources: ["schema/program/final/vocabularies/frontiers.yaml synthesis.regulatoryPathwayMapping", "schema/program/final/schema/D8.graphql enum RegulatoryPathway"],
    from: {
      ApprovalPathway: { owner: "D13", field: "Event.approvalPathway", values: toRows(rpm.approvalPathway) },
      DesignationType: { owner: "D13", field: "Event.designationType", values: toRows(rpm.designationType) },
    },
  };
  return { QuantityComparator: quantity, RegulatoryPathway: pathway };
}

export function buildV1Map({ finalDir }) {
  const d = readJson(resolve(finalDir, "_work", "diff-v1-v2.json"));
  const report = { nodes: {}, relationshipTypes: {}, problems: [] };
  const count = (bucket, k) => (bucket[k] = (bucket[k] ?? 0) + 1);

  const nodeTypes = Object.keys(d.nodes).sort().map((name) => {
    const v = d.nodes[name];
    const disposition = nodeDisposition(v);
    count(report.nodes, disposition);
    const ev = v.evidence ?? {};
    const notes = [...textOf(ev.mergedInto), ...textOf(ev.deferred)];
    const via = Array.isArray(v.via) ? v.via.join(" ‖ ") : v.via;
    const v2 = v.targets?.length ? (v.targets.length === 1 ? v.targets[0] : [...v.targets]) : v.target ?? null;
    return { v1: name, disposition, v2, ruling: rulingOf([via, ...notes].join(" ")), note: clip(via || notes[0] || "") };
  });

  const relationshipTypes = Object.keys(d.relationshipTypes).sort().map((name) => {
    const v = d.relationshipTypes[name];
    const disposition = relDisposition(v);
    count(report.relationshipTypes, disposition);
    const notes = textOf(v.evidence);
    const row = {
      v1: name,
      disposition,
      v2: v.predicate ? `predicate ${v.predicate}` : v.carriedBy ? [...v.carriedBy] : v.target ?? null,
      ruling: rulingOf([v.via, ...notes].join(" ")),
      note: clip(v.via || notes[0] || ""),
    };
    if (v.cls === "kept") {
      const changes = {};
      if (v.v1Class !== v.v2Class) changes.class = `${v.v1Class} -> ${v.v2Class}`;
      if (JSON.stringify(v.v1Props) !== JSON.stringify(v.v2Props)) changes.edgeProperties = `${(v.v1Props ?? []).join("|")} -> ${(v.v2Props ?? []).join("|")}`;
      if (Object.keys(changes).length) row.changes = changes;
    }
    if (disposition === "unmapped") {
      if (!UNMAPPED.some((x) => x.v1 === name)) report.problems.push(`unmapped v1 edge ${name} has no DECISIONS disposition`);
      row.note = "see unmappedEdges (DECISIONS.md 'Seven unmapped legacy relationships')";
    }
    return row;
  });

  const unmappedInDiff = relationshipTypes.filter((r) => r.disposition === "unmapped").map((r) => r.v1).sort();
  const expectedUnmapped = UNMAPPED.map((u) => u.v1).sort();
  if (JSON.stringify(unmappedInDiff) !== JSON.stringify(expectedUnmapped)) report.problems.push(`unmapped set differs: diff ${unmappedInDiff.join(",")} vs DECISIONS ${expectedUnmapped.join(",")}`);

  const inputs = d.summary.inputs;
  if (nodeTypes.length !== 192 || inputs.v1.nodes !== 192) report.problems.push(`v1 node count ${nodeTypes.length} (summary ${inputs.v1.nodes}), expected 192`);
  if (relationshipTypes.length !== 393 || inputs.v1.relationshipTypes !== 393) report.problems.push(`v1 relationship count ${relationshipTypes.length} (summary ${inputs.v1.relationshipTypes}), expected 393`);

  const properties = d.verifiedRenames.map((r) => ({ v1: r.old, disposition: "renamed", v2: r.new, at: [...r.at], note: clip((r.sources ?? []).map((s) => `${s.src}: ${s.snippet}`).join(" ‖ ")) }));
  const enumRows = [
    ...d.enums.kept.map((e) => ({ v1: e.name, disposition: e.changed ? "kept-changed" : "unchanged", v2: e.name, ...(e.changed ? { valuesRemoved: [...e.removed], valuesAdded: [...e.added] } : {}) })),
    ...d.enums.removed.map((e) => ({ v1: e.name, disposition: e.replacement ? "replaced" : "retired", v2: e.replacement ?? null, note: clip(`used by ${(e.usedBy ?? []).join(", ")}; owner fate ${(e.ownerFate ?? []).join(", ")}`) })),
  ].sort((a, b) => a.v1.localeCompare(b.v1));
  const vm = valueMappings(finalDir);
  report.unmappedEnumValues = [];
  for (const [k, m] of Object.entries(vm)) for (const src of Object.values(m.from)) for (const row of src.values) if (row.disposition === "unmapped") report.unmappedEnumValues.push(`${k}: ${row.v1} (${row.reason})`);
  const simple = (sec, key) =>
    [
      ...sec.kept.map((x) =>
        typeof x === "string"
          ? { v1: x, disposition: "unchanged", v2: x }
          : { v1: x.name, disposition: x.removed?.length || x.added?.length ? "kept-changed" : "unchanged", v2: x.name, ...(x.removed?.length ? { membersRemoved: [...x.removed] } : {}), ...(x.added?.length ? { membersAdded: [...x.added] } : {}) },
      ),
      ...sec.removed.map((x) => ({ v1: x.name, disposition: x.replacedBy ? "replaced" : "retired", v2: null, note: clip(x.replacedBy ?? (x[key] !== undefined ? `${key} ${x[key]}` : "")) })),
    ].sort((a, b) => a.v1.localeCompare(b.v1));

  report.counts = {
    nodeTypes: nodeTypes.length,
    relationshipTypes: relationshipTypes.length,
    properties: properties.length,
    enums: enumRows.length,
    unions: d.unions.kept.length + d.unions.removed.length,
    interfaces: d.interfaces.kept.length + d.interfaces.removed.length,
    edgePropertyTypes: d.edgePropertyTypes.kept.length + d.edgePropertyTypes.removed.length,
    unmappedEdges: UNMAPPED.length,
  };

  const doc = {
    format: "bks-v1-map.v1",
    releaseId: RELEASE_ID,
    scope:
      "Policy for any v1-proposal-shaped import (pinned final_biotech_schema_proposal.graphql, 192 node types / 393 relationship types). The live Aura graph is NOT v1-shaped: it is the legacy biotech-kg schema (S0-INVENTORY section 4: 19 labels, 25 relationship types), whose dispositions are migration/legacy-map.yaml (owner S8). This file is navigation and policy, never an execution script; S8 executes migrations.",
    v1: { schemaDigest: inputs.v1.schemaDigest, nodes: inputs.v1.nodes, relationshipTypes: inputs.v1.relationshipTypes },
    source: { diff: "schema/program/final/_work/diff-v1-v2.json (BKS 431c8a7)", notes: "schema/program/final/migration-notes.md appendices A1-A8", diffComputedAgainstV2: inputs.v2.schemaDigest },
    dispositionLegend: {
      unchanged: "same name and meaning in v2",
      kept: "same name in v2 (properties or class may change; see changes)",
      "kept-changed": "same name in v2 with changed values or members",
      renamed: "renamed to the v2 target",
      merged: "folded into the v2 target type(s)",
      replaced: "replaced by the named v2 construct",
      folded: "no node; its meaning is a property, qualifier or locator on another record",
      retired: "deliberately not carried (deferred / cut by a ruling); no silent substitute",
      "predicate-only": "no typed edge; an Assertion with the named predicate",
      "carried-by-pattern": "no typed edge; the meaning is carried by the listed kernel pattern edges",
      unmapped: "no register or ruling row; handled by DECISIONS (see unmappedEdges)",
    },
    counts: { nodeTypes: report.nodes, relationshipTypes: report.relationshipTypes },
    unmappedEdges: UNMAPPED.map((u) => ({ ...u, owner: "S8", decision: "docs/plans/schema-v2-service-release/DECISIONS.md: Seven unmapped legacy relationships (copy: decisions/DECISIONS.md)" })),
    nodeTypes,
    relationshipTypes,
    properties,
    enums: { types: enumRows, valueMappings: vm },
    unions: simple(d.unions, "members"),
    interfaces: simple(d.interfaces, "members"),
    edgePropertyTypes: simple(d.edgePropertyTypes, "usedBy"),
  };
  const header = "# GENERATED by scripts/release/lib/v1map.mjs from the frozen candidate (BKS 431c8a7); do not edit by hand.\n";
  return { text: toYaml(doc, header), report };
}

/** S0-INVENTORY.md section 4 (live Aura, legacy biotech-kg shape). */
const LEGACY_LABELS = ["Biomarker", "Person", "CompoundForm", "Product", "Compound", "ProductSnapshot", "Listing", "ListingSnapshot", "TechnologyPlatform", "RegulatoryStatus", "LabTest", "PanelDefinition", "Organization", "Event", "PhysicalLocation", "Study", "Document", "OrganizationSnapshot", "BellLabsSchemaDeploymentEvidence"];
const LEGACY_RELS = ["MEASURES", "INCLUDES_BIOMARKER", "CONTAINS_COMPOUND_FORM", "HAS_SNAPSHOT", "ADVISES", "USES_PLATFORM", "EMPLOYS", "OFFERS", "IMPLEMENTS", "LISTS", "LISTS_PRODUCT", "IMPLEMENTS_PANEL", "DELIVERS_LABTEST", "DEVELOPS_PLATFORM", "HAS_REGULATORY_STATUS", "INVESTIGATED_BY", "ABOUT", "FOUNDED_BY", "INCLUDES_LABTEST", "REPORTED_IN", "HAS_LOCATION", "HAS_CEO", "SPONSORED_BY", "HAS_PRIMARY_SOURCE", "AUTHORED_BY"];

export function buildLegacyMapPlaceholder() {
  const doc = {
    format: "bks-legacy-map.v1",
    releaseId: RELEASE_ID,
    status: "placeholder",
    owner: "S8",
    excludedFromFrozenDigestSet: true,
    note: "Placeholder hosted by S1. S8 (migration) fills every live legacy label, relationship type, property and enum disposition (S0-INVENTORY section 5). Until S8 delivers, this file is excluded from the frozen digest set of release.json; when S8 delivers, S1 re-releases as biotech-schema-v2.0.1 if the bundle changes. Legacy data is never deleted.",
    source: "docs/plans/schema-v2-service-release/S0-INVENTORY.md section 4 (Aura database neo4j, 5.27-aura enterprise, read-only inventory 2026-10-11)",
    labels: LEGACY_LABELS.map((label) => ({ label, disposition: "pending-S8", ...(label === "BellLabsSchemaDeploymentEvidence" ? { note: "operational label" } : {}) })),
    relationshipTypes: LEGACY_RELS.map((type) => ({ type, disposition: "pending-S8" })),
    properties: [],
    enums: [],
  };
  return toYaml(doc, "# PLACEHOLDER (owner S8). Generated by scripts/release/lib/v1map.mjs; S8 replaces it.\n");
}
