"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import api from "@/src/lib/axios";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setCredentials } from "@/src/store/slices/authSlice";
import { setAppLoading, selectAppLoading } from "@/src/store/slices/appSlice";
import { useGoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const router = useRouter();
  const { locale } = useParams();

  const searchParams = useSearchParams();
  const callBackURL = searchParams.get('callbackUrl') || `/${locale}/user/homepage`;

  const dispatch = useAppDispatch();
  const t = useTranslations('Auth');

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loading = useAppSelector(selectAppLoading);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setAppLoading(true));

    try {
      const response = await api.post("/iam-service/api/auth/login",
        {
          email: email,
          password: password
        },
        { skipAuth: true } as any
      );

      const data = response.data;

      if (data.status === 200) {
        dispatch(setCredentials({ token: data.data.token, refreshToken: data.data.refreshToken }));
        toast.success(data.message || t('login_success', { defaultMessage: "Đăng nhập thành công!" }));
        router.push(callBackURL);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || t('login_failed', { defaultMessage: "Đăng nhập thất bại" }));
      } else {
        console.error("Login error:", error);
        toast.error(t('login_error', { defaultMessage: "Có lỗi xảy ra, vui lòng thử lại sau." }));
      }
    } finally {
      dispatch(setAppLoading(false));
    }
  }

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      dispatch(setAppLoading(true));
      try {
        const response = await api.post("/iam-service/api/auth/google",
          {
            accessToken: tokenResponse.access_token
          },
          { skipAuth: true } as any
        );

        const data = response.data;
        if (data.status === 200) {
          dispatch(setCredentials({ token: data.data.token, refreshToken: data.data.refreshToken }));
          toast.success(data.message || t('login_google_success', { defaultMessage: "Đăng nhập Google thành công!" }));
          router.push(callBackURL);
        }
      } catch (error: any) {
        toast.error(error.response.data.message || t('login_google_failed', { defaultMessage: "Đăng nhập Google thất bại!" }));
        console.error("Google Login Backend Error:", error);
      } finally {
        dispatch(setAppLoading(false));
      }
    },
    onError: (error) => {
      toast.error(t('google_connect_error', { defaultMessage: "Lỗi khi kết nối với Google" }));
      console.log('Google connection error:', error);
    }
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#14141f] relative overflow-hidden font-sans">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Glow effect matching the image */}
        <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/30 via-primary/5 to-transparent blur-[80px]"></div>
        
        {/* Sweeping curve lines matching the image */}
        <svg className="absolute w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 65,-10 C 35,40 85,75 10,110" stroke="white" strokeWidth="0.1" fill="none" className="opacity-50" />
          <path d="M 80,-10 C 50,40 100,75 25,110" stroke="white" strokeWidth="0.05" fill="none" className="opacity-30" />
        </svg>
      </div>
      
      {/* Auth Card */}
      <div className="z-10 w-full max-w-[420px] bg-[#1e1b38]/60 backdrop-blur-xl border border-white/5 rounded-ds-2xl p-8 shadow-2xl mx-4">
        
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold text-white mb-2">{t('login_title')}</h1>
          <p className="text-[13px] text-gray-400">
            {t('login_subtitle', { defaultMessage: "Nhập email để truy cập ví vé của bạn" })}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          {/* Input Email / Name */}
          <div>
            <label className="block text-[12px] font-medium text-gray-400 mb-2">
              Họ và tên
            </label>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              className="w-full px-4 py-3 bg-[#25233c] text-gray-200 border border-white/5 rounded-ds-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-[14px] placeholder-gray-500"
              value={email} // Using email state but placeholder is from design
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Input Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[12px] font-medium text-gray-400">
                Mật khẩu
              </label>
              <Link
                href={`/${locale}/auth/forgot-password`}
                className="text-[12px] text-gray-400 hover:text-white transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                className="w-full px-4 py-3 bg-[#25233c] text-gray-200 border border-white/5 rounded-ds-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-[14px] placeholder-gray-500 pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-ds-xl transition-all active:scale-[0.98] text-[15px] shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? t('processing', { defaultMessage: "Đang xử lý..." }) : t('login_button')}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-[11px]">
            <span className="px-3 bg-[#1e1b38] text-gray-500 uppercase tracking-wider">
              {t('or_continue_with', { defaultMessage: "Hoặc tiếp tục với" })}
            </span>
          </div>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={() => loginWithGoogle()}
          disabled={loading}
          className="w-full bg-[#25233c] hover:bg-[#2d2a45] border border-white/5 text-gray-300 font-medium py-3 rounded-ds-xl flex items-center justify-center gap-3 transition-colors text-[14px] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <GoogleIcon />
          Đăng nhập bằng Google
        </button>

        {/* Footer */}
        <div className="text-center mt-8 text-[13px] text-gray-500">
          Bạn chưa có tài khoản?{" "}
          <Link href={`/${locale}/auth/register`} className="text-gray-300 hover:text-white underline decoration-white/30 underline-offset-4 transition-colors">
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}