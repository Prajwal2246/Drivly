// ponytail: pure, testable booking logic validators (createBookingIfFree takes the client as a param, so this file stays DB-free on import)
import type { PrismaClient } from '@prisma/client';

// 30 days × the ₹1,00,000/hr price cap (validations.ts) = ₹7.2 crore, inside Booking.totalCost's Decimal(10,2).
export const MAX_BOOKING_HOURS = 30 * 24;

export function checkPastDate(start: Date, end: Date, now: Date = new Date()): string | null {
  // Invalid Dates compare false with everything, so without this they'd pass every check below.
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Please choose a valid start and end time.';
  }
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  if (start < fiveMinutesAgo) {
    return 'Booking start time cannot be in the past.';
  }
  if (end <= start) {
    return 'Booking end time must be after the start time.';
  }
  if (end.getTime() - start.getTime() > MAX_BOOKING_HOURS * 3600_000) {
    return 'Bookings can be at most 30 days long.';
  }
  return null;
}

// ponytail: flat deposits by type until Razorpay (5.1); tune per vehicle value if owners ask
export const depositFor = (vehicleType: string) => (vehicleType === 'CAR' ? 2000 : 1000);

export type Quote = { hours: number; rental: number; fee: number; total: number; deposit: number };

/**
 * The one pricing rule, used by the server (what's stored) and the vehicle page (what's shown). See docs/decisions.md #021.
 * Math in whole paise so ₹99.99 × 3 is exactly ₹299.97; results are rupees with ≤2 decimals.
 * `total` is what the renter pays (rental + 5% fee); the deposit is held separately on approval and refunded.
 */
export function quoteBooking(pricePerHour: number, vehicleType: string, start: Date, end: Date): Quote {
  const hours = Math.ceil((end.getTime() - start.getTime()) / 3600_000); // any part of an hour is billed as an hour
  const rental = Math.round(pricePerHour * 100) * hours;
  const fee = Math.round(rental * 0.05);
  return { hours, rental: rental / 100, fee: fee / 100, total: (rental + fee) / 100, deposit: depositFor(vehicleType) };
}

export function checkOwnerBooking(ownerId: string, renterId: string): string | null {
  if (ownerId === renterId) {
    return 'You cannot rent your own vehicle.';
  }
  return null;
}

export function checkOverlap(start: Date, end: Date, existingBookings: { startTime: Date; endTime: Date }[]): boolean {
  return existingBookings.some(b => b.startTime <= end && b.endTime >= start);
}

// Statuses that hold a vehicle's calendar slot.
export const BLOCKING_STATUSES = ['PENDING', 'APPROVED', 'ACTIVE'] as const;

/**
 * Overlap check + insert as one unit. Returns null if the slot is taken. See docs/decisions.md #011.
 * The FOR UPDATE row lock makes a concurrent request for the same vehicle wait until this transaction
 * commits; its overlap check then sees our row. Without the lock both pass the check and both insert.
 */
export function createBookingIfFree(
  db: PrismaClient,
  b: { renterId: string; vehicleId: string; start: Date; end: Date; totalCost: number; notes?: string | null },
) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM vehicles WHERE id = ${b.vehicleId} FOR UPDATE`;
    const overlap = await tx.booking.findFirst({
      where: { vehicleId: b.vehicleId, status: { in: [...BLOCKING_STATUSES] }, startTime: { lte: b.end }, endTime: { gte: b.start } },
    });
    if (overlap) return null;
    return tx.booking.create({
      data: { renterId: b.renterId, vehicleId: b.vehicleId, startTime: b.start, endTime: b.end, status: 'PENDING', totalCost: b.totalCost, notes: b.notes },
    });
  });
}
