# Drivly Deployment & Local Hosting Guide

How to run Drivly locally and on Vercel + Supabase (Production / Preview).

---

## Live environments

| Env | URL |
|-----|-----|
| **Production** | https://drivly-mu.vercel.app/ |
| **Preview** | https://drivly-git-main-prajwa-janbandhus-projects.vercel.app/ |
| **Vercel dashboard** | https://vercel.com/prajwa-janbandhus-projects/drivly |

Prefer **separate Supabase databases** for Production vs Preview so seed/demo data never pollutes the resume demo.

---

## Local environment

Copy the template and use a **non-production** database:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://username:password@localhost:5432/drivly_db"
ADMIN_PASSWORD="your_secure_admin_password_here"
ADMIN_SESSION_SECRET="your_cryptographic_signing_secret_here_at_least_32_chars"
```

Do **not** leave the Production Supabase URL in local `.env` for day-to-day `npm run dev` — local scripts will write to prod.

```bash
npx prisma generate
npx prisma db push   # against your local/dev DB
npm install
npm run dev
```

Optional sandbox users (local/dev only):

```bash
npx prisma db seed
```

---

## Supabase connection strings (important)

| Use | Which URI | Port / host |
|-----|-----------|-------------|
| **Vercel app runtime** | Transaction **pooler** | host contains `pooler`, port **`6543`** |
| **`prisma db push` / seed from laptop** | **Direct** (or Session mode) | `db.<ref>.supabase.co` port **`5432`** |

`prisma db push` against pooler `:6543` often **hangs**. Ctrl+C, switch to direct `:5432` for CLI only, then put pooler back on Vercel for the app.

---

## Vercel Production (and Preview) env vars

### Required

| Name | Scope | Notes |
|------|--------|--------|
| `DATABASE_URL` | Production / Preview (different values) | **Only** Postgres URL the app should use — pooler `:6543` |
| `ADMIN_PASSWORD` | Production (+ Preview if needed) | Strong password |
| `ADMIN_SESSION_SECRET` | Production (+ Preview) | ≥32 random chars; no code fallbacks in mind for prod |

### Do **not** set alongside `DATABASE_URL` (causes overrides / TLS / wrong host)

Current `src/lib/db.ts` prefers (in order) `POSTGRES_PRISMA_URL` → `POSTGRES_URL_NON_POOLING` → `SUPABASE_DATABASE_URL` → `DATABASE_URL`, and picks the first URL containing `pooler` / `:6543`.

Supabase’s Vercel integration often injects:

* `POSTGRES_PRISMA_URL`
* `POSTGRES_URL_NON_POOLING`
* `POSTGRES_URL`

Those **override or confuse** a carefully set `DATABASE_URL` and have caused Production TLS errors (`self-signed certificate in certificate chain`) and Preview `Can't reach database server at db.…`.

**Target state:** one Postgres URL per environment — `DATABASE_URL` (pooler). Remove the other `POSTGRES_*` URL vars from that env scope (or leave them unset).

Safe to keep (not used by Prisma/`pg` for app queries): `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SECRET_KEY`.

### Optional

| Name | Scope | Notes |
|------|--------|--------|
| `DEMO_LOGIN=true` | Preview only | When demo-login gating is implemented; leave **unset** on Production |

**Note:** Vercel sets `NODE_ENV=production` on **both** Production and Preview. Do not gate demo features with `NODE_ENV !== 'production'`. Use `VERCEL_ENV` (`production` \| `preview`) or `DEMO_LOGIN`.

After changing env vars → **Redeploy** that environment.

---

## First-time schema on a new Supabase DB

1. Put the **direct** `:5432` URI in a local shell (not committed):

```bash
export DATABASE_URL="postgresql://postgres:…@db.<ref>.supabase.co:5432/postgres"
npx prisma db push
# optional — only if you want Demo as Renter/Owner buttons to use seed phones:
# npx prisma db seed
```

2. Set Vercel `DATABASE_URL` to the **pooler** `:6543` URI for that same project.
3. Redeploy.
4. Smoke-test register or login on the live URL.

Without seed, use **Register** on Production (demo buttons need seed users or auto-create paths).

---

## Deploying / promoting code

1. Feature work lands on `develop` via PR.
2. Promote `develop` → `main` when ready for Production (Vercel Production branch is typically `main`).
3. Preview deployments follow the Preview branch / PR deployments.
4. Confirm the deployment commit includes the intended `src/lib/db.ts` when debugging DB issues.

---

## Troubleshooting cheat sheet

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `table public.users does not exist` | Schema never pushed | `prisma db push` on that DB (direct URL) |
| `Can't reach database server at db.…` | Direct host from Vercel / wrong Preview URL | Use pooler `:6543` in that env’s `DATABASE_URL` |
| `self-signed certificate in certificate chain` | Competing `POSTGRES_*` URLs / SSL verify | Single pooler `DATABASE_URL`; remove other Postgres URL envs; redeploy |
| `prisma db push` hangs on `:6543` | Transaction pooler unsuitable for migrate | Use direct `:5432` for CLI only |
| Demo login works locally, Preview 401 HTML | Vercel Deployment Protection | Disable or share access for Preview |
