import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
	IngestionIntentV2,
	type IngestionIntentV2Input,
} from "../../../packages/contracts/src/intent-v2.js";
import {
	VerifyEffectsPage,
	type IngestionReceiptV2,
} from "../../../packages/contracts/src/apply-v2.js";
import { AdmissionConsumeReportV1 } from "../../../packages/contracts/src/admission.js";
import type { KnowledgeWriter } from "../../../packages/kg-ops/src/write/service.js";
import type { PrincipalCtx } from "../../../packages/kg-ops/src/write/context.js";
import { planOffline } from "../../../packages/kg-ops/src/write/offline.js";
import { writeSchema } from "../../../packages/kg-ops/src/write/service.js";
import { planDigestOf } from "../../../packages/kg-ops/src/plan.js";

export const partialSchema = JSON.parse(
	readFileSync(new URL("./partial-schema.json", import.meta.url), "utf8"),
) as {
	schemaReleaseDigest: string;
	targetHost: string;
	domainSubjects: string[];
	proposalKinds: string[];
	reportKinds: Record<string, string>;
};
const sha = (bytes: string | Uint8Array) =>
	`sha256:${createHash("sha256").update(bytes).digest("hex")}`;

/** No connection, enumeration, deletion or schema installation. Enforce the owner-authorized graph identity. */
export function assertQualiaTarget(uri: string): void {
	const target = new URL(uri);
	if (
		target.protocol !== "neo4j+s:" ||
		target.hostname !== partialSchema.targetHost ||
		target.username ||
		target.password ||
		target.port ||
		target.search ||
		target.hash ||
		(target.pathname !== "" && target.pathname !== "/")
	) {
		throw new Error(
			"Qualia fixture requires the authorized biotech Aura target over neo4j+s",
		);
	}
}

export interface FrozenEvidence {
	captureId: string;
	sourceUrl: string;
	quote: string;
	fragmentId: string;
	fragmentDigest: string;
}

const evidenceIdentity = (e: FrozenEvidence) =>
	JSON.stringify([
		e.fragmentId,
		e.fragmentDigest,
		e.captureId,
		e.sourceUrl,
		e.quote,
	]);

export interface FrozenReport {
	reportRevisionId: string;
	reportKind: "evidence_report" | "study_appraisal";
	reportKindRef: string;
	reportSchema: "research-report.v2";
	bodyDigest: string;
	ledgerDigest: string;
	structuredBodyDigest: string;
	assertions: Array<{
		id: string;
		proposition: string;
		qualifiers: Record<string, unknown>;
		judgments: Array<{
			id: string;
			digest: string;
			outcome: Record<string, unknown>;
			rationale: string;
			method: unknown;
			qualifiersDigest: string;
			target: unknown;
			evidence: FrozenEvidence[];
		}>;
		evidence: FrozenEvidence[];
		declaredEvidence: FrozenEvidence[];
		observedEvidence: FrozenEvidence[];
	}>;
}
export interface CaptureInput {
	captureId: string;
	ref: string;
	canonicalUri: string;
	title: string;
	retrievedAt: string;
	/** Exact retained UTF-8 bytes supplied by the actual acquisition tool; never model-reconstructed source text. */
	contentUtf8: string;
	storageUri: string;
	captureMethod: string;
	hashBasis: "RAW_BYTES" | "TOOL_RENDITION" | "STORED_EXCERPT_TEXT";
	completeness: "COMPLETE" | "PARTIAL_EXCERPT" | "UNKNOWN";
	locators: Array<{ ref: string; exact: string; reportsFields?: string[] }>;
}

