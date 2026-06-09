"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Bell, Ticket, Plus, ChevronDown, Moon, Sun, User, LogOut, LogInIcon, Subscript, UserPlus, Users, Globe, Heart } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
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

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { locale } = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const t = useTranslations('Header');

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const kw = searchParams?.get("keyword");
    if (kw) {
      setSearchQuery(kw);
    } else {
      setSearchQuery("");
    }
  }, [searchParams]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/${locale}/user/events?keyword=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/${locale}/user/events`);
    }
  };

  // Get auth state from Redux
  const { user, token, refreshToken, isOrganization } = useAppSelector((state) => state.auth);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.get("/notification-service/api/notifications?page=1&size=10");
      if (response.data && response.data.content) {
        setNotifications(response.data.content);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  }, [token]);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.get("/notification-service/api/notifications/unread-count");
      if (response.data && response.data.unreadCount !== undefined) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch unread count", error);
    }
  }, [token]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notification-service/api/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(notif => notif.id === id ? { ...notif, isRead: true, read: true } : notif)
      );
      void fetchUnreadCount();
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notification-service/api/notifications/read-all");
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true, read: true })));
      setUnreadCount(0);
      toast.success(t("all_marked_as_read", { defaultMessage: "Đã đánh dấu tất cả là đã đọc" }));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;

      return date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (token) {
      void fetchUnreadCount();
      void fetchNotifications();

      const interval = setInterval(() => {
        void fetchUnreadCount();
        void fetchNotifications();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [token, fetchUnreadCount, fetchNotifications]);

  const fetchUserProfile = useCallback(async () => {
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
  }, [dispatch]);

  // Cần thiết để tránh lỗi Hydration mismatch khi icon Mặt trăng/Mặt trời khác nhau giữa server/client
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));

    if (token && !user) {
      void fetchUserProfile();
    }

    return () => cancelAnimationFrame(frame);
  }, [fetchUserProfile, token, user]);

  const handleLogout = async () => {
    if (refreshToken) {
      try {
        await api.post("/iam-service/api/auth/logout", { refreshToken }, { skipAuth: true });
      } catch (error) {
        console.error("Logout API failed", error);
      }
    }
    dispatch(logoutAction());
    toast.info(t("logged_out_success"));
    router.push(`/${locale}/user/homepage`);
  };

  const handleCreateEvent = () => {
    if (!token) {
      toast.error(t("login_required_to_create_event"));
      router.replace(`/${locale}/auth/login?callbackUrl=/${locale}/organizer/center`);
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

    const search = searchParams.toString();
    const newPath = segments.join("/") + (search ? `?${search}` : "");

    router.push(newPath);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-none bg-navbar-topbar-bg transition-colors duration-300">
      <div className="mx-auto px-4 h-20 flex items-center justify-between gap-4">

        {/* === LEFT: LOGO === */}
        <Link href={`/${locale}/user/homepage`} className="flex items-center shrink-0 hover:opacity-90 transition-opacity">
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

        {/* === CENTER: SEARCH BAR === */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="w-full flex items-center 	bg-bg-surface border border-border-default rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-button-primary-bg-default focus-within:border-button-primary-bg-default transition-all h-11">
            <div className="pl-4 text-text-muted">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder={t('search_placeholder')}
              className="flex-1 px-3 py-2 bg-transparent text-text-primary outline-none placeholder:text-text-muted"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <div className="h-6 w-px bg-border mx-2"></div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 text-sm font-medium text-text-secondary hover:text-button-primary-bg-default transition-colors cursor-pointer"
            >
              {t("search_button")}
            </button>
          </div>
        </div>

        {/* === RIGHT: ACTIONS === */}
        <div className="flex items-center gap-3 lg:gap-4">

          {/* Nút Tạo sự kiện (Primary Button) */}
          <button
            onClick={handleCreateEvent}
            className="group relative overflow-hidden hidden lg:flex items-center gap-2 bg-button-primary-bg-default text-button-primary-text-default px-4 py-2.5 rounded-ds-lg font-medium transition-colors shadow-sm cursor-pointer "
          >
            <span className="absolute inset-0 w-full h-full bg-button-accent-bg-hover origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 z-0"></span>
            <div className="relative z-10 bg-white/20 p-0.5 rounded border border-white/30">
              <Users size={14} strokeWidth={3} />
            </div>
            <span className="relative z-10">
              {isOrganization ? t("organizer_center") : t("switch_to_organizer")}
            </span>
          </button>

          {/* Nút Vé của tôi (Secondary Button) */}
          {user &&
            <Link href={`/${locale}/user/tickets`} className="group relative overflow-hidden hidden lg:flex items-center gap-2 border border-border-default text-text-primary px-4 py-2.5 rounded-lg font-medium hover:border-button-primary-bg-default transition-colors cursor-pointer bg-transparent">
              <span className="absolute inset-0 w-full h-full bg-bg-subtle origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 z-0"></span>
              <Ticket size={18} className="relative z-10 text-text-secondary" />
              <span className="relative z-10">{t("my_tickets")}</span>
            </Link>
          }

          {/* Icon Notification */}
          {user && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2.5 border border-border-default rounded-lg text-text-secondary hover:border-button-primary-bg-default transition-colors cursor-pointer outline-none">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-feedback-error-bg text-button-primary-text-default text-[10px] font-bold h-5 min-w-5 px-1 flex items-center justify-center rounded-full border-2 border-navbar-topbar-bg animate-pulse">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
                <div className="flex items-center justify-between p-3 border-b border-border-default bg-bg-surface/50">
                  <span className="font-semibold text-sm text-text-primary">
                    {t("notifications", { defaultMessage: "Thông báo" })}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-medium text-button-primary-bg-default hover:underline cursor-pointer bg-transparent border-none"
                    >
                      {t("mark_all_read", { defaultMessage: "Đánh dấu tất cả đã đọc" })}
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto divide-y divide-border-default">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                      <Bell size={32} className="text-text-muted mb-2 opacity-50" />
                      <p className="text-sm text-text-secondary font-medium">
                        {t("no_notifications", { defaultMessage: "Không có thông báo nào" })}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {t("no_notifications_desc", { defaultMessage: "Chúng tôi sẽ thông báo khi có cập nhật mới." })}
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const isNotifRead = notif.isRead || notif.read;
                      return (
                        <div
                          key={notif.id}
                          onClick={() => {
                            void handleMarkAsRead(notif.id);
                            if (notif.type === "TICKET" || notif.type === "PAYMENT") {
                              router.push(`/${locale}/user/tickets`);
                            } else if (notif.type === "EVENT") {
                              router.push(`/${locale}/user/events`);
                            }
                          }}
                          className={`flex gap-3 p-3 hover:bg-bg-subtle cursor-pointer transition-colors ${
                            !isNotifRead ? "bg-button-primary-bg-default/5 dark:bg-button-primary-bg-default/10" : ""
                          }`}
                        >
                          <div className="w-10 h-10 p-1 rounded overflow-hidden shrink-0 border border-border-default relative bg-bg-surface flex items-center justify-center">
                            <Image
                              src={notif.imageUrl || "/evoticket-logo/light/light-icon-only.svg"}
                              alt="Notification Icon"
                              fill
                              className={notif.imageUrl ? "object-cover" : "object-contain p-1"}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold leading-tight text-text-primary ${!isNotifRead ? "font-bold" : ""}`}>
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-text-secondary leading-snug mt-1 break-words">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-text-muted mt-1">
                              {formatTime(notif.createdAt)}
                            </p>
                          </div>
                          {!isNotifRead && (
                            <div className="w-2 h-2 rounded-full bg-button-primary-bg-default mt-1.5 shrink-0" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* === THEME & LANGUAGE (OUTSIDE) === */}
          <div className={`${user ? "hidden lg:flex" : "flex"} items-center`}>
            <button
              onClick={switchLanguage}
              className="ml-2 w-10 h-10 flex items-center justify-center rounded-full bg-button-secondary-bg-default text-text-secondary hover:bg-border-default transition-colors font-bold text-xs cursor-pointer"
              title="Chuyển đổi ngôn ngữ / Switch Language"
            >
              {locale === "vi" ? "EN" : "VI"}
            </button>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-2 p-2 rounded-full bg-button-secondary-bg-default text-text-secondary hover:bg-border-default transition-colors cursor-pointer"
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

          {/* User Profile Dropdown */}
          {user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 border border-border-default rounded-lg p-1 pr-2 hover:border-button-primary-bg-default cursor-pointer transition-colors outline-none">
                  <div className="w-8 h-8 rounded bg-linear-to-tr from-button-primary-bg-default to-button-accent-bg-default overflow-hidden relative">
                    <Image
                      src={user.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                      alt="User"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <ChevronDown size={16} className="text-text-muted" />
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
                  <User className="h-4 w-4" />
                  <span>{t("profile")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/${locale}/user/favorites`)}>
                  <Heart className="h-4 w-4 text-rose-500" />
                  <span>{t("favorite_events")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/${locale}/user/tickets`)} className="flex lg:hidden">
                  <Ticket className="h-4 w-4" />
                  <span>{t("my_tickets")}</span>
                </DropdownMenuItem>
                {/* <DropdownMenuSeparator className="lg:hidden" /> */}
                <DropdownMenuItem onClick={switchLanguage} className="lg:hidden">
                  <Globe className="h-4 w-4" />
                  <span>{locale === "vi" ? "English" : "Tiếng Việt"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="lg:hidden">
                  {mounted ? (
                    theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-feedback-error-text hover:text-feedback-error-text hover:bg-feedback-error-bg/10 cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  <span>{t("logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <button
                onClick={() => {
                  const search = searchParams.toString();
                  const fullPath = pathname + (search ? `?${search}` : '');
                  router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(fullPath)}`);
                }}
                className="flex items-center gap-2 border border-border-default rounded-lg px-4 py-2 hover:border-button-primary-bg-default cursor-pointer transition-colors text-sm font-medium"
              >
                <LogInIcon size={16} className="text-text-secondary" />
                <span>{t('login', { defaultMessage: 'Đăng nhập' })}</span>
              </button>
              {/* <button
                onClick={() => router.push(`/${locale}/auth/register?callbackUrl=${encodeURIComponent(pathname)}`)}
                className="flex items-center gap-2 border border-border-default rounded-ds-lg px-4 py-2 hover:border-primary cursor-pointer transition-colors text-sm font-medium"
              >
                <UserPlus size={16} className="text-text-secondary" />
                <span>{t('register', { defaultMessage: 'Đăng ký' })}</span>
              </button> */}
            </>
          )}


        </div>
      </div>
    </header>
  );
}
