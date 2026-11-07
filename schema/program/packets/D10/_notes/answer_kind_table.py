"""Generate packets/D10/answer-kind-table.md: the cross-packet answer-kind table.

Usage (Git Bash; pass C:/ paths, not /c/ paths, to python):
    python C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-A1/schema/program/packets/D10/_notes/answer_kind_table.py C:/Users/Pinda/Proyectos/Biotech

Reads every packet's 02-questions.md from the worktree that owns it (see
answer_kind_extract.PACKETS), applies D10's method (default: the declared kind
stands) and the explicit rulings in RULINGS below, and writes the table next to
this folder's parent (packets/D10/answer-kind-table.md). Stdlib only.
Re-run after any 02-questions.md changes; a ruling whose (packet, id) no longer
exists, or whose recorded declared kind no longer matches, is reported on stderr.
"""
import collections
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from answer_kind_extract import PACKETS, extract  # noqa: E402

KINDS = ["retrieved", "materialized", "assessment", "published"]
PACKET_ORDER = [p for p, _ in PACKETS]
AUDIENCES = ["biohacker", "investor", "researcher", "agent"]

# (packet, id) -> (declared kind expected, ruling, published_variant, reason)
# Every entry whose ruling differs from the declared kind is a disagreement.
# Entries whose ruling equals the declared kind carry a note only.
RULINGS = {
    # rule R4 (directive 3.5): ad hoc ranking / comparison / avoid-list is retrieved; published variant only when signed
    ("D1", "Q-D1-19"): ("materialized", "retrieved", True,
        "R4: an ad hoc ranking is computed at query time under DecisionCriterion@version (Q-D10-01); the per-product "
        "elemental amount it ranks on is the materialized input (Q-D1-02), the ranking is not stored; published variant = "
        "Report{COMPARISON} (skeleton d10.product-comparison@1)."),
    ("D5", "Q-D5-18"): ("published", "retrieved", True,
        "R4: 'compare or rank' asked ad hoc is computed under DecisionCriterion@version; it is published only when "
        "BellLabs signs a Report{COMPARISON} for an audience (directive 3.5). Keep both: retrieved by default, published variant."),
    ("D6", "Q-D6-03"): ("published", "retrieved", True,
        "R4: same as Q-D5-18; the comparison report is the published variant, not the default answer."),
    ("D8", "Q-D8-19"): ("published", "retrieved", True,
        "R4: same as Q-D5-18; quality ranking computed under DecisionCriterion@version, published variant = Report{COMPARISON}."),
    ("D6", "Q-D6-22"): ("published", "retrieved", True,
        "R4: an avoid-list is a computed list over assertions and assessments (as Q-D10-08, Q-D8-18); published variant = "
        "avoidance Report when BellLabs signs it."),
    ("D12", "Q-D12-08"): ("assessment", "retrieved", True,
        "R4: an avoid/limit list is composed at query time from WORSENS_TARGET assertions and the weighing Assessments "
        "already in the graph (as Q-D10-08, Q-D8-18); each weighing keeps kind assessment, the list itself is not a new "
        "judgment; published variant = avoidance Report."),
    # rule R3: cheap aggregates / threshold filters are retrieved; materialize only if a latency test fails
    ("D1", "Q-D1-03"): ("materialized", "retrieved", False,
        "R3: a threshold filter over per-product daily-amount CALCULATED Assertions (Q-D1-02, materialized) is cheap; "
        "the filter result is not stored. Materialize only if the fixture-graph latency test fails."),
    ("D7", "Q-D7-22"): ("materialized", "retrieved", False,
        "R3: counting studies per organization for one compound is a bounded aggregate, not graph-global; computed live. "
        "Materialize only if the latency test fails."),
    ("K", "Q-K-24"): ("materialized", "retrieved", False,
        "R3: a per-agent-version count of produced vs rejected/disputed assertions is an indexed aggregate (WAS_ASSOCIATED_WITH "
        "+ Adjudication); an audit must be live, a stored error rate is stale on the next adjudication."),
    ("K", "CQ-AX-08"): ("materialized", "retrieved", False,
        "Audit rule: an integrity audit over derived records must read their current inputs live; a materialized audit would itself "
        "go stale. Cross-packet: D10 declares the same CQ retrieved."),
    # identity / applicability / mixed-list rulings
    ("D1", "CQ-ST-02"): ("retrieved", "assessment", False,
        "R2: the path type (same lot / formulation / branded material / substance only) is an identity-resolution judgment "
        "(CQ-ID-06, D1's own assessment); listing products that share a substance is the cheap first step. "
        "Cross-packet: D3 declares the same CQ assessment."),
    ("D5", "Q-D5-25"): ("retrieved", "assessment", False,
        "R2: 'is this protocol step the same intervention concept as the one studied' is an identity/applicability match with "
        "a match basis, the same judgment as CQ-ID-01, CQ-ST-02 and CQ-EV-04 (all assessment); it must be supersedable."),
    ("D9", "CQ-CL-07"): ("retrieved", "assessment", False,
        "R2: the answer's payload is the RESOLUTION hypothesis (K Q-K-13 reuses CQ-CL-07 as assessment; D7 declares the same CQ "
        "assessment). The handle record itself is retrieved."),
    ("D4", "Q-D4-08"): ("retrieved", "assessment", False,
        "R2: the packet's own answer shape is a SAFETY_SIGNAL Assessment (subkind D4.unauthorized-measurement) over the claim; "
        "the regulator ratings it cites are retrieved inputs."),
    ("D6", "Q-D6-09"): ("assessment", "retrieved", False,
        "R4: max servings x declared amount compared with a stated reference is arithmetic under a declared criterion, as "
        "Q-D5-06 and Q-D1-03 (both retrieved); the choice of reference (UL vs tested-safe level) belongs in the "
        "DecisionCriterion, not in a per-product judgment."),
    ("D6", "CQ-AX-19"): ("assessment", "retrieved", False,
        "R4: measured vs declared per analyte for a lot joined by lot code is a read of D8 test assertions (D8 declares the same "
        "CQ retrieved; Q-D8-04 joins lots the same way). A lot match that is only a name match stays a RESOLUTION assessment upstream."),
    ("D2", "Q-D2-14"): ("materialized", "retrieved", False,
        "Mixed list: the answer unions curated reference links, source-asserted links and Association rows and labels each "
        "(CQ-EV-02); the list is read live, the Association rows inside it keep kind materialized."),
    # agreements that carry a note for the synthesizer
    ("D11", "Q-D11-22"): ("materialized", "materialized", False,
        "Note: K accepted storing D11's identifier-coverage profile as Report{PROFILE} generated by a PROJECTION Activity "
        "(K change 16). D10 reads that as the published variant; the regenerable coverage table is the materialized answer."),
    ("D3", "CQ-ST-07"): ("retrieved", "retrieved", False,
        "Note: three 'independence' answers exist and must stay distinct: CQ-ST-07 (study/dataset clustering, lower bound, "
        "GDS stream, retrieved), K Q-K-21 (verifier judgment of retellings, assessment), D9 CQ-CL-06 (discourse count, materialized)."),
    ("K", "Q-K-21"): ("assessment", "assessment", False,
        "Note: see CQ-ST-07 (D3) and CQ-CL-06 (D9); verifier independence is a judgment."),
    ("D9", "CQ-CL-06"): ("materialized", "materialized", False,
        "Note: per-claim discourse counts are materialized projections (K decision K-10); see CQ-ST-07 and Q-K-21."),
    ("D3", "CQ-ST-02"): ("assessment", "assessment", False,
        "Note: D1 declares the same CQ retrieved; D10 rules assessment for both rows."),
    ("D7", "CQ-CL-07"): ("assessment", "assessment", False,
        "Note: D9 declares the same CQ retrieved; D10 rules assessment for both rows."),
    ("D8", "CQ-AX-19"): ("retrieved", "retrieved", False,
        "Note: D6 declares the same CQ assessment; D10 rules retrieved for both rows."),
    ("D10", "CQ-AX-08"): ("retrieved", "retrieved", False,
        "Note: K declares the same CQ materialized; D10 rules retrieved for both rows."),
    ("D6", "CQ-PF-03"): ("assessment", "assessment", False,
        "Note: same CQ id, different question: D6 asks whether a label's certification claim falls inside the certified scope "
        "(coverage verdict, assessment); D8 asks what the certification covers (retrieved). Both rulings stand; the synthesizer "
        "should split the CQ into scope (retrieved) and coverage verdict (assessment)."),
    ("D8", "CQ-PF-03"): ("retrieved", "retrieved", False,
        "Note: see D6 CQ-PF-03; split the CQ in synthesis."),
    ("D7", "Q-D7-12"): ("retrieved", "retrieved", False,
        "Note: transactions are fetched at query time from EDGAR, not stored; freshness is the fetch time."),
    ("D7", "Q-D7-18"): ("retrieved", "retrieved", False,
        "Note: payments are fetched at query time from Open Payments, not stored; freshness is the fetch time."),
    ("D10", "Q-D10-16"): ("published", "published", False,
        "Note: asked ad hoc, 'which steps have supporting evidence' is the step-level assessment CQ-PR-06 (D5); this row is the "
        "protocol-review Report that composes it."),
}

