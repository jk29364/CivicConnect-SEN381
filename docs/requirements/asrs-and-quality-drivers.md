# Section 3 - ASRs and Quality Drivers
## Architecturally Significant Requirements (ASRs)
Reviewing the Milestone 1 Baseline, four requirements materially influence CivicConnect's architecture, data, and technology direction. These requirements are selected because it constrains a design decision, not merely because it is important in general.

### ASR-1: NFR-001 - Authenticated access to personal/unit data
**Source:** Security constraint, tied to the resident and staff access conflict identified in Stakeholder Analysis (M1).
**Why architecturally significant:** This forces an early architectural commitment to identity management and role-based access control as a cross-cutting concern, not an afterthought bolted onto the individual endpoints. It directly constrains the Technology Stack decision (§5.5); any candidate stack must have mature, well-supported authentication tooling. The API/Integration decision (§5.7), since every endpoint touching request data must enforce this boundary.
**Measurable expectation:** Unauthenticated requests to any endpoint exposing resident/unit data return a 401/403 response, verified by automated integration test.

### ASR-2: NFR-004 — Status history never silently overwritten
**Source:** Accountability need; tied to Wonderpark Estates' body-corporate audit requirement (mentioned in Milestone 1 Problem Statement)
**Why architecturally significant:** This is the sinle requirement driving the entire Data and Persistence Baseline decision (§5.4) - it rules out any design where a status update simply overwrites a field, and requires either an append-only history table or event-sourcing-style logging. It also justifies the transactional/OCC approach recommended in Assignment 2's Task 2 (Researching Persistence and Data-Integrity Decisions), since a partial write would violate this NFR directly
**Measurable expectation:** A request's full status history remains queryable and unaltered after any subsequent status change.

### ASR-3: FR-011 / NFR-002 — Severity-based visual prioritisation
**Source:** The resolved stakeholder conflict (residents want instant resolution vs. managing agent must prioritise safety-critical issues), which is now consolidated per §4.1's baseline review.
**Why architecturally significant:** This drives a concrete design decision; the Observer pattern for notification/dashboard/audit-log decoupling, per Assignment 2's Task 1 (Establishing the Design Problem) and has UI/data implications - severity must be a first-class, queryable field, not a derived one, so it can be filtered and visually distinguished in the staf queue.
**Measurable expectation:** High-severity requests are visually distinguished in the staff queue and correctly filterable.

### ASR-4: NFR-005 — List-view load performance
**Source:** Quality constraint, currently privisional per §4.1.
**Why architecturally significant:** Even provisionally, this drives a preference toward efficient query patterns for the request-list view (e.g. avoiding query problems, appropriate indexing on status/severity/category) and will factor into the Technology Stack comparison (§5.5) once a concrete target is set against the chosen hosting platform.
**Measurable expectation:** Currently indicative (list view loads within 3 seconds under normal load); to be confirmed against the actual selected platform in §5.5, at which point this ASRs expectation becomes final.