import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { TemplateRunResult } from "./catalog-run.js";
import type { CatalogTemplates } from "./templates.js";

/**
 * Regenerated 454-question status (FU-04 / FU-10). `supported` now means: at least one release template of the
 * question was EXECUTED through the read service against the fixture graph with result assertions (a fixture-positive
 * binding, exact output columns, and an absent binding that does not fail and differs), or the question is answered by
 * an S4 route verified with gold assertions (typed operation / proposed template, Enterprise evidence). EXPLAIN alone
 * no longer counts. Questions whose templates only ran empty are `held` with the reason; nothing is fabricated.
 */

export const GOLD_TEMPLATES = ["QP/P-01b", "D1/CQ-ID-04", "K/Q-K-17", "D6/Q-D6-01#1"];

export interface Promotion {
  questionId: string;
  route: string;
  test: string;
  verified: boolean;
  detail?: string;
}

export interface QuestionStatusEntry {
  id: string;
  module: string;
  value: number | null;
  previous: string;
  status: "supported" | "held" | "unsupported";
  routes: string[];
  assertion: "gold" | "fixture-positive" | "typed-gold" | "proposed-template-gold" | "none";
  templates: Array<{ id: string; outcome: string }>;
  reason: string;
}

export interface QuestionStatus {
  format: "bks-s4-question-status.v1";
  releaseId: string;
  queryCatalogDigest: string;
  generatedAt: string;
  stamp: string;
  statusMeaning: string;
  counts: { questions: number; supported: number; held: number; unsupported: number; previous: Record<string, number>; promoted: number; demoted: number; valueOne: Record<string, number> };
  templateOutcomes: Record<string, number>;
  questions: QuestionStatusEntry[];
}

export function buildQuestionStatus(catalog: CatalogTemplates, runs: TemplateRunResult[], opts: { stamp: string; enterpriseEvidence?: string | null; promotions?: Promotion[] }): QuestionStatus {
  const byTemplate = new Map(runs.map((r) => [r.id, r]));
  let promotions = opts.promotions ?? [];
  if (opts.enterpriseEvidence && existsSync(opts.enterpriseEvidence)) {
    const ee = JSON.parse(readFileSync(opts.enterpriseEvidence, "utf8")) as { promotions?: Promotion[] };
    promotions = [...promotions, ...(ee.promotions ?? [])];
  }
  const promo = new Map<string, Promotion[]>();
  for (const p of promotions) promo.set(p.questionId, [...(promo.get(p.questionId) ?? []), p]);
  const questions: QuestionStatusEntry[] = catalog.questions.map((q) => {
    const tpl = (q.templates ?? []).map((id) => ({ id, outcome: byTemplate.get(id)?.outcome ?? (catalog.get(id) ? `not-run (${catalog.get(id)!.status})` : "missing") }));
    const pos = tpl.filter((t) => t.outcome === "fixture-positive");
    const verified = (promo.get(q.id) ?? []).filter((p) => p.verified);
    const base = { id: q.id, module: q.module, value: q.value ?? null, previous: q.status, templates: tpl };
    if (pos.length) {
      const gold = pos.some((t) => GOLD_TEMPLATES.includes(t.id));
      return { ...base, status: "supported", routes: [...pos.map((t) => `template:${t.id}`), ...verified.map((p) => p.route)], assertion: gold ? "gold" : "fixture-positive", reason: `executed with result assertions on the fixture graph: ${pos.map((t) => t.id).join(", ")}${gold ? " (gold: typed and template routes agree)" : ""}` };
    }
    if (verified.length) {
      const kind = verified.some((p) => p.route.startsWith("typed:")) ? "typed-gold" : "proposed-template-gold";
      return { ...base, status: "supported", routes: verified.map((p) => p.route), assertion: kind, reason: `answered by ${verified.map((p) => `${p.route} (${p.test})`).join("; ")}${kind === "proposed-template-gold" ? "; the proposed release template is in the S4 catalog patch" : ""}` };
    }
    if (q.status === "unsupported") return { ...base, status: "unsupported", routes: [], assertion: "none", reason: q.reason ?? "unsupported in the release catalog" };
    if (tpl.length && tpl.every((t) => t.outcome === "unsupported")) {
      const why = tpl.map((t) => byTemplate.get(t.id)?.reasons[0] ?? "").filter(Boolean)[0] ?? "";
      return { ...base, status: "unsupported", routes: [], assertion: "none", reason: `every template is unsupported by this release's capabilities: ${why}` };
    }
    if (tpl.length) {
      const why = tpl.map((t) => `${t.id}: ${t.outcome}${byTemplate.get(t.id)?.reasons[0] ? ` (${byTemplate.get(t.id)!.reasons[0]!.slice(0, 160)})` : ""}`).join("; ");
      return { ...base, status: "held", routes: [], assertion: "none", reason: `${q.status === "supported" ? "demoted from EXPLAIN-only supported: " : ""}no template produced a fixture-positive answer: ${why}` };
    }
    return { ...base, status: "held", routes: [], assertion: "none", reason: q.reason ?? "no release template" };
  });
  const count = (s: string) => questions.filter((x) => x.status === s).length;
  const previous: Record<string, number> = {};
  for (const q of catalog.questions) previous[q.status] = (previous[q.status] ?? 0) + 1;
  const valueOne: Record<string, number> = {};
  for (const q of questions.filter((x) => x.value === 1)) valueOne[q.status] = (valueOne[q.status] ?? 0) + 1;
  const templateOutcomes: Record<string, number> = {};
  for (const r of runs) templateOutcomes[r.outcome] = (templateOutcomes[r.outcome] ?? 0) + 1;
  return {
    format: "bks-s4-question-status.v1",
    releaseId: catalog.model.releaseId,
    queryCatalogDigest: catalog.model.queryCatalogDigest,
    generatedAt: new Date().toISOString(),
    stamp: opts.stamp,
    statusMeaning: "supported = executed through the native read service against the fixture graph with result assertions (template fixture-positive binding + exact columns + absent binding), or an S4 route verified with gold assertions; held = no executed positive answer yet (reason states which); unsupported = needs a capability this release disables (GDS/AGA, native vectors) or the release catalog marks unsupported",
    counts: { questions: questions.length, supported: count("supported"), held: count("held"), unsupported: count("unsupported"), previous, promoted: questions.filter((x) => x.previous !== "supported" && x.status === "supported").length, demoted: questions.filter((x) => x.previous === "supported" && x.status !== "supported").length, valueOne },
    templateOutcomes,
    questions,
  };
}

