/**
 * Public sandbox accounts for one-click demo on /login.
 * Seeded by prisma/seed.ts. Demo buttons use POST /api/auth/login
 * (same password path as real users) — no passwordless shortcut.
 */
export const DEMO_PASSWORD = 'demo123';

export const DEMO_ACCOUNTS = {
  renter: {
    phone: '5550001111',
    email: 'renter@drivly.demo',
    name: 'Demo Renter',
    role: 'RENTER' as const,
  },
  owner: {
    phone: '5550002222',
    email: 'owner@drivly.demo',
    name: 'Demo Owner',
    role: 'OWNER' as const,
  },
} as const;

export type DemoAccountKind = keyof typeof DEMO_ACCOUNTS;

export function demoLoginBody(kind: DemoAccountKind) {
  return { phone: DEMO_ACCOUNTS[kind].phone, password: DEMO_PASSWORD };
}
