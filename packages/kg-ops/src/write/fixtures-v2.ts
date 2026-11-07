import { createHash } from "node:crypto";
import type { IngestionIntentV2Input } from "@bks/contracts";

/**
 * Gate B fixtures for biotech-knowledge-intent.v2. SYNTHETIC test data, clearly labelled: every source is
 * `https://fixtures.bks.test/...` with contentHashBasis SYNTHETIC_FIXTURE (or TOOL_RENDITION for the OD-08 case), and
 * every name carries "Synthetic". Nothing here is sourced production knowledge. `stamp` keeps runs disjoint.
 */

const dig = (s: string) => `sha256:${createHash("sha256").update(s).digest("hex")}`;
const ctx = (stamp: string, activityKind = "INGESTION", runSuffix = "r1") => ({
  actor: { kind: "agent" as const, id: "gate-b-fixtures", model: "synthetic" },
  run: { system: "mission-control", runId: `run-${stamp}-${runSuffix}`, missionId: `mission-${stamp}`, operationId: `op-${stamp}-${runSuffix}` },
  activityKind,
});
export const POLICY_VERSION = "bks-admission-policy/v1";

const sel = (exact: string, start: number) => ({ basis: "raw-capture/v1", type: "TextQuoteSelector", exact, refinedBy: { type: "TextPositionSelector", start, end: start + exact.length } });
const loc = (ref: string, exact: string, start: number, extra: Record<string, unknown> = {}) => ({ ref, selectorKind: "TEXT_QUOTE", selector: sel(exact, start), exact, startOffset: start, endOffset: start + exact.length, ...extra });

export function unii(stamp: string): string {
  return createHash("sha256").update(stamp).digest("hex").slice(0, 10).toUpperCase().replace(/[^0-9A-Z]/g, "0");
}

