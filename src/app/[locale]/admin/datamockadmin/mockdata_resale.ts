export const resaleMockData = {
  volumeData: [
    { day: "01/05", volume: 18 },
    { day: "02/05", volume: 24 },
    { day: "03/05", volume: 14 },
    { day: "04/05", volume: 22 },
    { day: "05/05", volume: 30 },
    { day: "06/05", volume: 28 },
    { day: "07/05", volume: 34 },
  ],
  priceTrendData: [
    { day: "01/05", price: 1.15 },
    { day: "02/05", price: 1.25 },
    { day: "03/05", price: 1.20 },
    { day: "04/05", price: 1.35 },
    { day: "05/05", price: 1.40 },
    { day: "06/05", price: 1.42 },
    { day: "07/05", price: 1.42 },
  ],
  topEvents: [
    { name: "Anh Trai Say Hi Concert 2026", transactions: 84, flags: 4, percentage: 95 },
    { name: "VPOP Festival 2026", transactions: 62, flags: 2, percentage: 70 },
    { name: "Indie Night Hà Nội", transactions: 38, flags: 0, percentage: 45 },
    { name: "Acoustic Saigon Vol.4", transactions: 30, flags: 1, percentage: 35 },
  ],
  spikes: [
    { level: "High", title: "Anh Trai Say Hi", desc: "price_spike", percent: 38, time: 2 },
    { level: "Medium", title: "VPOP Festival", desc: "relist_anomaly", count: 12, source: "one_wallet", time: 1 },
    { level: "Low", title: "Indie Night", desc: "transfer_anomaly", count: 4, time: 30 },
  ],
  listings: [
    {
      id: "RSL-50218",
      event: "Indie Night Hà Nội",
      seller: "khoa.vo@evoticket.vn",
      tier: "Standing",
      price: "560,000 VND",
      listingLimit: "1000000",
      cap: "Within cap",
      status: "Active",
      flag: "—",
      note: "Listing sạch, giá đúng quy định.",
      hisListings: [
        { time: "26/04/2026 10:00", text: "Listing được tạo bởi khoa.vo" },
        { time: "26/04/2026 10:05", text: "Hệ thống duyệt tự động - Active" }
      ]
    },
    {
      id: "RSL-50217",
      event: "Anh Trai Say Hi Concert 2026",
      seller: "linh.pham@evoticket.vn",
      tier: "VIP Standing",
      price: "3,800,000 VND",
      listingLimit: "2400000",
      cap: "Over cap",
      status: "Under review",
      flag: "Price cap exceeded",
      note: "Cần kiểm tra lại giá trần của sự kiện này.",
      hisListings: [
        { time: "25/04/2026 11:30", text: "Resale chuyển sở hữu sang linh.pham" },
        { time: "25/04/2026 09:42", text: "Listing được niêm yết lại với giá 3,800,000" },
        { time: "25/04/2026 09:20", text: "Hệ thống gắn cờ vượt giá trần" }
      ]
    },
    {
      id: "RSL-50216",
      event: "VPOP Festival 2026",
      seller: "minh.tran@evoticket.vn",
      tier: "Standard",
      price: "1,200,000 VND",
      listingLimit: "1000000",
      cap: "Within cap",
      status: "Active",
      flag: "—",
      note: "Người bán uy tín, nhiều giao dịch thành công.",
      hisListings: [
        { time: "24/04/2026 14:20", text: "Listing được tạo bởi minh.tran" },
        { time: "24/04/2026 14:25", text: "Hệ thống duyệt tự động - Active" }
      ]
    },
  ],
  disputes: [
    {
      id: "RDP-3081",
      ticket: "TCK-01928",
      event: "Anh Trai Say Hi Concert 2026",
      parties: "minh.tran ↔ linh.pham",
      type: "Ownership dispute",
      priority: "High",
      status: "Investigating",
      lastUpdate: "30 phút trước",
      description: "Người mua gốc khiếu nại bị resale ngoài ý muốn, nghi ngờ bị hack tài khoản ví.",
      note: "Đã yêu cầu minh.tran cung cấp bằng chứng giao dịch off-chain."
    },
    {
      id: "RDP-3080",
      ticket: "TCK-01882",
      event: "VPOP Festival 2026",
      parties: "duy.nguyen ↔ marketplace",
      type: "Resale lock conflict",
      priority: "Medium",
      status: "Open",
      lastUpdate: "2 giờ trước",
      description: "Lỗi hệ thống không mở khóa vé sau khi giao dịch thất bại.",
      note: "Chờ dev team kiểm tra smart contract lock state."
    },
    {
      id: "RDP-3079",
      ticket: "TCK-01885",
      event: "Indie Night Hà Nội",
      parties: "khoa.vo ↔ system",
      type: "Suspicious transfer",
      priority: "Critical",
      status: "Investigating",
      lastUpdate: "45 phút trước",
      description: "Phát hiện chuỗi chuyển nhượng vé bất thường qua 5 ví trong 10 phút.",
      note: "Có dấu hiệu botting, cần escalate lên security team."
    },
    {
      id: "RDP-3078",
      ticket: "TCK-01861",
      event: "Acoustic Saigon Vol.4",
      parties: "trang.do ↔ finance",
      type: "Settlement mismatch",
      priority: "Low",
      status: "Awaiting user",
      lastUpdate: "5 giờ trước",
      description: "Người bán khiếu nại chưa nhận được tiền sau 48h giao dịch thành công.",
      note: "Finance đang kiểm tra lệnh chuyển tiền trên Polygon."
    },
  ]
};
