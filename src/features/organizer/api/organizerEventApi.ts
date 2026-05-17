import api from "@/src/lib/axios";
import type {
  BaseResponse,
  BasePageResponse,
  CreateEventMultipartPayload,
  ListEventResponse,
  OrganizerDashboardResponse,
  OrganizerEventListParams,
} from "@/src/features/organizer/types/api";

type RawDashboardPayload = {
  data?: RawDashboardData;
} & RawDashboardData;

type RawDashboardData = Partial<
  Omit<OrganizerDashboardResponse, "events"> & {
    events?: {
      content?: unknown;
      pageNumber?: number | string | null;
      pageSize?: number | string | null;
      totalElements?: number | string | null;
      totalPages?: number | string | null;
      last?: boolean | null;
    } | null;
  }
>;

function normalizeOrganizerDashboard(payload: unknown): OrganizerDashboardResponse {
  const raw = payload as RawDashboardPayload;
  const data = raw?.data ?? raw;

  const events = data?.events ?? {};
  const content = Array.isArray(events?.content) ? events.content : [];

  const pageNumber = Number(events?.pageNumber ?? 0);
  const pageSize = Number(events?.pageSize ?? content.length);
  const totalElements = Number(events?.totalElements ?? content.length);
  const totalPages = Number(
    events?.totalPages ?? (pageSize > 0 ? Math.ceil(totalElements / pageSize) : 0)
  );

  return {
    totalEvents: Number(data?.totalEvents ?? totalElements),
    totalOnSales: Number(data?.totalOnSales ?? 0),
    totalPending: Number(data?.totalPending ?? 0),
    totalCompleted: Number(data?.totalCompleted ?? 0),
    events: {
      content,
      pageNumber,
      pageSize,
      totalElements,
      totalPages,
      last: Boolean(events?.last ?? pageNumber + 1 >= totalPages),
    },
  };
}

function normalizeParams(params?: OrganizerEventListParams) {
  if (!params) return undefined;

  return {
    ...params,
    page: Math.max(params.page ?? 1, 1),
    size: Math.min(Math.max(params.size ?? 20, 1), 100),
    sort: params.sort ?? "NEWEST",
  };
}

export const organizerEventApi = {
  async getOrganizerDashboard(
    params?: OrganizerEventListParams
  ): Promise<OrganizerDashboardResponse> {
    const response = await api.get(
      "/inventory-service/api/events/organizer/dashboard",
      {
        params: normalizeParams(params),
        paramsSerializer: {
          indexes: null,
        },
      }
    );

    return normalizeOrganizerDashboard(response.data);
  },

  async getMyEvents(
    params?: OrganizerEventListParams
  ): Promise<BasePageResponse<ListEventResponse>> {
    const dashboard = await this.getOrganizerDashboard(params);
    return dashboard.events;
  },

  async createEvent(payload: CreateEventMultipartPayload): Promise<boolean> {
    const formData = new FormData();

    formData.append(
      "event",
      new Blob([JSON.stringify(payload.event)], {
        type: "application/json",
      })
    );

    if (payload.bannerImage) {
      formData.append("bannerImage", payload.bannerImage);
    }

    if (payload.thumbnailImage) {
      formData.append("thumbnailImage", payload.thumbnailImage);
    }

    const response = await api.post<BaseResponse<boolean>>(
      "/inventory-service/api/events",
      formData,
      {
        // Do NOT set Content-Type manually — axios auto-generates the
        // multipart/form-data header with the boundary when the body
        // is a FormData instance.  Setting it explicitly omits the
        // boundary string, which causes Spring to reject the request.
        headers: { "Content-Type": undefined },
      }
    );

    return response.data?.data === true;
  },
};
