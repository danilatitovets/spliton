"use client";

import { useMemo, useState } from "react";

import { profileLineIcon } from "@/components/dashboard/profile/profile-shared";
import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { ROUTES } from "@/constants/routes";
import {
  formatSecurityEventIp,
  formatSecurityEventWhen,
  parseUserAgentShort,
  securityEventHint,
  securityEventLabel,
  securityEventTone,
} from "@/lib/profile/security-labels";
import type { SecurityEventItem } from "@/services/user-me.service";
import { cn } from "@/lib/utils";

const NOISE_ACTIONS = new Set(["REFRESH_SUCCESS"]);
const PREVIEW_COUNT = 3;
const EXPANDED_COUNT = 12;

function orderedEvents(events: SecurityEventItem[]): SecurityEventItem[] {
  const meaningful = events.filter((ev) => !NOISE_ACTIONS.has(ev.action.trim().toUpperCase()));
  if (meaningful.length > 0) return meaningful;
  return events;
}

function toneDotClass(tone: ReturnType<typeof securityEventTone>): string {
  switch (tone) {
    case "ok":
      return "bg-[#B7F500]";
    case "warn":
      return "bg-amber-400";
    case "danger":
      return "bg-red-400";
    default:
      return "bg-zinc-500";
  }
}

export function ProfileSecurityEventsList({
  events,
  timeZone,
}: {
  events: SecurityEventItem[];
  timeZone?: string | null;
}) {
  const { locale, t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const all = useMemo(() => orderedEvents(events), [events]);
  const canExpand = all.length > PREVIEW_COUNT;
  const visible = expanded ? all.slice(0, EXPANDED_COUNT) : all.slice(0, PREVIEW_COUNT);

  if (all.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-[13px] text-zinc-500 sm:px-6">
        {t("profile.security.events.empty")}
      </p>
    );
  }

  return (
    <>
      {visible.map((ev) => {
          const tone = securityEventTone(ev.action);
          const hint = securityEventHint(ev.action, locale);
          const ip = formatSecurityEventIp(ev.ip, locale);
          const device = parseUserAgentShort(ev.userAgent, locale);
          const when = formatSecurityEventWhen(ev.createdAt, locale, timeZone);
          const meta = [when, ip, device !== t("profile.security.events.deviceUnknown") ? device : null]
            .filter(Boolean)
            .join(" · ");

          return (
            <div
              key={ev.id}
              className="flex items-start gap-3.5 px-5 py-[1.15rem] sm:gap-4 sm:px-6"
            >
              {profileLineIcon("alert")}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn("size-1.5 shrink-0 rounded-full", toneDotClass(tone))}
                    aria-hidden
                  />
                  <p className="text-[15px] font-semibold text-white">
                    {securityEventLabel(ev.action, locale)}
                  </p>
                </div>
                {hint ? (
                  <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">{hint}</p>
                ) : null}
                <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">{meta}</p>
              </div>
            </div>
          );
        })}

      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
        {canExpand ? (
          <SplitonCtaPill
            type="button"
            tone="onDark"
            variant="ghost"
            withArrow={false}
            className="w-full sm:w-auto sm:min-w-[10.5rem]"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? t("profile.security.events.showLess") : t("profile.security.events.showMore")}
          </SplitonCtaPill>
        ) : (
          <span className="hidden sm:block" />
        )}
        <SplitonCtaPill
          href={ROUTES.dashboardActivity}
          tone="onDark"
          className="w-full min-w-0 sm:w-auto sm:min-w-[14rem]"
        >
          {t("profile.security.events.viewHistory")}
        </SplitonCtaPill>
      </div>
    </>
  );
}