def short(q: str, n: int = 110) -> str:
    q = re.sub(r"\s+", " ", q.replace("|", "/")).strip()
    return q if len(q) <= n else q[: n - 1].rstrip() + "…"


def audience_tags(a: str) -> list[str]:
    return [t for t in AUDIENCES if re.search(rf"\b{t}\b", a.lower())]


# Retrieved rows whose answer is computed under a stated criterion (ranking, comparison, avoid-list, threshold filter).
CRITERION = {("D1", "Q-D1-03"), ("D1", "Q-D1-19"), ("D2", "Q-D2-02"), ("D3", "Q-D3-04"), ("D4", "Q-D4-24"),
             ("D5", "Q-D5-06"), ("D5", "Q-D5-18"), ("D6", "Q-D6-02"), ("D6", "Q-D6-03"), ("D6", "Q-D6-09"),
             ("D6", "Q-D6-12"), ("D6", "Q-D6-22"), ("D7", "Q-D7-22"), ("D8", "Q-D8-18"), ("D8", "Q-D8-19"),
             ("D10", "Q-D10-01"), ("D10", "Q-D10-08"), ("D10", "Q-D10-22"), ("D12", "Q-D12-08"),
             ("D12", "Q-D12-19"), ("D12", "Q-D12-21"), ("D12", "Q-D12-31"), ("D13", "Q-D13-33")}
