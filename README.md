# 🚗 Drivly — Peer-to-Peer Society Vehicle Sharing Platform

Drivly is a modern peer-to-peer vehicle sharing platform designed exclusively for verified residential gated societies. It operates like **Airbnb + Society Verification + Vehicle Sharing** for closed communities.

This repository implements the landing portal, interactive society selection, auth, society-scoped vehicle feed, bookings, and an admin dashboard.

### Live demos

| Env | URL |
|-----|-----|
| **Production** | https://drivly-mu.vercel.app/ |
| **Preview** | https://drivly-git-main-prajwa-janbandhus-projects.vercel.app/ |

Setup & Vercel/Supabase runbook: [`DEPLOYMENT.md`](./DEPLOYMENT.md).  
What to build next: [`task_queue.md`](./task_queue.md).

### What’s real vs mock

| Real | Mock / sandbox |
|------|----------------|
| Register, password login, JWT cookies | Passwordless **Demo as Renter/Owner** (dev convenience — gate on Production; see security backlog) |
| Society-scoped listings & bookings | Aadhaar / government DL APIs, digital keys |
| Mock deposit hold / challan / reviews in DB | Real payment capture (Razorpay/Stripe) |
| Admin password portal | Full society-admin verification product |

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & React Server Components)
- **Language**: [TypeScript](https://www.typescript.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (using variables and utility bindings)
- **Database & ORM**: PostgreSQL (Supabase) with [Prisma ORM 7](https://www.prisma.io/) (`pg` driver adapter)
- **Hosting**: Vercel
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v18.x or later)
- A running [PostgreSQL](https://www.postgresql.org/) database instance (local or Supabase).

---

## 🔧 Getting Started & Local Setup

### 1. Configure Environment Variables

Create your local `.env` file from the repository template:

```bash
cp .env.example .env
```

Open `.env` and fill in your variables (use a **non-production** DB locally):

```env
DATABASE_URL="postgresql://username:password@localhost:5432/drivly_db"
ADMIN_PASSWORD="your_secure_admin_password"
ADMIN_SESSION_SECRET="your_secure_random_jwt_signing_secret_key_here"
```

On Vercel, use a **single** pooler `DATABASE_URL` per environment. Do not combine it with Supabase integration `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING` / `POSTGRES_URL` — see [`DEPLOYMENT.md`](./DEPLOYMENT.md).

### 2. Generate Prisma Client & schema

```bash
npx prisma generate
npx prisma db push
```

### 3. Start the Application

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔎 How to Verify Features

### 1. Society Selection Entryway

1. Scroll down to the **Enter your Society** section or click **Start Sharing Today** in the hero header.
2. **Interactive Society Cluster Selection**: 
   * Click inside the **Society / Community Name** field to trigger a localized gated society suggestion panel (e.g., Greenwood Heights, Green Park, Orchid Petals, Palm Meadows).
   * Hovering or clicking society suggestions highlights pins on the accompanying interactive SVG neighborhood cluster map. Clicking map pins auto-fills the input field.
3. Click **Enter Community**. This will dynamically trigger a redirect using the Next.js router, pushing you to `/login?society=[SelectedSocietyName]`.

### 2. Auth & feed (60-second path)

1. Open `/login` (or Production URL above).
2. **Register** a renter (or use Demo buttons only if that environment has seed/demo users).
3. Sign in → `/feed` shows vehicles in your society.
4. Owners can list via dashboard; renters request bookings; owners approve; trip start/complete flows update status.

Login failures show a short human-readable alert (not raw Prisma/TLS dumps).

### 3. Admin Dashboard Access & Cryptographic Security

1. Navigate to `/admin` or click the **Admin Portal** link in the website footer.
2. Next.js Proxy middleware intercepts the route, validates the session cookie signature, checks expiration, and redirects unauthorized attempts to `/admin/login`.
3. Input your `ADMIN_PASSWORD`.
4. On validation, the backend signs an **HS256 JWT** (24h `exp`) as an `HttpOnly` cookie `admin_session`.
5. Inside the dashboard you can inspect waitlist/signups and log out.

---

## 📁 Project Directory Structure

```
├── .github/
│   └── pull_request_template.md
├── docs/
├── prisma/
├── scripts/
├── src/
├── tests/
├── ARCHITECTURE.md
├── DATABASE.md
├── SECURITY.md
├── API.md
├── DEPLOYMENT.md               # Vercel + Supabase runbook
├── CONTRIBUTING.md
├── task_queue.md               # Resume/interview prioritized backlog
└── package.json
```

---

## 🛡️ Security & Validations

- **Cryptographic JWT Session**: HMAC SHA-256 signatures validated against `ADMIN_SESSION_SECRET`. Forged, tampered, or expired tokens are rejected.
- **HttpOnly Cookies**: `HttpOnly`, `Secure` (in production), `SameSite=Lax`.
- **Known gaps / backlog**: Demo login is passwordless; some API trust boundaries still need hardening — tracked in [`task_queue.md`](./task_queue.md) Track A.
