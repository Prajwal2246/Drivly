import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import FeedClient from '@/components/FeedClient';
import EmptyState from '@/components/EmptyState';
import { getSession } from '@/lib/session';
import { vehiclePhotoUrl } from '@/lib/storage';
import AppHeader from '@/components/ui/AppHeader';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // Fetch all vehicles listed in the user's verified society
  const vehicles = await prisma.vehicle.findMany({
    where: {
      owner: {
        societyId: user.societyId,
      },
      listed: true,
    },
    include: {
      owner: {
        select: {
          name: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col pb-12">
        <AppHeader name={user.name} society={user.society} />
        <main className="max-w-md w-full mx-auto px-4 mt-16 flex-grow flex items-center justify-center">
          <EmptyState societyName={user.society} />
        </main>
      </div>
    );
  }

  // Serialize models into JSON‑safe payloads (date strings)
  const serializedVehicles = vehicles.map(v => ({
    ...v,
    pricePerHour: v.pricePerHour.toNumber(), // Decimal can't cross the RSC boundary
    photoUrl: vehiclePhotoUrl(v.photoPath),
    createdAt: v.createdAt.toISOString(),
  })) as any;

  return <FeedClient user={user} initialVehicles={serializedVehicles} />;
}
