---
id: "vocab:goal-polarity"
kind: "vocabulary"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/goal-polarity.yaml"]
aliases: ["goal-polarity","goal polarity"]
capabilities: ["get"]
cardDigest: "sha256:2fbf687f3664908339c32fd6005c7845fd00223f658fce4ee7c62b43a6c641d3"
---
# Vocabulary goal-polarity

Release vocabulary `vocabularies/goal-polarity.yaml` (sha256 `1c0eaf27791cf621…`).

- **version**: 1
- **status**: synthesis-final-candidate
- **published**: 2026-10-09
- **owner**: K (EffectDirection, Polarity, SpeechAct); D5 (goal predicates, PopulationGroup, targets); D3 (EstimateDirection); D10 (CriterionDirection); D13 (event harm channel)
- **sources** (8): fast-track/00-DIRECTIVE.md 3.1, 3.2, 3.6, fast-track/01-PACKET-CONTRACT.md (question polarity benefit / harm / neutral; at least a third of rows ask about harm), final/vocabularies/targets.yaml (from packets/D5/vocab-targets.yaml@0.2.2 polarityRule, seamRule, queryPattern), final/_work/registers/D5.relationship.yaml predicateOnly (final subjects and qualifiers of the goal predicates), final/decis…
- **effectDirection**: enum, carriedBy, shape, assessmentKinds, subkinds, values, rule

### goalPredicates (5)

| predicate | direction | effectDirection | meaning |
| --- | --- | --- | --- |
| INTENDED_FOR_TARGET | none |  | the source states the means is for T (marketing category, protocol goal, label purpose) without asserting an effect; never evidence of effe… |
| IMPROVES_TARGET | helps | BENEFIT | the source states or reports that the means improves T |
| WORSENS_TARGET | hurts | HARM | the source states or reports that the means worsens T (harm, impairment, counter-effect) |
| NO_EFFECT_ON_TARGET | none-found | NO_EFFECT | the source reports no effect on T (null result, disconfirmation); never inferred from absence |
| MIXED_EFFECT_ON_TARGET | mixed | MIXED | the source reports opposite effects on T by dose, subgroup or measure |

- **subjects**: any means: D1 ChemicalSubstance | IngredientMaterial, D6 records, D12 FoodItem | FoodCategory | DietaryPattern, D5 Intervention | Protocol | ProtocolEdition, D4 device-as-product (final D5 register; FoodCategory added by R-85)

### otherTargetObjectPredicates (1)

| predicate | registrar | subject | note |
| --- | --- | --- | --- |
| MEDIATES_TARGET | D2 | D2.Mechanism | a mechanism is not a means; admitted by R-83 (OQ-D5-37) |


### notGoalPredicates (3)

| predicate | registrar | note |
| --- | --- | --- |
| RECOMMENDS_AGAINST | D9 | subject = the means; never a Target object; a goal goes in the qualifier target:<key> (R-83) |
| RECOMMENDS_USE | D9 | as RECOMMENDS_AGAINST (R-83); a guideline 'recommends against X for goal T' is WORSENS_TARGET \| NO_EFFECT_ON_TARGET (or USE_CONSTRAINED_IN)… |
| CAUSES_ADVERSE_EFFECT | D5 | object = D2 Condition (PHENOTYPE or DISEASE); replaces REPORTS_ADVERSE_EXPERIENCE (R-84) |

- **polarity**: enum, values, rules
- **speechActsThatCarryDirection**: CAUTIONS, RECOMMENDS, DENIES
- **population**: qualifier, enum, rule, otherQualifiers

### neutralDirections (3)

| enum | owner | usedOn | reads |
| --- | --- | --- | --- |
| EstimateDirection | D3 | StudyResult.direction, MechanismProjectionProperties.direction (D2 AFFECTS_MECHANISM; R-59 replaced MechanismDirection) | direction of the reported estimate or change (INCREASED means more events on an event-risk outcome, longer survival on a survival time); be… |
| CriterionDirection | D10 | DecisionCriterion | how a ranking criterion orders options (HIGHER_IS_BETTER, LOWER_IS_BETTER, WITHIN_RANGE, NOT_ORDERED); 'better' is relative to a versioned… |
| EndpointStatement | D13 | Event.primaryEndpointStatement | what the source STATES about a readout's primary endpoint; a capture of the sponsor's statement, never BellLabs' judgment |

- **harmChannels**: targets, safety, events, reports, evidence, claims
- **forbidden** (5): a goodFor / benefits / risks / safe / helpsSleep field, tag or enum on a Product, Compound, Food, Intervention, Protocol or Device, a typed edge from a means to a Target; targetKeys on any means type, a confidence or effect-size number on an edge between a means and a Target (directive 3.6), deriving WORSENS from a contraindication or interaction (those are their own D5 safety assertions), a brea…
- **questionPolarity**: values, rows, totals, byPacket, note
- **sdlEnums**: EffectDirection, Polarity, SpeechAct, PopulationGroup, EstimateDirection, CriterionDirection, EndpointStatement, ConstraintLevel
- **openItems** (2): 1. D8 QualityResult.statedVerdict (CONFORMS / DOES_NOT_CONFORM) is a source-printed verdict on a record row; whether directive 3.2 allows it is an owner decision (packets/D8/11-open-questions.md OQ-D8-14)., 2. Qualifier key for the measure a direction refers to: vocab-targets polarityRule writes `outcome:<uid>`, the final D5 register lists `outcomeUid`; the predicate registry (final/vocabularies/…
