# Final Product and Project Closure

## Final submission information

| Field | Record |
| :--- | :--- |
| Project | CivicConnect for Wonderpark Estates |
| Team | Full Course Meal in the Back of the Class |
| Members | Karabo Masoka (601644); Jimmy Junior Baloyi (601713); Johni Kruger (601710) |
| PED | v4.0 Final, continuing the existing PED v3.0 |
| Repository | https://github.com/jk29364/CivicConnect-SEN381 |
| Reviewed backend revision | `93ce4a82a196411ed25b613924c35d32c0cc8619` |
| Final assessed revision | **[TEAM CONFIRM: enter the frozen commit after frontend integration and documentation review; the reviewed backend revision is not automatically the final release]** |
| Demonstration | Local demonstration; request creation witnessed by Johni during a teammate walkthrough; staff queue and detail screenshots supplied; ticket journey reported working by Johni |
| Production release position | No-go recommended for the inspected baseline; local demonstration only |
| Final RTM | Existing Requirements Traceability Matrix in this PED, continued with the implementation and acceptance updates below |
| Submission date | **[TEAM CONFIRM: actual date submitted]** |

This closure continues the existing engineering record. Earlier requirements, design decisions and execution records retain their historical meaning. The following acceptance assessment continues the inspected backend baseline and incorporates the team report that the ticket-journey frontend is being merged. Johni subsequently witnessed request creation during a teammate call, supplied matching staff-queue and detail screenshots, and reported the ticket journey fully working. This is team-reported acceptance evidence, not an assistant-executed browser or database test. Final evidence must be associated with the merged revision.

## Product outcome and stakeholder value

CivicConnect provides an implemented backend for category-specific request creation, unique references, authenticated request access, filtered retrieval, controlled status changes and status-history retrieval. The RequestFactory validates common and category-specific fields. The service layer scopes records to the authenticated user's complex and restricts resident queries to their own requests. Status updates use a database transaction, a version check and an audit-history observer.

These capabilities address the original need for a controlled record of estate service requests and accountable status changes. The inspected implementation does not yet establish full delivery of the original stakeholder commitment: assignment, authored comments, resident notifications and management reporting remain incomplete in this checkout. User-facing acceptance also depends on the integrated frontend. No stakeholder sign-off is claimed by this closure.

## M1 scope to final delivery and RTM continuation

Retain the original RTM's stakeholder, priority, requirement, acceptance-criterion and design columns. Use the following entries to update its implementation, verification and outcome fields; do not create a replacement baseline. Statuses distinguish implementation from acceptance. The creation criterion is updated using the team-witnessed walkthrough and supplied screenshots. Other partial scores remain where the specific criterion has not been demonstrated: a report that the ticket journey works does not establish every security, reporting or performance criterion.

Evidence references E1 to E11 are defined in the evidence index. The original baseline uses High/Medium/Low priorities; these are retained rather than retrospectively relabelled as Must/Should.

