---
id: "union:StudyParty"
kind: "union"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L404-L404"]
aliases: ["study party"]
capabilities: ["get","neighbors"]
cardDigest: "sha256:aaa8ee5816ec50498ff28da0b960d6a5f4052dd2451d74f638d7fc2db00331df"
---
# Union StudyParty

Who or what holds a role toward a study: a D7 Organization, a D7 Person (sponsor-investigator: NCT04313634 lead sponsor 'Sundeep Khosla, M.D.'; investigators) or a D7 Award (FUNDING_AWARD).

Id `union:StudyParty` · module [D3](../modules/D3.md) · 3 members · raw SDL [sdl:StudyParty](../sdl/StudyParty.graphql)

## Members

- [Organization](../nodes/Organization.md) — Purpose: an organized body as an enduring identity — company, legal entity, corporate group, fund vehicle, university,…
- [Person](../nodes/Person.md) — Purpose: a natural person who is a public actor in sourced material — officer, director, founder, investor, author, inv…
- [Award](../nodes/Award.md) — Purpose: one funding award — grant, contract, sponsored research agreement, prize, in-kind award — as the join point be…

## Used by

- [Study](../nodes/Study.md).`roles`