/** Exact projection payload, also usable for offline quota checks over real frozen metadata. */
export function qualiaObservationRationale(
	assertion: FrozenReport["assertions"][number],
	judgment: FrozenReport["assertions"][number]["judgments"][number],
): string {
	const index = (e: FrozenEvidence) =>
		assertion.evidence.findIndex(
			(item) => evidenceIdentity(item) === evidenceIdentity(e),
		);
	const text = JSON.stringify({
		assertionId: assertion.id,
		qualifiers: assertion.qualifiers,
		evidenceProvenance: {
			fragments: assertion.evidence.map((e) => e.fragmentId),
			declared: assertion.declaredEvidence.map(index),
			observed: assertion.observedEvidence.map(index),
		},
		observation: {
			id: judgment.id,
			digest: judgment.digest,
			outcome: judgment.outcome,
			rationale: judgment.rationale,
			method: judgment.method,
			qualifiersDigest: judgment.qualifiersDigest,
			target: judgment.target,
			evidence: judgment.evidence.map(index),
		},
	});
	if (text.length > 4000)
		throw new Error(
			"Lossless KS observation projection exceeds native Assessment rationale quota",
		);
	return text;
}
export interface QualiaInput {
	intentId: string;
	context: IngestionIntentV2Input["context"];
	report: FrozenReport;
	captures: CaptureInput[];
	subjects: NonNullable<IngestionIntentV2Input["subjects"]>;
	/** Captured locator refs supporting each newly declared subject's authored fields. */
	subjectEvidence: Record<string, string[]>;
	proposals: NonNullable<IngestionIntentV2Input["proposals"]>;
	about: string[];
	reportProjection: {
		primaryAssertionId: string;
		claims: Array<{ assertionId: string; claimRef: string; claimType: string }>;
	};
}

