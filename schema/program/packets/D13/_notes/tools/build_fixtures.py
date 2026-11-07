"""Build and verify the D13 fixtures (fixtures stage, A7, 2026-10-08).

Usage: python -I build_fixtures.py <capture dir> <packet dir>
  <capture dir>  directory holding the fresh captures (session scratch ft/D13/fx/raw; not committed)
  <packet dir>   schema/program/packets/D13

For every locator the script re-selects the span from the fresh capture (TEXT_QUOTE: exact string at the computed
code-point offsets of the canonical text; JSON_POINTER: RFC 6901 pointer into the parsed JSON; HTML: first <title>),
fails loudly when a quote is missing, and writes locators.yaml, assertions.yaml and intent.json for each fixture.
Nothing here invents a value: every exact string below was copied from the capture and is checked against it.

Adversarial-review pass (A7, 2026-10-08): EDGAR HTML snapshots are identified by their h2t-v1 projection hash
(contentHashBasis NORMALIZED_TEXT; sec.gov injects a per-client <script src> path, so raw bytes do not reproduce on
re-fetch); EDGAR submissions-index locators select by accession number (rule edgar-accession/v1), never by array
position; owners' type names and uid tokens (D1 ChemicalSubstance `substance`, D3 Publication, D7 `org`/`person`,
D8 RegulatoryRecord `reg-record`); roleTitleVerbatim dropped (qualifier roleText); BORROWER role; DOCUMENTED_BY_RECORD
typed edge; mint-time identity keys with `primary=true`; ATM financing event; Study ON_FRONTIER; HAS_REVISION_STATUS
per authority with derivedFrom origins; chunks cut at Item headings (rule item-sections/v2).
"""
import hashlib
import html as htmllib
import json
import os
import re
import sys

import yaml

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from h2t_v1 import project  # noqa: E402

CAP, PKT = sys.argv[1], sys.argv[2]
RETRIEVED = "2026-10-08"
MISSION = "mission:ft-D13-fixtures"
FIXTURE_ID_NOTE = (
    "producedBy ids are FIXTURE-SCOPED ids (mission:ft-D13-fixtures / run:ft-D13-<fixture>), not real Mission Control "
    "missions; in production they are the Activity's missionId/runId (00-DIRECTIVE section 4)."
)


def sha_bytes(b):
    return "sha256:" + hashlib.sha256(b).hexdigest()


def canon(obj):
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


# ----------------------------------------------------------------------------------------------------------------
# Snapshots (fresh captures, 2026-10-08)
# ----------------------------------------------------------------------------------------------------------------
EDGAR = "curl -> SEC EDGAR Archives (User-Agent from EDGAR_IDENTITY) + h2t-v1 projection"
SNAPS = {
    "s-mdgl-8k-2022-12-19": dict(
        url="https://www.sec.gov/Archives/edgar/data/1157601/000119312522307935/d423141d8k.htm",
        file="mdgl-000119312522307935_d423141d8k.htm", fmt="html", tool="tool:sec-edgar-archives", captureMethod=EDGAR,
        title="Madrigal Pharmaceuticals, Inc. Form 8-K (Items 7.01, 8.01), accession 0001193125-22-307935",
        publishedAt="2022-12-19", sourceKind="WEB_PAGE", genre="REGULATORY_FILING"),
    "s-ctgov-nct03900429": dict(
        url="https://clinicaltrials.gov/api/v2/studies/NCT03900429",
        file="ctgov-NCT03900429.json", fmt="json", tool="tool:clinicaltrials-gov-v2", captureMethod="curl -> ClinicalTrials.gov API v2 (adversarial-review pass)",
        title="ClinicalTrials.gov record NCT03900429 (MAESTRO-NASH)", publishedAt="2026-06-01", sourceKind="REGISTRY",
        genre="TRIAL_REGISTRY_RECORD"),
    "s-mdgl-8k-2022-12-23": dict(
        url="https://www.sec.gov/Archives/edgar/data/1157601/000119312522311537/d434336d8k.htm",
        file="mdgl-000119312522311537_d434336d8k.htm", fmt="html", tool="tool:sec-edgar-archives", captureMethod=EDGAR,
        title="Madrigal Form 8-K (Items 1.01, 5.03, 7.01, 8.01, 9.01), accession 0001193125-22-311537",
        publishedAt="2022-12-23", sourceKind="WEB_PAGE", genre="REGULATORY_FILING"),
    "s-mdgl-ex991-2022-12-21": dict(
        url="https://www.sec.gov/Archives/edgar/data/1157601/000119312522311537/d434336dex991.htm",
        file="mdgl-000119312522311537_d434336dex991.htm", fmt="html", tool="tool:sec-edgar-archives", captureMethod=EDGAR,
        title="Exhibit 99.1 'Madrigal Pharmaceuticals Announces $300+ Million in Financing Events to Advance Resmetirom Program'",
        publishedAt="2022-12-23", sourceKind="WEB_PAGE", genre="PRESS_RELEASE"),
    "s-mdgl-8k-2023-06-30": dict(
        url="https://www.sec.gov/Archives/edgar/data/1157601/000119312523179440/d502542d8k.htm",
        file="mdgl-000119312523179440_d502542d8k.htm", fmt="html", tool="tool:sec-edgar-archives", captureMethod=EDGAR,
        title="Madrigal Form 8-K (Item 8.01) 2023-06-30: rolling NDA submission initiated, accession 0001193125-23-179440",
        publishedAt="2023-06-30", sourceKind="WEB_PAGE", genre="REGULATORY_FILING"),
    "s-mdgl-8k-2023-07-17": dict(
        url="https://www.sec.gov/Archives/edgar/data/1157601/000119312523187698/d508608d8k.htm",
        file="mdgl-000119312523187698_d508608d8k.htm", fmt="html", tool="tool:sec-edgar-archives", captureMethod=EDGAR,
        title="Madrigal Form 8-K (Item 8.01) 2023-07-17: rolling NDA submission completed, accession 0001193125-23-187698",
        publishedAt="2023-07-17", sourceKind="WEB_PAGE", genre="REGULATORY_FILING"),
    "s-mdgl-8k-2023-09-13": dict(
        url="https://www.sec.gov/Archives/edgar/data/1157601/000119312523234385/d475156d8k.htm",
        file="mdgl-000119312523234385_d475156d8k.htm", fmt="html", tool="tool:sec-edgar-archives", captureMethod=EDGAR,
        title="Madrigal Form 8-K (Items 8.01, 9.01) 2023-09-13: NDA accepted, accession 0001193125-23-234385",
        publishedAt="2023-09-13", sourceKind="WEB_PAGE", genre="REGULATORY_FILING"),
    "s-mdgl-ex991-2023-09-13": dict(
        url="https://www.sec.gov/Archives/edgar/data/1157601/000119312523234385/d475156dex991.htm",
        file="mdgl-000119312523234385_d475156dex991.htm", fmt="html", tool="tool:sec-edgar-archives", captureMethod=EDGAR,
        title="Exhibit 99.1 'Madrigal Pharmaceuticals Announces NDA Acceptance and Priority Review of the New Drug Application for Resmetirom for the Treatment of NASH with Liver Fibrosis'",
        publishedAt="2023-09-13", sourceKind="WEB_PAGE", genre="PRESS_RELEASE"),
    "s-mdgl-8k-2024-03-15": dict(
        url="https://www.sec.gov/Archives/edgar/data/1157601/000119312524068170/d788116d8k.htm",
        file="mdgl-000119312524068170_d788116d8k.htm", fmt="html", tool="tool:sec-edgar-archives", captureMethod=EDGAR,
        title="Madrigal Form 8-K (Items 7.01, 8.01, 9.01), Date of Report 2024-03-14, accession 0001193125-24-068170",
        publishedAt="2024-03-15", sourceKind="WEB_PAGE", genre="REGULATORY_FILING"),
    "s-mdgl-ex991-2024-03-14": dict(
        url="https://www.sec.gov/Archives/edgar/data/1157601/000119312524068170/d788116dex991.htm",
        file="mdgl-000119312524068170_d788116dex991.htm", fmt="html", tool="tool:sec-edgar-archives", captureMethod=EDGAR,
        title="Exhibit 99.1 'Madrigal Pharmaceuticals Announces FDA Approval of Rezdiffra (resmetirom) for the Treatment of Patients with Noncirrhotic Nonalcoholic Steatohepatitis (NASH) with Moderate to Advanced Liver Fibrosis'",
        publishedAt="2024-03-15", sourceKind="WEB_PAGE", genre="PRESS_RELEASE"),
    "s-mdgl-ex991-2024-05-07": dict(
        url="https://www.sec.gov/Archives/edgar/data/1157601/000119312524132559/d828444dex991.htm",
        file="mdgl-000119312524132559_d828444dex991.htm", fmt="html", tool="tool:sec-edgar-archives", captureMethod=EDGAR,
        title="Exhibit 99.1 'Madrigal Pharmaceuticals Reports First-Quarter 2024 Financial Results and Provides Corporate Updates' (8-K Item 2.02, accession 0001193125-24-132559)",
        publishedAt="2024-05-07", sourceKind="WEB_PAGE", genre="PRESS_RELEASE"),
    "s-mdgl-edgar-submissions": dict(
        url="https://data.sec.gov/submissions/CIK0001157601.json",
        file="madrigal-submissions.json", fmt="json", tool="tool:sec-edgar-submissions",
        captureMethod="curl -> data.sec.gov submissions API (User-Agent from EDGAR_IDENTITY)",
        title="SEC EDGAR submissions index, CIK 0001157601 (Madrigal Pharmaceuticals)", publishedAt=None,
        sourceKind="API", genre="REGISTRY_RECORD"),
    "s-openfda-nda217785": dict(
        url="https://api.fda.gov/drug/drugsfda.json?search=openfda.brand_name:%22REZDIFFRA%22&limit=1",
        file="openfda-rezdiffra.json", fmt="json", tool="tool:openfda-drugsfda", captureMethod="curl -> openFDA drugsfda",
        title="openFDA Drugs@FDA record NDA217785 (REZDIFFRA)", publishedAt=None, sourceKind="API", genre="REGULATORY_RECORD"),
    "s-nature-retraction-note": dict(
        url="https://www.nature.com/articles/s41586-024-07691-8",
        file="nature-retraction.fc.md", fmt="md", tool="tool:firecrawl-scrape",
        captureMethod="firecrawl scrape --only-main-content (CLI 1.23.1); Tavily cannot fetch nature.com",
        title="Retraction Note: A specific amyloid-β protein assembly in the brain impairs memory (Nature 631, 240 (2024))",
        publishedAt="2024-06-24", sourceKind="WEB_PAGE", genre="RETRACTION_NOTICE"),
    "s-crossref-nature04533": dict(
        url="https://api.crossref.org/works/10.1038/nature04533",
        file="crossref-nature04533.json", fmt="json", tool="tool:crossref-rest", captureMethod="curl -> Crossref REST works API",
        title="Crossref work record 10.1038/nature04533", publishedAt=None, sourceKind="API", genre="BIBLIOGRAPHIC_RECORD"),
    "s-crossref-retraction-note": dict(
        url="https://api.crossref.org/works/10.1038/s41586-024-07691-8",
        file="crossref-retraction-notice.json", fmt="json", tool="tool:crossref-rest", captureMethod="curl -> Crossref REST works API",
        title="Crossref work record 10.1038/s41586-024-07691-8 (retraction note)", publishedAt=None, sourceKind="API",
        genre="BIBLIOGRAPHIC_RECORD"),
    "s-pubmed-16541076": dict(
        url="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=16541076&retmode=xml",
        file="pubmed-16541076.xml", fmt="text", tool="tool:pubmed-eutils", captureMethod="curl -> NCBI E-utilities efetch",
        title="PubMed record PMID 16541076", publishedAt=None, sourceKind="API", genre="BIBLIOGRAPHIC_RECORD"),
    "s-nature04533-wayback-2020": dict(
        url="https://www.nature.com/articles/nature04533",
        file="wayback-nature04533-20200812.html", fmt="htmlraw", tool="tool:wayback-archive",
        captureMethod="curl -> web.archive.org id_ capture 20200812221937 (found via the Wayback availability API)",
        archiveUri="http://web.archive.org/web/20200812221937/https://www.nature.com/articles/nature04533",
        observedAt="2020-08-12T22:19:37Z",
        title="A specific amyloid-β protein assembly in the brain impairs memory | Nature (archived 2020-08-12)",
        publishedAt="2006-03-16", sourceKind="WEB_PAGE", genre="PEER_REVIEWED_PUBLICATION"),
    "s-nature04533-current": dict(
        url="https://www.nature.com/articles/nature04533",
        file="nature04533-current.fc.md", fmt="md", tool="tool:firecrawl-scrape",
        captureMethod="firecrawl scrape --only-main-content (CLI 1.23.1)",
        title="RETRACTED ARTICLE: A specific amyloid-β protein assembly in the brain impairs memory (current page)",
        publishedAt="2006-03-16", sourceKind="WEB_PAGE", genre="PEER_REVIEWED_PUBLICATION",
        revisionKind="RETRACTION", revisesSnapshot="s-nature04533-wayback-2020"),
    "s-bioage-release": dict(
        url="https://ir.bioagelabs.com/news-releases/news-release-details/bioage-labs-announces-discontinuation-strides-phase-2-clinical",
        file="bioage.md", fmt="md", tool="tool:tavily-extract",
        captureMethod="tvly extract --json (CLI 0.1.5, PYTHONUTF8=1); raw_content saved as UTF-8 LF markdown",
        title="BioAge Labs Announces Discontinuation of STRIDES Phase 2 Clinical Trial Evaluating Azelaprag in Combination with Tirzepatide for the Treatment of Obesity",
        publishedAt="2024-12-06", sourceKind="WEB_PAGE", genre="PRESS_RELEASE"),
    "s-ctgov-nct06515418": dict(
        url="https://clinicaltrials.gov/api/v2/studies/NCT06515418",
        file="ctgov-NCT06515418.json", fmt="json", tool="tool:clinicaltrials-gov-v2", captureMethod="curl -> ClinicalTrials.gov API v2",
        title="ClinicalTrials.gov record NCT06515418 (STRIDES)", publishedAt="2025-03-13", sourceKind="REGISTRY",
        genre="TRIAL_REGISTRY_RECORD"),
    "s-biopharmadive-bioage": dict(
        url="https://www.biopharmadive.com/news/bioage-azelaprag-tirzepatide-study-2-stop-obesity/734931/",
        file="bpdive.md", fmt="md", tool="tool:tavily-extract",
        captureMethod="tvly extract --json (CLI 0.1.5, PYTHONUTF8=1); raw_content saved as UTF-8 LF markdown",
        title="BioAge shares tumble after decision to halt obesity drug study (BioPharma Dive; Gwendolyn Wu)", publishedAt="2024-12-07",
        publishedAtNote="from the page itself ('Published Dec. 7, 2024'; meta sailthru.date 2024-12-07T11:34:00, sailthru.author Gwendolyn Wu) in a Firecrawl re-scrape of 2026-10-08; the Tavily raw_content capture keeps the author headshot but drops the date line",
        sourceKind="WEB_PAGE", genre="TRADE_PRESS"),
    "s-bioage-edgar-submissions": dict(
        url="https://data.sec.gov/submissions/CIK0001709941.json",
        file="bioage-submissions.json", fmt="json", tool="tool:sec-edgar-submissions",
        captureMethod="curl -> data.sec.gov submissions API (User-Agent from EDGAR_IDENTITY)",
        title="SEC EDGAR submissions index, CIK 0001709941 (BioAge Labs)", publishedAt=None, sourceKind="API",
        genre="REGISTRY_RECORD"),
}

