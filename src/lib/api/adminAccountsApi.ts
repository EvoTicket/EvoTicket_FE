import api from "@/src/lib/axios";
import type { BasePageResponse } from "@/src/features/organizer/types/api";

export interface AccountSummaryResponse {
  totalAccounts: number;
  activeOrganizers: number;
  pendingApprovals: number;
  restrictedAccounts: number;
}

export interface AccountDetailsResponse {
  id: number;
  email: string;
  fullName: string;
  role: "BUYER" | "ORGANIZER" | "ADMIN" | string;
  phoneNumber: string;
  verificationStatus: "VERIFIED" | "PENDING" | "REJECTED" | "MISSING_DOCS" | string;
  status: "ACTIVE" | "PENDING_APPROVAL" | "RESTRICTED" | "SUSPENDED" | string;
  createdAt: string;
  lastActive: string;
}

export interface SearchAccountsParams {
  role?: string;
  status?: string;
  verification?: string;
  keyword?: string;
  days?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
}

export const adminAccountsApi = {
  async getAccountSummary(): Promise<AccountSummaryResponse> {
    const response = await api.get<{ data: AccountSummaryResponse }>(
      "/iam-service/api/v1/admin/accounts/summary"
    );
    return response.data.data;
  },

  async searchAccounts(params: SearchAccountsParams = {}): Promise<BasePageResponse<AccountDetailsResponse>> {
    const response = await api.get<BasePageResponse<AccountDetailsResponse>>(
      "/iam-service/api/v1/admin/accounts",
      { params }
    );
    return response.data;
  }
};
