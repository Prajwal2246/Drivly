# Drivly Task Queue

Next actions only. The full plan, every task's status and the reasoning index live in [`docs/improvement-plan.md`](docs/improvement-plan.md); decisions in [`docs/decisions.md`](docs/decisions.md).

When a task is finished: tick it here, set its status in the plan, add a decision entry.

---

## 🚧 Manual steps (blocked on env / infra)
Needed before Modules 1–3 can be verified against a real database. See decisions #002, #003, #006, #009, #012, #015.
- [x] Supabase → Storage → create **private** bucket `dl`
- [ ] Supabase → Storage → create **public** bucket `vehicles` (optional: restrict MIME to image/jpeg, image/png, image/webp; 4MB)
- [ ] Local: `cp .env.example .env`, fill `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (`openssl rand -base64 32`), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `DATABASE_URL`: session pooler (:5432) locally, **transaction pooler (:6543) on Vercel**, no `sslmode` param. `POSTGRES_*` vars are no longer read. Full steps: `DEPLOYMENT.md` → First deploy
- [ ] Vercel → Environment Variables: same five, Production + Preview (build fails without them — intended)
- [ ] Clear old users (required `societyId` FK + enum columns; waitlist is kept):
      `echo 'TRUNCATE users, vehicles, bookings CASCADE;' | npx prisma db execute --stdin`
- [ ] `npx prisma db push` — Module 1 renames, Module 2 enums/indexes/`societies`/Decimal, Module 3 `vehicles.listed` + `photoPath`
- [ ] `npx prisma db seed` — demo society + users (old pbkdf2 hashes no longer verify)
- [ ] `npx tsx tests/booking-race.ts` — expect "1 of 10 concurrent requests won"
- [ ] Smoke test: demo login → list vehicle with photo → unlist/relist → book from vehicle page (expected to fail until 4.3) → admin DL view
- [ ] Mark 🔍 tasks ✅ in the plan

## ▶️ Phase 1 — Make it work (full roadmap: `docs/improvement-plan.md` → Roadmap)
- [x] 1.7 Remove passwordless demo login (`/api/auth/user-login`)
- [ ] Manual steps above → verify Modules 1–3 on a real DB
- [ ] Merge PR #6 → deploy to Vercel (10.1)
- [ ] 9.1 CI pipeline (tsc, lint, tests/check.ts, build)
- [ ] 8.5 Error messages (login page done in `docs/deployment-runbook`; rest pending) · 8.7 Real verified badges + honest copy · 8.8 Remove fake society data
- [ ] **Gate:** live demo works end to end except detail-page booking

## ⏭️ Phase 2 — Make it credible (`feat/bookings`)
4.3 → 4.1 → 4.2 → 4.4 (+ 9.2 tests alongside) → 8.6, 4.5 → 5.4, 9.5, 10.2, 10.3 → **resume-ready checkpoint**

## 📋 Per-module checklist
- [ ] `npx tsc --noEmit` clean
- [ ] `npx tsx tests/check.ts` passes
- [ ] `next build` passes (needs env vars)
- [ ] Decision entries appended
- [ ] Plan statuses updated
- [ ] Conventional commit, branch prefix `feat/` `fix/` `test/` `docs/`

## 📌 Custom backlog
- [ ] 
