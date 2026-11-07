import type { ManagedTransaction } from "neo4j-driver";
import { canonicalDigest } from "@bks/contracts";
import { toJson } from "../neo4j.js";
import type { WriteSchema } from "./release-model.js";

/**
 * Frozen observations: every graph fact the compiler used, keyed by a lookup key. The compiler is pure over this map;
 * the planner probes the graph until the compiler asks for no new key (one read transaction), and apply recompiles
 * from the stored map to prove the stored statements are compiler output.
 *
 * Keys (value null = absent):
 *   fence                                   {graphRevision, revocationGeneration, releaseDigests[]}
 *   node:<uid>                              {labels, updatedAt, props{name, channelKind, canonicalUri, genre, contentHash, selectorDigest, propositionHash}}  (label routed by uid token)
 *   uid:<uid>                               [labels...] across every v2 primary label (cross-label UID conflict check)
 *   ident:<scheme>|<issuer>|<value>         {identUid, owners:[{uid, relationshipUid}]}  (open HAS_IDENTIFIER owners)
 *   name:<Label>|<name>                     [uid...] exact name matches (max 5)
 *   episodes:<TYPE>|<fromUid>               [{relationshipUid, toUid, assertionUid, asserterUid, validFrom, validTo}] open episodes
 *   rel:<relationshipUid>                   {type, fromUid, toUid, recordedTo, assertionUid, asserterUid}
 *   assertion:<uid>                         {predicate, assertionKind, status, polarity, recordedTo, subjectUid, objectUid, asserterUid, evidence[{uid, role, snapshotUid, contentHashBasis, sourceUid}]}
 *   locator:<uid>                           {selectorDigest, snapshotUid, contentHashBasis, sourceUid}
 *   claimhash:<propositionHash>             uid
 *   edge:<TYPE>|<fromUid>|<toUid>           {count, open}
 *   attempts:<sourceUid>                    [{uid, outcome, failureKind}] CaptureAttempts recorded for the source
 *   adjudication:<uid> / assessment:<uid> / report:<uid>   {status, recordedTo, ...}
 */
export class ObservationMissing extends Error {
  constructor(public readonly key: string) {
    super(`observation ${key} is not in the frozen observation set`);
  }
}

export class Observations {
  private readonly data = new Map<string, unknown>();
  readonly missing = new Set<string>();

  constructor(
    /** probe: unknown keys are recorded and return undefined; frozen: unknown keys throw. */
    readonly mode: "probe" | "frozen",
    initial?: Record<string, unknown>,
  ) {
    if (initial) for (const [k, v] of Object.entries(initial)) this.data.set(k, v);
  }

  get<T>(key: string): T | null | undefined {
    if (this.data.has(key)) return this.data.get(key) as T | null;
    if (this.mode === "frozen") throw new ObservationMissing(key);
    this.missing.add(key);
    return undefined;
  }

  set(key: string, value: unknown): void {
    this.data.set(key, value === undefined ? null : value);
  }

  get size(): number {
    return this.data.size;
  }

  toJSON(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const k of [...this.data.keys()].sort()) out[k] = this.data.get(k);
    return out;
  }

  digest(): string {
    return canonicalDigest(this.toJSON());
  }
}

const q = (s: string) => `\`${s.replace(/`/g, "``")}\``;

function group(keys: string[]): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const k of keys) {
    const i = k.indexOf(":");
    const fam = i < 0 ? k : k.slice(0, i);
    out.set(fam, [...(out.get(fam) ?? []), k]);
  }
  return out;
}

const rest = (k: string) => k.slice(k.indexOf(":") + 1);

function iso(v: unknown): string | null {
  const j = toJson(v);
  return j === null || j === undefined ? null : String(j);
}

