# Final Product and Project Closure

## Final submission information

| Field | Record |
| :--- | :--- |
| Project | CivicConnect for Wonderpark Estates |
| Team | Full Course Meal in the Back of the Class |
| Members | Karabo Masoka (601644); Jimmy Junior Baloyi (601713); Johni Kruger (601710) |
| PED | v4.0 Final, continuing the existing PED v3.0 |
| Repository | https://github.com/jk29364/CivicConnect-SEN381 |
| Original reviewed backend revision | `93ce4a82a196411ed25b613924c35d32c0cc8619` |
| Current presentation checkout | `2ff3663c8cedc3a1716f360c4078bb2fb3da2f26`; not automatically the submitted/assessed revision |
| Requirements update | 19 October 2026; supplied FR/NFR linkage and layered-monolith review (E12) |
| Final assessed revision | **[TEAM CONFIRM: enter the frozen commit after frontend integration and documentation review; the reviewed backend revision is not automatically the final release]** |
| Demonstration | Local demonstration; request creation witnessed by Johni during a teammate walkthrough; staff queue and detail screenshots supplied; ticket journey reported working by Johni |
| Production release position | No-go recommended for the inspected baseline; local demonstration only |
| Final RTM | Existing Requirements Traceability Matrix in this PED, continued with the implementation and acceptance updates below |
| Submission date | **[TEAM CONFIRM: actual date submitted]** |

This closure continues the existing engineering record. Its current requirement statuses follow the updated team-supplied FR/NFR linkage document (E12), which reports code inspection and live checks. Those live results are attributed to that record; they were not rerun during this documentation update. Earlier walkthrough/screenshots (E11) remain historical supporting evidence. Where they differ, E12 supplies the current conservative acceptance position, including partial FR-001 despite the earlier reported creation walkthrough.

The current presentation checkout includes post-deadline authentication and dashboard additions. These updates describe the presentation evidence and do not retrospectively change the submitted baseline, acceptance score or assessment eligibility. The team must associate live-check evidence with its actual revision/environment; E12 does not identify an exact tested commit or include raw results.

## Product outcome and stakeholder value

CivicConnect provides an implemented backend for category-specific request creation, unique references, authenticated request access, filtered retrieval, controlled status changes and status-history retrieval. The RequestFactory validates common and category-specific fields. The service layer scopes records to the authenticated user's complex and restricts resident queries to their own requests. Status updates use a database transaction, a version check and an audit-history observer.

These capabilities address the original need for controlled service-request records and accountable status changes. The updated evidence reports backend passes for transitions, resident isolation, filtering, references and retained history. Sign-in and visual dashboard summaries now exist in the presentation build. Assignment, authored comments and notifications remain absent; reporting, visual acceptance, complete UI-to-database verification and measured usability/performance remain incomplete. No stakeholder sign-off is inferred from the supplied test summary.

## M1 scope to final delivery and RTM continuation

Continue the original RTM’s stakeholder, priority, requirement, acceptance and design columns. The following status updates follow E12. “Met (backend)” is deliberately retained as a qualified backend result, not an assertion of complete browser acceptance. Full and partial status values are used for an indicative requirement-status calculation below, separately from the official M1 acceptance-criterion calculation.

Evidence references E1–E12 are defined in the evidence index. Relative code paths in E12 are mapped to the actual src/ and frontend/src/ locations here.