_cache = {}


def load(sid):
    if sid in _cache:
        return _cache[sid]
    s = SNAPS[sid]
    raw = open(os.path.join(CAP, s["file"]), "rb").read()
    out = {"raw": raw, "contentHash": sha_bytes(raw)}
    if s["fmt"] == "html":
        text = project(raw)
        out["text"] = text
        out["projection"] = {"method": "h2t-v1 (_notes/tools/h2t_v1.py; UTF-8, LF)", "hash": sha_bytes(text.encode("utf-8"))}
    elif s["fmt"] in ("md", "text", "htmlraw"):
        out["text"] = raw.decode("utf-8")
    elif s["fmt"] == "json":
        out["json"] = json.loads(raw.decode("utf-8"))
    _cache[sid] = out
    return out


def snap_uid(sid):
    return "hu:snapshot:fx-d13-" + sid[2:]


REFETCH = {
    "html": "raw bytes do NOT reproduce: sec.gov injects a per-client <script src=\"/<random path>\"> before </body> (re-fetch 2026-10-08: sha256 024ba839... vs capture fea92312... for d423141d8k.htm, the only diff that line); the h2t-v1 projection reproduces (verified on d423141d8k.htm and d434336dex991.htm), so it is the snapshot identity",
    "md": "scraper output does not reproduce byte-exactly (Firecrawl / Tavily markdown varies by a trailing newline and by page chrome); the stored artifact is the evidence and needs durable storage",
    "htmlraw": "Wayback id_ bytes did not reproduce on re-fetch (2026-10-08: 231,151 bytes sha256 88986ab6... vs captured 231,143 bytes b9b53659...; the <title> and the absence of 'retract' are the same); the stored artifact is the evidence",
    "json": "live API record: content changes as the registry, index or metadata is updated; the stored artifact is the evidence",
    "text": "live API record (efetch XML); the stored artifact is the evidence",
}


def snapshot_record(sid):
    s, d = SNAPS[sid], load(sid)
    rec = {
        "ref": sid,
        "uid": snap_uid(sid),
        "source": {"canonicalUri": s["url"], "sourceKind": s["sourceKind"], "genre": s["genre"], "name": s["title"]},
        "retrievedAt": RETRIEVED,
        "publishedAt": s.get("publishedAt"),
        "contentHash": d["projection"]["hash"] if "projection" in d else d["contentHash"],
        "contentHashBasis": "NORMALIZED_TEXT" if "projection" in d else "RAW_BYTES",
        "captureMethod": s["captureMethod"],
        "captureTool": s["tool"],
        "captureCompleteness": "COMPLETE",
        "rawCaptureFile": "scratch ft/D13/fx/raw/" + s["file"] + " (not committed; durable blob storage is an open item, 11-open-questions.md)",
        "refetchReproducible": REFETCH[s["fmt"]],
    }
    if s.get("publishedAtNote"):
        rec["publishedAtNote"] = s["publishedAtNote"]
    if "projection" in d:
        rec["canonicalProjection"] = d["projection"]
        rec["rawBytesHashSessionOnly"] = d["contentHash"]
        rec["offsetBasis"] = "Unicode code points of the h2t-v1 projection"
    elif s["fmt"] in ("md", "text"):
        rec["offsetBasis"] = "Unicode code points of the captured file decoded as UTF-8 (the capture artifact itself)"
    if s.get("observedAt"):
        rec["observedAt"] = s["observedAt"]
    if s.get("archiveUri"):
        rec["archiveUri"] = s["archiveUri"]
    if s.get("revisionKind"):
        rec["revisionKind"] = s["revisionKind"]
        rec["revisesSnapshotUid"] = snap_uid(s["revisesSnapshot"])
    return rec


def json_pointer(doc, ptr):
    cur = doc
    for tok in ptr.lstrip("/").split("/"):
        tok = tok.replace("~1", "/").replace("~0", "~")
        cur = cur[int(tok)] if isinstance(cur, list) else cur[tok]
    return cur


def resolve_locator(fx, L):
    d = load(L["snap"])
    kind = L.get("kind", "TEXT_QUOTE")
    rec = {"ref": L["id"], "uid": f"hu:locator:fx-d13-{fx}-{L['id']}", "snapshot": L["snap"], "selectorKind": kind}
    if L.get("section"):
        rec["section"] = L["section"]
    if kind == "TEXT_QUOTE":
        text, exact = d["text"], L["exact"]
        base = text.find(L["after"]) if L.get("after") else 0
        if base < 0:
            raise SystemExit(f"[{fx}/{L['id']}] anchor not found: {L['after']!r}")
        i = text.find(exact, base)
        if i < 0:
            raise SystemExit(f"[{fx}/{L['id']}] QUOTE NOT FOUND in {L['snap']}: {exact[:80]!r}")
        j = i + len(exact)
        assert text[i:j] == exact
        occ = text.count(exact)
        prefix, suffix = text[max(0, i - 32):i], text[j:j + 32]
        sel = {"type": "TextQuoteSelector", "exact": exact, "prefix": prefix, "suffix": suffix,
               "refinedBy": {"type": "TextPositionSelector", "start": i, "end": j},
               "basis": (d.get("projection") or {}).get("method", "capture file, UTF-8 code points")}
        rec.update({"exact": exact, "prefix": prefix, "suffix": suffix, "startOffset": i, "endOffset": j,
                    "occurrencesInSnapshot": occ})
        res = f"exact match at [{i},{j}) of the fresh capture" + ("" if occ == 1 else f"; {occ} occurrences, offsets disambiguate")
    elif kind == "JSON_POINTER":
        v = json_pointer(d["json"], L["pointer"])
        exact = v if isinstance(v, str) else canon(v)
        if "expect" in L and exact != L["expect"]:
            raise SystemExit(f"[{fx}/{L['id']}] JSON value mismatch at {L['pointer']}: {exact!r} != {L['expect']!r}")
        sel = {"type": "JsonPointerSelector", "pointer": L["pointer"], "valueSerialization": "string value as-is; objects as canonical JSON (sorted keys, no whitespace)"}
        rec.update({"pointer": L["pointer"], "exact": exact})
        res = "pointer resolves in the fresh capture; value equals exact"
    elif kind == "HTML":
        m = re.search(rb"<title>(.*?)</title>", d["raw"], re.S)
        exact = htmllib.unescape(m.group(1).decode("utf-8")).strip()
        if exact != L["expect"]:
            raise SystemExit(f"[{fx}/{L['id']}] title mismatch: {exact!r}")
        sel = {"type": "CssSelector", "value": "head > title", "textContent": "first match, HTML-unescaped, trimmed"}
        rec.update({"css": "head > title", "exact": exact})
        res = "css selector re-selected in the fresh capture; text equals exact"
    elif kind == "EDGAR_ACCESSION":
        recent = d["json"]["filings"]["recent"]
        i = recent["accessionNumber"].index(L["accession"])
        v = recent[L["field"]][i]
        exact = v if isinstance(v, str) else canon(v)
        if exact != L["expect"]:
            raise SystemExit(f"[{fx}/{L['id']}] {L['field']} of {L['accession']}: {exact!r} != {L['expect']!r}")
        kind = "API_RECORD"
        rec["selectorKind"] = kind
        rule = f"edgar-accession/v1: in /filings/recent, take the index i where accessionNumber[i] = {L['accession']}, return {L['field']}[i]"
        sel = {"type": "RecordFieldSelector", "rule": "edgar-accession/v1", "arrayRoot": "/filings/recent",
               "recordKey": {"accessionNumber": L["accession"]}, "field": L["field"]}
        rec.update({"rule": rule, "exact": exact})
        res = f"rule re-run over the fresh capture: index {i} in this capture (positions shift with every new filing; the accession number is the anchor); value equals exact"
    elif kind == "WHOLE_SNAPSHOT":
        sel = {"type": "WholeSnapshot", "rule": L["rule"]}
        rec.update({"rule": L["rule"], "observation": L["observation"]})
        res = "rule re-run over the fresh capture: " + L["check"](d)
        exact = None
    else:
        raise SystemExit("unknown kind " + kind)
    if exact is not None:
        rec["quoteHash"] = sha_bytes(re.sub(r"\s+", " ", exact).strip().encode("utf-8"))
    rec["selectorJson"] = canon(sel)
    rec["selectorDigest"] = sha_bytes(rec["selectorJson"].encode("utf-8"))
    if L.get("note"):
        rec["note"] = L["note"]
    rec["verified"] = {"on": RETRIEVED, "against": d["projection"]["hash"] if "projection" in d else d["contentHash"], "result": res}
    return rec


# ----------------------------------------------------------------------------------------------------------------
# Entities (owned by other modules; fixture uids) and agents
# ----------------------------------------------------------------------------------------------------------------
ENT = {
    "madrigal": dict(uid="hu:org:fx-madrigal-pharmaceuticals", type="D7.Organization", name="Madrigal Pharmaceuticals, Inc.", identifiers=[{"scheme": "SEC_CIK", "value": "0001157601"}]),
    "hercules": dict(uid="hu:org:fx-hercules-capital", type="D7.Organization", name="Hercules Capital, Inc.", identifiers=[]),
    "cowen": dict(uid="hu:org:fx-cowen-and-company", type="D7.Organization", name="Cowen and Company, LLC", identifiers=[]),
    "fda": dict(uid="hu:org:fx-us-fda", type="D7.Organization", name="U.S. Food and Drug Administration", identifiers=[]),
    "springer": dict(uid="hu:org:fx-springer-nature", type="D7.Organization", name="Springer Nature (Nature; Crossref publisher name 'Springer Science and Business Media LLC')", identifiers=[]),
    "rw": dict(uid="hu:org:fx-retraction-watch", type="D7.Organization", name="Retraction Watch (Crossref update source 'retraction-watch'; database 'gathered from publisher websites', Crossref documentation S26)", identifiers=[]),
    "nlm": dict(uid="hu:org:fx-us-nlm", type="D7.Organization", name="U.S. National Library of Medicine (PubMed)", identifiers=[]),
    "bioage": dict(uid="hu:org:fx-bioage-labs", type="D7.Organization", name="BioAge Labs, Inc.", identifiers=[{"scheme": "SEC_CIK", "value": "0001709941"}]),
    "bpdive": dict(uid="hu:org:fx-biopharma-dive", type="D7.Organization", name="BioPharma Dive", identifiers=[]),
    "lesne": dict(uid="hu:person:fx-sylvain-lesne", type="D7.Person", name="Sylvain Lesné", identifiers=[]),
    "ashe": dict(uid="hu:person:fx-karen-h-ashe", type="D7.Person", name="Karen H. Ashe", identifiers=[]),
    "resmetirom": dict(uid="hu:substance:fx-resmetirom", type="D1.ChemicalSubstance", name="resmetirom", identifiers=[]),
    "azelaprag": dict(uid="hu:substance:fx-azelaprag", type="D1.ChemicalSubstance", name="azelaprag", identifiers=[]),
    "maestro": dict(uid="hu:study:fx-nct03900429", type="D3.Study", name="MAESTRO-NASH", identifiers=[{"scheme": "NCT", "value": "NCT03900429", "resolvedBy": "ClinicalTrials.gov API v2 record NCT03900429 (acronym MAESTRO-NASH, locator l11 of madrigal-maestro-nash-topline-8k); the 8-Ks do not print the NCT id"}]),
    "strides": dict(uid="hu:study:fx-nct06515418", type="D3.Study", name="STRIDES", identifiers=[{"scheme": "NCT", "value": "NCT06515418"}]),
    "transaminase": dict(uid="hu:condition:fx-icd10cm-r74-01", type="D2.Condition", name="Elevation of levels of liver transaminase levels", identifiers=[{"scheme": "ICD10CM", "value": "R74.01", "resolvedBy": "ICD-10 MCP lookup_code R74.01 as_of 2024-12-06 (in effect FY2025)"}]),
    "lesne2006": dict(uid="hu:publication:fx-doi-10-1038-nature04533", type="D3.Publication", name="A specific amyloid-beta protein assembly in the brain impairs memory (Nature 440:352-7, 2006)", identifiers=[{"scheme": "DOI", "value": "10.1038/nature04533"}, {"scheme": "PMID", "value": "16541076"}]),
    "src-nature04533": dict(uid="hu:source:www-nature-com-articles-nature04533", type="K.Source", name="https://www.nature.com/articles/nature04533 (kernel Source of the original article page)", identifiers=[]),
    "rec-nda217785": dict(uid="hu:reg-record:fx-us-fda-drug-application-action-nda217785-orig-1", type="D8.RegulatoryRecord", name="Drugs@FDA action NDA217785 ORIG-1 (AP, 2024-03-14) — D8 record (fixture uid)", identifiers=[{"scheme": "FDA_APPLICATION", "value": "NDA217785"}]),
    "f-mash": dict(uid="hu:frontier:mash-fibrosis-resolution", type="D13.Frontier", name="frontier:mash-fibrosis-resolution (vocab-frontiers.yaml@0.2.0)", identifiers=[]),
    "f-alz": dict(uid="hu:frontier:alzheimers-disease-modification", type="D13.Frontier", name="frontier:alzheimers-disease-modification (vocab-frontiers.yaml@0.2.0)", identifiers=[]),
    "f-muscle": dict(uid="hu:frontier:muscle-preserving-weight-loss", type="D13.Frontier", name="frontier:muscle-preserving-weight-loss (vocab-frontiers.yaml@0.2.0)", identifiers=[]),
    "curator": dict(uid="hu:agent:d13-frontier-curator", type="K.Agent", name="agent:d13-frontier-curator", identifiers=[]),
    "linker": dict(uid="hu:agent:d13-event-linker", type="K.Agent", name="agent:d13-event-linker", identifiers=[]),
}

