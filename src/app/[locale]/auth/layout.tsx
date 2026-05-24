"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Languages, Link } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { locale } = useParams();
  const pathname = usePathname();
  const t = useTranslations("MyTickets");

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const switchLanguage = () => {
    const newLocale = locale === "vi" ? "en" : "vi";
    if (!pathname) return;
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  const handleBackToHomepage = () => {
    router.push(`/${locale}/user/homepage`);
  }

  return (
    <div className="relative min-h-screen w-full bg-main text-txt-primary">
      {/* Floating Action Buttons Container left */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-3.5">
        {/* Back to Homepage */}
        <button
          onClick={handleBackToHomepage}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border text-txt-primary hover:bg-secondary hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-primary/10 cursor-pointer text-xs font-bold font-sans"
          title={t('explore_events')}
        >
          <span>{t('explore_events')}</span>
        </button>

      </div>
      {/* Floating Action Buttons Container */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3.5">
        {/* Language Switcher Button */}
        <button
          onClick={switchLanguage}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border text-txt-primary hover:bg-secondary hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-primary/10 cursor-pointer text-xs font-bold font-sans"
          title="Chuyển đổi ngôn ngữ / Switch Language"
        >
          <Languages size={15} className="text-primary" />
          <span>{locale === "vi" ? "English" : "Tiếng Việt"}</span>
        </button>

        {/* Theme Switcher Button */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface border border-border text-txt-primary hover:bg-secondary hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-primary/10 cursor-pointer"
          title="Chuyển đổi giao diện / Toggle Theme"
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun size={18} className="text-amber-400" />
            ) : (
              <Moon size={18} className="text-primary" />
            )
          ) : (
            <div className="w-[18px] h-[18px]" />
          )}
        </button>
      </div>

      {children}
    </div>
  );
}
