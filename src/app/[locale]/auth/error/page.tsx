"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const router = useRouter();
  const { locale } = useParams();
  const searchParams = useSearchParams();
  
  // Default to general error if no type is provided
  const [errorType, setErrorType] = useState<"general" | "google" | "session-expired">("general");

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "google") {
      setErrorType("google");
    } else if (type === "session-expired") {
      setErrorType("session-expired");
    } else {
      setErrorType("general");
    }
  }, [searchParams]);

  const handleRetry = () => {
    // Basic retry logic goes to login page, or can be customized
    router.push(`/${locale}/auth/login`);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#14141f] relative overflow-hidden font-sans p-4">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/30 via-primary/5 to-transparent blur-[80px]"></div>
        <svg className="absolute w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 65,-10 C 35,40 85,75 10,110" stroke="white" strokeWidth="0.1" fill="none" className="opacity-50" />
          <path d="M 80,-10 C 50,40 100,75 25,110" stroke="white" strokeWidth="0.05" fill="none" className="opacity-30" />
        </svg>
      </div>
      
      {/* Auth Card */}
      <div className="z-10 w-full max-w-[420px] bg-[#1e1b38]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl relative mt-[-10vh]">
        
        <div className="text-center mb-6">
          <h1 className="text-[24px] font-bold text-white mb-3 leading-snug px-4">
            {errorType === "google" 
              ? "Không thể kết nối dịch vụ đăng nhập" 
              : errorType === "session-expired"
                ? "Phiên đăng nhập không còn hợp lệ"
                : "Không thể hoàn tất đăng nhập"}
          </h1>
          <p className="text-[13px] text-gray-400 leading-relaxed px-2">
            {errorType === "google" 
              ? "Hệ thống không thể kết nối việc của đăng nhập thông qua dịch vụ Google vào lúc này. Vui lòng thử lại hoặc chọn phương thức khác."
              : errorType === "session-expired"
                ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục sử dụng đầy đủ tính năng của hệ thống."
                : "Hệ thống không thể xác minh yêu cầu đăng nhập của bạn vào lúc này. Vui lòng thử lại hoặc chọn phương thức khác."
            }
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] text-[14px] shadow-lg shadow-primary/20"
          >
            {errorType === "session-expired" ? "Đăng nhập lại" : "Thử lại"}
          </button>
          
          <button
            onClick={() => router.push(errorType === "session-expired" ? `/${locale}` : `/${locale}/auth/login`)}
            className="w-full bg-[#25233c] hover:bg-[#2d2a45] border border-white/5 text-gray-300 font-medium py-3 rounded-xl transition-colors text-[14px]"
          >
            {errorType === "google" 
              ? "Đăng nhập bằng email" 
              : errorType === "session-expired"
                ? "Về trang chủ"
                : "Quay lại đăng nhập"}
          </button>

          {errorType !== "session-expired" && (
            <button
              className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-gray-400 font-medium py-3 rounded-xl transition-colors text-[14px]"
            >
              Liên hệ hỗ trợ
            </button>
          )}
        </div>

        {errorType === "general" && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="px-3 bg-[#1e1b38] text-gray-500 uppercase tracking-wider">
                  Hoặc thử lại với
                </span>
              </div>
            </div>

            <button className="w-full bg-[#25233c] hover:bg-[#2d2a45] border border-white/5 text-gray-300 font-medium py-2.5 rounded-xl flex items-center justify-center gap-3 transition-colors text-[13px]">
              <GoogleIcon />
              Đăng nhập bằng Google
            </button>
          </>
        )}

        {errorType !== "session-expired" && (
          <div className="text-center mt-8 text-[12px] text-gray-500">
            Bạn chưa có tài khoản?{" "}
            <Link href={`/${locale}/auth/register`} className="text-gray-300 hover:text-white underline decoration-white/30 underline-offset-4 transition-colors">
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
