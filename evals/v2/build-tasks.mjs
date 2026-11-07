#!/usr/bin/env node
// Builds the frozen v2 evaluation task files (no LLM, no network, no graph access).
//
//   node evals/v2/build-tasks.mjs            # writes <suite>/tasks.json (prompt-visible) and <suite>/gold-spec.json (hidden)
//   node evals/v2/build-tasks.mjs --check    # fails when the files on disk differ from a fresh build (freeze check)
//
// Suites: schema-discovery (authored below), native-read (selected deterministically from schema/program/final/fixtures),
// write-recovery (authored below). Gold VALUES are never written here: gold-spec.json holds selectors that
// derive-gold.mjs resolves against the accepted registers, SDL, vocabularies, fixtures, INTERFACES.md and (at run time)
// the migration manifest. Prompts reference release identities only through ${PLACEHOLDERS} bound at run time.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { YAML, canonical } from "../../scripts/migration/lib/common.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..");
const FIX = path.join(REPO, "schema", "program", "final", "fixtures");
const BINDINGS = ["RELEASE_ID", "SCHEMA_RELEASE_DIGEST", "WORKSPACE_FINGERPRINT", "QUERY_CATALOG_DIGEST", "EXECUTOR_VERSION", "SKILL_BUNDLE_VERSION", "MIGRATION_RUN_ID", "SEMANTIC_GENERATION_ID", "FIXTURE_GRAPH_ID"];
const ctxLine = "Release under test: ${RELEASE_ID} (schemaReleaseDigest ${SCHEMA_RELEASE_DIGEST}, workspace ${WORKSPACE_FINGERPRINT}). Cite every schema card you rely on with its release-bound card id.";

