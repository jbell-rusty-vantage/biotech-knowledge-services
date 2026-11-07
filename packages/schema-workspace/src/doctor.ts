/**
 * `bks-schema doctor`: health of a packaged workspace without network or credentials.
 * Checks: supported versions, on-disk integrity against the manifest inventory, index <-> card agreement (paths,
 * card digests recomputed from front matter + body), zero broken links, query catalog digest, release binding
 * (expected digest and, when available, the pinned release), and the semantic generation placeholder.
 * Output carries paths, ids and digests only; it never reads or prints environment values.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseCard, verifyCardDigest } from "./card.js";
import { linksOf, RENDERER_VERSION } from "./render.js";
import { LOOKUP_KINDS, WORKSPACE_FORMAT_V2 } from "./schema-contracts.js";
import { notConfiguredRetriever, type SemanticRetriever } from "./semantic/retriever.js";
import { generationCompatibility } from "./semantic/config.js";
import { openWorkspace, verifyWorkspaceFiles, WorkspaceError, type Workspace } from "./workspace.js";

export interface DoctorCheck {
  id: string;
  status: "pass" | "fail" | "warn" | "skip";
  summary: string;
  details?: Record<string, unknown>;
}

export interface DoctorReport {
  ok: boolean;
  dir: string;
  releaseId?: string;
  schemaReleaseDigest?: string;
  workspaceFingerprint?: string;
  checks: DoctorCheck[];
}

export interface DoctorOptions {
  expectRelease?: string;
  /** Compare against the pinned release (loadRelease). Default true; set false for an offline bundle without schema/pinned. */
  pinned?: boolean;
  retriever?: SemanticRetriever;
  /** Semantic generation custody directory (default BKS_SEMANTIC_CUSTODY_DIR or runs/release-v2/custody/semantic). */
  semanticCustodyDir?: string;
  /** Injected for tests / offline bundles: returns the pinned release identities or throws. */
  loadPinned?: () => { schemaReleaseDigest: string; schemaDigest: string; releaseId: string };
}

const SUPPORTED_RENDERER_MAJOR = RENDERER_VERSION.split(".")[0];

