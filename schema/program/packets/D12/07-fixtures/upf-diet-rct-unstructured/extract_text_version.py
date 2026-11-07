"""text-version/v1 — rebuilds the text version the upf-diet-rct-unstructured fixture's chunk and textVersion offsets use.

Input: the snapshot bytes of snap-hall-jats (NCBI efetch db=pmc id=7946062, JATS XML, sha256 e95aca15…29ae3).
Rule (exactly what the research stage did; recovered and checked in the adversarial-review pass, 2026-10-08):
  1. decode the bytes as UTF-8 (strict);
  2. replace every markup tag `<[^>]+>` (elements, the XML declaration and the DOCTYPE alike) with ONE space;
  3. collapse every run of Python `\\s` whitespace (Unicode-aware: includes U+00A0 and U+2009) into ONE space;
  4. keep everything else: no entity unescaping (`&lt;` stays), no trimming, no Unicode normalization.
Offsets are 0-based Unicode code points of the result, end exclusive. Expected output: 66,807 code points,
sha256 25b62c8f9852e42ec2a35cd80a8104df4fbc84af3c37a7e4f42f9b58444c1faa (the fixture's textVersionHash); the Summary
chunk is [2050, 3130) (sha256 e3772265…6212 of its UTF-8 text) and "Energy intake was greater during the ultra-processed
diet (508±106 kcal/d; p=0.0001)" starts at 2568.

usage: python -I extract_text_version.py <jats.xml> [out.txt]
"""
import hashlib
import re
import sys

EXTRACTOR = "text-version/v1"


def text_version(xml_bytes: bytes) -> str:
    x = xml_bytes.decode("utf-8")
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", x))


def main() -> int:
    data = open(sys.argv[1], "rb").read()
    t = text_version(data)
    out = t.encode("utf-8")
    if len(sys.argv) > 2:
        open(sys.argv[2], "wb").write(out)
    chunk = t[2050:3130]
    print(f"{EXTRACTOR}: snapshot sha256 {hashlib.sha256(data).hexdigest()}")
    print(f"text version: {len(t)} code points, sha256 {hashlib.sha256(out).hexdigest()}")
    print(f"chunk [2050, 3130): sha256 {hashlib.sha256(chunk.encode('utf-8')).hexdigest()}")
    print(f"'Energy intake was greater' at {t.find('Energy intake was greater')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
