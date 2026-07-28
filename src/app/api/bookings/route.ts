import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import { Logger } from '@/lib/logger';
import { apiError } from '@/lib/errors';
import { checkPastDate, checkOwnerBooking } from '@/lib/booking-rules';

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get('user_session')?.value;
    const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-drivly-admin-session-secret-key-9988';
    const userPayload = verifyJwt(session, secret);

    if (!userPayload) {
      return apiError('UNAUTHORIZED', 'Unauthorized');
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
    Logger.error('get_bookings_api_exception', error);
    return apiError('INTERNAL_ERROR', 'Internal Server Error');
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = req.cookies.get('user_session')?.value;
    const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-drivly-admin-session-secret-key-9988';
    const userPayload = verifyJwt(session, secret);

    if (!userPayload) {
      return apiError('UNAUTHORIZED', 'Unauthorized');
    }

    const { vehicleId, startTime, endTime, totalCost } = await req.json();

    if (!vehicleId || !startTime || !endTime || totalCost === undefined) {
      return apiError('BAD_REQUEST', 'Missing required parameters.');
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // 1. Prevent past-date booking requests
    const dateErr = checkPastDate(start, end);
    if (dateErr) {
      return apiError('BAD_REQUEST', dateErr);
    }

    // Fetch the vehicle to verify existence and ownership
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle) {
      return apiError('NOT_FOUND', 'Vehicle not found.');
    }

    // 2. Block owners from booking their own listings
    const ownerErr = checkOwnerBooking(vehicle.ownerId, userPayload.userId);
    if (ownerErr) {
      return apiError('BAD_REQUEST', ownerErr);
    }

    // 3. Block overlapping bookings for the same vehicle
    const overlap = await prisma.booking.findFirst({
      where: {
        vehicleId,
        status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] },
        OR: [
          {
            startTime: { lte: end },
            endTime: { gte: start }
          }
        ]
      }
    });

    if (overlap) {
      return apiError('CONFLICT', 'This vehicle is already booked during the selected times.');
    }

    const newBooking = await prisma.booking.create({
      data: {
        renterId: userPayload.userId,
        vehicleId,
        startTime: start,
        endTime: end,
        status: 'PENDING',
        totalCost: parseFloat(totalCost),
      },
    });

    Logger.info('booking_requested', { bookingId: newBooking.id, renterId: userPayload.userId, vehicleId });

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (error) {
    Logger.error('post_booking_api_exception', error);
    return apiError('INTERNAL_ERROR', 'Internal Server Error');
  }
}
