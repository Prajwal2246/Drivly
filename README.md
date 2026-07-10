# 🚗 Drivly — Peer-to-Peer Society Vehicle Sharing Platform

Drivly is a modern peer-to-peer vehicle sharing platform designed exclusively for verified residential gated societies. It operates like **Airbnb + Society Verification + Vehicle Sharing** for closed communities.

This repository implements the warm minimalist frontend entryway portal, interactive society map selection, secure user session routing, and an admin dashboard.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & React Server Components)
- **Language**: [TypeScript](https://www.typescript.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (using variables and utility bindings)
- **Database & ORM**: PostgreSQL with [Prisma ORM 7](https://www.prisma.io/) (utilizing native pg adapter drivers)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v18.x or later)
- A running [PostgreSQL](https://www.postgresql.org/) database instance.

---

## 🔧 Getting Started & Local Setup

### 1. Configure Environment Variables

Create your local `.env` file from the repository template:

```bash
cp .env.example .env
```

Open `.env` and fill in your variables:

```env
# Database connection string
DATABASE_URL="postgresql://username:password@localhost:5432/drivly_db?schema=public"

# Password used to log into the /admin dashboard (e.g., admin)
ADMIN_PASSWORD="your_secure_admin_password"

# Cryptographic secret for signing JWT session cookies (at least 32 characters)
ADMIN_SESSION_SECRET="your_secure_random_jwt_signing_secret_key_here"
```

### 2. Generate Prisma Client

Generates the local Prisma client files based on your PostgreSQL schema:

```bash
npx prisma generate
```

### 3. Start the Application

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🔎 How to Verify Features

### 1. Society Selection Entryway

1. Scroll down to the **Enter your Society** section or click **Start Sharing Today** in the hero header.
2. **Interactive Society Cluster Selection**: 
   * Click inside the **Society / Community Name** field to trigger a localized gated society suggestion panel (e.g., Greenwood Heights, Green Park, Orchid Petals, Palm Meadows).
   * Hovering or clicking society suggestions highlights pins on the accompanying interactive SVG neighborhood cluster map. Clicking map pins auto-fills the input field.
3. Click **Enter Community**. This will dynamically trigger a redirect using the Next.js router, pushing you to `/login?society=[SelectedSocietyName]`.

### 2. Admin Dashboard Access & Cryptographic Security

1. Navigate to `/admin` or click the **Admin Portal** link in the website footer.
2. Next.js 16 Proxy middleware intercepts the route, cryptographically validates the session cookie signature, checks expiration boundaries, and redirects unauthorized attempts to `/admin/login`.
3. Input your `ADMIN_PASSWORD`.
4. On validation, the backend generates and signs a secure **HS256 JSON Web Token (JWT)** containing your admin claims and a 24-hour expiration (`exp`), setting it as an `HttpOnly`, secure cookie named `admin_session`.
5. Inside the Secure Dashboard Panel, you can inspect registered entries, filter signups, and log out securely.

---

## 📁 Project Directory Structure

```
├── docs/
│   ├── auth/
│   │   └── auth.md             # Authentication documentation
│   ├── marketplace/
│   │   └── marketplace.md      # Marketplace documentation
│   ├── bookings/
│   │   └── bookings.md         # Bookings lifecycle documentation
│   └── safety/
│       └── safety.md           # Safety checklist documentation
├── prisma/
│   ├── schema.prisma           # PostgreSQL models
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── login/          # Admin login interface page
│   │   │   └── page.tsx        # Server component to fetch database entries
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── login/      # Authenticate credentials and sign HS256 JWT
│   │   │   │   └── logout/     # Clear session cookie
│   │   │   ├── auth/
│   │   │   │   ├── login/      # User login endpoint
│   │   │   │   ├── logout/     # User logout endpoint
│   │   │   │   ├── profile/    # User profile update endpoint
│   │   │   │   └── register/   # User registration endpoint
│   │   │   ├── bookings/
│   │   │   │   ├── [id]/       # Update booking status
│   │   │   │   └── route.ts    # Fetch/create booking requests
│   │   │   ├── vehicles/       # Fetch/create vehicle listings
│   │   │   └── waitlist/       # Legacy waitlist api
│   │   ├── dashboard/
│   │   │   ├── list-vehicle/   # Listing page with role check
│   │   │   └── page.tsx        # User dashboard page (RSC)
│   │   ├── feed/               # Gated society vehicle sharing feed
│   │   ├── login/              # User login & register pages wrapped in Suspense
│   │   ├── profile/            # User profile settings page
│   │   ├── globals.css         # Custom animations, custom scrollbars, & font vars
│   │   ├── layout.tsx          # Font loads, SEO OpenGraph metadata, & HTML skeleton
│   │   └── page.tsx            # Landing Page main entryway sections
│   ├── components/
│   │   ├── Header.tsx          # Sticky navigation & responsive layout triggers
│   │   ├── WaitlistForm.tsx    # Society entryway input with interactive SVG map integration
│   │   ├── FAQ.tsx             # Interactive FAQ Accordion
│   │   ├── Footer.tsx          # Branding links & Admin Portal button
│   │   ├── AdminDashboardClient.tsx # Client-side state table for admin views
│   │   ├── DashboardClient.tsx # Client-side user dashboard workspace
│   │   ├── FeedClient.tsx      # Client-side vehicle browser feed
│   │   ├── ListVehicleClient.tsx # Lister form & borrower blockout views
│   │   ├── ProfileClient.tsx   # User details edit form
│   │   ├── EmptyState.tsx      # Minimalist empty state UI
│   │   └── VehicleCard.tsx     # Premium vector display cards
│   ├── lib/
│   │   ├── auth.ts             # Zero-dependency HS256 JWT signing and verification helpers
│   │   ├── db.ts               # Prisma client singleton instantiation
│   │   └── validations.ts      # Shared validation schemas
│   └── proxy.ts                # Next.js 16 Proxy middleware routing interceptor
├── prisma.config.ts            # Prisma schema custom configuration mappings
├── tsconfig.json               # TypeScript configuration parameters
├── postcss.config.mjs          # PostCSS configuration bindings
└── package.json                # Project script commands & dependency bundles
```

---

## 🛡️ Security & Validations

- **Cryptographic JWT Session**: Session protection relies on HMAC SHA-256 signatures validated against a server-side environment secret. Forged, tampered, or expired tokens are immediately rejected.
- **HttpOnly Cookies**: Session cookies are stored as `HttpOnly`, `Secure` (in production), and `SameSite=Lax` to enforce browser security constraints against XSS and CSRF.
