"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CloudOff, MapPin, RefreshCw, Package, Clock, Database, ScanLine, ShieldCheck, Ban, Server, LayoutDashboard, Wifi, Network, CheckCircle2, AlertCircle } from "lucide-react";

export default function OfflineModePage() {
  const params = useParams();
  const locale = params?.locale || "vi";

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center pb-32">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative flex flex-col">

        {/* BLUE HEADER */}
        <div className="bg-[#0088CC] text-white pt-6 pb-12 px-4 rounded-b-3xl relative">
          <Link href={`/${locale}/checker`} className="absolute top-6 left-4 p-2 border border-white/30 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>

          <div className="mt-14 flex items-center gap-3 mb-2">
            <div className="p-2.5 border border-white/30 rounded-2xl bg-white/10">
              <CloudOff className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight uppercase tracking-wide">Chế độ ngoại tuyến</h1>
            </div>
          </div>
          <p className="text-sm text-white/90 font-medium">Thiết bị đang xác thực bằng dữ liệu cục bộ</p>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 px-4 -mt-6 z-10 flex flex-col gap-4 overflow-y-auto pb-6">

          {/* OVERVIEW CARD */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-bold text-gray-900 text-base">Anh Trai Say Hi Concert</h2>
                <div className="flex items-center gap-1 text-gray-900 font-bold mt-1 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Gate B</span>
                </div>
              </div>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded">OFFLINE</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Đồng bộ gần nhất</span>
                </div>
                <span className="font-bold text-gray-900 text-sm">18:42</span>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Package className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Gói dữ liệu cục bộ</span>
                </div>
                <span className="font-bold text-gray-900 text-sm">v12</span>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Đồng hồ thiết bị</span>
                </div>
                <span className="font-bold text-emerald-600 text-sm">Time OK</span>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Database className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Chờ đồng bộ</span>
                </div>
                <span className="font-bold text-amber-600 text-sm">7</span>
              </div>
            </div>
          </div>

          {/* CAPABILITIES LIST */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">

            {/* Active section */}
            <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Vẫn hoạt động</span>
            </div>
            <div className="flex flex-col border-b border-gray-100 divide-y divide-gray-50">
              <div className="px-4 py-3 flex justify-between items-center bg-white">
                <div className="flex items-center gap-3 text-gray-700">
                  <ScanLine className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium">Quét QR</span>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded">SẴN SÀNG</span>
              </div>
              <div className="px-4 py-3 flex justify-between items-center bg-white">
                <div className="flex items-center gap-3 text-gray-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium">Kiểm tra cục bộ</span>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded">SẴN SÀNG</span>
              </div>
              <div className="px-4 py-3 flex justify-between items-center bg-white">
                <div className="flex items-center gap-3 text-gray-700">
                  <Ban className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium">Chặn dùng lặp trên thiết bị</span>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded">SẴN SÀNG</span>
              </div>
            </div>

            {/* Pending section */}
            <div className="bg-amber-50 border-y border-amber-100 px-4 py-2.5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Xác nhận sau khi có mạng</span>
            </div>
            <div className="flex flex-col divide-y divide-gray-50">
              <div className="px-4 py-3 flex justify-between items-center bg-white opacity-80">
                <div className="flex items-center gap-3 text-gray-600">
                  <Server className="w-4 h-4" />
                  <span className="text-sm font-medium">Đồng bộ máy chủ</span>
                </div>
                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded">ĐỢI ĐỒNG BỘ</span>
              </div>
              <div className="px-4 py-3 flex justify-between items-center bg-white opacity-80">
                <div className="flex items-center gap-3 text-gray-600">
                  <Network className="w-4 h-4" />
                  <span className="text-sm font-medium">Đối chiếu giữa nhiều thiết bị</span>
                </div>
                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded">ĐỢI ĐỒNG BỘ</span>
              </div>
              <div className="px-4 py-3 flex justify-between items-center bg-white opacity-80">
                <div className="flex items-center gap-3 text-gray-600">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm font-medium">Cập nhật dashboard</span>
                </div>
                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded">ĐỢI ĐỒNG BỘ</span>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM FIXED ACTIONS */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex flex-col gap-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-20">
          <Link href={`/${locale}/checker`} className="w-full bg-[#0088CC] hover:bg-[#0077B3] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-500/20">
            <ScanLine className="w-5 h-5" />
            Tiếp tục quét ngoại tuyến
          </Link>

          <div className="flex gap-3">
            <button className="flex-1 bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Wifi className="w-4 h-4" />
              Thử kết nối lại
            </button>
            <Link href={`/${locale}/checker/sync`} className="flex-1 bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Hàng chờ đồng bộ
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
