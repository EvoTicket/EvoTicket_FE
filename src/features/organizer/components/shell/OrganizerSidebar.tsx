"use client";

import Link from "next/link";
import Image from "next/image";
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
import { useTranslations } from "next-intl";

export function OrganizerSidebar() {
    const t = useTranslations("Organizer.Sidebar");
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
        <aside className="w-[280px] bg-navbar-sidebar-bg border-r border-navbar-sidebar-border min-h-screen flex flex-col fixed h-full z-10">
            {/* Logo/Brand */}
            <div className="p-6 ">
                {/* <Link href={`/${locale}/organizer/center`} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                    <Image 
                        src="/evoticket-logo/dark/dark-primary=horizontal-logo.svg" 
                        alt="EvoTicket Organizer" 
                        width={140} 
                        height={32} 
                        className="object-contain" 
                        priority 
                    />
                </Link> */}
                <Link href={`/${locale}/organizer/center`} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                    <Image
                        src="/evoticket-logo/light/light-primary=horizontal-logo.svg"
                        alt="EvoTicket"
                        width={150}
                        height={36}
                        className="object-contain dark:hidden"
                        priority
                    />
                    <Image
                        src="/evoticket-logo/dark/dark-primary=horizontal-logo.svg"
                        alt="EvoTicket"
                        width={150}
                        height={36}
                        className="object-contain hidden dark:block"
                        priority
                    />
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col">
                {/* Navigation */}
                <div className="p-4">
                    {isEventDetailRoute ? (
                        <>
                            <Link
                                href={`/${locale}/organizer/center`}
                                className="mb-5 flex items-center gap-3 rounded-ds-lg border border-navbar-sidebar-border px-4 py-3 text-sm font-medium text-navbar-sidebar-text-default transition-colors hover:bg-navbar-sidebar-item-bg-hover hover:text-navbar-sidebar-text-active"
                            >
                                <ArrowLeft size={18} />
                                <span>{t("myEvents")}</span>
                            </Link>

                            <div className="text-xs font-bold text-navbar-sidebar-text-default mb-4 px-4 uppercase tracking-wider">
                                {t("eventWorkspace")}
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
                                            className={`flex items-center gap-3 px-4 py-3 rounded-ds-lg font-medium transition-colors ${active
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
                                            <span>{t(`events.${item.key}`)}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </>
                    ) : (
                        <>
                            <div className="text-xs font-bold text-navbar-sidebar-text-default mb-4 px-4 uppercase tracking-wider">
                                {t("workspace")}
                            </div>
                            <nav className="space-y-1">
                                <Link
                                    href={`/${locale}/organizer/center`}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-ds-lg font-medium transition-colors ${isActive(`/${locale}/organizer/center`)
                                        ? 'bg-navbar-sidebar-item-bg-hover text-navbar-sidebar-text-active'
                                        : 'text-navbar-sidebar-text-default hover:bg-navbar-sidebar-item-bg-hover hover:text-navbar-sidebar-text-active'
                                        }`}
                                >
                                    <Calendar size={15} />
                                    <span>{t("myEvents")}</span>
                                </Link>
                                <Link
                                    href={`/${locale}/organizer/reports`}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-ds-lg font-medium transition-colors ${isActive(`/${locale}/organizer/reports`)
                                        ? 'bg-navbar-sidebar-item-bg-hover text-navbar-sidebar-text-active'
                                        : 'text-navbar-sidebar-text-default hover:bg-navbar-sidebar-item-bg-hover hover:text-navbar-sidebar-text-active'
                                        }`}
                                >
                                    <BarChart2 size={20} />
                                    <span>{t("manageReports")}</span>
                                </Link>
                                <Link
                                    href={`/${locale}/organizer/terms`}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-ds-lg font-medium transition-colors ${isActive(`/${locale}/organizer/terms`)
                                        ? 'bg-navbar-sidebar-item-bg-hover text-navbar-sidebar-text-active'
                                        : 'text-navbar-sidebar-text-default hover:bg-navbar-sidebar-item-bg-hover hover:text-navbar-sidebar-text-active'
                                        }`}
                                >
                                    <FileText size={20} />
                                    <span>{t("organizerTerms")}</span>
                                </Link>
                                <Link
                                    href={`/${locale}/organizer/account`}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-ds-lg font-medium transition-colors ${isActive(`/${locale}/organizer/account`)
                                        ? 'bg-navbar-sidebar-item-bg-hover text-navbar-sidebar-text-active'
                                        : 'text-navbar-sidebar-text-default hover:bg-navbar-sidebar-item-bg-hover hover:text-navbar-sidebar-text-active'
                                        }`}
                                >
                                    <User size={20} />
                                    <span>{t("account")}</span>
                                </Link>
                            </nav>
                        </>
                    )}
                </div>

                <div className="mt-auto p-6">
                    {/* Pro Organizer Banner */}
                    <div className="bg-navbar-sidebar-item-bg-hover border border-navbar-sidebar-border rounded-ds-xl p-4">
                        <div className="text-xs font-bold text-action-brand-bg-default mb-1 uppercase">{t("proOrganizer")}</div>
                        <div className="text-sm text-navbar-sidebar-text-active mb-3">{t("growthPlan")}</div>
                        <button className="w-full py-2 bg-navbar-sidebar-item-bg-default border border-navbar-sidebar-border hover:bg-navbar-sidebar-item-bg-hover text-navbar-sidebar-text-active text-sm rounded-ds-lg transition-colors">
                            {t("upgradePlan")}
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
