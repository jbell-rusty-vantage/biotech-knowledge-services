import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
	assertQualiaTarget,
	buildQualiaIntent,
	consumeQualiaAndVerify,
	validatedBuildQualiaIntent,
	type QualiaInput,
} from "./native-intent.js";
import { planOffline } from "../../../packages/kg-ops/src/write/offline.js";
import { writeSchema } from "../../../packages/kg-ops/src/write/service.js";
import type { IngestionPlanV2 } from "../../../packages/contracts/src/plan-v2.js";

function example(): QualiaInput {
	const digest = `sha256:${"a".repeat(64)}`;
	const evidenceFor = (i: number) => [
		{
			captureId: "a".repeat(32),
			sourceUrl: "https://fixtures.bks.test/qualia/label",
			quote: `Synthetic Product ${i === 1 ? "One" : "Two"}.`,
			fragmentId: `fragment-${i}`,
			fragmentDigest: digest,
		},
	];
	return {
		intentId: "qualia-unit-test",
		context: {
			actor: {
				kind: "agent",
				id: "fixture-test",
				model: "synthetic-test-only",
			},
			run: { system: "mission-control", runId: "qualia-test-run" },
			activityKind: "INGESTION",
		},
		report: {
			reportRevisionId: "synthetic-report-1",
			reportKind: "evidence_report",
			reportKindRef: "evidence_report@1.0.0",
			reportSchema: "research-report.v2",
			bodyDigest: digest,
			ledgerDigest: digest,
			structuredBodyDigest: digest,
			assertions: [1, 2].map((i) => ({
				id: `frozen-${i}`,
				proposition: `The synthetic label names Product ${i}.`,
				qualifiers: { profile: "scientific.v2", entity: `Product ${i}` },
				judgments: [
					{
						id: `observation-${i}`,
						digest,
						outcome: {
							verdict: "full_support",
							qualification: null,
							unsupportedFacets: [],
						},
						rationale: "Synthetic test observation only.",
						method: { kind: "method", id: "synthetic-method", digest },
						target: { kind: "support_set", id: `support-${i}`, digest },
						qualifiersDigest: digest,
						evidence: evidenceFor(i),
					},
				],
				evidence: evidenceFor(i),
				declaredEvidence: evidenceFor(i),
				observedEvidence: evidenceFor(i),
			})),
		},
		captures: [
			{
				captureId: "a".repeat(32),
				ref: "label",
				canonicalUri: "https://fixtures.bks.test/qualia/label",
				title: "Synthetic test only",
				retrievedAt: "2026-10-30T00:00:00Z",
				contentUtf8:
					"Synthetic Product One. Synthetic Product Two. Synthetic material.",
				storageUri: "file:///synthetic-test-only.txt",
				captureMethod: "http-capture/1",
				hashBasis: "STORED_EXCERPT_TEXT",
				completeness: "PARTIAL_EXCERPT",
				locators: [
					{ ref: "quote", exact: "Synthetic Product One." },
					{ ref: "quote-two", exact: "Synthetic Product Two." },
				],
			},
		],
		subjects: [
			{
				ref: "one",
				mode: "new",
				nodeType: "Product",
				name: "Synthetic Product One",
				properties: {
					productKind: "DIETARY_SUPPLEMENT",
					marketedName: "Synthetic Product One",
				},
				onMatch: "use_existing",
			},
			{
				ref: "two",
				mode: "new",
				nodeType: "Product",
				name: "Synthetic Product Two",
				properties: {
					productKind: "DIETARY_SUPPLEMENT",
					marketedName: "Synthetic Product Two",
				},
				onMatch: "use_existing",
			},
			{
				ref: "material",
				mode: "new",
				nodeType: "IngredientMaterial",
				name: "Synthetic material",
				properties: { materialKind: "CHEMICALLY_DEFINED" },
				onMatch: "use_existing",
			},
			{
				ref: "chemical",
				mode: "new",
				nodeType: "ChemicalSubstance",
				name: "Synthetic chemical",
				properties: { substanceClass: "CHEMICAL" },
				onMatch: "use_existing",
			},
		],
		subjectEvidence: {
			one: ["quote"],
			two: ["quote"],
			material: ["quote"],
			chemical: ["quote"],
		},
		proposals: [],
		about: ["one", "two"],
		reportProjection: {
			primaryAssertionId: "frozen-1",
			claims: [1, 2].map((i) => ({
				assertionId: `frozen-${i}`,
				claimRef: `claim-${i}`,
				claimType: "ATTRIBUTE",
			})),
		},
	};
}
test("only authorized Aura URI passes", () => {
	assert.doesNotThrow(() =>
		assertQualiaTarget("neo4j+s://8032ec07.databases.neo4j.io"),
	);
	for (const uri of [
		"neo4j+s://4773dc72.databases.neo4j.io",
		"neo4j+s://8032ec07.databases.neo4j.io.evil.test",
		"bolt://8032ec07.databases.neo4j.io",
		"neo4j+s://user:pass@8032ec07.databases.neo4j.io",
	])
		assert.throws(() => assertQualiaTarget(uri));
});

