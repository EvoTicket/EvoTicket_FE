"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle2, AlertTriangle, Info, Upload, RefreshCw, GitPullRequest } from "lucide-react";

export default function SyncQueuePage() {
  const params = useParams();
  const locale = params?.locale || "vi";

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center pb-32 relative">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl flex flex-col relative">
        
        {/* HEADER */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Link href={`/${locale}/checker`} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Chờ đồng bộ</h1>
            <p className="text-xs text-gray-500 font-medium">Các lượt quét ngoại tuyến chưa gửi lên hệ thống</p>
          </div>
        </div>

        {/* STATS TABS */}
        <div className="p-4 flex gap-2">
          <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl py-2 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-amber-600">7</span>
            <span className="text-[10px] font-bold text-amber-600 tracking-wider">PENDING</span>
          </div>
          <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-xl py-2 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-emerald-600">21</span>
            <span className="text-[10px] font-bold text-emerald-600 tracking-wider">SYNCED</span>
          </div>
          <div className="flex-1 bg-red-50 border border-red-200 rounded-xl py-2 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-red-600">1</span>
            <span className="text-[10px] font-bold text-red-600 tracking-wider">FAILED</span>
          </div>
          <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl py-2 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-blue-600">1</span>
            <span className="text-[10px] font-bold text-blue-600 tracking-wider">CONFLICT</span>
          </div>
        </div>

        {/* LISTINGS */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-6">
          
          {/* PENDING SECTION */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wide">Pending</h2>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">2</span>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              {/* Item 1 */}
              <div className="p-3 flex items-center justify-between border-b border-gray-100">
                <div className="flex gap-3 items-center">
                  <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-2 min-w-[60px]">
                    <span className="text-xs font-bold text-gray-900">19:41:05</span>
                    <span className="text-[10px] font-semibold text-gray-500">SCAN</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-sm">TCK-01921</span>
                    <div className="flex items-center text-emerald-600 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      <span className="text-xs font-bold">VALID</span>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded">WAITING</div>
              </div>
              {/* Item 2 */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex gap-3 items-center">
                  <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-2 min-w-[60px]">
                    <span className="text-xs font-bold text-gray-900">19:41:34</span>
                    <span className="text-[10px] font-semibold text-gray-500">SCAN</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-sm">TCK-01922</span>
                    <div className="flex items-center text-emerald-600 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      <span className="text-xs font-bold">VALID</span>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded">WAITING</div>
              </div>
            </div>
          </div>

          {/* FAILED SECTION */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <h2 className="text-sm font-bold text-red-700 uppercase tracking-wide">Failed</h2>
              <span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded">1</span>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-3 flex items-center justify-between">
                <div className="flex gap-3 items-center">
                  <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-2 min-w-[60px]">
                    <span className="text-xs font-bold text-gray-900">19:39:11</span>
                    <span className="text-[10px] font-semibold text-gray-500">SCAN</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-sm">TCK-01898</span>
                    <div className="flex items-center text-emerald-600 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      <span className="text-xs font-bold">VALID</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded">RETRY NEEDED</div>
                  <button className="text-xs font-bold text-red-600 underline underline-offset-2 hover:text-red-800">Thử lại</button>
                </div>
              </div>
            </div>
          </div>

          {/* CONFLICT SECTION */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide">Conflict</h2>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">1</span>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-3 flex items-center justify-between">
                <div className="flex gap-3 items-center">
                  <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-2 min-w-[60px]">
                    <span className="text-xs font-bold text-gray-900">19:38:52</span>
                    <span className="text-[10px] font-semibold text-gray-500">SCAN</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-sm">TCK-01874</span>
                    <div className="flex items-center text-emerald-600 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      <span className="text-xs font-bold">VALID locally</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded text-right leading-tight max-w-[120px]">CONFLICT AFTER RECONNECTION</div>
                  <Link href={`/${locale}/checker/sync/tck-01874`} className="text-xs font-bold text-blue-600 underline underline-offset-2 hover:text-blue-800 mt-1">Xem</Link>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM FIXED ACTIONS */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex flex-col gap-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          <button className="w-full bg-[#0F0F1A] hover:bg-black text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Upload className="w-5 h-5" />
            Đồng bộ ngay
          </button>
          
          <div className="flex gap-3">
            <button className="flex-1 bg-white border border-red-500 text-red-600 hover:bg-red-50 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Thử lại lỗi
            </button>
            <Link href={`/${locale}/checker/sync/tck-01874`} className="flex-1 bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <GitPullRequest className="w-4 h-4" />
              Xem xung đột
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
