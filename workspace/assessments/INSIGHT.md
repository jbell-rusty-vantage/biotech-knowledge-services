---
id: "asmt:INSIGHT"
kind: "assessment"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/assessments.yaml#INSIGHT"]
aliases: ["insight","d13.breakthrough-judgment","d13.event-impact","d13.hypothesis-disconfirmation","d13.press-language-check","d7.undisclosed-tie-lead"]
capabilities: ["get","propose:assessment.record"]
cardDigest: "sha256:761868fa7e371691b89236819743c16d98109c2cf17d96d66437f2dd20788bc1"
---
# Assessment kind INSIGHT

An Assessment is a kernel record (`node:Assessment`) that judges its subjects through `ASSESSES` and cites evidence through `HAS_EVIDENCE`; `kind` is **INSIGHT**, `subkind` one of the 5 registered values below. See [Assessment](../nodes/Assessment.md) and [ASSESSES](../relationships/ASSESSES.md).

## Subkinds (5)

| subkind | registrar | status | conclusion codes | facets | admissible subjects | method versions |
| --- | --- | --- | --- | --- | --- | --- |
| `D13.breakthrough-judgment` | D13 | registered |  |  |  |  |
| `D13.event-impact` | D13 | registered |  |  |  |  |
| `D13.hypothesis-disconfirmation` | D13 | requested |  |  |  |  |
| `D13.press-language-check` | D13 | requested |  |  |  |  |
| `D7.undisclosed-tie-lead` | D7 | registered |  |  |  | d7-tie-leads/v1 |

## Admissible subjects across subkinds

(none)

## Source definition

- `release:vocabularies/assessments.yaml#INSIGHT`
