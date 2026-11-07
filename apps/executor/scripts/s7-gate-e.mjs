#!/usr/bin/env node
// Gate E (S7) orchestrator: real executor process + disposable local Neo4j + Mission Control's Biotech adapter.
//
//   BKS_NEO4J_TEST_CONTAINER=bks-neo4j-s7 BKS_NEO4J_TEST_BOLT_PORT=7704 BKS_NEO4J_TEST_HTTP_PORT=7504 bash scripts/neo4j-test.sh up
//   pnpm build
//   NEO4J_TEST_URI=bolt://127.0.0.1:7704 NEO4J_TEST_PASSWORD=bks-test-password node apps/executor/scripts/s7-gate-e.mjs
//
// 1. refuses any non-local Neo4j; resets the disposable graph; applies release DDL + fences + release marker;
// 2. creates a run directory under runs/release-v2/custody/s7/ (gitignored) with disposable Ed25519 keys (admission
//    issuer, Knowledge Services verifier), service tokens (only their sha256 reaches the executor), the grant registry
//    (Mission Control grant authority stand-in), the verification-state file and the admission ledger;
// 3. starts apps/executor/dist/index.js with cwd = the run directory (no .env is loaded) and an explicit environment;
// 4. runs the Python proof in platform/mission-control (prove_biotech_knowledge_boundary);
// 5. re-verifies, in TypeScript, the wrapped records the Python side produced (envelope digest, raw payload digest,
//    native intent digest = executor-reported digest);
// 6. stops the executor and writes evidence.json (rows from both sides).
import { randomBytes, createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { IngestionIntentV2, rawBytesDigest } from "@bks/contracts";
import { ensureOperationalState, generateWitnessKeyPair, GraphClient, installReleaseMarker, intentDigestOf, writeSchema } from "@bks/kg-ops";
import { envelopeDigest, KnowledgeRequestEnvelope } from "../../../packages/contracts/dist/envelope.js";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..", "..", "..");
const mcRepo = resolve(repo, "..", "..", "platform", "mission-control");
const URI = process.env.NEO4J_TEST_URI ?? "bolt://127.0.0.1:7704";
const PASSWORD = process.env.NEO4J_TEST_PASSWORD ?? "bks-test-password";
const PORT = Number(process.env.S7_EXECUTOR_PORT ?? 4127);
const host = new URL(URI.replace(/^(bolt|neo4j)(\+s|\+ssc)?:/, "http:")).hostname;
if (!["127.0.0.1", "localhost", "::1"].includes(host)) throw new Error(`refusing non-local Neo4j ${URI}`);

const stamp = `ge${Date.now().toString(36)}`;
const runDir = resolve(repo, "runs", "release-v2", "custody", "s7", `gate-e-${stamp}`);
for (const d of ["keys", "custody", "admission", "out"]) mkdirSync(resolve(runDir, d), { recursive: true });
const started = new Date().toISOString();
const log = (m) => console.log(`[s7-gate-e] ${m}`);

// --- keys, tokens, grants (disposable; under runs/, gitignored) ---
const admissionKey = generateWitnessKeyPair("s7-admission");
const verifierKey = generateWitnessKeyPair("s7-ks-verifier");
writeFileSync(resolve(runDir, "keys", "verifier.json"), JSON.stringify({ kid: verifierKey.kid, publicKeyDer: verifierKey.publicKeyDer, privateKeyDer: verifierKey.privateKeyDer }));
const scope = { installationId: "s7-gate-e-installation", applicationId: "biotech", tenantId: "s7-tenant" };
const tok = () => randomBytes(24).toString("hex");
const tokens = { writer: tok(), verifier: tok(), admin: tok(), reader: tok() };
const sha = (t) => createHash("sha256").update(t).digest("hex");
const tokenEntries = [
  { tokenSha256: sha(tokens.writer), role: "writer", principalId: "mc-biotech-adapter", ...scope, grants: [] },
  { tokenSha256: sha(tokens.verifier), role: "writer", principalId: "ks-verifier", ...scope, grants: ["adjudication.deliver"] },
  { tokenSha256: sha(tokens.admin), role: "admin", principalId: "s7-ops", ...scope, grants: [] },
  { tokenSha256: sha(tokens.reader), role: "reader", principalId: "s7-serving", ...scope, grants: [] },
];
writeFileSync(resolve(runDir, "keys", "tokens.json"), JSON.stringify(tokens));
const grants = { mission: `grant-mission-${stamp}`, standalone: `grant-standalone-${stamp}`, verifier: `grant-verifier-${stamp}` };
const grantsPath = resolve(runDir, "grants.json");
writeFileSync(grantsPath, `${JSON.stringify({ format: "bks-grant-registry.v1", decisionVersion: "mc-grants/s7-gate-e", grants: [
  { grantRef: grants.mission, ...scope, principalId: "mc-biotech-adapter", operations: ["knowledge.ingestion_apply"], effectKeyPrefix: "mc/" },
  { grantRef: grants.standalone, ...scope, principalId: "mc-biotech-adapter", operations: ["knowledge.ingestion_apply"], effectKeyPrefix: "bks-native/" },
  { grantRef: grants.verifier, ...scope, principalId: "ks-verifier", operations: ["knowledge.ingestion_apply"] },
] }, null, 2)}\n`);
const statePath = resolve(runDir, "verification-state.json");
writeFileSync(statePath, `${JSON.stringify({ format: "ks-verification-state.v1", results: [] }, null, 2)}\n`);

// --- disposable graph ---
const schema = writeSchema();
const client = new GraphClient({ uri: URI, username: "neo4j", password: PASSWORD, database: "neo4j" });
await client.verify();
await client.write((tx) => tx.run("MATCH (n) DETACH DELETE n"));
const ops = await ensureOperationalState(client, schema);
await installReleaseMarker(client, { releaseId: schema.releaseId, schemaReleaseDigest: schema.schemaReleaseDigest }, `s7-gate-e-${stamp}`);
await client.close();
log(`graph ready (${ops.enterprise ? "enterprise" : "community"}, release ${schema.releaseId})`);

// --- executor process (cwd = run dir: no .env) ---
const env = {
  PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, TEMP: process.env.TEMP, TMP: process.env.TMP,
  BKS_BIOTECH_GRAPH_URI: URI, BKS_BIOTECH_GRAPH_USERNAME: "neo4j", BKS_BIOTECH_GRAPH_PASSWORD: PASSWORD, BKS_BIOTECH_GRAPH_DATABASE: "neo4j",
  EXECUTOR_PORT: String(PORT),
  BKS_EXECUTOR_TOKENS: JSON.stringify(tokenEntries),
  BKS_WITNESS_ISSUER_KEYS: `${admissionKey.kid}:${admissionKey.publicKeyDer}`,
  BKS_WITNESS_SIGNING_KEY: `${admissionKey.kid}:${admissionKey.privateKeyDer}`,
  BKS_WITNESS_ISSUER: "bks-admission-s7",
  BKS_ADMISSION_ENABLED: "1",
  BKS_ADMISSION_GRANT_SOURCE: `file:${grantsPath}`,
  BKS_ADMISSION_LEDGER: resolve(runDir, "admission", "ledger.json"),
  BKS_ADMISSION_LEDGER_CREATE: "1",
  BKS_ADMISSION_VERIFICATION_STATE: `file:${statePath}`,
  BKS_VERIFIER_ISSUER_KEYS: `${verifierKey.kid}:${verifierKey.publicKeyDer}`,
  BKS_RELEASE_RUNS_DIR: resolve(runDir, "custody"),
  BKS_DISABLE_READ_V1: "1",
};
const execLog = resolve(runDir, "executor.log");
const child = spawn(process.execPath, [resolve(repo, "apps", "executor", "dist", "index.js")], { cwd: runDir, env, stdio: ["ignore", "pipe", "pipe"] });
const logChunks = [];
child.stdout.on("data", (d) => logChunks.push(String(d)));
child.stderr.on("data", (d) => logChunks.push(String(d)));
const url = `http://127.0.0.1:${PORT}`;
for (let i = 0; ; i++) {
  try {
    if ((await fetch(`${url}/healthz`)).ok) break;
  } catch { /* starting */ }
  if (i > 120) throw new Error(`executor did not start: ${logChunks.join("").slice(-2000)}`);
  await new Promise((r) => setTimeout(r, 500));
}
log(`executor up at ${url}`);

const config = {
  stamp, executorUrl: url, tokens, scope, grants, grantsPath, releaseDigest: schema.schemaReleaseDigest,
  neo4j: { uri: URI, username: "neo4j", password: PASSWORD },
  descriptorPath: resolve(repo, "apps", "executor", "capabilities", "biotech-knowledge.capability.json"),
  ledgerPath: resolve(runDir, "mc-effect-ledger.jsonl"),
  outDir: resolve(runDir, "out"),
  sealCommand: [process.execPath, resolve(here, "s7-seal-verification.mjs"), "--run", runDir],
};
const configPath = resolve(runDir, "proof-config.json");
writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

// --- Mission Control side ---
const pyCommand = ["uv", "run", "--group", "biotech", "python", "-m", "biotech_mission_adapters.bootstrap.scripts.prove_biotech_knowledge_boundary", "--config", configPath];
log(`running ${pyCommand.slice(0, 7).join(" ")} (cwd ${mcRepo})`);
const py = spawnSync(pyCommand[0], pyCommand.slice(1), { cwd: mcRepo, stdio: "inherit", shell: process.platform === "win32", env: { ...process.env, PYTHONUTF8: "1" }, timeout: 1_800_000 });

// --- TypeScript recheck of the Python-produced wrapped records ---
const tsRows = [];
const wrappedDir = resolve(runDir, "out", "wrapped");
for (const f of existsSync(wrappedDir) ? readdirSync(wrappedDir).sort() : []) {
  const rec = JSON.parse(readFileSync(resolve(wrappedDir, f), "utf8"));
  const bytes = Buffer.from(rec.payloadBase64, "base64");
  const env2 = KnowledgeRequestEnvelope.parse(rec.envelope);
  const tsEnvelopeDigest = envelopeDigest(rec.envelope);
  const tsPayloadDigest = rawBytesDigest(bytes);
  const tsIntentDigest = intentDigestOf(IngestionIntentV2.parse(JSON.parse(bytes.toString("utf8"))));
  const ok = tsEnvelopeDigest === rec.envelopeDigest && tsPayloadDigest === env2.input.payloadDigest && bytes.byteLength === env2.input.payloadBytes && tsIntentDigest === rec.nativeDigestReportedByExecutor;
  tsRows.push({ file: f, ok, pythonEnvelopeDigest: rec.envelopeDigest, tsEnvelopeDigest, payloadDigest: env2.input.payloadDigest, tsPayloadDigest, executorNativeDigest: rec.nativeDigestReportedByExecutor, tsIntentDigest });
}

child.kill();
writeFileSync(execLog, logChunks.join(""));
const pyEvidence = existsSync(resolve(runDir, "out", "evidence-python.json")) ? JSON.parse(readFileSync(resolve(runDir, "out", "evidence-python.json"), "utf8")) : null;
const rows = [...(pyEvidence?.rows ?? []), {
  id: "E3-ts",
  scenario: "native payload bytes and digests preserved across the wrapper (TypeScript recheck of the Python records)",
  timestamp: new Date().toISOString(),
  result: tsRows.length >= 3 && tsRows.every((r) => r.ok) ? "pass" : "fail",
  details: tsRows,
}];
const evidence = {
  format: "s7-gate-e-evidence.v1",
  stamp, startedAt: started, finishedAt: new Date().toISOString(),
  environment: { neo4j: URI, edition: ops.enterprise ? "enterprise" : "community", executor: url, executorVersion: pyEvidence?.environment?.executorVersion ?? null, releaseId: schema.releaseId, schemaReleaseDigest: schema.schemaReleaseDigest, node: process.version, pythonExit: py.status },
  commands: { orchestrator: "node apps/executor/scripts/s7-gate-e.mjs", python: pyCommand.join(" ").replace(configPath, "<run>/proof-config.json") },
  rows: rows.map((r) => ({ ...r, evidencePath: `runs/release-v2/custody/s7/gate-e-${stamp}/evidence.json` })),
};
writeFileSync(resolve(runDir, "evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`);
const failed = rows.filter((r) => r.result !== "pass").map((r) => r.id);
log(`${rows.length - failed.length}/${rows.length} rows pass ${failed.length ? `(failed: ${failed.join(", ")})` : ""}; evidence ${resolve(runDir, "evidence.json")}`);
process.exit(failed.length ? 1 : 0);
