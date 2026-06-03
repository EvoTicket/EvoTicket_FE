import api from "@/src/lib/axios";
import type { BasePageResponse } from "@/src/features/organizer/types/api";

export interface StatCardDto {
  label: string;
  value: string;
  sub: string;
  color: string;
}

export interface AuditLogDto {
  id: number;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  severity: "Critical" | "High" | "Medium" | "Low" | string;
  result: "Success" | "Partial" | "Failed" | string;
  module: string;
  description: string;
  targetType: string;
  correlationId: string;
  auditId: string;
  note: string;
  sensitive: boolean;
}

export interface AdminAuditDashboardResponse {
  stats: StatCardDto[];
  logs: BasePageResponse<AuditLogDto>;
}

export interface GetAuditDashboardParams {
  tab?: string;
  search?: string;
  page?: number;
  size?: number;
}

export const adminAuditApi = {
  async getAuditDashboard(
    params: GetAuditDashboardParams = {}
  ): Promise<AdminAuditDashboardResponse> {
    const response = await api.get<{ data: AdminAuditDashboardResponse }>(
      "/inventory-service/api/admin/audit",
      {
        params,
      }
    );
    return response.data.data;
  },
};
