import { createPrivateKey, randomUUID, type KeyObject } from "node:crypto";
import { Hono } from "hono";
import { createRemoteJWKSet, errors as joseErrors, jwtVerify, SignJWT, type JWTPayload, type JWTVerifyGetKey } from "jose";
import { compatibility } from "@bks/graphql-client";
import type { BffConfig } from "./config.js";

/**
 * Reference product BFF (SPECIFICATION 5.1): validates the application user session against the configured issuer
 * (Supabase JWKS), applies entitlements, keeps the GraphQL service credential server-side and forwards only
 * safelisted persisted operations with a short-lived, audience-bound actor context signed by the BFF's Ed25519 key.
 * Clients send their session token and a persisted operation id; they never hold the service key.
 */

export const ACTOR_CONTEXT_VERSION = "bks-actor-context.v1";

/** Identity assertions that only the BFF may make; a caller sending any of them is refused. */
const FORGEABLE_IDENTITY_HEADER =
  /^(x-(bks-)?(actor|user|visibility|entitlements?|roles?|tenant|principal|impersonat\w*|privacy)(-|$)|x-forwarded-(user|email|groups|preferred-username)$|x-auth-request-|x-remote-user$|remote-user$|x-jwt-claim|x-api-key$|x-bks-engineering-key$)/i;

const knownOperations = new Map<string, string>(Object.entries(compatibility.operations).map(([name, op]) => [op.id, name]));
const PASS_HEADERS = ["content-type", "x-request-id", "x-bks-release-id", "x-bks-schema-digest", "x-bks-schema-release-digest", "x-bks-product-projection-digest", "x-bks-executable-graphql-digest", "x-bks-operation-registry-digest"];

export interface BffDeps {
  /** Session key resolver; defaults to the remote JWKS at config.session.jwksUrl (cached by jose). */
  sessionKeys?: JWTVerifyGetKey;
  fetch?: typeof fetch;
  log?: (message: string) => void;
}

export interface SessionActor {
  sub: string;
  visibility: Array<"PUBLIC" | "INTERNAL">;
  entitlements: string[];
}

function errorBody(code: string, message: string) {
  return { errors: [{ message, extensions: { code } }] };
}

function claimAt(payload: JWTPayload, path: string[]): unknown {
  let value: unknown = payload;
  for (const key of path) value = value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined;
  return value;
}

