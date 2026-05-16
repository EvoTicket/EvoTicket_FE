import api from "@/src/lib/axios";
import type { Province, Ward } from "../types/api";

export const locationApi = {
  async getProvinces(): Promise<Province[]> {
    const response = await api.get<Province[]>("/inventory-service/api/locations/provinces");
    return Array.isArray(response.data) ? response.data : [];
  },

  async getWards(params: { provinceCode: number }): Promise<Ward[]> {
    const response = await api.get<Ward[]>("/inventory-service/api/locations/wards", {
      params,
    });

    return Array.isArray(response.data) ? response.data : [];
  },
};
