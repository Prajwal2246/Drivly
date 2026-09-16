import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardClient from '@/components/DashboardClient';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

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
    createdAt: b.createdAt.toISOString(),
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    vehicle: {
      ...b.vehicle,
      createdAt: b.vehicle.createdAt.toISOString(),
    },
  })) as any;

  const serializedOwnerBookings = ownerBookings.map(b => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    vehicle: {
      ...b.vehicle,
      createdAt: b.vehicle.createdAt.toISOString(),
    },
  })) as any;

  const serializedMyVehicles = myVehicles.map(v => ({
    ...v,
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
