# Milestone 1 Baseline Review and Controlled Evolution
In this section, the approved Milestone 1 baseline is reviewed before Milestone decisions are added, identifying material clarifications, changed assumptions, and items Milestone 1 deliberately deferred for Milestone 2 evidence.

## Functional and non-functional requirements
### 1. FR-011 & NFR-002 - resolved overlap
Milestone 1's RTM review identified that FR-011 (the severity flag mechanic) and NFR-002 (High-severity requests visibly distinguished) described closely related territory. For Milestone 2, here is the formal resolve: **NFR-002 is retained as the quality rationale** (indicating why safety-critical visibility matters, which is tied to the original stakeholder conflict), and **FR-011 remains the sole carrier of the testable acceptance criteria** (the actual flagging mechanic). NFR-002 is updated to reference FR-011's AC rather than duplicating it. This is not a scope change - it is a traceability clarification, and both requirement IDs are preserved.

### 2. FR-002 - tightened status-transition definition
Milestone 1 baselined FR-002 as "staff shall update request status through defined transitions" with the transition sequence (New -> Assigned -> In Progress -> Resolved -> Closed) stated narratively. For Milestone 2, ahead of implementing the Observer-based notification design (indicated in Assignment 2, the Design Problem 1), we formalise this as an explicit state-transition rule set - naming which transitions are valid and which are not (e.g. a "Closed" status cannot transition back to "New"). This clarification is required before the Factory/Observer design and the data/persistence transactional boundary can be implemented correctly. **FR-002's wording and ID remain unchanged; this is an implementation-level clarification, not a scope change.**

### 3. NFR-005 - deferred, remains provisional
Milestone 1 explicitly flagged NFR-005 (the 3-second list view load) as "indicative - refine once hosting is chosen". This remains open pending the Technology Stack decision (§5.5), where it will be confirmed or adjusted againsr the actual chosen platform's realistic performance characteristice, and logged as a formal decision at that point.

### 4. NFR-006 (Forward Engineering Consideration) - Milestone 2 verification due
Milestone 1 marked NFR-006 (single-complex-entity data association) acceptance criteria as "N/A - architectural constraint, verified at Milestone 2 design review", per Milestone 1's own RTM rule. This verification is satisfied in the Data & Persistence Baseline section (§5.4), where the actual data model is shown to enforce this association.

### 5. No other baselined requirement, scope item, or defended exclusion changes
The 11 FRs, 6 NFRs, and both Milestone 1 scope exclusions (levy/payment, multi-tenancy) remain as baselined. No new evidence has emerged that justifies revisiting them at this stage. 