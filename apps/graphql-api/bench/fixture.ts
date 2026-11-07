import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import neo4j, { type Driver } from "neo4j-driver";
import { defaultRepoRoot, CANDIDATE_SDL_DIGEST, type ConsumerSource } from "../src/release.js";

/**
 * Synthetic v2 fixture data generated from the schema IR (labels, properties, enums, relationship declarations,
 * edge-property types and cardinalities). Every node carries `syntheticFixture: true` and `fixtureSet`; every
 * relationship carries `syntheticFixture: true`. Values are deterministic for a seed. For the disposable local
 * Neo4j only; nothing here touches a production database.
 */

interface IrProperty {
  name: string;
  namedType: string;
  kind: "scalar" | "enum";
  isList: boolean;
  isRequired: boolean;
}
interface IrRelationship {
  fieldName: string;
  relationshipType: string;
  direction: "IN" | "OUT";
  targetType: string;
  targetKind: "node" | "interface" | "union";
  targetMembers: string[];
  propertiesType: string | null;
  cardinality: string;
}
interface IrNode {
  name: string;
  labels: string[];
  primaryLabel: string;
  uidToken: string | null;
  properties: IrProperty[];
  relationships: IrRelationship[];
}
export interface FixtureIr {
  schemaDigest: string;
  nodes: IrNode[];
  enums: Array<{ name: string; values: Array<{ name: string }> }>;
  edgePropertyTypes: Array<{ name: string; properties: IrProperty[] }>;
}

/** The fixture IR: the verified release IR when a release is pinned, else the candidate IR file (digest-checked). */
export function loadFixtureIr(source: ConsumerSource): FixtureIr {
  if (source.bundle) return source.bundle.ir as unknown as FixtureIr;
  const path = join(defaultRepoRoot(), "schema", "program", "final", "schema", "final_biotech_schema_v2.ir.json");
  if (!existsSync(path)) throw new Error(`fixture IR ${path} missing`);
  const ir = JSON.parse(readFileSync(path, "utf8")) as FixtureIr;
  const digest = ir.schemaDigest.startsWith("sha256:") ? ir.schemaDigest : `sha256:${ir.schemaDigest}`;
  if (digest !== source.schemaDigest && digest !== CANDIDATE_SDL_DIGEST) throw new Error(`fixture IR digest ${digest} does not match the served schema ${source.schemaDigest}`);
  return ir;
}

