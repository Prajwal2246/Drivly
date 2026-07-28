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

### 3. Generate Type Definitions
```bash
npx prisma generate
```

---

## ☁️ Production Hosting

Drivly is deployed on Vercel (team: `prajwa-janbandhus-projects`, project: `drivly`).

| Env | URL |
|-----|-----|
| Production | https://drivly-mu.vercel.app/ |
| Preview (`main`) | https://drivly-git-main-prajwa-janbandhus-projects.vercel.app/ |
| Dashboard | https://vercel.com/prajwa-janbandhus-projects/drivly |

### Environment variables (Vercel Dashboard)
Configure separately for **Production** vs **Preview** where possible:

* `DATABASE_URL` (and any Supabase/Postgres pooler URLs) — prefer a **different** DB for Preview
* `ADMIN_PASSWORD`
* `ADMIN_SESSION_SECRET` (no hardcoded fallback in code for Production)
* Optional: `DEMO_LOGIN=true` **only** on Preview — leave unset on Production

**Note:** Vercel sets `NODE_ENV=production` on both Production and Preview. Use `VERCEL_ENV` (`production` | `preview` | `development`) or `DEMO_LOGIN` to distinguish environments in code.

### Deploying / redeploying
1. Push to the Git branch linked in Vercel (confirm Production branch in project Git settings).
2. Preview deployments are created per branch/commit; Production promotes from the Production branch.
3. After changing env vars, redeploy so serverless functions pick them up.
