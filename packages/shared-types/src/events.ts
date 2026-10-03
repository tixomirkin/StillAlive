/**
 * NATS subject constants for inter-service communication
 */
export const NatsSubjects = {
  // Monitor events
  MONITOR_CREATED: 'monitor.created',
  MONITOR_UPDATED: 'monitor.updated',
  MONITOR_DELETED: 'monitor.deleted',

  // Check events
  CHECK_SCHEDULED: 'check.scheduled',
  CHECK_COMPLETED: 'check.completed',

  // Notification events
  NOTIFICATION_SEND: 'notification.send',
  NOTIFICATION_SENT: 'notification.sent',

  // Status page events
  STATUS_UPDATE: 'status.update',
} as const;

export type NatsSubject = (typeof NatsSubjects)[keyof typeof NatsSubjects];
