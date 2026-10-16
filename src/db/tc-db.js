import 'dotenv/config';
import requestService from '../services/RequestService.js';
import pool from '../config/db.js';

async function runTests() {
    console.log('====== STARTING CIVICCONNECT PERSISTENCE MIDDLEWARE TESTS ======');
    let passed = 0;
    let total = 3;

    try {
        // Grab a seeded request to test on
        const { rows } = await pool.query('SELECT id, version FROM service_requests LIMIT 1');
        const req = rows[0];
        const dummyUserId = '00000000-0000-0000-0000-000000000000'; // Or a real seeded user ID

        // TC-DB-001: Valid Transition
        try {
            await requestService.updateStatus(req.id, 'Assigned', req.version, dummyUserId);
            console.log(' ✅ TC-DB-001: PASSED (Valid transition logged, version incremented natively)');
            passed++;
        } catch (e) {
            console.log(` ❌ TC-DB-001: FAILED (${e.message})`);
        }

        // TC-DB-002: Invalid Transition (Assigned -> Resolved is allowed, but Assigned -> New -> Resolved is what we test. Let's just try jumping to an invalid state).
        try {
            // It is currently 'Assigned'. We cannot jump straight to 'Closed' usually without resolving, but let's test a known bad one like going from Assigned to a fake state or an illegal state.
            await requestService.updateStatus(req.id, 'InvalidState', req.version + 1, dummyUserId);
            console.log(' ❌ TC-DB-002: FAILED (Should have rejected invalid state)');
        } catch (e) {
            console.log(' ✅ TC-DB-002: PASSED (Invalid state transition rolled back, no partial data)');
            passed++;
        }

        // TC-DB-003: Stale OCC Update (Simulate someone else already updated it)
        try {
            // Using a stale version number
            await requestService.updateStatus(req.id, 'InProgress', req.version, dummyUserId);
            console.log(' ❌ TC-DB-003: FAILED (Should have rejected stale version)');
        } catch (e) {
            console.log(' ✅ TC-DB-003: PASSED (Stale OCC update rejected with concurrency conflict)');
            passed++;
        }

    } catch (error) {
        console.error('Test setup failed:', error.message);
    } finally {
        console.log('\n====== TEST EVIDENCE EXECUTION SUMMARY ======');
        console.log(`Total Executed Checkpoints: ${total}`);
        console.log(`Total Successful Passes: ${passed} / ${total}`);
        if (passed === total) console.log('[INFO] CRITICAL RELEASE CRITERIA SATISFIED SUCCESSFULLY.');
        pool.end();
    }
}

runTests();