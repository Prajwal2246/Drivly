# System Architecture

This document explains the technical architecture, project directory layout, and backend logic patterns used in Drivly.

## 1. Technical Stack
* **Framework**: Next.js 16 (App Router)
* **Styling**: Tailwind CSS v4 (Vanilla CSS utility stack)
* **Database client**: Prisma ORM with PostgreSQL backend
* **Icons**: Lucide React
* **Hosting / Runtime**: Node.js Edge-compatible environment

## 2. Directory Layout
```
/
├── docs/                     # Project Specifications & Vision
│   ├── vision.md             # Product Vision & Strategy
│   ├── requirements.md       # Functional & Non-Functional Specs
│   ├── architecture.md       # Tech Stack & Layout
│   ├── database.md           # Schema & ERD
│   ├── security.md           # Access Control & Validation
│   └── roadmap.md            # Release Roadmap
├── prisma/                   # Prisma Schema & Database Seeding
│   ├── schema.prisma         # Database Entities & Mappings
│   └── seed.ts               # Demo Sandbox Seeding Script
├── public/                   # Static Assets (Logos, Icons)
├── src/
│   ├── app/                  # Next.js Pages & API Handlers
│   │   ├── api/              # RESTful API Routing Layer
│   │   ├── feed/             # Society-gated Marketplace Grid
│   │   └── profile/          # User Settings & Settings Update
│   ├── components/           # Reusable UI Components (Feed, VehicleCard)
│   ├── lib/                  # JWT Session Signers & Prisma Clients
│   └── proxy.ts              # Route interceptor proxy (Middleware replacement)
```

## 3. Session & Route Interceptor Flow
* **Interceptor Proxy (`src/proxy.ts`)**: Acts as a middleware gateway. It checks incoming routes (e.g. `/feed`, `/dashboard`, `/profile`) for the presence of a valid `user_session` cookie. If missing or invalid, it redirects the client to `/login`.
* **Token Signatures**: Session payloads are signed using standard HMAC-SHA256 signatures backed by an environment `SESSION_SECRET` key.

## 4. Gated Filtering Engine
* Real-time querying matches the active lister's `societyName` against the database.
* The vehicle grid automatically suppresses listings from neighboring societies, enforcing community isolation and peer-to-peer trust boundaries.
