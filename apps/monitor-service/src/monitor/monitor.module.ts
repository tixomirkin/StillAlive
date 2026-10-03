import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MonitorController } from './monitor.controller';
import { MonitorService } from './monitor.service';
import { MonitorScheduler } from './monitor.scheduler';
import { CheckResultProcessor } from './check-result.processor';
import { CheckResultListener } from './check-result.listener';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueueAsync({
      name: 'monitor-checks',
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync([
      {
        name: 'NATS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.NATS,
          options: {
            servers: [configService.get('NATS_URL', 'nats://localhost:4222')],
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [MonitorController, CheckResultListener],
  providers: [MonitorService, MonitorScheduler, CheckResultProcessor],
  exports: [MonitorService],
})
export class MonitorModule {}
