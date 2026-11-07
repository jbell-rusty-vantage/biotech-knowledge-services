/**
 * Minimal structural model of the assembled SDL for the release generators (labels, relationship fields, edge-property
 * profiles, unions, interfaces, module of each definition). The TypeScript IR (@bks/schema-workspace parse.ts) is the
 * runtime authority; this model only feeds params / DDL / metrics generation and is cross-checked by tests.
 */
import { graphql } from "./common.mjs";

const named = (t) => (t.kind === "NamedType" ? t.name.value : named(t.type));
const isList = (t) => (t.kind === "ListType" ? true : t.kind === "NonNullType" ? isList(t.type) : false);
const dir = (d, n) => (d ?? []).find((x) => x.name.value === n);
const argv = (d, n) => {
  const a = d?.arguments?.find((x) => x.name.value === n);
  if (!a) return undefined;
  const v = a.value;
  if (v.kind === "ListValue") return v.values.map((x) => x.value);
  return v.value;
};

/** @param {string} sdl @param {{modules: Array<{id: string, definitionNames: Array<{name: string}>}>}} manifest */
export function buildSdlModel(sdl, manifest) {
  const doc = graphql.parse(sdl, { noLocation: true });
  const moduleOf = new Map();
  for (const m of manifest.modules) for (const d of m.definitionNames) moduleOf.set(d.name, m.id);
  const unions = new Map();
  const interfaces = new Map();
  const enums = new Map();
  const edgeProps = new Map();
  const nodes = new Map();
  const scalars = new Set(["String", "Int", "Float", "Boolean", "ID", "DateTime", "Date", "Time", "LocalTime", "LocalDateTime", "Duration", "BigInt", "Point", "CartesianPoint"]);
  for (const d of doc.definitions) {
    if (d.kind === "ScalarTypeDefinition") scalars.add(d.name.value);
    if (d.kind === "UnionTypeDefinition") unions.set(d.name.value, d.types.map((t) => t.name.value));
    if (d.kind === "EnumTypeDefinition") enums.set(d.name.value, d.values.map((v) => v.name.value));
    if (d.kind === "InterfaceTypeDefinition") interfaces.set(d.name.value, { name: d.name.value, fields: (d.fields ?? []).map((f) => f.name.value), implementers: [] });
  }
  for (const d of doc.definitions) {
    if (d.kind !== "ObjectTypeDefinition") continue;
    if (dir(d.directives, "relationshipProperties")) {
      edgeProps.set(d.name.value, (d.fields ?? []).map((f) => ({ name: f.name.value, type: named(f.type), required: f.type.kind === "NonNullType", list: isList(f.type) })));
      continue;
    }
    const node = dir(d.directives, "node");
    if (!node) continue;
    const labels = argv(node, "labels") ?? [d.name.value];
    const ifaces = (d.interfaces ?? []).map((i) => i.name.value);
    for (const i of ifaces) interfaces.get(i)?.implementers.push(d.name.value);
    const props = [];
    const rels = [];
    for (const f of d.fields ?? []) {
      const rel = dir(f.directives, "relationship");
      const t = named(f.type);
      if (rel) {
        rels.push({ field: f.name.value, type: argv(rel, "type"), direction: argv(rel, "direction"), target: t, properties: argv(rel, "properties") ?? null, list: isList(f.type), description: f.description?.value ?? "" });
      } else if (scalars.has(t) || enums.has(t)) {
        props.push({ name: f.name.value, type: t, required: f.type.kind === "NonNullType", list: isList(f.type), enum: enums.has(t) });
      }
    }
    nodes.set(d.name.value, { name: d.name.value, module: moduleOf.get(d.name.value), labels, primaryLabel: labels[0], interfaces: ifaces, props, rels });
  }
  const nodeNames = new Set(nodes.keys());
  /** Concrete node types reachable from a target type name. */
  const members = (t) => {
    if (unions.has(t)) return unions.get(t).filter((m) => nodeNames.has(m));
    if (interfaces.has(t)) return interfaces.get(t).implementers.filter((m) => nodeNames.has(m));
    return nodeNames.has(t) ? [t] : [];
  };
  const targetKind = (t) => (unions.has(t) ? "union" : interfaces.has(t) ? "interface" : "node");
  /** Relationship types with their declaring fields, edge profiles and stored triples (expanded and collapsed). */
  const relTypes = new Map();
  for (const n of nodes.values()) {
    for (const r of n.rels) {
      const rec = relTypes.get(r.type) ?? { type: r.type, fields: [], properties: new Set(), collapsed: new Set(), expanded: new Set(), modules: new Set() };
      rec.fields.push({ node: n.name, field: r.field, direction: r.direction, target: r.target, targetKind: targetKind(r.target), properties: r.properties });
      if (r.properties) rec.properties.add(r.properties);
      rec.modules.add(n.module);
      const collapsedTargets = unions.get(r.target) ?? [r.target];
      for (const x of collapsedTargets) rec.collapsed.add(r.direction === "OUT" ? `${n.name}|${x}` : `${x}|${n.name}`);
      for (const x of members(r.target)) rec.expanded.add(r.direction === "OUT" ? `${n.name}|${x}` : `${x}|${n.name}`);
      relTypes.set(r.type, rec);
    }
  }
  const allLabels = new Set();
  for (const n of nodes.values()) for (const l of n.labels) allLabels.add(l);
  return { nodes, unions, interfaces, enums, edgeProps, relTypes, members, targetKind, moduleOf, labels: [...allLabels].sort() };
}
