"use client";

import { ProfileOkxDetails } from "@/components/dashboard/profile/profile-okx";
import {
  ProfileSessionGroup,
  ProfileSessionsList,
} from "@/components/dashboard/profile/profile-sessions-list";
import { PROFILE_GLASS, ProfileGlassIcon } from "@/components/dashboard/profile/profile-shared";
import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";
import type { SecuritySessionRow } from "@/constants/dashboard/profile-security";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";

export function ProfileSessionsPanel({
  sessions,
  error,
  live,
  onRevoke,
  onLogoutOthers,
}: {
  sessions: SecuritySessionRow[];
  error?: string | null;
  live: boolean;
  onRevoke: (id: string) => void;
  onLogoutOthers: () => void;
}) {
  const { t } = useI18n();
  const current = sessions.filter((row) => row.current);
  const others = sessions.filter((row) => !row.current);

  return (
    <div className="space-y-6">
      <section className="px-2 py-6 text-center sm:px-4 sm:py-8">
        <div className="mx-auto flex justify-center">
          <ProfileGlassIcon src={PROFILE_GLASS.device} size="xl" />
        </div>
        <p className="mx-auto mt-6 max-w-[42ch] text-[14px] leading-relaxed text-zinc-400">
          {t("profile.security.sessions.intro")}
        </p>
        <div className="mx-auto mt-6 max-w-[22rem]">
          <SplitonCtaPill href={ROUTES.dashboardProfileDevices} tone="onDark" className="w-full">
            {t("profile.devices.openPage")}
          </SplitonCtaPill>
        </div>
      </section>

      {error ? (
        <p className="px-1 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}

      {current.length > 0 ? (
        <ProfileSessionGroup title={t("profile.security.sessions.thisDevice")}>
          <ProfileSessionsList sessions={current} onRevoke={onRevoke} live={live} />
        </ProfileSessionGroup>
      ) : null}

      {others.length > 0 ? (
        <ProfileSessionGroup title={t("profile.security.sessions.otherDevices")}>
          <ProfileSessionsList sessions={others} onRevoke={onRevoke} live={live} />
        </ProfileSessionGroup>
      ) : sessions.length === 0 ? (
        <p className="rounded-2xl bg-[#1c1c1c] px-5 py-10 text-center text-[14px] text-zinc-500">
          {t("profile.security.sessions.empty")}
        </p>
      ) : null}

      <p className="px-1 text-[13px] leading-relaxed text-zinc-500">
        {t("profile.security.sessions.help")}{" "}
        <ProfileOkxDetails href={ROUTES.dashboardSupport}>{t("profile.okx.details")}</ProfileOkxDetails>
      </p>

      {live && others.length > 0 ? (
        <button
          type="button"
          onClick={onLogoutOthers}
          className="px-1 text-[13px] font-medium text-zinc-400 underline-offset-[5px] transition hover:text-white hover:underline"
        >
          {t("profile.security.revokeAll")}
        </button>
      ) : null}
    </div>
  );
}
