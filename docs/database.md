# Database Schema

This document details the PostgreSQL database tables, relationships, constraints, and indexes.

## 1. Entity Relationship Overview
```
           +----------------+
           |  UserWaitlist  |
           +----------------+

           +----------------+
           |      User      | <------+
           +----------------+        |
             |            |          |
             | (1:N)      | (1:N)    | (1:N)
             v            v          |
      +---------+    +---------+     |
      | Vehicle |    | Booking |-----+
      +---------+    +---------+
             |            |
             | (1:N)      | (1:1) [Proposed]
             v            v
        +---------+  +---------+
        | Booking |  | Payment |
        +---------+  +---------+
                          |
                          | (1:N) [Proposed]
                          v
                     +---------+
                     | Refund  |
                     +---------+
```

---

## 2. Implemented Tables

### User (`users`)
Tracks registered users, DL status, passwords, and gated society associations.
* **Fields**:
  * `id`: `String` (UUID, Primary Key)
  * `name`: `String`
  * `phone`: `String` (Unique Index)
  * `email`: `String` (Unique Index)
  * `city`: `String`
  * `societyName`: `String` (Index)
  * `role`: `String` (`RENTER`, `OWNER`, or `BOTH`)
  * `password`: `String` (Hashed credentials)
  * `preVerifyDl`: `Boolean` (Verified DL flag)
  * `dlFileName`: `String` (Optional DL image file)
  * `createdAt`: `DateTime`

### Vehicle (`vehicles`)
Stores vehicle specifications and lister relationships.
* **Fields**:
  * `id`: `String` (UUID, Primary Key)
  * `ownerId`: `String` (Foreign Key $\to$ `User.id`, Cascade Delete)
  * `type`: `String` (`CAR`, `BIKE`, or `OTHER`)
  * `brand`: `String`
  * `model`: `String`
  * `year`: `Int`
  * `colorHex`: `String` (RGB hex code for dynamic silhouettes)
  * `pricePerHour`: `Float`
  * `available`: `Boolean`
  * `createdAt`: `DateTime`

### Booking (`bookings`)
Manages trip lifecycle records.
* **Fields**:
  * `id`: `String` (UUID, Primary Key)
  * `renterId`: `String` (Foreign Key $\to$ `User.id`, Cascade Delete)
  * `vehicleId`: `String` (Foreign Key $\to$ `Vehicle.id`, Cascade Delete)
  * `startTime`: `DateTime`
  * `endTime`: `DateTime`
  * `status`: `String` (`PENDING`, `APPROVED`, `REJECTED`, `ACTIVE`, `COMPLETED`, `CANCELLED`)
  * `totalCost`: `Float`
  * `odometerStart`: `Int` (Pre-trip validation)
  * `odometerEnd`: `Int` (Post-trip return validation)
  * `notes`: `String`
  * `createdAt`: `DateTime`

---

## 3. Proposed Tables (Roadmap)

### Payment (`payments`)
* **Fields**:
  * `id`: `String` (UUID, PK)
  * `bookingId`: `String` (FK $\to$ `Booking.id`)
  * `amount`: `Float`
  * `depositAmount`: `Float` (Held security deposit)
  * `status`: `String` (`PENDING`, `HELD`, `PAID`, `REFUNDED`, `FAILED`)
  * `transactionRef`: `String`

### Refund (`refunds`)
* **Fields**:
  * `id`: `String` (UUID, PK)
  * `paymentId`: `String` (FK $\to$ `Payment.id`)
  * `amount`: `Float`
  * `status`: `String` (`PENDING`, `SUCCESS`, `FAILED`)

### Challan (`challans`)
* **Fields**:
  * `id`: `String` (UUID, PK)
  * `vehicleId`: `String` (FK $\to$ `Vehicle.id`)
  * `bookingId`: `String` (FK $\to$ `Booking.id`, Optional)
  * `amount`: `Float`
  * `status`: `String` (`PENDING`, `PAID_BY_RENTER`, `DEDUCTED_FROM_DEPOSIT`, `DISPUTED`)

### Review (`reviews`)
* **Fields**:
  * `id`: `String` (UUID, PK)
  * `bookingId`: `String` (Unique Index, FK $\to$ `Booking.id`)
  * `reviewerId`: `String` (FK $\to$ `User.id`)
  * `rating`: `Int` (1 to 5)
  * `comment`: `String`
  * `type`: `String` (`RENTER_TO_OWNER`, `OWNER_TO_RENTER`)
