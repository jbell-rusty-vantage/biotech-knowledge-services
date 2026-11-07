/** Fixture navigation only. The byte-verified pinned release remains the schema authority. */
import { readFileSync, writeFileSync } from "node:fs";
import { writeSchema } from "../../../packages/kg-ops/src/write/service.js";

const partial = JSON.parse(
	readFileSync(new URL("./partial-schema.json", import.meta.url), "utf8"),
);
const schema = writeSchema();
if (schema.schemaReleaseDigest !== partial.schemaReleaseDigest)
	throw new Error("Fixture vocabulary release mismatch");
const names = new Set<string>([
	...partial.domainSubjects,
	"Claim",
	"Assessment",
	"Report",
	"Assertion",
	"Activity",
]);
const sorted = <T extends { name: string }>(values: Iterable<T>) =>
	[...values].sort((a, b) => a.name.localeCompare(b.name, "en"));
const nodes = Object.fromEntries(
	sorted(schema.nodes.values())
		.filter((n) => names.has(n.name))
		.map((n) => [
			n.name,
			{
				labels: n.labels,
				kernelRecord: n.kernelRecord,
				executorOps: [...n.executorOps].sort(),
				properties: Object.fromEntries(
					[...n.properties.values()]
						.sort((a, b) => a.name.localeCompare(b.name, "en"))
						.map((p) => [
							p.name,
							{
								type: p.type,
								required: p.isRequired,
								description: p.description,
								...(schema.enums.has(p.namedType)
									? { enumValues: [...schema.enums.get(p.namedType)!].sort() }
									: {}),
							},
						]),
				),
			},
		]),
);
const predicates = Object.fromEntries(
	sorted(schema.predicates.values())
		.filter(
			(p) =>
				p.status === "registered" &&
				[...p.subjectTypes].some((t) => names.has(t)),
		)
		.map((p) => [
			p.name,
			{
				status: p.status,
				kind: p.kind,
				subjectTypes: [...p.subjectTypes].sort(),
				objectTypes: [...p.objectTypes].sort(),
				valueFields: p.valueFields,
				qualifiers: [...p.qualifiers].sort(),
				requiredQualifiers: p.requiredQualifiers,
				field: p.field,
			},
		]),
);
const relationships = Object.fromEntries(
	[...schema.rels.values()]
		.sort((a, b) => a.type.localeCompare(b.type, "en"))
		.filter((r) =>
			[...r.triples].some((t) => t.split("|").every((n) => names.has(n))),
		)
		.map((r) => [
			r.type,
			{
				class: r.relClass,
				executorOwned: r.executorOwned,
				triples: [...r.triples].sort(),
				profiles: r.profiles,
			},
		]),
);
const value = {
	schemaVersion: "qualia-native-vocabulary.v1",
	releaseId: schema.releaseId,
	schemaReleaseDigest: schema.schemaReleaseDigest,
	schemaDigest: schema.schemaDigest,
	rules: [
		"Navigation generated from the verified pinned release; not evidence about any Qualia entity.",
		"Choose a predicate only when its meaning, subject, object, literal and qualifiers match actual evidence.",
		"No generic source-report predicate exists. Never attach a proposition to an unrelated predicate to satisfy a report citation.",
		"Authorizing predicates require the corresponding edge.assert shape; executor-owned relationships cannot be authored as structural edges.",
	],
	nodes,
	predicates,
	relationships,
};
const text = JSON.stringify(value, null, 2) + "\n";
const destination = new URL("./native-vocabulary.json", import.meta.url);
if (process.argv.includes("--check")) {
	if (readFileSync(destination, "utf8") !== text)
		throw new Error("Fixture native vocabulary is stale");
} else writeFileSync(destination, text);
