"use client";

import { useState } from "react";
import { OrganizerSidebar } from "@/src/components/organizer/OrganizerSidebar";
import { OrganizerHeader } from "@/src/components/organizer/OrganizerHeader";
import { Calendar, ChevronDown, Download, RefreshCw, FileText, CheckCircle2 } from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

// --- MOCK DATA ---
const revenueData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    revenue: Math.floor(Math.random() * 200) + 100 + (i * 5) + (Math.sin(i / 3) * 50)
}));

const occupancyData = [
    { name: 'Livestage', value: 82, color: '#8b5cf6' },
    { name: 'Hội thảo', value: 50, color: '#f59e0b' },
    { name: 'Triển lãm', value: 71, color: '#6366f1' },
    { name: 'Online', value: 47, color: '#10b981' },
];

const ticketSalesData = [
    { name: 'Anh Trai Say Hi', tickets: 4280 },
    { name: 'Startup Finance', tickets: 620 },
    { name: 'Indie Night', tickets: 2140 },
    { name: 'Tech Summit VN', tickets: 3020 },
    { name: 'Creative Expo', tickets: 1320 },
].sort((a, b) => b.tickets - a.tickets);

const performanceTableData = [
    { name: 'Anh Trai Say Hi Concert 2026', type: 'Livestage', sold: '4,280', occupancy: '95%', revenue: '5.4 tỷ', checkin: '-', resale: '214', royalty: '18.2 triệu', status: 'On sale' },
    { name: 'Tech Summit VN 2026', type: 'Hội thảo', sold: '3,020', occupancy: '82%', revenue: '1.9 tỷ', checkin: '76%', resale: '64', royalty: '3.4 triệu', status: 'On sale' },
    { name: 'Indie Night Saigon', type: 'Livestage', sold: '2,140', occupancy: '71%', revenue: '642 triệu', checkin: '82%', resale: '88', royalty: '6.1 triệu', status: 'Ended' },
    { name: 'Creative Expo 2026', type: 'Triển lãm', sold: '1,320', occupancy: '44%', revenue: '428 triệu', checkin: '-', resale: '32', royalty: '3.4 triệu', status: 'Upcoming' },
    { name: 'Startup Finance Forum', type: 'Online', sold: '620', occupancy: '89%', revenue: '186 triệu', checkin: '68%', resale: '30', royalty: '6.4 triệu', status: 'Ended' },
];

