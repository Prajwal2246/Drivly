// ponytail: pure, testable booking logic validators (createBookingIfFree takes the client as a param, so this file stays DB-free on import)
import type { PrismaClient } from '@prisma/client';

export function checkPastDate(start: Date, end: Date, now: Date = new Date()): string | null {
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  if (start < fiveMinutesAgo) {
    return 'Booking start time cannot be in the past.';
  }
  if (end <= start) {
    return 'Booking end time must be after the start time.';
  }
  return null;
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
  b: { renterId: string; vehicleId: string; start: Date; end: Date; totalCost: number },
) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM vehicles WHERE id = ${b.vehicleId} FOR UPDATE`;
    const overlap = await tx.booking.findFirst({
      where: { vehicleId: b.vehicleId, status: { in: [...BLOCKING_STATUSES] }, startTime: { lte: b.end }, endTime: { gte: b.start } },
    });
    if (overlap) return null;
    return tx.booking.create({
      data: { renterId: b.renterId, vehicleId: b.vehicleId, startTime: b.start, endTime: b.end, status: 'PENDING', totalCost: b.totalCost },
    });
  });
}
