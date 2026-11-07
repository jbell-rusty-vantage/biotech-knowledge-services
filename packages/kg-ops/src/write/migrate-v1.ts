import { INTENT_V2, type IngestionIntentV2Input } from "@bks/contracts";
import type { WriteSchema } from "./release-model.js";

/**
 * FU-03 versioned fixture round: mechanical migration of a biotech-knowledge-intent.v1 into v2.
 *
 * Rules (each application is recorded as a provenance edit, so nothing changes silently):
 *  - pins: the executor's release digest and policy version; v1 `schemaDigest` recorded.
 *  - context.activityKind EXTRACTION -> INGESTION (kernel ActivityKind has no EXTRACTION).
 *  - onStale / preconditions / inputSnapshot removed: basis becomes `creationOnly` (a v1 read snapshot is not custody
 *    verifiable); preconditions expecting absence/presence become expectAbsent / expectPresent.
 *  - defaults.maturity / defaults.schemaVersion dropped.
 *  - snapshot: free-text captureMethod -> captureMethodDescription (FU-06; no registry id is guessed); known capture
 *    fields typed; other capture metadata retained (never written to the graph).
 *  - locators: selectorJson parsed when present; otherwise a verification.v1 selector is built from the v1 fields with
 *    basis `raw-capture/v1` only when the snapshot hashes RAW_BYTES (else the basis stays missing and the planner refuses it).
 *  - state.attach -> edge.assert (exclusive slots now come from the relationship register).
 *  - edge.assert with a relationship type that is not a release relationship type -> assertion.relate (R-40).
 *  - edge.assert with a structural type -> edge.structural (its locator refs are recorded, not linked).
 *  - assertion.literal quantityBasis / massBasis / amountReferent -> qualifiers basis: / massBasis: / referent:;
 *    segmentKind -> qualifier segment:<KIND> (P21); jurisdiction -> qualifier jurisdiction:; statedAsOf -> validObservedAt.
 *  - an assertion.literal whose valueString is a uid and whose rationale says the object travels in valueString -> assertion.relate.
 *  - rationale hints with a machine-readable form are mapped: `claim occurrence (assertionKind CLAIM) of hu:claim:..`,
 *    `claimType X`, `DERIVED_FROM hu:assertion:..`, `supersedes hu:assertion:..`, `assertionKind X`, `asserter <ref>`,
 *    `qualifiers: k: v; ...` and `k:'v'` lists (free text under `<k>Verbatim`).
 *  - any rationale segment that marks a v1 gap ("not expressible", "intent v1 gap", ...) and is not mapped above holds
 *    the proposal (R-22 hold flag) with the segment as the reason.
 *  - notes sentences listing v1-inexpressible records are recorded (those records live in assertions.yaml, not here).
 */

export interface MigrationEdit {
  at: string;
  rule: string;
  from?: unknown;
  to?: unknown;
  note?: string;
}

export interface MigrationResult {
  intent: IngestionIntentV2Input;
  edits: MigrationEdit[];
  /** v1 semantics the migrator could not carry (each produced a hold or is recorded in notes). */
  gaps: Array<{ at: string; text: string; handling: "held" | "recorded" }>;
  mappedHints: number;
}

const GAP_MARK = /not expressible|intent v1 gap|intent v1 has no|no AssertionCore field|no proposal kind|carries no asserterRef|v1 cannot|v1 has no/i;
type J = Record<string, unknown>;

function isDigest(v: unknown): v is string {
  return typeof v === "string" && /^sha256:[0-9a-f]{64}$/.test(v);
}

function lowerCamel(k: string): string {
  const s = k.trim().replace(/[^A-Za-z0-9]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ""));
  return s.charAt(0).toLowerCase() + s.slice(1);
}

let grammar: WriteSchema["qualifierGrammar"] | null = null;

/**
 * Maps a v1 "key: value" hint to a qualifier. With a release qualifier registry: the registered `key:` or `key=` prefix
 * whose grammar accepts the value, else the registered `keyVerbatim:` text prefix; otherwise the entry is kept as
 * `keyVerbatim:` (unregistered, so the planner refuses it with QUALIFIER_UNREGISTERED: explicit, never dropped).
 */
