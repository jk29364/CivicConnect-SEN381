import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

/** Stores "scrypt$<salt>$<hash>". scrypt is memory-hard, so offline guessing is expensive. */
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, salt, hex] = String(stored ?? '').split('$');
  if (scheme !== 'scrypt' || !salt || !hex) return false;
  const expected = Buffer.from(hex, 'hex');
  const actual = await scrypt(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}