"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Wifi, Clock, RefreshCw, Zap, Pause, Keyboard, CloudOff, CheckCircle2, XCircle, AlertCircle, Play } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "react-toastify";
import api from "@/src/lib/axios";

type InputMode = "phone" | "laptop" | "scanner";

export default function CheckerPage() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [config, setConfig] = useState({ eventId: "", eventName: "", gate: "" });

  const [ticketCode, setTicketCode] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [scanStatus, setScanStatus] = useState<"idle" | "verifying" | "success" | "error" | "invalid">("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [lastResult, setLastResult] = useState<{
    code: string;
    time: string;
    status: "VALID" | "INVALID" | "USED";
    message: string;
  } | null>(null);

  const params = useParams();
  const locale = params?.locale || "vi";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<{ online: boolean; strength: string; color: string }>({ online: true, strength: "...", color: "text-gray-400" });
  const [currentTime, setCurrentTime] = useState("");

  // Mock Data
  const availableEvents = [
    { id: "EVT-001", name: "Anh Trai Say Hi Concert" },
    { id: "EVT-002", name: "Ráp Việt Season 4 Final" },
    { id: "EVT-003", name: "Sky Tour 2026 - Sơn Tùng MTP" }
  ];

  const availableGates = ["Gate A", "Gate B", "Gate C", "VIP Entrance"];

  const [inputMode, setInputMode] = useState<InputMode>("laptop");

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

  // Initialize Camera Scanner (Only when configured, skip for external scanner mode)
  useEffect(() => {
    if (!isConfigured) return;
    if (inputMode === "scanner") return; // External scanner uses keyboard emulation only

    let html5QrCode: Html5Qrcode | null = null;
    let isMounted = true;

    const startScanner = async () => {
      try {
        setCameraError(null);
        // 1. Wait a bit for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 300));
        if (!isMounted) return;

        const container = document.getElementById("camera-container");
        if (!container) return;

        html5QrCode = new Html5Qrcode("camera-container");
        scannerRef.current = html5QrCode;

        const scanConfig = {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          rememberLastUsedCamera: true
        };

        if (isScanning) {
          try {
            const facingMode = inputMode === "phone" ? "environment" : "user";
            await html5QrCode.start(
              { facingMode },
              scanConfig,
              (decodedText) => handleVerify(decodedText),
              () => { }
            );
          } catch (err: any) {
            console.error("Camera start failed:", err);
            if (isMounted) {
              setCameraError(err.message || "Could not start camera");
            }
          }
        }
      } catch (err: any) {
        console.error("Scanner initialization failed:", err);
        if (isMounted) {
          setCameraError(err.message || "Unknown error");
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      const stopScanner = async () => {
        if (html5QrCode && html5QrCode.isScanning) {
          try {
            await html5QrCode.stop();
          } catch (e) {
            console.error("Error stopping scanner during cleanup", e);
          }
        }
      };
      stopScanner();
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
          handleVerify(buffer);
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

  const handleVerify = async (code: string) => {
    if (scanStatus === "verifying") return;

    setScanStatus("verifying");
    setTicketCode(code);

    try {
      const response = await api.post("/checkin-service/api/v1/checker/scan", {
        qrToken: code,
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
        code,
        time: now,
        status: "VALID",
        message: successMessage,
      });

      toast.success(locale === "vi" ? "Vé hợp lệ!" : "Valid ticket!");
      setTimeout(() => setScanStatus("idle"), 3000);
    } catch (error: any) {
      console.error("Verification error:", error);
      const now = new Date().toLocaleTimeString(locale as string, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        (locale === "vi" ? "Lỗi hệ thống khi xác minh vé." : "System error verifying ticket.");

      const responseStatus =
        error.response?.data?.status ||
        (errorMessage.toLowerCase().includes("used") ||
        errorMessage.toLowerCase().includes("sử dụng") ||
        errorMessage.toLowerCase().includes("already")
          ? "USED"
          : "INVALID");

      setScanStatus("invalid");
      setLastResult({
        code,
        time: now,
        status: responseStatus as "INVALID" | "USED",
        message: errorMessage,
      });

      toast.error(errorMessage);
      setTimeout(() => setScanStatus("idle"), 3000);
    }
  };

  const toggleFlashlight = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        const scanner = scannerRef.current as any;
        const capabilities = scanner.getRunningTrackCapabilities();

        if (capabilities && capabilities.torch) {
          await scanner.applyVideoConstraints({
            advanced: [{ torch: !flashlightOn }]
          });
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

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-6">
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
                      setConfig({ ...config, eventId: e.target.value, eventName: event?.name || "" });
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
                  if (config.eventId && config.gate) {
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
              <div className="flex items-center text-gray-900 font-bold mt-1">
                <Search className="w-4 h-4 mr-1 text-emerald-600" />
                <span className="text-base text-emerald-800">{config.gate}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => setIsConfigured(false)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                Online
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

          {/* html5-qrcode internal style overrides */}
          <style>{`
            #camera-container video {
              width: 100% !important;
              height: 100% !important;
              object-fit: cover !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
            }
            #camera-container img {
              display: none !important;
            }
            #camera-container > div {
              width: 100% !important;
              height: 100% !important;
              border: none !important;
            }
            #camera-container #camera-container__dashboard_section,
            #camera-container #camera-container__dashboard_section_csr,
            #camera-container #camera-container__header_message {
              display: none !important;
            }
          `}</style>

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
              <div id="camera-container" className="!absolute inset-0 z-0"></div>
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
              <div className="relative w-[70%] aspect-square z-10 border-2 border-transparent">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-emerald-400 rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-emerald-400 rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-emerald-400 rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-emerald-400 rounded-br-xl"></div>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)] animate-scanner-laser"></div>
              </div>
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
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  lastResult.status === "VALID"
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
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
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
