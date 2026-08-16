"use client";

import {
  ProfileOkxLink,
  ProfileOkxRow,
} from "@/components/dashboard/profile/profile-okx";
import { profileLineIcon, type ProfileLineIconName } from "@/components/dashboard/profile/profile-shared";
import { useI18n } from "@/components/providers/i18n-provider";
import type { EligibilityAccessRow } from "@/lib/profile/eligibility-access";

const ACCESS_ICONS: Record<string, ProfileLineIconName> = {
  deposit: "deposit",
  withdraw: "withdraw",
  primary: "id",
  secondary: "secondary",
  payouts: "payouts",
  documents: "documents",
  statements: "statements",
};

function statusTone(status: EligibilityAccessRow["status"]): string {
  switch (status) {
    case "allowed":
      return "text-[#B7F500]";
    case "limited":
    case "kyc_required":
    case "legal_required":
    case "email_required":
      return "text-amber-200";
    default:
      return "text-red-300";
  }
}

export function ProfileEligibilityRows({ rows }: { rows: EligibilityAccessRow[] }) {
  const { t } = useI18n();

  const statusLabel = (status: EligibilityAccessRow["status"]) =>
    t(`verification.eligibility.status.${status}`);

  return (
    <>
      {rows.map((row) => (
        <ProfileOkxRow
          key={row.id}
          icon={profileLineIcon(ACCESS_ICONS[row.id] ?? "verification")}
          title={t(row.labelKey)}
          description={row.message}
          badge={<span className={statusTone(row.status)}>{statusLabel(row.status)}</span>}
          action={
            row.ctaHref && row.ctaLabelKey ? (
              <ProfileOkxLink href={row.ctaHref}>{t(row.ctaLabelKey)}</ProfileOkxLink>
            ) : undefined
          }
        />
      ))}
    </>
  );
}
