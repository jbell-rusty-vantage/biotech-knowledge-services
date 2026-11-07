// Release DDL install and verification for migration rehearsals (biotech-schema-v2.0.1+).
// The statement list is the release ddl/ddl.json (single DDL authority since v2.0.1). Phases:
//   required    ddl/required.cypher statements (community edition) + the ddl.json bootstrap (both fences)
//   enterprise  ddl/enterprise.cypher statements (Enterprise only). An existence / property-type / key constraint that the
//               PRESERVED legacy data violates is reported as `blocked-by-legacy-data` with live violation counts instead of
//               being forced: legacy data is never deleted or rewritten to satisfy a constraint.
// Verification: every statement name of the phase is present as its kind (constraint or index), every index ONLINE.
import { neo4j, rowsToPlain } from "./common.mjs";

const toNum = (x) => (neo4j.isInt(x) ? x.toNumber() : Number(x));
const q = (n) => "`" + String(n).replace(/`/g, "``") + "`";

/** True when the release annotates statements with phase pre-migration | post-migration (v2.0.2+). */
export const hasPhases = (ddlManifest) => (ddlManifest.statements ?? []).some((s) => s.phase);
const editionOk = (s, edition) => s.edition === "community" || (s.edition === "enterprise" && edition === "enterprise");
/** Statements the release marks as not installable (e.g. blocked-by-legacy-data) for a phase/edition. */
export function blockedStatements(ddlManifest, phase, edition = "community") {
  return (ddlManifest.statements ?? []).filter((s) => s.phase === `${phase}-migration` && s.status && s.status !== "active" && editionOk(s, edition));
}
export function phaseStatements(ddlManifest, phase, edition = "community") {
  const st = ddlManifest.statements ?? [];
  // v2.0.2+: phase-annotated; optional.cypher (capability-gated) and non-active statements are never installed here.
  if (phase === "pre" || phase === "post") return st.filter((s) => s.phase === `${phase}-migration` && (s.status ?? "active") === "active" && s.file && s.file !== "ddl/optional.cypher" && editionOk(s, edition));
  // ddl.json marks enterprise.cypher statements "optional" (edition-gated); the file is the phase authority.
  if (phase === "required") return st.filter((s) => s.file === "ddl/required.cypher");
  if (phase === "enterprise") return st.filter((s) => s.file === "ddl/enterprise.cypher");
  throw new Error(`unknown DDL phase ${phase}`);
}

async function presentNames(session) {
  const c = rowsToPlain((await session.run("SHOW CONSTRAINTS YIELD name RETURN name")).records).map((r) => r.name);
  const i = rowsToPlain((await session.run("SHOW INDEXES YIELD name, state, owningConstraint RETURN name, state, owningConstraint")).records);
  return { constraints: new Set(c), indexes: new Map(i.map((r) => [r.name, r])) };
}

/** Live violation count of an existence / type / key constraint (0 means it can be created without touching data). */
export async function violations(session, s) {
  if (s.kind !== "constraint" || !/EXISTENCE|PROPERTY_TYPE|KEY/.test(s.type)) return 0;
  const [lt] = s.labelsOrTypes ?? [];
  const props = s.properties ?? [];
  if (!lt || !props.length) return 0;
  const pattern = s.entity === "RELATIONSHIP" ? `()-[x:${q(lt)}]->()` : `(x:${q(lt)})`;
  let cond;
  if (/EXISTENCE|KEY/.test(s.type)) cond = props.map((p) => `x.${q(p)} IS NULL`).join(" OR ");
  else {
    const m = /IS :: ([A-Z ]+)/.exec(s.statement ?? "");
    if (!m) return 0;
    cond = props.map((p) => `(x.${q(p)} IS NOT NULL AND NOT x.${q(p)} IS :: ${m[1].trim()})`).join(" OR ");
  }
  const r = await session.run(`CYPHER 5 MATCH ${pattern} WHERE ${cond} RETURN count(x) AS c`);
  return toNum(r.records[0].get("c"));
}

/** Applies one phase. Returns per-statement outcomes: present | created | equivalent-present | blocked-by-legacy-data | failed. */
export async function applyPhase(driver, database, ddlManifest, phase, edition = "community") {
  const session = driver.session({ database, defaultAccessMode: neo4j.session.WRITE });
  const out = [];
  try {
    const present = await presentNames(session);
    for (const s of phaseStatements(ddlManifest, phase, edition)) {
      const base = { name: s.name, kind: s.kind, type: s.type, labelsOrTypes: s.labelsOrTypes ?? [], properties: s.properties ?? [] };
      if (s.kind === "constraint" ? present.constraints.has(s.name) : present.indexes.has(s.name)) {
        out.push({ ...base, outcome: "present" });
        continue;
      }
      const v = await violations(session, s);
      if (v > 0) {
        out.push({ ...base, outcome: "blocked-by-legacy-data", violations: v });
        continue;
      }
      try {
        await session.run(s.statement);
        out.push({ ...base, outcome: "created" });
      } catch (e) {
        out.push({ ...base, outcome: "failed", code: e.code ?? null, message: String(e.message).slice(0, 300) });
      }
    }
    // one recheck: a CREATE ... IF NOT EXISTS that found an equivalent rule under another name created nothing
    const after = await presentNames(session);
    for (const o of out) if (o.outcome === "created" && !(o.kind === "constraint" ? after.constraints.has(o.name) : after.indexes.has(o.name))) o.outcome = "equivalent-present";
    for (const b of phase === "pre" || phase === "post" ? blockedStatements(ddlManifest, phase, edition) : []) out.push({ name: b.name, kind: b.kind, type: b.type, labelsOrTypes: b.labelsOrTypes ?? [], outcome: "release-blocked", status: b.status, reason: b.blockedReason ?? null });
    if (phase === "required" || phase === "pre") {
      for (const b of ddlManifest.bootstrap ?? []) {
        await session.executeWrite((tx) => tx.run(b.cypher));
        out.push({ name: b.name, kind: "bootstrap", outcome: "merged" });
      }
    }
    try {
      await session.run("CALL db.awaitIndexes(600)");
    } catch {
      /* reported by verify */
    }
  } finally {
    await session.close();
  }
  return summarize(phase, out);
}

/** Verifies phases against ddl.json: names present as their kind, all ONLINE; `allowBlocked` lists names accepted as blocked. */
export async function verifyPhases(driver, database, ddlManifest, phases, allowBlocked = new Set(), edition = "community") {
  const session = driver.session({ database, defaultAccessMode: neo4j.session.READ });
  try {
    const present = await presentNames(session);
    const missing = [];
    const blocked = [];
    let expected = 0;
    for (const phase of phases)
      for (const s of phaseStatements(ddlManifest, phase, edition)) {
        expected++;
        const ok = s.kind === "constraint" ? present.constraints.has(s.name) : present.indexes.has(s.name);
        if (ok) continue;
        if (allowBlocked.has(s.name)) blocked.push(s.name);
        else missing.push(s.name);
      }
    const notOnline = [...present.indexes.values()].filter((i) => i.state !== "ONLINE").map((i) => ({ name: i.name, state: i.state }));
    const fence = rowsToPlain((await session.run("MATCH (f:KsWriteFence) RETURN count(f) AS n, collect(f.id) AS ids")).records)[0];
    const rfence = rowsToPlain((await session.run("MATCH (f:KsRevocationFence) RETURN count(f) AS n")).records)[0];
    const releaseBlocked = phases.flatMap((p) => (p === "pre" || p === "post" ? blockedStatements(ddlManifest, p, edition) : [])).map((b) => ({ name: b.name, status: b.status, installedNow: present.constraints.has(b.name) || present.indexes.has(b.name) }));
    return { ok: missing.length === 0 && notOnline.length === 0 && fence.n === 1 && rfence.n === 1 && releaseBlocked.every((b) => !b.installedNow), edition, releaseBlocked, phases, expected, presentCount: expected - missing.length - blocked.length, missing, blockedAccepted: blocked, notOnline, fence, revocationFence: rfence };
  } finally {
    await session.close();
  }
}

function summarize(phase, out) {
  const tally = {};
  for (const o of out) tally[o.outcome] = (tally[o.outcome] ?? 0) + 1;
  return { phase, tally, releaseBlocked: out.filter((o) => o.outcome === "release-blocked"), blocked: out.filter((o) => o.outcome === "blocked-by-legacy-data"), failed: out.filter((o) => o.outcome === "failed"), equivalent: out.filter((o) => o.outcome === "equivalent-present"), statements: out };
}