| ID and priority | Delivery status | Updated status and indicative value | Implementation and reported evidence | Remaining limitation |
| :--- | :--- | :--- | :--- | :--- |
| FR-001 High | PARTIALLY IMPLEMENTED / verified | Partial, 0.5 | E12: ten Factory tests; live POST returns 201; E1/E2/E3 | Full UI-to-database flow not checked in the updated list. E11 walkthrough remains supplementary, not full acceptance. |
| FR-002 High | IMPLEMENTED backend | Met (backend), 1.0 | E12: invalid transition 400, stale version 409 and history recorded; RequestService.updateRequestStatus | Backend pass does not implement FR-006 ownership or establish every UI precondition. |
| FR-003 High | IMPLEMENTED backend; UI acceptance pending | Met (backend), 1.0 | E12: other resident receives 404; own list excludes the other resident’s requests; getRequests/getRequestById | Resident UI/history display pending in E12; do not describe this backend pass as full end-to-end acceptance. |
| FR-004 Medium | NOT IMPLEMENTED | Not met, 0.0 | E5/E12: notification integration point only; no delivery evidence | Current source is a no-op, not an active logger or notification sender. History refresh is not notification delivery. |
| FR-005 High | IMPLEMENTED backend; queue UI acceptance pending | Met (backend), 1.0 | E12: category, severity and status filters produce no mismatches; parameterised values, sort whitelist and indexes | Queue controls/results remain pending in the supplied list; backend support exceeds the current UI controls. |
| FR-006 High | NOT IMPLEMENTED | Not met, 0.0 | E6/E12: assigned_to exists but no assignment operation | Assigned status does not set ownership; assignment concurrency remains unimplemented. |
| FR-007 Medium | NOT IMPLEMENTED | Not met, 0.0 | E12 and active API/schema: no comment/action-note implementation | No timestamped, authored action notes. |
| FR-008 High | PARTIALLY IMPLEMENTED | Partial, 0.5 | E12: frontend chart totals; StaffDashboard.buildStats; dashboard observer remains placeholder | Visual evidence only; no overdue/date-range reporting; counts are over the bounded API result, not guaranteed whole-estate totals. |
| FR-009 Medium | PARTIALLY IMPLEMENTED | Partial, 0.5 | E12: charts group returned data by status, severity and category | Visual grouping is not complete grouped request-view acceptance or proof of accurate totals beyond the fetched list. |
| FR-010 High | IMPLEMENTED | Met, 1.0 | E12: two live submissions have distinct references; createRequest and UNIQUE(reference_number) | Distinct observed references support the criterion; duplicate real-world issues are still possible. |
| FR-011 High | PARTIALLY IMPLEMENTED / verified | Partial (visual), 0.5 | E12: stored/validated severity, Low default and orange High styling; Factory tests | Visual evidence is partial; no severity-edit operation is implemented. |
| NFR-001 High | PARTIALLY VERIFIED | Partial, 0.5 | E12: live 401/403 on token tampering/role misuse; JWT route checks and scrypt authentication | No login rate limiting. This is a residual security gap, not a newly added original acceptance criterion; retain the supplied conservative status. |
| NFR-002 High | PARTIALLY VERIFIED | Partial (visual), 0.5 | E12: queue/dashboard High styling; overlaps FR-011 | Do not merge/remove the overlapping criterion without the approved baseline clarification. |
| NFR-003 Medium | NOT VERIFIED | Not met, 0.0 | E12: no representative-user measurement | Under-three-minute usability outcome not measured; not evidence that it necessarily exceeds the target. |
| NFR-004 High | IMPLEMENTED backend | Met (backend), 1.0 | E12: history content hash unchanged after a rejected update; transaction-bound audit insertion | Preservation under the tested failure is supported; not database-level tamper-proof history or proof of every failure mode. |
| NFR-005 Low | NOT VERIFIED as browser criterion | Not met, 0.0 | E12/E7: historical API average only; no browser timing | No complete three-second browser list-render measurement. |
| NFR-006 Medium | PARTIALLY IMPLEMENTED | Partial, 0.5 | E12: complex_id is present/non-null; reported zero null rows; schema | No complexes table or complex foreign key. This does not establish multi-tenant operation or cross-table estate integrity. |

### Quantified scope completion

For the **updated 17-entry requirement list**, E12 records 5 Met/Met-backend items (FR-002, FR-003, FR-005, FR-010, NFR-004), 7 Partial items (FR-001, FR-008, FR-009, FR-011, NFR-001, NFR-002, NFR-006) and 5 Not Met items (FR-004, FR-006, FR-007, NFR-003, NFR-005).

