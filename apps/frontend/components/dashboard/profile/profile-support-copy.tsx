"use client";

import Link from "next/link";

import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";
import { messageForApiError } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

const supportLinkClass = "font-medium text-white underline underline-offset-2";

export function ProfileSupportLink({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Link href={ROUTES.dashboardSupport} className={cn(supportLinkClass, className)}>
      {t("profile.devices.alertSupport")}
    </Link>
  );
}

export function ProfileErrorWithSupport({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <span className={className}>
      {t("profile.devices.errorPrefix")} <ProfileSupportLink />.
    </span>
  );
}

export function ProfileApiOrGenericError({ message }: { message: string }) {
  const { locale } = useI18n();
  if (message === messageForApiError("INTERNAL_ERROR", locale)) {
    return <ProfileErrorWithSupport />;
  }
  return <>{message}</>;
}
