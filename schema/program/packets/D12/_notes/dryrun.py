# Dry run of the filter predicates of 03 Q-D12-01/02/03/20/21 over the fixtures' assertions.yaml (no Neo4j).
# usage: python -I dryrun.py <07-fixtures dir> [<old 07-fixtures dir from git HEAD>]
import sys, os, glob, json, subprocess
import yaml  # PyYAML


def load(d):
    A, E = [], {}
    for f in sorted(glob.glob(os.path.join(d, '*', 'assertions.yaml'))):
        y = yaml.safe_load(open(f, encoding='utf-8'))
        for e in y.get('entities', []) or []:
            E[e['uid']] = e
        for a in y.get('assertions', []) or []:
            a['_fixture'] = os.path.basename(os.path.dirname(f))
            A.append(a)
        for r in y.get('reused', []) or []:
            pass
    return A, E


def subj(a): return (a.get('subject') or {}).get('uid')
def obj(a): return (a.get('object') or {}).get('uid')
def quals(a): return a.get('qualifiers') or []


def q01(A, E, food, basis, portion):
    rows = [a for a in A if a['predicate'] == 'FOOD_CONTAINS' and subj(a) == food and (basis is None or (a.get('edgeValues') or {}).get('amountBasis') == basis)]
    pw = [a for a in A if a['predicate'] == 'HAS_PORTION_WEIGHT' and subj(a) == food and ('portion:' + portion) in quals(a)]
    out = []
    for r in rows:
        ev = r['edgeValues']
        per = ev['quantity'] * pw[0]['valueNumber'] / 100.0 if pw and ev['amountBasis'] == 'PER_100G' else None
        out.append((obj(r), ev['quantity'], ev['unitCode'], ev['statementKind'], round(per, 1) if per else None))
    return out


def q01_old(A, food, basis):
    return [a['id'] for a in A if a['predicate'] == 'FOOD_CONTAINS' and subj(a) == food and ('basis:' + basis) in quals(a)]


def q02(A, E, base, comp, prep):
    out = []
    for va in [a for a in A if a['predicate'] == 'VARIANT_OF' and obj(a) == base]:
        v = subj(va); vp = (E.get(v) or {}).get('properties', {})
        if vp.get('variantKind') == 'PREPARATION' and (prep is None or vp.get('preparationMethod') == prep):
            rb = [a for a in A if a['predicate'] == 'FOOD_CONTAINS' and subj(a) == base and obj(a) == comp]
            rv = [a for a in A if a['predicate'] == 'FOOD_CONTAINS' and subj(a) == v and obj(a) == comp]
            if rb and rv and rb[0]['edgeValues']['amountBasis'] == rv[0]['edgeValues']['amountBasis']:
                out.append(('variant', v, rb[0]['edgeValues']['quantity'], rv[0]['edgeValues']['quantity']))
    for e in [a for a in A if a['predicate'] == 'PREPARATION_CHANGES_CONTENT' and subj(a) == base and obj(a) == comp]:
        if prep is None or ('preparationMethod:' + prep) in quals(e):
            out.append(('effect', e['id'], e.get('valueNumber'), e.get('valueString')))
    return out


def q03(A, E, prep):
    out = []
    for h in [a for a in A if a['predicate'] == 'FORMS_DURING_PREPARATION']:
        if prep is not None and ('preparationMethod:' + prep) not in quals(h):
            continue
        cmp = subj(h)
        qrs = [a for a in A if a['predicate'] == 'RESULT_FOR' and ('analyte:' + cmp) in quals(a)]
        hz = [a['id'] for a in A if a['predicate'] == 'CAUSES_ADVERSE_EFFECT' and subj(a) == cmp]
        for rf in qrs or [None]:
            prod = obj(rf) if rf else None
            ref = [obj(a) for a in A if a['predicate'] == 'HAS_REFERENCE_FOOD' and subj(a) == prod]
            qr = E.get(subj(rf), {}).get('properties', {}) if rf else {}
            vt = (rf or {}).get('validTime', {})
            out.append((h['id'], obj(h), prod, ref, qr.get('value'), qr.get('reportingLimit'), vt.get('validFrom'), vt.get('validFromBasis'), vt.get('validTo'), hz))
    return out


def q03_old(A, prep):
    return [h['id'] for h in A if h['predicate'] == 'FORMS_DURING_PREPARATION' and ('preparationMethod:' + prep) in quals(h)]


def q20(A, E):
    keep = []
    for a in A:
        if a['predicate'] != 'FOOD_CONTAINS':
            continue
        ev = a.get('edgeValues') or {}
        ds = (E.get(subj(a)) or {}).get('properties', {}).get('definingSystem')
        if ev.get('amountBasis') == 'PER_100G' and ev.get('quantity') is not None and ds in ('FDC_FOUNDATION', 'FDC_SR_LEGACY', 'PHENOL_EXPLORER'):
            keep.append(a['id'])
    return keep


def q20_old(A):
    return [a['id'] for a in A if a['predicate'] == 'FOOD_CONTAINS' and 'basis:PER_100G' in quals(a)]


def q21(A, comp, unit, mn):
    return [(subj(a), a['edgeValues']['quantity']) for a in A if a['predicate'] == 'FOOD_CONTAINS' and obj(a) == comp
            and a['edgeValues']['amountBasis'] == 'PER_100G' and a['edgeValues']['unitCode'] == unit and a['edgeValues']['quantity'] >= mn]


A, E = load(sys.argv[1])
print('Q-D12-01 fdc-170721 PER_100G medium_serving:', q01(A, E, 'hu:food:fdc-170721', 'PER_100G', 'medium_serving'))
print('Q-D12-01 pe EVOO PER_100G:', q01(A, E, 'hu:food:pe-olive-oil-extra-virgin', 'PER_100G', 'x'))
print('Q-D12-02 170027 potassium BAKED:', q02(A, E, 'hu:food:fdc-170027', 'hu:constituent:potassium', 'BAKED'))
print('Q-D12-02 virgin hydroxytyrosol FRIED_DEEP:', q02(A, E, 'hu:food:pe-olive-oil-virgin', 'hu:substance:hydroxytyrosol', 'FRIED_DEEP'))
print('Q-D12-02 olive oil tyrosol FRIED_DEEP:', q02(A, E, 'hu:food:pe-olive-oil', 'hu:substance:tyrosol', 'FRIED_DEEP'))
print('Q-D12-03 FRIED_DEEP:', q03(A, E, 'FRIED_DEEP'))
print('Q-D12-20 projection keeps:', len(q20(A, E)), 'of', sum(1 for a in A if a['predicate'] == 'FOOD_CONTAINS'))
print('Q-D12-21 potassium mg >=500:', q21(A, 'hu:constituent:potassium', 'mg', 500))
print('Q-D12-21 hydroxytyrosol mg >=0.5:', q21(A, 'hu:substance:hydroxytyrosol', 'mg', 0.5))
if len(sys.argv) > 2:
    O, _ = load(sys.argv[2])
    print('OLD Q-D12-01 basis:PER_100G rows:', q01_old(O, 'hu:food:fdc-170721', 'PER_100G'), q01_old(O, 'hu:food:pe-olive-oil-extra-virgin', 'PER_100G'))
    print('OLD Q-D12-03 preparationMethod:FRIED_DEEP rows:', q03_old(O, 'FRIED_DEEP'))
    print('OLD Q-D12-20/21 basis:PER_100G rows:', q20_old(O))
