// Creates a Staff or Agent account. Run by an administrator, never from the public app.
// Usage: node scripts/create-staff.mjs <email> <password> [Staff|Agent]
import 'dotenv/config';
import pool from '../src/config/db.js';
import { hashPassword } from '../src/auth/password.js';

const [, , email, password, role = 'Staff'] = process.argv;
if (!email || !password || !['Staff', 'Agent'].includes(role) || password.length < 8) {
  console.error('Usage: node scripts/create-staff.mjs <email> <password, min 8 chars> [Staff|Agent]');
  process.exit(1);
}

const COMPLEX_ID = process.env.COMPLEX_ID || 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const hash = await hashPassword(password);
const { rows } = await pool.query(
  `INSERT INTO users (email, role, complex_id, password_hash) VALUES ($1, $2, $3, $4)
   RETURNING id, email, role`,
  [email.trim().toLowerCase(), role, COMPLEX_ID, hash],
);
console.log('Created:', rows[0]);
await pool.end();