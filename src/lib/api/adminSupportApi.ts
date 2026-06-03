import api from "@/src/lib/axios";

export interface StatItem {
  label: string;
  value: string;
  color: string;
  icon: string;
}

export interface StatsDto {
  transactions: StatItem[];
  tickets: StatItem[];
  cases: StatItem[];
}

export interface TransactionDto {
  id: string;
  buyer: string;
  email: string;
  event: string;
  amount: string;
  payment: string; // "Success" | "Pending" | "Failed" | "Expired" | "Cancelled"
  mint: string; // "Minted" | "Mint Pending" | "Mint Failed" | "Not started"
  updatedAt: string;
}

export interface TicketDto {
  id: string;
  owner: string;
  ownerType: string;
  event: string;
  tier: string;
  access: string; // "Active" | "Used" | "Resold" | "Locked" | "Refunded" | "Withdrawn"
  checkin: string; // "Checked-in" | "Denied" | "Not yet"
  activity: string;
}

export interface CaseDto {
  id: string;
  subject: string;
  user: string;
  email: string;
  event: string;
  priority: string; // "High" | "Medium" | "Low"
  status: string; // "Escalated" | "In Progress" | "Open" | "Resolved" | "Waiting"
  assignee: string;
  updatedAt: string;
}

export interface PageResponseDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AdminSupportDashboardResponse {
  stats: StatsDto;
  transactions?: PageResponseDto<TransactionDto> | null;
  tickets?: PageResponseDto<TicketDto> | null;
  cases?: PageResponseDto<CaseDto> | null;
}

export interface SupportDashboardParams {
  tab?: string;
  search?: string;
  page?: number; // 1-indexed
  size?: number;
}

export const adminSupportApi = {
  async getSupportDashboard(params: SupportDashboardParams = {}): Promise<AdminSupportDashboardResponse> {
    const response = await api.get<{ data: AdminSupportDashboardResponse }>(
      "/order-service/api/v1/admin/support",
      { params }
    );
    return response.data.data;
  },
};
