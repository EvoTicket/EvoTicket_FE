"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    Search,
    Activity,
    History,
    Link as LinkIcon,
    Repeat,
    Settings,
    Lock,
    Brain,
    ChevronRight
} from "lucide-react";
import { useTranslations } from "next-intl";

export function AdminSidebar() {
    const { locale } = useParams();
    const pathname = usePathname();
    const t = useTranslations("Admin");

    const menuItems = [
        { id: "overview", label: t("sidebar.overview"), icon: LayoutDashboard, href: `/admin` },
        { id: "accounts", label: t("sidebar.accounts"), icon: Users, href: `/admin/accounts` },
        { id: "moderation", label: t("sidebar.moderation"), icon: ShieldCheck, href: `/admin/moderation` },
        { id: "support", label: t("sidebar.support"), icon: Search, href: `/admin/support` },
        { id: "health", label: t("sidebar.health"), icon: Activity, href: `/admin/health` },
        { id: "audit", label: t("sidebar.audit"), icon: History, href: `/admin/audit` },
        { id: "blockchain", label: t("sidebar.blockchain"), icon: LinkIcon, href: `/admin/blockchain` },
        { id: "resale", label: t("sidebar.resale"), icon: Repeat, href: `/admin/resale` },
        { id: "config", label: t("sidebar.config"), icon: Settings, href: `/admin/settings` },
        // { id: "roles", label: t("sidebar.roles"), icon: Lock, href: `/admin/roles` },
        { id: "ai", label: t("sidebar.ai_kb"), icon: Brain, href: `/admin/ai-kb` },
    ];

    const isActive = (href: string) => {
        const fullHref = `/${locale}${href}`;
        return pathname === fullHref || (href !== "/admin" && pathname.startsWith(fullHref));
    };

    return (
        <aside className="w-[280px] bg-surface border-r border-border min-h-screen flex flex-col fixed h-full z-20 transition-colors duration-300">
            {/* Logo Section */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="text-white font-bold text-xl">ET</span>
                </div>
                <div>
                    <h1 className="text-sm font-bold text-txt-primary leading-tight">EvoTicket</h1>
                    <p className="text-[10px] text-txt-muted font-medium uppercase tracking-wider">{t("header.admin_platform")}</p>
                </div>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
                {menuItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.id}
                            href={`/${locale}${item.href}`}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${active
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "text-txt-secondary hover:bg-main hover:text-txt-primary"
                                }`}
                        >
                            <item.icon size={20} className={active ? "text-white" : "text-txt-muted group-hover:text-txt-secondary"} />
                            <span className="flex-1">{item.label}</span>
                            {active && <ChevronRight size={14} className="opacity-60" />}
                        </Link>
                    );
                })}
            </div>

            {/* Profile Section at Bottom */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-main transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-main border border-border flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-txt-primary truncate">Nguyễn Admin</p>
                        <p className="text-xs text-txt-muted truncate">Super Admin</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

