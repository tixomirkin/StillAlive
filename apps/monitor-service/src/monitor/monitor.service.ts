import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';
import { MonitorQueryDto } from './dto/monitor-query.dto';

@Injectable()
export class MonitorService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  async create(userId: string, dto: CreateMonitorDto) {
    const monitor = await this.prisma.monitor.create({
      data: {
        ...dto,
        userId,
      },
    });

    this.natsClient.emit('monitor.created', monitor);
    return monitor;
  }

  async findAllByUser(userId: string, query: MonitorQueryDto) {
    const { page = 1, limit = 20, status, type } = query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(status ? { status: status as any } : {}),
      ...(type ? { type: type as any } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.monitor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.monitor.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, userId: string) {
    const monitor = await this.prisma.monitor.findFirst({
      where: { id, userId },
    });

    if (!monitor) {
      throw new NotFoundException('Monitor not found');
    }

    return monitor;
  }

  async update(id: string, userId: string, dto: UpdateMonitorDto) {
    await this.findOne(id, userId);

    const monitor = await this.prisma.monitor.update({
      where: { id },
      data: dto,
    });

    this.natsClient.emit('monitor.updated', monitor);
    return monitor;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    const monitor = await this.prisma.monitor.delete({
      where: { id },
    });

    this.natsClient.emit('monitor.deleted', monitor);
    return monitor;
  }

  async updateStatus(monitorId: string, status: string, lastCheckedAt: Date) {
    return this.prisma.monitor.update({
      where: { id: monitorId },
      data: {
        status: status as any,
        lastCheckedAt,
      },
    });
  }

  async findActiveMonitors() {
    return this.prisma.monitor.findMany({
      where: {
        status: {
          not: 'PAUSED',
        },
      },
    });
  }

  async pause(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.monitor.update({
      where: { id },
      data: { status: 'PAUSED' },
    });
  }

  async resume(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.monitor.update({
      where: { id },
      data: { status: 'PENDING' },
    });
  }
}