/** Main catalog intent: every ordinary proposal kind (no privileged grants). */
export function catalogIntent(releaseDigest: string, stamp: string): IngestionIntentV2Input {
  const base = `https://fixtures.bks.test/${stamp}`;
  return {
    schemaVersion: "biotech-knowledge-intent.v2",
    intentId: `gb-${stamp}-catalog`,
    pins: { schemaReleaseDigest: releaseDigest, policyVersion: POLICY_VERSION },
    context: ctx(stamp, "RESEARCH"),
    basis: { creationOnly: { reason: "Gate B synthetic fixture: first capture of these synthetic entities" } },
    sources: [
      {
        ref: "label",
        source: { canonicalUri: `${base}/label?utm_source=newsletter&b=2&a=1`, title: "Synthetic label page", sourceKind: "WEB_PAGE", genre: "MARKETING_PAGE" },
        snapshot: { retrievedAt: "2026-10-01T10:00:00Z", observedAt: "2026-10-01T10:00:00Z", contentHash: dig(`label-${stamp}`), contentHashBasis: "SYNTHETIC_FIXTURE", captureMethod: "bks-fixture/1", captureCompleteness: "COMPLETE", mimeType: "text/html", metadata: { syntheticFixture: true } },
        locators: [
          loc("l-panel", "Synthetic NR 300 mg per capsule", 100, { reportsFields: [] }),
          loc("l-root", "Made from the root of the synthetic plant", 200, { reportsFields: ["plantPart"] }),
          loc("l-maker", "Synthetic Test Co supplies the extract", 300),
          loc("l-claim", "Synthetic NR activates synthetic protein SP1", 400),
          loc("l-servings", "Take up to 2 capsules daily", 500, { reportsFields: ["LabelVersion.maxDailyServings"] }),
          loc("l-mention", "PT (Pterostilbene)", 600),
          loc("l-unii", "UNII " + unii(stamp), 700),
          loc("l-person", "Dr. Synthetic Person, scientific advisor", 800),
          loc("l-account", "@synthetic_account says it activates SP1", 900),
          loc("l-weight", "molecular weight 290.3 g/mol", 1000),
        ],
      },
      {
        ref: "rendition",
        source: { canonicalUri: `${base}/rendition`, title: "Synthetic tool rendition", sourceKind: "WEB_PAGE" },
        snapshot: { retrievedAt: "2026-10-01T11:00:00Z", contentHash: dig(`rendition-${stamp}`), contentHashBasis: "TOOL_RENDITION", captureMethod: "firecrawl-scrape/2", captureCompleteness: "PARTIAL_EXCERPT" },
        captureAttempts: [
          { ref: "a1", toolId: "http-capture", toolVersion: "1", outcome: "FAILED", failureKind: "BOT_CHALLENGE", httpStatus: 403, requestUri: `${base}/rendition?api_key=secret-value`, requestDigest: dig(`req-${stamp}`), attemptedAt: "2026-10-01T10:55:00Z", errorText: "403 bot challenge" },
        ],
        locators: [loc("l-rend", "Synthetic NR is well tolerated", 50)],
      },
    ],
    subjects: [
      { ref: "org", mode: "new", nodeType: "Organization", name: `Synthetic Test Co ${stamp}`, uidSegment: `syn-org-${stamp}`, properties: { entityKind: "LEGAL_ENTITY", legalName: `Synthetic Test Co ${stamp} Inc.` }, onMatch: "use_existing" },
      { ref: "brand", mode: "new", nodeType: "Brand", name: `Synthetic Brand ${stamp}`, uidSegment: `syn-brand-${stamp}`, properties: { brandKind: "CONSUMER_PRODUCT" }, onMatch: "use_existing" },
      { ref: "product", mode: "new", nodeType: "Product", name: `Synthetic NR ${stamp}`, uidSegment: `syn-product-${stamp}`, properties: { productKind: "DIETARY_SUPPLEMENT", marketedName: `Synthetic NR ${stamp}` }, onMatch: "use_existing" },
      { ref: "variant", mode: "new", nodeType: "ProductVariant", name: `Synthetic NR ${stamp} capsules`, uidSegment: `syn-variant-${stamp}`, properties: { strengthVerbatim: "300 mg" }, onMatch: "use_existing" },
      { ref: "package", mode: "new", nodeType: "Package", name: `Synthetic NR ${stamp} 30 count`, uidSegment: `syn-package-${stamp}`, properties: { packageKind: "CONTAINER", unitCount: 30 }, onMatch: "use_existing" },
      { ref: "lv1", mode: "new", nodeType: "LabelVersion", name: `Synthetic label v1 ${stamp}`, uidSegment: `syn-lv1-${stamp}`, properties: { panelKind: "SUPPLEMENT_FACTS", contentDigest: dig(`lv1-${stamp}`), compositionDigest: dig(`lv1c-${stamp}`) }, onMatch: "use_existing" },
      { ref: "material", mode: "new", nodeType: "IngredientMaterial", name: `Synthetic botanical extract ${stamp}`, uidSegment: `syn-material-${stamp}`, properties: { materialKind: "BOTANICAL_PREPARATION" }, onMatch: "use_existing" },
      { ref: "nr", mode: "new", nodeType: "ChemicalSubstance", name: `Synthetic nicotinamide riboside ${stamp}`, uidSegment: `syn-nr-${stamp}`, properties: { substanceClass: "CHEMICAL" }, identifiers: [{ scheme: "UNII", issuer: "FDA GSRS", value: unii(stamp) }], onMatch: "use_existing" },
      { ref: "sp1", mode: "new", nodeType: "MolecularEntity", name: `Synthetic protein SP1 ${stamp}`, uidSegment: `syn-sp1-${stamp}`, properties: {}, onMatch: "use_existing" },
      { ref: "mech", mode: "new", nodeType: "Mechanism", name: `Synthetic NAD salvage ${stamp}`, uidSegment: `syn-mech-${stamp}`, properties: { key: `syn-nad-salvage-${stamp}` }, onMatch: "use_existing" },
      { ref: "person", mode: "new", nodeType: "Person", name: `Dr. Synthetic Person ${stamp}`, uidSegment: `syn-person-${stamp}`, properties: { description: "Scientific advisor; reach her at advisor@example.test or +1 (555) 123-4567" }, onMatch: "use_existing" },
      { ref: "account", mode: "new", nodeType: "Channel", name: `@synthetic_account_${stamp}`, uidSegment: `syn-account-${stamp}`, properties: { channelKind: "ACCOUNT", platform: "X", platformAccountId: `syn-${stamp}`, handle: `@synthetic_account_${stamp}` }, onMatch: "use_existing" },
      { ref: "claim", mode: "new", nodeType: "Claim", name: "Synthetic NR activates SP1", properties: { proposition: `Synthetic nicotinamide riboside ${stamp} directly activates synthetic protein SP1`, claimType: "RELATIONSHIP" }, onMatch: "use_existing" },
    ],
    proposals: [
      { proposalId: "p-lineage", kind: "lineage.start", about: ["claim"] },
      { proposalId: "p-variant", kind: "edge.structural", relationshipType: "HAS_VARIANT", fromRef: "product", toRef: "variant" },
      { proposalId: "p-package", kind: "edge.structural", relationshipType: "HAS_PACKAGE", fromRef: "variant", toRef: "package", properties: { orderIndex: 1 } },
      { proposalId: "p-owns", kind: "edge.assert", relationshipType: "OWNS_BRAND", fromRef: "org", toRef: "brand", asserterRef: "org", evidence: ["l-maker"], assertion: { speechAct: "STATES", basisKind: "MANUFACTURER_CLAIM", validity: { validFrom: "2026-01-01T00:00:00Z", validFromBasis: "STATED_BY_SOURCE" } } },
      { proposalId: "p-lv1", kind: "edge.assert", relationshipType: "HAS_LABEL_VERSION", fromRef: "package", toRef: "lv1", asserterRef: "org", evidence: ["l-panel"], assertion: { speechAct: "STATES", validity: { validFrom: "2026-09-01T00:00:00Z", validFromBasis: "STATED_BY_SOURCE" } } },
      { proposalId: "p-realizes", kind: "edge.assert", relationshipType: "REALIZES_SUBSTANCE", fromRef: "material", toRef: "nr", asserterRef: "org", evidence: ["l-panel"], assertion: { speechAct: "STATES", validity: { validFrom: "2026-09-01T00:00:00Z", validFromBasis: "STATED_BY_SOURCE" } } },
      { proposalId: "p-unii", kind: "identifier.attach", subjectRef: "nr", identifier: { scheme: "UNII", issuer: "FDA GSRS", value: unii(stamp).toLowerCase() }, evidence: ["l-unii"], isPrimary: true },
      { proposalId: "p-plantpart", kind: "node.upsert", subjectRef: "material", properties: { plantPart: "ROOT" }, asserterRef: "org" },
      { proposalId: "p-weight", kind: "node.upsert", subjectRef: "nr", properties: { molecularWeight: 290.3 }, fieldEvidence: { molecularWeight: ["l-weight"] } },
      { proposalId: "p-servings", kind: "node.upsert", subjectRef: "lv1", properties: { maxDailyServings: 2 }, asserterRef: "org" },
      { proposalId: "p-daily-max", kind: "assertion.literal", subjectRef: "lv1", dependsOn: ["p-servings"], assertion: { predicate: "CALCULATED_DAILY_MAX_INTAKE", basisKind: "CALCULATED", qualifiers: ["comparator:LTE", "dose:up to 2 capsules of 300 mg"], derivation: { rule: "d6-daily-max/v1", from: [{ proposal: "p-servings" }] }, validity: {} }, value: { valueNumber: 600, unitCode: "mg/d" }, evidence: ["l-servings"] },
      { proposalId: "p-supplies", kind: "assertion.relate", subjectRef: "org", objectRef: "material", asserterRef: "org", evidence: ["l-maker"], assertion: { predicate: "SUPPLIES_MATERIAL", speechAct: "STATES", basisKind: "MANUFACTURER_CLAIM", qualifiers: ["exclusivity=EXCLUSIVE"], validity: {} } },
      { proposalId: "p-claim-occ", kind: "assertion.relate", subjectRef: "nr", objectRef: "sp1", asserterRef: "org", evidence: ["l-claim"], assertion: { predicate: "ACTIVATES", assertionKind: "CLAIM", claimType: "RELATIONSHIP", occurrenceOf: { claimRef: "claim" }, speechAct: "STATES", basisKind: "MANUFACTURER_CLAIM", validity: { validObservedAt: "2026-10-01T00:00:00Z" } } },
      { proposalId: "p-account-occ", kind: "assertion.relate", subjectRef: "nr", objectRef: "sp1", asserterRef: "account", evidence: ["l-account"], assertion: { predicate: "ACTIVATES", assertionKind: "CLAIM", claimType: "RELATIONSHIP", occurrenceOf: { claimRef: "claim" }, speechAct: "STATES", basisKind: "CITED_FROM_PRIOR_WORK", derivation: { from: [{ proposal: "p-claim-occ" }] }, validity: {} } },
      { proposalId: "p-rendition-occ", kind: "assertion.relate", subjectRef: "nr", objectRef: "sp1", asserterRef: "org", evidence: ["l-rend"], assertion: { predicate: "ACTIVATES", speechAct: "STATES", basisKind: "MANUFACTURER_CLAIM", qualifiers: ["segment:SPONSOR_READ"], validity: {} } },
      { proposalId: "p-vetting", kind: "assessment.record", assessmentKind: "VETTING", about: ["claim"], methodVersion: "gate-b-vetting/1", disposition: "RESEARCH", inputs: { assertions: [{ proposal: "p-claim-occ" }], assessments: [] }, evidence: [{ locator: "l-claim", role: "CONTEXT" }], facets: ["queue=gate-b"] },
      { proposalId: "p-mention", kind: "mention.stage", locator: "l-mention", surfaceForm: "PT (Pterostilbene)", typeHint: "ChemicalSubstance", reason: "material identity not resolvable from the label alone" },
      { proposalId: "p-person-role", kind: "assertion.literal", subjectRef: "person", asserterRef: "org", evidence: ["l-person"], assertion: { predicate: "MATERIAL_CONNECTION_NOT_ADEQUATELY_DISCLOSED", speechAct: "STATES", validity: {} }, value: { valueString: "advisor relationship stated without compensation details" } },
    ],
    notes: "Gate B synthetic fixture (catalog). Not sourced knowledge.",
  };
}

