# Final Product and Project Closure

## Submission information

| Field | Record |
| :--- | :--- |
| Project | CivicConnect for Wonderpark Estates |
| Team | Full Course Meal in the Back of the Class |
| Members | Karabo Masoka (601644); Jimmy Junior Baloyi (601713); Johni Kruger (601710) |
| PED version | v4.0 Final |
| Repository | https://github.com/jk29364/CivicConnect-SEN381 |
| Final assessed revision | |
| Submission date | 19 October 2026 |
| Presentation revision | `2ff3663c8cedc3a1716f360c4078bb2fb3da2f26` |
| Requirements evidence date | 19 October 2026 |
| Demonstration environment | Local evaluation |
| Production release recommendation | No-go |
| Approved release decision | No-go |

## Product outcome and stakeholder value

CivicConnect provides category-specific request creation, unique references, authenticated access, filtered retrieval, controlled status changes and status-history retrieval. RequestFactory validates common and category-specific fields. RequestService scopes records to the authenticated user's complex and restricts resident queries to their own requests. Status changes use version-based conflict detection, a row lock and a transaction-bound audit-history insertion.

The presentation version includes resident/staff sign-in, role-separated screens and visual dashboard summaries. The implementation addresses structured fault reporting and accountable lifecycle tracking. Assignment of ownership, authored comments and resident notifications are absent. Reporting, complete UI acceptance, measured usability and browser performance remain incomplete.

Authentication and dashboard enhancements were added after the submission deadline. The presentation revision and evidence dated 19 October are distinct from the submitted baseline. Assessment authorisation for post-deadline changes is not recorded.

## Requirements Traceability Matrix and delivery status

The following table continues the existing requirements baseline. Met (backend) identifies verified backend behaviour with any remaining UI boundary stated separately. E1–E12 refer to the evidence index.

| ID and priority | Delivery status | Status and indicative value | Implementation and reported evidence | Remaining limitation |
| :--- | :--- | :--- | :--- | :--- |
| FR-001 High | PARTIALLY IMPLEMENTED / verified | Partial, 0.5 | E12: ten Factory tests; live POST returns 201; E1/E2/E3 | Full UI-to-database acceptance is unverified. E11 provides supplementary walkthrough evidence. |
| FR-002 High | IMPLEMENTED backend | Met (backend), 1.0 | E12: invalid transition 400, stale version 409 and history recorded; RequestService.updateRequestStatus | Backend pass does not implement FR-006 ownership or establish every UI precondition. |
| FR-003 High | IMPLEMENTED backend; UI acceptance pending | Met (backend), 1.0 | E12: other resident receives 404; own list excludes the other resident’s requests; getRequests/getRequestById | Resident UI and history-display acceptance are unverified. |
| FR-004 Medium | NOT IMPLEMENTED | Not met, 0.0 | E5/E12: notification integration point only; no delivery evidence | Current source is a no-op, not an active logger or notification sender. History refresh is not notification delivery. |
| FR-005 High | IMPLEMENTED backend; queue UI acceptance pending | Met (backend), 1.0 | E12: category, severity and status filters produce no mismatches; parameterised values, sort whitelist and indexes | Full queue UI acceptance is unverified; backend query support exceeds the exposed UI controls. |
| FR-006 High | NOT IMPLEMENTED | Not met, 0.0 | E6/E12: assigned_to exists but no assignment operation | Assigned status does not set ownership; assignment concurrency remains unimplemented. |
| FR-007 Medium | NOT IMPLEMENTED | Not met, 0.0 | E12 and active API/schema: no comment/action-note implementation | No timestamped, authored action notes. |
| FR-008 High | PARTIALLY IMPLEMENTED | Partial, 0.5 | E12: frontend chart totals; StaffDashboard.buildStats; dashboard observer remains placeholder | Visual evidence only. Overdue/date-range reporting is absent; totals are limited to fetched records. |
| FR-009 Medium | PARTIALLY IMPLEMENTED | Partial, 0.5 | E12: charts group returned data by status, severity and category | Grouped request-view acceptance is incomplete; totals are limited to fetched records. |
| FR-010 High | IMPLEMENTED | Met, 1.0 | E12: two live submissions have distinct references; createRequest and UNIQUE(reference_number) | Distinct observed references support the criterion; duplicate real-world issues are still possible. |
| FR-011 High | PARTIALLY IMPLEMENTED / verified | Partial (visual), 0.5 | E12: stored/validated severity, Low default and orange High styling; Factory tests | Visual evidence is partial; no severity-edit operation is implemented. |
| NFR-001 High | PARTIALLY VERIFIED | Partial, 0.5 | E12: live 401/403 on token tampering/role misuse; JWT route checks and scrypt authentication | Login rate limiting is absent. Backend access-denial checks passed; wider security assurance remains incomplete. |
| NFR-002 High | PARTIALLY VERIFIED | Partial (visual), 0.5 | E12: queue/dashboard High styling; overlaps FR-011 | The visual criterion overlaps FR-011. |
| NFR-003 Medium | NOT VERIFIED | Not met, 0.0 | E12: no representative-user measurement | The under-three-minute usability outcome is unmeasured. |
| NFR-004 High | IMPLEMENTED backend | Met (backend), 1.0 | E12: history content hash unchanged after a rejected update; transaction-bound audit insertion | Preservation under the tested failure is supported; not database-level tamper-proof history or proof of every failure mode. |
| NFR-005 Low | NOT VERIFIED as browser criterion | Not met, 0.0 | E12/E7: historical API average only; no browser timing | No complete three-second browser list-render measurement. |
| NFR-006 Medium | PARTIALLY IMPLEMENTED | Partial, 0.5 | E12: complex_id is present/non-null; reported zero null rows; schema | No complexes table or complex foreign key. This does not establish multi-tenant operation or cross-table estate integrity. |

