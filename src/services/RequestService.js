// src/services/RequestService.js
// Changed from require() to import
import pool from '../config/db.js'; 

const VALID_TRANSITIONS = {
    'New': ['Assigned', 'Closed'],
    'Assigned': ['InProgress', 'New', 'Closed'],
    'InProgress': ['Resolved'],
    'Resolved': ['Closed', 'InProgress'],
    'Closed': [] 
};

class RequestService {
    constructor() {
        this.observers = [];
    }

    registerObserver(observer) {
        this.observers.push(observer);
    }

    async updateStatus(requestId, newStatus, currentVersion, userId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { rows } = await client.query(
                'SELECT status, version FROM service_requests WHERE id = $1 FOR UPDATE',
                [requestId]
            );

            if (rows.length === 0) throw new Error('Request not found.');

            const currentStatus = rows[0].status;

            if (!VALID_TRANSITIONS[currentStatus].includes(newStatus)) {
                throw new Error(`Invalid transition from ${currentStatus} to ${newStatus}`);
            }

            if (rows[0].version !== currentVersion) {
                throw new Error('Stale update: The request was modified by another user.');
            }

            const updateResult = await client.query(
                `UPDATE service_requests 
                 SET status = $1, version = version + 1, updated_at = NOW() 
                 WHERE id = $2 AND version = $3 
                 RETURNING *`,
                [newStatus, requestId, currentVersion]
            );

            if (updateResult.rowCount === 0) throw new Error('Concurrency conflict during update.');

            for (const observer of this.observers) {
                await observer.update({
                    client,
                    requestId, 
                    oldStatus: currentStatus, 
                    newStatus, 
                    userId
                });
            }

            await client.query('COMMIT');
            return updateResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error; 
        } finally {
            client.release();
        }
    }
}

// Changed from module.exports to export default
export default new RequestService();
