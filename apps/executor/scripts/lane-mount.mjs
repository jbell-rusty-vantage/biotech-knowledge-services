#!/usr/bin/env node
// Read-only, digest-bound workspace/context mount manifest for agent lanes (S7, IMPLEMENTATION S7 bullet 4).
// A lane materializer mounts exactly these paths read-only and refuses the mount when any recomputed tree digest
// differs. Nothing secret is mounted: no .env, no runs/ custody, no credentials; lanes reach the executor with a
// short-lived scoped service token injected host-side (see `serviceAccess`), never a database password.
//
//   pnpm build && node apps/executor/scripts/lane-mount.mjs write    # apps/executor/lanes/workspace-mount.json
//   node apps/executor/scripts/lane-mount.mjs check                  # exit 1 when any mounted tree drifted
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalDigest, rawBytesDigest } from "@bks/contracts";
import { loadRelease, repoRoot } from "@bks/schema-workspace";
import { DOMAIN_SKILLS, treeDigest } from "../dist/modules/capability.js";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "..", "lanes", "workspace-mount.json");

function build() {
  const release = loadRelease();
  const manifest = JSON.parse(readFileSync(resolve(repoRoot, "workspace", "manifest.json"), "utf8"));
  const tree = (path, kind, extra = {}) => {
    const t = treeDigest(resolve(repoRoot, path));
    if (!t) throw new Error(`mount path ${path} is missing`);
    return { path, kind, access: "read-only", digest: t.digest, files: t.files, ...extra };
  };
  const file = (path, kind) => ({ path, kind, access: "read-only", digest: rawBytesDigest(readFileSync(resolve(repoRoot, path))), files: 1 });
  const mounts = [
    tree("workspace", "schema-workspace", { workspaceFingerprint: manifest.workspaceFingerprint ?? null }),
    tree("schema/pinned", "schema-release-pin", { releaseId: release.pin?.releaseId ?? null, schemaReleaseDigest: release.schemaReleaseDigest }),
    tree("packages/contracts/json-schema", "contract-schemas"),
    tree("packages/contracts/golden", "contract-golden-vectors"),
    ...DOMAIN_SKILLS.map((s) => tree(`.agents/skills/${s}`, "skill-bundle")),
    file(".agents/skills/skill-routing.json", "skill-routing"),
  ];
  const body = {
    format: "belllabs.lane-workspace-mount.v1",
    application: "biotech",
    repository: "biotech/biotech-knowledge-services",
    mode: "read-only",
    digestAlgorithm: "tree: bks-canonical-json.v2 digest of the sorted [{path, sha256}] list; file: sha256 of bytes",
    release: { releaseId: release.pin?.releaseId ?? null, schemaReleaseDigest: release.schemaReleaseDigest },
    mounts,
    excluded: [".env", ".env.*", "runs/**", "schema/program/**", "**/node_modules/**", "**/dist/**", "python/**/.venv/**"],
    serviceAccess: {
      endpointEnv: "BIOTECH_EXECUTOR_URL",
      tokenEnv: "BIOTECH_EXECUTOR_TOKEN",
      token: "short-lived, scoped service token minted host-side per lane activation (reader for schema/read lanes, writer only for an admitted ingestion operation); it maps to one BKS_EXECUTOR_TOKENS principal by sha256 and is revoked with the activation",
      forbidden: ["database passwords (NEO4J_*)", "Supabase secret or signed URLs", "witness signing keys", "admission ledger", "custody roots"],
      writes: "never direct: plan/apply only through the executor with a witness from the domain admission service",
    },
  };
  return { ...body, fingerprint: canonicalDigest(body) };
}

const manifest = build();
const text = `${JSON.stringify(manifest, null, 2)}\n`;
if ((process.argv[2] ?? "check") === "write") {
  writeFileSync(out, text);
  console.log(`wrote ${out} ${manifest.fingerprint}`);
} else {
  let current = "";
  try { current = readFileSync(out, "utf8"); } catch { /* missing */ }
  if (current !== text) {
    const prev = current ? JSON.parse(current) : { mounts: [] };
    const drift = manifest.mounts.filter((m) => prev.mounts.find((p) => p.path === m.path)?.digest !== m.digest).map((m) => m.path);
    console.error(`lane mount drift (${drift.join(", ") || "manifest"}); regenerate: node apps/executor/scripts/lane-mount.mjs write`);
    process.exit(1);
  }
  console.log(`lane mount current ${manifest.fingerprint}`);
}
