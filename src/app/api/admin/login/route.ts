import { NextRequest, NextResponse } from 'next/server';
import { signJwt } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
    const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-drivly-admin-session-secret-key-9988';

    if (password === adminPassword) {
      const response = NextResponse.json({ success: true, message: 'Authenticated successfully.' });
      
      // Sign HS256 JWT Session Token (1 day exp)
      const token = signJwt(
        { role: 'admin', exp: Date.now() + 1000 * 60 * 60 * 24 },
        secret
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

    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
