import api from "@/src/lib/axios";

// =========================================================
// Types
// =========================================================

export interface KbItemDto {
  id: number;
  source: string;
  title: string;
  category: string;
  filename: string;
  chunkCount: number;
  status: "Published" | "Draft" | string;
  updatedBy: string;
  updatedAt: string;
  createdAt: string;
}

export interface KbIngestResult {
  item: KbItemDto;
  chunkCount: number;
}

// =========================================================
// API client
// =========================================================

export const adminKbApi = {
  /** List all KB items ordered by last updated */
  async listItems(): Promise<KbItemDto[]> {
    const res = await api.get<{ data: KbItemDto[] }>(
      "/inventory-service/api/chatbot/kb/items"
    );
    return res.data.data;
  },

  /** Get a single KB item by source slug */
  async getItem(source: string): Promise<KbItemDto> {
    const res = await api.get<{ data: KbItemDto }>(
      `/inventory-service/api/chatbot/kb/items/${encodeURIComponent(source)}`
    );
    return res.data.data;
  },

  /**
   * Check if a source slug already exists in the KB.
   * Used by the upload modal to show a replace-warning.
   */
  async checkExists(source: string): Promise<boolean> {
    const res = await api.get<{ data: boolean }>(
      `/inventory-service/api/chatbot/kb/exists/${encodeURIComponent(source)}`
    );
    return res.data.data;
  },

  /**
   * Upload & ingest a file into the KB.
   * If source already exists, old chunks are deleted first (conflict-safe replace).
   */
  async ingestFile(
    file: File,
    source: string,
    title: string,
    category: string,
    status: "Published" | "Draft"
  ): Promise<KbItemDto> {
    const form = new FormData();
    form.append("file", file);
    form.append("source", source);
    form.append("title", title);
    form.append("category", category);
    form.append("status", status);

    const res = await api.post<{ data: KbItemDto }>(
      "/inventory-service/api/chatbot/kb/ingest",
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data;
  },

  /** Delete a KB item and all its vector chunks */
  async deleteItem(source: string): Promise<void> {
    await api.delete(
      `/inventory-service/api/chatbot/kb/items/${encodeURIComponent(source)}`
    );
  },

  /** Toggle Published / Draft status */
  async updateStatus(
    source: string,
    status: "Published" | "Draft"
  ): Promise<KbItemDto> {
    const res = await api.patch<{ data: KbItemDto }>(
      `/inventory-service/api/chatbot/kb/items/${encodeURIComponent(source)}/status`,
      { status }
    );
    return res.data.data;
  },
};
