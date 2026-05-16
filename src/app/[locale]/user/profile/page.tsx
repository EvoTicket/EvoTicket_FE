"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
    User, Mail, Phone, Calendar, Shield, Edit3,
    Save, X, Camera, ChevronRight, BadgeCheck, Clock,
    Settings, ShieldCheck, CreditCard
} from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
    const t = useTranslations("Profile");
    const [isEditing, setIsEditing] = useState(false);

    // Mock data from API response provided by USER
    const [userData, setUserData] = useState({
        id: 2,
        email: "tuanphong171104@gmail.com",
        firstName: "Tuấn Phong",
        lastName: "Nguyễn",
        avatarUrl: "https://toplist.vn/images/800px/cua-106572.jpg",
        phoneNumber: "0912345678",
        createdAt: "2026-04-19T23:11:34.794238",
        roles: ["USER", "ORGANIZER"]
    });

    const [tempData, setTempData] = useState({ ...userData });

    const handleSave = () => {
        setUserData({ ...tempData });
        setIsEditing(false);
        // Toast success notification would go here
    };

    const handleCancel = () => {
        setTempData({ ...userData });
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header / Banner Area */}
            <div className="relative h-48 w-full  overflow-hidden">
                <div className="absolute inset-0 backdrop-blur-[100px]"></div>
                <div className="absolute -bottom-16 left-0 right-0 h-64 bg-gradient-to-t from-background to-transparent"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Profile Card */}
                    <aside className="lg:w-1/3 space-y-6">
                        <div className="bg-surface/30 border border-border/50 rounded-[2.5rem] p-8 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all"></div>

                            <div className="flex flex-col items-center text-center relative">
                                <div className="relative group/avatar mb-6">
                                    <div className="w-32 h-32 rounded-full border-4 border-primary/20 overflow-hidden shadow-2xl relative">
                                        <Image
                                            src={userData.avatarUrl}
                                            alt="Avatar"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    {isEditing && (
                                        <button className="absolute bottom-0 right-0 bg-primary p-2.5 rounded-full text-white shadow-lg hover:scale-110 transition-all border-4 border-background">
                                            <Camera size={18} />
                                        </button>
                                    )}
                                </div>

                                <h2 className="text-2xl font-black text-txt-primary tracking-tight mb-2">
                                    {userData.lastName} {userData.firstName}
                                </h2>
                                <p className="text-sm text-txt-muted mb-6 flex items-center gap-2">
                                    <Mail size={14} className="text-primary" /> {userData.email}
                                </p>

                                <div className="flex flex-wrap justify-center gap-2 mb-8">
                                    {userData.roles.map(role => (
                                        <span key={role} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                                            <Shield size={10} /> {role}
                                        </span>
                                    ))}
                                </div>

                                <div className="w-full pt-6 border-t border-border/30 grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-1">{t("created_at")}</p>
                                        <p className="text-xs font-bold text-txt-primary">19/04/2026</p>
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
                        {/* <nav className="bg-surface/30 border border-border/50 rounded-ds-3xl p-4 backdrop-blur-md shadow-xl overflow-hidden">
                            {[
                                { icon: User, label: t("personal_info"), active: true },
                                { icon: CreditCard, label: "Payment Methods", active: false },
                                { icon: ShieldCheck, label: "Security", active: false },
                                { icon: Settings, label: "Settings", active: false }
                            ].map((item, i) => (
                                <button
                                    key={i}
                                    className={`w-full flex items-center justify-between p-4 rounded-ds-2xl transition-all group ${item.active ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/30 text-txt-muted hover:text-txt-primary'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <item.icon size={18} />
                                        <span className="text-sm font-bold">{item.label}</span>
                                    </div>
                                    <ChevronRight size={16} className={`transition-transform ${item.active ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                                </button>
                            ))}
                        </nav> */}
                    </aside>

                    {/* Right Column: Main Content */}
                    <main className="flex-1 space-y-8">
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
                                            onClick={handleCancel}
                                            className="px-5 py-2.5 bg-secondary/50 text-txt-muted border border-border/50 rounded-ds-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:text-txt-primary transition-all"
                                        >
                                            <X size={16} /> {t("cancel")}
                                        </button>
                                        <button
                                            onClick={handleSave}
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

                                {/* Email (Read-only usually) */}
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
                                    <Clock size={20} className="text-primary" /> {t("account_info")}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-6 bg-secondary/10 border border-border/30 rounded-ds-3xl group hover:border-primary/20 transition-all">
                                        <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-2">{t("roles")}</p>
                                        <div className="flex gap-3">
                                            {userData.roles.map(r => (
                                                <div key={r} className="flex items-center gap-2 text-sm font-bold text-txt-primary">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                                    {r}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-6 bg-secondary/10 border border-border/30 rounded-ds-3xl group hover:border-primary/20 transition-all">
                                        <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-2">{t("created_at")}</p>
                                        <div className="flex items-center gap-2 text-sm font-bold text-txt-primary">
                                            <Calendar size={14} className="text-primary" />
                                            {new Date(userData.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}
