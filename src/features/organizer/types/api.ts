export interface BaseResponse<T> {
  status?: number;
  message?: string;
  data?: T;
}

export interface BasePageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export type OrganizationStatus =
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"
  | string;

export interface AddressInfo {
  fullAddress?: string | null;
  provinceName?: string | null;
  wardName?: string | null;
}

export interface OrganizationProfileResponse {
  id: number;
  userId: number;
  userEmail?: string | null;
  organizationName?: string | null;
  legalName?: string | null;
  taxCode?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  businessAddress?: string | null;
  addressInfo?: AddressInfo | null;
  businessPhone?: string | null;
  businessEmail?: string | null;
  website?: string | null;
  businessLicenseUrl?: string | null;
  status?: OrganizationStatus | null;
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface OrganizerDashboardResponse {
  totalRevenue?: number | string | null;
  totalTicketsSold?: number | null;
  avgOccupancyRate?: number | null;
  avgCheckInRate?: number | null;
  resaleVolume?: number | null;
  royaltyFee?: number | string | null;
  revenueTrend?: Array<{ day?: number; revenue?: number | string | null }> | null;
  occupancyByCategory?: Array<{ name?: string; value?: number; color?: string }> | null;
  ticketSalesByEvent?: Array<{ name?: string; tickets?: number }> | null;
  checkInStatus?: {
    checkedIn?: number;
    notCheckedIn?: number;
    absentRate?: number;
    peakGateTime?: string;
  } | null;
  performanceTable?: Array<{
    name?: string;
    type?: string;
    sold?: string;
    occupancy?: string;
    revenue?: string;
    checkin?: string;
    resale?: string;
    royalty?: string;
    status?: string;
  }> | null;
}

export type EventCategory =
  | "LIVESTAGE"
  | "STAGE_ART"
  | "WORKSHOP"
  | "SPORTS"
  | "EXHIBITION"
  | string;

export type EventType = "OFFLINE" | "ONLINE" | "HYBRID" | string;
export type EventStatus = string;
export type EventApprovalStatus = string;

export interface ListEventResponse {
  id: number;
  eventName?: string | null;
  description?: string | null;
  venue?: string | null;
  fullAddress?: string | null;
  startDatetime?: string | null;
  endDatetime?: string | null;
  eventStatus?: EventStatus | null;
  eventType?: EventType | null;
  bannerImage?: string | null;
  thumbnailImage?: string | null;
  totalSeats?: number | null;
  organizerId?: number | null;
  isFeatured?: boolean | null;
  category?: EventCategory | null;
  floorPrice?: number | string | null;
  provinceName?: string | null;
  ticketAvailabilityStatus?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  isExpired?: boolean | null;
  isFavorite?: boolean;
  favoriteCount?: number | null;
}

export interface TicketTypeResponse {
  ticketTypeId?: number;
  typeName?: string | null;
  description?: string | null;
  price?: number | string | null;
  quantityAvailable?: number | null;
  quantitySold?: number | null;
  minPurchase?: number | null;
  maxPurchase?: number | null;
  saleStartDate?: string | null;
  saleEndDate?: string | null;
  ticketTypeStatus?: string | null;
  thumbnailImage?: string | null;
  showtimeId?: number | null;
  eventId?: number | null;
  eventName?: string | null;
}

export interface ShowtimeResponse {
  showtimeId?: number;
  startDatetime?: string | null;
  endDatetime?: string | null;
  venue?: string | null;
  address?: string | null;
  fullAddress?: string | null;
  provinceName?: string | null;
  isCancelled?: boolean | null;
  ticketTypes?: TicketTypeResponse[] | null;
}

export interface EventResponse {
  eventId: number;
  eventName?: string | null;
  orgInternalResponse?: {
    id?: number;
    organizationName?: string | null;
    description?: string | null;
    logoUrl?: string | null;
    businessPhone?: string | null;
    businessEmail?: string | null;
  } | null;
  description?: string | null;
  venue?: string | null;
  address?: string | null;
  eventStatus?: EventStatus | null;
  eventType?: EventType | null;
  bannerImage?: string | null;
  thumbnailImage?: string | null;
  introduction?: string | null;
  seatMapImage?: string | null;
  totalSeats?: number | null;
  organizerId?: number | null;
  isFeatured?: boolean | null;
  category?: EventCategory | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  showtimes?: ShowtimeResponse[] | null;
  reviews?: unknown[] | null;
}

export interface OrganizerEventListParams {
  status?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}

export interface CreateTicketTypeRequest {
  typeName: string;
  description?: string;
  price: number;
  quantityTotal: number;
  minPurchase?: number;
  maxPurchase?: number;
  saleStartDate?: string;
  saleEndDate?: string;
}

export interface CreateShowtimeRequest {
  startDatetime: string;
  endDatetime: string;
  venue?: string;
  address?: string;
  wardCode?: number;
  provinceCode?: number;
  ticketTypes?: CreateTicketTypeRequest[];
}

export interface CreateEventRequest {
  eventName: string;
  description: string;
  venue: string;
  wardCode?: number;
  provinceCode?: number;
  address?: string;
  eventType: EventType;
  totalSeats: number;
  isFeatured?: boolean;
  latitude?: number;
  longitude?: number;
  category: EventCategory;
  showtimes: CreateShowtimeRequest[];
}

export interface UpdateShowtimeRequest {
  id?: number;
  startDatetime?: string;
  endDatetime?: string;
  venue?: string;
  address?: string;
  wardCode?: number;
  provinceCode?: number;
  isCancelled?: boolean;
  ticketTypes?: CreateTicketTypeRequest[];
}

export interface UpdateEventRequest {
  eventName?: string;
  description?: string;
  venue?: string;
  address?: string;
  isCancelled?: boolean;
  eventType?: EventType;
  totalSeats?: number;
  isFeatured?: boolean;
  category?: EventCategory;
  latitude?: number;
  longitude?: number;
  showtimes?: UpdateShowtimeRequest[];
}

export interface CreateEventMultipartPayload {
  event: CreateEventRequest;
  bannerImage?: File | null;
  thumbnailImage?: File | null;
}

export interface Province {
  code: number;
  name: string;
  division_type?: string;
  divisionType?: string;
  codename?: string;
  phone_code?: number;
  phoneCode?: number;
}

export interface Ward {
  code: number;
  name: string;
  division_type?: string;
  divisionType?: string;
  codename?: string;
  province_code?: Province | number;
  province?: Province;
}

export interface FileUploadResponse {
  publicId?: string;
  url?: string;
  secureUrl?: string;
  format?: string;
  size?: number;
  width?: number;
  height?: number;
  resourceType?: string;
}