function qualifierFrom(key: string, value: string): string | null {
  const k = lowerCamel(key);
  if (!/^[a-z][A-Za-z0-9]*$/.test(k)) return null;
  const v = value.trim().replace(/^'(.*)'$/, "$1").replace(/^"(.*)"$/, "$1").trim().replace(/\s+/g, " ").slice(0, 380);
  if (!v) return null;
  if (grammar?.registry) {
    for (const prefix of [`${k}:`, `${k}=`]) if (grammar.registered(prefix) && grammar.check(prefix + v).length === 0) return prefix + v;
    const verbatim = `${k.endsWith("Verbatim") ? k : `${k}Verbatim`}:`;
    if (grammar.registered(verbatim)) return verbatim + v;
    return /^\S+$/.test(v) ? `${k}:${v}` : verbatim + v;
  }
  if (/^\S+$/.test(v)) return `${k}:${v}`;
  return `${k.endsWith("Verbatim") ? k : `${k}Verbatim`}:${v}`;
}

/** Parses `qualifiers: k: v; k2: v2` and `k:'v'; k2:'v2'` lists from one rationale segment. */
function parseQualifierList(segment: string): string[] {
  const out: string[] = [];
  const body = segment.replace(/^.*?qualifiers[^:]*:\s*/i, "");
  const quoted = [...body.matchAll(/([A-Za-z][A-Za-z0-9 ]{0,40}?)\s*[:=]\s*'([^']*)'/g)];
  if (quoted.length) {
    for (const m of quoted) {
      const q = qualifierFrom(m[1]!, m[2]!);
      if (q) out.push(q);
    }
    return out;
  }
  for (const part of body.split(";")) {
    const i = part.indexOf(":");
    if (i <= 0) continue;
    const q = qualifierFrom(part.slice(0, i), part.slice(i + 1));
    if (q) out.push(q);
  }
  return out;
}

