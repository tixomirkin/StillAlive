import { Injectable, Logger } from '@nestjs/common';
import { NotificationPayload } from '../notification.service';

@Injectable()
export class TelegramChannel {
  private readonly logger = new Logger(TelegramChannel.name);

  async send(config: Record<string, string>, payload: NotificationPayload): Promise<void> {
    const isDown = payload.type === 'MONITOR_DOWN';
    const emoji = isDown ? '🔴' : '🟢';

    const text = [
      `${emoji} <b>${isDown ? 'Monitor Down' : 'Monitor Up'}</b>`,
      '',
      `<b>Monitor:</b> ${payload.monitorName}`,
      `<b>URL:</b> ${payload.monitorUrl}`,
      `<b>Status:</b> ${payload.previousStatus} → ${payload.currentStatus}`,
      payload.error ? `<b>Error:</b> ${payload.error}` : '',
      payload.responseTime ? `<b>Response Time:</b> ${payload.responseTime}ms` : '',
      `<b>Time:</b> ${payload.checkedAt.toISOString()}`,
    ]
      .filter(Boolean)
      .join('\n');

    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Telegram API failed: ${errorBody}`);
    }

    this.logger.log(`Telegram message sent to chat ${config.chatId}`);
  }
}
