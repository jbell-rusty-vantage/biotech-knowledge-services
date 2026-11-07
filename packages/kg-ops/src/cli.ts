#!/usr/bin/env node
import "./load-env.js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { WorkspaceError } from "@bks/schema-workspace";
import { BksServiceError, rawBytesDigest } from "@bks/contracts";
import { ApplyError } from "./apply.js";
import { cypherGuardFromEnv, introspectDatabase, runCypher } from "./cypher.js";
import { GraphClient } from "./neo4j.js";
import { EXECUTOR_VERSION } from "./plan.js";
import { ensureOperationalState, installReleaseMarker } from "./fence.js";
import { MemoryGrantAuthority } from "./witness.js";
import { KnowledgeWriter } from "./write/service.js";
import { migrateIntentV1 } from "./write/migrate-v1.js";
import type { PrincipalCtx } from "./write/context.js";
import { executeReadIntent } from "./read.js";
import { ReadModel, ReadService } from "./read/index.js";
import { FileSnapshotCustody } from "./custody.js";
import { SchemaModel, SchemaError } from "./schema-access.js";
import { consumeOnceFromEnv } from "./admission/consumer-config.js";

const HELP = `bks — knowledge-graph operations (deterministic executor + guarded Cypher baseline)

  kg read <read-intent.json> [--out file]                 run a read: biotech-knowledge-read-intent.v2 / biotech-cypher-read-intent.v1
                                                          (read result v2) or a legacy v1 intent (snapshot)
  kg resolve "<name>" [--type Product] [--id SCHEME:VALUE]  shortcut: one node.resolve operation
  kg plan <intent.v2.json> [--out plan.json]               compile a biotech-knowledge-intent.v2 (stores the plan; writes nothing to the graph)
  kg admit <planRef> --effect-key K [--include p1,p2]      development admission witness (BKS_WITNESS_SIGNING_KEY; local authority)
  kg apply <apply-request.json> [--out receipt.json]       apply a biotech-knowledge-apply.v2 request (planRef + digest + witness; no statements)
  kg receipt <effectKey>                                   recorded receipt for an effect key in the caller's scope
  kg verify <effectKey> [--cursor N] [--page-size N]       paginated readback of every declared effect
  kg migrate-v1 <intent.v1.json> [--out intent.v2.json]    FU-03 mechanical migration of a v1 intent (edits recorded)
  kg bootstrap-dev                                         BKS_LOCAL_DEV=1 only: operational constraints, fence and release marker
  kg schema-check                                          compare database labels/relationship types with the pinned schema
  kg ensure-operations [--phase pre|post|all] [--enterprise|--community]
                                                          apply the pinned release DDL from ddl.json: required statements, + edition
                                                          enterprise on Enterprise (auto-detected); --phase pre (migrator, before
                                                          migration), post (after migration), all (default; empty graphs); statements
                                                          with status blocked-by-legacy-data are skipped and reported; pre/all also
                                                          run the ddl.json bootstrap (both fences)
  cypher read "<cypher>" [--params '{...}'] [--row-cap N]  read-only ad hoc Cypher (baseline tool)
  cypher write "<cypher>" [--params '{...}'] [--allow-deletes]
                                                          BKS_ENABLE_BASELINE_TOOLS=1 evaluation profile only: ad hoc write Cypher
  cypher explain "<cypher>"                                EXPLAIN plan
  cypher introspect                                        database labels, relationship types, counts, indexes
  ping                                                     connectivity + schema digest
  admission consume --once [--tenant UUID] [--limit N]     Knowledge Services dispatch outbox consumer (SV-11): claim_dispatches ->
                                                          exact graph effect + KsIntentMarker in one Neo4j transaction ->
                                                          acknowledge_dispatch; env BKS_BIOTECH_DB_VERIFICATION_DSN, BKS_VERIFICATION_TENANTS

Env: BKS_BIOTECH_GRAPH_URI BKS_BIOTECH_GRAPH_USERNAME BKS_BIOTECH_GRAPH_PASSWORD [BKS_BIOTECH_GRAPH_DATABASE] BKS_WORKSPACE_DIR BKS_RUNS_DIR BKS_AGENT_UID
     BKS_CLI_PRINCIPAL (JSON principal: principalId, installationId, applicationId, tenantId, grants) BKS_LOCAL_DEV BKS_ENABLE_BASELINE_TOOLS
Exit codes: 0 ok · 1 rejected/held/not found/usage · 2 infrastructure (database, workspace) · 3 conflict
`;

