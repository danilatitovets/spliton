export function CatalogPageHero() {
  return (
    <div className="border-b border-white/8 bg-black px-4 py-5 sm:px-5 lg:px-8 lg:py-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
            <span className="rounded-md bg-[#0a0a0a] px-2 py-1 ring-1 ring-white/8">USDT</span>
            <span className="rounded-md bg-[#0a0a0a] px-2 py-1 ring-1 ring-white/8">TRC20</span>
            <span className="text-zinc-600">mock</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">Каталог релизов</h1>
        </div>
      </div>
    </div>
  );
}
