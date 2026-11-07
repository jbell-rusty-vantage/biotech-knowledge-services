import {
  canonicalDigest,
  canonicalInstant,
  canonicalize,
  type EvidenceSelector,
  type IngestionPlanV2,
  type ProposalPlanV2,
  type ProposalV2,
  type SubjectPlanV2,
  type ValidityV2,
} from "@bks/contracts";
import { slugify } from "../uid.js";
import {
  checkNodeProps,
  Ctx,
  digestOfSorted,
  h,
  hc,
  labelsOf,
  propertyParams,
  q,
  stripContacts,
  TX_NOW,
  type CompileInput,
  type LocatorInfo,
  type RefTarget,
} from "./context.js";
import { compileProposal } from "./proposals.js";
import { ASSERTER_TYPES, type NodeSpec } from "./release-model.js";
import { canonicalizeUri, sourceUidFor } from "./uri.js";

export type CompiledPlanBody = Omit<IngestionPlanV2, "schemaVersion" | "planRef" | "planDigest">;

export const SELECTOR_DIGEST_PROFILE = {};

/**
 * Pure compiler: normalized intent + release + frozen observations + injected clock -> plan body.
 * No I/O, no wall clock, no randomness. Running it twice over the same inputs yields the same body (same digest).
 */
export function compile(input: CompileInput): CompiledPlanBody {
  const ctx = new Ctx(input);
  const { intent, schema } = input;

  // 1. Release and context checks.
  if (intent.pins.schemaReleaseDigest !== schema.schemaReleaseDigest) ctx.error("BKS_RELEASE_MISMATCH", `intent pins release ${intent.pins.schemaReleaseDigest}; the executor serves ${schema.schemaReleaseDigest}`, { expected: schema.schemaReleaseDigest });
  if (intent.pins.schemaDigest && intent.pins.schemaDigest !== schema.schemaDigest) ctx.error("BKS_RELEASE_MISMATCH", `intent pins schema ${intent.pins.schemaDigest}; the executor serves ${schema.schemaDigest}`);
  if (!schema.enumHas("ActivityKind", intent.context.activityKind)) ctx.error("INVALID_ACTIVITY_KIND", `${intent.context.activityKind} is not a kernel ActivityKind (${[...(schema.enums.get("ActivityKind") ?? [])].join(", ")})`);

  const fence = ctx.o<{ exists: boolean; graphRevision: number; revocationGeneration: number; releaseDigests: string[] }>("fence");
  const observedGraphRevision = fence?.graphRevision ?? 0;

  // 2. Basis (custody-verified snapshot or creation-only).
  const basis = input.basis;
  let dependencyCheck: "revision-equal" | "dependencies-unchanged" | "not-applicable" = "not-applicable";
  if (basis.error) ctx.error(basis.error.code, basis.error.message);
  if (basis.kind === "snapshot" && !basis.error && fence) {
    if (basis.snapshotGraphRevision === observedGraphRevision) dependencyCheck = "revision-equal";
    else if (basis.dependencies?.complete) {
      const changed: string[] = [];
      for (const dep of basis.dependencies.nodes) {
        const n = ctx.o<{ updatedAt: string | null }>(`node:${dep.uid}`);
        if (n === undefined) continue;
        if ((n?.updatedAt ?? null) !== dep.updatedAt) changed.push(dep.uid);
      }
      if (changed.length) ctx.error("BKS_STALE_REVISION", `snapshot ${basis.snapshotRef} was read at revision ${basis.snapshotGraphRevision}; ${changed.length} dependency(ies) changed since (graph revision ${observedGraphRevision}); read again and re-plan`, { changed: changed.slice(0, 20) });
      else dependencyCheck = "dependencies-unchanged";
    } else ctx.error("BKS_STALE_REVISION", `snapshot ${basis.snapshotRef} was read at revision ${basis.snapshotGraphRevision ?? "unknown"}, the graph is at ${observedGraphRevision}, and the snapshot does not declare complete dependencies`);
  }
  if (basis.kind === "creationOnly") {
    for (const uid of basis.expectAbsent) {
      const n = ctx.o(`uid:${uid}`);
      if (n) ctx.error("BKS_STALE_PRECONDITION", `creation-only basis expects ${uid} to be absent; it exists`);
    }
    for (const uid of basis.expectPresent) {
      const n = ctx.o(`node:${uid}`);
      if (n === null) ctx.error("BKS_STALE_PRECONDITION", `creation-only basis expects ${uid} to exist; it does not`);
    }
  }

  // 3. Activity (one per run, P2) and the executor Agent.
  compileActivity(ctx);

  // 4. Sources, snapshots, capture attempts, locators.
  const sources = compileSources(ctx);

  // 5. Subjects.
  compileSubjects(ctx);

  // 5b. Declared identifiers of new-mode subjects (created or resolved to an existing node; KN-06, R-42): an identifier
  // with evidence and an active scheme is
  // attached in this plan as an implicit identifier.attach (proposalId "id.<subjectRef>.<scheme>", hashed when longer than a ref); explicit
  // identifier.attach proposals for the same identifier become duplicates of it.
  const implicit: ProposalV2[] = [];
  for (const subj of intent.subjects) {
    if (subj.mode !== "new") continue;
    const sp = ctx.subjects.get(subj.ref);
    for (const ident of subj.identifiers) {
      const scheme = ctx.schema.schemes.get(ident.scheme);
      if (!ident.evidence?.length) {
        if (sp?.disposition === "create") ctx.warn("IDENTIFIER_NOT_ATTACHED", `subject ${subj.ref}: ${ident.scheme} ${ident.value} is a resolution key only (no evidence); attach it with identifier.attach citing a locator`);
        continue;
      }
      if (!scheme || (sp?.disposition !== "create" && sp?.disposition !== "use_existing")) continue;
      const rawId = `id.${subj.ref}.${ident.scheme.toLowerCase().replace(/_/g, "-")}`;
      implicit.push({ proposalId: rawId.length <= 64 ? rawId : `id.${h(rawId, 20)}`, kind: "identifier.attach", subjectRef: subj.ref, identifier: { scheme: ident.scheme, issuer: ident.issuer, value: ident.value }, evidence: ident.evidence, dependsOn: [], qualifiers: [], validity: {} } as unknown as ProposalV2);
    }
  }
  for (const p of implicit) if (!ctx.proposals.has(p.proposalId) && !ctx.refs.has(p.proposalId)) compileOne(ctx, p);

  // 6. Proposals, in declared order.
  for (const p of intent.proposals) {
    if (ctx.proposals.has(p.proposalId) || ctx.refs.has(p.proposalId)) {
      ctx.error("DUPLICATE_REF", `proposal id ${p.proposalId} collides with another proposal, subject or source ref`);
      continue;
    }
    compileOne(ctx, p);
  }

  // 7. Implicit dependencies from statement needs, then outcome.
  addImplicitDependencies(ctx);
  const proposals = [...implicit, ...intent.proposals].map((p) => ctx.proposals.get(p.proposalId)!).filter(Boolean);
  if (ctx.statements.length > 6000) ctx.error("BKS_LIMIT_EXCEEDED", `plan has ${ctx.statements.length} statements (limit 6000); split the intent into bounded child intents`);
  const outcome: CompiledPlanBody["outcome"] = ctx.errors.length
    ? "rejected"
    : proposals.every((p) => p.disposition === "noop_duplicate")
      ? "noop"
      : proposals.every((p) => p.disposition === "admitted" || p.disposition === "noop_duplicate")
        ? "applicable"
        : proposals.some((p) => p.disposition === "admitted")
          ? "partial"
          : proposals.some((p) => p.disposition === "held") && !proposals.some((p) => p.disposition === "rejected")
            ? "held"
            : "rejected";

  const evidenceDigest = canonicalDigest({
    locators: [...ctx.locators.values()].map((l) => `${l.uid}|${l.selectorDigest}`).sort(),
    snapshots: intent.sources.filter((s) => s.snapshot).map((s) => s.snapshot!.contentHash).sort(),
    custody: [...input.verifications.values()].map((v) => `${v.ref}|${v.digest}`).sort(),
    basis: basis.kind === "snapshot" ? `${basis.snapshotRef}|${basis.snapshotDigest}` : `creationOnly|${basis.reason}`,
  });

  return {
    binding: {
      intentId: intent.intentId,
      intentDigest: input.intentDigest,
      observationsDigest: input.obs.digest(),
      observedGraphRevision,
      plannedAt: input.plannedAt,
      executorVersion: input.executorVersion,
      schemaReleaseDigest: schema.schemaReleaseDigest,
      schemaDigest: schema.schemaDigest,
      rulesDigest: schema.rulesDigest(),
      policyVersion: intent.pins.policyVersion,
      canonicalJson: "bks-canonical-json.v2",
      basis: {
        kind: basis.kind,
        ...(basis.snapshotRef ? { snapshotRef: basis.snapshotRef } : {}),
        ...(basis.snapshotDigest ? { snapshotDigest: basis.snapshotDigest } : {}),
        ...(typeof basis.snapshotGraphRevision === "number" ? { snapshotGraphRevision: basis.snapshotGraphRevision } : {}),
        dependencyCheck,
        ...(basis.reason ? { reason: basis.reason } : {}),
      },
      principal: { principalId: input.principal.principalId, installationId: input.principal.installationId, applicationId: input.principal.applicationId, tenantId: input.principal.tenantId, grants: [...input.principal.grants].sort() },
      custodyRefs: [
        ...(basis.kind === "snapshot" && basis.snapshotRef && basis.snapshotDigest ? [{ kind: "snapshot", ref: basis.snapshotRef, digest: basis.snapshotDigest }] : []),
        ...[...input.verifications.values()].map((v) => ({ kind: "sealed-verification", ref: v.ref, digest: v.digest })),
      ],
      evidenceDigest,
    },
    outcome,
    activity: { uid: ctx.activityUid, agentUid: input.agentUid, system: ctx.runSystem, runId: ctx.runId, exists: ctx.activityExists },
    sources,
    subjects: [...ctx.subjects.values()],
    proposals,
    effects: { nodes: ctx.nodeEffects, relationships: ctx.relEffects },
    invariants: ctx.invariants,
    statements: outcome === "rejected" || outcome === "held" ? [] : ctx.statements,
    errors: ctx.errors,
    warnings: ctx.warnings,
  };
}

