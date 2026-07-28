# Drivly Task Queue — Resume & Interview Track

This file is the **single source of truth** for what to build next. It replaces the old Phase 0–22 laundry list (OpenAPI, feature flags, soft deletes, mock Sentry, etc.), which looked busy but did not make the product safer, demable, or easier to defend in interviews.

**How to use this file**
- Work top → bottom. Do not skip a section to chase a “cool” later item.
- Check boxes when done. Keep the **Why** paragraphs — future-you needs the rationale, not just the task name.
- When something is intentionally deferred or mocked, say so in the README so interviewers don’t think you forgot.

**North star:** A live demo where society isolation, auth, and booking rules hold under curl — not only under the UI — plus one depth feature you can talk about for 10 minutes.

---

## Deployed environments (Vercel)

Already live — do **not** treat “deploy something” as unfinished work. Harden what is deployed.

| Env | URL | Notes |
|-----|-----|--------|
| **Production** | https://drivly-mu.vercel.app/ | Canonical resume / interview link |
| **Preview (main)** | https://drivly-git-main-prajwa-janbandhus-projects.vercel.app/ | Vercel preview for `main` (may redirect) |
| **Dashboard** | https://vercel.com/prajwa-janbandhus-projects/drivly | Env vars, logs, deployments |

**Critical Vercel fact for Track A:** On Vercel, **both** Production and Preview set `NODE_ENV=production`. Gating demo login with `NODE_ENV !== 'production'` turns it off everywhere (including Preview). Use instead:

- `process.env.VERCEL_ENV === 'preview'` (or `'development'` locally), **or**
- explicit `DEMO_LOGIN=true` only on Preview env vars in the Vercel dashboard (unset on Production)

Prefer **separate** Preview vs Production env vars for `DATABASE_URL` / secrets so seed + demo data never hit the prod DB. Confirm in Vercel → Settings → Environment Variables which vars are scoped to Production / Preview / Development.

Git branches: repo has `main` + `develop`. Confirm which branch promotes to Production in Vercel Git settings; Preview URL naming (`…-git-main-…`) suggests `main` drives that preview alias.

---

## Context: what already works vs what is broken

### Already in place (do not rebuild)
- Landing + society picker → login
- Register / password login, JWT cookies, proxy page gating for `/feed`, `/dashboard`, `/profile`, `/admin`
- Vehicle list/feed, booking create + status UI, mock deposit/challan/reviews
- Prisma schema (`User`, `Vehicle`, `Booking`), structured logger, Zod on some auth routes
- Assert-based unit tests for JWT helpers and pure booking validators

### Broken / fake relative to the product story
These are the gaps that make “gated society P2P sharing” collapse if an interviewer hits the API:

| Issue | Why it hurts |
|-------|----------------|
| Demo login (`/api/auth/user-login`) issues a session for any phone | Account takeover; “OTP bypass” became passwordless auth |
| Hardcoded JWT/admin secret & default admin password | Forged sessions if env is missing |
| Booking `PATCH` only gates some statuses | IDOR: strangers can write other statuses / notes |
| `POST /api/bookings` trusts client `totalCost`, skips society + `available` | UI gate ≠ API gate; pricing fraud |
| `POST /api/vehicles` has no role check | Renters can list via curl |
| Profile can self-set `OWNER` + any society | Society isolation and roles become optional |
| Overlap is check-then-insert | Double-book under concurrency |
| No real status state machine | PENDING → COMPLETED skips approval/deposit |

Fix those before adding maps, calendars, or dashboards.

---

## Track A — Security holes (do first, ~1–2 days)

Goal: nothing embarrassing when asked “how does auth and authorization work?”