## Completion summary

| Requirement status | Count | Weight | Weighted total |
| :--- | ---: | ---: | ---: |
| Met / Met (backend) | 5 | 1.0 | 5.0 |
| Partial | 7 | 0.5 | 3.5 |
| Not Met | 5 | 0.0 | 0.0 |
| Total | 17 | | 8.5 |

**Indicative requirement-status score = (8.5 / 17) × 100 = 50.00%.**

This score summarises the 17 requirements in E12. It includes qualified backend passes and NFR-006, previously recorded separately as a design/forward-engineering concern. The official M1 Scope Completion Percentage is based on approved acceptance criteria and their full outcomes. The requirement-status summary does not establish the 80% acceptance-completion target.

| Official acceptance calculation | Record |
| :--- | :--- |
| Applicable approved acceptance criteria | |
| Met criteria | |
| Partially met criteria | |
| Not met criteria | |
| Official M1 Scope Completion Percentage | |
| Approved change references | |

## Deferred and excluded scope

Integrated levy/payment processing, multi-estate management, SLA auto-escalation and resident analytics beyond basic status/history remain excluded or deferred under the original scope record. Assignment, comments, in-app notifications and management reporting are original commitments with the incomplete outcomes recorded in the RTM.

## Quality and acceptance evidence

The recorded 18 October backend execution passed 42 tests: 10 Factory, 14 service, 9 controller and 9 HTTP tests. Controller tests mock the service; HTTP tests exercise Express with a mocked service; service tests inject a fake database. The result supports the covered backend cases, not complete browser, database or production acceptance. The initial HTTP attempt encountered a local connection-permission restriction; the permitted rerun passed without a source change.

E12 records subsequent live backend checks: POST 201, distinct references, invalid-transition 400, stale-version 409, history preservation, cross-resident 404, matching filters, token/role 401/403 and non-null complex association. These results are reported in the supplied evidence summary. Raw output, execution metadata and exact tested revision are not included in that summary. The existing 42-test suite does not cover the added authentication routes.

| Journey or property | Recorded result | Evidence boundary |
| :--- | :--- | :--- |
| Request submission | Live POST 201 and Factory tests | Full UI-to-database acceptance unverified |
| Status transitions | Invalid transition 400; stale version 409; history recorded | Met backend; assigned ownership remains absent |
| Resident isolation | Other resident receives 404; own list excludes other records | Met backend; resident UI acceptance unverified |
| Filtering | Category/severity/status results contain no mismatches | Met backend; full queue UI acceptance unverified |
| Reference generation | Two live submissions have distinct references | No duplicate-incident detection |
| Access control | Token tampering and role misuse rejected with 401/403 | Login rate limiting absent |
| History preservation | Content hash unchanged after rejected update | Tested preservation case; no database-enforced immutability |
| Dashboard/grouping/High styling | Visual evidence | Partial; bounded-list totals |
| Complex association | Zero null complex_id rows reported | No complexes table or complex foreign key |
| Usability and browser latency | | Unmeasured |

| Live-check provenance | Record |
| :--- | :--- |
| Source | FR & NFR LINKS AND LAYERED MONOLITH, E12 |
| Original live-check output location | |
| Performed by | |
| Execution date | |
| Environment and tested revision | |
| Stakeholder validation | |

## Deployment and release position

The demonstrated environment is local evaluation. No production deployment is recorded. The production recommendation is no-go because database certificate verification is disabled, login rate limiting is absent, authentication schema setup is not fully reproduced by the migration runner, full browser acceptance is incomplete and ownership/reporting commitments remain unresolved.

