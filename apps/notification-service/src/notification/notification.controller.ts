import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NotificationHistoryService } from './notification-history.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly historyService: NotificationHistoryService) {}

  @Get('history')
  @ApiOperation({ summary: 'Get notification history' })
  @ApiQuery({ name: 'monitorId', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getHistory(
    @Query('monitorId') monitorId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.historyService.getHistory(monitorId, limit ? parseInt(limit) : 50);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get notification delivery stats' })
  getStats() {
    return this.historyService.getStats();
  }
}
