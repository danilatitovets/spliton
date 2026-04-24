import type { ActivityRecord, ActivityStatus } from "@/components/dashboard/assets/activity-mock-data";

const statusStyles: Record<ActivityStatus, string> = {
  Completed: "border-blue-100 bg-blue-50 text-blue-800",
  Pending: "border-neutral-200 bg-white text-neutral-700",
  Processing: "border-neutral-200 bg-white text-neutral-700",
  Cancelled: "border-neutral-200 bg-neutral-50 text-neutral-500",
};

export function ActivityTableCard({
  rows,
  state,
}: {
  rows: ActivityRecord[];
  state: "default" | "empty" | "loading";
}) {
  return (
    <section className="space-y-5 rounded-3xl bg-white px-5 py-6 sm:space-y-6 sm:px-7 sm:py-8" aria-label="История действий">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Activity · Ledger</p>
        <h3 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">История действий</h3>
      </div>

      {state === "loading" ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-neutral-100" />
          ))}
        </div>
      ) : state === "empty" ? (
        <div className="rounded-2xl bg-neutral-50/90 py-10 text-center ring-1 ring-neutral-100">
          <p className="text-base font-semibold text-neutral-900">Пока нет активности</p>
          <p className="mt-1 text-sm text-neutral-500">
            История действий появится после первых пополнений, входа в релизы или операций на secondary market.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl ring-1 ring-neutral-100">
          <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
            <thead className="bg-neutral-50/90 text-[11px] font-medium uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="border-r border-neutral-200 px-3 py-2.5 font-medium">Дата</th>
                <th className="border-r border-neutral-200 px-3 py-2.5 font-medium">Тип действия</th>
                <th className="border-r border-neutral-200 px-3 py-2.5 font-medium">Релиз</th>
                <th className="border-r border-neutral-200 px-3 py-2.5 font-medium">Units</th>
                <th className="border-r border-neutral-200 px-3 py-2.5 font-medium">Сумма</th>
                <th className="border-r border-neutral-200 px-3 py-2.5 font-medium">Статус</th>
                <th className="border-r border-neutral-200 px-3 py-2.5 font-medium">ID операции</th>
                <th className="px-3 py-2.5 font-medium">Детали</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                  <td className="border-r border-neutral-200 px-3 py-2.5 text-neutral-700">{row.date}</td>
                  <td className="border-r border-neutral-200 px-3 py-2.5 text-neutral-900">{row.type}</td>
                  <td className="border-r border-neutral-200 px-3 py-2.5 text-neutral-700">{row.release}</td>
                  <td className="border-r border-neutral-200 px-3 py-2.5 text-neutral-700">{row.units}</td>
                  <td className="border-r border-neutral-200 px-3 py-2.5 font-medium text-neutral-900">{row.amount}</td>
                  <td className="border-r border-neutral-200 px-3 py-2.5">
                    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusStyles[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="border-r border-neutral-200 px-3 py-2.5 font-mono text-[12px] text-neutral-600">{row.txId}</td>
                  <td className="px-3 py-2.5 text-neutral-700">{row.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
