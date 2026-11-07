import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pinnedDir } from "@bks/schema-workspace";
import type { GraphClient } from "./neo4j.js";

export interface OperationsRunResult {
  total: number;
  applied: string[];
  skipped: Array<{ statement: string; reason: string }>;
  failed: Array<{ statement: string; error: string }>;
}

/** Splits the pinned operations file into statements (one per `;` at end of line, comments removed). */
export function splitCypherStatements(text: string): string[] {
  const noBlockComments = text.replace(/\/\*[\s\S]*?\*\//g, "");
  const lines = noBlockComments.split(/\r?\n/).filter((l) => !/^\s*\/\//.test(l));
  const statements: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    const stripped = line.replace(/\s+\/\/.*$/, "");
    current.push(stripped);
    if (/;\s*$/.test(stripped)) {
      const s = current.join("\n").trim().replace(/;\s*$/, "");
      if (s) statements.push(s);
      current = [];
    }
  }
  const tail = current.join("\n").trim();
  if (tail) statements.push(tail);
  return statements;
}

export function loadOperationsCypher(options: { enterprise?: boolean } = {}): string[] {
  const base = readFileSync(resolve(pinnedDir, "operations.cypher"), "utf8");
  const statements = splitCypherStatements(base);
  if (options.enterprise) {
    const path = resolve(pinnedDir, "operations.enterprise.cypher");
    if (existsSync(path)) statements.push(...splitCypherStatements(readFileSync(path, "utf8")));
  }
  return statements;
}

/** Runs each statement in its own auto-commit transaction; schema statements are idempotent (IF NOT EXISTS). */
export async function runOperationsCypher(client: GraphClient, statements: string[], options: { onlySchema?: boolean } = {}): Promise<OperationsRunResult> {
  const result: OperationsRunResult = { total: statements.length, applied: [], skipped: [], failed: [] };
  for (const statement of statements) {
    const head = statement.slice(0, 90).replace(/\s+/g, " ");
    const isSchema = /^\s*(CREATE|DROP)\s+(CONSTRAINT|INDEX|FULLTEXT|VECTOR|TEXT|RANGE|POINT|LOOKUP)/i.test(statement) || /^\s*CREATE\s+(FULLTEXT|VECTOR)\s+INDEX/i.test(statement);
    if (options.onlySchema && !isSchema) {
      result.skipped.push({ statement: head, reason: "not a schema statement" });
      continue;
    }
    // Schema statements of concurrent installers (several test files, or a migrator and a test) can deadlock on the label
    // schema lock; a deadlock is transient: retry the idempotent statement a few times before reporting it.
    for (let attempt = 1; ; attempt++) {
      const session = client.session("WRITE");
      try {
        await session.run(statement);
        result.applied.push(head);
        break;
      } catch (error) {
        const message = (error as Error).message;
        if (/already exists|EquivalentSchemaRuleAlreadyExists|ConstraintAlreadyExists|IndexAlreadyExists/i.test(message)) result.skipped.push({ statement: head, reason: "already exists" });
        else if (/Unsupported administration command|Enterprise|not supported in Community/i.test(message)) result.skipped.push({ statement: head, reason: "enterprise-only" });
        else if (attempt < 5 && /DeadlockDetected|can't acquire|deadlock/i.test(message)) {
          await new Promise((r) => setTimeout(r, 200 * attempt));
          continue;
        } else result.failed.push({ statement: head, error: message });
        break;
      } finally {
        await session.close();
      }
    }
  }
  return result;
}
