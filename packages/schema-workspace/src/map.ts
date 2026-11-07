/**
 * Schema map: one deterministic, human-readable Markdown document rendered from the schema IR that shows,
 * per domain and per node type, the stored properties and every edge as (from)-[:TYPE]->(to), with the
 * figures that drive executable-schema growth (from→to pairs per relationship type, union fan-out).
 *
 * It is a reading surface for schema design work, not part of the agent workspace: it carries no timestamp,
 * only the schema digest, so two renders of the same pinned SDL are byte-identical.
 */
import type { NodeType, Property, RelationshipField, RelationshipTypeSummary, SchemaIR, UnionType } from "./ir.js";
import type { DomainSidecar, Sidecars } from "./sidecars.js";

export const MAP_RENDERER_VERSION = "0.1.0";

export interface MapOptions {
  /** Restrict the per-node sections to these domain slugs (growth tables always cover the whole schema). */
  domains?: string[];
  /** Rows in the relationship growth table (default 40; 0 = all). */
  topRelationships?: number;
  /** Include the property tables (default true). */
  properties?: boolean;
  /** Include incoming edges declared on other node types (default true). */
  incoming?: boolean;
}

interface EdgeRow {
  pattern: string;
  relClass: string;
  propertiesType: string;
  cardinality: string;
  field: string;
  targetNote: string;
}

