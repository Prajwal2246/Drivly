import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Logger } from '@/lib/logger';
import { apiError } from '@/lib/errors';
import { checkPastDate, checkOwnerBooking, createBookingIfFree, quoteBooking } from '@/lib/booking-rules';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const userPayload = await getSession(req);

    if (!userPayload) {
      return apiError('UNAUTHORIZED', 'Your session has expired. Please log in again.');
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
          select: { name: true, phone: true, dlVerified: true, dlPath: true },
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
    return apiError('INTERNAL_ERROR', 'Internal error');
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPayload = await getSession(req);

    if (!userPayload) {
      return apiError('UNAUTHORIZED', 'Your session has expired. Please log in again.');
    }

    // Any price in the body is ignored: the server prices from the stored vehicle rate (#021).
    const { vehicleId, startTime, endTime, notes } = await req.json();

    if (!vehicleId || !startTime || !endTime) {
      return apiError('BAD_REQUEST', 'Please choose a vehicle and a start and end time.');
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
      where: { id: vehicleId },
      include: { owner: { select: { societyId: true } } },
    });

    // Same 404 for other-society and unlisted vehicles: don't confirm they exist.
    if (!vehicle || vehicle.owner.societyId !== userPayload.societyId || !vehicle.listed) {
      return apiError('NOT_FOUND', 'Vehicle not found.');
    }

    // 2. Block owners from booking their own listings
    const ownerErr = checkOwnerBooking(vehicle.ownerId, userPayload.userId);
    if (ownerErr) {
      return apiError('BAD_REQUEST', ownerErr);
    }

    // 3. Price from the stored rate, then block overlaps (race-safe)
    const quote = quoteBooking(vehicle.pricePerHour.toNumber(), vehicle.type, start, end);
    const newBooking = await createBookingIfFree(prisma, {
      renterId: userPayload.userId,
      vehicleId,
      start,
      end,
      totalCost: quote.total,
      notes: typeof notes === 'string' && notes.trim() ? notes.trim().slice(0, 500) : null,
    });

    if (!newBooking) {
      return apiError('CONFLICT', 'This vehicle is already booked during the selected times.');
    }

    Logger.info('booking_requested', { bookingId: newBooking.id, renterId: userPayload.userId, vehicleId, total: quote.total });

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (error) {
    Logger.error('post_booking_api_exception', error);
    return apiError('INTERNAL_ERROR', 'Internal error');
  }
}
