---
id: "vocab:targets"
kind: "vocabulary"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/targets.yaml"]
aliases: ["targets","targets"]
capabilities: ["get"]
cardDigest: "sha256:2aefdd1c66876c827a6da39511d8ec9ff33d71d82b2aca49a92f0353bb074f42"
---
# Vocabulary targets

Release vocabulary `vocabularies/targets.yaml` (sha256 `02de43f1a6b5473d…`).

- **version**: 0.2.2
- **status**: review-stage
- **published**: 2026-10-08
- **changes** (8): 0.2.2: targetKeys exception now names every non-means record that carries target keys as a captured or curated property: D5 ProtocolStep (captured purpose), D13 Frontier (curated frontier-to-goal mapping) and D10 DecisionCriterion (the goals a versioned criteria set serves); still forbidden on any means. Target vs D2 Outcome disambiguated (a Target is what a person pursues; an Outcome is a study…
- **owner**: D5
- **agent**: A5
- **consumers** (12): K, D1, D2, D3, D4, D6, D7, D8, D9, D10, D12, D13
- **node**: type, labels, uidPattern, idPattern, identityKeys, properties, disambiguation, measuresSeam, sdl

### targets (15)

| id | label | definition | includes |
| --- | --- | --- | --- |
| target:longevity | Longevity | Living longer and staying healthy for longer: lifespan, healthspan, and slowing the biological processes of aging, as people pursuing longe… | lifespan, healthspan, biological aging rate, frailty avoidance, all-cause mortality risk |
| target:sleep | Sleep | Getting enough, timely, uninterrupted and restorative sleep. | sleep duration, sleep onset latency, sleep continuity, sleep quality, circadian timing, daytime sleepiness |
| target:brain-fitness | Brain fitness | Cognitive performance and its preservation: attention and focus, memory, processing speed, executive function, and resistance to cognitive… | focus, attention, memory, processing speed, executive function, cognitive decline prevention |
| target:mood | Mood and stress | Emotional well-being: positive mood, low anxiety, stress resilience. | mood, anxiety, stress, emotional resilience, well-being |
| target:energy | Energy | Subjective energy and vitality across the day; absence of fatigue. | fatigue, vitality, alertness, daytime energy |
| target:strength | Strength | Muscular strength and power and the physical function they support. | maximal strength, power, grip strength, physical function, mobility |
| target:endurance | Endurance | Cardiorespiratory fitness and the capacity to sustain aerobic work. | VO2max, aerobic capacity, exercise tolerance, endurance performance |
| target:recovery | Recovery | How well the body restores between loads (training, stress, illness): readiness to perform, soreness, autonomic balance. | training recovery, readiness, muscle soreness, autonomic recovery |
| target:body-composition | Body composition | The proportion and distribution of fat, lean mass and bone; includes weight management. | body fat, visceral fat, lean mass, body weight, waist circumference |
| target:fat-loss | Fat loss | Reducing body fat, including visceral fat, and keeping it off. | weight loss, fat mass reduction, visceral fat reduction, weight maintenance |
| target:muscle-mass | Muscle mass | Building or preserving skeletal muscle mass. | hypertrophy, lean mass gain, lean mass preservation with age or weight loss |
| target:cardiometabolic-health | Cardiometabolic health | Healthy blood glucose, lipids, blood pressure and vascular function; lower cardiometabolic risk. | glucose regulation, insulin sensitivity, blood lipids, blood pressure, vascular health |
| target:glycemic-control | Glycemic control | Stable, healthy blood glucose and insulin sensitivity. | fasting glucose, postprandial glucose, glycemic variability, insulin sensitivity |
| target:gut-health | Gut health | Comfortable, regular digestion and a healthy gut environment. | digestive comfort, bowel regularity, bloating, gut microbiome composition |
| target:immune-function | Immune function | Resistance to and recovery from infection; appropriate (not excessive) inflammation. | infection frequency and duration, vaccine response, chronic low-grade inflammation |


### deferredTargets (6)

| id | reason |
| --- | --- |
| target:skin-and-hair | frequent in product marketing (Examine 'Skin, Hair, & Nails'); no essential question yet; product claims can use D6 claim text until promot… |
| target:sexual-and-hormonal-health | community demand (testosterone, libido); medicalisation risk; add with a question id and a population rule |
| target:joint-and-bone-health | Examine 'Joints & Bones'; currently reachable via target:strength and Conditions (osteoporosis) |
| target:pain | PROMIS core domain, but pain relief is mostly a Condition/symptom question, not a biohacking target |
| target:focus | kept inside target:brain-fitness via synonyms; split only if questions separate focus from memory |
| target:biological-aging | kept inside target:longevity; clocks are measures (D4), not a separate goal |

- **polarityRule**: statement, predicates, qualifierSyntax, polarityField, assessmentDirection, requiredQualifiers, notAllowed
- **queryPattern**: id, answerKind, cypher, provenanceTrace, asOf, protocolBranch, studyBranch, variants, indexes
- **seamRule**: chosen, rule, exception, why, rejected, consumerObligations
- **citations**: see _notes/vocab-targets-notes.md section 5
- **synthesis**: publishedAs, source, rulings, targetKeysHolders, sdl, sdlEnums, counts, checks
