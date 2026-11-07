#!/usr/bin/env node
// Gate E helper (S7): plays the Knowledge Services verifier for a disposable proof run. Seals a verification result
// for an existing assertion with the run's verifier key, stores it in the executor's verification custody and marks it
// `completed` in the Knowledge Services verification-state file the admission service consults.
//
//   node apps/executor/scripts/s7-seal-verification.mjs --run <run dir> --assertion <uid> --ref <ref>
// Prints {ref, digest} as the last stdout line. Synthetic proof data only.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createPrivateKey } from "node:crypto";
import { FileVerificationCustody } from "@bks/kg-ops";
import { sealVerification } from "../../../packages/kg-ops/dist/write/test-support.js";

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  if (i < 0 || !process.argv[i + 1]) throw new Error(`--${name} is required`);
  return process.argv[i + 1];
};
const run = arg("run");
const assertionUid = arg("assertion");
const ref = arg("ref");
const keys = JSON.parse(readFileSync(resolve(run, "keys", "verifier.json"), "utf8"));
const key = createPrivateKey({ key: Buffer.from(keys.privateKeyDer, "base64"), format: "der", type: "pkcs8" });
const custody = new FileVerificationCustody(resolve(run, "custody", "custody", "verifications"), new Map([[keys.kid, keys.publicKeyDer]]));
const body = {
  format: "bks-sealed-verification.v1",
  ref,
  issuer: "ks-verification",
  judgmentId: `${ref}-j`,
  assertionUid,
  adjudicationKind: "CAPTURE_FIDELITY",
  verdict: "DIRECTLY_SUPPORTED",
  policyOutcome: "PASS",
  judgeKind: "DETERMINISTIC",
  methodVersion: "s7-gate-e/1",
  properties: { attributionFaithfulness: "SATISFIED" },
  unsupportedFacets: [],
  evidence: [],
  run: { system: "ks-verification", runId: `ver-${ref}` },
  policy: { toolRenditionException: false },
  sealedAt: new Date().toISOString(),
};
const stored = await custody.put(sealVerification(body, { kid: keys.kid, key }));
const statePath = resolve(run, "verification-state.json");
const state = JSON.parse(readFileSync(statePath, "utf8"));
state.results.push({ ref: stored.ref, digest: stored.digest, state: "completed" });
writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
console.log(JSON.stringify(stored));
