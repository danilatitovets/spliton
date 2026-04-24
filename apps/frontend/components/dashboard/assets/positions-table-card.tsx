import type { PositionPreviewItem } from "@/components/dashboard/assets/assets-mock-data";
import { PositionActionsModal } from "@/components/dashboard/assets/position-actions-modal";

const statusClass: Record<PositionPreviewItem["status"], string> = {
  Active: "border-blue-100 bg-blue-50 text-blue-800",
  "Open round": "border-neutral-200 bg-white text-neutral-800",
  Secondary: "border-neutral-200 bg-neutral-50 text-neutral-800",
  Closed: "border-neutral-200 bg-neutral-100 text-neutral-600",
};

function toNumber(raw: string) {
  return Number(raw.replace(/[^\d.-]/g, ""));
}

function getOwnedUnits(row: PositionPreviewItem): number {
  if (typeof row.heldUnits === "number" && Number.isFinite(row.heldUnits)) return row.heldUnits;
  return Number(row.units.replace(/\s/g, ""));
}

export function PositionsTableCard({ rows }: { rows: PositionPreviewItem[] }) {
  const maxValue = Math.max(...rows.map((row) => toNumber(row.value)), 1);

  return (
    <section className="space-y-5 rounded-3xl bg-white px-5 py-6 sm:space-y-6 sm:px-7 sm:py-8" aria-label="Все позиции">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Positions · Ledger</p>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">Все позиции</h2>
          <p className="text-sm text-neutral-500">Детализированный список holdings по релизам и units.</p>
        </div>
        <span className="shrink-0 text-xs font-medium text-neutral-400">{rows.length} записей</span>
      </div>

      <div className="overflow-x-auto rounded-2xl ring-1 ring-neutral-100">
        <table className="w-full min-w-[1040px] table-fixed border-collapse text-left text-sm">
          <thead className="bg-neutral-50/90 text-[11px] font-medium uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="w-[28%] border-b border-neutral-100 px-3 py-3">Релиз</th>
              <th className="w-[10%] border-b border-neutral-100 px-3 py-3">Units</th>
              <th className="w-[12%] border-b border-neutral-100 px-3 py-3">Статус</th>
              <th className="w-[12%] border-b border-neutral-100 px-3 py-3">Доля</th>
              <th className="w-[14%] border-b border-neutral-100 px-3 py-3">Оценка</th>
              <th className="w-[10%] border-b border-neutral-100 px-3 py-3">Вход</th>
              <th className="w-[18%] min-w-[200px] border-b border-neutral-100 px-3 py-3">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((row) => (
              <tr
                key={row.id}
                id={`position-${row.id}`}
                className="scroll-mt-28 transition-colors hover:bg-neutral-50/80"
              >
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50/90 text-[10px] font-semibold uppercase text-neutral-500 ring-1 ring-neutral-100">
                      {row.release.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-neutral-900">{row.release}</p>
                      <p className="truncate text-xs text-neutral-500">
                        {row.artist} • {row.genre}
                        {row.catalogReleaseId ? ` • ID ${row.catalogReleaseId}` : ""}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <p className="font-mono text-sm font-semibold tabular-nums text-neutral-900">
                    {getOwnedUnits(row).toLocaleString("ru-RU")}
                  </p>
                  <p className="text-xs text-neutral-500">ваши units по позиции</p>
                </td>
                <td className="px-3 py-3.5">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass[row.status]}`}>{row.status}</span>
                </td>
                <td className="px-3 py-3.5">
                  <p className="font-mono text-sm font-semibold tabular-nums text-neutral-900">{row.share}</p>
                  <div className="mt-1.5 h-1.5 max-w-26 overflow-hidden rounded-full bg-neutral-200">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: row.share }} />
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <p className="font-mono text-sm font-semibold tabular-nums text-neutral-900">{row.value}</p>
                  <div className="mt-1.5 h-1.5 max-w-26 overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className="h-full rounded-full bg-blue-700/90"
                      style={{ width: `${Math.round((toNumber(row.value) / maxValue) * 100)}%` }}
                    />
                  </div>
                </td>
                <td className="px-3 py-3.5 text-neutral-700">{row.dateEntered}</td>
                <td className="px-3 py-3.5">
                  <PositionActionsModal row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
