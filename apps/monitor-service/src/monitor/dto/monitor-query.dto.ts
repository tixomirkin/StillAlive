import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MonitorQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['UP', 'DOWN', 'PENDING', 'PAUSED'] })
  @IsOptional()
  @IsEnum(['UP', 'DOWN', 'PENDING', 'PAUSED'])
  status?: string;

  @ApiPropertyOptional({ enum: ['HTTP', 'TCP', 'PING', 'KEYWORD'] })
  @IsOptional()
  @IsEnum(['HTTP', 'TCP', 'PING', 'KEYWORD'])
  type?: string;
}
