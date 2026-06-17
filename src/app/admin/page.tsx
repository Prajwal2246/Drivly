import { prisma } from '@/lib/db';
import AdminDashboardClient from '@/components/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  try {
    const registrations = await prisma.userWaitlist.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Serialize Date objects to strings so they can be passed to the client component
    const serializedData = registrations.map((entry) => ({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
    }));

    return <AdminDashboardClient initialData={serializedData} />;
  } catch (error) {
    console.error('Error fetching waitlist registrations:', error);
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-3">Database Connection Error</h2>
        <p className="text-zinc-400 max-w-md mb-6">
          Could not fetch waitlist registrations. Please make sure your database is running and the `DATABASE_URL` connection string is set up correctly.
        </p>
        <div className="text-xs font-mono bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-zinc-500 overflow-x-auto max-w-xl text-left">
          {error instanceof Error ? error.message : String(error)}
        </div>
      </div>
    );
  }
}
