# 🚗 Drivly — Peer-to-Peer Vehicle Sharing for Residential Societies

Drivly lets residents of the same society rent cars and bikes to each other. Every user belongs to one society, and they only see and book vehicles listed in it.

> **Status:** working MVP under active improvement. Progress and remaining work: [`docs/improvement-plan.md`](docs/improvement-plan.md). Why things are built the way they are: [`docs/decisions.md`](docs/decisions.md).

---

## ✨ What it does

**Renters**
- Browse vehicles listed in their own society, with owner photos or a type-based silhouette.
- Request a booking for a time slot; overlapping requests are rejected, including concurrent ones (row lock inside a transaction).
- Complete a pre-trip inspection checklist and starting odometer before the trip becomes active.
- Review the owner after the trip.

**Owners**
- List vehicles (validated server-side; renter-only accounts are blocked), upload a photo, edit, unlist/relist, or delete vehicles with no booking history.
- Approve or reject requests, see the renter's driving-licence verification status.
- Log a traffic challan; the fine is deducted from the renter's deposit.
- Review the renter after the trip.

**Everyone**
- Register / log in with phone + password; switch role between Renter, Owner and Both in the profile.
- Upload a driving licence (private storage); an admin verifies it.

**Admin** (`/admin`)
- Separate password login.
- Waitlist signups: search, filter, CSV export.
- Users: view each uploaded licence via a 5-minute signed link, verify or revoke it.

**Honest limits**
- **Payments are simulated.** Approving a booking marks a ₹5,000 deposit as held; completing it marks it paid and computes the refund. No money moves.
- **Societies are self-declared.** A society is created the first time someone registers with a new name + city. Nothing verifies that users actually live there.
- **"Verified Owner" / "DL Verified host" badges on vehicle cards are static text**, not driven by licence verification (tracked in the plan).

---

## 🛠️ Tech stack

- **Next.js 16** (App Router, Server Components, `proxy.ts` route protection) + **React 19** + **TypeScript**
- **PostgreSQL** via **Prisma 7** with the `@prisma/adapter-pg` driver adapter (hosted on Supabase)
- **Supabase Storage** over its REST API (no SDK) for licences and vehicle photos
- **Tailwind CSS v4**, **Lucide** icons, **zod** for input validation
- Auth is hand-rolled: scrypt password hashing (Node `crypto`) and HS256-signed JWT session cookies

---

## 🔧 Local setup

### Prerequisites
- **Node.js 20.9 or later** (required by Next.js 16)
- A PostgreSQL database (local, or a Supabase project)
- A Supabase project for file storage

### 1. Install
```bash
npm install
```

### 2. Environment variables
```bash
cp .env.example .env
```

All five are required — `src/lib/env.ts` throws at startup (and `next build` fails) if any is missing.

```env
# Postgres. On Supabase use the *Session pooler* URL (IPv4, port 5432) — it works for the app, db push and seed.
DATABASE_URL="postgresql://username:password@localhost:5432/drivly_db?schema=public"

# Password for the /admin dashboard
ADMIN_PASSWORD="change-me"

# HS256 secret for session cookies, at least 32 characters: openssl rand -base64 32
ADMIN_SESSION_SECRET=""

# Supabase → Project Settings → API. The service-role key is server-only.
SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY=""
```

### 3. Storage buckets (Supabase → Storage)
| Bucket | Visibility | Used for |
|---|---|---|
| `dl` | **Private** | Driving licences (admin reads via signed URLs) |
| `vehicles` | **Public** | Vehicle photos |

### 4. Database
```bash
npx prisma generate   # Prisma client
npx prisma db push    # create tables from prisma/schema.prisma
npx prisma db seed    # demo society, two demo users, six vehicles
```

> Upgrading an existing database from before the Society/enum changes? `db push` can't add the required `societyId` to existing users. See the manual steps in [`task_queue.md`](task_queue.md).

### 5. Run
```bash
npm run dev
```
Open http://localhost:3000.

**Demo accounts** (created by the seed, society "Greenwood Heights", Mumbai). The "Demo as Renter/Owner" buttons on `/login` sign in with these through the normal password login, so they only work after seeding:

| Role | Phone | Password |
|---|---|---|
| Renter | `5550001111` | `demo123` |
| Owner | `5550002222` | `demo123` |

---

## 🧪 Checks