**Indicative requirement-status score = ((5 × 1.0 + 7 × 0.5 + 5 × 0.0) / 17) × 100 = 50.00%.**

This replaces the older 28.125% and 31.25% snapshots as the current requirement-list summary. It is **not automatically the official M1 Scope Completion Percentage**: E12 includes qualified backend passes, pending UI checks and NFR-006, which was previously recorded separately as a forward-engineering/design concern. The approved M1 acceptance criteria, rather than a new count of requirements, determine the official denominator and scores. The approved handling of the FR-011/NFR-002 overlap must remain traceable. Do not retrospectively amend a submitted percentage using post-deadline evidence.

**[TEAM CONFIRM: approved applicable acceptance criteria, final full-criterion scores, resulting official percentage, tested revision and any approved change references.]** The 80% target is not established by this updated list. Retain critical omissions and stakeholder consequences openly.

### Deferred and excluded scope

Integrated levy/payment processing, multi-estate management, SLA auto-escalation and resident analytics beyond basic status/history remain outside the documented delivery commitment or deferred as recorded in the original scope. Preserve the original distinction between out-of-scope and future work. Assignment, comments, in-app notifications and management reporting are original commitments; their absence must not be relabelled as an approved deferral without a genuine change decision.

## Final quality and acceptance evidence

On 18 October 2026, `npm test` completed with **42 tests passed, 0 failed, 0 skipped** in the inspected checkout. The suite comprises 9 HTTP tests, 9 controller tests, 14 service tests and 10 Factory tests. HTTP tests exercise Express with a mocked service, controller tests mock the service, and service tests inject a fake database. This demonstrates the tested logic and interface behaviour; it does not prove actual PostgreSQL execution, complete frontend acceptance, load performance or production readiness. See E8 for the recorded result and limitations.

The first run's HTTP tests were blocked by local connection permissions. All nine HTTP tests passed when rerun with local network access. That environment restriction is not recorded as a product defect.

The updated E12 evidence reports live backend checks beyond the earlier mocked suite: POST 201, distinct references, transition 400, stale-version 409, chronological history, cross-resident 404, matching filters, token/role 401/403, unchanged history hash after rejection and zero null complex_id rows. These are team-supplied results, not executions by this update. Preserve original output, fixture identities, environment and tested revision if available. New auth-route behaviour is not covered by the existing 42-test suite merely because those tests pass.

### Acceptance demonstration record

| Journey or property | Updated evidence in E12 | Remaining acceptance boundary |
| :--- | :--- | :--- |
| Request submission | Live POST 201 and Factory checks; Partial | Full UI-to-DB flow remains unverified in updated list. |
| Status transitions | Invalid transition 400; stale version 409; history recorded; Met backend | Confirm UI and original assigned-owner precondition separately. |
| Resident visibility | Other resident gets 404; own list excludes theirs; Met backend | Resident UI display pending. |
| Request filtering | Category/severity/status filters return no mismatches; Met backend | Queue UI pending. |
| Reference uniqueness | Two submissions have distinct references; Met | No claim of duplicate-incident prevention. |
| Access control | Token tampering/role misuse denied with 401/403; Partial | Rate limiting absent; no universal security assurance. |
| History preservation | Content hash unchanged after rejected update; Met backend | Preserve fixture/query/hash evidence; not a tamper-proofing claim. |
| Dashboard/grouping/High styling | Visual only; Partial | Complete aggregates and visual acceptance still limited. |
| Complex association | Zero null rows; Partial | No complexes table/foreign key. |
| Usability/browser latency | Not measured | NFR-003 and NFR-005 remain Not Met for evidence scoring. |

**[TEAM CONFIRM: link actual live-check outputs, performer, execution date, environment and revision; identify any stakeholder/representative-user feedback actually obtained.]** No full UI acceptance or stakeholder sign-off is inferred from backend results.

## Final deployment position and operational limits

