import { NextRequest, NextResponse } from 'next/server';
import { signJwt } from '@/lib/auth';
import { SESSION_SECRET, ADMIN_PASSWORD } from '@/lib/env';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { apiError } from '@/lib/errors';
import { Logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  if (!rateLimit(`admin-login:${clientIp(req)}`)) {
    return apiError('TOO_MANY_REQUESTS', 'Too many login attempts. Try again in 15 minutes.');
  }
  try {
    const { password } = await req.json();

    if (password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true, message: 'Authenticated successfully.' });
      
      // Sign HS256 JWT Session Token (1 day exp)
      const token = signJwt(
        { role: 'admin', exp: Date.now() + 1000 * 60 * 60 * 24 },
        SESSION_SECRET
      );
      
      // Set secure HTTP-only cookie with JWT
      response.cookies.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });

      return response;
    }

    return apiError('UNAUTHORIZED', 'Incorrect password.');
  } catch (error) {
    Logger.error('admin_login_exception', error);
    return apiError('INTERNAL_ERROR', 'Internal error');
  }
}
