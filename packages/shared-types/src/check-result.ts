import { MonitorStatus } from './monitor';

export interface CheckResult {
  id: string;
  monitorId: string;
  status: MonitorStatus;
  statusCode?: number;
  responseTime: number; // milliseconds
  error?: string;
  checkedAt: Date;
  region?: string;
}

export interface CheckScheduledEvent {
  monitorId: string;
  type: string;
  url: string;
  httpMethod?: string;
  expectedStatusCode?: number;
  keyword?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout: number;
}

export interface CheckCompletedEvent {
  monitorId: string;
  status: MonitorStatus;
  statusCode?: number;
  responseTime: number;
  error?: string;
  checkedAt: Date;
  region?: string;
}
