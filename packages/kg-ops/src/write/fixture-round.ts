import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import YAML from "yaml";
import { IngestionIntentV2, rawBytesDigest, type IngestionPlanV2 } from "@bks/contracts";
import { slugify } from "../uid.js";
import { migrateIntentV1 } from "./migrate-v1.js";
import { planOffline } from "./offline.js";
import type { PrincipalCtx } from "./context.js";
import type { WriteSchema } from "./release-model.js";

/**
 * FU-03 fixture round (v2): a versioned, reproducible re-keying of the 81 packet intents (+ the v1 example) into
 * biotech-knowledge-intent.v2 files under schema/program/final/fixtures-v2/. The originals are never touched.
 *
 * Every edit is mechanical and recorded with its provenance:
 *   - required node properties are filled from values the fixture itself states (its assertions.yaml node /
 *     entity record, or the record of a node it declares `sameAs`); otherwise a required kind enum with an explicit
 *     unknown member (UNSPECIFIED, UNRESOLVED, ...) takes it, recorded as schema-unknown-marker (lead decision);
 *   - locator selector bases come from the fixture's locators.yaml (textBasis, a versioned projection id in
 *     offsetBasis, or offsets stated over the captured artifact itself, which is the snapshot's hashed content);
 *   - identifier schemes DOMAIN -> WEB_DOMAIN and FDC_NUTRIENT_NUMBER -> FDC_NUTRIENT (active release schemes);
 *   - retired predicates with one registered replacement are re-keyed per reports/predicate-registry-report.json;
 *   - source declarations: a revised snapshot is declared before its revision (order only); a v1 SourceKind outside
 *     the release enum becomes WEB_PAGE for an http(s) non-PDF canonical URI.
 * The intents are then planned offline in dependency order with the effects of earlier intents seeded as
 * observations; every proposal that the planner still refuses gets an explicit `hold` naming the planner reason and a
 * gap class (EVIDENCE_GAP, DEPENDENCY, SEMANTIC). ROUND.json records the order, the edits, before/after per intent
 * and the residual gaps.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type J = Record<string, any>;

export type GapClass = "EVIDENCE_GAP" | "DEPENDENCY" | "SEMANTIC";

export interface RoundEdit {
  at: string;
  rule: string;
  from: unknown;
  to: unknown;
  provenance: string;
}

export interface RoundCounts {
  outcome: string;
  proposals: number;
  admitted: number;
  noop: number;
  held: number;
  rejected: number;
  errors: string[];
}

export interface RoundHold {
  proposalId: string;
  gapClass: GapClass;
  reason: string;
}

export interface RoundRow {
  path: string;
  out: string;
  intentId: string;
  before: RoundCounts;
  after: RoundCounts;
  edits: RoundEdit[];
  holdsAdded: RoundHold[];
  residualHolds: RoundHold[];
  subjectsBlocked: Array<{ ref: string; nodeType: string; reason: string }>;
}

export interface RoundResult {
  format: "bks-fixture-round.v1";
  round: string;
  releaseId: string;
  schemaReleaseDigest: string;
  generatedBy: string;
  order: string[];
  totals: { before: Record<string, number>; after: Record<string, number>; edits: Record<string, number>; residualHolds: Record<GapClass, number> };
  rows: RoundRow[];
}

function loadRetired(repo: string): Map<string, { replacedBy: string[]; fixtureEdit: string }> {
  const out = new Map<string, { replacedBy: string[]; fixtureEdit: string }>();
  const p = resolve(repo, "schema", "pinned", "release", "reports", "predicate-registry-report.json");
  if (!existsSync(p)) return out;
  const r = JSON.parse(readFileSync(p, "utf8")) as J;
  for (const e of (r.proposedNewCandidates?.rejected ?? []) as J[]) out.set(String(e.predicate), { replacedBy: (e.replacedBy ?? []).map(String), fixtureEdit: String(e.fixtureEdit ?? "") });
  return out;
}

const SCHEME_REKEY: Record<string, string> = { DOMAIN: "WEB_DOMAIN", FDC_NUTRIENT_NUMBER: "FDC_NUTRIENT" };

/** Offsets stated over the captured artifact itself (the snapshot's hashed content): raw-capture/v1 is supported. */
const CAPTURE_ITSELF = [
  /^code_?point$/i,
  /^snapshot$/i,
  /^unicode code points of the captured text$/i,
  /captured file decoded as utf-8 \(the capture artifact itself\)/i,
  /utf-8-decoded raw bytes/i,
  /^raw-utf8/i,
  /^unicode code points of the utf-8 firecrawl markdown capture$/i,
  /^unicode-code-points, end-exclusive$/i,
  /^0-based unicode code-point offsets into the utf-8-decoded snapshot/i,
];
/** Explicit "not stated" members a release enum may carry (OD-24 / OD-25); OTHER and NOT_APPLICABLE are never used. */
const UNKNOWN_MEMBERS = ["UNSPECIFIED", "UNRESOLVED", "UNKNOWN", "NOT_REPORTED", "NOT_STATED"] as const;
const VERSIONED_PROJECTION =/^[a-z][a-z0-9-]*(\/v\d+|@[0-9][A-Za-z0-9.]*)$/;

