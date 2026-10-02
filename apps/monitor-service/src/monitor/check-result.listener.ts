import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { MonitorService } from './monitor.service';

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
export class CheckResultListener {
  private readonly logger = new Logger(CheckResultListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly monitorService: MonitorService,
  ) {}

  @EventPattern('check.completed')
  async handleCheckCompleted(@Payload() data: CheckCompletedEvent) {
    this.logger.log(`Received check result for monitor: ${data.monitorId}, status: ${data.status}`);

    try {
      // Store check result in database
      await this.prisma.checkResult.create({
        data: {
          monitorId: data.monitorId,
          status: data.status as any,
          statusCode: data.statusCode,
          responseTime: data.responseTime,
          error: data.error,
          region: data.region,
          checkedAt: new Date(data.checkedAt),
        },
      });

      // Update monitor status
      await this.monitorService.updateStatus(
        data.monitorId,
        data.status,
        new Date(data.checkedAt),
      );

      this.logger.log(`Stored check result and updated monitor ${data.monitorId} status to ${data.status}`);
    } catch (error) {
      this.logger.error(`Failed to process check result for ${data.monitorId}`, error);
    }
  }
}
