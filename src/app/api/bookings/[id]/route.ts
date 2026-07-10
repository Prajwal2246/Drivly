import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = req.cookies.get('user_session')?.value;
    const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-drivly-admin-session-secret-key-9988';
    const userPayload = verifyJwt(session, secret);

    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    const isOwner = booking.vehicle.ownerId === userPayload.userId;
    const isRenter = booking.renterId === userPayload.userId;

    const updateData: any = {};

    // 1. Status transition validations
    if (status) {
      // Security check: Only owner can approve/reject
      if ((status === 'APPROVED' || status === 'REJECTED') && !isOwner) {
        return NextResponse.json({ error: 'Unauthorized to approve/reject this booking.' }, { status: 403 });
      }

      // Security check: Only renter can activate/complete
      if ((status === 'ACTIVE' || status === 'COMPLETED') && !isRenter) {
        return NextResponse.json({ error: 'Unauthorized to update this booking.' }, { status: 403 });
      }

      updateData.status = status;

      if (status === 'APPROVED') {
        // ponytail: mock authorize deposit hold of 5000.0 on approval
        updateData.paymentStatus = 'HELD';
        updateData.depositAmount = 5000.0;
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
        const finalPenalty = booking.challanPenalty || 0.0;
        updateData.refundAmount = Math.max(0.0, (booking.depositAmount || 5000.0) - finalPenalty);
        if (finalPenalty > 0) {
          updateData.challanStatus = 'DEDUCTED';
        }
      }
    }

    // 2. Reviews & Rating validations
    if (ownerRating !== undefined || ownerReview !== undefined) {
      if (!isRenter) {
        return NextResponse.json({ error: 'Only renter can review the owner.' }, { status: 403 });
      }
      if (booking.status !== 'COMPLETED' && status !== 'COMPLETED') {
        return NextResponse.json({ error: 'Reviews are only allowed after trip completion.' }, { status: 400 });
      }
      if (ownerRating !== undefined) updateData.ownerRating = parseInt(ownerRating);
      if (ownerReview !== undefined) updateData.ownerReview = ownerReview;
    }

    if (renterRating !== undefined || renterReview !== undefined) {
      if (!isOwner) {
        return NextResponse.json({ error: 'Only owner can review the renter.' }, { status: 403 });
      }
      if (booking.status !== 'COMPLETED' && status !== 'COMPLETED') {
        return NextResponse.json({ error: 'Reviews are only allowed after trip completion.' }, { status: 400 });
      }
      if (renterRating !== undefined) updateData.renterRating = parseInt(renterRating);
      if (renterReview !== undefined) updateData.renterReview = renterReview;
    }

    // 3. Challan log validations (only by vehicle owner)
    if (challanPenalty !== undefined) {
      if (!isOwner) {
        return NextResponse.json({ error: 'Only vehicle owner can log traffic challans.' }, { status: 403 });
      }
      const penalty = parseFloat(challanPenalty);
      updateData.challanPenalty = penalty;
      updateData.challanReason = challanReason || 'Traffic violation reported';
      updateData.challanStatus = 'PENDING';

      // If the booking is already completed, deduct immediately and recalculate refund
      if (booking.status === 'COMPLETED') {
        const deposit = booking.depositAmount || 5000.0;
        updateData.refundAmount = Math.max(0.0, deposit - penalty);
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

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error('PATCH Booking API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
