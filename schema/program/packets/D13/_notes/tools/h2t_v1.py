"""h2t-v1: deterministic HTML -> text projection used for D13 fixture locators (EDGAR 8-K / EX-99.1 HTML).

Usage: python -I h2t_v1.py <in.htm> <out.txt>
Output is UTF-8 with LF line endings. Locator offsets in 07-fixtures/*/locators.yaml are Unicode code-point offsets
into this output (Python str indices). Same algorithm as the research-stage a7tools/h2t.py; v1 pins LF output (the
research copy wrote CRLF on Windows, so its projection hashes differ while the text is identical after newline
normalization).
"""
import re
import sys
from html.parser import HTMLParser


class P(HTMLParser):
    def __init__(self):
        super().__init__()
        self.out = []
        self.skip = 0

    def handle_starttag(self, t, a):
        if t in ("script", "style"):
            self.skip += 1
        if t in ("p", "div", "br", "tr", "li", "h1", "h2", "h3", "h4", "table"):
            self.out.append("\n")
        if t in ("td", "th"):
            self.out.append(" | ")

    def handle_endtag(self, t):
        if t in ("script", "style"):
            self.skip -= 1
        if t in ("p", "div", "tr", "li", "h1", "h2", "h3", "h4"):
            self.out.append("\n")

    def handle_data(self, d):
        if not self.skip:
            self.out.append(d)


def project(raw_bytes: bytes) -> str:
    p = P()
    p.feed(raw_bytes.decode("utf-8", "replace"))
    t = "".join(p.out).replace("\xa0", " ")
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n\s*\n+", "\n\n", t)
    return t.strip() + "\n"


if __name__ == "__main__":
    text = project(open(sys.argv[1], "rb").read())
    with open(sys.argv[2], "w", encoding="utf-8", newline="\n") as f:
        f.write(text)
