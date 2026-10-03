import { Test, TestingModule } from '@nestjs/testing';
import { MonitorService } from './monitor.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('MonitorService', () => {
  let service: MonitorService;
  let prisma: PrismaService;
  let natsClient: any;

  beforeEach(async () => {
    natsClient = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitorService,
        {
          provide: PrismaService,
          useValue: {
            monitor: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: 'NATS_SERVICE',
          useValue: natsClient,
        },
      ],
    }).compile();

    service = module.get<MonitorService>(MonitorService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a monitor and emit event', async () => {
      const dto = { name: 'Test', type: 'HTTP' as any, url: 'http://test.com' };
      const monitor = { id: '1', ...dto, userId: 'user1' };
      
      jest.spyOn(prisma.monitor, 'create').mockResolvedValue(monitor as any);
      
      const result = await service.create('user1', dto);
      
      expect(prisma.monitor.create).toHaveBeenCalledWith({ data: { ...dto, userId: 'user1' } });
      expect(natsClient.emit).toHaveBeenCalledWith('monitor.created', monitor);
      expect(result).toEqual(monitor);
    });
  });

  describe('findAllByUser', () => {
    it('should return paginated results', async () => {
      const monitors = [{ id: '1' }];
      jest.spyOn(prisma.monitor, 'findMany').mockResolvedValue(monitors as any);
      jest.spyOn(prisma.monitor, 'count').mockResolvedValue(1);
      
      const result = await service.findAllByUser('user1', { page: 1, limit: 10 });
      
      expect(result).toEqual({ data: monitors, total: 1, page: 1, limit: 10 });
    });
  });

  describe('findOne', () => {
    it('should return monitor', async () => {
      const monitor = { id: '1', userId: 'user1' };
      jest.spyOn(prisma.monitor, 'findFirst').mockResolvedValue(monitor as any);
      
      const result = await service.findOne('1', 'user1');
      expect(result).toEqual(monitor);
    });

    it('should throw NotFoundException', async () => {
      jest.spyOn(prisma.monitor, 'findFirst').mockResolvedValue(null);
      
      await expect(service.findOne('1', 'user1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update monitor and emit event', async () => {
      const monitor = { id: '1', userId: 'user1' };
      jest.spyOn(service, 'findOne').mockResolvedValue(monitor as any);
      jest.spyOn(prisma.monitor, 'update').mockResolvedValue(monitor as any);
      
      const result = await service.update('1', 'user1', { name: 'Updated' });
      
      expect(prisma.monitor.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated' },
      });
      expect(natsClient.emit).toHaveBeenCalledWith('monitor.updated', monitor);
      expect(result).toEqual(monitor);
    });
  });

  describe('remove', () => {
    it('should remove monitor and emit event', async () => {
      const monitor = { id: '1', userId: 'user1' };
      jest.spyOn(service, 'findOne').mockResolvedValue(monitor as any);
      jest.spyOn(prisma.monitor, 'delete').mockResolvedValue(monitor as any);
      
      const result = await service.remove('1', 'user1');
      
      expect(prisma.monitor.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(natsClient.emit).toHaveBeenCalledWith('monitor.deleted', monitor);
      expect(result).toEqual(monitor);
    });
  });

  describe('updateStatus', () => {
    it('should update status', async () => {
      const date = new Date();
      jest.spyOn(prisma.monitor, 'update').mockResolvedValue({} as any);
      
      await service.updateStatus('1', 'UP', date);
      
      expect(prisma.monitor.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'UP', lastCheckedAt: date },
      });
    });
  });

  describe('pause and resume', () => {
    it('should pause monitor', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({} as any);
      jest.spyOn(prisma.monitor, 'update').mockResolvedValue({} as any);
      
      await service.pause('1', 'user1');
      expect(prisma.monitor.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'PAUSED' },
      });
    });

    it('should resume monitor', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({} as any);
      jest.spyOn(prisma.monitor, 'update').mockResolvedValue({} as any);
      
      await service.resume('1', 'user1');
      expect(prisma.monitor.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'PENDING' },
      });
    });
  });
});
