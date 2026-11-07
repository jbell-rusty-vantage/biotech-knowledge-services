import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { compatibility, createBiotechClient, AuthError, CompatibilityError, DomainError, PartialDataError, TransportError, ValidationError, ProductCardDocument, ResolveIdentifierDocument, type Transport, type TransportRequest } from "./index.js";

const here = dirname(fileURLToPath(import.meta.url));
const headersOf = (h: Record<string, string>) => ({ get: (n: string) => h[n.toLowerCase()] ?? null });
const ok = (body: unknown, extra: Record<string, string> = {}) => ({
  status: 200,
  headers: headersOf({ "x-bks-executable-graphql-digest": compatibility.executableGraphqlDigest, "x-bks-operation-registry-digest": compatibility.operationRegistryDigest, ...extra }),
  text: async () => JSON.stringify(body),
});
const status = (code: number, body: unknown) => ({ status: code, headers: headersOf({}), text: async () => JSON.stringify(body) });

function recording(responses: Array<ReturnType<typeof ok> | Error>) {
  const requests: TransportRequest[] = [];
  const transport: Transport = async (req) => {
    requests.push(req);
    const next = responses.shift();
    if (!next) throw new Error("no more responses");
    if (next instanceof Error) throw next;
    return next;
  };
  return { requests, transport };
}
const noSleep = async () => {};

