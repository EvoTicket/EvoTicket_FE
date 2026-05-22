"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Wifi, Clock, RefreshCw, Zap, Pause, Keyboard, CloudOff, CheckCircle2, XCircle, AlertCircle, Play, FlipHorizontal, Eye, EyeOff, LogOut, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter, usePathname } from "next/navigation";
import QrScanner from "qr-scanner";
import { toast } from "react-toastify";
import api from "@/src/lib/axios";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setCredentials, logout, selectAuth } from "@/src/store/slices/authSlice";
import { decodeJWT } from "@/src/lib/jwt";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";
import { useTranslations } from "next-intl";

type InputMode = "phone" | "laptop" | "scanner";

interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
      error?: string;
      status?: string;
    };
  };
  message?: string;
}

const extractQrToken = (scannedText: string): string => {
  if (!scannedText) return "";
  const trimmed = scannedText.trim();

  // 1. If it's a URL, extract search parameters
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      const token = url.searchParams.get("qrToken") || url.searchParams.get("token") || url.searchParams.get("code");
      if (token) return token;
    } catch (e) {
      console.error("Failed to parse scanned text as URL:", e);
    }
  }

  // 2. If it's a JSON string, parse it
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      const token = parsed.qrToken || parsed.token || parsed.code;
      if (token) return token;
    } catch (e) {
      console.error("Failed to parse scanned text as JSON:", e);
    }
  }

  // 3. Otherwise return the raw string
  return trimmed;
};