// ---------------------------------------------------------------------------------------------
// Activity and Agent
// ---------------------------------------------------------------------------------------------

function compileActivity(ctx: Ctx): void {
  const { intent, input } = ctx;
  const activity = ctx.schema.node("Activity")!;
  const agent = ctx.schema.node("Agent")!;
  const existing = ctx.o<{ props?: { activityKind?: string } }>(`node:${ctx.activityUid}`);
  ctx.activityExists = Boolean(existing);
  if (existing === null) {
    const props = {
      name: `${ctx.runSystem} run ${ctx.runId}`,
      activityKind: intent.context.activityKind,
      externalRunSystem: ctx.runSystem,
      runId: ctx.runId,
      ...(intent.context.run.missionId ? { missionId: intent.context.run.missionId } : {}),
      ...(intent.context.run.activationId ? { activationId: intent.context.run.activationId } : {}),
      ...(intent.context.operationKind ? { operationKind: intent.context.operationKind } : {}),
      methodVersion: input.executorVersion,
      startedAt: input.plannedAt,
      operationIds: [] as string[],
      intentDigests: [] as string[],
      planDigests: [] as string[],
      receiptIds: [] as string[],
    };
    const pp = propertyParams(activity, props, "act", "a");
    ctx.stmt({
      group: "activity",
      purpose: "create the run's Activity (one per externalRunSystem + runId)",
      cypher: `CREATE (act:${labelsOf(activity)} {uid: $uid})
SET act += $aProps, act.id = $id, act.privacyClass = $privacyClass, act.lastWriterRunId = $runId, act.createdAt = ${TX_NOW}, act.updatedAt = ${TX_NOW}${pp.clause}
RETURN act.uid AS uid`,
      params: { uid: ctx.activityUid, id: ctx.activityUid.split(":").pop(), aProps: pp.plain, aDt: pp.dt, aD: pp.d, privacyClass: "INTERNAL" },
      rows: 1, nodes: 1, rels: 0, creates: [ctx.activityUid],
    });
    ctx.nodeEffect({ uid: ctx.activityUid, label: "Activity", op: "create", statementId: ctx.statements.at(-1)!.id, properties: ["activityKind", "runId", "externalRunSystem"] });
  } else if (existing && existing.props?.activityKind && existing.props.activityKind !== intent.context.activityKind) {
    ctx.warn("ACTIVITY_KIND_DIFFERS", `run Activity ${ctx.activityUid} is ${existing.props.activityKind}; this intent says ${intent.context.activityKind} (one Activity per run keeps its kind)`);
  }
  const agentNode = ctx.o(`node:${input.agentUid}`);
  if (agentNode === null && !ctx.creators.has(input.agentUid)) {
    const pp = propertyParams(agent, { name: input.agentName, agentKind: "AUTOMATED_AGENT", toolVersion: input.executorVersion }, "ag", "g");
    ctx.stmt({
      group: "activity",
      purpose: "create the executor Agent",
      cypher: `MATCH (act:Activity {uid: $activityUid})
CREATE (ag:${labelsOf(agent)} {uid: $uid})
SET ag += $gProps, ag.id = $id, ag.privacyClass = 'PUBLIC', ag.lastWriterRunId = $runId, ag.createdAt = ${TX_NOW}, ag.updatedAt = ${TX_NOW}
CREATE (ag)-[:WAS_GENERATED_BY]->(act)
RETURN ag.uid AS uid`,
      params: { uid: input.agentUid, id: input.agentUid.split(":").pop(), gProps: pp.plain, activityUid: ctx.activityUid },
      rows: 1, nodes: 1, rels: 1, uses: [ctx.activityUid], creates: [input.agentUid],
    });
    ctx.nodeEffect({ uid: input.agentUid, label: "Agent", op: "create", statementId: ctx.statements.at(-1)!.id, properties: ["agentKind"] });
  }
  const assoc = ctx.activityExists ? ctx.o(`edge:WAS_ASSOCIATED_WITH|${ctx.activityUid}|${input.agentUid}`) : null;
  if (assoc === null) {
    ctx.stmt({
      group: "activity",
      purpose: "link the Activity to the executor Agent",
      cypher: "MATCH (act:Activity {uid: $activityUid}) MATCH (ag:Agent {uid: $agentUid}) CREATE (act)-[:WAS_ASSOCIATED_WITH]->(ag) RETURN act.uid AS uid",
      params: { activityUid: ctx.activityUid, agentUid: input.agentUid },
      rows: 1, nodes: 0, rels: 1, uses: [ctx.activityUid, input.agentUid],
    });
  }
  ctx.refs.set("@agent", { uid: input.agentUid, nodeType: "Agent", kind: "subject", creating: ctx.creators.has(input.agentUid) });
}

// ---------------------------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------------------------

/**
 * WR-19 temporal precondition shared by the planner (plannedAt) and apply (the apply clock): a declared snapshot whose
 * retrievedAt lies after `now`, or whose observedAt lies after its retrievedAt, cannot be cited. Instants compare exactly
 * (no clock-skew allowance); equality is accepted. Returns the problem text or null.
 */
