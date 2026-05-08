"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Calendar, BarChart2, FileText, User, ChevronRight } from "lucide-react";

export function OrganizerSidebar() {
    const { locale } = useParams();
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname.includes(path);
    };

    return (
        <aside className="w-[280px] bg-bg-surface border-r border-border-default min-h-screen flex flex-col fixed h-full z-10">
            {/* Logo/Brand */}
            <div className="p-6 border-b border-border-default">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <span className="text-primary font-bold text-xl">E</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-text-primary leading-tight">EvoTicket</h1>
                        <p className="text-xs text-text-muted">Organizer Workspace</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col">
                {/* Navigation */}
                <div className="p-4">
                    <div className="text-xs font-bold text-text-muted mb-4 px-4 uppercase tracking-wider">
                        Workspace
                    </div>
                    <nav className="space-y-1">
                        <Link
                            href={`/${locale}/organizer/center`}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                                isActive('/organizer/center') 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'text-text-secondary hover:bg-bg-page hover:text-text-primary'
                            }`}
                        >
                            <Calendar size={20} />
                            <span>Sự kiện của tôi</span>
                        </Link>
                        <Link
                            href={`/${locale}/organizer/reports`}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                                isActive('/organizer/reports') 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'text-text-secondary hover:bg-bg-page hover:text-text-primary'
                            }`}
                        >
                            <BarChart2 size={20} />
                            <span>Quản lý báo cáo</span>
                        </Link>
                        <Link
                            href={`/${locale}/organizer/terms`}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                                isActive('/organizer/terms') 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'text-text-secondary hover:bg-bg-page hover:text-text-primary'
                            }`}
                        >
                            <FileText size={20} />
                            <span>Điều khoản cho Ban tổ chức</span>
                        </Link>
                        <Link
                            href={`/${locale}/organizer/account`}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                                isActive('/organizer/account') 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'text-text-secondary hover:bg-bg-page hover:text-text-primary'
                            }`}
                        >
                            <User size={20} />
                            <span>Tài khoản</span>
                        </Link>
                    </nav>
                </div>

                <div className="mt-auto p-6">
                    {/* Pro Organizer Banner */}
                    <div className="bg-bg-page border border-border-default rounded-xl p-4">
                        <div className="text-xs font-bold text-primary mb-1 uppercase">Pro Organizer</div>
                        <div className="text-sm text-text-primary mb-3">Bạn đang dùng gói Growth</div>
                        <button className="w-full py-2 bg-bg-surface border border-border-default hover:bg-bg-page text-text-primary text-sm rounded-lg transition-colors">
                            Nâng cấp gói
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
