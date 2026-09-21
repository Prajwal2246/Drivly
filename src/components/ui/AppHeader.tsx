'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Car, LayoutDashboard, LogOut, Home } from 'lucide-react';

// The one header for every signed-in page (was 6 hand-written copies, only 2 with Log out). See #022.
const NAV = [
  { href: '/feed', label: 'Browse', Icon: Car },
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
];

export default function AppHeader({ name, society }: { name: string; society: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const initials = name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 h-16 px-4 sm:px-8 flex items-center justify-between gap-3 bg-paper/95 backdrop-blur border-b border-line text-ink">
      <div className="flex items-center gap-4 min-w-0">
        <Link href="/feed" className="flex items-center gap-2.5 shrink-0" aria-label="Drivly home">
          <span aria-hidden className="w-8 h-8 rounded-[10px] bg-primary text-on-primary flex items-center justify-center font-display font-bold text-lg">d</span>
          <span className="font-display text-xl font-semibold hidden sm:inline">drivly</span>
        </Link>
        <span className="hidden md:inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-sand text-[13px] font-semibold truncate">
          <Home aria-hidden className="w-3.5 h-3.5 shrink-0" />
          {society}
        </span>
      </div>

      <nav aria-label="Main" className="flex items-center gap-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`h-10 px-3 inline-flex items-center gap-2 rounded-[10px] text-[15px] ${
                active ? 'bg-primary-soft text-primary-ink font-semibold' : 'font-medium hover:bg-sand'
              }`}
            >
              <Icon aria-hidden className="w-4 h-4 sm:hidden" />
              <span className="sr-only sm:not-sr-only">{label}</span>
            </Link>
          );
        })}
        <Link
          href="/profile"
          aria-label={`Profile: ${name}`}
          aria-current={pathname === '/profile' ? 'page' : undefined}
          className={`ml-1 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
            pathname === '/profile' ? 'bg-primary text-on-primary' : 'bg-sand hover:bg-line'
          }`}
        >
          {initials}
        </Link>
        <button type="button" onClick={logout} aria-label="Log out" className="w-10 h-10 rounded-[10px] flex items-center justify-center hover:bg-sand cursor-pointer">
          <LogOut aria-hidden className="w-4 h-4" />
        </button>
      </nav>
    </header>
  );
}
