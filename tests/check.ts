import assert from 'node:assert';
import { signJwt, verifyJwt } from '../src/lib/auth';
import { checkPastDate, checkOwnerBooking, checkOverlap } from '../src/lib/booking-rules';

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
  console.log('✅ Date Scheduling Validators: OK');

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
