"""D3 fixtures stage (A4, 2026-10-08): shared helpers for build_fixtures.py.

Every locator is computed from (and re-selected against) the fresh captures in the scratch directory passed on the
command line; nothing is typed by hand except the quote to look for. A quote that is missing, or that is ambiguous
without an explicit occurrence index, aborts the build.
"""
import hashlib
import json
import re
import unicodedata
import xml.etree.ElementTree as ET
from pathlib import Path

MISSION = "mission:ft-D3-fixtures"
TODAY = "2026-10-08"
CTX = 32  # prefix / suffix length (code points)

XML_NORM = ("xml-textcontent/v1: XML text content of the whole document in document order (ElementTree itertext; "
            "entities decoded), Unicode NFC, U+00A0 / U+2009 / U+202F -> U+0020; offsets in code points of that text")
RAW_NORM = "raw-capture/v1: the captured file decoded as UTF-8; offsets in code points of the file"


def sha(b: bytes) -> str:
    return "sha256:" + hashlib.sha256(b).hexdigest()


def canon(o) -> str:
    return json.dumps(o, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


class Snapshot:
    def __init__(self, raw_dir: Path, ref, file, uri, title, source_kind, genre, tool, method, published_at=None,
                 research_digest=None, note=None, uid=None, source_uid=None):
        self.ref, self.file, self.uri, self.title = ref, file, uri, title
        self.source_kind, self.genre, self.tool, self.method = source_kind, genre, tool, method
        self.published_at, self.note = published_at, note
        self.bytes = (raw_dir / file).read_bytes()
        self.digest = sha(self.bytes)
        self.research_digest = research_digest
        self.raw = self.bytes.decode("utf-8")
        self.uid = uid or f"hu:snapshot:fx-d3-{ref}"
        self.source_uid = source_uid or f"hu:source:fx-d3-{ref}"
        self._xml = None
        self._json = None

    # ---- normalized XML text content with element spans
    def xml(self):
        if self._xml is None:
            root = ET.fromstring(self.bytes)
            parts, pos, spans, paras = [], [0], {}, []

            def local(tag):
                return tag.split("}")[-1]

            def walk(el, secstack):
                start = pos[0]
                sid = el.get("id")
                tag = local(el.tag)
                stack = secstack + [sid] if tag == "sec" and sid else secstack
                if el.text:
                    parts.append(el.text)
                    pos[0] += len(el.text)
                for ch in el:
                    walk(ch, stack)
                    if ch.tail:
                        parts.append(ch.tail)
                        pos[0] += len(ch.tail)
                if sid:
                    spans[sid] = (start, pos[0], tag)
                if tag in ("p", "title", "abstract"):
                    paras.append({"tag": tag, "start": start, "end": pos[0], "sec": stack[-1] if stack else None})

            walk(root, [])
            text = "".join(parts)
            norm = unicodedata.normalize("NFC", text)
            assert len(norm) == len(text), f"{self.file}: NFC changed the text length; offsets would shift"
            for ch in (" ", " ", " "):
                norm = norm.replace(ch, " ")
            self._xml = (norm, spans, paras)
        return self._xml

    def json(self):
        if self._json is None:
            self._json = json.loads(self.raw)
        return self._json

    def text(self, basis):
        return self.raw if basis == "raw" else self.xml()[0]

    def section_of(self, start, end):
        """Innermost JATS sec id whose span contains [start, end)."""
        _, spans, _ = self.xml()
        best = None
        for sid, (a, b, tag) in spans.items():
            if tag == "sec" and a <= start and end <= b and (best is None or b - a < best[1]):
                best = (sid, b - a)
        return best[0] if best else None

    def card(self):
        d = {
            "ref": self.ref,
            "uid": self.uid,
            "source": {"uid": self.source_uid, "canonicalUri": self.uri, "sourceKind": self.source_kind, "genre": self.genre,
                       "name": self.title},
            "retrievedAt": TODAY,
            "publishedAt": self.published_at,
            "contentHash": self.digest,
            "contentHashBasis": "RAW_BYTES",
            "bytes": len(self.bytes),
            "captureMethod": self.method,
            "captureTool": self.tool,
            "captureCompleteness": "COMPLETE",
            "rawCaptureFile": f"session scratch ft/D3/fx/raw/{self.file} (not committed)",
        }
        if self.research_digest and self.research_digest != self.digest:
            d["researchStageDigest"] = self.research_digest
        if self.note:
            d["note"] = self.note
        return d


class Fixture:
    def __init__(self, name, raw_dir):
        self.name = name
        self.raw_dir = Path(raw_dir)
        self.run = f"run:ft-D3-{name}"
        self.snaps = {}
        self.locs = {}  # ref -> locator dict
        self.ents = {}  # ref -> entity dict
        self.asserts = []
        self.structural = []
        self._n = 0

    # ---------------------------------------------------------------- snapshots and locators
    def snap(self, ref, file, uri, title, source_kind, genre, tool, method, **kw):
        s = Snapshot(self.raw_dir, ref, file, uri, title, source_kind, genre, tool, method, **kw)
        self.snaps[ref] = s
        return s

    def _locref(self):
        self._n += 1
        return f"l{self._n:02d}"

    def tq(self, snap, quote, basis="raw", occurrence=None, after=None, within=None, field=None, note=None, ref=None):
        """TEXT_QUOTE (+ TextPositionSelector refinement) over the raw capture or the normalized XML text content.
        after: anchor string; the search starts at its first occurrence. within: anchor quote that must contain the hit."""
        s = self.snaps[snap]
        text = s.text(basis)
        lo, hi = 0, len(text)
        if after is not None:
            a = text.find(after)
            assert a >= 0, f"{self.name}: anchor {after!r} not found in {s.file}"
            lo = a
        if within is not None:
            w = [m.start() for m in re.finditer(re.escape(within), text[lo:])]
            assert len(w) >= 1, f"{self.name}: container {within[:60]!r} not found in {s.file}"
            lo = lo + w[0]
            hi = lo + len(within)
        hits = [lo + m.start() for m in re.finditer(re.escape(quote), text[lo:hi])]
        assert hits, f"{self.name}: quote {quote[:70]!r} not found in {s.file} ({basis})"
        if occurrence is None:
            assert len(hits) == 1, f"{self.name}: quote {quote[:70]!r} occurs {len(hits)}x in range of {s.file}; give occurrence"
            start = hits[0]
        else:
            start = hits[occurrence]
        end = start + len(quote)
        assert text[start:end] == quote
        prefix, suffix = text[max(0, start - CTX):start], text[end:end + CTX]
        total = text.count(quote)
        sel = {"type": "TextQuoteSelector", "exact": quote, "prefix": prefix, "suffix": suffix,
               "refinedBy": {"type": "TextPositionSelector", "start": start, "end": end},
               "basis": RAW_NORM if basis == "raw" else XML_NORM}
        ref = ref or self._locref()
        loc = {"ref": ref, "uid": f"hu:locator:fx-d3-{self.name}-{ref}", "snapshot": snap, "snapshotUid": s.uid,
               "selectorKind": "TEXT_QUOTE", "textBasis": "raw-capture/v1" if basis == "raw" else "xml-textcontent/v1",
               "quote": quote, "quotePrefix": prefix, "quoteSuffix": suffix, "startOffset": start, "endOffset": end,
               "occurrencesOfExactInSnapshot": total,
               "selectorJson": canon(sel), "selectorDigest": sha(canon(sel).encode()),
               "expectedSelectedContentDigest": sha(quote.encode()),
               "reselected": True}
        if basis != "raw" and s.genre == "FULL_TEXT_ARTICLE":
            sec = s.section_of(start, end)
            if sec:
                loc["section"] = f"sec#{sec}"
        if field:
            loc["reportsField"] = field
        if note:
            loc["note"] = note
        self.locs[ref] = loc
        return ref

    def num(self, snap, container, number, field, basis="raw", occurrence=0, after=None, container_occurrence=None,
            note=None):
        """One locator per reported number: the number span inside a verified container quote."""
        s = self.snaps[snap]
        text = s.text(basis)
        lo = 0
        if after is not None:
            lo = text.find(after)
            assert lo >= 0, f"{self.name}: anchor {after!r} not found"
        hits = [lo + m.start() for m in re.finditer(re.escape(container), text[lo:])]
        assert hits, f"{self.name}: container {container[:70]!r} not found in {s.file}"
        if container_occurrence is None:
            assert len(hits) == 1, f"{self.name}: container {container[:70]!r} occurs {len(hits)}x; give container_occurrence"
            c0 = hits[0]
        else:
            c0 = hits[container_occurrence]
        inner = [c0 + m.start() for m in re.finditer(re.escape(number), container)]
        assert inner, f"{self.name}: number {number!r} not inside container"
        start = inner[occurrence]
        end = start + len(number)
        assert text[start:end] == number
        prefix, suffix = text[max(0, start - CTX):start], text[end:end + CTX]
        sel = {"type": "TextQuoteSelector", "exact": number, "prefix": prefix, "suffix": suffix,
               "refinedBy": {"type": "TextPositionSelector", "start": start, "end": end},
               "basis": RAW_NORM if basis == "raw" else XML_NORM}
        ref = self._locref()
        loc = {"ref": ref, "uid": f"hu:locator:fx-d3-{self.name}-{ref}", "snapshot": snap, "snapshotUid": s.uid,
               "selectorKind": "TEXT_QUOTE", "textBasis": "raw-capture/v1" if basis == "raw" else "xml-textcontent/v1",
               "quote": number, "quotePrefix": prefix, "quoteSuffix": suffix, "startOffset": start, "endOffset": end,
               "occurrencesOfExactInSnapshot": text.count(number),
               "containerQuote": container,
               "selectorJson": canon(sel), "selectorDigest": sha(canon(sel).encode()),
               "expectedSelectedContentDigest": sha(number.encode()), "reportsField": field, "reselected": True}
        if basis != "raw" and s.genre == "FULL_TEXT_ARTICLE":
            sec = s.section_of(start, end)
            if sec:
                loc["section"] = f"sec#{sec}"
        if note:
            loc["note"] = note
        self.locs[ref] = loc
        return ref

    def jp(self, snap, pointer, field=None, note=None):
        """JSON_POINTER: value serialized as the string itself, or canonical JSON for non-strings."""
        s = self.snaps[snap]
        v = s.json()
        for tok in pointer.split("/")[1:]:
            tok = tok.replace("~1", "/").replace("~0", "~")
            v = v[int(tok)] if isinstance(v, list) else v[tok]
        quote = v if isinstance(v, str) else canon(v)
        sel = {"type": "JsonPointerSelector", "pointer": pointer,
               "valueSerialization": "string value as-is; other values as canonical JSON (sorted keys, no whitespace)"}
        ref = self._locref()
        loc = {"ref": ref, "uid": f"hu:locator:fx-d3-{self.name}-{ref}", "snapshot": snap, "snapshotUid": s.uid,
               "selectorKind": "JSON_POINTER", "pointer": pointer, "quote": quote,
               "selectorJson": canon(sel), "selectorDigest": sha(canon(sel).encode()),
               "expectedSelectedContentDigest": sha(quote.encode()), "reselected": True}
        if field:
            loc["reportsField"] = field
        if note:
            loc["note"] = note
        self.locs[ref] = loc
        return ref

    # ---------------------------------------------------------------- entities
    def ent(self, ref, typ, token, slug, name, props=None, ids=None, mode=None, note=None):
        module, tname = typ.split(".") if "." in typ else ("D3", typ)
        e = {"ref": ref, "uid": f"hu:{token}:fx-{slug}", "type": f"{module}.{tname}", "name": name}
        if props:
            e["properties"] = props
        if ids:
            e["identifiers"] = [{"scheme": a, "issuer": b, "value": c} for a, b, c in ids]
        e["intentMode"] = mode or ("new" if module == "D3" else "resolved")
        if note:
            e["note"] = note
        self.ents[ref] = e
        return ref

    def _who(self, ref):
        e = self.ents[ref]
        return {"ref": ref, "uid": e["uid"], "type": e["type"], "name": e["name"]}

    # ---------------------------------------------------------------- assertions
    def _assert(self, kind, predicate, subj, asserter, ev, obj=None, value=None, rel=None, edge_cls=None, edge_props=None,
                valid=None, speech="STATES", polarity="POSITIVE", basis="UNSTATED", note=None, aid=None, projected=True,
                intent=True, status=None, roles=None, qualifiers=None, edge_type=None):
        aid = aid or f"a{len(self.asserts) + 1:02d}"
        for r in ev:
            assert r in self.locs, f"{self.name}: unknown locator {r}"
        a = {"ref": aid, "uid": f"hu:assertion:fx-d3-{self.name}-{aid}", "predicate": predicate, "assertionKind": kind,
             "subject": self._who(subj)}
        if obj is not None:
            a["object"] = self._who(obj)
        if value is not None:
            a["value"] = value
        if rel:
            a["projectsTo"] = {"relationshipType": rel, "class": edge_cls, "projected": projected}
            if edge_type:
                a["projectsTo"]["edgePropertiesType"] = edge_type
            if edge_props:
                a["projectsTo"]["edgeProperties"] = edge_props
        a["assertedBy"] = self._who(asserter)
        a["speechAct"], a["basisKind"], a["polarity"] = speech, basis, polarity
        if qualifiers:
            a["qualifiers"] = qualifiers
        vt = {"validFrom": None, "validTo": None, "validFromPrecision": None, "validToPrecision": None,
              "validFromBasis": "UNKNOWN", "validToBasis": "UNKNOWN"}
        if valid:
            vt.update(valid)
        a["validTime"] = vt
        a["recordedFrom"] = TODAY
        rl = roles or {}
        a["evidence"] = [{"locator": r, "locatorUid": self.locs[r]["uid"], "role": rl.get(r, "SUPPORTS"), "origin": "DECLARED",
                          **({"reportsField": self.locs[r]["reportsField"]} if "reportsField" in self.locs[r] else {})}
                         for r in ev]
        if status:
            a["expectedStatus"] = status
        if note:
            a["note"] = note
        a["inIntent"] = intent
        a["producedBy"] = {"missionId": MISSION, "runId": self.run}
        self.asserts.append(a)
        return aid

    # Source wording is not an edge field (kernel rule, K/09-reasoning "Edge-property types", check stage 2026-10-08):
    # these keys move from edge properties to Assertion.qualifiers as "<prefix>:<text>".
    QUALIFIER_KEYS = {"roleTextVerbatim": "roleText", "reasonsVerbatim": "reason"}
    EDGE_PROPS_TYPE = {"HAS_STUDY_ROLE": "StudyRoleEdgeProperties", "REVISES": "RevisionEdgeProperties"}

    def edge(self, rel, frm, to, asserter, ev, props=None, **kw):
        quals = list(kw.pop("qualifiers", None) or [])
        if props:
            props = dict(props)
            for key, prefix in self.QUALIFIER_KEYS.items():
                if key in props:
                    v = props.pop(key)
                    quals += [f"{prefix}:{x}" for x in (v if isinstance(v, list) else [v])]
        return self._assert("RELATIONSHIP", rel, frm, asserter, ev, obj=to, rel=rel, edge_cls="asserted", edge_props=props or None,
                            qualifiers=quals or None, edge_type=self.EDGE_PROPS_TYPE.get(rel, "AssertedRecordedProperties"), **kw)

    def state(self, frm, to, asserter, ev, rel="HAS_REGISTRATION_VERSION", **kw):
        return self._assert("RELATIONSHIP", rel, frm, asserter, ev, obj=to, rel=rel, edge_cls="asserted (state attachment)", **kw)

    def lit(self, predicate, subj, value, asserter, ev, kind="FIELD", **kw):
        return self._assert(kind, predicate, subj, asserter, ev, value=value, **kw)

    def pred(self, predicate, subj, obj, asserter, ev, **kw):
        """Predicate-only Assertion with an object node: no typed edge (05 predicateOnly / kernel)."""
        kw.setdefault("intent", False)
        kind = kw.pop("kind", "RELATIONSHIP")
        return self._assert(kind, predicate, subj, asserter, ev, obj=obj, **kw)

    def struct(self, rel, frm, to, order=None, note=None):
        d = {"relationshipType": rel, "class": "structural", "from": self._who(frm), "to": self._who(to),
             "properties": {"orderIndex": order} if order is not None else {},
             "producedBy": {"missionId": MISSION, "runId": self.run}}
        if note:
            d["note"] = note
        self.structural.append(d)

    def ident(self, subj, scheme, issuer, value, asserter, ev):
        return self._assert("FIELD", "HAS_IDENTIFIER", subj, asserter, ev, value={"scheme": scheme, "issuer": issuer, "value": value},
                            rel="HAS_IDENTIFIER", edge_cls="asserted (kernel IdentifierLinkProperties)")
