# Decision Log

Append-only. One entry per non-obvious choice. Never edit an old entry; add a new one that says "supersedes #N".

Format: **context** (what was true when we decided) → **decision** → **rejected** (and why) → **consequences** (what this commits us to).

---

## 001 — Keep decisions in a single file (2026-09-16)

**Context:** No record of *why* anything was built the way it is. One contributor, ~25 commits.
**Decision:** One `docs/decisions.md`, append-only, numbered entries.
**Rejected:** ADR folder with one file per decision + template — process overhead for a solo project.
**Consequences:** Split into a folder when this passes ~30 entries.

## 002 — Password hashing: scrypt via Node `crypto` (2026-09-16)

**Context:** `hashPassword` used PBKDF2-SHA512 with 1,000 iterations (OWASP recommends 210,000) and compared hashes with `===` (not constant-time).
**Decision:** `crypto.scryptSync` with Node defaults (N=16384, r=8, p=1), 16-byte random salt, `timingSafeEqual` for comparison. Stored format unchanged: `salt:hash` (hex).
**Rejected:** bcrypt / argon2 — need a native npm dependency; scrypt is stdlib, memory-hard, and GPU-resistant where PBKDF2 is not. Raising PBKDF2 iterations — still not memory-hard.
**Consequences:** Existing pbkdf2 hashes in `users.password` no longer verify. No migration shim because there are no real users yet — re-run `npx prisma db seed`. If real users exist later, add a format prefix and re-hash on successful login.

## 003 — Required env vars fail at boot; no fallbacks (2026-09-16)

