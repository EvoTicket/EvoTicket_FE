import api from "@/src/lib/axios";
import { unwrapBaseResponse } from "./helpers";
import type { BaseResponse, EventCategory } from "../types/api";

export const categoryApi = {
  async getCategories(): Promise<EventCategory[]> {
    const response = await api.get<BaseResponse<EventCategory[]>>(
      "/inventory-service/api/categories"
    );

    return unwrapBaseResponse(response.data) ?? [];
  },
};