test("validated build refuses actual per-proposal errors before any finalization", () => {
	const checked = validatedBuildQualiaIntent(example());
	assert.equal(checked.offlinePlanCheck.outcome, "applicable");
	assert.equal(checked.offlinePlanCheck.admitted, false);
	assert.equal(checked.offlinePlanCheck.graphQueries, 0);
	const input = example();
	const first = input.subjects[0]!;
	assert.ok(first.mode === "new");
	first.properties = {
		...first.properties,
		inventedProperty: "bad",
	};
	assert.throws(
		() => validatedBuildQualiaIntent(input),
		(error) => {
			assert.ok(error instanceof Error);
			const refused = JSON.parse(error.message);
			assert.equal(refused.code, "QUALIA_OFFLINE_PLAN_REFUSED");
			assert.equal(refused.admitted, false);
			assert.equal(refused.graphQueries, 0);
			assert.match(JSON.stringify(refused), /inventedProperty/);
			assert.ok(
				refused.subjects.length ||
					refused.proposals.length ||
					refused.errors.length,
			);
			return true;
		},
	);
});
test("captures bind bytes and preserve frozen report; trusted release planner accepts intent offline", () => {
	const input = example();
	const { intent, captures } = buildQualiaIntent(input);
	assert.equal(
		captures[0]?.bytes.toString("utf8"),
		input.captures[0]?.contentUtf8,
	);
	assert.equal(
		intent.subjects.filter((s) => s.nodeType === "Product").length,
		2,
	);
	assert.equal(intent.sources[0]?.snapshot?.contentHash, captures[0]?.digest);
	const { plan } = planOffline(writeSchema(), intent, {
		principal: {
			principalId: "fixture",
			installationId: "fixture-installation",
			applicationId: "biotech",
			tenantId: "f7540aa5-3828-4c8a-9c31-7a87c96fa1b9",
			grants: ["report.publish"],
		},
		plannedAt: "2026-10-30T00:00:00Z",
	});
	assert.equal(plan.errors.length, 0, JSON.stringify(plan.errors));
	assert.equal(plan.outcome, "applicable", JSON.stringify(plan.proposals));
	assert.ok(
		plan.proposals.every((p) => p.disposition === "admitted"),
		JSON.stringify(plan.proposals),
	);
	assert.equal(
		plan.effects.nodes.filter((n) => n.label === "Report").length,
		1,
	);
	assert.equal(
		plan.effects.nodes.filter((n) => n.label === "Assessment").length,
		2,
	);
	assert.equal(plan.effects.nodes.filter((n) => n.label === "Claim").length, 2);
});
test("rejects fabricated selectors, out-of-scope subjects and provenance-free facts", () => {
	const input = example();
	input.captures[0]!.locators[0]!.exact = "Absent quote";
	assert.throws(() => buildQualiaIntent(input), /does not resolve/);
	const unsupported = example();
	unsupported.subjects[0]!.nodeType = "Compound";
	assert.throws(() => buildQualiaIntent(unsupported), /Out-of-scope/);
	const fact = example();
	fact.proposals = [
		{
			proposalId: "unsupported-fact",
			kind: "node.upsert",
			subjectRef: "one",
			properties: { marketedName: "new" },
			evidence: [],
		},
	];
	assert.throws(() => buildQualiaIntent(fact), /requires declared/);
});
test("placeholder graph guide compiles through the real release after explicit synthetic substitution", () => {
	const template = JSON.parse(
		readFileSync(new URL("./schema-template.json", import.meta.url), "utf8"),
	);
	const rendered = JSON.parse(
		JSON.stringify(template)
			.replaceAll(
				"sha256:<HASH_OF_NORMALIZED_CAPTURED_PANEL>",
				`sha256:${"1".repeat(64)}`,
			)
			.replaceAll(
				"sha256:<HASH_OF_NORMALIZED_CAPTURED_COMPOSITION>",
				`sha256:${"2".repeat(64)}`,
			)
			.replaceAll(
				"<ACTUAL_CAPTURE_RFC3339_UTC_INSTANT>",
				"2026-10-30T00:00:00Z",
			),
	);
	const input = example();
	input.subjects = rendered.subjects;
	input.subjectEvidence = rendered.subjectEvidence;
	input.proposals = rendered.proposals;
	input.about = ["product", "org", "person"];
	const refs = [
		...new Set(Object.values(rendered.subjectEvidence).flat()),
	] as string[];
	input.captures[0]!.ref = "source-label";
	input.captures[0]!.contentUtf8 =
		refs.map((ref) => `Synthetic ${ref} evidence.`).join("\n") +
		"\nSynthetic Product One. Synthetic Product Two.";
	input.captures[0]!.locators = [
		...refs.map((ref) => ({ ref, exact: `Synthetic ${ref} evidence.` })),
		{ ref: "quote", exact: "Synthetic Product One." },
		{ ref: "quote-two", exact: "Synthetic Product Two." },
	];
	const { intent } = buildQualiaIntent(input);
	const { plan } = planOffline(writeSchema(), intent, {
		principal: {
			principalId: "fixture",
			installationId: "fixture",
			applicationId: "biotech",
			tenantId: "f7540aa5-3828-4c8a-9c31-7a87c96fa1b9",
			grants: ["report.publish"],
		},
		plannedAt: "2026-10-30T00:00:00Z",
	});
	assert.equal(plan.errors.length, 0, JSON.stringify(plan.errors));
	assert.equal(plan.outcome, "applicable", JSON.stringify(plan.proposals));
	assert.ok(
		plan.proposals.every((p) => p.disposition === "admitted"),
		JSON.stringify(plan.proposals),
	);
	assert.equal(
		plan.effects.nodes.filter((n) => n.label === "Report").length,
		1,
	);
	assert.equal(
		plan.effects.nodes.filter((n) => n.label === "Assessment").length,
		2,
	);
	assert.equal(plan.effects.nodes.filter((n) => n.label === "Claim").length, 2);
});

