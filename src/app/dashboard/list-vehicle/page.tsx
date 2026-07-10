import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwt } from '@/lib/auth';
import ListVehicleClient from '@/components/ListVehicleClient';

export const dynamic = 'force-dynamic';

export default async function ListVehiclePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-drivly-admin-session-secret-key-9988';
  const user = verifyJwt(token, secret);

  if (!user) {
    redirect('/login');
  }

  return <ListVehicleClient user={user} />;
}
