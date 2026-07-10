import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get('user_session')?.value;
    const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-drivly-admin-session-secret-key-9988';
    const userPayload = verifyJwt(session, secret);

    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get bookings where user is the renter
    const renterBookings = await prisma.booking.findMany({
      where: { renterId: userPayload.userId },
      include: {
        vehicle: {
          include: {
            owner: {
              select: { name: true, phone: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get bookings where user is the vehicle owner
    const ownerBookings = await prisma.booking.findMany({
      where: {
        vehicle: {
          ownerId: userPayload.userId,
        },
      },
      include: {
        renter: {
          select: { name: true, phone: true, preVerifyDl: true, dlFileName: true },
        },
        vehicle: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      renterBookings,
      ownerBookings,
    });
  } catch (error) {
    console.error('GET Bookings API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = req.cookies.get('user_session')?.value;
    const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-drivly-admin-session-secret-key-9988';
    const userPayload = verifyJwt(session, secret);

    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vehicleId, startTime, endTime, totalCost } = await req.json();

    if (!vehicleId || !startTime || !endTime || totalCost === undefined) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    const newBooking = await prisma.booking.create({
      data: {
        renterId: userPayload.userId,
        vehicleId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'PENDING',
        totalCost: parseFloat(totalCost),
      },
    });

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (error) {
    console.error('POST Booking API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
