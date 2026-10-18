# FR-005 / FR-010 Core Request API — verification evidence

**Component:** `POST /api/requests`, `GET /api/requests`,
`GET /api/requests/:id`, `PUT /api/requests/:id/status`.

**Source:** PED functional requirements FR-001, FR-005, FR-010;
ASR-1 (security), ASR-2 (status/audit), ASR-4 (filter performance).

**Approach:** Node built-in `node:test` + `node:assert/strict`.
The service tests use an injected fake PostgreSQL connection; controller tests
use a mocked service; the HTTP suite uses actual Express with a mocked service.
This separation avoids falsely claiming DB persistence from mock-only tests.

| Test group | Input / condition | Expected | Type |
|---|---|---|---|
| POST valid | Verified Resident JWT; valid category fields | 201 and nonempty referenceNumber | HTTP + controller |
| POST impersonation | Body has a different submittedBy | DB payload uses verified token user only | HTTP + controller |
| POST unauthenticated | Missing JWT | 401 before service is invoked | HTTP + controller |
| POST malformed | Factory rejects missing required fields | ValidationError, 400, no insert | Service + HTTP |
| GET queue filters | category/severity/status/date/assignee | Parameterized, matching-only results | Service + HTTP |
| GET resident scope | Resident filters for another resident | Query still restricted to JWT user's ID | Service |
| GET detail | Request exists/doesn't exist | 200 with history / 404 | Controller + HTTP |
| PUT valid | New → Assigned, current version | Updated version, same-transaction audit | Service + HTTP |
| PUT invalid | New → Resolved | ValidationError/400; rollback | Service + HTTP |
| PUT stale | Older version | ConflictError/409; rollback | Service + HTTP |
| PUT unauthorised | Resident JWT | 403 | HTTP |

**Historical verification:**
The earlier working environment passed 23/23 controller and service tests using
Node 22 and a temporary package-loading stub. HTTP execution was then blocked
by registry DNS errors. This limitation describes that earlier run only.

**Updated verification, 18 October 2026:**
The existing `npm test` suite passed **42/42 tests**, including 9 HTTP,
9 controller, 14 service and 10 Factory tests. The HTTP suite uses actual
Express with a mocked service; the service suite uses an injected fake database.
The initial HTTP attempt was blocked by local connection permissions; all tests
passed on the permitted rerun without a code change. See
[the dated execution summary](2026-10-18-final-review-verification.md).
No live Supabase query or frontend E2E journey was executed during this review;
actual SQL execution, persisted data, browser acceptance and performance require
their own evidence against the final integrated revision.
