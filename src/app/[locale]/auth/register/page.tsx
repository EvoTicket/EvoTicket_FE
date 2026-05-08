"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import api from "@/src/lib/axios";
import { toast } from "react-toastify";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setAppLoading, selectAppLoading } from "@/src/store/slices/appSlice";

export default function RegisterPage() {
  const router = useRouter();
  const { locale } = useParams();
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loading = useAppSelector(selectAppLoading);

  const [passwordStrength, setPasswordStrength] = useState(0); 

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);

    let strength = 0;
    if (val.length >= 1) strength++;
    if (val.length >= 8) strength++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val) && (/[0-9]/.test(val))) strength++;
    setPasswordStrength(strength);
  };

  const strengthBarColor = ['bg-[#25233c]', 'bg-red-500', 'bg-yellow-500', 'bg-[#7a5af8]', 'bg-green-500'];
  const strengthText = [
    'Tối thiểu 8 ký tự.',
    'Chứa chữ hoa và chữ thường.',
    'Chứa số và ký tự đặc biệt.'
  ];

  const checkRequirement = (index: number) => {
    switch (index) {
      case 0: return password.length >= 8;
      case 1: return /[A-Z]/.test(password) && /[a-z]/.test(password);
      case 2: return /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
      default: return false;
    }
  };

  const renderStrengthIndicator = (index: number) => {
    const isCompleted = checkRequirement(index);
    return (
      <li key={index} className="flex items-center gap-2 text-[11px] text-gray-500 mb-1.5">
        <div className={`w-3 h-3 flex items-center justify-center rounded-sm ${isCompleted ? 'bg-[#25233c] text-primary' : 'bg-[#25233c] border border-white/5'}`}>
          {isCompleted && (
             <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
               <polyline points="20 6 9 17 4 12"></polyline>
             </svg>
          )}
        </div>
        <span className={`${isCompleted ? 'text-gray-300' : 'text-gray-500'}`}>{strengthText[index]}</span>
      </li>
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    dispatch(setAppLoading(true));

    const trimmedName = name.trim();
    const nameParts = trimmedName.split(" ");
    let firstNameValue = trimmedName;
    let lastNameValue = "";

    if (nameParts.length > 1) {
      firstNameValue = nameParts.pop() || "";
      lastNameValue = nameParts.join(" ");
    }

    try {
      const response = await api.post("/iam-service/api/auth/register",
        {
          email,
          password,
          firstName: firstNameValue,
          lastName: lastNameValue,
          phoneNumber: phone,
          dateOfBirth: "2006-03-16",
          gender: "MALE",
          userAddress: "string",
          provinceCode: 1,
          wardCode: 4
        },
        { skipAuth: true } as any
      );

      const data = response.data;
      if (data.status === 201) {
        toast.success(data.message || "Đăng ký thành công!");
        router.push(`/${locale}/auth/login`);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Đăng ký thất bại");
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
      }
      console.error("Register error:", error);
    } finally {
      dispatch(setAppLoading(false));
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#14141f] relative overflow-hidden font-sans py-8">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/30 via-primary/5 to-transparent blur-[80px]"></div>
        <svg className="absolute w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 65,-10 C 35,40 85,75 10,110" stroke="white" strokeWidth="0.1" fill="none" className="opacity-50" />
          <path d="M 80,-10 C 50,40 100,75 25,110" stroke="white" strokeWidth="0.05" fill="none" className="opacity-30" />
        </svg>
      </div>
      
      {/* Auth Card */}
      <div className="z-10 w-full max-w-[420px] bg-[#1e1b38]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl mx-4 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <div className="text-center mb-8">
          <h1 className="text-[26px] font-bold text-white mb-2">Tạo tài khoản mới</h1>
          <p className="text-[13px] text-gray-400">
            Khám phá hàng ngàn sự kiện và sở hữu vé NFT ngay hôm nay.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>

          {/* Input Họ và Tên */}
          <div>
            <label className="block text-[12px] font-medium text-gray-400 mb-1.5">Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-4 py-2.5 bg-[#25233c] text-gray-200 border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-[13px] placeholder-gray-500"
              required
            />
          </div>

          {/* Input Email */}
          <div>
            <label className="block text-[12px] font-medium text-gray-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="abc@gmail.com"
              className="w-full px-4 py-2.5 bg-[#25233c] text-gray-200 border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-[13px] placeholder-gray-500 mb-1.5"
              required
            />
            <p className="text-[10.5px] text-gray-500 leading-tight">
              EvoTicket sử dụng email để tạo ví lưu ký, và sẽ không tiết lộ cho bên thứ ba.
            </p>
          </div>

          {/* Input Số điện thoại */}
          <div>
            <label className="block text-[12px] font-medium text-gray-400 mb-1.5">Số điện thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0988 xxx xxx"
              className="w-full px-4 py-2.5 bg-[#25233c] text-gray-200 border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-[13px] placeholder-gray-500"
              required
            />
          </div>

          {/* Input Mật khẩu */}
          <div className="pt-1">
            <label className="block text-[12px] font-medium text-gray-400 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                value={password}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2.5 bg-[#25233c] text-gray-200 border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-[13px] placeholder-gray-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Thanh độ mạnh mật khẩu */}
            <div className="flex justify-between mt-2 mb-3 space-x-1">
              <div className={`h-1 flex-1 rounded-full ${strengthBarColor[Math.min(strengthBarColor.length - 1, passwordStrength)]}`} style={{ width: `${(passwordStrength / (strengthBarColor.length - 1)) * 100}%` }}></div>
              <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 2 ? strengthBarColor[Math.min(strengthBarColor.length - 1, passwordStrength)] : 'bg-white/10'}`}></div>
              <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 3 ? strengthBarColor[Math.min(strengthBarColor.length - 1, passwordStrength)] : 'bg-white/10'}`}></div>
              <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 4 ? strengthBarColor[Math.min(strengthBarColor.length - 1, passwordStrength)] : 'bg-white/10'}`}></div>
            </div>

            {/* Yêu cầu mật khẩu */}
            <ul className="list-none m-0 p-0">
              {strengthText.map((_, index) => renderStrengthIndicator(index))}
            </ul>
          </div>

          {/* Input Xác nhận Mật khẩu */}
          <div className="pt-2">
            <label className="block text-[12px] font-medium text-gray-400 mb-1.5">Xác nhận mật khẩu</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#25233c] text-gray-200 border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-[13px] placeholder-gray-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Nút Tạo tài khoản */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] text-[14px] shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="px-3 bg-[#1e1b38] text-gray-500 uppercase tracking-wider">
              Hoặc tiếp tục với
            </span>
          </div>
        </div>

        {/* Nút Google */}
        <button className="w-full bg-[#25233c] hover:bg-[#2d2a45] border border-white/5 text-gray-300 font-medium py-2.5 rounded-xl flex items-center justify-center gap-3 transition-colors text-[13px]">
          <GoogleIcon />
          Đăng ký bằng Google
        </button>

        {/* Footer */}
        <div className="text-center mt-8 text-[12px] text-gray-500">
          Bạn đã có tài khoản?{" "}
          <Link href={`/${locale}/auth/login`} className="text-gray-300 hover:text-white underline decoration-white/30 underline-offset-4 transition-colors">
            Đăng nhập
          </Link>
        </div>
      </div>
      
      {/* Custom CSS for hidden scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
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