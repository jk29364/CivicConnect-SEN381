-- Staff who self-register wait here until the estate office approves them.
-- Existing rows default to approved, so nothing already created is affected.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT true;