| ID and priority | Delivery status at review | Acceptance status and score | Implementation and evidence | Remaining limitation or consequence |
| :--- | :--- | :--- | :--- | :--- |
| FR-001 High | IMPLEMENTED; creation walkthrough witnessed by team representative | Met, 1.0 on team-reported acceptance | Johni witnessed the teammate create the request during a call. E11 shows the matching request in staff queue and detail with New status, Common Area category, Park location, description, Medium severity and reference. Defaults/validation supported by E2/E3. | Acceptance source is the team walkthrough and screenshots; no independent live DB test or authenticated identity check is inferred. Record the final merged revision. |
| FR-002 High | IMPLEMENTED status/audit backend; staff status UI demonstrated | Partially met, 0.5 | E11 shows the status selector and Update control. E2/E4 support transition and audit logic; Johni reports the ticket journey working. | Screenshot remains New and says No status changes yet. Retain partial credit until an actual saved transition and timestamp/actor history are recorded; assigned-owner precondition remains dependent on FR-006. |
| FR-003 High | IMPLEMENTED retrieval backend; detail/history area demonstrated in staff view | Partially met, 0.5 | E11 shows a request detail and empty History area; E1/E2 support resident-scoped retrieval. | Staff view does not establish resident My Requests, own-record isolation or chronological history after changes. Confirm those separately. |
| FR-004 Medium | NOT IMPLEMENTED | Not met, 0.0 | Notification observer is a future integration point; E5 | Viewing refreshed history is not the committed in-app notification on change or next login. |
| FR-005 High | IMPLEMENTED query backend; staff queue and search/status controls demonstrated | Partially met, 0.5 | E11 shows staff queue containing the same request, a search field and All statuses selector; E2 covers query logic. | Capture an applied filter and matching results before claiming the filter acceptance criterion passed. Sorting and other required filters are not demonstrated by the screenshot. |
| FR-006 High | NOT IMPLEMENTED | Not met, 0.0 | `assigned_to` field exists, but no assignment operation is exposed; E1, E6 | Staff cannot yet accept ownership through the implemented API. Status OCC is not evidence of assignment concurrency protection. |
| FR-007 Medium | NOT IMPLEMENTED | Not met, 0.0 | No comment/action-note API or storage is present; E1, E6 | Staff action notes cannot be appended with author and timestamp. |
| FR-008 High | NOT IMPLEMENTED | Not met, 0.0 | Dashboard observer is a placeholder; E5 | Date-range open/overdue/resolved/closed totals are not implemented. No overdue rule is established by this code. |
| FR-009 Medium | NOT IMPLEMENTED | Not met, 0.0 | Filtering exists; grouped presentation and counts are not evidenced; E1, E2 | Frontend grouping must use a complete result set; filtering alone does not satisfy grouping with counts. |
| FR-010 High | IMPLEMENTED; generated reference visible in combined UI | Met, 1.0 | Same generated reference appears in both E11 screenshots. Creation logic and uniqueness constraint supported by E1/E2/E6. | Screenshots support reference display and consistency, not a separate live collision test. |
| FR-011 High | IMPLEMENTED severity creation backend; Medium value displayed in queue/detail | Partially met, 0.5 | E11 shows Medium on the created request; E2/E3 support severity validation/defaults. | High highlighting and any editing behaviour remain unobserved; Medium display alone does not satisfy the visual High criterion. |
| NFR-001 High | IMPLEMENTED JWT/role/scoping backend; client identity integration pending confirmation | Acceptance confirmation pending; retained score 0.5 | JWT verification, role checks and service scoping; E1, E2 | Confirm how the merged client obtains valid identity and redirects unauthenticated direct navigation to login. A mock role selector is not a completed authentication flow. |
| NFR-002 High | Severity data implemented; frontend visual criterion pending confirmation | Acceptance confirmation pending; retained score 0.0 | Stored severity; E2, E3; incoming staff queue not inspected | If the merged staff queue visibly distinguishes High from routine requests, record the observation and mark Met, 1.0. Resolve overlap only through the approved baseline. |
| NFR-003 Medium | NOT IMPLEMENTED as a verified usability outcome | Not met, 0.0 | No representative-user timing record located in inspected evidence | A first-time-user submission under three minutes remains unverified. |
| NFR-004 High | IMPLEMENTED transactional audit backend; integrated history display merge in progress | Acceptance confirmation pending; retained score 0.5 | Transactional audit insertion and rollback unit cases; E2, E4; incoming history UI reported by team | Confirm successive updates preserve earlier status/timestamps in the actual database and visible history. A screen alone does not establish atomicity or stale-update protection. |
| NFR-005 Low | PARTIALLY IMPLEMENTED at API level | Not met as evidenced browser criterion, 0.0 | Historical API load result: 2377.07 ms average; E7 | API average latency does not prove a list page renders within three seconds. Record authenticated successful responses and browser timing. |

NFR-006 is retained as a forward-engineering/data-design concern. Both user and request records carry `complex_id`, and the service scopes queries by it. The schema does not define a complex table or a foreign key for that column, despite stronger wording in parts of the PED. Record this design variance explicitly. Do not claim implemented multi-tenancy or count deferred multi-estate delivery as failed committed functionality.

### Quantified scope completion

The calculation rule is: Met = 1.0; Partially Met = 0.5; Not Met = 0.0. Approved changes may alter the applicable baseline only with a traceable change reference.

The working inventory above contains 16 acceptance criteria transcribed from the PED's acceptance table: FR-001 to FR-011 and NFR-001 to NFR-005. It includes the overlapping NFR-002 rather than silently removing it. NFR-006 has no separate acceptance criterion in that table and is recorded separately as the documented forward-engineering concern.

