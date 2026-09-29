# Architecture Alternatives and Decision
## Architecture Alternatives
### Alternative A: Backend Monolith with Layered Architecture + REST API Boundary
#### Structural allocation
- Single backend codebase deployed as one runtime process.
- Clear internal layering: Presentation (API endpoints) -> Application/Service Layer (domain logic, patterns) -> Persistence layer (database access, transactions).
- React frontend decoupled via REST API boundary (independent deployment, own build/test cycle).
- Supabase PostgreSQL handles all data persistence.

#### Advantages
1. Deployment simplicity - there is one backend service to deploy
2. In-progress efficiency - service layers, factories, observers and domain logic live in shared memory; no serialisation overhead between components.
3. Clear pattern application - Observer and Factory patterns execute at the application layer level; not complicated by network boundaries.
4. ASR-1 (Auth/RBAC) - Central middleware in the API layer validates every request; single source of truth for identity and authorisation
5. ASR-2 (Immutable history) - transactional boundary (ACID) wraps status update and audit append inside one database transaction; simple to reason about.
6. ASR-3 (Severity prioritisation) - Observer pattern notifies dashboard/audit consumers when status changes; no calls needed.
7. ASR-4 (Performance) - Query planning and indexing centralised; no network round-trips between backend services.

#### Limitations
1. Frontend and backend tightly coupled at the code level if boundaries are not respectedl requires discipline.
2. Horizontal scaling of the backend is harder (all features scale together, not independently)
3. If future requirements demand a mobile app or external integrations, the monolith does not split easily without refactoring.

### Alternative B: Distributed Microservices Architecture
#### Structural allocation
- Multiple independent backend services: Request Service (submission, status, updates), Notification Service (resident alerts), Reporting Service (dashboard/agent queries), Audit Service (history logging).
- Each service has its own database (polygot persistence), deployed independently.
- Frontend -> API gateway -> [Services] via HTTP/gRPC.
- Supabase and/or alternative datastores for each service's data model

#### Advantages
1. Separation of concerns - Each service owns one responsibility; changes to notification logic do not touch request logic.
2. Independent scaling - If the dashboard queries spike, scale the Reportnig Service without scaling the Request Service.
3. Team parallelisation - Each team member could own one service; less merge conflict risk.
4. Flexibility for future volution - Easier to extract and replace individual services as requirements change.

#### Limitations
1. Deployment and testing complexity - Multi-service orchestration, container management, environment parity across services.
2. Network overhead - Inter-service communication introduce latency, partial failure risk ("fallacies of distribution"), and versioning burden (Assignment 2 link)
3. Data inregrity across services - Distribures transactions (status update and audit logging) are difficult without eventual consistency or saga patterns; undermines NFR-004 (immutable history guarantee).
4. Operational burden - Monitroing, logging, debugging across service boundaries requires infrastructure knowledge and observability tooling.
5. ASR-2 conflict - Ensuring atomic status update and audit append across separate services requires distributed-transaction complexity that contradicts the goal of simple, defensible correctness

## ASRs and Constraints Trade-off analysis
Dimension | ASR-1 (Auth/RBAC) | ASR-2 (Immutable History) | ASR-3 (Severity Prioritisation) | ASR-4 (Performance) | Schedule | Cost
| --- | --- | --- | --- | --- | --- | --- |
Monolith | Central auth middleware; single point entry | ACID transaction wraps both operations; no distributed complexity | Observer pattern executes locally; immediate notification | No inter-service latency; efficient queries | Deploy one service; simpler pipeline | One database; free tier plans sufficient
Microservices | Each service can authenticate; requires consistent auth scheme across services | Distributed transactions needed to guarantee atomicity across Request & Audit services; complex and risky | Service decoupling allows independent scaling; but introduces RPC latency | Inter-service HTTP calls add 10-100ms latency per status change; impacts list-view performance (ASR-4) | Requires containerisation, orchestration, multiple CI/CD pipelines; high cognitive overhead for team | Multiple database instances; Premium subscription might be necessary to cover all services

## Architecture Decision
**Chosen architecture:** Backend Monolith with Layered Architecture + REST API Boundary