export function snapshotTemporalProblem(s: { retrievedAt: string; observedAt?: string | undefined }, now: string): string | null {
  const retrieved = Date.parse(s.retrievedAt);
  const at = Date.parse(now);
  if (Number.isFinite(retrieved) && Number.isFinite(at) && retrieved > at) return `snapshot retrievedAt ${s.retrievedAt} is after the service instant ${now}`;
  if (s.observedAt) {
    const observed = Date.parse(s.observedAt);
    if (Number.isFinite(observed) && Number.isFinite(retrieved) && observed > retrieved) return `snapshot observedAt ${s.observedAt} is after its retrievedAt ${s.retrievedAt}`;
  }
  return null;
}

function compileSources(ctx: Ctx): CompiledPlanBody["sources"] {
  const out: CompiledPlanBody["sources"] = [];
  const { schema } = ctx;
  const sourceSpec = schema.node("Source")!;
  const snapSpec = schema.node("SourceSnapshot")!;
  const locSpec = schema.node("SourceLocator")!;
  const attemptSpec = schema.node("CaptureAttempt")!;
  for (const decl of ctx.intent.sources) {
    if (ctx.refs.has(decl.ref)) {
      ctx.error("DUPLICATE_REF", `source ref ${decl.ref} declared twice`);
      continue;
    }
    const canon = canonicalizeUri(decl.source.canonicalUri);
    const sourceUid = decl.source.uid ?? sourceUidFor(canon.uri);
    const problems: string[] = [];
    const kindErr = schema.enumCheck("SourceKind", decl.source.sourceKind, "sourceKind");
    if (kindErr) problems.push(kindErr);
    if (schema.nodeForUid(sourceUid)?.name !== "Source") problems.push(`source uid ${sourceUid} does not carry the source token`);
    const existing = ctx.o<{ props?: { canonicalUri?: string; genre?: string } }>(`node:${sourceUid}`);
    if (existing && existing.props?.canonicalUri && existing.props.canonicalUri !== canon.uri) {
      problems.push(`IDENTITY_CONFLICT: Source ${sourceUid} exists with canonicalUri ${existing.props.canonicalUri}; this declares ${canon.uri} (collision quarantined, EX-04)`);
    }
    if (canon.stripped.length) ctx.warn("TRACKING_KEYS_STRIPPED", `${decl.ref}: removed tracking query keys ${canon.stripped.join(", ")} (${canon.version})`);
    const retainedMetadata: Record<string, unknown> = { ...(decl.snapshot?.metadata ?? {}) };
    if (canon.changed) retainedMetadata.declaredCanonicalUri = decl.source.canonicalUri;

    let snapshotUid: string | null = null;
    let snapshotExists = false;
    if (decl.snapshot) {
      const s = decl.snapshot;
      snapshotUid = s.uid ?? `hu:snapshot:${hc({ sourceUid, contentHash: s.contentHash, retrievedAt: canonicalInstant(s.retrievedAt) })}`;
      const snapObs = ctx.o<{ props?: { contentHash?: string } }>(`node:${snapshotUid}`);
      snapshotExists = Boolean(snapObs);
      if (snapObs && snapObs.props?.contentHash && snapObs.props.contentHash !== s.contentHash) problems.push(`IDENTITY_CONFLICT: snapshot ${snapshotUid} exists with contentHash ${snapObs.props.contentHash}`);
      const basisOk = ["RAW_BYTES", "CANONICAL_PROJECTION", "TOOL_RENDITION", "STORED_EXCERPT_TEXT", "SYNTHETIC_FIXTURE"].includes(s.contentHashBasis);
      if (!basisOk) problems.push(`contentHashBasis ${s.contentHashBasis} is not RAW_BYTES | CANONICAL_PROJECTION | TOOL_RENDITION | STORED_EXCERPT_TEXT | SYNTHETIC_FIXTURE (R-35)`);
      if (s.revisionKind) {
        const e = schema.enumCheck("SourceRevisionKind", s.revisionKind, "revisionKind");
        if (e) problems.push(e);
      }
      // Temporal precondition (WR-19): evidence cannot be retrieved after the instant that plans it, and a source cannot
      // be observed after it was retrieved. No clock-skew allowance; an equal instant is accepted.
      const temporal = snapshotTemporalProblem(s, ctx.input.plannedAt);
      if (temporal) ctx.error("BKS_STALE_PRECONDITION", `${decl.ref}: ${temporal}`);
      if (!s.captureMethod) ctx.warn("CAPTURE_METHOD_UNREGISTERED", `${decl.ref}: no captureMethod registry id (FU-06); description retained: ${s.captureMethodDescription ?? "(none)"}`);
      else if (ctx.schema.captureMethods.size && !ctx.schema.captureMethods.has(s.captureMethod.split("/")[0]!)) ctx.warn("CAPTURE_METHOD_UNREGISTERED", `${decl.ref}: capture method ${s.captureMethod} is not in vocabularies/capture-methods.yaml (FU-06)`);
    }
    if (problems.length) {
      for (const p of problems) ctx.error(p.startsWith("IDENTITY_CONFLICT") ? "BKS_IDENTITY_CONFLICT" : "INVALID_SOURCE", `${decl.ref}: ${p}`);
    }
    ctx.refs.set(decl.ref, { uid: sourceUid, nodeType: "Source", kind: "source", creating: existing === null });

    if (existing === null && !ctx.creators.has(sourceUid)) {
      const props = { name: decl.source.title ?? canon.uri, canonicalUri: canon.uri, sourceKind: decl.source.sourceKind, ...(decl.source.genre ? { genre: decl.source.genre } : {}), ...(decl.source.logicalIdentity ? { logicalIdentity: decl.source.logicalIdentity } : {}) };
      createNode(ctx, "sources", sourceSpec, sourceUid, props, `source ${decl.ref}`);
      ctx.invariant("uid-absent", "BKS_IDENTITY_CONFLICT", { uid: sourceUid, label: "Source" });
    } else if (existing && decl.source.genre && existing.props?.genre !== decl.source.genre) {
      ctx.warn("SOURCE_GENRE_DIFFERS", `${decl.ref}: existing Source genre ${existing.props?.genre ?? "(none)"} kept; declared ${decl.source.genre}`);
    }

    if (decl.snapshot && snapshotUid && !snapshotExists && !ctx.creators.has(snapshotUid)) {
      const s = decl.snapshot;
      const props: Record<string, unknown> = {
        name: `${decl.source.title ?? canon.uri} @ ${s.retrievedAt.slice(0, 10)}`,
        retrievedAt: s.retrievedAt,
        ...(s.observedAt ? { observedAt: s.observedAt } : {}),
        ...(s.publishedAt ? { publishedAt: /T/.test(s.publishedAt) ? s.publishedAt : `${s.publishedAt}T00:00:00Z` } : {}),
        contentHash: s.contentHash,
        contentHashBasis: s.contentHashBasis,
        ...(s.canonicalProjectionHash ? { canonicalProjectionHash: s.canonicalProjectionHash } : {}),
        ...(s.captureMethod ? { captureMethod: s.captureMethod } : {}),
        captureCompleteness: s.captureCompleteness,
        ...(s.storageUri ? { storageUri: s.storageUri } : {}),
        ...(s.archiveUri ? { archiveUri: s.archiveUri } : {}),
        ...(s.mimeType ? { mimeType: s.mimeType } : {}),
        ...(s.language ? { language: s.language } : {}),
        ...(s.revisionKind ? { revisionKind: s.revisionKind } : {}),
      };
      let revises = s.revisesSnapshotUid ?? null;
      if (s.revisesSnapshotRef) {
        const other = ctx.intent.sources.find((x) => x.ref === s.revisesSnapshotRef);
        const otherSrc = other ? ctx.refs.get(other.ref) : undefined;
        if (other?.snapshot && otherSrc) revises = other.snapshot.uid ?? `hu:snapshot:${hc({ sourceUid: otherSrc.uid, contentHash: other.snapshot.contentHash, retrievedAt: canonicalInstant(other.snapshot.retrievedAt) })}`;
        else ctx.error("INVALID_SOURCE", `${decl.ref}: revisesSnapshotRef ${s.revisesSnapshotRef} names no earlier declared snapshot`);
      }
      if (revises) props.revisesSnapshotUid = revises;
      createNode(ctx, "sources", snapSpec, snapshotUid, props, `snapshot of ${decl.ref}`, [sourceUid]);
      ctx.stmt({
        group: "sources",
        purpose: `HAS_SNAPSHOT ${decl.ref}`,
        cypher: "MATCH (s:Source {uid: $sourceUid}) MATCH (snap:SourceSnapshot {uid: $snapshotUid}) CREATE (s)-[r:HAS_SNAPSHOT]->(snap) SET r.lastWriterRunId = $runId RETURN s.uid AS uid",
        params: { sourceUid, snapshotUid },
        rows: 1, nodes: 0, rels: 1, uses: [sourceUid, snapshotUid],
      });
      ctx.relEffect({ key: `HAS_SNAPSHOT|${sourceUid}|${snapshotUid}`, type: "HAS_SNAPSHOT", fromUid: sourceUid, toUid: snapshotUid, relationshipUid: null, op: "create", statementId: ctx.statements.at(-1)!.id });
    }

    const attempts: Array<{ ref: string; uid: string }> = [];
    for (const a of decl.captureAttempts) {
      const uid = `hu:capture-attempt:${hc({ toolId: a.toolId, requestDigest: a.requestDigest, attemptedAt: canonicalInstant(a.attemptedAt) })}`;
      attempts.push({ ref: a.ref, uid });
      const errs = [schema.enumCheck("CaptureOutcome", a.outcome, "outcome"), schema.enumCheck("CaptureFailureKind", a.failureKind, "failureKind")].filter(Boolean) as string[];
      if (errs.length) {
        ctx.error("INVALID_CAPTURE_ATTEMPT", `${decl.ref}/${a.ref}: ${errs.join("; ")}`);
        continue;
      }
      if (ctx.o(`node:${uid}`) !== null || ctx.creators.has(uid)) continue;
      const props: Record<string, unknown> = {
        name: `${a.toolId} ${a.outcome} ${a.attemptedAt}`,
        toolId: a.toolId, ...(a.toolVersion ? { toolVersion: a.toolVersion } : {}), outcome: a.outcome, ...(a.failureKind ? { failureKind: a.failureKind } : {}),
        ...(a.httpStatus ? { httpStatus: a.httpStatus } : {}), ...(a.requestUri ? { requestUri: stripSecrets(a.requestUri) } : {}), requestDigest: a.requestDigest,
        subjectUid: sourceUid, ...(snapshotUid && a.outcome === "PARTIAL" ? { snapshotUid } : {}), attemptedAt: a.attemptedAt, ...(a.responseHash ? { responseHash: a.responseHash } : {}),
        ...(a.retryAfterSeconds !== undefined ? { retryAfterSeconds: a.retryAfterSeconds } : {}), ...(a.errorText ? { errorText: a.errorText.slice(0, 2000) } : {}),
      };
      createNode(ctx, "sources", attemptSpec, uid, props, `capture attempt ${decl.ref}/${a.ref}`, [sourceUid]);
    }

    const locators: Array<{ ref: string; uid: string; selectorDigest: string; exists: boolean }> = [];
    for (const loc of decl.locators) {
      const info = compileLocator(ctx, decl.ref, loc, sourceUid, snapshotUid, decl.snapshot?.contentHashBasis ?? "UNKNOWN", problems.length > 0);
      if (!info) continue;
      locators.push({ ref: info.ref, uid: info.uid, selectorDigest: info.selectorDigest, exists: info.exists });
      if (!info.exists && !info.invalid && !ctx.creators.has(info.uid)) {
        const props: Record<string, unknown> = {
          name: `${loc.selectorKind}${loc.page ? ` p.${loc.page}` : ""}`,
          selectorKind: loc.selectorKind,
          selectorDigest: info.selectorDigest,
          selectorJson: canonicalize({ selectorKind: loc.selectorKind, ...loc.selector }),
          ...(loc.exact !== undefined ? { exact: loc.exact } : {}),
          ...(loc.prefix !== undefined ? { prefix: loc.prefix } : {}),
          ...(loc.suffix !== undefined ? { suffix: loc.suffix } : {}),
          ...(loc.quoteHash ? { quoteHash: loc.quoteHash } : {}),
          ...(loc.startOffset !== undefined ? { startOffset: loc.startOffset } : {}),
          ...(loc.endOffset !== undefined ? { endOffset: loc.endOffset } : {}),
          ...(loc.page !== undefined ? { page: loc.page } : {}),
          ...(loc.mediaStartSeconds !== undefined ? { mediaStartSeconds: loc.mediaStartSeconds } : {}),
          ...(loc.mediaEndSeconds !== undefined ? { mediaEndSeconds: loc.mediaEndSeconds } : {}),
          ...(loc.speakerLabelInSource ? { speakerLabelInSource: loc.speakerLabelInSource } : {}),
          ...(loc.reanchorMatch ? { reanchorMatch: loc.reanchorMatch } : {}),
        };
        const reanchor = loc.reanchorsLocatorUid ?? (loc.reanchorsLocatorRef ? ctx.locators.get(loc.reanchorsLocatorRef)?.uid : undefined);
        if (loc.reanchorsLocatorRef && !reanchor) ctx.warn("REANCHOR_REF_UNKNOWN", `${decl.ref}/${loc.ref}: reanchorsLocatorRef ${loc.reanchorsLocatorRef} names no earlier locator`);
        if (reanchor) props.reanchorsLocatorUid = reanchor;
        createNode(ctx, "sources", locSpec, info.uid, props, `locator ${decl.ref}/${loc.ref}`, snapshotUid ? [snapshotUid] : []);
        ctx.stmt({
          group: "sources",
          purpose: `HAS_LOCATOR ${loc.ref}`,
          cypher: "MATCH (snap:SourceSnapshot {uid: $snapshotUid}) MATCH (l:SourceLocator {uid: $uid}) CREATE (snap)-[r:HAS_LOCATOR]->(l) SET r.lastWriterRunId = $runId RETURN l.uid AS uid",
          params: { snapshotUid, uid: info.uid },
          rows: 1, nodes: 0, rels: 1, uses: [snapshotUid!, info.uid],
        });
        ctx.relEffect({ key: `HAS_LOCATOR|${snapshotUid}|${info.uid}`, type: "HAS_LOCATOR", fromUid: snapshotUid!, toUid: info.uid, relationshipUid: null, op: "create", statementId: ctx.statements.at(-1)!.id });
      }
    }
    out.push({ ref: decl.ref, sourceUid, canonicalUri: canon.uri, snapshotUid, locators, captureAttempts: attempts, retainedMetadata: retainedMetadata as Record<string, never> });
  }
  return out;
}

