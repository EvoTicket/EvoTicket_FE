import { isValidEmail, isValidPhone } from "@/src/lib/validations";
import type { CreateEventState, TicketTypeInput } from "./useCreateEventWizard";

export type CreateEventStep = 1 | 2 | 3 | 4 | 5;
export type StepErrors = Record<string, string>;

export type StepValidationResult = {
    errors: StepErrors;
    firstInvalidField?: string;
};

const EVENT_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GATE_CODE_REGEX = /^[A-Z0-9-]+$/;

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
        "organizerName",
        "organizerEmail",
        "organizerPhone",
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
    if (isBlank(state.organizerName)) errors.organizerName = "Vui lòng nhập tên ban tổ chức.";
    if (isBlank(state.organizerEmail)) {
        errors.organizerEmail = "Vui lòng nhập email hỗ trợ.";
    } else if (!isValidEmail(state.organizerEmail)) {
        errors.organizerEmail = "Email hỗ trợ không hợp lệ.";
    }
    if (isBlank(state.organizerPhone)) {
        errors.organizerPhone = "Vui lòng nhập số điện thoại hỗ trợ.";
    } else if (!isValidPhone(state.organizerPhone)) {
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
    if (ticket.price < 0) add("price", "Giá vé phải lớn hơn hoặc bằng 0.");
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

    if (isBlank(state.urlSlug)) {
        errors.urlSlug = "Vui lòng nhập URL slug.";
    } else if (!EVENT_SLUG_REGEX.test(state.urlSlug)) {
        errors.urlSlug = "Slug chỉ dùng chữ thường không dấu, số và dấu gạch nối đơn.";
    }

    if (state.totalGates < 1) errors.totalGates = "Số cổng phải lớn hơn hoặc bằng 1.";
    if (state.expectedCheckers < 1) errors.expectedCheckers = "Số checker dự kiến phải lớn hơn hoặc bằng 1.";
    if (state.gates.length === 0) errors.gate = "Vui lòng cấu hình ít nhất một cổng.";

    state.gates.forEach((gate) => {
        if (isBlank(gate.name)) {
            errors[`gate-${gate.id}-name`] = "Tên cổng là bắt buộc.";
            fieldOrder.push(`gate-${gate.id}-name`);
        }
        if (gate.code && !GATE_CODE_REGEX.test(gate.code)) {
            errors[`gate-${gate.id}-code`] = "Mã cổng chỉ dùng chữ in hoa, số và dấu gạch nối.";
            fieldOrder.push(`gate-${gate.id}-code`);
        }
    });

    return result(errors, fieldOrder);
}

export function validateStep4(state: CreateEventState): StepValidationResult {
    const errors: StepErrors = {};
    const fieldOrder = ["selectedProfileId"];

    if (!state.selectedProfileId) errors.selectedProfileId = "Vui lòng chọn hồ sơ đối soát.";

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
            !isBlank(state.organizerName),
            isValidEmail(state.organizerEmail),
            isValidPhone(state.organizerPhone),
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
                ticket.price >= 0,
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
        return count([
            EVENT_SLUG_REGEX.test(state.urlSlug),
            state.totalGates >= 1,
            state.expectedCheckers >= 1,
            state.gates.length > 0,
            ...state.gates.flatMap((gate) => [
                !isBlank(gate.name),
                !gate.code || GATE_CODE_REGEX.test(gate.code),
            ]),
        ]);
    }

    if (step === 4) return state.selectedProfileId ? 100 : 0;

    return [validateStep1, validateStep2, validateStep3, validateStep4].every(
        (validator) => Object.keys(validator(state).errors).length === 0,
    ) ? 100 : 0;
}
