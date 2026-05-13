import { useState } from "react";

export type EventType = "OFFLINE";
export type EventCategory =
    | "LIVESTAGE"
    | "STAGE_ART"
    | "WORKSHOP"
    | "SPORTS"
    | "EXHIBITION";
export type Visibility = "PUBLIC" | "PRIVATE" | "UNLISTED";

export const EVENT_CATEGORY_OPTIONS: { value: EventCategory; label: string }[] = [
    { value: "LIVESTAGE", label: "Nhạc sống / Concert" },
    { value: "STAGE_ART", label: "Sân khấu / Nghệ thuật" },
    { value: "WORKSHOP", label: "Workshop / Hội thảo" },
    { value: "SPORTS", label: "Thể thao" },
    { value: "EXHIBITION", label: "Triển lãm" },
];

export function getEventCategoryLabel(category: EventCategory | "") {
    return EVENT_CATEGORY_OPTIONS.find((item) => item.value === category)?.label ?? "Chưa chọn";
}

export interface ShowtimeInput {
    id: string; // temp id for UI
    name: string;
    startDatetime: string;
    endDatetime: string;
}

export interface TicketTypeInput {
    id: string; // temp id for UI
    showtimeId: string; // links to showtime
    typeName: string;
    description: string;
    price: number;
    isFree: boolean;
    quantityTotal: number;
    minPurchase: number;
    maxPurchase: number;
    saleStartDate: string;
    saleEndDate: string;
    status: string;
}

export interface GateInput {
    id: string;
    name: string;
    code: string;
    description: string;
}

export interface CreateEventState {
    // Step 1: Basic
    eventName: string;
    tagline: string;
    eventType: EventType;
    category: EventCategory | "";
    venue: string;
    provinceCode: number;
    wardCode: number;
    address: string;
    latitude: number;
    longitude: number;
    shortDescription: string;
    detailedDescription: string;
    organizerName: string;
    organizerEmail: string;
    organizerPhone: string;
    
    bannerFile: File | null;
    bannerImage: File | null;
    bannerPreview: string;
    thumbnailFile: File | null;
    thumbnailImage: File | null;
    thumbnailPreview: string;
    seatMapImage: File | null;

    // Step 2: Showtimes & Tickets
    showtimes: ShowtimeInput[];
    ticketTypes: TicketTypeInput[];
    useSeatMap: boolean;

    // Step 3: Settings
    urlSlug: string;
    visibility: Visibility;
    approvalRequired: boolean;
    publishNotes: string;
    allowMultipleTicketTypes: boolean;
    allowVouchers: boolean;
    allowResale: boolean;
    resaleMaxPriceCap: number;
    royaltyFee: number;
    allowExternalWallets: boolean;
    totalGates: number;
    expectedCheckers: number;
    gates: GateInput[];
    postPurchaseNotes: string;
    checkinReminder: string;
    gateNotes: string;

    // Step 4: Settlement
    selectedProfileId: string;
    reconciliationNotes: string;
}

const initialState: CreateEventState = {
    eventName: "",
    tagline: "",
    eventType: "OFFLINE",
    category: "",
    venue: "",
    provinceCode: 0,
    wardCode: 0,
    address: "",
    latitude: 10.762622,
    longitude: 106.660172,
    shortDescription: "",
    detailedDescription: "",
    organizerName: "",
    organizerEmail: "",
    organizerPhone: "",
    bannerFile: null,
    bannerImage: null,
    bannerPreview: "",
    thumbnailFile: null,
    thumbnailImage: null,
    thumbnailPreview: "",
    seatMapImage: null,

    showtimes: [
        {
            id: "st-1",
            name: "Đêm diễn chính",
            startDatetime: "",
            endDatetime: ""
        }
    ],
    ticketTypes: [],
    useSeatMap: false,

    urlSlug: "",
    visibility: "PUBLIC",
    approvalRequired: true,
    publishNotes: "",
    allowMultipleTicketTypes: false,
    allowVouchers: false,
    allowResale: false,
    resaleMaxPriceCap: 120,
    royaltyFee: 5,
    allowExternalWallets: false,
    totalGates: 1,
    expectedCheckers: 1,
    gates: [{ id: "g-1", name: "Gate A - Main Entry", code: "GATE-A", description: "Checker phân công sau khi sự kiện được tạo" }],
    postPurchaseNotes: "",
    checkinReminder: "",
    gateNotes: "",

    selectedProfileId: "prof-1",
    reconciliationNotes: "",
};

export function useCreateEventWizard() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<CreateEventState>(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const updateField = <K extends keyof CreateEventState>(field: K, value: CreateEventState[K]) => {
        setFormData(prev => ({
            ...prev,
            [field]: field === "eventType" ? "OFFLINE" : value,
        }));
    };

    const nextStep = () => {
        if (step < 5) setStep(s => s + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(s => s - 1);
    };

    const submitForm = async () => {
        if (formData.eventType !== "OFFLINE") {
            setFormData(prev => ({ ...prev, eventType: "OFFLINE" }));
            return;
        }

        setIsSubmitting(true);
        // Simulate API call for the fixture
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1500);
    };

    // Derived state for draft progress (simple calculation based on some key fields)
    const calculateProgress = () => {
        const requiredFields: (keyof CreateEventState)[] = [
            "eventName", "category", "provinceCode", "address", 
            "shortDescription"
        ];
        let filled = 0;
        requiredFields.forEach(f => {
            if (formData[f] && String(formData[f]).trim() !== "" && formData[f] !== 0) filled++;
        });
        if (formData.bannerPreview) filled++;
        if (formData.thumbnailPreview) filled++;
        
        const total = requiredFields.length + 2;
        return Math.round((filled / total) * 100);
    };

    return {
        step,
        setStep,
        formData,
        updateField,
        nextStep,
        prevStep,
        submitForm,
        isSubmitting,
        isSuccess,
        draftProgress: calculateProgress(),
    };
}
