# 🚗 Drivly — Peer-to-Peer Society Vehicle Sharing MVP

Drivly is a modern, high-converting startup landing page MVP designed to collect waitlist registrations for a community-based vehicle sharing platform. It operates like **Airbnb + Society Verification + Vehicle Sharing** for residential communities.

This repository implements the warm minimalist frontend landing page, waitlist form validation, backend registration API, PostgreSQL database adapter, secure session proxy routing, and an interactive admin dashboard.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & React Server Components)
- **Language**: [TypeScript](https://www.typescript.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (using variables and utility bindings)
- **Form & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod Validation](https://zod.dev/)
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

### 2. Push Database Schema

Pushes the model schema definitions to your PostgreSQL instance and generates the local client files:

```bash
npx prisma db push
```

> [!NOTE]
> If you make modifications to `prisma/schema.prisma` in the future, re-run `npx prisma db push` to synchronize changes and update TypeScript definitions.

### 3. Start the Application

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🔎 How to Verify Features

### 1. Waitlist Registration Form & Dynamic Rules

1. Scroll down to the **Join the Waitlist** form or click **Join Waitlist** in the navigation header.
2. Select your role. Selecting **Owner** or **Both** dynamically unfolds the vehicle specification section (type, model, brand, year, expected income).
3. **Interactive Society Cluster Selection**: 
   * Click inside the **Society Name** field to trigger a localized gated society suggestion panel (e.g., Greenwood Heights, Green Park, Orchid Petals, Palm Meadows).
   * Hovering or clicking society name suggestions highlights pins on the accompanying interactive SVG neighborhood cluster map. Clicking map pins auto-fills the input field.
4. **Gated Trust Pre-verification**:
   * Check the "Pre-verify my DL for faster activation" box. 
   * Drag-and-drop or select an image file in the file uploader. A live simulated progress indicator (0% to 100%) will show progress and confirm successful upload.
5. Input other details and click **Join the Waitlist**.
6. Once registered, a success card replaces the form. Submitting with the same email again will trigger an error badge, preventing duplicate entries on the backend.

### 2. Admin Dashboard Access & Cryptographic Security

1. Navigate to `/admin` or click the **Admin Portal** link in the website footer.
2. Next.js 16 Proxy middleware intercepts the route, cryptographically validates the session cookie signature, checks expiration boundaries, and redirects unauthorized attempts to `/admin/login`.
3. Input your `ADMIN_PASSWORD`.
4. On validation, the backend generates and signs a secure **HS256 JSON Web Token (JWT)** containing your admin claims and a 24-hour expiration (`exp`), setting it as an `HttpOnly`, secure cookie named `admin_session`.
5. On the Secure Waitlist Registrations Panel, you can:
   * **Search**: Instantly filter entries by name, email, city, or society.
   * **Role & City Filter**: Sort waitlist signups dynamically.
   * **Inspect details**: Click the chevron dropdown button on a row to expand owner vehicle specifications and view **Driving License Pre-verification files**.
   * **Export CSV**: Export waitlist registration tables as a spreadsheet file.
   * **Logout**: Click the _Logout_ button to clear the HTTP-only JWT cookie.

---

## 📁 Project Directory Structure

```
├── prisma/
│   ├── schema.prisma           # PostgreSQL models including pre-verify columns
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── login/          # Admin login interface page
│   │   │   └── page.tsx        # Server component to fetch database entries
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── login/      # Authenticate credentials and sign HS256 JWT
│   │   │   │   └── logout/     # Clear session cookie
│   │   │   └── waitlist/       # Register waitlist entries (POST)
│   │   ├── globals.css         # Custom animations, custom scrollbars, & font vars
│   │   ├── layout.tsx          # Font loads, SEO OpenGraph metadata, & HTML skeleton
│   │   └── page.tsx            # Landing Page main content sections
│   ├── components/
│   │   ├── Header.tsx          # Sticky navigation & responsive layout triggers
│   │   ├── WaitlistForm.tsx    # Hook Form handling frontend validation & pre-verification uploads
│   │   ├── FAQ.tsx             # Interactive FAQ Accordion
│   │   ├── Footer.tsx          # Branding links & Admin Portal button
│   │   └── AdminDashboardClient.tsx # Client-side state table with sorting, filters, & CSV exports
│   ├── lib/
│   │   ├── auth.ts             # Zero-dependency HS256 JWT signing and verification helpers
│   │   ├── db.ts               # Prisma client singleton instantiation
│   │   └── validations.ts      # Shared Zod validation schemas
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
- **API Zod Validation**: Backend endpoints validate incoming payloads before performing database operations to protect database integrity and structure.