The intended final demonstration is local, as confirmed by the team representative. A local developer session is not automatically staging or simulated production. Unless a separate controlled environment is demonstrated, describe the access mode as a local evaluation build. If the final submission declares staging, identify the actual release-candidate configuration and database used. No public production deployment is claimed.

The recommended position remains **NO-GO for production use**, with local evaluation only. The updated build has implemented login and the supplied record supports backend access checks and integrity cases; “no token issuer” and “no live backend verification” are no longer accurate current blockers. Remaining concerns are disabled database certificate verification, absent login rate limiting, incomplete reproducible authentication migrations, incomplete browser acceptance and unresolved ownership/reporting scope. These concerns require separate release judgement, not automatic rejection based solely on an incomplete scope percentage. CORS remains unrestricted and is not a replacement for authentication.

| Concern | Affected requirement/risk | Condition before production approval |
| :--- | :--- | :--- |
| Residual authentication/deployment security | NFR-001, R-002 | Review rate limiting, token handling and approval configuration; verify database certificate trust. |
| Database setup not fully reproducible | RSK-M3-03 | Reconcile migration runner/auth columns with the actual working database. |
| Full client acceptance remains incomplete | FR-001/003/005, NFR-003/005, R-006 | Confirm original UI criteria, representative usability and browser timing against the released revision. |
| Ownership and reporting remain incomplete | FR-006/008/009 | Complete and verify or record a genuine release-limitation approval; do not relabel missing work as delivered. |

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
| RSK-M3-01 lost updates | Mitigated in status logic; E12 reports live stale-version 409 | Status protection does not establish assignment concurrency. |
| RSK-M3-02 partial audit history | Same-client audit transaction, rollback unit case and E12 live checks exist | E12 reports live history and unchanged hash after rejection; retain actual outputs and do not infer universal atomicity coverage. |
| RSK-M3-03 deployment drift | Migration scripts exist; version tracking/recovery remain incomplete | Treat as reduced through controlled schema files, not eliminated. |
| R-006 frontend/backend integration | Reduced for reported backend checks; retained for full UI acceptance | E12 still marks submission/UI display/queue acceptance pending or partial. |

### Technical debt continuation

| Existing debt | Final review disposition | Consequence and future trigger |
| :--- | :--- | :--- |
| TD-1 in-process Observer | Retained | Notification transport is still a placeholder. Complete the committed in-app behaviour first; reconsider durable dispatch when delivery guarantees or another channel are required. |
| TD-2 layer boundaries by convention | Retained; actual deviations documented | RequestService owns SQL directly and auth routes bypass the service; see TD-FIN-01/02 below. |
| TD-3 single-complex data model | Retained as deliberate scope | Review isolation and schema constraints before any multi-estate expansion. |
| TD-4 deferred construction/integration | Partly repaid | Core API and persistence code exist; assignment, comments, reporting and integrated acceptance remain incomplete in this baseline. |
| TD-5 free-tier hosting assumptions | Unvalidated for final operation | Local demonstration does not validate cloud cold-start, cost or capacity assumptions. Reassess before hosting. |

### Layered monolith and specific architectural debt

The backend is a single Express process with a separate React client. Request controllers delegate domain operations to RequestService, which uses the Factory, transition/scoping rules and observers. SQL schema/index files and the connection pool provide database infrastructure. The intended three-layer model is only partially separated in the source: there is no implemented src/persistence folder or distinct request repository, and the auth router directly accesses the pool.

| Debt ID | Deviation | Consequence | Future repayment and verification |
| :--- | :--- | :--- | :--- |
| TD-FIN-01 | RequestService executes SQL and transaction code directly instead of using a persistence repository | Domain rules and database concerns are coupled; tests inject a query-level fake rather than a repository interface. | Extract request persistence/transaction operations to src/persistence with an explicit unit-of-work boundary; preserve atomic audit and rerun existing tests plus real DB checks. No refactor is claimed by this update. |
| TD-FIN-02 | routes/auth.routes.js queries PostgreSQL directly, bypassing an auth service | HTTP, account rules and SQL are mixed, making isolated verification/change harder. | Introduce auth service/persistence boundaries and verify registration, login, approval and role-denial paths. No implemented repayment is claimed. |

