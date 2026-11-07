/**
 * `bks-schema neighbors <id>`: bounded schema adjacency around a node type (or a relationship / predicate /
 * interface / union card), from search/adjacency.json. Interface and union endpoints are collapsed into one arc
 * to the declared group unless `expand` is set. Every arc carries its stored direction, class, temporal model,
 * exclusivity and declaring fields. This is schema topology; it never asserts that instances exist.
 */
import { cmp, stepIndex, type Adjacency, type Step } from "./topology.js";

export const NEIGHBOR_LIMITS = { defaultDepth: 1, maxDepth: 5, maxNodes: 100, maxArcs: 250 } as const;

export interface NeighborOptions {
  direction?: "out" | "in" | "both";
  depth?: number;
  /** Expand interface / union endpoints into their concrete members (default false). */
  expand?: boolean;
  /** Include predicate-only joins (default true). */
  predicates?: boolean;
  maxNodes?: number;
  maxArcs?: number;
}

export interface NeighborArc {
  depth: number;
  kind: "typed" | "predicate-join";
  type: string;
  /** Stored direction is always from -> to. */
  from: string;
  to: string;
  /** Relative to the node it was reached from. */
  traversal: "along-direction" | "against-direction";
  relClass?: string;
  temporal?: string;
  exclusive?: boolean;
  edgePropertyType?: string | null;
  declaredOn?: string[];
  /** Set when the far endpoint is an interface / union collapsed to its declared name. */
  endpointGroup?: { name: string; kind: "interface" | "union"; members: number; rule?: string | null };
  pattern?: string;
}

export interface NeighborsResult {
  start: string;
  startTypes: string[];
  direction: "out" | "in" | "both";
  depth: number;
  expand: boolean;
  nodes: Array<{ name: string; kind: "node" | "interface" | "union"; depth: number; module?: string; members?: number }>;
  arcs: NeighborArc[];
  truncated: boolean;
  omitted: { nodes: number; arcs: number };
  bounds: { maxNodes: number; maxArcs: number; maxDepth: number };
  instanceClaim: false;
  note: string;
}

