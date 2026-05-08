"use client";

import { OrganizerSidebar } from "@/src/components/organizer/OrganizerSidebar";
import { OrganizerHeader } from "@/src/components/organizer/OrganizerHeader";
import { Camera, ExternalLink, ShieldCheck, Key, Lock, LogIn, Edit2, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";

export default function OrganizerAccountPage() {
    return (
        <div className="min-h-screen bg-bg-surface flex">
            <OrganizerSidebar />

            <div className="flex-1 flex flex-col ml-[280px]">
                <OrganizerHeader />

                {/* Main Content with bottom padding to account for fixed action bar */}
                <main className="flex-1 p-8 pb-28">
                    <div className="max-w-[1400px] mx-auto space-y-6">

                        {/* Profile Header Box */}
                        <div className="bg-bg-page border border-border-default rounded-xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] shadow-lg"></div>
                                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-secondary border border-border-default rounded-full flex items-center justify-center hover:bg-bg-surface transition-colors">
                                        <Camera size={14} className="text-text-primary" />
                                    </button>
                                </div>
                                
                                {/* Info */}
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl font-bold text-text-primary">Evo Culture Studio</h1>
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-success/20 text-success border border-success/30 uppercase">Active</span>
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase flex items-center gap-1">
                                            <ShieldCheck size={12} /> Basic verified
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                                        <span>Doanh nghiệp tổ chức sự kiện</span>
                                        <span className="w-1 h-1 rounded-full bg-border-default"></span>
                                        <span>Thành viên từ 03/2026</span>
                                        <span className="w-1 h-1 rounded-full bg-border-default"></span>
                                        <span>Liên hệ chính: <strong className="text-text-primary font-medium">Nguyễn Lê Hoàng Phúc</strong></span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 w-full lg:w-auto">
                                <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-transparent border border-border-default text-text-primary hover:bg-secondary rounded-lg font-medium text-sm transition-colors">
                                    <ExternalLink size={16} /> Xem trang public
                                </button>
                                <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-primary/20">
                                    <ShieldCheck size={16} /> Nâng cấp xác minh
                                </button>
                            </div>
                        </div>

                        {/* Grid Layout */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            
                            {/* LEFT COLUMN (2/3) */}
                            <div className="xl:col-span-2 space-y-6">
                                
                                {/* 1. Chủ tài khoản */}
                                <div className="bg-bg-page border border-border-default rounded-xl p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-text-primary">Chủ tài khoản</h3>
                                            <p className="text-xs text-text-muted mt-1">Thông tin đăng nhập và bảo mật</p>
                                        </div>
                                        <div className="px-3 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-xs font-medium">
                                            2FA chưa bật
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Họ và tên</label>
                                            <div className="relative">
                                                <input type="text" defaultValue="Nguyễn Lê Hoàng Phúc" className="w-full bg-bg-surface border border-border-default rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors" />
                                                <Edit2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Email</label>
                                            <div className="relative">
                                                <input type="email" defaultValue="phuc.organizer@evoticket.vn" disabled className="w-full bg-bg-surface/50 border border-border-default rounded-lg px-4 py-2.5 text-sm text-text-secondary cursor-not-allowed" />
                                                <Edit2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted opacity-50" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Số điện thoại</label>
                                            <div className="relative">
                                                <input type="text" defaultValue="09xx xxx xxx" disabled className="w-full bg-bg-surface/50 border border-border-default rounded-lg px-4 py-2.5 text-sm text-text-secondary cursor-not-allowed" />
                                                <Edit2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted opacity-50" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Mã nhân viên</label>
                                            <div className="relative">
                                                <input type="text" defaultValue="EVO-OP-0042" disabled className="w-full bg-bg-surface/50 border border-border-default rounded-lg px-4 py-2.5 text-sm text-text-secondary cursor-not-allowed" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button className="flex items-center gap-3 p-4 bg-bg-surface border border-border-default rounded-xl hover:border-text-muted transition-colors text-left group">
                                            <div className="w-10 h-10 rounded-lg bg-bg-page border border-border-default flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors">
                                                <Key size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-text-primary">Đổi mật khẩu</div>
                                                <div className="text-[10px] text-text-muted mt-0.5">Lần cuối: 2 tháng trước</div>
                                            </div>
                                        </button>
                                        <button className="flex items-center gap-3 p-4 bg-bg-surface border border-border-default rounded-xl hover:border-text-muted transition-colors text-left group">
                                            <div className="w-10 h-10 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center text-warning transition-colors">
                                                <Lock size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-text-primary">Bật xác thực 2 bước</div>
                                                <div className="text-[10px] text-text-muted mt-0.5">Tăng bảo mật tài khoản</div>
                                            </div>
                                        </button>
                                        <button className="flex items-center gap-3 p-4 bg-bg-surface border border-border-default rounded-xl hover:border-text-muted transition-colors text-left group">
                                            <div className="w-10 h-10 rounded-lg bg-bg-page border border-border-default flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors">
                                                <LogIn size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-text-primary">Phiên đăng nhập</div>
                                                <div className="text-[10px] text-text-muted mt-0.5">3 thiết bị đang hoạt động</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* 2. Thông tin ban tổ chức */}
                                <div className="bg-bg-page border border-border-default rounded-xl p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-text-primary">Thông tin ban tổ chức</h3>
                                            <p className="text-xs text-text-muted mt-1">Hiển thị công khai trên trang sự kiện</p>
                                        </div>
                                        <button className="flex items-center gap-2 px-3 py-1.5 bg-bg-surface border border-border-default hover:bg-secondary rounded-lg text-xs font-medium text-text-primary transition-colors">
                                            <Edit2 size={14} /> Chỉnh sửa
                                        </button>
                                    </div>

                                    <div className="relative h-40 w-full rounded-xl overflow-hidden mb-6 bg-gradient-to-r from-[#2c3e50] to-[#3498db]">
                                        <div className="absolute top-4 right-4 z-10">
                                            <button className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur border border-white/20 hover:bg-black/70 rounded-lg text-xs font-medium text-white transition-colors">
                                                <Camera size={14} /> Đổi cover
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                        <div>
                                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Tên ban tổ chức</label>
                                            <div className="relative">
                                                <input type="text" defaultValue="Evo Culture Studio" className="w-full bg-bg-surface border border-border-default rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors" />
                                                <Edit2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Website</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">🌐</div>
                                                <input type="text" defaultValue="https://evoculture.vn" className="w-full bg-bg-surface border border-border-default rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Email hỗ trợ mua</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">✉️</div>
                                                <input type="email" defaultValue="support@evoculture.vn" className="w-full bg-bg-surface border border-border-default rounded-lg pl-10 pr-10 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors" />
                                                <Edit2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Số điện thoại hỗ trợ</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">📞</div>
                                                <input type="text" defaultValue="1900 6868" className="w-full bg-bg-surface border border-border-default rounded-lg pl-10 pr-10 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors" />
                                                <Edit2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Mô tả ngắn</label>
                                            <textarea rows={2} defaultValue="Evo Culture Studio là đơn vị tổ chức các sự kiện văn hoá - giải trí hiện đại, ứng dụng blockchain cho vé và resale minh bạch." className="w-full bg-bg-surface border border-border-default rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Public Organizer Bio (Hiển thị trên trang sự kiện)</label>
                                            <textarea rows={3} defaultValue="Chúng tôi mang đến những trải nghiệm âm nhạc, triển lãm và hội thảo chất lượng cao tại Việt Nam — từ sân khấu Livestage đến các không gian sáng tạo đa ngành." className="w-full bg-bg-surface border border-border-default rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Thông tin thanh toán & pháp lý */}
                                <div className="bg-bg-page border border-border-default rounded-xl p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-text-primary">Thông tin thanh toán & pháp lý</h3>
                                            <p className="text-xs text-text-muted mt-1">Dùng cho đối soát doanh thu và xuất hoá đơn</p>
                                        </div>
                                        <div className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-[10px] font-bold uppercase">
                                            Đã xác minh
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="flex items-start gap-3 p-4 bg-bg-surface border border-border-default rounded-xl">
                                            <div className="text-text-muted mt-0.5">👤</div>
                                            <div>
                                                <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Chủ tài khoản payout</div>
                                                <div className="text-sm font-bold text-text-primary">CÔNG TY TNHH EVO CULTURE</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-bg-surface border border-border-default rounded-xl">
                                            <div className="text-text-muted mt-0.5">🏦</div>
                                            <div>
                                                <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Ngân hàng</div>
                                                <div className="text-sm font-bold text-text-primary">Vietcombank - CN Sài Gòn</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-bg-surface border border-border-default rounded-xl">
                                            <div className="text-text-muted mt-0.5">💳</div>
                                            <div>
                                                <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Số tài khoản</div>
                                                <div className="text-sm font-bold text-text-primary">**** **** 4892</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-bg-surface border border-border-default rounded-xl">
                                            <div className="text-text-muted mt-0.5">🏢</div>
                                            <div>
                                                <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Loại hình kinh doanh</div>
                                                <div className="text-sm font-bold text-text-primary">Công ty TNHH</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-bg-surface border border-border-default rounded-xl relative">
                                            <div className="text-text-muted mt-0.5">🛡️</div>
                                            <div>
                                                <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Mã số thuế</div>
                                                <div className="text-sm font-bold text-text-primary">0316xxxxxx • Đã xác minh</div>
                                            </div>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-success/20 flex items-center justify-center text-success">
                                                <CheckCircle2 size={14} />
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-bg-surface border border-border-default rounded-xl">
                                            <div className="text-text-muted mt-0.5">📍</div>
                                            <div>
                                                <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Địa chỉ xuất hoá đơn</div>
                                                <div className="text-sm font-bold text-text-primary">Tầng 7, Toà nhà Sonatus, Q.1, TP.HCM</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border-default hover:bg-border-default rounded-lg text-sm font-medium text-text-primary transition-colors">
                                            💳 Cập nhật thông tin thanh toán
                                        </button>
                                    </div>
                                </div>

                                {/* 4. Tuỳ chọn thông báo */}
                                <div className="bg-bg-page border border-border-default rounded-xl p-6">
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-text-primary">Tuỳ chọn thông báo</h3>
                                        <p className="text-xs text-text-muted mt-1">Cấu hình email và cảnh báo vận hành</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between p-4 bg-bg-surface border border-border-default rounded-xl">
                                            <div>
                                                <div className="text-sm font-bold text-text-primary">Thông báo qua email</div>
                                                <div className="text-[10px] text-text-muted mt-0.5">Tổng hợp hoạt động hằng ngày</div>
                                            </div>
                                            {/* Custom Toggle Switch */}
                                            <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                                                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-bg-surface border border-border-default rounded-xl">
                                            <div>
                                                <div className="text-sm font-bold text-text-primary">Thông báo payout</div>
                                                <div className="text-[10px] text-text-muted mt-0.5">Khi có đối soát và chuyển khoản</div>
                                            </div>
                                            <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                                                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-bg-surface border border-border-default rounded-xl">
                                            <div>
                                                <div className="text-sm font-bold text-text-primary">Review / Approval</div>
                                                <div className="text-[10px] text-text-muted mt-0.5">Khi sự kiện được duyệt hoặc từ chối</div>
                                            </div>
                                            <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                                                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-bg-surface border border-border-default rounded-xl">
                                            <div>
                                                <div className="text-sm font-bold text-text-primary">Checker incident</div>
                                                <div className="text-[10px] text-text-muted mt-0.5">Cảnh báo từ gate và checker app</div>
                                            </div>
                                            <div className="w-10 h-6 bg-secondary rounded-full relative cursor-pointer border border-border-default">
                                                <div className="w-4 h-4 bg-text-muted rounded-full absolute top-1 left-1"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* RIGHT COLUMN (1/3) */}
                            <div className="xl:col-span-1 space-y-6">
                                
                                {/* Thành viên & phân quyền */}
                                <div className="bg-bg-page border border-border-default rounded-xl p-6">
                                    <div className="mb-6">
                                        <h3 className="text-base font-bold text-text-primary">Thành viên & phân quyền</h3>
                                        <p className="text-xs text-text-muted mt-1">Nhân sự thuộc workspace tổ chức</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 mb-5">
                                        <div className="bg-bg-surface border border-border-default rounded-lg p-3">
                                            <div className="text-[10px] text-text-muted mb-1 flex justify-between">Tổng thành viên <span className="w-1.5 h-1.5 rounded-full bg-text-muted mt-1"></span></div>
                                            <div className="text-xl font-bold text-text-primary">6</div>
                                        </div>
                                        <div className="bg-bg-surface border border-border-default rounded-lg p-3">
                                            <div className="text-[10px] text-text-muted mb-1 flex justify-between">Organizer admin <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></span></div>
                                            <div className="text-xl font-bold text-text-primary">2</div>
                                        </div>
                                        <div className="bg-bg-surface border border-border-default rounded-lg p-3">
                                            <div className="text-[10px] text-text-muted mb-1 flex justify-between">Checker manager <span className="w-1.5 h-1.5 rounded-full bg-success mt-1"></span></div>
                                            <div className="text-xl font-bold text-text-primary">1</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-bg-surface border border-border-default rounded-lg mb-5">
                                        <div className="flex -space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white border-2 border-bg-surface z-30">NH</div>
                                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white border-2 border-bg-surface z-20">TH</div>
                                            <div className="w-8 h-8 rounded-full bg-warning flex items-center justify-center text-xs font-bold text-white border-2 border-bg-surface z-10">LN</div>
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-text-secondary border-2 border-bg-surface z-0">+2</div>
                                        </div>
                                        <div className="text-xs text-text-secondary">đang hoạt động</div>
                                    </div>

                                    <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-transparent border border-border-default hover:bg-secondary text-text-primary rounded-lg text-sm font-medium transition-colors">
                                        👥 Quản lý thành viên
                                    </button>
                                </div>

                                {/* Lịch sử tài khoản */}
                                <div className="bg-bg-page border border-border-default rounded-xl p-6">
                                    <div className="mb-6">
                                        <h3 className="text-base font-bold text-text-primary">Lịch sử tài khoản</h3>
                                        <p className="text-xs text-text-muted mt-1">Các thay đổi gần đây</p>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-bg-surface border border-border-default flex items-center justify-center text-text-secondary flex-shrink-0 mt-0.5">
                                                <Edit2 size={12} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div className="text-sm font-bold text-text-primary">Cập nhật hồ sơ tổ chức</div>
                                                    <div className="text-[10px] text-text-muted mt-1">2 giờ trước</div>
                                                </div>
                                                <div className="text-xs text-text-secondary mt-0.5">Sửa mô tả ngắn và cover image</div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-bg-surface border border-border-default flex items-center justify-center text-warning flex-shrink-0 mt-0.5">
                                                💳
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div className="text-sm font-bold text-text-primary">Cập nhật tài khoản payout</div>
                                                    <div className="text-[10px] text-text-muted mt-1">3 ngày trước</div>
                                                </div>
                                                <div className="text-xs text-text-secondary mt-0.5">Đổi ngân hàng sang Vietcombank CN Sài Gòn</div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-bg-surface border border-border-default flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                                                <ShieldCheck size={12} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div className="text-sm font-bold text-text-primary">Mời thành viên mới</div>
                                                    <div className="text-[10px] text-text-muted mt-1">5 ngày trước</div>
                                                </div>
                                                <div className="text-xs text-text-secondary mt-0.5">quan.le@evoticket.vn - Checker manager</div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success flex-shrink-0 mt-0.5">
                                                <CheckCircle2 size={12} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div className="text-sm font-bold text-text-primary">Đăng nhập thành công</div>
                                                    <div className="text-[10px] text-text-muted mt-1">Hôm nay 08:04</div>
                                                </div>
                                                <div className="text-xs text-text-secondary mt-0.5">Chrome trên macOS - IP: HCM</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Vùng nguy hiểm */}
                                <div className="bg-bg-page border border-border-default rounded-xl p-6">
                                    <div className="mb-4">
                                        <h3 className="text-base font-bold text-feedback-error-text flex items-center gap-2">
                                            <ShieldAlert size={18} /> Vùng nguy hiểm
                                        </h3>
                                        <p className="text-xs text-text-muted mt-1">Hành động không thể hoàn tác</p>
                                    </div>

                                    <div className="p-4 border border-feedback-error-bg/30 bg-feedback-error-bg/10 rounded-lg">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <div className="text-sm font-bold text-feedback-error-text mb-1">Yêu cầu đóng tài khoản tổ chức</div>
                                                <div className="text-xs text-text-secondary leading-relaxed">Sau khi gửi yêu cầu, các sự kiện đang mở bán sẽ được xử lý theo chính sách nền tảng trước khi tài khoản bị đóng.</div>
                                            </div>
                                            <button className="flex-shrink-0 px-3 py-1.5 bg-feedback-error-bg/20 text-feedback-error-text border border-feedback-error-bg/30 hover:bg-feedback-error-bg/30 rounded-lg text-xs font-bold transition-colors">
                                                Gửi yêu cầu
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </main>

                {/* Fixed Bottom Action Bar */}
                <div className="fixed bottom-0 right-0 left-[280px] z-20 bg-bg-page border-t border-border-default px-8 py-4 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
                    <div className="text-xs text-text-muted">
                        Thay đổi của bạn chỉ được áp dụng sau khi nhấn <span className="font-bold text-text-primary">"Lưu thay đổi"</span>.
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-6 py-2 bg-transparent border border-border-default text-text-primary hover:bg-secondary rounded-lg font-medium text-sm transition-colors">
                            Hủy
                        </button>
                        <button className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm shadow-lg shadow-primary/20 transition-colors">
                            Lưu thay đổi
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
