import { ReactNode } from "react";
import { AdminSidebar } from "@/src/components/admin/AdminSidebar";
import { AdminHeader } from "@/src/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-main transition-colors duration-300">
            <AdminSidebar />
            <div className="pl-[280px]">
                <AdminHeader />
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
