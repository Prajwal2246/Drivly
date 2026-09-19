import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { signJwt, verifyJwt, hashPassword, verifyPassword } from '../src/lib/auth';
import { rateLimit } from '../src/lib/rate-limit';
import { validateUpload, DL_EXT, PHOTO_EXT, vehicleSchema, vehicleUpdateSchema } from '../src/lib/validations';
import { userMessage, GENERIC_ERROR } from '../src/lib/api-client';
import { checkPastDate, checkOwnerBooking, checkOverlap, quoteBooking, depositFor } from '../src/lib/booking-rules';

async function runTests() {
  console.log('🧪 Starting Drivly Test Verification Suite...');

  // ==========================================
  // 1. JWT UNIT TESTS
  // ==========================================
  console.log('\n--- Running Unit Tests: JWT & Sessions ---');
  
  const testSecret = 'secret-key-for-test-verification-12345';
  const claims = {
    userId: 'user_999',
    name: 'Jane Doe',
    role: 'RENTER',
    society: 'Windsor Heights',
    exp: Date.now() + 1000 * 60 * 10, // 10 mins
  };

  // Test successful JWT sign & verification
  const validToken = signJwt(claims, testSecret);
  const decoded = verifyJwt(validToken, testSecret);
  assert.ok(decoded, 'JWT token should be successfully verified');
  assert.strictEqual(decoded.userId, claims.userId, 'userId property should match');
  assert.strictEqual(decoded.role, claims.role, 'role property should match');
  assert.strictEqual(decoded.society, claims.society, 'society property should match');
  console.log('✅ JWT Sign and Verify: OK');

  // Test expired JWT handling
  const expiredClaims = {
    ...claims,
    exp: Date.now() - 1000 * 60, // expired 1 minute ago
  };
  const expiredToken = signJwt(expiredClaims, testSecret);
  const expiredDecoded = verifyJwt(expiredToken, testSecret);
  assert.strictEqual(expiredDecoded, null, 'Expired JWT should verify to null');
  console.log('✅ JWT Expiration Enforcement: OK');

  // Test signature key mismatch
  const wrongSecret = 'some-other-incorrect-secret-key-999';
  const mismatchedDecoded = verifyJwt(validToken, wrongSecret);
  assert.strictEqual(mismatchedDecoded, null, 'JWT verification with incorrect key should verify to null');
  console.log('✅ JWT Signature Key Verification: OK');

  // Password hashing (scrypt) — see docs/decisions.md #002
  const stored = hashPassword('hunter2');
  assert.ok(verifyPassword('hunter2', stored), 'Correct password should verify');
  assert.ok(!verifyPassword('hunter3', stored), 'Wrong password should fail');
  assert.ok(!verifyPassword('hunter2', 'garbage'), 'Malformed hash should fail, not throw');
  assert.notStrictEqual(hashPassword('hunter2'), stored, 'Salt must differ per hash');
  console.log('✅ Password Hash & Verify: OK');

  // Passwordless demo login was an account-takeover hole — see docs/decisions.md #017
  assert.ok(!existsSync('src/app/api/auth/user-login/route.ts'), 'Passwordless /api/auth/user-login must stay deleted');
  console.log('✅ No passwordless login route: OK');

  // Rate limiter — see docs/decisions.md #005
  const t0 = 1_000_000;
  for (let i = 0; i < 3; i++) assert.ok(rateLimit('ip1', 3, 1000, t0), `attempt ${i + 1} within limit`);
  assert.ok(!rateLimit('ip1', 3, 1000, t0), '4th attempt is blocked');
  assert.ok(rateLimit('ip2', 3, 1000, t0), 'other key is independent');
  assert.ok(rateLimit('ip1', 3, 1000, t0 + 1000), 'window resets after windowMs');
  console.log('✅ Rate Limiter: OK');

  // DL upload validator — see docs/decisions.md #006
  assert.strictEqual(validateUpload('image/jpeg', 1024, DL_EXT), null, 'JPEG under limit is accepted');
  assert.strictEqual(validateUpload('application/pdf', 4 * 1024 * 1024, DL_EXT), null, 'Exactly 4MB is accepted');
  assert.ok(validateUpload('image/jpeg', 4 * 1024 * 1024 + 1, DL_EXT), 'Over 4MB is rejected');
  assert.ok(validateUpload('text/html', 10, DL_EXT), 'Non-image/PDF mime is rejected');
  assert.ok(validateUpload('image/jpeg', 0, DL_EXT), 'Empty file is rejected');
  assert.ok(validateUpload('application/pdf', 1024, PHOTO_EXT), 'Vehicle photos reject PDF');
  console.log('✅ Upload Validator: OK');

  // Vehicle schema — see docs/decisions.md #013
  const car = { type: 'CAR', brand: ' Honda ', model: 'City', year: '2020', pricePerHour: '150' };
  const parsed = vehicleSchema.parse(car);
  assert.strictEqual(parsed.brand, 'Honda', 'brand is trimmed');
  assert.strictEqual(parsed.year, 2020, 'year is coerced from form string');
  assert.strictEqual(parsed.colorHex, '#000000', 'colour defaults');
  assert.ok(!vehicleSchema.safeParse({ ...car, type: 'BOAT' }).success, 'unknown type rejected');
  assert.ok(!vehicleSchema.safeParse({ ...car, pricePerHour: 0 }).success, 'zero price rejected');
  assert.ok(!vehicleSchema.safeParse({ ...car, colorHex: 'red' }).success, 'non-hex colour rejected');
  assert.ok(vehicleUpdateSchema.safeParse({ listed: false }).success, 'partial update with only listed is valid');
  assert.ok(!vehicleUpdateSchema.safeParse({ listed: 'no' }).success, 'listed must be boolean');
  console.log('✅ Vehicle Schema: OK');

  // User-facing errors — see docs/decisions.md #019
  const missing = vehicleSchema.safeParse({ type: 'CAR', model: 'City', year: 2020, pricePerHour: 100 });
  assert.strictEqual(missing.error!.issues[0].message, 'Please enter a valid brand.', 'missing field gets a friendly message');
  const tooLong = vehicleSchema.safeParse({ type: 'CAR', brand: 'x'.repeat(60), model: 'City', year: 2020, pricePerHour: 100 });
  assert.strictEqual(tooLong.error!.issues[0].message, 'Brand must be 50 characters or fewer.', 'length limit is phrased for users');
  const badYear = vehicleSchema.safeParse({ type: 'CAR', brand: 'Honda', model: 'City', year: 'abc', pricePerHour: 100 });
  assert.ok(!/expected|received|NaN|Invalid input/.test(badYear.error!.issues[0].message), 'no zod jargon: ' + badYear.error!.issues[0].message);
  assert.strictEqual(vehicleSchema.safeParse({ ...car, pricePerHour: 0 }).error!.issues[0].message, 'Price must be greater than 0.', 'explicit messages still win');
  assert.strictEqual(userMessage(409, { error: { code: 'CONFLICT', message: 'Already booked.' } }), 'Already booked.', '4xx apiError message is shown');
  assert.strictEqual(userMessage(500, { error: { message: 'relation "users" does not exist' } }), GENERIC_ERROR, '5xx detail is never shown');
  assert.strictEqual(userMessage(502, null), GENERIC_ERROR, 'HTML/no-body error page gets generic text');
  assert.strictEqual(userMessage(400, { error: 'flat string' }), GENERIC_ERROR, 'unexpected shape falls back, never [object Object]');
  console.log('✅ User-facing error messages: OK');

  // ==========================================
  // 2. INTEGRATION TESTS: BOOKING RULES
  // ==========================================
  console.log('\n--- Running Integration Tests: Booking Validator Rules ---');

  // A. Past Date Rules Validation
  const now = new Date();
  const futureStart = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
  const futureEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000); // +3 hours
  
  // Valid times
  assert.strictEqual(checkPastDate(futureStart, futureEnd, now), null, 'Valid future dates should return no error');

  // Start time in the past
  const pastStart = new Date(now.getTime() - 20 * 60 * 1000); // -20 minutes
  const pastErr = checkPastDate(pastStart, futureEnd, now);
  assert.strictEqual(pastErr, 'Booking start time cannot be in the past.', 'Should catch past start times');

  // End time before start time
  const invalidEndErr = checkPastDate(futureStart, futureStart, now);
  assert.strictEqual(invalidEndErr, 'Booking end time must be after the start time.', 'Should catch end time <= start time');
  assert.strictEqual(checkPastDate(new Date('garbage'), futureEnd, now), 'Please choose a valid start and end time.', 'Unparseable dates rejected, not passed through');
  assert.strictEqual(checkPastDate(futureStart, new Date(futureStart.getTime() + 31 * 24 * 3600_000), now), 'Bookings can be at most 30 days long.', 'Over 30 days rejected');
  assert.strictEqual(checkPastDate(futureStart, new Date(futureStart.getTime() + 30 * 24 * 3600_000), now), null, 'Exactly 30 days allowed');
  console.log('✅ Date Scheduling Validators: OK');

  // Server-side pricing — see docs/decisions.md #021
  const t0q = new Date('2026-07-20T10:00:00Z');
  const hoursLater = (h: number) => new Date(t0q.getTime() + h * 3600_000);
  assert.deepStrictEqual(quoteBooking(150, 'CAR', t0q, hoursLater(2)), { hours: 2, rental: 300, fee: 15, total: 315, deposit: 2000 }, '2h car at ₹150/hr');
  assert.strictEqual(quoteBooking(150, 'CAR', t0q, new Date(t0q.getTime() + 61 * 60_000)).hours, 2, 'Partial hour billed as a full hour');
  const odd = quoteBooking(99.99, 'BIKE', t0q, hoursLater(3));
  assert.strictEqual(odd.rental, 299.97, 'No float drift: ₹99.99 × 3 is exactly ₹299.97');
  assert.strictEqual(odd.fee, 15, '5% fee rounded to the paisa (14.9985 → 15.00)');
  assert.strictEqual(odd.total, 314.97, 'Total = rental + fee');
  assert.strictEqual(depositFor('BIKE'), 1000, 'Bike deposit');
  assert.ok(quoteBooking(100_000, 'CAR', t0q, hoursLater(720)).total < 1e8, 'Max booking fits Decimal(10,2)');
  console.log('✅ Server-Side Pricing: OK');

  // B. Owner Self-Booking Rules Validation
  assert.strictEqual(checkOwnerBooking('owner_1', 'renter_2'), null, 'Renting other user\'s listing should succeed');
  assert.strictEqual(
    checkOwnerBooking('owner_1', 'owner_1'), 
    'You cannot rent your own vehicle.', 
    'Renting own listing should throw error'
  );
  console.log('✅ Self-Booking Block Validator: OK');

  // C. Booking Calendar Overlaps Validation
  const rangeStart = new Date('2026-07-20T10:00:00Z');
  const rangeEnd = new Date('2026-07-20T14:00:00Z');
  
  const existingBookings = [
    {
      startTime: new Date('2026-07-20T11:00:00Z'),
      endTime: new Date('2026-07-20T13:00:00Z'),
    }
  ];

  // Inside overlap case
  assert.ok(checkOverlap(rangeStart, rangeEnd, existingBookings), 'Should detect overlap inside active booking range');

  // Start boundary overlap case
  const boundaryStart = new Date('2026-07-20T09:00:00Z');
  const boundaryEnd = new Date('2026-07-20T11:30:00Z');
  assert.ok(checkOverlap(boundaryStart, boundaryEnd, existingBookings), 'Should detect overlap on start boundary');

  // Non-overlapping case (completely before)
  const beforeStart = new Date('2026-07-20T08:00:00Z');
  const beforeEnd = new Date('2026-07-20T09:59:00Z');
  assert.ok(!checkOverlap(beforeStart, beforeEnd, existingBookings), 'Should pass with no overlap before booking');

  // Non-overlapping case (completely after)
  const afterStart = new Date('2026-07-20T14:01:00Z');
  const afterEnd = new Date('2026-07-20T16:00:00Z');
  assert.ok(!checkOverlap(afterStart, afterEnd, existingBookings), 'Should pass with no overlap after booking');
  console.log('✅ Calendar Booking Overlap checks: OK');

  console.log('\n==========================================');
  console.log('🎉 Verification successful! All unit & integration checks passed.');
  console.log('==========================================');
}

runTests().catch((error) => {
  console.error('❌ Verification check failed:', error);
  process.exit(1);
});
