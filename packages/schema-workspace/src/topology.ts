/**
 * Schema topology (search/adjacency.json): the legal node-type graph of the release, never graph-instance data.
 *
 * - `arcs`: one per concrete (from, TYPE, to) triple of the IR, with the declared endpoint (an interface or union
 *   name when the declaring field targets one), class, temporal model, exclusivity, edge-property type and the
 *   declaring GraphQL fields. Stored direction is always from -> to; `IN` fields are inverse GraphQL views.
 * - `predicateJoins`: predicate-only relations (registered predicates of kind `relationship` without a typed edge):
 *   the fact lives on an Assertion, `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.
 * - `groups`: interface implementers and union members, so callers expand targets only on request.
 */
import type { SchemaIR } from "./ir.js";
import { ADJACENCY_FORMAT } from "./schema-contracts.js";

export interface AdjArc {
  type: string;
  from: string;
  to: string;
  /** Declared endpoint (the node itself, or the interface / union the declaring field names). */
  fromDeclared: string;
  toDeclared: string;
  relClass: string;
  module: string;
  temporal: string;
  exclusive: boolean;
  edgePropertyType: string | null;
  declaredOn: string[];
  /** True when an endpoint is declared as an interface (Entity / Subjectable): a kernel or registered-exception join. */
  interfaceJoin: boolean;
  interfaceRule: "kernel-traversal" | "registered-exception" | null;
  projectionGate: string | null;
}

export interface PredicateJoin {
  predicate: string;
  kind: string;
  status: string;
  registrar: string | null;
  from: string;
  to: string;
  /** The declared subject/object type (interface name when expanded from one). */
  fromDeclared: string;
  toDeclared: string;
  pattern: string;
}

export interface Adjacency {
  format: typeof ADJACENCY_FORMAT;
  releaseId: string;
  schemaReleaseDigest: string;
  note: string;
  nodes: Record<string, { module: string; interfaces: string[] }>;
  groups: Record<string, { kind: "interface" | "union"; members: string[] }>;
  arcs: AdjArc[];
  predicateJoins: PredicateJoin[];
  /** Kernel evidence spine in order (ingestion-rules kernelPlumbing): ranks equal-length paths. */
  evidenceSpine: string[];
}

export const TOPOLOGY_NOTE =
  "Schema topology of the pinned release: which node types may be connected and how. It is not graph-instance data; a legal path here is not evidence that any instance path exists in the live graph.";

export function buildAdjacency(ir: SchemaIR, release: { releaseId: string; schemaReleaseDigest: string }, evidenceSpine: string[] = []): Adjacency {
  const nodes: Adjacency["nodes"] = {};
  for (const n of [...ir.nodes].sort((a, b) => cmp(a.name, b.name))) nodes[n.name] = { module: n.module || n.fragment, interfaces: [...n.interfaces].sort() };
  const groups: Adjacency["groups"] = {};
  for (const i of [...ir.interfaces].sort((a, b) => cmp(a.name, b.name))) groups[i.name] = { kind: "interface", members: [...i.implementers].sort() };
  for (const u of [...ir.unions].sort((a, b) => cmp(a.name, b.name))) groups[u.name] = { kind: "union", members: [...u.members].sort() };
  const declared = (candidates: string[], concrete: string): string => {
    if (candidates.includes(concrete)) return concrete;
    for (const c of candidates) if (groups[c]?.members.includes(concrete)) return c;
    return concrete;
  };
  const arcs: AdjArc[] = [];
  for (const r of ir.relationshipTypes) {
    for (const t of r.triples) {
      const fromDeclared = declared(r.from ?? [], t.from);
      const toDeclared = declared(r.to ?? [], t.to);
      const ifaceSide = groups[fromDeclared]?.kind === "interface" ? "from" : groups[toDeclared]?.kind === "interface" ? "to" : null;
      const rule = ifaceSide ? (r.interfaceEndpoints ?? []).find((e) => e.side === ifaceSide)?.rule ?? "kernel-traversal" : null;
      arcs.push({
        type: r.type,
        from: t.from,
        to: t.to,
        fromDeclared,
        toDeclared,
        relClass: r.class ?? r.relClass,
        module: r.module ?? r.fragments[0] ?? "",
        temporal: r.temporal ?? "",
        exclusive: Boolean(r.exclusive),
        edgePropertyType: r.edgePropertyType ?? r.propertiesTypes[0] ?? null,
        declaredOn: unique(t.via.map((v) => `${v.node}.${v.field} (${v.direction})`)).sort(),
        interfaceJoin: ifaceSide !== null,
        interfaceRule: rule,
        projectionGate: r.projectionGate ?? null,
      });
    }
  }
  arcs.sort((a, b) => cmp(a.type, b.type) || cmp(a.from, b.from) || cmp(a.to, b.to));
  const relTypes = new Set(ir.relationshipTypes.map((r) => r.type));
  const expand = (t: string): string[] => (nodes[t] ? [t] : groups[t]?.members ?? []);
  const predicateJoins: PredicateJoin[] = [];
  for (const p of ir.predicates) {
    if (p.kind !== "relationship" || p.status !== "registered" || relTypes.has(p.name)) continue;
    for (const s of p.subjectTypes)
      for (const o of p.objectTypes)
        for (const from of expand(s))
          for (const to of expand(o))
            predicateJoins.push({
              predicate: p.name,
              kind: p.kind,
              status: p.status,
              registrar: p.registrar,
              from,
              to,
              fromDeclared: s,
              toDeclared: o,
              pattern: `(s:${from})<-[:HAS_SUBJECT]-(a:Assertion {predicate: '${p.name}'})-[:HAS_OBJECT]->(o:${to})`,
            });
  }
  predicateJoins.sort((a, b) => cmp(a.predicate, b.predicate) || cmp(a.from, b.from) || cmp(a.to, b.to));
  return { format: ADJACENCY_FORMAT, releaseId: release.releaseId, schemaReleaseDigest: release.schemaReleaseDigest, note: TOPOLOGY_NOTE, nodes, groups, arcs, predicateJoins, evidenceSpine };
}

/** One traversable step from a node type: along the stored direction (from -> to) or against it. */
export interface Step {
  kind: "typed" | "predicate-join";
  type: string;
  other: string;
  traversal: "along-direction" | "against-direction";
  arc?: AdjArc;
  join?: PredicateJoin;
}

/** Deterministic step lists per node type (sorted by type, traversal, other end). */
export function stepIndex(adj: Adjacency, options: { predicates?: boolean } = {}): Map<string, Step[]> {
  const index = new Map<string, Step[]>();
  const push = (k: string, s: Step) => {
    const l = index.get(k);
    if (l) l.push(s);
    else index.set(k, [s]);
  };
  for (const a of adj.arcs) {
    push(a.from, { kind: "typed", type: a.type, other: a.to, traversal: "along-direction", arc: a });
    if (a.from !== a.to) push(a.to, { kind: "typed", type: a.type, other: a.from, traversal: "against-direction", arc: a });
  }
  if (options.predicates !== false) {
    for (const j of adj.predicateJoins) {
      push(j.from, { kind: "predicate-join", type: j.predicate, other: j.to, traversal: "along-direction", join: j });
      if (j.from !== j.to) push(j.to, { kind: "predicate-join", type: j.predicate, other: j.from, traversal: "against-direction", join: j });
    }
  }
  for (const l of index.values()) l.sort((a, b) => cmp(a.type, b.type) || cmp(a.traversal, b.traversal) || cmp(a.other, b.other) || cmp(a.kind, b.kind));
  return index;
}

export function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function unique<T>(xs: T[]): T[] {
  return [...new Set(xs)];
}