### A1. Gate or delete demo login
- [ ] Allow demo login only on Preview/local — **not** on Production (`https://drivly-mu.vercel.app`)
- [ ] Gate with `VERCEL_ENV === 'preview'` **or** `DEMO_LOGIN=true` scoped only to Preview in Vercel (do **not** use `NODE_ENV !== 'production'` — both Vercel envs use `NODE_ENV=production`)
- [ ] Never mint a session for an **existing** user without password/OTP verification
- [ ] Auto-create demo users only for known seed phones (or remove auto-create entirely)
- [ ] Document the demo path in README as Preview/sandbox-only behavior

**Why:** Right now `POST /api/auth/user-login` is passwordless account takeover for any known phone — including real accounts from `/api/auth/register`. On a public prod URL this is especially bad: anyone can try it. Keeping a demo shortcut on Preview is fine for interviews; leaving it open on Production is not.

### A2. Fail closed on secrets
- [ ] Remove hardcoded `ADMIN_SESSION_SECRET` fallback and `ADMIN_PASSWORD || 'admin'`
- [ ] In production (and preferably always outside tests): refuse to start / return 500 if secrets are unset
- [ ] Prefer **separate** secrets for user sessions vs admin sessions
- [ ] Grep the repo: no remaining fallback secret strings in `proxy.ts` or API routes

**Why:** Shared fallback secrets mean anyone who reads the source can forge `{ role: 'admin' }` or any `userId`. Interviewers often ask what happens when env config is missing — “we default to a known string” is the wrong answer. Fail closed is a one-line habit that signals production instinct.

### A3. Fix booking PATCH IDOR
- [ ] Require `isOwner || isRenter` before any update
- [ ] Allowlist status values and transitions per role (see Track B)
- [ ] Strangers must get `FORBIDDEN` even if they only send `notes`
- [ ] Add a test or assert-check that a third user cannot PATCH a booking

**Why:** Page middleware does not protect APIs. Only `APPROVED`/`REJECTED`/`ACTIVE`/`COMPLETED` are role-checked today; other statuses (and notes) are writable by any authenticated user. This is a classic IDOR — exactly the kind of bug SDE interview security questions target.

### A4. Server-side booking trust boundaries
- [ ] Recompute `totalCost` from `vehicle.pricePerHour × duration`; ignore client amount (or use it only as a display hint)
- [ ] Enforce same society using the **DB** user + owner rows, not only the JWT `society` claim
- [ ] Reject bookings when `vehicle.available === false`
- [ ] Reject cross-society `vehicleId` with `FORBIDDEN` / `NOT_FOUND`

**Why:** The feed page checks society; `POST /api/bookings` does not. Client-supplied `totalCost` means a renter can book for ₹0. Resume projects get credit when trust boundaries live on the server. “The UI prevents it” is not an answer.

### A5. Role check on vehicle create
- [ ] `POST /api/vehicles` allows only `OWNER` or `BOTH` (from DB role, refreshed if needed)
- [ ] `RENTER` gets `FORBIDDEN`
- [ ] Align with dashboard UI gating so UI and API tell the same story

**Why:** Role checks only in React are theater. Interviewers will ask whether authorization is enforced at the API. Closing this gap makes the OWNER/RENTER model real.

---

## Track B — Core loop correctness (~1–2 days)

Goal: the happy path is honest under concurrency and abuse, not only in a single-tab demo.

### B1. Booking status state machine
- [ ] Define allowed edges, e.g.:
  - Owner: `PENDING → APPROVED | REJECTED`
  - Renter: `APPROVED → ACTIVE → COMPLETED`, plus cancel rules you choose
  - Nobody: `PENDING → COMPLETED`, or revive `REJECTED`/`COMPLETED` arbitrarily
- [ ] Fire payment/deposit side effects only on valid edges (e.g. deposit hold on `APPROVED`)
- [ ] Document the diagram in README or `docs/` (one mermaid block is enough)

**Why:** Skipping APPROVED skips the deposit hold story you already claim in Phase 3. A tiny state machine is a strong interview talking point (“I modeled lifecycle transitions explicitly”) and prevents nonsense statuses in the DB.

