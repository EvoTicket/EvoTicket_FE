import api from "@/src/lib/axios";
import { unwrapBaseResponse, unwrapPage } from "./helpers";
import type {
  BasePageResponse,
  BaseResponse,
  CreateEventMultipartPayload,
  EventResponse,
  ListEventResponse,
  OrganizerEventListParams,
  UpdateEventRequest,
} from "../types/api";

export const organizerEventApi = {
  async getMyEvents(params: OrganizerEventListParams = {}): Promise<BasePageResponse<ListEventResponse>> {
    const response = await api.get<
      BasePageResponse<ListEventResponse> | BaseResponse<BasePageResponse<ListEventResponse>>
    >("/inventory-service/api/events/my", { params });

    return unwrapPage<ListEventResponse>(response.data);
  },

  async getEventById(eventId: string | number): Promise<EventResponse> {
    const response = await api.get<BaseResponse<EventResponse>>(
      `/inventory-service/api/events/${eventId}`
    );

    return unwrapBaseResponse(response.data);
  },

  async createEvent(payload: CreateEventMultipartPayload): Promise<boolean> {
    const formData = new FormData();
    formData.append(
      "event",
      new Blob([JSON.stringify(payload.event)], { type: "application/json" })
    );

    if (payload.bannerImage) {
      formData.append("bannerImage", payload.bannerImage);
    }

    if (payload.thumbnailImage) {
      formData.append("thumbnailImage", payload.thumbnailImage);
    }

    const response = await api.post<BaseResponse<boolean>>(
      "/inventory-service/api/events",
      formData
    );

    return Boolean(unwrapBaseResponse(response.data));
  },

  async updateEvent(eventId: string | number, payload: UpdateEventRequest): Promise<EventResponse> {
    const response = await api.put<BaseResponse<EventResponse>>(
      `/inventory-service/api/events/${eventId}`,
      payload
    );

    return unwrapBaseResponse(response.data);
  },
};
