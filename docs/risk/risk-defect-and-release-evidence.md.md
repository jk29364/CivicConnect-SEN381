# Milestone 3 Documentation Contributions


**Portfolio:** Data, Persistence, Risk, and Reliability

---

## Section 8: Defect Register (Milestone 3 Additions)

| Defect ID | Description | Root Cause | Resolution & Mitigation | Status |
| :--- | :--- | :--- | :--- | :--- |
| **DEF-M3-01** | Database migration script failed with authentication error. | Unescaped special characters (e.g., `*`) in the Supabase password broke the connection string parser. | URL-encoded special characters (e.g., replaced `*` with `%2A`) inside the local `.env` file. | Closed |
| **DEF-M3-02** | Server crashed on boot with `ERR_MODULE_NOT_FOUND`. | Inconsistent ES6 module imports and mismatched directory paths after flattening the repository folder structure. | Corrected relative paths and ensured all local module imports explicitly included the `.js` extension. | Closed |
| **DEF-M3-03** | Peer environments failed to execute database scripts due to missing modules. | The `pg` PostgreSQL driver was installed locally but not saved to the project blueprint. | Executed `npm install pg`, updated `package.json` and `package-lock.json`, and pushed to the remote repository. | Closed |

---

## Section 9: Risk Register (Milestone 3 Updates)

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **RSK-M3-01** | **Lost Updates:** Concurrent access by staff members could overwrite status changes on the same ticket. | Medium | High | Implemented Optimistic Concurrency Control (OCC). A `version` integer is checked and incremented during updates; stale versions are rejected. |
| **RSK-M3-02** | **Partial Audit Logs:** Server crashes mid-update could leave a status changed without a corresponding history log. | Low | High | Enforced strict ACID compliance. The status change and `request_history` insertion execute within a single atomic PostgreSQL transaction that rolls back on any failure. |
| **RSK-M3-03** | **Deployment Drift:** The production database schema falls out of sync with the local development environment. | Medium | Medium | Established strict infrastructure-as-code principles via `migrate.js` to ensure the schema is reproducible and version-controlled. |

---

## Section 10: Residual Risk Statement

**M3 Residual Risk:** 
While the persistence layer now guarantees data integrity and atomic state transitions at the database level, a residual risk remains regarding client-side desynchronization. Because the system currently relies on an in-app stub rather than real-time WebSockets for dashboard notifications (deferred per M3 scope), a staff member's browser may display stale data until manually refreshed. If they attempt an update on this stale view, the OCC transaction boundary will correctly block the data loss, but the resulting error may cause user friction. Future milestones will need to address this via automated state invalidation on the frontend.

---

## Release Evidence Summary (Task T2)

### 1. Persistence & Transaction Integrity (ASR-2, FR-002)
*The following execution log verifies that the PostgreSQL schema deployed successfully and that atomic transactions with OCC correctly prevent lost updates and invalid state transitions.*

```text
====== STARTING CIVICCONNECT PERSISTENCE MIDDLEWARE TESTS ======
 ✅ TC-DB-001: PASSED (Valid transition logged, version incremented natively)
 ✅ TC-DB-002: PASSED (Invalid state transition rolled back, no partial data)
 ✅ TC-DB-003: PASSED (Stale OCC update rejected with concurrency conflict)

====== TEST EVIDENCE EXECUTION SUMMARY ======
Total Executed Checkpoints: 3
Total Successful Passes: 3 / 3
[INFO] CRITICAL RELEASE CRITERIA SATISFIED SUCCESSFULLY.
```

### 2. Performance Load Testing (NFR-005)
*The following Autocannon load test verifies that the dashboard list endpoint (`GET /api/requests`) maintains an average latency of under 3 seconds when subjected to 100 concurrent connections across 1,000 seeded database rows.*

```text
====== AUTOCANNON LOAD TEST EVIDENCE ======
```

![Autocannon Load Test Results](./images/AutocanonEvidence.jpeg)