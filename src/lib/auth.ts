/**
 * Admin login: one shared password (environment variable ADMIN_PASSWORD).
 *
 * After a correct password the browser gets a signed cookie that is valid for 30 days.
 * The signing key is derived from the password itself, so changing ADMIN_PASSWORD
 * immediately logs everyone out.
 */
import type { AstroCookies } from 'astro';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'tgc_admin';
const SESSION_DAYS = 30;

const password = () => process.env.ADMIN_PASSWORD ?? import.meta.env.ADMIN_PASSWORD ?? '';

/** False when ADMIN_PASSWORD is not set: the admin then refuses every login. */
export const adminConfigured = () => password().length >= 8;

const key = () => createHash('sha256').update(`tgc-admin-session:${password()}`).digest();
const sign = (value: string) => createHmac('sha256', key()).update(value).digest('base64url');

/** Compares two strings in constant time (no timing hints about the password). */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(attempt: string): boolean {
  return adminConfigured() && safeEqual(attempt, password());
}

export function startSession(cookies: AstroCookies, secure: boolean): void {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const value = `${expires}.${sign(String(expires))}`;
  cookies.set(SESSION_COOKIE, value, {
    path: '/',
    httpOnly: true,
    secure,
    sameSite: 'strict',
    expires: new Date(expires),
  });
}

export function endSession(cookies: AstroCookies): void {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}

export function hasSession(cookies: AstroCookies): boolean {
  if (!adminConfigured()) return false;
  const value = cookies.get(SESSION_COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split('.');
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, sign(expires));
}
