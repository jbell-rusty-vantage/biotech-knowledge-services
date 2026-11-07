/**
 * `bks-schema pattern --question <id> | --template <id>`: a catalog question with its validated query templates
 * (statement, parameters, output contract, limits, required indexes, temporal / provenance notes, status and
 * validation), read from patterns/catalog.json (the release query catalog, byte-identical). A held or unsupported
 * question returns its status and reason; it never pretends a template exists.
 */
import { patternPath } from "./render.js";
import { WorkspaceError, type Workspace } from "./workspace.js";

export interface PatternResult {
  release: { releaseId: string; schemaReleaseDigest: string; queryCatalogDigest?: string };
  question: (Record<string, unknown> & { id: string; status: string; templates: string[] }) | null;
  /** Set when the requested id was a catalog alias (e.g. CQ-AX-05 -> Q-K-21). */
  resolvedFrom?: string;
  status: string;
  templates: Array<Record<string, unknown> & { id: string; card: string }>;
  note: string;
}

export function patternLookup(ws: Workspace, request: { question?: string; template?: string }): PatternResult {
  const catalog = ws.catalog();
  const release = { releaseId: ws.manifest.release.releaseId, schemaReleaseDigest: ws.manifest.release.schemaReleaseDigest, ...(ws.manifest.release.queryCatalogDigest ? { queryCatalogDigest: ws.manifest.release.queryCatalogDigest } : {}) };
  const note = "supported = EXPLAIN passed on the Neo4j 5.26 baseline with the required DDL; result assertions are not run in this release. Cypher 5 only (never CYPHER 25). A template is read through the native read service; this command does not execute it.";
  const card = (id: string) => patternPath(id);
  if (request.template) {
    const t = catalog.templates.find((x) => x.id === request.template);
    if (!t) throw new WorkspaceError("PAGE_NOT_FOUND", `no template ${request.template}`, { suggestions: catalog.templates.filter((x) => x.id.includes(request.template!.split("/").pop() ?? "")).slice(0, 5).map((x) => x.id) });
    return { release, question: null, status: t.status, templates: [{ ...t, card: card(t.id) }], note };
  }
  const id = request.question;
  if (!id) throw new WorkspaceError("PAGE_NOT_FOUND", "pattern needs --question <id> or --template <id>");
  let q = catalog.questions.find((x) => x.id === id);
  let resolvedFrom: string | undefined;
  if (!q) {
    const alias = catalog.aliases.find((a) => a.alias === id);
    if (alias?.canonical[0]) {
      q = catalog.questions.find((x) => x.id === alias.canonical[0]);
      resolvedFrom = id;
    }
  }
  if (!q) throw new WorkspaceError("PAGE_NOT_FOUND", `no catalog question ${id}`, { suggestions: catalog.questions.filter((x) => x.id.startsWith(id.split("-").slice(0, 2).join("-"))).slice(0, 5).map((x) => x.id) });
  const templates = q.templates.map((tid) => catalog.templates.find((t) => t.id === tid)).filter((t): t is NonNullable<typeof t> => Boolean(t)).map((t) => ({ ...t, card: card(t.id) }));
  return { release, question: q, ...(resolvedFrom ? { resolvedFrom } : {}), status: q.status, templates, note };
}
