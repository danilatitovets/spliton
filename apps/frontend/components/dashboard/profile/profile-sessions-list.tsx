"use client";

import type { ReactNode } from "react";

import type { SecuritySessionRow } from "@/constants/dashboard/profile-security";
import { profileOkxGhostClass } from "@/components/dashboard/profile/profile-okx";
import { useI18n } from "@/components/providers/i18n-provider";
import { isEmptyDisplayValue } from "@/lib/analytics/display-value";
import { sessionDeviceKind } from "@/lib/profile/user-sessions";
import { cn } from "@/lib/utils";

export function ProfileSessionGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-zinc-500">{title}</h2>
      <div className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl bg-[#1c1c1c]">{children}</div>
    </section>
  );
}

function sessionSubtitle(row: SecuritySessionRow, onlineLabel: string): string {
  const status = row.current ? onlineLabel : row.lastActive;
  if (!isEmptyDisplayValue(row.location)) return `${row.location} – ${status}`;
  return status;
}

function SessionDeviceIcon({ device }: { device: string }) {
  const kind = sessionDeviceKind(device);
  return (
    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/[0.08] text-white" aria-hidden>
      {kind === "phone" ? (
        <svg viewBox="0 0 24 24" fill="none" className="size-[22px]">
          <rect x="7.25" y="3.25" width="9.5" height="17.5" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10.5 18.75h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="size-[22px]">
          <rect x="4.25" y="5.25" width="15.5" height="10.5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3 17.75h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M8.5 20.25h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

export function ProfileSessionsList({
  sessions,
  onRevoke,
  live = true,
  showIp = false,
  emptyLabel,
}: {
  sessions: SecuritySessionRow[];
  onRevoke: (id: string) => void;
  live?: boolean;
  showIp?: boolean;
  emptyLabel?: string;
}) {
  const { t } = useI18n();

  if (sessions.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-[13px] text-zinc-500 sm:px-6">
        {emptyLabel ?? t("profile.security.sessions.empty")}
      </p>
    );
  }

  const onlineLabel = t("profile.security.sessions.online");
  const thisDeviceLabel = t("profile.security.sessions.thisDevice");

  return (
    <>
      {sessions.map((row) => {
        const subtitle = sessionSubtitle(row, onlineLabel);
        const ipLine =
          showIp && !isEmptyDisplayValue(row.ip) && row.ip !== thisDeviceLabel ? row.ip : null;
        return (
          <div key={row.id} className="flex items-center gap-3.5 px-4 py-3.5 sm:gap-4 sm:px-5">
            <SessionDeviceIcon device={row.device} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-white">{row.device}</p>
              <p className="mt-0.5 truncate text-[13px] leading-relaxed text-zinc-500">{subtitle}</p>
              {ipLine ? (
                <p className="mt-0.5 truncate text-[12px] text-zinc-600">{ipLine}</p>
              ) : null}
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
          </div>
        );
      })}
    </>
  );
}