Before the reported frontend merge, the backend evidence snapshot contained 1 Met criterion, 7 Partially Met criteria and 8 Not Met criteria: ((1 + 7 × 0.5) / 16) × 100 = 28.125%. This is a historical review snapshot, not the final integrated completion percentage.

**Updated evidence-supported review score: ((2 Met + 6 × 0.5 Partially Met) / 16) × 100 = 31.25%.** FR-001 now receives full credit for the team-witnessed creation walkthrough, alongside FR-010. Eight criteria remain scored Not Met. This is still a provisional evidence inventory, not an assertion that the complete product is only 31.25% functional. Confirm the approved denominator and record any additional demonstrated criteria before the final calculation.

This is an evidence-limited review snapshot, not the final team's delivered percentage. It includes the team-reported creation acceptance and screenshot observations, but excludes credit for other criteria not specifically demonstrated. Before submission, reconcile the inventory with the signed M1 acceptance baseline and any approved clarification of the FR-011/NFR-002 overlap, then update scores from the actual final demonstration. If an approved baseline merges those two criteria, cite that approval and recalculate; do not remove the overlap solely to increase the percentage.

**[TEAM CONFIRM: final applicable criterion count, final scores, calculated percentage and any approved change references.]** If the verified final result remains below the 80% target, retain the result and explain the unmet critical items and stakeholder consequence. Do not report the target as achieved without evidence.

### Deferred and excluded scope

Integrated levy/payment processing, multi-estate management, SLA auto-escalation and resident analytics beyond basic status/history remain outside the documented delivery commitment or deferred as recorded in the original scope. Preserve the original distinction between out-of-scope and future work. Assignment, comments, in-app notifications and management reporting are original commitments; their absence must not be relabelled as an approved deferral without a genuine change decision.

## Final quality and acceptance evidence

On 18 October 2026, `npm test` completed with **42 tests passed, 0 failed, 0 skipped** in the inspected checkout. The suite comprises 9 HTTP tests, 9 controller tests, 14 service tests and 10 Factory tests. HTTP tests exercise Express with a mocked service, controller tests mock the service, and service tests inject a fake database. This demonstrates the tested logic and interface behaviour; it does not prove actual PostgreSQL execution, complete frontend acceptance, load performance or production readiness. See E8 for the recorded result and limitations.

The first run's HTTP tests were blocked by local connection permissions. All nine HTTP tests passed when rerun with local network access. That environment restriction is not recorded as a product defect.

Historical database and performance results remain part of M3 evidence. Their interpretation is constrained by the script weaknesses and evidence corrections below. Relevant critical checks should be confirmed after final integration; M4 introduces no new test-count target.

### Acceptance demonstration record

| Journey | Required observation | Result at documentation review |
| :--- | :--- | :--- |
| Resident submission | Valid identity; category fields; persisted request; New status; reference and confirmation | PASS reported by Johni after witnessing request creation during a teammate call; matching New request appears in staff queue and detail screenshots E11 |
| Resident visibility | Own requests and chronological history; another resident's records denied | Staff detail and empty history area observed in E11; resident-specific view and populated history not evidenced |
| Staff status change | Valid transition; invalid transition rejected; retained timestamp/actor history | Staff status controls observed in E11; saved transition/history not shown; general journey reported working by Johni |
| Concurrent update | Two clients use the same version; stale change rejected; no lost history | Mocked service checks pass; actual database confirmation pending |
| Staff queue | Category/severity/status/date/assignee controls return matching records; High visible | Staff queue/search/status controls observed in E11; applied filtering and High highlighting not shown |

**[TEAM CONFIRM: replace pending results with observed outcomes, date, demonstrator, final revision and evidence location; identify any stakeholder or representative-user feedback actually obtained.]** No stakeholder validation or usability result is inferred from automated tests.

## Final deployment position and operational limits

The intended final demonstration is local, as confirmed by the team representative. A local developer session is not automatically staging or simulated production. Unless a separate controlled environment is demonstrated, describe the access mode as a local evaluation build. If the final submission declares staging, identify the actual release-candidate configuration and database used. No public production deployment is claimed.

