"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useAppSelector } from "@/src/store/hooks";

interface RoleGuardProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
    requireOrganizer?: boolean;
    requireChecker?: boolean;
    requireUser?: boolean; // Cờ chặn Admin/Checker khỏi trang User
}

export function RoleGuard({ children, requireAdmin, requireOrganizer, requireChecker, requireUser }: RoleGuardProps) {
    const { user, isAuthenticated, isOrganization } = useAppSelector((state) => state.auth);
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const locale = params?.locale || "vi";
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Nếu chưa đăng nhập, chỉ bắt buộc login nếu yêu cầu Admin, Organizer hoặc Checker
        if (!isAuthenticated) {
            if (requireAdmin || requireOrganizer || requireChecker) {
                const callbackUrl = encodeURIComponent(pathname);
                router.replace(`/${locale}/auth/login?callbackUrl=${callbackUrl}`);
            } else {
                setIsChecking(false);
            }
            return;
        }

        // Kiểm tra quyền Admin
        if (requireAdmin && (!user?.roles || !user.roles.includes("ADMIN"))) {
            router.replace(`/${locale}/user/homepage`);
            return;
        }

        // Kiểm tra quyền Organizer
        if (requireOrganizer && !isOrganization) {
            router.replace(`/${locale}/organizer/register`);
            return;
        }

        // Kiểm tra quyền Checker
        const isChecker = user?.roles?.includes("CHECKER") || user?.roles?.includes("ROLE_CHECKER");
        if (requireChecker && !isChecker) {
            router.replace(`/${locale}/user/homepage`);
            return;
        }

        // Chặn Admin & Checker khỏi trang User
        if (requireUser) {
            const isAdmin = user?.roles?.includes("ADMIN") || user?.roles?.includes("ROLE_ADMIN");
            
            if (isAdmin) {
                router.replace(`/${locale}/admin`);
                return;
            }
            if (isChecker) {
                router.replace(`/${locale}/checker`);
                return;
            }
        }

        setIsChecking(false);
    }, [isAuthenticated, user, isOrganization, requireAdmin, requireOrganizer, requireChecker, requireUser, router, locale, pathname]);

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-page">
                <div className="w-8 h-8 border-4 border-button-primary-bg-default border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return <>{children}</>;
}