/** Follow-up in a second run: closes the label-version episode, opens v2, supersedes the brand assertion (same asserter). */
export function followupIntent(releaseDigest: string, stamp: string, refs: { packageUid: string; orgUid: string; brandUid: string; lv1RelUid: string; ownsAssertionUid: string }): IngestionIntentV2Input {
  const base = `https://fixtures.bks.test/${stamp}`;
  return {
    schemaVersion: "biotech-knowledge-intent.v2",
    intentId: `gb-${stamp}-followup`,
    pins: { schemaReleaseDigest: releaseDigest, policyVersion: POLICY_VERSION },
    context: ctx(stamp, "INGESTION", "r2"),
    basis: { creationOnly: { reason: "Gate B follow-up capture of the same synthetic label", expectPresent: [refs.packageUid] } },
    sources: [
      { ref: "label2", source: { canonicalUri: `${base}/label?a=1&b=2`, sourceKind: "WEB_PAGE" }, snapshot: { retrievedAt: "2026-10-05T10:00:00Z", contentHash: dig(`label2-${stamp}`), contentHashBasis: "SYNTHETIC_FIXTURE", captureMethod: "bks-fixture/1", captureCompleteness: "COMPLETE" }, locators: [loc("l2-panel", "Synthetic NR 250 mg per capsule (new formula)", 100), loc("l2-brand", "Synthetic Test Co sold the brand", 150)] },
    ],
    subjects: [
      { ref: "package", mode: "resolved", uid: refs.packageUid, nodeType: "Package" },
      { ref: "org", mode: "resolved", uid: refs.orgUid, nodeType: "Organization" },
      { ref: "brand", mode: "resolved", uid: refs.brandUid, nodeType: "Brand" },
      { ref: "lv2", mode: "new", nodeType: "LabelVersion", name: `Synthetic label v2 ${stamp}`, uidSegment: `syn-lv2-${stamp}`, properties: { panelKind: "SUPPLEMENT_FACTS", contentDigest: dig(`lv2-${stamp}`), compositionDigest: dig(`lv2c-${stamp}`) }, onMatch: "use_existing" },
    ],
    proposals: [
      { proposalId: "c-close-lv1", kind: "edge.close", relationshipUid: refs.lv1RelUid, reason: "later capture shows a new label version", asserterRef: "org" },
      { proposalId: "c-lv2", kind: "edge.assert", dependsOn: ["c-close-lv1"], relationshipType: "HAS_LABEL_VERSION", fromRef: "package", toRef: "lv2", asserterRef: "org", evidence: ["l2-panel"], assertion: { speechAct: "STATES", validity: { validFrom: "2026-10-05T00:00:00Z", validFromBasis: "STATED_BY_SOURCE" } } },
      { proposalId: "c-owns-negative", kind: "edge.assert", relationshipType: "OWNS_BRAND", fromRef: "org", toRef: "brand", asserterRef: "org", evidence: ["l2-brand"], assertion: { speechAct: "STATES", polarity: "NEGATIVE", supersedes: { uid: refs.ownsAssertionUid }, validity: { validFrom: "2026-10-05T00:00:00Z", validFromBasis: "STATED_BY_SOURCE" } } },
    ],
  };
}

