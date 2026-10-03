import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  const mockPrisma = {
    checkResult: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    monitor: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('getUptimeStats', () => {
    it('should calculate uptime percentage correctly', async () => {
      const mockResults = [
        { status: 'UP', responseTime: 100, checkedAt: new Date() },
        { status: 'UP', responseTime: 150, checkedAt: new Date() },
        { status: 'UP', responseTime: 120, checkedAt: new Date() },
        { status: 'DOWN', responseTime: 0, checkedAt: new Date() },
      ];
      mockPrisma.checkResult.findMany.mockResolvedValue(mockResults);

      const stats = await service.getUptimeStats('monitor-1', new Date(), new Date());

      expect(stats.uptimePercentage).toBe(75);
      expect(stats.totalChecks).toBe(4);
      expect(stats.successfulChecks).toBe(3);
      expect(stats.failedChecks).toBe(1);
    });

    it('should handle empty results', async () => {
      mockPrisma.checkResult.findMany.mockResolvedValue([]);

      const stats = await service.getUptimeStats('monitor-1', new Date(), new Date());

      expect(stats.uptimePercentage).toBe(0);
      expect(stats.totalChecks).toBe(0);
      expect(stats.avgResponseTime).toBe(0);
    });

    it('should calculate response time percentiles', async () => {
      const responseTimes = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 2000];
      const mockResults = responseTimes.map((rt) => ({
        status: 'UP',
        responseTime: rt,
        checkedAt: new Date(),
      }));
      mockPrisma.checkResult.findMany.mockResolvedValue(mockResults);

      const stats = await service.getUptimeStats('monitor-1', new Date(), new Date());

      expect(stats.p95ResponseTime).toBeGreaterThan(0);
      expect(stats.p99ResponseTime).toBeGreaterThanOrEqual(stats.p95ResponseTime);
      expect(stats.avgResponseTime).toBeGreaterThan(0);
    });
  });

  describe('getResponseTimeHistory', () => {
    it('should return sorted response time points', async () => {
      const now = new Date();
      const mockResults = [
        { checkedAt: new Date(now.getTime() - 1000), responseTime: 150, status: 'UP' },
        { checkedAt: now, responseTime: 200, status: 'UP' },
      ];
      mockPrisma.checkResult.findMany.mockResolvedValue(mockResults);

      const history = await service.getResponseTimeHistory('monitor-1', new Date(), new Date());

      expect(history).toHaveLength(2);
      expect(history[0].responseTime).toBe(200);
      expect(history[1].responseTime).toBe(150);
    });
  });

  describe('getDashboardOverview', () => {
    it('should return overview for all user monitors', async () => {
      const mockMonitors = [
        { id: 'm1', name: 'Test', url: 'https://test.com', status: 'UP', lastCheckedAt: new Date(), createdAt: new Date() },
      ];
      mockPrisma.monitor.findMany.mockResolvedValue(mockMonitors);
      mockPrisma.checkResult.findMany.mockResolvedValue([]);
      mockPrisma.checkResult.count.mockResolvedValue(0);

      const overview = await service.getDashboardOverview('user-1');

      expect(overview).toHaveLength(1);
      expect(overview[0].monitorName).toBe('Test');
    });
  });
});
