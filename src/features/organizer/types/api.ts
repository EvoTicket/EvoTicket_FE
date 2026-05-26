export interface BaseResponse<T> {
  status: number;
  message: string;
  data: T;
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

export interface BankInfoResponse {
  id: number;
  profileName?: string | null;
  bankCode?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankOwnerName?: string | null;
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
  bankInfos?: BankInfoResponse[] | null;
}

export interface OrganizerDashboardMetricsResponse {
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

export type EventCategory = string;

export type EventType = "OFFLINE" | "ONLINE" | "HYBRID" | string;
export type EventStatus = string;
export type EventApprovalStatus = string;

export interface ListEventResponse {
  id: number | string;
  name?: string | null;
  eventName?: string | null;
  title?: string | null;
  thumbnailUrl?: string | null;
  thumbnailImage?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  type?: string | null;
  startTime?: string | null;
  startDatetime?: string | null;
  startDate?: string | null;
  endTime?: string | null;
  endDatetime?: string | null;
  endDate?: string | null;
  venue?: string | null;
  location?: string | null;
  status?: string | null;
  approvalStatus?: string | null;
  soldTickets?: number | null;
  totalTickets?: number | null;
  revenue?: number | null;
  totalCheckers?: number | null;
  checkers?: number | null;
  updatedAt?: string | null;
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

export type OrganizerEventCategory =
  | "LIVESTAGE"
  | "STAGE_ART"
  | "WORKSHOP"
  | "SPORTS"
  | "EXHIBITION";

export type OrganizerEventType = "ONLINE" | "OFFLINE" | "HYBRID";

export type OrganizerEventStatus =
  | "UPCOMING"
  | "ON_SALE"
  | "SALE_CLOSED"
  | "ON_GOING"
  | "COMPLETED"
  | "CANCELLED";

export type OrganizerApprovalStatus = "PENDING_REVIEW" | "PUBLISHED" | "REJECTED";

export type OrganizerEventSort =
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "DATE_ASC"
  | "NEWEST"
  | "POPULAR";

export interface OrganizerDashboardEventResponse {
  id: number;
  name: string;
  thumbnailUrl?: string | null;
  category?: OrganizerEventCategory | string | null;
  type?: OrganizerEventType | string | null;
  startTime?: string | null;
  venue?: string | null;
  status?: OrganizerEventStatus | string | null;
  approvalStatus?: OrganizerApprovalStatus | string | null;
  soldTickets?: number | null;
  totalTickets?: number | null;
  revenue?: number | null;
  totalCheckers?: number | null;
  updatedAt?: string | null;
}

export interface OrganizerDashboardResponse
  extends OrganizerDashboardMetricsResponse {
  totalEvents: number;
  totalOnSales: number;
  totalPending: number;
  totalCompleted: number;
  events: BasePageResponse<OrganizerDashboardEventResponse>;
}

export interface OrganizerEventListParams {
  keyword?: string;
  categories?: string[];
  eventTypes?: string[];
  eventStatuses?: string[];
  approvalStatuses?: string[];
  startDate?: string;
  endDate?: string;
  page?: number; // 1-indexed
  size?: number;
  sort?: "PRICE_ASC" | "PRICE_DESC" | "DATE_ASC" | "NEWEST" | "POPULAR" | string;
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
  introduction?: string;
  checkers?: number;
  category: EventCategory;
  showtimes: CreateShowtimeRequest[];
  shortDescription?: string;
  checkInInstruction?: string;
  allowResale?: boolean;
  allowMultipleTicketTypesPerOrder?: boolean;
  bankInfoId?: number;
  postPurchaseInstruction?: string;
  contactPhone?: string;
  entryGateInstruction?: string;
  reconciliationNote?: string;
  allowDiscountCode?: boolean;
  contactEmail?: string;
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

export interface ProvinceResponse {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  phone_code: number;
}

export interface WardResponse {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  province_code: ProvinceResponse;
}

export type Province = ProvinceResponse;
export type Ward = WardResponse;

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

export interface AccountBankInfoResponse {
  accountName: string;
  bankName: string;
  accountNumber: string;
}

export interface AccountOwnerInfo {
  fullName: string;
  email: string;
  phone: string;
  employeeCode: string;
  twoFactorEnabled: boolean;
  lastPasswordChangeAt: string;
  activeSessions: number;
}

export interface OrganizerAccountProfileResponse {
  id: number;
  userId: number;
  organizationName: string;
  organizationType: string;
  status: string;
  verificationLevel: string;
  joinedAt: string;
  primaryContactName: string;
  logoUrl: string;
  coverUrl: string;
  website: string;
  supportEmail: string;
  supportPhone: string;
  shortDescription: string;
  publicBio: string;
  businessType: string;
  taxCode: string;
  taxVerified: boolean;
  billingAddress: string;
  ownerInfo: AccountOwnerInfo;
  payoutInfo: AccountBankInfoResponse[];
}

/** Export report request payload */
export interface ExportReportRequest {
  /** File format */
  format: "CSV" | "XLSX" | "PDF";
  /** Number of days to include in the report */
  days: number;
  /** Data sections to export */
  sections: Array<"summary" | "revenue" | "tickets" | "checkin" | "resale">;
  /** Column separator — CSV only */
  separator?: "," | ";" | "\t";
  /** Whether to include column headers — CSV and XLSX */
  includeHeaders?: boolean;
}
