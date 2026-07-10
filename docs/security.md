# Security & Access Control

This document outlines the security parameters, session models, and validation patterns enforced across the Drivly platform.

## 1. Authentication Gating
* **HTTP-Only Cookies**: User session payloads are stored in an encrypted JWT cookie named `user_session`. This cookie is flagged with `HttpOnly` and `SameSite=Lax` (and `Secure` in production environments) to mitigate Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).
* **JWT HMAC Signature Validation**: All session operations verify signature structures using HMAC-SHA256 based on an environment `SESSION_SECRET` key to block session tampering or header spoofs.

## 2. Role-Based Access Gating
API endpoints and page routes query the verified session token to block invalid behaviors:
* **Borrower (`RENTER`) restriction**:
  * Blocked from accessing the listing routes (`/dashboard/list-vehicle`).
  * Blocked from POST requests to `/api/vehicles`.
  * Renter is prompted to update membership settings to `OWNER` or `BOTH` to unlock listing access.
* **Owner (`OWNER`) restriction**:
  * Owners are blocked from requesting bookings for their own vehicles (race-condition check inside `/api/bookings`).
* **Admin (`ADMIN`) restriction**:
  * Access to endpoints under `/api/admin/*` is gated by an admin session key cookie `admin_session` that is validated by signature checks.

## 3. Input Validation Checklist
* **Odometer checks**:
  * Prevents starting a booking if the pre-trip odometer reading is lower than the last recorded mileage.
  * Prevents finishing bookings if the post-trip odometer reading is lower than the pre-trip odometer reading.
* **Date ranges**:
  * Validates and throws errors on overlapping reservation schedules.
  * Rejects historical date inputs.
* **Database sanitization**:
  * All user input queries route through Prisma ORM parameters, neutralizing SQL injection vectors.
