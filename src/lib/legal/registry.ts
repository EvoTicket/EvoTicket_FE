export type LegalCategory =
    | "terms"
    | "privacy"
    | "transaction"
    | "ticket"
    | "payment"
    | "refund"
    | "dispute"
    | "resale"
    | "organizer"
    | "ai"
    | "blockchain";

export type LegalFlow =
    | "account-signup"
    | "primary-checkout"
    | "resale-checkout"
    | "resale-listing"
    | "organizer-onboarding"
    | "payment"
    | "my-ticket"
    | "check-in"
    | "ai-chatbot"
    | "help"
    | "dispute-resolution";

export type LegalRegistryItem = {
    title: string;
    shortTitle: string;
    description: string;
    category: LegalCategory;
    version: string;
    effectiveDate: string;
    lastUpdated: string;
    requiredForFlow: LegalFlow[];
    footerPriority?: number;
};

export const legalRegistry = {
    "terms-of-use": {
        title: "Điều khoản sử dụng EvoTicket",
        shortTitle: "Điều khoản sử dụng",
        description:
            "Quy định chung về việc truy cập, sử dụng tài khoản, đặt vé, thanh toán, bán lại vé, Dynamic QR, AI chatbot và các tính năng blockchain/NFT trên nền tảng EvoTicket.",
        category: "terms",
        version: "1.0.0",
        effectiveDate: "2026-06-04",
        lastUpdated: "2026-06-04",
        requiredForFlow: [
            "account-signup",
            "primary-checkout",
            "resale-checkout",
            "organizer-onboarding",
            "ai-chatbot",
            "my-ticket",
        ],
        footerPriority: 2,
    },

    "privacy-policy": {
        title: "Chính sách bảo mật và xử lý dữ liệu cá nhân",
        shortTitle: "Chính sách bảo mật",
        description:
            "Mô tả cách EvoTicket thu thập, sử dụng, lưu trữ, bảo vệ và chia sẻ dữ liệu cá nhân của người mua vé, ban tổ chức, checker và người dùng các tính năng thanh toán, resale, Dynamic QR, AI chatbot và blockchain/NFT.",
        category: "privacy",
        version: "1.0.0",
        effectiveDate: "2026-06-04",
        lastUpdated: "2026-06-04",
        requiredForFlow: [
            "account-signup",
            "primary-checkout",
            "resale-checkout",
            "organizer-onboarding",
            "ai-chatbot",
            "payment",
            "check-in",
        ],
        footerPriority: 1,
    },

    "general-transaction-conditions": {
        title: "Điều kiện giao dịch chung",
        shortTitle: "Điều kiện giao dịch chung",
        description:
            "Quy định về điều kiện giao kết, xác nhận giao dịch, trách nhiệm của các bên, bằng chứng giao dịch và quy trình xử lý trong các giao dịch trên EvoTicket.",
        category: "transaction",
        version: "1.0.0",
        effectiveDate: "2026-06-04",
        lastUpdated: "2026-06-04",
        requiredForFlow: ["primary-checkout", "resale-checkout", "payment"],
        footerPriority: 4,
    },

    "ticket-policy": {
        title: "Chính sách vé",
        shortTitle: "Chính sách vé",
        description:
            "Quy định về phát hành vé, trạng thái vé, Dynamic QR, quyền sử dụng vé, kiểm tra vé, check-in và trách nhiệm bảo quản mã vé.",
        category: "ticket",
        version: "1.0.0",
        effectiveDate: "2026-06-04",
        lastUpdated: "2026-06-04",
        requiredForFlow: [
            "primary-checkout",
            "resale-checkout",
            "my-ticket",
            "check-in",
        ],
        footerPriority: 5,
    },

    "payment-policy": {
        title: "Chính sách thanh toán",
        shortTitle: "Chính sách thanh toán",
        description:
            "Quy định về phương thức thanh toán, xác nhận giao dịch, lỗi thanh toán, đối soát và trách nhiệm liên quan đến các cổng thanh toán được tích hợp trên EvoTicket.",
        category: "payment",
        version: "1.0.0",
        effectiveDate: "2026-06-04",
        lastUpdated: "2026-06-04",
        requiredForFlow: ["primary-checkout", "resale-checkout", "payment"],
        footerPriority: 6,
    },

    "refund-policy": {
        title: "Chính sách hoàn tiền, hủy, hoãn và thay đổi sự kiện",
        shortTitle: "Chính sách hoàn tiền",
        description:
            "Quy định về các trường hợp hoàn tiền, không hoàn tiền, xử lý lỗi thanh toán, lỗi phát hành vé, sự kiện bị hủy, hoãn, thay đổi thời gian/địa điểm và các tình huống liên quan đến vé đã check-in hoặc vé đã bán lại.",
        category: "refund",
        version: "1.0.0",
        effectiveDate: "2026-06-04",
        lastUpdated: "2026-06-04",
        requiredForFlow: [
            "primary-checkout",
            "resale-checkout",
            "payment",
            "my-ticket",
            "help",
            "dispute-resolution",
        ],
        footerPriority: 3,
    },

    "dispute-resolution": {
        title: "Cơ chế giải quyết tranh chấp và khiếu nại",
        shortTitle: "Giải quyết tranh chấp",
        description:
            "Mô tả quy trình tiếp nhận, phân loại, xử lý và phản hồi khiếu nại hoặc tranh chấp phát sinh giữa người mua, ban tổ chức, checker, cổng thanh toán và nền tảng EvoTicket.",
        category: "dispute",
        version: "1.0.0",
        effectiveDate: "2026-06-04",
        lastUpdated: "2026-06-04",
        requiredForFlow: [
            "primary-checkout",
            "resale-checkout",
            "my-ticket",
            "help",
            "dispute-resolution",
        ],
        footerPriority: 7,
    },

    "resale-policy": {
        title: "Chính sách bán lại và chuyển nhượng vé",
        shortTitle: "Chính sách bán lại vé",
        description:
            "Quy định về điều kiện đăng bán lại vé, giới hạn giá bán lại, khóa QR khi listing, chuyển quyền sở hữu, trách nhiệm của người bán/người mua và xử lý tranh chấp resale.",
        category: "resale",
        version: "1.0.0",
        effectiveDate: "2026-06-04",
        lastUpdated: "2026-06-04",
        requiredForFlow: ["resale-listing", "resale-checkout", "my-ticket"],
        footerPriority: 8,
    },

    "organizer-terms": {
        title: "Điều khoản dành cho ban tổ chức",
        shortTitle: "Điều khoản ban tổ chức",
        description:
            "Quy định về đăng ký ban tổ chức, xác minh thông tin, tạo và quản lý sự kiện, trách nhiệm cung cấp thông tin, chất lượng sự kiện, đối soát doanh thu và xử lý tranh chấp.",
        category: "organizer",
        version: "1.0.0",
        effectiveDate: "2026-06-04",
        lastUpdated: "2026-06-04",
        requiredForFlow: ["organizer-onboarding"],
        footerPriority: 9,
    },

    "ai-chatbot-policy": {
        title: "Chính sách sử dụng AI chatbot",
        shortTitle: "Chính sách AI chatbot",
        description:
            "Quy định về phạm vi hỗ trợ của AI chatbot, giới hạn trách nhiệm, dữ liệu được sử dụng trong quá trình hỏi đáp và nguyên tắc không xem câu trả lời AI là cam kết pháp lý tuyệt đối.",
        category: "ai",
        version: "1.0.0",
        effectiveDate: "2026-06-04",
        lastUpdated: "2026-06-04",
        requiredForFlow: ["ai-chatbot", "help"],
        footerPriority: 10,
    },

    "blockchain-nft-policy": {
        title: "Chính sách NFT, blockchain và tài sản số",
        shortTitle: "Chính sách NFT",
        description:
            "Quy định về vai trò của NFT, blockchain, custodial wallet, provenance, tokenId, transaction hash, chuyển quyền sở hữu và giới hạn trách nhiệm liên quan đến tài sản số trên EvoTicket.",
        category: "blockchain",
        version: "1.0.0",
        effectiveDate: "2026-06-04",
        lastUpdated: "2026-06-04",
        requiredForFlow: [
            "primary-checkout",
            "resale-checkout",
            "my-ticket",
            "resale-listing",
        ],
        footerPriority: 11,
    },
} as const satisfies Record<string, LegalRegistryItem>;

export type LegalSlug = keyof typeof legalRegistry;

export function isLegalSlug(slug: string): slug is LegalSlug {
    return slug in legalRegistry;
}

export function getAllLegalSlugs(): LegalSlug[] {
    return Object.keys(legalRegistry) as LegalSlug[];
}

export function getLegalMeta(slug: LegalSlug) {
    return legalRegistry[slug];
}

export function getLegalHref(locale: string, slug: LegalSlug) {
    return `/${locale}/legal/${slug}`;
}

export function getLegalDocsForFlow(flow: LegalFlow): LegalSlug[] {
    return getAllLegalSlugs().filter((slug) => {
        const requiredForFlow = legalRegistry[slug].requiredForFlow as readonly LegalFlow[];

        return requiredForFlow.includes(flow);
    });
}

export function getFooterLegalDocs(): LegalSlug[] {
    return getAllLegalSlugs().sort((a, b) => {
        const priorityA = legalRegistry[a].footerPriority ?? 999;
        const priorityB = legalRegistry[b].footerPriority ?? 999;

        return priorityA - priorityB;
    });
}