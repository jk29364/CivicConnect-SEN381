// Approves a pending staff or agent account. Run by an administrator after confirming the employee.
// Usage: node scripts/approve-staff.mjs <email>
import 'dotenv/config';
import pool from '../src/config/db.js';

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error('Usage: node scripts/approve-staff.mjs <email>');
  process.exit(1);
}

const { rows } = await pool.query(
  `UPDATE users SET is_approved = true
   WHERE email = $1 AND role IN ('Staff', 'Agent')
   RETURNING id, email, role`,
  [email],
);
await pool.end();

if (!rows[0]) {
  console.error('No staff or agent account found for that email.');
  process.exit(1);
}
console.log('Approved:', rows[0]);