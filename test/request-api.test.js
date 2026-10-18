import test, { after, before, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import requestService from '../src/services/RequestService.js';
import { ValidationError, ConflictError } from '../src/services/errors.js';

const RESIDENT = '11111111-1111-4111-8111-111111111111';
const STAFF = '22222222-2222-4222-8222-222222222222';
const ORIGINAL = Object.fromEntries(['createRequest', 'getRequests', 'getRequestById',
    'updateRequestStatus'].map(k => [k, requestService[k]]));
let server, base;

before(async () => {
    process.env.JWT_SECRET = 'local-test-secret-not-for-deployment';
    server = app.listen(0);
    await new Promise(resolve => server.once('listening', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { if (server) await new Promise(resolve => server.close(resolve)); });
afterEach(() => { for (const [key, value] of Object.entries(ORIGINAL)) requestService[key] = value; });

function token(role = 'Resident', id = RESIDENT) {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '15m' });
}
async function api(method, path, body, bearer = token()) {
    const headers = {};
    if (bearer !== undefined) headers.authorization = `Bearer ${bearer}`;
    if (body !== undefined) headers['content-type'] = 'application/json';
    const response = await fetch(`${base}${path}`, {
        method, headers, body: body === undefined ? undefined : JSON.stringify(body)
    });
    return { status: response.status, body: await response.json() };
}

test('POST: 201, reference number, verified token overrides spoofed submittedBy', async () => {
    let received;
    requestService.createRequest = async data => {
        received = data;
        return { id: 'request-id', referenceNumber: 'CC-2026-TEST', submittedBy: data.submittedBy };
    };
    const result = await api('POST', '/api/requests', { category: 'Maintenance',
        description: 'Leak', location: 'Unit 1', faultType: 'Pipe', submittedBy: STAFF });
    assert.equal(result.status, 201);
    assert.equal(result.body.referenceNumber, 'CC-2026-TEST');
    assert.equal(received.submittedBy, RESIDENT);
});

test('POST: invalid input maps ValidationError to 400', async () => {
    requestService.createRequest = async () => { throw new ValidationError(['Missing location']); };
    const result = await api('POST', '/api/requests', {});
    assert.equal(result.status, 400);
    assert.equal(result.body.error, 'ValidationError');
});

test('POST: missing token returns 401 and never calls service', async () => {
    let called = false;
    requestService.createRequest = async () => { called = true; };
    const noToken = await fetch(`${base}/api/requests`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}'
    });
    assert.equal(noToken.status, 401);
    assert.equal(called, false);
});

test('POST: staff role returns 403', async () => {
    let called = false;
    requestService.createRequest = async () => { called = true; };
    const result = await api('POST', '/api/requests', {}, token('Staff', STAFF));
    assert.equal(result.status, 403);
    assert.equal(called, false);
});

test('GET: filter query is forwarded and result is returned', async () => {
    let filters, viewer;
    requestService.getRequests = async (f, u) => { filters = f; viewer = u; return [{ id: '1' }]; };
    const result = await api('GET', '/api/requests?status=New&severity=High&sortBy=createdAt', undefined, token('Staff', STAFF));
    assert.equal(result.status, 200);
    assert.deepEqual(result.body, [{ id: '1' }]);
    assert.equal(filters.status, 'New');
    assert.equal(filters.severity, 'High');
    assert.equal(viewer, STAFF);
});

test('GET detail: returns record, or 404 when missing', async () => {
    requestService.getRequestById = async () => ({ id: 'known' });
    assert.equal((await api('GET', '/api/requests/known')).status, 200);
    requestService.getRequestById = async () => null;
    assert.equal((await api('GET', '/api/requests/missing')).status, 404);
});

test('PUT: valid status passes version and actor to service', async () => {
    let received;
    requestService.updateRequestStatus = async (...args) => {
        received = args;
        return { id: 'known', status: 'Assigned', version: 2 };
    };
    const result = await api('PUT', '/api/requests/known/status',
        { status: 'Assigned', version: 1 }, token('Staff', STAFF));
    assert.equal(result.status, 200);
    assert.deepEqual(received, ['known', 'Assigned', 1, STAFF]);
});

test('PUT: invalid transition 400; stale version 409; resident cannot change status 403', async () => {
    requestService.updateRequestStatus = async () => { throw new ValidationError(['Invalid transition']); };
    assert.equal((await api('PUT', '/api/requests/known/status',
        { status: 'Resolved', version: 1 }, token('Staff', STAFF))).status, 400);
    requestService.updateRequestStatus = async () => { throw new ConflictError(); };
    assert.equal((await api('PUT', '/api/requests/known/status',
        { status: 'Assigned', version: 1 }, token('Staff', STAFF))).status, 409);
    assert.equal((await api('PUT', '/api/requests/known/status',
        { status: 'Assigned', version: 1 }, token('Resident', RESIDENT))).status, 403);
});

test('all request endpoints deny missing JWT with 401', async () => {
    for (const [method, path] of [['GET', '/api/requests'], ['GET', '/api/requests/id'],
        ['PUT', '/api/requests/id/status']]) {
        const result = await fetch(`${base}${path}`, { method });
        assert.equal(result.status, 401, `${method} ${path}`);
    }
});
