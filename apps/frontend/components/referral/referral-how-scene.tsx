"use client";

import Image from "next/image";
import { useMemo } from "react";

import { useI18n } from "@/components/providers/i18n-provider";

const STEP_ICONS = [
  "/images/referral/referral-step-01.png",
  "/images/referral/referral-step-02.png",
  "/images/referral/referral-step-03.png",
  "/images/referral/referral-step-04.png",
] as const;

export function ReferralHowScene() {
  const { t } = useI18n();

  const steps = useMemo(
    () =>
      [
        { id: "invite", title: t("referral.how.step1.title"), text: t("referral.how.step1.text") },
        { id: "register", title: t("referral.how.step2.title"), text: t("referral.how.step2.text") },
        { id: "qualify", title: t("referral.how.step3.title"), text: t("referral.how.step3.text") },
        { id: "reward", title: t("referral.how.step4.title"), text: t("referral.how.step4.text") },
      ] as const,
    [t],
  );

  return (
    <section
      aria-labelledby="referral-how-title"
      className="rounded-2xl bg-black px-5 py-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] sm:rounded-[1.35rem] sm:px-8 sm:py-9"
    >
      <div className="max-w-2xl">
        <h2 id="referral-how-title" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {t("referral.how.title")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400 sm:text-[15px]">{t("referral.how.subtitle")}</p>
      </div>

      <ol className="mt-8 space-y-0 divide-y divide-white/[0.08] border-t border-white/[0.08]">
        {steps.map((item, index) => {
          const icon = STEP_ICONS[index];
          const label = String(index + 1).padStart(2, "0");
          return (
            <li key={item.id} className="grid gap-3 py-6 sm:grid-cols-[5.5rem_1fr] sm:items-start sm:gap-6 sm:py-7">
              <div className="relative size-14 shrink-0 sm:size-[4.5rem]" aria-hidden>
                <Image
                  src={`${icon}?v=1`}
                  alt=""
                  fill
                  sizes="72px"
                  className="object-contain"
                  unoptimized
                />
                <span className="sr-only">{label}</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">{item.title}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">{item.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
