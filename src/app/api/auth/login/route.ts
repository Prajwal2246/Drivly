import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, signJwt } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { phone, password } = result.data;

    // Find user by phone number
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Incorrect mobile number or password.' },
        { status: 401 }
      );
    }

    // Verify hashed password
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Incorrect mobile number or password.' },
        { status: 401 }
      );
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

    return response;
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