/** Second label version opened WITHOUT closing the first: same (package, slot, asserter) -> SLOT_CONFLICT when raced. */
export function slotRaceIntent(releaseDigest: string, stamp: string, label: string, packageUid: string, orgUid: string): IngestionIntentV2Input {
  return {
    schemaVersion: "biotech-knowledge-intent.v2",
    intentId: `gb-${stamp}-slot-${label}`,
    pins: { schemaReleaseDigest: releaseDigest, policyVersion: POLICY_VERSION },
    context: ctx(stamp, "INGESTION", `slot-${label}`),
    basis: { creationOnly: { reason: "Gate B slot race fixture" } },
    sources: [{ ref: "s", source: { canonicalUri: `https://fixtures.bks.test/${stamp}/slot/${label}`, sourceKind: "WEB_PAGE" }, snapshot: { retrievedAt: "2026-10-06T10:00:00Z", contentHash: dig(`slot-${label}-${stamp}`), contentHashBasis: "SYNTHETIC_FIXTURE", captureMethod: "bks-fixture/1" }, locators: [loc("l", `Synthetic label ${label}`, 10)] }],
    subjects: [
      { ref: "package", mode: "resolved", uid: packageUid, nodeType: "Package" },
      { ref: "org", mode: "resolved", uid: orgUid, nodeType: "Organization" },
      { ref: "lv", mode: "new", nodeType: "LabelVersion", name: `Synthetic label ${label} ${stamp}`, uidSegment: `syn-lv-${label}-${stamp}`, properties: { panelKind: "SUPPLEMENT_FACTS", contentDigest: dig(`lv-${label}-${stamp}`), compositionDigest: dig(`lvc-${label}-${stamp}`) }, onMatch: "use_existing" },
    ],
    proposals: [{ proposalId: "p", kind: "edge.assert", relationshipType: "HAS_LABEL_VERSION", fromRef: "package", toRef: "lv", asserterRef: "org", evidence: ["l"], assertion: { validity: { validFrom: "2026-10-06T00:00:00Z", validFromBasis: "STATED_BY_SOURCE" } } }],
  };
}

