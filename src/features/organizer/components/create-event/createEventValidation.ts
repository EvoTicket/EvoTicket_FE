import { isValidEmail, isValidPhone } from "@/src/lib/validations";
import type { CreateEventState, TicketTypeInput } from "./useCreateEventWizard";

export type CreateEventStep = 1 | 2 | 3 | 4 | 5;
export type StepErrors = Record<string, string>;

export type StepValidationResult = {
    errors: StepErrors;
    firstInvalidField?: string;
};

export type CreateEventValidationSummary = StepValidationResult & {
    firstInvalidStep?: CreateEventStep;
    stepErrors: Partial<Record<CreateEventStep, StepErrors>>;
};

/**
 * URL slug: only lowercase English letters (no diacritics), digits, and single
 * hyphens between words.  Must not start/end with a hyphen, and must not
 * contain consecutive hyphens.
 * Valid:   "music-show", "anh-trai-say-hi-2026", "event-123"
 * Invalid: "sự-kiện", "su kien am nhac", "music+show", "Music-Show",
 *          "-music-show", "music-show-", "music--show"
 */
const EVENT_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Quick test for characters that are definitely not valid slug material. */
const SLUG_HAS_UPPERCASE = /[A-Z]/;
const SLUG_HAS_WHITESPACE = /\s/;
const SLUG_HAS_PLUS = /\+/;
/** Detects any non-ASCII letter (covers Vietnamese diacritics and other scripts). */
const SLUG_HAS_DIACRITICS = /[^\x00-\x7F]/;

const GATE_CODE_REGEX = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/;

function isBlank(value: string) {
    return value.trim().length === 0;
}

function isAfter(end: string, start: string) {
    if (!start || !end) return false;
    return new Date(end).getTime() > new Date(start).getTime();
}

function isOnOrBefore(value: string, max: string) {
    if (!value || !max) return false;
    return new Date(value).getTime() <= new Date(max).getTime();
}

function result(errors: StepErrors, fieldOrder: string[]): StepValidationResult {
    return {
        errors,
        firstInvalidField: fieldOrder.find((field) => errors[field]),
    };
}

export function validateStep1(state: CreateEventState): StepValidationResult {

    // Tạm thời bỏ qua validation của step 1
    // return { errors: {}, firstInvalidField: "" };
    const errors: StepErrors = {};
    const fieldOrder = [
        "thumbnailImage",
        "bannerImage",
        "eventName",
        "eventType",
        "category",
        "venue",
        "provinceCode",
        "wardCode",
        "address",
        "shortDescription",
        "detailedDescription",
    ];

    if (!state.thumbnailPreview) errors.thumbnailImage = "Validation.poster_req";
    if (!state.bannerPreview) errors.bannerImage = "Validation.cover_req";
    if (isBlank(state.eventName)) errors.eventName = "Validation.event_name_req";
    if (state.eventType !== "OFFLINE") errors.eventType = "Validation.only_offline_supported";
    if (!state.category) errors.category = "Validation.category_req";
    if (isBlank(state.venue)) errors.venue = "Validation.venue_req";
    if (!state.provinceCode) errors.provinceCode = "Validation.province_req";
    if (!state.wardCode) errors.wardCode = "Validation.ward_req";
    if (isBlank(state.address)) errors.address = "Validation.address_req";
    if (isBlank(state.shortDescription)) errors.shortDescription = "Validation.short_desc_req";
    if (isBlank(state.detailedDescription)) errors.detailedDescription = "Validation.detail_desc_req";
    if (!isBlank(state.organizerEmail) && !isValidEmail(state.organizerEmail)) {
        errors.organizerEmail = "Validation.invalid_email";
    }
    if (!isBlank(state.organizerPhone) && !isValidPhone(state.organizerPhone)) {
        errors.organizerPhone = "Validation.invalid_phone";
    }

    return result(errors, fieldOrder);
}

function validateTicket(ticket: TicketTypeInput, showtimeStart: string, errors: StepErrors, fieldOrder: string[]) {
    const prefix = `ticket-${ticket.id}`;

    const add = (field: string, message: string) => {
        const key = `${prefix}-${field}`;
        errors[key] = message;
        fieldOrder.push(key);
    };

    if (isBlank(ticket.typeName)) add("typeName", "Validation.ticket_name_req");
    if (ticket.isFree || ticket.price <= 0) {
        add("price", "Validation.ticket_price_min");
    }
    if (ticket.quantityTotal <= 0) add("quantityTotal", "Validation.ticket_qty_min");
    if (ticket.minPurchase < 1) add("minPurchase", "Validation.ticket_min_purchase");
    if (ticket.maxPurchase < ticket.minPurchase) add("maxPurchase", "Validation.ticket_max_purchase");
    if (ticket.maxPurchase > ticket.quantityTotal) add("maxPurchase", "Validation.ticket_max_purchase_qty");
    if (!ticket.saleStartDate) add("saleStartDate", "Validation.ticket_sale_time_req");
    if (!ticket.saleEndDate) add("saleEndDate", "Validation.ticket_sale_time_req");

    if (ticket.saleStartDate && ticket.saleEndDate && !isAfter(ticket.saleEndDate, ticket.saleStartDate)) {
        add("saleEndDate", "Validation.ticket_sale_time_invalid");
    }

    if (ticket.saleEndDate && showtimeStart && !isOnOrBefore(ticket.saleEndDate, showtimeStart)) {
        add("saleEndDate", "Validation.ticket_sale_before_show");
    }
}