LINEAGE = {("K", "Q-K-03"), ("K", "Q-K-04"), ("K", "Q-K-05"), ("K", "Q-K-06"), ("K", "Q-K-07"),
           ("D11", "Q-D11-17"), ("D11", "CQ-PV-03"), ("D13", "Q-D13-32")}
CHUNK = re.compile(r"\bchunks?\b", re.I)
FETCH = {("D7", "Q-D7-12"), ("D7", "Q-D7-18")}
STREAM = {("D4", "Q-D4-25"), ("D12", "Q-D12-20"), ("D3", "CQ-ST-07")}
COMMERCE = re.compile(r"\b(price|offer|availability|listing|on sale|currently|current)\b", re.I)


def trace_and_freshness(row: dict, ruling: str, variant: bool) -> tuple[str, str]:
    key = (row["packet"], row["id"])
    q = row["question"]
    if ruling == "published":
        return ("Report → ReportItem rows (D10) → DERIVED_FROM cited Assertions/Assessments → HAS_EVIDENCE locators → "
                "snapshots; bodyDigest + policyVersion + composing Activity",
                "frozen at publishedAt; stale-report queue (Q-D10-13, Q-D10-24) flags inputs changed since")
    if ruling == "assessment":
        return ("STRACE: Assessment → DERIVED_FROM inputs → TRACE; own HAS_EVIDENCE spans; producing Agent + Activity",
                "until superseded (show recordedAt); re-assess when a DERIVED_FROM input is superseded")
    if ruling == "materialized":
        if key in {("D9", "Q-D9-19"), ("D10", "Q-D10-20")}:
            t = "GDS output with algorithm@version + projection definition + PROJECTION Activity; members → TRACE"
        else:
            t = ("Association / CALCULATED Assertion / computed state → DERIVED_FROM inputs (inputSetDigest) → TRACE; "
                 "methodVersion + PROJECTION Activity")
        return (t, "method bound: staleAfter / refresh cadence; stale as soon as an input is superseded (CQ-AX-08 audit)")
    # retrieved
    if key in FETCH:
        return ("external record fetched at query time → SourceSnapshot captured on fetch → locator",
                "live at fetch time (no stored copy)")
    if key in STREAM:
        return ("GDS stream over asserted edges, nothing stored; every input edge → TRACE; algorithm@version shown",
                "live (recomputed per request)")
    if variant or key in CRITERION:
        t = ("computed rows × DecisionCriterion@version; each cell → TRACE (Assertion → HAS_EVIDENCE → SourceLocator → "
             "SourceSnapshot)")
        if variant:
            t += "; published variant = Report{COMPARISON / avoidance} with ReportItem citations"
        return (t, "live; as fresh as the latest capture of each input (show retrievedAt / observedAt)")
    if CHUNK.search(q):
        return ("chunk → MENTIONS (derived, methodVersion) → Assertion → SourceLocator (exact, offsets) → snapshot digest; "
                "verifier re-selection flag", "live; MENTIONS index lags capture by its refresh cadence")
    if key in LINEAGE:
        return ("record → WAS_GENERATED_BY Activity (missionId, runId, intent/plan/bundle digests) → Agent",
                "live (append-only lineage)")
    if COMMERCE.search(q):
        return ("TRACE per row: Assertion → HAS_EVIDENCE → SourceLocator → SourceSnapshot (+ Adjudication)",
                "live; current-state answers carry lastObservedAt and open-end verification (CQ-AX-06)")
    return ("TRACE per row: Assertion → HAS_EVIDENCE → SourceLocator → SourceSnapshot (+ Adjudication)",
            "live; bitemporal as-of supported (validFrom/To, recordedFrom/To)")


