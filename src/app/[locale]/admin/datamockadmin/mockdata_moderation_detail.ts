export interface IModerationDetail {
  id: string;
  name: string;
  organizer: {
    id: string;
    name: string;
    status: "Verified" | "Pending Approval" | "Rejected";
    stats: {
      totalEvents: number;
      rejectedEvents: number;
      last30DaysSubmissions: number;
      activeNotes: number;
    };
    recentEvents: Array<{
      id: string;
      name: string;
      date: string;
      status: "Approved" | "Completed" | "Needs Edit" | "Rejected";
    }>;
  };
  reviewStatus: "Pending Review" | "Flagged" | "Rejected" | "Approved";
  priority: "High" | "Medium" | "Low";
  submittedAt: string;
  reviewTimeElapsed: string;
  slaTarget: string;
  
  // Content Tab
  content: {
    category: string;
    type: "Offline" | "Online";
    location: string;
    time: string;
    shortDescription: string;
    images: {
      poster: string;
      cover: string;
      lineup: string;
    };
    sessions: Array<{
      name: string;
      time: string;
      location: string;
      capacity: string;
      ticketsSold: number;
    }>;
    tickets: Array<{
      type: string;
      price: string;
      quantity: string;
    }>;
  };

  // Risk & Policy Tab
  riskAnalysis: Array<{
    id: string;
    title: string;
    description: string;
    status: "Pass" | "Warning" | "Info";
  }>;

  // History Tab
  history: Array<{
    id: string;
    date: string;
    time: string;
    type: "Note" | "Warning" | "Submission" | "Upload" | "Decision";
    title: string;
    description: string;
    user?: {
      name: string;
      role: string;
    };
  }>;

  // Reviewer info
  reviewer?: {
    name: string;
    role: string;
    assignedAt: string;
  };
}

export const moderationDetailMock: IModerationDetail = {
  id: "EVT-20416",
  name: "Anh Trai Say Hi Concert 2026",
  organizer: {
    id: "ACC-10245",
    name: "Công ty TNHH Sự kiện Ánh Dương",
    status: "Pending Approval",
    stats: {
      totalEvents: 3,
      rejectedEvents: 0,
      last30DaysSubmissions: 4,
      activeNotes: 2
    },
    recentEvents: [
      { id: "EVT-20381", name: "Ánh Dương Music Night", date: "23/03/2026", status: "Approved" },
      { id: "EVT-20352", name: "Workshop UX cho doanh nghiệp", date: "10/03/2026", status: "Completed" },
      { id: "EVT-20320", name: "Lễ hội đường phố Hà Đông", date: "22/02/2026", status: "Needs Edit" }
    ]
  },
  reviewStatus: "Pending Review",
  priority: "High",
  submittedAt: "25/04 09:12",
  reviewTimeElapsed: "1 giờ 12 phút",
  slaTarget: "< 2 giờ",
  
  content: {
    category: "Âm nhạc • Concert",
    type: "Offline",
    location: "Sân vận động Mỹ Đình",
    time: "12/06/2026 — 13/06/2026 • 19:30",
    shortDescription: "Hai đêm đại nhạc hội quy tụ dàn nghệ sĩ Anh Trai Say Hi với hệ thống sân khấu 360°, hiệu ứng ánh sáng quốc tế. Liên hệ Zalo 0909.xxx.xxx để được hỗ trợ riêng.",
    images: {
      poster: "Poster",
      cover: "Cover",
      lineup: "Lineup card"
    },
    sessions: [
      { name: "Đêm 1 • Đại nhạc hội", time: "12/06/2026 19:30", location: "Sân vận động Mỹ Đình", capacity: "38.000", ticketsSold: 4 },
      { name: "Đêm 2 • Đại nhạc hội", time: "13/06/2026 19:30", location: "Sân vận động Mỹ Đình", capacity: "38.000", ticketsSold: 4 }
    ],
    tickets: [
      { type: "Standing", price: "₫1,200,000", quantity: "12.000 vé" },
      { type: "Premium", price: "₫2,200,000", quantity: "8.000 vé" },
      { type: "VIP", price: "₫3,800,000", quantity: "4.000 vé" },
      { type: "SVIP", price: "₫5,800,000", quantity: "800 vé" }
    ]
  },

  riskAnalysis: [
    { id: "r1", title: "Định dạng & kích thước asset", description: "Banner 1920x1080, JPG — đạt chuẩn", status: "Pass" },
    { id: "r2", title: "Thông tin liên hệ ngoài", description: "Phát hiện số Zalo cá nhân trong mô tả", status: "Warning" },
    { id: "r3", title: "Nội dung gây hiểu lầm", description: "Tiêu đề và mô tả thống nhất", status: "Pass" },
    { id: "r4", title: "Xác minh tổ chức", description: "Tổ chức đang ở trạng thái Pending Approval", status: "Warning" },
    { id: "r5", title: "Sự kiện nhạy cảm với resale", description: "Cấu hình resale 110% mệnh giá — cần theo dõi", status: "Info" },
    { id: "r6", title: "Mẫu giao dịch đáng ngờ", description: "Không phát hiện giao dịch test bất thường", status: "Pass" }
  ],

  history: [
    { id: "h1", date: "25/04/2026", time: "10:18", type: "Note", title: "Internal note added by admin", description: "admin.linh: cần xác nhận lại số điện thoại liên hệ trong mô tả." },
    { id: "h2", date: "25/04/2026", time: "09:42", type: "Warning", title: "Contact info warning detected", description: "Hệ thống phát hiện liên hệ Zalo cá nhân trong phần mô tả sự kiện." },
    { id: "h3", date: "25/04/2026", time: "09:12", type: "Submission", title: "Event submitted for review", description: "Tổ chức gửi sự kiện vào hàng đợi kiểm duyệt với mức ưu tiên High." },
    { id: "h4", date: "24/04/2026", time: "22:34", type: "Upload", title: "Asset uploaded", description: "Banner và poster được tải lên — tự động đạt kiểm tra định dạng." }
  ],

  reviewer: {
    name: "admin.linh",
    role: "Senior Moderator",
    assignedAt: "25/04 10:18"
  }
};
