/**
 * `bks-schema path <from> <to>`: legal schema paths between two node types over search/adjacency.json, including
 * evidence joins (kernel interface edges such as HAS_SUBJECT -> Subjectable) and predicate-only joins through an
 * Assertion. A returned path is a schema-level possibility, never a claim that the live graph contains an instance.
 *
 * Search is breadth-first over simple paths with deterministic step order, so candidates arrive shortest first.
 * Ranking (default `rank: "direction-first"`): hops traversed against their declared direction ascending, then length,
 * then category (`typed` < `interface-join` < `predicate-join`; not applied under `joins: include`), then hops on the
 * release evidence spine (HAS_SUBJECT, HAS_OBJECT, HAS_EVIDENCE, HAS_LOCATOR, HAS_SNAPSHOT from ingestion-rules
 * kernelPlumbing) before other hops, then the path signature. Each path reports `againstDirection` and every hop its
 * `traversal`, so the order is auditable. `rank: "length-first"` ranks by length before direction (used for the
 * rendered evidence-path rule). `joins: exclude` admits typed domain edges only.
 * `via` forces intermediate types in order (e.g. Product -> LabelVersion -> ChemicalSubstance); `avoid` excludes
 * intermediate types (hubs such as Identifier or Activity). Work is bounded by `budget` expansions; exhausting it is
 * reported (`truncated: true`), never silent.
 */
import { stepIndex, type Adjacency, type Step } from "./topology.js";

export const PATH_LIMITS = { defaultMaxHops: 4, maxHops: 5, defaultLimit: 5, maxPaths: 5, budget: 300_000, candidates: 60 } as const;

export interface PathOptions {
  maxHops?: number;
  limit?: number;
  /** Include predicate-only joins (default true). */
  predicates?: boolean;
  /** `fill` (default): typed before joins at equal length; `include`: length only; `exclude`: typed domain edges only. */
  joins?: "fill" | "include" | "exclude";
  /** `direction-first` (default): fewer against-direction hops first, then length; `length-first`: length first. */
  rank?: "direction-first" | "length-first";
  /** Intermediate node types the path must pass through, in order. */
  via?: string[];
  /** Intermediate node types the path must not pass through. */
  avoid?: string[];
  budget?: number;
}

export interface PathHop {
  type: string;
  from: string;
  to: string;
  traversal: "along-direction" | "against-direction";
  kind: "typed" | "predicate-join";
  relClass?: string;
  module?: string;
  temporal?: string;
  exclusive?: boolean;
  edgePropertyType?: string | null;
  declaredOn?: string[];
  viaInterface?: string | null;
  note?: string;
}

export interface SchemaPath {
  length: number;
  /** Hops walked against their declared (stored) direction. */
  againstDirection: number;
  category: "typed" | "interface-join" | "predicate-join";
  nodes: string[];
  hops: PathHop[];
}

export interface PathsResult {
  from: string;
  to: string;
  maxHops: number;
  limit: number;
  joins: "fill" | "include" | "exclude";
  via: string[];
  avoid: string[];
  paths: SchemaPath[];
  /** Candidates found before ranking (bounded). */
  candidates: number;
  truncated: boolean;
  explored: number;
  instanceClaim: false;
  note: string;
}

