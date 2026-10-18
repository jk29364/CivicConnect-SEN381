-- FR-005: supplement baseline indexes for common staff queue filters.
-- Safe to run on an existing database; no destructive schema changes.
CREATE INDEX IF NOT EXISTS idx_sr_category ON service_requests(category);
CREATE INDEX IF NOT EXISTS idx_sr_assigned_to ON service_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_sr_created_at ON service_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sr_complex_submitted ON service_requests(complex_id, submitted_by);
CREATE INDEX IF NOT EXISTS idx_sr_complex_created ON service_requests(complex_id, created_at DESC);