```bash
npx tsc --noEmit              # type check
npx tsx tests/check.ts        # unit checks: JWT, password hashing, rate limiter, upload + vehicle validation, booking rules (no DB needed)
npx tsx tests/booking-race.ts # 10 concurrent bookings for one slot → exactly 1 succeeds (needs a seeded DB)
npm run build                 # production build (needs env vars)
npx eslint                    # lint
```

There is no `npm test` script or CI pipeline yet (plan task 9.1).

---

## 🛡️ Security

What's in place:
- **Passwords:** scrypt with a random 16-byte salt, constant-time comparison.
- **Sessions:** HS256 JWT in an `HttpOnly`, `SameSite=Lax` cookie (`Secure` in production), 24-hour expiry. No fallback secret — missing config fails at boot.
- **Rate limiting:** login routes allow 10 attempts per IP per 15 minutes. In-memory, so it's per serverless instance.
- **Tenancy:** feed, vehicle pages and booking creation all check the user's `societyId`.
- **Authorization in the API**, not just the UI: renters can't list vehicles; only owners edit/delete/photo their vehicles; only owners approve and only renters start/complete trips.
- **Input validation:** zod on register, profile and vehicle routes; enum columns in Postgres reject unknown statuses; money is `Decimal(10,2)`.
- **Files:** licences live in a private bucket and are only exposed to admins through short-lived signed URLs; uploads are type- and size-checked (≤4 MB).

Known gaps (tracked in [`docs/improvement-plan.md`](docs/improvement-plan.md)):
- Admin is a single shared password with its own cookie, separate from user accounts (task 7.1).
- Booking price is sent by the client (task 4.3).
- Database TLS doesn't verify the server certificate.

---

## 📁 Project structure

```
├── docs/
│   ├── improvement-plan.md       # Task-by-task plan with status — start here to pick up work
│   ├── decisions.md              # Append-only decision log (what, why, what was rejected)
│   └── vision.md, requirements.md, architecture.md, database.md, security.md, roadmap.md
├── prisma/
│   ├── schema.prisma             # Society, User, Vehicle, Booking, UserWaitlist + enums
│   └── seed.ts                   # Demo data
├── scripts/                      # Git hook: branch-name check (install: node scripts/install-hooks.js)
├── src/
│   ├── proxy.ts                  # Redirects unauthenticated users away from /feed, /dashboard, /profile, /admin
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── login/                # Login, register, demo login
│   │   ├── feed/                 # Society vehicle feed; [id] = vehicle details + booking
│   │   ├── dashboard/            # Rentals, my vehicles, incoming requests; list-vehicle/
│   │   ├── profile/              # Profile, role, licence upload
│   │   ├── admin/                # Admin dashboard + login
│   │   └── api/
│   │       ├── auth/             # login, register, logout, profile, profile/dl
│   │       ├── vehicles/         # GET/POST; [id] PATCH/DELETE; [id]/photo POST
│   │       ├── bookings/         # GET/POST; [id] PATCH (status, inspection, reviews, challans)
│   │       ├── admin/            # login, logout, users/[id] (verify), users/[id]/dl (signed URL)
│   │       └── waitlist/         # Unused by the current UI
│   ├── components/               # Client components (FeedClient, DashboardClient, VehicleCard, …)
│   └── lib/
│       ├── env.ts                # Required env vars, fail at boot
│       ├── db.ts                 # Prisma client
│       ├── auth.ts               # JWT sign/verify, scrypt hashing
│       ├── session.ts            # getSession / signSession
│       ├── rate-limit.ts         # Login rate limiter
│       ├── storage.ts            # Supabase Storage uploads, public + signed URLs
│       ├── booking-rules.ts      # Date/overlap rules, race-safe booking create
│       ├── validations.ts        # zod schemas, upload validator
│       ├── errors.ts             # apiError() → { success: false, error: { code, message } }
│       └── logger.ts             # Structured JSON logs
├── tests/
│   ├── check.ts                  # DB-free assert checks
│   └── booking-race.ts           # Concurrency check against a real DB
├── task_queue.md                 # Next actions + pending manual infra steps
└── API.md, ARCHITECTURE.md, DATABASE.md, SECURITY.md, DEPLOYMENT.md, CONTRIBUTING.md
```

> `ARCHITECTURE.md`, `DATABASE.md`, `SECURITY.md` and `API.md` predate the recent auth, database and vehicle changes and may be out of date; `docs/decisions.md` is current. Consolidating them is plan task 9.5.
