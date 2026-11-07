import { createPublicKey, timingSafeEqual, createHash } from "node:crypto";
import { createLocalJWKSet, errors as joseErrors, importJWK, jwtVerify, type JSONWebKeySet, type JWTPayload, type CryptoKey, type KeyObject } from "jose";

/**
 * BFF actor context (SPECIFICATION 5.1, INTERFACES section 7). The product BFF verifies the application user's
 * session, applies entitlements and forwards a short-lived (<= 120 s), audience-bound JWT signed with its Ed25519
 * service key. GraphQL verifies issuer, audience, signature, type, lifetime and claims here, before execution, and
 * passes only the verified payload to @neo4j/graphql as `context.jwt` (the library's pre-verified path). A raw
 * `context.token` is never passed, and caller-supplied identity headers are rejected outright.
 */

export const ACTOR_CONTEXT_VERSION = "bks-actor-context.v1";
export const ACTOR_TOKEN_TYPE = "bks-actor+jwt";
export const ACTOR_MAX_TTL_SECONDS = 120;
export const PRIVACY_CLASSES = ["PUBLIC", "INTERNAL"] as const;
export type PrivacyClassValue = (typeof PRIVACY_CLASSES)[number];

export interface ActorVerifierConfig {
  issuer: string;
  audience: string;
  /** SPKI PEM of the BFF Ed25519 public key, or a JWKS JSON document (rotation by `kid`). */
  publicKey: string;
  clockToleranceSeconds?: number;
}

/** Claims of a verified actor context. */
export interface VerifiedActor {
  sub: string;
  jti: string;
  app: string | null;
  visibility: PrivacyClassValue[];
  entitlements: string[];
  issuedAt: number;
  expiresAt: number;
}

export type ActorErrorCode = "ACTOR_TOKEN_MISSING" | "ACTOR_TOKEN_EXPIRED" | "ACTOR_TOKEN_INVALID" | "ACTOR_HEADER_REJECTED" | "SERVICE_CREDENTIAL_INVALID";

export class ActorError extends Error {
  readonly status: number;
  constructor(
    readonly code: ActorErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ActorError";
    this.status = code === "ACTOR_HEADER_REJECTED" ? 400 : 401;
  }
}

/** Headers a caller could use to assert an identity without a signature. Their presence rejects the request. */
const FORGEABLE_IDENTITY_HEADER =
  /^(x-(bks-)?(actor|user|visibility|entitlements?|roles?|tenant|principal|impersonat\w*|privacy)(-|$)|x-forwarded-(user|email|groups|preferred-username)$|x-auth-request-|x-remote-user$|remote-user$|x-jwt-claim)/i;

export function rejectForgeableIdentityHeaders(headers: Record<string, string | string[] | undefined>): void {
  for (const name of Object.keys(headers)) {
    if (FORGEABLE_IDENTITY_HEADER.test(name)) {
      throw new ActorError("ACTOR_HEADER_REJECTED", `header ${name.toLowerCase()} is not accepted; actor identity travels only in the BFF-signed actor context`);
    }
  }
}

type VerifyKey = CryptoKey | KeyObject | ReturnType<typeof createLocalJWKSet>;

export interface ActorVerifier {
  verify(token: string | null | undefined): Promise<VerifiedActor>;
}

