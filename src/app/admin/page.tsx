import { prisma } from '@/lib/db';
import type { UserWaitlist } from '@prisma/client';
import AdminDashboardClient from '@/components/AdminDashboardClient';
import { Logger } from '@/lib/logger';

// Define a type for the client‑ready payload (Date → ISO string)
type SerializedWaitlist = Omit<UserWaitlist, 'createdAt'> & { createdAt: string };

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  try {
    const registrations = (await prisma.userWaitlist.findMany({
      orderBy: { createdAt: 'desc' },
    })) as UserWaitlist[];

    const users = await prisma.user.findMany({
      select: { id: true, name: true, phone: true, society: { select: { name: true } }, role: true, dlPath: true, dlVerified: true },
      orderBy: { createdAt: 'desc' },
    });

    // Serialize Date objects to strings so they can be passed to the client component
    const serializedData: SerializedWaitlist[] = registrations.map((entry) => ({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
    }));

    return <AdminDashboardClient initialData={serializedData} users={users.map(({ society, ...u }) => ({ ...u, societyName: society.name }))} />;
  } catch (error) {
    Logger.error('admin_page_exception', error); // details stay in the server logs (#019)
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-3">Couldn&apos;t load the dashboard</h2>
        <p className="text-zinc-400 max-w-md">
          We couldn&apos;t reach the database. Please try again in a moment. If this keeps happening, check the
          server logs for <code>admin_page_exception</code>.
        </p>
      </div>
    );
  }
}
