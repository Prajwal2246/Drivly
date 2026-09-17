# Drivly Task Queue

Next actions only. The full plan, every task's status and the reasoning index live in [`docs/improvement-plan.md`](docs/improvement-plan.md); decisions in [`docs/decisions.md`](docs/decisions.md).

When a task is finished: tick it here, set its status in the plan, add a decision entry.

---

## 🚧 Manual steps (blocked on env / infra)
Needed before Modules 1–3 can be verified against a real database. See decisions #002, #003, #006, #009, #012, #015.
- [x] Supabase → Storage → create **private** bucket `dl`
- [ ] Supabase → Storage → create **public** bucket `vehicles` (optional: restrict MIME to image/jpeg, image/png, image/webp; 4MB)
- [ ] Local: `cp .env.example .env`, fill `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (`openssl rand -base64 32`), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `DATABASE_URL` = Supabase **Session pooler** URL (port 5432). `POSTGRES_*` vars are no longer read
- [ ] Vercel → Environment Variables: same five, Production + Preview (build fails without them — intended)
- [ ] Clear old users (required `societyId` FK + enum columns; waitlist is kept):
      `echo 'TRUNCATE users, vehicles, bookings CASCADE;' | npx prisma db execute --stdin`
- [ ] `npx prisma db push` — Module 1 renames, Module 2 enums/indexes/`societies`/Decimal, Module 3 `vehicles.listed` + `photoPath`
- [ ] `npx prisma db seed` — demo society + users (old pbkdf2 hashes no longer verify)
- [ ] `npx tsx tests/booking-race.ts` — expect "1 of 10 concurrent requests won"
- [ ] Smoke test: demo login → list vehicle with photo → unlist/relist → book from vehicle page (expected to fail until 4.3) → admin DL view
- [ ] Mark 🔍 tasks ✅ in the plan

## 🔥 Critical
- [ ] 1.7 Demo login (`/api/auth/user-login`) issues a session for any phone without a password — fix before deploying

## ▶️ Up next — Module 4: Bookings & Trip Lifecycle
- [ ] 4.3 Server-side `totalCost` (also fixes the detail-page booking 400)
- [ ] 4.1 Booking state machine `canTransition(from, to, actor)`
- [ ] 4.2 `CANCELLED` transition + refund rule
- [ ] 4.4 Odometer rules + per-km overage
- [ ] 4.5 Split `DashboardClient.tsx`
- [ ] 9.1 / 9.2 CI pipeline + state-machine and cost tests (right after Module 4)

## 📋 Per-module checklist
- [ ] `npx tsc --noEmit` clean
- [ ] `npx tsx tests/check.ts` passes
- [ ] `next build` passes (needs env vars)
- [ ] Decision entries appended
- [ ] Plan statuses updated
- [ ] Conventional commit, branch prefix `feat/` `fix/` `test/` `docs/`

## 📌 Custom backlog
- [ ] 
