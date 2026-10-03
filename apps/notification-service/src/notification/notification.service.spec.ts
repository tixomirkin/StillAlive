import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService, NotificationPayload } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailChannel } from './channels/email.channel';
import { SlackChannel } from './channels/slack.channel';
import { DiscordChannel } from './channels/discord.channel';
import { WebhookChannel } from './channels/webhook.channel';
import { TelegramChannel } from './channels/telegram.channel';
import { NotificationHistoryService } from './notification-history.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: PrismaService;
  let emailChannel: EmailChannel;
  let historyService: NotificationHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: {
            monitorNotification: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: EmailChannel,
          useValue: { send: jest.fn() },
        },
        {
          provide: SlackChannel,
          useValue: { send: jest.fn() },
        },
        {
          provide: DiscordChannel,
          useValue: { send: jest.fn() },
        },
        {
          provide: WebhookChannel,
          useValue: { send: jest.fn() },
        },
        {
          provide: TelegramChannel,
          useValue: { send: jest.fn() },
        },
        {
          provide: NotificationHistoryService,
          useValue: { record: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prisma = module.get<PrismaService>(PrismaService);
    emailChannel = module.get<EmailChannel>(EmailChannel);
    historyService = module.get<NotificationHistoryService>(NotificationHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should not send notification if no configs exist', async () => {
    jest.spyOn(prisma.monitorNotification, 'findMany').mockResolvedValue([]);
    
    await service.sendNotifications({
      type: 'MONITOR_DOWN',
      monitorId: 'monitor-1',
      monitorName: 'Test Monitor',
      monitorUrl: 'http://test.com',
      previousStatus: 'UP',
      currentStatus: 'DOWN',
      checkedAt: new Date(),
    });

    expect(emailChannel.send).not.toHaveBeenCalled();
  });

  it('should send notifications to enabled configs', async () => {
    jest.spyOn(prisma.monitorNotification, 'findMany').mockResolvedValue([
      {
        monitorId: 'monitor-1',
        notificationConfigId: 'config-1',
        notificationConfig: {
          id: 'config-1',
          userId: 'user-1',
          channel: 'EMAIL',
          name: 'Email Config',
          config: { email: 'test@example.com' },
          isEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any,
    ]);

    const payload: NotificationPayload = {
      type: 'MONITOR_DOWN',
      monitorId: 'monitor-1',
      monitorName: 'Test Monitor',
      monitorUrl: 'http://test.com',
      previousStatus: 'UP',
      currentStatus: 'DOWN',
      checkedAt: new Date(),
    };

    await service.sendNotifications(payload);

    expect(emailChannel.send).toHaveBeenCalledWith({ email: 'test@example.com' }, payload);
    expect(historyService.record).toHaveBeenCalledWith(expect.objectContaining({
      status: 'SENT',
    }));
  });

  it('should respect cooldown', async () => {
    jest.spyOn(prisma.monitorNotification, 'findMany').mockResolvedValue([
      {
        monitorId: 'monitor-1',
        notificationConfigId: 'config-1',
        notificationConfig: {
          id: 'config-1',
          userId: 'user-1',
          channel: 'EMAIL',
          name: 'Email Config',
          config: { email: 'test@example.com' },
          isEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any,
    ]);

    const payload: NotificationPayload = {
      type: 'MONITOR_DOWN',
      monitorId: 'monitor-1',
      monitorName: 'Test Monitor',
      monitorUrl: 'http://test.com',
      previousStatus: 'UP',
      currentStatus: 'DOWN',
      checkedAt: new Date(),
    };

    await service.sendNotifications(payload);
    await service.sendNotifications(payload); // Should hit cooldown

    expect(emailChannel.send).toHaveBeenCalledTimes(1); // Only sent once
  });
});
