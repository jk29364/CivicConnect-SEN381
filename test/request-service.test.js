import test from 'node:test';
import assert from 'node:assert/strict';
import { RequestService } from '../src/services/RequestService.js';
import { ValidationError, ConflictError, NotFoundError } from '../src/services/errors.js';

const RESIDENT = '11111111-1111-4111-8111-111111111111';
const STAFF = '22222222-2222-4222-8222-222222222222';
const OTHER = '33333333-3333-4333-8333-333333333333';
const REQUEST = '44444444-4444-4444-8444-444444444444';
const COMPLEX = '55555555-5555-4555-8555-555555555555';
const actors = {
    [RESIDENT]: { id: RESIDENT, role: 'Resident', complex_id: COMPLEX },
    [STAFF]: { id: STAFF, role: 'Staff', complex_id: COMPLEX },
    [OTHER]: { id: OTHER, role: 'Resident', complex_id: '66666666-6666-4666-8666-666666666666' }
};
const makeRecord = (overrides = {}) => ({
    id: REQUEST, reference_number: 'CC-2026-EXAMPLE',
    category: 'Maintenance', description: 'Leak', location: 'A1', severity: 'Low',
    status: 'New', version: 1, complex_id: COMPLEX, submitted_by: RESIDENT,
    assigned_to: null, category_data: { faultType: 'Plumbing' },
    ...overrides
});

function fakeDb(overrides = {}) {
    const calls = [];
    let request = makeRecord(overrides.request);
    const state = { calls, history: [], commits: 0, rollbacks: 0 };
    const query = async (sql, params = []) => {
        calls.push({ sql, params });
        if (sql.startsWith('BEGIN')) return { rows: [] };
        if (sql.startsWith('COMMIT')) { state.commits++; return { rows: [] }; }
        if (sql.startsWith('ROLLBACK')) { state.rollbacks++; return { rows: [] }; }
        if (sql.includes('FROM users WHERE id = $1')) {
            const actor = actors[params[0]];
            return { rows: actor ? [actor] : [], rowCount: actor ? 1 : 0 };
        }
        if (sql.includes('INSERT INTO service_requests')) {
            const [reference_number, category, description, location, severity, complex_id, submitted_by, data] = params;
            request = makeRecord({ reference_number, category, description, location,
                severity, complex_id, submitted_by, category_data: JSON.parse(data) });
            return { rows: [request], rowCount: 1 };
        }
        if (sql.includes('FROM request_history')) return { rows: [...state.history] };
        if (sql.includes('INSERT INTO request_history')) {
            state.history.push({ request_id: params[0], old_status: params[1], new_status: params[2], changed_by: params[3] });
            return { rows: [], rowCount: 1 };
        }
        if (sql.includes('UPDATE service_requests')) {
            if (overrides.failUpdate) return { rows: [], rowCount: 0 };
            request = { ...request, status: params[0], version: request.version + 1 };
            return { rows: [request], rowCount: 1 };
        }
        if (sql.includes('SELECT * FROM service_requests') && sql.includes('FOR UPDATE')) {
            return { rows: overrides.notFound ? [] : [request] };
        }
        if (sql.includes('FROM service_requests sr')) {
            return { rows: overrides.notFound ? [] : [request] };
        }
        throw new Error(`Unexpected SQL in test fake: ${sql}`);
    };
    const db = { query, async connect() { return { query, release() { state.released = true; } }; } };
    return { db, state };
}

const valid = { category: 'Maintenance', description: 'Leaking pipe', location: 'Block 2', faultType: 'Plumbing', submittedBy: RESIDENT };

test('creation: factory validation, default severity, token-owned submitter, unique reference, saved fields', async () => {
    const { db, state } = fakeDb();
    const service = new RequestService({ db });
    const one = await service.createRequest(valid);
    const two = await service.createRequest(valid);
    assert.match(one.referenceNumber, /^CC-\d{4}-[0-9A-F]{32}$/);
    assert.notEqual(one.referenceNumber, two.referenceNumber);
    assert.equal(one.severity, 'Low');
    assert.equal(one.status, 'New');
    assert.equal(one.submittedBy, RESIDENT);
    assert.equal(one.categoryData.faultType, 'Plumbing');
    const insert = state.calls.find(call => call.sql.includes('INSERT INTO service_requests'));
    assert.equal(insert.params[6], RESIDENT);
});

test('creation: rejects incomplete data via actual RequestFactory before database insert', async () => {
    const { db, state } = fakeDb();
    const service = new RequestService({ db });
    await assert.rejects(service.createRequest({ ...valid, faultType: undefined }),
        error => error instanceof ValidationError && error.message.includes('faultType'));
    await assert.rejects(service.createRequest({ ...valid, severity: 'Critical' }), ValidationError);
    await assert.rejects(service.createRequest({ ...valid, description: 42 }), ValidationError);
    assert.equal(state.calls.some(c => c.sql.includes('INSERT INTO service_requests')), false);
});

test('creation: nonresident cannot submit', async () => {
    const { db } = fakeDb();
    const service = new RequestService({ db });
    await assert.rejects(service.createRequest({ ...valid, submittedBy: STAFF }), ValidationError);
});

test('filter: whitelisted SQL parameters and estate isolation for staff', async () => {
    const { db, state } = fakeDb();
    const service = new RequestService({ db });
    await service.getRequests({ category: 'Common Area', status: 'New', severity: 'High',
        assignedTo: RESIDENT, dateFrom: '2026-10-01', dateTo: '2026-10-31',
        sortBy: 'severity', order: 'asc', limit: '20' }, STAFF);
    const select = state.calls.find(c => c.sql.includes('SELECT sr.*'));
    assert.match(select.sql, /sr\.complex_id = \$1/);
    assert.match(select.sql, /ORDER BY sr\.severity ASC/);
    assert.ok(select.params.includes('CommonArea'));
    assert.ok(select.params.includes('High'));
    assert.ok(select.params.includes(COMPLEX));
    assert.ok(select.params.includes(20));
});