export function validateStep2(state: CreateEventState): StepValidationResult {
    const errors: StepErrors = {};
    const fieldOrder: string[] = [];

    // Tạm thời bỏ qua validation của step 2
    // return { errors: {}, firstInvalidField: "" };

    if (state.showtimes.length === 0) {
        errors.showtime = "Validation.min_showtime";
        fieldOrder.push("showtime");
    }

    state.showtimes.forEach((showtime) => {
        const startKey = `showtime-${showtime.id}-startDatetime`;
        const endKey = `showtime-${showtime.id}-endDatetime`;
        const ticketGroupKey = `showtime-${showtime.id}-tickets`;

        if (!showtime.startDatetime) {
            errors[startKey] = "Validation.showtime_time_req";
            fieldOrder.push(startKey);
        }
        if (!showtime.endDatetime) {
            errors[endKey] = "Validation.showtime_time_req";
            fieldOrder.push(endKey);
        }
        if (showtime.startDatetime && showtime.endDatetime && !isAfter(showtime.endDatetime, showtime.startDatetime)) {
            errors[endKey] = "Validation.showtime_time_invalid";
            fieldOrder.push(endKey);
        }

        const tickets = state.ticketTypes.filter((ticket) => ticket.showtimeId === showtime.id);
        if (tickets.length === 0) {
            errors[ticketGroupKey] = "Validation.min_ticket";
            fieldOrder.push(ticketGroupKey);
        }
        tickets.forEach((ticket) => validateTicket(ticket, showtime.startDatetime, errors, fieldOrder));
    });

    // Validate seat map image if useSeatMap is enabled
    if (state.useSeatMap && !state.seatMapPreview) {
        errors.seatMapImage = "Validation.seat_map_req";
        fieldOrder.unshift("seatMapImage");
    }

    return result(errors, fieldOrder);
}

export function getStep2Warnings(state: CreateEventState) {
    return state.ticketTypes.flatMap((ticket) => {
        const showtime = state.showtimes.find((item) => item.id === ticket.showtimeId);
        if (!showtime?.startDatetime || !ticket.saleEndDate) return [];

        const saleEnd = new Date(ticket.saleEndDate).getTime();
        const showtimeStart = new Date(showtime.startDatetime).getTime();
        const hoursBeforeShowtime = (showtimeStart - saleEnd) / 36e5;

        if (saleEnd > showtimeStart) {
            return [`"${ticket.typeName || "Một loại vé"}" kết thúc bán sau thời gian bắt đầu suất diễn. Kiểm tra lại khung thời gian để đảm bảo đúng kế hoạch.`];
        }

        if (hoursBeforeShowtime >= 0 && hoursBeforeShowtime < 2) {
            return [`"${ticket.typeName || "Một loại vé"}" kết thúc bán rất sát giờ diễn. Cân nhắc nới khung thời gian để tránh lỗi vận hành.`];
        }

        return [];
    });
}

export function validateStep3(state: CreateEventState): StepValidationResult {
    const errors: StepErrors = {};
    const fieldOrder = ["urlSlug", "totalGates", "expectedCheckers", "gate"];

    // ── URL slug ────────────────────────────────────────────────────────
    const slug = state.urlSlug.trim();
    if (slug.length > 0 && SLUG_HAS_DIACRITICS.test(slug)) {
        errors.urlSlug = "Validation.slug_format";
    } else if (SLUG_HAS_UPPERCASE.test(slug)) {
        errors.urlSlug = "Validation.slug_format";
    } else if (SLUG_HAS_WHITESPACE.test(slug)) {
        errors.urlSlug = "Validation.slug_format";
    } else if (SLUG_HAS_PLUS.test(slug)) {
        errors.urlSlug = "Validation.slug_format";
    } else if (slug.length > 0 && !EVENT_SLUG_REGEX.test(slug)) {
        errors.urlSlug = "Validation.slug_format";
    }

    // ── Gate configuration ──────────────────────────────────────────────
    if (state.totalGates < 0) errors.totalGates = "Validation.total_gates_min";
    if (state.expectedCheckers < 0) errors.expectedCheckers = "Validation.expected_checkers_min";

    // Build a set of normalised gate codes for duplicate detection.
    const seenCodes = new Map<string, string>();   // normalised → first gate.id

    state.gates.forEach((gate) => {
        const rawCode = (gate.code ?? "").trim();
        if (rawCode.length > 0 && !GATE_CODE_REGEX.test(rawCode)) {
            errors[`gate-${gate.id}-code`] = "Validation.gate_code_format";
            fieldOrder.push(`gate-${gate.id}-code`);
        } else if (rawCode.length > 0) {
            // Duplicate check (case-insensitive, trim-insensitive)
            const normalised = rawCode.toUpperCase();
            const existing = seenCodes.get(normalised);
            if (existing && existing !== gate.id) {
                errors[`gate-${gate.id}-code`] = "Validation.gate_code_duplicate";
                fieldOrder.push(`gate-${gate.id}-code`);
            } else {
                seenCodes.set(normalised, gate.id);
            }
        }
    });

    return result(errors, fieldOrder);
}