export async function doctor(dir: string, options: DoctorOptions = {}): Promise<DoctorReport> {
  const root = resolve(dir);
  const checks: DoctorCheck[] = [];
  const report: DoctorReport = { ok: false, dir: root, checks };
  let ws: Workspace | undefined;
  try {
    ws = openWorkspace(root);
    report.releaseId = ws.manifest.release.releaseId;
    report.schemaReleaseDigest = ws.manifest.release.schemaReleaseDigest;
    report.workspaceFingerprint = ws.manifest.workspaceFingerprint;
    const major = ws.manifest.rendererVersion.split(".")[0];
    const irOk = ws.manifest.release.irVersion === "bks-schema-ir.v2";
    checks.push(major === SUPPORTED_RENDERER_MAJOR && irOk ? { id: "version", status: "pass", summary: `${WORKSPACE_FORMAT_V2}, renderer ${ws.manifest.rendererVersion}, ${ws.manifest.release.irVersion}` } : { id: "version", status: "fail", summary: `unsupported renderer ${ws.manifest.rendererVersion} or IR ${ws.manifest.release.irVersion}`, details: { supportedRendererMajor: SUPPORTED_RENDERER_MAJOR } });
  } catch (error) {
    const code = error instanceof WorkspaceError ? error.code : "WORKSPACE_CORRUPT";
    checks.push({ id: "version", status: "fail", summary: (error as Error).message, details: { code } });
    report.ok = false;
    return report;
  }

  const integrity = verifyWorkspaceFiles(root);
  checks.push(
    integrity.ok
      ? { id: "integrity", status: "pass", summary: `${integrity.files.expected} files hashed against the manifest inventory; fingerprint matches` }
      : { id: "integrity", status: "fail", summary: `missing ${integrity.missing.length}, altered ${integrity.altered.length}, unexpected ${integrity.unexpected.length}${integrity.fingerprint.matches ? "" : ", fingerprint mismatch"}`, details: { missing: integrity.missing.slice(0, 20), altered: integrity.altered.slice(0, 20), unexpected: integrity.unexpected.slice(0, 20), problems: integrity.problems } },
  );

  // index <-> cards
  const badPaths: string[] = [];
  const badDigests: string[] = [];
  const texts = new Map<string, string>();
  const read = (p: string) => {
    if (!texts.has(p)) texts.set(p, existsSync(join(root, ...p.split("/"))) ? readFileSync(join(root, ...p.split("/")), "utf8") : "");
    return texts.get(p)!;
  };
  for (const r of ws.index) {
    const text = read(r.path);
    if (!text) {
      badPaths.push(`${r.id} -> ${r.path}`);
      continue;
    }
    if (LOOKUP_KINDS.includes(r.kind)) continue;
    const card = parseCard(text);
    if (!card || card.frontMatter.id !== r.id || card.frontMatter.cardDigest !== r.cardDigest || !verifyCardDigest(card)) badDigests.push(r.id);
  }
  checks.push(badPaths.length || badDigests.length ? { id: "cards", status: "fail", summary: `${badPaths.length} records point at missing pages, ${badDigests.length} card digests disagree`, details: { badPaths: badPaths.slice(0, 20), badDigests: badDigests.slice(0, 20) } } : { id: "cards", status: "pass", summary: `${ws.index.length} records resolve; every card digest recomputes from its front matter and body` });

  // links
  const broken: string[] = [];
  for (const p of Object.keys(ws.manifest.inventory)) {
    if (!p.endsWith(".md")) continue;
    for (const target of linksOf(p, read(p))) if (!(target in ws.manifest.inventory)) broken.push(`${p} -> ${target}`);
  }
  checks.push(broken.length ? { id: "links", status: "fail", summary: `${broken.length} broken links`, details: { broken: broken.slice(0, 20) } } : { id: "links", status: "pass", summary: "every relative Markdown link resolves" });

  // query catalog
  const cat = existsSync(join(root, "patterns", "catalog.json")) ? `sha256:${createHash("sha256").update(readFileSync(join(root, "patterns", "catalog.json"))).digest("hex")}` : null;
  const expectedCat = ws.manifest.release.queryCatalogDigest;
  checks.push(cat && expectedCat && cat === expectedCat ? { id: "query-catalog", status: "pass", summary: `patterns/catalog.json is the release catalog ${expectedCat.slice(0, 19)}…` } : { id: "query-catalog", status: "fail", summary: "patterns/catalog.json does not match the release queryCatalogDigest", details: { onDisk: cat, expected: expectedCat } });

  // release binding
  if (options.expectRelease) {
    checks.push(options.expectRelease === ws.manifest.release.schemaReleaseDigest ? { id: "expected-release", status: "pass", summary: "workspace is bound to the expected schemaReleaseDigest" } : { id: "expected-release", status: "fail", summary: "workspace is bound to a different release (BKS_RELEASE_MISMATCH)", details: { expected: options.expectRelease, actual: ws.manifest.release.schemaReleaseDigest } });
  }
  if (options.pinned !== false) {
    try {
      const pinned = (options.loadPinned ?? defaultPinned)();
      const same = pinned.schemaReleaseDigest === ws.manifest.release.schemaReleaseDigest && pinned.schemaDigest === ws.manifest.release.schemaDigest;
      checks.push(same ? { id: "pinned-release", status: "pass", summary: `matches the pinned release ${pinned.releaseId}` } : { id: "pinned-release", status: "fail", summary: `workspace was rendered from a different release than the pin (${pinned.releaseId}); rebuild with pnpm workspace:build`, details: { pinned: pinned.schemaReleaseDigest, workspace: ws.manifest.release.schemaReleaseDigest } });
    } catch (error) {
      checks.push({ id: "pinned-release", status: "skip", summary: "pinned release not available here (offline bundle); integrity was checked against the manifest only", details: { code: (error as { code?: string }).code ?? "UNAVAILABLE" } });
    }
  }

  // release compatibility statement (v2.0.1+)
  const compat = ws.manifest.compatibility;
  checks.push(compat ? { id: "compatibility", status: "pass", summary: Object.entries(compat).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k} ${v.status}`).join(", "), details: { card: "rules/compatibility.md" } } : { id: "compatibility", status: "skip", summary: "release carries no compatibility statement" });

  // semantic generation compatibility (offline: pointer, readiness, release / workspace / corpus identity)
  const gen = generationCompatibility(ws, options.semanticCustodyDir);
  const st = await (options.retriever ?? notConfiguredRetriever).status();
  if (gen.state === "compatible") checks.push({ id: "semantic", status: "pass", summary: `semantic generation ${gen.generationId} is ready and built from this workspace (${gen.documents} documents); retriever ${st.state}`, details: { retriever: st.state, ...(st.reason ? { reason: st.reason } : {}) } });
  else if (gen.state === "not-configured") checks.push({ id: "semantic", status: "skip", summary: "no semantic generation published: lexical search is complete; semantic/hybrid requests report the degradation explicitly", details: { reasons: gen.reasons } });
  else checks.push({ id: "semantic", status: "warn", summary: `semantic generation ${gen.generationId} is ${gen.state}${gen.state === "refreshable" ? " (attribute-only refresh: no document changed)" : ""}: hosted hits are rejected until refreshed; lexical search stays complete`, details: { reasons: gen.reasons, ...(gen.changedDocuments ? { changedDocuments: gen.changedDocuments } : {}) } });

  report.ok = !checks.some((c) => c.status === "fail");
  return report;
}

function defaultPinned(): { schemaReleaseDigest: string; schemaDigest: string; releaseId: string } {
  const pinPath = resolve(new URL("../../../schema/pinned/PIN.json", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
  const pin = JSON.parse(readFileSync(pinPath, "utf8")) as { schemaReleaseDigest: string; schemaDigest: string; releaseId: string };
  return { schemaReleaseDigest: pin.schemaReleaseDigest, schemaDigest: pin.schemaDigest, releaseId: pin.releaseId };
}
