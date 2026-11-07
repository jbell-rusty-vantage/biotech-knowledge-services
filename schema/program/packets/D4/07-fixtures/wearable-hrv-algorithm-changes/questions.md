# Fixture wearable-hrv-algorithm-changes - questions answered

Kind: other (version-as-of and definition change; the harm angle is a silent trend break).

| question | expected answer from this fixture | rests on |
| --- | --- | --- |
| CQ-DX-09 | WHOOP heart rate on date D: before 2026-02-25 -> earlier state (unknown); 2026-02-25 to 2026-07-06 -> `whoop-heart-rate-change-2026-02-25`; from 2026-07-06 -> `whoop-heart-rate-change-2026-07-06` (both CHANGE_EVENT_UNLABELED: no version label). Dates are WHOOP's; the attachment to the WHOOP MG model is a curator inference (WHOOP names no hardware). Firmware 50.30.3.0 on WHOOP MG on or before May 20, 2025 is known only from a forum post (asserter = forum member). | f01, f02, f03; w1-feb-date, w2-jul-date, c1-firmware, c2-post-date |
| Q-D4-23 | Split any WHOOP heart-rate/Strain trend at 2026-02-25 and 2026-07-06; WHOOP says Strain may shift after the July change; no action or label is shown to the user. | f01, f02, f10; w3-strain, w4-automatic |
| Q-D4-07 | "HRV": WHOOP hrv_rmssd_milli = RMSSD in milliseconds (WHOOP OpenAPI description); Apple heartRateVariabilitySDNN = SDNN (ms); Oura average_hrv = average HRV during sleep, method/unit not stated -> RMSSD vs SDNN **NOT_COMPARABLE**; Oura vs either **UNKNOWN**. | s01, s02; f06, f07, f08; wa-openapi-rmssd, a1-sdnn |
| CQ-DX-02 | All four values are device outputs of AlgorithmVersions (OUTPUTS_METRIC), never lab-measured; Oura reports the version of its "Sleep Staging Algorithms" per record (v1 = OSSA 1.0, v2 = latest; that it also produces average_hrv is a curator inference), WHOOP's API endpoint is unversioned. | f04-f08; o2-version-field, o3-v1, o4-v2, o5-staging |
| Q-D4-17 | For a sleep/recovery target, the HRV metrics reachable from devices are three different Metrics; a target operationalized by "HRV" must name which one. | s01, s02 |
