import type { EventMetric, EventSectionKey, FixtureState, StatusTone } from "../types/organizer";

export const EVENT_DETAIL_STATE: Record<EventSectionKey, FixtureState> = {
  overview: "loaded",
  analytics: "loaded",
  orders: "loaded",
  attendees: "loaded",
  checkin: "loaded",
  "checker-staff": "loaded",
  "seat-map": "loaded",
  vouchers: "loaded",
  edit: "loaded",
  team: "loaded",
  finance: "loaded",
};

export const EVENT_DETAIL = {
  id: "e1",
  title: "Anh Trai Say Hi Concert 2026",
  status: "Published",
  statusTone: "success" as StatusTone,
  dateLabel: "26/04/2026 · 19:30",
  venue: "Nhà thi đấu Phú Thọ",
  address: "219 Lý Thường Kiệt, Quận 11, TP.HCM",
  publicUrl: "/events/e1",
  updatedLabel: "Cập nhật 2 giờ trước",
  categoryName: "Livestage",
  capacity: "10,000",
  sold: "8,420",
  settlementStatus: "Đối soát T+7",
};

export const OVERVIEW_METRICS: EventMetric[] = [
  { label: "Tổng vé đã bán", value: "8,420", helper: "+312 hôm nay", tone: "brand" },
  { label: "Doanh thu gộp", value: "5.38B VND", helper: "+184M hôm nay", tone: "accent" },
  { label: "Check-in hôm nay", value: "3,182", helper: "Gate A + B + C", tone: "info" },
  { label: "Resale volume", value: "214", helper: "24h qua", tone: "success" },
  { label: "Tỉ lệ lấp đầy", value: "84%", helper: "8,420 / 10,000", tone: "warning" },
];

export const OVERVIEW_SNAPSHOTS = [
  { title: "Sales snapshot", rows: [["Đã bán / Tổng", "8,420 / 10,000"], ["Tốc độ bán 24h", "+312 vé · +3.7%"], ["Best tier", "VIP Standing nhanh hơn 2x tuần trước"]] },
  { title: "Check-in snapshot", rows: [["Đang trong khu vực", "2,914"], ["Đã vào hôm nay", "3,182"], ["Quét bị từ chối", "17"], ["Offline chờ đồng bộ", "3"]] },
  { title: "Resale snapshot", rows: [["Giá resale trung bình", "1,420,000 đ"], ["Royalty đã thu", "36,500,000 đ"], ["Vé đang khóa bán", "41"]] },
];

export const RECENT_ACTIVITY = [
  { event: "1 voucher campaign được kích hoạt", meta: "Early Bird 10%", time: "2 phút trước", tone: "accent" as StatusTone },
  { event: "1 ticket resale hoàn tất", meta: "VIP Standing · 1,500,000 đ", time: "4 phút trước", tone: "info" as StatusTone },
  { event: "Checker Gate B đã đồng bộ 43 lượt quét", meta: "Offline → Online", time: "6 phút trước", tone: "success" as StatusTone },
  { event: "12 vé VIP vừa bán", meta: "Order #OD-10482", time: "10 phút trước", tone: "brand" as StatusTone },
  { event: "Royalty resale cộng dồn 450,000 đ", meta: "Smart contract settlement", time: "22 phút trước", tone: "warning" as StatusTone },
];

export const ANALYTICS_SERIES = [
  { day: "28/03", revenue: 85, tickets: 22 },
  { day: "29/03", revenue: 112, tickets: 38 },
  { day: "30/03", revenue: 156, tickets: 48 },
  { day: "31/03", revenue: 342, tickets: 132 },
  { day: "01/04", revenue: 267, tickets: 95 },
  { day: "02/04", revenue: 214, tickets: 72 },
  { day: "03/04", revenue: 468, tickets: 248 },
  { day: "04/04", revenue: 398, tickets: 175 },
];

export const ANALYTICS_ZONES = [
  { zone: "VIP Floor", sold: "950 / 1,000", fillRate: "95%" },
  { zone: "Zone A", sold: "1,380 / 1,500", fillRate: "92%" },
  { zone: "Zone B", sold: "3,480 / 4,000", fillRate: "87%" },
  { zone: "Balcony", sold: "1,020 / 1,500", fillRate: "68%" },
];

export const ORDERS = [
  { id: "OD-10482", buyer: "Nguyễn Văn An", summary: "VIP Standing × 2", total: "2,400,000 đ", method: "VNPay", payment: "Paid", mint: "Minted", tone: "success" as StatusTone },
  { id: "OD-10481", buyer: "Trần Thị Bảo", summary: "Standard × 4", total: "3,200,000 đ", method: "Momo", payment: "Paid", mint: "Mint Pending", tone: "warning" as StatusTone },
  { id: "OD-10480", buyer: "Lê Minh Châu", summary: "VIP × 1, Standard × 2", total: "2,700,000 đ", method: "Card", payment: "Paid", mint: "Minted", tone: "success" as StatusTone },
  { id: "OD-10479", buyer: "Hoàng Gia Bảo", summary: "Standard × 1", total: "820,000 đ", method: "VNPay", payment: "Refunded", mint: "Locked", tone: "neutral" as StatusTone },
];

