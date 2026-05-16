"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/src/lib/axios";

import { useTranslations } from "next-intl";

function CancelPaymentContent() {
  const t = useTranslations("CancelPayment");
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
      setErrorMessage(t('error_not_found'));
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
          toast.success(t('success_title'));
        } else {
          setStatus("error");
          const msg = response.data?.message || t('error_failed');
          setErrorMessage(msg);
          toast.error(msg);
        }
      } catch (error: any) {
        console.error("Lỗi khi hủy đơn hàng:", error);
        setStatus("error");

        let msg = t('error_general');
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
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-page p-4">
      <div className="max-w-md w-full bg-bg-surface rounded-3xl p-8 shadow-sm border border-border-default text-center flex flex-col items-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-button-primary-bg-default animate-spin mb-6" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">{t('processing_title')}</h1>
            <p className="text-text-muted">
              {t('processing_desc')}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-feedback-success-text mb-6" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">{t('success_title')}</h1>
            <p className="text-text-muted mb-8">
              {t('success_desc', { orderCode: orderCode ?? "" })}
            </p>
            <Link
              href={`/${locale}/user/homepage`}
              className="w-full bg-bg-inverse text-text-inverse hover:opacity-90 font-medium py-3 rounded-xl transition-colors text-sm flex items-center justify-center"
            >
              {t('back_to_homepage')}
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-feedback-error-text mb-6" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">{t('failed_title')}</h1>
            <p className="text-text-muted mb-8">
              {errorMessage}
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-button-secondary-bg-default hover:bg-button-secondary-bg-hover text-button-secondary-text-default font-medium py-3 rounded-xl transition-colors text-sm"
              >
                {t('retry_button')}
              </button>
              <Link
                href={`/${locale}/user/homepage`}
                className="flex-1 bg-bg-inverse text-text-inverse hover:opacity-90 font-medium py-3 rounded-xl transition-colors text-sm flex items-center justify-center"
              >
                {t('back_to_homepage')}
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
      <div className="min-h-screen w-full flex items-center justify-center bg-bg-page p-4">
        <Loader2 className="w-16 h-16 text-button-primary-bg-default animate-spin" />
      </div>
    }>
      <CancelPaymentContent />
    </Suspense>
  );
}