export function renderSchemaMap(ir: SchemaIR, sidecars: Sidecars, options: MapOptions = {}): string {
  const opts = { topRelationships: 40, properties: true, incoming: true, ...options };
  const nodeByName = new Map(ir.nodes.map((n) => [n.name, n]));
  const unionByName = new Map(ir.unions.map((u) => [u.name, u]));
  const interfaceByName = new Map(ir.interfaces.map((i) => [i.name, i]));
  // Domains: the sidecar domains that cover at least one fragment of this IR, then one synthetic domain per fragment
  // the sidecar does not cover (so a candidate SDL with its own fragment ids renders without a sidecar rewrite).
  const domains: DomainSidecar[] = sidecars.domains.filter((d) => ir.fragments.some((f) => d.fragments.includes(f.id)));
  for (const f of ir.fragments) {
    if (domains.some((d) => d.fragments.includes(f.id))) continue;
    domains.push({ slug: f.id, title: f.title === f.id ? `Fragment ${f.id}` : f.title, fragments: [f.id], purpose: f.purpose, entryTypes: [], questions: f.competencyQuestions ? [f.competencyQuestions] : [] });
  }
  const domainOf = (fragment: string): DomainSidecar | undefined => domains.find((d) => d.fragments.includes(fragment));
  const domainOfNode = (name: string): string => {
    const n = nodeByName.get(name);
    return n ? (domainOf(n.fragment)?.slug ?? n.fragment) : "?";
  };
  const selectedDomains = domains.filter((d) => !opts.domains?.length || opts.domains.includes(d.slug));

  // Incoming edges: every relationship field anywhere whose concrete targets include the node.
  const incoming = new Map<string, Array<{ from: string; field: RelationshipField }>>();
  for (const n of ir.nodes) {
    for (const f of n.relationships) {
      for (const member of f.targetMembers) {
        if (member === n.name) continue;
        if (!incoming.has(member)) incoming.set(member, []);
        incoming.get(member)!.push({ from: n.name, field: f });
      }
    }
  }

  const out: string[] = [];
  out.push(`# Schema map`);
  out.push("");
  out.push(`Rendered from the pinned SDL (digest \`${ir.schemaDigest}\`) by the schema map renderer ${MAP_RENDERER_VERSION}. Deterministic: no timestamps; regenerate with \`pnpm schema:map\`.`);
  out.push("");
  out.push("How to read an edge row: `(From)-[:TYPE]->(To)` is the stored direction. A target written as `(Name ∪N)` is a GraphQL union with N concrete members; `(Name ◇N)` is an interface with N implementers; the members are listed in the union/interface appendix. The executable schema expands every union or interface target into one input/filter family per concrete member, so the \"pairs\" figure, not the field count, is what the generated API grows with.");
  out.push("");

  // ---------------------------------------------------------------------------------------- totals
  const triples = ir.relationshipTypes.reduce((a, r) => a + r.triples.length, 0);
  const relFields = ir.nodes.reduce((a, n) => a + n.relationships.length, 0);
  out.push("## Totals");
  out.push("");
  out.push("| measure | count |");
  out.push("| --- | ---: |");
  out.push(`| node types | ${ir.nodes.length} |`);
  out.push(`| interfaces | ${ir.interfaces.length} |`);
  out.push(`| relationship fields declared on node types | ${relFields} |`);
  out.push(`| distinct relationship types | ${ir.relationshipTypes.length} |`);
  out.push(`| from→to pairs after union/interface expansion | ${triples} |`);
  out.push(`| edge property profiles | ${ir.edgePropertyTypes.length} |`);
  out.push(`| unions | ${ir.unions.length} |`);
  out.push(`| enums | ${ir.enums.length} |`);
  out.push(`| domains | ${domains.length} |`);
  out.push("");

  // ---------------------------------------------------------------------------------------- growth
  out.push("## Executable growth: relationship types by from→to pairs");
  out.push("");
  out.push("Each pair is one concrete (from, to) combination the library generates nested create/connect/disconnect/delete/update inputs and filters for. Sorted descending; `union` names the widest union or interface among the declaring fields.");
  out.push("");
  const growth = [...ir.relationshipTypes]
    .map((r) => ({ r, pairs: r.triples.length, widest: widestTarget(r, ir, nodeByName) }))
    .sort((a, b) => b.pairs - a.pairs || a.r.type.localeCompare(b.r.type));
  const limit = opts.topRelationships > 0 ? Math.min(opts.topRelationships, growth.length) : growth.length;
  out.push("| # | relationship type | class | pairs | cumulative share | declaring fields | widest target | fragments |");
  out.push("| ---: | --- | --- | ---: | ---: | ---: | --- | --- |");
  let cumulative = 0;
  growth.slice(0, limit).forEach((g, i) => {
    cumulative += g.pairs;
    const declaring = new Set(g.r.triples.flatMap((t) => t.via.map((v) => `${v.node}.${v.field}`))).size;
    out.push(`| ${i + 1} | ${g.r.type} | ${g.r.relClass} | ${g.pairs} | ${pct(cumulative, triples)} | ${declaring} | ${g.widest} | ${g.r.fragments.join(" ")} |`);
  });
  if (limit < growth.length) out.push(`| | … ${growth.length - limit} more types | | ${triples - cumulative} | 100% | | | |`);
  out.push("");

  out.push("## Executable growth: unions and interfaces used as relationship targets");
  out.push("");
  out.push("| target | kind | members | relationship fields targeting it | pairs contributed |");
  out.push("| --- | --- | ---: | ---: | ---: |");
  const targetRows: Array<{ name: string; kind: string; members: number; fields: number; pairs: number }> = [];
  for (const u of ir.unions) {
    const fields = ir.nodes.flatMap((n) => n.relationships.filter((f) => f.targetType === u.name));
    if (!fields.length) continue;
    targetRows.push({ name: u.name, kind: "union", members: u.members.length, fields: fields.length, pairs: fields.reduce((a, f) => a + f.targetMembers.length, 0) });
  }
  for (const i of ir.interfaces) {
    const fields = ir.nodes.flatMap((n) => n.relationships.filter((f) => f.targetType === i.name));
    if (!fields.length) continue;
    targetRows.push({ name: i.name, kind: "interface", members: i.implementers.length, fields: fields.length, pairs: fields.reduce((a, f) => a + f.targetMembers.length, 0) });
  }
  targetRows.sort((a, b) => b.pairs - a.pairs || a.name.localeCompare(b.name));
  for (const t of targetRows) out.push(`| ${t.name} | ${t.kind} | ${t.members} | ${t.fields} | ${t.pairs} |`);
  out.push("");

  // ---------------------------------------------------------------------------------------- hubs
  out.push("## Hubs: node types by declared relationship fields");
  out.push("");
  out.push("| node type | domain | relationship fields | incoming (from other types) | properties |");
  out.push("| --- | --- | ---: | ---: | ---: |");
  [...ir.nodes]
    .sort((a, b) => b.relationships.length - a.relationships.length || a.name.localeCompare(b.name))
    .slice(0, 30)
    .forEach((n) => out.push(`| ${n.name} | ${domainOfNode(n.name)} | ${n.relationships.length} | ${incoming.get(n.name)?.length ?? 0} | ${n.properties.length} |`));
  out.push("");

  // ---------------------------------------------------------------------------------------- domain seams
  out.push("## Domain seams");
  out.push("");
  out.push("Count of declared relationship fields on node types of the row domain whose concrete targets include a node type of the column domain (a union field counts once per target domain). The diagonal is the domain's internal edges.");
  out.push("");
  const slugs = domains.map((d) => d.slug);
  const seam = new Map<string, Map<string, number>>();
  for (const d of domains) seam.set(d.slug, new Map(slugs.map((s) => [s, 0])));
  for (const n of ir.nodes) {
    const from = domainOfNode(n.name);
    for (const f of n.relationships) {
      const targets = new Set(f.targetMembers.map(domainOfNode));
      for (const t of targets) {
        const row = seam.get(from);
        if (row && row.has(t)) row.set(t, (row.get(t) ?? 0) + 1);
      }
    }
  }
  const short = (s: string) => domains.findIndex((d) => d.slug === s) + 1;
  out.push(`| from \\ to | ${slugs.map((s) => `D${short(s)}`).join(" | ")} |`);
  out.push(`| --- | ${slugs.map(() => "---:").join(" | ")} |`);
  for (const d of domains) out.push(`| D${short(d.slug)} ${d.slug} | ${slugs.map((s) => seam.get(d.slug)!.get(s) || "·").join(" | ")} |`);
  out.push("");

  // ---------------------------------------------------------------------------------------- per domain
  for (const d of selectedDomains) {
    const nodes = ir.nodes.filter((n) => d.fragments.includes(n.fragment)).sort((a, b) => a.name.localeCompare(b.name));
    out.push(`## Domain D${short(d.slug)}: ${d.title}`);
    out.push("");
    out.push(`Slug \`${d.slug}\` · fragments ${d.fragments.join(", ")} · ${nodes.length} node types.`);
    out.push("");
    if (d.purpose) out.push(oneLine(d.purpose));
    if (d.questions.length) {
      out.push("");
      out.push("Questions the sidecar assigns to this domain:");
      out.push("");
      for (const q of d.questions) out.push(`- ${q}`);
    }
    out.push("");
    out.push("### Node-edge-node overview");
    out.push("");
    out.push("Every edge declared by a node type of this domain, one line each (OUT direction only; IN fields are listed on the node card as incoming declarations).");
    out.push("");
    out.push("```");
    for (const n of nodes) {
      for (const f of n.relationships) {
        if (f.direction !== "OUT") continue;
        out.push(`(${n.name})-[:${f.relationshipType}${f.propertiesType ? ` {${f.propertiesType}}` : ""}]->(${targetLabel(f, unionByName, interfaceByName)})  ${f.relClass}${f.cardinality ? ` · ${f.cardinality}` : ""}`);
      }
    }
    out.push("```");
    out.push("");

    for (const n of nodes) {
      out.push(`### ${n.name}`);
      out.push("");
      out.push(`Fragment ${n.fragment} · uid \`hu:${n.uidToken ?? "?"}:\` · labels \`${n.labels.join(":")}\`${n.interfaces.length ? ` · implements ${n.interfaces.join(", ")}` : ""} · mutations ${mutationFlags(n)}.`);
      out.push("");
      if (n.summary) out.push(n.summary);
      out.push("");
      if (opts.properties) {
        out.push("| property | type | group | notes |");
        out.push("| --- | --- | --- | --- |");
        for (const p of n.properties) out.push(`| ${p.name}${p.storedName && p.storedName !== p.name ? ` (stored \`${p.storedName}\`)` : ""} | \`${p.type}\` | ${p.group} | ${propertyNotes(p)} |`);
        out.push("");
      }
      const rows = n.relationships.map((f) => edgeRow(n, f, unionByName, interfaceByName));
      if (rows.length) {
        out.push("| edge | class | edge properties | cardinality | field |");
        out.push("| --- | --- | --- | --- | --- |");
        for (const r of rows) out.push(`| \`${r.pattern}\` | ${r.relClass} | ${r.propertiesType} | ${r.cardinality} | ${r.field}${r.targetNote} |`);
        out.push("");
      } else {
        out.push("No relationship fields.");
        out.push("");
      }
      if (opts.incoming) {
        const inc = (incoming.get(n.name) ?? []).slice().sort((a, b) => a.field.relationshipType.localeCompare(b.field.relationshipType) || a.from.localeCompare(b.from));
        if (inc.length) {
          out.push(`Incoming from other node types (${inc.length}):`);
          out.push("");
          const grouped = new Map<string, string[]>();
          for (const { from, field } of inc) {
            const key = `${field.direction === "OUT" ? `(${from})-[:${field.relationshipType}]->(${n.name})` : `(${n.name})-[:${field.relationshipType}]->(${from})`}`;
            const via = `${from}.${field.fieldName}${field.targetKind !== "node" ? ` via ${field.targetType}` : ""}`;
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key)!.push(via);
          }
          for (const [key, vias] of [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b))) out.push(`- \`${key}\` ← ${vias.join("; ")}`);
          out.push("");
        }
      }
    }
  }

  // ---------------------------------------------------------------------------------------- appendices
  out.push("## Appendix A: edge property profiles");
  out.push("");
  for (const ep of [...ir.edgePropertyTypes].sort((a, b) => a.name.localeCompare(b.name))) {
    out.push(`### ${ep.name}`);
    out.push("");
    if (ep.summary) out.push(ep.summary);
    out.push("");
    out.push(`Used by ${ep.usedBy.length} field(s): ${ep.usedBy.map((u) => `${u.node}.${u.field}`).sort().join(", ") || "none"}.`);
    out.push("");
    out.push("| property | type | notes |");
    out.push("| --- | --- | --- |");
    for (const p of ep.properties) out.push(`| ${p.name} | \`${p.type}\` | ${propertyNotes(p)} |`);
    out.push("");
  }

  out.push("## Appendix B: unions and interfaces used as targets");
  out.push("");
  for (const u of [...ir.unions].sort((a, b) => b.members.length - a.members.length || a.name.localeCompare(b.name))) {
    out.push(`### ${u.name} (union, ${u.members.length} members)`);
    out.push("");
    out.push(`Fields: ${u.usedBy.map((x) => `${x.node}.${x.field}`).sort().join(", ") || "none"}.`);
    out.push("");
    out.push(u.members.join(", "));
    out.push("");
  }
  for (const i of [...ir.interfaces].filter((x) => x.implementers.length).sort((a, b) => b.implementers.length - a.implementers.length || a.name.localeCompare(b.name))) {
    out.push(`### ${i.name} (interface, ${i.implementers.length} implementers)`);
    out.push("");
    out.push(i.implementers.join(", "));
    out.push("");
  }

  out.push("## Appendix C: enums");
  out.push("");
  out.push("| enum | values | used by fields |");
  out.push("| --- | ---: | ---: |");
  for (const e of [...ir.enums].sort((a, b) => a.name.localeCompare(b.name))) out.push(`| ${e.name} | ${e.values.length} | ${e.usedBy.length} |`);
  out.push("");

  return `${out.join("\n")}\n`;
}

