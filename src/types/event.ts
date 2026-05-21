export interface EventItem {
    id: number;
    eventName: string;
    description: string;
    venue: string;
    fullAddress: string;
    startDatetime: string;
    endDatetime: string;
    eventStatus: string;
    eventType: string;
    bannerImage: string | null;
    thumbnailImage: string | null;
    totalSeats: number;
    organizerId: number;
    isFeatured: boolean;
    categoryId: number;
    categoryName: string;
    favorite: boolean;
    favoriteCount: number;
    floorPrice?: number;
    ticketTypes?: any[];
    volume24H?: number;
    hotness?: number;
    organizerName?: string;
    ticketAvailabilityStatus?: string;
}

export interface Province {
    code: number;
    name: string;
}

export interface AddressInfo {
    wardCode: number;
    wardName: string;
    provinceCode: number;
    provinceName: string;
    fullAddress: string;
}

export interface OrganizationInfo {
    id: number;
    organizationName: string;
    logoUrl: string | null;
    addressInfo: AddressInfo;
    businessPhone: string;
    businessEmail: string;
    description?: string;
}

export interface TicketTypeDetail {
    ticketTypeId: number;
    typeName: string;
    description: string;
    price: number;
    quantityAvailable: number;
    quantitySold: number;
    minPurchase: number;
    maxPurchase: number;
    saleStartDate: string;
    saleEndDate: string;
    ticketTypeStatus: string;
    showtimeId: number;
    eventId: number;
    eventName: string;
}

export interface Showtime {
    showtimeId: number;
    startDatetime: string;
    endDatetime: string;
    venue: string;
    address: string;
    fullAddress: string;
    provinceName: string;
    isCancelled: boolean;
    ticketTypes: TicketTypeDetail[];
}

export interface Review {
    id: number;
    userId: number;
    rating: number;
    comment: string;
    images: string[] | null;
    createdAt: string;
}

export interface EventDetail {
    eventId: number;
    eventName: string;
    orgInternalResponse: OrganizationInfo;
    description: string;
    venue: string;
    address: string;
    startDatetime?: string;
    eventStatus: string;
    eventType: string;
    bannerImage: string | null;
    thumbnailImage: string | null;
    introduction: string | null;
    seatMapImage: string | null;
    totalSeats: number;
    organizerId: number;
    isFeatured: boolean;
    category: string;
    latitude: number;
    longitude: number;
    showtimes: Showtime[];
    reviews: Review[];

    // Khai báo thêm thuộc tính fallback phía giao diện
    hasSeatMap?: boolean | null;
    ticketAvailabilityStatus?: string;
    allowMultipleTicketTypesPerOrder?: boolean;
}