### B2. Overlap race / double-book
- [ ] Wrap overlap check + create in a transaction with appropriate isolation, **or**
- [ ] Add a DB constraint / exclusion strategy you can explain
- [ ] Map unique/constraint violations to `CONFLICT` for the client
- [ ] Note the approach in README under “Concurrency”

**Why:** Check-then-insert is a classic race. You do not need Redis or a job queue — you need to show you know TOCTOU exists and picked a boring fix. That is senior-signal on a personal project.

### B3. Lock down profile escalation
- [ ] Do not allow free self-service `role → OWNER/BOTH` without a rule (admin approval, re-verify, or one-time onboarding only)
- [ ] Do not allow arbitrary `societyName` jumps that retarget the feed (or require verification)
- [ ] Prefer reading society/role from DB on sensitive routes instead of trusting JWT claims alone

**Why:** If anyone can PATCH profile to OWNER + another society, “gated community trust” is optional. Interviewers notice when product claims and data model diverge.

### B4. Clamp ratings and challan economics
- [ ] Ratings must be integers 1–5
- [ ] Challan penalty bounded to `[0, depositAmount]` (or explicit business rule)
- [ ] Prefer `??` over `||` for `depositAmount` so a real `0` is not treated as missing (`depositAmount || 5000` bug)
- [ ] Only allow challan logging in statuses that make sense (e.g. ACTIVE/COMPLETED)

**Why:** Small abuse fixes. They show you think about invalid input and money-adjacent fields even in a mock payment world.

### B5. Stronger password hashing
- [ ] Raise PBKDF2 iterations substantially (or switch to scrypt/argon2id if you accept a small dependency)
- [ ] Compare hashes and JWT signatures with `crypto.timingSafeEqual` on equal-length buffers
- [ ] Require `exp` on JWTs; reject tokens without it

**Why:** 1000 PBKDF2 iterations and `===` compares are easy to criticize. Fixing them is cheap and lets you say you tightened crypto after a review — a good story for “how do you handle feedback / security review?”

---

## Track C — Resume signal (~1 day)

Goal: a stranger (recruiter or hiring manager) can trust the repo in under two minutes.

### C1. GitHub Actions CI
- [ ] Workflow on PR/push: install → lint → `tsc --noEmit` → `node tests/check.ts` → `next build`
- [ ] Badge or clear status on the repo
- [ ] Keep the pipeline boring; no deploy-from-PR required

**Why:** A green CI badge beats ten unchecked roadmap phases. It proves the project builds outside your laptop — table stakes for many companies screening GitHub.

### C2. Expand tests past pure helpers
- [ ] Society gate on booking create
- [ ] Server-computed `totalCost` (reject or overwrite client value)
- [ ] Illegal status transition rejected
- [ ] Demo login blocked when “production mode” / flag off
- [ ] PATCH IDOR: third user forbidden

**Why:** Current tests cover JWT helpers and pure validators — good, but they do not prove API trust boundaries. Interview question: “How do you know society isolation works?” Answer should be a failing test when the check is removed, not “I clicked around.”

Keep the zero-framework assert runner if you like it; depth matters more than Jest.

### C3. README: 60-second demo path
- [ ] Seed → demo accounts → list/book → approve → complete → review
- [ ] Screenshots of feed + booking flow
- [ ] Explicit **What’s real / what’s mock** (deposits, challans, DL verify, payments)
- [ ] Short **Tradeoffs** section (custom JWT vs Auth.js, society as string vs Society table, etc.)

**Why:** Recruiters and interviewers often never clone the repo. The README is the product pitch. Honesty about mocks builds trust; hiding them invites hard questions you could have framed yourself.

### C4. Harden the existing live URLs (already deployed)
- [x] Production live: https://drivly-mu.vercel.app/
- [x] Preview exists: https://drivly-git-main-prajwa-janbandhus-projects.vercel.app/
- [ ] Production env vars: no secret fallbacks; `DEMO_LOGIN` unset/false
- [ ] Preview env vars: demo/seed OK; ideally **separate** DB from Production
- [ ] Put Production URL + “what’s mock” in README and on the resume
- [ ] Smoke-test Production after Track A: register/login works; demo login returns 403/404

