"use client";
import { Search, Bell, ChevronDown, Sun, Moon, Languages } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function AdminHeader() {
    const { locale } = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations("Admin");
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Tránh lỗi hydration với next-themes
    useEffect(() => setMounted(true), []);

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
                    <span className="text-lg font-bold text-txt-primary">EvoTicket Admin</span>
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">
                        {t("header.production")}
                    </span>
                </div>
            </div>

            <div className="flex-1 max-w-2xl px-12">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-txt-muted group-focus-within:text-primary transition-colors" />
                    </div>
                    <input 
                        type="text" 
                        placeholder={t("header.search_placeholder")} 
                        className="w-full bg-main border border-border rounded-2xl py-2.5 pl-12 pr-12 text-sm text-txt-primary focus:bg-surface focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-txt-muted"
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <span className="text-[10px] font-bold text-txt-muted border border-border rounded px-1.5 py-0.5 bg-surface uppercase">
                            ⌘K
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <button 
                    onClick={toggleTheme}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-main text-txt-secondary transition-all hover:scale-110 active:scale-95"
                    title={mounted ? (theme === "dark" ? t("header.theme_light") : t("header.theme_dark")) : ""}
                >
                    {mounted && (theme === "dark" ? <Sun size={20} /> : <Moon size={20} />)}
                </button>

                {/* Language Switcher */}
                <div className="relative group/lang">
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-main text-txt-secondary transition-all">
                        <Languages size={20} />
                    </button>
                    <div className="absolute top-full right-0 mt-2 w-32 bg-surface border border-border rounded-2xl shadow-xl opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all z-50 overflow-hidden">
                        <button 
                            onClick={() => changeLanguage("vi")}
                            className={`w-full px-4 py-2 text-xs font-bold text-left hover:bg-main transition-colors ${locale === "vi" ? "text-primary bg-primary/5" : "text-txt-secondary"}`}
                        >
                            {t("header.lang_vi")}
                        </button>
                        <button 
                            onClick={() => changeLanguage("en")}
                            className={`w-full px-4 py-2 text-xs font-bold text-left hover:bg-main transition-colors ${locale === "en" ? "text-primary bg-primary/5" : "text-txt-secondary"}`}
                        >
                            {t("header.lang_en")}
                        </button>
                    </div>
                </div>

                <div className="h-8 w-[1px] bg-border mx-2"></div>

                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-main text-txt-muted relative transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error border-2 border-surface rounded-full"></span>
                </button>
                
                <div className="h-8 w-[1px] bg-border mx-2"></div>

                <button className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-main transition-all group">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">AD</span>
                    </div>
                    <span className="text-sm font-bold text-txt-secondary group-hover:text-txt-primary">Admin</span>
                    <ChevronDown size={16} className="text-txt-muted group-hover:text-txt-secondary transition-colors" />
                </button>
            </div>
        </header>
    );
}
