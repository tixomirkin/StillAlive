import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional,
  IsString, IsUrl, Max, Min,
} from 'class-validator';

export enum MonitorType {
  HTTP = 'HTTP',
  TCP = 'TCP',
  PING = 'PING',
  KEYWORD = 'KEYWORD',
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
}

export class CreateMonitorDto {
  @ApiProperty({ example: 'My Website' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: MonitorType, example: MonitorType.HTTP })
  @IsEnum(MonitorType)
  type: MonitorType;

  @ApiProperty({ example: 'https://example.com' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ example: 300, description: 'Check interval in seconds (60-3600)', default: 300 })
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(3600)
  interval?: number;

  @ApiPropertyOptional({ example: 30, description: 'Timeout in seconds (5-120)', default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(120)
  timeout?: number;

  @ApiPropertyOptional({ enum: HttpMethod, example: HttpMethod.GET })
  @IsOptional()
  @IsEnum(HttpMethod)
  httpMethod?: HttpMethod;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  expectedStatusCode?: number;

  @ApiPropertyOptional({ example: 'alive' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ example: { 'Content-Type': 'application/json' } })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  body?: string;
}
