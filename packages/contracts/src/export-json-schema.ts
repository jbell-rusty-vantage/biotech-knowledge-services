import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { CypherRequest, CypherResult } from "./cypher.js";
import { IngestionIntent, IngestionPlan, IngestionReceipt } from "./ingest.js";
import { ReadIntent, ReadSnapshot } from "./read.js";
import { IngestionIntentV2 } from "./intent-v2.js";
import { IngestionPlanV2 } from "./plan-v2.js";
import { ApplyRequestV2, ApplyWitness, IngestionReceiptV2, VerifyEffectsPage, WitnessClaims } from "./apply-v2.js";
import { CustodySnapshotRecord, ReadResultStatus, SealedVerification } from "./custody.js";
import { BksError } from "./errors.js";
import { KnowledgeDelivery, KnowledgeRequestEnvelope } from "./envelope.js";
import { CypherReadIntentV1, ExplainResultV1, ReadIntentV2, ReadIntentV3, ReadResultV2, ReadResultV3 } from "./read-v2.js";
import { AdmissionAcknowledgmentV1, AdmissionConsumeReportV1, AdmissionConsumeRequestV1, AdmissionDispatchV1 } from "./admission.js";
import { CardRecord, SchemaContext, SearchEntry, SliceRequest, SliceRequestV2, WorkspaceManifest, WorkspaceManifestV2 } from "./workspace.js";

/**
 * Exports every public contract as JSON Schema (draft 2020-12) into `packages/contracts/json-schema/`.
 * The Python client validates against these files; they are the cross-language wire truth.
 */
const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "..", "json-schema");
mkdirSync(outDir, { recursive: true });

const contracts: Record<string, z.ZodType> = {
  "biotech-knowledge-read-intent.v1": ReadIntent,
  "biotech-knowledge-read-snapshot.v1": ReadSnapshot,
  "biotech-knowledge-read-intent.v2": ReadIntentV2,
  "biotech-cypher-read-intent.v1": CypherReadIntentV1,
  "biotech-knowledge-read-result.v2": ReadResultV2,
  "biotech-cypher-read-explain.v1": ExplainResultV1,
  "biotech-knowledge-intent.v1": IngestionIntent,
  "biotech-knowledge-plan.v1": IngestionPlan,
  "biotech-knowledge-receipt.v1": IngestionReceipt,
  "biotech-knowledge-intent.v2": IngestionIntentV2,
  "biotech-knowledge-plan.v2": IngestionPlanV2,
  "biotech-knowledge-apply.v2": ApplyRequestV2,
  "biotech-knowledge-receipt.v2": IngestionReceiptV2,
  "bks-apply-witness.v1": ApplyWitness,
  "bks-apply-witness-claims.v1": WitnessClaims,
  "bks-effect-verification.v1": VerifyEffectsPage,
  "bks-custody-snapshot.v1": CustodySnapshotRecord,
  "bks-sealed-verification.v1": SealedVerification,
  "biotech-knowledge-read-result-status.v2": ReadResultStatus,
  "bks-error.v1": BksError,
  "biotech-cypher-request.v1": CypherRequest,
  "biotech-cypher-result.v1": CypherResult,
  "bks-schema-workspace-manifest.v1": WorkspaceManifest,
  "bks-schema-workspace-search-entry.v1": SearchEntry,
  "bks-schema-workspace-slice-request.v1": SliceRequest,
  "bks-schema-workspace-manifest.v2": WorkspaceManifestV2,
  "bks-schema-card.v1": CardRecord,
  "bks-schema-slice-request.v2": SliceRequestV2,
  "biotech-schema-context.v1": SchemaContext,
  "mc.knowledge_request.v1": KnowledgeRequestEnvelope,
  "mc.knowledge_delivery.v1": KnowledgeDelivery,
  "biotech-knowledge-read-intent.v3": ReadIntentV3,
  "biotech-knowledge-read-result.v3": ReadResultV3,
  "biotech-knowledge-admission.v1": AdmissionDispatchV1,
  "biotech-knowledge-admission-ack.v1": AdmissionAcknowledgmentV1,
  "biotech-knowledge-admission-consume-request.v1": AdmissionConsumeRequestV1,
  "biotech-knowledge-admission-consume.v1": AdmissionConsumeReportV1,
};

for (const [name, schema] of Object.entries(contracts)) {
  const json = z.toJSONSchema(schema, { target: "draft-2020-12", io: "input", unrepresentable: "any" });
  const path = resolve(outDir, `${name}.json`);
  writeFileSync(path, `${JSON.stringify({ $id: `https://belllabs.dev/contracts/${name}.json`, title: name, ...json }, null, 2)}\n`);
  console.log(`wrote ${path}`);
}
