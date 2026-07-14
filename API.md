# Drivly API Specification

All API routes are served under the `/api/` prefix. Error payloads are returned as standardized JSON objects.

---

## 🚦 Standard Error Response

When an API request fails, the response is structured as follows:
```json
{
  "success": false,
  "error": {
    "code": "CODE_NAME",
    "message": "Error details here"
  }
}
```

### Supported Error Codes:
* `BAD_REQUEST` (400)
* `UNAUTHORIZED` (401)
* `FORBIDDEN` (403)
* `NOT_FOUND` (404)
* `CONFLICT` (409)
* `VALIDATION_ERROR` (422)
* `INTERNAL_ERROR` (500)

---

## 🔑 Authentication Endpoints

### 1. `POST /api/auth/register`
Creates a new renter or owner account.
* **Payload**:
  ```json
  {
    "name": "Jane",
    "email": "jane@example.com",
    "phone": "9876543210",
    "city": "Mumbai",
    "societyName": "Green Park",
    "role": "RENTER",
    "password": "secure_password",
    "preVerifyDl": true,
    "dlFileName": "dl_copy.pdf"
  }
  ```
* **Response**: `200 OK` with user details.

### 2. `POST /api/auth/login`
Authenticates a user and sets a secure `user_session` cookie.
* **Payload**:
  ```json
  {
    "phone": "9876543210",
    "password": "secure_password"
  }
  ```

### 3. `PATCH /api/auth/profile`
Updates user profile settings and resets the session claims.

---

## 🚗 Vehicle Endpoints

### 1. `GET /api/vehicles`
Fetches all vehicles listed inside the active user's society.

### 2. `POST /api/vehicles`
Lists a new vehicle.
* **Payload**:
  ```json
  {
    "type": "CAR",
    "brand": "Honda",
    "model": "City",
    "year": "2022",
    "colorHex": "#3b82f6",
    "pricePerHour": "150.00"
  }
  ```

---

## 📅 Booking Endpoints

### 1. `GET /api/bookings`
Returns user bookings (both as a renter and owner).

### 2. `POST /api/bookings`
Requests a booking for a vehicle.
* **Payload**:
  ```json
  {
    "vehicleId": "v_123",
    "startTime": "2026-07-20T10:00:00.000Z",
    "endTime": "2026-07-20T14:00:00.000Z",
    "totalCost": "600"
  }
  ```

### 3. `PATCH /api/bookings/[id]`
Updates booking states (Status changes, inspections, reviews, and traffic challans).
* **Payload Examples**:
  * **Start Trip**: `{"status": "ACTIVE", "odometerStart": 45200}`
  * **End Trip**: `{"status": "COMPLETED", "odometerEnd": 45250}`
  * **Submit Review**: `{"ownerRating": 5, "ownerReview": "Great car!"}`
  * **Log Challan**: `{"challanPenalty": 1000, "challanReason": "Over-speeding fine"}`