export function migrateIntentV1(v1: J, schema: WriteSchema, provenance: { path?: string; rawBytesDigest: string }): MigrationResult {
  grammar = schema.qualifierGrammar;
  const edits: MigrationEdit[] = [];
  const gaps: MigrationResult["gaps"] = [];
  let mappedHints = 0;
  const edit = (at: string, rule: string, from?: unknown, to?: unknown, note?: string) => edits.push({ at, rule, ...(from !== undefined ? { from } : {}), ...(to !== undefined ? { to } : {}), ...(note ? { note } : {}) });

  const ctx = (v1.context ?? {}) as J;
  const run = (ctx.run ?? {}) as J;
  let activityKind = String(ctx.activityKind ?? "INGESTION");
  if (activityKind === "EXTRACTION") {
    edit("context.activityKind", "P3-kernel-activity-kind", "EXTRACTION", "INGESTION");
    activityKind = "INGESTION";
  }
  if (v1.schemaDigest) edit("schemaDigest", "pins", v1.schemaDigest, schema.schemaReleaseDigest, "v2 pins the release digest");
  if (v1.onStale !== undefined) edit("onStale", "strict-stale", v1.onStale, null, "production onStale removed; stale state is a new plan");
  const expectAbsent: string[] = [];
  const expectPresent: string[] = [];
  for (const [i, p] of ((v1.preconditions as J[] | undefined) ?? []).entries()) {
    if (p.expectedUpdatedAt === null) expectAbsent.push(String(p.uid));
    else expectPresent.push(String(p.uid));
    edit(`preconditions[${i}]`, "basis-creation-only", p, p.expectedUpdatedAt === null ? "expectAbsent" : "expectPresent", "updatedAt equality replaced by the writer-fence revision check");
  }
  if (v1.inputSnapshot) edit("inputSnapshot", "basis-creation-only", v1.inputSnapshot, null, "a v1 read snapshot is not custody verifiable");
  const defaults = (v1.defaults ?? {}) as J;
  if (defaults.maturity !== undefined || defaults.schemaVersion !== undefined) edit("defaults", "v2-defaults", { maturity: defaults.maturity, schemaVersion: defaults.schemaVersion }, null);

  // ---- sources
  const sources = ((v1.sources as J[] | undefined) ?? []).map((s, si) => {
    const src = (s.source ?? {}) as J;
    const sprops = { ...((src.properties ?? {}) as J) };
    const genre = sprops.genre as string | undefined;
    delete sprops.genre;
    const logicalIdentity = sprops.logicalIdentity as string | undefined;
    delete sprops.logicalIdentity;
    if (Object.keys(sprops).length) edit(`sources[${si}].source.properties`, "not-a-source-field", sprops, null);
    const snap = s.snapshot as J | undefined;
    let snapshot: J | undefined;
    if (snap) {
      const props = { ...((snap.properties ?? {}) as J) };
      const take = (k: string) => {
        const v = props[k];
        delete props[k];
        return v;
      };
      const captureMethod = take("captureMethod");
      const typed: J = {};
      for (const k of ["mimeType", "archiveUri", "revisionKind", "revisesSnapshotUid", "language", "storageUri"]) {
        const v = take(k);
        if (v !== undefined && v !== null) typed[k] = v;
      }
      const publishedAt = take("publishedAt");
      const cph = take("canonicalProjectionHash");
      const revisesRef = take("revisesSnapshotRef");
      const retrievedAt = snap.retrievedAt ?? snap.observedAt;
      if (!snap.retrievedAt) edit(`sources[${si}].snapshot.retrievedAt`, "retrievedAt-required", null, retrievedAt);
      snapshot = {
        ...(snap.uid ? { uid: snap.uid } : {}),
        retrievedAt,
        ...(snap.observedAt ? { observedAt: snap.observedAt } : {}),
        ...(typeof publishedAt === "string" ? { publishedAt } : {}),
        contentHash: snap.contentHash,
        contentHashBasis: snap.contentHashBasis ?? "SYNTHETIC_FIXTURE",
        ...(isDigest(cph) ? { canonicalProjectionHash: cph } : {}),
        ...(captureMethod ? { captureMethodDescription: String(captureMethod).slice(0, 400) } : {}),
        captureCompleteness: ["COMPLETE", "PARTIAL_EXCERPT", "UNKNOWN"].includes(String(snap.captureCompleteness)) ? snap.captureCompleteness : "UNKNOWN",
        ...typed,
        ...(typeof revisesRef === "string" ? { revisesSnapshotRef: revisesRef } : {}),
        metadata: props,
      };
      if (captureMethod) edit(`sources[${si}].snapshot.captureMethod`, "FU-06", captureMethod, null, "free text kept as captureMethodDescription; no registry id guessed");
      if (Object.keys(props).length) edit(`sources[${si}].snapshot.metadata`, "retained-not-written", Object.keys(props).sort());
      if (snap.captureCompleteness && !["COMPLETE", "PARTIAL_EXCERPT", "UNKNOWN"].includes(String(snap.captureCompleteness))) edit(`sources[${si}].snapshot.captureCompleteness`, "v2-capture-completeness", snap.captureCompleteness, "UNKNOWN");
    }
    const rawBasis = String(snapshot?.contentHashBasis ?? "");
    const locators = ((s.locators as J[] | undefined) ?? []).map((l, li) => {
      const at = `sources[${si}].locators[${li}]`;
      const props = { ...((l.properties ?? {}) as J) };
      const take = (k: string) => {
        const v = props[k];
        delete props[k];
        return v;
      };
      const selectorJsonText = take("selectorJson");
      const declaredDigest = take("selectorDigest");
      const quoteHash = take("quoteHash");
      const speaker = take("speakerLabelInSource");
      const reanchorRef = take("reanchorsLocatorRef");
      const esc = take("expectedSelectedContentDigest");
      const reportsField = take("reportsField");
      let selector: J | null = null;
      if (typeof selectorJsonText === "string") {
        try {
          selector = JSON.parse(selectorJsonText) as J;
        } catch {
          edit(`${at}.selectorJson`, "selector-unparseable", selectorJsonText.slice(0, 80), null);
        }
      }
      if (!selector) {
        const kind = String(l.selectorKind);
        const w3c: Record<string, string> = { TEXT_QUOTE: "TextQuoteSelector", CHARACTER_POSITION: "TextPositionSelector", JSON_POINTER: "JsonPointerSelector", HTML: "CssSelector", TABLE: "TableSelector", PDF_TEXT: "TextQuoteSelector", MEDIA_TIMECODE: "FragmentSelector", WHOLE_SNAPSHOT: "WholeSnapshot", API_RECORD: "ApiRecordSelector" };
        selector = {
          type: w3c[kind] ?? kind,
          ...(l.quote !== undefined ? { exact: l.quote } : {}),
          ...(l.quotePrefix !== undefined ? { prefix: l.quotePrefix } : {}),
          ...(l.quoteSuffix !== undefined ? { suffix: l.quoteSuffix } : {}),
          ...(l.startOffset !== undefined ? { refinedBy: { type: "TextPositionSelector", start: l.startOffset, end: l.endOffset } } : {}),
          ...(l.section !== undefined ? { section: l.section } : {}),
          ...(l.page !== undefined ? { page: l.page } : {}),
          ...(l.mediaStartSeconds !== undefined ? { mediaStart: l.mediaStartSeconds, mediaEnd: l.mediaEndSeconds ?? null } : {}),
          ...props,
        };
        for (const k of Object.keys(props)) delete props[k];
        if (rawBasis === "RAW_BYTES") {
          selector.basis = "raw-capture/v1";
          edit(`${at}.selector`, "FU-03-selector-basis", null, "raw-capture/v1", `built from v1 fields over the RAW_BYTES capture${selector.offsetBasis ? ` (offsetBasis ${String(selector.offsetBasis)})` : ""}`);
        } else edit(`${at}.selector`, "FU-03-selector-built-no-basis", null, null, `snapshot basis ${rawBasis || "none"}: no projection basis can be stated mechanically (R-38); the planner refuses this locator`);
      }
      if (declaredDigest) edit(`${at}.selectorDigest`, "P11-selector-digest", declaredDigest, "recomputed", "v2 digests the canonical (bks-canonical-json.v2) selector");
      if (Object.keys(props).length) edit(`${at}.properties`, "retained-in-selector", Object.keys(props).sort());
      for (const [k, v] of Object.entries(props)) if (selector[k] === undefined) selector[k] = v as never;
      return {
        ref: l.ref,
        ...(l.uid ? { uid: l.uid } : {}),
        selectorKind: l.selectorKind,
        selector,
        ...(l.quote !== undefined ? { exact: l.quote } : {}),
        ...(l.quotePrefix !== undefined ? { prefix: l.quotePrefix } : {}),
        ...(l.quoteSuffix !== undefined ? { suffix: l.quoteSuffix } : {}),
        ...(isDigest(quoteHash) ? { quoteHash } : {}),
        ...(l.startOffset !== undefined ? { startOffset: l.startOffset } : {}),
        ...(l.endOffset !== undefined ? { endOffset: l.endOffset } : {}),
        ...(typeof l.page === "number" && l.page > 0 ? { page: l.page } : {}),
        ...(l.mediaStartSeconds !== undefined ? { mediaStartSeconds: l.mediaStartSeconds } : {}),
        ...(l.mediaEndSeconds !== undefined ? { mediaEndSeconds: l.mediaEndSeconds } : {}),
        ...(typeof speaker === "string" ? { speakerLabelInSource: speaker } : {}),
        ...(typeof reanchorRef === "string" ? { reanchorsLocatorRef: reanchorRef } : {}),
        ...(isDigest(esc) ? { expectedSelectedContentDigest: esc } : {}),
        ...(typeof reportsField === "string" ? { reportsFields: [reportsField] } : Array.isArray(reportsField) ? { reportsFields: reportsField.map(String) } : {}),
      };
    });
    return {
      ref: s.ref,
      source: { ...(src.uid ? { uid: src.uid } : {}), canonicalUri: src.canonicalUri, ...(src.title ? { title: src.title } : {}), sourceKind: src.sourceKind, ...(genre ? { genre } : {}), ...(logicalIdentity ? { logicalIdentity } : {}) },
      ...(snapshot ? { snapshot } : {}),
      locators,
    };
  });

  const locatorRefByUid = new Map<string, string>();
  for (const s of sources) for (const l of s.locators) if (l.uid) locatorRefByUid.set(String(l.uid), String(l.ref));
  const subjectRefs = new Set<string>();

  // ---- subjects
  const subjects = ((v1.subjects as J[] | undefined) ?? []).map((s, i) => {
    subjectRefs.add(String(s.ref));
    if (s.mode === "resolved") return { ref: s.ref, mode: "resolved", uid: s.uid, nodeType: s.nodeType };
    const identifiers = ((s.identifiers as J[] | undefined) ?? []).map((x, xi) => {
      if (x.normalizationRule) edit(`subjects[${i}].identifiers[${xi}].normalizationRule`, "scheme-register-normalization", x.normalizationRule, null);
      return { scheme: String(x.scheme).toUpperCase(), issuer: x.issuer, value: x.value };
    });
    return { ref: s.ref, mode: "new", nodeType: s.nodeType, name: s.name, ...(s.uidSegment ? { uidSegment: s.uidSegment } : {}), properties: s.properties ?? {}, identifiers, onMatch: s.onMatch ?? "review" };
  });
  const extraSubjects: J[] = [];
  const ensureUidSubject = (uid: string): string | null => {
    const spec = schema.nodeForUid(uid);
    if (!spec) return null;
    const ref = `u-${uid.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`.slice(0, 64).replace(/-+$/, "");
    if (!subjectRefs.has(ref)) {
      subjectRefs.add(ref);
      extraSubjects.push({ ref, mode: "resolved", uid, nodeType: spec.name });
    }
    return ref;
  };

  const evidenceOf = (list: unknown, at: string): unknown[] => {
    const out: unknown[] = [];
    for (const e of (list as unknown[] | undefined) ?? []) {
      if (typeof e !== "string") continue;
      if (!e.startsWith("hu:")) out.push(e);
      else if (locatorRefByUid.has(e)) out.push(locatorRefByUid.get(e));
      else {
        edit(at, "evidence-by-digest", e, null, "an existing locator is cited by uid + selectorDigest in v2; the v1 bare uid has no digest");
        gaps.push({ at, text: `evidence ${e} (existing locator without selectorDigest)`, handling: "held" });
        out.push({ __unresolved: e });
      }
    }
    return out;
  };

  // ---- proposals
  const proposals = ((v1.proposals as J[] | undefined) ?? []).map((p, pi) => {
    const at = `proposals[${pi}]`;
    const base: J = { proposalId: p.proposalId, ...(p.rationale ? { rationale: p.rationale } : {}), dependsOn: p.dependsOn ?? [] };
    const holdReasons: string[] = [];
    const segments = String(p.rationale ?? "").split("|").map((s) => s.trim()).filter(Boolean);
    const hint = { claimUid: null as string | null, claimType: null as string | null, derivedFrom: [] as string[], supersedes: null as string | null, assertionKind: null as string | null, asserterRef: null as string | null, qualifiers: [] as string[], objectInValue: false, objectUid: null as string | null };
    for (const seg of segments) {
      let mapped = false;
      const claim = /claim occurrence[^|]*?\b(hu:claim:[A-Za-z0-9._\-/]+)/i.exec(seg);
      if (claim) {
        hint.claimUid = claim[1]!;
        mapped = true;
      }
      const ct = /claimType\s+([A-Z][A-Z_]+)/.exec(seg);
      if (ct) {
        hint.claimType = ct[1]!;
        mapped = true;
      }
      for (const m of seg.matchAll(/DERIVED_FROM\s+(hu:assertion:[A-Za-z0-9._\-/]+)/g)) {
        hint.derivedFrom.push(m[1]!);
        mapped = true;
      }
      const sup = /\bsupersedes\s+(hu:assertion:[A-Za-z0-9._\-/]+)/i.exec(seg);
      if (sup) {
        hint.supersedes = sup[1]!;
        mapped = true;
      }
      const ak = /assertionKind\s+(FIELD|CLAIM|METRIC|RELATIONSHIP|COMPUTATION)\b/.exec(seg);
      if (ak) {
        hint.assertionKind = ak[1]!;
        mapped = true;
      }
      const asr = /^asserter\s+(?:=\s*)?([a-z0-9][a-z0-9._-]*)\b/i.exec(seg);
      if (asr && subjectRefs.has(asr[1]!)) {
        hint.asserterRef = asr[1]!;
        mapped = true;
      }
      if (/qualifiers/i.test(seg) && /:/.test(seg)) {
        const qs = parseQualifierList(seg);
        if (qs.length) {
          hint.qualifiers.push(...qs);
          mapped = true;
        }
      } else if (/^[a-z][A-Za-z]+:'[^']*'/.test(seg)) {
        const qs = parseQualifierList(`qualifiers: ${seg}`);
        if (qs.length) {
          hint.qualifiers.push(...qs);
          mapped = true;
        }
      }
      const obj = /^object\s+(hu:[a-z0-9-]+:[A-Za-z0-9._\-/]+)/.exec(seg);
      if (obj) {
        hint.objectUid = obj[1]!;
        mapped = true;
      }
      if (/object uid travels in val/i.test(seg)) {
        hint.objectInValue = true;
        mapped = true;
      }
      if (mapped) {
        mappedHints++;
        edit(`${at}.rationale`, "FU-03-hint-mapped", seg.slice(0, 160));
      } else if (GAP_MARK.test(seg)) holdReasons.push(seg.slice(0, 600));
    }
    if (hint.assertionKind === "CLAIM" && !hint.claimUid) holdReasons.push("assertionKind CLAIM stated without the claim it is an occurrence of (OCCURRENCE_OF target)");
    if (hint.claimUid && !hint.claimType) holdReasons.push(`claim occurrence of ${hint.claimUid} names no claimType (required for assertionKind CLAIM)`);

    const coreOf = (a: J | undefined, extraQualifiers: string[] = []): J => {
      const c = (a ?? {}) as J;
      const v = (c.validity ?? {}) as J;
      const qualifiers = [...extraQualifiers, ...hint.qualifiers];
      if (c.segmentKind) {
        qualifiers.push(`segment:${String(c.segmentKind)}`);
        edit(`${at}.assertion.segmentKind`, "P21", c.segmentKind, `segment:${String(c.segmentKind)}`);
      }
      if (c.jurisdiction) {
        qualifiers.push(`jurisdiction:${String(c.jurisdiction)}`);
        edit(`${at}.assertion.jurisdiction`, "qualifier", c.jurisdiction, `jurisdiction:${String(c.jurisdiction)}`);
      }
      for (const k of ["predicateClass", "extractionMethod", "statedTense"]) if (c[k] !== undefined) edit(`${at}.assertion.${k}`, "no-v2-field", c[k], null, k === "extractionMethod" ? "method lives on the generating Activity (methodVersion)" : undefined);
      let basisKind = c.basisKind as string | undefined;
      if (c.assertionBasis !== undefined) {
        if (!basisKind && schema.enumHas("BasisKind", String(c.assertionBasis))) {
          basisKind = String(c.assertionBasis);
          edit(`${at}.assertion.assertionBasis`, "basisKind", c.assertionBasis, basisKind);
        } else edit(`${at}.assertion.assertionBasis`, "no-v2-field", c.assertionBasis, null);
      }
      const validity: J = {};
      for (const k of ["validFrom", "validTo", "validFromPrecision", "validToPrecision", "validFromBasis", "validToBasis"]) if (v[k] !== undefined && v[k] !== null) validity[k] = v[k];
      if (v.statedAsOf) {
        validity.validObservedAt = v.statedAsOf;
        if (v.statedAsOfPrecision) validity.validObservedAtPrecision = v.statedAsOfPrecision;
        edit(`${at}.assertion.validity.statedAsOf`, "validObservedAt", v.statedAsOf, "validObservedAt");
      }
      const out: J = {
        ...(c.predicate ? { predicate: c.predicate } : {}),
        ...(hint.assertionKind ? { assertionKind: hint.assertionKind } : {}),
        ...(hint.claimUid && hint.claimType ? { assertionKind: "CLAIM", claimType: hint.claimType, occurrenceOf: { claimUid: hint.claimUid } } : {}),
        ...(c.polarity ? { polarity: c.polarity } : {}),
        ...(c.speechAct ? { speechAct: c.speechAct } : {}),
        ...(basisKind ? { basisKind } : {}),
        qualifiers: [...new Set(qualifiers)],
        validity,
        ...(typeof c.extractionConfidence === "number" ? { extractionConfidence: c.extractionConfidence } : {}),
        ...(c.uidSegment ? { uidSegment: c.uidSegment } : {}),
        ...(hint.derivedFrom.length ? { derivation: { from: hint.derivedFrom.map((uid) => ({ uid })) } } : {}),
        ...(hint.supersedes ? { supersedes: { uid: hint.supersedes } } : {}),
      };
      return out;
    };
    const ev = (key = "evidence") => evidenceOf(p[key], `${at}.${key}`);
    const asserter = (p.asserterRef as string | undefined) ?? hint.asserterRef ?? undefined;
    let out: J;
    switch (p.kind) {
      case "node.upsert":
        out = { ...base, kind: "node.upsert", subjectRef: p.subjectRef, properties: p.properties ?? {}, evidence: ev(), ...(asserter ? { asserterRef: asserter } : {}) };
        break;
      case "identifier.attach": {
        const ident = (p.identifier ?? {}) as J;
        if (ident.normalizationRule) edit(`${at}.identifier.normalizationRule`, "scheme-register-normalization", ident.normalizationRule, null);
        out = { ...base, kind: "identifier.attach", subjectRef: p.subjectRef, identifier: { scheme: String(ident.scheme).toUpperCase(), issuer: ident.issuer, value: ident.value }, evidence: ev(), ...(asserter ? { asserterRef: asserter } : {}), qualifiers: hint.qualifiers };
        break;
      }
      case "state.attach":
      case "edge.assert": {
        const type = String(p.relationshipType);
        const fromRef = p.kind === "state.attach" ? p.subjectRef : p.fromRef;
        const toRef = p.kind === "state.attach" ? p.stateRef : p.toRef;
        if (p.kind === "state.attach") edit(`${at}.kind`, "state.attach->edge.assert", "state.attach", "edge.assert", "exclusive slots come from the relationship register (R-10)");
        const rel = schema.rels.get(type);
        const edgeProps = (p.edgeProperties ?? {}) as J;
        if (!rel) {
          const extra: string[] = [];
          for (const [k, v] of Object.entries(edgeProps)) {
            const q = qualifierFrom(k, String(v));
            if (q) extra.push(q);
          }
          if (Object.keys(edgeProps).length) edit(`${at}.edgeProperties`, "FU-03-edge-props-as-qualifiers", edgeProps, extra);
          edit(`${at}.kind`, "R-40-assertion.relate", "edge.assert", "assertion.relate", `${type} is a predicate, not a relationship type`);
          const core = coreOf(p.assertion as J);
          core.predicate = (core.predicate as string | undefined) ?? type;
          core.qualifiers = [...new Set([...(core.qualifiers as string[]), ...extra])];
          out = { ...base, kind: "assertion.relate", subjectRef: fromRef, objectRef: toRef, assertion: core, evidence: ev(), ...(asserter ? { asserterRef: asserter } : {}) };
        } else if (rel.relClass === "structural") {
          edit(`${at}.kind`, "structural-in-v2", "edge.assert", "edge.structural", `${type} is structural in the release; its evidence ${JSON.stringify(p.evidence ?? [])} stays on the captured locators`);
          out = { ...base, kind: "edge.structural", relationshipType: type, fromRef, toRef, properties: edgeProps };
        } else {
          const core = coreOf(p.assertion as J);
          if (core.predicate === type) delete core.predicate;
          out = { ...base, kind: "edge.assert", relationshipType: type, fromRef, toRef, assertion: core, edgeProperties: edgeProps, evidence: ev(), ...(asserter ? { asserterRef: asserter } : {}) };
        }
        break;
      }
      case "assertion.literal": {
        const quals: string[] = [];
        // v1 literal bases map onto registered qualifiers (vocabularies/qualifiers.yaml): massBasis -> basis: (enum
        // MassBasis), quantityBasis -> amountBasis= (D13 amount-basis code) or basis: when the value is a MassBasis
        // member, amountReferent -> referent:. The first registered prefix whose grammar accepts the value wins.
        const candidates: Array<[string, string[]]> = [["quantityBasis", ["amountBasis=", "basis:"]], ["massBasis", ["basis:"]], ["amountReferent", ["referent:"]]];
        for (const [k, prefixes] of candidates) {
          if (p[k] === undefined) continue;
          const v = String(p[k]);
          const chosen = prefixes.find((pre) => !grammar?.registry || (grammar.registered(pre) && grammar.check(pre + v).length === 0)) ?? prefixes[0]!;
          quals.push(chosen + v);
          edit(`${at}.${k}`, "qualifier", p[k], chosen + v);
        }
        const core = coreOf(p.assertion as J, quals);
        core.predicate = p.predicate;
        const vs = p.valueString as string | undefined;
        const objectUid = hint.objectUid ?? (hint.objectInValue && typeof vs === "string" && /^hu:[a-z0-9-]+:\S+$/.test(vs) ? vs : null);
        if (objectUid) {
          const objectRef = ensureUidSubject(objectUid);
          if (objectRef) {
            edit(`${at}.kind`, "R-40-assertion.relate", "assertion.literal", "assertion.relate", `object ${objectUid} named in the v1 rationale / valueString`);
            out = { ...base, kind: "assertion.relate", subjectRef: p.subjectRef, objectRef, assertion: core, evidence: ev(), ...(asserter ? { asserterRef: asserter } : {}) };
            break;
          }
        }
        const value: J = {};
        if (vs !== undefined) value.valueString = vs;
        if (p.valueNumber !== undefined) value.valueNumber = p.valueNumber;
        if (p.valueBoolean !== undefined) value.valueBoolean = p.valueBoolean;
        if (p.unitCode !== undefined) value.unitCode = p.unitCode;
        out = { ...base, kind: "assertion.literal", subjectRef: p.subjectRef, assertion: core, value, evidence: ev(), ...(asserter ? { asserterRef: asserter } : {}) };
        break;
      }
      case "edge.structural":
        if (((p.evidence as unknown[]) ?? []).length) edit(`${at}.evidence`, "structural-needs-no-assertion", p.evidence, null, "StructuralEdgeProperties: the locators stay captured; v2 writes no Assertion beside a structural edge");
        out = { ...base, kind: "edge.structural", relationshipType: p.relationshipType, fromRef: p.fromRef, toRef: p.toRef, properties: p.properties ?? {} };
        break;
      case "edge.close":
        out = { ...base, kind: "edge.close", relationshipUid: p.relationshipUid, reason: p.reason, ...(asserter ? { asserterRef: asserter } : {}) };
        break;
      case "mention.stage": {
        const locRef = String(p.locatorRef);
        const locator = locRef.startsWith("hu:") ? locatorRefByUid.get(locRef) : locRef;
        if (!locator) holdReasons.push(`mention locator ${locRef} is an existing locator cited without selectorDigest`);
        const typeHint = p.candidateNodeType && schema.node(String(p.candidateNodeType)) ? p.candidateNodeType : undefined;
        if (p.candidateNodeType && !typeHint) edit(`${at}.candidateNodeType`, "typeHint-unknown-type", p.candidateNodeType, null);
        edit(`${at}.kind`, "P8-OD-04", "Mention node", "RESOLUTION Assessment + CONTEXT locator");
        out = { ...base, kind: "mention.stage", locator: locator ?? "missing-locator", surfaceForm: p.surfaceForm, ...(typeHint ? { typeHint } : {}), candidates: [], reason: p.reason, ...(p.context ? { context: p.context } : {}) };
        break;
      }
      default:
        out = { ...base, kind: String(p.kind) };
        holdReasons.push(`unknown v1 proposal kind ${String(p.kind)}`);
    }
    const unresolved = JSON.stringify(out).includes("__unresolved");
    if (unresolved) {
      for (const key of ["evidence"]) if (Array.isArray(out[key])) out[key] = (out[key] as unknown[]).filter((e) => !(e && typeof e === "object" && "__unresolved" in (e as J)));
      holdReasons.push("evidence cites an existing locator uid without its selectorDigest (v2 cites evidence by digest)");
    }
    if (holdReasons.length) {
      out.hold = { reason: `FU-03 v1 semantics not mechanically mappable: ${holdReasons.join(" || ")}`.slice(0, 2000) };
      for (const r of holdReasons) gaps.push({ at, text: r.slice(0, 300), handling: "held" });
    }
    return out;
  });

  // notes-level gaps (records that live in assertions.yaml, not in the intent)
  const notes = typeof v1.notes === "string" ? v1.notes : "";
  for (const sentence of notes.split(/(?<=\.)\s+/)) {
    if (GAP_MARK.test(sentence)) gaps.push({ at: "notes", text: sentence.slice(0, 300), handling: "recorded" });
  }

  const intent: IngestionIntentV2Input = {
    schemaVersion: INTENT_V2,
    intentId: v1.intentId as string,
    pins: { schemaReleaseDigest: schema.schemaReleaseDigest, policyVersion: "bks-admission-policy/v1" },
    context: {
      actor: ctx.actor as never,
      run: { system: String(run.system ?? "mission-control"), runId: String(run.runId), ...(run.missionId ? { missionId: String(run.missionId) } : {}), ...(run.activationId ? { activationId: String(run.activationId) } : {}), ...(typeof run.attempt === "number" ? { attempt: run.attempt } : {}) },
      activityKind,
    },
    basis: { creationOnly: { reason: "FU-03 v2 fixture round: replay of a packet fixture into a graph without a prior custody snapshot", expectAbsent, expectPresent } },
    defaults: { privacyClass: (defaults.privacyClass as "PUBLIC" | "INTERNAL" | undefined) ?? "PUBLIC" },
    sources: sources as never,
    subjects: [...subjects, ...extraSubjects] as never,
    proposals: proposals as never,
    ...(notes ? { notes: notes.slice(0, 8000) } : {}),
    provenance: { derivedFrom: { schemaVersion: String(v1.schemaVersion), ...(provenance.path ? { path: provenance.path.slice(0, 400) } : {}), rawBytesDigest: provenance.rawBytesDigest }, migrator: "bks-migrate-intent-v1/1", edits: edits.slice(0, 5000) as never },
  };
  return { intent, edits, gaps, mappedHints };
}
