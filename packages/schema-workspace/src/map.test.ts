import { describe, expect, it } from "vitest";
import { renderSchemaMap } from "./map.js";
import { loadRelease } from "./release.js";
import { loadSidecars } from "./sidecars.js";

const ir = loadRelease().ir;
const sidecars = loadSidecars();

describe("renderSchemaMap", () => {
  it("is deterministic and carries the schema digest instead of a timestamp", () => {
    const a = renderSchemaMap(ir, sidecars);
    const b = renderSchemaMap(ir, sidecars);
    expect(a).toBe(b);
    expect(a).toContain(ir.schemaDigest);
    expect(a).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
  });

  it("renders node-edge-node patterns with class and edge properties", () => {
    const productDomain = sidecars.domains.find((d) => d.fragments.includes("D6"))!;
    const text = renderSchemaMap(ir, sidecars, { domains: [productDomain.slug] });
    expect(text).toContain("(Product)-[:HAS_VARIANT {StructuralEdgeProperties}]->(ProductVariant)  structural");
    expect(text).toContain("### Product");
    expect(text).toMatch(/\| uid \| `String!` \| identity \|/);
    expect(text).not.toContain("### Assertion\n");
  });

  it("ranks relationship types by expanded from→to pairs", () => {
    const text = renderSchemaMap(ir, sidecars, { topRelationships: 3 });
    const rows = text.split("\n").filter((l) => /^\| \d+ \| /.test(l));
    expect(rows).toHaveLength(3);
    // Interface (Subjectable / Entity) targets lead the expanded pair count.
    expect(rows[0]).toMatch(/^\| 1 \| (ASSESSES|WAS_GENERATED_BY|HAS_SUBJECT|HAS_OBJECT|HAS_IDENTIFIER|ASSERTED_BY) \|/);
  });
});
