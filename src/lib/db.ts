import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '@prisma/client';

// Route handlers return Prisma rows through NextResponse.json. Decimal's default toJSON is a string ("180"),
// which clients would concatenate (`sum + b.totalCost`). Money math that persists stays in Decimal. See #010.
(Prisma.Decimal.prototype as { toJSON(): unknown }).toJSON = function (this: Prisma.Decimal) { return this.toNumber(); };

// Checked here rather than in env.ts so DB-only scripts (seed, race test) don't need the app's secrets. See #012, #018, #020.
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('Missing env var DATABASE_URL. See .env.example');

const prismaClientSingleton = () => {
  const local = ['localhost', '127.0.0.1'].includes(new URL(DATABASE_URL).hostname);
  // ponytail: TLS without cert verification — Supabase's CA isn't in Node's store. Upgrade: pass its CA as `ssl.ca`.
  const adapter = new PrismaPg({ connectionString: DATABASE_URL, ssl: local ? undefined : { rejectUnauthorized: false } });
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
