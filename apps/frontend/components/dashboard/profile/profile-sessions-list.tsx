"use client";

import type { SecuritySessionRow } from "@/constants/dashboard/profile-security";
import { ProfileOkxRecommended, profileOkxGhostClass } from "@/components/dashboard/profile/profile-okx";
import { profileLineIcon } from "@/components/dashboard/profile/profile-shared";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

export function ProfileSessionsList({
  sessions,
  onRevoke,
  live = true,
}: {
  sessions: SecuritySessionRow[];
  onRevoke: (id: string) => void;
  live?: boolean;
}) {
  const { t } = useI18n();

  if (sessions.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-[13px] text-zinc-500 sm:px-6">
        {t("profile.security.sessions.empty")}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-white/[0.06]">
      {sessions.map((row) => (
        <li
          key={row.id}
          className="flex items-center gap-3.5 px-5 py-[1.15rem] sm:gap-4 sm:px-6"
        >
          {profileLineIcon("device")}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[15px] font-semibold text-white">{row.device}</p>
              {row.current ? (
                <ProfileOkxRecommended>{t("profile.okx.current")}</ProfileOkxRecommended>
              ) : null}
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
              {[row.ip !== "—" ? row.ip : null, row.lastActive].filter(Boolean).join(" · ")}
            </p>
          </div>
          {!row.current && live ? (
            <button
              type="button"
              onClick={() => onRevoke(row.id)}
              className={cn(profileOkxGhostClass, "text-red-300 hover:bg-red-500/10")}
            >
              {t("profile.security.sessions.revoke")}
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
