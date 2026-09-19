# Drivly Deployment Guide

How to run Drivly locally and on Vercel + Supabase. Reasoning behind the database settings: `docs/decisions.md` #012 and #018.

---

## Live environments

| Env | URL |
|-----|-----|
| **Production** (branch `main`) | https://drivly-mu.vercel.app/ |
| **Preview** | https://drivly-git-main-prajwa-janbandhus-projects.vercel.app/ |
| **Vercel dashboard** | https://vercel.com/prajwa-janbandhus-projects/drivly |

Use **separate Supabase databases** for Production and Preview/local, so seeding and testing never touch the demo that recruiters see.

---

## Environment variables

All five are required. `src/lib/env.ts` throws at startup, so **`next build` fails on Vercel if any is missing**.

| Name | Notes |
|------|-------|
| `DATABASE_URL` | The only Postgres URL the app reads. Value depends on where it runs — see below. |
| `ADMIN_PASSWORD` | Password for `/admin`. |
| `ADMIN_SESSION_SECRET` | ≥32 random chars: `openssl rand -base64 32`. Different per environment. |
| `SUPABASE_URL` | Supabase → Project Settings → API. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. Never expose to the client or commit it. |

Set them in Vercel → Project Settings → Environment Variables for **Production** and **Preview** separately, then **redeploy**.

Not read by the app (safe to leave, but don't rely on them): `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_URL` added by the Supabase–Vercel integration, and `NEXT_PUBLIC_SUPABASE_*`.

### Which Supabase URL goes in `DATABASE_URL`

| Where | Use | Why |
|-------|-----|-----|
| **Vercel (app runtime)** | **Transaction pooler** — `…pooler.supabase.com:6543` | Serverless functions open many short connections; transaction mode shares a small pool. Supports the booking transaction (#011). |
| **Laptop (`db push`, `db seed`, `tests/booking-race.ts`)** | **Session pooler** — `…pooler.supabase.com:5432` | IPv4 (the direct `db.<ref>.supabase.co` host is IPv6-only). `db push` hangs on the transaction pooler. |

**Do not add `?sslmode=require`** (or any `sslmode`) to `DATABASE_URL`. The `pg` driver lets URL parameters override the TLS options in `src/lib/db.ts`, and it treats `require` as `verify-full`, which fails on Supabase with `self-signed certificate in certificate chain`. The URLs the Vercel integration generates include it — copy the URI from Supabase → Connect instead, or strip the parameter.

`db.ts` already enables TLS for any non-localhost host.

---

## Local setup

```bash
npm install
cp .env.example .env        # fill all five; use a non-production database
npx prisma generate
npx prisma db push
npx prisma db seed          # demo society, demo users (password demo123), vehicles
npm run dev
```

Don't keep the Production database URL in your local `.env` — `db seed` deletes all users, vehicles and bookings.

---

## Supabase Storage buckets

Create once per Supabase project (Storage → New bucket):

| Bucket | Public? | Used for |
|--------|---------|----------|
| `dl` | **No** (private) | Driving licences; admins view via 5-minute signed URLs |
| `vehicles` | **Yes** | Vehicle photos |

Optional: restrict `vehicles` to `image/jpeg, image/png, image/webp`, max 4 MB.

---

## First deploy after the Module 1–3 merge (one time)

The schema changed in ways `db push` can't apply to existing rows (required `societyId`, enum columns, renamed columns). For each database (Production, Preview):

1. Vercel: set all five env vars for that environment (transaction pooler URL, no `sslmode`).
2. Supabase: create the `vehicles` bucket.
3. From your laptop, with `DATABASE_URL` set to that database's **session pooler** URL:
   ```bash
   echo 'TRUNCATE users, vehicles, bookings CASCADE;' | npx prisma db execute --stdin   # waitlist is kept
   npx prisma db push
   npx prisma db seed        # needed for the "Demo as Renter/Owner" buttons
   npx tsx tests/booking-race.ts
   ```
4. Vercel: redeploy. Smoke test: demo login → feed → list a vehicle with a photo → admin licence view.

All existing users are logged out once (session format changed, #009).

---

## Branches and deploys

- Pull requests target `main`. Merging to `main` deploys Production.
- Every PR gets a Preview deployment.
- A failed build does not take Production down — Vercel keeps serving the last successful deployment. Check the commit status on GitHub or `npx vercel inspect <deployment-id> --logs`.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Build fails: `Missing or too-short env var …` | Env var not set for that environment | Set it in Vercel, redeploy |
| `self-signed certificate in certificate chain` | `sslmode=require` in `DATABASE_URL` | Remove the `sslmode` parameter |
| `Can't reach database server at db.<ref>.supabase.co` | Direct host is IPv6-only | Use a pooler URL |
| `prisma db push` hangs | Transaction pooler (`:6543`) | Use the session pooler (`:5432`) from the laptop |
| `table public.users does not exist` | Schema never pushed to that database | `npx prisma db push` against it |
| Demo buttons: "Demo accounts exist only after seeding" | Database not seeded | `npx prisma db seed` against it |
| Everyone logged out after deploy | Session format changed (#009) | Expected once |
| Preview returns a Vercel login page | Vercel Deployment Protection | Disable it or share access for Preview |