EVENTS = {
    "ev-readout": dict(uid="hu:event:fx-mdgl-maestro-nash-topline-2022-12-19", eventKind="READOUT", name="MAESTRO-NASH topline results (resmetirom)",
                       identityKey="READOUT|hu:study:fx-nct03900429|-|2022-12-19/DAY", mintedFrom="s-mdgl-8k-2022-12-19 (EVENT_OCCURRED a01; primary subject a06)"),
    "ev-nda-sub": dict(uid="hu:event:fx-mdgl-resmetirom-nda-submission-us", eventKind="REGULATORY_SUBMISSION", name="Resmetirom NDA submission (US, Subpart H accelerated approval)",
                       identityKey="REGULATORY_SUBMISSION|hu:substance:fx-resmetirom|US|[2023-01-01,2023-07-01)/MONTH", jurisdiction="US",
                       mintedFrom="s-mdgl-8k-2022-12-19 (EVENT_SCHEDULED a09, the guided window as first stated; 'Subpart H' = 21 CFR 314 Subpart H, US; primary subject a10). Frozen: the occurrence 2023-06-30 (pdufa fixture) attaches by window overlap, it does not re-key"),
    "ev-hercules": dict(uid="hu:event:fx-mdgl-hercules-milestone-tranche-2022-12-19", eventKind="FINANCING", name="Hercules loan clinical-milestone tranche becomes available to Madrigal",
                        identityKey="FINANCING|hu:org:fx-madrigal-pharmaceuticals|-|2022-12-19/DAY|loan-tranche", mintedFrom="s-mdgl-8k-2022-12-23 (a01; primary subject = BORROWER a04; discriminator = instrument)"),
    "ev-atm": dict(uid="hu:event:fx-mdgl-atm-sales-2022-12-19", eventKind="FINANCING", name="Madrigal at-the-market common stock sales ($159.1M gross, Cowen as sales agent)",
                   identityKey="FINANCING|hu:org:fx-madrigal-pharmaceuticals|-|2022-12-19/DAY|atm-sales", mintedFrom="s-mdgl-8k-2022-12-23 (a11; primary subject = ISSUER a13; discriminator = instrument: same issuer, same day as the loan tranche)"),
    "ev-regdirect": dict(uid="hu:event:fx-mdgl-registered-direct-2022-12-21", eventKind="FINANCING", name="Madrigal $100M Series B preferred + common registered direct (securities purchase agreement)",
                         identityKey="FINANCING|hu:org:fx-madrigal-pharmaceuticals|-|2022-12-21/DAY|registered-direct", mintedFrom="s-mdgl-8k-2022-12-23 (a06; primary subject = ISSUER a09)"),
    "ev-accept": dict(uid="hu:event:fx-mdgl-resmetirom-nda-acceptance-us-2023-09-12", eventKind="REGULATORY_ACCEPTANCE", name="FDA accepts resmetirom NDA for review with Priority Review",
                      identityKey="REGULATORY_ACCEPTANCE|hu:substance:fx-resmetirom|US|2023-09-12/DAY", jurisdiction="US", mintedFrom="s-mdgl-8k-2023-09-13 (a05; primary subject a26)"),
    "ev-approval": dict(uid="hu:event:fx-mdgl-rezdiffra-approval-us-2024-03-14", eventKind="APPROVAL", name="FDA accelerated approval of Rezdiffra (resmetirom), NDA217785",
                        identityKey="APPROVAL|hu:substance:fx-resmetirom|US|[2024-03-14,2024-03-15)/DAY", jurisdiction="US",
                        mintedFrom="s-mdgl-ex991-2023-09-13 (PLANNED: EVENT_SCHEDULED a09, the PDUFA goal window; primary subject a18). Frozen: the occurrence on 2024-03-14 (two asserters) attaches by window overlap"),
    "ev-launch": dict(uid="hu:event:fx-mdgl-rezdiffra-launch-us-2024-04", eventKind="LAUNCH", name="Rezdiffra US commercial availability",
                      identityKey="LAUNCH|hu:substance:fx-resmetirom|US|[2024-04-01,2024-05-01)/MONTH", jurisdiction="US",
                      mintedFrom="s-mdgl-ex991-2024-03-14 (PLANNED: EVENT_SCHEDULED a21; primary subject a27). Frozen: 'In April 2024' (a23) attaches by window overlap"),
    "ev-retraction": dict(uid="hu:event:fx-retraction-nature04533-2024-06-24", eventKind="RETRACTION", name="Retraction of Lesné et al. 2006 (Nature, DOI 10.1038/nature04533)",
                          identityKey="RETRACTION|hu:publication:fx-doi-10-1038-nature04533|-|2024-06-24/DAY", mintedFrom="s-nature-retraction-note (a01; primary subject a03)"),
    "ev-signal": dict(uid="hu:event:fx-bioage-strides-transaminase-signal-2024-12-06", eventKind="SAFETY_SIGNAL", name="Liver transaminase elevations on azelaprag in STRIDES (disclosed 2024-12-06)",
                      identityKey="SAFETY_SIGNAL|hu:study:fx-nct06515418|-|2024-12-06/DAY", mintedFrom="s-bioage-release (a02; primary subject a04)"),
    "ev-discont": dict(uid="hu:event:fx-bioage-strides-discontinuation-2024-12-06", eventKind="PROGRAM_DISCONTINUATION", name="BioAge discontinues the STRIDES Phase 2 study",
                       identityKey="PROGRAM_DISCONTINUATION|hu:study:fx-nct06515418|-|2024-12-06/DAY", mintedFrom="s-bioage-release (a07; primary subject a10)"),
}


def ref_obj(r):
    if r in EVENTS:
        return {"uid": EVENTS[r]["uid"], "type": "D13.Event", "name": EVENTS[r]["name"]}
    e = ENT[r]
    return {"uid": e["uid"], "type": e["type"], "name": e["name"]}


def T(date, prec="DAY"):
    return None if date is None else (date + "T00:00:00Z" if len(date) == 10 else date)


def vt(frm=None, to=None, fp="DAY", tp=None, fb="STATED_BY_SOURCE", tb=None):
    v = {"validFrom": T(frm), "validTo": T(to)}
    v["validFromPrecision"] = fp if frm else None
    v["validToPrecision"] = (tp or fp) if to else None
    v["validFromBasis"] = fb if frm else "UNKNOWN"
    v["validToBasis"] = (tb or fb) if to else "UNKNOWN"
    return v


NO_VT = vt()


# ----------------------------------------------------------------------------------------------------------------
# Fixture definitions
# ----------------------------------------------------------------------------------------------------------------
FIX = {}

# ---- (1) madrigal-maestro-nash-topline-8k : unstructured-to-entity (directive 3.8) ----------------------------
FIX["madrigal-maestro-nash-topline-8k"] = dict(
    abbr="mnt",
    snaps=["s-mdgl-8k-2022-12-19", "s-mdgl-edgar-submissions", "s-ctgov-nct03900429"],
    locators=[
        dict(id="l01", snap="s-mdgl-8k-2022-12-19", section="Cover", exact="Date of Report (Date of earliest event reported): December 19, 2022"),
        dict(id="l02", snap="s-mdgl-8k-2022-12-19", section="Item 7.01 Regulation FD Disclosure",
             exact="On December 19, 2022, Madrigal Pharmaceuticals, Inc. (“Madrigal” or the “Company”) issued a press release announcing Phase 3 MAESTRO-NASH clinical trial topline results"),
        dict(id="l03", snap="s-mdgl-8k-2022-12-19", section="Item 8.01 Other Events",
             exact="Madrigal is conducting a pivotal Phase 3 MAESTRO-NASH clinical trial of resmetirom for the treatment of nonalcoholic steatohepatitis (NASH)."),
        dict(id="l04", snap="s-mdgl-8k-2022-12-19", section="Item 8.01 Other Events",
             exact="On December 19, 2022, Madrigal announced topline results, which are summarized below."),
        dict(id="l05", snap="s-mdgl-8k-2022-12-19", section="Item 8.01 / Efficacy Data",
             exact="Dual Primary Endpoints (52 Weeks) and Key Secondary Endpoint (24 weeks) Were Met"),
        dict(id="l06", snap="s-mdgl-8k-2022-12-19", section="Item 8.01 / New Drug Application Planning",
             exact="In the first half of 2023, Madrigal Pharmaceuticals intends to file a new drug application seeking Subpart H accelerated approval of resmetirom."),
        dict(id="l07", snap="s-mdgl-edgar-submissions", kind="EDGAR_ACCESSION", accession="0001193125-22-307935", field="filingDate", expect="2022-12-19",
             note="filing date of accession 0001193125-22-307935 = SourceSnapshot.publishedAt of the 8-K (document time, not an Event clock; CQ-TM-03)"),
        dict(id="l08", snap="s-mdgl-edgar-submissions", kind="EDGAR_ACCESSION", accession="0001193125-22-307935", field="items", expect="7.01,8.01",
             note="EDGAR item codes: a free structured event-type signal (8.01 other events)"),
        dict(id="l09", snap="s-ctgov-nct03900429", kind="JSON_POINTER", pointer="/protocolSection/identificationModule/briefTitle",
             expect="A Phase 3 Study to Evaluate the Efficacy and Safety of MGL-3196 (Resmetirom) in Patients With NASH and Fibrosis"),
        dict(id="l10", snap="s-ctgov-nct03900429", kind="JSON_POINTER", pointer="/protocolSection/designModule/phases", expect='["PHASE3"]'),
        dict(id="l11", snap="s-ctgov-nct03900429", kind="JSON_POINTER", pointer="/protocolSection/identificationModule/acronym", expect="MAESTRO-NASH",
             note="resolves the 8-K's 'MAESTRO-NASH' to NCT03900429 (identifier of the D3 Study)"),
    ],
)

# ---- (2) madrigal-financing-after-readout -------------------------------------------------------------------
FIX["madrigal-financing-after-readout"] = dict(
    abbr="mfin",
    snaps=["s-mdgl-8k-2022-12-23", "s-mdgl-ex991-2022-12-21", "s-mdgl-edgar-submissions"],
    locators=[
        dict(id="l01", snap="s-mdgl-8k-2022-12-23", section="Item 8.01 / Borrowing Availability Under Loan Agreement",
             exact="On December 19, 2022, as a result of the Company’s announcement of Phase 3 MAESTRO-NASH clinical trial topline results, the Company received confirmation from Hercules Capital, Inc. (“Hercules”) that it has satisfied the clinical development milestone under the Company’s previously disclosed Loan and Security Agreement"),
        dict(id="l02", snap="s-mdgl-8k-2022-12-23", section="Item 8.01 / Borrowing Availability Under Loan Agreement",
             exact="As a result of the achievement of the clinical development milestone, the Company is now eligible to borrow up to an additional $50 million under the Loan Agreement."),
        dict(id="l03", snap="s-mdgl-8k-2022-12-23", section="Item 1.01 / Securities Purchase Agreement",
             exact="On December 21, 2022, Madrigal Pharmaceuticals, Inc. (the “Company” or “Madrigal”) entered into a Securities Purchase Agreement (the “Securities Purchase Agreement”) with a group of institutional investors"),
        dict(id="l04", snap="s-mdgl-8k-2022-12-23", section="Item 1.01 / Securities Purchase Agreement",
             exact="The gross proceeds from the transaction will be $100 million in the aggregate before estimated transaction expenses"),
        dict(id="l05", snap="s-mdgl-8k-2022-12-23", section="Item 7.01 Regulation FD Disclosure",
             exact="On December 21, 2022, the Company issued a press release announcing the Offering and other financing updates."),
        dict(id="l06", snap="s-mdgl-ex991-2022-12-21", section="EX-99.1, CEO quote (Paul Friedman, M.D.)",
             exact="The financings secured following the positive topline readout of our\nPhase 3 MAESTRO-NASH trial reflect the strong support that Madrigal has established with long-standing strategic and institutional investors."),
        dict(id="l07", snap="s-mdgl-ex991-2022-12-21", section="EX-99.1 body",
             exact="In connection with Madrigal’s December 19, 2022 announcement of positive topline data from its pivotal Phase 3 MAESTRO-NASH clinical trial of\nresmetirom, Hercules Capital, Inc. (NYSE:HTGC) confirmed that Madrigal has achieved its clinical milestone under the Company’s Credit Facility with Hercules"),
        dict(id="l08", snap="s-mdgl-8k-2022-12-23", section="Cover", exact="Date of Report (Date of earliest event reported): December 19, 2022"),
        dict(id="l09", snap="s-mdgl-edgar-submissions", kind="EDGAR_ACCESSION", accession="0001193125-22-311537", field="filingDate", expect="2022-12-23",
             note="filed 2022-12-23 while the earliest event reported is 2022-12-19 (l08): filing time is SourceSnapshot.publishedAt, never an Event clock"),
        dict(id="l10", snap="s-mdgl-8k-2022-12-23", section="Item 8.01 / ATM Program Update",
             exact="On December 19, 2022, the Company sold 738,900 shares of Common Stock under its “at-the-market” sales program (“ATM Program”) pursuant to the Sales Agreement, dated June 1, 2021 with Cowen and Company, LLC (“Cowen”), for $159.1 million in gross proceeds before any discounts and fees, under the Sales Agreement."),
        dict(id="l11", snap="s-mdgl-ex991-2022-12-21", section="EX-99.1 body",
             exact="Madrigal has completed $159 million in gross sales of\ncommon stock under its ATM Program (“ATM Sales”)"),
        dict(id="l12", snap="s-mdgl-8k-2022-12-23", section="Item 8.01 / ATM Program Update",
             exact="Cowen and Company, LLC, acted as sales agent under the ATM Program."),
        dict(id="l13", snap="s-mdgl-ex991-2022-12-21", section="EX-99.1 sub-headline",
             exact="$259 Million in Equity Securities Sales and $50 Million in Additional Debt Financing Capacity"),
    ],
)

