import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { signSession, SESSION_COOKIE } from '@/lib/session';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { apiError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  if (!rateLimit(`user-login:${clientIp(req)}`)) {
    return apiError('TOO_MANY_REQUESTS', 'Too many login attempts. Try again in 15 minutes.');
  }
  try {
    const { phone, society } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required for demo login.' }, { status: 400 });
    }

    // Find the user by phone number
    let user = await prisma.user.findUnique({
      where: { phone },
      include: { society: true },
    });

    // Fail-safe auto-creation if seed hasn't been run
    if (!user) {
      const isOwner = phone === '5550002222';
      const role = isOwner ? 'OWNER' : 'RENTER';
      const name = isOwner ? 'Demo Owner' : 'Demo Renter';
      const email = isOwner ? 'owner@drivly.demo' : 'renter@drivly.demo';
      const demoPasswordHash = hashPassword('demo123');

      user = await prisma.user.create({
        data: {
          name,
          phone,
          email,
          society: {
            connectOrCreate: {
              where: { name_city: { name: society?.trim() || 'Greenwood Heights', city: 'Mumbai' } },
              create: { name: society?.trim() || 'Greenwood Heights', city: 'Mumbai' },
            },
          },
          role,
          password: demoPasswordHash,
          dlVerified: !isOwner,
        },
        include: { society: true },
      });
    }

    
    // Sign session token (1 day expiration)
    const token = signSession({ userId: user.id, name: user.name, role: user.role, societyId: user.societyId, society: user.society.name });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        society: user.society.name,
      },
    });

    // Set secure HTTP-only user_session cookie
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error: any) {
    console.error('Demo Login API Error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
