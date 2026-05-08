export interface IModerationFlag {
  reason: string;
  description: string;
  type: "warning" | "danger" | "info" | "secondary";
}

export interface IModerationItem {
  id: string;
  name: string;
  organizer: {
    name: string;
    id: string;
  };
  submittedAt: string;
  category: string;
  reviewStatus: "Pending Review" | "Flagged" | "Rejected" | "Needs Edit";
  priority: "High" | "Medium" | "Low";
  flags: IModerationFlag[];
}

export interface IModerationData {
  stats: {
    pending: number;
    flagged: number;
    rejected: number;
    highRisk: number;
  };
  tabs: {
    pending: number;
    flagged: number;
    rejected: number;
  };
  items: IModerationItem[];
  triageGuide: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    color: "sky" | "amber" | "rose" | "indigo";
  }>;
  sla: {
    high: { target: string; current: string; color: "emerald" | "amber" | "rose" };
    medium: { target: string; current: string; color: "emerald" | "amber" | "rose" };
    low: { target: string; current: string; color: "emerald" | "amber" | "rose" };
  };
}

export const moderationMockData: IModerationData = {
  stats: {
    pending: 14,
    flagged: 5,
    rejected: 9,
    highRisk: 3
  },
  tabs: {
    pending: 6,
    flagged: 5,
    rejected: 5
  },
  items: [
    {
      id: "EVT-20416",
      name: "Tech Future Summit 2026",
      organizer: { name: "Công ty TNHH Sự kiện Ánh Dương", id: "ACC-10245" },
      submittedAt: "25/04 09:12",
      category: "Hội thảo",
      reviewStatus: "Pending Review",
      priority: "High",
      flags: [
        { reason: "Thiếu xác minh", description: "Tổ chức chưa hoàn tất KYC", type: "warning" }
      ]
    },
    {
      id: "EVT-20415",
      name: "Lễ hội ẩm thực Đà Lạt 2026",
      organizer: { name: "DaLat Tourism", id: "ACC-10241" },
      submittedAt: "25/04 08:40",
      category: "Lễ hội",
      reviewStatus: "Pending Review",
      priority: "Medium",
      flags: []
    },
    {
      id: "EVT-20414",
      name: "Hội thảo Web3 Builders",
      organizer: { name: "Builder DAO", id: "ACC-10243" },
      submittedAt: "24/04 22:05",
      category: "Hội thảo",
      reviewStatus: "Flagged",
      priority: "High",
      flags: [
        { reason: "Tổ chức rủi ro", description: "Tổ chức mới - có link liên hệ ngoài hệ thống", type: "danger" },
        { reason: "Thông tin liên hệ ngoài", description: "Link Zalo/Telegram trong mô tả", type: "info" }
      ]
    },
    {
      id: "EVT-20413",
      name: "Giải chạy Marathon Hà Nội",
      organizer: { name: "HN Sports JSC", id: "ACC-10239" },
      submittedAt: "24/04 18:33",
      category: "Thể thao",
      reviewStatus: "Pending Review",
      priority: "Medium",
      flags: []
    },
    {
      id: "EVT-20410",
      name: "Đêm nhạc Acoustic Sài Gòn",
      organizer: { name: "VBC Entertainment", id: "ACC-10245" },
      submittedAt: "24/04 09:05",
      category: "Âm nhạc",
      reviewStatus: "Pending Review",
      priority: "Low",
      flags: []
    },
    {
      id: "EVT-20407",
      name: "Workshop Yoga & Wellness",
      organizer: { name: "Greenline Outdoor", id: "ACC-10214" },
      submittedAt: "23/04 17:20",
      category: "Workshop",
      reviewStatus: "Pending Review",
      priority: "Low",
      flags: [
        { reason: "Asset không hợp lệ", description: "Banner chưa đạt độ phân giải tối thiểu", type: "warning" }
      ]
    },
    {
      id: "EVT-20405",
      name: "Đại nhạc hội EDM 2026",
      organizer: { name: "Mega Event", id: "ACC-10250" },
      submittedAt: "22/04 14:10",
      category: "Âm nhạc",
      reviewStatus: "Rejected",
      priority: "High",
      flags: [
        { reason: "Nội dung cấm", description: "Vi phạm chính sách an toàn công cộng", type: "danger" }
      ]
    },
    {
      id: "EVT-20402",
      name: "Triển lãm Art Tech",
      organizer: { name: "Art Hub", id: "ACC-10255" },
      submittedAt: "21/04 11:45",
      category: "Triển lãm",
      reviewStatus: "Needs Edit",
      priority: "Medium",
      flags: [
        { reason: "Thiếu mô tả", description: "Cần bổ sung thông tin nghệ sĩ tham gia", type: "info" }
      ]
    }
  ],
  triageGuide: [
    {
      id: "tg-1",
      title: "Asset compliance",
      description: "Kiểm tra banner, ảnh, video — đảm bảo không vi phạm bản quyền và đạt chuẩn kỹ thuật.",
      icon: "Image",
      color: "sky"
    },
    {
      id: "tg-2",
      title: "Nội dung cấm",
      description: "Đối chiếu mô tả với danh sách nội dung cấm: bạo lực, chính trị nhạy cảm, lừa đảo tài chính.",
      icon: "ShieldAlert",
      color: "amber"
    },
    {
      id: "tg-3",
      title: "Lịch sử tổ chức rủi ro",
      description: "Xem trước lịch sử tổ chức: từng bị từ chối, bị flag, hoặc tạm ngừng trong 90 ngày.",
      icon: "UserX",
      color: "rose"
    },
    {
      id: "tg-4",
      title: "Thiếu xác minh tổ chức",
      description: "Tổ chức cần Verified KYC trước khi sự kiện được phép phát hành vé công khai.",
      icon: "Clock",
      color: "amber"
    },
    {
      id: "tg-5",
      title: "Liên hệ ngoài hệ thống",
      description: "Cảnh giác với link Zalo / Telegram / số điện thoại cá nhân trong mô tả sự kiện.",
      icon: "Link2",
      color: "sky"
    }
  ],
  sla: {
    high: { target: "< 2 giờ", current: "46 phút", color: "emerald" },
    medium: { target: "< 8 giờ", current: "3 giờ 22 phút", color: "emerald" },
    low: { target: "< 24 giờ", current: "14 giờ 08 phút", color: "amber" }
  }
};
