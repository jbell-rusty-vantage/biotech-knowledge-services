import { canonicalDigest, canonicalize, type AssertionCoreV2, type AssertionRef, type ProposalPlanV2, type ProposalV2, type SealedVerificationBody } from "@bks/contracts";
import { createNode, hold, noop, normalizeValidity, reject, resolveAsserter, resolveEvidence, target, updateNode, type EvidenceRow, type NormalizedValidity } from "./compile.js";
import { activityUidFor, checkNodeProps, intCasts, containsContact, Ctx, digestOfSorted, h, hc, intervalsOverlap, PRIVATE_PERSON_PREDICATES, propertyParams, q, stripContacts, TX_NOW, type EpisodeRec, type RefTarget } from "./context.js";
import { EXECUTOR_EDGE_FIELDS, type PredicateSpec, type RelSpec } from "./release-model.js";

type P<K extends ProposalV2["kind"]> = Extract<ProposalV2, { kind: K }>;

export function compileProposal(ctx: Ctx, p: ProposalV2, plan: ProposalPlanV2): void {
  switch (p.kind) {
    case "node.upsert":
      return nodeUpsert(ctx, p, plan);
    case "identifier.attach":
      return identifierAttach(ctx, p, plan);
    case "edge.assert":
      return edgeAssert(ctx, p, plan);
    case "assertion.relate":
      return assertionRelate(ctx, p, plan);
    case "assertion.literal":
      return assertionLiteral(ctx, p, plan);
    case "edge.structural":
      return edgeStructural(ctx, p, plan);
    case "edge.close":
      return edgeClose(ctx, p, plan);
    case "assessment.record":
      return assessmentRecord(ctx, p, plan);
    case "adjudication":
      return adjudication(ctx, p, plan);
    case "report.publish":
      return reportPublish(ctx, p, plan);
    case "projection.write":
      return projectionWrite(ctx, p, plan);
    case "mention.stage":
      return mentionStage(ctx, p, plan);
    case "lineage.start":
      return lineageStart(ctx, p, plan);
  }
}

const requireGrant = (ctx: Ctx, plan: ProposalPlanV2, grant: string, what: string) => {
  if (!ctx.grant(grant)) reject(plan, `BKS_FORBIDDEN_SCOPE: ${what} requires the ${grant} grant; ordinary writers cannot declare it`);
};

// ---------------------------------------------------------------------------------------------
// Assertion emission (kernel pattern: one subject, one object or literal, one asserter, >=1 SUPPORTS span)
// ---------------------------------------------------------------------------------------------

interface AssertionSpec {
  uidSegment?: string;
  predicate: string;
  assertionKind: string;
  claimType?: string;
  polarity: string;
  speechAct?: string;
  basisKind?: string;
  proposition?: string;
  qualifiers: string[];
  value?: { valueString?: string; valueNumber?: number; valueBoolean?: boolean; unitCode?: string };
  validity: NormalizedValidity;
  extractionConfidence?: number;
  riskClass?: string;
  derivationRule?: string;
  subject: RefTarget;
  object?: RefTarget;
  asserter: { uid: string; nodeType: string };
  evidence: EvidenceRow[];
  occurrenceOf?: string;
  occursIn?: string;
  derivedFrom: string[];
  supersedes?: { uid: string; asserterUid: string | null; predicate: string | null; subjectUid: string | null };
}

/** Deterministic content identity of an Assertion (subject, predicate, object or literal, asserter, locator set, validity). */
function assertionUidOf(spec: AssertionSpec): string {
  if (spec.uidSegment) return `hu:assertion:${spec.uidSegment}`;
  return `hu:assertion:${hc({
    s: spec.subject.uid,
    p: spec.predicate,
    o: spec.object?.uid ?? null,
    v: spec.value ?? null,
    a: spec.asserter.uid,
    e: spec.evidence.map((e) => `${e.uid}|${e.role}`).sort(),
    t: spec.validity,
    k: spec.assertionKind,
    pol: spec.polarity,
    sa: spec.speechAct ?? null,
    q: [...spec.qualifiers].sort(),
  }, 24)}`;
}

function checkAssertionVocab(ctx: Ctx, plan: ProposalPlanV2, core: AssertionCoreV2, kind: string): void {
  const errs = [
    ctx.schema.enumCheck("AssertionKind", kind, "assertionKind"),
    ctx.schema.enumCheck("ClaimType", core.claimType, "claimType"),
    ctx.schema.enumCheck("Polarity", core.polarity, "polarity"),
    ctx.schema.enumCheck("SpeechAct", core.speechAct, "speechAct"),
    ctx.schema.enumCheck("BasisKind", core.basisKind, "basisKind"),
  ].filter(Boolean) as string[];
  for (const qual of core.qualifiers) errs.push(...ctx.schema.qualifierGrammar.check(qual));
  if (kind === "CLAIM" && !core.claimType) errs.push("claimType is required when assertionKind is CLAIM");
  if (kind === "CLAIM" && !core.occurrenceOf) errs.push("a CLAIM occurrence needs occurrenceOf (one OCCURRENCE_OF edge to its Claim)");
  if (core.basisKind === "CALCULATED" && !(core.derivation?.rule && core.derivation.from.length)) errs.push("basisKind CALCULATED needs derivation.rule and derivation.from inputs");
  if (errs.length) reject(plan, `INVALID_ASSERTION: ${errs.join("; ")}`);
}

/** Predicate registry check (R-52): registered / proposed-new admitted, alias re-keyed, retired and unknown refused; shape and qualifiers. */
function checkPredicate(ctx: Ctx, plan: ProposalPlanV2, name: string, allowedKinds: PredicateSpec["kind"][], subjectType: string, objectType: string | null, qualifiers: string[]): PredicateSpec {
  if (PRIVATE_PERSON_PREDICATES.test(name)) reject(plan, `PRIVATE_PERSON_DATA: ${name} carries private-person facts, which never enter the shared scientific graph (OD-17)`);
  let spec = ctx.schema.predicates.get(name);
  if (!spec) reject(plan, `UNREGISTERED_PREDICATE: ${name} is not in the predicate registry (R-52)`);
  if (spec.status === "alias-of" && spec.aliasOf) {
    plan.rewrites.push({ field: "predicate", from: name, to: spec.aliasOf, rule: "R-52 alias-of re-key" });
    const target2 = ctx.schema.predicates.get(spec.aliasOf);
    if (!target2) reject(plan, `UNREGISTERED_PREDICATE: alias target ${spec.aliasOf}`);
    spec = target2;
  }
  if (spec.status === "retired-by") reject(plan, `RETIRED_PREDICATE: ${spec.name} is retired; use ${spec.replacedBy.join(" or ") || "the replacement named in the registry"}`);
  if (spec.status === "proposed-new") plan.warnings.push(`PREDICATE_PROPOSED_NEW: ${spec.name} is proposed-new (registrar acceptance pending)`);
  if (!allowedKinds.includes(spec.kind)) reject(plan, `PREDICATE_KIND_MISMATCH: ${spec.name} is a ${spec.kind} predicate; this proposal kind needs ${allowedKinds.join(" | ")}`);
  if (spec.subjectTypes.size && !spec.subjectTypes.has(subjectType)) reject(plan, `PREDICATE_SUBJECT_TYPE: ${spec.name} takes subjects ${[...spec.subjectTypes].sort().join(", ")}; got ${subjectType}`);
  if (!spec.subjectTypes.size) plan.warnings.push(`PREDICATE_SHAPE_UNDECLARED: ${spec.name} declares no subject types`);
  if (objectType !== null) {
    if (spec.objectTypes.size && !spec.objectTypes.has(objectType)) reject(plan, `PREDICATE_OBJECT_TYPE: ${spec.name} takes objects ${[...spec.objectTypes].sort().join(", ")}; got ${objectType}`);
  }
  const keys = new Set(qualifiers.map((x) => ctx.schema.qualifierGrammar.prefixOf(x)?.key.slice(0, -1) ?? x.slice(0, Math.max(0, x.search(/[:=]/)))));
  const missing = spec.requiredQualifiers.filter((k) => !keys.has(k));
  if (missing.length) reject(plan, `QUALIFIER_REQUIRED: ${spec.name} requires qualifier(s) ${missing.join(", ")}`);
  if (spec.qualifiers.size) for (const k of keys) if (!spec.qualifiers.has(k) && !["asserterBasis", "segment", "jurisdiction"].includes(k) && !k.endsWith("Verbatim")) plan.warnings.push(`QUALIFIER_UNDECLARED: ${k} is not among ${spec.name}'s declared qualifiers`);
  return spec;
}

function assertionRefUid(ctx: Ctx, plan: ProposalPlanV2, ref: AssertionRef, role: string): string {
  if ("proposal" in ref) {
    const t = target(ctx, plan, ref.proposal, role);
    return t.uid;
  }
  const obs = ctx.o<{ predicate: string }>(`assertion:${ref.uid}`);
  if (obs === null && !ctx.creators.has(ref.uid)) hold(plan, `DEPENDENCY_MISSING: ${role} ${ref.uid} is not in the graph (held until it is captured)`);
  return ref.uid;
}

function buildAssertionSpec(ctx: Ctx, plan: ProposalPlanV2, core: AssertionCoreV2, predicate: string, defaultKind: string, subject: RefTarget, object: RefTarget | undefined, asserterRef: string | undefined, evidenceList: P<"edge.assert">["evidence"], value?: AssertionSpec["value"]): AssertionSpec {
  const kind = core.assertionKind ?? defaultKind;
  checkAssertionVocab(ctx, plan, core, kind);
  const asserter = resolveAsserter(ctx, plan, asserterRef);
  const qualifiers = [...core.qualifiers];
  if (subject.nodeType === "Person" && value?.valueString && containsContact(value.valueString)) reject(plan, "PRIVATE_CONTACT_DATA: a literal about a Person carries contact details (OD-17)");
  const evidence = resolveEvidence(ctx, plan, evidenceList, true);
  const validity = normalizeValidity(ctx, plan, core.validity);
  let occurrenceOf: string | undefined;
  if (core.occurrenceOf) {
    if ("claimRef" in core.occurrenceOf) {
      const c = target(ctx, plan, core.occurrenceOf.claimRef, "occurrenceOf");
      if (c.nodeType !== "Claim") reject(plan, `OCCURRENCE_TARGET_INVALID: ${core.occurrenceOf.claimRef} is a ${c.nodeType}, not a Claim`);
      occurrenceOf = c.uid;
    } else {
      const c = ctx.o(`node:${core.occurrenceOf.claimUid}`);
      if (ctx.schema.nodeForUid(core.occurrenceOf.claimUid)?.name !== "Claim") reject(plan, `OCCURRENCE_TARGET_INVALID: ${core.occurrenceOf.claimUid} is not a claim uid`);
      if (c === null) hold(plan, `CLAIM_NOT_FOUND: ${core.occurrenceOf.claimUid} is not in the graph; declare the Claim as a subject`);
      occurrenceOf = core.occurrenceOf.claimUid;
    }
  }
  let occursIn: string | undefined;
  if (core.occursInRef) {
    const w = target(ctx, plan, core.occursInRef, "occursIn");
    if (w.nodeType !== "MediaWork") reject(plan, `OCCURS_IN_TARGET_INVALID: ${core.occursInRef} is a ${w.nodeType}, not a MediaWork`);
    occursIn = w.uid;
  }
  const derivedFrom = (core.derivation?.from ?? []).map((r) => assertionRefUid(ctx, plan, r, "derivation input"));
  let supersedes: AssertionSpec["supersedes"];
  if (core.supersedes) {
    const uid = assertionRefUid(ctx, plan, core.supersedes, "superseded assertion");
    const old = ctx.o<{ asserterUid: string | null; recordedTo: string | null; predicate: string; subjectUid: string | null }>(`assertion:${uid}`);
    if (old) {
      if (old.asserterUid !== asserter.uid) reject(plan, `SUPERSESSION_ASSERTER_MISMATCH: ${uid} was asserted by ${old.asserterUid}; supersession is same-asserter only (R-23)`);
      if (old.recordedTo) reject(plan, `SUPERSEDED_ALREADY_CLOSED: ${uid} was closed at ${old.recordedTo}`);
      if (ctx.superseded.has(uid)) reject(plan, `SUPERSEDED_TWICE: ${uid} is superseded by another proposal of this intent`);
    }
    supersedes = { uid, asserterUid: old?.asserterUid ?? null, predicate: old?.predicate ?? null, subjectUid: old?.subjectUid ?? null };
  }
  return {
    ...(core.uidSegment ? { uidSegment: core.uidSegment } : {}),
    predicate,
    assertionKind: kind,
    ...(core.claimType ? { claimType: core.claimType } : {}),
    polarity: core.polarity ?? "POSITIVE",
    ...(core.speechAct ? { speechAct: core.speechAct } : {}),
    ...(core.basisKind ? { basisKind: core.basisKind } : {}),
    ...(core.proposition ? { proposition: core.proposition } : {}),
    qualifiers: [...new Set(qualifiers)].sort(),
    ...(value && Object.keys(value).length ? { value } : {}),
    validity,
    ...(core.extractionConfidence !== undefined ? { extractionConfidence: core.extractionConfidence } : {}),
    ...(core.riskClass ? { riskClass: core.riskClass } : {}),
    ...(core.derivation?.rule ? { derivationRule: core.derivation.rule } : {}),
    subject,
    ...(object ? { object } : {}),
    asserter,
    evidence,
    ...(occurrenceOf ? { occurrenceOf } : {}),
    ...(occursIn ? { occursIn } : {}),
    derivedFrom,
    ...(supersedes ? { supersedes } : {}),
  };
}

