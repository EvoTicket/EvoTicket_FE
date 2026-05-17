import type { BasePageResponse, BaseResponse } from "../types/api";

type PageEnvelope<T> =
  | BasePageResponse<T>
  | BaseResponse<BasePageResponse<T>>
  | {
      data?: BasePageResponse<T> | null;
      content?: T[];
      items?: T[];
      pageNumber?: number;
      pageSize?: number;
      totalElements?: number;
      totalPages?: number;
      last?: boolean;
    }
  | null
  | undefined;

export function unwrapBaseResponse<T>(payload: BaseResponse<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as BaseResponse<T>).data as T;
  }

  return payload as T;
}

export function unwrapPage<T>(payload: PageEnvelope<T>): BasePageResponse<T> {
  const maybeWrapped = payload as BaseResponse<BasePageResponse<T>>;
  const page = (maybeWrapped?.data ?? payload ?? {}) as BasePageResponse<T> & { items?: T[] };
  const content = Array.isArray(page?.content)
    ? page.content
    : Array.isArray(page?.items)
      ? page.items
      : [];

  return {
    content,
    pageNumber: Number(page?.pageNumber ?? 0),
    pageSize: Number(page?.pageSize ?? content.length),
    totalElements: Number(page?.totalElements ?? content.length),
    totalPages: Number(page?.totalPages ?? (content.length > 0 ? 1 : 0)),
    last: Boolean(page?.last ?? true),
  };
}
