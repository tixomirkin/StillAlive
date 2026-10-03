import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { StatusChangeDetector } from './status-change.detector';
import { EmailChannel } from './channels/email.channel';
import { SlackChannel } from './channels/slack.channel';
import { DiscordChannel } from './channels/discord.channel';
import { WebhookChannel } from './channels/webhook.channel';
import { TelegramChannel } from './channels/telegram.channel';
import { NotificationHistoryService } from './notification-history.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [NotificationController, StatusChangeDetector],
  providers: [
    NotificationService,
    NotificationHistoryService,
    EmailChannel,
    SlackChannel,
    DiscordChannel,
    WebhookChannel,
    TelegramChannel,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