export function validateStep4(state: CreateEventState): StepValidationResult {
    const errors: StepErrors = {};
    const fieldOrder = ["selectedProfileId"];

    return result(errors, fieldOrder);
}

export function validateStep5(state: CreateEventState): StepValidationResult {
    const errors: StepErrors = {};
    const fieldOrder = ["review"];
    const validators = [validateStep1, validateStep2, validateStep3, validateStep4];

    validators.forEach((validator, index) => {
        const stepResult = validator(state);
        if (Object.keys(stepResult.errors).length > 0) {
            errors.review = `Validation.step_incomplete_${index + 1}`;
        }
    });

    return result(errors, fieldOrder);
}

export function validateCreateEvent(state: CreateEventState): CreateEventValidationSummary {
    const stepErrors: Partial<Record<CreateEventStep, StepErrors>> = {};

    for (const step of [1, 2, 3, 4] as CreateEventStep[]) {
        const stepResult = validateStep(step, state);

        if (Object.keys(stepResult.errors).length > 0) {
            stepErrors[step] = stepResult.errors;
            return {
                errors: stepResult.errors,
                firstInvalidField: stepResult.firstInvalidField,
                firstInvalidStep: step,
                stepErrors,
            };
        }
    }

    return {
        errors: {},
        stepErrors,
    };
}

export function validateStep(step: CreateEventStep, state: CreateEventState): StepValidationResult {
    if (step === 1) return validateStep1(state);
    if (step === 2) return validateStep2(state);
    if (step === 3) return validateStep3(state);
    if (step === 4) return validateStep4(state);
    return validateStep5(state);
}

export function getStepProgress(step: CreateEventStep, state: CreateEventState) {
    const count = (checks: boolean[]) => {
        if (checks.length === 0) return 0;
        return Math.round((checks.filter(Boolean).length / checks.length) * 100);
    };

    if (step === 1) {
        return count([
            Boolean(state.thumbnailPreview),
            Boolean(state.bannerPreview),
            !isBlank(state.eventName),
            state.eventType === "OFFLINE",
            Boolean(state.category),
            !isBlank(state.venue),
            state.provinceCode > 0,
            state.wardCode > 0,
            !isBlank(state.address),
            !isBlank(state.shortDescription),
            !isBlank(state.detailedDescription),
            isBlank(state.organizerEmail) || isValidEmail(state.organizerEmail),
            isBlank(state.organizerPhone) || isValidPhone(state.organizerPhone),
        ]);
    }

    if (step === 2) {
        const showtimeChecks = state.showtimes.flatMap((showtime) => {
            const tickets = state.ticketTypes.filter((ticket) => ticket.showtimeId === showtime.id);
            return [
                Boolean(showtime.startDatetime),
                Boolean(showtime.endDatetime) && isAfter(showtime.endDatetime, showtime.startDatetime),
                tickets.length > 0,
            ];
        });
        const ticketChecks = state.ticketTypes.flatMap((ticket) => {
            const showtime = state.showtimes.find((item) => item.id === ticket.showtimeId);
            return [
                !isBlank(ticket.typeName),
                !ticket.isFree && ticket.price > 0,
                ticket.quantityTotal > 0,
                ticket.minPurchase >= 1,
                ticket.maxPurchase >= ticket.minPurchase && ticket.maxPurchase <= ticket.quantityTotal,
                Boolean(ticket.saleStartDate),
                Boolean(ticket.saleEndDate) && isAfter(ticket.saleEndDate, ticket.saleStartDate),
                Boolean(showtime?.startDatetime) && isOnOrBefore(ticket.saleEndDate, showtime?.startDatetime ?? ""),
            ];
        });
        return count([...showtimeChecks, ...ticketChecks]);
    }

    if (step === 3) {
        const slugTrimmed = state.urlSlug.trim();
        const gateCodes = state.gates
            .map((g) => (g.code ?? "").trim().toUpperCase())
            .filter(Boolean);
        const noDuplicateCodes = new Set(gateCodes).size === gateCodes.length;

        return count([
            slugTrimmed.length === 0 || (!SLUG_HAS_DIACRITICS.test(slugTrimmed) && EVENT_SLUG_REGEX.test(slugTrimmed)),
            state.totalGates >= 0,
            state.expectedCheckers >= 0,
            noDuplicateCodes,
            ...state.gates.map((gate) => (gate.code ?? "").trim().length === 0 || GATE_CODE_REGEX.test((gate.code ?? "").trim())),
        ]);
    }

    if (step === 4) return 100;

    return [validateStep1, validateStep2, validateStep3, validateStep4].every(
        (validator) => Object.keys(validator(state).errors).length === 0,
    ) ? 100 : 0;
}
