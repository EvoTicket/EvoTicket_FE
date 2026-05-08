"use client";

import { Plus, Search, Bell } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export function OrganizerHeader() {
    const { locale } = useParams();

    return (
        <header className="bg-bg-page border-b border-border-default px-8 py-4 flex items-center justify-between sticky top-0 z-10">
            {/* Left side: Breadcrumb & Search */}
            <div className="flex items-center gap-8 flex-1">
                <div className="text-sm font-medium text-text-secondary">
                    Workspace <span className="mx-2 text-text-muted">/</span> <span className="text-text-primary">Evo Entertainment JSC</span>
                </div>
                
                {/* Search Bar */}
                <div className="relative max-w-md w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={16} className="text-text-muted" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Tìm nhanh sự kiện, đơn hàng..." 
                        className="block w-full pl-10 pr-4 py-2 bg-bg-surface border border-border-default rounded-full text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                    />
                </div>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-4">
                <Link href={`/${locale}/organizer/events/create`} className="flex items-center gap-2 bg-button-primary-bg-defaul hover:bg-button-primary-bg-defaul-hover text-button-primary-text-default px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm">
                    <Plus size={16} />
                    Tạo sự kiện
                </Link>
                
                <button className="p-2 rounded-full hover:bg-bg-surface border border-border-default transition-colors text-text-secondary relative">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-feedback-error-text rounded-full border-2 border-bg-page"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-border-default cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
                        HN
                    </div>
                    <div className="hidden md:block">
                        <div className="text-sm font-bold text-text-primary">Hoài Nam</div>
                        <div className="text-xs text-text-muted">Organizer admin</div>
                    </div>
                </div>
            </div>
        </header>
    );
}

