"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Bell, Ticket, Plus, ChevronDown, Moon, Sun, User, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import api from "../lib/axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { toast } from "react-toastify";
import { useAppSelector, useAppDispatch } from "@/src/store/hooks";
import { setUser, logout as logoutAction } from "@/src/store/slices/authSlice";

// Định nghĩa kiểu dữ liệu User
interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  phoneNumber: string;
  roles: string[];
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { locale } = useParams();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const t = useTranslations('Header');

  // Get auth state from Redux
  const { user, token, refreshToken, isOrganization } = useAppSelector((state) => state.auth);

  // Cần thiết để tránh lỗi Hydration mismatch khi icon Mặt trăng/Mặt trời khác nhau giữa server/client
  useEffect(() => {
    setMounted(true);
    if (token && !user) {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      // Token auto-injected by axios interceptor
      const response = await api.get("/iam-service/api/users/me");
      if (response.data && response.data.status === 200) {
        dispatch(setUser(response.data.data));
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      // Axios interceptor will handle 401 and auto-logout
    }
  };

  const handleLogout = async () => {
    if (refreshToken) {
      try {
        await api.post("/iam-service/api/auth/logout", { refreshToken }, { skipAuth: true } as any);
      } catch (error) {
        console.error("Logout API failed", error);
      }
    }
    dispatch(logoutAction());
    toast.info(t("logged_out_success"));
    router.push(`/${locale}/auth/login`);
  };

  const handleCreateEvent = () => {
    console.log(token);
    if (!token) {
      toast.error(t("login_required_to_create_event"));
      router.push(`/${locale}/auth/login`);
      return;
    }

    // Check isOrganization from Redux state
    if (isOrganization) {
      // Đã là organizer -> chuyển đến Organizer Center
      router.push(`/${locale}/organizer/center`);
    } else {
      // Chưa là organizer -> chuyển đến trang đăng ký
      router.push(`/${locale}/organizer/register`);
    }
  };

  const switchLanguage = () => {
    const newLocale = locale === "vi" ? "en" : "vi";
    if (!pathname) return;
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-none bg-main transition-colors duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">

        {/* === LEFT: LOGO === */}
        <Link href={`/${locale}/user/homepage`} className="flex items-center gap-2 shrink-0 group">
          {/* Logo Icon */}
          <div className="relative w-8 h-8 flex items-center justify-center border-2 border-primary rounded transition-colors group-hover:border-primary-hover">
            <div className="w-4 h-4 border border-primary rotate-45 group-hover:border-primary-hover transition-colors"></div>
          </div>
          {/* Logo Text */}
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-txt-primary leading-none">
              Evo<span className="text-primary">Ticket</span>
            </span>
            <span className="text-[10px] text-txt-muted uppercase tracking-wider">Event-booking</span>
          </div>
        </Link>

        {/* === CENTER: SEARCH BAR === */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="w-full flex items-center bg-surface border border-border rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all h-11">
            <div className="pl-4 text-txt-muted">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder={t('search_placeholder')}
              className="flex-1 px-3 py-2 bg-transparent text-txt-primary outline-none placeholder:text-txt-muted"
            />
            <div className="h-6 w-px bg-border mx-2"></div>
            <button className="px-6 py-2 text-sm font-medium text-txt-secondary hover:text-primary transition-colors">
              {t("search_button")}
            </button>
          </div>
        </div>

        {/* === RIGHT: ACTIONS === */}
        <div className="flex items-center gap-3 lg:gap-4">

          {/* Nút Tạo sự kiện (Primary Button) */}
          <button
            onClick={handleCreateEvent}
            className="hidden lg:flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <div className="bg-white/20 p-0.5 rounded">
              <Plus size={14} strokeWidth={3} />
            </div>
            <span>{t("create_event")}</span>
          </button>

          {/* Nút Vé của tôi (Secondary Button) */}
          <button className="hidden lg:flex items-center gap-2 border border-border text-txt-primary px-4 py-2.5 rounded-lg font-medium hover:bg-secondary transition-colors">
            <Ticket size={18} className="text-txt-secondary" />
            <span>{t("my_tickets")}</span>
          </button>

          {/* Icon Notification */}
          <button className="relative p-2.5 border border-border rounded-lg text-txt-secondary hover:bg-secondary transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1.5 -right-1.5 bg-error text-white text-[10px] font-bold h-5 min-w-5 px-1 flex items-center justify-center rounded-full border-2 border-main">
              99
            </span>
          </button>

          {/* User Profile Dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 border border-border rounded-lg p-1 pr-2 hover:bg-secondary cursor-pointer transition-colors outline-none">
                  <div className="w-8 h-8 rounded bg-linear-to-tr from-primary to-accent overflow-hidden relative">
                    <Image
                      src={user.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                      alt="User"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <ChevronDown size={16} className="text-txt-muted" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : t("user_fallback")}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/${locale}/user/profile`)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("profile")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 hover:text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Fallback hoặc nút Login nếu chưa đăng nhập (tùy nhu cầu, ở đây giữ nguyên placeholder nếu chưa có user data để tránh layout shift quá nhiều, hoặc có thể hiện nút login)
            <div className="flex items-center gap-2 border border-border rounded-lg p-1 pr-2 hover:bg-secondary cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded bg-gray-200 animate-pulse" />
              <ChevronDown size={16} className="text-txt-muted" />
            </div>
          )}

          {/* === LANGUAGE TOGGLE === */}
          <button
            onClick={switchLanguage}
            className="ml-2 w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-txt-secondary hover:bg-border transition-colors font-bold text-xs"
            title="Chuyển đổi ngôn ngữ / Switch Language"
          >
            {locale === "vi" ? "VI" : "EN"}
          </button>

          {/* === THEME TOGGLE === */}
          {/* Chỉ render icon khi client đã mounted để tránh lỗi hydration */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="ml-2 p-2 rounded-full bg-secondary text-txt-secondary hover:bg-border transition-colors"
            title="Chuyển đổi giao diện"
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun size={20} className="text-accent" />
              ) : (
                <Moon size={20} />
              )
            ) : (
              <div className="w-5 h-5" /> // Placeholder khi chưa load xong
            )}
          </button>

        </div>
      </div>
    </header>
  );
}