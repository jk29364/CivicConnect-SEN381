/**
 * Concrete Observer handling resident interface updates (FR-004)
 */
export class ResidentNotificationObserver {
  update(request, oldStatus, newStatus) {
    console.log(`[Notification Engine] Alerting Resident: Request ${request.id} shifted from ${oldStatus} to ${newStatus}.`);
    // Query notificationService API hook here
  }
}