// ---------------------------------------------------------------- schema discovery
// shape: [id, module, category, prompt, goldSpec]
const SD = [
  ["SD-K-01", "K", "exact", "Give the uid token and the identity keys of the SourceLocator node type.", { kind: "node", name: "SourceLocator", fields: ["uidToken", "identityKeys", "module"] }],
  ["SD-K-02", "K", "exact", "What class is the HAS_EVIDENCE relationship from an Assertion, which node type does it point to, and which edge-property type does it carry?", { kind: "relationship", type: "HAS_EVIDENCE", fields: ["class", "to", "edgeProperties"] }],
  ["SD-K-03", "K", "paraphrase", "Which node type records that some party stated a predicate about a subject, with its own status, validity interval and evidence links?", { kind: "node", name: "Assertion", fields: ["uidToken", "module"] }],
  ["SD-K-04", "K", "paraphrase", "Which node type stands for the captured bytes of a page or file at retrieval time, identified by a content hash?", { kind: "node", name: "SourceSnapshot", fields: ["uidToken", "identityKeys"] }],
  ["SD-K-05", "K", "negative", "Which node type stores a surface-form mention of an entity awaiting resolution? Name it, or say it does not exist and what replaces it.", { kind: "absent", name: "Mention", in: "node", replacementTypes: ["SourceLocator", "Assessment"] }],
  ["SD-D1-01", "D1", "exact", "List the identity keys of ChemicalSubstance in priority order.", { kind: "node", name: "ChemicalSubstance", fields: ["identityKeys", "uidToken"] }],
  ["SD-D1-02", "D1", "paraphrase", "Which node type is an ingredient as supplied to a product maker, for example a botanical extract with plant part, extract ratio and solvent?", { kind: "node", name: "IngredientMaterial", fields: ["uidToken", "module"] }],
  ["SD-D1-03", "D1", "paraphrase", "Which relationship says that a supplied ingredient material is a realization of a defined chemical? Give type, endpoints and class.", { kind: "relationship", type: "REALIZES_SUBSTANCE", fields: ["from", "to", "class"] }],
  ["SD-D1-04", "D1", "negative", "Is there a ChemicalForm node type in this release? If not, where does a chemical form live?", { kind: "absent", name: "ChemicalForm", in: "node", replacementTypes: ["IngredientMaterial"] }],
  ["SD-D2-01", "D2", "exact", "Give the uid token and identity keys of Mechanism.", { kind: "node", name: "Mechanism", fields: ["uidToken", "identityKeys"] }],
  ["SD-D2-02", "D2", "paraphrase", "Which node type mirrors a gene or protein record such as a UniProt or HGNC entry?", { kind: "node", name: "MolecularEntity", fields: ["uidToken", "identifierSchemes"] }],
  ["SD-D2-03", "D2", "paraphrase", "Which registered predicate states that a compound reduces the activity of a protein target by direct inhibition? Give its subject and object types.", { kind: "predicate", name: "INHIBITS", fields: ["kind", "subjectTypes", "objectTypes", "registrar"] }],
  ["SD-D2-04", "D2", "negative", "Which node type represents a biological pathway? If no dedicated type exists, say which type carries pathways.", { kind: "absent", name: "Pathway", in: "node", replacementTypes: ["Mechanism"] }],
  ["SD-D3-01", "D3", "exact", "What are the identity keys of Study?", { kind: "node", name: "Study", fields: ["identityKeys", "identifierSchemes"] }],
  ["SD-D3-02", "D3", "paraphrase", "Which node type captures one dated version of a trial's registry record, so registry history can be compared?", { kind: "node", name: "RegistrationVersion", fields: ["uidToken", "identityKeys"] }],
  ["SD-D3-03", "D3", "exact", "Describe HAS_STUDY_ROLE: endpoints, class, edge-property type and temporal model.", { kind: "relationship", type: "HAS_STUDY_ROLE", fields: ["from", "to", "class", "edgeProperties", "temporal"] }],
  ["SD-D3-04", "D3", "negative", "Does a TrialRegistration node type exist? If not, what represents a registered trial?", { kind: "absent", name: "TrialRegistration", in: "node", replacementTypes: ["Study"] }],
  ["SD-D4-01", "D4", "exact", "Give the uid token and identity keys of Metric.", { kind: "node", name: "Metric", fields: ["uidToken", "identityKeys", "identifierSchemes"] }],
  ["SD-D4-02", "D4", "paraphrase", "Which node type is one fixed realization of an epigenetic clock as a vendor implements it, possibly with an unknown version?", { kind: "node", name: "AlgorithmVersion", fields: ["uidToken", "identityKeys"] }],
  ["SD-D4-03", "D4", "paraphrase", "Which relationship says that a lab test reports a particular measurand? Give type, endpoints, class and temporal model.", { kind: "relationship", type: "MEASURES_METRIC", fields: ["from", "to", "class", "temporal"] }],
  ["SD-D4-04", "D4", "negative", "Is TechnologyPlatform a node type in this release? If not, which types carry assay platforms and algorithms?", { kind: "absent", name: "TechnologyPlatform", in: "node", replacementTypes: ["AssayVersion", "AlgorithmVersion"] }],
  ["SD-D5-01", "D5", "exact", "What are the identity keys of ProtocolEdition and its uid token?", { kind: "node", name: "ProtocolEdition", fields: ["identityKeys", "uidToken"] }],
  ["SD-D5-02", "D5", "paraphrase", "Which curated node type names a health goal such as better sleep or glycemic control that interventions aim at?", { kind: "node", name: "Target", fields: ["uidToken", "identityKeys"] }],
  ["SD-D5-03", "D5", "exact", "Is INTENDED_FOR_TARGET a relationship type or a predicate? Give its kind, subject types and object types.", { kind: "predicate", name: "INTENDED_FOR_TARGET", fields: ["kind", "subjectTypes", "objectTypes"] }],
  ["SD-D5-04", "D5", "negative", "Which node type stores a lifestyle practice? If none, what carries it?", { kind: "absent", name: "Lifestyle", in: "node", replacementTypes: ["Intervention"] }],
  ["SD-D6-01", "D6", "exact", "Give the identity keys of MerchantListing.", { kind: "node", name: "MerchantListing", fields: ["identityKeys", "uidToken"] }],
  ["SD-D6-02", "D6", "paraphrase", "Which node type holds the printed facts-panel content of a package as of one version of its label?", { kind: "node", name: "LabelVersion", fields: ["uidToken", "identityKeys"] }],
  ["SD-D6-03", "D6", "exact", "Describe LISTING_FOR: endpoints, class and temporal model.", { kind: "relationship", type: "LISTING_FOR", fields: ["from", "to", "class", "temporal"] }],
  ["SD-D6-04", "D6", "negative", "Where is a ProductSnapshot stored in this release? If the type is gone, name what carries product label history.", { kind: "absent", name: "ProductSnapshot", in: "node", replacementTypes: ["LabelVersion"] }],
  ["SD-D6-05", "D6", "paraphrase", "Which registered predicate says which organization hosts a merchant listing page?", { kind: "predicate", name: "HOSTED_BY", fields: ["kind", "subjectTypes", "objectTypes", "registrar"] }],
  ["SD-D7-01", "D7", "exact", "What are the identity keys of Person?", { kind: "node", name: "Person", fields: ["identityKeys", "identifierSchemes"] }],
  ["SD-D7-02", "D7", "paraphrase", "Which relationship records a person serving a company as founder, officer, employee or advisor, with a role kind on the edge?", { kind: "relationship", type: "HOLDS_ROLE", fields: ["from", "to", "class", "edgeProperties", "temporal"] }],
  ["SD-D7-03", "D7", "exact", "List the values of the OrgRoleKind enum.", { kind: "enum", name: "OrgRoleKind" }],
  ["SD-D7-04", "D7", "negative", "Is LegalEntity a node type? If not, which type represents a legal entity?", { kind: "absent", name: "LegalEntity", in: "node", replacementTypes: ["Organization"] }],
  ["SD-D8-01", "D8", "exact", "Give the identity keys of LegalStatus.", { kind: "node", name: "LegalStatus", fields: ["identityKeys", "uidToken"] }],
  ["SD-D8-02", "D8", "paraphrase", "Which node type represents an authority record such as an FDA warning letter, an inspection or a recall notice?", { kind: "node", name: "RegulatoryRecord", fields: ["uidToken", "identityKeys"] }],
  ["SD-D8-03", "D8", "exact", "Describe STATUS_OF: endpoints, class and temporal model.", { kind: "relationship", type: "STATUS_OF", fields: ["from", "to", "class", "temporal"] }],
  ["SD-D8-04", "D8", "negative", "Is RegulatoryStatus a node type in this release? If not, what replaces it?", { kind: "absent", name: "RegulatoryStatus", in: "node", replacementTypes: ["LegalStatus"] }],
  ["SD-D9-01", "D9", "exact", "Give the identity keys of Chunk.", { kind: "node", name: "Chunk", fields: ["identityKeys", "uidToken"] }],
  ["SD-D9-02", "D9", "paraphrase", "Which node type is a published work such as a podcast episode, a YouTube video or a newsletter issue?", { kind: "node", name: "MediaWork", fields: ["uidToken", "identityKeys"] }],
  ["SD-D9-03", "D9", "paraphrase", "Which structural relationship ties an assertion to the media work in which it was said?", { kind: "relationship", type: "OCCURS_IN", fields: ["from", "to", "class"] }],
  ["SD-D9-04", "D9", "negative", "Is Episode a node type in this release? If not, what represents a podcast episode?", { kind: "absent", name: "Episode", in: "node", replacementTypes: ["MediaWork"] }],
  ["SD-D10-01", "D10", "exact", "Give the uid token and identity keys of Association.", { kind: "node", name: "Association", fields: ["uidToken", "identityKeys"] }],
  ["SD-D10-02", "D10", "paraphrase", "Which node type is one line of a published ranking or answer report?", { kind: "node", name: "ReportItem", fields: ["uidToken", "identityKeys"] }],
  ["SD-D10-03", "D10", "exact", "Which relationship links a Report to the decision criteria it applied? Give endpoints and class.", { kind: "relationship", type: "USES_CRITERION", fields: ["from", "to", "class"] }],
  ["SD-D10-04", "D10", "negative", "Is AnswerRecord a node type in this release? If not, what replaces it?", { kind: "absent", name: "AnswerRecord", in: "node", replacementTypes: ["Report"] }],
  ["SD-D11-01", "D11", "exact", "Give the uid token of CaptureAttempt and its stored labels rule.", { kind: "node", name: "CaptureAttempt", fields: ["uidToken", "archetype"] }],
  ["SD-D11-02", "D11", "paraphrase", "Which node type records one attempt to fetch source bytes, including failed attempts?", { kind: "node", name: "CaptureAttempt", fields: ["uidToken", "module"] }],
  ["SD-D11-03", "D11", "exact", "Which module registers the predicate RECORD_LAST_UPDATED and what kind is it?", { kind: "predicate", name: "RECORD_LAST_UPDATED", fields: ["kind", "registrar", "subjectTypes"] }],
  ["SD-D11-04", "D11", "negative", "Is SourceDiscoveryRecord a node type in this release? If not, what is it called now?", { kind: "absent", name: "SourceDiscoveryRecord", in: "node", replacementTypes: ["CaptureAttempt"] }],
  ["SD-D12-01", "D12", "exact", "Give the identity keys of FoodItem.", { kind: "node", name: "FoodItem", fields: ["identityKeys", "identifierSchemes"] }],
  ["SD-D12-02", "D12", "paraphrase", "Which node type defines a dietary pattern such as a Mediterranean diet as a source defines it?", { kind: "node", name: "DietaryPattern", fields: ["uidToken", "identityKeys"] }],
  ["SD-D12-03", "D12", "exact", "Describe FOOD_CONTAINS: endpoints, class and edge-property type.", { kind: "relationship", type: "FOOD_CONTAINS", fields: ["from", "to", "class", "edgeProperties"] }],
  ["SD-D12-04", "D12", "negative", "Is FoodProduct a node type in this release? If not, which types carry foods and packaged products?", { kind: "absent", name: "FoodProduct", in: "node", replacementTypes: ["FoodItem", "Product"] }],
  ["SD-D13-01", "D13", "exact", "Give the identity keys of Event.", { kind: "node", name: "Event", fields: ["identityKeys", "uidToken"] }],
  ["SD-D13-02", "D13", "paraphrase", "Which vocabulary node type groups events and studies by research area, for example senolytics?", { kind: "node", name: "Frontier", fields: ["uidToken", "identityKeys"] }],
  ["SD-D13-03", "D13", "exact", "Describe INVOLVES: endpoints, class and edge-property type.", { kind: "relationship", type: "INVOLVES", fields: ["from", "to", "class", "edgeProperties"] }],
  ["SD-D13-04", "D13", "negative", "Can an Event have eventStatus ANNOUNCED? List the allowed EventStatus values.", { kind: "enum", name: "EventStatus", mustNotContain: ["ANNOUNCED"] }],
  ["SD-X-01", "D6", "cross-domain", "Trace the schema path from a supplement Product to the defined chemical its label declares. Give each relationship type and node type in order.", { kind: "path", hops: [["HAS_VARIANT", "Product", "ProductVariant"], ["HAS_PACKAGE", "ProductVariant", "Package"], ["HAS_LABEL_VERSION", "Package", "LabelVersion"], ["DECLARES_COMPONENT", "LabelVersion", "IngredientMaterial"], ["REALIZES_SUBSTANCE", "IngredientMaterial", "ChemicalSubstance"]], modules: ["D6", "D1"] }],
  ["SD-X-02", "D4", "cross-domain", "Trace the schema path from a LabTest to the Biomarker it ultimately measures.", { kind: "path", hops: [["MEASURES_METRIC", "LabTest", "Metric"], ["QUANTIFIES", "Metric", "Biomarker"]], modules: ["D4"] }],
  ["SD-X-03", "K", "cross-domain", "Trace from an Assertion to the Source whose capture supports it, naming every relationship and its direction.", { kind: "path", hops: [["HAS_EVIDENCE", "Assertion", "SourceLocator"], ["HAS_LOCATOR", "SourceSnapshot", "SourceLocator", "reverse"], ["HAS_SNAPSHOT", "Source", "SourceSnapshot", "reverse"]], modules: ["K"] }],
  ["SD-X-04", "D3", "cross-domain", "Trace the schema path from a Study to a Biomarker that one of its outcomes measures.", { kind: "path", hops: [["HAS_OUTCOME", "Study", "OutcomeDefinition"], ["MEASURES", "OutcomeDefinition", "Biomarker"]], modules: ["D3", "D4"] }],
  ["SD-X-05", "D6", "cross-domain", "Trace the schema path from a MerchantListing to the Organization that is the seller of record.", { kind: "path", hops: [["HAS_OFFER", "MerchantListing", "Offer"], ["SELLER_OF_RECORD", "Offer", "Organization"]], modules: ["D6", "D7"] }],
  ["SD-X-06", "D13", "cross-domain", "Trace the schema path from an Event to the Organization that issued the regulatory record documenting it.", { kind: "path", hops: [["DOCUMENTED_BY_RECORD", "Event", "RegulatoryRecord"], ["ISSUED_BY", "RegulatoryRecord", "Organization"]], modules: ["D13", "D8", "D7"] }],
  ["SD-X-07", "D5", "cross-domain", "Trace the schema path from a Protocol to whatever one of its steps uses.", { kind: "path", hops: [["HAS_EDITION", "Protocol", "ProtocolEdition"], ["HAS_STEP", "ProtocolEdition", "ProtocolStep"], ["STEP_USES", "ProtocolStep", "Subjectable"]], modules: ["D5"] }],
  ["SD-X-08", "D9", "cross-domain", "Which relationships connect a Chunk to the snapshot it was cut from and to the entities it mentions? Give class for each.", { kind: "path", hops: [["CHUNK_OF", "Chunk", "SourceSnapshot"], ["MENTIONS", "Chunk", "Subjectable"]], modules: ["D9", "K"] }],
  ["SD-X-09", "D7", "cross-domain", "Which registered predicate says an Organization distributes a Product? Give its kind and endpoint types.", { kind: "predicate", name: "DISTRIBUTES", fields: ["kind", "subjectTypes", "objectTypes", "registrar"] }],
  ["SD-X-10", "D4", "cross-domain", "Is there a direct relationship from a Product to the Biomarker its test measures? If not, give the path.", { kind: "path", noDirect: ["Product", "Biomarker"], hops: [["DELIVERS", "Product", "LabTest"], ["MEASURES_METRIC", "LabTest", "Metric"], ["QUANTIFIES", "Metric", "Biomarker"]], modules: ["D6", "D4"] }],
];

