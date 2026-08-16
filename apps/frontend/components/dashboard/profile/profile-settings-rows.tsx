"use client";

import type { ReactNode } from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { profileOkxGhostClass } from "@/components/dashboard/profile/profile-okx";
import { profileListClass } from "@/components/dashboard/profile/profile-ui";

export const profileSettingsListClass = profileListClass;

export function ProfileSettingsList({ children }: { children: ReactNode }) {
  return <ul className={profileSettingsListClass}>{children}</ul>;
}

export function ProfileSettingsToggleRow({
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <li className="flex items-start justify-between gap-4 px-5 py-[1.15rem] sm:px-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          checked ? "bg-[#B7F500]" : "bg-white/15",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-6 rounded-full bg-black shadow transition-transform",
            checked && "translate-x-5",
          )}
        />
      </button>
    </li>
  );
}

export function ProfileSettingsEditableRow({
  label,
  hint,
  displayValue,
  onEdit,
}: {
  label: string;
  hint?: string;
  displayValue: ReactNode;
  onEdit: () => void;
}) {
  const { t } = useI18n();

  return (
    <li className="flex flex-col gap-3 px-5 py-[1.15rem] sm:flex-row sm:items-start sm:justify-between sm:px-6">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">{label}</p>
        {hint ? <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{hint}</p> : null}
        <p className="mt-1.5 text-sm text-zinc-300">{displayValue}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
        <button
          type="button"
          onClick={onEdit}
          className={profileOkxGhostClass}
          aria-label={t("profile.settings.editAria").replace("{label}", label)}
        >
          {t("profile.okx.change")}
        </button>
      </div>
    </li>
  );
}
