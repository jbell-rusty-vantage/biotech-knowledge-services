/**
 * mc.knowledge_request.v1 (S7): contract shape, wrapper/native digest separation, byte preservation, golden vectors
 * shared with the Python ports (biotech_knowledge_client.envelope and the Mission Control Biotech adapter), and the
 * committed JSON Schema exports.
 *
 * Regenerate the golden file and the JSON Schemas after an intentional contract change:
 *   BKS_WRITE_ENVELOPE_GOLDEN=1 pnpm exec vitest run --project contracts src/envelope.test.ts
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { canonicalize, rawBytesDigest } from "./canonical.js";
import {
  DELIVERY_STATES,
  deliveryStateOfBiotechOutcome,
  envelopeCanonical,
  envelopeDigest,
  KNOWLEDGE_DELIVERY_V1,
  KNOWLEDGE_OPERATIONS,
  KNOWLEDGE_REQUEST_V1,
  KnowledgeDelivery,
  KnowledgeRequestEnvelope,
  payloadBinding,
  verifyEnvelopePayload,
} from "./envelope.js";

const here = dirname(fileURLToPath(import.meta.url));
const GOLDEN = resolve(here, "..", "golden", "knowledge-request-envelope.v1.json");
const SCHEMA_DIR = resolve(here, "..", "json-schema");
const WRITE = process.env.BKS_WRITE_ENVELOPE_GOLDEN === "1";
const D = (c: string) => `sha256:${c.repeat(64).slice(0, 64)}`;
const RELEASE = "sha256:c0dd7837df029695e26f00d99f482483fb715e1cbcd4c4c4b1d8e3d31d6d3b06";

/** Native payload bytes deliberately NOT in canonical form: indentation, key order, non-ASCII, a decomposed accent. */
const PAYLOAD_TEXT = `{\n  "schemaVersion": "biotech-knowledge-intent.v2",\n  "intentId": "s7-golden",\n  "notes": "Café vs Café — \u{1F9EA} stays exactly as sent",\n  "context": {"run": {"system": "bks-native", "runId": "native-run-1"}, "activityKind": "INGESTION"}\n}\n`;
const PAYLOAD = Buffer.from(PAYLOAD_TEXT, "utf8");

function baseEnvelope(over: { mission?: boolean; operation?: (typeof KNOWLEDGE_OPERATIONS)[number] } = {}) {
  const op = over.operation ?? "knowledge.ingestion_plan";
  const mission = over.mission ?? false;
  return {
    schemaVersion: KNOWLEDGE_REQUEST_V1,
    identity: {
      requestId: mission ? "mc-req-0001" : "native-req-0001",
      installationId: "00000000-0000-7000-8000-000000000001",
      applicationId: "biotech",
      tenantId: "00000000-0000-7000-8000-0000000000aa",
      correlationId: "corr-1",
      mission: mission ? { missionId: "mission-1", runId: "run-1", activationId: "act-1", attempt: 1 } : null,
      nativeRun: mission ? { system: "mission-control", runId: "run-1" } : { system: "bks-native", runId: "native-run-1" },
      generation: 0,
      effectKey: op === "knowledge.ingestion_apply" || op === "knowledge.receipt_get" ? "ek-s7-golden-1" : null,
    },
    target: {
      capabilityBinding: { bindingId: "biotech-knowledge-services", revision: 1, digest: D("b") },
      audience: "bks-executor",
      operation: op,
      nativeOperation: op === "knowledge.ingestion_apply" ? "POST /kg/apply" : op === "knowledge.receipt_get" ? "GET /kg/receipt" : "POST /kg/plan",
      executorVersion: "0.2.0",
      schemaReleaseDigest: RELEASE,
    },
    input: {
      nativeContract: { name: "biotech-knowledge-intent", version: "v2" },
      payloadRef: `mc-artifact:${rawBytesDigest(PAYLOAD)}`,
      ...payloadBinding(PAYLOAD),
      mediaType: "application/json",
      canonicalization: "bks-canonical-json.v2",
      nativeDigest: null,
      upstreamRefs: [{ kind: "sealed-verification", ref: "ver-1", digest: D("c") }],
    },
    authority: { actor: { kind: "agent", id: "agent-é" }, requestedScopes: ["knowledge.write"], admissionRef: mission ? "mc-admission-1" : null, grantRef: "grant-1" },
    preconditions: {
      releasePins: { schemaReleaseDigest: RELEASE, policyVersion: "bks-admission-policy/v1", workspaceFingerprint: null },
      snapshotRef: null,
      graphRevision: 7,
      planRef: op === "knowledge.ingestion_apply" ? "pl-0123456789abcdef0123456789abcdef01234567" : null,
      expectedPlanDigest: op === "knowledge.ingestion_apply" ? D("d") : null,
      approvalRefs: [],
    },
    governors: { reservationRef: mission ? "res-1" : null, deadline: "2026-10-12T00:00:30Z", timeoutMs: 30000, maxItems: 500, partialPolicy: "all" },
  };
}

