"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
// 💡 Import hook dịch thuật
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import api from "@/src/lib/axios";
import axios from "axios";

export default function LoginPage() {

  const router = useRouter();
  const { locale } = useParams();
  // Khởi tạo hook dịch thuật, sử dụng namespace 'Auth'
  const t = useTranslations('Auth');

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // function submit login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/iam-service/api/auth/login", {
        email: email,
        password: password
      });

      const data = response.data;

      if (data.status === 200) {
        // Success
        Cookies.set("token", data.data.token, { expires: 7 }); // Expires in 7 days
        toast.success(data.message || "Đăng nhập thành công!");
        router.push(`/${locale}/user/homepage`);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Đăng nhập thất bại");
      } else {
        console.error("Login error:", error);
        toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white p-4">
      <div className="flex flex-col md:flex-row items-center gap-10 max-w-5xl w-full justify-center">

        {/* --- CỘT TRÁI: FORM ĐĂNG NHẬP --- */}
        <div className="w-full max-w-[400px] bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('login_title')}</h1>
            <p className="text-sm text-gray-500">
              {t('login_subtitle')}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Input Email */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                {t('email_label')}
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">
                  {t('password_label')}
                </label>
                <Link
                  href="#"
                  className="text-xs text-gray-600 hover:text-black font-medium"
                >
                  {t('forgot_password')}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-sm pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Nút Đăng nhập */}
            <button
              type="submit"
              className="w-full bg-[#1a1a1a] hover:bg-black text-white font-medium py-2.5 rounded-lg transition-colors text-sm mt-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : t('login_button')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-400">
                {t('or_continue_with')}
              </span>
            </div>
          </div>

          {/* Nút Google */}
          <button className="w-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm">
            <GoogleIcon />
            Google
          </button>

          {/* Footer: Đăng ký */}
          <div className="text-center mt-6 text-xs text-gray-500">
            {t('no_account')}{" "}
            <Link href="register" className="font-semibold text-gray-700 underline decoration-gray-400 underline-offset-2 hover:text-black">
              {t('register_link')}
            </Link>
          </div>
        </div>

        {/* --- CỘT PHẢI: HÌNH ẢNH PLACEHOLDER --- */}
        <div className="hidden md:flex w-[400px] h-[400px] bg-[#dfe1e5] items-center justify-center">
          {/* Đây là mô phỏng icon hình ảnh placeholder như trong thiết kế */}
          <div className="w-1/2 h-1/2 border-2 border-white relative opacity-50">
            <div className="absolute inset-0 border-t-2 border-white rotate-45 scale-[1.4] origin-center translate-y-[45%]"></div>
            <div className="absolute inset-0 border-t-2 border-white -rotate-45 scale-[1.4] origin-center translate-y-[45%]"></div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Icon Google SVG component
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}