/** Emits the Assertion and its kernel plumbing. Returns the uid, or stops the proposal as a duplicate. */
function emitAssertion(ctx: Ctx, plan: ProposalPlanV2, spec: AssertionSpec): string {
  const uid = assertionUidOf(spec);
  plan.mints.assertion = uid;
  if (ctx.creators.has(uid)) noop(plan, `DUPLICATE_WITHIN_INTENT: assertion ${uid} is minted by an earlier proposal`, { assertion: uid });
  const existing = ctx.o<{ predicate: string; subjectUid: string | null; asserterUid: string | null; objectUid: string | null }>(`assertion:${uid}`);
  if (existing) {
    if (existing.predicate === spec.predicate && existing.subjectUid === spec.subject.uid && existing.asserterUid === spec.asserter.uid && (existing.objectUid ?? null) === (spec.object?.uid ?? null)) {
      return uid; // recorded already; caller decides (corroboration / noop)
    }
    reject(plan, `BKS_IDENTITY_CONFLICT: assertion uid ${uid} exists with different content (predicate ${existing.predicate}, subject ${existing.subjectUid})`);
  }
  const assertionNode = ctx.schema.node("Assertion")!;
  const v = spec.validity;
  const props: Record<string, unknown> = {
    name: `${spec.predicate}`,
    predicate: spec.predicate,
    assertionKind: spec.assertionKind,
    status: "EXTRACTED",
    polarity: spec.polarity,
    ...(spec.claimType ? { claimType: spec.claimType } : {}),
    ...(spec.speechAct ? { speechAct: spec.speechAct } : {}),
    ...(spec.basisKind ? { basisKind: spec.basisKind } : {}),
    ...(spec.proposition ? { proposition: spec.proposition } : {}),
    ...(spec.qualifiers.length ? { qualifiers: spec.qualifiers } : {}),
    ...(spec.value?.valueString !== undefined ? { valueString: spec.value.valueString } : {}),
    ...(spec.value?.valueNumber !== undefined ? { valueNumber: spec.value.valueNumber } : {}),
    ...(spec.value?.valueBoolean !== undefined ? { valueBoolean: spec.value.valueBoolean } : {}),
    ...(spec.value?.unitCode !== undefined ? { unitCode: spec.value.unitCode } : {}),
    ...(v.validFrom ? { validFrom: v.validFrom } : {}),
    ...(v.validTo ? { validTo: v.validTo } : {}),
    ...(v.validFromPrecision ? { validFromPrecision: v.validFromPrecision } : {}),
    ...(v.validToPrecision ? { validToPrecision: v.validToPrecision } : {}),
    validFromBasis: v.validFromBasis,
    validToBasis: v.validToBasis,
    ...(v.validObservedAt ? { validObservedAt: v.validObservedAt } : {}),
    ...(v.validObservedAtPrecision ? { validObservedAtPrecision: v.validObservedAtPrecision } : {}),
    ...(spec.extractionConfidence !== undefined ? { extractionConfidence: spec.extractionConfidence } : {}),
    ...(spec.riskClass ? { riskClass: spec.riskClass } : {}),
    ...(spec.derivationRule ? { derivationRule: spec.derivationRule } : {}),
    ...(spec.supersedes ? { supersedesUid: spec.supersedes.uid } : {}),
  };
  props.contentHash = canonicalDigest({ ...props, subject: spec.subject.uid, object: spec.object?.uid ?? null, asserter: spec.asserter.uid, evidence: spec.evidence.map((e) => `${e.uid}|${e.role}`) });
  const pp = propertyParams(assertionNode, props, "x", "p");
  const subjLabel = ctx.schema.node(spec.subject.nodeType)?.primaryLabel ?? spec.subject.nodeType;
  const asrLabel = ctx.schema.node(spec.asserter.nodeType)?.primaryLabel ?? spec.asserter.nodeType;
  const objLabel = spec.object ? ctx.schema.node(spec.object.nodeType)?.primaryLabel ?? spec.object.nodeType : null;
  const evidence = spec.evidence.map((e) => ({ uid: e.uid, role: e.role, esc: e.esc }));
  const id = ctx.stmt({
    group: "proposal",
    purpose: `Assertion ${spec.predicate} (${spec.assertionKind})`,
    cypher: `MATCH (act:Activity {uid: $activityUid}) MATCH (s:${q(subjLabel)} {uid: $subjectUid}) MATCH (w:${q(asrLabel)} {uid: $asserterUid})
${objLabel ? `MATCH (o:${q(objLabel)} {uid: $objectUid})\n` : ""}CREATE (x:Assertion {uid: $uid})
SET x += $pProps, x.id = $id, x.privacyClass = $privacyClass, x.lastWriterRunId = $runId, x.recordedAt = ${TX_NOW}, x.createdAt = ${TX_NOW}, x.updatedAt = ${TX_NOW}${pp.clause}
CREATE (x)-[:HAS_SUBJECT]->(s) CREATE (x)-[:ASSERTED_BY]->(w) CREATE (x)-[:WAS_GENERATED_BY]->(act)
${objLabel ? "CREATE (x)-[:HAS_OBJECT]->(o)\n" : ""}WITH x
UNWIND $evidence AS ev
MATCH (l:SourceLocator {uid: ev.uid})
CREATE (x)-[e:HAS_EVIDENCE]->(l) SET e.role = ev.role, e.origin = 'DECLARED', e.expectedSelectedContentDigest = ev.esc, e.lastWriterRunId = $runId
RETURN x.uid AS uid`,
    params: { uid, id: uid.slice("hu:assertion:".length), pProps: pp.plain, pDt: pp.dt, pD: pp.d, privacyClass: ctx.privacyClass, activityUid: ctx.activityUid, subjectUid: spec.subject.uid, asserterUid: spec.asserter.uid, objectUid: spec.object?.uid ?? null, evidence },
    rows: evidence.length,
    nodes: 1,
    rels: 3 + (objLabel ? 1 : 0) + evidence.length,
    uses: [ctx.activityUid, spec.subject.uid, spec.asserter.uid, ...(spec.object ? [spec.object.uid] : []), ...evidence.map((e) => e.uid)],
    creates: [uid],
  });
  ctx.nodeEffect({ uid, label: "Assertion", op: "create", statementId: id, properties: ["predicate", "assertionKind", "status"] });
  ctx.invariant("uid-absent", "BKS_IDENTITY_CONFLICT", { uid, label: "Assertion" });
  ctx.invariant("evidence-chain", "BKS_EVIDENCE_UNVERIFIED", { assertionUid: uid, locators: evidence.map((e) => e.uid) });
  const links: string[] = [];
  const params: Record<string, unknown> = { uid };
  let rels = 0;
  if (spec.occurrenceOf) {
    links.push("MATCH (c:Claim {uid: $claimUid}) CREATE (x)-[:OCCURRENCE_OF]->(c)");
    params.claimUid = spec.occurrenceOf;
    rels++;
  }
  if (spec.occursIn) {
    links.push("WITH x MATCH (mw:MediaWork {uid: $workUid}) CREATE (x)-[oi:OCCURS_IN]->(mw) SET oi.lastWriterRunId = $runId");
    params.workUid = spec.occursIn;
    rels++;
  }
  if (spec.derivedFrom.length) {
    links.push("WITH x UNWIND $derivedFrom AS d MATCH (y:Assertion {uid: d}) CREATE (x)-[:DERIVED_FROM]->(y)");
    params.derivedFrom = [...new Set(spec.derivedFrom)].sort();
    rels += (params.derivedFrom as string[]).length;
  }
  if (links.length) {
    ctx.stmt({
      group: "proposal",
      purpose: `links of ${uid} (OCCURRENCE_OF / OCCURS_IN / DERIVED_FROM)`,
      cypher: `MATCH (x:Assertion {uid: $uid})\n${links.join("\n")}\nRETURN x.uid AS uid`,
      params,
      rows: spec.derivedFrom.length ? (params.derivedFrom as string[]).length : 1,
      nodes: 0,
      rels,
      uses: [uid, ...(spec.occurrenceOf ? [spec.occurrenceOf] : []), ...(spec.occursIn ? [spec.occursIn] : []), ...((params.derivedFrom as string[] | undefined) ?? [])],
    });
  }
  if (spec.supersedes) supersedeAssertion(ctx, spec.supersedes);
  return uid;
}

/** R-23 / P10: the older Assertion closes once (recordedTo, SUPERSEDED); episodes it authorized close with it. */
function supersedeAssertion(ctx: Ctx, old: NonNullable<AssertionSpec["supersedes"]>): void {
  ctx.superseded.add(old.uid);
  const closes: EpisodeRec[] = [];
  if (old.predicate && old.subjectUid && ctx.schema.rels.get(old.predicate)?.relClass === "asserted") {
    const eps = ctx.o<EpisodeRec[]>(`episodes:${old.predicate}|${old.subjectUid}`) ?? [];
    for (const e of eps) if (e.assertionUid === old.uid && !ctx.closedEpisodes.has(e.relationshipUid)) closes.push(e);
  }
  ctx.stmt({
    group: "proposal",
    purpose: `supersede ${old.uid}`,
    cypher: `MATCH (a:Assertion {uid: $uid}) WHERE a.recordedTo IS NULL
SET a.recordedTo = ${TX_NOW}, a.status = 'SUPERSEDED', a.updatedAt = ${TX_NOW}, a.lastWriterRunId = $runId
RETURN a.uid AS uid`,
    params: { uid: old.uid },
    rows: 1, nodes: 0, rels: 0, uses: [old.uid],
  });
  ctx.nodeEffect({ uid: old.uid, label: "Assertion", op: "update", statementId: ctx.statements.at(-1)!.id, properties: ["recordedTo", "status"] });
  for (const e of closes) closeEpisode(ctx, old.predicate!, old.subjectUid!, e);
}

function closeEpisode(ctx: Ctx, type: string, fromUid: string, e: EpisodeRec): void {
  ctx.closedEpisodes.add(e.relationshipUid);
  ctx.stmt({
    group: "proposal",
    purpose: `close episode ${e.relationshipUid}`,
    cypher: `MATCH ()-[r:${q(type)} {relationshipUid: $relUid}]->() WHERE r.recordedTo IS NULL SET r.recordedTo = ${TX_NOW}, r.lastWriterRunId = $runId RETURN r.relationshipUid AS uid`,
    params: { relUid: e.relationshipUid },
    rows: 1, nodes: 0, rels: 0, uses: [],
  });
  ctx.relEffect({ key: e.relationshipUid, type, fromUid, toUid: e.toUid, relationshipUid: e.relationshipUid, op: "close", statementId: ctx.statements.at(-1)!.id, assertionUid: e.assertionUid });
}

// ---------------------------------------------------------------------------------------------
// node.upsert (OD-11 per-field evidence)
// ---------------------------------------------------------------------------------------------

