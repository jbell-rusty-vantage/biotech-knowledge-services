# D4 fixtures generator (fixtures stage, A3, 2026-10-08).
# Usage: python -I gen.py <scratch D4 dir> <packet D4 dir> <spec dir>
# Reads fresh captures from <scratch>/refetch, verifies every quote by exact substring match, computes offsets,
# prefix/suffix, page, JSON pointer, quote hash, and writes per fixture: source.md, locators.yaml, assertions.yaml,
# intent.json, questions.md. Fails loudly on any quote that is not found verbatim.
import hashlib, json, os, sys, glob, yaml

SCR, PKT, SPECDIR = sys.argv[1], sys.argv[2], sys.argv[3]
RF = os.path.join(SCR, 'refetch')
sys.stdout.reconfigure(encoding='utf-8')

def sha(b):
    return hashlib.sha256(b).hexdigest()

_cache = {}
def load(fname):
    if fname in _cache:
        return _cache[fname]
    b = open(os.path.join(RF, fname), 'rb').read()
    try:
        t = b.decode('utf8'); enc = 'utf-8'
    except UnicodeDecodeError:
        t = b.decode('latin-1'); enc = 'latin-1'
    _cache[fname] = (b, t, enc)
    return _cache[fname]

def find_json(obj, quote, path=''):
    """Yield (pointer, string) for every JSON string value containing quote."""
    if isinstance(obj, str):
        if quote in obj:
            yield path, obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            yield from find_json(v, quote, path + '/' + str(k).replace('~', '~0').replace('/', '~1'))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from find_json(v, quote, path + '/' + str(i))

FAIL = []
class NoAlias(yaml.SafeDumper):
    def ignore_aliases(self, data):
        return True
def ydump(o):
    return yaml.dump(o, Dumper=NoAlias, sort_keys=False, allow_unicode=True, width=160)
CTX = 32  # default prefix/suffix context; a locator may set prefixChars/suffixChars (e.g. to keep a forum handle out of the stored context)

def make_locator(fx, snaps, L):
    s = snaps[L['snap']]
    kind = s['basis']
    out = {'ref': L['ref'], 'uid': f"hu:locator:ft-d4-{fx['short']}-{L['ref']}", 'snapshot': s.get('alias', L['snap'])}
    if kind == 'whole':
        out.update({'selectorKind': 'WHOLE_SNAPSHOT', 'selector': {'type': 'WholeSnapshot', 'snapshotDigest': 'sha256:' + s['digest']}})
        if L.get('note'): out['note'] = L['note']
        return out
    if kind == 'json':
        b, t, enc = load(s['file'])
        obj = json.loads(t)
        hits = list(find_json(obj, L['quote']))
        if L.get('pointer'):
            hits = [h for h in hits if h[0] == L['pointer']]
        if not hits:
            FAIL.append((fx['id'], L['ref'], 'json quote not found', L['quote'][:80])); return out
        ptr, val = hits[L.get('occurrence', 0)]
        i = val.find(L['quote'])
        exact = L['quote']
        out.update({'selectorKind': 'JSON_POINTER',
                    'selector': {'type': 'JsonPointerSelector', 'pointer': ptr,
                                 'refinedBy': {'type': 'TextPositionSelector', 'start': i, 'end': i + len(exact),
                                               'offsetBasis': 'Unicode code points of the decoded JSON string value at pointer'}},
                    'exact': exact, 'prefix': val[max(0, i - L.get('prefixChars', CTX)):i], 'suffix': val[i + len(exact):i + len(exact) + L.get('suffixChars', CTX)],
                    'startOffset': i, 'endOffset': i + len(exact), 'jsonPointer': ptr})
    else:
        tf = s.get('textFile', s['file'])
        b, t, enc = load(tf)
        starts = []
        j = t.find(L['quote'])
        while j >= 0:
            starts.append(j); j = t.find(L['quote'], j + 1)
        if not starts:
            FAIL.append((fx['id'], L['ref'], 'text quote not found', L['quote'][:80])); return out
        i = starts[L.get('occurrence', 0)]
        exact = L['quote']
        sel = {'type': 'TextPositionSelector', 'start': i, 'end': i + len(exact), 'offsetBasis': s['offsetBasis']}
        sk = 'CHARACTER_POSITION'
        if kind == 'pdf':
            page = t[:i].count('\f') + 1
            out['page'] = page
            sk = 'PDF_TEXT'
            sel = {'type': 'PdfTextSelector', 'page': page, 'refinedBy': sel}
        out.update({'selectorKind': sk, 'selector': sel,
                    'textQuote': {'type': 'TextQuoteSelector', 'exact': exact, 'prefix': t[max(0, i - L.get('prefixChars', CTX)):i], 'suffix': t[i + len(exact):i + len(exact) + L.get('suffixChars', CTX)]},
                    'exact': exact, 'startOffset': i, 'endOffset': i + len(exact), 'occurrences': len(starts)})
        if len(starts) > 1:
            out['occurrenceIndex'] = L.get('occurrence', 0)
    out['quoteHash'] = 'sha256:' + sha(L['quote'].encode('utf8'))
    out['quoteNormalization'] = 'none (exact code points)'
    if L.get('section'): out['section'] = L['section']
    if L.get('note'): out['note'] = L['note']
    out['verified'] = '2026-10-08 exact substring of the fresh capture (refetch)'
    return out

