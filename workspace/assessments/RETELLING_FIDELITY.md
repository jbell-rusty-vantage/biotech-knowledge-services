---
id: "asmt:RETELLING_FIDELITY"
kind: "assessment"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/assessments.yaml#RETELLING_FIDELITY"]
aliases: ["retelling fidelity","d10.fidelity.design-label","d10.fidelity.status","d10.fidelity.unit","d8.regulatory-characterization"]
capabilities: ["get","propose:assessment.record"]
cardDigest: "sha256:c6d50f6336bb0158a76a989e6628e8552b49a72cd0bd1bca786f59db691b8487"
---
# Assessment kind RETELLING_FIDELITY

An Assessment is a kernel record (`node:Assessment`) that judges its subjects through `ASSESSES` and cites evidence through `HAS_EVIDENCE`; `kind` is **RETELLING_FIDELITY**, `subkind` one of the 4 registered values below. See [Assessment](../nodes/Assessment.md) and [ASSESSES](../relationships/ASSESSES.md).

## Subkinds (4)

| subkind | registrar | status | conclusion codes | facets | admissible subjects | method versions |
| --- | --- | --- | --- | --- | --- | --- |
| `D10.fidelity.design-label` | D10 | registered |  |  | [Publication](../nodes/Publication.md) | bl-fidelity/design-label@0 (fixture) |
| `D10.fidelity.status` | D10 | registered |  |  | [Claim](../nodes/Claim.md) | bl-fidelity/status@0 (fixture) |
| `D10.fidelity.unit` | D10 | registered |  |  | [Claim](../nodes/Claim.md) | bl-fidelity/unit@1 (fixture; adversarial-review stage: compares against the sam… |
| `D8.regulatory-characterization` | D8 | registered |  |  |  |  |

## Admissible subjects across subkinds

[Claim](../nodes/Claim.md), [Publication](../nodes/Publication.md)

## Source definition

- `release:vocabularies/assessments.yaml#RETELLING_FIDELITY`
