import api from "@/src/lib/axios";

export interface StatCardDto {
  label: string;
  value: string;
  sub: string;
  color: string;
}

export interface VolumeDataDto {
  day: string;
  volume: number;
}

export interface PriceTrendDataDto {
  day: string;
  price: number;
}

export interface TopEventDto {
  name: string;
  transactions: number;
  flags: number;
  percentage: number;
}

export interface SpikeDto {
  level: string;
  title: string;
  desc: string;
  percent: number;
  count: number;
  source: string;
  time: number;
}

export interface ComplianceBarDto {
  label: string;
  count: number;
  total: number;
  color: string;
}

export interface HistoryDto {
  time: string;
  text: string;
}

export interface ResaleListingDto {
  id: string;
  event: string;
  seller: string;
  tier: string;
  price: string;
  listingLimit: string;
  cap: string; // "Within cap" | "Over cap"
  status: string; // "Active" | "Locked" | "Over cap" | "Under review" | "Removed"
  flag: string;
  note: string;
  hisListings?: HistoryDto[];
  previousOwner: string;
}

export interface DisputeDto {
  id: string;
  ticket: string;
  event: string;
  parties: string;
  type: string;
  priority: string;
  status: string;
  lastUpdate: string;
  description: string;
  note: string;
}

export interface PageResponseDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AdminResaleDashboardResponse {
  stats: StatCardDto[];
  volumeData: VolumeDataDto[];
  priceTrendData: PriceTrendDataDto[];
  topEvents: TopEventDto[];
  spikes: SpikeDto[];
  listings: PageResponseDto<ResaleListingDto>;
  disputes: DisputeDto[];
  compliance: ComplianceBarDto[];
}

export interface ResaleDashboardParams {
  tab?: string;
  statusFilter?: string;
  search?: string;
  page?: number; // 1-indexed
  size?: number;
}

export const adminResaleApi = {
  async getResaleDashboard(params: ResaleDashboardParams = {}): Promise<AdminResaleDashboardResponse> {
    const response = await api.get<{ data: AdminResaleDashboardResponse }>(
      "/order-service/api/v1/admin/resale",
      { params }
    );
    return response.data.data;
  },
};
