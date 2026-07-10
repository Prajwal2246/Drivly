import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwt } from '@/lib/auth';
import { prisma } from '@/lib/db';
import DashboardClient from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-drivly-admin-session-secret-key-9988';
  const user = verifyJwt(token, secret);

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
          preVerifyDl: true, 
          dlFileName: true 
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
