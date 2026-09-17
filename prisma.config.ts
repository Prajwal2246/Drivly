import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // `?? ""` so `prisma generate` (no DB needed) still runs in build/CI; db push/seed fail loudly without it.
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
