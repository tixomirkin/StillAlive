import { Injectable, Logger } from '@nestjs/common';
import { NotificationPayload } from '../notification.service';

@Injectable()
export class SlackChannel {
  private readonly logger = new Logger(SlackChannel.name);

  async send(config: Record<string, string>, payload: NotificationPayload): Promise<void> {
    const isDown = payload.type === 'MONITOR_DOWN';

    const message = {
      text: `${isDown ? '🔴' : '🟢'} ${payload.monitorName} is ${isDown ? 'DOWN' : 'UP'}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${isDown ? '🔴 Monitor Down' : '🟢 Monitor Up'}`,
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Monitor:*\n${payload.monitorName}` },
            { type: 'mrkdwn', text: `*URL:*\n${payload.monitorUrl}` },
            { type: 'mrkdwn', text: `*Status:*\n${payload.previousStatus} → ${payload.currentStatus}` },
            { type: 'mrkdwn', text: `*Time:*\n${payload.checkedAt.toISOString()}` },
          ],
        },
      ],
    };

    if (payload.error) {
      message.blocks.push({
        type: 'section',
        fields: [{ type: 'mrkdwn', text: `*Error:*\n${payload.error}` }],
      } as any);
    }

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.statusText}`);
    }

    this.logger.log('Slack notification sent');
  }
}