/** Pure construction. The returned capture bytes must enter custody before a decision or dispatch is requested. */
export function buildQualiaIntent(input: QualiaInput) {
	if (!input.captures.length || !input.subjects.length || !input.about.length)
		throw new Error(
			"Captured evidence, subjects and report targets are required",
		);
	if (!partialSchema.reportKinds[input.report.reportKind])
		throw new Error("Unsupported report kind");
	if (!input.report.reportKindRef.startsWith(`${input.report.reportKind}@`))
		throw new Error("Report kind reference disagrees with frozen revision");
	for (const subject of input.subjects) {
		if (!partialSchema.domainSubjects.includes(subject.nodeType))
			throw new Error(`Out-of-scope subject ${subject.nodeType}`);
		if (
			subject.nodeType === "Person" &&
			subject.mode === "new" &&
			(subject.properties?.privacyClass !== "PUBLIC" ||
				!Array.isArray(subject.properties.publicActorBasis) ||
				!subject.properties.publicActorBasis.length)
		) {
			throw new Error(
				"Person requires explicit public actor basis and PUBLIC privacy class",
			);
		}
	}
	const captures = input.captures.map((c) => ({
		...c,
		locators: [...c.locators],
	}));
	const locatorRefs = new Set(
		captures.flatMap((c) => c.locators.map((l) => l.ref)),
	);
	if (locatorRefs.size !== captures.reduce((n, c) => n + c.locators.length, 0))
		throw new Error("Locator references must be unique");
	// Trusted frozen fragments already contain the exact quote and selected capture
	// identity. Create their native locators deterministically; never require the
	// producer to retype evidence that the host already holds and verifies.
	for (const assertion of input.report.assertions ?? [])
		for (const evidence of assertion.evidence) {
			const capture = captures.find(
				(c) =>
					c.captureId === evidence.captureId &&
					c.canonicalUri === evidence.sourceUrl,
			);
			if (
				!capture ||
				!evidence.quote ||
				capture.contentUtf8.indexOf(evidence.quote) < 0 ||
				capture.contentUtf8.indexOf(evidence.quote) !==
					capture.contentUtf8.lastIndexOf(evidence.quote)
			)
				throw new Error(
					"Frozen support fragment does not uniquely resolve in its actual retained capture",
				);
			if (!capture.locators.some((l) => l.exact === evidence.quote)) {
				const ref = `qualia-support-${sha(`${evidence.captureId}\n${evidence.fragmentId}\n${evidence.fragmentDigest}`).slice(7, 39)}`;
				if (locatorRefs.has(ref))
					throw new Error(
						"Generated support locator collides with authored locator",
					);
				capture.locators.push({ ref, exact: evidence.quote });
				locatorRefs.add(ref);
			}
		}
	const fieldProposals = input.subjects
		.filter((s) => s.mode === "new")
		.map((s) => {
			if (s.mode !== "new") throw new Error("New subject expected");
			const evidence = input.subjectEvidence[s.ref];
			if (!evidence?.length || evidence.some((ref) => !locatorRefs.has(ref)))
				throw new Error(
					`New subject ${s.ref} requires captured field evidence`,
				);
			return {
				proposalId: `qualia-fields-${s.ref}`,
				kind: "node.upsert",
				subjectRef: s.ref,
				properties: { name: s.name, ...s.properties },
				evidence,
			};
		});
	for (const proposal of input.proposals) {
		if (!partialSchema.proposalKinds.includes(proposal.kind))
			throw new Error(`Out-of-scope proposal ${proposal.kind}`);
		if (
			"evidence" in proposal &&
			(!proposal.evidence?.length ||
				proposal.evidence.some(
					(e) => typeof e !== "string" || !locatorRefs.has(e),
				))
		) {
			throw new Error(
				"Every factual proposal requires declared captured locator references",
			);
		}
	}
	const sources = captures.map((c) => {
		const uri = new URL(c.canonicalUri);
		if (
			!["http:", "https:"].includes(uri.protocol) ||
			uri.username ||
			uri.password
		)
			throw new Error("Source must be a public HTTP URL without credentials");
		if (!c.storageUri || !c.captureMethod)
			throw new Error("Capture custody URI and method are required");
		return {
			ref: c.ref,
			source: {
				canonicalUri: c.canonicalUri,
				title: c.title,
				sourceKind: "WEB_PAGE",
			},
			snapshot: {
				retrievedAt: c.retrievedAt,
				observedAt: c.retrievedAt,
				contentHash: sha(c.contentUtf8),
				contentHashBasis: c.hashBasis,
				captureMethod: c.captureMethod,
				captureCompleteness: c.completeness,
				storageUri: c.storageUri,
				mimeType: "text/plain",
				custodyArtifactDigest: sha(c.contentUtf8),
			},
			locators: c.locators.map((l) => {
				if (
					!l.exact ||
					!c.contentUtf8.includes(l.exact) ||
					c.contentUtf8.indexOf(l.exact) !== c.contentUtf8.lastIndexOf(l.exact)
				)
					throw new Error(
						`Locator ${l.ref} does not resolve uniquely in retained bytes`,
					);
				return {
					ref: l.ref,
					selectorKind: "TEXT_QUOTE",
					selector: {
						basis: "raw-capture/v1",
						type: "TextQuoteSelector",
						exact: l.exact,
					},
					exact: l.exact,
					expectedSelectedContentDigest: sha(l.exact),
					reportsFields: l.reportsFields ?? [],
				};
			}),
		};
	});
	// A KS evidence report can discuss many propositions, while its canonical graph
	// EVIDENCE_REPORT assesses one Claim. Preserve that distinction explicitly:
	// one exact primary Claim, all other frozen claims as cited context, one shared
	// immutable body/ledger binding. No aggregate proposition or verdict is invented.
	if (input.report.reportKind !== "evidence_report")
		throw new Error(
			"This fixture requires an explicit evidence_report primary-claim projection",
		);
	const frozen = input.report.assertions;
	const projection = input.reportProjection;
	if (!frozen?.length || frozen.length > 24 || !projection?.claims?.length)
		throw new Error(
			"Actual frozen assertions and an authored reportProjection are required",
		);
	if (
		new Set(frozen.map((a) => a.id)).size !== frozen.length ||
		new Set(projection.claims.map((v) => v.assertionId)).size !==
			projection.claims.length ||
		projection.claims.length !== frozen.length
	)
		throw new Error(
			"Projection must cover every frozen assertion exactly once",
		);
	const generatedClaims: NonNullable<IngestionIntentV2Input["subjects"]> = [];
	const refs = new Set(input.subjects.map((s) => s.ref));
	const citations: Array<{ proposal: string }> = [];
	const assessments: NonNullable<IngestionIntentV2Input["proposals"]> = [];
	const allEvidence = new Set<string>();
	for (const view of projection.claims) {
		const assertion = frozen.find((a) => a.id === view.assertionId);
		if (
			!assertion ||
			!assertion.proposition ||
			!assertion.evidence.length ||
			!assertion.judgments?.length ||
			refs.has(view.claimRef) ||
			!view.claimType
		)
			throw new Error(
				"Projection requires an exact frozen assertion, distinct Claim ref, Claim type and actual KS support observations",
			);
		refs.add(view.claimRef);
		const evidenceLocators = new Map<string, string>();
		for (const evidence of assertion.evidence) {
			const capture = captures.find(
				(c) =>
					c.captureId === evidence.captureId &&
					c.canonicalUri === evidence.sourceUrl,
			);
			const locator = capture?.locators.find((l) => l.exact === evidence.quote);
			if (
				!capture ||
				!locator ||
				!/^sha256:[0-9a-f]{64}$/.test(evidence.fragmentDigest)
			)
				throw new Error(
					"Native evidence does not cover the actual frozen captured fragments",
				);
			const identity = evidenceIdentity(evidence);
			if (evidenceLocators.has(identity))
				throw new Error(
					"Frozen assertion evidence contains duplicate identities",
				);
			evidenceLocators.set(identity, locator.ref);
			allEvidence.add(locator.ref);
		}
		if (
			!Array.isArray(assertion.declaredEvidence) ||
			!Array.isArray(assertion.observedEvidence)
		)
			throw new Error(
				"Frozen evidence requires distinct declared and observed provenance",
			);
		if (
			[assertion.declaredEvidence, assertion.observedEvidence].some(
				(list) => new Set(list.map(evidenceIdentity)).size !== list.length,
			)
		)
			throw new Error(
				"Frozen evidence provenance contains duplicate identities",
			);
		const provenanceUnion = new Set(
			[...assertion.declaredEvidence, ...assertion.observedEvidence].map(
				evidenceIdentity,
			),
		);
		if (
			provenanceUnion.size !== evidenceLocators.size ||
			[...provenanceUnion].some((key) => !evidenceLocators.has(key))
		)
			throw new Error(
				"Declared or observed evidence differs from the frozen assertion union",
			);
		const usedEvidence = new Set(
			assertion.judgments
				.flatMap((j) => j.evidence ?? [])
				.map(evidenceIdentity),
		);
		const observedEvidence = new Set(
			assertion.observedEvidence.map(evidenceIdentity),
		);
		if (
			usedEvidence.size !== observedEvidence.size ||
			[...usedEvidence].some((key) => !observedEvidence.has(key))
		)
			throw new Error(
				"Actual judgments do not match the exact observed evidence union",
			);
		generatedClaims.push({
			ref: view.claimRef,
			mode: "new",
			nodeType: "Claim",
			name: assertion.proposition.slice(0, 300),
			properties: {
				proposition: assertion.proposition,
				claimType: view.claimType,
			},
			onMatch: "use_existing",
		});
		for (const judgment of assertion.judgments) {
			if (!Array.isArray(judgment.evidence))
				throw new Error("Actual KS judgment evidence is required");
			if (
				new Set(judgment.evidence.map(evidenceIdentity)).size !==
				judgment.evidence.length
			)
				throw new Error(
					"Actual KS judgment evidence contains duplicate identities",
				);
			const judgmentEvidence = judgment.evidence.map((e) => {
				const locator = evidenceLocators.get(evidenceIdentity(e));
				if (!locator || !observedEvidence.has(evidenceIdentity(e)))
					throw new Error(
						"Judgment evidence is outside its exact frozen observed capture context",
					);
				return { locator, role: "CONTEXT" as const };
			});
			if (
				!judgment.id ||
				!/^sha256:[0-9a-f]{64}$/.test(judgment.digest) ||
				typeof judgment.outcome.verdict !== "string"
			)
				throw new Error(
					"Actual KS observation identity, digest and verdict are required",
				);
			const proposalId = `qualia-vetting-${sha(`${assertion.id}\n${judgment.id}`).slice(7, 31)}`;
			const rationaleText = qualiaObservationRationale(assertion, judgment);
			assessments.push({
				proposalId,
				kind: "assessment.record",
				assessmentKind: "VETTING",
				assessmentSubkind: "ks.support-observation.v1",
				about: [view.claimRef],
				status: "PROPOSED",
				methodVersion: "ks.report-observation.v1",
				conclusionCode: judgment.outcome.verdict,
				rationaleText,
				evidence: judgmentEvidence,
				uidSegment: `qualia-${sha(`${input.report.reportRevisionId}\n${assertion.id}\n${judgment.id}`).slice(7, 47)}`,
			});
			citations.push({ proposal: proposalId });
		}
	}
	const primary = projection.claims.find(
		(v) => v.assertionId === projection.primaryAssertionId,
	);
	if (!primary)
		throw new Error(
			"Primary assertion must name an actual projected frozen assertion",
		);
	const intent = IngestionIntentV2.parse({
		schemaVersion: "biotech-knowledge-intent.v2",
		intentId: input.intentId,
		pins: {
			schemaReleaseDigest: partialSchema.schemaReleaseDigest,
			policyVersion: "bks-admission-policy/v1",
		},
		context: input.context,
		basis: {
			creationOnly: {
				reason:
					"Owner-authorized first capture of the Qualia supplement ecosystem; no graph preflight requested",
			},
		},
		sources,
		subjects: [...input.subjects, ...generatedClaims],
		proposals: [
			...fieldProposals,
			...input.proposals,
			{
				proposalId: "qualia-domain-lineage",
				kind: "lineage.start",
				about: input.about,
				informedBy: [],
			},
			...assessments,
			{
				proposalId: "qualia-frozen-report",
				kind: "report.publish",
				name: `Qualia frozen report ${input.report.reportRevisionId}: primary claim ${projection.primaryAssertionId}`,
				policyVersion: "bks-admission-policy/v1",
				uidSegment: `qualia-${sha(`${input.report.reportRevisionId}\n${projection.primaryAssertionId}`).slice(7, 47)}`,
				reportKind: partialSchema.reportKinds[input.report.reportKind],
				reportRevisionRef: input.report.reportRevisionId,
				reportKindRef: input.report.reportKindRef,
				reportSchema: input.report.reportSchema,
				bodyDigest: input.report.bodyDigest,
				ledgerDigest: input.report.ledgerDigest,
				structuredBodyDigest: input.report.structuredBodyDigest,
				custodyKind: "knowledge_verification.artifact_custody",
				about: [primary.claimRef],
				citesAssessments: citations,
				evidence: [...allEvidence].map((locator) => ({
					locator,
					role: "CONTEXT",
				})),
			},
		],
	});
	return {
		intent,
		captures: input.captures.map((c) => ({
			uri: c.storageUri,
			digest: sha(c.contentUtf8),
			bytes: Buffer.from(c.contentUtf8, "utf8"),
		})),
	};
}