export function createBffApp(config: BffConfig, deps: BffDeps = {}) {
  const sessionKeys = deps.sessionKeys ?? createRemoteJWKSet(new URL(config.session.jwksUrl), { cooldownDuration: 30_000, cacheMaxAge: 600_000 });
  const doFetch = deps.fetch ?? fetch;
  const log = deps.log ?? ((m: string) => console.log(m));
  const signingKey: KeyObject = createPrivateKey(config.actor.privateKeyPem);
  if (signingKey.asymmetricKeyType !== "ed25519") throw new Error("BFF_ACTOR_PRIVATE_KEY must be an Ed25519 private key");

  const verifySession = async (authorization: string | undefined): Promise<SessionActor> => {
    const match = /^Bearer\s+([A-Za-z0-9._~+/=-]+)$/i.exec(authorization?.trim() ?? "");
    if (!match) throw Object.assign(new Error("missing application session (Authorization: Bearer <session token>)"), { status: 401, code: "SESSION_MISSING" });
    let payload: JWTPayload;
    try {
      ({ payload } = await jwtVerify(match[1]!, sessionKeys, { issuer: config.session.issuer, audience: config.session.audience, algorithms: config.session.algorithms, requiredClaims: ["sub", "exp"] }));
    } catch (error) {
      const expired = error instanceof joseErrors.JWTExpired;
      throw Object.assign(new Error(expired ? "application session expired" : `application session rejected: ${(error as Error).message}`), { status: 401, code: expired ? "SESSION_EXPIRED" : "SESSION_INVALID" });
    }
    if (config.session.requiredRole && payload.role !== config.session.requiredRole) throw Object.assign(new Error(`session role must be ${config.session.requiredRole}`), { status: 403, code: "SESSION_ROLE" });
    const raw = claimAt(payload, config.entitlements.claimPath);
    const entitlements = Array.isArray(raw) ? raw.filter((e): e is string => typeof e === "string") : [];
    if (config.entitlements.required && !entitlements.includes(config.entitlements.required)) {
      throw Object.assign(new Error(`entitlement ${config.entitlements.required} required`), { status: 403, code: "ENTITLEMENT_REQUIRED" });
    }
    const visibility: SessionActor["visibility"] = entitlements.includes(config.entitlements.internal) ? ["INTERNAL", "PUBLIC"] : ["PUBLIC"];
    return { sub: String(payload.sub), visibility, entitlements };
  };

  const mintActor = async (actor: SessionActor): Promise<string> => {
    const now = Math.floor(Date.now() / 1000);
    return new SignJWT({ ctx: ACTOR_CONTEXT_VERSION, vis: actor.visibility, ent: actor.entitlements, app: config.actor.appId })
      .setProtectedHeader({ alg: "EdDSA", typ: "bks-actor+jwt", ...(config.actor.keyId ? { kid: config.actor.keyId } : {}) })
      .setIssuer(config.actor.issuer)
      .setAudience(config.actor.audience)
      .setSubject(actor.sub)
      .setJti(randomUUID())
      .setIssuedAt(now)
      .setExpirationTime(now + config.actor.ttlSeconds)
      .sign(signingKey);
  };

  const app = new Hono();
  app.get("/healthz", (c) => c.json({ status: "ok", service: "bks-product-bff", releaseId: compatibility.releaseId, executableGraphqlDigest: compatibility.executableGraphqlDigest }));

  app.post("/graphql", async (c) => {
    const requestId = /^[A-Za-z0-9._-]{1,64}$/.test(c.req.header("x-request-id") ?? "") ? c.req.header("x-request-id")! : randomUUID();
    c.header("x-request-id", requestId);
    for (const name of Object.keys(c.req.header())) {
      if (FORGEABLE_IDENTITY_HEADER.test(name)) return c.json(errorBody("ACTOR_HEADER_REJECTED", `header ${name} is not accepted from clients`), 400);
    }
    let actor: SessionActor;
    try {
      actor = await verifySession(c.req.header("authorization"));
    } catch (error) {
      const e = error as Error & { status?: number; code?: string };
      return c.json(errorBody(e.code ?? "SESSION_INVALID", e.message), (e.status ?? 401) as 401 | 403);
    }
    const length = Number(c.req.header("content-length") ?? "0");
    if (length > config.bodyLimitBytes) return c.json(errorBody("REQUEST_TOO_LARGE", `body exceeds ${config.bodyLimitBytes} bytes`), 413);
    const text = await c.req.text();
    if (Buffer.byteLength(text) > config.bodyLimitBytes) return c.json(errorBody("REQUEST_TOO_LARGE", `body exceeds ${config.bodyLimitBytes} bytes`), 413);
    let body: { documentId?: unknown; operationName?: unknown; variables?: unknown; query?: unknown };
    try {
      body = JSON.parse(text);
    } catch {
      return c.json(errorBody("BAD_REQUEST", "malformed JSON"), 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) return c.json(errorBody("BAD_REQUEST", "one JSON object expected"), 400);
    if (body.query !== undefined) return c.json(errorBody("PERSISTED_QUERY_REQUIRED", "the BFF forwards safelisted persisted operations only (send documentId)"), 400);
    const id = typeof body.documentId === "string" ? body.documentId : "";
    const name = knownOperations.get(id);
    if (!name) return c.json(errorBody("PERSISTED_QUERY_NOT_FOUND", "unknown operation for this client release"), 404);
    if (body.variables !== undefined && (typeof body.variables !== "object" || body.variables === null || Array.isArray(body.variables))) {
      return c.json(errorBody("VARIABLES_INVALID", "variables must be an object"), 400);
    }
    const actorToken = await mintActor(actor);
    let upstream: Response;
    try {
      upstream = await doFetch(config.upstream.url, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json", "x-api-key": config.upstream.serviceKey, authorization: `Bearer ${actorToken}`, "x-request-id": requestId },
        body: JSON.stringify({ documentId: id, operationName: name, variables: body.variables ?? {} }),
        signal: AbortSignal.timeout(config.upstream.deadlineMs),
      });
    } catch (error) {
      const timeout = (error as Error)?.name === "TimeoutError";
      log(`upstream ${timeout ? "deadline" : "failure"} for ${name} (${requestId}): ${(error as Error)?.message}`);
      return c.json(errorBody(timeout ? "BKS_TIMEOUT" : "UPSTREAM_UNAVAILABLE", timeout ? "upstream deadline exceeded" : "upstream unavailable"), timeout ? 504 : 502);
    }
    const payload = await upstream.text();
    const headers = new Headers();
    for (const h of PASS_HEADERS) {
      const v = upstream.headers.get(h);
      if (v) headers.set(h, v);
    }
    headers.set("x-request-id", requestId);
    if (!headers.has("content-type")) headers.set("content-type", "application/json");
    return new Response(payload, { status: upstream.status, headers });
  });

  return { app, verifySession, mintActor };
}