def build(root: Path) -> tuple[str, dict]:
    rows = []
    for packet, agent in PACKETS:
        rows.extend(extract(root, packet, agent))
    seen = set()
    for r in rows:
        key = (r["packet"], r["id"])
        declared = r["answer_kind"].strip().lower()
        r["declared"] = declared
        rule = RULINGS.get(key)
        if rule:
            seen.add(key)
            exp, ruling, variant, reason = rule
            if exp != declared:
                print(f"warn: ruling for {key} expected declared '{exp}', found '{declared}'", file=sys.stderr)
            r["ruling"], r["variant"], r["reason"] = ruling, variant, reason
        else:
            r["ruling"], r["variant"], r["reason"] = declared, False, ""
        r["disagree"] = r["ruling"] != declared
        r["trace"], r["fresh"] = trace_and_freshness(r, r["ruling"], r["variant"])
    for key in set(RULINGS) - seen:
        print(f"warn: ruling for {key} matches no question row", file=sys.stderr)
    present = {(r["packet"], r["id"]) for r in rows}
    for key in (CRITERION | LINEAGE | FETCH | STREAM) - present:
        print(f"warn: trace set names {key}, which matches no question row", file=sys.stderr)

    by_kind_decl = collections.Counter(r["declared"] for r in rows)
    by_kind = collections.Counter(r["ruling"] for r in rows)
    by_packet = collections.Counter(r["packet"] for r in rows)
    by_packet_kind = collections.defaultdict(collections.Counter)
    for r in rows:
        by_packet_kind[r["packet"]][r["ruling"]] += 1
    aud_any = collections.Counter(t for r in rows for t in audience_tags(r["audience"]))
    # first-listed audience as written (order matters), not the AUDIENCES order
    aud_first = collections.Counter()
    for r in rows:
        first = r["audience"].split(",")[0].strip().lower()
        aud_first[first] += 1
    aud_kind = collections.defaultdict(collections.Counter)
    for r in rows:
        for t in audience_tags(r["audience"]):
            aud_kind[t][r["ruling"]] += 1
    distinct_ids = len({r["id"] for r in rows})
    dis = [r for r in rows if r["disagree"]]
    variants = [r for r in rows if r["variant"]]

    # cross-packet: same id declared with different kinds
    by_id = collections.defaultdict(list)
    for r in rows:
        by_id[r["id"]].append(r)
    conflicts = {i: rs for i, rs in by_id.items() if len(rs) > 1 and len({x["declared"] for x in rs}) > 1}
    shared = {i: rs for i, rs in by_id.items() if len(rs) > 1}

    L = []
    L.append("# D10 — answer-kind decision table (cross-packet pass)")
    L.append("")
    L.append("Cross-packet pass by A1 (D10 owner), 2026-10-08, after every packet's adversarial review. Generated by "
             "`_notes/answer_kind_table.py` (rows extracted by `_notes/answer_kind_extract.py` from each packet's "
             "`02-questions.md` in its owning worktree, biotech-knowledge-services-A1 … -A8). Do not edit the table by hand: "
             "change a packet's `02-questions.md` or a ruling in `RULINGS` and re-run "
             "`python <worktree>/schema/program/packets/D10/_notes/answer_kind_table.py C:/Users/Pinda/Proyectos/Biotech`.")
    L.append("")
    L.append("## Summary (goes to the synthesizer)")
    L.append("")
    L.append(f"- **Coverage:** {len(rows)} question rows from 14 packets (K, D1–D13), {distinct_ids} distinct ids; "
             f"{len(shared)} ids (shared `CQ-*`) appear in two packets and get one row per packet.")
    L.append("- **By kind (D10 ruling):** " + ", ".join(f"{k} {by_kind[k]}" for k in KINDS) +
             f" — declared by the packets: " + ", ".join(f"{k} {by_kind_decl[k]}" for k in KINDS) + ".")
    L.append(f"- **Published variants:** {len(variants)} retrieved rows also have a published variant (a signed Report): " +
             ", ".join(f"{r['id']} ({r['packet']})" for r in variants) + ".")
    L.append(f"- **Disagreements:** {len(dis)} rows where D10's ruling differs from the packet's declared kind (listed below); "
             f"{len(conflicts)} shared ids declared with different kinds by two packets.")
    L.append("")
    L.append("Counts by packet (ruling):")
    L.append("")
    L.append("| packet | rows | retrieved | materialized | assessment | published | disagreements |")
    L.append("| --- | ---: | ---: | ---: | ---: | ---: | ---: |")
    for p in PACKET_ORDER:
        c = by_packet_kind[p]
        nd = sum(1 for r in dis if r["packet"] == p)
        L.append(f"| {p} | {by_packet[p]} | " + " | ".join(str(c[k]) for k in KINDS) + f" | {nd} |")
    L.append(f"| **all** | {len(rows)} | " + " | ".join(str(by_kind[k]) for k in KINDS) + f" | {len(dis)} |")
    L.append("")
    L.append("Counts by audience (a row tagged with several audiences counts once for each; 'first' = the audience the "
             "packet listed first):")
    L.append("")
    L.append("| audience | rows tagged | listed first | retrieved | materialized | assessment | published |")
    L.append("| --- | ---: | ---: | ---: | ---: | ---: | ---: |")
    for a in AUDIENCES:
        c = aud_kind[a]
        L.append(f"| {a} | {aud_any[a]} | {aud_first[a]} | " + " | ".join(str(c[k]) for k in KINDS) + " |")
    L.append("")
    L.append("### Disagreements (D10 ruling ≠ packet's declared kind)")
    L.append("")
    L.append("| id | packet | declared | D10 ruling | why |")
    L.append("| --- | --- | --- | --- | --- |")
    for r in sorted(dis, key=lambda x: (PACKET_ORDER.index(x["packet"]), x["id"])):
        rk = r["ruling"] + (" (+ published variant)" if r["variant"] else "")
        L.append(f"| {r['id']} | {r['packet']} | {r['declared']} | {rk} | {r['reason']} |")
    L.append("")
    L.append("### Shared ids declared with different kinds by two packets")
    L.append("")
    L.append("| id | declarations | D10 ruling |")
    L.append("| --- | --- | --- |")
    for i in sorted(conflicts):
        rs = conflicts[i]
        decl = "; ".join(f"{x['packet']} {x['declared']}" for x in rs)
        rul = "; ".join(f"{x['packet']} {x['ruling']}" for x in rs)
        L.append(f"| {i} | {decl} | {rul} |")
    L.append("")
    L.append("CQ-PF-03 is the one conflict D10 does not resolve to a single kind: the two packets ask different questions "
             "under one id (scope of a certification vs whether a label's claim falls inside it); split the CQ in synthesis. "
             "All other shared ids agree on kind.")
    L.append("")
    L.append(METHOD)
    L.append("")
    L.append("## Table")
    L.append("")
    L.append("Columns: id · packet · question (short) · audience · value · polarity · declared kind · D10 ruling · trace · "
             "freshness · disagreement note. ⚑ marks a disagreement; a note without ⚑ is information for the synthesizer.")
    L.append("")
    L.append("| id | packet | question | audience | value | polarity | declared | D10 ruling | trace | freshness | note |")
    L.append("| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- | --- |")
    for r in rows:
        rk = r["ruling"] + (" + published variant" if r["variant"] else "")
        if r["disagree"]:
            rk += " ⚑"
        note = r["reason"].replace("|", "/")
        L.append(f"| {r['id']} | {r['packet']} | {short(r['question'])} | {r['audience']} | {r['value']} | "
                 f"{r['polarity']} | {r['declared']} | {rk} | {r['trace']} | {r['fresh']} | {note} |")
    L.append("")
    stats = {"rows": len(rows), "distinct": distinct_ids, "by_kind": dict(by_kind), "by_kind_declared": dict(by_kind_decl),
             "disagreements": [(r["packet"], r["id"], r["declared"], r["ruling"]) for r in dis],
             "conflicts": sorted(conflicts), "variants": len(variants), "by_packet": dict(by_packet),
             "aud_any": dict(aud_any)}
    return "\n".join(L), stats


