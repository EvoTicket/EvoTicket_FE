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

    if (!state.thumbnailPreview) errors.thumbnailImage = "Vui lòng tải poster sự kiện.";
    if (!state.bannerPreview) errors.bannerImage = "Vui lòng tải ảnh cover sự kiện.";
    if (isBlank(state.eventName)) errors.eventName = "Vui lòng nhập tên sự kiện.";
    if (state.eventType !== "OFFLINE") errors.eventType = "Hiện tại chỉ hỗ trợ sự kiện Offline.";
    if (!state.category) errors.category = "Vui lòng chọn thể loại sự kiện.";
    if (isBlank(state.venue)) errors.venue = "Vui lòng nhập tên địa điểm.";
    if (!state.provinceCode) errors.provinceCode = "Vui lòng chọn tỉnh / thành phố.";
    if (!state.wardCode) errors.wardCode = "Vui lòng chọn quận / huyện.";
    if (isBlank(state.address)) errors.address = "Vui lòng nhập địa chỉ chi tiết.";
    if (isBlank(state.shortDescription)) errors.shortDescription = "Vui lòng nhập tóm tắt ngắn.";
    if (isBlank(state.detailedDescription)) errors.detailedDescription = "Vui lòng nhập mô tả chi tiết.";
    if (!isBlank(state.organizerEmail) && !isValidEmail(state.organizerEmail)) {
        errors.organizerEmail = "Email hỗ trợ không hợp lệ.";
    }
    if (!isBlank(state.organizerPhone) && !isValidPhone(state.organizerPhone)) {
        errors.organizerPhone = "Số điện thoại hỗ trợ không hợp lệ.";
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

    if (isBlank(ticket.typeName)) add("typeName", "Vui lòng nhập tên loại vé.");
    if (ticket.isFree || ticket.price <= 0) {
        add("price", "Backend hiện yêu cầu giá vé lớn hơn 0. Vé miễn phí chưa được hỗ trợ.");
    }
    if (ticket.quantityTotal <= 0) add("quantityTotal", "Số lượng vé phải lớn hơn 0.");
    if (ticket.minPurchase < 1) add("minPurchase", "Mua tối thiểu phải từ 1 vé.");
    if (ticket.maxPurchase < ticket.minPurchase) add("maxPurchase", "Mua tối đa phải lớn hơn hoặc bằng mua tối thiểu.");
    if (ticket.maxPurchase > ticket.quantityTotal) add("maxPurchase", "Mua tối đa không được vượt quá số lượng vé.");
    if (!ticket.saleStartDate) add("saleStartDate", "Vui lòng chọn thời gian bắt đầu bán.");
    if (!ticket.saleEndDate) add("saleEndDate", "Vui lòng chọn thời gian kết thúc bán.");

    if (ticket.saleStartDate && ticket.saleEndDate && !isAfter(ticket.saleEndDate, ticket.saleStartDate)) {
        add("saleEndDate", "Thời gian kết thúc bán phải sau thời gian bắt đầu bán.");
    }

    if (ticket.saleEndDate && showtimeStart && !isOnOrBefore(ticket.saleEndDate, showtimeStart)) {
        add("saleEndDate", "Thời gian kết thúc bán phải trước hoặc bằng thời gian bắt đầu suất diễn.");
    }
}

export function validateStep2(state: CreateEventState): StepValidationResult {
    const errors: StepErrors = {};
    const fieldOrder: string[] = [];

    if (state.showtimes.length === 0) {
        errors.showtime = "Vui lòng tạo ít nhất một suất diễn.";
        fieldOrder.push("showtime");
    }

    state.showtimes.forEach((showtime) => {
        const startKey = `showtime-${showtime.id}-startDatetime`;
        const endKey = `showtime-${showtime.id}-endDatetime`;
        const ticketGroupKey = `showtime-${showtime.id}-tickets`;

        if (!showtime.startDatetime) {
            errors[startKey] = "Vui lòng chọn thời gian bắt đầu suất diễn.";
            fieldOrder.push(startKey);
        }
        if (!showtime.endDatetime) {
            errors[endKey] = "Vui lòng chọn thời gian kết thúc suất diễn.";
            fieldOrder.push(endKey);
        }
        if (showtime.startDatetime && showtime.endDatetime && !isAfter(showtime.endDatetime, showtime.startDatetime)) {
            errors[endKey] = "Thời gian kết thúc suất diễn phải sau thời gian bắt đầu.";
            fieldOrder.push(endKey);
        }

        const tickets = state.ticketTypes.filter((ticket) => ticket.showtimeId === showtime.id);
        if (tickets.length === 0) {
            errors[ticketGroupKey] = "Mỗi suất diễn cần ít nhất một loại vé.";
            fieldOrder.push(ticketGroupKey);
        }
        tickets.forEach((ticket) => validateTicket(ticket, showtime.startDatetime, errors, fieldOrder));
    });

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
        errors.urlSlug =
            "URL chỉ được gồm chữ thường không dấu, số và dấu gạch ngang; không dùng khoảng trắng, dấu cộng hoặc ký tự có dấu.";
    } else if (SLUG_HAS_UPPERCASE.test(slug)) {
        errors.urlSlug =
            "URL chỉ được gồm chữ thường không dấu, số và dấu gạch ngang; không dùng khoảng trắng, dấu cộng hoặc ký tự có dấu.";
    } else if (SLUG_HAS_WHITESPACE.test(slug)) {
        errors.urlSlug =
            "URL chỉ được gồm chữ thường không dấu, số và dấu gạch ngang; không dùng khoảng trắng, dấu cộng hoặc ký tự có dấu.";
    } else if (SLUG_HAS_PLUS.test(slug)) {
        errors.urlSlug =
            "URL chỉ được gồm chữ thường không dấu, số và dấu gạch ngang; không dùng khoảng trắng, dấu cộng hoặc ký tự có dấu.";
    } else if (slug.length > 0 && !EVENT_SLUG_REGEX.test(slug)) {
        // Catches leading/trailing/consecutive hyphens and any other invalid chars
        errors.urlSlug =
            "URL chỉ được gồm chữ thường không dấu, số và dấu gạch ngang; không dùng khoảng trắng, dấu cộng hoặc ký tự có dấu.";
    }

    // ── Gate configuration ──────────────────────────────────────────────
    if (state.totalGates < 0) errors.totalGates = "Số cổng không được âm.";
    if (state.expectedCheckers < 0) errors.expectedCheckers = "Số checker dự kiến không được âm.";

    // Build a set of normalised gate codes for duplicate detection.
    const seenCodes = new Map<string, string>();   // normalised → first gate.id

    state.gates.forEach((gate) => {
        const rawCode = (gate.code ?? "").trim();
        if (rawCode.length > 0 && !GATE_CODE_REGEX.test(rawCode)) {
            errors[`gate-${gate.id}-code`] = "Mã cổng chỉ dùng chữ in hoa, số và dấu gạch nối.";
            fieldOrder.push(`gate-${gate.id}-code`);
        } else if (rawCode.length > 0) {
            // Duplicate check (case-insensitive, trim-insensitive)
            const normalised = rawCode.toUpperCase();
            const existing = seenCodes.get(normalised);
            if (existing && existing !== gate.id) {
                errors[`gate-${gate.id}-code`] = "Mã cổng không được trùng nhau.";
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
            errors.review = `Bước ${index + 1} chưa hoàn tất. Vui lòng quay lại kiểm tra.`;
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
