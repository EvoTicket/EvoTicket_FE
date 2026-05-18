"use client";

import React, { useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setAppLoading, selectAppLoading } from "@/src/store/slices/appSlice";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { locale } = useParams();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAppLoading);
  const t = useTranslations('Auth');

  // Derive step from URL, default to 'request'
  const stepParam = searchParams.get('step');
  const step = ['request', 'sent', 'otp', 'new-password'].includes(stepParam || '') 
    ? stepParam 
    : 'request';

  const setStep = (newStep: string) => {
    router.push(`/${locale}/auth/forgot-password?step=${newStep}`);
  }

  // --- States for Request ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // --- States for OTP ---
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- States for New Password ---
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); 

  // Handlers
  const handleRequestSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    dispatch(setAppLoading(true));
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (!e) toast.success(t('resend_success'));
      // Based on user prompt, from request we might go to 'otp' or 'sent'.
      // We will show 'otp' so the user can actually enter the code.
      setStep('otp');
    } catch {
      toast.error(t('login_error'));
    } finally {
      dispatch(setAppLoading(false));
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) return toast.error(t('otp_length_error'));
    
    dispatch(setAppLoading(true));
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Mock verify success
      setStep('new-password');
    } catch {
      toast.error(t('otp_invalid_error'));
    } finally {
      dispatch(setAppLoading(false));
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only numbers
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewPassword(val);
    let strength = 0;
    if (val.length >= 1) strength++;
    if (val.length >= 8) strength++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val) && (/[0-9]/.test(val))) strength++;
    setPasswordStrength(strength);
  };
  const strengthBarColor = ['bg-[#25233c]', 'bg-red-500', 'bg-yellow-500', 'bg-[#7a5af8]', 'bg-green-500'];

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error(t('password_mismatch_error'));
    }
    dispatch(setAppLoading(true));
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(t('reset_success'));
      router.push(`/${locale}/auth/login`);
    } catch {
      toast.error(t('login_error'));
    } finally {
      dispatch(setAppLoading(false));
    }
  }

  // --- Renders ---
  const renderRequestForm = () => (
    <>
      <div className="text-center mb-8">
        <h1 className="text-[26px] font-bold text-txt-primary mb-2">{t('forgot_password_title')}</h1>
        <p className="text-[13px] text-txt-secondary">
          {t('forgot_password_subtitle')}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleRequestSubmit}>
        <div>
          <label className="block text-[12px] font-medium text-txt-secondary mb-1.5">{t('name_label')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Trần Văn A"
            className="w-full px-4 py-3 bg-secondary text-txt-primary border border-border rounded-ds-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-[13px] placeholder-txt-muted"
            required
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-txt-secondary mb-1.5">{t('email_label')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="abc@gmail.com"
            className="w-full px-4 py-3 bg-secondary text-txt-primary border border-border rounded-ds-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-[13px] placeholder-txt-muted"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-[12px] font-medium text-txt-secondary mb-1.5">{t('phone_label')}</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0988 xxx xxx"
            className="w-full px-4 py-3 bg-secondary text-txt-primary border border-border rounded-ds-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-[13px] placeholder-txt-muted"
            required
          />
        </div>

        <div className="pt-2 space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-ds-xl transition-all active:scale-[0.98] text-[14px] shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? t('processing', { defaultMessage: "Đang xử lý..." }) : t('get_otp_button')}
          </button>
          
          <button
            type="button"
            onClick={() => router.push(`/${locale}/auth/login`)}
            className="w-full bg-secondary hover:bg-main border border-border text-txt-primary font-medium py-3 rounded-ds-xl transition-all text-[14px] cursor-pointer"
          >
            {t('back_to_login')}
          </button>
        </div>
      </form>
    </>
  );

  const renderSentInfo = () => (
    <>
      <div className="text-center mb-8">
        <h1 className="text-[26px] font-bold text-txt-primary mb-2 leading-snug">{t('sent_title')}</h1>
        <p className="text-[13px] text-txt-secondary">
          {t('sent_subtitle')}
        </p>
      </div>

      <div className="pt-2 space-y-3">
        <button
          onClick={() => setStep('otp')}
          className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-ds-xl transition-all active:scale-[0.98] text-[14px] shadow-lg shadow-primary/20 cursor-pointer"
        >
          {t('enter_otp_button')}
        </button>
        
        <button
          onClick={() => handleRequestSubmit()}
          disabled={loading}
          className="w-full bg-secondary hover:bg-main border border-border text-txt-primary font-medium py-3 rounded-ds-xl transition-all text-[14px] disabled:opacity-70 cursor-pointer"
        >
          {loading ? t('sending_status') : t('resend_email_button')}
        </button>
      </div>
      
      <button
        onClick={() => router.push(`/${locale}/auth/login`)}
        className="w-full mt-3 bg-transparent text-txt-secondary hover:text-txt-primary font-medium py-3 transition-colors text-[13px] cursor-pointer"
      >
        {t('back_to_login')}
      </button>

      <div className="text-center mt-6 text-[11px] text-txt-muted">
        {t('spam_mailbox_note')}
      </div>
    </>
  );

  const renderOtpForm = () => (
    <>
      <div className="text-center mb-8">
        <h1 className="text-[26px] font-bold text-txt-primary mb-2">{t('verify_otp_title')}</h1>
        <p className="text-[13px] text-txt-secondary">
          {t('verify_otp_subtitle', { email: email ? email : t('verify_otp_subtitle_default') })}
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleOtpSubmit}>
        <div className="flex justify-between gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { otpRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              className="w-10 h-12 sm:w-12 sm:h-14 bg-secondary text-txt-primary text-center text-xl font-bold rounded-ds-xl border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
              required
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otp.join("").length < 6}
          className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-ds-xl transition-all active:scale-[0.98] text-[14px] shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed mt-4 cursor-pointer"
        >
          {loading ? t('checking_status') : t('verify_otp_button')}
        </button>
      </form>

      <div className="text-center mt-8 text-[13px] text-txt-secondary">
        {t('not_received_otp')}{" "}
        <button onClick={() => setStep('request')} className="text-primary hover:text-primary-hover underline decoration-primary/30 underline-offset-4 transition-colors font-medium cursor-pointer">
          {t('resend_link')}
        </button>
      </div>
    </>
  );

  const renderNewPasswordForm = () => (
    <>
      <div className="text-center mb-8">
        <h1 className="text-[26px] font-bold text-txt-primary mb-2">{t('new_password_title')}</h1>
        <p className="text-[13px] text-txt-secondary">
          {t('new_password_subtitle')}
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleResetSubmit}>
        <div>
          <label className="block text-[12px] font-medium text-txt-secondary mb-1.5">{t('new_password_label')}</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••"
              value={newPassword}
              onChange={handlePasswordChange}
              className="w-full px-4 py-3 bg-secondary text-txt-primary border border-border rounded-ds-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-[13px] placeholder-txt-muted pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          
          {/* Thanh độ mạnh mật khẩu */}
          <div className="flex justify-between mt-2.5 mb-1 space-x-1">
            <div className={`h-1 flex-1 rounded-full ${strengthBarColor[Math.min(strengthBarColor.length - 1, passwordStrength)]}`} style={{ width: `${(passwordStrength / (strengthBarColor.length - 1)) * 100}%` }}></div>
            <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 2 ? strengthBarColor[Math.min(strengthBarColor.length - 1, passwordStrength)] : 'bg-secondary'}`}></div>
            <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 3 ? strengthBarColor[Math.min(strengthBarColor.length - 1, passwordStrength)] : 'bg-secondary'}`}></div>
            <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 4 ? strengthBarColor[Math.min(strengthBarColor.length - 1, passwordStrength)] : 'bg-secondary'}`}></div>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-txt-secondary mb-1.5">{t('confirm_new_password_label')}</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-secondary text-txt-primary border border-border rounded-ds-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-[13px] placeholder-txt-muted pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-ds-xl transition-all active:scale-[0.98] text-[14px] shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? t('processing', { defaultMessage: "Đang xử lý..." }) : t('reset_password_button')}
          </button>
        </div>
      </form>
    </>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-main text-txt-primary relative overflow-hidden font-sans p-4">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/30 via-primary/5 to-transparent blur-[80px]"></div>
        <svg className="absolute w-full h-full opacity-20 dark:opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 65,-10 C 35,40 85,75 10,110" stroke="currentColor" strokeWidth="0.1" fill="none" className="text-txt-muted opacity-50" />
          <path d="M 80,-10 C 50,40 100,75 25,110" stroke="currentColor" strokeWidth="0.05" fill="none" className="text-txt-muted opacity-30" />
        </svg>
      </div>
      
      <div className="z-10 w-full max-w-[420px] bg-surface border border-border rounded-ds-2xl p-8 shadow-2xl relative">
        {step === 'request' && renderRequestForm()}
        {step === 'sent' && renderSentInfo()}
        {step === 'otp' && renderOtpForm()}
        {step === 'new-password' && renderNewPasswordForm()}
      </div>

      {/* Dev Navigation (Optional, remove in production) */}
       <div className="fixed bottom-0 left-0 right-0 p-3 bg-surface backdrop-blur border-t border-border flex justify-center gap-4 text-xs z-50">
        <span className="text-txt-secondary">Test Flows:</span>
        <button onClick={() => setStep('request')} className={step === 'request' ? 'text-primary font-bold' : 'text-txt-secondary'}>Form</button>
        <button onClick={() => setStep('sent')} className={step === 'sent' ? 'text-primary font-bold' : 'text-txt-secondary'}>Sent</button>
        <button onClick={() => setStep('otp')} className={step === 'otp' ? 'text-primary font-bold' : 'text-txt-secondary'}>OTP</button>
        <button onClick={() => setStep('new-password')} className={step === 'new-password' ? 'text-primary font-bold' : 'text-txt-secondary'}>New Password</button>
      </div>
    </div>
  );
}