/** Two intents attaching the same identifier to two different new subjects -> IDENTITY_CONFLICT when raced. */
export function identityRaceIntent(releaseDigest: string, stamp: string, label: string, value: string): IngestionIntentV2Input {
  return {
    schemaVersion: "biotech-knowledge-intent.v2",
    intentId: `gb-${stamp}-ident-${label}`,
    pins: { schemaReleaseDigest: releaseDigest, policyVersion: POLICY_VERSION },
    context: ctx(stamp, "INGESTION", `ident-${label}`),
    basis: { creationOnly: { reason: "Gate B identity race fixture" } },
    sources: [{ ref: "s", source: { canonicalUri: `https://fixtures.bks.test/${stamp}/ident/${label}`, sourceKind: "API" }, snapshot: { retrievedAt: "2026-10-06T10:00:00Z", contentHash: dig(`ident-${label}-${stamp}`), contentHashBasis: "SYNTHETIC_FIXTURE", captureMethod: "bks-fixture/1" }, locators: [loc("l", `UNII ${value}`, 10)] }],
    subjects: [{ ref: "x", mode: "new", nodeType: "ChemicalSubstance", name: `Synthetic substance ${label} ${stamp}`, uidSegment: `syn-ident-${label}-${stamp}`, properties: {}, onMatch: "create_anyway" }],
    proposals: [{ proposalId: "p", kind: "identifier.attach", subjectRef: "x", identifier: { scheme: "UNII", issuer: "FDA GSRS", value }, evidence: ["l"] }],
  };
}

