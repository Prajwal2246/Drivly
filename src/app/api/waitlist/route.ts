import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { waitlistSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate input using shared Zod schema
    const validation = waitlistSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 2. Check for duplicate email registration
    const existingRegistration = await prisma.userWaitlist.findFirst({
      where: { email: data.email.toLowerCase() },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'This email is already registered on the waitlist.' },
        { status: 409 }
      );
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
    console.error('Waitlist API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
