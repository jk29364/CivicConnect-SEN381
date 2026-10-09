# Section 3 - ASRs and Quality Drivers
## Architecturally Significant Requirements (ASRs) - Rebalanced
Reviewing the Milestone 1 Baseline, and a revision note for the PED, which supersedes Milestone 2's v2.0 of the following ASR set. Four requirements materially influence CivicConnect's architecture, data, and technology direction. These requirements are selected because it constrains a design decision, not merely because it is important in general.
The four ASRs transition to five, with reviewing FR-002 and FR-006. 

### ASR-1: NFR-001 - Authenticated access to personal/unit data and Role Boundaries
**Source:** Security constraint, tied to the resident and staff access conflict identified in Stakeholder Analysis (M1).

**Why architecturally significant:** This forces an early architectural commitment to identity management and role-based access control as a cross-cutting concern, not an afterthought bolted onto the individual endpoints. It directly constrains the Technology Stack decision (§5.5); any candidate stack must have mature, well-supported authentication tooling. The API/Integration decision (§5.7), since every endpoint touching request data must enforce this boundary.

**Measurable expectation:** Unauthenticated requests to any endpoint exposing resident/unit data return a 401/403 response, verified by automated integration test.

**Architectural consequence:** Centralised authentication middleware at the API layer, single source of truth for identity rather than per-endpoint checks.

### ASR-2: FR-002 & NFR-004 - Status Transition Integrity
**Source:** Accountability need; tied to Wonderpark Estates' body-corporate audit requirement (mentioned in Milestone 1 Problem Statement)

**Why architecturally significant:** This is the single requirement driving the entire Data and Persistence Baseline decision (§5.4) - it rules out any design where a status update simply overwrites a field, and requires either an append-only history table or event-sourcing-style logging. Only valid transactions must be permitted (e.g. Closed state cannot revert back to New), showing that transition-validation logic must be centralised and enforces consistently. It also justifies the transactional/OCC approach recommended in Assignment 2's Task 2 (Researching Persistence and Data-Integrity Decisions), since a partial write would violate this NFR directly

**Measurable expectation:** A request's full status history remains queryable and unaltered after any subsequent status change.

**Architectural consequence:** The Service Layer owns transition-rule validation; Persistence Layer wraps status update and audit append in a single ACID transaction

### ASR-3: FR-011 & NFR-002 - Severity-based visual prioritisation
**Source:** The resolved stakeholder conflict (residents want instant resolution vs. managing agent must prioritise safety-critical issues), which is now consolidated per §4.1's baseline review.

**Why architecturally significant:** The severity flag mechanic (FR-011) drives a concrete design decision (default severity assignment, category-specific rules); the Observer pattern for notification/dashboard/audit-log decoupling, per Assignment 2's Task 1 (Establishing the Design Problem) and has UI/data implications - severity must be a first-class, queryable field, not a derived one, so it can be filtered and visually distinguished in the staff queue.

**Measurable expectation:** High-severity requests are visually distinguished in the staff queue and correctly filterable.

### ASR-4: FR-005 & NFR-005 — Query/Filter Performance at Scale
**Source:** FR-005 (staff searching/filtering/sorting requests by category, severity, status, date, or asignee) and NFR-005 (list loads within 3 seconds, indicative pending hosting decision.)

**Why architecturally significant:** FR-005 is the functional capability that demands indexing and query-planning decisions, where NFR-005 alone states a performance target. FR-005's filtering and sorting requirement determines which fields need indexes (status, severity, category, assignee) and shapes the persistence query design.

**Measurable expectation:** Index strategy on status/severity/category/assignee fields. Currently indicative (list view loads within 3 seconds under normal load); to be confirmed against the actual selected platform in §5.5, at which point this ASRs expectation becomes final.

### ASR-5: FR-006 - Concurrent Request Ownership
**Source:** FR-006 (staff assigns or accepts ownership of a request) deals with a real concurrency problem - if two staff members choose to accept the same uassigned request simultaneously, the system must resolve this deterministically rather than allowing both to succeed.

**Why architecturally significant:** This requires an explicit concurrency-control mechanism at the persistence boundary, independent of the audit history concern mentioned in ASR-2; this justifies extending the optimistic concurrency control approach to cover the request-assignment specifically.

**Measurable expectation:** The operations used in the OOC version check mechanism as status transitions will be implemented once in the Persistence Layer and will be reused. This is essential with centralising the logic in a layered monolith, rather than duplicating it across services.