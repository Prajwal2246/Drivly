import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import FeedClient from '@/components/FeedClient';
import EmptyState from '@/components/EmptyState';
import { getSession } from '@/lib/session';

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
        <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-bold">
              D
            </div>
            <span className="font-bold text-lg text-zinc-955">Drivly</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/profile" className="px-4 py-2 hover:bg-zinc-100 rounded-xl text-xs font-bold text-zinc-700 border border-zinc-200 bg-white">
              My Profile
            </a>
            <a href="/dashboard" className="px-4 py-2 hover:bg-zinc-100 rounded-xl text-xs font-bold text-zinc-700 border border-zinc-200 bg-white">
              Dashboard
            </a>
          </div>
        </header>
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
    createdAt: v.createdAt.toISOString(),
  })) as any;

  return <FeedClient user={user} initialVehicles={serializedVehicles} />;
}
