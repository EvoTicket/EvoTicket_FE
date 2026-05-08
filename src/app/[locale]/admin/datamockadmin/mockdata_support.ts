// Centralized mock data for Support & Lookup module (ADM-04)
// This object follows the structure required for the Admin Support Dashboard

export const supportMockData = {
  stats: {
    transactions: [
      { label: "Tổng kết quả", value: "2,184", color: "gray", icon: "FileText" },
      { label: "Thanh toán chờ", value: "42", color: "amber", icon: "CreditCard" },
      { label: "Mint đang chờ", value: "18", color: "indigo", icon: "Ticket" },
      { label: "Nhật ký lỗi", value: "7", color: "rose", icon: "AlertCircle" },
    ],
    tickets: [
      { label: "Tổng số vé", value: "6,028", color: "gray", icon: "Ticket" },
      { label: "Vé đang hiệu lực", value: "5,842", color: "emerald", icon: "ShieldCheck" },
      { label: "Đã check-in", value: "1,204", color: "indigo", icon: "CheckCircle2" },
      { label: "Đang rao bán", value: "85", color: "amber", icon: "Zap" },
    ],
    cases: [
      { label: "Tổng số case", value: "318", color: "gray", icon: "MessageSquare" },
      { label: "Đang chờ xử lý", value: "12", color: "amber", icon: "Clock" },
      { label: "Cần hỗ trợ gấp", value: "4", color: "rose", icon: "AlertCircle" },
      { label: "Thời gian phản hồi", value: "14m", color: "sky", icon: "Zap" },
    ],
  },
  transactions: [
    { 
      id: "ORD-220456", 
      buyer: "Nguyễn Hoàng Anh", 
      email: "anh.nh@gmail.com", 
      event: "Anh Trai Say Hi Concert 2026", 
      amount: "₫4,400,000", 
      payment: "Success", 
      mint: "Mint Pending", 
      updatedAt: "25/04 09:18" 
    },
    { 
      id: "ORD-220448", 
      buyer: "Trần Mỹ Linh", 
      email: "linh.tran@outlook.com", 
      event: "Đêm nhạc Acoustic Sài Gòn", 
      amount: "₫1,200,000", 
      payment: "Pending", 
      mint: "Not started", 
      updatedAt: "25/04 08:42" 
    },
    { 
      id: "ORD-220431", 
      buyer: "Phạm Quốc Đạt", 
      email: "dat.pq@yahoo.com", 
      event: "Lễ hội ẩm thực Đà Lạt 2026", 
      amount: "₫850,000", 
      payment: "Failed", 
      mint: "Not started", 
      updatedAt: "25/04 07:55" 
    },
    { 
      id: "ORD-220422", 
      buyer: "Lê Thanh Hà", 
      email: "ha.le@protonmail.com", 
      event: "Workshop UX cho doanh nghiệp", 
      amount: "₫620,000", 
      payment: "Success", 
      mint: "Minted", 
      updatedAt: "25/04 07:14" 
    },
    { 
      id: "ORD-220411", 
      buyer: "Đặng Thu Thảo", 
      email: "thao.dt@gmail.com", 
      event: "Anh Trai Say Hi Concert 2026", 
      amount: "₫2,200,000", 
      payment: "Success", 
      mint: "Mint Failed", 
      updatedAt: "24/04 23:48" 
    },
    { 
      id: "ORD-220402", 
      buyer: "Vũ Khánh Linh", 
      email: "linh.vu@gmail.com", 
      event: "Hội thảo Web3 Builders", 
      amount: "₫350,000", 
      payment: "Expired", 
      mint: "Not started", 
      updatedAt: "24/04 22:31" 
    },
    { 
      id: "ORD-220389", 
      buyer: "Bùi Quang Minh", 
      email: "minh.bq@gmail.com", 
      event: "Giải chạy Marathon Hà Nội", 
      amount: "₫500,000", 
      payment: "Cancelled", 
      mint: "Not started", 
      updatedAt: "24/04 19:02" 
    },
  ],
  tickets: [
    {
      id: "TIX-998120",
      owner: "Nguyễn Hoàng Anh",
      ownerType: "Buyer gốc",
      event: "Anh Trai Say Hi Concert 2026",
      tier: "VIP",
      access: "Active",
      checkin: "Not yet",
      activity: "25/04 09:18 • Mua mới"
    },
    {
      id: "TIX-998119",
      owner: "Phạm Quốc Đạt",
      ownerType: "Resale market",
      event: "Anh Trai Say Hi Concert 2026",
      tier: "Premium",
      access: "Resold",
      checkin: "—",
      activity: "24/04 22:01 • Resale 110%"
    },
    {
      id: "TIX-998112",
      owner: "Lê Thanh Hà",
      ownerType: "Buyer gốc",
      event: "Workshop UX cho doanh nghiệp",
      tier: "Standard",
      access: "Used",
      checkin: "Checked-in",
      activity: "23/04 13:42 • Check-in"
    },
    {
      id: "TIX-998104",
      owner: "Đặng Thu Thảo",
      ownerType: "Buyer gốc",
      event: "Anh Trai Say Hi Concert 2026",
      tier: "Premium",
      access: "Locked",
      checkin: "—",
      activity: "24/04 23:50 • Mint thất bại"
    },
    {
      id: "TIX-998095",
      owner: "Vũ Khánh Linh",
      ownerType: "Buyer gốc",
      event: "Hội thảo Web3 Builders",
      tier: "Standard",
      access: "Refunded",
      checkin: "—",
      activity: "23/04 09:11 • Hoàn tiền"
    },
    {
      id: "TIX-998088",
      owner: "Bùi Quang Minh",
      ownerType: "Buyer gốc",
      event: "Giải chạy Marathon Hà Nội",
      tier: "Standard",
      access: "Active",
      checkin: "Denied",
      activity: "24/04 06:30 • Check-in từ chối"
    },
  ],
  cases: [
    {
      id: "CASE-50421",
      subject: "Vé không mint sau thanh toán",
      user: "Đặng Thu Thảo",
      email: "thao.dt@gmail.com",
      event: "Anh Trai Say Hi Concert 2026",
      priority: "High",
      status: "Escalated",
      assignee: "@admin.linh",
      updatedAt: "25/04 10:02"
    },
    {
      id: "CASE-50418",
      subject: "Yêu cầu hoàn tiền do trùng vé",
      user: "Nguyễn Hoàng Anh",
      email: "anh.nh@gmail.com",
      event: "Đêm nhạc Acoustic Sài Gòn",
      priority: "Medium",
      status: "In Progress",
      assignee: "@support.minh",
      updatedAt: "25/04 09:30"
    },
    {
      id: "CASE-50410",
      subject: "Phát hiện resale vượt giới hạn",
      user: "Phạm Quốc Đạt",
      email: "dat.pq@yahoo.com",
      event: "Anh Trai Say Hi Concert 2026",
      priority: "High",
      status: "Open",
      assignee: "Chưa gán",
      updatedAt: "25/04 08:50"
    },
    {
      id: "CASE-50402",
      subject: "Không nhận được email xác nhận",
      user: "Lê Thanh Hà",
      email: "ha.le@protonmail.com",
      event: "Workshop UX cho doanh nghiệp",
      priority: "Low",
      status: "Waiting",
      assignee: "@support.hoa",
      updatedAt: "24/04 21:15"
    },
    {
      id: "CASE-50398",
      subject: "Tài khoản bị khóa sai",
      user: "Trần Mỹ Linh",
      email: "linh.tran@outlook.com",
      event: "—",
      priority: "Medium",
      status: "Resolved",
      assignee: "@admin.duy",
      updatedAt: "24/04 16:48"
    },
    {
      id: "CASE-50384",
      subject: "Yêu cầu đổi tên trên vé",
      user: "Bùi Quang Minh",
      email: "minh.bq@gmail.com",
      event: "Giải chạy Marathon Hà Nội",
      priority: "Low",
      status: "Resolved",
      assignee: "@support.minh",
      updatedAt: "24/04 11:20"
    },
  ],
};