function stripSecrets(uri: string): string {
  try {
    const u = new URL(uri);
    u.username = "";
    u.password = "";
    for (const k of [...u.searchParams.keys()]) if (/key|token|secret|signature|sig|password|auth/i.test(k)) u.searchParams.set(k, "REDACTED");
    return u.toString();
  } catch {
    return uri;
  }
}

function compileLocator(ctx: Ctx, sourceRef: string, loc: CompileInput["intent"]["sources"][number]["locators"][number], sourceUid: string, snapshotUid: string | null, contentHashBasis: string, sourceInvalid: boolean): LocatorInfo | null {
  if (ctx.locators.has(loc.ref) || ctx.refs.has(loc.ref)) {
    ctx.error("DUPLICATE_REF", `locator ref ${loc.ref} declared twice`);
    return null;
  }
  const problems: string[] = [];
  if (!snapshotUid) problems.push("locator needs a snapshot on its source");
  const kindErr = ctx.schema.enumCheck("SelectorKind", loc.selectorKind, "selectorKind");
  if (kindErr) problems.push(kindErr);
  if (typeof loc.selector.basis !== "string" || !loc.selector.basis) problems.push("selector.basis (projection id@version) is mandatory (R-38)");
  let selectorDigest = "sha256:" + "0".repeat(64);
  try {
    selectorDigest = canonicalDigest({ selectorKind: loc.selectorKind, ...loc.selector });
  } catch (e) {
    problems.push(`selector is not canonical JSON: ${(e as Error).message}`);
  }
  if (loc.exact && loc.quoteHash === undefined) {
    // quoteHash is the sha256 of exact after the selector's normalization; it is not recomputed here (normalization lives in the projection).
  }
  const uid = loc.uid ?? `hu:locator:${h(`${snapshotUid}\n${loc.selectorKind}\n${selectorDigest}`)}`;
  if (ctx.schema.nodeForUid(uid)?.name !== "SourceLocator") problems.push(`locator uid ${uid} does not carry the locator token`);
  const existing = ctx.o<{ props?: { selectorDigest?: string } }>(`node:${uid}`);
  if (existing && existing.props?.selectorDigest && existing.props.selectorDigest !== selectorDigest) problems.push(`IDENTITY_CONFLICT: locator ${uid} exists with selectorDigest ${existing.props.selectorDigest}`);
  const info: LocatorInfo = {
    ref: loc.ref,
    uid,
    selectorDigest,
    snapshotUid: snapshotUid ?? "",
    sourceUid,
    contentHashBasis,
    exists: Boolean(existing),
    reportsFields: loc.reportsFields,
    ...(loc.expectedSelectedContentDigest ? { expectedSelectedContentDigest: loc.expectedSelectedContentDigest } : {}),
    ...(problems.length || sourceInvalid ? { invalid: problems.join("; ") || "its source is invalid" } : {}),
  };
  if (problems.length) ctx.warn("LOCATOR_INVALID", `${sourceRef}/${loc.ref}: ${problems.join("; ")}`);
  ctx.locators.set(loc.ref, info);
  ctx.locatorsByUid.set(uid, info);
  return info;
}

