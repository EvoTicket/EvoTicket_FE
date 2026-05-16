"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
    ArrowLeft,
    BarChart2,
    Calendar,
    CheckCircle2,
    ClipboardList,
    CreditCard,
    Edit3,
    FileText,
    LayoutDashboard,
    Map,
    Percent,
    ScanLine,
    Ticket,
    Users,
    User,
} from "lucide-react";
import { EVENT_NAV_ITEMS } from "@/src/features/organizer/constants/organizerRoutes";

export function OrganizerSidebar() {
    const params = useParams();
    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter(Boolean);
    const locale = pathSegments[0] ?? (params?.locale as string) ?? "vi";
    const organizerSegment = pathSegments[1];
    const eventsSegment = pathSegments[2];
    const eventId = pathSegments[3];
    const activeEventSection = pathSegments[4] ?? "overview";
    const isEventDetailRoute =
        organizerSegment === "organizer" &&
        eventsSegment === "events" &&
        Boolean(eventId) &&
        eventId !== "create";
    const eventBasePath = `/${locale}/organizer/events/${eventId}`;

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    const eventIcons = {
        overview: LayoutDashboard,
        analytics: BarChart2,
        orders: ClipboardList,
        attendees: Ticket,
        checkin: ScanLine,
        "checker-staff": CheckCircle2,
        "seat-map": Map,
        vouchers: Percent,
        edit: Edit3,
        team: Users,
        finance: CreditCard,
    };

    return (
        <aside className="dark w-[280px] bg-navbar-sidebar-bg border-r border-navbar-sidebar-border min-h-screen flex flex-col fixed h-full z-10">
            {/* Logo/Brand */}
            <div className="p-6 border-b border-navbar-sidebar-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-action-brand-bg-default/10 rounded-lg flex items-center justify-center">
                        <span className="text-action-brand-bg-default font-bold text-xl">E</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-navbar-sidebar-text-active leading-tight">EvoTicket</h1>
                        <p className="text-xs text-navbar-sidebar-text-default">Organizer Workspace</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col">
                {/* Navigation */}
                <div className="p-4">
                    {isEventDetailRoute ? (
                        <>
                            <Link
                                href={`/${locale}/organizer/center`}
                                className="mb-5 flex items-center gap-3 rounded-lg border border-navbar-sidebar-border px-4 py-3 text-sm font-medium text-navbar-sidebar-text-default transition-colors hover:bg-navbar-sidebar-item-bg-hover hover:text-navbar-sidebar-text-active"
                            >
                                <ArrowLeft size={18} />
                                <span>Sự kiện của tôi</span>
                            </Link>

                            <div className="text-xs font-bold text-navbar-sidebar-text-default mb-4 px-4 uppercase tracking-wider">
                                Event workspace
                            </div>
                            <nav className="space-y-1">
                                {EVENT_NAV_ITEMS.map((item) => {
                                    const href = `${eventBasePath}/${item.href}`;
                                    const active = activeEventSection === item.href;
                                    const Icon = eventIcons[item.key];

                                    return (
                                        <Link
                                            key={item.key}
                                            href={href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${active
                                                ? "bg-navbar-sidebar-item-bg-hover text-navbar-sidebar-text-active"
                                                : "text-navbar-sidebar-text-default hover:bg-navbar-sidebar-item-bg-hover hover:text-navbar-sidebar-text-active"
                                                }`}
                                        >
                                            <Icon
                                                size={20}
                                                className={
                                                    active
                                                        ? "text-navbar-sidebar-icon-active"
                                                        : "text-navbar-sidebar-icon-default"
                                                }
                                            />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </>
                    ) : (
                        <>
                            <div className="text-xs font-bold text-navbar-sidebar-text-default mb-4 px-4 uppercase tracking-wider">
                                Workspace
                            </div>
                            <nav className="space-y-1">
                                <Link
                                    href={`/${locale}/organizer/center`}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive(`/${locale}/organizer/center`)
                                        ? 'bg-navbar-sidebar-item-bg-hover text-navbar-sidebar-text-active'
                                        : 'text-navbar-sidebar-text-default hover:bg-navbar-sidebar-item-bg-hover hover:text-navbar-sidebar-text-active'
                                        }`}
                                >
                                    <Calendar size={15} />
                                    <span>Sự kiện của tôi</span>
                                </Link>
                                <Link
                                    href={`/${locale}/organizer/reports`}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive(`/${locale}/organizer/reports`)
                                        ? 'bg-navbar-sidebar-item-bg-hover text-navbar-sidebar-text-active'
                                        : 'text-navbar-sidebar-text-default hover:bg-navbar-sidebar-item-bg-hover hover:text-navbar-sidebar-text-active'
                                        }`}
                                >
                                    <BarChart2 size={20} />
                                    <span>Quản lý báo cáo</span>
                                </Link>
                                <Link
                                    href={`/${locale}/organizer/terms`}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive(`/${locale}/organizer/terms`)
                                        ? 'bg-navbar-sidebar-item-bg-hover text-navbar-sidebar-text-active'
                                        : 'text-navbar-sidebar-text-default hover:bg-navbar-sidebar-item-bg-hover hover:text-navbar-sidebar-text-active'
                                        }`}
                                >
                                    <FileText size={20} />
                                    <span>Điều khoản cho Ban tổ chức</span>
                                </Link>
                                <Link
                                    href={`/${locale}/organizer/account`}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive(`/${locale}/organizer/account`)
                                        ? 'bg-navbar-sidebar-item-bg-hover text-navbar-sidebar-text-active'
                                        : 'text-navbar-sidebar-text-default hover:bg-navbar-sidebar-item-bg-hover hover:text-navbar-sidebar-text-active'
                                        }`}
                                >
                                    <User size={20} />
                                    <span>Tài khoản</span>
                                </Link>
                            </nav>
                        </>
                    )}
                </div>

                <div className="mt-auto p-6">
                    {/* Pro Organizer Banner */}
                    <div className="bg-navbar-sidebar-item-bg-hover border border-navbar-sidebar-border rounded-xl p-4">
                        <div className="text-xs font-bold text-action-brand-bg-default mb-1 uppercase">Pro Organizer</div>
                        <div className="text-sm text-navbar-sidebar-text-active mb-3">Bạn đang dùng gói Growth</div>
                        <button className="w-full py-2 bg-navbar-sidebar-item-bg-default border border-navbar-sidebar-border hover:bg-navbar-sidebar-item-bg-hover text-navbar-sidebar-text-active text-sm rounded-lg transition-colors">
                            Nâng cấp gói
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