function arg(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}
function flag(args: string[], name: string): boolean {
  return args.includes(name);
}
function positional(args: string[]): string[] {
  const out: string[] = [];
  const valueFlags = new Set(["--out", "--plan", "--type", "--id", "--params", "--row-cap", "--timeout", "--purpose", "--effect-key", "--include", "--cursor", "--page-size", "--tenant", "--limit"]);
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (a.startsWith("--")) {
      if (valueFlags.has(a)) i++;
      continue;
    }
    out.push(a);
  }
  return out;
}
function readJson(path: string): unknown {
  return JSON.parse(readFileSync(resolve(path), "utf8"));
}
function writeOut(path: string | undefined, value: unknown, label: string): void {
  const text = `${JSON.stringify(value, null, 2)}\n`;
  if (path) {
    mkdirSync(dirname(resolve(path)), { recursive: true });
    writeFileSync(resolve(path), text, "utf8");
    console.error(`${label} written to ${resolve(path)}`);
  }
  process.stdout.write(text);
}
function runsDir(): string {
  return resolve(process.env.BKS_RUNS_DIR ?? "runs");
}
function autoOut(kind: string, id: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return resolve(runsDir(), `${stamp}-${kind}-${id}.json`);
}

export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  const [group, command, ...rest] = argv;
  if (!group || group === "--help" || group === "-h") {
    process.stdout.write(HELP);
    return 0;
  }
  const holder: { client: GraphClient | null } = { client: null };
  try {
    const schema = () => SchemaModel.fromWorkspace();
    const connect = () => {
      holder.client ??= GraphClient.fromEnv();
      return holder.client;
    };
    const principal: PrincipalCtx = process.env.BKS_CLI_PRINCIPAL
      ? (JSON.parse(process.env.BKS_CLI_PRINCIPAL) as PrincipalCtx)
      : { principalId: "bks-cli", installationId: "local", applicationId: "bks-cli", tenantId: "local", grants: [] };
    let writerHolder: KnowledgeWriter | null = null;
    const writer = () => (writerHolder ??= new KnowledgeWriter(connect(), { authority: process.env.BKS_LOCAL_DEV === "1" ? new MemoryGrantAuthority() : null }));

    if (group === "ping") {
      const info = await connect().verify();
      const s = schema();
      console.log(JSON.stringify({ ok: true, neo4j: info, database: connect().config.database, schemaDigest: s.schemaDigest, workspaceFingerprint: s.workspaceFingerprint, executorVersion: EXECUTOR_VERSION }, null, 2));
      return 0;
    }

    if (group === "kg") {
      switch (command) {
        case "read": {
          const file = positional(rest)[0];
          if (!file) throw new UsageError("kg read needs <read-intent.json>");
          const body = readJson(file) as { schemaVersion?: string };
          if (body.schemaVersion === "biotech-knowledge-read-intent.v2" || body.schemaVersion === "biotech-cypher-read-intent.v1") {
            // Native reads (S4): the executor connection as session-routed bindings (public "default", internal "internal"
            // with the read.internal grant); arbitrary Cypher needs a database-role binding, which the CLI does not declare.
            const client = connect();
            const svc = new ReadService({
              model: ReadModel.fromRelease(),
              bindings: [
                { ref: "default", scope: "public", client, readAuthority: "session-routing", visibility: "application" },
                { ref: "internal", scope: "internal", client, readAuthority: "session-routing", visibility: "application" },
              ],
              snapshots: new FileSnapshotCustody(),
              issuer: "bks-read-service",
              workspaceFingerprint: null,
            });
            const reader = { ...principal, role: "reader" as const };
            const result = body.schemaVersion === "biotech-cypher-read-intent.v1" ? await svc.cypher(body, reader) : await svc.typed(body, reader);
            writeOut(arg(rest, "--out") ?? autoOut("read-result", result.intentId), result, "read result");
            return result.status === "failed" ? 1 : 0;
          }
          const snapshot = await executeReadIntent(connect(), schema(), body as never);
          writeOut(arg(rest, "--out") ?? autoOut("snapshot", snapshot.intentId), snapshot, "snapshot");
          return snapshot.operations.some((o) => o.status === "failed") ? 1 : 0;
        }
        case "resolve": {
          const name = positional(rest)[0];
          if (!name) throw new UsageError('kg resolve needs "<name>"');
          const id = arg(rest, "--id");
          const identifiers = id ? [{ scheme: id.split(":")[0]!, value: id.slice(id.indexOf(":") + 1) }] : [];
          const snapshot = await executeReadIntent(connect(), schema(), {
            schemaVersion: "biotech-knowledge-read-intent.v1",
            intentId: `resolve-${Date.now()}`,
            operations: [{ opId: "r1", kind: "node.resolve", mentions: [{ mentionId: "m1", name, nodeType: arg(rest, "--type"), identifiers }], limitPerMention: 10 }],
          });
          writeOut(arg(rest, "--out"), snapshot.operations[0]?.rows ?? [], "resolution");
          return 0;
        }
        case "plan": {
          const file = positional(rest)[0];
          if (!file) throw new UsageError("kg plan needs <intent.json>");
          const plan = await writer().plan(readJson(file), principal);
          writeOut(arg(rest, "--out") ?? autoOut("plan", plan.binding.intentId), plan, "plan");
          return plan.outcome === "rejected" ? 1 : 0;
        }
        case "admit": {
          const planRef = positional(rest)[0];
          const effectKey = arg(rest, "--effect-key");
          if (!planRef || !effectKey) throw new UsageError("kg admit needs <planRef> --effect-key K");
          const include = arg(rest, "--include");
          const witness = await writer().admit(planRef, { effectKey, partialPolicy: include ? { include: include.split(",") } : "all" }, principal);
          writeOut(arg(rest, "--out"), witness, "witness");
          return 0;
        }
        case "migrate-v1": {
          const file = positional(rest)[0];
          if (!file) throw new UsageError("kg migrate-v1 needs <intent.v1.json>");
          const bytes = readFileSync(resolve(file));
          const result = migrateIntentV1(JSON.parse(bytes.toString("utf8")), writer().schema, { path: file, rawBytesDigest: rawBytesDigest(bytes) });
          writeOut(arg(rest, "--out"), result.intent, "intent v2");
          console.error(JSON.stringify({ edits: result.edits.length, gaps: result.gaps.length, mappedHints: result.mappedHints }));
          return 0;
        }
        case "bootstrap-dev": {
          if (process.env.BKS_LOCAL_DEV !== "1") throw new UsageError("kg bootstrap-dev requires BKS_LOCAL_DEV=1 (production fences and markers are installed by the migrator)");
          await ensureOperationalState(connect(), writer().schema);
          await installReleaseMarker(connect(), { releaseId: writer().schema.releaseId, schemaReleaseDigest: writer().schema.schemaReleaseDigest }, "bks-cli-bootstrap-dev");
          writeOut(arg(rest, "--out"), { ok: true, releaseId: writer().schema.releaseId, schemaReleaseDigest: writer().schema.schemaReleaseDigest }, "bootstrap");
          return 0;
        }
        case "apply": {
          const file = positional(rest)[0];
          if (!file) throw new UsageError("kg apply needs <apply-request.json>");
          const receipt = await writer().apply(readJson(file), principal);
          writeOut(arg(rest, "--out") ?? autoOut("receipt", receipt.intent.intentId), receipt, "receipt");
          return receipt.outcome === "applied" || receipt.outcome === "noop" || receipt.outcome === "duplicate" || receipt.outcome === "partial" ? 0 : 1;
        }
        case "receipt": {
          const id = positional(rest)[0];
          if (!id) throw new UsageError("kg receipt needs <effectKey>");
          const result = await writer().receipt(principal, id);
          writeOut(arg(rest, "--out"), result, "receipt");
          return result.found ? 0 : 1;
        }
        case "verify": {
          const file = positional(rest)[0];
          if (!file) throw new UsageError("kg verify needs <effectKey>");
          const page = await writer().verifyEffects(principal, file, Number(arg(rest, "--cursor") ?? 0), Number(arg(rest, "--page-size") ?? 100));
          writeOut(arg(rest, "--out"), page, "effect verification");
          return page.failures ? 1 : 0;
        }
        case "schema-check": {
          const s = schema();
          const db = await introspectDatabase(connect());
          const schemaLabels = new Set(s.ir.nodes.flatMap((n) => n.labels));
          const schemaRels = new Set(s.ir.relationshipTypes.map((r) => r.type));
          const labels = db.labels as string[];
          const rels = db.relationshipTypes as string[];
          const report = {
            schemaDigest: s.schemaDigest,
            labelsInDbNotInSchema: labels.filter((l) => !schemaLabels.has(l) && l !== "KsIntentMarker"),
            relationshipTypesInDbNotInSchema: rels.filter((r) => !schemaRels.has(r)),
            nodeTypesWithoutData: s.ir.nodes.filter((n) => !labels.includes(n.primaryLabel)).map((n) => n.name).length,
            labelCounts: db.labelCounts,
            indexes: (db.indexes as unknown[]).length,
          };
          writeOut(arg(rest, "--out"), report, "schema check");
          return 0;
        }
        case "ensure-operations": {
          const phase = arg(rest, "--phase") ?? "all";
          if (!["pre", "post", "all"].includes(phase)) throw new UsageError("--phase must be pre, post or all");
          const result = await ensureOperationalState(connect(), writer().schema, { phase: phase as "pre" | "post" | "all", ...(flag(rest, "--enterprise") ? { enterprise: true } : flag(rest, "--community") ? { enterprise: false } : {}) });
          writeOut(arg(rest, "--out"), { releaseId: result.releaseId, enterprise: result.enterprise, phase: result.phase, total: result.total, applied: result.applied.length, skipped: result.skipped, counts: result.counts, blocked: result.blocked, bootstrap: result.bootstrap, drift: result.drift }, "operations");
          return 0;
        }
        default:
          throw new UsageError(`unknown kg command ${command ?? ""}`);
      }
    }

    if (group === "admission") {
      if (command !== "consume" || !flag(rest, "--once")) throw new UsageError("admission consume --once [--tenant UUID] [--limit N] (continuous consumption runs in the executor)");
      const tenant = arg(rest, "--tenant");
      const limit = arg(rest, "--limit");
      const reports = await consumeOnceFromEnv(writer(), process.env, { ...(tenant ? { tenantId: tenant } : {}), ...(limit ? { limit: Number(limit) } : {}) });
      writeOut(arg(rest, "--out"), reports, "admission consume report");
      return reports.every((r) => r.results.every((x) => x.outcome !== "refused")) ? 0 : 1;
    }

    if (group === "cypher") {
      const guard = cypherGuardFromEnv();
      if (command === "introspect") {
        writeOut(arg(rest, "--out"), await introspectDatabase(connect()), "introspection");
        return 0;
      }
      const text = positional(rest)[0];
      if (!text || !["read", "write", "explain"].includes(command ?? "")) throw new UsageError('cypher read|write|explain "<cypher>"');
      if (command === "write" && process.env.BKS_ENABLE_BASELINE_TOOLS !== "1") throw new UsageError("cypher write is a baseline evaluation tool; it is available only with BKS_ENABLE_BASELINE_TOOLS=1 (canonical writes go through kg plan / kg apply)");
      const cypher = existsSync(text) && text.endsWith(".cypher") ? readFileSync(text, "utf8") : text;
      const result = await runCypher(connect(), { mode: command, cypher, params: arg(rest, "--params") ? JSON.parse(arg(rest, "--params")!) : {}, rowCap: arg(rest, "--row-cap") ? Number(arg(rest, "--row-cap")) : undefined, timeoutMs: arg(rest, "--timeout") ? Number(arg(rest, "--timeout")) : undefined, allowDeletes: flag(rest, "--allow-deletes"), purpose: arg(rest, "--purpose") }, guard);
      writeOut(arg(rest, "--out"), result, "cypher result");
      return result.ok ? 0 : 1;
    }

    throw new UsageError(`unknown command group ${group}`);
  } catch (error) {
    if (error instanceof UsageError) {
      console.error(`usage: ${error.message}\n`);
      process.stdout.write(HELP);
      return 1;
    }
    if (error instanceof ApplyError || error instanceof BksServiceError) {
      console.error(JSON.stringify({ ok: false, code: error.code, message: error.message, ...error.details }, null, 2));
      return error.code === "BKS_EFFECT_CONFLICT" || error.code === "BKS_EFFECT_PENDING" ? 3 : 1;
    }
    if (error instanceof WorkspaceError || error instanceof SchemaError) {
      console.error(JSON.stringify({ ok: false, code: error.code, message: error.message, ...error.details }, null, 2));
      return error instanceof WorkspaceError ? 2 : 1;
    }
    const message = error instanceof Error ? error.message : String(error);
    const infra = /ECONNREFUSED|ServiceUnavailable|Missing Neo4j env|authentication|Could not perform discovery/i.test(message);
    console.error(JSON.stringify({ ok: false, code: infra ? "DB_UNAVAILABLE" : "ERROR", message, stack: infra ? undefined : (error as Error).stack }, null, 2));
    return infra ? 2 : 1;
  } finally {
    await holder.client?.close();
  }
}

class UsageError extends Error {}

const invokedDirectly = Boolean(process.argv[1]) && resolve(process.argv[1]!) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().then((code) => {
    process.exitCode = code;
  });
}
