"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, ChevronRight } from "lucide-react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import api from "@/src/lib/axios";
import { toast } from "react-toastify";
import axios from "axios";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setAppLoading, selectAppLoading } from "@/src/store/slices/appSlice";
import { CustomDatePicker } from "@/src/components/ui/CustomDatePicker";
import { isValidEmail, isValidPhone, isValidFullName } from "@/src/lib/validations";
import { getLegalHref } from "@/src/lib/docs/registry";

export default function RegisterPage() {
  const router = useRouter();
  const { locale } = useParams();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const dispatch = useAppDispatch();
  const t = useTranslations('Auth');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(new Date("2000-01-01"));
  const [gender, setGender] = useState("MALE");
  const [userAddress, setUserAddress] = useState("");
  const [provinceCode, setProvinceCode] = useState<number>(0);
  const [wardCode, setWardCode] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await api.get("/iam-service/api/locations/provinces", { skipAuth: true } as any);
        if (response.data && Array.isArray(response.data)) {
          setProvinces(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchWards = async () => {
      if (!provinceCode) {
        setWards([]);
        setWardCode(0);
        return;
      }
      try {
        const response = await api.get(`/iam-service/api/locations/wards?provinceCode=${provinceCode}`, { skipAuth: true } as any);
        if (response.data && Array.isArray(response.data)) {
          setWards(response.data);
          if (response.data.length > 0) {
            setWardCode(response.data[0].code);
          } else {
            setWardCode(0);
          }
        }
      } catch (error) {
        console.error("Failed to fetch wards:", error);
      }
    };
    fetchWards();
  }, [provinceCode]);

  const loading = useAppSelector(selectAppLoading);

  const [passwordStrength, setPasswordStrength] = useState(0);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: "" }));
    }

    let strength = 0;
    if (val.length >= 1) strength++;
    if (val.length >= 8) strength++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val) && (/[0-9]/.test(val))) strength++;
    setPasswordStrength(strength);
  };

  const strengthBarColor = ['bg-secondary', 'bg-red-500', 'bg-yellow-500', 'bg-primary', 'bg-green-500'];
  const strengthTextKeys = [
    'password_requirement_length',
    'password_requirement_case',
    'password_requirement_special'
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
      <li key={index} className="flex items-center gap-2 text-[11px] text-txt-secondary mb-1.5 animate-pulse-subtle">
        <div className={`w-3 h-3 flex items-center justify-center rounded-ds-sm ${isCompleted ? 'bg-secondary text-primary' : 'bg-secondary border border-border'}`}>
          {isCompleted && (
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </div>
        <span className={`${isCompleted ? 'text-txt-primary font-medium' : 'text-txt-muted'}`}>{t(strengthTextKeys[index])}</span>
      </li>
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Name
    if (!name.trim()) {
      newErrors.name = t('validation_name_required');
    } else if (!isValidFullName(name)) {
      newErrors.name = t('validation_name_invalid');
    }

    // 2. Email
    if (!email.trim()) {
      newErrors.email = t('validation_email_required');
    } else if (!isValidEmail(email)) {
      newErrors.email = t('validation_email_invalid');
    }

    // 3. Phone
    if (!phone.trim()) {
      newErrors.phone = t('validation_phone_required');
    } else if (!isValidPhone(phone)) {
      newErrors.phone = t('validation_phone_invalid');
    }

    // 4. Date of Birth
    if (!dateOfBirth) {
      newErrors.dateOfBirth = t('validation_dob_required');
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateOfBirth >= today) {
        newErrors.dateOfBirth = t('validation_dob_invalid');
      }
    }

    // 5. Gender
    if (!gender) {
      newErrors.gender = t('validation_gender_required');
    }

    // 6. Province
    if (!provinceCode) {
      newErrors.province = t('validation_province_required');
    }

    // 7. Ward
    if (!wardCode) {
      newErrors.ward = t('validation_ward_required');
    }

    // 8. Address
    if (!userAddress.trim()) {
      newErrors.address = t('validation_address_required');
    }

    // 9. Password
    if (!password) {
      newErrors.password = t('validation_password_required');
    } else if (password.length < 8) {
      newErrors.password = t('validation_password_min_length');
    }

    // 10. Confirm Password
    if (!confirmPassword) {
      newErrors.confirmPassword = t('validation_confirm_password_required');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('password_mismatch_error');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
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
          dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : "2000-01-01",
          gender,
          userAddress,
          provinceCode,
          wardCode
        },
        { skipAuth: true } as any
      );

      const data = response.data;
      if (data.status === 201) {
        toast.success(data.message || t('register_success'));
        const loginPath = `/${locale}/auth/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`;
        router.push(loginPath);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || t('register_failed'));
      } else {
        toast.error(t('login_error'));
      }
      console.error("Register error:", error);
    } finally {
      dispatch(setAppLoading(false));
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-main text-txt-primary relative overflow-hidden font-sans">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/30 via-primary/5 to-transparent blur-[80px]"></div>
        <svg className="absolute w-full h-full opacity-20 dark:opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 65,-10 C 35,40 85,75 10,110" stroke="currentColor" strokeWidth="0.1" fill="none" className="text-txt-muted opacity-50" />
          <path d="M 80,-10 C 50,40 100,75 25,110" stroke="currentColor" strokeWidth="0.05" fill="none" className="text-txt-muted opacity-30" />
        </svg>
      </div>

      {/* Auth Card */}
      <div className="z-10 w-full max-w-[420px] bg-surface border border-border rounded-ds-2xl p-8 shadow-2xl mx-4 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">

        <div className="text-center mb-8">
          <h1 className="text-[26px] font-bold text-txt-primary mb-2">{t('register_title')}</h1>
          <p className="text-[13px] text-txt-secondary">
            {t('register_subtitle')}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleRegister} noValidate>

          {/* Input Họ và Tên */}
          <div>
            <label className="block text-[12px] font-medium text-txt-secondary mb-1.5">{t('name_label')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
              }}
              placeholder={t('name_placeholder')}
              className={`w-full px-4 py-2.5 bg-secondary text-txt-primary border rounded-ds-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-[13px] placeholder-txt-muted ${errors.name ? 'border-red-500' : 'border-border'}`}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.name}</p>
            )}
          </div>

          {/* Input Email */}
          <div>
            <label className="block text-[12px] font-medium text-txt-secondary mb-1.5">{t('email_label')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
              }}
              placeholder={t('email_placeholder')}
              className={`w-full px-4 py-2.5 bg-secondary text-txt-primary border rounded-ds-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-[13px] placeholder-txt-muted mb-1.5 ${errors.email ? 'border-red-500' : 'border-border'}`}
            />
            {errors.email && (
              <p className="text-[11px] text-red-500 mt-0.5 mb-1.5 pl-1 select-none animate-fadeIn">{errors.email}</p>
            )}
            {/* <p className="text-[10.5px] text-txt-muted leading-tight">
              {t('email_privacy_note')}
            </p> */}
          </div>

          {/* Input Số điện thoại */}
          <div>
            <label className="block text-[12px] font-medium text-txt-secondary mb-1.5">{t('phone_label')}</label>
            <input
              type="tel"
              value={phone}
              maxLength={10}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
              }}
              placeholder={t('phone_placeholder')}
              className={`w-full px-4 py-2.5 bg-secondary text-txt-primary border rounded-ds-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-[13px] placeholder-txt-muted ${errors.phone ? 'border-red-500' : 'border-border'}`}
            />
            {errors.phone && (
              <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.phone}</p>
            )}
          </div>

          {/* Ngày sinh */}
          <div>
            <label className="block text-[12px] font-medium text-txt-secondary mb-1.5">{t('dob_label')}</label>
            <div className={`relative w-full rounded-ds-lg border ${errors.dateOfBirth ? 'border-red-500' : 'border-transparent'}`}>
              <CustomDatePicker
                selectedDate={dateOfBirth}
                onChange={(date) => {
                  setDateOfBirth(date);
                  if (errors.dateOfBirth) setErrors(prev => ({ ...prev, dateOfBirth: "" }));
                }}
                height="10"
              />
            </div>
            {errors.dateOfBirth && (
              <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* Giới tính */}
          <div>
            <label className="block text-[12px] font-medium text-txt-secondary mb-1.5">{t('gender_label')}</label>
            <Listbox
              value={gender}
              onChange={(val) => {
                setGender(val);
                if (errors.gender) setErrors(prev => ({ ...prev, gender: "" }));
              }}
            >
              <div className="relative w-full">
                <ListboxButton className={`w-full flex items-center justify-between px-4 py-2.5 bg-secondary text-txt-primary border rounded-ds-xl text-left text-[13px] outline-none cursor-pointer focus:border-primary transition-all ${errors.gender ? 'border-red-500' : 'border-border'}`}>
                  <span className="truncate">
                    {(() => {
                      if (gender === "MALE") return t('gender_male');
                      if (gender === "FEMALE") return t('gender_female');
                      return t('gender_other');
                    })()}
                  </span>
                  <ChevronRight size={14} className="text-txt-muted transform rotate-90" />
                </ListboxButton>
                <ListboxOptions
                  anchor="bottom"
                  modal={false}
                  className="z-50 w-[var(--button-width)] [--anchor-gap:4px] overflow-y-auto bg-surface border border-border rounded-ds-xl shadow-xl text-txt-primary mt-1 text-[13px]"
                >
                  <ListboxOption
                    value="MALE"
                    className="group flex items-center px-4 py-2.5 cursor-pointer hover:bg-secondary rounded-ds-md transition-colors font-medium"
                  >
                    {t('gender_male')}
                  </ListboxOption>
                  <ListboxOption
                    value="FEMALE"
                    className="group flex items-center px-4 py-2.5 cursor-pointer hover:bg-secondary rounded-ds-md transition-colors font-medium"
                  >
                    {t('gender_female')}
                  </ListboxOption>
                  <ListboxOption
                    value="OTHER"
                    className="group flex items-center px-4 py-2.5 cursor-pointer hover:bg-secondary rounded-ds-md transition-colors font-medium"
                  >
                    {t('gender_other')}
                  </ListboxOption>
                </ListboxOptions>
              </div>
            </Listbox>
            {errors.gender && (
              <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.gender}</p>
            )}
          </div>

          {/* Tỉnh/Thành phố */}
          <div>
            <label className="block text-[12px] font-medium text-txt-secondary mb-1.5">{t('province_label')}</label>
            <Listbox
              value={provinceCode}
              onChange={(val) => {
                setProvinceCode(Number(val));
                if (errors.province) setErrors(prev => ({ ...prev, province: "" }));
              }}
            >
              <div className="relative w-full">
                <ListboxButton className={`w-full flex items-center justify-between px-4 py-2.5 bg-secondary text-txt-primary border rounded-ds-xl text-left text-[13px] outline-none cursor-pointer focus:border-primary transition-all ${errors.province ? 'border-red-500' : 'border-border'}`}>
                  <span className="truncate">
                    {(() => {
                      const prov = provinces.find((p) => p.code === provinceCode);
                      return prov ? prov.name : t('province_placeholder');
                    })()}
                  </span>
                  <ChevronRight size={14} className="text-txt-muted transform rotate-90" />
                </ListboxButton>
                <ListboxOptions
                  anchor="bottom"
                  modal={false}
                  className="z-50 w-[var(--button-width)] [--anchor-gap:4px] !max-h-60 overflow-y-auto bg-surface border border-border rounded-ds-xl shadow-xl text-txt-primary mt-1 text-[13px]"
                >
                  <ListboxOption
                    value={0}
                    className="group flex items-center px-4 py-2.5 cursor-pointer hover:bg-secondary rounded-ds-md transition-colors font-medium text-txt-muted"
                  >
                    -- {t('province_placeholder')} --
                  </ListboxOption>
                  {provinces.map((prov) => (
                    <ListboxOption
                      key={prov.code}
                      value={prov.code}
                      className="group flex items-center px-4 py-2.5 cursor-pointer hover:bg-secondary rounded-ds-md transition-colors font-medium"
                    >
                      {prov.name}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
            {errors.province && (
              <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.province}</p>
            )}
          </div>

          {/* Phường/Xã */}
          <div>
            <label className="block text-[12px] font-medium text-txt-secondary mb-1.5">{t('ward_label')}</label>
            <Listbox
              value={wardCode}
              onChange={(val) => {
                setWardCode(Number(val));
                if (errors.ward) setErrors(prev => ({ ...prev, ward: "" }));
              }}
              disabled={!provinceCode || wards.length === 0}
            >
              <div className="relative w-full">
                <ListboxButton className={`w-full flex items-center justify-between px-4 py-2.5 bg-secondary text-txt-primary border rounded-ds-xl text-left text-[13px] outline-none cursor-pointer focus:border-primary transition-all ${errors.ward ? 'border-red-500' : 'border-border'} ${(!provinceCode || wards.length === 0) ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  <span className="truncate">
                    {(() => {
                      const ward = wards.find((w) => w.code === wardCode);
                      return ward ? ward.name : t('ward_placeholder');
                    })()}
                  </span>
                  <ChevronRight size={14} className="text-txt-muted transform rotate-90" />
                </ListboxButton>
                <ListboxOptions
                  anchor="bottom"
                  modal={false}
                  className="z-50 w-[var(--button-width)] [--anchor-gap:4px] !max-h-60 overflow-y-auto bg-surface border border-border rounded-ds-xl shadow-xl text-txt-primary mt-1 text-[13px]"
                >
                  <ListboxOption
                    value={0}
                    className="group flex items-center px-4 py-2.5 cursor-pointer hover:bg-secondary rounded-ds-md transition-colors font-medium text-txt-muted"
                  >
                    -- {t('ward_placeholder')} --
                  </ListboxOption>
                  {wards.map((ward) => (
                    <ListboxOption
                      key={ward.code}
                      value={ward.code}
                      className="group flex items-center px-4 py-2.5 cursor-pointer hover:bg-secondary rounded-ds-md transition-colors font-medium"
                    >
                      {ward.name}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
            {errors.ward && (
              <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.ward}</p>
            )}
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-[12px] font-medium text-txt-secondary mb-1.5">{t('address_label')}</label>
            <input
              type="text"
              value={userAddress}
              onChange={(e) => {
                setUserAddress(e.target.value);
                if (errors.address) setErrors(prev => ({ ...prev, address: "" }));
              }}
              placeholder={t('address_placeholder')}
              className={`w-full px-4 py-2.5 bg-secondary text-txt-primary border rounded-ds-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-[13px] placeholder-txt-muted ${errors.address ? 'border-red-500' : 'border-border'}`}
            />
            {errors.address && (
              <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.address}</p>
            )}
          </div>

          {/* Input Mật khẩu */}
          <div className="pt-1">
            <label className="block text-[12px] font-medium text-txt-secondary mb-1.5">{t('password_label')}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full px-4 py-2.5 bg-secondary text-txt-primary border rounded-ds-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-[13px] placeholder-txt-muted pr-10 ${errors.password ? 'border-red-500' : 'border-border'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.password}</p>
            )}

            {/* Thanh độ mạnh mật khẩu */}
            <div className="flex justify-between mt-2 mb-3 space-x-1">
              <div className={`h-1 flex-1 rounded-full ${strengthBarColor[Math.min(strengthBarColor.length - 1, passwordStrength)]}`} style={{ width: `${(passwordStrength / (strengthBarColor.length - 1)) * 100}%` }}></div>
              <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 2 ? strengthBarColor[Math.min(strengthBarColor.length - 1, passwordStrength)] : 'bg-secondary'}`}></div>
              <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 3 ? strengthBarColor[Math.min(strengthBarColor.length - 1, passwordStrength)] : 'bg-secondary'}`}></div>
              <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 4 ? strengthBarColor[Math.min(strengthBarColor.length - 1, passwordStrength)] : 'bg-secondary'}`}></div>
            </div>

            {/* Yêu cầu mật khẩu */}
            <ul className="list-none m-0 p-0">
              {strengthTextKeys.map((_, index) => renderStrengthIndicator(index))}
            </ul>
          </div>

          {/* Input Xác nhận Mật khẩu */}
          <div className="pt-2">
            <label className="block text-[12px] font-medium text-txt-secondary mb-1.5">{t('confirm_password_label')}</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: "" }));
                }}
                className={`w-full px-4 py-2.5 bg-secondary text-txt-primary border rounded-ds-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-[13px] placeholder-txt-muted pr-10 ${errors.confirmPassword ? 'border-red-500' : 'border-border'}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Nút Tạo tài khoản */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-ds-xl transition-all active:scale-[0.98] text-[14px] shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('processing')}</span>
                </>
              ) : (
                t('register_button')
              )}
            </button>
            <p className="mt-4 text-[12px] text-txt-secondary text-center leading-relaxed px-2">
              Bằng việc tạo tài khoản, tôi đồng ý với{" "}
              <Link
                href={getLegalHref(locale as string, "terms-of-use")}
                target="_blank"
                className="text-txt-primary hover:text-primary underline decoration-border underline-offset-4 transition-all font-semibold"
              >
                Điều khoản sử dụng
              </Link>{" "}
              và{" "}
              <Link
                href={getLegalHref(locale as string, "privacy-policy")}
                target="_blank"
                className="text-txt-primary hover:text-primary underline decoration-border underline-offset-4 transition-all font-semibold"
              >
                Chính sách bảo mật
              </Link>{" "}
              của EvoTicket.
            </p>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="px-3 bg-surface text-txt-muted uppercase tracking-wider">
              {t('or_continue_with', { defaultMessage: "Hoặc tiếp tục với" })}
            </span>
          </div>
        </div>

        {/* Nút Google */}
        <button className="w-full bg-secondary hover:bg-main border border-border text-txt-primary font-medium py-2.5 rounded-ds-xl flex items-center justify-center gap-3 transition-all text-[13px] cursor-pointer">
          <GoogleIcon />
          {t('register_with_google')}
        </button>

        {/* Footer */}
        <div className="text-center mt-8 text-[12px] text-txt-secondary font-sans">
          {t('already_have_account')}{" "}
          <Link
            href={`/${locale}/auth/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
            className="text-txt-secondary hover:text-txt-primary underline decoration-border underline-offset-4 transition-all font-semibold"
          >
            {t('login_button')}
          </Link>
        </div>
      </div>

      {/* Custom CSS to hide scrollbar while keeping scroll functionality */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
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