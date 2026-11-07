/**
 * Size metrics for the release (OD-01, OD-46): the counting rules of schema/program/final/_work/count-schema.mjs,
 * re-implemented over the release assembly manifest (module of each definition, not banner-name guessing).
 *   collapsed (R-01 option A, the adopted acceptance metric, budget <= 600): an interface target counts once, inverse
 *     declarations are not doubled, a union target counts once per member;
 *   expanded (R-01 option B, published, regression baseline 848): one pair per implementer of an interface target.
 * Module attribution: ASSESSES, DERIVED_FROM, MENTIONS and RENDITION_OF (kernel meaning) count in K; any other type in
 * the first module (assembly order) that declares a field with it. K's 15 relationship types are a documented
 * one-type exception against the original 14 (OD-46).
 */
const KERNEL_MEANING = ["ASSESSES", "DERIVED_FROM", "MENTIONS", "RENDITION_OF"];
const BASELINE = { nodeTypes: 69, relationshipTypes: 106, pairsCollapsed: 181, pairsExpanded: 848, widestUnion: 5 };

export function buildMetrics({ model, manifest }) {
  const order = manifest.modules.map((m) => m.id);
  const perModule = Object.fromEntries(order.map((m) => [m, { nodeTypes: 0, relationshipTypes: 0, pairsCollapsed: 0, pairsExpanded: 0 }]));
  for (const n of model.nodes.values()) perModule[n.module].nodeTypes++;
  const owner = {};
  let collapsed = 0;
  let expanded = 0;
  const usedUnions = new Map();
  for (const [type, r] of model.relTypes) {
    owner[type] = KERNEL_MEANING.includes(type) ? "K" : order.find((m) => r.modules.has(m));
    perModule[owner[type]].relationshipTypes++;
    perModule[owner[type]].pairsCollapsed += r.collapsed.size;
    perModule[owner[type]].pairsExpanded += r.expanded.size;
    collapsed += r.collapsed.size;
    expanded += r.expanded.size;
    for (const f of r.fields) if (model.unions.has(f.target)) usedUnions.set(f.target, model.unions.get(f.target).length);
  }
  const widest = [...usedUnions.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] ?? null;
  const interfaces = [...model.interfaces.values()].map((i) => ({ name: i.name, implementers: i.implementers.length })).sort((a, b) => a.name.localeCompare(b.name));
  const metrics = {
    format: "bks-release-metrics.v1",
    rules: {
      acceptance: "collapsed semantic pairs <= 600 (OD-01, R-01 option A); the old expanded <= 600 rule is retired and is never described as met",
      expanded: "published; regression baseline 848 at the candidate; an increase needs a question/fixture and a measured API cost (OD-01)",
      kernelException: "K counts kernel-meaning types once (ASSESSES, DERIVED_FROM, MENTIONS, RENDITION_OF); K = 15 relationship types accepted against the original 14 as a one-type exception (OD-46)",
      subjectable: "useful interface relationships are retained; no Subjectable implementer is removed to meet a superseded metric (OD-01, FU-12)",
    },
    nodeTypes: model.nodes.size,
    relationshipTypes: model.relTypes.size,
    pairsCollapsed: collapsed,
    pairsExpanded: expanded,
    collapsedBudget: 600,
    collapsedWithinBudget: collapsed <= 600,
    expandedBaseline: BASELINE.pairsExpanded,
    expandedDeltaVsBaseline: expanded - BASELINE.pairsExpanded,
    widestUnionAsTarget: widest ? { union: widest[0], members: widest[1] } : null,
    unions: model.unions.size,
    enums: model.enums.size,
    interfaces,
    perModule,
    kernelRelationshipTypes: perModule.K?.relationshipTypes ?? 0,
    kernelException: { count: perModule.K?.relationshipTypes ?? 0, original: 14, accepted: 15, decision: "OD-46" },
    baseline: BASELINE,
    relationshipOwner: owner,
    notMeasuredHere: "executable input types, printed size and build time are GraphQL-runtime measurements (S6, size-report.md method); they are hard gates outside this release generator",
  };
  const problems = [];
  if (metrics.nodeTypes !== BASELINE.nodeTypes) problems.push(`node types ${metrics.nodeTypes} != baseline ${BASELINE.nodeTypes}`);
  if (metrics.relationshipTypes !== BASELINE.relationshipTypes) problems.push(`relationship types ${metrics.relationshipTypes} != baseline ${BASELINE.relationshipTypes}`);
  if (collapsed > 600) problems.push(`collapsed pairs ${collapsed} exceed the adopted budget 600`);
  if (metrics.kernelRelationshipTypes > 15) problems.push(`K has ${metrics.kernelRelationshipTypes} relationship types; only the 15-type exception is accepted`);
  return { metrics, problems };
}