test("native receipt and physical readback cannot replace an acknowledged exact dispatch", async () => {
	const tenantId = "f7540aa5-3828-4c8a-9c31-7a87c96fa1b9";
	const principal = {
		principalId: "synthetic-test",
		installationId: "test-installation",
		applicationId: "biotech",
		tenantId,
		grants: [],
	};
	const digest = `sha256:${"a".repeat(64)}`;
	const receipt = {
		receiptId: "test-receipt",
		outcome: "applied",
		effect: { effectKey: "test-effect", scope: principal },
		plan: { planDigest: digest },
		admission: {
			dispatchId: "test-dispatch",
			markerDigest: digest,
			payloadDigest: digest,
		},
	};
	const ack = {
		schemaVersion: "biotech-knowledge-admission-ack.v1",
		tenantId,
		dispatchId: "test-dispatch",
		effectKey: "test-effect",
		outcome: "applied",
		markerDigest: digest,
		payloadDigest: digest,
		planDigest: digest,
		receiptId: "test-receipt",
		graph: { bookmark: null, graphRevision: 1, markerKey: "test-marker" },
		appliedAt: "2026-10-30T00:00:00Z",
		componentState: "acknowledged",
		acknowledged: true,
		reason: null,
		retryAfterSeconds: null,
		processedAt: "2026-10-30T00:00:00Z",
	};
	const consume = (results: unknown[]) => ({
		schemaVersion: "biotech-knowledge-admission-consume.v1",
		tenantId,
		claimed: results.length,
		results,
		startedAt: "2026-10-30T00:00:00Z",
		finishedAt: "2026-10-30T00:00:00Z",
	});
	for (const results of [
		[],
		[
			{
				...ack,
				acknowledged: false,
				componentState: "dispatched",
				outcome: "deferred",
			},
		],
		[
			{
				...ack,
				acknowledged: false,
				componentState: "revoked",
				outcome: "revoked",
			},
		],
		[{ ...ack, dispatchId: "different-dispatch" }],
		[{ ...ack, markerDigest: `sha256:${"b".repeat(64)}` }],
	]) {
		let readbacks = 0;
		const recorded: string[] = [];
		const writer = {
			client: { config: { uri: "neo4j+s://8032ec07.databases.neo4j.io" } },
			receipt: async () => ({ found: true, receipt }),
			verifyEffects: async () => {
				readbacks++;
				throw new Error("must not read back unresolved admission");
			},
		};
		await assert.rejects(
			consumeQualiaAndVerify({
				writer: writer as never,
				principal,
				effectKey: "test-effect",
				consume: async () => consume(results),
				record: async (kind) => {
					recorded.push(kind);
				},
			}),
			/acknowledg/,
		);
		assert.equal(readbacks, 0);
		assert.deepEqual(recorded, ["consumer", "native_receipt"]);
	}
	const { plan } = planOffline(
		writeSchema(),
		buildQualiaIntent(example()).intent,
		{
			principal: { ...principal, grants: ["report.publish"] },
			plannedAt: "2026-10-30T00:00:00Z",
		},
	);
	const fullReceipt = {
		...receipt,
		plan: { planDigest: plan.planDigest, planRef: plan.planRef },
		effects: {
			...plan.effects,
			total: plan.effects.nodes.length + plan.effects.relationships.length,
		},
	};
	const fullAck = { ...ack, planDigest: plan.planDigest };
	const items = [
		...plan.effects.nodes.map((n) => ({
			kind: "node",
			key: n.uid,
			ok: true,
			checks: [],
		})),
		...plan.effects.relationships.map((r) => ({
			kind: "relationship",
			key: r.key,
			ok: true,
			checks: [],
		})),
	];
	const page = {
		schemaVersion: "bks-effect-verification.v1",
		effectKey: "test-effect",
		receiptId: "test-receipt",
		total: items.length,
		cursor: 0,
		nextCursor: null,
		complete: true,
		checked: items.length,
		failures: 0,
		items,
	};
	const writer = {
		client: { config: { uri: "neo4j+s://8032ec07.databases.neo4j.io" } },
		plans: { get: async () => ({ plan }) },
		receipt: async () => ({ found: true, receipt: fullReceipt }),
		verifyEffects: async () => page,
	};
	const result = await consumeQualiaAndVerify({
		writer: writer as never,
		principal,
		effectKey: "test-effect",
		consume: async () => consume([fullAck]),
		record: async () => {},
	});
	assert.equal(result.acknowledgement.acknowledged, true);
	assert.equal(result.qualified, false);
	assert.ok(result.proof.reportUid.startsWith("hu:report:"));
	assert.ok(result.proof.requiredSubjectUids.length >= 2);
	assert.equal(result.proof.checkedEffects, items.length);
	await assert.rejects(
		consumeQualiaAndVerify({
			writer: {
				...writer,
				receipt: async () => ({
					found: true,
					receipt: {
						...fullReceipt,
						effects: { nodes: [], relationships: [], total: 0 },
					},
				}),
			} as never,
			principal,
			effectKey: "test-effect",
			consume: async () => consume([fullAck]),
			record: async () => {},
		}),
		/omits the created Report/,
	);
	await assert.rejects(
		consumeQualiaAndVerify({
			writer: {
				...writer,
				verifyEffects: async () => ({
					...page,
					items: items.slice(1),
					checked: items.length - 1,
				}),
			} as never,
			principal,
			effectKey: "test-effect",
			consume: async () => consume([fullAck]),
			record: async () => {},
		}),
		/omitted declared effects/,
	);
});