The request controller lives in src/middleware rather than the planned src/api folder. The unused CommonJS request router is not authoritative. These are documented layout/design variances, not proof that a fully separated persistence layer exists.

### Evidence corrections and implementation variances

The following corrections qualify earlier statements without deleting the project history:

- The current dependency is Express `^5.2.1`, rather than the earlier Express 4.21.x selection. Current tests use Node's built-in test runner rather than Jest/Supertest.
- Implemented routes use `/api/requests`; `/api/v1/requests` is a design intention, not an active route prefix.
- The earlier reviewed backend lacked a login route. The presentation build now mounts `/api/auth/login`, `/api/auth/register` and `/api/auth/me`. That later implementation does not authenticate the historical PASS claim at its original revision. `/api/admin/system-settings` remains absent. Keep evidence tied to its tested revision.
- `src/db/seed.js` currently imports a nonexistent relative configuration path. The claimed seeding result is historical and is not reproducible with that file unchanged.
- `src/db/tc-db.js` uses a dummy actor and accepts any exception for negative tests. An invalid actor can masquerade as a successful stale-update rejection. The script does not assert stored audit rows or rollback state; its pass messages alone do not prove those properties.
- The 2377.07 ms API result is not an observed browser rendering result. Authentication, successful response counts and the tested revision must accompany any reused load evidence.
- Dashboard charts now compute counts in React; the dashboard observer remains a no-op. The resident-notification observer also remains a no-op and is not registered for delivery. E12 describes it as logging, but the checked-in body performs no logging; notifications remain Not Met either way.
- The active application registers routes directly; `src/routes/request.routes.js` is unused CommonJS code within an ESM project. It is not the authoritative route contract.

## Significant decisions and observed consequences

| Original decision | Original rationale | Observed consequence and evidence | Learning and future decision |
| :--- | :--- | :--- | :--- |
| Layered monolith, ADR-ARCH-001 | Keep deployment and transaction coordination manageable for a three-person team | Single backend process supports one audit transaction. Persistence SQL remains inside the service and auth routes bypass it; TD-FIN-01/02 record the difference from the designed layers. | Retain the monolith for current scope. Agree API and identity contracts early; a monolith does not remove client integration work. |
| Factory for category creation, ADR-DP-002 | Centralise construction and category validation | Ten Factory tests pass, including defaults, invalid severity and missing common fields. Factory success alone does not prove reference persistence or visible prioritisation. | Retain it, while tracing acceptance beyond construction to storage and UI. |
| PostgreSQL transactions and Observer, ADR-DATA-001 / ADR-DP-001 | Preserve status history and decouple status-change reactions | Update and audit insertion share a transaction; mocked rollback checks pass and E12 reports live transition/conflict/history checks. Notification/dashboard observer placeholders remain; charts aggregate independently in React. | Retain atomic audit insertion. Treat each additional observer as its own delivery obligation, with failure behaviour explicitly reviewed. |
| Separate frontend and backend hosting, ADR-STACK1 | Support team familiarity and a zero-cost staging target | Local demonstration is planned; cloud topology and operational costs have not been validated for the final release. CORS and identity remain integration concerns. | Revisit hosting only after the combined product is stable; record measured compatibility and cost before claiming hosted readiness. |

These are recorded consequences, not retrospective approval of undocumented changes. Link genuine issue/PR/change decisions when finalising the existing decision register. Do not invent lecturer/client change requests or peer-review records.

## Schedule cost and resource conclusion

The initial closure was prepared during frontend integration. The later presentation build adds authentication and dashboard visuals; E12 supplies stronger backend evidence while retaining incomplete UI acceptance. This update does not claim those later changes were submitted by the deadline. The finalisation response is to prioritise integration, critical defects and evidence over optional features. Planned milestone dates, actual completion dates and any approved scope/reprioritisation decisions must be taken from the existing board and repository history; no on-time-delivery claim is made here without that comparison.

