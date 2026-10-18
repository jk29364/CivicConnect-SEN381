/**
 * NFR-004: Audit entries must be persisted using the same PostgreSQL client
 * and transaction as the corresponding status change.
 */
export class AuditHistoryObserver {
    async update({ client, requestId, oldStatus, newStatus, userId }) {
        await client.query(
            `INSERT INTO request_history (request_id, old_status, new_status, changed_by)
             VALUES ($1, $2, $3, $4)`,
            [requestId, oldStatus, newStatus, userId]
        );
    }
}
