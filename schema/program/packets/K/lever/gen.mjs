// Lever experiment generator: kernel core + N synthetic domain types, one SDL per variant.
// usage: node gen.mjs <outDir>
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const out = process.argv[2];
mkdirSync(out, { recursive: true });

// target: union | entity | thin | cypher
// agg: true => aggregate:false + @query(aggregate:false); nest: true => nestedOperations declared; mut: @mutation(operations: [])
// fwd: domain types declare forward identifiers (HAS_IDENTIFIER OUT) through @declareRelationship on the interface
const VARIANTS = {
  U0: { target: "union", agg: false, nest: false, mut: false },
  U2: { target: "union", agg: true, nest: true, mut: false },
  A: { target: "entity", agg: true, nest: true, mut: false },
  B: { target: "cypher", agg: true, nest: true, mut: false },
  C: { target: "thin", agg: true, nest: true, mut: false },
  C_noR2: { target: "thin", agg: false, nest: true, mut: false },
  C_noR3: { target: "thin", agg: true, nest: false, mut: false },
  C_fwd: { target: "thin", agg: true, nest: true, mut: false, fwd: true },
  C_M: { target: "thin", agg: true, nest: true, mut: true },
  B_M: { target: "cypher", agg: true, nest: true, mut: true },
  C_MF: { target: "thin", agg: true, nest: true, mut: true, filt: true },
  C_F: { target: "thin", agg: true, nest: true, mut: false, filt: true },
};

