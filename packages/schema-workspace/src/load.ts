import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ValidationParams } from "./ir.js";
import { loadRelease, type PinV2, type ReleaseBundle } from "./release.js";

const here = dirname(fileURLToPath(import.meta.url));

/** Repository root (packages/schema-workspace/src|dist -> ../../..). */
export const repoRoot = resolve(here, "..", "..", "..");
/** schema/pinned: PIN.json (bks-pin.v2) + release/** (written only by `pnpm schema:pin`). */
export const pinnedDir = resolve(repoRoot, "schema", "pinned");
/**
 * Workspace inputs of the pinned release (the authority is biotech-meta's release `workspace-inputs/`; this is its
 * verified pinned copy). `schema/sidecars/` is a pointer only (see its README).
 */
export const sidecarDir = resolve(pinnedDir, "release", "workspace-inputs");
export const defaultWorkspaceDir = resolve(repoRoot, "workspace");

/** PIN.json of the loaded release (bks-pin.v2). */
export type PinManifest = PinV2;

/** The verified release bundle (loadRelease: every byte checked; BKS_SCHEMA_RELEASE_DIR honored, missing = error). */
export function readRelease(): ReleaseBundle {
  return loadRelease();
}

/** PIN.json of the verified release; for an unpinned override directory a synthetic pin view of its release.json. */
export function readPin(): PinManifest {
  const r = loadRelease();
  if (r.pin) return r.pin;
  return {
    pinFormat: "bks-pin.v2",
    releaseId: r.manifest.releaseId,
    schemaReleaseDigest: r.schemaReleaseDigest,
    schemaDigest: r.schemaDigest,
    sourcePath: r.dir,
    sourceRevision: { biotechMeta: r.manifest.sourceRevision.dirtySnapshotDigest },
    pinnedAt: "(unpinned override)",
    root: ".",
    sdlKey: "sdl/assembled.graphql",
    releaseKey: "release.json",
    files: r.files,
  };
}

/** The assembled SDL of the verified release (PIN.json sdlKey; never a hardcoded file name). */
export function readPinnedSdl(): string {
  return loadRelease().sdl;
}

export function readValidationParams(): ValidationParams {
  return loadRelease().params;
}
