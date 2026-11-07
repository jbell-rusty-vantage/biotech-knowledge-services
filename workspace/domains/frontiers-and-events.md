---
id: "dom:frontiers-and-events"
kind: "domain"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/domains.yaml#frontiers-and-events"]
aliases: ["frontiers-and-events","frontiers and events"]
capabilities: ["get","slice"]
cardDigest: "sha256:fbddc2fb8c0d26f1e1ee63893ea5a870322f2f2a1e237cd9bf2b645c2158ecfb"
---
# Domain: Frontiers, breakthroughs and events

Id `dom:frontiers-and-events` · modules [D13](../modules/D13.md) · 2 node types · 2 internal relationship types · seams to 3 other domains.

Events (trial readouts, approvals, recalls, funding, retractions) with their own clocks, and the research frontiers they move; leads-to and responds-to chains gated by a SUPPORT adjudication.

## Questions this domain answers

- What happened on frontier F, in order, and which events led to or responded to which (LEADS_TO, RESPONDS_TO)?
- Who was involved in this event, in which role (INVOLVES), and which regulatory record documents it?

## Write guidance

No breakthrough or hype flag on an Event or Frontier; judgments are Assessments. Causal edges between events are projected only after a SUPPORT adjudication.

## Start with these types

- [Event](../nodes/Event.md) — Purpose: one dated public occurrence in biotech that investors, researchers and agents order into timelines and chains: a trial start, a readout, a r…
- [Frontier](../nodes/Frontier.md) — Purpose: one curated research or therapeutic frontier — a field-level goal the community and investors track and that is not yet reliably achieved in…

## Node types (2)

| type | module | uid token | summary |
| --- | --- | --- | --- |
| [Event](../nodes/Event.md) | D13 | `hu:event:` | Purpose: one dated public occurrence in biotech that investors, researchers and agents order into timelines and chains: a trial start, a re… |
| [Frontier](../nodes/Frontier.md) | D13 | `hu:frontier:` | Purpose: one curated research or therapeutic frontier — a field-level goal the community and investors track and that is not yet reliably a… |

## Relationship types inside the domain (2)

| type | class | temporal | endpoints |
| --- | --- | --- | --- |
| [LEADS_TO](../relationships/LEADS_TO.md) | asserted | recorded-only | Event → Event |
| [RESPONDS_TO](../relationships/RESPONDS_TO.md) | asserted | recorded-only | Event → Event |

## Seams to other domains

### → [actors-and-institutions](actors-and-institutions.md) (1)

- [INVOLVES](../relationships/INVOLVES.md) · asserted · Event → Organization|Person

### → [manufacturing-quality-regulatory-ip](manufacturing-quality-regulatory-ip.md) (1)

- [DOCUMENTED_BY_RECORD](../relationships/DOCUMENTED_BY_RECORD.md) · asserted · Event → RegulatoryRecord

### → [studies-and-evidence](studies-and-evidence.md) (1)

- [ON_FRONTIER](../relationships/ON_FRONTIER.md) · asserted · Event|Study → Frontier

## Tasks

(none)

## v1 navigation aliases

(none)
