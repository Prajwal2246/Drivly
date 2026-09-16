import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import ProfileClient from '@/components/ProfileClient';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // Fetch full user profile details from the database
  const fullUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      societyName: true,
      role: true,
      dlPath: true,
      dlVerified: true,
    },
  });

  if (!fullUser) {
    redirect('/login');
  }

  return <ProfileClient initialUser={fullUser} />;
}
