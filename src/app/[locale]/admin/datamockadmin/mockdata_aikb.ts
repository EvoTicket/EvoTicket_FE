export const aikbMockData = {
  kbItems: [
    {
      id: "KB-1042",
      title: "Chính sách hoàn tiền",
      category: "Refund / support",
      source: "Policy doc",
      status: "Published",
      updatedAt: "26/04/2026 14:01",
      editor: "@admin.thao",
      version: "v3",
      sourceFile: "policies/refund_v3.md",
      summary: "Hướng dẫn xử lý yêu cầu hoàn tiền trong 14 ngày kèm điều kiện áp dụng cho người mua và resale.",
      versionNote: "Cập nhật thời hạn hoàn tiền từ 7 ngày lên 14 ngày.",
      action: "Edit"
    },
    {
      id: "KB-1041",
      title: "Hướng dẫn check-in tại cổng",
      category: "Check-in",
      source: "FAQ",
      status: "Published",
      updatedAt: "25/04/2026 09:18",
      editor: "@admin.linh",
      action: "Edit"
    },
    {
      id: "KB-1040",
      title: "Chuyển nhượng vé NFT",
      category: "Ticket transfer",
      source: "Markdown",
      status: "Needs Review",
      updatedAt: "26/04/2026 10:42",
      editor: "@admin.huy",
      action: "Edit"
    },
    {
      id: "KB-1039",
      title: "Phương thức thanh toán hỗ trợ",
      category: "Payment",
      source: "FAQ",
      status: "Published",
      updatedAt: "23/04/2026 11:30",
      editor: "@admin.thao",
      action: "Edit"
    },
    {
      id: "KB-1038",
      title: "Cấu hình sự kiện cho organizer",
      category: "Organizer guide",
      source: "Imported PDF",
      status: "Draft",
      updatedAt: "26/04/2026 09:00",
      editor: "@admin.linh",
      action: "Edit"
    },
    {
      id: "KB-1037",
      title: "Lỗi khi đặt vé thường gặp",
      category: "Booking",
      source: "FAQ",
      status: "Disabled",
      updatedAt: "20/04/2026 16:44",
      editor: "@admin.huy",
      action: "Edit"
    },
  ],
  versions: [
    {
      v: "v3",
      status: "Published",
      isServing: true,
      desc: "Cập nhật thời hạn hoàn tiền từ 7 ngày lên 14 ngày, bổ sung điều kiện cho resale.",
      author: "@admin.thao",
      date: "26/04/2026 14:01",
      stats: "+24 dòng / -8 dòng · 3 mục được sửa"
    },
    {
      v: "v2",
      status: "Disabled",
      isServing: false,
      desc: "Bổ sung quy trình hoàn tiền cho thanh toán bị trùng.",
      author: "@admin.linh",
      date: "12/03/2026 10:18",
      stats: "+11 dòng / -2 dòng · 2 mục được sửa"
    },
    {
      v: "v1",
      status: "Disabled",
      isServing: false,
      desc: "Phiên bản khởi tạo từ tài liệu chính sách nội bộ.",
      author: "@admin.huy",
      date: "01/02/2026 09:00",
      stats: "Khởi tạo · 6 mục"
    }
  ],
  comparison: {
    old: "Hoàn tiền trong vòng 7 ngày kể từ ngày mua, không áp dụng cho vé resale.",
    new: "Hoàn tiền trong vòng 14 ngày kể từ ngày mua, áp dụng có điều kiện cho vé resale theo chính sách giá trần.",
    stats: "3 mục được sửa · 1 mục được thêm. Diff đầy đủ có trong audit log."
  },
  usageStats: {
    mostUsed: [
      { topic: "Chính sách hoàn tiền", usage: 1240, percentage: 95 },
      { topic: "Hướng dẫn check-in tại cổng", usage: 980, percentage: 75 },
      { topic: "Phương thức thanh toán hỗ trợ", usage: 740, percentage: 55 },
      { topic: "Chuyển nhượng vé NFT", usage: 420, percentage: 35 },
    ],
    highFallback: [
      { topic: "Chính sách giá trần resale", count: 41 },
      { topic: "Hoàn tiền cho vé bị check-in nhầm", count: 36 },
      { topic: "Lỗi mint NFT do gas relayer", count: 24 },
    ],
    lowConfidence: [
      { topic: "Chính sách resale cho organizer mới", confidence: 42, fallback: 32 },
      { topic: "Quy trình KYC cho ví ẩn danh", confidence: 48, fallback: 28 },
      { topic: "Cấu hình check-in offline", confidence: 51, fallback: 21 },
      { topic: "Royalty áp dụng cho resale chéo nền tảng", confidence: 55, fallback: 18 },
    ],
    poorPerformance: [
      { topic: "Cấu hình sự kiện cho organizer", confidence: 45, updated: "Hôm nay" },
      { topic: "Lỗi khi đặt vé thường gặp", confidence: 44, updated: "6 ngày trước" },
    ]
  }
};
