import api from "@/src/lib/axios";
import type { BasePageResponse } from "@/src/features/organizer/types/api";

export interface ListEventResponse {
  id: number;
  eventName: string;
  description: string;
  venue: string;
  fullAddress: string;
  startDatetime: string;
  endDatetime: string;
  eventStatus: string;
  approvalStatus: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "CANCELLED";
  eventType: string;
  bannerImage: string;
  thumbnailImage: string;
  totalSeats: number;
  organizerId: number;
  organizerName: string;
  isFeatured: boolean;
  category: string;
  floorPrice: number;
  provinceName: string;
  ticketAvailabilityStatus: string;
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
}

export interface ModerationSummaryResponse {
  pendingCount: number;
  rejectedCount: number;
}

export interface SearchModerationEventsParams {
  keyword?: string;
  approvalStatuses?: string[];
  categories?: string[];
  page?: number;
  size?: number;
  sort?: string;
}

export const adminEventsApi = {
  async getModerationSummary(): Promise<ModerationSummaryResponse> {
    const response = await api.get<{ data: ModerationSummaryResponse }>(
      "/inventory-service/api/admin/events/moderation/summary"
    );
    return response.data.data;
  },

  async searchEventsForModeration(
    params: SearchModerationEventsParams = {}
  ): Promise<BasePageResponse<ListEventResponse>> {
    const response = await api.get<{ data: BasePageResponse<ListEventResponse> }>(
      "/inventory-service/api/admin/events/moderation",
      {
        params,
        // Serializer to pass arrays as repeat parameters: ?approvalStatuses=PENDING_REVIEW&approvalStatuses=REJECTED
        paramsSerializer: {
          indexes: null,
        },
      }
    );
    return response.data.data;
  },

  async updateApprovalStatus(
    eventId: number,
    approvalStatus: "PUBLISHED" | "REJECTED"
  ): Promise<any> {
    const response = await api.patch(
      `/inventory-service/api/admin/events/${eventId}/approval`,
      { approvalStatus }
    );
    return response.data;
  },

  async getEventDetail(eventId: number): Promise<any> {
    const response = await api.get<{ data: any }>(
      `/inventory-service/api/admin/events/${eventId}`
    );
    return response.data.data;
  },
};
