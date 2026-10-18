import test from 'node:test';
import assert from 'node:assert/strict';
import { RequestFactory } from '../src/services/RequestFactory.js';
import { ValidationError } from '../src/services/errors.js';

const factory = new RequestFactory();
const base = { description: 'Leaking tap', location: 'Unit 12', submittedBy: 'u1' };

// Passes only if creation is rejected with a ValidationError that names the expected problem,
// so a test cannot pass for the wrong reason.
function assertRejected(action, expectedText) {
  assert.throws(action, (e) =>
    e instanceof ValidationError && e.errors.some((m) => m.includes(expectedText))
  );
}

test('RF-01: valid Maintenance request gets default severity Low and status New', () => {
  const r = factory.create('Maintenance', { ...base, faultType: 'Plumbing' });
  assert.equal(r.category, 'Maintenance');
  assert.equal(r.status, 'New');
  assert.equal(r.severity, 'Low');
});

test('RF-02: explicit severity High is preserved', () => {
  const r = factory.create('Maintenance', { ...base, faultType: 'Electrical', severity: 'High' });
  assert.equal(r.severity, 'High');
});

test('RF-03: severity outside Low/Medium/High is rejected', () => {
  assertRejected(() => factory.create('Maintenance', { ...base, faultType: 'Plumbing', severity: 'Urgent' }), 'severity');
});

test('RF-04: Maintenance request without faultType is rejected', () => {
  assertRejected(() => factory.create('Maintenance', base), 'faultType');
});

test('RF-05: Security request with a future incidentTime is rejected', () => {
  const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  assertRejected(() => factory.create('Security', { ...base, incidentTime: future, threatLevel: 'Low' }), 'incidentTime');
});

test('RF-06: Common Area request without areaName is rejected', () => {
  assertRejected(() => factory.create('Common Area', base), 'areaName');
});

test('RF-07: valid Lost Property request is created', () => {
  const r = factory.create('Lost Property', { ...base, itemName: 'Keys', dateLastSeen: '2020-01-01' });
  assert.equal(r.category, 'Lost Property');
  assert.equal(r.status, 'New');
});

test('RF-08: Unknown category is rejected', () => {
  assertRejected(() => factory.create('Pets', base), 'Unknown category');
});

test('RF-09: request without location is rejected for any category', () => {
  assertRejected(
    () => factory.create('Common Area', { description: 'Gate broken', submittedBy: 'u1', areaName: 'Main gate' }),
    'location'
  );
});

test('RF-10: request with blank description is rejected', () => {
  assertRejected(() => factory.create('Maintenance', { ...base, description: '   ', faultType: 'Plumbing' }), 'description');
});