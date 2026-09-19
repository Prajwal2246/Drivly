import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Logger } from '@/lib/logger';
import { apiError } from '@/lib/errors';
import { getSession, signSession, SESSION_COOKIE } from '@/lib/session';
import { profileUpdateSchema } from '@/lib/validations';


export async function PATCH(req: NextRequest) {
  try {
    const userPayload = await getSession(req);

    if (!userPayload) {
      return apiError('UNAUTHORIZED', 'Your session has expired. Please log in again.');
    }

    const body = await req.json();
    const result = profileUpdateSchema.safeParse(body);

    if (!result.success) {
      return apiError('VALIDATION_ERROR', result.error.issues[0].message);
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
      Logger.info('user_profile_update_failed_duplicate_email', { userId: userPayload.userId, email });
      return apiError('CONFLICT', 'Email address is already in use.');
    }

    // Update user in DB
    const updatedUser = await prisma.user.update({
      where: { id: userPayload.userId },
      data: {
        name,
        email,
        role,
        society: { connectOrCreate: { where: { name_city: { name: societyName, city } }, create: { name: societyName, city } } },
      },
      include: { society: true },
    });

    // Re-sign session JWT with updated claims
    const token = signSession({ userId: updatedUser.id, name: updatedUser.name, role: updatedUser.role, societyId: updatedUser.societyId, society: updatedUser.society.name });

    const response = NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        society: updatedUser.society.name,
        city: updatedUser.society.city,
      }
    });

    // Reset user_session cookie
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    Logger.info('user_profile_updated', { userId: updatedUser.id, role: updatedUser.role });
    return response;
  } catch (error) {
    Logger.error('profile_api_exception', error);
    return apiError('INTERNAL_ERROR', 'Internal error');
  }
}
