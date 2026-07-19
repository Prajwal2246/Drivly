import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const rawUrls = [
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.SUPABASE_DATABASE_URL,
    process.env.DATABASE_URL,
  ].filter(Boolean) as string[];

  // Prefer IPv4 pooler connection strings (containing pooler or port 6543) over IPv6-only direct hosts
  const connectionString = 
    rawUrls.find(url => url.includes('pooler') || url.includes(':6543')) || 
    rawUrls[0] || 
    'postgresql://localhost:5432/parkshare';

  const isRemote = 
    process.env.NODE_ENV === 'production' || 
    Boolean(connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1'));

  const pool = new Pool({ 
    connectionString,
    ssl: isRemote ? { rejectUnauthorized: false } : undefined
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
