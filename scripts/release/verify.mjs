#!/usr/bin/env node
/**
 * Verifies a release directory against its release.json (every file digest, identities, content-tree digest, no
 * unlisted file) and prints its identities. Read-only.
 *   node scripts/release/verify.mjs [--release <dir>]
 */
import { resolve } from "node:path";
import { arg, CURRENT_RELEASE_DIR } from "./lib/common.mjs";
import { verifyReleaseDir } from "./pin.mjs";

const dir = resolve(arg("--release", CURRENT_RELEASE_DIR));
const { errors, release, schemaReleaseDigest } = verifyReleaseDir(dir);
console.log(JSON.stringify({ ok: errors.length === 0, dir, releaseId: release?.releaseId, schemaReleaseDigest, identities: release?.identities, files: release ? Object.keys(release.files).length : 0, excluded: release ? Object.keys(release.excludedFromFrozenDigestSet ?? {}) : [], errors }, null, 2));
process.exit(errors.length ? 1 : 0);
