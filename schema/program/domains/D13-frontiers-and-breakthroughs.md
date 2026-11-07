# D13 — Frontiers, breakthroughs and events

Lens: economics and community (the investor lens). Current coverage: `Event`, `NarrativeArc`, `EventImpactAssessment`, `Conference`, `Community` in W18 (5 node types). Added 2026-10-08 on the owner's direction: we track breakthroughs in biotech, as events and the relationships between them, possibly modeled as literal frontier domains such as "curing X type of cancer".

## Scope

What is happening and what it means: dated public events (readouts, approvals, launches, financings, recalls, retractions, conference announcements, regulatory decisions), the relationships between events (leads to, follows, responds to, contradicts), and curated **frontiers**: research or therapeutic goals the field is pursuing ("senolytics in humans", "partial epigenetic reprogramming", "curing pancreatic cancer", "GLP-1 beyond obesity") that events, studies, organizations, compounds and claims attach to, with milestones. Breakthrough tracking for investors and researchers; the frontier vocabulary is the field-level counterpart of the person-level targets (D5). Out of scope: the media that report the events (D9), the organizations themselves (D7), the trial details (D3).

## Ecosystem to survey

How biotech news and milestones are produced and consumed: press releases and 8-K filings, FDA calendars (PDUFA dates), conference readouts (ASCO, AACR, ARDD), financing announcements, investor newsletters and trackers (Endpoints, STAT, Fierce, BioPharma Dive, Longevity.Technology), roadmaps published by foundations and companies, how "breakthrough" is defined (FDA Breakthrough Therapy designation versus press usage), how analysts build timelines, prediction markets and expert forecasts on milestones.

## Seed questions

- What happened in frontier F in the last 90 days, in what order, and which events caused or followed which?
- Which organizations, compounds and studies are active on frontier F, and what is each one's latest milestone?
- Which events were breakthroughs by a stated definition (designation, first-in-human, first approval) rather than by press language?
- What is the timeline from first readout to approval for compound X, and which events moved its valuation (seam D7)?
- Which claims about a frontier circulated before and after an event (seam D9), and which were contradicted by it?
- Which frontiers does a given target (D5) depend on ("brain fitness" ↔ "neuroinflammation modulation")?

## Retrieval patterns to consider

Event chains with typed relations and as-of validity; frontier-centric subgraphs (everything attached to F, ordered by time); GDS: temporal centrality of events, community detection over co-attachment to frontiers, path finding from event to event; narrative arcs as assessments that select and order events (never as facts).

## Sources and tools to score (with D11)

SEC EDGAR (8-K, press releases), FDA calendars and approval databases, ClinicalTrials.gov status changes (MCP), conference abstract portals, company newsrooms (Firecrawl change tracking), news APIs (Tavily news), Crossref event data, Wikidata for stable frontier identifiers.

## Known problems and open questions

Event clocks must come from named assertions (the proposal's rule); `CAUSED_BY` only from a basisKind assertion; whether frontier is a node vocabulary or a tag; granularity of frontiers (a disease, a mechanism, a modality); how a "breakthrough" judgment is an assessment, not a property.

## Deliverables

`../packets/D13/` per the packet contract, including `vocab-frontiers.yaml` (published early, Wave 0) with 20–40 curated frontiers, definitions, and attachment rules; fixtures: one readout → approval → launch chain, one financing following a result, one retraction contradicting prior claims.
