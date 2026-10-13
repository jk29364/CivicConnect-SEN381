### 5.4 Data & Persistence ###
This section finalizes the physical data model, transaction boundaries, and integrity rules deployed to the Supabase PostgreSQL production environment. The design strictly enforces ASR-2 (Immutable History) and implements safeguards for concurrent data access.

5.4.1 Core Entities and Physical Schema
The database relies on three core entities linked via strict foreign key constraints. To satisfy ASR-1 (RBAC) and ASR-3 (Severity Prioritization), enum constraints are enforced directly at the database level. To satisfy NFR-006 (Multi-tenancy preparation), all core records associate with a complex_id.

###SQL####

-- Enums for strict constraint validation (ASR-1, ASR-3)
CREATE TYPE severity_level AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE request_status AS ENUM ('New', 'Assigned', 'InProgress', 'Resolved', 'Closed');
CREATE TYPE user_role AS ENUM ('Resident', 'Staff', 'Agent');

-- 1. User Entity
CREATE TABLE "User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL,
    complex_id UUID NOT NULL, 
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Service Request Entity (with OCC Versioning)
CREATE TABLE ServiceRequest (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Maintenance', 'Security', 'CommonArea', 'LostProperty')),
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    severity severity_level NOT NULL DEFAULT 'Low',
    status request_status NOT NULL DEFAULT 'New',
    submitted_by UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
    complex_id UUID NOT NULL,
    version INTEGER NOT NULL DEFAULT 1, -- Optimistic Concurrency Control (OCC)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Request History Entity (Append-Only Audit Trail for ASR-2)
CREATE TABLE RequestHistory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES ServiceRequest(id) ON DELETE CASCADE,
    old_status request_status NOT NULL,
    new_status request_status NOT NULL,
    changed_by UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes (ASR-4)
CREATE INDEX idx_severity ON ServiceRequest(severity);
CREATE INDEX idx_status ON ServiceRequest(status);



5.4.2 ACID Transaction Boundaries & State Transitions
(FR-002)
To guarantee the immutable history audit trail (ASR-2), a request's status update and its corresponding history log entry must never exist in a partial state. The application executes these changes within a single atomic PostgreSQL transaction.   Furthermore, to prevent lost updates when multiple staff members access the same ticket (ASR-4 resilience), the system utilizes Optimistic Concurrency Control (OCC) via the version column.   Transaction Execution Flow:Begin Transaction: BEGIN;Version Check & Update: The ServiceRequest is updated to the new_status, and the version integer is incremented by 1, only if the version matches the client's expected version. If the version check fails (0 rows affected), the update is rejected as stale.   Audit Append: A new row is inserted into RequestHistory logging the old_status, new_status, and the changed_by actor.   Commit: COMMIT; (If any step fails, ROLLBACK executes, leaving no partial data).

5.4.3 Data Integrity & Cascade RulesRestrict User Deletion: 
The ON DELETE RESTRICT constraint on the submitted_by and changed_by foreign keys prevents the deletion of a User if they are tied to historical tickets, maintaining the integrity of the body corporate audit trail.Strict State Transitions: The application logic enforces that status changes adhere strictly to the defined flow (e.g., a "Closed" ticket cannot revert to "New"). An invalid transition triggers an immediate transaction rollback.   

5.4.4 Backup & Disaster Recovery (FEC-07 Resolution)
Milestone 1 flagged the need for data migration and disaster recovery (FEC-07). By baselining Supabase PostgreSQL, this concern is resolved through managed cloud infrastructure. Supabase automatically provisions daily automated backups and allows for Point-in-Time Recovery (PITR) for the database. This guarantees that baseline seed data and production audit records are shielded from irrecoverable loss without requiring custom backup scripting from the engineering team.   Once you have this pasted into your PED, you have officially documented Tasks J1 and J2. What is the next logical target for tonight—drafting the actual SQL migration files, or writing the Node.js function that executes that transaction block?

### ADR-DATA-001: Persistence Strategy for Category-Specific Fields

| Field | Content |
|-------|---------|
| **Status** | Accepted (M3 Baseline) |
| **Context** | FR-001 requires the system to handle multiple service request categories (Maintenance, Security, Common Area, Lost Property). Each category introduces unique data fields (e.g., `faultType`, `incidentTime`, `threatLevel`, `dateLastSeen`). The persistence layer must store these fields efficiently without creating brittle database schemas. |
| **Alternatives Considered** | **Alt A (Rejected): Nullable Columns (Wide Table)** — Add every possible category field as a distinct column in the `ServiceRequest` table. Rejected because it creates a sparse table filled mostly with `NULL` values. Adding future categories would require a database schema migration to add new columns.<br><br>**Alt B (Rejected): Distinct Tables (Table-per-Type)** — Create separate tables (e.g., `MaintenanceRequests`, `SecurityRequests`) linked to a base table. Rejected because it complicates queries (requiring complex `JOIN`s for the staff list view) and heavily impacts ASR-4 (Performance).<br><br>**Alt C (Chosen): Single JSON/JSONB Column** — Store all unique, category-specific fields in a single structured JSON object within the `ServiceRequest` row. |
| **Decision** | Implement a single `JSONB` column named `category_data` in the PostgreSQL `ServiceRequest` table to store all category-specific attributes. |
| **Rationale** | • **Flexibility & Forward Engineering:** If Wonderpark Estates introduces a new category (e.g., "Parking Violation") in the future, the database schema requires zero changes. The new fields are simply passed as a new JSON structure.<br>• **Stack Alignment:** Since our architecture uses Node.js and React (ADR-STACK1), passing JSON objects directly from the frontend to the backend to the database eliminates unnecessary serialization overhead.<br>• **Native Support:** PostgreSQL natively supports `JSONB`, allowing us to query and index inside the JSON object if we ever need to filter by a specific category field later. |
| **Consequences** | The Application/Service layer (specifically the Factory Pattern implemented in ADR-DP-002) is strictly responsible for validating the contents of the `category_data` payload before it reaches the database. The database will not enforce schema validation inside the JSON object. |