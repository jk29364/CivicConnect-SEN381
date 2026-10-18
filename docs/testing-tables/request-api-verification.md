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

**Verification performed in the working environment:**
23/23 controller and service unit tests passed using Node 22 and a temporary
stub only for package loading (PostgreSQL operations were simulated by the
injected fake database). The HTTP tests require the project's npm packages
and could not be run in this working environment because registry requests
failed with DNS `EAI_AGAIN`. Run `npm ci && npm test` in an environment with
access to npm and record the actual HTTP results. No live Supabase query was
performed, so SQL correctness and performance still require integration testing.
