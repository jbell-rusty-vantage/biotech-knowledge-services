---
id: "enum:OrganizationEntityKind"
kind: "enum"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L135-L145"]
aliases: ["organization entity kind"]
capabilities: ["get"]
cardDigest: "sha256:4a1e0b5607d499c6aae50ca14787f5aa4aab4536e73545f1982647ab12a7bc33"
---
# Enum OrganizationEntityKind

What kind of organizational record this is. Replaces the pinned LegalEntity type (LEGAL_ENTITY) and the CORPORATE_GROUP / fund-vehicle distinctions the ownership questions need.

Id `enum:OrganizationEntityKind` · module [D7](../modules/D7.md) · 5 values · used by 1 fields · raw SDL [sdl:OrganizationEntityKind](../sdl/OrganizationEntityKind.graphql)

## Values (5)

| value | description |
| --- | --- |
| `LEGAL_ENTITY` | One legal person registered in a jurisdiction (corporation, LLC, limited company, P.A., trust, fund LP). |
| `CORPORATE_GROUP` | A group named collectively by a source ('EdenRoc Sciences companies', 'Entities affiliated with Andreessen Horowitz'); never pushed to its members. |
| `DIVISION_OR_UNIT` | A business unit, lab, division or programme office without separate legal personality. |
| `PUBLIC_BODY` | A government or intergovernmental body (regulator, funder agency). |
| `UNSPECIFIED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Organization](../nodes/Organization.md).`entityKind`
