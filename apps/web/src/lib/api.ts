const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private accessToken: string | null = null;

  setToken(token: string) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  getToken(): string | null {
    if (this.accessToken) return this.accessToken;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  clearToken() {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ accessToken: string; refreshToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, name: string, password: string) {
    return this.request<{ accessToken: string; refreshToken: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    });
  }

  // Monitors
  async getMonitors(params?: { page?: number; limit?: number; status?: string; type?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.status) query.set('status', String(params.status));
    if (params?.type) query.set('type', String(params.type));
    return this.request<{ data: any[]; total: number }>(`/monitors?${query}`);
  }

  async getMonitor(id: string) {
    return this.request<any>(`/monitors/${id}`);
  }

  async createMonitor(data: any) {
    return this.request<any>('/monitors', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateMonitor(id: string, data: any) {
    return this.request<any>(`/monitors/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteMonitor(id: string) {
    return this.request<void>(`/monitors/${id}`, { method: 'DELETE' });
  }

  async pauseMonitor(id: string) {
    return this.request<any>(`/monitors/${id}/pause`, { method: 'POST' });
  }

  async resumeMonitor(id: string) {
    return this.request<any>(`/monitors/${id}/resume`, { method: 'POST' });
  }

  // Analytics
  async getMonitorUptime(monitorId: string, hours: number = 24) {
    return this.request<any>(`/analytics/monitors/${monitorId}/uptime?hours=${hours}`);
  }

  async getResponseTimeHistory(monitorId: string, hours: number = 24) {
    return this.request<any[]>(`/analytics/monitors/${monitorId}/response-times?hours=${hours}`);
  }

  async getUptimeTimeline(monitorId: string, days: number = 30) {
    return this.request<any[]>(`/analytics/monitors/${monitorId}/timeline?days=${days}`);
  }

  async getRecentChecks(monitorId: string, limit: number = 20) {
    return this.request<any[]>(`/analytics/monitors/${monitorId}/checks?limit=${limit}`);
  }
}

export const api = new ApiClient();