| Release record | Detail |
| :--- | :--- |
| Demonstration mode | Local evaluation |
| Production recommendation | No-go |
| Approved team release decision | |
| Approval date or reference | |
| Frontend address | |
| Evaluation database alias | |

The backend starts with npm start and uses PORT, defaulting to 3000. DATABASE_URL and JWT_SECRET are server configuration. Authentication now issues tokens through login/register routes. CORS is unrestricted. The health endpoint confirms HTTP responsiveness without querying the database. Console startup/error logging exists; alerting and automated incident response are not implemented.

The migration runner applies the initial schema and filter indexes but does not apply the authentication SQL file automatically. The checked-in authentication SQL adds password_hash but not is_approved. Application rollback requires a schema-compatible revision. The runner has no migration ledger or automatic rollback; reverting code does not revert database changes. Database recovery evidence is not recorded.

## Defect and risk closure

| Existing item | Final recorded position | Residual consequence |
| :--- | :--- | :--- |
| DEF-M3-01 connection URI parsing | Historically closed | Connection URI requires valid credential encoding |
| DEF-M3-02 import failures | Core application loads; separate seed import defect remains open | Not all setup scripts are reproducible |
| DEF-M3-03 missing driver | pg declared; backend tests load successfully | Final fresh-install CI result not recorded here |
| RSK-M3-01 lost updates | Status version checks; E12 stale-update 409 | Assignment concurrency remains unimplemented |
| RSK-M3-02 partial audit history | Shared-client transaction; E12 preserved history after rejected update | Evidence covers specific cases, not every failure mode |
| RSK-M3-03 deployment drift | Version-controlled SQL exists | Migration tracking and complete auth schema setup remain absent |
| R-002 personal-data exposure | JWT/role checks and resident-isolation evidence exist | Residual security/configuration concerns remain |
| R-006 integration | Backend integration supported by E12 | Full client acceptance incomplete |

The existing Risk Register and Defect Register retain historical entries and dated continuations.

## Architecture and technical debt

CivicConnect is a layered backend monolith with a separate React client. Request controllers call RequestService; the service owns request validation, scoping, transitions and observer coordination. PostgreSQL provides relational storage through the pg pool.

The implementation differs from the intended separation: RequestService directly executes SQL and transaction operations, authentication routes directly query the pool, and no src/persistence repository layer exists. The request controller resides in src/middleware rather than src/api. The unused CommonJS request router is not the active route definition.

| Debt ID | Recorded position | Consequence and evolution |
| :--- | :--- | :--- |
| TD-1 in-process Observer | Retained | No durable notification transport; audit runs synchronously inside the status transaction |
| TD-2 layer boundaries by convention | Retained | SQL/service and auth-route coupling remain |
| TD-3 single-complex model | Retained scope boundary | Multi-estate isolation requires additional design and verification |
| TD-4 deferred construction/integration | Partly repaid | Core API exists; original feature and acceptance gaps remain |
| TD-5 free-tier assumptions | Unvalidated for final operation | Local demonstration does not establish hosted cost/capacity |
| TD-FIN-01 service-owned persistence | Outstanding | Planned repository/unit-of-work extraction; atomic audit boundary must be preserved |
| TD-FIN-02 auth routes bypass service | Outstanding | Planned auth service/persistence separation and dedicated auth tests |

## Implementation variances and evidence limits

- Express ^5.2.1 is implemented instead of the earlier Express 4.21.x selection. Tests use Node's built-in runner rather than Jest/Supertest.
- Request routes use /api/requests rather than the designed /api/v1 prefix.
- Login/register/me routes exist in the presentation version. The historical login PASS claim is not linked to its original tested revision. The recorded admin/system-settings route is absent.
- The seed script contains an invalid relative configuration import. Historical seeding evidence is not reproducible with that file unchanged.
- The historical tc-db script uses a dummy actor, accepts arbitrary exceptions for negative cases and does not inspect persisted rollback state. E12 supplies additional reported live results separately.
- The historical 2377.07 ms average API latency does not establish browser list rendering within three seconds.
- Dashboard charts aggregate fetched records in React. The default list contains at most 100 records unless a different limit is requested; the maximum supported limit is 200. There is no complete aggregation endpoint or implemented pagination flow.
- DashboardCountsObserver is a no-op. ResidentNotificationObserver is also a no-op and provides no notification delivery.
- The frontend API wrapper replaces non-success responses with a generic error, discarding status/details required by specialised conflict and validation messages.

## Decision consequences

