import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService, NotificationPayload } from './notification.service';

interface CheckCompletedEvent {
  monitorId: string;
  status: string;
  statusCode?: number;
  responseTime: number;
  error?: string;
  checkedAt: string;
  region?: string;
}

@Controller()
export class StatusChangeDetector {
  private readonly logger = new Logger(StatusChangeDetector.name);
  // Track previous statuses in memory
  private readonly previousStatuses = new Map<string, string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  @EventPattern('check.completed')
  async handleCheckCompleted(@Payload() data: CheckCompletedEvent) {
    const previousStatus = this.previousStatuses.get(data.monitorId);

    // If we don't know the previous status, fetch from DB
    if (!previousStatus) {
      const monitor = await this.prisma.monitor.findUnique({
        where: { id: data.monitorId },
        select: { status: true, name: true, url: true },
      });

      if (!monitor) {
        this.logger.warn(`Monitor not found: ${data.monitorId}`);
        return;
      }

      this.previousStatuses.set(data.monitorId, monitor.status);

      // First check — detect if it's already down
      if (data.status === 'DOWN' && monitor.status !== 'DOWN') {
        await this.triggerNotification(data, monitor.name, monitor.url, monitor.status);
      }

      this.previousStatuses.set(data.monitorId, data.status);
      return;
    }

    // Detect status change
    if (previousStatus !== data.status) {
      this.logger.log(
        `Status change detected for ${data.monitorId}: ${previousStatus} → ${data.status}`,
      );

      const monitor = await this.prisma.monitor.findUnique({
        where: { id: data.monitorId },
        select: { name: true, url: true },
      });

      if (monitor) {
        await this.triggerNotification(data, monitor.name, monitor.url, previousStatus);
      }
    }

    this.previousStatuses.set(data.monitorId, data.status);
  }

  private async triggerNotification(
    data: CheckCompletedEvent,
    monitorName: string,
    monitorUrl: string,
    previousStatus: string,
  ): Promise<void> {
    const payload: NotificationPayload = {
      type: data.status === 'DOWN' ? 'MONITOR_DOWN' : 'MONITOR_UP',
      monitorId: data.monitorId,
      monitorName,
      monitorUrl,
      previousStatus,
      currentStatus: data.status,
      error: data.error,
      responseTime: data.responseTime,
      checkedAt: new Date(data.checkedAt),
    };

    await this.notificationService.sendNotifications(payload);
  }
}
