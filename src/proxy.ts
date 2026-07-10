import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/auth';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-drivly-admin-session-secret-key-9988';

  console.log(`[PROXY] Intercepted path: ${path}`);

  // 1. Protect Admin Panel
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const session = request.cookies.get('admin_session')?.value;
    const payload = verifyJwt(session, secret);

    console.log(`[PROXY] Admin session present: ${!!session}, payload: ${!!payload}`);

    if (!payload || payload.role !== 'admin') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protect Core Feed, User Dashboard, & Profile
  if (path.startsWith('/feed') || path.startsWith('/dashboard') || path.startsWith('/profile')) {
    const session = request.cookies.get('user_session')?.value;
    const payload = verifyJwt(session, secret);

    console.log(`[PROXY] User session present: ${!!session}, payload: ${!!payload}`);
    if (session && !payload) {
      console.log(`[PROXY] Token verification failed. Secret used: ${secret.substring(0, 5)}...`);
    }

    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/feed/:path*', '/dashboard/:path*', '/profile/:path*'],
};