# ---- (3) madrigal-pdufa-to-accelerated-approval --------------------------------------------------------------
FIX["madrigal-pdufa-to-accelerated-approval"] = dict(
    abbr="mappr",
    snaps=["s-mdgl-8k-2023-06-30", "s-mdgl-8k-2023-07-17", "s-mdgl-8k-2023-09-13", "s-mdgl-ex991-2023-09-13", "s-mdgl-8k-2024-03-15",
           "s-mdgl-ex991-2024-03-14", "s-openfda-nda217785", "s-mdgl-ex991-2024-05-07"],
    locators=[
        dict(id="l01", snap="s-mdgl-8k-2023-06-30", section="Item 8.01 Other Events",
             exact="On June 30, 2023, Madrigal Pharmaceuticals, Inc. issued a press release announcing that it initiated a rolling submission of a New Drug Application to the U.S. Food and Drug Administration seeking accelerated approval of resmetirom for the treatment of NASH with liver fibrosis."),
        dict(id="l02", snap="s-mdgl-8k-2023-07-17", section="Item 8.01 Other Events",
             exact="On July 17, 2023, Madrigal Pharmaceuticals, Inc. issued a press release announcing that it completed its rolling submission of a New Drug Application to the U.S. Food and Drug Administration seeking accelerated approval of resmetirom"),
        dict(id="l03", snap="s-mdgl-8k-2023-09-13", section="Cover", exact="Date of Report (Date of earliest event reported): September 12, 2023"),
        dict(id="l04", snap="s-mdgl-ex991-2023-09-13", section="EX-99.1 dateline", exact="CONSHOHOCKEN, PA, September 13, 2023"),
        dict(id="l05", snap="s-mdgl-ex991-2023-09-13", section="EX-99.1 first paragraph",
             exact="today announced that the U.S. Food and Drug Administration (FDA) has accepted for review its New Drug Application (NDA) for resmetirom"),
        dict(id="l06", snap="s-mdgl-ex991-2023-09-13", section="EX-99.1 first paragraph",
             exact="The FDA has granted Priority Review and assigned a Prescription Drug User Fee Act date for resmetirom of March 14, 2024, the target date by which the FDA intends to complete its review and take action on the NDA."),
        dict(id="l07", snap="s-mdgl-ex991-2023-09-13", section="EX-99.1, CMO quote (Becky Taub, M.D.)",
             exact="The NDA is supported by the positive efficacy results\nobserved in our pivotal Phase 3 trial"),
        dict(id="l08", snap="s-mdgl-8k-2024-03-15", section="Item 8.01 Other Events",
             exact="On March 14, 2024, the Company announced that the FDA has granted accelerated approval of Rezdiffra™ (resmetirom) in conjunction with diet and exercise for the treatment of adults with noncirrhotic NASH with moderate to advanced liver fibrosis (consistent with stages F2 to F3 fibrosis)."),
        dict(id="l09", snap="s-mdgl-8k-2024-03-15", section="Item 8.01 Other Events", after="Other Events",
             exact="Continued approval for this indication may be contingent upon verification and description of clinical benefit in ongoing confirmatory trials."),
        dict(id="l10", snap="s-mdgl-ex991-2024-03-14", section="EX-99.1 dateline", exact="CONSHOHOCKEN, PA, March 14, 2024"),
        dict(id="l11", snap="s-mdgl-ex991-2024-03-14", section="EX-99.1 body",
             exact="The accelerated approval of Rezdiffra was based on results from the Phase 3 MAESTRO-NASH trial"),
        dict(id="l12", snap="s-mdgl-ex991-2024-03-14", section="EX-99.1 body",
             exact="MAESTRO-NASH remains ongoing as an outcomes study designed to generate confirmatory data that, if positive, will help verify clinical benefit and may support\nfull approval."),
        dict(id="l13", snap="s-mdgl-ex991-2024-03-14", section="EX-99.1 body",
             exact="Rezdiffra is expected to be available to patients in the U.S. in April and will be distributed through a"),
        dict(id="l14", snap="s-mdgl-ex991-2024-03-14", section="EX-99.1 headline bullets",
             exact="Rezdiffra becomes the first and only medication approved by the FDA for the treatment of NASH"),
        dict(id="l15", snap="s-openfda-nda217785", kind="JSON_POINTER", pointer="/results/0/submissions/0/submission_status_date", expect="20240314",
             note="ORIG-1 submission; sibling fields submission_type ORIG, submission_number 1"),
        dict(id="l16", snap="s-openfda-nda217785", kind="JSON_POINTER", pointer="/results/0/submissions/0/submission_status", expect="AP"),
        dict(id="l17", snap="s-openfda-nda217785", kind="JSON_POINTER", pointer="/results/0/sponsor_name", expect="MADRIGAL"),
        dict(id="l18", snap="s-openfda-nda217785", kind="JSON_POINTER", pointer="/results/0/submissions/0/review_priority", expect="PRIORITY"),
        dict(id="l19", snap="s-openfda-nda217785", kind="JSON_POINTER", pointer="/results/0/application_number", expect="NDA217785"),
        dict(id="l20", snap="s-mdgl-ex991-2024-05-07", section="EX-99.1 headline bullets",
             exact="In April 2024, product shipped and first patients received Rezdiffra"),
    ],
)

# ---- (4) lesne-2006-retraction : disconfirmation ------------------------------------------------------------
FIX["lesne-2006-retraction"] = dict(
    abbr="lesne",
    snaps=["s-nature-retraction-note", "s-crossref-nature04533", "s-crossref-retraction-note", "s-pubmed-16541076",
           "s-nature04533-wayback-2020", "s-nature04533-current"],
    locators=[
        dict(id="l01", snap="s-nature-retraction-note", section="notice body", exact="The authors wish to retract this article."),
        dict(id="l02", snap="s-nature-retraction-note", section="notice body",
             exact="which show signs of excessive manipulation, including splicing, duplication and the use of an eraser tool. The data cannot be verified from the records."),
        dict(id="l03", snap="s-nature-retraction-note", section="notice header",
             exact="Retraction to: _Nature_ [https://doi.org/10.1038/nature04533](https://doi.org/10.1038/nature04533) Published online 16 March 2006"),
        dict(id="l04", snap="s-nature-retraction-note", section="About this article", exact="- Published: 24 June 2024"),
        dict(id="l05", snap="s-nature-retraction-note", section="notice body",
             exact="Ming Teng Koh, Linda Kotilinek, Rakez Kayed, Charles G. Glabe, Michela Gallagher and Karen H. Ashe agree with the retraction."),
        dict(id="l06", snap="s-nature-retraction-note", section="notice body", exact="Sylvain Lesné disagrees with the retraction."),
        dict(id="l07", snap="s-crossref-nature04533", kind="JSON_POINTER", pointer="/message/updated-by/2",
             note="publisher-deposited retraction (source 'publisher', 2024-06-24)"),
        dict(id="l08", snap="s-crossref-nature04533", kind="JSON_POINTER", pointer="/message/updated-by/1",
             note="Retraction Watch retraction record (source 'retraction-watch', record-id 54364, 2024-06-24)"),
        dict(id="l09", snap="s-crossref-nature04533", kind="JSON_POINTER", pointer="/message/updated-by/0",
             note="Retraction Watch expression of concern (2022-07-14, record-id 54372)"),
        dict(id="l10", snap="s-crossref-retraction-note", kind="JSON_POINTER", pointer="/message/publisher", expect="Springer Science and Business Media LLC"),
        dict(id="l11", snap="s-crossref-nature04533", kind="JSON_POINTER", pointer="/message/title/0",
             expect="RETRACTED ARTICLE: A specific amyloid-β protein assembly in the brain impairs memory"),
        dict(id="l12", snap="s-pubmed-16541076", section="CommentsCorrections RetractionIn",
             exact="<CommentsCorrections RefType=\"RetractionIn\"><RefSource>Nature. 2024 Jul;631(8019):240. doi: 10.1038/s41586-024-07691-8.</RefSource><PMID Version=\"1\">38914864</PMID>"),
        dict(id="l13", snap="s-pubmed-16541076", section="PublicationTypeList", exact="<PublicationType UI=\"D016441\">Retracted Publication</PublicationType>"),
        dict(id="l14", snap="s-nature04533-wayback-2020", kind="HTML", expect="A specific amyloid-β protein assembly in the brain impairs memory | Nature",
             note="pre-revision snapshot of the original article page (no retraction marker: 0 case-insensitive matches of 'retract' in the archived HTML)"),
        dict(id="l15", snap="s-nature04533-current", section="article banner",
             exact="This article has been retracted. Please see the Retraction Notice for more detail:"),
    ],
)

# ---- (5) bioage-strides-discontinuation : harm ---------------------------------------------------------------


def _edgar_absence(d):
    r = d["json"]["filings"]["recent"]
    rows = [(r["filingDate"][i], r["form"][i]) for i in range(len(r["form"])) if "2024-12-06" <= r["filingDate"][i] <= "2024-12-31"]
    eightk = [x for x in rows if x[1].startswith("8-K")]
    return f"filings 2024-12-06..2024-12-31 = {rows}; 8-K count = {len(eightk)}"


FIX["bioage-strides-discontinuation"] = dict(
    abbr="bioage",
    snaps=["s-bioage-release", "s-ctgov-nct06515418", "s-biopharmadive-bioage", "s-bioage-edgar-submissions"],
    locators=[
        dict(id="l01", snap="s-bioage-release", section="dateline", exact="RICHMOND, Calif., Dec. 06, 2024 (GLOBE NEWSWIRE) -- BioAge Labs (Nasdaq: BIOA)"),
        dict(id="l02", snap="s-bioage-release", section="lede",
             exact="today announced that the Company has made the decision to discontinue the ongoing STRIDES Phase 2 study of its investigational drug candidate azelaprag as monotherapy and in combination with tirzepatide after liver transaminitis without clinically significant symptoms was observed in some subjects receiving azelaprag."),
        dict(id="l03", snap="s-bioage-release", section="CEO quote (Kristen Fortney, PhD)",
             exact="We made the difficult decision to discontinue the STRIDES Phase 2 study of azelaprag because it became clear that the emerging safety profile of the current doses tested is not consistent with our goal of a best-in-class oral obesity therapy."),
        dict(id="l04", snap="s-bioage-release", section="body ¶4",
             exact="Of 204 subjects enrolled in STRIDES as of today, 11 subjects in the azelaprag treatment groups were observed to have transaminase elevations with no clinically significant symptoms."),
        dict(id="l05", snap="s-bioage-release", section="body ¶4", exact="Dosing of all subjects will be discontinued, and no additional subjects will be enrolled."),
        dict(id="l06", snap="s-bioage-release", section="About BioAge Labs",
             exact="azelaprag, is an orally available small molecule agonist of APJ that was observed to promote metabolism and prevent muscle atrophy on bed rest in a Phase 1b clinical trial."),
        dict(id="l07", snap="s-ctgov-nct06515418", kind="JSON_POINTER", pointer="/protocolSection/statusModule/whyStopped",
             expect="Dosing of both study drugs has been discontinued due to observation of liver transaminitis without clinically significant symptoms in some subjects receiving azelaprag. All participant visits have been completed."),
        dict(id="l08", snap="s-ctgov-nct06515418", kind="JSON_POINTER", pointer="/protocolSection/statusModule/overallStatus", expect="TERMINATED"),
        dict(id="l09", snap="s-ctgov-nct06515418", kind="JSON_POINTER", pointer="/protocolSection/sponsorCollaboratorsModule/leadSponsor/name", expect="BioAge Labs, Inc."),
        dict(id="l10", snap="s-biopharmadive-bioage", section="article body",
             exact="Shares in BioAge, which closed Friday at just over $20 apiece, plunged by two-thirds in post-market trading Friday."),
        dict(id="l11", snap="s-bioage-edgar-submissions", kind="WHOLE_SNAPSHOT", rule="edgar-form-window/v1: list filings with filingDate in [2024-12-06, 2024-12-31]; count forms starting with 8-K",
             observation="no 8-K in the window; one Form 4 filed 2024-12-20", check=_edgar_absence,
             note="absence evidence for Q-D13-22 (the submissions index is COMPLETE for the 155 recent filings, so it can support an absence observation; it is a computed corroboration check, not an Assertion)"),
    ],
)


# (adversarial-review pass) fill_pointer_indices() removed: EDGAR submissions-index locators are EDGAR_ACCESSION rule
# selectors anchored on the accession number, so a fresh capture with new filings re-selects the same filing.

# ----------------------------------------------------------------------------------------------------------------
# Assertions
# ----------------------------------------------------------------------------------------------------------------
ADJ_OK = [{"kind": "CAPTURE_FIDELITY", "expectedVerdict": "DIRECTLY_SUPPORTED", "expectedStatus": "ACCEPTED"}]


def A(ref, predicate, subj, *, obj=None, lit=None, asserter, ev, valid=NO_VT, kind="FIELD", speech="STATES", basis="UNSTATED",
      polarity="POSITIVE", qual=None, edge=None, adj=None, materializes=None, producer="agent:d13-event-linker", supersedes=None,
      note=None, claimType=None, statedTense=None, speaker=None, derivationRule=None):
    a = {"ref": ref, "predicate": predicate, "assertionKind": kind}
    if claimType:
        a["claimType"] = claimType
    a["subject"] = ref_obj(subj)
    if obj:
        a["object"] = ref_obj(obj)
    if lit is not None:
        a["literal"] = lit
    a["assertedBy"] = ref_obj(asserter)
    if speaker:
        a["speakerLabelInSource"] = speaker
    a.update({"speechAct": speech, "basisKind": basis, "polarity": polarity})
    if statedTense:
        a["statedTense"] = statedTense
    if derivationRule:
        a["derivationRule"] = derivationRule
    a["qualifiers"] = qual or []
    a["validTime"] = valid
    a["evidence"] = [{"locator": e, "role": "SUPPORTS", "origin": "DECLARED"} for e in ev]
    if supersedes:
        a["supersedesRef"] = supersedes
    if materializes:
        a["materializes"] = materializes
    if edge:
        a["projectsTo"] = edge
    a["expectedAdjudications"] = adj or ADJ_OK
    a["producerAgent"] = producer
    if note:
        a["note"] = note
    return a


def EDGE(t, frm, to, props="AssertedRecordedProperties", extra=None, gate=None):
    # check stage (2026-10-08): kernel AssertedRecordedProperties (M10) replaces AssertedEdgeProperties with null valid bounds
    e = {"relationship": t, "from": ref_obj(frm)["uid"], "to": ref_obj(to)["uid"], "edgeProperties": props,
         "episode": "recorded time only: recordedFrom = Assertion.recordedAt, recordedTo null (valid time stays on the Assertion)"}
    if extra:
        e.update(extra)
    if gate:
        e["projectionGate"] = gate
    return e


SUPPORT_OK = {"kind": "SUPPORT", "expectedVerdict": "DIRECTLY_SUPPORTED", "effect": "projects the typed edge"}
SUPPORT_QUAL = lambda facets: {"kind": "SUPPORT", "expectedVerdict": "SUPPORTED_WITH_QUALIFICATION", "unsupportedFacets": facets, "effect": "projects the typed edge"}
CTX_ONLY = [{"kind": "CAPTURE_FIDELITY", "expectedVerdict": "CONTEXT_ONLY", "expectedStatus": "REJECTED",
             "rationale": "the span states temporal order only; the record over-reads it as a basis"},
            {"kind": "SUPPORT", "expectedVerdict": "CONTEXT_ONLY", "effect": "no edge; the pair is only a computed FOLLOWS (valid-time-order-v1)"}]