test("trusted observations project faithfully without promoting world truth", () => {
	const input = example();
	input.report.assertions[0]!.judgments[0]!.outcome = {
		verdict: "qualified_support",
		qualification: "Synthetic restriction.",
		unsupportedFacets: ["population"],
	};
	const { intent } = buildQualiaIntent(input);
	const reports = intent.proposals.filter((p) => p.kind === "report.publish");
	assert.equal(reports.length, 1);
	assert.deepEqual(reports[0]!.about, ["claim-1"]);
	assert.equal(reports[0]!.citesAssessments.length, 2);
	const assessment = intent.proposals.find(
		(p) => p.kind === "assessment.record",
	)!;
	assert.equal(assessment.status, "PROPOSED");
	assert.equal(assessment.verdict, undefined);
	assert.equal(assessment.conclusionCode, "qualified_support");
	const preserved = JSON.parse(assessment.rationaleText!);
	assert.deepEqual(
		preserved.observation.outcome,
		input.report.assertions[0]!.judgments[0]!.outcome,
	);
	assert.deepEqual(
		preserved.qualifiers,
		input.report.assertions[0]!.qualifiers,
	);
});

test("each Assessment cites only its actual judgment context and preserves declared provenance", () => {
	const input = example();
	const assertion = input.report.assertions[0]!;
	const own = assertion.evidence[0]!;
	const contextual = input.report.assertions[1]!.evidence[0]!;
	assertion.evidence = [own, contextual];
	assertion.declaredEvidence = [own];
	assertion.observedEvidence = [own, contextual];
	assertion.judgments.push({
		...assertion.judgments[0]!,
		id: "second-context-observation",
		evidence: [contextual],
		outcome: {
			verdict: "partial_or_context_only",
			qualification: "Synthetic other-claim context only.",
			unsupportedFacets: ["entity"],
		},
	});
	const { intent, offlinePlanCheck } = validatedBuildQualiaIntent(input);
	assert.equal(offlinePlanCheck.outcome, "applicable");
	const assessments = intent.proposals
		.filter((p) => p.kind === "assessment.record")
		.filter((p) => p.about.includes("claim-1"));
	assert.equal(assessments.length, 2);
	assert.deepEqual(assessments[0]!.evidence, [
		{ locator: "quote", role: "CONTEXT" },
	]);
	assert.deepEqual(assessments[1]!.evidence, [
		{ locator: "quote-two", role: "CONTEXT" },
	]);
	for (const [i, assessment] of assessments.entries()) {
		assert.equal(assessment.status, "PROPOSED");
		assert.equal(assessment.verdict, undefined);
		const payload = JSON.parse(assessment.rationaleText!);
		assert.deepEqual(payload.evidenceProvenance, {
			fragments: [own.fragmentId, contextual.fragmentId],
			declared: [0],
			observed: [0, 1],
		});
		assert.deepEqual(payload.observation.evidence, [i]);
		assert.deepEqual(
			payload.observation.outcome,
			assertion.judgments[i]!.outcome,
		);
	}
	const report = intent.proposals.find((p) => p.kind === "report.publish")!;
	assert.ok(
		report.evidence.every(
			(e) => typeof e === "object" && "role" in e && e.role === "CONTEXT",
		),
	);
	assert.equal(report.citesAssessments.length, 3);
});

