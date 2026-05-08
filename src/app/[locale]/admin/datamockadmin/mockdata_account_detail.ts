// mock data for account detail page
export interface IDocument {
  name: string;
  status: "Verified" | "Pending" | "Missing" | "Rejected";
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

export interface IActivity {
  timestamp: string;
  title: string;
  description: string;
  icon: "file" | "shield" | "calendar" | "paper";
}

export interface IProcessingHistory {
  timestamp: string;
  actor: string;
  action: string;
  note: string;
  actionType: "warning" | "info" | "system";
}

export interface IAccountDetail {
  id: string;
  name: string;
  type: "Organizer" | "Buyer";
  status: "Active" | "Pending Approval" | "Restricted" | "Suspended";
  registeredDate: string;
  stats: {
    verificationStatus: string;
    documentsSubmitted: number;
    totalDocuments: number;
    eventsCreated: number;
    pendingEvents: number;
    lastActive: string;
    riskLevel: "Low" | "Medium" | "High";
    riskReason: string;
  };
  profile: {
    representative: string;
    orgType: string;
    email: string;
    phone: string;
    taxId: string;
  };
  documents: IDocument[];
  payoutAccount: {
    bank: string;
    accountNumber: string;
    accountName: string;
    status: string;
  };
  operationalContext: {
    summary: {
      recentEventsCount: number;
      flaggedEventsCount: number;
      pendingPayoutCount: number;
      openSupportNotesCount: number;
    };
    recentEvents: IEventSummary[];
    adminLogs: IAdminLog[];
    activities: IActivity[];
    history: IProcessingHistory[];
  };
  adminContext: {
    internalNote: string;
    lastAction?: {
      adminUser: string;
      timestamp: string;
      description: string;
    };
  };
}