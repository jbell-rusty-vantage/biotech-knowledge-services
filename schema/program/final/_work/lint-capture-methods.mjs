#!/usr/bin/env node
// FU-06 lint (close-out round 2026-10-09; read-only): does each fixture SourceSnapshot.captureMethod start with an action-space
// registry id (final/tooling/action-space.yaml entries[].id, the "<id>/<version>" convention of R-39) or a packet-local alias?
// Scans final/fixtures/**/{assertions.yaml,locators.yaml,intent*.json}. Prints a summary; --list prints every distinct non-canonical value.
//   node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-capture-methods.mjs [--list]
// Exit code 0 always (measurement; the rewrite is FU-06 work for the fixture owners).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const S = 'C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S';
const YAML = createRequire(`${S}/packages/schema-workspace/package.json`)('yaml');
const as = YAML.parse(readFileSync(`${S}/schema/program/final/tooling/action-space.yaml`, 'utf8'));
const ids = new Set(as.entries.map((e) => e.id));
const aliasLocal = new Map(Object.entries(as.aliases ?? {}).map(([k, v]) => [k.replace(/^[A-Z0-9]+:/, ''), v]));
const root = `${S}/schema/program/final/fixtures`;
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(root).filter((f) => /(assertions\.yaml|locators\.yaml|intent[^\/\\]*\.json)$/.test(f));
const res = { values: 0, canonical: 0, aliasPrefix: 0, none: 0, byFile: {}, distinct: new Map() };
for (const f of files) {
  const t = readFileSync(f, 'utf8');
  for (const m of t.matchAll(/captureMethod"?\s*:\s*("(?:[^"\\]|\\.)*"|'[^']*'|[^\n,}]+)/g)) {
    let v = m[1].trim().replace(/^["']|["']$/g, '');
    const prefix = v.split(/[\/\s(]/)[0];
    const cls = ids.has(prefix) ? 'canonical' : aliasLocal.has(prefix) ? 'aliasPrefix' : 'none';
    res.values++; res[cls]++;
    const k = f.slice(root.length + 1).split(/[\\/]/)[0];
    res.byFile[k] = res.byFile[k] ?? { canonical: 0, aliasPrefix: 0, none: 0 }; res.byFile[k][cls]++;
    res.distinct.set(v, cls);
  }
}
const d = [...res.distinct.entries()];
console.log(JSON.stringify({ files: files.length, values: res.values, canonical: res.canonical, aliasPrefix: res.aliasPrefix, none: res.none, byPacket: res.byFile, distinct: d.length, distinctCanonical: d.filter(([, c]) => c === "canonical").length, distinctAlias: d.filter(([, c]) => c === "aliasPrefix").length }, null, 1));
if (process.argv.includes("--list")) for (const [v, c] of d.filter(([, c]) => c !== "canonical").sort()) console.log(`${c}	${v}`);
