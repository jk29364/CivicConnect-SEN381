import { authenticateToken, requireRole } from './auth.middleware.js';

// --- TEST ENVIRONMENT SETUP ---
// Simulate loading .env variables locally
process.env.JWT_SECRET = 'my_super_secret_milestone_key_123!'; // NOT A REAL ENV CODE, purely for testing simulation!

// A helper library to sign tokens for testing without running the whole app
import jwt from 'jsonwebtoken';
const validResidentToken = jwt.sign({ id: 'resident_123', role: 'resident' }, process.env.JWT_SECRET);
const validAdminToken = jwt.sign({ id: 'admin_999', role: 'admin' }, process.env.JWT_SECRET);
const invalidSecretToken = jwt.sign({ id: 'bad_user', role: 'resident' }, 'wrong_secret_key_abc');

let testCount = 0;
let passCount = 0;

/**
 * Helper to build a factory mock Response object
 */
const createMockResponse = (expectedStatus, testId) => {
    const res = {
        statusCode: 200,
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            this.body = data;
            verifyResult(this.statusCode, expectedStatus, testId);
        }
    };
    return res;
};

/**
 * Asserts the test outcome matches the expectation
 */
const verifyResult = (actual, expected, testId) => {
    testCount++;
    if (actual === expected) {
        console.log(` ✅ ${testId}: PASSED (Got HTTP ${actual})`);
        passCount++;
    } else {
        console.error(` ❌ ${testId}: FAILED! Expected HTTP ${expected}, but got HTTP ${actual}`);
    }
};

console.log('====== STARTING CIVICCONNECT AUTH MIDDLEWARE TESTS ======');

// =========================================================================
// TC-AUTH-001: Missing Header
// =========================================================================
const req1 = { headers: {} }; 
const res1 = createMockResponse(401, 'TC-AUTH-001');
const next1 = () => verifyResult(200, 401, 'TC-AUTH-001 (Fell through to next)');
authenticateToken(req1, res1, next1);

// =========================================================================
// TC-AUTH-002: Malformed Header String Structure
// =========================================================================
const req2 = { headers: { authorization: 'MalformedTokenStringWithNoSpaces' } };
const res2 = createMockResponse(403, 'TC-AUTH-002');
const next2 = () => verifyResult(200, 403, 'TC-AUTH-002 (Fell through to next)');
authenticateToken(req2, res2, next2);

// =========================================================================
// TC-AUTH-003: Invalid Secret Key Verification
// =========================================================================
const req3 = { headers: { authorization: `Bearer ${invalidSecretToken}` } };
const res3 = createMockResponse(403, 'TC-AUTH-003');
const next3 = () => verifyResult(200, 403, 'TC-AUTH-003 (Fell through to next)');
authenticateToken(req3, res3, next3);

// =========================================================================
// TC-AUTH-004 & 005: Happy Path Resident Token & Role Gate Rejection
// =========================================================================
const req4 = { headers: { authorization: `Bearer ${validResidentToken}` } };
const res4 = createMockResponse(200, 'TC-AUTH-004 / 005 Setup');

// This next() callback tests if user info successfully transferred to the request context
const next4 = () => {
    // TC-AUTH-004: Confirm identity injection
    testCount++;
    if (req4.user && req4.user.id === 'resident_123') {
        console.log(' ✅ TC-AUTH-004: PASSED (Identity bound to request object)');
        passCount++;
    } else {
        console.error(' ❌ TC-AUTH-004: FAILED to bind user details.');
    }

    // TC-AUTH-005: Run Authorization Check for Admins on this Resident user
    const adminCheckMiddleware = requireRole(['admin']);
    const res5 = createMockResponse(403, 'TC-AUTH-005');
    const next5 = () => verifyResult(200, 403, 'TC-AUTH-005 (Fell through to admin scope)');
    adminCheckMiddleware(req4, res5, next5);
};
authenticateToken(req4, res4, next4);

// =========================================================================
// TC-AUTH-006 & 007: Admin Token Access & Admin Role Allowance
// =========================================================================
const req6 = { headers: { authorization: `Bearer ${validAdminToken}` } };
const res6 = createMockResponse(200, 'TC-AUTH-006 Setup');

const next6 = () => {
    // Run Authorization Check for Admins on this Admin user
    const adminCheckMiddleware = requireRole(['admin']);
    const res7 = createMockResponse(200, 'TC-AUTH-007 Setup');
    const next7 = () => {
        testCount++;
        console.log(' ✅ TC-AUTH-007: PASSED (Admin granted entry to administrative scope)');
        passCount++;
    };
    adminCheckMiddleware(req6, res7, next7);
};
authenticateToken(req6, res6, next6);

// --- SUMMARY RESULTS ---
console.log('\n====== TEST EVIDENCE EXECUTION SUMMARY ======');
console.log(`Total Executed Checkpoints: ${testCount}`);
console.log(`Total Successful Passes: ${passCount} / ${testCount}`);

if (passCount === testCount) {
    console.log('[INFO] CRITICAL RELEASE CRITERIA SATISFIED SUCCESSFULLY.');
    process.exit(0);
} else {
    console.error('[WARNING] SYSTEM SECURITY DEVIATION DETECTED.');
    process.exit(1);
}
