import api from "@/src/lib/axios";
import { unwrapBaseResponse } from "./helpers";
import type { BaseResponse, OrganizationProfileResponse, OrganizerAccountProfileResponse } from "../types/api";

export const organizationApi = {
  async getMe(): Promise<OrganizationProfileResponse> {
    const response = await api.get<BaseResponse<OrganizationProfileResponse>>(
      "/iam-service/api/organizations/me"
    );

    return unwrapBaseResponse(response.data);
  },

  async getAccountProfile(): Promise<OrganizerAccountProfileResponse> {
    const response = await api.get<BaseResponse<OrganizerAccountProfileResponse>>(
      "/iam-service/api/organizations/me/account"
    );

    return unwrapBaseResponse(response.data);
  },
};
