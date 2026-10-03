import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailChannel } from './channels/email.channel';
import { SlackChannel } from './channels/slack.channel';
import { DiscordChannel } from './channels/discord.channel';
import { WebhookChannel } from './channels/webhook.channel';
import { TelegramChannel } from './channels/telegram.channel';
import { NotificationHistoryService } from './notification-history.service';

export interface NotificationPayload {
  type: 'MONITOR_DOWN' | 'MONITOR_UP';
  monitorId: string;
  monitorName: string;
  monitorUrl: string;
  previousStatus: string;
  currentStatus: string;
  error?: string;
  responseTime?: number;
  checkedAt: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  // Cooldown: don't send same notification within 5 minutes
  private readonly cooldownMs = 5 * 60 * 1000;
  private readonly lastNotified = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailChannel: EmailChannel,
    private readonly slackChannel: SlackChannel,
    private readonly discordChannel: DiscordChannel,
    private readonly webhookChannel: WebhookChannel,
    private readonly telegramChannel: TelegramChannel,
    private readonly historyService: NotificationHistoryService,
  ) {}

  async sendNotifications(payload: NotificationPayload): Promise<void> {
    // Check cooldown
    const cooldownKey = `${payload.monitorId}:${payload.type}`;
    const lastSent = this.lastNotified.get(cooldownKey);
    if (lastSent && Date.now() - lastSent < this.cooldownMs) {
      this.logger.debug(`Notification cooldown active for ${cooldownKey}, skipping`);
      return;
    }

    // Find notification configs linked to this monitor
    const monitorNotifications = await this.prisma.monitorNotification.findMany({
      where: { monitorId: payload.monitorId },
      include: { notificationConfig: true },
    });

    const enabledConfigs = monitorNotifications
      .map((mn) => mn.notificationConfig)
      .filter((config) => config.isEnabled);

    if (enabledConfigs.length === 0) {
      this.logger.debug(`No notification configs for monitor ${payload.monitorId}`);
      return;
    }

    this.logger.log(
      `Sending ${enabledConfigs.length} notifications for ${payload.type} on ${payload.monitorName}`,
    );

    for (const config of enabledConfigs) {
      try {
        const channelConfig = config.config as Record<string, string>;
        await this.dispatchToChannel(config.channel, channelConfig, payload);

        await this.historyService.record({
          notificationConfigId: config.id,
          monitorId: payload.monitorId,
          type: payload.type,
          channel: config.channel,
          status: 'SENT',
        });

        this.logger.log(`Notification sent via ${config.channel} for ${payload.monitorName}`);
      } catch (error) {
        this.logger.error(
          `Failed to send notification via ${config.channel}: ${error.message}`,
        );

        await this.historyService.record({
          notificationConfigId: config.id,
          monitorId: payload.monitorId,
          type: payload.type,
          channel: config.channel,
          status: 'FAILED',
          error: error.message,
        });
      }
    }

    this.lastNotified.set(cooldownKey, Date.now());
  }

  private async dispatchToChannel(
    channel: string,
    config: Record<string, string>,
    payload: NotificationPayload,
  ): Promise<void> {
    switch (channel) {
      case 'EMAIL':
        await this.emailChannel.send(config, payload);
        break;
      case 'SLACK':
        await this.slackChannel.send(config, payload);
        break;
      case 'DISCORD':
        await this.discordChannel.send(config, payload);
        break;
      case 'WEBHOOK':
        await this.webhookChannel.send(config, payload);
        break;
      case 'TELEGRAM':
        await this.telegramChannel.send(config, payload);
        break;
      default:
        this.logger.warn(`Unknown notification channel: ${channel}`);
    }
  }
}
