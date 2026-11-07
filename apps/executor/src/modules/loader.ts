import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { ExecutorModule } from "./module.js";

const here = dirname(fileURLToPath(import.meta.url));
const SKIP = new Set(["module", "loader"]);

/** Discovers every module file next to this loader (compiled .js, or .ts under tsx/vitest) exporting `executorModule`. */
export async function loadModules(dir: string = here): Promise<ExecutorModule[]> {
  const ext = import.meta.url.endsWith(".ts") ? ".ts" : ".js";
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(ext) && !f.endsWith(".d.ts") && !f.endsWith(".test.ts") && !SKIP.has(f.slice(0, -ext.length)))
    .sort();
  const modules: ExecutorModule[] = [];
  for (const f of files) {
    const mod = (await import(pathToFileURL(join(dir, f)).href)) as { executorModule?: ExecutorModule };
    if (mod.executorModule) modules.push(mod.executorModule);
  }
  const ids = new Set<string>();
  for (const m of modules) {
    if (ids.has(m.id)) throw new Error(`duplicate executor module id ${m.id}`);
    ids.add(m.id);
  }
  return modules;
}