// ---------------------------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------------------------

function compileSubjects(ctx: Ctx): void {
  const { schema } = ctx;
  for (const subject of ctx.intent.subjects) {
    if (ctx.subjects.has(subject.ref) || ctx.refs.has(subject.ref)) {
      ctx.error("DUPLICATE_REF", `subject ref ${subject.ref} collides with another subject, source or locator ref`);
      continue;
    }
    const spec = schema.node(subject.nodeType);
    const plan: SubjectPlanV2 = { ref: subject.ref, nodeType: subject.nodeType, disposition: "conflict", uid: null, labels: [], matches: [], reasons: [], rewrites: [] };
    ctx.subjects.set(subject.ref, plan);
    if (!spec) {
      plan.reasons.push(`UNKNOWN_NODE_TYPE: ${subject.nodeType} is not in release ${schema.releaseId}`);
      setRef(ctx, subject.ref, plan);
      continue;
    }
    plan.labels = spec.labels;
    if (subject.mode === "resolved") {
      const routed = schema.nodeForUid(subject.uid);
      if (routed?.name !== spec.name) {
        plan.reasons.push(`TOKEN_LABEL_MISMATCH: uid ${subject.uid} routes to ${routed?.name ?? "no type"}, not ${spec.name}`);
        setRef(ctx, subject.ref, plan);
        continue;
      }
      const n = ctx.o<{ labels: string[] }>(`node:${subject.uid}`);
      if (n === undefined) {
        plan.disposition = "use_existing";
        plan.uid = subject.uid;
      } else if (n === null) {
        plan.disposition = "missing";
        plan.uid = subject.uid;
        plan.reasons.push(`SUBJECT_UNKNOWN: no ${spec.primaryLabel} with uid ${subject.uid}`);
      } else {
        plan.disposition = "use_existing";
        plan.uid = subject.uid;
        plan.matches.push({ uid: subject.uid, basis: "uid" });
      }
      setRef(ctx, subject.ref, plan);
      continue;
    }

    // mode: new
    if (spec.kernelRecord) {
      plan.reasons.push(`KERNEL_RECORD_NOT_A_SUBJECT: ${spec.name} records are written by proposal kinds (sources[], assertion/assessment/report proposals), not declared as subjects`);
      setRef(ctx, subject.ref, plan);
      continue;
    }
    if (spec.projectionOnly) {
      plan.reasons.push(`PROJECTION_ONLY_TYPE: ${spec.name} is written only by a projection Activity (projection.write)`);
      setRef(ctx, subject.ref, plan);
      continue;
    }
    if (!spec.executorOps.has("create")) {
      plan.reasons.push(`TYPE_NOT_CREATABLE: register executor ops for ${spec.name} exclude create (${spec.derivation})`);
      setRef(ctx, subject.ref, plan);
      continue;
    }
    let props: Record<string, unknown> = { ...subject.properties };
    if (spec.name === "Person") {
      const stripped = stripContacts(props);
      props = stripped.props;
      plan.rewrites.push(...stripped.rewrites.map((r) => ({ ...r, from: r.from as never, to: r.to as never })));
    }
    const errors = checkNodeProps(ctx, spec, props, "create");
    let sourceUid: string | null = null;
    if (spec.name === "Source") {
      // A Source declared as a subject (identifiers / assertions about an endpoint) keeps EX-04 identity: canonical URI digest.
      if (typeof props.canonicalUri !== "string") errors.push("REQUIRED_PROPERTY_MISSING: Source.canonicalUri");
      else {
        const canon = canonicalizeUri(props.canonicalUri);
        props.canonicalUri = canon.uri;
        sourceUid = sourceUidFor(canon.uri);
        if (subject.uidSegment) plan.rewrites.push({ field: "uidSegment", from: subject.uidSegment, to: sourceUid, rule: "EX-04 source identity is the canonical URI digest" });
      }
    }
    // Claim identity: propositionHash over the normalized proposition and its structured binding (computed, never trusted).
    if (spec.name === "Claim") {
      const proposition = typeof props.proposition === "string" ? props.proposition.trim().replace(/\s+/g, " ") : null;
      if (!proposition) errors.push("REQUIRED_PROPERTY_MISSING: Claim.proposition");
      if (!props.claimType) errors.push("REQUIRED_PROPERTY_MISSING: Claim.claimType");
      if (proposition) {
        const computed = canonicalDigest({ proposition, claimType: props.claimType ?? null });
        if (props.propositionHash !== undefined && props.propositionHash !== computed) plan.rewrites.push({ field: "propositionHash", from: props.propositionHash as never, to: computed, rule: "claim-proposition-hash/v1" });
        props.proposition = proposition;
        props.propositionHash = computed;
      }
    }
    if (spec.properties.has("payloadHash") && props.payloadHash === undefined) {
      props.payloadHash = canonicalDigest({ nodeType: spec.name, name: subject.name, properties: subject.properties });
      plan.rewrites.push({ field: "payloadHash", from: null, to: props.payloadHash as string, rule: "payload-hash/v1 (author properties)" });
    }
    const filled = new Set([...Object.keys(props), "name"]);
    const missingRequired = [...spec.properties.values()].filter((p) => p.isRequired && !filled.has(p.name) && !["id", "uid", "recordedAt"].includes(p.name)).map((p) => p.name);
    if (missingRequired.length) errors.push(`REQUIRED_PROPERTY_MISSING: ${spec.name}.${missingRequired.join(", ")}`);
    for (const p of Object.keys(props)) {
      const fp = schema.fieldPredicate(spec.name, p);
      if (fp) ctx.warn("FIELD_EVIDENCE_MISSING", `subject ${subject.ref}: ${spec.name}.${p} has FIELD predicate ${fp.name}; state the value with node.upsert fieldEvidence so it gets its own FIELD Assertion (OD-11)`);
    }
    const segment = spec.name === "Claim" && !subject.uidSegment ? h(String(props.propositionHash), 24) : subject.uidSegment ?? slugify(subject.name);
    const candidateUid = sourceUid ?? `hu:${spec.uidToken}:${segment}`;
    // A missing required property only matters when the subject is created: with onMatch use_existing the subject may
    // resolve to an existing node (nothing is written), so the check is deferred until resolution decides. Identity
    // inputs (Source.canonicalUri, Claim proposition) and invalid values always block.
    const deferred = subject.onMatch === "use_existing" ? errors.filter((e) => /^REQUIRED_PROPERTY_MISSING: /.test(e) && !/^REQUIRED_PROPERTY_MISSING: (Source|Claim)\./.test(e)) : [];
    if (errors.length > deferred.length) {
      plan.reasons.push(...errors);
      setRef(ctx, subject.ref, plan);
      continue;
    }

    // Resolution: uid, exact identifiers (scheme, issuer, normalized value), exact name. Names never establish identity alone.
    const strong: SubjectPlanV2["matches"] = [];
    const routedExisting = ctx.o<{ labels: string[] }>(`node:${candidateUid}`);
    if (routedExisting) strong.push({ uid: candidateUid, basis: "uid" });
    const crossLabel = ctx.o<string[]>(`uid:${candidateUid}`);
    if (crossLabel && !routedExisting) {
      plan.reasons.push(`IDENTITY_CONFLICT: uid ${candidateUid} exists under labels ${crossLabel.join(", ")} (cross-label uid conflict)`);
      setRef(ctx, subject.ref, plan);
      continue;
    }
    if (spec.name === "Claim") {
      const byHash = ctx.o<string>(`claimhash:${props.propositionHash}`);
      if (byHash && byHash !== candidateUid) strong.push({ uid: byHash, basis: "identifier", detail: "propositionHash" });
    }
    for (const ident of subject.identifiers) {
      const scheme = schema.schemes.get(ident.scheme);
      if (!scheme) {
        plan.reasons.push(`UNREGISTERED_SCHEME: ${ident.scheme} is not in identifier-schemes`);
        continue;
      }
      const value = schema.normalizeIdentifier(scheme, ident.value);
      const found = ctx.o<{ owners: Array<{ uid: string }> }>(`ident:${ident.scheme}|${ident.issuer}|${value}`);
      for (const owner of found?.owners ?? []) if (!strong.some((m) => m.uid === owner.uid)) strong.push({ uid: owner.uid, basis: "identifier", detail: `${ident.scheme}:${value}` });
    }
    const named = ctx.o<string[]>(`name:${spec.primaryLabel}|${subject.name}`);
    const weak = (named ?? []).filter((u) => !strong.some((m) => m.uid === u)).map((u) => ({ uid: u, basis: "name_exact" as const }));
    plan.matches = [...strong, ...weak];
    const wrongType = strong.filter((m) => schema.nodeForUid(m.uid)?.name !== spec.name);
    if (wrongType.length) {
      plan.reasons.push(`IDENTITY_CONFLICT: identifier owned by ${wrongType.map((m) => m.uid).join(", ")} of another type (one identifier identifies at most one Subjectable, R-42)`);
      setRef(ctx, subject.ref, plan);
      continue;
    }
    const distinctStrong = [...new Set(strong.map((m) => m.uid))];
    if (distinctStrong.length > 1) {
      plan.reasons.push(`AMBIGUOUS_IDENTITY: ${distinctStrong.join(", ")} all match; resolve explicitly (mode resolved)`);
      plan.disposition = "review_required";
      setRef(ctx, subject.ref, plan);
      continue;
    }
    const match = distinctStrong[0] ?? null;
    if (match) {
      switch (subject.onMatch) {
        case "use_existing":
          plan.disposition = "use_existing";
          plan.uid = match;
          plan.reasons.push(`MATCH_ADOPTED: ${strong.find((m) => m.uid === match)!.basis} ${match}`);
          break;
        case "fail":
          plan.disposition = "conflict";
          plan.reasons.push(`MATCH_EXISTS: ${match}`);
          break;
        case "create_anyway":
          if (match === candidateUid) {
            plan.disposition = "conflict";
            plan.reasons.push(`UID_TAKEN: ${candidateUid} exists; give a distinguishing uidSegment`);
          } else {
            plan.disposition = "create";
            plan.uid = candidateUid;
            plan.reasons.push(`MATCH_IGNORED_BY_AUTHOR: ${match}`);
          }
          break;
        default:
          plan.disposition = "review_required";
          plan.reasons.push(`MATCH_REVIEW: ${match}; set onMatch use_existing, create_anyway or fail`);
      }
    } else if (weak.length && subject.onMatch === "review") {
      plan.disposition = "review_required";
      plan.reasons.push(`NAME_MATCH_REVIEW: ${weak.map((w) => w.uid).join(", ")} share the exact name (names never establish identity); set onMatch`);
    } else if (weak.length && subject.onMatch === "use_existing" && weak.length === 1) {
      plan.disposition = "use_existing";
      plan.uid = weak[0]!.uid;
      plan.reasons.push(`MATCH_ADOPTED_BY_NAME: ${weak[0]!.uid} (author choice; names alone never establish identity)`);
    } else {
      plan.disposition = "create";
      plan.uid = candidateUid;
    }
    if (deferred.length) {
      if (plan.disposition === "create") {
        plan.disposition = "conflict";
        plan.uid = null;
        plan.reasons.unshift(...deferred);
      } else if (plan.disposition === "use_existing") {
        plan.reasons.push(`REQUIRED_PROPERTY_DEFERRED: ${deferred.map((e) => e.slice("REQUIRED_PROPERTY_MISSING: ".length)).join("; ")} not needed (resolves to existing ${plan.uid}; nothing is created)`);
      }
    }
    if (plan.disposition === "create") {
      const creator = ctx.creators.get(candidateUid);
      const creatorStmt = creator ? ctx.statements.find((x) => x.id === creator) : undefined;
      if (creator && spec.name === "Source" && creatorStmt?.group === "sources") {
        // A Source subject that mints the same uid as a declared sources[] entry IS that source (one identity, one
        // create): the subject reuses the declared node instead of colliding with it.
        plan.disposition = "use_existing";
        plan.uid = candidateUid;
        plan.reasons.push(`SOURCE_DECLARED: ${candidateUid} is the source declared in sources[] of this intent`);
      } else if (ctx.creators.has(candidateUid)) {
        plan.disposition = "conflict";
        plan.uid = null;
        plan.reasons.push(`DUPLICATE_WITHIN_INTENT: ${candidateUid} is created by another subject of this intent`);
      } else {
        createNode(ctx, "subjects", spec, candidateUid, { ...props, name: subject.name }, `create subject ${subject.ref} (${spec.name})`);
        ctx.invariant("uid-absent", "BKS_IDENTITY_CONFLICT", { uid: candidateUid, label: spec.primaryLabel });
      }
    }
    setRef(ctx, subject.ref, plan, props);
  }
}

