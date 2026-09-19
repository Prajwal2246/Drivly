# Drivly Task Queue

Every remaining task, in the order to do them. Details, sizes and the reason for each task: [`docs/improvement-plan.md`](docs/improvement-plan.md). Why finished work was done the way it was: [`docs/decisions.md`](docs/decisions.md).

When a task is finished: tick it here, set its status in the plan, add a decision entry.

**Progress:** 32 tasks to build · 10 built but awaiting real-DB verification · setup steps below.

---

## 🧑‍💻 Waiting on you
- [x] Merge PR #9 (user-facing error messages)
- [x] Merge PR #10 (seed no longer needs app secrets)
- [ ] Decide on `develop` — delete, reset to `main`, or keep (it's behind `main`)
- [ ] Delete merged branches: `feat/auth-hardening`, `fix/remove-passwordless-demo-login`, `docs/deployment-runbook`

### Fix the Production deploy — `DEPLOYMENT.md` → "First deploy after the Module 1–3 merge"
✅ Done 2026-09-19: Production runs the new code, schema pushed, seeded; demo logins 200, feed shows 6 seeded vehicles, `/api/auth/user-login` → 404.
- [x] Supabase → Storage → **private** bucket `dl`
- [ ] Supabase → Storage → **public** bucket `vehicles` (optional: image/jpeg, image/png, image/webp; 4 MB)
- [x] Vercel → Environment Variables (Production)
- [ ] *Deferred:* Preview environment — needs `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` from the separate preview Supabase project + `db push`/`seed` there. Until then Preview builds fail (red check on PRs; doesn't block merging). Reset that project's DB password first (it was exposed in chat).: `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (`openssl rand -base64 32`), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
      - `DATABASE_URL` on Vercel = **transaction pooler (:6543)**, no `sslmode` parameter. `POSTGRES_*` vars are no longer read
- [ ] Local `.env` (`cp .env.example .env`) with the **session pooler (:5432)** URL of the database you're migrating
- [x] Clear old data (waitlist is kept): `echo 'TRUNCATE users, vehicles, bookings CASCADE;' | npx prisma db execute --stdin`
- [x] `npx prisma db push`
- [x] `npx prisma db seed` (needed for the demo buttons)
- [x] Redeploy on Vercel (via PR #9 merge)
- [x] **Reset the database password** (it was pasted in chat) → update `DATABASE_URL` in Vercel → redeploy

### Verify on the real database (turns 🔍 → ✅ in the plan)
- [ ] `npx tsx tests/booking-race.ts` against the transaction pooler — expect "1 of 10 concurrent requests won"
- [ ] Smoke test: demo login → feed → list a vehicle with photo → unlist/relist → admin licence view
- [x] Confirm `POST /api/auth/user-login` returns 404 on Production
- [x] Verified on Production (demo login, feed, dashboards): 1.1 · 1.2 · 2.1 · 2.3 · 2.4 · 2.6
- [ ] Still to verify: 1.6 licence upload + admin view · 3.2 vehicle photo upload (`vehicles` bucket) · 2.5 race test · 2.2 indexes (`EXPLAIN`, with 10.4)

---

## ▶️ Phase 1 — Make it work (~1 day of code)
- [x] 1.7 Remove passwordless demo login (#017)
- [x] 8.5 Users only see messages written for them (#019, PR #9)
- [ ] **4.3 Server-side pricing — booking is impossible from the UI today** (vehicle page always fails; feed modal unreachable)
- [ ] 9.1 CI pipeline: GitHub Actions + `npm test` (tsc, eslint, `tests/check.ts`, build)
- [ ] 8.7 Real "Verified" badges from `dlVerified`; honest "verified societies" copy (landing, FAQ, SEO)
- [ ] 8.8 Remove fake society listing counts/distances; fix "Greenwood Heights Cluster" name mismatch
- [ ] 10.1 Deploy with seeded demo data; live URL + demo buttons at top of README
- [ ] **Gate:** a stranger on the live URL can demo-login, browse, list a vehicle with a photo, request a booking, and sees readable errors

## ⏭️ Phase 2 — Make it credible (~2–3 days) → resume-ready
- [ ] 4.1 Booking state machine `canTransition(from, to, actor)` + participant check (closes skip-approval and stranger-cancel holes)
- [ ] 4.2 Cancellation + refund rule
- [ ] 4.4 Odometer validation (end ≥ start) + per-km overage
- [ ] 9.2 Tests for every transition and the pricing math (write alongside 4.1–4.4)
- [ ] 8.6 Delete or wire up the unreachable feed booking modal
- [ ] 4.5 Split `DashboardClient.tsx` (~1,000 lines) into `RenterBookings`, `OwnerBookings`, `InspectionModal`, `ChallanModal`
- [ ] 5.4 Reconcile `docs/roadmap.md` with the plan
- [ ] 9.5 Remove stale duplicate docs (`ARCHITECTURE.md`, `DATABASE.md`; update or remove `SECURITY.md`, `API.md`)
- [ ] 10.2 60–90s demo GIF/video of the full booking flow in README
- [ ] 10.3 README "Engineering highlights" + architecture diagram + CI badge
- [ ] **Gate (resume-ready):** full booking lifecycle works live, CI green with lifecycle tests, README shows GIF + badge

## 🚀 Phase 3 — Stand out (~4–5 days)
- [ ] 7.1 `User.isAdmin` replaces the shared admin password (one login system)
- [ ] 5.2 `Transaction` table (payment audit trail)
- [ ] 5.1 Razorpay test mode: deposit hold, capture, refund; signature-verified idempotent webhook
- [ ] 5.3 Renter disputes a challan → admin resolves
- [ ] 9.3 Postgres in CI: run `tests/booking-race.ts` + one API integration test
- [ ] **Gate:** test-mode payment round trip visible in Razorpay dashboard and `Transaction` table; CI runs DB tests

## 📏 Phase 4 — Measure and polish (~1–2 days)
- [ ] 9.4 Request ids in logs; log every `apiError`
- [ ] 10.4 Load test (k6/autocannon) + `EXPLAIN ANALYZE`; real p95 numbers in README
- [ ] 10.5 Final resume bullets — only what's true (see plan → Resume strategy)

## 🧩 Optional — only if time allows
- [ ] 6.1 Aggregate rating on `User`
- [ ] 6.2 Show ratings on vehicle cards and the owner dashboard
- [ ] 6.3 Prevent overwriting a review
- [ ] 7.2 Society admin + merge duplicate societies (DL verify part already done)
- [ ] 7.3 Waitlist → invite flow
- [ ] 8.1 Server Components for read-only data fetching
- [ ] 8.2 `loading.tsx` + `error.tsx` per route group
- [ ] 8.3 Accessibility: labels, modal focus trap, `aria-live` errors
- [ ] 8.4 Mobile layout of dashboard tables

**Skipped on purpose:** 3.3 availability endpoint, 3.4 feed filters/pagination (#016). **Not planned:** maps, feature flags, API versioning, Sentry.

---

## 📋 Per-task checklist
- [ ] Explain what the code does now and why it changes, before coding
- [ ] `npx tsc --noEmit` clean
- [ ] `npx tsx tests/check.ts` passes (add a check for non-trivial logic)
- [ ] `next build` passes (needs env vars)
- [ ] Decision entry appended to `docs/decisions.md`
- [ ] Task ticked here and status updated in the plan
- [ ] Branch prefix `feat/` `fix/` `test/` `docs/`, conventional commit, PR to `main`

## 📌 Custom backlog
- [ ] 
