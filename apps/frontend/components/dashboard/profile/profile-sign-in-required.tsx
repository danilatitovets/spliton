"use client";

import Link from "next/link";

import { useI18n } from "@/components/providers/i18n-provider";
import { profilePrimaryButtonClass } from "@/components/dashboard/profile/profile-ui";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function ProfileSignInRequired({
  titleKey = "profile.legal.signInRequired",
  bodyKey,
}: {
  titleKey?: string;
  bodyKey?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl bg-[#111111] px-4 py-6 text-center">
      <p className="text-sm font-medium text-white">{t(titleKey)}</p>
      {bodyKey ? <p className="mt-1 text-sm text-zinc-500">{t(bodyKey)}</p> : null}
      <Link href={ROUTES.login} className={cn(profilePrimaryButtonClass, "mt-4")}>
        {t("auth.login.submit")}
      </Link>
    </div>
  );
}
