import { Injectable, Logger } from '@nestjs/common';
import { NotificationPayload } from '../notification.service';

@Injectable()
export class DiscordChannel {
  private readonly logger = new Logger(DiscordChannel.name);

  async send(config: Record<string, string>, payload: NotificationPayload): Promise<void> {
    const isDown = payload.type === 'MONITOR_DOWN';
    const color = isDown ? 0xef4444 : 0x22c55e;

    const embed = {
      embeds: [
        {
          title: isDown ? '🔴 Monitor Down' : '🟢 Monitor Up',
          description: `**${payload.monitorName}** is ${isDown ? 'not responding' : 'back online'}`,
          color,
          fields: [
            { name: 'URL', value: payload.monitorUrl, inline: true },
            { name: 'Status', value: `${payload.previousStatus} → ${payload.currentStatus}`, inline: true },
            ...(payload.error ? [{ name: 'Error', value: payload.error, inline: false }] : []),
            ...(payload.responseTime ? [{ name: 'Response Time', value: `${payload.responseTime}ms`, inline: true }] : []),
          ],
          timestamp: payload.checkedAt.toISOString(),
          footer: { text: 'StillAlive Monitoring' },
        },
      ],
    };

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(embed),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.statusText}`);
    }

    this.logger.log('Discord notification sent');
  }
}