export function gapClass(reason: string): GapClass {
  if (/SUBJECT_MISSING|SUBJECT_UNKNOWN|DEPENDS_ON_(HELD|REJECTED|UNKNOWN)|UNKNOWN_REF/.test(reason)) return "DEPENDENCY";
  if (/REQUIRED_PROPERTY_MISSING|selector\.basis|QUALIFIER_REQUIRED|needs derivation|REQUIRED_EDGE_PROPERTY_MISSING|BKS_EVIDENCE_UNVERIFIED|EVIDENCE_REQUIRED|NO_SUPPORTING_EVIDENCE/.test(reason)) return "EVIDENCE_GAP";
  return "SEMANTIC";
}

function counts(plan: IngestionPlanV2): RoundCounts {
  const c = (d: string) => plan.proposals.filter((p) => p.disposition === d).length;
  return { outcome: plan.outcome, proposals: plan.proposals.length, admitted: c("admitted"), noop: c("noop_duplicate"), held: c("held"), rejected: c("rejected"), errors: plan.errors.map((e) => `${e.code}: ${e.message.slice(0, 160)}`) };
}

function walkFiles(root: string): string[] {
  const files: string[] = [];
  (function walk(d: string) {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/^intent.*\.json$/.test(f)) files.push(p);
    }
  })(root);
  // Platform-independent order: compare with Windows separators, the convention ROUND.json's pinned order was
  // generated with (a plain sort orders `/` and `\` differently against `-` and digits, so Linux CI disagreed).
  const key = (p: string) => p.replace(/\//g, "\\");
  return files.sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
}

function readYaml(path: string): J | null {
  if (!existsSync(path)) return null;
  try {
    return YAML.parse(readFileSync(path, "utf8"), { uniqueKeys: false }) as J;
  } catch {
    return null;
  }
}

interface PacketNode {
  ref?: string;
  uid?: string;
  type: string;
  name?: string;
  props: J;
  sameAs?: string;
  identifiers: J[];
}

function packetNodes(doc: J | null): PacketNode[] {
  if (!doc) return [];
  const out: PacketNode[] = [];
  for (const key of ["nodes", "entities", "externalNodes"]) {
    for (const n of (Array.isArray(doc[key]) ? doc[key] : []) as J[]) {
      if (!n || typeof n !== "object" || !n.type) continue;
      const type = String(n.type).replace(/^[A-Z0-9]+\./, "");
      const { ref, uid, name, sameAs, properties, module: _m, type: _t, identifiers: _i, note: _n, ...rest } = n;
      void _m;
      void _t;
      void _i;
      void _n;
      out.push({ ...(ref ? { ref: String(ref) } : {}), ...(uid ? { uid: String(uid) } : {}), type, ...(name ? { name: String(name) } : {}), props: { ...rest, ...(properties ?? {}) }, ...(typeof sameAs === "string" ? { sameAs } : {}), identifiers: Array.isArray(_i) ? (_i as J[]) : [] });
    }
  }
  return out;
}

export interface FixtureRoundOptions {
  repo: string;
  schema: WriteSchema;
  principal: PrincipalCtx;
  plannedAt: string;
  /** Output directory (default schema/program/final/fixtures-v2). */
  outDir?: string;
  write?: boolean;
}

