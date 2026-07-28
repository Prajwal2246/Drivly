# Project Roadmap

Active planning and prioritization live in **[`task_queue.md`](../task_queue.md)** (resume / interview track). This file is a short historical summary of what shipped in the early MVP phases.

## Shipped (core MVP)

* Society-scoped register / login (JWT HttpOnly cookies) and role profiles (Renter / Owner / Both).
* Society-isolated vehicle feed, listing, booking lifecycle, mock deposits / challans / reviews.
* Pre-trip inspection / odometer gates in the dashboard UX.
* Admin waitlist dashboard with password + JWT session.
* Deployed on Vercel + Supabase (Production + Preview). See [`DEPLOYMENT.md`](../DEPLOYMENT.md).

## Next (see `task_queue.md`)

* **Track A** — Authz hardening (gate demo login on Production, fail-closed secrets, booking/vehicle API trust boundaries).
* **Track B** — Booking state machine, overlap races, profile escalation locks.
* **Track C** — CI, stronger tests, README demo polish.
* **Track D** — One depth feature (society verification, owner calendar, or image upload).

## Intentionally mock / deferred

* Real payment rails, Aadhaar/DL government APIs, digital keys, production insurance — product copy may mention these; implementation is sandbox or UI-only until explicitly built.
