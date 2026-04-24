import Link from "next/link";

import { recentActivity } from "@/components/dashboard/assets/assets-mock-data";
import { ROUTES } from "@/constants/routes";

export function RecentActivityCard({ preview = false }: { preview?: boolean }) {
  const items = preview ? recentActivity.slice(0, 5) : recentActivity;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-neutral-900">Последняя активность</h3>
        {preview ? (
          <Link
            href={ROUTES.dashboardActivity}
            className="text-xs font-medium uppercase tracking-wide text-neutral-500 transition hover:text-neutral-900"
          >
            Смотреть всю активность
          </Link>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">Активности пока нет</p>
      ) : (
        <div className="mt-4 divide-y divide-neutral-200">
          {items.map((item) => (
            <article key={item.id} className="grid grid-cols-[1.2fr_1fr_auto] gap-3 py-2.5 text-sm">
              <div>
                <p className="text-neutral-900">{item.type}</p>
                <p className="text-xs text-neutral-500">{item.detail}</p>
              </div>
              <p className="text-neutral-600">{item.date}</p>
              <p className="font-medium text-neutral-900">{item.amount}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
