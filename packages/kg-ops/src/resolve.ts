import { int, type ManagedTransaction } from "neo4j-driver";
import type { Mention } from "@bks/contracts";
import { toJson } from "./neo4j.js";
import type { SchemaModel } from "./schema-access.js";

export interface ResolvedMatch {
  uid: string;
  nodeType: string;
  labels: string[];
  name: string | null;
  basis: "uid" | "identifier" | "name_exact" | "alias" | "fulltext";
  score: number;
  updatedAt: string | null;
  matchedIdentifier?: { scheme: string; value: string };
}

export interface ResolutionResult {
  mentionId: string;
  matches: ResolvedMatch[];
  /** Strongest basis among the matches, used by the planner. */
  strongest: ResolvedMatch["basis"] | null;
}

const BASIS_SCORE: Record<ResolvedMatch["basis"], number> = { uid: 1, identifier: 0.98, name_exact: 0.85, alias: 0.7, fulltext: 0.4 };

function primaryTypeOf(schema: SchemaModel, labels: string[]): string {
  // The most specific stored label that is a node type: labels are [primary, ..., archetype]; specializations list the parent after themselves.
  for (const l of labels) if (schema.nodeByPrimaryLabel.has(l)) return l;
  return labels[0] ?? "Unknown";
}

function rowToMatch(schema: SchemaModel, row: Record<string, unknown>, basis: ResolvedMatch["basis"], score: number): ResolvedMatch {
  const labels = (row.labels as string[]) ?? [];
  return {
    uid: String(row.uid),
    nodeType: primaryTypeOf(schema, labels),
    labels,
    name: (row.name as string | null) ?? null,
    basis,
    score,
    updatedAt: (row.updatedAt as string | null) ?? null,
  };
}

/**
 * Resolves mentions against the live graph in the fixed basis order:
 * uid > identifier (scheme+issuer+normalized value on an Identifier node linked by HAS_IDENTIFIER) > exact name on
 * identity/name properties > alias (normalized, case-insensitive) > fulltext (candidate only).
 */
export async function resolveMentions(tx: ManagedTransaction, schema: SchemaModel, mentions: Mention[], limitPerMention = 5): Promise<ResolutionResult[]> {
  const out: ResolutionResult[] = [];
  for (const mention of mentions) {
    const matches: ResolvedMatch[] = [];
    const seen = new Set<string>();
    const push = (m: ResolvedMatch) => {
      if (seen.has(m.uid)) {
        const existing = matches.find((x) => x.uid === m.uid);
        if (existing && m.matchedIdentifier && !existing.matchedIdentifier) existing.matchedIdentifier = m.matchedIdentifier;
        return;
      }
      seen.add(m.uid);
      matches.push(m);
    };
    const typeLabel = mention.nodeType ? `:${mention.nodeType}` : "";

    if (mention.uid) {
      const res = await tx.run(`MATCH (n${typeLabel} {uid: $uid}) RETURN n.uid AS uid, labels(n) AS labels, n.name AS name, toString(n.updatedAt) AS updatedAt LIMIT 1`, { uid: mention.uid });
      for (const r of res.records) push(rowToMatch(schema, toJson(r.toObject()) as Record<string, unknown>, "uid", BASIS_SCORE.uid));
    }

    for (const ident of mention.identifiers) {
      const value = schema.normalizeIdentifier(ident.scheme, ident.value);
      const res = await tx.run(
        `MATCH (n${typeLabel})-[:HAS_IDENTIFIER]->(i:Identifier)
         WHERE toUpper(i.scheme) = toUpper($scheme) AND (i.value = $value OR toLower(i.value) = toLower($value) OR i.value = $raw)
           AND ($issuer IS NULL OR toLower(i.issuer) = toLower($issuer))
         RETURN n.uid AS uid, labels(n) AS labels, n.name AS name, toString(n.updatedAt) AS updatedAt, i.scheme AS scheme, i.value AS ivalue
         LIMIT $limit`,
        { scheme: ident.scheme, value, raw: ident.value, issuer: ident.issuer ?? null, limit: neo4jInt(limitPerMention) },
      );
      for (const r of res.records) {
        const row = toJson(r.toObject()) as Record<string, unknown>;
        push({ ...rowToMatch(schema, row, "identifier", BASIS_SCORE.identifier), matchedIdentifier: { scheme: String(row.scheme), value: String(row.ivalue) } });
      }
    }

    const names = [mention.name, ...mention.aliases].filter((n): n is string => Boolean(n && n.trim()));
    if (names.length) {
      const nameProps = mention.nodeType ? schema.identityRule(mention.nodeType).nameProperties : ["name"];
      const props = [...new Set(["name", ...nameProps])];
      const where = props.map((p) => `toLower(trim(n.${p})) IN $names`).join(" OR ");
      const res = await tx.run(
        `MATCH (n${typeLabel}) WHERE n.uid IS NOT NULL AND (${where})
         RETURN n.uid AS uid, labels(n) AS labels, n.name AS name, toString(n.updatedAt) AS updatedAt LIMIT $limit`,
        { names: names.map((n) => n.trim().toLowerCase().replace(/\s+/g, " ")), limit: neo4jInt(limitPerMention) },
      );
      const exact = new Set(mention.name ? [mention.name.trim().toLowerCase().replace(/\s+/g, " ")] : []);
      for (const r of res.records) {
        const row = toJson(r.toObject()) as Record<string, unknown>;
        const isExact = typeof row.name === "string" && exact.has(row.name.trim().toLowerCase().replace(/\s+/g, " "));
        push(rowToMatch(schema, row, isExact ? "name_exact" : "alias", isExact ? BASIS_SCORE.name_exact : BASIS_SCORE.alias));
      }
    }

    if (matches.length < limitPerMention && mention.name && mention.nodeType) {
      const ft = schema.fulltextIndex(mention.nodeType);
      if (ft) {
        try {
          const res = await tx.run(
            `CALL db.index.fulltext.queryNodes($index, $phrase) YIELD node AS n, score
             WHERE n:${mention.nodeType} AND n.uid IS NOT NULL
             RETURN n.uid AS uid, labels(n) AS labels, n.name AS name, toString(n.updatedAt) AS updatedAt, score LIMIT $limit`,
            { index: ft.indexName, phrase: luceneEscape(mention.name), limit: neo4jInt(limitPerMention) },
          );
          for (const r of res.records) {
            const row = toJson(r.toObject()) as Record<string, unknown>;
            push(rowToMatch(schema, row, "fulltext", Math.min(0.6, BASIS_SCORE.fulltext + Number(row.score ?? 0) / 20)));
          }
        } catch {
          /* index absent in this database: fulltext stays unavailable, not an error */
        }
      }
    }

    matches.sort((a, b) => b.score - a.score || a.uid.localeCompare(b.uid));
    const top = matches.slice(0, limitPerMention);
    out.push({ mentionId: mention.mentionId, matches: top, strongest: top[0]?.basis ?? null });
  }
  return out;
}

export function luceneEscape(text: string): string {
  return text.replace(/[+\-!(){}[\]^"~*?:\\/]|&&|\|\|/g, (m) => `\\${m}`);
}

function neo4jInt(n: number) {
  return int(Math.trunc(n));
}
