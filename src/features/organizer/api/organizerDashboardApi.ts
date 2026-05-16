import api from "@/src/lib/axios";
import { unwrapBaseResponse } from "./helpers";
import type { BaseResponse, OrganizerDashboardResponse } from "../types/api";

export const organizerDashboardApi = {
  async getDashboard(): Promise<OrganizerDashboardResponse> {
    const response = await api.get<BaseResponse<OrganizerDashboardResponse>>(
      "/inventory-service/api/v1/dashboard/organizer"
    );

    return unwrapBaseResponse(response.data);
  },
};
