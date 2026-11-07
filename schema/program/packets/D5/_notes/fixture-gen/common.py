"""Shared helpers for the D5 fixture generator (fixtures stage, A5, 2026-10-08).

Every quote is located in a fresh capture by exact substring search; offsets, prefixes, suffixes, quote hashes and
selector digests are computed here, never typed by hand. A quote that is not found aborts the run.
"""
import datetime
import hashlib
import html
import json
import os
import re
import unicodedata

import yaml

SCRATCH = r"C:\Users\Pinda\AppData\Local\Temp\claude\C--Users-Pinda-Proyectos-Biotech\d38640f3-1d90-4042-9623-ff67cb1b7809\scratchpad\ft\D5"
FX = os.path.join(SCRATCH, "fx")
PACKET = r"C:\Users\Pinda\Proyectos\Biotech\biotech-knowledge-services-A5\schema\program\packets\D5"
FIXTURES = os.path.join(PACKET, "07-fixtures")

MISSION = "mission:ft-D5-fixtures"
OFFSET_BASIS = "0-based Unicode code-point offsets into the UTF-8-decoded snapshot (JSON_POINTER: into the string value at the pointer); endOffset exclusive"
FIXTURE_NOTE = "All uids, mission and run ids in this file are fixture ids (not minted by the executor); recordedAt / recordedFrom are service-assigned at apply time and are shown symbolically."


def sha_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def sha_file(path: str) -> str:
    with open(path, "rb") as f:
        return sha_bytes(f.read())


def sha_text(s: str) -> str:
    return sha_bytes(s.encode("utf-8"))


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", unicodedata.normalize("NFC", s)).strip()


def canon(obj) -> str:
    return json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(",", ":"))


