import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Driver } from "neo4j-driver";
import { appRoot } from "./projection.js";
import type { ConsumerSource, DdlEntry } from "./release.js";

/**
 * Readiness (SPECIFICATION 2.3 and 5.2): a successful GraphQL build or connectivity check does not attest migrated
 * data. `/readyz` is ready only when (1) the driver reaches the configured database, (2) the installed graph release
 * marker `(:KsReleaseMarker {releaseId, schemaReleaseDigest})` written by the migrator matches the pinned release or
 * an entry of `projection/compatibility.json`, and (3) every required index/constraint of the release `ddl/ddl.json`
 * (edition-applicable) plus every consumer index requirement in `projection/required-indexes.json` exists and is
 * ONLINE. Readiness never creates anything.
 */

export interface CompatibilityMatrix {
  format: "bks-consumer-compatibility.v1";
  /** `$PINNED` stands for the identity of the pinned release the image was built from. */
  accept: Array<{ releaseId: string; schemaReleaseDigest: string; reason: string }>;
  /** Also accept the parent release the pinned release's compatibility.json declares read-compatible (same schemaDigest). */
  acceptReleaseDeclaredReadCompatibility?: boolean;
  candidate: { releaseId: string; schemaReleaseDigest: string; reason: string };
}

export interface ConsumerIndexRequirement {
  id: string;
  label: string;
  properties: string[];
  /** Acceptable index types; a uniqueness/key constraint's backing RANGE index satisfies RANGE. */
  types: string[];
  operations: string[];
  reason: string;
}

export interface RequiredIndexes {
  format: "bks-consumer-index-requirements.v1";
  requirements: ConsumerIndexRequirement[];
}

export function loadCompatibilityMatrix(path = join(appRoot(), "projection", "compatibility.json")): CompatibilityMatrix {
  return JSON.parse(readFileSync(path, "utf8")) as CompatibilityMatrix;
}

export function loadRequiredIndexes(path = join(appRoot(), "projection", "required-indexes.json")): RequiredIndexes {
  return JSON.parse(readFileSync(path, "utf8")) as RequiredIndexes;
}

export interface ExpectedRelease {
  releaseId: string;
  schemaReleaseDigest: string;
  candidate: boolean;
}

/**
 * The marker identities this build accepts: the app matrix (`$PINNED` = the pinned release), plus the parent release
 * the pinned release declares read-compatible in its own compatibility.json (same schemaDigest; readers accept
 * either, writers need an exact match).
 */
export function acceptedReleases(source: ConsumerSource, matrix: CompatibilityMatrix): ExpectedRelease[] {
  if (source.mode === "candidate") return [{ releaseId: matrix.candidate.releaseId, schemaReleaseDigest: matrix.candidate.schemaReleaseDigest, candidate: true }];
  const accepted: ExpectedRelease[] = matrix.accept.map((entry) => ({
    releaseId: entry.releaseId === "$PINNED" ? source.releaseId : entry.releaseId,
    schemaReleaseDigest: entry.schemaReleaseDigest === "$PINNED" ? (source.schemaReleaseDigest ?? "") : entry.schemaReleaseDigest,
    candidate: false,
  }));
  const rc = source.releaseCompatibility;
  if (matrix.acceptReleaseDeclaredReadCompatibility && rc?.parentRelease && rc.readCompatibility?.schemaDigestEqualToParent && rc.parentRelease.schemaDigest === source.schemaDigest) {
    accepted.push({ releaseId: rc.parentRelease.releaseId, schemaReleaseDigest: rc.parentRelease.schemaReleaseDigest, candidate: false });
  }
  return accepted;
}