For the inspected baseline the recommended decision is **NO-GO for production use**. This recommendation rests on specific evidence: the combined authentication flow has not been established; production database connections disable certificate verification; the integrated critical journey has not been demonstrated against the real database; and committed ownership/reporting capabilities remain incomplete. A public release could expose resident information through incorrect integration, provide incomplete operational information or leave estate requests without a working ownership process. CORS is currently unrestricted; an origin allow-list would support the intended browser boundary but is not a replacement for access control.

| Concern | Affected requirement/risk | Condition before production approval |
| :--- | :--- | :--- |
| Integrated identity and access not demonstrated | NFR-001, R-002, R-006 | Demonstrate compatible token issuance, intended role checks and own-record isolation through the final client. |
| Database server certificate not verified | R-002, deployment security | Configure provider-supported certificate verification and confirm connectivity. |
| Final live transaction/integration evidence incomplete | FR-001/002/003, NFR-004, RSK-M3-02 | Confirm persisted creation, atomic audit history, invalid transition handling and stale-update rejection on the final database. |
| Missing ownership and reporting commitments | FR-006/008/009 | Complete and verify them or obtain a genuine stakeholder-approved release limitation; do not declare them delivered. |

**[TEAM CONFIRM: adopt or revise the final release decision and identify the actual local/staging environment, frontend address and database alias without publishing credentials.]** The recommendation is not presented as an already approved team decision.

The backend starts with `npm start`, reads the assigned `PORT` or defaults to 3000, and requires `DATABASE_URL` and `JWT_SECRET`. Use synthetic demonstration data and keep secrets outside Git. The API health route confirms HTTP responsiveness but does not test database readiness. Startup/error console output exists; an alerting or incident-response service is not implemented.

Rollback of application code requires a known working revision compatible with the current schema. The migration runner has no migration ledger or automatic rollback. Restoring an earlier commit does not undo database changes. Database recovery has not been demonstrated in this review, and no recovery guarantee is claimed. M4 does not require a newly implemented backup platform.

## M3 issues and register closure

The dated updates in `docs/risk/Risk-Register.md` and `docs/risk/risk-defect-and-release-evidence.md.md` continue the existing registers. Historical closed defects remain historical records; the following review does not independently certify their original execution.

| Existing item | Position at review | Consequence |
| :--- | :--- | :--- |
| DEF-M3-01 connection URI parsing | Historically closed; not re-executed here | Preserve URL-encoding guidance; verify the demonstration connection. |
| DEF-M3-02 import failures | Core app imports work in the passing suite; a separate seed import defect remains open | Do not extend the original closure claim to every script. |
| DEF-M3-03 missing driver | `pg` is declared and the suite loads it | Dependency declaration is present; a fresh-install CI run must still support the final release. |
| RSK-M3-01 lost updates | Mitigated in status logic and mocked tests; live confirmation outstanding | Status protection does not establish assignment concurrency. |
| RSK-M3-02 partial audit history | Same-client transaction/audit design and rollback unit case exist | Strengthen live assertions before claiming final persisted atomicity. |
| RSK-M3-03 deployment drift | Migration scripts exist; version tracking/recovery remain incomplete | Treat as reduced through controlled schema files, not eliminated. |
| R-006 frontend/backend integration | Still active during this review | Final integration and evidence must precede full acceptance credit. |

### Technical debt continuation

| Existing debt | Final review disposition | Consequence and future trigger |
| :--- | :--- | :--- |
| TD-1 in-process Observer | Retained | Notification transport is still a placeholder. Complete the committed in-app behaviour first; reconsider durable dispatch when delivery guarantees or another channel are required. |
| TD-2 layer boundaries by convention | Retained | Maintain review discipline; automated boundary checks remain future work. |
| TD-3 single-complex data model | Retained as deliberate scope | Review isolation and schema constraints before any multi-estate expansion. |
| TD-4 deferred construction/integration | Partly repaid | Core API and persistence code exist; assignment, comments, reporting and integrated acceptance remain incomplete in this baseline. |
| TD-5 free-tier hosting assumptions | Unvalidated for final operation | Local demonstration does not validate cloud cold-start, cost or capacity assumptions. Reassess before hosting. |

### Evidence corrections and implementation variances