function gen(v, n) {
  const q = v.agg ? " @query(aggregate: false)" : "";
  const m = v.mut ? " @mutation(operations: [])" : "";
  const rel = (type, dir, cls, extra = "") => {
    const parts = [`type: "${type}"`, `direction: ${dir}`];
    if (extra) parts.push(extra);
    if (v.nest) parts.push(`nestedOperations: ${cls === "structural" ? "[CREATE, CONNECT]" : cls === "asserted" ? "[CONNECT]" : "[]"}`);
    if (v.agg) parts.push("aggregate: false");
    const settable = (cls === "derived" ? " @settable(onCreate: false, onUpdate: false)" : "") + (v.filt ? " @filterable(byValue: true, byAggregate: false)" : "");
    return `@relationship(${parts.join(", ")})${settable}`;
  };
  const doms = Array.from({ length: n }, (_, i) => `Dom${i + 1}`);
  const subjTarget = v.target === "union" ? "AnySubject" : v.target === "entity" ? "Entity" : "Subjectable";
  const anyField = (name, type, dir, cls, props = "") =>
    v.target === "cypher"
      ? `  ${name}: [Subjectable!]! @cypher(statement: "MATCH (this)${dir === "OUT" ? "-" : "<-"}[:${type}]${dir === "OUT" ? "->" : "-"}(n) RETURN n", columnName: "n")`
      : `  ${name}: [${subjTarget}!]! ${rel(type, dir, cls, props ? `properties: "${props}"` : "")}`;
  const entityFields = `  id: ID! @id
  uid: String!
  name: String
  privacyClass: PrivacyClass
  lastWriterRunId: String
  createdAt: DateTime! @timestamp(operations: [CREATE])
  updatedAt: DateTime! @timestamp(operations: [CREATE, UPDATE])`;
  const kernelImpl = v.target === "entity" ? " implements Entity" : "";
  let s = `enum PrivacyClass { PUBLIC INTERNAL }
enum AssertionStatus { PROPOSED ACCEPTED DISPUTED REJECTED SUPERSEDED }
interface Entity {
  id: ID!
  uid: String!
  name: String
  privacyClass: PrivacyClass
  lastWriterRunId: String
}
interface Subjectable {
  uid: String!
  name: String
${v.fwd ? `  identifiers: [Identifier!]! @declareRelationship\n` : ""}}
type AssertedEdgeProperties @relationshipProperties {
  relationshipUid: String!
  assertionUid: String!
  validFrom: DateTime
  validTo: DateTime
  recordedFrom: DateTime!
  recordedTo: DateTime
  lastWriterRunId: String
}
type DerivedEdgeProperties @relationshipProperties {
  derivationRule: String
  derivedFromAssertionUids: [String!]
  derivedAt: DateTime
  lastWriterRunId: String
}
type Assertion${kernelImpl} @node(labels: ["Assertion"])${q}${m} {
${entityFields}
  predicate: String!
  status: AssertionStatus!
  validFrom: DateTime
  validTo: DateTime
  recordedAt: DateTime!
${anyField("subject", "HAS_SUBJECT", "OUT", "structural")}
${anyField("object", "HAS_OBJECT", "OUT", "structural")}
  supportedBy: [SourceLocator!]! ${rel("SUPPORTED_BY", "OUT", "structural")}
  generatedBy: [Activity!]! ${rel("WAS_GENERATED_BY", "OUT", "structural")}
}
type SourceLocator${kernelImpl} @node(labels: ["SourceLocator"])${q}${m} {
${entityFields}
  exact: String
  startOffset: Int
  endOffset: Int
  supports: [Assertion!]! ${rel("SUPPORTED_BY", "IN", "structural")}
}
type Activity${kernelImpl} @node(labels: ["Activity"])${q}${m} {
${entityFields}
  missionId: String
  runId: String
  startedAt: DateTime
${v.target === "cypher" ? `  generated: [Subjectable!]! @cypher(statement: "MATCH (this)<-[:WAS_GENERATED_BY]-(n) RETURN n", columnName: "n")` : `  generated: [${v.target === "union" ? "AnySubject" : v.target === "entity" ? "Entity" : "Subjectable"}!]! ${rel("WAS_GENERATED_BY", "IN", "structural")}`}
}
type Identifier${kernelImpl} @node(labels: ["Identifier"])${q}${m} {
${entityFields}
  scheme: String!
  value: String!
${anyField("identifies", "HAS_IDENTIFIER", "IN", "asserted", "AssertedEdgeProperties")}
}
type Chunk${kernelImpl} @node(labels: ["Chunk"])${q}${m} {
${entityFields}
  text: String
${v.target === "cypher" ? anyField("mentions", "MENTIONS", "OUT", "derived") : `  mentions: [${subjTarget}!]! ${rel("MENTIONS", "OUT", "derived", 'properties: "DerivedEdgeProperties"')}`}
}
`;
  if (v.target === "union") s += `union AnySubject = ${doms.join(" | ")}\n`;
  doms.forEach((d, i) => {
    const next = doms[(i + 1) % doms.length];
    const impl = v.target === "union" ? "" : v.target === "entity" ? " implements Entity" : " implements Entity & Subjectable";
    const fwd = v.fwd ? `  identifiers: [Identifier!]! ${rel("HAS_IDENTIFIER", "OUT", "asserted", 'properties: "AssertedEdgeProperties"')}\n` : "";
    s += `type ${d}${impl.replace(" implements Entity & Subjectable", " implements Entity & Subjectable")} @node(labels: ["${d}"])${q}${m} {
${entityFields}
  p1: String
  p2: Float
  p3: Int
  p4: DateTime
  p5: Boolean
  partOf: [${d}!]! ${rel(`PART_OF_${i + 1}`, "OUT", "structural")}
  relatesTo: [${next}!]! ${rel(`RELATES_${i + 1}`, "OUT", "asserted", 'properties: "AssertedEdgeProperties"')}
  similarTo: [${next}!]! ${rel(`SIMILAR_${i + 1}`, "OUT", "derived", 'properties: "DerivedEdgeProperties"')}
${fwd}}
`;
  });
  if (v.target === "entity") s = s.replace(/interface Subjectable \{[\s\S]*?\n\}\n/, "");
  return s;
}

for (const [name, v] of Object.entries(VARIANTS)) for (const n of [5, 10]) writeFileSync(join(out, `${name}-${n}.graphql`), gen(v, n), "utf8");
console.log(Object.keys(VARIANTS).join(" "));