**Why:** Deploy is done — resume credit is the **public URL**. Remaining work is making Production trustworthy (gated demo, real secrets, no shared fallback) so you can hand interviewers https://drivly-mu.vercel.app/ without an auth asterisk.

---

## Track D — One depth feature (pick ONE, ~2–4 days)

Do **one** of these after A–C. Depth beats a shallow checklist. Pick based on the roles you want:

### Option D1 — Society verification (best match to product thesis)
- [ ] Societies as first-class records (not only free-text `societyName`)
- [ ] Admin (or society admin) approves membership
- [ ] Listings/bookings only for verified members of that society

**Why interviewers care:** Your whole pitch is “trust from the gate.” Making verification real connects product vision to schema and authz — strong system-design narrative.

### Option D2 — Owner availability calendar
- [ ] Owner blocks dates / sees booked vs free
- [ ] Booking create respects blocked ranges
- [ ] Simple UI calendar is enough; no need for a full scheduling product

**Why interviewers care:** Scheduling, conflict detection, and UX for two-sided marketplaces. Easy to whiteboard.

### Option D3 — Real vehicle image upload
- [ ] S3 or Cloudinary upload
- [ ] Store URL on `Vehicle`; show in feed/detail
- [ ] Basic client compression optional

**Why interviewers care:** Practical fullstack (signed uploads, storage, CDN). Visual demos look more “product” than SVG-only silhouettes.

**Do not** also ship maps + radius + OpenAPI + soft deletes in the same sprint. One deep feature you can defend > five half features.

---

## Track E — Polish (only after A–D)

- [ ] `GET /api/health` (DB ping optional)
- [ ] Indexes on hot paths: `societyName`, `ownerId`, `vehicleId`, booking time/status filters
- [ ] In-app notifications for approve/reject (polling is fine)
- [ ] Admin dashboard: 2–3 metrics from real queries (pending bookings, active trips, listings per society) — not decorative charts

**Why:** These are credibility toppings. They do not fix a broken auth story. Do them last so the resume bullet list stays honest.

---

## Explicitly skip (low interview ROI right now)

Do not spend resume time on these unless a job description specifically asks:

| Item | Reason to skip |
|------|----------------|
| OpenAPI/Swagger | Docs without correct authz is theater |
| API versioning `/api/v1` | One consumer (your app); premature |
| Feature flags | No multi-variant product yet |
| Soft deletes everywhere | Complexity without a retention story |
| Mock Sentry / tracing / correlation IDs | Observability theater for a solo MVP |
| Google Maps + km radius | Expands trust boundary before society gating is real |
| Real payment rails (Razorpay/Stripe live) | Keep mock deposits; explain intentional sandbox |
| Soft “resume extras” from the old Phase 10 list | Looks like padding in reviews |

Revisit only after Tracks A–D and a live demo you are proud of.

---

## Suggested week plan

| Day | Focus |
|-----|--------|
| 1–2 | Track A (A1–A5) — security |
| 3–4 | Track B (B1–B5) — correctness |
| 5 | Track C (C1–C4) — CI, tests, README, deploy |
| 6–8 | Track D — exactly one depth feature |
| After | Track E polish + interview practice explaining tradeoffs |

When interviewing, lead with: **problem (idle society vehicles) → trust model (same gate) → how API enforces it → one concurrency/auth bug you fixed → live demo.** This queue exists so that story is true.

---

## Progress log

_Use this section as a short diary so future-you remembers decisions._

| Date | Done | Notes / tradeoffs |
|------|------|-------------------|
| | | |

---

## Custom backlog

_Ideas that must not jump ahead of Track A–C:_

- [ ]