function setRef(ctx: Ctx, ref: string, plan: SubjectPlanV2, props?: Record<string, unknown>): void {
  const usable = (plan.disposition === "create" || plan.disposition === "use_existing") && plan.uid;
  ctx.refs.set(ref, {
    uid: plan.uid ?? "",
    nodeType: plan.nodeType,
    kind: "subject",
    creating: plan.disposition === "create",
    ...(usable ? {} : { unusable: `SUBJECT_${plan.disposition.toUpperCase()}: ${ref} (${plan.reasons[0] ?? ""})` }),
    ...(props ? { newProps: props } : {}),
  });
}

/** CREATE of a node with lineage (P9: WAS_GENERATED_BY the run's Activity) and lastWriterRunId (P1). */
export function createNode(ctx: Ctx, group: "sources" | "subjects" | "proposal", spec: NodeSpec, uid: string, props: Record<string, unknown>, purpose: string, extraUses: string[] = []): string {
  const { privacyClass: authorPrivacy, ...rest } = props;
  const pp = propertyParams(spec, rest, "n", "p");
  const id = ctx.stmt({
    group,
    purpose,
    cypher: `MATCH (act:Activity {uid: $activityUid})
CREATE (n:${labelsOf(spec)} {uid: $uid})
SET n += $pProps, n.id = $id, n.privacyClass = $privacyClass, n.lastWriterRunId = $runId, n.createdAt = ${TX_NOW}, n.updatedAt = ${TX_NOW}${pp.clause}
CREATE (n)-[:WAS_GENERATED_BY]->(act)
RETURN n.uid AS uid`,
    params: { uid, id: uid.slice(uid.indexOf(":", 3) + 1), pProps: pp.plain, pDt: pp.dt, pD: pp.d, privacyClass: spec.defaultPrivacy === "INTERNAL" ? "INTERNAL" : typeof authorPrivacy === "string" ? authorPrivacy : (spec.defaultPrivacy ?? ctx.privacyClass), activityUid: ctx.activityUid },
    rows: 1,
    nodes: 1,
    rels: 1,
    uses: [ctx.activityUid, ...extraUses],
    creates: [uid],
  });
  ctx.nodeEffect({ uid, label: spec.primaryLabel, op: "create", statementId: id, properties: Object.keys(props).sort() });
  return id;
}

