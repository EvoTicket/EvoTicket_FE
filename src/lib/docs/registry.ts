/**
 * @file src/lib/docs/registry.ts
 *
 * Registry trung tâm cho toàn bộ tài liệu MDX của EvoTicket:
 * - legal: src/content/legal/<locale>/<slug>.mdx
 * - help: src/content/help/<locale>/<slug>.mdx
 * - about: src/content/about/<locale>/index.mdx
 */

export const SUPPORTED_LOCALES = ["vi", "en"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type DocType = "legal" | "help" | "about";

export type LocalizedText = Record<SupportedLocale, string>;

export type RegistryDocMeta = {
  title: LocalizedText;
  shortTitle: LocalizedText;
  description: LocalizedText;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
};

export type PublicDocMeta = {
  title: string;
  shortTitle: string;
  description: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
};

export function normalizeLocale(locale: string): SupportedLocale {
  return locale === "en" ? "en" : "vi";
}

// ─── Legal ─────────────────────────────────────────────────────────────────────

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

export type LegalRegistryItem = RegistryDocMeta & {
  type: "legal";
  category: LegalCategory;
  requiredForFlow: readonly LegalFlow[];
  footerPriority?: number;
};

export type HelpCategory = "faq" | "help-center";

export type HelpRegistryItem = RegistryDocMeta & {
  type: "help";
  category: HelpCategory;
  footerPriority?: number;
};

export type AboutRegistryItem = RegistryDocMeta & {
  type: "about";
  footerPriority?: number;
};

export type AnyRegistryItem =
  | LegalRegistryItem
  | HelpRegistryItem
  | AboutRegistryItem;

export type LocalizedRegistryItem<T extends AnyRegistryItem> =
  Omit<T, keyof RegistryDocMeta> & PublicDocMeta;

function localizeMeta<T extends AnyRegistryItem>(
  item: T,
  locale: string
): LocalizedRegistryItem<T> {
  const safeLocale = normalizeLocale(locale);

  return {
    ...item,
    title: item.title[safeLocale],
    shortTitle: item.shortTitle[safeLocale],
    description: item.description[safeLocale],
    version: item.version,
    effectiveDate: item.effectiveDate,
    lastUpdated: item.lastUpdated,
  } as LocalizedRegistryItem<T>;
}

// ─── Registry entries ──────────────────────────────────────────────────────────

export const legalRegistry = {
  "terms-of-use": {
    type: "legal",
    title: {
      vi: "Điều khoản sử dụng EvoTicket",
      en: "EvoTicket Terms of Use",
    },
    shortTitle: {
      vi: "Điều khoản sử dụng",
      en: "Terms of Use",
    },
    description: {
      vi: "Quy định chung về việc truy cập, sử dụng tài khoản, đặt vé, thanh toán, bán lại vé, Dynamic QR, AI chatbot và các tính năng blockchain/NFT trên nền tảng EvoTicket.",
      en: "General rules for accessing EvoTicket, using accounts, booking tickets, making payments, reselling tickets, using Dynamic QR, AI chatbot, and blockchain/NFT-related features.",
    },
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
    type: "legal",
    title: {
      vi: "Chính sách bảo mật và xử lý dữ liệu cá nhân",
      en: "Privacy and Personal Data Processing Policy",
    },
    shortTitle: {
      vi: "Chính sách bảo mật",
      en: "Privacy Policy",
    },
    description: {
      vi: "Mô tả cách EvoTicket thu thập, sử dụng, lưu trữ, bảo vệ và chia sẻ dữ liệu cá nhân của người mua vé, ban tổ chức, checker và người dùng các tính năng thanh toán, resale, Dynamic QR, AI chatbot và blockchain/NFT.",
      en: "Explains how EvoTicket collects, uses, stores, protects, and shares personal data of buyers, organizers, checkers, and users of payment, resale, Dynamic QR, AI chatbot, and blockchain/NFT features.",
    },
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
    type: "legal",
    title: {
      vi: "Điều kiện giao dịch chung",
      en: "General Transaction Conditions",
    },
    shortTitle: {
      vi: "Điều kiện giao dịch chung",
      en: "Transaction Conditions",
    },
    description: {
      vi: "Quy định về điều kiện giao kết, xác nhận giao dịch, trách nhiệm của các bên, bằng chứng giao dịch và quy trình xử lý trong các giao dịch trên EvoTicket.",
      en: "Rules on transaction formation, confirmation, responsibilities of parties, transaction evidence, and processing procedures for transactions on EvoTicket.",
    },
    category: "transaction",
    version: "1.0.0",
    effectiveDate: "2026-06-04",
    lastUpdated: "2026-06-04",
    requiredForFlow: ["primary-checkout", "resale-checkout", "payment"],
    footerPriority: 4,
  },

  "ticket-policy": {
    type: "legal",
    title: {
      vi: "Chính sách vé",
      en: "Ticket Policy",
    },
    shortTitle: {
      vi: "Chính sách vé",
      en: "Ticket Policy",
    },
    description: {
      vi: "Quy định về phát hành vé, trạng thái vé, Dynamic QR, quyền sử dụng vé, kiểm tra vé, check-in và trách nhiệm bảo quản mã vé.",
      en: "Rules on ticket issuance, ticket statuses, Dynamic QR, ticket usage rights, ticket verification, check-in, and user responsibility for safeguarding ticket codes.",
    },
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
    type: "legal",
    title: {
      vi: "Chính sách thanh toán",
      en: "Payment Policy",
    },
    shortTitle: {
      vi: "Chính sách thanh toán",
      en: "Payment Policy",
    },
    description: {
      vi: "Quy định về phương thức thanh toán, xác nhận giao dịch, lỗi thanh toán, đối soát và trách nhiệm liên quan đến các cổng thanh toán được tích hợp trên EvoTicket.",
      en: "Rules on payment methods, transaction confirmation, payment errors, reconciliation, and responsibilities related to payment gateways integrated with EvoTicket.",
    },
    category: "payment",
    version: "1.0.0",
    effectiveDate: "2026-06-04",
    lastUpdated: "2026-06-04",
    requiredForFlow: ["primary-checkout", "resale-checkout", "payment"],
    footerPriority: 6,
  },

  "refund-policy": {
    type: "legal",
    title: {
      vi: "Chính sách hoàn tiền, hủy, hoãn và thay đổi sự kiện",
      en: "Refund, Cancellation, Postponement and Event Change Policy",
    },
    shortTitle: {
      vi: "Chính sách hoàn tiền",
      en: "Refund Policy",
    },
    description: {
      vi: "Quy định về các trường hợp hoàn tiền, không hoàn tiền, xử lý lỗi thanh toán, lỗi phát hành vé, sự kiện bị hủy, hoãn, thay đổi thời gian/địa điểm và các tình huống liên quan đến vé đã check-in hoặc vé đã bán lại.",
      en: "Rules on refundable and non-refundable cases, payment errors, ticket issuance errors, cancelled, postponed, rescheduled or relocated events, checked-in tickets, and resold tickets.",
    },
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
    type: "legal",
    title: {
      vi: "Cơ chế giải quyết tranh chấp và khiếu nại",
      en: "Dispute and Complaint Resolution Mechanism",
    },
    shortTitle: {
      vi: "Giải quyết tranh chấp",
      en: "Dispute Resolution",
    },
    description: {
      vi: "Mô tả quy trình tiếp nhận, phân loại, xử lý và phản hồi khiếu nại hoặc tranh chấp phát sinh giữa người mua, ban tổ chức, checker, cổng thanh toán và nền tảng EvoTicket.",
      en: "Describes the process for receiving, classifying, handling, and responding to complaints or disputes involving buyers, organizers, checkers, payment gateways, and EvoTicket.",
    },
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
    type: "legal",
    title: {
      vi: "Chính sách bán lại và chuyển nhượng vé",
      en: "Ticket Resale and Transfer Policy",
    },
    shortTitle: {
      vi: "Chính sách bán lại vé",
      en: "Resale Policy",
    },
    description: {
      vi: "Quy định về điều kiện đăng bán lại vé, giới hạn giá bán lại, khóa QR khi listing, chuyển quyền sở hữu, trách nhiệm của người bán/người mua và xử lý tranh chấp resale.",
      en: "Rules on ticket resale eligibility, resale price limits, QR locking during listing, ownership transfer, responsibilities of sellers and buyers, and resale dispute handling.",
    },
    category: "resale",
    version: "1.0.0",
    effectiveDate: "2026-06-04",
    lastUpdated: "2026-06-04",
    requiredForFlow: ["resale-listing", "resale-checkout", "my-ticket"],
    footerPriority: 8,
  },

  "organizer-terms": {
    type: "legal",
    title: {
      vi: "Điều khoản dành cho ban tổ chức",
      en: "Organizer Terms",
    },
    shortTitle: {
      vi: "Điều khoản ban tổ chức",
      en: "Organizer Terms",
    },
    description: {
      vi: "Quy định về đăng ký ban tổ chức, xác minh thông tin, tạo và quản lý sự kiện, trách nhiệm cung cấp thông tin, chất lượng sự kiện, đối soát doanh thu và xử lý tranh chấp.",
      en: "Rules on organizer registration, verification, event creation and management, information accuracy, event quality, revenue reconciliation, and dispute handling.",
    },
    category: "organizer",
    version: "1.0.0",
    effectiveDate: "2026-06-04",
    lastUpdated: "2026-06-04",
    requiredForFlow: ["organizer-onboarding"],
    footerPriority: 9,
  },

  "ai-chatbot-policy": {
    type: "legal",
    title: {
      vi: "Chính sách sử dụng AI chatbot",
      en: "AI Chatbot Policy",
    },
    shortTitle: {
      vi: "Chính sách AI chatbot",
      en: "AI Chatbot Policy",
    },
    description: {
      vi: "Quy định về phạm vi hỗ trợ của AI chatbot, giới hạn trách nhiệm, dữ liệu được sử dụng trong quá trình hỏi đáp và nguyên tắc không xem câu trả lời AI là cam kết pháp lý tuyệt đối.",
      en: "Rules on the scope of AI chatbot assistance, limitations of responsibility, data used during conversations, and the principle that AI responses are not absolute legal commitments.",
    },
    category: "ai",
    version: "1.0.0",
    effectiveDate: "2026-06-04",
    lastUpdated: "2026-06-04",
    requiredForFlow: ["ai-chatbot", "help"],
    footerPriority: 10,
  },

  "blockchain-nft-policy": {
    type: "legal",
    title: {
      vi: "Chính sách NFT, blockchain và tài sản số",
      en: "NFT, Blockchain and Digital Asset Policy",
    },
    shortTitle: {
      vi: "Chính sách NFT",
      en: "NFT Policy",
    },
    description: {
      vi: "Quy định về vai trò của NFT, blockchain, custodial wallet, provenance, tokenId, transaction hash, chuyển quyền sở hữu và giới hạn trách nhiệm liên quan đến tài sản số trên EvoTicket.",
      en: "Rules on the role of NFTs, blockchain, custodial wallets, provenance, token IDs, transaction hashes, ownership transfers, and limitations of responsibility related to digital assets on EvoTicket.",
    },
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

export const helpRegistry = {
  faq: {
    type: "help",
    title: {
      vi: "Câu hỏi thường gặp",
      en: "Frequently Asked Questions",
    },
    shortTitle: {
      vi: "FAQ",
      en: "FAQ",
    },
    description: {
      vi: "Tổng hợp các câu hỏi và giải đáp phổ biến nhất từ người dùng EvoTicket.",
      en: "A collection of common questions and answers for EvoTicket users.",
    },
    category: "faq",
    version: "1.0.0",
    effectiveDate: "2026-06-04",
    lastUpdated: "2026-06-04",
    footerPriority: 2,
  },

  "help-center": {
    type: "help",
    title: {
      vi: "Trung tâm trợ giúp",
      en: "Help Center",
    },
    shortTitle: {
      vi: "Trung tâm trợ giúp",
      en: "Help Center",
    },
    description: {
      vi: "Hướng dẫn sử dụng, chính sách hỗ trợ và kênh liên hệ của EvoTicket.",
      en: "Guides, support policies, and contact channels for EvoTicket users.",
    },
    category: "help-center",
    version: "1.0.0",
    effectiveDate: "2026-06-04",
    lastUpdated: "2026-06-04",
    footerPriority: 1,
  },
} as const satisfies Record<string, HelpRegistryItem>;

export const aboutRegistry = {
  about: {
    type: "about",
    title: {
      vi: "Giới thiệu EvoTicket",
      en: "About EvoTicket",
    },
    shortTitle: {
      vi: "Về EvoTicket",
      en: "About",
    },
    description: {
      vi: "Giới thiệu mô hình nền tảng, mục tiêu và các cơ chế giúp EvoTicket tăng tính tin cậy, minh bạch và thuận tiện trong vòng đời vé điện tử.",
      en: "An introduction to EvoTicket’s platform model, goals, and mechanisms for improving trust, transparency, and convenience across the digital ticket lifecycle.",
    },
    version: "1.0.0",
    effectiveDate: "2026-06-04",
    lastUpdated: "2026-06-04",
    footerPriority: 1,
  },
} as const satisfies Record<string, AboutRegistryItem>;

// ─── Slug types ────────────────────────────────────────────────────────────────

export type LegalSlug = keyof typeof legalRegistry;
export type HelpSlug = keyof typeof helpRegistry;
export type AboutSlug = keyof typeof aboutRegistry;
export type AnyDocSlug = LegalSlug | HelpSlug | AboutSlug;

// ─── Type guards ───────────────────────────────────────────────────────────────

export function isLegalSlug(slug: string): slug is LegalSlug {
  return slug in legalRegistry;
}

export function isHelpSlug(slug: string): slug is HelpSlug {
  return slug in helpRegistry;
}

export function isAboutSlug(slug: string): slug is AboutSlug {
  return slug in aboutRegistry;
}

// ─── Raw meta accessors ────────────────────────────────────────────────────────

export function getRawLegalMeta(slug: LegalSlug): LegalRegistryItem {
  return legalRegistry[slug];
}

export function getRawHelpMeta(slug: HelpSlug): HelpRegistryItem {
  return helpRegistry[slug];
}

export function getRawAboutMeta(slug: AboutSlug): AboutRegistryItem {
  return aboutRegistry[slug];
}

// ─── Localized meta accessors ──────────────────────────────────────────────────

export function getLegalMeta(
  slug: LegalSlug,
  locale: string = "vi"
): LocalizedRegistryItem<LegalRegistryItem> {
  return localizeMeta(legalRegistry[slug], locale);
}

export function getHelpMeta(
  slug: HelpSlug,
  locale: string = "vi"
): LocalizedRegistryItem<HelpRegistryItem> {
  return localizeMeta(helpRegistry[slug], locale);
}

export function getAboutMeta(
  slug: AboutSlug = "about",
  locale: string = "vi"
): LocalizedRegistryItem<AboutRegistryItem> {
  return localizeMeta(aboutRegistry[slug], locale);
}

// ─── Slug lists ────────────────────────────────────────────────────────────────

export function getAllLegalSlugs(): LegalSlug[] {
  return Object.keys(legalRegistry) as LegalSlug[];
}

export function getAllHelpSlugs(): HelpSlug[] {
  return Object.keys(helpRegistry) as HelpSlug[];
}

export function getAllAboutSlugs(): AboutSlug[] {
  return Object.keys(aboutRegistry) as AboutSlug[];
}

// ─── Href helpers ──────────────────────────────────────────────────────────────

export function getLegalHref(locale: string, slug: LegalSlug): string {
  return `/${normalizeLocale(locale)}/legal/${slug}`;
}

export function getHelpHref(locale: string, slug: HelpSlug): string {
  return `/${normalizeLocale(locale)}/help/${slug}`;
}

export function getAboutHref(locale: string): string {
  return `/${normalizeLocale(locale)}/about`;
}

// ─── Content path helpers ──────────────────────────────────────────────────────

export function getLegalContentPath(
  locale: string,
  slug: LegalSlug
): string {
  return `legal/${normalizeLocale(locale)}/${slug}.mdx`;
}

export function getHelpContentPath(locale: string, slug: HelpSlug): string {
  return `help/${normalizeLocale(locale)}/${slug}.mdx`;
}

export function getAboutContentPath(locale: string): string {
  return `about/${normalizeLocale(locale)}/index.mdx`;
}

// ─── Flow helpers ──────────────────────────────────────────────────────────────

export function getLegalDocsForFlow(flow: LegalFlow): LegalSlug[] {
  return getAllLegalSlugs().filter((slug) => {
    const required = legalRegistry[slug].requiredForFlow as readonly LegalFlow[];
    return required.includes(flow);
  });
}

// ─── Footer helpers ────────────────────────────────────────────────────────────

export function getFooterLegalDocs(): LegalSlug[] {
  return getAllLegalSlugs().sort((a, b) => {
    return (
      (legalRegistry[a].footerPriority ?? 999) -
      (legalRegistry[b].footerPriority ?? 999)
    );
  });
}

export function getFooterHelpDocs(): HelpSlug[] {
  return getAllHelpSlugs().sort((a, b) => {
    return (
      (helpRegistry[a].footerPriority ?? 999) -
      (helpRegistry[b].footerPriority ?? 999)
    );
  });
}

export function getFooterAboutDocs(): AboutSlug[] {
  return getAllAboutSlugs().sort((a, b) => {
    return (
      (aboutRegistry[a].footerPriority ?? 999) -
      (aboutRegistry[b].footerPriority ?? 999)
    );
  });
}