function edgeRow(n: NodeType, f: RelationshipField, unions: Map<string, UnionType>, interfaces: Map<string, { implementers: string[] }>): EdgeRow {
  const target = targetLabel(f, unions, interfaces);
  const pattern = f.direction === "OUT" ? `(${n.name})-[:${f.relationshipType}]->(${target})` : `(${target})-[:${f.relationshipType}]->(${n.name})`;
  return {
    pattern,
    relClass: f.relClass + (f.readOnly ? " · read-only" : ""),
    propertiesType: f.propertiesType ?? "",
    cardinality: f.cardinality || (f.isList ? "list" : "one"),
    field: `${f.fieldName} (${f.direction})`,
    targetNote: f.targetKind === "node" ? "" : ` · ${f.targetMembers.length} concrete targets`,
  };
}

function targetLabel(f: RelationshipField, unions: Map<string, UnionType>, interfaces: Map<string, { implementers: string[] }>): string {
  if (f.targetKind === "union") return `${f.targetType} ∪${unions.get(f.targetType)?.members.length ?? f.targetMembers.length}`;
  if (f.targetKind === "interface") return `${f.targetType} ◇${interfaces.get(f.targetType)?.implementers.length ?? f.targetMembers.length}`;
  return f.targetType;
}

function widestTarget(r: RelationshipTypeSummary, ir: SchemaIR, nodeByName: Map<string, NodeType>): string {
  let best = { name: "", size: 0 };
  for (const t of r.triples) {
    for (const v of t.via) {
      const field = nodeByName.get(v.node)?.relationships.find((f) => f.fieldName === v.field);
      if (field && field.targetKind !== "node" && field.targetMembers.length > best.size) best = { name: field.targetType, size: field.targetMembers.length };
    }
  }
  // Interface fields on the IR nodes are the only path; a field declared on an interface shows as its implementers.
  void ir;
  return best.name ? `${best.name} (${best.size})` : "—";
}

function mutationFlags(n: NodeType): string {
  const m = n.allowedMutations;
  const on = [m.create ? "create" : "", m.update ? "update" : "", m.delete ? "delete" : ""].filter(Boolean);
  return on.length ? on.join("/") : "none";
}

function propertyNotes(p: Property): string {
  const notes: string[] = [];
  if (p.isRequired) notes.push("required");
  if (p.isId) notes.push("@id");
  if (p.kind === "enum") notes.push(`enum ${p.namedType}`);
  if (p.timestamp) notes.push(`timestamp ${p.timestamp.join("/")}`);
  if (p.readOnly) notes.push("read-only");
  else if (!p.settable.onUpdate) notes.push("create-only");
  return notes.join(", ");
}

function oneLine(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function pct(part: number, whole: number): string {
  return whole ? `${Math.round((part / whole) * 1000) / 10}%` : "0%";
}