def snapshot_record(s):
    b, t, enc = load(s['file'])
    d = sha(b)
    assert d == s['digest'], (s['file'], d, s['digest'])
    rec = {'ref': s['ref'], 'uid': 'hu:snapshot:' + d[:16], 'url': s['url'], 'title': s['title'],
           'sourceKind': s['sourceKind'], 'genre': s.get('genre'), 'retrievedAt': s['retrievedAt'],
           'contentHash': 'sha256:' + d, 'contentHashBasis': 'RAW_BYTES', 'bytes': len(b), 'mimeType': s['mime'],
           'captureMethod': s['tool'], 'captureCompleteness': s.get('completeness', 'COMPLETE')}
    if s.get('textFile'):
        tb, tt, tenc = load(s['textFile'])
        rec['derivedText'] = {'contentHash': 'sha256:' + sha(tb), 'rule': s['textRule'], 'chars': len(tt), 'decodedAs': tenc}
    if s.get('researchDigest') and s['researchDigest'] != d:
        rec['researchStageDigest'] = 'sha256:' + s['researchDigest']
        rec['changedSinceResearch'] = True
    elif s.get('researchDigest'):
        rec['researchStageDigest'] = 'identical (re-fetch returned the same bytes)'
    if s.get('note'): rec['note'] = s['note']
    s['digest'] = d
    return rec