function buildGolden() {
  const vectors = [
    { id: "standalone-plan", envelope: baseEnvelope() },
    { id: "mission-plan", envelope: baseEnvelope({ mission: true }) },
    { id: "mission-apply", envelope: baseEnvelope({ mission: true, operation: "knowledge.ingestion_apply" }) },
    { id: "standalone-receipt-get", envelope: baseEnvelope({ operation: "knowledge.receipt_get" }) },
  ].map((v) => ({ ...v, canonical: envelopeCanonical(v.envelope), envelopeDigest: envelopeDigest(v.envelope) }));
  const standalone = baseEnvelope();
  const invalid = [
    { id: "standalone-claims-mission-control", envelope: { ...standalone, identity: { ...standalone.identity, nativeRun: { system: "mission-control", runId: "x" } } } },
    { id: "apply-without-effect-key", envelope: (() => { const e = baseEnvelope({ mission: true, operation: "knowledge.ingestion_apply" }); return { ...e, identity: { ...e.identity, effectKey: null } }; })() },
    { id: "missing-member", envelope: (() => { const { correlationId: _c, ...identity } = standalone.identity; return { ...standalone, identity }; })() },
    { id: "float-number", envelope: { ...standalone, governors: { ...standalone.governors, timeoutMs: 1.5 } } },
    { id: "non-canonical-deadline", envelope: { ...standalone, governors: { ...standalone.governors, deadline: "2026-10-12T02:00:30+02:00" } } },
    { id: "unknown-member", envelope: { ...standalone, extra: true } },
  ];
  const outcomes = [
    ["applied", null, "applied"], ["partial", null, "applied"], ["noop", null, "applied"], ["duplicate", null, "applied"],
    ["rejected", null, "rejected"], ["failed", "BKS_WITNESS_EXPIRED", "pending"], ["failed", "BKS_AUTHORITY_UNAVAILABLE", "pending"],
    ["failed", "BKS_STALE_REVISION", "rejected"], ["failed", "BKS_WITNESS_REVOKED", "rejected"], ["unresolved", "BKS_EFFECT_UNRESOLVED", "unresolved"],
  ].map(([outcome, failureCode, delivery]) => ({ outcome, failureCode, delivery }));
  return {
    format: "bks-envelope-golden.v1",
    contract: KNOWLEDGE_REQUEST_V1,
    canonicalization: "bks-canonical-json.v2",
    note: "Generated by packages/contracts/src/envelope.test.ts (BKS_WRITE_ENVELOPE_GOLDEN=1). Run by the Python ports.",
    payload: { base64: PAYLOAD.toString("base64"), payloadDigest: rawBytesDigest(PAYLOAD), payloadBytes: PAYLOAD.byteLength },
    vectors,
    invalid: invalid.map((v) => ({ id: v.id, envelope: v.envelope })),
    deliveryMapping: outcomes,
    deliveryStates: [...DELIVERY_STATES],
    operations: [...KNOWLEDGE_OPERATIONS],
  };
}

const jsonSchemaOf = (name: string, schema: z.ZodType) => ({ $id: `https://belllabs.dev/contracts/${name}.json`, title: name, ...z.toJSONSchema(schema, { target: "draft-2020-12", io: "input", unrepresentable: "any" }) });
const SCHEMAS: Record<string, z.ZodType> = { [KNOWLEDGE_REQUEST_V1]: KnowledgeRequestEnvelope, [KNOWLEDGE_DELIVERY_V1]: KnowledgeDelivery };