/** Empty-graph structural check only: no graph connection, use decision or admission. */
export function validatedBuildQualiaIntent(input: QualiaInput) {
	const built = buildQualiaIntent(input);
	const schema = writeSchema();
	const plannedAt = input.captures
		.map((c) => c.retrievedAt)
		.sort()
		.at(-1)!;
	const { plan } = planOffline(schema, built.intent, {
		principal: {
			principalId: "qualia-offline-structure-check",
			installationId: "offline-only",
			applicationId: "biotech",
			tenantId: "00000000-0000-4000-8000-000000000001",
			grants: ["report.publish"],
		},
		plannedAt,
	});
	const subjects = plan.subjects.filter(
		(s) => !["create", "use_existing"].includes(s.disposition),
	);
	const proposals = plan.proposals.filter(
		(p) => !["admitted", "noop_duplicate"].includes(p.disposition),
	);
	if (
		plan.errors.length ||
		subjects.length ||
		proposals.length ||
		!["applicable", "noop"].includes(plan.outcome)
	) {
		const error = new Error(
			JSON.stringify({
				code: "QUALIA_OFFLINE_PLAN_REFUSED",
				check: "empty-graph-structural-only",
				outcome: plan.outcome,
				errors: plan.errors,
				subjects: subjects.map((s) => ({
					ref: s.ref,
					disposition: s.disposition,
					reasons: s.reasons,
				})),
				proposals: proposals.map((p) => ({
					proposalId: p.proposalId,
					disposition: p.disposition,
					reasons: p.reasons,
				})),
				admitted: false,
				graphQueries: 0,
			}),
		);
		Object.assign(error, { code: "QUALIA_OFFLINE_PLAN_REFUSED" });
		throw error;
	}
	return {
		...built,
		offlinePlanCheck: {
			check: "empty-graph-structural-only",
			releaseId: schema.releaseId,
			schemaReleaseDigest: schema.schemaReleaseDigest,
			outcome: plan.outcome,
			proposalCount: plan.proposals.length,
			graphQueries: 0,
			admitted: false,
			qualified: false,
		},
	};
}

