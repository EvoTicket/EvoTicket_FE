import api from "@/src/lib/axios";
import type { ProvinceResponse, WardResponse } from "../types/api";

export const locationApi = {
  async getProvinces(): Promise<ProvinceResponse[]> {
    const response = await api.get<ProvinceResponse[]>("/inventory-service/api/locations/provinces");
    return Array.isArray(response.data) ? response.data : [];
  },

  async getWards(provinceCode: number): Promise<WardResponse[]> {
    const response = await api.get<WardResponse[]>("/inventory-service/api/locations/wards", {
      params: { provinceCode },
    });

    return Array.isArray(response.data) ? response.data : [];
  },
};