export default function CheckerPage() {
  const t = useTranslations("CheckerPage");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params?.locale || "vi";
  const switchLocale = () => {
    const newLocale = locale === "vi" ? "en" : "vi";
    const pathWithoutLocale = pathname.replace(`/${locale}`, "");
    const newPath = `/${newLocale}${pathWithoutLocale}${window.location.search}`;
    router.replace(newPath);
  };

  const { isAuthenticated, user, token } = useAppSelector(selectAuth);

  const hasCheckerAccess = React.useMemo(() => {
    let roles: string[] = [];
    if (user?.roles && user.roles.length > 0) {
      roles = user.roles;
    } else if (token) {
      const decoded = decodeJWT(token);
      roles = decoded?.roles || [];
    }
    return roles.includes("CHECKER") || roles.includes("ROLE_CHECKER") || roles.includes("ADMIN") || roles.includes("ROLE_ADMIN");
  }, [user?.roles, token]);

  const [isConfigured, setIsConfigured] = useState(false);
  const [config, setConfig] = useState({ eventId: "", eventName: "", showtimeId: "", showtimeName: "" });

  const [ticketCode, setTicketCode] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [scanStatus, setScanStatus] = useState<"idle" | "verifying" | "success" | "error" | "invalid">("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Reset configuration and redirect on logout or not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setIsConfigured(false);
      setConfig({ eventId: "", eventName: "", showtimeId: "", showtimeName: "" });

      if (typeof window !== 'undefined') {
        const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
        router.replace(`/${locale}/auth/login?callbackUrl=${currentUrl}`);
      }
    } else if (!hasCheckerAccess) {
      router.replace(`/${locale}/user/homepage`);
    }
  }, [isAuthenticated, hasCheckerAccess, locale, router]);
  const [lastResult, setLastResult] = useState<{
    code: string;
    time: string;
    status: "VALID" | "INVALID" | "USED";
    message: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [activeCameraId, setActiveCameraId] = useState("");
  const [networkStatus, setNetworkStatus] = useState<{ online: boolean; strength: string; color: string }>({ online: true, strength: "...", color: "text-gray-400" });
  const [currentTime, setCurrentTime] = useState("");

  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !hasCheckerAccess) return;

    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const response = await api.get("/inventory-service/api/checkers/approved-events");
        const data = response.data?.data || [];

        const mappedEvents = data.map((event: any) => ({
          id: event.eventId.toString(),
          name: event.eventName,
          showtimes: (event.showtimes || []).map((st: any) => {
            const d = new Date(st.startDatetime);
            const timeStr = d.toLocaleTimeString(locale as string, { hour: '2-digit', minute: '2-digit' });
            const dateStr = d.toLocaleDateString(locale as string, { day: '2-digit', month: '2-digit', year: 'numeric' });
            let name = `${timeStr} ${dateStr}`;
            if (st.venue || st.provinceName) {
              name = `${st.venue || st.provinceName} - ${name}`;
            }
            return {
              id: st.showtimeId.toString(),
              name: name
            };
          })
        }));

        setAvailableEvents(mappedEvents);
      } catch (error) {
        console.error("Error fetching approved events:", error);
        toast.error(t("err_load_events"));
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [isAuthenticated, hasCheckerAccess, locale]);



  const [inputMode, setInputMode] = useState<InputMode>("laptop");
  const [isMirrored, setIsMirrored] = useState(inputMode === "laptop");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load config from sessionStorage and auto-detect mobile
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedConfig = sessionStorage.getItem("checker_config");
      const savedIsConfigured = sessionStorage.getItem("checker_isConfigured");
      const savedInputMode = sessionStorage.getItem("checker_inputMode");

      if (savedConfig && savedIsConfigured === "true") {
        try {
          setConfig(JSON.parse(savedConfig));
          setIsConfigured(true);
        } catch (e) {}
      }

      if (savedInputMode) {
        setInputMode(savedInputMode as InputMode);
      } else {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          setInputMode("phone");
        }
      }
      setIsHydrated(true);
    }
  }, []);

  // Keep mirror state synced with inputMode on change
  useEffect(() => {
    setIsMirrored(inputMode === "laptop");
  }, [inputMode]);

  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const consecutiveErrorsRef = useRef(0);
  const [scanWarning, setScanWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!isScanning || scanStatus !== "idle") {
        setScanWarning(null);
        consecutiveErrorsRef.current = 0;
        return;
    }
    
    const interval = setInterval(() => {
       const errors = consecutiveErrorsRef.current;
       if (errors > 120) {
           setScanWarning(locale === 'vi' ? 'Mã QR lóa sáng hoặc mờ, hãy chạm màn hình để lấy nét' : 'QR might be blurred, tap to focus');
       } else if (errors > 80) {
           setScanWarning(locale === 'vi' ? 'Giữ camera thẳng góc và cố định' : 'Keep camera straight and still');
       } else if (errors > 40) {
           setScanWarning(locale === 'vi' ? 'Đưa mã QR lại gần khung ngắm hơn' : 'Move QR code closer to the frame');
       } else {
           setScanWarning(null);
       }
    }, 500);
    return () => clearInterval(interval);
  }, [isScanning, scanStatus, locale]);

  const scanHints = [
    t("hint_center"),
    t("hint_still"),
    t("hint_closer"),
    t("hint_glare"),
    t("hint_visible")
  ];

  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setCurrentHintIndex((prev) => (prev + 1) % scanHints.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isScanning, scanHints.length]);

  // Real-time network status
  useEffect(() => {
    const updateNetwork = () => {
      const online = navigator.onLine;
      const conn = (navigator as any).connection;
      let strength = "Offline";
      let color = "text-red-500";
      if (online) {
        if (conn) {
          const dl = conn.downlink; // Mbps
          if (dl >= 5) { strength = "Strong"; color = "text-emerald-500"; }
          else if (dl >= 1) { strength = "Fair"; color = "text-amber-500"; }
          else { strength = "Weak"; color = "text-red-500"; }
        } else {
          strength = "Online";
          color = "text-emerald-500";
        }
      }
      setNetworkStatus({ online, strength, color });
    };
    updateNetwork();
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);
    const conn = (navigator as any).connection;
    conn?.addEventListener?.("change", updateNetwork);
    return () => {
      window.removeEventListener("online", updateNetwork);
      window.removeEventListener("offline", updateNetwork);
      conn?.removeEventListener?.("change", updateNetwork);
    };
  }, []);

  // Real-time clock
  useEffect(() => {
    const tick = () => setCurrentTime(new Date().toLocaleTimeString(locale as string, { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [locale]);

  const handleVerify = useCallback(async (code: string) => {
    if (scanStatus !== "idle") return;

    consecutiveErrorsRef.current = 0;
    setScanWarning(null);

    const qrToken = extractQrToken(code);
    console.log("Scanned raw content:", code);
    console.log("Extracted QR Token:", qrToken);

    if (!qrToken) {
      toast.error(t("err_no_token"));
      return;
    }

    setScanStatus("verifying");
    setTicketCode(qrToken);

    try {
      const parsedEventId = isNaN(Number(config.eventId)) ? config.eventId : Number(config.eventId);
      const parsedShowtimeId = isNaN(Number(config.showtimeId)) ? config.showtimeId : Number(config.showtimeId);

      const response = await api.post("/checkin-service/api/v1/checker/scan", {
        qrToken: qrToken,
        showtimeId: parsedShowtimeId,
        eventId: parsedEventId,
      });

      const now = new Date().toLocaleTimeString(locale as string, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const resData = response.data;
      const payload = resData.data || resData;

      if (payload.resultCode && payload.resultCode !== "VALID" && payload.resultMessage?.admitAllowed === false) {
          const errorMessage = payload.resultMessage.message || payload.message || resData.message || t("invalid");
          const responseStatus = payload.resultCode === "USED_QR" || payload.resultCode?.includes("USED") ? "USED" : "INVALID";
          
          setScanStatus("invalid");
          setLastResult({
              code: qrToken,
              time: now,
              status: responseStatus,
              message: errorMessage,
          });
          setTimeout(() => setScanStatus("idle"), 3000);
          return;
      }

      const successMessage = payload.resultMessage?.message || payload.message || resData.message || t("msg_valid");

      setScanStatus("success");
      setLastResult({
        code: qrToken,
        time: now,
        status: "VALID",
        message: successMessage,
      });

      setTimeout(() => setScanStatus("idle"), 3000);
    } catch (error) {
      console.error("Verification error:", error);
      const now = new Date().toLocaleTimeString(locale as string, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const err = error as AxiosErrorResponse;
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        (t("err_system"));

      const responseStatus =
        err.response?.data?.status ||
        (errorMessage.toLowerCase().includes("used") ||
          errorMessage.toLowerCase().includes("sử dụng") ||
          errorMessage.toLowerCase().includes("already")
          ? "USED"
          : "INVALID");

      setScanStatus("invalid");
      setLastResult({
        code: qrToken,
        time: now,
        status: responseStatus as "INVALID" | "USED",
        message: errorMessage,
      });

      setTimeout(() => setScanStatus("idle"), 3000);
    }
  }, [scanStatus, locale, config, activeCameraId, setScanStatus, setTicketCode, setLastResult]);

  const handleVerifyRef = useRef(handleVerify);
  useEffect(() => {
    handleVerifyRef.current = handleVerify;
  }, [handleVerify]);

  // Initialize Camera Scanner (Only when configured, skip for external scanner mode)
  useEffect(() => {
    if (!isConfigured) return;
    if (inputMode === "scanner") return; // External scanner uses keyboard emulation only

    let qrScanner: QrScanner | null = null;
    let isMounted = true;

    const startScanner = async () => {
      try {
        setCameraError(null);
        // Wait a bit for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 300));
        if (!isMounted) return;

        const videoElem = videoRef.current;
        if (!videoElem) return;

        const facingMode = inputMode === "phone" ? "environment" : "user";

        qrScanner = new QrScanner(
          videoElem,
          (result) => {
            const decodedText = typeof result === "object" ? result.data : result;
            handleVerifyRef.current(decodedText);
          },
          {
            onDecodeError: () => { 
                consecutiveErrorsRef.current += 1;
            }, // Track decode errors to show dynamic hints
            preferredCamera: facingMode,
            highlightScanRegion: false,
            highlightCodeOutline: true,
            maxScansPerSecond: 20
          }
        );
        scannerRef.current = qrScanner;

        if (isScanning) {
          try {
            await qrScanner.start();
            // Get active camera device ID from active stream track settings
            const stream = videoElem.srcObject as MediaStream | null;
            const track = stream?.getVideoTracks()?.[0];
            const activeId = track?.getSettings()?.deviceId || track?.label || "unknown-camera";
            setActiveCameraId(activeId);
          } catch (err) {
            console.error("Camera start failed:", err);
            if (isMounted) {
              const errMsg = err instanceof Error ? err.message : String(err);
              setCameraError(errMsg || (t("err_camera")));
            }
          }
        }
      } catch (err) {
        console.error("Scanner initialization failed:", err);
        if (isMounted) {
          const errMsg = err instanceof Error ? err.message : String(err);
          setCameraError(errMsg || "Unknown error");
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (qrScanner) {
        try {
          qrScanner.destroy();
        } catch (e) {
          console.error("Error destroying qr-scanner during cleanup", e);
        }
      }
      scannerRef.current = null;
      setFlashlightOn(false); // Reset flashlight state
      setActiveCameraId(""); // Reset active camera ID
    };
  }, [isConfigured, isScanning, locale, inputMode]);

  // Handle External Scanner (Keyboard Emulation)
  useEffect(() => {
    let buffer = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" && target.id !== "manual-ticket-input") {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) {
        buffer = "";
      }

      if (e.key === "Enter") {
        if (buffer.length > 2) {
          handleVerifyRef.current(buffer);
          buffer = "";
          e.preventDefault();
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
        setTicketCode(buffer); // Show scanned code in real-time
      }

      lastKeyTime = currentTime;
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);



  const toggleFlashlight = async () => {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        const hasFlash = await scanner.hasFlash();
        if (hasFlash) {
          await scanner.toggleFlash();
          setFlashlightOn(!flashlightOn);
        } else {
          toast.info(t("err_no_flash"));
        }
      } catch (err) {
        console.error("Flashlight error:", err);
        toast.error(t("err_flash"));
      }
    }
  };

  const toggleScanning = () => {
    setIsScanning(!isScanning);
  };

  if (!isHydrated || !isAuthenticated || !hasCheckerAccess) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-4" />
          <p className="text-gray-400 font-medium">
            {!isAuthenticated
              ? (t("redirecting_login"))
              : (t("redirecting_home"))}
          </p>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-6 relative">
        {/* Floating User Badge at top right */}
        <div className="absolute top-6 right-6 flex items-center gap-3 bg-[#161624]/60 backdrop-blur border border-white/10 px-4 py-2 rounded-2xl z-50">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
            {user?.firstName ? user.firstName[0].toUpperCase() : "C"}
          </div>
          <div className="hidden sm:flex flex-col mr-2">
            <span className="text-xs font-bold text-white leading-none mb-0.5">{user?.firstName ? `${user.firstName} ${user.lastName || ""}` : (t("checker_role"))}</span>
            <span className="text-[9px] font-medium text-gray-400 leading-none">{user?.email || "online"}</span>
          </div>
          <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
          <button
            onClick={switchLocale}
            className="text-gray-400 hover:text-emerald-400 transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer flex items-center justify-center font-bold text-xs"
            title="Switch Language"
          >
            {locale === "vi" ? "EN" : "VI"}
          </button>
          <button
            onClick={() => {
              dispatch(logout());
              toast.info(t("logout_success"));
            }}
            className="ml-2 text-gray-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
            title={t("logout")}
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="flex flex-col items-center w-full max-w-md">
          <div className="mb-6 flex items-center justify-center">
            <Image 
              src="/evoticket-logo/dark/dark-primary=horizontal-logo.svg" 
              alt="EvoTicket Scanner" 
              width={160} 
              height={40} 
              className="object-contain drop-shadow-md" 
              priority 
            />
          </div>
          <div className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
            <div className="p-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">{t("setup_title")}</h1>
            <p className="text-gray-500 text-sm mb-8 font-medium">{t("setup_desc")}</p>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t("event_label")}</label>
                <Listbox
                  value={config.eventId}
                  disabled={loadingEvents}
                  onChange={(value: string) => {
                    const event = availableEvents.find(ev => ev.id === value);
                    setConfig({
                      eventId: value,
                      eventName: event?.name || "",
                      showtimeId: "",
                      showtimeName: "",
                    });
                  }}
                >
                  <div className="relative group">
                    <ListboxButton className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-left cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                      <span className="block truncate">
                        {config.eventName || (loadingEvents ? (t("loading")) : (t("select_event")))}
                      </span>
                      <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 group-hover:text-emerald-500 transition-colors">
                        <Search className="w-4 h-4" />
                      </span>
                    </ListboxButton>
                    <ListboxOptions anchor="bottom" modal={false} className="z-10 w-[var(--button-width)] mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-auto focus:outline-none">
                      {availableEvents.length > 0 ? (
                        availableEvents.map(ev => (
                          <ListboxOption
                            key={ev.id}
                            value={ev.id}
                            className="data-[focus]:bg-emerald-50 data-[focus]:text-emerald-900 cursor-pointer select-none relative px-4 py-3 text-gray-900 data-[selected]:font-black font-medium transition-colors border-b border-gray-50 last:border-0"
                          >
                            {ev.name}
                          </ListboxOption>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 italic text-center">
                          {t("no_matching_data")}
                        </div>
                      )}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t("showtime_label")}</label>
                <Listbox
                  value={config.showtimeId}
                  disabled={!config.eventId}
                  onChange={(value: string) => {
                    const event = availableEvents.find(ev => ev.id === config.eventId);
                    const showtime = event?.showtimes.find((st: any) => st.id === value);
                    setConfig({ ...config, showtimeId: value, showtimeName: showtime?.name || "" });
                  }}
                >
                  <div className="relative group">
                    <ListboxButton className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-left cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                      <span className="block truncate">
                        {config.showtimeName || (config.eventId ? (t("select_showtime")) : (t("select_event_first")))}
                      </span>
                      <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 group-hover:text-emerald-500 transition-colors">
                        <Clock className="w-4 h-4" />
                      </span>
                    </ListboxButton>
                    <ListboxOptions anchor="bottom" modal={false} className="z-10 w-[var(--button-width)] mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-auto focus:outline-none">
                      {config.eventId && (availableEvents.find(ev => ev.id === config.eventId)?.showtimes?.length ? (
                        availableEvents.find(ev => ev.id === config.eventId)?.showtimes.map((st: any) => (
                          <ListboxOption
                            key={st.id}
                            value={st.id}
                            className="data-[focus]:bg-emerald-50 data-[focus]:text-emerald-900 cursor-pointer select-none relative px-4 py-3 text-gray-900 data-[selected]:font-black font-medium transition-colors border-b border-gray-50 last:border-0"
                          >
                            {st.name}
                          </ListboxOption>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 italic text-center">
                          {t("no_matching_data")}
                        </div>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>



              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t("scan_device")}</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "phone" as InputMode, icon: "📱", label: t("phone_camera"), desc: t("back_camera") },
                    { value: "laptop" as InputMode, icon: "💻", label: t("laptop"), desc: t("webcam") },
                    { value: "scanner" as InputMode, icon: "🔌", label: t("scanner"), desc: t("usb_hid") },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setInputMode(opt.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${inputMode === opt.value
                        ? "border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-500/10"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                        }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <span className={`text-xs font-bold ${inputMode === opt.value ? "text-emerald-700" : "text-gray-700"}`}>{opt.label}</span>
                      <span className="text-[10px] text-gray-400">{opt.desc}</span>
                    </button>
                  ))}
                </div>
                {inputMode === "scanner" && (
                  <p className="text-[10px] text-emerald-600 font-bold ml-1 mt-1">
                    {t("scanner_hint")}
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  if (config.eventId && config.showtimeId) {
                    setIsConfigured(true);
                    sessionStorage.setItem("checker_isConfigured", "true");
                    sessionStorage.setItem("checker_config", JSON.stringify(config));
                    sessionStorage.setItem("checker_inputMode", inputMode);
                  } else {
                    toast.warning(t("warn_incomplete"));
                  }
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 mt-4"
              >
                {t("start_scanning")}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative flex flex-col">

        {/* HEADER */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 mr-4">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{config.eventName}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-gray-900 font-bold">
                <div className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />
                  <span className="text-xs text-gray-500 font-medium">{config.showtimeName}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={switchLocale}
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors flex items-center justify-center text-gray-600 hover:text-emerald-600 font-bold text-xs w-8 h-8"
                  title="Switch Language"
                >
                  {locale === "vi" ? "EN" : "VI"}
                </button>
                <button
                  onClick={() => {
                    setIsConfigured(false);
                    sessionStorage.removeItem("checker_isConfigured");
                    sessionStorage.removeItem("checker_config");
                  }}
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                  title={t("reconfigure")}
                >
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => {
                    dispatch(logout());
                    toast.info(t("logout_success"));
                  }}
                  className="bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                  title={t("logout")}
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                </button>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                {user?.firstName ? `${user.firstName} (Online)` : "Online"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-medium bg-white rounded-full border border-gray-200 p-1 px-3 shadow-sm">
            <div className={`flex items-center ${networkStatus.color}`}>
              <Wifi className="w-4 h-4 mr-1.5" />
              <span>{networkStatus.strength}</span>
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <div className="flex items-center text-emerald-500">
              <Clock className="w-4 h-4 mr-1.5" />
              <span>{currentTime}</span>
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <div className="flex items-center text-gray-500">
              <RefreshCw className="w-4 h-4 mr-1.5" />
              <span>0 pending</span>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 p-4 pb-20 flex flex-col gap-4 overflow-y-auto">

          {/* SCANNER CONTAINER */}
          <div className="relative bg-[#151515] rounded-3xl aspect-[3/4] w-full overflow-hidden flex flex-col items-center justify-center shadow-lg group">
            {inputMode === "scanner" ? (
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0F0F1A] to-[#1a1a2e] flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mb-6 ring-2 ring-emerald-500/30">
                  <Keyboard className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="font-black text-xl mb-2">{t("usb_mode_title")}</h3>
                <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                  Hướng máy quét vào mã QR trên vé. Kết quả sẽ tự động nhận diện.
                </p>
                <div className="mt-6 flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{t("waiting_signal")}</span>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-cover z-0 ${isMirrored ? "scale-x-[-1]" : ""
                  }`}
                playsInline
                muted
              />
            )}

            {!isScanning && !cameraError && (
              <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <Pause className="w-8 h-8" fill="currentColor" />
                </div>
                <h3 className="font-bold text-lg">{t("scanner_paused")}</h3>
                <p className="text-sm text-gray-300 mt-2">{t("press_play")}</p>
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-bold text-lg text-red-400">{t("camera_error")}</h3>
                <p className="text-sm text-gray-300 mt-2 mb-6">{cameraError}</p>
                <button
                  onClick={() => setIsScanning(true)}
                  className="bg-white text-black font-bold px-6 py-2 rounded-xl text-sm"
                >
                  Thử lại
                </button>
              </div>
            )}

            {scanStatus === "verifying" && (
              <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white">
                <RefreshCw className="w-12 h-12 animate-spin text-emerald-400 mb-4" />
                <span className="font-bold tracking-widest uppercase">{t("verifying")}</span>
              </div>
            )}

            {scanStatus === "success" && (
              <div className="absolute inset-0 z-30 bg-emerald-500/90 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/20">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>
                <h3 className="font-black text-2xl uppercase tracking-tighter">{t("valid")}</h3>
                {lastResult?.message && (
                  <span className="text-emerald-50 text-sm mt-4 px-6 text-center max-w-sm bg-black/20 py-2 rounded-lg">{lastResult.message}</span>
                )}
              </div>
            )}

            {scanStatus === "invalid" && (
              <div className="absolute inset-0 z-30 bg-red-500/90 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-900/20">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h3 className="font-black text-2xl uppercase tracking-tighter">{t("invalid")}</h3>
                {lastResult?.message && (
                  <span className="text-red-50 text-sm mt-4 px-6 text-center max-w-sm bg-black/20 py-2 rounded-lg font-medium">{lastResult.message}</span>
                )}
              </div>
            )}

            <div className="absolute top-4 right-4 flex flex-col gap-3 z-40">
              {inputMode !== "scanner" && (
                <button
                  onClick={() => setIsMirrored(!isMirrored)}
                  className={`p-2.5 rounded-full backdrop-blur-sm border transition-all ${isMirrored ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-black/50 text-white border-white/10 hover:bg-black/70'}`}
                  title={t("mirror_camera")}
                >
                  <FlipHorizontal className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={toggleFlashlight}
                className={`p-2.5 rounded-full backdrop-blur-sm border transition-all ${flashlightOn ? 'bg-amber-400 text-black border-amber-500' : 'bg-black/50 text-white border-white/10 hover:bg-black/70'}`}
              >
                <Zap className="w-5 h-5" fill={flashlightOn ? "currentColor" : "none"} />
              </button>
              <button
                onClick={toggleScanning}
                className="bg-black/50 text-white p-2.5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-black/70 transition-all"
              >
                {isScanning ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5" fill="currentColor" />}
              </button>
            </div>

            {isScanning && scanStatus === "idle" && !cameraError && (
              <>
                <div className="relative w-[70%] aspect-square z-10 border-2 border-transparent">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-emerald-400 rounded-tl-xl"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-emerald-400 rounded-tr-xl"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-emerald-400 rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-emerald-400 rounded-br-xl"></div>
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)] animate-scanner-laser"></div>
                </div>

                <div className="absolute bottom-6 left-4 right-4 z-20 flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className={`backdrop-blur-md px-4 py-2.5 rounded-2xl border flex items-center gap-2 max-w-[90%] text-center shadow-lg transition-all duration-300 ${scanWarning ? 'bg-amber-500/20 border-amber-500/50 shadow-amber-900/20' : 'bg-black/65 border-white/10 shadow-black/45'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${scanWarning ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                    <span className={`text-[11px] font-bold tracking-wide transition-all duration-300 ${scanWarning ? 'text-amber-100' : 'text-gray-200'}`}>
                      {scanWarning || scanHints[currentHintIndex]}
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="absolute bottom-24 left-0 right-0 text-center z-20 px-4">
              <h3 className="text-white font-bold text-lg mb-1 drop-shadow-md">
                {cameraError ? t("camera_error") : isScanning ? t("point_qr") : t("camera_off")}
              </h3>
              <p className="text-gray-300 text-sm drop-shadow-md">{t("support_scan")}</p>
            </div>
          </div>

          {/* STATUS CARD */}
          <div className={`rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden border transition-all duration-300 ${lastResult?.status === "VALID" ? "bg-emerald-50 border-emerald-200" :
            lastResult?.status === "INVALID" || lastResult?.status === "USED" ? "bg-red-50 border-red-200" :
              "bg-gray-50 border-gray-200"
            }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${scanStatus === "verifying" ? "bg-amber-500 animate-pulse" : isScanning ? "bg-emerald-500" : "bg-gray-400"}`}></div>
                <h3 className="font-bold tracking-wide text-sm text-gray-700 uppercase">
                  {scanStatus === "verifying" ? t("verifying").toUpperCase() : isScanning ? t("ready_to_scan") : t("paused")}
                </h3>
              </div>
              <span className="text-xs text-gray-500 font-medium uppercase">
                {lastResult ? `${t("last_scan")} (${lastResult.time})` : t("not_scanned")}
              </span>
            </div>

            {lastResult && (
              <div className="flex justify-between items-center mt-1">
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${lastResult.status === "VALID" ? "text-emerald-600" : "text-red-600"}`}>
                    {lastResult.message}
                  </span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${lastResult.status === "VALID"
                  ? "bg-emerald-200 text-emerald-800"
                  : lastResult.status === "USED"
                    ? "bg-amber-200 text-amber-800"
                    : "bg-red-200 text-red-800"
                  }`}>
                  {lastResult.status}
                </span>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-gray-900 font-bold text-sm">
              <Keyboard className="w-4 h-4 text-gray-500" />
              <h3>{t("manual_input")}</h3>
            </div>
            <div className="flex gap-2">
              <input
                id="manual-ticket-input"
                type="password"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerify(ticketCode)}
                placeholder="TCK-01928..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => handleVerify(ticketCode)}
                disabled={!ticketCode || scanStatus === "verifying"}
                className="bg-[#0F0F1A] text-white font-bold text-sm px-4 py-2 rounded-xl disabled:bg-gray-400"
              >
                Xác minh
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM TABS */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex pb-safe shadow-lg">
          <Link href={`/${locale}/checker/sync`} className="flex-1 flex flex-col items-center justify-center py-4 gap-1 text-gray-400">
            <RefreshCw className="w-5 h-5" />
            <span className="text-[10px] font-bold">{t("sync")}</span>
          </Link>
          <div className="w-px bg-gray-100 my-4"></div>
          <Link href={`/${locale}/checker/offline`} className="flex-1 flex flex-col items-center justify-center py-4 gap-1 text-gray-400">
            <CloudOff className="w-5 h-5" />
            <span className="text-[10px] font-bold">OFFLINE</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
