# Drivly Security Policy & Controls

This document details the security constraints, encryption algorithms, authorization gates, and data protection policies enforced across the Drivly platform.

---

## 🔐 Authentication & Session Security

### 1. Cryptographic JWT Signatures
* Sessions are managed using secure JSON Web Tokens (JWT) signed via the **HMAC-SHA256 (HS256)** algorithm.
* A server-side private key `ADMIN_SESSION_SECRET` is used for signing and validating session integrity.
* If a signature is forged, modified, or the token's expiration claims (`exp`) are exceeded, the validation proxy immediately drops the request.
* Production must set a strong `ADMIN_SESSION_SECRET` (and `ADMIN_PASSWORD`) in Vercel — avoid relying on any in-code fallbacks.

### 2. Cookie Security Parameters
All session tokens are set as HTTP cookies using secure parameters to block client-side injection:
* `HttpOnly`: Prevents client-side scripts (XSS attacks) from reading the cookie values.
* `Secure`: Forces browsers to transmit cookies only over encrypted HTTPS connections in production.
* `SameSite=Lax`: Restricts cookie dispatches on cross-site requests to defend against CSRF attacks.

### 3. Demo login (known risk — backlog)
* `POST /api/auth/user-login` is a **passwordless** demo shortcut (optional auto-create for known phones).
* On a public Production URL this is account-takeover-shaped if left ungated.
* Intended direction: allow only on Preview/local (`VERCEL_ENV === 'preview'` or `DEMO_LOGIN=true`), never ungated on Production. See [`task_queue.md`](./task_queue.md) Track A1.

---

## 🛡️ Access Control & Boundary Gating

### 1. Society Boundaries Gating
* Renters are restricted to search, view, and reserve vehicle listings belonging to neighbors living in the **same society name** (`userPayload.society`).
* **Note:** Some UI checks are stricter than API checks today; enforcing society / `totalCost` / role on the server is Track A in [`task_queue.md`](./task_queue.md).

### 2. Lister Ownership Authorization Guard
* Status mutation actions (accepting/rejecting booking requests, reporting traffic challans, rating renters) verify that the active user matches `booking.vehicle.ownerId` for the gated statuses.

### 3. Renter Reservation Guards
* Booking actions (starting a trip, returning the vehicle, logging start-trip inspections, rating owners) verify that the user matches `booking.renterId` for the gated statuses.
* Owners are blocked from reserving their own listings (create path).

---

## 🧹 Input Sanitization & Validation

* Auth register/login (and waitlist) inputs are parsed using **Zod** ([src/lib/validations.ts](./src/lib/validations.ts)).
* Passwords are stored with salted PBKDF2 hashes ([src/lib/auth.ts](./src/lib/auth.ts)).
* Login UI maps infra/Prisma errors to short user-facing messages (does not fix server trust boundaries by itself).
