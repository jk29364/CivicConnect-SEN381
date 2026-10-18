import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import requestService from '../src/services/RequestService.js';
import requestController from '../src/middleware/request.controller.js';
import { ValidationError, ConflictError, NotFoundError } from '../src/services/errors.js';

const originals = Object.fromEntries([
    'createRequest', 'getRequests', 'getRequestById', 'updateRequestStatus'
].map(name => [name, requestService[name]]));
afterEach(() => {
    for (const [name, original] of Object.entries(originals)) requestService[name] = original;
});
function response() {
    return {
        statusCode: 200, body: undefined,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
}

test('POST returns 201, reference and immutable verified submitter', async () => {
    let input;
    requestService.createRequest = async data => {
        input = data;
        return { id: 'uuid', referenceNumber: 'CC-2026-123', submittedBy: data.submittedBy };
    };
    const res = response();
    await requestController.createRequest({ user: { id: 'real-user' }, body: {
        description: 'Repair', submittedBy: 'spoofed-user'
    } }, res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.referenceNumber, 'CC-2026-123');
    assert.equal(input.submittedBy, 'real-user');
});

test('POST returns 400 for ValidationError (string and array both supported)', async () => {
    for (const value of ['missing location', ['missing location']]) {
        requestService.createRequest = async () => { throw new ValidationError(value); };
        const res = response();
        await requestController.createRequest({ user: { id: 'x' }, body: {} }, res);
        assert.equal(res.statusCode, 400);
        assert.match(res.body.message, /missing location/);
    }
});

test('POST returns 401 without verified identity and does not call service', async () => {
    let invoked = false;
    requestService.createRequest = async () => { invoked = true; };
    const res = response();
    await requestController.createRequest({ body: { submittedBy: 'forged' } }, res);
    assert.equal(res.statusCode, 401);
    assert.equal(invoked, false);
});

test('GET list passes filters and identity to service', async () => {
    let received;
    requestService.getRequests = async (...args) => { received = args; return [{ id: 1 }]; };
    const res = response();
    const filters = { status: 'New', category: 'Maintenance', assignedTo: 'staff-id' };
    await requestController.getRequests({ user: { id: 'resident-id' }, query: filters }, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, [{ id: 1 }]);
    assert.deepEqual(received, [filters, 'resident-id']);
});

test('GET list returns 400 for invalid filter', async () => {
    requestService.getRequests = async () => { throw new ValidationError('Invalid filter'); };
    const res = response();
    await requestController.getRequests({ user: { id: 'x' }, query: {} }, res);
    assert.equal(res.statusCode, 400);
});

test('GET by ID returns 200 when found and 404 when absent', async () => {
    requestService.getRequestById = async () => ({ id: 'known' });
    const found = response();
    await requestController.getRequestById({ user: { id: 'x' }, params: { id: 'known' } }, found);
    assert.equal(found.statusCode, 200);
    requestService.getRequestById = async () => null;
    const missing = response();
    await requestController.getRequestById({ user: { id: 'x' }, params: { id: 'unknown' } }, missing);
    assert.equal(missing.statusCode, 404);
});

test('PUT passes version/user; maps invalid lifecycle to 400', async () => {
    let called;
    requestService.updateRequestStatus = async (...args) => {
        called = args;
        return { id: 'r1', status: 'Assigned', version: 2 };
    };
    const req = { user: { id: 'staff-id' }, params: { id: 'r1' }, body: { status: 'Assigned', version: 1 } };
    const res = response();
    await requestController.updateStatus(req, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(called, ['r1', 'Assigned', 1, 'staff-id']);

    requestService.updateRequestStatus = async () => { throw new ValidationError('Invalid state transition'); };
    const rejected = response();
    await requestController.updateStatus(req, rejected);
    assert.equal(rejected.statusCode, 400);
});

test('PUT reports version conflicts and absent records correctly', async () => {
    const req = { user: { id: 'staff-id' }, params: { id: 'r1' }, body: { status: 'Assigned', version: 1 } };
    requestService.updateRequestStatus = async () => { throw new ConflictError(); };
    const conflict = response();
    await requestController.updateStatus(req, conflict);
    assert.equal(conflict.statusCode, 409);
    requestService.updateRequestStatus = async () => { throw new NotFoundError(); };
    const missing = response();
    await requestController.updateStatus(req, missing);
    assert.equal(missing.statusCode, 404);
});

test('PUT missing status returns 400 without invoking service', async () => {
    let invoked = false;
    requestService.updateRequestStatus = async () => { invoked = true; };
    const res = response();
    await requestController.updateStatus({ user: { id: 'x' }, params: { id: 'r' }, body: {} }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(invoked, false);
});
