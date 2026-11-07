#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build, verifyWorkspace } from "./build.js";
import { schemaContext } from "./context.js";
import { doctor } from "./doctor.js";
import { evalSearch, loadEvalTasks, type EvalMode } from "./eval.js";
import { findCards, type FindQuery } from "./find.js";
import { defaultWorkspaceDir, readPinnedSdl, readValidationParams } from "./load.js";
import { renderSchemaMap } from "./map.js";
import { NeighborError, neighborsOf } from "./neighbors.js";
import { parseSchema } from "./parse.js";
import { PathError, findPaths } from "./path.js";
import { patternLookup } from "./pattern.js";
import { RENDERER_VERSION, WorkspaceWriteError, writeWorkspace } from "./render.js";
import { loadSidecars } from "./sidecars.js";
import { buildSlice, SliceError, writeSlice } from "./slice.js";
import { validateHostedHits, type SemanticHit } from "./semantic/retriever.js";
import { openWorkspace, searchWorkspace, WorkspaceError, type SearchMode, type Workspace } from "./workspace.js";
import { ReleaseError } from "./release.js";
import { semanticCommand, SEMANTIC_HELP } from "./semantic/cli.js";
import { semanticFromEnv } from "./semantic/config.js";
import { ProviderError } from "./semantic/provider.js";

const HELP = `bks-schema ${RENDERER_VERSION} — schema workspace commands (bks-schema-workspace.v2)

  build [--out <dir>] [--generated-at <iso>]     render the pinned release into the workspace (staged, atomic)
  verify [--dir <dir>]                           hash every on-disk file vs the manifest inventory + clean rerender compare
  doctor [--json] [--no-pinned]                  integrity, versions, card digests, links, catalog, release binding, semantic status
  manifest                                       release identities, fingerprint, counts, limits
  search "<words>" [--mode lexical|semantic|hybrid|structured|structured-hybrid] [--expand paths [--base-limit N]] [--kind k] [--module D6] [--domain d] [--limit 10] [--json]
  find [--kind node] [--module D6] [--property uid] [--executor-op create|node.upsert] [--class asserted]
       [--temporal episode] [--exclusive true] [--predicate-kind relationship] [--status supported] [--label T]
       [--interface Subjectable] [--identifier-scheme GTIN] [--from T] [--to T] [--question Q] [--name N] [--limit 50] [--json]
  get <id-or-path> [--section <heading>] [--field <key>] [--max-bytes 24000] [--json]
  neighbors <id> [--direction out|in|both] [--depth 1..5] [--expand] [--no-predicates] [--json]
  path <from> <to> [--max-hops 1..5] [--limit 1..5] [--joins fill|include|exclude] [--via T1,T2] [--avoid T] [--no-predicates] [--json]
  pattern (--question <id> | --template <id>) [--json]
  slice --out <dir> [--tasks t1,t2] [--types A,B] [--rels R] [--domains d] [--modules D6] [--fragments W04]
        [--questions Q-D6-01] [--predicates P] [--depth 1] [--max-tokens 12000] [--purpose auto|read|write] [--intent "..."] [--no-sdl]
  context [--tasks t] [--cards id1,id2] [--questions Q] [--intent "..."] [--out <file>]   emit biotech-schema-context.v1
  rehydrate --hits <file.json>                   validate hosted (semantic) hits against local cards; stale/unknown are rejected
  eval --tasks <file> [--gold <file>] [--mode lexical|semantic|hybrid|structured|structured-hybrid] [--base-limit N] [--k 10] [--json]   Recall@10 / exact-ID hit rate vs gold card ids
${SEMANTIC_HELP}  ir                                             print the schema IR (large)
  map [--sdl <file>] [--out <file>] [--domains d1,d2] [--top 40] [--no-properties] [--no-incoming]

Global: --dir <workspace> (or BKS_WORKSPACE_DIR, default ./workspace) · --expect-release <sha256:...> · --expect-fingerprint <sha256:...>
Exit codes: 0 ok · 1 not found / no hits / drift / usage · 2 workspace missing, corrupt or unsupported · 3 release mismatch · 4 semantic unavailable
`;

