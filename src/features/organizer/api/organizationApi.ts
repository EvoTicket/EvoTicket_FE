import api from "@/src/lib/axios";
import { unwrapBaseResponse } from "./helpers";
import type { BaseResponse, OrganizationProfileResponse } from "../types/api";

export const organizationApi = {
  async getMe(): Promise<OrganizationProfileResponse> {
    const response = await api.get<BaseResponse<OrganizationProfileResponse>>(
      "/iam-service/api/organizations/me"
    );

    return unwrapBaseResponse(response.data);
  },
};
