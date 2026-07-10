import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJwt, signJwt } from '@/lib/auth';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  city: z.string().min(2, { message: 'City must be at least 2 characters.' }),
  societyName: z.string().min(2, { message: 'Society name must be at least 2 characters.' }),
  role: z.enum(['OWNER', 'RENTER', 'BOTH'], { message: 'Please select a valid role.' }),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = req.cookies.get('user_session')?.value;
    const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-drivly-admin-session-secret-key-9988';
    const userPayload = verifyJwt(session, secret);

    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = profileUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, city, societyName, role } = result.data;

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: userPayload.userId }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email address is already in use.' },
        { status: 400 }
      );
    }

    // Update user in DB
    const updatedUser = await prisma.user.update({
      where: { id: userPayload.userId },
      data: {
        name,
        email,
        city,
        societyName,
        role,
      }
    });

    // Re-sign session JWT with updated claims
    const token = signJwt(
      {
        userId: updatedUser.id,
        name: updatedUser.name,
        role: updatedUser.role,
        society: updatedUser.societyName,
        exp: Date.now() + 1000 * 60 * 60 * 24,
      },
      secret
    );

    const response = NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        society: updatedUser.societyName,
        city: updatedUser.city,
      }
    });

    // Reset user_session cookie
    response.cookies.set('user_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error('PATCH Profile API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