test("declared evidence omitted by the judge remains report context without becoming Assessment support", () => {
	const input = example();
	const assertion = input.report.assertions[0]!;
	const declaredOnly = input.report.assertions[1]!.evidence[0]!;
	assertion.evidence.push(declaredOnly);
	assertion.declaredEvidence.push(declaredOnly);
	const { intent } = buildQualiaIntent(input);
	const assessment = intent.proposals.find(
		(p) => p.kind === "assessment.record",
	)!;
	assert.deepEqual(assessment.evidence, [
		{ locator: "quote", role: "CONTEXT" },
	]);
	const payload = JSON.parse(assessment.rationaleText!);
	assert.deepEqual(payload.evidenceProvenance.declared, [0, 1]);
	assert.deepEqual(payload.evidenceProvenance.observed, [0]);
});

test("judgment evidence refuses rebinding, unknown identities, missing evidence and duplicates", () => {
	for (const change of [
		"captureId",
		"sourceUrl",
		"quote",
		"fragmentId",
		"fragmentDigest",
		"missing",
		"duplicate",
	] as const) {
		const input = example();
		const judgment = input.report.assertions[0]!.judgments[0]!;
		if (change === "missing")
			delete (judgment as { evidence?: unknown }).evidence;
		else if (change === "duplicate")
			judgment.evidence.push({ ...judgment.evidence[0]! });
		else
			judgment.evidence[0] = { ...judgment.evidence[0]!, [change]: "altered" };
		assert.throws(() => buildQualiaIntent(input), /evidence|context/);
	}
	const input = example();
	input.report.assertions[0]!.observedEvidence = [];
	assert.throws(() => buildQualiaIntent(input), /observed evidence union/);
});

