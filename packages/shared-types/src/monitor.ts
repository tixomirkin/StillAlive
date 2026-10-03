export enum MonitorType {
  HTTP = 'HTTP',
  TCP = 'TCP',
  PING = 'PING',
  KEYWORD = 'KEYWORD',
}

export enum MonitorStatus {
  UP = 'UP',
  DOWN = 'DOWN',
  PENDING = 'PENDING',
  PAUSED = 'PAUSED',
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

export interface Monitor {
  id: string;
  userId: string;
  name: string;
  type: MonitorType;
  url: string;
  interval: number; // seconds
  timeout: number; // seconds
  httpMethod?: HttpMethod;
  expectedStatusCode?: number;
  keyword?: string;
  headers?: Record<string, string>;
  body?: string;
  status: MonitorStatus;
  lastCheckedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMonitorDto {
  name: string;
  type: MonitorType;
  url: string;
  interval?: number;
  timeout?: number;
  httpMethod?: HttpMethod;
  expectedStatusCode?: number;
  keyword?: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface UpdateMonitorDto extends Partial<CreateMonitorDto> {}
