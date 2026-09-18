import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Logger } from '@/lib/logger';
import { apiError } from '@/lib/errors';
import { getSession } from '@/lib/session';
import { BookingStatus, Prisma } from '@prisma/client';

// ponytail: mock deposit hold amount until Razorpay (task 5.1)
const MOCK_DEPOSIT = new Prisma.Decimal(5000);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userPayload = await getSession(req);

    if (!userPayload) {
      return apiError('UNAUTHORIZED', 'Unauthorized');
    }

    const {
      status,
      odometerStart,
      odometerEnd,
      notes,
      ownerRating,
      ownerReview,
      renterRating,
      renterReview,
      challanPenalty,
      challanReason,
    } = await req.json();

    // Fetch booking with details
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        vehicle: true,
      },
    });

    if (!booking) {
      return apiError('NOT_FOUND', 'Booking not found.');
    }

    const isOwner = booking.vehicle.ownerId === userPayload.userId;
    const isRenter = booking.renterId === userPayload.userId;

    const updateData: any = {};

    // 1. Status transition validations
    if (status) {
      if (!Object.hasOwn(BookingStatus, status)) { // not `in`: 'toString' in BookingStatus is true
        return apiError('BAD_REQUEST', 'Invalid booking status.');
      }

      // Security check: Only owner can approve/reject
      if ((status === 'APPROVED' || status === 'REJECTED') && !isOwner) {
        return apiError('FORBIDDEN', 'Unauthorized to approve/reject this booking.');
      }

      // Security check: Only renter can activate/complete
      if ((status === 'ACTIVE' || status === 'COMPLETED') && !isRenter) {
        return apiError('FORBIDDEN', 'Unauthorized to update this booking.');
      }

      updateData.status = status;

      if (status === 'APPROVED') {
        // ponytail: mock authorize deposit hold of 5000.0 on approval
        updateData.paymentStatus = 'HELD';
        updateData.depositAmount = MOCK_DEPOSIT;
      }

      if (status === 'ACTIVE' && odometerStart !== undefined) {
        updateData.odometerStart = parseInt(odometerStart);
        // Make vehicle unavailable during trip
        await prisma.vehicle.update({
          where: { id: booking.vehicleId },
          data: { available: false },
        });
      }

      if (status === 'COMPLETED') {
        if (odometerEnd !== undefined) {
          updateData.odometerEnd = parseInt(odometerEnd);
        }
        // Make vehicle available again post trip
        await prisma.vehicle.update({
          where: { id: booking.vehicleId },
          data: { available: true },
        });

        // Resolve deposit holds & rent payments
        updateData.paymentStatus = 'PAID';
        const finalPenalty = booking.challanPenalty;
        const deposit = booking.depositAmount.isZero() ? MOCK_DEPOSIT : booking.depositAmount;
        updateData.refundAmount = Prisma.Decimal.max(0, deposit.minus(finalPenalty));
        if (finalPenalty.greaterThan(0)) {
          updateData.challanStatus = 'DEDUCTED';
        }
      }
    }

    // 2. Reviews & Rating validations
    if (ownerRating !== undefined || ownerReview !== undefined) {
      if (!isRenter) {
        return apiError('FORBIDDEN', 'Only renter can review the owner.');
      }
      if (booking.status !== 'COMPLETED' && status !== 'COMPLETED') {
        return apiError('BAD_REQUEST', 'Reviews are only allowed after trip completion.');
      }
      if (ownerRating !== undefined) updateData.ownerRating = parseInt(ownerRating);
      if (ownerReview !== undefined) updateData.ownerReview = ownerReview;
    }

    if (renterRating !== undefined || renterReview !== undefined) {
      if (!isOwner) {
        return apiError('FORBIDDEN', 'Only owner can review the renter.');
      }
      if (booking.status !== 'COMPLETED' && status !== 'COMPLETED') {
        return apiError('BAD_REQUEST', 'Reviews are only allowed after trip completion.');
      }
      if (renterRating !== undefined) updateData.renterRating = parseInt(renterRating);
      if (renterReview !== undefined) updateData.renterReview = renterReview;
    }

    // 3. Challan log validations (only by vehicle owner)
    if (challanPenalty !== undefined) {
      if (!isOwner) {
        return apiError('FORBIDDEN', 'Only vehicle owner can log traffic challans.');
      }
      const penalty = Number(challanPenalty);
      if (!Number.isFinite(penalty) || penalty < 0) {
        return apiError('BAD_REQUEST', 'Challan penalty must be a non-negative number.');
      }
      updateData.challanPenalty = penalty;
      updateData.challanReason = challanReason || 'Traffic violation reported';
      updateData.challanStatus = 'PENDING';

      // If the booking is already completed, deduct immediately and recalculate refund
      if (booking.status === 'COMPLETED') {
        const deposit = booking.depositAmount.isZero() ? MOCK_DEPOSIT : booking.depositAmount;
        updateData.refundAmount = Prisma.Decimal.max(0, deposit.minus(penalty));
        updateData.challanStatus = 'DEDUCTED';
      }
    }

    if (notes) {
      updateData.notes = notes;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
    });

    Logger.info('booking_status_updated', {
      bookingId: updatedBooking.id,
      userId: userPayload.userId,
      status: updatedBooking.status,
      paymentStatus: updatedBooking.paymentStatus,
      challanStatus: updatedBooking.challanStatus,
      challanPenalty: Number(updatedBooking.challanPenalty),
      ownerRating: updatedBooking.ownerRating,
      renterRating: updatedBooking.renterRating
    });

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    Logger.error('booking_patch_api_exception', error);
    return apiError('INTERNAL_ERROR', 'Internal Server Error');
  }
}
