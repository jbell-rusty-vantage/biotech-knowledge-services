/**
 * Runs the biotech-kg-ingest v2 worked examples (.agents/skills/biotech-kg-ingest/examples/examples.json) through the
 * real executor HTTP path: POST /kg/plan -> POST /kg/admit -> POST /kg/apply -> GET /kg/receipt -> POST /kg/verify-effects,
 * against a fresh disposable Neo4j (BKS_INTEGRATION=1, NEO4J_TEST_URI; never Aura). Every expectation lives in the
 * runner spec, so the skill's examples and this test cannot drift apart.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ensureOperationalState, generateWitnessKeyPair, GraphClient, installReleaseMarker, KnowledgeWriter, MemoryGrantAuthority, MemoryPlanStore, parsePinnedKeys, toJson, writeSchema } from "@bks/kg-ops";
import { createApp } from "./app.js";
import { createContext } from "./context.js";
import { loadModules } from "./modules/loader.js";

const enabled = process.env.BKS_INTEGRATION === "1";
const URI = process.env.NEO4J_TEST_URI ?? "bolt://127.0.0.1:7690";
const PASSWORD = process.env.NEO4J_TEST_PASSWORD ?? "bks-test-password";
const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..", "..", "..");
const dir = resolve(repo, ".agents", "skills", "biotech-kg-ingest", "examples");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type J = Record<string, any>;
interface Step {
  id: string;
  intent: string;
  principal: "writer" | "projector";
  expect: { "plan.outcome": string; "plan.dispositions"?: Record<string, string>; "plan.reason"?: Record<string, string> };
  admit?: { effectKey: string; partialPolicy: unknown; error: string };
  apply?: Array<{ effectKey: string; partialPolicy: unknown; outcome?: string; error?: string }>;
  receipt?: { effectKey: string; found: boolean; status: string };
  replan?: { effectKey: string; error: string };
  forged?: Array<{ mutate: "addStatements" | "wrongPlanDigest"; effectKey: string; error: string }>;
  verify?: boolean;
  graph?: { closedEpisodes?: { type: string; from: string; open: number; closed: number } };
}

const spec = JSON.parse(readFileSync(resolve(dir, "examples.json"), "utf8")) as { release: { schemaReleaseDigest: string }; examples: Array<{ id: string; title: string; steps: Step[] }> };
const d = enabled ? describe : describe.skip;

d("biotech-kg-ingest v2 worked examples through the executor HTTP path", () => {
  const client = enabled ? new GraphClient({ uri: URI, username: "neo4j", password: PASSWORD, database: "neo4j" }) : (null as unknown as GraphClient);
  const key = generateWitnessKeyPair("skill-examples");
  const tokens = [
    { token: "skill-writer", role: "writer", principalId: "skill-writer", installationId: "skill", applicationId: "biotech-kg-ingest", tenantId: "examples", grants: [] },
    { token: "skill-projector", role: "writer", principalId: "skill-projector", installationId: "skill", applicationId: "biotech-kg-ingest", tenantId: "examples", grants: ["projection.write"] },
  ];
  let app: ReturnType<typeof createApp>;
  const results = new Map<string, { plan: J }>();
  const log: J[] = [];

  beforeAll(async () => {
    expect(URI).not.toMatch(/databases\.neo4j\.io/);
    await client.verify();
    await client.write((tx) => tx.run("MATCH (n) DETACH DELETE n"));
    const schema = writeSchema();
    expect(schema.schemaReleaseDigest, "examples are pinned to the release the executor serves").toBe(spec.release.schemaReleaseDigest);
    await ensureOperationalState(client, schema, { phase: "all" });
    await installReleaseMarker(client, { releaseId: schema.releaseId, schemaReleaseDigest: schema.schemaReleaseDigest }, "skill-examples");
    const writer = new KnowledgeWriter(client, { schema, plans: new MemoryPlanStore(), witnessKeys: parsePinnedKeys(`${key.kid}:${key.publicKeyDer}`), signer: { kid: key.kid, key: key.privateKey }, authority: new MemoryGrantAuthority(), issuer: "skill-examples", localDev: false });
    // Development admission (POST /kg/admit) needs BKS_LOCAL_DEV=1 and a signing key; the writer itself does not run in
    // local-dev mode (the release marker and witness checks are the production ones).
    const env = { BKS_EXECUTOR_TOKENS: JSON.stringify(tokens), BKS_LOCAL_DEV: "1", BKS_WITNESS_SIGNING_KEY: "configured-by-test" } as NodeJS.ProcessEnv;
    const ctx = createContext(env, { graph: () => client, writer: () => writer });
    app = createApp(ctx, await loadModules());
  }, 300_000);
  afterAll(async () => {
    await client?.close();
  });

  const call = async (method: string, path: string, token: string, body?: unknown) => {
    const r = await app.request(path, { method, headers: { "x-api-key": token, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    return { status: r.status, body: (await r.json()) as J };
  };
  const tokenOf = (p: Step["principal"]) => (p === "projector" ? "skill-projector" : "skill-writer");
  const resolveRefs = (text: string) =>
    text.replace(/\$\{step:([^.}]+)\.(subject|mint)\.([^.}]+)(?:\.([^}]+))?\}/g, (_m, step: string, what: string, a: string, b?: string) => {
      const r = results.get(step);
      if (!r) throw new Error(`placeholder references step ${step}, which has not run`);
      if (what === "subject") return String(r.plan.subjects.find((s: J) => s.ref === a)?.uid ?? `<missing subject ${a}>`);
      return String(r.plan.proposals.find((p: J) => p.proposalId === a)?.mints?.[b ?? "assertion"] ?? `<missing mint ${a}.${b}>`);
    });
  const applyRequest = async (plan: J, token: string, effectKey: string, partialPolicy: unknown) => {
    const w = await call("POST", "/kg/admit", token, { planRef: plan.planRef, effectKey, partialPolicy });
    if (w.status !== 200) return { admitError: w.body.code as string, request: null };
    return { admitError: null, request: { schemaVersion: "biotech-knowledge-apply.v2", planRef: plan.planRef, expectedPlanDigest: plan.planDigest, intentDigest: plan.binding.intentDigest, effectKey, partialPolicy, witness: w.body } };
  };

  for (const ex of spec.examples) {
    it(`${ex.id}: ${ex.title}`, { timeout: 300_000 }, async () => {
      for (const step of ex.steps) {
        const token = tokenOf(step.principal);
        const intent = JSON.parse(resolveRefs(readFileSync(resolve(dir, step.intent), "utf8")));
        const planned = await call("POST", "/kg/plan", token, intent);
        const plan = planned.body.plan as J;
        expect(plan, `${step.id}: ${JSON.stringify(planned.body).slice(0, 400)}`).toBeTruthy();
        results.set(step.id, { plan });
        const why = JSON.stringify(plan.proposals.map((p: J) => [p.proposalId, p.disposition, p.reasons[0]]));
        expect(plan.outcome, `${step.id} ${why}`).toBe(step.expect["plan.outcome"]);
        for (const [pid, disp] of Object.entries(step.expect["plan.dispositions"] ?? {})) expect(plan.proposals.find((p: J) => p.proposalId === pid)?.disposition, `${step.id}/${pid} ${why}`).toBe(disp);
        for (const [pid, re] of Object.entries(step.expect["plan.reason"] ?? {})) expect(plan.proposals.find((p: J) => p.proposalId === pid)?.reasons[0] ?? "", `${step.id}/${pid}`).toMatch(new RegExp(re));
        // Compiled statements are visible for inspection, never submittable.
        if (plan.outcome === "applicable" || plan.outcome === "partial") expect(plan.statements.length).toBeGreaterThan(0);
        if (step.admit) {
          const w = await call("POST", "/kg/admit", token, { planRef: plan.planRef, effectKey: step.admit.effectKey, partialPolicy: step.admit.partialPolicy });
          expect(w.body.code, `${step.id} admit`).toBe(step.admit.error);
        }
        let appliedKey: string | null = null;
        for (const a of step.apply ?? []) {
          const { admitError, request } = await applyRequest(plan, token, a.effectKey, a.partialPolicy);
          const r = request ? await call("POST", "/kg/apply", token, request) : { status: 0, body: { code: admitError } };
          if (a.error) expect(r.body.code ?? r.body.failure?.code, `${step.id} apply ${JSON.stringify(a.partialPolicy)}`).toBe(a.error);
          else {
            expect(r.body.outcome, `${step.id} apply ${JSON.stringify(r.body.failure ?? r.body).slice(0, 400)}`).toBe(a.outcome);
            appliedKey = a.effectKey;
          }
          log.push({ step: step.id, effectKey: a.effectKey, partialPolicy: a.partialPolicy, status: r.status, outcome: r.body.outcome ?? null, code: r.body.code ?? r.body.failure?.code ?? null });
        }
        if (step.receipt) {
          const r = await call("GET", `/kg/receipt?effectKey=${encodeURIComponent(step.receipt.effectKey)}`, token);
          expect(r.body.found).toBe(step.receipt.found);
          expect(r.body.status).toBe(step.receipt.status);
        }
        if (step.replan) {
          const again = await call("POST", "/kg/plan", token, intent);
          expect(again.body.planDigest, "a re-plan uses a new clock and yields a new plan").not.toBe(plan.planDigest);
          const { request } = await applyRequest(again.body.plan, token, step.replan.effectKey, "all");
          const r = await call("POST", "/kg/apply", token, request);
          expect(r.body.code ?? r.body.failure?.code).toBe(step.replan.error);
        }
        for (const f of step.forged ?? []) {
          const { request } = await applyRequest(plan, token, f.effectKey, "all");
          const forged = f.mutate === "addStatements" ? { ...request, statements: [{ cypher: "CREATE (:Forged)" }] } : { ...request!, expectedPlanDigest: `sha256:${"0".repeat(64)}` };
          const r = await call("POST", "/kg/apply", token, forged);
          expect(r.body.code ?? r.body.failure?.code, `${step.id} forged ${f.mutate}`).toBe(f.error);
        }
        if (step.verify && appliedKey) {
          let cursor: number | null = 0;
          let failures = 0;
          let checked = 0;
          const failed: J[] = [];
          while (cursor !== null) {
            const page = await call("POST", "/kg/verify-effects", token, { effectKey: appliedKey, cursor, pageSize: 50 });
            failures += Number(page.body.failures);
            failed.push(...(page.body.items as J[]).filter((x) => !x.ok));
            checked += Number(page.body.checked);
            cursor = page.body.nextCursor as number | null;
          }
          expect(failures, `${step.id} readback ${JSON.stringify(failed).slice(0, 600)}`).toBe(0);
          expect(checked).toBeGreaterThan(0);
        }
        if (step.graph?.closedEpisodes) {
          const g = step.graph.closedEpisodes;
          const from = resolveRefs(g.from);
          const res = await client.read((tx) => tx.run(`MATCH ({uid: $from})-[r:${g.type}]->() RETURN sum(CASE WHEN r.recordedTo IS NULL THEN 1 ELSE 0 END) AS open, sum(CASE WHEN r.recordedTo IS NULL THEN 0 ELSE 1 END) AS closed`, { from }));
          expect(Number(toJson(res.records[0]!.get("open")))).toBe(g.open);
          expect(Number(toJson(res.records[0]!.get("closed")))).toBe(g.closed);
        }
      }
    });
  }
});
