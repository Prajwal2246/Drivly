import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { Logger } from '@/lib/logger';
import { apiError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return apiError('VALIDATION_ERROR', result.error.issues[0].message);
    }

    const { name, email, phone, city, societyName, role, password, preVerifyDl, dlFileName } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      Logger.info('user_registration_failed_duplicate', { email, phone });
      return apiError('CONFLICT', 'User with this email or mobile number already exists.');
    }

    // Hash password securely
    const hashedPassword = hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        city,
        societyName,
        role,
        password: hashedPassword,
        preVerifyDl: !!preVerifyDl,
        dlFileName: dlFileName || null,
      },
    });

    Logger.info('user_registered', { userId: newUser.id, email: newUser.email, role: newUser.role });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    Logger.error('register_api_exception', error);
    return apiError('INTERNAL_ERROR', 'Internal Server Error');
  }
}
