import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MonitorService } from './monitor.service';

@Injectable()
export class MonitorScheduler {
  private readonly logger = new Logger(MonitorScheduler.name);

  constructor(
    private readonly monitorService: MonitorService,
    @InjectQueue('monitor-checks') private readonly checksQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async scheduleChecks() {
    this.logger.log('Scheduling monitor checks...');
    const monitors = await this.monitorService.findActiveMonitors();
    const now = Date.now();

    for (const monitor of monitors) {
      const lastCheck = monitor.lastCheckedAt?.getTime() || 0;
      const intervalMs = monitor.interval * 1000;

      if (now - lastCheck >= intervalMs) {
        await this.checksQueue.add('perform-check', {
          monitorId: monitor.id,
          type: monitor.type,
          url: monitor.url,
          httpMethod: monitor.httpMethod || 'GET',
          expectedStatusCode: monitor.expectedStatusCode || 200,
          keyword: monitor.keyword,
          headers: monitor.headers as Record<string, string> | undefined,
          body: monitor.body,
          timeout: monitor.timeout,
        }, {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 1,
        });

        this.logger.debug(`Queued check for monitor: ${monitor.name} (${monitor.id})`);
      }
    }

    this.logger.log(`Scheduled ${monitors.length} monitor checks`);
  }
}
