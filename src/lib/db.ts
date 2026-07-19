import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const connectionString = 
    process.env.POSTGRES_URL_NON_POOLING || 
    process.env.POSTGRES_PRISMA_URL || 
    process.env.SUPABASE_DATABASE_URL || 
    process.env.DATABASE_URL;

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
