"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/src/lib/axios";

function CancelPaymentContent() {
  const searchParams = useSearchParams();
  const { locale } = useParams();
  
  const orderCode = searchParams.get("orderCode");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const calledRef = useRef(false);

  useEffect(() => {
    // Chỉ chạy nếu có orderCode trên Client (tránh SSR Hydration mismatch)
    if (!orderCode) {
      setStatus("error");
      setErrorMessage("Không tìm thấy mã đơn hàng (orderCode) trong đường dẫn.");
      return;
    }

    const cancelOrder = async () => {
      // Đảm bảo API chỉ gọi 1 lần khi StrictMode bật
      if (calledRef.current) return;
      calledRef.current = true;

      try {
        const response = await api.post(`/order-service/api/v1/orders/${orderCode}/cancel`);
        
        // Backend có thể trả về Http Status 200, hoặc status bên trong body data
        if (response.status === 200 || response.data?.status === 200) {
          setStatus("success");
          toast.success("Đã hủy đơn hàng thành công");
        } else {
          setStatus("error");
          const msg = response.data?.message || "Hủy đơn hàng thất bại";
          setErrorMessage(msg);
          toast.error(msg);
        }
      } catch (error: any) {
        console.error("Lỗi khi hủy đơn hàng:", error);
        setStatus("error");
        
        let msg = "Có lỗi xảy ra khi hủy đơn hàng";
        if (error.response?.data?.message) {
           msg = error.response.data.message;
        }
        
        setErrorMessage(msg);
        toast.error(msg);
      }
    };

    cancelOrder();
  }, [orderCode]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center flex flex-col items-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý...</h1>
            <p className="text-gray-500">
              Vui lòng chờ trong giây lát, hệ thống đang xử lý yêu cầu hủy đơn hàng của bạn.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Hủy thành công!</h1>
            <p className="text-gray-500 mb-8">
              Đơn hàng <span className="font-semibold text-gray-900">#{orderCode}</span> của bạn đã được hủy thành công trên hệ thống.
            </p>
            <Link 
              href={`/${locale}/user/homepage`}
              className="w-full bg-[#1a1a1a] hover:bg-black text-white font-medium py-3 rounded-xl transition-colors text-sm flex items-center justify-center"
            >
              Về trang chủ
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Hủy thất bại</h1>
            <p className="text-gray-500 mb-8">
              {errorMessage}
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 rounded-xl transition-colors text-sm"
              >
                Thử lại
              </button>
              <Link 
                href={`/${locale}/user/homepage`}
                className="flex-1 bg-[#1a1a1a] hover:bg-black text-white font-medium py-3 rounded-xl transition-colors text-sm flex items-center justify-center"
              >
                Về trang chủ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CancelPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
      </div>
    }>
      <CancelPaymentContent />
    </Suspense>
  );
}