/** Small independent intent used for duplicate / conflict / concurrency / failure tests. */
export function smallIntent(releaseDigest: string, stamp: string, label: string, note?: string): IngestionIntentV2Input {
  return {
    schemaVersion: "biotech-knowledge-intent.v2",
    intentId: `gb-${stamp}-small-${label}`,
    pins: { schemaReleaseDigest: releaseDigest, policyVersion: POLICY_VERSION },
    context: ctx(stamp, "INGESTION", `small-${label}`),
    basis: { creationOnly: { reason: "Gate B small fixture" } },
    sources: [{ ref: "s", source: { canonicalUri: `https://fixtures.bks.test/${stamp}/small/${label}`, sourceKind: "WEB_PAGE" }, snapshot: { retrievedAt: "2026-10-06T10:00:00Z", contentHash: dig(`small-${label}-${stamp}`), contentHashBasis: "SYNTHETIC_FIXTURE", captureMethod: "bks-fixture/1" }, locators: [loc("l", `Synthetic Org ${label} owns Synthetic Brand ${label}`, 10)] }],
    subjects: [
      { ref: "org", mode: "new", nodeType: "Organization", name: `Synthetic Org ${label} ${stamp}`, uidSegment: `syn-small-org-${label}-${stamp}`, properties: { entityKind: "LEGAL_ENTITY" }, onMatch: "use_existing" },
      { ref: "brand", mode: "new", nodeType: "Brand", name: `Synthetic Brand ${label} ${stamp}`, uidSegment: `syn-small-brand-${label}-${stamp}`, properties: { brandKind: "CONSUMER_PRODUCT" }, onMatch: "use_existing" },
    ],
    proposals: [
      { proposalId: "p-owns", kind: "edge.assert", relationshipType: "OWNS_BRAND", fromRef: "org", toRef: "brand", asserterRef: "org", evidence: ["l"], assertion: { validity: {} } },
      { proposalId: "p-legal", kind: "assertion.literal", subjectRef: "org", asserterRef: "org", evidence: ["l"], assertion: { predicate: "LEGAL_NAME", validity: {} }, value: { valueString: `Synthetic Org ${label} Inc.` } },
    ],
    ...(note ? { notes: note } : {}),
  };
}