function nodeUpsert(ctx: Ctx, p: P<"node.upsert">, plan: ProposalPlanV2): void {
  const s = target(ctx, plan, p.subjectRef, "subject");
  const spec = ctx.schema.node(s.nodeType);
  if (!spec) reject(plan, `UNKNOWN_NODE_TYPE: ${s.nodeType}`);
  if (spec.kernelRecord && spec.name !== "Source") reject(plan, `KERNEL_RECORD_READ_ONLY: ${spec.name} is not updated by node.upsert`);
  if (!Object.keys(p.properties).length) {
    if (s.creating) noop(plan, "subject creation covers this proposal");
    noop(plan, "no properties to set");
  }
  if (!s.creating && !spec.executorOps.has("update")) reject(plan, `TYPE_IMMUTABLE: register executor ops for ${spec.name} exclude update (${spec.derivation})`);
  let props = { ...p.properties };
  if (spec.name === "Person") {
    const stripped = stripContacts(props);
    props = stripped.props;
    plan.rewrites.push(...stripped.rewrites.map((r) => ({ ...r, from: r.from as never, to: r.to as never })));
  }
  if (spec.name === "Claim" && Object.keys(props).some((k) => ["lifecycleState", "latestVerdict", "refinesClaimUid"].includes(k) || k.startsWith("discourse"))) {
    requireGrant(ctx, plan, "projection.write", "Claim projection caches (R-45)");
  }
  const errors = checkNodeProps(ctx, spec, props, s.creating ? "create" : "update");
  if (errors.length) reject(plan, errors.join("; "));
  // FIELD Assertions for every factual field that has a registered FIELD predicate.
  const fieldAssertions: string[] = [];
  for (const [prop, value] of Object.entries(props)) {
    const fp = ctx.schema.fieldPredicate(spec.name, prop);
    const explicit = p.fieldEvidence[prop];
    if (!fp) {
      if (explicit) plan.warnings.push(`FIELD_EVIDENCE_NOT_PERSISTED: no registered FIELD predicate for ${spec.name}.${prop}; the value is written as a descriptive property and the evidence mapping stays in this plan`);
      continue;
    }
    const reported = [...ctx.locators.values()].filter((l) => l.reportsFields.includes(prop) || l.reportsFields.includes(`${spec.name}.${prop}`)).map((l) => l.ref);
    const evidence = explicit ?? (reported.length ? reported : p.evidence);
    if (!evidence.length) reject(plan, `FIELD_EVIDENCE_REQUIRED: ${spec.name}.${prop} is a FIELD fact (${fp.name}); give fieldEvidence or locators reporting it (OD-11)`);
    const v = typeof value === "number" ? { valueNumber: value } : typeof value === "boolean" ? { valueBoolean: value } : { valueString: typeof value === "string" ? value : canonicalize(value) };
    const aspec = buildAssertionSpec(ctx, plan, { qualifiers: [], validity: {} } as AssertionCoreV2, fp.name, "FIELD", s, undefined, p.asserterRef, evidence, v);
    fieldAssertions.push(emitAssertion(ctx, plan, aspec));
  }
  if (fieldAssertions.length) plan.mints.fieldAssertions = fieldAssertions.sort().join(",");
  updateNode(ctx, spec, s.uid, props, `upsert ${Object.keys(props).sort().join(", ")} on ${p.subjectRef}`);
}

// ---------------------------------------------------------------------------------------------
// identifier.attach (P6 any Subjectable, P7 one Identifier type, R-42 uniqueness)
// ---------------------------------------------------------------------------------------------

function identifierAttach(ctx: Ctx, p: P<"identifier.attach">, plan: ProposalPlanV2): void {
  const s = target(ctx, plan, p.subjectRef, "subject");
  const spec = ctx.schema.node(s.nodeType);
  if (!spec?.subjectable) reject(plan, `NOT_SUBJECTABLE: ${s.nodeType} cannot carry identifiers (HAS_IDENTIFIER targets Subjectable)`);
  const scheme = ctx.schema.schemes.get(p.identifier.scheme);
  if (!scheme) reject(plan, `UNREGISTERED_SCHEME: ${p.identifier.scheme} is not in identifier-schemes (R-42)`);
  const value = ctx.schema.normalizeIdentifier(scheme, p.identifier.value);
  if (value !== p.identifier.value) plan.rewrites.push({ field: "identifier.value", from: p.identifier.value, to: value, rule: scheme.rule });
  if (scheme.pattern && !scheme.pattern.test(value)) reject(plan, `IDENTIFIER_PATTERN_MISMATCH: ${p.identifier.scheme} value ${value} does not match ${scheme.pattern.source}`);
  const key = `${p.identifier.scheme}|${p.identifier.issuer}|${value}`;
  const identUid = `hu:identifier:${p.identifier.scheme.toLowerCase().replace(/_/g, "-")}-${h(key, 20)}`;
  plan.mints.identifier = identUid;
  const found = ctx.o<{ identUid: string; owners: Array<{ uid: string; relationshipUid: string }> }>(`ident:${key}`);
  const inPlan = ctx.identOwners.get(key);
  if (inPlan && inPlan !== s.uid) reject(plan, `BKS_IDENTITY_CONFLICT: ${key} is attached to ${inPlan} by an earlier proposal`);
  if (inPlan === s.uid) noop(plan, `identifier ${key} attached by an earlier proposal`);
  const owners = found?.owners ?? [];
  const other = owners.find((o) => o.uid !== s.uid);
  if (other) reject(plan, `BKS_IDENTITY_CONFLICT: ${key} already identifies ${other.uid} (one identifier identifies at most one Subjectable, R-42)`);
  if (owners.some((o) => o.uid === s.uid)) noop(plan, `identifier already attached: ${found!.identUid}`, { identifier: found!.identUid });
  const actualIdentUid = found?.identUid ?? identUid;
  if (!found && !ctx.creators.has(identUid)) {
    createNode(ctx, "proposal", ctx.schema.node("Identifier")!, identUid, { name: `${p.identifier.scheme}:${value}`, scheme: p.identifier.scheme, issuer: p.identifier.issuer, value, normalizationRule: scheme.rule }, `Identifier ${p.identifier.scheme}:${value}`);
    ctx.invariant("uid-absent", "BKS_IDENTITY_CONFLICT", { uid: identUid, label: "Identifier" });
  }
  ctx.invariant("identifier-owner", "BKS_IDENTITY_CONFLICT", { scheme: p.identifier.scheme, issuer: p.identifier.issuer, value, ownerUid: s.uid });
  ctx.identOwners.set(key, s.uid);
  const aspec = buildAssertionSpec(ctx, plan, { predicate: "HAS_IDENTIFIER", qualifiers: [...p.qualifiers], validity: p.validity } as AssertionCoreV2, "HAS_IDENTIFIER", "RELATIONSHIP", s, undefined, p.asserterRef, p.evidence, { valueString: `${p.identifier.scheme}:${value}` });
  const assertionUid = emitAssertion(ctx, plan, aspec);
  const relUid = `hu:rel:has-identifier-${h(assertionUid, 16)}`;
  plan.mints.relationship = relUid;
  const v = aspec.validity;
  const label = spec.primaryLabel;
  ctx.stmt({
    group: "proposal",
    purpose: `HAS_IDENTIFIER episode ${p.identifier.scheme}:${value}`,
    cypher: `MATCH (n:${q(label)} {uid: $subjectUid}) MATCH (i:Identifier {uid: $identUid})
CREATE (n)-[r:HAS_IDENTIFIER {relationshipUid: $relUid}]->(i)
SET r.assertionUid = $assertionUid, r.validFrom = CASE WHEN $validFrom IS NULL THEN null ELSE datetime($validFrom) END, r.validTo = CASE WHEN $validTo IS NULL THEN null ELSE datetime($validTo) END,
  r.validFromPrecision = $validFromPrecision, r.validToPrecision = $validToPrecision, r.validFromBasis = $validFromBasis, r.validToBasis = $validToBasis,
  r.recordedFrom = ${TX_NOW}, r.lastWriterRunId = $runId, r.isPrimary = $isPrimary
RETURN r.relationshipUid AS uid`,
    params: { subjectUid: s.uid, identUid: actualIdentUid, relUid, assertionUid, validFrom: v.validFrom, validTo: v.validTo, validFromPrecision: v.validFromPrecision, validToPrecision: v.validToPrecision, validFromBasis: v.validFromBasis, validToBasis: v.validToBasis, isPrimary: p.isPrimary ?? null },
    rows: 1, nodes: 0, rels: 1, uses: [s.uid, actualIdentUid, assertionUid],
  });
  ctx.relEffect({ key: relUid, type: "HAS_IDENTIFIER", fromUid: s.uid, toUid: actualIdentUid, relationshipUid: relUid, op: "create", statementId: ctx.statements.at(-1)!.id, assertionUid });
  ctx.invariant("asserted-edge-provenance", "BKS_STALE_PRECONDITION", { relationshipUid: relUid, type: "HAS_IDENTIFIER", assertionUid });
}

// ---------------------------------------------------------------------------------------------
// edge.assert (asserted typed edges; R-22 projection; R-10/OD-05 exclusive slots; P17 profiles)
// ---------------------------------------------------------------------------------------------

function relFor(ctx: Ctx, plan: ProposalPlanV2, type: string, from: RefTarget, to: RefTarget): { rel: RelSpec; profile: string | null } {
  const rel = ctx.schema.rels.get(type);
  if (!rel) reject(plan, `RELATIONSHIP_NOT_IN_SCHEMA: ${type} is not a relationship type of the release; a predicate-only fact is assertion.relate`);
  const pair = `${from.nodeType}|${to.nodeType}`;
  if (!rel.triples.has(pair)) reject(plan, `RELATIONSHIP_ENDPOINTS_INVALID: ${from.nodeType} -[${type}]-> ${to.nodeType} is not declared; declared pairs include ${[...rel.triples].slice(0, 6).join(", ")}${rel.triples.size > 6 ? ", ..." : ""}`);
  return { rel, profile: rel.profileByPair.get(pair) ?? null };
}

function checkEdgeProps(ctx: Ctx, plan: ProposalPlanV2, profileName: string | null, props: Record<string, unknown>): Record<string, unknown> {
  const profile = profileName ? ctx.schema.profiles.get(profileName) : undefined;
  const errors: string[] = [];
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    const prop = profile?.properties.find((x) => x.name === k);
    if (!prop) {
      errors.push(`unknown edge property ${profileName ?? "(no profile)"}.${k}`);
      continue;
    }
    if (EXECUTOR_EDGE_FIELDS.has(k)) {
      errors.push(`${profileName}.${k} is set by the executor`);
      continue;
    }
    const e = ctx.schema.checkValue({ ...prop, isRequired: false }, v);
    if (e) errors.push(e);
    else out[k] = v;
  }
  for (const prop of profile?.properties ?? []) if (prop.isRequired && !EXECUTOR_EDGE_FIELDS.has(prop.name) && out[prop.name] === undefined) errors.push(`REQUIRED_EDGE_PROPERTY_MISSING: ${profileName}.${prop.name}`);
  if (errors.length) reject(plan, `INVALID_EDGE_PROPERTY: ${errors.join("; ")}`);
  return out;
}

function edgeAssert(ctx: Ctx, p: P<"edge.assert">, plan: ProposalPlanV2): void {
  const from = target(ctx, plan, p.fromRef, "from");
  const to = target(ctx, plan, p.toRef, "to");
  const { rel, profile } = relFor(ctx, plan, p.relationshipType, from, to);
  if (rel.relClass === "derived") reject(plan, `DERIVED_EDGE_PROJECTION_ONLY: ${p.relationshipType} is a derived projection; ordinary writers assert its source facts, projections use projection.write`);
  if (rel.relClass === "structural") reject(plan, `ASSERTION_NOT_ALLOWED: ${p.relationshipType} is structural; use edge.structural`);
  if (rel.executorOwned) reject(plan, `KERNEL_EDGE_EXECUTOR_OWNED: ${p.relationshipType} is written by its proposal kind (identifier.attach for HAS_IDENTIFIER)`);
  const predicate = p.assertion.predicate ?? p.relationshipType;
  if (predicate !== p.relationshipType) reject(plan, `EDGE_PREDICATE_MISMATCH: an asserted edge is authorized by an Assertion whose predicate equals the edge type (${p.relationshipType}); ${predicate} belongs to assertion.relate`);
  checkPredicate(ctx, plan, predicate, ["authorizing", "relationship"], from.nodeType, to.nodeType, p.assertion.qualifiers);
  const edgeProps = checkEdgeProps(ctx, plan, profile, p.edgeProperties);
  const aspec = buildAssertionSpec(ctx, plan, p.assertion, predicate, "RELATIONSHIP", from, to, p.asserterRef, p.evidence, p.value);
  if (aspec.assertionKind === "CLAIM") plan.warnings.push("CLAIM_AUTHORIZES_EDGE: a claim occurrence authorizes this typed edge (typed edges are normally authorized by RELATIONSHIP assertions)");
  const existing = ctx.o(`assertion:${assertionUidOf(aspec)}`);
  const assertionUid = emitAssertion(ctx, plan, aspec);
  projectEpisode(ctx, plan, rel, profile, from, to, aspec, assertionUid, edgeProps, Boolean(existing));
}