The following corrections qualify earlier statements without deleting the project history:

- The current dependency is Express `^5.2.1`, rather than the earlier Express 4.21.x selection. Current tests use Node's built-in test runner rather than Jest/Supertest.
- Implemented routes use `/api/requests`; `/api/v1/requests` is a design intention, not an active route prefix.
- PED results reporting successful `/api/auth/login` and `/api/admin/system-settings` calls are not supported by the inspected application. Preserve their historical provenance only if the team can identify the tested revision; exclude them from current acceptance credit until reconciled.
- `src/db/seed.js` currently imports a nonexistent relative configuration path. The claimed seeding result is historical and is not reproducible with that file unchanged.
- `src/db/tc-db.js` uses a dummy actor and accepts any exception for negative tests. An invalid actor can masquerade as a successful stale-update rejection. The script does not assert stored audit rows or rollback state; its pass messages alone do not prove those properties.
- The 2377.07 ms API result is not an observed browser rendering result. Authentication, successful response counts and the tested revision must accompany any reused load evidence.
- The dashboard and resident-notification observers are placeholders, not proof of implemented counts or notifications.
- The active application registers routes directly; `src/routes/request.routes.js` is unused CommonJS code within an ESM project. It is not the authoritative route contract.

## Significant decisions and observed consequences

| Original decision | Original rationale | Observed consequence and evidence | Learning and future decision |
| :--- | :--- | :--- | :--- |
| Layered monolith, ADR-ARCH-001 | Keep deployment and transaction coordination manageable for a three-person team | Factory, service and persistence logic are testable in one process; status/audit updates share one transaction. Integration with the separate frontend still requires a shared contract. | Retain the monolith for current scope. Agree API and identity contracts early; a monolith does not remove client integration work. |
| Factory for category creation, ADR-DP-002 | Centralise construction and category validation | Ten Factory tests pass, including defaults, invalid severity and missing common fields. Factory success alone does not prove reference persistence or visible prioritisation. | Retain it, while tracing acceptance beyond construction to storage and UI. |
| PostgreSQL transactions and Observer, ADR-DATA-001 / ADR-DP-001 | Preserve status history and decouple status-change reactions | The code wraps update and audit insertion together; mocked rollback tests pass. Notification/dashboard observers remain placeholders. | Retain atomic audit insertion. Treat each additional observer as its own delivery obligation, with failure behaviour explicitly reviewed. |
| Separate frontend and backend hosting, ADR-STACK1 | Support team familiarity and a zero-cost staging target | Local demonstration is planned; cloud topology and operational costs have not been validated for the final release. CORS and identity remain integration concerns. | Revisit hosting only after the combined product is stable; record measured compatibility and cost before claiming hosted readiness. |

These are recorded consequences, not retrospective approval of undocumented changes. Link genuine issue/PR/change decisions when finalising the existing decision register. Do not invent lecturer/client change requests or peer-review records.

## Schedule cost and resource conclusion

Frontend integration was still in progress during final documentation preparation. Therefore, the inspected baseline had not yet reached the combined-product acceptance point. The finalisation response is to prioritise integration, critical defects and evidence over optional features. Planned milestone dates, actual completion dates and any approved scope/reprioritisation decisions must be taken from the existing board and repository history; no on-time-delivery claim is made here without that comparison.

The design targets a R0.00 staging budget, and the local demonstration does not require a newly procured hosting service. This is a design constraint, not an audited statement of total spending. No commercial operating-cost estimate or current free-tier entitlement has been verified in this review. A commercial deployment would need to account for compute, database capacity, storage/backups, monitoring, support and maintenance, based on the actual workload and provider quotations. The project does not claim that production operation would be cost-free.

## AI use verification and accountability

Existing AI use and verification declarations are retained in `docs/declarations/` and indexed by `docs/declarations/AI_register`. They are not missing or replaced by this closure. Examples inspected include the signed declaration for branch `58-src-request-endpoints-wired-to-factory-and-persistence` (register item 26), the Factory/CI declaration (item 24), and the risk/deployment declaration (item 25). These declarations record the authors' accountability and state that the associated entries were peer-reviewed and approved. Actual PR approvals remain separate repository evidence and are not inferred from the declaration alone.

