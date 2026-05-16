"use client";

import React, { useState } from "react";
import { Search, Wifi, Clock, RefreshCw, Zap, Pause, Keyboard, CloudOff } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CheckerPage() {
  const [ticketCode, setTicketCode] = useState("");
  const params = useParams();
  const locale = params?.locale || "vi";

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center pb-24">
      {/* Mobile container - max width on desktop */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative flex flex-col">
        
        {/* HEADER */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Anh Trai Say Hi Concert</h1>
              <div className="flex items-center text-gray-900 font-bold mt-1">
                <Search className="w-5 h-5 mr-1" />
                <span className="text-lg">Gate B</span>
              </div>
            </div>
            <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-ds-md">
              Online
            </span>
          </div>
          
          {/* Connection Status Bar */}
          <div className="flex items-center justify-between text-xs font-medium bg-white rounded-full border border-gray-200 p-1 px-3 shadow-sm">
            <div className="flex items-center text-emerald-500">
              <Wifi className="w-4 h-4 mr-1.5" />
              <span>Strong</span>
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <div className="flex items-center text-emerald-500">
              <Clock className="w-4 h-4 mr-1.5" />
              <span>Time OK</span>
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <div className="flex items-center text-gray-500">
              <RefreshCw className="w-4 h-4 mr-1.5" />
              <span>0 pending</span>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
          
          {/* SCANNER CONTAINER */}
          <div className="relative bg-[#151515] rounded-ds-3xl aspect-[3/4] w-full overflow-hidden flex flex-col items-center justify-center shadow-lg">
            {/* Camera feed placeholder. The user will inject their 3rd party scanner here. */}
            <div id="camera-container" className="absolute inset-0 z-0 bg-black/40"></div>
            
            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-3 z-20">
              <button className="bg-black/50 text-white p-2.5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-black/70 transition-colors">
                <Zap className="w-5 h-5" />
              </button>
              <button className="bg-black/50 text-white p-2.5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-black/70 transition-colors">
                <Pause className="w-5 h-5" fill="currentColor" />
              </button>
            </div>

            {/* QR Focus Frame */}
            <div className="relative w-[70%] aspect-square z-10 border-2 border-transparent">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-emerald-400 rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-emerald-400 rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-emerald-400 rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-emerald-400 rounded-br-xl"></div>
              
              {/* Animated Laser Line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)] animate-scanner-laser"></div>
            </div>

            {/* Helper Text */}
            <div className="absolute bottom-8 left-0 right-0 text-center z-10 px-4">
              <h3 className="text-white font-bold text-lg mb-1 drop-shadow-md">Đưa mã QR vé vào khung quét</h3>
              <p className="text-gray-300 text-sm drop-shadow-md">Ưu tiên quét mã trực tiếp từ ứng dụng vé</p>
            </div>
          </div>

          {/* STATUS CARD */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-ds-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <h3 className="font-bold text-emerald-800 tracking-wide text-sm">READY TO SCAN</h3>
              </div>
              <span className="text-xs text-gray-500 font-medium">LAST SCAN (19:42:18)</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-emerald-600 text-sm font-medium">Thiết bị đang xác minh trực tiếp</span>
              <span className="bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-1 rounded">VALID</span>
            </div>
          </div>

          {/* MANUAL INPUT */}
          <div className="bg-white border border-gray-200 rounded-ds-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-gray-900 font-bold text-sm">
              <Keyboard className="w-4 h-4 text-gray-500" />
              <h3>Nhập mã vé thủ công</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                placeholder="EVT-ATSH-B2-01928"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-ds-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium uppercase placeholder:normal-case"
              />
              <button className="bg-[#0F0F1A] hover:bg-black text-white font-bold text-sm px-4 py-2 rounded-ds-xl transition-colors whitespace-nowrap shadow-md">
                Xác minh
              </button>
            </div>
          </div>
          
          {/* Bottom Padding for scroll space */}
          <div className="h-6"></div>
        </div>

        {/* BOTTOM TABS */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex pb-safe shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
          <Link 
            href={`/${locale}/checker/sync`}
            className={`flex-1 flex flex-col items-center justify-center py-4 gap-1 text-gray-400 hover:text-gray-600`}
          >
            <div className="relative">
              <RefreshCw className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium leading-tight text-center">Hàng chờ<br/>đồng bộ</span>
          </Link>
          
          <div className="w-px bg-gray-100 my-4"></div>
          
          <Link 
            href={`/${locale}/checker/offline`}
            className={`flex-1 flex flex-col items-center justify-center py-4 gap-1 text-gray-400 hover:text-gray-600`}
          >
            <CloudOff className="w-5 h-5" />
            <span className="text-[11px] font-medium leading-tight text-center">Chế độ<br/>ngoại tuyến</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
