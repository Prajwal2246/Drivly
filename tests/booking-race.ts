// Needs a real, seeded DB: `npx tsx tests/booking-race.ts`. See docs/decisions.md #011.
// Fires N concurrent requests for the same slot; exactly one may win.
import 'dotenv/config';
import assert from 'node:assert';
import { prisma } from '../src/lib/db';
import { createBookingIfFree } from '../src/lib/booking-rules';

const N = 10;

async function main() {
  const renter = await prisma.user.findUniqueOrThrow({ where: { phone: '5550001111' } });
  const vehicle = await prisma.vehicle.findFirstOrThrow({ where: { owner: { phone: '5550002222' } } });
  const start = new Date(Date.now() + 365 * 24 * 3600_000); // a year out, clear of demo bookings
  const end = new Date(start.getTime() + 2 * 3600_000);

  const results = await Promise.all(
    Array.from({ length: N }, () => createBookingIfFree(prisma, { renterId: renter.id, vehicleId: vehicle.id, start, end, totalCost: 100 })),
  );
  const created = results.filter((b) => b !== null);

  try {
    assert.strictEqual(created.length, 1, `expected exactly 1 of ${N} concurrent bookings, got ${created.length}`);
    console.log(`✅ Booking race: 1 of ${N} concurrent requests won`);
  } finally {
    await prisma.booking.deleteMany({ where: { id: { in: created.map((b) => b.id) } } });
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
