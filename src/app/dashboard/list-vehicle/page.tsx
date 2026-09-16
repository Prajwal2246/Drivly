import { redirect } from 'next/navigation';
import ListVehicleClient from '@/components/ListVehicleClient';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function ListVehiclePage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  return <ListVehicleClient user={user} />;
}
