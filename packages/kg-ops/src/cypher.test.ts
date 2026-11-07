import { describe, expect, it } from "vitest";
import { validateCypher } from "./cypher.js";
import { splitCypherStatements } from "./operations.js";
import { hostAndPathSlug, slugify, uidOf, uidSegment, uidToken } from "./uid.js";

describe("cypher guard", () => {
  it("lets bounded reads through and flags missing LIMIT as info", () => {
    const d = validateCypher("MATCH (n:Product) RETURN n.uid, n.name", "read");
    expect(d.filter((x) => x.severity === "error")).toHaveLength(0);
    expect(d.some((x) => x.severity === "info")).toBe(true);
  });
  it("blocks writes in read mode and DDL everywhere", () => {
    expect(validateCypher("MATCH (n) SET n.x = 1", "read").some((d) => d.severity === "error")).toBe(true);
    expect(validateCypher("DROP CONSTRAINT foo", "write").some((d) => d.severity === "error")).toBe(true);
    expect(validateCypher("CREATE INDEX x FOR (n:A) ON (n.b)", "write").some((d) => d.severity === "error")).toBe(true);
    expect(validateCypher("CALL apoc.periodic.iterate('x','y',{})", "write").some((d) => d.severity === "error")).toBe(true);
  });
  it("refuses unfiltered mass deletes outright and warns on scoped deletes", () => {
    expect(validateCypher("MATCH (n) DETACH DELETE n", "write").some((d) => d.severity === "error")).toBe(true);
    const scoped = validateCypher("MATCH (n:Mention {uid: 'hu:mention:x'}) DETACH DELETE n", "write");
    expect(scoped.some((d) => d.severity === "error")).toBe(false);
    expect(scoped.some((d) => d.severity === "warning")).toBe(true);
  });
  it("never lets private uid prefixes through", () => {
    expect(validateCypher("MATCH (n {uid: 'hu:private-user-1'}) RETURN n", "read").some((d) => d.severity === "error")).toBe(true);
  });
});

describe("operations splitter", () => {
  it("splits on terminating semicolons and drops comments", () => {
    const text = "// comment\nCREATE CONSTRAINT a IF NOT EXISTS FOR (n:A) REQUIRE n.uid IS UNIQUE;\nMATCH (n)\nWHERE n.x = 1 // trailing\nSET n.y = 2;";
    const parts = splitCypherStatements(text);
    expect(parts).toHaveLength(2);
    expect(parts[1]).toContain("SET n.y = 2");
    expect(parts[1]).not.toContain("trailing");
  });
});

describe("uid helpers", () => {
  it("slugifies deterministically and round-trips tokens", () => {
    expect(slugify("Elysium Health, Inc.")).toBe("elysium-health-inc");
    expect(slugify("Nicotinamide Riboside Chloride (NR-Cl)")).toBe("nicotinamide-riboside-chloride-nr-cl");
    const uid = uidOf("product", "elysium-basis");
    expect(uidToken(uid)).toBe("product");
    expect(uidSegment(uid)).toBe("elysium-basis");
    expect(hostAndPathSlug("https://www.elysiumhealth.com/pages/basis-supplement-facts/")).toBe("elysiumhealth-com-pages-basis-supplement-facts");
  });
});
