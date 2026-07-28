# Drivly Security Policy & Controls

This document details the security constraints, encryption algorithms, authorization gates, and data protection policies enforced across the Drivly platform.

---

## 🔐 Authentication & Session Security

### 1. Cryptographic JWT Signatures
* Sessions are managed using secure JSON Web Tokens (JWT) signed via the **HMAC-SHA256 (HS256)** algorithm.
* A server-side private key `ADMIN_SESSION_SECRET` is used for signing and validating session integrity.
* If a signature is forged, modified, or the token's expiration claims (`exp`) are exceeded, the validation proxy immediately drops the request.

### 2. Cookie Security Parameters
All session tokens are set as HTTP cookies using secure parameters to block client-side injection:
* `HttpOnly`: Prevents client-side scripts (XSS attacks) from reading the cookie values.
* `Secure`: Forces browsers to transmit cookies only over encrypted HTTPS connections in production.
* `SameSite=Lax`: Restricts cookie dispatches on cross-site requests to defend against CSRF attacks.

---

## 🛡️ Access Control & Boundary Gating

### 1. Society Boundaries Gating
* Renters are restricted to search, view, and reserve vehicle listings belonging to neighbors living in the **same society name** (`userPayload.society`).

### 2. Lister Ownership Authorization Guard
* All status mutation actions (accepting/rejecting booking requests, reporting traffic challans, rating renters) verify that the active user matches `booking.vehicle.ownerId`.

### 3. Renter Reservation Guards
* Booking actions (starting a trip, returning the vehicle, logging start-trip inspections, rating owners) verify that the user matches `booking.renterId`.
* Owners are blocked from reserving their own listings.

---

## 🧹 Input Sanitization & Validation

* All inputs crossing the client-server boundary are parsed using **Zod schema validations** ([src/lib/validations.ts](file:///Users/prajwaljanbandhu/Desktop/IDEAS/src/lib/validations.ts)).
* Hashing uses salt hashing techniques for storing passwords securely in the database.
