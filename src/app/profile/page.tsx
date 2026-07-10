import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwt } from '@/lib/auth';
import { prisma } from '@/lib/db';
import ProfileClient from '@/components/ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-drivly-admin-session-secret-key-9988';
  const user = verifyJwt(token, secret);

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
    },
  });

  if (!fullUser) {
    redirect('/login');
  }

  return <ProfileClient initialUser={fullUser} />;
}
