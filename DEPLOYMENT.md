# Drivly Deployment & Local Hosting Guide

This guide describes how to configure environment variables, initialize databases, seed sandbox records, and deploy Drivly to production.

---

## 🛠️ Environment Configuration

Drivly requires a `.env` file in the root directory.

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/drivly_db?schema=public"

# Admin dashboard credentials
ADMIN_PASSWORD="your_secure_admin_password_here"

# HS256 JWT cookie signing secret key
ADMIN_SESSION_SECRET="your_cryptographic_signing_secret_here"
```

---

## 💾 Database Setup & Seed

Configure PostgreSQL tables and populate sandbox accounts using these commands:

### 1. Push Prisma Schema
Pushes schema models directly to your PostgreSQL database instance:
```bash
npx prisma db push
```

### 2. Populate Seed Records
Seeds the database with mock accounts, vehicles, and reviews:
```bash
npx prisma db seed
```

Creates public sandbox users (same credentials as `/login` demo buttons):
- Renter: `5550001111` / `demo123`
- Owner: `5550002222` / `demo123`

Demo buttons call `POST /api/auth/login` with those credentials (not a passwordless route). Re-seed Preview/Production if the buttons return incorrect phone/password.

### 3. Generate Type Definitions
```bash
npx prisma generate
```

---

## ☁️ Production Hosting

Drivly is optimized for serverless targets (like Vercel).

### Deploying to Vercel
1. Set up a PostgreSQL database (e.g. Neon, Supabase, or AWS RDS).
2. Configure the project environment variables in the Vercel Dashboard (`DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`).
3. Deploy the project repository:
   * Next.js App Router and Server Components will build and run on Edge and Serverless functions.
   * Middleware proxy routes will run on Edge Runtime for optimal redirect performance.