def run(fx):
    snaps = {s['ref']: s for s in fx['snapshots']}
    srecs = []
    for s in fx['snapshots']:
        if s['basis'] == 'whole' and s.get('alias'):
            continue
        srecs.append(snapshot_record(s))
    for s in fx['snapshots']:
        if s.get('alias'):
            s['digest'] = snaps[s['alias']]['digest']
    locs = [make_locator(fx, snaps, L) for L in fx['locators']]
    locref = {l['ref'] for l in locs}
    for a in fx['assertions']:
        for r in a.get('locators', []):
            if r not in locref and not r.startswith('hu:'):
                FAIL.append((fx['id'], a['id'], 'unknown locator', r))
    for a in fx.get('assessments', []):
        for r in a.get('evidence', []):
            if r['locator'] not in locref:
                FAIL.append((fx['id'], a['id'], 'unknown locator', r['locator']))
    d = os.path.join(PKT, '07-fixtures', fx['id'])
    os.makedirs(d, exist_ok=True)
    # locators.yaml
    hdr = (f"# Fixture {fx['id']} - locators (fixtures stage, A3, 2026-10-08).\n"
           "# selectorKind values are the kernel SelectorKind enum (verification.v1 kinds + WHOLE_SNAPSHOT); W3C selector JSON in `selector`.\n"
           "# Every exact quote was re-verified as an exact substring of a fresh capture made today (scratch ft/D4/refetch);\n"
           "# offsets are 0-based [start, end) in the basis named by the snapshot (offsetBasis / derivedText.rule).\n")
    body = {'snapshots': srecs, 'locators': locs}
    open(os.path.join(d, 'locators.yaml'), 'w', encoding='utf8', newline='\n').write(hdr + ydump(body))
    # assertions.yaml
    prov = {'missionId': 'mission:ft-D4-fixtures', 'runId': f"run:ft-D4-{fx['id']}"}
    ass = []
    for a in fx['assertions']:
        a2 = {'id': a['id'], 'uid': f"hu:assertion:ft-d4-{fx['short']}-{a['id']}"}
        a2.update({k: v for k, v in a.items() if k != 'id'})
        a2['producedBy'] = prov
        ass.append(a2)
    assessments = []
    for a in fx.get('assessments', []):
        a2 = {'id': a['id'], 'uid': f"hu:assessment:ft-d4-{fx['short']}-{a['id']}"}
        a2.update({k: v for k, v in a.items() if k != 'id'})
        a2['producedBy'] = prov
        assessments.append(a2)
    hdr2 = (f"# Fixture {fx['id']} - assertions (fixtures stage, A3, 2026-10-08).\n"
            "# producedBy ids are FIXTURE ids (mission:ft-D4-fixtures / run:ft-D4-<fixture>), not real Mission Control runs.\n"
            "# Types: D4 types from 04-schema-proposal.graphql; kernel types (Assertion, Claim, Assessment, Agent, SourceLocator) from\n"
            "# packets/K/04-schema-proposal.graphql; other modules' types through the seams in 10-seams.yaml.\n"
            "# edgeClass: asserted = AssertedEdgeProperties episode authorized by this Assertion (assertionUid on the edge);\n"
            "# structural = StructuralEdgeProperties edge written by edge.structural, the row's locator cites the captured record;\n"
            "# literal / field = kernel Assertion with a typed value (predicate-only or a node property), no edge.\n")
    body2 = {'fixture': fx['id'], 'producedBy': prov, 'entities': fx['entities'], 'assertions': ass}
    if assessments: body2['assessments'] = assessments
    if fx.get('retrievalPath'): body2['retrievalPath'] = fx['retrievalPath']
    open(os.path.join(d, 'assertions.yaml'), 'w', encoding='utf8', newline='\n').write(hdr2 + ydump(body2))
    # intent.json
    intent = build_intent(fx, snaps, locs)
    open(os.path.join(d, 'intent.json'), 'w', encoding='utf8', newline='\n').write(json.dumps(intent, ensure_ascii=False, indent=2) + '\n')
    # source.md
    open(os.path.join(d, 'source.md'), 'w', encoding='utf8', newline='\n').write(source_md(fx, srecs))
    # questions.md
    open(os.path.join(d, 'questions.md'), 'w', encoding='utf8', newline='\n').write(fx['questionsMd'])
    return locs

