# §9 — End-to-End Trace: FR-001 (Resident Submits Request)

## Overview

This section traces **FR-001** (Resident shall submit a request with category, description, and unit/location) through every layer of the M2 engineering baseline: from requirement statement through ASRs, architecture responsibility, data decisions, design patterns, technology choices, actual application code structure, and initial verification evidence.

By end of M3, the test code shown here will be implemented; by M2, the structure and mock tests demonstrate that the team understands *how* FR-001 will be built and *what* verification will prove it works.

---

## 1. Requirement Statement

**ID:** FR-001  
**Type:** Functional  
**Requirement:** Resident shall submit a request with category (Maintenance/Security/Common Area/Lost Property), description, and unit/location.  
**Source:** Resident capability (M1 Stakeholder Analysis)  
**Priority:** High  

**Acceptance Criteria (from M1):**
> Given a logged-in resident, when they submit a request with category, description, and unit/location completed, then the system creates a request with status "New", a unique reference number, and default severity "Low" unless otherwise selected.

**Why This Matters:**
- FR-001 is the **entry point** for all service requests; without submission, nothing else happens.
- It touches **all architectural layers:** API (user submission) → Service (domain logic) → Persistence (database storage).
- It demonstrates **both the Factory pattern (ADR-DP-002)** and **foundational data integrity (ASR-1 & ASR-2)**.

---

## 2. Architecturally Significant Requirements (ASRs) Driving FR-001

### ASR-1: Centralized Authentication & RBAC
**Statement:** Only authenticated residents/staff shall access request details containing unit numbers or personal info.

**FR-001 Implication:** 
- The API endpoint `POST /api/requests` must validate that the caller is an authenticated resident.
- The resident's identity (from JWT token or session) is extracted and stored as `submittedBy` on the request.
- No request can be created without authentication; unit numbers are never exposed to unauthenticated users.

**Design Decision:** Middleware in the API layer (before RequestService.create() is called) validates the request bearer token and extracts the resident ID.

---

### ASR-3: Severity-Based Prioritization & Real-Time Notification
**Statement:** Safety-critical requests flagged "High" severity shall be visibly distinguished from routine requests in the staff queue.

**FR-001 Implication:**
- Every request has a severity field (Low/Medium/High; defaults to "Low" per acceptance criteria).
- The ServiceRequest table includes a `severity` column with enum constraint.
- When a resident submits a request with severity="High", it is immediately visible in the staff queue (via Observer pattern, handled in ADR-DP-001).

**Design Decision:** Base Request class (ADR-DP-002, Factory) defaults severity to "Low" unless resident explicitly sets it; API layer accepts optional `severity` parameter.

---

## 3. Architecture Responsibility (Per ADR-ARCH-001: Monolith with Layered Structure)

FR-001 execution flows through three architectural layers:

### **3.1 Presentation Layer (API Boundary)**

**Responsibility:** HTTP request/response handling, input validation, authentication.

**Component:** `/src/api/requestController.js`

**What FR-001 Proves Here:**
- ✓ Endpoint exists and is protected by authentication middleware.
- ✓ Payload is validated (category, description, location required).
- ✓ Request is passed to the Service Layer.
- ✓ Response includes the created request (with reference number, status, etc.).

---

### **3.2 Application/Service Layer (Domain Logic)**

**Responsibility:** Business logic, state transitions, pattern application (Factory + Observer).

**Component:** `/src/services/RequestService.js`

**What FR-001 Proves Here:**
- ✓ Factory pattern is applied: `factory.create(category, payload)` encapsulates category-specific logic.
- ✓ Severity defaults to "Low" (per acceptance criteria).
- ✓ Immutable fields are set: status="New", createdAt, unique ID.
- ✓ Observers are notified for high-severity requests (ASR-3).

---

### **3.3 Persistence Layer (Data Access & Transactions)**

**Responsibility:** Database operations, transaction management, ACID guarantees.

**Component:** `/src/persistence/RequestDAO.js` (or Supabase client wrapper)

**What FR-001 Proves Here:**
- ✓ ServiceRequest table exists with all required fields.
- ✓ Severity column has enum constraint; defaults to "Low" at database level (defense in depth).
- ✓ Unique reference number is generated (via trigger or application logic).
- ✓ Status defaults to "New".
- ✓ Indexes on severity and status support ASR-4 (performance) and ASR-3 (prioritization).

---

## 4. Data Decision (Link to ADR-DATA-001)

**From ADR-DATA-001:**

> The ServiceRequest entity owns requests submitted by residents. Each request is immutable once created; status transitions are appended as separate history records (NFR-004). Severity is an enum with three values (Low, Medium, High) and defaults to Low at both application and database levels.

**FR-001 Implication:**
- When FR-001 creates a request, the application layer (Factory) and database layer (table constraint) both enforce severity="Low" default.
- This is a **defense-in-depth principle:** if the application layer fails to set a default, the database does it anyway.
- The request is immutable; future status changes are handled by FR-002 (updates) + ADR-DP-001 (Observer notifications).

**Traceability:**
- Requirement → RTM → ADR-DATA-001 → Database schema (DDL above) → Test (§5 below)

---

## 5. Design Pattern Decision (Link to ADR-DP-002: Factory Pattern)

**From ADR-DP-002:**

> The Factory pattern (RequestFactory) encapsulates category-specific creation logic. Each category (Maintenance, Security, CommonArea, LostProperty) has its own RequestCreator subclass, which validates category-specific fields and instantiates the appropriate Request subclass.