test('filter: residents cannot override own identity with query param', async () => {
    const { db, state } = fakeDb();
    const service = new RequestService({ db });
    await service.getRequests({ submittedBy: OTHER }, RESIDENT);
    const select = state.calls.find(c => c.sql.includes('SELECT sr.*'));
    assert.ok(select.params.includes(RESIDENT));
    assert.ok(!select.params.includes(OTHER));
});

test('filter: invalid enum, filter and sort rejected with ValidationError', async () => {
    const { db } = fakeDb();
    const service = new RequestService({ db });
    for (const filters of [{ status: 'INVALID' }, { sortBy: 'created_at; DROP TABLE users' },
        { dateFrom: '2026-02-30' }, { limit: '-1' }, { nonsense: 'x' }]) {
        await assert.rejects(service.getRequests(filters, STAFF), ValidationError);
    }
});

test('detail: returns request and history for authorised viewer, missing returns null', async () => {
    const { db } = fakeDb();
    const service = new RequestService({ db });
    const record = await service.getRequestById(REQUEST, RESIDENT);
    assert.equal(record.id, REQUEST);
    assert.deepEqual(record.history, []);
    const missing = new RequestService({ db: fakeDb({ notFound: true }).db });
    assert.equal(await missing.getRequestById('missing', RESIDENT), null);
});

test('status: valid transition increments version and creates audit in same transaction', async () => {
    const { db, state } = fakeDb();
    const service = new RequestService({ db });
    const changed = await service.updateRequestStatus(REQUEST, 'Assigned', 1, STAFF);
    assert.equal(changed.status, 'Assigned');
    assert.equal(changed.version, 2);
    assert.equal(state.commits, 1);
    assert.equal(state.rollbacks, 0);
    assert.deepEqual(state.history[0], { request_id: REQUEST, old_status: 'New', new_status: 'Assigned', changed_by: STAFF });
    assert.equal(state.released, true);
    const cmds = state.calls.map(c => c.sql.trim().split(' ')[0]);
    assert.ok(cmds.indexOf('INSERT') < cmds.indexOf('COMMIT'));
});

test('status: invalid transition throws ValidationError and rolls back before update or audit', async () => {
    const { db, state } = fakeDb();
    const service = new RequestService({ db });
    await assert.rejects(service.updateRequestStatus(REQUEST, 'Resolved', 1, STAFF), ValidationError);
    assert.equal(state.commits, 0);
    assert.equal(state.rollbacks, 1);
    assert.equal(state.history.length, 0);
    assert.equal(state.calls.some(c => c.sql.includes('UPDATE service_requests')), false);
});

test('status: stale version yields ConflictError, missing request yields NotFoundError', async () => {
    const { db } = fakeDb();
    const service = new RequestService({ db });
    await assert.rejects(service.updateRequestStatus(REQUEST, 'Assigned', 9, STAFF), ConflictError);
    const missing = new RequestService({ db: fakeDb({ notFound: true }).db });
    await assert.rejects(missing.updateRequestStatus(REQUEST, 'Assigned', 1, STAFF), NotFoundError);
});

test('status: invalid status/version rejected before opening transaction', async () => {
    const { db, state } = fakeDb();
    const service = new RequestService({ db });
    await assert.rejects(service.updateRequestStatus(REQUEST, 'NotAStatus', 1, STAFF), ValidationError);
    await assert.rejects(service.updateRequestStatus(REQUEST, 'Assigned', undefined, STAFF), ValidationError);
    assert.equal(state.calls.length, 0);
});

test('creation: Common Area and Lost Property map public categories to schema values', async () => {
    const { db, state } = fakeDb();
    const service = new RequestService({ db });
    const common = await service.createRequest({ ...valid, category: 'Common Area', areaName: 'Pool' });
    assert.equal(common.category, 'Common Area');
    assert.equal(common.categoryData.areaName, 'Pool');
    const lost = await service.createRequest({ ...valid, category: 'Lost Property', itemName: 'Keys', dateLastSeen: '2026-01-01' });
    assert.equal(lost.category, 'Lost Property');
    assert.equal(lost.categoryData.itemName, 'Keys');
    const inserts = state.calls.filter(c => c.sql.includes('INSERT INTO service_requests'));
    assert.deepEqual(inserts.map(c => c.params[1]), ['CommonArea', 'LostProperty']);
});

test('filter: exact date and alternate type/sort aliases are supported', async () => {
    const { db, state } = fakeDb();
    const service = new RequestService({ db });
    await service.getRequests({ type: 'Maintenance', date: '2026-10-18', sort: 'date', order: 'DESC' }, STAFF);
    const select = state.calls.find(c => c.sql.includes('SELECT sr.*'));
    assert.ok(select.params.includes('Maintenance'));
    assert.ok(select.params.includes('2026-10-18'));
    assert.match(select.sql, /ORDER BY sr\.created_at DESC/);
});

test('status: failed audit observer rolls back status transaction', async () => {
    const { db, state } = fakeDb();
    const service = new RequestService({ db });
    service.registerObserver({ async update() { throw new Error('Audit side-effect failure'); } });
    await assert.rejects(service.updateRequestStatus(REQUEST, 'Assigned', 1, STAFF));
    assert.equal(state.commits, 0);
    assert.equal(state.rollbacks, 1);
});
