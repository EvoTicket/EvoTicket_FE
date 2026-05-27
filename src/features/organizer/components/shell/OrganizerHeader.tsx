"use client";

import { Plus, Search, Bell, ChevronDown, Sun, Moon, User, LogOut, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter, usePathname } from "next/navigation";
import { CreateEventButton } from "@/src/features/organizer/components/common/CreateEventButton";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/src/store/hooks";
import { logout as logoutAction } from "@/src/store/slices/authSlice";
import { toast } from "react-toastify";
import api from "@/src/lib/axios";
import { useTranslations } from "next-intl";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

export function OrganizerHeader() {
    const { locale } = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const t = useTranslations("Organizer.Layout");

    // Get auth state from Redux
    const { user, refreshToken } = useAppSelector((state) => state.auth);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    const handleLogout = async () => {
        if (refreshToken) {
            try {
                await api.post("/iam-service/api/auth/logout", { refreshToken }, { skipAuth: true });
            } catch (error) {
                console.error("Logout API failed", error);
            }
        }
        dispatch(logoutAction());
        toast.info(t("logoutSuccess"));
        router.push(`/${locale}/user/homepage`);
    };

    const switchLanguage = () => {
        const newLocale = locale === "vi" ? "en" : "vi";
        if (!pathname) return;
        const segments = pathname.split("/");
        segments[1] = newLocale;
        router.push(segments.join("/"));
    };

    const getInitials = () => {
        if (!user) return "O";
        const first = user.firstName ? user.firstName.charAt(0).toUpperCase() : "";
        const last = user.lastName ? user.lastName.charAt(0).toUpperCase() : "";
        return first + last || user.email?.charAt(0).toUpperCase() || "U";
    };

    const getFullName = () => {
        if (!user) return "Organizer Admin";
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        return user.email || "Organizer Admin";
    };

    return (
        <header className="bg-bg-page border-b border-border-default px-8 py-4 flex items-center justify-between sticky top-0 z-10">
            {/* Left side: Breadcrumb & Search */}
            <div className="flex items-center gap-8 flex-1">
                <div className="text-sm font-medium text-text-secondary hidden lg:block">
                    Workspace <span className="mx-2 text-text-muted">/</span> <span className="text-text-primary">Evo Entertainment JSC</span>
                </div>

                {/* Search Bar */}
                {/* <div className="relative max-w-md w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={16} className="text-text-muted" />
                    </div>
                    <input 
                        type="text" 
                        placeholder={t("quickSearch")} 
                        className="block w-full pl-10 pr-4 py-2 bg-bg-surface border border-border-default rounded-full text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-focus-ring focus:border-field-border-focus transition-colors"
                    />
                </div> */}
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-3 lg:gap-4">
                {/* Back to Homepage Button */}
                {/* <Link 
                    href={`/${locale}/user/homepage`} 
                    className="p-2 rounded-full hover:bg-bg-surface border border-border-default transition-colors text-text-secondary cursor-pointer"
                    title={t("backToHomeUser")}
                >
                    <Home size={20} />
                </Link> */}

                <CreateEventButton className="flex items-center gap-2 bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default px-4 py-2 rounded-ds-lg font-medium transition-colors shadow-sm text-sm">
                    <Plus size={16} />
                    {t("createEvent")}
                </CreateEventButton>

                {/* <button className="p-2 rounded-full hover:bg-bg-surface border border-border-default transition-colors text-text-secondary relative cursor-pointer">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-feedback-error-text rounded-full border-2 border-bg-page"></span>
                </button> */}

                {/* === LANGUAGE TOGGLE === */}
                <button
                    onClick={switchLanguage}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-button-secondary-bg-default text-text-secondary hover:bg-border-default border border-border-default transition-colors font-bold text-xs cursor-pointer shrink-0"
                    title="Chuyển đổi ngôn ngữ / Switch Language"
                >
                    {locale === "vi" ? "EN" : "VI"}
                </button>

                {/* === THEME TOGGLE === */}
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2.5 rounded-full bg-button-secondary-bg-default text-text-secondary hover:bg-border-default border border-border-default transition-colors cursor-pointer shrink-0"
                    title={t("switchTheme")}
                >
                    {mounted ? (
                        theme === "dark" ? (
                            <Sun size={20} className="text-accent" />
                        ) : (
                            <Moon size={20} />
                        )
                    ) : (
                        <div className="w-5 h-5" />
                    )}
                </button>

                {/* === USER PROFILE DROPDOWN === */}
                <div className="pl-4 border-l border-border-default shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity outline-none">
                                {user?.avatarUrl ? (
                                    <div className="w-10 h-10 rounded-ds-lg overflow-hidden relative border border-border-default bg-action-brand-bg-default/10 shrink-0">
                                        <Image
                                            src={user.avatarUrl}
                                            alt="Organizer Avatar"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-ds-lg bg-action-brand-bg-default/10 flex items-center justify-center text-action-brand-bg-default font-bold border border-border-default shrink-0">
                                        {getInitials()}
                                    </div>
                                )}
                                <div className="hidden md:block text-left">
                                    <div className="text-sm font-bold text-text-primary flex items-center gap-1 select-none">
                                        <span>{getFullName()}</span>
                                        <ChevronDown size={14} className="text-text-muted shrink-0 animate-bounce-slow" />
                                    </div>
                                    <div className="text-xs text-text-muted select-none">{t("adminRole")}</div>
                                </div>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal p-3">
                                <div className="flex flex-col gap-1.5">
                                    <p className="text-sm font-medium leading-tight">{getFullName()}</p>
                                    <p className="text-xs leading-tight text-text-muted truncate">
                                        {user?.email || "organizer@evoticket.com"}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            {/* <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/${locale}/user/profile`)} className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>{t("personalProfile")}</span>
                            </DropdownMenuItem> */}
                            <DropdownMenuItem onClick={() => router.push(`/${locale}/user/homepage`)} className="cursor-pointer">
                                <Home className="mr-2 h-4 w-4" />
                                <span>{t("backToHomeUser")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-feedback-error-text hover:text-feedback-error-text hover:bg-feedback-error-bg/10 cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>{t("logout")}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