**FR-001 Implication:**
- When a resident submits a request with category="Maintenance", RequestFactory.create("Maintenance", payload) is called.
- The Factory looks up MaintenanceRequestCreator and delegates to it.
- MaintenanceRequestCreator validates Maintenance-specific fields (e.g., faultType) and instantiates MaintenanceRequest (extends Request).
- The base Request class (parent of all category-specific classes) applies the severity default ("Low").

**Code Structure:**

**What FR-001 Proves Here:**
- ✓ Category-specific creation is encapsulated in Factory.
- ✓ Base Request class enforces severity default.
- ✓ Each creator validates its category-specific fields.
- ✓ Open/Closed Principle: adding a new category means adding a new RequestCreator; existing code is not modified.

---

## 6. Technology Decision (Link to Tech Stack ADR)

**From Tech Stack ADR (Done by you + Johni, §5.5):**

- **Frontend:** React SPA (form submission, client-side validation)
- **Backend:** Node.js + Express.js (HTTP API, middleware, service orchestration)
- **Database:** Supabase PostgreSQL (ACID transactions, enum constraints, row-level security)

**FR-001 Implication:**
- React form on `/submit-request` page; user fills category, description, location, optional severity.
- Form validation (React) checks required fields; optional `severity` defaults to nothing (API defaults it to "Low").
- POST to `/api/requests` (Express endpoint) with `Authorization: Bearer <token>` header.
- Express middleware authenticates request; Express router calls requestController.
- RequestController → RequestService → RequestFactory → DB.
- Response: 201 Created with full request object (id, referenceNumber, status, severity, etc.).

---

## 7. Application Artefacts (Code Skeleton Evidence)

By M2, the following files exist in the repository with structure/skeleton code:

| Module | Path | Evidence |
|--------|------|----------|
| API Controller | `/src/api/requestController.js` | `POST /api/requests` endpoint skeleton; authenticateResident middleware; validateRequestPayload; delegates to RequestService.createRequest() |
| Request Service | `/src/services/RequestService.js` | `createRequest(payload)` method; instantiates Factory; calls Persistence; notifies Observers |
| Request Factory | `/src/services/RequestFactory.js` | `create(category, payload)` method; registry mapping category → creator; delegates to correct creator |
| Base Request Class | `/src/services/requestTypes/Request.js` | Constructor with severity default ("Low"); status default ("New"); abstract validate() method |
| Maintenance Request | `/src/services/requestTypes/MaintenanceRequest.js` | Extends Request; adds faultType field; implements validate() |
| Security Request | `/src/services/requestTypes/SecurityRequest.js` | Extends Request; adds incidentTime, threatLevel fields; implements validate() |
| Common Area Request | `/src/services/requestTypes/CommonAreaRequest.js` | Extends Request; adds affectedArea field; implements validate() |
| Lost Property Request | `/src/services/requestTypes/LostPropertyRequest.js` | Extends Request; adds itemDescription, dateLastSeen fields; implements validate() |
| Request DAO | `/src/persistence/RequestDAO.js` | `saveRequest(request)` method; wraps Supabase insert; returns persisted object |
| Database Migration | `/db/migrations/001_create_service_request.sql` | CREATE TABLE ServiceRequest with all columns, constraints, indexes |
| API Tests | `/test/api/requests.test.js` | Test stubs for POST /api/requests endpoint |
| Service Tests | `/test/services/RequestService.test.js` | Test stubs for createRequest() method |
| Factory Tests | `/test/services/RequestFactory.test.js` | Test stubs for Factory.create() and category-specific logic |

**GitHub Evidence:**
- Progressive commits on feature branch (e.g., `docs/m2-section-4-architecture`).
- Pull Request showing these files being added/modified with peer review comments.
- Each file has docstrings explaining its role in FR-001.

---

## 8. Initial Verification Evidence (Test Titles)

This section shows the tests that *will be implemented* in M3. M2 includes test structure and pseudocode to prove the team understands *how* FR-001 will be verified.

### **Test Suite 1: Factory Pattern & Severity Default**

**Test File:** `/test/services/RequestFactory.test.js`

**Test Purpose:** Verify that RequestFactory.create() applies severity default ("Low") per ADR-DP-002.

---

### **Test Suite 2: API Endpoint (Request Submission)**

**Test File:** `/test/api/requests.test.js`

**Test Purpose:** Verify that POST /api/requests endpoint handles FR-001 submission correctly, including authentication and response format.

---

### **Test Suite 3: Service Layer (RequestService.createRequest)**

**Test File:** `/test/services/RequestService.test.js`

**Test Purpose:** Verify that RequestService.createRequest() orchestrates Factory, Persistence, and Observers correctly.

---

### **Test Suite 4: Database & Persistence**

**Test File:** `/test/persistence/RequestDAO.test.js`

**Test Purpose:** Verify that DAO persists request to Supabase with correct schema, defaults, and constraints.

---

## Summary: How FR-001 is Verified

By end of M3, these tests will be **implemented in full** (not mocks). The M2 test titles and purpose descriptions above demonstrates:

1. ✓ **Factory correctly applies severity default** — Test Suite 1
2. ✓ **API endpoint handles submission, authentication, and response** — Test Suite 2
3. ✓ **Service layer orchestrates Factory, Persistence, Observers** — Test Suite 3
4. ✓ **Database schema enforces constraints and uniqueness** — Test Suite 4

**Coverage:**
- **Happy path:** Resident submits valid request → system creates with status="New", severity="Low", unique ref#.
- **Negative paths:** Missing fields, unauthenticated access, duplicate ref#, invalid enum values.
- **Pattern application:** Factory delegates correctly; Observers notify for high-severity; ACID transaction wraps persistence.