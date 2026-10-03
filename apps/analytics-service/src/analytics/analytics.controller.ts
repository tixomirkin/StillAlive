import {
  Controller, Get, Param, Query, ParseUUIDPipe,
  DefaultValuePipe, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService, UptimeStats, ResponseTimePoint, MonitorOverview } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview/:userId')
  @ApiOperation({ summary: 'Get dashboard overview for a user' })
  @ApiParam({ name: 'userId', type: 'string' })
  async getDashboardOverview(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<MonitorOverview[]> {
    return this.analyticsService.getDashboardOverview(userId);
  }

  @Get('monitors/:monitorId/uptime')
  @ApiOperation({ summary: 'Get uptime statistics for a monitor' })
  @ApiParam({ name: 'monitorId', type: 'string' })
  @ApiQuery({ name: 'hours', required: false, description: 'Hours to look back (default: 24)' })
  async getUptimeStats(
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
  ): Promise<UptimeStats> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);
    return this.analyticsService.getUptimeStats(monitorId, startDate, endDate);
  }

  @Get('monitors/:monitorId/response-times')
  @ApiOperation({ summary: 'Get response time history for charts' })
  @ApiParam({ name: 'monitorId', type: 'string' })
  @ApiQuery({ name: 'hours', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getResponseTimeHistory(
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ): Promise<ResponseTimePoint[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);
    return this.analyticsService.getResponseTimeHistory(monitorId, startDate, endDate, limit);
  }

  @Get('monitors/:monitorId/timeline')
  @ApiOperation({ summary: 'Get daily uptime timeline for heatmap' })
  @ApiParam({ name: 'monitorId', type: 'string' })
  @ApiQuery({ name: 'days', required: false, description: 'Days to look back (default: 30)' })
  async getUptimeTimeline(
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.analyticsService.getUptimeTimeline(monitorId, days);
  }

  @Get('monitors/:monitorId/checks')
  @ApiOperation({ summary: 'Get recent check results' })
  @ApiParam({ name: 'monitorId', type: 'string' })
  @ApiQuery({ name: 'limit', required: false })
  async getRecentChecks(
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.analyticsService.getRecentChecks(monitorId, limit);
  }
}
