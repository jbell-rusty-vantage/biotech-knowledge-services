---
id: "enum:TextBasis"
kind: "enum"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D9.graphql#L117-L128"]
aliases: ["text basis"]
capabilities: ["get"]
cardDigest: "sha256:5e1673339520310b7f9509e3e4c546accce9de48f6ede42524473d7cc4c90278"
---
# Enum TextBasis

Where the text of a chunk came from; decides how far a quote from it can be trusted before verification.

Id `enum:TextBasis` · module [D9](../modules/D9.md) · 10 values · used by 1 fields · raw SDL [sdl:TextBasis](../sdl/TextBasis.graphql)

## Values (10)

| value | description |
| --- | --- |
| `PUBLISHER_TRANSCRIPT` |  |
| `PUBLISHER_CAPTIONS` |  |
| `AUTO_CAPTIONS` |  |
| `ASR` |  |
| `OCR` |  |
| `HTML_EXTRACT` |  |
| `PDF_TEXT_LAYER` |  |
| `JATS_XML` |  |
| `API_TEXT` |  |
| `MANUAL` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Chunk](../nodes/Chunk.md).`textBasis`