export function writeQuestionStatus(status: QuestionStatus, dir: string, base = "S4-question-status"): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, `${base}.json`), `${JSON.stringify(status, null, 2)}\n`);
  const lines: string[] = [];
  lines.push("# S4 question status (generated)", "");
  lines.push(`Generated by \`packages/kg-ops/src/read/read.integration.test.ts\` (run \`${status.stamp}\`, ${status.generatedAt}) from release \`${status.releaseId}\`, queryCatalogDigest \`${status.queryCatalogDigest}\`. Do not edit. Regenerate deliberately with \`BKS_S4_WRITE_QUESTION_STATUS=1\` (command in S4-native-reads.md); an ordinary suite run writes only \`runs/release-v2/s4/question-status-<stamp>.*\`.`, "");
  lines.push(`Meaning: ${status.statusMeaning}.`, "");
  lines.push("| status | now | release catalog (EXPLAIN-only) |", "| --- | --- | --- |");
  for (const s of ["supported", "held", "unsupported"]) lines.push(`| ${s} | ${(status.counts as unknown as Record<string, number>)[s]} | ${status.counts.previous[s] ?? 0} |`);
  lines.push("", `Promoted to supported: ${status.counts.promoted}. Demoted from EXPLAIN-only supported: ${status.counts.demoted}. Value-1 questions: ${JSON.stringify(status.counts.valueOne)}.`, "");
  lines.push(`Supported templates (${Object.values(status.templateOutcomes).reduce((a, b) => a + b, 0)}) by executed outcome: ${Object.entries(status.templateOutcomes).map(([k, v]) => `${k} ${v}`).join(", ")}.`, "");
  lines.push("## Supported questions", "", "| question | module | value | assertion | routes |", "| --- | --- | --- | --- | --- |");
  for (const q of status.questions.filter((x) => x.status === "supported")) lines.push(`| ${q.id} | ${q.module} | ${q.value ?? ""} | ${q.assertion} | ${q.routes.join(", ")} |`);
  lines.push("", "## Demoted (previously EXPLAIN-only supported)", "", "| question | reason |", "| --- | --- |");
  for (const q of status.questions.filter((x) => x.previous === "supported" && x.status !== "supported")) lines.push(`| ${q.id} | ${q.reason.replace(/\|/g, "/").slice(0, 400)} |`);
  lines.push("", `Held and unsupported questions with their reasons: \`${base}.json\`.`, "");
  writeFileSync(resolve(dir, `${base}.md`), lines.join("\n"));
}
