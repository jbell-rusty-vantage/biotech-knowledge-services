import { generateKeyPairSync, randomUUID, type KeyObject } from "node:crypto";
import { SignJWT } from "jose";
import { loadConsumerSourceSdl, type ConsumerSource } from "../release.js";
import { buildExecutable, loadProjectionManifest, type ExecutableBuild, type ProjectionManifest } from "../projection.js";
import { ACTOR_CONTEXT_VERSION, ACTOR_TOKEN_TYPE } from "../actor.js";

let cached: Promise<{ source: ConsumerSource; build: ExecutableBuild; manifest: ProjectionManifest; manifestBytes: Buffer }> | null = null;

/** One executable build per test file (the same builder and inputs as the server). */
export function consumerBuild() {
  cached ??= (async () => {
    const source = loadConsumerSourceSdl({ log: () => {} });
    const { manifest, bytes } = loadProjectionManifest();
    const build = await buildExecutable(source.sdl, manifest, {}, { manifestBytes: bytes });
    return { source, build, manifest, manifestBytes: bytes };
  })();
  return cached;
}

export interface TestKeys {
  publicPem: string;
  privateKey: KeyObject;
}

export function actorKeys(): TestKeys {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  return { publicPem: publicKey.export({ type: "spki", format: "pem" }).toString(), privateKey };
}

export interface MintOptions {
  vis?: string[];
  sub?: string;
  issuer?: string;
  audience?: string;
  ttlSeconds?: number;
  iatOffsetSeconds?: number;
  typ?: string;
  ctx?: string | null;
  extra?: Record<string, unknown>;
}

export async function mintActorToken(keys: TestKeys, options: MintOptions = {}): Promise<string> {
  const now = Math.floor(Date.now() / 1000) + (options.iatOffsetSeconds ?? 0);
  const claims: Record<string, unknown> = { vis: options.vis ?? ["PUBLIC"], ...(options.extra ?? {}) };
  if (options.ctx !== null) claims.ctx = options.ctx ?? ACTOR_CONTEXT_VERSION;
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "EdDSA", typ: options.typ ?? ACTOR_TOKEN_TYPE })
    .setIssuer(options.issuer ?? "bks-product-bff")
    .setAudience(options.audience ?? "bks-graphql-api")
    .setSubject(options.sub ?? "user-test")
    .setJti(randomUUID())
    .setIssuedAt(now)
    .setExpirationTime(now + (options.ttlSeconds ?? 60))
    .sign(keys.privateKey);
}

export const SERVICE_KEY = "test-service-key-0123456789abcdef0123456789";
export const ENGINEERING_KEY = "test-engineering-key-0123456789abcdef012345";
