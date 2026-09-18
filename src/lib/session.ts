// Single read/write path for the user session cookie. See docs/decisions.md #004.
// Kept apart from auth.ts so auth.ts stays env-free and unit-testable.
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { signJwt, verifyJwt } from '@/lib/auth';
import type { Role } from '@prisma/client';
import { SESSION_SECRET } from '@/lib/env';

export const SESSION_COOKIE = 'user_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24; // 1 day

export type Session = {
  userId: string;
  name: string;
  role: Role;
  societyId: string;
  society: string; // display name only — filter on societyId
  exp: number;
};

/** Pass `req` in route handlers; omit it in server components (reads next/headers). */
export async function getSession(req?: NextRequest): Promise<Session | null> {
  const token = req ? req.cookies.get(SESSION_COOKIE)?.value : (await cookies()).get(SESSION_COOKIE)?.value;
  const session = verifyJwt(token, SESSION_SECRET) as Session | null;
  // Cookies signed before the Society table (#009) have no societyId. Prisma drops `undefined` filters,
  // so `where: { societyId: undefined }` would match every society — force a re-login instead.
  return session?.societyId ? session : null;
}

export function signSession(claims: Omit<Session, 'exp'>): string {
  return signJwt({ ...claims, exp: Date.now() + SESSION_TTL_MS }, SESSION_SECRET);
}

export const ADMIN_COOKIE = 'admin_session';

// ponytail: separate admin cookie until task 7.1 folds admin into User.isAdmin
export function getAdminSession(req: NextRequest): boolean {
  const payload = verifyJwt(req.cookies.get(ADMIN_COOKIE)?.value, SESSION_SECRET);
  return payload?.role === 'admin';
}
