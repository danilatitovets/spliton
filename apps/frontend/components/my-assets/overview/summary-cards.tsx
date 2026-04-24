import { summaryMetrics } from "@/components/my-assets/overview/mock-data";

export function SummaryCards() {
  return (
    <section className="py-4">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {summaryMetrics.map((item) => (
          <article
            key={item.label}
            className="relative overflow-hidden rounded-md border border-neutral-200 bg-white p-4"
          >
            <span className="absolute inset-x-0 top-0 h-px bg-lime-500/45" aria-hidden />
            <p className="text-[10px] font-semibold uppercase tracking-[0.11em] text-neutral-500">{item.label}</p>
            <p className="mt-2.5 tabular-nums text-[1.5rem] font-semibold tracking-tight text-neutral-900">{item.value}</p>
            <p className="mt-2 text-xs leading-relaxed text-neutral-500">{item.helper}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