test("frozen support locators are generated from actual captured bytes without model copying", () => {
	const input = example();
	input.captures[0]!.contentUtf8 +=
		" Unique retained context for the first product.";
	input.report.assertions[0]!.evidence.push({
		...input.report.assertions[0]!.evidence[0]!,
		fragmentId: "context-fragment",
		quote: "Unique retained context for the first product.",
	});
	input.report.assertions[0]!.declaredEvidence.push(
		input.report.assertions[0]!.evidence.at(-1)!,
	);
	const original = JSON.stringify(input);
	const { intent } = buildQualiaIntent(input);
	assert.equal(JSON.stringify(input), original);
	assert.ok(
		intent.sources[0]!.locators.some(
			(l) =>
				l.exact === "Unique retained context for the first product." &&
				l.ref.startsWith("qualia-support-"),
		),
	);
	assert.ok(intent.sources.every((s) => !("captureId" in s)));
});

test("realistic four-fragment support observations remain lossless within native quota", () => {
	const input = example();
	const digest = `sha256:${"b".repeat(64)}`;
	const ref = (kind: string, suffix: string) => ({
		kind,
		id: `qualia-${"a".repeat(48)}-revision-r1-${suffix}`,
		digest,
		tenant: "f7540aa5-3828-4c8a-9c31-7a87c96fa1b9",
		binding: "biotech-graph",
		version: `research-core.${kind}.v2`,
	});
	const judgment = input.report.assertions[0]!.judgments[0]!;
	const assertion = input.report.assertions[0]!;
	input.captures[0]!.contentUtf8 += " Fourth retained study context.";
	const quotes = [
		"Synthetic Product One.",
		"Synthetic Product Two.",
		"Synthetic material.",
		"Fourth retained study context.",
	];
	assertion.evidence = quotes.map((quote, i) => ({
		...assertion.evidence[0]!,
		quote,
		fragmentId: ref("fragment", `f${i + 1}`).id,
		fragmentDigest: digest,
	}));
	assertion.declaredEvidence = assertion.evidence.slice(0, 1);
	assertion.observedEvidence = [...assertion.evidence];
	judgment.evidence = [...assertion.evidence];
	judgment.outcome = {
		verdict: "full_support",
		premise: null,
		citedFragments: [1, 2, 3, 4].map((n) => ref("fragment", `f${n}`)),
		contradictingFragments: [],
		unsupportedFacets: [],
		qualification: null,
	};
	judgment.method = ref("method", "independent-evaluator");
	judgment.target = ref("support_set", "source-support");
	judgment.rationale =
		"Captured source supports the attributed formulation and bounded endpoint. ".repeat(
			8,
		);
	const { intent } = buildQualiaIntent(input);
	const assessment = intent.proposals.find(
		(p) => p.kind === "assessment.record",
	)!;
	assert.ok(assessment.rationaleText!.length <= 4000);
	assert.deepEqual(
		JSON.parse(assessment.rationaleText!).observation.outcome,
		judgment.outcome,
	);
	judgment.rationale =
		"Oversized actual observation must never be silently shortened. ".repeat(
			100,
		);
	assert.throws(() => buildQualiaIntent(input), /Lossless KS observation/);
});

test("rejects missing or fabricated frozen projection bindings", () => {
	for (const corrupt of [
		(i: QualiaInput) => {
			i.reportProjection.primaryAssertionId = "invented";
		},
		(i: QualiaInput) => {
			i.reportProjection.claims.pop();
		},
		(i: QualiaInput) => {
			i.reportProjection.claims[0]!.assertionId = "invented";
		},
		(i: QualiaInput) => {
			i.report.assertions[0]!.judgments = [];
		},
		(i: QualiaInput) => {
			i.report.assertions[0]!.evidence[0]!.captureId = "b".repeat(32);
		},
	]) {
		const input = example();
		corrupt(input);
		assert.throws(() => buildQualiaIntent(input));
	}
});

