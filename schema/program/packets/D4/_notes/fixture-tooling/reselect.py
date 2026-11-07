# Independent re-selection: for each fixture locator, open the snapshot by digest, re-derive text, select by offsets/pointer, compare exact + quoteHash.
import sys, os, glob, json, hashlib, yaml, re, html
pkt, rf = sys.argv[1], sys.argv[2]
bydig = {}
for f in os.listdir(rf):
    p = os.path.join(rf, f)
    if os.path.isfile(p): bydig[hashlib.sha256(open(p,'rb').read()).hexdigest()] = p
ok = bad = 0
reg = yaml.safe_load(open(os.path.join(pkt,'05-relationship-register.yaml'),encoding='utf8'))
ids = set(i for e in reg['relationships'] for i in e['populatedBy'])
t08 = open(os.path.join(pkt,'08-sources-and-tools.md'),encoding='utf8').read()
rows = set(re.findall(r'^\| (tool:[a-z0-9-]+|src:[a-z0-9-]+) \|', t08, re.M))
print('populatedBy missing in 08:', sorted(ids - rows))
qids = set(re.findall(r'^\| ((?:Q-D4-\d+|CQ-[A-Z]+-\d+[a-z]?)) \|', open(os.path.join(pkt,'02-questions.md'),encoding='utf8').read(), re.M))
for f in glob.glob(os.path.join(pkt,'07-fixtures','*','locators.yaml')):
    d = yaml.safe_load(open(f,encoding='utf8'))
    snaps = {s['ref']: s for s in d['snapshots']}
    for l in d['locators']:
        s = snaps[l['snapshot']]; raw = bydig[s['contentHash'][7:]]
        b = open(raw,'rb').read()
        if l['selectorKind'] == 'WHOLE_SNAPSHOT': ok += 1; continue
        if l['selectorKind'] == 'JSON_POINTER':
            o = json.loads(b.decode('utf8'))
            for part in l['jsonPointer'].split('/')[1:]:
                part = part.replace('~1','/').replace('~0','~')
                o = o[int(part)] if isinstance(o, list) else o[part]
            sel = o[l['startOffset']:l['endOffset']]
        else:
            if s.get('derivedText'):
                rule = s['derivedText']['rule']
                if rule.startswith('python'):
                    t = re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',b.decode('utf8'))))
                else:
                    tp = raw[:-4] + '.txt'; tb = open(tp,'rb').read()
                    assert 'sha256:' + hashlib.sha256(tb).hexdigest() == s['derivedText']['contentHash']
                    try: t = tb.decode('utf8')
                    except UnicodeDecodeError: t = tb.decode('latin-1')
                assert 'sha256:' + hashlib.sha256(t.encode('utf8' if s['derivedText']['decodedAs']=='utf-8' else 'latin-1')).hexdigest() == s['derivedText']['contentHash'], f
            else:
                t = b.decode('utf8')
            sel = t[l['startOffset']:l['endOffset']]
        good = sel == l['exact'] and 'sha256:' + hashlib.sha256(sel.encode('utf8')).hexdigest() == l['quoteHash']
        ok += good; bad += (not good)
        if not good: print('BAD', f, l['ref'])
print('reselected ok', ok, 'bad', bad)
for f in glob.glob(os.path.join(pkt,'07-fixtures','*','questions.md')):
    used = set(re.findall(r'\b(Q-D4-\d+|CQ-[A-Z]+-\d+[a-z]?)\b', open(f,encoding='utf8').read()))
    print(os.path.basename(os.path.dirname(f)), sorted(used - qids) or 'all question ids exist')
