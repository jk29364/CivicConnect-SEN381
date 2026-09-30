# Initial Design Decisions
## Overview
The two CivicConnect design problems were identified in Assignment 2, which were "Notifying multiple parties/users when a request’s status changes" and "Creating different types of service requests different validation rules". This section records the final Milestone 2 design-pattern decision for each, with evidence of how they will be applied in the architecture and sata layers established in earlier sections/

## ADR-DP-001: Observer Pattern for Status-Change Notification
**Design problem 1: Notifying multiple parties/users when a request’s status changes**

**Problem statement**
When a staff member updates a service request's status, several independent concerns must react simultaneously - the resident submitting a request must receive an in-app notification (FR-004), the managing agent's dashboard must update (FR-008), and an immutable, timestamped audit-history record must be appended (NFR-004)

**Couplin risk** - If the Service Layer's status-update logic called each of these consumers directly and explicitly:

**pseudo**
`\`\`
function updateStatus(requestId, newStatus): 
request.status = newStatus 
notificationService.notifyResident(request) 
dashboardService.updateCounts(request) 
auditService.logStatusChange(request) 
`\`\`

**the core request-handling module becomes tightly coupled to every current consumer. Adding a future SMS notifyer or body-corporate reporting feed require modifying the same transactional code path, which violates the Open/Closed Principle and threatening ASR-2**

**Why This Matters:** 
- **ASR-2 (Immutable History)** is jeopardized: if the Service Layer knows about all consumers, then adding a new consumer means re-touching the status-update 
transaction, introducing risk ofregression. 
- **ASR-1 (Centralized RBAC)** is harder to maintain: authorization logic for each consumer becomes dispersed. 
- **Testability suffers:** testing status-update logic in isolation is impossible ifit directly calls external services. 

### A2 Research Evidence — Alternatives 
**Alternative A (Chosen): Observer Pattern** 
Gamma et al. (1994) define the Observer pattern as "a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and 
updated automatically." 

In CivicConnect: 
- The Subject is the RequestService (the thing that changes). 
- The Observers are ResidentNotificationObserver, DashboardCountsObserver, and AuditHistoryObserver (the things that react). 
- When the Subject's status changes, it iterates through registered Observers and calls their update() method-each observer then handles its specific concern.

**Benefits:**  
1. Decoupling: RequestService knows nothing about what consumers exist or what they do. 
2. Open/Closed Principle: New consumers (e.g., SMS notifier) register as observers without modifying RequestService. 
3. Synchronous guarantee in monolith: Since all observers execute in the same process, status update + all notifications happen atomically (no distributed failure). 

**Trade-offs:** 
- Indirection: A reader unfamiliar with Observer must trace Subject/Observer registration to understand the flow. 
- Pattern overhead: Classes implementing the pattern become bound to each other (Subject ↔ Observer interface). McNatt & Bieman (2001) note this is "not free of coupling costs." 
- However: This overhead is proportionate given three known, stable observers (Resident, Dashboard, Audit).

**Supporting Evidence:** 
- Gamma et al. (1994): canonical definition and motivation. 
- McNatt & Bieman (2001): Observer is the most-frequent pattern in their 16-paper industrial dataset—empirical evidence it's a proven, non-exotic solution for this class ofproblem. 
- Martin (2000): "We frequently don't want the detector to know about the actor" (Sensor/Meter example, structurally identical to status/notifications).

### Alternative B (Rejected): Direct/Explicit Method Calls 
A single function that explicitly calls each consumer inline: 

**pseudo**
```
function updateStatus(requestId, newStatus): 
request.status = newStatus 
notificationService.notifyResident(request) // explicit call 
dashboardService.updateCounts(request) // explicit call 
auditService.logStatusChange(request) // explicit call
```

**Benefits:** 
- Simplest to write initially: straightforward control flow.
- No abstraction overhead: fewer classes, fewer indirections.

**Limitations:**
- Tight coupling: Core logic depends on concrete implementations of Notification, Dashboard, and Audit services.
- OCP violation: Adding a new consumer requires modifying this function (which is already tested and integrated).
- Fragility: Risk of regression if status-update logic is re-touched for a new consumer.
- Scatter: Different consumers' logic is mixed in one place; hard to test or reason about.

**Why Rejected:** Directly contradicts ASR-2 and the business need for a trustworthy audit trail.

## ADR-DP-001: Observer Pattern for Status-Change Notification

| Field | Content |
|-------|---------|
| **Status** | **Accepted (M2 Baseline)** |
| **Context** | FR-002 requires staff to update request status through controlled transitions. Three independent consumers must react: (1) resident notification (FR-004), (2) dashboard counts (FR-008), (3) audit history append (NFR-004). Direct method calls would couple status logic to all consumers, threatening ASR-2 (immutable history) and violating Open/Closed Principle. |
| **Alternatives Considered** | **A (Chosen): Observer Pattern** — RequestService as Subject; three Observers register at initialization (ResidentNotificationObserver, DashboardCountsObserver, AuditHistoryObserver). Subject iterates observers on status change, each handles its concern independently. <br><br> **B (Rejected): Direct Method Calls** — Status-update function calls each consumer inline; simpler initially but couples logic, violates OCP, requires modification for new consumers. |
| **A2 Research Evidence** | • Gamma et al. (1994): formal Observer definition and motivation. <br> • McNatt & Bieman (2001): Observer is most-frequent pattern in 16-paper industrial dataset; proven solution for this class of problem. <br> • Martin (2000): "detector should not know about actor" principle; Sensor/Meter example structurally identical to status/notifications. |
| **Decision** | **Adopt Observer pattern within the Service Layer (per ADR-ARCH-001).** <br><br> RequestService extends/implements Subject role. Three observer instances register at service initialization: <br> • ResidentNotificationObserver (invokes FR-004 notification) <br> • DashboardCountsObserver (updates FR-008 counts) <br> • AuditHistoryObserver (appends NFR-004 history) <br><br> On `updateStatus(requestId, newStatus)` call, RequestService notifies all registered observers synchronously. |
| **Rationale** | • **Protects ASR-2:** Transactional boundary (status + audit append) remains simple, isolated in AuditHistoryObserver; not mixed with notification/dashboard concerns. <br> • **Supports Open/Closed Principle:** New consumers register as observers without modifying RequestService. <br> • **Monolith advantage (ADR-ARCH-001):** In-process execution means status update + all notifications happen synchronously in same transaction; no distributed failure modes. <br> • **Centralised validation (ASR-1):** Observers can share authorization/validation context via Subject. |
| **Benefit** | Reduced coupling; extensibility without modification; synchronous atomicity in monolith; clear responsibility separation. |
| **Trade-off/Complexity** | Added indirection: unfamiliar readers must trace Subject/Observer registration. Pattern binding (Subject ↔ Observer interface) introduces its own coupling. **Acceptable:** Only three known, stable observers; coupling cost is proportionate to flexibility gained. |
| **Affected Modules** | `/src/services/RequestService.js` (Subject) <br> `/src/services/observers/ResidentNotificationObserver.js` <br> `/src/services/observers/DashboardCountsObserver.js` <br> `/src/services/observers/AuditHistoryObserver.js` |
| **Implementation Guidance** | • RequestService maintains `observers: Observer[]` list. <br> • Each observer implements `update(request, oldStatus, newStatus): void`. <br> • RequestService.updateStatus() → updates mutable status field → calls `notifyObservers(request, oldStatus, newStatus)` → iterates observers, calling each `update()`. <br> • All observers execute in same transaction (per ADR-DATA-001, Johni's section §5.4). |
| **Related Decisions** | • **ADR-ARCH-001** (monolith enables in-process notification; if architecture changed to microservices, Observer would become event-bus/message-queue pattern). <br> • **ADR-DATA-001** (AuditHistoryObserver's transaction boundary wraps status + audit append atomically). <br> • **ADR-DP-002** (Factory creates requests; Observer notifies when created requests transition status). |
| **Verification & Evidence (M2)** | ✓ Pseudo-code or class-diagram showing Subject/Observer structure. <br> ✓ Code skeleton: `/src/services/RequestService.js`, `/src/services/observers/*.js`. <br> ✓ RTM entries (FR-002, FR-004, FR-008, NFR-004) link to this ADR. <br> ✓ **Step 3 (Application Evidence):** Actual implementation or mock data showing observer registration and notification flow. |

# STEP 2 — ADR-DP-002: Factory Pattern for Request Creation

## Design Problem 2 — Creating Different Request Categories with Different Validation

**Problem Statement (from A2 Task 1):**

Wonderpark Estates' requests fall into four categories (Maintenance, Security, Common Area, Lost Property—FR-001), each potentially requiring different fields or validation:
- A **Security** request might require an incident time and threat level.
- A **Lost Property** request might require a "date last seen" and item description.
- A **Maintenance** request requires location and fault type.
- A **Common Area** request requires affected area and impact on residents.

**The Conditioning Risk:** Handling this with a single large conditional block:
```pseudo
function createRequest(category, payload):
    if category == "Maintenance":
        validateMaintenanceFields(payload)
        request = new MaintenanceRequest(payload)
    else if category == "Security":
        validateSecurityFields(payload)
        request = new SecurityRequest(payload)
    else if category == "CommonArea":
        validateCommonAreaFields(payload)
        request = new CommonAreaRequest(payload)
    else if category == "LostProperty":
        validateLostPropertyFields(payload)
        request = new LostPropertyRequest(payload)
    return request
```
This creates the same maintenance burden Martin (2000) illustrates with Modem branching: "programs designed this way tend to be littered with similar if/else or switch statements. Every time anything needs to be done to [it]… [the code] must be scanned for all these selection statements" whenever a new type is introduced.

**Why This Matters:**
- **ASR-1 (Centralized RBAC) suffers:** Validation logic is scattered across conditional branches; inconsistent validation per category is hard to spot and audit.
- **Testability regresses:** Testing the validation for one category in isolation requires mocking or bypassing the entire conditional.
- **Fragility:** Adding a new category (e.g., "Parking Violation") requires finding and modifying this exact conditional—risk of regression.
- **Violates Open/Closed Principle:** Extension (new category) requires modification (adding a new branch).

## A2 Research Evidence — Alternatives

**Alternative A (Chosen): Factory Pattern**

Gamma et al. (1994) define the Factory Method pattern as "an interface for creating an object, but let subclasses decide which class to instantiate."

In CivicConnect:
- **RequestFactory** (Creator) defines the interface: `create(category, payload): Request`.
- **Concrete creators** (one per category) implement the interface: `MaintenanceRequestCreator`, `SecurityRequestCreator`, etc.
- Each creator encapsulates category-specific validation and instantiation.

**Benefits:**
1. Centralization: Category-specific logic is isolated in one place (one class per category).
2. Open/Closed Principle: Adding a new category means creating a new creator class, not modifying existing logic.
3. Testability: Each creator can be unit-tested independently.
4. Consistency: Validation rules per category are colocated and easier to audit.

**Trade-offs:**
- Indirection: One factory interface + one class per category (4 classes for 4 categories) versus one conditional function.
- Setup overhead: More boilerplate than a simple if/else.
- Justification: Only necessary if category set is expected to *grow or gain new rules*. For a fixed, unchanging set, a conditional is simpler.

**Supporting Evidence (A2 Task 1):**
- Gamma et al. (1994): canonical Factory definition.
- Martin (2000): Modem/LogOn example—"additional modems will not cause the LogOn function to change"—directly analogous to new request categories not requiring modification of existing creation logic.
- Freeman & Robson (2004): OCP cost/benefit framing—"added structure now, in exchange for not needing to modify tested code later."
- Scope Baseline (M1): Already mentions category-specific rules (e.g., Security ≠ Lost Property), confirming growth is expected.


**Alternative B (Rejected): Conditional/If-Else Creation Logic**

A single function branching per category, applying validation inline:
```pseudo
function createRequest(category, payload):
    if category == "Maintenance": [validation] else if...
```

**Benefits:**
- Simplest to write: straightforward control flow.
- No abstraction: fewer classes.

**Limitations:**
- Violates Open/Closed Principle: New categories require modification.
- Fragility: Changes to one category's validation risk breaking others.
- Testability: Hard to test category validation in isolation.
- Scatter: Category logic is mixed in one place.

**Why Rejected:** Scope Baseline confirms category-specific rules already differ, and future scope hints at more categories. Factory is the correct investment.

## ADR-DP-002: Factory Pattern for Request Creation

| Field | Content |
|-------|---------|
| **Status** | **Accepted (M2 Baseline)** |
| **Context** | FR-001 requires residents to submit requests with category (Maintenance, Security, Common Area, Lost Property). Each category has or may have different validation rules. A single conditional branching on category would violate Open/Closed Principle and scatter validation logic, threatening ASR-1 (centralized validation) and making future category additions fragile. |
| **Alternatives Considered** | **A (Chosen): Factory Pattern** — RequestFactory.create(category, payload) produces the correct category-specific request object. Each category's validation is encapsulated in its own creator (MaintenanceRequestCreator, SecurityRequestCreator, etc.). New categories are added by introducing a new creator. <br><br> **B (Rejected): Conditional/If-Else** — Single function branching per category inline. Simplest initially but violates OCP, scatters logic, requires modification for new categories. |
| **A2 Research Evidence** | • Gamma et al. (1994): formal Factory Method definition and intent. <br> • Martin (2000): Modem/LogOn OCP example—"additional modems will not cause the LogOn function to change"—directly analogous to request categories. <br> • Freeman & Robson (2004): OCP cost/benefit trade-off; added structure now vs. modification cost later. <br> • M1 Scope Baseline: Category-specific rules already differ (e.g., Security request ≠ Lost Property request); growth expected. |
| **Decision** | **Adopt Factory pattern within the Service Layer (per ADR-ARCH-001).** <br><br> RequestFactory provides `create(category, payload): Request` method. Four concrete creators implement category-specific creation: <br> • MaintenanceRequestCreator <br> • SecurityRequestCreator <br> • CommonAreaRequestCreator <br> • LostPropertyRequestCreator <br><br> Each creator encapsulates category-specific validation, field requirements, and default values (e.g., FR-011: severity defaults to "Low" unless explicitly set). |
| **Rationale** | • **Supports ASR-1:** Validation logic is centralized per category; consistent, auditable validation rules. <br> • **Open/Closed Principle:** New categories or category rules are added by introducing new creators, not editing existing, tested logic. <br> • **Testability:** Each creator can be unit-tested independently, verifying category-specific rules in isolation. <br> • **Alignment with M1 Acceptance Criteria (FR-001):** "Resident shall submit request with category, description, and unit/location" + category-specific validation per scope baseline. |
| **Benefit** | Extensibility without modification; consistent, auditable validation; testability; clear category-specific responsibility allocation. |
| **Trade-off/Complexity** | Added indirection: one factory interface + one class per category. For a small, fixed category set, a conditional is simpler. **Justified:** Scope Baseline and future scope confirm categories are bounded but likely to grow or gain rules; Factory is the correct upfront investment. Gamma et al. (1993) caution: "pattern should only be applied when flexibility is needed"—flexibility is needed here. |
| **Affected Modules** | `/src/services/RequestFactory.js` (factory interface + router) <br> `/src/services/requestTypes/MaintenanceRequestCreator.js` <br> `/src/services/requestTypes/SecurityRequestCreator.js` <br> `/src/services/requestTypes/CommonAreaRequestCreator.js` <br> `/src/services/requestTypes/LostPropertyRequestCreator.js` <br> `/src/services/requestTypes/Request.js` (base class or interface) |
| **Implementation Guidance** | • RequestFactory maintains a registry: `creators: Map<string, RequestCreator>` mapping category → creator instance. <br> • Public API: `RequestFactory.create(category, payload): Request` looks up creator by category and delegates to `creator.create(payload)`. <br> • Each RequestCreator implements: `create(payload): Request` — validates payload per category rules, instantiates and returns category-specific Request subclass. <br> • Base Request class enforces common attributes: ID, category, severity (default "Low"), submittedBy, createdAt, status ("New"). <br> • Category-specific subclasses add fields: e.g., SecurityRequest adds incidentTime, threatLevel. |
| **Related Decisions** | • **ADR-ARCH-001** (Service Layer placement; Factory is a Service-layer concern, instantiates domain objects). <br> • **ADR-DP-001** (Observer notifies on status changes; the objects created by Factory are what Observer observes). <br> • **FR-001 Acceptance Criteria (M1):** "System creates request with status 'New', unique reference number, default severity 'Low' unless selected"—handled by Factory's base Request creation. <br> • **FR-011 (M1):** Severity flag default—implemented in base Request; observers distinguish high-severity in queue. |
| **Verification & Evidence (M2)** | ✓ Pseudo-code or class diagram showing RequestFactory interface and concrete creators. <br> ✓ Code skeleton: `/src/services/RequestFactory.js`, `/src/services/requestTypes/*.js`. <br> ✓ RTM entries (FR-001, FR-011) link to this ADR. <br> ✓ **Step 3 (Application Evidence):** Actual implementation showing factory registry, category-specific creator logic, and base Request class structure. |