describe("mc.knowledge_request.v1 envelope (S7)", () => {
  it("golden vectors and JSON Schemas are current (regenerate with BKS_WRITE_ENVELOPE_GOLDEN=1)", () => {
    const golden = buildGolden();
    const text = `${JSON.stringify(golden, null, 2)}\n`;
    if (WRITE) {
      writeFileSync(GOLDEN, text);
      for (const [name, schema] of Object.entries(SCHEMAS)) writeFileSync(resolve(SCHEMA_DIR, `${name}.json`), `${JSON.stringify(jsonSchemaOf(name, schema), null, 2)}\n`);
    }
    expect(existsSync(GOLDEN)).toBe(true);
    expect(readFileSync(GOLDEN, "utf8")).toBe(text);
    for (const [name, schema] of Object.entries(SCHEMAS)) expect(readFileSync(resolve(SCHEMA_DIR, `${name}.json`), "utf8")).toBe(`${JSON.stringify(jsonSchemaOf(name, schema), null, 2)}\n`);
  });

  it("keeps wrapper, raw payload and native digests separate; payload bytes are bound exactly", () => {
    const env = KnowledgeRequestEnvelope.parse(baseEnvelope({ mission: true, operation: "knowledge.ingestion_apply" }));
    expect(env.input.payloadDigest).toBe(rawBytesDigest(PAYLOAD));
    expect(envelopeDigest(env)).not.toBe(env.input.payloadDigest);
    expect(verifyEnvelopePayload(env, PAYLOAD)).toBe(true);
    // One changed byte (the decomposed accent normalized to NFC) is a different payload.
    const nfc = Buffer.from(PAYLOAD_TEXT.normalize("NFC"), "utf8");
    expect(nfc.equals(PAYLOAD)).toBe(false);
    expect(verifyEnvelopePayload(env, nfc)).toBe(false);
    // The native digest is recorded, never derived from the wrapper canonicalization.
    const withNative = { ...env, input: { ...env.input, nativeDigest: D("e") } };
    expect(envelopeDigest(withNative)).not.toBe(envelopeDigest(env));
    // Canonical text keeps non-ASCII and the decomposed form literally (no NFC).
    expect(envelopeCanonical(env)).toContain("agent-é");
  });

  it("refuses ambiguous identity, effects without keys, missing members, floats and unknown members", () => {
    for (const v of buildGolden().invalid) expect(KnowledgeRequestEnvelope.safeParse(v.envelope).success, v.id).toBe(false);
  });

  it("standalone requests carry a native run namespace and no mission; mission requests bind the run", () => {
    const s = KnowledgeRequestEnvelope.parse(baseEnvelope());
    expect(s.identity.mission).toBeNull();
    expect(s.identity.nativeRun.system).not.toBe("mission-control");
    const m = KnowledgeRequestEnvelope.parse(baseEnvelope({ mission: true }));
    expect(m.identity.nativeRun).toEqual({ system: "mission-control", runId: m.identity.mission!.runId });
  });

  it("maps every Biotech receipt outcome to one delivery state; verification completion is a separate field", () => {
    for (const row of buildGolden().deliveryMapping) expect(deliveryStateOfBiotechOutcome(row.outcome!, row.failureCode)).toBe(row.delivery);
    expect(() => deliveryStateOfBiotechOutcome("succeeded")).toThrow();
    const held = KnowledgeDelivery.parse({ schemaVersion: KNOWLEDGE_DELIVERY_V1, requestId: "r-1", envelopeDigest: D("a"), payloadDigest: D("b"), nativeDigest: D("c"), effectKey: "ek-1", delivery: "pending", verification: "completed", nativeOutcome: null, nativeReceipt: null, heldItems: ["adj-1"], reason: "graph admission held" });
    expect(held.delivery).toBe("pending");
    expect(held.verification).toBe("completed");
  });

  it("canonical text equals the envelope's JCS form (sorted keys, no whitespace)", () => {
    const env = KnowledgeRequestEnvelope.parse(baseEnvelope());
    const jcs = (v: unknown): string => (Array.isArray(v) ? `[${v.map(jcs).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${jcs((v as Record<string, unknown>)[k])}`).join(",")}}` : JSON.stringify(v));
    expect(canonicalize(env)).toBe(jcs(env));
  });
});
