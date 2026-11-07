import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { loadRelease } from "./release.js";
import { renderWorkspace, type RenderResult } from "./render.js";
import { loadSidecars, validateSidecars } from "./sidecars.js";
import { verifyWorkspaceFiles, type IntegrityReport } from "./workspace.js";
import { defaultWorkspaceDir } from "./load.js";

/**
 * Renders the workspace in memory (no files written) from the verified pinned release (loadRelease: every byte
 * checked; BKS_SCHEMA_RELEASE_DIR honored). Workspace inputs are the release's own workspace-inputs/. The generation
 * timestamp defaults to the release createdAt (frozen), so a build is reproducible byte for byte.
 */
export function build(generatedAt?: string): RenderResult {
  const release = loadRelease();
  const sidecars = loadSidecars(release.workspaceInputs.dir);
  const errors = validateSidecars(release.ir, sidecars);
  if (errors.length) throw new Error(`workspace input validation failed:\n- ${errors.join("\n- ")}`);
  return renderWorkspace({ release, sidecars, ...(generatedAt ? { generatedAt } : {}) });
}

export interface VerifyReport {
  ok: boolean;
  dir: string;
  integrity: IntegrityReport;
  rerender: { fingerprint: string; onDisk?: string; matches: boolean; staleFiles: string[]; missingFromDisk: string[]; extraOnDisk: string[]; generatedAt?: string };
}

/**
 * `workspace:verify`: (1) hash every on-disk file against the manifest inventory (missing / altered / unexpected),
 * (2) re-render from the pinned release with the manifest's generatedAt and compare file by file (stale workspace).
 */
export function verifyWorkspace(dir: string = defaultWorkspaceDir): VerifyReport {
  const root = resolve(dir);
  const integrity = verifyWorkspaceFiles(root);
  let generatedAt: string | undefined;
  try {
    generatedAt = (JSON.parse(readFileSync(join(root, "manifest.json"), "utf8")) as { generatedAt?: string }).generatedAt;
  } catch {
    generatedAt = undefined;
  }
  const rendered = build(generatedAt);
  const staleFiles: string[] = [];
  const missingFromDisk: string[] = [];
  for (const [p, content] of rendered.files) {
    const file = join(root, ...p.split("/"));
    if (!existsSync(file)) {
      missingFromDisk.push(p);
      continue;
    }
    const a = createHash("sha256").update(readFileSync(file)).digest("hex");
    const b = createHash("sha256").update(content, "utf8").digest("hex");
    if (a !== b) staleFiles.push(p);
  }
  const extraOnDisk = [...integrity.unexpected].filter((p) => !rendered.files.has(p));
  const matches = staleFiles.length === 0 && missingFromDisk.length === 0 && extraOnDisk.length === 0 && integrity.fingerprint.manifest === rendered.manifest.workspaceFingerprint;
  return {
    ok: integrity.ok && matches,
    dir: root,
    integrity,
    rerender: { fingerprint: rendered.manifest.workspaceFingerprint, ...(integrity.fingerprint.manifest ? { onDisk: integrity.fingerprint.manifest } : {}), matches, staleFiles: staleFiles.slice(0, 50), missingFromDisk: missingFromDisk.slice(0, 50), extraOnDisk: extraOnDisk.slice(0, 50), ...(generatedAt ? { generatedAt } : {}) },
  };
}
