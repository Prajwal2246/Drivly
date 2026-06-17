# 🚗 Drivly — Peer-to-Peer Society Vehicle Sharing MVP

Drivly is a modern, high-converting startup landing page MVP designed to collect waitlist registrations for a community-based vehicle sharing platform. It operates like **Airbnb + Society Verification + Vehicle Sharing** for residential communities.

This repository implements the warm minimalist frontend landing page, waitlist form validation, backend registration API, PostgreSQL database adapter, secure session middleware, and an interactive admin dashboard.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & React Server Components)
- **Language**: [TypeScript](https://www.typescript.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (using variable utility bindings)
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

### 1. Waitlist Registration Form

1. Scroll down to the **Join the Waitlist** form or click **Join Waitlist** in the navigation header.
2. Select your role. Selecting **Owner** or **Both** dynamically unfolds the vehicle specification section (type, model, brand, year, expected income).
3. Try submitting incomplete data to observe native Zod-based inline field validation errors.
4. Input details and click **Join the Waitlist**.
5. Once registered, a success card replaces the form. Submitting with the same email again will trigger an error badge prevent duplicates on the backend.

### 2. Admin Dashboard Access

1. Navigate to `/admin` or click the **Admin Portal** link in the website footer.
2. Next.js middleware will block the access and redirect you securely to `/admin/login`.
3. Input your `ADMIN_PASSWORD`
4. On validation, you gain access to the Waitlist Registrations Panel.
5. In the dashboard, you can:
   - **Search**: Instantly filter entries by name, email, city, or society.
   - **Role & City Filter**: Sort the view list dynamically.
   - **Inspect vehicle details**: Click the chevron dropdown button on a row to expand owner vehicle logs.
   - **Export CSV**: Export waitlist registration tables as a spreadsheet file.
   - **Logout**: Click the _Logout_ button to clear the HTTP-only cookie session.

---

## 📁 Project Directory Structure

```
├── prisma/
│   ├── schema.prisma           # PostgreSQL models for waitlist signups
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── login/          # Admin login interface page
│   │   │   └── page.tsx        # Server component to fetch database entries
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── login/      # Authenticate session cookies
│   │   │   │   └── logout/     # Clear session cookies
│   │   │   └── waitlist/       # Register waitlist entries (POST)
│   │   ├── globals.css         # Custom animations, custom scrollbars, & font vars
│   │   ├── layout.tsx          # Font loads, SEO OpenGraph metadata, & HTML skeleton
│   │   └── page.tsx            # Landing Page main content sections
│   ├── components/
│   │   ├── Header.tsx          # Sticky navigation & responsive layout triggers
│   │   ├── WaitlistForm.tsx    # Hook Form handling frontend validation
│   │   ├── FAQ.tsx             # Interactive FAQ Accordion
│   │   ├── Footer.tsx          # Branding links & Admin Portal button
│   │   └── AdminDashboardClient.tsx # Client-side state table with sorting & CSV exports
│   ├── lib/
│   │   ├── db.ts               # Prisma singleton client instantiation
│   │   └── validations.ts      # Shared validation schemas
│   └── middleware.ts           # Intercepts /admin routes using cookie validation
├── prisma.config.ts            # Prisma schema custom configuration mappings
├── tsconfig.json               # TypeScript configuration parameters
├── tailwind.config.ts          # Tailwind CSS configurations (v4 theme declarations)
└── package.json                # Project script commands & dependency bundles
```

---

## 🛡️ Security & Validations

- **Session Protection**: Middleware validates cookies to block unauthorized dashboard queries. Session cookies are marked as `HttpOnly`, `Secure`, and `SameSite=Strict`.
- **API Validation**: Backend validation guarantees that emails and phone parameters conform to Zod requirements before saving to the database, protecting the database layer.