/** R-22: an edge is projected only from a current POSITIVE Assertion (SUPPORT-gated types also need a SUPPORT adjudication); one episode per (from, to, type, asserter). */
function projectEpisode(ctx: Ctx, plan: ProposalPlanV2, rel: RelSpec, profile: string | null, from: RefTarget, to: RefTarget, aspec: AssertionSpec, assertionUid: string, edgeProps: Record<string, unknown>, assertionExisted: boolean, viaAdjudication = false): void {
  const type = rel.type;
  if (aspec.polarity !== "POSITIVE") {
    if (assertionExisted) noop(plan, `assertion ${assertionUid} already recorded`, { assertion: assertionUid });
    plan.warnings.push(`NOT_PROJECTED: polarity ${aspec.polarity}; the Assertion is recorded without an edge (R-22)`);
    return;
  }
  if (rel.projectionGate === "SUPPORT" && !viaAdjudication) {
    if (assertionExisted) noop(plan, `assertion ${assertionUid} already recorded`, { assertion: assertionUid });
    plan.warnings.push(`PROJECTION_GATED_SUPPORT: ${type} projects only after a SUPPORT adjudication with ${ctx.schema.admittingVerdicts.join("/")}; the Assertion is held without an edge`);
    return;
  }
  const open = (ctx.o<EpisodeRec[]>(`episodes:${type}|${from.uid}`) ?? []).filter((e) => !ctx.closedEpisodes.has(e.relationshipUid));
  const plannedOpen = ctx.openedEpisodes.filter((e) => e.type === type && e.fromUid === from.uid);
  const same = [...open, ...plannedOpen].find((e) => e.toUid === to.uid && e.asserterUid === aspec.asserter.uid);
  if (same) {
    if (assertionExisted) noop(plan, `assertion ${assertionUid} and its episode ${same.relationshipUid} already recorded`, { assertion: assertionUid, relationship: same.relationshipUid });
    plan.warnings.push(`CORROBORATES: one episode per (from, to, type, asserter); ${same.relationshipUid} stays the episode and this Assertion corroborates it`);
    plan.mints.relationship = same.relationshipUid;
    return;
  }
  if (assertionExisted) {
    // Assertion recorded earlier without an episode (e.g. its episode closed); re-projection is a new intent's decision.
    noop(plan, `assertion ${assertionUid} already recorded`, { assertion: assertionUid });
  }
  const v = aspec.validity;
  if (rel.exclusive) {
    // OD-05: non-overlap per (subject, slot, asserter); different asserters coexist.
    const clash = [...open, ...plannedOpen].find((e) => e.toUid !== to.uid && e.asserterUid === aspec.asserter.uid && intervalsOverlap(e.validFrom, e.validTo, v.validFrom, v.validTo));
    if (clash) reject(plan, `BKS_SLOT_CONFLICT: ${type} on ${from.uid} already has an open episode by ${aspec.asserter.uid} to ${clash.toUid} overlapping in valid time (${clash.relationshipUid}); close it first (edge.close or supersedes) (R-10, OD-05)`);
    ctx.invariant("slot-free", "BKS_SLOT_CONFLICT", { type, fromUid: from.uid, toUid: to.uid, asserterUid: aspec.asserter.uid, validFrom: v.validFrom, validTo: v.validTo, closing: [...ctx.closedEpisodes].sort() });
  }
  // Episodes this plan closes (supersession, edge.close) are excluded: a corrected episode between the same endpoints by
  // the same asserter replaces the one it closes in the same transaction.
  ctx.invariant("episode-absent", "BKS_STALE_PRECONDITION", { type, fromUid: from.uid, toUid: to.uid, asserterUid: aspec.asserter.uid, closing: [...ctx.closedEpisodes].sort() });
  const relUid = `hu:rel:${type.toLowerCase().replace(/_/g, "-")}-${h(assertionUid, 16)}`;
  plan.mints.relationship = relUid;
  const profileSpec = profile ? ctx.schema.profiles.get(profile) : undefined;
  const hasValid = Boolean(profileSpec?.properties.some((x) => x.name === "validFrom"));
  if (!hasValid && (v.validFrom || v.validTo)) plan.warnings.push(`RECORDED_ONLY_EPISODE: ${type} uses ${profile ?? "no profile"} (recorded time only, P17); valid time stays on the Assertion`);
  const fromLabel = ctx.schema.node(from.nodeType)!.primaryLabel;
  const toLabel = ctx.schema.node(to.nodeType)!.primaryLabel;
  const validClause = hasValid
    ? `, r.validFrom = CASE WHEN $validFrom IS NULL THEN null ELSE datetime($validFrom) END, r.validTo = CASE WHEN $validTo IS NULL THEN null ELSE datetime($validTo) END, r.validFromPrecision = $validFromPrecision, r.validToPrecision = $validToPrecision, r.validFromBasis = $validFromBasis, r.validToBasis = $validToBasis`
    : "";
  ctx.stmt({
    group: "proposal",
    purpose: `${type} episode authorized by ${assertionUid}`,
    cypher: `MATCH (a:${q(fromLabel)} {uid: $fromUid}) MATCH (b:${q(toLabel)} {uid: $toUid})
CREATE (a)-[r:${q(type)} {relationshipUid: $relUid}]->(b)
SET r += $edgeProps, r.assertionUid = $assertionUid, r.recordedFrom = ${TX_NOW}, r.lastWriterRunId = $runId${validClause}${intCasts(profileSpec?.properties, edgeProps, "r", "edgeProps")}
RETURN r.relationshipUid AS uid`,
    params: { fromUid: from.uid, toUid: to.uid, relUid, assertionUid, edgeProps, ...(hasValid ? { validFrom: v.validFrom, validTo: v.validTo, validFromPrecision: v.validFromPrecision, validToPrecision: v.validToPrecision, validFromBasis: v.validFromBasis, validToBasis: v.validToBasis } : {}) },
    rows: 1, nodes: 0, rels: 1, uses: [from.uid, to.uid, assertionUid],
  });
  ctx.relEffect({ key: relUid, type, fromUid: from.uid, toUid: to.uid, relationshipUid: relUid, op: "create", statementId: ctx.statements.at(-1)!.id, assertionUid });
  ctx.invariant("asserted-edge-provenance", "BKS_STALE_PRECONDITION", { relationshipUid: relUid, type, assertionUid });
  ctx.openedEpisodes.push({ type, fromUid: from.uid, relationshipUid: relUid, toUid: to.uid, assertionUid, asserterUid: aspec.asserter.uid, validFrom: v.validFrom, validTo: v.validTo });
}

// ---------------------------------------------------------------------------------------------
// assertion.relate / assertion.literal (predicate-only facts, R-40)
// ---------------------------------------------------------------------------------------------

function assertionRelate(ctx: Ctx, p: P<"assertion.relate">, plan: ProposalPlanV2): void {
  const s = target(ctx, plan, p.subjectRef, "subject");
  const o = target(ctx, plan, p.objectRef, "object");
  if (ctx.schema.rels.has(p.assertion.predicate) && ctx.schema.rels.get(p.assertion.predicate)!.relClass === "asserted") reject(plan, `TYPED_EDGE_EXISTS: ${p.assertion.predicate} is a typed asserted relationship; use edge.assert`);
  if (!ctx.schema.node(s.nodeType)?.subjectable && s.kind !== "proposal") reject(plan, `NOT_SUBJECTABLE: ${s.nodeType} cannot be an Assertion subject`);
  if (!ctx.schema.node(o.nodeType)?.subjectable) reject(plan, `NOT_SUBJECTABLE: ${o.nodeType} cannot be an Assertion object (HAS_OBJECT targets Subjectable)`);
  const spec = checkPredicate(ctx, plan, p.assertion.predicate, ["relationship", "literal", "computation"], s.nodeType, o.nodeType, p.assertion.qualifiers);
  if (spec.kind === "literal" && !spec.objectTypes.size) plan.warnings.push(`LITERAL_PREDICATE_WITH_OBJECT: ${spec.name} declares no object types`);
  const aspec = buildAssertionSpec(ctx, plan, p.assertion, spec.name, spec.kind === "computation" ? "COMPUTATION" : "RELATIONSHIP", s, o, p.asserterRef, p.evidence, p.value);
  const existed = ctx.o(`assertion:${assertionUidOf(aspec)}`);
  const uid = emitAssertion(ctx, plan, aspec);
  if (existed) noop(plan, `assertion ${uid} already recorded`, { assertion: uid });
}

function assertionLiteral(ctx: Ctx, p: P<"assertion.literal">, plan: ProposalPlanV2): void {
  const s = target(ctx, plan, p.subjectRef, "subject");
  if (!ctx.schema.node(s.nodeType)?.subjectable) reject(plan, `NOT_SUBJECTABLE: ${s.nodeType} cannot be an Assertion subject`);
  const spec = checkPredicate(ctx, plan, p.assertion.predicate, ["literal", "field", "computation"], s.nodeType, null, p.assertion.qualifiers);
  const given = (["valueString", "valueNumber", "valueBoolean"] as const).filter((k) => p.value[k] !== undefined);
  if (given.length > 1) reject(plan, `LITERAL_VALUE_INVALID: exactly one typed literal (got ${given.join(", ")})`);
  if (spec.valueFields.length && given.length === 0) reject(plan, `LITERAL_VALUE_REQUIRED: ${spec.name} carries ${spec.valueFields.join(" | ")}; a fact with an object node is assertion.relate`);
  if (given.length && spec.valueFields.length && !spec.valueFields.includes(given[0]!)) reject(plan, `LITERAL_VALUE_INVALID: ${spec.name} carries ${spec.valueFields.join(" | ")}, not ${given[0]}`);
  if (!spec.valueFields.length && given.length) plan.warnings.push(`LITERAL_VALUE_UNDECLARED: ${spec.name} declares no value field; ${given[0]} kept`);
  const kind = spec.kind === "field" ? "FIELD" : spec.kind === "computation" ? "COMPUTATION" : p.value.valueNumber !== undefined ? "METRIC" : "FIELD";
  const aspec = buildAssertionSpec(ctx, plan, p.assertion, spec.name, kind, s, undefined, p.asserterRef, p.evidence, p.value);
  const existed = ctx.o(`assertion:${assertionUidOf(aspec)}`);
  const uid = emitAssertion(ctx, plan, aspec);
  if (existed) noop(plan, `assertion ${uid} already recorded`, { assertion: uid });
}

// ---------------------------------------------------------------------------------------------
// edge.structural / edge.close
// ---------------------------------------------------------------------------------------------

function edgeStructural(ctx: Ctx, p: P<"edge.structural">, plan: ProposalPlanV2): void {
  const from = target(ctx, plan, p.fromRef, "from");
  const to = target(ctx, plan, p.toRef, "to");
  const { rel, profile } = relFor(ctx, plan, p.relationshipType, from, to);
  if (rel.relClass === "derived") reject(plan, `DERIVED_EDGE_PROJECTION_ONLY: ${p.relationshipType} is derived; projections use projection.write`);
  if (rel.relClass === "asserted") reject(plan, `ASSERTION_REQUIRED: ${p.relationshipType} is asserted; use edge.assert with evidence`);
  if (rel.executorOwned) reject(plan, `KERNEL_EDGE_EXECUTOR_OWNED: ${p.relationshipType} is written by the executor through its proposal kind`);
  const props = checkEdgeProps(ctx, plan, profile, p.properties);
  const existing = !from.creating && !to.creating ? ctx.o<{ count: number }>(`edge:${p.relationshipType}|${from.uid}|${to.uid}`) : null;
  if (existing) noop(plan, `edge exists: ${from.uid} -[${p.relationshipType}]-> ${to.uid}`);
  const key = `${p.relationshipType}|${from.uid}|${to.uid}`;
  if (ctx.relEffects.some((e) => e.key === key)) noop(plan, `edge created by an earlier proposal: ${key}`);
  const fromLabel = ctx.schema.node(from.nodeType)!.primaryLabel;
  const toLabel = ctx.schema.node(to.nodeType)!.primaryLabel;
  ctx.stmt({
    group: "proposal",
    purpose: `structural ${p.relationshipType}`,
    cypher: `MATCH (a:${q(fromLabel)} {uid: $fromUid}) MATCH (b:${q(toLabel)} {uid: $toUid}) CREATE (a)-[r:${q(p.relationshipType)}]->(b) SET r += $props, r.lastWriterRunId = $runId${intCasts(profile ? ctx.schema.profiles.get(profile)?.properties : undefined, props, "r", "props")} RETURN type(r) AS type`,
    params: { fromUid: from.uid, toUid: to.uid, props },
    rows: 1, nodes: 0, rels: 1, uses: [from.uid, to.uid],
  });
  ctx.relEffect({ key, type: p.relationshipType, fromUid: from.uid, toUid: to.uid, relationshipUid: null, op: "create", statementId: ctx.statements.at(-1)!.id });
}

