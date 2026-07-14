// ponytail: pure, testable booking logic validators
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
