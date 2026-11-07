---
id: "union:ContentSponsor"
kind: "union"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D9.graphql#L157-L157"]
aliases: ["content sponsor"]
capabilities: ["get","neighbors"]
cardDigest: "sha256:82fff767080dd1700a1ff84b4517fee010278250cc4c4e4c6d2f8fa87049bacc"
---
# Union ContentSponsor

Who sponsors a work: the legal organization when the read or note names it, else the brand it names ('AG1', 'LMNT').

Id `union:ContentSponsor` · module [D9](../modules/D9.md) · 2 members · raw SDL [sdl:ContentSponsor](../sdl/ContentSponsor.graphql)

## Members

- [Organization](../nodes/Organization.md) — Purpose: an organized body as an enduring identity — company, legal entity, corporate group, fund vehicle, university,…
- [Brand](../nodes/Brand.md) — Purpose: a name under which products, services, clinics or media are presented ('Tru Niagen', 'InsideTracker', a clinic…

## Used by

- [MediaWork](../nodes/MediaWork.md).`sponsors`
