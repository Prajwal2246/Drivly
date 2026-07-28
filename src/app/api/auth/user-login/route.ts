import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signJwt, hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { phone, society } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required for demo login.' }, { status: 400 });
    }

    // Find the user by phone number
    let user = await prisma.user.findUnique({
      where: { phone },
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
          city: 'Mumbai',
          societyName: society || 'Greenwood Heights',
          role,
          password: demoPasswordHash,
          preVerifyDl: !isOwner,
          dlFileName: isOwner ? null : 'demo_license.pdf',
        },
      });
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
  } catch (error: any) {
    console.error('Demo Login API Error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
