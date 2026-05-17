"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertCircle, Clock, MapPin, Cloud, Smartphone, CheckCircle2, XCircle, PhoneCall, ListChecks, CloudCog } from "lucide-react";

export default function ConflictDetailPage() {
  const params = useParams();
  const locale = params?.locale || "vi";

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center pb-24">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative flex flex-col">
        
        {/* RED HEADER */}
        <div className="bg-[#E60000] text-white pt-6 pb-12 px-4 rounded-b-3xl relative">
          <div className="flex gap-3 items-start mb-4">
            <Link href={`/${locale}/checker/sync`} className="p-2 border border-white/30 rounded-ds-xl hover:bg-white/10 transition-colors shrink-0 mt-1">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div className="p-2 border border-white/30 rounded-ds-xl bg-white/10 shrink-0 mt-1">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Xung đột đồng bộ</h1>
              <p className="text-xs text-white/90 font-medium mt-1 pr-4">Kết quả quét ngoại tuyến không khớp sau khi có mạng trở lại</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-red-600 border border-red-400/50 px-2.5 py-1 rounded-full shadow-sm">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold tracking-wider">CẦN GIÁM SÁT XỬ LÝ</span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 px-4 -mt-6 z-10 flex flex-col gap-4 overflow-y-auto pb-6">
          
          {/* TICKET DETAILS CARD */}
          <div className="bg-white border border-gray-200 rounded-ds-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mã vé</span>
                <h2 className="text-xl font-bold text-gray-900 mt-0.5">TCK-01874</h2>
              </div>
              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded">CONFLICT</span>
            </div>

            <div className="flex gap-3 mb-4">
              <div className="flex-1 bg-gray-50 border border-gray-100 rounded-ds-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Giờ quét cục bộ</span>
                </div>
                <span className="font-bold text-gray-900 text-sm">19:38:52</span>
              </div>
              <div className="flex-1 bg-gray-50 border border-gray-100 rounded-ds-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Cổng cục bộ</span>
                </div>
                <span className="font-bold text-gray-900 text-sm">Gate B</span>
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-ds-xl p-3 flex gap-2.5">
              <CloudCog className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block mb-0.5">Ghi chú từ máy chủ</span>
                <p className="text-sm font-medium text-red-900 leading-tight">Vé đã được ghi nhận check-in tại Gate A trước đó</p>
              </div>
            </div>
          </div>

          {/* COMPARISON SECTION */}
          <div>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Đối chiếu kết quả</h3>
            
            <div className="relative">
              {/* Local Result */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-ds-2xl p-4 mb-3">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1.5 text-emerald-800">
                    <Smartphone className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wide">Kết quả cục bộ</span>
                  </div>
                  <span className="bg-emerald-200/50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">OFFLINE CACHE</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-lg font-bold">VALID locally</span>
                </div>
                <p className="text-xs text-gray-500 font-medium ml-8">Nguồn: Bộ đệm ngoại tuyến</p>
              </div>

              {/* Divider Pill */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
                <div className="bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">Khác biệt</div>
              </div>

              {/* Server Result */}
              <div className="bg-red-50 border border-red-200 rounded-ds-2xl p-4 mt-3">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1.5 text-red-800">
                    <Cloud className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wide">Kết quả máy chủ</span>
                  </div>
                  <span className="bg-red-200/50 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">RECONNECTED</span>
                </div>
                <div className="flex items-center gap-2 text-red-700 mb-1">
                  <XCircle className="w-6 h-6" />
                  <span className="text-lg font-bold">Already used</span>
                </div>
                <p className="text-xs text-gray-500 font-medium ml-8">Nguồn: Backend sau khi kết nối lại</p>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM FIXED ACTIONS */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex flex-col gap-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-20">
          <button className="w-full bg-[#E60000] hover:bg-red-700 text-white font-bold py-3.5 rounded-ds-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-red-500/20">
            <PhoneCall className="w-5 h-5" />
            Gọi hỗ trợ
          </button>
          
          <Link href={`/${locale}/checker/sync`} className="w-full bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 font-bold py-3.5 rounded-ds-xl flex items-center justify-center gap-2 transition-colors">
            <ListChecks className="w-5 h-5" />
            Quay lại hàng chờ
          </Link>
        </div>

      </div>
    </div>
  );
}
