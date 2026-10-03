import { Injectable, Logger } from '@nestjs/common';
import { NotificationPayload } from '../notification.service';

@Injectable()
export class WebhookChannel {
  private readonly logger = new Logger(WebhookChannel.name);

  async send(config: Record<string, string>, payload: NotificationPayload): Promise<void> {
    const body = {
      event: payload.type,
      monitor: {
        id: payload.monitorId,
        name: payload.monitorName,
        url: payload.monitorUrl,
      },
      previousStatus: payload.previousStatus,
      currentStatus: payload.currentStatus,
      error: payload.error,
      responseTime: payload.responseTime,
      checkedAt: payload.checkedAt.toISOString(),
      timestamp: new Date().toISOString(),
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'StillAlive-Webhook/1.0',
    };

    // Add custom secret header if configured
    if (config.secret) {
      headers['X-StillAlive-Secret'] = config.secret;
    }

    const response = await fetch(config.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    this.logger.log(`Webhook sent to ${config.url}`);
  }
}