test("full planner rejects product-targeted or uncited evidence reports even with no top-level errors", () => {
	for (const corrupt of [
		(p: Record<string, unknown>) => {
			p.about = ["one", "two"];
		},
		(p: Record<string, unknown>) => {
			p.citesAssessments = [];
		},
	]) {
		const { intent } = buildQualiaIntent(example());
		corrupt(intent.proposals.find((p) => p.kind === "report.publish")!);
		const { plan } = planOffline(writeSchema(), intent, {
			principal: {
				principalId: "fixture",
				installationId: "fixture",
				applicationId: "biotech",
				tenantId: "f7540aa5-3828-4c8a-9c31-7a87c96fa1b9",
				grants: ["report.publish"],
			},
			plannedAt: "2026-10-30T00:00:00Z",
		});
		assert.notEqual(plan.outcome, "applicable");
		assert.ok(
			plan.proposals.some(
				(p) => p.kind === "report.publish" && p.disposition === "rejected",
			),
		);
	}
});

function proofBoundary(plan: IngestionPlanV2) {
	const digest = `sha256:${"a".repeat(64)}`;
	const principal = {
		principalId: "fixture",
		installationId: "test-installation",
		applicationId: "biotech",
		tenantId: "f7540aa5-3828-4c8a-9c31-7a87c96fa1b9",
		grants: [],
	};
	const receipt = {
		receiptId: "proof-receipt",
		outcome: "applied",
		effect: { effectKey: "proof-effect", scope: principal },
		plan: { planDigest: plan.planDigest, planRef: plan.planRef },
		admission: {
			dispatchId: "proof-dispatch",
			markerDigest: digest,
			payloadDigest: digest,
		},
		effects: {
			...structuredClone(plan.effects),
			total: plan.effects.nodes.length + plan.effects.relationships.length,
		},
	};
	const ack = {
		schemaVersion: "biotech-knowledge-admission-ack.v1",
		tenantId: principal.tenantId,
		dispatchId: "proof-dispatch",
		effectKey: "proof-effect",
		outcome: "applied",
		markerDigest: digest,
		payloadDigest: digest,
		planDigest: plan.planDigest,
		receiptId: receipt.receiptId,
		graph: { bookmark: null, graphRevision: 1, markerKey: "proof-marker" },
		appliedAt: "2026-10-30T00:00:00Z",
		componentState: "acknowledged",
		acknowledged: true,
		reason: null,
		retryAfterSeconds: null,
		processedAt: "2026-10-30T00:00:00Z",
	};
	const items = [
		...receipt.effects.nodes.map((n) => ({
			kind: "node",
			key: n.uid,
			ok: true,
			checks: [{ name: "exists", ok: true }],
		})),
		...receipt.effects.relationships.map((r) => ({
			kind: "relationship",
			key: r.key,
			ok: true,
			checks: [
				{ name: "exists", ok: true },
				{ name: "endpoints", ok: true },
			],
		})),
	];
	const page = {
		schemaVersion: "bks-effect-verification.v1",
		effectKey: "proof-effect",
		receiptId: receipt.receiptId,
		total: items.length,
		cursor: 0,
		nextCursor: null,
		complete: true,
		checked: items.length,
		failures: 0,
		items,
	};
	const records: Array<{ kind: string; value: unknown }> = [];
	const calls = { readback: 0 };
	const writer = {
		client: { config: { uri: "neo4j+s://8032ec07.databases.neo4j.io" } },
		plans: { get: async () => ({ plan }) },
		receipt: async () => ({ found: true, receipt }),
		verifyEffects: async () => {
			calls.readback++;
			return page;
		},
	};
	const invoke = () =>
		consumeQualiaAndVerify({
			writer: writer as never,
			principal,
			effectKey: "proof-effect",
			consume: async () => ({
				schemaVersion: "biotech-knowledge-admission-consume.v1",
				tenantId: principal.tenantId,
				claimed: 1,
				results: [ack],
				startedAt: "2026-10-30T00:00:00Z",
				finishedAt: "2026-10-30T00:00:00Z",
			}),
			record: async (kind, value) => {
				records.push({ kind, value });
			},
		});
	return { receipt, page, records, calls, invoke };
}