def mtime_utc(path: str) -> str:
    return datetime.datetime.fromtimestamp(os.path.getmtime(path), datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def json_pointer(doc, pointer: str):
    cur = doc
    for part in pointer.lstrip("/").split("/"):
        part = part.replace("~1", "/").replace("~0", "~")
        cur = cur[int(part)] if isinstance(cur, list) else cur[part]
    return cur


class Snap:
    def __init__(self, ref, uid, path, source_uri, title, method, basis, completeness, mime, source_kind,
                 observed_at=None, published_at=None, note=None, request_uri=None, is_json=False, retrieved_from=None):
        self.ref, self.uid, self.path = ref, uid, path
        self.source_uri, self.title, self.method = source_uri, title, method
        self.basis, self.completeness, self.mime, self.source_kind = basis, completeness, mime, source_kind
        self.observed_at, self.published_at, self.note, self.request_uri = observed_at, published_at, note, request_uri
        with open(path, "rb") as f:
            self.raw = f.read()
        self.text = self.raw.decode("utf-8")
        self.digest = "sha256:" + sha_bytes(self.raw)
        self.retrieved_at = mtime_utc(retrieved_from or path)
        self.doc = json.loads(self.text) if is_json else None

    def record(self):
        r = {
            "ref": self.ref,
            "uid": self.uid,
            "source": {"canonicalUri": self.source_uri, "title": self.title, "sourceKind": self.source_kind},
            "requestUri": self.request_uri or self.source_uri,
            "retrievedAt": self.retrieved_at,
            "observedAt": self.observed_at or self.retrieved_at,
            "publishedAt": self.published_at,
            "contentHash": self.digest,
            "contentHashBasis": self.basis,
            "captureMethod": self.method,
            "captureCompleteness": self.completeness,
            "mimeType": self.mime,
            "sizeBytes": len(self.raw),
            "scratchFile": os.path.relpath(self.path, SCRATCH).replace("\\", "/"),
        }
        note = " ".join(x for x in [self.note, HASH_BASIS_NOTE.get(self.basis)] if x)
        if note:
            r["note"] = note
        return {k: v for k, v in r.items() if v is not None}


class Loc:
    def __init__(self, ref, uid, snap: Snap, quote, kind="TEXT_QUOTE", pointer=None, nth=0, after=None,
                 section=None, note=None, reanchors=None, reanchor_match=None):
        base = snap.text if pointer is None else json_pointer(snap.doc, pointer)
        if not isinstance(base, str):
            base = str(base)
        start = base.find(after) if after else 0
        if start < 0:
            raise SystemExit(f"anchor not found for {ref}: {after!r}")
        idx = -1
        for _ in range(nth + 1):
            idx = base.find(quote, start if idx < 0 else idx + 1)
            if idx < 0:
                raise SystemExit(f"QUOTE NOT FOUND {ref} in {snap.ref}: {quote!r}")
        self.ref, self.uid, self.snap, self.quote, self.kind = ref, uid, snap, quote, kind
        self.pointer, self.section, self.note = pointer, section, note
        self.start, self.end = idx, idx + len(quote)
        self.occurrences = base.count(quote)
        self.prefix = base[max(0, idx - 32):idx]
        self.suffix = base[self.end:self.end + 32]
        assert base[self.start:self.end] == quote
        self.reanchors, self.reanchor_match = reanchors, reanchor_match
        selector = {"type": kind, "exact": quote, "prefix": self.prefix, "suffix": self.suffix,
                    "start": self.start, "end": self.end, "offsetBasis": "unicode-code-points/utf-8"}
        if pointer:
            selector["jsonPointer"] = pointer
        if section:
            selector["section"] = section
        self.selector = selector
        self.selector_digest = "sha256:" + sha_text(canon(selector))
        self.quote_hash = "sha256:" + sha_text(norm(quote))

    def record(self):
        r = {
            "ref": self.ref,
            "uid": self.uid,
            "snapshot": self.snap.ref,
            "selectorKind": self.kind,
            "jsonPointer": self.pointer,
            "section": self.section,
            "exact": self.quote,
            "prefix": self.prefix,
            "suffix": self.suffix,
            "startOffset": self.start,
            "endOffset": self.end,
            "occurrencesInSnapshot": self.occurrences,
            "quoteHash": self.quote_hash,
            "selectorDigest": self.selector_digest,
            "reanchorsLocatorUid": self.reanchors,
            "reanchorMatch": self.reanchor_match,
            "note": self.note,
        }
        return {k: v for k, v in r.items() if v is not None}

    def intent(self):
        r = {"ref": self.ref, "uid": self.uid, "selectorKind": self.kind, "quote": self.quote,
             "quotePrefix": self.prefix[-400:], "quoteSuffix": self.suffix[:400],
             "startOffset": self.start, "endOffset": self.end, "properties": {}}
        if self.section:
            r["section"] = self.section
        if self.pointer:
            r["properties"]["jsonPointer"] = self.pointer
        r["properties"]["selectorDigest"] = self.selector_digest
        return r


UCK = "use-constraint-key/v2"
HASH_BASIS_NOTE = {"EXTRACTED_TEXT_BYTES": "contentHash = sha256 of the UTF-8 bytes of the extractor output exactly as stored (no normalization); NORMALIZED_TEXT (fixtures stage) was relabeled in the adversarial review because no normalization is applied before hashing (OQ-D5-46)."}


def use_constraint(kind, subject_uid, scope=(), populations=(), dose=None, route=None, jurisdiction=None, timing=None):
    """use-constraint-key/v2 (adversarial review): canonical identity string and its sha256 (04 UseConstraint docstring).
    v2 = v1 + an always-present timing component (empty unless TIMING), so two TIMING constraints on one means never collide."""
    parts = [
        UCK,
        f"kind={kind}",
        f"subject={subject_uid}",
        "scope=" + ",".join(sorted(list(scope) + [f"population:{p}" for p in populations])),
        "dose=" + (dose or ""),
        "route=" + (route or ""),
        "jurisdiction=" + (jurisdiction or ""),
        "timing=" + (timing or ""),
    ]
    key = "|".join(parts)
    return key, "sha256:" + sha_text(key)


class NoAliasDumper(yaml.SafeDumper):
    def ignore_aliases(self, data):
        return True


def dump_yaml(path, data, header):
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(header.rstrip() + "\n")
        yaml.dump(data, f, Dumper=NoAliasDumper, sort_keys=False, allow_unicode=True, width=200, default_flow_style=False)


def dump_json(path, data):
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def produced(fixture):
    return {"missionId": MISSION, "runId": f"run:ft-D5-{fixture}"}


def html_text(s: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", " ", s)).replace("\xa0", " ")