### Rationale:
1. **ASR-2 (Immutable History) is the constraining driver.** Any distributed-transaction solution introduces failure modes where a status update commits but te audit append falls, or vice versa. A monolith backend wth a single ACID transaction eliminates this risk entirely. 
2. **Efficiency for software engineering team and schedule.** A single codebase with clear layer separation is more efficient to coordinate, test, and deploy than managing service boundaries, container images, and inter-service networking.
3. **The ASRs all resolve cleanly in a monolith.** The Authentication/RBAC lives in API middleware. Observer pattern for severity notification executes in-progress; queries are local and fast.
4. **React + API already decouples frontend.** The frontend is independent; changes to backend business logic do not force frontend recomplication. 
5. **Layering prevents coupling erosion.** Discipline in layer boundaries (API -> Service -> Persistence) ensures that if microservices become necessary later (future multi-tenant support, per Forward Engineering Consideration FEC-1), the monolith's layer structure is already in place for extraction. 

## Architecture Decision Record (ADR)

**ADR-ARCH-001: Backend Monolith with Layered Architecture**

| Field | Content |
|-------|---------|
| **Status** | Accepted (M2 Baseline) |
| **Context** | CivicConnect requires a service-request platform for a 50–100 unit residential complex. Four architecturally significant requirements (ASRs) drive decisions: <br> • ASR-1: Central authentication and RBAC for resident/staff/agent access control <br> • ASR-2: Immutable request-status history (audit trail for body-corporate accountability) <br> • ASR-3: Real-time severity-based notification to multiple consumers <br> • ASR-4: List-view performance under normal load (< 3 seconds) <br><br> The team comprises 3 engineers with 1 semester to deliver. |
| **Alternatives Considered** | **Alt A (Chosen): Monolithic backend + layered structure** — Single backend process, clear layering (API → Service → Persistence), independent React frontend via REST API. <br><br> **Alt B (Rejected): Microservices** — Multiple independent services (Request, Notification, Reporting, Audit), each with own database. Rejected because: (1) distributed transactions violate ASR-2's immutability guarantee; (2) inter-service network overhead impacts ASR-4 performance; (3) operational complexity exceeds team capacity. |
| **Decision** | Adopt **Backend Monolith with Layered Architecture** for M2 and beyond. The single backend codebase is organized into three logical layers: <br><br> 1. **Presentation Layer** (API Endpoints) — Express.js or equivalent HTTP server, request/response serialization, middleware for authentication/logging. <br> 2. **Application/Service Layer** — Domain logic, state machines, business rules, patterns (Observer for notifications, Factory for request creation). <br> 3. **Persistence Layer** — Data access objects (DAOs) or query builders, transaction management, Supabase PostgreSQL integration. <br><br> Frontend (React) communicates exclusively via REST API; no direct database or backend-service access. |
| **Rationale** | • **Immutable history guarantee (ASR-2):** ACID transactions in the monolith wrap status update + audit append as a single atomic unit. No distributed-transaction complexity; risk of partial failure is eliminated. <br> • **Auth/RBAC (ASR-1):** Central authentication middleware in the API layer ensures every request is validated; single source of truth. <br> • **Severity notification (ASR-3):** Observer pattern subscribers (notification, dashboard, audit) are notified synchronously within the same process; no RPC latency or serialization. <br> • **Performance (ASR-4):** All queries execute locally within the backend process; no inter-service latency. Index design and query optimization are centralized. <br> • **Schedule & team capacity:** Single deployment target, one CI/CD pipeline, no container orchestration or service-mesh overhead; achievable by 3 engineers in 1 semester. <br> • **Cost:** Monolithic backend + Supabase PostgreSQL fits within free-tier constraints (R-004 Risk Register). <br> • **Working assumptions on technology:** Supabase PostgreSQL and React are treated as working assumptions at this architectural stage, based on preliminary compatibility with the layered structure and ree-tier cost constraints (R-004). These are formally evaluated against alternatives and confirmed in §5.5 (Technology Stack Selection); this ADR's architecture decision (monolith vs. microservices) holds independently of that confirmation. |
| **Consequences** <br> (Downstream Effects) | • **Deployment:** One backend service to maintain and monitor; simpler operational complexity. <br> • **Scaling:** Horizontal scaling of the backend requires scaling all components together. If future load isolates to the dashboard or notification logic, independent scaling becomes harder; acceptable for current scope. <br> • **Layer discipline:** The success of this architecture depends on strict adherence to layer boundaries. Violations (API layer reaching directly into Persistence, or Service layer making assumptions about REST representation) will create coupling debt. <br> • **Future multi-tenancy (FEC-1):** If Wonderpark Estates requests multi-tenant support, the monolith's layered structure is already in place for service extraction; however, data isolation (separate databases per tenant vs. row-level filtering) will require additional architectural review at that time. <br> • **Integration with external systems (FEC-7):** If Wonderpark Estates later requires integration with external estate access-control systems, the REST API boundary already supports this. External clients call `/api/requests/...` endpoints; no backend restructuring is needed. |
| **Related Decisions** | • **ADR-DP-001** (Observer for status-change notification): Leverages monolith's in-process execution model. <br> • **ADR-DP-002** (Factory for request creation): Centralizes category-specific logic within the Service Layer; benefits from monolithic structure. <br> • **ADR-DATA-001** (ACID transactions for status + audit): Core assumption of this architecture; distributed services would require alternative concurrency strategy. <br> • **ADR-INT-001** (REST API for submission interface): Frontend–backend boundary; REST API remains the external contract regardless of internal monolith structure. |
| **Verification & Evidence (M2)** | ✓ M2 §5.3 Architecture diagrams show API → Service → Persistence layering. <br> ✓ M2 §5.6 Design Decision records (ADR-DP-001, ADR-DP-002) reference this monolith structure. <br> ✓ M2 §5.4 Data & Persistence Baseline includes transaction boundary examples showing status update + audit append wrapped in one BEGIN/COMMIT block. <br> ✓ GitHub repository structure reflects the three layers: `/src/api`, `/src/services`, `/src/persistence`. <br> ✓ Sample code or pseudo-code in M3 demonstrates layer separation and transaction usage. |

