# Drivly Improvement Plan

Source of truth for the improvement work. `task_queue.md` holds only the next actions and manual steps; this file holds every task, its status, and why it exists. Reasoning for each finished task lives in `docs/decisions.md` (numbers in the **Log** column).

**Status:** ✅ done · 🔍 done in code, not yet verified against a real DB/Supabase · ⏭️ skipped (reason logged) · ⬜ pending

**Sizes:** S = <1h, M = half-day, L = 1–2 days. Tasks inside a module are ordered by resume value ÷ effort.

**Workflow per task:** explain what the code does now and why it changes → implement → append a `docs/decisions.md` entry → `tsc --noEmit`, `npx tsx tests/check.ts`, `next build` → commit per module.

---

## Progress

| Module | Status | Commit |
|---|---|---|
| 1. Auth & Sessions | 🔍 7/7 | `fbb0a76`, 1.7 on `fix/remove-passwordless-demo-login` |
| 2. Database | 🔍 6/6 | `a0cce60` |
| 3. Vehicles & Feed | 🔍 3/5 done, 2 skipped | `9b98d85` |
| 4. Bookings & Trip Lifecycle | ⬜ 0/5 — **next** | |
| 5. Payments & Challans | ⬜ 0/4 | |
| 6. Reviews & Reputation | ⬜ 0/3 | |
| 7. Admin | ⬜ 0/3 (7.2 partly done by 1.6) | |
| 8. Frontend / UX | ⬜ 0/4 | |
| 9. Quality, CI, Observability | ⬜ 0/5 | |
| 10. Showcase (resume) | ⬜ 0/5 | |

Branch: `feat/auth-hardening` (all modules so far, not merged to `main`).

🔍 → ✅ once the manual steps in `task_queue.md` are done (`db push`, seed, buckets) and `npx tsx tests/booking-race.ts` passes.

---

## 1. Auth & Sessions (`src/lib/auth.ts`, `src/proxy.ts`, `api/auth/*`)
| # | Change | Size | Why | Status | Log |
|---|---|---|---|---|---|
| 1.1 | Replace `pbkdf2Sync(…,1000)` with `crypto.scryptSync` + `timingSafeEqual` | S | 1k iterations is 2010-era; scrypt is stdlib | 🔍 | #002 |
| 1.2 | Delete hardcoded fallback secret; read once from `src/lib/env.ts` that throws at boot | S | Leaked-secret finding in any audit | 🔍 | #003 |
| 1.3 | Remove `console.log` in `proxy.ts` (logged secret prefix) | S | Contradicts "structured logging" | ✅ | #003 |
| 1.4 | Extract `getSession(req)` helper | S | Dedup ~16 copies; caught `user.id` vs `userId` bug | ✅ | #004 |
| 1.5 | Rate limit login routes (in-memory, IP-keyed) | S | First question on any login form | ✅ | #005 |
| 1.6 | Real DL upload to Supabase Storage, admin-verified | M | Was a fake claim | 🔍 | #006 |
| 1.7 | **Added, critical:** `POST /api/auth/user-login` signs a session for any phone with no password — anyone can log in as any user. Gate demo login to demo phones only (or route it through password auth; `origin/develop` 66177e0 has a fix to compare) | S | Full account takeover | ✅ route deleted; demo buttons use `/api/auth/login` | #017 |

## 2. Database (`prisma/schema.prisma`, `src/lib/db.ts`)
| # | Change | Size | Why | Status | Log |
|---|---|---|---|---|---|
| 2.1 | `role`, `type`, `status`, `paymentStatus`, `challanStatus` → Prisma enums | S | DB-level integrity | 🔍 | #007 |
| 2.2 | Indexes: `User(societyId)`, `Vehicle(ownerId)`, `Booking(vehicleId,startTime,endTime)`, `Booking(renterId)` | S | Every feed/booking query hits these | 🔍 | #008 |
| 2.3 | `Society` table → `User.societyId` FK | M | Tenancy on a free-text string | 🔍 | #009 |
| 2.4 | Money as `Decimal(10,2)` not `Float` | S | Float money is a classic gotcha | 🔍 | #010 |
| 2.5 | Booking create in `$transaction` with `SELECT … FOR UPDATE` | M | Fixes overlap race | 🔍 run `tests/booking-race.ts` | #011 |
| 2.6 | One `DATABASE_URL`, no URL guessing | S | App and migrations could hit different DBs | 🔍 | #012 |

