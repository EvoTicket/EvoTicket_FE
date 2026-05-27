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
