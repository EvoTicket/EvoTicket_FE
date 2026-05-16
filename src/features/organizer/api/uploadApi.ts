import api from "@/src/lib/axios";
import type { FileUploadResponse } from "../types/api";

export const uploadApi = {
  async uploadImage(formData: FormData): Promise<FileUploadResponse> {
    const response = await api.post<FileUploadResponse>(
      "/iam-service/api/upload/image",
      formData
    );

    return response.data;
  },
};