| Decision | Rationale | Observed consequence | Learning |
| :--- | :--- | :--- | :--- |
| Layered monolith, ADR-ARCH-001 | Manageable delivery for three students and one estate | Shared audit transaction; persistence and auth boundaries are incompletely separated | Single-process simplicity does not enforce layer discipline |
| Factory, ADR-DP-002 | Centralised category construction/validation | Ten Factory tests pass; category rules are separated from HTTP handling | Creation validation does not establish persistence or full UI acceptance |
| Transactional audit and Observer, ADR-DATA-001 / ADR-DP-001 | Preserve status history and separate reactions | Audit shares update transaction; notification/dashboard reactions remain incomplete | An interface or placeholder is not a delivered reaction |
| Separate frontend/backend hosting, ADR-STACK1 | Familiar tooling and zero-cost staging target | Local operation; cloud topology/capacity unverified | Hosting assumptions require operational evidence |

## Schedule and resource outcome

Frontend integration continued into finalisation. Authentication and dashboard enhancements were completed after the deadline and are included in the presentation build. Full client acceptance remains incomplete in E12.

| Schedule measure | Result |
| :--- | :--- |
| Planned milestone dates | |
| Actual milestone completion dates | |
| Approved schedule/scope changes | |

The architecture targets a R0.00 staging budget. Local evaluation requires no newly procured hosting service. Actual spending, current free-tier entitlement and commercial operating costs are not established by the recorded evidence.

| Cost measure | Result |
| :--- | :--- |
| Actual expenditure | |
| Commercial operating-cost estimate | |

## AI use and accountability

AI assistance is recorded in docs/declarations/AI_register and the associated signed declarations. Items 24–26 cover Factory/CI, risk/deployment and request-endpoint work; items 27–28 record documentation assistance and requirements reconciliation. The declarations record student accountability and their stated review/approval history. Repository review evidence is distinct from declaration text.

Requirement statuses and live outcomes in E12 are source-reported results. The documentation reconciliation did not execute those live checks. Approval details not established in the evidence remain blank.

## Project conclusion

The recorded evidence supports backend status integrity, resident isolation, filtering, references and history preservation. Submission/UI acceptance, reporting and wider security remain partial. Assignment, authored comments and notifications are absent; usability and browser performance are unmeasured.

The current 17-requirement status inventory yields 50.00%; the official original-baseline acceptance calculation is not recorded. The monolith supports a shared audit transaction, while direct SQL and auth-route coupling remain technical debt. The environment is local evaluation, with a production no-go recommendation and no recorded final team release approval.

## Evidence index

| Ref | Evidence location | Coverage |
| :--- | :--- | :--- |
| E1 | src/app.js; src/middleware/request.controller.js; src/middleware/auth.middleware.js | Routes, response mapping, identity and roles |
| E2 | src/services/RequestService.js; test/request-service.test.js; test/request-controller.test.js; test/request-api.test.js | Request logic and automated test boundaries |
| E3 | src/services/RequestFactory.js; src/services/requestTypes/; test/requestFactory.test.js | Category validation/defaults |
| E4 | src/services/observers/AuditHistoryObserver.js; src/db/tc-db.js; docs/testing-tables/DB-persistence-table.md | Audit design and historical database evidence |
| E5 | src/services/observers/DashboardCountsObserver.js; src/services/observers/ResidentNotificationObserver.js | Incomplete observer reactions |
| E6 | src/db/001-initial_Schema.sql; src/db/002-request-filter-indexes.sql; src/db/migrate.js | Schema, constraints, indexes and migration scope |
| E7 | docs/testing-tables/performance-testing-table.md; docs/risk/images/AutocanonEvidence.jpeg | Historical API performance |
| E8 | docs/testing-tables/2026-10-18-final-review-verification.md; .github/workflows/ci.yml | Recorded automated rerun and CI configuration |
| E9 | docs/declarations/AI_register; docs/declarations/ | AI declarations and accountability |
| E10 | docs/decisions/deployment-compatibility.md; src/config/db.js; src/server.js; package.json | Runtime and deployment configuration |
| E11 | docs/finalisation/evidence/staff-queue.png; docs/finalisation/evidence/ticket-detail-staff.png | Staff queue/detail screenshots and reported walkthrough |
| E12 | docs/finalisation/evidence/requirements-linkage-2026-10-19.pdf | Updated FR/NFR statuses, reported live checks and architecture deviations |

### E11 Frontend evidence

Johni witnessed request creation during a teammate call on 18 October 2026. The staff queue and detail screenshots show the same Common Area request at Park, Medium severity and New status, with its generated reference. The detail contains status controls and an empty History area. These screenshots do not show a saved transition, resident isolation, applied filter, High highlight or timing result.

### E12 Requirements and architecture evidence

The five-page requirements-linkage PDF records backend live-check outcomes, qualified requirement statuses and layered-monolith deviations. The exact tested revision, raw request/response output and original fixture/hash queries are not included. The original PDF is retained unchanged.
