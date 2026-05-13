/**
 * Reports page fixture data.
 * All money values are display strings — keep raw numbers in future API version.
 */

export const FIXTURE_KPIS = [
  { label: "Tổng doanh thu", value: "8.76 tỷ", delta: "+12.4% vs kỳ trước", tone: "success" as const },
  { label: "Số vé đã bán", value: "12,480", delta: "+8.1%", tone: "success" as const },
  { label: "Tỷ lệ lấp đầy TB", value: "71%", delta: "+3pt", tone: "brand" as const },
  { label: "Tỷ lệ check-in TB", value: "64%", delta: "−2pt", tone: "warning" as const },
  { label: "Volume resale", value: "428 vé", delta: "+18%", tone: "info" as const },
  { label: "Royalty fee", value: "42.5 triệu", delta: "+11%", tone: "accent" as const },
];

export const FIXTURE_REVENUE_SERIES = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  rev: Math.round(120 + Math.sin(i / 3) * 60 + (i / 30) * 180 + (i % 3 === 0 ? 30 : 0)),
}));

export const FIXTURE_TICKET_BY_EVENT = [
  { name: "Anh Trai Say Hi", value: 4280 },
  { name: "Startup Finance", value: 620 },
  { name: "Indie Night", value: 2140 },
  { name: "Tech Summit VN", value: 3820 },
  { name: "Creative Expo", value: 1320 },
  { name: "Blockchain WS", value: 0 },
];

export const FIXTURE_OCCUPANCY = [
  { name: "Livestage", value: 82, cssVar: "--color-action-brand-bg-default" },
  { name: "Hội thảo", value: 58, cssVar: "--color-action-accent-bg-default" },
  { name: "Triển lãm", value: 71, cssVar: "--color-feedback-info-icon" },
  { name: "Online", value: 47, cssVar: "--color-feedback-success-icon" },
];

export const FIXTURE_CHECKIN = {
  checked: { value: 7986, pct: 64 },
  unchecked: { value: 4494, pct: 36 },
  gateRate: "64%",
  peakTime: "19:20",
};

export const FIXTURE_RESALE = [
  { label: "Active resale listings", value: "53", tone: "info" as const },
  { label: "Average resale price", value: "1.42 triệu", tone: "brand" as const },
  { label: "Completed trades", value: "118", tone: "success" as const },
  { label: "Royalty fee total", value: "42.5 triệu", tone: "accent" as const },
];

export type PerformanceRow = {
  event: string;
  type: string;
  sold: string;
  fill: string;
  rev: string;
  checkin: string;
  resale: string;
  royalty: string;
  status: string;
  tone: "success" | "neutral" | "info" | "warning" | "brand" | "accent" | "error";
};

export const FIXTURE_PERFORMANCE_TABLE: PerformanceRow[] = [
  { event: "Anh Trai Say Hi Concert 2026", type: "Livestage", sold: "4,280", fill: "53%", rev: "5.4 tỷ", checkin: "—", resale: "214", royalty: "18.2 triệu", status: "On sale", tone: "success" },
  { event: "Tech Summit VN 2026", type: "Hội thảo", sold: "3,820", fill: "82%", rev: "1.9 tỷ", checkin: "76%", resale: "64", royalty: "8.4 triệu", status: "On sale", tone: "success" },
  { event: "Indie Night Saigon", type: "Livestage", sold: "2,140", fill: "71%", rev: "642 triệu", checkin: "82%", resale: "88", royalty: "6.1 triệu", status: "Ended", tone: "neutral" },
  { event: "Creative Expo 2026", type: "Triển lãm", sold: "1,320", fill: "44%", rev: "428 triệu", checkin: "—", resale: "32", royalty: "3.4 triệu", status: "Upcoming", tone: "info" },
  { event: "Startup Finance Forum", type: "Online", sold: "620", fill: "89%", rev: "186 triệu", checkin: "68%", resale: "30", royalty: "6.4 triệu", status: "Ended", tone: "neutral" },
];
