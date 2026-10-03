import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UptimeStats {
  monitorId: string;
  uptimePercentage: number;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
}

export interface ResponseTimePoint {
  timestamp: Date;
  responseTime: number;
  status: string;
}

export interface MonitorOverview {
  monitorId: string;
  monitorName: string;
  monitorUrl: string;
  currentStatus: string;
  uptimePercentage: number;
  avgResponseTime: number;
  lastCheckedAt: Date | null;
  checksLast24h: number;
  incidentsLast24h: number;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get uptime statistics for a monitor within a time range.
   */
  async getUptimeStats(
    monitorId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<UptimeStats> {
    const checkResults = await this.prisma.checkResult.findMany({
      where: {
        monitorId,
        checkedAt: { gte: startDate, lte: endDate },
      },
      orderBy: { checkedAt: 'asc' },
    });

    const totalChecks = checkResults.length;
    const successfulChecks = checkResults.filter((r) => r.status === 'UP').length;
    const failedChecks = totalChecks - successfulChecks;
    const uptimePercentage = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0;

    const responseTimes = checkResults
      .map((r) => r.responseTime)
      .filter((t) => t > 0)
      .sort((a, b) => a - b);

    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
        : 0;

    const minResponseTime = responseTimes.length > 0 ? responseTimes[0] : 0;
    const maxResponseTime =
      responseTimes.length > 0 ? responseTimes[responseTimes.length - 1] : 0;

    const p95ResponseTime = this.percentile(responseTimes, 95);
    const p99ResponseTime = this.percentile(responseTimes, 99);

    return {
      monitorId,
      uptimePercentage: Math.round(uptimePercentage * 100) / 100,
      totalChecks,
      successfulChecks,
      failedChecks,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      minResponseTime,
      maxResponseTime,
      p95ResponseTime,
      p99ResponseTime,
    };
  }

  /**
   * Get response time history for charts.
   */
  async getResponseTimeHistory(
    monitorId: string,
    startDate: Date,
    endDate: Date,
    limit: number = 100,
  ): Promise<ResponseTimePoint[]> {
    const results = await this.prisma.checkResult.findMany({
      where: {
        monitorId,
        checkedAt: { gte: startDate, lte: endDate },
      },
      orderBy: { checkedAt: 'desc' },
      take: limit,
      select: {
        checkedAt: true,
        responseTime: true,
        status: true,
      },
    });

    return results
      .reverse()
      .map((r) => ({
        timestamp: r.checkedAt,
        responseTime: r.responseTime,
        status: r.status,
      }));
  }

  /**
   * Get dashboard overview for all monitors of a user.
   */
  async getDashboardOverview(userId: string): Promise<MonitorOverview[]> {
    const monitors = await this.prisma.monitor.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const overviews: MonitorOverview[] = [];

    for (const monitor of monitors) {
      const [stats, incidentCount] = await Promise.all([
        this.getUptimeStats(monitor.id, last24h, now),
        this.prisma.checkResult.count({
          where: {
            monitorId: monitor.id,
            status: 'DOWN',
            checkedAt: { gte: last24h },
          },
        }),
      ]);

      overviews.push({
        monitorId: monitor.id,
        monitorName: monitor.name,
        monitorUrl: monitor.url,
        currentStatus: monitor.status,
        uptimePercentage: stats.uptimePercentage,
        avgResponseTime: stats.avgResponseTime,
        lastCheckedAt: monitor.lastCheckedAt,
        checksLast24h: stats.totalChecks,
        incidentsLast24h: incidentCount,
      });
    }

    return overviews;
  }

  /**
   * Get uptime stats aggregated by time buckets for heatmap/charts.
   */
  async getUptimeTimeline(
    monitorId: string,
    days: number = 30,
  ): Promise<{ date: string; uptimePercentage: number; avgResponseTime: number }[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const results = await this.prisma.checkResult.findMany({
      where: {
        monitorId,
        checkedAt: { gte: startDate, lte: endDate },
      },
      orderBy: { checkedAt: 'asc' },
    });

    // Group by day
    const buckets = new Map<string, { up: number; total: number; responseTimes: number[] }>();

    for (const result of results) {
      const dateKey = result.checkedAt.toISOString().split('T')[0];
      const bucket = buckets.get(dateKey) || { up: 0, total: 0, responseTimes: [] };
      bucket.total++;
      if (result.status === 'UP') bucket.up++;
      if (result.responseTime > 0) bucket.responseTimes.push(result.responseTime);
      buckets.set(dateKey, bucket);
    }

    return Array.from(buckets.entries()).map(([date, bucket]) => ({
      date,
      uptimePercentage:
        bucket.total > 0 ? Math.round((bucket.up / bucket.total) * 10000) / 100 : 0,
      avgResponseTime:
        bucket.responseTimes.length > 0
          ? Math.round(
              (bucket.responseTimes.reduce((s, t) => s + t, 0) / bucket.responseTimes.length) * 100,
            ) / 100
          : 0,
    }));
  }

  /**
   * Get recent check results for a monitor.
   */
  async getRecentChecks(
    monitorId: string,
    limit: number = 50,
  ): Promise<any[]> {
    return this.prisma.checkResult.findMany({
      where: { monitorId },
      orderBy: { checkedAt: 'desc' },
      take: limit,
    });
  }

  private percentile(sortedValues: number[], p: number): number {
    if (sortedValues.length === 0) return 0;
    const index = Math.ceil((p / 100) * sortedValues.length) - 1;
    return sortedValues[Math.min(index, sortedValues.length - 1)];
  }
}