The design targets a R0.00 staging budget, and the local demonstration does not require a newly procured hosting service. This is a design constraint, not an audited statement of total spending. No commercial operating-cost estimate or current free-tier entitlement has been verified in this review. A commercial deployment would need to account for compute, database capacity, storage/backups, monitoring, support and maintenance, based on the actual workload and provider quotations. The project does not claim that production operation would be cost-free.

## AI use verification and accountability

Existing AI use and verification declarations are retained in `docs/declarations/` and indexed by `docs/declarations/AI_register`. They are not missing or replaced by this closure. Examples inspected include the signed declaration for branch `58-src-request-endpoints-wired-to-factory-and-persistence` (register item 26), the Factory/CI declaration (item 24), and the risk/deployment declaration (item 25). These declarations record the authors' accountability and state that the associated entries were peer-reviewed and approved. Actual PR approvals remain separate repository evidence and are not inferred from the declaration alone.

The earlier documentation assistance remains recorded in the AI register. This 19 October update reconciles the team-supplied linkage PDF with the current source and corrects stale status/evidence statements. E12 live results are attributed to their source, not claimed as assistant executions. Human review and any new declaration approval are not fabricated.

## Final project conclusion

The updated evidence supports backend delivery for status integrity, own-record isolation, filtering, reference generation and retained history, alongside partial submission/UI acceptance and partial reporting/security outcomes. The supplied 17-item status inventory yields an indicative 50.00%, not a certified original M1 acceptance score. Assignment, comments and notifications remain Not Met; usability and browser performance remain unmeasured.

The layered monolith keeps the audit transaction manageable, but service-owned SQL and direct auth-route database access are recorded architectural debt. Local demonstration remains the intended mode. Presentation-time evidence and post-deadline improvements must remain distinguishable from the actual submitted baseline. Future work should complete original scope, establish reproducible auth/database setup, close full UI acceptance and address release security before claiming production readiness.

## Evidence index

Paths are relative to the controlled team repository. Evidence must identify its actual revision and timing. Post-deadline presentation evidence must not be presented as part of the deadline submission without authorisation.

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
| E12 | `docs/finalisation/evidence/requirements-linkage-2026-10-19.pdf` | Team-supplied FR/NFR statuses, reported live checks and layered-monolith deviations; original file preserved, executions not rerun here |
| E11 | `docs/finalisation/evidence/staff-queue.png`; `docs/finalisation/evidence/ticket-detail-staff.png`; Johni’s reported teammate walkthrough | Team-reported creation acceptance and observed queue/detail UI; specific limits below |

Repository PR approvals, issue/change records, stakeholder feedback and final integrated demonstration evidence must be linked from their authentic existing locations. They are not reconstructed by this closure.

### E11 Local frontend acceptance evidence

On 18 October 2026 Johni reported witnessing request creation during a teammate call and subsequently described the ticket journey as fully working. The assistant inspected two supplied screenshots, retained in `docs/finalisation/evidence/`: [staff queue](evidence/staff-queue.png) and [staff detail](evidence/ticket-detail-staff.png). Both show the same generated reference for a Common Area request at Park, severity Medium, status New, submitted at 23:25:44 on 18 October 2026 in the displayed local environment. The detail shows the description, status-update controls and an empty History area. No status update result, resident view, applied filter, High flag, identity rejection or timing measurement is visible. These observations support the stated team-reported creation acceptance without converting unrelated pending checks into passes.

### E12 Updated requirement and layering record

The supplied five-page PDF is retained unchanged in the evidence folder. It reports live checks and current statuses but does not include raw request/response transcripts, fixture queries/hashes or the exact tested commit. Those provenance limits remain visible. Its presentation tips and suggested refactor are reference material, not approval to modify the program. This update changes documentation only.