ASSERTIONS = {}

ASSERTIONS["madrigal-maestro-nash-topline-8k"] = [
    A("a01", "EVENT_OCCURRED", "ev-readout", asserter="madrigal", ev=["l04"], valid=vt("2022-12-19"),
      materializes="Event.startedAt = 2022-12-19 (DAY), timeAssertionUid; eventStatus OCCURRED"),
    A("a02", "EVENT_ANNOUNCED", "ev-readout", asserter="madrigal", ev=["l02"], valid=vt("2022-12-19"),
      materializes="Event.announcedAt = 2022-12-19 (DAY), announcementAssertionUid"),
    A("a03", "READOUT_STAGE", "ev-readout", lit={"valueString": "TOPLINE"}, asserter="madrigal", ev=["l04"],
      materializes="Event.readoutStage = TOPLINE"),
    A("a04", "PRIMARY_ENDPOINT_STATEMENT", "ev-readout", lit={"valueString": "MET"}, asserter="madrigal", ev=["l05"],
      materializes="Event.primaryEndpointStatement = MET (capture of the sponsor's heading, never BellLabs' judgment of the result)",
      qual=["endpoints=dual primary (52 weeks) and key secondary (24 weeks) as headed by the sponsor"]),
    A("a05", "EVENT_ABOUT", "ev-readout", obj="resmetirom", asserter="madrigal", ev=["l03"], kind="RELATIONSHIP"),
    A("a06", "EVENT_ABOUT", "ev-readout", obj="maestro", asserter="madrigal", ev=["l03"], kind="RELATIONSHIP", qual=["primary=true"],
      note="primary subject of the READOUT (identity rule); the span names MAESTRO-NASH; the NCT id NCT03900429 is resolved from the registry record (l11; identifier on the D3 Study, not stated in this 8-K)"),
    A("a07", "INVOLVES", "ev-readout", obj="madrigal", asserter="madrigal", ev=["l03"], kind="RELATIONSHIP",
      qual=["role=SPONSOR"], edge=EDGE("INVOLVES", "ev-readout", "madrigal", "EventRoleEdgeProperties", {"role": "SPONSOR"})),
    A("a08", "ON_FRONTIER", "ev-readout", obj="f-mash", asserter="curator", ev=["l03", "l05"], kind="RELATIONSHIP",
      producer="agent:d13-frontier-curator", qual=["frontierVocabVersion=0.2.0", "milestoneKind=ms:pivotal-readout", "classificationRule=frontier-classification/v1"],
      edge=EDGE("ON_FRONTIER", "ev-readout", "f-mash"),
      note="curator classification against vocab-frontiers.yaml@0.2.0 (MASH/NASH synonym + 'pivotal Phase 3' -> ms:pivotal-readout); basisKind UNSTATED because the kernel has no curator-classification basis (11-open-questions.md)"),
    A("a09", "EVENT_SCHEDULED", "ev-nda-sub", asserter="madrigal", ev=["l06"], statedTense="FUTURE",
      valid=vt("2023-01-01", "2023-07-01", fp="MONTH", tp="MONTH"),
      materializes="Event.scheduledFrom = 2023-01-01, scheduledTo = 2023-07-01 (half-open, MONTH/MONTH); eventStatus PLANNED as recorded from this snapshot",
      note="'In the first half of 2023' = [2023-01-01, 2023-07-01) with MONTH precision on both bounds (no HALF_YEAR precision needed)"),
    A("a10", "EVENT_ABOUT", "ev-nda-sub", obj="resmetirom", asserter="madrigal", ev=["l06"], kind="RELATIONSHIP", qual=["primary=true"]),
    A("a11", "INVOLVES", "ev-nda-sub", obj="madrigal", asserter="madrigal", ev=["l06"], kind="RELATIONSHIP", qual=["role=APPLICANT"],
      edge=EDGE("INVOLVES", "ev-nda-sub", "madrigal", "EventRoleEdgeProperties", {"role": "APPLICANT"}),
      note="APPLICANT is written because no D8 record documents a submission; once a record documents an event, the applicant is read from its ADDRESSED_TO (pdufa fixture a16)"),
    A("a12", "ON_FRONTIER", "maestro", obj="f-mash", asserter="curator", ev=["l09", "l10"], kind="RELATIONSHIP",
      producer="agent:d13-frontier-curator", qual=["frontierVocabVersion=0.2.1", "classificationRule=frontier-classification/v1"],
      edge=EDGE("ON_FRONTIER", "maestro", "f-mash"),
      note="Study side of ON_FRONTIER (Frontier.studies, direction IN; D3 declares nothing): the D3 Study MAESTRO-NASH classified onto frontier:mash-fibrosis-resolution from its registry record (Phase 3, 'Patients With NASH and Fibrosis'); exercises the pair D3 Q-D3-10, D2 Q-D2-27 and D10 Q-D10-20/22 depend on (adversarial-review pass)"),
]

ASSERTIONS["madrigal-financing-after-readout"] = [
    A("a01", "EVENT_OCCURRED", "ev-hercules", asserter="madrigal", ev=["l01"], valid=vt("2022-12-19"),
      materializes="Event.startedAt = 2022-12-19 (DAY)"),
    A("a02", "FINANCING_AMOUNT", "ev-hercules", lit={"valueNumber": 50000000, "unitCode": "iso4217:USD"}, asserter="madrigal", ev=["l02"],
      qual=["amountKind=BORROWING_CAPACITY", "amountBasis=AVAILABLE", "upTo=true (drawn amount not stated)"]),
    A("a03", "INVOLVES", "ev-hercules", obj="hercules", asserter="madrigal", ev=["l01"], kind="RELATIONSHIP", qual=["role=LENDER"],
      edge=EDGE("INVOLVES", "ev-hercules", "hercules", "EventRoleEdgeProperties", {"role": "LENDER"})),
    A("a04", "INVOLVES", "ev-hercules", obj="madrigal", asserter="madrigal", ev=["l01"], kind="RELATIONSHIP", qual=["role=BORROWER", "primary=true", "roleText=the Company (borrower under the Loan and Security Agreement)"],
      edge=EDGE("INVOLVES", "ev-hercules", "madrigal", "EventRoleEdgeProperties", {"role": "BORROWER"}),
      note="adversarial-review pass: BORROWER, not ISSUER (Madrigal is the borrower under the Loan and Security Agreement and issues no securities in this event); primary participant of the FINANCING (identity rule)"),
    A("a05", "LEADS_TO", "ev-readout", obj="ev-hercules", asserter="madrigal", ev=["l01", "l07"], kind="RELATIONSHIP",
      edge=EDGE("LEADS_TO", "ev-readout", "ev-hercules", gate="speechAct STATES; basis stated ('as a result of the Company’s announcement'); service check object.startedAt 2022-12-19 >= subject.startedAt 2022-12-19: pass"),
      adj=ADJ_OK + [SUPPORT_OK],
      note="l07 (EX-99.1, 'In connection with ...') is a second locator of the same proposition by the same asserter; l01 alone satisfies the gate"),
    A("a06", "EVENT_OCCURRED", "ev-regdirect", asserter="madrigal", ev=["l03"], valid=vt("2022-12-21"),
      materializes="Event.startedAt = 2022-12-21 (DAY; agreement date)"),
    A("a07", "EVENT_ANNOUNCED", "ev-regdirect", asserter="madrigal", ev=["l05"], valid=vt("2022-12-21"),
      materializes="Event.announcedAt = 2022-12-21 (DAY)"),
    A("a08", "FINANCING_AMOUNT", "ev-regdirect", lit={"valueNumber": 100000000, "unitCode": "iso4217:USD"}, asserter="madrigal", ev=["l04"],
      qual=["amountKind=GROSS_PROCEEDS", "amountBasis=COMMITTED", "before estimated transaction expenses; agreement signed, closing expected"]),
    A("a09", "INVOLVES", "ev-regdirect", obj="madrigal", asserter="madrigal", ev=["l03"], kind="RELATIONSHIP", qual=["role=ISSUER", "primary=true", "roleText=the “Company”"],
      edge=EDGE("INVOLVES", "ev-regdirect", "madrigal", "EventRoleEdgeProperties", {"role": "ISSUER"}),
      note="the investors are 'a group of institutional investors' (8-K) / 'two of its existing institutional investors' (EX-99.1), unnamed: no INVESTOR edge can be written"),
    A("a10", "LEADS_TO", "ev-readout", obj="ev-regdirect", asserter="madrigal", ev=["l06"], kind="RELATIONSHIP", speaker="Paul Friedman, M.D., Chief Executive Officer of Madrigal",
      adj=CTX_ONLY,
      note="NEGATIVE TEST: 'secured following the positive topline readout' is temporal wording. The candidate stays an Assertion (REJECTED by capture fidelity), the SUPPORT adjudication is CONTEXT_ONLY, no LEADS_TO episode is written; Q-D13-06 lists the pair under computed FOLLOWS (2022-12-19 -> 2022-12-21)"),
    A("a11", "EVENT_OCCURRED", "ev-atm", asserter="madrigal", ev=["l10"], valid=vt("2022-12-19"),
      materializes="Event.startedAt = 2022-12-19 (DAY; 'On December 19, 2022, the Company sold ...')"),
    A("a12", "FINANCING_AMOUNT", "ev-atm", lit={"valueNumber": 159100000, "unitCode": "iso4217:USD"}, asserter="madrigal", ev=["l10", "l11"],
      qual=["amountKind=GROSS_PROCEEDS", "amountBasis=SOLD", "before any discounts and fees (8-K); EX-99.1 rounds to '$159 million'"]),
    A("a13", "INVOLVES", "ev-atm", obj="madrigal", asserter="madrigal", ev=["l10"], kind="RELATIONSHIP", qual=["role=ISSUER", "primary=true", "roleText=the Company"],
      edge=EDGE("INVOLVES", "ev-atm", "madrigal", "EventRoleEdgeProperties", {"role": "ISSUER"})),
    A("a14", "INVOLVES", "ev-atm", obj="cowen", asserter="madrigal", ev=["l12"], kind="RELATIONSHIP", qual=["role=UNDERWRITER", "roleText=sales agent"],
      edge=EDGE("INVOLVES", "ev-atm", "cowen", "EventRoleEdgeProperties", {"role": "UNDERWRITER"})),
    A("a15", "LEADS_TO", "ev-readout", obj="ev-atm", asserter="madrigal", ev=["l06"], kind="RELATIONSHIP", speaker="Paul Friedman, M.D., Chief Executive Officer of Madrigal",
      adj=CTX_ONLY,
      note="NEGATIVE TEST (same span as a10): the CEO's 'financings secured following the positive topline readout' covers the ATM sales too; temporal wording, CONTEXT_ONLY, no LEADS_TO episode; Q-D13-06 lists the pair as temporal only (same day, order within the day not stated)"),
]