def source_md(fx, srecs):
    first = srecs[0]
    L = [f"# Fixture {fx['id']} - source", "",
         f"- kind: {fx['kind']}",
         f"- url: {first['url']}",
         f"- title: {first['title']}",
         f"- retrieved: {first['retrievedAt'][:10]}",
         f"- snapshot digest: {first['contentHash']}",
         f"- tool: {first['captureMethod']}",
         f"- candidate: {fx['candidate']}",
         "", "## Description", "", fx['description'], "", "## Snapshots", ""]
    for i, s in enumerate(srecs, 1):
        L.append(f"### S{i} `{s['ref']}`")
        L.append("")
        L.append(f"- url: {s['url']}")
        L.append(f"- title: {s['title']}")
        L.append(f"- retrieved: {s['retrievedAt'][:10]} ({s['retrievedAt']})")
        L.append(f"- snapshot digest: {s['contentHash']} ({s['bytes']} bytes, {s['mimeType']}, {s['contentHashBasis']})")
        if s.get('derivedText'):
            L.append(f"- derived text: {s['derivedText']['contentHash']} ({s['derivedText']['chars']} chars) by {s['derivedText']['rule']}")
        L.append(f"- tool: {s['captureMethod']}")
        L.append(f"- source kind / genre: {s['sourceKind']} / {s.get('genre')}")
        if s.get('changedSinceResearch'):
            L.append(f"- research-stage capture differed: {s['researchStageDigest']} (quotes re-verified on this capture; offsets are this capture's)")
        elif s.get('researchStageDigest'):
            L.append(f"- research-stage capture: {s['researchStageDigest']}")
        if s.get('note'):
            L.append(f"- note: {s['note']}")
        L.append("")
    L += ["## Citation", "", fx['citation'], ""]
    return '\n'.join(L)

