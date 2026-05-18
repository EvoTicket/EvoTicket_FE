"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
    User, Mail, Phone, Calendar, Shield, Edit3,
    Save, X, Camera, ChevronRight, BadgeCheck, Clock,
    Settings, ShieldCheck, CreditCard, Loader2, Check
} from "lucide-react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import api from "@/src/lib/axios";
import { toast } from "react-toastify";
import { useAppDispatch } from "@/src/store/hooks";
import { setUser } from "@/src/store/slices/authSlice";



const defaultUser = {
    id: 0,
    email: "",
    firstName: "",
    lastName: "",
    avatarUrl: "https://toplist.vn/images/800px/cua-106572.jpg",
    phoneNumber: "",
    createdAt: new Date().toISOString(),
    roles: ["USER"],
    bankCode: "",
    bankAccountNumber: "",
    bankAccountName: ""
};

export default function ProfilePage() {
    const t = useTranslations("Profile");
    const router = useRouter();
    const params = useParams();
    const dispatch = useAppDispatch();
    const locale = typeof params.locale === "string" ? params.locale : "vi";

    const [activeTab, setActiveTab] = useState("personal");
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingPayment, setIsEditingPayment] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

    const [userData, setUserData] = useState<any>(defaultUser);
    const [tempData, setTempData] = useState<any>(defaultUser);
    const [bankList, setBankList] = useState<any[]>([]);

    const [tempPaymentData, setTempPaymentData] = useState({
        bankCode: "",
        bankAccountNumber: "",
        bankAccountName: "",
    });

    const [isFetchingBankOwner, setIsFetchingBankOwner] = useState(false);

    useEffect(() => {
        const { bankCode, bankAccountNumber } = tempPaymentData;
        if (!bankCode || !bankAccountNumber || bankAccountNumber.length < 6) {
            setTempPaymentData(prev => ({
                ...prev,
                bankAccountName: ""
            }));
            return;
        }

        const fetchBankOwner = async () => {
            setIsFetchingBankOwner(true);
            try {
                const response = await api.get(
                    `/inventory-service/api/banks/owner-name?bankCode=${bankCode}&bankAccountNumber=${bankAccountNumber}`
                );
                let ownerName = "";
                if (response.data) {
                    if (typeof response.data === "string") {
                        ownerName = response.data;
                    } else if (response.data.ownerName) {
                        ownerName = response.data.ownerName;
                    } else if (response.data.data) {
                        if (typeof response.data.data === "string") {
                            ownerName = response.data.data;
                        } else if (response.data.data.ownerName) {
                            ownerName = response.data.data.ownerName;
                        }
                    }
                }

                if (ownerName) {
                    setTempPaymentData(prev => ({
                        ...prev,
                        bankAccountName: ownerName.toUpperCase()
                    }));
                } else {
                    setTempPaymentData(prev => ({
                        ...prev,
                        bankAccountName: ""
                    }));
                }
            } catch (error: any) {
                console.error("Failed to fetch bank owner name:", error);
                if (error.response && error.response.status === 404) {
                    toast.error(locale === "vi"
                        ? "Không tìm thấy thông tin tài khoản ngân hàng này"
                        : "Bank account details not found");
                }
                setTempPaymentData(prev => ({
                    ...prev,
                    bankAccountName: ""
                }));
            } finally {
                setIsFetchingBankOwner(false);
            }
        };

        const timer = setTimeout(() => {
            fetchBankOwner();
        }, 3000);

        return () => clearTimeout(timer);
    }, [tempPaymentData.bankCode, tempPaymentData.bankAccountNumber]);

    const fetchUserProfile = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/iam-service/api/users/me");
            if (response.data && response.data.data) {
                const fetched = response.data.data;
                setUserData(fetched);
                setTempData(fetched);
                setTempPaymentData({
                    bankCode: fetched.bankCode || "",
                    bankAccountNumber: fetched.bankAccountNumber || "",
                    bankAccountName: fetched.bankAccountName || ""
                });
            }
        } catch (error: any) {
            console.error("Failed to fetch user details", error);
            if (error.response?.status === 401) {
                toast.error(locale === "vi" ? "Vui lòng đăng nhập để tiếp tục" : "Please log in to continue");
                router.replace(`/${locale}/auth/login?callbackUrl=/${locale}/user/profile`);
            } else {
                toast.error(locale === "vi" ? "Không thể tải thông tin tài khoản" : "Failed to load profile details");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBankList = async () => {
        try {
            const response = await api.get("/inventory-service/api/banks");
            if (response.data && response.data.data) {
                setBankList(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch bank list", error);
        }
    };

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            void fetchUserProfile();
            void fetchBankList();
        });
        return () => cancelAnimationFrame(frame);
    }, []);

    const handleSavePersonal = async () => {
        try {
            const body = {
                firstName: tempData.firstName,
                lastName: tempData.lastName,
                phoneNumber: tempData.phoneNumber,
                // avatarUrl: userData.avatarUrl,
                gender: userData.gender || "OTHER",
                dateOfBirth: userData.dateOfBirth || "2000-01-01",
                userAddress: userData.userAddress || "",
                wardCode: userData.wardCode || 0,
                provinceCode: userData.provinceCode || 0,
                // bankCode: userData.bankCode || "",
                // bankAccountNumber: userData.bankAccountNumber || "",
                // bankAccountName: userData.bankAccountName || ""
            };

            const response = await api.put("/iam-service/api/users/me", body);
            if (response.status === 200 || response.data?.status === 0 || response.status === 204) {
                const updatedUser = {
                    ...userData,
                    firstName: tempData.firstName,
                    lastName: tempData.lastName,
                    phoneNumber: tempData.phoneNumber
                };
                setUserData(updatedUser);
                setIsEditing(false);

                // Sync with Redux to update globally (e.g. Header profile name and avatar)
                dispatch(setUser({
                    id: updatedUser.id,
                    accountId: updatedUser.accountId || String(updatedUser.id),
                    email: updatedUser.email,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    avatarUrl: updatedUser.avatarUrl,
                    phoneNumber: updatedUser.phoneNumber,
                    roles: updatedUser.roles
                }));

                toast.success(locale === "vi" ? "Cập nhật thông tin cá nhân thành công!" : "Personal profile updated successfully!");
            }
        } catch (error) {
            console.error("Failed to save profile", error);
            toast.error(locale === "vi" ? "Lưu thông tin cá nhân thất bại!" : "Failed to update personal profile!");
        }
    };

    const handleCancelPersonal = () => {
        setTempData({ ...userData });
        setIsEditing(false);
    };

    const handleSavePayment = async () => {
        if (!tempPaymentData.bankCode || !tempPaymentData.bankAccountNumber || !tempPaymentData.bankAccountName) {
            toast.warning(locale === "vi" ? "Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng" : "Please fill out all bank account information");
            return;
        }

        try {
            const body = {
                bankCode: tempPaymentData.bankCode,
                bankAccountNumber: tempPaymentData.bankAccountNumber,
                bankAccountName: tempPaymentData.bankAccountName
            };

            const response = await api.put("/iam-service/api/users/me/bank", body);
            if (response.status === 200 || response.data?.status === 0 || response.status === 204) {
                const updatedUser = {
                    ...userData,
                    bankCode: tempPaymentData.bankCode,
                    bankAccountNumber: tempPaymentData.bankAccountNumber,
                    bankAccountName: tempPaymentData.bankAccountName
                };
                setUserData(updatedUser);
                setTempData(updatedUser);
                setIsEditingPayment(false);

                // Sync with Redux
                dispatch(setUser({
                    id: updatedUser.id,
                    accountId: updatedUser.accountId || String(updatedUser.id),
                    email: updatedUser.email,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    avatarUrl: updatedUser.avatarUrl,
                    phoneNumber: updatedUser.phoneNumber,
                    roles: updatedUser.roles
                }));

                toast.success(locale === "vi" ? "Cập nhật tài khoản thanh toán thành công!" : "Payment details updated successfully!");
            }
        } catch (error) {
            console.error("Failed to save payment info", error);
            toast.error(locale === "vi" ? "Lưu thông tin thanh toán thất bại!" : "Failed to update payment details!");
        }
    };

    const handleCancelPayment = () => {
        setTempPaymentData({
            bankCode: userData.bankCode || "",
            bankAccountNumber: userData.bankAccountNumber || "",
            bankAccountName: userData.bankAccountName || "",
        });
        setIsEditingPayment(false);
    };

    const executeDeletePayment = async () => {
        try {
            const response = await api.delete("/iam-service/api/users/me/bank");
            if (response.status === 200 || response.data?.status === 0 || response.status === 204) {
                const updatedUser = {
                    ...userData,
                    bankCode: "",
                    bankAccountNumber: "",
                    bankAccountName: ""
                };
                setUserData(updatedUser);
                setTempPaymentData({
                    bankCode: "",
                    bankAccountNumber: "",
                    bankAccountName: ""
                });
                setIsEditingPayment(false);
                setIsConfirmDeleteOpen(false);

                // Sync with Redux
                dispatch(setUser({
                    id: updatedUser.id,
                    accountId: updatedUser.accountId || String(updatedUser.id),
                    email: updatedUser.email,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    avatarUrl: updatedUser.avatarUrl,
                    phoneNumber: updatedUser.phoneNumber,
                    roles: updatedUser.roles
                }));

                toast.success(locale === "vi" ? "Xóa tài khoản ngân hàng liên kết thành công!" : "Linked bank account deleted successfully!");
            }
        } catch (error) {
            console.error("Failed to delete payment info", error);
            toast.error(locale === "vi" ? "Xóa tài khoản thanh toán thất bại!" : "Failed to delete payment details!");
        }
    };

    const formatAccountNumber = (num: string) => {
        if (!num) return "";
        const cleaned = num.replace(/\s+/g, "");
        if (cleaned.length <= 4) return cleaned;
        return "•••• •••• •••• " + cleaned.slice(-4);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-xs text-txt-muted font-black tracking-widest uppercase animate-pulse">
                    {locale === "vi" ? "Đang tải hồ sơ..." : "Loading profile..."}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header / Banner Area */}
            <div className="relative h-48 w-full overflow-hidden">
                {/* <div className="absolute inset-0 backdrop-blur-[100px]"></div> */}
                <div className="absolute -bottom-16 left-0 right-0 h-64 bg-gradient-to-t from-background to-transparent"></div>
            </div>

            <div className="max-w-[90%] mx-auto -mt-24 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Profile Card */}
                    <aside className="lg:w-1/3 space-y-6">
                        <div className="bg-surface/30 border border-border/50 rounded-[2.5rem] p-8 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-button-primary-bg-default/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-button-primary-bg-default/20 transition-all"></div>

                            <div className="flex flex-col items-center text-center relative">
                                <div className="relative group/avatar mb-6">
                                    <div className="w-32 h-32 rounded-full border-4 border-button-primary-bg-default/20 overflow-hidden shadow-2xl relative">
                                        <Image
                                            src={userData.avatarUrl || "https://toplist.vn/images/800px/cua-106572.jpg"}
                                            alt="Avatar"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    {isEditing && (
                                        <button className="absolute bottom-0 right-0 bg-button-primary-bg-default p-2.5 rounded-full text-button-primary-text-default shadow-lg hover:scale-110 transition-all border-4 border-background">
                                            <Camera size={18} />
                                        </button>
                                    )}
                                </div>

                                <h2 className="text-2xl font-black text-txt-primary tracking-tight mb-2">
                                    {userData.lastName} {userData.firstName}
                                </h2>
                                <p className="text-sm text-txt-muted mb-6 flex items-center gap-2">
                                    <Mail size={14} className="text-button-primary-bg-default" /> {userData.email}
                                </p>

                                <div className="flex flex-wrap justify-center gap-2 mb-8">
                                    {userData.roles.map((role: string) => (
                                        <span key={role} className="px-3 py-1 bg-button-primary-bg-default/10 text-button-primary-bg-default border border-button-primary-bg-default/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                                            <Shield size={10} /> {role}
                                        </span>
                                    ))}
                                </div>

                                <div className="w-full pt-6 border-t border-border/30 grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-1">{t("created_at")}</p>
                                        <p className="text-xs font-bold text-txt-primary">
                                            {new Date(userData.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-1">Status</p>
                                        <div className="flex items-center justify-center gap-1 text-success">
                                            <BadgeCheck size={12} />
                                            <span className="text-xs font-bold uppercase tracking-tighter">Verified</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Menu */}
                        <nav className="bg-surface/30 border border-border/50 rounded-ds-2xl p-4 backdrop-blur-md shadow-xl overflow-hidden">
                            {[
                                { id: "personal", icon: User, label: t("personal_info") },
                                { id: "payment", icon: CreditCard, label: t("payment_methods") },
                                { id: "security", icon: ShieldCheck, label: t("security") },
                                { id: "settings", icon: Settings, label: t("settings") }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setIsEditing(false);
                                        setIsEditingPayment(false);
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-ds-2xl transition-all group ${activeTab === item.id ? 'bg-primary/10 text-primary font-black' : 'hover:bg-secondary/30 text-txt-muted hover:text-txt-primary'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <item.icon size={18} />
                                        <span className="text-sm font-bold">{item.label}</span>
                                    </div>
                                    <ChevronRight size={16} className={`transition-transform ${activeTab === item.id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Right Column: Main Content */}
                    <main className="flex-1 space-y-8">

                        {/* Personal Info Tab */}
                        {activeTab === "personal" && (
                            <section className="bg-surface/30 border border-border/50 rounded-[2.5rem] p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h3 className="text-2xl font-black text-txt-primary tracking-tight mb-2">{t("personal_info")}</h3>
                                        <p className="text-sm text-txt-muted">{t("subtitle")}</p>
                                    </div>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-6 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-ds-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
                                        >
                                            <Edit3 size={16} /> {t("edit_profile")}
                                        </button>
                                    ) : (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleCancelPersonal}
                                                className="px-5 py-2.5 bg-secondary/50 text-txt-muted border border-border/50 rounded-ds-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:text-txt-primary transition-all"
                                            >
                                                <X size={16} /> {t("cancel")}
                                            </button>
                                            <button
                                                onClick={handleSavePersonal}
                                                className="px-8 py-2.5 bg-primary text-white rounded-ds-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
                                            >
                                                <Save size={16} /> {t("save_changes")}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* First Name */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">{t("first_name")}</label>
                                        <div className={`flex items-center gap-4 p-4 rounded-ds-2xl border transition-all ${isEditing ? 'bg-surface border-primary/50 shadow-inner' : 'bg-secondary/20 border-border/30'}`}>
                                            <User size={18} className={isEditing ? 'text-primary' : 'text-txt-muted'} />
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="bg-transparent border-none outline-none text-sm font-bold text-txt-primary w-full"
                                                    value={tempData.firstName}
                                                    onChange={(e) => setTempData({ ...tempData, firstName: e.target.value })}
                                                />
                                            ) : (
                                                <span className="text-sm font-bold text-txt-primary">{userData.firstName}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Last Name */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">{t("last_name")}</label>
                                        <div className={`flex items-center gap-4 p-4 rounded-ds-2xl border transition-all ${isEditing ? 'bg-surface border-primary/50 shadow-inner' : 'bg-secondary/20 border-border/30'}`}>
                                            <User size={18} className={isEditing ? 'text-primary' : 'text-txt-muted'} />
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="bg-transparent border-none outline-none text-sm font-bold text-txt-primary w-full"
                                                    value={tempData.lastName}
                                                    onChange={(e) => setTempData({ ...tempData, lastName: e.target.value })}
                                                />
                                            ) : (
                                                <span className="text-sm font-bold text-txt-primary">{userData.lastName}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">{t("email")}</label>
                                        <div className="flex items-center gap-4 p-4 rounded-ds-2xl border bg-secondary/20 border-border/30 opacity-70 cursor-not-allowed">
                                            <Mail size={18} className="text-txt-muted" />
                                            <span className="text-sm font-bold text-txt-muted">{userData.email}</span>
                                            <ShieldCheck size={14} className="text-success ml-auto" />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">{t("phone")}</label>
                                        <div className={`flex items-center gap-4 p-4 rounded-ds-2xl border transition-all ${isEditing ? 'bg-surface border-primary/50 shadow-inner' : 'bg-secondary/20 border-border/30'}`}>
                                            <Phone size={18} className={isEditing ? 'text-primary' : 'text-txt-muted'} />
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="bg-transparent border-none outline-none text-sm font-bold text-txt-primary w-full"
                                                    value={tempData.phoneNumber}
                                                    onChange={(e) => setTempData({ ...tempData, phoneNumber: e.target.value })}
                                                />
                                            ) : (
                                                <span className="text-sm font-bold text-txt-primary">{userData.phoneNumber}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info Section */}
                                <div className="mt-12 pt-10 border-t border-border/30">
                                    <h4 className="text-lg font-black text-txt-primary tracking-tight mb-6 flex items-center gap-2">
                                        <Clock size={20} className="text-button-primary-bg-default" /> {t("account_info")}
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-6 bg-secondary/10 border border-border/30 rounded-ds-3xl group hover:border-primary/20 transition-all">
                                            <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-2">{t("roles")}</p>
                                            <div className="flex flex-wrap gap-3">
                                                {userData.roles.map((r: string) => (
                                                    <div key={r} className="flex items-center gap-2 text-sm font-bold text-txt-primary">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-button-primary-bg-default animate-pulse"></div>
                                                        {r}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-6 bg-secondary/10 border border-border/30 rounded-ds-3xl group hover:border-primary/20 transition-all">
                                            <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-2">{t("created_at")}</p>
                                            <div className="flex items-center gap-2 text-sm font-bold text-txt-primary">
                                                <Calendar size={14} className="text-button-primary-bg-default" />
                                                {new Date(userData.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Payment Methods Tab */}
                        {activeTab === "payment" && (
                            <section className="bg-surface/30 border border-border/50 rounded-[2.5rem] p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h3 className="text-2xl font-black text-txt-primary tracking-tight mb-2">
                                            {t("payment_methods")}
                                        </h3>
                                        <p className="text-sm text-txt-muted">
                                            {t("payment_subtitle")}
                                        </p>
                                    </div>
                                    {!isEditingPayment ? (
                                        <div className="flex items-center gap-3">
                                            {userData.bankCode && (
                                                <button
                                                    onClick={() => setIsConfirmDeleteOpen(true)}
                                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-ds-xl text-xs font-bold tracking-wide flex items-center gap-1.5 transition-all shadow-md shadow-red-500/5 cursor-pointer"
                                                >
                                                    <X size={14} /> {locale === "vi" ? "Xóa liên kết" : "Delete Payout"}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setIsEditingPayment(true)}
                                                className="px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 rounded-ds-xl text-xs font-bold tracking-wide flex items-center gap-1.5 transition-all shadow-md shadow-primary/5 cursor-pointer"
                                            >
                                                <Edit3 size={14} /> {t("edit_payment_info")}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleCancelPayment}
                                                className="px-5 py-2.5 bg-secondary/50 text-txt-muted border border-border/50 rounded-ds-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:text-txt-primary transition-all"
                                            >
                                                <X size={16} /> {t("cancel")}
                                            </button>
                                            <button
                                                onClick={handleSavePayment}
                                                className="px-8 py-2.5 bg-primary text-white rounded-ds-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
                                            >
                                                <Save size={16} /> {t("save_changes")}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    {/* Bank Card Graphic */}
                                    {(() => {
                                        const selectedBank = bankList.find((b) => b.code === userData.bankCode);
                                        return (
                                            <div className="bg-gradient-to-br from-primary/15 via-secondary/15 to-surface border border-border/40 rounded-3xl p-8 relative overflow-hidden shadow-xl">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                                                <div className="flex justify-between items-start mb-12">
                                                    <div className="flex items-center gap-4">
                                                        {selectedBank?.logo ? (
                                                            <img
                                                                src={selectedBank.logo}
                                                                alt={selectedBank.shortName || selectedBank.name}
                                                                className="w-14 h-14 object-contain rounded-2xl shadow-md border bg-white p-1.5 border-border/20"
                                                            />
                                                        ) : (
                                                            <div className="p-3.5 bg-primary/10 rounded-2xl text-primary border border-primary/20">
                                                                <CreditCard size={28} />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest">Payout Account</p>
                                                            <h4 className="text-lg font-bold text-txt-primary mt-0.5">
                                                                {selectedBank ? `${selectedBank.shortName || selectedBank.name} (${selectedBank.code})` : userData.bankCode || (locale === "vi" ? "Chưa liên kết" : "Unlinked Bank")}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase bg-success/10 text-success border border-success/20 px-3.5 py-1 rounded-full tracking-widest">
                                                        Active
                                                    </span>
                                                </div>

                                                <div className="space-y-6">
                                                    <div>
                                                        <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest mb-1.5">{t("bank_account_number")}</p>
                                                        <p className="text-xl font-mono font-bold text-txt-primary tracking-wider">
                                                            {userData.bankAccountNumber ? formatAccountNumber(userData.bankAccountNumber) : "•••• •••• •••• ••••"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest mb-1.5">{t("bank_account_name")}</p>
                                                        <p className="text-sm font-bold text-txt-primary uppercase tracking-wide">
                                                            {userData.bankAccountName || (locale === "vi" ? "CHƯA THIẾT LẬP" : "NOT CONFIGURED")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Bank Edit Form fields */}
                                    {isEditingPayment && (
                                        <div className="border-t border-border/20 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                                            {/* Bank Name Selector */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">{t("bank_code")}</label>
                                                <Listbox
                                                    value={tempPaymentData.bankCode}
                                                    onChange={(val) => setTempPaymentData({ ...tempPaymentData, bankCode: val })}
                                                >
                                                    <div className="relative w-full">
                                                        <ListboxButton className="w-full flex items-center justify-between p-4 rounded-ds-2xl border bg-surface border-primary/50 shadow-inner text-left text-sm font-bold text-txt-primary outline-none cursor-pointer focus:border-primary transition-all">
                                                            <div className="flex items-center gap-4">
                                                                <CreditCard size={18} className="text-primary" />
                                                                <span>
                                                                    {(() => {
                                                                        const bank = bankList.find((b) => b.code === tempPaymentData.bankCode);
                                                                        return bank ? `${bank.shortName || bank.name} (${bank.code})` : "-- Chọn ngân hàng --";
                                                                    })()}
                                                                </span>
                                                            </div>
                                                            <ChevronRight size={16} className="text-txt-muted transform rotate-90" />
                                                        </ListboxButton>
                                                        <ListboxOptions
                                                            anchor="bottom"
                                                            modal={false}
                                                            className="z-50 w-[var(--button-width)] [--anchor-gap:4px] !max-h-60 overflow-y-auto bg-surface border border-border rounded-ds-xl shadow-xl text-txt-primary mt-1"
                                                        >
                                                            <ListboxOption
                                                                value=""
                                                                className="group flex items-center px-4 py-3 cursor-pointer hover:bg-secondary rounded-ds-md transition-colors text-sm font-medium"
                                                            >
                                                                <span>-- Chọn ngân hàng --</span>
                                                            </ListboxOption>
                                                            {bankList.map((bank: any) => (
                                                                <ListboxOption
                                                                    key={bank.id}
                                                                    value={bank.code}
                                                                    className="group flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-secondary rounded-ds-md transition-colors text-sm font-medium"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        {bank.logo && (
                                                                            <img
                                                                                src={bank.logo}
                                                                                alt={bank.shortName}
                                                                                className="w-6 h-6 object-contain rounded bg-white border p-0.5 border-border/20"
                                                                            />
                                                                        )}
                                                                        <span>{bank.shortName || bank.name} ({bank.code})</span>
                                                                    </div>
                                                                    {tempPaymentData.bankCode === bank.code && (
                                                                        <Check size={16} className="text-primary" />
                                                                    )}
                                                                </ListboxOption>
                                                            ))}
                                                        </ListboxOptions>
                                                    </div>
                                                </Listbox>
                                            </div>

                                            {/* Account Number Input */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">{t("bank_account_number")}</label>
                                                <div className="flex items-center gap-4 p-4 rounded-ds-2xl border bg-surface border-primary/50 shadow-inner">
                                                    <CreditCard size={18} className="text-primary" />
                                                    <input
                                                        type="text"
                                                        className="bg-transparent border-none outline-none text-sm font-bold text-txt-primary w-full"
                                                        placeholder="Nhập số tài khoản"
                                                        value={tempPaymentData.bankAccountNumber}
                                                        onChange={(e) => setTempPaymentData({ ...tempPaymentData, bankAccountNumber: e.target.value.replace(/\D/g, "") })}
                                                    />
                                                </div>
                                            </div>

                                            {/* Account Owner Name Input */}
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">{t("bank_account_name")}</label>
                                                <div className={`flex items-center gap-4 p-4 rounded-ds-2xl border transition-all ${isFetchingBankOwner ? 'bg-secondary/40 border-border/50' : 'bg-secondary/10 border-border/30'}`}>
                                                    {isFetchingBankOwner ? (
                                                        <svg className="animate-spin h-[18px] w-[18px] text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <User size={18} className="text-txt-muted" />
                                                    )}
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        className="bg-transparent border-none outline-none text-sm font-bold text-txt-primary w-full uppercase cursor-not-allowed select-none placeholder-txt-muted"
                                                        placeholder={isFetchingBankOwner ? (locale === "vi" ? "ĐANG TRUY VẤN TÊN CHỦ TÀI KHOẢN..." : "QUERYING ACCOUNT OWNER NAME...") : (locale === "vi" ? "TỰ ĐỘNG XÁC THỰC TÊN CHỦ TÀI KHOẢN" : "AUTOMATICALLY RETRIEVED")}
                                                        value={tempPaymentData.bankAccountName}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-txt-muted ml-1">
                                                    {locale === "vi"
                                                        ? "* Tên chủ tài khoản được tự động xác thực dựa trên số tài khoản và ngân hàng đã chọn."
                                                        : "* Account owner name is automatically validated based on the selected bank and account number."}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Coming Soon Security/Settings Tabs */}
                        {(activeTab === "security" || activeTab === "settings") && (
                            <section className="bg-surface/30 border border-border/50 rounded-[2.5rem] p-10 backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 animate-pulse">
                                    {activeTab === "security" ? <ShieldCheck size={28} /> : <Settings size={28} />}
                                </div>
                                <h3 className="text-xl font-black text-txt-primary tracking-tight mb-2 uppercase">
                                    {activeTab === "security" ? t("security") : t("settings")}
                                </h3>
                                <p className="text-sm text-txt-muted max-w-sm text-center">
                                    {locale === "vi"
                                        ? "Tính năng này đang được phát triển và sẽ sớm ra mắt trong phiên bản tiếp theo!"
                                        : "This feature is currently under development and will be available in the next release!"}
                                </p>
                            </section>
                        )}
                    </main>
                </div>
            </div>

            {/* Custom Confirm Delete Payout Modal */}
            {isConfirmDeleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-surface border border-border rounded-[2rem] max-w-md w-full p-8 relative shadow-2xl mx-4 text-center">
                        <button
                            onClick={() => setIsConfirmDeleteOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-secondary text-txt-secondary transition-all cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <X size={32} className="text-red-500 animate-pulse" />
                        </div>

                        <h3 className="text-xl font-black text-txt-primary tracking-tight">
                            {locale === "vi" ? "Xác Nhận Xóa Liên Kết" : "Confirm Payout Deletion"}
                        </h3>
                        <p className="text-sm text-txt-secondary mt-3 leading-relaxed">
                            {locale === "vi"
                                ? "Bạn có chắc chắn muốn xóa liên kết tài khoản ngân hàng nhận tiền này không? Hành động này sẽ gỡ bỏ phương thức thanh toán hiện tại của bạn."
                                : "Are you sure you want to delete this payout bank account connection? This will completely clear your active payout details."}
                        </p>

                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={() => setIsConfirmDeleteOpen(false)}
                                className="flex-1 py-3 bg-secondary text-txt-secondary border border-border rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer hover:text-txt-primary"
                            >
                                {locale === "vi" ? "Hủy" : "Cancel"}
                            </button>
                            <button
                                onClick={executeDeletePayment}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 cursor-pointer flex items-center justify-center gap-2"
                            >
                                {locale === "vi" ? "Xác nhận" : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