/** SET on an existing node with lineage MERGE (P9 for updates). */
export function updateNode(ctx: Ctx, spec: NodeSpec, uid: string, props: Record<string, unknown>, purpose: string): string {
  const pp = propertyParams(spec, props, "n", "p");
  const lineage = ctx.creators.has(uid) ? null : ctx.o(`edge:WAS_GENERATED_BY|${uid}|${ctx.activityUid}`);
  const needLineage = lineage === null && !ctx.creators.has(uid);
  const id = ctx.stmt({
    group: "proposal",
    purpose,
    cypher: `MATCH (n:${q(spec.primaryLabel)} {uid: $uid}) MATCH (act:Activity {uid: $activityUid})
SET n += $pProps, n.lastWriterRunId = $runId, n.updatedAt = ${TX_NOW}${pp.clause}
${needLineage ? "CREATE (n)-[:WAS_GENERATED_BY]->(act)\n" : ""}RETURN n.uid AS uid`,
    params: { uid, pProps: pp.plain, pDt: pp.dt, pD: pp.d, activityUid: ctx.activityUid },
    rows: 1,
    nodes: 0,
    rels: needLineage ? 1 : 0,
    uses: [uid, ctx.activityUid],
  });
  ctx.nodeEffect({ uid, label: spec.primaryLabel, op: "update", statementId: id, properties: Object.keys(props).sort() });
  return id;
}

// ---------------------------------------------------------------------------------------------
// Proposal dispatch and shared helpers
// ---------------------------------------------------------------------------------------------

function compileOne(ctx: Ctx, p: ProposalV2): void {
  ctx.current = { proposalId: p.proposalId, ids: [] };
  const plan: ProposalPlanV2 = { proposalId: p.proposalId, kind: p.kind, disposition: "admitted", reasons: [], warnings: [], rewrites: [], mints: {}, dependsOn: [...p.dependsOn], statementIds: [] };
  ctx.proposals.set(p.proposalId, plan);
  const before = { statements: ctx.statements.length, nodes: ctx.nodeEffects.length, rels: ctx.relEffects.length, invariants: ctx.invariants.length, creators: new Map(ctx.creators), closed: new Set(ctx.closedEpisodes), superseded: new Set(ctx.superseded), opened: ctx.openedEpisodes.length, idents: new Map(ctx.identOwners) };
  try {
    if (p.hold) hold(plan, `HELD_BY_AUTHOR: ${p.hold.reason}`);
    for (const dep of p.dependsOn) {
      const d = ctx.proposals.get(dep);
      if (!d) reject(plan, `DEPENDS_ON_UNKNOWN: ${dep} must be an earlier proposal`);
      if (d.disposition === "held") hold(plan, `DEPENDS_ON_HELD: ${dep}`);
      if (d.disposition === "rejected") reject(plan, `DEPENDS_ON_REJECTED: ${dep}`);
    }
    compileProposal(ctx, p, plan);
  } catch (e) {
    if (!(e instanceof ProposalStop)) throw e;
  }
  if (plan.disposition !== "admitted") {
    // Roll back everything the proposal emitted (a held or rejected proposal writes nothing).
    ctx.statements.splice(before.statements);
    ctx.nodeEffects.splice(before.nodes);
    ctx.relEffects.splice(before.rels);
    ctx.invariants.splice(before.invariants);
    ctx.creators.clear();
    for (const [k, v] of before.creators) ctx.creators.set(k, v);
    ctx.closedEpisodes.clear();
    for (const v of before.closed) ctx.closedEpisodes.add(v);
    ctx.superseded.clear();
    for (const v of before.superseded) ctx.superseded.add(v);
    ctx.openedEpisodes.splice(before.opened);
    ctx.identOwners.clear();
    for (const [k, v] of before.idents) ctx.identOwners.set(k, v);
    if (plan.disposition !== "noop_duplicate") plan.mints = {};
    plan.statementIds = [];
  } else {
    plan.statementIds = [...ctx.current.ids];
    if (!plan.statementIds.length && plan.disposition === "admitted") plan.disposition = "noop_duplicate";
  }
  ctx.current = null;
}

export class ProposalStop extends Error {}

export function reject(plan: ProposalPlanV2, reason: string): never {
  plan.disposition = "rejected";
  plan.reasons.push(reason);
  throw new ProposalStop(reason);
}

export function hold(plan: ProposalPlanV2, reason: string): never {
  plan.disposition = "held";
  plan.reasons.push(reason);
  throw new ProposalStop(reason);
}

export function noop(plan: ProposalPlanV2, reason: string, mints: Record<string, string> = {}): never {
  plan.disposition = "noop_duplicate";
  plan.reasons.push(reason);
  plan.mints = { ...plan.mints, ...mints };
  throw new ProposalStop(reason);
}

/** Resolves a subject / source / proposal ref to a usable target or stops the proposal. */
export function target(ctx: Ctx, plan: ProposalPlanV2, ref: string, role: string): RefTarget {
  const t = ctx.refs.get(ref);
  if (!t) {
    const p = ctx.proposals.get(ref);
    if (p && p.proposalId !== plan.proposalId) {
      if (p.disposition === "held") hold(plan, `DEPENDS_ON_HELD: ${role} ${ref}`);
      if (p.disposition === "rejected") reject(plan, `DEPENDS_ON_REJECTED: ${role} ${ref}`);
      const uid = p.mints.assertion ?? p.mints.assessment ?? p.mints.report ?? p.mints.association;
      if (!uid) reject(plan, `REF_NOT_A_RECORD: proposal ${ref} mints no record usable as ${role}`);
      if (!plan.dependsOn.includes(ref)) plan.dependsOn.push(ref);
      const spec = ctx.schema.nodeForUid(uid);
      return { uid, nodeType: spec?.name ?? "Assertion", kind: "proposal", creating: ctx.creators.has(uid) };
    }
    reject(plan, `UNKNOWN_REF: ${role} ${ref}`);
  }
  if (t.unusable) {
    // Review-required subjects and resolved subjects absent from the graph (created by another intent that has not
    // applied yet) hold the proposal: the gap is a dependency or an author decision, not an invalid proposal.
    if (/^SUBJECT_(REVIEW_REQUIRED|MISSING)/.test(t.unusable)) hold(plan, t.unusable);
    reject(plan, t.unusable);
  }
  return t;
}

