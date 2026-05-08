// Mock data for a single Support Case / Transaction Detail (ADM-04-DET)
export const supportDetailMock = {
  id: "CASE-50418",
  type: "case", // or "transaction", "ticket"
  subject: "Yêu cầu hoàn tiền do trùng giao dịch",
  description: "Người dùng phản ánh bị trừ tiền 2 lần khi mua vé, chỉ nhận được 1 mã NFT. Đã kiểm tra lịch sử thanh toán thấy có 2 transaction ID khác nhau cho cùng một order.",
  status: "In Progress",
  priority: "High",
  assignee: "@admin.linh",
  lastUpdate: "45 phút trước",
  event: "Anh Trai Say Hi Concert 2026",
  user: {
    name: "Trần Minh Hoan",
    email: "minh.hoan@evoticket.vn",
    avatar: "/avatars/user-1.jpg"
  },
  relatedLinks: {
    account: "minh.hoan@evoticket.vn",
    event: "Anh Trai Say Hi Concert 2026",
    transaction: "ORD-78421 • TCK-01928",
    organizer: "Ánh Dương Entertainment",
    blockchain: "0x9af2...3c1d",
    flag: "Finance review • High"
  },
  stats: [
    { label: "Trạng thái case", value: "In Progress", sub: "Đang xử lý cấp 1", color: "amber" },
    { label: "Ưu tiên", value: "High", sub: "SLA 24 giờ", color: "rose" },
    { label: "Admin phụ trách", value: "@admin.linh", sub: "Online hôm nay", color: "indigo" },
    { label: "Cập nhật cuối", value: "45 phút trước", sub: "Bởi @admin.linh", color: "gray" }
  ],
  timeline: [
    { type: "event", title: "Case created", desc: "minh.hoan@evoticket.vn gửi yêu cầu hỗ trợ", time: "26/04/2026 09:12" },
    { type: "assign", title: "Assigned to @admin.linh", desc: "Phân công xử lý cấp 1", time: "26/04/2026 09:30" },
    { type: "flag", title: "Flagged for finance review", desc: "Gắn cờ cho đội tài chính kiểm tra giao dịch trùng", time: "26/04/2026 10:15" },
    { type: "note", title: "Internal note added", desc: "@admin.linh ghi nhận đang chờ phản hồi từ VNPay", time: "26/04/2026 18:25" }
  ],
  notes: [
    { author: "@admin.linh", content: "Đang chờ phản hồi từ VNPay về giao dịch trùng.", time: "26/04/2026 18:25" },
    { author: "@admin.huy", content: "Người dùng đã gửi sao kê ngân hàng kèm theo.", time: "26/04/2026 11:40" }
  ]
};

export const transactionDetailMock = {
  id: "ORD-220456",
  type: "transaction",
  buyer: {
    name: "Nguyễn Hoàng Anh",
    email: "anh.nh@gmail.com",
    avatar: "/avatars/user-2.jpg",
    wallet: "0x71C...4a2b"
  },
  event: "Anh Trai Say Hi Concert 2026",
  amount: "₫4,400,000",
  paymentMethod: "VNPay (ATM/Internet Banking)",
  status: "Success",
  mintStatus: "Mint Pending",
  items: [
    { name: "Vé VIP - Khán đài A", price: "₫2,200,000", qty: 2, total: "₫4,400,000" }
  ],
  stats: [
    { label: "Trạng thái thanh toán", value: "Success", sub: "Hoàn tất lúc 09:18", color: "emerald" },
    { label: "Trạng thái Mint", value: "Pending", sub: "Đang đợi xử lý chuỗi", color: "amber" },
    { label: "Tổng thanh toán", value: "₫4,400,000", sub: "Đã bao gồm phí", color: "indigo" },
    { label: "Phương thức", value: "VNPay", sub: "Thẻ nội địa", color: "gray" }
  ],
  timeline: [
    { type: "event", title: "Order Created", desc: "Người dùng tạo đơn hàng", time: "25/04/2026 09:10" },
    { type: "event", title: "Payment Started", desc: "Chuyển hướng sang cổng VNPay", time: "25/04/2026 09:11" },
    { type: "event", title: "Payment Success", desc: "Xác nhận thanh toán từ VNPay", time: "25/04/2026 09:18" },
    { type: "event", title: "Mint Triggered", desc: "Gửi yêu cầu mint NFT lên hệ thống", time: "25/04/2026 09:18" }
  ],
  notes: [
    { author: "@admin.linh", content: "Giao dịch đã được xác minh trên cổng thanh toán.", time: "25/04/2026 09:20" }
  ],
  relatedLinks: {
    account: "anh.nh@gmail.com",
    event: "Anh Trai Say Hi Concert 2026",
    transaction: "ORD-220456",
    organizer: "Ánh Dương Entertainment",
    blockchain: "0x71C...4a2b",
    flag: "None"
  },
  user: {
    email: "anh.nh@gmail.com"
  }
};

export const ticketDetailMock = {
  id: "TIX-998120",
  type: "ticket",
  owner: "Nguyễn Hoàng Anh",
  ownerType: "Buyer gốc",
  event: "Anh Trai Say Hi Concert 2026",
  tier: "VIP",
  price: "₫2,200,000",
  access: "Active",
  checkin: "Not yet",
  nftId: "NFT #882104",
  blockchainRef: "0x55d...f8e2",
  stats: [
    { label: "Trạng thái vé", value: "Active", sub: "Hợp lệ để sử dụng", color: "emerald" },
    { label: "Check-in", value: "Not yet", sub: "Chưa sử dụng", color: "gray" },
    { label: "Sở hữu", value: "Original", sub: "Chưa qua chuyển nhượng", color: "indigo" },
    { label: "Hạng vé", value: "VIP", sub: "Khán đài A", color: "amber" }
  ],
  timeline: [
    { type: "event", title: "Ticket Minted", desc: "NFT được tạo thành công", time: "25/04/2026 09:45" },
    { type: "event", title: "Access Granted", desc: "Quyền truy cập được kích hoạt", time: "25/04/2026 09:45" },
    { type: "event", title: "Listed for Resale", desc: "Người dùng đăng bán (đã hủy)", time: "26/04/2026 14:20" }
  ],
  notes: [
    { author: "@admin.huy", content: "NFT đã được xác nhận trên mạng Polygon.", time: "25/04/2026 10:00" }
  ],
  relatedLinks: {
    account: "anh.nh@gmail.com",
    event: "Anh Trai Say Hi Concert 2026",
    transaction: "ORD-220456",
    organizer: "Ánh Dương Entertainment",
    blockchain: "0x55d...f8e2",
    flag: "None"
  },
  user: {
    email: "anh.nh@gmail.com"
  }
};
