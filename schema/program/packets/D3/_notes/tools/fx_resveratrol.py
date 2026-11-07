"""Fixture resveratrol-retraction: PMID 19071213 retracted (notice PMID 23016154); NLM, Retraction Watch (via Crossref) and
the publisher (via Crossref) label the same notice differently; OpenAlex flags is_retracted; nine Das papers in PubMed
are typed Retracted Publication; kernel path for CQ-EV-05 (claim occurrence -> locator -> source -> publication)."""
import re

from fxlib import Fixture


def build(raw):
    fx = Fixture("resveratrol-retraction", raw)
    A = fx.snap("s-pubmed-19071213", "pubmed-efetch-19071213.xml", "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=19071213&retmode=xml",
                "MEDLINE record PMID 19071213 (Mukherjee S et al., Free Radic Biol Med 2009;46(5):573-8)", "API", "BIBLIOGRAPHIC_RECORD",
                "tool:pubmed-eutils", "curl -> NCBI E-utilities efetch db=pubmed retmode=xml", published_at="2009-03-01",
                research_digest="sha256:88796be4f321d421f90164097cdff3acfa477ea380c25e2f2a1c974f803178ec")
    N = fx.snap("s-pubmed-23016154", "pubmed-efetch-23016154.xml", "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=23016154&retmode=xml",
                "MEDLINE record PMID 23016154 (retraction notice, Free Radic Biol Med 2012;53(3):641)", "API", "BIBLIOGRAPHIC_RECORD",
                "tool:pubmed-eutils", "curl -> NCBI E-utilities efetch (first attempt returned the NCBI 3 req/s rate-limit JSON; re-fetched)",
                published_at="2012-08-01", research_digest="sha256:901a03db450b2c75a2fab5e8b6415279ac8c1ae7a7b9527c04d194e404804c2e")
    CA = fx.snap("s-crossref-article", "crossref-10.1016-j.freeradbiomed.2008.11.005.json", "https://api.crossref.org/works/10.1016/j.freeradbiomed.2008.11.005",
                 "Crossref work record 10.1016/j.freeradbiomed.2008.11.005", "API", "BIBLIOGRAPHIC_RECORD", "tool:crossref-rest",
                 "curl -> Crossref REST /works/{doi} (public pool, no mailto)",
                 research_digest="sha256:dee9cfe7654c67f96fb111edccea0794d1f3804777eb11b5f11a5c8d94f90609")
    CN = fx.snap("s-crossref-notice", "crossref-10.1016-j.freeradbiomed.2012.06.017.json", "https://api.crossref.org/works/10.1016/j.freeradbiomed.2012.06.017",
                 "Crossref work record 10.1016/j.freeradbiomed.2012.06.017 (the notice)", "API", "BIBLIOGRAPHIC_RECORD", "tool:crossref-rest",
                 "curl -> Crossref REST /works/{doi} (public pool, no mailto)")
    CL = fx.snap("s-crossref-labs", "crossref-labs-19071213.json", "https://api.labs.crossref.org/works/10.1016/j.freeradbiomed.2008.11.005",
                 "Crossref Labs work record (cr-labs-updates incl. Retraction Watch reasons)", "API", "BIBLIOGRAPHIC_RECORD", "tool:crossref-labs",
                 "curl -> Crossref Labs /works/{doi} (research-stage capture, same day)",
                 note=("fixtures-stage re-fetch without a mailto returned HTTP 403 'not-polite' (message-type not-polite); the research-stage "
                       "capture of the same day (with a mailto) is used and its quotes re-selected; no personal address was sent in this stage"))
    OA = fx.snap("s-openalex", "openalex-19071213.json", "https://api.openalex.org/works/doi:10.1016/j.freeradbiomed.2008.11.005",
                 "OpenAlex work W2101407999", "API", "BIBLIOGRAPHIC_RECORD", "tool:openalex", "curl -> OpenAlex /works/doi:{doi}",
                 research_digest="sha256:7b738306e1e6b84ad216220604f3d5a346f201822dc827c492aa27bcff5939b0",
                 note="bytes differ from the research capture only by JSON key order inside has_content (same parsed content)")
    DS = fx.snap("s-pubmed-das", "pubmed-efetch-das.xml",
                 "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=24669285,22414106,19071213,18821770,18789672,18045550,17125593,17015251,12003802&retmode=xml",
                 "MEDLINE records of nine PubMed records co-authored by D. K. Das and typed Retracted Publication", "API", "BIBLIOGRAPHIC_RECORD",
                 "tool:pubmed-eutils", "curl -> NCBI E-utilities efetch db=pubmed retmode=xml (PMIDs from the research-stage PubMed search)",
                 research_digest="sha256:4c97685f578a4330ca49760f0026e4cc83dd1620ff451fe1053cca3f6ac01b07")

    # ------------------------------------------------------------------ entities
    fx.ent("pub-article", "Publication", "publication", "doi-10-1016-j-freeradbiomed-2008-11-005",
           "Expression of the longevity proteins by both red and white wines and their cardioprotective components, resveratrol, tyrosol, and hydroxytyrosol",
           {"publicationKind": "ARTICLE", "publishedAt": "2009-03-01T00:00:00Z", "publishedAtPrecision": "DAY", "venueName": "Free Radic Biol Med",
            "citationText": "Free Radic Biol Med. 2009 Mar 1;46(5):573-8", "revisionStatus": "RETRACTED", "revisionStatusDerivedAt": "2026-10-08T00:00:00Z"},
           ids=[("PMID", "NLM", "19071213"), ("DOI", "Crossref", "10.1016/j.freeradbiomed.2008.11.005"), ("OPENALEX", "OpenAlex", "W2101407999")])
    fx.ent("pub-notice", "Publication", "publication", "doi-10-1016-j-freeradbiomed-2012-06-017",
           "Retraction notice to 'Expression of the longevity proteins by both red and white wines ...' FRB 46 (2009) 573-578",
           {"publicationKind": "RETRACTION_NOTICE", "publishedAt": "2012-08-01T00:00:00Z", "publishedAtPrecision": "DAY", "venueName": "Free Radic Biol Med",
            "citationText": "Free Radic Biol Med. 2012 Aug 1;53(3):641", "revisionStatus": "NONE_KNOWN", "revisionStatusDerivedAt": "2026-10-08T00:00:00Z"},
           ids=[("PMID", "NLM", "23016154"), ("DOI", "Crossref", "10.1016/j.freeradbiomed.2012.06.017")])
    fx.ent("study-rat", "Study", "study", "mukherjee-2009-rat-wine-resveratrol",
           "Rat feeding study of red and white wine, resveratrol, tyrosol and hydroxytyrosol (Mukherjee et al. 2009)",
           {"studyKind": "PRECLINICAL_IN_VIVO"}, note="unregistered; identity = (first reporting publication DOI, PRECLINICAL_IN_VIVO, design label)")
    fx.ent("org-nlm", "D7.Organization", "org", "us-national-library-of-medicine", "U.S. National Library of Medicine (MEDLINE/PubMed)")
    fx.ent("org-elsevier", "D7.Organization", "org", "elsevier-bv", "Elsevier BV (publisher; Crossref update source 'publisher')")
    fx.ent("org-rw", "D7.Organization", "org", "retraction-watch", "Retraction Watch (Crossref update source 'retraction-watch')",
           ids=[("ROR", "ROR", "005b4k264")], note="ROR id as printed by Crossref Labs 'asserted-by'")
    fx.ent("org-openalex", "D7.Organization", "org", "openalex", "OpenAlex (OurResearch)")
    fx.ent("org-crossref", "D7.Organization", "org", "crossref", "Crossref (DOI registration agency; computes is-referenced-by-count from deposited references)")
    fx.ent("person-das", "D7.Person", "person", "dipak-k-das", "Dipak K Das",
           note="printed 'Das, Dipak K' in eight records and 'Das, D K' in PMID 22414106: same Person only through a RESOLUTION Assessment (never by name match)")
    fx.ent("claim", "K.Claim", "claim", "resveratrol-sirt1-longevity",
           "Resveratrol increases longevity through SirT1, which is activated with NAD(+) supplied by an anti-aging enzyme PBEF.")
    fx.ent("substance-resveratrol", "D1.ChemicalSubstance", "substance", "resveratrol", "Resveratrol", ids=[("UNII", "FDA GSRS", "Q369O8926L")],
           note="UNII as printed in the MEDLINE ChemicalList RegistryNumber of PMID 19071213")
    fx.ent("source-article", "K.Source", "source", "fx-d3-s-pubmed-19071213", "PubMed record PMID 19071213 (kernel Source of the capture)")
    fx.ents["source-article"]["uid"] = A.source_uid
    fx.ent("agent", "K.Agent", "agent", "d3-curation-agent", "agent:d3-curation-agent (BellLabs D3 extraction / curation run)")

    # ------------------------------------------------------------------ locators
    a, n, ca, cn, cl, oa, ds = A.ref, N.ref, CA.ref, CN.ref, CL.ref, OA.ref, DS.ref
    L = {}
    L["claim"] = fx.tq(a, "Resveratrol increases longevity through SirT1, which is activated with NAD(+) supplied by an anti-aging enzyme PBEF.")
    L["rats"] = fx.tq(a, "we determined if white wine and its cardioprotective components possess anti-aging properties by feeding rats with these compounds")
    L["a-retracted"] = fx.tq(a, '<PublicationType UI="D016441">Retracted Publication</PublicationType>')
    L["a-retin"] = fx.tq(a, '<CommentsCorrections RefType="RetractionIn"><RefSource>Free Radic Biol Med. 2012 Aug 1;53(3):641. doi: 10.1016/j.freeradbiomed.2012.06.017.</RefSource><PMID Version="1">23016154</PMID>')
    L["a-das"] = fx.tq(a, "<LastName>Das</LastName><ForeName>Dipak K</ForeName>")
    L["a-doi"] = fx.tq(a, '<ELocationID EIdType="doi" ValidYN="Y">10.1016/j.freeradbiomed.2008.11.005</ELocationID>')
    L["a-pmid"] = fx.tq(a, '<PMID Version="1">19071213</PMID>', occurrence=0)
    L["unii"] = fx.tq(a, "<RegistryNumber>Q369O8926L</RegistryNumber><NameOfSubstance UI=\"D000077185\">Resveratrol</NameOfSubstance>")
    L["a-pubdate"] = fx.tq(a, "<PubDate><Year>2009</Year><Month>Mar</Month><Day>01</Day></PubDate>")
    L["n-type"] = fx.tq(n, '<PublicationType UI="D016440">Retraction Notice</PublicationType>')
    L["n-retof"] = fx.tq(n, '<CommentsCorrections RefType="RetractionOf"><RefSource>Free Radic Biol Med. 2009 Mar 1;46(5):573-8. doi: 10.1016/j.freeradbiomed.2008.11.005.</RefSource><PMID Version="1">19071213</PMID>')
    L["n-pubdate"] = fx.tq(n, "<PubDate><Year>2012</Year><Month>Aug</Month><Day>01</Day></PubDate>")
    L["n-doi"] = fx.tq(n, '<ArticleId IdType="doi">10.1016/j.freeradbiomed.2012.06.017</ArticleId>')
    L["n-pmid"] = fx.tq(n, '<PMID Version="1">23016154</PMID>', occurrence=0)
    L["ca-rw"] = fx.jp(ca, "/message/updated-by/0")
    L["ca-pub-erratum"] = fx.jp(ca, "/message/updated-by/1")
    L["ca-pub-self"] = fx.jp(ca, "/message/updated-by/2")
    L["ca-title"] = fx.jp(ca, "/message/title/0")
    L["ca-cites"] = fx.jp(ca, "/message/is-referenced-by-count")
    L["ca-das"] = fx.jp(ca, "/message/author/4")
    L["ca-publisher"] = fx.jp(ca, "/message/publisher")
    L["cn-rw"] = fx.jp(cn, "/message/update-to/0")
    L["cn-pub-erratum"] = fx.jp(cn, "/message/update-to/1")
    L["cn-title"] = fx.jp(cn, "/message/title/0")
    L["cn-das"] = fx.jp(cn, "/message/author/4")
    L["cl-reasons"] = fx.jp(cl, "/message/cr-labs-updates/1/reasons", note="Retraction Watch reasons as served: the first character of every reason is missing in the source")
    L["cl-rw-asserter"] = fx.jp(cl, "/message/cr-labs-updates/1/asserted-by")
    L["cl-rw-nature"] = fx.jp(cl, "/message/cr-labs-updates/1/update-nature")
    L["cl-crossmark"] = fx.jp(cl, "/message/cr-labs-updates/0/update-nature")
    L["oa-retracted"] = fx.jp(oa, "/is_retracted")
    L["oa-cites"] = fx.jp(oa, "/cited_by_count")
    L["oa-id"] = fx.jp(oa, "/id")
    L["oa-date"] = fx.jp(oa, "/publication_date")

    # ------------------------------------------------------------------ assertions
    D = lambda d: {"validFrom": f"{d}T00:00:00Z", "validFromPrecision": "DAY", "validFromBasis": "STATED_BY_SOURCE"}
    fx.ident("pub-article", "PMID", "NLM", "19071213", "org-nlm", [L["a-pmid"]])
    fx.ident("pub-article", "DOI", "Crossref", "10.1016/j.freeradbiomed.2008.11.005", "org-nlm", [L["a-doi"]])
    fx.ident("pub-article", "OPENALEX", "OpenAlex", "W2101407999", "org-openalex", [L["oa-id"]])
    fx.ident("pub-notice", "PMID", "NLM", "23016154", "org-nlm", [L["n-pmid"]])
    fx.ident("pub-notice", "DOI", "Crossref", "10.1016/j.freeradbiomed.2012.06.017", "org-nlm", [L["n-doi"]])
    fx.ident("source-article", "DOI", "Crossref", "10.1016/j.freeradbiomed.2008.11.005", "org-nlm", [L["a-doi"]])
    # REVISES: one episode per asserter
    fx.edge("REVISES", "pub-notice", "pub-article", "org-nlm", [L["n-type"], L["n-retof"], L["a-retin"], L["a-retracted"], L["n-pubdate"]],
            props={"revisionKind": "RETRACTION"}, valid=D("2012-08-01"),
            note="NLM: notice typed 'Retraction Notice', CommentsCorrections RetractionOf / RetractionIn, article typed 'Retracted Publication'; valid from the notice's PubDate")
    fx.edge("REVISES", "pub-notice", "pub-article", "org-rw", [L["ca-rw"], L["cn-rw"], L["cl-reasons"], L["cl-rw-asserter"], L["cl-rw-nature"]],
            props={"revisionKind": "RETRACTION",
                   "reasonsVerbatim": ["alsification/Fabrication of Data", "alsification/Fabrication of Image", "nvestigation by Company/Institution",
                                       "isconduct - Official Investigation(s) and/or Finding(s)", "isconduct by Author", "bjections by Author(s)"]},
            valid=D("2012-08-01"),
            note="Retraction Watch via Crossref (source 'retraction-watch', record-id 4565); reasons copied verbatim from Crossref Labs including the dropped first character (defect kept, not repaired; 11-open-questions)")
    fx.edge("REVISES", "pub-notice", "pub-article", "org-elsevier", [L["ca-pub-erratum"], L["cn-pub-erratum"]],
            props={"revisionKind": "ERRATUM"}, valid=D("2012-08-01"),
            note="publisher deposit labels the same notice DOI 'erratum' (type erratum, source publisher) -> kernel SourceRevisionKind ERRATUM: disagreement with NLM and Retraction Watch stays visible and filterable")
    fx.edge("REVISES", "pub-article", "pub-article", "org-elsevier", [L["ca-pub-self"], L["cl-crossmark"]], props={"revisionKind": "RETRACTION"},
            valid=D("2009-03-01"), projected=False, intent=False, status="PROPOSED (held for review)",
            note="publisher Crossmark deposit: a 'retraction' update whose DOI is the article itself, dated 2009-03-01 (= the issue date); a self-loop is not a revision between two works, so the proposal is held and no edge is projected")
    fx.lit("HAS_REVISION_STATUS", "source-article", "RETRACTION", "org-openalex", [L["oa-retracted"]],
           note=("OpenAlex states a flag (is_retracted: true), not a notice: kernel predicate convention HAS_REVISION_STATUS (subject the Source "
                 "carrying the work's DOI, valueString a SourceRevisionKind value, one Assertion per authority), no REVISES episode; it reaches "
                 "the Publication through the shared DOI Identifier (adversarial-review stage: replaces the D3-local REVISION_STATUS_STATED)"))
    fx.lit("TITLE_AS_DEPOSITED", "pub-article", "RETRACTED: Expression of the longevity proteins by both red and white wines and their cardioprotective components, resveratrol, tyrosol, and hydroxytyrosol",
           "org-elsevier", [L["ca-title"]], note="publisher prefixed the title with 'RETRACTED:'; PubMed keeps the original title")
    fx.lit("CITED_BY_COUNT", "pub-article", {"number": 97, "unit": "{citations}"}, "org-crossref", [L["ca-cites"]],
           note="Crossref is-referenced-by-count: computed by Crossref from deposited references, so Crossref (not the publisher) is the asserter (adversarial-review correction)")
    fx.lit("CITED_BY_COUNT", "pub-article", {"number": 113, "unit": "{citations}"}, "org-openalex", [L["oa-cites"]], note="OpenAlex cited_by_count; differs from Crossref (Q-D3-15)")
    fx.lit("PUBLICATION_DATE_STATED", "pub-article", "2008-11-26", "org-openalex", [L["oa-date"]], note="OpenAlex = online date; PubMed PubDate 2009 Mar 01 (a-pubdate)")
    fx.lit("PUBLICATION_DATE_STATED", "pub-article", "2009-03-01", "org-nlm", [L["a-pubdate"]])
    # the article reports a preclinical study; the notice reports on none
    fx.edge("REPORTS_ON", "pub-article", "study-rat", "pub-article", [L["rats"]],
            note="asserter = the Publication (the five-author group's statement; adversarial-review correction: not one author); no registry exists for this study")
    # authorship (predicate-only)
    fx.pred("AUTHORED_BY", "pub-article", "person-das", "org-nlm", [L["a-das"]], note="05 predicateOnly AUTHORED_BY")
    fx.pred("AUTHORED_BY", "pub-article", "person-das", "org-elsevier", [L["ca-das"]], note="second asserter (Crossref deposit)")
    fx.pred("AUTHORED_BY", "pub-notice", "person-das", "org-elsevier", [L["cn-das"]],
            note="the publisher deposits the retraction notice with the original author list")
    # kernel CQ-EV-05 path: a claim occurrence that rests on the retracted article
    fx.pred("OCCURRENCE_OF", "substance-resveratrol", "claim", "pub-article", [L["claim"], L["unii"]], kind="CLAIM", basis="CITED_FROM_PRIOR_WORK",
            note="kernel claim occurrence (assertionKind CLAIM, extra label ClaimOccurrence, OCCURRENCE_OF -> Claim) about D1 resveratrol, asserted by pub-article (the author group's work, not one author); evidence locator on the PubMed snapshot of Source hu:source:fx-d3-s-pubmed-19071213")

    # nine Das papers typed Retracted Publication, each with NLM's RetractionIn notice (Q-D3-03)
    raw = DS.raw
    starts = [m.start() for m in re.finditer("<PubmedArticle>", raw)] + [len(raw)]
    for i in range(len(starts) - 1):
        seg = raw[starts[i]:starts[i + 1]]
        m = re.search(r'<MedlineCitation[^>]*><PMID Version="1">(\d+)</PMID>', seg)
        pmid = m.group(1)
        anchor = seg[:m.end()]
        title = re.search(r"<ArticleTitle>(.*?)</ArticleTitle>", seg, re.S).group(1)
        jt = re.search(r"<ISOAbbreviation>([^<]*)", seg).group(1)
        rin = re.search(r'<CommentsCorrections RefType="RetractionIn"><RefSource>([^<]*)</RefSource><PMID Version="1">(\d+)</PMID>', seg)
        fore = "Dipak K" if "<LastName>Das</LastName><ForeName>Dipak K</ForeName>" in seg else "D K"
        pref = "pub-article" if pmid == "19071213" else f"pub-{pmid}"
        if pmid != "19071213":
            fx.ent(pref, "Publication", "publication", f"pmid-{pmid}", title[:300],
                   {"publicationKind": "ARTICLE", "venueName": jt, "revisionStatus": "RETRACTED", "revisionStatusDerivedAt": "2026-10-08T00:00:00Z"},
                   ids=[("PMID", "NLM", pmid)])
            fx.ent(f"notice-{rin.group(2)}", "Publication", "publication", f"pmid-{rin.group(2)}", f"Retraction notice PMID {rin.group(2)} ({rin.group(1)[:80]})",
                   {"publicationKind": "RETRACTION_NOTICE", "venueName": jt, "citationText": rin.group(1)}, ids=[("PMID", "NLM", rin.group(2))])
        la = fx.tq(ds, f"<LastName>Das</LastName><ForeName>{fore}</ForeName>", after=anchor, occurrence=0)
        lr = fx.tq(ds, '<PublicationType UI="D016441">Retracted Publication</PublicationType>', after=anchor, occurrence=0)
        lin = fx.tq(ds, rin.group(0), after=anchor, occurrence=0)
        for r in (la, lr, lin):
            assert fx.locs[r]["startOffset"] < starts[i + 1], f"locator for {pmid} spilled into the next record"
        if pmid != "19071213":
            fx.pred("AUTHORED_BY", pref, "person-das", "org-nlm", [la],
                    note=("printed 'Das, D K' — Person match needs a RESOLUTION Assessment" if fore == "D K" else "05 predicateOnly AUTHORED_BY"))
            fx.edge("REVISES", f"notice-{rin.group(2)}", pref, "org-nlm", [lin, lr], props={"revisionKind": "RETRACTION"},
                    note="NLM RetractionIn link + 'Retracted Publication' type in the MEDLINE record of the retracted article")
    extra = {
        "projections": [
            {"what": "Publication.revisionStatus (method publication-revision-status/v2; Publication.revisionStatusMethodVersion)",
             "rule": ("RETRACTED when any open REVISES episode with revisionKind RETRACTION exists from an asserter on the authority list (NLM, Retraction Watch), "
                      "or a kernel HAS_REVISION_STATUS Assertion with value RETRACTION from such an authority on a Source sharing the work's DOI / PMID; "
                      "a conflicting publisher ERRATUM is kept and reported, not counted; OpenAlex's flag is reported, not counted (not on the authority list)"),
             "result": {"pub-article": "RETRACTED (episodes: NLM RETRACTION, Retraction Watch RETRACTION; publisher ERRATUM disagrees; OpenAlex HAS_REVISION_STATUS RETRACTION agrees)",
                        "eight further Das papers": "RETRACTED (NLM RETRACTION each)", "pub-notice": "NONE_KNOWN"},
             "derivedAt": "2026-10-08"},
        ],
        "kernelPathCQ_EV_05": [
            "Claim hu:claim:fx-resveratrol-sirt1-longevity <-OCCURRENCE_OF- claim-occurrence Assertion (assertionKind CLAIM; see the OCCURRENCE_OF assertion)",
            "Assertion -HAS_EVIDENCE{role SUPPORTS}-> SourceLocator (the 'claim' locator) -> SourceSnapshot hu:snapshot:fx-d3-s-pubmed-19071213 (sha256 above) -> Source hu:source:fx-d3-s-pubmed-19071213",
            "Source -HAS_IDENTIFIER-> Identifier DOI 10.1016/j.freeradbiomed.2008.11.005 <-HAS_IDENTIFIER- Publication pub-article (identifier join, no extra edge)",
            "Publication pub-article <-REVISES{revisionKind RETRACTION}- pub-notice (asserters NLM, Retraction Watch; publisher ERRATUM episode alongside); the same Source also carries OpenAlex's HAS_REVISION_STATUS RETRACTION (kernel Q-K-10 / Q-K-22 match it directly)",
            "answer: the claim occurrence rests on a publication retracted per NLM and Retraction Watch since 2012-08-01 (valid time); the historical Assertion is kept, its downstream assessments are flagged stale",
        ],
    }
    return fx, extra
