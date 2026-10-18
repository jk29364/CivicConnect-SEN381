import { randomUUID } from 'node:crypto';
import pool from '../config/db.js';
import { requestFactory } from './RequestFactory.js';
import { AuditHistoryObserver } from './observers/AuditHistoryObserver.js';
import { ValidationError, NotFoundError, ConflictError } from './errors.js';

const TRANSITIONS = Object.freeze({
    New: ['Assigned', 'Closed'],
    Assigned: ['InProgress', 'New', 'Closed'],
    InProgress: ['Resolved'],
    Resolved: ['Closed', 'InProgress'],
    Closed: []
});
const STATUS = Object.keys(TRANSITIONS);
const SEVERITY = ['Low', 'Medium', 'High'];
const TO_DB_CATEGORY = Object.freeze({
    Maintenance: 'Maintenance',
    Security: 'Security',
    'Common Area': 'CommonArea',
    'Lost Property': 'LostProperty'
});
const FROM_DB_CATEGORY = Object.fromEntries(
    Object.entries(TO_DB_CATEGORY).map(([display, stored]) => [stored, display])
);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SORT_COLUMNS = Object.freeze({
    createdAt: 'sr.created_at', date: 'sr.created_at',
    severity: 'sr.severity', status: 'sr.status',
    category: 'sr.category', assignedTo: 'sr.assigned_to'
});
const VALID_FILTERS = new Set([
    'status', 'category', 'type', 'severity', 'assignedTo', 'submittedBy',
    'date', 'dateFrom', 'dateTo', 'sort', 'sortBy', 'order', 'limit'
]);

function requireUuid(id, name) {
    if (typeof id !== 'string' || !UUID.test(id)) {
        throw new ValidationError([`${name} must be a UUID`]);
    }
}

function requireEnum(value, options, name) {
    if (!options.includes(value)) {
        throw new ValidationError([`${name} must be one of ${options.join(', ')}`]);
    }
}

function requireDate(value, name) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        Number.isNaN(Date.parse(`${value}T00:00:00Z`)) ||
        new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value) {
        throw new ValidationError([`${name} must be a valid YYYY-MM-DD date`]);
    }
}

function serialize(row) {
    if (!row) return null;
    const { reference_number, submitted_by, assigned_to, complex_id, category_data,
        created_at, updated_at, ...rest } = row;
    return {
        ...rest,
        category: FROM_DB_CATEGORY[row.category] ?? row.category,
        referenceNumber: reference_number,
        submittedBy: submitted_by,
        assignedTo: assigned_to,
        complexId: complex_id,
        categoryData: category_data ?? {},
        createdAt: created_at,
        updatedAt: updated_at
    };
}

/** Exporting the class lets service unit tests inject a fake database. */
export class RequestService {
    constructor({ db = pool, factory = requestFactory } = {}) {
        this.db = db;
        this.factory = factory;
        // Audit must always run, even if app.js has not registered optional observers.
        this.observers = [new AuditHistoryObserver()];
    }

    registerObserver(observer) {
        if (!observer || typeof observer.update !== 'function') {
            throw new TypeError('Observer must provide an update(event) method');
        }
        this.observers.push(observer);
    }

    async getActor(userId, db = this.db) {
        requireUuid(userId, 'Authenticated user ID');
        const { rows } = await db.query(
            'SELECT id, role, complex_id FROM users WHERE id = $1', [userId]
        );
        // An otherwise valid token for a deleted account is not authorised.
        if (!rows.length) throw new NotFoundError('Authenticated user not found.');
        return rows[0];
    }

    async createRequest(payload) {
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            throw new ValidationError(['Request body must be a JSON object']);
        }
        // Do not allow numeric or object descriptions to pass the Factory's string coercion.
        for (const field of ['description', 'location']) {
            if (typeof payload[field] !== 'string' || !payload[field].trim()) {
                throw new ValidationError([`${field} must be a non-empty string`]);
            }
        }
        const category = TO_DB_CATEGORY[payload.category];
        if (!category) throw new ValidationError([`Unknown category: ${payload.category}`]);
        // The existing Factory remains the source of category-specific validation.
        const request = this.factory.create(payload.category, payload);
        const actor = await this.getActor(payload.submittedBy);
        if (actor.role !== 'Resident') {
            throw new ValidationError(['Only residents can submit service requests']);
        }

