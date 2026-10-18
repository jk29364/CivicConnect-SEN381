/** FR-004: Future notification integration point; no transport exists yet. */
export class ResidentNotificationObserver {
    async update({ requestId, newStatus }) {
        // Intentionally no notification sent: messaging provider not implemented.
        void requestId;
        void newStatus;
    }
}
