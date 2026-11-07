"""bks-canonical-json.v2 (KN-08), byte-identical to packages/contracts/src/canonical.ts.

The rules are stated in the TypeScript module; this port follows them exactly:

* object keys sorted by UTF-16 code units (RFC 8785), not by code points;
* arrays keep order unless the profile declares the path a semantic set (sorted by canonical text, duplicates removed);
* numbers in the ECMAScript Number::toString form; ``-0`` -> ``0``; NaN/Infinity rejected; integral values outside
  +-(2**53 - 1) rejected (large integers travel as decimal strings);
* strings escaped as JavaScript's JSON.stringify escapes them, no Unicode normalization, lone surrogates rejected;
* booleans and null as JSON literals; any other type rejected.

Golden vectors: packages/contracts/golden/canonical-json.v2.json (run by both test suites).
"""

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Any

CANONICAL_JSON_V2 = "bks-canonical-json.v2"
MAX_SAFE = 2**53 - 1


class CanonicalError(ValueError):
    def __init__(self, code: str, message: str, path: str = "") -> None:
        super().__init__(f"{code} at {path or '$'}: {message}")
        self.code = code
        self.path = path


@dataclass(frozen=True)
class CanonicalProfile:
    sets: tuple[str, ...] = ()
    fields: dict[str, tuple[str, ...]] = field(default_factory=dict)

    @staticmethod
    def from_json(obj: dict[str, Any] | None) -> "CanonicalProfile":
        if not obj:
            return CanonicalProfile()
        return CanonicalProfile(
            sets=tuple(obj.get("sets", [])),
            fields={k: tuple(v) for k, v in (obj.get("fields") or {}).items()},
        )


def _path_matches(pattern: str, path: str) -> bool:
    if pattern == path:
        return True
    p = pattern.split(".")
    q = path.split(".")
    if len(p) != len(q):
        return False
    for seg, other in zip(p, q):
        if seg == other or seg == "*":
            continue
        if seg.startswith("*") and other.endswith(seg[1:]):
            continue
        return False
    return True


def _child(path: str, key: str) -> str:
    return f"{path}.{key}" if path else key


def _utf16_key(s: str) -> bytes:
    return s.encode("utf-16-be", "surrogatepass")


def _has_lone_surrogate(s: str) -> bool:
    return any(0xD800 <= ord(c) <= 0xDFFF for c in s)


def _es_number(x: float, path: str) -> str:
    """ECMAScript Number::toString(x) for a finite, non-zero double."""
    if x != x or x in (float("inf"), float("-inf")):
        raise CanonicalError("CANONICAL_NONFINITE", f"{x} is not finite", path)
    if x == 0:
        return "0"
    if x.is_integer() and abs(x) > MAX_SAFE:
        raise CanonicalError("CANONICAL_UNSAFE_INTEGER", f"{x!r} is outside +-(2^53-1); carry it as a decimal string", path)
    sign = "-" if x < 0 else ""
    sign_bit, digits_t, exp = Decimal(repr(abs(x))).as_tuple()
    digits = "".join(str(d) for d in digits_t).lstrip("0") or "0"
    # strip trailing zeros into the exponent (repr can give '123.0')
    stripped = digits.rstrip("0")
    exp += len(digits) - len(stripped)
    digits = stripped
    k = len(digits)
    n = k + exp  # value = 0.d1..dk * 10^n
    if k <= n <= 21:
        out = digits + "0" * (n - k)
    elif 0 < n <= 21:
        out = digits[:n] + "." + digits[n:]
    elif -6 < n <= 0:
        out = "0." + "0" * (-n) + digits
    else:
        e = n - 1
        es = f"+{e}" if e >= 0 else f"-{-e}"
        out = (digits if k == 1 else digits[0] + "." + digits[1:]) + "e" + es
    return sign + out


def _encode_string(s: str, path: str) -> str:
    if _has_lone_surrogate(s):
        raise CanonicalError("CANONICAL_LONE_SURROGATE", "string contains a lone surrogate", path)
    return json.dumps(s, ensure_ascii=False)


