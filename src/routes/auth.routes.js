import { Router } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();
const COMPLEX_ID = process.env.COMPLEX_ID || 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SELF_REGISTER_ROLES = ['Resident', 'Staff'];

// Used when the email is unknown, so login takes the same time either way.
const decoyHash = hashPassword('decoy-password-for-timing-only');

function issueToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
}

function publicUser(user) {
  return { id: user.id, email: user.email, role: user.role, complexId: user.complex_id };
}

// Residents get a session straight away. Staff accounts are created but cannot sign in
// until an administrator approves them (scripts/approve-staff.mjs). Agents are created by script only.
router.post('/register', async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');
  const role = String(req.body?.role ?? 'Resident');

  const details = [];
  if (!EMAIL_PATTERN.test(email)) details.push('email must be a valid address');
  if (password.length < 8) details.push('password must be at least 8 characters');
  if (!SELF_REGISTER_ROLES.includes(role)) details.push('role must be Resident or Staff');
  if (details.length) {
    return res.status(400).json({ error: 'ValidationError', message: 'Validation failed', details });
  }

  const isStaff = role === 'Staff';
  try {
    const hash = await hashPassword(password);
    const { rows } = await pool.query(
      `INSERT INTO users (email, role, complex_id, password_hash, is_approved)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, role, complex_id`,
      [email, role, COMPLEX_ID, hash, !isStaff],
    );
    if (isStaff) {
      return res.status(202).json({
        pending: true,
        message: 'Your staff account has been created. The estate office must approve it before you can sign in.',
        user: publicUser(rows[0]),
      });
    }
    return res.status(201).json({ token: issueToken(rows[0]), user: publicUser(rows[0]) });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Conflict', message: 'An account with this email already exists.' });
    }
    throw err;
  }
});

router.post('/login', async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');

  const { rows } = await pool.query(
    'SELECT id, email, role, complex_id, password_hash, is_approved FROM users WHERE email = $1',
    [email],
  );
  const user = rows[0];
  const passwordOk = await verifyPassword(password, user ? user.password_hash : await decoyHash);

  if (!user || !passwordOk) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password.' });
  }
  if (!user.is_approved) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Your staff account is waiting for approval from the estate office.',
    });
  }
  return res.json({ token: issueToken(user), user: publicUser(user) });
});

router.get('/me', authenticateToken, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, email, role, complex_id FROM users WHERE id = $1',
    [req.user.id],
  );
  if (!rows[0]) return res.status(401).json({ error: 'Unauthorized', message: 'Account no longer exists.' });
  return res.json({ user: publicUser(rows[0]) });
});

export default router;