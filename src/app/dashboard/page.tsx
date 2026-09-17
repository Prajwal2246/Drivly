import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardClient from '@/components/DashboardClient';
import { getSession } from '@/lib/session';
import type { Booking } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Decimal can't cross the RSC boundary; display-only, so number is fine here.
const moneyToNumbers = (b: Booking) => ({
  totalCost: b.totalCost.toNumber(),
  depositAmount: b.depositAmount.toNumber(),
  refundAmount: b.refundAmount.toNumber(),
  challanPenalty: b.challanPenalty.toNumber(),
});

export default async function DashboardPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // 1. Fetch bookings made by the active user (as renter)
  const renterBookings = await prisma.booking.findMany({
    where: { renterId: user.userId },
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

  // 2. Fetch bookings made on vehicles owned by the active user (as owner)
  const ownerBookings = await prisma.booking.findMany({
    where: {
      vehicle: {
        ownerId: user.userId,
      },
    },
    include: {
      renter: {
        select: { 
          name: true, 
          phone: true, 
          dlVerified: true,
          dlPath: true,
        },
      },
      vehicle: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // 3. Fetch vehicles listed by the active user (as owner)
  const myVehicles = await prisma.vehicle.findMany({
    where: { ownerId: user.userId },
    orderBy: { createdAt: 'desc' },
  });

  // Serialize date strings for JSON client safety
  const serializedRenterBookings = renterBookings.map(b => ({
    ...b,
    ...moneyToNumbers(b),
    createdAt: b.createdAt.toISOString(),
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    vehicle: {
      ...b.vehicle,
      pricePerHour: b.vehicle.pricePerHour.toNumber(),
      createdAt: b.vehicle.createdAt.toISOString(),
    },
  })) as any;

  const serializedOwnerBookings = ownerBookings.map(b => ({
    ...b,
    ...moneyToNumbers(b),
    createdAt: b.createdAt.toISOString(),
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    vehicle: {
      ...b.vehicle,
      pricePerHour: b.vehicle.pricePerHour.toNumber(),
      createdAt: b.vehicle.createdAt.toISOString(),
    },
  })) as any;

  const serializedMyVehicles = myVehicles.map(v => ({
    ...v,
    pricePerHour: v.pricePerHour.toNumber(),
    createdAt: v.createdAt.toISOString(),
  })) as any;

  return (
    <DashboardClient 
      user={user}
      initialRenterBookings={serializedRenterBookings}
      initialOwnerBookings={serializedOwnerBookings}
      initialMyVehicles={serializedMyVehicles}
    />
  );
}
