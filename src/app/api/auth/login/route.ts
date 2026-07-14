import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, signJwt } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { Logger } from '@/lib/logger';
import { apiError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return apiError('VALIDATION_ERROR', result.error.issues[0].message);
    }

    const { phone, password } = result.data;

    // Find user by phone number
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      Logger.info('user_login_failed_unknown_phone', { phone });
      return apiError('UNAUTHORIZED', 'Incorrect mobile number or password.');
    }

    // Verify hashed password
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      Logger.info('user_login_failed_wrong_password', { userId: user.id, phone });
      return apiError('UNAUTHORIZED', 'Incorrect mobile number or password.');
    }

    const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-drivly-admin-session-secret-key-9988';
    
    // Sign session token (1 day expiration)
    const token = signJwt(
      {
        userId: user.id,
        name: user.name,
        role: user.role,
        society: user.societyName,
        exp: Date.now() + 1000 * 60 * 60 * 24,
      },
      secret
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        society: user.societyName,
      },
    });

    // Set secure HTTP-only user_session cookie
    response.cookies.set('user_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    Logger.info('user_login_success', { userId: user.id, phone, role: user.role });
    return response;
  } catch (error) {
    Logger.error('login_api_exception', error);
    return apiError('INTERNAL_ERROR', 'Internal Server Error');
  }
}