/** Event chain for the SUPPORT projection gate (LEADS_TO is held without an edge until a SUPPORT adjudication admits it). */
export function eventIntent(releaseDigest: string, stamp: string): IngestionIntentV2Input {
  return {
    schemaVersion: "biotech-knowledge-intent.v2",
    intentId: `gb-${stamp}-events`,
    pins: { schemaReleaseDigest: releaseDigest, policyVersion: POLICY_VERSION },
    context: ctx(stamp, "INGESTION", "events"),
    basis: { creationOnly: { reason: "Gate B event fixture" } },
    sources: [
      { ref: "pr", source: { canonicalUri: `https://fixtures.bks.test/${stamp}/press`, sourceKind: "WEB_PAGE", genre: "PRESS_RELEASE" }, snapshot: { retrievedAt: "2026-10-06T10:00:00Z", contentHash: dig(`press-${stamp}`), contentHashBasis: "SYNTHETIC_FIXTURE", captureMethod: "bks-fixture/1" }, locators: [loc("l", "as a result of the readout, Synthetic Test Co raised financing", 10)] },
      // OD-08 adversarial: a tool rendition with NO recorded failed capture attempt.
      { ref: "rend2", source: { canonicalUri: `https://fixtures.bks.test/${stamp}/rendition-no-attempt`, sourceKind: "WEB_PAGE" }, snapshot: { retrievedAt: "2026-10-06T11:00:00Z", contentHash: dig(`rend2-${stamp}`), contentHashBasis: "TOOL_RENDITION", captureMethod: "firecrawl-scrape/2" }, locators: [loc("l2", "Synthetic Event Co, Inc.", 5)] },
    ],
    subjects: [
      { ref: "org", mode: "new", nodeType: "Organization", name: `Synthetic Event Co ${stamp}`, uidSegment: `syn-event-org-${stamp}`, properties: { entityKind: "LEGAL_ENTITY" }, onMatch: "use_existing" },
      { ref: "readout", mode: "new", nodeType: "Event", name: `Synthetic readout ${stamp}`, uidSegment: `syn-readout-${stamp}`, properties: { eventKind: "READOUT", eventStatus: "OCCURRED", startedAt: "2026-09-01T00:00:00Z" }, onMatch: "use_existing" },
      { ref: "financing", mode: "new", nodeType: "Event", name: `Synthetic financing ${stamp}`, uidSegment: `syn-financing-${stamp}`, properties: { eventKind: "FINANCING", eventStatus: "OCCURRED", startedAt: "2026-09-15T00:00:00Z" }, onMatch: "use_existing" },
    ],
    proposals: [
      { proposalId: "p-leads", kind: "edge.assert", relationshipType: "LEADS_TO", fromRef: "readout", toRef: "financing", asserterRef: "org", evidence: ["l"], assertion: { speechAct: "STATES", validity: {} } },
      { proposalId: "p-rend2", kind: "assertion.literal", subjectRef: "org", asserterRef: "org", evidence: ["l2"], assertion: { predicate: "LEGAL_NAME", validity: {} }, value: { valueString: "Synthetic Event Co, Inc." } },
    ],
  };
}

/** A Package and its brand owner with no label version yet (slot race setup). */
export function packageSetupIntent(releaseDigest: string, stamp: string): IngestionIntentV2Input {
  return {
    schemaVersion: "biotech-knowledge-intent.v2",
    intentId: `gb-${stamp}-package-setup`,
    pins: { schemaReleaseDigest: releaseDigest, policyVersion: POLICY_VERSION },
    context: ctx(stamp, "INGESTION", "setup"),
    basis: { creationOnly: { reason: "Gate B slot race setup" } },
    sources: [{ ref: "s", source: { canonicalUri: `https://fixtures.bks.test/${stamp}/package`, sourceKind: "WEB_PAGE" }, snapshot: { retrievedAt: "2026-10-06T09:00:00Z", contentHash: dig(`pkg-${stamp}`), contentHashBasis: "SYNTHETIC_FIXTURE", captureMethod: "bks-fixture/1" }, locators: [loc("l", "Synthetic Slot Co 60 count bottle", 1)] }],
    subjects: [
      { ref: "org", mode: "new", nodeType: "Organization", name: `Synthetic Slot Co ${stamp}`, uidSegment: `syn-slot-org-${stamp}`, properties: { entityKind: "LEGAL_ENTITY" }, onMatch: "use_existing" },
      { ref: "package", mode: "new", nodeType: "Package", name: `Synthetic Slot 60 count ${stamp}`, uidSegment: `syn-slot-package-${stamp}`, properties: { packageKind: "CONTAINER", unitCount: 60 }, onMatch: "use_existing" },
    ],
    proposals: [{ proposalId: "p-legal", kind: "assertion.literal", subjectRef: "org", asserterRef: "org", evidence: ["l"], assertion: { predicate: "LEGAL_NAME", validity: {} }, value: { valueString: `Synthetic Slot Co ${stamp} Ltd.` } }],
  };
}