The current documentation assistance is recorded as a new dated register entry. Verification consisted of comparing both project briefs, extracting PED v3.0, inspecting the implemented routes, service, schema and scripts, and observing the existing automated test run. These checks found stale route/version descriptions, unsupported current login/admin results and weaknesses in database evidence. Human team review and any new declaration approval remain outstanding for this session; no signature or approval is fabricated.

## Final project conclusion

The inspected CivicConnect baseline demonstrates a functioning and tested core backend for structured service-request capture and accountable status management. The Factory and transactional audit design provide concrete value for consistency and traceability. The evidence also shows that completion of individual components is insufficient to establish a fully accepted estate-management product: ownership, comments, notifications, reporting and the integrated user journey require further completion or explicit final limitation statements.

Johni reports the ticket journey fully working after a teammate walkthrough; request creation and matching queue/detail presentation are supported by the supplied screenshots. This strengthens the integrated local-demo outcome. Remaining acceptance limitations are criterion-specific and are recorded above. The team should report the actual verified scope percentage, unresolved high-priority commitments and final release decision. If the project continues, the first work should complete the original ownership and feedback/reporting commitments, improve live database verification, and address release configuration before expanding scope.

## Evidence index

Paths are relative to the same controlled team repository. The submitted commit must contain or link the evidence being claimed.

| Ref | Controlled evidence | What it supports |
| :--- | :--- | :--- |
| E1 | `src/app.js`; `src/middleware/request.controller.js`; `src/middleware/auth.middleware.js` | Active routes, HTTP result mapping, JWT and role boundary |
| E2 | `src/services/RequestService.js`; `test/request-service.test.js`; `test/request-controller.test.js`; `test/request-api.test.js` | Creation, retrieval, filtering, identity scoping, transition and OCC behaviour; test limits apply |
| E3 | `src/services/RequestFactory.js`; `src/services/requestTypes/`; `test/requestFactory.test.js` | Category validation, severity and default status |
| E4 | `src/services/observers/AuditHistoryObserver.js`; `src/db/tc-db.js`; `docs/testing-tables/DB-persistence-table.md` | Audit design and historical DB records, subject to stated verification gaps |
| E5 | `src/services/observers/DashboardCountsObserver.js`; `src/services/observers/ResidentNotificationObserver.js` | Actual placeholder status of dashboard/notification reactions |
| E6 | `src/db/001-initial_Schema.sql`; `src/db/002-request-filter-indexes.sql`; `src/db/migrate.js` | Schema, uniqueness constraints and migration/index design |
| E7 | `docs/testing-tables/performance-testing-table.md`; `docs/risk/images/AutocanonEvidence.jpeg` | Historical API load evidence, not browser acceptance |
| E8 | `docs/testing-tables/2026-10-18-final-review-verification.md`; `.github/workflows/ci.yml` | Observed local rerun and configured CI; no unobserved GitHub run claimed |
| E9 | `docs/declarations/AI_register`; `docs/declarations/*_AI.pdf` | Existing AI assistance, declarations and accountability |
| E10 | `docs/decisions/deployment-compatibility.md`; `src/config/db.js`; `src/server.js`; `package.json` | Deployment compatibility, actual configuration and startup |
| E11 | `docs/finalisation/evidence/staff-queue.png`; `docs/finalisation/evidence/ticket-detail-staff.png`; Johni’s reported teammate walkthrough | Team-reported creation acceptance and observed queue/detail UI; specific limits below |

Repository PR approvals, issue/change records, stakeholder feedback and final integrated demonstration evidence must be linked from their authentic existing locations. They are not reconstructed by this closure.

### E11 Local frontend acceptance evidence

On 18 October 2026 Johni reported witnessing request creation during a teammate call and subsequently described the ticket journey as fully working. The assistant inspected two supplied screenshots, retained in `docs/finalisation/evidence/`: [staff queue](evidence/staff-queue.png) and [staff detail](evidence/ticket-detail-staff.png). Both show the same generated reference for a Common Area request at Park, severity Medium, status New, submitted at 23:25:44 on 18 October 2026 in the displayed local environment. The detail shows the description, status-update controls and an empty History area. No status update result, resident view, applied filter, High flag, identity rejection or timing measurement is visible. These observations support the stated team-reported creation acceptance without converting unrelated pending checks into passes.