/** Fetches the given keys into `obs` inside the caller's read transaction (batched per family). */
export async function fetchObservations(tx: ManagedTransaction, schema: WriteSchema, obs: Observations, keys: string[]): Promise<void> {
  for (const [fam, list] of group(keys)) {
    switch (fam) {
      case "fence": {
        const res = await tx.run(
          `OPTIONAL MATCH (f:KsWriteFence {id: 'canonical'})
OPTIONAL MATCH (rv:KsRevocationFence {id: 'canonical'})
OPTIONAL MATCH (m:KsReleaseMarker)
RETURN f.graphRevision AS rev, rv.generation AS gen, collect(DISTINCT m.schemaReleaseDigest) AS digests, f IS NOT NULL AS hasFence`,
        );
        const r = res.records[0]!;
        obs.set("fence", { exists: Boolean(r.get("hasFence")), graphRevision: Number(toJson(r.get("rev")) ?? 0), revocationGeneration: Number(toJson(r.get("gen")) ?? 0), releaseDigests: (toJson(r.get("digests")) as string[]).sort() });
        break;
      }
      case "node": {
        const byLabel = new Map<string, string[]>();
        for (const k of list) {
          const uid = rest(k);
          const spec = schema.nodeForUid(uid);
          if (!spec) {
            obs.set(k, null);
            continue;
          }
          byLabel.set(spec.primaryLabel, [...(byLabel.get(spec.primaryLabel) ?? []), uid]);
        }
        for (const [label, uids] of byLabel) {
          const res = await tx.run(
            `UNWIND $uids AS u MATCH (n:${q(label)} {uid: u})
RETURN u AS uid, labels(n) AS labels, toString(n.updatedAt) AS updatedAt,
  {name: n.name, channelKind: n.channelKind, canonicalUri: n.canonicalUri, genre: n.genre, contentHash: n.contentHash, selectorDigest: n.selectorDigest, propositionHash: n.propositionHash, activityKind: n.activityKind, status: n.status, recordedTo: toString(n.recordedTo)} AS props`,
            { uids },
          );
          const found = new Map(res.records.map((r) => [String(r.get("uid")), r]));
          for (const uid of uids) {
            const r = found.get(uid);
            if (!r) obs.set(`node:${uid}`, null);
            else {
              const props = toJson(r.get("props")) as Record<string, unknown>;
              for (const key of Object.keys(props)) if (props[key] === null) delete props[key];
              obs.set(`node:${uid}`, { labels: (toJson(r.get("labels")) as string[]).sort(), updatedAt: iso(r.get("updatedAt")), props });
            }
          }
        }
        break;
      }
      case "uid": {
        const uids = list.map(rest);
        const labels = [...new Set([...schema.nodes.values()].map((n) => n.primaryLabel))].sort();
        const branches = labels.map((l) => `WITH u MATCH (n:${q(l)} {uid: u}) RETURN labels(n) AS l`).join(" UNION ALL ");
        const res = await tx.run(`UNWIND $uids AS u CALL { ${branches} } RETURN u AS uid, collect(l) AS ls`, { uids });
        const found = new Map(res.records.map((r) => [String(r.get("uid")), (toJson(r.get("ls")) as string[][]).map((x) => [...x].sort().join(":")).sort()]));
        for (const u of uids) obs.set(`uid:${u}`, found.get(u) ?? null);
        break;
      }
      case "ident": {
        const items = list.map((k) => {
          const [scheme, issuer, ...v] = rest(k).split("|");
          return { key: k, scheme, issuer, value: v.join("|") };
        });
        const res = await tx.run(
          `UNWIND $items AS it
MATCH (i:Identifier {scheme: it.scheme, issuer: it.issuer, value: it.value})
OPTIONAL MATCH (s)-[r:HAS_IDENTIFIER]->(i) WHERE r.recordedTo IS NULL
RETURN it.key AS key, i.uid AS identUid, [x IN collect({uid: s.uid, relationshipUid: r.relationshipUid}) WHERE x.uid IS NOT NULL] AS owners`,
          { items },
        );
        const found = new Map(res.records.map((r) => [String(r.get("key")), { identUid: String(r.get("identUid")), owners: (toJson(r.get("owners")) as Array<{ uid: string; relationshipUid: string }>).sort((a, b) => (a.uid < b.uid ? -1 : 1)) }]));
        for (const it of items) obs.set(it.key, found.get(it.key) ?? null);
        break;
      }
      case "name": {
        for (const k of list) {
          const [label, ...nameParts] = rest(k).split("|");
          const res = await tx.run(`MATCH (n:${q(label!)}) WHERE n.name = $name RETURN n.uid AS uid ORDER BY uid LIMIT 5`, { name: nameParts.join("|") });
          const uids = res.records.map((r) => String(r.get("uid")));
          obs.set(k, uids.length ? uids : null);
        }
        break;
      }
      case "episodes": {
        for (const k of list) {
          const [type, from] = rest(k).split("|") as [string, string];
          const spec = schema.nodeForUid(from);
          const res = await tx.run(
            `MATCH (a${spec ? `:${q(spec.primaryLabel)}` : ""} {uid: $from})-[r:${q(type)}]->(b) WHERE r.recordedTo IS NULL
OPTIONAL MATCH (x:Assertion {uid: r.assertionUid})-[:ASSERTED_BY]->(w)
RETURN r.relationshipUid AS relationshipUid, b.uid AS toUid, r.assertionUid AS assertionUid, w.uid AS asserterUid, toString(r.validFrom) AS validFrom, toString(r.validTo) AS validTo
ORDER BY relationshipUid`,
            { from },
          );
          obs.set(k, res.records.map((r) => toJson(r.toObject())));
        }
        break;
      }
      case "rel": {
        for (const k of list) {
          const relUid = rest(k);
          const m = /^hu:rel:([a-z0-9-]+?)-[0-9a-f]{16}$/.exec(relUid);
          const type = m ? m[1]!.toUpperCase().replace(/-/g, "_") : null;
          const res = type && schema.rels.has(type)
            ? await tx.run(
                `MATCH (a)-[r:${q(type)} {relationshipUid: $u}]->(b)
OPTIONAL MATCH (x:Assertion {uid: r.assertionUid})-[:ASSERTED_BY]->(w)
RETURN type(r) AS type, a.uid AS fromUid, b.uid AS toUid, toString(r.recordedTo) AS recordedTo, r.assertionUid AS assertionUid, w.uid AS asserterUid LIMIT 1`,
                { u: relUid },
              )
            : null;
          obs.set(k, res && res.records.length ? toJson(res.records[0]!.toObject()) : null);
        }
        break;
      }
      case "assertion": {
        const uids = list.map(rest);
        const res = await tx.run(
          `UNWIND $uids AS u MATCH (a:Assertion {uid: u})
OPTIONAL MATCH (a)-[:HAS_SUBJECT]->(s)
OPTIONAL MATCH (a)-[:HAS_OBJECT]->(o)
OPTIONAL MATCH (a)-[:ASSERTED_BY]->(w)
CALL { WITH a OPTIONAL MATCH (a)-[e:HAS_EVIDENCE]->(l:SourceLocator) OPTIONAL MATCH (snap:SourceSnapshot)-[:HAS_LOCATOR]->(l) OPTIONAL MATCH (src:Source)-[:HAS_SNAPSHOT]->(snap)
  RETURN [x IN collect({uid: l.uid, role: e.role, snapshotUid: snap.uid, contentHashBasis: snap.contentHashBasis, sourceUid: src.uid}) WHERE x.uid IS NOT NULL] AS evidence }
RETURN u AS uid, a.predicate AS predicate, a.assertionKind AS assertionKind, a.status AS status, a.polarity AS polarity, toString(a.recordedTo) AS recordedTo, s.uid AS subjectUid, o.uid AS objectUid, w.uid AS asserterUid, evidence`,
          { uids },
        );
        const found = new Map(res.records.map((r) => {
          const row = toJson(r.toObject()) as Record<string, unknown>;
          row.evidence = (row.evidence as Array<{ uid: string }>).sort((a, b) => (a.uid < b.uid ? -1 : 1));
          delete row.uid;
          return [String(r.get("uid")), row];
        }));
        for (const u of uids) obs.set(`assertion:${u}`, found.get(u) ?? null);
        break;
      }
      case "locator": {
        const uids = list.map(rest);
        const res = await tx.run(
          `UNWIND $uids AS u MATCH (l:SourceLocator {uid: u})
OPTIONAL MATCH (snap:SourceSnapshot)-[:HAS_LOCATOR]->(l) OPTIONAL MATCH (src:Source)-[:HAS_SNAPSHOT]->(snap)
RETURN u AS uid, l.selectorDigest AS selectorDigest, snap.uid AS snapshotUid, snap.contentHashBasis AS contentHashBasis, src.uid AS sourceUid`,
          { uids },
        );
        const found = new Map(res.records.map((r) => {
          const row = toJson(r.toObject()) as Record<string, unknown>;
          delete row.uid;
          return [String(r.get("uid")), row];
        }));
        for (const u of uids) obs.set(`locator:${u}`, found.get(u) ?? null);
        break;
      }
      case "claimhash": {
        const hashes = list.map(rest);
        const res = await tx.run("UNWIND $hashes AS h MATCH (c:Claim {propositionHash: h}) RETURN h, min(c.uid) AS uid", { hashes });
        const found = new Map(res.records.map((r) => [String(r.get("h")), String(r.get("uid"))]));
        for (const h of hashes) obs.set(`claimhash:${h}`, found.get(h) ?? null);
        break;
      }
      case "edge": {
        for (const k of list) {
          const [type, from, to] = rest(k).split("|") as [string, string, string];
          const fs = schema.nodeForUid(from);
          const ts = schema.nodeForUid(to);
          const res = await tx.run(
            `MATCH (a${fs ? `:${q(fs.primaryLabel)}` : ""} {uid: $from})-[r:${q(type)}]->(b${ts ? `:${q(ts.primaryLabel)}` : ""} {uid: $to}) RETURN count(r) AS c, sum(CASE WHEN r.recordedTo IS NULL THEN 1 ELSE 0 END) AS open`,
            { from, to },
          );
          const c = Number(toJson(res.records[0]!.get("c")) ?? 0);
          obs.set(k, c ? { count: c, open: Number(toJson(res.records[0]!.get("open")) ?? 0) } : null);
        }
        break;
      }
      case "attempts": {
        for (const k of list) {
          const res = await tx.run("MATCH (c:CaptureAttempt {subjectUid: $u}) RETURN c.uid AS uid, c.outcome AS outcome, c.failureKind AS failureKind ORDER BY uid", { u: rest(k) });
          const rows = res.records.map((r) => toJson(r.toObject()));
          obs.set(k, rows.length ? rows : null);
        }
        break;
      }
      case "adjudication":
      case "assessment":
      case "report": {
        const label = fam === "adjudication" ? "Adjudication" : fam === "assessment" ? "Assessment" : "Report";
        const uids = list.map(rest);
        const res = await tx.run(
          `UNWIND $uids AS u MATCH (n:${label} {uid: u}) OPTIONAL MATCH (n)-[:ASSESSES]->(t)
RETURN u AS uid, n.status AS status, toString(n.recordedTo) AS recordedTo, n.adjudicationKind AS adjudicationKind, n.policyOutcome AS policyOutcome, n.mechanicalStatus AS mechanicalStatus, n.assessmentKind AS assessmentKind, collect(t.uid) AS about`,
          { uids },
        );
        const found = new Map(res.records.map((r) => {
          const row = toJson(r.toObject()) as Record<string, unknown>;
          delete row.uid;
          for (const key of Object.keys(row)) if (row[key] === null) delete row[key];
          row.about = ((row.about as string[]) ?? []).sort();
          return [String(r.get("uid")), row];
        }));
        for (const u of uids) obs.set(`${fam}:${u}`, found.get(u) ?? null);
        break;
      }
      default:
        throw new Error(`unknown observation family ${fam}`);
    }
  }
}