// ---------------------------------------------------------------- write / recovery
// shape: [id, category, critical, gates, prompt, goldSpec]
const WR = [
  ["WR-01", "supported-proposal", true, ["B"], "Using fixture graph ${FIXTURE_GRAPH_ID}, record the fixture's MEASURES_METRIC assertion for the Labcorp HbA1c test with its locator evidence through the native ingest route, then read back every intended effect.", { kind: "outcome", outcome: "applied", invariants: ["assertedEdgeBacked", "assertion.evidence", "receipt.complete"] }],
  ["WR-02", "provenance", true, ["B"], "Submit an assertion.relate proposal whose evidence locator digest does not match any custody artifact. Report what the service returns.", { kind: "error", code: "EVIDENCE_UNVERIFIED" }],
  ["WR-03", "admission", true, ["B"], "Call apply with a plan whose statements were edited by the caller after planning. Report the outcome.", { kind: "error", code: "PLAN_FORGED" }],
  ["WR-04", "admission", true, ["B"], "Call apply with a valid planRef but a different expectedPlanDigest. Report the outcome.", { kind: "error", code: "PLAN_DIGEST_MISMATCH" }],
  ["WR-05", "admission", true, ["B"], "Submit an intent whose snapshotRef basis names a read snapshot that is not in custody. Report the outcome.", { kind: "error", code: "SNAPSHOT_UNVERIFIED" }],
  ["WR-06", "provenance", true, ["B"], "Submit an adjudication proposal with an agent-written verdict and no sealed verification reference. Report the outcome.", { kind: "error", code: "EVIDENCE_UNVERIFIED" }],
  ["WR-07", "recovery", true, ["B", "E"], "Apply the same intent twice with the same effectKey and identical bytes. Report both outcomes and receipt ids.", { kind: "outcome", outcome: "duplicate", invariants: ["receipt.sameId", "noNewEffects"] }],
  ["WR-08", "recovery", true, ["B"], "Reuse an applied effectKey with a changed payload. Report the outcome.", { kind: "error", code: "EFFECT_CONFLICT" }],
  ["WR-09", "concurrency", true, ["B"], "Run two concurrent intents that both create the same identity (same scheme/value identifier). Report each outcome and the final node count for that identity.", { kind: "race", oneOf: ["applied"], otherOneOf: ["IDENTITY_CONFLICT", "STALE_REVISION", "STALE_PRECONDITION"], invariants: ["identity.single"] }],
  ["WR-10", "temporal", true, ["B"], "Record two overlapping exclusive episodes for the same subject, slot and asserter. Report the outcome of the second.", { kind: "error", code: "SLOT_CONFLICT" }],
  ["WR-11", "temporal", false, ["B"], "Record two overlapping exclusive episodes for the same subject and slot from two different asserters. Report both outcomes.", { kind: "outcome", outcome: "applied", invariants: ["episodes.bothRetained"] }],
  ["WR-12", "concurrency", true, ["B"], "Apply a plan made against graph revision N after another canonical write advanced the revision. Report the outcome.", { kind: "error", code: "STALE_REVISION" }],
  ["WR-13", "recovery", true, ["B"], "Force a failed attempt to race with a committed apply of the same effect. Report the final marker status and attempt history.", { kind: "marker", status: "applied", invariants: ["marker.attemptsAppended", "marker.notOverwritten"] }],
  ["WR-14", "recovery", true, ["B", "E"], "Drop the apply response after commit, then recover using the original effect, intent and plan identities. Report how you established the result.", { kind: "outcome", outcome: "applied", invariants: ["receipt.lookupFirst", "noNewEffects", "noNewIntentId"] }],
  ["WR-15", "admission", true, ["B", "E"], "Apply with an admission witness older than its expiry. Report the outcome.", { kind: "error", code: "WITNESS_EXPIRED" }],
  ["WR-16", "admission", true, ["B", "E"], "Apply with an admission witness whose revocationGeneration was revoked. Report the outcome.", { kind: "error", code: "WITNESS_REVOKED" }],
  ["WR-17", "partial", true, ["B"], "Request partial apply of a proposal subset that is not closed under its dependencies, then of a closed subset. Report both outcomes.", { kind: "sequence", steps: [{ kind: "outcome", outcome: "rejected" }, { kind: "outcome", outcome: "partial" }] }],
  ["WR-18", "verification", true, ["B"], "Apply an intent with more effects than one readback page and verify every effect. Report pages read and the verification result.", { kind: "outcome", outcome: "applied", invariants: ["readback.allPages", "readback.complete"] }],
  ["WR-19", "temporal", true, ["B"], "Attempt an assertion whose recordedAt would precede the cited snapshot's retrievedAt. Report the outcome.", { kind: "error", code: "STALE_PRECONDITION" }],
  ["WR-20", "admission", true, ["B"], "Submit an intent pinned to a schemaReleaseDigest other than ${SCHEMA_RELEASE_DIGEST}. Report the outcome.", { kind: "error", code: "RELEASE_MISMATCH" }],
  ["WR-21", "boundary", true, ["E"], "Send the WR-01 intent through the Mission Control envelope mc.knowledge_request.v1 and compare the native payload digest before and after the wrapper.", { kind: "invariant", invariants: ["payloadDigest.equal"] }],
  ["WR-22", "boundary", true, ["E"], "Complete verification for an operation whose graph admission is held. Report how the result distinguishes verified from applied.", { kind: "outcome", outcome: "unresolved", invariants: ["verification.distinctFromAdmission", "noNewEffects"] }],
  ["WR-23", "boundary", true, ["E"], "Cancel a request after its commit. Report what the receipt says about the effect and how recovery stays possible.", { kind: "outcome", outcome: "applied", invariants: ["receipt.effectReported", "recovery.retained"] }],
  ["WR-24", "capability", false, ["E"], "Ask the service for native chunk-vector retrieval. Report the result.", { kind: "status", status: "unsupported", invariants: ["notEmpty"] }],
  ["WR-25", "read-safety", true, ["B"], "Submit a Cypher read intent containing a write clause, then one calling a procedure outside the read allowlist. Report both outcomes.", { kind: "sequence", steps: [{ kind: "error", code: "PARSE_REJECTED" }, { kind: "error", code: "PROCEDURE_FORBIDDEN" }] }],
  ["WR-26", "capability", true, ["E"], "Ask biotech-graph-analyze for community detection over all organizations. Report the result.", { kind: "status", status: "unsupported", invariants: ["notEmpty", "evidence.gdsInstalledNotAdmitted"] }],
  ["WR-27", "analytics-safety", true, ["B"], "Request that analytics results be written back with gds.louvain.write. Report the outcome.", { kind: "status", status: "unsupported", invariants: ["noGraphWrites"] }],
  ["WR-28", "provenance", true, ["B"], "Try to record a predicted similarity score as an ordinary sourced assertion. Report the outcome.", { kind: "error", code: "UNSUPPORTED" }],
  ["WR-29", "migration", true, ["F"], "Using the custody export ${EXPORT_ID}, restore into a disposable database and verify it. Report check totals and whether elementIds were preserved.", { kind: "migrationRun", invariants: ["verify.allChecks", "elementIds.notPreserved", "legacyKey.preserved"] }],
  ["WR-30", "migration", true, ["F"], "Dry-run migration run ${MIGRATION_RUN_ID} on the restored copy. Report invariant totals, accounting reconciliation and whether any held record appears as a v2 fact.", { kind: "migrationRun", invariants: ["dryRun.allInvariants", "accounting.reconciles", "held.notVisible"] }],
  ["WR-31", "read-safety", true, ["B"], "As a reader scoped to one tenant, filter and count assertions that belong to another scope. Report the outcome.", { kind: "error", code: "VISIBILITY_DENIED" }],
  ["WR-32", "read-safety", true, ["B"], "Run a stable_revision read during which the graph revision changes and the driver retries. Report the outcome and whether rows from the abandoned attempt appear.", { kind: "status", status: "stale", invariants: ["retryBuffer.reset"] }],
  ["WR-33", "migration", true, ["F"], "After migration run ${MIGRATION_RUN_ID}, report how many legacy nodes and relationships were deleted.", { kind: "migrationRun", invariants: ["legacy.nodesRetained", "legacy.relationshipsRetained", "nodesDeleted.zero"] }],
];

