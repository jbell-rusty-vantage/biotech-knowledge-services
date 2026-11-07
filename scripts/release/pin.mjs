#!/usr/bin/env node
/**
 * pnpm schema:pin -- --release <dir> [--pinned-at YYYY-MM-DD] [--target schema/pinned] [--check]
 *
 * Validates every digest in <dir>/release.json against the bytes (files, excluded placeholders, identities, content-tree
 * digest; no unlisted file), computes schemaReleaseDigest = sha256(canonicalJson(release.json)), then replaces
 * schema/pinned atomically (staging directory + rename): schema/pinned/PIN.json (bks-pin.v2) and a byte mirror of the
 * bundle under schema/pinned/release/**. The previous pin (v1 files) is removed only by this command; it stays in Git
 * history and is summarized under PIN.json provenance.previousPin.
 *
 * --check: validate and compare with the current pin; exit 1 if the pin would change (nothing written).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { arg, BKS_ROOT, canonicalJson, flag, listFiles, orderedJson, replaceDirAtomically, sha256Hex, sha256Tagged } from "./lib/common.mjs";

export function verifyReleaseDir(dir) {
  const errors = [];
  const releasePath = resolve(dir, "release.json");
  if (!existsSync(releasePath)) return { errors: [`RELEASE_MISSING: no release.json in ${dir}`] };
  const releaseBytes = readFileSync(releasePath);
  const release = JSON.parse(releaseBytes.toString("utf8"));
  const listed = new Map(Object.entries(release.files ?? {}));
  for (const [p, e] of Object.entries(release.excludedFromFrozenDigestSet ?? {})) listed.set(p, e);
  const onDisk = listFiles(dir).filter((p) => p !== "release.json");
  for (const p of onDisk) if (!listed.has(p)) errors.push(`RELEASE_TAMPERED: unlisted file ${p}`);
  const bytes = new Map();
  for (const [p, e] of listed) {
    const abs = resolve(dir, p);
    if (!existsSync(abs)) {
      errors.push(`RELEASE_TAMPERED: listed file missing ${p}`);
      continue;
    }
    const b = readFileSync(abs);
    bytes.set(p, b);
    if (b.length !== e.bytes) errors.push(`RELEASE_TAMPERED: ${p} bytes ${b.length} != ${e.bytes}`);
    if (sha256Hex(b) !== e.sha256) errors.push(`RELEASE_TAMPERED: ${p} sha256 mismatch`);
  }
  const id = release.identities ?? {};
  const tagged = (p) => (bytes.has(p) ? sha256Tagged(bytes.get(p)) : null);
  const checks = [
    ["schemaDigest", tagged("sdl/assembled.graphql")],
    ["queryCatalogDigest", tagged("query-catalog/catalog.json")],
    ["ddlDigest", tagged("ddl/ddl.json")],
    ["validationParamsDigest", tagged("validation/validation-params.json")],
    ["decisionLedgerDigest", tagged("decisions/DECISIONS.md")],
    ["contentTreeDigest", sha256Tagged(Object.entries(release.files).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([p, e]) => `${p}\u0000${e.sha256}\n`).join(""))],
  ];
  for (const [k, v] of checks) if (id[k] !== v) errors.push(`RELEASE_TAMPERED: identities.${k} ${id[k]} != ${v}`);
  if (release.decisionLedgerDigest !== id.decisionLedgerDigest) errors.push("RELEASE_TAMPERED: decisionLedgerDigest disagrees with identities");
  if (release.sourceRevision?.dirtySnapshotDigest && release.sourceRevision.dirtySnapshotDigest !== id.contentTreeDigest) errors.push("RELEASE_TAMPERED: dirtySnapshotDigest != contentTreeDigest");
  return { errors, release, releaseBytes, bytes, schemaReleaseDigest: sha256Tagged(canonicalJson(release)) };
}

function gitState(dir) {
  try {
    const top = execFileSync("git", ["-C", dir, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
    const head = execFileSync("git", ["-C", dir, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    const status = execFileSync("git", ["-C", top, "status", "--porcelain", "--", relative(top, dir).split(sep).join("/")], { encoding: "utf8" }).trim();
    return { head, clean: status.length === 0 };
  } catch {
    return { head: null, clean: false };
  }
}

const invoked = process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
if (invoked) {
  const releaseArg = arg("--release");
  if (!releaseArg) {
    console.error("usage: pnpm schema:pin -- --release <release dir> [--pinned-at YYYY-MM-DD] [--check]");
    process.exit(2);
  }
  const releaseDir = resolve(releaseArg);
  const target = resolve(BKS_ROOT, arg("--target", "schema/pinned"));
  const { errors, release, releaseBytes, bytes, schemaReleaseDigest } = verifyReleaseDir(releaseDir);
  if (errors.length) {
    console.error(JSON.stringify({ ok: false, releaseDir, errors }, null, 2));
    process.exit(1);
  }
  const git = gitState(releaseDir);
  const workspaceRoot = resolve(BKS_ROOT, "..");
  const files = { "release.json": { sha256: sha256Hex(releaseBytes), bytes: releaseBytes.length } };
  for (const [p, b] of [...bytes.entries()].sort(([a], [c]) => (a < c ? -1 : a > c ? 1 : 0))) files[p] = { sha256: sha256Hex(b), bytes: b.length };
  const previousPinPath = resolve(target, "PIN.json");
  const previous = existsSync(previousPinPath) ? JSON.parse(readFileSync(previousPinPath, "utf8")) : null;
  const previousPin = previous?.pinFormat === "bks-pin.v2"
    ? previous.releaseId === release.releaseId
      ? previous.provenance?.previousPin ?? null
      : { pinFormat: "bks-pin.v2", releaseId: previous.releaseId, schemaReleaseDigest: previous.schemaReleaseDigest, schemaDigest: previous.schemaDigest, pinnedAt: previous.pinnedAt, sourcePath: previous.sourcePath, previousPin: previous.provenance?.previousPin ?? null }
    : previous
      ? { pinFormat: "v1 (unversioned)", pinnedAt: previous.pinnedAt, sourceRun: previous.sourceRun, catalogVersion: previous.catalogVersion, files: previous.files, removedBy: "scripts/release/pin.mjs (retained in Git history)" }
      : null;
  const pin = {
    pinFormat: "bks-pin.v2",
    releaseId: release.releaseId,
    schemaReleaseDigest,
    schemaDigest: release.identities.schemaDigest,
    queryCatalogDigest: release.identities.queryCatalogDigest,
    ddlDigest: release.identities.ddlDigest,
    validationParamsDigest: release.identities.validationParamsDigest,
    decisionLedgerDigest: release.identities.decisionLedgerDigest,
    contentTreeDigest: release.identities.contentTreeDigest,
    sourcePath: relative(workspaceRoot, releaseDir).split(sep).join("/"),
    // v2.1.0+ (SV-D10): releases authored in this repository name it; v2.0.x releases keep the biotech-meta form.
    sourceRevision: release.sourceRevision.sourceRepository
      ? {
          sourceRepository: release.sourceRevision.sourceRepository,
          sourcePath: release.sourceRevision.sourcePath,
          source: git.clean && git.head ? git.head : release.sourceRevision.dirtySnapshotDigest,
          sourceHead: git.head,
          sourceReleaseDirClean: git.clean,
          bksCommit: release.sourceRevision.bksCommit,
        }
      : {
          biotechMeta: git.clean && git.head ? git.head : release.sourceRevision.dirtySnapshotDigest,
          biotechMetaHead: git.head,
          biotechMetaReleaseDirClean: git.clean,
          bksCommit: release.sourceRevision.bksCommit,
        },
    pinnedAt: arg("--pinned-at", new Date().toISOString().slice(0, 10)),
    root: "release",
    sdlKey: "sdl/assembled.graphql",
    releaseKey: "release.json",
    excludedFromFrozenDigestSet: Object.keys(release.excludedFromFrozenDigestSet ?? {}),
    files,
    provenance: {
      tool: "scripts/release/pin.mjs",
      toolSha256: sha256Hex(readFileSync(new URL(import.meta.url))),
      command: `pnpm schema:pin -- --release ${relative(BKS_ROOT, releaseDir).split(sep).join("/")}`,
      verified: "every release file sha256/bytes, identities, content-tree digest, no unlisted file",
      previousPin,
    },
  };
  const pinText = orderedJson(pin);
  if (flag("--check")) {
    const current = existsSync(previousPinPath) ? readFileSync(previousPinPath, "utf8") : "";
    // The release binding (identities, source, files) must match; pinnedAt and tool provenance may differ.
    const binding = (p) => (p ? canonicalJson({ releaseId: p.releaseId, schemaReleaseDigest: p.schemaReleaseDigest, schemaDigest: p.schemaDigest, sourcePath: p.sourcePath, root: p.root, sdlKey: p.sdlKey, files: p.files }) : "");
    const same = binding(current ? JSON.parse(current) : null) === binding(pin);
    console.log(JSON.stringify({ ok: same, schemaReleaseDigest, pinned: previous?.schemaReleaseDigest ?? null }, null, 2));
    process.exit(same ? 0 : 1);
  }
  replaceDirAtomically(target, (staging) => {
    for (const [p, b] of [["release.json", releaseBytes], ...bytes.entries()]) {
      const abs = resolve(staging, "release", p);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, b);
    }
    writeFileSync(resolve(staging, "PIN.json"), pinText);
    writeFileSync(resolve(staging, "README.md"), `# schema/pinned\n\nGenerated by \`pnpm schema:pin -- --release <dir>\` (scripts/release/pin.mjs). Never edit by hand.\n\n- \`PIN.json\` (bks-pin.v2): release ${pin.releaseId}, schemaReleaseDigest \`${schemaReleaseDigest}\`, schemaDigest \`${pin.schemaDigest}\`, source \`${pin.sourcePath}\`.\n- \`release/**\`: byte mirror of the source release bundle; every byte is verified on load (\`loadRelease()\`, @bks/schema-workspace).\n`);
  });
  console.log(JSON.stringify({ ok: true, target, releaseId: pin.releaseId, schemaReleaseDigest, schemaDigest: pin.schemaDigest, files: Object.keys(files).length, sourceRevision: pin.sourceRevision }, null, 2));
}
