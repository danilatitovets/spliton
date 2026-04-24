import { recentPayouts } from "@/components/my-assets/overview/mock-data";

export function RecentPayouts() {
  return (
    <section className="rounded-md border border-neutral-200 bg-white">
      <header className="border-b border-neutral-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-neutral-900">Последние начисления</h3>
      </header>
      <div className="divide-y divide-neutral-200">
        {recentPayouts.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm text-neutral-900">{item.release}</p>
              <p className="text-[11px] text-neutral-500">{item.date}</p>
            </div>
            <p className="shrink-0 tabular-nums text-sm font-medium text-neutral-900">{item.amount}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
