import { sign, type KeyObject } from "node:crypto";
import { canonicalize, SealedVerification, type SealedVerificationBody } from "@bks/contracts";
import type { StoredPlanRecord } from "../custody.js";
import type { PrincipalCtx } from "./context.js";

/** Test/dev helper: seals a verification result with a verifier key (the production verifier lives in Knowledge Services). */
export function sealVerification(body: SealedVerificationBody, signer: { kid: string; key: KeyObject }): SealedVerification {
  return SealedVerification.parse({ body, kid: signer.kid, signature: sign(null, Buffer.from(canonicalize(body), "utf8"), signer.key).toString("base64url") });
}

export const PRINCIPALS: Record<"writer" | "verifier" | "publisher" | "projector" | "curator" | "otherTenant", PrincipalCtx> = {
  writer: { principalId: "gate-b-writer", installationId: "local-test", applicationId: "bks-gate-b", tenantId: "tenant-a", grants: [] },
  verifier: { principalId: "gate-b-verifier", installationId: "local-test", applicationId: "bks-gate-b", tenantId: "tenant-a", grants: ["adjudication.deliver"] },
  publisher: { principalId: "gate-b-publisher", installationId: "local-test", applicationId: "bks-gate-b", tenantId: "tenant-a", grants: ["report.publish"] },
  projector: { principalId: "gate-b-projector", installationId: "local-test", applicationId: "bks-gate-b", tenantId: "tenant-a", grants: ["projection.write"] },
  curator: { principalId: "gate-b-curator", installationId: "local-test", applicationId: "bks-gate-b", tenantId: "tenant-a", grants: ["assessment.accept"] },
  otherTenant: { principalId: "gate-b-writer", installationId: "local-test", applicationId: "bks-gate-b", tenantId: "tenant-b", grants: [] },
};

/** Builds a stored plan record from offline planning output (unit tests of plan custody / forgery refusal). */
export function storedRecordFrom(plan: StoredPlanRecord["plan"], frozen: Omit<StoredPlanRecord["frozen"], "verifications"> & { verifications?: StoredPlanRecord["frozen"]["verifications"] }): StoredPlanRecord {
  return { format: "bks-plan-record.v1", plan, frozen: { ...frozen, verifications: frozen.verifications ?? [] }, storedAt: frozen.plannedAt };
}
