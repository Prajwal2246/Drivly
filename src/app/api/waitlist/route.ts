import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { waitlistSchema } from '@/lib/validations';
import { apiError } from '@/lib/errors';
import { Logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate input using shared Zod schema
    const validation = waitlistSchema.safeParse(body);
    if (!validation.success) {
      return apiError('VALIDATION_ERROR', validation.error.issues[0].message);
    }

    const data = validation.data;

    // 2. Check for duplicate email registration
    const existingRegistration = await prisma.userWaitlist.findFirst({
      where: { email: data.email.toLowerCase() },
    });

    if (existingRegistration) {
      return apiError('CONFLICT', 'This email is already registered on the waitlist.');
    }

    // 3. Save to database
    const newWaitlistEntry = await prisma.userWaitlist.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email.toLowerCase(),
        city: data.city,
        societyName: data.societyName,
        role: data.role,
        vehicleType: data.role !== 'RENTER' ? data.vehicleType : null,
        brand: data.role !== 'RENTER' ? data.brand : null,
        model: data.role !== 'RENTER' ? data.model : null,
        year: data.role !== 'RENTER' ? data.year : null,
        expectedRentalPrice: data.role !== 'RENTER' ? data.expectedRentalPrice : null,
        preVerifyDl: data.preVerifyDl ?? false,
        dlFileName: data.preVerifyDl ? data.dlFileName : null,
      },
    });

    return NextResponse.json(
      { 
        message: 'Successfully registered for the waitlist!',
        data: newWaitlistEntry 
      },
      { status: 201 }
    );
  } catch (error) {
    Logger.error('waitlist_api_exception', error);
    return apiError('INTERNAL_ERROR', 'Internal error');
  }
}