function forkReusePlan() {
	const intent = buildQualiaIntent(example()).intent;
	const options = {
		principal: {
			principalId: "fixture",
			installationId: "test-installation",
			applicationId: "biotech",
			tenantId: "f7540aa5-3828-4c8a-9c31-7a87c96fa1b9",
			grants: ["report.publish"],
		},
		plannedAt: "2026-10-30T00:00:00Z",
	};
	const initial = planOffline(writeSchema(), intent, options).plan;
	const claim = initial.subjects.find((s) => s.nodeType === "Claim")!;
	assert.ok(claim.uid);
	const { plan } = planOffline(writeSchema(), intent, {
		...options,
		seed: {
			[`node:${claim.uid}`]: { labels: claim.labels, props: {} },
			[`uid:${claim.uid}`]: claim.labels,
		},
	});
	assert.equal(plan.outcome, "applicable");
	const reused = plan.subjects.find((s) => s.uid === claim.uid)!;
	assert.equal(reused.disposition, "use_existing");
	assert.ok(reused.matches.some((m) => m.uid === reused.uid));
	assert.ok(!plan.effects.nodes.some((n) => n.uid === reused.uid));
	return { plan, reused };
}

test("fork reuse needs no artificial Claim write when exact relationship readback proves existence", async () => {
	const { plan, reused } = forkReusePlan();
	const boundary = proofBoundary(plan);
	const result = await boundary.invoke();
	assert.ok(result.proof.reusedSubjectUids.includes(reused.uid));
	assert.ok(
		boundary.records.some(
			(r) =>
				r.kind === "native_plan" &&
				(r.value as { plan: IngestionPlanV2 }).plan === plan,
		),
	);
});

test("complete effect multiset refuses omitted nodes, relationships, altered endpoints and extra duplicates", async () => {
	const { plan } = forkReusePlan();
	for (const corrupt of [
		(b: ReturnType<typeof proofBoundary>) => {
			b.receipt.effects.nodes.splice(
				b.receipt.effects.nodes.findIndex((n) => n.label === "Claim"),
				1,
			);
		},
		(b: ReturnType<typeof proofBoundary>) => {
			b.receipt.effects.relationships.pop();
		},
		(b: ReturnType<typeof proofBoundary>) => {
			b.receipt.effects.relationships[0]!.toUid = "hu:claim:wrong";
		},
		(b: ReturnType<typeof proofBoundary>) => {
			b.receipt.effects.nodes.push({ ...b.receipt.effects.nodes[0]! });
		},
	]) {
		const boundary = proofBoundary(plan);
		corrupt(boundary);
		boundary.receipt.effects.total =
			boundary.receipt.effects.nodes.length +
			boundary.receipt.effects.relationships.length;
		await assert.rejects(
			boundary.invoke(),
			/subject effects|complete stored plan multiset/,
		);
		assert.equal(boundary.calls.readback, 0);
	}
});

test("reused Claim proof rejects missing physical endpoint checks and false endpoint readback", async () => {
	const { plan, reused } = forkReusePlan();
	for (const failed of [false, true]) {
		const boundary = proofBoundary(plan);
		const keys = new Set(
			plan.effects.relationships
				.filter((r) => r.fromUid === reused.uid || r.toUid === reused.uid)
				.map((r) => r.key),
		);
		for (const item of boundary.page.items.filter(
			(i) => i.kind === "relationship" && keys.has(i.key),
		))
			item.checks = failed ? [{ name: "exists", ok: false }] : [];
		await assert.rejects(
			boundary.invoke(),
			/Native effect readback failed|physically verified/,
		);
	}
});

test("stored plan content must still hash to the receipt-bound plan digest", async () => {
	const { plan } = forkReusePlan();
	const boundary = proofBoundary(plan);
	plan.effects.relationships[0]!.toUid = "hu:claim:tampered-plan";
	await assert.rejects(boundary.invoke(), /Stored native plan content/);
	assert.equal(boundary.calls.readback, 0);
	assert.ok(boundary.records.some((r) => r.kind === "native_plan"));
});
