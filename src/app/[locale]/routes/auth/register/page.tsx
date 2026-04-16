"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State mô phỏng thanh độ mạnh mật khẩu (Strength bar)
  const [passwordStrength, setPasswordStrength] = useState(0); // 0 (yếu) đến 4 (mạnh)

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    // Logic đơn giản để mô phỏng độ mạnh mật khẩu
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    setPasswordStrength(strength);
    // Bạn sẽ cần lưu giá trị password vào state thực tế tại đây
  };

  const strengthBarColor = ['bg-gray-200', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthText = [
    'Tối thiểu 8 ký tự.',
    'Chứa chữ hoa và chữ thường.',
    'Chứa số và ký tự đặc biệt.'
  ];

  const renderStrengthIndicator = (index: number) => {
    const isCompleted = passwordStrength > index;
    const isMinLength = index === 0 && passwordStrength >= 1; // Ký tự tối thiểu (luôn là bước 1)

    return (
      <li key={index} className={`flex items-start text-xs ${isCompleted || isMinLength ? 'text-gray-900' : 'text-gray-400'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mt-0.5 mr-1 ${isCompleted ? 'text-green-500' : 'text-gray-300'}`}>
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        {strengthText[index]}
      </li>
    );
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white p-4">
      <div className="flex flex-col md:flex-row items-center gap-10 max-w-5xl w-full justify-center">

        {/* --- CỘT TRÁI: HÌNH ẢNH PLACEHOLDER --- */}
        <div className="hidden md:flex w-[400px] h-[600px] bg-[#f8f8f8] items-center justify-center">
          {/* Đây là mô phỏng icon hình ảnh placeholder như trong thiết kế */}
          <div className="w-1/3 h-1/3 border-2 border-gray-300 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 opacity-50">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        </div>

        {/* --- CỘT PHẢI: FORM ĐĂNG KÝ --- */}
        <div className="w-full max-w-[400px] bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="text-left mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Tạo tài khoản mới</h1>
            <p className="text-sm text-gray-500">
              Khám phá ngân hàng sự kiện và ví hữu về NFT ngay hôm nay.
            </p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>

            {/* Input Họ và Tên */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                Họ và tên
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
              />
            </div>

            {/* Input Email */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
              />
              <p className="text-[11px] text-gray-500">
                EvoTicket sử dụng email để tạo ví lưu ký, và sẽ không tiết lộ cho bên thứ ba.
              </p>
            </div>

            {/* Input Số điện thoại */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                Số điện thoại
              </label>
              <input
                type="tel"
                placeholder="0912 xxx xxx"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
              />
            </div>

            {/* Input Mật khẩu */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-sm pr-10"
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

              {/* Thanh độ mạnh mật khẩu */}
              <div className="flex justify-between mt-1 space-x-1">
                <div className={`h-1 flex-1 rounded-full ${strengthBarColor[Math.min(strengthBarColor.length - 1, passwordStrength)]}`} style={{ width: `${(passwordStrength / (strengthBarColor.length - 1)) * 100}%` }}></div>
                <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 1 ? strengthBarColor[Math.min(strengthBarColor.length - 1, passwordStrength)] : 'bg-gray-200'}`}></div>
                <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 2 ? strengthBarColor[Math.min(strengthBarColor.length - 1, passwordStrength)] : 'bg-gray-200'}`}></div>
                <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 3 ? strengthBarColor[Math.min(strengthBarColor.length - 1, passwordStrength)] : 'bg-gray-200'}`}></div>
              </div>

              {/* Yêu cầu mật khẩu */}
              <ul className="list-none pt-2 pl-0 space-y-1">
                {strengthText.map((_, index) => renderStrengthIndicator(index))}
              </ul>
            </div>

            {/* Input Xác nhận Mật khẩu */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Nút Tạo tài khoản */}
            <button className="w-full bg-[#1a1a1a] hover:bg-blacktext-button-primary-text-default font-medium py-2.5 rounded-lg transition-colors text-sm mt-4">
              Tạo tài khoản
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-400">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          {/* Nút Google */}
          <button className="w-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm">
            <GoogleIcon />
            Google
          </button>

          {/* Footer: Đăng nhập */}
          <div className="text-center mt-6 text-xs text-gray-500">
            Bạn đã có tài khoản?{" "}
            <Link href="#" className="font-semibold text-gray-700 underline decoration-gray-400 underline-offset-2 hover:text-black">
              Đăng nhập
            </Link>
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