export async function createActorVerifier(config: ActorVerifierConfig): Promise<ActorVerifier> {
  if (!config.issuer || !config.audience) throw new Error("actor verifier needs an issuer and an audience");
  let key: VerifyKey;
  const raw = config.publicKey.trim();
  if (raw.startsWith("{")) {
    const parsed = JSON.parse(raw) as JSONWebKeySet | Record<string, unknown>;
    if (Array.isArray((parsed as JSONWebKeySet).keys)) {
      key = createLocalJWKSet(parsed as JSONWebKeySet);
    } else {
      if ((parsed as { d?: unknown }).d !== undefined) throw new Error("GRAPHQL_ACTOR_PUBLIC_KEY must not contain a private key");
      key = (await importJWK(parsed as Parameters<typeof importJWK>[0], "EdDSA")) as CryptoKey;
    }
  } else {
    const keyObject = createPublicKey(raw);
    if (keyObject.type !== "public" || keyObject.asymmetricKeyType !== "ed25519") throw new Error("GRAPHQL_ACTOR_PUBLIC_KEY must be an Ed25519 public key (SPKI PEM)");
    key = keyObject;
  }
  const tolerance = config.clockToleranceSeconds ?? 5;

  return {
    async verify(token) {
      if (!token) throw new ActorError("ACTOR_TOKEN_MISSING", "missing actor context (Authorization: Bearer <BFF actor JWT>)");
      let payload: JWTPayload;
      try {
        const verified = await jwtVerify(token, key as Parameters<typeof jwtVerify>[1], {
          algorithms: ["EdDSA"],
          issuer: config.issuer,
          audience: config.audience,
          typ: ACTOR_TOKEN_TYPE,
          maxTokenAge: `${ACTOR_MAX_TTL_SECONDS}s`,
          clockTolerance: tolerance,
          requiredClaims: ["sub", "iat", "exp", "jti"],
        });
        payload = verified.payload;
      } catch (error) {
        if (error instanceof joseErrors.JWTExpired) throw new ActorError("ACTOR_TOKEN_EXPIRED", "actor context expired");
        if (error instanceof joseErrors.JWTClaimValidationFailed && error.claim === "iat") throw new ActorError("ACTOR_TOKEN_EXPIRED", "actor context older than its maximum age");
        throw new ActorError("ACTOR_TOKEN_INVALID", `actor context rejected: ${(error as Error).message}`);
      }
      const iat = payload.iat!;
      const exp = payload.exp!;
      if (exp - iat > ACTOR_MAX_TTL_SECONDS) throw new ActorError("ACTOR_TOKEN_INVALID", `actor context lifetime ${exp - iat}s exceeds ${ACTOR_MAX_TTL_SECONDS}s`);
      if (payload.ctx !== ACTOR_CONTEXT_VERSION) throw new ActorError("ACTOR_TOKEN_INVALID", `actor context version must be ${ACTOR_CONTEXT_VERSION}`);
      const vis = payload.vis;
      if (!Array.isArray(vis) || vis.length === 0 || !vis.every((v): v is PrivacyClassValue => (PRIVACY_CLASSES as readonly string[]).includes(String(v)))) {
        throw new ActorError("ACTOR_TOKEN_INVALID", "actor context vis must be a non-empty list of PUBLIC/INTERNAL");
      }
      const ent = payload.ent;
      if (ent !== undefined && (!Array.isArray(ent) || !ent.every((e) => typeof e === "string"))) throw new ActorError("ACTOR_TOKEN_INVALID", "actor context ent must be a list of strings");
      if (typeof payload.sub !== "string" || payload.sub.length === 0 || payload.sub.length > 256) throw new ActorError("ACTOR_TOKEN_INVALID", "actor context sub is invalid");
      return {
        sub: payload.sub,
        jti: String(payload.jti),
        app: typeof payload.app === "string" ? payload.app : null,
        visibility: [...new Set(vis)].sort() as PrivacyClassValue[],
        entitlements: (ent as string[] | undefined) ?? [],
        issuedAt: iat,
        expiresAt: exp,
      };
    },
  };
}

/** The JWT payload @neo4j/graphql's visibility rules read (`$jwt.internal`); derived only from a verified actor. */
export function libraryJwtFor(actor: VerifiedActor): { sub: string; internal: boolean } {
  return { sub: actor.sub, internal: actor.visibility.includes("INTERNAL") };
}

/** Constant-time comparison for service credentials. */
export function credentialMatches(presented: string | null | undefined, expected: string | null | undefined): boolean {
  if (!presented || !expected) return false;
  const a = createHash("sha256").update(presented).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export function bearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const match = /^Bearer\s+([A-Za-z0-9._~+/=-]+)$/i.exec(header.trim());
  return match ? match[1]! : null;
}
