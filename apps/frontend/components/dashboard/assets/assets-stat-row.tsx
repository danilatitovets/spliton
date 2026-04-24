import { assetsStats } from "@/components/dashboard/assets/assets-mock-data";

export function AssetsStatRow() {
  return (
    <section aria-label="Ключевые показатели">
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {assetsStats.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl bg-neutral-50/90 px-4 py-4 ring-1 ring-neutral-100 sm:px-5 sm:py-5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">{item.label}</p>
            <p className="mt-2 font-mono text-lg font-semibold tabular-nums tracking-tight text-neutral-900 sm:text-xl">
              {item.value}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
