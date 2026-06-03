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

export interface AccountDetailResponse {
  id: number;
  name: string;
  type: "Organizer" | "Buyer" | string;
  status: "Active" | "Pending Approval" | "Restricted" | "Suspended" | string;
  registeredDate: string;
  stats: {
    verificationStatus: string;
    documentsSubmitted: number;
    totalDocuments: number;
    eventsCreated: number;
    pendingEvents: number;
    lastActive: string;
    riskLevel: string;
    riskReason: string;
  };
  profile: {
    representative: string;
    orgType: string;
    email: string;
    phone: string;
    taxId: string;
    address?: string;
  };
  documents: Array<{
    name: string;
    status: "Verified" | "Pending" | "Missing" | "Rejected" | string;
    url?: string;
  }>;
  payoutAccount: {
    bank: string;
    accountNumber: string;
    accountName: string;
    status: string;
  } | null;
  operationalContext: {
    summary: {
      recentEventsCount: number;
      flaggedEventsCount: number;
      pendingPayoutCount: number;
      openSupportNotesCount: number;
    };
    recentEvents: Array<{
      id: string;
      name: string;
      date: string;
      status: string;
      isFlagged: boolean;
    }>;
    adminLogs: Array<{
      user: string;
      timestamp: string;
      content: string;
      role: "support" | "moderation" | string;
    }>;
    activities: Array<{
      timestamp: string;
      title: string;
      description: string;
      icon: "file" | "shield" | "calendar" | "paper";
    }>;
    history: Array<{
      timestamp: string;
      actor: string;
      action: string;
      note: string;
      actionType: "warning" | "info" | "system" | string;
    }>;
  };
  adminContext: {
    internalNote: string;
    lastAction?: {
      adminUser: string;
      timestamp: string;
      description: string;
    };
  };
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
  },

  async getAccountDetail(id: number | string): Promise<AccountDetailResponse> {
    const response = await api.get<{ data: AccountDetailResponse }>(
      `/iam-service/api/v1/admin/accounts/${id}`
    );
    return response.data.data;
  }
};