ASSERTIONS["madrigal-pdufa-to-accelerated-approval"] = [
    A("a01", "EVENT_OCCURRED", "ev-nda-sub", asserter="madrigal", ev=["l01"], valid=vt("2023-06-30"),
      materializes="(as recorded from the 2023-06-30 snapshot) Event.startedAt = 2023-06-30; eventStatus IN_PROGRESS (rolling submission started)"),
    A("a02", "EVENT_OCCURRED", "ev-nda-sub", asserter="madrigal", ev=["l01", "l02"], valid=vt("2023-06-30", "2023-07-18"), supersedes="a01",
      materializes="Event.startedAt = 2023-06-30, endedAt = 2023-07-18 (half-open; completed on 2023-07-17), eventStatus OCCURRED",
      note="supersedes a01 (recordedTo written once on a01). Against madrigal-maestro-nash-topline-8k a09 (window [2023-01-01, 2023-07-01)): started inside the guided window, completed 16 days after it closed -> computed ms:guidance-slip (Q-D13-11)"),
    A("a03", "JURISDICTION", "ev-nda-sub", lit={"valueString": "US"}, asserter="madrigal", ev=["l01"], materializes="Event.jurisdiction = US",
      note="span: 'to the U.S. Food and Drug Administration'"),
    A("a04", "LEADS_TO", "ev-readout", obj="ev-nda-sub", asserter="madrigal", ev=["l07"], kind="RELATIONSHIP", speaker="Becky Taub, M.D., Chief Medical Officer and President of Research & Development of Madrigal",
      edge=EDGE("LEADS_TO", "ev-readout", "ev-nda-sub", gate="speechAct STATES; basis stated ('The NDA is supported by the positive efficacy results observed in our pivotal Phase 3 trial'); time check 2023-06-30 >= 2022-12-19: pass"),
      adj=ADJ_OK + [SUPPORT_QUAL(["the span names the pivotal trial's efficacy results, of which the 2022-12-19 topline readout is the first disclosure; it does not name the topline announcement itself"])]),
    A("a05", "EVENT_OCCURRED", "ev-accept", asserter="madrigal", ev=["l03"], valid=vt("2023-09-12"),
      materializes="Event.startedAt = 2023-09-12 (8-K 'date of earliest event reported')"),
    A("a06", "EVENT_ANNOUNCED", "ev-accept", asserter="madrigal", ev=["l04", "l05"], valid=vt("2023-09-13"),
      materializes="Event.announcedAt = 2023-09-13 (press-release dateline; one day after the occurrence: CQ-TM-03)"),
    A("a07", "DESIGNATION_TYPE", "ev-accept", lit={"valueString": "PRIORITY_REVIEW"}, asserter="madrigal", ev=["l06"],
      materializes="Event.designationType = PRIORITY_REVIEW (review designation announced with the acceptance)"),
    A("a08", "DESIGNATION_TYPE", "ev-accept", lit={"valueString": "PRIORITY_REVIEW"}, asserter="fda", ev=["l18"], producer="agent:d13-event-linker",
      note="regulator's own record (openFDA review_priority PRIORITY on ORIG-1) corroborates the sponsor's statement: second asserter"),
    A("a09", "EVENT_SCHEDULED", "ev-approval", asserter="madrigal", ev=["l06"], statedTense="FUTURE", valid=vt("2024-03-14", "2024-03-15"),
      materializes="(as recorded from the 2023-09-13 snapshot) Event.scheduledFrom = 2024-03-14, scheduledTo = 2024-03-15 (PDUFA goal date D = [D, D+1 day), DAY); eventStatus PLANNED"),
    A("a10", "EVENT_OCCURRED", "ev-approval", asserter="madrigal", ev=["l08"], valid=vt("2024-03-14"),
      note="sponsor asserter of the occurrence"),
    A("a11", "EVENT_OCCURRED", "ev-approval", asserter="fda", ev=["l15", "l16", "l19"], valid=vt("2024-03-14"),
      materializes="Event.startedAt = 2024-03-14 (DAY), eventStatus OCCURRED, timeAssertionUid = this assertion under clockRule event-clock/v1 (regulator > filing > sponsor release)",
      note="regulator asserter of the same occurrence: two asserters, ONE Event (candidate match: same kind, primary subject, jurisdiction, and a date inside the PDUFA window the Event was minted from). submission_status_date '20240314' is parsed to 2024-03-14"),
    A("a12", "EVENT_ANNOUNCED", "ev-approval", asserter="madrigal", ev=["l10"], valid=vt("2024-03-14"), materializes="Event.announcedAt = 2024-03-14"),
    A("a13", "APPROVAL_PATHWAY", "ev-approval", lit={"valueString": "ACCELERATED"}, asserter="madrigal", ev=["l08"], materializes="Event.approvalPathway = ACCELERATED"),
    A("a14", "CONTINGENT_ON", "ev-approval", obj="maestro", asserter="madrigal", ev=["l09", "l12"], kind="RELATIONSHIP",
      adj=ADJ_OK + [SUPPORT_QUAL(["l09 says 'ongoing confirmatory trials' without naming them; l12 names MAESTRO-NASH as the outcomes study generating confirmatory data; the second outcomes trial is unnamed in the span and is not asserted"])],
      note="predicate-only (05 predicateOnly CONTINGENT_ON); Q-D13-12 reads it"),
    A("a15", "JURISDICTION", "ev-approval", lit={"valueString": "US"}, asserter="fda", ev=["l19"], basis="UNSTATED", derivationRule="regulator-jurisdiction/v1 (U.S. FDA record -> US)",
      materializes="Event.jurisdiction = US", note="jurisdiction follows from the regulator that holds the record; INFERRED is recorded on derivationRule because the kernel basis enum describes validity bounds"),
    A("a16", "DOCUMENTED_BY_RECORD", "ev-approval", obj="rec-nda217785", asserter="linker", ev=["l19", "l15", "l16"], kind="RELATIONSHIP",
      derivationRule="event-record-match/v1 (record application_number NDA217785, submission ORIG-1 status AP dated 20240314 = APPROVAL, primary subject and date of this Event)",
      edge=EDGE("DOCUMENTED_BY_RECORD", "ev-approval", "rec-nda217785"),
      note="adversarial-review pass: replaces INVOLVES REGULATOR (FDA) and APPLICANT (Madrigal). The D8 record carries ISSUED_BY FDA, ADDRESSED_TO Madrigal and issuedAt 2024-03-14 (d8RecordView below); the Event repeats none of them"),
    A("a18", "EVENT_ABOUT", "ev-approval", obj="resmetirom", asserter="madrigal", ev=["l08"], kind="RELATIONSHIP", qual=["primary=true"]),
    A("a19", "LEADS_TO", "ev-readout", obj="ev-approval", asserter="madrigal", ev=["l11"], kind="RELATIONSHIP",
      edge=EDGE("LEADS_TO", "ev-readout", "ev-approval", gate="speechAct STATES; basis stated ('was based on results from the Phase 3 MAESTRO-NASH trial'); time check 2024-03-14 >= 2022-12-19: pass"),
      adj=ADJ_OK + [SUPPORT_QUAL(["basis named is the trial's results (52-week primary analysis), of which the topline readout is the first disclosure"])]),
    A("a20", "ON_FRONTIER", "ev-approval", obj="f-mash", asserter="curator", ev=["l08", "l15"], kind="RELATIONSHIP", producer="agent:d13-frontier-curator",
      qual=["frontierVocabVersion=0.2.0", "milestoneKind=ms:first-approval", "classificationRule=frontier-classification/v1"], edge=EDGE("ON_FRONTIER", "ev-approval", "f-mash")),
    A("a21", "EVENT_SCHEDULED", "ev-launch", asserter="madrigal", ev=["l13"], statedTense="FUTURE", valid=vt("2024-04-01", "2024-05-01", fp="MONTH", tp="MONTH"),
      materializes="(as recorded from the 2024-03-14 snapshot) Event.scheduledFrom = 2024-04-01, scheduledTo = 2024-05-01 (MONTH); eventStatus PLANNED"),
    A("a22", "JURISDICTION", "ev-launch", lit={"valueString": "US"}, asserter="madrigal", ev=["l13"], materializes="Event.jurisdiction = US", note="span: 'in the U.S.'"),
    A("a23", "EVENT_OCCURRED", "ev-launch", asserter="madrigal", ev=["l20"], valid=vt("2024-04-01", fp="MONTH"),
      materializes="Event.startedAt = 2024-04-01 (MONTH precision: 'In April 2024'); eventStatus OCCURRED; the planned window was met"),
    A("a24", "ON_FRONTIER", "ev-launch", obj="f-mash", asserter="curator", ev=["l20"], kind="RELATIONSHIP", producer="agent:d13-frontier-curator",
      qual=["frontierVocabVersion=0.2.0", "milestoneKind=ms:launch", "classificationRule=frontier-classification/v1"], edge=EDGE("ON_FRONTIER", "ev-launch", "f-mash")),
    A("a25", "FIRST_OF_KIND_CLAIM", "ev-approval", asserter="madrigal", ev=["l14"], kind="CLAIM", claimType="COMPARATIVE",
      lit={"valueString": "first and only medication approved by the FDA for the treatment of NASH"},
      note="claim occurrence (kernel: assertionKind CLAIM, OCCURRENCE_OF -> Claim); Q-D13-17 checks it against BC-FIRST-APPROVAL computed from ON_FRONTIER APPROVAL events"),
    A("a26", "EVENT_ABOUT", "ev-accept", obj="resmetirom", asserter="madrigal", ev=["l05"], kind="RELATIONSHIP", qual=["primary=true"],
      note="primary subject of the acceptance (identity rule; added in the adversarial-review pass)"),
    A("a27", "EVENT_ABOUT", "ev-launch", obj="resmetirom", asserter="madrigal", ev=["l13", "l08"], kind="RELATIONSHIP", qual=["primary=true"],
      note="l13 names Rezdiffra; l08 resolves the brand to the substance ('Rezdiffra™ (resmetirom)'); primary subject of the launch (added in the adversarial-review pass)"),
]

ASSERTIONS["lesne-2006-retraction"] = [
    A("a01", "EVENT_OCCURRED", "ev-retraction", asserter="springer", ev=["l04", "l07"], valid=vt("2024-06-24"),
      note="publisher asserter: the notice's 'Published: 24 June 2024' and the publisher-deposited Crossref update (source 'publisher')"),
    A("a02", "EVENT_OCCURRED", "ev-retraction", asserter="rw", ev=["l08"], valid=vt("2024-06-24"), qual=["derivedFrom=hu:org:fx-springer-nature"],
      materializes="Event.startedAt = 2024-06-24 (both asserters agree; clockRule event-clock/v1 keeps the publisher's assertion as timeAssertionUid)",
      note="Retraction Watch asserter (Crossref update source 'retraction-watch', record-id 54364) of the SAME Event; Crossref is the carrier, not the asserter. Adversarial-review pass: a derived record, not an independent origin (Crossref: the database 'contains retractions gathered from publisher websites', S26), so Q-D13-22 counts one origin"),
    A("a03", "EVENT_ABOUT", "ev-retraction", obj="lesne2006", asserter="springer", ev=["l03"], kind="RELATIONSHIP", qual=["primary=true"]),
    A("a04", "STATED_REASON", "ev-retraction", lit={"valueString": "which show signs of excessive manipulation, including splicing, duplication and the use of an eraser tool. The data cannot be verified from the records."},
      asserter="springer", ev=["l02"], note="valueString is the located quote itself (Q-D13-08 'stated reason')"),
    A("a05", "INVOLVES", "ev-retraction", obj="springer", asserter="springer", ev=["l10"], kind="RELATIONSHIP", qual=["role=PUBLISHER"],
      edge=EDGE("INVOLVES", "ev-retraction", "springer", "EventRoleEdgeProperties", {"role": "PUBLISHER"})),
    A("a06", "INVOLVES", "ev-retraction", obj="lesne", asserter="springer", ev=["l06"], kind="RELATIONSHIP", qual=["role=AUTHOR", "authorStance=DISAGREES_WITH_RETRACTION"],
      edge=EDGE("INVOLVES", "ev-retraction", "lesne", "EventRoleEdgeProperties", {"role": "AUTHOR"})),
    A("a07", "INVOLVES", "ev-retraction", obj="ashe", asserter="springer", ev=["l05"], kind="RELATIONSHIP", qual=["role=AUTHOR", "authorStance=AGREES_WITH_RETRACTION"],
      edge=EDGE("INVOLVES", "ev-retraction", "ashe", "EventRoleEdgeProperties", {"role": "AUTHOR"}),
      note="one of six authors who agree (l05); the others are not written here to keep the fixture small"),
    A("a08", "ON_FRONTIER", "ev-retraction", obj="f-alz", asserter="curator", ev=["l03", "l01"], kind="RELATIONSHIP", producer="agent:d13-frontier-curator",
      qual=["frontierVocabVersion=0.2.0", "milestoneKind=ms:setback", "classificationRule=frontier-classification/v1"], edge=EDGE("ON_FRONTIER", "ev-retraction", "f-alz"),
      note="curated as a scientific-record setback (the Abeta*56 paper); whether a 2006 mouse study's retraction is a frontier milestone is a curator judgment that stays supersedable (11-open-questions.md)"),
    # kernel M6 records (check-stage open item 33, resolved in the adversarial-review pass): one HAS_REVISION_STATUS per authority
    A("a09", "HAS_REVISION_STATUS", "src-nature04533", lit={"valueString": "RETRACTION"}, asserter="springer", ev=["l04", "l07", "l15"], valid=vt("2024-06-24"),
      qual=["notice DOI 10.1038/s41586-024-07691-8", "Crossref updated-by source: publisher"],
      note="kernel predicate convention (K 09 item 12; owner kernel); the publisher is the authority of record and the one origin"),
    A("a10", "HAS_REVISION_STATUS", "src-nature04533", lit={"valueString": "RETRACTION"}, asserter="rw", ev=["l08"], valid=vt("2024-06-24"),
      qual=["Retraction Watch record-id 54364", "Crossref updated-by source: retraction-watch", "derivedFrom=hu:org:fx-springer-nature"],
      note="per-authority record kept (the kernel keeps every authority because dates can disagree); derived from the publisher's notice, not an independent origin"),
    A("a11", "HAS_REVISION_STATUS", "src-nature04533", lit={"valueString": "RETRACTION"}, asserter="nlm", ev=["l12", "l13"],
      valid=vt("2024-06-24", fb="PUBLICATION_PROXY"), qual=["PublicationType D016441 Retracted Publication", "CommentsCorrections RetractionIn PMID 38914864", "derivedFrom=hu:org:fx-springer-nature"],
      note="NLM indexes the publisher's notice (RetractionIn points at it) and states no retraction date of its own; validFrom is the notice's date as a proxy"),
    A("a12", "HAS_REVISION_STATUS", "src-nature04533", lit={"valueString": "EXPRESSION_OF_CONCERN"}, asserter="rw", ev=["l09"], valid=vt("2022-07-14"),
      qual=["Retraction Watch record-id 54372", "Crossref updated-by source: retraction-watch"],
      note="the 2022 publisher note it would derive from was not captured, so no derivedFrom is written (origin not checked); not curated as a D13 Event"),
]

