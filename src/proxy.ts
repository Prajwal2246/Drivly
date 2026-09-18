import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { verifyJwt } from '@/lib/auth';
import { SESSION_SECRET } from '@/lib/env';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Protect Admin Panel
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const session = request.cookies.get('admin_session')?.value;
    const payload = verifyJwt(session, SESSION_SECRET);

    if (!payload || payload.role !== 'admin') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protect Core Feed, User Dashboard, & Profile
  if (path.startsWith('/feed') || path.startsWith('/dashboard') || path.startsWith('/profile')) {
    const payload = await getSession(request);

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