function edgeClose(ctx: Ctx, p: P<"edge.close">, plan: ProposalPlanV2): void {
  const r = ctx.o<{ type: string; fromUid: string; toUid: string; recordedTo: string | null; assertionUid: string | null; asserterUid: string | null }>(`rel:${p.relationshipUid}`);
  if (r === undefined) return;
  if (r === null) reject(plan, `EPISODE_NOT_FOUND: no asserted episode with relationshipUid ${p.relationshipUid}`);
  if (r.recordedTo || ctx.closedEpisodes.has(p.relationshipUid)) noop(plan, `episode already closed${r.recordedTo ? ` at ${r.recordedTo}` : " by this intent"}`);
  if (p.asserterRef) {
    const a = target(ctx, plan, p.asserterRef, "asserter");
    if (a.uid !== r.asserterUid) reject(plan, `CLOSE_ASSERTER_MISMATCH: episode ${p.relationshipUid} belongs to asserter ${r.asserterUid}; an asserter closes only its own episodes (R-23)`);
  }
  closeEpisode(ctx, r.type, r.fromUid, { relationshipUid: p.relationshipUid, toUid: r.toUid, assertionUid: r.assertionUid ?? "", asserterUid: r.asserterUid, validFrom: null, validTo: null });
  if (r.assertionUid && !ctx.superseded.has(r.assertionUid)) {
    ctx.superseded.add(r.assertionUid);
    ctx.stmt({
      group: "proposal",
      purpose: `close authorizing assertion ${r.assertionUid}`,
      cypher: `MATCH (a:Assertion {uid: $uid}) WHERE a.recordedTo IS NULL SET a.recordedTo = ${TX_NOW}, a.status = 'SUPERSEDED', a.updatedAt = ${TX_NOW}, a.lastWriterRunId = $runId RETURN a.uid AS uid`,
      params: { uid: r.assertionUid },
      rows: 1, nodes: 0, rels: 0, uses: [r.assertionUid],
    });
    ctx.nodeEffect({ uid: r.assertionUid, label: "Assertion", op: "update", statementId: ctx.statements.at(-1)!.id, properties: ["recordedTo", "status"] });
  }
  plan.reasons.push(`closing ${r.type} episode: ${p.reason}`);
}

// ---------------------------------------------------------------------------------------------
// assessment.record (P18 refinesClaimUid, KN-02), mention.stage (P8), lineage.start (P15, OD-06)
// ---------------------------------------------------------------------------------------------

function assessmentInputs(ctx: Ctx, plan: ProposalPlanV2, assertions: AssertionRef[], assessments: Array<{ proposal: string } | { uid: string }>): { assertionUids: string[]; assessmentUids: string[] } {
  const assertionUids = assertions.map((r) => assertionRefUid(ctx, plan, r, "input assertion"));
  const assessmentUids = assessments.map((r) => {
    if ("proposal" in r) return target(ctx, plan, r.proposal, "input assessment").uid;
    const o = ctx.o(`assessment:${r.uid}`);
    if (o === null && !ctx.creators.has(r.uid)) hold(plan, `DEPENDENCY_MISSING: input assessment ${r.uid}`);
    return r.uid;
  });
  return { assertionUids: [...new Set(assertionUids)].sort(), assessmentUids: [...new Set(assessmentUids)].sort() };
}

function emitAssessment(ctx: Ctx, plan: ProposalPlanV2, a: { uid: string; props: Record<string, unknown>; about: RefTarget[]; inputs: { assertionUids: string[]; assessmentUids: string[] }; evidence: EvidenceRow[]; supersedesUid?: string }): void {
  const spec = ctx.schema.node("Assessment")!;
  const pp = propertyParams(spec, a.props, "x", "p");
  const about = a.about.map((t) => ({ uid: t.uid, label: ctx.schema.node(t.nodeType)!.primaryLabel }));
  for (const t of about) if (!ctx.schema.rels.get("ASSESSES")!.triples.has(`Assessment|${ctx.schema.nodeByLabel.get(t.label)!.name}`)) reject(plan, `ASSESSES_TARGET_INVALID: an Assessment cannot assess ${t.label}`);
  const evidence = a.evidence.map((e) => ({ uid: e.uid, role: e.role, esc: e.esc }));
  const id = ctx.stmt({
    group: "proposal",
    purpose: `Assessment ${a.props.assessmentKind}`,
    cypher: `MATCH (act:Activity {uid: $activityUid})
CREATE (x:${q("Assessment")}:${q("EvidenceAssessment")} {uid: $uid})
SET x += $pProps, x.id = $id, x.privacyClass = $privacyClass, x.lastWriterRunId = $runId, x.recordedAt = ${TX_NOW}, x.createdAt = ${TX_NOW}, x.updatedAt = ${TX_NOW}${pp.clause}
CREATE (x)-[:WAS_GENERATED_BY]->(act)
RETURN x.uid AS uid`,
    params: { uid: a.uid, id: a.uid.slice("hu:assessment:".length), pProps: pp.plain, pDt: pp.dt, pD: pp.d, privacyClass: ctx.privacyClass, activityUid: ctx.activityUid },
    rows: 1, nodes: 1, rels: 1, uses: [ctx.activityUid], creates: [a.uid],
  });
  ctx.nodeEffect({ uid: a.uid, label: "Assessment", op: "create", statementId: id, properties: Object.keys(a.props).sort() });
  ctx.invariant("uid-absent", "BKS_IDENTITY_CONFLICT", { uid: a.uid, label: "Assessment" });
  linkRecord(ctx, "Assessment", a.uid, about, a.inputs, evidence);
  if (a.supersedesUid) {
    ctx.stmt({
      group: "proposal",
      purpose: `supersede assessment ${a.supersedesUid}`,
      cypher: `MATCH (o:Assessment {uid: $old}) WHERE o.recordedTo IS NULL SET o.recordedTo = ${TX_NOW}, o.status = 'SUPERSEDED', o.updatedAt = ${TX_NOW}, o.lastWriterRunId = $runId RETURN o.uid AS uid`,
      params: { old: a.supersedesUid },
      rows: 1, nodes: 0, rels: 0, uses: [a.supersedesUid],
    });
  }
}

/** ASSESSES / DERIVED_FROM / HAS_EVIDENCE links of an Assessment, Report, ReportItem or Adjudication. */
function linkRecord(ctx: Ctx, label: string, uid: string, about: Array<{ uid: string; label: string }>, inputs: { assertionUids: string[]; assessmentUids: string[] }, evidence: Array<{ uid: string; role: string; esc: string | null; origin?: string; authority?: string | null; independence?: string | null; facet?: string | null }>): void {
  const byLabel = new Map<string, string[]>();
  for (const t of about) byLabel.set(t.label, [...(byLabel.get(t.label) ?? []), t.uid]);
  for (const [l, uids] of [...byLabel.entries()].sort()) {
    const list = [...new Set(uids)].sort();
    ctx.stmt({
      group: "proposal",
      purpose: `${label} ASSESSES ${l}`,
      cypher: `MATCH (x:${q(label)} {uid: $uid}) UNWIND $targets AS t MATCH (y:${q(l)} {uid: t}) CREATE (x)-[:ASSESSES]->(y) RETURN y.uid AS uid`,
      params: { uid, targets: list },
      rows: list.length, nodes: 0, rels: list.length, uses: [uid, ...list],
    });
    for (const t of list) ctx.relEffect({ key: `ASSESSES|${uid}|${t}`, type: "ASSESSES", fromUid: uid, toUid: t, relationshipUid: null, op: "create", statementId: ctx.statements.at(-1)!.id });
  }
  for (const [l, list] of [["Assertion", inputs.assertionUids], ["Assessment", inputs.assessmentUids]] as const) {
    if (!list.length) continue;
    ctx.stmt({
      group: "proposal",
      purpose: `${label} DERIVED_FROM ${l}`,
      cypher: `MATCH (x:${q(label)} {uid: $uid}) UNWIND $inputs AS i MATCH (y:${q(l)} {uid: i}) CREATE (x)-[:DERIVED_FROM]->(y) RETURN y.uid AS uid`,
      params: { uid, inputs: list },
      rows: list.length, nodes: 0, rels: list.length, uses: [uid, ...list],
    });
  }
  if (evidence.length) {
    ctx.stmt({
      group: "proposal",
      purpose: `${label} HAS_EVIDENCE`,
      cypher: `MATCH (x:${q(label)} {uid: $uid}) UNWIND $evidence AS ev MATCH (l:SourceLocator {uid: ev.uid})
CREATE (x)-[e:HAS_EVIDENCE]->(l) SET e.role = ev.role, e.origin = coalesce(ev.origin, 'DECLARED'), e.expectedSelectedContentDigest = ev.esc, e.authority = ev.authority, e.independence = ev.independence, e.facet = ev.facet, e.lastWriterRunId = $runId
RETURN l.uid AS uid`,
      params: { uid, evidence: evidence.map((e) => ({ uid: e.uid, role: e.role, esc: e.esc ?? null, origin: e.origin ?? null, authority: e.authority ?? null, independence: e.independence ?? null, facet: e.facet ?? null })) },
      rows: evidence.length, nodes: 0, rels: evidence.length, uses: [uid, ...evidence.map((e) => e.uid)],
    });
  }
}

function assessmentRecord(ctx: Ctx, p: P<"assessment.record">, plan: ProposalPlanV2): void {
  const errs = [
    ctx.schema.enumCheck("AssessmentKind", p.assessmentKind, "assessmentKind"),
    ctx.schema.enumCheck("ClaimDisposition", p.disposition, "disposition"),
    ctx.schema.enumCheck("SemanticVerdict", p.verdict, "verdict"),
    ctx.schema.enumCheck("EffectDirection", p.effectDirection, "effectDirection"),
    ctx.schema.enumCheck("CertaintyLevel", p.certainty, "certainty"),
  ].filter(Boolean);
  if (errs.length) reject(plan, `INVALID_ASSESSMENT: ${errs.join("; ")}`);
  if (p.disposition && p.assessmentKind !== "VETTING") reject(plan, "INVALID_ASSESSMENT: disposition is VETTING only");
  if (p.status === "ACCEPTED") requireGrant(ctx, plan, "assessment.accept", "an ACCEPTED assessment");
  const about = p.about.map((r) => target(ctx, plan, r, "about"));
  const inputs = assessmentInputs(ctx, plan, p.inputs.assertions, p.inputs.assessments);
  const evidence = resolveEvidence(ctx, plan, p.evidence, false);
  const inputSetDigest = digestOfSorted([...inputs.assertionUids, ...inputs.assessmentUids, ...evidence.map((e) => e.uid)]);
  const uid = p.uidSegment ? `hu:assessment:${p.uidSegment}` : `hu:assessment:${hc({ k: p.assessmentKind, sk: p.assessmentSubkind ?? null, about: about.map((t) => t.uid).sort(), m: p.methodVersion, i: inputSetDigest, f: [...p.facets].sort(), c: p.conclusionCode ?? null, v: p.verdict ?? null }, 24)}`;
  plan.mints.assessment = uid;
  if (ctx.creators.has(uid) || ctx.o(`assessment:${uid}`)) noop(plan, `assessment ${uid} already recorded`, { assessment: uid });
  if (p.supersedesUid && ctx.o(`assessment:${p.supersedesUid}`) === null) hold(plan, `DEPENDENCY_MISSING: superseded assessment ${p.supersedesUid}`);
  const props: Record<string, unknown> = {
    name: `${p.assessmentKind}${p.assessmentSubkind ? ` ${p.assessmentSubkind}` : ""}`,
    assessmentKind: p.assessmentKind, ...(p.assessmentSubkind ? { assessmentSubkind: p.assessmentSubkind } : {}), status: p.status, methodVersion: p.methodVersion,
    ...(p.disposition ? { disposition: p.disposition } : {}), ...(p.verdict ? { verdict: p.verdict } : {}), ...(p.effectDirection ? { effectDirection: p.effectDirection } : {}),
    ...(p.score !== undefined ? { score: p.score } : {}), ...(p.gradeScheme ? { gradeScheme: p.gradeScheme } : {}), ...(p.grade ? { grade: p.grade } : {}), ...(p.certainty ? { certainty: p.certainty } : {}),
    ...(p.conclusionCode ? { conclusionCode: p.conclusionCode } : {}), ...(p.facets.length ? { facets: [...p.facets].sort() } : {}), ...(p.summary ? { summary: p.summary } : {}),
    ...(p.rationaleText ? { rationale: p.rationaleText } : {}), ...(p.evidenceCutoffAt ? { evidenceCutoffAt: p.evidenceCutoffAt } : {}), inputSetDigest, ...(p.supersedesUid ? { supersedesUid: p.supersedesUid } : {}),
  };
  emitAssessment(ctx, plan, { uid, props, about, inputs, evidence, ...(p.supersedesUid ? { supersedesUid: p.supersedesUid } : {}) });
  // P18 / KN-02: an ACCEPTED EQUIVALENCE assessment with conclusionCode REFINES caches the broader Claim on the narrower one, atomically.
  if (p.assessmentKind === "EQUIVALENCE" && p.conclusionCode === "REFINES") {
    const claims = about.filter((t) => t.nodeType === "Claim");
    if (claims.length !== 2) reject(plan, "INVALID_ASSESSMENT: an EQUIVALENCE REFINES assessment assesses exactly two Claims (about[0] narrower, about[1] broader)");
    if (p.status === "ACCEPTED") {
      ctx.stmt({
        group: "proposal",
        purpose: "refinesClaimUid cache (P18) from the accepted REFINES assessment",
        cypher: `MATCH (n:Claim {uid: $narrower}) MATCH (b:Claim {uid: $broader}) SET n.refinesClaimUid = b.uid, n.updatedAt = ${TX_NOW}, n.lastWriterRunId = $runId RETURN n.uid AS uid`,
        params: { narrower: claims[0]!.uid, broader: claims[1]!.uid },
        rows: 1, nodes: 0, rels: 0, uses: [claims[0]!.uid, claims[1]!.uid],
      });
      ctx.nodeEffect({ uid: claims[0]!.uid, label: "Claim", op: "update", statementId: ctx.statements.at(-1)!.id, properties: ["refinesClaimUid"] });
    } else plan.warnings.push("REFINES_CACHE_DEFERRED: refinesClaimUid is written only from an ACCEPTED REFINES assessment");
  }
}

