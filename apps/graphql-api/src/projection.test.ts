import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isInputObjectType, isInterfaceType, isObjectType, parse, Kind, type GraphQLSchema, type ObjectTypeDefinitionNode } from "graphql";
import { appRoot, applyProjection, buildExecutable, featuresFromManifest } from "./projection.js";
import { loadRegistry } from "./registry.js";
import { consumerBuild } from "./test/helpers.js";

const generated = (p: string) => readFileSync(join(appRoot(), p), "utf8");

/** Every field, input field and argument name of the executable (descriptions excluded). */
function surfaceNames(schema: GraphQLSchema): string[] {
  const names: string[] = [];
  for (const type of Object.values(schema.getTypeMap())) {
    if (type.name.startsWith("__")) continue;
    names.push(type.name);
    if (isObjectType(type) || isInterfaceType(type)) {
      for (const f of Object.values(type.getFields())) {
        names.push(f.name);
        for (const a of f.args) names.push(a.name);
      }
    } else if (isInputObjectType(type)) {
      for (const f of Object.values(type.getFields())) names.push(f.name);
    }
  }
  return names;
}

describe("consumer projection (buildExecutable)", () => {
  it("has a Query root only: zero mutations, no subscriptions", async () => {
    const { build } = await consumerBuild();
    expect(build.schema.getMutationType()).toBeUndefined();
    expect(build.schema.getSubscriptionType()).toBeUndefined();
    expect(build.printed).not.toMatch(/^type Mutation/m);
    expect(build.printed).not.toMatch(/(Create|Update|Delete)\w*Input\b/);
  });

  it("enables all five excludeDeprecatedFields flags and the generated surface has no deprecated shapes", async () => {
    const { build, manifest } = await consumerBuild();
    expect(featuresFromManifest(manifest).excludeDeprecatedFields).toEqual({
      mutationOperations: true,
      aggregationFilters: true,
      aggregationFiltersOutsideConnection: true,
      relationshipFilters: true,
      attributeFilters: true,
    });
    expect(build.libraryFeatures.excludeDeprecatedFields).toEqual(featuresFromManifest(manifest).excludeDeprecatedFields);
    const names = surfaceNames(build.schema);
    expect(names.filter((n) => /_(SOME|ALL|NONE|SINGLE|EQ|IN|NOT|CONTAINS|STARTS_WITH|GT|GTE|LT|LTE|MATCHES|INCLUDES)$/.test(n))).toEqual([]);
    expect(names.filter((n) => /Aggregate/.test(n))).toEqual([]);
    expect(build.printed).not.toContain("@deprecated");
  });

  it("disables unbounded union roots, the Subjectable root and the Entity connection; keeps the Entity list root", async () => {
    const { build } = await consumerBuild();
    const fields = build.schema.getQueryType()!.getFields();
    for (const union of ["mechanismModulators", "statingRecords", "studyParties", "administeredMaterials"]) expect(fields[union]).toBeUndefined();
    expect(fields.subjectables).toBeUndefined();
    expect(fields.entitiesConnection).toBeUndefined();
    expect(fields.entities).toBeDefined();
    expect(fields.products).toBeDefined();
  });

  it("omits operational/private fields and types without renaming domain types", async () => {
    const { build, source } = await consumerBuild();
    const names = new Set(surfaceNames(build.schema));
    for (const omitted of ["lastWriterRunId", "CaptureAttempt", "captureAttempts", "storageUri", "bodyUri", "receiptIds", "planDigests"]) expect(names.has(omitted), omitted).toBe(false);
    // MD-D10-06: the publisherUid cache is served only together with its generated provenance stamps.
    const criterion = build.schema.getType("DecisionCriterion");
    const fields = isObjectType(criterion) ? Object.keys(criterion.getFields()) : [];
    if (fields.includes("publisherUid")) expect(fields).toEqual(expect.arrayContaining(["publisherUidMethodVersion", "publisherUidDerivedAt", "publisherUidAuthorityUid"]));
    const activity = build.schema.getType("Activity");
    expect(isObjectType(activity) && Object.keys(activity.getFields())).not.toContain("runId");
    // Every other source object type keeps its name.
    const sourceTypes = parse(source.sdl).definitions.filter((d): d is ObjectTypeDefinitionNode => d.kind === Kind.OBJECT_TYPE_DEFINITION).map((d) => d.name.value);
    for (const name of sourceTypes.filter((n) => n !== "CaptureAttempt")) expect(build.schema.getType(name), name).toBeDefined();
  });

  it("injects @limit(25, 100) and the visibility rules on every node, and the jwt claims type", async () => {
    const { build } = await consumerBuild();
    const doc = parse(build.projectedSdl);
    const nodes = doc.definitions.filter((d): d is ObjectTypeDefinitionNode => d.kind === Kind.OBJECT_TYPE_DEFINITION && (d.directives ?? []).some((x) => x.name.value === "node"));
    expect(nodes.length).toBeGreaterThan(60);
    for (const n of nodes) {
      const names = (n.directives ?? []).map((d) => d.name.value);
      expect(names, n.name.value).toContain("limit");
      expect(names, n.name.value).toContain("authorization");
      const mutation = n.directives!.find((d) => d.name.value === "mutation")!;
      expect(mutation.arguments?.find((a) => a.name.value === "operations")?.value).toMatchObject({ kind: Kind.LIST, values: [] });
    }
    expect(build.projectedSdl).toMatch(/type BksActorClaims @jwt/);
    expect(build.projectedSdl).toMatch(/@limit\(default: 25, max: 100\)/);
    const subjectable = build.schema.getType("Subjectable");
    expect(isInterfaceType(subjectable) && Object.keys(subjectable.getFields())).toContain("privacyClass");
  });

  it("has no vector/phrase surface and refuses a vector feature", async () => {
    const { build, source, manifest } = await consumerBuild();
    expect(surfaceNames(build.schema).filter((n) => /phrase|vector|embedding/i.test(n) && n !== "embeddingModel")).toEqual([]);
    await expect(buildExecutable(source.sdl, manifest, { vector: { OpenAI: { token: "x" } } } as never)).rejects.toThrow(/unsupported/);
  });

  it("strips private/contact fields (OD-17) and @vector from a pinned SDL that had them", async () => {
    const { manifest } = await consumerBuild();
    const sdl = `
      interface Entity { uid: String! privacyClass: PrivacyClass lastWriterRunId: String }
      interface Subjectable { uid: String! }
      enum PrivacyClass { PUBLIC INTERNAL }
      type Person implements Entity & Subjectable @node @vector(indexes: [{ indexName: "x", embeddingProperty: "e", queryName: "q" }]) {
        uid: String! privacyClass: PrivacyClass lastWriterRunId: String name: String email: String phoneNumber: String homeAddress: String dateOfBirth: String familyMembers: [String!]
      }
    `;
    const minimal = { ...manifest, omitTypes: [], omitFields: [{ field: "*.lastWriterRunId", reason: "t" }], rootQueries: { ...manifest.rootQueries, types: [] }, scalarCuts: { ...manifest.scalarCuts, filter: {}, sort: {} } };
    const { sdl: out, report } = applyProjection(sdl, minimal);
    expect(report.privateFieldsStripped.sort()).toEqual(["Person.dateOfBirth", "Person.email", "Person.familyMembers", "Person.homeAddress", "Person.phoneNumber"]);
    expect(out).not.toMatch(/email|phoneNumber|homeAddress|dateOfBirth|familyMembers|@vector/);
    expect(out).toContain("name: String");
  });

  it("projects publisherUid only together with its three stamps (MD-D10-06, release rule decisionCriterionPublisherUid)", async () => {
    const { manifest } = await consumerBuild();
    const minimal = { ...manifest, omitTypes: [], omitFields: [], rootQueries: { ...manifest.rootQueries, types: [] }, scalarCuts: { ...manifest.scalarCuts, filter: {}, sort: {} }, interfaceFields: [] };
    const base = "interface Entity { uid: String! privacyClass: PrivacyClass } interface Subjectable { uid: String! } enum PrivacyClass { PUBLIC INTERNAL }";
    const unstamped = applyProjection(`${base} type DecisionCriterion implements Entity @node { uid: String! privacyClass: PrivacyClass publisherUid: String }`, minimal);
    expect(unstamped.sdl).not.toContain("publisherUid");
    const stamped = applyProjection(`${base} type DecisionCriterion implements Entity @node { uid: String! privacyClass: PrivacyClass publisherUid: String publisherUidMethodVersion: String publisherUidDerivedAt: DateTime publisherUidAuthorityUid: String }`, minimal);
    expect(stamped.sdl).toContain("publisherUid: String");
  });

  it("excludes the operational and legacy names of the release from the executable", async () => {
    const { build, source } = await consumerBuild();
    const names = new Set(surfaceNames(build.schema));
    const operational = (source.releaseCompatibility?.operationalNames as { labels?: string[] } | undefined)?.labels ?? ["KsReleaseMarker", "KsWriteFence", "KsIntentMarker", "LegacyV0"];
    for (const label of operational) expect(names.has(label), label).toBe(false);
    expect(source.releaseCompatibility?.capabilities?.["graphql.mutations"]?.status ?? "unsupported").toBe("unsupported");
  });

  it("rejects manifest rules that reference something absent (release drift)", async () => {
    const { manifest, source } = await consumerBuild();
    expect(() => applyProjection(source.sdl, { ...manifest, omitFields: [{ field: "Product.noSuchField", reason: "t" }] })).toThrow(/unknown field/);
    expect(() => applyProjection(source.sdl, { ...manifest, omitTypes: [{ type: "NoSuchType", reason: "t" }] })).toThrow(/unknown type/);
  });

  it("is deterministic: same inputs, same digests", async () => {
    const { build, source, manifest, manifestBytes } = await consumerBuild();
    const again = await buildExecutable(source.sdl, manifest, {}, { manifestBytes });
    expect(again.identity).toEqual(build.identity);
    expect(again.printed).toBe(build.printed);
  });

  it("matches the committed generated artifacts (generated/schema.graphql, identity.json, operations.json)", async () => {
    const { build, source } = await consumerBuild();
    expect(generated("generated/schema.graphql")).toBe(build.printed);
    const identity = JSON.parse(generated("generated/identity.json"));
    expect(identity).toMatchObject({ releaseId: source.releaseId, schemaDigest: source.schemaDigest, ...build.identity });
    const registry = loadRegistry();
    expect(identity.operationRegistryDigest).toBe(registry.operationRegistryDigest);
    expect(registry.registry.releaseCompatibility).toMatchObject({
      releaseId: source.releaseId,
      executableGraphqlDigest: build.identity.executableGraphqlDigest,
      productProjectionDigest: build.identity.productProjectionDigest,
    });
  });

  it("meets the SPECIFICATION 5.3 schema gates", async () => {
    const { build } = await consumerBuild();
    const doc = parse(build.projectedSdl);
    const nodeTypes = doc.definitions.filter((d) => d.kind === Kind.OBJECT_TYPE_DEFINITION && (d.directives ?? []).some((x) => x.name.value === "node"));
    const relTypes = new Set<string>();
    for (const d of doc.definitions) {
      if (d.kind !== Kind.OBJECT_TYPE_DEFINITION && d.kind !== Kind.INTERFACE_TYPE_DEFINITION) continue;
      for (const f of d.fields ?? []) {
        const rel = f.directives?.find((x) => x.name.value === "relationship");
        const type = rel?.arguments?.find((a) => a.name.value === "type")?.value;
        if (type?.kind === Kind.STRING) relTypes.add(type.value);
      }
    }
    const inputs = build.printed.split("\n").filter((l) => l.startsWith("input ")).length;
    expect(nodeTypes.length).toBeLessThanOrEqual(90);
    expect(relTypes.size).toBeLessThanOrEqual(160);
    expect(inputs).toBeLessThanOrEqual(4000);
    expect(Buffer.byteLength(build.printed)).toBeLessThanOrEqual(6 * 1024 * 1024);
    // The <5 s median build gate is measured in isolation by bench/build.ts (parallel test files share the CPU here).
    expect(build.buildMs).toBeLessThan(20000);
  });
});
