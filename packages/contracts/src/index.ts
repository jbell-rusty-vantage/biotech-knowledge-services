export * from "./common.js";
export * from "./digest.js";
export * from "./canonical.js";
export * from "./errors.js";
export * from "./workspace.js";
export * from "./read.js";
export * from "./cypher.js";
export * from "./ingest.js";
export * from "./intent-v2.js";
export * from "./plan-v2.js";
export * from "./apply-v2.js";
export * from "./custody.js";
export * from "./envelope.js";
export * from "./read-v2.js";
export * from "./admission.js";

/** Contract versions served by this release. v1 strings stay decodable (see ingest.ts / read.ts / digest.ts). */
export const CONTRACT_VERSIONS = {
  workspace: "bks-schema-workspace.v2",
  schemaContext: "biotech-schema-context.v1",
  schemaCard: "bks-schema-card.v1",
  schemaSlice: "bks-schema-slice.v2",
  readIntent: "biotech-knowledge-read-intent.v2",
  cypherReadIntent: "biotech-cypher-read-intent.v1",
  readResult: "biotech-knowledge-read-result.v2",
  readExplain: "biotech-cypher-read-explain.v1",
  readValues: "bks-read-values.v1",
  ingestionIntent: "biotech-knowledge-intent.v2",
  ingestionPlan: "biotech-knowledge-plan.v2",
  applyRequest: "biotech-knowledge-apply.v2",
  ingestionReceipt: "biotech-knowledge-receipt.v2",
  applyWitness: "bks-apply-witness.v1",
  canonicalJson: "bks-canonical-json.v2",
  custodySnapshot: "bks-custody-snapshot.v1",
  sealedVerification: "bks-sealed-verification.v1",
  effectVerification: "bks-effect-verification.v1",
  cypherRequest: "biotech-cypher-request.v1",
  knowledgeRequest: "mc.knowledge_request.v1",
  knowledgeDelivery: "mc.knowledge_delivery.v1",
  readIntentOfficial: "biotech-knowledge-read-intent.v3",
  readResultOfficial: "biotech-knowledge-read-result.v3",
  admissionDispatch: "biotech-knowledge-admission.v1",
  admissionAck: "biotech-knowledge-admission-ack.v1",
  admissionConsume: "biotech-knowledge-admission-consume.v1",
  intentMarker: "bks-intent-marker.v2",
} as const;

/** v1 contract strings still accepted for decoding / digest verification only. */
export const LEGACY_CONTRACT_VERSIONS = {
  readIntent: "biotech-knowledge-read-intent.v1",
  readSnapshot: "biotech-knowledge-read-snapshot.v1",
  workspace: "bks-schema-workspace.v1",
  ingestionIntent: "biotech-knowledge-intent.v1",
  ingestionPlan: "biotech-knowledge-plan.v1",
  ingestionReceipt: "biotech-knowledge-receipt.v1",
  canonicalJson: "bks-canonical-json.v1",
} as const;
