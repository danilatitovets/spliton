export function OverviewToolbar() {
  return (
    <section className="mt-4 rounded-md border border-neutral-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {["Активы", "Начисления", "Операции", "Документы"].map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={
                index === 0
                  ? "rounded-sm border border-neutral-300 bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-900"
                  : "rounded-sm border border-transparent px-2.5 py-1 text-[11px] font-medium text-neutral-500 transition hover:border-neutral-200 hover:text-neutral-900"
              }
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="rounded-sm border border-neutral-300 px-2.5 py-1 text-neutral-700">Период: 30D</span>
          <span className="rounded-sm border border-neutral-300 px-2.5 py-1 text-neutral-700">Wallet: USDT</span>
        </div>
      </div>
      <div className="px-4 py-2 text-[11px] text-neutral-500">
        Обзор positions, payouts и activity в формате операционного кабинета.
      </div>
    </section>
  );
}