export const ATTENDEES = [
  { ticket: "TK-88210", holder: "Nguyễn Văn An", type: "VIP Standing", status: "Valid", checkin: "Chưa check-in", resale: "Allowed", tone: "success" as StatusTone },
  { ticket: "TK-88207", holder: "Trần Thị Bảo", type: "Standard", status: "Valid", checkin: "Đã check-in", resale: "Locked", tone: "info" as StatusTone },
  { ticket: "TK-88192", holder: "Lê Minh Châu", type: "Zone A", status: "Transferred", checkin: "Chưa check-in", resale: "Allowed", tone: "warning" as StatusTone },
  { ticket: "TK-88140", holder: "Phạm Huy", type: "Balcony", status: "Used", checkin: "Đã check-in", resale: "Blocked", tone: "neutral" as StatusTone },
];

export const CHECKIN_GATES = [
  { gate: "Gate A", online: "Online", scanned: "1,142", rejected: "4", staff: "4 checker", tone: "success" as StatusTone },
  { gate: "Gate B", online: "Online", scanned: "1,018", rejected: "7", staff: "5 checker", tone: "success" as StatusTone },
  { gate: "Gate C", online: "Offline sync", scanned: "902", rejected: "3", staff: "3 checker", tone: "warning" as StatusTone },
  { gate: "VIP Gate", online: "Online", scanned: "120", rejected: "3", staff: "2 checker", tone: "info" as StatusTone },
];

export const CHECKER_STAFF = [
  { name: "Nguyễn Hoài Nam", role: "Gate manager", gate: "All gates", status: "Active", device: "iPhone 15", tone: "success" as StatusTone },
  { name: "Trần Gia Hân", role: "Checker", gate: "Gate A", status: "Active", device: "Android", tone: "success" as StatusTone },
  { name: "Lâm Minh", role: "Checker", gate: "Gate B", status: "Pending invite", device: "None", tone: "warning" as StatusTone },
  { name: "Quang Anh", role: "Checker", gate: "Gate C", status: "Suspended", device: "Android", tone: "error" as StatusTone },
];

export const SEAT_ZONES = [
  { zone: "VIP Floor", capacity: "1,000", sold: "950", held: "24", blocked: "26", price: "1,200,000 đ", tone: "success" as StatusTone },
  { zone: "Zone A", capacity: "1,500", sold: "1,380", held: "42", blocked: "18", price: "980,000 đ", tone: "success" as StatusTone },
  { zone: "Zone B", capacity: "4,000", sold: "3,480", held: "120", blocked: "70", price: "740,000 đ", tone: "info" as StatusTone },
  { zone: "Balcony", capacity: "1,500", sold: "1,020", held: "36", blocked: "12", price: "520,000 đ", tone: "warning" as StatusTone },
];

export const VOUCHERS = [
  { code: "EARLY10", campaign: "Early Bird 10%", used: "420 / 800", discount: "10%", status: "Active", tone: "success" as StatusTone },
  { code: "VIPPAIR", campaign: "VIP pair deal", used: "86 / 150", discount: "150,000 đ", status: "Active", tone: "success" as StatusTone },
  { code: "STUDENT", campaign: "Student Night", used: "120 / 300", discount: "15%", status: "Scheduled", tone: "info" as StatusTone },
  { code: "FLASH24", campaign: "24h flash sale", used: "300 / 300", discount: "20%", status: "Ended", tone: "neutral" as StatusTone },
];

export const TEAM_MEMBERS = [
  { name: "Nguyễn Hoài Nam", email: "nam@evoticket.vn", role: "Owner", permissions: "Full access", status: "Active", tone: "success" as StatusTone },
  { name: "Trần Bảo Anh", email: "baoanh@evoticket.vn", role: "Editor", permissions: "Edit event, vouchers", status: "Active", tone: "success" as StatusTone },
  { name: "Lê Minh", email: "minh@evoticket.vn", role: "Finance", permissions: "Finance, settlement", status: "Active", tone: "info" as StatusTone },
  { name: "Quang Lê", email: "quang@evoticket.vn", role: "Checker manager", permissions: "Check-in, staff", status: "Invited", tone: "warning" as StatusTone },
];

export const FINANCE_ROWS = [
  { batch: "SET-2026-04-01", period: "01/04 - 07/04", gross: "2.18B đ", fee: "109M đ", payout: "2.071B đ", status: "Pending", tone: "warning" as StatusTone },
  { batch: "SET-2026-03-04", period: "25/03 - 31/03", gross: "1.74B đ", fee: "87M đ", payout: "1.653B đ", status: "Paid", tone: "success" as StatusTone },
  { batch: "SET-2026-03-03", period: "18/03 - 24/03", gross: "1.02B đ", fee: "51M đ", payout: "969M đ", status: "Paid", tone: "success" as StatusTone },
];
