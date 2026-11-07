/**
 * `bks-schema semantic <sub>`: corpus export, generation, refresh, publish, status, retirement and qualification.
 * Live provider calls need `--live` and the server-side OPENAI_API_KEY; nothing prints a credential, a raw store
 * listing or a store id (store / file ids are written to custody files only).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { loadEvalTasks } from "../eval.js";
import type { Workspace } from "../workspace.js";
import { exportCorpus, writeCorpus } from "./corpus.js";
import { generationCompatibility } from "./config.js";
import { readSetting, SEMANTIC_ENV } from "./env.js";
import { BUDGET, GenerationAbort, defaultCustodyDir, generate, newGenerationId, publishGeneration, readGeneration, readLedger, readPointer, recheckGeneration, recordUsage, refreshGeneration, retireGeneration, writeJsonAtomic } from "./generation.js";
import { openAIProvider, ProviderError, type VectorProvider } from "./provider.js";
import { qualify } from "./qualify.js";

export const SEMANTIC_HELP = `  semantic export [--out <dir>]                    write the approved corpus + manifest to custody (no network); prints counts / token estimates
  semantic generate --live [--generation <id>]     upload, index and verify one generation (resumable; budget-bounded)
  semantic recheck --live --generation <id>        re-check a generation against the provider (resume polling)
  semantic refresh --live [--from <id>] [--max-uploads N] [--max-generations N]
                                                   new generation reusing every unchanged uploaded file (attribute-only when no card bytes changed);
                                                   aborts before any provider call when more than N uploads would be needed (exit 6)
  semantic publish --generation <id>               atomically point current.json at a ready generation (previous retained)
  semantic status                                  current pointer, generation readiness and workspace compatibility (offline)
  semantic retire --generation <id>                deactivate a non-current generation (deletion only after retention)
  semantic qualify --live --tasks <file> [--out <dir>]   lexical / semantic / hybrid eval, paired decision, round trip, fallback tests
`;

function arg(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

function liveProvider(args: string[]): VectorProvider {
  if (!args.includes("--live")) throw new ProviderError("auth", "this subcommand calls the provider; pass --live to confirm");
  const key = readSetting(SEMANTIC_ENV.apiKey);
  if (!key) throw new ProviderError("auth", "no server-side provider credentials configured");
  return openAIProvider(key);
}

export async function semanticCommand(ws: Workspace, args: string[], print: (v: unknown) => void, log: (s: string) => void): Promise<number> {
  const [sub, ...rest] = args;
  const custody = resolve(arg(rest, "--custody") ?? readSetting(SEMANTIC_ENV.custodyDir, { dotenv: false }) ?? defaultCustodyDir());
  switch (sub) {
    case "export": {
      const corpus = exportCorpus(ws);
      const gid = arg(rest, "--generation") ?? newGenerationId(corpus.manifest.corpusDigest);
      const out = resolve(arg(rest, "--out") ?? join(custody, gid));
      writeCorpus(out, corpus);
      print({ ok: true, out, generationId: gid, corpusDigest: corpus.manifest.corpusDigest, counts: corpus.manifest.counts, totals: corpus.manifest.totals, budget: { maxUploadBytes: BUDGET.maxUploadBytes, withinBudget: corpus.manifest.totals.bytes <= BUDGET.maxUploadBytes } });
      return 0;
    }
    case "generate": {
      const provider = liveProvider(rest);
      const record = await generate({ ws, provider, custodyDir: custody, ...(arg(rest, "--generation") ? { generationId: arg(rest, "--generation")! } : {}), log });
      print({ ok: record.status === "ready", generationId: record.generationId, status: record.status, documents: record.documents, files: record.files, provider: record.provider ? { storeStatus: record.provider.storeStatus, usageBytes: record.provider.usageBytes, fileCounts: record.provider.fileCounts } : null, problems: record.problems.slice(0, 10), custody: join(custody, record.generationId) });
      return record.status === "ready" ? 0 : 1;
    }
    case "recheck": {
      const provider = liveProvider(rest);
      const gid = arg(rest, "--generation");
      if (!gid) throw new Error("recheck needs --generation <id>");
      const record = await recheckGeneration(ws, provider, gid, custody);
      print({ ok: record.status === "ready", generationId: gid, status: record.status, files: record.files, problems: record.problems.slice(0, 10) });
      return record.status === "ready" ? 0 : 1;
    }
    case "refresh": {
      const provider = liveProvider(rest);
      const from = arg(rest, "--from") ?? readPointer(custody)?.generationId;
      if (!from) throw new Error("refresh needs --from <generation id> (default: the current pointer)");
      const cap = arg(rest, "--max-uploads");
      const gens = arg(rest, "--max-generations");
      let record;
      try {
        record = await refreshGeneration({ ws, provider, custodyDir: custody, from, ...(arg(rest, "--generation") ? { generationId: arg(rest, "--generation")! } : {}), ...(cap ? { maxUploads: Number(cap) } : {}), ...(gens ? { maxGenerations: Number(gens) } : {}), log });
      } catch (error) {
        if (error instanceof GenerationAbort) {
          print({ ok: false, aborted: true, code: error.code, message: error.message, ...error.details, from });
          return 6;
        }
        throw error;
      }
      print({ ok: record.status === "ready", generationId: record.generationId, reusedFrom: from, status: record.status, files: record.files, provider: record.provider ? { storeStatus: record.provider.storeStatus, usageBytes: record.provider.usageBytes } : null, problems: record.problems.slice(0, 10), custody: join(custody, record.generationId) });
      return record.status === "ready" ? 0 : 1;
    }
    case "publish": {
      const gid = arg(rest, "--generation");
      if (!gid) throw new Error("publish needs --generation <id>");
      const p = publishGeneration(gid, custody);
      print({ ok: true, generationId: p.generationId, releaseId: p.releaseId, workspaceFingerprint: p.workspaceFingerprint, publishedAt: p.publishedAt, previous: p.history.map((h) => h.generationId) });
      return 0;
    }
    case "status": {
      const pointer = readPointer(custody);
      const compat = generationCompatibility(ws, custody);
      const g = pointer ? readGeneration(pointer.generationId, custody) : null;
      const l = readLedger(custody);
      print({ pointer: pointer ? { generationId: pointer.generationId, releaseId: pointer.releaseId, publishedAt: pointer.publishedAt, history: pointer.history.map((h) => h.generationId) } : null, generation: g ? { status: g.record.status, documents: g.record.documents, files: g.record.files, sdk: g.record.sdk, chunking: g.record.chunking, usageBytes: g.record.provider?.usageBytes ?? null } : null, compatibility: compat, credentials: { configured: Boolean(readSetting(SEMANTIC_ENV.apiKey)) }, ledger: { generationsStarted: l.generationsStarted.length, uploads: l.uploads, uploadedBytes: l.uploadedBytes, searchCalls: l.searchCalls, otherCalls: l.otherCalls } });
      return 0;
    }
    case "retire": {
      const gid = arg(rest, "--generation");
      if (!gid) throw new Error("retire needs --generation <id>");
      const r = retireGeneration(gid, custody);
      print({ ok: true, generationId: gid, status: r.status, retainUntil: r.retainUntil, note: "deletion of the store and unshared files is allowed only after retainUntil (deleteGeneration)" });
      return 0;
    }
    case "qualify": {
      const provider = liveProvider(rest);
      const tasksFile = arg(rest, "--tasks");
      if (!tasksFile) throw new Error("qualify needs --tasks <file>");
      const pointer = readPointer(custody);
      const gid = arg(rest, "--generation") ?? pointer?.generationId;
      if (!gid) throw new Error("no generation bound (publish one or pass --generation)");
      const g = readGeneration(gid, custody);
      if (!g) throw new Error(`no generation ${gid} in custody`);
      const ledger = readLedger(custody);
      const plannedSearches = 68 + 25 + 6;
      if (ledger.searchCalls + plannedSearches > BUDGET.maxSearchCalls) throw new ProviderError("billing", `search budget: ${ledger.searchCalls} used + ~${plannedSearches} planned exceeds ${BUDGET.maxSearchCalls}`);
      const corpus = exportCorpus(ws);
      const { tasks, goldFile } = loadEvalTasks(tasksFile, arg(rest, "--gold"));
      let calls = 0;
      const report = await qualify({ ws, tasks, provider, generation: g, corpus: corpus.manifest, log, onCall: (c) => void (c.cached ? 0 : calls++) });
      recordUsage(custody, { searchCalls: calls }, { kind: "qualify", detail: `${gid}: ${calls} provider search calls` });
      const out = resolve(arg(rest, "--out") ?? join(custody, gid, "qualification"));
      mkdirSync(out, { recursive: true });
      writeJsonAtomic(join(out, "qualification.json"), { ...report, tasksFile: resolve(tasksFile), goldFile, providerSearchCalls: calls });
      for (const m of ["lexical", "semantic", "hybrid"] as const) writeFileSync(join(out, `eval-${m}.json`), `${JSON.stringify(report.reports[m], null, 2)}\n`, "utf8");
      const { reports: _r, ...brief } = report;
      print({ ...brief, providerSearchCalls: calls, out });
      return 0;
    }
    default:
      process.stdout.write(SEMANTIC_HELP);
      return sub ? 1 : 0;
  }
}