interface Work {
  path: string;
  out: string;
  intent: J;
  before: RoundCounts;
  edits: RoundEdit[];
}

export function buildFixtureRound(opts: FixtureRoundOptions): RoundResult {
  const { repo, schema } = opts;
  const root = resolve(repo, "schema", "program", "final", "fixtures");
  const outDir = opts.outDir ?? resolve(repo, "schema", "program", "final", "fixtures-v2");
  const retired = loadRetired(repo);
  const files = [...walkFiles(root), resolve(repo, "examples", "ingestion-intent.example.json")];
  const rel = (p: string) => relative(repo, p).split(sep).join("/");

  // Packet records by fixture directory (and by fixture name for sameAs: "<fixture>#<ref>").
  const packets = new Map<string, { dir: string; nodes: PacketNode[]; locators: J | null }>();
  for (const f of files) {
    const dir = dirname(f);
    if (!packets.has(dir)) packets.set(dir, { dir, nodes: packetNodes(readYaml(join(dir, "assertions.yaml"))), locators: readYaml(join(dir, "locators.yaml")) });
  }
  const byFixture = new Map<string, PacketNode[]>();
  for (const [dir, p] of packets) byFixture.set(dir.split(sep).pop()!, p.nodes);

  const plan = (intent: unknown, seed?: J) => planOffline(schema, intent, { principal: opts.principal, plannedAt: opts.plannedAt, ...(seed ? { seed } : {}) }).plan;

  const work: Work[] = [];
  for (const f of files) {
    const bytes = readFileSync(f);
    const m = migrateIntentV1(JSON.parse(bytes.toString("utf8")), schema, { path: rel(f), rawBytesDigest: rawBytesDigest(bytes) });
    const before = counts(plan(IngestionIntentV2.parse(m.intent)));
    const intent = JSON.parse(JSON.stringify(m.intent)) as J;
    const edits: RoundEdit[] = [];
    const edit = (at: string, rule: string, from: unknown, to: unknown, provenance: string) => edits.push({ at, rule, from, to, provenance });
    const packet = packets.get(dirname(f))!;

    // 1. Sources: declare a revised snapshot before its revision; SourceKind outside the release enum.
    const sources = (intent.sources ?? []) as J[];
    for (let guard = 0; guard < sources.length; guard++) {
      let moved = false;
      for (let i = 0; i < sources.length; i++) {
        const revised = sources[i]!.snapshot?.revisesSnapshotRef;
        if (!revised) continue;
        const j = sources.findIndex((s) => s.ref === revised);
        if (j > i) {
          const [s] = sources.splice(j, 1);
          sources.splice(i, 0, s!);
          edit(`sources[${String(revised)}]`, "source-order", j, i, `${String(sources[i + 1]!.ref)} revises ${String(revised)}; the revised snapshot is declared first (order only)`);
          moved = true;
          break;
        }
      }
      if (!moved) break;
    }
    for (const s of sources) {
      const kind = s.source?.sourceKind;
      if (typeof kind === "string" && !schema.enumHas("SourceKind", kind)) {
        const uri = String(s.source?.canonicalUri ?? "");
        if (/^https?:[/][/]/i.test(uri) && !/[.]pdf($|[?])/i.test(uri)) {
          s.source.sourceKind = "WEB_PAGE";
          edit(`sources[${String(s.ref)}].source.sourceKind`, "source-kind", kind, "WEB_PAGE", `v1 kind ${kind} folds medium and genre; the medium of the http(s) page ${uri} is WEB_PAGE`);
        }
      }
    }

    // 2. Locator selector bases from locators.yaml.
    const locDoc = packet.locators;
    const yamlLocs = new Map<string, J>();
    for (const l of (Array.isArray(locDoc?.locators) ? locDoc!.locators : []) as J[]) if (l && (l.id || l.ref)) yamlLocs.set(String(l.id ?? l.ref), l);
    const fileOffsetBasis = typeof locDoc?.offsetBasis === "string" ? (locDoc.offsetBasis as string) : null;
    for (const s of sources) {
      for (const loc of (s.locators ?? []) as J[]) {
        const sel = loc.selector as J | undefined;
        if (!sel || (typeof sel.basis === "string" && sel.basis)) continue;
        const y = yamlLocs.get(String(loc.ref)) ?? {};
        const textBasis = typeof y.textBasis === "string" ? (y.textBasis as string) : typeof sel.textBasis === "string" ? (sel.textBasis as string) : null;
        const offsetBasis = (typeof y.offsetBasis === "string" ? (y.offsetBasis as string) : typeof sel.offsetBasis === "string" ? (sel.offsetBasis as string) : fileOffsetBasis)?.trim() ?? null;
        let basis: string | null = null;
        let why = "";
        if (textBasis && VERSIONED_PROJECTION.test(textBasis)) {
          basis = textBasis;
          why = `locators.yaml textBasis ${textBasis}`;
        } else if (offsetBasis && VERSIONED_PROJECTION.test(offsetBasis)) {
          basis = offsetBasis;
          why = `locators.yaml offsetBasis names the versioned projection ${basis}`;
        } else if (offsetBasis && CAPTURE_ITSELF.some((r) => r.test(offsetBasis))) {
          basis = "raw-capture/v1";
          why = `locators.yaml offsetBasis "${offsetBasis.slice(0, 120)}": offsets over the captured artifact itself (the snapshot's hashed content, ${String(s.snapshot?.contentHashBasis ?? "basis unstated")})`;
        }
        if (basis) {
          sel.basis = basis;
          edit(`sources[${String(s.ref)}].locators[${String(loc.ref)}].selector.basis`, "selector-basis", null, basis, why);
        }
      }
    }

    // 3. Required node properties from the fixture's own node records (or the record of the node it declares sameAs).
    for (const subj of (intent.subjects ?? []) as J[]) {
      if (subj.mode !== "new") continue;
      const spec = schema.node(String(subj.nodeType));
      if (!spec) continue;
      const props = (subj.properties ??= {}) as J;
      const missing = [...spec.properties.values()].filter((p) => p.isRequired && props[p.name] === undefined && !["id", "uid", "name", "recordedAt"].includes(p.name));
      if (!missing.length) continue;
      const candidates: Array<{ node: PacketNode; via: string }> = [];
      const own = packet.nodes.filter((n) => n.type === spec.name && ((n.ref !== undefined && n.ref === subj.ref) || (n.name !== undefined && n.name === subj.name)));
      for (const n of own) candidates.push({ node: n, via: `${rel(join(packet.dir, "assertions.yaml"))}#${n.ref ?? n.uid ?? n.name ?? ""}` });
      for (const n of own) {
        if (!n.sameAs) continue;
        const [fx, ref] = n.sameAs.split("#");
        const other = (byFixture.get(fx ?? "") ?? []).find((o) => o.ref === ref && o.type === spec.name);
        if (other) candidates.push({ node: other, via: `sameAs ${n.sameAs}` });
      }
      for (const p of missing) {
        for (const c of candidates) {
          const v = c.node.props[p.name];
          if (v === undefined || v === null) continue;
          if (schema.checkValue({ ...p, isRequired: false }, v)) continue;
          props[p.name] = v;
          edit(`subjects[${String(subj.ref)}].properties.${p.name}`, "required-property", null, v, `stated by the fixture: ${c.via}`);
          break;
        }
      }
      // Lead decision (OD-24 / OD-25): a required kind / discriminator enum that the fixture source does not state
      // takes the release's own explicit unknown member (never for numbers, dates, identifiers or relationships),
      // recorded as "not stated by the fixture source" in the intent provenance (and in notReportedFields where the
      // type has that field), never as a sourced fact.
      for (const p of missing) {
        if (props[p.name] !== undefined) continue;
        const typeName = String(p.type);
        if (typeName.includes("[") || !/(Kind|Family|Type)$/.test(p.name)) continue; // kind / discriminator fields only
        const enumName = typeName.replace(/!$/, "");
        const members = schema.enums.get(enumName);
        const marker = members ? UNKNOWN_MEMBERS.find((m) => members.has(m)) : undefined;
        if (!marker) continue;
        props[p.name] = marker;
        const at = `subjects[${String(subj.ref)}].properties.${p.name}`;
        const note = `not stated by the fixture source; ${enumName}.${marker} is the release's explicit unknown member (OD-24 / OD-25), not a sourced fact`;
        edit(at, "schema-unknown-marker", null, marker, note);
        if (spec.properties.has("notReportedFields")) {
          const list = Array.isArray(props.notReportedFields) ? (props.notReportedFields as string[]) : [];
          if (!list.includes(p.name)) props.notReportedFields = [...list, p.name].sort();
        }
        const prov = (intent.provenance ??= { edits: [] }) as J;
        (prov.edits ??= []).push({ at, rule: "schema-unknown-marker", from: null, to: marker, note });
      }
    }

    // 3b. Identifier evidence: a subject identifier the fixture states with a locator (assertions.yaml
    // `identifiers: [{scheme, value, locator | evidence}]`) cites that locator, so the planner attaches it (KN-06).
    const declaredLocators = new Set(sources.flatMap((s) => ((s.locators ?? []) as J[]).map((l) => String(l.ref))));
    for (const subj of (intent.subjects ?? []) as J[]) {
      if (subj.mode !== "new" || !Array.isArray(subj.identifiers)) continue;
      const records = packet.nodes.filter((n) => n.type === String(subj.nodeType) && ((n.ref !== undefined && n.ref === subj.ref) || (n.name !== undefined && n.name === subj.name) || (n.uid !== undefined && String(n.uid).endsWith(`:${String(subj.uidSegment ?? "")}`))));
      for (const [i, ident] of (subj.identifiers as J[]).entries()) {
        if (ident.evidence?.length) continue;
        for (const rec of records) {
          const y = rec.identifiers.find((x) => String(x.scheme) === String(ident.scheme) && String(x.value).toLowerCase() === String(ident.value).toLowerCase());
          const locs = [y?.locator, ...(Array.isArray(y?.evidence) ? y.evidence : [y?.evidence])].filter((x): x is string => typeof x === "string" && declaredLocators.has(x));
          if (!locs.length) continue;
          ident.evidence = [...new Set(locs)];
          edit(`subjects[${String(subj.ref)}].identifiers[${i}].evidence`, "identifier-evidence", null, ident.evidence, `stated by the fixture: ${rel(join(packet.dir, "assertions.yaml"))}#${rec.ref ?? rec.uid ?? rec.name ?? ""} identifiers[${String(ident.scheme)}]`);
          break;
        }
      }
    }

    // 4. Identifier schemes and retired predicates (deep walk over subjects and proposals).
    const walk = (node: unknown, at: string): void => {
      if (Array.isArray(node)) {
        node.forEach((x, i) => walk(x, `${at}[${i}]`));
        return;
      }
      if (!node || typeof node !== "object") return;
      const o = node as J;
      if (typeof o.scheme === "string" && SCHEME_REKEY[o.scheme]) {
        edit(`${at}.scheme`, "identifier-scheme", o.scheme, SCHEME_REKEY[o.scheme], "active release identifier scheme (identifier-schemes.yaml)");
        o.scheme = SCHEME_REKEY[o.scheme];
      }
      for (const key of ["predicate", "relationshipType"]) {
        const v = o[key];
        if (typeof v !== "string") continue;
        const r = retired.get(v);
        if (!r) continue;
        const single = r.replacedBy.length === 1 && schema.predicates.get(r.replacedBy[0]!)?.status === "registered" ? r.replacedBy[0]! : null;
        if (!single) continue;
        o[key] = single;
        edit(`${at}.${key}`, "retired-predicate", v, single, r.fixtureEdit);
        if (/polarity NEGATIVE/.test(r.fixtureEdit) && o.polarity !== "NEGATIVE") {
          edit(`${at}.polarity`, "retired-predicate", o.polarity ?? null, "NEGATIVE", r.fixtureEdit);
          o.polarity = "NEGATIVE";
        }
      }
      for (const [k, v] of Object.entries(o)) if (v && typeof v === "object") walk(v, `${at}.${k}`);
    };
    walk(intent.subjects, "subjects");
    walk(intent.proposals, "proposals");

    const out = f.startsWith(root) ? join(outDir, relative(root, f)) : join(outDir, "_examples", f.split(sep).pop()!);
    work.push({ path: rel(f), out, intent, before, edits });
  }

  // Dependency order: an intent that creates a uid another intent needs (a resolved subject, or a new subject that can
  // only resolve to an existing node) goes first; ties and cycles keep path order.
  const provides = new Map<string, Set<string>>();
  const needs = new Map<string, Set<string>>();
  for (const w of work) {
    const p = plan(IngestionIntentV2.parse(w.intent));
    provides.set(w.path, new Set(p.effects.nodes.filter((e) => e.op === "create").map((e) => e.uid)));
    const need = new Set<string>();
    for (const s of (w.intent.subjects ?? []) as J[]) {
      if (s.mode === "resolved") need.add(String(s.uid));
      else {
        const sp = p.subjects.find((x) => x.ref === s.ref);
        const spec = schema.node(String(s.nodeType));
        if (sp && sp.disposition !== "create" && sp.disposition !== "use_existing" && spec) need.add(`hu:${spec.uidToken}:${String(s.uidSegment ?? slugify(String(s.name)))}`);
      }
    }
    needs.set(w.path, need);
  }
  const order: Work[] = [];
  const remaining = [...work];
  while (remaining.length) {
    const pending = new Set(remaining.flatMap((w) => [...provides.get(w.path)!]));
    let idx = remaining.findIndex((w) => ![...needs.get(w.path)!].some((u) => pending.has(u) && !provides.get(w.path)!.has(u)));
    if (idx < 0) idx = 0;
    order.push(remaining.splice(idx, 1)[0]!);
  }

  // Sequential planning with seeded observations; residual refusals become explicit holds.
  const seed: J = {};
  const rows: RoundRow[] = [];
  for (const w of order) {
    const holdsAdded: RoundHold[] = [];
    // Resolved subjects that no earlier intent creates are presumed present in a second ("presumed") plan: on a real
    // graph they may exist (created elsewhere), and a proposal that is only dependency-held offline would then reach
    // its own evidence or modelling gap. Such gaps are held explicitly too, so the round is stable on either graph.
    const presumed: J = { ...seed };
    for (const s of (w.intent.subjects ?? []) as J[]) {
      if (s.mode !== "resolved" || seed[`node:${String(s.uid)}`]) continue;
      const spec = schema.nodeForUid(String(s.uid));
      if (!spec) continue;
      presumed[`node:${String(s.uid)}`] = { labels: [...spec.labels].sort(), updatedAt: opts.plannedAt, props: {} };
      presumed[`uid:${String(s.uid)}`] = [[...spec.labels].sort().join(":")];
    }
    let p = plan(IngestionIntentV2.parse(w.intent), seed);
    for (let pass = 0; pass < 8; pass++) {
      const pre = plan(IngestionIntentV2.parse(w.intent), presumed);
      const ids = new Set(p.proposals.filter((x) => x.disposition === "rejected").map((x) => x.proposalId));
      for (const x of pre.proposals) if (x.disposition === "rejected") ids.add(x.proposalId);
      if (!ids.size) break;
      for (const id of ids) {
        const r = p.proposals.find((x) => x.proposalId === id && x.disposition === "rejected") ?? pre.proposals.find((x) => x.proposalId === id)!;
        const target = (w.intent.proposals as J[]).find((x) => x.proposalId === id)!;
        const reason = r.reasons[0] ?? "rejected";
        const cls = gapClass(reason);
        target.hold = { reason: `FU-03 round v2 ${cls}: ${reason}`.slice(0, 2000) };
        holdsAdded.push({ proposalId: id, gapClass: cls, reason });
      }
      p = plan(IngestionIntentV2.parse(w.intent), seed);
    }
    // Planner holds (dependency, review-required subject, held dependency) become explicit holds too: on a real graph
    // the planner may resolve them differently (an identifier match instead of a name review, a subject created by an
    // earlier intent), and the proposal would then meet a gap the offline round never saw. An explicit hold keeps the
    // round's admitted set identical on every graph; the reason and gap class are kept.
    for (const x of p.proposals) {
      if (x.disposition !== "held" || /^HELD_BY_AUTHOR: /.test(x.reasons[0] ?? "")) continue;
      const target = (w.intent.proposals as J[]).find((y) => y.proposalId === x.proposalId)!;
      const reason = x.reasons[0] ?? "held";
      const cls = gapClass(reason);
      target.hold = { reason: `FU-03 round v2 ${cls}: ${reason}`.slice(0, 2000) };
      holdsAdded.push({ proposalId: x.proposalId, gapClass: cls, reason });
    }
    p = plan(IngestionIntentV2.parse(w.intent), seed);
    for (const e of p.effects.nodes) {
      if (e.op !== "create") continue;
      const spec = schema.nodeForUid(e.uid);
      if (!spec) continue;
      const subj = p.subjects.find((s) => s.uid === e.uid);
      const name = (w.intent.subjects as J[] | undefined)?.find((s) => s.ref === subj?.ref)?.name as string | undefined;
      seed[`node:${e.uid}`] = { labels: [...spec.labels].sort(), updatedAt: opts.plannedAt, props: name ? { name } : {} };
      seed[`uid:${e.uid}`] = [[...spec.labels].sort().join(":")];
      if (name) seed[`name:${spec.primaryLabel}|${name}`] = [...new Set([...((seed[`name:${spec.primaryLabel}|${name}`] as string[] | undefined) ?? []), e.uid])].sort();
    }
    const residualHolds: RoundHold[] = p.proposals
      .filter((x) => x.disposition === "held")
      .map((x) => {
        const first = x.reasons[0] ?? "";
        const m = /^HELD_BY_AUTHOR: FU-03 round v2 ([A-Z_]+): /.exec(first);
        return { proposalId: x.proposalId, gapClass: (m ? m[1] : gapClass(x.reasons.join(" "))) as GapClass, reason: m ? first.slice(m[0].length) : first };
      });
    rows.push({
      path: w.path,
      out: rel(w.out),
      intentId: String(w.intent.intentId),
      before: w.before,
      after: counts(p),
      edits: w.edits,
      holdsAdded,
      residualHolds,
      subjectsBlocked: p.subjects.filter((s) => s.disposition !== "create" && s.disposition !== "use_existing").map((s) => ({ ref: s.ref, nodeType: s.nodeType, reason: s.reasons[0] ?? s.disposition })),
    });
  }

  const tally = (pick: (r: RoundRow) => string) => rows.reduce((a: Record<string, number>, r) => ((a[pick(r)] = (a[pick(r)] ?? 0) + 1), a), {});
  const editTally: Record<string, number> = {};
  for (const r of rows) for (const e of r.edits) editTally[e.rule] = (editTally[e.rule] ?? 0) + 1;
  editTally["hold-added"] = rows.reduce((a, r) => a + r.holdsAdded.length, 0);
  const residual: Record<GapClass, number> = { EVIDENCE_GAP: 0, DEPENDENCY: 0, SEMANTIC: 0 };
  for (const r of rows) for (const h of r.residualHolds) residual[h.gapClass]++;
  const result: RoundResult = {
    format: "bks-fixture-round.v1",
    round: "fixtures-v2",
    releaseId: schema.releaseId,
    schemaReleaseDigest: schema.schemaReleaseDigest,
    generatedBy: "packages/kg-ops/src/write/fixture-round.ts (buildFixtureRound)",
    order: rows.map((r) => r.out),
    totals: { before: tally((r) => r.before.outcome), after: tally((r) => r.after.outcome), edits: editTally, residualHolds: residual },
    rows,
  };
  if (opts.write) {
    for (const w of order) {
      mkdirSync(dirname(w.out), { recursive: true });
      writeFileSync(w.out, `${JSON.stringify(w.intent, null, 2)}\n`);
    }
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "ROUND.json"), `${JSON.stringify(result, null, 2)}\n`);
  }
  return result;
}

/** Reads the round manifest and returns its intents in round order (for the matrix tests). */
export function loadFixtureRound(repo: string): { manifest: RoundResult; intents: Array<{ path: string; intent: unknown }> } {
  const dir = resolve(repo, "schema", "program", "final", "fixtures-v2");
  const manifest = JSON.parse(readFileSync(join(dir, "ROUND.json"), "utf8")) as RoundResult;
  return { manifest, intents: manifest.order.map((p) => ({ path: p, intent: JSON.parse(readFileSync(resolve(repo, p), "utf8")) })) };
}
