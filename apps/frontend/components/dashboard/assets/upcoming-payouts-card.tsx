import Link from "next/link";

import { upcomingDistributions } from "@/components/dashboard/assets/assets-mock-data";
import { ROUTES } from "@/constants/routes";

export function UpcomingPayoutsCard({ preview = false }: { preview?: boolean }) {
  const items = preview ? upcomingDistributions.slice(0, 5) : upcomingDistributions;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-neutral-900">Последние выплаты</h3>
        {preview ? (
          <Link
            href={ROUTES.dashboardPayouts}
            className="text-xs font-medium uppercase tracking-wide text-neutral-500 transition hover:text-neutral-900"
          >
            Открыть все выплаты
          </Link>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">Выплаты появятся после первых начислений</p>
      ) : (
        <div className="mt-4 divide-y divide-neutral-200">
          {items.map((item) => (
            <article key={item.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div>
                <p className="text-neutral-900">{item.release}</p>
                <p className="text-xs text-neutral-500">Distribution: {item.eta}</p>
              </div>
              <p className="font-medium text-neutral-900">{item.amount}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