export interface FixtureNode {
  type: string;
  labels: string[];
  uid: string;
  props: Record<string, unknown>;
}
export interface FixtureRel {
  type: string;
  fromLabel: string;
  toLabel: string;
  from: string;
  to: string;
  props: Record<string, unknown>;
}
export interface Fixture {
  fixtureSet: string;
  nodes: FixtureNode[];
  rels: FixtureRel[];
  byType: Map<string, FixtureNode[]>;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function kebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/** Benchmark scale (declared production-like profile; see benchmarks/*.md). */
export const BENCH_COUNTS: Record<string, number> = {
  Product: 3000,
  ProductVariant: 9000,
  Package: 15000,
  LabelVersion: 40000,
  Brand: 1500,
  Organization: 4000,
  Person: 3000,
  Assertion: 60000,
  SourceLocator: 90000,
  SourceSnapshot: 25000,
  Source: 12000,
  Adjudication: 15000,
  Assessment: 6000,
  Claim: 8000,
  Report: 1500,
  ReportItem: 3000,
  Identifier: 30000,
  Activity: 2000,
  Agent: 300,
  ChemicalSubstance: 4000,
  IngredientMaterial: 4000,
  Study: 2000,
  Publication: 4000,
  Chunk: 5000,
};
export const BENCH_DEFAULT_COUNT = 300;

/** Fanout (min, max, hub share, hub size) per relationship type for "many" declarations. */
const FANOUT: Record<string, [number, number, number, number]> = {
  HAS_VARIANT: [1, 5, 0.02, 60],
  HAS_PACKAGE: [1, 3, 0.01, 20],
  HAS_LABEL_VERSION: [1, 6, 0.02, 40],
  HAS_EVIDENCE: [1, 3, 0.01, 30],
  HAS_SNAPSHOT: [1, 3, 0.01, 25],
  HAS_IDENTIFIER: [1, 1, 0.02, 8],
  ASSESSES: [1, 2, 0.01, 20],
  DERIVED_FROM: [0, 3, 0.01, 20],
};
const DEFAULT_FANOUT: [number, number, number, number] = [0, 2, 0.0, 0];

const SCHEMES = ["gtin", "doi", "pmid", "cas", "unii", "nct", "lei", "upc", "inchikey", "ror"];

export interface GenerateOptions {
  seed?: number;
  counts?: Record<string, number>;
  defaultCount?: number;
  fixtureSet?: string;
  /** uid opaque-segment prefix; distinct per fixture set so sets can coexist under the uid constraints. */
  uidPrefix?: string;
  /** Node label -> properties under a uniqueness constraint (from the release DDL); generated values are unique. */
  uniqueProperties?: Record<string, string[]>;
  /** Share of PUBLIC / INTERNAL nodes; the rest have no privacyClass (fail closed: hidden). */
  publicShare?: number;
  internalShare?: number;
}

export function generateFixture(ir: FixtureIr, options: GenerateOptions = {}): Fixture {
  const rnd = mulberry32(options.seed ?? 20261011);
  const fixtureSet = options.fixtureSet ?? "s6-bench-v1";
  const uidPrefix = options.uidPrefix ?? "syn";
  const counts = options.counts ?? BENCH_COUNTS;
  const defaultCount = options.defaultCount ?? BENCH_DEFAULT_COUNT;
  const publicShare = options.publicShare ?? 0.88;
  const internalShare = options.internalShare ?? 0.1;
  const enums = new Map(ir.enums.map((e) => [e.name, e.values.map((v) => v.name)] as const));
  const edgeTypes = new Map(ir.edgePropertyTypes.map((e) => [e.name, e.properties] as const));
  const pick = <T>(list: readonly T[]): T => list[Math.floor(rnd() * list.length)]!;
  const int = (lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1));
  const baseDate = Date.UTC(2015, 0, 1);
  const span = Date.UTC(2026, 8, 30) - baseDate;
  const dateTime = () => neo4j.types.DateTime.fromStandardDate(new Date(baseDate + Math.floor(rnd() * span)));
  const date = () => neo4j.types.Date.fromStandardDate(new Date(baseDate + Math.floor(rnd() * span)));
  const hex = () => Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(rnd() * 16)]).join("");
  let relSeq = 0;

  const scalar = (p: IrProperty, owner: string, i: number): unknown => {
    if (p.kind === "enum") return pick(enums.get(p.namedType) ?? ["UNKNOWN"]);
    switch (p.namedType) {
      case "DateTime":
        return dateTime();
      case "Date":
        return date();
      case "Int":
        return neo4j.int(int(0, 500));
      case "Float":
        return Math.round(rnd() * 10000) / 100;
      case "Boolean":
        return rnd() < 0.5;
      default: {
        if (/(Hash|Digest)$/.test(p.name)) return `sha256:${hex()}`;
        if (/(Uri|Url)$/.test(p.name)) return `https://example.org/synthetic/${kebab(owner)}/${i}`;
        if (/(Text|Verbatim|description|summary|rationale|definition|proposition)$/i.test(p.name)) return `Synthetic ${p.name} for ${owner} ${i}: lorem ipsum dolor sit amet, consectetur adipiscing elit.`;
        return `${p.name}-${i % 97}`;
      }
    }
  };
  const valueFor = (p: IrProperty, owner: string, i: number): unknown => {
    if (p.isList) return Array.from({ length: int(p.isRequired ? 1 : 0, 3) }, () => scalar(p, owner, i));
    return scalar(p, owner, i);
  };

  const nodes: FixtureNode[] = [];
  const byType = new Map<string, FixtureNode[]>();
  for (const n of ir.nodes) {
    const count = counts[n.name] ?? defaultCount;
    const token = n.uidToken ?? kebab(n.name);
    const shared = ir.nodes.filter((m) => (m.uidToken ?? kebab(m.name)) === token).length > 1;
    const typeTag = shared ? `${kebab(n.name)}-` : "";
    const list: FixtureNode[] = [];
    for (let i = 0; i < count; i++) {
      const uid = `hu:${token}:${uidPrefix}-${typeTag}${i.toString(36).padStart(5, "0")}`;
      const props: Record<string, unknown> = { syntheticFixture: true, fixtureSet };
      for (const p of n.properties) {
        if (p.name === "uid") props.uid = uid;
        else if (p.name === "id") props.id = `${uidPrefix}-${i.toString(36).padStart(5, "0")}`;
        else if (p.name === "name") props.name = `${n.name} ${i}`;
        else if (p.name === "privacyClass") {
          const r = rnd();
          if (r < publicShare) props.privacyClass = "PUBLIC";
          else if (r < publicShare + internalShare) props.privacyClass = "INTERNAL";
        } else if (n.name === "Identifier" && p.name === "scheme") props.scheme = SCHEMES[i % SCHEMES.length];
        else if (n.name === "Identifier" && p.name === "value") props.value = `${uidPrefix}-${SCHEMES[i % SCHEMES.length]}-${Math.floor(i / SCHEMES.length)}`;
        else if ((options.uniqueProperties?.[n.primaryLabel] ?? []).includes(p.name)) props[p.name] = /(Hash|Digest)$/.test(p.name) ? `sha256:${uidPrefix}-${typeTag}${i}` : `${p.name}-${uidPrefix}-${typeTag}${i}`;
        else if (p.isRequired || rnd() < 0.6) props[p.name] = valueFor(p, n.name, i);
      }
      const node = { type: n.name, labels: n.labels, uid, props };
      list.push(node);
      nodes.push(node);
    }
    byType.set(n.name, list);
  }

  const single = (c: string) => /^(exactly_one|zero_or_one|one)\b/.test(c.trim());
  const optional = (c: string) => /^zero_or_one/.test(c.trim());
  const nodeByName = new Map(ir.nodes.map((n) => [n.name, n] as const));
  const targetsOf = (r: IrRelationship) => (r.targetKind === "node" ? [r.targetType] : r.targetMembers).filter((t) => byType.has(t));
  const pool = (types: string[]) => {
    const all: FixtureNode[] = [];
    for (const t of types) all.push(...(byType.get(t) ?? []));
    return all;
  };
  const edgeProps = (propsType: string | null, i: number): Record<string, unknown> => {
    const props: Record<string, unknown> = { syntheticFixture: true };
    if (!propsType) return props;
    for (const p of edgeTypes.get(propsType) ?? []) {
      if (p.name === "relationshipUid") props.relationshipUid = `hu:relationship:${uidPrefix}-${(relSeq++).toString(36)}`;
      else if (p.name === "assertionUid") props.assertionUid = pick(byType.get("Assertion") ?? [{ uid: "hu:assertion:none" } as FixtureNode]).uid;
      else if (p.name === "orderIndex") props.orderIndex = neo4j.int(i);
      else if (p.isRequired || rnd() < 0.6) props[p.name] = valueFor(p, propsType, i);
    }
    return props;
  };

  // Each stored relationship is generated once: from the OUT declaration, unless only an IN declaration exists or the
  // IN side is the single-cardinality side (then each target node picks its one source).
  const rels: FixtureRel[] = [];
  const seen = new Set<string>();
  const declarations: Array<{ owner: IrNode; rel: IrRelationship }> = [];
  for (const owner of ir.nodes) for (const rel of owner.relationships) declarations.push({ owner, rel });
  for (const { owner, rel } of declarations) {
    const targets = targetsOf(rel);
    if (!targets.length || !byType.has(owner.name)) continue;
    const fromTypes = rel.direction === "OUT" ? [owner.name] : targets;
    const toTypes = rel.direction === "OUT" ? targets : [owner.name];
    const key = `${rel.relationshipType}|${fromTypes.join(",")}|${toTypes.join(",")}`;
    const inverse = declarations.find(
      (d) => d.rel !== rel && d.rel.relationshipType === rel.relationshipType && d.rel.direction !== rel.direction && targetsOf(d.rel).includes(owner.name) && (d.rel.direction === "OUT" ? fromTypes.includes(d.owner.name) : toTypes.includes(d.owner.name)),
    );
    if (inverse) {
      const outDecl = rel.direction === "OUT" ? rel : inverse.rel;
      const inDecl = rel.direction === "IN" ? rel : inverse.rel;
      const generateFromIn = single(inDecl.cardinality) && !single(outDecl.cardinality);
      if ((generateFromIn && rel.direction === "OUT") || (!generateFromIn && rel.direction === "IN")) continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    const owners = byType.get(owner.name)!;
    const candidates = pool(targets);
    if (!candidates.length) continue;
    const [lo, hi, hubShare, hubSize] = FANOUT[rel.relationshipType] ?? DEFAULT_FANOUT;
    owners.forEach((o) => {
      let k: number;
      if (single(rel.cardinality)) k = optional(rel.cardinality) ? (rnd() < 0.6 ? 1 : 0) : 1;
      else k = rnd() < hubShare ? hubSize : int(lo, hi);
      const chosen = new Set<string>();
      for (let j = 0; j < k; j++) {
        const t = pick(candidates);
        if (t.uid === o.uid || chosen.has(t.uid)) continue;
        chosen.add(t.uid);
        const props = edgeProps(rel.propertiesType, j);
        const from = rel.direction === "OUT" ? o : t;
        const to = rel.direction === "OUT" ? t : o;
        rels.push({ type: rel.relationshipType, fromLabel: nodeByName.get(from.type)!.primaryLabel, toLabel: nodeByName.get(to.type)!.primaryLabel, from: from.uid, to: to.uid, props });
      }
    });
  }
  return { fixtureSet, nodes, rels, byType };
}


