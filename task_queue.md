# Drivly Task Queue

Use this file to track implementation progress across all development phases. Feel free to check off items `[x]`, edit schedules, or append new tasks to the custom backlog at the bottom.

---

## 📂 Phase 0: Product Planning & Setup (Done)
- [x] Create flat `/docs` folder structure under root
- [x] Write `vision.md` (Problem, audience, monetization, assumptions)
- [x] Write `requirements.md` (Functional & non-functional requirements)
- [x] Write `architecture.md` (Tech stack details & directory mapping)
- [x] Write `database.md` (Schema details, ERD mapping, indexes)
- [x] Write `security.md` (Access control, role limits, input validation)
- [x] Write `roadmap.md` (Development milestones & release phases)

## 📐 Phase 1: Design & Infrastructure (Done)
- [x] **Database Design**:
  - [x] Implement schema models (`User`, `Vehicle`, `Booking`)
  - [x] Add base constraints (foreign keys, unique keys, indexes)
  - [x] Configure Cascade Delete relationships
- [x] **Authentication Flow**:
  - [x] Implement secure registration (`POST /api/auth/register`)
  - [x] Implement secure login with HTTP-only signed JWT session cookie (`POST /api/auth/login`)
  - [x] Implement logout to clear cookie session (`POST /api/auth/logout`)
  - [x] Configure OTP-bypass demo login links for listers/borrowers on `/login`
- [x] **Authorization & Gating**:
  - [x] Restrict lister routes (`/dashboard/list-vehicle`) to block `RENTER` accounts
  - [x] Implement user profile setting page to allow role upgrades

## 🚗 Phase 2: Core Feature Implementation (Done)
- [x] **Vehicle Module**:
  - [x] Implement vehicle listing creation (`POST /api/vehicles`)
  - [x] Render dynamic vehicle SVGs (Sedan, Hatchback, SUV, Vespa, Cafe Racer) matching exact color codes
  - [x] Restrict search feed (`/feed`) to display only vehicles inside active user's society name
- [x] **Booking Module**:
  - [x] Enforce date scheduling rules (prevent past date requests)
  - [x] Prevent overlapping bookings for the same vehicle
  - [x] Block vehicle owners from reserving their own listings
  - [x] Design pre-trip safety checklist modals (`InspectionModal.tsx`)
  - [x] Validate start-trip odometer inputs matching last known records

## 💳 Phase 3: Payments & Deposits (Done)
- [x] Extend `Booking` schema with paymentStatus, depositAmount, refundAmount, and reviews
- [x] Integrate sandbox payment holding and capturing mock flow on trip status transitions
- [x] Build owner traffic challan logging endpoint and UI modals
- [x] Enforce automatic fine deduction from deposits upon completion
- [x] Design mutual renter-owner review logs on completed trips

## 🛡️ Phase 4: Observability & Observation (Production Engineering) (Done)
- [x] Implement structured JSON logging (auditing logins, booking changes, payments, and admin actions)
- [x] Standardize API HTTP error responses (consistent formats for 400, 401, 403, 404, 409, 422)
- [x] Swap generic console statements with formal logger utilities

## 🧪 Phase 5: Testing (Done)
- [x] Write Unit Tests for JWT verification and session helpers
- [x] Write Integration Tests for booking validation (overlap and past-date blocks)
- [x] Write End-to-End Tests for lister blocking checks and inspection checks

## 📋 Phase 6: Git & PR Strategy (Done)
- [x] Configure standard PR template checklists (Problem, Solution, Test Verification, Visual Mockups)
- [x] Enforce branch prefix conventions (`feat/`, `fix/`, `test/`, `docs/`)

## 📄 Phase 7: Documentation
- [ ] Create repository documents: `README.md`, `ARCHITECTURE.md`, `SECURITY.md`, `API.md`, `DEPLOYMENT.md`, `DATABASE.md`, `CONTRIBUTING.md`

## ⚡ Phase 8: Performance
- [ ] Setup image lazy loading, pagination, and debounce handlers
- [ ] Add query optimization checks to avoid database N+1 queries

## 📊 Phase 9: Observer Monitoring
- [ ] Setup `/api/health` checking endpoint
- [ ] Add timing middleware tracking API request latency and slow requests (>500ms)
- [ ] Configure mock Sentry monitoring hook

## 💎 Phase 10: Resume-Worthy Extras
- [ ] Implement Audit Logs database tables for sensitive actions
- [ ] Set up Soft Deletes across key tables (`deleted_at` filters in Prisma middleware)
- [ ] Add optimistic locking triggers on booking operations to avoid concurrency race conditions
- [ ] Create simulated background job queue hooks (handling simulated email/notification dispatches)

## 🏢 Phase 11: Society Verification & Radius
- [ ] Build Apartment Admin portal to create/verify societies
- [ ] Implement user joining flows for societies
- [ ] Add radius filters for nearby society listings (5km, 10km, 15km)

## 🔍 Phase 12: Advanced Search & Filtering
- [ ] Create advanced search queries (filter by Brand, Fuel, Transmission, Price, Availability)

## 🗺️ Phase 13: Maps Integration
- [ ] Integrate Google Maps or Leaflet for vehicle coordinates
- [ ] Display pickup/return pins and compute relative distance metrics

## 📅 Phase 14: Owner Booking Calendar
- [ ] Build calendar views showing booked, available, blocked, and maintenance dates

## ☁️ Phase 15: Image Storage
- [ ] Setup Cloudinary or AWS S3 integration for actual vehicle photo uploads
- [ ] Implement client-side image compression before uploads

## 📈 Phase 16: Admin Dashboard Indicators
- [ ] Add admin graphs: revenue, active/cancelled counts, pending verification lists, and average rental times

## 📝 Phase 17: Detailed API Specification
- [ ] Generate OpenAPI/Swagger schema documentation for backend routes

## 🛠️ Phase 18: Testing Coverage expansion
- [ ] Expand testing coverage to target payment failure rollbacks and transaction race conditions

## 🔄 Phase 19: CI/CD Pipeline
- [ ] Setup GitHub Actions pipeline (Install -> Lint -> Typecheck -> Run Tests -> Build -> Deploy)

## 🩺 Phase 20: System Health Checks
- [ ] Implement uptime status monitors and automatic alerts

## 🏎️ Phase 21: Database Query Optimizations
- [ ] Define database indexes on user query patterns (`societyName`, `ownerId`, `vehicleId`)

## 🛠️ Phase 22: Advanced SDE Controls
- [ ] Implement API versioning (`/api/v1/`)
- [ ] Set up feature flags for toggling optional workflows (e.g. radius check toggles)
- [ ] Add request tracing with correlation IDs across middleware layers

---

## 📋 Git & PR Checklist (Standard Workflow)
*Every branch merge should check:*
- [ ] Code is formatted and lint-free (`npx tsc --noEmit` and build pass)
- [ ] Branch follows prefix convention (`feat/`, `fix/`, `test/`, `docs/`)
- [ ] Pull Request matches template:
  * Problem statement
  * Solution detail
  * Verification steps/results
  * Screenshots (if UI modified)

---

## 📌 Custom Backlog
*Add your own tasks, ideas, or reminders below to pick them up later:*
- [ ] 
