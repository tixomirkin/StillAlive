import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MonitorService } from './monitor.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';
import { MonitorQueryDto } from './dto/monitor-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Monitors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('monitors')
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  @Get()
  findAll(
    @CurrentUser('userId') userId: string,
    @Query() query: MonitorQueryDto,
  ) {
    return this.monitorService.findAllByUser(userId, query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.monitorService.findOne(id, userId);
  }

  @Post()
  create(
    @CurrentUser('userId') userId: string,
    @Body() createMonitorDto: CreateMonitorDto,
  ) {
    return this.monitorService.create(userId, createMonitorDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @Body() updateMonitorDto: UpdateMonitorDto,
  ) {
    return this.monitorService.update(id, userId, updateMonitorDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.monitorService.remove(id, userId);
  }

  @Post(':id/pause')
  pause(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.monitorService.pause(id, userId);
  }

  @Post(':id/resume')
  resume(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.monitorService.resume(id, userId);
  }
}
