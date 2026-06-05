import api from "@/src/lib/axios";

export interface DailyTrendDto {
  date: string;
  gmv: number;
  ticketsSold: number;
}

export interface PlatformDashboardResponse {
  totalGmv: number;
  totalRevenue: number;
  totalTicketsSold: number;
  newUsersCount: number;
  trend: DailyTrendDto[];
  payoutPendingVolume: number;
  payoutPendingOrgs: number;
  payoutPendingBatch: string;
  payoutSettledVolume: number;
  payoutSettledBatches: number;
  disputesCount: number;
  disputesMessage: string;
  organizationsPendingApproval: number;
  organizationsPendingDetails: string;
  eventsPendingApproval: number;
  eventsPendingDetails: string;
  restrictedAccounts: number;
  restrictedAccountsDetails: string;
  highRiskEventsCount: number;
}

export const adminDashboardApi = {
  async getPlatformDashboard(days: number = 7): Promise<PlatformDashboardResponse> {
    const response = await api.get<{ data: PlatformDashboardResponse }>(
      "/inventory-service/api/v1/dashboard/platform",
      {
        params: { days },
      }
    );
    return response.data.data;
  },
};