**Context:** `ADMIN_SESSION_SECRET` had a hardcoded fallback repeated in 15 files; `ADMIN_PASSWORD` fell back to `'admin'`. A missing env var in prod would silently run with a secret that is public on GitHub — anyone could forge an admin cookie. `proxy.ts` also logged the secret prefix.
**Decision:** `src/lib/env.ts` reads each required var once and throws at import time if missing (secret must be ≥32 chars). All consumers import `SESSION_SECRET` / `ADMIN_PASSWORD` from it. Debug logs in `proxy.ts` removed. `.env.example` added (README referenced it but it didn't exist).
**Rejected:** zod-validated env schema (t3-env style) — 2 vars don't justify it; revisit when `env.ts` passes ~8 vars. Per-file `process.env` reads — that's how the fallback got copy-pasted 15 times.
**Consequences:** `next build` and `next dev` crash immediately without a `.env` — intended. Vercel must have both vars set at build time. `DATABASE_URL` moves here in a later entry.

## 004 — One session read/write path: `src/lib/session.ts` (2026-09-16)

**Context:** Cookie name, `verifyJwt` call, and the JWT payload shape were copy-pasted across 16 files. `verifyJwt` returns `any`, so field typos compiled. Found one live bug while refactoring: `feed/[id]/page.tsx` passed `user.id` (the claim is `userId`) — always `undefined`, so `isOwner` was always false and owners saw a "Book" button on their own listing (the API blocked it; the UI didn't).
**Decision:** `getSession(req?)` (route handlers pass `req`; server components omit it) returns a typed `Session | null`. `signSession(claims)` owns the TTL and secret. `SESSION_COOKIE` constant replaces the string. Kept in a separate file from `auth.ts` so `auth.ts` has no env/Next imports and stays runnable in `tests/check.ts`.
**Rejected:** `withAuth(handler)` HOC — one-line call site is just as short and reads plainly. NextAuth/Auth.js — one cookie, one HMAC, no OAuth providers; 40 lines we can read beats a dependency to patch. Swap when Google/OTP login is actually needed.
**Consequences:** `Session.role` is `string` until Prisma enums (task 2.1) let it narrow. `admin_session` untouched — task 7.1 deletes it.

## 005 — Login rate limiting: in-memory fixed window (2026-09-16)

**Context:** `/api/auth/login`, `/api/auth/user-login`, `/api/admin/login` accepted unlimited attempts — a script could guess passwords at network speed.
**Decision:** `src/lib/rate-limit.ts`: fixed-window `Map` keyed by `route:ip`, 10 attempts / 15 min, `429 TOO_MANY_REQUESTS`. IP from the first `x-forwarded-for` hop (Vercel sets it; falls back to `'unknown'`, which means all un-proxied traffic shares one bucket — acceptable locally).
**Rejected:** Upstash / Vercel KV — a dependency and a paid service for a threat we haven't observed. Sliding window / token bucket — more code, same protection at this scale. Per-phone keying — lets an attacker lock a victim out; per-IP doesn't.
**Consequences:** Counter is per serverless instance and resets on cold start, so real ceiling is 10 × instances. `x-forwarded-for` is spoofable if the app is ever run without a trusted proxy in front. Both are the upgrade trigger for a shared store.

## 006 — Driving licence upload: Supabase Storage, private bucket, admin-verified (2026-09-16)

**Context:** Register form had a fake progress bar; only the filename string was stored. `preVerifyDl` was a user-ticked checkbox that owners saw as "DL Pre-Verified". Nothing was stored or verified.
**Decision:**
- Upload moves to Profile (needs a session — anonymous uploads at register would be free storage for anyone). Register loses the DL block.
- Files go to a **private** Supabase Storage bucket `dl` via plain `fetch` to the REST API (`POST /storage/v1/object/…` with `x-upsert`), key `<userId>.<ext>`. Reads are 5-minute signed URLs, minted only for admins.
- Columns renamed on `User`: `dlFileName → dlPath` (storage key), `preVerifyDl → dlVerified` (admin-only flag). `UserWaitlist` keeps its self-declared fields — that form is intent, not verification.
- Re-upload resets `dlVerified`. Limits: JPEG/PNG/WebP/PDF, ≤4MB (Vercel route-handler body cap is 4.5MB). Validator lives in `validations.ts` so it's env-free and tested.
- Admin page gains a Users table with View (signed-URL redirect) and Verify/Revoke. `/api/admin/*` routes now check the admin cookie themselves — the proxy matcher only covers `/admin/*` pages, which was a latent gap.
**Rejected:** `@supabase/supabase-js` — two REST calls don't justify a dependency. Postgres `bytea` — bloats every backup and `SELECT *`. Public bucket — it's a government ID. Owner viewing renter's DL — admin verifies, owner sees the badge; add if owners ask.
**Consequences:** Two new required env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) — app won't boot without them. Bucket `dl` must be created manually (private). `prisma db push` required for the rename. Service-role key bypasses RLS, so it must never reach the client — it's only imported in `storage.ts`, a server module.

## 007 — Prisma enums for role, vehicle type, and booking/payment/challan status (2026-09-17)

**Context:** Five columns were `String` with the allowed values in a comment. The DB accepted anything; `PATCH /api/bookings/[id]` wrote whatever `status` the client sent. `Session.role` was `string`.
**Decision:** `Role`, `VehicleType`, `BookingStatus`, `PaymentStatus`, `ChallanStatus` enums. Unknown `status` / vehicle `type` from clients → 400 via `Object.hasOwn(Enum, value)` (not `in` — `'toString' in BookingStatus` is `true`). `Session.role` is now `Role`.
**Rejected:** Check constraints on text columns — Prisma can't express them, and they don't give TS types. Enums on `UserWaitlist` — it's a signup survey whose rows may be real leads; converting risks them for no integrity gain.
**Consequences:** Adding a status means a schema change + `db push`. Postgres can't drop an enum value in place — removing one later needs a type swap.

## 008 — Indexes on foreign keys and the overlap query (2026-09-17)

**Context:** Postgres does not index FK columns automatically. Feed (`users.societyId`), dashboard (`vehicles.ownerId`, `bookings.renterId`) and the overlap check (`bookings.vehicleId + time range`) were sequential scans.
**Decision:** `User(societyId)`, `Vehicle(ownerId)`, `Booking(vehicleId, startTime, endTime)`, `Booking(renterId)`.
**Rejected:** GiST index on `tstzrange(startTime, endTime)` — better for range overlap, but needs raw SQL outside `schema.prisma`; a btree led by `vehicleId` already narrows to one vehicle's handful of rows.
**Consequences:** Slightly slower writes; irrelevant at this scale. Revisit with `EXPLAIN` if a vehicle ever has thousands of bookings.

## 009 — Society is a table; tenancy filters on `societyId` (2026-09-17)

**Context:** Tenant isolation compared free-text `User.societyName` strings. No place for society data, no admin management, and the session carried only the name.
**Decision:** `Society(id, name, city)` with `@@unique([name, city])`. `User.societyName` and `User.city` are dropped for `User.societyId` (FK, `onDelete: Restrict`). Register/profile/demo login use Prisma `connectOrCreate` on `(name, city)`; inputs are trimmed. Session gains `societyId`; feed, vehicle detail and `GET /api/vehicles` filter on it. `getSession` returns `null` for cookies without `societyId` — Prisma drops `undefined` in `where`, so an old cookie would otherwise see every society's vehicles.
**Rejected:** Unique on `name` alone — two cities can have a "Greenwood Heights". Case-insensitive matching (citext / `mode: 'insensitive'`) — needs an extension or a find-then-create race; exact match is no worse than before. Pick-from-list registration — needs admin-managed societies first (task 7.2).
**Consequences:** `"Greenwood heights"` and `"Greenwood Heights"` are still separate societies — same as before, now fixable by an admin merge (7.2). Existing sessions are logged out once. Existing `users` rows can't be migrated by `db push` (required FK) — reset users/vehicles/bookings and re-seed (already required by #002).

## 010 — Money is `Decimal(10,2)`; converted to number only at the display boundary (2026-09-17)

**Context:** `pricePerHour`, `totalCost`, `depositAmount`, `refundAmount`, `challanPenalty` were `Float`. Refunds were computed as `Math.max(0, deposit - penalty)` on floats.
**Decision:** `@db.Decimal(10, 2)`. Server math uses Decimal methods (`minus`, `Decimal.max`). Two boundaries convert to `number`, display only: (1) server pages call `.toNumber()` — verified in React's source that RSC rejects objects with `toJSON`; (2) `db.ts` overrides `Decimal.prototype.toJSON` to return a number so `NextResponse.json` doesn't emit `"180"` strings that clients would concatenate in `sum + b.totalCost`.
**Rejected:** Integer paise — correct and what Razorpay wants, but every client display and input would need `/100` / `*100`; one `Math.round(x * 100)` at the Razorpay boundary (5.1) is cheaper. Per-route `Number()` in API responses — six sites today, and the next route forgets it.
**Consequences:** The `toJSON` override is global to the process — anything JSON-serializing a Decimal gets a number (precision is safe to ~15 digits, far beyond `Decimal(10,2)`). New server pages passing money to client components must call `.toNumber()`. `UserWaitlist.expectedRentalPrice` stays `Float` (survey answer, see #007).

## 011 — Race-safe booking: transaction + `SELECT … FOR UPDATE` on the vehicle row (2026-09-17)

**Context:** `POST /api/bookings` ran the overlap `findFirst` and the `create` as separate statements. Two concurrent requests for the same slot could both pass the check and both insert.
**Decision:** `createBookingIfFree(db, …)` in `booking-rules.ts`: interactive `$transaction` that locks the vehicle row (`FOR UPDATE`), re-checks overlap, then inserts. The second request blocks on the lock; under READ COMMITTED its overlap query runs after the first commits and sees the new row. `tests/booking-race.ts` fires 10 concurrent calls and asserts exactly one wins (needs a seeded DB).
**Rejected:** Postgres exclusion constraint (`EXCLUDE USING gist (vehicleId WITH =, tstzrange(...) WITH &&) WHERE status IN (…)`) — strongest guarantee, but needs `btree_gist` and raw SQL that `db push` doesn't manage. SERIALIZABLE isolation — needs retry-on-40001 logic. Advisory locks — same effect as the row lock, less obvious.
**Consequences:** Only code paths that take the lock are protected — any future write that creates or re-activates a booking must go through `createBookingIfFree` or take the same lock. Upgrade trigger for the exclusion constraint: adopting `prisma migrate` (raw SQL migrations).

## 012 — One `DATABASE_URL`, read from `env.ts` (2026-09-17)

**Context:** `db.ts` picked from four env vars (`POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `SUPABASE_DATABASE_URL`, `DATABASE_URL`) by preferring URLs containing `pooler`/`:6543`, falling back to a hardcoded localhost URL; `prisma.config.ts` checked them in a *different* order. The app and `db push` could silently target different databases. Added in July because Supabase's direct host is IPv6-only and Vercel is IPv4.
**Decision:** `DATABASE_URL` only, required in `env.ts` (#003 said it would move there). On Supabase, use the **Session pooler** URL (IPv4, port 5432) — it works for the app, `db push` and seed, unlike the transaction pooler (6543). TLS on unless host is localhost. `PrismaPg` takes the config directly (no manual `pg.Pool`). `seed.ts` imports `prisma` from `db.ts` instead of building its own unencrypted pool. `prisma.config.ts` uses `?? ""` so `prisma generate` still works without a DB.
**Rejected:** Separate `DIRECT_URL` for migrations — only needed with the transaction pooler; session pooler covers both.
**Consequences:** Vercel must set `DATABASE_URL` (the Supabase integration's `POSTGRES_*` vars are no longer read). TLS still skips cert verification (`rejectUnauthorized: false`) — upgrade by passing Supabase's CA as `ssl.ca`.

## 013 — Vehicle input validated with zod; role and tenancy enforced server-side (2026-09-17)

**Context:** `POST /api/vehicles` checked only that fields were truthy, then `parseInt`/`parseFloat`'d them — negative prices, `NaN` years and `"red"` as a colour were accepted. The "renters can't list" rule existed only in the `/dashboard/list-vehicle` UI. While tracing booking creation: `POST /api/bookings` never compared the renter's society with the vehicle's — anyone with a `vehicleId` could book across tenants.
**Decision:** `vehicleSchema` in `validations.ts` (enum type, trimmed brand/model ≤50, year 1980..next year, `#rrggbb`, price 0 < p ≤ 100,000, coerced from form strings); `vehicleUpdateSchema = partial + listed` for PATCH. `RENTER` → 403 on create. Booking create returns the same 404 for missing, other-society and unlisted vehicles so it doesn't confirm existence.
**Rejected:** Validating in the client only — trust boundary is the route. A shared zod schema in the client form — form uses controlled state and native `required`; not worth pulling react-hook-form in for five fields.
**Consequences:** The year ceiling is computed at module load — a process alive across New Year rejects next-year models until restart. Clients that read `data.error` as a string show `[object Object]` (API returns `{ code, message }`); fixed in the components touched here, others remain.

## 014 — `listed` (owner) is separate from `available` (trip); delete only without history (2026-09-17)

**Context:** Task 3.5 asked for owner edit/delete/toggle `available`. But `available` is already written by the trip flow (false on ACTIVE, true on COMPLETED), so an owner "unlist" would be silently undone by the next completed trip. `Booking.vehicle` is `onDelete: Cascade`, so deleting a vehicle erases its bookings — payments, challans and reviews included.
**Decision:** New `Vehicle.listed Boolean @default(true)`, owner-controlled via `PATCH /api/vehicles/[id]` (also edits brand/model/year/colour/price). Feed and booking creation require `listed`; the detail page stays visible to the owner. `DELETE /api/vehicles/[id]` only when `_count.bookings === 0`, else 409 "unlist instead". Dashboard gets Photo / Unlist-Relist / Delete per vehicle.
**Rejected:** Reusing `available` — the conflict above. Deriving "Borrowed" from an ACTIVE booking and repurposing `available` — cleaner, but rewrites the trip flow; belongs with the booking state machine (4.1). Soft delete (`deletedAt`) — `listed=false` already hides it; a second hidden-state flag is redundant. Changing the cascade to `Restrict` — right long-term, but the count check gives the same protection with a friendly message.
**Consequences:** Two booleans describe a vehicle's visibility; revisit when 4.1 lands. Count-then-delete can race a booking created in between (the cascade would drop it) — lock the vehicle row as in #011 if it's ever observed. Price edits don't touch existing bookings' `totalCost`.

## 015 — Vehicle photos: public Supabase bucket, silhouette fallback (2026-09-17)

**Context:** Listings showed only type-based silhouettes; real marketplaces show photos. DL storage (#006) already talks to Supabase Storage over `fetch`.
**Decision:** Public bucket `vehicles`; `POST /api/vehicles/[id]/photo` (owner only, JPEG/PNG/WebP ≤4MB) stores `Vehicle.photoPath`; pages build the public URL server-side (`vehiclePhotoUrl`) and cards/detail page fall back to the silhouette when null. Key is `<vehicleId>-<timestamp>.<ext>` so a replaced photo gets a new URL past CDN caching. `storage.ts` now has one private `upload(bucket, key, file)`; `validateDlFile` became `validateUpload(type, size, allowedMap)` for both. Listing form uploads the photo right after create; a photo failure alerts but keeps the listing (resubmitting would duplicate the vehicle).
**Rejected:** Private bucket + signed URLs — a car photo shown to a whole society isn't sensitive, and signed URLs defeat caching and expire mid-session. Cloudinary/S3 (task_queue Phase 15) — a second storage vendor for the same job. Client-side compression — 4MB cap is enough for now; add if uploads are slow on mobile. `next/image` — needs `remotePatterns` config for the Supabase host; plain `<img loading="lazy">` matches the existing cards.
**Consequences:** Bucket `vehicles` must be created **public** manually. Replaced photos are orphaned in storage (no delete on replace). Anyone with the URL can view a photo — don't let owners upload documents here (enforced by the image-only mime list, which is client-declared; Supabase bucket-level MIME restrictions would harden it).

## 016 — Skipped: availability endpoint (3.3) and feed filters/pagination (3.4) (2026-09-17)

**Context:** 3.3 proposed `GET /api/vehicles/[id]/availability` "so the UI can grey out dates". 3.4 proposed server-side filters and cursor pagination.
**Decision:** Skip both. The vehicle detail page already receives upcoming PENDING/APPROVED/ACTIVE bookings from its server component and flags conflicts before submit; an endpoint would duplicate that query. A feed is scoped to one society — tens of vehicles — and client-side search already filters it.
**Rejected:** Building them for the resume line — code with no user need is code to maintain.
**Consequences:** Add 3.3 when a client without server rendering (mobile app) needs availability. Add 3.4 when a society's feed passes ~100 vehicles or the feed payload is measurably slow.

## 017 — Delete passwordless demo login; demo buttons use the real login (2026-09-19)

**Context:** `POST /api/auth/user-login` took `{ phone }` and signed a session for whichever user had that phone — no password, no check that it was a demo account — and created a user in any requested society if the phone was unknown. Phone numbers are shown to other users (feed, vehicle page, dashboards), so any logged-in user could take over a neighbour's account with one request. It was live on Production. Only the two demo buttons on `/login` used it.
**Decision:** Delete the route. The demo buttons post the seeded phone + `demo123` to `/api/auth/login`, so demo sessions go through the same scrypt check and rate limit as everyone else. `tests/check.ts` asserts the route file stays deleted.
**Rejected:** Gating the route on `VERCEL_ENV === 'preview'` or a `DEMO_LOGIN` flag — still a passwordless path, one misconfigured env var from Production (and Vercel sets `NODE_ENV=production` on Preview too). A `demo-accounts.ts` module (as on `develop` 66177e0) — two phone numbers and a password used in one component don't need a module; the seed stays the source of truth.
**Consequences:** Demo buttons fail until `npx prisma db seed` has run on that database; the error message says so. The demo password is public by design — demo accounts must never hold real data. No auto-creation of demo users.

## 018 — Transaction pooler on Vercel, session pooler from the laptop; no `sslmode` in the URL (2026-09-19, amends #012)

**Context:** #012 said to use Supabase's session pooler everywhere. The operational notes on the (superseded) `docs/update-vercel-supabase-runbooks` branch, from real Production incidents, showed two problems: (1) serverless functions on Vercel open many short-lived connections, which session mode (one server connection per client) runs out of; (2) the integration's `POSTGRES_*` URLs carry `?sslmode=require`, which caused `self-signed certificate in certificate chain`. Checked in `pg` 8.21: `connection-parameters.js` merges URL parameters *over* the config object, and `pg-connection-string` 2.13 treats `require` as `verify-full` — so the URL silently overrides `rejectUnauthorized: false` in `db.ts`.
**Decision:** Still one variable, `DATABASE_URL`, with a different value per place: transaction pooler (`:6543`) for the Vercel runtime, session pooler (`:5432`) for `db push` / seed / race test from a laptop. No `sslmode` parameter; `db.ts` handles TLS. `DEPLOYMENT.md` rewritten around this, with a first-deploy checklist and troubleshooting table carried over from the runbook branch.
**Rejected:** A second `DIRECT_URL` variable — the two uses never run in the same process, so one variable with per-environment values is enough. Stripping `sslmode` in code — hides a config mistake; documented instead.
**Consequences:** Interactive transactions (#011) run on the transaction pooler; Supavisor keeps a transaction on one server connection, and `pg` uses unnamed prepared statements, so it's compatible — to be confirmed by running `tests/booking-race.ts` against the transaction pooler once Production is set up.

## 019 — Users only see messages written for them (2026-09-19)

**Context:** Users could see developer text from five sources: API messages ("Unauthorized", "Internal Server Error", "Missing required parameters.", "dlVerified must be a boolean."); zod defaults ("Invalid input: expected string, received undefined", "Too big: expected string to have <=50 characters"); `[object Object]` in 9 client call sites that read `data.error` as a string; `Unexpected token '<'` when a 502 HTML page hit `response.json()`, or "Failed to fetch" offline; and error pages rendering `error.message` (`error.tsx`) or the raw database error (`/admin`). Admin login and the waitlist route also used a flat `{ error: string }` shape.
**Decision:** One rule — anything a user can see is written for them; details go to `Logger` — enforced in shared places, not per screen:
- `apiError()` is the only error shape; every message is user-facing, and `INTERNAL_ERROR` always sends a generic message regardless of what the caller passes.
- Global `z.config({ customError })` in `validations.ts` turns any check without its own message into "Please enter a valid brand." / "Brand must be 50 characters or fewer."; explicit messages still win. The profile schema moved into `validations.ts` so it's covered.
- `src/lib/api-client.ts` `api()`: every client call goes through it. Network failure → "Couldn't reach Drivly…"; 4xx → the server's message; 5xx, non-JSON or unexpected shape → generic. The thrown error carries `status` so a caller can specialise (demo login maps 401 to "Demo accounts aren't available…").
- `error.tsx` shows a friendly message and the `digest` reference, retries with Next 16's `unstable_retry()`; `/admin` logs the DB error and shows a friendly one.
- Admin Verify/Revoke now reports failures instead of silently doing nothing.
**Rejected:** Mapping known technical strings to friendly ones on the client (the `humanizeAuthError` approach from the closed runbook branch) — a deny-list that misses whatever it hasn't seen; the server simply stops sending them. Per-field messages on every zod check — dozens of strings for the same sentence; the global map covers the defaults. A toast/notification library — existing `alert()` and inline error boxes are enough for now.
**Consequences:** New API messages must be written for users (comment on `apiError`). New client fetches should use `api()`. `alert()` remains the UX for dashboard actions — replacing it is a UI task, not an error-content one. Dead dashboard code (`handleAddVehicle`, `newVehicle`) deleted rather than fixed.

## 020 — `DATABASE_URL` is checked in `db.ts`, not `env.ts` (2026-09-19, amends #012)

**Context:** #012 moved `DATABASE_URL` into `env.ts`. But `env.ts` checks every variable when it's imported, and `db.ts` imported it — so `prisma db seed` and `tests/booking-race.ts`, which only touch the database, failed on the first Production migration with "Missing or too-short env var ADMIN_SESSION_SECRET" and needed dummy secrets to run.
**Decision:** `db.ts` reads and checks `DATABASE_URL` itself; `env.ts` keeps the app secrets. The app still fails at build/boot without either (routes import both).
**Rejected:** Lazy getters in `env.ts` so each var is checked on first use — loses "fail at boot" for the secrets (#003). Dummy values for scripts — a workaround every developer has to rediscover.
**Consequences:** Two places check env vars; each is one line and each file says why.

## 021 — The server prices bookings; one `quoteBooking()` for server and page (2026-09-19)

**Context:** `POST /api/bookings` stored whatever `totalCost` the browser sent (`parseFloat(totalCost)`), so a renter could book a ₹220/hr car for ₹1. The vehicle page — the only reachable booking path — didn't send `totalCost` at all, so every booking failed. The page's quote (5% fee, ₹2,000/₹1,000 deposit by type) didn't match what the server stored (no fee; flat ₹5,000 deposit on approval). Also: unparseable dates slipped past `checkPastDate` (Invalid Date compares false with everything) into a Prisma 500; unbounded durations could overflow `Decimal(10,2)`; renter notes were dropped.
**Decision:** `quoteBooking(pricePerHour, type, start, end)` in `booking-rules.ts` is the single pricing rule: hours rounded up, rental = rate × hours, 5% fee, `total` = rental + fee (stored as `totalCost`), deposit from `depositFor(type)` (held on approval, refunded on completion). Arithmetic in integer paise. The route prices from the stored `Vehicle.pricePerHour` and ignores any price in the body; the vehicle page imports the same function for its quote. `checkPastDate` rejects invalid dates and bookings over 30 days (`MAX_BOOKING_HOURS`; 720 h × ₹1,00,000 fits the column). Notes saved (trimmed, ≤500 chars).
**Rejected:** Validating the client's price against the server's — two computations that must agree; just compute once. `Prisma.Decimal` inside `quoteBooking` — the page would need Decimal in the client bundle; integer paise gives the same exactness in plain numbers. Per-vehicle deposits — no data to set them from yet.
**Consequences:** Price changes by the owner don't affect existing bookings (price is captured at request time — desirable). The fee is recorded inside `totalCost`, not as its own column; split it when payments (5.1/5.2) need to pay the owner rental and the platform the fee separately. Deposits drop from the old flat ₹5,000 mock to ₹2,000 (car) / ₹1,000 (other), matching what the page always showed.
