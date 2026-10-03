import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { NotificationPayload } from '../notification.service';

@Injectable()
export class EmailChannel {
  private readonly logger = new Logger(EmailChannel.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.example.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER', ''),
        pass: this.configService.get('SMTP_PASSWORD', ''),
      },
    });
  }

  async send(config: Record<string, string>, payload: NotificationPayload): Promise<void> {
    const isDown = payload.type === 'MONITOR_DOWN';
    const subject = isDown
      ? `🔴 DOWN: ${payload.monitorName} is not responding`
      : `🟢 UP: ${payload.monitorName} is back online`;

    const html = this.buildEmailTemplate(payload, isDown);

    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM', 'noreply@stillalive.dev'),
      to: config.email,
      subject,
      html,
    });

    this.logger.log(`Email sent to ${config.email}`);
  }

  private buildEmailTemplate(payload: NotificationPayload, isDown: boolean): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${isDown ? '#ef4444' : '#22c55e'}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">${isDown ? '🔴 Monitor Down' : '🟢 Monitor Up'}</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p><strong>Monitor:</strong> ${payload.monitorName}</p>
          <p><strong>URL:</strong> <a href="${payload.monitorUrl}">${payload.monitorUrl}</a></p>
          <p><strong>Status:</strong> ${payload.previousStatus} → ${payload.currentStatus}</p>
          ${payload.error ? `<p><strong>Error:</strong> ${payload.error}</p>` : ''}
          ${payload.responseTime ? `<p><strong>Response Time:</strong> ${payload.responseTime}ms</p>` : ''}
          <p><strong>Checked At:</strong> ${payload.checkedAt.toISOString()}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">This alert was sent by StillAlive Monitoring</p>
        </div>
      </div>
    `;
  }
}
