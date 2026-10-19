-- Adds password storage for real sign-in. Existing rows keep NULL and cannot sign in
-- until a password is set (see scripts/create-staff.mjs for creating staff accounts).
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;