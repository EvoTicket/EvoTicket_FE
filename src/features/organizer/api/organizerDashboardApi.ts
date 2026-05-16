import api from "@/src/lib/axios";
import { unwrapBaseResponse } from "./helpers";
import type { BaseResponse, OrganizerDashboardMetricsResponse } from "../types/api";

export const organizerDashboardApi = {
  async getDashboard(days = 30): Promise<OrganizerDashboardMetricsResponse> {
    const response = await api.get<BaseResponse<OrganizerDashboardMetricsResponse>>(
      "/inventory-service/api/v1/dashboard/organizer",
      {
        params: { days },
      }
    );

    return unwrapBaseResponse(response.data);
  },
};