def _encode(value: Any, path: str, profile: CanonicalProfile) -> str:
    if value is None:
        return "null"
    if value is True:
        return "true"
    if value is False:
        return "false"
    if isinstance(value, int):
        if abs(value) > MAX_SAFE:
            raise CanonicalError("CANONICAL_UNSAFE_INTEGER", f"{value} is outside +-(2^53-1); carry it as a decimal string", path)
        return str(value)
    if isinstance(value, float):
        return _es_number(value, path)
    if isinstance(value, str):
        return _encode_string(value, path)
    if isinstance(value, (list, tuple)):
        item_path = f"{path}[]"
        items = [_encode(v, item_path, profile) for v in value]
        if any(_path_matches(s, path) for s in profile.sets):
            items = sorted(set(items), key=_utf16_key)
        return "[" + ",".join(items) + "]"
    if isinstance(value, dict):
        allowed = None
        for p, keys in profile.fields.items():
            if _path_matches(p, path):
                allowed = keys
                break
        parts = []
        for key in sorted(value.keys(), key=lambda k: _utf16_key(k) if isinstance(k, str) else b""):
            if not isinstance(key, str):
                raise CanonicalError("CANONICAL_UNSUPPORTED_TYPE", "object keys must be strings", path)
            if _has_lone_surrogate(key):
                raise CanonicalError("CANONICAL_LONE_SURROGATE", "key contains a lone surrogate", path)
            if allowed is not None and key not in allowed:
                raise CanonicalError("CANONICAL_UNKNOWN_FIELD", f"{key} is not in the declared field set", path)
            parts.append(_encode_string(key, path) + ":" + _encode(value[key], _child(path, key), profile))
        return "{" + ",".join(parts) + "}"
    raise CanonicalError("CANONICAL_UNSUPPORTED_TYPE", f"{type(value).__name__} is not a JSON value", path)


def canonicalize(value: Any, profile: CanonicalProfile | dict[str, Any] | None = None) -> str:
    prof = profile if isinstance(profile, CanonicalProfile) else CanonicalProfile.from_json(profile)
    return _encode(value, "", prof)


def canonical_digest(value: Any, profile: CanonicalProfile | dict[str, Any] | None = None) -> str:
    return "sha256:" + hashlib.sha256(canonicalize(value, profile).encode("utf-8")).hexdigest()


def raw_bytes_digest(data: bytes | str) -> str:
    raw = data.encode("utf-8") if isinstance(data, str) else data
    return "sha256:" + hashlib.sha256(raw).hexdigest()


# ---------------------------------------------------------------------------------------------
# Typed scalar spellings
# ---------------------------------------------------------------------------------------------

_INSTANT = re.compile(r"^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-]\d{2}:\d{2})$", re.IGNORECASE)
_DATE = re.compile(r"^(\d{4})-(\d{2})-(\d{2})$")
_DURATION = re.compile(r"^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+(?:\.\d{1,9})?S)?)?$")
_DECIMAL = re.compile(r"^([+-])?(\d+)(?:\.(\d+))?$")


def _valid_date(y: int, m: int, d: int) -> bool:
    if m < 1 or m > 12 or d < 1:
        return False
    leap = (y % 4 == 0 and y % 100 != 0) or y % 400 == 0
    dim = [31, 29 if leap else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]
    return d <= dim


def canonical_instant(text: str) -> str:
    m = _INSTANT.match(text)
    if not m:
        raise CanonicalError("CANONICAL_TEMPORAL", f"not an RFC 3339 instant with offset: {text}")
    ys, mos, ds, hs, mis, ss, frac, off = m.groups()
    y, mo, d, h, mi, s = int(ys), int(mos), int(ds), int(hs), int(mis), int(ss or "00")
    if y < 1 or not _valid_date(y, mo, d) or h > 23 or mi > 59 or s > 59:
        raise CanonicalError("CANONICAL_TEMPORAL", f"invalid instant fields: {text}")
    offset = 0
    if off.upper() != "Z":
        sign = -1 if off[0] == "-" else 1
        oh, om = int(off[1:3]), int(off[4:6])
        if oh > 23 or om > 59:
            raise CanonicalError("CANONICAL_TEMPORAL", f"invalid offset: {text}")
        offset = sign * (oh * 60 + om)
    dt = datetime(y, mo, d, h, mi, s, tzinfo=timezone.utc) - timedelta(minutes=offset)
    if dt.year < 0 or dt.year > 9999:
        raise CanonicalError("CANONICAL_TEMPORAL", f"year out of range: {text}")
    fraction = (frac or "").rstrip("0")
    return f"{dt.year:04d}-{dt.month:02d}-{dt.day:02d}T{dt.hour:02d}:{dt.minute:02d}:{dt.second:02d}" + (f".{fraction}" if fraction else "") + "Z"


def canonical_date(text: str) -> str:
    m = _DATE.match(text)
    if not m or not _valid_date(int(m.group(1)), int(m.group(2)), int(m.group(3))):
        raise CanonicalError("CANONICAL_TEMPORAL", f"not a calendar date: {text}")
    return text


def canonical_duration(text: str) -> str:
    up = text.upper()
    if not _DURATION.match(up):
        raise CanonicalError("CANONICAL_TEMPORAL", f"not an ISO 8601 duration: {text}")
    return up


def canonical_decimal(text: str) -> str:
    m = _DECIMAL.match(text.strip())
    if not m:
        raise CanonicalError("CANONICAL_DECIMAL", f"not a plain decimal: {text}")
    sign, int_part, frac_part = m.group(1), m.group(2), m.group(3) or ""
    i = re.sub(r"^0+(?=\d)", "", int_part)
    f = frac_part.rstrip("0")
    if re.fullmatch(r"0*", i) and f == "":
        return "0"
    return ("-" if sign == "-" else "") + i + (f".{f}" if f else "")
