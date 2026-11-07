import { createSecretKey, generateKeyPairSync, randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { SignJWT, UnsecuredJWT } from "jose";
import { ActorError, bearerToken, createActorVerifier, credentialMatches, libraryJwtFor, rejectForgeableIdentityHeaders } from "./actor.js";
import { actorKeys, mintActorToken } from "./test/helpers.js";

const keys = actorKeys();
const verifier = await createActorVerifier({ issuer: "bks-product-bff", audience: "bks-graphql-api", publicKey: keys.publicPem });
const code = async (token: string | null) => {
  try {
    await verifier.verify(token);
    return "valid";
  } catch (error) {
    return (error as ActorError).code;
  }
};

describe("BFF actor-context verification", () => {
  it("accepts a valid short-lived EdDSA actor context and returns its claims", async () => {
    const actor = await verifier.verify(await mintActorToken(keys, { vis: ["PUBLIC", "INTERNAL"], sub: "user-42", extra: { app: "bks-web", ent: ["biotech:read"] } }));
    expect(actor).toMatchObject({ sub: "user-42", app: "bks-web", visibility: ["INTERNAL", "PUBLIC"], entitlements: ["biotech:read"] });
    expect(libraryJwtFor(actor)).toEqual({ sub: "user-42", internal: true });
    expect(libraryJwtFor({ ...actor, visibility: ["PUBLIC"] })).toEqual({ sub: "user-42", internal: false });
  });

  it("rejects missing, expired, over-long, wrong issuer/audience/type and malformed tokens", async () => {
    expect(await code(null)).toBe("ACTOR_TOKEN_MISSING");
    expect(await code(await mintActorToken(keys, { iatOffsetSeconds: -200, ttlSeconds: 60 }))).toBe("ACTOR_TOKEN_EXPIRED");
    expect(await code(await mintActorToken(keys, { ttlSeconds: 600 }))).toBe("ACTOR_TOKEN_INVALID");
    expect(await code(await mintActorToken(keys, { issuer: "someone-else" }))).toBe("ACTOR_TOKEN_INVALID");
    expect(await code(await mintActorToken(keys, { audience: "bks-executor" }))).toBe("ACTOR_TOKEN_INVALID");
    expect(await code(await mintActorToken(keys, { typ: "JWT" }))).toBe("ACTOR_TOKEN_INVALID");
    expect(await code(await mintActorToken(keys, { ctx: null }))).toBe("ACTOR_TOKEN_INVALID");
    expect(await code(await mintActorToken(keys, { vis: ["PUBLIC", "SECRET"] }))).toBe("ACTOR_TOKEN_INVALID");
    expect(await code(await mintActorToken(keys, { vis: [] }))).toBe("ACTOR_TOKEN_INVALID");
    expect(await code("not.a.jwt")).toBe("ACTOR_TOKEN_INVALID");
  });

  it("rejects forged signatures: another Ed25519 key, HS256 with the public key as secret, alg none", async () => {
    expect(await code(await mintActorToken(actorKeys()))).toBe("ACTOR_TOKEN_INVALID");
    const now = Math.floor(Date.now() / 1000);
    const hs = await new SignJWT({ ctx: "bks-actor-context.v1", vis: ["PUBLIC", "INTERNAL"] })
      .setProtectedHeader({ alg: "HS256", typ: "bks-actor+jwt" })
      .setIssuer("bks-product-bff")
      .setAudience("bks-graphql-api")
      .setSubject("attacker")
      .setJti(randomUUID())
      .setIssuedAt(now)
      .setExpirationTime(now + 60)
      .sign(createSecretKey(Buffer.from(keys.publicPem)));
    expect(await code(hs)).toBe("ACTOR_TOKEN_INVALID");
    const none = new UnsecuredJWT({ ctx: "bks-actor-context.v1", vis: ["INTERNAL"] }).setIssuer("bks-product-bff").setAudience("bks-graphql-api").setSubject("attacker").setIssuedAt().setExpirationTime("60s").encode();
    expect(await code(none)).toBe("ACTOR_TOKEN_INVALID");
  });

  it("refuses a non-Ed25519 or private key as the verification key", async () => {
    const rsa = generateKeyPairSync("rsa", { modulusLength: 2048 }).publicKey.export({ type: "spki", format: "pem" }).toString();
    await expect(createActorVerifier({ issuer: "i", audience: "a", publicKey: rsa })).rejects.toThrow(/Ed25519/);
    await expect(createActorVerifier({ issuer: "i", audience: "a", publicKey: JSON.stringify({ kty: "OKP", crv: "Ed25519", x: "AA", d: "BB" }) })).rejects.toThrow(/private/);
  });

  it("rejects caller-supplied identity headers and accepts ordinary ones", () => {
    for (const header of ["x-user-id", "x-actor", "x-bks-actor-context", "x-bks-visibility", "x-forwarded-user", "x-auth-request-email", "x-roles", "x-tenant-id", "remote-user", "x-impersonate-user"]) {
      expect(() => rejectForgeableIdentityHeaders({ [header]: "admin" }), header).toThrow(ActorError);
    }
    expect(() => rejectForgeableIdentityHeaders({ "content-type": "application/json", authorization: "Bearer x", "x-api-key": "k", "x-request-id": "r", "user-agent": "ua" })).not.toThrow();
  });

  it("parses bearer tokens strictly and compares credentials in constant time", () => {
    expect(bearerToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(bearerToken("Basic abc")).toBeNull();
    expect(bearerToken("Bearer a b")).toBeNull();
    expect(credentialMatches("k1", "k1")).toBe(true);
    expect(credentialMatches("k1", "k2")).toBe(false);
    expect(credentialMatches(null, "k2")).toBe(false);
  });
});