function mentionStage(ctx: Ctx, p: P<"mention.stage">, plan: ProposalPlanV2): void {
  const ev = resolveEvidence(ctx, plan, [{ locator: p.locator, role: "CONTEXT" }], false);
  const loc = typeof p.locator === "string" ? ctx.locators.get(p.locator) : ctx.locatorsByUid.get(p.locator.uid);
  if (p.typeHint && !ctx.schema.node(p.typeHint)) reject(plan, `UNKNOWN_NODE_TYPE: typeHint ${p.typeHint}`);
  let about = p.candidates.map((r) => target(ctx, plan, r, "candidate"));
  const facets = [`surfaceForm=${p.surfaceForm.replace(/\s+/g, " ")}`, ...(p.normalizedForm ? [`normalizedForm=${p.normalizedForm}`] : []), ...(p.typeHint ? [`typeHint=${p.typeHint}`] : [])];
  if (!about.length) {
    const sourceUid = loc?.sourceUid ?? ctx.o<{ sourceUid: string }>(`locator:${ev[0]!.uid}`)?.sourceUid;
    if (!sourceUid) reject(plan, "MENTION_SOURCE_UNKNOWN: the locator's Source could not be determined");
    about = [{ uid: sourceUid, nodeType: "Source", kind: "source", creating: ctx.creators.has(sourceUid) }];
    facets.push("candidate=none");
  }
  const uid = `hu:assessment:${hc({ k: "RESOLUTION", l: ev[0]!.uid, s: p.surfaceForm, c: about.map((t) => t.uid).sort() }, 24)}`;
  plan.mints.assessment = uid;
  if (ctx.creators.has(uid) || ctx.o(`assessment:${uid}`)) noop(plan, `resolution already staged: ${uid}`, { assessment: uid });
  const props = { name: `RESOLUTION ${p.surfaceForm}`.slice(0, 200), assessmentKind: "RESOLUTION", status: "PROPOSED", methodVersion: `${ctx.input.executorVersion}/mention.stage@1`, facets: facets.sort(), ...(p.score !== undefined ? { score: p.score } : {}), rationale: `${p.reason}${p.context ? ` | ${p.context}` : ""}`, inputSetDigest: digestOfSorted(ev.map((e) => e.uid)) };
  emitAssessment(ctx, plan, { uid, props, about, inputs: { assertionUids: [], assessmentUids: [] }, evidence: ev });
}

function lineageStart(ctx: Ctx, p: P<"lineage.start">, plan: ProposalPlanV2): void {
  const about = p.about.map((r) => target(ctx, plan, r, "about"));
  if (ctx.intent.context.activityKind === "EVIDENCE_MISSION" && (about.length !== 1 || about[0]!.nodeType !== "Claim")) reject(plan, "LINEAGE_INVALID: an EVIDENCE_MISSION Activity ASSESSES exactly one Claim (OD-06)");
  let wrote = false;
  const targets = about.filter((t) => !(ctx.activityExists && !t.creating && ctx.o(`edge:ASSESSES|${ctx.activityUid}|${t.uid}`)));
  for (const t of targets) {
    const l = ctx.schema.node(t.nodeType)!.primaryLabel;
    ctx.stmt({ group: "proposal", purpose: `Activity ASSESSES ${t.uid}`, cypher: `MATCH (act:Activity {uid: $activityUid}) MATCH (y:${q(l)} {uid: $t}) CREATE (act)-[:ASSESSES]->(y) RETURN y.uid AS uid`, params: { activityUid: ctx.activityUid, t: t.uid }, rows: 1, nodes: 0, rels: 1, uses: [ctx.activityUid, t.uid] });
    ctx.relEffect({ key: `ASSESSES|${ctx.activityUid}|${t.uid}`, type: "ASSESSES", fromUid: ctx.activityUid, toUid: t.uid, relationshipUid: null, op: "create", statementId: ctx.statements.at(-1)!.id });
    wrote = true;
  }
  for (const prior of p.informedBy) {
    const priorUid = activityUidFor(prior.system, prior.runId);
    const exists = ctx.o(`node:${priorUid}`);
    if (exists === null) hold(plan, `DEPENDENCY_MISSING: prior run Activity ${priorUid} (${prior.system} ${prior.runId}) is not in the graph`);
    if (ctx.activityExists && ctx.o(`edge:WAS_INFORMED_BY|${ctx.activityUid}|${priorUid}`)) continue;
    ctx.stmt({ group: "proposal", purpose: `WAS_INFORMED_BY ${priorUid}`, cypher: "MATCH (act:Activity {uid: $activityUid}) MATCH (y:Activity {uid: $prior}) CREATE (act)-[:WAS_INFORMED_BY]->(y) RETURN y.uid AS uid", params: { activityUid: ctx.activityUid, prior: priorUid }, rows: 1, nodes: 0, rels: 1, uses: [ctx.activityUid, priorUid] });
    ctx.relEffect({ key: `WAS_INFORMED_BY|${ctx.activityUid}|${priorUid}`, type: "WAS_INFORMED_BY", fromUid: ctx.activityUid, toUid: priorUid, relationshipUid: null, op: "create", statementId: ctx.statements.at(-1)!.id });
    wrote = true;
  }
  if (!wrote) noop(plan, "lineage already recorded");
}


// ---------------------------------------------------------------------------------------------
// adjudication: trusted delivery hydrated from a sealed verification result (KN-15, OD-08, P16)
// ---------------------------------------------------------------------------------------------

type Column = "passing" | "held" | "failing";

function mappedStatus(ctx: Ctx, verdict: string, policyOutcome: string, mechanicalFailed: boolean): string {
  const cols = ctx.schema.captureFidelity.columns;
  let col: Column = (Object.keys(cols) as Column[]).find((c) => cols[c].includes(policyOutcome)) ?? "held";
  if (mechanicalFailed) col = "failing";
  const row = ctx.schema.captureFidelity.rows.find((r) => r.verdicts.includes(verdict));
  return row ? row.status[col] : "PROPOSED";
}

/**
 * KN-15 decision table (kn15-assertion-status/v1):
 *  - new Assertion: EXTRACTED (captured, unadjudicated)
 *  - CAPTURE_FIDELITY judgment: status = verdict-lattice mapping(verdict, policy column); a failed mechanical stage forces the failing column
 *  - SUPPORT judgment: status unchanged (world question); admitting verdicts project SUPPORT-gated edges
 *  - human decision on a held result (superseding Adjudication, HUMAN_ORIGIN): AFFIRM -> ACCEPTED; REJECT -> REJECTED (prevents acceptance);
 *    DEFER -> unchanged; never overrides a mechanical failure (status stays)
 *  - SYNTHETIC_ENGINEERING decisions never change status
 *  - OD-08: ACCEPTED from tool-rendition-only evidence requires PASS_WITH_WARNINGS, policy permission and recorded failed issuer-byte capture attempts; otherwise held at PROPOSED
 */
