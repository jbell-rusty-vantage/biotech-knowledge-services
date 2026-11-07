import { describe, expect, it } from "vitest";
import { parse, specifiedRules, validate, type OperationDefinitionNode } from "graphql";
import { DEFAULT_ADMISSION_LIMITS, admitOperation, decodeCursorOffset, depthLimitRule, encodeCursorOffset } from "./limits.js";
import { consumerBuild } from "./test/helpers.js";

async function admit(query: string, variables: Record<string, unknown> = {}) {
  const { build } = await consumerBuild();
  const document = parse(query);
  const operation = document.definitions.find((d): d is OperationDefinitionNode => d.kind === "OperationDefinition")!;
  return admitOperation(build.schema, document, operation, variables, DEFAULT_ADMISSION_LIMITS);
}
const codes = (r: { violations: Array<{ code: string }> }) => r.violations.map((v) => v.code);

describe("admission bounds reflect generated execution (adversarial)", () => {
  it("admits a bounded nested read and charges real page sizes", async () => {
    const r = await admit("{ products(limit: 10) { uid variants(limit: 3) { uid } } }");
    expect(r.violations).toEqual([]);
    expect(r.cost).toBe(10 * (1 + 3 * 1));
  });

  it("sums aliases: repeating a costly field under many aliases is rejected", async () => {
    const alias = (i: number) => `a${i}: products(limit: 100) { uid variants(limit: 25) { uid } }`;
    const r = await admit(`{ ${Array.from({ length: 4 }, (_, i) => alias(i)).join(" ")} }`);
    expect(r.cost).toBe(4 * 100 * (1 + 25));
    expect(codes(r)).toContain("QUERY_TOO_COSTLY");
  });

  it("expands fragments every time they are spread", async () => {
    const r = await admit("{ products(limit: 4) { ...V ...W } } fragment V on Product { variants(limit: 5) { uid } } fragment W on Product { variants(limit: 5) { name } }");
    expect(r.cost).toBe(4 * (1 + 5 + 5));
  });

  it("rejects depth > 8 in validation and in admission", async () => {
    const { build } = await consumerBuild();
    const deep = "{ products(limit: 1) { variants(limit: 1) { packages(limit: 1) { labelVersions(limit: 1) { responsibleParty(limit: 1) { holdsStakes(limit: 1) { subsidiaries(limit: 1) { holdsStakes(limit: 1) { uid } } } } } } } } }";
    expect(validate(build.schema, parse(deep), [...specifiedRules, depthLimitRule(8)]).map((e) => e.extensions.code)).toContain("QUERY_TOO_DEEP");
    expect(codes(await admit(deep))).toContain("QUERY_TOO_DEEP");
  });

  it("applies variable defaults before bounding (a default of 500 is not a free pass)", async () => {
    expect(codes(await admit("query Q($n: Int = 500) { products(limit: $n) { uid } }"))).toContain("LIMIT_EXCEEDED");
    expect((await admit("query Q($n: Int = 500) { products(limit: $n) { uid } }", { n: 5 })).violations).toEqual([]);
    expect(codes(await admit("query Q($n: Int!) { products(limit: $n) { uid } }", {}))).toContain("VARIABLES_INVALID");
  });

  it("caps root pages at 100 and nested pages at 25", async () => {
    expect(codes(await admit("{ products(limit: 101) { uid } }"))).toContain("LIMIT_EXCEEDED");
    expect(codes(await admit("{ products(limit: 2) { variants(limit: 26) { uid } } }"))).toContain("LIMIT_EXCEEDED");
    expect(codes(await admit("{ productsConnection(first: 101) { edges { node { uid } } } }"))).toContain("LIMIT_EXCEEDED");
    expect(codes(await admit("{ products(limit: 1) { variantsConnection(first: 26) { edges { node { uid } } } } }"))).toContain("LIMIT_EXCEEDED");
  });

  it("requires an explicit limit on union-target lists (7.6.3 applies no @limit to unions) and rejects union connections", async () => {
    expect(codes(await admit("{ studyArms(limit: 2) { uid statedIn { __typename } } }"))).toContain("UNBOUNDED_UNION_FIELD");
    expect((await admit("{ studyArms(limit: 2) { uid statedIn(limit: 5) { __typename } } }")).violations).toEqual([]);
    expect(codes(await admit("{ studyArms(limit: 2) { statedInConnection(first: 2) { edges { node { __typename } } } } }"))).toContain("UNION_CONNECTION_UNSUPPORTED");
  });

  it("bounds offsets and decoded cursors", async () => {
    expect(codes(await admit("{ products(limit: 5, offset: 5000) { uid } }"))).toContain("OFFSET_EXCEEDED");
    expect(codes(await admit(`{ productsConnection(first: 5, after: "${encodeCursorOffset(5000)}") { edges { node { uid } } } }`))).toContain("OFFSET_EXCEEDED");
    expect(codes(await admit('{ productsConnection(first: 5, after: "not-a-cursor") { edges { node { uid } } } }'))).toContain("CURSOR_INVALID");
    expect((await admit(`{ productsConnection(first: 5, after: "${encodeCursorOffset(40)}") { edges { node { uid } } } }`)).violations).toEqual([]);
    expect(decodeCursorOffset(encodeCursorOffset(123))).toBe(123);
  });

  it("bounds recursive filter depth and input list length", async () => {
    let where = '{ uid: { eq: "x" } }';
    for (let i = 0; i < 8; i++) where = `{ AND: [${where}] }`;
    expect(codes(await admit(`{ products(limit: 1, where: ${where}) { uid } }`))).toContain("FILTER_TOO_DEEP");
    const many = Array.from({ length: 51 }, (_, i) => `"hu:product:${i}"`).join(", ");
    expect(codes(await admit(`{ products(limit: 1, where: { uid: { in: [${many}] } }) { uid } }`))).toContain("INPUT_LIST_TOO_LONG");
    expect(codes(await admit("query Q($w: ProductWhere) { products(limit: 1, where: $w) { uid } }", { w: { uid: { in: Array.from({ length: 60 }, (_, i) => `u${i}`) } } }))).toContain("INPUT_LIST_TOO_LONG");
  });

  it("charges connections for their full fanout and totalCount for counting", async () => {
    const plain = await admit("{ products(limit: 1) { variantsConnection(first: 10) { edges { node { uid } } } } }");
    const counted = await admit("{ products(limit: 1) { variantsConnection(first: 10) { totalCount edges { node { uid } } } } }");
    expect(plain.cost).toBe(1 * (1 + 10 * 1 + DEFAULT_ADMISSION_LIMITS.connectionFanoutCost));
    expect(counted.cost - plain.cost).toBe(DEFAULT_ADMISSION_LIMITS.countCost);
  });

  it("charges relationship predicates in filters", async () => {
    const r = await admit('{ assertions(limit: 10, where: { subject: { some: { uid: { eq: "x" } } } }) { uid } }');
    expect(r.cost).toBe(10 + DEFAULT_ADMISSION_LIMITS.relationshipFilterCost);
  });

  it("refuses anything that is not a query", async () => {
    expect(codes(await admit("mutation { x }"))).toContain("OPERATION_INVALID");
  });
});