## 3. Vehicles & Feed (`api/vehicles`, `FeedClient`, `VehicleCard`)
| # | Change | Size | Why | Status | Log |
|---|---|---|---|---|---|
| 3.1 | Zod schema for `POST /api/vehicles` + server-side RENTER block | S | Validation at trust boundary | ✅ | #013 |
| 3.2 | Vehicle photo upload (public Supabase bucket) with silhouette fallback | M | Real marketplaces have photos | 🔍 needs `vehicles` bucket | #015 |
| 3.3 | Availability endpoint `GET /api/vehicles/[id]/availability` | S | Grey out dates | ⏭️ detail page already gets bookings server-side | #016 |
| 3.4 | Feed filters + cursor pagination | M | Query design | ⏭️ society feed is tens of vehicles | #016 |
| 3.5 | Owner edit / unlist / delete (`PATCH`/`DELETE /api/vehicles/[id]`) | S | CRUD incomplete | ✅ (new `listed` column) | #014 |

## 4. Bookings & Trip Lifecycle (`api/bookings/*`, `booking-rules.ts`, `DashboardClient`) — NEXT
| # | Change | Size | Why | Status | Log |
|---|---|---|---|---|---|
| 4.1 | State machine in `booking-rules.ts`: `canTransition(from, to, actor)` table; route just calls it | S | Turns long `if` chains into a testable map. Also: decide whether "Borrowed" is derived from an ACTIVE booking (see #014) | ⬜ | |
| 4.2 | `CANCELLED` transition (renter before APPROVED, owner before ACTIVE) with refund rule | S | Enum exists, path doesn't | ⬜ | |
| 4.3 | Compute `totalCost` server-side from `pricePerHour × hours` | S | Client sends the price today. **Also fixes live bug:** `VehicleDetailsClient` doesn't send `totalCost`, so booking from the detail page always 400s | ⬜ | |
| 4.4 | Odometer: enforce `odometerEnd ≥ odometerStart`, per-km overage fee | S | Real pricing rule | ⬜ | |
| 4.5 | Split `DashboardClient.tsx` (~1,100 lines) into `RenterBookings`, `OwnerBookings`, `InspectionModal`, `ChallanModal`. Delete dead `handleAddVehicle`/`newVehicle` | M | Biggest maintainability smell | ⬜ | |

## 5. Payments & Challans
| # | Change | Size | Why | Status | Log |
|---|---|---|---|---|---|
| 5.1 | Razorpay test mode: order on APPROVED (deposit), capture on COMPLETED, refund on CANCELLED; webhook with signature check. Amounts in paise at the boundary (#010) | L | Real integration on the resume | ⬜ | |
| 5.2 | `Transaction` table (bookingId, type, amount, providerRef, status) instead of columns on Booking | M | Audit trail; pairs with 5.1 | ⬜ | |
| 5.3 | Challan: renter can `DISPUTED`, admin resolves | S | Enum value exists, no path uses it | ⬜ | |
| 5.4 | Reconcile docs: `docs/roadmap.md` says Phase 3 "Next Up" while old queue said Done | S | Reviewers read both | ⬜ | |

## 6. Reviews & Reputation
| # | Change | Size | Why | Status | Log |
|---|---|---|---|---|---|
| 6.1 | Aggregate rating on `User` (avg + count) updated in the review-write transaction | S | Denormalization judgment | ⬜ | |
| 6.2 | Show rating on `VehicleCard` and renter row in owner dashboard | S | Makes the feature visible | ⬜ | |
| 6.3 | One review per side per booking — guard against overwrite | S | | ⬜ | |

## 7. Admin (`/admin`, `AdminDashboardClient`)
| # | Change | Size | Why | Status | Log |
|---|---|---|---|---|---|
| 7.1 | Replace shared `ADMIN_PASSWORD` with `User.isAdmin` (one auth path) | M | Deletes `api/admin/login`, `admin_session` cookie, half of `proxy.ts` | ⬜ | |
| 7.2 | Society CRUD + merge duplicate societies (case variants, see #009). DL verify toggle already done in 1.6 | M | Gives admin a purpose | ⬜ partial | #006 |
| 7.3 | Waitlist → invite flow | S | Closes the landing-page loop | ⬜ | |

## 8. Frontend / UX
| # | Change | Size | Why | Status | Log |
|---|---|---|---|---|---|
| 8.1 | Data fetching in Server Components / server actions where the client only reads | M | Uses the App Router as intended | ⬜ | |
| 8.2 | `loading.tsx` + `error.tsx` per route group | S | | ⬜ | |
| 8.3 | Accessibility: input labels, modal focus trap, `aria-live` on errors | S | Cheap, frequently asked | ⬜ | |
| 8.4 | Mobile layout check on dashboard tables | S | | ⬜ | |
| 8.5 | **Added:** clients show `[object Object]` because API errors are `{ code, message }`; read `data.error.message` everywhere (fixed only in files touched by Module 3) | S | Every error message is broken | ⬜ | #013 |
| 8.6 | **Added:** `FeedClient` booking modal is unreachable (`onRequest` never called by `VehicleCard`) — delete or wire up | S | Dead code | ⬜ | |
| 8.7 | **Added:** "Verified Owner" / "DL Verified host" badges are hardcoded (`VehicleCard`, `VehicleDetailsClient`) — drive from `owner.dlVerified`. Landing/FAQ/SEO copy says "verified societies" though societies are self-declared | S | Fake trust claims | ⬜ | |
| 8.8 | **Added:** Landing society suggestions show made-up listing counts/distances, and "Greenwood Heights Cluster" doesn't match the seeded "Greenwood Heights" (registering creates an empty society). Remove fake numbers, fix names | S | Fake data | ⬜ | |

## 9. Quality, CI, Observability
| # | Change | Size | Why | Status | Log |
|---|---|---|---|---|---|
| 9.1 | `npm test` script + GitHub Actions: `tsc --noEmit`, `eslint`, `tsx tests/check.ts`, `next build` | S | "Tested" becomes verifiable | ⬜ | |
| 9.2 | State-machine + cost-calc tests in `tests/check.ts` (after 4.1, 4.3) | S | | ⬜ | |
| 9.3 | API integration test against local PG (docker-compose in CI); fold in `tests/booking-race.ts` | M | Honest unit vs integration split | ⬜ | |
| 9.4 | Request-id in logger; log on every `apiError` | S | | ⬜ | |
| 9.5 | Delete `ARCHITECTURE.md`/`DATABASE.md` duplicates of `docs/*.md` — keep one set (both are now stale vs. Modules 2–3) | S | | ⬜ | |

---

## 10. Showcase (resume)
Added 2026-09-17: what turns a working project into one that gets shortlisted — a link that works, proof it's tested, real numbers.
| # | Change | Size | Why | Status | Log |
|---|---|---|---|---|---|
| 10.1 | Deploy to Vercel with seeded demo data; live URL + demo buttons at top of README | S | Reviewers click the link before reading code | ⬜ | |
| 10.2 | 60–90s demo GIF/video of the full flow (list → book → approve → inspect → complete → refund) in README | S | Many reviewers watch instead of clicking | ⬜ | |
| 10.3 | README "Engineering highlights" linking to decisions + architecture diagram (browser → routes → Prisma → Postgres / Storage / Razorpay webhook) + CI badge | S | 30-second proof of depth | ⬜ | |
| 10.4 | Load test (k6/autocannon) on feed + booking create; `EXPLAIN ANALYZE` showing indexes used; record real p95 numbers in README | M | Real metrics for resume bullets — never invent numbers | ⬜ | |
| 10.5 | Final resume bullets — only claims that are true, each backed by code, a test or a decision entry | S | One false claim sinks the rest in an interview | ⬜ | |

## Known ceilings (accepted shortcuts, with upgrade triggers)
- Rate limiter is per serverless instance (#005) → shared store when abuse is observed.
- Booking race protection covers only `createBookingIfFree` (#011) → exclusion constraint once on `prisma migrate`.
- Vehicle delete count-then-delete race (#014) → lock the vehicle row.
- DB TLS skips cert verification (#012) → pass Supabase CA as `ssl.ca`.
- Replaced vehicle photos orphaned in storage (#015).
- Society names are case-sensitive (#009) → admin merge (7.2).
- Schema changes use `db push`, not migrations → adopt `prisma migrate` before real users.

## Unscheduled ideas (carried over from the old task queue, not in this plan)
`/api/health` endpoint · request latency timing · Sentry · audit-log table · soft deletes · background job queue for notifications · society radius/maps · owner booking calendar · admin charts · OpenAPI spec · API versioning · feature flags · correlation IDs (overlaps 9.4).

## Roadmap — execution order
Each phase ends with a **gate**: don't start the next phase until it passes. One branch + PR per phase; CI must be green before merge (from Phase 1 onward).

### Phase 1 — Make it work (~1–2 days; branch `feat/auth-hardening`, PR #6, then `fix/demo-blockers`)
1. **1.7** Remove passwordless demo login → demo buttons use real login
2. **Verify Modules 1–3 on a real DB** — manual steps in `task_queue.md` (you), fix whatever breaks (code)
3. **Merge PR #6 → deploy** (10.1, first pass)
4. **9.1** CI pipeline — before more features, so every later PR is checked
5. **8.5** error messages · **8.7** real verified badges + honest copy · **8.8** remove fake society data

**Gate:** live URL; a stranger can use demo login, browse the feed, list a vehicle with a photo, and see real error messages. (Booking from the vehicle page still fails until 4.3.)

### Phase 2 — Make it credible (~2–3 days; branch `feat/bookings`)
6. **4.3** Server-side pricing (fixes detail-page booking; one pricing function shared with the UI quote)
7. **4.1** State machine `canTransition` + participant check (closes skip-approval and stranger-cancel holes)
8. **4.2** Cancellation + refund rule
9. **4.4** Odometer validation + per-km overage
10. **9.2** Tests for every transition and the pricing math — written alongside 6–9, not after
11. **8.6** Delete dead feed modal · **4.5** Split `DashboardClient.tsx` (last, once the flow is final)
12. **5.4 + 9.5** Reconcile/delete stale docs · **10.2** demo GIF · **10.3** README highlights + diagram + CI badge

**Gate — resume-ready checkpoint:** full booking lifecycle works on the live URL, CI green with lifecycle tests, README shows GIF + badge + highlights.

### Phase 3 — Stand out (~4–5 days; branches `feat/admin-auth`, `feat/payments`)
13. **7.1** `User.isAdmin` replaces shared admin password (before payments: admin resolves disputes/refunds)
14. **5.2** `Transaction` table
15. **5.1** Razorpay test mode: hold on approve, capture on complete, refund on cancel; signature-verified, idempotent webhook
16. **5.3** Challan dispute → admin resolves
17. **9.3** Postgres in CI; run `tests/booking-race.ts` + one API integration test there

**Gate:** a test-mode payment round-trip (hold → capture/refund) visible in the Razorpay dashboard and the `Transaction` table; CI runs DB tests.

### Phase 4 — Measure and polish (~1–2 days)
18. **9.4** Request ids in logs
19. **10.4** Load test + `EXPLAIN ANALYZE`; put real numbers in README
20. **10.5** Write resume bullets from what's now true
21. Optional, only if time: **6.1–6.3** ratings · **7.2** society admin/merge · **7.3** waitlist invites · **8.1–8.4** RSC, loading/error states, a11y, mobile

**Not doing** (low shortlisting value): maps/radius, feature flags, API versioning, Sentry mock, feed pagination (#016).

---

## Resume strategy

### How shortlisting works (what this plan optimizes for)
1. **Keyword filter (ATS / recruiter):** Next.js, TypeScript, PostgreSQL, Prisma, REST APIs, transactions, CI/CD, testing, payments.
2. **6-second skim:** numbers, concrete engineering words ("race condition", "state machine", "webhook"), a link.
3. **The link must work.** A broken demo or an honest "payments are simulated" caveat on a payments bullet is worse than no link.
4. **Interview drills into one bullet.** `docs/decisions.md` is the prep — every choice has a written why and what was rejected. Re-read it before interviews.

Rules: fewer things that are real, deployed, tested and explainable beat many half-done features. Never claim anything that isn't true (no "verified societies", invented user counts or made-up metrics).

### Target resume bullets — use each only once its condition is met
**Drivly — P2P vehicle-sharing platform for residential societies** · Next.js 16, TypeScript, PostgreSQL, Prisma, Razorpay · [live] [GitHub]

| Bullet | True after |
|---|---|
| Built a multi-tenant rental marketplace with per-society data isolation, role-based access (renter/owner/admin), and server-side validation on every API route. | 1.7, 7.1 |
| Prevented double-booking under concurrency with Postgres row-level locking inside a transaction; verified by a test where exactly 1 of 10 concurrent requests succeeds. | 2.5 verified, 9.3 |
| Modeled the booking lifecycle as an explicit state machine (request → approve → inspect → active → complete/cancel) with server-computed pricing, deposits, fines and refunds using `Decimal` money. | Phase 2 |
| Integrated Razorpay (test mode) for deposit hold, capture and refund with signature-verified, idempotent webhooks and a transaction audit trail. | 5.1, 5.2 |
| Hardened authentication: scrypt password hashing, signed HttpOnly session cookies, login rate limiting, fail-fast secret config; found and fixed an account-takeover bug in a self-audit. | 1.7 |
| Set up a GitHub Actions pipeline (typecheck, lint, unit + DB integration tests, build); reduced key query latency to ___ ms p95 through indexing. | 9.1–9.3, 10.4 (real number only) |

One-line summary once Phase 3 is done: *"Built a multi-tenant P2P vehicle-sharing platform (Next.js 16, Prisma/Postgres, Razorpay) with a transactional booking state machine, race-safe availability checks, scrypt-based auth, and CI-gated test suite."*
