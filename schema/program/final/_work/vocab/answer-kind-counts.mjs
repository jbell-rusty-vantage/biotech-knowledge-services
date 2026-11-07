// Count D10's answer-kind table and check it against the packets' current 02-questions.md.
// usage: node answer-kind-counts.mjs <worktree> <out.json>
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

const wt = process.argv[2];
const P = (p) => resolve(wt, "schema/program", p);
const tablePath = P("packets/D10/answer-kind-table.md");
const text = readFileSync(tablePath, "utf8");
const lines = text.split(/\r?\n/);
const start = lines.findIndex((l) => l.startsWith("## Table"));
const cells = (l) => l.split("|").slice(1, -1).map((c) => c.trim());
const rows = [];
for (const l of lines.slice(start)) {
  if (!l.startsWith("| ") || l.startsWith("| id ") || l.startsWith("| ---")) continue;
  const c = cells(l);
  if (c.length < 11) continue;
  const [id, packet, question, audience, value, polarity, declared, ruling, trace, freshness, note] = c;
  const kind = ruling.replace(/⚑/g, "").replace(/\+\s*published variant/, "").replace(/[()]/g, "").trim();
  rows.push({ id, packet, audience: audience.split(/,\s*/), value: Number(value), polarity, declared, ruling: kind, publishedVariant: /published variant/.test(ruling), disagreement: note.includes("⚑") || declared !== kind, note });
}
const KINDS = ["retrieved", "materialized", "assessment", "published"];
const count = (arr, key) => Object.fromEntries(KINDS.map((k) => [k, arr.filter((r) => r[key] === k).length]));
const PACKETS = ["K", ...Array.from({ length: 13 }, (_, i) => `D${i + 1}`)];
const byPacket = Object.fromEntries(PACKETS.map((p) => { const rs = rows.filter((r) => r.packet === p); return [p, { rows: rs.length, ...count(rs, "ruling"), disagreements: rs.filter((r) => r.declared !== r.ruling).length }]; }));
const AUD = ["biohacker", "investor", "researcher", "agent"];
const byAudience = Object.fromEntries(AUD.map((a) => { const rs = rows.filter((r) => r.audience.includes(a)); return [a, { rowsTagged: rs.length, listedFirst: rows.filter((r) => r.audience[0] === a).length, ...count(rs, "ruling") }]; }));
const byPolarity = Object.fromEntries(["benefit", "harm", "neutral"].map((p) => { const rs = rows.filter((r) => r.polarity === p); return [p, { rows: rs.length, ...count(rs, "ruling") }]; }));
const byValue = Object.fromEntries([1, 2, 3].map((v) => { const rs = rows.filter((r) => r.value === v); return [v, { rows: rs.length, ...count(rs, "ruling") }]; }));
const distinct = new Set(rows.map((r) => r.id));
const shared = [...distinct].filter((id) => rows.filter((r) => r.id === id).length > 1);
const sharedKindConflicts = shared.filter((id) => new Set(rows.filter((r) => r.id === id).map((r) => r.declared)).size > 1);
const sharedRulingConflicts = shared.filter((id) => new Set(rows.filter((r) => r.id === id).map((r) => r.ruling)).size > 1);

// drift: table's declared kind vs the packet's current 02-questions.md
const drift = [];
const missingInTable = [];
for (const p of PACKETS) {
  const f = P(`packets/${p}/02-questions.md`);
  if (!existsSync(f)) continue;
  const ql = readFileSync(f, "utf8").split(/\r?\n/);
  const hdrIdx = ql.findIndex((l) => /^\| id \|/.test(l));
  const hdr = cells(ql[hdrIdx]);
  const ki = hdr.findIndex((h) => h === "answer kind");
  for (const l of ql.slice(hdrIdx + 2)) {
    if (!l.startsWith("| ")) continue;
    const c = cells(l);
    const id = c[0];
    if (!/^(Q|CQ)-/.test(id)) continue;
    const k = (c[ki] || "").toLowerCase();
    const t = rows.find((r) => r.id === id && r.packet === p);
    if (!t) { missingInTable.push(`${p}:${id}`); continue; }
    const declaredNow = KINDS.find((x) => k.startsWith(x)) || k;
    if (declaredNow !== t.declared) drift.push({ packet: p, id, tableDeclared: t.declared, packetNow: k.slice(0, 80), tableRuling: t.ruling });
  }
}
const extraInTable = rows.filter((r) => {
  const f = P(`packets/${r.packet}/02-questions.md`);
  return !readFileSync(f, "utf8").includes(`| ${r.id} |`);
}).map((r) => `${r.packet}:${r.id}`);

const out = {
  table: "packets/D10/answer-kind-table.md",
  sha256: createHash("sha256").update(text).digest("hex"),
  rows: rows.length, distinctIds: distinct.size, sharedIds: shared.length,
  declared: count(rows, "declared"), ruling: count(rows, "ruling"),
  disagreements: rows.filter((r) => r.declared !== r.ruling).map((r) => `${r.packet}:${r.id} ${r.declared}->${r.ruling}`),
  publishedVariants: rows.filter((r) => r.publishedVariant).map((r) => `${r.packet}:${r.id}`),
  sharedKindConflicts, sharedRulingConflicts,
  byPacket, byAudience, byPolarity, byValue,
  drift, missingInTable, extraInTable,
  kindById: Object.fromEntries(rows.map((r) => [`${r.packet}:${r.id}`, r.ruling])),
  specific: Object.fromEntries(["Q-D11-22", "Q-D12-20", "CQ-CL-06", "Q-D9-08", "Q-D9-19", "CQ-PF-03", "CQ-AX-08", "Q-K-24"].map((id) => [id, rows.filter((r) => r.id === id).map((r) => `${r.packet}: declared ${r.declared}, ruling ${r.ruling}`)])),
};
writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
console.log(JSON.stringify({ rows: out.rows, distinctIds: out.distinctIds, sharedIds: out.sharedIds, declared: out.declared, ruling: out.ruling, nDisagreements: out.disagreements.length, publishedVariants: out.publishedVariants.length, sharedKindConflicts, sharedRulingConflicts, byPolarity, byValue, drift: out.drift, missingInTable, extraInTable, specific: out.specific }, null, 1));