/** Trusted HOST utility, after KS exact-use admission. It uses the existing consumer; agents do not admit effects. */
function effectMultiset(
	effects: Pick<IngestionReceiptV2["effects"], "nodes" | "relationships">,
): Map<string, number> {
	const identities = [
		...effects.nodes.map((n) =>
			JSON.stringify([
				"node",
				n.uid,
				n.label,
				n.op,
				n.proposalId ?? null,
				n.statementId,
				[...n.properties].sort(),
			]),
		),
		...effects.relationships.map((r) =>
			JSON.stringify([
				"relationship",
				r.key,
				r.type,
				r.fromUid,
				r.toUid,
				r.relationshipUid,
				r.op,
				r.proposalId ?? null,
				r.statementId,
				r.assertionUid ?? null,
			]),
		),
	];
	const counts = new Map<string, number>();
	for (const identity of identities)
		counts.set(identity, (counts.get(identity) ?? 0) + 1);
	return counts;
}

export async function consumeQualiaAndVerify(input: {
	writer: KnowledgeWriter;
	principal: PrincipalCtx;
	effectKey: string;
	consume: () => Promise<unknown>;
	/** Durable append-only recorder supplied by the runner. Receipts are preserved even when readback fails. */
	record: (kind: string, value: unknown) => Promise<void>;
}) {
	assertQualiaTarget(input.writer.client.config.uri);
	if (input.principal.applicationId !== "biotech")
		throw new Error("Qualia uses only the biotech application scope");
	const consumed = AdmissionConsumeReportV1.parse(await input.consume());
	await input.record("consumer", consumed);
	const lookup = await input.writer.receipt(input.principal, input.effectKey);
	await input.record("native_receipt", lookup);
	if (
		!lookup.found ||
		!lookup.receipt ||
		!["applied", "duplicate", "noop"].includes(lookup.receipt.outcome)
	)
		throw new Error(
			"No complete native applied receipt; preserve pending/refused evidence",
		);
	const acknowledgement = consumed.results.find(
		(result) => result.effectKey === input.effectKey,
	);
	const admission = lookup.receipt.admission;
	if (
		consumed.tenantId !== input.principal.tenantId ||
		!acknowledgement ||
		acknowledgement.tenantId !== input.principal.tenantId ||
		!acknowledgement.acknowledged ||
		acknowledgement.componentState !== "acknowledged" ||
		!["applied", "duplicate"].includes(acknowledgement.outcome)
	) {
		throw new Error(
			"Native graph receipt exists but exact dispatch acknowledgment is unresolved or revoked",
		);
	}
	if (
		!admission ||
		acknowledgement.dispatchId !== admission.dispatchId ||
		acknowledgement.markerDigest !== admission.markerDigest ||
		acknowledgement.payloadDigest !== admission.payloadDigest ||
		acknowledgement.receiptId !== lookup.receipt.receiptId ||
		acknowledgement.planDigest !== lookup.receipt.plan.planDigest ||
		lookup.receipt.effect.effectKey !== input.effectKey ||
		lookup.receipt.effect.scope.tenantId !== input.principal.tenantId ||
		lookup.receipt.effect.scope.installationId !==
			input.principal.installationId ||
		lookup.receipt.effect.scope.applicationId !== input.principal.applicationId
	) {
		throw new Error(
			"Dispatch acknowledgment does not bind the exact admitted native receipt",
		);
	}
	const receipt = lookup.receipt;
	const stored = await input.writer.plans.get(receipt.plan.planRef);
	if (stored) await input.record("native_plan", stored);
	if (
		!stored ||
		stored.plan.planRef !== receipt.plan.planRef ||
		stored.plan.planDigest !== receipt.plan.planDigest ||
		!["applicable", "noop"].includes(stored.plan.outcome) ||
		stored.plan.proposals.some(
			(p) => !["admitted", "noop_duplicate"].includes(p.disposition),
		)
	)
		throw new Error(
			"Native proof requires the exact fully applicable stored plan",
		);
	const {
		schemaVersion: _schemaVersion,
		planRef: _planRef,
		planDigest: _planDigest,
		...planBody
	} = stored.plan;
	if (planDigestOf(planBody) !== receipt.plan.planDigest)
		throw new Error(
			"Stored native plan content does not match its recorded digest",
		);
	const reports = receipt.effects.nodes.filter(
		(n) => n.label === "Report" && n.op === "create",
	);
	const requiredSubjects = stored.plan.subjects.filter(
		(s) =>
			partialSchema.domainSubjects.includes(s.nodeType) ||
			s.nodeType === "Claim",
	);
	const recordedNodes = new Set(receipt.effects.nodes.map((n) => n.uid));
	if (
		receipt.effects.total < 1 ||
		reports.length !== 1 ||
		!requiredSubjects.length ||
		requiredSubjects.some(
			(s) =>
				!s.uid ||
				(s.disposition === "create" &&
					!receipt.effects.nodes.some(
						(n) => n.uid === s.uid && n.op === "create",
					)),
		)
	)
		throw new Error(
			"Native receipt omits the created Report or declared subject effects",
		);
	const expectedEffects = effectMultiset(stored.plan.effects);
	const actualEffects = effectMultiset(receipt.effects);
	if (
		receipt.effects.total !==
			stored.plan.effects.nodes.length +
				stored.plan.effects.relationships.length ||
		expectedEffects.size !== actualEffects.size ||
		[...expectedEffects].some(
			([identity, count]) => actualEffects.get(identity) !== count,
		)
	)
		throw new Error(
			"Native receipt effects differ from the complete stored plan multiset",
		);
	const reusedSubjects = requiredSubjects.filter(
		(s) => s.disposition === "use_existing" && !recordedNodes.has(s.uid!),
	);
	for (const subject of reusedSubjects) {
		if (
			!subject.matches.some((m) => m.uid === subject.uid) ||
			!receipt.effects.relationships.some(
				(r) =>
					r.op === "create" &&
					(r.fromUid === subject.uid || r.toUid === subject.uid),
			)
		)
			throw new Error(
				"Reused native subject has no authoritative plan match and declared relationship endpoint",
			);
	}
	const verifiedEndpoints = new Set<string>();
	const expectedKeys = [
		...receipt.effects.nodes.map((n) => `node:${n.uid}`),
		...receipt.effects.relationships.map((r) => `relationship:${r.key}`),
	];
	const expectedChecks = new Map<string, number>();
	for (const key of expectedKeys)
		expectedChecks.set(key, (expectedChecks.get(key) ?? 0) + 1);
	const checked = new Map<string, number>();
	let checkedEffects = 0;
	const pages = [];
	let cursor = 0;
	for (let n = 0; n < 50; n++) {
		const page = VerifyEffectsPage.parse(
			await input.writer.verifyEffects(
				input.principal,
				input.effectKey,
				cursor,
				100,
			),
		);
		await input.record("effect_readback", page);
		if (
			page.effectKey !== input.effectKey ||
			page.receiptId !== lookup.receipt.receiptId ||
			page.failures ||
			page.items.some((i) => !i.ok || i.checks.some((c) => !c.ok)) ||
			page.total !== receipt.effects.total ||
			page.checked !== page.items.length
		)
			throw new Error("Native effect readback failed");
		for (const item of page.items) {
			const key = `${item.kind}:${item.key}`;
			const count = (checked.get(key) ?? 0) + 1;
			if (count > (expectedChecks.get(key) ?? 0))
				throw new Error("Native readback contains foreign or repeated effects");
			checked.set(key, count);
			checkedEffects++;
			if (item.kind === "relationship") {
				for (const relation of receipt.effects.relationships.filter(
					(r) => r.key === item.key && r.op === "create",
				)) {
					const exists = item.checks.some((c) => c.name === "exists" && c.ok);
					const endpoints =
						!relation.relationshipUid ||
						item.checks.some((c) => c.name === "endpoints" && c.ok);
					if (exists && endpoints) {
						verifiedEndpoints.add(relation.fromUid);
						verifiedEndpoints.add(relation.toUid);
					}
				}
			}
		}
		pages.push(page);
		if (page.complete && page.nextCursor === null) {
			if (checkedEffects !== expectedKeys.length)
				throw new Error("Native readback omitted declared effects");
			if (reusedSubjects.some((s) => !verifiedEndpoints.has(s.uid!)))
				throw new Error(
					"Reused native subject was not physically verified as the exact relationship endpoint",
				);
			return {
				receipt: lookup.receipt,
				acknowledgement,
				pages,
				proof: {
					reportUid: reports[0]!.uid,
					requiredSubjectUids: requiredSubjects.map((s) => s.uid),
					checkedEffects,
					reusedSubjectUids: reusedSubjects.map((s) => s.uid),
				},
				qualified: false as const,
			};
		}
		if (page.nextCursor === null || page.nextCursor <= cursor)
			throw new Error("Incomplete or nonadvancing readback");
		cursor = page.nextCursor;
	}
	throw new Error("Native readback exceeds bounded fixture page budget");
}
