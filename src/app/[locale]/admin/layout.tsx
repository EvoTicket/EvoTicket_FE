import { ReactNode } from "react";
import { AdminSidebar } from "@/src/components/admin/AdminSidebar";
import { AdminHeader } from "@/src/components/admin/AdminHeader";
import { RoleGuard } from "@/src/components/RoleGuard";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <RoleGuard requireAdmin>
            <div className="min-h-screen bg-main transition-colors duration-300">
                <AdminSidebar />
                <div className="pl-[280px]">
                    <AdminHeader />
                    <main className="p-8">
                        {children}
                    </main>
                </div>
            </div>
        </RoleGuard>
    );
}