export interface ReadinessReport {
  ready: boolean;
  checkedAt: string;
  durationMs: number;
  checks: {
    connectivity: { ok: boolean; error?: string; server?: string };
    release: { ok: boolean; skipped?: boolean; installed?: Record<string, unknown> | null; accepted: ExpectedRelease[]; error?: string };
    indexes: { ok: boolean; edition?: string; missing: string[]; notOnline: string[]; checked: number; expectedAbsent?: string[]; error?: string };
    /** Plan-cache warm-up of every safelisted operation (set by the app; cold plans of the wide unions can exceed the DB limit). */
    warmup?: { ok: boolean; state: string; durationMs: number; operations: number; error?: string };
  };
}

export interface ReadinessOptions {
  driver: Driver;
  database: string;
  source: ConsumerSource;
  matrix: CompatibilityMatrix;
  requiredIndexes: RequiredIndexes;
  skipReleaseCheck: boolean;
  timeoutMs?: number;
}

interface IndexRow {
  name: string;
  type: string;
  state: string;
  entityType: string;
  labelsOrTypes: string[] | null;
  properties: string[] | null;
  owningConstraint: string | null;
}

async function withTimeout<T>(promise: Promise<T>, ms: number, what: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([promise, new Promise<T>((_, reject) => (timer = setTimeout(() => reject(new Error(`${what} timed out after ${ms} ms`)), ms)))]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

const CHECKED_PHASES = new Set(["pre-migration", "post-migration"]);

/** Statements blocked by preserved legacy data (release compatibility.json ddlExceptions / ddl.json status): expected absent. */
export function expectedAbsentDdl(source: ConsumerSource): Set<string> {
  const names = new Set<string>();
  for (const e of (source.releaseCompatibility?.ddlExceptions as Array<{ name: string; status?: string }> | undefined) ?? []) if (e.status === "blocked-by-legacy-data") names.add(e.name);
  for (const e of source.ddl) if (e.status === "blocked-by-legacy-data") names.add(e.name);
  return names;
}

export function ddlApplies(entry: DdlEntry, edition: string, expectedAbsent: Set<string>): boolean {
  if (expectedAbsent.has(entry.name)) return false;
  if (entry.phase !== undefined && !CHECKED_PHASES.has(String(entry.phase))) return false;
  return entry.required && (entry.edition === "community" || entry.edition === "any" || edition === "enterprise");
}

export async function checkReadiness(options: ReadinessOptions): Promise<ReadinessReport> {
  const started = Date.now();
  const timeout = options.timeoutMs ?? 3000;
  const accepted = acceptedReleases(options.source, options.matrix);
  const report: ReadinessReport = {
    ready: false,
    checkedAt: new Date().toISOString(),
    durationMs: 0,
    checks: {
      connectivity: { ok: false },
      release: { ok: false, accepted },
      indexes: { ok: false, missing: [], notOnline: [], checked: 0 },
    },
  };
  try {
    const info = await withTimeout(options.driver.getServerInfo({ database: options.database }), timeout, "connectivity");
    report.checks.connectivity = { ok: true, server: `${info.agent ?? "neo4j"} protocol ${info.protocolVersion ?? "?"}` };
  } catch (error) {
    report.checks.connectivity = { ok: false, error: (error as Error).message };
    report.durationMs = Date.now() - started;
    return report;
  }

  const session = () => options.driver.session({ database: options.database, defaultAccessMode: "READ" });

  if (options.skipReleaseCheck) {
    report.checks.release = { ok: true, skipped: true, installed: null, accepted };
  } else {
    const s = session();
    try {
      const result = await withTimeout(
        s.executeRead((tx) =>
          tx.run(
            "MATCH (m:KsReleaseMarker) RETURN m.releaseId AS releaseId, m.schemaReleaseDigest AS schemaReleaseDigest, toString(m.installedAt) AS installedAt, m.migrationRunId AS migrationRunId, m.ddlDigest AS ddlDigest ORDER BY m.installedAt DESC LIMIT 5",
          ),
        ),
        timeout,
        "release marker",
      );
      const markers = result.records.map((r) => r.toObject() as Record<string, unknown>);
      const latest = markers[0] ?? null;
      if (!latest) {
        report.checks.release = { ok: false, installed: null, accepted, error: "no :KsReleaseMarker in the database; the migrator has not attested an installed release" };
      } else {
        const match = accepted.some((a) => a.releaseId === latest.releaseId && a.schemaReleaseDigest === latest.schemaReleaseDigest);
        report.checks.release = match
          ? { ok: true, installed: latest, accepted }
          : { ok: false, installed: latest, accepted, error: "BKS_RELEASE_MISMATCH: installed graph release is not in this build's compatibility matrix" };
      }
    } catch (error) {
      report.checks.release = { ok: false, installed: null, accepted, error: (error as Error).message };
    } finally {
      await s.close();
    }
  }

  const s = session();
  try {
    const editionResult = await withTimeout(s.run("CALL dbms.components() YIELD edition RETURN edition"), timeout, "edition");
    const edition = String(editionResult.records[0]?.get("edition") ?? "community");
    const indexResult = await withTimeout(
      s.run("SHOW INDEXES YIELD name, type, state, entityType, labelsOrTypes, properties, owningConstraint RETURN name, type, state, entityType, labelsOrTypes, properties, owningConstraint"),
      timeout,
      "SHOW INDEXES",
    );
    const constraintResult = await withTimeout(s.run("SHOW CONSTRAINTS YIELD name, type, labelsOrTypes, properties RETURN name, type, labelsOrTypes, properties"), timeout, "SHOW CONSTRAINTS");
    const indexes = indexResult.records.map((r) => r.toObject() as unknown as IndexRow);
    const constraints = new Map(constraintResult.records.map((r) => [String(r.get("name")), r.toObject()] as const));
    const byName = new Map(indexes.map((i) => [i.name, i] as const));
    const missing: string[] = [];
    const notOnline: string[] = [];
    let checked = 0;
    const expectedAbsent = expectedAbsentDdl(options.source);
    for (const entry of options.source.ddl.filter((e) => ddlApplies(e, edition, expectedAbsent))) {
      checked++;
      if (/constraint/i.test(entry.kind)) {
        if (!constraints.has(entry.name)) {
          missing.push(`constraint ${entry.name}`);
          continue;
        }
        const backing = indexes.find((i) => i.owningConstraint === entry.name);
        if (backing && backing.state !== "ONLINE") notOnline.push(`constraint ${entry.name} (index ${backing.name} ${backing.state})`);
      } else {
        const index = byName.get(entry.name);
        if (!index) missing.push(`index ${entry.name}`);
        else if (index.state !== "ONLINE") notOnline.push(`index ${entry.name} (${index.state})`);
      }
    }
    for (const req of options.requiredIndexes.requirements) {
      checked++;
      const candidates = indexes.filter(
        (i) =>
          i.entityType === "NODE" &&
          (i.labelsOrTypes ?? []).length === 1 &&
          i.labelsOrTypes![0] === req.label &&
          JSON.stringify(i.properties ?? []) === JSON.stringify(req.properties) &&
          req.types.includes(i.type),
      );
      if (candidates.length === 0) missing.push(`consumer ${req.id} (${req.types.join("|")} on :${req.label}(${req.properties.join(", ")}))`);
      else if (!candidates.some((i) => i.state === "ONLINE")) notOnline.push(`consumer ${req.id} (${candidates.map((c) => `${c.name} ${c.state}`).join(", ")})`);
    }
    report.checks.indexes = { ok: missing.length === 0 && notOnline.length === 0, edition, missing, notOnline, checked, expectedAbsent: [...expectedAbsent].sort() };
  } catch (error) {
    report.checks.indexes = { ok: false, missing: [], notOnline: [], checked: 0, error: (error as Error).message };
  } finally {
    await s.close();
  }

  report.ready = report.checks.connectivity.ok && report.checks.release.ok && report.checks.indexes.ok;
  report.durationMs = Date.now() - started;
  return report;
}
