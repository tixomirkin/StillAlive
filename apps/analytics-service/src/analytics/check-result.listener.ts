import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';

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

  constructor(private readonly prisma: PrismaService) {}

  @EventPattern('check.completed')
  async handleCheckCompleted(@Payload() data: CheckCompletedEvent) {
    this.logger.log(
      `[Analytics] Received check result — monitor: ${data.monitorId}, status: ${data.status}, responseTime: ${data.responseTime}ms`,
    );

    try {
      await this.prisma.checkResult.create({
        data: {
          monitorId: data.monitorId,
          status: data.status as any,
          statusCode: data.statusCode ?? null,
          responseTime: data.responseTime,
          error: data.error ?? null,
          region: data.region ?? null,
          checkedAt: new Date(data.checkedAt),
        },
      });

      this.logger.debug(`Stored check result for monitor ${data.monitorId}`);
    } catch (error) {
      this.logger.error(`Failed to store check result for ${data.monitorId}`, error);
    }
  }
}
