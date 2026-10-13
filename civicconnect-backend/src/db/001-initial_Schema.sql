-- 1. Create Enums for strict validation
CREATE TYPE user_role AS ENUM ('Resident', 'Staff', 'Agent');
CREATE TYPE severity_level AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE request_status AS ENUM ('New', 'Assigned', 'InProgress', 'Resolved', 'Closed');

-- 2. Create Users Table (Seed target)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL,
    complex_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Service Requests Table
CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Auto-generate a basic reference number using a sequence or let the app layer handle a custom one. 
    -- For DB-side simplicity, we'll use a generated identity or default text, but typically the app passes this.
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Maintenance', 'Security', 'CommonArea', 'LostProperty')),
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    
    -- J1 specific requirements
    severity severity_level NOT NULL DEFAULT 'Low',
    status request_status NOT NULL DEFAULT 'New',
    version INTEGER NOT NULL DEFAULT 1,
    complex_id UUID NOT NULL,
    
    -- JSONB column for category-specific fields (faultType, incidentTime, threatLevel, etc.)
    category_data JSONB DEFAULT '{}'::jsonb,
    
    submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Append-Only Request History Table
CREATE TABLE request_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    old_status request_status NOT NULL,
    new_status request_status NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Performance Indexes
CREATE INDEX idx_sr_status ON service_requests(status);
CREATE INDEX idx_sr_severity ON service_requests(severity);
CREATE INDEX idx_sr_complex ON service_requests(complex_id);