ASSERTIONS["bioage-strides-discontinuation"] = [
    A("a01", "EVENT_ANNOUNCED", "ev-signal", asserter="bioage", ev=["l01"], valid=vt("2024-12-06"), materializes="Event.announcedAt = 2024-12-06"),
    A("a02", "EVENT_OCCURRED", "ev-signal", asserter="bioage", ev=["l04"], valid=vt("2024-12-06", fb="PUBLICATION_PROXY"),
      materializes="Event.startedAt = 2024-12-06 with startedAtBasis PUBLICATION_PROXY (the observation dates are not stated; 'as of today')"),
    A("a03", "EVENT_ABOUT", "ev-signal", obj="azelaprag", asserter="bioage", ev=["l04", "l02"], kind="RELATIONSHIP"),
    A("a04", "EVENT_ABOUT", "ev-signal", obj="strides", asserter="bioage", ev=["l04"], kind="RELATIONSHIP", qual=["primary=true"]),
    A("a05", "EVENT_ABOUT", "ev-signal", obj="transaminase", asserter="bioage", ev=["l04"], kind="RELATIONSHIP",
      note="'transaminase elevations' resolved to ICD-10-CM R74.01 by a RESOLUTION step (kernel Mention.resolvedTo); the concept is a D2 Condition (conditionKind PHENOTYPE; D2 10-seams: adverse-effect phenotypes are Conditions)"),
    A("a06", "STATED_CASE_COUNT", "ev-signal", lit={"valueNumber": 11, "unitCode": "{subjects}"}, asserter="bioage", ev=["l04"],
      qual=["denominator=204 subjects enrolled", "group=azelaprag treatment groups", "asOf=2024-12-06", "severity=no clinically significant symptoms"]),
    A("a07", "EVENT_OCCURRED", "ev-discont", asserter="bioage", ev=["l02", "l01"], valid=vt("2024-12-06"),
      materializes="Event.startedAt = 2024-12-06 (decision announced 'today')"),
    A("a08", "EVENT_ANNOUNCED", "ev-discont", asserter="bioage", ev=["l01"], valid=vt("2024-12-06"), materializes="Event.announcedAt = 2024-12-06"),
    A("a09", "DISCONTINUATION_SCOPE", "ev-discont", lit={"valueString": "TRIAL"}, asserter="bioage", ev=["l05", "l02"],
      materializes="Event.discontinuationScope = TRIAL (STRIDES only; the azelaprag program continues under evaluation)"),
    A("a10", "EVENT_ABOUT", "ev-discont", obj="strides", asserter="bioage", ev=["l02", "l08"], kind="RELATIONSHIP", qual=["primary=true"]),
    A("a11", "INVOLVES", "ev-discont", obj="bioage", asserter="bioage", ev=["l02", "l09"], kind="RELATIONSHIP", qual=["role=SPONSOR"],
      edge=EDGE("INVOLVES", "ev-discont", "bioage", "EventRoleEdgeProperties", {"role": "SPONSOR"})),
    A("a12", "RESPONDS_TO", "ev-discont", obj="ev-signal", asserter="bioage", ev=["l07"], kind="RELATIONSHIP",
      edge=EDGE("RESPONDS_TO", "ev-discont", "ev-signal", gate="speechAct STATES; stated basis 'discontinued due to observation of liver transaminitis' (registry whyStopped, written by the sponsor as responsible party); time check 2024-12-06 >= 2024-12-06: pass"),
      adj=ADJ_OK + [SUPPORT_OK], note="authorizing assertion of the RESPONDS_TO episode (highest SUPPORT verdict)"),
    A("a13", "RESPONDS_TO", "ev-discont", obj="ev-signal", asserter="bioage", ev=["l03"], kind="RELATIONSHIP", speaker="Kristen Fortney, PhD, CEO and co-founder of BioAge",
      adj=ADJ_OK + [SUPPORT_QUAL(["'emerging safety profile' is tied to the transaminitis signal by the release lede, not inside this span"])],
      note="corroborating assertion of the same link by the same asserter in the press release; recorded, not a second episode"),
    A("a14", "RESPONDS_TO", "ev-discont", obj="ev-signal", asserter="bioage", ev=["l02"], kind="RELATIONSHIP", adj=CTX_ONLY,
      note="NEGATIVE TEST (same rule as madrigal-financing-after-readout a10): the lede says the decision was made 'after' transaminitis was observed; temporal wording alone is CONTEXT_ONLY and would not project without a07/a12"),
    A("a15", "STATED_REASON", "ev-discont", lit={"valueString": "Dosing of both study drugs has been discontinued due to observation of liver transaminitis without clinically significant symptoms in some subjects receiving azelaprag. All participant visits have been completed."},
      asserter="bioage", ev=["l07"], note="registry whyStopped (structured second artifact kind); valueString is the located field value"),
    A("a16", "REPORTED_MARKET_MOVE", "ev-discont", obj="bioage", lit={"valueString": "plunged by two-thirds in post-market trading Friday"}, asserter="bpdive", ev=["l10"],
      kind="RELATIONSHIP", valid=vt("2024-12-06", fb="INFERRED"), derivationRule="weekday-resolution/v1 ('Friday' = 2024-12-06: the last Friday before the article's publication date 2024-12-07, and the release date)",
      note="a journalist's report (Gwendolyn Wu), never a BellLabs market fact; D13 owns this predicate (subject Event, object Organization), D7 owns market data series"),
    A("a17", "ON_FRONTIER", "ev-signal", obj="f-muscle", asserter="curator", ev=["l06", "l02"], kind="RELATIONSHIP", producer="agent:d13-frontier-curator",
      qual=["frontierVocabVersion=0.2.0", "milestoneKind=ms:safety-signal", "classificationRule=frontier-classification/v1"], edge=EDGE("ON_FRONTIER", "ev-signal", "f-muscle")),
    A("a18", "ON_FRONTIER", "ev-discont", obj="f-muscle", asserter="curator", ev=["l06", "l02"], kind="RELATIONSHIP", producer="agent:d13-frontier-curator",
      qual=["frontierVocabVersion=0.2.0", "milestoneKind=ms:setback", "classificationRule=frontier-classification/v1"], edge=EDGE("ON_FRONTIER", "ev-discont", "f-muscle")),
]

EXTRA = {}
EXTRA["madrigal-maestro-nash-topline-8k"] = {
    "path38": {
        "directive": "00-DIRECTIVE 3.8 effectiveness test: question -> chunk (vector index or MENTIONS) -> assertion(s) -> SourceLocator -> SourceSnapshot bytes; the verifier re-selects the same span",
        "question": "Q-D13-05 (entry phrase: 'resmetirom pivotal readout topline results')",
        "chunks": "computed below from the h2t-v1 projection by the named rule item-sections/v2: a chunk starts at each 8-K Item heading (the h2t-v1 table-cell line '| Item N.NN'), the Item 8.01 body is split once at its subheading 'Other MAESTRO-NASH Study Details', Forward-Looking Statements excluded. A hand-cut stand-in for D9's chunker (Chunk.chunkerVersion); v1 started c02 at the first 'Item 8.01' string, which is a cross-reference inside the Item 7.01 text",
        "retrieval": "vector index chunk_embedding (D9) or Chunk MENTIONS (derived, D9) -> resmetirom; no embedding was computed in this fixture: the expected top chunk is c02 (only chunk containing both 'resmetirom' and 'topline results'); MENTIONS(c02) would resolve resmetirom and MAESTRO-NASH",
        "walk": "Cypher in 03-retrieval-patterns.md#Q-D13-05 (unstructured entry), on D9's published names: Chunk -[:COVERS_LOCATOR]-> SourceLocator (derived span-overlap/v1 projection, i.e. the locators whose [startOffset, endOffset) lie inside the chunk span on the same snapshot) <-[:HAS_EVIDENCE {role SUPPORTS}]- Assertion -[:HAS_SUBJECT]-> Event; the bytes are the snapshot reached by SourceSnapshot -[:HAS_LOCATOR]-> SourceLocator (the chunk's own CHUNK_OF names the same snapshot)",
        "neverEvidence": "the chunk is never a locator and never evidence; the answer cites the Assertion's locator and the snapshot contentHash",
    },
}
EXTRA["madrigal-financing-after-readout"] = {
    "computedFollows": [
        {"pair": "ev-regdirect FOLLOWS ev-readout", "method": "valid-time-order-v1", "clocks": "2022-12-21 after 2022-12-19 (scope: same organization)", "note": "the only relation Q-D13-06 may show for this pair (a10 is CONTEXT_ONLY)"},
        {"pair": "ev-atm ~ ev-readout", "method": "valid-time-order-v1", "clocks": "both 2022-12-19 at DAY precision (order within the day not stated)", "note": "temporal only, same day (a15 is CONTEXT_ONLY)"},
    ],
    "notWritten": [
        "INVESTOR edges for the registered direct: investors are unnamed in both captures",
        "ON_FRONTIER for the three financings: no curator classification was written, so Q-D13-23's frontier-scoped pattern does not see them (the seam rule attaches only curated events)",
    ],
    "capitalInThisFilingByAmountKind": {
        "note": "adversarial-review pass: Q-D13-23 keeps amount kinds apart and never sums across them",
        "GROSS_PROCEEDS": "USD 259,100,000 = ATM 159,100,000 (SOLD, a12) + registered direct 100,000,000 (COMMITTED, a08); the sponsor's sub-headline rounds it to '$259 Million in Equity Securities Sales' (l13)",
        "BORROWING_CAPACITY": "USD 50,000,000 (AVAILABLE, up to; a02); sub-headline '$50 Million in Additional Debt Financing Capacity' (l13)",
    },
}
EXTRA["madrigal-pdufa-to-accelerated-approval"] = {
    "noEdgeWritten": [
        {"pair": "ev-nda-sub -> ev-accept", "why": "no captured sentence states the submission led to the acceptance; the acceptance names 'its New Drug Application' (document identity, D8 RegulatoryRecord NDA217785), so the pair is computed FOLLOWS (finding: process steps on one application are better linked through the D8 record than through LEADS_TO; 11-open-questions.md)"},
        {"pair": "ev-accept -> ev-approval", "why": "no captured span states the link; FOLLOWS only (2023-09-12 -> 2024-03-14)"},
        {"pair": "ev-approval -> ev-launch", "why": "no captured span states the link ('expected to be available ... in April' is a schedule, not a basis); FOLLOWS only"},
    ],
    "d8RecordView": {
        "note": "owned and written by D8 (not D13 assertions; shown so the two-hop read Event -DOCUMENTED_BY_RECORD-> RegulatoryRecord -ISSUED_BY/ADDRESSED_TO-> Organization is exercised by Q-D13-12/14)",
        "record": "hu:reg-record:fx-us-fda-drug-application-action-nda217785-orig-1 (recordKind DRUG_APPLICATION_ACTION, jurisdiction US, recordNumber NDA217785)",
        "ISSUED_BY": "U.S. FDA (the openFDA Drugs@FDA record, l19)",
        "ADDRESSED_TO": "Madrigal Pharmaceuticals (sponsor_name MADRIGAL, l17)",
        "issuedAt": "2024-03-14 (submission_status_date 20240314, l15)",
    },
    "chain": "ev-readout 2022-12-19 -LEADS_TO(a04)-> ev-nda-sub [2023-06-30, 2023-07-18) ~FOLLOWS~> ev-accept 2023-09-12 (announced 2023-09-13) ~FOLLOWS~> ev-approval 2024-03-14 (scheduled [2024-03-14, 2024-03-15), met on the day) ~FOLLOWS~> ev-launch April 2024 (scheduled April 2024, met); plus ev-readout -LEADS_TO(a19)-> ev-approval",
}
EXTRA["lesne-2006-retraction"] = {
    "kernelRevisionRecord": {
        "source": "https://www.nature.com/articles/nature04533 (kernel Source; the D9 Publication points at it)",
        "earlierSnapshot": "s-nature04533-wayback-2020 (archive capture observedAt 2020-08-12T22:19:37Z; title without retraction marker, locator l14)",
        "laterSnapshot": "s-nature04533-current (retrievedAt 2026-10-08; revisionKind RETRACTION, revisesSnapshotUid = the 2020 snapshot; banner locator l15)",
        "noticeSource": "the retraction note is its own Source (s-nature-retraction-note); D3 proposes REVISES Publication -> Publication for the notice -> original link",
        "expressionOfConcern": "2022-07-14 (Retraction Watch via Crossref, l09) is known only from metadata: no page snapshot between 2022-07-14 and 2024-06-24 is held, so no SourceSnapshot carries revisionKind EXPRESSION_OF_CONCERN; it is not curated as a D13 Event (not a frontier milestone)",
        "oneRecordOneView": "the revision is the kernel record; the RETRACTION Event is the frontier-milestone view and cites the same notice locators (vocab-frontiers.yaml section 5, RETRACTION)",
    },
    "notStored": [
        "CONTRADICTS: never an event -> claim or event -> event edge. A claim that rests on the Abeta*56 result is challenged by a kernel SUPPORT Adjudication or D10 Assessment with HAS_EVIDENCE {role: CONTRADICTS} on l01/l02 (00-DIRECTIVE 3.8)",
        "RESPONDS_TO: the notice says 'Concerns have been raised' but names no dated stimulus (not the 2022 expression of concern, not an investigation), so no RESPONDS_TO assertion is written",
    ],
    "pubmedCorroboration": "PMID 16541076 carries PublicationType 'Retracted Publication' (l13) and RetractionIn PMID 38914864 (l12): a third artifact kind, recorded as NLM's own HAS_REVISION_STATUS (a11) derived from the publisher's notice",
    "corroboration": {
        "question": "Q-D13-22",
        "independenceRule": "03-retrieval-patterns.md Q-D13-22: an asserter whose Assertion carries derivedFrom=<uid> counts with that origin",
        "origins": "1 primary origin, the publisher (Springer Nature), which is the authority of record for a retraction (notice + its own Crossref deposit); corroborated by 2 derived records (Retraction Watch a02/a10, NLM a11)",
        "gap": "not flagged: the one origin is the authority of record (RETRACTION_NOTICE genre)",
    },
}
EXTRA["bioage-strides-discontinuation"] = {
    "corroboration": {
        "question": "Q-D13-22",
        "artifacts": "press release (s-bioage-release) + registry record (s-ctgov-nct06515418, overallStatus TERMINATED, whyStopped) + trade press (s-biopharmadive-bioage, secondary)",
        "origins": "1 origin (BioAge: the press release and its own sponsor-entered registry text); BioPharma Dive re-tells the release (secondary, not an asserter of the occurrence; its own statement is the REPORTED_MARKET_MOVE a16)",
        "filing": "no 8-K: l11 (edgar-form-window/v1 over the BioAge submissions index) -> the event exists as a press release and a sponsor-entered registry change without a filing or regulator record; flagged 'single origin, no authority record' by the Q-D13-22 rule (same independence rule as lesne-2006-retraction)",
    },
    "harmChain": "ev-signal (SAFETY_SIGNAL, 11/204 with transaminase elevations) <-RESPONDS_TO(a12)- ev-discont (PROGRAM_DISCONTINUATION, scope TRIAL) ; market reaction is REPORTED_MARKET_MOVE by a journalist (a16), never an Event",
}


# ----------------------------------------------------------------------------------------------------------------
# Writers
# ----------------------------------------------------------------------------------------------------------------
class Dumper(yaml.SafeDumper):
    def ignore_aliases(self, data):
        return True


def _str_rep(dumper, data):
    if "\n" in data:
        return dumper.represent_scalar("tag:yaml.org,2002:str", data, style='"')
    return dumper.represent_scalar("tag:yaml.org,2002:str", data)


Dumper.add_representer(str, _str_rep)


def ydump(obj):
    return yaml.dump(obj, Dumper=Dumper, sort_keys=False, allow_unicode=True, width=200, default_flow_style=False)


def chunks_fc1():
    # item-sections/v2: chunk starts at the Item heading line ('| Item N.NN' + newline in the h2t-v1 projection), not at the
    # first occurrence of the string (v1 bug: 'summarized under Item 8.01 below' inside Item 7.01)
    t = load("s-mdgl-8k-2022-12-19")["text"]
    heads = {m.group(1): m.start(1) for m in re.finditer(r"\| (Item \d\.\d\d)\n", t)}
    a, b = heads["Item 7.01"], heads["Item 8.01"]
    c, d = t.find("Other MAESTRO-NASH Study Details"), t.find("Forward Looking Statements")
    assert a < b < c < d
    out = []
    for cid, s, e, label in [("c01", a, b, "Item 7.01"), ("c02", b, c, "Item 8.01 (efficacy, safety, NDA planning)"), ("c03", c, d, "Item 8.01 (other study details)")]:
        seg = t[s:e]
        out.append({"chunk": cid, "label": label, "startOffset": s, "endOffset": e, "chars": e - s,
                    "containsResmetirom": "resmetirom" in seg, "containsToplineResults": "topline results" in seg})
    return out