METHOD = """## Method (PLAN 6.1; directive 3.5, 3.6; kernel pattern in packets/K/09-reasoning.md)

The kind names what the answer's main payload *is* — the record a user would cite back — not every record the query
touches. Apply per (packet, question id), first match wins:

1. **published (R1)** only if BellLabs signs the payload for an audience at a time under a policy version: evidence
   reports, comparison reports, profiles, protocol reviews, published answers (kernel `Report` with D10 `ReportItem`s;
   skeletons in `report-skeletons.md`). A question whose payload is the content or verdict of a published Report
   (Q-K-08, Q-D2-28, Q-D9-22) is published; a question about the *live status* of many Reports (stale-report queue
   Q-D10-13, Q-K-26, reverse citations CQ-AX-11) is retrieved.
2. **assessment (R2)** if the payload is a judgment that could be wrong, has a producer who answers for it, weighs named
   inputs and must be supersedable: synthesis, strength, harm causality, vetting, identity and applicability matches,
   retelling fidelity, signal interpretation, comparability (kernel `Assessment`).
3. **materialized (R3)** only if the computation is expensive or graph-global (GDS over a projection, a score over
   thousands of assertions, a derived number reused by many questions) **and** reused across queries: D10 `Association`
   (pair scores), kernel CALCULATED `Assertion` / computed state, a derived edge (MENTIONS), or a stored GDS output. Cheap
   bounded aggregates and threshold filters are retrieved; materialize them only if the fixture-graph latency test fails.
   GDS results streamed per request and never written (Q-D4-25, Q-D12-20, CQ-ST-07) are retrieved.
4. **retrieved (R4)** otherwise: asserted facts, or a cheap deterministic computation over them under declared criteria.
   **Every ad hoc ranking, comparison or avoid-list is retrieved** (computed under `DecisionCriterion@version`,
   Q-D10-01), with a *published variant* only when BellLabs signs it. Integrity audits over derived or published
   records are retrieved (an audit must read current inputs; a stored audit goes stale).

Default: the declared kind stands. D10 overrides only where a rule above clearly applies; each override is a
disagreement for the synthesizer, not an edit to the owning packet (owners decide; this table proposes).

**Trace** (how the answer cites locators): TRACE = Assertion → HAS_EVIDENCE → SourceLocator → SourceSnapshot (+
Adjudication, producing Activity); STRACE = Assessment → DERIVED_FROM inputs → TRACE, plus its own HAS_EVIDENCE spans
and producing Agent/Activity; materialized = record → DERIVED_FROM inputs (inputSetDigest) → TRACE with methodVersion
and PROJECTION Activity; published = Report → ReportItem → DERIVED_FROM / HAS_EVIDENCE with bodyDigest and
policyVersion. Patterns in `03-retrieval-patterns.md`.

**Freshness** (how stale it may be): retrieved = live, as fresh as the latest capture of each input (current-state
answers carry lastObservedAt, CQ-AX-06); materialized = method bound (staleAfter / refresh cadence) and stale as soon as
an input is superseded (CQ-AX-08 audit); assessment = until superseded (show recordedAt); published = frozen at
publishedAt, listed by the stale-report queue (Q-D10-13) and the re-review queue (Q-D10-24) when an input changes."""


def main() -> None:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "C:/Users/Pinda/Proyectos/Biotech")
    out = Path(__file__).resolve().parent.parent / "answer-kind-table.md"
    text, stats = build(root)
    out.write_text(text, encoding="utf-8", newline="\n")
    print(f"wrote {out}", file=sys.stderr)
    print(stats, file=sys.stderr)


if __name__ == "__main__":
    main()
