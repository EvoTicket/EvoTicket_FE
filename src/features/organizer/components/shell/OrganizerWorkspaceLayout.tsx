"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/src/store/hooks";
import { OrganizerHeader } from "./OrganizerHeader";
import { OrganizerSidebar } from "./OrganizerSidebar";

type OrganizerWorkspaceLayoutProps = {
  children: ReactNode;
};

export function OrganizerWorkspaceLayout({
  children,
}: OrganizerWorkspaceLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const { token, isAuthenticated, isOrganization, organizationId, user } =
    useAppSelector((state) => state.auth);

  const locale = typeof params.locale === "string" ? params.locale : "vi";
  const hasOrganizerAccess = useMemo(() => {
    const roles = user?.roles ?? [];

    return (
      isOrganization ||
      organizationId > 0 ||
      roles.includes("ORGANIZER") ||
      roles.includes("ROLE_ORGANIZER")
    );
  }, [isOrganization, organizationId, user?.roles]);

  useEffect(() => {
    const queryString = searchParams.toString();
    const callbackUrl = `${pathname}${queryString ? `?${queryString}` : ""}`;

    if (!token || !isAuthenticated) {
      router.replace(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    if (!hasOrganizerAccess) {
      router.replace(`/${locale}/organizer/register`);
    }
  }, [
    token,
    isAuthenticated,
    hasOrganizerAccess,
    locale,
    pathname,
    router,
    searchParams,
  ]);

  if (!token || !isAuthenticated || !hasOrganizerAccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-page text-sm text-text-muted">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  return (
    <div className="h-screen min-h-0 bg-bg-page text-text-primary">
      <OrganizerSidebar />

      <div className="ml-[280px] flex h-screen min-h-0 min-w-0 flex-col">
        <OrganizerHeader />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