export class PathError extends Error {
  constructor(
    readonly code: "UNKNOWN_TYPE" | "LIMIT_EXCEEDED",
    message: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

const CATEGORY_RANK = { typed: 0, "interface-join": 1, "predicate-join": 2 } as const;

export function findPaths(adj: Adjacency, from: string, to: string, options: PathOptions = {}): PathsResult {
  const src = stripNode(from);
  const dst = stripNode(to);
  const via = (options.via ?? []).map(stripNode);
  const avoid = new Set((options.avoid ?? []).map(stripNode));
  for (const t of [src, dst, ...via, ...avoid]) if (!adj.nodes[t]) throw new PathError("UNKNOWN_TYPE", `unknown node type ${t}`, { type: t });
  const maxHops = options.maxHops ?? PATH_LIMITS.defaultMaxHops;
  const limit = options.limit ?? PATH_LIMITS.defaultLimit;
  if (!Number.isInteger(maxHops) || maxHops < 1 || maxHops > PATH_LIMITS.maxHops) throw new PathError("LIMIT_EXCEEDED", `--max-hops must be 1..${PATH_LIMITS.maxHops}`, { maxHops });
  if (!Number.isInteger(limit) || limit < 1 || limit > PATH_LIMITS.maxPaths) throw new PathError("LIMIT_EXCEEDED", `--limit must be 1..${PATH_LIMITS.maxPaths}`, { limit });
  const joins = options.joins ?? "fill";
  const budget = options.budget ?? PATH_LIMITS.budget;
  const steps = stepIndex(adj, { predicates: options.predicates !== false && joins !== "exclude" });
  const allow = joins === "exclude" ? (s: Step) => s.kind === "typed" && !s.arc!.interfaceJoin : () => true;

  const found: Step[][] = [];
  const seen = new Set<string>();
  let explored = 0;
  let truncated = false;
  let frontier: Array<{ at: string; path: Step[]; visited: Set<string>; next: number }> = [{ at: src, path: [], visited: new Set([src]), next: 0 }];
  search: for (let depth = 0; depth < maxHops && frontier.length; depth++) {
    const nextFrontier: typeof frontier = [];
    for (const state of frontier) {
      for (const s of steps.get(state.at) ?? []) {
        if (!allow(s) || state.visited.has(s.other)) continue;
        if (s.other !== dst && avoid.has(s.other)) continue;
        explored++;
        if (explored > budget) {
          truncated = true;
          break search;
        }
        const path = [...state.path, s];
        const next = via[state.next] === s.other ? state.next + 1 : state.next;
        if (s.other === dst) {
          if (next < via.length) continue;
          const sig = signature(path);
          if (!seen.has(sig)) {
            seen.add(sig);
            found.push(path);
            if (found.length >= PATH_LIMITS.candidates) break search;
          }
          continue;
        }
        if (depth + 1 < maxHops) nextFrontier.push({ at: s.other, path, visited: new Set([...state.visited, s.other]), next });
      }
    }
    frontier = nextFrontier;
  }
  const spine = adj.evidenceSpine ?? [];
  const offSpine = (p: SchemaPath) => p.hops.filter((h) => !spine.includes(h.type)).length;
  const spineOrder = (p: SchemaPath) => p.hops.reduce((acc, h) => acc + (spine.includes(h.type) ? spine.indexOf(h.type) : spine.length), 0);
  const directionFirst = (options.rank ?? "direction-first") === "direction-first";
  const ranked = found
    .map((p) => toPath(src, p))
    .sort(
      (a, b) =>
        (directionFirst ? a.againstDirection - b.againstDirection || a.length - b.length : a.length - b.length || a.againstDirection - b.againstDirection) ||
        (joins === "include" ? 0 : CATEGORY_RANK[a.category] - CATEGORY_RANK[b.category]) ||
        offSpine(a) - offSpine(b) ||
        spineOrder(a) - spineOrder(b) ||
        cmpSig(a, b),
    );
  return {
    from: src,
    to: dst,
    maxHops,
    limit,
    joins,
    via,
    avoid: [...avoid].sort(),
    paths: ranked.slice(0, limit),
    candidates: found.length,
    truncated,
    explored,
    instanceClaim: false,
    note: "Legal schema paths of the pinned release. Not proof that any instance path exists in the live graph; read the graph through biotech-kg-query.",
  };
}

function signature(path: Step[]): string {
  return path.map((x) => `${x.kind}:${x.type}:${x.traversal}:${x.other}`).join("|");
}

function cmpSig(a: SchemaPath, b: SchemaPath): number {
  const sa = a.hops.map((h) => `${h.type}:${h.from}:${h.to}`).join("|");
  const sb = b.hops.map((h) => `${h.type}:${h.from}:${h.to}`).join("|");
  return sa < sb ? -1 : sa > sb ? 1 : 0;
}

function toPath(src: string, steps: Step[]): SchemaPath {
  let at = src;
  const nodes = [src];
  const hops: PathHop[] = steps.map((s) => {
    const from = s.traversal === "along-direction" ? at : s.other;
    const to = s.traversal === "along-direction" ? s.other : at;
    at = s.other;
    nodes.push(at);
    if (s.kind === "predicate-join") {
      const j = s.join!;
      return { type: j.predicate, from, to, traversal: s.traversal, kind: "predicate-join", note: `predicate-only: no typed edge; ${j.pattern}` };
    }
    const a = s.arc!;
    const viaInterface = a.interfaceJoin ? (a.fromDeclared !== a.from ? a.fromDeclared : a.toDeclared) : null;
    const note =
      a.relClass === "asserted"
        ? "asserted edge: authorized by one Assertion (r.assertionUid) whose HAS_EVIDENCE cites a SourceLocator"
        : a.relClass === "derived"
          ? "derived projection: read-only"
          : undefined;
    return {
      type: a.type,
      from,
      to,
      traversal: s.traversal,
      kind: "typed",
      relClass: a.relClass,
      module: a.module,
      temporal: a.temporal,
      exclusive: a.exclusive,
      edgePropertyType: a.edgePropertyType,
      declaredOn: a.declaredOn,
      viaInterface,
      ...(note ? { note } : {}),
    };
  });
  const category: SchemaPath["category"] = hops.some((h) => h.kind === "predicate-join") ? "predicate-join" : hops.some((h) => h.viaInterface) ? "interface-join" : "typed";
  return { length: hops.length, againstDirection: hops.filter((h) => h.traversal === "against-direction").length, category, nodes, hops };
}

export function stripNode(id: string): string {
  return id.startsWith("node:") ? id.slice(5) : id;
}
