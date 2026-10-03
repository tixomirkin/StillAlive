export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SLACK = 'SLACK',
  DISCORD = 'DISCORD',
  WEBHOOK = 'WEBHOOK',
  TELEGRAM = 'TELEGRAM',
}

export enum NotificationType {
  MONITOR_DOWN = 'MONITOR_DOWN',
  MONITOR_UP = 'MONITOR_UP',
  SSL_EXPIRING = 'SSL_EXPIRING',
}

export interface NotificationConfig {
  id: string;
  userId: string;
  channel: NotificationChannel;
  name: string;
  config: Record<string, string>; // channel-specific config
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationEvent {
  type: NotificationType;
  monitorId: string;
  monitorName: string;
  monitorUrl: string;
  previousStatus: string;
  currentStatus: string;
  checkedAt: Date;
  error?: string;
  responseTime?: number;
}
