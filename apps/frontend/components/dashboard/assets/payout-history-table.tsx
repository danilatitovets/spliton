"use client";

import {
  payoutHistoryStatusLabel,
  payoutHistoryTypeLabel,
} from "@/components/dashboard/assets/payout-history-labels";
import { assetsMutedCardClass } from "@/components/dashboard/assets/assets-ui";
import { payoutHistory, type PayoutHistoryRow } from "@/components/dashboard/assets/payouts-mock-data";
import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const statusTone: Record<PayoutHistoryRow["status"], string> = {
  accrued: "bg-neutral-100 text-neutral-800",
  available: "bg-[#B7F500]/25 text-neutral-900",
  processing: "bg-amber-50 text-amber-900",
  paid: "bg-neutral-900 text-white",
  completed: "bg-neutral-100 text-neutral-700",
};

function cleanAmount(amount: string): string {
  return amount.replace(/\s*USDT\s*/gi, "").trim();
}

export type PayoutHistoryTableProps = {
  rows?: PayoutHistoryRow[];
  showCaption?: boolean;
};

export function PayoutHistoryTable({ rows = payoutHistory, showCaption = true }: PayoutHistoryTableProps) {
  const { t } = useI18n();
  const dateCol = t("history.table.colDateRef").replace(/\s*[·•.].*$/u, "").trim();

  if (rows.length === 0) {
    return (
      <section className={cn(assetsMutedCardClass, "py-10 text-center sm:py-12")}>
        <h2 className="text-base font-semibold tracking-tight text-neutral-900">{t("history.table.emptyTitle")}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500">{t("history.table.emptyBody")}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <SplitonCtaPill href={ROUTES.dashboardCatalog} tone="onLight" variant="accent">
            {t("history.table.openCatalog")}
          </SplitonCtaPill>
          <SplitonCtaPill href={ROUTES.dashboardPositions} tone="onLight" variant="ghost" withArrow={false}>
            {t("history.table.myPositions")}
          </SplitonCtaPill>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(assetsMutedCardClass, "overflow-hidden px-0 py-0 sm:px-0 sm:py-0")}
      aria-label={t("history.table.title")}
    >
      {showCaption ? (
        <div className="flex items-end justify-between gap-3 border-b border-neutral-200/70 px-4 py-4 sm:px-5">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">{t("history.table.title")}</h2>
          <span className="font-mono text-xs text-neutral-400">{rows.length}</span>
        </div>
      ) : null}

      <ul className="divide-y divide-neutral-200/70 md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900">{row.release}</p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {row.date}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">{payoutHistoryTypeLabel(row.type, t)}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-sm font-semibold tabular-nums text-neutral-900">
                {cleanAmount(row.amount)}
                <span className="ml-1 text-[11px] font-medium text-neutral-400">USDT</span>
              </p>
              <p className="mt-1">
                <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold", statusTone[row.status])}>
                  {payoutHistoryStatusLabel(row.status, t)}
                </span>
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200/70 text-[11px] font-medium text-neutral-500">
              <th className="px-4 py-3.5 pl-5 font-medium sm:px-5">{dateCol}</th>
              <th className="px-3 py-3.5 font-medium">{t("history.table.colRelease")}</th>
              <th className="px-3 py-3.5 font-medium">{t("history.table.colType")}</th>
              <th className="px-3 py-3.5 font-medium">{t("history.table.colAmount")}</th>
              <th className="px-3 py-3.5 pr-5 font-medium">{t("history.table.colStatus")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                className={cn(
                  "transition-colors hover:bg-white/70",
                  i !== rows.length - 1 && "border-b border-neutral-200/60",
                )}
              >
                <td className="whitespace-nowrap px-4 py-3.5 pl-5 text-neutral-700 sm:px-5">{row.date}</td>
                <td className="px-3 py-3.5 font-medium text-neutral-900">{row.release}</td>
                <td className="px-3 py-3.5 text-neutral-600">{payoutHistoryTypeLabel(row.type, t)}</td>
                <td className="whitespace-nowrap px-3 py-3.5 font-mono text-sm font-semibold tabular-nums text-neutral-900">
                  {cleanAmount(row.amount)}
                  <span className="ml-1 text-[11px] font-medium text-neutral-400">USDT</span>
                </td>
                <td className="px-3 py-3.5 pr-5">
                  <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold", statusTone[row.status])}>
                    {payoutHistoryStatusLabel(row.status, t)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