export class NeighborError extends Error {
  constructor(
    readonly code: "UNKNOWN_ID" | "UNSUPPORTED_KIND" | "LIMIT_EXCEEDED",
    message: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

export function neighborsOf(adj: Adjacency, id: string, options: NeighborOptions = {}): NeighborsResult {
  const direction = options.direction ?? "both";
  const depth = options.depth ?? NEIGHBOR_LIMITS.defaultDepth;
  if (depth < 1 || depth > NEIGHBOR_LIMITS.maxDepth) throw new NeighborError("LIMIT_EXCEEDED", `--depth must be 1..${NEIGHBOR_LIMITS.maxDepth}`, { depth });
  const maxNodes = Math.min(options.maxNodes ?? NEIGHBOR_LIMITS.maxNodes, NEIGHBOR_LIMITS.maxNodes);
  const maxArcs = Math.min(options.maxArcs ?? NEIGHBOR_LIMITS.maxArcs, NEIGHBOR_LIMITS.maxArcs);
  const expand = Boolean(options.expand);
  const steps = stepIndex(adj, { predicates: options.predicates !== false });
  const { startTypes, filter } = resolveStart(adj, id);

  const arcs: NeighborArc[] = [];
  const arcKeys = new Set<string>();
  const nodes = new Map<string, NeighborsResult["nodes"][number]>();
  let omittedNodes = 0;
  let omittedArcs = 0;
  for (const t of startTypes) nodes.set(t, { name: t, kind: "node", depth: 0, module: adj.nodes[t]?.module });
  let frontier = [...startTypes];
  for (let d = 1; d <= depth && frontier.length; d++) {
    const next: string[] = [];
    for (const at of frontier) {
      for (const s of steps.get(at) ?? []) {
        if (direction === "out" && s.traversal !== "along-direction") continue;
        if (direction === "in" && s.traversal !== "against-direction") continue;
        if (d === 1 && filter && !filter(s)) continue;
        const group = farGroup(adj, s);
        const collapse = group && !expand;
        const farName = collapse ? group.name : s.other;
        const key = `${s.kind}|${s.type}|${s.traversal}|${at}|${farName}`;
        if (arcKeys.has(key)) continue;
        if (arcs.length >= maxArcs) {
          omittedArcs++;
          continue;
        }
        if (!nodes.has(farName)) {
          if (nodes.size >= maxNodes) {
            omittedNodes++;
            omittedArcs++;
            continue;
          }
          nodes.set(farName, collapse ? { name: farName, kind: group.kind, depth: d, members: group.members } : { name: farName, kind: "node", depth: d, module: adj.nodes[farName]?.module });
          if (!collapse) next.push(farName);
        }
        arcKeys.add(key);
        arcs.push(toArc(d, s, at, collapse ? group : undefined));
      }
    }
    frontier = next;
  }
  arcs.sort((a, b) => a.depth - b.depth || cmp(a.type, b.type) || cmp(a.from, b.from) || cmp(a.to, b.to) || cmp(a.traversal, b.traversal));
  return {
    start: id,
    startTypes,
    direction,
    depth,
    expand,
    nodes: [...nodes.values()].sort((a, b) => a.depth - b.depth || cmp(a.name, b.name)),
    arcs,
    truncated: omittedNodes > 0 || omittedArcs > 0,
    omitted: { nodes: omittedNodes, arcs: omittedArcs },
    bounds: { maxNodes, maxArcs, maxDepth: NEIGHBOR_LIMITS.maxDepth },
    instanceClaim: false,
    note: "Schema adjacency of the pinned release (what may connect), not instances. Interface/union endpoints are collapsed unless --expand.",
  };
}

function resolveStart(adj: Adjacency, id: string): { startTypes: string[]; filter?: (s: Step) => boolean } {
  const i = id.indexOf(":");
  const kind = i < 0 ? "node" : id.slice(0, i);
  const name = i < 0 ? id : id.slice(i + 1);
  switch (kind) {
    case "node":
      if (!adj.nodes[name]) throw new NeighborError("UNKNOWN_ID", `unknown node type ${name}`, { id });
      return { startTypes: [name] };
    case "iface":
    case "union": {
      const g = adj.groups[name];
      if (!g) throw new NeighborError("UNKNOWN_ID", `unknown ${kind} ${name}`, { id });
      return { startTypes: g.members };
    }
    case "rel": {
      const ends = adj.arcs.filter((a) => a.type === name);
      if (!ends.length) throw new NeighborError("UNKNOWN_ID", `unknown relationship type ${name}`, { id });
      return { startTypes: [...new Set(ends.map((a) => a.from))].sort(), filter: (s) => s.kind === "typed" && s.type === name };
    }
    case "pred": {
      const joins = adj.predicateJoins.filter((j) => j.predicate === name);
      const typed = adj.arcs.filter((a) => a.type === name);
      if (!joins.length && !typed.length) throw new NeighborError("UNKNOWN_ID", `predicate ${name} has no typed edge or predicate join (literal, field, computation, alias or retired predicates have no topology)`, { id });
      return { startTypes: [...new Set([...joins.map((j) => j.from), ...typed.map((a) => a.from)])].sort(), filter: (s) => s.type === name };
    }
    default:
      throw new NeighborError("UNSUPPORTED_KIND", `neighbors supports node:, rel:, pred:, iface:, union: ids (got ${kind}:)`, { id });
  }
}

function farGroup(adj: Adjacency, s: Step): { name: string; kind: "interface" | "union"; members: number; rule?: string | null } | undefined {
  if (s.kind === "predicate-join") {
    const declared = s.traversal === "along-direction" ? s.join!.toDeclared : s.join!.fromDeclared;
    const g = adj.groups[declared];
    return g ? { name: declared, kind: g.kind, members: g.members.length } : undefined;
  }
  const a = s.arc!;
  const declared = s.traversal === "along-direction" ? a.toDeclared : a.fromDeclared;
  const g = adj.groups[declared];
  return g ? { name: declared, kind: g.kind, members: g.members.length, rule: a.interfaceRule } : undefined;
}

function toArc(depth: number, s: Step, at: string, group?: { name: string; kind: "interface" | "union"; members: number; rule?: string | null }): NeighborArc {
  const far = group ? group.name : s.other;
  const from = s.traversal === "along-direction" ? at : far;
  const to = s.traversal === "along-direction" ? far : at;
  if (s.kind === "predicate-join") return { depth, kind: "predicate-join", type: s.type, from, to, traversal: s.traversal, pattern: s.join!.pattern, ...(group ? { endpointGroup: group } : {}) };
  const a = s.arc!;
  return {
    depth,
    kind: "typed",
    type: a.type,
    from,
    to,
    traversal: s.traversal,
    relClass: a.relClass,
    temporal: a.temporal,
    exclusive: a.exclusive,
    edgePropertyType: a.edgePropertyType,
    declaredOn: a.declaredOn,
    ...(group ? { endpointGroup: group } : {}),
  };
}
