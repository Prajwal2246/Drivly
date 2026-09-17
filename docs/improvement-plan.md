# Drivly Improvement Plan

Source of truth for the improvement work. `task_queue.md` holds only the next actions and manual steps; this file holds every task, its status, and why it exists. Reasoning for each finished task lives in `docs/decisions.md` (numbers in the **Log** column).

**Status:** ✅ done · 🔍 done in code, not yet verified against a real DB/Supabase · ⏭️ skipped (reason logged) · ⬜ pending

**Sizes:** S = <1h, M = half-day, L = 1–2 days. Tasks inside a module are ordered by resume value ÷ effort.

**Workflow per task:** explain what the code does now and why it changes → implement → append a `docs/decisions.md` entry → `tsc --noEmit`, `npx tsx tests/check.ts`, `next build` → commit per module.

---

## Progress

| Module | Status | Commit |
|---|---|---|
| 1. Auth & Sessions | 🔍 6/7 — **1.7 critical, do first** | `fbb0a76` |
| 2. Database | 🔍 6/6 | `a0cce60` |
| 3. Vehicles & Feed | 🔍 3/5 done, 2 skipped | `9b98d85` |
| 4. Bookings & Trip Lifecycle | ⬜ 0/5 — **next** | |
| 5. Payments & Challans | ⬜ 0/4 | |
| 6. Reviews & Reputation | ⬜ 0/3 | |
| 7. Admin | ⬜ 0/3 (7.2 partly done by 1.6) | |
| 8. Frontend / UX | ⬜ 0/4 | |
| 9. Quality, CI, Observability | ⬜ 0/5 | |

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
| 1.7 | **Added, critical:** `POST /api/auth/user-login` signs a session for any phone with no password — anyone can log in as any user. Gate demo login to demo phones only (or route it through password auth; `origin/develop` 66177e0 has a fix to compare) | S | Full account takeover | ⬜ **do first** | |

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

## Suggested order for what's left
1. **1.7** (auth bypass) before any deployment. Manual steps in `task_queue.md` → verify Modules 1–3 against a real DB.
2. **4.3, 4.1, 4.2, 4.4** (fixes a live bug, then the core domain logic) → **9.1, 9.2** (CI + tests on that logic).
3. **8.5** (every error message is broken), **4.5** (split dashboard).
4. **7.1**, **5.2 → 5.1**, **5.3**, **5.4**.
5. Module 6, 7.2/7.3, rest of 8 and 9.

**Resume line once done:** *"Built a multi-tenant P2P vehicle-sharing platform (Next.js 16, Prisma/Postgres, Razorpay) with a transactional booking state machine, race-safe availability checks, scrypt-based auth, and CI-gated test suite."*
