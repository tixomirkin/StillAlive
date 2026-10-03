import { Injectable, Logger } from '@nestjs/common';

export interface NotificationRecord {
  notificationConfigId: string;
  monitorId: string;
  type: string;
  channel: string;
  status: 'SENT' | 'FAILED';
  error?: string;
}

@Injectable()
export class NotificationHistoryService {
  private readonly logger = new Logger(NotificationHistoryService.name);
  // In-memory history (would be stored in DB in production)
  private readonly history: (NotificationRecord & { timestamp: Date })[] = [];

  async record(entry: NotificationRecord): Promise<void> {
    this.history.push({ ...entry, timestamp: new Date() });
    this.logger.debug(
      `Notification ${entry.status}: ${entry.channel} for monitor ${entry.monitorId}`,
    );

    // Keep only last 1000 entries in memory
    if (this.history.length > 1000) {
      this.history.splice(0, this.history.length - 1000);
    }
  }

  getHistory(monitorId?: string, limit: number = 50) {
    let entries = this.history;
    if (monitorId) {
      entries = entries.filter((e) => e.monitorId === monitorId);
    }
    return entries.slice(-limit).reverse();
  }

  getStats() {
    const total = this.history.length;
    const sent = this.history.filter((e) => e.status === 'SENT').length;
    const failed = this.history.filter((e) => e.status === 'FAILED').length;
    return { total, sent, failed, successRate: total > 0 ? (sent / total) * 100 : 0 };
  }
}