export interface EvidenceRow {
  uid: string;
  role: string;
  esc: string | null;
  selectorDigest: string;
}

/** Resolves evidence selectors to locator uids with roles; existing locators must match their selectorDigest. */
export function resolveEvidence(ctx: Ctx, plan: ProposalPlanV2, list: EvidenceSelector[], requireSupport: boolean): EvidenceRow[] {
  const rows: EvidenceRow[] = [];
  for (const e of list) {
    const targetSel = typeof e === "object" && "locator" in e ? e.locator : e;
    const role = typeof e === "object" && "locator" in e ? e.role : "SUPPORTS";
    if (typeof targetSel === "string") {
      const info = ctx.locators.get(targetSel);
      if (!info) reject(plan, `EVIDENCE_REF_UNKNOWN: ${targetSel} is not a declared locator ref`);
      if (info.invalid) reject(plan, `BKS_EVIDENCE_UNVERIFIED: locator ${targetSel} is invalid (${info.invalid})`);
      rows.push({ uid: info.uid, role, esc: info.expectedSelectedContentDigest ?? null, selectorDigest: info.selectorDigest });
    } else {
      const obs = ctx.o<{ selectorDigest: string }>(`locator:${targetSel.uid}`);
      if (obs === undefined) {
        rows.push({ uid: targetSel.uid, role, esc: null, selectorDigest: targetSel.selectorDigest });
        continue;
      }
      if (obs === null) reject(plan, `BKS_EVIDENCE_UNVERIFIED: locator ${targetSel.uid} does not exist`);
      if (obs.selectorDigest !== targetSel.selectorDigest) reject(plan, `BKS_EVIDENCE_UNVERIFIED: locator ${targetSel.uid} has selectorDigest ${obs.selectorDigest}, the intent cites ${targetSel.selectorDigest}`);
      rows.push({ uid: targetSel.uid, role, esc: null, selectorDigest: obs.selectorDigest });
    }
  }
  const seen = new Set<string>();
  const unique = rows.filter((r) => (seen.has(`${r.uid}|${r.role}`) ? false : (seen.add(`${r.uid}|${r.role}`), true)));
  if (requireSupport && !unique.some((r) => r.role === "SUPPORTS")) reject(plan, "EVIDENCE_REQUIRED: an Assertion needs at least one located span with role SUPPORTS");
  return unique.sort((a, b) => (a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : a.role < b.role ? -1 : 1));
}

/** Asserter (P20, R-15/R-16): Person, Organization, Agent, Publication, MediaWork, Channel(ACCOUNT); default executor Agent with a recorded qualifier. */
export function resolveAsserter(ctx: Ctx, plan: ProposalPlanV2, asserterRef: string | undefined): { uid: string; nodeType: string; defaulted: boolean } {
  if (!asserterRef) {
    plan.warnings.push("ASSERTER_DEFAULTED: no asserterRef; the executor Agent is the asserter with qualifier asserterBasis:EXECUTOR_DEFAULT (R-16: reserve for BellLabs statements)");
    return { uid: ctx.input.agentUid, nodeType: "Agent", defaulted: true };
  }
  const t = target(ctx, plan, asserterRef, "asserter");
  if (!ASSERTER_TYPES.has(t.nodeType)) reject(plan, `ASSERTER_TYPE_INVALID: ${t.nodeType} cannot assert (Person, Organization, Agent, Publication, MediaWork, Channel ACCOUNT; P20)`);
  if (t.nodeType === "Channel") {
    const kind = t.newProps?.channelKind ?? ctx.o<{ props?: { channelKind?: string } }>(`node:${t.uid}`)?.props?.channelKind;
    if (kind !== undefined && kind !== "ACCOUNT") reject(plan, `ASSERTER_TYPE_INVALID: Channel ${t.uid} has channelKind ${String(kind)}; only ACCOUNT channels assert (P20)`);
  }
  return { uid: t.uid, nodeType: t.nodeType, defaulted: false };
}

export interface NormalizedValidity {
  validFrom: string | null;
  validTo: string | null;
  validFromPrecision: string | null;
  validToPrecision: string | null;
  validFromBasis: string;
  validToBasis: string;
  validObservedAt: string | null;
  validObservedAtPrecision: string | null;
}

/** Valid-time normalization: UTC instants, OBSERVATION_ONLY/UNKNOWN force null bounds (moved to validObservedAt), half-open order. */
export function normalizeValidity(ctx: Ctx, plan: ProposalPlanV2, v: ValidityV2): NormalizedValidity {
  const errs: string[] = [];
  const en = (e: string, val: string | undefined, f: string) => {
    const r = ctx.schema.enumCheck(e, val, f);
    if (r) errs.push(r);
  };
  en("TimePrecision", v.validFromPrecision, "validFromPrecision");
  en("TimePrecision", v.validToPrecision, "validToPrecision");
  en("TimePrecision", v.validObservedAtPrecision, "validObservedAtPrecision");
  en("ValidTimeBasis", v.validFromBasis, "validFromBasis");
  en("ValidTimeBasis", v.validToBasis, "validToBasis");
  if (errs.length) reject(plan, `INVALID_VALIDITY: ${errs.join("; ")}`);
  let validFrom = v.validFrom ? canonicalInstant(v.validFrom) : null;
  let validTo = v.validTo ? canonicalInstant(v.validTo) : null;
  let validObservedAt = v.validObservedAt ? canonicalInstant(v.validObservedAt) : null;
  const fromBasis = v.validFromBasis ?? (validFrom ? "STATED_BY_SOURCE" : "UNKNOWN");
  const toBasis = v.validToBasis ?? (validTo ? "STATED_BY_SOURCE" : "UNKNOWN");
  if (validFrom && (fromBasis === "OBSERVATION_ONLY" || fromBasis === "UNKNOWN")) {
    plan.rewrites.push({ field: "validity.validFrom", from: validFrom, to: null, rule: `basis ${fromBasis} forces a null bound; value kept as validObservedAt` });
    if (!validObservedAt) validObservedAt = validFrom;
    validFrom = null;
  }
  if (validTo && (toBasis === "OBSERVATION_ONLY" || toBasis === "UNKNOWN")) {
    plan.rewrites.push({ field: "validity.validTo", from: validTo, to: null, rule: `basis ${toBasis} forces a null bound` });
    validTo = null;
  }
  if (validFrom && validTo && Date.parse(validFrom) >= Date.parse(validTo)) reject(plan, "INVALID_VALIDITY: validFrom must be before validTo (half-open interval)");
  return {
    validFrom,
    validTo,
    validFromPrecision: validFrom ? v.validFromPrecision ?? "DAY" : null,
    validToPrecision: validTo ? v.validToPrecision ?? "DAY" : null,
    validFromBasis: fromBasis,
    validToBasis: toBasis,
    validObservedAt,
    validObservedAtPrecision: validObservedAt ? v.validObservedAtPrecision ?? "DAY" : null,
  };
}

/** Adds proposal dependencies implied by statement needs (a proposal using a uid another proposal creates). */
function addImplicitDependencies(ctx: Ctx): void {
  const stmtProposal = new Map(ctx.statements.map((s) => [s.id, s.proposalId]));
  for (const s of ctx.statements) {
    if (!s.proposalId) continue;
    for (const uid of s.needs) {
      const creator = ctx.creators.get(uid);
      const owner = creator ? stmtProposal.get(creator) : undefined;
      if (owner && owner !== s.proposalId) {
        const plan = ctx.proposals.get(s.proposalId)!;
        if (!plan.dependsOn.includes(owner)) plan.dependsOn.push(owner);
      }
    }
  }
  for (const p of ctx.proposals.values()) p.dependsOn.sort();
}

export { digestOfSorted, hc, h };