        const categoryData = {};
        for (const name of ['faultType', 'incidentTime', 'threatLevel',
            'areaName', 'itemName', 'dateLastSeen']) {
            if (request[name] !== undefined) categoryData[name] = request[name];
        }
        // UUID + database UNIQUE constraint: collision-resistant, cross-process references.
        const referenceNumber = `CC-${new Date().getUTCFullYear()}-${randomUUID().replaceAll('-', '').toUpperCase()}`;
        const { rows } = await this.db.query(
            `INSERT INTO service_requests
                (reference_number, category, description, location, severity, complex_id,
                 submitted_by, category_data)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
             RETURNING *`,
            [referenceNumber, category, request.description.trim(), request.location.trim(),
                request.severity, actor.complex_id, actor.id, JSON.stringify(categoryData)]
        );
        return serialize(rows[0]);
    }

    async getRequests(filters = {}, viewerId) {
        const actor = await this.getActor(viewerId);
        if (!['Resident', 'Staff', 'Agent'].includes(actor.role)) {
            throw new ValidationError(['Unsupported account role']);
        }
        if (!filters || typeof filters !== 'object' || Array.isArray(filters)) {
            throw new ValidationError(['Filters must be an object']);
        }
        const unknown = Object.keys(filters).filter(key => !VALID_FILTERS.has(key));
        if (unknown.length) throw new ValidationError([`Unknown filter: ${unknown.join(', ')}`]);

        const params = [];
        const conditions = [];
        const add = (column, op, value) => {
            params.push(value);
            conditions.push(`${column} ${op} $${params.length}`);
        };
        // Estate isolation and resident ownership cannot be overridden by query strings.
        add('sr.complex_id', '=', actor.complex_id);
        if (actor.role === 'Resident') add('sr.submitted_by', '=', actor.id);
        else if (filters.submittedBy) {
            requireUuid(filters.submittedBy, 'submittedBy');
            add('sr.submitted_by', '=', filters.submittedBy);
        }

        if (filters.status) {
            requireEnum(filters.status, STATUS, 'status');
            add('sr.status', '=', filters.status);
        }
        const category = filters.category ?? filters.type;
        if (filters.category && filters.type && filters.category !== filters.type) {
            throw new ValidationError(['category and type filters disagree']);
        }
        if (category) {
            if (!TO_DB_CATEGORY[category]) throw new ValidationError([`Unknown category: ${category}`]);
            add('sr.category', '=', TO_DB_CATEGORY[category]);
        }
        if (filters.severity) {
            requireEnum(filters.severity, SEVERITY, 'severity');
            add('sr.severity', '=', filters.severity);
        }
        if (filters.assignedTo) {
            requireUuid(filters.assignedTo, 'assignedTo');
            add('sr.assigned_to', '=', filters.assignedTo);
        }
        if (filters.date) {
            requireDate(filters.date, 'date');
            add('sr.created_at', '>=', `${filters.date}T00:00:00Z`);
            params.push(filters.date);
            conditions.push(`sr.created_at < ($${params.length}::date + INTERVAL '1 day')`);
        }
        if (filters.dateFrom) {
            requireDate(filters.dateFrom, 'dateFrom');
            add('sr.created_at', '>=', `${filters.dateFrom}T00:00:00Z`);
        }
        if (filters.dateTo) {
            requireDate(filters.dateTo, 'dateTo');
            // Exclusive upper bound includes the entire specified UTC day.
            params.push(filters.dateTo);
            conditions.push(`sr.created_at < ($${params.length}::date + INTERVAL '1 day')`);
        }
        const sortBy = filters.sortBy ?? filters.sort ?? 'createdAt';
        if (!Object.hasOwn(SORT_COLUMNS, sortBy)) {
            throw new ValidationError([`Unsupported sortBy: ${sortBy}`]);
        }
        if (filters.order !== undefined && typeof filters.order !== 'string') {
            throw new ValidationError(['order must be a string']);
        }
        const order = (filters.order ?? 'desc').toLowerCase();
        if (!['asc', 'desc'].includes(order)) {
            throw new ValidationError(['order must be asc or desc']);
        }
        const limit = filters.limit === undefined ? 100 : Number(filters.limit);
        if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
            throw new ValidationError(['limit must be an integer between 1 and 200']);
        }
        params.push(limit);
        const { rows } = await this.db.query(
            `SELECT sr.* FROM service_requests sr
             WHERE ${conditions.join(' AND ')}
             ORDER BY ${SORT_COLUMNS[sortBy]} ${order.toUpperCase()}, sr.id DESC
             LIMIT $${params.length}`,
            params
        );
        return rows.map(serialize);
    }

    async getRequestById(id, viewerId) {
        const actor = await this.getActor(viewerId);
        const params = [String(id), actor.complex_id];
        let where = `(sr.id::text = $1 OR sr.reference_number = $1) AND sr.complex_id = $2`;
        if (actor.role === 'Resident') {
            params.push(actor.id);
            where += ` AND sr.submitted_by = $3`;
        } else if (!['Staff', 'Agent'].includes(actor.role)) {
            throw new ValidationError(['Unsupported account role']);
        }
        const { rows } = await this.db.query(
            `SELECT sr.* FROM service_requests sr WHERE ${where}`, params
        );
        if (!rows.length) return null;
        const historyResult = await this.db.query(
            `SELECT old_status AS "oldStatus", new_status AS "newStatus",
                    changed_by AS "changedBy", changed_at AS "changedAt"
             FROM request_history WHERE request_id = $1 ORDER BY changed_at ASC, id ASC`,
            [rows[0].id]
        );
        return { ...serialize(rows[0]), history: historyResult.rows };
    }

    async updateRequestStatus(requestId, newStatus, currentVersion, userId) {
        requireEnum(newStatus, STATUS, 'status');
        if (!Number.isInteger(currentVersion) || currentVersion < 1) {
            throw new ValidationError(['version must be a positive integer']);
        }
        const client = await this.db.connect();
        let inTransaction = false;
        try {
            await client.query('BEGIN');
            inTransaction = true;
            const actor = await this.getActor(userId, client);
            if (!['Staff', 'Agent'].includes(actor.role)) {
                throw new ValidationError(['Only staff or agents may change request status']);
            }
            const { rows } = await client.query(
                `SELECT * FROM service_requests
                 WHERE (id::text = $1 OR reference_number = $1) AND complex_id = $2
                 FOR UPDATE`,
                [String(requestId), actor.complex_id]
            );
            if (!rows.length) throw new NotFoundError();
            const current = rows[0];
            if (current.version !== currentVersion) {
                throw new ConflictError('Stale update: the request was modified by another user.');
            }
            if (!TRANSITIONS[current.status]?.includes(newStatus)) {
                throw new ValidationError([`Invalid transition from ${current.status} to ${newStatus}`]);
            }
            const updated = await client.query(
                `UPDATE service_requests
                 SET status = $1, version = version + 1, updated_at = NOW()
                 WHERE id = $2 AND version = $3 RETURNING *`,
                [newStatus, current.id, currentVersion]
            );
            if (!updated.rows.length) throw new ConflictError();
            for (const observer of this.observers) {
                await observer.update({
                    client, requestId: current.id, oldStatus: current.status,
                    newStatus, userId: actor.id, request: updated.rows[0]
                });
            }
            await client.query('COMMIT');
            inTransaction = false;
            return serialize(updated.rows[0]);
        } catch (error) {
            if (inTransaction) {
                try { await client.query('ROLLBACK'); }
                catch (rollbackError) { console.error('Rollback failed:', rollbackError); }
            }
            throw error;
        } finally {
            client.release();
        }
    }

    // Preserve the pre-existing service API for the DB test script.
    async updateStatus(requestId, newStatus, currentVersion, userId) {
        return this.updateRequestStatus(requestId, newStatus, currentVersion, userId);
    }
}

export default new RequestService();
