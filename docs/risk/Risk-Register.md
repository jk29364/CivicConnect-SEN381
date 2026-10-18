# 2. Initial Project Risk Register (Wonderpark Estates)

## Finalisation review dated 18 October 2026

The original entries below are retained as project history. This dated review
qualifies their current treatment for the inspected backend revision
`93ce4a82a196411ed25b613924c35d32c0cc8619`; it does not certify uninspected frontend
work or a production release. Existing owners remain accountable.

| Existing ID | Review disposition | Evidence and remaining action |
| :--- | :--- | :--- |
| R-001 | Mitigated for the inspected backend; retained | Shared JavaScript runtime and 42 passing automated tests support component delivery. Frontend integration must still be completed. |
| R-002 | Open; production release concern | JWT/role checks and service scoping exist, but the full identity flow is not established. Database TLS disables certificate verification. Confirm final client access isolation and configuration. |
| R-003 | Retained for final human review | Individual contribution and workload must be supported by authentic commits, issues and reviews; no assessment of uninspected PR history is invented. |
| R-004 | Retained; cloud assumptions unvalidated | Local demonstration is planned. No measured hosted capacity, current tier entitlement or operating-cost result is claimed. |
| R-005 | Mitigated through existing declarations; residual review responsibility retained | AI register and signed declarations exist in `docs/declarations/`, including items 24–26. Current documentation support adds another entry; its team verification/approval remains pending. |
| R-006 | Active integration issue at review | Frontend work is ongoing. Current routes use `/api/requests`, status values include `InProgress`, and token issuance is not implemented here. Record final integrated acceptance results. |
| R-007 | Retained until defence | Each member must trace an authentic requirement and explain the combined product, decisions and limitations. Preparation is not recorded as completed without team confirmation. |
| R-008 | Open | Creation accepts severity, but no staff severity-edit operation is exposed. Do not claim implemented triage/reclassification. |
| R-009 | Open configuration concern | Active app uses unrestricted `cors()`, not the documented origin allow-list. Verify the intended client integration and restrict origins before public release; CORS is not authentication. |

The recommended position for the inspected baseline is local evaluation only
and no-go for production until the specific release concerns are resolved.
Team adoption and final environment details are recorded in the PED closure.
This decision does not remove incomplete scope from the original baseline.

## Historical register

*Scoring Model: Likelihood (Low, Med, High), Impact (Low, Med, High), Priority (Low, Med, High, Critical).*

| Risk ID | Risk Description | Root Cause | Probability | Impact | Priority | Mitigation Strategy | Contingency Plan | Owner | Status |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :---: | :---: |
| **R-001** | Team selects a technology stack in M2 that a member has not used before, slowing M3 delivery. | Uneven framework experience across team members. | Medium | High | **High** | [M2 Update] Selected Node.js/Express and React to maintain a unified JavaScript ecosystem, eliminating the need to learn Java/C#.  | Fall back immediately to a simpler, well-understood stack that all members can operate. | Jimmy | Mitigated / Reduced |
| **R-002** | Residents' unit numbers and personal details are exposed via unauthorized access or missing API boundaries. | Access control treated as an implementation afterthought rather than an architectural baseline. | Low-Med | High | **High** | Embed NFR-002 into the M1 baseline; explicitly design role-based access control (RBAC) in M2 architecture. | Restrict service request visibility to system administrators until authorization schemas pass verification. | Jimmy | Open |
| **R-003** | Uneven contribution across the three members damages team velocity and individual defence scores. | Asymmetric workloads, differing schedules, and lack of accountability. | Medium | Medium | **Medium** | Hold weekly check-ins; mandate visible commit/PR history on GitHub from Week 1 per team governance. | Reallocate baseline tasks early if work imbalance is detected during sprint reviews. | All | Open |
| **R-004** | Free-tier hosting and database limits are exceeded when simulated multi-unit estate data is loaded in M3. | Total reliance on free cloud tiers without profiling resource footprints. | Medium | Medium | **Medium** | [M2 update] Baselined PostgreSQL via Supabase (500MB storage, 200 connections). Express API must explicitly close idle connections. | Temporarily migrate workload to low-cost paid tiers or local containerized runners for demonstration. | Jimmy | Monitored |
| **R-005** | Unverified AI-generated code or analysis introduces hidden security vulnerabilities or brittle logic. | Time pressure leading to unreviewed acceptance of AI assistance. | Medium | High | **High** | Enforce protected main with the 2-reviewer PR rule; log every material AI contribution in the AI Usage Register. | Revert the AI-assisted commit; manually re-engineer the component from first principles. | All | Open |
| **R-006** | Frontend and backend integration fails due to mismatched assumptions regarding ticket status-transition rules. | Domain logic and valid state transitions not agreed upon prior to parallel development. | Medium | Medium | **Medium** | Formalize state-transition matrices (FR-002) in the PED before any implementation begins in M2/M3. | Rework the affected API endpoints and log the corrective decision in the Engineering Decision Log. | Karabo | Open |
| **R-007** | Role specialization leads to siloed knowledge ("I only know my section"), hurting individual defence marks. | Lack of cross-reviewing teammates' controlled artefacts. | Medium | High | **High** | Conduct weekly peer walkthroughs where each member explains another member's section back to the group. | Run targeted 1-on-1 mock defence sessions prior to milestone assessment presentations. | All | Open |
| **R-008** | Residents abuse the "High" severity flag to artificially expedite routine non-urgent maintenance requests. | Absence of validation controls on resident self-assigned priority. | Medium | Medium | **Medium** | Implement staff triage controls (FR-002/FR-007) allowing managing agents to reclassify ticket severity on review. | Introduce an audit "severity disputed" status flag in future iterations if triage data indicates persistent misuse. | Jimmy | Open |
| **R-009** | Frontend/Backend CORS API Integration Failures. | Decoupled monolith architecture requires explicit cross-origin permissions. | Medium | Medium | **Medium** | The Express backend bootstrap must explicitly configure cors middleware to accept traffic from authorized frontend ports. | Utilize a local proxy configuration in the frontend build tool during M2 development. | Jimmy | Active |

