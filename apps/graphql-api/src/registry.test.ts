import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse, specifiedRules, validate, type OperationDefinitionNode } from "graphql";
import { appRoot } from "./projection.js";
import { buildRegistry, lintVisibility } from "./registry-build.js";
import { bindVariables, loadRegistry, RequestRejected, resolvePersistedOperation } from "./registry.js";
import { sha256Digest } from "./hash.js";
import { DEFAULT_ADMISSION_LIMITS, encodeCursorOffset } from "./limits.js";
import { consumerBuild } from "./test/helpers.js";

const loaded = loadRegistry();
const op = (name: string) => loaded.registry.operations.find((o) => o.name === name)!;
const PUBLIC = { visibility: ["PUBLIC"] };
const reject = (fn: () => unknown) => {
  try {
    fn();
  } catch (error) {
    if (error instanceof RequestRejected) return error.code;
    throw error;
  }
  return "accepted";
};

describe("operation registry (safelist)", () => {
  it("covers the required product views with sha256 ids over their documents", () => {
    const names = loaded.registry.operations.map((o) => o.name);
    expect(names).toEqual(
      expect.arrayContaining(["EntityCard", "ProductCard", "ProductVariantsPage", "AssertionEvidenceTrace", "ProductLabelHistory", "PackageLabelHistoryPage", "ClaimView", "ReportView", "ResolveIdentifier"]),
    );
    for (const o of loaded.registry.operations) {
      expect(o.id).toBe(sha256Digest(o.document));
      expect(o.id).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
  });

  it("every registered document validates against the executable and stays within its cost class", async () => {
    const { build } = await consumerBuild();
    for (const o of loaded.registry.operations) {
      expect(validate(build.schema, parse(o.document), specifiedRules), o.name).toEqual([]);
      expect(o.staticCost, o.name).toBeLessThanOrEqual(loaded.registry.costClasses[o.costClass]!.maxEstimatedCost);
      expect(o.depth, o.name).toBeLessThanOrEqual(8);
    }
  });

  it("regenerating from the catalog reproduces operations.json byte for byte", async () => {
    const { build, source, manifest } = await consumerBuild();
    const result = buildRegistry(join(appRoot(), "operations", "catalog.json"), build, source, manifest);
    expect(result.errors).toEqual([]);
    expect(sha256Digest(result.text)).toBe(loaded.operationRegistryDigest);
  });

  it("resolves documentId, APQ hash and exact registered text; rejects everything else before execution", () => {
    const card = op("ProductCard");
    expect(resolvePersistedOperation(loaded, { documentId: card.id }).name).toBe("ProductCard");
    expect(resolvePersistedOperation(loaded, { extensions: { persistedQuery: { version: 1, sha256Hash: card.id.slice(7) } } }).name).toBe("ProductCard");
    expect(resolvePersistedOperation(loaded, { query: card.document }).name).toBe("ProductCard");
    expect(reject(() => resolvePersistedOperation(loaded, { query: "{ products { uid } }" }))).toBe("PERSISTED_QUERY_REQUIRED");
    expect(reject(() => resolvePersistedOperation(loaded, { documentId: `sha256:${"0".repeat(64)}` }))).toBe("PERSISTED_QUERY_NOT_FOUND");
    expect(reject(() => resolvePersistedOperation(loaded, { documentId: card.id, query: "{ products { uid } }" }))).toBe("PERSISTED_QUERY_MISMATCH");
    expect(reject(() => resolvePersistedOperation(loaded, { documentId: card.id, operationName: "Other" }))).toBe("OPERATION_NAME_MISMATCH");
    expect(reject(() => resolvePersistedOperation(loaded, { documentId: "md5:abc" }))).toBe("PERSISTED_QUERY_INVALID");
    expect(reject(() => resolvePersistedOperation(loaded, {}))).toBe("PERSISTED_QUERY_REQUIRED");
  });

  it("binds variables: defaults applied, server-bound visibility added, bounds enforced", () => {
    // A registry entry with a server-bound visibility variable (the mechanism relationship predicates must use).
    const page = { ...op("ProductVariantsPage"), variables: { ...op("ProductVariantsPage").variables, actorVisibility: { graphqlType: "[PrivacyClass!]!", type: "List" as const, bind: "actor.visibility" as const, required: true } } };
    const bound = bindVariables(page, { uid: "hu:product:syn-00001" }, PUBLIC, DEFAULT_ADMISSION_LIMITS);
    expect(bound).toEqual({ uid: "hu:product:syn-00001", first: 25, actorVisibility: ["PUBLIC"] });
    const L = DEFAULT_ADMISSION_LIMITS;
    expect(reject(() => bindVariables(page, { uid: "hu:product:x", actorVisibility: ["INTERNAL"] }, PUBLIC, L))).toBe("ACTOR_BINDING_REJECTED");
    expect(reject(() => bindVariables(page, { uid: "hu:product:x", sneaky: 1 }, PUBLIC, L))).toBe("VARIABLES_INVALID");
    expect(reject(() => bindVariables(page, { uid: "hu:product:x", first: 26 }, PUBLIC, L))).toBe("VARIABLES_OUT_OF_BOUNDS");
    expect(reject(() => bindVariables(page, { uid: "hu:product:x", first: 0 }, PUBLIC, L))).toBe("VARIABLES_OUT_OF_BOUNDS");
    expect(reject(() => bindVariables(page, { uid: "hu:product:x", first: 2.5 }, PUBLIC, L))).toBe("VARIABLES_INVALID");
    expect(reject(() => bindVariables(page, { uid: "not a uid" }, PUBLIC, L))).toBe("VARIABLES_INVALID");
    expect(reject(() => bindVariables(page, { uid: `hu:product:${"x".repeat(300)}` }, PUBLIC, L))).toBe("VARIABLES_OUT_OF_BOUNDS");
    expect(reject(() => bindVariables(page, {}, PUBLIC, L))).toBe("VARIABLES_INVALID");
    expect(reject(() => bindVariables(page, { uid: "hu:product:x", after: "garbage" }, PUBLIC, L))).toBe("CURSOR_INVALID");
    expect(reject(() => bindVariables(page, { uid: "hu:product:x", after: encodeCursorOffset(5000) }, PUBLIC, L))).toBe("OFFSET_EXCEEDED");
    expect(reject(() => bindVariables(page, [] as never, PUBLIC, L))).toBe("VARIABLES_INVALID");
    expect(bindVariables(page, { uid: "hu:product:x", after: encodeCursorOffset(24) }, PUBLIC, L).after).toBe(encodeCursorOffset(24));
  });

  it("visibility lint: a relationship predicate without the server-bound privacyClass is rejected", async () => {
    const { build } = await consumerBuild();
    const lint = (q: string) => {
      const document = parse(q);
      const operation = document.definitions.find((d): d is OperationDefinitionNode => d.kind === "OperationDefinition")!;
      return lintVisibility(build.schema, operation, document, new Set(["v"]), "privacyClass");
    };
    expect(lint('query Q($v: [PrivacyClass!]!) { assertions(where: { subject: { some: { uid: { eq: "x" }, privacyClass: { in: $v } } } }) { uid } }')).toEqual([]);
    expect(lint('query Q($v: [PrivacyClass!]!) { assertions(where: { subject: { some: { uid: { eq: "x" } } } }) { uid } }')[0]).toMatch(/lacks privacyClass/);
    expect(lint('query Q($v: [PrivacyClass!]!) { assertions(where: { subject: { some: { uid: { eq: "x" }, privacyClass: { in: [PUBLIC, INTERNAL] } } } }) { uid } }')[0]).toMatch(/lacks privacyClass/);
    expect(lint("query Q($w: AssertionWhere) { assertions(where: $w) { uid } }")[0]).toMatch(/must be written literally/);
  });
});
