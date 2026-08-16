"use client";

import * as React from "react";
import { Minus, Plus } from "@/lib/lucide";

import { useI18n } from "@/components/providers/i18n-provider";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

import { DetailSection } from "./detail-section";

export function ReleaseDetailFaq({ data }: { data: ReleaseDetailPageData }) {
  const { t } = useI18n();
  const [open, setOpen] = React.useState<number | null>(0);

  if (data.faq.length === 0) {
    return null;
  }

  return (
    <DetailSection title={t("analytics.detail.faq.title")}>
      <div className="space-y-2">
        {data.faq.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="overflow-hidden rounded-2xl bg-[#171717]">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-white/[0.03] sm:px-5"
              >
                <span className="text-sm font-semibold tracking-tight text-white">{item.q}</span>
                <span
                  className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white"
                  aria-hidden
                >
                  {isOpen ? (
                    <Minus className="size-3.5" strokeWidth={2.5} />
                  ) : (
                    <Plus className="size-3.5" strokeWidth={2.5} />
                  )}
                </span>
              </button>
              {isOpen ? (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                  <div className="border-l-2 border-[#B7F500] bg-black/35 py-3 pl-3.5 pr-3 sm:pl-4 sm:pr-4">
                    <p
                      className="text-[14px] font-medium leading-[1.65] tracking-normal text-[#e8e8ea]"
                      style={{ color: "#e8e8ea" }}
                    >
                      {item.a}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </DetailSection>
  );
}