def build():
    summary = {}
    for name, fx in FIX.items():
        abbr = fx["abbr"]
        run = f"run:ft-D13-{name}"
        locs = [resolve_locator(abbr, L) for L in fx["locators"]]
        loc_by = {l["ref"]: l for l in locs}
        snaps = [snapshot_record(s) for s in fx["snaps"]]
        # assertions
        assertions = []
        for a in ASSERTIONS[name]:
            for e in a["evidence"]:
                if e["locator"] not in loc_by:
                    raise SystemExit(f"{name}/{a['ref']}: unknown locator {e['locator']}")
            a = dict(a)
            a["uid"] = f"hu:assertion:fx-d13-{abbr}-{a['ref']}"
            if "supersedesRef" in a:
                a["supersedesUid"] = f"hu:assertion:fx-d13-{abbr}-{a.pop('supersedesRef')}"
            a["evidence"] = [dict(e, locatorUid=loc_by[e["locator"]]["uid"]) for e in a["evidence"]]
            if a.get("projectsTo"):
                a["projectsTo"] = dict(a["projectsTo"], relationshipUid=f"hu:rel:fx-d13-{abbr}-{a['ref']}", assertionUid=a["uid"], lastWriterRunId=run)
            a["producedBy"] = {"missionId": MISSION, "runId": run}
            # key order: uid after ref
            ordered = {"ref": a["ref"], "uid": a["uid"]}
            ordered.update({k: v for k, v in a.items() if k not in ("ref", "uid")})
            assertions.append(ordered)
        used_events = sorted({r for a in ASSERTIONS[name] for r in [a["subject"]["uid"], (a.get("object") or {}).get("uid")] if r},
                             key=lambda u: u)
        ev_refs = [k for k, v in EVENTS.items() if v["uid"] in used_events]
        ent_refs = [k for k, v in ENT.items() if v["uid"] in used_events or v["uid"] in {a["assertedBy"]["uid"] for a in ASSERTIONS[name]}]
        doc = {
            "fixture": name,
            "producedByNote": FIXTURE_ID_NOTE,
            "kernelPattern": "packets/K/09-reasoning.md (A1): Assertion with exactly one subject, one object or literal, one asserter (ASSERTED_BY), HAS_EVIDENCE -> SourceLocator; typed D13 edges are projections of an accepted Assertion (AssertedRecordedProperties.assertionUid / EventRoleEdgeProperties)",
            "events": [dict({"ref": k}, **EVENTS[k]) for k in ev_refs],
            "entities": [dict({"ref": k}, **ENT[k]) for k in ent_refs],
            "assertions": assertions,
        }
        doc.update(EXTRA.get(name, {}))
        if name == "madrigal-maestro-nash-topline-8k":
            ch = chunks_fc1()
            doc["path38"]["chunks"] = ch
            c02 = ch[1]
            inside = [l["ref"] for l in locs if l.get("snapshot") == "s-mdgl-8k-2022-12-19" and l.get("startOffset") is not None
                      and l["startOffset"] >= c02["startOffset"] and l["endOffset"] <= c02["endOffset"]]
            doc["path38"]["locatorsInsideC02"] = inside
            doc["path38"]["assertionsReached"] = [a["ref"] + " " + a["predicate"] for a in assertions if any(e["locator"] in inside for e in a["evidence"])]
            snap = load("s-mdgl-8k-2022-12-19")
            doc["path38"]["snapshotBytes"] = {"contentHash": snap["projection"]["hash"], "contentHashBasis": "NORMALIZED_TEXT (h2t-v1 projection; reproducible by re-fetch)",
                                              "rawBytesHashSessionOnly": snap["contentHash"],
                                              "verifierReselect": "re-fetch the canonicalUri (or read the stored artifact) -> h2t-v1 -> check sha256 == contentHash -> slice [startOffset, endOffset) == exact for every locator above (done by _notes/tools/build_fixtures.py, result in locators.yaml verified.result)"}
        fdir = os.path.join(PKT, "07-fixtures", name)
        os.makedirs(fdir, exist_ok=True)
        with open(os.path.join(fdir, "locators.yaml"), "w", encoding="utf-8", newline="\n") as f:
            f.write(f"# {name} — locators (fixtures stage, A7, {RETRIEVED}; adversarial-review pass same day). Generated and re-verified against fresh captures by _notes/tools/build_fixtures.py.\n")
            f.write("# selectorKind values are the kernel SelectorKind enum (verification.v1 kinds + WHOLE_SNAPSHOT; EDGAR index fields use API_RECORD with rule edgar-accession/v1); offsets are code points (see snapshots[].offsetBasis); EDGAR HTML snapshots are identified by their h2t-v1 projection hash (contentHashBasis NORMALIZED_TEXT).\n")
            f.write(ydump({"fixture": name, "snapshots": snaps, "locators": locs}))
        with open(os.path.join(fdir, "assertions.yaml"), "w", encoding="utf-8", newline="\n") as f:
            f.write(f"# {name} — assertions (fixtures stage, A7, {RETRIEVED}; adversarial-review pass same day). Generated by _notes/tools/build_fixtures.py from verified locators.\n")
            f.write(ydump(doc))
        intent = make_intent(name, fx, snaps, locs, assertions, ev_refs, ent_refs)
        with open(os.path.join(fdir, "intent.json"), "w", encoding="utf-8", newline="\n") as f:
            json.dump(intent, f, ensure_ascii=False, indent=2)
            f.write("\n")
        summary[name] = {"locators": len(locs), "assertions": len(assertions), "snapshots": {s["ref"]: s["contentHash"] for s in snaps},
                         "projections": {s["ref"]: s["canonicalProjection"]["hash"] for s in snaps if "canonicalProjection" in s},
                         "edges": sorted({a["projectsTo"]["relationship"] for a in assertions if a.get("projectsTo")})}
    print(json.dumps(summary, indent=1, ensure_ascii=False))


# ----------------------------------------------------------------------------------------------------------------
# biotech-knowledge-intent.v1
# ----------------------------------------------------------------------------------------------------------------
TYPE_NAME = {"D13.Event": "Event", "D13.Frontier": "Frontier", "D7.Organization": "Organization", "D7.Person": "Person",
             "D1.ChemicalSubstance": "ChemicalSubstance", "D3.Study": "Study", "D2.Condition": "Condition", "D3.Publication": "Publication",
             "K.Agent": "Agent", "K.Source": "Source", "D8.RegulatoryRecord": "RegulatoryRecord"}
TYPED_EDGES = {"ON_FRONTIER", "LEADS_TO", "RESPONDS_TO", "INVOLVES", "DOCUMENTED_BY_RECORD"}
OBJECT_PREDICATES = {"EVENT_ABOUT", "CONTINGENT_ON", "REPORTED_MARKET_MOVE"}


def make_intent(name, fx, snaps, locs, assertions, ev_refs, ent_refs):
    run = f"run:ft-D13-{name}"
    uid2ref = {EVENTS[k]["uid"]: k for k in EVENTS}
    uid2ref.update({ENT[k]["uid"]: k for k in ENT})
    sources = []
    for s in snaps:
        sl = [l for l in locs if l["snapshot"] == s["ref"]]
        decl_locs = []
        for l in sl:
            d = {"ref": l["ref"], "selectorKind": l["selectorKind"]}
            if l.get("section"):
                d["section"] = l["section"][:400]
            if l.get("exact"):
                d["quote"] = l["exact"]
            if l.get("prefix"):
                d["quotePrefix"] = l["prefix"]
            if l.get("suffix"):
                d["quoteSuffix"] = l["suffix"]
            if l.get("startOffset") is not None:
                d["startOffset"], d["endOffset"] = l["startOffset"], l["endOffset"]
            d["properties"] = {"selectorJson": l["selectorJson"], "selectorDigest": l["selectorDigest"]}
            decl_locs.append(d)
        props = {"captureMethod": s["captureMethod"], "captureTool": s["captureTool"]}
        if s.get("canonicalProjection"):
            props["canonicalProjectionHash"] = s["canonicalProjection"]["hash"]
            props["rawBytesHashSessionOnly"] = s["rawBytesHashSessionOnly"]
        if s.get("publishedAt"):
            props["publishedAt"] = s["publishedAt"]
        if s.get("revisionKind"):
            props["revisionKind"] = s["revisionKind"]
            props["revisesSnapshotUid"] = s["revisesSnapshotUid"]
        if s.get("archiveUri"):
            props["archiveUri"] = s["archiveUri"]
        sources.append({
            "ref": s["ref"],
            "source": {"canonicalUri": s["source"]["canonicalUri"], "title": s["source"]["name"][:600], "sourceKind": s["source"]["sourceKind"],
                       "properties": {"genre": s["source"]["genre"]}},
            "snapshot": {"uid": s["uid"], "observedAt": s.get("observedAt", RETRIEVED + "T00:00:00Z"), "retrievedAt": RETRIEVED + "T00:00:00Z",
                         "contentHash": s["contentHash"], "contentHashBasis": s["contentHashBasis"], "captureCompleteness": "COMPLETE", "properties": props},
            "locators": decl_locs,
        })
    # locator refs must be unique across the intent: prefix with snapshot ordinal
    loc_ref = {}
    for si, s in enumerate(sources):
        for d in s["locators"]:
            new = f"{d['ref']}"
            loc_ref[d["ref"]] = new
    subjects = []
    created_events = set()
    for k in ev_refs:
        e = EVENTS[k]
        owner = FIXTURE_OF_EVENT.get(k)
        if owner == name:
            props = {"eventKind": e["eventKind"], "eventStatus": EVENT_STATUS[k], "identityKey": e["identityKey"]}
            if e.get("jurisdiction"):
                props["jurisdiction"] = e["jurisdiction"]
            subjects.append({"ref": k, "mode": "new", "nodeType": "Event", "name": e["name"], "uidSegment": e["uid"].split(":", 2)[2],
                             "properties": props, "onMatch": "review"})
            created_events.add(k)
        else:
            subjects.append({"ref": k, "mode": "resolved", "uid": e["uid"], "nodeType": "Event"})
    for k in ent_refs:
        e = ENT[k]
        subjects.append({"ref": k, "mode": "resolved", "uid": e["uid"], "nodeType": TYPE_NAME[e["type"]]})
    proposals, omitted = [], []
    for a in assertions:
        core = {"predicate": a["predicate"], "speechAct": a["speechAct"], "basisKind": a["basisKind"], "polarity": a["polarity"],
                "validity": {k: v for k, v in a["validTime"].items() if v is not None}}
        if a.get("statedTense"):
            core["statedTense"] = a["statedTense"]
        ev = [e["locator"] for e in a["evidence"]]
        subj = uid2ref[a["subject"]["uid"]]
        asserter = uid2ref[a["assertedBy"]["uid"]]
        pid = f"p-{a['ref']}"
        rationale = "; ".join(a["qualifiers"]) if a["qualifiers"] else None
        ctx_only = any(x.get("expectedVerdict") == "CONTEXT_ONLY" for x in a["expectedAdjudications"])
        if a["predicate"] in TYPED_EDGES:
            if ctx_only:
                omitted.append(f"{a['ref']} {a['predicate']} (CONTEXT_ONLY candidate: intent v1 has no 'assertion only, project after SUPPORT adjudication' proposal kind; edge.assert would write the episode at admission)")
                continue
            if a["predicate"] == "RESPONDS_TO" and not a.get("projectsTo"):
                omitted.append(f"{a['ref']} RESPONDS_TO (corroborating assertion of an edge already proposed by a12; needs the same missing proposal kind)")
                continue
            p = {"proposalId": pid, "kind": "edge.assert", "relationshipType": a["predicate"], "fromRef": subj, "toRef": uid2ref[a["object"]["uid"]],
                 "evidence": ev, "assertion": core, "edgeProperties": {}, "asserterRef": asserter}
            if a["predicate"] == "INVOLVES":
                p["edgeProperties"] = {"role": a["projectsTo"]["role"]}
            if rationale:
                p["rationale"] = "qualifiers (intent v1 has no qualifiers field): " + rationale
            proposals.append(p)
        elif a["predicate"] in OBJECT_PREDICATES:
            omitted.append(f"{a['ref']} {a['predicate']} -> {a['object']['uid']} (predicate-only assertion with an object node: intent v1 has no proposal kind for it)")
        else:
            p = {"proposalId": pid, "kind": "assertion.literal", "subjectRef": subj, "predicate": a["predicate"], "evidence": ev, "assertion": core, "asserterRef": asserter}
            lit = a.get("literal") or {}
            for k in ("valueString", "valueNumber", "unitCode"):
                if k in lit:
                    p[k] = lit[k]
            if rationale:
                p["rationale"] = "qualifiers (intent v1 has no qualifiers field): " + rationale
            if a.get("supersedesUid"):
                p["rationale"] = (p.get("rationale", "") + f" supersedes {a['supersedesUid']}").strip()
            proposals.append(p)
    notes = (f"Fixture intent for D13 fixture {name} (fixtures stage, A7, {RETRIEVED}); validated against packages/contracts IngestionIntent (zod). "
             "Real captures (contentHash over RAW_BYTES of the capture artifact). Not expressible in biotech-knowledge-intent.v1 and therefore omitted "
             "(see assertions.yaml for the full set and 11-open-questions.md): " + " | ".join(omitted) if omitted else
             f"Fixture intent for D13 fixture {name} (fixtures stage, A7, {RETRIEVED}); validated against packages/contracts IngestionIntent (zod).")
    return {
        "schemaVersion": "biotech-knowledge-intent.v1",
        "intentId": f"ft-d13-{fx['abbr']}-2026-10-08",
        "context": {"actor": {"kind": "agent", "id": "agent:d13-event-linker"},
                    "run": {"system": "mission-control", "runId": run, "missionId": MISSION},
                    "activityKind": "INGESTION"},
        "onStale": "fail",
        "sources": sources,
        "subjects": subjects,
        "proposals": proposals,
        "notes": notes[:4000],
    }


FIXTURE_OF_EVENT = {"ev-readout": "madrigal-maestro-nash-topline-8k", "ev-nda-sub": "madrigal-maestro-nash-topline-8k",
                    "ev-hercules": "madrigal-financing-after-readout", "ev-regdirect": "madrigal-financing-after-readout",
                    "ev-atm": "madrigal-financing-after-readout",
                    "ev-accept": "madrigal-pdufa-to-accelerated-approval", "ev-approval": "madrigal-pdufa-to-accelerated-approval",
                    "ev-launch": "madrigal-pdufa-to-accelerated-approval", "ev-retraction": "lesne-2006-retraction",
                    "ev-signal": "bioage-strides-discontinuation", "ev-discont": "bioage-strides-discontinuation"}
EVENT_STATUS = {"ev-readout": "OCCURRED", "ev-nda-sub": "PLANNED", "ev-hercules": "OCCURRED", "ev-regdirect": "OCCURRED", "ev-atm": "OCCURRED", "ev-accept": "OCCURRED",
                "ev-approval": "OCCURRED", "ev-launch": "OCCURRED", "ev-retraction": "OCCURRED", "ev-signal": "OCCURRED", "ev-discont": "OCCURRED"}

if __name__ == "__main__":
    build()
