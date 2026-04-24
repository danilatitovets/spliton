import Link from "next/link";

import { positionPreviews } from "@/components/dashboard/assets/assets-mock-data";
import { assetsSellUnitsPath } from "@/constants/routes";
import { cn } from "@/lib/utils";

const statusTone: Record<string, string> = {
  Active: "border-blue-200/80 bg-blue-50 text-blue-950",
  "Open round": "border-neutral-200 bg-neutral-50 text-neutral-800",
  Secondary: "border-neutral-200 bg-white text-neutral-800",
  Closed: "border-neutral-200 bg-neutral-50/80 text-neutral-600",
};

const previewRows = positionPreviews.slice(0, 5);

export function TopPositionsCard() {
  return (
    <section
      className="space-y-6 rounded-3xl bg-white px-5 py-6 sm:space-y-8 sm:px-7 sm:py-8"
      aria-label="Топ позиций по holdings"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Holdings · Table</p>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">Топ-позиции</h2>
          <p className="max-w-xl text-sm leading-relaxed text-neutral-500">
            Крупнейшие holdings по релизам внутри кабинета (мок).
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-neutral-50/90 ring-1 ring-neutral-100">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="text-neutral-500">
            <tr className="border-b border-neutral-200/80">
              <th className="px-4 py-3.5 pl-5 text-[10px] font-semibold uppercase tracking-[0.12em]">Релиз</th>
              <th className="px-4 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em]">Артист</th>
              <th className="px-4 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em]">Units</th>
              <th className="px-4 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em]">Статус</th>
              <th className="px-4 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em]">Доля</th>
              <th className="px-4 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em]">Оценка</th>
              <th className="px-4 py-3.5 pr-5 text-[10px] font-semibold uppercase tracking-[0.12em]">Действие</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {previewRows.map((row, i) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-neutral-100 transition-colors hover:bg-neutral-50/80",
                  i === previewRows.length - 1 && "border-b-0",
                )}
              >
                <td className="px-4 py-3.5 pl-5 align-top">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-[10px] font-bold uppercase text-neutral-500 ring-1 ring-neutral-200/80">
                      {row.release.slice(0, 2)}
                    </div>
                    <span className="font-medium text-neutral-900">{row.release}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 align-top text-neutral-600">{row.artist}</td>
                <td className="px-4 py-3.5 align-top font-mono tabular-nums text-neutral-700">{row.units}</td>
                <td className="px-4 py-3.5 align-top">
                  <span
                    className={cn(
                      "inline-flex rounded-lg border px-2 py-1 text-[11px] font-semibold",
                      statusTone[row.status] ?? statusTone.Closed,
                    )}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 align-top font-mono tabular-nums text-neutral-700">{row.share}</td>
                <td className="px-4 py-3.5 align-top font-mono font-semibold tabular-nums text-neutral-900">{row.value}</td>
                <td className="px-4 py-3.5 pr-5 align-top">
                  {row.catalogReleaseId ? (
                    <Link
                      href={assetsSellUnitsPath(row.catalogReleaseId)}
                      className="inline-flex rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-50"
                    >
                      Продать units
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-50"
                    >
                      Открыть релиз
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
