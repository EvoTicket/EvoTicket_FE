"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function AuthErrorPage() {
  const router = useRouter();
  const { locale } = useParams();
  const searchParams = useSearchParams();
  const t = useTranslations('Auth');
  
  // Default to general error if no type is provided
  const [errorType, setErrorType] = useState<"general" | "google" | "session-expired">("general");

  useEffect(() => {
    const type = searchParams.get("type");
    const timer = setTimeout(() => {
      if (type === "google") {
        setErrorType("google");
      } else if (type === "session-expired") {
        setErrorType("session-expired");
      } else {
        setErrorType("general");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleRetry = () => {
    // Basic retry logic goes to login page, or can be customized
    router.push(`/${locale}/auth/login`);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-main text-txt-primary relative overflow-hidden font-sans p-4">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/30 via-primary/5 to-transparent blur-[80px]"></div>
        <svg className="absolute w-full h-full opacity-20 dark:opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 65,-10 C 35,40 85,75 10,110" stroke="currentColor" strokeWidth="0.1" fill="none" className="text-txt-muted opacity-50" />
          <path d="M 80,-10 C 50,40 100,75 25,110" stroke="currentColor" strokeWidth="0.05" fill="none" className="text-txt-muted opacity-30" />
        </svg>
      </div>
      
      {/* Auth Card */}
      <div className="z-10 w-full max-w-[420px] bg-surface border border-border rounded-ds-2xl p-8 shadow-2xl relative mt-[-10vh]">
        
        <div className="text-center mb-6">
          <h1 className="text-[24px] font-bold text-txt-primary mb-3 leading-snug px-4">
            {errorType === "google" 
              ? t('error_google_title') 
              : errorType === "session-expired"
                ? t('error_session_title')
                : t('error_general_title')}
          </h1>
          <p className="text-[13px] text-txt-secondary leading-relaxed px-2">
            {errorType === "google" 
              ? t('error_google_desc')
              : errorType === "session-expired"
                ? t('error_session_desc')
                : t('error_general_desc')
            }
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-ds-xl transition-all active:scale-[0.98] text-[14px] shadow-lg shadow-primary/20 cursor-pointer"
          >
            {errorType === "session-expired" ? t('relogin_button') : t('retry_button')}
          </button>
          
          <button
            onClick={() => router.push(errorType === "session-expired" ? `/${locale}` : `/${locale}/auth/login`)}
            className="w-full bg-secondary hover:bg-main border border-border text-txt-primary font-medium py-3 rounded-ds-xl transition-all text-[14px] cursor-pointer"
          >
            {errorType === "google" 
              ? t('login_by_email_button') 
              : errorType === "session-expired"
                ? t('go_to_homepage_button')
                : t('back_to_login')}
          </button>

          {errorType !== "session-expired" && (
            <button
              className="w-full bg-transparent border border-border hover:bg-secondary text-txt-secondary font-medium py-3 rounded-ds-xl transition-all text-[14px] cursor-pointer"
            >
              {t('contact_support_button')}
            </button>
          )}
        </div>

        {errorType === "general" && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="px-3 bg-surface text-txt-muted uppercase tracking-wider">
                  {t('or_retry_with', { defaultMessage: "Hoặc thử lại với" })}
                </span>
              </div>
            </div>

            <button className="w-full bg-secondary hover:bg-main border border-border text-txt-primary font-medium py-2.5 rounded-ds-xl flex items-center justify-center gap-3 transition-all text-[13px] cursor-pointer">
              <GoogleIcon />
              {t('login_with_google_button')}
            </button>
          </>
        )}

        {errorType !== "session-expired" && (
          <div className="text-center mt-8 text-[12px] text-txt-secondary font-sans">
            {t('no_account')}{" "}
            <Link href={`/${locale}/auth/register`} className="text-txt-secondary hover:text-txt-primary underline decoration-border underline-offset-4 transition-all font-semibold">
              {t('register_link')}
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