/** Privileged intents: adjudication delivery (verifier), report publication (publisher), projection writes (projector). */
export function adjudicationIntent(releaseDigest: string, stamp: string, label: string, verificationRefs: Array<{ ref: string; digest: string }>): IngestionIntentV2Input {
  return {
    schemaVersion: "biotech-knowledge-intent.v2",
    intentId: `gb-${stamp}-adj-${label}`,
    pins: { schemaReleaseDigest: releaseDigest, policyVersion: POLICY_VERSION },
    context: { ...ctx(stamp, "VERIFICATION", `adj-${label}`), run: { system: "ks-verification", runId: `ver-${stamp}-${label}` } },
    basis: { creationOnly: { reason: "Gate B adjudication delivery (sealed verification results in custody)" } },
    proposals: verificationRefs.map((v, i) => ({ proposalId: `adj-${i + 1}`, kind: "adjudication" as const, verificationRef: v })),
  };
}

export function reportIntent(releaseDigest: string, stamp: string, refs: { claimUid: string; occurrenceUid: string; locatorUid: string; locatorDigest: string; vettingUid: string }): IngestionIntentV2Input {
  return {
    schemaVersion: "biotech-knowledge-intent.v2",
    intentId: `gb-${stamp}-report`,
    pins: { schemaReleaseDigest: releaseDigest, policyVersion: POLICY_VERSION },
    context: ctx(stamp, "EVIDENCE_MISSION", "mission"),
    basis: { creationOnly: { reason: "Gate B evidence report publication" } },
    subjects: [{ ref: "claim", mode: "resolved", uid: refs.claimUid, nodeType: "Claim" }],
    proposals: [
      { proposalId: "r-lineage", kind: "lineage.start", about: ["claim"], informedBy: [{ system: "mission-control", runId: `run-${stamp}-r1` }] },
      { proposalId: "r-report", kind: "report.publish", reportKind: "EVIDENCE_REPORT", name: `Synthetic evidence report ${stamp}`, skeletonKey: "d10.evidence-report@1", policyVersion: POLICY_VERSION, bodyDigest: dig(`report-${stamp}`), verdict: "NOT_SUPPORTED", worldCorrectness: "NOT_SATISFIED", policyOutcome: "PASS", about: ["claim"], citesAssertions: [{ uid: refs.occurrenceUid }], citesAssessments: [{ uid: refs.vettingUid }], evidence: [{ uid: refs.locatorUid, selectorDigest: refs.locatorDigest }], items: [{ itemKey: "verdict", itemKind: "SECTION", sectionKind: "VERDICT", about: ["claim"], derivedFrom: [{ uid: refs.occurrenceUid }] }] },
    ],
  };
}

export function projectionIntent(releaseDigest: string, stamp: string, refs: { substanceUid: string; mechanismUid: string; assertionUid: string }): IngestionIntentV2Input {
  return {
    schemaVersion: "biotech-knowledge-intent.v2",
    intentId: `gb-${stamp}-projection`,
    pins: { schemaReleaseDigest: releaseDigest, policyVersion: POLICY_VERSION },
    context: { ...ctx(stamp, "PROJECTION", "projection"), run: { system: "projection", runId: `proj-${stamp}` } },
    basis: { creationOnly: { reason: "Gate B projection job" } },
    subjects: [
      { ref: "nr", mode: "resolved", uid: refs.substanceUid, nodeType: "ChemicalSubstance" },
      { ref: "mech", mode: "resolved", uid: refs.mechanismUid, nodeType: "Mechanism" },
    ],
    proposals: [
      { proposalId: "pr-affects", kind: "projection.write", projection: { target: "derived-edge", relationshipType: "AFFECTS_MECHANISM", fromRef: "nr", toRef: "mech", derivationRule: "mechanism-rollup/v1", derivedFromAssertions: [{ uid: refs.assertionUid }] } },
      { proposalId: "pr-assoc", kind: "projection.write", projection: { target: "association", associationKind: "EVIDENCE_AGGREGATE", anchorRef: "nr", memberRefs: ["mech"], score: 0.42, methodVersion: "bl-assoc/evidence-aggregate@1", inputs: [{ uid: refs.assertionUid }] } },
    ],
  };
}
