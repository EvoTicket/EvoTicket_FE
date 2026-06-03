import api from "@/src/lib/axios";

export interface ServiceHealthDto {
  name: string;
  status: "Healthy" | "Warning" | "Degraded" | "Down" | string;
  latency: string;
  uptime: string;
  lastIncident: string;
  lastCheck: string;
}

export interface QueueHealthDto {
  name: string;
  queued: number;
  failed: number;
  delayed: number;
  status: "Healthy" | "Warning" | "Degraded" | "Down" | string;
  backlog: number;
  retry: number;
  oldest: string;
}

export interface IncidentDto {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low" | string;
  title: string;
  source: string;
  start: string;
  status: "Investigating" | "Identified" | "Monitoring" | "Resolved" | string;
}

export interface PerfDataDto {
  time: string;
  requests: number;
  latency: number;
  errors: number;
}

export interface AdminHealthDashboardResponse {
  platformStatus: string;
  latency: string;
  incidentsCount: number;
  queueBacklog: string;
  serviceAvailability: string;
  services: ServiceHealthDto[];
  queues: QueueHealthDto[];
  incidents: IncidentDto[];
  perfData: PerfDataDto[];
}

export const adminHealthApi = {
  async getHealthDashboard(timeRange: string = "1h"): Promise<AdminHealthDashboardResponse> {
    const response = await api.get<{ data: AdminHealthDashboardResponse }>(
      "/order-service/api/v1/admin/health",
      {
        params: { timeRange },
      }
    );
    return response.data.data;
  },
};