def build_intent(fx, snaps, locs):
    if fx.get('intentNote') == 'none':
        return {'note': fx['intentWhyNot']}
    sources = []
    bysnap = {}
    for l in locs:
        bysnap.setdefault(l['snapshot'], []).append(l)
    for s in fx['snapshots']:
        if s.get('alias'):
            continue
        ldecl = []
        for l in bysnap.get(s['ref'], []):
            dcl = {'ref': l['ref'], 'uid': l['uid'], 'selectorKind': l['selectorKind']}
            if 'exact' in l: dcl['quote'] = l['exact']
            if 'startOffset' in l: dcl['startOffset'] = l['startOffset']; dcl['endOffset'] = l['endOffset']
            if 'page' in l: dcl['page'] = l['page']
            if l.get('section'): dcl['section'] = l['section'][:400]
            if 'textQuote' in l:
                dcl['quotePrefix'] = l['textQuote']['prefix']; dcl['quoteSuffix'] = l['textQuote']['suffix']
            elif 'prefix' in l:
                dcl['quotePrefix'] = l['prefix']; dcl['quoteSuffix'] = l['suffix']
            dcl['properties'] = {'selectorJson': json.dumps(l['selector'], ensure_ascii=False, sort_keys=True)}
            ldecl.append(dcl)
        for a in [x for x in fx['snapshots'] if x.get('alias') == s['ref']]:
            for l in bysnap.get(a['ref'], []):
                ldecl.append({'ref': l['ref'], 'uid': l['uid'], 'selectorKind': l['selectorKind'],
                              'properties': {'selectorJson': json.dumps(l['selector'], ensure_ascii=False, sort_keys=True)}})
        snap = {'observedAt': s['retrievedAt'], 'retrievedAt': s['retrievedAt'], 'contentHash': 'sha256:' + s['digest'],
                'contentHashBasis': 'RAW_BYTES', 'captureCompleteness': s.get('completeness', 'COMPLETE'),
                'properties': {'captureMethod': s['tool'], 'mimeType': s['mime']}}
        if s.get('textFile'):
            tb, tt, te = load(s['textFile'])
            snap['properties']['derivedTextHash'] = 'sha256:' + sha(tb)
            snap['properties']['derivedTextRule'] = s['textRule']
        sources.append({'ref': s['ref'], 'source': {'canonicalUri': s['url'], 'title': s['title'][:600], 'sourceKind': s['sourceKind'],
                                                    'properties': ({'genre': s['genre']} if s.get('genre') else {})},
                        'snapshot': snap, 'locators': ldecl})
    subjects = []
    for e in fx['entities']:
        if e.get('mode') == 'resolved':
            subjects.append({'ref': e['ref'], 'mode': 'resolved', 'uid': e['uid'], 'nodeType': e['type']})
            continue
        sub = {'ref': e['ref'], 'mode': 'new', 'nodeType': e['type'], 'name': e['name'],
               'uidSegment': e['uid'].split(':', 2)[2], 'properties': {k: v for k, v in e.get('props', {}).items()},
               'identifiers': e.get('identifiers', []), 'onMatch': e.get('onMatch', 'review')}
        subjects.append(sub)
    props = []
    n = 0
    for a in fx['assertions']:
        n += 1
        ev = [r for r in a.get('locators', [])]
        cls = a['edgeClass']
        core = {}
        for k in ('polarity', 'basisKind', 'speechAct'):
            if a.get(k): core[k] = a[k]
        if a.get('validTime'): core['validity'] = {k: v for k, v in a['validTime'].items() if v is not None}
        else: core['validity'] = {}
        pid = f"p{n:02d}-{a['id']}"
        if cls == 'asserted':
            p = {'proposalId': pid, 'kind': 'edge.assert', 'relationshipType': a['predicate'], 'fromRef': a['subject']['ref'],
                 'toRef': a['object']['ref'], 'evidence': ev, 'assertion': core}
            if a.get('asserter'): p['asserterRef'] = a['asserter']['ref']
        elif cls == 'structural':
            p = {'proposalId': pid, 'kind': 'edge.structural', 'relationshipType': a['predicate'], 'fromRef': a['subject']['ref'],
                 'toRef': a['object']['ref'], 'evidence': ev, 'properties': ({'orderIndex': a['orderIndex']} if 'orderIndex' in a else {})}
        elif cls == 'field':
            p = {'proposalId': pid, 'kind': 'node.upsert', 'subjectRef': a['subject']['ref'], 'evidence': ev,
                 'properties': a['intentProperties']}
        elif cls == 'identifier':
            p = {'proposalId': pid, 'kind': 'identifier.attach', 'subjectRef': a['subject']['ref'], 'evidence': ev,
                 'identifier': a['identifier']}
        else:  # literal
            p = {'proposalId': pid, 'kind': 'assertion.literal', 'subjectRef': a['subject']['ref'], 'predicate': a['predicate'],
                 'evidence': ev, 'assertion': core}
            v = a.get('value', {})
            for k in ('valueString', 'valueNumber', 'valueBoolean', 'unitCode'):
                if k in v: p[k] = v[k]
            if a.get('asserter'): p['asserterRef'] = a['asserter']['ref']
        if a.get('rationale'): p['rationale'] = a['rationale'][:2000]
        props.append(p)
    return {'schemaVersion': 'biotech-knowledge-intent.v1', 'intentId': f"ft-d4-{fx['short']}-2026-10-08",
            'context': {'actor': {'kind': 'agent', 'id': 'ft-d4-fixtures-agent-a3', 'model': 'claude-opus-5-5'},
                        'run': {'system': 'mission-control', 'runId': f"run:ft-D4-{fx['id']}", 'missionId': 'mission:ft-D4-fixtures'},
                        'activityKind': 'EXTRACTION'},
            'onStale': 'fail', 'sources': sources, 'subjects': subjects, 'proposals': props,
            'notes': fx['intentNotes'][:4000]}

specs = []
for f in sorted(glob.glob(os.path.join(SPECDIR, 'fx_*.py'))):
    ns = {'RF': RF, 'sha': sha, 'load': load}
    exec(open(f, encoding='utf8').read(), ns)
    specs.append(ns['FX'])
only = os.environ.get('ONLY')
for fx in specs:
    if only and fx['id'] != only:
        continue
    locs = run(fx)
    print(fx['id'], 'locators', len(locs), 'assertions', len(fx['assertions']), 'assessments', len(fx.get('assessments', [])))
for f in FAIL:
    print('FAIL', f)
sys.exit(1 if FAIL else 0)
