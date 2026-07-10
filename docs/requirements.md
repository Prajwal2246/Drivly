# Product Requirements

This document captures the functional features and non-functional engineering standards of Drivly.

## 1. Functional Requirements

### User & Authentication
* **Registration & Login**: Secure signup and login using phone number, email, and password.
* **OTP Verification (Future)**: Support OTP verification for passwordless access.
* **Gated Gating**: Users must register with a specific verified `societyName` (e.g. "Greenwood Heights").
* **Driver verification**: Support driver's license (DL) upload and admin pre-verification flag.

### Vehicle Management
* **Listing**: Owners can list cars (`SEDAN`, `HATCHBACK`, `SUV`) and bikes (`MOTORCYCLE`, `SCOOTY`).
* **Listing Access Block**: Only users with role `OWNER` or `BOTH` can list vehicles. Borrowers (`RENTER`) are blocked and prompted to upgrade their profiles.
* **Silhouettes**: Light, dynamic SVGs that reflect vehicle type, model classification, and hex color value.

### Booking & Inspections
* **Request Lifecycle**: Transition bookings through states: `PENDING` $\to$ `APPROVED`/`REJECTED` $\to$ `ACTIVE` $\to$ `COMPLETED`/`CANCELLED`.
* **Overlap Prevention**: The system must validate and reject overlapping bookings for the same vehicle.
* **Past Date Prevention**: Bookings cannot be requested for historical dates.
* **Pre-Trip Safety Inspection**: Renter must complete a physical checks checklist and input current odometer readings before a booking can transition to `ACTIVE`.

### Payments & Deposits (Pending Implementation)
* **Security Deposit**: Renter pays a refundable security deposit before starting the trip.
* **Trip Fees**: Hourly rental contribution calculation based on elapsed booking time.
* **Deposit Holds & Refunds**: Automatically hold deposits and refund them post-trip after confirming zero damages/challans.

### Challan & Violation Flow (Pending Implementation)
* **Challan Logging**: Owners can submit a traffic challan received during a renter's active session.
* **Notification & Penalty**: System notifies the renter of the violation and deducts the penalty amount directly from the held security deposit.

### Reviews & Reputation (Pending Implementation)
* **Abuse Prevention**: Reviews can only be submitted once per completed booking.
* **Mutual Ratings**: Renter rates the vehicle/owner; Owner rates the renter's driving behavior/punctuality.

---

## 2. Non-Functional Requirements

* **High Performance**: Initial load times must be minimized using server-side rendering, layout streaming skeletons, and CSS/SVG asset delivery.
* **Strict Security**: Session tokens must use secure, HTTP-only JWT cookies to block Cross-Site Scripting (XSS).
* **Database Consistency**: Use transaction-safe queries to prevent double-booking race conditions.
* **Mobile-Responsive**: Clean, warm-minimalist styling designed to work flawlessly on smartphones and tablets.
* **Auditable Logs**: Critical system transitions (logins, bookings, payments, and admin actions) must produce structured logs.