---

## Architecture Diagram (Conceptual)

```
┌──────────────────────────────────────────────────────────────────┐
│                    Frontend (React)                              │
│              (Independent Deployment, SPA)                       │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                   HTTP/REST/JSON
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│                   BACKEND MONOLITH (Node.js / Express)            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         API Presentation Layer (Express)                 │   │
│  │  • POST /api/requests (submission)                       │   │
│  │  • GET /api/requests/:id (view status)                   │   │
│  │  • PUT /api/requests/:id/status (update status)          │   │
│  │  • Auth middleware, request validation                   │   │
│  └─────────────────────┬──────────────────────────────────┘   │
│                        │                                         │
│  ┌─────────────────────▼──────────────────────────────────┐   │
│  │   Application/Service Layer                             │   │
│  │  • RequestService (domain logic, state machines)        │   │
│  │  • Observer pattern (notify on status change):          │   │
│  │    - ResidentNotificationObserver (FR-004)              │   │
│  │    - DashboardCountsObserver (FR-008)                   │   │
│  │    - AuditHistoryObserver (NFR-004)                     │   │
│  │  • RequestFactory (category-specific validation)        │   │
│  │  • Transaction management (begin/commit/rollback)       │   │
│  └─────────────────────┬──────────────────────────────────┘   │
│                        │                                         │
│  ┌─────────────────────▼──────────────────────────────────┐   │
│  │  Persistence Layer (Data Access Objects / Query Builders)  │
│  │  • ACID transaction boundaries                          │   │
│  │  • Status updates + audit history appends (atomic)      │   │
│  │  • Optimistic concurrency control (version check)       │   │
│  │  • Index strategy for performance (ASR-4)               │   │
│  └─────────────────────┬──────────────────────────────────┘   │
│                        │                                         │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                    Supabase PostgreSQL
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│              Database (Tables, Indexes, Constraints)             │
│  • ServiceRequest (ID, Status, Severity, Category, AssignedTo…)  │
│  • RequestHistory (ID, RequestID, OldStatus, NewStatus, Actor…)  │
│  • User (ID, Role: Resident | Staff | Agent, Complex…)          │
│  • Indexes on Status, Severity, Category for query performance   │
└─────────────────────────────────────────────────────────────────┘
```

---