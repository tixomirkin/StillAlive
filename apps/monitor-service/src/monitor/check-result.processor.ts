import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Job } from 'bull';

@Processor('monitor-checks')
export class CheckResultProcessor {
  private readonly logger = new Logger(CheckResultProcessor.name);

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Process('perform-check')
  async handleCheck(job: Job) {
    const checkEvent = job.data;
    this.logger.log(`Publishing check.scheduled for monitor: ${checkEvent.monitorId}`);

    // Publish to NATS for the Go checker worker to pick up
    this.natsClient.emit('check.scheduled', checkEvent);
    this.logger.debug(`Published check.scheduled event for ${checkEvent.monitorId}`);
  }
}
