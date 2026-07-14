import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwt } from '@/lib/auth';
import { prisma } from '@/lib/db';
import VehicleDetailsClient from '@/components/VehicleDetailsClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VehicleDetailsPage({ params }: PageProps) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-drivly-admin-session-secret-key-9988';
  const user = verifyJwt(token, secret);

  if (!user) {
    redirect('/login');
  }

  // 1. Fetch vehicle, its owner, and active bookings (to check schedule overlaps)
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          phone: true,
          societyName: true,
        },
      },
      bookings: {
        where: {
          status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] },
          endTime: { gte: new Date() }, // only future bookings matter for scheduling conflict checks
        },
        orderBy: {
          startTime: 'asc',
        },
      },
    },
  });

  // 2. Enforce gated society security bounds
  if (!vehicle || vehicle.owner.societyName !== user.society) {
    redirect('/feed');
  }

  // 3. Fetch past completed bookings that left ownerRating reviews
  const completedBookingsWithReviews = await prisma.booking.findMany({
    where: {
      vehicleId: id,
      status: 'COMPLETED',
      ownerRating: { not: null },
    },
    include: {
      renter: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 4. Calculate average rating stats
  const ratings = completedBookingsWithReviews.map(b => b.ownerRating).filter((r): r is number => r !== null);
  const averageRating = ratings.length > 0 
    ? parseFloat((ratings.reduce((sum, val) => sum + val, 0) / ratings.length).toFixed(1))
    : null;

  // 5. Serialize dates safely for client component transmission
  const serializedVehicle = {
    ...vehicle,
    createdAt: vehicle.createdAt.toISOString(),
    bookings: vehicle.bookings.map(b => ({
      id: b.id,
      startTime: b.startTime.toISOString(),
      endTime: b.endTime.toISOString(),
      status: b.status,
    })),
  };

  const serializedReviews = completedBookingsWithReviews.map(r => ({
    id: r.id,
    renterName: r.renter.name,
    rating: r.ownerRating ?? 5,
    review: r.ownerReview,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <VehicleDetailsClient 
      user={user}
      vehicle={serializedVehicle as any}
      reviews={serializedReviews}
      averageRating={averageRating}
    />
  );
}