// ---------------------------------------------------------------- native read: deterministic fixture selection
function fixtureRows() {
  const out = [];
  for (const mod of fs.readdirSync(FIX).filter((d) => fs.statSync(path.join(FIX, d)).isDirectory()).sort()) {
    for (const f of fs.readdirSync(path.join(FIX, mod)).sort()) {
      const p = path.join(FIX, mod, f, "assertions.yaml");
      if (!fs.existsSync(p)) continue;
      const a = YAML.parse(fs.readFileSync(p, "utf8"));
      const ents = new Map((a.entities ?? []).map((e) => [e.ref, e]));
      const uidOf = (x) => (x && typeof x === "object" ? x.uid ?? ents.get(x.ref)?.uid : null);
      const nameOf = (x) => (x && typeof x === "object" ? ents.get(x.ref)?.name ?? x.name ?? null : null);
      const rows = (a.assertions ?? [])
        .filter((x) => x.id && x.predicate && uidOf(x.subject) && uidOf(x.object) && (x.edgeClass === "asserted" || x.assertionKind === "RELATIONSHIP"))
        .map((x) => ({ ...x, _subjectUid: uidOf(x.subject), _subjectName: nameOf(x.subject) }));
      const idents = (a.entities ?? []).filter((e) => e.uid && e.identifiers?.length && e.identifiers[0].scheme && e.identifiers[0].value);
      out.push({ mod, fixture: `${mod}/${f}`, rows, idents });
    }
  }
  return out;
}
function nativeRead() {
  const fx = fixtureRows();
  const tasks = [];
  const mods = ["K", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13", "cross-domain"];
  // 1) one trace task per module that has an asserted row (first by fixture name, then row id)
  for (const m of mods) {
    const cand = fx.filter((x) => x.mod === m && x.rows.length).flatMap((x) => x.rows.map((r) => ({ fixture: x.fixture, r })));
    cand.sort((a, b) => (a.fixture + a.r.id < b.fixture + b.r.id ? -1 : 1));
    // at most two per module, from different fixtures when possible
    const picked = [];
    for (const c of cand) if (picked.length < 2 && !picked.some((p) => p.fixture === c.fixture)) picked.push(c);
    for (const c of cand) if (picked.length < 2 && !picked.includes(c)) picked.push(c);
    picked.forEach(({ fixture, r }, i) => {
      const type = r.subject?.type ?? "subject";
      const start = r._subjectName ? `the ${type} "${r._subjectName}"` : `the ${type} ${r._subjectUid}`;
      const history = Boolean(r.validTime?.validFrom);
      tasks.push({
        id: `NR-T-${m}-${i + 1}`,
        module: m,
        category: history ? "history" : "trace",
        fixture,
        prompt: `Fixture graph \${FIXTURE_GRAPH_ID} is loaded from fixture ${fixture}. Starting from ${start}, follow its ${r.predicate} assertion (fixture row ${r.id}) and return the object uid, the asserter uid, the assertion status and every supporting locator with its snapshot and source.${history ? " Also report the validity interval and its basis." : ""} Use native reads only.`,
        gold: { kind: "fixtureAssertion", fixture, rowId: r.id },
      });
    });
  }
  // 2) identifier resolution: one per module with identifier-bearing entities, until 30 tasks overall with the fixed tail
  for (const m of mods) {
    const cand = fx.filter((x) => x.mod === m).flatMap((x) => x.idents.map((e) => ({ fixture: x.fixture, e })));
    cand.sort((a, b) => (a.fixture + a.e.ref < b.fixture + b.e.ref ? -1 : 1));
    if (!cand.length) continue;
    const { fixture, e } = cand[0];
    const id0 = e.identifiers[0];
    tasks.push({ id: `NR-R-${m}`, module: m, category: "resolve", fixture, prompt: `Fixture graph \${FIXTURE_GRAPH_ID} is loaded from fixture ${fixture}. Resolve the identifier scheme ${id0.scheme} value ${id0.value} to its node and report the uid, node type and resolution basis.`, gold: { kind: "fixtureEntity", fixture, ref: e.ref, basis: "identifier" } });
  }
  // 3) fixed status/negative/migration tail (gold from INTERFACES.md or bound at run time from the migration manifest)
  const tail = [
    { id: "NR-S-01", module: "K", category: "negative", prompt: "Read the card of uid hu:org:does-not-exist-eval. Report the read status and whether that means the entity is known to be absent.", gold: { kind: "readStatus", status: "empty", note: "no known record, not failed" } },
    { id: "NR-S-02", module: "K", category: "negative", prompt: "Run a neighbours read whose result exceeds the configured row limit. Report the status and the truncation information.", gold: { kind: "readStatus", status: "truncated" } },
    { id: "NR-S-03", module: "K", category: "negative", prompt: "Read while the database is unreachable. Report the status; do not report an empty answer.", gold: { kind: "readStatus", status: "failed" } },
    { id: "NR-M-01", module: "D7", category: "migration", prompt: "On the migration rehearsal graph for run ${MIGRATION_RUN_ID}, count the HOLDS_ROLE assertions the run created and report their status.", gold: { kind: "manifestPointer", pointer: "/expected/assertionsByPredicate/HOLDS_ROLE", status: "EXTRACTED" } },
    { id: "NR-M-02", module: "D7", category: "migration", prompt: "On the migration rehearsal graph, how many Organization-labelled nodes lack a uid? Report the count and why.", gold: { kind: "literal", value: 0, reason: "legacy rows are relabeled LegacyV0_Organization" } },
    { id: "NR-M-03", module: "K", category: "migration", prompt: "Trace any migrated HOLDS_ROLE assertion to its source and report the source kind and the snapshot content hash.", gold: { kind: "manifestPointer", pointer: "/source/exportDigest", sourceKind: "DATASET" } },
    { id: "NR-M-04", module: "D8", category: "migration", prompt: "On the migration rehearsal graph, how many LegalStatus nodes did run ${MIGRATION_RUN_ID} create, and why are the others absent?", gold: { kind: "manifestPointer", pointer: "/expected/v2NodesByLabel/LegalStatus", reason: "held: status code not mappable without a reviewed RegulatoryRecord" } },
    { id: "NR-M-05", module: "D4", category: "migration", prompt: "Which Biomarker does each migrated Metric quantify? Report the answer state honestly.", gold: { kind: "readStatus", status: "empty", reason: "QUANTIFIES is held resolution work (curated Biomarker)" } },
  ];
  const all = [...tasks, ...tail];
  return all;
}

// ---------------------------------------------------------------- write
function suiteFiles() {
  const sd = { tasks: SD.map(([id, module, category, prompt]) => ({ id, module, category, prompt: `${ctxLine} ${prompt}`, answerShape: "answer.json {answer, citations[{cardId, releaseDigest}], hits[ranked cardIds, <=10]}" })), gold: Object.fromEntries(SD.map(([id, , , , g]) => [id, g])) };
  const nrAll = nativeRead();
  const nr = { tasks: nrAll.map(({ gold, ...t }) => ({ ...t, answerShape: "answer.json {status, uids{}, trace{}, consistency{mode}, queryDigest, resultDigest}" })), gold: Object.fromEntries(nrAll.map((t) => [t.id, t.gold])) };
  const wr = { tasks: WR.map(([id, category, critical, gates, prompt]) => ({ id, category, critical, gates, prompt, answerShape: "answer.json {outcome|error|status, receiptIds[], effectKey, invariants{}}" })), gold: Object.fromEntries(WR.map(([id, , , , , g]) => [id, g])) };
  const meta = (suite, n) => ({ format: "bks-eval-tasks.v1", suite, frozenAt: "2026-10-11", bindings: BINDINGS, count: n, inputs: "schema/program/final/** at BKS 431c8a7 (SDL sha256:c7cf1235...), INTERFACES.md v0", goldFile: "gold-spec.json (never mounted for the agent)" });
  return {
    "schema-discovery": { tasks: { ...meta("schema-discovery", sd.tasks.length), tasks: sd.tasks }, gold: { format: "bks-eval-gold-spec.v1", suite: "schema-discovery", gold: sd.gold } },
    "native-read": { tasks: { ...meta("native-read", nr.tasks.length), tasks: nr.tasks }, gold: { format: "bks-eval-gold-spec.v1", suite: "native-read", gold: nr.gold } },
    "write-recovery": { tasks: { ...meta("write-recovery", wr.tasks.length), tasks: wr.tasks }, gold: { format: "bks-eval-gold-spec.v1", suite: "write-recovery", gold: wr.gold } },
  };
}

const files = suiteFiles();
const check = process.argv.includes("--check");
let drift = 0;
for (const [suite, { tasks, gold }] of Object.entries(files)) {
  const dir = path.join(HERE, suite);
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, obj] of [["tasks.json", tasks], ["gold-spec.json", gold]]) {
    const text = JSON.stringify(JSON.parse(canonical(obj)), null, 2) + "\n";
    const file = path.join(dir, name);
    if (check) {
      if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== text) {
        drift++;
        console.error(`drift: ${suite}/${name}`);
      }
    } else fs.writeFileSync(file, text);
  }
}
const counts = Object.fromEntries(Object.entries(files).map(([k, v]) => [k, v.tasks.count]));
console.log(JSON.stringify({ ok: drift === 0, mode: check ? "check" : "write", counts }));
process.exit(drift ? 1 : 0);
