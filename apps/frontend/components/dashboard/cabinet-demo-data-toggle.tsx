"use client";

import { useCabinetDemoToggle } from "@/hooks/use-cabinet-demo-preview";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

/** Compact header control: Demo / Live for eligible accounts. */
export function CabinetDemoDataToggle({ className }: { className?: string }) {
  const { t } = useI18n();
  const { eligible, enabled, setEnabled } = useCabinetDemoToggle();

  if (!eligible) return null;

  return (
    <div
      className={cn(
        "inline-flex h-9 items-center rounded-lg bg-white/8 p-0.5",
        className,
      )}
      role="group"
      aria-label={t("navigation.header.demoToggleAria")}
    >
      <button
        type="button"
        aria-pressed={enabled}
        onClick={() => setEnabled(true)}
        className={cn(
          "h-8 rounded-md px-2.5 text-[11px] font-semibold tracking-wide transition",
          enabled ? "bg-white text-black" : "text-white/70 hover:text-white",
        )}
      >
        {t("navigation.header.demoOn")}
      </button>
      <button
        type="button"
        aria-pressed={!enabled}
        onClick={() => setEnabled(false)}
        className={cn(
          "h-8 rounded-md px-2.5 text-[11px] font-semibold tracking-wide transition",
          !enabled ? "bg-white text-black" : "text-white/70 hover:text-white",
        )}
      >
        {t("navigation.header.demoOff")}
      </button>
    </div>
  );
}
