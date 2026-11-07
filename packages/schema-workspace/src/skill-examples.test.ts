/**
 * Executes the biotech-schema-explore skill examples (.agents/skills/biotech-schema-explore/examples/*.example.json)
 * through the bks-schema CLI entry point against a clean-room build of the pinned release (the packaged workspace),
 * never against the checked-in tree.
 */
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { build } from "./build.js";
import { main } from "./cli.js";
import { repoRoot } from "./load.js";
import { writeWorkspace } from "./render.js";

vi.setConfig({ testTimeout: 120_000, hookTimeout: 180_000 });

const examplesDir = resolve(repoRoot, ".agents", "skills", "biotech-schema-explore", "examples");
const exampleFiles = readdirSync(examplesDir).filter((f) => f.endsWith(".example.json")).sort();

interface Check {
  path: string;
  equals?: unknown;
  includes?: unknown;
  notIncludes?: unknown;
  exists?: boolean;
}
interface Example {
  id: string;
  kind: "positive" | "negative";
  steps: Array<{ argv: string[]; expect: { exit: number; stdoutIncludes?: string[]; json?: Check[] } }>;
}

let tmp: string;
let wsDir: string;

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "bks-skill-examples-"));
  wsDir = join(tmp, "workspace");
  writeWorkspace(build(), wsDir);
  process.env.BKS_SEMANTIC_CUSTODY_DIR = join(tmp, "no-semantic");
  process.env.BKS_SEMANTIC_ENABLED = "false";
});
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

export async function runCli(argv: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  const out: string[] = [];
  const err: string[] = [];
  const log = vi.spyOn(console, "log").mockImplementation((...a: unknown[]) => void out.push(`${a.map(String).join(" ")}\n`));
  const error = vi.spyOn(console, "error").mockImplementation((...a: unknown[]) => void err.push(`${a.map(String).join(" ")}\n`));
  const write = vi.spyOn(process.stdout, "write").mockImplementation(((chunk: string | Uint8Array) => {
    out.push(typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8"));
    return true;
  }) as typeof process.stdout.write);
  try {
    const code = await main(argv);
    return { code, stdout: out.join(""), stderr: err.join("") };
  } finally {
    log.mockRestore();
    error.mockRestore();
    write.mockRestore();
  }
}

export function select(value: unknown, path: string): unknown {
  let cur: unknown[] = [value];
  let collected = false;
  for (const seg of path.split(".")) {
    if (seg === "*") {
      cur = cur.flatMap((v) => (Array.isArray(v) ? v : []));
      collected = true;
      continue;
    }
    cur = cur.map((v) => (v === null || v === undefined ? undefined : Array.isArray(v) && /^\d+$/.test(seg) ? v[Number(seg)] : (v as Record<string, unknown>)[seg]));
  }
  return collected ? cur : cur[0];
}

function check(json: unknown, c: Check): void {
  const v = select(json, c.path);
  const contains = (x: unknown, y: unknown) => (Array.isArray(x) ? x.some((e) => JSON.stringify(e) === JSON.stringify(y)) : typeof x === "string" && typeof y === "string" && x.includes(y));
  if ("equals" in c) expect(v, c.path).toEqual(c.equals);
  if ("includes" in c) expect(contains(v, c.includes), `${c.path} includes ${JSON.stringify(c.includes)} (got ${JSON.stringify(v)?.slice(0, 300)})`).toBe(true);
  if ("notIncludes" in c) expect(contains(v, c.notIncludes), `${c.path} must not include ${JSON.stringify(c.notIncludes)}`).toBe(false);
  if (c.exists !== undefined) expect(v !== undefined, c.path).toBe(c.exists);
}

describe("biotech-schema-explore examples run against the packaged workspace", () => {
  it("ships the four positive and four negative examples AGENT-SKILLS section 2 requires", () => {
    const examples = exampleFiles.map((f) => JSON.parse(readFileSync(join(examplesDir, f), "utf8")) as Example);
    expect(examples.filter((e) => e.kind === "positive").map((e) => e.id).sort()).toEqual(["per-serving-label-content", "podcast-recommendation", "product-to-source-trace", "registry-versus-paper-estimate"]);
    expect(examples.filter((e) => e.kind === "negative").map((e) => e.id).sort()).toEqual(["retired-mention", "source-instructions-masquerading-as-rule", "stale-hosted-result", "wrong-pin"]);
  });

  for (const file of exampleFiles) {
    it(`example ${file}`, async () => {
      const ex = JSON.parse(readFileSync(join(examplesDir, file), "utf8")) as Example;
      for (const step of ex.steps) {
        const argv = [...step.argv.map((a) => a.replaceAll("{EXAMPLES}", examplesDir)), "--dir", wsDir];
        const { code, stdout, stderr } = await runCli(argv);
        expect(code, `${ex.id}: bks-schema ${step.argv.join(" ")}\n${stderr.slice(0, 600)}`).toBe(step.expect.exit);
        for (const s of step.expect.stdoutIncludes ?? []) expect(stdout, `${ex.id}: ${step.argv.join(" ")} stdout`).toContain(s);
        if (step.expect.json?.length) {
          const json = JSON.parse(stdout) as unknown;
          for (const c of step.expect.json) check(json, c);
        }
      }
    });
  }
});