function adjudication(ctx: Ctx, p: P<"adjudication">, plan: ProposalPlanV2): void {
  requireGrant(ctx, plan, "adjudication.deliver", "an adjudication (trusted verification delivery)");
  const v = ctx.input.verifications.get(`${p.verificationRef.ref}|${p.verificationRef.digest}`);
  if (!v || v.error || !v.body) reject(plan, `${v?.error?.code ?? "BKS_EVIDENCE_UNVERIFIED"}: sealed verification ${p.verificationRef.ref} ${v?.error?.message ?? "is not in trusted custody"}`);
  const body: SealedVerificationBody = v.body;
  const errs = [ctx.schema.enumCheck("SemanticVerdict", body.verdict, "verdict")].filter(Boolean);
  if (errs.length) reject(plan, `INVALID_ADJUDICATION: ${errs.join("; ")}`);
  const assertion = ctx.o<{ predicate: string; status: string; polarity: string | null; subjectUid: string | null; objectUid: string | null; asserterUid: string | null; recordedTo: string | null; evidence: Array<{ uid: string; contentHashBasis: string | null; sourceUid: string | null }> }>(`assertion:${body.assertionUid}`);
  if (assertion === undefined) return;
  if (assertion === null) hold(plan, `DEPENDENCY_MISSING: adjudicated assertion ${body.assertionUid} is not in the graph`);
  const uid = `hu:adjudication:${h(`${body.issuer}\n${body.judgmentId}`, 24)}`;
  plan.mints.adjudication = uid;
  if (ctx.creators.has(uid) || ctx.o(`adjudication:${uid}`)) noop(plan, `adjudication ${uid} (judgment ${body.judgmentId}) already delivered`, { adjudication: uid });
  // Evidence: every locator must exist with the sealed selector digest.
  for (const e of body.evidence) {
    const l = ctx.locatorsByUid.get(e.locatorUid)?.selectorDigest ?? ctx.o<{ selectorDigest: string }>(`locator:${e.locatorUid}`)?.selectorDigest;
    if (l === undefined) continue;
    if (l === null || l !== e.selectorDigest) reject(plan, `BKS_EVIDENCE_UNVERIFIED: sealed evidence locator ${e.locatorUid} does not match its selector digest`);
  }
  // Superseded held adjudication (human decision).
  let held: { policyOutcome?: string; mechanicalStatus?: string; recordedTo?: string } | null | undefined = null;
  if (body.supersedesAdjudicationUid) {
    held = ctx.o(`adjudication:${body.supersedesAdjudicationUid}`);
    if (held === null) hold(plan, `DEPENDENCY_MISSING: superseded adjudication ${body.supersedesAdjudicationUid}`);
  }
  const mechanicalFailed = body.mechanicalStatus === "failed" || held?.mechanicalStatus === "failed";
  let newStatus: string | null = null;
  const current = assertion.status;
  if (body.adjudicationKind === "CAPTURE_FIDELITY") {
    if (body.decision) {
      if (body.decisionProvenance !== "HUMAN_ORIGIN") plan.warnings.push("KN15_SYNTHETIC_DECISION: SYNTHETIC_ENGINEERING decisions never change Assertion.status");
      else if (mechanicalFailed) plan.warnings.push("KN15_MECHANICAL_FAILURE_STANDS: a human decision never overrides a failed mechanical stage");
      else if (current !== "PROPOSED") plan.warnings.push(`KN15_NOT_HELD: decision ${body.decision} applies to held (PROPOSED) assertions; status ${current} kept`);
      else if (body.decision === "AFFIRM") newStatus = "ACCEPTED";
      else if (body.decision === "REJECT") newStatus = "REJECTED";
    } else newStatus = mappedStatus(ctx, body.verdict, body.policyOutcome, mechanicalFailed);
    if (newStatus === "ACCEPTED") {
      const evidence = assertion.evidence.length ? assertion.evidence : [];
      const renditionOnly = evidence.length > 0 && evidence.every((e) => e.contentHashBasis === "TOOL_RENDITION");
      if (renditionOnly) {
        const sources = [...new Set(evidence.map((e) => e.sourceUid).filter(Boolean) as string[])];
        const attemptsOk = sources.every((s) => (ctx.o<Array<{ outcome: string }>>(`attempts:${s}`) ?? []).some((a) => a.outcome === "FAILED"));
        const policyOk = body.policy.toolRenditionException && (body.policyOutcome === "PASS_WITH_WARNINGS" || body.decision === "AFFIRM");
        if (!(attemptsOk && policyOk)) {
          newStatus = "PROPOSED";
          plan.warnings.push(`OD08_RENDITION_HELD: evidence is tool-rendition only; ACCEPTED needs PASS_WITH_WARNINGS, policy toolRenditionException and recorded failed issuer-byte capture attempts (${attemptsOk ? "attempts recorded" : "no failed attempt recorded"}, ${policyOk ? "policy permits" : "policy does not permit"}); held at PROPOSED`);
        } else plan.warnings.push("OD08_RENDITION_EXCEPTION: ACCEPTED on tool-rendition evidence with PASS_WITH_WARNINGS (capture fidelity only; SUPPORT and publication gates stay independent)");
      }
    }
  }
  const props: Record<string, unknown> = {
    name: `${body.adjudicationKind} ${body.verdict}`,
    adjudicationKind: body.adjudicationKind, verdict: body.verdict, ...(body.mechanicalStatus ? { mechanicalStatus: body.mechanicalStatus } : {}), policyOutcome: body.policyOutcome,
    judgeKind: body.judgeKind, methodVersion: body.methodVersion, ...body.properties, ...(body.unsupportedFacets.length ? { unsupportedFacets: body.unsupportedFacets } : {}),
    ...(body.calibratedProbability !== undefined ? { calibratedProbability: body.calibratedProbability } : {}), ...(body.rationale ? { rationale: body.rationale } : {}),
    ...(body.decision ? { decision: body.decision } : {}), ...(body.decisionProvenance ? { decisionProvenance: body.decisionProvenance } : {}), judgmentId: body.judgmentId,
    ...(body.supersedesAdjudicationUid ? { supersedesUid: body.supersedesAdjudicationUid } : {}),
  };
  const adjSpec = ctx.schema.node("Adjudication")!;
  const pp = propertyParams(adjSpec, props, "x", "p");
  // The verification run is its own Activity (VERIFICATION, ks-verification, bundleDigest).
  const runUid = activityUidFor(body.run.system, body.run.runId);
  const runExists = ctx.creators.has(runUid) || Boolean(ctx.o(`node:${runUid}`));
  if (!runExists) {
    const aSpec = ctx.schema.node("Activity")!;
    const ap = propertyParams(aSpec, { name: `${body.run.system} run ${body.run.runId}`, activityKind: "VERIFICATION", externalRunSystem: body.run.system, runId: body.run.runId, ...(body.run.bundleDigest ? { bundleDigest: body.run.bundleDigest } : {}), ...(body.run.policyVersion ? { policyVersion: body.run.policyVersion } : {}), methodVersion: body.methodVersion }, "v", "v");
    ctx.stmt({
      group: "proposal",
      purpose: "verification run Activity",
      cypher: `MATCH (act:Activity {uid: $activityUid}) CREATE (v:Activity:Occurrence {uid: $uid}) SET v += $vProps, v.id = $id, v.privacyClass = 'INTERNAL', v.lastWriterRunId = $runId, v.createdAt = ${TX_NOW}, v.updatedAt = ${TX_NOW} CREATE (v)-[:WAS_INFORMED_BY]->(act) RETURN v.uid AS uid`,
      params: { uid: runUid, id: runUid.split(":").pop(), vProps: ap.plain, activityUid: ctx.activityUid },
      rows: 1, nodes: 1, rels: 1, uses: [ctx.activityUid], creates: [runUid],
    });
    ctx.nodeEffect({ uid: runUid, label: "Activity", op: "create", statementId: ctx.statements.at(-1)!.id, properties: ["activityKind", "runId"] });
  }
  const id = ctx.stmt({
    group: "proposal",
    purpose: `Adjudication ${body.adjudicationKind} ${body.verdict}`,
    cypher: `MATCH (run:Activity {uid: $runUid}) MATCH (a:Assertion {uid: $assertionUid})
CREATE (x:${q("Adjudication")}:${q("EvidenceAssessment")} {uid: $uid})
SET x += $pProps, x.id = $id, x.privacyClass = $privacyClass, x.lastWriterRunId = $runId, x.recordedAt = ${TX_NOW}, x.createdAt = ${TX_NOW}, x.updatedAt = ${TX_NOW}${pp.clause}
CREATE (x)-[:ASSESSES]->(a) CREATE (x)-[:WAS_GENERATED_BY]->(run)
RETURN x.uid AS uid`,
    params: { uid, id: uid.slice("hu:adjudication:".length), pProps: pp.plain, pDt: pp.dt, pD: pp.d, privacyClass: ctx.privacyClass, runUid, assertionUid: body.assertionUid },
    rows: 1, nodes: 1, rels: 2, uses: [runUid, body.assertionUid], creates: [uid],
  });
  ctx.nodeEffect({ uid, label: "Adjudication", op: "create", statementId: id, properties: Object.keys(props).sort() });
  ctx.invariant("uid-absent", "BKS_IDENTITY_CONFLICT", { uid, label: "Adjudication" });
  // P16: authority / independence / facet only on VERIFIER_FOUND edges.
  linkRecord(ctx, "Adjudication", uid, [], { assertionUids: [], assessmentUids: [] }, body.evidence.map((e) => ({ uid: e.locatorUid, role: e.role, esc: null, origin: e.origin, authority: e.origin === "VERIFIER_FOUND" ? e.authority ?? null : null, independence: e.origin === "VERIFIER_FOUND" ? e.independence ?? null : null, facet: e.origin === "VERIFIER_FOUND" ? e.facet ?? null : null })));
  if (body.supersedesAdjudicationUid && held && !held.recordedTo) {
    ctx.stmt({ group: "proposal", purpose: `close held adjudication ${body.supersedesAdjudicationUid}`, cypher: `MATCH (o:Adjudication {uid: $old}) WHERE o.recordedTo IS NULL SET o.recordedTo = ${TX_NOW}, o.updatedAt = ${TX_NOW}, o.lastWriterRunId = $runId RETURN o.uid AS uid`, params: { old: body.supersedesAdjudicationUid }, rows: 1, nodes: 0, rels: 0, uses: [body.supersedesAdjudicationUid] });
  }
  if (newStatus && newStatus !== current) {
    ctx.stmt({ group: "proposal", purpose: `Assertion.status ${current} -> ${newStatus} (KN-15)`, cypher: `MATCH (a:Assertion {uid: $uid}) WHERE a.status = $from SET a.status = $to, a.updatedAt = ${TX_NOW}, a.lastWriterRunId = $runId RETURN a.uid AS uid`, params: { uid: body.assertionUid, from: current, to: newStatus }, rows: 1, nodes: 0, rels: 0, uses: [body.assertionUid] });
    ctx.nodeEffect({ uid: body.assertionUid, label: "Assertion", op: "update", statementId: ctx.statements.at(-1)!.id, properties: ["status"] });
    plan.reasons.push(`KN15: ${current} -> ${newStatus}`);
  }
  // SUPPORT with an admitting verdict projects a SUPPORT-gated edge for this asserter (R-22).
  if (body.adjudicationKind === "SUPPORT" && ctx.schema.admittingVerdicts.includes(body.verdict)) {
    const rel = ctx.schema.rels.get(assertion.predicate);
    if (rel?.projectionGate === "SUPPORT" && assertion.subjectUid && assertion.objectUid && assertion.asserterUid && !assertion.recordedTo) {
      const fromSpec = ctx.schema.nodeForUid(assertion.subjectUid)!;
      const toSpec = ctx.schema.nodeForUid(assertion.objectUid)!;
      const fakeSpec = { polarity: assertion.polarity ?? "POSITIVE", asserter: { uid: assertion.asserterUid, nodeType: ctx.schema.nodeForUid(assertion.asserterUid)?.name ?? "Agent" }, validity: { validFrom: null, validTo: null, validFromPrecision: null, validToPrecision: null, validFromBasis: "UNKNOWN", validToBasis: "UNKNOWN", validObservedAt: null, validObservedAtPrecision: null } } as unknown as AssertionSpec;
      const pair = `${fromSpec.name}|${toSpec.name}`;
      projectEpisode(ctx, plan, rel, rel.profileByPair.get(pair) ?? null, { uid: assertion.subjectUid, nodeType: fromSpec.name, kind: "subject", creating: false }, { uid: assertion.objectUid, nodeType: toSpec.name, kind: "subject", creating: false }, fakeSpec, body.assertionUid, {}, false, true);
      plan.reasons.push(`SUPPORT_PROJECTION: ${assertion.predicate} projected for asserter ${assertion.asserterUid}`);
    }
  }
}

// ---------------------------------------------------------------------------------------------
// report.publish (P19) and projection.write
// ---------------------------------------------------------------------------------------------

function reportPublish(ctx: Ctx, p: P<"report.publish">, plan: ProposalPlanV2): void {
  requireGrant(ctx, plan, "report.publish", "report publication");
  const errs = [ctx.schema.enumCheck("ReportKind", p.reportKind, "reportKind"), ctx.schema.enumCheck("SemanticVerdict", p.verdict, "verdict"), ctx.schema.enumCheck("PropertyStatus", p.worldCorrectness, "worldCorrectness"), ctx.schema.enumCheck("PolicyOutcome", p.policyOutcome, "policyOutcome")].filter(Boolean);
  if (errs.length) reject(plan, `INVALID_REPORT: ${errs.join("; ")}`);
  const about = p.about.map((r) => target(ctx, plan, r, "about"));
  if (p.reportKind === "EVIDENCE_REPORT" && (about.length !== 1 || about[0]!.nodeType !== "Claim")) reject(plan, "INVALID_REPORT: an EVIDENCE_REPORT ASSESSES exactly one Claim");
  if (p.reportKind === "COMPARISON" && !about.length) reject(plan, "INVALID_REPORT: a COMPARISON ASSESSES the compared entities");
  // biotech-schema-v2.2.0 (R-SV11): a study appraisal ASSESSES the appraised study (or studies).
  if (p.reportKind === "STUDY_APPRAISAL" && !about.length) reject(plan, "INVALID_REPORT: a STUDY_APPRAISAL ASSESSES the appraised study or studies");
  if (!["EVIDENCE_MISSION", "ANSWER", "PROJECTION"].includes(ctx.intent.context.activityKind)) plan.warnings.push(`REPORT_ACTIVITY_KIND: the composing Activity is ${ctx.intent.context.activityKind} (expected EVIDENCE_MISSION, ANSWER or PROJECTION)`);
  const inputs = assessmentInputs(ctx, plan, p.citesAssertions, p.citesAssessments);
  if (!inputs.assertionUids.length && !inputs.assessmentUids.length) reject(plan, "INVALID_REPORT: the minimum citation set needs DERIVED_FROM every Assertion or Assessment the report rests on");
  const evidence = resolveEvidence(ctx, plan, p.evidence, false);
  const uid = p.uidSegment ? `hu:report:${p.uidSegment}` : `hu:report:${h(`${p.reportKind}\n${p.bodyDigest}`, 24)}`;
  plan.mints.report = uid;
  if (ctx.creators.has(uid) || ctx.o(`report:${uid}`)) noop(plan, `report ${uid} already published`, { report: uid });
  if (p.supersedesUid && ctx.o(`report:${p.supersedesUid}`) === null) hold(plan, `DEPENDENCY_MISSING: superseded report ${p.supersedesUid}`);
  const props: Record<string, unknown> = {
    name: p.name, reportKind: p.reportKind, ...(p.skeletonKey ? { skeletonKey: p.skeletonKey } : {}), status: "ACCEPTED", policyVersion: p.policyVersion, bodyDigest: p.bodyDigest,
    ...(p.bodyUri ? { bodyUri: p.bodyUri } : {}), ...(p.ledgerDigest ? { ledgerDigest: p.ledgerDigest } : {}), ...(p.bundleDigest ? { bundleDigest: p.bundleDigest } : {}),
    ...(p.verdict ? { verdict: p.verdict } : {}), ...(p.worldCorrectness ? { worldCorrectness: p.worldCorrectness } : {}), ...(p.policyOutcome ? { policyOutcome: p.policyOutcome } : {}),
    ...(p.citationCompleteness !== undefined ? { citationCompleteness: p.citationCompleteness } : {}), ...(p.citationCorrectness !== undefined ? { citationCorrectness: p.citationCorrectness } : {}),
    ...(p.queryDigest ? { queryDigest: p.queryDigest } : {}), ...(p.publishedAt ? { publishedAt: p.publishedAt } : {}), ...(p.supersedesUid ? { supersedesUid: p.supersedesUid } : {}),
    // Knowledge Services report revision binding (R-SV10 fields; written only when declared).
    ...(p.reportRevisionRef ? { reportRevisionRef: p.reportRevisionRef } : {}), ...(p.reportSchema ? { reportSchema: p.reportSchema } : {}), ...(p.reportKindRef ? { reportKindRef: p.reportKindRef } : {}),
    ...(p.structuredBodyDigest ? { structuredBodyDigest: p.structuredBodyDigest } : {}), ...(p.supersedesReportRevisionRef ? { supersedesReportRevisionRef: p.supersedesReportRevisionRef } : {}), ...(p.custodyKind ? { custodyKind: p.custodyKind } : {}),
  };
  const spec = ctx.schema.node("Report")!;
  const pp = propertyParams(spec, props, "x", "p");
  const id = ctx.stmt({
    group: "proposal",
    purpose: `Report ${p.reportKind}`,
    cypher: `MATCH (act:Activity {uid: $activityUid})
CREATE (x:${q("Report")}:${q("InformationArtifact")} {uid: $uid})
SET x += $pProps, x.id = $id, x.privacyClass = $privacyClass, x.lastWriterRunId = $runId, x.recordedAt = ${TX_NOW}, x.createdAt = ${TX_NOW}, x.updatedAt = ${TX_NOW}${pp.clause}
CREATE (x)-[:WAS_GENERATED_BY]->(act)
RETURN x.uid AS uid`,
    params: { uid, id: uid.slice("hu:report:".length), pProps: pp.plain, pDt: pp.dt, pD: pp.d, privacyClass: ctx.privacyClass, activityUid: ctx.activityUid },
    rows: 1, nodes: 1, rels: 1, uses: [ctx.activityUid], creates: [uid],
  });
  ctx.nodeEffect({ uid, label: "Report", op: "create", statementId: id, properties: Object.keys(props).sort() });
  ctx.invariant("uid-absent", "BKS_IDENTITY_CONFLICT", { uid, label: "Report" });
  linkRecord(ctx, "Report", uid, about.map((t) => ({ uid: t.uid, label: ctx.schema.node(t.nodeType)!.primaryLabel })), inputs, evidence);
  const itemSpec = ctx.schema.node("ReportItem")!;
  for (const item of p.items) {
    const ierr = [ctx.schema.enumCheck("ReportItemKind", item.itemKind, "itemKind"), ctx.schema.enumCheck("ReportSectionKind", item.sectionKind, "sectionKind"), ctx.schema.enumCheck("OptionDisposition", item.disposition, "disposition")].filter(Boolean);
    if (ierr.length) reject(plan, `INVALID_REPORT_ITEM: ${item.itemKey}: ${ierr.join("; ")}`);
    const itemUid = `hu:report-item:${h(`${uid}\n${item.itemKey}`, 24)}`;
    const iprops = { name: item.itemKey, itemKind: item.itemKind, itemKey: item.itemKey, ...(item.sectionKind ? { sectionKind: item.sectionKind } : {}), ...(item.parentItemKey ? { parentItemKey: item.parentItemKey } : {}), ...(item.disposition ? { disposition: item.disposition } : {}), ...(item.rank !== undefined ? { rank: item.rank } : {}), ...(item.cellValues ? { cellValues: item.cellValues } : {}), ...(item.reason ? { reason: item.reason } : {}) };
    const ip = propertyParams(itemSpec, iprops, "i", "p");
    ctx.stmt({
      group: "proposal",
      purpose: `ReportItem ${item.itemKey}`,
      cypher: `MATCH (act:Activity {uid: $activityUid}) MATCH (r:Report {uid: $reportUid})
CREATE (i:${q("ReportItem")}:${q("InformationArtifact")} {uid: $uid})
SET i += $pProps, i.id = $id, i.privacyClass = $privacyClass, i.lastWriterRunId = $runId, i.recordedAt = ${TX_NOW}, i.createdAt = ${TX_NOW}, i.updatedAt = ${TX_NOW}
CREATE (r)-[hi:HAS_ITEM]->(i) SET hi.lastWriterRunId = $runId CREATE (i)-[:WAS_GENERATED_BY]->(act)
RETURN i.uid AS uid`,
      params: { uid: itemUid, id: itemUid.slice("hu:report-item:".length), pProps: ip.plain, privacyClass: ctx.privacyClass, activityUid: ctx.activityUid, reportUid: uid },
      rows: 1, nodes: 1, rels: 2, uses: [ctx.activityUid, uid], creates: [itemUid],
    });
    ctx.nodeEffect({ uid: itemUid, label: "ReportItem", op: "create", statementId: ctx.statements.at(-1)!.id, properties: Object.keys(iprops).sort() });
    const iabout = item.about.map((r) => target(ctx, plan, r, "item about"));
    const iinputs = assessmentInputs(ctx, plan, item.derivedFrom, []);
    linkRecord(ctx, "ReportItem", itemUid, iabout.map((t) => ({ uid: t.uid, label: ctx.schema.node(t.nodeType)!.primaryLabel })), iinputs, []);
  }
  if (p.supersedesUid) ctx.stmt({ group: "proposal", purpose: `close superseded report ${p.supersedesUid}`, cypher: `MATCH (o:Report {uid: $old}) WHERE o.recordedTo IS NULL SET o.recordedTo = ${TX_NOW}, o.status = 'SUPERSEDED', o.updatedAt = ${TX_NOW}, o.lastWriterRunId = $runId RETURN o.uid AS uid`, params: { old: p.supersedesUid }, rows: 1, nodes: 0, rels: 0, uses: [p.supersedesUid] });
  // R-45 cache: Claim.latestVerdict from the published evidence report.
  if (p.reportKind === "EVIDENCE_REPORT" && p.verdict) {
    ctx.stmt({ group: "proposal", purpose: "Claim.latestVerdict cache (R-45)", cypher: `MATCH (c:Claim {uid: $claim}) SET c.latestVerdict = $verdict, c.lifecycleState = 'REPORTED', c.updatedAt = ${TX_NOW}, c.lastWriterRunId = $runId RETURN c.uid AS uid`, params: { claim: about[0]!.uid, verdict: p.verdict }, rows: 1, nodes: 0, rels: 0, uses: [about[0]!.uid] });
    ctx.nodeEffect({ uid: about[0]!.uid, label: "Claim", op: "update", statementId: ctx.statements.at(-1)!.id, properties: ["latestVerdict", "lifecycleState"] });
  }
}