const StatCard = ({ title, value, change, isPositive, suffix = "" }: any) => (
    <div className="bg-bg-page border border-border-default rounded-xl p-5">
        <div className="text-sm font-medium text-text-muted mb-2">{title}</div>
        <div className="text-2xl font-bold text-text-primary mb-3">{value}</div>
        <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isPositive ? 'bg-success/10 text-success' : 'bg-feedback-error-bg text-feedback-error-text'}`}>
            {isPositive ? '+' : ''}{change}{suffix}
        </div>
    </div>
);

export default function ReportsPage() {
    return (
        <div className="min-h-screen bg-bg-surface flex">
            <OrganizerSidebar />

            <div className="flex-1 flex flex-col ml-[280px]">
                <OrganizerHeader />

                <main className="flex-1 p-8">
                    {/* Page Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-text-primary mb-1">Quản lý báo cáo</h1>
                        <p className="text-sm text-text-muted">Theo dõi doanh thu, hiệu quả bán vé và tình trạng check-in trên toàn bộ sự kiện</p>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-bg-page p-4 rounded-xl border border-border-default">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Date Picker */}
                            <button className="flex items-center gap-2 px-4 py-2 bg-bg-surface border border-border-default rounded-lg text-sm text-text-primary hover:bg-secondary transition-colors">
                                <Calendar size={16} className="text-text-muted" />
                                01/04 - 21/04/2026
                            </button>

                            {/* Dropdowns */}
                            {['Tất cả sự kiện', 'Loại sự kiện', 'Hình thức', 'Trạng thái'].map((filter, idx) => (
                                <button key={idx} className="flex items-center gap-2 px-4 py-2 bg-bg-surface border border-border-default rounded-lg text-sm text-text-primary hover:bg-secondary transition-colors">
                                    {filter}
                                    <ChevronDown size={16} className="text-text-muted" />
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-bg-surface border border-border-default rounded-lg text-sm text-text-primary hover:bg-secondary transition-colors">
                                <RefreshCw size={16} className="text-text-muted" />
                                Làm mới
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors">
                                <Download size={16} />
                                Xuất dữ liệu
                            </button>
                        </div>
                    </div>

                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                        <StatCard title="Tổng doanh thu" value="8.76 tỷ" change="12.4%" isPositive={true} suffix=" vs kỳ trước" />
                        <StatCard title="Số vé đã bán" value="12,480" change="8.1%" isPositive={true} />
                        <StatCard title="Tỷ lệ lấp đầy TB" value="71%" change="3pt" isPositive={true} />
                        <StatCard title="Tỷ lệ check-in TB" value="64%" change="-2pt" isPositive={false} />
                        <StatCard title="Volume resale" value="428 vé" change="18%" isPositive={true} />
                        <StatCard title="Royalty fee" value="42.5 triệu" change="11%" isPositive={true} />
                    </div>

                    {/* Charts Row 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Revenue Line Chart */}
                        <div className="lg:col-span-2 bg-bg-page border border-border-default rounded-xl p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-base font-bold text-text-primary">Doanh thu theo thời gian</h3>
                                    <p className="text-xs text-text-muted mt-1">So với 30 ngày gần nhất</p>
                                </div>
                                <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">
                                    +12.4% <span className="text-text-muted ml-1 font-normal">VNĐ - triệu</span>
                                </div>
                            </div>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={revenueData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d3748" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#718096' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#718096' }} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                                            itemStyle={{ color: '#a78bfa' }}
                                        />
                                        <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Occupancy Donut Chart */}
                        <div className="bg-bg-page border border-border-default rounded-xl p-6 flex flex-col">
                            <div>
                                <h3 className="text-base font-bold text-text-primary">Tỷ lệ lấp đầy theo loại</h3>
                                <p className="text-xs text-text-muted mt-1">Occupancy rate %</p>
                            </div>
                            <div className="flex-1 relative flex items-center justify-center min-h-[180px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={occupancyData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {occupancyData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold text-text-primary">71%</span>
                                    <span className="text-[10px] text-text-muted">TB toàn org</span>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                {occupancyData.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                                            <span className="text-text-secondary">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-text-primary">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Ticket Sales Bar Chart */}
                        <div className="lg:col-span-2 bg-bg-page border border-border-default rounded-xl p-6">
                            <div className="mb-4">
                                <h3 className="text-base font-bold text-text-primary">Số vé bán theo sự kiện</h3>
                                <p className="text-xs text-text-muted mt-1">Top 5 sự kiện trong kỳ</p>
                            </div>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ticketSalesData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }} barSize={20}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#2d3748" />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#718096' }} />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#cbd5e1' }} />
                                        <Tooltip 
                                            cursor={{fill: '#1f2937'}}
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                                        />
                                        <Bar dataKey="tickets" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Check-in Status */}
                        <div className="bg-bg-page border border-border-default rounded-xl p-6 flex flex-col justify-between">
                            <div>
                                <h3 className="text-base font-bold text-text-primary">Tình trạng check-in</h3>
                                <p className="text-xs text-text-muted mt-1">Dữ liệu theo thời gian thực</p>
                            </div>
                            
                            <div className="mt-6 mb-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-success"></span>
                                        <span className="text-text-secondary">Đã check-in</span>
                                    </div>
                                    <div><span className="font-bold text-text-primary">7,986</span> <span className="text-text-muted text-xs ml-1">64%</span></div>
                                </div>
                                <div className="flex justify-between text-sm mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-warning"></span>
                                        <span className="text-text-secondary">Chưa check-in</span>
                                    </div>
                                    <div><span className="font-bold text-text-primary">4,494</span> <span className="text-text-muted text-xs ml-1">36%</span></div>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="w-full h-3 bg-warning/30 rounded-full overflow-hidden mt-4 flex">
                                    <div className="h-full bg-success" style={{ width: '64%' }}></div>
                                    <div className="h-full bg-warning" style={{ width: '36%' }}></div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-bg-surface border border-border-default rounded-lg p-3">
                                    <div className="text-xs text-text-muted mb-1">Tỷ lệ vắng</div>
                                    <div className="text-lg font-bold text-text-primary">36%</div>
                                </div>
                                <div className="bg-bg-surface border border-border-default rounded-lg p-3">
                                    <div className="text-xs text-text-muted mb-1">Peak gate time</div>
                                    <div className="text-lg font-bold text-text-primary">19:20</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resale Market */}
                    <div className="bg-bg-page border border-border-default rounded-xl p-6 mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-base font-bold text-text-primary">Thị trường bán lại</h3>
                                <p className="text-xs text-text-muted mt-1">Giao dịch thứ cấp và royalty on-chain</p>
                            </div>
                            <div className="px-3 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-xs font-medium">
                                Blockchain
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-bg-surface border border-border-default rounded-xl p-5 relative overflow-hidden">
                                <div className="text-xs text-text-muted mb-2 relative z-10">Active resale listings</div>
                                <div className="text-2xl font-bold text-text-primary relative z-10">53</div>
                                <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-primary/5 rounded-full blur-xl"></div>
                            </div>
                            <div className="bg-bg-surface border border-border-default rounded-xl p-5 relative overflow-hidden">
                                <div className="text-xs text-text-muted mb-2 relative z-10">Average resale price</div>
                                <div className="text-2xl font-bold text-text-primary relative z-10">1.42 triệu</div>
                                <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-primary/5 rounded-full blur-xl"></div>
                            </div>
                            <div className="bg-bg-surface border border-border-default rounded-xl p-5 relative overflow-hidden">
                                <div className="text-xs text-text-muted mb-2 relative z-10">Completed trades</div>
                                <div className="text-2xl font-bold text-text-primary relative z-10">118</div>
                                <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-success/5 rounded-full blur-xl"></div>
                            </div>
                            <div className="bg-bg-surface border border-border-default rounded-xl p-5 relative overflow-hidden">
                                <div className="text-xs text-text-muted mb-2 relative z-10">Royalty fee total</div>
                                <div className="text-2xl font-bold text-text-primary relative z-10">42.5 triệu</div>
                                <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-warning/5 rounded-full blur-xl"></div>
                            </div>
                        </div>
                    </div>

                    {/* Table & Export Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Performance Table */}
                        <div className="lg:col-span-3 bg-bg-page border border-border-default rounded-xl p-6">
                            <div className="mb-6">
                                <h3 className="text-base font-bold text-text-primary">Hiệu suất chi tiết theo sự kiện</h3>
                                <p className="text-xs text-text-muted mt-1">Tổng hợp các chỉ số chính</p>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border-default text-xs uppercase text-text-muted">
                                            <th className="py-3 px-4 font-medium">Sự kiện</th>
                                            <th className="py-3 px-4 font-medium">Loại</th>
                                            <th className="py-3 px-4 font-medium text-right">Đã bán</th>
                                            <th className="py-3 px-4 font-medium text-right">Lấp đầy</th>
                                            <th className="py-3 px-4 font-medium text-right">Doanh thu</th>
                                            <th className="py-3 px-4 font-medium text-right">Check-in</th>
                                            <th className="py-3 px-4 font-medium text-right">Resale</th>
                                            <th className="py-3 px-4 font-medium text-right">Royalty Fee</th>
                                            <th className="py-3 px-4 font-medium text-center">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {performanceTableData.map((row, idx) => (
                                            <tr key={idx} className="border-b border-border-default/50 hover:bg-bg-surface/50 transition-colors">
                                                <td className="py-4 px-4 font-medium text-text-primary">{row.name}</td>
                                                <td className="py-4 px-4 text-text-secondary">{row.type}</td>
                                                <td className="py-4 px-4 text-right font-medium">{row.sold}</td>
                                                <td className="py-4 px-4 text-right">{row.occupancy}</td>
                                                <td className="py-4 px-4 text-right font-medium">{row.revenue}</td>
                                                <td className="py-4 px-4 text-right">{row.checkin}</td>
                                                <td className="py-4 px-4 text-right">{row.resale}</td>
                                                <td className="py-4 px-4 text-right">{row.royalty}</td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-medium border
                                                        ${row.status === 'On sale' ? 'bg-success/10 text-success border-success/20' : 
                                                          row.status === 'Ended' ? 'bg-bg-surface text-text-muted border-border-default' : 
                                                          'bg-primary/10 text-primary border-primary/20'}
                                                    `}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Export Form */}
                        <div className="bg-bg-page border border-border-default rounded-xl p-6">
                            <div className="mb-6">
                                <h3 className="text-base font-bold text-text-primary">Xuất dữ liệu</h3>
                                <p className="text-xs text-text-muted mt-1">Chọn phạm vi và định dạng</p>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <div className="text-xs font-bold text-text-secondary uppercase mb-3 tracking-wider">Định dạng</div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button className="py-2 flex items-center justify-center gap-1 bg-primary/10 border border-primary text-primary rounded-lg text-xs font-medium">
                                            <FileText size={14} /> .CSV
                                        </button>
                                        <button className="py-2 flex items-center justify-center gap-1 bg-bg-surface border border-border-default text-text-secondary hover:text-text-primary rounded-lg text-xs font-medium transition-colors">
                                            .XLSX
                                        </button>
                                        <button className="py-2 flex items-center justify-center gap-1 bg-bg-surface border border-border-default text-text-secondary hover:text-text-primary rounded-lg text-xs font-medium transition-colors">
                                            .PDF
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs font-bold text-text-secondary uppercase mb-3 tracking-wider">Phạm vi</div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg cursor-pointer">
                                            <div className="text-primary"><CheckCircle2 size={18} className="fill-primary text-bg-page" /></div>
                                            <span className="text-sm font-medium text-text-primary">Tổng hợp</span>
                                        </label>
                                        {['Doanh thu', 'Check-in', 'Resale', 'Danh sách người mua'].map((item, idx) => (
                                            <label key={idx} className="flex items-center gap-3 p-3 bg-bg-surface border border-border-default rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                                                <div className="w-[18px] h-[18px] rounded border border-text-muted flex-shrink-0"></div>
                                                <span className="text-sm text-text-secondary">{item}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                
                                <button className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors">
                                    <Download size={18} />
                                    Xuất file ngay
                                </button>
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}
