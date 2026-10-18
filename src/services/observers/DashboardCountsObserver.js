/** FR-008: Placeholder for future dashboard cache invalidation. */
export class DashboardCountsObserver {
    async update({ requestId, oldStatus, newStatus }) {
        // Currently, dashboards read directly from PostgreSQL: no cache to invalidate.
        // Keep the Observer interface for adding an actual cache in a later milestone.
        void requestId;
        void oldStatus;
        void newStatus;
    }
}