function projectionWrite(ctx: Ctx, p: P<"projection.write">, plan: ProposalPlanV2): void {
  requireGrant(ctx, plan, "projection.write", "a projection write (derived edges and Associations)");
  const pr = p.projection;
  if (pr.target === "derived-edge") {
    const from = target(ctx, plan, pr.fromRef, "from");
    const to = target(ctx, plan, pr.toRef, "to");
    const { rel, profile } = relFor(ctx, plan, pr.relationshipType, from, to);
    if (rel.relClass !== "derived") reject(plan, `NOT_DERIVED: ${pr.relationshipType} is ${rel.relClass}; projection.write writes derived edges only`);
    const fromAssertions = pr.derivedFromAssertions.map((r) => assertionRefUid(ctx, plan, r, "derivation input"));
    const fromAssessments = pr.derivedFromAssessments.map((r) => ("proposal" in r ? target(ctx, plan, r.proposal, "derivation input").uid : r.uid));
    const of = pr.projectionOfAssertion ? assertionRefUid(ctx, plan, pr.projectionOfAssertion, "projected assertion") : null;
    const forms = [of ? 1 : 0, fromAssertions.length ? 1 : 0, fromAssessments.length ? 1 : 0].reduce((a, b) => a + b, 0);
    if (forms !== 1) reject(plan, "INVALID_PROJECTION: exactly one citation form (projectionOfAssertionUid, derivedFromAssertionUids or derivedFromAssessmentUids)");
    const domainToDomain = from.kind === "subject" && to.kind === "subject" && ctx.schema.node(from.nodeType)?.subjectable && ctx.schema.node(to.nodeType)?.subjectable && from.nodeType !== "Chunk";
    if (pr.score !== undefined && domainToDomain) reject(plan, "INVALID_PROJECTION: score is never set on a derived edge between two domain entities (3.6)");
    const props = checkEdgeProps(ctx, plan, profile, pr.properties);
    const key = `${pr.relationshipType}|${from.uid}|${to.uid}|${pr.derivationRule}`;
    if (!from.creating && !to.creating && ctx.o(`edge:${pr.relationshipType}|${from.uid}|${to.uid}`)) noop(plan, `derived edge exists: ${key}`);
    const fl = ctx.schema.node(from.nodeType)!.primaryLabel;
    const tl = ctx.schema.node(to.nodeType)!.primaryLabel;
    ctx.stmt({
      group: "proposal",
      purpose: `derived ${pr.relationshipType} (${pr.derivationRule})`,
      cypher: `MATCH (a:${q(fl)} {uid: $fromUid}) MATCH (b:${q(tl)} {uid: $toUid}) CREATE (a)-[r:${q(pr.relationshipType)}]->(b)
SET r += $props, r.derivationRule = $rule, r.projectionOfAssertionUid = $of, r.derivedFromAssertionUids = $fa, r.derivedFromAssessmentUids = $fs, r.score = $score, r.derivedAt = ${TX_NOW}, r.lastWriterRunId = $runId${intCasts(profile ? ctx.schema.profiles.get(profile)?.properties : undefined, props, "r", "props")}
RETURN type(r) AS type`,
      params: { fromUid: from.uid, toUid: to.uid, props, rule: pr.derivationRule, of, fa: fromAssertions.length ? [...fromAssertions].sort() : null, fs: fromAssessments.length ? [...fromAssessments].sort() : null, score: pr.score ?? null },
      rows: 1, nodes: 0, rels: 1, uses: [from.uid, to.uid],
    });
    ctx.relEffect({ key, type: pr.relationshipType, fromUid: from.uid, toUid: to.uid, relationshipUid: null, op: "create", statementId: ctx.statements.at(-1)!.id });
    return;
  }
  // association
  const errs = [ctx.schema.enumCheck("AssociationKind", pr.associationKind, "associationKind")].filter(Boolean);
  if (errs.length) reject(plan, `INVALID_PROJECTION: ${errs.join("; ")}`);
  const anchor = target(ctx, plan, pr.anchorRef, "anchor");
  const members = pr.memberRefs.map((r) => target(ctx, plan, r, "member"));
  const inputs = assessmentInputs(ctx, plan, pr.inputs, pr.inputAssessments);
  const inputSetDigest = digestOfSorted([...inputs.assertionUids, ...inputs.assessmentUids]);
  const uid = `hu:association:${hc({ k: pr.associationKind, a: anchor.uid, m: members.map((m) => m.uid).sort(), mv: pr.methodVersion, i: inputSetDigest }, 24)}`;
  plan.mints.association = uid;
  if (ctx.creators.has(uid) || ctx.o(`node:${uid}`)) noop(plan, `association ${uid} already projected`, { association: uid });
  const props: Record<string, unknown> = { name: `${pr.associationKind} ${anchor.uid}`.slice(0, 200), associationKind: pr.associationKind, anchorUid: anchor.uid, score: pr.score, methodVersion: pr.methodVersion, inputSetDigest, inputCount: inputs.assertionUids.length + inputs.assessmentUids.length, computedAt: ctx.input.plannedAt, ...(pr.statistic ? { statistic: pr.statistic } : {}), ...(pr.statisticValue !== undefined ? { statisticValue: pr.statisticValue } : {}), ...(pr.threshold !== undefined ? { threshold: pr.threshold } : {}), ...(pr.components ? { components: pr.components } : {}), ...(pr.staleAfter ? { staleAfter: pr.staleAfter } : {}) };
  const spec = ctx.schema.node("Association")!;
  const pp = propertyParams(spec, props, "x", "p");
  ctx.stmt({
    group: "proposal",
    purpose: `Association ${pr.associationKind}`,
    cypher: `MATCH (act:Activity {uid: $activityUid})
CREATE (x:${labelsOfName(ctx, "Association")} {uid: $uid})
SET x += $pProps, x.id = $id, x.privacyClass = $privacyClass, x.lastWriterRunId = $runId, x.recordedAt = ${TX_NOW}, x.createdAt = ${TX_NOW}, x.updatedAt = ${TX_NOW}${pp.clause}
CREATE (x)-[:WAS_GENERATED_BY]->(act)
RETURN x.uid AS uid`,
    params: { uid, id: uid.slice("hu:association:".length), pProps: pp.plain, pDt: pp.dt, pD: pp.d, privacyClass: ctx.privacyClass, activityUid: ctx.activityUid },
    rows: 1, nodes: 1, rels: 1, uses: [ctx.activityUid], creates: [uid],
  });
  ctx.nodeEffect({ uid, label: "Association", op: "create", statementId: ctx.statements.at(-1)!.id, properties: Object.keys(props).sort() });
  const all = [anchor, ...members];
  const byLabel = new Map<string, string[]>();
  for (const m of all) {
    const l = ctx.schema.node(m.nodeType)!.primaryLabel;
    byLabel.set(l, [...new Set([...(byLabel.get(l) ?? []), m.uid])]);
  }
  for (const [l, uids] of [...byLabel.entries()].sort()) {
    ctx.stmt({ group: "proposal", purpose: `ASSOCIATES ${l}`, cypher: `MATCH (x:Association {uid: $uid}) UNWIND $members AS m MATCH (y:${q(l)} {uid: m}) CREATE (x)-[r:ASSOCIATES]->(y) SET r.derivationRule = $rule, r.derivedFromAssertionUids = $fa, r.derivedAt = ${TX_NOW}, r.lastWriterRunId = $runId RETURN y.uid AS uid`, params: { uid, members: uids.sort(), rule: pr.methodVersion, fa: inputs.assertionUids.length ? inputs.assertionUids : null }, rows: uids.length, nodes: 0, rels: uids.length, uses: [uid, ...uids] });
  }
  if (inputs.assertionUids.length || inputs.assessmentUids.length) linkRecord(ctx, "Association", uid, [], inputs, []);
}

function labelsOfName(ctx: Ctx, name: string): string {
  return ctx.schema.node(name)!.labels.map(q).join(":");
}

export type { AssertionSpec };
