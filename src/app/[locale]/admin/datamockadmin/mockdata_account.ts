// mock data for account table in vi-VN language
export interface IAccountDetail {
  id: string;
  name: string;
  type: "Organizer" | "Buyer";
  status: "Active" | "Pending Approval" | "Restricted" | "Suspended";
  registeredDate: string;

  // Các chỉ số nhanh (Quick Stats)
  stats: {
    verificationStatus: string; // ví dụ: "Missing Documents"
    documentsSubmitted: number;
    totalDocuments: number;
    eventsCreated: number;
    pendingEvents: number;
    lastActive: string;
    riskLevel: "Low" | "Medium" | "High";
    riskReason?: string;
  };
  // Thông tin hồ sơ (Profile)
  profile: {
    representative: string;
    orgType: string;
    email: string;
    phone: string;
    taxId: string;
  };
  // Danh sách hồ sơ tài liệu
  documents: IDocument[];
  // Tài khoản thanh toán (Payout)
  payoutAccount: {
    bank: string;
    accountNumber: string;
    accountName: string;
    verificationStatus: string;
  };
  // Bối cảnh vận hành (Platform Context)
  operationalContext: {
    recentEvents: IEventSummary[];
    adminLogs: IAdminLog[];
    summary: {
      recentEventsCount: number;
      flaggedEventsCount: number;
      pendingPayoutCount: number;
      openSupportNotesCount: number;
    };
  };
  // Ghi chú nội bộ của Admin
  adminContext: {
    internalNote: string;
    lastAction?: {
      adminUser: string;
      timestamp: string;
      description: string;
    };
  };
}
export interface IDocument {
  name: string;
  status: "Verified" | "Pending" | "Missing" | "Rejected";
  fileUrl?: string;
}
export interface IEventSummary {
  id: string;
  name: string;
  date: string;
  status: string;
  isFlagged: boolean;
}
export interface IAdminLog {
  user: string;
  timestamp: string;
  content: string;
  role: "support" | "moderation";
}