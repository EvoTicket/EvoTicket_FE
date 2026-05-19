"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Wifi, Clock, RefreshCw, Zap, Pause, Keyboard, CloudOff, CheckCircle2, XCircle, AlertCircle, Play, FlipHorizontal, Eye, EyeOff, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import QrScanner from "qr-scanner";
import { toast } from "react-toastify";
import api from "@/src/lib/axios";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setCredentials, logout, selectAuth } from "@/src/store/slices/authSlice";

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
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector(selectAuth);

  const [isConfigured, setIsConfigured] = useState(false);
  const [config, setConfig] = useState({ eventId: "", eventName: "", showtimeId: "", showtimeName: "", gate: "" });

  const [ticketCode, setTicketCode] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [scanStatus, setScanStatus] = useState<"idle" | "verifying" | "success" | "error" | "invalid">("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Checker Login States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Reset configuration on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setIsConfigured(false);
      setConfig({ eventId: "", eventName: "", showtimeId: "", showtimeName: "", gate: "" });
    }
  }, [isAuthenticated]);

  const handleCheckerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const response = await api.post(
        "/iam-service/api/auth/login",
        { email, password },
        { skipAuth: true } as any
      );
      const data = response.data;
      if (data.status === 200) {
        dispatch(setCredentials({ token: data.data.token, refreshToken: data.data.refreshToken, user: data.data.user }));
        toast.success(locale === "vi" ? "Đăng nhập tài khoản kiểm soát viên thành công!" : "Checker account logged in successfully!");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || (locale === "vi" ? "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!" : "Login failed. Please check your credentials!");
      toast.error(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const [lastResult, setLastResult] = useState<{
    code: string;
    time: string;
    status: "VALID" | "INVALID" | "USED";
    message: string;
  } | null>(null);

  const params = useParams();
  const locale = params?.locale || "vi";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [activeCameraId, setActiveCameraId] = useState("");
  const [networkStatus, setNetworkStatus] = useState<{ online: boolean; strength: string; color: string }>({ online: true, strength: "...", color: "text-gray-400" });
  const [currentTime, setCurrentTime] = useState("");

  // Mock Data
  const availableEvents = [
    {
      id: "EVT-001",
      name: "Anh Trai Say Hi Concert",
      showtimes: [
        { id: "ST-001", name: "Đêm diễn 1 - 20:00 19/05/2026" },
        { id: "ST-002", name: "Đêm diễn 2 - 20:00 20/05/2026" }
      ]
    },
    {
      id: "EVT-002",
      name: "Ráp Việt Season 4 Final",
      showtimes: [
        { id: "ST-003", name: "Chung kết Thương Hiệu - 19:30 24/05/2026" }
      ]
    },
    {
      id: "EVT-003",
      name: "Sky Tour 2026 - Sơn Tùng MTP",
      showtimes: [
        { id: "ST-004", name: "Hà Nội - 19:00 30/05/2026" },
        { id: "ST-005", name: "Đà Nẵng - 19:00 31/05/2026" }
      ]
    }
  ];

  const availableGates = ["Gate A", "Gate B", "Gate C", "VIP Entrance"];

  const [inputMode, setInputMode] = useState<InputMode>("laptop");
  const [isMirrored, setIsMirrored] = useState(inputMode === "laptop");

  // Automatically detect mobile device on mount to set default inputMode to "phone"
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        setInputMode("phone");
      }
    }
  }, []);

  // Keep mirror state synced with inputMode on change
  useEffect(() => {
    setIsMirrored(inputMode === "laptop");
  }, [inputMode]);

  const [currentHintIndex, setCurrentHintIndex] = useState(0);

  const scanHints = [
    locale === "vi" ? "Hướng mã QR vào tâm khung hình" : "Point QR code at the center of the frame",
    locale === "vi" ? "Giữ yên camera để tự động bắt nét" : "Hold camera still to focus automatically",
    locale === "vi" ? "Đưa mã QR lại gần hơn nếu quá mờ" : "Move QR code closer if it is too blurry",
    locale === "vi" ? "Tránh ánh sáng phản chiếu trực tiếp" : "Avoid direct light reflection or glare",
    locale === "vi" ? "Đảm bảo mã QR hiển thị trọn vẹn" : "Make sure the entire QR code is visible"
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

    const qrToken = extractQrToken(code);
    console.log("Scanned raw content:", code);
    console.log("Extracted QR Token:", qrToken);

    if (!qrToken) {
      toast.error(locale === "vi" ? "Không tìm thấy token trong mã QR!" : "No token found in QR code!");
      return;
    }

    setScanStatus("verifying");
    setTicketCode(qrToken);

    try {
      const parsedEventId = isNaN(Number(config.eventId)) ? config.eventId : Number(config.eventId);
      const parsedShowtimeId = isNaN(Number(config.showtimeId)) ? config.showtimeId : Number(config.showtimeId);

      const response = await api.post("/checkin-service/api/v1/checker/scan", {
        QRtoken: qrToken,
        showtimeID: parsedShowtimeId,
        eventID: parsedEventId,
        deviceId: activeCameraId || "no-camera-active",
        gate: config.gate,
      });

      const now = new Date().toLocaleTimeString(locale as string, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const resData = response.data;
      const successMessage = resData?.message || (locale === "vi" ? "Vé hợp lệ. Chào mừng quý khách!" : "Valid ticket. Welcome!");

      setScanStatus("success");
      setLastResult({
        code: qrToken,
        time: now,
        status: "VALID",
        message: successMessage,
      });

      toast.success(locale === "vi" ? "Vé hợp lệ!" : "Valid ticket!");
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
        (locale === "vi" ? "Lỗi hệ thống khi xác minh vé." : "System error verifying ticket.");

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

      toast.error(errorMessage);
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
            onDecodeError: () => {}, // Quiet on normal decode errors
            preferredCamera: facingMode,
            highlightScanRegion: true,
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
              setCameraError(errMsg || (locale === "vi" ? "Không thể khởi động camera" : "Could not start camera"));
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
          toast.info(locale === "vi" ? "Thiết bị không hỗ trợ đèn flash" : "Device does not support flashlight");
        }
      } catch (err) {
        console.error("Flashlight error:", err);
        toast.error(locale === "vi" ? "Lỗi khi điều khiển đèn flash" : "Error controlling flashlight");
      }
    }
  };

  const toggleScanning = () => {
    setIsScanning(!isScanning);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Neon Glow Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-emerald-500/5 to-transparent blur-[80px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-emerald-500/0 to-transparent blur-[80px]"></div>
        </div>

        {/* Login Card */}
        <div className="z-10 w-full max-w-[420px] bg-[#161624]/85 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)] animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)] animate-scanner-laser"></div>
              <User className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-[26px] font-black text-white tracking-tighter mb-1.5 uppercase">EVOTICKET CHECKER</h1>
            <p className="text-[12px] text-emerald-400 font-bold tracking-wider uppercase">
              {locale === "vi" ? "HỆ THỐNG KIỂM SOÁT VÉ SỰ KIỆN" : "EVENT TICKET CHECK-IN SYSTEM"}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleCheckerLogin}>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                {locale === "vi" ? "Email Tài khoản" : "Account Email"}
              </label>
              <input
                type="email"
                placeholder="checker@evoticket.com"
                className="w-full px-4 py-3.5 bg-[#1F1F30] text-white border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-[14px] placeholder-gray-500 font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                {locale === "vi" ? "Mật khẩu" : "Password"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-[#1F1F30] text-white border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-[14px] placeholder-gray-500 font-medium pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98] text-[15px] shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
              >
                {isLoggingIn
                  ? (locale === "vi" ? "ĐANG XÁC THỰC..." : "AUTHENTICATING...")
                  : (locale === "vi" ? "ĐĂNG NHẬP KIỂM SOÁT" : "LOG IN TO CHECKER")}
              </button>
            </div>
          </form>
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
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-white leading-none mb-0.5">{user?.firstName ? `${user.firstName} ${user.lastName || ""}` : (locale === "vi" ? "Kiểm soát viên" : "Checker")}</span>
            <span className="text-[9px] font-medium text-gray-400 leading-none">{user?.email || "online"}</span>
          </div>
          <button
            onClick={() => {
              dispatch(logout());
              toast.info(locale === "vi" ? "Đã đăng xuất tài khoản kiểm soát viên" : "Checker account logged out");
            }}
            className="ml-2 text-gray-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
            title={locale === "vi" ? "Đăng xuất" : "Log out"}
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="p-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Checker Setup</h1>
            <p className="text-gray-500 text-sm mb-8 font-medium">Vui lòng cấu hình sự kiện và cổng kiểm soát để bắt đầu.</p>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Sự kiện</label>
                <div className="relative group">
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer transition-all"
                    value={config.eventId}
                    onChange={(e) => {
                      const event = availableEvents.find(ev => ev.id === e.target.value);
                      setConfig({
                        eventId: e.target.value,
                        eventName: event?.name || "",
                        showtimeId: "",
                        showtimeName: "",
                        gate: config.gate
                      });
                    }}
                  >
                    <option value="" disabled>Chọn sự kiện...</option>
                    {availableEvents.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-emerald-500 transition-colors">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Suất diễn</label>
                <div className="relative group">
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    value={config.showtimeId}
                    disabled={!config.eventId}
                    onChange={(e) => {
                      const event = availableEvents.find(ev => ev.id === config.eventId);
                      const showtime = event?.showtimes.find(st => st.id === e.target.value);
                      setConfig({ ...config, showtimeId: e.target.value, showtimeName: showtime?.name || "" });
                    }}
                  >
                    <option value="" disabled>{config.eventId ? "Chọn suất diễn..." : "Chọn sự kiện trước..."}</option>
                    {config.eventId && availableEvents.find(ev => ev.id === config.eventId)?.showtimes.map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-emerald-500 transition-colors">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Cổng kiểm soát</label>
                <div className="relative group">
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer transition-all"
                    value={config.gate}
                    onChange={(e) => setConfig({ ...config, gate: e.target.value })}
                  >
                    <option value="" disabled>Chọn cổng...</option>
                    {availableGates.map(gate => (
                      <option key={gate} value={gate}>{gate}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-emerald-500 transition-colors">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Thiết bị quét</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "phone" as InputMode, icon: "📱", label: "Camera ĐT", desc: "Camera sau" },
                    { value: "laptop" as InputMode, icon: "💻", label: "Laptop", desc: "Webcam" },
                    { value: "scanner" as InputMode, icon: "🔌", label: "Máy quét", desc: "USB HID" },
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
                    * Máy quét USB sẽ tự nhập mã qua bàn phím. Không cần camera.
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  if (config.eventId && config.showtimeId && config.gate) {
                    setIsConfigured(true);
                  } else {
                    toast.warning("Vui lòng chọn đầy đủ thông tin");
                  }
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 mt-4"
              >
                BẮT ĐẦU QUÉT
              </button>
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
                  <Search className="w-4 h-4 mr-1 text-emerald-600" />
                  <span className="text-base text-emerald-800">{config.gate}</span>
                </div>
                <div className="w-px h-3.5 bg-gray-200 hidden sm:block"></div>
                <div className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />
                  <span className="text-xs text-gray-500 font-medium">{config.showtimeName}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsConfigured(false)}
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                  title={locale === "vi" ? "Cấu hình lại" : "Reconfigure"}
                >
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => {
                    dispatch(logout());
                    toast.info(locale === "vi" ? "Đã đăng xuất tài khoản kiểm soát viên" : "Checker account logged out");
                  }}
                  className="bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                  title={locale === "vi" ? "Đăng xuất" : "Log out"}
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
                <h3 className="font-black text-xl mb-2">Chế độ máy quét USB</h3>
                <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                  Hướng máy quét vào mã QR trên vé. Kết quả sẽ tự động nhận diện.
                </p>
                <div className="mt-6 flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Đang chờ tín hiệu...</span>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-cover z-0 ${
                  isMirrored ? "scale-x-[-1]" : ""
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
                <h3 className="font-bold text-lg">Máy quét đang tạm dừng</h3>
                <p className="text-sm text-gray-300 mt-2">Nhấn nút phát để tiếp tục quét</p>
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-bold text-lg text-red-400">Lỗi Camera</h3>
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
                <span className="font-bold tracking-widest uppercase">Đang xác minh...</span>
              </div>
            )}

            {scanStatus === "success" && (
              <div className="absolute inset-0 z-30 bg-emerald-500/90 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/20">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>
                <h3 className="font-black text-2xl uppercase tracking-tighter">HỢP LỆ</h3>
                <span className="text-emerald-50 font-bold mt-2">{ticketCode}</span>
              </div>
            )}

            {scanStatus === "invalid" && (
              <div className="absolute inset-0 z-30 bg-red-500/90 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-900/20">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h3 className="font-black text-2xl uppercase tracking-tighter">KHÔNG HỢP LỆ</h3>
                <span className="text-red-50 font-bold mt-2">{ticketCode}</span>
              </div>
            )}

            <div className="absolute top-4 right-4 flex flex-col gap-3 z-40">
              {inputMode !== "scanner" && (
                <button
                  onClick={() => setIsMirrored(!isMirrored)}
                  className={`p-2.5 rounded-full backdrop-blur-sm border transition-all ${isMirrored ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-black/50 text-white border-white/10 hover:bg-black/70'}`}
                  title={locale === "vi" ? "Lật camera" : "Mirror camera"}
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
                  <div className="bg-black/65 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-2 max-w-[90%] text-center shadow-lg shadow-black/45">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[11px] font-bold text-gray-200 tracking-wide transition-all duration-300">
                      {scanHints[currentHintIndex]}
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="absolute bottom-8 left-0 right-0 text-center z-20 px-4">
              <h3 className="text-white font-bold text-lg mb-1 drop-shadow-md">
                {cameraError ? "Lỗi Camera" : isScanning ? "Đưa mã QR vào khung quét" : "Camera đã tắt"}
              </h3>
              <p className="text-gray-300 text-sm drop-shadow-md">Hỗ trợ quét trực tiếp & máy quét ngoài</p>
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
                  {scanStatus === "verifying" ? "ĐANG XÁC MINH..." : isScanning ? "SẴN SÀNG QUÉT" : "TẠM DỪNG"}
                </h3>
              </div>
              <span className="text-xs text-gray-500 font-medium uppercase">
                {lastResult ? `LẦN CUỐI (${lastResult.time})` : "CHƯA QUÉT"}
              </span>
            </div>

            {lastResult && (
              <div className="flex justify-between items-center mt-1">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900">{lastResult.code}</span>
                  <span className={`text-[11px] font-medium ${lastResult.status === "VALID" ? "text-emerald-600" : "text-red-600"}`}>
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
              <h3>Nhập mã vé thủ công</h3>
            </div>
            <div className="flex gap-2">
              <input
                id="manual-ticket-input"
                type="text"
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
            <span className="text-[10px] font-bold">ĐỒNG BỘ</span>
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
