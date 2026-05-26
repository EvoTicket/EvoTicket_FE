"use client";
import { Search, Bell, ChevronDown, Sun, Moon, Languages, LogOut, User } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { logout as logoutAction } from "@/src/store/slices/authSlice";
import api from "@/src/lib/axios";
import { toast } from "react-toastify";

export function AdminHeader() {
    const { locale } = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations("Admin");
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const dispatch = useAppDispatch();
    const { refreshToken, user } = useAppSelector((state) => state.auth);

    // Tránh lỗi hydration với next-themes
    useEffect(() => setMounted(true), []);

    const handleLogout = async () => {
        if (refreshToken) {
            try {
                await api.post("/iam-service/api/auth/logout", { refreshToken }, { skipAuth: true });
            } catch (error) {
                console.error("Logout API failed", error);
            }
        }
        dispatch(logoutAction());
        toast.info("Đăng xuất thành công");
        router.push(`/${locale}/user/homepage`);
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const changeLanguage = (newLocale: string) => {
        const segments = pathname.split("/");
        segments[1] = newLocale;
        router.push(segments.join("/"));
    };

    return (
        <header className="h-20 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Image
                        src="/evoticket-logo/light/light-primary=horizontal-logo.svg"
                        alt="EvoTicket Admin"
                        width={120}
                        height={28}
                        className="object-contain dark:hidden"
                        priority
                    />
                    <Image
                        src="/evoticket-logo/dark/dark-primary=horizontal-logo.svg"
                        alt="EvoTicket Admin"
                        width={120}
                        height={28}
                        className="object-contain hidden dark:block"
                        priority
                    />
                    <div className="h-6 w-px bg-border mx-2"></div>
                    <span className="text-sm font-bold text-txt-primary uppercase tracking-widest hidden sm:inline-block">Admin</span>
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">
                        {t("header.production")}
                    </span>
                </div>
            </div>

            {/* <div className="flex-1 max-w-2xl px-12">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-txt-muted group-focus-within:text-primary transition-colors" />
                    </div>
                    <input 
                        type="text" 
                        placeholder={t("header.search_placeholder")} 
                        className="w-full bg-main border border-border rounded-ds-2xl py-2.5 pl-12 pr-12 text-sm text-txt-primary focus:bg-surface focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-txt-muted"
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <span className="text-[10px] font-bold text-txt-muted border border-border rounded px-1.5 py-0.5 bg-surface uppercase">
                            ⌘K
                        </span>
                    </div>
                </div>
            </div> */}

            <div className="flex items-center gap-3">
                {/* Language Switcher */}
                <button
                    onClick={() => changeLanguage(locale === "vi" ? "en" : "vi")}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-main text-txt-secondary hover:bg-border transition-colors font-bold text-xs cursor-pointer"
                    title="Chuyển đổi ngôn ngữ / Switch Language"
                >
                    {locale === "vi" ? "VI" : "EN"}
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-main text-txt-secondary hover:bg-border transition-colors cursor-pointer"
                    title={mounted ? (theme === "dark" ? t("header.theme_light") : t("header.theme_dark")) : "Chuyển đổi giao diện"}
                >
                    {mounted ? (
                        theme === "dark" ? <Sun size={20} className="text-primary" /> : <Moon size={20} />
                    ) : (
                        <div className="w-5 h-5" />
                    )}
                </button>

                <div className="h-6 w-[1px] bg-border mx-1"></div>

                {/* <button className="relative w-10 h-10 flex items-center justify-center rounded-lg border border-border text-txt-secondary hover:border-primary transition-colors cursor-pointer">
                    <Bell size={20} />
                    <span className="absolute -top-1.5 -right-1.5 bg-error text-white text-[10px] font-bold h-5 min-w-5 px-1 flex items-center justify-center rounded-full border-2 border-surface">
                        99
                    </span>
                </button> */}

                {/* <div className="h-6 w-[1px] bg-border mx-1"></div> */}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 border border-border rounded-lg p-1 pr-2 hover:border-primary cursor-pointer transition-colors outline-none group">
                            <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">AD</span>
                            </div>
                            <ChevronDown size={16} className="text-txt-muted group-hover:text-txt-secondary transition-colors" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-surface border-border" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-txt-primary">
                                    {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Admin"}
                                </p>
                                <p className="text-xs leading-none text-txt-muted">
                                    {user?.email || "admin@evoticket.com"}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem onClick={handleLogout} className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer focus:bg-rose-500/10 focus:text-rose-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Đăng xuất</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
