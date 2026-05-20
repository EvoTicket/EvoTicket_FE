"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/src/store/hooks";
import { organizationApi } from "@/src/features/organizer/api/organizationApi";
import type { OrganizationProfileResponse } from "@/src/features/organizer/types/api";
import { OrganizerHeader } from "./OrganizerHeader";
import { OrganizerSidebar } from "./OrganizerSidebar";
import { Home, PencilLine, RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useTranslations } from "next-intl";

type OrganizerWorkspaceLayoutProps = {
  children: ReactNode;
};

type OrganizationLoadState = "idle" | "loading" | "ready" | "pending" | "rejected" | "not-found" | "error";

const ACTIVE_ORGANIZATION_STATUSES = new Set(["VERIFIED", "APPROVED", "ACTIVE"]);

function getOrganizationState(organization: OrganizationProfileResponse): OrganizationLoadState {
  const status = organization.status?.toUpperCase();

  if (status === "PENDING") {
    return "pending";
  }

  if (status === "REJECTED") {
    return "rejected";
  }

  if (status && ACTIVE_ORGANIZATION_STATUSES.has(status)) {
    return "ready";
  }

  return "error";
}

export function OrganizerWorkspaceLayout({
  children,
}: OrganizerWorkspaceLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const { token, isAuthenticated, isOrganization, organizationId, user } =
    useAppSelector((state) => state.auth);
  const [organization, setOrganization] = useState<OrganizationProfileResponse | null>(null);
  const [organizationState, setOrganizationState] = useState<OrganizationLoadState>("idle");
  const t = useTranslations("Organizer.Layout");

  const locale = typeof params.locale === "string" ? params.locale : "vi";

  const organizerRegisterPath = `/${locale}/organizer/register`;
  const organizerRegisterResubmitPath = `/${locale}/organizer/register?mode=resubmit`;
  const userHomepagePath = `/${locale}/user/homepage`;

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

  const loadOrganization = useCallback(async () => {
    if (!token || !isAuthenticated || !hasOrganizerAccess) {
      return;
    }

    setOrganizationState("loading");

    try {
      const currentOrganization = await organizationApi.getMe();
      setOrganization(currentOrganization);
      setOrganizationState(getOrganizationState(currentOrganization));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setOrganizationState("not-found");
        router.replace(`/${locale}/organizer/register`);
        return;
      }

      console.error("Failed to load organizer profile", error);
      setOrganizationState("error");
    }
  }, [hasOrganizerAccess, isAuthenticated, locale, router, token]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void loadOrganization();
    });

    return () => cancelAnimationFrame(frame);
  }, [loadOrganization]);

  const handleRetry = useCallback(() => {
    void loadOrganization();
  }, [loadOrganization]);

  const handleGoHome = useCallback(() => {
    router.push(userHomepagePath);
  }, [router, userHomepagePath]);

  const handleGoRegister = useCallback(() => {
    router.push(organizerRegisterPath);
  }, [router, organizerRegisterPath]);

  const handleGoResubmit = useCallback(() => {
    router.push(organizerRegisterResubmitPath);
  }, [router, organizerRegisterResubmitPath]);

  if (!token || !isAuthenticated || !hasOrganizerAccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-page text-sm text-text-muted">
        {t("checkingAccess")}
      </div>
    );
  }

  if (organizationState === "idle" || organizationState === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-page text-sm text-text-muted">
        {t("loadingProfile")}
      </div>
    );
  }

  if (organizationState === "pending") {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-page px-6 text-text-primary">
        <div className="max-w-xl rounded-ds-lg border border-feedback-warning-border bg-bg-surface p-6 text-center">
          <h1 className="text-xl font-semibold">
            {t("pendingTitle")}
          </h1>

          <p className="mt-2 text-sm text-text-muted">
            {t("pendingDesc1")}{" "}
            {organization?.organizationName
              ? `"${organization.organizationName}"`
              : t("pendingDesc2")}{" "}
            {t("pendingDesc3")}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              type="button"
              variant="primary"
              size="md"
              leftIcon={<RefreshCw />}
              onClick={handleRetry}
            >
              {t("checkStatus")}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="md"
              leftIcon={<Home />}
              onClick={handleGoHome}
            >
              {t("backToHome")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (organizationState === "rejected") {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-page px-6 text-text-primary">
        <div className="max-w-xl rounded-ds-lg border border-feedback-error-border bg-bg-surface p-6 text-center">
          <h1 className="text-xl font-semibold">{t("rejectedTitle")}</h1>

          <p className="mt-2 text-sm text-text-muted">
            {organization?.rejectionReason ||
              t("rejectedDefaultReason")}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              type="button"
              variant="primary"
              size="md"
              leftIcon={<PencilLine />}
              onClick={handleGoResubmit}
            >
              {t("updateProfile")}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="md"
              leftIcon={<Home />}
              onClick={handleGoHome}
            >
              {t("backToHome")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (organizationState === "error" || organizationState === "not-found") {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-page px-6 text-text-primary">
        <div className="max-w-xl rounded-ds-lg border border-border-default bg-bg-surface p-6 text-center">
          <h1 className="text-xl font-semibold">
            {t("errorTitle")}
          </h1>

          <p className="mt-2 text-sm text-text-muted">
            {organizationState === "not-found"
              ? t("notFoundDesc")
              : t("errorDesc")}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {organizationState === "not-found" ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                leftIcon={<PencilLine />}
                onClick={handleGoRegister}
              >
                {t("registerOrg")}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                leftIcon={<RefreshCw />}
                onClick={handleRetry}
              >
                {t("retry")}
              </Button>
            )}

            <Button
              type="button"
              variant="secondary"
              size="md"
              leftIcon={<Home />}
              onClick={handleGoHome}
            >
              {t("backToHome")}
            </Button>
          </div>
        </div>
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
