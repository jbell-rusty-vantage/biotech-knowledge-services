import { z } from "zod";

/**
 * Native error codes (INTERFACES v0 section 5, prefix `BKS_`). The last four are S3 deltas recorded in the S3 report:
 * PARTIAL_REFUSED, PARTIAL_NOT_CLOSED, PLAN_REJECTED, AUTHORITY_UNAVAILABLE.
 */
export const BKS_ERROR_CODES = [
  "BKS_RELEASE_MISMATCH",
  "BKS_RELEASE_TAMPERED",
  "BKS_UNAUTHORIZED",
  "BKS_FORBIDDEN_SCOPE",
  "BKS_PLAN_NOT_FOUND",
  "BKS_PLAN_DIGEST_MISMATCH",
  "BKS_PLAN_FORGED",
  "BKS_WITNESS_INVALID",
  "BKS_WITNESS_EXPIRED",
  "BKS_WITNESS_REVOKED",
  "BKS_EFFECT_DUPLICATE",
  "BKS_EFFECT_CONFLICT",
  "BKS_EFFECT_PENDING",
  "BKS_EFFECT_UNRESOLVED",
  "BKS_STALE_REVISION",
  "BKS_STALE_PRECONDITION",
  "BKS_IDENTITY_CONFLICT",
  "BKS_SLOT_CONFLICT",
  "BKS_EVIDENCE_UNVERIFIED",
  "BKS_SNAPSHOT_UNVERIFIED",
  "BKS_UNSUPPORTED",
  "BKS_LIMIT_EXCEEDED",
  "BKS_TIMEOUT",
  "BKS_PARSE_REJECTED",
  "BKS_PROCEDURE_FORBIDDEN",
  "BKS_VISIBILITY_DENIED",
  // S3 deltas
  "BKS_PARTIAL_REFUSED",
  "BKS_PARTIAL_NOT_CLOSED",
  "BKS_PLAN_REJECTED",
  "BKS_AUTHORITY_UNAVAILABLE",
] as const;
export const BksErrorCode = z.enum(BKS_ERROR_CODES);
export type BksErrorCode = z.infer<typeof BksErrorCode>;

export const BksError = z.strictObject({
  code: BksErrorCode,
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});
export type BksError = z.infer<typeof BksError>;

/** Thrown by the native services; carries a contract error code and JSON-safe details. */
export class BksServiceError extends Error {
  constructor(
    public readonly code: BksErrorCode,
    message: string,
    public readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "BksServiceError";
  }

  toJSON(): BksError {
    return { code: this.code, message: this.message, details: this.details };
  }
}