/** Uniqueness-constrained node properties of the release DDL, by label. */
export function uniquePropertiesFromDdl(ddl: ConsumerSource["ddl"]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const e of ddl) {
    if (e.kind !== "constraint" || e.type !== "UNIQUENESS" || !e.labelsOrTypes?.length) continue;
    const label = e.labelsOrTypes[0]!;
    out[label] = [...new Set([...(out[label] ?? []), ...(e.properties ?? []).filter((p) => p !== "uid")])];
  }
  return out;
}

export interface LoadReport {
  nodes: number;
  rels: number;
  constraints: number;
  ms: number;
}

/** Disposable-DB DDL for the benchmark: uid uniqueness per label plus the consumer index requests (never production). */
export async function applyBenchmarkDdl(driver: Driver, database: string, ir: FixtureIr, extraIndexes: Array<{ name: string; label: string; properties: string[] }>): Promise<number> {
  const session = driver.session({ database });
  let n = 0;
  try {
    for (const node of ir.nodes) {
      await session.run(`CREATE CONSTRAINT ${"bench_uid_" + node.primaryLabel} IF NOT EXISTS FOR (n:\`${node.primaryLabel}\`) REQUIRE n.uid IS UNIQUE`);
      n++;
    }
    for (const idx of extraIndexes) {
      await session.run(`CREATE INDEX ${idx.name} IF NOT EXISTS FOR (n:\`${idx.label}\`) ON (${idx.properties.map((p) => `n.\`${p}\``).join(", ")})`);
      n++;
    }
    await session.run("CALL db.awaitIndexes(300)");
  } finally {
    await session.close();
  }
  return n;
}

export async function loadFixture(driver: Driver, database: string, fixture: Fixture, batch = 5000): Promise<LoadReport> {
  const started = Date.now();
  const session = driver.session({ database });
  try {
    const groups = new Map<string, FixtureNode[]>();
    for (const n of fixture.nodes) {
      const key = n.labels.join(":");
      const list = groups.get(key) ?? [];
      list.push(n);
      groups.set(key, list);
    }
    for (const [labels, list] of groups) {
      const labelText = labels
        .split(":")
        .map((l) => `\`${l}\``)
        .join(":");
      for (let i = 0; i < list.length; i += batch) {
        await session.run(`UNWIND $rows AS row CREATE (n:${labelText}) SET n = row`, { rows: list.slice(i, i + batch).map((n) => n.props) });
      }
    }
    const relGroups = new Map<string, FixtureRel[]>();
    for (const r of fixture.rels) {
      const key = `${r.type}|${r.fromLabel}|${r.toLabel}`;
      const list = relGroups.get(key) ?? [];
      list.push(r);
      relGroups.set(key, list);
    }
    for (const [key, list] of relGroups) {
      const [type, fromLabel, toLabel] = key.split("|");
      for (let i = 0; i < list.length; i += batch) {
        await session.run(`UNWIND $rows AS row MATCH (a:\`${fromLabel}\` {uid: row.from}) MATCH (b:\`${toLabel}\` {uid: row.to}) CREATE (a)-[e:\`${type}\`]->(b) SET e = row.props`, {
          rows: list.slice(i, i + batch).map((r) => ({ from: r.from, to: r.to, props: r.props })),
        });
      }
    }
  } finally {
    await session.close();
  }
  return { nodes: fixture.nodes.length, rels: fixture.rels.length, constraints: 0, ms: Date.now() - started };
}

export async function writeReleaseMarker(driver: Driver, database: string, marker: { releaseId: string; schemaReleaseDigest: string; migrationRunId: string; ddlDigest?: string }): Promise<void> {
  const session = driver.session({ database });
  try {
    await session.run(
      "MERGE (m:KsReleaseMarker {releaseId: $releaseId, schemaReleaseDigest: $schemaReleaseDigest}) SET m.installedAt = datetime(), m.migrationRunId = $migrationRunId, m.ddlDigest = $ddlDigest, m.syntheticFixture = true, m.testMarker = true",
      { ...marker, ddlDigest: marker.ddlDigest ?? "synthetic-benchmark-ddl" },
    );
  } finally {
    await session.close();
  }
}

export async function wipeSyntheticFixture(driver: Driver, database: string, fixtureSet?: string): Promise<void> {
  const session = driver.session({ database });
  try {
    await session.run(
      `MATCH (n) WHERE n.syntheticFixture = true ${fixtureSet ? "AND n.fixtureSet = $fixtureSet" : ""} CALL (n) { DETACH DELETE n } IN TRANSACTIONS OF 10000 ROWS`,
      { fixtureSet: fixtureSet ?? null },
    );
  } finally {
    await session.close();
  }
}
