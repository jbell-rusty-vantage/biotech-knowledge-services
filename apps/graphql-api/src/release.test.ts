import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sha256Digest } from "./hash.js";
import { CANDIDATE_RELEASE_ID, defaultRepoRoot, loadConsumerSourceSdl, ReleaseError } from "./release.js";

const pinned = join(defaultRepoRoot(), "schema", "pinned");
const hasRelease = existsSync(join(pinned, "release", "release.json"));

/** A repository root with a v1 (or absent) pin and a candidate file whose bytes are NOT the frozen candidate. */
function fakeRepo(pin: "v1" | "none"): string {
  const root = mkdtempSync(join(tmpdir(), "bks-s6-release-"));
  mkdirSync(join(root, "schema", "pinned"), { recursive: true });
  if (pin === "v1") writeFileSync(join(root, "schema", "pinned", "PIN.json"), JSON.stringify({ pinnedAt: "2026-10-07", files: {} }));
  mkdirSync(join(root, "schema", "program", "final", "schema"), { recursive: true });
  writeFileSync(join(root, "schema", "program", "final", "schema", "final_biotech_schema_v2.graphql"), "type Product @node { uid: String! }\n");
  return root;
}

/** A copy of the real pinned release under a temporary repository root. */
function copiedRelease(): string {
  const root = mkdtempSync(join(tmpdir(), "bks-s6-pinned-"));
  cpSync(pinned, join(root, "schema", "pinned"), { recursive: true });
  return root;
}

const errorCode = (fn: () => unknown) => {
  try {
    fn();
    return "loaded";
  } catch (error) {
    return error instanceof ReleaseError ? error.code : String(error);
  }
};
const quiet = () => {};

describe("loadConsumerSourceSdl", () => {
  it.runIf(hasRelease)("loads the pinned bks-pin.v2 release through the schema authority's verified loader", () => {
    const src = loadConsumerSourceSdl({ env: { NODE_ENV: "production" }, log: quiet });
    expect(src.mode).toBe("release");
    expect(src.releaseId).toMatch(/^biotech-schema-v2\.\d+\.\d+$/);
    expect(src.releaseCompatibility?.releaseId).toBe(src.releaseId);
    expect(src.schemaDigest).toBe(sha256Digest(src.sdl));
    expect(src.schemaReleaseDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(src.bundle?.ir.nodes.length).toBeGreaterThan(60);
    expect(src.ddl.some((d) => d.name === "identifier_scheme_value" && d.required)).toBe(true);
    expect(src.supportedMatrix).toMatchObject({ neo4jGraphql: "7.6.3" });
  });

  it.runIf(hasRelease)("refuses tampered release bytes", () => {
    const root = copiedRelease();
    appendFileSync(join(root, "schema", "pinned", "release", "sdl", "assembled.graphql"), "\n# tampered\n");
    expect(errorCode(() => loadConsumerSourceSdl({ repoRoot: root, env: {}, log: quiet }))).toBe("BKS_RELEASE_TAMPERED");
    const extra = copiedRelease();
    writeFileSync(join(extra, "schema", "pinned", "release", "sdl", "smuggled.graphql"), "type X { a: Int }");
    expect(errorCode(() => loadConsumerSourceSdl({ repoRoot: extra, env: {}, log: quiet }))).toBe("BKS_RELEASE_TAMPERED");
  });

  it("refuses to start in production without the pinned v2 release", () => {
    expect(errorCode(() => loadConsumerSourceSdl({ repoRoot: fakeRepo("v1"), env: { NODE_ENV: "production" }, log: quiet }))).toBe("BKS_RELEASE_MISSING");
    expect(errorCode(() => loadConsumerSourceSdl({ repoRoot: fakeRepo("none"), env: { NODE_ENV: "production" }, log: quiet }))).toBe("BKS_RELEASE_MISSING");
  });

  it("refuses overrides in production and a missing explicit override anywhere (TL-02)", () => {
    expect(errorCode(() => loadConsumerSourceSdl({ env: { NODE_ENV: "production", BKS_SCHEMA_RELEASE_DIR: pinned }, log: quiet }))).toBe("BKS_RELEASE_MISMATCH");
    expect(errorCode(() => loadConsumerSourceSdl({ env: { NODE_ENV: "production", BKS_CONSUMER_CANDIDATE_SDL: "/x.graphql" }, log: quiet }))).toBe("BKS_RELEASE_MISMATCH");
    expect(errorCode(() => loadConsumerSourceSdl({ env: { BKS_SCHEMA_RELEASE_DIR: join(pinned, "nope") }, log: quiet }))).toBe("BKS_RELEASE_MISSING");
    expect(errorCode(() => loadConsumerSourceSdl({ env: { BKS_CONSUMER_CANDIDATE_SDL: join(pinned, "nope.graphql") }, log: quiet }))).toBe("BKS_RELEASE_MISSING");
    expect(errorCode(() => loadConsumerSourceSdl({ env: { BKS_SCHEMA_PATH: "/x.graphql" }, log: quiet }))).toBe("BKS_RELEASE_MISMATCH");
  });

  it("falls back to a candidate only outside production, loudly, and refuses a candidate file with the wrong bytes", () => {
    const warnings: string[] = [];
    const root = fakeRepo("v1");
    const explicit = loadConsumerSourceSdl({ repoRoot: root, env: { BKS_CONSUMER_CANDIDATE_SDL: join(root, "schema", "program", "final", "schema", "final_biotech_schema_v2.graphql") }, log: (m) => warnings.push(m) });
    expect(explicit).toMatchObject({ mode: "candidate", releaseId: CANDIDATE_RELEASE_ID, schemaReleaseDigest: null, bundle: null });
    expect(warnings.join("\n")).toMatch(/NON-PRODUCTION.*CANDIDATE/);
    expect(errorCode(() => loadConsumerSourceSdl({ repoRoot: fakeRepo("v1"), env: {}, log: quiet }))).toBe("BKS_RELEASE_TAMPERED");
  });
});