describe("@bks/graphql-client", () => {
  it("generated operation hashes equal the server safelist ids (same normalization)", () => {
    const api = join(here, "..", "..", "..", "apps", "graphql-api");
    const registry = JSON.parse(readFileSync(join(api, "operations", "operations.json"), "utf8")) as { operations: Array<{ name: string; id: string; document: string }> };
    const persisted = JSON.parse(readFileSync(join(here, "generated", "persisted-documents.json"), "utf8")) as Record<string, string>;
    expect(Object.keys(persisted).sort()).toEqual(registry.operations.map((o) => o.id).sort());
    for (const op of registry.operations) {
      expect(persisted[op.id]).toBe(op.document);
      expect(compatibility.operations[op.name as keyof typeof compatibility.operations].id).toBe(op.id);
    }
    expect((ProductCardDocument as unknown as { __meta__: { hash: string } }).__meta__.hash).toBe(compatibility.operations.ProductCard.id);
    const identity = JSON.parse(readFileSync(join(api, "generated", "identity.json"), "utf8"));
    expect(compatibility).toMatchObject({ releaseId: identity.releaseId, executableGraphqlDigest: identity.executableGraphqlDigest, operationRegistryDigest: identity.operationRegistryDigest });
  });

  it("sends only the persisted id, operation name, variables and the supplied credential", async () => {
    const { requests, transport } = recording([ok({ data: { products: [] } })]);
    const client = createBiotechClient({ endpoint: "https://bff.example/graphql", transport, credentials: async () => "session-token" });
    const data = await client.execute(ProductCardDocument, { uid: "hu:product:1" });
    expect(data).toEqual({ products: [] });
    const req = requests[0]!;
    expect(JSON.parse(req.body)).toEqual({ documentId: compatibility.operations.ProductCard.id, operationName: "ProductCard", variables: { uid: "hu:product:1" } });
    expect(req.headers.authorization).toBe("Bearer session-token");
    expect(req.body).not.toMatch(/query|products\(/);
  });

  it("returns typed errors: auth, validation, domain, partial data (never an empty success)", async () => {
    const run = async (response: ReturnType<typeof ok>) => {
      const { transport } = recording([response]);
      return createBiotechClient({ endpoint: "x", transport, sleep: noSleep }).execute(ProductCardDocument, { uid: "hu:product:1" }).catch((e: unknown) => e);
    };
    expect(await run(status(401, { errors: [{ message: "no", extensions: { code: "BKS_UNAUTHORIZED" } }] }))).toBeInstanceOf(AuthError);
    const v = await run(status(400, { errors: [{ message: "bounds", extensions: { code: "VARIABLES_OUT_OF_BOUNDS" } }] }));
    expect(v).toBeInstanceOf(ValidationError);
    expect((v as ValidationError).code).toBe("VARIABLES_OUT_OF_BOUNDS");
    expect(await run(ok({ errors: [{ message: "unsupported", extensions: { code: "BKS_UNSUPPORTED" } }] }))).toBeInstanceOf(DomainError);
    const partial = await run(ok({ data: { products: [{ uid: "a" }] }, errors: [{ message: "x", path: ["products", 0, "brand"] }] }));
    expect(partial).toBeInstanceOf(PartialDataError);
    expect((partial as PartialDataError).data).toEqual({ products: [{ uid: "a" }] });
  });

  it("retries only retryable transport failures, a bounded number of times", async () => {
    const flaky = recording([status(503, {}), ok({ data: { identifiers: [] } })]);
    const client = createBiotechClient({ endpoint: "x", transport: flaky.transport, retry: { attempts: 3 }, sleep: noSleep });
    expect(await client.execute(ResolveIdentifierDocument, { scheme: "gtin", value: "1" })).toEqual({ identifiers: [] });
    expect(flaky.requests).toHaveLength(2);
    const down = recording([status(503, {}), status(503, {}), status(503, {}), status(503, {})]);
    const e = await createBiotechClient({ endpoint: "x", transport: down.transport, retry: { attempts: 9 }, sleep: noSleep }).execute(ResolveIdentifierDocument, { scheme: "gtin", value: "1" }).catch((x: unknown) => x);
    expect(e).toBeInstanceOf(TransportError);
    expect(down.requests).toHaveLength(3); // capped at 3 attempts
    const refused = recording([status(400, { errors: [{ message: "bad", extensions: { code: "PERSISTED_QUERY_NOT_FOUND" } }] }), ok({ data: {} })]);
    await createBiotechClient({ endpoint: "x", transport: refused.transport, retry: { attempts: 3 }, sleep: noSleep }).execute(ResolveIdentifierDocument, { scheme: "g", value: "1" }).catch(() => undefined);
    expect(refused.requests).toHaveLength(1);
    const net = recording([new Error("ECONNRESET"), ok({ data: { identifiers: [] } })]);
    expect(await createBiotechClient({ endpoint: "x", transport: net.transport, sleep: noSleep }).execute(ResolveIdentifierDocument, { scheme: "g", value: "1" })).toEqual({ identifiers: [] });
  });

  it("honours abort signals and the deadline without retrying", async () => {
    const hanging: Transport = (req) => new Promise((_, reject) => req.signal.addEventListener("abort", () => reject(new Error("aborted"))));
    const e = await createBiotechClient({ endpoint: "x", transport: hanging, deadlineMs: 30, sleep: noSleep }).execute(ProductCardDocument, { uid: "hu:product:1" }).catch((x: unknown) => x);
    expect(e).toBeInstanceOf(TransportError);
    expect((e as TransportError).aborted).toBe(true);
    const controller = new AbortController();
    controller.abort();
    const e2 = await createBiotechClient({ endpoint: "x", transport: hanging }).execute(ProductCardDocument, { uid: "hu:product:1" }, { signal: controller.signal }).catch((x: unknown) => x);
    expect((e2 as TransportError).aborted).toBe(true);
  });

  it("detects a server built from a different executable/registry", async () => {
    const { transport } = recording([ok({ data: { products: [] } }, { "x-bks-executable-graphql-digest": "sha256:other" })]);
    expect(await createBiotechClient({ endpoint: "x", transport }).execute(ProductCardDocument, { uid: "hu:product:1" }).catch((x: unknown) => x)).toBeInstanceOf(CompatibilityError);
    const warnings: string[] = [];
    const again = recording([ok({ data: { products: [] } }, { "x-bks-executable-graphql-digest": "sha256:other" })]);
    await createBiotechClient({ endpoint: "x", transport: again.transport, compatibilityMode: "warn", onWarning: (w) => warnings.push(w) }).execute(ProductCardDocument, { uid: "hu:product:1" });
    expect(warnings).toHaveLength(1);
  });

  it("refuses credentials or identity in static headers and unknown documents", async () => {
    expect(() => createBiotechClient({ endpoint: "x", transport: async () => ok({}), headers: { "x-api-key": "service-key" } })).toThrow(/cannot be set/);
    expect(() => createBiotechClient({ endpoint: "x", transport: async () => ok({}), headers: { "x-user-id": "u" } })).toThrow(/cannot be set/);
    const forged = { __meta__: { hash: `sha256:${"0".repeat(64)}` } } as unknown as typeof ProductCardDocument;
    expect(await createBiotechClient({ endpoint: "x", transport: async () => ok({}) }).execute(forged, { uid: "x" }).catch((x: unknown) => x)).toBeInstanceOf(ValidationError);
  });
});