const BOOLEAN_FLAGS = new Set(["--json", "--expand", "--no-sdl", "--no-properties", "--no-incoming", "--no-predicates", "--no-pinned"]);

function arg(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}
function flag(args: string[], name: string): boolean {
  return args.includes(name);
}
function positional(args: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (a.startsWith("--")) {
      if (!BOOLEAN_FLAGS.has(a)) i++;
      continue;
    }
    out.push(a);
  }
  return out;
}
const split = (s: string | undefined) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : []);
const num = (s: string | undefined, d: number) => (s === undefined ? d : Number(s));
const print = (v: unknown) => console.log(JSON.stringify(v, null, 2));

class UsageError extends Error {}

export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  const [command, ...rest] = argv;
  const dir = resolve(arg(rest, "--dir") ?? (command === "build" ? arg(rest, "--out") : undefined) ?? process.env.BKS_WORKSPACE_DIR ?? defaultWorkspaceDir);
  const json = flag(rest, "--json");
  const open = (): Workspace => openWorkspace(dir, { ...(arg(rest, "--expect-release") ? { expectRelease: arg(rest, "--expect-release") } : {}), ...(arg(rest, "--expect-fingerprint") ? { expectFingerprint: arg(rest, "--expect-fingerprint") } : {}) });
  try {
    switch (command) {
      case "build": {
        const result = build(arg(rest, "--generated-at"));
        const { written } = writeWorkspace(result, dir);
        print({ ok: true, dir, written, workspaceFingerprint: result.manifest.workspaceFingerprint, schemaReleaseDigest: result.manifest.release.schemaReleaseDigest, generatedAt: result.manifest.generatedAt, counts: result.manifest.counts });
        return 0;
      }
      case "verify": {
        const report = verifyWorkspace(dir);
        print(report);
        return report.ok ? 0 : 1;
      }
      case "doctor": {
        let retriever;
        try {
          retriever = semanticFromEnv(openWorkspace(dir)).retriever;
        } catch {
          retriever = undefined;
        }
        const report = await doctor(dir, { ...(arg(rest, "--expect-release") ? { expectRelease: arg(rest, "--expect-release") } : {}), pinned: !flag(rest, "--no-pinned"), ...(retriever ? { retriever } : {}) });
        if (json) print(report);
        else {
          console.log(`${report.ok ? "ok" : "FAIL"} ${report.dir} ${report.releaseId ?? ""} ${report.workspaceFingerprint ?? ""}`);
          for (const c of report.checks) console.log(`  ${c.status.padEnd(4)} ${c.id.padEnd(16)} ${c.summary}`);
        }
        const mismatch = report.checks.some((c) => c.id === "expected-release" && c.status === "fail");
        return report.ok ? 0 : mismatch ? 3 : 1;
      }
      case "manifest": {
        const { inventory, ...rest2 } = open().manifest;
        print({ ...rest2, inventory: { files: Object.keys(inventory).length, note: "full inventory in manifest.json" } });
        return 0;
      }
      case "search": {
        const ws = open();
        const query = positional(rest)[0];
        if (!query) throw new UsageError("search needs a query");
        const requested = arg(rest, "--mode") ?? "lexical";
        if (!["lexical", "semantic", "hybrid", "structured", "structured-hybrid"].includes(requested)) throw new UsageError(`--mode must be lexical, semantic, hybrid, structured or structured-hybrid`);
        // structured = lexical + --expand paths; structured-hybrid = hybrid + --expand paths (same code path as eval)
        const mode = (requested === "structured" ? "lexical" : requested === "structured-hybrid" ? "hybrid" : requested) as SearchMode;
        const expand = requested.startsWith("structured") ? "paths" : arg(rest, "--expand");
        if (expand !== undefined && expand !== "paths") throw new UsageError("--expand must be paths");
        const res = await searchWorkspace(ws, { query, mode, limit: num(arg(rest, "--limit"), 10), ...(expand ? { expand: "paths" as const, ...(arg(rest, "--base-limit") ? { baseLimit: Number(arg(rest, "--base-limit")) } : {}) } : {}), ...(mode === "lexical" ? {} : { retriever: semanticFromEnv(ws).retriever }), ...(arg(rest, "--kind") ? { kind: split(arg(rest, "--kind")) } : {}), ...(arg(rest, "--module") ? { module: split(arg(rest, "--module")) } : {}), ...(arg(rest, "--domain") ? { domain: arg(rest, "--domain")! } : {}) });
        if (json) print(res);
        else {
          if (res.degradation) console.log(`[${res.status}] ${res.degradation.reason}${res.degradation.fallback === "lexical-only" ? " — lexical-only results" : ""}`);
          for (const h of res.hits) console.log(`${(h.score < 1 ? h.score.toFixed(3) : String(Math.round(h.score))).padStart(5)}  ${h.id.padEnd(46)} ${h.path.padEnd(52)} ${h.matchedOn.padEnd(14)} ${h.summary.slice(0, 90)}`);
          if (res.calls) {
            console.log("calls:");
            for (const c of res.calls) console.log(`  ${c}`);
            console.log(res.expansion?.pathRuns.length ? "Paths are schema possibilities, not instance claims." : "No path expansion (fewer than two node types among the top 5 hits).");
          }
        }
        if (res.status === "unavailable") return 4;
        return res.hits.length ? 0 : 1;
      }
      case "find": {
        const ws = open();
        const q: FindQuery = {};
        const set = <K extends keyof FindQuery>(k: K, v: FindQuery[K] | undefined) => {
          if (v !== undefined) q[k] = v;
        };
        set("kind", arg(rest, "--kind") ? split(arg(rest, "--kind")) : undefined);
        set("module", arg(rest, "--module") ? split(arg(rest, "--module")) : undefined);
        set("domain", arg(rest, "--domain"));
        set("name", arg(rest, "--name"));
        set("property", arg(rest, "--property"));
        set("executorOp", arg(rest, "--executor-op"));
        set("proposalKind", arg(rest, "--proposal-kind"));
        set("relClass", arg(rest, "--class"));
        set("temporal", arg(rest, "--temporal"));
        set("exclusive", arg(rest, "--exclusive") === undefined ? undefined : arg(rest, "--exclusive") === "true");
        set("predicateKind", arg(rest, "--predicate-kind"));
        set("status", arg(rest, "--status"));
        set("label", arg(rest, "--label"));
        set("interface", arg(rest, "--interface"));
        set("identifierScheme", arg(rest, "--identifier-scheme"));
        set("uidToken", arg(rest, "--uid-token"));
        set("from", arg(rest, "--from"));
        set("to", arg(rest, "--to"));
        set("question", arg(rest, "--question"));
        set("capability", arg(rest, "--capability"));
        set("migrationKind", arg(rest, "--migration-kind"));
        set("limit", arg(rest, "--limit") ? Number(arg(rest, "--limit")) : undefined);
        const res = findCards(ws, q);
        if (json) print({ release: ws.manifest.release.schemaReleaseDigest, ...res });
        else {
          for (const r of res.results) console.log(`${r.id.padEnd(46)} ${r.path.padEnd(52)} ${r.summary.slice(0, 90)}`);
          if (res.truncated) console.log(`[${res.returned} of ${res.total}; raise --limit (max 500)]`);
        }
        return res.total ? 0 : 1;
      }
      case "get": {
        const ws = open();
        const id = positional(rest)[0];
        if (!id) throw new UsageError("get needs an id or path");
        const page = ws.page(id, { maxBytes: num(arg(rest, "--max-bytes"), 24_000), ...(arg(rest, "--section") ? { section: arg(rest, "--section") } : {}), ...(arg(rest, "--field") ? { field: arg(rest, "--field") } : {}) });
        if (json) print({ release: ws.manifest.release.schemaReleaseDigest, ...page });
        else {
          process.stdout.write(page.text);
          if (page.truncated) console.log(`\n\n[truncated at ${Buffer.byteLength(page.text)} of ${page.bytes} bytes; use --max-bytes or --section]`);
        }
        return 0;
      }
      case "neighbors": {
        const ws = open();
        const id = positional(rest)[0];
        if (!id) throw new UsageError("neighbors needs an id (node:<Type>, rel:<TYPE>, pred:<NAME>, iface:<I>, union:<U>)");
        const res = neighborsOf(ws.adjacency(), id, { direction: (arg(rest, "--direction") ?? "both") as "out" | "in" | "both", depth: num(arg(rest, "--depth"), 1), expand: flag(rest, "--expand"), predicates: !flag(rest, "--no-predicates") });
        if (json) print({ release: ws.manifest.release.schemaReleaseDigest, ...res });
        else {
          for (const a of res.arcs) console.log(`${String(a.depth)} ${a.kind === "typed" ? "" : "[pred] "}(${a.from})-[:${a.type}]->(${a.to}) ${a.relClass ?? ""} ${a.temporal ?? ""}${a.exclusive ? " exclusive" : ""}${a.endpointGroup ? ` [${a.endpointGroup.kind} ${a.endpointGroup.name}: ${a.endpointGroup.members} members; --expand]` : ""}`);
          if (res.truncated) console.log(`[truncated: omitted ${res.omitted.nodes} nodes, ${res.omitted.arcs} arcs]`);
          console.log(res.note);
        }
        return 0;
      }
      case "path": {
        const ws = open();
        const [from, to] = positional(rest);
        if (!from || !to) throw new UsageError("path needs <from> <to> node types");
        const joins = (arg(rest, "--joins") ?? "fill") as "fill" | "include" | "exclude";
        const res = findPaths(ws.adjacency(), from, to, { maxHops: num(arg(rest, "--max-hops"), 4), limit: num(arg(rest, "--limit"), 5), joins, predicates: !flag(rest, "--no-predicates"), via: split(arg(rest, "--via")), avoid: split(arg(rest, "--avoid")) });
        if (json) print({ release: ws.manifest.release.schemaReleaseDigest, ...res });
        else {
          for (const p of res.paths) {
            let line = `(${res.from})`;
            let at = res.from;
            for (const h of p.hops) {
              const other = h.from === at ? h.to : h.from;
              line += h.traversal === "along-direction" ? `-[:${h.type}]->(${other})` : `<-[:${h.type}]-(${other})`;
              at = other;
            }
            console.log(`${p.length} against=${p.againstDirection} ${p.category.padEnd(15)} ${line}`);
          }
          if (res.truncated) console.log("[search budget exhausted: results may be incomplete]");
          console.log(res.note);
        }
        return res.paths.length ? 0 : 1;
      }
      case "pattern": {
        const ws = open();
        const res = patternLookup(ws, { ...(arg(rest, "--question") ? { question: arg(rest, "--question") } : {}), ...(arg(rest, "--template") ? { template: arg(rest, "--template") } : {}) });
        print(res);
        return 0;
      }
      case "slice": {
        const ws = open();
        const out = arg(rest, "--out");
        if (!out) throw new UsageError("slice needs --out <dir>");
        const bundle = buildSlice(ws, ws.ir(), loadSidecars(), {
          ...(arg(rest, "--intent") ? { intent: arg(rest, "--intent") } : {}),
          nodeTypes: split(arg(rest, "--types")),
          relationshipTypes: split(arg(rest, "--rels")),
          domains: split(arg(rest, "--domains")),
          fragments: split(arg(rest, "--fragments")),
          modules: split(arg(rest, "--modules")),
          tasks: split(arg(rest, "--tasks")),
          questions: split(arg(rest, "--questions")),
          predicates: split(arg(rest, "--predicates")),
          endpointDepth: num(arg(rest, "--depth"), 1),
          includeSdl: !flag(rest, "--no-sdl"),
          maxTokens: num(arg(rest, "--max-tokens"), 12_000),
          purpose: (arg(rest, "--purpose") ?? "auto") as "auto" | "read" | "write",
        });
        const written = writeSlice(bundle, resolve(out), ws.dir);
        print({ ok: true, sliceId: bundle.sliceId, out: resolve(out), purpose: bundle.purpose, files: written.length, budget: bundle.budget, closure: { complete: bundle.closure.complete, compileable: bundle.closure.compileable, missingTypes: bundle.closure.missingTypes.length }, included: bundle.included.length, omissions: bundle.omissions.length, contextId: bundle.context.contextId });
        return 0;
      }
      case "context": {
        const ws = open();
        const ctx = schemaContext(ws, { ...(arg(rest, "--intent") ? { intent: arg(rest, "--intent") } : {}), taskIds: split(arg(rest, "--tasks")), questionIds: split(arg(rest, "--questions")), cardIds: split(arg(rest, "--cards")) });
        const out = arg(rest, "--out");
        if (out) {
          mkdirSync(dirname(resolve(out)), { recursive: true });
          writeFileSync(resolve(out), `${JSON.stringify(ctx, null, 2)}\n`, "utf8");
        }
        print(ctx);
        return ctx.unresolved.length ? 1 : 0;
      }
      case "rehydrate": {
        const ws = open();
        const file = arg(rest, "--hits");
        if (!file) throw new UsageError("rehydrate needs --hits <file.json>");
        const raw = JSON.parse(readFileSync(resolve(file), "utf8")) as SemanticHit[] | { hits: SemanticHit[] };
        const hits = Array.isArray(raw) ? raw : raw.hits;
        const v = validateHostedHits({ cardDigest: (id) => ws.cardDigest(id), schemaReleaseDigest: ws.manifest.release.schemaReleaseDigest, workspaceFingerprint: ws.manifest.workspaceFingerprint }, hits);
        print({ release: ws.manifest.release.schemaReleaseDigest, workspaceFingerprint: ws.manifest.workspaceFingerprint, accepted: v.accepted.map((h) => ({ ...h, card: ws.record(h.cardId) ? { path: ws.record(h.cardId)!.path, summary: ws.record(h.cardId)!.summary } : null })), rejected: v.rejected, note: "Rejected hosted hits are never shown or acted on; re-run the search against the current generation." });
        return v.rejected.length ? 1 : 0;
      }
      case "eval": {
        const ws = open();
        const tasksFile = arg(rest, "--tasks");
        if (!tasksFile) throw new UsageError("eval needs --tasks <file>");
        const { tasks, goldFile } = loadEvalTasks(tasksFile, arg(rest, "--gold"));
        const evalMode = (arg(rest, "--mode") ?? "lexical") as EvalMode;
        if (!["lexical", "semantic", "hybrid", "structured", "structured-hybrid"].includes(evalMode)) throw new UsageError("--mode must be lexical, semantic, hybrid, structured or structured-hybrid");
        const report = await evalSearch(ws, { tasks, mode: evalMode, ...(arg(rest, "--base-limit") ? { baseLimit: Number(arg(rest, "--base-limit")) } : {}), ...(evalMode === "lexical" || evalMode === "structured" ? {} : { retriever: semanticFromEnv(ws).retriever, measure: true }), k: num(arg(rest, "--k"), 10), tasksFile: resolve(tasksFile), ...(goldFile ? { goldFile } : {}) });
        if (json) print(report);
        else {
          console.log(`mode ${report.mode} · tasks ${report.tasks} (scored ${report.scored}) · Recall@10 ${report.recallAt10} · hit@10 ${report.hitAt10} · exact-ID hit ${report.exactIdHitRate} (exact category ${report.exactIdHitRateExactCategory}) · MRR ${report.mrr}`);
          for (const [c, v] of Object.entries(report.byCategory)) console.log(`  ${c.padEnd(14)} n=${v.tasks} recall@10 ${v.recallAt10} hit@10 ${v.hitAt10} exact-ID ${v.exactIdHitRate}`);
        }
        return 0;
      }
      case "semantic": {
        return await semanticCommand(open(), rest.filter((a) => a !== "--json"), print, (m) => console.error(m));
      }
      case "ir": {
        print(open().ir());
        return 0;
      }
      case "map": {
        const sidecars = loadSidecars();
        const params = readValidationParams();
        const identityKeys = Object.fromEntries(Object.entries(sidecars.identityRules.types).map(([t, r]) => [t, r.nameProperties ?? []]));
        const sdlPath = arg(rest, "--sdl");
        const sdl = sdlPath ? readFileSync(resolve(sdlPath), "utf8") : readPinnedSdl();
        const ir = parseSchema(sdl, { params, identityKeys });
        const text = renderSchemaMap(ir, sidecars, { domains: split(arg(rest, "--domains")), topRelationships: num(arg(rest, "--top"), 40), properties: !flag(rest, "--no-properties"), incoming: !flag(rest, "--no-incoming") });
        const out = arg(rest, "--out");
        if (out) {
          mkdirSync(dirname(resolve(out)), { recursive: true });
          writeFileSync(resolve(out), text, "utf8");
          print({ ok: true, out: resolve(out), bytes: Buffer.byteLength(text), schemaDigest: ir.schemaDigest });
        } else process.stdout.write(text);
        return 0;
      }
      default:
        process.stdout.write(HELP);
        return command && command !== "help" && command !== "--help" ? 1 : 0;
    }
  } catch (error) {
    if (error instanceof WorkspaceError) {
      console.error(JSON.stringify({ ok: false, code: error.code, bksCode: error.bksCode, message: error.message, ...error.details }, null, 2));
      if (error.code === "RELEASE_MISMATCH") return 3;
      return ["PAGE_NOT_FOUND", "PAGE_PATH_INVALID", "SECTION_NOT_FOUND", "LIMIT_EXCEEDED"].includes(error.code) ? 1 : 2;
    }
    if (error instanceof NeighborError || error instanceof PathError) {
      console.error(JSON.stringify({ ok: false, code: error.code, message: error.message, ...error.details }, null, 2));
      return 1;
    }
    if (error instanceof SliceError || error instanceof WorkspaceWriteError) {
      console.error(JSON.stringify({ ok: false, code: (error as { code: string }).code, message: error.message }, null, 2));
      return 1;
    }
    if (error instanceof ProviderError) {
      console.error(JSON.stringify({ ok: false, code: `PROVIDER_${error.failure.toUpperCase().replace(/-/g, "_")}`, message: error.message.replace(/sk-[A-Za-z0-9_-]{8,}/g, "sk-***") }, null, 2));
      return error.failure === "quota" || error.failure === "billing" ? 5 : 4;
    }
    if (error instanceof ReleaseError) {
      console.error(JSON.stringify({ ok: false, code: error.code, bksCode: error.bksCode, message: error.message }, null, 2));
      return 2;
    }
    if (error instanceof UsageError) {
      console.error(`usage: ${error.message}\n`);
      process.stdout.write(HELP);
      return 1;
    }
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    return 1;
  }
}

const invokedDirectly = Boolean(process.argv[1]) && resolve(process.argv[1]!) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().then((code) => {
    process.exitCode = code;
  });
}
